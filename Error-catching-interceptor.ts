import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from "rxjs/operators";

import {Injectable} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UrlSegment } from '@angular/router';

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {

    constructor(private toastr: ToastrService) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        //console.log("request passant a través de l'interceptor",request);
        
        return next.handle(request)
            .pipe(
                map((res:HttpEvent<any>) => {
                    return res;
                }),
                catchError((error: HttpErrorResponse) => {
                    let errorMsg = '';
                    if (error.error instanceof ErrorEvent) {
                        errorMsg = `Error: ${error.error.message}`;
                        this.toastr.error('Error de comunicació amb el servidor', errorMsg);
                    } else {
                        errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
                        this.toastr.error(`Error ${error.status} de comunicació amb el servidor : ${error.error.errorMessage}`);
                    }
                    return throwError(errorMsg);
                })
            )
    }
}