import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import {
  Direccion,
  OrdenProducto,
  Producto,
  ProductoRequest
} from '../models/producto.model';

@Service()
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;

  listar(
    pagina: number,
    tamanio: number,
    ordenarPor: OrdenProducto,
    direccion: Direccion
  ): Observable<PaginaResponse<Producto>> {
    const params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', ordenarPor)
      .set('direccion', direccion);

    return this.http
      .get<PaginaResponse<Producto> | Producto[]>(this.url, { params })
      .pipe(
        map(respuesta => {
          if (!Array.isArray(respuesta)) {
            return respuesta;
          }

          const ordenados = [...respuesta].sort((a, b) => {
            let valorA: string | number;
            let valorB: string | number;

            if (ordenarPor === 'nombre') {
              valorA = a.nombre.toLowerCase();
              valorB = b.nombre.toLowerCase();
            } else {
              valorA = a[ordenarPor];
              valorB = b[ordenarPor];
            }

            const comparacion =
              typeof valorA === 'string'
                ? valorA.localeCompare(String(valorB))
                : Number(valorA) - Number(valorB);

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

  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}/${id}`);
  }

  crear(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.url, dto);
  }

  actualizar(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}/${id}`, dto);
  }

  /** Baja lógica: el backend marca estado = false. */
  darDeBaja(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
