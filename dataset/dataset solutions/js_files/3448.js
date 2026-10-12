function sinDuplicadosConSemilla(lista, resultado) {
  function acumular(posicion) {
    if (posicion >= lista.length) {
      return resultado;
    }

    const elemento = lista[posicion];

    if (!resultado.includes(elemento)) {
      resultado.push(elemento);
    }

    return acumular(posicion + 1);
  }

  return acumular(0);
}