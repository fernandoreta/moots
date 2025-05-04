import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { SnackDialogComponent } from '../dialogs/SnackDialog/snack-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class SnackService {
    private _snackBar = inject(MatSnackBar);
    constructor() { }
    
    openSnackBar() {
        this._snackBar.openFromComponent(SnackDialogComponent, {
        duration: 5000,
        });
    }
}
