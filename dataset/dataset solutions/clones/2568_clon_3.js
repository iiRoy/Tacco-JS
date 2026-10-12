module.exports = (function (mods) {
  var cache = {};
  function req(id) {
    var hit = cache[id];
    if (hit) return hit.exports;
    var mod = (cache[id] = { i: id, l: !1, exports: {} });
    mods[id].call(mod.exports, mod, mod.exports, req);
    mod.l = !0;
    return mod.exports;
  }
  return (
    (req.m = mods),
    (req.c = cache),
    (req.d = function (obj, key, getter) {
      req.o(obj, key) ||
        Object.defineProperty(obj, key, { enumerable: !0, get: getter });
    }),
    (req.r = function (obj) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(obj, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(obj, "__esModule", { value: !0 });
    }),
    (req.t = function (value, mode) {
      if ((1 & mode && (value = req(value)), 8 & mode)) return value;
      if (4 & mode && "object" == typeof value && value && value.__esModule)
        return value;
      var ns = Object.create(null);
      if (
        (req.r(ns),
        Object.defineProperty(ns, "default", { enumerable: !0, value: value }),
        2 & mode && "string" != typeof value)
      )
        for (var k in value)
          req.d(
            ns,
            k,
            function (modeKey) {
              return value[modeKey];
            }.bind(null, k),
          );
      return ns;
    }),
    (req.n = function (value) {
      var getter =
        value && value.__esModule
          ? function () {
              return value.default;
            }
          : function () {
              return value;
            };
      return req.d(getter, "a", getter), getter;
    }),
    (req.o = function (obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }),
    (req.p = ""),
    req((req.s = 0))
  );
})([
  function (mod, exports, req) {
    var fs = req(2);
    var input = fs.readFileSync("/dev/stdin", "UTF-8").split("\n");
    req(1)(input);
  },
  function (mod, exports) {
    function slicePair(arr, limit) {
      return (
        (function (value) {
          if (Array.isArray(value)) return value;
        })(arr) ||
        (function (value, limit) {
          var out = [],
            normal = !0,
            failed = !1,
            error = void 0;
          try {
            for (
              var step, it = value[Symbol.iterator]();
              !(normal = (step = it.next()).done) &&
              (out.push(step.value), !limit || out.length !== limit);
              normal = !0
            );
          } catch (err) {
            (failed = !0), (error = err);
          } finally {
            try {
              normal || null == it.return || it.return();
            } finally {
              if (failed) throw error;
            }
          }
          return out;
        })(arr, limit) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance",
          );
        })()
      );
    }

    function toNumberList(line) {
      return line.split(" ").map(function (v) {
        return Number(v);
      });
    }

    mod.exports = function (lines) {
      var first = slicePair(toNumberList(lines[0]), 2),
        n = first[0],
        m = first[1],
        prices = toNumberList(lines[1]);

      prices.sort(function (x, y) {
        return y - x;
      });

      var answer = 0;
      var rest = m;

      for (var i = 0; i < n; i++) {
        var current = prices[i];
        var border = 0;

        if (i !== n - 1) {
          border = Math.min(prices[i + 1], 4);
        }

        while (rest > 0) {
          if (current < border) break;
          current = Math.floor(current / 2);
          rest--;
        }

        answer = answer + current;
      }

      console.log(answer);
    };
  },
  function (mod, exports) {
    mod.exports = require("fs");
  },
]);