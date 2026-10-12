function isRightTriangle(sideA, sideB, hypotenuse) {
  const squareA = Math.pow(sideA, 2);
  const squareB = Math.pow(sideB, 2);
  const squareC = Math.pow(hypotenuse, 2);
  return squareA + squareB === squareC;
}

function isIsosceles(valueOne, valueTwo) {
  return valueOne === valueTwo;
}

function processInputData() {
  let countRightTriangles = 0;
  let countIsosceles = 0;

  const COORDINATE_DELIMITER = ',';

  processedLines.forEach((currentLineString) => {
    const trimmedInputLine = currentLineString.trim();
    if (trimmedInputLine === '') {
      return;
    }

    const parsedNumericValues = trimmedInputLine.split(COORDINATE_DELIMITER).map(parseFloat);

    if (parsedNumericValues.length < 3) {
      return; // Skip lines that don't have enough values for triangle checks
    }

    const firstVal = parsedNumericValues[0];
    const secondVal = parsedNumericValues[1];
    const thirdVal = parsedNumericValues[2];

    if (isRightTriangle(firstVal, secondVal, thirdVal)) {
      countRightTriangles++;
    } else if (isIsosceles(firstVal, secondVal)) {
      countIsosceles++;
    }
  });

  console.log('%d\n%d', countRightTriangles, countIsosceles);
}

let rawDataBuffer = '';
let processedLines;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
  rawDataBuffer += dataChunk;
});

process.stdin.on('end', () => {
  processedLines = rawDataBuffer.split('\n');
  processInputData();
});
