import { TestBed } from '@angular/core/testing';

import { JsonbinService } from './jsonbin.service';

describe('JsonbinService', () => {
  let service: JsonbinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonbinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
