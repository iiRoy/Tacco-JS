function processCipher(sourceData) {
  const shiftValue = Number(sourceData[0]);
  const originalText = sourceData[1];

  const transformedSegments = [];

  for (const currentSymbol of originalText) {
    const initialCode = currentSymbol.charCodeAt(0);

    const relativePosition = initialCode - 65;
    const shiftedPosition = relativePosition + shiftValue;
    const finalModuloPosition = shiftedPosition % 26;

    const finalAsciiCode = finalModuloPosition + 65;

    transformedSegments.push(String.fromCharCode(finalAsciiCode));
  }

  console.log(transformedSegments.join(""));
}

processCipher(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
