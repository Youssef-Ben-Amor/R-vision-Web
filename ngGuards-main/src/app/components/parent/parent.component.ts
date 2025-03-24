import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCheckbox } from '@angular/material/checkbox';
import { MatInput } from '@angular/material/input';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [RouterOutlet,MatCheckbox,FormsModule ],
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {

  sweet : boolean = false;
  salty : boolean = false;

  constructor() { }

  ngOnInit() {
    this.sweet = localStorage.getItem("sweet") != null;
    this.salty = localStorage.getItem("salty") != null;
  }

  updateSalty(){
    if(this.salty)
      localStorage.setItem("salty", "true");
    else
      localStorage.removeItem("salty");
  }

  updateSweet(){
    if(this.sweet)
      localStorage.setItem("sweet", "true");
    else
      localStorage.removeItem("sweet");
  }

}