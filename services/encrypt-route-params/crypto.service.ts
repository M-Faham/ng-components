import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable()
export class CryptoService {
  private key = environment.encryptionKey;
  private readonly prefix = 'mcenc-';

  encrypt(value: string): string {
    if (value.startsWith(this.prefix)) {
      return value;
    }
    const encrypted = this.xorEncryptDecrypt(value, this.key);
    let result = '';
    for (let i = 0; i < encrypted.length; i++) {
      result += encrypted.charCodeAt(i).toString(16).padStart(2, '0');
    }

    result = this.prefix + result;
    return result;
  }

  decrypt(value: string): string {
    if (!value.startsWith(this.prefix)) {
      return value;
    }

    value = value.slice(this.prefix.length);

    const hexes = value.match(/.{1,2}/g) || [];
    let encrypted = '';
    for (let i = 0; i < hexes.length; i++) {
      encrypted += String.fromCharCode(parseInt(hexes[i], 16));
    }
    const decrypted = this.xorEncryptDecrypt(encrypted, this.key);
    return decrypted;
  }

  private xorEncryptDecrypt(input: string, key: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      result += String.fromCharCode(
        input.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }
}
