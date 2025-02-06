"use strict";
// import * as WebSocket from 'ws';
// // const WebSocket = require('ws');
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
// const wss = new WebSocket.Server({ port: 8080 });
// wss.on('connection', (ws) => {
//   console.log('Client connected');
//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//   });
//   ws.send('Welcome to the WebSocket server!');
// });
// console.log('WebSocket server is running on ws://localhost:8080');
const WebSocket = __importStar(require("ws")); // WebSocket-Modul importieren
// WebSocket-Server initialisieren
const wss = new WebSocket.Server({ port: 8080 });
// Verbindungsevent behandeln
wss.on("connection", (ws) => {
  console.log("Client connected"); // Logge, wenn sich ein Client verbindet
  // Nachricht vom Client empfangen
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`); // Logge die Nachricht
  });
  // Begrüßungsnachricht an den Client senden
  ws.send(JSON.stringify({ message: "Welcome to the WebSocket server!!!" }));
});
// Server-Start-Log
console.log("WebSocket server is running on ws://localhost:8080");
