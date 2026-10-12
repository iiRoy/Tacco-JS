"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

(function () {
  var FenwickTree =
  /*#__PURE__*/
  function () {
    function FenwickTree(size) {
      _classCallCheck(this, FenwickTree);

      this.size = size;
      this.values = new Array(size + 1).fill(0);
    }

    _createClass(FenwickTree, [{
      key: "update",
      value: function update(idx, val) {
        for (var i = idx; i <= this.size; i += i & -i) {
          this.values[i] += val;
        }
      }
    }, {
      key: "query",
      value: function (idx) {
        var total = 0;

        for (var i = idx; i > 0; i -= i & -i) {
          total += this.values[i];
        }

        return total;
      }
    }]);

    return FenwickTree;
  }();

  var CoordinateMapper =
  /*#__PURE__*/
  function () {
    function CoordinateMapper(coordinates) {
      _classCallCheck(this, CoordinateMapper);

      coordinates.sort(function (a, b) {
        return a - b;
      });
      var len = coordinates.length;
      this.minimumVal = coordinates[0];
      this.maximumVal = coordinates[len - 1];
      var mappedToArray = new Array(len);
      var originalToMapped = new Map();
      var uniqueCount = 0;
      var previousCoord = null;

      for (var i = 0; i < len; i++) {
        var currentCoord = coordinates[i];
        if (previousCoord !== currentCoord) uniqueCount++;
        mappedToArray[i] = currentCoord;
        originalToMapped.set(currentCoord, i);
        previousCoord = currentCoord;
      }

      this.mappedToArray = mappedToArray;
      this.originalToMapped = originalToMapped;
      this.uniqueCount = uniqueCount;
    }

    _createClass(CoordinateMapper, [{
      key: "getOriginal",
      value: function getOriginal(mappedIndex) {
        return this.mappedToArray[mappedIndex];
      }
    }, {
      key: "getMappedIndex",
      value: function getMappedIndex(originalValue) {
        return this.originalToMapped.get(originalValue);
      }
    }]);

    return CoordinateMapper;
  }();

  function parseNumbers(inputLine) {
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (numStr) {
      return parseInt(numStr);
    });
  }

  (function (rawInput) {
    var inputLines = rawInput.split("\n");

    var _parseNumbers = parseNumbers(inputLines[0]),
        _parseNumbers2 = _slicedToArray(_parseNumbers, 1),
        numQueries = _parseNumbers2[0];

    var operations = inputLines.slice(1, numQueries + 1).map(function (inputLine) {
      var _parseNumbers3 = parseNumbers(inputLine),
          _parseNumbers4 = _slicedToArray(_parseNumbers3, 3),
          opType = _parseNumbers4[0],
          paramA = _parseNumbers4[1],
          paramB = _parseNumbers4[2];

      return {
        opType: opType,
        paramA: paramA,
        paramB: paramB
      };
    });
    var uniqueCoords = operations.filter(function (opRef) {
      var opType = opRef.opType;
      return 1 === opType;
    }).map(function (opRef2) {
      var paramA = opRef2.paramA;
      return paramA;
    });
    var coordMap = new CoordinateMapper(uniqueCoords);
    var bitTree = new FenwickTree(coordMap.uniqueCount);
    var currentMinCost = 0,
        minCoordIndex = null;
    var iterComplete = true;
    var errorOccurred = false;
    var iteratorError = undefined;

    try {
      for (var opIterator = operations[Symbol.iterator](), currentOpStep; !(iterComplete = (currentOpStep = opIterator.next()).done); iterComplete = true) {
        var opDetails = currentOpStep.value,
            opType = opDetails.opType,
            paramA = opDetails.paramA,
            paramB = opDetails.paramB;

        if (1 === opType) {
          var previousMinIndex = 0 === bitTree.query(minCoordIndex) ? minCoordIndex + 1 : minCoordIndex;
          var mappedAIndex = coordMap.getMappedIndex(paramA) + 1;
          bitTree.update(1, -1);
          bitTree.update(mappedAIndex, 2);
          if (null == minCoordIndex) currentMinCost = paramB;else currentMinCost += Math.abs(paramA - coordMap.getOriginal(previousMinIndex)) + paramB;
          minCoordIndex = findMinIndex();
        } else console.log(`${coordMap.getOriginal(minCoordIndex)} ${currentMinCost}`);
      }
    } catch (err) {
      errorOccurred = true;
      iteratorError = err;
    } finally {
      try {
        if (!iterComplete && opIterator["return"] != null) {
          opIterator["return"]();
        }
      } finally {
        if (errorOccurred) {
          throw iteratorError;
        }
      }
    }

    function findMinIndex() {
      var lowBound = 1,
          highBound = coordMap.uniqueCount + 1;

      for (; lowBound < highBound;) {
        var midPoint = Math.floor((lowBound + highBound) / 2);
        var currentSum = bitTree.query(midPoint);
        if (currentSum > 0) highBound = midPoint;else if (0 === currentSum) {
          lowBound = midPoint;
          break;
        } else lowBound = midPoint + 1;
      }

      return lowBound - 1;
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
