const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const processedNumericValues = rawInputContent
  .split(/\s+/)
  .filter(Boolean)
  .map(Number);

let currentReadOffset = 0;
const coordinateGroupSize = 8;

while (true) {
  if (currentReadOffset + coordinateGroupSize > processedNumericValues.length) {
    break;
  }

  const [
    firstRectX1, firstRectY1, firstRectX2, firstRectY2,
    secondRectX1, secondRectY1, secondRectX2, secondRectY2
  ] = processedNumericValues.slice(currentReadOffset, currentReadOffset + coordinateGroupSize);

  // The original loop terminates if the 8th value (secondRectY2) is falsy (0 or NaN).
  if (!secondRectY2) {
    break;
  }

  const intersectionResult = (firstRectX1 <= secondRectX2) &&
                             (secondRectX1 <= firstRectX2) &&
                             (firstRectY1 <= secondRectY2) &&
                             (secondRectY1 <= firstRectY2);

  console.log(intersectionResult ? 'YES' : 'NO');

  currentReadOffset += coordinateGroupSize;
}
