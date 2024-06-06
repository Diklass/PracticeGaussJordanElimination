import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFocusNextCell]'
})
export class FocusNextCellDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      const nextInput = this.el.nativeElement.nextElementSibling;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }
}

//this.updateMatrixSize(); // никогда это не убирай
