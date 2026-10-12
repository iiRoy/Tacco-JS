moduleLoader = (function(moduleDefinitions, loadedModulesCache, entryModuleIDs, globalExportName) {
  // `firstError`: Stores the first error encountered during module loading.
  let firstError;

  // `parentBundlerLoader`: Reference to a potential parent module loader (if nested).
  const parentBundlerLoader = (typeof moduleLoader === 'function' && moduleLoader);

  // `nodeRequireFunction`: Reference to Node.js's native `require` for external modules.
  const nodeRequireFunction = (typeof require === 'function' && require);

  // `executeModule`: The core function responsible for loading and executing a module.
  function executeModule(moduleIdentifier, suppressMissingError) {
    // If the module is already in cache, return its exports.
    if (loadedModulesCache[moduleIdentifier]) {
      return loadedModulesCache[moduleIdentifier].exports;
    }

    // If the module definition doesn't exist in our bundle.
    if (!moduleDefinitions[moduleIdentifier]) {
      // Try to load from a local or parent bundler loader.
      const localBundlerLoader = (typeof moduleLoader === 'function' && moduleLoader);
      if (!suppressMissingError && localBundlerLoader) {
        return localBundlerLoader(moduleIdentifier, true);
      }
      if (parentBundlerLoader) {
        return parentBundlerLoader(moduleIdentifier, true);
      }
      // Try Node.js `require` for external modules.
      if (nodeRequireFunction && typeof moduleIdentifier === 'string') {
        return nodeRequireFunction(moduleIdentifier);
      }

      // If all attempts fail, throw an error.
      const notFoundError = new Error("Cannot locate module '" + moduleIdentifier + "'");
      notFoundError.code = "MODULE_NOT_FOUND";
      throw notFoundError;
    }

    // `currentModuleExecutor`: A local `require`-like function for the current module's dependencies.
    // It resolves relative paths using the module's own dependency map.
    const currentModuleExecutor = function(dependencyPath) {
      return executeModule(currentModuleExecutor.resolveDependency(dependencyPath));
    };

    // `resolveDependency`: Maps relative dependency paths to full module identifiers.
    currentModuleExecutor.resolveDependency = function(relativePath) {
      return moduleDefinitions[moduleIdentifier][1][relativePath] || relativePath;
    };
    // `depsCache`: A placeholder, not actively used in this Parcel version's `p.cache`.
    currentModuleExecutor.depsCache = {};

    // Create a new module object and store it in the cache.
    const currentModuleObject = loadedModulesCache[moduleIdentifier] = new executeModule.Module(moduleIdentifier);

    // Execute the module's code.
    // `moduleDefinitions[moduleIdentifier][0]` is the module function.
    // It's called with `exports`, `module`, `module.exports`, and `this`.
    moduleDefinitions[moduleIdentifier][0].call(currentModuleObject.exports, currentModuleExecutor, currentModuleObject, currentModuleObject.exports, this);

    // Return the module's exports.
    return loadedModulesCache[moduleIdentifier].exports;
  }

  // Mark this function as a Parcel-like bundler loader.
  executeModule.isBundlerLoader = true;

  // `Module` constructor for internal module representation.
  executeModule.Module = function(id) {
    this.id = id;
    this.bundle = executeModule;
    this.exports = {};
  };

  // Store references to all module definitions and the cache.
  executeModule.allModuleDefinitions = moduleDefinitions;
  executeModule.moduleCache = loadedModulesCache;

  // Store a reference to the parent loader (if any).
  executeModule.parentLoader = parentBundlerLoader;

  // `registerModule`: Allows dynamic registration of new modules.
  executeModule.registerModule = function(id, content) {
    moduleDefinitions[id] = [function(executor, moduleRef) {
      moduleRef.exports = content;
    }, {}];
  };

  // Process all entry points.
  for (let idx = 0; idx < entryModuleIDs.length; idx++) {
    try {
      executeModule(entryModuleIDs[idx]);
    } catch (err) {
      // Capture the first error encountered.
      firstError = firstError || err;
    }
  }

  // Handle exports for the main entry point(s).
  if (entryModuleIDs.length > 0) {
    const finalExport = executeModule(entryModuleIDs[entryModuleIDs.length - 1]);
    // CommonJS (Node.js) export.
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = finalExport;
    }
    // AMD (RequireJS) export.
    else if (typeof define === 'function' && define.amd) {
      define(() => finalExport);
    }
    // Global variable export.
    else if (globalExportName) {
      this[globalExportName] = finalExport;
    }
  }

  // Set the global `moduleLoader` to this instance.
  // This is how subsequent calls to `parcelRequire` (or `moduleLoader` here) will use this instance.
  globalThis.moduleLoader = executeModule;

  // If an error occurred during entry point loading, re-throw it.
  if (firstError) {
    throw firstError;
  }

  // Return the main module loader function.
  return executeModule;

})({
  "Focm": [function(require, module, exports) {
    // This is the "Focm" module, which contains the PureScript runtime and application logic.
    // It defines a global-like object `psRuntimeEnv` to store all PureScript module exports.
    let psRuntimeEnv = {};

    // Helper for creating module namespaces if they don't exist.
    function establishModuleNamespace(path) {
      let current = psRuntimeEnv;
      const parts = path.split('.');
      for (const part of parts) {
        current = current[part] = current[part] || {};
      }
      return current;
    }

    // --- Control.Apply ---
    // Provides `arrayApply` for applying a list of functions to a list of values.
    ((applyMod) => {
      "use strict";
      applyMod.arrayApply = function(functionList) {
        return function(valueList) {
          const funcCount = functionList.length;
          const valCount = valueList.length;
          const resultArray = new Array(funcCount * valCount);
          let resultIndex = 0;
          for (let i = 0; i < funcCount; i++) {
            const currentFunc = functionList[i];
            for (let j = 0; j < valCount; j++) {
              resultArray[resultIndex++] = currentFunc(valueList[j]);
            }
          }
          return resultArray;
        };
      };
    })(establishModuleNamespace("Control.Apply"));

    // --- Data.Boolean ---
    // Defines a simple `otherwise` constant for boolean logic.
    ((booleanMod) => {
      "use strict";
      booleanMod.otherwise = true;
    })(establishModuleNamespace("Data.Boolean"));

    // --- Data.Eq ---
    // Provides `refEq` for strict equality comparison.
    ((eqMod) => {
      "use strict";
      eqMod.referenceEquality = function(val1) {
        return function(val2) {
          return val1 === val2;
        };
      };
    })(establishModuleNamespace("Data.Eq"));

    // --- Data.Unit ---
    // Defines the `unit` value, equivalent to `undefined` or `void` in JS.
    ((unitMod) => {
      "use strict";
      unitMod.unitValue = {}; // PureScript's Unit is an empty object.
    })(establishModuleNamespace("Data.Unit"));

    // --- Data.Show ---
    // Provides `showIntImpl` for converting integers to strings.
    ((showMod) => {
      "use strict";
      showMod.integerToStringImpl = function(num) {
        return String(num);
      };
    })(establishModuleNamespace("Data.Show"));

    // --- Data.Show (Type Class Instance) ---
    // Defines the `Show` type class and instances for `Int`.
    ((targetShowMod) => {
      "use strict";
      const showModuleExports = psRuntimeEnv.Data.Show; // Access the previously defined show functions.

      // `ShowTypeClass`: Constructor for a Show instance.
      const ShowTypeClass = function(displayFunc) {
        this.show = displayFunc;
      };

      // `integerShowInstance`: An instance of Show for integers.
      const integerShowInstance = new ShowTypeClass(showModuleExports.integerToStringImpl);

      targetShowMod.ShowConstructor = ShowTypeClass;
      targetShowMod.getShowFunction = function(instance) {
        return instance.show;
      };
      targetShowMod.showIntegerInstance = integerShowInstance;
    })(establishModuleNamespace("Data.Show"));

    // --- Data.Unit (Re-export) ---
    // Re-exports the unit value.
    ((targetUnitMod) => {
      "use strict";
      const unitModuleExports = psRuntimeEnv.Data.Unit;
      // const showModuleExports = psRuntimeEnv.Data.Show; // Not used here, deleted.
      targetUnitMod.unit = unitModuleExports.unitValue;
    })(establishModuleNamespace("Data.Unit"));

    // --- Data.Eq (Type Class Instance) ---
    // Defines the `Eq` type class and instances for `Int`.
    ((targetEqMod) => {
      "use strict";
      const eqModuleExports = psRuntimeEnv.Data.Eq; // Access the previously defined eq functions.
      // Removed unused imports for brevity (Type III deletion of non-essential statements).

      // `EqTypeClass`: Constructor for an Eq instance.
      const EqTypeClass = function(eqZero, eqFunc) {
        this.Eq0 = eqZero; // Reference to parent type class (not used directly in JS).
        this.eq = eqFunc;
      };

      // `integerEqInstance`: An instance of Eq for integers.
      const integerEqInstance = new EqTypeClass(function() {
        return eqModuleExports.integerEqInstance;
      }, eqModuleExports.referenceEquality);

      targetEqMod.EqConstructor = EqTypeClass;
      targetEqMod.getEqualityFunction = function(instance) {
        return instance.eq;
      };
      targetEqMod.eqInteger = integerEqInstance;
    })(establishModuleNamespace("Data.Eq"));

    // --- Data.Ord.Unsafe ---
    // Provides `unsafeCompareImpl` for low-level comparison.
    ((ordUnsafeMod) => {
      "use strict";
      ordUnsafeMod.unsafeCompareImplementation = function(lessThanVal) {
        return function(equalToVal) {
          return function(greaterThanVal) {
            return function(valA) {
              return function(valB) {
                if (valA < valB) return lessThanVal;
                if (valA === valB) return equalToVal;
                return greaterThanVal;
              };
            };
          };
        };
      };
    })(establishModuleNamespace("Data.Ord.Unsafe"));

    // --- Data.Ordering ---
    // Defines the `Ordering` algebraic data type (ADT).
    ((orderingMod) => {
      "use strict";
      // Removed unused imports (Type III deletion).

      // `Ordering.LessThan`
      const LessThan = function() {};
      LessThan.value = new LessThan();

      // `Ordering.GreaterThan`
      const GreaterThan = function() {};
      GreaterThan.value = new GreaterThan();

      // `Ordering.EqualTo`
      const EqualTo = function() {};
      EqualTo.value = new EqualTo();

      orderingMod.LT = LessThan;
      orderingMod.GT = GreaterThan;
      orderingMod.EQ = EqualTo;
    })(establishModuleNamespace("Data.Ordering"));

    // --- Data.Ord.Unsafe (Re-export and use Ordering) ---
    // Re-exports `unsafeCompare` using `Ordering` values.
    ((targetOrdUnsafeMod) => {
      "use strict";
      const ordUnsafeExports = psRuntimeEnv.Data.Ord.Unsafe;
      const orderingExports = psRuntimeEnv.Data.Ordering;

      targetOrdUnsafeMod.unsafeCompare = ordUnsafeExports.unsafeCompareImplementation(
        orderingExports.LT.value
      )(orderingExports.EQ.value)(orderingExports.GT.value);
    })(establishModuleNamespace("Data.Ord.Unsafe"));

    // --- Data.Ord ---
    // Defines the `Ord` type class and instances for `Int`.
    ((targetOrdMod) => {
      "use strict";
      const eqModuleExports = psRuntimeEnv.Data.Eq;
      const ordUnsafeExports = psRuntimeEnv.Data.Ord.Unsafe;
      // Removed unused imports (Type III deletion).

      // `OrdTypeClass`: Constructor for an Ord instance.
      const OrdTypeClass = function(eqInstanceSupplier, compareFunc) {
        this.Eq0 = eqInstanceSupplier; // Reference to parent Eq instance.
        this.compare = compareFunc;
      };

      // `integerOrdInstance`: An instance of Ord for integers.
      const integerOrdInstance = new OrdTypeClass(
        function() {
          return eqModuleExports.eqInteger;
        },
        ordUnsafeExports.unsafeCompare
      );

      targetOrdMod.OrdConstructor = OrdTypeClass;
      targetOrdMod.getCompareFunction = function(instance) {
        return instance.compare;
      };
      targetOrdMod.ordInteger = integerOrdInstance;
    })(establishModuleNamespace("Data.Ord"));

    // --- Data.Function ---
    // Provides `flip` and `const` utility functions.
    ((functionMod) => {
      "use strict";
      // Removed unused imports (Type III deletion).

      functionMod.flipArguments = function(func) {
        return function(arg2) {
          return function(arg1) {
            return func(arg1)(arg2);
          };
        };
      };

      functionMod.constantValue = function(val) {
        return function(ignoredArg) {
          return val;
        };
      };
    })(establishModuleNamespace("Data.Function"));

    // --- Data.Functor ---
    // Provides `arrayMap` for mapping over arrays.
    ((functorMod) => {
      "use strict";
      functorMod.arrayMap = function(mappingFunction) {
        return function(inputArray) {
          const arrayLength = inputArray.length;
          const newArray = new Array(arrayLength);
          for (let i = 0; i < arrayLength; i++) {
            newArray[i] = mappingFunction(inputArray[i]);
          }
          return newArray;
        };
      };
    })(establishModuleNamespace("Data.Functor"));

    // --- Data.Functor (Type Class Instance) ---
    // Defines the `Functor` type class and instances for `Array`.
    ((targetFunctorMod) => {
      "use strict";
      const functorExports = psRuntimeEnv.Data.Functor;
      const functionExports = psRuntimeEnv.Data.Function; // Used for `const` in `void`.
      const unitExports = psRuntimeEnv.Data.Unit;

      // `FunctorTypeClass`: Constructor for a Functor instance.
      const FunctorTypeClass = function(mapFunc) {
        this.map = mapFunc;
      };

      // `getMapFunction`: Extracts the map function from a Functor instance.
      const getMapFunction = function(instance) {
        return instance.map;
      };

      // `arrayFunctorInstance`: An instance of Functor for arrays.
      const arrayFunctorInstance = new FunctorTypeClass(functorExports.arrayMap);

      targetFunctorMod.FunctorConstructor = FunctorTypeClass;
      targetFunctorMod.map = getMapFunction;
      // `void` function: Maps over a functor and replaces all values with `unit`.
      targetFunctorMod.mapToUnit = function(functorInstance) {
        return getMapFunction(functorInstance)(functionExports.constantValue(unitExports.unitValue));
      };
      targetFunctorMod.functorArray = arrayFunctorInstance;
    })(establishModuleNamespace("Data.Functor"));

    // --- Control.Apply (Type Class Instance) ---
    // Defines the `Apply` type class and instances for `Array`.
    ((targetApplyMod) => {
      "use strict";
      const applyExports = psRuntimeEnv.Control.Apply;
      const functorExports = psRuntimeEnv.Data.Functor;

      // `ApplyTypeClass`: Constructor for an Apply instance.
      const ApplyTypeClass = function(functorSupplier, applyFunc) {
        this.Functor0 = functorSupplier;
        this.apply = applyFunc;
      };

      // `arrayApplyInstance`: An instance of Apply for arrays.
      const arrayApplyInstance = new ApplyTypeClass(
        function() {
          return functorExports.functorArray;
        },
        applyExports.arrayApply
      );

      targetApplyMod.ApplyConstructor = ApplyTypeClass;
      targetApplyMod.getApplyFunction = function(instance) {
        return instance.apply;
      };
      targetApplyMod.applyArray = arrayApplyInstance;
    })(establishModuleNamespace("Control.Apply"));

    // --- Control.Applicative ---
    // Defines the `Applicative` type class.
    ((applicativeMod) => {
      "use strict";
      // Removed unused imports (Type III deletion).

      // `ApplicativeTypeClass`: Constructor for an Applicative instance.
      applicativeMod.ApplicativeConstructor = function(applyInstanceSupplier, pureFunc) {
        this.Apply0 = applyInstanceSupplier;
        this.pure = pureFunc;
      };
      applicativeMod.pureValue = function(instance) {
        return instance.pure;
      };
    })(establishModuleNamespace("Control.Applicative"));

    // --- Control.Bind ---
    // Provides `arrayBind` for monadic bind over arrays.
    ((bindMod) => {
      "use strict";
      bindMod.arrayBind = function(monadicArray) {
        return function(bindFunction) {
          const resultArray = [];
          for (let i = 0, len = monadicArray.length; i < len; i++) {
            Array.prototype.push.apply(resultArray, bindFunction(monadicArray[i]));
          }
          return resultArray;
        };
      };
    })(establishModuleNamespace("Control.Bind"));

    // --- Control.Bind (Type Class Instance) ---
    // Defines the `Bind` type class and instances for `Array`.
    ((targetBindMod) => {
      "use strict";
      const applyExports = psRuntimeEnv.Control.Apply;
      const bindExports = psRuntimeEnv.Control.Bind;
      const functionExports = psRuntimeEnv.Data.Function;
      // Removed unused imports (Type III deletion).

      // `BindTypeClass`: Constructor for a Bind instance.
      const BindTypeClass = function(applyInstanceSupplier, bindFunc) {
        this.Apply0 = applyInstanceSupplier;
        this.bind = bindFunc;
      };

      // `DiscardTypeClass`: Constructor for a Discard instance.
      const DiscardTypeClass = function(discardFunc) {
        this.discard = discardFunc;
      };

      // `arrayBindInstance`: An instance of Bind for arrays.
      const arrayBindInstance = new BindTypeClass(
        function() {
          return applyExports.applyArray;
        },
        bindExports.arrayBind
      );

      // `getBindFunction`: Extracts the bind function from a Bind instance.
      const getBindFunction = function(instance) {
        return instance.bind;
      };

      // `unitDiscardInstance`: An instance of Discard for unit values (common in monads).
      const unitDiscardInstance = new DiscardTypeClass(function(bindInstance) {
        return getBindFunction(bindInstance);
      });

      targetBindMod.BindConstructor = BindTypeClass;
      targetBindMod.bind = getBindFunction;
      targetBindMod.bindFlipped = function(bindInstance) {
        return functionExports.flipArguments(getBindFunction(bindInstance));
      };
      targetBindMod.DiscardConstructor = DiscardTypeClass;
      targetBindMod.discard = function(instance) {
        return instance.discard;
      };
      targetBindMod.bindArray = arrayBindInstance;
      targetBindMod.discardUnit = unitDiscardInstance;
    })(establishModuleNamespace("Control.Bind"));

    // --- Control.Monad.ST.Internal ---
    // Provides primitive operations for the ST (State Thread) monad.
    ((stInternalMod) => {
      "use strict";
      // `map_`: Maps a function over the result of an ST action.
      stInternalMod.mapResult = function(func) {
        return function(stAction) {
          return function() {
            return func(stAction());
          };
        };
      };

      // `pure_`: Lifts a value into the ST monad.
      stInternalMod.pureValue = function(val) {
        return function() {
          return val;
        };
      };

      // `bind_`: Chains two ST actions.
      stInternalMod.chainActions = function(firstAction) {
        return function(nextActionFunc) {
          return function() {
            return nextActionFunc(firstAction())();
          };
        };
      };

      // `while_`: Executes an ST action repeatedly as long as a condition holds.
      stInternalMod.whileLoop = function(conditionFunc) {
        return function(loopBodyAction) {
          return function() {
            while (conditionFunc()) {
              loopBodyAction();
            }
          };
        };
      };

      // `newRef`: Creates a new mutable STRef (state reference).
      stInternalMod.createMutableRef = function(initialValue) {
        return function() {
          return {
            value: initialValue
          };
        };
      };

      // `readRef`: Reads the current value from an STRef.
      stInternalMod.readMutableRef = function(ref) {
        return function() {
          return ref.value;
        };
      };

      // `writeRef`: Writes a new value to an STRef.
      stInternalMod.writeMutableRef = function(newValue) {
        return function(ref) {
          return function() {
            ref.value = newValue;
          };
        };
      };
    })(establishModuleNamespace("Control.Monad.ST.Internal"));

    // --- Control.Monad ---
    // Defines the `Monad` type class.
    ((monadMod) => {
      "use strict";
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const bindExports = psRuntimeEnv.Control.Bind;
      // Removed unused imports (Type III deletion).

      // `MonadConstructor`: Constructor for a Monad instance.
      monadMod.MonadConstructor = function(applicativeSupplier, bindSupplier) {
        this.Applicative0 = applicativeSupplier;
        this.Bind1 = bindSupplier;
      };

      // `ap` function: Applies a monadic function to a monadic value.
      monadMod.monadicApply = function(monadInstance) {
        return function(monadicFunc) {
          return function(monadicValue) {
            return bindExports.bind(monadInstance.Bind1())(monadicFunc)(function(func) {
              return bindExports.bind(monadInstance.Bind1())(monadicValue)(function(val) {
                return applicativeExports.pureValue(monadInstance.Applicative0())(func(val));
              });
            });
          };
        };
      };
    })(establishModuleNamespace("Control.Monad"));

    // --- Data.Maybe ---
    // Defines the `Maybe` algebraic data type (ADT).
    ((maybeMod) => {
      "use strict";
      const applyExports = psRuntimeEnv.Control.Apply;
      const bindExports = psRuntimeEnv.Control.Bind;
      const functorExports = psRuntimeEnv.Data.Functor;
      // Removed unused imports (Type III deletion).

      // `Nothing` constructor.
      const NothingConstructor = function() {};
      NothingConstructor.value = new NothingConstructor();

      // `Just` constructor.
      const JustConstructor = function(value) {
        this.payload = value;
      };
      JustConstructor.create = function(value) {
        return new JustConstructor(value);
      };

      // `maybeFunctorInstance`: Functor instance for Maybe.
      const maybeFunctorInstance = new functorExports.FunctorConstructor(function(mappingFunc) {
        return function(maybeVal) {
          if (maybeVal instanceof JustConstructor) {
            return new JustConstructor(mappingFunc(maybeVal.payload));
          }
          return NothingConstructor.value;
        };
      });

      // `maybeApplyInstance`: Apply instance for Maybe.
      const maybeApplyInstance = new applyExports.ApplyConstructor(
        function() {
          return maybeFunctorInstance;
        },
        function(maybeFunc) {
          return function(maybeVal) {
            if (maybeFunc instanceof JustConstructor) {
              return functorExports.map(maybeFunctorInstance)(maybeFunc.payload)(maybeVal);
            }
            if (maybeFunc instanceof NothingConstructor) {
              return NothingConstructor.value;
            }
            // Guard clause for unexpected types (Type III addition).
            throw new Error("Maybe Apply: Unexpected function type.");
          };
        }
      );

      // `maybeBindInstance`: Bind instance for Maybe.
      const maybeBindInstance = new bindExports.BindConstructor(
        function() {
          return maybeApplyInstance;
        },
        function(maybeVal) {
          return function(bindFunc) {
            if (maybeVal instanceof JustConstructor) {
              return bindFunc(maybeVal.payload);
            }
            if (maybeVal instanceof NothingConstructor) {
              return NothingConstructor.value;
            }
            // Guard clause for unexpected types (Type III addition).
            throw new Error("Maybe Bind: Unexpected value type.");
          };
        }
      );

      maybeMod.Nothing = NothingConstructor;
      maybeMod.Just = JustConstructor;
      // `maybe` function: Pattern matching for Maybe.
      maybeMod.foldMaybe = function(onNothing) {
        return function(onJust) {
          return function(maybeVal) {
            if (maybeVal instanceof NothingConstructor) {
              return onNothing;
            }
            if (maybeVal instanceof JustConstructor) {
              return onJust(maybeVal.payload);
            }
            // Guard clause for unexpected types (Type III addition).
            throw new Error("Maybe fold: Unexpected type.");
          };
        };
      };
      maybeMod.functorMaybe = maybeFunctorInstance;
      maybeMod.applyMaybe = maybeApplyInstance;
      maybeMod.bindMaybe = maybeBindInstance;
    })(establishModuleNamespace("Data.Maybe"));

    // --- Data.Either ---
    // Defines the `Either` algebraic data type (ADT).
    ((eitherMod) => {
      "use strict";
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const applyExports = psRuntimeEnv.Control.Apply;
      const bindExports = psRuntimeEnv.Control.Bind;
      const functorExports = psRuntimeEnv.Data.Functor;
      const maybeExports = psRuntimeEnv.Data.Maybe;
      // Removed unused imports (Type III deletion).

      // `Left` constructor.
      const LeftConstructor = function(value) {
        this.payload = value;
      };
      LeftConstructor.create = function(value) {
        return new LeftConstructor(value);
      };

      // `Right` constructor.
      const RightConstructor = function(value) {
        this.payload = value;
      };
      RightConstructor.create = function(value) {
        return new RightConstructor(value);
      };

      // `eitherFunctorInstance`: Functor instance for Either.
      const eitherFunctorInstance = new functorExports.FunctorConstructor(function(mappingFunc) {
        return function(eitherVal) {
          if (eitherVal instanceof LeftConstructor) {
            return new LeftConstructor(eitherVal.payload);
          }
          if (eitherVal instanceof RightConstructor) {
            return new RightConstructor(mappingFunc(eitherVal.payload));
          }
          // Guard clause (Type III addition).
          throw new Error("Either Functor: Unexpected type.");
        };
      });

      // `either` function: Pattern matching for Either.
      const foldEither = function(onLeft) {
        return function(onRight) {
          return function(eitherVal) {
            if (eitherVal instanceof LeftConstructor) {
              return onLeft(eitherVal.payload);
            }
            if (eitherVal instanceof RightConstructor) {
              return onRight(eitherVal.payload);
            }
            // Guard clause (Type III addition).
            throw new Error("Either fold: Unexpected type.");
          };
        };
      };

      // `eitherApplyInstance`: Apply instance for Either.
      const eitherApplyInstance = new applyExports.ApplyConstructor(
        function() {
          return eitherFunctorInstance;
        },
        function(eitherFunc) {
          return function(eitherVal) {
            if (eitherFunc instanceof LeftConstructor) {
              return new LeftConstructor(eitherFunc.payload);
            }
            if (eitherFunc instanceof RightConstructor) {
              return functorExports.map(eitherFunctorInstance)(eitherFunc.payload)(eitherVal);
            }
            // Guard clause (Type III addition).
            throw new Error("Either Apply: Unexpected function type.");
          };
        }
      );

      // `eitherBindInstance`: Bind instance for Either.
      const eitherBindInstance = new bindExports.BindConstructor(
        function() {
          return eitherApplyInstance;
        },
        foldEither(function(leftVal) {
          return function(bindFunc) {
            return new LeftConstructor(leftVal);
          };
        })(function(rightVal) {
          return function(bindFunc) {
            return bindFunc(rightVal);
          };
        })
      );

      // `eitherApplicativeInstance`: Applicative instance for Either.
      const eitherApplicativeInstance = new applicativeExports.ApplicativeConstructor(
        function() {
          return eitherApplyInstance;
        },
        RightConstructor.create
      );

      eitherMod.Left = LeftConstructor;
      eitherMod.Right = RightConstructor;
      eitherMod.either = foldEither;
      // `note` function: Converts a `Maybe` to an `Either` with a default error message.
      eitherMod.noteMaybe = function(errorMessage) {
        return maybeExports.foldMaybe(new LeftConstructor(errorMessage))(RightConstructor.create);
      };
      eitherMod.functorEither = eitherFunctorInstance;
      eitherMod.applyEither = eitherApplyInstance;
      eitherMod.applicativeEither = eitherApplicativeInstance;
      eitherMod.bindEither = eitherBindInstance;
    })(establishModuleNamespace("Data.Either"));

    // --- Partial.Unsafe ---
    // Provides `unsafePartial` for escaping partiality checks.
    ((partialUnsafeMod) => {
      "use strict";
      partialUnsafeMod.unsafePartialCall = function(func) {
        return func();
      };
    })(establishModuleNamespace("Partial.Unsafe"));

    // --- Partial ---
    // Provides `crashWith` for throwing errors.
    ((partialMod) => {
      "use strict";
      partialMod.crashWithMessage = function() {
        return function(message) {
          throw new Error(message);
        };
      };
    })(establishModuleNamespace("Partial"));

    // --- Partial (Re-export) ---
    // Re-exports `crashWith`.
    ((targetPartialMod) => {
      "use strict";
      const partialExports = psRuntimeEnv.Partial;
      targetPartialMod.crashWith = partialExports.crashWithMessage;
    })(establishModuleNamespace("Partial"));

    // --- Partial.Unsafe (Re-export and use) ---
    // Provides `unsafeCrashWith` using `unsafePartial` and `crashWith`.
    ((targetPartialUnsafeMod) => {
      "use strict";
      const partialUnsafeExports = psRuntimeEnv.Partial.Unsafe;
      const partialExports = psRuntimeEnv.Partial;
      targetPartialUnsafeMod.unsafeCrashWith = function(message) {
        return partialUnsafeExports.unsafePartialCall(function(unit) {
          return partialExports.crashWith(unit)(message);
        });
      };
    })(establishModuleNamespace("Partial.Unsafe"));

    // --- Control.Monad.Rec.Class ---
    // Defines `Loop` and `Done` for tail recursion and the `MonadRec` type class.
    ((monadRecMod) => {
      "use strict";
      // Removed unused imports (Type III deletion).

      // `Loop` constructor for ongoing recursion.
      const LoopConstructor = function(value) {
        this.payload = value;
      };
      LoopConstructor.create = function(value) {
        return new LoopConstructor(value);
      };

      // `Done` constructor for recursion completion.
      const DoneConstructor = function(value) {
        this.payload = value;
      };
      DoneConstructor.create = function(value) {
        return new DoneConstructor(value);
      };

      // `getTailRecMFunction`: Extracts the `tailRecM` function.
      const getTailRecMFunction = function(instance) {
        return instance.tailRecM;
      };

      monadRecMod.Loop = LoopConstructor;
      monadRecMod.Done = DoneConstructor;
      // `MonadRecConstructor`: Constructor for a MonadRec instance.
      monadRecMod.MonadRecConstructor = function(monadSupplier, tailRecMFunc) {
        this.Monad0 = monadSupplier;
        this.tailRecM = tailRecMFunc;
      };
      monadRecMod.tailRecM = getTailRecMFunction;
      // `tailRecM2`: A specialized version for two arguments.
      monadRecMod.tailRecMTwoArgs = function(monadRecInstance) {
        return function(stepFunc) {
          return function(initialArg1) {
            return function(initialArg2) {
              return getTailRecMFunction(monadRecInstance)(function(pair) {
                return stepFunc(pair.a)(pair.b);
              })({
                a: initialArg1,
                b: initialArg2
              });
            };
          };
        };
      };
    })(establishModuleNamespace("Control.Monad.Rec.Class"));

    // --- Control.Monad.ST.Internal (Type Class Instances) ---
    // Defines Functor, Apply, Applicative, Bind, Monad, and MonadRec instances for ST.
    ((targetSTInternalMod) => {
      "use strict";
      const stPrimitives = psRuntimeEnv.Control.Monad.ST.Internal;
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const applyExports = psRuntimeEnv.Control.Apply;
      const bindExports = psRuntimeEnv.Control.Bind;
      const functorExports = psRuntimeEnv.Data.Functor;
      const monadExports = psRuntimeEnv.Control.Monad;
      const monadRecExports = psRuntimeEnv.Control.Monad.Rec.Class;
      const unitExports = psRuntimeEnv.Data.Unit;
      // Removed unused imports (Type III deletion).

      // Functor instance for ST.
      const stFunctorInstance = new functorExports.FunctorConstructor(stPrimitives.mapResult);

      // Bind instance for ST.
      const stBindInstance = new bindExports.BindConstructor(
        function() {
          return stApplyInstance;
        },
        stPrimitives.chainActions
      );

      // Apply instance for ST.
      const stApplyInstance = new applyExports.ApplyConstructor(
        function() {
          return stFunctorInstance;
        },
        monadExports.monadicApply(stMonadInstance)
      );

      // Applicative instance for ST.
      const stApplicativeInstance = new applicativeExports.ApplicativeConstructor(
        function() {
          return stApplyInstance;
        },
        stPrimitives.pureValue
      );

      // Monad instance for ST.
      const stMonadInstance = new monadExports.MonadConstructor(
        function() {
          return stApplicativeInstance;
        },
        function() {
          return stBindInstance;
        }
      );

      // MonadRec instance for ST.
      const stMonadRecInstance = new monadRecExports.MonadRecConstructor(
        function() {
          return stMonadInstance;
        },
        function(stepFunction) {
          return function(initialValue) {
            // This implements tailRecM using internal STRef and a while loop.
            const isLoop = function(val) {
              return val instanceof monadRecExports.Loop;
            };
            const extractDoneValue = function(val) {
              if (val instanceof monadRecExports.Done) {
                return val.payload;
              }
              // This case should not happen if the `isLoop` check is done correctly.
              throw new Error("Expected Done constructor, got: " + val.constructor.name); // Type III addition: more specific error.
            };

            return bindExports.bind(stBindInstance)(
              bindExports.bindFlipped(stBindInstance)(stPrimitives.createMutableRef)(stepFunction(initialValue))
            )(function(stRef) {
              return bindExports.discard(bindExports.discardUnit)(stBindInstance)(
                stPrimitives.whileLoop(
                  functorExports.map(stFunctorInstance)(isLoop)(stPrimitives.readMutableRef(stRef))
                )(
                  bindExports.bind(stBindInstance)(stPrimitives.readMutableRef(stRef))(function(loopResult) {
                    if (loopResult instanceof monadRecExports.Loop) {
                      return bindExports.bind(stBindInstance)(stepFunction(loopResult.payload))(function(nextLoopValue) {
                        return functorExports.mapToUnit(stFunctorInstance)(stPrimitives.writeMutableRef(nextLoopValue)(stRef));
                      });
                    }
                    if (loopResult instanceof monadRecExports.Done) {
                      return applicativeExports.pureValue(stApplicativeInstance)(unitExports.unitValue);
                    }
                    // Type III addition: guard for unexpected type.
                    throw new Error("MonadRecST: Unexpected loop result type: " + loopResult.constructor.name);
                  })
                )
              )(function() {
                return functorExports.map(stFunctorInstance)(extractDoneValue)(stPrimitives.readMutableRef(stRef));
              });
            });
          };
        }
      );

      targetSTInternalMod.functorST = stFunctorInstance;
      targetSTInternalMod.applyST = stApplyInstance;
      targetSTInternalMod.applicativeST = stApplicativeInstance;
      targetSTInternalMod.bindST = stBindInstance;
      targetSTInternalMod.monadST = stMonadInstance;
      targetSTInternalMod.monadRecST = stMonadRecInstance;
    })(establishModuleNamespace("Control.Monad.ST.Internal"));

    // --- Data.Array ---
    // Provides various array utility functions.
    ((arrayMod) => {
      "use strict";
      // `range`: Generates an array of integers from start to end (inclusive).
      arrayMod.range = function(start) {
        return function(end) {
          const step = start > end ? -1 : 1;
          const length = Math.abs(end - start) + 1;
          const result = new Array(length);
          let current = start;
          for (let i = 0; i < length; i++) {
            result[i] = current;
            current += step;
          }
          return result;
        };
      };

      // `replicate`: Creates an array of `n` copies of a value.
      arrayMod.replicate = typeof Array.prototype.fill === 'function' ?
        function(count) {
          return function(value) {
            return count < 1 ? [] : Array.from({
              length: count
            }).fill(value); // Type III update: `Array.from` instead of `new Array().fill`.
          };
        } :
        function(count) {
          return function(value) {
            const result = [];
            for (let i = 0; i < count; i++) {
              result.push(value);
            }
            return result;
          };
        };

      // `length`: Returns the length of an array.
      arrayMod.getLength = function(arr) {
        return arr.length;
      };

      // `indexImpl`: Safely retrieves an element by index, returning a `Maybe`.
      arrayMod.indexImplementation = function(onFound) {
        return function(onNotFound) {
          return function(arr) {
            return function(idx) {
              return (idx < 0 || idx >= arr.length) ? onNotFound : onFound(arr[idx]);
            };
          };
        };
      };

      // `slice`: Extracts a section of an array.
      arrayMod.arraySlice = function(start) {
        return function(end) {
          return function(arr) {
            return arr.slice(start, end);
          };
        };
      };

      // `drop`: Removes `n` elements from the beginning of an array.
      arrayMod.dropElements = function(count) {
        return function(arr) {
          return count < 1 ? arr : arr.slice(count);
        };
      };

      // `zipWith`: Combines two arrays element-wise using a function.
      arrayMod.zipWith = function(combinerFunc) {
        return function(arr1) {
          return function(arr2) {
            const minLength = Math.min(arr1.length, arr2.length);
            const result = new Array(minLength);
            for (let i = 0; i < minLength; i++) {
              result[i] = combinerFunc(arr1[i])(arr2[i]);
            }
            return result;
          };
        };
      };

      // `unsafeIndexImpl`: Unsafely retrieves an element by index (direct access).
      arrayMod.unsafeIndexImplementation = function(arr) {
        return function(idx) {
          return arr[idx];
        };
      };
    })(establishModuleNamespace("Data.Array"));

    // --- Data.Array.ST ---
    // Provides mutable array operations within the ST monad.
    ((arraySTMod) => {
      "use strict";
      // `poke`: Updates an element at a given index in an array (ST action).
      arraySTMod.pokeElement = function(index) {
        return function(newValue) {
          return function(mutableArray) {
            return function() {
              const isValidIndex = index >= 0 && index < mutableArray.length;
              if (isValidIndex) {
                mutableArray[index] = newValue;
              }
              return isValidIndex;
            };
          };
        };
      };

      // `sortByImpl`: Sorts an array in place using a comparison function (ST action).
      arraySTMod.sortByImplementation = function(comparator) {
        return function(mutableArray) {
          return function() {
            mutableArray.sort(function(a, b) {
              return comparator(a)(b);
            });
          };
        };
      };
    })(establishModuleNamespace("Data.Array.ST"));

    // --- Unsafe.Coerce ---
    // Provides `unsafeCoerce` for type-level cast (identity function in JS).
    ((unsafeCoerceMod) => {
      "use strict";
      unsafeCoerceMod.unsafeCoerceFunction = function(val) {
        return val;
      };
    })(establishModuleNamespace("Unsafe.Coerce"));

    // --- Unsafe.Coerce (Re-export) ---
    // Re-exports `unsafeCoerce`.
    ((targetUnsafeCoerceMod) => {
      "use strict";
      const unsafeCoerceExports = psRuntimeEnv.Unsafe.Coerce;
      targetUnsafeCoerceMod.unsafeCoerce = unsafeCoerceExports.unsafeCoerceFunction;
    })(establishModuleNamespace("Unsafe.Coerce"));

    // --- Data.Array.ST (High-level functions) ---
    // Provides higher-level array ST operations like `sortBy`, `unsafeFreeze`, `unsafeThaw`.
    ((targetArraySTMod) => {
      "use strict";
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const stInternalExports = psRuntimeEnv.Control.Monad.ST.Internal;
      const arraySTPrimitives = psRuntimeEnv.Data.Array.ST;
      const ordExports = psRuntimeEnv.Data.Ord;
      const orderingExports = psRuntimeEnv.Data.Ordering;
      // Removed unused imports (Type III deletion).

      // `sortBy`: Sorts an array based on an Ord instance's comparison function.
      targetArraySTMod.sortBy = function(ordInstanceCompare) {
        return arraySTPrimitives.sortByImplementation(function(valA) {
          return function(valB) {
            const comparisonResult = ordInstanceCompare(valA)(valB);
            if (comparisonResult instanceof orderingExports.GT) {
              return 1;
            }
            if (comparisonResult instanceof orderingExports.EQ) {
              return 0;
            }
            if (comparisonResult instanceof orderingExports.LT) {
              return -1;
            }
            // Type III addition: guard for unexpected result.
            throw new Error("SortBy: Unexpected comparison result type: " + comparisonResult.constructor.name);
          };
        });
      };

      // `unsafeFreeze`: Converts a mutable ST array to an immutable array (no-op in JS).
      targetArraySTMod.unsafeFreeze = function(arr) {
        return applicativeExports.pureValue(stInternalExports.applicativeST)(arr);
      };

      // `unsafeThaw`: Converts an immutable array to a mutable ST array (no-op in JS).
      targetArraySTMod.unsafeThaw = function(arr) {
        return applicativeExports.pureValue(stInternalExports.applicativeST)(arr);
      };

      // `poke`: Re-export `pokeElement`.
      targetArraySTMod.poke = arraySTPrimitives.pokeElement;
    })(establishModuleNamespace("Data.Array.ST"));

    // --- Data.Array (High-level functions) ---
    // Provides higher-level array operations including `head`, `index`, `concatMap`, etc.
    ((targetArrayMod) => {
      "use strict";
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const bindExports = psRuntimeEnv.Control.Bind;
      const booleanExports = psRuntimeEnv.Data.Boolean;
      const functionExports = psRuntimeEnv.Data.Function;
      const functorExports = psRuntimeEnv.Data.Functor;
      const maybeExports = psRuntimeEnv.Data.Maybe;
      const monadRecExports = psRuntimeEnv.Control.Monad.Rec.Class;
      const arrayPrimitives = psRuntimeEnv.Data.Array;
      // Removed unused imports (Type III deletion).

      // Helper to wrap a single value in an array.
      const wrapInArray = function(val) {
        return [val];
      };

      // `head`: Returns the first element of an array wrapped in `Maybe`.
      const getHead = function(arr) {
        return arrayPrimitives.indexImplementation(maybeExports.Just.create)(maybeExports.Nothing.value)(arr)(0);
      };

      // `arrayIndex`: Safely retrieves an element by index, returning a `Maybe`.
      const arrayIndex = arrayPrimitives.indexImplementation(maybeExports.Just.create)(maybeExports.Nothing.value);

      // `concatMap`: Monadic bind for arrays (flattening map).
      const concatMap = functionExports.flipArguments(bindExports.bind(bindExports.bindArray));

      targetArrayMod.singleton = wrapInArray;
      targetArrayMod.head = getHead;
      targetArrayMod.index = arrayIndex;
      targetArrayMod.concatMap = concatMap;

      // `mapMaybe`: Maps a function over an array, keeping only `Just` results.
      targetArrayMod.mapMaybe = function(func) {
        return concatMap(function(val) {
          return maybeExports.foldMaybe([])(wrapInArray)(func(val));
        });
      };

      // `mapWithIndex`: Maps a function over an array, providing index and value.
      targetArrayMod.mapWithIndex = function(indexedMappingFunc) {
        return function(inputArray) {
          const indices = arrayPrimitives.range(0)(arrayPrimitives.getLength(inputArray) - 1);
          return arrayPrimitives.zipWith(indexedMappingFunc)(indices)(inputArray);
        };
      };

      // `foldRecM`: Monadic recursive fold over an array.
      targetArrayMod.foldRecursiveMonadic = function(monadRecInstance) {
        return function(stepFunction) {
          return function(initialAccumulator) {
            return function(inputArray) {
              return monadRecExports.tailRecMTwoArgs(monadRecInstance)(function(accumulator) {
                return function(currentIndex) {
                  // If we've processed all elements, return Done.
                  if (currentIndex >= arrayPrimitives.getLength(inputArray)) {
                    return applicativeExports.pureValue(monadRecInstance.Monad0().Applicative0())(
                      new monadRecExports.Done(accumulator)
                    );
                  }
                  // Otherwise, apply the step function and continue.
                  if (booleanExports.otherwise) { // Always true, Type III deletion: simplified a conditional.
                    return bindExports.bind(monadRecInstance.Monad0().Bind1())(
                      stepFunction(accumulator)(arrayPrimitives.unsafeIndexImplementation(inputArray)(currentIndex))
                    )(function(nextAccumulator) {
                      return applicativeExports.pureValue(monadRecInstance.Monad0().Applicative0())(
                        new monadRecExports.Loop({
                          a: nextAccumulator,
                          b: currentIndex + 1
                        })
                      );
                    });
                  }
                  // Type III addition: guard for unreachable code.
                  throw new Error("Array foldRecM: Unreachable code path.");
                };
              })(initialAccumulator)(0);
            };
          };
        };
      };

      targetArrayMod.unsafeIndex = arrayPrimitives.unsafeIndexImplementation;
      targetArrayMod.replicate = arrayPrimitives.replicate;
      targetArrayMod.drop = arrayPrimitives.dropElements;
    })(establishModuleNamespace("Data.Array"));

    // --- Data.Int ---
    // Provides integer parsing functions.
    ((intMod) => {
      "use strict";
      // `fromStringAsImpl`: Parses a string to an integer with a given radix, returning a `Maybe`.
      intMod.fromStringAsImplementation = function(onSuccess) {
        return function(onFailure) {
          return function(radix) {
            // Type III update: Simplified regex generation.
            const charSet = (radix < 11) ? `[0-${radix - 1}]` :
              (radix === 11) ? `[0-9a]` :
              `[0-9a-${String.fromCharCode(86 + radix)}]`; // 86 is 'Z' ASCII.
            const regex = new RegExp(`^[\\+\\-]?${charSet}+$`, 'i');

            return function(inputString) {
              if (regex.test(inputString)) {
                const parsedValue = Number.parseInt(inputString, radix);
                // Check if it's a valid integer (0 | parsedValue) === parsedValue.
                // Type III update: simplified check. `Number.isInteger` is more robust.
                if (Number.isInteger(parsedValue)) {
                  return onSuccess(parsedValue);
                }
              }
              return onFailure;
            };
          };
        };
      };
    })(establishModuleNamespace("Data.Int"));

    // --- Data.Int (High-level functions) ---
    // Provides high-level integer parsing functions.
    ((targetIntMod) => {
      "use strict";
      const maybeExports = psRuntimeEnv.Data.Maybe;
      const intPrimitives = psRuntimeEnv.Data.Int;
      // Removed unused imports (Type III deletion).

      // `fromStringAs`: Parses a string to an integer with a given radix, returning a `Maybe`.
      const parseIntegerWithRadix = intPrimitives.fromStringAsImplementation(
        maybeExports.Just.create
      )(maybeExports.Nothing.value);

      // `fromString`: Parses a string to an integer (base 10), returning a `Maybe`.
      const parseIntegerBase10 = parseIntegerWithRadix(10);

      targetIntMod.fromString = parseIntegerBase10;
      targetIntMod.fromStringAs = parseIntegerWithRadix;
    })(establishModuleNamespace("Data.Int"));

    // --- Data.String.CodeUnits ---
    // Provides string length.
    ((codeUnitsMod) => {
      "use strict";
      codeUnitsMod.getStringLength = function(str) {
        return str.length;
      };
    })(establishModuleNamespace("Data.String.CodeUnits"));

    // --- Data.String.CodeUnits (Re-export) ---
    // Re-exports `length`.
    ((targetCodeUnitsMod) => {
      "use strict";
      const codeUnitsExports = psRuntimeEnv.Data.String.CodeUnits;
      // Removed unused imports (Type III deletion).
      targetCodeUnitsMod.length = codeUnitsExports.getStringLength;
    })(establishModuleNamespace("Data.String.CodeUnits"));

    // --- Data.String.Common ---
    // Provides common string utility functions.
    ((commonStringMod) => {
      "use strict";
      commonStringMod.splitString = function(separator) {
        return function(targetString) {
          return targetString.split(separator);
        };
      };

      commonStringMod.trimWhitespace = function(targetString) {
        return targetString.trim();
      };

      commonStringMod.joinStringsWith = function(separator) {
        return function(stringArray) {
          return stringArray.join(separator);
        };
      };
    })(establishModuleNamespace("Data.String.Common"));

    // --- Data.String.Common (Re-export) ---
    // Re-exports common string utilities.
    ((targetCommonStringMod) => {
      "use strict";
      const commonStringExports = psRuntimeEnv.Data.String.Common;
      // Removed unused imports (Type III deletion).
      targetCommonStringMod.split = commonStringExports.splitString;
      targetCommonStringMod.trim = commonStringExports.trimWhitespace;
      targetCommonStringMod.joinWith = commonStringExports.joinStringsWith;
    })(establishModuleNamespace("Data.String.Common"));

    // --- AtCoder.ABC113.C ---
    // Contains the core logic for the AtCoder problem.
    ((atcoderProblemMod) => {
      "use strict";
      const applicativeExports = psRuntimeEnv.Control.Applicative;
      const bindExports = psRuntimeEnv.Control.Bind;
      const stInternalExports = psRuntimeEnv.Control.Monad.ST.Internal;
      const arrayExports = psRuntimeEnv.Data.Array;
      const arraySTExports = psRuntimeEnv.Data.Array.ST;
      const eitherExports = psRuntimeEnv.Data.Either;
      const functorExports = psRuntimeEnv.Data.Functor;
      const intExports = psRuntimeEnv.Data.Int;
      const maybeExports = psRuntimeEnv.Data.Maybe;
      const ordExports = psRuntimeEnv.Data.Ord;
      const orderingExports = psRuntimeEnv.Data.Ordering;
      const showExports = psRuntimeEnv.Data.Show;
      const codeUnitsExports = psRuntimeEnv.Data.String.CodeUnits;
      const commonStringExports = psRuntimeEnv.Data.String.Common;
      const partialUnsafeExports = psRuntimeEnv.Partial.Unsafe;
      // Removed unused imports (Type III deletion).

      // `parseInputData`: Parses the raw input string into structured data.
      const parseInputData = function(rawInputText) {
        const inputLines = commonStringExports.split("\n")(commonStringExports.trim(rawInputText));

        // Parse the first line for N and M.
        const parseNM = bindExports.bind(maybeExports.bindMaybe)(arrayExports.head(inputLines))(function(firstLine) {
          const nmValues = arrayExports.mapMaybe(intExports.fromString)(commonStringExports.split(" ")(firstLine));
          return nmValues.length === 2 ?
            maybeExports.Just.create({
              N: nmValues[0],
              M: nmValues[1]
            }) :
            maybeExports.Nothing.value;
        });

        return bindExports.bind(eitherExports.bindEither)(eitherExports.noteMaybe("Invalid N M line")(parseNM))(function(nmData) {
          // Parse the remaining lines for P and Y.
          const cityDataLines = arrayExports.drop(1)(inputLines);
          const cityDetails = functorExports.map(functorExports.functorArray)(function(cityLine) {
            const pyValues = arrayExports.mapMaybe(intExports.fromString)(commonStringExports.split(" ")(cityLine));
            // Type III: Added a more specific crash message.
            if (pyValues.length === 2) {
              return {
                prefecture: pyValues[0],
                year: pyValues[1]
              };
            }
            partialUnsafeExports.unsafeCrashWith("Failed to parse city (P Y) line: " + cityLine);
            return null; // Unreachable, but for type safety.
          })(cityDataLines);

          // Type III update: Renamed `n` to `nmData.N` and `a` to `cityDetails` for clarity.
          return applicativeExports.pureValue(eitherExports.applicativeEither)(
            commonStringExports.joinWith("\n")(
              // The original had `(n.n, function(n){...})(n.m)(a)` which is a convoluted way
              // of passing nmData.N, nmData.M, and cityDetails to the processing function.
              // We extract the actual processing logic into `processCityData`.
              processCityData(nmData.N)(nmData.M)(cityDetails)
            )
          );
        });
      };

      // `padSixDigits`: Pads a number with leading zeros to 6 digits.
      const padSixDigits = function(numberValue) {
        const numStr = showExports.getShowFunction(showExports.showIntegerInstance)(numberValue);
        // Type III update: use String.prototype.padStart for conciseness.
        return numStr.padStart(6, '0');
      };

      // `processCityData`: The main logic for assigning IDs.
      const processCityData = function(numProvinces) {
        return function(numCities) {
          return function(rawCityList) {
            // Add original index to each city entry.
            const indexedCities = arrayExports.mapWithIndex(function(index) {
              return function(city) {
                return {
                  prefecture: city.prefecture,
                  year: city.year,
                  originalIndex: index
                };
              };
            })(rawCityList);

            // Mutate and sort the cities. (ST Monad operations).
            // `unsafeThaw` and `unsafeFreeze` are no-ops in JS, so we just use the array directly.
            // Type III update: Simplify ST monad operations as they are just JS array ops.
            const mutableCities = [...indexedCities]; // Create a mutable copy.

            arraySTExports.sortBy(function(cityA) {
              return function(cityB) {
                // Compare by prefecture first.
                const prefectureComparison = ordExports.getCompareFunction(ordExports.ordInteger)(cityA.prefecture)(cityB.prefecture);
                if (prefectureComparison instanceof orderingExports.LT) return orderingExports.LT.value;
                if (prefectureComparison instanceof orderingExports.GT) return orderingExports.GT.value;
                // If prefectures are equal, compare by year.
                return ordExports.getCompareFunction(ordExports.ordInteger)(cityA.year)(cityB.year);
              };
            })(mutableCities)(); // Execute the sort.

            const sortedCities = mutableCities; // Effectively "unsafeFreeze".

            // Prepare an array to store the results, indexed by original city index.
            const cityIDs = arrayExports.replicate(numCities)("");

            // Iterate through the sorted cities to assign IDs.
            // This replaces the `foldRecM` logic.
            let lastPrefectureID = -1;
            let currentPrefectureCount = 0;

            for (let i = 0; i < sortedCities.length; i++) {
              const currentCity = sortedCities[i];

              if (currentCity.prefecture !== lastPrefectureID) {
                lastPrefectureID = currentCity.prefecture;
                currentPrefectureCount = 1;
              } else {
                currentPrefectureCount++;
              }

              // Assign the formatted ID to the result array at its original index.
              const formattedID = padSixDigits(currentCity.prefecture) + padSixDigits(currentPrefectureCount);
              // `arraySTExports.poke` is effectively `cityIDs[currentCity.originalIndex] = formattedID`.
              // We just directly assign here, as it's not a real STRef.
              cityIDs[currentCity.originalIndex] = formattedID;
            }

            return cityIDs;
          };
        };
      };

      // `solve`: The entry point for the problem solution.
      atcoderProblemMod.solve = function(problemInput) {
        const processedResult = parseInputData(problemInput);
        if (processedResult instanceof eitherExports.Left) {
          partialUnsafeExports.unsafeCrashWith(processedResult.payload);
        }
        if (processedResult instanceof eitherExports.Right) {
          return processedResult.payload;
        }
        // Type III addition: Guard for unexpected types.
        throw new Error("Solve: Unexpected result type from parseInputData.");
      };
    })(establishModuleNamespace("AtCoder.ABC113.C"));

    // --- Effect.Console ---
    // Provides `log` for console output.
    ((consoleMod) => {
      "use strict";
      consoleMod.logMessage = function(message) {
        return function() {
          console.log(message);
          return {}; // PureScript's Unit.
        };
      };
    })(establishModuleNamespace("Effect.Console"));

    // --- Effect.Console (Re-export) ---
    // Re-exports `log`.
    ((targetConsoleMod) => {
      "use strict";
      const consoleExports = psRuntimeEnv.Effect.Console;
      // Removed unused imports (Type III deletion).
      targetConsoleMod.log = consoleExports.logMessage;
    })(establishModuleNamespace("Effect.Console"));

    // --- Node.Encoding ---
    // Defines Node.js buffer encodings as ADTs.
    ((encodingMod) => {
      "use strict";
      const showExports = psRuntimeEnv.Data.Show;
      // Removed unused imports (Type III deletion).

      const AsciiEncoding = function() {};
      AsciiEncoding.value = new AsciiEncoding();

      const UTF8Encoding = function() {};
      UTF8Encoding.value = new UTF8Encoding();

      const UTF16LEEncoding = function() {};
      UTF16LEEncoding.value = new UTF16LEEncoding();

      const UCS2Encoding = function() {};
      UCS2Encoding.value = new UCS2Encoding();

      const Base64Encoding = function() {};
      Base64Encoding.value = new Base64Encoding();

      const Latin1Encoding = function() {};
      Latin1Encoding.value = new Latin1Encoding();

      const BinaryEncoding = function() {};
      BinaryEncoding.value = new BinaryEncoding();

      const HexEncoding = function() {};
      HexEncoding.value = new HexEncoding();

      const encodingShowInstance = new showExports.ShowConstructor(function(encodingInstance) {
        if (encodingInstance instanceof AsciiEncoding) return "ASCII";
        if (encodingInstance instanceof UTF8Encoding) return "UTF8";
        if (encodingInstance instanceof UTF16LEEncoding) return "UTF16LE";
        if (encodingInstance instanceof UCS2Encoding) return "UCS2";
        if (encodingInstance instanceof Base64Encoding) return "Base64";
        if (encodingInstance instanceof Latin1Encoding) return "Latin1";
        if (encodingInstance instanceof BinaryEncoding) return "Binary";
        if (encodingInstance instanceof HexEncoding) return "Hex";
        // Type III addition: guard for unknown encoding.
        throw new Error("Node.Encoding Show: Unknown encoding type: " + encodingInstance.constructor.name);
      });

      encodingMod.ASCII = AsciiEncoding;
      encodingMod.UTF8 = UTF8Encoding;
      encodingMod.UTF16LE = UTF16LEEncoding;
      encodingMod.UCS2 = UCS2Encoding;
      encodingMod.Base64 = Base64Encoding;
      encodingMod.Latin1 = Latin1Encoding;
      encodingMod.Binary = BinaryEncoding;
      encodingMod.Hex = HexEncoding;
      encodingMod.showEncodingInstance = encodingShowInstance;
    })(establishModuleNamespace("Node.Encoding"));

    // --- Node.FS.Internal ---
    // Provides internal access to Node.js 'fs' module.
    ((fsInternalMod) => {
      "use strict";
      fsInternalMod.unsafeRequireFSModule = require("fs");
    })(establishModuleNamespace("Node.FS.Internal"));

    // --- Node.FS.Internal (Re-export) ---
    // Re-exports internal FS utilities.
    ((targetFSInternalMod) => {
      "use strict";
      const fsInternalExports = psRuntimeEnv.Node.FS.Internal;
      const unsafeCoerceExports = psRuntimeEnv.Unsafe.Coerce;
      // Removed unused imports (Type III deletion).

      // `mkEffect`: Helper to wrap a JS function into a PureScript Effect.
      targetFSInternalMod.makeEffect = unsafeCoerceExports.unsafeCoerce;
      targetFSInternalMod.unsafeRequireFS = fsInternalExports.unsafeRequireFSModule;
    })(establishModuleNamespace("Node.FS.Internal"));

    // --- Node.FS.Sync ---
    // Provides synchronous file system operations.
    ((fsSyncMod) => {
      "use strict";
      const showExports = psRuntimeEnv.Data.Show;
      const encodingExports = psRuntimeEnv.Node.Encoding;
      const fsInternalExports = psRuntimeEnv.Node.FS.Internal;
      // Removed unused imports (Type III deletion).

      const nodeFs = fsInternalExports.unsafeRequireFS;

      // `readTextFile`: Reads a file synchronously as text with a specified encoding.
      fsSyncMod.readTextFile = function(encoding) {
        return function(filePath) {
          return fsInternalExports.makeEffect(function(unit) { // Type III update: explicit `unit` parameter.
            const encodingString = showExports.getShowFunction(encodingExports.showEncodingInstance)(encoding);
            // Type III update: Added a simple check for common encodings.
            const options = {
              encoding: encodingString
            };
            if (!['utf8', 'ascii', 'latin1'].includes(encodingString.toLowerCase())) {
              console.warn(`Node.FS.Sync: Using non-standard encoding '${encodingString}'.`); // Type III addition: warning.
            }
            return nodeFs.readFileSync(filePath, options);
          });
        };
      };
    })(establishModuleNamespace("Node.FS.Sync"));

    // --- Main ---
    // The main entry point of the application.
    ((mainMod) => {
      "use strict";
      const atcoderProblemExports = psRuntimeEnv.AtCoder.ABC113.C;
      const consoleExports = psRuntimeEnv.Effect.Console;
      const encodingExports = psRuntimeEnv.Node.Encoding;
      const fsSyncExports = psRuntimeEnv.Node.FS.Sync;
      // Removed unused imports (Type III deletion).

      mainMod.main = function() {
        // Read input from /dev/stdin using UTF8 encoding.
        const rawInput = fsSyncExports.readTextFile(encodingExports.UTF8.value)("/dev/stdin")();
        // Solve the problem.
        const solutionResult = atcoderProblemExports.solve(rawInput);
        // Log the result to console.
        return consoleExports.log(solutionResult)();
      };
    })(establishModuleNamespace("Main"));

    // Execute the main function of the application.
    psRuntimeEnv.Main.main();

  }, {}], // End of Focm module definition.
}, {}, ["Focm"], null); // Call the moduleLoader.