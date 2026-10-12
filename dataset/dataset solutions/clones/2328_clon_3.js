const clientes = [
  { nombre: "Ana", consumos: [120, 80, 50], descuento: 0.10 },
  { nombre: "Luis", consumos: [200, 150], descuento: 0.15 },
  { nombre: "Marta", consumos: [90, 60, 40], descuento: 0.05 }
];

function calcularSubtotal(consumos) {
  let subtotal = 0;

  consumos.forEach(function(precio) {
    subtotal += precio;
  });

  return subtotal;
}

function aplicarDescuento(subtotal, descuento) {
  const cantidadDescontada = subtotal * descuento;
  const total = subtotal - cantidadDescontada;

  return total;
}

function formatearDinero(valor) {
  return "$" + valor.toFixed(2);
}

function calcularCuenta(cliente) {
  const subtotal = calcularSubtotal(cliente.consumos);
  const total = aplicarDescuento(subtotal, cliente.descuento);
  const porcentaje = cliente.descuento * 100;

  return {
    nombre: cliente.nombre,
    subtotal: subtotal,
    descuento: porcentaje,
    total: total
  };
}

let i = 0;

while (i < clientes.length) {
  const cuenta = calcularCuenta(clientes[i]);

  const mensaje =
    cuenta.nombre +
    " | Subtotal: " +
    formatearDinero(cuenta.subtotal) +
    " | Descuento: " +
    cuenta.descuento +
    "% | Total: " +
    formatearDinero(cuenta.total);

  console.log(mensaje);

  i++;
}