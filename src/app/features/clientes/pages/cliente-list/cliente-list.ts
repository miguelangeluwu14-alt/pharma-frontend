import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {

  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<'dni' | 'apellidos'>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');

  protected readonly totalElementos = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly ultima = signal(true);

  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();

    if (!texto) {
      return this.clientes();
    }

    return this.clientes().filter(c => {
      const nombreCompleto = `${c.nombres} ${c.apellidos}`.toLowerCase();
      return c.dni.includes(texto) || nombreCompleto.includes(texto);
    });
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.listar(
      this.pagina(),
      this.tamanio(),
      this.ordenarPor(),
      this.direccion()
    ).subscribe({
      next: respuesta => {
        this.clientes.set(respuesta.contenido);
        this.pagina.set(respuesta.pagina);
        this.tamanio.set(respuesta.tamanio);
        this.totalElementos.set(respuesta.totalElementos);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.ultima.set(respuesta.ultima);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.pagina.set(0);
    this.cargar();
  }

  anterior(): void {
    if (this.pagina() === 0) {
      return;
    }

    this.pagina.update(p => p - 1);
    this.cargar();
  }

  siguiente(): void {
    if (this.ultima()) {
      return;
    }

    this.pagina.update(p => p + 1);
    this.cargar();
  }

  ordenar(campo: 'dni' | 'apellidos'): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }

    this.pagina.set(0);
    this.cargar();
  }

  indicadorOrden(campo: 'dni' | 'apellidos'): string {
    if (this.ordenarPor() !== campo) {
      return '';
    }

    return this.direccion() === 'asc' ? '▲' : '▼';
  }

  eliminar(cliente: Cliente): void {
    if (!confirm(`¿Dar de baja al cliente "${cliente.nombres} ${cliente.apellidos}"?`)) {
      return;
    }

    this.error.set(null);

    this.clienteService.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}
