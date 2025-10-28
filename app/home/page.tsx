import React, { useEffect, useState } from 'react';
import { Link } from '@/src/router';
import { motion } from 'framer-motion';
import { useSession } from '../context/sessionContext';
import { ProtectedRoute } from '@/components/protectedroute';
import {
  ArrowRight,
  Bell,
  Calendar,
  ClipboardCheck,
  FileText,
  Globe2,
  MessageSquare,
  NotebookPen,
  Sparkles,
  Users2,
} from 'lucide-react';

const Page = () => {
  const { user: currentUser } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getUserRole = () => {
    if (!currentUser) return '';
    if ('adminID' in currentUser) return 'Administrator';
    if ('chairID' in currentUser) return 'Chair';
    if ('delegateID' in currentUser) return 'Delegate';
    return '';
  };

  const getDisplayName = () => {
    if (!currentUser) return '';
    return `${currentUser.firstname} ${currentUser.lastname}`;
  };

  const quickActions = [
    {
      title: 'Live Updates',
      description: 'Stay informed with real-time conference updates',
      href: '/live-updates',
      icon: Bell,
      gradient: 'from-deep-red via-dark-burgundy to-rich-maroon',
    },
    {
      title: 'Speech Repository',
      description: 'Craft, save, and rehearse your speeches',
      href: '/speechrepo',
      icon: MessageSquare,
      gradient: 'from-almost-black-green via-deep-red to-almost-black-green',
    },
    {
      title: 'Resolutions',
      description: 'Draft, collaborate, and submit committee resolutions',
      href: '/resolutions',
      icon: FileText,
      gradient: 'from-dark-burgundy via-deep-red to-dark-burgundy',
    },
  ];

  const stats = [
    {
      label: 'Committees in Session',
      value: '12',
      subtext: 'All committees are actively debating',
      accent: 'bg-soft-ivory text-deep-red',
      icon: NotebookPen,
    },
    {
      label: 'Messages Unread',
      value: '3',
      subtext: 'Replies awaiting your attention',
      accent: 'bg-champagne text-dark-burgundy',
      icon: MessageSquare,
    },
    {
      label: 'Upcoming Events',
      value: '2',
      subtext: 'Next session in 45 minutes',
      accent: 'bg-deep-red text-white',
      icon: Calendar,
    },
  ];

  const schedule = [
    {
      time: '09:30 AM',
      title: 'Opening Statements',
      detail: 'General Assembly | Ballroom A',
      highlight: 'bg-soft-ivory text-deep-red',
    },
    {
      time: '11:00 AM',
      title: 'Moderated Caucus',
      detail: 'UNESCO | Room 4C',
      highlight: 'bg-champagne text-dark-burgundy',
    },
    {
      time: '02:15 PM',
      title: 'Draft Resolution Review',
      detail: 'Security Council | Chamber 1',
      highlight: 'bg-almost-black-green text-white',
    },
  ];

  const announcements = [
    {
      title: 'Award Nominations Due',
      description: 'Submit outstanding delegate nominations before the evening plenary.',
      tone: 'bg-soft-ivory',
    },
    {
      title: 'Logistics Update',
      description: 'Delegates assigned to UNESCO will relocate to Room 5B after lunch.',
      tone: 'bg-champagne',
    },
    {
      title: 'Networking Reception',
      description: 'Join the diplomatic reception at 7:00 PM in the Skyline Hall.',
      tone: 'bg-white',
    },
  ];

  const resources = [
    {
      title: 'Delegate Handbook',
      description: 'Review procedures, rules of order, and committee expectations.',
      href: '/glossary',
      icon: NotebookPen,
    },
    {
      title: 'Committee Directory',
      description: 'Find contact details for chairs and fellow delegates.',
      href: '/messages',
      icon: Users2,
    },
    {
      title: 'Global Briefings',
      description: 'Read the latest updates curated by the VOFMUN Secretariat.',
      href: '/live-updates',
      icon: Globe2,
    },
  ];

  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateString = currentTime.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-dark-burgundy/10 blur-3xl" />
          <div className="absolute left-1/3 top-0 h-48 w-48 rounded-full bg-pale-aqua/30 blur-2xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,237,221,0.25)_0%,_transparent_60%)]" />
            <div className="absolute right-10 top-10 h-24 w-24 rounded-full border border-white/30" />
            <div className="relative flex flex-col gap-10 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-5">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                  <Sparkles size={22} className="text-soft-ivory" />
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                    {getUserRole()} Dashboard
                  </span>
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  Welcome back, {getDisplayName()}
                </h1>
                <p className="text-base text-white/85 sm:text-lg">
                  Navigate the conference with clarity. Your upcoming sessions, collaborative tools, and alerts are collected here
                  so you never miss a critical moment.
                </p>
              </div>
              <div className="flex flex-col gap-6 text-right">
                <div className="rounded-3xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Current Time</p>
                  <p className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">{timeString}</p>
                  <p className="text-sm text-white/75">{dateString}</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/5 px-6 py-4 text-left backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Conference Status</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
                    <span className="text-base font-semibold">In Session</span>
                  </div>
                  <p className="mt-3 text-sm text-white/75">
                    Committees resume shortly. Review the schedule below and coordinate with your bloc to stay ahead.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Quick actions */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="space-y-6"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-3xl font-heading font-semibold text-deep-red">Quick Actions</h2>
                <p className="mt-2 max-w-xl text-sm text-dark-burgundy/80">
                  Priority tools that reflect the cadence of debate. Each card opens directly to the space you need next.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 * (index + 1) }}
                  >
                    <Link to={action.href} className="block">
                      <div
                        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-[0_18px_40px_-25px_rgba(112,30,30,0.8)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-30px_rgba(28,28,28,0.75)]`}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 hover:opacity-30" />
                        <div className="relative flex items-start justify-between">
                          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                            <Icon size={22} />
                          </span>
                          <ArrowRight size={20} className="text-white/70 transition-transform duration-300 hover:translate-x-1" />
                        </div>
                        <div className="relative mt-8 space-y-2">
                          <h3 className="text-2xl font-heading font-semibold">{action.title}</h3>
                          <p className="text-sm text-white/85">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Stats + schedule */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_20px_45px_-30px_rgba(28,28,28,0.65)] backdrop-blur">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-heading font-semibold text-deep-red">Conference pulse</h2>
                    <p className="mt-2 max-w-lg text-sm text-dark-burgundy/80">
                      Track the momentum of debate and manage your responses before the next moderated caucus begins.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-soft-ivory px-4 py-2 text-sm font-semibold text-deep-red">
                    <ClipboardCheck size={18} />
                    Real-time snapshot
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className={`rounded-3xl border border-soft-ivory/60 p-5 shadow-inner shadow-white/40 ${stat.accent}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold uppercase tracking-[0.35em]">{stat.label}</span>
                          <Icon size={20} className="opacity-80" />
                        </div>
                        <p className="mt-4 text-3xl font-heading font-bold">{stat.value}</p>
                        <p className="mt-1 text-sm opacity-80">{stat.subtext}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(28,28,28,0.55)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-heading font-semibold text-deep-red">Today’s schedule</h2>
                  <span className="rounded-full bg-soft-rose px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-dark-burgundy">
                    Coordinated
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {schedule.map((item) => (
                    <div
                      key={item.title}
                      className="flex flex-col gap-3 rounded-3xl border border-soft-ivory/60 bg-soft-ivory/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className={`inline-flex items-center gap-3 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] ${item.highlight}`}>
                        <span>{item.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-heading font-semibold text-almost-black-green">{item.title}</p>
                        <p className="text-sm text-dark-burgundy/80">{item.detail}</p>
                      </div>
                      <Link
                        to="/live-updates"
                        className="inline-flex items-center gap-2 rounded-full border border-deep-red/30 bg-white px-4 py-2 text-sm font-semibold text-deep-red transition hover:border-deep-red hover:bg-soft-rose/60"
                      >
                        View brief
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(28,28,28,0.55)] backdrop-blur">
                <h2 className="text-2xl font-heading font-semibold text-deep-red">Announcements</h2>
                <div className="mt-4 space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.title}
                      className={`rounded-3xl border border-soft-ivory/60 p-4 shadow-inner shadow-white/40 ${announcement.tone}`}
                    >
                      <p className="text-lg font-heading text-deep-red">{announcement.title}</p>
                      <p className="mt-2 text-sm text-dark-burgundy/80">{announcement.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-[0_18px_40px_-30px_rgba(28,28,28,0.55)] backdrop-blur">
                <h2 className="text-2xl font-heading font-semibold text-deep-red">Resources & collaboration</h2>
                <p className="mt-2 text-sm text-dark-burgundy/80">
                  Strengthen your bloc and align on operative clauses with curated tools from the Secretariat.
                </p>
                <div className="mt-5 space-y-4">
                  {resources.map((resource) => {
                    const Icon = resource.icon;
                    return (
                      <Link
                        key={resource.title}
                        to={resource.href}
                        className="flex items-center justify-between gap-4 rounded-3xl border border-soft-ivory/60 bg-soft-ivory/80 p-4 text-left transition hover:border-deep-red/50 hover:bg-soft-rose/60"
                      >
                        <div className="flex items-center gap-4">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-deep-red/10 text-deep-red">
                            <Icon size={20} />
                          </span>
                          <div>
                            <p className="text-lg font-heading font-semibold text-deep-red">{resource.title}</p>
                            <p className="text-sm text-dark-burgundy/80">{resource.description}</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-deep-red" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
