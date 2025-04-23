import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/login/login.component';
import { HomeComponent } from '../pages/home/home.component';
import { AddAdminsComponent } from '../pages/add-admins/add-admins.component';
import { ShellComponent } from '../pages/shell/shell.component';

export const routes: Routes = [
    {
        path: '',
        component: ShellComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'add-admin',
        component: AddAdminsComponent
    }
];
