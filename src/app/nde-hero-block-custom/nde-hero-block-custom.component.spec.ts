import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeHeroBlockCustomComponent } from './nde-hero-block-custom.component';

describe('NdeHeroBlockCustomComponent', () => {
  let component: NdeHeroBlockCustomComponent;
  let fixture: ComponentFixture<NdeHeroBlockCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeHeroBlockCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeHeroBlockCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
