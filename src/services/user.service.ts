import { inject, Injectable } from '@angular/core';
import { deleteField, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { arrayUnion, collectionGroup, getDoc, getDocs } from 'firebase/firestore';
import { IPartner, IReward, IUSerData } from '../interfaces/user.interface';
import { LoadingService } from './loading.service';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private loadingService: LoadingService,
    private snackService: MatSnackBar
  ) { }

  private firestore = inject(Firestore);
  private userDataSubject = new BehaviorSubject<any | null>(null);
  userData$ = this.userDataSubject.asObservable();

  partnerNameSubject = new BehaviorSubject<any | null>(null);
  partnerName$ = this.partnerNameSubject.asObservable();

  setUserData(data: any) {
    this.userDataSubject.next(data);
  }

  setPartnerName(data: string) {
    this.partnerNameSubject.next(data);
  }

  getUserRef(uid: string) {
    return doc(this.firestore, 'users', uid);
  }

  getAdminUserRef(uid: string) {
    return doc(this.firestore, 'admin-users', uid);
  }

  async getAllPartners(): Promise<IPartner[] | any> {
    const partnersSnapshot = await getDocs(collectionGroup(this.firestore, 'partners'));
    const partners = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return partners;
  }

  async createUserDocument(user: User, isAdmin?: boolean, partner?: string) {
    this.loadingService.show();
    const userRef = isAdmin ? this.getAdminUserRef(user.uid) : this.getUserRef(user.uid);
  
    const baseData: IUSerData = {
      displayName: user.displayName || '',
      email: user.email || '',
      createdAt: new Date()
    };
    
    const userData = {
      ...baseData,
      ...(isAdmin
        ? { partner: partner, isAdmin: true }
        : { partners: await this.getAllPartners() }
      )
    };    
  
    await setDoc(userRef, userData);
    this.loadingService.hide();
    console.log('✅ Documento creado para el usuario con estructura de negocios vacía');
  }  

  async getUserData(uid: string): Promise<IUSerData> {
    this.loadingService.show();
    try {
      const userRef = this.getUserRef(uid);
      const snap = await getDoc(userRef);
  
      if (snap.exists()) {
        const data = snap.data() as IUSerData;
        return data;
      }
      return {} as any;
    } catch (error) {
      this.snackService.open('Error al obtener datos del usuario');
      return {} as any;
    } finally {
      this.loadingService.hide();
    }
  }
  
  async addPoints(user: User, amount: number): Promise<void> {
    this.loadingService.show();
    try {
      const userRef = this.getUserRef(user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const partnerId = this.partnerNameSubject.getValue();
        const current = snap.data()['partners'][partnerId]['points'] ?? 0;
        await updateDoc(userRef, {
          [`partners.${partnerId}.points`]: current + amount
        });
      }
    } catch (error) {
      this.snackService.open('Error al agregar puntos');
    } finally {
      this.loadingService.hide();
    }
  }
  
  async addStamps(uid: string, amount: number): Promise<void> {
    this.loadingService.show();
    try {
      const userRef = this.getUserRef(uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const partnerId = this.partnerNameSubject.getValue();
        const current = snap.data()['partners'][partnerId]['stamps'] ?? 0;
        await updateDoc(userRef, {
          [`partners.${partnerId}.stamps`]: amount !== 0 ? current + amount : 0
        });
      }
    } catch (error) {
      this.snackService.open('Error al agregar sellos');
    } finally {
      this.loadingService.hide();
    }
  }
  
  async addReward(uid: string): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
      const partnerId = this.partnerNameSubject.getValue();
  
      const reward: IReward = {
        name: 'Café gratis',
        claimed: false,
        createdAt: new Date().toISOString(),
      };
  
      await updateDoc(userRef, {
        [`partners.${partnerId}.rewards`]: arrayUnion(reward)
      });
    } catch (error) {
      this.snackService.open('Error al agregar recompensa');
    }
  }
  
  async updateUser(user: User, data: any): Promise<void> {
    this.loadingService.show();
    try {
      await updateDoc(this.getUserRef(user.uid), data);
    } catch (error) {
      this.snackService.open('Error al actualizar usuario');
    } finally {
      this.loadingService.hide();
    }
  }
  
  async setUserField(user: User, field: string, value: any): Promise<void> {
    this.loadingService.show();
    try {
      await updateDoc(this.getUserRef(user.uid), { [field]: value });
    } catch (error) {
      this.snackService.open('Error al establecer campo de usuario');
    } finally {
      this.loadingService.hide();
    }
  }
  
  async deleteUserField(user: User, field: string): Promise<void> {
    this.loadingService.show();
    try {
      await updateDoc(this.getUserRef(user.uid), { [field]: deleteField() });
    } catch (error) {
      this.snackService.open('Error al eliminar campo de usuario');
    } finally {
      this.loadingService.hide();
    }
  }
  
}
