function sumaHasta(n) {
  const entradaValida =
    Number.isInteger(n) &&
    n >= 0;

  if (!entradaValida) {
    return null;
  }

  return n * (n + 1) / 2;
}