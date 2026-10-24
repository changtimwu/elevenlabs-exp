"use client"

import { useState } from "react"
import {
  ConversationProvider,
  useConversation,
  useConversationClientTool,
} from "@elevenlabs/react"
import { CheckIcon, CopyIcon, SirenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ui/conversation"
import { ConversationBar } from "@/components/ui/conversation-bar"
import { Message, MessageContent } from "@/components/ui/message"
import { Orb } from "@/components/ui/orb"
import { Response } from "@/components/ui/response"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ChatMessage {
  /** "event" = an action the agent took through a client tool */
  role: "user" | "assistant" | "event"
  content: string
}

export interface VoiceChatProps {
  agentId: string
  /** Text-only mode: type to chat, the agent replies in text without audio */
  textOnly?: boolean
  /** Shown in the conversation bar while idle */
  label?: string
  emptyTitle?: string
  emptyDescription?: string
  /** Values for {{placeholders}} in the agent's first message and prompt */
  dynamicVariables?: Record<string, string | number | boolean>
}

export function VoiceChat(props: VoiceChatProps) {
  return (
    <ConversationProvider>
      <VoiceChat03 {...props} />
    </ConversationProvider>
  )
}

function VoiceChat03({
  agentId,
  textOnly = false,
  label,
  emptyTitle = "Start a conversation",
  emptyDescription = "Tap the phone button or type a message",
  dynamicVariables,
}: VoiceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const addEvent = (content: string) =>
    setMessages((prev) => [...prev, { role: "event", content }])

  // Client tools of the Health Alert Responder. This demo only shows them in the
  // transcript; a real deployment would dispatch 119 / message the contact here.
  useConversationClientTool(
    "request_ambulance",
    (params: { reason?: string; location?: string }) => {
      addEvent(
        `已通報 119 請求救護車（示範模擬，未實際撥打）\n原因：${params.reason ?? ""}\n地點：${params.location ?? ""}`
      )
      return "已送出"
    }
  )
  useConversationClientTool(
    "notify_emergency_contact",
    (params: { message?: string; urgency?: string }) => {
      addEvent(
        `已通知緊急聯絡人（示範模擬，${params.urgency ?? ""}）\n「${params.message ?? ""}」`
      )
      return "已送出"
    }
  )

  // The transcript is kept after hanging up so it can still be read; the parent
  // remounts this component (via `key`) to start fresh.
  useConversation({
    onMessage: (message) => {
      if (message.message) {
        const newMessage: ChatMessage = {
          role: message.source === "user" ? "user" : "assistant",
          content: message.message,
        }
        setMessages((prev) => [...prev, newMessage])
      }
    },
  })

  return (
    <div className="relative mx-auto h-[600px] w-full">
      <Card className="flex h-full w-full flex-col gap-0 overflow-hidden">
        <CardContent className="relative flex-1 overflow-hidden p-0">
          <Conversation className="absolute inset-0 pb-[88px]">
            <ConversationContent className="flex min-w-0 flex-col gap-2 p-6 pb-6">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<Orb className="size-12" />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                messages.map((message, index) => {
                  if (message.role === "event") {
                    return (
                      <div
                        key={index}
                        role="status"
                        className="flex gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm whitespace-pre-wrap text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
                      >
                        <SirenIcon className="mt-0.5 size-4 shrink-0" />
                        <span>{message.content}</span>
                      </div>
                    )
                  }
                  return (
                    <div key={index} className="flex w-full flex-col gap-1">
                      <Message from={message.role}>
                        <MessageContent className="max-w-full min-w-0">
                          <Response className="w-auto [overflow-wrap:anywhere] whitespace-pre-wrap">
                            {message.content}
                          </Response>
                        </MessageContent>
                        {message.role === "assistant" && (
                          <div className="ring-border size-6 flex-shrink-0 self-end overflow-hidden rounded-full ring-1">
                            <Orb className="h-full w-full" />
                          </div>
                        )}
                      </Message>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    className={cn(
                                      "text-muted-foreground hover:text-foreground relative size-9 p-1.5"
                                    )}
                                    size="sm"
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        message.content
                                      )
                                      setCopiedIndex(index)
                                      setTimeout(
                                        () => setCopiedIndex(null),
                                        2000
                                      )
                                    }}
                                  />
                                }
                              >
                                {copiedIndex === index ? (
                                  <CheckIcon className="size-4" />
                                ) : (
                                  <CopyIcon className="size-4" />
                                )}
                                <span className="sr-only">
                                  {copiedIndex === index ? "Copied!" : "Copy"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {copiedIndex === index ? "Copied!" : "Copy"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </ConversationContent>
            <ConversationScrollButton className="bottom-[100px]" />
          </Conversation>
          <div className="absolute right-0 bottom-0 left-0 flex justify-center">
            <ConversationBar
              className="w-full max-w-2xl"
              agentId={agentId}
              textOnly={textOnly}
              label={label}
              dynamicVariables={dynamicVariables}
              onSendMessage={(message) => {
                const userMessage: ChatMessage = {
                  role: "user",
                  content: message,
                }
                setMessages((prev) => [...prev, userMessage])
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
