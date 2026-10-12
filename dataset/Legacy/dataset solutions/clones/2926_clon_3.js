"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

!function () {
  function parseNumericLine(textInput) {
    const segments = Array.isArray(textInput) ? textInput : textInput.split(/\s+/);
    return segments.map(function (numString) {
      return parseInt(numString, 10);
    });
  }

  function determineFinalOutput(primaryVal, secondaryVal) {
    let calculatedResult;
    if (primaryVal <= 5) {
      calculatedResult = 0;
    } else if (primaryVal <= 16) {
      calculatedResult = secondaryVal / 2;
    } else {
      calculatedResult = secondaryVal;
    }
    return calculatedResult;
  }

  !function (rawInputData) {
    const allInputLines = rawInputData.split("\n");

    const firstDataLine = allInputLines[0];

    const parsedValuesArray = parseNumericLine(firstDataLine);

    const destructuredPair = _slicedToArray(parsedValuesArray, 2);
    const primaryValue = destructuredPair[0];
    const secondaryValue = destructuredPair[1];

    const finalOutputValue = determineFinalOutput(primaryValue, secondaryValue);

    console.log(finalOutputValue);
  }(require("fs").readFileSync("/dev/stdin", "utf8"));
}();
