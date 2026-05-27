const fileSystemModule = require("fs");

function parseInputLineToNumbers(lineContent) {
  return lineContent.split(' ').map(Number);
}

function computeVectorDotProduct(vectorA, vectorB) {
  return (vectorA.xComponent * vectorB.xComponent) + (vectorA.yComponent * vectorB.yComponent);
}

const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedInputContent = rawInputBuffer.trim();
const inputDataLines = processedInputContent.split('\n');

const FLOATING_POINT_TOLERANCE = 1e-10;

for (const singleInputLine of inputDataLines) {
  const parsedNumericValues = parseInputLineToNumbers(singleInputLine);

  const p1X = parsedNumericValues[0];
  const p1Y = parsedNumericValues[1];
  const p2X = parsedNumericValues[2];
  const p2Y = parsedNumericValues[3];
  const p3X = parsedNumericValues[4];
  const p3Y = parsedNumericValues[5];
  const p4X = parsedNumericValues[6];
  const p4Y = parsedNumericValues[7];

  const vectorOne = {
    xComponent: p2X - p1X,
    yComponent: p2Y - p1Y
  };

  const vectorTwo = {
    xComponent: p4X - p3X,
    yComponent: p4Y - p3Y
  };

  const calculatedDotProduct = computeVectorDotProduct(vectorOne, vectorTwo);

  const isDotProductNearZero = Math.abs(calculatedDotProduct) < FLOATING_POINT_TOLERANCE;

  if (isDotProductNearZero) {
    console.log('NO');
  } else {
    console.log('YES');
  }
}
