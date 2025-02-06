import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { webSocket } from 'rxjs/webSocket'; // WebSocket aus rxjs

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
  private socket$ = webSocket<{ message: string }>('ws://localhost:8080'); // Erwartet ein JSON-Objekt mit einer message

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');

    if (storedUser && storedLoginStatus === 'true') {
      this.user = JSON.parse(storedUser);
      this.isLoggedIn = true;
    }

    // WebSocket-Verbindung herstellen und Nachrichten empfangen
    this.socket$.subscribe({
      next: (message: { message: string }) => {
        console.log('Nachricht vom Server:', message.message);

        // Nachricht dem UI hinzufügen, falls gewünscht
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

  handleLogin(userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    this.user = userData;
    this.isLoggedIn = true;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));

    console.log('User logged in:', this.user);

    // Nach dem Login eine Nachricht an den Server senden
    this.socket$.next({
      message: `User has logged in: ${this.user.firstName}`,
    });
  }

  sendMessage() {
    if (this.messageText.trim() === '') return;

    const timestamp = Date.now();

    this.messages.push({
      sender: this.user.firstName,
      text: this.messageText,
      timestamp,
    });
    console.log('Messages:', this.messages);

    // Nachricht über WebSocket an den Server senden
    this.socket$.next({ message: this.messageText }); // Sendet den Text als JSON-Objekt

    this.messageText = '';
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    this.messages = [];
    this.isLoggedIn = false;
    this.user = { firstName: '', lastName: '', email: '' };

    console.log('User logged out');

    // Beim Logout eine Nachricht an den Server senden
    this.socket$.next({ message: 'User has logged out' });
  }
}
