"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var wss = new WebSocket.Server({ port: 8080 });
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
            if (parsedMessage.type === 'login' && parsedMessage.sender) {
                console.log("User logged in: ".concat(parsedMessage.sender));
                broadcastMessage('Server', "".concat(parsedMessage.sender, " has logged in."));
                return;
            }
            var sender = parsedMessage.sender;
            if (!sender) {
                console.error('Sender is not defined. Ignoring message.');
                return;
            }
            broadcastMessage(sender, parsedMessage.websocketMessageText || rawMessage);
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    ws.on('close', function () {
        console.log('Client disconnected.');
        // broadcastMessage('Server', 'A user has disconnected.');
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
        if (client.readyState === WebSocket.OPEN) {
            client.send(formattedMessage);
        }
    });
}
console.log('WebSocket server is running on ws://localhost:8080');
