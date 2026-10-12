function sinDuplicadosConSemilla(valores, semilla) {
  function procesar(indice) {
    if (indice >= valores.length) {
      return semilla;
    }

    const valorActual = valores[indice];

    if (!semilla.includes(valorActual)) {
      semilla.push(valorActual);
    }

    return procesar(indice + 1);
  }

  return procesar(0);
}