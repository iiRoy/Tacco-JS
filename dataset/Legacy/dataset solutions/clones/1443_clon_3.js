function processInput(inputLines) {
  const parseFirstLine = (lineContent) => {
    return lineContent.split(/\s+/).map(parseFloat);
  };

  const parsedNumbers = parseFirstLine(inputLines[0]);

  const sideA = parsedNumbers[0];
  const sideB = parsedNumbers[1];
  const angleDegrees = parsedNumbers[2];

  const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;
  const angleRadians = angleDegrees * DEGREES_TO_RADIANS_FACTOR;

  const aSquared = sideA * sideA;
  const bSquared = sideB * sideB;
  const twoABProduct = 2 * sideA * sideB;
  const cosAngle = Math.cos(angleRadians);
  const cSquaredSubtractionTerm = twoABProduct * cosAngle;
  const cSquaredIntermediate = aSquared + bSquared - cSquaredSubtractionTerm;
  const sideC = Math.sqrt(cSquaredIntermediate);

  const sinAngle = Math.sin(angleRadians);
  const areaNumerator = sideA * sideB * sinAngle;
  const triangleArea = areaNumerator / 2.0;

  const trianglePerimeter = sideA + sideB + sideC;

  const doubleArea = 2 * triangleArea;
  const heightVal = doubleArea / sideA;

  const formatToSixDecimals = (value) => value.toFixed(6);

  const outputParts = [
    formatToSixDecimals(triangleArea),
    formatToSixDecimals(trianglePerimeter),
    formatToSixDecimals(heightVal),
  ];

  console.log(outputParts.join(' '));
}

const dataChunks = [];
process.stdin.on('data', function(inputChunk) {
  dataChunks.push(inputChunk);
});
process.stdin.on('end', function() {
  const inputLines = dataChunks.join('').split('\n');
  processInput(inputLines);
});
