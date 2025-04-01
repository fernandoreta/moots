import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyCyK-uH4edU0GLDxBw8556AFeYXCJTyojo",
  authDomain: "moots-935b7.firebaseapp.com",
  projectId: "moots-935b7",
  storageBucket: "moots-935b7.firebasestorage.app",
  messagingSenderId: "1036093463652",
  appId: "1:1036093463652:web:fb4337f0728f0d40a21371",
  measurementId: "G-ZPF4MYTJ0H"
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
}).catch((err) => console.error(err));
