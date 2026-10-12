function mezclar(lista, otra) {
  function combinarDesde(indiceLista, indiceOtra) {
    const terminoLista =
      indiceLista >= lista.length;

    const terminoOtra =
      indiceOtra >= otra.length;

    if (terminoLista) {
      return otra.slice(indiceOtra);
    }

    if (terminoOtra) {
      return lista.slice(indiceLista);
    }

    const valorLista = lista[indiceLista];
    const valorOtra = otra[indiceOtra];

    if (valorLista <= valorOtra) {
      const elementosRestantes = combinarDesde(
        indiceLista + 1,
        indiceOtra
      );

      return [
        valorLista,
        ...elementosRestantes
      ];
    }

    const elementosRestantes = combinarDesde(
      indiceLista,
      indiceOtra + 1
    );

    return [
      valorOtra,
      ...elementosRestantes
    ];
  }

  return combinarDesde(0, 0);
}