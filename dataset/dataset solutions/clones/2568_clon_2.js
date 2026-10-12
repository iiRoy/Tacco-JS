module.exports = (function (a) {
  var b = {};
  function c(d) {
    if (b[d]) return b[d].exports;
    var f = (b[d] = { i: d, l: !1, exports: {} });
    return a[d].call(f.exports, f, f.exports, c), (f.l = !0), f.exports;
  }
  return (
    (c.m = a),
    (c.c = b),
    (c.d = function (a, b, d) {
      c.o(a, b) || Object.defineProperty(a, b, { enumerable: !0, get: d });
    }),
    (c.r = function (a) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(a, "__esModule", { value: !0 });
    }),
    (c.t = function (a, b) {
      if ((1 & b && (a = c(a)), 8 & b)) return a;
      if (4 & b && "object" == typeof a && a && a.__esModule) return a;
      var d = Object.create(null);
      if (
        (c.r(d),
        Object.defineProperty(d, "default", { enumerable: !0, value: a }),
        2 & b && "string" != typeof a)
      )
        for (var f in a)
          c.d(
            d,
            f,
            function (b) {
              return a[b];
            }.bind(null, f),
          );
      return d;
    }),
    (c.n = function (a) {
      var b =
        a && a.__esModule
          ? function () {
              return a.default;
            }
          : function () {
              return a;
            };
      return c.d(b, "a", b), b;
    }),
    (c.o = function (a, b) {
      return Object.prototype.hasOwnProperty.call(a, b);
    }),
    (c.p = ""),
    c((c.s = 0))
  );
})([
  function (a, b, c) {
    c(1)(c(2).readFileSync("/dev/stdin", "utf8").split("\n"));
  },
  function (a, b) {
    function c(a, b) {
      return (
        (function (a) {
          if (Array.isArray(a)) return a;
        })(a) ||
        (function (a, b) {
          var c = [],
            d = !0,
            f = !1,
            g = void 0;
          try {
            for (
              var h, i = a[Symbol.iterator]();
              !(d = (h = i.next()).done) &&
              (c.push(h.value), !b || c.length !== b);
              d = !0
            );
          } catch (a) {
            (f = !0), (g = a);
          } finally {
            try {
              d || null == i.return || i.return();
            } finally {
              if (f) throw g;
            }
          }
          return c;
        })(a, b) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance",
          );
        })()
      );
    }
    a.exports = function (a) {
      var b = c(
          a[0].split(" ").map(function (a) {
            return Number(a);
          }),
          2,
        ),
        d = b[0],
        f = b[1],
        g = a[1].split(" ").map(function (a) {
          return Number(a);
        });
      g.sort(function (a, b) {
        return b - a;
      });
      for (var h = 0, i = f, j = 0; j < d; j++) {
        var k = g[j],
          l = 0;
        for (j != d - 1 && (l = Math.min(g[j + 1], 4)); i > 0 && k >= l; )
          (k = Math.floor(k / 2)), i--;
        h += k;
      }
      console.log(h);
    };
  },
  function (a, b) {
    a.exports = require("fs");
  },
]);