import { KeyValuePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { REGEX_PATTERNS, RegexKeys } from '../../predefineds';

@Component({
  selector: 'app-form-error',
  imports: [TranslatePipe, KeyValuePipe],
  templateUrl: './form-error.component.html'
})
export class FormErrorComponent {
  control = input.required<FormControl>();
  patternKey = input<keyof typeof RegexKeys>();

  protected readonly REGEX_PATTERNS = REGEX_PATTERNS;
}
