function mezclar(lista, otra) {
  const todosLosElementos = lista.concat(otra);

  todosLosElementos.sort(
    (primerValor, segundoValor) =>
      primerValor - segundoValor
  );

  return todosLosElementos;
}