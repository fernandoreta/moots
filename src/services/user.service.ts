import { inject, Injectable } from '@angular/core';
import { deleteField, doc, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';
import { browserLocalPersistence, User } from 'firebase/auth';
import { arrayRemove, arrayUnion, collectionGroup, getDoc, getDocs } from 'firebase/firestore';
import { IPartner, IReward, IUSerData } from '../interfaces/user.interface';
import { LoadingService } from './loading.service';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firebaseConfig } from '../main';

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

  async callFirestoreRest<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: any
  ): Promise<T> {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) throw new Error('No auth token');
  
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || 'Firestore REST error');
  
    return data;
  }  

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

  async getUserData(uid: string): Promise<IUSerData> {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
    try {
      const dataJson = await this.callFirestoreRest<any>('GET', url);
      const data = this.parseFirestoreUser(dataJson);
      return data;
    } catch (err) {
      console.error('❌ Error REST getUserData:', err);
      return {} as any;
    }
  }

  async getAllPartners(): Promise<IPartner[]> {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents:runQuery`;
  
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'partners', allDescendants: true }]
      }
    };
  
    try {
      const results = await this.callFirestoreRest<any[]>('POST', url, body);
  
      return results
        .filter(r => r.document)
        .map(r => {
          const doc = r.document;
          const id = doc.name.split('/').pop() || '';
          const fields = doc.fields || {};
  
          return {
            id,
            class: fields.class?.stringValue || `${id}-card`,
            activeSlots: 0,
            totalSlots: parseInt(fields.totalSlots?.integerValue ?? '0'),
            superuser: fields.superuser?.stringValue,
            background: fields.background?.stringValue,
            monthPromo: fields.monthPromo?.stringValue,
          };
        });
    } catch (err) {
      console.error('❌ Error getAllPartners:', err);
      return [];
    }
  }

  async deleteUserDoc() {
    const idToken = localStorage.getItem('idToken');
    const projectId = firebaseConfig.projectId;
    const userId = this.extractUserIdFromToken(idToken);
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}`;
    await fetch(url, { method: 'DELETE' });
  }

  private extractUserIdFromToken(token: string | null): string {
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || '';
  }

  async createUserDoc(userName: string, email: string, localId: string) {
    try {
      const projectId = firebaseConfig.projectId;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${localId}`;
      
      const partnersArray = (await this.getAllPartners()).map((p: any) => ({
        mapValue: {
          fields: {
            id: { stringValue: p.id },
            class: { stringValue: p.class },
            totalSlots: { integerValue: p.totalSlots },
            background: { stringValue: p.background || '' },
            superuser: { stringValue: p.superuser || '' },
            activeSlots: { integerValue: p.activeSlots || 0 },
            rewards: { arrayValue: { values: [] } }
          }
        }
      }));      
      const userDoc = {
        fields: {
          displayName: { stringValue: userName },
          email: { stringValue: email },
          createdAt: { timestampValue: new Date().toISOString() },
          partners: {
            arrayValue: {
              values: partnersArray
            }
          }
        }
      };      
  
      const docRes = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(userDoc)
      });
  
      if (!docRes.ok) {
        this.snackService.open('Error Registrando');
        throw new Error('No se pudo crear el documento del usuario');
      }
    } catch (error: any) {
      this.snackService.open('Error Registrando');
    }
  }

  async addStamps(uid: string, amount: number, userData: IUSerData): Promise<void> {
    this.loadingService.show();
    try {
      const userRef = this.getUserRef(uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const partnerId = this.partnerNameSubject.getValue();
        const partners = userData.partners || [];
        const partnerIndex = partners.findIndex((p: any) => p.id === partnerId);
        if (partnerIndex !== -1) {
          const updatedPartners = [...partners];
          updatedPartners[partnerIndex] = {
            ...updatedPartners[partnerIndex],
            activeSlots: amount,
          };
          await updateDoc(userRef, {
            partners: updatedPartners,
          });
        }
      }
    } catch (error) {
      this.snackService.open('Error al agregar sellos');
    } finally {
      this.loadingService.hide();
    }
  }

  async removeReward(uid: string, reward: IReward): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
      const partnerId = this.partnerNameSubject.getValue();
  
      await updateDoc(userRef, {
        [`partners.${partnerId}.rewards`]: arrayRemove(reward)
      });
    } catch (error) {
      this.snackService.open('Error al eliminar recompensa');
    }
  }

  async addReward(uid: string, reward: IReward, userData: IUSerData): Promise<void> {
    try {
      const userRef = this.getUserRef(uid);
      const partnerId = this.partnerNameSubject.getValue();
      const partners = userData.partners || [];
      const partnerIndex = partners.findIndex((p: any) => p.id === partnerId);

      if (partnerIndex !== -1) {
        const updatedPartners = [...partners];
        const currentRewards = updatedPartners[partnerIndex].rewards || [];
        updatedPartners[partnerIndex] = {
          ...updatedPartners[partnerIndex],
          rewards: [...currentRewards, reward]
        };

        await updateDoc(userRef, {
          partners: updatedPartners
        });
      }
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

  // Auth API
  async createUserDocumentAuthApi(user: User, isAdmin?: boolean, partner?: string) {
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
  
  async getAllPartnersAuthApi(): Promise<IPartner[] | any> {
    const partnersSnapshot = await getDocs(collectionGroup(this.firestore, 'partners'));
    const partners = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return partners;
  }

  async getUserDataAuthApi(uid: string): Promise<IUSerData> {
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

  // Utils functions
  private parseFirestoreValue(value: any): any {
    if (!value) return undefined; // ⬅️ evita errores con undefined/null
  
    if ('stringValue' in value) return value.stringValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return Number(value.doubleValue);
    if ('booleanValue' in value) return value.booleanValue;
    if ('timestampValue' in value) return new Date(value.timestampValue);
    if ('nullValue' in value) return null;
  
    if ('mapValue' in value) {
      const map = value.mapValue.fields || {};
      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(map)) {
        result[key] = this.parseFirestoreValue(val);
      }
      return result;
    }
  
    if ('arrayValue' in value) {
      const arr = value.arrayValue.values || [];
      return arr.map((val: any) => this.parseFirestoreValue(val));
    }
  
    return undefined;
  }

  private parseFirestoreUser(data: any): IUSerData {
    const fields = data.fields || {};
  
    const rawPartners = this.parseFirestoreValue(fields.partners);
  
    const partners: Record<string, { stamps: number; rewards: string[] }> = {};
  
    for (const partnerName in rawPartners) {
      const partnerData = rawPartners[partnerName];
      const rewardsArray = partnerData.rewards ?? [];
  
      partners[partnerName] = {
        stamps: partnerData.stamps ?? 0,
        rewards: Array.isArray(rewardsArray)
          ? rewardsArray.map((reward: any) => reward.name ?? '')
          : [],
      };
    }
  
    return {
      displayName: this.parseFirestoreValue(fields.displayName),
      email: this.parseFirestoreValue(fields.email),
      createdAt: this.parseFirestoreValue(fields.createdAt),
      isAdmin: this.parseFirestoreValue(fields.isAdmin),
      partner: this.parseFirestoreValue(fields.partner),
      partners,
    };
  }
  
}
