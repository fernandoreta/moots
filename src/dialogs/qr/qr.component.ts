import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'firebase/auth';
import { toCanvas, toDataURL } from 'qrcode';

@Component({
  selector: 'app-qr',
  imports: [CommonModule],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss'
})
export class QrComponent implements OnInit {
  data = inject<{currentUser: User}>(MAT_DIALOG_DATA);
  qrImageUrl!: string;

  ngOnInit() {
    if (this.data.currentUser.uid) {
      console.log(this.data.currentUser.uid);
    toDataURL(this.data.currentUser.uid)
    .then(url => {
      this.qrImageUrl = url;
    }).catch(err => console.error(err));
    }
  }
}
