import * as WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });

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

      if (parsedMessage.type === 'login' && parsedMessage.sender) {
        console.log(`User logged in: ${parsedMessage.sender}`);

        broadcastMessage('Server', `${parsedMessage.sender} has logged in.`);
        return;
      }

      const sender = parsedMessage.sender;
      if (!sender) {
        console.error('Sender is not defined. Ignoring message.');
        return;
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
    console.log('Client disconnected.');
    broadcastMessage('Server', 'A user has disconnected.');
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
    if (client.readyState === WebSocket.OPEN) {
      client.send(formattedMessage);
    }
  });
}

console.log('WebSocket server is running on ws://localhost:8080');
