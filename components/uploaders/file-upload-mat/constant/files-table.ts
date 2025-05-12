import { TranslateService } from '@ngx-translate/core';
import { ColumnData } from '@shared/interfaces/table-column';

import { GenericAttachment } from '../model/documents.model';

export const FILES_COLUMNS = (
  translate: TranslateService,
  viewOnly: boolean
): ColumnData[] => {
  const cols: ColumnData[] = [
    {
      name: 'fileName',
      header: translate.instant('violations.filename'),
      type: 'text',
      width: '70%',
      value: (row: GenericAttachment) => row?.name
    },
    {
      name: 'downlaod',
      header: translate.instant('violations.downlaodFile'),
      type: 'action',
      width: '15%',
      options: ['downloadAttachment'],
      value: (row: GenericAttachment) => row?.name
    }
  ];

  if (viewOnly === false) {
    cols.push({
      name: 'remove',
      header: translate.instant('violations.remove'),
      type: 'action',
      width: '15%',
      options: ['deleteAttachments'],
      isDisabled: false,
      confirmationMsgs: {
        deleteMsg: translate.instant('violations.removeFile'),
        deleteTitle: translate.instant('violations.delete')
      }
    });
  }

  return cols;
};
