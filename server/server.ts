// import * as WebSocket from 'ws'; // WebSocket-Modul importieren

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

import * as WebSocket from 'ws'; // WebSocket-Modul importieren

// WebSocket-Server initialisieren
const wss = new WebSocket.Server({ port: 8080 });

// Zuordnung von WebSocket-Verbindungen zu Benutzern
const userMap = new Map<WebSocket, string>(); // Speichert WebSocket-Verbindungen mit Benutzernamen

// Verbindungsevent behandeln
wss.on('connection', (ws) => {
  console.log('Client connected v two'); // Logge, wenn sich ein Client verbindet

  // Begrüßungsnachricht im JSON-Format senden
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!!!' }));

  // Nachricht vom Client empfangen
  ws.on('message', (message: string) => {
    try {
      const parsedMessage = JSON.parse(message); // Nachricht als JSON parsen

      if (parsedMessage.type === 'login' && parsedMessage.user) {
        // Benutzername speichern
        userMap.set(ws, parsedMessage.user.name);
        console.log(`User logged in: ${parsedMessage.user.name}`);
      } else if (parsedMessage.type === 'message') {
        // Nachricht loggen mit Benutzername (falls bekannt)
        const username = userMap.get(ws) || 'Unknown User';
        console.log(
          `Received message from test ${username}: ${parsedMessage.message}`
        );

        // Nachricht an alle verbundenen Clients senden (Broadcasting)
        broadcastMessage(username, parsedMessage.message);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Verbindungsevent behandeln
  ws.on('close', () => {
    const username = userMap.get(ws) || 'Unknown User';
    console.log(`Client disconnected: ${username}`);
    userMap.delete(ws); // Benutzer entfernen
  });

  // Fehler im Socket-Handling behandeln
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

// Nachricht an alle verbundenen Clients senden
function broadcastMessage(sender: string, message: string) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ sender, message })); // Nachricht mit Sender senden
    }
  });
}

// Server-Start-Log
console.log('WebSocket server is running on ws://localhost:8080');
