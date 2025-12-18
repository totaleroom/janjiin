import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useAuthFetch } from "@/context/AuthContext";

interface Message {
    id: string;
    content: string;
    senderRole: "admin" | "business" | "customer";
    senderName: string;
    createdAt: string;
    isRead: boolean;
}

interface ChatWidgetProps {
    businessId: string;
    appointmentId?: string;
}

export function ChatWidget({ businessId, appointmentId }: ChatWidgetProps) {
    const { user, token } = useAuth();
    const authFetch = useAuthFetch();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch messages when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            fetchMessages();
            connectWebSocket();
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isOpen, isMinimized]);

    const connectWebSocket = () => {
        if (!token) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

        ws.onopen = () => {
            // Authenticate
            ws.send(JSON.stringify({ type: "auth", payload: { token } }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "new_message") {
                setMessages((prev) => [...prev, data.payload]);
                if (!isOpen || isMinimized) {
                    setUnreadCount((prev) => prev + 1);
                }
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        wsRef.current = ws;
    };

    const fetchMessages = async () => {
        try {
            const url = appointmentId
                ? `/api/businesses/${businessId}/messages?appointmentId=${appointmentId}`
                : `/api/businesses/${businessId}/messages`;

            const response = await authFetch(url);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);

                // Mark messages as read
                const unreadIds = data.filter((m: Message) => !m.isRead && m.senderRole !== user?.role).map((m: Message) => m.id);
                if (unreadIds.length > 0) {
                    await authFetch("/api/messages/read", {
                        method: "POST",
                        body: JSON.stringify({ messageIds: unreadIds }),
                    });
                }

                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isLoading) return;

        setIsLoading(true);
        try {
            const response = await authFetch(`/api/businesses/${businessId}/messages`, {
                method: "POST",
                body: JSON.stringify({
                    content: newMessage,
                    appointmentId,
                }),
            });

            if (response.ok) {
                const message = await response.json();
                setMessages((prev) => [...prev, message]);
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center z-50"
                >
                    <MessageCircle className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl z-50 overflow-hidden transition-all ${isMinimized ? "h-12" : "h-[450px]"
                        }`}
                >
                    {/* Header */}
                    <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
                        <span className="font-medium">Chat</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-white/20 p-1 rounded"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-white/20 p-1 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "340px" }}>
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Belum ada pesan</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.senderRole === user.role ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-2 ${message.senderRole === user.role
                                                        ? "bg-primary text-white"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {message.senderRole !== user.role && (
                                                    <p className="text-xs font-medium opacity-70 mb-1">
                                                        {message.senderName}
                                                    </p>
                                                )}
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-50 mt-1">
                                                    {new Date(message.createdAt).toLocaleTimeString("id-ID", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="border-t p-3 flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ketik pesan..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || isLoading}
                                    size="icon"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
