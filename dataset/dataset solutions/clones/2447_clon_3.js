function sumarN(n, numeros) {
  if (!Number.isInteger(n) || n < 0) {
    return null;
  }

  const cantidadReal = Math.min(
    n,
    numeros.length
  );

  function acumular(posicion, resultado) {
    if (posicion >= cantidadReal) {
      return resultado;
    }

    const valorActual = numeros[posicion];
    const nuevoResultado =
      resultado + valorActual;

    return acumular(
      posicion + 1,
      nuevoResultado
    );
  }

  return acumular(0, 0);
}