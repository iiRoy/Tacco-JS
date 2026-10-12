"use strict";

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr[_arr.length] = _s.value;
      if (i && _arr.length >= i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) {
    return arr;
  }
}

function main(input) {
  var lines = input.trim().split('\n');
  var N = Number(lines[0]);
  var as = splitNum(lines[1]).slice(0, N);
  var map = new Map();

  for (var p = 0; p < as.length; p++) {
    var a = as[p];
    var v = map.get(a);

    if (v === undefined) {
      map.set(a, 1);
    } else {
      map.set(a, v + 1);
    }
  }

  var result = 0;

  while (map.size !== 0) {
    var head = map[Symbol.iterator]().next();

    if (head.done) {
      break;
    }

    var _head$value = _slicedToArray(head.value, 2),
        init = _head$value[0],
        num = _head$value[1];

    if (!remove(map, init, num)) {
      continue;
    }

    var _rec = rec(init),
        _rec2 = _slicedToArray(_rec, 2),
        left = _rec2[0],
        right = _rec2[1];

    result = result + Math.min(left, right);
  }

  console.log(result);

  function rec(init) {
    var leftNum = 1;
    var rightNum = 0;
    var ds = diffs(init);

    for (var i = 0; i < ds.length; i++) {
      var d = ds[i];

      if (remove(map, d)) {
        var child = rec(d),
            child2 = _slicedToArray(child, 2),
            ls = child2[0],
            rs = child2[1];

        leftNum += rs;
        rightNum += ls;
      }
    }

    return [leftNum, rightNum];
  }
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.trim().split(/\s+/).map(function (n) {
    return parseInt(n, 10);
  });
}

function binarySearch(arr, target) {
  var start = 0;
  var end = arr.length;

  while (end - start > 0) {
    var idx = Math.floor((end + start) / 2);
    var val = arr[idx];

    if (val === target) {
      return idx;
    } else if (val < target) {
      start = idx + 1;
    } else {
      end = idx;
    }
  }

  return null;
}

function diffs(val) {
  var res = [];
  var tar = 2;

  while (tar <= 2 * 1e9) {
    var d = tar - val;

    if (d > 0) {
      res.push(d);
    }

    tar *= 2;
  }

  return res;
}

function remove(map, key) {
  var val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : map.get(key);

  if (val == null) {
    return false;
  }

  if (val - 1 > 0) {
    map.set(key, val - 1);
  } else {
    map.delete(key);
  }

  return true;
}