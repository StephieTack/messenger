"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', function (ws) {
    console.log('Client connected.');
    // Willkommensnachricht an den neu verbundenen Client senden
    ws.send(JSON.stringify({
        sender: 'Server',
        websocketMessageText: 'Welcome to the WebSocket server!!!',
    }));
    // Nachrichtenempfang und -verarbeitung
    ws.on('message', function (rawMessage) {
        console.log("Received message: ".concat(rawMessage));
        try {
            var parsedMessage = JSON.parse(rawMessage);
            // Beim Login-Event
            if (parsedMessage.type === 'login' && parsedMessage.username) {
                console.log("User logged in: ".concat(parsedMessage.username));
                // Nachricht an alle Clients senden, dass der Benutzer eingeloggt ist
                broadcastMessage('Server', "".concat(parsedMessage.username, " has logged in."));
                return;
            }
            // Alle anderen Nachrichten weiterleiten
            var sender = parsedMessage.sender;
            if (!sender) {
                console.error('Sender is not defined. Ignoring message.');
                return; // Ignoriere Nachricht ohne Sender
            }
            // Sende die Nachricht an alle Clients
            broadcastMessage(sender, parsedMessage.websocketMessageText || rawMessage);
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    // Client-Verbindung geschlossen
    ws.on('close', function () {
        console.log('Client disconnected.');
        broadcastMessage('Server', 'A user has disconnected.');
    });
    ws.on('error', function (error) {
        console.error("WebSocket error: ".concat(error));
    });
});
// Alle Clients mit einer Nachricht benachrichtigen
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
