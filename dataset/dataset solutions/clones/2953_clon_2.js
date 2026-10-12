!(function (a) {
  var b = {};
  function c(d) {
    if (b[d]) return b[d].exports;
    var f = (b[d] = { i: d, l: !1, exports: {} });
    return a[d].call(f.exports, f, f.exports, c), (f.l = !0), f.exports;
  }
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
    c((c.s = 1));
})([
  function (a, b, c) {
    "use strict";
    var d =
        (this && this.__importDefault) ||
        function (a) {
          return a && a.__esModule ? a : { default: a };
        },
      f =
        (this && this.__importStar) ||
        function (a) {
          if (a && a.__esModule) return a;
          var b = {};
          if (null != a)
            for (var c in a) Object.hasOwnProperty.call(a, c) && (b[c] = a[c]);
          return (b.default = a), b;
        };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var g = d(c(17)),
      h = f(c(18));
    (b.paizaInput = function () {
      process.stdin.resume(), process.stdin.setEncoding("utf8");
      var a = [],
        b = h.createInterface({ input: process.stdin, output: process.stdout });
      return (
        b.on("line", function (b) {
          a.push(b);
        }),
        new Promise(function (c) {
          b.on("close", function () {
            c(a);
          });
        })
      );
    }),
      (b.hackerRankInput = function () {
        process.stdin.resume(), process.stdin.setEncoding("ascii");
        var a = "";
        return (
          process.stdin.on("data", function (b) {
            a += b;
          }),
          new Promise(function (b) {
            process.stdin.on("end", function () {
              b(a.split("\n"));
            });
          })
        );
      }),
      (b.atcoderInput = function () {
        return g.default.readFileSync("/dev/stdin", "utf8");
      });
  },
  function (a, b, c) {
    "use strict";
    var d =
        (this && this.__awaiter) ||
        function (a, b, c, d) {
          return new (c || (c = Promise))(function (f, g) {
            function h(a) {
              try {
                k(d.next(a));
              } catch (a) {
                g(a);
              }
            }
            function i(a) {
              try {
                k(d.throw(a));
              } catch (a) {
                g(a);
              }
            }
            function k(a) {
              a.done
                ? f(a.value)
                : new c(function (b) {
                    b(a.value);
                  }).then(h, i);
            }
            k((d = d.apply(a, b || [])).next());
          });
        },
      f =
        (this && this.__generator) ||
        function (a, b) {
          var c,
            d,
            f,
            g,
            h = {
              label: 0,
              sent: function () {
                if (1 & f[0]) throw f[1];
                return f[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (g = { next: i(0), throw: i(1), return: i(2) }),
            "function" == typeof Symbol &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function i(g) {
            return function (i) {
              return (function (g) {
                if (c) throw new TypeError("Generator is already executing.");
                for (; h; )
                  try {
                    if (
                      ((c = 1),
                      d &&
                        (f =
                          2 & g[0]
                            ? d.return
                            : g[0]
                              ? d.throw || ((f = d.return) && f.call(d), 0)
                              : d.next) &&
                        !(f = f.call(d, g[1])).done)
                    )
                      return f;
                    switch (((d = 0), f && (g = [2 & g[0], f.value]), g[0])) {
                      case 0:
                      case 1:
                        f = g;
                        break;
                      case 4:
                        return h.label++, { value: g[1], done: !1 };
                      case 5:
                        h.label++, (d = g[1]), (g = [0]);
                        continue;
                      case 7:
                        (g = h.ops.pop()), h.trys.pop();
                        continue;
                      default:
                        if (
                          !(f = (f = h.trys).length > 0 && f[f.length - 1]) &&
                          (6 === g[0] || 2 === g[0])
                        ) {
                          h = 0;
                          continue;
                        }
                        if (
                          3 === g[0] &&
                          (!f || (g[1] > f[0] && g[1] < f[3]))
                        ) {
                          h.label = g[1];
                          break;
                        }
                        if (6 === g[0] && h.label < f[1]) {
                          (h.label = f[1]), (f = g);
                          break;
                        }
                        if (f && h.label < f[2]) {
                          (h.label = f[2]), h.ops.push(g);
                          break;
                        }
                        f[2] && h.ops.pop(), h.trys.pop();
                        continue;
                    }
                    g = b.call(a, h);
                  } catch (a) {
                    (g = [6, a]), (d = 0);
                  } finally {
                    c = f = 0;
                  }
                if (5 & g[0]) throw g[1];
                return { value: g[0] ? g[1] : void 0, done: !0 };
              })([g, i]);
            };
          }
        },
      g =
        (this && this.__importDefault) ||
        function (a) {
          return a && a.__esModule ? a : { default: a };
        };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var h = g(c(2)),
      i = c(0);
    !(function () {
      d(this, void 0, void 0, function () {
        var a;
        return f(this, function (b) {
          switch (b.label) {
            case 0:
              return [4, i.paizaInput()];
            case 1:
              return (
                (a = b.sent()),
                h.default.beginner_contest_126.b(a).forEach(function (a) {
                  return console.log(a);
                }),
                [2]
              );
          }
        });
      });
    })();
  },
  function (a, b, c) {
    "use strict";
    var d =
      (this && this.__importDefault) ||
      function (a) {
        return a && a.__esModule ? a : { default: a };
      };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var f = d(c(3)),
      g = d(c(7)),
      h = d(c(10)),
      i = d(c(13)),
      k = d(c(16)),
      l = d(c(19));
    b.default = {
      beginner_contest_122: f.default,
      beginner_contest_126: g.default,
      Diverta2019ProgrammingContest: h.default,
      GrandContest029: i.default,
      interactiveSorting: k.default,
      welcomeToAtCoder: l.default,
    };
  },
  function (a, b, c) {
    "use strict";
    var d =
      (this && this.__importDefault) ||
      function (a) {
        return a && a.__esModule ? a : { default: a };
      };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var f = d(c(4)),
      g = d(c(5)),
      h = d(c(6));
    b.default = {
      A_DoubleHelix: f.default,
      B_ATCoder: g.default,
      C_GeT_AC: h.default,
    };
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        switch (a[0]) {
          case "A":
            return ["T"];
          case "T":
            return ["A"];
          case "C":
            return ["G"];
          case "G":
            return ["C"];
          default:
            throw new Error("invalid string");
        }
      });
  },
  function (a, b, c) {
    "use strict";
    function d(a) {
      return "A" === a || "T" === a || "C" === a || "G" === a;
    }
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        for (var b = a[0], c = 0, f = 0, g = 0; f < b.length; f += 1)
          d(b[f]) ? (g += 1) : g > c && ((c = g), (g = 0));
        return g > c && (c = g), [String(c)];
      });
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        var b = a[0].split(" ").map(function (a) {
            return Number(a);
          }),
          c = (b[0], b[1], a[1]),
          d = a.slice(2).map(function (a) {
            return a.split(" ").map(function (a) {
              return Number(a);
            });
          }),
          f = c.split("").map(function (a, b, c) {
            return "A" === a && c.length > b + 1 && "C" === c[b + 1];
          });
        return d.map(function (a) {
          for (var b = a[0], c = a[1], d = 0, g = b - 1; g < c - 1; g += 1)
            f[g] && (d += 1);
          return String(d);
        });
      });
  },
  function (a, b, c) {
    "use strict";
    var d =
      (this && this.__importDefault) ||
      function (a) {
        return a && a.__esModule ? a : { default: a };
      };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var f = d(c(8)),
      g = d(c(9));
    b.default = { a: f.default, b: g.default };
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        var b = a[0].split(" ").map(function (a) {
            return Number(a);
          }),
          c = (b[0], b[1]);
        return [
          a[1]
            .split("")
            .map(function (a, b) {
              return b === c - 1 ? a.toLowerCase() : a;
            })
            .join(""),
        ];
      });
  },
  function (a, b, c) {
    "use strict";
    function d(a) {
      return 1 <= a && a <= 12;
    }
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        var b = a[0],
          c = Number(b.slice(0, 2)),
          f = Number(b.slice(2, 4)),
          g = d(c),
          h = d(f);
        return g && h
          ? ["AMBIGUOUS"]
          : !g && h
            ? ["YYMM"]
            : g && !h
              ? ["MMYY"]
              : ["NA"];
      });
  },
  function (a, b, c) {
    "use strict";
    var d =
      (this && this.__importDefault) ||
      function (a) {
        return a && a.__esModule ? a : { default: a };
      };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var f = d(c(11)),
      g = d(c(12));
    b.default = { c: f.default, d: g.default };
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        a[0].split(" ").map(function (a) {
          return Number(a);
        })[0];
        var b = a.slice(1),
          c = 0,
          d = 0,
          f = 0,
          g = 0;
        return (
          b.forEach(function (a, b) {
            "B" === a[0] && (f += 1),
              "A" === a[a.length - 1] && (d += 1),
              "B" === a[0] && "A" === a[a.length - 1] && (g += 1),
              (c += (a.match(/AB/g) || []).length);
          }),
          d - g == 0 && f - g == 0
            ? [String(c + g - 1)]
            : [String(d < f ? d + c : f + c)]
        );
      });
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        for (
          var b = a[0].split(" ").map(function (a) {
              return Number(a);
            })[0],
            c = 0,
            d = Math.sqrt(b),
            f = 1;
          f < d;
          f += 1
        ) {
          var g = (b - f) / f;
          Number.isInteger(g) && (c += g);
        }
        return [String(c)];
      });
  },
  function (a, b, c) {
    "use strict";
    var d =
      (this && this.__importDefault) ||
      function (a) {
        return a && a.__esModule ? a : { default: a };
      };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var f = d(c(14)),
      g = d(c(15));
    b.default = { AIrreversibleOperation: f.default, BPowerOfTwo: g.default };
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 });
    var d = !0,
      f = !1;
    function g(a) {
      var b = (function (a) {
        for (var b = [], c = 0; c < a.length - 1; c += 1)
          a[c] === d && a[c + 1] === f && b.push(c);
        return b;
      })(a);
      return 0 === b.length
        ? 0
        : 1 +
            Math.max.apply(
              Math,
              b.map(function (b) {
                return g(
                  (function (a, b) {
                    var c = a.concat();
                    return (c[b] = !c[b]), (c[b + 1] = !c[b + 1]), c;
                  })(a, b),
                );
              }),
            );
    }
    b.default = function (a) {
      return [
        g(
          a[0].split("").map(function (a) {
            return "B" === a;
          }),
        ),
      ];
    };
  },
  function (a, b, c) {
    "use strict";
    function d(a) {
      return a.length < 2
        ? 0
        : Math.max.apply(
            Math,
            a.map(function (b, c) {
              var f = a.filter(function (a, b) {
                return b !== c;
              });
              return Math.max.apply(
                Math,
                f.map(function (a, c) {
                  return (function (a, b) {
                    var c = a + b;
                    return 0 == (c & (c - 1));
                  })(b, a)
                    ? d(
                        f.filter(function (a, b) {
                          return b !== c;
                        }),
                      ) + 1
                    : 0;
                }),
              );
            }),
          );
    }
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        Number(a[0]);
        var b = (function (a) {
            var b = a.filter(function (a) {
                return a % 2 == 1;
              }),
              c = a.filter(function (a) {
                return a % 2 == 0;
              });
            return { odds: b, evens: c };
          })(
            a[1].split(" ").map(function (a) {
              return Number(a);
            }),
          ),
          c = b.odds,
          f = b.evens;
        return [d(c) + d(f)];
      });
  },
  function (a, b, c) {
    "use strict";
    var d =
        (this && this.__awaiter) ||
        function (a, b, c, d) {
          return new (c || (c = Promise))(function (f, g) {
            function h(a) {
              try {
                k(d.next(a));
              } catch (a) {
                g(a);
              }
            }
            function i(a) {
              try {
                k(d.throw(a));
              } catch (a) {
                g(a);
              }
            }
            function k(a) {
              a.done
                ? f(a.value)
                : new c(function (b) {
                    b(a.value);
                  }).then(h, i);
            }
            k((d = d.apply(a, b || [])).next());
          });
        },
      f =
        (this && this.__generator) ||
        function (a, b) {
          var c,
            d,
            f,
            g,
            h = {
              label: 0,
              sent: function () {
                if (1 & f[0]) throw f[1];
                return f[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (g = { next: i(0), throw: i(1), return: i(2) }),
            "function" == typeof Symbol &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function i(g) {
            return function (i) {
              return (function (g) {
                if (c) throw new TypeError("Generator is already executing.");
                for (; h; )
                  try {
                    if (
                      ((c = 1),
                      d &&
                        (f =
                          2 & g[0]
                            ? d.return
                            : g[0]
                              ? d.throw || ((f = d.return) && f.call(d), 0)
                              : d.next) &&
                        !(f = f.call(d, g[1])).done)
                    )
                      return f;
                    switch (((d = 0), f && (g = [2 & g[0], f.value]), g[0])) {
                      case 0:
                      case 1:
                        f = g;
                        break;
                      case 4:
                        return h.label++, { value: g[1], done: !1 };
                      case 5:
                        h.label++, (d = g[1]), (g = [0]);
                        continue;
                      case 7:
                        (g = h.ops.pop()), h.trys.pop();
                        continue;
                      default:
                        if (
                          !(f = (f = h.trys).length > 0 && f[f.length - 1]) &&
                          (6 === g[0] || 2 === g[0])
                        ) {
                          h = 0;
                          continue;
                        }
                        if (
                          3 === g[0] &&
                          (!f || (g[1] > f[0] && g[1] < f[3]))
                        ) {
                          h.label = g[1];
                          break;
                        }
                        if (6 === g[0] && h.label < f[1]) {
                          (h.label = f[1]), (f = g);
                          break;
                        }
                        if (f && h.label < f[2]) {
                          (h.label = f[2]), h.ops.push(g);
                          break;
                        }
                        f[2] && h.ops.pop(), h.trys.pop();
                        continue;
                    }
                    g = b.call(a, h);
                  } catch (a) {
                    (g = [6, a]), (d = 0);
                  } finally {
                    c = f = 0;
                  }
                if (5 & g[0]) throw g[1];
                return { value: g[0] ? g[1] : void 0, done: !0 };
              })([g, i]);
            };
          }
        };
    Object.defineProperty(b, "__esModule", { value: !0 });
    var g = c(0);
    function h(a) {
      return d(this, void 0, void 0, function () {
        var b, c, d, g, i, k;
        return f(this, function (f) {
          switch (f.label) {
            case 0:
              return 1 === a.length
                ? [2, a]
                : ((b = a.slice(0, Math.ceil(a.length / 2))),
                  (c = a.slice(Math.ceil(a.length / 2))),
                  [4, h(b)]);
            case 1:
              return (d = f.sent()), [4, h(c)];
            case 2:
              (g = f.sent()), (i = []), (f.label = 3);
            case 3:
              return d.length > 0 && g.length > 0 ? [4, k(d[0], g[0])] : [3, 5];
            case 4:
              return (
                (k = f.sent() ? d.shift() : g.shift()) && i.push(k), [3, 3]
              );
            case 5:
              return i.push.apply(i, d.concat(g)), [2, i];
          }
        });
      });
    }
    function k(a, b) {
      return d(this, void 0, void 0, function () {
        return f(this, function (c) {
          switch (c.label) {
            case 0:
              return console.log("? " + a + " " + b), [4, g.atcoderInput()];
            case 1:
              return [2, "<" === c.sent()];
          }
        });
      });
    }
    b.default = function (a) {
      return d(this, void 0, void 0, function () {
        var b, c, d;
        return f(this, function (f) {
          switch (f.label) {
            case 0:
              return (
                (b = a[0].split(" ").map(function (a) {
                  return Number(a);
                })),
                (c = b[0]),
                b[1],
                (d = "A".charCodeAt(0)),
                [
                  4,
                  h(
                    Array.apply(null, new Array(c)).map(function (a, b) {
                      return String.fromCharCode(d + b);
                    }),
                  ),
                ]
              );
            case 1:
              return [2, ["! " + f.sent().join("")]];
          }
        });
      });
    };
  },
  function (a, b) {
    a.exports = require("fs");
  },
  function (a, b) {
    a.exports = require("readline");
  },
  function (a, b, c) {
    "use strict";
    Object.defineProperty(b, "__esModule", { value: !0 }),
      (b.default = function (a) {
        var b = Number(a[0]),
          c = a[1].split(" ").map(function (a) {
            return Number(a);
          });
        return [b + c[0] + c[1] + " " + a[2]];
      });
  },
]);