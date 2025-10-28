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
  Users2
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
      title: "Live Updates",
      description: "Stay informed with real-time conference updates",
      href: "/live-updates",
      icon: Bell,
      gradient: "from-[#701E1E] via-[#8B2424] to-[#701E1E]"
    },
    {
      title: "Speech Repository",
      description: "Craft, save, and rehearse your speeches",
      href: "/speechrepo",
      icon: MessageSquare,
      gradient: "from-[#1C1C1C] via-[#701E1E] to-[#1C1C1C]"
    },
    {
      title: "Resolutions",
      description: "Draft, collaborate, and submit committee resolutions",
      href: "/resolutions",
      icon: FileText,
      gradient: "from-[#8B2424] via-[#701E1E] to-[#8B2424]"
    }
  ];

  const stats = [
    {
      label: "Committees in Session",
      value: "12",
      subtext: "All committees are actively debating",
      accent: "bg-[#FFEBDD] text-[#701E1E]",
      icon: NotebookPen
    },
    {
      label: "Messages Unread",
      value: "3",
      subtext: "Replies awaiting your attention",
      accent: "bg-[#FFFDFB] text-[#8B2424]",
      icon: MessageSquare
    },
    {
      label: "Upcoming Events",
      value: "2",
      subtext: "Next session in 45 minutes",
      accent: "bg-[#701E1E] text-white",
      icon: Calendar
    }
  ];

  const schedule = [
    {
      time: "09:30 AM",
      title: "Opening Statements",
      detail: "General Assembly | Ballroom A",
      highlight: "bg-[#FFEBDD] text-[#701E1E]"
    },
    {
      time: "11:00 AM",
      title: "Moderated Caucus",
      detail: "UNESCO | Room 4C",
      highlight: "bg-[#FFFDFB] text-[#8B2424]"
    },
    {
      time: "02:15 PM",
      title: "Draft Resolution Review",
      detail: "Security Council | Chamber 1",
      highlight: "bg-[#1C1C1C] text-white"
    }
  ];

  const announcements = [
    {
      title: "Award Nominations Due",
      description: "Submit outstanding delegate nominations before the evening plenary.",
      tone: "bg-[#FFFDFB]"
    },
    {
      title: "Logistics Update",
      description: "Delegates assigned to UNESCO will relocate to Room 5B after lunch.",
      tone: "bg-[#FFEBDD]"
    },
    {
      title: "Networking Reception",
      description: "Join the diplomatic reception at 7:00 PM in the Skyline Hall.",
      tone: "bg-white"
    }
  ];

  const resources = [
    {
      title: "Delegate Handbook",
      description: "Review procedures, rules of order, and committee expectations.",
      href: "/glossary",
      icon: NotebookPen
    },
    {
      title: "Committee Directory",
      description: "Find contact details for chairs and fellow delegates.",
      href: "/messages",
      icon: Users2
    },
    {
      title: "Global Briefings",
      description: "Read the latest updates curated by the VOFMUN Secretariat.",
      href: "/live-updates",
      icon: Globe2
    }
  ];

  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateString = currentTime.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FFFDFB]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFEBDD] via-white to-[#FFFDFB] opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#701E1E] via-[#8B2424] to-[#701E1E] text-white shadow-2xl"
            >
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#FFEBDD]/30 blur-xl"></div>
              <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
                  <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <Sparkles size={22} className="text-[#FFEBDD]" />
                      <span className="text-sm uppercase tracking-[0.2em] text-white/80">
                        {getUserRole()} Dashboard
                      </span>
                    </div>
                    <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                      Welcome back, {getDisplayName()}
                    </h1>
                    <p className="text-base sm:text-lg text-white/90 max-w-xl">
                      Everything you need for a remarkable VOFMUN experience—curated updates, quick actions, and tools tailored to your role.
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6 text-right">
                    <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm">
                      <div className="text-sm uppercase tracking-[0.3em] text-white/70">Current Time</div>
                      <div className="text-3xl sm:text-4xl font-mono font-bold">{timeString}</div>
                      <div className="text-sm text-white/80">{dateString}</div>
                    </div>
                    <div className="rounded-2xl bg-[#FFEBDD]/20 px-6 py-4 text-left text-[#FFFDFB]">
                      <p className="text-sm uppercase tracking-[0.3em] text-white/70">Conference Status</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-base font-semibold">In Session</span>
                      </div>
                      <p className="mt-3 text-sm text-white/80 max-w-xs">
                        Join your scheduled committee room in time for the next moderated caucus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-3xl font-heading font-semibold text-[#701E1E]">Quick Actions</h2>
                <p className="text-sm text-[#8B2424]/80 max-w-xl">
                  Access the tools you use the most—each card adapts to your role so you can focus on what matters now.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                      className="group"
                    >
                      <Link to={action.href}>
                        <div
                          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.gradient} p-6 text-white shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl`}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                              <Icon size={22} className="text-white" />
                            </div>
                            <ArrowRight
                              size={20}
                              className="text-white/70 transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </div>
                          <div className="relative z-10 mt-6 space-y-2">
                            <h3 className="text-2xl font-heading font-semibold">
                              {action.title}
                            </h3>
                            <p className="text-sm text-white/90 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Metrics & Schedule */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="xl:col-span-2 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-[#FFEBDD] bg-white/70 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase tracking-[0.2em] text-[#8B2424]/70">
                            {stat.label}
                          </span>
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}>
                            <Icon size={18} />
                          </div>
                        </div>
                        <div className="mt-4 text-3xl font-heading font-semibold text-[#1C1C1C]">
                          {stat.value}
                        </div>
                        <p className="mt-2 text-sm text-[#8B2424]/80">{stat.subtext}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-[#FFEBDD] bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-heading font-semibold text-[#701E1E]">Today's Schedule</h2>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#8B2424]/60">Stay on time</span>
                  </div>
                  <div className="mt-6 space-y-5">
                    {schedule.map((item) => (
                      <div
                        key={item.title}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#FFEBDD]/80 bg-[#FFFDFB] p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${item.highlight}`}>
                            {item.time}
                          </div>
                          <div>
                            <p className="text-lg font-heading text-[#1C1C1C]">{item.title}</p>
                            <p className="text-sm text-[#8B2424]/80">{item.detail}</p>
                          </div>
                        </div>
                        <Link to="/live-updates" className="text-sm font-medium text-[#701E1E] hover:text-[#8B2424] transition-colors">
                          View details
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.aside
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="space-y-6"
              >
                <div className="rounded-3xl bg-[#701E1E] text-white shadow-xl overflow-hidden">
                  <div className="bg-[#8B2424]/80 px-6 py-4">
                    <h3 className="text-xl font-heading font-semibold">Announcements</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">Stay informed</p>
                  </div>
                  <div className="space-y-4 px-6 py-5">
                    {announcements.map((item) => (
                      <div key={item.title} className={`${item.tone} rounded-2xl px-4 py-3 text-[#1C1C1C] shadow-md shadow-black/5`}>
                        <p className="text-sm font-heading text-[#701E1E]">{item.title}</p>
                        <p className="text-sm text-[#1C1C1C]/80 mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#FFEBDD] bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-heading font-semibold text-[#701E1E]">Essential Resources</h3>
                    <span className="text-xs uppercase tracking-[0.3em] text-[#8B2424]/60">Reference</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {resources.map((resource) => {
                      const Icon = resource.icon;
                      return (
                        <Link
                          key={resource.title}
                          to={resource.href}
                          className="group flex items-start gap-3 rounded-2xl border border-[#FFEBDD]/80 bg-[#FFFDFB] px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8B2424]/50 hover:shadow-lg"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFEBDD] text-[#701E1E]">
                            <Icon size={18} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-base font-heading text-[#1C1C1C] group-hover:text-[#701E1E]">{resource.title}</p>
                            <p className="text-sm text-[#8B2424]/80">{resource.description}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </motion.aside>
            </div>

            {/* Collaboration Section */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="rounded-3xl border border-[#FFEBDD] bg-white px-6 py-8 shadow-xl"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <h2 className="text-3xl font-heading font-semibold text-[#701E1E]">Collaborate with Your Delegation</h2>
                  <p className="text-base text-[#1C1C1C]/80">
                    Coordinate strategy, share documents, and align on key talking points before your next session. Use the tools below to keep your team synchronized and ready for decisive diplomacy.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/messages"
                    className="inline-flex items-center gap-2 rounded-full bg-[#701E1E] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#8B2424]"
                  >
                    <MessageSquare size={18} />
                    Open Messages
                  </Link>
                  <Link
                    to="/resolutions"
                    className="inline-flex items-center gap-2 rounded-full border border-[#701E1E] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#701E1E] transition-all duration-300 hover:border-[#8B2424] hover:text-[#8B2424]"
                  >
                    <ClipboardCheck size={18} />
                    Draft Resolution
                  </Link>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Page;
