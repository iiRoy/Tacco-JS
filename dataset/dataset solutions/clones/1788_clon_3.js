function sumaHasta(n) {
  if (!Number.isInteger(n) || n < 0) {
    return null;
  }

  function acumular(numeroActual, resultado) {
    if (numeroActual < 0) {
      return resultado;
    }

    const siguienteNumero =
      numeroActual - 1;

    const nuevoResultado =
      resultado + numeroActual;

    return acumular(
      siguienteNumero,
      nuevoResultado
    );
  }

  return acumular(n, 0);
}