let customModuleLoader = function(
  moduleDefinitionsMap, // Original: e
  loadedModuleCache,    // Original: r
  entryModuleIdentifiers, // Original: t
  globalExportIdentifier  // Original: n
) {
  let encounteredError = null; // Original: i (outer)
  const existingGlobalLoaderFunc = typeof customModuleLoader !== "undefined" && customModuleLoader; // Original: o
  const existingNodeJsRequire = typeof require !== "undefined" && require; // Original: u

  // Function to retrieve or load a module
  function acquireModule(moduleId, isSilentAttempt = false) { // Original: f(t,n)
    if (loadedModuleCache[moduleId]) {
      return loadedModuleCache[moduleId].exports;
    }

    if (!moduleDefinitionsMap[moduleId]) {
      // If module definition is absent, try other available loaders
      const fallbackGlobalLoader = typeof customModuleLoader !== "undefined" && customModuleLoader; // Original: i (inner)
      if (!isSilentAttempt && fallbackGlobalLoader) {
        return fallbackGlobalLoader(moduleId, true);
      }
      if (existingGlobalLoaderFunc) {
        return existingGlobalLoaderFunc(moduleId, true);
      }
      if (existingNodeJsRequire && typeof moduleId === "string") {
        return existingNodeJsRequire(moduleId);
      }

      const lookupError = new Error(`Cannot locate module with ID: '${moduleId}'`);
      lookupError.code = "MODULE_NOT_FOUND";
      throw lookupError;
    }

    // Define module execution context and resolver
    const moduleScopeResolver = function(dependencyPath) { // Original: p(e)
      return acquireModule(moduleScopeResolver.resolve(dependencyPath));
    };
    moduleScopeResolver.resolve = function(relativePath) { // Original: p.resolve
      return moduleDefinitionsMap[moduleId][1][relativePath] || relativePath;
    };
    moduleScopeResolver.cache = {}; // Original: p.cache

    const currentModuleInstance = loadedModuleCache[moduleId] = new acquireModule.Module(moduleId); // Original: l
    moduleDefinitionsMap[moduleId][0].call(
      currentModuleInstance.exports,
      moduleScopeResolver,
      currentModuleInstance,
      currentModuleInstance.exports,
      this
    );

    return loadedModuleCache[moduleId].exports;
  }

  acquireModule.isCustomLoader = true;
  acquireModule.Module = function(id) { // Original: f.Module
    this.id = id;
    this.loaderInstance = acquireModule; // Original: bundle
    this.exports = {};
  };
  acquireModule.availableModules = moduleDefinitionsMap; // Original: f.modules
  acquireModule.resolvedCache = loadedModuleCache; // Original: f.cache
  acquireModule.parentLoader = existingGlobalLoaderFunc; // Original: f.parent
  acquireModule.registerModule = function(id, moduleExportValue) { // Original: f.register(r,t)
    moduleDefinitionsMap[id] = [function(moduleRef, exportsRef) { exportsRef.exports = moduleExportValue; }, {}];
  };

  // Iterate and load all specified entry points
  for (let entryIndex = 0; entryIndex < entryModuleIdentifiers.length; entryIndex++) { // Original: c, t.length
    try {
      acquireModule(entryModuleIdentifiers[entryIndex]);
    } catch (err) {
      if (!encounteredError) {
        encounteredError = err;
      }
    }
  }

  // Handle final export if entry points were provided
  if (entryModuleIdentifiers.length > 0) {
    const finalExportedModule = acquireModule(entryModuleIdentifiers[entryModuleIdentifiers.length - 1]); // Original: l
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = finalExportedModule;
    } else if (typeof define === "function" && define.amd) {
      define(function() { return finalExportedModule; });
    } else if (globalExportIdentifier) {
      this[globalExportIdentifier] = finalExportedModule;
    }
  }

  // Assign the new loader globally
  customModuleLoader = acquireModule;

  if (encounteredError) {
    throw encounteredError;
  }

  return acquireModule;
}({
  "Focm": [function(require, module, exports) {
    const moduleStore = {}; // Original: var n={}

    // Control.Apply Module
    (moduleStore["Control.Apply"] = moduleStore["Control.Apply"] || {}).arrayApply = function(functionList) { // Original: n
      return function(valueList) { // Original: t
        const funcCount = functionList.length; // Original: r
        const valueCount = valueList.length; // Original: e
        const resultAccumulator = new Array(funcCount * valueCount); // Original: a
        let currentResultIndex = 0; // Original: o
        for (let funcIndex = 0; funcIndex < funcCount; funcIndex++) { // Original: i
          const currentFunction = functionList[funcIndex]; // Original: u
          for (let valIndex = 0; valIndex < valueCount; valIndex++) { // Original: c
            resultAccumulator[currentResultIndex++] = currentFunction(valueList[valIndex]);
          }
        }
        return resultAccumulator;
      };
    };

    // Control.Semigroupoid Module
    (function(semigroupoidExports) { // Original: n
      "use strict";
      const SemigroupoidType = function(composeFunc) {
        this.compose = composeFunc;
      }; // Original: var t
      const functionSemigroupoidInstance = new SemigroupoidType(function(f) {
        return function(g) {
          return function(x) {
            return f(g(x));
          };
        };
      }); // Original: r
      semigroupoidExports.compose = function(instance) {
        return instance.compose;
      };
      semigroupoidExports.Semigroupoid = SemigroupoidType;
      semigroupoidExports.functionSemigroupoid = functionSemigroupoidInstance; // Original: semigroupoidFn
    })(moduleStore["Control.Semigroupoid"] = moduleStore["Control.Semigroupoid"] || {});

    // Control.Category Module
    (function(categoryExports) { // Original: t
      "use strict";
      const semigrpMod = moduleStore["Control.Semigroupoid"]; // Original: r
      const CategoryType = function(semigroupoidInstance, identityFunc) {
        this.Semigroupoid0 = semigroupoidInstance;
        this.identity = identityFunc;
      }; // Original: e
      const functionCategoryInstance = new CategoryType(function() {
        return semigrpMod.functionSemigroupoid;
      }, function(x) {
        return x;
      }); // Original: a
      categoryExports.Category = CategoryType;
      categoryExports.identity = function(instance) {
        return instance.identity;
      };
      categoryExports.functionCategory = functionCategoryInstance; // Original: categoryFn
    })(moduleStore["Control.Category"] = moduleStore["Control.Category"] || {});

    // Data.Eq Module
    (function(eqExports) { // Original: t
      "use strict";
      (moduleStore["Data.Eq"] = moduleStore["Data.Eq"] || {}).referenceEquality = function(valA) { // Original: n
        return function(valB) { // Original: t
          return valA === valB;
        };
      };
    })(); // Original: () was after function(t)

    // Data.Unit Module
    (function(unitExports) { // Original: t
      "use strict";
      (moduleStore["Data.Unit"] = moduleStore["Data.Unit"] || {}).unitValue = {}; // Original: unit
    })();

    // Data.Show Module (showIntImpl part)
    (function(showExports) { // Original: t
      "use strict";
      (moduleStore["Data.Show"] = moduleStore["Data.Show"] || {}).showIntegerImplementation = function(num) { // Original: n
        return num.toString();
      };
    })();

    // Data.Show Module (main part)
    (function(showExports) { // Original: t
      "use strict";
      const showModule = moduleStore["Data.Show"]; // Original: r
      // Skipping unused imports: e, a
      const ShowType = function(showFunc) {
        this.show = showFunc;
      }; // Original: e
      const intShowInstance = new ShowType(showModule.showIntegerImplementation); // Original: a
      showExports.Show = ShowType;
      showExports.show = function(instance) {
        return instance.show;
      };
      showExports.showInt = intShowInstance;
    })(moduleStore["Data.Show"] = moduleStore["Data.Show"] || {});

    // Data.Unit Module (unit export part)
    (function(unitExports) { // Original: t
      "use strict";
      const dataUnitMod = moduleStore["Data.Unit"]; // Original: r
      unitExports.unit = dataUnitMod.unitValue; // Original: unit
    })(moduleStore["Data.Unit"] = moduleStore["Data.Unit"] || {});

    // Data.Eq Module (main part)
    (function(eqExports) { // Original: t
      "use strict";
      const dataEqMod = moduleStore["Data.Eq"]; // Original: r
      // Skipping unused imports: e, a
      const EqType = function(eqFunc) {
        this.eq = eqFunc;
      }; // Original: e
      const intEqInstance = new EqType(dataEqMod.referenceEquality); // Original: a
      eqExports.Eq = EqType;
      eqExports.eq = function(instance) {
        return instance.eq;
      };
      eqExports.eqInt = intEqInstance;
    })(moduleStore["Data.Eq"] = moduleStore["Data.Eq"] || {});

    // Data.Ord.Unsafe Module
    (function(unsafeOrdExports) { // Original: t
      "use strict";
      // Rewriting curried function into a single, more readable form
      (moduleStore["Data.Ord.Unsafe"] = moduleStore["Data.Ord.Unsafe"] || {}).unsafeCompareImplementation = (
        lessThanResult, // Original: n
        equalResult,    // Original: t
        greaterThanResult // Original: r
      ) => (valA) => (valB) => { // Original: e, a
        if (valA < valB) return lessThanResult;
        if (valA === valB) return equalResult;
        return greaterThanResult;
      };
    })();

    // Data.Semigroup Module
    (function(semigroupExports) { // Original: t
      "use strict";
      // Skipping unused imports
      semigroupExports.Semigroup = function(appendFunc) {
        this.append = appendFunc;
      };
      semigroupExports.append = function(instance) {
        return instance.append;
      };
    })(moduleStore["Data.Semigroup"] = moduleStore["Data.Semigroup"] || {});

    // Data.Ordering Module
    (function(orderingExports) { // Original: t
      "use strict";
      // Skipping unused imports
      const LessThanOrder = function() {
        function LT() {}
        LT.value = new LT();
        return LT;
      }(); // Original: r
      const GreaterThanOrder = function() {
        function GT() {}
        GT.value = new GT();
        return GT;
      }(); // Original: e
      const EqualOrder = function() {
        function EQ() {}
        EQ.value = new EQ();
        return EQ;
      }(); // Original: a
      orderingExports.LT = LessThanOrder;
      orderingExports.GT = GreaterThanOrder;
      orderingExports.EQ = EqualOrder;
    })(moduleStore["Data.Ordering"] = moduleStore["Data.Ordering"] || {});

    // Data.Ord.Unsafe Module (unsafeCompare part)
    (function(unsafeOrdExports) { // Original: t
      "use strict";
      const unsafeOrdMod = moduleStore["Data.Ord.Unsafe"]; // Original: r
      const orderingMod = moduleStore["Data.Ordering"]; // Original: e
      // Original: a
      const compareFunc = unsafeOrdMod.unsafeCompareImplementation(
        orderingMod.LT.value
      )(orderingMod.EQ.value)(orderingMod.GT.value);
      unsafeOrdExports.unsafeCompare = compareFunc;
    })(moduleStore["Data.Ord.Unsafe"] = moduleStore["Data.Ord.Unsafe"] || {});

    // Data.Ring Module (intSub part)
    (function(ringExports) { // Original: t
      "use strict";
      (moduleStore["Data.Ring"] = moduleStore["Data.Ring"] || {}).integerSubtraction = function(num1) { // Original: n
        return function(num2) { // Original: t
          return num1 - num2 | 0;
        };
      };
    })();

    // Data.Semiring Module (intAdd, intMul parts)
    (function(semiringExports) { // Original: n
      "use strict";
      semiringExports.integerAddition = function(num1) { // Original: n
        return function(num2) { // Original: t
          return num1 + num2 | 0;
        };
      };
      semiringExports.integerMultiplication = function(num1) { // Original: n
        return function(num2) { // Original: t
          return num1 * num2 | 0;
        };
      };
    })(moduleStore["Data.Semiring"] = moduleStore["Data.Semiring"] || {});

    // Data.Semiring Module (main part)
    (function(semiringExports) { // Original: t
      "use strict";
      const semiringMod = moduleStore["Data.Semiring"]; // Original: r
      // Skipping unused imports: e, a
      const SemiringType = function(addFunc, mulFunc, oneVal, zeroVal) {
        this.add = addFunc;
        this.mul = mulFunc;
        this.one = oneVal;
        this.zero = zeroVal;
      }; // Original: e
      const intSemiringInstance = new SemiringType(semiringMod.integerAddition, semiringMod.integerMultiplication, 1, 0); // Original: a
      semiringExports.Semiring = SemiringType;
      semiringExports.add = function(instance) {
        return instance.add;
      };
      semiringExports.zero = function(instance) {
        return instance.zero;
      };
      semiringExports.mul = function(instance) {
        return instance.mul;
      };
      semiringExports.one = function(instance) {
        return instance.one;
      };
      semiringExports.semiringInt = intSemiringInstance;
    })(moduleStore["Data.Semiring"] = moduleStore["Data.Semiring"] || {});

    // Data.Ring Module (main part)
    (function(ringExports) { // Original: t
      "use strict";
      const dataRingMod = moduleStore["Data.Ring"]; // Original: r
      const dataSemiringMod = moduleStore["Data.Semiring"]; // Original: e
      // Skipping unused imports: a, o
      const RingType = function(semiringInstance, subFunc) {
        this.Semiring0 = semiringInstance;
        this.sub = subFunc;
      }; // Original: a
      const intRingInstance = new RingType(function() {
        return dataSemiringMod.semiringInt;
      }, dataRingMod.integerSubtraction); // Original: o
      ringExports.Ring = RingType;
      ringExports.sub = function(instance) {
        return instance.sub;
      };
      ringExports.ringInt = intRingInstance;
    })(moduleStore["Data.Ring"] = moduleStore["Data.Ring"] || {});

    // Data.Ord Module
    (function(ordExports) { // Original: t
      "use strict";
      // Skipping unused imports
      const dataEqMod = moduleStore["Data.Eq"]; // Original: r
      const unsafeOrdMod = moduleStore["Data.Ord.Unsafe"]; // Original: e
      const orderingMod = moduleStore["Data.Ordering"]; // Original: a
      // Skipping unused imports: o, i
      const OrdType = function(eqInstance, compareFunc) {
        this.Eq0 = eqInstance;
        this.compare = compareFunc;
      }; // Original: o
      const intOrdInstance = new OrdType(function() {
        return dataEqMod.eqInt;
      }, unsafeOrdMod.unsafeCompare); // Original: i
      const getCompareFunc = function(instance) {
        return instance.compare;
      }; // Original: u
      ordExports.Ord = OrdType;
      ordExports.compare = getCompareFunc;
      ordExports.min = function(ordInstance) { // Original: n
        return function(val1) { // Original: t
          return function(val2) { // Original: r
            const comparisonResult = getCompareFunc(ordInstance)(val1)(val2); // Original: e
            if (comparisonResult === orderingMod.LT.value) return val1;
            if (comparisonResult === orderingMod.EQ.value) return val1;
            if (comparisonResult === orderingMod.GT.value) return val2;
            throw new Error("Pattern match error in Data.Ord.min: " + comparisonResult.constructor.name);
          };
        };
      };
      ordExports.max = function(ordInstance) { // Original: n
        return function(val1) { // Original: t
          return function(val2) { // Original: r
            const comparisonResult = getCompareFunc(ordInstance)(val1)(val2); // Original: e
            if (comparisonResult === orderingMod.LT.value) return val2;
            if (comparisonResult === orderingMod.EQ.value) return val1;
            if (comparisonResult === orderingMod.GT.value) return val1;
            throw new Error("Pattern match error in Data.Ord.max: " + comparisonResult.constructor.name);
          };
        };
      };
      ordExports.ordInt = intOrdInstance;
    })(moduleStore["Data.Ord"] = moduleStore["Data.Ord"] || {});

    // Data.Function Module
    (function(funcExports) { // Original: t
      "use strict";
      // Skipping unused imports
      funcExports.flip = function(func) { // Original: n
        return function(arg2) { // Original: t
          return function(arg1) { // Original: r
            return func(arg1)(arg2);
          };
        };
      };
      funcExports.constant = function(value) { // Original: n
        return function(ignoredArg) { // Original: t
          return value;
        };
      }; // Original: const
    })(moduleStore["Data.Function"] = moduleStore["Data.Function"] || {});

    // Data.Functor Module (arrayMap part)
    (function(functorExports) { // Original: t
      "use strict";
      (moduleStore["Data.Functor"] = moduleStore["Data.Functor"] || {}).arrayMap = function(mappingFunc) { // Original: n
        return function(inputArray) { // Original: t
          const arrayLength = inputArray.length; // Original: r
          const mappedArray = new Array(arrayLength); // Original: e
          for (let i = 0; i < arrayLength; i++) { // Original: a
            mappedArray[i] = mappingFunc(inputArray[i]);
          }
          return mappedArray;
        };
      };
    })();

    // Data.Functor Module (main part)
    (function(functorExports) { // Original: t
      "use strict";
      const dataFunctorMod = moduleStore["Data.Functor"]; // Original: r
      const controlSemigroupoidMod = moduleStore["Control.Semigroupoid"]; // Original: e
      const dataFunctionMod = moduleStore["Data.Function"]; // Original: e
      const dataUnitMod = moduleStore["Data.Unit"]; // Original: a
      const FunctorType = function(mapFunc) {
        this.map = mapFunc;
      }; // Original: o
      const getMapFunc = function(instance) {
        return instance.map;
      }; // Original: i
      const arrayFunctorInstance = new FunctorType(dataFunctorMod.arrayMap); // Original: u
      functorExports.Functor = FunctorType;
      functorExports.map = getMapFunc;
      functorExports.void = function(instance) { // Original: n
        return getMapFunc(instance)(dataFunctionMod.constant(dataUnitMod.unitValue));
      };
      functorExports.functorArray = arrayFunctorInstance;
    })(moduleStore["Data.Functor"] = moduleStore["Data.Functor"] || {});

    // Control.Apply Module (main part)
    (function(applyExports) { // Original: t
      "use strict";
      const controlApplyMod = moduleStore["Control.Apply"]; // Original: r
      const controlCategoryMod = moduleStore["Control.Category"]; // Original: e
      const dataFunctionMod = moduleStore["Data.Function"]; // Original: a
      const dataFunctorMod = moduleStore["Data.Functor"]; // Original: o
      const ApplyType = function(functorInstance, applyFunc) {
        this.Functor0 = functorInstance;
        this.apply = applyFunc;
      }; // Original: i
      const arrayApplyInstance = new ApplyType(function() {
        return dataFunctorMod.functorArray;
      }, controlApplyMod.arrayApply); // Original: u
      const getApplyFunc = function(instance) {
        return instance.apply;
      }; // Original: c
      applyExports.Apply = ApplyType;
      applyExports.apply = getApplyFunc;
      applyExports.applySecond = function(applyInstance) { // Original: n
        return function(valueApplicative) { // Original: t
          return function(funcApplicative) { // Original: r
            return getApplyFunc(applyInstance)(
              dataFunctorMod.map(applyInstance.Functor0())(
                dataFunctionMod.constant(controlCategoryMod.identity(controlCategoryMod.functionCategory))
              )(valueApplicative)
            )(funcApplicative);
          };
        };
      };
      applyExports.applyArray = arrayApplyInstance;
    })(moduleStore["Control.Apply"] = moduleStore["Control.Apply"] || {});

    // Control.Applicative Module
    (function(applicativeExports) { // Original: t
      "use strict";
      const controlApplyMod = moduleStore["Control.Apply"]; // Original: r
      // Skipping unused imports: e, a
      const getPureFunc = function(instance) {
        return instance.pure;
      }; // Original: e
      applicativeExports.Applicative = function(applyInstance, pureFunc) {
        this.Apply0 = applyInstance;
        this.pure = pureFunc;
      };
      applicativeExports.pure = getPureFunc;
      applicativeExports.liftA1 = function(applicativeInstance) { // Original: n
        return function(func) { // Original: t
          return function(value) { // Original: a
            return controlApplyMod.apply(applicativeInstance.Apply0())(getPureFunc(applicativeInstance)(func))(value);
          };
        };
      };
    })(moduleStore["Control.Applicative"] = moduleStore["Control.Applicative"] || {});

    // Control.Bind Module (arrayBind part)
    (function(bindExports) { // Original: t
      "use strict";
      (moduleStore["Control.Bind"] = moduleStore["Control.Bind"] || {}).arrayBind = function(inputArray) { // Original: n
        return function(bindingFunc) { // Original: t
          const resultCollection = []; // Original: r
          for (let i = 0, len = inputArray.length; i < len; i++) { // Original: e, a
            Array.prototype.push.apply(resultCollection, bindingFunc(inputArray[i]));
          }
          return resultCollection;
        };
      };
    })();

    // Control.Bind Module (main part)
    (function(bindExports) { // Original: t
      "use strict";
      const controlBindMod = moduleStore["Control.Bind"]; // Original: r
      const controlApplyMod = moduleStore["Control.Apply"]; // Original: e
      const dataFunctionMod = moduleStore["Data.Function"]; // Original: a
      const BindType = function(applyInstance, bindFunc) {
        this.Apply0 = applyInstance;
        this.bind = bindFunc;
      }; // Original: o
      const arrayBindInstance = new BindType(function() {
        return controlApplyMod.applyArray;
      }, controlBindMod.arrayBind); // Original: i
      const getBindFunc = function(instance) {
        return instance.bind;
      }; // Original: u
      const bindFlippedFunc = function(instance) {
        return dataFunctionMod.flip(getBindFunc(instance));
      }; // Original: c
      bindExports.Bind = BindType;
      bindExports.bind = getBindFunc;
      bindExports.bindFlipped = bindFlippedFunc;
      bindExports.composeKleisliFlipped = function(bindInstance) { // Original: n
        return function(func1) { // Original: t
          return function(func2) { // Original: r
            return function(initialValue) { // Original: e
              return bindFlippedFunc(bindInstance)(func1)(func2(initialValue));
            };
          };
        };
      };
      bindExports.bindArray = arrayBindInstance;
    })(moduleStore["Control.Bind"] = moduleStore["Control.Bind"] || {});

    // Control.Monad Module
    (function(monadExports) { // Original: t
      "use strict";
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: r
      const bindMod = moduleStore["Control.Bind"]; // Original: e
      monadExports.Monad = function(applicativeInstance, bindInstance) {
        this.Applicative0 = applicativeInstance;
        this.Bind1 = bindInstance;
      };
      monadExports.ap = function(monadInstance) { // Original: n
        return function(funcMonad) { // Original: t
          return function(valueMonad) { // Original: a
            return bindMod.bind(monadInstance.Bind1())(funcMonad)(function(func) { // Original: t
              return bindMod.bind(monadInstance.Bind1())(valueMonad)(function(value) { // Original: e
                return applicativeMod.pure(monadInstance.Applicative0())(func(value));
              });
            });
          };
        };
      };
    })(moduleStore["Control.Monad"] = moduleStore["Control.Monad"] || {});

    // Control.Monad.ST.Internal Module (raw effect functions)
    (function(stInternalExports) { // Original: n
      "use strict";
      stInternalExports.map_ = function(mapFunc) { // Original: n
        return function(stAction) { // Original: t
          return function() {
            return mapFunc(stAction());
          };
        };
      };
      stInternalExports.pure_ = function(value) { // Original: n
        return function() {
          return value;
        };
      };
      stInternalExports.bind_ = function(stAction) { // Original: n
        return function(continuationFunc) { // Original: t
          return function() {
            return continuationFunc(stAction())();
          };
        };
      };
      stInternalExports.for = function(startIndex) { // Original: n
        return function(endIndex) { // Original: t
          return function(loopBody) { // Original: r
            return function() {
              for (let i = startIndex; i < endIndex; i++) { // Original: e
                loopBody(i)();
              }
            };
          };
        };
      };
      stInternalExports.modify_ = function(updateFunc) { // Original: n
        return function(stRef) { // Original: t
          return function() {
            const newStateAndValue = updateFunc(stRef.value); // Original: r
            stRef.value = newStateAndValue.state;
            return newStateAndValue.value;
          };
        };
      };
    })(moduleStore["Control.Monad.ST.Internal"] = moduleStore["Control.Monad.ST.Internal"] || {});

    // Partial.Unsafe Module
    (function(partialUnsafeExports) { // Original: t
      "use strict";
      (moduleStore["Partial.Unsafe"] = moduleStore["Partial.Unsafe"] || {}).unsafeRunPartial = function(action) { // Original: n
        return action();
      };
    })();

    // Partial Module
    (function(partialExports) { // Original: t
      "use strict";
      (moduleStore["Partial"] = moduleStore["Partial"] || {}).crashWithMessage = function() { // Original: n
        return function(message) { // Original: n
          throw new Error(message);
        };
      };
    })();

    // Partial Module (crashWith part)
    (function(partialExports) { // Original: t
      "use strict";
      const partialMod = moduleStore["Partial"]; // Original: r
      partialExports.crashWith = partialMod.crashWithMessage;
    })(moduleStore["Partial"] = moduleStore["Partial"] || {});

    // Partial.Unsafe Module (unsafeCrashWith part)
    (function(partialUnsafeExports) { // Original: t
      "use strict";
      const unsafePartMod = moduleStore["Partial.Unsafe"]; // Original: r
      const partialMod = moduleStore["Partial"]; // Original: e
      partialUnsafeExports.unsafeCrashWith = function(message) { // Original: n
        return unsafePartMod.unsafeRunPartial(function(ignored) { // Original: t
          return partialMod.crashWith(ignored)(message);
        });
      };
    })(moduleStore["Partial.Unsafe"] = moduleStore["Partial.Unsafe"] || {});

    // Control.Monad.ST.Internal Module (main ST monad instances)
    (function(stInternalExports) { // Original: t
      "use strict";
      const stInternalMod = moduleStore["Control.Monad.ST.Internal"]; // Original: r
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: e
      const applyMod = moduleStore["Control.Apply"]; // Original: a
      const bindMod = moduleStore["Control.Bind"]; // Original: o
      const monadMod = moduleStore["Control.Monad"]; // Original: i
      const functorMod = moduleStore["Data.Functor"]; // Original: u
      const functorSTInstance = new functorMod.Functor(stInternalMod.map_); // Original: c
      const monadSTInstance = new monadMod.Monad(function() {
        return applicativeSTInstance;
      }, function() {
        return bindSTInstance;
      }); // Original: f
      const bindSTInstance = new bindMod.Bind(function() {
        return applySTInstance;
      }, stInternalMod.bind_); // Original: l
      const applySTInstance = new applyMod.Apply(function() {
        return functorSTInstance;
      }, monadMod.ap(monadSTInstance)); // Original: s
      const applicativeSTInstance = new applicativeMod.Applicative(function() {
        return applySTInstance;
      }, stInternalMod.pure_); // Original: d
      stInternalExports.modify = function(modifierFunc) { // Original: n
        return stInternalMod.modify_(function(oldValue) { // Original: t
          const newValue = modifierFunc(oldValue); // Original: r
          return {
            state: newValue,
            value: newValue
          };
        });
      };
      stInternalExports.functorST = functorSTInstance;
      stInternalExports.applyST = applySTInstance;
      stInternalExports.applicativeST = applicativeSTInstance;
      stInternalExports.bindST = bindSTInstance;
      stInternalExports.monadST = monadSTInstance;
      stInternalExports.for = stInternalMod.for;
    })(moduleStore["Control.Monad.ST.Internal"] = moduleStore["Control.Monad.ST.Internal"] || {});

    // Data.Foldable Module
    (function(foldableExports) { // Original: n
      "use strict";
      foldableExports.foldrArray = function(combineFunc) { // Original: n
        return function(initialValue) { // Original: t
          return function(array) { // Original: r
            let accumulator = initialValue; // Original: e
            for (let i = array.length - 1; i >= 0; i--) { // Original: a
              accumulator = combineFunc(array[i])(accumulator);
            }
            return accumulator;
          };
        };
      };
      foldableExports.foldlArray = function(combineFunc) { // Original: n
        return function(initialValue) { // Original: t
          return function(array) { // Original: r
            let accumulator = initialValue; // Original: e
            for (let i = 0, len = array.length; i < len; i++) { // Original: a, o
              accumulator = combineFunc(accumulator)(array[i]);
            }
            return accumulator;
          };
        };
      };
    })(moduleStore["Data.Foldable"] = moduleStore["Data.Foldable"] || {});

    // Data.EuclideanRing Module (intDegree, intDiv, intMod)
    (function(euclideanRingExports) { // Original: n
      "use strict";
      euclideanRingExports.integerDegree = function(num) { // Original: n
        return Math.min(Math.abs(num), 2147483647);
      };
      euclideanRingExports.integerDivision = function(dividend) { // Original: n
        return function(divisor) { // Original: t
          if (divisor === 0) return 0; // Special handling for division by zero
          if (divisor > 0) return Math.floor(dividend / divisor);
          return -Math.floor(dividend / (-divisor));
        };
      };
      euclideanRingExports.integerModulo = function(num) { // Original: n
        return function(modulus) { // Original: t
          if (modulus === 0) return 0; // Special handling for modulo zero
          const absModulus = Math.abs(modulus); // Original: r
          return (num % absModulus + absModulus) % absModulus;
        };
      };
    })(moduleStore["Data.EuclideanRing"] = moduleStore["Data.EuclideanRing"] || {});

    // Data.CommutativeRing Module
    (function(commutativeRingExports) { // Original: t
      "use strict";
      const dataRingMod = moduleStore["Data.Ring"]; // Original: r
      const CommutativeRingType = function(ringInstance) {
        this.Ring0 = ringInstance;
      }; // Original: e
      const intCommutativeRingInstance = new CommutativeRingType(function() {
        return dataRingMod.ringInt;
      }); // Original: a
      commutativeRingExports.CommutativeRing = CommutativeRingType;
      commutativeRingExports.commutativeRingInt = intCommutativeRingInstance;
    })(moduleStore["Data.CommutativeRing"] = moduleStore["Data.CommutativeRing"] || {});

    // Data.EuclideanRing Module (main part)
    (function(euclideanRingExports) { // Original: t
      "use strict";
      const dataEuclideanRingMod = moduleStore["Data.EuclideanRing"]; // Original: r
      const commutativeRingMod = moduleStore["Data.CommutativeRing"]; // Original: e
      const EuclideanRingType = function(commutativeRingInstance, degreeFunc, divFunc, modFunc) {
        this.CommutativeRing0 = commutativeRingInstance;
        this.degree = degreeFunc;
        this.div = divFunc;
        this.mod = modFunc;
      }; // Original: a
      const intEuclideanRingInstance = new EuclideanRingType(function() {
        return commutativeRingMod.commutativeRingInt;
      }, dataEuclideanRingMod.integerDegree, dataEuclideanRingMod.integerDivision, dataEuclideanRingMod.integerModulo); // Original: o
      euclideanRingExports.EuclideanRing = EuclideanRingType;
      euclideanRingExports.degree = function(instance) {
        return instance.degree;
      };
      euclideanRingExports.div = function(instance) {
        return instance.div;
      };
      euclideanRingExports.mod = function(instance) {
        return instance.mod;
      };
      euclideanRingExports.euclideanRingInt = intEuclideanRingInstance;
    })(moduleStore["Data.EuclideanRing"] = moduleStore["Data.EuclideanRing"] || {});

    // Data.Monoid Module
    (function(monoidExports) { // Original: t
      "use strict";
      monoidExports.Monoid = function(semigroupInstance, memptyValue) {
        this.Semigroup0 = semigroupInstance;
        this.mempty = memptyValue;
      };
      monoidExports.mempty = function(instance) {
        return instance.mempty;
      };
    })(moduleStore["Data.Monoid"] = moduleStore["Data.Monoid"] || {});

    // Data.Maybe Module
    (function(maybeExports) { // Original: t
      "use strict";
      const NothingType = function() {
        function Nothing() {}
        Nothing.value = new Nothing();
        return Nothing;
      }(); // Original: r
      const JustType = function() {
        function Just(value) {
          this.value0 = value;
        }
        Just.create = function(value) {
          return new Just(value);
        };
        return Just;
      }(); // Original: e
      maybeExports.Nothing = NothingType;
      maybeExports.Just = JustType;
      maybeExports.maybe = function(nothingHandler) { // Original: n
        return function(justHandler) { // Original: t
          return function(maybeValue) { // Original: a
            if (maybeValue === NothingType.value) return nothingHandler;
            if (maybeValue instanceof JustType) return justHandler(maybeValue.value0);
            throw new Error("Pattern match error in Data.Maybe.maybe: " + maybeValue.constructor.name);
          };
        };
      };
    })(moduleStore["Data.Maybe"] = moduleStore["Data.Maybe"] || {});

    // Data.Foldable Module (main part)
    (function(foldableExports) { // Original: t
      "use strict";
      const dataFoldableMod = moduleStore["Data.Foldable"]; // Original: r
      const controlApplicativeMod = moduleStore["Control.Applicative"]; // Original: e
      const controlApplyMod = moduleStore["Control.Apply"]; // Original: a
      const dataMonoidMod = moduleStore["Data.Monoid"]; // Original: o
      const dataSemigroupMod = moduleStore["Data.Semigroup"]; // Original: i
      const dataUnitMod = moduleStore["Data.Unit"]; // Original: u
      const FoldableType = function(foldMapFunc, foldlFunc, foldrFunc) {
        this.foldMap = foldMapFunc;
        this.foldl = foldlFunc;
        this.foldr = foldrFunc;
      }; // Original: c
      const getFoldrFunc = function(instance) {
        return instance.foldr;
      }; // Original: f
      const foldMapDefaultRFunc = function(monoidInstance) { // Original: n
        return function(mappingFunc) { // Original: t
          return function(foldableInstance) { // Original: r
            return getFoldrFunc(foldableInstance)(function(item) { // Original: n
              return function(accumulator) { // Original: e
                return dataSemigroupMod.append(monoidInstance.Semigroup0())(mappingFunc(item))(accumulator);
              };
            })(dataMonoidMod.mempty(monoidInstance));
          };
        };
      }; // Original: l
      const arrayFoldableInstance = new FoldableType(function(monoidInstance) {
        return foldMapDefaultRFunc(monoidInstance)(arrayFoldableInstance);
      }, dataFoldableMod.foldlArray, dataFoldableMod.foldrArray); // Original: s
      foldableExports.Foldable = FoldableType;
      foldableExports.foldr = getFoldrFunc;
      foldableExports.foldl = function(instance) {
        return instance.foldl;
      };
      foldableExports.foldMap = function(instance) {
        return instance.foldMap;
      };
      foldableExports.foldMapDefaultR = foldMapDefaultRFunc;
      foldableExports.traverse_ = function(applicativeInstance) { // Original: n
        return function(foldableInstance) { // Original: t
          return function(actionFunc) { // Original: r
            return getFoldrFunc(foldableInstance)(function(item) { // Original: t
              return controlApplyMod.applySecond(applicativeInstance.Apply0())(actionFunc(item));
            })(controlApplicativeMod.pure(applicativeInstance)(dataUnitMod.unitValue));
          };
        };
      };
      foldableExports.foldableArray = arrayFoldableInstance;
    })(moduleStore["Data.Foldable"] = moduleStore["Data.Foldable"] || {});

    // Data.Either Module
    (function(eitherExports) { // Original: t
      "use strict";
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: r
      const applyMod = moduleStore["Control.Apply"]; // Original: e
      const bindMod = moduleStore["Control.Bind"]; // Original: a
      const functorMod = moduleStore["Data.Functor"]; // Original: o
      const maybeMod = moduleStore["Data.Maybe"]; // Original: i
      const LeftType = function() {
        function Left(value) {
          this.value0 = value;
        }
        Left.create = function(value) {
          return new Left(value);
        };
        return Left;
      }(); // Original: u
      const RightType = function() {
        function Right(value) {
          this.value0 = value;
        }
        Right.create = function(value) {
          return new Right(value);
        };
        return Right;
      }(); // Original: c
      const functorEitherInstance = new functorMod.Functor(function(mappingFunc) { // Original: n
        return function(eitherValue) { // Original: t
          if (eitherValue instanceof LeftType) return new LeftType(eitherValue.value0);
          if (eitherValue instanceof RightType) return new RightType(mappingFunc(eitherValue.value0));
          throw new Error("Pattern match error in Data.Either.functorEither: " + eitherValue.constructor.name);
        };
      }); // Original: f
      const eitherFunc = function(leftHandler) { // Original: n
        return function(rightHandler) { // Original: t
          return function(eitherValue) { // Original: r
            if (eitherValue instanceof LeftType) return leftHandler(eitherValue.value0);
            if (eitherValue instanceof RightType) return rightHandler(eitherValue.value0);
            throw new Error("Pattern match error in Data.Either.either: " + eitherValue.constructor.name);
          };
        };
      }; // Original: l
      const applyEitherInstance = new applyMod.Apply(function() {
        return functorEitherInstance;
      }, function(funcEither) { // Original: n
        return function(valueEither) { // Original: t
          if (funcEither instanceof LeftType) return new LeftType(funcEither.value0);
          if (funcEither instanceof RightType) return functorMod.map(functorEitherInstance)(funcEither.value0)(valueEither);
          throw new Error("Pattern match error in Data.Either.applyEither: " + funcEither.constructor.name);
        };
      }); // Original: s
      const bindEitherInstance = new bindMod.Bind(function() {
        return applyEitherInstance;
      }, eitherFunc(function(leftVal) { // Original: n
        return function(continuation) { // Original: t
          return new LeftType(leftVal);
        };
      })(function(rightVal) { // Original: n
        return function(continuation) { // Original: t
          return continuation(rightVal);
        };
      })); // Original: d
      const applicativeEitherInstance = new applicativeMod.Applicative(function() {
        return applyEitherInstance;
      }, RightType.create); // Original: p
      eitherExports.Left = LeftType;
      eitherExports.Right = RightType;
      eitherExports.either = eitherFunc;
      eitherExports.note = function(leftValue) { // Original: n
        return maybeMod.maybe(new LeftType(leftValue))(RightType.create);
      };
      eitherExports.functorEither = functorEitherInstance;
      eitherExports.applyEither = applyEitherInstance;
      eitherExports.applicativeEither = applicativeEitherInstance;
      eitherExports.bindEither = bindEitherInstance;
    })(moduleStore["Data.Either"] = moduleStore["Data.Either"] || {});

    // Effect Module (pureE, bindE)
    (function(effectExports) { // Original: n
      "use strict";
      effectExports.pureEffect = function(value) { // Original: n
        return function() {
          return value;
        };
      };
      effectExports.bindEffect = function(effectAction) { // Original: n
        return function(continuationFunc) { // Original: t
          return function() {
            return continuationFunc(effectAction())();
          };
        };
      };
    })(moduleStore["Effect"] = moduleStore["Effect"] || {});

    // Effect Module (main part)
    (function(effectExports) { // Original: t
      "use strict";
      const effectMod = moduleStore["Effect"]; // Original: r
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: e
      const applyMod = moduleStore["Control.Apply"]; // Original: a
      const bindMod = moduleStore["Control.Bind"]; // Original: o
      const monadMod = moduleStore["Control.Monad"]; // Original: i
      const functorMod = moduleStore["Data.Functor"]; // Original: u
      const monadEffectInstance = new monadMod.Monad(function() {
        return applicativeEffectInstance;
      }, function() {
        return bindEffectInstance;
      }); // Original: c
      const bindEffectInstance = new bindMod.Bind(function() {
        return applyEffectInstance;
      }, effectMod.bindEffect); // Original: f
      const applyEffectInstance = new applyMod.Apply(function() {
        return functorEffectInstance;
      }, monadMod.ap(monadEffectInstance)); // Original: l
      const applicativeEffectInstance = new applicativeMod.Applicative(function() {
        return applyEffectInstance;
      }, effectMod.pureEffect); // Original: s
      const functorEffectInstance = new functorMod.Functor(applicativeMod.liftA1(applicativeEffectInstance)); // Original: d
      effectExports.functorEffect = functorEffectInstance;
      effectExports.applyEffect = applyEffectInstance;
      effectExports.applicativeEffect = applicativeEffectInstance;
      effectExports.bindEffect = bindEffectInstance;
      effectExports.monadEffect = monadEffectInstance;
    })(moduleStore["Effect"] = moduleStore["Effect"] || {});

    // Effect.Class Module
    (function(effectClassExports) { // Original: t
      "use strict";
      effectClassExports.liftEffect = function(instance) { // Original: n
        return instance.liftEffect;
      };
      effectClassExports.MonadEffect = function(monadInstance, liftEffectFunc) {
        this.Monad0 = monadInstance;
        this.liftEffect = liftEffectFunc;
      };
    })(moduleStore["Effect.Class"] = moduleStore["Effect.Class"] || {});

    // Effect.Ref Module (raw ref functions)
    (function(refExports) { // Original: n
      "use strict";
      refExports.createRef = function(initialValue) { // Original: n
        return function() {
          return {
            value: initialValue
          };
        };
      };
      refExports.readRef = function(ref) { // Original: n
        return function() {
          return ref.value;
        };
      };
      refExports.writeRef = function(newValue) { // Original: n
        return function(ref) { // Original: t
          return function() {
            ref.value = newValue;
            return {}; // Unit value
          };
        };
      };
    })(moduleStore["Effect.Ref"] = moduleStore["Effect.Ref"] || {});

    // Effect.Ref Module (main part)
    (function(refExports) { // Original: t
      "use strict";
      const effectRefMod = moduleStore["Effect.Ref"]; // Original: r
      // Skipping unused imports
      refExports.new = effectRefMod.createRef;
      refExports.read = effectRefMod.readRef;
      refExports.write = effectRefMod.writeRef;
    })(moduleStore["Effect.Ref"] = moduleStore["Effect.Ref"] || {});

    // Control.Parallel.Class Module
    (function(parallelClassExports) { // Original: t
      "use strict";
      parallelClassExports.parallel = function(instance) { // Original: n
        return instance.parallel;
      };
      parallelClassExports.sequential = function(instance) { // Original: n
        return instance.sequential;
      };
      parallelClassExports.Parallel = function(applicativeInstance, monadInstance, parallelFunc, sequentialFunc) {
        this.Applicative1 = applicativeInstance;
        this.Monad0 = monadInstance;
        this.parallel = parallelFunc;
        this.sequential = sequentialFunc;
      };
    })(moduleStore["Control.Parallel.Class"] = moduleStore["Control.Parallel.Class"] || {});

    // Control.Parallel Module
    (function(parallelExports) { // Original: t
      "use strict";
      const controlCategoryMod = moduleStore["Control.Category"]; // Original: r
      const parallelClassMod = moduleStore["Control.Parallel.Class"]; // Original: e
      const dataFoldableMod = moduleStore["Data.Foldable"]; // Original: a
      const parTraverse_ = function(parallelInstance) { // Original: n
        return function(foldableInstance) { // Original: t
          return function(actionFunc) { // Original: r
            return function(inputCollection) { // Original: o
              return parallelClassMod.sequential(parallelInstance)(
                dataFoldableMod.traverse_(parallelInstance.Applicative1())(foldableInstance)(function(item) { // Original: t
                  return parallelClassMod.parallel(parallelInstance)(actionFunc(item));
                })(inputCollection)
              );
            };
          };
        };
      }; // Original: o
      parallelExports.parTraverse_ = parTraverse_;
      parallelExports.parSequence_ = function(parallelInstance) { // Original: n
        return function(foldableInstance) { // Original: t
          return parTraverse_(parallelInstance)(foldableInstance)(controlCategoryMod.identity(controlCategoryMod.functionCategory));
        };
      };
    })(moduleStore["Control.Parallel"] = moduleStore["Control.Parallel"] || {});

    // Data.Tuple Module
    (function(tupleExports) { // Original: t
      "use strict";
      const TupleType = function() {
        function Tuple(val0, val1) {
          this.value0 = val0;
          this.value1 = val1;
        }
        Tuple.create = function(val0) {
          return function(val1) {
            return new Tuple(val0, val1);
          };
        };
        return Tuple;
      }(); // Original: r
      tupleExports.Tuple = TupleType;
    })(moduleStore["Data.Tuple"] = moduleStore["Data.Tuple"] || {});

    // Unsafe.Coerce Module
    (function(unsafeCoerceExports) { // Original: t
      "use strict";
      (moduleStore["Unsafe.Coerce"] = moduleStore["Unsafe.Coerce"] || {}).unsafeIdentityCoerce = function(val) { // Original: n
        return val;
      };
    })();

    // Unsafe.Coerce Module (main part)
    (function(unsafeCoerceExports) { // Original: t
      "use strict";
      const unsafeCoerceMod = moduleStore["Unsafe.Coerce"]; // Original: r
      unsafeCoerceExports.unsafeCoerce = unsafeCoerceMod.unsafeIdentityCoerce;
    })(moduleStore["Unsafe.Coerce"] = moduleStore["Unsafe.Coerce"] || {});

    // Data.Array Module
    (function(arrayExports) { // Original: t
      "use strict";
      const controlBindMod = moduleStore["Control.Bind"]; // Original: r
      const dataMaybeMod = moduleStore["Data.Maybe"]; // Original: a
      const arraySingleton = function(value) { // Original: n
        return [value];
      }; // Original: o
      const concatMapFunc = controlBindMod.bindFlipped(controlBindMod.bindArray); // Original: i
      arrayExports.singleton = arraySingleton;
      arrayExports.concatMap = concatMapFunc;
      arrayExports.mapMaybe = function(mappingFunc) { // Original: n
        return concatMapFunc(function(item) { // Original: t
          return dataMaybeMod.maybe([])(arraySingleton)(mappingFunc(item));
        });
      };
    })(moduleStore["Data.Array"] = moduleStore["Data.Array"] || {});

    // Data.Int Module (fromStringAsImpl part)
    (function(intExports) { // Original: t
      "use strict";
      (moduleStore["Data.Int"] = moduleStore["Data.Int"] || {}).fromStringAsImplementation = function(justHandler) { // Original: n
        return function(nothingValue) { // Original: t
          return function(radix) { // Original: r
            const regexCharSet = (radix < 11) ?
              `[0-${(radix - 1).toString()}]` :
              (radix === 11) ?
              "[0-9a]" :
              `[0-9a-${String.fromCharCode(86 + radix)}]`; // Original: e
            const inputRegex = new RegExp(`^[\\+\\-]?${regexCharSet}+$`, "i"); // Original: a
            return function(inputString) { // Original: e
              if (inputRegex.test(inputString)) {
                const parsedValue = parseInt(inputString, radix); // Original: o
                // Check if parsing was successful and it's a valid integer
                if ((parsedValue | 0) === parsedValue) {
                  return justHandler(parsedValue);
                }
                return nothingValue;
              }
              return nothingValue;
            };
          };
        };
      };
    })();

    // Data.Int Module (main part)
    (function(intExports) { // Original: t
      "use strict";
      const dataIntMod = moduleStore["Data.Int"]; // Original: r
      const dataMaybeMod = moduleStore["Data.Maybe"]; // Original: e
      const fromStringAsBase = dataIntMod.fromStringAsImplementation(dataMaybeMod.Just.create)(dataMaybeMod.Nothing.value); // Original: a
      const fromStringDecimal = fromStringAsBase(10); // Original: o
      intExports.fromString = fromStringDecimal;
      intExports.fromStringAs = fromStringAsBase;
    })(moduleStore["Data.Int"] = moduleStore["Data.Int"] || {});

    // Data.String.Common Module (split, trim)
    (function(stringCommonExports) { // Original: n
      "use strict";
      stringCommonExports.splitString = function(separator) { // Original: n
        return function(inputString) { // Original: t
          return inputString.split(separator);
        };
      };
      stringCommonExports.trimString = function(inputString) { // Original: n
        return inputString.trim();
      };
    })(moduleStore["Data.String.Common"] = moduleStore["Data.String.Common"] || {});

    // Data.String.Common Module (main part)
    (function(stringCommonExports) { // Original: t
      "use strict";
      const stringCommonMod = moduleStore["Data.String.Common"]; // Original: r
      stringCommonExports.split = stringCommonMod.splitString;
      stringCommonExports.trim = stringCommonMod.trimString;
    })(moduleStore["Data.String.Common"] = moduleStore["Data.String.Common"] || {});

    // Effect.Aff Module (internal definitions)
    (function(affInternalExports) { // Original: n
      "use strict";
      const AffInternal = function() {
        const EmptyAction = {}; // Original: n
        const PureActionTag = "Pure"; // Original: t
        const ThrowActionTag = "Throw"; // Original: r
        const CatchActionTag = "Catch"; // Original: e
        const SyncActionTag = "Sync"; // Original: a
        const AsyncActionTag = "Async"; // Original: o
        const BindActionTag = "Bind"; // Original: i
        const BracketActionTag = "Bracket"; // Original: u
        const ForkActionTag = "Fork"; // Original: c
        const SequentialActionTag = "Sequential"; // Original: f
        const MapParallelActionTag = "Map"; // Original: l
        const ApplyParallelActionTag = "Apply"; // Original: s
        const AltParallelActionTag = "Alt"; // Original: d
        const ConsTag = "Cons"; // Original: p
        const ResumeTag = "Resume"; // Original: D
        const ReleaseTag = "Release"; // Original: m
        const FinalizerTag = "Finalizer"; // Original: g
        const FinalizedTag = "Finalized"; // Original: h
        const ForkedTag = "Forked"; // Original: v

        // Constructor for Aff actions
        function AffAction(tag, arg1, arg2, arg3) { // Original: C
          this.tag = tag;
          this._1 = arg1;
          this._2 = arg2;
          this._3 = arg3;
        }

        // Factory for Aff actions with a specific tag
        function createAffActionFactory(tag) { // Original: w
          const factory = function(arg1, arg2, arg3) {
            return new AffAction(tag, arg1, arg2, arg3);
          };
          factory.tag = tag;
          return factory;
        }

        // Non-cancelling action
        function noOpCanceler() { // Original: y
          return new AffAction(PureActionTag, undefined);
        }

        // Error handling utility for async operations
        function enqueueUnhandledError(error) { // Original: E
          setTimeout(function() {
            throw error;
          }, 0);
        }

        // Synchronous error handling
        function handleSyncError(errorHandler, successHandler, syncAction) { // Original: A
          try {
            return successHandler(syncAction());
          } catch (error) {
            return errorHandler(error);
          }
        }

        // Asynchronous error handling
        function handleAsyncError(errorHandler, asyncAction, continuation) { // Original: S
          try {
            return asyncAction();
          } catch (error) {
            return continuation(errorHandler(error))();
          }
        }

        // Scheduler for microtasks
        const scheduler = (function() { // Original: b
          const queueSize = 1024; // Original: n
          let head = 0; // Original: t
          let tail = 0; // Original: r
          const taskQueue = new Array(queueSize); // Original: e
          let isQueueRunning = false; // Original: a

          function drainQueue() { // Original: o
            let taskToRun;
            for (isQueueRunning = true; head !== tail;) {
              tail--;
              taskToRun = taskQueue[head];
              taskQueue[head] = undefined;
              head = (head + 1) % queueSize;
              taskToRun();
            }
            isQueueRunning = false;
          }

          return {
            isDraining: function() {
              return isQueueRunning;
            },
            enqueue: function(task) {
              let previousRunningState;
              if (tail === queueSize) {
                previousRunningState = isQueueRunning;
                drainQueue();
                isRunning = previousRunningState;
              }
              taskQueue[(head + tail) % queueSize] = task;
              tail++;
              if (!isQueueRunning) {
                drainQueue();
              }
            }
          };
        })();

        const FiberState_Initial = 0; // Original: _
        const FiberState_Running = 1; // Original: F
        const FiberState_Suspended = 2; // Original: M
        const FiberState_SyncError = 3; // Original: R
        const FiberState_AsyncWaiting = 4; // Original: P
        const FiberState_Cancelling = 5; // Original: T
        const FiberState_Completed = 6; // Original: I

        // Fiber runner
        function FiberRunner(eitherModule, schedulerModule, initialAffAction) { // Original: B
          let executionDepth = 0; // Original: d
          let currentState = FiberState_Initial; // Original: v
          let currentResult = initialAffAction; // Original: w
          let errorValue = null; // Original: y
          let currentStack = null; // Original: U
          let continuationStack = null; // Original: L
          let captureStack = null; // Original: q
          let bracketStack = null; // Original: N
          let resourceCount = 0; // Original: O
          let listenerIdCounter = 0; // Original: x
          let listeners = null; // Original: W
          let rethrowUnhandled = true; // Original: H

          function executeStep(currentExecutionDepth) { // Original: z
            let currentAction, currentContinuation, currentBracket;
            for (;;) {
              currentAction = null;
              currentContinuation = null;
              currentBracket = null;

              switch (currentState) {
                case FiberState_Suspended:
                  currentState = FiberState_Running;
                  currentResult = continuationStack(currentResult);
                  if (captureStack === null) {
                    continuationStack = null;
                  } else {
                    continuationStack = captureStack._1;
                    captureStack = captureStack._2;
                  }
                  break;

                case FiberState_SyncError:
                  if (eitherModule.isLeft(currentResult)) {
                    currentState = FiberState_Cancelling;
                    errorValue = currentResult;
                    currentResult = null;
                  } else if (continuationStack === null) {
                    currentState = FiberState_Cancelling;
                  } else {
                    currentState = FiberState_Suspended;
                    currentResult = eitherModule.fromRight(currentResult);
                  }
                  break;

                case FiberState_Running:
                  switch (currentResult.tag) {
                    case BindActionTag:
                      if (continuationStack) {
                        captureStack = new AffAction(ConsTag, continuationStack, captureStack);
                      }
                      continuationStack = currentResult._2;
                      currentState = FiberState_Running;
                      currentResult = currentResult._1;
                      break;

                    case PureActionTag:
                      if (continuationStack === null) {
                        currentState = FiberState_Cancelling;
                        currentResult = eitherModule.right(currentResult._1);
                      } else {
                        currentState = FiberState_Suspended;
                        currentResult = currentResult._1;
                      }
                      break;

                    case SyncActionTag:
                      currentState = FiberState_SyncError;
                      currentResult = handleSyncError(eitherModule.left, eitherModule.right, currentResult._1);
                      break;

                    case AsyncActionTag:
                      currentState = FiberState_AsyncWaiting;
                      // Async waiting state; return control to event loop
                      return;

                    case ThrowActionTag:
                      currentState = FiberState_Cancelling;
                      errorValue = eitherModule.left(currentResult._1);
                      currentResult = null;
                      break;

                    case CatchActionTag:
                      bracketStack = new AffAction(ConsTag, currentResult, (continuationStack === null ? bracketStack : new AffAction(ConsTag, new AffAction(ResumeTag, continuationStack, captureStack), bracketStack)), currentStack);
                      continuationStack = null;
                      captureStack = null;
                      currentState = FiberState_Running;
                      currentResult = currentResult._1;
                      break;

                    case BracketActionTag:
                      resourceCount++;
                      bracketStack = new AffAction(ConsTag, currentResult, (continuationStack === null ? bracketStack : new AffAction(ConsTag, new AffAction(ResumeTag, continuationStack, captureStack), bracketStack)), currentStack);
                      continuationStack = null;
                      captureStack = null;
                      currentState = FiberState_Running;
                      currentResult = currentResult._1;
                      break;

                    case ForkActionTag:
                      currentState = FiberState_SyncError;
                      currentAction = FiberRunner(eitherModule, schedulerModule, currentResult._2);
                      if (schedulerModule) schedulerModule.register(currentAction);
                      if (currentResult._1) currentAction.run();
                      currentResult = eitherModule.right(currentAction);
                      break;

                    case SequentialActionTag:
                      currentState = FiberState_Running;
                      currentResult = runSequentialAff(eitherModule, schedulerModule, currentResult._1);
                      break;
                  }
                  break;

                case FiberState_Cancelling:
                  if (continuationStack) {
                    continuationStack = null;
                  }
                  if (captureStack) {
                    captureStack = null;
                  }

                  if (bracketStack === null) {
                    currentState = FiberState_Completed;
                    currentResult = currentStack || errorValue || currentResult;
                  } else {
                    currentAction = bracketStack._3;
                    currentBracket = bracketStack._1;
                    bracketStack = bracketStack._2;

                    switch (currentBracket.tag) {
                      case CatchActionTag:
                        if (currentStack && currentStack !== currentAction) {
                          currentState = FiberState_Cancelling;
                        } else if (errorValue) {
                          currentState = FiberState_Running;
                          currentResult = currentBracket._2(eitherModule.fromLeft(errorValue));
                          errorValue = null;
                        } else {
                          currentState = FiberState_Cancelling;
                        }
                        break;

                      case ResumeTag:
                        if (currentStack && currentStack !== currentAction || errorValue) {
                          currentState = FiberState_Cancelling;
                        } else {
                          continuationStack = currentBracket._1;
                          captureStack = currentBracket._2;
                          currentState = FiberState_Suspended;
                          currentResult = eitherModule.fromRight(currentResult);
                        }
                        break;

                      case BracketActionTag:
                        resourceCount--;
                        if (errorValue === null) {
                          currentContinuation = eitherModule.fromRight(currentResult);
                          bracketStack = new AffAction(ConsTag, new AffAction(ReleaseTag, currentBracket._2, currentContinuation), bracketStack, currentAction);
                          if (currentStack === currentAction || resourceCount > 0) {
                            currentState = FiberState_Running;
                            currentResult = currentBracket._3(currentContinuation);
                          } else {
                            currentState = FiberState_Cancelling;
                          }
                        } else {
                          currentState = FiberState_Cancelling;
                        }
                        break;

                      case ReleaseTag:
                        resourceCount++;
                        bracketStack = new AffAction(ConsTag, new AffAction(FinalizedTag, currentResult, errorValue), bracketStack, currentAction);
                        currentState = FiberState_Running;
                        currentResult = (currentStack && currentStack !== currentAction ? currentBracket._1.killed(eitherModule.fromLeft(currentStack))(currentBracket._2) : errorValue ? currentBracket._1.failed(eitherModule.fromLeft(errorValue))(currentBracket._2) : currentBracket._1.completed(eitherModule.fromRight(currentResult))(currentBracket._2));
                        errorValue = null;
                        break;

                      case FinalizerTag:
                        resourceCount++;
                        bracketStack = new AffAction(ConsTag, new AffAction(FinalizedTag, currentResult, errorValue), bracketStack, currentAction);
                        currentState = FiberState_Running;
                        currentResult = currentBracket._1;
                        break;

                      case FinalizedTag:
                        resourceCount--;
                        currentState = FiberState_Cancelling;
                        currentResult = currentBracket._1;
                        errorValue = currentBracket._2;
                        break;
                    }
                  }
                  break;

                case FiberState_Completed:
                  for (let key in listeners) {
                    if (listeners.hasOwnProperty(key)) {
                      rethrowUnhandled = rethrowUnhandled && listeners[key].rethrow;
                      enqueueUnhandledError(listeners[key].handler(currentResult));
                    }
                  }
                  listeners = null;
                  if (currentStack && errorValue) {
                    setTimeout(function() {
                      throw eitherModule.fromLeft(errorValue);
                    }, 0);
                  } else if (eitherModule.isLeft(currentResult) && rethrowUnhandled) {
                    setTimeout(function() {
                      if (rethrowUnhandled) throw eitherModule.fromLeft(currentResult);
                    }, 0);
                  }
                  return;

                case FiberState_Initial:
                  currentState = FiberState_Running;
                  break;

                case FiberState_AsyncWaiting:
                  return; // Should not happen in this loop path
              }
            }
          }

          function addListener(listenerObj) { // Original: V
            return function() {
              if (currentState === FiberState_Completed) {
                rethrowUnhandled = rethrowUnhandled && listenerObj.rethrow;
                listenerObj.handler(currentResult)();
                return function() {};
              }
              const listenerId = listenerIdCounter++; // Original: t
              listeners = listeners || {}; // Original: W
              listeners[listenerId] = listenerObj;
              return function() {
                if (listeners !== null) delete listeners[listenerId];
              };
            };
          }

          return {
            kill: function(killError, completionHandler) { // Original: t, r
              return function() {
                if (currentState === FiberState_Completed) {
                  completionHandler(eitherModule.right(undefined))();
                  return function() {};
                }
                const cleanupListener = addListener({
                  rethrow: false,
                  handler: function() {
                    return completionHandler(eitherModule.right(undefined));
                  }
                })();
                switch (currentState) {
                  case FiberState_Initial:
                    currentStack = eitherModule.left(killError);
                    currentState = FiberState_Completed;
                    currentResult = currentStack;
                    executeStep(executionDepth);
                    break;
                  case FiberState_AsyncWaiting:
                    if (currentStack === null) currentStack = eitherModule.left(killError);
                    if (resourceCount === 0) {
                      currentState = FiberState_Cancelling;
                      currentResult = null;
                      errorValue = null;
                      executeStep(++executionDepth);
                    }
                    break;
                  default:
                    if (currentStack === null) currentStack = eitherModule.left(killError);
                    if (resourceCount === 0) {
                      currentState = FiberState_Cancelling;
                      currentResult = null;
                      errorValue = null;
                    }
                }
                return cleanupListener;
              };
            },
            join: function(completionHandler) { // Original: n
              return function() {
                const cleanupListener = addListener({
                  rethrow: false,
                  handler: completionHandler
                })();
                if (currentState === FiberState_Initial) executeStep(executionDepth);
                return cleanupListener;
              };
            },
            onComplete: addListener, // Original: V
            isSuspended: function() {
              return currentState === FiberState_Initial;
            },
            run: function() {
              if (currentState === FiberState_Initial) {
                if (scheduler.isDraining()) {
                  executeStep(executionDepth);
                } else {
                  scheduler.enqueue(function() {
                    executeStep(executionDepth);
                  });
                }
              }
            }
          };
        }

        // Parallel Aff runner
        function runSequentialAff(eitherMod, schedulerMod, parAffAction) { // Original: U
          let fiberMap = {}; // Original: u
          let fiberIdCounter = 0; // Original: c
          let activeFibers = 0; // Original: i
          let pendingCancellations = {}; // Original: f
          const cancellationError = new Error("[ParAff] Early exit via cancellation"); // Original: D
          let globalError = null; // Original: m
          const moduleHelpers = eitherMod; // Original: g

          function manageFiberCancellations(causeError, currentParAffAction, completionCallback) { // Original: h
            let currentAction = currentParAffAction; // Original: c
            let currentFiber, nextAction, currentStack = null,
              tempStack = null,
              pendingFibers = 0,
              cancelCallbacks = {}; // Original: f, D, m, g

            // Iterate through actions to identify active fibers
            for (;;) {
              currentFiber = null;
              if (currentAction.tag === ForkedTag) {
                if (currentAction._3 === EmptyAction) { // If it's a root forked fiber
                  currentFiber = fiberMap[currentAction._1];
                  cancelCallbacks[pendingFibers++] = currentFiber.kill(causeError, function(result) {
                    return function() {
                      if (--pendingFibers === 0) completionCallback(result)();
                    };
                  });
                }
              }

              // Move to the next action in the parallel composition
              if (currentStack === null) break;
              currentAction = currentStack._2;
              if (tempStack === null) {
                currentStack = null;
              } else {
                currentStack = tempStack._1;
                tempStack = tempStack._2;
              }
            }

            if (pendingFibers === 0) {
              completionCallback(moduleHelpers.right(undefined))();
            } else {
              for (currentFiber = 0; currentFiber < pendingFibers; currentFiber++) {
                cancelCallbacks[currentFiber] = cancelCallbacks[currentFiber]();
              }
            }
            return cancelCallbacks;
          }

          function fiberCompletionHandler(fiberId) { // Original: w
            return function(completionResult) { // Original: e
              return function() {
                delete fiberMap[fiberId];
                parAffAction._3 = completionResult; // Store result on the action node

                // Traverse the parallel action tree to propagate results/errors
                (function processActionNode(result, actionNode, parentStack) { // Original: r
                  let currentResult, currentError;
                  if (moduleHelpers.isLeft(result)) {
                    currentError = result;
                    currentResult = null;
                  } else {
                    currentResult = result;
                    currentError = null;
                  }

                  for (;;) {
                    // Check for global cancellation
                    if (globalError !== null) return;
                    if (actionNode === null) {
                      return completionCallback(currentError || currentResult)();
                    }
                    if (actionNode._3 !== EmptyAction) return; // Already processed or has a result

                    switch (actionNode.tag) {
                      case MapParallelActionTag:
                        if (currentError === null) {
                          actionNode._3 = moduleHelpers.right(actionNode._1(moduleHelpers.fromRight(currentResult)));
                          currentResult = actionNode._3;
                        } else {
                          actionNode._3 = currentError;
                        }
                        break;

                      case ApplyParallelActionTag:
                        currentFiber = actionNode._1._3; // Left child result
                        nextAction = actionNode._2._3; // Right child result

                        if (currentError) {
                          actionNode._3 = currentError;
                          currentBracket = true;
                          currentAction = fiberIdCounter++;
                          pendingCancellations[currentAction] = manageFiberCancellations(cancellationError, (currentError === currentFiber ? actionNode._2 : actionNode._1), function() {
                            return function() {
                              delete pendingCancellations[currentAction];
                              if (currentBracket) currentBracket = false;
                              else if (parentStack === null) processActionNode(currentError, null, null);
                              else processActionNode(currentError, parentStack._1, parentStack._2);
                            };
                          });
                          if (currentBracket) return (currentBracket = false);
                        } else {
                          if (currentFiber === EmptyAction || nextAction === EmptyAction) return; // Wait for both children
                          currentResult = moduleHelpers.right(moduleHelpers.fromRight(currentFiber)(moduleHelpers.fromRight(nextAction)));
                          actionNode._3 = currentResult;
                        }
                        break;

                      case AltParallelActionTag:
                        currentFiber = actionNode._1._3;
                        nextAction = actionNode._2._3;

                        if (currentFiber === EmptyAction && moduleHelpers.isLeft(nextAction) || nextAction === EmptyAction && moduleHelpers.isLeft(currentFiber)) return; // Wait for both if one is an error
                        if (currentFiber !== EmptyAction && moduleHelpers.isLeft(currentFiber) && nextAction !== EmptyAction && moduleHelpers.isLeft(nextAction)) {
                          currentError = (currentResult === currentFiber ? nextAction : currentFiber);
                          currentResult = null;
                          actionNode._3 = currentError;
                        } else if (actionNode._3 = currentResult, currentBracket = true, currentAction = fiberIdCounter++, pendingCancellations[currentAction] = manageFiberCancellations(cancellationError, (currentResult === currentFiber ? actionNode._2 : actionNode._1), function() {
                            return function() {
                              delete pendingCancellations[currentAction];
                              if (currentBracket) currentBracket = false;
                              else if (parentStack === null) processActionNode(currentResult, null, null);
                              else processActionNode(currentResult, parentStack._1, parentStack._2);
                            };
                          }), currentBracket) return (currentBracket = false);
                    }
                    if (parentStack === null) {
                      actionNode = null;
                    } else {
                      actionNode = parentStack._1;
                      parentStack = parentStack._2;
                    }
                  }
                })(completionResult, parAffAction._2._1, parAffAction._2._2);
              };
            };
          }

          return function() {
            let currentParallelAction, nextParallelAction, currentBranch = FiberState_Running,
              currentActionNode = parAffAction,
              currentParentStack = null,
              tempParentStack = null;

            for (;;) {
              currentParallelAction = null;
              nextParallelAction = null;

              switch (currentBranch) {
                case FiberState_Running:
                  switch (currentActionNode.tag) {
                    case MapParallelActionTag:
                      if (currentParentStack) {
                        tempParentStack = new AffAction(ConsTag, currentParentStack, tempParentStack);
                      }
                      currentParentStack = new AffAction(MapParallelActionTag, currentActionNode._1, EmptyAction, EmptyAction);
                      currentActionNode = currentActionNode._2;
                      break;

                    case ApplyParallelActionTag:
                      if (currentParentStack) {
                        tempParentStack = new AffAction(ConsTag, currentParentStack, tempParentStack);
                      }
                      currentParentStack = new AffAction(ApplyParallelActionTag, EmptyAction, currentActionNode._2, EmptyAction);
                      currentActionNode = currentActionNode._1;
                      break;

                    case AltParallelActionTag:
                      if (currentParentStack) {
                        tempParentStack = new AffAction(ConsTag, currentParentStack, tempParentStack);
                      }
                      currentParentStack = new AffAction(AltParallelActionTag, EmptyAction, currentActionNode._2, EmptyAction);
                      currentActionNode = currentActionNode._1;
                      break;

                    default: // Base case: an actual Aff action
                      nextParallelAction = fiberIdCounter++;
                      currentBranch = FiberState_Cancelling;
                      currentParallelAction = currentActionNode;
                      currentActionNode = new AffAction(ForkedTag, nextParallelAction, new AffAction(ConsTag, currentParentStack, tempParentStack), EmptyAction);
                      const newFiber = FiberRunner(eitherMod, schedulerMod, currentParallelAction);
                      newFiber.onComplete({
                        rethrow: false,
                        handler: fiberCompletionHandler(currentActionNode)
                      })();
                      fiberMap[nextParallelAction] = newFiber;
                      if (schedulerMod) schedulerMod.register(newFiber);
                  }
                  break;

                case FiberState_Cancelling:
                  if (currentParentStack === null) break; // All actions processed
                  if (currentParentStack._1 === EmptyAction) {
                    currentParentStack._1 = currentActionNode;
                    currentBranch = FiberState_Running;
                    currentActionNode = currentParentStack._2;
                    currentParentStack._2 = EmptyAction;
                  } else {
                    currentParentStack._2 = currentActionNode;
                    currentActionNode = currentParentStack;
                    if (tempParentStack === null) {
                      currentParentStack = null;
                    } else {
                      currentParentStack = tempParentStack._1;
                      tempParentStack = tempParentStack._2;
                    }
                  }
              }
            }

            globalError = currentActionNode; // Store the root of the constructed parallel action tree

            for (nextParallelAction = 0; nextParallelAction < fiberIdCounter; nextParallelAction++) {
              fiberMap[nextParallelAction].run();
            }
          };
        }

        function createAsyncAff(asyncAction) { // Original: k
          return new AffAction(AsyncActionTag, function(callback) { // Original: e
            return function() {
              return runSequentialAff(eitherModule, schedulerModule, asyncAction);
            };
          });
        }

        return {
          EMPTY: EmptyAction,
          Pure: createAffActionFactory(PureActionTag),
          Throw: createAffActionFactory(ThrowActionTag),
          Catch: createAffActionFactory(CatchActionTag),
          Sync: createAffActionFactory(SyncActionTag),
          Async: createAffActionFactory(AsyncActionTag),
          Bind: createAffActionFactory(BindActionTag),
          Bracket: createAffActionFactory(BracketActionTag),
          Fork: createAffActionFactory(ForkActionTag),
          Sequential: createAffActionFactory(SequentialActionTag),
          ParMap: createAffActionFactory(MapParallelActionTag),
          ParApply: createAffActionFactory(ApplyParallelActionTag),
          ParAlt: createAffActionFactory(AltParallelActionTag),
          Fiber: FiberRunner,
          Supervisor: function(eitherModule) { // Original: n
            let activeFibers = {}; // Original: t
            let nextFiberId = 0; // Original: r
            let currentFiberCount = 0; // Original: e
            return {
              register: function(fiber) { // Original: n
                const id = nextFiberId++; // Original: a
                fiber.onComplete({
                  rethrow: true,
                  handler: function(result) {
                    return function() {
                      currentFiberCount--;
                      delete activeFibers[id];
                      if (eitherModule.isLeft(result) && eitherModule.fromLeft(result)) {
                        setTimeout(function() {
                          throw eitherModule.fromLeft(result);
                        }, 0);
                      }
                    };
                  }
                });
                activeFibers[id] = fiber;
                currentFiberCount++;
              },
              isEmpty: function() {
                return currentFiberCount === 0;
              },
              killAll: function(error, callback) { // Original: o, i
                return function() {
                  let pendingKills = 0; // Original: u
                  const killCallbacks = {}; // Original: c

                  function performKill(fiberId) { // Original: f
                    killCallbacks[fiberId] = activeFibers[fiberId].kill(error, function(result) {
                      return function() {
                        delete killCallbacks[fiberId];
                        pendingKills--;
                        if (eitherModule.isLeft(result) && eitherModule.fromLeft(result)) {
                          setTimeout(function() {
                            throw eitherModule.fromLeft(result);
                          }, 0);
                        }
                        if (pendingKills === 0) callback();
                      };
                    })();
                  }

                  for (let id in activeFibers) { // Original: l
                    if (activeFibers.hasOwnProperty(id)) {
                      pendingKills++;
                      performKill(id);
                    }
                  }
                  activeFibers = {};
                  nextFiberId = 0;
                  currentFiberCount = 0;

                  return function(ignored) { // Original: n
                    return new AffAction(AsyncActionTag, function() { // Original: a
                      return function() {
                        for (let id in killCallbacks) {
                          if (killCallbacks.hasOwnProperty(id)) killCallbacks[id]();
                        }
                      };
                    });
                  };
                };
              }
            };
          },
          Scheduler: scheduler,
          nonCanceler: noOpCanceler
        };
      }(); // Original: t

      affInternalExports._pure = AffInternal.Pure;
      affInternalExports._map = function(mappingFunc) { // Original: n
        return function(affAction) { // Original: r
          if (affAction.tag === AffInternal.Pure.tag) {
            return AffInternal.Pure(mappingFunc(affAction._1));
          }
          return AffInternal.Bind(affAction, function(value) {
            return AffInternal.Pure(mappingFunc(value));
          });
        };
      };
      affInternalExports._bind = function(affAction) { // Original: n
        return function(continuation) { // Original: r
          return AffInternal.Bind(affAction, continuation);
        };
      };
      affInternalExports._liftEffect = AffInternal.Sync;
      affInternalExports._parAffMap = function(mappingFunc) { // Original: n
        return function(parAffAction) { // Original: r
          return AffInternal.ParMap(mappingFunc, parAffAction);
        };
      };
      affInternalExports._parAffApply = function(funcParAff) { // Original: n
        return function(valueParAff) { // Original: r
          return AffInternal.ParApply(funcParAff, valueParAff);
        };
      };
      affInternalExports.makeAff = AffInternal.Async;
      affInternalExports._makeFiber = function(eitherModule, initialAffAction) { // Original: n, r
        return function() {
          return AffInternal.Fiber(eitherModule, null, initialAffAction);
        };
      };
      affInternalExports._sequential = AffInternal.Sequential;
    })(moduleStore["Effect.Aff"] = moduleStore["Effect.Aff"] || {});

    // Effect.Exception Module (error, throwException)
    (function(exceptionExports) { // Original: n
      "use strict";
      exceptionExports.createError = function(message) { // Original: n
        return new Error(message);
      };
      exceptionExports.throwJsException = function(exception) { // Original: n
        return function() {
          throw exception;
        };
      };
    })(moduleStore["Effect.Exception"] = moduleStore["Effect.Exception"] || {});

    // Effect.Exception Module (main part)
    (function(exceptionExports) { // Original: t
      "use strict";
      const exceptionMod = moduleStore["Effect.Exception"]; // Original: r
      exceptionExports.throw = function(message) { // Original: n
        return exceptionMod.throwJsException(exceptionMod.createError(message));
      };
    })(moduleStore["Effect.Exception"] = moduleStore["Effect.Exception"] || {});

    // Effect.Aff Module (main part)
    (function(affExports) { // Original: t
      "use strict";
      const affInternalMod = moduleStore["Effect.Aff"]; // Original: r
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: e
      const applyMod = moduleStore["Control.Apply"]; // Original: a
      const bindMod = moduleStore["Control.Bind"]; // Original: o
      const monadMod = moduleStore["Control.Monad"]; // Original: i
      const parallelMod = moduleStore["Control.Parallel"]; // Original: u
      const parallelClassMod = moduleStore["Control.Parallel.Class"]; // Original: c
      const eitherMod = moduleStore["Data.Either"]; // Original: f
      const foldableMod = moduleStore["Data.Foldable"]; // Original: l
      const functionMod = moduleStore["Data.Function"]; // Original: s
      const functorMod = moduleStore["Data.Functor"]; // Original: d
      const monoidMod = moduleStore["Data.Monoid"]; // Original: p
      const semigroupMod = moduleStore["Data.Semigroup"]; // Original: D
      const unitMod = moduleStore["Data.Unit"]; // Original: m
      const effectMod = moduleStore["Effect"]; // Original: g
      const effectClassMod = moduleStore["Effect.Class"]; // Original: h
      const partialUnsafeMod = moduleStore["Partial.Unsafe"]; // Original: v
      const unsafeCoerceMod = moduleStore["Unsafe.Coerce"]; // Original: C

      const functorParAffInstance = new functorMod.Functor(affInternalMod._parAffMap); // Original: w
      const functorAffInstance = new functorMod.Functor(affInternalMod._map); // Original: y

      const eitherHelpers = { // Original: E
        isLeft: function(val) {
          if (val instanceof eitherMod.Left) return true;
          if (val instanceof eitherMod.Right) return false;
          throw new Error("Invalid Either value: " + val.constructor.name);
        },
        fromLeft: function(val) {
          if (val instanceof eitherMod.Left) return val.value0;
          if (val instanceof eitherMod.Right) return partialUnsafeMod.unsafeCrashWith("Cannot get Left value from Right");
          throw new Error("Invalid Either value: " + val.constructor.name);
        },
        fromRight: function(val) {
          if (val instanceof eitherMod.Right) return val.value0;
          if (val instanceof eitherMod.Left) return partialUnsafeMod.unsafeCrashWith("Cannot get Right value from Left");
          throw new Error("Invalid Either value: " + val.constructor.name);
        },
        left: eitherMod.Left.create,
        right: eitherMod.Right.create
      };

      const launchAff = function(affAction) { // Original: A
        return function() {
          const fiber = affInternalMod._makeFiber(eitherHelpers, affAction)();
          fiber.run();
          return fiber;
        };
      };

      const applyParAffInstance = new applyMod.Apply(function() {
        return functorParAffInstance;
      }, affInternalMod._parAffApply); // Original: S

      const monadAffInstance = new monadMod.Monad(function() {
        return applicativeAffInstance;
      }, function() {
        return bindAffInstance;
      }); // Original: b

      const bindAffInstance = new bindMod.Bind(function() {
        return applyAffInstance;
      }, affInternalMod._bind); // Original: _

      const applyAffInstance = new applyMod.Apply(function() {
        return functorAffInstance;
      }, monadMod.ap(monadAffInstance)); // Original: F

      const applicativeAffInstance = new applicativeMod.Applicative(function() {
        return applyAffInstance;
      }, affInternalMod._pure); // Original: M

      const monadEffectAffInstance = new effectClassMod.MonadEffect(function() {
        return monadAffInstance;
      }, affInternalMod._liftEffect); // Original: R

      const parallelAffInstance = new parallelClassMod.Parallel(function() {
        return applicativeParAffInstance;
      }, function() {
        return monadAffInstance;
      }, unsafeCoerceMod.unsafeCoerce, affInternalMod._sequential); // Original: P

      const applicativeParAffInstance = new applicativeMod.Applicative(function() {
        return applyParAffInstance;
      }, function(value) { // Original: n
        return parallelClassMod.parallel(parallelAffInstance)(applicativeMod.pure(applicativeAffInstance)(value));
      }); // Original: T

      const semigroupCancelerInstance = new semigroupMod.Semigroup(function(canceler1) { // Original: n
        return function(canceler2) { // Original: t
          return function(error) { // Original: r
            return parallelMod.parSequence_(parallelAffInstance)(foldableMod.foldableArray)([canceler1(error), canceler2(error)]);
          };
        };
      }); // Original: I

      const noOpCanceler = functionMod.constant(applicativeMod.pure(applicativeAffInstance)(unitMod.unitValue)); // Original: B

      const monoidCancelerInstance = new monoidMod.Monoid(function() {
        return semigroupCancelerInstance;
      }, noOpCanceler); // Original: U

      affExports.launchAff = launchAff;
      affExports.launchAff_ = function(affAction) { // Original: n
        return functorMod.void(effectMod.functorEffect)(launchAff(affAction));
      };
      affExports.nonCanceler = noOpCanceler;
      affExports.functorAff = functorAffInstance;
      affExports.applyAff = applyAffInstance;
      affExports.applicativeAff = applicativeAffInstance;
      affExports.bindAff = bindAffInstance;
      affExports.monadAff = monadAffInstance;
      affExports.monadEffectAff = monadEffectAffInstance;
      affExports.functorParAff = functorParAffInstance;
      affExports.applyParAff = applyParAffInstance;
      affExports.applicativeParAff = applicativeParAffInstance;
      affExports.parallelAff = parallelAffInstance;
      affExports.semigroupCanceler = semigroupCancelerInstance;
      affExports.monoidCanceler = monoidCancelerInstance;
      affExports.makeAff = affInternalMod.makeAff;
    })(moduleStore["Effect.Aff"] = moduleStore["Effect.Aff"] || {});

    // Node.Encoding Module
    (function(encodingExports) { // Original: t
      "use strict";
      const showMod = moduleStore["Data.Show"]; // Original: r
      const ASCIIEncoding = function() {
        function ASCII() {}
        ASCII.value = new ASCII();
        return ASCII;
      }(); // Original: e
      const UTF8Encoding = function() {
        function UTF8() {}
        UTF8.value = new UTF8();
        return UTF8;
      }(); // Original: a
      const UTF16LEEncoding = function() {
        function UTF16LE() {}
        UTF16LE.value = new UTF16LE();
        return UTF16LE;
      }(); // Original: o
      const UCS2Encoding = function() {
        function UCS2() {}
        UCS2.value = new UCS2();
        return UCS2;
      }(); // Original: i
      const Base64Encoding = function() {
        function Base64() {}
        Base64.value = new Base64();
        return Base64;
      }(); // Original: u
      const Latin1Encoding = function() {
        function Latin1() {}
        Latin1.value = new Latin1();
        return Latin1;
      }(); // Original: c
      const BinaryEncoding = function() {
        function Binary() {}
        Binary.value = new Binary();
        return Binary;
      }(); // Original: f
      const HexEncoding = function() {
        function Hex() {}
        Hex.value = new Hex();
        return Hex;
      }(); // Original: l
      const encodingShowInstance = new showMod.Show(function(encoding) { // Original: n
        if (encoding === ASCIIEncoding.value) return "ASCII";
        if (encoding === UTF8Encoding.value) return "UTF8";
        if (encoding === UTF16LEEncoding.value) return "UTF16LE";
        if (encoding === UCS2Encoding.value) return "UCS2";
        if (encoding === Base64Encoding.value) return "Base64";
        if (encoding === Latin1Encoding.value) return "Latin1";
        if (encoding === BinaryEncoding.value) return "Binary";
        if (encoding === HexEncoding.value) return "Hex";
        throw new Error("Unknown encoding type: " + encoding.constructor.name);
      }); // Original: s
      encodingExports.ASCII = ASCIIEncoding;
      encodingExports.UTF8 = UTF8Encoding;
      encodingExports.UTF16LE = UTF16LEEncoding;
      encodingExports.UCS2 = UCS2Encoding;
      encodingExports.Base64 = Base64Encoding;
      encodingExports.Latin1 = Latin1Encoding;
      encodingExports.Binary = BinaryEncoding;
      encodingExports.Hex = HexEncoding;
      encodingExports.encodingToNodeString = function(encoding) { // Original: n
        if (encoding === ASCIIEncoding.value) return "ascii";
        if (encoding === UTF8Encoding.value) return "utf8";
        if (encoding === UTF16LEEncoding.value) return "utf16le";
        if (encoding === UCS2Encoding.value) return "ucs2";
        if (encoding === Base64Encoding.value) return "base64";
        if (encoding === Latin1Encoding.value) return "latin1";
        if (encoding === BinaryEncoding.value) return "binary";
        if (encoding === HexEncoding.value) return "hex";
        throw new Error("Unknown encoding type for Node conversion: " + encoding.constructor.name);
      };
      encodingExports.showEncoding = encodingShowInstance;
    })(moduleStore["Node.Encoding"] = moduleStore["Node.Encoding"] || {});

    // Node.Process Module (process global)
    (function(processExports) { // Original: t
      "use strict";
      (moduleStore["Node.Process"] = moduleStore["Node.Process"] || {}).nodeProcessGlobal = process; // Original: process
    })();

    // Node.Stream Module (raw stream functions)
    (function(streamExports) { // Original: n
      "use strict";
      streamExports.readChunkImpl = function(handleString) { // Original: n
        return function(handleBuffer) { // Original: t
          return function(chunkData) { // Original: r
            if (chunkData instanceof Buffer) return handleBuffer(chunkData);
            if (typeof chunkData === "string") return handleString(chunkData);
            throw new Error("Node.Stream.readChunkImpl: Unrecognized chunk type; expected String or Buffer, got: " + chunkData);
          };
        };
      };
      streamExports.onDataEitherImpl = function(chunkHandler) { // Original: n
        return function(streamInstance) { // Original: t
          return function(effectCallback) { // Original: r
            return function() {
              streamInstance.on("data", function(chunk) {
                effectCallback(chunkHandler(chunk))();
              });
            };
          };
        };
      };
      streamExports.onStreamEnd = function(streamInstance) { // Original: n
        return function(endCallback) { // Original: t
          return function() {
            streamInstance.on("end", endCallback);
          };
        };
      };
      streamExports.writeStream = function(streamInstance) { // Original: n
        return function(data) { // Original: t
          return function(encoding) { // Original: r
            return function() {
              return streamInstance.write(data, null, encoding);
            };
          };
        };
      };
      streamExports.writeStringImplementation = function(streamInstance) { // Original: n
        return function(encoding) { // Original: t
          return function(dataString) { // Original: r
            return function(callback) { // Original: e
              return function() {
                return streamInstance.write(dataString, encoding, callback);
              };
            };
          };
        };
      };
    })(moduleStore["Node.Stream"] = moduleStore["Node.Stream"] || {});

    // Node.Buffer Module (toStringImpl)
    (function(bufferExports) { // Original: t
      "use strict";
      (moduleStore["Node.Buffer"] = moduleStore["Node.Buffer"] || {}).toStringImplementation = function(encoding) { // Original: n
        return function(bufferInstance) { // Original: t
          return function() {
            return bufferInstance.toString(encoding);
          };
        };
      };
    })();

    // Node.Buffer Module (main part)
    (function(bufferExports) { // Original: t
      "use strict";
      const nodeBufferMod = moduleStore["Node.Buffer"]; // Original: r
      const nodeEncodingMod = moduleStore["Node.Encoding"]; // Original: e
      bufferExports.toString = function(encodingType) { // Original: n
        return nodeBufferMod.toStringImplementation(nodeEncodingMod.encodingToNodeString(encodingType));
      };
    })(moduleStore["Node.Buffer"] = moduleStore["Node.Buffer"] || {});

    // Node.Stream Module (main part)
    (function(streamExports) { // Original: t
      "use strict";
      const nodeStreamMod = moduleStore["Node.Stream"]; // Original: r
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: e
      const bindMod = moduleStore["Control.Bind"]; // Original: a
      const eitherMod = moduleStore["Data.Either"]; // Original: o
      const effectMod = moduleStore["Effect"]; // Original: u
      const exceptionMod = moduleStore["Effect.Exception"]; // Original: c
      const nodeBufferMod = moduleStore["Node.Buffer"]; // Original: f
      const nodeEncodingMod = moduleStore["Node.Encoding"]; // Original: l
      const chunkReader = nodeStreamMod.readChunkImpl(eitherMod.Left.create)(eitherMod.Right.create); // Original: s
      const onDataEither = function(streamInstance) { // Original: n
        return function(callback) { // Original: t
          return nodeStreamMod.onDataEitherImpl(chunkReader)(streamInstance)(callback);
        };
      }; // Original: d
      const onDataStream = function(streamInstance) { // Original: n
        return function(callback) { // Original: t
          return onDataEither(streamInstance)(bindMod.composeKleisliFlipped(effectMod.bindEffect)(callback)(function(chunkEither) { // Original: n
            if (chunkEither instanceof eitherMod.Left) return exceptionMod.throw("Stream encoding should not be set for this handler");
            if (chunkEither instanceof eitherMod.Right) return applicativeMod.pure(effectMod.applicativeEffect)(chunkEither.value0);
            throw new Error("Pattern match error in Node.Stream.onDataStream: " + chunkEither.constructor.name);
          }));
        };
      }; // Original: p
      streamExports.onData = onDataStream;
      streamExports.onDataString = function(streamInstance) { // Original: n
        return function(encodingType) { // Original: t
          return function(callback) { // Original: r
            return onDataStream(streamInstance)(bindMod.composeKleisliFlipped(effectMod.bindEffect)(callback)(nodeBufferMod.toString(encodingType)));
          };
        };
      };
      streamExports.onDataEither = onDataEither;
      streamExports.writeString = function(streamInstance) { // Original: n
        return function(encodingType) { // Original: t
          return nodeStreamMod.writeStringImplementation(streamInstance)(nodeEncodingMod.encodingToNodeString(encodingType));
        };
      };
      streamExports.onEnd = nodeStreamMod.onStreamEnd;
    })(moduleStore["Node.Stream"] = moduleStore["Node.Stream"] || {});

    // Node.Process Module (stdin, stdout)
    (function(processExports) { // Original: t
      "use strict";
      const nodeProcessMod = moduleStore["Node.Process"]; // Original: r
      const stdoutStream = nodeProcessMod.nodeProcessGlobal.stdout; // Original: e
      const stdinStream = nodeProcessMod.nodeProcessGlobal.stdin; // Original: a
      processExports.stdin = stdinStream;
      processExports.stdout = stdoutStream;
    })(moduleStore["Node.Process"] = moduleStore["Node.Process"] || {});


    // DIVERTA2019B Application Logic
    (function(appExports) { // Original: t
      "use strict";
      const applicativeMod = moduleStore["Control.Applicative"]; // Original: r
      const bindMod = moduleStore["Control.Bind"]; // Original: e
      const categoryMod = moduleStore["Control.Category"]; // Original: a
      const stInternalMod = moduleStore["Control.Monad.ST.Internal"]; // Original: o
      const dataArrayMod = moduleStore["Data.Array"]; // Original: i
      const eitherMod = moduleStore["Data.Either"]; // Original: u
      const euclideanRingMod = moduleStore["Data.EuclideanRing"]; // Original: c
      const functorMod = moduleStore["Data.Functor"]; // Original: f
      const dataIntMod = moduleStore["Data.Int"]; // Original: l
      const maybeMod = moduleStore["Data.Maybe"]; // Original: s
      const monoidMod = moduleStore["Data.Monoid"]; // Original: d
      const ordMod = moduleStore["Data.Ord"]; // Original: p
      const semiringMod = moduleStore["Data.Semiring"]; // Original: D
      const showMod = moduleStore["Data.Show"]; // Original: m
      const stringCommonMod = moduleStore["Data.String.Common"]; // Original: g
      const unitMod = moduleStore["Data.Unit"]; // Original: h
      const effectMod = moduleStore["Effect"]; // Original: v
      const affMod = moduleStore["Effect.Aff"]; // Original: C
      const effectClassMod = moduleStore["Effect.Class"]; // Original: w
      const refMod = moduleStore["Effect.Ref"]; // Original: y
      const encodingMod = moduleStore["Node.Encoding"]; // Original: E
      const processMod = moduleStore["Node.Process"]; // Original: A
      const streamMod = moduleStore["Node.Stream"]; // Original: S
      const partialUnsafeMod = moduleStore["Partial.Unsafe"]; // Original: b

      // Helper to extract value from Either or crash
      const unwrapOrExit = (eitherValue, errorMessage) => eitherMod.either(
        (err) => partialUnsafeMod.unsafeCrashWith(errorMessage + ": " + err),
        (data) => data
      )(eitherValue);

      // Helper to parse input string into an array of numbers
      const parseInputNumbers = (inputLine) => stringCommonMod.split(" ")(stringCommonMod.trim(inputLine)); // Original: _

      // Core calculation logic, de-curried from original Purescript
      const calculateCombinations = (redCost, greenCost, blueCost, targetSum) => {
        let solutionCount = 0;
        const maxItemLimit = 3000; // Derived from `3e3` in original Purescript code

        // Loop for count of red items
        const maxRedCount = Math.min(maxItemLimit, euclideanRingMod.integerDivision(targetSum)(redCost));
        for (let currentRedCount = 0; currentRedCount <= maxRedCount; currentRedCount++) {
          const sumAfterRed = redCost * currentRedCount;
          const remainingSumAfterRed = targetSum - sumAfterRed;

          if (remainingSumAfterRed < 0) {
            continue; // Optimization: current red count is too high
          }

          // Loop for count of green items
          const maxGreenCount = Math.min(maxItemLimit, euclideanRingMod.integerDivision(remainingSumAfterRed)(greenCost));
          for (let currentGreenCount = 0; currentGreenCount <= maxGreenCount; currentGreenCount++) {
            const sumAfterGreen = greenCost * currentGreenCount;
            const remainingSumAfterGreen = remainingSumAfterRed - sumAfterGreen;

            if (remainingSumAfterGreen < 0) {
              continue; // Optimization: current green count is too high
            }

            // Check for blue items
            if (blueCost === 0) {
              if (remainingSumAfterGreen === 0) {
                solutionCount++; // If blue cost is 0, it contributes only if remaining sum is already 0
              }
            } else {
              // If blue cost is positive, check for exact divisibility
              if (euclideanRingMod.integerModulo(remainingSumAfterGreen)(blueCost) === 0) {
                const blueItemCount = remainingSumAfterGreen / blueCost;
                if (blueItemCount <= maxItemLimit) {
                  solutionCount++;
                }
              }
            }
          }
        }
        return solutionCount;
      }; // Original: F

      // Solver function that takes an input string and returns the result string
      const solveProblem = function(inputString) { // Original: F(n)
        const parsedNumericValues = dataArrayMod.mapMaybe(dataIntMod.fromString)(parseInputNumbers(inputString));

        const colorDataEither = eitherMod.note(
          "Input must be 4 space-separated integers (R G B N), e.g., '100 200 300 700'."
        )(
          parsedNumericValues.length === 4 ?
          new maybeMod.Just({
            r: parsedNumericValues[0],
            g: parsedNumericValues[1],
            b: parsedNumericValues[2],
            n: parsedNumericValues[3]
          }) :
          maybeMod.Nothing.value
        );

        const {
          r,
          g,
          b,
          n
        } = unwrapOrExit(colorDataEither, "Failed to parse RGBN values");

        const resultCount = calculateCombinations(r, g, b, n);

        return showMod.show(showMod.showInt)(resultCount) + "\n";
      };

      // Aff action to read all data from stdin
      const readAllStdinAff = affMod.makeAff(function(completionCallback) { // Original: n
        return function() {
          const inputBuffer = refMod.new("")(); // Original: t
          streamMod.onDataString(processMod.stdin)(encodingMod.UTF8.value)(
            function(chunk) { // Original: n
              return function() {
                const currentContent = refMod.read(inputBuffer)(); // Original: r
                return refMod.write(currentContent + chunk)(inputBuffer)();
              };
            }
          )();

          streamMod.onEnd(processMod.stdin)(
            function() {
              const finalContent = refMod.read(inputBuffer)(); // Original: e
              return completionCallback(applicativeMod.pure(eitherMod.applicativeEither)(finalContent))();
            }
          )();

          return monoidMod.mempty(affMod.monoidCanceler);
        };
      }); // Original: M

      // Main program execution
      const runApplication = affMod.launchAff_( // Original: R
        bindMod.bind(affMod.bindAff)(readAllStdinAff)( // Original: M
          function(inputEitherResult) { // Original: n
            const collectedInput = unwrapOrExit(inputEitherResult, "Error while reading standard input");
            return bindMod.bind(affMod.bindAff)(
              applicativeMod.pure(affMod.applicativeAff)(solveProblem(collectedInput)) // Original: F(n)
            )(
              function(outputString) { // Original: n
                return effectClassMod.liftEffect(affMod.monadEffectAff)(
                  functorMod.void(effectMod.functorEffect)(
                    streamMod.writeString(processMod.stdout)(encodingMod.UTF8.value)(outputString)(
                      applicativeMod.pure(effectMod.applicativeEffect)(unitMod.unitValue)
                    )
                  )
                );
              }
            );
          }
        )
      );

      appExports.main = runApplication; // Original: R
      appExports.solve = solveProblem; // Original: F
    })(moduleStore.DIVERTA2019B = moduleStore.DIVERTA2019B || {});

    moduleStore.DIVERTA2019B.main();
  }, {}]
}, ["Focm"], null);