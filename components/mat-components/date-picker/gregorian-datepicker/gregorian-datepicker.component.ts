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
  MAT_DATE_LOCALE,
  provideNativeDateAdapter
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ValidationHandlerPipe } from '../../../pipes/validation-handler.pipe';
import { HijriDatepickerComponent } from '../hijri-datepicker/hijri-datepicker.component';

@Component({
  selector: 'app-gregorian-datepicker',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    NgStyle,
    MatIconModule,
    HijriDatepickerComponent,
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    ValidationHandlerPipe
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'ar' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GregorianDatepickerComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GregorianDatepickerComponent),
      multi: true
    }
  ],
  templateUrl: './gregorian-datepicker.component.html'
})
export class GregorianDatepickerComponent
  implements OnInit, ControlValueAccessor, Validator
{
  @ViewChild('pickerGregorian') pickerGregorian!: MatDatepicker<Date>;

  dateForm!: FormGroup;

  // Inputs
  placeholder = input.required();
  min = input<Date | null>();
  max = input<Date | null>();
  showSwitchToHijriIcon = input(false);
  touched: boolean;

  // Outputs
  onSwitchToHijri = output();

  // Services
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
        this.onChange(this.dateForm.value.date);
        this.onTouched();
      });
  }

  switchToHijri() {
    this.onSwitchToHijri.emit();
  }

  open() {
    this.pickerGregorian.open();
  }

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

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.dateForm.disable() : this.dateForm.enable();
  }

  markAsTouched() {
    this.touched = true;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.dateForm.controls['date'].setValidators(control.validator);
    return null;
  }
}
