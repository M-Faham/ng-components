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

import {
  HijriDateAdapter,
  MOMENT_HIJRI_DATE_FORMATS
} from '../../../utils/adapters/hijri-date-adapter';

@Component({
  selector: 'app-hijri-datepicker-range',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    NgStyle,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet
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
      useExisting: forwardRef(() => HijriDatepickerRangeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HijriDatepickerRangeComponent),
      multi: true
    }
  ],
  templateUrl: './hijri-datepicker-range.component.html'
})
export class HijriDatepickerRangeComponent
  implements OnInit, ControlValueAccessor, Validator
{
  @ViewChild('pickerHijri') picker!: MatDatepicker<Date>;

  showDate = signal(false);
  dateRangeForm!: FormGroup;

  // Inputs
  placeholderFrom = input.required();
  placeholderTo = input.required();
  min = input<Date>();
  max = input<Date>();
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
    this.dateRangeForm = this._fb.group({
      startDate: [null],
      endDate: [null]
    });
  }

  handleDateValueChanges() {
    this.dateRangeForm.valueChanges
      .pipe(takeUntilDestroyed(this._destoryRef))
      .subscribe(() => {
        this.onChange(this.dateRangeForm.value);
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
      this.dateRangeForm.reset();
      return;
    }
    this.dateRangeForm.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.dateRangeForm.disable() : this.dateRangeForm.enable();
  }

  // Validator method
  validate(control: AbstractControl): ValidationErrors | null {
    return this.dateRangeForm.valid ? null : { invalidDateRange: true };
  }
}
