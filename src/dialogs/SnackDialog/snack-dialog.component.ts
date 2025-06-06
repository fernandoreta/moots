import { Component, Inject, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_SNACK_BAR_DATA, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
    selector: 'snack-dialog.component',
    templateUrl: 'snack-dialog.component.html',
    styles: `
      :host {
        display: flex;
      }
  
      .example-pizza-party {
        color: hotpink;
      }
    `,
    imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  })
  export class SnackDialogComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
    snackBarRef = inject(MatSnackBarRef);
  }
