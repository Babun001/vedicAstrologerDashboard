import { io, Socket } from "socket.io-client";
import axiosInstanceClient from "./client.services";

let socket: Socket | null = null;

// Strip the trailing /api since Socket.IO connects to the server root,
// not the REST API path.
const getSocketBaseUrl = () => {
    const apiBase = axiosInstanceClient.defaults.baseURL || "";
    return apiBase.replace(/\/api\/?$/, "");
};

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(getSocketBaseUrl(), {
            transports: ["websocket", "polling"],
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};