import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { webSocket } from 'rxjs/webSocket'; // WebSocket aus RxJS

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
  user: { firstName: string; lastName: string; email: string } = {
    firstName: '',
    lastName: '',
    email: '',
  };
  messages: { sender: string; text: string; timestamp: number }[] = [];
  messageText: string = '';

  // WebSocket-URL des Backends
  private socket$ = webSocket<{
    type: string;
    message: string;
    username?: string;
  }>('ws://localhost:8080');

  ngOnInit() {
    // Nutzerinformationen und Login-Status aus dem LocalStorage laden
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');

    if (storedUser && storedLoginStatus === 'true') {
      this.user = JSON.parse(storedUser);
      this.isLoggedIn = true;
    }

    // WebSocket-Verbindung herstellen und Nachrichten empfangen
    this.socket$.subscribe({
      next: (message: { type: string; message: string }) => {
        console.log('Nachricht vom Server:', message.message);

        // Nachricht zum UI hinzufügen
        this.messages.push({
          sender: 'Server',
          text: message.message,
          timestamp: Date.now(),
        });
      },
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket-Verbindung geschlossen'),
    });
  }

  // Login-Handling
  handleLogin(userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    this.user = userData;
    this.isLoggedIn = true;

    // Nutzerinformationen und Login-Status im LocalStorage speichern
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('User logged in:', this.user);

    // Nach dem Login eine Nachricht an den Server senden
    this.socket$.next({
      type: 'login', // Typ für Login-Nachricht
      message: `User has logged in: ${this.user.firstName}`,
      username: this.user.firstName, // Benutzername für den Server
    });
  }

  // Nachricht senden
  sendMessage() {
    console.log('Current message text:', this.messageText);
    if (this.messageText.trim() === '') {
      console.error('Nachricht ist leer!');
      return;
    }

    const timestamp = Date.now();
    const messageToSend = {
      sender: this.user.firstName,
      text: this.messageText,
      timestamp,
    };

    this.socket$.next({ type: 'message', message: this.messageText }); // Typ für normale Nachricht

    this.messages.push(messageToSend); // Nachricht ins UI hinzufügen
    this.messageText = ''; // Eingabe zurücksetzen
  }

  // Logout-Handling
  logout() {
    // Nutzerinformationen und Login-Status aus dem LocalStorage entfernen
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    this.messages = [];
    this.isLoggedIn = false;
    this.user = { firstName: '', lastName: '', email: '' };

    console.log('User logged out');

    // Beim Logout eine Nachricht an den Server senden und Verbindung schließen
    this.socket$.next({ type: 'logout', message: 'User has logged out' }); // Typ für Logout-Nachricht
    this.socket$.complete();
  }
}
