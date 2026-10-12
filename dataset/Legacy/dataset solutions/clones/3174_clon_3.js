"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) { _i["return"](); } } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function mainProcess() {
  // ----------
  (function (rawData) {
    var inputLines = rawData.split("\n");

    var initialParams = parseNumbers(inputLines[0]);
    var destructuredParams = _slicedToArray(initialParams, 4);
    var numBamboos = destructuredParams[0];
    var targetA = destructuredParams[1];
    var targetB = destructuredParams[2];
    var targetC = destructuredParams[3];

    var bambooLengths = parseNumbers(inputLines.slice(1, numBamboos + 1));
    var minCost = Infinity;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      var totalCombinations = Math.pow(4, numBamboos);
      for (var _iterator = generateSequence(0, totalCombinations)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var combinationMask = _step.value;
        var groupA = [];
        var groupB = [];
        var groupC = [];
        var currentGroups = [[], groupA, groupB, groupC];

        var tempMask = combinationMask;
        for (var bambooIndex = 0; bambooIndex < numBamboos; bambooIndex++) {
          var groupAssignment = tempMask % 4;
          currentGroups[groupAssignment].push(bambooLengths[bambooIndex]);
          tempMask >>= 2;
        }

        if (groupA.length === 0 || groupB.length === 0 || groupC.length === 0) {
          continue;
        }

        var currentCombinationCost = calculateGroupCost(groupA, targetA) + calculateGroupCost(groupB, targetB) + calculateGroupCost(groupC, targetC);

        minCost = Math.min(minCost, currentCombinationCost);
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

    console.log(minCost);

    function calculateGroupCost(lengthsArray, targetLength) {
      var mergeOperations = lengthsArray.length - 1;
      var mergeCost = mergeOperations * 10;
      var currentTotalLength = lengthsArray.reduce(function (accumulator, currentVal) {
        return accumulator + currentVal;
      }, 0);
      var lengthAdjustmentCost = Math.abs(currentTotalLength - targetLength);
      return mergeCost + lengthAdjustmentCost;
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

  function parseNumbers(inputLineOrArray) {
    var source = Array.isArray(inputLineOrArray) ? inputLineOrArray : inputLineOrArray.split(/\s+/);
    return source.map(function (numStr) {
      return parseInt(numStr, 10);
    });
  }
  /**
   * Iterates over integers in [seqStart, seqEnd).
   */


  function* generateSequence(seqStart, seqEnd) {
    for (var currentNum = seqStart; currentNum < seqEnd; currentNum++) {
      yield currentNum;
    }
  }
  /**
   * Iterates over integers in [end, start) in desc order.
   */


  /**
   * implementation of arbitrary-precision unsigned integer.
   */
  var BigIntEmulator =
  /*#__PURE__*/
  function () {
    function BigIntEmulator(initialValue) {
      _classCallCheck(this, BigIntEmulator);

      // enough for 64bit
      this.data = [0, 0, 0];
      var dataIndex = 0;

      while (initialValue !== 0) {
        this.data[dataIndex] = initialValue % BigIntEmulator.border;
        initialValue = Math.floor(initialValue / BigIntEmulator.border);
        dataIndex++;
      }
    }

    _createClass(BigIntEmulator, [{
      key: "addBigInt",
      value: function addBigInt(otherBigInt) {
        var result = new BigIntEmulator(0);
        var maxLength = Math.max(this.data.length, otherBigInt.data.length);
        var carryValue = 0;
        var dataIndex = 0;

        for (; dataIndex < maxLength; dataIndex++) {
          var sum = (this.data[dataIndex] || 0) + (otherBigInt.data[dataIndex] || 0) + carryValue;
          result.data[dataIndex] = sum % BigIntEmulator.border;
          carryValue = Math.floor(sum / BigIntEmulator.border);
        }

        if (carryValue > 0) {
          result.data[dataIndex] = carryValue;
        }

        return result;
      }
    }, {
      key: "multiplyBigInt",
      value: function multiplyBigInt(otherBigInt) {
        var result = new BigIntEmulator(0);

        for (var leftIndex = 0; leftIndex < this.data.length; leftIndex++) {
          for (var rightIndex = 0; rightIndex < otherBigInt.data.length; rightIndex++) {
            var productPart = this.data[leftIndex] * otherBigInt.data[rightIndex];
            var tempIndex = leftIndex + rightIndex;
            var valueToCarry = productPart;

            while (valueToCarry > 0) {
              var sumWithExisting = (result.data[tempIndex] || 0) + valueToCarry;
              result.data[tempIndex] = sumWithExisting % BigIntEmulator.border;
              valueToCarry = Math.floor(sumWithExisting / BigIntEmulator.border);
              tempIndex++;
            }
          }
        }

        return result;
      }
    }, {
      key: "toDecimalString",
      value: function toDecimalString() {
        var reversedData = this.data.concat().reverse();

        var findFirstNonZeroIndex = function findFirstNonZeroIndex(arr, predicate) {
          for (var i = 0; i < arr.length; i++) {
            if (predicate(arr[i], i)) {
              return i;
            }
          }
          return null;
        };

        var firstNonZeroIdx = findFirstNonZeroIndex(reversedData, function (val) {
          return val !== 0;
        });

        if (firstNonZeroIdx == null) {
          return "0";
        }

        var padStringStart = function padStringStart(valueStr, desiredLength, paddingChar) {
          var numPads = desiredLength - valueStr.length;
          var result = "";
          for (var i = 0; i < numPads; i++) {
            result += paddingChar;
          }
          return result + valueStr;
        };

        return reversedData.slice(firstNonZeroIdx).map(function (partValue, index) {
          if (index === 0) {
            return String(partValue);
          } else {
            return padStringStart(String(partValue), BigIntEmulator.digits, "0");
          }
        }).join("");
      }
    }]);

    return BigIntEmulator;
  }();
  /** digits per element. */


  BigIntEmulator.digits = 7;
  BigIntEmulator.border = Math.pow(10, BigIntEmulator.digits);
  /**
   * Runs a recursive function expressed as a generator function.
   */
  // ----------
}

mainProcess();
