"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server is running on ws://localhost:8080');
wss.on('connection', function (ws) {
    console.log('Client connected.');
    ws.send(JSON.stringify({
        sender: 'Server',
        websocketMessageText: 'Welcome to the WebSocket server!!!',
    }));
    var messageStream$ = new rxjs_1.Observable(function (observer) {
        ws.on('message', function (rawMessage) { return observer.next(rawMessage); });
        ws.on('close', function () { return observer.complete(); });
        ws.on('error', function (error) { return observer.error(error); });
    });
    messageStream$
        .pipe((0, operators_1.map)(function (rawMessage) {
        console.log("Received message: ".concat(rawMessage));
        return JSON.parse(rawMessage);
    }), (0, operators_1.filter)(function (parsedMessage) { return !!parsedMessage.sender; }), (0, operators_1.catchError)(function (error) {
        console.error('Error parsing message:', error);
        return [];
    }))
        .subscribe(function (parsedMessage) {
        if (parsedMessage.type === 'login') {
            console.log("User logged in: ".concat(parsedMessage.sender));
            ws['username'] = parsedMessage.sender;
            ws.send(JSON.stringify({
                sender: 'Server',
                websocketMessageText: 'You have logged in.',
            }));
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
