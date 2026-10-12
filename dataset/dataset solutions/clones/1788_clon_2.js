function sumaHasta(limite) {
  if (!Number.isInteger(limite) || limite < 0) {
    return null;
  }

  let total = 0;

  for (let valor = limite; valor >= 0; valor--) {
    total += valor;
  }

  return total;
}