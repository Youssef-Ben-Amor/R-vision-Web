import { Routes } from '@angular/router';
import { ParentComponent } from './components/parent/parent.component';
import { SelComponent } from './components/sel/sel.component';
import { CaramelComponent } from './components/caramel/caramel.component';
import { apiGuard } from './guards/api.guard';
import { BonbonComponent } from './components/bonbon/bonbon.component';
import { EauComponent } from './components/eau/eau.component';

export const routes: Routes = [


    { path: '', component: ParentComponent, children: [
        { path: 'sel', component: SelComponent },
        { path: 'caramelAuSel', component: CaramelComponent, canActivate:[apiGuard] },
        { path: 'bonbon', component: BonbonComponent},
        { path: 'eau', component: EauComponent},
      ]},
      { path: '**', redirectTo: '/'}
];
