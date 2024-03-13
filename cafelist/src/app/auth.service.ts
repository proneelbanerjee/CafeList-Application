import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

interface JwtPayload {
  name: string;
  // Add other properties as needed based on your JWT structure
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = 'http://localhost:3000';
  private TOKEN_KEY = 'auth_token';

  // Add loggedInUserName property
  private loggedInUserName: string = '';

  constructor(private http: HttpClient) {}

  setAuthToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    console.log('Token set:', token);
  }

  getAuthToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    console.log('Retrieved Token:', token);
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    console.log('Token:', token);
    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  registerUser(userData: any) {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  isLoggedIn() {
    return localStorage.getItem('auth_token') != null;
  }

  GetToken() {
    return localStorage.getItem('auth_token') || '';
  }


  hasRoles(roles: string[]): boolean {
    var loggedToken = localStorage.getItem('auth_token') || '';
    var extractedToken = loggedToken.split('.')[1];
    var _atobdata = atob(extractedToken);
    var finaldata = JSON.parse(_atobdata);
    // Assuming that the user's roles and permissions are stored in the auth service
    const userRoles = finaldata.role; // Replace with your actual implementation

    // Check if the user has all required roles
    const hasAllRoles = roles.every(role => userRoles.includes(role));

    if (!hasAllRoles) {
      return false;
    }

    // If the user has the 'admin' role, grant access to all pages
    if (userRoles.includes('admin')) {
      return true;
    }

    // If the user has the 'fresher' role, grant access to the 'user' page only
    if (userRoles.includes('fresher') && roles.length === 1 && roles[0] === 'user') {
      return true;
    }

    // If the user has the 'staff' role, grant access to the 'permission' page only
    if (userRoles.includes('staff') && roles.length === 1 && roles[0] === 'permission') {
      return true;
    }

    return false;
  }


  adminAndSuperAdminRole() {
    var loggedToken = localStorage.getItem('auth_token') || '';
    var extractedToken = loggedToken.split('.')[1];
    var _atobdata = atob(extractedToken);
    var finaldata = JSON.parse(_atobdata);
    if (finaldata.role == 'admin' || finaldata.role=='superadmin') {
      console.log('You have access');
      return true;
    }
    return false;
  }


  userAndPermissionRole() {
    var loggedToken = localStorage.getItem('auth_token') || '';
    var extractedToken = loggedToken.split('.')[1];
    var _atobdata = atob(extractedToken);
    var finaldata = JSON.parse(_atobdata);
    if (finaldata.role == 'fresher' || finaldata.role=='onboardingstaff'||finaldata.role == 'admin' || finaldata.role=='superadmin') {
      console.log('You have access');
      return true;
    }
    return false;
  }
}
