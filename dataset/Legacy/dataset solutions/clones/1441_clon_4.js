const fileSystem = require('fs');

const DEGREE_TO_RADIAN_CONVERSION_FACTOR = Math.PI / 180;

const calculateSineFromDegrees = (angleInDegrees) =>
  Math.sin(angleInDegrees * DEGREE_TO_RADIAN_CONVERSION_FACTOR);

const calculateCosineFromDegrees = (angleInDegrees) =>
  Math.cos(angleInDegrees * DEGREE_TO_RADIAN_CONVERSION_FACTOR);

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const [firstSide, secondSide, includedAngleDegrees] = rawInputData.split(/\s+/).map(Number);

const triangleHeight = secondSide * calculateSineFromDegrees(includedAngleDegrees);
const triangleSurfaceArea = 0.5 * firstSide * secondSide * calculateSineFromDegrees(includedAngleDegrees);

const thirdSideSquaredValue =
  (firstSide * firstSide) +
  (secondSide * secondSide) -
  (2 * firstSide * secondSide * calculateCosineFromDegrees(includedAngleDegrees));

const thirdSideLength = Math.sqrt(thirdSideSquaredValue);

console.log(triangleSurfaceArea.toFixed(5));
console.log((firstSide + secondSide + thirdSideLength).toFixed(5));
console.log(triangleHeight.toFixed(5));
