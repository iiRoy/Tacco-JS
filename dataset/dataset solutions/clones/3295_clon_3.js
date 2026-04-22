var _runtimeLoader = function (moduleDefinitions, moduleCache, entryModuleIds, globalExportName) {
  // Store previous parcelRequire for chaining or fallback
  var _previousLoader = typeof parcelRequire === "function" && parcelRequire;
  // Store node's require for module resolution
  var _nodeRequire = typeof require === "function" && require;

  // Internal module loading function
  function _loadModule(moduleId, bypassCache) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If module definition doesn't exist, try external loaders
    if (!moduleDefinitions[moduleId]) {
      var _externalParcelLoader = typeof parcelRequire === "function" && parcelRequire;
      // If not bypassing cache and external loader exists, use it
      if (!bypassCache && _externalParcelLoader) {
        return _externalParcelLoader(moduleId, true);
      }
      // If a previous loader exists, try that
      if (_previousLoader) {
        return _previousLoader(moduleId, true);
      }
      // If Node.js require is available and module is a string, use it
      if (_nodeRequire && typeof moduleId === "string") {
        return _nodeRequire(moduleId);
      }
      // If all else fails, throw an error
      var _moduleNotFoundError = new Error("Cannot locate module: '" + moduleId + "'");
      _moduleNotFoundError.code = "MODULE_NOT_FOUND";
      throw _moduleNotFoundError;
    }

    // Prepare a resolver for relative paths within the module
    _moduleResolver.resolve = function (relativePath) {
      return moduleDefinitions[moduleId][1][relativePath] || relativePath;
    };
    // Initialize module's private cache (not used in this minified example)
    _moduleResolver.cache = {};

    // Create a new module instance and add to cache
    var _currentModule = moduleCache[moduleId] = new _loadModule.Module(moduleId);
    // Execute the module definition function
    moduleDefinitions[moduleId][0].call(_currentModule.exports, _moduleResolver, _currentModule, _currentModule.exports, this);

    // Return the module's exports
    return moduleCache[moduleId].exports;

    // Resolver function for internal module use
    function _moduleResolver(reqPath) {
      return _loadModule(_moduleResolver.resolve(reqPath));
    }
  }

  // Mark the loader as a Parcel loader
  _loadModule.isParcelRequire = true;
  // Module constructor
  _loadModule.Module = function (id) {
    this.id = id;
    this.bundle = _loadModule;
    this.exports = {};
  };
  // Store all module definitions, cache, and parent loader
  _loadModule.modules = moduleDefinitions;
  _loadModule.cache = moduleCache;
  _loadModule.parent = _previousLoader;
  // Function to register new modules (used by Parcel's HMR or dynamic imports)
  _loadModule.register = function (id, exportsValue) {
    moduleDefinitions[id] = [function (module, exports) {
      exports.exports = exportsValue;
    }, {}];
  };

  // Process all entry points
  var _initialError = null;
  for (var _currIdx = 0; _currIdx < entryModuleIds.length; _currIdx++) {
    try {
      _loadModule(entryModuleIds[_currIdx]);
    } catch (e) {
      // Store the first error encountered, but continue loading other entries
      if (!_initialError) {
        _initialError = e;
      }
    }
  }

  // Handle global export if entry points were processed
  if (entryModuleIds.length) {
    var _finalExport = _loadModule(entryModuleIds[entryModuleIds.length - 1]);
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = _finalExport;
    } else if (typeof define === "function" && define.amd) {
      define(function () {
        return _finalExport;
      });
    } else if (globalExportName) {
      this[globalExportName] = _finalExport;
    }
  }

  // Overwrite global parcelRequire with this instance
  parcelRequire = _loadModule;

  // If an error occurred during loading, re-throw it
  if (_initialError) {
    throw _initialError;
  }

  // Return the main loading function
  return _loadModule;
}({
  "mainModuleId": [function (require, module, exports) {
    // Main application namespace object
    var psRuntime = {};

    // --- Control.Apply ---
    (function (lib) {
      "use strict";
      lib["ApplyControl"] = lib["ApplyControl"] || {};
      var applyMod = lib["ApplyControl"];
      applyMod.Apply = function (functorRef, applyFunc) {
        this.Functor0 = functorRef;
        this.apply = applyFunc;
      };
      applyMod.apply = function (instance) {
        return instance.apply;
      };
    })(psRuntime);

    // --- Control.Applicative ---
    (function (lib) {
      "use strict";
      lib["ApplicativeControl"] = lib["ApplicativeControl"] || {};
      var applicativeMod = lib["ApplicativeControl"],
        applyMod = lib["ApplyControl"],
        getPureFn = function (instance) {
          return instance.pure;
        };
      applicativeMod.Applicative = function (applyRef, pureFunc) {
        this.Apply0 = applyRef;
        this.pure = pureFunc;
      };
      applicativeMod.pure = getPureFn;
      applicativeMod.liftA1 = function (applicativeInstance) {
        return function (mappingFunction) {
          return function (value) {
            return applyMod.apply(applicativeInstance.Apply0())(getPureFn(applicativeInstance)(mappingFunction))(value);
          };
        };
      };
    })(psRuntime);

    // --- Control.Bind ---
    (function (lib) {
      "use strict";
      lib["BindControl"] = lib["BindControl"] || {};
      var bindMod = lib["BindControl"];
      bindMod.Bind = function (applyRef, bindFunc) {
        this.Apply0 = applyRef;
        this.bind = bindFunc;
      };
      bindMod.bind = function (instance) {
        return instance.bind;
      };
    })(psRuntime);

    // --- Control.Monad ---
    (function (lib) {
      "use strict";
      lib["MonadControl"] = lib["MonadControl"] || {};
      var monadMod = lib["MonadControl"],
        applicativeMod = lib["ApplicativeControl"],
        bindMod = lib["BindControl"];
      monadMod.Monad = function (applicativeRef, bindRef) {
        this.Applicative0 = applicativeRef;
        this.Bind1 = bindRef;
      };
      monadMod.ap = function (monadInstance) {
        return function (mFunc) {
          return function (mVal) {
            return bindMod.bind(monadInstance.Bind1())(mFunc)(function (func) {
              return bindMod.bind(monadInstance.Bind1())(mVal)(function (val) {
                return applicativeMod.pure(monadInstance.Applicative0())(func(val));
              });
            });
          };
        };
      };
    })(psRuntime);

    // --- Control.Monad.ST.Internal ---
    (function (lib) {
      "use strict";
      lib["STMonadInternal"] = lib["STMonadInternal"] || {};
      var stInternal = lib["STMonadInternal"];
      stInternal.map_ = function (mapper) {
        return function (stAction) {
          return function () {
            return mapper(stAction());
          };
        };
      };
      stInternal.pure_ = function (value) {
        return function () {
          return value;
        };
      };
      stInternal.bind_ = function (stAction) {
        return function (continuation) {
          return function () {
            return continuation(stAction())();
          };
        };
      };
      stInternal.for = function (start) {
        return function (end) {
          return function (loopBody) {
            return function () {
              for (var idx = start; idx < end; idx++) {
                loopBody(idx)();
              }
            };
          };
        };
      };
    })(psRuntime["STMonadInternal"] = psRuntime["STMonadInternal"] || {});

    // --- Data.Functor ---
    (function (lib) {
      "use strict";
      (lib["FunctorData"] = lib["FunctorData"] || {}).arrayMap = function (mapper) {
        return function (arr) {
          var len = arr.length,
            resultArr = new Array(len);
          for (var i = 0; i < len; i++) {
            resultArr[i] = mapper(arr[i]);
          }
          return resultArr;
        };
      };
    })(psRuntime);

    // --- Data.Functor (continued) ---
    (function (lib) {
      "use strict";
      lib["FunctorData"] = lib["FunctorData"] || {};
      var functorMod = lib["FunctorData"],
        FunctorConstructor = function (mapFn) {
          this.map = mapFn;
        },
        arrayFunctorInstance = new FunctorConstructor(lib["FunctorData"].arrayMap);
      functorMod.Functor = FunctorConstructor;
      functorMod.map = function (instance) {
        return instance.map;
      };
      functorMod.functorArray = arrayFunctorInstance;
    })(psRuntime);

    // --- Control.Monad.ST.Internal (continued) ---
    (function (lib) {
      "use strict";
      lib["STMonadInternal"] = lib["STMonadInternal"] || {};
      var stInternal = lib["STMonadInternal"],
        stInternalRef = lib["STMonadInternal"],
        applicativeMod = psRuntime["ApplicativeControl"],
        applyMod = psRuntime["ApplyControl"],
        bindMod = psRuntime["BindControl"],
        monadMod = psRuntime["MonadControl"],
        stFunctor = new psRuntime["FunctorData"].Functor(stInternalRef.map_),
        stMonad = new monadMod.Monad(function () {
          return stApplicative;
        }, function () {
          return stBind;
        }),
        stBind = new bindMod.Bind(function () {
          return stApply;
        }, stInternalRef.bind_),
        stApply = new applyMod.Apply(function () {
          return stFunctor;
        }, monadMod.ap(stMonad)),
        stApplicative = new applicativeMod.Applicative(function () {
          return stApply;
        }, stInternalRef.pure_);
      stInternal.functorST = stFunctor;
      stInternal.applyST = stApply;
      stInternal.applicativeST = stApplicative;
      stInternal.bindST = stBind;
      stInternal.monadST = stMonad;
      stInternal.for = stInternalRef.for;
    })(psRuntime);

    // --- DPB (Direct PureScript Buffer - a STRef-like module) ---
    (function (lib) {
      lib.modify = function (idx, updater, buffer) {
        return function () {
          buffer[idx] = updater(buffer[idx]);
          return {}; // Unit value in PureScript
        };
      };
      lib.peek = function (idx, buffer) {
        return function () {
          return buffer[idx];
        };
      };
      lib.poke = function (idx, value, buffer) {
        return function () {
          buffer[idx] = value;
          return {}; // Unit value
        };
      };
    })(psRuntime.DPB = psRuntime.DPB || {});

    // --- Data.Array ---
    (function (lib) {
      "use strict";
      lib.replicate = typeof Array.prototype.fill === "function" ?
        function (count) {
          return function (value) {
            return count < 1 ? [] : new Array(count).fill(value);
          };
        } :
        function (count) {
          return function (value) {
            var result = [];
            for (var i = 0; i < count; i++) {
              result.push(value);
            }
            return result;
          };
        };
      lib.length = function (arr) {
        return arr.length;
      };
    })(psRuntime["ArrayData"] = psRuntime["ArrayData"] || {});

    // --- Data.Array (continued) ---
    (function (lib) {
      "use strict";
      lib["ArrayData"] = lib["ArrayData"] || {};
      var arrayMod = lib["ArrayData"],
        arrayModRef = lib["ArrayData"];
      arrayMod.replicate = arrayModRef.replicate;
      arrayMod.length = arrayModRef.length;
    })(psRuntime);

    // --- Data.Array.Partial ---
    (function (lib) {
      "use strict";
      lib["PartialArrayData"] = lib["PartialArrayData"] || {};
      var partialArrayMod = lib["PartialArrayData"],
        arrayMod = lib["ArrayData"];
      partialArrayMod.head = function () {
        return function (arr) {
          return arr[0];
        };
      };
      partialArrayMod.last = function () {
        return function (arr) {
          return arr[arrayMod.length(arr) - 1 | 0];
        };
      };
    })(psRuntime);

    // --- Data.Array.ST ---
    (function (lib) {
      "use strict";
      lib["STArrayData"] = lib["STArrayData"] || {};
      var stArrayMod = lib["STArrayData"],
        applicativeMod = psRuntime["ApplicativeControl"],
        stInternal = psRuntime["STMonadInternal"];
      stArrayMod.unsafeThaw = function (arr) {
        return applicativeMod.pure(stInternal.applicativeST)(arr);
      };
    })(psRuntime);

    // --- Data.Bounded ---
    (function (lib) {
      "use strict";
      lib.topInt = 2147483647;
      lib.bottomInt = -2147483648;
    })(psRuntime["BoundedData"] = psRuntime["BoundedData"] || {});

    // --- Data.Eq ---
    (function (lib) {
      "use strict";
      (lib["EqData"] = lib["EqData"] || {}).refEq = function (val1) {
        return function (val2) {
          return val1 === val2;
        };
      };
    })(psRuntime);

    // --- Data.Eq (continued) ---
    (function (lib) {
      "use strict";
      lib["EqData"] = lib["EqData"] || {};
      var eqMod = lib["EqData"],
        EqConstructor = function (eqFunc) {
          this.eq = eqFunc;
        },
        intEqInstance = new EqConstructor(lib["EqData"].refEq);
      eqMod.Eq = EqConstructor;
      eqMod.eq = function (instance) {
        return instance.eq;
      };
      eqMod.eqInt = intEqInstance;
    })(psRuntime);

    // --- Data.Ord.Unsafe ---
    (function (lib) {
      "use strict";
      (lib["UnsafeOrdData"] = lib["UnsafeOrdData"] || {}).unsafeCompareImpl = function (ltResult) {
        return function (eqResult) {
          return function (gtResult) {
            return function (val1) {
              return function (val2) {
                if (val1 < val2) return ltResult;
                if (val1 === val2) return eqResult;
                return gtResult;
              };
            };
          };
        };
      };
    })(psRuntime);

    // --- Data.Ordering ---
    (function (lib) {
      "use strict";
      lib["OrderingData"] = lib["OrderingData"] || {};
      var orderingMod = lib["OrderingData"],
        LT_Constructor = function () {
          function LT() {}
          LT.value = new LT();
          return LT;
        }(),
        GT_Constructor = function () {
          function GT() {}
          GT.value = new GT();
          return GT;
        }(),
        EQ_Constructor = function () {
          function EQ() {}
          EQ.value = new EQ();
          return EQ;
        }();
      orderingMod.LT = LT_Constructor;
      orderingMod.GT = GT_Constructor;
      orderingMod.EQ = EQ_Constructor;
    })(psRuntime);

    // --- Data.Ord.Unsafe (continued) ---
    (function (lib) {
      "use strict";
      lib["UnsafeOrdData"] = lib["UnsafeOrdData"] || {};
      var unsafeOrdMod = lib["UnsafeOrdData"],
        unsafeOrdModRef = lib["UnsafeOrdData"],
        orderingMod = psRuntime["OrderingData"],
        unsafeIntCompare = unsafeOrdModRef.unsafeCompareImpl(orderingMod.LT.value)(orderingMod.EQ.value)(orderingMod.GT.value);
      unsafeOrdMod.unsafeCompare = unsafeIntCompare;
    })(psRuntime);

    // --- Data.Ring ---
    (function (lib) {
      "use strict";
      (lib["RingData"] = lib["RingData"] || {}).intSub = function (val1) {
        return function (val2) {
          return val1 - val2 | 0;
        };
      };
    })(psRuntime);

    // --- Data.Semiring ---
    (function (lib) {
      "use strict";
      lib.intAdd = function (val1) {
        return function (val2) {
          return val1 + val2 | 0;
        };
      };
      lib.intMul = function (val1) {
        return function (val2) {
          return val1 * val2 | 0;
        };
      };
    })(psRuntime["SemiringData"] = psRuntime["SemiringData"] || {});

    // --- Data.Semiring (continued) ---
    (function (lib) {
      "use strict";
      lib["SemiringData"] = lib["SemiringData"] || {};
      var semiringMod = lib["SemiringData"],
        semiringModRef = lib["SemiringData"],
        SemiringConstructor = function (addFn, mulFn, oneVal, zeroVal) {
          this.add = addFn;
          this.mul = mulFn;
          this.one = oneVal;
          this.zero = zeroVal;
        },
        intSemiringInstance = new SemiringConstructor(semiringModRef.intAdd, semiringModRef.intMul, 1, 0);
      semiringMod.Semiring = SemiringConstructor;
      semiringMod.add = function (instance) {
        return instance.add;
      };
      semiringMod.zero = function (instance) {
        return instance.zero;
      };
      semiringMod.mul = function (instance) {
        return instance.mul;
      };
      semiringMod.one = function (instance) {
        return instance.one;
      };
      semiringMod.semiringInt = intSemiringInstance;
    })(psRuntime);

    // --- Data.Ring (continued) ---
    (function (lib) {
      "use strict";
      lib["RingData"] = lib["RingData"] || {};
      var ringMod = lib["RingData"],
        ringModRef = lib["RingData"],
        semiringMod = psRuntime["SemiringData"],
        RingConstructor = function (semiringRef, subFunc) {
          this.Semiring0 = semiringRef;
          this.sub = subFunc;
        },
        getSubtractFn = function (instance) {
          return instance.sub;
        },
        intRingInstance = new RingConstructor(function () {
          return semiringMod.semiringInt;
        }, ringModRef.intSub);
      ringMod.Ring = RingConstructor;
      ringMod.sub = getSubtractFn;
      ringMod.negate = function (instance) {
        return function (value) {
          return getSubtractFn(instance)(semiringMod.zero(instance.Semiring0()))(value);
        };
      };
      ringMod.ringInt = intRingInstance;
    })(psRuntime);

    // --- Data.Ord ---
    (function (lib) {
      "use strict";
      lib["OrdData"] = lib["OrdData"] || {};
      var ordMod = lib["OrdData"],
        eqMod = psRuntime["EqData"],
        unsafeOrdMod = psRuntime["UnsafeOrdData"],
        orderingMod = psRuntime["OrderingData"],
        ringMod = psRuntime["RingData"],
        semiringMod = psRuntime["SemiringData"],
        OrdConstructor = function (eqRef, compareFunc) {
          this.Eq0 = eqRef;
          this.compare = compareFunc;
        },
        intOrdInstance = new OrdConstructor(function () {
          return eqMod.eqInt;
        }, unsafeOrdMod.unsafeCompare),
        getCompareFn = function (instance) {
          return instance.compare;
        },
        isGreaterThanOrEqual = function (instance) {
          return function (val1) {
            return function (val2) {
              return !(getCompareFn(instance)(val1)(val2) instanceof orderingMod.LT);
            };
          };
        };
      ordMod.Ord = OrdConstructor;
      ordMod.compare = getCompareFn;
      ordMod.greaterThanOrEq = isGreaterThanOrEqual;
      ordMod.min = function (instance) {
        return function (val1) {
          return function (val2) {
            var comparisonResult = getCompareFn(instance)(val1)(val2);
            if (comparisonResult instanceof orderingMod.LT) return val1;
            if (comparisonResult instanceof orderingMod.EQ) return val1;
            if (comparisonResult instanceof orderingMod.GT) return val2;
            // Fallback for exhaustive match in PureScript; should not be reached
            throw new Error("Pattern match failure in Data.Ord.min: " + [comparisonResult.constructor.name]);
          };
        };
      };
      ordMod.max = function (instance) {
        return function (val1) {
          return function (val2) {
            var comparisonResult = getCompareFn(instance)(val1)(val2);
            if (comparisonResult instanceof orderingMod.LT) return val2;
            if (comparisonResult instanceof orderingMod.EQ) return val1;
            if (comparisonResult instanceof orderingMod.GT) return val1;
            // Fallback for exhaustive match in PureScript; should not be reached
            throw new Error("Pattern match failure in Data.Ord.max: " + [comparisonResult.constructor.name]);
          };
        };
      };
      ordMod.abs = function (ordInstance) {
        return function (ringInstance) {
          return function (value) {
            return isGreaterThanOrEqual(ordInstance)(value)(semiringMod.zero(ringInstance.Semiring0())) ? value : ringMod.negate(ringInstance)(value);
          };
        };
      };
      ordMod.ordInt = intOrdInstance;
    })(psRuntime);

    // --- Data.Bounded (continued) ---
    (function (lib) {
      "use strict";
      lib["BoundedData"] = lib["BoundedData"] || {};
      var boundedMod = lib["BoundedData"],
        boundedModRef = lib["BoundedData"],
        ordMod = psRuntime["OrdData"],
        BoundedConstructor = function (ordRef, bottomVal, topVal) {
          this.Ord0 = ordRef;
          this.bottom = bottomVal;
          this.top = topVal;
        },
        intBoundedInstance = new BoundedConstructor(function () {
          return ordMod.ordInt;
        }, boundedModRef.bottomInt, boundedModRef.topInt);
      boundedMod.Bounded = BoundedConstructor;
      boundedMod.bottom = function (instance) {
        return instance.bottom;
      };
      boundedMod.top = function (instance) {
        return instance.top;
      };
      boundedMod.boundedInt = intBoundedInstance;
    })(psRuntime);

    // --- Data.Int ---
    (function (lib) {
      "use strict";
      (lib["IntData"] = lib["IntData"] || {}).fromStringAsImpl = function (justFn) {
        return function (nothingVal) {
          return function (inputString) {
            var regexPattern;
            return function (radix) {
              if (radix < 2 || radix > 36) { // Guard clause for invalid radix
                return nothingVal;
              }
              // Construct regex for validation based on radix
              if (radix < 11) {
                regexPattern = "[0-" + (radix - 1).toString() + "]";
              } else if (radix === 11) {
                regexPattern = "[0-9a]";
              } else {
                regexPattern = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
              }
              var fullRegex = new RegExp("^[\\+\\-]?" + regexPattern + "+$", "i");

              // Perform validation and parsing
              if (fullRegex.test(inputString)) {
                var parsedValue = parseInt(inputString, radix);
                // Check for integer overflow/underflow (bitwise OR with 0 truncates to 32-bit int)
                return (parsedValue | 0) === parsedValue ? justFn(parsedValue) : nothingVal;
              }
              return nothingVal;
            };
          };
        };
      };
    })(psRuntime);

    // --- Data.Maybe ---
    (function (lib) {
      "use strict";
      lib["MaybeData"] = lib["MaybeData"] || {};
      var maybeMod = lib["MaybeData"],
        NothingConstructor = function () {
          function Nothing() {}
          Nothing.value = new Nothing();
          return Nothing;
        }(),
        JustConstructor = function () {
          function Just(val) {
            this.value0 = val;
          }
          Just.create = function (val) {
            return new Just(val);
          };
          return Just;
        }();
      maybeMod.Nothing = NothingConstructor;
      maybeMod.Just = JustConstructor;
      maybeMod.fromJust = function (maybeVal) {
        return function (val) {
          if (val instanceof JustConstructor) return val.value0;
          throw new Error("Failed pattern match in Data.Maybe.fromJust: " + [val.constructor.name]);
        };
      };
    })(psRuntime);

    // --- Data.Int (continued) ---
    (function (lib) {
      "use strict";
      lib["IntData"] = lib["IntData"] || {};
      var intMod = lib["IntData"],
        intModRef = lib["IntData"],
        maybeMod = psRuntime["MaybeData"],
        fromStringAsBase = intModRef.fromStringAsImpl(maybeMod.Just.create)(maybeMod.Nothing.value),
        fromStringDecimal = fromStringAsBase(10);
      intMod.fromString = fromStringDecimal;
      intMod.fromStringAs = fromStringAsBase;
    })(psRuntime);

    // --- Data.Show ---
    (function (lib) {
      "use strict";
      (lib["ShowData"] = lib["ShowData"] || {}).showIntImpl = function (val) {
        return val.toString();
      };
    })(psRuntime);

    // --- Data.Show (continued) ---
    (function (lib) {
      "use strict";
      lib["ShowData"] = lib["ShowData"] || {};
      var showMod = lib["ShowData"],
        ShowConstructor = function (showFunc) {
          this.show = showFunc;
        },
        intShowInstance = new ShowConstructor(lib["ShowData"].showIntImpl);
      showMod.Show = ShowConstructor;
      showMod.show = function (instance) {
        return instance.show;
      };
      showMod.showInt = intShowInstance;
    })(psRuntime);

    // --- Data.String.Common ---
    (function (lib) {
      "use strict";
      lib.split = function (separator) {
        return function (str) {
          return str.split(separator);
        };
      };
      lib.trim = function (str) {
        return str.trim();
      };
    })(psRuntime["CommonStringData"] = psRuntime["CommonStringData"] || {});

    // --- Data.String.Common (continued) ---
    (function (lib) {
      "use strict";
      lib["CommonStringData"] = lib["CommonStringData"] || {};
      var commonStringMod = lib["CommonStringData"],
        commonStringModRef = lib["CommonStringData"];
      commonStringMod.split = commonStringModRef.split;
      commonStringMod.trim = commonStringModRef.trim;
    })(psRuntime);

    // --- Data.Unit ---
    (function (lib) {
      "use strict";
      (lib["UnitData"] = lib["UnitData"] || {}).unit = {};
    })(psRuntime);

    // --- Data.Unit (continued) ---
    (function (lib) {
      "use strict";
      lib["UnitData"] = lib["UnitData"] || {};
      var unitMod = lib["UnitData"],
        unitModRef = lib["UnitData"];
      unitMod.unit = unitModRef.unit;
    })(psRuntime);

    // --- Effect ---
    (function (lib) {
      "use strict";
      lib.pureE = function (val) {
        return function () {
          return val;
        };
      };
      lib.bindE = function (effectAction) {
        return function (continuation) {
          return function () {
            return continuation(effectAction())();
          };
        };
      };
    })(psRuntime.EffectMonad = psRuntime.EffectMonad || {});

    // --- Effect (continued) ---
    (function (lib) {
      "use strict";
      lib["EffectMonad"] = lib["EffectMonad"] || {};
      var effectMod = lib["EffectMonad"],
        effectModRef = lib["EffectMonad"],
        applicativeMod = psRuntime["ApplicativeControl"],
        applyMod = psRuntime["ApplyControl"],
        bindMod = psRuntime["BindControl"],
        monadMod = psRuntime["MonadControl"],
        functorMod = psRuntime["FunctorData"],
        effectMonadInstance = new monadMod.Monad(function () {
          return effectApplicativeInstance;
        }, function () {
          return effectBindInstance;
        }),
        effectBindInstance = new bindMod.Bind(function () {
          return effectApplyInstance;
        }, effectModRef.bindE),
        effectApplyInstance = new applyMod.Apply(function () {
          return effectFunctorInstance;
        }, monadMod.ap(effectMonadInstance)),
        effectApplicativeInstance = new applicativeMod.Applicative(function () {
          return effectApplyInstance;
        }, effectModRef.pureE),
        effectFunctorInstance = new functorMod.Functor(applicativeMod.liftA1(effectApplicativeInstance));
      effectMod.functorEffect = effectFunctorInstance;
      effectMod.applyEffect = effectApplyInstance;
      effectMod.applicativeEffect = effectApplicativeInstance;
      effectMod.bindEffect = effectBindInstance;
      effectMod.monadEffect = effectMonadInstance;
    })(psRuntime);

    // --- Node.Encoding ---
    (function (lib) {
      "use strict";
      lib["NodeEncoding"] = lib["NodeEncoding"] || {};
      var encodingMod = lib["NodeEncoding"],
        showMod = psRuntime["ShowData"],
        ASCII_Type = function () {
          function ASCII() {}
          ASCII.value = new ASCII();
          return ASCII;
        }(),
        UTF8_Type = function () {
          function UTF8() {}
          UTF8.value = new UTF8();
          return UTF8;
        }(),
        UTF16LE_Type = function () {
          function UTF16LE() {}
          UTF16LE.value = new UTF16LE();
          return UTF16LE;
        }(),
        UCS2_Type = function () {
          function UCS2() {}
          UCS2.value = new UCS2();
          return UCS2;
        }(),
        Base64_Type = function () {
          function Base64() {}
          Base64.value = new Base64();
          return Base64;
        }(),
        Latin1_Type = function () {
          function Latin1() {}
          Latin1.value = new Latin1();
          return Latin1;
        }(),
        Binary_Type = function () {
          function Binary() {}
          Binary.value = new Binary();
          return Binary;
        }(),
        Hex_Type = function () {
          function Hex() {}
          Hex.value = new Hex();
          return Hex;
        }(),
        encodingShowInstance = new showMod.Show(function (encoding) {
          if (encoding instanceof ASCII_Type) return "ascii"; // Changed from "ASCII"
          if (encoding instanceof UTF8_Type) return "utf8"; // Changed from "UTF8"
          if (encoding instanceof UTF16LE_Type) return "utf16le"; // Changed from "UTF16LE"
          if (encoding instanceof UCS2_Type) return "ucs2"; // Changed from "UCS2"
          if (encoding instanceof Base64_Type) return "base64"; // Changed from "Base64"
          if (encoding instanceof Latin1_Type) return "latin1"; // Changed from "Latin1"
          if (encoding instanceof Binary_Type) return "binary"; // Changed from "Binary"
          if (encoding instanceof Hex_Type) return "hex"; // Changed from "Hex"
          throw new Error("Unknown encoding type: " + [encoding.constructor.name]);
        });
      encodingMod.ASCII = ASCII_Type;
      encodingMod.UTF8 = UTF8_Type;
      encodingMod.UTF16LE = UTF16LE_Type;
      encodingMod.UCS2 = UCS2_Type;
      encodingMod.Base64 = Base64_Type;
      encodingMod.Latin1 = Latin1_Type;
      encodingMod.Binary = Binary_Type;
      encodingMod.Hex = Hex_Type;
      encodingMod.showEncoding = encodingShowInstance;
    })(psRuntime);

    // --- Node.FS.Internal ---
    (function (lib) {
      "use strict";
      (lib["NodeFSInternal"] = lib["NodeFSInternal"] || {}).unsafeRequireFS = require("fs");
    })(psRuntime);

    // --- Unsafe.Coerce ---
    (function (lib) {
      "use strict";
      (lib["UnsafeCoercion"] = lib["UnsafeCoercion"] || {}).unsafeCoerce = function (val) {
        return val;
      };
    })(psRuntime);

    // --- Unsafe.Coerce (continued) ---
    (function (lib) {
      "use strict";
      lib["UnsafeCoercion"] = lib["UnsafeCoercion"] || {};
      var unsafeCoercionMod = lib["UnsafeCoercion"],
        unsafeCoercionModRef = lib["UnsafeCoercion"];
      unsafeCoercionMod.unsafeCoerce = unsafeCoercionModRef.unsafeCoerce;
    })(psRuntime);

    // --- Node.FS.Internal (continued) ---
    (function (lib) {
      "use strict";
      lib["NodeFSInternal"] = lib["NodeFSInternal"] || {};
      var fsInternalMod = lib["NodeFSInternal"],
        fsInternalModRef = lib["NodeFSInternal"],
        unsafeCoercionMod = psRuntime["UnsafeCoercion"].unsafeCoerce;
      fsInternalMod.mkEffect = unsafeCoercionMod;
      fsInternalMod.unsafeRequireFS = fsInternalModRef.unsafeRequireFS;
    })(psRuntime);

    // --- Node.FS.Sync ---
    (function (lib) {
      "use strict";
      lib["NodeFSSync"] = lib["NodeFSSync"] || {};
      var fsSyncMod = lib["NodeFSSync"],
        showMod = psRuntime["ShowData"],
        encodingMod = psRuntime["NodeEncoding"],
        fsInternalMod = psRuntime["NodeFSInternal"],
        nodeFS = fsInternalMod.unsafeRequireFS;
      fsSyncMod.readTextFile = function (encodingType) {
        return function (filePath) {
          return fsInternalMod.mkEffect(function () {
            // Using `encoding` option directly for `readFileSync`
            return nodeFS.readFileSync(filePath, {
              encoding: showMod.show(encodingMod.showEncoding)(encodingType)
            });
          });
        };
      };
    })(psRuntime);

    // --- Node.Process ---
    (function (lib) {
      "use strict";
      (lib["NodeProcess"] = lib["NodeProcess"] || {}).process = process;
    })(psRuntime);

    // --- Node.Process (continued) ---
    (function (lib) {
      "use strict";
      lib["NodeProcess"] = lib["NodeProcess"] || {};
      var nodeProcessMod = lib["NodeProcess"];
      // Directly assign stdout from the global process object
      nodeProcessMod.stdout = nodeProcessMod.process.stdout;
    })(psRuntime);

    // --- Node.Stream ---
    (function (lib) {
      "use strict";
      lib.write = function (stream) {
        return function (chunk) {
          return function (callback) {
            return function () {
              return stream.write(chunk, null, callback);
            };
          };
        };
      };
      lib.writeStringImpl = function (stream) {
        return function (encodingStr) {
          return function (chunk) {
            return function (callback) {
              return function () {
                return stream.write(chunk, encodingStr, callback);
              };
            };
          };
        };
      };
    })(psRuntime["NodeStream"] = psRuntime["NodeStream"] || {});

    // --- Node.Stream (continued) ---
    (function (lib) {
      "use strict";
      lib["NodeStream"] = lib["NodeStream"] || {};
      var nodeStreamMod = lib["NodeStream"],
        nodeStreamModRef = lib["NodeStream"],
        showMod = psRuntime["ShowData"],
        encodingMod = psRuntime["NodeEncoding"];
      nodeStreamMod.writeString = function (stream) {
        return function (encodingType) {
          return nodeStreamModRef.writeStringImpl(stream)(showMod.show(encodingMod.showEncoding)(encodingType));
        };
      };
    })(psRuntime);

    // --- Main Application Logic (DPB) ---
    (function (lib) {
      "use strict";
      lib.DPB = lib.DPB || {};
      var appModule = lib.DPB,
        stBufferOps = lib.DPB,
        applicativeControl = psRuntime["Control.Applicative"],
        stMonadInternal = psRuntime["Control.Monad.ST.Internal"],
        arrayData = psRuntime["Data.Array"],
        partialArrayData = psRuntime["Data.Array.Partial"],
        stArrayData = psRuntime["Data.Array.ST"],
        boundedData = psRuntime["Data.Bounded"],
        functorData = psRuntime["Data.Functor"],
        intData = psRuntime["Data.Int"],
        maybeData = psRuntime["Data.Maybe"],
        ordData = psRuntime["Data.Ord"],
        ringData = psRuntime["Data.Ring"],
        showData = psRuntime["Data.Show"],
        commonStringData = psRuntime["Data.String.Common"],
        unitData = psRuntime["Data.Unit"],
        effectMonad = psRuntime["EffectMonad"],
        nodeEncoding = psRuntime["Node.Encoding"],
        nodeFSSync = psRuntime["Node.FS.Sync"],
        nodeProcess = psRuntime["Node.Process"],
        nodeStream = psRuntime["Node.Stream"];

      // Helper for splitting strings by space
      var splitBySpace = commonStringData.split(" ");
      // Integer min function
      var getMinOfTwo = ordData.min(ordData.ordInt);
      // Integer max function
      var getMaxOfTwo = ordData.max(ordData.ordInt);

      /**
       * Parses the input string into a configuration object.
       * @param {string} rawInputText - The raw input string containing N, K, and heights.
       * @returns {object} An object { numElements: N, windowSize: K, heightValues: array of heights }.
       */
      var parseInputConfiguration = function (rawInputText) {
        // Step 1: Trim whitespace and split the input into lines
        var allInputLines = commonStringData.split("\n")(commonStringData.trim(rawInputText));
        // Step 2: Get the first line and split it by space to get N and K
        var firstLineTokens = splitBySpace(partialArrayData.head()(allInputLines));

        // Step 3: Parse N and K, handling potential nulls from fromString
        var numElements = maybeData.fromJust()(intData.fromString(firstLineTokens[0]));
        var windowSize = maybeData.fromJust()(intData.fromString(firstLineTokens[1]));

        // Step 4: Get the last line (heights) and parse them
        var rawHeightsString = partialArrayData.last()(allInputLines);
        var heightTokens = splitBySpace(rawHeightsString);
        // Map string tokens to integers
        var heightValues = functorData.map(functorData.functorArray)(function (token) {
          // Additional check for empty strings, common if input has trailing spaces/newlines
          if (token.length === 0) return null; // Will be filtered out
          return maybeData.fromJust()(intData.fromString(token));
        })(heightTokens).filter(function (val) {
          return val !== null;
        }); // Filter out any nulls from empty string tokens

        return {
          numElements: numElements,
          windowSize: windowSize,
          heightValues: heightValues
        };
      };

      // Integer absolute difference calculation
      var absoluteDifference = ordData.abs(ordData.ordInt)(ringData.ringInt);

      /**
       * Calculates the minimum total cost to traverse the array of heights.
       * This is a dynamic programming problem.
       * @param {string} problemInput - The raw input string.
       * @returns {string} The final minimum cost as a string.
       */
      var calculateMinimumTotalCost = function (problemInput) {
        var parsedConfig = parseInputConfiguration(problemInput);

        // Initialize a mutable array (simulating STRef) to store minimum costs.
        // All initial costs are set to the maximum possible integer value.
        // The first element (index 0) is set to 0 as the starting point.
        var costValuesRef = stArrayData.unsafeThaw(arrayData.replicate(parsedConfig.numElements)(boundedData.top(boundedData.boundedInt)))();
        stBufferOps.poke(0, 0, costValuesRef)(); // Set cost for index 0 to zero

        // Outer loop: Iterate from the second element up to N-1
        stMonadInternal.for(1)(parsedConfig.numElements)(function (currentIdx) {
          return stMonadInternal.for(getMaxOfTwo(0)(currentIdx - parsedConfig.windowSize))(currentIdx)(function (prevIdx) {
            return function () {
              // Get the cost at the previous position
              var costFromPrev = stBufferOps.peek(prevIdx, costValuesRef)();
              // Calculate the cost to jump from prevIdx to currentIdx
              var jumpCost = absoluteDifference(parsedConfig.heightValues[prevIdx] - parsedConfig.heightValues[currentIdx]);
              // Total cost for this path
              var totalPathCost = costFromPrev + jumpCost;

              // Update the current index's cost if this path is cheaper
              stBufferOps.modify(currentIdx, getMinOfTwo(totalPathCost), costValuesRef)();
            };
          });
        })().runST(); // Execute the ST actions

        // After computation, retrieve the cost at the last element (N-1)
        var finalMinCost = stBufferOps.peek(parsedConfig.numElements - 1 | 0, costValuesRef)();
        return showData.show(showData.showInt)(finalMinCost) + "\n";
      };

      // The main program entry point
      appModule.main = function () {
        // Read input from /dev/stdin using UTF8 encoding
        var fileContent = nodeFSSync.readTextFile(nodeEncoding.UTF8.value)("/dev/stdin")();
        // Compute the result based on the file content
        var computationResult = calculateMinimumTotalCost(fileContent);
        // Write the result to stdout using UTF8 encoding
        nodeStream.writeString(nodeProcess.stdout)(nodeEncoding.UTF8.value)(computationResult)(
          // Callback after write, returns the unit value
          applicativeControl.pure(effectMonad.applicativeEffect)(unitData.unit)
        )();
        // Return the unit value for the main effect
        return unitData.unit;
      };

      // Expose the core calculation function for testing or internal use
      appModule.solve = calculateMinimumTotalCost;
    })(psRuntime), psRuntime.DPB.main();
  }, {}],
}, {}, ["mainModuleId"], null);