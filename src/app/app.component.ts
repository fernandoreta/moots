import { Component, inject, model, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { HomeComponent } from '../pages/home/home.component';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { LoginComponent } from '../pages/login/login.component';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { IUSerData } from '../interfaces/user.interface';
import { UserService } from '../services/user.service';
import { LoadingService } from '../services/loading.service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'app-root',
  imports: [
    MatIconModule,
    MatTabsModule,
    HomeComponent,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'moots';
  showTabs = true;
  readonly dialog = inject(MatDialog);
  currentUser!: User;
  private auth = inject(Auth);

  userData!: IUSerData;
  loading$ = inject(LoadingService).loading$;
  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(event => {
        // Solo mostrar tabs si estás dentro de la sección /tabs
        this.showTabs = event.url.startsWith('/tabs');
      });
  }

  login() {
    const dialogRef = this.dialog.open(LoginComponent, {
      data: { currentUser: this.currentUser },
    });

    dialogRef.afterClosed().subscribe((result: User) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.currentUser = result;
      } else {
        this.currentUser = undefined as any;
      }
    });
  }

 private authInitialized = false;

  ngOnInit(): void {
    if (this.authInitialized) return;
    this.authInitialized = true;

    onAuthStateChanged(this.auth, async user => {
      if (user) {
        this.currentUser = user;
        console.log('🙋 Usuario activo:', user.email);

        this.userData = await this.userService.getUserData(user);
        if (this.userData) {
          console.log('⭐ Puntos del usuario:', this.userData.points);
        } else {
          console.warn('⚠️ No se encontró documento del usuario en Firestore');
        }
      } else {
        console.log('🚫 No hay sesión activa');
      }
    });
  }
}
