!(function (e) {
  var t = {};
  function n(r) {
    if (t[r]) return t[r].exports;
    var u = (t[r] = { i: r, l: !1, exports: {} });
    e[r].call(u.exports, u, u.exports, n);
    u.l = !0;
    return u.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function (e, t, r) {
      if (!n.o(e, t)) Object.defineProperty(e, t, { enumerable: !0, get: r });
    }),
    (n.r = function (e) {
      if ("undefined" != typeof Symbol && Symbol.toStringTag)
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" });
      Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.t = function (e, t) {
      if (1 & t) e = n(e);
      if (8 & t) return e;
      if (4 & t && "object" == typeof e && e && e.__esModule) return e;
      var r = Object.create(null);
      n.r(r);
      Object.defineProperty(r, "default", { enumerable: !0, value: e });
      if (2 & t && "string" != typeof e)
        for (var u in e)
          n.d(
            r,
            u,
            function (t) {
              return e[t];
            }.bind(null, u),
          );
      return r;
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      n.d(t, "a", t);
      return t;
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = ""),
    n((n.s = 1));
})([
  function (e, t, n) {
    "use strict";
    var r =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        },
      u =
        (this && this.__importStar) ||
        function (e) {
          if (e && e.__esModule) return e;
          var t = {};
          if (null != e)
            for (var n in e) Object.hasOwnProperty.call(e, n) && (t[n] = e[n]);
          t.default = e;
          return t;
        };
    Object.defineProperty(t, "__esModule", { value: !0 });
    var i = r(n(3)),
      o = u(n(4));
    (t.paizaInput = function () {
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      var e = [],
        t = o.createInterface({ input: process.stdin, output: process.stdout });
      t.on("line", function (t) {
        e[e.length] = t;
      });
      return new Promise(function (n) {
        t.on("close", function () {
          n(e);
        });
      });
    }),
      (t.hackerRankInput = function () {
        process.stdin.resume();
        process.stdin.setEncoding("ascii");
        var e = "";
        return (
          process.stdin.on("data", function (t) {
            e += t;
          }),
          new Promise(function (t) {
            process.stdin.on("end", function () {
              t(e.split("\n"));
            });
          })
        );
      }),
      (t.atcoderInput = function () {
        return i.default.readFileSync("/dev/stdin", "utf8");
      });
  },
  function (e, t, n) {
    "use strict";
    var r =
        (this && this.__awaiter) ||
        function (e, t, n, r) {
          return new (n || (n = Promise))(function (u, i) {
            function o(e) {
              try {
                c(r.next(e));
              } catch (e) {
                i(e);
              }
            }
            function a(e) {
              try {
                c(r.throw(e));
              } catch (e) {
                i(e);
              }
            }
            function c(e) {
              e.done
                ? u(e.value)
                : new n(function (t) {
                    t(e.value);
                  }).then(o, a);
            }
            c((r = r.apply(e, t || [])).next());
          });
        },
      u =
        (this && this.__generator) ||
        function (e, t) {
          var n,
            r,
            u,
            i,
            o = {
              label: 0,
              sent: function () {
                if (1 & u[0]) throw u[1];
                return u[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (i = { next: a(0), throw: a(1), return: a(2) }),
            "function" == typeof Symbol &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function a(i) {
            return function (a) {
              return (function (i) {
                if (n) throw new TypeError("Generator is already executing.");
                for (; o; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (u =
                          2 & i[0]
                            ? r.return
                            : i[0]
                              ? r.throw || ((u = r.return) && u.call(r), 0)
                              : r.next) &&
                        !(u = u.call(r, i[1])).done)
                    )
                      return u;
                    switch (((r = 0), u && (i = [2 & i[0], u.value]), i[0])) {
                      case 0:
                      case 1:
                        u = i;
                        break;
                      case 4:
                        return o.label++, { value: i[1], done: !1 };
                      case 5:
                        o.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        i = o.ops.pop();
                        o.trys.pop();
                        continue;
                      default:
                        if (
                          !(u = (u = o.trys).length > 0 && u[u.length - 1]) &&
                          (6 === i[0] || 2 === i[0])
                        ) {
                          o = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!u || (i[1] > u[0] && i[1] < u[3]))
                        ) {
                          o.label = i[1];
                          break;
                        }
                        if (6 === i[0] && o.label < u[1]) {
                          o.label = u[1];
                          u = i;
                          break;
                        }
                        if (u && o.label < u[2]) {
                          o.label = u[2];
                          o.ops.push(i);
                          break;
                        }
                        u[2] && o.ops.pop();
                        o.trys.pop();
                        continue;
                    }
                    i = t.call(e, o);
                  } catch (e) {
                    i = [6, e];
                    r = 0;
                  } finally {
                    n = u = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, a]);
            };
          }
        },
      i =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
    Object.defineProperty(t, "__esModule", { value: !0 });
    var o = i(n(2)),
      a = n(0);
    !(function () {
      r(this, void 0, void 0, function () {
        var e, t, n;
        return u(this, function (r) {
          switch (r.label) {
            case 0:
              return [4, a.paizaInput()];
            case 1:
              return (
                (e = r.sent()),
                (t = o.default.beginner_contest_126.b),
                (n = t(e)),
                n.forEach(function (e) {
                  console.log(e);
                }),
                [2]
              );
          }
        });
      });
    })();
  },
  function (e, t, n) {
    "use strict";
    Object.defineProperty(t, "__esModule", { value: !0 });
    function r(e) {
      return 1 <= e && e <= 12;
    }
    var u = {
      beginner_contest_126: {
        b: function (e) {
          var t = String(e[0]).trim(),
            n = Number(t.slice(0, 2)),
            u = Number(t.slice(2, 4)),
            i = r(n),
            o = r(u),
            a;
          if (i && o) {
            a = "AMBIGUOUS";
          } else if (!i && o) {
            a = "YYMM";
          } else if (i && !o) {
            a = "MMYY";
          } else {
            a = "NA";
          }
          return [a];
        },
      },
    };
    t.default = u;
  },
  function (e, t) {
    e.exports = require("fs");
  },
  function (e, t) {
    e.exports = require("readline");
  },
]);