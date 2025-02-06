import * as WebSocket from 'ws'; // WebSocket-Modul importieren

// WebSocket-Server initialisieren
const wss = new WebSocket.Server({ port: 8080 });

// Verbindungsevent behandeln
wss.on('connection', (ws) => {
  console.log('Client connected'); // Logge, wenn sich ein Client verbindet

  // Begrüßungsnachricht im JSON-Format senden
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!!!' }));

  // Nachricht vom Client empfangen
  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`); // Logge die empfangene Nachricht

    // Nachricht an alle verbundenen Clients senden
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // Nachricht im JSON-Format senden
        client.send(JSON.stringify({ message: `Server received: ${message}` }));
      }
    });
  });
});

// Server-Start-Log
console.log('WebSocket server is running on ws://localhost:8080');
