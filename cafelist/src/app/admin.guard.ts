import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AdminGuard implements CanActivate{
  constructor(private service:AuthService, private route:Router){
  }

  canActivate(){
   if( this.service.adminAndSuperAdminRole())
   return true
  else{
  alert("You are not authorized")
}

    return false
  }
}


