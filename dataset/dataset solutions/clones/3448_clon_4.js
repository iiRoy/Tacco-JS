function sinDuplicadosConSemilla(lista, resultado) {
  const valoresConocidos = new Set(resultado);
  let posicion = 0;

  while (posicion < lista.length) {
    const elemento = lista[posicion];

    if (!valoresConocidos.has(elemento)) {
      valoresConocidos.add(elemento);
      resultado.push(elemento);
    }

    posicion += 1;
  }

  return resultado;
}