import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogReserva } from './dialog-reserva';

describe('DialogReserva', () => {
  let component: DialogReserva;
  let fixture: ComponentFixture<DialogReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
