import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { UrlSerializer } from '@angular/router';

import { ErrorInterceptor } from './interceptors/error/error.interceptor';
import { RequestInterceptor } from './interceptors/jwt/request.interceptor';
import { loadingInterceptor } from './interceptors/loading/loading.interceptor';
import { EncryptedUrlSerializer } from './services/encrypt-url-serializer.service';
import { IconRegistryService } from './services/icon-registry.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    provideHttpClient(
      withInterceptors([
        RequestInterceptor,
        ErrorInterceptor,
        loadingInterceptor
      ])
    ),
    { provide: UrlSerializer, useClass: EncryptedUrlSerializer }
  ]
})
export class CoreModule {
  constructor(private iconRegistryService: IconRegistryService) {}
}
