var InputParser = (function () {
  function createParser(sourceString) {
    return new ParserInstance(sourceString);
  }

  function ParserInstance(sourceString) {
    this._sourceLines = sourceString.trim().split("\n");
    this._currentLineIndex = 0;
  }

  ParserInstance.prototype.readNextValue = function (returnAsString) {
    let currentLineData = this._sourceLines[this._currentLineIndex];
    if (typeof currentLineData === "string") {
      this._sourceLines[this._currentLineIndex] = currentLineData.split(" ").reverse();
    }
    let extractedValue = this._sourceLines[this._currentLineIndex].pop();
    if (!this._sourceLines[this._currentLineIndex].length) {
      this._currentLineIndex++;
    }
    return returnAsString ? extractedValue : +extractedValue;
  };

  ParserInstance.prototype.readLineValues = function (returnAsStrings) {
    const lineContent = this._sourceLines[this._currentLineIndex++];
    const parts = lineContent.split(" ");
    return returnAsStrings ? parts : parts.map(Number);
  };

  ParserInstance.prototype.readMatrix = function (numRows, returnAsStrings) {
    const startIndex = this._currentLineIndex;
    const endIndex = this._currentLineIndex + numRows;
    const rawRows = this._sourceLines.slice(startIndex, endIndex);
    this._currentLineIndex = endIndex;
    const processedRows = rawRows.map(line => line.split(" "));
    return returnAsStrings ? processedRows : processedRows.map(row => row.map(Number));
  };

  ParserInstance.prototype.readRawLines = function (numLines, returnAsStrings) {
    const startIndex = this._currentLineIndex;
    const endIndex = this._currentLineIndex + numLines;
    const lines = this._sourceLines.slice(startIndex, endIndex);
    this._currentLineIndex = endIndex;
    return returnAsStrings ? lines : lines.map(Number);
  };

  return createParser;
})();

var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
  const recursiveArrayBuilder = (dims, currentDimIndex) => {
    if (currentDimIndex === dims.length - 1) {
      return Array(dims[currentDimIndex]).fill(0).map(() => {
        return initialValue === "[]" ? [] : initialValue;
      });
    } else {
      return Array(dims[currentDimIndex]).fill(0).map(() =>
        recursiveArrayBuilder(dims, currentDimIndex + 1)
      );
    }
  };
  return recursiveArrayBuilder(dimensions, 0);
}

var boundaryRanges = createMultiDimArray("[]", 6);
var candidateValues = new Set([0]);

console.log(processInputAndCalculateArea());

function processInputAndCalculateArea() {
  var numOperations = inputReader.readNextValue();

  const directionHandlers = {
    "U": (coordX, coordY) => {
      updateBoundaryRange(0, coordY);
      updateBoundaryRange(5, coordX);
    },
    "R": (coordX, coordY) => {
      updateBoundaryRange(1, coordX);
      updateBoundaryRange(4, coordY);
    },
    "D": (coordX, coordY) => {
      updateBoundaryRange(2, coordY);
      updateBoundaryRange(5, coordX);
    },
    "L": (coordX, coordY) => {
      updateBoundaryRange(3, coordX);
      updateBoundaryRange(4, coordY);
    }
  };

  for (var opIndex = 0; opIndex < numOperations; opIndex++) {
    var coordX = inputReader.readNextValue();
    var coordY = inputReader.readNextValue();
    var directionChar = inputReader.readNextValue(true);

    const handler = directionHandlers[directionChar];
    if (handler) {
      handler(coordX, coordY);
    }
  }

  addCandidateValues(boundaryRanges[0][1], boundaryRanges[4][1], boundaryRanges[2][1]);
  addCandidateValues(-boundaryRanges[2][0], -boundaryRanges[4][0], -boundaryRanges[0][0]);
  addCandidateValues(boundaryRanges[1][1], boundaryRanges[5][1], boundaryRanges[3][1]);
  addCandidateValues(-boundaryRanges[3][0], -boundaryRanges[5][0], -boundaryRanges[1][0]);

  var minAreaResult = 1e18;

  for (var currentOffset of candidateValues) {
    const upperY = findMax(
      boundaryRanges[0][1] + currentOffset,
      boundaryRanges[2][1] - currentOffset,
      boundaryRanges[4][1]
    );
    const lowerY = findMin(
      boundaryRanges[0][0] + currentOffset,
      boundaryRanges[2][0] - currentOffset,
      boundaryRanges[4][0]
    );
    const rightX = findMax(
      boundaryRanges[1][1] + currentOffset,
      boundaryRanges[3][1] - currentOffset,
      boundaryRanges[5][1]
    );
    const leftX = findMin(
      boundaryRanges[1][0] + currentOffset,
      boundaryRanges[3][0] - currentOffset,
      boundaryRanges[5][0]
    );

    const currentArea = (upperY - lowerY) * (rightX - leftX);
    if (currentArea < minAreaResult) {
      minAreaResult = currentArea;
    }
  }
  return minAreaResult;
}

function updateBoundaryRange(index, coordinateValue) {
  if (!boundaryRanges[index].length) {
    boundaryRanges[index][0] = boundaryRanges[index][1] = coordinateValue;
    return;
  }
  boundaryRanges[index][0] = Math.min(boundaryRanges[index][0], coordinateValue);
  boundaryRanges[index][1] = Math.max(boundaryRanges[index][1], coordinateValue);
}

function addCandidateValues(valU, valX, valD) {
  const diffDX = valD - valX;
  const diffDU_half = (valD - valU) / 2;
  const diffXU = valX - valU;

  candidateValues.add(Math.max(0, diffDX || 0));
  candidateValues.add(Math.max(0, diffDU_half || 0));
  candidateValues.add(Math.max(0, diffXU || 0));
}

function findMax() {
  const valuesToCompare = Array.from(arguments);
  return valuesToCompare.reduce((currentMax, val) => {
    if (isNaN(val)) return currentMax;
    if (isNaN(currentMax)) return val;
    return Math.max(currentMax, val);
  }, valuesToCompare[0]);
}

function findMin() {
  const valuesToCompare = Array.from(arguments);
  return valuesToCompare.reduce((currentMin, val) => {
    if (isNaN(val)) return currentMin;
    if (isNaN(currentMin)) return val;
    return Math.min(currentMin, val);
  }, valuesToCompare[0]);
}
