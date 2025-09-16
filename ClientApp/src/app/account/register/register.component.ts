import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from 'src/app/shared/models/account/user';
import { SharedService } from 'src/app/shared/shared.service';
import { AccountService } from '../account.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];

  // For password strength display
  passwordStrengthText: string = 'Password strength';
  passwordStrengthClass: string = '';

  constructor(
    private accountService: AccountService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
      terms: [false, [Validators.requiredTrue]] // add terms checkbox validation here
    });

    // Subscribe to password value changes to update strength
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  checkPasswordStrength(password: string) {
    let strength = 0;

    if (!password) {
      this.passwordStrengthText = 'Password strength';
      this.passwordStrengthClass = '';
      return;
    }

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        this.passwordStrengthClass = 'weak';
        this.passwordStrengthText = 'Weak password';
        break;
      case 2:
        this.passwordStrengthClass = 'fair';
        this.passwordStrengthText = 'Fair password';
        break;
      case 3:
      case 4:
        this.passwordStrengthClass = 'good';
        this.passwordStrengthText = 'Good password';
        break;
      case 5:
        this.passwordStrengthClass = 'strong';
        this.passwordStrengthText = 'Strong password';
        break;
    }
  }

  register() {
    this.submitted = true;
    this.errorMessages = [];
  
    if (this.registerForm.valid) {
      this.accountService.register(this.registerForm.value).subscribe({
        next: (response: any) => {
          Swal.fire({
            icon: 'success',
            title: 'Account Created!',
            text: 'Please check your email or spam folder.',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigateByUrl('/account/login');
          });
          console.log(response);
        },
        error: error => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      });
    }
  }
  
}
