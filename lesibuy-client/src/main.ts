import { bootstrapApplication } from '@angular/platform-browser';
import { withFetch, provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, {
  providers: [
    // ← registers HttpClient and opts into the Fetch-based backend
    provideHttpClient(withFetch()),
    // … any other root providers (router, etc.) …
  ]
})
.catch(err => console.error(err));
