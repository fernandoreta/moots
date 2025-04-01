import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

const firebaseConfig = {
  apiKey: "AIzaSyAcifCX9yUoJD51IX-oz0rNyRDfCFIXbRU",
  authDomain: "localsporty-dd525.firebaseapp.com",
  databaseURL: "https://localsporty-dd525-default-rtdb.firebaseio.com",
  projectId: "localsporty-dd525",
  storageBucket: "localsporty-dd525.firebasestorage.app",
  messagingSenderId: "715512929291",
  appId: "1:715512929291:web:de547d7e340e6f2cc5bb0e",
  measurementId: "G-CLTF2B9CB1"
};

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter([]),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
}).catch((err) => console.error(err));
