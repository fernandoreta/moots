import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { IPartner } from '../../interfaces/user.interface';
import { from, map, switchMap, tap } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-partners',
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule
  ],
  standalone: true,
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class PartnersComponent implements OnInit {
  @Output() goToCommerce = new EventEmitter<any>();
  private auth = inject(Auth);
  private userService = inject(UserService);
  private loadingService = inject(LoadingService);
  loading$ = this.loadingService.loading$;
  
  currentUser!: User;
  partners!: IPartner[];

  selectCommerce(commerce: any) {
    console.log(commerce);
  }

  getLogoUrl(commerceId: string): string {
    return `https://raw.githubusercontent.com/fernandoreta/moots/1.0.0/src/assets/logos/${commerceId}.png`;
  }

  async goToTabWithData(partnerName: string) {
    await this.setPartnerInfo();
    this.goToCommerce.emit(partnerName);
  }

  async setPartnerInfo() {
    const token = localStorage.getItem('idToken');
    if (!token) return;
  
    try {
      const res = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCyK-uH4edU0GLDxBw8556AFeYXCJTyojo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token })
        }
      );
  
      const data = await res.json();
      if (data.error) {
        console.error('❌ Error loading user from token');
      }
      const user = data.users?.[0];
      if (!res.ok || !user) return;
  
      this.currentUser = {
        uid: user.localId,
        email: user.email,
      } as any;
      const userData = await this.userService.getUserData(user.localId);

      const partners = await this.userService.getAllPartners();
  
      this.partners = partners.map((item: IPartner) => ({
        ...item,
        activeSlots: userData.partners?.[item.id]?.stamps ?? 0
      }));
    } catch (err) {
      console.error('❌ Error loading user from token:', err);
    } finally {
      this.loadingService.hide();
    }
  }
  
  async ngOnInit(): Promise<void> {
    await this.setPartnerInfo();
  }  
}
