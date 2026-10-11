import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginaResponse } from '../../../core/models/pagina-response';
import { FiltroVentas, Venta, VentaRequest } from '../models/venta.model';

interface VentaBackend {
  id: number;
  fecha?: string;
  fechaRegistro?: string;
  clienteId: number;
  clienteNombre: string;
  estado: 'REGISTRADA' | 'ANULADA';
  total: number;
  detalles: Venta['detalles'];
}

@Service()
export class VentaService {

  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/ventas`;

  registrar(dto: VentaRequest): Observable<Venta> {
    return this.http
      .post<VentaBackend>(this.url, dto)
      .pipe(
        map(v => this.adaptarVenta(v))
      );
  }

  obtener(id: number): Observable<Venta> {
    return this.http
      .get<VentaBackend>(`${this.url}/${id}`)
      .pipe(
        map(v => this.adaptarVenta(v))
      );
  }

  buscar(
    filtro: FiltroVentas,
    pagina: number,
    tamanio: number
  ): Observable<PaginaResponse<Venta>> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio)
      .set('ordenarPor', 'fecha')
      .set('direccion', 'desc');

    if (filtro.clienteId) {
      params = params.set('clienteId', filtro.clienteId);
    }

    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }

    if (filtro.desde) {
      params = params.set('desde', filtro.desde);
    }

    if (filtro.hasta) {
      params = params.set('hasta', filtro.hasta);
    }

    return this.http
      .get<VentaBackend[]>(`${this.url}/buscar`, { params })
      .pipe(
        map(datos => {
          const ventas = datos.map(v => this.adaptarVenta(v));

          return {
            contenido: ventas,
            pagina: 0,
            tamanio: ventas.length,
            totalElementos: ventas.length,
            totalPaginas: ventas.length > 0 ? 1 : 0,
            ultima: true
          };
        })
      );
  }

  private adaptarVenta(v: VentaBackend): Venta {
    return {
      id: v.id,
      fecha: v.fecha ?? v.fechaRegistro ?? '',
      clienteId: v.clienteId,
      clienteNombre: v.clienteNombre,
      estado: v.estado,
      total: v.total,
      detalles: v.detalles
    };
  }
}