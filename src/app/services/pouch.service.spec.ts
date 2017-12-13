import { TestBed, inject } from '@angular/core/testing';

import { PouchService } from './pouch.service';

describe('PouchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PouchService]
    });
  });

  it('should be created', inject([PouchService], (service: PouchService) => {
    expect(service).toBeTruthy();
  }));
});
