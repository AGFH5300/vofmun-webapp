"use client";
import React, {useEffect, useState, useMemo, memo, useCallback} from 'react'
import { ChairRoute } from '@/components/protectedroute'
import { useSession } from '@/app/context/sessionContext'
import { useMobile } from '@/hooks/use-mobile'
import { Chair } from '@/db/types'
import {toast} from 'sonner'
import { shortenedDel } from '@/db/types'
import { motion } from 'framer-motion'

const DelegateItem = memo(({ 
  delegate, 
  onPermissionChange, 
  isMobile 
}: { 
  delegate: shortenedDel, 
  onPermissionChange: (delegateID: string, permKey: string, value: boolean) => void; 
  isMobile?: boolean; 
}) => ( 
  <li key={delegate.delegateID} className='rounded-[2rem] border border-white/40 bg-white/90 p-4 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.55)] backdrop-blur'> 
    <div className='flex flex-col gap-4'> 
      <div className='text-center'> 
        <h2 className="text-xl sm:text-2xl font-heading font-semibold text-deep-red">{delegate.firstname} {delegate.lastname}</h2> 
      </div> 
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 w-full text-sm text-almost-black-green'> 
        <label className='flex items-center justify-between gap-2 rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 px-4 py-2'> 
          <span>{isMobile ? 'View own' : 'View own resolutions'}</span> 
          <input 
            type="checkbox" 
            className='h-4 w-4 rounded border-soft-ivory/70 text-deep-red focus:ring-deep-red' 
            checked={delegate.resoPerms["view:ownreso"]} 
            onChange={(e) => onPermissionChange(delegate.delegateID, "view:ownreso", e.target.checked)} 
          /> 
        </label> 
        <label className='flex items-center justify-between gap-2 rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 px-4 py-2'> 
          <span>{isMobile ? 'View all' : 'View all resolutions'}</span> 
          <input 
            type="checkbox" 
            className='h-4 w-4 rounded border-soft-ivory/70 text-deep-red focus:ring-deep-red' 
            checked={delegate.resoPerms["view:allreso"]} 
            onChange={(e) => onPermissionChange(delegate.delegateID, "view:allreso", e.target.checked)} 
          /> 
        </label> 
        <label className='flex items-center justify-between gap-2 rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 px-4 py-2'> 
          <span>{isMobile ? 'Update own' : 'Update own resolutions'}</span> 
          <input 
            type="checkbox" 
            className='h-4 w-4 rounded border-soft-ivory/70 text-deep-red focus:ring-deep-red' 
            checked={delegate.resoPerms["update:ownreso"]} 
            onChange={(e) => onPermissionChange(delegate.delegateID, "update:ownreso", e.target.checked)} 
          /> 
        </label> 
      </div> 
    </div> 
  </li> 
)); 

DelegateItem.displayName = 'DelegateItem';

const Page = () => {
    const { user: currentUser } = useSession();
    const isMobile = useMobile();
    const [delegates, setDelegates] = useState<shortenedDel[]>([]);
    const [originalDelegates, setOriginalDelegates] = useState<shortenedDel[]>([]);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDelegates = async () => {
            setLoading(true);
            try {
                if (!(currentUser as Chair)?.committee?.committeeID) return;
                
                const res = await fetch(`/api/delegates?committeeID=${(currentUser as Chair).committee.committeeID}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch delegates');
                }
                const data = await res.json();
                setDelegates(data);
                setOriginalDelegates(JSON.parse(JSON.stringify(data))); //deep copy
            } catch (error) {
                console.error("Error fetching delegates:", error);
                toast.error("Failed to load delegates");
            } finally {
                setLoading(false);
            }
        };

        fetchDelegates();
    }, [currentUser]);

    const handlePermissionChange = useCallback((delegateID: string, permKey: string, value: boolean) => {
        setDelegates(prevDelegates => {
            const newDelegates = prevDelegates.map(delegate => {
                if (delegate.delegateID === delegateID) {
                    return {
                        ...delegate,
                        resoPerms: {
                            ...delegate.resoPerms,
                            [permKey]: value
                        }
                    };
                }
                return delegate;
            });
            
            const hasAnyChanges = newDelegates.some((delegate, index) => {
                const original = originalDelegates[index];
                return (
                    delegate.resoPerms["view:ownreso"] !== original.resoPerms["view:ownreso"] ||
                    delegate.resoPerms["view:allreso"] !== original.resoPerms["view:allreso"] ||
                    delegate.resoPerms["update:ownreso"] !== original.resoPerms["update:ownreso"]
                );
            });
            
            setHasChanges(hasAnyChanges);
            return newDelegates;
        });
    }, [originalDelegates]);

    const saveChanges = async () => {
        try {
            setSaving(true);
            const changedDelegates = delegates.filter((delegate, index) => {
                const original = originalDelegates[index];
                return (
                    delegate.resoPerms["view:ownreso"] !== original.resoPerms["view:ownreso"] ||
                    delegate.resoPerms["view:allreso"] !== original.resoPerms["view:allreso"] ||
                    delegate.resoPerms["update:ownreso"] !== original.resoPerms["update:ownreso"]
                );
            });
            
            if (changedDelegates.length === 0) {
                toast.info("No changes to save");
                setSaving(false);
                return;
            }
            
            if (changedDelegates.length === 1) {
                const delegate = changedDelegates[0];
                const response = await fetch('/api/delegates', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        delegateID: delegate.delegateID,
                        resoPerms: delegate.resoPerms
                    }),
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to update delegate');
                }
                
                toast.success(`Updated permissions for ${delegate.firstname} ${delegate.lastname}`);
            }
            else {
                const formattedDelegates = changedDelegates.map(delegate => ({
                    delegateID: delegate.delegateID,
                    resoPerms: delegate.resoPerms
                }));
                
                const response = await fetch('/api/delegates', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        delegates: formattedDelegates
                    }),
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to update delegates');
                }

                type UpdateResult = {
                    delegateID: string;
                    success: boolean;
                    error?: string;
                    delegate?: {
                        delegateID: string;
                        resoPerms: {
                            "view:ownreso": boolean;
                            "view:allreso": boolean;
                            "update:ownreso": boolean;
                            "update:reso": string[];
                        };
                    };
                };
                
                const failures = result.results?.filter((r: UpdateResult) => !r.success) || [];
                
                if (failures.length > 0) {
                    toast.error(`Failed to update ${failures.length} delegates`);
                } else {
                    toast.success(`Updated permissions for ${changedDelegates.length} delegates`);
                }
            }

            setOriginalDelegates(JSON.parse(JSON.stringify(delegates)));
            setHasChanges(false);
            
        } catch (error) {
            console.error("Error saving changes:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const memoizedDelegatesList = useMemo(() => (
      <ul className='space-y-4'>
        {delegates.map((delegate) => (
          <DelegateItem
            key={delegate.delegateID}
            delegate={delegate}
            onPermissionChange={handlePermissionChange}
            isMobile={isMobile}
          />
        ))}
      </ul>
    ), [delegates, handlePermissionChange, isMobile]);

  return (
    <ChairRoute>
      <div className='relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne'>
        <div className='pointer-events-none absolute inset-0 opacity-60'>
          <div className='absolute -left-16 top-28 h-72 w-72 rounded-full bg-deep-red/10 blur-3xl' />
          <div className='absolute bottom-16 right-12 h-72 w-72 rounded-full bg-dark-burgundy/12 blur-3xl' />
        </div>

        <div className='relative mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8'>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]'
          >
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,235,221,0.2)_0%,_transparent_60%)]' />
            <div className='relative px-6 py-10 text-center sm:px-12'>
              <div className='mx-auto max-w-2xl space-y-4'>
                <h1 className='font-heading text-4xl font-bold leading-tight sm:text-5xl'>Delegate Permissions</h1>
                <p className='text-base text-white/85 sm:text-lg'>Manage access to resolutions for every delegate in your committee.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className='rounded-[2.5rem] border border-white/40 bg-white/90 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur'
          >
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div>
                <p className='text-lg font-heading font-semibold text-deep-red'>Permissions overview</p>
                <p className='text-sm text-dark-burgundy/70'>Toggle view and edit rights. Changes must be saved to take effect.</p>
              </div>
              {!loading && (
                <button
                  className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition shadow-[0_20px_45px_-28px_rgba(112,30,30,0.85)] ${hasChanges ? 'bg-deep-red text-white hover:bg-dark-burgundy' : 'bg-cool-grey text-dark-burgundy/60 cursor-not-allowed'}`}
                  onClick={saveChanges}
                  disabled={!hasChanges || saving}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              )}
            </div>

            <div className='mt-6'>
              {loading ? (
                <div className='flex h-48 items-center justify-center'>
                  <div className='h-12 w-12 animate-spin rounded-full border-4 border-soft-rose border-t-deep-red' />
                </div>
              ) : delegates.length === 0 ? (
                <div className='rounded-[2rem] border border-soft-ivory/60 bg-soft-ivory/70 px-6 py-16 text-center text-dark-burgundy/70'>
                  No delegates found in your committee.
                </div>
              ) : (
                <div className='space-y-4'>
                  {memoizedDelegatesList}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ChairRoute>
  )
}

export default Page;
