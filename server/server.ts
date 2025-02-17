import * as WebSocket from 'ws';
import { Observable, Subject } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

const messageSubject = new Subject<{ sender: string; message: string }>();

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected.');

  ws.send(
    JSON.stringify({
      sender: 'Server',
      websocketMessageText: 'Welcome to the WebSocket server!!!',
    })
  );

  const messageStream$ = new Observable<string>((observer) => {
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
        messageSubject.next({
          sender: 'Server',
          message: `${parsedMessage.sender} has logged in.`,
        });
      } else {
        messageSubject.next({
          sender: parsedMessage.sender,
          message: parsedMessage.websocketMessageText || '',
        });
      }
    });

  const broadcastSubscription = messageSubject.subscribe(
    ({ sender, message }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            sender,
            websocketMessageText: message,
          })
        );
      }
    }
  );

  ws.on('close', () => {
    console.log('Client disconnected.');
    broadcastSubscription.unsubscribe();
  });
});
