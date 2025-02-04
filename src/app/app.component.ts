import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LoginComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title = 'messenger';
  isLoggedIn = false;
  user: { firstName: string; lastName: string; email: string } = {
    firstName: '',
    lastName: '',
    email: '',
  };
  messages: { sender: string; text: string; timestamp: number }[] = [];
  messageText: string = '';

  ngOnInit() {
    const storedUser = localStorage.getItem('user');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');

    if (storedUser && storedLoginStatus === 'true') {
      this.user = JSON.parse(storedUser);
      this.isLoggedIn = true;
    }
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
    this.messageText = '';
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');

    this.messages = [];
    this.isLoggedIn = false;
    this.user = { firstName: '', lastName: '', email: '' };

    console.log('User logged out');
  }
}
