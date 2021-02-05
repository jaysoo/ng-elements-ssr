import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { CustomElementsModule } from '../lib/custom-elements/custom-element.module.server';

@NgModule({
  imports: [AppModule, ServerModule, CustomElementsModule],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
