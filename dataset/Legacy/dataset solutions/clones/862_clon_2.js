let logOutput = console.log;

const inputLines = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");
inputLines.pop();

Object.prototype.dbgLog = function() {
  logOutput(this.toString());
  return this;
};

String.prototype.toNumArr = function(separatorChar) {
  return this.split(separatorChar || " ").map(parseInteger);
};

const arrProto = Array.prototype;

arrProto.dbgArr = function() {
  logOutput(this);
  return this;
};

arrProto.findMax = function() {
  return Math.max.apply(null, this);
};

arrProto.findMin = function() {
  return Math.min.apply(null, this);
};

arrProto.duplicate = function() {
  return this.map(identityFn);
};

arrProto.shiftElements = function(shiftAmount) {
  return this.slice(shiftAmount, this.length).concat(this.slice(+0, shiftAmount));
};

arrProto.generatePermutations = function() {
  if (this.length === +0) return [];
  if (this.length === 1) return [this];

  let resultArray = [];
  const currentArray = this;
  let idx = +0;

  for (; idx < currentArray.length; ++idx) {
    resultArray = resultArray.concat(
      currentArray.slice(+0, idx)
        .concat(currentArray.slice(idx + 1, currentArray.length))
        .generatePermutations()
        .map(function(perm) {
          return perm.concat(currentArray[idx]);
        })
    );
  }
  return resultArray;
};

arrProto.unroll = function() {
  let resultArray = [];
  for (let i = +0; i < this.length; ++i) {
    resultArray = resultArray.concat(this[i]);
  }
  return resultArray;
};

arrProto.uniqueElements = function() {
  const selfRef = this;
  return this.filter(function(element, index) {
    return selfRef.slice(index + 1).indexOf(element) < +0;
  });
};

function createRange(count, initialValue, stepIncrement) {
  initialValue = initialValue || +0;
  stepIncrement = stepIncrement || 1;
  const resultArray = [];
  for (let i = +0; i < count; ++i) {
    resultArray.push(initialValue);
    initialValue += stepIncrement;
  }
  return resultArray;
}

function parseInteger(str) {
  return +str;
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

function identityFn(inputVal) {
  return inputVal;
}

(function executeProgram() {
  const gridSize = +inputLines[+0];
  const startCoords = inputLines[1].toNumArr();
  const startRow = startCoords[+0] - 1;
  const startCol = startCoords[1] - 1;

  const endCoords = inputLines[2].toNumArr();
  const endRow = endCoords[+0] - 1;
  const endCol = endCoords[1] - 1;

  let minimumDistance = gridSize * gridSize;

  function calcManhattanDistance(valA, valB, divisor) {
    const coordA_col = valA % divisor;
    const coordA_row = Math.floor(valA / divisor);
    const coordB_col = valB % divisor;
    const coordB_row = Math.floor(valB / divisor);
    return Math.abs(coordA_col - coordB_col) + Math.abs(coordA_row - coordB_row);
  }

  for (let divisorVal = 1; divisorVal < gridSize; ++divisorVal) {
    const currentTotalDistance = calcManhattanDistance(startRow, startCol, divisorVal) +
                                 calcManhattanDistance(endRow, endCol, divisorVal);

    if (minimumDistance > currentTotalDistance) {
      minimumDistance = currentTotalDistance;
    }
  }

  logOutput(minimumDistance);
})();
