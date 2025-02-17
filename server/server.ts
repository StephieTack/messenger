import * as WebSocket from 'ws';
import { Observable } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected.');

  ws.send(
    JSON.stringify({
      sender: 'Server',
      websocketMessageText: 'Welcome to the WebSocket server!!!',
    })
  );

  const messageStream$: Observable<string> = new Observable((observer) => {
    ws.on('message', (rawMessage: string) => observer.next(rawMessage));
    ws.on('close', () => observer.complete());
    ws.on('error', (error) => observer.error(error));
  });

  messageStream$
    .pipe(
      map((rawMessage) => {
        console.log(`Received message: ${rawMessage}`);
        return JSON.parse(rawMessage);
      }),
      filter((parsedMessage) => !!parsedMessage.sender),
      catchError((error) => {
        console.error('Error parsing message:', error);
        return [];
      })
    )
    .subscribe((parsedMessage) => {
      if (parsedMessage.type === 'login') {
        console.log(`User logged in: ${parsedMessage.sender}`);
        ws['username'] = parsedMessage.sender;

        ws.send(
          JSON.stringify({
            sender: 'Server',
            websocketMessageText: 'You have logged in.',
          })
        );

        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                sender: 'Server',
                websocketMessageText: `${parsedMessage.sender} has logged in.`,
              })
            );
          }
        });
      } else {
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                sender: parsedMessage.sender,
                websocketMessageText: parsedMessage.websocketMessageText || '',
              })
            );
          }
        });
      }
    });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});
