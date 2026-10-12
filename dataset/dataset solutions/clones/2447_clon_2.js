function sumarN(cantidad, valores) {
  if (!Number.isInteger(cantidad) || cantidad < 0) {
    return null;
  }

  const elementosDisponibles = Math.min(
    cantidad,
    valores.length
  );

  let total = 0;

  for (
    let indice = 0;
    indice < elementosDisponibles;
    indice++
  ) {
    total += valores[indice];
  }

  return total;
}