import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { webSocket } from 'rxjs/webSocket';
import { User, Message, WebSocketMessage } from './models/interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LoginComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements OnInit {
  title = 'messenger';
  isLoggedIn = false;
  user: User = { firstName: '', lastName: '', email: '' };
  messages: Message[] = [];
  messageText: string = '';

  private socket$ = webSocket<WebSocketMessage>('ws://localhost:8080');

  private currentUser: string = '';

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');

    if (storedUser && storedLoginStatus === 'true') {
      this.user = JSON.parse(storedUser);
      this.isLoggedIn = true;
      this.currentUser = this.user.firstName;
      this.initializeWebSocket();
    }
  }

  // WebSocket-Verbindung und Nachrichtensubscription initialisieren
  initializeWebSocket() {
    this.socket$.subscribe({
      next: (message: WebSocketMessage) => {
        // Wenn die Nachricht vom aktuellen Benutzer kommt, überspringen wir sie
        if (message.sender === this.currentUser) {
          return;
        }

        // Empfangene Nachricht zum Nachrichtenarray hinzufügen
        this.messages.push({
          sender: message.sender,
          messageText: message.websocketMessageText,
          timestamp: Date.now(),
        });
      },
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed'),
    });
  }

  // Login-Funktion und Initialisierung der WebSocket-Verbindung
  handleLogin(userData: User) {
    this.user = userData;
    this.isLoggedIn = true;
    this.currentUser = this.user.firstName;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));

    // WebSocket initialisieren und Login-Nachricht senden
    this.initializeWebSocket();

    // Broadcast der Login-Nachricht an alle anderen Clients (ausgenommen den aktuellen)
    this.socket$.next({
      type: 'login',
      websocketMessageText: 'User has logged in.',
      sender: this.user.firstName,
    });
  }

  // Nachricht an den Server und andere Clients senden
  sendMessage() {
    const messageToSend: Message = {
      sender: this.user.firstName,
      messageText: this.messageText,
      timestamp: Date.now(),
    };

    // Nachricht an den Server senden
    this.socket$.next({
      type: 'message',
      websocketMessageText: this.messageText,
      sender: this.user.firstName,
    });

    // Nachricht lokal zum Array hinzufügen
    this.messages.push(messageToSend);
    this.messageText = '';
  }

  // Logout-Funktion und WebSocket-Verbindung schließen
  logout() {
    this.socket$.next({
      type: 'logout',
      websocketMessageText: `${this.user.firstName} has logged out.`,
      sender: 'Server',
    });

    // Logout-Daten entfernen
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this.messages = [];
    this.isLoggedIn = false;
    this.user = { firstName: '', lastName: '', email: '' };

    // WebSocket-Verbindung schließen
    this.socket$.complete();
  }
}
