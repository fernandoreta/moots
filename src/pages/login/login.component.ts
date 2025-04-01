import { Component, inject, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, UserCredential } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  title = 'moots';
  private auth = inject(Auth);
  currentUser!: User;

  login() {
    signInWithEmailAndPassword(
      this.auth,
      'fernando@moots.com',
      'password'
    )
    .then((res) => {
      const user = res.user;
      this.currentUser = user;
      console.log('✅ Sesión iniciada:', user.email);
    })
    .catch((error) => {
      console.error('❌ Error al iniciar sesión:', error.message);
    });
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        this.currentUser = undefined as any;
        console.log('👋 Sesión cerrada');
      })
      .catch((error) => {
        console.error('❌ Error al cerrar sesión:', error.message);
      });
  }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.currentUser = user;
        console.log('🙋 Usuario activo:', user.email);
      } else {
        console.log('🚫 No hay sesión activa');
      }
    });
  }
}
