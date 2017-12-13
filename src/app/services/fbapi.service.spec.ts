import { TestBed, inject } from '@angular/core/testing';

import { FbapiService } from './fbapi.service';

describe('FbapiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FbapiService]
    });
  });

  it('should be created', inject([FbapiService], (service: FbapiService) => {
    expect(service).toBeTruthy();
  }));
});
