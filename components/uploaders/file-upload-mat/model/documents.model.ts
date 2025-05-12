export interface Base64Files {
  fileName: string;
  fileData: string;
}
export interface DocumnetIds {
  documentIds: string[];
}

export interface GenericAttachment {
  name?: string;
  attachmentDocRef: string;
}
