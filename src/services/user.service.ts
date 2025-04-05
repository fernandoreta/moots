import { inject, Injectable } from '@angular/core';
import { deleteField, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { IPartners, IUSer } from '../interfaces/user.interface';
import { LoadingService } from './loading.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private loadingService: LoadingService) { }
  private firestore = inject(Firestore);
  private userDataSubject = new BehaviorSubject<any | null>(null);
  userData$ = this.userDataSubject.asObservable();

  private partnerNameSubject = new BehaviorSubject<any | null>(null);
  partnerName$ = this.partnerNameSubject.asObservable();

  setUserData(data: any) {
    this.userDataSubject.next(data);
  }

  setPartnerName(data: string) {
    this.partnerNameSubject.next(data);
  }

  private getUserRef(uid: string) {
    return doc(this.firestore, 'users', uid);
  }

  getPartners() {
    const partners = {
      moots: {
        points: 0,
        stamps: 0,
        rewards: [] as any[]
      },
      localcoffee: {
        points: 0,
        stamps: 0,
        rewards: [] as any[]
      }
    };
    return partners;
  }

  async createUserDocument(user: User) {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
  
    const userData: IUSer = {
      displayName: user.displayName || '',
      email: user.email || '',
      createdAt: new Date(),
      partners: this.getPartners()
    };
  
    await setDoc(userRef, userData);
    this.loadingService.hide();
    console.log('✅ Documento creado para el usuario con estructura de negocios vacía');
  }  

  async getUserData(user: User): Promise<IPartners> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);  
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as IPartners;
      this.loadingService.hide();
      return data;
    }
    return {} as any;
  }

  async addPoints(user: User, amount: number): Promise<void> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const partnerId = this.partnerNameSubject.getValue();
      const current = snap.data()['partners'][partnerId]['points'] ?? 0;
      await updateDoc(userRef, {
        [`partners.${partnerId}.points`]: current + amount
      });
    }
    this.loadingService.hide();
  }

  async addStamps(user: User, amount: number): Promise<void> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const partnerId = this.partnerNameSubject.getValue();
      const current = snap.data()['partners'][partnerId]['stamps'] ?? 0;
      await updateDoc(userRef, {
        [`partners.${partnerId}.stamps`]: current + amount
      });
    }
    this.loadingService.hide();
  }

  async updateUser(user: User, data: any): Promise<void> {
    this.loadingService.show();
    await updateDoc(this.getUserRef(user.uid), data);
    this.loadingService.hide();
  }

  async setUserField(user: User, field: string, value: any): Promise<void> {
    this.loadingService.show();
    await updateDoc(this.getUserRef(user.uid), { [field]: value });
    this.loadingService.hide();
  }

  async deleteUserField(user: User, field: string): Promise<void> {
    this.loadingService.show();
    await updateDoc(this.getUserRef(user.uid), { [field]: deleteField() });
    this.loadingService.hide();
  }
}
