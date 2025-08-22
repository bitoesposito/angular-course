import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors, FormArray } from '@angular/forms';
import { debounceTime, of } from 'rxjs';

function samePasswordValidator(control: AbstractControl) {
  const formGroup = control.parent;
  if (!formGroup) return null;
  
  const password = formGroup.get('password')?.value;
  const confirmPassword = control.value;
  
  if (password === confirmPassword) {
    return null;
  }
  
  return { samePassword: true };
}

function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@test.com') {
    return of(null)
  }

  return of({ emailIsNotUnique: true });
}

let initialFormValues = {
  email: '',
  firstName: '',
  lastName: '',
  street: '',
  number: '',
  postalCode: '',
  city: '',
  role: '',
  acquisition: [false, false, false],
}

const savedForm = window.localStorage.getItem('saved-signup-form');
if (savedForm) {
  initialFormValues = JSON.parse(savedForm);
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [emailIsUnique]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), samePasswordValidator]
    }),
    firstName: new FormControl('', {
      validators: [Validators.required]
    }),
    lastName: new FormControl('', {
      validators: [Validators.required]
    }),
    street: new FormControl('', {
      validators: [Validators.required]
    }),
    number: new FormControl('', {
      validators: [Validators.required]
    }),
    postalCode: new FormControl('', {
      validators: [Validators.required]
    }),
    city: new FormControl('', {
      validators: [Validators.required]
    }),
    role: new FormControl('', {
      validators: [Validators.required]
    }),
    acquisition: new FormArray([
      new FormControl(false),
      new FormControl(false),
      new FormControl(false)
    ]),
    terms: new FormControl(false, {
      validators: [Validators.required]
    })
  })

  ngOnInit() {

    const savedForm = window.localStorage.getItem('saved-signup-form');
    if (savedForm) {
      this.form.patchValue(JSON.parse(savedForm));
    }

    const subscription = this.form.valueChanges.pipe(debounceTime(500)).subscribe({
      next: value => {
        window.localStorage.setItem('saved-signup-form', JSON.stringify({
          email: value.email,
          firstName: value.firstName,
          lastName: value.lastName,
          street: value.street,
          number: value.number,
          postalCode: value.postalCode,
          city: value.city,
          role: value.role,
          acquisition: value.acquisition
        }));
      }
    })

    this.destroyRef.onDestroy(() => {
      console.log('destroy');
    })
  }

  get acquisitionArray() {
    return this.form.get('acquisition') as FormArray;
  }

  onSubmit() {
    console.log(this.form.value);
  }
}