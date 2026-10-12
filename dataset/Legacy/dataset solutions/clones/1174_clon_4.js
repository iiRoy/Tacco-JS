const fileSystemModule = require('fs');

(function() {
  const inputPath = '/dev/stdin';
  const rawInputData = fileSystemModule.readFileSync(inputPath).toString();
  
  const numericalComponents = rawInputData.split(' ').map(val => Number(val));

  const firstSide = numericalComponents[0];
  const secondSide = numericalComponents[1];
  const includedAngleDegrees = numericalComponents[2];

  const radiansConversionFactor = Math.PI / 180;
  const includedAngleRadians = includedAngleDegrees * radiansConversionFactor;

  const cosineOfAngle = Math.cos(includedAngleRadians);
  const sineOfAngle = Math.sin(includedAngleRadians);

  // Calculate the third side using the Law of Cosines
  const thirdSideSquared = firstSide * firstSide + secondSide * secondSide - 2 * firstSide * secondSide * cosineOfAngle;
  const thirdSide = Math.sqrt(thirdSideSquared);

  // Calculate the area using the formula 0.5 * a * b * sin(C)
  const calculatedArea = 0.5 * firstSide * secondSide * sineOfAngle;

  // Calculate the perimeter
  const calculatedPerimeter = firstSide + secondSide + thirdSide;

  // Calculate the height relative to the firstSide as base, derived from area
  const calculatedHeight = (2 * calculatedArea) / firstSide;

  console.log(calculatedArea + '\n' + calculatedPerimeter + '\n' + calculatedHeight);
})();
