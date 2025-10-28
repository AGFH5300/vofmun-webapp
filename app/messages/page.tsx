"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ParticipantRoute } from '@/components/protectedroute';
import { useSession } from '@/app/context/sessionContext';
import { toast } from 'sonner';
import {
  Send,
  Users,
  User,
  Crown,
  MessageCircle,
  Search,
  RefreshCw
} from 'lucide-react';

interface Message {
  messageID: string;
  senderID: string;
  senderType: 'delegate' | 'chair';
  senderName: string;
  receiverID: string;
  receiverType: 'delegate' | 'chair';
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  participantID: string;
  participantName: string;
  participantType: 'delegate' | 'chair';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const Messages = () => {
  const { user: currentUser } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false); // For chair to view all delegate messages

  const getUserInfo = () => {
    if (!currentUser) return { id: '', name: '', type: 'delegate' as const };
    
    if ('delegateID' in currentUser) {
      return {
        id: currentUser.delegateID,
        name: `${currentUser.firstname} ${currentUser.lastname}`,
        type: 'delegate' as const
      };
    } else if ('chairID' in currentUser) {
      return {
        id: currentUser.chairID,
        name: `${currentUser.firstname} ${currentUser.lastname}`,
        type: 'chair' as const
      };
    }
    
    return { id: '', name: '', type: 'delegate' as const };
  };

  const userInfo = getUserInfo();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        toast.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Error loading conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationWith: string) => {
    try {
      const response = await fetch(`/api/messages?conversationWith=${conversationWith}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        await fetch('/api/messages/mark-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationWith
          })
        });
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverID: selectedConversation,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedConversation);
        await fetchConversations();
        toast.success('Message sent');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    }
  }, [newMessage, selectedConversation, fetchMessages, fetchConversations]);

  const fetchAllDelegateMessages = useCallback(async () => {
    if (userInfo.type !== 'chair') return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/messages/all-delegate-messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error('Failed to load delegate messages');
      }
    } catch (error) {
      console.error('Error fetching delegate messages:', error);
      toast.error('Error loading delegate messages');
    } finally {
      setLoading(false);
    }
  }, [userInfo.type]);

  useEffect(() => {
    if (userInfo.id) {
      fetchConversations();
    }
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation && !showAllMessages) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages, showAllMessages]);

  useEffect(() => {
    if (showAllMessages && userInfo.type === 'chair') {
      fetchAllDelegateMessages();
    }
  }, [showAllMessages, fetchAllDelegateMessages]);

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ParticipantRoute>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-soft-ivory via-linen to-champagne">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-16 top-28 h-64 w-64 rounded-full bg-deep-red/10 blur-3xl" />
          <div className="absolute bottom-16 right-10 h-72 w-72 rounded-full bg-dark-burgundy/15 blur-3xl" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-deep-red via-dark-burgundy to-rich-maroon text-white shadow-[0_25px_65px_-35px_rgba(112,30,30,0.7)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,235,221,0.18)_0%,_transparent_60%)]" />
            <div className="relative px-6 py-10 text-center sm:px-12">
              <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em]">
                  Diplomatic Messaging Hub
                </div>
                <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
                  Messages
                </h1>
                <p className="max-w-2xl text-base text-white/85 sm:text-lg">
                  Coordinate strategy, share intel, and keep your bloc aligned. Every thread stays synced across delegates and chairs.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="grid gap-6 lg:grid-cols-[320px,1fr]"
          >
            <div className="flex flex-col gap-5 rounded-[2.25rem] border border-white/40 bg-white/80 p-6 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-deep-red/15 text-deep-red">
                    <MessageCircle size={20} />
                  </span>
                  <div>
                    <p className="text-lg font-heading font-semibold text-deep-red">Conversations</p>
                    <p className="text-xs uppercase tracking-[0.35em] text-dark-burgundy/70">Your active threads</p>
                  </div>
                </div>
                <button
                  onClick={fetchConversations}
                  className="rounded-full border border-deep-red/30 bg-white px-3 py-2 text-deep-red transition hover:border-deep-red hover:bg-soft-rose/60"
                  disabled={loading}
                  data-testid="button-refresh-conversations"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dark-burgundy/30" size={18} />
                <input
                  type="text"
                  placeholder="Search conversations"
                  className="w-full rounded-full border border-soft-ivory/80 bg-soft-ivory/70 px-12 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-conversations"
                />
              </div>

              {userInfo.type === 'chair' && (
                <button
                  onClick={() => setShowAllMessages(!showAllMessages)}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    showAllMessages
                      ? 'border-deep-red bg-deep-red text-white shadow-[0_12px_30px_-20px_rgba(112,30,30,0.8)]'
                      : 'border-deep-red/30 bg-white text-deep-red hover:border-deep-red hover:bg-soft-rose/60'
                  }`}
                  data-testid="button-toggle-all-messages"
                >
                  <Users size={18} />
                  {showAllMessages ? 'Show My Conversations' : 'View all delegate messages'}
                </button>
              )}

              <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <motion.button
                      key={conversation.participantID}
                      onClick={() => {
                        setSelectedConversation(conversation.participantID);
                        setShowAllMessages(false);
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                        selectedConversation === conversation.participantID && !showAllMessages
                          ? 'border-deep-red bg-deep-red text-white shadow-[0_18px_35px_-25px_rgba(112,30,30,0.7)]'
                          : 'border-soft-ivory/80 bg-soft-ivory/60 text-almost-black-green hover:border-deep-red/40 hover:bg-soft-rose/50'
                      }`}
                      data-testid={`button-conversation-${conversation.participantID}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-deep-red">
                            {conversation.participantType === 'chair' ? <Crown size={16} /> : <User size={16} />}
                          </span>
                          <div>
                            <p className="font-semibold">{conversation.participantName}</p>
                            <p className="truncate text-xs text-dark-burgundy/70">{conversation.lastMessage}</p>
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-deep-red text-xs font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-soft-ivory/60 bg-soft-ivory/70 px-6 py-10 text-center text-dark-burgundy/60">
                    <MessageCircle size={36} />
                    <p className="text-sm font-semibold">No conversations yet</p>
                    <p className="text-xs">Start a thread from the Messages hub once your committee opens.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-[520px] flex-col overflow-hidden rounded-[2.25rem] border border-white/40 bg-white/85 shadow-[0_18px_45px_-30px_rgba(28,28,28,0.6)] backdrop-blur">
              {selectedConversation || showAllMessages ? (
                <>
                  <div className="flex items-center justify-between gap-3 border-b border-soft-ivory/70 bg-soft-ivory/60 px-6 py-5">
                    <div>
                      <p className="text-lg font-heading font-semibold text-deep-red">
                        {showAllMessages
                          ? 'All delegate messages'
                          : conversations.find((c) => c.participantID === selectedConversation)?.participantName || 'Messages'}
                      </p>
                      <p className="text-xs uppercase tracking-[0.35em] text-dark-burgundy/70">
                        {showAllMessages ? 'Chair overview' : 'Direct conversation'}
                      </p>
                    </div>
                    {!showAllMessages && (
                      <button
                        onClick={() => selectedConversation && fetchMessages(selectedConversation)}
                        className="rounded-full border border-deep-red/30 bg-white px-4 py-2 text-sm font-semibold text-deep-red transition hover:border-deep-red hover:bg-soft-rose/60"
                        disabled={loading}
                      >
                        Refresh thread
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <motion.div
                          key={message.messageID}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.04 }}
                          className={message.senderID === userInfo.id ? 'flex justify-end' : 'flex justify-start'}
                        >
                          <div
                            className={`max-w-[80%] rounded-3xl border px-5 py-4 text-sm shadow-sm ${
                              message.senderID === userInfo.id
                                ? 'border-deep-red bg-deep-red text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.9)]'
                                : 'border-soft-ivory/70 bg-soft-ivory text-almost-black-green'
                            }`}
                            data-testid={`message-${message.messageID}`}
                          >
                            {showAllMessages && (
                              <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-white/70">
                                {message.senderName} → {message.receiverName}
                              </p>
                            )}
                            <p className="leading-relaxed">{message.content}</p>
                            <p className={`mt-3 text-[11px] uppercase tracking-[0.3em] ${message.senderID === userInfo.id ? 'text-white/70' : 'text-dark-burgundy/60'}`}>
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center gap-3 rounded-3xl border border-soft-ivory/60 bg-soft-ivory/70 px-6 py-14 text-center text-dark-burgundy/60">
                        <MessageCircle size={42} />
                        <p className="text-sm font-semibold">
                          {showAllMessages ? 'No delegate messages found' : 'No messages yet. Start the conversation!'}
                        </p>
                      </div>
                    )}
                  </div>

                  {!showAllMessages && (
                    <div className="border-t border-soft-ivory/70 bg-white/80 px-6 py-5">
                      <div className="flex gap-4">
                        <input
                          type="text"
                          placeholder="Type your message"
                          className="flex-1 rounded-2xl border border-soft-ivory/70 bg-soft-ivory/70 px-4 py-3 text-sm text-almost-black-green transition focus:border-deep-red focus:bg-white focus:outline-none"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          data-testid="input-new-message"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-deep-red px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-28px_rgba(112,30,30,0.9)] transition hover:bg-dark-burgundy disabled:cursor-not-allowed disabled:bg-cool-grey"
                          data-testid="button-send-message"
                        >
                          <Send size={18} />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-dark-burgundy/70">
                  <div className="space-y-3">
                    <MessageCircle className="mx-auto h-14 w-14 text-dark-burgundy/60" />
                    <p className="text-lg font-heading font-semibold text-deep-red">Select a conversation</p>
                    <p className="text-sm text-dark-burgundy/70">Choose a participant on the left to begin messaging.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </ParticipantRoute>
  );
};

export default Messages;
