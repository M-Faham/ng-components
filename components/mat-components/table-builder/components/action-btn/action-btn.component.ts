import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ActionPermissionDirective } from '@shared/directives/action-permission.directive';
import { ActionOption, ColumnData } from '@shared/interfaces/table-column';

@Component({
  selector: 'app-table-action-btn',
  standalone: true,
  imports: [
    MatIcon,
    ActionPermissionDirective,
    NgClass,
    TranslateModule,
    MatButtonModule
  ],
  templateUrl: './action-btn.component.html'
})
export class TableActionBtnComponent {
  row = input.required();
  column = input.required<ColumnData>();

  clicked = output<ActionOption>();

  protected value = computed(
    () => !this.column().value || this.column().value?.(this.row())
  );

  protected condition = computed(() => {
    return !this.column().condition || this.column().condition?.(this.row());
  });
}
