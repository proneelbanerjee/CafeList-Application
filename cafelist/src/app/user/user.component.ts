import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // Import ApiService
import { MasterService } from '../master.service';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  editFresherRole: string = '';
  editAdminRole: string = '';
  editOnbordingstaffRole='';
  users: User[] = [];

  isResultLoaded: boolean = false;
  showUserRegistrationPopup: boolean = false;

  editUser: User | null = null;
  editPassword: string = '';
  showUserEditPopup: boolean = false;


  constructor(private apiService: ApiService, private router: Router, private service: MasterService) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.getAllUsers();
  }

  openUserRegistrationPopup(): void {
    this.showUserRegistrationPopup = true;
  }

  closeUserRegistrationPopup(): void {
    this.showUserRegistrationPopup = false;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.role = '';
  }

  register(): void {
    const bodyData = {
      "firstName": this.firstName,
      "lastName": this.lastName,
      "email": this.email,
      "password": this.password,
      "role": this.role
    };

    this.apiService.signup(bodyData).subscribe(
      (response: any) => {
        console.log(response);
        alert("User Registered Successfully");
        this.getAllUsers();
        this.closeUserRegistrationPopup();
      },
      (error) => {
        console.error('Error occurred while registering user:', error);
        alert('Error occurred while registering user. Please try again.');
      }
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getAllUsers(): void {
    this.apiService.getUsers().subscribe(
      (response: any) => {
        this.users = response;
      },
      (error) => {
        console.error('Error occurred while fetching users:', error);
      }
    );
  }

  fetchUsers(): void {
    this.apiService.getUsers().subscribe(
      users => {
        this.users = users;
        this.isResultLoaded = true;
      },
      error => {
        console.error('Error occurred while fetching users:', error);
      }
    );
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.apiService.deleteUser(user.email).subscribe(
        (response: any) => {
          console.log(response);
          alert("User Deleted Successfully");
          this.getAllUsers();
        },
        (error) => {
          console.error('Error occurred while deleting user:', error);
          alert('Error occurred while deleting user. Please try again.');
        }
      );
    }
  }

  openEditUserPopup(user: User): void {
    this.editUser = { ...user };
// Set the initial value based on user's role
    this.showUserEditPopup = true;
  }

  closeEditUserPopup(): void {
    this.editUser = null;
    this.editPassword = '';
    this.showUserEditPopup = false;
  }

  saveEditedUser(): void {
    if (this.editUser) {
      this.apiService.updateUser(this.editUser.email, { email: this.editUser.email, password: this.editPassword }).subscribe(
        (response: any) => {
          if (response && response.success) {
            this.updateUserDetails();
          } else {
            alert('Password does not match. Please enter the correct password.');
          }
        },
        (error) => {
          console.error('Error occurred while verifying password:', error);
          alert('Error occurred while verifying password. Please try again.');
        }
      );
    }
  }

  updateUserDetails(): void {
    if (this.editUser) {
      // Use the properties for role checkboxes
      const role = this.editFresherRole ? 'fresher' : (this.editAdminRole ? 'admin' : (this.editOnbordingstaffRole ? 'onboardingstaff' : '')); // Change 'user' to 'fresher'
      const bodyData = {
        firstName: this.editUser.firstName,
        lastName: this.editUser.lastName,
        email: this.editUser.email,
        password: this.editPassword,
        role: role
      };

      this.apiService.updateUser(this.editUser.email, bodyData).subscribe(
        (response: any) => {
          console.log(response);
          alert("User updated successfully");
          this.getAllUsers();
          this.closeEditUserPopup();
        },
        (error) => {
          console.error('Error occurred while updating user:', error);
          alert('Error occurred while updating user. Please try again.');
        }
      );
    }
  }



  userAndPermissionRole() {
    var loggedToken = localStorage.getItem('auth_token') || '';
    var extractedToken = loggedToken.split('.')[1];
    var _atobdata = atob(extractedToken);
    var finaldata = JSON.parse(_atobdata);
    if (finaldata.role == 'fresher' || finaldata.role=='onboardingstaff') {
      return true;
    }
    return false;
  }
}
