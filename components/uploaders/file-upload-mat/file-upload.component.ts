import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Base64Files } from '@core/models/base64-files';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ColumnData } from '@shared/interfaces/table-column';
import { AttachmentService } from '@shared/services/attachment.service';
import { SnackbarService } from '@shared/services/snackbar.service';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { TableBuilderComponent } from '../table-builder/table-builder.component';
import { FILES_COLUMNS } from './constant/files-table';
import { GenericAttachment } from './model/documents.model';
import { DocumentsApiService } from './services/documents.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [TranslateModule, TableBuilderComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements ControlValueAccessor, OnInit {
  @Input() message = this.translate.instant('violations.selectFile');
  @Input() Values = false;
  @Input() acceptedFormats = '.pdf';
  @Input() maxFilesCount = 0;
  @Input() multipleSelection = false;
  @Input() savedFiles: GenericAttachment[] = [];
  @Input() viewOnly = false;

  @Output() savedFilesChange = new EventEmitter<GenericAttachment[]>();
  @ViewChild('fileInput') myFileInput: ElementRef;
  files: string[] = [];
  isDisabled = false;
  names: string[] = [];
  filesGroup: ColumnData[] = [];

  protected columns: ColumnData[];

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private uploadService: DocumentsApiService,
    private _snackBar: SnackbarService,
    private attachmentService: AttachmentService
  ) {}

  ngOnInit(): void {
    this.columns = FILES_COLUMNS(this.translate, this.viewOnly);
    this.filesGroup = FILES_COLUMNS(this.translate, this.viewOnly);
  }

  public resetValues(): void {
    this.files = [];
    this.myFileInput.nativeElement.value = '';
    this.savedFilesChange.emit([]);
  }

  writeValue(files: string[]): void {
    if (files) {
      this.files = files;
    } else {
      this.files = [];
      this.names = [];
    }
    const event: Base64Files[] = [];
    this.files.forEach((f, i) =>
      event.push({ fileName: this.names[i], fileData: f.split(',')[1] })
    );
    // this.filesChanged.emit(event);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.names = [];
    if (input.files) {
      if (this.maxFilesCount === 0) {
        this.confirmUpload(event, input);
      } else {
        if (input.files.length > this.maxFilesCount) {
          this._snackBar.error('shared.MaxFilesCountExceeded');
          return;
        } else {
          this.confirmUpload(event, input);
        }
      }
    }
  }
  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.names.splice(index, 1);
    this.onChange(this.files);
    const event: Base64Files[] = [];
    this.files.forEach((f, i) =>
      event.push({ fileName: this.names[i], fileData: f.split(',')[1] })
    );
    this.savedFilesChange.emit(this.savedFiles);
  }
  onDelete(e: any) {
    this.savedFiles = this.savedFiles.filter(
      (f) => f.attachmentDocRef !== e.attachmentDocRef
    );
    this.removeFile(e);
  }
  onDownload(e: any) {
    this.uploadService.getDocument(e.attachmentDocRef).subscribe((res) => {
      this.attachmentService.downloadBase64Attachment({
        fileName: res.fileName,
        dataBase64: res.dataBase64,
        mimeType: res.mimeType
      });
    });
  }

  protected openFileExplorer(): void {
    this.myFileInput.nativeElement.click();
  }

  private onChange: (files: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  private confirmUpload(event: Event, input: HTMLInputElement) {
    this.dialog
      .open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'shared.uploadFileConfimTilte',
          message: 'shared.uploadFileConfim'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        res === true ? this.upload(event, input) : '';
        this.myFileInput.nativeElement.value = '';
      });
  }

  private upload(event: Event, input: HTMLInputElement) {
    if (input.files) {
      const fileList = Array.from(input.files);
      this.filesToBase64(fileList);
    }
  }
  private filesToBase64(fileList: File[]) {
    fileList.forEach((f) => this.names.push(f.name));
    const fileReaders = fileList.map((file) => this.readFileAsBase64(file));

    return Promise.all(fileReaders).then((base64Files) => {
      this.files = base64Files;
      this.onChange(this.files);
      const event: Base64Files[] = [];
      this.files.forEach((f, i) =>
        event.push({ fileName: this.names[i], fileData: f.split(',')[1] })
      );
      this.checkMaxCount(event);
    });
  }
  private checkMaxCount(event: Base64Files[]) {
    if (
      this.maxFilesCount !== 0 &&
      this.savedFiles.length + event.length > this.maxFilesCount
    ) {
      this._snackBar.error('shared.MaxFilesCountExceeded');
      return;
    }

    this.startUpload(event);
  }

  private startUpload(event: Base64Files[]) {
    this.uploadService.saveDocuments(event).subscribe((res) => {
      this.savedFiles = [
        ...this.savedFiles,
        ...res.documentIds.map((f, i) => ({
          attachmentDocRef: f,
          name: event[i].fileName
        }))
      ];

      this.savedFilesChange.emit(this.savedFiles);
    });
  }
}
