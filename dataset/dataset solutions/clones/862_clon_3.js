logOutput = console.log;
inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");
inputLines.length--; // Strictly preserving the original behavior here

Object.prototype.dbgTrace = function() {
  logOutput(this + "");
  return this;
};

// Helper function for parsing integers
function parseInteger(inputString) {
  return +inputString;
}

String.prototype.toIntArray = function(delimiter) {
  const parts = this.split(delimiter || " ");
  return parts.map(parseInteger);
};

const arrayPrototype = Array.prototype;

arrayPrototype.dbgTrace = function() {
  logOutput(this);
  return this;
};

arrayPrototype.findMax = function() {
  return Math.max.apply(null, this);
};

arrayPrototype.findMin = function() {
  return Math.min.apply(null, this);
};

function identityFunction(value) {
  return value;
}
arrayPrototype.createCopy = function() {
  return this.map(identityFunction);
};

arrayPrototype.rotateElements = function(shiftCount) {
  const currentLength = this.length;
  if (currentLength === 0) return [];
  const normalizedShift = shiftCount % currentLength;
  if (normalizedShift === 0) return this.createCopy();

  const firstSegment = this.slice(normalizedShift, currentLength);
  const secondSegment = this.slice(0, normalizedShift);
  return firstSegment.concat(secondSegment);
};

arrayPrototype.generatePermutations = function() {
  const sourceArray = this;
  const sourceLength = sourceArray.length;

  if (sourceLength === 0) return [];
  if (sourceLength === 1) return [sourceArray];

  let allPermutations = [];
  for (let index = 0; index < sourceLength; ++index) {
    const currentItem = sourceArray[index];
    const remainingItems = sourceArray
      .slice(0, index)
      .concat(sourceArray.slice(index + 1, sourceLength));

    const subPerms = remainingItems.generatePermutations();

    const mappedSubPerms = subPerms.map(function(permutationPart) {
      return permutationPart.concat(currentItem);
    });
    allPermutations = allPermutations.concat(mappedSubPerms);
  }
  return allPermutations;
};

arrayPrototype.flattenOneLevel = function() {
  let flatResult = [];
  for (let index = 0; index < this.length; ++index) {
    flatResult = flatResult.concat(this[index]);
  }
  return flatResult;
};

arrayPrototype.removeDuplicates = function() {
  const selfReference = this;
  return this.filter(function(elementValue, elementIndex) {
    return selfReference.slice(elementIndex + 1).indexOf(elementValue) < 0;
  });
};

function generateIntegerRange(count, startValue, stepIncrement) {
  startValue = startValue || 0;
  stepIncrement = stepIncrement || 1;
  let rangeArray = [];
  let currentNumber = startValue;
  for (let i = 0; i < count; ++i) {
    rangeArray.push(currentNumber);
    currentNumber += stepIncrement;
  }
  return rangeArray;
}

function addValues(val1, val2) {
  return val1 + val2;
}

function subtractValues(val1, val2) {
  return val1 - val2;
}

function reverseSubtractValues(val1, val2) {
  return val2 - val1;
}

// Main execution logic wrapped in an Immediately Invoked Function Expression (IIFE)
(function executeMainProgram() {
  const totalGridSize = parseInteger(inputLines[0]);
  const firstPairCoords = inputLines[1].toIntArray();
  const firstPointX = firstPairCoords[0] - 1;
  const firstPointY = firstPairCoords[1] - 1;

  const secondPairCoords = inputLines[2].toIntArray();
  const secondPointX = secondPairCoords[0] - 1;
  const secondPointY = secondPairCoords[1] - 1;

  let overallMinimumDistance = totalGridSize * totalGridSize; // Initialize with a sufficiently large value

  // Helper function to compute Manhattan distance between two 1D-mapped points on a grid
  function calculateGridManhattanDistance(pointOneIndex, pointTwoIndex, currentGridWidth) {
    const pointOneRow = Math.floor(pointOneIndex / currentGridWidth);
    const pointOneCol = pointOneIndex % currentGridWidth;

    const pointTwoRow = Math.floor(pointTwoIndex / currentGridWidth);
    const pointTwoCol = pointTwoIndex % currentGridWidth;

    const rowDifference = Math.abs(pointOneRow - pointTwoRow);
    const colDifference = Math.abs(pointOneCol - pointTwoCol);

    return rowDifference + colDifference;
  }

  // Iterate through all possible grid widths (from 1 up to totalGridSize - 1)
  for (let currentDivisor = 1; currentDivisor < totalGridSize; ++currentDivisor) {
    const distanceForAB = calculateGridManhattanDistance(firstPointX, firstPointY, currentDivisor);
    const distanceForCD = calculateGridManhattanDistance(secondPointX, secondPointY, currentDivisor);

    const combinedDistance = distanceForAB + distanceForCD;

    // Update the overall minimum distance found so far
    overallMinimumDistance = Math.min(overallMinimumDistance, combinedDistance);
  }

  logOutput(overallMinimumDistance);
})();

// vim: set ft=javascript:
