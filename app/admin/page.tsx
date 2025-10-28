import React from 'react';
import { AdminRoute } from '@/components/protectedroute';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Upload, ImageIcon, FileText, Sparkles } from 'lucide-react';

const Page = () => {
  const [content, setContent] = React.useState<string>("");
  const [title, setTitle] = React.useState<string>("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddUpdate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (!selectedFile) {
      toast.error("Image file is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('content', content);
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create update');
      }

      setTitle("");
      setContent("");
      setSelectedFile(null);
      toast.success("Update added successfully!");
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error('Error adding update:', error);
      toast.error("An unknown error occurred");
    }
  };

  return (
    <AdminRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-16 top-28 h-72 w-72 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-16 right-12 h-72 w-72 rounded-full bg-dark-burgundy/12 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="relative px-6 py-10 text-center sm:px-12">
              <div className="mx-auto max-w-2xl space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10">
                  <Sparkles size={24} />
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">Admin Broadcast Center</h1>
                <p className="text-base text-white/85 sm:text-lg">
                  Share conference-wide updates, attach imagery, and alert delegates instantly.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="rounded-[2.5rem] border border-white/40 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
          >
            <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-dark-burgundy/70">Upload image</p>
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-soft-ivory/80 bg-soft-ivory/70 p-6 text-center transition hover:border-deep-red/40 hover:bg-soft-rose/50">
                  <ImageIcon className="mb-3 text-deep-red" size={36} />
                  <span className="text-sm text-dark-burgundy/70">Click or drag a JPG image</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFile && (
                    <div className="mt-4 flex flex-col items-center gap-2">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-32 w-32 rounded-2xl object-cover shadow"
                      />
                      <span className="break-all text-xs text-dark-burgundy/70">{selectedFile.name}</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.35em] text-dark-burgundy/70">
                    Title
                  </label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark-burgundy/30" size={18} />
                    <textarea
                      className="h-28 w-full resize-none rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-12 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                      value={title}
                      placeholder="Write your update title..."
                      onChange={handleTitleChange}
                    ></textarea>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.35em] text-dark-burgundy/70">
                    Content
                  </label>
                  <textarea
                    className="h-60 w-full resize-none rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-4 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                    value={content}
                    placeholder="Write your update content here..."
                    onChange={handleContentChange}
                  ></textarea>
                </div>

                <button
                  onClick={handleAddUpdate}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-deep-red px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.85)] transition hover:bg-dark-burgundy"
                >
                  <Upload size={18} />
                  Publish update
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default Page;
