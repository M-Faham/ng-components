import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AttachmentDto } from '@core/models/attachmentDto';
import SHARED_ENDPOINTS from '@shared/apis-endpoints';
import { Observable } from 'rxjs';

import { Base64Files, DocumnetIds } from '../model/documents.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentsApiService {
  constructor(private http: HttpClient) {}

  saveDocuments(files: Base64Files[]): Observable<DocumnetIds> {
    const url = `${SHARED_ENDPOINTS.SaveDocuments}`;
    return this.http.post<DocumnetIds>(url, { files: files });
  }

  getDocument(id: string): Observable<AttachmentDto> {
    const url = `${SHARED_ENDPOINTS.GetDocument}?documentId=${id}`;
    return this.http.post<AttachmentDto>(url, null);
  }
}
