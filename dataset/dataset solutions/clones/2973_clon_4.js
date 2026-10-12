function aparear(unaLista, otra) {
  const longitudFinal = Math.min(
    unaLista.length,
    otra.length
  );

  return Array.from(
    {
      length: longitudFinal
    },
    (_, indice) => [
      unaLista[indice],
      otra[indice]
    ]
  );
}