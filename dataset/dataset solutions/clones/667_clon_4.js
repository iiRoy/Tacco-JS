const someInputLines = [];
const rL = require('readline');
const iF = rL.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

iF.on('line', (lineContent) => {
  someInputLines.push(lineContent);
});

iF.on('close', () => {
  const resultingCollections = [];
  let cursorPosition = 0;

  const extractAndCompute = (lineCursor) => {
    if (lineCursor >= someInputLines.length) {
      return;
    }

    const mainIdentifier = Number.parseInt(someInputLines[lineCursor], 10);

    if (Number.isNaN(mainIdentifier) || mainIdentifier === 0) {
      return;
    }

    const segmentsRequired = Math.floor(mainIdentifier / 4);
    const nextCursor = lineCursor + 1 + segmentsRequired;

    if (nextCursor > someInputLines.length) {
      return;
    }

    const dataSegments = someInputLines.slice(lineCursor + 1, nextCursor);
    const numericalSegments = dataSegments.map(segment => Number.parseInt(segment, 10));

    const currentBlockSummation = numericalSegments.reduce((total, num) => total + num, 0);

    resultingCollections.push(currentBlockSummation);

    extractAndCompute(nextCursor);
  };

  extractAndCompute(cursorPosition);

  resultingCollections.forEach(outcome => {
    console.log(outcome);
  });
});