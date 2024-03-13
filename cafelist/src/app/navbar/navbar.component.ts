import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // Import ApiService

interface JwtPayload {
  name: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loggedInUserName: string = '';

  constructor(
    private authService: AuthService,
    private apiService: ApiService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    let jwtToken = localStorage.getItem('auth_token');
    if (jwtToken) {
      const decodedToken = atob(jwtToken.split('.')[1]);
      const tokenData: JwtPayload = JSON.parse(decodedToken);
      this.loggedInUserName = `${tokenData.firstName} ${tokenData.lastName}`;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isUsersPageActive(): boolean {
    return this.router.isActive('/users', true);
  }

  isDashboardPageActive(): boolean {
    return this.router.isActive('/dashboard', true);
  }
  isPermissionPageActive(): boolean {
    return this.router.isActive('/permission', true);
  }

  hasAuthToken(): boolean {
    return !!sessionStorage.getItem('auth_token');
  }


}
