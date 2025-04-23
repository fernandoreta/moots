import { Component, Inject, inject, model, OnInit, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { PartnersComponent } from '../partners/partners.component';
import { HomeComponent } from '../home/home.component';
import { IPartners } from '../../interfaces/user.interface';
import { LoadingService } from '../../services/loading.service';
import { UserService } from '../../services/user.service';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-shell',
  imports: [
    MatIconModule,
    MatTabsModule,
    HomeComponent,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    CommonModule,
    PartnersComponent
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent implements OnInit {
  title = 'moots';
  showTabs = true;
  readonly dialog = inject(MatDialog);
  currentUser!: User;
  private auth = inject(Auth);
  partnerName = 'Home';
  isQrClicked = false;
  userData!: IPartners;
  loading$ = Inject(LoadingService).loading$;
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
    console.log('scan');
    this.isQrClicked = true;
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
    console.log(partnerName)
    this.partnerName = partnerName;
    this.userService.setPartnerName(partnerName);
    console.log('📦 Recibido desde partners:', partnerName);
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

 private authInitialized = false;

  ngOnInit(): void {
    if (this.authInitialized) return;
    this.authInitialized = true;

    onAuthStateChanged(this.auth, async user => {
      if (user) {
        this.currentUser = user;
        const data = await this.userService.getUserData(user);
        if (data) {
          this.userData = data;
          this.userService.setUserData(data);
        }
      }
    });
    
  }
}
