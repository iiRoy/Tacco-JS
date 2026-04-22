parcelRequire = function (e, r, t, n) {
  // Declare internal variables for parcelRequire and require
  var i,
    o = "function" == typeof parcelRequire && parcelRequire,
    u = "function" == typeof require && require;

  // The core 'require' function for modules
  function f(t, n) {
    // If the module is already in the cache, return its exports
    if (!r[t]) {
      // If the module definition doesn't exist
      if (!e[t]) {
        // Try to use a global parcelRequire if available and not a direct dependency
        var i = "function" == typeof parcelRequire && parcelRequire;
        if (!n && i) return i(t, !0);
        // Fallback to the original parcelRequire if available
        if (o) return o(t, !0);
        // Fallback to Node.js require if available and the module is a string
        if (u && "string" == typeof t) return u(t);

        // If module not found, throw an error
        var c = new Error("Cannot find module '" + t + "'");
        throw (c.code = "MODULE_NOT_FOUND"), c;
      }

      // Set up p.resolve for resolving relative paths within the module
      p.resolve = function (r) {
        return e[t][1][r] || r;
      };
      // Initialize module cache
      p.cache = {};

      // Create a new module instance and add it to the cache
      var l = (r[t] = new f.Module(t));

      // Execute the module's code, populating its exports
      e[t][0].call(l.exports, p, l, l.exports, this);
    }
    // Return the module's exports
    return r[t].exports;

    // Helper function for requiring modules within the current module
    function p(e) {
      return f(p.resolve(e));
    }
  }

  // Set parcelRequire properties
  f.isParcelRequire = !0;
  f.Module = function (e) {
    this.id = e;
    this.bundle = f;
    this.exports = {};
  };
  f.modules = e;
  f.cache = r;
  f.parent = o;
  f.register = function (r, t) {
    e[r] = [
      function (e, r) {
        r.exports = t;
      },
      {},
    ];
  };

  // Process initial modules
  for (var c = 0; c < t.length; c++)
    try {
      f(t[c]);
    } catch (e) {
      // Catch and store the first error
      i || (i = e);
    }

  // Handle main entry points and exports
  if (t.length) {
    var l = f(t[t.length - 1]);
    // Export for CommonJS
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = l)
      : // Export for AMD
      "function" == typeof define && define.amd
      ? define(function () {
          return l;
        })
      : // Export to global scope
        n && (this[n] = l);
  }

  // Set global parcelRequire to the created function
  if (((parcelRequire = f), i))
    // If an error occurred during module loading, re-throw it
    throw i;
  // Return the parcelRequire function
  return f;
}(
  // Module definitions object
  {
    Focm: [
      function (require, module, exports) {
        // Initialize the global namespace object 'n'
        var n = {};

        // Module: Control.Apply
        !(function (t) {
          "use strict";
          // Define arrayApply function
          (n["Control.Apply"] = n["Control.Apply"] || {}).arrayApply = function (
            n
          ) {
            return function (t) {
              for (
                var r = n.length,
                  a = t.length,
                  e = new Array(r * a),
                  o = 0,
                  i = 0;
                i < r;
                i++
              )
                for (var u = n[i], c = 0; c < a; c++) e[o++] = u(t[c]);
              return e;
            };
          };
        })(),
          // Module: Data.Boolean
          !(function (t) {
            "use strict";
            // Define 'otherwise' constant
            (n["Data.Boolean"] = n["Data.Boolean"] || {}).otherwise = !0;
          })(),
          // Module: Data.Eq
          !(function (t) {
            "use strict";
            // Define refEq function for reference equality
            (n["Data.Eq"] = n["Data.Eq"] || {}).refEq = function (n) {
              return function (t) {
                return n === t;
              };
            };
          })(),
          // Module: Data.Unit
          !(function (t) {
            "use strict";
            // Define 'unit' constant
            (n["Data.Unit"] = n["Data.Unit"] || {}).unit = {};
          })(),
          // Module: Data.Show
          !(function (t) {
            "use strict";
            // Define showIntImpl for showing integers
            (n["Data.Show"] = n["Data.Show"] || {}).showIntImpl = function (n) {
              return n.toString();
            };
          })(),
          // Module: Data.Show (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Show"],
              // Define Show constructor
              a = (
                n["Data.Symbol"],
                n["Record.Unsafe"],
                n["Type.Data.RowList"],
                function (n) {
                  this.show = n;
                }
              ),
              // Create an instance for showing Int
              e = new a(r.showIntImpl);
            t.Show = a;
            t.show = function (n) {
              return n.show;
            };
            t.showInt = e;
          })(n["Data.Show"] = n["Data.Show"] || {}),
          // Module: Data.Unit (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Unit"];
            n["Data.Show"];
            t.unit = r.unit;
          })(n["Data.Unit"] = n["Data.Unit"] || {}),
          // Module: Data.Eq (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Eq"],
              // Define Eq constructor
              a = (
                n["Data.HeytingAlgebra"],
                n["Data.Symbol"],
                n["Data.Unit"],
                n["Data.Void"],
                n["Record.Unsafe"],
                n["Type.Data.RowList"],
                function (n) {
                  this.eq = n;
                }
              ),
              // Create an instance for Int equality
              e = new a(r.refEq);
            t.Eq = a;
            t.eq = function (n) {
              return n.eq;
            };
            t.eqInt = e;
          })(n["Data.Eq"] = n["Data.Eq"] || {}),
          // Module: Data.Ord.Unsafe
          !(function (t) {
            "use strict";
            // Define unsafeCompareImpl function
            (n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {}).unsafeCompareImpl =
              function (n) {
                return function (t) {
                  return function (r) {
                    return function (a) {
                      return function (e) {
                        return a < e ? n : a === e ? t : r;
                      };
                    };
                  };
                };
              };
          })(),
          // Module: Data.Ordering
          !(function (t) {
            "use strict";
            n["Data.Eq"], n["Data.Semigroup"], n["Data.Show"];
            // Define LT constant
            var r = (function () {
                function n() {}
                return (n.value = new n()), n;
              })(),
              // Define GT constant
              a = (function () {
                function n() {}
                return (n.value = new n()), n;
              })(),
              // Define EQ constant
              e = (function () {
                function n() {}
                return (n.value = new n()), n;
              })();
            t.LT = r;
            t.GT = a;
            t.EQ = e;
          })(n["Data.Ordering"] = n["Data.Ordering"] || {}),
          // Module: Data.Ord.Unsafe (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Ord.Unsafe"],
              a = n["Data.Ordering"],
              // Create unsafeCompare instance
              e = r.unsafeCompareImpl(a.LT.value)(a.EQ.value)(a.GT.value);
            t.unsafeCompare = e;
          })(n["Data.Ord.Unsafe"] = n["Data.Ord.Unsafe"] || {}),
          // Module: Data.Ord
          !(function (t) {
            "use strict";
            n["Data.Ord"];
            var r = n["Data.Eq"],
              a = n["Data.Ord.Unsafe"],
              // Define Ord constructor
              e = (
                n["Data.Ordering"],
                n["Data.Ring"],
                n["Data.Semiring"],
                n["Data.Symbol"],
                n["Data.Unit"],
                n["Data.Void"],
                n["Record.Unsafe"],
                n["Type.Data.RowList"],
                function (n, t) {
                  this.Eq0 = n;
                  this.compare = t;
                }
              ),
              // Create an instance for Int ordering
              o = new e(
                function () {
                  return r.eqInt;
                },
                a.unsafeCompare
              );
            t.Ord = e;
            t.compare = function (n) {
              return n.compare;
            };
            t.ordInt = o;
          })(n["Data.Ord"] = n["Data.Ord"] || {}),
          // Module: Data.Function
          !(function (t) {
            "use strict";
            n["Control.Category"],
              n["Data.Boolean"],
              n["Data.Ord"],
              n["Data.Ring"];
            // Define flip function
            t.flip = function (n) {
              return function (t) {
                return function (r) {
                  return n(r)(t);
                };
              };
            };
            // Define const function
            t.const = function (n) {
              return function (t) {
                return n;
              };
            };
          })(n["Data.Function"] = n["Data.Function"] || {}),
          // Module: Data.Functor
          !(function (t) {
            "use strict";
            // Define arrayMap function
            (n["Data.Functor"] = n["Data.Functor"] || {}).arrayMap = function (
              n
            ) {
              return function (t) {
                for (var r = t.length, a = new Array(r), e = 0; e < r; e++)
                  a[e] = n(t[e]);
                return a;
              };
            };
          })(),
          // Module: Data.Functor (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Functor"],
              a = (n["Control.Semigroupoid"], n["Data.Function"]),
              e = n["Data.Unit"],
              // Define Functor constructor
              o = function (n) {
                this.map = n;
              },
              // Helper for map
              i = function (n) {
                return n.map;
              },
              // Create an instance for Array Functor
              u = new o(r.arrayMap);
            t.Functor = o;
            t.map = i;
            t.void = function (n) {
              return i(n)(a.const(e.unit));
            };
            t.functorArray = u;
          })(n["Data.Functor"] = n["Data.Functor"] || {}),
          // Module: Control.Apply (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Control.Apply"],
              a = (n["Control.Category"], n["Data.Function"], n["Data.Functor"]),
              // Define Apply constructor
              e = function (n, t) {
                this.Functor0 = n;
                this.apply = t;
              },
              // Create an instance for Array Apply
              o = new e(
                function () {
                  return a.functorArray;
                },
                r.arrayApply
              );
            t.Apply = e;
            t.apply = function (n) {
              return n.apply;
            };
            t.applyArray = o;
          })(n["Control.Apply"] = n["Control.Apply"] || {}),
          // Module: Control.Applicative
          !(function (t) {
            "use strict";
            n["Control.Apply"], n["Data.Functor"], n["Data.Unit"];
            // Define Applicative constructor
            t.Applicative = function (n, t) {
              this.Apply0 = n;
              this.pure = t;
            };
            t.pure = function (n) {
              return n.pure;
            };
          })(n["Control.Applicative"] = n["Control.Applicative"] || {}),
          // Module: Control.Bind
          !(function (t) {
            "use strict";
            // Define arrayBind function
            (n["Control.Bind"] = n["Control.Bind"] || {}).arrayBind = function (
              n
            ) {
              return function (t) {
                for (var r = [], a = 0, e = n.length; a < e; a++)
                  Array.prototype.push.apply(r, t(n[a]));
                return r;
              };
            };
          })(),
          // Module: Control.Bind (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Control.Bind"],
              a = (n["Control.Applicative"], n["Control.Apply"]),
              e = (n["Control.Category"], n["Data.Function"]),
              o = (n["Data.Functor"], n["Data.Unit"]),
              // Define Bind constructor
              i = function (n, t) {
                this.Apply0 = n;
                this.bind = t;
              },
              // Define Discard constructor
              u = function (n) {
                this.discard = n;
              },
              // Create an instance for Array Bind
              c = new i(
                function () {
                  return a.applyArray;
                },
                r.arrayBind
              ),
              // Helper for bind
              f = function (n) {
                return n.bind;
              },
              // Create an instance for Unit Discard
              l = new u(function (n) {
                return f(n);
              });
            t.Bind = i;
            t.bind = f;
            t.bindFlipped = function (n) {
              return e.flip(f(n));
            };
            t.Discard = u;
            t.discard = function (n) {
              return n.discard;
            };
            t.bindArray = c;
            t.discardUnit = l;
          })(n["Control.Bind"] = n["Control.Bind"] || {}),
          // Module: Control.Monad.ST.Internal
          !(function (n) {
            "use strict";
            n.map_ = function (n) {
              return function (t) {
                return function () {
                  return n(t());
                };
              };
            };
            n.pure_ = function (n) {
              return function () {
                return n;
              };
            };
            n.bind_ = function (n) {
              return function (t) {
                return function () {
                  return t(n())();
                };
              };
            };
            n.while = function (n) {
              return function (t) {
                return function () {
                  for (; n(); ) t();
                };
              };
            };
            n.new = function (n) {
              return function () {
                return { value: n };
              };
            };
            n.read = function (n) {
              return function () {
                return n.value;
              };
            };
            n.write = function (n) {
              return function (t) {
                return function () {
                  return (t.value = n);
                };
              };
            };
          })(n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {}),
          // Module: Control.Monad
          !(function (t) {
            "use strict";
            var r = n["Control.Applicative"],
              a = (n["Control.Apply"], n["Control.Bind"]);
            n["Data.Functor"], n["Data.Unit"];
            // Define Monad constructor
            t.Monad = function (n, t) {
              this.Applicative0 = n;
              this.Bind1 = t;
            };
            // Define ap function
            t.ap = function (n) {
              return function (t) {
                return function (e) {
                  return a.bind(n.Bind1())(t)(function (t) {
                    return a.bind(n.Bind1())(e)(function (a) {
                      return r.pure(n.Applicative0())(t(a));
                    });
                  });
                };
              };
            };
          })(n["Control.Monad"] = n["Control.Monad"] || {}),
          // Module: Data.Maybe
          !(function (t) {
            "use strict";
            n["Control.Alt"], n["Control.Alternative"], n["Control.Applicative"];
            var r = n["Control.Apply"],
              a = n["Control.Bind"],
              e = (
                n["Control.Category"],
                n["Control.Extend"],
                n["Control.Monad"],
                n["Control.MonadZero"],
                n["Control.Plus"],
                n["Data.Bounded"],
                n["Data.Eq"],
                n["Data.Function"],
                n["Data.Functor"]
              ),
              o = (
                n["Data.Functor.Invariant"],
                n["Data.Monoid"],
                n["Data.Ord"],
                n["Data.Ordering"],
                n["Data.Semigroup"],
                n["Data.Show"],
                n["Data.Unit"],
                n.Prelude,
                // Define Nothing constant
                function () {
                  function n() {}
                  return (n.value = new n()), n;
                }
              )(),
              // Define Just constructor
              i = function () {
                function n(n) {
                  this.value0 = n;
                }
                return (
                  (n.create = function (t) {
                    return new n(t);
                  }),
                  n
                );
              }(),
              // Create an instance for Maybe Functor
              u = new e.Functor(function (n) {
                return function (t) {
                  return t instanceof i ? new i(n(t.value0)) : o.value;
                };
              }),
              // Create an instance for Maybe Apply
              c = new r.Apply(
                function () {
                  return u;
                },
                function (n) {
                  return function (t) {
                    if (n instanceof i) return e.map(u)(n.value0)(t);
                    if (n instanceof o) return o.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " +
                        [n.constructor.name, t.constructor.name]
                    );
                  };
                }
              ),
              // Create an instance for Maybe Bind
              f = new a.Bind(
                function () {
                  return c;
                },
                function (n) {
                  return function (t) {
                    if (n instanceof i) return t(n.value0);
                    if (n instanceof o) return o.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " +
                        [n.constructor.name, t.constructor.name]
                    );
                  };
                }
              );
            t.Nothing = o;
            t.Just = i;
            t.maybe = function (n) {
              return function (t) {
                return function (r) {
                  if (r instanceof o) return n;
                  if (r instanceof i) return t(r.value0);
                  throw new Error(
                    "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " +
                      [n.constructor.name, t.constructor.name, r.constructor.name]
                  );
                };
              };
            };
            t.functorMaybe = u;
            t.applyMaybe = c;
            t.bindMaybe = f;
          })(n["Data.Maybe"] = n["Data.Maybe"] || {}),
          // Module: Data.Either
          !(function (t) {
            "use strict";
            n["Control.Alt"];
            var r = n["Control.Applicative"],
              a = n["Control.Apply"],
              e = n["Control.Bind"],
              o = (
                n["Control.Extend"],
                n["Control.Monad"],
                n["Control.Semigroupoid"],
                n["Data.Bifoldable"],
                n["Data.Bifunctor"],
                n["Data.Bitraversable"],
                n["Data.Bounded"],
                n["Data.Eq"],
                n["Data.Foldable"],
                n["Data.FoldableWithIndex"],
                n["Data.Function"],
                n["Data.Functor"]
              ),
              i = (
                n["Data.Functor.Invariant"],
                n["Data.FunctorWithIndex"],
                n["Data.Maybe"]
              ),
              u = (
                n["Data.Monoid"],
                n["Data.Ord"],
                n["Data.Ordering"],
                n["Data.Semigroup"],
                n["Data.Show"],
                n["Data.Traversable"],
                n["Data.TraversableWithIndex"],
                n["Data.Unit"],
                n.Prelude,
                // Define Left constructor
                function () {
                  function n(n) {
                    this.value0 = n;
                  }
                  return (
                    (n.create = function (t) {
                      return new n(t);
                    }),
                    n
                  );
                }()
              ),
              // Define Right constructor
              c = function () {
                function n(n) {
                  this.value0 = n;
                }
                return (
                  (n.create = function (t) {
                    return new n(t);
                  }),
                  n
                );
              }(),
              // Create an instance for Either Functor
              f = new o.Functor(function (n) {
                return function (t) {
                  if (t instanceof u) return new u(t.value0);
                  if (t instanceof c) return new c(n(t.value0));
                  throw new Error(
                    "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " +
                      [t.constructor.name]
                  );
                };
              }),
              // Helper for either
              l = function (n) {
                return function (t) {
                  return function (r) {
                    if (r instanceof u) return n(r.value0);
                    if (r instanceof c) return t(r.value0);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " +
                        [
                          n.constructor.name,
                          t.constructor.name,
                          r.constructor.name,
                        ]
                    );
                  };
                };
              },
              // Create an instance for Either Apply
              s = new a.Apply(
                function () {
                  return f;
                },
                function (n) {
                  return function (t) {
                    if (n instanceof u) return new u(n.value0);
                    if (n instanceof c) return o.map(f)(n.value0)(t);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " +
                        [n.constructor.name, t.constructor.name]
                    );
                  };
                }
              ),
              // Create an instance for Either Bind
              d = new e.Bind(
                function () {
                  return s;
                },
                l(function (n) {
                  return function (t) {
                    return new u(n);
                  };
                })(function (n) {
                  return function (t) {
                    return t(n);
                  };
                })
              ),
              // Create an instance for Either Applicative
              p = new r.Applicative(
                function () {
                  return s;
                },
                c.create
              );
            t.Left = u;
            t.Right = c;
            t.either = l;
            t.note = function (n) {
              return i.maybe(new u(n))(c.create);
            };
            t.functorEither = f;
            t.applyEither = s;
            t.applicativeEither = p;
            t.bindEither = d;
          })(n["Data.Either"] = n["Data.Either"] || {}),
          // Module: Partial.Unsafe
          !(function (t) {
            "use strict";
            // Define unsafePartial function
            (n["Partial.Unsafe"] = n["Partial.Unsafe"] || {}).unsafePartial =
              function (n) {
                return n();
              };
          })(),
          // Module: Partial
          !(function (t) {
            "use strict";
            // Define crashWith function
            (n["Partial"] = n["Partial"] || {}).crashWith = function () {
              return function (n) {
                throw new Error(n);
              };
            };
          })(),
          // Module: Partial (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n.Partial;
            t.crashWith = r.crashWith;
          })(n.Partial = n.Partial || {}),
          // Module: Partial.Unsafe (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Partial.Unsafe"],
              a = n.Partial;
            // Define unsafeCrashWith function
            t.unsafeCrashWith = function (n) {
              return r.unsafePartial(function (t) {
                return a.crashWith(t)(n);
              });
            };
          })(n["Partial.Unsafe"] = n["Partial.Unsafe"] || {}),
          // Module: Control.Monad.Rec.Class
          !(function (t) {
            "use strict";
            n["Control.Applicative"],
              n["Control.Bind"],
              n["Control.Monad"],
              n["Control.Semigroupoid"],
              n["Data.Bifunctor"],
              n["Data.Either"],
              n["Data.Functor"],
              n["Data.Identity"],
              n["Data.Maybe"],
              n["Data.Unit"],
              n.Effect,
              n["Effect.Ref"],
              n["Partial.Unsafe"],
              n.Prelude;
            // Define Loop constructor
            var r = function () {
                function n(n) {
                  this.value0 = n;
                }
                return (
                  (n.create = function (t) {
                    return new n(t);
                  }),
                  n
                );
              }(),
              // Define Done constructor
              a = function () {
                function n(n) {
                  this.value0 = n;
                }
                return (
                  (n.create = function (t) {
                    return new n(t);
                  }),
                  n
                );
              }(),
              // Helper for tailRecM
              e = function (n) {
                return n.tailRecM;
              };
            t.Loop = r;
            t.Done = a;
            // Define MonadRec constructor
            t.MonadRec = function (n, t) {
              this.Monad0 = n;
              this.tailRecM = t;
            };
            t.tailRecM = e;
            // Define tailRecM2 function
            t.tailRecM2 = function (n) {
              return function (t) {
                return function (r) {
                  return function (a) {
                    return e(n)(function (n) {
                      return t(n.a)(n.b);
                    })({ a: r, b: a });
                  };
                };
              };
            };
          })(n["Control.Monad.Rec.Class"] = n["Control.Monad.Rec.Class"] || {}),
          // Module: Control.Monad.ST.Internal (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Control.Monad.ST.Internal"],
              a = n["Control.Applicative"],
              e = n["Control.Apply"],
              o = n["Control.Bind"],
              i = n["Control.Monad"],
              u = n["Control.Monad.Rec.Class"],
              c = n["Data.Functor"],
              f = n["Data.Unit"],
              l = (n["Partial.Unsafe"], n.Prelude, new c.Functor(r.map_)),
              // Monad instance for ST
              s = new i.Monad(
                function () {
                  return D;
                },
                function () {
                  return d;
                }
              ),
              // Bind instance for ST
              d = new o.Bind(
                function () {
                  return p;
                },
                r.bind_
              ),
              // Apply instance for ST
              p = new e.Apply(
                function () {
                  return l;
                },
                i.ap(s)
              ),
              // Applicative instance for ST
              D = new a.Applicative(
                function () {
                  return p;
                },
                r.pure_
              ),
              // MonadRec instance for ST
              m = new u.MonadRec(
                function () {
                  return s;
                },
                function (n) {
                  return function (t) {
                    var e = function (n) {
                        return n instanceof u.Loop;
                      },
                      i = function (n) {
                        if (n instanceof u.Done) return n.value0;
                        throw new Error(
                          "Failed pattern match at Control.Monad.ST.Internal (line 54, column 32 - line 54, column 46): " +
                            [n.constructor.name]
                        );
                      };
                    return o.bind(d)(o.bindFlipped(d)(r.new)(n(t)))(function (
                      t
                    ) {
                      return o.discard(o.discardUnit)(d)(
                        r.while(c.map(l)(e)(r.read(t)))(
                          o.bind(d)(r.read(t))(function (e) {
                            if (e instanceof u.Loop)
                              return o.bind(d)(n(e.value0))(function (n) {
                                return c.void(l)(r.write(n)(t));
                              });
                            if (e instanceof u.Done) return a.pure(D)(f.unit);
                            throw new Error(
                              "Failed pattern match at Control.Monad.ST.Internal (line 46, column 18 - line 50, column 28): " +
                                [e.constructor.name]
                            );
                          })
                        )
                      )(function () {
                        return c.map(l)(i)(r.read(t));
                      });
                    });
                  };
                }
              );
            t.functorST = l;
            t.applyST = p;
            t.applicativeST = D;
            t.bindST = d;
            t.monadST = s;
            t.monadRecST = m;
          })(n["Control.Monad.ST.Internal"] = n["Control.Monad.ST.Internal"] || {}),
          // Module: Data.Array
          !(function (n) {
            "use strict";
            // Range function for arrays
            n.range = function (n) {
              return function (t) {
                for (
                  var r = n > t ? -1 : 1,
                    a = new Array(r * (t - n) + 1),
                    e = n,
                    o = 0;
                  e !== t;

                )
                  (a[o++] = e), (e += r);
                return (a[o] = e), a;
              };
            };
            // Replicate function for arrays
            n.replicate =
              "function" == typeof Array.prototype.fill
                ? function (n) {
                    return function (t) {
                      return n < 1 ? [] : new Array(n).fill(t);
                    };
                  }
                : function (n) {
                    return function (t) {
                      for (var r = [], a = 0, e = 0; e < n; e++) r[a++] = t;
                      return r;
                    };
                  };
            // Length function for arrays
            n.length = function (n) {
              return n.length;
            };
            // Index function for arrays with bounds checking
            n.indexImpl = function (n) {
              return function (t) {
                return function (r) {
                  return function (a) {
                    return a < 0 || a >= r.length ? t : n(r[a]);
                  };
                };
              };
            };
            // Slice function for arrays
            n.slice = function (n) {
              return function (t) {
                return function (r) {
                  return r.slice(n, t);
                };
              };
            };
            // Drop function for arrays
            n.drop = function (n) {
              return function (t) {
                return n < 1 ? t : t.slice(n);
              };
            };
            // ZipWith function for arrays
            n.zipWith = function (n) {
              return function (t) {
                return function (r) {
                  for (
                    var a = t.length < r.length ? t.length : r.length,
                      e = new Array(a),
                      o = 0;
                    o < a;
                    o++
                  )
                    e[o] = n(t[o])(r[o]);
                  return e;
                };
              };
            };
            // Unsafe index function for arrays
            n.unsafeIndexImpl = function (n) {
              return function (t) {
                return n[t];
              };
            };
          })(n["Data.Array"] = n["Data.Array"] || {}),
          // Module: Data.Array.ST
          !(function (n) {
            "use strict";
            // Poke function for ST arrays
            n.poke = function (n) {
              return function (t) {
                return function (r) {
                  return function () {
                    var a = n >= 0 && n < r.length;
                    return a && (r[n] = t), a;
                  };
                };
              };
            };
            // SortByImpl function for ST arrays
            n.sortByImpl = function (n) {
              return function (t) {
                return function () {
                  return t.sort(function (t, r) {
                    return n(t)(r);
                  });
                };
              };
            };
          })(n["Data.Array.ST"] = n["Data.Array.ST"] || {}),
          // Module: Unsafe.Coerce
          !(function (t) {
            "use strict";
            // Define unsafeCoerce function
            (n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {}).unsafeCoerce =
              function (n) {
                return n;
              };
          })(),
          // Module: Unsafe.Coerce (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Unsafe.Coerce"];
            t.unsafeCoerce = r.unsafeCoerce;
          })(n["Unsafe.Coerce"] = n["Unsafe.Coerce"] || {}),
          // Module: Data.Array.ST (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Array.ST"],
              a = n["Control.Applicative"],
              e = (
                n["Control.Bind"],
                n["Control.Monad.ST"],
                n["Control.Monad.ST.Internal"]
              ),
              o = (
                n["Control.Semigroupoid"],
                n["Data.Maybe"],
                n["Data.Ord"],
                n["Data.Ordering"]
              );
            n["Data.Ring"], n.Prelude, n["Unsafe.Coerce"];
            // Define sortBy function
            t.sortBy = function (n) {
              return r.sortByImpl(function (t) {
                return function (r) {
                  var a = n(t)(r);
                  if (a instanceof o.GT) return 1;
                  if (a instanceof o.EQ) return 0;
                  if (a instanceof o.LT) return -1;
                  throw new Error(
                    "Failed pattern match at Data.Array.ST (line 94, column 15 - line 99, column 1): " +
                      [a.constructor.name]
                  );
                };
              });
            };
            // Define unsafeFreeze function
            t.unsafeFreeze = function (n) {
              return a.pure(e.applicativeST)(n);
            };
            // Define unsafeThaw function
            t.unsafeThaw = function (n) {
              return a.pure(e.applicativeST)(n);
            };
            t.poke = r.poke;
          })(n["Data.Array.ST"] = n["Data.Array.ST"] || {}),
          // Module: Data.Array (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Array"],
              a = (
                n["Control.Alt"],
                n["Control.Alternative"],
                n["Control.Applicative"]
              ),
              e = (n["Control.Apply"], n["Control.Bind"]),
              o = (
                n["Control.Category"],
                n["Control.Lazy"],
                n["Control.Monad.Rec.Class"]
              ),
              i = (
                n["Control.Monad.ST"],
                n["Control.Monad.ST.Internal"],
                n["Control.Semigroupoid"],
                n["Data.Array.NonEmpty.Internal"],
                n["Data.Array.ST"],
                n["Data.Array.ST.Iterator"],
                n["Data.Boolean"]
              ),
              u = (
                n["Data.Eq"],
                n["Data.Foldable"],
                n["Data.Function"]
              ),
              c = (
                n["Data.Functor"],
                n["Data.HeytingAlgebra"],
                n["Data.Maybe"]
              ),
              f = (
                n["Data.Ord"],
                n["Data.Ordering"],
                n["Data.Ring"],
                n["Data.Semigroup"],
                n["Data.Semiring"],
                n["Data.Traversable"],
                n["Data.Tuple"],
                n["Data.Unfoldable"],
                n["Partial.Unsafe"],
                n.Prelude,
                n["Unsafe.Coerce"],
                // Helper for unsafeIndex
                function (n) {
                  return r.unsafeIndexImpl;
                }
              ),
              // Helper for singleton array
              l = function (n) {
                return [n];
              },
              // Helper for indexing with Maybe
              s = r.indexImpl(c.Just.create)(c.Nothing.value),
              // Helper for concatMap
              d = u.flip(e.bind(e.bindArray));
            t.singleton = l;
            t.head = function (n) {
              return s(n)(0);
            };
            t.index = s;
            t.concatMap = d;
            t.mapMaybe = function (n) {
              return d(function (t) {
                return c.maybe([])(l)(n(t));
              });
            };
            t.mapWithIndex = function (n) {
              return function (t) {
                return r.zipWith(n)(r.range(0)(r.length(t) - 1 || 0))(t);
              };
            };
            t.foldRecM = function (n) {
              return function (t) {
                return function (u) {
                  return function (c) {
                    return o.tailRecM2(n)(function (u) {
                      return function (l) {
                        if (l >= r.length(c))
                          return a.pure(n.Monad0().Applicative0())(
                            new o.Done(u)
                          );
                        if (i.otherwise)
                          return e.bind(n.Monad0().Bind1())(t(u)(f()(c)(l)))(
                            function (t) {
                              return a.pure(n.Monad0().Applicative0())(
                                new o.Loop({ a: t, b: l + 1 || 0 })
                              );
                            }
                          );
                        throw new Error(
                          "Failed pattern match at Data.Array (line 1099, column 3 - line 1103, column 42): " +
                            [u.constructor.name, l.constructor.name]
                        );
                      };
                    })(u)(0);
                  };
                };
              };
            };
            t.unsafeIndex = f;
            t.replicate = r.replicate;
            t.drop = r.drop;
          })(n["Data.Array"] = n["Data.Array"] || {}),
          // Module: Data.Int
          !(function (t) {
            "use strict";
            // Define fromStringAsImpl for parsing integers from strings
            (n["Data.Int"] = n["Data.Int"] || {}).fromStringAsImpl = function (
              n
            ) {
              return function (t) {
                return function (r) {
                  var a;
                  a =
                    r < 11
                      ? "[0-" + (r - 1).toString() + "]"
                      : 11 === r
                      ? "[0-9a]"
                      : "[0-9a-" + String.fromCharCode(86 + r) + "]";
                  var e = new RegExp("^[\\+\\-]?" + a + "+$", "i");
                  return function (a) {
                    if (e.test(a)) {
                      var o = parseInt(a, r);
                      return (0 | o) === o ? n(o) : t;
                    }
                    return t;
                  };
                };
              };
            };
          })(),
          // Module: Data.Int (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.Int"],
              a = (
                n["Control.Category"],
                n["Control.Semigroupoid"],
                n["Data.Boolean"],
                n["Data.Bounded"],
                n["Data.CommutativeRing"],
                n["Data.DivisionRing"],
                n["Data.Eq"],
                n["Data.EuclideanRing"],
                n["Data.HeytingAlgebra"],
                n["Data.Int.Bits"],
                n["Data.Maybe"]
              ),
              e = (
                n["Data.Ord"],
                n["Data.Ordering"],
                n["Data.Ring"],
                n["Data.Semiring"],
                n["Data.Show"],
                n.Global,
                n.Math,
                n.Prelude,
                r.fromStringAsImpl(a.Just.create)(a.Nothing.value)
              ),
              o = e(10);
            t.fromString = o;
            t.fromStringAs = e;
          })(n["Data.Int"] = n["Data.Int"] || {}),
          // Module: Data.String.CodeUnits
          !(function (t) {
            "use strict";
            // Define length function for strings
            (n["Data.String.CodeUnits"] = n["Data.String.CodeUnits"] || {}).length =
              function (n) {
                return n.length;
              };
          })(),
          // Module: Data.String.CodeUnits (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.String.CodeUnits"];
            n["Control.Semigroupoid"],
              n["Data.Boolean"],
              n["Data.Eq"],
              n["Data.Function"],
              n["Data.HeytingAlgebra"],
              n["Data.Maybe"],
              n["Data.Ord"],
              n["Data.Ring"],
              n["Data.Semiring"],
              n["Data.String.Pattern"],
              n["Data.String.Unsafe"],
              n.Prelude;
            t.length = r.length;
          })(n["Data.String.CodeUnits"] = n["Data.String.CodeUnits"] || {}),
          // Module: Data.String.Common
          !(function (n) {
            "use strict";
            // Define split function for strings
            n.split = function (n) {
              return function (t) {
                return t.split(n);
              };
            };
            // Define trim function for strings
            n.trim = function (n) {
              return n.trim();
            };
            // Define joinWith function for strings
            n.joinWith = function (n) {
              return function (t) {
                return t.join(n);
              };
            };
          })(n["Data.String.Common"] = n["Data.String.Common"] || {}),
          // Module: Data.String.Common (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Data.String.Common"];
            n["Data.Eq"],
              n["Data.Ordering"],
              n["Data.String.Pattern"],
              n.Prelude;
            t.split = r.split;
            t.trim = r.trim;
            t.joinWith = r.joinWith;
          })(n["Data.String.Common"] = n["Data.String.Common"] || {}),
          // Module: AtCoder.ABC113.C
          !(function (t) {
            "use strict";
            var r = n["Control.Applicative"],
              a = n["Control.Bind"],
              e = (n["Control.Monad.ST"], n["Control.Monad.ST.Internal"]),
              o = n["Data.Array"],
              i = n["Data.Array.ST"],
              u = n["Data.Either"],
              c = (n["Data.Eq"], n["Data.Functor"]),
              f = n["Data.Int"],
              l = n["Data.Maybe"],
              s = n["Data.Ord"],
              d = n["Data.Ordering"],
              p = (n["Data.Ring"], n["Data.Semigroup"], n["Data.Semiring"], n["Data.Show"]),
              D = (n["Data.String"], n["Data.String.CodeUnits"]),
              m = n["Data.String.Common"],
              C = (n["Data.String.Pattern"], n["Partial.Unsafe"]),
              h = (n.Prelude,
              function (n) {
                // Split input into lines and trim
                var t = m.split("\n")(m.trim(n));
                return a.bind(u.bindEither)(
                  // Parse N and M from the first line
                  u.note("n m")(
                    a.bind(l.bindMaybe)(o.head(t))(function (n) {
                      var t = o.mapMaybe(f.fromString)(m.split(" ")(n));
                      return 2 === t.length
                        ? new l.Just({ n: t[0], m: t[1] })
                        : l.Nothing.value;
                    })
                  )
                )(function (n) {
                  // Parse city data from remaining lines
                  var a = c.map(c.functorArray)(function (n) {
                    var t = o.mapMaybe(f.fromString)(m.split(" ")(n));
                    return 2 === t.length
                      ? { p: t[0], y: t[1] }
                      : C.unsafeCrashWith("p y line");
                  })(o.drop(1)(t));
                  return r.pure(u.applicativeEither)(
                    m.joinWith("\n")(
                      (n.n,
                      function (n) {
                        return function (t) {
                          var r, a, u,
                            // Helper to format city IDs with leading zeros
                            c = function (n) {
                              var t = p.show(p.showInt)(n),
                                r = D.length(t);
                              return 0 === r
                                ? "000000"
                                : 1 === r
                                ? "00000" + t
                                : 2 === r
                                ? "0000" + t
                                : 3 === r
                                ? "000" + t
                                : 4 === r
                                ? "00" + t
                                : 5 === r
                                ? "0" + t
                                : t;
                            };
                          return (
                            // Thaw array, add index, sort by prefecture then year
                            (r = i.unsafeThaw(
                              o.mapWithIndex(function (n) {
                                return function (t) {
                                  return { p: t.p, y: t.y, i: n };
                                };
                              })(t)
                            )()),
                            i.sortBy(function (n) {
                              return function (t) {
                                var r = s.compare(s.ordInt)(n.p)(t.p);
                                if (r instanceof d.LT) return d.LT.value;
                                if (r instanceof d.GT) return d.GT.value;
                                if (r instanceof d.EQ)
                                  return s.compare(s.ordInt)(n.y)(t.y);
                                throw new Error(
                                  "Failed pattern match at AtCoder.ABC113.C (line 58, column 9 - line 61, column 30): " +
                                    [r.constructor.name]
                                );
                              };
                            })(r)(),
                            (a = i.unsafeFreeze(r)()),
                            // Prepare array for results
                            (u = i.unsafeThaw(o.replicate(n)(""))()),
                            // Fold over sorted array to assign new IDs
                            o.foldRecM(e.monadRecST)(function (n) {
                              return function (t) {
                                var r = (n["p'"] !== t.p ? 0 : n.x) + 1 || 0;
                                return function () {
                                  return (
                                    i.poke(t.i)(c(t.p) + c(r))(u)(),
                                    { "p'": t.p, x: r }
                                  );
                                };
                              };
                            })({ "p'": -1, x: 0 })(a)(),
                            i.unsafeFreeze(u)()
                          );
                        };
                      })(n.m)(a)
                    )
                  );
                });
              });
            // Define solve function
            t.solve = function (n) {
              var t = h(n);
              if (t instanceof u.Left) return C.unsafeCrashWith(t.value0);
              if (t instanceof u.Right) return t.value0;
              throw new Error(
                "Failed pattern match at AtCoder.ABC113.C (line 20, column 3 - line 22, column 24): " +
                  [t.constructor.name]
              );
            };
          })(n["AtCoder.ABC113.C"] = n["AtCoder.ABC113.C"] || {}),
          // Module: Effect.Console
          !(function (t) {
            "use strict";
            // Define log function for console output
            (n["Effect.Console"] = n["Effect.Console"] || {}).log = function (
              n
            ) {
              return function () {
                return console.log(n), {};
              };
            };
          })(),
          // Module: Effect.Console (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Effect.Console"];
            n["Data.Show"], n["Data.Unit"], n.Effect;
            t.log = r.log;
          })(n["Effect.Console"] = n["Effect.Console"] || {}),
          // Module: Node.Encoding
          !(function (t) {
            "use strict";
            n["Node.Encoding"];
            var r = n["Data.Show"],
              // Define ASCII encoding
              a = (n.Prelude, function () {
                function n() {}
                return (n.value = new n()), n;
              })(),
              // Define UTF8 encoding
              e = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define UTF16LE encoding
              o = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define UCS2 encoding
              i = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define Base64 encoding
              u = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define Latin1 encoding
              c = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define Binary encoding
              f = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Define Hex encoding
              l = function () {
                function n() {}
                return (n.value = new n()), n;
              }(),
              // Create an instance for showing Encoding
              s = new r.Show(function (n) {
                if (n instanceof a) return "ASCII";
                if (n instanceof e) return "UTF8";
                if (n instanceof o) return "UTF16LE";
                if (n instanceof i) return "UCS2";
                if (n instanceof u) return "Base64";
                if (n instanceof c) return "Latin1";
                if (n instanceof f) return "Binary";
                if (n instanceof l) return "Hex";
                throw new Error(
                  "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " +
                    [n.constructor.name]
                );
              });
            t.ASCII = a;
            t.UTF8 = e;
            t.UTF16LE = o;
            t.UCS2 = i;
            t.Base64 = u;
            t.Latin1 = c;
            t.Binary = f;
            t.Hex = l;
            t.showEncoding = s;
          })(n["Node.Encoding"] = n["Node.Encoding"] || {}),
          // Module: Node.FS.Internal
          !(function (t) {
            "use strict";
            // Unsafe require 'fs' module
            (n["Node.FS.Internal"] = n["Node.FS.Internal"] || {}).unsafeRequireFS =
              require("fs");
          })(),
          // Module: Node.FS.Internal (part 2, exports)
          !(function (t) {
            "use strict";
            var r = n["Node.FS.Internal"],
              a = (n.Effect, n.Prelude, n["Unsafe.Coerce"].unsafeCoerce);
            t.mkEffect = a;
            t.unsafeRequireFS = r.unsafeRequireFS;
          })(n["Node.FS.Internal"] = n["Node.FS.Internal"] || {}),
          // Module: Node.FS.Sync
          !(function (t) {
            "use strict";
            n["Control.Bind"],
              n["Control.Semigroupoid"],
              n["Data.DateTime"],
              n["Data.DateTime.Instant"],
              n["Data.EuclideanRing"],
              n["Data.Function"],
              n["Data.Function.Uncurried"],
              n["Data.Functor"],
              n["Data.Int"],
              n["Data.Maybe"],
              n["Data.Nullable"];
            var r = n["Data.Show"],
              a = (
                n["Data.Time.Duration"],
                n.Effect,
                n["Node.Buffer"],
                n["Node.Encoding"]
              ),
              e = (n["Node.FS"], n["Node.FS.Internal"]),
              o = (
                n["Node.FS.Perms"],
                n["Node.FS.Stats"],
                n["Node.Path"],
                n.Prelude,
                e.unsafeRequireFS
              );
            // Define readTextFile function
            t.readTextFile = function (n) {
              return function (t) {
                return e.mkEffect(function (e) {
                  return o.readFileSync(t, {
                    encoding: r.show(a.showEncoding)(n),
                  });
                });
              };
            };
          })(n["Node.FS.Sync"] = n["Node.FS.Sync"] || {}),
          // Module: Main
          !(function (t) {
            "use strict";
            var r = n["AtCoder.ABC113.C"],
              a = (
                n["Control.Applicative"],
                n["Control.Bind"],
                n.Effect,
                n["Effect.Console"]
              ),
              e = n["Node.Encoding"],
              o = n["Node.FS.Sync"];
            n.Prelude;
            // Define main function
            t.main = function () {
              var n = o.readTextFile(e.UTF8.value)("/dev/stdin")(),
                t = r.solve(n);
              return a.log(t)();
            };
          })(n.Main = n.Main || {}),
          // Call the main function to start execution
          n.Main.main();
      },
      {},
    ],
  },
  {},
  ["Focm"],
  null
);