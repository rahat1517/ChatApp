const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let clients = new Map(); 

console.log("WebSocket server running on ws://localhost:8080");

server.on("connection", (socket) => {

    socket.on("message", (data) => {
        const message = JSON.parse(data);

        // New user joined
        if (message.type === "join") {
            clients.set(socket, message.username);

            broadcast({
                type: "notification",
                text: `${message.username} joined the chat`
            });
        }

        if (message.type === "message") {
            broadcast({
                type: "message",
                username: clients.get(socket),
                text: message.text
            });
        }
    });

    socket.on("close", () => {
        const username = clients.get(socket);
        clients.delete(socket);

        broadcast({
            type: "notification",
            text: `${username} left the chat`
        });
    });
});

function broadcast(data) {
    const message = JSON.stringify(data);

    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
