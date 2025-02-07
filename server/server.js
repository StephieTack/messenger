"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws"); // WebSocket-Modul importieren
// WebSocket-Server initialisieren
var wss = new WebSocket.Server({ port: 8080 });
// Zuordnung von WebSocket-Verbindungen zu Benutzern
var userMap = new Map(); // Speichert WebSocket-Verbindungen mit Benutzernamen
// Verbindungsevent behandeln
wss.on('connection', function (ws) {
    console.log('Client connected'); // Logge, wenn sich ein Client verbindet
    // Begrüßungsnachricht im JSON-Format senden
    ws.send(JSON.stringify({
        sender: 'Server',
        message: 'Welcome to the WebSocket server!!!',
    }));
    // Nachricht vom Client empfangen
    ws.on('message', function (rawMessage) {
        console.log("Received message: ".concat(rawMessage)); // Logge die empfangene Nachricht
        try {
            // Eingehende Nachricht parsen (z.B. Benutzername einrichten)
            var parsedMessage = JSON.parse(rawMessage);
            if (parsedMessage.type === 'login' && parsedMessage.username) {
                userMap.set(ws, parsedMessage.username); // Benutzername speichern
                console.log("User logged in: ".concat(parsedMessage.username));
                broadcastMessage(parsedMessage.username, // Der tatsächliche Benutzername als Absender
                "".concat(parsedMessage.username, " has joined the chat."));
                return;
            }
            // Nachricht an alle verbundenen Clients senden (Broadcasting)
            var sender = userMap.get(ws) || 'Unknown User';
            broadcastMessage(sender, parsedMessage.message || rawMessage, ws); // Inhalt weiterleiten
        }
        catch (error) {
            console.error('Error parsing message:', error);
        }
    });
    // Verbindungsevent behandeln
    ws.on('close', function () {
        var username = userMap.get(ws) || 'Unknown User';
        console.log("Client disconnected: ".concat(username));
        userMap.delete(ws); // Benutzer entfernen
        broadcastMessage(username, // Der tatsächliche Benutzername als Absender
        "".concat(username, " has left the chat."));
    });
    // Fehler im Socket-Handling behandeln
    ws.on('error', function (error) {
        console.error("WebSocket error: ".concat(error));
    });
});
// Nachricht an alle verbundenen Clients senden
function broadcastMessage(sender, message, excludeWs) {
    var formattedMessage = JSON.stringify({ sender: sender, message: message }); // Nachricht formatieren
    wss.clients.forEach(function (client) {
        // Nachricht nicht an den Absender zurücksenden
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
            client.send(formattedMessage); // Serialisierte Nachricht senden
        }
    });
}
// Server-Start-Log
console.log('WebSocket server is running on ws://localhost:8080');
