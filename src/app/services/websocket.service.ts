import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: WebSocket; // "!" sagt TypeScript: ich initialisiere es später.

  constructor() {}

  connect(url: string): void {
    this.socket = new WebSocket(url);

    // Event: Verbindung geöffnet
    this.socket.onopen = () => {
      console.log('WebSocket connected!');
    };

    // Event: Nachricht empfangen
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data); // Annahme: Server sendet JSON-Daten
      console.log('Message received:', message.message);
    };

    // Event: Verbindung geschlossen
    this.socket.onclose = () => {
      console.log('WebSocket disconnected.');
    };

    // Event: Fehler
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Methode zum Senden einer Nachricht
  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const jsonMessage = JSON.stringify({ message }); // Sendet die Nachricht als JSON
      this.socket.send(jsonMessage);
    } else {
      console.error('WebSocket is not open. Unable to send message.');
    }
  }

  // Methode zum Schließen der Verbindung
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
