import { TestBed, inject } from '@angular/core/testing';

import { ServiceapiService } from './serviceapi.service';

describe('ServiceapiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceapiService]
    });
  });

  it('should be created', inject([ServiceapiService], (service: ServiceapiService) => {
    expect(service).toBeTruthy();
  }));
});
