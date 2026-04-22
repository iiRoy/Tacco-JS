"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _main() {
  // ----------
  (function (input) {
    var lines = input.split("\n");

    var _splitNum = splitNum(lines[0]),
        _splitNum2 = _slicedToArray(_splitNum, 3),
        N = _splitNum2[0],
        M = _splitNum2[1],
        Q = _splitNum2[2];

    var trains = lines.slice(1, M + 1).map(function (line) {
      var _splitNum3 = splitNum(line),
          _splitNum4 = _slicedToArray(_splitNum3, 2),
          l = _splitNum4[0],
          r = _splitNum4[1];

      return {
        l,
        r
      };
    });
    var queries = lines.slice(M + 1).map(function (line) {
      var _splitNum5 = splitNum(line),
          _splitNum6 = _slicedToArray(_splitNum5, 2),
          p = _splitNum6[0],
          q = _splitNum6[1];

      return {
        p,
        q
      };
    }).slice(0, Q);
    sortByKey(trains, ["r", "l"]);
    var sum = [[]];
    var cnt = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = range(1, N + 1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var r = _step.value;
        var rsum = [0];
        var c = 0;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = range(1, N + 1)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var l = _step3.value;

            for (; cnt < M && (trains[cnt].r < r || trains[cnt].r === r && trains[cnt].l < l); cnt++) {}

            for (; cnt < M && trains[cnt].r === r && trains[cnt].l === l; cnt++) {
              c++;
            }

            rsum.push(c);
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

        sum.push(rsum);
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = queries[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _step2$value = _step2.value,
            p = _step2$value.p,
            q = _step2$value.q;
        var result = 0;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = range(p, q + 1)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _r = _step4.value;
            result += sum[_r][q] - sum[_r][p - 1];
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

        console.log(result);
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
  })(require("fs").readFileSync("/dev/stdin", "utf8"));

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


  /**
   * Sort given array with keys.
   * sortByKey(arr, ['key1', 'key2'])
   * sortByKey(arr, [['key1', -1], 'key2'])
   */
  function sortByKey(arr, keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    return arr.sort(function (a, b) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = keys[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var k = _step5.value;

          if ("string" === typeof k) {
            var d = a[k] - b[k];

            if (d !== 0) {
              return d;
            }
          } else {
            var _d2 = a[k[0]] - b[k[0]];

            var sig = k[1] === "desc" ? -1 : k[1] === "asc" ? 1 : Number(k[1]);

            if (_d2 !== 0) {
              return _d2 * sig;
            }
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return 0;
    });
  }
  /**
   * Runs a recursive function expressed as a generator function.
   */
  // ----------

}

_main();
