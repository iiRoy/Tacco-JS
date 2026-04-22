function processor() {
  const parseNum = Number;

  const extractNumericMatrix = (sourceLines, rowCount) =>
    Array.from({ length: rowCount }, () =>
      sourceLines.shift().split(/ +/).map(parseNum)
    );

  const rotateBlockClockwise = (initialBlock) => {
    const dimension = initialBlock.length;
    return Array.from({ length: dimension }, (_, newRowIndex) =>
      Array.from({ length: dimension }, (_, newColIndex) =>
        initialBlock[dimension - 1 - newColIndex][newRowIndex]
      )
    );
  };

  const createAllOrientations = (baseBlock, rotatorFunction) =>
    Array.from({ length: 4 }).reduce((accumulator, _, index) => {
      accumulator.push(index === 0 ? baseBlock : rotatorFunction(accumulator[index - 1]));
      return accumulator;
    }, []);

  const evaluatePlacement = (mainCanvas, currentPattern, canvasRowShift, canvasColShift) => {
    let firstFoundCol = 0;
    let firstFoundRow = 0;

    const isPerfectMatch = currentPattern.every((patternRowValues, patternRowIndex) =>
      patternRowValues.every((patternValue, patternColIndex) => {
        if (patternValue === -1) return true; // Wildcard bypass
        
        const canvasValue = mainCanvas[canvasRowShift + patternRowIndex][canvasColShift + patternColIndex];
        if (canvasValue !== patternValue) return false; // Mismatch

        if (firstFoundCol === 0 && firstFoundRow === 0) {
          firstFoundCol = canvasColShift + patternColIndex + 1;
          firstFoundRow = canvasRowShift + patternRowIndex + 1;
        }
        return true;
      })
    );
    return isPerfectMatch ? { matchPresent: true, initialCol: firstFoundCol, initialRow: firstFoundRow } : { matchPresent: false };
  };

  const generateAllSearchCoordinates = (canvasDimension, patternDimension) =>
    Array.from({ length: canvasDimension - patternDimension + 1 }, (_, rIdx) => rIdx)
      .flatMap(rIdx =>
        Array.from({ length: canvasDimension - patternDimension + 1 }, (_, cIdx) => cIdx)
          .flatMap(cIdx =>
            Array.from({ length: 4 }, (_, oIdx) => ({ r: rIdx, c: cIdx, o: oIdx }))
          )
      );

  let currentInputLines = rawDataStore.slice();

  while (true) {
    const dimensionLine = currentInputLines.shift().split(/\s+/).map(parseNum);
    const canvasDimension = dimensionLine[0];
    const patternDimension = dimensionLine[1];

    if (canvasDimension === 0 && patternDimension === 0) break;

    const mainCanvas = extractNumericMatrix(currentInputLines, canvasDimension);
    const basePattern = extractNumericMatrix(currentInputLines, patternDimension);
    const allPatternOrientations = createAllOrientations(basePattern, rotateBlockClockwise);

    const searchSpace = generateAllSearchCoordinates(canvasDimension, patternDimension);
    const initialBestLocation = { initialCol: 99999999, initialRow: 99999999 };

    const finalBestMatch = searchSpace.reduce((currentOptimal, currentAttempt) => {
      const activePattern = allPatternOrientations[currentAttempt.o];
      const resultOfPlacement = evaluatePlacement(mainCanvas, activePattern, currentAttempt.r, currentAttempt.c);

      if (resultOfPlacement.matchPresent) {
        const { initialCol, initialRow } = resultOfPlacement;
        if (initialRow < currentOptimal.initialRow || (initialRow === currentOptimal.initialRow && initialCol < currentOptimal.initialCol)) {
          return { initialRow: initialRow, initialCol: initialCol };
        }
      }
      return currentOptimal;
    }, initialBestLocation);

    if (finalBestMatch.initialCol !== 99999999 && finalBestMatch.initialRow !== 99999999) {
      console.log(finalBestMatch.initialCol + ' ' + finalBestMatch.initialRow);
    } else {
      console.log('NA');
    }
  }
}

let inputBuffer = '';
let rawDataStore;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  inputBuffer += dataChunk;
});
process.stdin.on('end', function() {
  rawDataStore = inputBuffer.split('\n');
  processor();
});