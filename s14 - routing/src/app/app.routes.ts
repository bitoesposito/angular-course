import { CanMatchFn, RedirectCommand, Router, Routes } from "@angular/router";
import { TasksComponent } from "./tasks/tasks.component";
import { NoTaskComponent } from "./tasks/no-task/no-task.component";
import { resolveTitle, resolveUserName, UserTasksComponent } from "./users/user-tasks/user-tasks.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { routes as userRoutes } from "./users/users.routes";
import { inject } from "@angular/core";

// const dummyCanMatch: CanMatchFn = (route, segments) => {
//   const router = inject(Router);
//   const shouldGetAccess = Math.random()
//   if (shouldGetAccess < .5) {
//     return true;
//   }
//   return new RedirectCommand(router.parseUrl('/unauthorized'));
// }

export const routes: Routes = [
  {
    path: '',
    component: NoTaskComponent,
    title: 'No tasks selected'
  },
  {
    path: 'tasks',
    component: TasksComponent
  },
  {
    path: 'users/:userId',
    component: UserTasksComponent,
    children: userRoutes,
    // canMatch: [
    //   dummyCanMatch
    // ],
    data: {
      message: 'Hello World'
    },
    resolve: {
      userName: resolveUserName
    },
    title: resolveTitle
  },
  {
    path: '**',
    component: NotFoundComponent
  }
]