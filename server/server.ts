import * as WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected.');

  // Willkommensnachricht an den neu verbundenen Client senden
  ws.send(
    JSON.stringify({
      sender: 'Server',
      websocketMessageText: 'Welcome to the WebSocket server!!!',
    })
  );

  // Nachrichtenempfang und -verarbeitung
  ws.on('message', (rawMessage: string) => {
    console.log(`Received message: ${rawMessage}`);

    try {
      const parsedMessage = JSON.parse(rawMessage);

      // Beim Login-Event
      if (parsedMessage.type === 'login' && parsedMessage.username) {
        console.log(`User logged in: ${parsedMessage.username}`);

        // Nachricht an alle Clients senden, dass der Benutzer eingeloggt ist
        broadcastMessage('Server', `${parsedMessage.username} has logged in.`);
        return;
      }

      // Alle anderen Nachrichten weiterleiten
      const sender = parsedMessage.sender;
      if (!sender) {
        console.error('Sender is not defined. Ignoring message.');
        return; // Ignoriere Nachricht ohne Sender
      }

      // Sende die Nachricht an alle Clients
      broadcastMessage(
        sender,
        parsedMessage.websocketMessageText || rawMessage
      );
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Client-Verbindung geschlossen
  ws.on('close', () => {
    console.log('Client disconnected.');
    broadcastMessage('Server', 'A user has disconnected.');
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

// Alle Clients mit einer Nachricht benachrichtigen
function broadcastMessage(sender: string, message: string) {
  const formattedMessage = JSON.stringify({
    sender: sender,
    websocketMessageText: message,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(formattedMessage);
    }
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
