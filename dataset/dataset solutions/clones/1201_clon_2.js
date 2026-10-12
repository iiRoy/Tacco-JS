function mezclar(primera, segunda) {
  const combinada = [];
  let indicePrimero = 0;
  let indiceSegundo = 0;

  while (
    indicePrimero < primera.length &&
    indiceSegundo < segunda.length
  ) {
    if (
      primera[indicePrimero] <=
      segunda[indiceSegundo]
    ) {
      combinada.push(primera[indicePrimero]);
      indicePrimero++;
    } else {
      combinada.push(segunda[indiceSegundo]);
      indiceSegundo++;
    }
  }

  while (indicePrimero < primera.length) {
    combinada.push(primera[indicePrimero]);
    indicePrimero++;
  }

  while (indiceSegundo < segunda.length) {
    combinada.push(segunda[indiceSegundo]);
    indiceSegundo++;
  }

  return combinada;
}