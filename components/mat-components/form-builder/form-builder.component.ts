import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RegexValidatorDirective } from '@shared/directives/regexValidator.directive';

import { InputType } from '../../enum/form-input-types.enum';
import { FormField } from '../../interfaces/form-field';
import { DatepickerComponent } from '../date-picker/datepicker/datepicker.component';
@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    TranslateModule,
    DatepickerComponent,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatOption,
    MatSelect,
    NgClass,
    NgTemplateOutlet,
    MatFormFieldModule,
    RegexValidatorDirective
  ],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
  providers: [TranslateService]
})
export class FormBuilderComponent implements OnInit {
  InputType = InputType;
  start = '';
  end = '';
  fields = input.required<FormField[]>();
  @Input() formGroup: FormGroup = this.fb.group({});
  @Input() isJustifyCenter = false;
  @Output() onSubmitForm = new EventEmitter();
  @Output() selectChange = new EventEmitter();
  @Output() dateSelectedChange = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly announcer = inject(LiveAnnouncer);
  chipsFormGroup: { [key: string]: FormControl } = {};
  startDateLabel = '';
  endDateLabel = '';
  errorMsg = '';

  protected readonly requiredValidator = Validators.required;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  protected getErrorMessage(key: string): string {
    const control = this.formGroup.get(key);

    if (control?.errors?.['invalidDate']) {
      this.errorMsg = `${this.translate.instant('users.shouldToBe')} ${this.endDateLabel} ${this.translate.instant('users.after')} ${this.startDateLabel}`;
      return this.errorMsg;
    }
    if (control?.errors?.['email']) {
      this.errorMsg = `${this.translate.instant('error.email')}`;
      return this.errorMsg;
    }
    if (control?.errors?.['mobileNumber']) {
      this.errorMsg = `${this.translate.instant('error.email')}`;
      return this.errorMsg;
    }
    return ''; // Add other error messages as needed
  }

  protected onSelectChange(
    event: MatSelectChange | MatCheckboxChange,
    field: FormField
  ) {
    let selectedValue: any;
    if (event instanceof MatSelectChange) {
      selectedValue = event.value;
    } else if (event instanceof MatCheckboxChange) {
      selectedValue = event.checked;
    }
    this.selectChange.emit({ selectedValue, field });
  }

  protected addChip(event: MatChipInputEvent, field: FormField): void {
    const value = (event.value || '').trim();
    if (value) {
      const currentOptions = this.formGroup.get(field.key)?.value || [];
      this.formGroup.get(field.key)?.setValue([...currentOptions, value]);
    }
    event.chipInput!.clear();
  }

  protected removeChip(option: any, field: FormField): void {
    const currentOptions = this.formGroup.get(field.key)?.value || [];
    const index = currentOptions.indexOf(option);
    if (index >= 0) {
      const updatedOptions = currentOptions.filter(
        (item: any, idx: number) => idx !== index
      );
      this.formGroup.get(field.key)?.setValue(updatedOptions);
      this.announcer.announce(`Removed ${option}`);
      this.selectChange.emit({
        selectedValue: option,
        field,
        type: 'REMOVE'
      });
    }
  }

  protected selected(
    event: MatAutocompleteSelectedEvent,
    field: FormField
  ): void {
    const selectedOption = event.option.value;
    const currentOptions = this.formGroup.get(field.key)?.value || [];
    this.formGroup
      .get(field.key)
      ?.setValue([...currentOptions, selectedOption]);
    this.selectChange.emit({
      selectedValue: selectedOption,
      field,
      type: 'ADD'
    });

    // Clear the input value and refresh filtered options
    this.chipsFormGroup[field.key].setValue('');
    this.refreshFilteredOptions(field);
  }

  protected filteredOptions(field: FormField): any[] {
    const currentOptions = this.chipsFormGroup[field.key]?.value;
    const selectedValues = this.formGroup.get(field.key)?.value || [];

    return (
      field.dropdownOptions?.filter((option) => {
        const optionValue = option[field.viewBy || 'nameAr'];
        if (optionValue) {
          return (
            optionValue
              .toLowerCase()
              .includes((currentOptions || '').toLowerCase()) &&
            !selectedValues.some((selected: any) => selected.id === option.id)
          );
        }
        return false;
      }) || []
    );
  }

  private validateDates(startDate: any, endDate: any): boolean {
    if (!startDate || !endDate) return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  private initializeForm() {
    this.fields().forEach((field) => {
      if (field.type === InputType.Chips) {
        this.chipsFormGroup[field.key] = new FormControl(null);
      }
    });
  }

  private refreshFilteredOptions(field: FormField): void {
    // Force change detection to update the filtered options
    this.chipsFormGroup[field.key].updateValueAndValidity();
  }
}
