import { TestBed } from '@angular/core/testing';
import { CanActivateChildFn } from '@angular/router';

import { catGuard } from './cat.guard';

describe('catGuard', () => {
  const executeGuard: CanActivateChildFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => catGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
