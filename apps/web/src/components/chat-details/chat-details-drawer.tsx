import { MessageSquare } from 'lucide-react';
import React, { useState, useRef } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CopyButton } from '@/components/ui/copy-button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useChatKitMessagesQuery } from '@/features/history/hooks/use-chatkit-messages.hook';
import { useIsRTL } from '@/hooks/use-is-rtl';
import { cn } from '@/utils/cn';

import { CallDetailsHeader } from '../call-details/header';

interface ChatDetailsDrawerProps {
  threadId: string | null;
  threadTitle: string;
  isOpen: boolean;
  onClose: () => void;
  widthClassName?: string;
}

const isArabicText = (text: string): boolean => {
  const arabicRegex =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

export const ChatDetailsDrawer: React.FC<ChatDetailsDrawerProps> = ({
  threadId,
  threadTitle,
  isOpen,
  onClose,
  widthClassName = 'lg:w-96 lg:max-w-[500px]',
}) => {
  const isRtl = useIsRTL();
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data: messagesData,
    isLoading,
    isError,
  } = useChatKitMessagesQuery(threadId || undefined);

  if (!threadId || !isOpen) return null;

  const messages = (messagesData?.data || []).filter(
    (m) => m.type === 'chatkit.user_message' || m.type === 'chatkit.assistant_message',
  );

  const getMessageText = (content: { type: string; text: string }[]) =>
    content.map((c) => c.text).join('');

  const filteredMessages = searchQuery
    ? messages.filter((m) =>
        getMessageText(m.content).toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : messages;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close drawer"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 z-50 h-[calc(100vh-58px)] border-l border-border bg-background shadow-xl transition-all duration-300 ease-in-out ${
          isRtl ? 'left-0 border-l-0 border-r' : 'right-0'
        } w-full ${widthClassName}`}
        dir="auto"
      >
        <div className="flex h-full flex-col">
          <CallDetailsHeader
            title={threadTitle}
            sessionId={threadId}
            onClose={onClose}
            isLoading={isLoading}
          />

          {/* Search */}
          <div className="flex items-center gap-4 px-6 py-2">
            <div className="flex-1">
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="mx-6 border-b border-border" />

          {/* Messages */}
          <div className="min-h-0 flex-1">
            {isLoading ? (
              <div className="space-y-6 p-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : isError ? (
              <div className="flex min-h-[200px] items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                  Failed to load messages
                </p>
              </div>
            ) : (
              <div ref={scrollRef} className="h-full overflow-y-auto p-6 pt-4">
                <div className="space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                          <MessageSquare className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          No messages
                        </h3>
                      </div>
                    </div>
                  ) : (
                    filteredMessages.map((message, index) => {
                      const isAssistant = message.type === 'chatkit.assistant_message';
                      const text = getMessageText(message.content);
                      const messageIsArabic = isArabicText(text);
                      const messageDirection = messageIsArabic ? 'rtl' : 'ltr';

                      return (
                        <div
                          key={message.id || index}
                          className="group/message flex gap-3"
                          dir="auto"
                        >
                          <div className="shrink-0">
                            <Avatar className="size-8">
                              <AvatarFallback
                                className={`text-xs font-semibold ${
                                  isAssistant
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-green-500 text-white'
                                }`}
                              >
                                {isAssistant ? 'A' : 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="relative flex-1 text-start">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">
                                {isAssistant ? 'AI Assistant' : 'User'}
                              </span>
                            </div>
                            <div
                              className={`relative overflow-hidden break-words rounded-lg p-3 ${
                                isAssistant
                                  ? 'border border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100'
                                  : 'border border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                              }`}
                              dir={messageDirection}
                            >
                              <p
                                className="break-words text-start text-sm leading-relaxed"
                                style={{ wordBreak: 'break-all' }}
                              >
                                {text}
                              </p>
                              <div
                                className={cn(
                                  'absolute top-2 transition-opacity duration-200',
                                  messageDirection === 'rtl'
                                    ? 'left-2'
                                    : 'right-2',
                                  'opacity-0 group-hover/message:opacity-100',
                                )}
                              >
                                <CopyButton
                                  text={text}
                                  size="sm"
                                  variant="ghost"
                                  className="size-7 bg-background/30 backdrop-blur-sm hover:bg-background/50"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
