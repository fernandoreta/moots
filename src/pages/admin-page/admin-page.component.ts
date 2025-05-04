import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IPartner, IPartnerData, IUSerData } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getDoc } from '@angular/fire/firestore';
import { Auth, signOut } from '@angular/fire/auth';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SnackService } from '../../services/utils.service';

@Component({
  selector: 'app-admin-page',
  imports: [MatCardModule, MatChipsModule, MatProgressBarModule, CommonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(Auth);
  private loadingService = inject(LoadingService);
  private snackService = inject(SnackService);
  title = 'Escanea el usuario';
  adminData!: IUSerData;
  userData!: IUSerData;
  partnerInfo!: IPartner | undefined;
  hagridId = 'HDDPgDNFAoRbEnUbr4Vk3Y7FgUN2';
  private router = inject(Router);
  
  scanQr() {

  }

  async modifyStamp(stamp: number) {
    await this.userService.addStamps(this.hagridId, stamp);
    this.userData = await this.userService.getUserData(this.hagridId);
    if (this.adminData.partner) {
      if (this.userData.partners[this.adminData.partner].stamps === this.partnerInfo?.totalSlots) {
        await this.userService.addStamps(this.hagridId, 0);
        await this.userService.addReward(this.hagridId);
        // Get the data to update the view.
        this.userData = await this.userService.getUserData(this.hagridId);
        console.log(this.userData)
        this.userData.partners[this.adminData.partner].rewards = this.userData.partners[this.adminData.partner]?.rewards || [];
      }
      this.refreshStamps();
    }
  }

  async getUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartnerData;
    }
  }
  
  async getAdminUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getAdminUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartnerData;
    }
  }

  private refreshStamps() {
    if (this.adminData.partner) {
      this.userData.partners[this.adminData.partner].stamps = this.userData.partners[this.adminData.partner].stamps;
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

  async ngOnInit() {
    // this.loadingService.show();
    if (this.hagridId) {
      this.userData = await this.getUserData(this.hagridId) as any;
      console.log(this.userData);
    }
    onAuthStateChanged(this.auth, async loggedUser => {
      if (loggedUser) {
        this.adminData = await this.getAdminUserData(loggedUser.uid);
        if (this.adminData.partner) {
          console.log(this.adminData);
          this.userService.setPartnerName(this.adminData.partner);
          // this.currentUserData = this.userData.partners[this.adminData.partner];
          // console.log(this.currentUserData);
  
          const partners = await this.userService.getAllPartnersAuthApi();
          this.partnerInfo = partners.find((partner: IPartner) => partner.id === this.adminData.partner);
          console.log(this.partnerInfo)
          this.loadingService.hide();
        }
      }
    });
  }
}
