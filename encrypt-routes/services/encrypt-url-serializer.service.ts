import { inject, Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

import { CryptoService } from './crypto.service';

@Injectable()
export class EncryptedUrlSerializer extends DefaultUrlSerializer {
  private cryptoService = inject(CryptoService);

  override parse(url: string): UrlTree {
    const decryptedUrl = this.decryptRouteParams(url);
    return super.parse(decryptedUrl);
  }

  override serialize(tree: UrlTree): string {
    const serializedUrl = super.serialize(tree);
    return this.encryptRouteParams(serializedUrl);
  }

  private encryptRouteParams(url: string): string {
    const urlParts = url.split('/');

    // Encrypt route parameters if they are numeric
    for (let i = 1; i < urlParts.length; i++) {
      // Start from 1 to skip the base path
      if (urlParts[i] && !isNaN(Number(urlParts[i]))) {
        urlParts[i] = this.cryptoService.encrypt(urlParts[i]);
      }
    }
    return urlParts.join('/');
  }

  private decryptRouteParams(url: string): string {
    const urlParts = url.split('/');

    // Decrypt route parameters if they are numeric
    for (let i = 1; i < urlParts.length; i++) {
      // Start from 1 to skip the base path
      if (urlParts[i] && this.cryptoService.isEncrypted(urlParts[i])) {
        urlParts[i] = this.cryptoService.decrypt(urlParts[i]);
      }
    }
    return urlParts.join('/');
  }
}
