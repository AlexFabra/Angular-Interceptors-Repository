import { AuthResponse, Usuario } from '../auth/interfaces/auth.interface';
import { Content, UserHolidays } from '../models/UserHolidays.model';
import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, dematerialize, materialize, mergeMap } from 'rxjs/operators';

import { CalendarService } from '../services/calendar.service';
import { Injectable } from '@angular/core';
import { nextTick } from 'process';

const dates: Content[] = [{ date: '11/01/2022' }, { date: '12/01/2022' }, { date: '13/01/2022' }, { date: '14/01/2022' }]
const userHolidaysData: UserHolidays = { content: dates }
const auth: AuthResponse = { ok: true, uid: '1576', name: 'Alejandro Fabra', token: '123456', msg: 'benvingut' };
const adminAuth: AuthResponse = { ok: true, uid: '1628', name: 'Quim Font', token: '654321', msg: 'benvingut' };
const userData: Usuario = { uid: '1576', name: 'Alejandro Fabra' };


@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.handleRequests(req, next);
        //per enviar a la petició original:
        //.then((modReq)=> {next.handle(modReq)})
    }

    handleRequests(req: HttpRequest<any>, next: HttpHandler): any {
        const { url, method } = req;
        switch (true) {
            case url.endsWith('/auth') && method === 'POST':
                return authenticate(req);
                break;
            case url.endsWith('/renew') && method === 'GET':
                return renewToken();
                break;
            // case url.endsWith('/holidays') && method === 'POST':
            //     return postHolidays(req);
            // case url.endsWith('/specialDays') && method === 'GET':
            //     return getHolidays(req, next);
            //     break;
            // case url.endsWith('/holidays') && method === 'DELETE':
            //     return deleteHolidays();
            default:
                // pass through any requests not handled above
                return next.handle(req);
        }
    }
}

function authenticate(req: HttpRequest<any>) {
    //simulem usuari normal per defecte:
    let authentication:Observable<HttpResponse<any>>=ok(auth);
    console.log(req.body.email);
    //simulem usuari admin donades unes condicions:
    if(req.body.email=='admin@test.com') {authentication = ok(adminAuth);}
    
    authentication.subscribe((authData) => {
        localStorage.setItem('token', authData.body.token);
    });
    return authentication;
}

function renewToken() {
    return (localStorage.getItem('token')=='654321') ? ok(adminAuth) : ok(auth);
}

function postHolidays(req: HttpRequest<any>) {
    let body = req.body.body;
    body = JSON.parse(body);
    //console.log("body", body, Array.isArray(body), typeof body);

    body.forEach((element: any) => {
        dates.push({ date: element })
    });
    console.log(dates);
    return ok("dates guardades");
}

function getHolidays(req: HttpRequest<any>,next: HttpHandler) {
    //return (condicio) ? ok(userHolidaysData) : next.handle(req); 
}

function deleteHolidays() {
}

function ok(body: any) {
    return of(new HttpResponse({ status: 200, body }))
}

function error(message: any) {
    return throwError({ error: { message } });
}

function unauthorized() {
    return throwError({ status: 401, error: { message: 'Unauthorised' } });
}





