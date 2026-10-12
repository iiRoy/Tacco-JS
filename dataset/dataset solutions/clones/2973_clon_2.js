function aparear(primeraColeccion, segundaColeccion) {
  const combinaciones = [];
  const cantidad = Math.min(
    primeraColeccion.length,
    segundaColeccion.length
  );

  for (let indice = 0; indice < cantidad; indice++) {
    combinaciones.push([
      primeraColeccion[indice],
      segundaColeccion[indice]
    ]);
  }

  return combinaciones;
}