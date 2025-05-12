import { NgStyle, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  OnInit,
  output,
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
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  provideNativeDateAdapter
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { HijriDatepickerRangeComponent } from '../hijri-datepicker-range/hijri-datepicker-range.component';

@Component({
  selector: 'app-gregorian-datepicker-range',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    NgStyle,
    MatIconModule,
    HijriDatepickerRangeComponent,
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GregorianDatepickerRangeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GregorianDatepickerRangeComponent),
      multi: true
    }
  ],
  templateUrl: './gregorian-datepicker-range.component.html'
})
export class GregorianDatepickerRangeComponent
  implements OnInit, ControlValueAccessor, Validator
{
  dateRangeForm!: FormGroup;

  // Inputs
  placeholderFrom = input.required();
  placeholderTo = input.required();
  min = input<Date>();
  max = input<Date>();
  showSwitchToHijriIcon = input(false);

  // Outputs
  onSwitchToHijri = output();

  // Services
  private _destoryRef = inject(DestroyRef);
  private readonly _fb = inject(FormBuilder);

  @ViewChild('pickerGregorian') pickerGregorian!: MatDatepicker<Date>;

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

  switchToHijri() {
    this.onSwitchToHijri.emit();
  }

  open() {
    this.pickerGregorian.open();
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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.dateRangeForm.valid ? null : { invalidDateRange: true };
  }
}
