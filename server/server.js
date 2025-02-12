"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var wss = new WebSocket.Server({ port: 8080 });
var userMap = new Map();
wss.on('connection', function (ws) {
    console.log('Client connected.');
    ws.send(JSON.stringify({
        sender: 'Server',
        websocketMessageText: 'Welcome to the WebSocket server!!!',
    }));
    ws.on('message', function (rawMessage) {
        console.log("Received message: ".concat(rawMessage));
        try {
            var parsedMessage = JSON.parse(rawMessage);
            if (parsedMessage.type === 'login' && parsedMessage.username) {
                userMap.set(ws, parsedMessage.username);
                console.log("User logged in: ".concat(parsedMessage.username));
                broadcastMessage('Server', "".concat(parsedMessage.username, " has logged in."));
                return;
            }
            var sender = userMap.get(ws);
            if (!sender) {
                console.error('Sender not found in userMap. Ignoring message.');
                return; // Nachricht ignorieren, wenn Benutzer nicht gefunden
            }
            broadcastMessage(sender, parsedMessage.websocketMessageText || rawMessage);
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    ws.on('close', function () {
        var username = userMap.get(ws) || 'Unknown User';
        console.log("Client disconnected: ".concat(username));
        userMap.delete(ws);
        broadcastMessage('Server', "".concat(username, " has disconnected."));
    });
    ws.on('error', function (error) {
        console.error("WebSocket error: ".concat(error));
    });
});
function broadcastMessage(sender, message) {
    var formattedMessage = JSON.stringify({
        sender: sender,
        websocketMessageText: message,
    });
    wss.clients.forEach(function (client) {
        client.send(formattedMessage);
    });
}
console.log('WebSocket server is running on ws://localhost:8080');
