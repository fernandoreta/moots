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
  currentStamps!: number;
  selectedUserPartner!: IPartner;
  partners!: IPartner[];
  rewards!: IReward[] | undefined;
  // hagridId = 'HDDPgDNFAoRbEnUbr4Vk3Y7FgUN2';
  currentId!: string;
  private router = inject(Router);
  private scanTimeout: any;

  async removeReward(rewardToRemove: IReward) {
    await this.userService.removeReward(this.currentId, rewardToRemove, this.userData);
    this.loadUserDataById(this.currentId);
  }
  

  async modifyStamp(stamp: number) {
    this.loadingStamps = true;
    console.log(this.partnerInfo);
    await this.userService.addStamps(
      this.currentId,
      this.selectedUserPartner.activeSlots + stamp,
      this.userData
    );
    // Get the data to update the view.
    await this.loadUserDataById(this.currentId);
    if (this.adminData.partner) {
      const partnerIndex = this.userData.partners.findIndex((p: IPartner) => p.id === this.adminData.partner);
      if (this.userData.partners[partnerIndex].activeSlots === this.partnerInfo?.totalSlots) {
        await this.userService.addStamps(this.currentId, 0, this.userData);
        // load data before you update the rewards/
        await this.loadUserDataById(this.currentId);
        const reward: IReward = {
          name: this.partnerInfo?.reward,
          createdAt: new Date().toISOString(),
        }
        await this.userService.addReward(this.currentId, reward, this.userData);
        // this.userData.partners[partnerIndex].rewards = this.userData.partners[partnerIndex]?.rewards || [];
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
    this.selectedUserPartner = this.userData.partners.find((partner: IPartner | any) => {
      if(partner.id === this.partnerInfo?.id) {
        return partner;
      }
    });
    this.rewards = this.selectedUserPartner.rewards;
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
    // if (this.currentId) {
    //   await this.loadUserDataById(this.currentId);
    // }
    onAuthStateChanged(this.auth, async loggedUser => {
      if (loggedUser) {
        this.adminData = await this.getAdminUserData(loggedUser.uid);
        if (this.adminData.partner) {
          this.userService.setPartnerName(this.adminData.partner);
          this.partners = await this.userService.getAllPartnersAuthApi();
          this.partnerInfo = this.partners.find((partner: IPartner) => partner.id === this.adminData.partner);
        }
      }
    });
  }
}
