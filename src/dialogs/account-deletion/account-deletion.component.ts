import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";

@Component({
  selector: 'account-deletion',
  templateUrl: 'account-deletion.component.html',
  imports: [ MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent ]
})
export class AccountDeletionComponent {
    readonly dialogRef = inject(MatDialogRef<AccountDeletionComponent>);
}