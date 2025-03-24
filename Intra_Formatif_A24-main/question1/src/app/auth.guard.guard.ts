import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './user.service';

export const authGuardGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const service = inject(UserService);

  if(service.currentUser){
    console.log(service.currentUser)
  return true;
  }
  else{
    router.navigate(['/login']);
    return false
  }


};
