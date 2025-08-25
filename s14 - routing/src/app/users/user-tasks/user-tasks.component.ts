import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, ResolveFn, RouterLink, RouterOutlet, RouterStateSnapshot } from '@angular/router';

@Component({
  selector: 'app-user-tasks',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './user-tasks.component.html',
  styleUrl: './user-tasks.component.css',
})
export class UserTasksComponent {
  userName = input.required<string>();
  message = input.required<string>()
  // private activatedRoute = inject(ActivatedRoute);

  // ngOnInit() {
  //   this.activatedRoute.data.subscribe({
  //     next: data => {
  //       console.log(data);
        
  //     }
  //   })
  // }
}

export const resolveUserName: ResolveFn<string> = (
  actvatedRoute: ActivatedRouteSnapshot
) => {
  const userService = inject(UsersService);
  const userName = userService.users.find(user => user.id === actvatedRoute.paramMap.get('userId'))?.name;
  return userName ?? 'No user found';
}

export const resolveTitle: ResolveFn<string> = (
  activatedRoute,
  routerState
) => {
  return resolveUserName(activatedRoute, routerState) + `'s Tasks`
}