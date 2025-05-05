import { Component, inject, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { IReward, IUSerData } from '../../interfaces/user.interface';
import { User } from 'firebase/auth';

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
  partnerName = '';
  rewards: Array<IReward> = [];
  stamps = [
    { number: 1, active: false },
    { number: 2, active: false },
    { number: 3, active: false },
    { number: 4, active: false },
    { number: 5, active: false },
    { number: 6, active: false },
    { number: 7, active: false },
    { number: 8, active: false },
    { number: 9, active: false },
    { icon: 'card_giftcard', active: false }
  ];
  
  @Input() currentUser!: User;
  @Input() userData!: IUSerData;
  private userService = inject(UserService);

  async modifyStamp(stamp: number) {
    await this.userService.addStamps(this.currentUser.uid, stamp);
    this.userData = await this.userService.getUserData(this.currentUser.uid);
    if (this.userData.partners[this.partnerName].stamps === 10) {
      await this.userService.addStamps(this.currentUser.uid, 0);
      await this.userService.addReward(this.currentUser.uid);
      // Get the data to update the view.
      this.userData = await this.userService.getUserData(this.currentUser.uid);
      this.rewards = this.userData.partners[this.partnerName]?.rewards || [];
    }
    this.refreshStamps();
  }

  private refreshStamps() {
    this.stamps.forEach(stamp => {
      if (stamp?.number && 'number' in stamp) {
        stamp.active = stamp.number <= this.userData.partners[this.partnerName].stamps;
      }
    });
  }

  ngOnInit(): void {
    this.userService.userData$.subscribe(data => {
      if (data) {
        this.userData = data;
        if (this.partnerName) {
          this.refreshStamps();
        }
      }
    });
    this.userService.partnerName$.subscribe(partnerName => {
      if (partnerName) {
        this.partnerName = partnerName;
        this.rewards = this.userData?.partners[this.partnerName].rewards;
        console.log(this.rewards)
        this.refreshStamps();
      }
    });
  }
}
