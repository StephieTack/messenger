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

  initializeWebSocket() {
    this.socket$.subscribe({
      next: (message: WebSocketMessage) => {
        // Ignoriere Nachrichten, die vom eigenen Benutzer stammen
        if (message.sender === this.currentUser) {
          return;
        }

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

  handleLogin(userData: User) {
    this.user = userData;
    this.isLoggedIn = true;
    this.currentUser = this.user.firstName;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));

    this.initializeWebSocket();

    this.socket$.next({
      type: 'login',
      websocketMessageText: 'User has logged in.',
      sender: this.user.firstName,
      username: this.user.firstName,
    });
  }

  sendMessage() {
    if (this.messageText.trim() === '') {
      console.error('Message is empty!');
      return;
    }

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
      username: this.user.firstName,
    });

    this.messages.push(messageToSend);
    this.messageText = '';
  }

  logout() {
    this.socket$.next({
      type: 'logout',
      websocketMessageText: `${this.user.firstName} has logged out.`,
      sender: this.user.firstName,
      username: this.user.firstName,
    });

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    this.messages = [];
    this.isLoggedIn = false;
    this.user = { firstName: '', lastName: '', email: '' };

    this.socket$.complete();
  }
}
