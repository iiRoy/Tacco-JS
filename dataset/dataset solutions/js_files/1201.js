function mezclar(lista, otra) {
  const resultado = [];
  let posicionLista = 0;
  let posicionOtra = 0;

  while (
    posicionLista < lista.length &&
    posicionOtra < otra.length
  ) {
    if (
      lista[posicionLista] <=
      otra[posicionOtra]
    ) {
      resultado.push(lista[posicionLista]);
      posicionLista++;
    } else {
      resultado.push(otra[posicionOtra]);
      posicionOtra++;
    }
  }

  while (posicionLista < lista.length) {
    resultado.push(lista[posicionLista]);
    posicionLista++;
  }

  while (posicionOtra < otra.length) {
    resultado.push(otra[posicionOtra]);
    posicionOtra++;
  }

  return resultado;
}