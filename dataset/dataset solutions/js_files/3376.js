"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(input) {
  var lines = input.split('\n');

  var _splitNum = splitNum(lines[0]),
      _splitNum2 = _slicedToArray(_splitNum, 2),
      N = _splitNum2[0],
      P = _splitNum2[1];

  var max = Math.pow(P, 1 / N);

  if (N === 1) {
    console.log(P);
    return;
  }

  var res = 1;

  for (var i = 2; i <= max; i++) {
    if (P % Math.pow(i, N) === 0) {
      res = i;
    }
  }

  console.log(res);
}

function gcd(a, b) {
  if (a < b) return gcd(a, b);
  if (b === 0) return a;
  var r = a % b;
  return gcd(b, r);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
    return parseInt(n);
  });
}
