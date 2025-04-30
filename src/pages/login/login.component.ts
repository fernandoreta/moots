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
import { UserService } from '../../services/user.service';

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
  title = 'perksy';
  private auth = inject(Auth);
  private router = inject(Router);
  dialogRef = inject(MatDialogRef<LoginComponent>);
  data = inject<{currentUser: User}>(MAT_DIALOG_DATA);
  registerForm: FormGroup;
  formSelected = '';
  loginForm!: FormGroup;
  hidePassword = true;
  error = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
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
      .then(async (cred) => {
          this.dialogRef.close(cred.user);
          this.router.navigateByUrl('');
      })
      .catch((error) => {
        console.error('❌ Error al iniciar sesión:', error.message);
      });
  }
  
  logout() {
    signOut(this.auth)
      .then(() => {
        this.data.currentUser = undefined as any;
        this.dialogRef.close(false);
        console.log('👋 Sesión cerrada');
        this.router.navigateByUrl('');
      })
      .catch((error) => {
        console.error('❌ Error al cerrar sesión:', error.message);
      });
  }

  async register() {
    const { name, email, password } = this.registerForm.value;

    createUserWithEmailAndPassword(this.auth, email, password)
    .then(async (cred) => {
      await this.userService.createUserDocument(cred.user);
      await updateProfile(cred.user, { displayName: name });
      this.dialogRef.close(cred.user);
      this.router.navigateByUrl('');
      console.log('✅ Registro exitoso:', email);
    })
    .catch((error) => {
      console.error('❌ Error al registrar:', error.message);
    });
  }

  ngOnInit(): void {
    console.log(this.data.currentUser);
  }
}
