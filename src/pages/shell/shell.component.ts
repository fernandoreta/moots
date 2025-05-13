import { Component, Inject, inject, model, OnInit, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { PartnersComponent } from '../partners/partners.component';
import { HomeComponent } from '../home/home.component';
import { IPartner, IUSerData } from '../../interfaces/user.interface';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { LoginComponent } from '../login/login.component';
import { QrComponent } from '../../dialogs/qr/qr.component';
import { SnackService } from '../../services/utils.service';
import { firebaseConfig } from '../../main';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-shell',
  imports: [
    MatIconModule,
    MatTabsModule,
    HomeComponent,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
    PartnersComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  title = 'Perxie';
  showTabs = true;
  readonly dialog = inject(MatDialog);
  private auth = inject(Auth);
  partnerName = 'Home';
  isQrClicked = false;
  
  currentUser!: User;
  userData!: IUSerData;
  
  private loadingService = inject(LoadingService);
  private snackService = inject(SnackService);
  loading$ = this.loadingService.loading$;

  private authInitialized = false;
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

  @ViewChild('mainTabGroup') tabGroup!: MatTabGroup;

  scanQr() {
    this.isQrClicked = true;

    this.dialog.open(QrComponent, {
      data: { currentUser: this.currentUser },
    });
  }

  onTabChange(index: number): void {
    if (index === 1) {
      this.onStorefrontClick();
    } else {
      this.userService.partnerNameSubject.next('');
      this.partnerName = 'Home';
    }
  }
  
  async onStorefrontClick(): Promise<void> {
    const partners = await this.userService.getAllPartners();
    const firstPartner = partners[0].id;
    if (!this.userService.partnerNameSubject.value) {
      this.goToCommerceWithData(firstPartner);
    }
  }

  goToTab(index: number) {
    this.tabGroup.selectedIndex = index;
  }
  
  goToCommerceWithData(partnerName: string) {
    this.tabGroup.selectedIndex = 1;
    this.partnerName = partnerName;
    this.userService.setPartnerName(partnerName);
  }

  login() {
    const dialogRef = this.dialog.open(LoginComponent, {
      data: { currentUser: this.currentUser },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        this.currentUser = result;
        // Wait something to reload the page.
        setTimeout(() => {
          window.location.reload();
        });
      }
      if (result === false) {
        this.currentUser = undefined as any;
      }
    });
  }

  async checkIfIsSuperAdmin(userEmail: string) {
    const partners = await this.userService.getAllPartnersAuthApi();
    return partners.some((partner: IPartner) => partner.superuser === userEmail);
  }

  get username(): string {
    const email = this.currentUser?.email?.toUpperCase();
    return email ? email.split('@')[0] : 'Inicia Sesión';
  }

  async ngOnInit(): Promise<void> {
    console.log('shell');
    if (this.authInitialized) return;
    this.authInitialized = true;
  
    const token = localStorage.getItem('idToken');
    if (!token) {
     // check if is admin with auth api
     const isBrowser = Capacitor.getPlatform() === 'web';
     if (isBrowser) {
       onAuthStateChanged(this.auth, async user => {
        if (user) {
          this.currentUser = user;
          console.log(this.currentUser)
          let isSuperUser = false;
          const data = await this.userService.getUserDataAuthApi(user.uid);
          if (user.email) {
            isSuperUser = await this.checkIfIsSuperAdmin(user.email);
          }
          if (data) {
            this.userData = data;
            this.userService.setUserData(data);
          }
  
          this.loadingService.hide();
          if (isSuperUser) {
            console.log('SUPERUSER');
            this.router.navigate(['admin-page']);
          }
        } else {
          this.loadingService.hide();
        }
        });
     }
    }
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token })
        }
      );
      const data = await res.json();
      if (!res.ok || !data.users || data.users.length === 0) return;
  
      const firebaseUser = data.users[0];
      this.loadingService.hide();
      this.currentUser = {
        uid: firebaseUser.localId,
        email: firebaseUser.email,
      } as any;
      const userData = await this.userService.getUserData(firebaseUser.localId);
      if (userData) {
        this.userData = userData;
        this.userService.setUserData(userData);
      }
      const isSuperUser = await this.checkIfIsSuperAdmin(firebaseUser.email);
      if (isSuperUser) {
        this.router.navigate(['admin-page']);
      }
      
    } catch (err) {
      this.snackService.openSnackBar();
      this.loadingService.hide();
    }
  }   
}
