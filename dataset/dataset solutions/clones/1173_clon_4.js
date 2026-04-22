const PI_CONSTANT_VALUE = Math.PI;
const DEGREES_TO_RADIANS_MULTIPLIER = PI_CONSTANT_VALUE / 180;
const HALF_FACTOR = 0.5;
const DOUBLE_FACTOR = 2.0;

const stringToNumberConverter = (inputStringSegment) => {
  return Number(inputStringSegment);
};

const sineCalculator = (valueInRadians) => Math.sin(valueInRadians);
const cosineCalculator = (valueInRadians) => Math.cos(valueInRadians);
const squareRootFinder = (value) => Math.sqrt(value);

const calculateGeometricMeasures = (dimensionA, dimensionB, angleInDegrees) => {
  const angleInRadians = angleInDegrees * DEGREES_TO_RADIANS_MULTIPLIER;

  const calculatedArea = HALF_FACTOR * dimensionA * dimensionB * sineCalculator(angleInRadians);

  const thirdSideSquared = (
    (dimensionA * dimensionA) +
    (dimensionB * dimensionB) -
    (DOUBLE_FACTOR * dimensionA * dimensionB * cosineCalculator(angleInRadians))
  );
  const calculatedThirdSide = squareRootFinder(thirdSideSquared);

  const calculatedPerimeter = dimensionA + dimensionB + calculatedThirdSide;

  const calculatedHeight = DOUBLE_FACTOR * calculatedArea / dimensionA;

  return {
    surfaceArea: calculatedArea,
    enclosingLength: calculatedPerimeter,
    perpendicularDistance: calculatedHeight
  };
};

const outputResult = (valueToDisplay) => {
  console.log(valueToDisplay);
};

const inputHandler = (dataBuffer) => {
  const inputLine = dataBuffer.toString().trim();
  const inputFragments = inputLine.split(/\s+/);

  const firstDimension = stringToNumberConverter(inputFragments[0]);
  const secondDimension = stringToNumberConverter(inputFragments[1]);
  const includedAngleDegrees = stringToNumberConverter(inputFragments[2]);

  const geometricMeasurements = calculateGeometricMeasures(
    firstDimension,
    secondDimension,
    includedAngleDegrees
  );

  outputResult(geometricMeasurements.surfaceArea);
  outputResult(geometricMeasurements.enclosingLength);
  outputResult(geometricMeasurements.perpendicularDistance);
};

process.stdin.on('data', inputHandler);
process.stdin.setEncoding('utf8');
process.stdin.resume();