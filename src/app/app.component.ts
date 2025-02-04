import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  title = 'messenger';
  isLoggedIn = false;
  message = ''; // Aktuelle Eingabe
  messages: string[] = []; // Array für alle Nachrichten

  handleLogin() {
    this.isLoggedIn = true;
    console.log('User is logged in');
  }

  sendMessage() {
    if (this.message.trim() !== '') {
      this.messages.push(this.message); // Nachricht zum Array hinzufügen
      console.log('Gesendete Nachricht:', this.message);
      this.message = ''; // Input-Feld leeren
    }
  }
}
