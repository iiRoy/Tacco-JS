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

function _mainClone() {
  // ----------
  function splitNum(line) {
    return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
      var parsed = parseInt(n);
      return parsed;
    });
  }
  /**
   * Iterates over integers in [start, end).
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
      var baseUnit = Longer.border;

      while (value !== 0) {
        var currentPart = value % baseUnit;
        this.data[idx] = currentPart;
        value = Math.floor(value / baseUnit);
        idx = idx + 1;
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
          var leftPart = this.data[idx] || 0;
          var rightPart = right.data[idx] || 0;
          var sum = leftPart + rightPart + carry;
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
            var leftDigit = this.data[lidx];
            var rightDigit = right.data[ridx];
            var me = leftDigit * rightDigit;
            var tidx = lidx + ridx;
            var value = me;

            while (value > 0) {
              var previousValue = result.data[tidx] || 0;
              var sum = previousValue + value;
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

        var visibleDigits = d.slice(fsti);
        var stringParts = visibleDigits.map(function (v, i) {
          if (i === 0) {
            return String(v);
          } else {
            // return String(v).padStart(Longer.digits, "0");
            return padStart(String(v), Longer.digits, "0");
          }
        });
        return stringParts.join("");

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
   * UnionFind of integers in [0, N).
   * */

  var UnionFind =
  /*#__PURE__*/
  function () {
    function UnionFind(N) {
      _classCallCheck(this, UnionFind);

      this.nodes = new Array(N).fill(null).map(function () {
        return {
          parent: null,

          /**
           * size of set.
           * meaningless if not root
           */
          size: 1
        };
      });
    }
    /**
     * Find the root of element.
     */


    _createClass(UnionFind, [{
      key: "find",
      value: function find(elm) {
        var node = this.nodes[elm];
        var route = [];

        while (node.parent != null) {
          route.push(node);
          node = node.parent;
        }

        for (var _i2 = 0; _i2 < route.length; _i2++) {
          var r = route[_i2];
          r.parent = node;
        }

        return node;
      }
      /**
       * Union two sets.
       * @returns new root of merged set.
       */

    }, {
      key: "union",
      value: function union(elm1, elm2) {
        var node1 = this.find(elm1);
        var node2 = this.find(elm2);

        if (node1 === node2) {
          return;
        }

        node2.parent = node1;
        node1.size += node2.size;
        return node1;
      }
    }]);

    return UnionFind;
  }();
  /**
   * Runs a recursive function expressed as a generator function.
   */


  // ----------
  (function (input) {
    var lines = input.split("\n");

    var _splitNum = splitNum(lines[0]),
        _splitNum2 = _slicedToArray(_splitNum, 2),
        N = _splitNum2[0],
        M = _splitNum2[1];

    var bridges = lines.slice(1, M + 1).map(function (line) {
      var _splitNum3 = splitNum(line),
          _splitNum4 = _slicedToArray(_splitNum3, 2),
          A = _splitNum4[0],
          B = _splitNum4[1];

      var bridge = {
        A: A,
        B: B
      };
      return bridge;
    });
    var results = [];
    bridges.reverse();
    var sets = new UnionFind(N);
    var pnum = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = bridges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _step.value,
            A = _step$value.A,
            B = _step$value.B;
        results.push(pnum);
        var leftIndex = A - 1;
        var rightIndex = B - 1;
        var n1 = sets.find(leftIndex);
        var n2 = sets.find(rightIndex);

        if (n1 === n2) {
          //nothing happened.
          continue;
        }

        var addedPairs = n1.size * n2.size;
        pnum += addedPairs;
        sets.union(leftIndex, rightIndex);
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

    results.reverse();
    var res = results.map(function (p) {
      var totalPairs = N * (N - 1) / 2;
      return totalPairs - p;
    });
    res.forEach(function (v) {
      return console.log(v);
    });
  })(require("fs").readFileSync("/dev/stdin", "utf8"));
}

_mainClone();
