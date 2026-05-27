"use strict";

function _destructureArray(inputArray, limitCount) {
  return _checkArrayType(inputArray) || _limitIterableToArray(inputArray, limitCount) || _handleNonIterableInstance();
}

function _handleNonIterableInstance() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _limitIterableToArray(iterableSource, limitCount) {
  var _collectedElements = [];
  var _iterationComplete = true;
  var _errorOccurred = false;
  var _caughtError = undefined;
  try {
    for (var _iterator = iterableSource[Symbol.iterator](), _step; !(_iterationComplete = (_step = _iterator.next()).done); _iterationComplete = true) {
      _collectedElements.push(_step.value);
      if (limitCount && _collectedElements.length === limitCount) break;
    }
  } catch (err) {
    _errorOccurred = true;
    _caughtError = err;
  } finally {
    try {
      if (!_iterationComplete && _iterator["return"] != null) _iterator["return"]();
    } finally {
      if (_errorOccurred) throw _caughtError;
    }
  }
  return _collectedElements;
}

function _checkArrayType(potentialArray) {
  if (Array.isArray(potentialArray)) return potentialArray;
}

function extractIntegersFromLine(sourceData) {
  const elementsToProcess = Array.isArray(sourceData) ? sourceData : sourceData.split(/\s+/);

  return elementsToProcess.map(function (numericString) {
    return parseInt(numericString, 10);
  });
}

function readStandardInputContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function calculateAndDisplayMinSum(rawInputContent) {
  const allInputLines = rawInputContent.split("\n");

  const firstDataLine = allInputLines[0];

  const parsedNumberArray = extractIntegersFromLine(firstDataLine);

  const destructuredValues = _destructureArray(parsedNumberArray, 3);
  const valP = destructuredValues[0];
  const valQ = destructuredValues[1];
  const valR = destructuredValues[2];

  const sumPQ = valP + valQ;
  const sumQR = valQ + valR;
  const sumRP = valR + valP;

  const finalMinimumSum = Math.min(sumPQ, sumQR, sumRP);

  console.log(finalMinimumSum);
}

(function initializeAndRunProgram() {
  const programInputData = readStandardInputContent();
  calculateAndDisplayMinSum(programInputData);
})();
