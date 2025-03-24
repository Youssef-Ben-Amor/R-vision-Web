import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatInput } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';


interface LoginData {
  email?: string | null ;
  name?: string | null ;
}

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [ReactiveFormsModule, MatTabsModule, CommonModule, MatError, MatFormField, MatCard, MatInput],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent  {

  loginForm:FormGroup<any>;
  loginData?:LoginData;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      name: ['',[Validators.required]],
    }, {validators: this.registerValidator});

    this.loginForm.valueChanges.subscribe(() => {
      this.loginData = this.loginForm.value;
    });
  }

  gmailValidator(control: AbstractControl): ValidationErrors | null {
    // On récupère la valeur du champs texte
    const email = control.value;
    // On regarde si le champs est remplis avant de faire la validation
    if (!email) {
      return null;
    }
    // On fait notre validation
    let formValid = email.includes('@gmail.com');
    // On mets les champs concernés en erreur
    // Si le formulaire est invalide on retourne l'erreur
    // Si le formulaire est valide on retourne null
    return !formValid?{gmailError:true}:null;
  }

  // Valider que le nom est present dans le email (c'est pas une bonne validation, mais c'est simplement pour pratiquer!)
  registerValidator(form: AbstractControl): ValidationErrors | null {
    // On récupère les valeurs de nos champs textes
    const email = form.get('email')?.value;
    const name = form.get('name')?.value;
    // On regarde si les champs sont remplis avant de faire la validation
    if (!email || !name) {
      return null;
    }
    // On fait notre validation
    let formValid = email.includes(name);
    // Si le formulaire est invalide on retourne l'erreur
    // Si le formulaire est valide on retourne null
    return !formValid?{nameInEmail:true}:null;
  }

  get name() {
    return this.loginForm.get('name');
  }

  get email() {
    return this.loginForm.get('email');
  }

}