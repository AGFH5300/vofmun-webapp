import React, { useState } from 'react';
import clsx from 'clsx';
import { Link, useRouter } from '@/src/router';
import { useSession } from '@/app/context/sessionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '@/hooks/use-mobile';
import {
  Home,
  FileText,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Bell,
  LogOut,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface CustomNavProps {
  role?: 'delegate' | 'chair' | 'admin';
  activeLink?: string;
}

interface NavigationItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navBaseClasses =
  'group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200';

const CustomNav: React.FC<CustomNavProps> = ({ activeLink }) => {
  const { user: currentUser, logout } = useSession();
  const { pathname } = useRouter();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { name: 'Home', to: '/home', icon: Home },
    { name: 'Live Updates', to: '/live-updates', icon: Bell },
    { name: 'Glossary', to: '/glossary', icon: BookOpen },
    { name: 'Speech Repository', to: '/speechrepo', icon: MessageSquare },
    { name: 'Resolutions', to: '/resolutions', icon: FileText },
    { name: 'Messages', to: '/messages', icon: ClipboardList },
  ];

  const adminItems: NavigationItem[] = [
    { name: 'Admin Panel', to: '/admin', icon: Sparkles },
  ];

  const chairItems: NavigationItem[] = [
    { name: 'Chair Dashboard', to: '/chair', icon: ClipboardList },
  ];

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

  const isActive = (to: string, key: string) => {
    if (activeLink) {
      return key === activeLink;
    }
    return pathname === to;
  };

  const sharedLink = (item: NavigationItem, key: string) => (
    <Link
      key={item.name}
      to={item.to}
      className={clsx(
        navBaseClasses,
        isActive(item.to, key)
          ? 'bg-white/15 text-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.8)] backdrop-blur'
          : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-[0_8px_24px_-16px_rgba(255,255,255,0.6)]'
      )}
      onClick={() => setIsMenuOpen(false)}
    >
      <item.icon size={18} className="transition-transform group-hover:-translate-y-0.5" />
      <span>{item.name}</span>
      {isActive(item.to, key) && (
        <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-white/60" />
      )}
    </Link>
  );

  const showAdmin = currentUser && 'adminID' in currentUser;
  const showChair = currentUser && 'chairID' in currentUser;

  if (isMobile) {
    return (
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-deep-red via-dark-burgundy to-deep-red text-white shadow-xl">
        <div className="px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/10 p-2 backdrop-blur">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">VOFMUN</p>
                <p className="text-base font-heading font-bold text-white">Delegate Hub</p>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-full border border-white/20 p-2 text-white transition hover:bg-white/10"
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pb-4"
              >
                <div className="space-y-2 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  {navigationItems.map((item) => sharedLink(item, item.to.slice(1)))}

                  {showAdmin && adminItems.map((item) => sharedLink(item, 'admin'))}
                  {showChair && chairItems.map((item) => sharedLink(item, 'chair'))}

                  <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/80">
                    <p className="font-semibold text-white">Hello {getDisplayName()}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{getUserRole()}</p>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-2 font-semibold text-white transition hover:bg-white/30"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-deep-red via-dark-burgundy to-deep-red text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/10 p-3 backdrop-blur">
            <Sparkles size={26} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">VOFMUN</p>
            <p className="text-lg font-heading font-bold leading-tight text-white">Delegate Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {navigationItems.map((item) => sharedLink(item, item.to.slice(1)))}
          {showAdmin && adminItems.map((item) => sharedLink(item, 'admin'))}
          {showChair && chairItems.map((item) => sharedLink(item, 'chair'))}
        </div>

        <div className="flex items-center gap-4 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{getDisplayName()}</p>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">{getUserRole()}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-white/30 bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default CustomNav;
