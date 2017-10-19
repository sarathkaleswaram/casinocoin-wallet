import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { NgModule }                 from '@angular/core';
import { FormsModule }              from '@angular/forms';
import { HttpModule }               from '@angular/http';
import { Logger }                   from 'angular2-logger/core';
import { environment }              from '../environments/index';

import { AppRoutingModule }         from './app-routing.module';

import { ElectronService }          from './providers/electron.service';
import { WalletService }            from './providers/wallet.service';
import { CasinocoinService }        from './providers/casinocoin.service';
import { WebsocketService }         from './providers/websocket.service';

import { AuthGuard }                from './domain/auth-guard';

import { WebStorageModule, 
         LocalStorageService, 
         SessionStorageService, 
         CookiesStorageService }    from 'ngx-store';

import { AppComponent }             from './app.component';
import { HomeComponent }            from './components/home/home.component';
import { WalletSetupComponent }     from './components/wallet-setup/wallet-setup.component';
import { SetupStep1Component }      from './components/wallet-setup/step1-component';
import { SetupStep2Component }      from './components/wallet-setup/step2-component';
import { SetupStep3Component }      from './components/wallet-setup/step3-component';
import { SetupStep4Component }      from './components/wallet-setup/step4-component';
import { LoginComponent }           from './components/login/login.component';
import { SendCoinsComponent }       from './components/forms/send-coins/send-coins.component';
import { ReceiveCoinsComponent }    from './components/forms/receive-coins/receive-coins.component';
import { AddressbookComponent }     from './components/forms/addressbook/addressbook.component';
import { CoinSwapComponent }        from './components/forms/coin-swap/coin-swap.component';
import { OverviewComponent }        from './components/forms/overview/overview.component';

// import PrimeNG, Material and Bootstrap modules
import { DialogModule, ButtonModule, CheckboxModule,
         MessagesModule, ToolbarModule, AccordionModule,
         MenuModule, PanelModule, CalendarModule,
         DataTableModule, SharedModule, DropdownModule,
         StepsModule, PasswordModule } from 'primeng/primeng';
import { MatListModule, MatSidenavModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WalletSetupComponent,
    SetupStep1Component, SetupStep2Component, 
    SetupStep3Component, SetupStep4Component,
    LoginComponent,
    SendCoinsComponent,
    ReceiveCoinsComponent,
    AddressbookComponent,
    CoinSwapComponent,
    OverviewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    WebStorageModule,
    NgbModule.forRoot(),
    DialogModule, ButtonModule, CheckboxModule,
    MessagesModule, ToolbarModule, AccordionModule,
    MenuModule, PanelModule, CalendarModule,
    DataTableModule, SharedModule, DropdownModule,
    StepsModule, PasswordModule,
    MatListModule, MatSidenavModule
  ],
  providers: [
    Logger, 
    ElectronService,
    AuthGuard,
    WebsocketService,
    WalletService,
    CasinocoinService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(private logger: Logger) {
    this.logger.debug("AppModule");
    this.logger.level = environment.loglevel;
    this.logger.debug("Log Level: " + this.logger.level);
  }
}