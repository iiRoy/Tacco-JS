!(function (modules) {
  var cache = {};
  function load(id) {
    if (cache[id]) return cache[id].exports;
    var record = (cache[id] = { i: id, l: !1, exports: {} });
    return modules[id].call(record.exports, record, record.exports, load), (record.l = !0), record.exports;
  }
  (load.m = modules),
    (load.c = cache),
    (load.d = function (target, key, getter) {
      load.o(target, key) || Object.defineProperty(target, key, { enumerable: !0, get: getter });
    }),
    (load.r = function (target) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(target, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(target, "__esModule", { value: !0 });
    }),
    (load.t = function (value, mode) {
      if ((1 & mode && (value = load(value)), 8 & mode)) return value;
      if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
      var namespace = Object.create(null);
      if (
        (load.r(namespace),
        Object.defineProperty(namespace, "default", { enumerable: !0, value: value }),
        2 & mode && "string" != typeof value)
      )
        for (var prop in value)
          load.d(
            namespace,
            prop,
            function (mode) {
              return value[mode];
            }.bind(null, prop),
          );
      return namespace;
    }),
    (load.n = function (value) {
      var getter =
        value && value.__esModule
          ? function () {
              return value.default;
            }
          : function () {
              return value;
            };
      return load.d(getter, "a", getter), getter;
    }),
    (load.o = function (target, key) {
      return Object.prototype.hasOwnProperty.call(target, key);
    }),
    (load.p = ""),
    load((load.s = 15));
})({
  0: function (module, exports, require) {
    "use strict";
    var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (value) {
                reject(value);
              }
            }
            function rejected(value) {
              try {
                step(generator.throw(value));
              } catch (value) {
                reject(value);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : new P(function (resolve) {
                    resolve(result.value);
                  }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        },
      __generator =
        (this && this.__generator) ||
        function (thisArg, body) {
          var state,
            y,
            t,
            g,
            context = {
              label: 0,
              sent: function () {
                if (1 & t[0]) throw t[1];
                return t[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            "function" == typeof Symbol &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function verb(n) {
            return function (v) {
              return (function (op) {
                if (state) throw new TypeError("Generator is already executing.");
                for (; context; )
                  try {
                    if (
                      ((state = 1),
                      y &&
                        (t =
                          2 & op[0]
                            ? y.return
                            : op[0]
                              ? y.throw || ((t = y.return) && t.call(y), 0)
                              : y.next) &&
                        !(t = t.call(y, op[1])).done)
                    )
                      return t;
                    switch (((y = 0), t && (op = [2 & op[0], t.value]), op[0])) {
                      case 0:
                      case 1:
                        t = op;
                        break;
                      case 4:
                        return context.label++, { value: op[1], done: !1 };
                      case 5:
                        context.label++, (y = op[1]), (op = [0]);
                        continue;
                      case 7:
                        (op = context.ops.pop()), context.trys.pop();
                        continue;
                      default:
                        if (
                          !(t = (t = context.trys).length > 0 && t[t.length - 1]) &&
                          (6 === op[0] || 2 === op[0])
                        ) {
                          context = 0;
                          continue;
                        }
                        if (
                          3 === op[0] &&
                          (!t || (op[1] > t[0] && op[1] < t[3]))
                        ) {
                          context.label = op[1];
                          break;
                        }
                        if (6 === op[0] && context.label < t[1]) {
                          (context.label = t[1]), (t = op);
                          break;
                        }
                        if (t && context.label < t[2]) {
                          (context.label = t[2]), context.ops.push(op);
                          break;
                        }
                        t[2] && context.ops.pop(), context.trys.pop();
                        continue;
                    }
                    op = body.call(thisArg, context);
                  } catch (err) {
                    (op = [6, err]), (y = 0);
                  } finally {
                    state = t = 0;
                  }
                if (5 & op[0]) throw op[1];
                return { value: op[0] ? op[1] : void 0, done: !0 };
              })([n, v]);
            };
          }
        },
      __importDefault =
        (this && this.__importDefault) ||
        function (mod) {
          return mod && mod.__esModule ? mod : { default: mod };
        },
      root = this;
    exports.__esModule = !0;
    var fsModule = __importDefault(require(1));
    function tokenGenerator(source) {
      var tokens, index;
      return __generator(this, function (ctx) {
        switch (ctx.label) {
          case 0:
            (tokens = source.split(/\s+/).filter(function (text) {
              return text.length > 0;
            })),
              (index = 0),
              (ctx.label = 1);
          case 1:
            return index < tokens.length ? [4, tokens[index]] : [3, 4];
          case 2:
            ctx.sent(), (ctx.label = 3);
          case 3:
            return index++, [3, 1];
          case 4:
            return [2];
        }
      });
    }
    (exports.readInput = function () {
      return new Promise(function (resolve, reject) {
        fsModule.default.readFile("/dev/stdin", "utf8", function (err, data) {
          err ? reject(err) : resolve(data);
        });
      });
    }),
      (exports.getFoolIterator = tokenGenerator),
      (exports.getFoolNextInt = function () {
        return __awaiter(root, void 0, void 0, function () {
          var text, iterator;
          return __generator(this, function (ctx) {
            switch (ctx.label) {
              case 0:
                return [4, exports.readInput()];
              case 1:
                return (
                  (text = ctx.sent()),
                  (iterator = tokenGenerator(text)),
                  [
                    2,
                    function () {
                      return parseInt(iterator.next().value);
                    },
                  ]
                );
            }
          });
        });
      }),
      (exports.getChottoMashinaNext = function () {
        return __awaiter(root, void 0, void 0, function () {
          var source, iterator;
          return __generator(this, function (ctx) {
            switch (ctx.label) {
              case 0:
                return [4, exports.readInput()];
              case 1:
                return (
                  (source = ctx.sent()),
                  (iterator = (function () {
                    var start, cursor, chunk;
                    return __generator(this, function (ctx2) {
                      switch (ctx2.label) {
                        case 0:
                          (start = -1), (cursor = 0), (ctx2.label = 1);
                        case 1:
                          return cursor <= source.length
                            ? " " !== source[cursor] && "\n" !== source[cursor] && cursor !== source.length
                              ? [3, 5]
                              : -1 !== start
                                ? [3, 2]
                                : [3, 6]
                            : [3, 7];
                        case 2:
                          return (chunk = source.substring(start, cursor)), (start = -1), [4, chunk];
                        case 3:
                          ctx2.sent(), (ctx2.label = 4);
                        case 4:
                          return [3, 6];
                        case 5:
                          -1 === start && (start = cursor), (ctx2.label = 6);
                        case 6:
                          return cursor++, [3, 1];
                        case 7:
                          return [2];
                      }
                    });
                  })()),
                  [
                    2,
                    function () {
                      return iterator.next().value;
                    },
                  ]
                );
            }
          });
        });
      }),
      (exports.getChottoMashinaNextInt = function () {
        return __awaiter(root, void 0, void 0, function () {
          var nextToken;
          return __generator(this, function (ctx) {
            switch (ctx.label) {
              case 0:
                return [4, exports.getChottoMashinaNext()];
              case 1:
                return (
                  (nextToken = ctx.sent()),
                  [
                    2,
                    function () {
                      return parseInt(nextToken());
                    },
                  ]
                );
            }
          });
        });
      });
  },
  1: function (module, exports) {
    module.exports = require("fs");
  },
  15: function (module, exports, require) {
    "use strict";
    var __awaiter =
        (this && this.__awaiter) ||
        function (thisArg, _arguments, P, generator) {
          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (value) {
                reject(value);
              }
            }
            function rejected(value) {
              try {
                step(generator.throw(value));
              } catch (value) {
                reject(value);
              }
            }
            function step(result) {
              result.done
                ? resolve(result.value)
                : new P(function (resolve) {
                    resolve(result.value);
                  }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        },
      __generator =
        (this && this.__generator) ||
        function (thisArg, body) {
          var state,
            y,
            t,
            g,
            context = {
              label: 0,
              sent: function () {
                if (1 & t[0]) throw t[1];
                return t[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            "function" == typeof Symbol &&
              (g[Symbol.iterator] = function () {
                return this;
              }),
            g
          );
          function verb(n) {
            return function (v) {
              return (function (op) {
                if (state) throw new TypeError("Generator is already executing.");
                for (; context; )
                  try {
                    if (
                      ((state = 1),
                      y &&
                        (t =
                          2 & op[0]
                            ? y.return
                            : op[0]
                              ? y.throw || ((t = y.return) && t.call(y), 0)
                              : y.next) &&
                        !(t = t.call(y, op[1])).done)
                    )
                      return t;
                    switch (((y = 0), t && (op = [2 & op[0], t.value]), op[0])) {
                      case 0:
                      case 1:
                        t = op;
                        break;
                      case 4:
                        return context.label++, { value: op[1], done: !1 };
                      case 5:
                        context.label++, (y = op[1]), (op = [0]);
                        continue;
                      case 7:
                        (op = context.ops.pop()), context.trys.pop();
                        continue;
                      default:
                        if (
                          !(t = (t = context.trys).length > 0 && t[t.length - 1]) &&
                          (6 === op[0] || 2 === op[0])
                        ) {
                          context = 0;
                          continue;
                        }
                        if (
                          3 === op[0] &&
                          (!t || (op[1] > t[0] && op[1] < t[3]))
                        ) {
                          context.label = op[1];
                          break;
                        }
                        if (6 === op[0] && context.label < t[1]) {
                          (context.label = t[1]), (t = op);
                          break;
                        }
                        if (t && context.label < t[2]) {
                          (context.label = t[2]), context.ops.push(op);
                          break;
                        }
                        t[2] && context.ops.pop(), context.trys.pop();
                        continue;
                    }
                    op = body.call(thisArg, context);
                  } catch (err) {
                    (op = [6, err]), (y = 0);
                  } finally {
                    state = t = 0;
                  }
                if (5 & op[0]) throw op[1];
                return { value: op[0] ? op[1] : void 0, done: !0 };
              })([n, v]);
            };
          }
        },
      self = this;
    exports.__esModule = !0;
    var input = require(0);
    __awaiter(self, void 0, void 0, function () {
      var next, n, a, b, build, locate, order, pos, prev, nextPos, seq, cur;
      return __generator(this, function (ctx) {
        switch (ctx.label) {
          case 0:
            return [4, input.getChottoMashinaNextInt()];
          case 1:
            if (
              ((next = ctx.sent()),
              (n = next()),
              (a = next()),
              (b = next()),
              1 !==
                (function (left, right) {
                  for (var diff = 0, bit = 0; bit < n; bit++)
                    (left & (1 << bit)) != (right & (1 << bit)) && diff++;
                  return diff;
                })(a, b))
            )
              return console.log("NO"), [2];
            if (
              ((build = function (arr, bit) {
                for (var ret = new Array(2 * arr.length), idx = 0; idx < arr.length; idx++)
                  ret[idx] = arr[idx];
                var back = arr.length - 1;
                for (idx = arr.length; idx < ret.length; idx++) ret[idx] = arr[back--] + (1 << bit);
                return ret;
              }),
              (locate = function (value, arr) {
                for (var idx = 0; idx < arr.length; idx++) if (arr[idx] === value) return idx;
                return -1;
              }),
              (order = (function (limit) {
                for (var ret = [0, 1], bit = 1; bit < limit; bit++) {
                  if ((a & (1 << bit)) != (b & (1 << bit))) {
                    for (
                      var prefix = a & ((1 << bit) - 1),
                        left = function (idx) {
                          return (idx - 1 + ret.length) % ret.length;
                        },
                        tmp = [],
                        cursor = left(locate(prefix, ret));
                      ret[cursor] !== prefix;
                      cursor = left(cursor)
                    )
                      tmp.push(ret[cursor]);
                    tmp.push(prefix), (ret = tmp);
                  }
                  ret = build(ret, bit);
                }
                return ret;
              })(n)),
              (pos = locate(a, order)),
              (nextPos = function (idx) {
                return (idx - 1 + order.length) % order.length;
              }),
              (seq = (prev = function (idx) {
                return (idx + 1) % order.length;
              })(pos)),
              (cur = nextPos(pos)),
              order[seq] === b)
            ) {
              for (ret = [], idx = pos; idx !== seq; idx = nextPos(idx)) ret.push(order[idx]);
              ret.push(b), console.log("YES"), console.log(ret.join(" "));
            } else if (order[cur] === b) {
              for (ret = [], idx = pos; idx !== cur; idx = prev(idx)) ret.push(order[idx]);
              ret.push(b), console.log("YES"), console.log(ret.join(" "));
            } else console.log("NO");
            return [2];
        }
      });
    });
  },
});