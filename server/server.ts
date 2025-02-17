import * as WebSocket from 'ws';
import { Observable, Subject } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// WebSocket-Verbindungen verwalten
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected.');

  // Begrüßungsnachricht senden
  ws.send(
    JSON.stringify({
      sender: 'Server',
      websocketMessageText: 'Welcome to the WebSocket server!!!',
    })
  );

  // RxJS Observable für Nachrichten
  const messageStream$ = new Observable<string>((observer) => {
    ws.on('message', (rawMessage: string) => observer.next(rawMessage));
    ws.on('close', () => observer.complete());
    ws.on('error', (error) => observer.error(error));
  });

  // Verarbeite eingehende Nachrichten
  messageStream$
    .pipe(
      map((rawMessage) => {
        console.log(`Received message: ${rawMessage}`);
        return JSON.parse(rawMessage);
      }),
      filter((parsedMessage) => !!parsedMessage.sender), // Ignoriert Nachrichten ohne Sender
      catchError((error) => {
        console.error('Error parsing message:', error);
        return [];
      })
    )
    .subscribe((parsedMessage) => {
      if (parsedMessage.type === 'login') {
        console.log(`User logged in: ${parsedMessage.sender}`);

        // Speichere den Benutzernamen für spätere Vergleiche
        ws['username'] = parsedMessage.sender;

        // Sende Nachricht nur an den eingeloggten Client
        ws.send(
          JSON.stringify({
            sender: 'Server',
            websocketMessageText: 'You have logged in.',
          })
        );

        // Broadcast-Nachricht an alle anderen Clients senden
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
        // Andere Nachrichten an alle senden
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
