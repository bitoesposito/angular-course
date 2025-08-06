import { Directive, effect, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Permission } from './auth.model';
import { AuthService } from './auth.service';

@Directive({
  selector: '[appAuth]',
  standalone: true
})
export class AuthDirective {
  @Input({required: true, alias: 'appAuth'}) userType: Permission = 'guest';

  constructor(
    private authService: AuthService,
    private template: TemplateRef<HTMLTemplateElement>,
    private viewContainer: ViewContainerRef
  ) {
    effect(() => {
      if (this.authService.activePermission() === this.userType) {
        this.viewContainer.createEmbeddedView(this.template);
      } else {
        this.viewContainer.clear();
      }
    })
  }

}
