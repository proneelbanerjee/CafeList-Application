import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../api.service'; // Import ApiService
import { MasterService } from '../master.service';

interface Permissions {
  role: string;
  page: string;
}

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})

export class PermissionComponent implements OnInit {
  role: string = '';
  editPermissionRole: string = '';
  editAdminRole: string = '';
  page: string='';
  permissions: Permissions[] =[];
  isResultLoaded: boolean = false;
  showPermissionRegistrationPopup: boolean = false;
  editPermission: Permissions = { role: '', page: '' };

  // editPermission: Permissions | null = null;
  showPermissionEditPopup: boolean = false;


  constructor(private apiService: ApiService, private router: Router, private service: MasterService) {}

  ngOnInit(): void {
    this.fetchpermission();
    this.getAllpermission();
  }

  openpermissionRegistrationPopup(): void {
    this.showPermissionRegistrationPopup = true;
  }

  closePermissionRegistrationPopup(): void {
    this.showPermissionRegistrationPopup = false;
  }

  register(): void {
    const bodyData = {
      "page": this.page,
      "role": this.role
    };

    this.apiService.addPermission(bodyData).subscribe(
      (response: any) => {
        console.log(response);
        alert("User Registered Successfully");
        this.getAllpermission();
        this.closePermissionRegistrationPopup();
        this.role=''
        this.page=''
      },
      (error) => {
        console.error('Error occurred while registering user:', error);
        alert('Error occurred while registering user. Please try again.');
      }
    );

  }


  getAllpermission(): void {
    this.apiService.getPermission().subscribe(
      (response: any) => {
        this.permissions = response;
      },
      (error) => {
        console.error('Error occurred while fetching permission:', error);
      }
    );
  }


  fetchpermission(): void {
    this.apiService.getPermission().subscribe(
      permission => {
        this.permissions = permission
        this.isResultLoaded = true;
      },
      error => {
        console.error('Error occurred while fetching permission:', error);
      }
    );
  }

  deletePermissionRole(permission: Permissions): void {
    console.log(permission)
    if (confirm(`Are you sure you want to delete ${permission.role}`)) {
      this.apiService.deletePermission(permission.role).subscribe(
        (response: any) => {
          console.log(response);
          alert("Permission Deleted Successfully");
          this.getAllpermission();
        },
        (error) => {
          console.error('Error occurred while deleting Permission:', error);
          alert('Error occurred while deleting Permission. Please try again.');
        }
      );
    }
  }

  openEditPermissionPopup(permission: Permissions): void {
    this.editPermission = { ...permission };
// Set the initial value based on user's role
    this.showPermissionEditPopup = true;
  }

  closeEditpermissionPopup(): void {
    this.showPermissionEditPopup = false;
  }

  saveeditPermission(): void {
    if (this.editPermission) {
      this.apiService.updatePermission(this.editPermission.role, {
        role: this.editPermission.role,
        page: this.editPermission.page,
      }).subscribe(
        (response: any) => {
          if (response && response.success) {
            this.updateUserDetails();
            this.closeEditpermissionPopup(); // Move the closeEditpermissionPopup inside the success block
          } else {
            // Handle the case where the update was not successful
          }
        },
        (error) => {
          console.error('Error occurred while updating permission:', error);
          // Handle the error case
        }
      );
    }
  }

  updateUserDetails(): void {
    if (this.editPermission) {
      const bodyData = {
        role: this.editPermission.role,
        page: this.editPermission.page, // Adjust the property names based on your data model
      };

      this.apiService.updatePermission(this.editPermission.role, bodyData).subscribe(
        (response: any) => {
          console.log(response);
          alert('Permission updated successfully');
          this.getAllpermission();
          // Don't close the popup here
        },
        (error) => {
          console.error('Error occurred while updating permission:', error);
          alert('Error occurred while updating permission. Please try again.');
          // Handle the error case
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


/**
 *
 * roles: admin, fresher, super admin, onboardingstaff, onboardingstaff
 *
 * userid, roles, pagename
 *
 * 1 admin all
 * 2 onboardingstaff user
 * 2 onboardingstaff permission
 *
 * new table
 *
 * if role is admin: pagename=All
 *
 *
 * logic: Roleguard
 *
 * if deleted from user table it is not getting deleted from the permission table.
 */

