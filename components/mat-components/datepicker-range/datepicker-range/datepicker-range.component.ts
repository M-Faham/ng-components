import { DatePipe, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  OnInit,
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
  MAT_DATE_LOCALE,
  provideNativeDateAdapter
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { distinctUntilChanged, startWith } from 'rxjs';

import { areDatesEqual } from '../../../utils/helpers/date.helper';
import { GregorianDatepickerRangeComponent } from '../gregorian-datepicker-range/gregorian-datepicker-range.component';
import { HijriDatepickerRangeComponent } from '../hijri-datepicker-range/hijri-datepicker-range.component';

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

@Component({
  selector: 'app-datepicker-range',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    NgClass,
    MatIconModule,
    HijriDatepickerRangeComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    GregorianDatepickerRangeComponent
  ],
  providers: [
    DatePipe,
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerRangeComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatepickerRangeComponent),
      multi: true
    }
  ],
  templateUrl: './datepicker-range.component.html'
})
export class DatepickerRangeComponent
  implements ControlValueAccessor, Validator, OnInit, AfterViewInit
{
  showHijriDate = signal(false);
  dateRangeForm!: FormGroup;
  // Inputs
  hijriPlaceholderFrom = input<string>('labels.selectDateFrom');
  hijriPlaceholderTo = input<string>('labels.to');
  gregorianPlaceholderFrom = input<string>('labels.selectDateFrom');
  gregorianPlaceholderTo = input<string>('labels.to');
  min = input<Date>();
  max = input<Date>();

  // Child components
  @ViewChild('mcDatepickerHijri')
  mcDatepickerHijri!: HijriDatepickerRangeComponent;
  @ViewChild('mcGregorianDatepicker')
  mcGregorianDatepicker!: GregorianDatepickerRangeComponent;

  // Services
  private readonly _fb = inject(FormBuilder);
  private _datePipe = inject(DatePipe);
  private _destoryRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.handleGregorianDateChange();
    this.handleHijriDateChange();
  }

  initForm() {
    this.dateRangeForm = this._fb.group({
      gregorianDate: [null],
      hijriDate: [null]
    });
  }

  handleGregorianDateChange() {
    this.dateRangeForm.controls['gregorianDate'].valueChanges
      .pipe(
        takeUntilDestroyed(this._destoryRef),
        startWith(this.dateRangeForm.value.gregorianDate),
        distinctUntilChanged((prev, curr) => {
          return (
            areDatesEqual(prev?.startDate, curr?.startDate) &&
            areDatesEqual(prev?.endDate, curr?.endDate)
          );
        })
      )
      .subscribe((dateRange: DateRange) => {
        this.onChange(this.formatDateRange(dateRange));
        this.onTouched();
        this.updateHijriDate(dateRange);
      });
  }

  // UPDATE HIRI DATE WHENEVER THE GREOGORIAN DATE IS UPDATED
  updateHijriDate(dateRange: DateRange) {
    this.mcDatepickerHijri.dateRangeForm.controls['startDate'].setValue(
      dateRange?.startDate,
      {
        emitEvent: false,
        onlySelf: true
      }
    );
    this.mcDatepickerHijri.dateRangeForm.controls['endDate'].setValue(
      dateRange?.endDate,
      {
        emitEvent: false,
        onlySelf: true
      }
    );
  }

  handleHijriDateChange() {
    this.dateRangeForm.controls['hijriDate'].valueChanges
      .pipe(
        takeUntilDestroyed(this._destoryRef),
        distinctUntilChanged((prev, curr) => {
          return (
            areDatesEqual(prev?.startDate, curr?.startDate) &&
            areDatesEqual(prev?.endDate, curr?.endDate)
          );
        })
      )
      .subscribe((dateRange: DateRange) => {
        this.updateGregorianDate(dateRange);
      });
  }

  // UPDATE GREOGORIAN DATE WHENEVER THE HIRI DATE IS UPDATED
  updateGregorianDate(dateRange: DateRange) {
    this.mcGregorianDatepicker.dateRangeForm.controls['startDate'].setValue(
      dateRange.startDate && new Date(dateRange.startDate),
      {
        emitEvent: false,
        onlySelf: true
      }
    );
    this.mcGregorianDatepicker.dateRangeForm.controls['endDate'].setValue(
      dateRange.endDate && new Date(dateRange.endDate),
      {
        emitEvent: false,
        onlySelf: true
      }
    );
  }

  switchToHijri() {
    this.showHijriDate.set(true);
    this.mcDatepickerHijri.open();
  }

  switchToGregorian() {
    this.showHijriDate.set(false);
    this.mcGregorianDatepicker.open();
  }
  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (!value) {
      this.dateRangeForm.reset();
      return;
    }
    this.dateRangeForm.controls['gregorianDate'].setValue(value);
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

  // THIS IS THE DATE FORMAT RESULT FOR THE DATE RANGE COMPONENT (EX. 2024-05-22)
  private formatDateRange(dateRange: DateRange) {
    if (!dateRange?.startDate && !dateRange?.endDate) return null;
    return {
      startDate:
        dateRange?.startDate && this.formatDate(new Date(dateRange?.startDate)),
      endDate:
        dateRange?.endDate && this.formatDate(new Date(dateRange?.endDate))
    };
  }

  // THE DATE FORMAT RESULT REQUIRED FOR THE DATE RANGE & APIs
  private formatDate(date: Date): string | null {
    return this._datePipe.transform(date, 'YYY-MM-dd') || null;
  }
}
