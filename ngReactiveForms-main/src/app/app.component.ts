import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import { ExerciceComponent } from './exercice/exercice.component';
import { InfoComponent } from './info/info.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,MatTabsModule,ExerciceComponent, InfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ngReactiveForms';
}
