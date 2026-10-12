const logOutput = console.log;
const inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");
inputLines.pop(); // Remove the last empty line if present

Object.prototype.dbgLog = function() {
  logOutput(this.toString());
  return this;
};

function parseInteger(strValue) {
  return parseInt(strValue, 10);
}

String.prototype.parseNumbers = function(separator) {
  return this.split(separator || " ").map(parseInteger);
};

const arrayProto = Array.prototype;

arrayProto.dbgLog = function() {
  logOutput(this);
  return this;
};

arrayProto.findMax = function() {
  return Math.max(...this);
};

arrayProto.findMin = function() {
  return Math.min(...this);
};

arrayProto.shallowCopy = function() {
  return this.map(identityFunction);
};

arrayProto.circularShift = function(shiftAmount) {
  const currentLength = this.length;
  return this.slice(shiftAmount, currentLength).concat(this.slice(0, shiftAmount));
};

arrayProto.generatePermutations = function() {
  const currentArray = this;
  if (currentArray.length === 0) return [];
  if (currentArray.length === 1) return [currentArray];

  let resultPermutations = [];
  for (let idx = 0; idx < currentArray.length; ++idx) {
    const elementToFix = currentArray[idx];
    const remainingElements = currentArray.slice(0, idx).concat(currentArray.slice(idx + 1, currentArray.length));
    const subPermutations = remainingElements.generatePermutations();
    const mappedSubPermutations = subPermutations.map(function(p) {
      return p.concat(elementToFix);
    });
    resultPermutations = resultPermutations.concat(mappedSubPermutations);
  }
  return resultPermutations;
};

arrayProto.unroll = function() {
  return this.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
};

arrayProto.uniqueElements = function() {
  const sourceArray = this;
  return sourceArray.filter(function(element, index) {
    return sourceArray.slice(index + 1).indexOf(element) < 0;
  });
};

function createRange(count, startVal = 0, stepVal = 1) {
  return Array.from({
    length: count
  }, (_, index) => startVal + index * stepVal);
}

function sumValues(valA, valB) {
  return valA + valB;
}

function subtractValues(valA, valB) {
  return valA - valB;
}

function reverseSubtract(valA, valB) {
  return valB - valA;
}

function identityFunction(value) {
  return value;
}

(function executeMainLogic() {
  const gridSize = parseInteger(inputLines[0]);

  const coordsAB = inputLines[1].parseNumbers();
  const coordA1 = coordsAB[0];
  const coordA2 = coordsAB[1];

  const coordsCD = inputLines[2].parseNumbers();
  const coordB1 = coordsCD[0];
  const coordB2 = coordsCD[1];

  let minimumDistance = gridSize * gridSize;

  const calculateManhattanDistance = (value1, value2, divisor) => {
    const remainderDifference = Math.abs((value1 % divisor) - (value2 % divisor));
    const quotientDifference = Math.abs(Math.floor(value1 / divisor) - Math.floor(value2 / divisor));
    return remainderDifference + quotientDifference;
  };

  for (let divisorValue = 1; divisorValue < gridSize; ++divisorValue) {
    const distanceForA = calculateManhattanDistance(coordA1, coordA2, divisorValue);
    const distanceForB = calculateManhattanDistance(coordB1, coordB2, divisorValue);
    const currentTotalDistance = distanceForA + distanceForB;

    if (currentTotalDistance < minimumDistance) {
      minimumDistance = currentTotalDistance;
    }
  }
  logOutput(minimumDistance);
})();
