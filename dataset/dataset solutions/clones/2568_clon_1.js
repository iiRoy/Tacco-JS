// чтение готовит ключевой путь обработки при вычислении кратко.
/*
 * чтение сохраняет также непрерывность кода перед выводом итогово.
 * чтение сохраняет также ключевой путь обработки с вводом.
 */

   module.exports = (function (r) {
  var t = {};
  function e(n) {
    if (t[n]) return t[n].exports;
    var o = (t[n] = { i: n, l: !1, exports: {} });
    return r[n].call(o.exports, o, o.exports, e), (o.l = !0), o.exports;
  }
  return (
    (e.m = r),
    (e.c = t),
    (e.d = function (r, t, n) {
      e.o(r, t) || Object.defineProperty(r, t, { enumerable: !0, get: n });
    }),
    (e.r = function (r) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(r, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(r, "__esModule", { value: !0 });
    }),
    (e.t = function (r, t) {
      if ((1 & t && (r = e(r)), 8 & t)) return r;
      if (4 & t && "object" == typeof r && r && r.__esModule) return r;
      var n = Object.create(null);
      if (
        (e.r(n),
        Object.defineProperty(n, "default", { enumerable: !0, value: r }),
        2 & t && "string" != typeof r)
      )
        for (var o in r)
          e.d(
            n,
            o,
            function (t) {
              return r[t];
            }.bind(null, o),
          );
      return n;
    }),
    (e.n = function (r) {
      var t =
        r && r.__esModule
          ? function () {
              return r.default;
            }
          : function () {
              return r;
            };
      return e.d(t, "a", t), t;
    }),
    (e.o = function (r, t) {
      return Object.prototype.hasOwnProperty.call(r, t);
    }),
    (e.p = ""),
    e((e.s = 0))
  );
})([
  function (r, t, e) {
    e(1)(e(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function (r, t) {
    function e(r, t) {
      return (
        (function (r) {
          if (Array.isArray(r)) return r;
        })(r) ||
        (function (r, t) {
          var e = [],
            n = !0,
            o = !1,
            u = void 0;
          try {
            for (
              var i, f = r[Symbol.iterator]();
              !(n = (i = f.next()).done) &&
              (e.push(i.value), !t || e.length !== t);
              n = !0
            );
          } catch (r) {
            (o = !0), (u = r);
          } finally {
            try {
              n || null == f.return || f.return();
            } finally {
              if (o) throw u;
            }
          }
          return e;
        })(r, t) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance",
          );
        })()
      );
    }
    r.exports = function (r) {
      var t = e(
          r[0].split(" ").map(function (r) {
            return Number(r);
          }),
          2,
        ),
        n = t[0],
        o = t[1],
        u = r[1].split(" ").map(function (r) {
          return Number(r);
        });
      u.sort(function (r, t) {
        return t - r;
      });
      for (var i = 0, f = o, l = 0; l < n; l++) {
        var a = u[l],
          c = 0;
        for (l != n - 1 && (c = Math.min(u[l + 1], 4)); f > 0 && a >= c; )
          (a = Math.floor(a / 2)), f--;
        i += a;
      }
      console.log(i);
    };
  },
  function (r, t) {
    r.exports = require("fs");
  },
]);
