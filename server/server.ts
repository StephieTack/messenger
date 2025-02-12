import * as WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });
const userMap = new Map<WebSocket, string>();

wss.on('connection', (ws) => {
  console.log('Client connected.');

  ws.send(
    JSON.stringify({
      sender: 'Server',
      websocketMessageText: 'Welcome to the WebSocket server!!!',
    })
  );

  ws.on('message', (rawMessage: string) => {
    console.log(`Received message: ${rawMessage}`);

    try {
      const parsedMessage = JSON.parse(rawMessage);

      if (parsedMessage.type === 'login' && parsedMessage.username) {
        userMap.set(ws, parsedMessage.username);
        console.log(`User logged in: ${parsedMessage.username}`);

        broadcastMessage('Server', `${parsedMessage.username} has logged in.`);
        return;
      }

      const sender = userMap.get(ws);
      if (!sender) {
        console.error('Sender not found in userMap. Ignoring message.');
        return; // Nachricht ignorieren, wenn Benutzer nicht gefunden
      }

      broadcastMessage(
        sender,
        parsedMessage.websocketMessageText || rawMessage
      );
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    const username = userMap.get(ws) || 'Unknown User';
    console.log(`Client disconnected: ${username}`);
    userMap.delete(ws);
    broadcastMessage('Server', `${username} has disconnected.`);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
});

function broadcastMessage(sender: string, message: string) {
  const formattedMessage = JSON.stringify({
    sender: sender,
    websocketMessageText: message,
  });

  wss.clients.forEach((client) => {
    client.send(formattedMessage);
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
