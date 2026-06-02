"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

!function () {
  var FenwickTree =
  /*#__PURE__*/
  function () {
    function FenwickTree(size) {
      _classCallCheck(this, FenwickTree);

      this.size = size;
      this.treeValues = new Array(size + 1).fill(0);
    }

    var _getLSB = function(idx) {
        return idx & -idx;
    };

    _createClass(FenwickTree, [{
      key: "modifyValue",
      value: function modifyValue(index, valueDelta) {
        for (var i = index; i <= this.size; i += _getLSB(i)) {
          this.treeValues[i] += valueDelta;
        }
      }
    }, {
      key: "queryPrefixSum",
      value: function (index) {
        var currentSum = 0;
        for (var i = index; i > 0; i -= _getLSB(i)) {
          currentSum += this.treeValues[i];
        }
        return currentSum;
      }
    }]);

    return FenwickTree;
  }();

  var CoordinateMapper =
  /*#__PURE__*/
  function () {
    function CoordinateMapper(sourceNumbers) {
      _classCallCheck(this, CoordinateMapper);

      var sortedNumbers = [...sourceNumbers];
      sortedNumbers.sort(function (a, b) {
        return a - b;
      });

      var numLength = sortedNumbers.length;
      this.minVal = sortedNumbers[0];
      this.maxVal = sortedNumbers[numLength - 1];
      
      var uniqueSortedValues = new Array(numLength);
      var valueToCompressedIndex = new Map();
      var currentCompressedIndex = 0;
      var previousValue = null;

      for (var i = 0; i < numLength; i++) {
        var currentValue = sortedNumbers[i];
        if (previousValue !== currentValue) {
            currentCompressedIndex++;
        }
        uniqueSortedValues[i] = currentValue;
        valueToCompressedIndex.set(currentValue, i);
        previousValue = currentValue;
      }

      this.uniqueSortedValues = uniqueSortedValues;
      this.valueToCompressedIndex = valueToCompressedIndex;
      this.compressedRangeSize = currentCompressedIndex;
    }

    _createClass(CoordinateMapper, [{
      key: "getOriginalValue",
      value: function getOriginalValue(compressedIndex) {
        return this.uniqueSortedValues[compressedIndex];
      }
    }, {
      key: "getCompressedIndex",
      value: function getCompressedIndex(originalValue) {
        return this.valueToCompressedIndex.get(originalValue);
      }
    }]);

    return CoordinateMapper;
  }();

  function parseNumericLine(inputLine) {
    if (!inputLine || typeof inputLine !== 'string') {
        return [];
    }
    var numberStrings = inputLine.split(/\s+/);
    var parsedNumbers = numberStrings.map(function (str) {
      return parseInt(str, 10);
    });
    return parsedNumbers;
  }

  !function (rawInputString) {
    var inputLines = rawInputString.split("\n");

    var firstLineNumbers = parseNumericLine(inputLines[0]);
    var _firstLineNumbers = _slicedToArray(firstLineNumbers, 1),
        totalQueriesCount = _firstLineNumbers[0];

    var parseOperationLine = function(lineContent) {
      var _parsed = parseNumericLine(lineContent),
          _parsed2 = _slicedToArray(_parsed, 3),
          operationType = _parsed2[0],
          operandA = _parsed2[1],
          operandB = _parsed2[2];
      return {
        type: operationType,
        valA: operandA,
        valB: operandB
      };
    };

    var parsedOperations = inputLines.slice(1, totalQueriesCount + 1).map(parseOperationLine);

    var valuesForCompression = parsedOperations.filter(function (op) {
      return 1 === op.type;
    }).map(function (op) {
      return op.valA;
    });

    var coordinateCompressor = new CoordinateMapper(valuesForCompression);
    var fenwickTreeInstance = new FenwickTree(coordinateCompressor.compressedRangeSize);

    var currentAccumulatedCost = 0;
    var currentOptimalPointIndex = null;

    var updateFenwickTreeForOperation = function(compressedIndex) {
        fenwickTreeInstance.modifyValue(1, -1);
        fenwickTreeInstance.modifyValue(compressedIndex, 2);
    };

    var calculateAdjustedPreviousMinIndex = function(pointIndex) {
        var sumAtPoint = fenwickTreeInstance.queryPrefixSum(pointIndex);
        return (0 === sumAtPoint) ? (pointIndex + 1) : pointIndex;
    };

    var updateAccumulatedCost = function(currentCost, newOperandB, prevOptimalIndex, currentOperandA) {
        if (null == prevOptimalIndex) {
            return newOperandB;
        } else {
            var originalPrevValue = coordinateCompressor.getOriginalValue(prevOptimalIndex);
            var costDelta = Math.abs(currentOperandA - originalPrevValue);
            return currentCost + costDelta + newOperandB;
        }
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = parsedOperations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var currentOperation = _step.value;
        var operationType = currentOperation.type;
        var operandA = currentOperation.valA;
        var operandB = currentOperation.valB;

        if (1 === operationType) {
          var previousOptimalIndexAdjusted = calculateAdjustedPreviousMinIndex(currentOptimalPointIndex);
          var compressedOperandAIndex = coordinateCompressor.getCompressedIndex(operandA) + 1;

          updateFenwickTreeForOperation(compressedOperandAIndex);

          currentAccumulatedCost = updateAccumulatedCost(
              currentAccumulatedCost,
              operandB,
              currentOptimalPointIndex,
              coordinateCompressor.getOriginalValue(previousOptimalIndexAdjusted)
          );

          currentOptimalPointIndex = findOptimalPointIndex();
        } else {
          var finalOptimalValue = coordinateCompressor.getOriginalValue(currentOptimalPointIndex);
          console.log(`${finalOptimalValue} ${currentAccumulatedCost}`);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    function findOptimalPointIndex() {
      var lowBound = 1;
      var highBound = coordinateCompressor.compressedRangeSize + 1;

      while (lowBound < highBound) {
        var midIndex = Math.floor((lowBound + highBound) / 2);
        var currentSumAtMid = fenwickTreeInstance.queryPrefixSum(midIndex);

        if (currentSumAtMid > 0) {
          highBound = midIndex;
        } else if (0 === currentSumAtMid) {
          lowBound = midIndex;
          break;
        } else {
          lowBound = midIndex + 1;
        }
      }
      return lowBound - 1;
    }
  }(require("fs").readFileSync("/dev/stdin", "utf8"));
}();
