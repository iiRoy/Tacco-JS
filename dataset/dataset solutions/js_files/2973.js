function aparear(unaLista, otra) {
  const pares = [];
  const limite = Math.min(
    unaLista.length,
    otra.length
  );

  for (let posicion = 0; posicion < limite; posicion++) {
    pares.push([
      unaLista[posicion],
      otra[posicion]
    ]);
  }

  return pares;
}