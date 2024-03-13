import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cafelist';


  hasAuthToken(): boolean {
    return !!sessionStorage.getItem('auth_token');
  }
}

