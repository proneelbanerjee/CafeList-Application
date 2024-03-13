import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service'; // Import ApiService

interface LoginResponse {
  message: string;
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private apiService: ApiService, // Inject ApiService
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  hasAuthToken(): boolean {
    return !!sessionStorage.getItem('auth_token');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      this.apiService.login(loginData).subscribe(
        (response: LoginResponse) => {
          this.authService.setAuthToken(response.token);
          var loggedToken = localStorage.getItem('auth_token') || '';
          var extractedToken = loggedToken.split('.')[1];
          var _atobdata = atob(extractedToken);
          var finaldata = JSON.parse(_atobdata);
          if (finaldata.role == 'admin' || finaldata.role=='superadmin') {
            this.router.navigate(['/dashboard']);

          }else{
            this.router.navigate(['/users']);
          }

        },
        (error) => {
          //console.error('Login failed:', error);
          if (error.status === 404) {
            alert('Incorrect email entered.');
          } else {
            alert('Incorrect password entered.');
          }
        }
      );
    }
  }

}
