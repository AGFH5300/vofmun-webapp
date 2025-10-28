"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Reso, Delegate, Chair, shortenedDel } from "@/db/types";
import { useSession } from "../context/sessionContext";
import { Editor } from "@tiptap/react";
import { SimpleEditor } from "../../components/tiptap-templates/simple/simple-editor";
import { ParticipantRoute } from "@/components/protectedroute";
import { toast } from "sonner";
import role from "@/lib/roles";
import supabase from "@/lib/supabase";
import { motion } from "framer-motion";

// this page assumes that delegates can only post 1 reso, might be changed later

const Page = () => {
  const { user: currentUser, login } = useSession();
  const userRole = role(currentUser);
  const editorRef = React.useRef<Editor | null>(null);
  const [fetchedResos, setFetchedResos] = useState<Reso[]>([]);
  const [selectedReso, setSelectedReso] = useState<Reso | null>(null);
  const [delegates, setDelegates] = useState<shortenedDel[]>([]);
  const [title, setTitle] = useState<string>("");
  const isDelegateUser = userRole === "delegate" && currentUser !== null;

  useEffect(() => {
    if (selectedReso) {
      setTitle(selectedReso.title || "");
    } else {
      setTitle("");
    }
  }, [selectedReso]);

  const logBackIn = useCallback(async () => {
    if (!currentUser) {
      toast.error("No user logged in");
      return null;
    }

    if (userRole === "delegate") {
      const { data: newPerms, error: permsError } = await supabase
        .from("Delegate")
        .select("resoPerms")
        .eq("delegateID", (currentUser as Delegate).delegateID)
        .single();
      if (permsError) {
        console.error("Failed to fetch delegate permissions:", permsError);
        toast.error("Failed to fetch delegate permissions");
        return null;
      }

      const delegateUser = currentUser as Delegate;
      const enrichedUser: Delegate = {
        ...delegateUser,
        resoPerms: newPerms.resoPerms || {
          "view:ownreso": false,
          "view:allreso": false,
          "update:ownreso": false,
          "update:reso": [],
        },
      };
      if (JSON.stringify(delegateUser.resoPerms) !== JSON.stringify(enrichedUser.resoPerms)) {
        login(enrichedUser);
      }
      return enrichedUser;
    }
    return currentUser;
  }, [currentUser, userRole, login]);

  useEffect(() => {
    const fetchDels = async () => {
      if (!currentUser) return;

      const res = await fetch(`/api/delegates?committeeID=${(currentUser as Chair).committee.committeeID}`);
      const data = await res.json();
      setDelegates(data);
    };

    if (currentUser && "chairID" in currentUser) {
      fetchDels();
    }
  }, [currentUser]);

  useEffect(() => {
    logBackIn();
  }, [logBackIn]);

  useEffect(() => {
    const fetchResos = async () => {
      if (!currentUser) return;

      let endpoint = "/api/resos";
      if (role(currentUser) === "delegate" && currentUser !== null) {
        const delegateUser = currentUser as Delegate;
        if (!delegateUser.resoPerms["view:allreso"]) {
          endpoint += `/delegate?delegateID=${delegateUser.delegateID}`;
        } else {
          endpoint += `/chair?committeeID=${delegateUser.committee.committeeID}`;
        }
      } else if (role(currentUser) === "chair") {
        const chairUser = currentUser as Chair;
        endpoint += `/chair?committeeID=${chairUser.committee.committeeID}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      setFetchedResos(data);

      if (selectedReso) {
        const updatedSelectedReso = data.find((reso: Reso) => reso.resoID === selectedReso.resoID);
        if (updatedSelectedReso) {
          setTitle(updatedSelectedReso.title || "");
        }
      }
    };

    fetchResos();
  }, [currentUser, selectedReso]);

  const postReso = async () => {
    const updatedUser = await logBackIn();
    if (!updatedUser) return;

    const isDelegateUser = role(updatedUser) === "delegate" && updatedUser !== null;

    if (!editorRef.current) {
      toast.error("Editor not initialized");
      return;
    }

    if (editorRef.current.getText().length === 0) {
      toast.error("Resolution length invalid");
      return;
    }

    if (!isDelegateUser && !selectedReso) {
      toast.error("Only delegates can post resolutions.");
      return;
    }

    if (isDelegateUser) {
      const delegateUser = updatedUser as Delegate;
      if (!delegateUser.resoPerms["update:ownreso"] && selectedReso?.delegateID === delegateUser.delegateID) {
        toast.error("You do not have permission to post resolutions.");
        return;
      }
      if (
        selectedReso &&
        (selectedReso?.delegateID !== delegateUser.delegateID &&
          !(delegateUser.resoPerms["update:reso"]?.includes(selectedReso.resoID)))
      ) {
        toast.error("You can only update your own resolutions.");
        return;
      }
    }

    const content = editorRef.current.getJSON();

    if (!title.trim()) {
      toast.error("Please enter a resolution title");
      return;
    }

    const delegateUser = updatedUser as Delegate;
    const ownResos = fetchedResos.filter((reso) => reso.delegateID === delegateUser.delegateID);
    if (ownResos.length >= 1 && !selectedReso) {
      toast.error("You can only post one resolution as a delegate.");
      return;
    }

    let delegateID = "0000";
    let committeeID = "0000";

    if (isDelegateUser) {
      const delegateUser = updatedUser as Delegate;
      delegateID = delegateUser.delegateID;
      committeeID = delegateUser.committee.committeeID;
    }

    const res = await fetch("/api/resos/delegate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resoID: selectedReso ? selectedReso.resoID : "-1",
        delegateID: isDelegateUser ? delegateID : selectedReso?.delegateID,
        committeeID,
        content,
        isNew: !selectedReso,
        title,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to post resolution");
      return;
    }

    const newReso = await res.json();
    toast.success(`Resolution ${selectedReso ? "updated" : "posted"} successfully!`);

    if (!selectedReso && !fetchedResos.some((r) => r.resoID === newReso.resoID)) {
      setFetchedResos((prev) => [...prev, newReso]);
      setTitle("");
    }
  };

  const toggleResoUpdatePermission = async (delegateID: string) => {
    if (!currentUser || !selectedReso || userRole !== "chair") {
      return;
    }

    try {
      const delegate = delegates.find((d) => d.delegateID === delegateID);
      if (!delegate) return;

      const hasPermission =
        delegate.resoPerms &&
        delegate.resoPerms["update:reso"] &&
        Array.isArray(delegate.resoPerms["update:reso"]) &&
        delegate.resoPerms["update:reso"].includes(selectedReso.resoID);

      let updatedPermissions;

      if (hasPermission) {
        updatedPermissions = {
          ...delegate.resoPerms,
          "update:reso": delegate.resoPerms["update:reso"].filter((id) => id !== selectedReso.resoID),
        };
      } else {
        updatedPermissions = {
          ...delegate.resoPerms,
          "update:reso": [
            ...(Array.isArray(delegate.resoPerms["update:reso"]) ? delegate.resoPerms["update:reso"] : []),
            selectedReso.resoID,
          ],
        };
      }

      const res = await fetch(`/api/delegates`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          delegateID: delegateID,
          resoPerms: updatedPermissions,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update permissions");
      }

      setDelegates(
        delegates.map((d) =>
          d.delegateID === delegateID
            ? { ...d, resoPerms: updatedPermissions }
            : d
        )
      );

      toast.success(`Permission ${hasPermission ? "removed from" : "granted to"} ${delegate.firstname}`);
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  const restricted = (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-ivory via-linen to-champagne px-6 py-12 text-center">
      <div className="max-w-md rounded-[2.25rem] border border-white/40 bg-white/85 p-8 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur">
        <p className="text-lg font-heading font-semibold text-deep-red">Restricted access</p>
        <p className="mt-3 text-sm text-dark-burgundy/80">Only delegates or chairs can access this page.</p>
      </div>
    </div>
  );

  if (userRole !== "delegate" && userRole !== "chair") {
    return restricted;
  }

  if (isDelegateUser) {
    const delegateUser = currentUser as Delegate;
    if (!delegateUser.resoPerms["view:ownreso"]) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-ivory via-linen to-champagne px-6 py-12 text-center">
          <div className="max-w-lg space-y-4 rounded-[2.25rem] border border-white/40 bg-white/85 p-8 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur">
            <p className="text-lg font-heading font-semibold text-deep-red">Access required</p>
            <p className="text-sm text-dark-burgundy/80">You do not have permission to post resolutions.</p>
            <p className="text-sm text-dark-burgundy/70">Please request access from your chair.</p>
            {currentUser && "delegateID" in currentUser && (
              <button
                onClick={() => {
                  logBackIn();
                  toast.success("Page reloaded successfully!");
                }}
                className="inline-flex items-center justify-center rounded-2xl bg-deep-red px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.85)] transition hover:bg-dark-burgundy"
              >
                Reload permissions
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <ParticipantRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-16 top-28 h-72 w-72 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-16 right-12 h-72 w-72 rounded-full bg-dark-burgundy/12 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,235,221,0.2)_0%,_transparent_60%)]" />
            <div className="relative px-6 py-10 text-center sm:px-12">
              <div className="mx-auto max-w-3xl space-y-4">
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">Resolution Studio</h1>
                <p className="text-base text-white/85 sm:text-lg">
                  Draft, collaborate, and steward committee resolutions. Manage authorship permissions and keep operative clauses aligned.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6 xl:flex-row">
            <div className="flex w-full flex-col gap-6 xl:w-[360px]">
              <motion.aside
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="rounded-[2.25rem] border border-white/40 bg-white/85 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
              >
                <div className="mb-5 text-center">
                  <p className="text-lg font-heading font-semibold text-deep-red">Resolutions</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-dark-burgundy/70">Select to edit</p>
                </div>
                {fetchedResos.length === 0 ? (
                  <div className="rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 p-6 text-center text-dark-burgundy/70">
                    No resolutions found.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "420px" }}>
                    {fetchedResos.map((reso, idx) => {
                      if (!reso) return null;
                      return (
                        <button
                          key={reso.resoID}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                            selectedReso?.resoID === reso.resoID
                              ? "border-deep-red bg-deep-red text-white shadow-[0_18px_40px_-30px_rgba(112,30,30,0.7)]"
                              : "border-soft-ivory/70 bg-soft-ivory/70 text-almost-black-green hover:border-deep-red/40 hover:bg-soft-rose/60"
                          }`}
                          onClick={() => {
                            setSelectedReso(reso);
                            setTitle(reso.title || "");
                          }}
                        >
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-deep-red shadow">
                            {idx + 1}
                          </span>
                          <span className="flex-1">
                            {reso.title ? reso.title : `Resolution #${idx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.aside>

              {selectedReso && userRole === "chair" && delegates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 }}
                  className="rounded-[2.25rem] border border-white/40 bg-white/85 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
                >
                  <h3 className="text-lg font-heading font-semibold text-deep-red">Update permissions</h3>
                  <p className="text-xs uppercase tracking-[0.35em] text-dark-burgundy/70">Control edit access</p>
                  <div className="mt-4 max-h-[220px] space-y-2 overflow-y-auto pr-1">
                    {[...delegates]
                      .sort((a, b) => `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`))
                      .map((delegate) => (
                        <label
                          key={delegate.delegateID}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 px-4 py-2 text-sm text-almost-black-green"
                        >
                          <span className="truncate font-semibold">
                            {delegate.firstname} {delegate.lastname}
                          </span>
                          <input
                            type="checkbox"
                            checked={
                              delegate.resoPerms &&
                              delegate.resoPerms["update:reso"] &&
                              Array.isArray(delegate.resoPerms["update:reso"]) &&
                              delegate.resoPerms["update:reso"].includes(selectedReso.resoID)
                            }
                            onChange={() => toggleResoUpdatePermission(delegate.delegateID)}
                            className="h-4 w-4 rounded border-soft-ivory/70 text-deep-red focus:ring-deep-red"
                            disabled={userRole !== "chair"}
                          />
                        </label>
                      ))}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.section
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 overflow-hidden rounded-[2.25rem] border border-white/40 bg-white/90 p-4 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
            >
              <div className="mb-4">
                <textarea
                  placeholder="Resolution title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full resize-none rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-4 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                  rows={1}
                />
              </div>
              <div className="max-h-[500px] overflow-auto rounded-[1.75rem] border border-soft-ivory/60 bg-white/90 p-2">
                <SimpleEditor
                  ref={editorRef}
                  content={selectedReso?.content}
                  className="h-full"
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={postReso}
                  className="inline-flex items-center justify-center rounded-2xl bg-deep-red px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.85)] transition hover:bg-dark-burgundy"
                >
                  {selectedReso ? "Update resolution" : "Post resolution"}
                </button>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </ParticipantRoute>
  );
};

export default Page;
