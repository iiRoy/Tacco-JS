const ventas = [
  ["Ana", 0.10, 120, 80, 50],
  ["Luis", 0.15, 200, 150],
  ["Marta", 0.05, 90, 60, 40]
];

const salida = ventas.map(registro => {
  const nombre = registro[0];
  const descuento = registro[1];
  const precios = registro.slice(2);

  const subtotal = precios.reduce((acumulado, precio) => acumulado + precio, 0);
  const total = subtotal * (1 - descuento);

  return `${nombre} | Subtotal: $${subtotal.toFixed(2)} | Descuento: ${descuento * 100}% | Total: $${total.toFixed(2)}`;
});

console.log(salida.join("\n"));