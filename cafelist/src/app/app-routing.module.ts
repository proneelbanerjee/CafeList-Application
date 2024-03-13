import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { PermissionComponent } from './permission/permission.component';
import { UserGuard } from './user.guard';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then((m) => m.SignupModule),
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginModule),
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard,AdminGuard] },
  { path: 'users', component: UserComponent, canActivate: [UserGuard] },
  { path: 'permission', component: PermissionComponent, canActivate: [UserGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


/**
 *
 *
 * func()=>{
 * req.user.role===!user
 * true
 * }
 *
 * html> visbility(func())
 *  */
