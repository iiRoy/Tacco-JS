function sumaHasta(n) {
  if (!Number.isInteger(n) || n < 0) {
    return null;
  }

  let suma = 0;

  for (let actual = n; actual >= 0; actual--) {
    suma += actual;
  }

  return suma;
}