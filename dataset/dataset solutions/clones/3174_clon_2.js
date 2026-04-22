"use strict";

function _convertToArray(sourceArray) { return _extractArrayElements(sourceArray) || _transformIterable(sourceArray) || _invalidSpread(); }

function _invalidSpread() { throw new TypeError("Cannot spread non-iterable instance"); }

function _extractArrayElements(sourceArray) { if (Array.isArray(sourceArray)) { for (var itemIndex = 0, newArray = new Array(sourceArray.length); itemIndex < sourceArray.length; itemIndex++) { newArray[itemIndex] = sourceArray[itemIndex]; } return newArray; } }

function _verifyClassInstance(objInstance, classConstructor) { if (!(objInstance instanceof classConstructor)) { throw new TypeError("Cannot invoke class without 'new'"); } }

function _establishProperties(targetObject, propertyList) { for (var propIdx = 0; propIdx < propertyList.length; propIdx++) { var propDescriptor = propertyList[propIdx]; propDescriptor.enumerable = propDescriptor.enumerable || false; propDescriptor.configurable = true; if ("value" in propDescriptor) propDescriptor.writable = true; Object.defineProperty(targetObject, propDescriptor.key, propDescriptor); } }

function _constructClass(classConstructor, prototypeProperties, staticProperties) { if (prototypeProperties) _establishProperties(classConstructor.prototype, prototypeProperties); if (staticProperties) _establishProperties(classConstructor, staticProperties); return classConstructor; }

function _obtainArray(sourceArray) { return _retrieveArray(sourceArray) || _transformIterable(sourceArray) || _invalidRest(); }

function _transformIterable(iterObject) { if (Symbol.iterator in Object(iterObject) || Object.prototype.toString.call(iterObject) === "[object Arguments]") return Array.from(iterObject); }

function _segmentArray(sourceArray, limit) { return _retrieveArray(sourceArray) || _limitIterableToArray(sourceArray, limit) || _invalidRest(); }

function _invalidRest() { throw new TypeError("Failed to destructure non-iterable value"); }

function _limitIterableToArray(sourceArray, limit) { var tempArray = []; var isNormal = true; var hasError = false; var errorDetails = undefined; try { for (var iter = sourceArray[Symbol.iterator](), currentItem; !(isNormal = (currentItem = iter.next()).done); isNormal = true) { tempArray.push(currentItem.value); if (limit && tempArray.length === limit) break; } } catch (err) { hasError = true; errorDetails = err; } finally { try { if (!isNormal && iter["return"] != null) { iter["return"](); } } finally { if (hasError) throw errorDetails; } } return tempArray; }

function _retrieveArray(sourceArray) { if (Array.isArray(sourceArray)) return sourceArray; }

function _executeProgram() {
  // Main application logic starts here
  (function (dataInput) {
    var textLines = dataInput.split("\n");

    var _parsedValues = parseNumericLine(textLines[0]),
        _segmentedValues = _segmentArray(_parsedValues, 4),
        count = _segmentedValues[0],
        targetA = _segmentedValues[1],
        targetB = _segmentedValues[2],
        targetC = _segmentedValues[3];

    var lengthsList = parseNumericLine(textLines.slice(1).slice(0, count));
    var minimumCost = Number.MAX_VALUE;
    var _iterationComplete = true;
    var _encounteredError = false;
    var _iterationErrorDetails = undefined;

    try {
      for (var _iterator = numericSequence(0, Math.pow(4, count))[Symbol.iterator](), _step; !(_iterationComplete = (_step = _iterator.next()).done); _iterationComplete = true) {
        var combinationPattern = _step.value;
        var listA = [],
            listB = [],
            listC = [];
        var elementIndex = 0;

        while (combinationPattern > 0) {
          var currentBit = combinationPattern % 4;
          [[], listA, listB, listC][currentBit].push(lengthsList[elementIndex]);
          combinationPattern >>= 2;
          elementIndex++;
        }

        if (listA.length === 0 || listB.length === 0 || listC.length === 0) {
          continue;
        }

        var currentSum = calculatePenalty(listA, targetA) + calculatePenalty(listB, targetB) + calculatePenalty(listC, targetC);

        if (minimumCost > currentSum) {
          minimumCost = currentSum;
        }
      }
    } catch (err) {
      _encounteredError = true;
      _iterationErrorDetails = err;
    } finally {
      try {
        if (!_iterationComplete && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_encounteredError) {
          throw _iterationErrorDetails;
        }
      }
    }

    console.log(minimumCost);

    function calculatePenalty(segmentList, targetLength) {
      var adjustmentCost = (segmentList.length - 1) * 10;
      var combinedLength = segmentList.reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
      }, 0);
      return adjustmentCost + Math.abs(combinedLength - targetLength);
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

  // Parses a string or array of strings into an array of integers.
  function parseNumericLine(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr);
    });
  }

  // Generator function for numerical sequences.
  function* numericSequence(beginVal, endVal) {
    for (var currentVal = beginVal; currentVal < endVal; currentVal++) {
      yield currentVal;
    }
  }
  // Placeholder for a descending sequence generator, if needed.


  // Implementation for handling large integers.
  var BigIntHandler =
  /*#__PURE__*/
  function () {
    function BigIntHandler(initialValue) {
      _verifyClassInstance(this, BigIntHandler);

      // Array to hold segments of the large number.
      this.digitChunks = [0, 0, 0];
      var indexPos = 0;

      while (initialValue !== 0) {
        this.digitChunks[indexPos] = initialValue % BigIntHandler.chunkBoundary;
        initialValue = Math.floor(initialValue / BigIntHandler.chunkBoundary);
        indexPos++;
      }
    }

    _constructClass(BigIntHandler, [{
      key: "performAddition",
      value: function performAddition(operandRight) {
        var addResult = new BigIntHandler(0);
        var maxLength = Math.max(this.digitChunks.length, operandRight.digitChunks.length);
        var overflow = 0;
        var indexPos = 0;

        for (; indexPos < maxLength; indexPos++) {
          var chunkSum = (this.digitChunks[indexPos] || 0) + (operandRight.digitChunks[indexPos] || 0) + overflow;
          addResult.digitChunks[indexPos] = chunkSum % BigIntHandler.chunkBoundary;
          overflow = Math.floor(chunkSum / BigIntHandler.chunkBoundary);
        }

        if (overflow > 0) {
          addResult.digitChunks[indexPos] = overflow;
        }

        return addResult;
      }
    }, {
      key: "performMultiplication",
      value: function performMultiplication(operandRight) {
        var mulResult = new BigIntHandler(0);

        for (var leftIndex = 0; leftIndex < this.digitChunks.length; leftIndex++) {
          for (var rightIndex = 0; rightIndex < operandRight.digitChunks.length; rightIndex++) {
            var productChunk = this.digitChunks[leftIndex] * operandRight.digitChunks[rightIndex];
            var targetIndex = leftIndex + rightIndex;
            var chunkValue = productChunk;

            while (chunkValue > 0) {
              var currentSum = (mulResult.digitChunks[targetIndex] || 0) + chunkValue;
              mulResult.digitChunks[targetIndex] = currentSum % BigIntHandler.chunkBoundary;
              chunkValue = Math.floor(currentSum / BigIntHandler.chunkBoundary);
              targetIndex++;
            }
          }
        }

        return mulResult;
      }
    }, {
      key: "toDecimalString",
      value: function toDecimalString() {
        var reversedChunks = this.digitChunks.concat().reverse();

        var firstNonZeroIndex = function (inputArray, predicateFn) {
          for (var i = 0; i < inputArray.length; i++) {
            if (predicateFn(inputArray[i], i)) {
              return i;
            }
          }

          return null;
        }(reversedChunks, function (chunkValue) {
          return chunkValue !== 0;
        });

        if (firstNonZeroIndex == null) {
          return "0";
        }

        return reversedChunks.slice(firstNonZeroIndex).map(function (chunkValue, mapIndex) {
          if (mapIndex === 0) {
            return String(chunkValue);
          } else {
            return padLeftWithChar(String(chunkValue), BigIntHandler.chunkDigits, "0");
          }
        }).join("");

        function padLeftWithChar(sourceString, desiredLength, paddingChar) {
          var paddingCount = desiredLength - sourceString.length;
          var paddedResult = "";

          for (var i = 0; i < paddingCount; i++) {
            paddedResult += paddingChar;
          }

          return paddedResult + sourceString;
        }
      }
    }]);

    return BigIntHandler;
  }();
  // Number of digits per element in the array.
  BigIntHandler.chunkDigits = 7;
  BigIntHandler.chunkBoundary = Math.pow(10, BigIntHandler.chunkDigits);
  // Unused function: for recursive generator.
}

_executeProgram();