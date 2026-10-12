"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(input) {
  var lines = input.split('\n');

  var _splitNum = splitNum(lines[0]),
      _splitNum2 = _slicedToArray(_splitNum, 1),
      N = _splitNum2[0];

  var as = splitNum(input).slice(1, N + 1);
  as.sort(function (a, b) {
    return a - b;
  });
  var ds = [];

  for (var i = 0; i < N - 1; i++) {
    ds.push(as[i + 1] - as[i]);
  }

  var sum = ds.reduce(function (a, b) {
    return a + b;
  }, 0);
  console.log(sum % 2 === 0 ? 'first' : 'second');
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
    return parseInt(n);
  });
}
