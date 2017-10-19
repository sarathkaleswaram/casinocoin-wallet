import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { WebsocketService } from './websocket.service';
import { WalletService } from './wallet.service';
import { LedgerStreamMessages, ValidationStreamMessages, TransactionStreamMessages } from '../domain/websocket-types';
import { Logger } from 'angular2-logger/core';
import * as cscKeyAPI from 'casinocoin-libjs-keypairs';
import { LokiKey } from '../domain/lokijs';

@Injectable()
export class CasinocoinService implements OnDestroy {

    private isConnected: boolean = false;
    private connectedSubscription: Subscription;
    private socketSubscription: Subscription;
    private subject = new Subject<any>();
  
    constructor(private logger: Logger, 
                private wsService: WebsocketService,
                private walletService: WalletService ) {
        logger.debug("### INIT  CasinocoinService ###");
    }

    ngOnDestroy() {
        this.logger.debug("### CasinocoinService onDestroy ###");
        this.socketSubscription.unsubscribe();
    }

    connect(): Observable<any> {
        this.logger.debug("### CasinocoinService Connect() - isConnected: " + this.isConnected);
        if(!this.isConnected){
            // check if websocket is open, otherwise wait till it is
            const connectedSubscription = this.wsService.isConnected$.subscribe(connected => {
                this.logger.debug("### CasinocoinService isConnected: " + connected);
                if(connected && !this.isConnected){
                    this.isConnected = true;
                    this.subscribeToMessages();
                    // get the current server state
                    this.getServerState();
                    // subscribe to ledger stream
                    this.subscribeToLedgerStream();
                    // get accounts and subscribe to accountstream
                    let subscribeAccounts = [];
                    this.walletService.getAllAccounts().forEach(element => {
                        subscribeAccounts.push(element.accountID);
                    });
                    this.logger.debug("### CasinocoinService Accounts: " + JSON.stringify(subscribeAccounts));
                    this.subscribeToAccountsStream(subscribeAccounts);
                    // // subscribe to socket connection updates
                    // const connectionStatusSubscription = this.wsService.websocketConnection.connectionStatus.subscribe(numberConnected => {
                    //     this.logger.debug('### CasinocoinService, connected websockets:', numberConnected);
                    //     if(numberConnected > 0) {
                    //         this.isConnected = true;
                    //         // get the server state
                    //         this.getServerState();
                    //     } else {
                    //         this.isConnected = false;
                    //     }
                    // });
                }
            });
        }
        // return observable with incomming message
        return this.subject.asObservable();
    }

    subscribeToMessages() {
        // subscribe to incomming messages
        this.logger.debug("### CasinocoinService - subscribeToMessages");
        this.socketSubscription = this.wsService.websocketConnection.messages.subscribe((message: any) => {
            let incommingMessage = JSON.parse(message);
            this.logger.debug('### CasinocoinService received message from server: ', JSON.stringify(incommingMessage));
            if(incommingMessage['type'] == 'ledgerClosed'){
                this.logger.debug("closed ledger: " + incommingMessage['ledger_index']);
                this.subject.next(incommingMessage);
            } else if(incommingMessage['type'] == 'serverStatus'){
                this.logger.debug("server state: " + incommingMessage['server_status']);
                this.subject.next(incommingMessage);
            } else if(incommingMessage['type'] == 'transaction'){
                this.logger.debug("transaction: " + JSON.stringify(incommingMessage['transaction']));
                this.subject.next(incommingMessage);
            }  else if(incommingMessage['type'] == 'response'){
                // we received a response on a request
                if(incommingMessage['id'] == 'ping'){
                    // we received a pong
                    this.logger.debug("Pong");
                } else if(incommingMessage['server_state']){
                    // we received a server_state
                    this.logger.debug("Server State: " + JSON.stringify(incommingMessage.result));
                    this.subject.next(incommingMessage.result);
                }
            } else { 
                this.logger.debug("unmapped message: " + JSON.stringify(incommingMessage));
            }
        });
    }

    sendCommand(command: Object){
        this.wsService.sendingCommands.next(JSON.stringify(command));
    }

    pingServer() {
        this.sendCommand({id: "ping",command: "ping"});
    }

    getServerState() {
        this.sendCommand({id: "server_state", command: "server_state"});
    }

    subscribeToLedgerStream() {
        this.sendCommand({ id: "ValidatedLedgers", command: "subscribe", streams: ["ledger","server"]});
    }

    subscribeToAccountsStream(accountArray: Array<string>) {
        this.sendCommand({ id: "AccountUpdates", command: "subscribe", accounts: accountArray});
    }

    generateNewKeyPair(): LokiKey {
        const secret = cscKeyAPI.generateSeed();
        const keypair = cscKeyAPI.deriveKeypair(secret);
        const address = cscKeyAPI.deriveAddress(keypair.publicKey);
        let newKeyPair: LokiKey = { privateKey: keypair.privateKey, publicKey: keypair.publicKey, accountID: address, secret: secret, encrypted: false};
        return newKeyPair;
    }
}