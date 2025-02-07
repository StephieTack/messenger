import * as WebSocket from 'ws'; // WebSocket-Modul importieren

// WebSocket-Server initialisieren
const wss = new WebSocket.Server({ port: 8080 });

// Zuordnung von WebSocket-Verbindungen zu Benutzern
const userMap = new Map<WebSocket, string>(); // Speichert WebSocket-Verbindungen mit Benutzernamen

// Verbindungsevent behandeln
wss.on('connection', (ws) => {
  console.log('Client connected'); // Logge, wenn sich ein Client verbindet

  // Begrüßungsnachricht im JSON-Format senden
  ws.send(
    JSON.stringify({
      sender: 'Server',
      message: 'Welcome to the WebSocket server!!!',
    })
  );

  // Nachricht vom Client empfangen
  ws.on('message', (rawMessage: string) => {
    console.log(`Received message: ${rawMessage}`); // Logge die empfangene Nachricht

    try {
      // Eingehende Nachricht parsen (z.B. Benutzername einrichten)
      const parsedMessage = JSON.parse(rawMessage);

      if (parsedMessage.type === 'login' && parsedMessage.username) {
        userMap.set(ws, parsedMessage.username); // Benutzername speichern
        console.log(`User logged in: ${parsedMessage.username}`);
        broadcastMessage(
          parsedMessage.username, // Der tatsächliche Benutzername als Absender
          `${parsedMessage.username} has joined the chat.`
        );
        return;
      }

      // Nachricht an alle verbundenen Clients senden (Broadcasting)
      const sender = userMap.get(ws) || 'Unknown User';
      broadcastMessage(sender, parsedMessage.message || rawMessage, ws); // Inhalt weiterleiten
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Verbindungsevent behandeln
  ws.on('close', () => {
    const username = userMap.get(ws) || 'Unknown User';
    console.log(`Client disconnected: ${username}`);
    userMap.delete(ws); // Benutzer entfernen
    broadcastMessage(
      username, // Der tatsächliche Benutzername als Absender
      `${username} has left the chat.`
    );
  });

  // Fehler im Socket-Handling behandeln
  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

// Nachricht an alle verbundenen Clients senden
function broadcastMessage(
  sender: string,
  message: string,
  excludeWs?: WebSocket
) {
  const formattedMessage = JSON.stringify({ sender, message }); // Nachricht formatieren
  wss.clients.forEach((client) => {
    // Nachricht nicht an den Absender zurücksenden
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(formattedMessage); // Serialisierte Nachricht senden
    }
  });
}

// Server-Start-Log
console.log('WebSocket server is running on ws://localhost:8080');
