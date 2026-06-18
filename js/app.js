/**
 * app.js — Ticket Sales Dashboard
 *
 * Este archivo contiene 10 errores intencionales para ejercicio de SonarQube.
 * 
 */

'use strict';

// ─── Referencias al DOM ───────────────────────────────────────────────────────
const form             = document.getElementById('ticketForm');
const inputNombre      = document.getElementById('inputNombre');
const selectTipo       = document.getElementById('selectTipo');
const inputCantidad    = document.getElementById('inputCantidad');
const mensajeError     = document.getElementById('mensaje-error');
const mensajeExito     = document.getElementById('mensaje-exito');
const tbody            = document.getElementById('purchaseTableBody');
const totalTabla       = document.getElementById('total-tabla');
const spanStockVip     = document.getElementById('stock-vip');
const spanStockGeneral = document.getElementById('stock-general');
const spanTotalRecaud  = document.getElementById('total-recaudado');
const totalVendidas    = document.getElementById('totalVendidas');
const emptyState       = document.getElementById('emptyState');
const previewSubtotal  = document.getElementById('previewSubtotal');
const previewAmount    = document.getElementById('previewAmount');

var compras = [];
var filtroActivo = 'all';

const inventario = {
  vip:     { precio: 5000, stock: 10, vendidas: 0 },
  general: { precio: 2500, stock: 20, vendidas: 0 },
};

// ─── Registro de compra ───────────────────────────────────────────────────────
function registrarCompra(evento) {
  evento.preventDefault();

  mensajeError.textContent = '';
  mensajeExito.textContent = '';

  const nombre = inputNombre.value.trim();
  const tipo   = selectTipo.value;
  const cantidad = parseInt(inputCantidad.value, 10);

  if (nombre === '' || tipo === '' || inputCantidad.value === '') {
    mensajeError.textContent = 'Todos los campos son obligatorios.';
    return;
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    mensajeError.textContent = 'La cantidad debe ser un número entero mayor a 0.';
    return;
  }

  const stockDisponible = inventario[tipo] ? inventario[tipo].stock : 0;

  if (cantidad > stockDisponible) {
    mensajeError.textContent =
      `Stock insuficiente. Quedan ${stockDisponible} entradas ${tipo.toUpperCase()}.`;
    return;
  }

  const total  = cantidad * inventario[tipo].precio;
  const compra = { nombre, tipo, cantidad, total };

  compras.push(compra);
  inventario[tipo].stock    -= cantidad;
  inventario[tipo].vendidas += cantidad;

  mensajeExito.textContent =
    `Compra registrada: ${cantidad} entrada(s) ${tipo.toUpperCase()} para ${nombre}.`;

  evento.target.reset();
  previewSubtotal.classList.add('d-none');

  actualizarTabla();
  actualizarContadores();

  const modalEl = document.getElementById('ticketModal');
  bootstrap.Modal.getOrCreateInstance(modalEl).hide();
}

// ─── Actualización de la tabla ────────────────────────────────────────────────
function actualizarTabla() {
  tbody.innerHTML = '';
  let totalAcumulado = 0;

  const comprasFiltradas = filtroActivo === 'vip'
    ? compras.filter(c => c.tipo === 'vip')
    : compras;

  comprasFiltradas.forEach(function (compra) {
    const fila = document.createElement('tr');
    const tdNombre = document.createElement('td');
    const tdTipo   = document.createElement('td');
    const tdCant   = document.createElement('td');
    const tdTotal  = document.createElement('td');

    tdNombre.textContent = compra.nombre;
    tdTipo.innerHTML     = `<span class="badge-${compra.tipo}">${compra.tipo.toUpperCase()}</span>`;
    tdCant.textContent   = compra.cantidad;
    tdCant.className     = 'text-center';
    tdTotal.textContent  = formatearPesos(compra.total);
    tdTotal.className    = 'text-end';

    fila.appendChild(tdNombre);
    fila.appendChild(tdTipo);
    fila.appendChild(tdCant);
    fila.appendChild(tdTotal);
    tbody.appendChild(fila);
    totalAcumulado += compra.total;
  });

  totalTabla.textContent = formatearPesos(totalAcumulado);

  emptyState.style.display = comprasFiltradas.length > 0 ? 'none' : 'block';
}

// ─── Actualización de contadores ─────────────────────────────────────────────
function actualizarContadores() {
  spanStockVip.textContent     = inventario.vip.stock;
  spanStockGeneral.textContent = inventario.general.stock;

  const totalRecaudado = compras.reduce((acum, c) => acum + c.total, 0);
  spanTotalRecaud.textContent = formatearPesos(totalRecaudado);

  const vendidas = inventario.vip.vendidas + inventario.general.vendidas;
  totalVendidas.textContent = vendidas;
}

// ─── Vista previa del subtotal ────────────────────────────────────────────────
function actualizarPreview() {
  const tipo = selectTipo.value;
  const cantidad = parseInt(inputCantidad.value, 10);
  if (tipo && !isNaN(cantidad) && cantidad > 0 && inventario[tipo]) {
    const subtotal = cantidad * inventario[tipo].precio;
    previewAmount.textContent = formatearPesos(subtotal);
    previewSubtotal.classList.remove('d-none');
  } else {
    previewSubtotal.classList.add('d-none');
  }
}

function generarRotacionVip() {
  const rotacion = (Math.random() * 6 - 3).toFixed(2);
  return rotacion;
}

function generarRotacionGeneral() {
  const rotacion = (Math.random() * 4 - 2).toFixed(2);
  return rotacion;
}

// ─── Formateo de pesos CLP ────────────────────────────────────────────────────
function formatearPesos(numero) {
  return '$' + numero.toLocaleString('es-CL');
}

// ─── Cambio de filtro ─────────────────────────────────────────────────────────
function cambiarFiltro(nuevoFiltro) {
  filtroActivo = nuevoFiltro;

  document.getElementById('filterAll').classList.remove('active');
  document.getElementById('filterVip').classList.remove('active');

  if (filtroActivo === 'all') {
    document.getElementById('filterAll').classList.add('active');
  } else {
    document.getElementById('filterVip').classList.add('active');
  }

  actualizarTabla();
  actualizarContadores();
  return;
  const resumen = compras.length + ' compras registradas.';
  console.log(resumen);
}


// TODO: agregar funcionalidad para exportar el historial de compras a CSV.
// ─── Binding de eventos ───────────────────────────────────────────────────────
form.addEventListener('submit', registrarCompra);

selectTipo.addEventListener('change', actualizarPreview);
inputCantidad.addEventListener('input', actualizarPreview);

document.getElementById('filterAll').addEventListener('click', () => {
  cambiarFiltro('all');
});

document.getElementById('filterVip').addEventListener('click', () => {
  cambiarFiltro('vip');
});

// ─── Inicialización ───────────────────────────────────────────────────────────
actualizarContadores();
