"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function main(input) {
  var lines = input.split('\n');

  var _splitNum = splitNum(lines[0]),
      _splitNum2 = _slicedToArray(_splitNum, 2),
      N = _splitNum2[0],
      K = _splitNum2[1];

  var tds = lines.slice(1, N + 1).map(function (line, id) {
    var _splitNum3 = splitNum(line),
        _splitNum4 = _slicedToArray(_splitNum3, 2),
        t = _splitNum4[0],
        d = _splitNum4[1];

    return {
      t,
      d,
      id
    };
  }); // neta -> oishisa

  tds.sort(function (a, b) {
    if (a.t < b.t) return -1;
    if (a.t > b.t) return 1;
    return b.d - a.d;
  }); // oishisa

  var oishisa = tds.slice(0).sort(function (a, b) {
    return b.d - a.d;
  });
  var currentT = -1;
  var currentArr = null;
  var netaMap = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var obj = _step.value;

      if (obj.t !== currentT) {
        if (currentArr) {
          netaMap.set(currentT, currentArr);
        }

        currentT = obj.t;
        currentArr = [];
      }

      currentArr.push(obj);
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

  if (currentArr) {
    netaMap.set(currentT, currentArr);
  }

  var netas = Array.from(netaMap.keys());
  var taken = new Array(N).fill(false); // 初期状態

  var initArr,
      otherArr = [],
      oishisaPoint = 0,
      netaCount = 0;
  var takeIdx = 0;

  if (netas.length >= K) {
    initArr = netas.map(function (neta) {
      var sushi = netaMap.get(neta)[0];
      return sushi;
    });
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = initArr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var sushi = _step2.value;
        taken[sushi.id] = true;
        oishisaPoint += sushi.d;
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

    netaCount = K;
  } else {
    initArr = netas.map(function (neta) {
      var sushi = netaMap.get(neta)[0];
      taken[sushi.id] = true;
      oishisaPoint += sushi.d;
      return sushi;
    });

    while (otherArr.length < K - initArr.length) {
      for (; takeIdx < N; takeIdx++) {
        var _sushi = oishisa[takeIdx];
        if (taken[_sushi.id]) continue;
        taken[_sushi.id] = true;
        oishisaPoint += _sushi.d;
        otherArr.push(_sushi);
      }
    }

    netaCount = netas.length;
  }

  initArr.sort(function (a, b) {
    return a.d - b.d;
  }); // console.log(initArr, otherArr, oishisaPoint);

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = range(0, initArr.length)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var i = _step3.value;
      var _sushi2 = initArr[i];

      for (; takeIdx < N; takeIdx++) {
        var repl = oishisa[takeIdx]; // console.log(sushi, repl);

        if (taken[repl.id]) continue;

        var _oldPoint = oishisaPoint + Math.pow(netaCount, 2);

        var newPoint = oishisaPoint + repl.d - _sushi2.d + Math.pow(netaCount - 1, 2);

        if (_oldPoint < newPoint) {
          oishisaPoint += repl.d - _sushi2.d;
          netaCount--;
          taken[repl.id] = true;
          taken[_sushi2.id] = false;
          break;
        } else {
          console.log(_oldPoint);
          return;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var oldPoint = oishisaPoint + Math.pow(netaCount, 2);
  console.log(oldPoint);
}

var P = 1e9 + 7;
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
    return parseInt(n);
  });
}
/**
 * Iterates over integers in [start, end).
 */


function* range(start, end) {
  for (var i = start; i < end; i++) {
    yield i;
  }
}
/**
 * Iterates over integers in [end, start) in desc order.
 */


function* rangeRev(start, end) {
  for (var i = start - 1; i >= end; i--) {
    yield i;
  }
}
/**
 * Runs a recursive function expressed as a generator function.
 */


function runRecursive(func) {
  // 最終結果を受け取るオブジェクトを用意
  var rootCaller = {
    lastReturnValue: null
  }; // 自前のコールスタックを用意

  var callStack = []; // 最初の関数呼び出しを追加

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  callStack.push({
    iterator: func.apply(void 0, args),
    lastReturnValue: null,
    caller: rootCaller
  });

  while (callStack.length > 0) {
    var stackFrame = callStack[callStack.length - 1];
    var iterator = stackFrame.iterator,
        lastReturnValue = stackFrame.lastReturnValue,
        caller = stackFrame.caller; // 関数の実行を再開

    var _iterator$next = iterator.next(lastReturnValue),
        value = _iterator$next.value,
        done = _iterator$next.done;

    if (done) {
      // 関数がreturnしたので親に返り値を記録
      caller.lastReturnValue = value;
      callStack.pop();
    } else {
      // 関数がyieldした（valueは再帰呼び出しの引数リスト）
      callStack.push({
        iterator: func.apply(void 0, _toConsumableArray(value)),
        lastReturnValue: null,
        caller: stackFrame
      });
    }
  }

  return rootCaller.lastReturnValue;
}
