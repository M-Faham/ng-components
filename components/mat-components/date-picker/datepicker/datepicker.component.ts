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
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, startWith } from 'rxjs';

import { areDatesEqual } from '../../../utils/helpers/date.helper';
import { GregorianDatepickerComponent } from '../gregorian-datepicker/gregorian-datepicker.component';
import { HijriDatepickerComponent } from '../hijri-datepicker/hijri-datepicker.component';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    NgClass,
    MatIconModule,
    HijriDatepickerComponent,
    FormsModule,
    ReactiveFormsModule,
    GregorianDatepickerComponent
  ],
  providers: [
    DatePipe,
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ],
  templateUrl: './datepicker.component.html'
})
export class DatepickerComponent
  implements ControlValueAccessor, Validator, OnInit, AfterViewInit
{
  showHijriDate = signal(false);
  dateForm!: FormGroup;

  // Inputs
  hijriPlaceholder = input<string>(
    this._translate.instant('labels.selectDate')
  );
  gregorianPlaceholder = input<string>(
    this._translate.instant('labels.selectDate')
  );
  min = input<Date | null>();
  max = input<Date | null>();

  @ViewChild('mcDatepickerHijri')
  mcDatepickerHijri!: HijriDatepickerComponent;
  @ViewChild('mcGregorianDatepicker')
  mcGregorianDatepicker!: GregorianDatepickerComponent;

  // Services
  private readonly _fb = inject(FormBuilder);
  private _datePipe = inject(DatePipe);
  private _destoryRef = inject(DestroyRef);

  constructor(private _translate: TranslateService) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.handleGregorianDateChange();
    this.handleHijriDateChange();
  }

  initForm() {
    this.dateForm = this._fb.group({
      gregorianDate: [null],
      hijriDate: [null]
    });
  }

  handleGregorianDateChange() {
    this.dateForm.controls['gregorianDate'].valueChanges
      .pipe(
        takeUntilDestroyed(this._destoryRef),
        startWith(this.dateForm.value.gregorianDate),
        distinctUntilChanged((prev, curr) => {
          return areDatesEqual(prev, curr);
        })
      )
      .subscribe((date: Date) => {
        this.onChange(date && this.formatDate(date));
        this.onGregorianChange(date && new Date(date));
      });
  }

  onGregorianChange(date: Date) {
    this.mcDatepickerHijri.dateForm.controls['date'].setValue(date, {
      emitEvent: false,
      onlySelf: true
    });
  }

  handleHijriDateChange() {
    this.dateForm.controls['hijriDate'].valueChanges
      .pipe(
        takeUntilDestroyed(this._destoryRef),
        distinctUntilChanged((prev, curr) => areDatesEqual(prev, curr))
      )
      .subscribe((date: Date) => {
        this.onChange(this.formatDate(date));
        this.onHijriChange(date);
      });
  }

  onHijriChange(date: Date) {
    this.mcGregorianDatepicker.dateForm.controls['date'].setValue(date, {
      emitEvent: false,
      onlySelf: true
    });
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
      this.dateForm.reset();
      return;
    }
    this.dateForm.controls['gregorianDate'].setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.dateForm.disable() : this.dateForm.enable();
  }

  // Validator method
  validate(control: AbstractControl): ValidationErrors | null {
    this.dateForm.controls['gregorianDate'].setValidators(control.validator);
    this.dateForm.controls['hijriDate'].setValidators(control.validator);
    return null;
  }

  private formatDate(date: Date): string | null {
    return this._datePipe.transform(date, 'YYY-MM-dd') || null;
  }
}
