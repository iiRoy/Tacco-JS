parcelRequire = (function (modules, cache, entries, globalName) {
  var error,
    previousRequire = "function" == typeof parcelRequire && parcelRequire,
    nativeRequire = "function" == typeof require && require;
  function localRequire(id, jumped) {
    if (!cache[id]) {
      if (!modules[id]) {
        var oldRequire = "function" == typeof parcelRequire && parcelRequire;
        if (!jumped && oldRequire) return oldRequire(id, !0);
        if (previousRequire) return previousRequire(id, !0);
        if (nativeRequire && "string" == typeof id) return nativeRequire(id);
        var err = new Error("Cannot find module '" + id + "'");
        throw ((err.code = "MODULE_NOT_FOUND"), err);
      }
      (resolver.resolve = function (name) {
        return modules[id][1][name] || name;
      }),
        (resolver.cache = {});
      var moduleObject = (cache[id] = new localRequire.Module(id));
      modules[id][0].call(moduleObject.exports, resolver, moduleObject, moduleObject.exports, this);
    }
    return cache[id].exports;
    function resolver(moduleName) {
      return localRequire(resolver.resolve(moduleName));
    }
  }
  (localRequire.isParcelRequire = !0),
    (localRequire.Module = function (id) {
      (this.id = id), (this.bundle = localRequire), (this.exports = {});
    }),
    (localRequire.modules = modules),
    (localRequire.cache = cache),
    (localRequire.parent = previousRequire),
    (localRequire.register = function (id, value) {
      modules[id] = [
        function (require, module) {
          module.exports = value;
        },
        {},
      ];
    });
  for (var idx = 0; idx < entries.length; idx++)
    try {
      localRequire(entries[idx]);
    } catch (caught) {
      error || (error = caught);
    }
  if (entries.length) {
    var exported = localRequire(entries[entries.length - 1]);
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = exported)
      : "function" == typeof define && define.amd
        ? define(function () {
            return exported;
          })
        : globalName && (this[globalName] = exported);
  }
  if (((parcelRequire = localRequire), error)) throw error;
  return localRequire;
})(
  {
    Focm: [
      function (require, module, exports) {
        var PS = {};
        !(function (scope) {
          "use strict";
          (PS["Control.Apply"] = PS["Control.Apply"] || {}).arrayApply =
            function (fs) {
              return function (xs) {
                for (
                  var flen = fs.length,
                    xlen = xs.length,
                    out = new Array(flen * xlen),
                    p = 0,
                    i = 0;
                  i < flen;
                  i++
                )
                  for (var fn = fs[i], j = 0; j < xlen; j++) out[p++] = fn(xs[j]);
                return out;
              };
            };
        })(),
          (function (scope) {
            "use strict";
            scope["Control.Semigroupoid"] = scope["Control.Semigroupoid"] || {};
            var mod = scope["Control.Semigroupoid"],
              Semigroupoid = function (compose) {
                this.compose = compose;
              },
              semigroupoidFn = new Semigroupoid(function (f) {
                return function (g) {
                  return function (x) {
                    return f(g(x));
                  };
                };
              });
            (mod.compose = function (dict) {
              return dict.compose;
            }),
              (mod.Semigroupoid = Semigroupoid),
              (mod.semigroupoidFn = semigroupoidFn);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Control.Category"] = scope["Control.Category"] || {};
            var mod = scope["Control.Category"],
              sg = scope["Control.Semigroupoid"],
              Category = function (Semigroupoid0, identity) {
                (this.Semigroupoid0 = Semigroupoid0), (this.identity = identity);
              },
              categoryFn = new Category(
                function () {
                  return sg.semigroupoidFn;
                },
                function (x) {
                  return x;
                },
              );
            (mod.Category = Category),
              (mod.identity = function (dict) {
                return dict.identity;
              }),
              (mod.categoryFn = categoryFn);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Function"] = scope["Data.Function"] || {};
            var mod = scope["Data.Function"];
            (mod.flip = function (f) {
              return function (a) {
                return function (b) {
                  return f(b)(a);
                };
              };
            }),
              (mod.const = function (x) {
                return function (y) {
                  return x;
                };
              });
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Data.Functor"] = PS["Data.Functor"] || {}).arrayMap = function (
              fn,
            ) {
              return function (arr) {
                for (var len = arr.length, out = new Array(len), i = 0; i < len; i++)
                  out[i] = fn(arr[i]);
                return out;
              };
            };
          })(),
          (function (scope) {
            "use strict";
            (PS["Data.Unit"] = PS["Data.Unit"] || {}).unit = {};
          })(),
          (function (scope) {
            "use strict";
            scope["Data.Unit"] = scope["Data.Unit"] || {};
            var a = scope["Data.Unit"],
              b = scope["Data.Unit"];
            a.unit = b.unit;
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Functor"] = scope["Data.Functor"] || {};
            var mod = scope["Data.Functor"],
              self = scope["Data.Functor"],
              fn = scope["Data.Function"],
              unit = scope["Data.Unit"],
              Functor = function (map) {
                this.map = map;
              },
              map = function (dict) {
                return dict.map;
              },
              functorArray = new Functor(self.arrayMap);
            (mod.Functor = Functor),
              (mod.map = map),
              (mod.void = function (dict) {
                return map(dict)(fn.const(unit.unit));
              }),
              (mod.functorArray = functorArray);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Control.Apply"] = scope["Control.Apply"] || {};
            var mod = scope["Control.Apply"],
              self = scope["Control.Apply"],
              cat = scope["Control.Category"],
              fn = scope["Data.Function"],
              functor = scope["Data.Functor"],
              Apply = function (Functor0, apply) {
                (this.Functor0 = Functor0), (this.apply = apply);
              },
              applyArray = new Apply(function () {
                return functor.functorArray;
              }, self.arrayApply),
              apply = function (dict) {
                return dict.apply;
              };
            (mod.Apply = Apply),
              (mod.apply = apply),
              (mod.applySecond = function (dict) {
                return function (x) {
                  return function (y) {
                    return apply(dict)(
                      functor.map(dict.Functor0())(fn.const(cat.identity(cat.categoryFn)))(x),
                    )(y);
                  };
                };
              }),
              (mod.applyArray = applyArray);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Control.Applicative"] = scope["Control.Applicative"] || {};
            var mod = scope["Control.Applicative"],
              apply = scope["Control.Apply"],
              pure = function (dict) {
                return dict.pure;
              };
            (mod.Applicative = function (Apply0, pureFn) {
              (this.Apply0 = Apply0), (this.pure = pureFn);
            }),
              (mod.pure = pure),
              (mod.liftA1 = function (dict) {
                return function (fn) {
                  return function (value) {
                    return apply.apply(dict.Apply0())(pure(dict)(fn))(value);
                  };
                };
              });
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Control.Bind"] = PS["Control.Bind"] || {}).arrayBind = function (
              arr,
            ) {
              return function (fn) {
                for (var out = [], i = 0, len = arr.length; i < len; i++)
                  Array.prototype.push.apply(out, fn(arr[i]));
                return out;
              };
            };
          })(),
          (function (scope) {
            "use strict";
            scope["Control.Bind"] = scope["Control.Bind"] || {};
            var mod = scope["Control.Bind"],
              self = scope["Control.Bind"],
              apply = scope["Control.Apply"],
              fn = scope["Data.Function"],
              Bind = function (Apply0, bind) {
                (this.Apply0 = Apply0), (this.bind = bind);
              },
              bindArray = new Bind(function () {
                return apply.applyArray;
              }, self.arrayBind),
              bind = function (dict) {
                return dict.bind;
              },
              bindFlipped = function (dict) {
                return fn.flip(bind(dict));
              };
            (mod.Bind = Bind),
              (mod.bind = bind),
              (mod.bindFlipped = bindFlipped),
              (mod.composeKleisliFlipped = function (dict) {
                return function (f) {
                  return function (g) {
                    return function (x) {
                      return bindFlipped(dict)(f)(g(x));
                    };
                  };
                };
              }),
              (mod.bindArray = bindArray);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Maybe"] = scope["Data.Maybe"] || {};
            var mod = scope["Data.Maybe"],
              Applicative = scope["Control.Applicative"],
              Apply = scope["Control.Apply"],
              Bind = scope["Control.Bind"],
              Functor = scope["Data.Functor"],
              Nothing = (function () {
                function Nothing() {}
                return (Nothing.value = new Nothing()), Nothing;
              })(),
              Just = (function () {
                function Just(value0) {
                  this.value0 = value0;
                }
                return (
                  (Just.create = function (x) {
                    return new Just(x);
                  }),
                  Just
                );
              })(),
              functorMaybe = new Functor.Functor(function (f) {
                return function (m) {
                  return m instanceof Just ? new Just(f(m.value0)) : Nothing.value;
                };
              }),
              applyMaybe = new Apply.Apply(
                function () {
                  return functorMaybe;
                },
                function (mf) {
                  return function (mx) {
                    if (mf instanceof Just) return Functor.map(functorMaybe)(mf.value0)(mx);
                    if (mf instanceof Nothing) return Nothing.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " +
                        [mf.constructor.name, mx.constructor.name],
                    );
                  };
                },
              ),
              bindMaybe = new Bind.Bind(
                function () {
                  return applyMaybe;
                },
                function (mx) {
                  return function (f) {
                    if (mx instanceof Just) return f(mx.value0);
                    if (mx instanceof Nothing) return Nothing.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " +
                        [mx.constructor.name, f.constructor.name],
                    );
                  };
                },
              ),
              applicativeMaybe = new Applicative.Applicative(function () {
                return applyMaybe;
              }, Just.create);
            (mod.Nothing = Nothing),
              (mod.Just = Just),
              (mod.maybe = function (n) {
                return function (j) {
                  return function (m) {
                    if (m instanceof Nothing) return n;
                    if (m instanceof Just) return j(m.value0);
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " +
                        [n.constructor.name, j.constructor.name, m.constructor.name],
                    );
                  };
                };
              }),
              (mod.functorMaybe = functorMaybe),
              (mod.applyMaybe = applyMaybe),
              (mod.applicativeMaybe = applicativeMaybe),
              (mod.bindMaybe = bindMaybe);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Array"] = scope["Data.Array"] || {};
            var mod = scope["Data.Array"],
              bind = scope["Control.Bind"],
              func = scope["Data.Function"],
              maybe = scope["Data.Maybe"],
              singleton = function (x) {
                return [x];
              },
              concatMap = func.flip(bind.bind(bind.bindArray));
            (mod.singleton = singleton),
              (mod.concatMap = concatMap),
              (mod.mapMaybe = function (f) {
                return concatMap(function (x) {
                  return maybe.maybe([])(singleton)(f(x));
                });
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Boolean"] = scope["Data.Boolean"] || {};
            scope["Data.Boolean"].otherwise = !0;
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Either"] = scope["Data.Either"] || {};
            var mod = scope["Data.Either"],
              Applicative = scope["Control.Applicative"],
              Apply = scope["Control.Apply"],
              Bind = scope["Control.Bind"],
              Functor = scope["Data.Functor"],
              Maybe = scope["Data.Maybe"],
              Left = (function () {
                function Left(value0) {
                  this.value0 = value0;
                }
                return (
                  (Left.create = function (x) {
                    return new Left(x);
                  }),
                  Left
                );
              })(),
              Right = (function () {
                function Right(value0) {
                  this.value0 = value0;
                }
                return (
                  (Right.create = function (x) {
                    return new Right(x);
                  }),
                  Right
                );
              })(),
              functorEither = new Functor.Functor(function (f) {
                return function (e) {
                  if (e instanceof Left) return new Left(e.value0);
                  if (e instanceof Right) return new Right(f(e.value0));
                  throw new Error(
                    "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " +
                      [e.constructor.name],
                  );
                };
              }),
              either = function (l) {
                return function (r) {
                  return function (e) {
                    if (e instanceof Left) return l(e.value0);
                    if (e instanceof Right) return r(e.value0);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " +
                        [l.constructor.name, r.constructor.name, e.constructor.name],
                    );
                  };
                };
              },
              applyEither = new Apply.Apply(
                function () {
                  return functorEither;
                },
                function (f) {
                  return function (x) {
                    if (f instanceof Left) return new Left(f.value0);
                    if (f instanceof Right) return Functor.map(functorEither)(f.value0)(x);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " +
                        [f.constructor.name, x.constructor.name],
                    );
                  };
                },
              ),
              bindEither = new Bind.Bind(
                function () {
                  return applyEither;
                },
                either(function (l) {
                  return function (r) {
                    return new Left(l);
                  };
                })(function (x) {
                  return function (f) {
                    return f(x);
                  };
                }),
              ),
              applicativeEither = new Applicative.Applicative(function () {
                return applyEither;
              }, Right.create);
            (mod.Left = Left),
              (mod.Right = Right),
              (mod.either = either),
              (mod.note = function (err) {
                return Maybe.maybe(new Left(err))(Right.create);
              }),
              (mod.functorEither = functorEither),
              (mod.applyEither = applyEither),
              (mod.applicativeEither = applicativeEither),
              (mod.bindEither = bindEither);
          })(PS),
          (function (scope) {
            "use strict";
            (scope.intDegree = function (n) {
              return Math.min(Math.abs(n), 2147483647);
            }),
              (scope.intDiv = function (n) {
                return function (d) {
                  return 0 === d
                    ? 0
                    : d > 0
                      ? Math.floor(n / d)
                      : -Math.floor(n / -d);
                };
              }),
              (scope.intMod = function (n) {
                return function (d) {
                  if (0 === d) return 0;
                  var m = Math.abs(d);
                  return ((n % m) + m) % m;
                };
              });
          })((PS["Data.EuclideanRing"] = PS["Data.EuclideanRing"] || {})),
          (function (scope) {
            "use strict";
            (PS["Data.Ring"] = PS["Data.Ring"] || {}).intSub = function (a) {
              return function (b) {
                return (a - b) | 0;
              };
            };
          })(),
          (function (scope) {
            "use strict";
            (scope.intAdd = function (a) {
              return function (b) {
                return (a + b) | 0;
              };
            }),
              (scope.intMul = function (a) {
                return function (b) {
                  return (a * b) | 0;
                };
              });
          })((PS["Data.Semiring"] = PS["Data.Semiring"] || {})),
          (function (scope) {
            "use strict";
            scope["Data.Semiring"] = scope["Data.Semiring"] || {};
            var mod = scope["Data.Semiring"],
              self = scope["Data.Semiring"],
              Semiring = function (add, mul, one, zero) {
                (this.add = add), (this.mul = mul), (this.one = one), (this.zero = zero);
              },
              semiringInt = new Semiring(self.intAdd, self.intMul, 1, 0);
            (mod.Semiring = Semiring),
              (mod.add = function (dict) {
                return dict.add;
              }),
              (mod.zero = function (dict) {
                return dict.zero;
              }),
              (mod.mul = function (dict) {
                return dict.mul;
              }),
              (mod.one = function (dict) {
                return dict.one;
              }),
              (mod.semiringInt = semiringInt);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Ring"] = scope["Data.Ring"] || {};
            var mod = scope["Data.Ring"],
              self = scope["Data.Ring"],
              semiring = scope["Data.Semiring"],
              Ring = function (Semiring0, sub) {
                (this.Semiring0 = Semiring0), (this.sub = sub);
              },
              ringInt = new Ring(function () {
                return semiring.semiringInt;
              }, self.intSub);
            (mod.Ring = Ring),
              (mod.sub = function (dict) {
                return dict.sub;
              }),
              (mod.ringInt = ringInt);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.CommutativeRing"] = scope["Data.CommutativeRing"] || {};
            var mod = scope["Data.CommutativeRing"],
              ring = scope["Data.Ring"],
              CommutativeRing = function (Ring0) {
                this.Ring0 = Ring0;
              },
              commutativeRingInt = new CommutativeRing(function () {
                return ring.ringInt;
              });
            (mod.CommutativeRing = CommutativeRing), (mod.commutativeRingInt = commutativeRingInt);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.EuclideanRing"] = scope["Data.EuclideanRing"] || {};
            var mod = scope["Data.EuclideanRing"],
              self = scope["Data.EuclideanRing"],
              cring = scope["Data.CommutativeRing"],
              EuclideanRing = function (CommutativeRing0, degree, div, modFn) {
                (this.CommutativeRing0 = CommutativeRing0),
                  (this.degree = degree),
                  (this.div = div),
                  (this.mod = modFn);
              },
              euclideanRingInt = new EuclideanRing(
                function () {
                  return cring.commutativeRingInt;
                },
                self.intDegree,
                self.intDiv,
                self.intMod,
              );
            (mod.EuclideanRing = EuclideanRing),
              (mod.degree = function (dict) {
                return dict.degree;
              }),
              (mod.div = function (dict) {
                return dict.div;
              }),
              (mod.mod = function (dict) {
                return dict.mod;
              }),
              (mod.euclideanRingInt = euclideanRingInt);
          })(PS),
          (function (scope) {
            "use strict";
            (scope.foldrArray = function (f) {
              return function (z) {
                return function (xs) {
                  for (var acc = z, i = xs.length - 1; i >= 0; i--) acc = f(xs[i])(acc);
                  return acc;
                };
              };
            }),
              (scope.foldlArray = function (f) {
                return function (z) {
                  return function (xs) {
                    for (var acc = z, len = xs.length, i = 0; i < len; i++)
                      acc = f(acc)(xs[i]);
                    return acc;
                  };
                };
              });
          })((PS["Data.Foldable"] = PS["Data.Foldable"] || {})),
          (function (scope) {
            "use strict";
            scope["Data.Monoid"] = scope["Data.Monoid"] || {};
            var mod = scope["Data.Monoid"];
            (mod.Monoid = function (Semigroup0, mempty) {
              (this.Semigroup0 = Semigroup0), (this.mempty = mempty);
            }),
              (mod.mempty = function (dict) {
                return dict.mempty;
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Semigroup"] = scope["Data.Semigroup"] || {};
            var mod = scope["Data.Semigroup"];
            (mod.Semigroup = function (append) {
              this.append = append;
            }),
              (mod.append = function (dict) {
                return dict.append;
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Foldable"] = scope["Data.Foldable"] || {};
            var mod = scope["Data.Foldable"],
              self = scope["Data.Foldable"],
              applicative = scope["Control.Applicative"],
              apply = scope["Control.Apply"],
              monoid = scope["Data.Monoid"],
              semigroup = scope["Data.Semigroup"],
              unit = scope["Data.Unit"],
              Foldable = function (foldMap, foldl, foldr) {
                (this.foldMap = foldMap), (this.foldl = foldl), (this.foldr = foldr);
              },
              foldr = function (dict) {
                return dict.foldr;
              },
              foldMapDefaultR = function (dict) {
                return function (m) {
                  return function (f) {
                    return foldr(dict)(function (x) {
                      return function (acc) {
                        return semigroup.append(m.Semigroup0())(f(x))(acc);
                      };
                    })(monoid.mempty(m));
                  };
                };
              },
              foldableArray = new Foldable(
                function (m) {
                  return foldMapDefaultR(foldableArray)(m);
                },
                self.foldlArray,
                self.foldrArray,
              );
            (mod.Foldable = Foldable),
              (mod.foldr = foldr),
              (mod.foldl = function (dict) {
                return dict.foldl;
              }),
              (mod.foldMap = function (dict) {
                return dict.foldMap;
              }),
              (mod.foldMapDefaultR = foldMapDefaultR),
              (mod.traverse_ = function (dictApp) {
                return function (dictFold) {
                  return function (f) {
                    return function (xs) {
                      return foldr(dictFold)(function (x) {
                        return apply.applySecond(dictApp.Apply0())(f(x));
                      })(applicative.pure(dictApp)(unit.unit))(xs);
                    };
                  };
                };
              }),
              (mod.foldableArray = foldableArray);
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Data.Int"] = PS["Data.Int"] || {}).fromStringAsImpl = function (
              just,
            ) {
              return function (nothing) {
                return function (radix) {
                  var pat;
                  pat =
                    radix < 11
                      ? "[0-" + (radix - 1).toString() + "]"
                      : 11 === radix
                        ? "[0-9a]"
                        : "[0-9a-" + String.fromCharCode(86 + radix) + "]";
                  var re = new RegExp("^[\\+\\-]?" + pat + "+$", "i");
                  return function (text) {
                    if (re.test(text)) {
                      var x = parseInt(text, radix);
                      return (0 | x) === x ? just(x) : nothing;
                    }
                    return nothing;
                  };
                };
              };
            };
          })(),
          (function (scope) {
            "use strict";
            scope["Data.Int"] = scope["Data.Int"] || {};
            var mod = scope["Data.Int"],
              self = scope["Data.Int"],
              maybe = scope["Data.Maybe"],
              fromStringAs = self.fromStringAsImpl(maybe.Just.create)(maybe.Nothing.value),
              fromString = fromStringAs(10);
            (mod.fromString = fromString),
              (mod.fromStringAs = fromStringAs),
              (mod.odd = function (n) {
                return 0 != (1 & n);
              });
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Data.Show"] = PS["Data.Show"] || {}).showIntImpl = function (x) {
              return x.toString();
            };
          })(),
          (function (scope) {
            "use strict";
            scope["Data.Show"] = scope["Data.Show"] || {};
            var mod = scope["Data.Show"],
              Show = function (show) {
                this.show = show;
              },
              showInt = new Show(scope["Data.Show"].showIntImpl);
            (mod.Show = Show),
              (mod.show = function (dict) {
                return dict.show;
              }),
              (mod.showInt = showInt);
          })(PS),
          (function (scope) {
            "use strict";
            (scope.split = function (sep) {
              return function (s) {
                return s.split(sep);
              };
            }),
              (scope.trim = function (s) {
                return s.trim();
              });
          })((PS["Data.String.Common"] = PS["Data.String.Common"] || {})),
          (function (scope) {
            "use strict";
            scope["Data.String.Common"] = scope["Data.String.Common"] || {};
            var a = scope["Data.String.Common"],
              b = scope["Data.String.Common"];
            (a.split = b.split), (a.trim = b.trim);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Data.Tuple"] = scope["Data.Tuple"] || {};
            var mod = scope["Data.Tuple"],
              Tuple = (function () {
                function Tuple(value0, value1) {
                  (this.value0 = value0), (this.value1 = value1);
                }
                return (
                  (Tuple.create = function (a) {
                    return function (b) {
                      return new Tuple(a, b);
                    };
                  }),
                  Tuple
                );
              })();
            mod.Tuple = Tuple;
          })(PS),
          (function (scope) {
            "use strict";
            (scope.pureE = function (x) {
              return function () {
                return x;
              };
            }),
              (scope.bindE = function (eff) {
                return function (k) {
                  return function () {
                    return k(eff())();
                  };
                };
              });
          })((PS.Effect = PS.Effect || {})),
          (function (scope) {
            "use strict";
            scope["Control.Monad"] = scope["Control.Monad"] || {};
            var mod = scope["Control.Monad"],
              applicative = scope["Control.Applicative"],
              bind = scope["Control.Bind"];
            (mod.Monad = function (Applicative0, Bind1) {
              (this.Applicative0 = Applicative0), (this.Bind1 = Bind1);
            }),
              (mod.ap = function (dict) {
                return function (mf) {
                  return function (mx) {
                    return bind.bind(dict.Bind1())(mf)(function (f) {
                      return bind.bind(dict.Bind1())(mx)(function (x) {
                        return applicative.pure(dict.Applicative0())(f(x));
                      });
                    });
                  };
                };
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope.Effect = scope.Effect || {};
            var mod = scope.Effect,
              self = scope.Effect,
              Applicative = scope["Control.Applicative"],
              Apply = scope["Control.Apply"],
              Bind = scope["Control.Bind"],
              Monad = scope["Control.Monad"],
              Functor = scope["Data.Functor"],
              monadEffect = new Monad.Monad(
                function () {
                  return applicativeEffect;
                },
                function () {
                  return bindEffect;
                },
              ),
              bindEffect = new Bind.Bind(function () {
                return applyEffect;
              }, self.bindE),
              applyEffect = new Apply.Apply(function () {
                return functorEffect;
              }, Monad.ap(monadEffect)),
              applicativeEffect = new Applicative.Applicative(function () {
                return applyEffect;
              }, self.pureE),
              functorEffect = new Functor.Functor(Applicative.liftA1(applicativeEffect));
            (mod.functorEffect = functorEffect),
              (mod.applyEffect = applyEffect),
              (mod.applicativeEffect = applicativeEffect),
              (mod.bindEffect = bindEffect),
              (mod.monadEffect = monadEffect);
          })(PS),
          (function (scope) {
            "use strict";
            var AffImpl = (function () {
              var EMPTY = {},
                PURE = "Pure",
                THROW = "Throw",
                CATCH = "Catch",
                SYNC = "Sync",
                ASYNC = "Async",
                BIND = "Bind",
                BRACKET = "Bracket",
                FORK = "Fork",
                SEQUENTIAL = "Sequential",
                MAP = "Map",
                APPLY = "Apply",
                ALT = "Alt",
                CONS = "Cons",
                RESUME = "Resume",
                RELEASE = "Release",
                FINALIZER = "Finalizer",
                FINALIZED = "Finalized",
                FORKED = "Forked";
              function Aff(tag, a, b, c) {
                (this.tag = tag), (this._1 = a), (this._2 = b), (this._3 = c);
              }
              function make(tag) {
                var f = function (a, b, c) {
                  return new Aff(tag, a, b, c);
                };
                return (f.tag = tag), f;
              }
              function nonCanceler(x) {
                return new Aff(PURE, void 0);
              }
              function safeThrow(error) {
                try {
                  error();
                } catch (e) {
                  setTimeout(function () {
                    throw e;
                  }, 0);
                }
              }
              function attempt(left, right, thunk) {
                try {
                  return right(thunk());
                } catch (err) {
                  return left(err);
                }
              }
              function invoke(left, k, cb) {
                try {
                  return k(cb)();
                } catch (err) {
                  return cb(left(err))(), nonCanceler;
                }
              }
              var scheduler = (function () {
                var len = 1024,
                  size = 0,
                  start = 0,
                  ring = new Array(len),
                  draining = !1;
                function drain() {
                  var job;
                  for (draining = !0; 0 !== size; )
                    size--, (job = ring[start]), (ring[start] = void 0), (start = (start + 1) % len), job();
                  draining = !1;
                }
                return {
                  isDraining: function () {
                    return draining;
                  },
                  enqueue: function (job) {
                    var old;
                    size === len && ((old = draining), drain(), (draining = old)),
                      (ring[(start + size) % len] = job),
                      size++,
                      draining || drain();
                  },
                };
              })();
              var SUSPENDED = 0,
                CONTINUE = 1,
                STEP_BIND = 2,
                RETURN = 3,
                ASYNCING = 4,
                COMPLETING = 5,
                DONE = 6;
              function Fiber(util, supervisor, aff) {
                var tick = 0,
                  state = SUSPENDED,
                  current = aff,
                  fail = null,
                  left = null,
                  bind = null,
                  binds = null,
                  stack = null,
                  bracketCount = 0,
                  listeners = 0,
                  completeHandlers = null,
                  rethrow = !0;
                function run(step) {
                  for (var w, h, j; ; )
                    switch (((w = null), (h = null), (j = null), state)) {
                      case STEP_BIND:
                        (state = CONTINUE),
                          (current = bind(current)),
                          null === binds ? (bind = null) : ((bind = binds._1), (binds = binds._2));
                        break;
                      case RETURN:
                        util.isLeft(current)
                          ? ((state = COMPLETING), (fail = current), (current = null))
                          : null === bind
                            ? (state = COMPLETING)
                            : ((state = STEP_BIND), (current = util.fromRight(current)));
                        break;
                      case CONTINUE:
                        switch (current.tag) {
                          case BIND:
                            bind && (binds = new Aff(CONS, bind, binds)),
                              (bind = current._2),
                              (state = CONTINUE),
                              (current = current._1);
                            break;
                          case PURE:
                            null === bind
                              ? ((state = COMPLETING), (current = util.right(current._1)))
                              : ((state = STEP_BIND), (current = current._1));
                            break;
                          case SYNC:
                            (state = RETURN), (current = attempt(util.left, util.right, current._1));
                            break;
                          case ASYNC:
                            return (
                              (state = ASYNCING),
                              void (current = invoke(util.left, current._1, function (v) {
                                return function () {
                                  tick === step &&
                                    (tick++,
                                    scheduler.enqueue(function () {
                                      tick === step + 1 && ((state = RETURN), (current = v), run(tick));
                                    }));
                                };
                              }))
                            );
                          case THROW:
                            (state = COMPLETING), (fail = util.left(current._1)), (current = null);
                            break;
                          case CATCH:
                            (stack = new Aff(
                              CONS,
                              current,
                              null === bind ? stack : new Aff(CONS, new Aff(RESUME, bind, binds), stack, left),
                              left,
                            )),
                              (bind = null),
                              (binds = null),
                              (state = CONTINUE),
                              (current = current._1);
                            break;
                          case BRACKET:
                            bracketCount++,
                              (stack = new Aff(
                                CONS,
                                current,
                                null === bind ? stack : new Aff(CONS, new Aff(RESUME, bind, binds), stack, left),
                                left,
                              )),
                              (bind = null),
                              (binds = null),
                              (state = CONTINUE),
                              (current = current._1);
                            break;
                          case FORK:
                            (state = RETURN),
                              (w = Fiber(util, supervisor, current._2)),
                              supervisor && supervisor.register(w),
                              current._1 && w.run(),
                              (current = util.right(w));
                            break;
                          case SEQUENTIAL:
                            (state = CONTINUE), (current = parallel(util, supervisor, current._1));
                        }
                        break;
                      case COMPLETING:
                        if (((bind = null), (binds = null), null === stack))
                          (state = DONE), (current = left || fail || current);
                        else
                          switch (((w = stack._3), (j = stack._1), (stack = stack._2), j.tag)) {
                            case CATCH:
                              left && left !== w
                                ? (state = COMPLETING)
                                : fail &&
                                  ((state = CONTINUE),
                                  (current = j._2(util.fromLeft(fail))),
                                  (fail = null));
                              break;
                            case RESUME:
                              (left && left !== w) || fail
                                ? (state = COMPLETING)
                                : ((bind = j._1),
                                  (binds = j._2),
                                  (state = STEP_BIND),
                                  (current = util.fromRight(current)));
                              break;
                            case BRACKET:
                              bracketCount--,
                                null === fail &&
                                  ((h = util.fromRight(current)),
                                  (stack = new Aff(CONS, new Aff(RELEASE, j._2, h), stack, w)),
                                  (left === w || bracketCount > 0) &&
                                    ((state = CONTINUE), (current = j._3(h))));
                              break;
                            case RELEASE:
                              bracketCount++,
                                (stack = new Aff(CONS, new Aff(FINALIZED, current, fail), stack, left)),
                                (state = CONTINUE),
                                (current =
                                  left && left !== w
                                    ? j._1.killed(util.fromLeft(left))(j._2)
                                    : fail
                                      ? j._1.failed(util.fromLeft(fail))(j._2)
                                      : j._1.completed(util.fromRight(current))(j._2)),
                                (fail = null);
                              break;
                            case FINALIZER:
                              bracketCount++,
                                (stack = new Aff(CONS, new Aff(FINALIZED, current, fail), stack, left)),
                                (state = CONTINUE),
                                (current = j._1);
                              break;
                            case FINALIZED:
                              bracketCount--, (state = COMPLETING), (current = j._1), (fail = j._2);
                          }
                        break;
                      case DONE:
                        for (var key in completeHandlers)
                          completeHandlers.hasOwnProperty(key) &&
                            ((rethrow = rethrow && completeHandlers[key].rethrow), safeThrow(completeHandlers[key].handler(current)));
                        return (
                          (completeHandlers = null),
                          void (left && fail
                            ? setTimeout(function () {
                                throw util.fromLeft(fail);
                              }, 0)
                            : util.isLeft(current) &&
                              rethrow &&
                              setTimeout(function () {
                                if (rethrow) throw util.fromLeft(current);
                              }, 0))
                        );
                      case SUSPENDED:
                        state = CONTINUE;
                        break;
                      case ASYNCING:
                        return;
                    }
                }
                function onComplete(handler) {
                  return function () {
                    if (state === DONE)
                      return (
                        (rethrow = rethrow && handler.rethrow), handler.handler(current)(), function () {}
                      );
                    var id = listeners++;
                    return (
                      ((completeHandlers = completeHandlers || {})[id] = handler),
                      function () {
                        null !== completeHandlers && delete completeHandlers[id];
                      }
                    );
                  };
                }
                return {
                  kill: function (err, cb) {
                    return function () {
                      if (state === DONE) return cb(util.right(void 0))(), function () {};
                      var unregister = onComplete({
                        rethrow: !1,
                        handler: function () {
                          return cb(util.right(void 0));
                        },
                      })();
                      switch (state) {
                        case SUSPENDED:
                          (left = util.left(err)), (state = DONE), (current = left), run(tick);
                          break;
                        case ASYNCING:
                          null === left && (left = util.left(err)),
                            0 === bracketCount &&
                              (state === ASYNCING && (stack = new Aff(CONS, new Aff(FINALIZER, current(err)), stack, left)),
                              (state = COMPLETING),
                              (current = null),
                              (fail = null),
                              run(++tick));
                          break;
                        default:
                          null === left && (left = util.left(err)),
                            0 === bracketCount && ((state = COMPLETING), (current = null), (fail = null));
                      }
                      return unregister;
                    };
                  },
                  join: function (k) {
                    return function () {
                      var unregister = onComplete({ rethrow: !1, handler: k })();
                      return state === SUSPENDED && run(tick), unregister;
                    };
                  },
                  onComplete: onComplete,
                  isSuspended: function () {
                    return state === SUSPENDED;
                  },
                  run: function () {
                    state === SUSPENDED &&
                      (scheduler.isDraining()
                        ? run(tick)
                        : scheduler.enqueue(function () {
                            run(tick);
                          }));
                  },
                };
              }
              function parallel(util, supervisor, aff) {
                return new Aff(ASYNC, function (cb) {
                  return function () {
                    return startParallel(util, supervisor, aff, cb);
                  };
                });
              }
              function startParallel(util, supervisor, aff, cb) {
                var count = 0,
                  fibers = {},
                  cancels = 0,
                  cancelers = {},
                  early = new Error("[ParAff] Early exit"),
                  killed = null,
                  root = EMPTY;
                function killTree(err, node, done) {
                  var fiber,
                    fn,
                    current = node,
                    parents = null,
                    rest = null,
                    total = 0,
                    undo = {};
                  scan: for (;;)
                    switch (((fiber = null), current.tag)) {
                      case FORKED:
                        if (
                          (current._3 === EMPTY &&
                            ((fiber = fibers[current._1]),
                            (undo[total++] = fiber.kill(err, function (r) {
                              return function () {
                                0 === --total && done(r)();
                              };
                            }))),
                          null === parents)
                        )
                          break scan;
                        (current = parents._2),
                          null === rest ? (parents = null) : ((parents = rest._1), (rest = rest._2));
                        break;
                      case MAP:
                        current = current._2;
                        break;
                      case APPLY:
                      case ALT:
                        parents && (rest = new Aff(CONS, parents, rest)), (parents = current), (current = current._1);
                    }
                  if (0 === total) done(util.right(void 0))();
                  else for (fn = 0, fiber = total; fn < fiber; fn++) undo[fn] = undo[fn]();
                  return undo;
                }
                function doneNode(node) {
                  return function (result) {
                    return function () {
                      delete fibers[node._1],
                        (node._3 = result),
                        (function loop(result, current, parents) {
                          var err, val, leftR, rightR, alive, id;
                          for (
                            util.isLeft(result)
                              ? ((err = result), (val = null))
                              : ((val = result), (err = null));
                            ;

                          ) {
                            if (
                              ((leftR = null),
                              (rightR = null),
                              (alive = null),
                              (id = null),
                              null !== killed)
                            )
                              return;
                            if (null === current) return void cb(err || val)();
                            if (current._3 !== EMPTY) return;
                            switch (current.tag) {
                              case MAP:
                                null === err
                                  ? ((current._3 = util.right(current._1(util.fromRight(val)))),
                                    (val = current._3))
                                  : (current._3 = err);
                                break;
                              case APPLY:
                                if (((leftR = current._1._3), (rightR = current._2._3), err)) {
                                  if (
                                    ((current._3 = err),
                                    (alive = !0),
                                    (id = cancels++),
                                    (cancelers[id] = killTree(
                                      early,
                                      err === leftR ? current._2 : current._1,
                                      function () {
                                        return function () {
                                          delete cancelers[id],
                                            alive
                                              ? (alive = !1)
                                              : null === parents
                                                ? loop(err, null, null)
                                                : loop(err, parents._1, parents._2);
                                        };
                                      },
                                    )),
                                    alive)
                                  )
                                    return void (alive = !1);
                                } else {
                                  if (leftR === EMPTY || rightR === EMPTY) return;
                                  (val = util.right(util.fromRight(leftR)(util.fromRight(rightR)))),
                                    (current._3 = val);
                                }
                                break;
                              case ALT:
                                if (
                                  ((leftR = current._1._3),
                                  (rightR = current._2._3),
                                  (leftR === EMPTY && util.isLeft(rightR)) ||
                                    (rightR === EMPTY && util.isLeft(leftR)))
                                )
                                  return;
                                if (
                                  leftR !== EMPTY &&
                                  util.isLeft(leftR) &&
                                  rightR !== EMPTY &&
                                  util.isLeft(rightR)
                                )
                                  (err = val === leftR ? rightR : leftR), (val = null), (current._3 = err);
                                else if (
                                  ((current._3 = val),
                                  (alive = !0),
                                  (id = cancels++),
                                  (cancelers[id] = killTree(
                                    early,
                                    val === leftR ? current._2 : current._1,
                                    function () {
                                      return function () {
                                        delete cancelers[id],
                                          alive
                                            ? (alive = !1)
                                            : null === parents
                                              ? loop(val, null, null)
                                              : loop(val, parents._1, parents._2);
                                      };
                                    },
                                  )),
                                  alive)
                                )
                                  return void (alive = !1);
                            }
                            null === parents ? (current = null) : ((current = parents._1), (parents = parents._2));
                          }
                        })(result, node._2._1, node._2._2);
                    };
                  };
                }
                return (
                  (function () {
                    var i,
                      id,
                      state = CONTINUE,
                      current = aff,
                      branch = null,
                      parents = null;
                    main: for (;;)
                      switch (((i = null), (id = null), state)) {
                        case CONTINUE:
                          switch (current.tag) {
                            case MAP:
                              branch && (parents = new Aff(CONS, branch, parents)),
                                (branch = new Aff(MAP, current._1, EMPTY, EMPTY)),
                                (current = current._2);
                              break;
                            case APPLY:
                              branch && (parents = new Aff(CONS, branch, parents)),
                                (branch = new Aff(APPLY, EMPTY, current._2, EMPTY)),
                                (current = current._1);
                              break;
                            case ALT:
                              branch && (parents = new Aff(CONS, branch, parents)),
                                (branch = new Aff(ALT, EMPTY, current._2, EMPTY)),
                                (current = current._1);
                              break;
                            default:
                              (id = count++),
                                (state = COMPLETING),
                                (i = current),
                                (current = new Aff(FORKED, id, new Aff(CONS, branch, parents), EMPTY)),
                                (i = Fiber(util, supervisor, i)).onComplete({
                                  rethrow: !1,
                                  handler: doneNode(current),
                                })(),
                                (fibers[id] = i),
                                supervisor && supervisor.register(i);
                          }
                          break;
                        case COMPLETING:
                          if (null === branch) break main;
                          branch._1 === EMPTY
                            ? ((branch._1 = current), (state = CONTINUE), (current = branch._2), (branch._2 = EMPTY))
                            : ((branch._2 = current),
                              (current = branch),
                              null === parents
                                ? (branch = null)
                                : ((branch = parents._1), (parents = parents._2)));
                      }
                    for (root = current, id = 0; id < count; id++) fibers[id].run();
                  })(),
                  function (err) {
                    return new Aff(ASYNC, function (cb2) {
                      return function () {
                        return (function (err, cb2) {
                          var canceler;
                          for (var k in ((killed = util.left(err)), cancelers))
                            if (cancelers.hasOwnProperty(k))
                              for (k in (canceler = cancelers[k]))
                                canceler.hasOwnProperty(k) && canceler[k]();
                          cancelers = null;
                          var u = killTree(err, root, cb2);
                          return function (x) {
                            return new Aff(ASYNC, function (cb3) {
                              return function () {
                                for (var key in u) u.hasOwnProperty(key) && u[key]();
                                return nonCanceler;
                              };
                            });
                          };
                        })(err, cb2);
                      };
                    });
                  }
                );
              }
              return (
                (Aff.EMPTY = EMPTY),
                (Aff.Pure = make(PURE)),
                (Aff.Throw = make(THROW)),
                (Aff.Catch = make(CATCH)),
                (Aff.Sync = make(SYNC)),
                (Aff.Async = make(ASYNC)),
                (Aff.Bind = make(BIND)),
                (Aff.Bracket = make(BRACKET)),
                (Aff.Fork = make(FORK)),
                (Aff.Seq = make(SEQUENTIAL)),
                (Aff.ParMap = make(MAP)),
                (Aff.ParApply = make(APPLY)),
                (Aff.ParAlt = make(ALT)),
                (Aff.Fiber = Fiber),
                (Aff.Supervisor = function (util) {
                  var set = {},
                    id = 0,
                    count = 0;
                  return {
                    register: function (fiber) {
                      var k = id++;
                      fiber.onComplete({
                        rethrow: !0,
                        handler: function (r) {
                          return function () {
                            count--, delete set[k];
                          };
                        },
                      }),
                        (set[k] = fiber),
                        count++;
                    },
                    isEmpty: function () {
                      return 0 === count;
                    },
                    killAll: function (err, cb) {
                      return function () {
                        var active = 0,
                          undo = {};
                        function kill(k) {
                          undo[k] = set[k].kill(err, function (res) {
                            return function () {
                              delete undo[k],
                                active--,
                                util.isLeft(res) &&
                                  util.fromLeft(res) &&
                                  setTimeout(function () {
                                    throw util.fromLeft(res);
                                  }, 0),
                                0 === active && cb();
                            };
                          })();
                        }
                        for (var k in set) set.hasOwnProperty(k) && (active++, kill(k));
                        return (
                          (set = {}),
                          (id = 0),
                          (count = 0),
                          function (x) {
                            return new Aff(SYNC, function () {
                              for (var k in undo) undo.hasOwnProperty(k) && undo[k]();
                            });
                          }
                        );
                      };
                    },
                  };
                }),
                (Aff.Scheduler = scheduler),
                (Aff.nonCanceler = nonCanceler),
                Aff
              );
            })();
            (scope._pure = AffImpl.Pure),
              (scope._map = function (f) {
                return function (x) {
                  return x.tag === AffImpl.Pure.tag
                    ? AffImpl.Pure(f(x._1))
                    : AffImpl.Bind(x, function (y) {
                        return AffImpl.Pure(f(y));
                      });
                };
              }),
              (scope._bind = function (x) {
                return function (f) {
                  return AffImpl.Bind(x, f);
                };
              }),
              (scope._liftEffect = AffImpl.Sync),
              (scope._parAffMap = function (f) {
                return function (x) {
                  return AffImpl.ParMap(f, x);
                };
              }),
              (scope._parAffApply = function (f) {
                return function (x) {
                  return AffImpl.ParApply(f, x);
                };
              }),
              (scope.makeAff = AffImpl.Async),
              (scope._makeFiber = function (util, aff) {
                return function () {
                  return AffImpl.Fiber(util, null, aff);
                };
              }),
              (scope._sequential = AffImpl.Seq);
          })((PS["Effect.Aff"] = PS["Effect.Aff"] || {})),
          (function (scope) {
            "use strict";
            scope["Control.Parallel.Class"] = scope["Control.Parallel.Class"] || {};
            var mod = scope["Control.Parallel.Class"];
            (mod.parallel = function (dict) {
              return dict.parallel;
            }),
              (mod.sequential = function (dict) {
                return dict.sequential;
              }),
              (mod.Parallel = function (Applicative1, Monad0, parallel, sequential) {
                (this.Applicative1 = Applicative1),
                  (this.Monad0 = Monad0),
                  (this.parallel = parallel),
                  (this.sequential = sequential);
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope["Control.Parallel"] = scope["Control.Parallel"] || {};
            var mod = scope["Control.Parallel"],
              cat = scope["Control.Category"],
              cls = scope["Control.Parallel.Class"],
              foldable = scope["Data.Foldable"],
              parTraverse_ = function (dict) {
                return function (foldableDict) {
                  return function (f) {
                    return function (xs) {
                      return cls.sequential(dict)(
                        foldable.traverse_(dict.Applicative1())(foldableDict)(function (x) {
                          return cls.parallel(dict)(f(x));
                        })(xs),
                      );
                    };
                  };
                };
              };
            (mod.parTraverse_ = parTraverse_),
              (mod.parSequence_ = function (dict) {
                return function (foldableDict) {
                  return parTraverse_(dict)(foldableDict)(cat.identity(cat.categoryFn));
                };
              });
          })(PS),
          (function (scope) {
            "use strict";
            scope["Effect.Class"] = scope["Effect.Class"] || {};
            var mod = scope["Effect.Class"];
            (mod.liftEffect = function (dict) {
              return dict.liftEffect;
            }),
              (mod.MonadEffect = function (Monad0, liftEffect) {
                (this.Monad0 = Monad0), (this.liftEffect = liftEffect);
              });
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Partial.Unsafe"] = PS["Partial.Unsafe"] || {}).unsafePartial =
              function (f) {
                return f();
              };
          })(),
          (function (scope) {
            "use strict";
            (PS["Partial"] = PS["Partial"] || {}).crashWith = function () {
              return function (message) {
                throw new Error(message);
              };
            };
          })(),
          (function (scope) {
            "use strict";
            scope.Partial = scope.Partial || {};
            var a = scope.Partial,
              b = scope.Partial;
            a.crashWith = b.crashWith;
          })(PS),
          (function (scope) {
            "use strict";
            scope["Partial.Unsafe"] = scope["Partial.Unsafe"] || {};
            var mod = scope["Partial.Unsafe"],
              self = scope["Partial.Unsafe"],
              partial = scope.Partial;
            mod.unsafeCrashWith = function (msg) {
              return self.unsafePartial(function (x) {
                return partial.crashWith(x)(msg);
              });
            };
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Unsafe.Coerce"] = PS["Unsafe.Coerce"] || {}).unsafeCoerce =
              function (x) {
                return x;
              };
          })(),
          (function (scope) {
            "use strict";
            scope["Unsafe.Coerce"] = scope["Unsafe.Coerce"] || {};
            var a = scope["Unsafe.Coerce"],
              b = scope["Unsafe.Coerce"];
            a.unsafeCoerce = b.unsafeCoerce;
          })(PS),
          (function (scope) {
            "use strict";
            scope["Effect.Aff"] = scope["Effect.Aff"] || {};
            var mod = scope["Effect.Aff"],
              self = scope["Effect.Aff"],
              applicative = scope["Control.Applicative"],
              apply = scope["Control.Apply"],
              bind = scope["Control.Bind"],
              monad = scope["Control.Monad"],
              par = scope["Control.Parallel"],
              pclass = scope["Control.Parallel.Class"],
              either = scope["Data.Either"],
              foldable = scope["Data.Foldable"],
              fun = scope["Data.Function"],
              functor = scope["Data.Functor"],
              monoid = scope["Data.Monoid"],
              semigroup = scope["Data.Semigroup"],
              unit = scope["Data.Unit"],
              effect = scope.Effect,
              effClass = scope["Effect.Class"],
              unsafePartial = scope["Partial.Unsafe"],
              unsafeCoerce = scope["Unsafe.Coerce"],
              functorParAff = new functor.Functor(self._parAffMap),
              functorAff = new functor.Functor(self._map),
              util = {
                isLeft: function (x) {
                  if (x instanceof either.Left) return !0;
                  if (x instanceof either.Right) return !1;
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " +
                      [x.constructor.name],
                  );
                },
                fromLeft: function (x) {
                  if (x instanceof either.Left) return x.value0;
                  if (x instanceof either.Right)
                    return unsafePartial.unsafeCrashWith("unsafeFromLeft: Right");
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " +
                      [x.constructor.name],
                  );
                },
                fromRight: function (x) {
                  if (x instanceof either.Right) return x.value0;
                  if (x instanceof either.Left)
                    return unsafePartial.unsafeCrashWith("unsafeFromRight: Left");
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " +
                      [x.constructor.name],
                  );
                },
                left: either.Left.create,
                right: either.Right.create,
              },
              launchAff = function (aff) {
                return function () {
                  var f = (function (x) {
                    return self._makeFiber(util, x);
                  })(aff)();
                  return f.run(), f;
                };
              },
              applyParAff = new apply.Apply(function () {
                return functorParAff;
              }, self._parAffApply),
              monadAff = new monad.Monad(
                function () {
                  return applicativeAff;
                },
                function () {
                  return bindAff;
                },
              ),
              bindAff = new bind.Bind(function () {
                return applyAff;
              }, self._bind),
              applyAff = new apply.Apply(function () {
                return functorAff;
              }, monad.ap(monadAff)),
              applicativeAff = new applicative.Applicative(function () {
                return applyAff;
              }, self._pure),
              monadEffectAff = new effClass.MonadEffect(function () {
                return monadAff;
              }, self._liftEffect),
              parallelAff = new pclass.Parallel(
                function () {
                  return applicativeParAff;
                },
                function () {
                  return monadAff;
                },
                unsafeCoerce.unsafeCoerce,
                self._sequential,
              ),
              applicativeParAff = new applicative.Applicative(
                function () {
                  return applyParAff;
                },
                function (x) {
                  return pclass.parallel(parallelAff)(applicative.pure(applicativeAff)(x));
                },
              ),
              semigroupCanceler = new semigroup.Semigroup(function (a) {
                return function (b) {
                  return function (err) {
                    return par.parSequence_(parallelAff)(foldable.foldableArray)([a(err), b(err)]);
                  };
                };
              }),
              nonCanceler = fun.const(applicative.pure(applicativeAff)(unit.unit)),
              monoidCanceler = new monoid.Monoid(function () {
                return semigroupCanceler;
              }, nonCanceler);
            (mod.launchAff = launchAff),
              (mod.launchAff_ = function (aff) {
                return functor.void(effect.functorEffect)(launchAff(aff));
              }),
              (mod.nonCanceler = nonCanceler),
              (mod.functorAff = functorAff),
              (mod.applyAff = applyAff),
              (mod.applicativeAff = applicativeAff),
              (mod.bindAff = bindAff),
              (mod.monadAff = monadAff),
              (mod.monadEffectAff = monadEffectAff),
              (mod.functorParAff = functorParAff),
              (mod.applyParAff = applyParAff),
              (mod.applicativeParAff = applicativeParAff),
              (mod.parallelAff = parallelAff),
              (mod.semigroupCanceler = semigroupCanceler),
              (mod.monoidCanceler = monoidCanceler),
              (mod.makeAff = self.makeAff);
          })(PS),
          (function (scope) {
            "use strict";
            (scope.new = function (value) {
              return function () {
                return { value: value };
              };
            }),
              (scope.read = function (ref) {
                return function () {
                  return ref.value;
                };
              }),
              (scope.write = function (value) {
                return function (ref) {
                  return function () {
                    return (ref.value = value), {};
                  };
                };
              });
          })((PS["Effect.Ref"] = PS["Effect.Ref"] || {})),
          (function (scope) {
            "use strict";
            scope["Effect.Ref"] = scope["Effect.Ref"] || {};
            var a = scope["Effect.Ref"],
              b = scope["Effect.Ref"];
            (a.new = b.new), (a.read = b.read), (a.write = b.write);
          })(PS),
          (function (scope) {
            "use strict";
            scope["Node.Encoding"] = scope["Node.Encoding"] || {};
            var mod = scope["Node.Encoding"],
              show = scope["Data.Show"],
              ASCII = (function () {
                function ASCII() {}
                return (ASCII.value = new ASCII()), ASCII;
              })(),
              UTF8 = (function () {
                function UTF8() {}
                return (UTF8.value = new UTF8()), UTF8;
              })(),
              UTF16LE = (function () {
                function UTF16LE() {}
                return (UTF16LE.value = new UTF16LE()), UTF16LE;
              })(),
              UCS2 = (function () {
                function UCS2() {}
                return (UCS2.value = new UCS2()), UCS2;
              })(),
              Base64 = (function () {
                function Base64() {}
                return (Base64.value = new Base64()), Base64;
              })(),
              Latin1 = (function () {
                function Latin1() {}
                return (Latin1.value = new Latin1()), Latin1;
              })(),
              Binary = (function () {
                function Binary() {}
                return (Binary.value = new Binary()), Binary;
              })(),
              Hex = (function () {
                function Hex() {}
                return (Hex.value = new Hex()), Hex;
              })(),
              showEncoding = new show.Show(function (x) {
                if (x instanceof ASCII) return "ASCII";
                if (x instanceof UTF8) return "UTF8";
                if (x instanceof UTF16LE) return "UTF16LE";
                if (x instanceof UCS2) return "UCS2";
                if (x instanceof Base64) return "Base64";
                if (x instanceof Latin1) return "Latin1";
                if (x instanceof Binary) return "Binary";
                if (x instanceof Hex) return "Hex";
                throw new Error(
                  "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " +
                    [x.constructor.name],
                );
              });
            (mod.ASCII = ASCII),
              (mod.UTF8 = UTF8),
              (mod.UTF16LE = UTF16LE),
              (mod.UCS2 = UCS2),
              (mod.Base64 = Base64),
              (mod.Latin1 = Latin1),
              (mod.Binary = Binary),
              (mod.Hex = Hex),
              (mod.encodingToNode = function (x) {
                if (x instanceof ASCII) return "ascii";
                if (x instanceof UTF8) return "utf8";
                if (x instanceof UTF16LE) return "utf16le";
                if (x instanceof UCS2) return "ucs2";
                if (x instanceof Base64) return "base64";
                if (x instanceof Latin1) return "latin1";
                if (x instanceof Binary) return "binary";
                if (x instanceof Hex) return "hex";
                throw new Error(
                  "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " +
                    [x.constructor.name],
                );
              }),
              (mod.showEncoding = showEncoding);
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Node.Process"] = PS["Node.Process"] || {}).process = process;
          })(),
          (function (scope) {
            "use strict";
            scope["Node.Process"] = scope["Node.Process"] || {};
            var mod = scope["Node.Process"],
              self = scope["Node.Process"],
              stdout = self.process.stdout,
              stdin = self.process.stdin;
            (mod.stdin = stdin), (mod.stdout = stdout);
          })(PS),
          (function (scope) {
            "use strict";
            (scope.readChunkImpl = function (fromString) {
              return function (fromBuffer) {
                return function (chunk) {
                  if (chunk instanceof Buffer) return fromBuffer(chunk);
                  if ("string" == typeof chunk) return fromString(chunk);
                  throw new Error(
                    "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " +
                      chunk,
                  );
                };
              };
            }),
              (scope.onDataEitherImpl = function (convert) {
                return function (stream) {
                  return function (callback) {
                    return function () {
                      stream.on("data", function (chunk) {
                        callback(convert(chunk))();
                      });
                    };
                  };
                };
              }),
              (scope.onEnd = function (stream) {
                return function (cb) {
                  return function () {
                    stream.on("end", cb);
                  };
                };
              }),
              (scope.write = function (stream) {
                return function (chunk) {
                  return function (cb) {
                    return function () {
                      return stream.write(chunk, null, cb);
                    };
                  };
                };
              }),
              (scope.writeStringImpl = function (stream) {
                return function (enc) {
                  return function (text) {
                    return function (cb) {
                      return function () {
                        return stream.write(text, enc, cb);
                      };
                    };
                  };
                };
              });
          })((PS["Node.Stream"] = PS["Node.Stream"] || {})),
          (function (scope) {
            "use strict";
            (scope.error = function (msg) {
              return new Error(msg);
            }),
              (scope.throwException = function (err) {
                return function () {
                  throw err;
                };
              });
          })((PS["Effect.Exception"] = PS["Effect.Exception"] || {})),
          (function (scope) {
            "use strict";
            scope["Effect.Exception"] = scope["Effect.Exception"] || {};
            var mod = scope["Effect.Exception"],
              self = scope["Effect.Exception"];
            mod.throw = function (msg) {
              return self.throwException(self.error(msg));
            };
          })(PS),
          (function (scope) {
            "use strict";
            (PS["Node.Buffer"] = PS["Node.Buffer"] || {}).toStringImpl =
              function (encoding) {
                return function (buffer) {
                  return function () {
                    return buffer.toString(encoding);
                  };
                };
              };
          })(),
          (function (scope) {
            "use strict";
            scope["Node.Buffer"] = scope["Node.Buffer"] || {};
            var mod = scope["Node.Buffer"],
              self = scope["Node.Buffer"],
              encoding = scope["Node.Encoding"];
            mod.toString = function (enc) {
              return self.toStringImpl(encoding.encodingToNode(enc));
            };
          })(PS),
          (function (scope) {
            "use strict";
            scope["Node.Stream"] = scope["Node.Stream"] || {};
            var mod = scope["Node.Stream"],
              self = scope["Node.Stream"],
              applicative = scope["Control.Applicative"],
              bind = scope["Control.Bind"],
              either = scope["Data.Either"],
              show = scope["Data.Show"],
              effect = scope.Effect,
              exception = scope["Effect.Exception"],
              buffer = scope["Node.Buffer"],
              encoding = scope["Node.Encoding"],
              readChunk = self.readChunkImpl(either.Left.create)(either.Right.create),
              onDataEither = function (stream) {
                return function (cb) {
                  return self.onDataEitherImpl(readChunk)(stream)(cb);
                };
              },
              onData = function (stream) {
                return function (cb) {
                  return onDataEither(stream)(
                    bind.composeKleisliFlipped(effect.bindEffect)(cb)(function (x) {
                      if (x instanceof either.Left)
                        return exception.throw("Stream encoding should not be set");
                      if (x instanceof either.Right)
                        return applicative.pure(effect.applicativeEffect)(x.value0);
                      throw new Error(
                        "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " +
                          [x.constructor.name],
                      );
                    }),
                  );
                };
              };
            (mod.onData = onData),
              (mod.onDataString = function (stream) {
                return function (enc) {
                  return function (cb) {
                    return onData(stream)(
                      bind.composeKleisliFlipped(effect.bindEffect)(cb)(buffer.toString(enc)),
                    );
                  };
                };
              }),
              (mod.onDataEither = onDataEither),
              (mod.writeString = function (stream) {
                return function (enc) {
                  return self.writeStringImpl(stream)(show.show(encoding.showEncoding)(enc));
                };
              }),
              (mod.onEnd = self.onEnd);
          })(PS),
          (function (scope) {
            "use strict";
            scope.ABC100C = scope.ABC100C || {};
            var mod = scope.ABC100C,
              applicative = scope["Control.Applicative"],
              bind = scope["Control.Bind"],
              category = scope["Control.Category"],
              array = scope["Data.Array"],
              bool = scope["Data.Boolean"],
              either = scope["Data.Either"],
              ering = scope["Data.EuclideanRing"],
              foldable = scope["Data.Foldable"],
              functor = scope["Data.Functor"],
              int = scope["Data.Int"],
              maybe = scope["Data.Maybe"],
              monoid = scope["Data.Monoid"],
              show = scope["Data.Show"],
              string = scope["Data.String.Common"],
              tuple = scope["Data.Tuple"],
              unit = scope["Data.Unit"],
              effect = scope.Effect,
              aff = scope["Effect.Aff"],
              effClass = scope["Effect.Class"],
              ref = scope["Effect.Ref"],
              encoding = scope["Node.Encoding"],
              proc = scope["Node.Process"],
              stream = scope["Node.Stream"],
              unsafe = scope["Partial.Unsafe"],
              solveValue = function (n) {
                return function (items) {
                  return foldable.foldl(foldable.foldableArray)(function (acc) {
                    return function (num) {
                      return (
                        (acc +
                          ((cnt = 0),
                          function (x) {
                            var out,
                              c = cnt,
                              done = !1;
                            function step(c, v) {
                              if (int.odd(v)) return (done = !0), c;
                              if (bool.otherwise)
                                return (
                                  (c = (c + 1) | 0),
                                  void (x = ering.div(ering.euclideanRingInt)(v)(2))
                                );
                              throw new Error(
                                "Failed pattern match at ABC100C (line 71, column 5 - line 73, column 37): " +
                                  [c.constructor.name, v.constructor.name],
                              );
                            }
                            for (; !done; ) out = step(c, x);
                            return out;
                          })(num)) |
                        0
                      );
                      var cnt;
                    };
                  })(0)(items);
                };
              },
              solve = function (input) {
                return either.either(function (err) {
                  return unsafe.unsafeCrashWith(err);
                })(category.identity(category.categoryFn))(
                  bind.bind(either.bindEither)(
                    either.note("n as")(
                      ((source = input),
                      2 === (rows = string.split("\n")(string.trim(source))).length
                        ? bind.bind(maybe.bindMaybe)(int.fromString(rows[0]))(function (n) {
                            var pieces,
                              values = array.mapMaybe(int.fromString)(
                                ((pieces = rows[1]), string.split(" ")(pieces)),
                              );
                            return applicative.pure(maybe.applicativeMaybe)(
                              new tuple.Tuple(n, values),
                            );
                          })
                        : maybe.Nothing.value),
                    ),
                  )(function (parsed) {
                    return applicative.pure(either.applicativeEither)(
                      show.show(show.showInt)(solveValue(parsed.value0)(parsed.value1)) + "\n",
                    );
                  }),
                );
                var source, rows;
              },
              readAll = aff.makeAff(function (cb) {
                return function () {
                  var r = ref.new("")();
                  return (
                    stream.onDataString(proc.stdin)(encoding.UTF8.value)(function (chunk) {
                      return function () {
                        var old = ref.read(r)();
                        return ref.write(old + chunk)(r)();
                      };
                    })(),
                    stream.onEnd(proc.stdin)(function () {
                      var value = ref.read(r)();
                      return cb(applicative.pure(either.applicativeEither)(value))();
                    })(),
                    monoid.mempty(aff.monoidCanceler)
                  );
                };
              }),
              main = aff.launchAff_(
                bind.bind(aff.bindAff)(readAll)(function (input) {
                  return bind.bind(aff.bindAff)(applicative.pure(aff.applicativeAff)(solve(input)))(
                    function (output) {
                      return effClass.liftEffect(aff.monadEffectAff)(
                        ((text = output),
                        functor.void(effect.functorEffect)(
                          stream.writeString(proc.stdout)(encoding.UTF8.value)(text)(
                            applicative.pure(effect.applicativeEffect)(unit.unit),
                          ),
                        )),
                      );
                      var text;
                    },
                  );
                }),
              );
            (mod.main = main), (mod.solve = solve);
          })(PS),
          PS.ABC100C.main();
      },
      {},
    ],
  },
  {},
  ["Focm"],
  null,
);