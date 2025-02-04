import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent {
  @Output() login = new EventEmitter<{
    firstName: string;
    lastName: string;
    email: string;
  }>();

  loginForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  submitLogin() {
    const { firstName, lastName, email } = this.loginForm.value;
    if (firstName && lastName && email) {
      this.login.emit({ firstName, lastName, email });
    }
  }
}
