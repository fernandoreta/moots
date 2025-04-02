import { Component, inject, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  imports: [
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    CommonModule
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  maxPoints = 100;

  @Input() currentUser!: any;
  @Input() userData!: any;
  private userService = inject(UserService)
  

  async modifyStar(star: number) {
    await this.userService.addPoints(this.currentUser , star);
    this.userData = await this.userService.getUserData(this.currentUser);
  }
}
