import {
  AfterViewInit,
  Component,
  inject,
  input,
  output,
  ViewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ToastrService } from '../../services/toastr.service';
@Component({
  selector: 'marhaba-file-uploader',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements AfterViewInit {
  public uploading = input.required<boolean>();
  public allowedFormats = input.required<string>();
  public maxSize = input(4);

  public fileSelected = output<File>();

  @ViewChild('fileUploader') private fileUploader: any;

  private toastr = inject(ToastrService);

  ngAfterViewInit() {
    this.listenIfUserDraggingingAFileAndAddClass();
  }

  protected onFileDropped(e: DragEvent) {
    if (this.uploading()) {
      return;
    }
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && this.checkSizeAndFormat(files[0])) {
      const file = files[0];
      this.fileUploader.nativeElement.value = '';
      this.fileSelected.emit(file);
    }
  }

  protected onFileSelected(e: Event) {
    if (this.uploading()) {
      return;
    }

    const inputElement = e.target as HTMLInputElement;
    if (
      inputElement.files &&
      inputElement.files.length > 0 &&
      this.checkSizeAndFormat(inputElement.files[0])
    ) {
      const file = inputElement.files[0];
      inputElement.value = '';
      this.fileSelected.emit(file);
    }
  }

  private checkSizeAndFormat(file: File) {
    if (this.maxSize && file.size > this.maxSize() * 1024 * 1024) {
      this.toastr.error('fileUploader.limit', { limit: this.maxSize() });
      return false;
    }

    if (this.allowedFormats) {
      const allowedFormats = this.allowedFormats().split(',');
      const fileName = file.name.toLowerCase();
      const isValidFormat = allowedFormats.some((format) =>
        fileName.endsWith(format.trim().toLowerCase())
      );
      if (!isValidFormat) {
        this.toastr.error('fileUploader.invalidFormat', {
          formats: this.allowedFormats()
        });
        return false;
      }
    }

    return true;
  }

  private listenIfUserDraggingingAFileAndAddClass() {
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (this.uploading()) {
        return;
      }
      this.fileUploader.nativeElement.classList.add('dragging');
    });

    document.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.fileUploader.nativeElement.classList.remove('dragging');
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      this.fileUploader.nativeElement.classList.remove('dragging');
    });
  }
}
