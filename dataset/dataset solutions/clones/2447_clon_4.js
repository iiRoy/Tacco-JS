function sumarN(n, numeros) {
  const entradaValida =
    Number.isInteger(n) &&
    n >= 0;

  if (!entradaValida) {
    return null;
  }

  return numeros
    .slice(0, n)
    .reduce(
      (acumulado, valor) =>
        acumulado + valor,
      0
    );
}