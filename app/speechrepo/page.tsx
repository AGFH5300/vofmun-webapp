"use client";
import React, { useEffect, useState } from "react";
import { Speech } from "@/db/types";
import { useSession } from "../context/sessionContext";
import { Editor } from "@tiptap/react";
import { SimpleEditor } from "../../components/tiptap-templates/simple/simple-editor";
import { ParticipantRoute } from "@/components/protectedroute";
import { toast } from "sonner";
import role from "@/lib/roles";
import { motion } from "framer-motion";

const Page = () => {
  const { user: currentUser } = useSession();
  const userRole = role(currentUser);
  const editorRef = React.useRef<Editor | null>(null);
  const [fetchedSpeeches, setFetchedSpeeches] = useState<Speech[]>([]);
  const [selectedSpeech, setSelectedSpeech] = useState<Speech | null>(null);
  const [title, setTitle] = useState<string>("");
  const isDelegateUser = userRole === "delegate" && currentUser !== null;
  const isChairUser = userRole === "chair" && currentUser !== null;

  useEffect(() => {
    if (selectedSpeech) {
      setTitle(selectedSpeech.title || "");
    } else {
      setTitle("");
    }
  }, [selectedSpeech]);

  useEffect(() => {
    const fetchSpeeches = async () => {
      if (!currentUser) return;

      let endpoint = "/api/speeches";
      if (isDelegateUser) {
        endpoint += `/delegate?delegateID=${currentUser.delegateID}`;
      } else if (isChairUser) {
        endpoint += `/chair?committeeID=${currentUser.committee.committeeID}`;
      }

      const res = await fetch(endpoint);
      const data = await res.json();
      setFetchedSpeeches(data.speeches || []);

      if (selectedSpeech) {
        const updatedSelectedSpeech = data.find((speech: Speech) => speech.speechID === selectedSpeech.speechID);
        if (updatedSelectedSpeech) {
          setTitle(updatedSelectedSpeech.title || "");
        }
      }
    };

    fetchSpeeches();
  }, [currentUser, isDelegateUser, isChairUser, selectedSpeech]);

  const postSpeech = async () => {
    if (!currentUser) {
      toast.error("No user logged in");
      return;
    }

    if (!editorRef.current) {
      toast.error("Editor not initialized");
      return;
    }

    const editorText = editorRef.current.getText();
    if (editorText.length === 0) {
      toast.error("Speech content cannot be empty");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a speech title");
      return;
    }

    const content = editorRef.current.getJSON();

    let delegateID = "";
    let committeeID = "";

    if (isDelegateUser) {
      delegateID = currentUser.delegateID;
      committeeID = currentUser.committee.committeeID;
    } else if (isChairUser) {
      delegateID = selectedSpeech?.delegateID || "";
      committeeID = currentUser.committee.committeeID;
    }

    const res = await fetch("/api/speeches/delegate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        speechID: selectedSpeech ? selectedSpeech.speechID : "-1",
        delegateID,
        title,
        content: JSON.stringify(content),
        date: new Date().toISOString(),
        tags: [],
        committeeID,
        isNew: !selectedSpeech,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to save speech");
      return;
    }

    const newSpeech = await res.json();
    toast.success(
      `Speech ${selectedSpeech ? "updated" : "posted"} successfully!`
    );

    if (!selectedSpeech && !fetchedSpeeches.some((s) => s.speechID === newSpeech.speechID)) {
      setFetchedSpeeches((prev) => [...prev, newSpeech]);
      setTitle("");
    }
  };

  const emptyState = (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-soft-ivory via-linen to-champagne px-6 py-12 text-center">
      <div className="max-w-md rounded-[2.25rem] border border-white/40 bg-white/85 p-8 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur">
        <p className="text-lg">Only delegates or chairs can access this page.</p>
      </div>
    </div>
  );

  if (!isDelegateUser && !isChairUser) {
    return emptyState;
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
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">Speech Repository</h1>
                <p className="text-base text-white/85 sm:text-lg">
                  Draft, revise, and polish your committee interventions. Saved speeches stay synced so you can pivot strategy instantly.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-6 lg:flex-row">
            <motion.aside
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="w-full max-w-full rounded-[2.25rem] border border-white/40 bg-white/85 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur lg:max-w-sm"
            >
              <div className="mb-5 text-center">
                <p className="text-lg font-heading font-semibold text-deep-red">Your speeches</p>
                <p className="text-xs uppercase tracking-[0.35em] text-dark-burgundy/70">Select to edit</p>
              </div>
              {fetchedSpeeches.length === 0 ? (
                <div className="rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 p-6 text-center text-dark-burgundy/70">
                  No speeches found.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "420px" }}>
                  {fetchedSpeeches.map((speech, idx) => {
                    if (!speech) return null;
                    return (
                      <button
                        key={speech.speechID}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          selectedSpeech?.speechID === speech.speechID
                            ? "border-deep-red bg-deep-red text-white shadow-[0_18px_40px_-30px_rgba(112,30,30,0.7)]"
                            : "border-soft-ivory/70 bg-soft-ivory/70 text-almost-black-green hover:border-deep-red/40 hover:bg-soft-rose/60"
                        }`}
                        onClick={() => {
                          setSelectedSpeech(speech);
                          setTitle(speech.title || "");
                        }}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-deep-red shadow">
                          {idx + 1}
                        </span>
                        <span className="flex-1">
                          {speech.title ? speech.title : `Speech #${idx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.aside>

            <motion.section
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="flex-1 overflow-hidden rounded-[2.25rem] border border-white/40 bg-white/90 p-4 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
            >
              <div className="mb-4">
                <textarea
                  placeholder="Speech title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full resize-none rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-4 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                  rows={1}
                />
              </div>
              <div className="max-h-[500px] overflow-auto rounded-[1.75rem] border border-soft-ivory/60 bg-white/90 p-2">
                <SimpleEditor
                  ref={editorRef}
                  content={selectedSpeech?.content ? JSON.parse(selectedSpeech.content) : undefined}
                  className="h-full"
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={postSpeech}
                  className="inline-flex items-center justify-center rounded-2xl bg-deep-red px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.85)] transition hover:bg-dark-burgundy"
                >
                  {selectedSpeech ? "Update speech" : "Post speech"}
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
