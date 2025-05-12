import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-header-actions',
  standalone: true,
  imports: [TranslateModule, MatMenuModule, MatIconModule, CommonModule],
  templateUrl: 'table-header-actions.component.html'
})
export class TableHeaderActionsComponent {
  exportToPdf = output();
  exportToExcel = output();
  toggleTableSelection = output<boolean>();

  openUnassignDialog = output();
  openAssignDialog = output();

  selectedItems = input<number>();
  allSelected = input<boolean>(false);
  showSelectAll = input<boolean>();

  showUnassign = input<boolean>();
  showAssign = input<boolean>();
  showReassign = input<boolean>();

  emitExportToPdf() {
    this.exportToPdf.emit();
  }

  emitExportToExcel() {
    this.exportToExcel.emit();
  }
}
