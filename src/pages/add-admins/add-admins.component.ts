import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { from, merge, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../services/user.service';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-admins',
  imports: [
    MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, CommonModule, MatSelectModule
  ],
  templateUrl: './add-admins.component.html',
  styleUrl: './add-admins.component.scss'
})
export class AddAdminsComponent {
  private userService = inject(UserService);
  readonly email = new FormControl('', [Validators.required, Validators.email]);
  private auth = inject(Auth);
  errorMessage = signal('');
  private _snackBar = inject(MatSnackBar);
  form = new FormGroup({
    email: new FormControl('', [ Validators.required, Validators.email ]),
    name: new FormControl('', [ Validators.required ]),
    password: new FormControl('', [ Validators.required ]),
    partner: new FormControl('', [ Validators.required ])
  });

  // partners$: Observable<string[]> = of(['admin', 'superadmin', 'manager']);
  partners$: Observable<any[]> = from(this.userService.getAllPartners());

  constructor() {
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
  }

  submitForm() {
    if (this.form.valid) {
      console.log(this.form.value);
      const { name, email, password, partner } = this.form.value;
      createUserWithEmailAndPassword(
        this.auth,
        email ? email : '',
        password ? password : ''
      ).then(async (cred) => {
        await this.userService.createUserDocument(
          cred.user,
          true,
          partner ? partner : ''
        );
        await updateProfile(cred.user, { displayName: name });
        this._snackBar.open('✅ Registro exitoso: ' + email);
        this.form.reset();
      })
      .catch((error) => {
        this._snackBar.open('❌ Error al registrar: ' + error.message);
        this.form.reset();
      });
    }
  }
}
