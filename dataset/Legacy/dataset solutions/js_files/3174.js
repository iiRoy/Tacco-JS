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

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _main() {
  // ----------
  (function (input) {
    var lines = input.split("\n");

    var _splitNum = splitNum(lines[0]),
        _splitNum2 = _slicedToArray(_splitNum, 4),
        N = _splitNum2[0],
        A = _splitNum2[1],
        B = _splitNum2[2],
        C = _splitNum2[3];

    var l = splitNum(lines.slice(1).slice(0, N));
    var min = Infinity;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = range(0, Math.pow(4, N))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var usage = _step.value;
        var al = [],
            bl = [],
            cl = [];
        var cnt = 0;

        while (usage > 0) {
          var i = usage % 4;
          [[], al, bl, cl][i].push(l[cnt]);
          usage >>= 2;
          cnt++;
        }

        if (al.length === 0 || bl.length === 0 || cl.length === 0) {
          continue;
        }

        var sum = mp(al, A) + mp(bl, B) + mp(cl, C);

        if (min > sum) {
          min = sum;
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

    console.log(min);

    function mp(l, target) {
      var mp = (l.length - 1) * 10;
      var len = l.reduce(function (a, b) {
        return a + b;
      }, 0);
      return mp + Math.abs(len - target);
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
   * implementation of arbitrary-precision unsigned integer.
   */
  var Longer =
  /*#__PURE__*/
  function () {
    function Longer(value) {
      _classCallCheck(this, Longer);

      // enough for 64bit
      this.data = [0, 0, 0];
      var idx = 0;

      while (value !== 0) {
        this.data[idx] = value % Longer.border;
        value = Math.floor(value / Longer.border);
        idx++;
      }
    }

    _createClass(Longer, [{
      key: "add",
      value: function add(right) {
        var result = new Longer(0);
        var max = Math.max(this.data.length, right.data.length);
        var carry = 0;
        var idx = 0;

        for (; idx < max; idx++) {
          var sum = (this.data[idx] || 0) + (right.data[idx] || 0) + carry;
          result.data[idx] = sum % Longer.border;
          carry = Math.floor(sum / Longer.border);
        }

        if (carry > 0) {
          result.data[idx] = carry;
        }

        return result;
      }
    }, {
      key: "mul",
      value: function mul(right) {
        var result = new Longer(0);

        for (var lidx = 0; lidx < this.data.length; lidx++) {
          for (var ridx = 0; ridx < right.data.length; ridx++) {
            var me = this.data[lidx] * right.data[ridx];
            var tidx = lidx + ridx;
            var value = me;

            while (value > 0) {
              var sum = (result.data[tidx] || 0) + value;
              result.data[tidx] = sum % Longer.border;
              value = Math.floor(sum / Longer.border);
              tidx++;
            }
          }
        }

        return result;
      }
    }, {
      key: "toString",
      value: function toString() {
        var d = this.data.concat().reverse(); // let fsti = d.findIndex(v => v !== 0);

        var fsti = function (arr, pred) {
          for (var i = 0; i < arr.length; i++) {
            if (pred(arr[i], i)) {
              return i;
            }
          }

          return null;
        } // not full polyfill!
        (d, function (v) {
          return v !== 0;
        });

        if (fsti == null) {
          return "0";
        }

        return d.slice(fsti).map(function (v, i) {
          if (i === 0) {
            return String(v);
          } else {
            // return String(v).padStart(Longer.digits, "0");
            return padStart(String(v), Longer.digits, "0");
          }
        }).join("");

        function padStart(str, num, pad) {
          var n = num - str.length;
          var result = "";

          for (var i = 0; i < n; i++) {
            result += pad;
          }

          return result + str;
        }
      }
    }]);

    return Longer;
  }();
  /** digits per element. */


  Longer.digits = 7;
  Longer.border = Math.pow(10, Longer.digits);
  /**
   * Runs a recursive function expressed as a generator function.
   */
  // ----------
}

_main();
