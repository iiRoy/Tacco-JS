function sonIguales(primerValor, segundoValor) {
  const ambosSonNaN =
    primerValor !== primerValor &&
    segundoValor !== segundoValor;

  return (
    primerValor === segundoValor ||
    ambosSonNaN
  );
}

function contieneValor(
  valores,
  buscado,
  posicion
) {
  if (posicion >= valores.length) {
    return false;
  }

  if (sonIguales(valores[posicion], buscado)) {
    return true;
  }

  return contieneValor(
    valores,
    buscado,
    posicion + 1
  );
}

function agregarValoresUnicos(
  origen,
  destino,
  posicion
) {
  if (posicion === origen.length) {
    return destino;
  }

  const candidato = origen[posicion];

  const repetido = contieneValor(
    destino,
    candidato,
    0
  );

  if (!repetido) {
    destino[destino.length] = candidato;
  }

  return agregarValoresUnicos(
    origen,
    destino,
    posicion + 1
  );
}

function sinDuplicadosConSemilla(lista, resultado) {
  return agregarValoresUnicos(
    lista,
    resultado,
    0
  );
}