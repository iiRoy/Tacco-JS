"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

!function () {
  var BIT =
  /*#__PURE__*/
  function () {
    function BIT(N) {
      _classCallCheck(this, BIT);

      this.N = N;
      this.data = new Array(N + 1).fill(0);
    }

    _createClass(BIT, [{
      key: "add",
      value: function add(x, v) {
        for (var i = x; i <= this.N; i += x & -x) {
          this.data[i] += v;
        }
      }
    }, {
      key: "sum",
      value: function (x) {
        var sum = 0;

        for (var i = x; i > 0; i -= x & -x) {
          sum += this.data[i];
        }

        return sum;
      }
    }]);

    return BIT;
  }();

  var Compressor =
  /*#__PURE__*/
  function () {
    function Compressor(xs) {
      _classCallCheck(this, Compressor);

      xs.sort(function (a, b) {
        return a - b;
      });
      var l = xs.length;
      this.min = xs[0];
      this.max = xs[l - 1];
      var to = new Array(l);
      var from = new Map();
      var dataNumber = 0;
      var last = null;

      for (var i = 0; i < l; i++) {
        var x = xs[i];
        if (last !== x) dataNumber++;
        to[i] = x;
        from.set(x, i);
        last = x;
      }

      this.toArray = to;
      this.fromMap = from;
      this.dataNumber = dataNumber;
    }

    _createClass(Compressor, [{
      key: "to",
      value: function to(i) {
        return this.toArray[i];
      }
    }, {
      key: "from",
      value: function from(x) {
        return this.fromMap.get(x);
      }
    }]);

    return Compressor;
  }();

  function splitNum(line) {
    return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
      return parseInt(n);
    });
  }

  !function (input) {
    var lines = input.split("\n");

    var _splitNum = splitNum(lines[0]),
        _splitNum2 = _slicedToArray(_splitNum, 1),
        Q = _splitNum2[0];

    var query = lines.slice(1, Q + 1).map(function (line) {
      var _splitNum3 = splitNum(line),
          _splitNum4 = _slicedToArray(_splitNum3, 3),
          t = _splitNum4[0],
          a = _splitNum4[1],
          b = _splitNum4[2];

      return {
        t: t,
        a: a,
        b: b
      };
    });
    var xs = query.filter(function (_ref) {
      var t = _ref.t;
      return 1 === t;
    }).map(function (_ref2) {
      var a = _ref2.a;
      return a;
    });
    var c = new Compressor(xs);
    var data = new BIT(c.dataNumber);
    var minValue = 0,
        minPoint = null;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _step$value = _step.value,
            t = _step$value.t,
            a = _step$value.a,
            b = _step$value.b;

        if (1 === t) {
          var prevMin = 0 === data.sum(minPoint) ? minPoint + 1 : minPoint;
          var ai = c.from(a) + 1;
          data.add(1, -1);
          data.add(ai, 2);
          if (null == minPoint) minValue = b;else minValue += Math.abs(a - c.to(prevMin)) + b;
          minPoint = getMinPoint();
        } else console.log(`${c.to(minPoint)} ${minValue}`);
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

    function getMinPoint() {
      var start = 1,
          end = c.dataNumber + 1;

      for (; start < end;) {
        var center = Math.floor((start + end) / 2);
        var s = data.sum(center);
        if (s > 0) end = center;else if (0 === s) {
          start = center;
          break;
        } else start = center + 1;
      }

      return start - 1;
    }
  }(require("fs").readFileSync("/dev/stdin", "utf8"));
}();
