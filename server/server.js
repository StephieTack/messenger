"use strict";
// import * as WebSocket from 'ws'; // WebSocket-Modul importieren
Object.defineProperty(exports, "__esModule", { value: true });
// // WebSocket-Server initialisieren
// const wss = new WebSocket.Server({ port: 8080 });
// // Liste der verbundenen Clients speichern
// const clients = new Set<WebSocket>();
// wss.onopen = () => {
//   console.log('WebSocket connection established');
//   wss.send(JSON.stringify({ type: 'login', user: { name: 'John Doe' } })); // Sende Login-Nachricht
// };
// // Verbindungsevent behandeln
// wss.on('connection', (ws) => {
//   console.log('Client connected'); // Logge, wenn sich ein Client verbindet
//   clients.add(ws); // Client zur Liste hinzufügen
//   // Begrüßungsnachricht im JSON-Format senden
//   ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!!!' }));
//   // Nachricht vom Client empfangen
//   ws.on('message', (message: string) => {
//     console.log(`Received message: ${message}`); // Logge die empfangene Nachricht
//     // Nachricht an alle verbundenen Clients senden (Broadcasting)
//     for (const client of clients) {
//       // if (client !== ws && client.readyState === WebSocket.OPEN) {
//       if (client.readyState === WebSocket.OPEN) {
//         try {
//           client.send(message); // Nachricht weiterleiten
//           console.log('Sending following from server.ts:', message);
//         } catch (error) {
//           console.error(`Error sending message: ${error}`);
//         }
//       }
//     }
//   });
//   // Verbindungsevent behandeln
//   ws.on('close', () => {
//     console.log('Client disconnected'); // Logge die Trennung
//     clients.delete(ws); // Client aus der Liste entfernen
//   });
//   // Fehler im Socket-Handling behandeln
//   ws.on('error', (error) => {
//     console.error(`WebSocket error: ${error}`); // Logge den Fehler
//   });
// });
// // Server-Start-Log
// console.log('WebSocket server is running on ws://localhost:8080');
var WebSocket = require("ws"); // WebSocket-Modul importieren
// WebSocket-Server initialisieren
var wss = new WebSocket.Server({ port: 8080 });
// Zuordnung von WebSocket-Verbindungen zu Benutzern
var userMap = new Map(); // Speichert WebSocket-Verbindungen mit Benutzernamen
// Verbindungsevent behandeln
wss.on('connection', function (ws) {
    console.log('Client connected'); // Logge, wenn sich ein Client verbindet
    // Begrüßungsnachricht im JSON-Format senden
    ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!!!' }));
    // Nachricht vom Client empfangen
    ws.on('message', function (message) {
        console.log("Received message: ".concat(message)); // Logge die empfangene Nachricht
        // Nachricht an alle verbundenen Clients senden (Broadcasting)
        broadcastMessage('Server', message); // Sende die Nachricht an alle Clients
    });
    // Verbindungsevent behandeln
    ws.on('close', function () {
        var username = userMap.get(ws) || 'Unknown User';
        console.log("Client disconnected: ".concat(username));
        userMap.delete(ws); // Benutzer entfernen
    });
    // Fehler im Socket-Handling behandeln
    ws.on('error', function (error) {
        console.error("WebSocket error: ".concat(error));
    });
});
// Nachricht an alle verbundenen Clients senden
function broadcastMessage(sender, message) {
    wss.clients.forEach(function (client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ sender: sender, message: message })); // Nachricht mit Sender senden
        }
    });
}
// Server-Start-Log
console.log('WebSocket server is running on ws://localhost:8080');
