import { Component, EventEmitter, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';

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
export class DashboardComponent {
  @Output() goToCommerce = new EventEmitter<any>();

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
  
}
