import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule
  ],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  @Output() goToCommerce = new EventEmitter<any>();
  private auth = inject(Auth);
  currentUser!: User;

  commerces = [
    {
      name: 'moots',
      class: 'coffee-card',
      activeSlots: 3,
      totalSlots: 8
    },
    {
      name: 'localcoffee',
      class: 'bakery-card',
      activeSlots: 5,
      totalSlots: 8
    }
  ];

  selectCommerce(commerce: any) {
    console.log(commerce);
  }


  goToTabWithData(partnerName: string) {
    this.goToCommerce.emit(partnerName);
  }
  
  ngOnInit(): void {
    onAuthStateChanged(this.auth, async user => {
      if (user) {
        this.currentUser = user;
      }
    })
  }
}
