import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IAllPartners, IPartners, IReward, IUSer } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';

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
  title = 'Escanea el usuario';
  currentUser!: User;
  currentUserInfo!: any;
  currentAdminData!: IUSer | any;
  
  userData!: any;
  partnerName!: string;
  partnerInfo!: IAllPartners;
  longText = `La información del usuario se mostrara aqui.`;
  hagridId = 'HDDPgDNFAoRbEnUbr4Vk3Y7FgUN2';
  
  scanQr() {

  }

  async modifyStamp(stamp: number) {
    await this.userService.addStamps(this.hagridId, stamp);
    this.userData = await this.userService.getUserData(this.hagridId);
    if (this.userData.partners[this.partnerName].stamps === this.partnerInfo?.totalSlots) {
      await this.userService.addStamps(this.hagridId, 0);
      await this.userService.addReward(this.hagridId);
      // Get the data to update the view.
      this.userData = await this.userService.getUserData(this.hagridId);
      this.currentUserInfo.rewards = this.userData.partners[this.partnerName]?.rewards || [];
    }
    this.refreshStamps();
  }

  async getUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartners;
    }
  }
  
  async getAdminUserData(userId: string): Promise<any> {
    const userRef = await this.userService.getAdminUserRef(userId);
    const snap = await getDoc(userRef); 
    if (snap.exists()) {
      return snap.data() as IPartners;
    }
  }

  private refreshStamps() {
    this.currentUserInfo.stamps = this.userData.partners[this.partnerName].stamps;
  }

  async ngOnInit() {
    this.loadingService.show();
    this.userData = await this.getUserData(this.hagridId) as any;
    onAuthStateChanged(this.auth, async loggedUser => {
      if (loggedUser) {
        console.log(loggedUser);
        this.currentAdminData = await this.getAdminUserData(loggedUser.uid);
        console.log(this.currentAdminData);

        this.partnerName = this.currentAdminData.partner;
        this.userService.setPartnerName(this.partnerName);
        this.currentUserInfo = this.userData.partners[this.partnerName];
        console.log(this.currentUserInfo);

        const partners = await this.userService.getAllPartners();
        this.partnerInfo = partners.find((partner: IAllPartners) => partner.id === this.partnerName);
        this.loadingService.hide();
        
      }
    });
  }
}
