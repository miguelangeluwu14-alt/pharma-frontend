import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { Cliente, ClienteRequest } from '../models/cliente.model';

@Service()
export class ClienteService {

  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/clientes`;

  listar(
    pagina = 0,
    tamanio = 10,
    ordenarPor: 'dni' | 'apellidos' = 'apellidos',
    direccion: 'asc' | 'desc' = 'asc'
  ): Observable<PaginaResponse<Cliente>> {

    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    return this.http
      .get<PaginaResponse<Cliente> | Cliente[]>(this.url, { params })
      .pipe(
        map(respuesta => {
          if (!Array.isArray(respuesta)) {
            return respuesta;
          }

          const ordenados = [...respuesta].sort((a, b) => {
            const valorA = ordenarPor === 'dni' ? a.dni : a.apellidos.toLowerCase();
            const valorB = ordenarPor === 'dni' ? b.dni : b.apellidos.toLowerCase();
            const comparacion = valorA.localeCompare(valorB);
            return direccion === 'asc' ? comparacion : -comparacion;
          });

          const totalElementos = ordenados.length;
          const totalPaginas = Math.ceil(totalElementos / tamanio);
          const inicio = pagina * tamanio;
          const contenido = ordenados.slice(inicio, inicio + tamanio);

          return {
            contenido,
            pagina,
            tamanio,
            totalElementos,
            totalPaginas,
            ultima: totalPaginas === 0 || pagina >= totalPaginas - 1,
          };
        })
      );
  }

  obtener(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  crear(dto: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, dto);
  }

  actualizar(id: number, dto: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${id}`, dto);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
