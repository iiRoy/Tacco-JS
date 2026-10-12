module.exports = (function (e) {
  var r = {};
  function t(n) {
    if (r[n]) return r[n].exports;
    var o = (r[n] = { i: n, l: !1, exports: {} });
    return e[n].call(o.exports, o, o.exports, t), (o.l = !0), o.exports;
  }
  return (
    (t.m = e),
    (t.c = r),
    (t.d = function (e, r, n) {
      t.o(e, r) || Object.defineProperty(e, r, { enumerable: !0, get: n });
    }),
    (t.r = function (e) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (t.t = function (e, r) {
      if ((1 & r && (e = t(e)), 8 & r)) return e;
      if (4 & r && "object" == typeof e && e && e.__esModule) return e;
      var n = Object.create(null);
      if (
        (t.r(n),
        Object.defineProperty(n, "default", { enumerable: !0, value: e }),
        2 & r && "string" != typeof e)
      )
        for (var o in e)
          t.d(
            n,
            o,
            function (r) {
              return e[r];
            }.bind(null, o),
          );
      return n;
    }),
    (t.n = function (e) {
      var r =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return t.d(r, "a", r), r;
    }),
    (t.o = function (e, r) {
      return Object.prototype.hasOwnProperty.call(e, r);
    }),
    (t.p = ""),
    t((t.s = 0))
  );
})([
  function (e, r, t) {
    t(1)(t(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  function (e, r) {
    function t(e, r) {
      return (
        (function (e) {
          if (Array.isArray(e)) return e;
        })(e) ||
        (function (e, r) {
          var t = [],
            n = !0,
            o = !1,
            u = void 0;
          try {
            for (
              var i, l = e[Symbol.iterator]();
              !(n = (i = l.next()).done) &&
              (t.push(i.value), !r || t.length !== r);
              n = !0
            );
          } catch (e) {
            (o = !0), (u = e);
          } finally {
            try {
              n || null == l.return || l.return();
            } finally {
              if (o) throw u;
            }
          }
          return t;
        })(e, r) ||
        (function () {
          throw new TypeError(
            "Invalid attempt to destructure non-iterable instance",
          );
        })()
      );
    }
    e.exports = function (e) {
      var r = t(
          e[0].split(" ").map(function (e) {
            return Number(e);
          }),
          3,
        ),
        n = r[0],
        o = r[1],
        u = r[2];
      n != u || 0 != o
        ? n < u && n + o >= u
          ? console.log("YES")
          : console.log("NO")
        : console.log("YES");
    };
  },
  function (e, r) {
    e.exports = require("fs");
  },
]);
