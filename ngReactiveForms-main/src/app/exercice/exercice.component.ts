import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControlOptions, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';

interface QuestionsData {
  questionA?: string | null ;
  questionB?: string | null ;
}

@Component({
  selector: 'app-exercice',
  standalone: true,
  imports: [ReactiveFormsModule, MatTabsModule, CommonModule, MatError, MatFormField, MatCard, MatInput],
  templateUrl: './exercice.component.html',
  styleUrls: ['./exercice.component.css']
})
export class ExerciceComponent   {

  catForm:FormGroup<any>;
  catData:QuestionsData | null = null;

  constructor(private fb: FormBuilder) {
    this.catForm = this.fb.group({
      questionA: ['', [Validators.required]],
      questionB: ['',[Validators.required]],
    }, {validators: this.catValidator});

    this.catForm.valueChanges.subscribe(() => {
      this.catData = this.catForm.value;
    });
  }

  catValidator(control: AbstractControl): ValidationErrors | null {
    // On récupère les valeurs de nos champs textes
    const questionA = control.get('questionA')?.value;
    const questionB = control.get('questionB')?.value;

    let atLeastOneMistake:boolean = false;

    if(questionA != ""){
      if(questionA != "chat") {
        control.get('questionA')?.setErrors({doesntLoveCats:true});
        atLeastOneMistake = true;
      } else {
        control.get('questionA')?.setErrors(null);
      }
    }

    if(questionB != ""){
      if(questionB != "oui") {
        control.get('questionB')?.setErrors({doesntPreferCats:true});
        atLeastOneMistake = true;
      } else {
        control.get('questionB')?.setErrors(null);
      }
    }

    //
    return atLeastOneMistake?{atLeastOneMistake:true}:null;
  }

}