const LOWER_LIMIT = 1;
const UPPER_LIMIT = 1000;

const isSideValid = (sideValue, lower, upper) =>
  sideValue >= lower && sideValue <= upper;

const createShape = (sideMeasures) => {
  const firstMeasure = isSideValid(sideMeasures[0], LOWER_LIMIT, UPPER_LIMIT) ? sideMeasures[0] : null;
  const secondMeasure = isSideValid(sideMeasures[1], LOWER_LIMIT, UPPER_LIMIT) ? sideMeasures[1] : null;
  const thirdMeasure = isSideValid(sideMeasures[2], LOWER_LIMIT, UPPER_LIMIT) ? sideMeasures[2] : null;

  if (firstMeasure !== null && secondMeasure !== null && thirdMeasure !== null) {
    return { m1: firstMeasure, m2: secondMeasure, m3: thirdMeasure };
  }
  return null;
};

const testForRightAngle = (shapeObj) => {
  const orderedMeasures = [shapeObj.m1, shapeObj.m2, shapeObj.m3].sort((x, y) => x - y);
  const squaredMeasures = orderedMeasures.map(val => Math.pow(val, 2));
  return squaredMeasures[0] + squaredMeasures[1] === squaredMeasures[2];
};

const processGeometricData = (rawData) => {
  const rawLines = rawData.split('\n');
  const numericLines = [];

  for (let i = 0; i < rawLines.length; i++) {
    const parts = rawLines[i].split(' ').map(Number);
    // Mimics the original's specific early exit condition for the very first line's first value
    if (i === 0 && parts.length >= 1 && parts[0] > UPPER_LIMIT) {
      return; // Stop all processing
    }
    numericLines.push(parts);
  }

  numericLines.forEach(sideSet => {
    const formedShape = createShape(sideSet);
    if (formedShape) { // Only proceed if all side measures are valid and within constraints
      const isRight = testForRightAngle(formedShape);
      console.log(isRight ? 'YES' : 'NO');
    }
  });
};

const geometryInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
processGeometricData(geometryInput);