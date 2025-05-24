import { Component, inject, model, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile, User, UserCredential } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Capacitor } from '@capacitor/core';
import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { firebaseConfig } from '../../main';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackDialogComponent } from '../../dialogs/SnackDialog/snack-dialog.component';
import { SnackService } from '../../services/utils.service';
import { AccountDeletionComponent } from '../../dialogs/account-deletion/account-deletion.component';
import { take } from 'rxjs';

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
  title = 'Perxie';
  private auth = inject(Auth);
  private router = inject(Router);
  private snackService = inject(SnackService);
  dialogRef = inject(MatDialogRef<LoginComponent>);
  dialog = inject(MatDialog);
  data = inject<{currentUser: User}>(MAT_DIALOG_DATA);
  registerForm: FormGroup;
  formSelected = '';
  loginForm!: FormGroup;
  hidePassword = true;
  
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

  async loginAdmin() {
    const { email, password } = this.loginForm.value;
    
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      this.dialogRef.close(cred.user);
      this.router.navigateByUrl('');
    } catch (error: any) {
      this.snackService.openSnackBar();
    }
  }

  async login() {
    const { email, password } = this.loginForm.value;
    if (email.includes('admin')) {
      await this.loginAdmin();
      return;
    }
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );
  
    const data = await res.json();
    if (res.ok) {
      // 🔐 Guarda token en localStorage (✅ compatible con Capacitor iOS)
      localStorage.setItem('idToken', data.idToken);
  
      this.dialogRef.close(data.email);
      this.router.navigateByUrl('');
      console.log('✅ Login OK', data);
    } else {
      this.snackService.openSnackBar();
    }
  }
  
  logout() {
    localStorage.removeItem('idToken');
    this.data.currentUser = undefined as any;
    this.dialogRef.close(false);
    this.router.navigateByUrl('');
    this.snackService.openSnackBar('👋 Sesión cerrada');
  }

  openDeleteAccountBox(enterAnimationDuration: string, exitAnimationDuration: string) {
    const dialog = this.dialog.open(AccountDeletionComponent, {
      width: '250px',
      enterAnimationDuration,
      exitAnimationDuration,
    });
    dialog.afterClosed()
      .pipe(take(1)).subscribe(result => {
        if (result === 'confirm') {
          this.deleteAccount();
        }
      });
  }

  async deleteAccount() {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
      this.snackService.openSnackBar('Token no encontrado!');
      return;
    }
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    );
    if (res.ok) {
      await this.userService.deleteUserDoc();
      localStorage.removeItem('idToken');
      this.data.currentUser = undefined as any;
      this.dialogRef.close(false);
      this.router.navigateByUrl('');
      this.snackService.openSnackBar('🗑️ Cuenta eliminada correctamente');
    } else {
      this.snackService.openSnackBar('❌ Error al eliminar la cuenta');
    }
  }

  async register() {
    const { name, email, password } = this.registerForm.value;
  
    try {
      // Crear usuario con Firebase Auth (REST API)
      const res = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCyK-uH4edU0GLDxBw8556AFeYXCJTyojo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true
          })
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        this.snackService.openSnackBar();
        throw new Error(data.error?.message || 'Error al registrar');
      }
  
      const { idToken, localId } = data;
  
      // Guardar sesión
      localStorage.setItem('idToken', idToken);
  
      // Crear documento de usuario (usando localId como UID)
      await this.userService.createUserDoc(name, email, localId);
  
      this.dialogRef.close(email);
      this.router.navigateByUrl('');
      console.log('✅ Registro exitoso:', email);
    } catch (error: any) {
      this.snackService.openSnackBar();
    }
  }  

  ngOnInit() {
    
  }
  
}
