function processInputForTriangles(rawData) {
  const upperBound = 1000;

  const inputLines = splitInputIntoLines(rawData, "\n");
  const parsedVertexData = inputLines.map(parseLineToVertexArray);

  const defaultTriangleConstraints = {
    min: 1,
    max: upperBound
  };

  // The original code had a check `if(i === 0) { if(line[0] > max) { break; } }`
  // This means if the first vertex of the first line exceeds 'max', the loop breaks immediately.
  // We replicate this behavior as an early exit.
  if (parsedVertexData.length > 0 && parsedVertexData[0].length > 0) {
    // The original comparison `line[0] > max` implicitly converts string to number.
    // E.g., "1001" > 1000 is true. "999" > 1000 is false. "abc" > 1000 is false.
    // We preserve this exact comparison behavior.
    if (parsedVertexData[0][0] > upperBound) {
      return;
    }
  }

  for (let i = 0; i < parsedVertexData.length; i++) {
    const currentVertexSet = parsedVertexData[i];

    const triangleInstance = new RightAngleTriangleChecker({
      boundaryConditions: defaultTriangleConstraints,
      sideLengths: {
        a: currentVertexSet[0],
        b: currentVertexSet[1],
        c: currentVertexSet[2]
      }
    });

    if (triangleInstance.areSidesValid()) {
      const isRightAngled = triangleInstance.isRightAngled();
      const outputStatus = isRightAngled ? 'YES' : 'NO';
      console.log(outputStatus);
    }
  }
}

function splitInputIntoLines(rawData, lineSeparator) {
  return rawData.split(lineSeparator);
}

function parseLineToVertexArray(inputLineString) {
  const vertexComponents = inputLineString.split(' ');
  return vertexComponents;
}

function RightAngleTriangleChecker(configOptions) {
  this.boundaryConditions = configOptions.boundaryConditions || { min: 1, max: 1000 };
  this.sideLengths = {};

  const assignSideValue = (value) => {
    // Original code implicitly converts string to number for comparison in vertexIsWithinConstraints.
    // E.g., "3" becomes 3. "abc" becomes NaN.
    // We explicitly convert to Number and handle NaN for clarity and robustness.
    const numericValue = Number(value);
    return this.checkSideValueConstraints(numericValue) ? numericValue : null;
  };

  this.sideLengths.a = assignSideValue(configOptions.sideLengths.a);
  this.sideLengths.b = assignSideValue(configOptions.sideLengths.b);
  this.sideLengths.c = assignSideValue(configOptions.sideLengths.c);
}

RightAngleTriangleChecker.prototype.checkSideValueConstraints = function(sideValue) {
  if (isNaN(sideValue)) {
    return false;
  }
  return (sideValue >= this.boundaryConditions.min && sideValue <= this.boundaryConditions.max);
}

RightAngleTriangleChecker.prototype.areSidesValid = function() {
  // Original: return (this.vertices.a && this.vertices.b && this.vertices.c);
  // Since assignSideValue sets to null for invalid, checking for non-null is equivalent.
  return (this.sideLengths.a !== null && this.sideLengths.b !== null && this.sideLengths.c !== null);
}

RightAngleTriangleChecker.prototype.isRightAngled = function() {
  let isRightAngleResult = false;

  // The original code had `if(this.isValid)`. `this.isValid` is a function reference, which is truthy.
  // However, `isRightAngled` is only called after `areSidesValid()` (original `isValid()`) returns true
  // in the `processInputForTriangles` function.
  // Changing it to `if(this.areSidesValid())` makes the method internally consistent and robust
  // without changing the observable behavior of the overall program.
  if (this.areSidesValid()) {
    const sidesForSorting = [this.sideLengths.a, this.sideLengths.b, this.sideLengths.c];

    sidesForSorting.sort((a, b) => a - b);

    const squaredSides = sidesForSorting.map(side => Math.pow(side, 2));

    const sumOfSmallerSquares = squaredSides[0] + squaredSides[1];

    isRightAngleResult = (squaredSides[2] === sumOfSmallerSquares);
  }

  return isRightAngleResult;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
processInputForTriangles(rawInputData);
