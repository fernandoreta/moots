import { Component, inject, model, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { HomeComponent } from '../pages/home/home.component';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { LoginComponent } from '../pages/login/login.component';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
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
    MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'moots';
  showTabs = true;
  readonly animal = signal('');
  readonly name = model('');
  readonly dialog = inject(MatDialog);
  currentUser!: User;
  private auth = inject(Auth);

  constructor(private router: Router) {
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

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.animal.set(result);
      }
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
