function sumarN(n, numeros) {
  if (!Number.isInteger(n) || n < 0) {
    return null;
  }

  const limite = Math.min(
    n,
    numeros.length
  );

  let suma = 0;

  for (let posicion = 0; posicion < limite; posicion++) {
    suma += numeros[posicion];
  }

  return suma;
}