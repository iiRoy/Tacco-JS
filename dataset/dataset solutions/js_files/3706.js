"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function main(input) {
  var lines = input.split('\n');
  var N = parseInt(lines[0]);
  var A = splitNum(lines[1]).slice(0, N);
  var Asum = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = range(0, N)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var i = _step.value;
      Asum[i] = A[i] + (i === 0 ? 0 : Asum[i - 1]);
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

  var ls = [-1];
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = range(1, N - 2)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _i = _step2.value;

      if (_i === 1) {
        ls.push(0);
        continue;
      }

      for (var l = ls[_i - 1]; l < _i; l++) {
        var keep = Math.abs(Asum[l] - (Asum[_i] - Asum[l]));
        var move = Math.abs(Asum[l + 1] - (Asum[_i] - Asum[l + 1]));

        if (keep < move || l === _i - 1) {
          ls.push(l);
          break;
        }
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

  ls.push(-1);
  var rs = [-1];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = range(1, N - 2)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _i2 = _step3.value;

      if (_i2 === 1) {
        rs.push(N - 2);
        continue;
      }

      var j = N - 2 - _i2;

      for (var r = rs[_i2 - 1]; r > j; r--) {
        var _keep = Math.abs(Asum[r] - Asum[j] - (Asum[N - 1] - Asum[r]));

        var _move = Math.abs(Asum[r - 1] - Asum[j] - (Asum[N - 1] - Asum[r - 1]));

        if (_keep < _move || r === j + 1) {
          rs.push(r);
          break;
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

  rs.push(-1);
  rs.reverse(); // console.log(ls, rs);

  var mm = Infinity;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = range(1, N - 2)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _i3 = _step4.value;
      var li = ls[_i3];
      var ri = rs[_i3];
      var p = Asum[li];
      var q = Asum[_i3] - Asum[li];

      var _r = Asum[ri] - Asum[_i3];

      var s = Asum[N - 1] - Asum[ri];
      var min = Math.min(p, q, _r, s);
      var max = Math.max(p, q, _r, s);
      mm = Math.min(mm, max - min);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  console.log(mm);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

function splitNum(line) {
  return line.split(/\s+/).map(function (n) {
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
