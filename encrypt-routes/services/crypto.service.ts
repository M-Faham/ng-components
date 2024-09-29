import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private secretKey = environment.encryptionKey;

  encrypt(value: string): string {
    console.log('encrypting', value);

    return CryptoJS.AES.encrypt(value, this.secretKey).toString();
  }

  decrypt(value: string): string {
    const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  isEncrypted(value: string): boolean {
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.secretKey);
      const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedValue !== '';
    } catch (error) {
      return false;
    }
  }
}
