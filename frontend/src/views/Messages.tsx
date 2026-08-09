/* ========================================
   Creata - Messages / Chat View
   ======================================== */

import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareText, Send, Lock, Unlock,
  MessagesSquare, Search, Clock
} from 'lucide-react';
import { useAuth, useConversations, useMessages, useSendMessage } from '../hooks';
import { api } from '../services/api';
import { useToastStore } from '../stores';
import { Avatar, Badge, Button, Skeleton, Textarea } from '../components/ui';
import type { Message, User } from '../types';
import './Messages.css';

/* ---------- Helpers ---------- */

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function formatConversationTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

/** Deriva el "otro usuario" de la conversación desde los mensajes cargados. */
function deriveOtherUser(messages: Message[] | undefined, currentUserId?: string): User | null {
  if (!messages || messages.length === 0) return null;
  const other = messages.find((m) => m.senderId !== currentUserId);
  if (other) return other.sender as unknown as User;
  return messages[0].receiver as unknown as User;
}

/* ---------- Component ---------- */

export function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryUserId = searchParams.get('user');
  const [activeUserId, setActiveUserId] = useState<string | null>(queryUserId);
  const [draft, setDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { data: messages, isLoading: messagesLoading } = useMessages(activeUserId || '');
  const sendMessage = useSendMessage();

  const unlockMutation = useMutation({
    mutationFn: (messageId: string) => api.unlockMessage(messageId),
    onSuccess: () => {
      if (activeUserId) queryClient.invalidateQueries({ queryKey: ['messages', activeUserId] });
      addToast({ type: 'success', title: 'Mensaje desbloqueado' });
    },
    onError: (error: Error) => {
      addToast({ type: 'error', title: 'Error', message: error.message });
    },
  });

  // Mantener selección en sincronía con la URL (?user=id) — permite enlaces
  // directos desde Pedidos/Suscriptores y compartir la conversación.
  useEffect(() => {
    if (queryUserId) setActiveUserId(queryUserId);
  }, [queryUserId]);

  // Auto-scroll al último mensaje al abrir/recibir.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, activeUserId]);

  const selectConversation = (userId: string) => {
    setActiveUserId(userId);
    setSearchParams({ user: userId }, { replace: true });
  };

  const sendDraft = () => {
    const content = draft.trim();
    if (!content || !activeUserId) return;
    sendMessage.mutate(
      { receiverId: activeUserId, content },
      { onSuccess: () => setDraft('') }
    );
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    sendDraft();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendDraft();
    }
  };

  const activeConversation = conversations?.find((c) => c.user.id === activeUserId);
  const otherUser = activeConversation?.user ?? deriveOtherUser(messages, user?.id);

  const filteredConversations = conversations?.filter((conv) =>
    conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="messages">
      <div className="messages__layout">
        {/* ======== Lista de conversaciones ======== */}
        <aside
          className={`messages__list ${activeUserId ? 'messages__list--hidden-mobile' : ''}`}
          aria-label="Conversaciones"
        >
          <header className="messages__list-header">
            <h2 className="messages__title">
              <MessageSquareText size={18} aria-hidden="true" />
              Mensajes
            </h2>
          </header>

          <div className="messages__search">
            <Search size={14} className="messages__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="messages__search-input"
              placeholder="Buscar conversación..."
              aria-label="Buscar conversación"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="messages__list-body">
            {conversationsLoading ? (
              <div className="messages__conv-skeleton">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="messages__conv-skeleton-row" key={i}>
                    <Skeleton variant="circle" width={40} height={40} />
                    <div className="messages__conv-skeleton-text">
                      <Skeleton width="60%" height={14} />
                      <Skeleton width="85%" height={12} />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations && conversations.length > 0 ? (
              filteredConversations && filteredConversations.length > 0 ? (
              <ul className="messages__conversations">
                {filteredConversations.map((conv) => {
                  const isActive = conv.user.id === activeUserId;
                  return (
                    <li key={conv.user.id}>
                      <button
                        type="button"
                        className={`messages__conv ${isActive ? 'messages__conv--active' : ''}`}
                        onClick={() => selectConversation(conv.user.id)}
                      >
                        <Avatar src={conv.user.avatar} name={conv.user.username} size="md" />
                        <div className="messages__conv-info">
                          <div className="messages__conv-top">
                            <span className="messages__conv-name">@{conv.user.username}</span>
                            <span className="messages__conv-time">
                              {formatConversationTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="messages__conv-bottom">
                            <span className="messages__conv-preview">
                              {conv.lastMessage.content}
                            </span>
                            {conv.unreadCount > 0 && (
                              <Badge variant="primary" size="sm" className="messages__unread">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              ) : (
                <div className="messages__empty-list">
                  <div className="messages__empty-list-icon">
                    <Search size={24} aria-hidden="true" />
                  </div>
                  <p className="messages__empty-list-title">Sin resultados</p>
                  <p className="messages__empty-list-text">
                    No se encontraron conversaciones para "{searchTerm}".
                  </p>
                </div>
              )
            ) : (
              <div className="messages__empty-list">
                <div className="messages__empty-list-icon">
                  <MessagesSquare size={24} aria-hidden="true" />
                </div>
                <p className="messages__empty-list-title">Sin conversaciones</p>
                <p className="messages__empty-list-text">
                  Cuando un usuario te escriba, aparecerá aquí.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ======== Hilo de conversación ======== */}
        <section
          className={`messages__thread ${!activeUserId ? 'messages__thread--hidden-mobile' : ''}`}
          aria-label="Conversación"
        >
          {activeUserId ? (
            <>
              <header className="messages__thread-header">
                {otherUser ? (
                  <>
                    <Avatar src={otherUser.avatar} name={otherUser.username} size="sm" />
                    <div className="messages__thread-user">
                      <h3 className="messages__thread-name">@{otherUser.username}</h3>
                      <span className="messages__thread-status">
                        {otherUser.role === 'creator' ? 'Creador' : 'Suscriptor'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="messages__thread-user">
                    <h3 className="messages__thread-name">Conversación</h3>
                  </div>
                )}
              </header>

              <div className="messages__thread-body" ref={threadRef}>
                {messagesLoading ? (
                  <div className="messages__bubble-skeleton">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`messages__bubble-skeleton-row ${
                          i % 2 === 0 ? 'messages__bubble-skeleton-row--own' : ''
                        }`}
                      >
                        <Skeleton
                          width={i % 2 === 0 ? '50%' : '60%'}
                          height={40}
                          variant="text"
                        />
                      </div>
                    ))}
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="messages__list-msgs">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      const isLocked = msg.isPaid && !msg.isUnlocked && !isOwn;
                      return (
                        <div
                          key={msg.id}
                          className={`messages__row ${isOwn ? 'messages__row--own' : ''}`}
                        >
                          {!isOwn && (
                            <Avatar
                              src={msg.sender?.avatar}
                              name={msg.sender?.username}
                              size="xs"
                            />
                          )}
                          <div
                            className={`messages__bubble ${
                              isOwn ? 'messages__bubble--own' : 'messages__bubble--other'
                            } ${isLocked ? 'messages__bubble--locked' : ''}`}
                          >
                            {isLocked ? (
                              <div className="messages__locked">
                                <div className="messages__locked-icon">
                                  <Lock size={16} aria-hidden="true" />
                                </div>
                                <div className="messages__locked-info">
                                  <span className="messages__locked-title">Mensaje privado</span>
                                  <span className="messages__locked-price">
                                    ${msg.price.toFixed(2)} para desbloquear
                                  </span>
                                </div>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  leftIcon={<Unlock size={14} aria-hidden="true" />}
                                  onClick={() => unlockMutation.mutate(msg.id)}
                                  isLoading={
                                    unlockMutation.isPending &&
                                    unlockMutation.variables === msg.id
                                  }
                                >
                                  Desbloquear
                                </Button>
                              </div>
                            ) : (
                              <>
                                {msg.isPaid && (
                                  <span className="messages__paid-tag">
                                    <Lock size={10} aria-hidden="true" /> Pagado
                                  </span>
                                )}
                                <p className="messages__text">{msg.content}</p>
                                <span className="messages__time">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="messages__empty-thread">
                    <div className="messages__empty-thread-icon">
                      <Clock size={24} aria-hidden="true" />
                    </div>
                    <p className="messages__empty-thread-title">Inicia la conversación</p>
                    <p className="messages__empty-thread-text">
                      Envía el primer mensaje a este usuario.
                    </p>
                  </div>
                )}
              </div>

              <form className="messages__compose" onSubmit={handleSend}>
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje... (Enter para enviar)"
                  rows={1}
                  aria-label="Mensaje"
                />
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Send size={16} aria-hidden="true" />}
                  disabled={!draft.trim() || sendMessage.isPending}
                  isLoading={sendMessage.isPending}
                  className="messages__compose-btn"
                >
                  Enviar
                </Button>
              </form>
            </>
          ) : (
            <div className="messages__no-selection">
              <div className="messages__no-selection-icon">
                <MessagesSquare size={32} aria-hidden="true" />
              </div>
              <p className="messages__no-selection-title">Selecciona una conversación</p>
              <p className="messages__no-selection-text">
                Elige un chat de la lista para ver y enviar mensajes.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
