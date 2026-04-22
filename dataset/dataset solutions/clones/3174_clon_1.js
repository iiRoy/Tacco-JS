"use strict"
/* This is a strict mode declaration.
   It helps to write more secure JavaScript code. */


 function _toConsumableArray(arr) {
  /* This utility function converts an array-like or iterable
     into a real array. Used for spread syntax. */
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread() ;
 }

function _nonIterableSpread()
{ // Throws an error for invalid spread attempts.
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _arrayWithoutHoles(arr) {
  if ( Array.isArray(arr) ) {
    for ( var i = 0, arr2 = new Array(arr.length); i < arr.length; i++ ) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

function _classCallCheck(instance, Constructor) {
  /* Ensures an instance is created with 'new' keyword. */
  if ( !(instance instanceof Constructor) )
  {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for ( var i = 0; i < props.length; i++ ) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ( "value" in descriptor ) {
      descriptor.writable = true;
    }
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _toArray(arr) {
  // Converts an iterable to an array, or throws if not iterable.
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
}

function _iterableToArray(iter) {
  // Checks if an object is iterable and converts it to an array.
  if ( Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]" )
  {
    return Array.from(iter);
  }
}

function _slicedToArray(arr, i) {
  /* Used for destructuring assignment from an array. */
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
    for ( var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true ) {
      _arr.push(_s.value);
      if ( i && _arr.length === i ) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if ( !_n && _i["return"] != null ) {
        _i["return"]();
      }
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if ( Array.isArray(arr) ) return arr;
}

function _main() {
  /* This is the main entry point for the program logic. */
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
      for (
          var _iterator = range(0, Math.pow(4, N))[Symbol.iterator](), _step;
          !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
          _iteratorNormalCompletion = true
      ) {
        var usage = _step.value;
        var al = [],
            bl = [],
            cl = [];
        var cnt = 0;

        while ( usage > 0 ) {
          var i = usage % 4;
          [[], al, bl, cl][i].push(l[cnt]);
          usage >>= 2; // Right bit shift by 2
          cnt++;
        }

        if ( al.length === 0 || bl.length === 0 || cl.length === 0 ) {
          // If any of the lists are empty, this combination is invalid.
          continue;
        }

        var sum = mp(al, A) + mp(bl, B) + mp(cl, C);

        if ( min > sum ) {
          min = sum;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if ( !_iteratorNormalCompletion && _iterator.return != null ) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    console.log(min); // Output the minimum cost found.


    function mp(l, target) {
      var mp = (l.length - 1) * 10; // Cost for combining bamboos.
      var len = l.reduce(function (a, b) {
        return a + b;
      }, 0); // Total length of combined bamboos.
      return mp + Math.abs(len - target); // Total cost for this set.
    }
  })(require("fs").readFileSync("/dev/stdin", "utf8"));


  function splitNum(line) {
    /* Helper function to parse numbers from a line or array of lines. */
    return (Array.isArray(line) ? line : line.split(/\s+/)).map(function (n) {
      return parseInt(n);
    });
  }

  /**
   * Iterates over integers in [start, end).
   * This is a generator function.
   */
  function* range(start, end) {
    for ( var i = start; i < end; i++ ) {
      yield i;
    }
  }

  /*
   * The following section includes a custom implementation for
   * arbitrary-precision unsigned integers, named 'Longer'.
   * This class is not directly used in the main problem logic
   * but is part of the provided utility code.
   */
  var Longer =
  /*#__PURE__*/
  function () {
    function Longer(value) {
      _classCallCheck(this, Longer); // Ensure constructor is called with 'new'.

      // enough for 64bit
      this.data = [0, 0, 0];
      var idx = 0;

      while ( value !== 0 ) {
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

        for ( ; idx < max; idx++ ) {
          var sum = (this.data[idx] || 0) + (right.data[idx] || 0) + carry;
          result.data[idx] = sum % Longer.border;
          carry = Math.floor(sum / Longer.border);
        }

        if ( carry > 0 ) {
          result.data[idx] = carry;
        }

        return result;
      }
    }, {
      key: "mul",
      value: function mul(right) {
        var result = new Longer(0);

        for ( var lidx = 0; lidx < this.data.length; lidx++ ) {
          for ( var ridx = 0; ridx < right.data.length; ridx++ ) {
            var me = this.data[lidx] * right.data[ridx];
            var tidx = lidx + ridx;
            var value = me;

            while ( value > 0 ) {
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
        var d = this.data.concat().reverse(); // Create a reversed copy of the data.

        // let fsti = d.findIndex(v => v !== 0);
        var fsti = function (arr, pred) {
          for ( var i = 0; i < arr.length; i++ ) {
            if ( pred(arr[i], i) ) {
              return i;
            }
          }

          return null;
        } // not full polyfill!
        (d, function (v) {
          return v !== 0;
        });

        if ( fsti == null ) {
          return "0";
        }

        return d.slice(fsti).map(function (v, i) {
          if ( i === 0 ) {
            return String(v);
          } else {
            // return String(v).padStart(Longer.digits, "0");
            return padStart(String(v), Longer.digits, "0");
          }
        }).join("");

        function padStart(str, num, pad) {
          var n = num - str.length;
          var result = "";

          for ( var i = 0; i < n; i++ ) {
            result += pad;
          }

          return result + str;
        }
      }
    }]);

    return Longer;
  }();
  /** digits per element. This determines the base for calculations. */
  Longer.digits = 7;
  Longer.border = Math.pow(10, Longer.digits);

  /*
   * Note: There was a commented section for a 'range' function for
   * descending order, but it was empty. It's removed as per Type I
   * clone rules allowing comment modification/removal.
   */
  // ----------
}

_main(); // Execute the main function.