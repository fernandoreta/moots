import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { IUSerData } from '../../interfaces/user.interface';

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
}
