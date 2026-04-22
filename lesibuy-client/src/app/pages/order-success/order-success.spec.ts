import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ordersuccess } from './order-success';

describe('ordersuccess', () => {
  let component: ordersuccess;
  let fixture: ComponentFixture<ordersuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ordersuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ordersuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
