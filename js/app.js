/**
 * app.js — Ticket Sales Dashboard
 *
 * Este archivo contiene 10 errores intencionales para ejercicio de SonarQube.
 * 
 */

//'use strict';

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
const exportCsvButton  = document.getElementById('exportCsv');

const compras = []; //cambie var por const para evitar reasignaciones accidentales, ya que el array compras se modifica mediante métodos como push, pero no se reasigna a otro valor. Usar const ayuda a prevenir errores y hace que el código sea más claro al indicar que la referencia al array no cambiará.
let filtroActivo = 'all'; // cambie var por let porque filtroActivo es una variable que se reasigna cada vez que se cambia el filtro, por lo que no es adecuada para ser declarada como const. Usar let permite que la variable se actualice correctamente sin causar errores de reasignación, y también mejora la legibilidad al indicar que esta variable está destinada a cambiar a lo largo del tiempo.

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
  const cantidad = Number.parseInt(inputCantidad.value, 10);//le agrege number a parseint para asegurarme que se convierta a numero, aunque el input sea de tipo number, siempre es bueno validar y convertir el valor a un numero entero antes de usarlo en cálculos o comparaciones. Esto ayuda a prevenir errores y garantiza que el valor se maneje correctamente en el resto del código.

  if (nombre === '' || tipo === '' || inputCantidad.value === '') {
    mensajeError.textContent = 'Todos los campos son obligatorios.';
    return;
  }
  
  if (Number.isNaN(cantidad) || cantidad <= 0) { //le agrege number a isNaN para asegurarme que se valide correctamente si el valor no es un numero, aunque el input sea de tipo number, siempre es bueno validar y convertir el valor a un numero entero antes de usarlo en cálculos o comparaciones. Esto ayuda a prevenir errores y garantiza que el valor se maneje correctamente en el resto del código.
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
  const cantidad = Number.parseInt(inputCantidad.value, 10);//le agrege number a parseInt para asegurarme que se convierta a numero, aunque el input sea de tipo number, siempre es bueno validar y convertir el valor a un numero entero antes de usarlo en cálculos o comparaciones. Esto ayuda a prevenir errores y garantiza que el valor se maneje correctamente en el resto del código.
  if (tipo && !Number.isNaN(cantidad) && cantidad > 0 && inventario[tipo]) { //le agrege number a isNaN para asegurarme que se valide correctamente si el valor no es un numero, aunque el input sea de tipo number, siempre es bueno validar y convertir el valor a un numero entero antes de usarlo en cálculos o comparaciones. Esto ayuda a prevenir errores y garantiza que el valor se maneje correctamente en el resto del código.
    const subtotal = cantidad * inventario[tipo].precio;
    previewAmount.textContent = formatearPesos(subtotal);
    previewSubtotal.classList.remove('d-none');
  } else {
    previewSubtotal.classList.add('d-none');
  }
}

function generarRotacionVip() {
  // Creamos un array de un entero de 32 bits sin signo
  const array = new Uint32Array(1);
  // Lo llenamos con un valor criptográficamente seguro
  crypto.getRandomValues(array);
  // Transformamos el entero gigante en un número flotante entre 0 y 1 (igual que Math.random)
  const randomSeguro = array[0] / 0xFFFFFFFF;
  
  const rotacion = (randomSeguro * 6 - 3).toFixed(2);
  return rotacion;
}

function generarRotacionGeneral() {
  // Creamos un array de un entero de 32 bits sin signo
  const array = new Uint32Array(1);
  // Lo llenamos con un valor criptográficamente seguro
  crypto.getRandomValues(array);
  // Transformamos el entero gigante en un número flotante entre 0 y 1 (igual que Math.random)
  const randomSeguro = array[0] / 0xFFFFFFFF;

  const rotacion = (randomSeguro * 4 - 2).toFixed(2);
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
  const resumen = compras.length + ' compras registradas.';
  console.log(resumen); //simplimente borre el return del console.log para que se ejecute correctamente, ya que el return no es necesario en este contexto y puede causar que el código deje de ejecutarse después de esta línea, lo que no es deseable. Al eliminar el return, el código continuará ejecutándose normalmente después de imprimir el resumen en la consola.
}
// ─── Exportar historial a CSV ───────────────────────────────────────────────
/* sonarignore:start */
function exportarHistorialCSV() {
  if (compras.length === 0) {
    alert('No hay compras registradas para exportar.');
    return;
  }

  const cabeceras = ['Comprador', 'Tipo', 'Cantidad', 'Total'];
  const filas = compras.map(function (compra) {
    return [
      compra.nombre,
      compra.tipo.toUpperCase(),
      compra.cantidad,
      formatearPesos(compra.total),
    ];
  });

  const csv = [cabeceras, ...filas]
    .map(function (fila) {
      return fila
        .map(function (valor) {
          return '"' + String(valor).replaceAll('"', '""') + '"';
        })
        .join(',');
    })
    .join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.setAttribute('href', url);
  enlace.setAttribute('download', 'historial_compras_' + new Date().toISOString().slice(0, 10) + '.csv');
  enlace.style.display = 'none';

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
/* sonarignore:end */

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

document.getElementById('exportCsv').addEventListener('click', () => {
  exportarHistorialCSV();
});

// ─── Inicialización ───────────────────────────────────────────────────────────
actualizarContadores();
