/*!
 * path: atcoder/abc155/d
 * URL: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 */ !(function (mods) {
  var cache = {};
  function req(id) {
    if (cache[id]) return cache[id].exports;
    var moduleObj = (cache[id] = { i: id, l: !1, exports: {} });
    return mods[id].call(moduleObj.exports, moduleObj, moduleObj.exports, req), (moduleObj.l = !0), moduleObj.exports;
  }
  (req.m = mods),
    (req.c = cache),
    (req.d = function (target, key, getter) {
      req.o(target, key) || Object.defineProperty(target, key, { enumerable: !0, get: getter });
    }),
    (req.r = function (target) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(target, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(target, "__esModule", { value: !0 });
    }),
    (req.t = function (value, mode) {
      if ((1 & mode && (value = req(value)), 8 & mode)) return value;
      if (4 & mode && "object" == typeof value && value && value.__esModule) return value;
      var namespace = Object.create(null);
      if (
        (req.r(namespace),
        Object.defineProperty(namespace, "default", { enumerable: !0, value: value }),
        2 & mode && "string" != typeof value)
      )
        for (var prop in value)
          req.d(
            namespace,
            prop,
            function (p) {
              return value[p];
            }.bind(null, prop),
          );
      return namespace;
    }),
    (req.n = function (moduleValue) {
      var getter =
        moduleValue && moduleValue.__esModule
          ? function () {
              return moduleValue.default;
            }
          : function () {
              return moduleValue;
            };
      return req.d(getter, "a", getter), getter;
    }),
    (req.o = function (target, key) {
      return Object.prototype.hasOwnProperty.call(target, key);
    }),
    (req.p = ""),
    req((req.s = 0));
})([
  function (moduleObj, exportsObj, req) {
    "use strict";
    var importDefault =
      (this && this.__importDefault) ||
      function (item) {
        return item && item.__esModule ? item : { default: item };
      };
    exportsObj.__esModule = !0;
    var fsMod = importDefault(req(1)),
      solverMod = req(2);
    fsMod.default.readFile("/dev/stdin", "utf8", function (err, text) {
      !(function (source) {
        var solver = new solverMod.Solver(),
          parsed = solver.parse(source),
          answer = solver.solve(parsed);
        solver.print(answer);
      })(text);
    });
  },
  function (moduleObj, exportsObj) {
    moduleObj.exports = require("fs");
  },
  function (moduleObj, exportsObj, req) {
    "use strict";
    var extendFn,
      extendHelper =
        (this && this.__extends) ||
        ((extendFn = function (child, parent) {
          return (extendFn =
            Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array &&
              function (child, parent) {
                child.__proto__ = parent;
              }) ||
            function (child, parent) {
              for (var name in parent) parent.hasOwnProperty(name) && (child[name] = parent[name]);
            })(child, parent);
        }),
        function (child, parent) {
          function Temp() {
            this.constructor = child;
          }
          extendFn(child, parent),
            (child.prototype =
              null === parent
                ? Object.create(parent)
                : ((Temp.prototype = parent.prototype), new Temp()));
        }),
      importDefault =
        (this && this.__importDefault) ||
        function (item) {
          return item && item.__esModule ? item : { default: item };
        };
    exportsObj.__esModule = !0;
    var baseModule = req(3),
      iteratorModule = req(4),
      Big = importDefault(req(5)),
      SolverClass = (function (Base) {
        function Solver() {
          return (null !== Base && Base.apply(this, arguments)) || this;
        }
        return (
          extendHelper(Solver, Base),
          (Solver.prototype.solve = function (data) {
            var N = data.N,
              K = data.K,
              A = data.A;
            A.sort(function (left, right) {
              return left - right;
            });
            for (var bigA = new Array(N), idx = 0; idx < N; idx++)
              bigA[idx] = new Big.default(A[idx]);
            var negatives = 0,
              positives = 0,
              zeros = 0;
            for (idx = 0; idx < N; idx++) A[idx] < 0 ? negatives++ : A[idx] > 0 ? positives++ : zeros++;
            for (
              var negPairs = negatives * positives,
                zeroPairs = zeros * (positives + negatives) + (zeros * (zeros - 1)) / 2,
                one = new Big.default(1),
                zero = new Big.default(0),
                low = new Big.default("-1000000000000000005"),
                high = new Big.default("1000000000000000005");
              high.minus(low).gt(one);

            ) {
              var mid = high.plus(low).div(2).round(),
                count = 0;
              if (mid.lt(zero))
                for (idx = 0; idx < N && !(A[idx] >= 0); idx++) {
                  for (var left = negatives + zeros - 1, right = N; right - left > 1; ) {
                    var center = ((left + right) / 2) | 0;
                    bigA[idx].mul(bigA[center]).lt(mid) ? (right = center) : (left = center);
                  }
                  count += N - right;
                }
              else if (mid.gt(zero)) {
                count += negPairs + zeroPairs;
                for (idx = 0; idx < N; idx++)
                  if (A[idx] < 0) {
                    for (left = idx, right = negatives; right - left > 1; ) {
                      center = ((left + right) / 2) | 0;
                      bigA[idx].mul(bigA[center]).lt(mid) ? (right = center) : (left = center);
                    }
                    count += negatives - right;
                  } else if (A[idx] > 0) {
                    for (left = idx, right = N; right - left > 1; ) {
                      center = ((left + right) / 2) | 0;
                      bigA[idx].mul(bigA[center]).lt(mid) ? (left = center) : (right = center);
                    }
                    count += left - idx;
                  }
              } else count = negPairs;
              count < K ? (low = mid) : (high = mid);
            }
            return { answer: low };
          }),
          (Solver.prototype.parse = function (text) {
            for (
              var iterator = iteratorModule.getSpaceIterator(text, function (value) {
                  return parseInt(value);
                }),
                N = iterator.next().value,
                K = iterator.next().value,
                A = [],
                idx = 0;
              idx < N;
              idx++
            )
              A.push(iterator.next().value);
            return { N: N, K: K, A: A };
          }),
          (Solver.prototype.print = function (result) {
            console.log(result.answer.toString());
          }),
          Solver
        );
      })(baseModule.SolverBase);
    exportsObj.Solver = SolverClass;
  },
  function (moduleObj, exportsObj, req) {
    "use strict";
    exportsObj.__esModule = !0;
    var SolverBase = function () {};
    exportsObj.SolverBase = SolverBase;
  },
  function (moduleObj, exportsObj, req) {
    "use strict";
    var generatorHelper =
      (this && this.__generator) ||
      function (thisArg, body) {
        var executing,
          iterator,
          op,
          state,
          gen = {
            label: 0,
            sent: function () {
              if (1 & op[0]) throw op[1];
              return op[1];
            },
            trys: [],
            ops: [],
          };
        return (
          (state = { next: verb(0), throw: verb(1), return: verb(2) }),
          "function" == typeof Symbol &&
            (state[Symbol.iterator] = function () {
              return this;
            }),
          state
        );
        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }
        function step(operation) {
          if (executing) throw new TypeError("Generator is already executing.");
          for (; gen; )
            try {
              if (
                ((executing = 1),
                iterator &&
                  (op =
                    2 & operation[0]
                      ? iterator.return
                      : operation[0]
                        ? iterator.throw || ((op = iterator.return) && op.call(iterator), 0)
                        : iterator.next) &&
                  !(op = op.call(iterator, operation[1])).done)
              )
                return op;
              switch (((iterator = 0), op && (operation = [2 & operation[0], op.value]), operation[0])) {
                case 0:
                case 1:
                  op = operation;
                  break;
                case 4:
                  return gen.label++, { value: operation[1], done: !1 };
                case 5:
                  gen.label++, (iterator = operation[1]), (operation = [0]);
                  continue;
                case 7:
                  (operation = gen.ops.pop()), gen.trys.pop();
                  continue;
                default:
                  if (
                    !(op = (op = gen.trys).length > 0 && op[op.length - 1]) &&
                    (6 === operation[0] || 2 === operation[0])
                  ) {
                    gen = 0;
                    continue;
                  }
                  if (3 === operation[0] && (!op || (operation[1] > op[0] && operation[1] < op[3]))) {
                    gen.label = operation[1];
                    break;
                  }
                  if (6 === operation[0] && gen.label < op[1]) {
                    (gen.label = op[1]), (op = operation);
                    break;
                  }
                  if (op && gen.label < op[2]) {
                    (gen.label = op[2]), gen.ops.push(operation);
                    break;
                  }
                  op[2] && gen.ops.pop(), gen.trys.pop();
                  continue;
              }
              operation = body.call(thisArg, gen);
            } catch (err) {
              (operation = [6, err]), (iterator = 0);
            } finally {
              executing = op = 0;
            }
          if (5 & operation[0]) throw operation[1];
          return { value: operation[0] ? operation[1] : void 0, done: !0 };
        }
      };
    (exportsObj.__esModule = !0),
      (exportsObj.getSpaceIterator = function (text, mapper) {
        var index, values;
        return generatorHelper(this, function (state) {
          switch (state.label) {
            case 0:
              (index = 0),
                (values = text.split(/\s+/).map(function (part) {
                  return mapper(part);
                })),
                (state.label = 1);
            case 1:
              return index < values.length ? [4, values[index]] : [3, 4];
            case 2:
              state.sent(), (state.label = 3);
            case 3:
              return index++, [3, 1];
            case 4:
              return [2, void 0];
          }
        });
      });
  },
  function (moduleObj, exportsObj, req) {
    "use strict";
    req.r(exportsObj),
      req.d(exportsObj, "Big", function () {
        return BigCtor;
      });
    var prefix = "[big.js] ",
      invalid = prefix + "Invalid ",
      invalidDP = invalid + "decimal places",
      prototype = {},
      numberRegex = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    function round(x, sd, rm, more) {
      var xc = x.c,
        i = x.e + sd + 1;
      if (i < xc.length) {
        if (1 === rm) more = xc[i] >= 5;
        else if (2 === rm)
          more =
            xc[i] > 5 ||
            (5 == xc[i] && (more || i < 0 || void 0 !== xc[i + 1] || 1 & xc[i - 1]));
        else if (3 === rm) more = more || !!xc[0];
        else if (((more = !1), 0 !== rm))
          throw Error("[big.js] Invalid rounding mode");
        if (i < 1)
          (xc.length = 1), more ? ((x.e = -sd), (xc[0] = 1)) : (xc[0] = x.e = 0);
        else {
          if (((xc.length = i--), more))
            for (; ++xc[i] > 9; ) (xc[i] = 0), i-- || (++x.e, xc.unshift(1));
          for (i = xc.length; !xc[--i]; ) xc.pop();
        }
      } else if (rm < 0 || rm > 3 || rm !== ~~rm)
        throw Error("[big.js] Invalid rounding mode");
      return x;
    }
    function stringify(x, id, dp, n) {
      var exp,
        str,
        Ctor = x.constructor,
        isZero = !x.c[0];
      if (void 0 !== dp) {
        if (dp !== ~~dp || dp < (3 == id) || dp > 1e6)
          throw Error(3 == id ? invalid + "precision" : invalidDP);
        for (
          dp = n - (x = new Ctor(x)).e,
            x.c.length > ++n && round(x, dp, Ctor.RM),
            2 == id && (n = x.e + dp + 1);
          x.c.length < n;

        )
          x.c.push(0);
      }
      if (
        ((exp = x.e),
        (dp = (str = x.c.join("")).length),
        2 != id && (1 == id || (3 == id && n <= exp) || exp <= Ctor.NE || exp >= Ctor.PE))
      )
        str =
          str.charAt(0) +
          (dp > 1 ? "." + str.slice(1) : "") +
          (exp < 0 ? "e" : "e+") +
          exp;
      else if (exp < 0) {
        for (; ++exp; ) str = "0" + str;
        str = "0." + str;
      } else if (exp > 0)
        if (++exp > dp) for (exp -= dp; exp--; ) str += "0";
        else exp < dp && (str = str.slice(0, exp) + "." + str.slice(exp));
      else dp > 1 && (str = str.charAt(0) + "." + str.slice(1));
      return x.s < 0 && (!isZero || 4 == id) ? "-" + str : str;
    }
    (prototype.abs = function () {
      var x = new this.constructor(this);
      return (x.s = 1), x;
    }),
      (prototype.cmp = function (y) {
        var i,
          x = this,
          a = x.c,
          b = (y = new x.constructor(y)).c,
          xs = x.s,
          ys = y.s,
          xe = x.e,
          ye = y.e;
        if (!a[0] || !b[0]) return a[0] ? xs : b[0] ? -ys : 0;
        if (xs != ys) return xs;
        if (((i = xs < 0), xe != ye)) return (xe > ye) ^ i ? 1 : -1;
        for (ys = (xe = a.length) < (ye = b.length) ? xe : ye, xs = -1; ++xs < ys; )
          if (a[xs] != b[xs]) return (a[xs] > b[xs]) ^ i ? 1 : -1;
        return xe == ye ? 0 : (xe > ye) ^ i ? 1 : -1;
      }),
      (prototype.div = function (y) {
        var x = this,
          Ctor = x.constructor,
          xc = x.c,
          yc = (y = new Ctor(y)).c,
          sign = x.s == y.s ? 1 : -1,
          dp = Ctor.DP;
        if (dp !== ~~dp || dp < 0 || dp > 1e6) throw Error(invalidDP);
        if (!yc[0]) throw Error("[big.js] Division by zero");
        if (!xc[0]) return new Ctor(0 * sign);
        var cmp,
          arr,
          digit,
          tmp,
          q,
          divisor = yc.slice(),
          divisorLen = (cmp = yc.length),
          dividendLen = xc.length,
          part = xc.slice(0, cmp),
          partLen = part.length,
          result = y,
          digits = (result.c = []),
          count = 0,
          limit = dp + (result.e = x.e - y.e) + 1;
        for (result.s = sign, sign = limit < 0 ? 0 : limit, divisor.unshift(0); partLen++ < cmp; ) part.push(0);
        do {
          for (digit = 0; digit < 10; digit++) {
            if (cmp != (partLen = part.length)) tmp = cmp > partLen ? 1 : -1;
            else
              for (q = -1, tmp = 0; ++q < cmp; )
                if (yc[q] != part[q]) {
                  tmp = yc[q] > part[q] ? 1 : -1;
                  break;
                }
            if (!(tmp < 0)) break;
            for (arr = partLen == cmp ? yc : divisor; partLen; ) {
              if (part[--partLen] < arr[partLen]) {
                for (q = partLen; q && !part[--q]; ) part[q] = 9;
                --part[q], (part[partLen] += 10);
              }
              part[partLen] -= arr[partLen];
            }
            for (; !part[0]; ) part.shift();
          }
          (digits[count++] = tmp ? digit : ++digit), part[0] && tmp ? (part[partLen] = xc[divisorLen] || 0) : (part = [xc[divisorLen]]);
        } while ((divisorLen++ < dividendLen || void 0 !== part[0]) && sign--);
        return (
          digits[0] || 1 == count || (digits.shift(), result.e--),
          count > limit && round(result, dp, Ctor.RM, void 0 !== part[0]),
          result
        );
      }),
      (prototype.eq = function (y) {
        return !this.cmp(y);
      }),
      (prototype.gt = function (y) {
        return this.cmp(y) > 0;
      }),
      (prototype.gte = function (y) {
        return this.cmp(y) > -1;
      }),
      (prototype.lt = function (y) {
        return this.cmp(y) < 0;
      }),
      (prototype.lte = function (y) {
        return this.cmp(y) < 1;
      }),
      (prototype.minus = prototype.sub =
        function (y) {
          var i,
            j,
            xLen,
            aLen,
            x = this,
            Ctor = x.constructor,
            sign = x.s,
            ysign = (y = new Ctor(y)).s;
          if (sign != ysign) return (y.s = -ysign), x.plus(y);
          var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;
          if (!xc[0] || !yc[0])
            return yc[0] ? ((y.s = -ysign), y) : new Ctor(xc[0] ? x : 0);
          if ((sign = xe - ye)) {
            for (
              (aLen = sign < 0) ? ((sign = -sign), (xLen = xc)) : ((ye = xe), (xLen = yc)),
                xLen.reverse(),
                ysign = sign;
              ysign--;

            )
              xLen.push(0);
            xLen.reverse();
          } else
            for (
              j = ((aLen = xc.length < yc.length) ? xc : yc).length, sign = ysign = 0;
              ysign < j;
              ysign++
            )
              if (xc[ysign] != yc[ysign]) {
                aLen = xc[ysign] < yc[ysign];
                break;
              }
          if (
            (aLen && ((xLen = xc), (xc = yc), (yc = xLen), (y.s = -y.s)),
            (ysign = (j = yc.length) - (i = xc.length)) > 0)
          )
            for (; ysign--; ) xc[i++] = 0;
          for (ysign = i; j > sign; ) {
            if (xc[--j] < yc[j]) {
              for (i = j; i && !xc[--i]; ) xc[i] = 9;
              --xc[i], (xc[j] += 10);
            }
            xc[j] -= yc[j];
          }
          for (; 0 === xc[--ysign]; ) xc.pop();
          for (; 0 === xc[0]; ) xc.shift(), --ye;
          return xc[0] || ((y.s = 1), (xc = [(ye = 0)])), (y.c = xc), (y.e = ye), y;
        }),
      (prototype.mod = function (y) {
        var result,
          x = this,
          Ctor = x.constructor,
          sign = x.s,
          ysign = (y = new Ctor(y)).s;
        if (!y.c[0]) throw Error("[big.js] Division by zero");
        return (
          (x.s = y.s = 1),
          (result = 1 == y.cmp(x)),
          (x.s = sign),
          (y.s = ysign),
          result
            ? new Ctor(x)
            : ((sign = Ctor.DP),
              (ysign = Ctor.RM),
              (Ctor.DP = Ctor.RM = 0),
              (x = x.div(y)),
              (Ctor.DP = sign),
              (Ctor.RM = ysign),
              this.minus(x.times(y)))
        );
      }),
      (prototype.plus = prototype.add =
        function (y) {
          var temp,
            x = this,
            Ctor = x.constructor,
            sign = x.s,
            ysign = (y = new Ctor(y)).s;
          if (sign != ysign) return (y.s = -ysign), x.minus(y);
          var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;
          if (!xc[0] || !yc[0]) return yc[0] ? y : new Ctor(xc[0] ? x : 0 * sign);
          if (((xc = xc.slice()), (sign = xe - ye))) {
            for (
              sign > 0 ? ((ye = xe), (temp = yc)) : ((sign = -sign), (temp = xc)), temp.reverse();
              sign--;

            )
              temp.push(0);
            temp.reverse();
          }
          for (
            xc.length - yc.length < 0 && ((temp = yc), (yc = xc), (xc = temp)),
              sign = yc.length,
              ysign = 0;
            sign;
            xc[sign] %= 10
          )
            ysign = ((xc[--sign] = xc[sign] + yc[sign] + ysign) / 10) | 0;
          for (ysign && (xc.unshift(ysign), ++ye), sign = xc.length; 0 === xc[--sign]; ) xc.pop();
          return (y.c = xc), (y.e = ye), y;
        }),
      (prototype.pow = function (exp) {
        var x = this,
          one = new x.constructor(1),
          y = one,
          negative = exp < 0;
        if (exp !== ~~exp || exp < -1e6 || exp > 1e6) throw Error(invalid + "exponent");
        for (negative && (exp = -exp); 1 & exp && (y = y.times(x)), (exp >>= 1); )
          x = x.times(x);
        return negative ? one.div(y) : y;
      }),
      (prototype.round = function (dp, rm) {
        var Ctor = this.constructor;
        if (void 0 === dp) dp = 0;
        else if (dp !== ~~dp || dp < -1e6 || dp > 1e6) throw Error(invalidDP);
        return round(new Ctor(this), dp, void 0 === rm ? Ctor.RM : rm);
      }),
      (prototype.sqrt = function () {
        var guess,
          prev,
          str,
          x = this,
          Ctor = x.constructor,
          sign = x.s,
          exp = x.e,
          half = new Ctor(0.5);
        if (!x.c[0]) return new Ctor(x);
        if (sign < 0) throw Error(prefix + "No square root");
        0 === (sign = Math.sqrt(x + "")) || sign === 1 / 0
          ? (((str = x.c.join("")).length + exp) & 1 || (str += "0"),
            (exp = (((exp + 1) / 2) | 0) - (exp < 0 || 1 & exp)),
            (guess = new Ctor(
              ((sign = Math.sqrt(str)) == 1 / 0
                ? "1e"
                : (sign = sign.toExponential()).slice(0, sign.indexOf("e") + 1)) + exp,
            )))
          : (guess = new Ctor(sign)),
          (exp = guess.e + (Ctor.DP += 4));
        do {
          (prev = guess), (guess = half.times(prev.plus(x.div(prev))));
        } while (prev.c.slice(0, exp).join("") !== guess.c.slice(0, exp).join(""));
        return round(guess, (Ctor.DP -= 4), Ctor.RM);
      }),
      (prototype.times = prototype.mul =
        function (y) {
          var tmp,
            x = this,
            Ctor = x.constructor,
            xc = x.c,
            yc = (y = new Ctor(y)).c,
            xl = xc.length,
            yl = yc.length,
            xe = x.e,
            ye = y.e;
          if (((y.s = x.s == y.s ? 1 : -1), !xc[0] || !yc[0]))
            return new Ctor(0 * y.s);
          for (
            y.e = xe + ye,
              xl < yl && ((tmp = xc), (xc = yc), (yc = tmp), (ye = xl), (xl = yl), (yl = ye)),
              tmp = new Array((ye = xl + yl));
            ye--;

          )
            tmp[ye] = 0;
          for (xe = yl; xe--; ) {
            for (yl = 0, ye = xl + xe; ye > xe; )
              (yl = tmp[ye] + yc[xe] * xc[ye - xe - 1] + yl),
                (tmp[ye--] = yl % 10),
                (yl = (yl / 10) | 0);
            tmp[ye] = (tmp[ye] + yl) % 10;
          }
          for (yl ? ++y.e : tmp.shift(), xe = tmp.length; !tmp[--xe]; ) tmp.pop();
          return (y.c = tmp), y;
        }),
      (prototype.toExponential = function (dp) {
        return stringify(this, 1, dp, dp);
      }),
      (prototype.toFixed = function (dp) {
        return stringify(this, 2, dp, this.e + dp);
      }),
      (prototype.toPrecision = function (dp) {
        return stringify(this, 3, dp, dp - 1);
      }),
      (prototype.toString = function () {
        return stringify(this);
      }),
      (prototype.valueOf = prototype.toJSON =
        function () {
          return stringify(this, 4);
        });
    var BigCtor = (function create() {
      function BigNumber(value) {
        var x = this;
        if (!(x instanceof BigNumber)) return void 0 === value ? create() : new BigNumber(value);
        value instanceof BigNumber
          ? ((x.s = value.s), (x.e = value.e), (x.c = value.c.slice()))
          : (function (x, value) {
              var e, i, n;
              if (0 === value && 1 / value < 0) value = "-0";
              else if (!numberRegex.test((value += ""))) throw Error(invalid + "number");
              (x.s = "-" == value.charAt(0) ? ((value = value.slice(1)), -1) : 1),
                (e = value.indexOf(".")) > -1 && (value = value.replace(".", ""));
              (i = value.search(/e/i)) > 0
                ? (e < 0 && (e = i),
                  (e += +value.slice(i + 1)),
                  (value = value.substring(0, i)))
                : e < 0 && (e = value.length);
              for (n = value.length, i = 0; i < n && "0" == value.charAt(i); ) ++i;
              if (i == n) x.c = [(x.e = 0)];
              else {
                for (; n > 0 && "0" == value.charAt(--n); );
                for (x.e = e - i - 1, x.c = [], e = 0; i <= n; )
                  x.c[e++] = +value.charAt(i++);
              }
            })(x, value),
          (x.constructor = BigNumber);
      }
      return (
        (BigNumber.prototype = prototype),
        (BigNumber.DP = 20),
        (BigNumber.RM = 1),
        (BigNumber.NE = -7),
        (BigNumber.PE = 21),
        (BigNumber.version = "5.2.2"),
        BigNumber
      );
    })();
    exportsObj.default = BigCtor;
  },
]);