import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Reservas } from './services/reservas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  reservaciones: any[] = [];
  reservacionesFiltradas: any[] = [];

  clientes: any[] = [];
  tours: any[] = [];

  // FILTROS
  filtroCliente: string = '';
  filtroTour: string = '';

  mostrarModal: boolean = false;
  modoEditar: boolean = false;
  idEditar: number | null = null;

  nuevaReserva = {
    cantidadPersonas: 1,
    precioTotal: 0,
    id_cliente: null as number | null,
    id_tour: null as number | null
  };

  paginaActual: number = 1;
  totalPaginas: number = 1;
  totalRegistros: number = 0;

  constructor(
    private reservasService: Reservas,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.listarReservaciones();
    this.cargarClientes();
    this.cargarTours();
  }


  listarReservaciones(pagina: number = 1): void {

    this.reservasService.getReservaciones(pagina).subscribe({

      next: (respuesta: any) => {

        this.reservaciones = respuesta.data;

        this.paginaActual = respuesta.current_page;
        this.totalPaginas = respuesta.last_page;
        this.totalRegistros = respuesta.total;


        this.aplicarFiltros();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al listar reservaciones:', error);
      }

    });

  }


  cargarClientes(): void {

    this.reservasService.getClientes().subscribe({

      next: (respuesta: any) => {

        this.clientes = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.data || [];

        this.cdr.detectChanges();

      },

      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }

    });

  }


  cargarTours(): void {

    this.reservasService.getTours().subscribe({

      next: (respuesta: any) => {

        this.tours = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.data || [];

        this.cdr.detectChanges();

      },

      error: (error) => {
        console.error('Error al cargar tours:', error);
      }

    });

  }


  aplicarFiltros(): void {

    this.reservacionesFiltradas = this.reservaciones.filter((reserva: any) => {

      // NOMBRE DEL CLIENTE
      const nombreCliente = (
        reserva.cliente?.nombre || ''
      ).toLowerCase();


      // FILTRO CLIENTE
      const coincideCliente =
        this.filtroCliente.trim() === '' ||
        nombreCliente.includes(
          this.filtroCliente.toLowerCase().trim()
        );


      // ID DEL TOUR
      const idTour =
        reserva.id_tour ??
        reserva.tour_id ??
        reserva.tour?.id;


      // FILTRO TOUR
      const coincideTour =
        this.filtroTour === '' ||
        String(idTour) === String(this.filtroTour);


      return coincideCliente && coincideTour;

    });

  }


  limpiarFiltros(): void {

    this.filtroCliente = '';
    this.filtroTour = '';

    this.aplicarFiltros();

  }


  // ===============================
  // MODAL
  // ===============================

  openAddModal(): void {

    this.modoEditar = false;
    this.idEditar = null;

    this.limpiarFormulario();

    this.mostrarModal = true;

  }


  closeAddModal(): void {

    this.mostrarModal = false;
    this.modoEditar = false;
    this.idEditar = null;

    this.limpiarFormulario();

  }


  // ===============================
  // GUARDAR
  // ===============================

  guardarReserva(): void {

    if (
      this.nuevaReserva.id_cliente === null ||
      this.nuevaReserva.id_tour === null ||
      this.nuevaReserva.cantidadPersonas <= 0 ||
      this.nuevaReserva.precioTotal < 0
    ) {

      alert(
        'Seleccione un cliente, un tour y complete los campos correctamente'
      );

      return;

    }


    // SI ESTÁ EDITANDO
    if (this.modoEditar && this.idEditar !== null) {

      this.actualizarReserva();

      return;

    }


    // SI ESTÁ CREANDO
    this.reservasService
      .crearReservacion(this.nuevaReserva)
      .subscribe({

        next: () => {

          this.closeAddModal();

          this.listarReservaciones(
            this.paginaActual
          );

        },

        error: (error) => {

          console.error(
            'Error al crear reservación:',
            error
          );

        }

      });

  }


  // ===============================
  // EDITAR
  // ===============================

  editReserva(reserva: any): void {

    this.modoEditar = true;

    this.idEditar = reserva.id;


    this.nuevaReserva = {

      cantidadPersonas:
        reserva.cantidadPersonas ??
        reserva.cantidad_personas ??
        1,

      precioTotal: Number(
        reserva.precioTotal ??
        reserva.precio_total ??
        0
      ),

      id_cliente:
        reserva.id_cliente ??
        reserva.cliente_id ??
        reserva.cliente?.id ??
        null,

      id_tour:
        reserva.id_tour ??
        reserva.tour_id ??
        reserva.tour?.id ??
        null

    };


    this.mostrarModal = true;

  }


  actualizarReserva(): void {

    if (this.idEditar === null) {
      return;
    }


    this.reservasService
      .actualizarReservacion(
        this.idEditar,
        this.nuevaReserva
      )
      .subscribe({

        next: () => {

          this.closeAddModal();

          this.listarReservaciones(
            this.paginaActual
          );

        },

        error: (error) => {

          console.error(
            'Error al actualizar reservación:',
            error
          );

        }

      });

  }


  // ===============================
  // ELIMINAR
  // ===============================

  deleteReserva(id: number): void {

    if (!confirm('¿Deseas eliminar esta reserva?')) {
      return;
    }


    this.reservasService
      .eliminarReservacion(id)
      .subscribe({

        next: () => {

          if (
            this.reservaciones.length === 1 &&
            this.paginaActual > 1
          ) {

            this.listarReservaciones(
              this.paginaActual - 1
            );

          } else {

            this.listarReservaciones(
              this.paginaActual
            );

          }

        },

        error: (error) => {

          console.error(
            'Error al eliminar reservación:',
            error
          );

        }

      });

  }


  // ===============================
  // LIMPIAR FORMULARIO
  // ===============================

  limpiarFormulario(): void {

    this.nuevaReserva = {

      cantidadPersonas: 1,

      precioTotal: 0,

      id_cliente: null,

      id_tour: null

    };

  }


  // ===============================
  // PAGINACIÓN
  // ===============================

  get paginas(): number[] {

    return Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );

  }


  paginaAnterior(): void {

    if (this.paginaActual > 1) {

      this.listarReservaciones(
        this.paginaActual - 1
      );

    }

  }


  paginaSiguiente(): void {

    if (this.paginaActual < this.totalPaginas) {

      this.listarReservaciones(
        this.paginaActual + 1
      );

    }

  }


  irPagina(pagina: number): void {

    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas
    ) {

      this.listarReservaciones(pagina);

    }

  }

}