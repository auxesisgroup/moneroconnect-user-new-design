import { TestBed, inject } from '@angular/core/testing';

import { WalletsService } from './wallets.service';

describe('WalletsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WalletsService]
    });
  });

  it('should be created', inject([WalletsService], (service: WalletsService) => {
    expect(service).toBeTruthy();
  }));
});
