import {Component, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';


class ApiErrors {
    static RETRY_FAILED = 'RETRY_FAILED';
    static TIMEOUT = 'TIMEOUT';
    static JSON_FORMAT = 'JSON FORMAT'
    static BAD_RESPONSE: 'BAD RESPONSE';
}


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    result$: Observable<number>;
    abort: Observable<boolean>;

    constructor(private  http: Http) {

    }


    private logI = 0;

    private log(v) {
        console.log(this.logI + ': ' + v);
        this.logI++;
    }

    doAbort() {
        this.abort.subscribe();
    }

    ngOnInit(): void {

        this.abort = Observable.fromEvent(document, 'click').do(() => this.log('DOCUMENT CLICK - ABORT'));

        this.log('WAIT FOR GET');
        this.result$ = this.http
            .get('http://0.0.0.0:82/')
            .takeUntil(this.abort)
            .do(v => this.log('AFTER FETCH DATA'))
            .map(res => res.json())
            .catch(e => Observable.throw(ApiErrors.JSON_FORMAT + e))
            .do(v => this.log('AFTER MAP'))
            .timeoutWith(100000, Observable.throw(ApiErrors.TIMEOUT))
            .do(v => this.log('AFTER TIMEOUT'))
            .retry(5)
            .catch(e => Observable.throw(ApiErrors.RETRY_FAILED + e))
            .do(v => this.log('AFTER RETRY'))
            .do(v => this.log('CHECKING VALUE'))
            .filter(v => v > 50)
            .defaultIfEmpty(-1)
            .do(v => this.log('ALMOST COMPLETE'))
            .do(v => this.log('COMPLETE'))
            .catch(e => {
                this.log(e);
                return Observable.throw(e);
            });
    }

}
