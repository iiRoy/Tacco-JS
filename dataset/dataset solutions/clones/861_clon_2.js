let output = console.log;

// Read input from standard input, split by newlines, and remove the last empty line.
let inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");
inputLines.length--;

// Extend Object prototype with a debugging method.
Object.prototype.showValue = function() {
  output(this + "");
  return this;
};

// Extend String prototype to convert a string of space-separated numbers into an array of integers.
String.prototype.toNumbers = function(separatorChar) {
  return this.split(separatorChar || " ").map(parseInteger);
};

// Alias for Array.prototype for brevity in custom array methods.
let arrayProto = Array.prototype;

// Custom array method to display array contents.
arrayProto.displayContents = function() {
  output(this);
  return this;
};

// Custom array method to find the maximum value.
arrayProto.findMaximum = function() {
  return Math.max.apply(null, this);
};

// Custom array method to find the minimum value.
arrayProto.findMinimum = function() {
  return Math.min.apply(null, this);
};

// Custom array method to create a shallow copy of the array.
arrayProto.duplicate = function() {
  return this.map(identityFunction);
};

// Custom array method to perform a circular shift (rotation).
arrayProto.circularShift = function(shiftAmount) {
  return this.slice(shiftAmount, this.length).concat(this.slice(0, shiftAmount));
};

// Custom array method to generate all permutations of the array elements.
arrayProto.generatePermutations = function() {
  if (this.length === 0) {
    return [];
  }
  if (this.length === 1) {
    return [this];
  }

  let resultCombinations = [];
  let originalArray = this;
  let currentIdx = 0;

  for (; currentIdx < originalArray.length; ++currentIdx) {
    resultCombinations = resultCombinations.concat(
      originalArray.slice(0, currentIdx)
        .concat(originalArray.slice(currentIdx + 1, originalArray.length))
        .generatePermutations()
        .map(function(currentPermutation) {
          return currentPermutation.concat(originalArray[currentIdx]);
        })
    );
  }
  return resultCombinations;
};

// Custom array method to flatten a nested array by one level.
arrayProto.unroll = function() {
  let currentResult = [];
  for (let idx = 0; idx < this.length; ++idx) {
    currentResult = currentResult.concat(this[idx]);
  }
  return currentResult;
};

// Custom array method to remove duplicate elements (nub).
arrayProto.removeDuplicates = function() {
  let selfReference = this;
  return this.filter(function(elementValue, elementIndex) {
    return selfReference.slice(elementIndex + 1).indexOf(elementValue) < 0;
  });
};

// Function to create an array of numbers in a sequence.
function createRange(count, startValue, stepValue) {
  startValue = startValue || 0;
  stepValue = stepValue || 1;
  let generatedArray = [];
  for (; count--; startValue += stepValue) {
    generatedArray.push(startValue);
  }
  return generatedArray;
}

// Function to parse a string into an integer.
function parseInteger(inputString) {
  return +inputString;
}

// Function to add two numbers.
function sumValues(valA, valB) {
  return valA + valB;
}

// Function to subtract two numbers (A - B).
function subtractValues(valA, valB) {
  return valA - valB;
}

// Function to subtract two numbers (B - A).
function reverseSubtract(valA, valB) {
  return valB - valA;
}

// Function that returns its input argument unchanged.
function identityFunction(inputArg) {
  return inputArg;
}

// Main execution block for the problem solution.
(function calculateMinimumDistance() {
  // Parse input values for grid dimension and coordinates.
  let gridDimension = +inputLines[0];
  let firstCoords = inputLines[1].toNumbers();
  let firstX = firstCoords[0];
  let firstY = firstCoords[1];
  let secondCoords = inputLines[2].toNumbers();
  let secondX = secondCoords[0];
  let secondY = secondCoords[1];

  // Initialize minimum total distance with a large value.
  let minimumTotalDistance = gridDimension * gridDimension;

  // Helper function to compute Manhattan distance on a transformed grid.
  function computeManhattanDistance(coord1, coord2, divisor) {
    return Math.abs((coord1 % divisor) - (coord2 % divisor)) + Math.abs(Math.floor(coord1 / divisor) - Math.floor(coord2 / divisor));
  }

  // Iterate through possible divisors (grid sizes).
  for (let currentDivisor = 1; currentDivisor < gridDimension; ++currentDivisor) {
    // Calculate the combined Manhattan distance for the two pairs of points.
    let currentCombinedDistance = computeManhattanDistance(firstX, firstY, currentDivisor) + computeManhattanDistance(secondX, secondY, currentDivisor);
    // output(currentDivisor, currentCombinedDistance); // Debugging line, commented out.

    // Update the minimum total distance if a smaller one is found.
    if (minimumTotalDistance > currentCombinedDistance) {
      minimumTotalDistance = currentCombinedDistance;
    }
  }

  // Output the final minimum total distance.
  output(minimumTotalDistance);
})();

// Editor configuration hint.
// vim: set ft=javascript:
