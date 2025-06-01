import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IPartner, IPartnerData, IReward, IUSerData } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getDoc } from '@angular/fire/firestore';
import { Auth, signOut } from '@angular/fire/auth';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SnackService } from '../../services/utils.service';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-page',
  imports: [
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(Auth);
  private loadingService = inject(LoadingService);
  private snackService = inject(SnackService);
  loadingStamps!: boolean;
  title = 'Escanea el usuario';
  adminData!: IUSerData;
  userData!: IUSerData;
  partnerInfo!: IPartner | undefined;
  // hagridId = 'HDDPgDNFAoRbEnUbr4Vk3Y7FgUN2';
  currentId!: string;
  private router = inject(Router);
  private scanTimeout: any;

  async removeReward(rewardToRemove: IReward) {
    await this.userService.removeReward(this.currentId, rewardToRemove);
    this.loadUserDataById(this.currentId);
  }
  

  async modifyStamp(stamp: number) {
    this.loadingStamps = true;
    await this.userService.addStamps(this.currentId, stamp);
    // Get the data to update the view.
    await this.loadUserDataById(this.currentId);
    if (this.adminData.partner) {
      if (this.userData.partners[this.adminData.partner].stamps === this.partnerInfo?.totalSlots) {
        await this.userService.addStamps(this.currentId, 0);
        await this.userService.addReward(this.currentId);
        this.userData.partners[this.adminData.partner].rewards = this.userData.partners[this.adminData.partner]?.rewards || [];
        await this.loadUserDataById(this.currentId);
      }
      this.loadingStamps = false;
    }
  }

  async getUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartnerData;
    } else {
      this.snackService.openSnackBar();
    }
  }
  
  async getAdminUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getAdminUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartnerData;
    }
  }

  logout() {
    signOut(this.auth)
      .then(() => {
        // this.data.currentUser = undefined as any;
        // this.dialogRef.close(false);
        console.log('👋 Sesión cerrada');
        this.router.navigateByUrl('');
      })
      .catch((error) => {
        this.snackService.openSnackBar();
      });
  }

  private async loadUserDataById(id: string) {
    this.userData = await this.getUserData(id);
  }

  onScan(id: string) {
    clearTimeout(this.scanTimeout); // cancela el anterior si sigue activo

    this.scanTimeout = setTimeout(() => {
      if (id && id.length > 5) {
        this.loadUserDataById(id);
      }
    }, 500);
  }

  async ngOnInit() {
    if (this.currentId) {
      await this.loadUserDataById(this.currentId);
    }
    onAuthStateChanged(this.auth, async loggedUser => {
      if (loggedUser) {
        this.adminData = await this.getAdminUserData(loggedUser.uid);
        if (this.adminData.partner) {
          this.userService.setPartnerName(this.adminData.partner);
          const partners = await this.userService.getAllPartnersAuthApi();
          this.partnerInfo = partners.find((partner: IPartner) => partner.id === this.adminData.partner);
        }
      }
    });
  }
}
