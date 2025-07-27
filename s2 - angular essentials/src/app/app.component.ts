import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { UserComponent } from './components/user/user.component';
import { DUMMY_USERS } from './components/user/dummy-users';
import { TasksComponent } from './components/tasks/tasks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    UserComponent,
    TasksComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  users = DUMMY_USERS;

  onSelectUserLog(id: string) {
    console.log('app log: ' + id);
  } 
}
