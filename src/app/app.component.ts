import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { Capacitor } from "@capacitor/core";
import { browserLocalPersistence, setPersistence, getAuth, inMemoryPersistence } from 'firebase/auth';
import { UserService } from "../services/user.service";

@Component({
  selector: 'app-root',
  imports: [
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  
  constructor(private user: UserService) {}


  async ngOnInit() {
    
  }
}
