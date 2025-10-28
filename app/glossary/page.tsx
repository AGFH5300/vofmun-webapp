"use client";
import React from "react";
import { ProtectedRoute } from "@/components/protectedroute";
import { motion } from "framer-motion";
import { BookOpenCheck, Sparkles } from "lucide-react";

const Page = () => {
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-dark-burgundy/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,235,221,0.2)_0%,_transparent_65%)]" />
            <div className="relative px-6 py-12 sm:px-10">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                  <BookOpenCheck size={28} />
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">Glossary</h1>
                <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
                  Parliamentary language at your fingertips. Use this reference during debate to move confidently through procedure.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="space-y-8"
          >
            {[{
              title: "Points",
              description: "Parliamentary procedures used during debate:",
              entries: [
                "Point of Information: A question directed to the speaker",
                "Point of Order: Raised when parliamentary procedure is not being followed",
                "Point of Personal Privilege: Raised when there are issues affecting delegate comfort",
              ],
            },
            {
              title: "Motions",
              description: "Formal proposals to change the course of debate:",
              entries: [
                "Motion to Open Debate: Begin formal debate on a topic",
                "Motion to Close Debate: End debate and move to voting",
                "Motion to Extend Debate: Continue discussion beyond the time limit",
                "Motion to Suspend Debate: Temporarily halt formal debate",
              ],
            },
            {
              title: "Resolutions",
              description: "Formal documents expressing the committee's position:",
              entries: [
                "Draft Resolution: Initial proposal addressing the committee topic",
                "Amendment: Proposed changes to a draft resolution",
                "Preambular Clauses: Background information and justification",
                "Operative Clauses: Specific actions the committee recommends",
              ],
            }].map((section, index) => (
              <motion.article
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="rounded-[2.25rem] border border-white/40 bg-white/85 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-deep-red/15 text-deep-red">
                    <Sparkles size={20} />
                  </span>
                  <div className="space-y-3">
                    <div>
                      <h2 className="text-2xl font-heading font-semibold text-deep-red">{section.title}</h2>
                      <p className="text-sm text-dark-burgundy/80">{section.description}</p>
                    </div>
                    <ul className="space-y-3 text-sm text-almost-black-green">
                      {section.entries.map((entry) => (
                        <li key={entry} className="rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-4 py-3 leading-relaxed">
                          {entry}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
