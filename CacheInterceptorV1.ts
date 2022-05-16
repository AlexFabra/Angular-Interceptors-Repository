//Donada una petició get, la guarda en la variable ‘cache’ si no té ‘reset’ als headers. 
//Si té reset, l’esborra de ‘cache’. Si la troba a cache, retorna la response sense demanar-la al backend.

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http"
import { Observable, of } from "rxjs"

import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";

@Injectable()
class CacheInterceptorV1 implements HttpInterceptor {
 
    //aquí es guarda l'historial de peticions i responses:
    private cache: Map<HttpRequest<any>, HttpResponse<any>> = new Map();
 
    //interceptem la petició
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
 
        //si la petició no és get, la deixem passar:
        if (req.method !== "GET") {
            return next.handle(req)
        }
 
        //si la petició té als headers reset, l'esborrem de l'historial 'cache':
        if (req.headers.get("reset")) {
            this.cache.delete(req)
        }
 
        //obtenim l'element de la cache que concideix amb la petició:
        const cachedResponse: HttpResponse<any> | undefined = this.cache.get(req);
 
        //si existeix, retornem la resposta de la cache (sense tornar a demanar la petició al backend)
        if (cachedResponse) {
            return of(cachedResponse.clone())
 
            //si no existeix, la guardem a la cache:
        } else {
            return next.handle(req).pipe(map((event) => {
                if (event instanceof HttpResponse) {
                    event = event.clone(event.body)
                    this.cache.set(req, event)
                }
                return event;
            }));
        }
    }
}
 
 
