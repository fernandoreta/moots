import { inject, Injectable } from '@angular/core';
import { deleteField, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { IUSerData } from '../interfaces/user.interface';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private loadingService: LoadingService) { }
  private firestore = inject(Firestore);

  private getUserRef(uid: string) {
    return doc(this.firestore, 'users', uid);
  }
  

  async createUserDocument(user: User) {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
    await setDoc(userRef, {
      points: 0,
      stamps: 0,
      displayName: user.displayName || '',
      email: user.email || '',
      createdAt: new Date()
    });
    this.loadingService.hide();
    console.log('✅ Documento creado para el usuario con puntos en 0');
  }

  async getUserData(user: User): Promise<IUSerData> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);  
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as IUSerData;
      this.loadingService.hide();
      return data;
    }
    return {};
  }

  async addPoints(user: User, amount: number): Promise<void> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const current = snap.data()['points'] ?? 0;
      await updateDoc(userRef, { points: current + amount });
    }
    this.loadingService.hide();
  }

  async addStamps(user: User, amount: number): Promise<void> {
    this.loadingService.show();
    const userRef = this.getUserRef(user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const current = snap.data()['stamps'] ?? 0;
      await updateDoc(userRef, { stamps: current + amount });
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
