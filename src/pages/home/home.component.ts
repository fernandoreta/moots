import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { IUSerData } from '../../interfaces/user.interface';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatButtonModule,
    CommonModule
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  maxPoints = 100;
  stamps = [
    { number: 1, active: true },
    { number: 2, active: true },
    { number: 3, active: true },
    { number: 4, active: false },
    { number: 5, active: false },
    { number: 6, active: false },
    { number: 7, active: false },
    { number: 8, active: false },
    { number: 9, active: false },
    { icon: 'card_giftcard', active: false }
  ];
  
  @Input() currentUser!: any;
  @Input() userData!: any;
  private userService = inject(UserService);
  
  async modifyStar(star: number) {
    await this.userService.addPoints(this.currentUser , star);
    this.userData = await this.userService.getUserData(this.currentUser);
  }

  async modifyStamp(stamp: number) {
    await this.userService.addStamps(this.currentUser , stamp);
    this.userData = await this.userService.getUserData(this.currentUser);
    this.refreshStamps();
  }

  refreshStamps() {
    this.stamps.forEach(stamp => {
      if (stamp?.number && 'number' in stamp) {
        stamp.active = stamp.number <= this.userData.stamps;
      }
    });
  }

  ngOnInit(): void {
    this.refreshStamps();
  }
}
