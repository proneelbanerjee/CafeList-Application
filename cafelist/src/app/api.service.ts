import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }

  signup(signupData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, signupData);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);

  }

  getAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analysis`);
  }


  getPermission(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permission`);
  }

  addPermission(permissionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permission`, permissionData);
  }

  deleteUser(email: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${email}`);
  }
  deletePermission(role: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/permission/${role}`);
  }

  updateUser(email: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${email}`, userData);
  }

  updatePermission(role: string, permissionData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/permission/${role}`, permissionData);
  }

}
