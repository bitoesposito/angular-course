import { bootstrapApplication } from '@angular/platform-browser';
import { HttpEventType, HttpHandlerFn, HttpRequest, HttpResponse, provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { tap } from 'rxjs';

function loggingInterceptor(request: HttpRequest<any>, next: HttpHandlerFn) {
  const req = request.clone({
    headers: request.headers.set('X-DEBUG', 'TESTING')
  })

  console.log('Logging interceptor');
  console.log(request);
  return next(request).pipe(
    tap({
      next: event => {
        if (event.type === HttpEventType.Response) {
          console.log('Response received');
          console.log(event);
        }
      }
    })
  )
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([loggingInterceptor])
    )
  ]
}).catch((err) => console.error(err));
