import React, { useEffect } from 'react';
import { Update } from '@/db/types';
import { ProtectedRoute } from '@/components/protectedroute';
import { useMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import supabase from '@/lib/supabase';

const Page = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [updates, setUpdates] = React.useState<Update[]>([]);
  const isMobile = useMobile();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Updates')
          .select('*')
          .order('time', { ascending: false });

        if (error) {
          console.error('Failed to fetch updates:', error);
          return;
        }

        if (data) {
          data.forEach((update: Update) => {
            if (update.href) {
              console.log(`Update ${update.updateID} has image URL: ${update.href}`);
            } else {
              console.warn(`Update ${update.updateID} has no image URL`);
            }
          });

          setUpdates(data);
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-10 top-24 h-64 w-64 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-dark-burgundy/10 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,235,221,0.2)_0%,_transparent_65%)]" />
            <div className="relative px-6 py-12 sm:px-12">
              <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur">
                  <Bell size={36} />
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
                  Live Crisis Updates
                </h1>
                <p className="mt-4 text-lg text-white/85">
                  Rapid intelligence from the Secretariat to guide your crisis response. Monitor shifts, coordinate your bloc, and act before resolutions hit the floor.
                </p>
                <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm uppercase tracking-[0.35em]">
                  {isMobile ? 'Real-time Alerts' : 'Real-time Crisis Alerts'}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Updates Content */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-soft-rose border-t-transparent animate-spin" />
                <p className="text-lg text-dark-burgundy/80">Loading updates...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {updates.length > 0 ? (
                  updates.map((update, index) => (
                    <motion.article
                      key={update.updateID}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="overflow-hidden rounded-[2rem] border border-soft-ivory/70 bg-soft-ivory/80 shadow-[0_20px_50px_-30px_rgba(28,28,28,0.45)]"
                    >
                      <div className="flex flex-col lg:flex-row">
                        <div className="flex-1 p-6 sm:p-8">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-deep-red px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white">
                              <AlertTriangle size={16} /> Crisis Alert
                            </span>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-deep-red">
                              Priority {index + 1}
                            </div>
                          </div>

                          <h2 className="mt-6 font-heading text-3xl font-semibold text-deep-red">
                            {update.title}
                          </h2>

                          <div className="mt-4 flex items-center gap-2 text-sm text-dark-burgundy/70">
                            <Clock size={16} />
                            <span>
                              {new Date(update.time.slice(0, 10)).toLocaleDateString()} • {new Date(update.time).toLocaleTimeString()}
                            </span>
                          </div>

                          <p className="mt-5 text-base leading-relaxed text-almost-black-green">
                            {update.content}
                          </p>

                          <div className="mt-6 rounded-3xl border border-soft-rose/70 bg-soft-rose/60 p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="mt-1 h-5 w-5 text-dark-burgundy" />
                              <p className="text-sm text-dark-burgundy/90">
                                <strong>Immediate Action:</strong> Coordinate a rapid caucus. Chairs expect an operative update within the hour.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-1/3">
                          {update.href ? (
                            <div className="relative h-64 lg:h-full">
                              <img
                                src={update.href}
                                alt={`Update ${update.updateID} illustration`}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-almost-black-green/60 via-almost-black-green/20 to-transparent" />
                            </div>
                          ) : (
                            <div className="flex h-64 items-center justify-center bg-gradient-to-br from-soft-ivory to-champagne">
                              <div className="text-center text-dark-burgundy/60">
                                <AlertTriangle size={40} className="mx-auto" />
                                <p className="mt-2 text-sm font-semibold">Crisis documentation</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-4 py-16 text-center text-dark-burgundy/80">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-soft-rose/70 text-deep-red">
                      <Bell size={42} />
                    </div>
                    <h3 className="text-2xl font-heading font-semibold text-deep-red">No crisis alerts</h3>
                    <p className="max-w-xl text-sm">
                      The conference is stable. When the Secretariat issues breaking developments, they will appear instantly in this feed.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
