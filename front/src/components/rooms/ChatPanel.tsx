import { MessageCircle, Send, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { getMessagesApiV1RoomsRoomIdMessagesGet, sendMessageApiV1RoomsRoomIdMessagesPost } from "@/api/generated"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  username: string
  message: string
  created_at: string
}

interface ChatPanelProps {
  roomId: string
  currentUserId: string
}

export function ChatPanel({ roomId, currentUserId }: ChatPanelProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const lastMessageIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      const params: Record<string, string | number> = { limit: 50 }
      if (lastMessageIdRef.current) {
        params.after_id = lastMessageIdRef.current
      }
      const newMessages = await getMessagesApiV1RoomsRoomIdMessagesGet(
        { room_id: roomId },
        params as Record<string, string | number>,
      ) as ChatMessage[]
      if (newMessages.length > 0) {
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id
        if (lastMessageIdRef.current && messages.length > 0) {
          // Incremental update
          setMessages((prev) => [...prev, ...newMessages])
          if (!isOpen) {
            setUnreadCount((prev) => prev + newMessages.length)
          }
        } else {
          // Initial load
          setMessages(newMessages)
        }
        if (isOpen) {
          setTimeout(scrollToBottom, 50)
        }
      }
    } catch {
      // Silently fail on polling errors
    }
  }, [roomId, isOpen, messages.length, scrollToBottom])

  // Start polling
  useEffect(() => {
    fetchMessages()
    pollIntervalRef.current = setInterval(fetchMessages, 2000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchMessages])

  // Scroll to bottom when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(scrollToBottom, 100)
    }
  }, [isOpen, scrollToBottom])

  const handleSend = async () => {
    const trimmed = newMessage.trim()
    if (!trimmed || isSending) return
    setIsSending(true)
    try {
      await sendMessageApiV1RoomsRoomIdMessagesPost({ room_id: roomId }, { message: trimmed })
      setNewMessage("")
      // Immediately fetch to show the sent message
      await fetchMessages()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/90 p-4 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-sm animate-scale-in">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex w-80 flex-col glass rounded-2xl shadow-2xl shadow-black/10 sm:w-96 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">{t("chat.title")}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-xl p-1.5 text-muted-foreground hover:text-foreground hover:bg-glow transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "320px", minHeight: "200px" }}>
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">{t("chat.noMessages")}</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId
            return (
              <div key={msg.id} className={cn("flex flex-col animate-slide-up", isOwn ? "items-end" : "items-start")}>
                {!isOwn && (
                  <span className="mb-0.5 text-[10px] font-semibold text-muted-foreground">{msg.username}</span>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm break-words",
                    isOwn
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
                      : "bg-muted/60",
                  )}
                >
                  {msg.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat.placeholder")}
            maxLength={500}
            className="flex-1 rounded-xl border border-border/50 bg-background/80 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all duration-200"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !newMessage.trim()}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/90 p-2.5 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
