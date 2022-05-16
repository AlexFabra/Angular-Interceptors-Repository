import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http"
import { Observable, of } from "rxjs"

import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

/** Donat un get després d'altra petició amb diferent métode i amb la mateixa url, esborra aquesta petició del cache i fa la nova petició guardant-la al cache
 *  donat un get després d'altre amb la mateixa url, simula la resposta de la nova petició sense guardar res al caché
 *  donat una petició diferent a un get, la deixa passar guardant-la al caché
 */
@Injectable()
export class CacheInterceptorV2 implements HttpInterceptor {

    //aquí es guarda l'historial de peticions i responses:
    private cache: Map<HttpRequest<any>, HttpResponse<any>> = new Map();

    //interceptem la petició
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (req.method == "GET") {

            let simulateResponse: boolean = false;
            let simulatedResponse:HttpResponse<any>;

            this.cache.forEach((value, key) => {
                //si trobem una petició que coincideixi en url amb la petició pero no en el métode, l'esborrem (i no guardarem el get a la cache): 
                if (key.url == req.url && key.method != req.method) {
                    this.cache.delete(key);
                }
                //si trobem una petició que coincideixi en url i mètode, no enviarem la petició al backend, ja que en tindrem la que hem guardat a la cache:
                else if (key.url == req.url && key.method == req.method) {
                    simulateResponse = true;
                    simulatedResponse = value;
                }
            })

            if (!simulateResponse) {
                return this.sendRequest(req, next);
            } else {
                console.log(simulatedResponse!)
                return of(simulatedResponse!);
            }
        } else {
            return this.sendRequest(req, next);
        }
    }

    sendRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(map((event) => {
            if (event instanceof HttpResponse) {
                event = event.clone(event.body)
                this.cache.set(req, event);
            }
            return event;
        }));
    }
}

