import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeDatabaseSearchHeroCustomComponent } from './nde-database-search-hero-custom.component';

describe('NdeDatabaseSearchHeroCustomComponent', () => {
  let component: NdeDatabaseSearchHeroCustomComponent;
  let fixture: ComponentFixture<NdeDatabaseSearchHeroCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeDatabaseSearchHeroCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeDatabaseSearchHeroCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
