"use strict";
// import * as WebSocket from 'ws';
Object.defineProperty(exports, "__esModule", { value: true });
// const wss = new WebSocket.Server({ port: 8080 });
// wss.on('connection', (ws) => {
//   console.log('Client connected.');
//   // Nachricht an neuen Client senden, um ihn zu begrüßen
//   ws.send(
//     JSON.stringify({
//       sender: 'Server',
//       websocketMessageText: 'Welcome to the WebSocket server!!!',
//     })
//   );
//   // Nachrichten vom Client empfangen
//   ws.on('message', (rawMessage: string) => {
//     console.log(`Received message: ${rawMessage}`);
//     try {
//       const parsedMessage = JSON.parse(rawMessage);
//       // Wenn es sich um eine Login-Nachricht handelt, senden wir diese an alle anderen Clients
//       if (parsedMessage.type === 'login' && parsedMessage.sender) {
//         console.log(`User logged in: ${parsedMessage.sender}`);
//         // Broadcast-Nachricht an alle anderen Clients (außer an den abgemeldeten Benutzer)
//         broadcastMessage('Server', `${parsedMessage.sender} has logged in.`);
//         return;
//       }
//       // Weitere Nachrichtenbehandlung (normalerweise Nachricht an alle senden)
//       const sender = parsedMessage.sender;
//       if (!sender) {
//         console.error('Sender is not defined. Ignoring message.');
//         return;
//       }
//       // Broadcast-Nachricht an alle Clients senden
//       broadcastMessage(
//         sender,
//         parsedMessage.websocketMessageText || rawMessage
//       );
//     } catch (error) {
//       console.error('Error parsing message:', error);
//     }
//   });
//   ws.on('close', () => {
//     console.log('Client disconnected.');
//   });
//   ws.on('error', (error) => {
//     console.error(`WebSocket error: ${error}`);
//   });
// });
// // Funktion zum Broadcasten der Nachricht an alle Clients
// function broadcastMessage(sender: string, message: string) {
//   const formattedMessage = JSON.stringify({
//     sender: sender,
//     websocketMessageText: message,
//   });
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(formattedMessage);
//     }
//   });
// }
// console.log('WebSocket server is running on ws://localhost:8080');
// import * as WebSocket from 'ws';
// import { Observable, Subject } from 'rxjs';
// import { map, filter, catchError } from 'rxjs/operators';
// const wss = new WebSocket.Server({ port: 8080 });
// console.log('WebSocket server is running on ws://localhost:8080');
// // Subject für Broadcast-Nachrichten
// const messageSubject = new Subject<{ sender: string; message: string }>();
// // WebSocket-Verbindungen verwalten
// wss.on('connection', (ws: WebSocket) => {
//   console.log('Client connected.');
//   // Begrüßungsnachricht senden
//   ws.send(
//     JSON.stringify({
//       sender: 'Server',
//       websocketMessageText: 'Welcome to the WebSocket server!!!',
//     })
//   );
//   // RxJS Observable für Nachrichten
//   const messageStream$ = new Observable<string>((observer) => {
//     ws.on('message', (rawMessage: string) => observer.next(rawMessage));
//     ws.on('close', () => observer.complete());
//     ws.on('error', (error) => observer.error(error));
//   });
//   // Verarbeite eingehende Nachrichten
//   messageStream$
//     .pipe(
//       map((rawMessage) => {
//         console.log(`Received message: ${rawMessage}`);
//         return JSON.parse(rawMessage);
//       }),
//       filter((parsedMessage) => !!parsedMessage.sender), // Ignoriert Nachrichten ohne Sender
//       catchError((error) => {
//         console.error('Error parsing message:', error);
//         return [];
//       })
//     )
//     .subscribe((parsedMessage) => {
//       if (parsedMessage.type === 'login') {
//         console.log(`User logged in: ${parsedMessage.sender}`);
//         messageSubject.next({
//           sender: 'Server',
//           message: `${parsedMessage.sender} has logged in.`,
//         });
//       } else {
//         messageSubject.next({
//           sender: parsedMessage.sender,
//           message: parsedMessage.websocketMessageText || '',
//         });
//       }
//     });
//   // Broadcast-Subscription für jeden Client
//   const broadcastSubscription = messageSubject.subscribe(
//     ({ sender, message }) => {
//       if (ws.readyState === WebSocket.OPEN) {
//         ws.send(
//           JSON.stringify({
//             sender,
//             websocketMessageText: message,
//           })
//         );
//       }
//     }
//   );
//   ws.on('close', () => {
//     console.log('Client disconnected.');
//     // messageSubject.next({
//     //   sender: 'Server',
//     //   message: 'A user has disconnected.',
//     // });
//     broadcastSubscription.unsubscribe();
//   });
// });
var WebSocket = require("ws");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');
// WebSocket-Verbindungen verwalten
wss.on('connection', function (ws) {
    console.log('Client connected.');
    // Begrüßungsnachricht senden
    ws.send(JSON.stringify({
        sender: 'Server',
        websocketMessageText: 'Welcome to the WebSocket server!!!',
    }));
    // RxJS Observable für Nachrichten
    var messageStream$ = new rxjs_1.Observable(function (observer) {
        ws.on('message', function (rawMessage) { return observer.next(rawMessage); });
        ws.on('close', function () { return observer.complete(); });
        ws.on('error', function (error) { return observer.error(error); });
    });
    // Verarbeite eingehende Nachrichten
    messageStream$
        .pipe((0, operators_1.map)(function (rawMessage) {
        console.log("Received message: ".concat(rawMessage));
        return JSON.parse(rawMessage);
    }), (0, operators_1.filter)(function (parsedMessage) { return !!parsedMessage.sender; }), // Ignoriert Nachrichten ohne Sender
    (0, operators_1.catchError)(function (error) {
        console.error('Error parsing message:', error);
        return [];
    }))
        .subscribe(function (parsedMessage) {
        if (parsedMessage.type === 'login') {
            console.log("User logged in: ".concat(parsedMessage.sender));
            // Speichere den Benutzernamen für spätere Vergleiche
            ws['username'] = parsedMessage.sender;
            // Sende Nachricht nur an den eingeloggten Client
            ws.send(JSON.stringify({
                sender: 'Server',
                websocketMessageText: 'You have logged in.',
            }));
            // Broadcast-Nachricht an alle anderen Clients senden
            wss.clients.forEach(function (client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        sender: 'Server',
                        websocketMessageText: "".concat(parsedMessage.sender, " has logged in."),
                    }));
                }
            });
        }
        else {
            // Andere Nachrichten an alle senden
            wss.clients.forEach(function (client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        sender: parsedMessage.sender,
                        websocketMessageText: parsedMessage.websocketMessageText || '',
                    }));
                }
            });
        }
    });
    ws.on('close', function () {
        console.log('Client disconnected.');
    });
});
