import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { verifyToken, type TokenPayload } from "./auth";
import { storage } from "./storage";

interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    businessId?: string;
    role?: string;
    isAlive?: boolean;
}

interface WSMessage {
    type: "auth" | "message" | "typing" | "read";
    payload: any;
}

// Store active connections by businessId
const businessConnections = new Map<string, Set<ExtendedWebSocket>>();
const customerConnections = new Map<string, ExtendedWebSocket>();

export function setupWebSocket(server: Server) {
    const wss = new WebSocketServer({ server, path: "/ws" });

    // Heartbeat interval
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            const extWs = ws as ExtendedWebSocket;
            if (extWs.isAlive === false) {
                return ws.terminate();
            }
            extWs.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => {
        clearInterval(heartbeatInterval);
    });

    wss.on("connection", (ws: ExtendedWebSocket) => {
        ws.isAlive = true;

        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("message", async (data) => {
            try {
                const message: WSMessage = JSON.parse(data.toString());

                switch (message.type) {
                    case "auth":
                        await handleAuth(ws, message.payload);
                        break;
                    case "message":
                        await handleMessage(ws, message.payload);
                        break;
                    case "typing":
                        handleTyping(ws, message.payload);
                        break;
                    case "read":
                        await handleRead(ws, message.payload);
                        break;
                }
            } catch (error) {
                console.error("WebSocket message error:", error);
                ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid message format" } }));
            }
        });

        ws.on("close", () => {
            // Remove from connections
            if (ws.businessId && ws.role === "business") {
                const connections = businessConnections.get(ws.businessId);
                if (connections) {
                    connections.delete(ws);
                    if (connections.size === 0) {
                        businessConnections.delete(ws.businessId);
                    }
                }
            } else if (ws.userId) {
                customerConnections.delete(ws.userId);
            }
        });
    });

    return wss;
}

async function handleAuth(ws: ExtendedWebSocket, payload: { token: string }) {
    try {
        const decoded = verifyToken(payload.token);
        ws.userId = decoded.userId;
        ws.role = decoded.role;

        if (decoded.role === "business" && decoded.businessId) {
            ws.businessId = decoded.businessId;

            // Add to business connections
            if (!businessConnections.has(decoded.businessId)) {
                businessConnections.set(decoded.businessId, new Set());
            }
            businessConnections.get(decoded.businessId)!.add(ws);
        } else {
            // Customer connection
            customerConnections.set(decoded.userId, ws);
        }

        ws.send(JSON.stringify({
            type: "auth_success",
            payload: { userId: decoded.userId, role: decoded.role }
        }));
    } catch (error) {
        ws.send(JSON.stringify({ type: "auth_error", payload: { message: "Invalid token" } }));
        ws.close();
    }
}

async function handleMessage(ws: ExtendedWebSocket, payload: {
    businessId: string;
    content: string;
    appointmentId?: string;
}) {
    if (!ws.userId) {
        ws.send(JSON.stringify({ type: "error", payload: { message: "Not authenticated" } }));
        return;
    }

    // Save message to database
    const message = await storage.createMessage({
        businessId: payload.businessId,
        appointmentId: payload.appointmentId || null,
        senderId: ws.userId,
        senderRole: ws.role as "admin" | "business" | "customer",
        senderName: "User", // Should be fetched from user data
        content: payload.content,
    });

    // Broadcast to business
    const businessWs = businessConnections.get(payload.businessId);
    if (businessWs) {
        businessWs.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "new_message", payload: message }));
            }
        });
    }

    // If sender is business, send to customer
    if (ws.role === "business" && payload.appointmentId) {
        // Find customer by appointment and send message
        // This would require looking up the customer's WebSocket connection
    }

    ws.send(JSON.stringify({ type: "message_sent", payload: message }));
}

function handleTyping(ws: ExtendedWebSocket, payload: { businessId: string; isTyping: boolean }) {
    if (!ws.userId) return;

    const businessWs = businessConnections.get(payload.businessId);
    if (businessWs) {
        businessWs.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "typing",
                    payload: { userId: ws.userId, isTyping: payload.isTyping }
                }));
            }
        });
    }
}

async function handleRead(ws: ExtendedWebSocket, payload: { messageIds: string[] }) {
    if (!ws.userId) return;

    await storage.markMessagesAsRead(payload.messageIds);

    // Notify sender that messages were read
    ws.send(JSON.stringify({ type: "messages_read", payload: { messageIds: payload.messageIds } }));
}

// Utility function to send notification to specific business
export function notifyBusiness(businessId: string, notification: any) {
    const connections = businessConnections.get(businessId);
    if (connections) {
        connections.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "notification", payload: notification }));
            }
        });
    }
}

// Utility function to send notification to specific customer
export function notifyCustomer(customerId: string, notification: any) {
    const ws = customerConnections.get(customerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "notification", payload: notification }));
    }
}
