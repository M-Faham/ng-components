export function downloadBlobFile(
  file: Blob,
  fileName: string,
  fileType = 'application/pdf'
): void {
  const blob = new Blob([file], { type: fileType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function downloadFileFromUrl(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.download = fileName;
  a.click();
}
