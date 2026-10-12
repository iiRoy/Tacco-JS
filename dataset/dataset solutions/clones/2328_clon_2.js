const personas = [
  { cliente: "Ana", productos: [120, 80, 50], rebaja: 0.10 },
  { cliente: "Luis", productos: [200, 150], rebaja: 0.15 },
  { cliente: "Marta", productos: [90, 60, 40], rebaja: 0.05 }
];

function obtenerSubtotal(productos) {
  let suma = 0;

  for (let indice = 0; indice < productos.length; indice++) {
    suma += productos[indice];
  }

  return suma;
}

function descontar(suma, rebaja) {
  return suma - suma * rebaja;
}

function obtenerCuenta(persona) {
  const suma = obtenerSubtotal(persona.productos);
  const totalFinal = descontar(suma, persona.rebaja);

  return {
    cliente: persona.cliente,
    suma: suma,
    rebaja: persona.rebaja,
    totalFinal: totalFinal
  };
}

for (let indice = 0; indice < personas.length; indice++) {
  const factura = obtenerCuenta(personas[indice]);

  console.log(
    factura.cliente +
      " | Subtotal: $" +
      factura.suma.toFixed(2) +
      " | Descuento: " +
      factura.rebaja * 100 +
      "% | Total: $" +
      factura.totalFinal.toFixed(2)
  );
}