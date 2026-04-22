"use strict";
var DATA_READER_FACTORY = (function() {
  function createInputProcessor(sourceContent) {
    return new InputProcessor(sourceContent);
  }

  function InputProcessor(fullText) {
    this._lines = fullText.trim().split('\n');
    this._lineCursor = 0;
  }

  InputProcessor.prototype.getNextToken = function(asString) {
    var lineBuffer = this._lines,
      currentLineIndex = this._lineCursor,
      extractedToken;

    if (typeof lineBuffer[currentLineIndex] === 'string') {
      lineBuffer[currentLineIndex] = lineBuffer[currentLineIndex].split(' ').reverse();
    }

    extractedToken = lineBuffer[currentLineIndex].pop();

    if (!lineBuffer[currentLineIndex].length) {
      this._lineCursor++;
    }

    return asString ? extractedToken : +extractedToken;
  };

  InputProcessor.prototype.getLineTokens = function(asString) {
    var tokensInLine = this._lines[this._lineCursor++].split(' ');
    return asString ? tokensInLine : tokensInLine.map(tokenValue => +tokenValue);
  };

  InputProcessor.prototype.getMultiLineTokens = function(numRows, asString) {
    var matrixData = this._lines.slice(this._lineCursor, this._lineCursor += numRows).map(lineString => lineString.split(' '));
    return asString ? matrixData : matrixData.map(rowArray => rowArray.map(elementString => +elementString));
  };

  InputProcessor.prototype.getRawLines = function(numLines, asString) {
    var grabbedLines = this._lines.slice(this._lineCursor, this._lineCursor += numLines);
    return asString ? grabbedLines : grabbedLines.map(lineContent => +lineContent);
  };

  return createInputProcessor;
})();

var stdinReader = DATA_READER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeNDArray(initialValue) {
  var dimensionArguments = arguments,
    dimensionCount = dimensionArguments.length,
    arrayCreationCode = "Array(dimensionArguments[" + --dimensionCount + "]).fill(0).map( _ => {return " + initialValue + ";})";

  while (--dimensionCount) {
    arrayCreationCode = "Array(dimensionArguments[" + dimensionCount + "]).fill(0).map( _ => " + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

var LARGE_NUMBER = 1_000_000_000_000_000;

console.log(solveProblem());

function solveProblem() {
  var problemSize = stdinReader.getNextToken();
  var maxSpan = stdinReader.getNextToken();
  var heights = [0].concat(stdinReader.getLineTokens());

  var dynamicProgrammingTable = initializeNDArray(LARGE_NUMBER, 2, 2);
  dynamicProgrammingTable[0][0] = heights[1];
  dynamicProgrammingTable[1][1] = 0;

  for (var currentIdx = 1; currentIdx < problemSize; currentIdx++) {
    var subProblemBound = Math.min(currentIdx, maxSpan) + 1;
    var nextDynamicProgrammingTable = initializeNDArray(LARGE_NUMBER, subProblemBound + 1, subProblemBound + 1);

    for (var prevSpan = 0; prevSpan < subProblemBound; prevSpan++) {
      for (var prevK = prevSpan; prevK < subProblemBound; prevK++) {
        var costValue = Math.max(0, heights[currentIdx + 1] - heights[currentIdx - prevSpan]);
        if (dynamicProgrammingTable[prevK][prevSpan] + costValue < nextDynamicProgrammingTable[prevK][0]) {
          nextDynamicProgrammingTable[prevK][0] = dynamicProgrammingTable[prevK][prevSpan] + costValue;
        }
      }

      if (prevSpan < maxSpan) {
        for (var prevK = prevSpan; prevK < subProblemBound; prevK++) {
          if (dynamicProgrammingTable[prevK][prevSpan] < nextDynamicProgrammingTable[prevK + 1][prevSpan + 1]) {
            nextDynamicProgrammingTable[prevK + 1][prevSpan + 1] = dynamicProgrammingTable[prevK][prevSpan];
          }
        }
      }
    }
    dynamicProgrammingTable = nextDynamicProgrammingTable;
  }

  var minimumTotalCost = LARGE_NUMBER;
  for (var finalIdx = 0; finalIdx <= maxSpan; finalIdx++) {
    if (dynamicProgrammingTable[maxSpan][finalIdx] < minimumTotalCost) {
      minimumTotalCost = dynamicProgrammingTable[maxSpan][finalIdx];
    }
  }
  return minimumTotalCost;
}