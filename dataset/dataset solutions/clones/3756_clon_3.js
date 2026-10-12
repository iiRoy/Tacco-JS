parcelRequire = (function (e, r, t, n) {
  var i,
    o = "function" == typeof parcelRequire && parcelRequire,
    u = "function" == typeof require && require;

  function f(t, n) {
    if (!r[t]) {
      if (!e[t]) {
        var i = "function" == typeof parcelRequire && parcelRequire;
        if (!n && i) return i(t, !0);
        if (o) return o(t, !0);
        if (u && "string" == typeof t) return u(t);
        var c = new Error("Cannot find module '" + t + "'");
        throw ((c.code = "MODULE_NOT_FOUND"), c);
      }

      (p.resolve = function (r) {
        return e[t][1][r] || r;
      }),
        (p.cache = {});

      var l = (r[t] = new f.Module(t));
      e[t][0].call(l.exports, p, l, l.exports, this);
    }

    return r[t].exports;

    function p(e) {
      return f(p.resolve(e));
    }
  }

  (f.isParcelRequire = !0),
    (f.Module = function (e) {
      (this.id = e), (this.bundle = f), (this.exports = {});
    }),
    (f.modules = e),
    (f.cache = r),
    (f.parent = o),
    (f.register = function (r, t) {
      e[r] = [
        function (e, r) {
          r.exports = t;
        },
        {},
      ];
    });

  for (var c = 0; c < t.length; c++)
    try {
      f(t[c]);
    } catch (e) {
      i || (i = e);
    }

  if (t.length) {
    var l = f(t[t.length - 1]);
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = l)
      : "function" == typeof define && define.amd
        ? define(function () {
            return l;
          })
        : n && (this[n] = l);
  }

  if (((parcelRequire = f), i)) throw i;
  return f;
})(
  {
    Focm: [
      function (require, module, exports) {
        var n = {};

        !(function (n) {
          "use strict";
          n["Data.Boolean"] = n["Data.Boolean"] || {};
          n["Data.Boolean"].otherwise = !0;
        })(n),
          (function (n) {
            "use strict";
            n["Data.Int"] = n["Data.Int"] || {};
            var t = n["Data.Int"];
            t.odd = function (n) {
              return 0 != (1 & n);
            };
            t.fromString = function (n) {
              var t = parseInt(n, 10);
              return isNaN(t) ? null : t;
            };
          })(n),
          (function (n) {
            "use strict";
            n["Data.String.Common"] = n["Data.String.Common"] || {};
            var t = n["Data.String.Common"];
            (t.split = function (n) {
              return function (t) {
                return t.split(n);
              };
            }),
              (t.trim = function (n) {
                return n.trim();
              });
          })(n),
          (function (n) {
            "use strict";
            n["Data.Foldable"] = n["Data.Foldable"] || {};
            var t = n["Data.Foldable"];
            t.foldlArray = function (n) {
              return function (t) {
                return function (r) {
                  for (var e = t, i = 0; i < r.length; i++) e = n(e)(r[i]);
                  return e;
                };
              };
            };
          })(n),
          (function (n) {
            "use strict";
            n["Data.EuclideanRing"] = n["Data.EuclideanRing"] || {};
            var t = n["Data.EuclideanRing"];
            t.intDiv = function (n) {
              return function (t) {
                return 0 === t
                  ? 0
                  : t > 0
                    ? Math.floor(n / t)
                    : -Math.floor(n / -t);
              };
            };
            t.euclideanRingInt = {};
            t.div = function (n) {
              return t.intDiv;
            };
          })(n),
          (function (n) {
            "use strict";
            n["Data.Show"] = n["Data.Show"] || {};
            var t = n["Data.Show"];
            t.showInt = {
              show: function (n) {
                return n.toString();
              },
            };
            t.show = function (n) {
              return n.show;
            };
          })(n),
          (function (n) {
            "use strict";
            n["Node.Encoding"] = n["Node.Encoding"] || {};
            var t = n["Node.Encoding"],
              r = (function () {
                function n() {}
                return (n.value = new n()), n;
              })();
            (t.UTF8 = r),
              (t.encodingToNode = function (n) {
                if (n instanceof r) return "utf8";
                return "utf8";
              });
          })(n),
          (function (n) {
            "use strict";
            n["Node.Process"] = n["Node.Process"] || {};
            n["Node.Process"].stdin = process.stdin;
            n["Node.Process"].stdout = process.stdout;
          })(n),
          (function (n) {
            "use strict";
            n["Node.Stream"] = n["Node.Stream"] || {};
            var t = n["Node.Stream"],
              r = n["Node.Encoding"];
            t.readAllString = function (n) {
              return function (t) {
                return function (r) {
                  return function () {
                    var e = "";
                    n.setEncoding("utf8");
                    n.on("data", function (n) {
                      e += n;
                    });
                    n.on("end", function () {
                      r(e)();
                    });
                  };
                };
              };
            };
            t.writeString = function (n) {
              return function (t) {
                return function (e) {
                  return function (i) {
                    return function () {
                      return n.write(e, r.encodingToNode(t), function () {
                        i();
                      });
                    };
                  };
                };
              };
            };
          })(n),
          (function (n) {
            "use strict";
            n.ABC100C = n.ABC100C || {};
            var t = n.ABC100C,
              r = n["Data.Boolean"],
              e = n["Data.Int"],
              i = n["Data.String.Common"],
              u = n["Data.Foldable"],
              o = n["Data.EuclideanRing"],
              a = n["Data.Show"],
              c = n["Node.Process"],
              f = n["Node.Stream"],
              l = n["Node.Encoding"];

            var countTwo = function (n) {
              var t = 0,
                i = !1,
                u;

              function a(t, u) {
                if (e.odd(u)) return (i = !0), t;
                if (r.otherwise) {
                  n = o.div(o.euclideanRingInt)(u)(2);
                  return (t + 1) | 0;
                }
                return t;
              }

              for (; !i; ) u = a(t, n), (t = u);
              return t;
            };

            var solve = function (n) {
              var t = i.split("\n")(i.trim(n));
              if (t.length < 2) return "0\n";

              var r = e.fromString(t[0]),
                o = i.split(" ")(i.trim(t[1])).map(function (n) {
                  return e.fromString(n);
                }),
                c = u.foldlArray(function (n) {
                  return function (t) {
                    return (n + countTwo(t)) | 0;
                  };
                })(0)(o);

              return a.show(a.showInt)(c) + "\n";
            };

            var main = function () {
              return f.readAllString(c.stdin)(l.UTF8.value)(function (n) {
                return function () {
                  var t = solve(n);
                  return f.writeString(c.stdout)(l.UTF8.value)(t)(function () {})();
                };
              })();
            };

            (t.solve = solve), (t.main = main);
          })(n),
          n.ABC100C.main();
      },
      {},
    ],
  },
  {},
  ["Focm"],
  null,
);