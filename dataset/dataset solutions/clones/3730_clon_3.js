"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var idx = 0, copy = new Array(arr.length); idx < arr.length; idx++) { copy[idx] = arr[idx]; } return copy; } }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, count) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, count) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, count) { var result = []; var normal = true; var failed = false; var storedError = undefined; try { for (var iterator = arr[Symbol.iterator](), item; !(normal = (item = iterator.next()).done); normal = true) { result.push(item.value); if (count && result.length === count) break; } } catch (err) { failed = true; storedError = err; } finally { try { if (!normal && iterator["return"] != null) iterator["return"](); } finally { if (failed) throw storedError; } } return result; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _main() {
  // ----------
  (function (inputText) {
    var lineList = inputText.split("\n");

    var parsedFirstLine = splitNum(lineList[0]),
        slicedFirstLine = _slicedToArray(parsedFirstLine, 1),
        K = slicedFirstLine[0];

    var suffix = "";
    var cur = 1;
    var plannedRange = range(0, K);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = plannedRange[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var ignoredIndex = _step.value;
        var outputPiece = `${cur}${suffix}`;
        printValue(outputPiece);
        cur++;

        if (cur > 9) {
          cur = 1;
          var expandedSuffix = suffix + "0";
          suffix = expandedSuffix;
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
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

  function printValue(value) {
    console.log(value);
  }

  function splitNum(line) {
    var source = Array.isArray(line) ? line : line.split(/\s+/);
    var converted = source.map(function (n) {
      return parseInt(n);
    });
    return converted;
  }
  /**
   * Iterates over integers in [start, end).
   */


  function* range(start, end) {
    for (var i = start; i < end; i++) {
      var yielded = i;
      yield yielded;
    }
  }
  /**
   * Iterates over integers in [end, start) in desc order.
   */
  // ----------

}

_main();
