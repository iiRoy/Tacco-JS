/*!
 * path: atcoder/abc155/d
 * URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 */ !(function (e) {
  var r = {};
  function t(n) {
    if (r[n]) return r[n].exports;
    var o = (r[n] = { i: n, l: !1, exports: {} });
    e[n].call(o.exports, o, o.exports, t);
    o.l = !0;
    return o.exports;
  }
  (t.m = e),
    (t.c = r),
    (t.d = function (e, r, n) {
      if (!t.o(e, r)) Object.defineProperty(e, r, { enumerable: !0, get: n });
    }),
    (t.r = function (e) {
      if ("undefined" != typeof Symbol && Symbol.toStringTag)
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" });
      Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (t.t = function (e, r) {
      if (1 & r) e = t(e);
      if (8 & r) return e;
      if (4 & r && "object" == typeof e && e && e.__esModule) return e;
      var n = Object.create(null);
      t.r(n);
      Object.defineProperty(n, "default", { enumerable: !0, value: e });
      if (2 & r && "string" != typeof e)
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
      t.d(r, "a", r);
      return r;
    }),
    (t.o = function (e, r) {
      return Object.prototype.hasOwnProperty.call(e, r);
    }),
    (t.p = ""),
    t((t.s = 0));
})([
  function (e, r, t) {
    "use strict";
    var n =
      (this && this.__importDefault) ||
      function (e) {
        return e && e.__esModule ? e : { default: e };
      };
    r.__esModule = !0;
    var o = n(t(1)),
      i = t(2);
    o.default.readFile("/dev/stdin", "utf8", function (e, r) {
      var n = new i.Solver(),
        o = n.parse(r),
        s = n.solve(o);
      n.print(s);
    });
  },
  function (e, r) {
    e.exports = require("fs");
  },
  function (e, r, t) {
    "use strict";
    var n,
      o =
        (this && this.__extends) ||
        ((n = function (e, r) {
          return (n =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (e, r) {
                e.__proto__ = r;
              }) ||
            function (e, r) {
              for (var t in r) if (r.hasOwnProperty(t)) e[t] = r[t];
            })(e, r);
        }),
        function (e, r) {
          function t() {
            this.constructor = e;
          }
          n(e, r);
          e.prototype =
            null === r ? Object.create(r) : ((t.prototype = r.prototype), new t());
        }),
      i =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
    r.__esModule = !0;
    var s = t(3),
      u = t(4),
      f = i(t(5)),
      c = (function (e) {
        function r() {
          return (null !== e && e.apply(this, arguments)) || this;
        }
        return (
          o(r, e),
          (r.prototype.solve = function (e) {
            var r = e.N,
              t = e.K,
              n = e.A;
            n.sort(function (e, r) {
              return e < r ? -1 : e > r ? 1 : 0;
            });
            for (var o = new Array(r), i = 0; i < r; i++)
              o[i] = new f.default(n[i]);

            function countLE(e) {
              var t = 0;
              for (var i = 0; i < r; i++) {
                if (o[i].lt(0)) {
                  var s = i,
                    u = r;
                  while (u - s > 1) {
                    var f = ((s + u) / 2) | 0;
                    o[i].mul(o[f]).lte(e) ? (u = f) : (s = f);
                  }
                  t += r - u;
                } else if (o[i].gt(0)) {
                  s = i;
                  u = r;
                  while (u - s > 1) {
                    f = ((s + u) / 2) | 0;
                    o[i].mul(o[f]).lte(e) ? (s = f) : (u = f);
                  }
                  t += s - i;
                } else if (e.gte(0)) {
                  t += r - i - 1;
                }
              }
              return t;
            }

            for (
              var c = new f.default("-1000000000000000001"),
                l = new f.default("1000000000000000001"),
                a = new f.default(1);
              l.minus(c).gt(a);

            ) {
              var h = l.plus(c).div(2).round();
              countLE(h) < t ? (c = h) : (l = h);
            }
            return { answer: l };
          }),
          (r.prototype.parse = function (e) {
            for (
              var r = u.getSpaceIterator(e, function (e) {
                  return e;
                }),
                t = parseInt(r.next().value, 10),
                n = parseInt(r.next().value, 10),
                o = [],
                i = 0;
              i < t;
              i++
            )
              o.push(r.next().value);
            return { N: t, K: n, A: o };
          }),
          (r.prototype.print = function (e) {
            console.log(e.answer.toString());
          }),
          r
        );
      })(s.SolverBase);
    r.Solver = c;
  },
  function (e, r, t) {
    "use strict";
    r.__esModule = !0;
    var n = function () {};
    r.SolverBase = n;
  },
  function (e, r, t) {
    "use strict";
    r.__esModule = !0;
    r.getSpaceIterator = function (e, r) {
      var t = 0,
        n = e.trim().split(/\s+/).map(function (e) {
          return r(e);
        });
      return {
        next: function () {
          return { value: n[t++], done: t > n.length };
        },
      };
    };
  },
  function (e, r, t) {
    "use strict";
    t.r(r);
    t.d(r, "Big", function () {
      return s;
    });
    function s(e) {
      if (!(this instanceof s)) return new s(e);
      if (e instanceof s) this.v = e.v;
      else this.v = BigInt(e);
    }
    s.prototype.plus = function (e) {
      return new s(this.v + new s(e).v);
    };
    s.prototype.minus = function (e) {
      return new s(this.v - new s(e).v);
    };
    s.prototype.mul = function (e) {
      return new s(this.v * new s(e).v);
    };
    s.prototype.div = function (e) {
      return new s(this.v / new s(e).v);
    };
    s.prototype.round = function () {
      return new s(this.v);
    };
    s.prototype.lt = function (e) {
      return this.v < new s(e).v;
    };
    s.prototype.lte = function (e) {
      return this.v <= new s(e).v;
    };
    s.prototype.gt = function (e) {
      return this.v > new s(e).v;
    };
    s.prototype.gte = function (e) {
      return this.v >= new s(e).v;
    };
    s.prototype.toString = function () {
      return this.v.toString();
    };
    r.default = s;
  },
]);