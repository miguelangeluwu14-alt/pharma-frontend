import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Cliente } from '../models/cliente.model';

@Service()
export class ClienteService {

  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  listar(
    pagina = 0,
    tamanio = 20,
    ordenarPor = 'apellidos',
    direccion: 'asc' | 'desc' = 'asc'
  ): Observable<PaginaResponse<Cliente>> {

    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    return this.http
      .get<Cliente[] | PaginaResponse<Cliente>>(
        this.url,
        { params }
      )
      .pipe(
        map(respuesta => {

          if (Array.isArray(respuesta)) {
            return {
              contenido: respuesta,
              pagina: 0,
              tamanio: respuesta.length,
              totalElementos: respuesta.length,
              totalPaginas: respuesta.length > 0 ? 1 : 0,
              ultima: true
            };
          }

          return respuesta;
        })
      );
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(
      `${this.url}/${id}`
    );
  }
}