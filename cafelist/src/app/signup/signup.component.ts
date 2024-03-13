import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service'; // Import ApiService

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService // Inject ApiService
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  hasAuthToken(): boolean {
    return !!sessionStorage.getItem('auth_token');
  }
  
  onSubmit() {
    if (this.signupForm.valid) {
      const signupData = this.signupForm.value;

      this.apiService.signup(signupData).subscribe(
        (response) => {
          console.log('Signup successful:', response);
          alert('Signup Successful');
          // Handle successful signup response here
        },
        (error) => {
          console.error('Signup failed:', error);
          // Handle signup error here
        }
      );
    }
  }
}
