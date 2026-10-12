function aparear(unaLista, otra) {
  const cantidadDePares = Math.min(
    unaLista.length,
    otra.length
  );

  function construirPares(posicion) {
    if (posicion === cantidadDePares) {
      return [];
    }

    const parejaActual = [
      unaLista[posicion],
      otra[posicion]
    ];

    const parejasRestantes = construirPares(
      posicion + 1
    );

    return [
      parejaActual,
      ...parejasRestantes
    ];
  }

  return construirPares(0);
}