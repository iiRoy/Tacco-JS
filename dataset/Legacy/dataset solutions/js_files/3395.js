"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(input) {
  var lines = input.split('\n');
  var N = parseInt(lines[0]);
  var as = splitNum(lines[1]).slice(0, N);
  var map = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = as[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var a = _step.value;
      var v = map.get(a);

      if (v != null) {
        map.set(a, v + 1);
      } else {
        map.set(a, 1);
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

  var result = 0;

  while (map.size > 0) {
    var _map$Symbol$iterator$ = map[Symbol.iterator]().next(),
        _map$Symbol$iterator$2 = _slicedToArray(_map$Symbol$iterator$.value, 2),
        init = _map$Symbol$iterator$2[0],
        num = _map$Symbol$iterator$2[1];

    remove(map, init, num);

    var _rec = rec(init),
        _rec2 = _slicedToArray(_rec, 2),
        left = _rec2[0],
        right = _rec2[1];

    result += Math.min(left, right);
  }

  console.log(result);

  function rec(init) {
    var leftNum = 1;
    var rightNum = 0;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = diffs(init)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var d = _step2.value;

        if (remove(map, d)) {
          var _rec3 = rec(d),
              _rec4 = _slicedToArray(_rec3, 2),
              ls = _rec4[0],
              rs = _rec4[1];

          leftNum += rs;
          rightNum += ls;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return [leftNum, rightNum];
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
    return parseInt(n);
  });
}

function binarySearch(arr, target) {
  var start = 0,
      end = arr.length;

  while (start < end) {
    var idx = Math.floor((end - start) / 2) + start;
    var val = arr[idx];

    if (val === target) {
      return idx;
    }

    if (val < target) {
      start = idx;
    } else {
      end = idx;
    }
  }

  return null;
}

function diffs(val) {
  var res = [];

  for (var tar = 2; tar <= 2 * 1e9; tar *= 2) {
    var d = tar - val;

    if (d > 0) {
      res.push(d);
    }
  }

  return res;
}

function remove(map, key) {
  var val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : map.get(key);
  if (val == null) return false;

  if (val > 1) {
    map.set(key, val - 1);
  } else {
    map.delete(key);
  }

  return true;
}
