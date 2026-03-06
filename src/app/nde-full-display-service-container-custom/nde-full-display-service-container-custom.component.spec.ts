import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdeFullDisplayServiceContainerCustomComponent } from './nde-full-display-service-container-custom.component';

describe('NdeFullDisplayServiceContainerCustomComponent', () => {
  let component: NdeFullDisplayServiceContainerCustomComponent;
  let fixture: ComponentFixture<NdeFullDisplayServiceContainerCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NdeFullDisplayServiceContainerCustomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NdeFullDisplayServiceContainerCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
