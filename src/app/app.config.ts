import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { CloudinaryService } from './services/cloudinary.service';
import { JsonbinService } from './services/jsonbin.service';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(), CloudinaryService, JsonbinService]
};
