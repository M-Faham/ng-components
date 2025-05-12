import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

import { ValidationHandlerPipe } from '../../../pipes/validation-handler.pipe';
import {
  HijriDateAdapter,
  MOMENT_HIJRI_DATE_FORMATS
} from '../../../utils/adapters/hijri-date-adapter';

@Component({
  selector: 'app-hijri-datepicker',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    NgStyle,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInput,
    NgTemplateOutlet,
    TranslateModule,
    ValidationHandlerPipe
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: HijriDateAdapter
    },
    { provide: MAT_DATE_FORMATS, useValue: MOMENT_HIJRI_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'ar-sa' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HijriDatepickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HijriDatepickerComponent),
      multi: true
    }
  ],
  templateUrl: './hijri-datepicker.component.html'
})
export class HijriDatepickerComponent
  implements OnInit, ControlValueAccessor, Validator
{
  @ViewChild('pickerHijri') picker!: MatDatepicker<Date>;

  showDate = signal(false);
  dateForm!: FormGroup;
  touched: boolean;

  // Inputs
  placeholder = input.required<string>();
  min = input<Date | null>();
  max = input<Date | null>();
  showSwitchToGregorianIcon = input(false);

  // Outputs
  onSwitchToGregorian = output();

  // services
  private _destoryRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);

  ngOnInit() {
    this.initForm();
    this.handleDateValueChanges();
  }

  initForm() {
    this.dateForm = this._fb.group({
      date: [null]
    });
  }

  handleDateValueChanges() {
    this.dateForm.valueChanges
      .pipe(takeUntilDestroyed(this._destoryRef))
      .subscribe(() => {
        const date = this.dateForm.value.date;
        this.onChange(date && new Date(this.dateForm.value.date));
        this.onTouched();
      });
  }

  switchToGregorian() {
    this.onSwitchToGregorian.emit();
  }

  open() {
    this.picker.open();
  }

  // ControlValueAccessor methods

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (!value) {
      this.dateForm.reset();
      return;
    }
    this.dateForm.setValue({ date: value });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    this.touched = true;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.dateForm.disable() : this.dateForm.enable();
  }

  // Validator method
  validate(control: AbstractControl): ValidationErrors | null {
    this.dateForm.controls['date'].setValidators(control.validator);
    return null;
  }
}
