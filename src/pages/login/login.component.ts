import { Component, inject, model, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, User, UserCredential } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  title = 'moots';
  private auth = inject(Auth);
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<LoginComponent>);
  data = inject<{currentUser: User}>(MAT_DIALOG_DATA);
  registerForm: FormGroup;
  formSelected = '';
  loginForm!: FormGroup;
  hidePassword = true;
  error = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get userName(): string {
    return this.data?.currentUser?.email?.split('@')[0] ?? '';
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  login() {
    const { email, password } = this.loginForm.value;
  
    signInWithEmailAndPassword(this.auth, email, password)
      .then((res) => {
        const user = res.user;
        this.data.currentUser = user;
        this.error = false;
        this.dialogRef.close();
        console.log('✅ Sesión iniciada:', user.email);
      })
      .catch((error) => {
        this.error = true;
        console.error('❌ Error al iniciar sesión:', error.message);
      });
  }
  
  logout() {
    signOut(this.auth)
      .then(() => {
        this.data.currentUser = undefined as any;
        console.log('👋 Sesión cerrada');
      })
      .catch((error) => {
        console.error('❌ Error al cerrar sesión:', error.message);
      });
  }

  async register() {
    const { name, email, password } = this.registerForm.value;

    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      console.log('✅ Usuario registrado:', cred.user);
      this.dialogRef.close();
    } catch (err) {
      console.error('❌ Error al registrar:', err);
    }
  }

  ngOnInit(): void {
    console.log(this.data.currentUser);
  }
}
