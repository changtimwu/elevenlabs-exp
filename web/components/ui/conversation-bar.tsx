"use client"

import * as React from "react"
import {
  useConversationControls,
  useConversationInput,
  useConversationStatus,
} from "@elevenlabs/react"
import {
  ArrowUpIcon,
  ChevronDown,
  Keyboard,
  Mic,
  MicOff,
  PhoneIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LiveWaveform } from "@/components/ui/live-waveform"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export interface ConversationBarProps {
  /**
   * ElevenLabs Agent ID to connect to
   */
  agentId: string

  /**
   * Custom className for the container
   */
  className?: string

  /**
   * Custom className for the waveform
   */
  waveformClassName?: string

  /**
   * Callback when user sends a message
   */
  onSendMessage?: (message: string) => void

  /**
   * Text-only mode: no microphone or audio, the agent replies in text.
   * Typing a message while disconnected starts the session.
   */
  textOnly?: boolean

  /**
   * Label shown in the waveform area while disconnected
   */
  label?: string

  /**
   * Dynamic variables passed to the agent when the session starts
   */
  dynamicVariables?: Record<string, string | number | boolean>
}

export const ConversationBar = React.forwardRef<
  HTMLDivElement,
  ConversationBarProps
>((props, ref) => {
  const {
    agentId,
    className,
    waveformClassName,
    onSendMessage,
    textOnly = false,
    label = "Customer Support",
    dynamicVariables,
  } = props
  const { status } = useConversationStatus()
  const { startSession, endSession, sendUserMessage, sendContextualUpdate } =
    useConversationControls()
  const { isMuted, setMuted } = useConversationInput()
  const [keyboardToggled, setKeyboardOpen] = React.useState(false)
  const keyboardOpen = textOnly || keyboardToggled
  const [textInput, setTextInput] = React.useState("")
  const mediaStreamRef = React.useRef<MediaStream | null>(null)
  // A message typed before the text session connected, sent once it is up
  const pendingMessageRef = React.useRef<string | null>(null)

  const isConnected = status === "connected"

  const getMicStream = React.useCallback(async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaStreamRef.current = stream

    return stream
  }, [])

  const startConversation = React.useCallback(async () => {
    try {
      if (textOnly) {
        startSession({
          agentId,
          connectionType: "websocket",
          textOnly: true,
          stripAudioTags: true,
          dynamicVariables,
        })
        return
      }

      await getMicStream()

      startSession({
        agentId,
        connectionType: "webrtc",
        stripAudioTags: true,
        dynamicVariables,
      })
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }, [getMicStream, agentId, startSession, textOnly, dynamicVariables])

  const handleEndSession = React.useCallback(() => {
    endSession()

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
  }, [endSession])

  const toggleMute = React.useCallback(() => {
    setMuted(!isMuted)
  }, [isMuted, setMuted])

  const handleStartOrEnd = React.useCallback(() => {
    if (status === "connected" || status === "connecting") {
      handleEndSession()
    } else if (status === "disconnected" || status === "error") {
      startConversation()
    }
  }, [status, handleEndSession, startConversation])

  const handleSendText = React.useCallback(() => {
    if (!textInput.trim()) return

    const messageToSend = textInput
    if (isConnected) {
      sendUserMessage(messageToSend)
    } else if (textOnly) {
      pendingMessageRef.current = messageToSend
      if (status === "disconnected" || status === "error") startConversation()
    } else {
      return
    }
    setTextInput("")
    onSendMessage?.(messageToSend)
  }, [
    sendUserMessage,
    textInput,
    onSendMessage,
    isConnected,
    textOnly,
    status,
    startConversation,
  ])

  // Text mode needs no mic permission, so connect right away and let the
  // agent's greeting arrive before the user types
  const autoStartedRef = React.useRef(false)
  React.useEffect(() => {
    if (!textOnly || autoStartedRef.current || status !== "disconnected") return
    // Deferred so React Strict Mode's mount/unmount/mount only connects once
    const timer = setTimeout(() => {
      autoStartedRef.current = true
      startConversation()
    }, 0)
    return () => clearTimeout(timer)
  }, [textOnly, status, startConversation])

  React.useEffect(() => {
    if (isConnected && pendingMessageRef.current) {
      sendUserMessage(pendingMessageRef.current)
      pendingMessageRef.current = null
    }
  }, [isConnected, sendUserMessage])

  const handleTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setTextInput(value)

      if (value.trim() && isConnected) {
        sendContextualUpdate(value)
      }
    },
    [sendContextualUpdate, isConnected]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendText()
      }
    },
    [handleSendText]
  )

  React.useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn("flex w-full items-end justify-center p-4", className)}
    >
      <Card className="m-0 w-full gap-0 border p-0 shadow-lg">
        <div className="flex flex-col-reverse">
          <div>
            {keyboardOpen && <Separator />}
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="h-8 w-[120px] md:h-10">
                <div
                  className={cn(
                    "flex h-full items-center gap-2 rounded-md py-1",
                    "bg-foreground/5 text-foreground/70"
                  )}
                >
                  <div className="h-full flex-1">
                    <div
                      className={cn(
                        "relative flex h-full w-full shrink-0 items-center justify-center overflow-hidden rounded-sm",
                        waveformClassName
                      )}
                    >
                      <LiveWaveform
                        key={
                          status === "disconnected" || status === "error"
                            ? "idle"
                            : "active"
                        }
                        active={isConnected && !isMuted && !textOnly}
                        processing={status === "connecting"}
                        barWidth={3}
                        barGap={1}
                        barRadius={4}
                        fadeEdges={true}
                        fadeWidth={24}
                        sensitivity={1.8}
                        smoothingTimeConstant={0.85}
                        height={20}
                        mode="static"
                        className={cn(
                          "h-full w-full transition-opacity duration-300",
                          (status === "disconnected" ||
                            status === "error" ||
                            textOnly) &&
                            "opacity-0"
                        )}
                      />
                      {(status === "disconnected" ||
                        status === "error" ||
                        textOnly) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-foreground/50 text-[10px] font-medium">
                            {label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {!textOnly && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      aria-pressed={isMuted}
                      className={cn(isMuted ? "bg-foreground/5" : "")}
                      disabled={!isConnected}
                    >
                      {isMuted ? <MicOff /> : <Mic />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setKeyboardOpen((v) => !v)}
                      aria-pressed={keyboardOpen}
                      className="relative"
                      disabled={!isConnected}
                    >
                      <Keyboard
                        className={
                          "h-5 w-5 transform-gpu transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                          (keyboardOpen
                            ? "scale-75 opacity-0"
                            : "scale-100 opacity-100")
                        }
                      />
                      <ChevronDown
                        className={
                          "absolute inset-0 m-auto h-5 w-5 transform-gpu transition-all delay-50 duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] " +
                          (keyboardOpen
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0")
                        }
                      />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="mx-1 -my-2.5"
                    />
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={handleStartOrEnd}>
                  {isConnected || status === "connecting" ? (
                    <XIcon className="h-5 w-5" />
                  ) : (
                    <PhoneIcon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-out",
              keyboardOpen ? "max-h-[120px]" : "max-h-0"
            )}
          >
            <div className="relative px-2 pt-2 pb-2">
              <Textarea
                value={textInput}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter your message..."
                className="min-h-[100px] resize-none border-0 pr-12 shadow-none focus-visible:ring-0"
                disabled={!isConnected && !textOnly}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSendText}
                disabled={!textInput.trim() || (!isConnected && !textOnly)}
                className="absolute right-3 bottom-3 h-8 w-8"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
})

ConversationBar.displayName = "ConversationBar"
