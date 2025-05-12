import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe, NgClass, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  Injectable,
  Input,
  input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent
} from '@angular/material/paginator';
import {
  MatSlideToggleChange,
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActionPermissionDirective } from '@shared/directives/action-permission.directive';
import { CustomTablePaginatorDirective } from '@shared/directives/custom-table-paginator.directive';
import { HijriDatePipe } from '@shared/pipes/hijri-date.pipe';
import { ResolveValuePipe } from '@shared/pipes/resolve-value.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { PaginationType } from '../../enum/form-input-types.enum';
import { ActionOption, ColumnData } from '../../interfaces/table-column';
import { TooltioListItems } from '../../pipes/tooltip-handeling.pipe';
import { ConfirmationService } from '../../services/confirmation.service';
import { NoDataPlaceholderComponent } from '../no-data-placeholder/no-data-placeholder.component';
import { FONT } from './base64Font';
import { TableActionBtnComponent } from './components/action-btn/action-btn.component';

@Injectable()
class CustomPaginator extends MatPaginatorIntl {
  private tr = inject(TranslateService);
  constructor() {
    super();
    this.lastPageLabel = this.tr.instant('table.lastPageLabel');
    this.firstPageLabel = this.tr.instant('table.firstPageLabel');
    this.itemsPerPageLabel = this.tr.instant('table.itemsPerPageLabel');
    this.nextPageLabel = this.tr.instant('table.nextPageLabel');
    this.previousPageLabel = this.tr.instant('table.previousPageLabel');
    this.changes.next();
  }
}

@Component({
  selector: 'app-table-builder',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    NgClass,
    NgStyle,
    MatPaginatorModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    TranslateModule,
    CustomTablePaginatorDirective,
    ResolveValuePipe,
    DatePipe,
    HijriDatePipe,
    MatTooltipModule,
    RouterLink,
    TooltioListItems,
    TableActionBtnComponent,
    ActionPermissionDirective,
    NoDataPlaceholderComponent
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: CustomPaginator },
    DatePipe
  ],
  templateUrl: './table-builder.component.html',
  styleUrls: ['./table-builder.component.scss']
})
export class TableBuilderComponent implements OnInit, OnChanges, AfterViewInit {
  columns = input.required<ColumnData[]>();
  @Input() dataSource: any = [];
  @Input() pageSize = 10;
  @Input() pageNumber = 1;
  @Input() pageSizeOptions: number[] = [1, 2, 3, 10];
  @Input() hasCheckBox = false;
  @Input() hasSelectOption = false;
  @Input() hasSelectAllOption = false;
  @Input() totalRecords = 0;
  @Input() paginationType: PaginationType = PaginationType.Frontend;
  @Input() totalRecordsLabel = 'table.totalRecords';
  @Input() isHidePagination = false;
  @Input() hidePageSize = false;
  @Input() hideSelectPageInput = false;
  @Input() hideTotalRecordsLabel = false;
  @Input() showRowNumber = true;
  @Input() tableHeader: string | undefined = undefined;
  @Output() onSelectionChange = new EventEmitter<{ requests: any[] }>();
  @Output() toggleChanged = new EventEmitter<{
    row: any;
    columnName: string;
    event: MatSlideToggleChange;
  }>();

  @Output() editClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();
  @Output() viewDetailsClicked = new EventEmitter<any>();
  @Output() downloadAttachmentClicked = new EventEmitter<any>();
  @Output() viewTimeLineClicked = new EventEmitter<any>();
  @Output() accreditationClicked = new EventEmitter<any>();
  @Output() rejectClicked = new EventEmitter<any>();
  @Output() acceptClicked = new EventEmitter<any>();
  @Output() contractClicked = new EventEmitter<any>();
  @Output() pageChanged = new EventEmitter<PageEvent>(); // Event emitter for page changes
  @Output() pickClicked = new EventEmitter<any>();
  @Output() viewSuspensionAuthorities = new EventEmitter<any>();
  @Output() openInNewClicked = new EventEmitter<any>();
  @Output() confirmationClicked = new EventEmitter<any>();
  @Output() takeActionClicked = new EventEmitter<any>();

  rowNumberColumn: ColumnData = {
    name: 'rowNumber',
    header: '#',
    type: 'text'
  };
  displayedColumns: string[] = [];
  dataSourceTable: MatTableDataSource<any> | any;
  PaginationType = PaginationType;
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<any>(
    this.allowMultiSelect,
    this.initialSelection
  );

  maxPage!: number;
  minPage = 1;
  @ViewChild(MatSort) sort: MatSort | any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(
    private readonly translate: TranslateService,
    private readonly datePipe: DatePipe,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initColumns();
    this.validateConfirmationMsgs();
    setTimeout(() => {
      this.initializeDataSource();
    }, 10);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dataSourceTable.sort = this.sort;
    });
    this.maxPage = this.paginator?.getNumberOfPages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] || changes['paginationType']) {
      this.initializeDataSource();
    }
  }

  public toggleAllRows(selectAll: boolean) {
    selectAll
      ? this.selection.clear()
      : this.dataSource.forEach((row: any) => this.selection.select(row));
    this.selectionChange();
  }

  public goToSpecificPage(event: any) {
    let pageNumber;
    if (event == 1) {
      pageNumber = 0;
    } else {
      pageNumber = Number(event.target.value) - 1;
    }
    if (
      this.paginator &&
      pageNumber >= 0 &&
      pageNumber < this.paginator?.getNumberOfPages()
    ) {
      this.paginator.pageIndex = pageNumber;
      const pageEvent: PageEvent = {
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length
      };
      this.pageNumber = this.paginator.pageIndex + 1;
      this.paginator.page.emit(pageEvent);
    }
  }

  public exportToExcel() {
    const columnsToExport = this.columns()
      .filter((column) => column.exported)
      .reverse();

    const formattedData = this.dataSource.reverse().map((row: any) => {
      const formattedItem: any = {};
      columnsToExport.forEach((column: ColumnData) => {
        formattedItem[column.header!] = this.getExportValue(column, row);
      });
      return formattedItem;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    XLSX.writeFile(workbook, 'exported-table.xlsx');
  }

  public exportToPdf() {
    const doc = new jsPDF('landscape', 'px', 'a4');
    doc.addFileToVFS('Amiri-Regular-normal.ttf', FONT);
    doc.addFont('Amiri-Regular-normal.ttf', 'Amiri-Regular', 'normal');
    doc.setFont('Amiri-Regular');

    const columnsToExport = this.columns()
      .filter((column) => column.exported)
      .reverse();

    const rows = this.dataSource
      .map((row: any) =>
        columnsToExport.map((column) => this.getExportValue(column, row))
      )
      .reverse();

    autoTable(doc, {
      head: [columnsToExport.map((column) => '' + column.header)],
      body: rows,
      styles: {
        font: 'Amiri-Regular',
        fontStyle: 'normal',
        halign: 'right',
        valign: 'middle',
        cellPadding: 10
      },
      columnStyles: {
        0: { cellWidth: 'wrap', halign: 'right' },
        1: { cellWidth: 'wrap', halign: 'right' },
        2: { cellWidth: 'wrap', halign: 'right' },
        3: { cellWidth: 'wrap', halign: 'right' },
        4: { cellWidth: 'wrap', halign: 'right' }
      },
      margin: { top: 50, right: 10, bottom: 30, left: 10 }
    });

    doc.save('exported-table.pdf');
  }

  public refreshTable() {
    this.initializeDataSource();
  }

  protected getRouterLink(column: ColumnData, row: any): string | any[] {
    if (typeof column.routerLink === 'function') {
      return column.routerLink(row);
    }
    return column.routerLink ?? [];
  }
  protected onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;

    if (event?.pageSize !== this.pageSize) {
      event.pageIndex = 0;
    }

    if (this.paginationType === PaginationType.Backend) {
      event.pageIndex += 1;
      this.pageChanged.emit(event);
    } else {
      event.pageIndex += 1;
      this.pageNumber = event.pageIndex;
      this.pageSize = event.pageSize;

      this.initializeDataSource();
    }
  }

  protected isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected == numRows;
  }

  protected announceSortChange(sortState: Sort) {
    const sortedData = this.dataSource.slice().sort((a: any, b: any) => {
      const valueA = a[sortState.active];
      const valueB = b[sortState.active];

      let comparison = 0;
      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
    this.dataSourceTable = sortedData;
  }

  protected getColumnValue(row: any, column: ColumnData): string {
    if (column.type === 'enum' && column.enums) {
      return column.enums[row[column.name]] || row[column.name];
    }
    return row[column.name];
  }

  protected onActionClicked(
    action: ActionOption,
    row: any,
    column: ColumnData
  ) {
    switch (action) {
      case 'edit':
        this.editClicked.emit(row);
        break;
      case 'delete':
        this.onDelete(row, column);
        break;
      case 'deleteAttachments':
        this.onDelete(row, column);
        break;
      case 'view':
        this.viewDetailsClicked.emit(row);
        break;
      case 'study':
        this.viewDetailsClicked.emit(row);
        break;
      case 'accreditation':
        this.accreditationClicked.emit(row);
        break;
      case 'reject':
        this.rejectClicked.emit(row);
        break;
      case 'pick':
        this.pickClicked.emit(row);
        break;
      case 'downloadAttachment':
        this.downloadAttachmentClicked.emit(row);
        break;

      case 'download':
        this.downloadAttachmentClicked.emit(row);
        break;
      case 'suspensionAuthorities':
        this.viewSuspensionAuthorities.emit(row);
        break;
      case 'timeLine':
        this.viewTimeLineClicked.emit(row);
        break;
      case 'contract':
        this.contractClicked.emit(row);
        break;
      case 'confirmation':
        this.confirmationClicked.emit(row);
        break;
      case 'accept':
        this.acceptClicked.emit(row);
        break;
      case 'takeAction':
        this.takeActionClicked.emit(row);
        break;
      case 'openInNew':
        this.openInNewClicked.emit(row);
        break;
    }
  }

  protected onToggleChange(
    row: any,
    event: MatSlideToggleChange,
    column: ColumnData
  ) {
    const columnName = column.name;
    const msg = event.checked
      ? column.confirmationMsgs?.checkMsg
      : column.confirmationMsgs?.unCheckMsg;

    const title = event.checked
      ? column.confirmationMsgs?.checkTitle
      : column.confirmationMsgs?.unCheckTitle;

    this.confirmationService
      .openConfirmationDialog(
        this.translate.instant(title || ''),
        this.translate.instant(msg || '')
      )
      .subscribe((res: any) => {
        if (res) {
          this.toggleChanged.emit({ row, columnName, event });
        } else {
          event.source.checked = !event.checked;
        }
      });
  }

  protected selectionChange(row?: any) {
    if (row) this.selection.toggle(row);
    const selectedRows = this.dataSource.filter((row: any) =>
      this.selection.isSelected(row)
    );
    this.onSelectionChange.emit({ requests: selectedRows });
  }

  protected getValue(rowData: any, column: ColumnData): any {
    if (!column.value) return null;
    return column.value(rowData);
  }

  private getExportValue(column: ColumnData, row: any) {
    let value = this.checkCelValue(column, row);
    if ((!value || typeof value === 'object') && column.value) {
      value = column.value(row);
    }

    return value;
  }

  private initColumns() {
    const columns = this.showRowNumber ? ['rowNumber'] : [];
    if (this.hasSelectOption) {
      columns.push('select');
    }

    this.displayedColumns = [
      ...columns,
      ...this.columns().map((column) => column.name)
    ];
  }

  private checkCelValue(column: ColumnData, item: any) {
    let value =
      column.type === 'lockup'
        ? item[column.name]
          ? item[column.name]?.nameAr
          : 'لا يوجد بيانات'
        : item[column.name];

    if (column.name === 'isActive' && value) {
      value = this.translate.instant('users.active');
    } else if (column.name === 'isActive' && !value) {
      value = this.translate.instant('users.inactive');
    }
    if (column.type === 'date') {
      value = this.datePipe.transform(value, 'dd/MM/yyyy');
    }

    return value;
  }

  private initializeDataSource() {
    if (this.paginationType === PaginationType.Frontend) {
      const pageIndex = this.pageNumber - 1;
      const pageData =
        this?.dataSource?.slice(
          pageIndex * this.pageSize,
          pageIndex * this.pageSize + this.pageSize
        ) || [];

      this.dataSourceTable = new MatTableDataSource(pageData);
    } else {
      // Backend Pagination: Simply assign dataSource
      this.dataSourceTable = new MatTableDataSource(this.dataSource);
    }
    // Add custom data accessor for row numbers
  }

  private validateConfirmationMsgs() {
    this.columns().forEach((column) => {
      if (column.type === 'action') {
        if (column.options?.includes('delete')) {
          if (
            !column.noDeleteConfirmation &&
            (!column?.confirmationMsgs?.deleteTitle ||
              !column?.confirmationMsgs?.deleteMsg)
          ) {
            throw new Error(
              'Confirmation messages are required for delete action'
            );
          }
        }
      }
    });
  }

  private onDelete(row: any, column: ColumnData) {
    if (column.noDeleteConfirmation) {
      this.deleteClicked.emit(row);
    } else {
      this.confirmationService
        .openConfirmationDialog(
          this.translate.instant(column?.confirmationMsgs?.deleteTitle || ''),
          this.translate.instant(column?.confirmationMsgs?.deleteMsg || '')
        )
        .subscribe((res: any) => {
          if (res) {
            this.deleteClicked.emit(row);
          }
        });
    }
  }
}
