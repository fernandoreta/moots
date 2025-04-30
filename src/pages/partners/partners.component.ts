import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { IPartner } from '../../interfaces/user.interface';
import { from, map, switchMap, tap } from 'rxjs';

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
  
  currentUser!: User;
  partners!: IPartner[];

  selectCommerce(commerce: any) {
    console.log(commerce);
  }


  goToTabWithData(partnerName: string) {
    this.goToCommerce.emit(partnerName);
  }
  
  ngOnInit(): void {
    onAuthStateChanged(this.auth, user => {
      if (!user) return;
  
      this.currentUser = user;
  
      from(this.userService.getUserData(user.uid)).pipe(
        switchMap(userData =>
          from(this.userService.getAllPartners()).pipe(
            map(partners =>
              partners.map((item: IPartner) => ({
                ...item,
                activeSlots: userData.partners?.[item.id]?.stamps ?? 0
              }))
            )
          )
        ),
        tap(updatedPartners => {
          this.partners = updatedPartners;
        })
      ).subscribe();
    });
  }
}
