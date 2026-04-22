function processInputData(rawDataString) {
  const dataSegments = rawDataString.match(/[^\n]+/g) || [];
  const effectiveSegments = dataSegments.slice(1);

  const uniqueStorage = new Set();
  const finalSelection = [];

  for (let k = 0; k < effectiveSegments.length; k++) {
    const currentPiece = effectiveSegments[k];
    if (!uniqueStorage.has(currentPiece)) {
      uniqueStorage.add(currentPiece);
      finalSelection.push(currentPiece);
    }
  }
}