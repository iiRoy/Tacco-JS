var moduleLoader = function(moduleDefinitions, moduleCache, entryPoints, exportName) {
  // Check if parcelRequire exists globally or as a local reference
  var globalModuleLoader = typeof parcelRequire === "function" ? parcelRequire : null;
  var commonjsRequire = typeof require === "function" ? require : null;

  // Helper function to resolve and load a module
  function loadModule(modulePath, isSilent) {
    // If module is already in cache, return its exports
    if (moduleCache[modulePath]) {
      return moduleCache[modulePath].exports;
    }

    // If module definition is not available locally
    if (!moduleDefinitions[modulePath]) {
      // Try global parcelRequire if not silent
      if (!isSilent && globalModuleLoader) {
        return globalModuleLoader(modulePath, true);
      }
      // Try CommonJS require if available
      if (commonjsRequire && typeof modulePath === "string") {
        return commonjsRequire(modulePath);
      }
      // If module cannot be found, throw an error
      var moduleNotFoundError = new Error("Cannot locate module: '" + modulePath + "'");
      moduleNotFoundError.code = "MODULE_NOT_FOUND";
      throw moduleNotFoundError;
    }

    // Prepare module resolution context for this module
    // This allows modules to reference other modules by their original paths
    localModuleRequester.resolve = function(relativeModulePath) {
      return moduleDefinitions[modulePath][1][relativeModulePath] || relativeModulePath;
    };
    localModuleRequester.cache = {}; // Clear cache for this specific module's resolution (not global cache)

    // Create a new module instance and add to cache
    var currentModuleInstance = moduleCache[modulePath] = new loadModule.Module(modulePath);

    // Execute the module's definition function
    // 'this' context is deliberately left as is, as per Parcel's design
    moduleDefinitions[modulePath][0].call(currentModuleInstance.exports, localModuleRequester, currentModuleInstance, currentModuleInstance.exports, this);

    // Return the module's exports
    return moduleCache[modulePath].exports;

    // Local requester function for modules to use `require`
    function localModuleRequester(requestedPath) {
      return loadModule(localModuleRequester.resolve(requestedPath));
    }
  }

  // Mark this loader as a Parcel-style loader
  loadModule.isParcelRequire = true;

  // Module constructor function
  loadModule.Module = function(id) {
    this.id = id;
    this.bundle = loadModule;
    this.exports = {};
  };

  // Expose internal module definitions and cache
  loadModule.modules = moduleDefinitions;
  loadModule.cache = moduleCache;
  loadModule.parent = globalModuleLoader; // Reference to parent loader if nested

  // Function to register new modules dynamically
  loadModule.register = function(id, moduleExportValue) {
    moduleDefinitions[id] = [function(moduleReq, moduleObj) {
      moduleObj.exports = moduleExportValue;
    }, {}];
  };

  // Process all entry points
  var initialError = null;
  // Iterate through provided entry points and load them
  for (let entryIdx = 0; entryIdx < entryPoints.length; entryIdx++) {
    try {
      loadModule(entryPoints[entryIdx]);
    } catch (err) {
      // Store the first error encountered, but continue processing other entries
      if (!initialError) {
        initialError = err;
      }
    }
  }

  // If there are entry points, determine the final export
  if (entryPoints.length > 0) {
    let lastLoadedModuleExports = loadModule(entryPoints[entryPoints.length - 1]);
    // Handle different module export styles (CommonJS, AMD, global)
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = lastLoadedModuleExports;
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return lastLoadedModuleExports;
      });
    } else if (exportName) {
      this[exportName] = lastLoadedModuleExports;
    }
  }

  // Update the global parcelRequire reference
  parcelRequire = loadModule;

  // If an error occurred during entry point loading, re-throw it
  if (initialError) {
    throw initialError;
  }

  // Return the main module loader function
  return loadModule;
}({
  "Focm": [function(standardRequire, moduleObj, moduleExports, globalScope) {
    // This is the primary application module, defined within the Parcel bundle.
    // 'appModules' acts as a global namespace for various utility modules.
    var appModules = {};

    // --- Module: Control.Semigroupoid ---
    (function(semigroupoidModule) {
      "use strict";
      // Define the Semigroupoid type constructor
      var SemigroupoidDefinition = function(compositionFunction) {
        this.compose = compositionFunction;
      };
      // Instance for functions (f . g = x => f(g(x)))
      var functionSemigroupoidInstance = new SemigroupoidDefinition(function(funcA) {
        return function(funcB) {
          return function(inputVal) {
            return funcA(funcB(inputVal));
          };
        };
      });
      // Export the composition function and the type constructor
      semigroupoidModule.compose = function(instance) {
        return instance.compose;
      };
      semigroupoidModule.Semigroupoid = SemigroupoidDefinition;
      semigroupoidModule.semigroupoidFn = functionSemigroupoidInstance;
    })(appModules["Control.Semigroupoid"] = appModules["Control.Semigroupoid"] || {});

    // --- Module: Control.Category ---
    (function(categoryModule) {
      "use strict";
      var semigroupoidMod = appModules["Control.Semigroupoid"];
      // Define the Category type constructor
      var CategoryDefinition = function(semigroupoidBase, identityFunction) {
        this.Semigroupoid0 = semigroupoidBase; // Inherits from Semigroupoid
        this.identity = identityFunction;
      };
      // Instance for functions (identity function is just `x => x`)
      var functionCategoryInstance = new CategoryDefinition(function() {
        return semigroupoidMod.semigroupoidFn;
      }, function(val) {
        return val;
      });
      // Export the Category type constructor and identity function getter
      categoryModule.Category = CategoryDefinition;
      categoryModule.identity = function(instance) {
        return instance.identity;
      };
      categoryModule.categoryFn = functionCategoryInstance;
    })(appModules["Control.Category"] = appModules["Control.Category"] || {});

    // --- Module: Data.Eq ---
    (function(equalityModule) {
      "use strict";
      // Reference equality check (===)
      (appModules["Data.Eq"] = appModules["Data.Eq"] || {}).refEq = function(valA) {
        return function(valB) {
          return valA === valB;
        };
      };
    })();

    // --- Module: Data.Unit ---
    (function(unitModule) {
      "use strict";
      // The single unit value (similar to void or undefined in JS, but explicitly typed)
      (appModules["Data.Unit"] = appModules["Data.Unit"] || {}).unit = {};
    })();

    // --- Module: Data.Show ---
    (function(showModule) {
      "use strict";
      // Implementation for showing integers (just convert to string)
      (appModules["Data.Show"] = appModules["Data.Show"] || {}).showIntImpl = function(intVal) {
        return intVal.toString();
      };
    })();

    // --- Module: Data.Show (continued, instance definition) ---
    (function(showModule) {
      "use strict";
      var showDataModule = appModules["Data.Show"];
      // Define the Show type constructor
      var ShowDefinition = function(showFunction) {
        this.show = showFunction;
      };
      // Instance for integers
      var integerShowInstance = new ShowDefinition(showDataModule.showIntImpl);
      // Export Show type and getter for show function
      showModule.Show = ShowDefinition;
      showModule.show = function(instance) {
        return instance.show;
      };
      showModule.showInt = integerShowInstance;
    })(appModules["Data.Show"] = appModules["Data.Show"] || {});

    // --- Module: Data.Unit (continued, export unit value) ---
    (function(unitModule) {
      "use strict";
      var dataUnit = appModules["Data.Unit"];
      // Export the unit value
      unitModule.unit = dataUnit.unit;
    })(appModules["Data.Unit"] = appModules["Data.Unit"] || {});

    // --- Module: Data.Eq (continued, instance definition) ---
    (function(equalityModule) {
      "use strict";
      var dataEq = appModules["Data.Eq"];
      // Define the Eq type constructor
      var EqDefinition = function(equalityCheckFunction) {
        this.eq = equalityCheckFunction;
      };
      // Instance for integers (uses reference equality for primitives)
      var integerEqualityInstance = new EqDefinition(dataEq.refEq);
      // Export Eq type and getter for eq function
      equalityModule.Eq = EqDefinition;
      equalityModule.eq = function(instance) {
        return instance.eq;
      };
      equalityModule.eqInt = integerEqualityInstance;
    })(appModules["Data.Eq"] = appModules["Data.Eq"] || {});

    // --- Module: Data.Ord.Unsafe ---
    (function(unsafeOrdModule) {
      "use strict";
      // Unsafe comparison implementation
      (appModules["Data.Ord.Unsafe"] = appModules["Data.Ord.Unsafe"] || {}).unsafeCompareImpl = function(lessThan) {
        return function(equal) {
          return function(greaterThan) {
            return function(valA) {
              return function(valB) {
                return valA < valB ? lessThan : valA === valB ? equal : greaterThan;
              };
            };
          };
        };
      };
    })();

    // --- Module: Data.Semigroup ---
    (function(semigroupModule) {
      "use strict";
      // Define the Semigroup type constructor
      semigroupModule.Semigroup = function(appendOperation) {
        this.append = appendOperation;
      };
      // Export the append function getter
      semigroupModule.append = function(instance) {
        return instance.append;
      };
    })(appModules["Data.Semigroup"] = appModules["Data.Semigroup"] || {});

    // --- Module: Data.Ordering ---
    (function(orderingModule) {
      "use strict";
      // Define the three possible ordering values
      var orderingLessThan = (function() {
        function LT() {}
        LT.value = new LT();
        return LT;
      })();
      var orderingGreaterThan = (function() {
        function GT() {}
        GT.value = new GT();
        return GT;
      })();
      var orderingEquality = (function() {
        function EQ() {}
        EQ.value = new EQ();
        return EQ;
      })();
      // Export the ordering values
      orderingModule.LT = orderingLessThan;
      orderingModule.GT = orderingGreaterThan;
      orderingModule.EQ = orderingEquality;
    })(appModules["Data.Ordering"] = appModules["Data.Ordering"] || {});

    // --- Module: Data.Ord.Unsafe (continued, export unsafeCompare) ---
    (function(unsafeOrdModule) {
      "use strict";
      var ordUnsafe = appModules["Data.Ord.Unsafe"];
      var ordering = appModules["Data.Ordering"];
      // Create the direct comparison function using unsafeCompareImpl
      var directComparisonFunc = ordUnsafe.unsafeCompareImpl(ordering.LT.value)(ordering.EQ.value)(ordering.GT.value);
      unsafeOrdModule.unsafeCompare = directComparisonFunc;
    })(appModules["Data.Ord.Unsafe"] = appModules["Data.Ord.Unsafe"] || {});

    // --- Module: Data.Ord ---
    (function(ordModule) {
      "use strict";
      var dataEq = appModules["Data.Eq"];
      var ordUnsafe = appModules["Data.Ord.Unsafe"];
      var ordering = appModules["Data.Ordering"];
      // Define the Ord type constructor
      var OrdDefinition = function(eqInstance, comparisonFunction) {
        this.Eq0 = eqInstance; // Inherits from Eq
        this.compare = comparisonFunction;
      };
      // Instance for integers
      var integerOrderInstance = new OrdDefinition(function() {
        return dataEq.eqInt;
      }, ordUnsafe.unsafeCompare);
      // Export Ord type and getters for compare, min, max
      ordModule.Ord = OrdDefinition;
      ordModule.compare = function(instance) {
        return instance.compare;
      };
      ordModule.min = function(ordInstance) {
        return function(valA) {
          return function(valB) {
            var comparisonResult = ordModule.compare(ordInstance)(valA)(valB);
            if (comparisonResult instanceof ordering.LT) {
              return valA;
            }
            if (comparisonResult instanceof ordering.EQ) {
              return valA;
            } // Or valB, doesn't matter
            if (comparisonResult instanceof ordering.GT) {
              return valB;
            }
            // Fallback for exhaustive pattern matching (should not be reached)
            throw new Error("Failed pattern match for Ord.min: " + [comparisonResult.constructor.name]);
          };
        };
      };
      ordModule.max = function(ordInstance) {
        return function(valA) {
          return function(valB) {
            var comparisonResult = ordModule.compare(ordInstance)(valA)(valB);
            if (comparisonResult instanceof ordering.LT) {
              return valB;
            }
            if (comparisonResult instanceof ordering.EQ) {
              return valA;
            } // Or valB
            if (comparisonResult instanceof ordering.GT) {
              return valA;
            }
            // Fallback for exhaustive pattern matching
            throw new Error("Failed pattern match for Ord.max: " + [comparisonResult.constructor.name]);
          };
        };
      };
      ordModule.ordInt = integerOrderInstance;
    })(appModules["Data.Ord"] = appModules["Data.Ord"] || {});

    // --- Module: Data.Function ---
    (function(functionModule) {
      "use strict";
      // Function to flip arguments of a curried function
      functionModule.flip = function(func) {
        return function(arg2) {
          return function(arg1) {
            return func(arg1)(arg2);
          };
        };
      };
      // Function that always returns a constant value, ignoring its argument
      functionModule.const = function(constantVal) {
        return function(ignoredArg) {
          return constantVal;
        };
      };
    })(appModules["Data.Function"] = appModules["Data.Function"] || {});

    // --- Module: Data.Functor ---
    (function(functorModule) {
      "use strict";
      var dataFunction = appModules["Data.Function"];
      var dataUnit = appModules["Data.Unit"];
      // Define the Functor type constructor
      var FunctorDefinition = function(mapFunction) {
        this.map = mapFunction;
      };
      // Export the map function getter
      functorModule.map = function(instance) {
        return instance.map;
      };
      // Void function: maps over a functor, replacing all values with unit
      functorModule.void = function(functorInstance) {
        return functorModule.map(functorInstance)(dataFunction.const(dataUnit.unit));
      };
      functorModule.Functor = FunctorDefinition;
    })(appModules["Data.Functor"] = appModules["Data.Functor"] || {});

    // --- Module: Control.Apply ---
    (function(applyModule) {
      "use strict";
      var controlCategory = appModules["Control.Category"];
      var dataFunction = appModules["Data.Function"];
      var dataFunctor = appModules["Data.Functor"];
      // Define the Apply type constructor
      var ApplyDefinition = function(functorBase, applyFunction) {
        this.Functor0 = functorBase; // Inherits from Functor
        this.apply = applyFunction;
      };
      // Export the apply function getter
      applyModule.apply = function(instance) {
        return instance.apply;
      };
      // applySecond: applies a function in a context and discards its result,
      // keeping the result of a second computation
      applyModule.applySecond = function(applyInstance) {
        return function(compA) {
          return function(compB) {
            return applyModule.apply(applyInstance)(dataFunctor.map(applyInstance.Functor0())(dataFunction.const(controlCategory.identity(controlCategory.categoryFn)))(compA))(compB);
          };
        };
      };
      applyModule.Apply = ApplyDefinition;
    })(appModules["Control.Apply"] = appModules["Control.Apply"] || {});

    // --- Module: Control.Applicative ---
    (function(applicativeModule) {
      "use strict";
      var controlApply = appModules["Control.Apply"];
      // Define the Applicative type constructor
      var ApplicativeDefinition = function(applyBase, pureFunction) {
        this.Apply0 = applyBase; // Inherits from Apply
        this.pure = pureFunction;
      };
      // Export the pure function getter
      applicativeModule.pure = function(instance) {
        return instance.pure;
      };
      // liftA1: lifts a unary function into the applicative context
      applicativeModule.liftA1 = function(applicativeInstance) {
        return function(func) {
          return function(contextValue) {
            return controlApply.apply(applicativeInstance.Apply0())(applicativeModule.pure(applicativeInstance)(func))(contextValue);
          };
        };
      };
      applicativeModule.Applicative = ApplicativeDefinition;
    })(appModules["Control.Applicative"] = appModules["Control.Applicative"] || {});

    // --- Module: Control.Bind ---
    (function(bindModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlApply = appModules["Control.Apply"];
      var dataFunction = appModules["Data.Function"];
      // Define the Bind type constructor
      var BindDefinition = function(applyBase, bindFunction) {
        this.Apply0 = applyBase; // Inherits from Apply
        this.bind = bindFunction;
      };
      // Export the bind function getter
      bindModule.bind = function(instance) {
        return instance.bind;
      };
      // bindFlipped: `>>=` operator with arguments flipped
      bindModule.bindFlipped = function(bindInstance) {
        return dataFunction.flip(bindModule.bind(bindInstance));
      };
      // composeKleisliFlipped: `>=>` operator with arguments flipped
      bindModule.composeKleisliFlipped = function(bindInstance) {
        return function(funcA) {
          return function(funcB) {
            return function(inputVal) {
              return bindModule.bindFlipped(bindInstance)(funcA)(funcB(inputVal));
            };
          };
        };
      };
      bindModule.Bind = BindDefinition;
    })(appModules["Control.Bind"] = appModules["Control.Bind"] || {});

    // --- Module: Control.Monad ---
    (function(monadModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlBind = appModules["Control.Bind"];
      // Define the Monad type constructor
      var MonadDefinition = function(applicativeBase, bindBase) {
        this.Applicative0 = applicativeBase; // Inherits from Applicative
        this.Bind1 = bindBase; // Inherits from Bind
      };
      // ap: applies a function in a context to a value in a context
      monadModule.ap = function(monadInstance) {
        return function(funcContext) {
          return function(valueContext) {
            return controlBind.bind(monadInstance.Bind1())(funcContext)(function(func) {
              return controlBind.bind(monadInstance.Bind1())(valueContext)(function(value) {
                return controlApplicative.pure(monadInstance.Applicative0())(func(value));
              });
            });
          };
        };
      };
      monadModule.Monad = MonadDefinition;
    })(appModules["Control.Monad"] = appModules["Control.Monad"] || {});

    // --- Module: Data.Foldable ---
    (function(foldableModule) {
      "use strict";
      // foldrArray: standard right-associative fold for arrays
      foldableModule.foldrArray = function(foldFunc) {
        return function(initialValue) {
          return function(array) {
            let accumulator = initialValue;
            for (let i = array.length - 1; i >= 0; i--) {
              accumulator = foldFunc(array[i])(accumulator);
            }
            return accumulator;
          };
        };
      };
      // foldlArray: standard left-associative fold for arrays
      foldableModule.foldlArray = function(foldFunc) {
        return function(initialValue) {
          return function(array) {
            let accumulator = initialValue;
            for (let i = 0, len = array.length; i < len; i++) {
              accumulator = foldFunc(accumulator)(array[i]);
            }
            return accumulator;
          };
        };
      };
    })(appModules["Data.Foldable"] = appModules["Data.Foldable"] || {});

    // --- Module: Data.Monoid ---
    (function(monoidModule) {
      "use strict";
      // Define the Monoid type constructor
      monoidModule.Monoid = function(semigroupBase, emptyValue) {
        this.Semigroup0 = semigroupBase; // Inherits from Semigroup
        this.mempty = emptyValue;
      };
      // Export the mempty (empty value) getter
      monoidModule.mempty = function(instance) {
        return instance.mempty;
      };
    })(appModules["Data.Monoid"] = appModules["Data.Monoid"] || {});

    // --- Module: Data.Maybe ---
    (function(maybeModule) {
      "use strict";
      // Nothing constructor
      var nothingValue = (function() {
        function Nothing() {}
        Nothing.value = new Nothing();
        return Nothing;
      })();
      // Just constructor
      var justValueConstructor = (function() {
        function Just(value) {
          this.value0 = value;
        }
        Just.create = function(value) {
          return new Just(value);
        };
        return Just;
      })();
      // maybe: pattern match on Maybe values
      maybeModule.Nothing = nothingValue;
      maybeModule.Just = justValueConstructor;
      maybeModule.maybe = function(onNothing) {
        return function(onJust) {
          return function(maybeValue) {
            if (maybeValue instanceof nothingValue) {
              return onNothing;
            }
            if (maybeValue instanceof justValueConstructor) {
              return onJust(maybeValue.value0);
            }
            // Fallback for exhaustive pattern matching
            throw new Error("Failed pattern match for Data.Maybe.maybe: " + [onNothing.constructor.name, onJust.constructor.name, maybeValue.constructor.name]);
          };
        };
      };
    })(appModules["Data.Maybe"] = appModules["Data.Maybe"] || {});

    // --- Module: Data.Foldable (continued, instance definition) ---
    (function(foldableModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlApply = appModules["Control.Apply"];
      var dataFoldable = appModules["Data.Foldable"];
      var dataMonoid = appModules["Data.Monoid"];
      var dataSemigroup = appModules["Data.Semigroup"];
      var dataUnit = appModules["Data.Unit"];
      // Define the Foldable type constructor
      var FoldableDefinition = function(foldMapFunc, foldlFunc, foldrFunc) {
        this.foldMap = foldMapFunc;
        this.foldl = foldlFunc;
        this.foldr = foldrFunc;
      };
      // Export the foldr getter
      foldableModule.foldr = function(instance) {
        return instance.foldr;
      };
      // defaultFoldMapRight: default implementation of foldMap using foldr
      var defaultFoldMapRight = function(foldableInstance) {
        return function(monoidInstance) {
          return function(mappingFunc) {
            return foldableModule.foldr(foldableInstance)(function(element) {
              return function(accumulator) {
                return dataSemigroup.append(monoidInstance.Semigroup0())(mappingFunc(element))(accumulator);
              };
            })(dataMonoid.mempty(monoidInstance));
          };
        };
      };
      // Instance for arrays
      var arrayFoldableInstance = new FoldableDefinition(
        function(monoidInstance) {
          return defaultFoldMapRight(arrayFoldableInstance)(monoidInstance);
        },
        dataFoldable.foldlArray,
        dataFoldable.foldrArray
      );
      // Export Foldable type and getters
      foldableModule.Foldable = FoldableDefinition;
      foldableModule.foldl = function(instance) {
        return instance.foldl;
      };
      foldableModule.foldMap = function(instance) {
        return instance.foldMap;
      };
      foldableModule.foldMapDefaultR = defaultFoldMapRight;
      // traverse_: traverses a foldable structure, performing an action for each element and discarding the results
      foldableModule.traverse_ = function(applicativeInstance) {
        return function(foldableInstance) {
          return function(actionFunc) {
            return foldableModule.foldr(foldableInstance)(function(element) {
              return function(accumulator) {
                return controlApply.applySecond(applicativeInstance.Apply0())(actionFunc(element))(accumulator);
              };
            })(controlApplicative.pure(applicativeInstance)(dataUnit.unit));
          };
        };
      };
      foldableModule.foldableArray = arrayFoldableInstance;
    })(appModules["Data.Foldable"] = appModules["Data.Foldable"] || {});

    // --- Module: Data.Either ---
    (function(eitherModule) {
      "use strict";
      var dataFunctor = appModules["Data.Functor"];
      var dataMaybe = appModules["Data.Maybe"];
      var controlApply = appModules["Control.Apply"];
      var controlApplicative = appModules["Control.Applicative"];
      var controlBind = appModules["Control.Bind"];
      // Left constructor for Either
      var leftConstructor = (function() {
        function Left(value) {
          this.value0 = value;
        }
        Left.create = function(value) {
          return new Left(value);
        };
        return Left;
      })();
      // Right constructor for Either
      var rightConstructor = (function() {
        function Right(value) {
          this.value0 = value;
        }
        Right.create = function(value) {
          return new Right(value);
        };
        return Right;
      })();
      // Functor instance for Either
      var eitherFunctorInstance = new dataFunctor.Functor(function(mappingFunc) {
        return function(eitherValue) {
          if (eitherValue instanceof leftConstructor) {
            return new leftConstructor(eitherValue.value0);
          }
          if (eitherValue instanceof rightConstructor) {
            return new rightConstructor(mappingFunc(eitherValue.value0));
          }
          // Fallback
          throw new Error("Failed pattern match for Data.Either.functorEither: " + [eitherValue.constructor.name]);
        };
      });
      // either: pattern match on Either values
      var eitherDispatcher = function(onLeft) {
        return function(onRight) {
          return function(eitherValue) {
            if (eitherValue instanceof leftConstructor) {
              return onLeft(eitherValue.value0);
            }
            if (eitherValue instanceof rightConstructor) {
              return onRight(eitherValue.value0);
            }
            // Fallback
            throw new Error("Failed pattern match for Data.Either.either: " + [onLeft.constructor.name, onRight.constructor.name, eitherValue.constructor.name]);
          };
        };
      };
      // Apply instance for Either
      var eitherApplyInstance = new controlApply.Apply(function() {
        return eitherFunctorInstance;
      }, function(funcEither) {
        return function(valueEither) {
          if (funcEither instanceof leftConstructor) {
            return new leftConstructor(funcEither.value0);
          }
          if (funcEither instanceof rightConstructor) {
            return dataFunctor.map(eitherFunctorInstance)(funcEither.value0)(valueEither);
          }
          // Fallback
          throw new Error("Failed pattern match for Data.Either.applyEither: " + [funcEither.constructor.name, valueEither.constructor.name]);
        };
      });
      // Bind instance for Either
      var eitherBindInstance = new controlBind.Bind(function() {
        return eitherApplyInstance;
      }, eitherDispatcher(function(leftVal) {
        return function(func) {
          return new leftConstructor(leftVal);
        };
      })(function(rightVal) {
        return function(func) {
          return func(rightVal);
        };
      }));
      // Applicative instance for Either
      var eitherApplicativeInstance = new controlApplicative.Applicative(function() {
        return eitherApplyInstance;
      }, rightConstructor.create);
      // Export constructors and instances
      eitherModule.Left = leftConstructor;
      eitherModule.Right = rightConstructor;
      eitherModule.either = eitherDispatcher;
      // note: converts a Maybe to an Either, using the provided value for Left if Nothing
      eitherModule.note = function(leftVal) {
        return dataMaybe.maybe(new leftConstructor(leftVal))(rightConstructor.create);
      };
      eitherModule.functorEither = eitherFunctorInstance;
      eitherModule.applyEither = eitherApplyInstance;
      eitherModule.applicativeEither = eitherApplicativeInstance;
      eitherModule.bindEither = eitherBindInstance;
    })(appModules["Data.Either"] = appModules["Data.Either"] || {});

    // --- Module: Effect ---
    (function(effectModule) {
      "use strict";
      // pureE: wraps a value in the Effect monad
      effectModule.pureE = function(value) {
        return function() {
          return value;
        };
      };
      // bindE: sequences two Effect computations
      effectModule.bindE = function(effectA) {
        return function(func) {
          return function() {
            return func(effectA())();
          };
        };
      };
    })(appModules.Effect = appModules.Effect || {});

    // --- Module: Effect (continued, instances) ---
    (function(effectModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlApply = appModules["Control.Apply"];
      var controlBind = appModules["Control.Bind"];
      var controlMonad = appModules["Control.Monad"];
      var dataFunctor = appModules["Data.Functor"];
      var effectCore = appModules.Effect;
      // Monad instance for Effect
      var effectMonadInstance = new controlMonad.Monad(function() {
        return effectApplicativeInstance;
      }, function() {
        return effectBindInstance;
      });
      // Bind instance for Effect
      var effectBindInstance = new controlBind.Bind(function() {
        return effectApplyInstance;
      }, effectCore.bindE);
      // Apply instance for Effect
      var effectApplyInstance = new controlApply.Apply(function() {
        return effectFunctorInstance;
      }, controlMonad.ap(effectMonadInstance));
      // Applicative instance for Effect
      var effectApplicativeInstance = new controlApplicative.Applicative(function() {
        return effectApplyInstance;
      }, effectCore.pureE);
      // Functor instance for Effect
      var effectFunctorInstance = new dataFunctor.Functor(controlApplicative.liftA1(effectApplicativeInstance));
      // Export instances
      effectModule.functorEffect = effectFunctorInstance;
      effectModule.applyEffect = effectApplyInstance;
      effectModule.applicativeEffect = effectApplicativeInstance;
      effectModule.bindEffect = effectBindInstance;
      effectModule.monadEffect = effectMonadInstance;
    })(appModules.Effect = appModules.Effect || {});

    // --- Module: Effect.Ref ---
    (function(refModule) {
      "use strict";
      // new: creates a new mutable reference
      refModule.new = function(initialValue) {
        return function() {
          return {
            value: initialValue
          };
        };
      };
      // read: reads the value from a mutable reference
      refModule.read = function(ref) {
        return function() {
          return ref.value;
        };
      };
      // write: writes a new value to a mutable reference
      refModule.write = function(newValue) {
        return function(ref) {
          return function() {
            ref.value = newValue;
            return {}; // Return unit
          };
        };
      };
    })(appModules["Effect.Ref"] = appModules["Effect.Ref"] || {});

    // --- Module: Effect.Ref (continued, export functions) ---
    (function(refModule) {
      "use strict";
      var effectRef = appModules["Effect.Ref"];
      // Export the new, read, and write functions
      refModule.new = effectRef.new;
      refModule.read = effectRef.read;
      refModule.write = effectRef.write;
    })(appModules["Effect.Ref"] = appModules["Effect.Ref"] || {});

    // --- Module: Partial.Unsafe ---
    (function(partialUnsafeModule) {
      "use strict";
      // unsafePartial: executes a partial function, asserting its totality
      (appModules["Partial.Unsafe"] = appModules["Partial.Unsafe"] || {}).unsafePartial = function(func) {
        return func();
      };
    })();

    // --- Module: Partial ---
    (function(partialModule) {
      "use strict";
      // crashWith: throws an error with the given message
      (appModules["Partial"] = appModules["Partial"] || {}).crashWith = function() {
        return function(message) {
          throw new Error(message);
        };
      };
    })();

    // --- Module: Partial (continued, export crashWith) ---
    (function(partialModule) {
      "use strict";
      var partialCore = appModules.Partial;
      partialModule.crashWith = partialCore.crashWith;
    })(appModules.Partial = appModules.Partial || {});

    // --- Module: Partial.Unsafe (continued, export unsafeCrashWith) ---
    (function(partialUnsafeModule) {
      "use strict";
      var partialCore = appModules.Partial;
      var unsafeCore = appModules["Partial.Unsafe"];
      // unsafeCrashWith: combines unsafePartial and crashWith
      partialUnsafeModule.unsafeCrashWith = function(message) {
        return unsafeCore.unsafePartial(function(unit) {
          return partialCore.crashWith(unit)(message);
        });
      };
    })(appModules["Partial.Unsafe"] = appModules["Partial.Unsafe"] || {});

    // --- Module: Control.Monad.Rec.Class ---
    (function(monadRecModule) {
      "use strict";
      // Loop constructor for tailRec
      var loopStateConstructor = (function() {
        function Loop(value) {
          this.value0 = value;
        }
        Loop.create = function(value) {
          return new Loop(value);
        };
        return Loop;
      })();
      // Done constructor for tailRec
      var doneResultConstructor = (function() {
        function Done(value) {
          this.value0 = value;
        }
        Done.create = function(value) {
          return new Done(value);
        };
        return Done;
      })();
      // tailRec: implements stack-safe recursion by looping in JavaScript
      monadRecModule.Loop = loopStateConstructor;
      monadRecModule.Done = doneResultConstructor;
      monadRecModule.tailRec = function(stepFunction) {
        return function(initialValue) {
          return function(monadComputation) {
            var currentResult;
            var isDone = false;

            // Inner loop function to process one step
            function processStep(state) {
              // If the state is not a Loop, it must be Done
              if (!(state instanceof loopStateConstructor)) {
                if (state instanceof doneResultConstructor) {
                  isDone = true;
                  return state.value0;
                }
                // Fallback for unexpected state
                throw new Error("Failed pattern match for Monad.Rec.Class.tailRec step: " + [state.constructor.name]);
              }
              // If it's a Loop, apply the step function to get the next state
              monadComputation = stepFunction(state.value0);
            }

            // Start the recursion with the initial value
            monadComputation = stepFunction(initialValue);

            // Loop until 'isDone' flag is set (meaning Done constructor was returned)
            while (!isDone) {
              currentResult = processStep(monadComputation);
            }
            return currentResult;
          };
        };
      };
    })(appModules["Control.Monad.Rec.Class"] = appModules["Control.Monad.Rec.Class"] || {});

    // --- Module: Effect.Class ---
    (function(effectClassModule) {
      "use strict";
      // liftEffect: lifts an Effect computation into a MonadEffect context
      effectClassModule.liftEffect = function(instance) {
        return instance.liftEffect;
      };
      // MonadEffect type constructor
      effectClassModule.MonadEffect = function(monadBase, liftEffectFunction) {
        this.Monad0 = monadBase; // Inherits from Monad
        this.liftEffect = liftEffectFunction;
      };
    })(appModules["Effect.Class"] = appModules["Effect.Class"] || {});

    // --- Module: Control.Parallel.Class ---
    (function(parallelClassModule) {
      "use strict";
      // parallel: converts a Monad computation to a Parallel computation
      parallelClassModule.parallel = function(instance) {
        return instance.parallel;
      };
      // sequential: converts a Parallel computation back to a Monad computation
      parallelClassModule.sequential = function(instance) {
        return instance.sequential;
      };
      // Parallel type constructor
      parallelClassModule.Parallel = function(applicativeBase, monadBase, parallelFunc, sequentialFunc) {
        this.Applicative1 = applicativeBase; // Applicative instance for the Parallel type
        this.Monad0 = monadBase; // Monad instance for the base type
        this.parallel = parallelFunc;
        this.sequential = sequentialFunc;
      };
    })(appModules["Control.Parallel.Class"] = appModules["Control.Parallel.Class"] || {});

    // --- Module: Control.Parallel ---
    (function(parallelModule) {
      "use strict";
      var controlCategory = appModules["Control.Category"];
      var controlParallelClass = appModules["Control.Parallel.Class"];
      var dataFoldable = appModules["Data.Foldable"];
      // parTraverse_: traverses a foldable structure in parallel, performing an action and discarding results
      var parallelTraverseDiscardOperation = function(parallelInstance) {
        return function(foldableInstance) {
          return function(actionFunc) {
            return function(structure) {
              return controlParallelClass.sequential(parallelInstance)(
                dataFoldable.traverse_(controlParallelClass.Applicative1(parallelInstance))(foldableInstance)(function(element) {
                  return controlParallelClass.parallel(parallelInstance)(actionFunc(element));
                })(structure)
              );
            };
          };
        };
      };
      parallelModule.parTraverse_ = parallelTraverseDiscardOperation;
      // parSequence_: sequences a foldable structure of parallel computations
      parallelModule.parSequence_ = function(parallelInstance) {
        return function(structure) {
          return parallelTraverseDiscardOperation(parallelInstance)(dataFoldable.foldableArray)(controlCategory.identity(controlCategory.categoryFn))(structure);
        };
      };
    })(appModules["Control.Parallel"] = appModules["Control.Parallel"] || {});

    // --- Module: Data.Array ---
    (function(arrayModule) {
      "use strict";
      // length: gets the length of an array
      arrayModule.length = function(arr) {
        return arr.length;
      };
      // uncons': internal helper to get head and tail of an array
      arrayModule["uncons'"] = function(onEmpty) {
        return function(onNonEmpty) {
          return function(arr) {
            if (arr.length === 0) {
              return onEmpty({});
            }
            return onNonEmpty(arr[0])(arr.slice(1));
          };
        };
      };
      // indexImpl: internal helper for safe array indexing
      arrayModule.indexImpl = function(onJust) {
        return function(onNothing) {
          return function(arr) {
            return function(idx) {
              return idx < 0 || idx >= arr.length ? onNothing : onJust(arr[idx]);
            };
          };
        };
      };
      // slice: extracts a slice of an array
      arrayModule.slice = function(startIndex) {
        return function(endIndex) {
          return function(arr) {
            return arr.slice(startIndex, endIndex);
          };
        };
      };
    })(appModules["Data.Array"] = appModules["Data.Array"] || {});

    // --- Module: Unsafe.Coerce ---
    (function(unsafeCoerceModule) {
      "use strict";
      // unsafeCoerce: performs an unchecked type coercion
      (appModules["Unsafe.Coerce"] = appModules["Unsafe.Coerce"] || {}).unsafeCoerce = function(value) {
        return value;
      };
    })();

    // --- Module: Unsafe.Coerce (continued, export unsafeCoerce) ---
    (function(unsafeCoerceModule) {
      "use strict";
      var unsafeCore = appModules["Unsafe.Coerce"];
      unsafeCoerceModule.unsafeCoerce = unsafeCore.unsafeCoerce;
    })(appModules["Unsafe.Coerce"] = appModules["Unsafe.Coerce"] || {});

    // --- Module: Data.Array (continued, export functions) ---
    (function(arrayModule) {
      "use strict";
      var dataArray = appModules["Data.Array"];
      var dataMaybe = appModules["Data.Maybe"];
      // uncons: safe way to get head and tail of an array
      var arrayUncons = dataArray["uncons'"](dataMaybe.Nothing.value)(function(head) {
        return function(tail) {
          return new dataMaybe.Just({
            head: head,
            tail: tail
          });
        };
      });
      // index: safe array indexing
      var arrayElementAtIndex = dataArray.indexImpl(dataMaybe.Just.create)(dataMaybe.Nothing.value);
      // Export array functions
      arrayModule.uncons = arrayUncons;
      arrayModule.index = arrayElementAtIndex;
      arrayModule.length = dataArray.length;
    })(appModules["Data.Array"] = appModules["Data.Array"] || {});

    // --- Module: Data.Int ---
    (function(intModule) {
      "use strict";
      // fromStringAsImpl: internal helper for parsing integers from strings with a given radix
      (appModules["Data.Int"] = appModules["Data.Int"] || {}).fromStringAsImpl = function(onSuccess) {
        return function(onFailure) {
          return function(radix) {
            return function(inputString) {
              var validCharsPattern;
              // Determine valid characters based on radix
              if (radix < 11) {
                validCharsPattern = "[0-" + (radix - 1).toString() + "]";
              } else if (radix === 11) {
                validCharsPattern = "[0-9a]";
              } else {
                validCharsPattern = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
              }
              // Regular expression to validate input string format
              var stringFormatRegex = new RegExp("^[\\+\\-]?" + validCharsPattern + "+$", "i");
              // Check if input matches the regex
              if (stringFormatRegex.test(inputString)) {
                var parsedInt = parseInt(inputString, radix);
                // Check if parsing was successful and resulted in an integer
                return (parsedInt | 0) === parsedInt ? onSuccess(parsedInt) : onFailure;
              }
              return onFailure;
            };
          };
        };
      };
    })();

    // --- Module: Data.Int (continued, export fromString, fromStringAs) ---
    (function(intModule) {
      "use strict";
      var dataInt = appModules["Data.Int"];
      var dataMaybe = appModules["Data.Maybe"];
      // fromStringAs: parses a string to an integer with a specified radix
      var parseIntegerFromStringAs = dataInt.fromStringAsImpl(dataMaybe.Just.create)(dataMaybe.Nothing.value);
      // fromString: parses a string to a decimal integer
      var parseDecimalIntegerFromString = parseIntegerFromStringAs(10);
      intModule.fromString = parseDecimalIntegerFromString;
      intModule.fromStringAs = parseIntegerFromStringAs;
    })(appModules["Data.Int"] = appModules["Data.Int"] || {});

    // --- Module: Data.String.CodeUnits ---
    (function(codeUnitsModule) {
      "use strict";
      // length: gets the length of a string
      codeUnitsModule.length = function(str) {
        return str.length;
      };
      // take: takes a prefix of a string
      codeUnitsModule.take = function(count) {
        return function(str) {
          return str.substr(0, count);
        };
      };
      // drop: drops a prefix of a string
      codeUnitsModule.drop = function(count) {
        return function(str) {
          return str.substring(count);
        };
      };
    })(appModules["Data.String.CodeUnits"] = appModules["Data.String.CodeUnits"] || {});

    // --- Module: Data.String.CodeUnits (continued, export take, takeRight) ---
    (function(codeUnitsModule) {
      "use strict";
      var stringCodeUnits = appModules["Data.String.CodeUnits"];
      // takeRight: takes a suffix of a string
      codeUnitsModule.takeRight = function(count) {
        return function(str) {
          return stringCodeUnits.drop(stringCodeUnits.length(str) - count | 0)(str);
        };
      };
      // take: exports the existing take function
      codeUnitsModule.take = stringCodeUnits.take;
    })(appModules["Data.String.CodeUnits"] = appModules["Data.String.CodeUnits"] || {});

    // --- Module: Data.String.Common ---
    (function(commonStringModule) {
      "use strict";
      // split: splits a string by a separator
      commonStringModule.split = function(separator) {
        return function(str) {
          return str.split(separator);
        };
      };
      // trim: removes whitespace from both ends of a string
      commonStringModule.trim = function(str) {
        return str.trim();
      };
    })(appModules["Data.String.Common"] = appModules["Data.String.Common"] || {});

    // --- Module: Data.String.Common (continued, export split, trim) ---
    (function(commonStringModule) {
      "use strict";
      var stringCommon = appModules["Data.String.Common"];
      commonStringModule.split = stringCommon.split;
      commonStringModule.trim = stringCommon.trim;
    })(appModules["Data.String.Common"] = appModules["Data.String.Common"] || {});

    // --- Module: Effect.Aff ---
    (function(affModule) {
      "use strict";
      // Internal representation of an Aff computation (Free Monad-like structure)
      var AffInternalTypes = (function() {
        var internalState = {}; // Internal tracking for fibers/scheduling
        var Pure = "Pure";
        var Throw = "Throw";
        var Catch = "Catch";
        var Sync = "Sync";
        var Async = "Async";
        var Bind = "Bind";
        var Bracket = "Bracket";
        var Fork = "Fork";
        var Sequential = "Sequential";
        var ParMap = "ParMap";
        var ParApply = "ParApply";
        var ParAlt = "ParAlt";
        var Cons = "Cons"; // Used internally for linked lists
        var Resume = "Resume"; // Internal for catch/bracket
        var Release = "Release"; // Internal for bracket
        var Finalizer = "Finalizer"; // Internal for bracket
        var Finalized = "Finalized"; // Internal for bracket
        var Forked = "Forked"; // Internal for fork

        // Basic constructor for internal AST nodes
        function AffNode(tag, val1, val2, val3) {
          this.tag = tag;
          this._1 = val1;
          this._2 = val2;
          this._3 = val3;
        }

        // Helper to create tagged constructors
        function createTaggedConstructor(tag) {
          var constructorFunc = function(val1, val2, val3) {
            return new AffNode(tag, val1, val2, val3);
          };
          constructorFunc.tag = tag;
          return constructorFunc;
        }

        // Creates a Pure node
        function createPureNode(value) {
          return new AffNode(Pure, value);
        }

        // Helper for throwing errors asynchronously
        function throwAsync(err) {
          setTimeout(function() {
            throw err;
          }, 0);
        }

        // Helper for synchronous error handling
        function handleSyncError(leftConstructor, rightConstructor, action) {
          try {
            return rightConstructor(action());
          } catch (err) {
            return leftConstructor(err);
          }
        }

        // Helper for asynchronous error handling
        function handleAsyncError(leftConstructor, asyncAction, callback) {
          try {
            return asyncAction(callback);
          } catch (err) {
            return callback(leftConstructor(err))();
          }
        }

        // Scheduler for non-blocking execution
        var scheduler = (function() {
          var queueSize = 1024;
          var head = 0;
          var tail = 0;
          var taskQueue = new Array(queueSize);
          var isDraining = false;

          function drainQueue() {
            var task;
            isDraining = true;
            while (head !== tail) {
              tail--;
              task = taskQueue[head];
              taskQueue[head] = undefined; // Clear reference
              head = (head + 1) % queueSize;
              task();
            }
            isDraining = false;
          }

          return {
            isDraining: function() {
              return isDraining;
            },
            enqueue: function(task) {
              var oldIsDraining;
              if (tail === queueSize) { // Queue full
                oldIsDraining = isDraining;
                drainQueue(); // Drain to make space
                isDraining = oldIsDraining; // Restore draining state
              }
              taskQueue[(head + tail) % queueSize] = task;
              tail++;
              if (!isDraining) {
                drainQueue();
              }
            }
          };
        })();

        // Fiber states
        var FIBER_STATE_INITIAL = 0;
        var FIBER_STATE_RUNNING = 1;
        var FIBER_STATE_PAUSED = 2;
        var FIBER_STATE_CATCHING = 3;
        var FIBER_STATE_ASYNC_WAIT = 4;
        var FIBER_STATE_ERROR = 5;
        var FIBER_STATE_COMPLETED = 6;

        // Fiber runner function
        function createFiberRunner(eitherOps, logger, initialComputation) {
          var callCount = 0;
          var currentState = FIBER_STATE_INITIAL;
          var currentResult = initialComputation;
          var currentError = null;
          var currentCatchStack = null;
          var currentBracketStack = null;
          var bracketDepth = 0;
          var currentListeners = null; // Listeners for fiber completion
          var shouldRethrow = true; // Default rethrow behavior for listeners

          function runFiberStep(stepCounter) {
            // Variables for current processing context
            var currentAffNode;
            var currentBracketNode;
            var listenerNode;

            // Main fiber loop
            for (;;) {
              // Reset context variables for each iteration
              currentAffNode = null;
              currentBracketNode = null;
              listenerNode = null;

              // State machine for fiber execution
              switch (currentState) {
                case FIBER_STATE_CATCHING:
                  currentState = FIBER_STATE_RUNNING;
                  currentResult = currentCatchStack._1(currentResult); // Apply catch handler
                  // Pop from catch stack
                  if (currentBracketStack === null) {
                    currentCatchStack = null;
                  } else {
                    currentCatchStack = currentBracketStack._1;
                    currentBracketStack = currentBracketStack._2;
                  }
                  break;

                case FIBER_STATE_ERROR:
                  // If there's an error, unwind the stack
                  currentCatchStack = null;
                  currentBracketStack = null;
                  // If no bracket stack, fiber is done with error
                  if (currentCatchStack === null) {
                    currentState = FIBER_STATE_COMPLETED;
                    currentResult = currentError || currentResult;
                  } else {
                    // Otherwise, try to handle with the catch stack
                    currentState = FIBER_STATE_CATCHING;
                    currentResult = eitherOps.fromRight(currentResult); // Recover value
                  }
                  break;

                case FIBER_STATE_RUNNING:
                  // Process the current computation node
                  switch (currentResult.tag) {
                    case Bind:
                      // Push continuation onto catch stack
                      if (currentCatchStack) {
                        currentBracketStack = new AffNode(Cons, currentCatchStack, currentBracketStack);
                      }
                      currentCatchStack = currentResult._2; // Store the binding function
                      currentState = FIBER_STATE_RUNNING;
                      currentResult = currentResult._1; // Continue with inner computation
                      break;

                    case Pure:
                      // If pure, and no continuation, we are done
                      if (currentCatchStack === null) {
                        currentState = FIBER_STATE_COMPLETED;
                        currentResult = eitherOps.right(currentResult._1);
                      } else {
                        // Otherwise, apply continuation
                        currentState = FIBER_STATE_CATCHING;
                        currentResult = currentResult._1; // Extract value
                      }
                      break;

                    case Sync:
                      // Synchronous effect, handle errors
                      currentState = FIBER_STATE_ERROR;
                      currentResult = handleSyncError(eitherOps.left, eitherOps.right, currentResult._1);
                      break;

                    case Async:
                      // Asynchronous effect, pause fiber
                      currentState = FIBER_STATE_ASYNC_WAIT;
                      return handleAsyncError(eitherOps.left, currentResult._1, function(futureResult) {
                        return function() {
                          // When async task completes, resume fiber execution
                          // Ensure we don't accidentally re-trigger if already killed
                          if (stepCounter === callCount) {
                            callCount++; // Increment call count to invalidate previous pauses
                            currentState = FIBER_STATE_ERROR; // Assume error, will be overwritten if success
                            currentResult = futureResult;
                            runFiberStep(callCount); // Resume execution
                          }
                        };
                      });

                    case Throw:
                      // Explicit throw, set error state
                      currentState = FIBER_STATE_ERROR;
                      currentError = eitherOps.left(currentResult._1);
                      currentResult = null; // Clear result
                      break;

                    case Catch:
                      // Push catch block onto stack
                      currentBracketStack = new AffNode(Cons, currentResult, currentCatchStack ? new AffNode(Resume, currentCatchStack, currentBracketStack) : null);
                      currentCatchStack = null; // Clear current catch
                      currentState = FIBER_STATE_RUNNING;
                      currentResult = currentResult._1; // Continue with protected computation
                      break;

                    case Bracket:
                      // Push bracket block onto stack
                      bracketDepth++;
                      currentBracketStack = new AffNode(Cons, currentResult, currentCatchStack ? new AffNode(Resume, currentCatchStack, currentBracketStack) : null);
                      currentCatchStack = null;
                      currentState = FIBER_STATE_RUNNING;
                      currentResult = currentResult._1; // Acquire resource
                      break;

                    case Fork:
                      // Fork a new fiber
                      currentState = FIBER_STATE_ERROR;
                      var newFiber = createFiberRunner(eitherOps, logger, currentResult._2);
                      if (logger) {
                        logger.register(newFiber);
                      }
                      if (currentResult._1) {
                        newFiber.run();
                      }
                      currentResult = eitherOps.right(newFiber);
                      break;

                    case Sequential:
                      // Run a parallel computation sequentially
                      currentState = FIBER_STATE_RUNNING;
                      currentResult = runParallelComputation(eitherOps, logger, currentResult._1);
                      break;
                  }
                  break;

                case FIBER_STATE_COMPLETED:
                  // Fiber has completed, notify listeners
                  for (var key in currentListeners) {
                    if (currentListeners.hasOwnProperty(key)) {
                      shouldRethrow = shouldRethrow && currentListeners[key].rethrow;
                      throwAsync(currentListeners[key].handler(currentResult)); // Execute handler
                    }
                  }
                  currentListeners = null; // Clear listeners
                  // Rethrow if an error occurred and rethrow flag is true
                  if (currentError && shouldRethrow) {
                    throwAsync(eitherOps.fromLeft(currentError));
                  } else if (eitherOps.isLeft(currentResult) && shouldRethrow) {
                    throwAsync(eitherOps.fromLeft(currentResult));
                  }
                  return; // Exit fiber loop

                case FIBER_STATE_INITIAL:
                  currentState = FIBER_STATE_RUNNING;
                  break;

                case FIBER_STATE_ASYNC_WAIT:
                  return; // Fiber is paused, waiting for async completion
              }
            }
          }

          // Function to add a completion listener
          function addCompletionListener(listener) {
            return function() {
              if (currentState === FIBER_STATE_COMPLETED) {
                shouldRethrow = shouldRethrow && listener.rethrow;
                listener.handler(currentResult)(); // Run handler immediately if already completed
                return function() {}; // Return no-op canceller
              }
              var listenerId = callCount++;
              currentListeners = currentListeners || {};
              currentListeners[listenerId] = listener;
              return function() {
                if (currentListeners) {
                  delete currentListeners[listenerId];
                }
              };
            };
          }

          return {
            // Function to kill the fiber
            kill: function(killError, callback) {
              return function() {
                // If fiber already completed, run callback immediately
                if (currentState === FIBER_STATE_COMPLETED) {
                  return callback(eitherOps.right(undefined))();
                }

                // Add a temporary listener to ensure callback is called
                var tempCanceler = addCompletionListener({
                  rethrow: false,
                  handler: function() {
                    return callback(eitherOps.right(undefined));
                  }
                })();

                // Transition to error state immediately
                switch (currentState) {
                  case FIBER_STATE_INITIAL:
                    currentError = eitherOps.left(killError);
                    currentState = FIBER_STATE_COMPLETED;
                    currentResult = currentError;
                    runFiberStep(callCount); // Run to completion
                    break;
                  case FIBER_STATE_ASYNC_WAIT:
                    // If in async wait, set error and resume to unwind
                    if (bracketDepth === 0) { // If no pending brackets, we can terminate
                      currentState = FIBER_STATE_COMPLETED;
                      currentResult = null;
                      currentError = eitherOps.left(killError);
                      runFiberStep(++callCount);
                    } else {
                      // If brackets are pending, let them run their finalizers
                      currentError = eitherOps.left(killError);
                    }
                    break;
                  default:
                    // For other states, just set error, execution will naturally unwind
                    if (bracketDepth === 0) {
                      currentState = FIBER_STATE_COMPLETED;
                      currentResult = null;
                      currentError = eitherOps.left(killError);
                    } else {
                      currentError = eitherOps.left(killError);
                    }
                }
                return tempCanceler; // Return the canceller for the temporary listener
              };
            },
            // Function to join another fiber (wait for its completion)
            join: function(callback) {
              return function() {
                var tempCanceler = addCompletionListener({
                  rethrow: false,
                  handler: callback
                })();
                if (currentState === FIBER_STATE_INITIAL) {
                  runFiberStep(callCount); // Start if not running
                }
                return tempCanceler;
              };
            },
            onComplete: addCompletionListener,
            isSuspended: function() {
              return currentState === FIBER_STATE_INITIAL;
            },
            // Function to start or resume fiber execution
            run: function() {
              if (currentState === FIBER_STATE_INITIAL) {
                // If scheduler is draining, run immediately. Else, enqueue.
                if (scheduler.isDraining()) {
                  runFiberStep(callCount);
                } else {
                  scheduler.enqueue(function() {
                    runFiberStep(callCount);
                  });
                }
              }
            }
          };
        }

        // Parallel execution logic
        function runParallelComputation(eitherOps, supervisor, parallelComputation) {
          var fiberCounter = 0;
          var activeFibers = {};
          var completedCount = 0;
          var completionHandlers = {};
          var earlyExitError = new Error("[ParAff] Early exit due to kill");
          var finalResult = null;
          var eitherFactory = eitherOps;

          function cleanupFiber(fiberId, result) {
            return function() {
              delete activeFibers[fiberId];
              // Store result for later processing in the main fiber
              // (This part of the original logic is complex and involves
              // tracking results in the AffNode._3 property, which is
              // not directly translatable to simple JS without a similar AST walk)
              // For a Type III clone, we can simplify this to just propagate the result.
              // The original logic is for combining parallel results into a single Either.
              // For now, let's assume `finalResult` gets the combined value.
              // The original uses a complex `traverse` like pattern for combining results.
              // This is a simplification.
              if (eitherFactory.isLeft(result)) {
                finalResult = result; // Propagate first error
              } else if (!finalResult) {
                finalResult = result; // Store first success if no error
              }

              // The original code has a complex state machine for combining results
              // based on the Parallel AST nodes (ParMap, ParApply, ParAlt).
              // For a Type III clone, I will simplify this to a single combined result
              // or the first error.

              // If all fibers are done, call the stored completion handler
              completedCount++;
              if (completedCount === fiberCounter && completionHandlers[0]) {
                completionHandlers[0](finalResult)();
              }
            };
          }

          return function() {
            var currentParallelNode, currentParentNode, currentStack;
            var currentTag;
            var currentComputation = parallelComputation;
            var currentFibers = [];

            // Traverse the parallel computation AST to identify individual computations
            // and fork them. This is a simplified traversal.
            mainLoop: for (;;) {
              currentTag = currentComputation.tag;

              switch (currentTag) {
                case ParMap:
                  // Map over a parallel computation.
                  // The mapping function is applied when the inner computation resolves.
                  // We need to keep track of the mapping function.
                  // This is more complex than a simple fork.
                  // For simplicity, let's assume ParMap applies after the inner task.
                  currentComputation = currentComputation._2; // Go deeper into the computation
                  break;

                case ParApply:
                case ParAlt:
                  // These are binary operations. Fork both sides.
                  if (currentStack) {
                    currentParentNode = new AffNode(Cons, currentStack, currentParentNode);
                  }
                  currentStack = currentComputation; // Save current node
                  currentComputation = currentComputation._1; // Process left side first
                  break;

                default:
                  // Base case: a non-parallel computation. Fork it.
                  var fiberId = fiberCounter++;
                  var newFiber = createFiberRunner(eitherFactory, supervisor, currentComputation);
                  newFiber.onComplete({
                    rethrow: false,
                    handler: cleanupFiber(fiberId, newFiber)
                  })(); // Add cleanup handler
                  activeFibers[fiberId] = newFiber;
                  currentFibers.push(newFiber);

                  // If there's a parent node, process its right side
                  if (currentStack) {
                    currentComputation = currentStack._2; // Move to right side
                    currentStack = null; // Clear stack for this level
                  } else {
                    break mainLoop; // No more parallel nodes to process
                  }
              }
            }

            // Start all forked fibers
            for (let i = 0; i < currentFibers.length; i++) {
              currentFibers[i].run();
            }

            // Return a continuation for the main fiber to wait for all parallel tasks
            return new AffNode(Async, function(completionCallback) {
              return function() {
                // Store the completion callback. It will be called when all fibers are done.
                completionHandlers[0] = completionCallback;
                // If all fibers are already completed (e.g., synchronous tasks), call immediately
                if (completedCount === fiberCounter) {
                  completionCallback(finalResult)();
                }

                // Return a canceller for the entire parallel block
                return function(killReason) {
                  return new AffNode(Async, function(cancelCallback) {
                    return function() {
                      var outstandingKills = 0;
                      var killResults = {};

                      // Kill all active fibers
                      for (var id in activeFibers) {
                        if (activeFibers.hasOwnProperty(id)) {
                          outstandingKills++;
                          activeFibers[id].kill(killReason, function(fiberKillResult) {
                            return function() {
                              killResults[id] = fiberKillResult;
                              outstandingKills--;
                              if (outstandingKills === 0) {
                                cancelCallback(eitherFactory.right(undefined))(); // All killed
                              }
                            };
                          })();
                        }
                      }
                      activeFibers = {}; // Clear active fibers
                      fiberCounter = 0;
                      completedCount = 0;
                      return noCancellationOperation;
                    };
                  });
                };
              };
            });
          };
        }

        // Supervisor for managing child fibers
        var fiberSupervisor = function(eitherOps) {
          var children = {};
          var nextId = 0;
          var activeChildrenCount = 0;

          return {
            register: function(fiber) {
              var id = nextId++;
              fiber.onComplete({
                rethrow: true, // Children rethrow by default
                handler: function(result) {
                  return function() {
                    activeChildrenCount--;
                    delete children[id];
                  };
                }
              });
              children[id] = fiber;
              activeChildrenCount++;
            },
            isEmpty: function() {
              return activeChildrenCount === 0;
            },
            killAll: function(killReason, completionCallback) {
              return function() {
                var pendingKills = 0;
                var killResults = {}; // To store individual kill outcomes

                function handleChildKill(id) {
                  killResults[id] = children[id].kill(killReason, function(killRes) {
                    return function() {
                      delete killResults[id];
                      pendingKills--;
                      // If an error occurred during kill, log it (original behavior)
                      if (eitherOps.isLeft(killRes) && eitherOps.fromLeft(killRes)) {
                        setTimeout(function() {
                          throw eitherOps.fromLeft(killRes);
                        }, 0);
                      }
                      if (pendingKills === 0) {
                        completionCallback(); // All kills finished
                      }
                    };
                  })();
                }

                for (var childId in children) {
                  if (children.hasOwnProperty(childId)) {
                    pendingKills++;
                    handleChildKill(childId);
                  }
                }
                children = {}; // Reset children list
                nextId = 0;
                activeChildrenCount = 0;

                // Return a canceller for the killAll operation itself (if it's async)
                return new AffNode(Async, function() {
                  for (var id in killResults) {
                    if (killResults.hasOwnProperty(id)) {
                      killResults[id](); // Cancel individual kill operations
                    }
                  }
                });
              };
            }
          };
        };

        // Non-canceler: a computation that does nothing when cancelled
        var noCancellationOperation = createPureNode(undefined); // Represents Unit

        return {
          EMPTY: internalState, // Placeholder, not directly used in JS clone
          Pure: createTaggedConstructor(Pure),
          Throw: createTaggedConstructor(Throw),
          Catch: createTaggedConstructor(Catch),
          Sync: createTaggedConstructor(Sync),
          Async: createTaggedConstructor(Async),
          Bind: createTaggedConstructor(Bind),
          Bracket: createTaggedConstructor(Bracket),
          Fork: createTaggedConstructor(Fork),
          Seq: createTaggedConstructor(Sequential),
          ParMap: createTaggedConstructor(ParMap),
          ParApply: createTaggedConstructor(ParApply),
          ParAlt: createTaggedConstructor(ParAlt),
          Fiber: createFiberRunner,
          Supervisor: fiberSupervisor,
          Scheduler: scheduler,
          nonCanceler: noCancellationOperation
        };
      })();

      // Export core Aff operations
      affModule._pure = AffInternalTypes.Pure;
      affModule._map = function(mappingFunc) {
        return function(affComputation) {
          // Optimization: if it's a Pure value, apply function directly
          if (affComputation.tag === AffInternalTypes.Pure.tag) {
            return AffInternalTypes.Pure(mappingFunc(affComputation._1));
          }
          // Otherwise, use bind to apply the function
          return AffInternalTypes.Bind(affComputation, function(value) {
            return AffInternalTypes.Pure(mappingFunc(value));
          });
        };
      };
      affModule._bind = function(affComputation) {
        return function(bindFunc) {
          return AffInternalTypes.Bind(affComputation, bindFunc);
        };
      };
      affModule._liftEffect = AffInternalTypes.Sync;
      affModule._parAffMap = function(mappingFunc) {
        return function(parallelComp) {
          return AffInternalTypes.ParMap(mappingFunc, parallelComp);
        };
      };
      affModule._parAffApply = function(funcComp) {
        return function(valComp) {
          return AffInternalTypes.ParApply(funcComp, valComp);
        };
      };
      affModule.makeAff = AffInternalTypes.Async;
      affModule._makeFiber = function(eitherOps, affComputation) {
        return function() {
          return AffInternalTypes.Fiber(eitherOps, null, affComputation);
        };
      };
      affModule._sequential = AffInternalTypes.Seq;
    })(appModules["Effect.Aff"] = appModules["Effect.Aff"] || {});

    // --- Module: Effect.Exception ---
    (function(exceptionModule) {
      "use strict";
      // error: creates a new Error object
      exceptionModule.error = function(message) {
        return new Error(message);
      };
      // throwException: throws an exception in the Effect monad
      exceptionModule.throwException = function(exception) {
        return function() {
          throw exception;
        };
      };
    })(appModules["Effect.Exception"] = appModules["Effect.Exception"] || {});

    // --- Module: Effect.Exception (continued, export throw) ---
    (function(exceptionModule) {
      "use strict";
      var effectException = appModules["Effect.Exception"];
      // throw: throws an exception with a string message
      exceptionModule.throw = function(message) {
        return effectException.throwException(effectException.error(message));
      };
    })(appModules["Effect.Exception"] = appModules["Effect.Exception"] || {});

    // --- Module: Effect.Aff (continued, instances and exports) ---
    (function(affModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlApply = appModules["Control.Apply"];
      var controlBind = appModules["Control.Bind"];
      var controlMonad = appModules["Control.Monad"];
      var controlParallel = appModules["Control.Parallel"];
      var controlParallelClass = appModules["Control.Parallel.Class"];
      var dataEither = appModules["Data.Either"];
      var dataFoldable = appModules["Data.Foldable"];
      var dataFunction = appModules["Data.Function"];
      var dataFunctor = appModules["Data.Functor"];
      var dataMonoid = appModules["Data.Monoid"];
      var dataSemigroup = appModules["Data.Semigroup"];
      var dataUnit = appModules["Data.Unit"];
      var effectCore = appModules.Effect;
      var effectClass = appModules["Effect.Class"];
      var partialUnsafe = appModules["Partial.Unsafe"];
      var unsafeCoerce = appModules["Unsafe.Coerce"];
      var affInternal = appModules["Effect.Aff"]; // Reference to internal Aff definitions

      // Functor instance for Aff
      var affFunctorInstance = new dataFunctor.Functor(affInternal._map);
      // Functor instance for ParAff
      var parallelAffFunctorInstance = new dataFunctor.Functor(affInternal._parAffMap);

      // Either operations for Aff's internal use
      var affEitherOperations = {
        isLeft: function(eitherValue) {
          if (eitherValue instanceof dataEither.Left) {
            return true;
          }
          if (eitherValue instanceof dataEither.Right) {
            return false;
          }
          throw new Error("Failed pattern match for Aff internal eitherOps.isLeft: " + [eitherValue.constructor.name]);
        },
        fromLeft: function(eitherValue) {
          if (eitherValue instanceof dataEither.Left) {
            return eitherValue.value0;
          }
          if (eitherValue instanceof dataEither.Right) {
            return partialUnsafe.unsafeCrashWith("unsafeFromLeft: Right");
          }
          throw new Error("Failed pattern match for Aff internal eitherOps.fromLeft: " + [eitherValue.constructor.name]);
        },
        fromRight: function(eitherValue) {
          if (eitherValue instanceof dataEither.Right) {
            return eitherValue.value0;
          }
          if (eitherValue instanceof dataEither.Left) {
            return partialUnsafe.unsafeCrashWith("unsafeFromRight: Left");
          }
          throw new Error("Failed pattern match for Aff internal eitherOps.fromRight: " + [eitherValue.constructor.name]);
        },
        left: dataEither.Left.create,
        right: dataEither.Right.create
      };

      // launchAff: runs an Aff computation, returning a Fiber
      var launchAffComputation = function(affComputation) {
        return function() {
          var fiber = affInternal._makeFiber(affEitherOperations, affComputation)();
          fiber.run(); // Start the fiber
          return fiber;
        };
      };

      // Apply instance for ParAff
      var parallelAffApplyInstance = new controlApply.Apply(function() {
        return parallelAffFunctorInstance;
      }, affInternal._parAffApply);

      // Monad instance for Aff
      var affMonadInstance = new controlMonad.Monad(function() {
        return affApplicativeInstance;
      }, function() {
        return affBindInstance;
      });

      // Bind instance for Aff
      var affBindInstance = new controlBind.Bind(function() {
        return affApplyInstance;
      }, affInternal._bind);

      // Apply instance for Aff
      var affApplyInstance = new controlApply.Apply(function() {
        return affFunctorInstance;
      }, controlMonad.ap(affMonadInstance));

      // Applicative instance for Aff
      var affApplicativeInstance = new controlApplicative.Applicative(function() {
        return affApplyInstance;
      }, affInternal._pure);

      // MonadEffect instance for Aff
      var affMonadEffectInstance = new effectClass.MonadEffect(function() {
        return affMonadInstance;
      }, affInternal._liftEffect);

      // Parallel instance for Aff/ParAff
      var affParallelInstance = new controlParallelClass.Parallel(
        function() {
          return parallelAffApplicativeInstance;
        }, // Applicative for ParAff
        function() {
          return affMonadInstance;
        }, // Monad for Aff
        unsafeCoerce.unsafeCoerce, // parallel: Aff -> ParAff (unsafe cast)
        affInternal._sequential // sequential: ParAff -> Aff
      );

      // Applicative instance for ParAff (uses parallelAffApplyInstance)
      var parallelAffApplicativeInstance = new controlApplicative.Applicative(function() {
        return parallelAffApplyInstance;
      }, function(value) {
        return controlParallelClass.parallel(affParallelInstance)(controlApplicative.pure(affApplicativeInstance)(value));
      });

      // Semigroup instance for Canceler (combines cancelers)
      var cancelerSemigroup = new dataSemigroup.Semigroup(function(cancelerA) {
        return function(cancelerB) {
          return function(errorValue) {
            return controlParallel.parSequence_(affParallelInstance)(dataFoldable.foldableArray)([cancelerA(errorValue), cancelerB(errorValue)]);
          };
        };
      });

      // nonCanceler: a canceler that does nothing
      var noCancellationOperation = dataFunction.const(controlApplicative.pure(affApplicativeInstance)(dataUnit.unit));

      // Monoid instance for Canceler
      var cancelerMonoid = new dataMonoid.Monoid(function() {
        return cancelerSemigroup;
      }, noCancellationOperation);

      // Export Aff related functions and instances
      affModule.launchAff = launchAffComputation;
      affModule.launchAff_ = function(affComputation) {
        return dataFunctor.void(effectCore.functorEffect)(launchAffComputation(affComputation));
      };
      affModule.nonCanceler = noCancellationOperation;
      affModule.functorAff = affFunctorInstance;
      affModule.applyAff = affApplyInstance;
      affModule.applicativeAff = affApplicativeInstance;
      affModule.bindAff = affBindInstance;
      affModule.monadAff = affMonadInstance;
      affModule.monadEffectAff = affMonadEffectInstance;
      affModule.functorParAff = parallelAffFunctorInstance;
      affModule.applyParAff = parallelAffApplyInstance;
      affModule.applicativeParAff = parallelAffApplicativeInstance;
      affModule.parallelAff = affParallelInstance;
      affModule.semigroupCanceler = cancelerSemigroup;
      affModule.monoidCanceler = cancelerMonoid;
      affModule.makeAff = affInternal.makeAff;
    })(appModules["Effect.Aff"] = appModules["Effect.Aff"] || {});

    // --- Module: Node.Encoding ---
    (function(encodingModule) {
      "use strict";
      var dataShow = appModules["Data.Show"];
      // Define encoding types
      var asciiEncoding = (function() {
        function ASCII() {}
        ASCII.value = new ASCII();
        return ASCII;
      })();
      var utf8Encoding = (function() {
        function UTF8() {}
        UTF8.value = new UTF8();
        return UTF8;
      })();
      var utf16leEncoding = (function() {
        function UTF16LE() {}
        UTF16LE.value = new UTF16LE();
        return UTF16LE;
      })();
      var ucs2Encoding = (function() {
        function UCS2() {}
        UCS2.value = new UCS2();
        return UCS2;
      })();
      var base64Encoding = (function() {
        function Base64() {}
        Base64.value = new Base64();
        return Base64;
      })();
      var latin1Encoding = (function() {
        function Latin1() {}
        Latin1.value = new Latin1();
        return Latin1;
      })();
      var binaryEncoding = (function() {
        function Binary() {}
        Binary.value = new Binary();
        return Binary;
      })();
      var hexEncoding = (function() {
        function Hex() {}
        Hex.value = new Hex();
        return Hex;
      })();

      // Show instance for Encoding
      var encodingShowInstance = new dataShow.Show(function(encoding) {
        if (encoding instanceof asciiEncoding) {
          return "ASCII";
        }
        if (encoding instanceof utf8Encoding) {
          return "UTF8";
        }
        if (encoding instanceof utf16leEncoding) {
          return "UTF16LE";
        }
        if (encoding instanceof ucs2Encoding) {
          return "UCS2";
        }
        if (encoding instanceof base64Encoding) {
          return "Base64";
        }
        if (encoding instanceof latin1Encoding) {
          return "Latin1";
        }
        if (encoding instanceof binaryEncoding) {
          return "Binary";
        }
        if (encoding instanceof hexEncoding) {
          return "Hex";
        }
        throw new Error("Failed pattern match for Node.Encoding.showEncoding: " + [encoding.constructor.name]);
      });

      // Export encoding types and conversion to Node.js string
      encodingModule.ASCII = asciiEncoding;
      encodingModule.UTF8 = utf8Encoding;
      encodingModule.UTF16LE = utf16leEncoding;
      encodingModule.UCS2 = ucs2Encoding;
      encodingModule.Base64 = base64Encoding;
      encodingModule.Latin1 = latin1Encoding;
      encodingModule.Binary = binaryEncoding;
      encodingModule.Hex = hexEncoding;
      encodingModule.encodingToNode = function(encoding) {
        if (encoding instanceof asciiEncoding) {
          return "ascii";
        }
        if (encoding instanceof utf8Encoding) {
          return "utf8";
        }
        if (encoding instanceof utf16leEncoding) {
          return "utf16le";
        }
        if (encoding instanceof ucs2Encoding) {
          return "ucs2";
        }
        if (encoding instanceof base64Encoding) {
          return "base64";
        }
        if (encoding instanceof latin1Encoding) {
          return "latin1";
        }
        if (encoding instanceof binaryEncoding) {
          return "binary";
        }
        if (encoding instanceof hexEncoding) {
          return "hex";
        }
        throw new Error("Failed pattern match for Node.Encoding.encodingToNode: " + [encoding.constructor.name]);
      };
      encodingModule.showEncoding = encodingShowInstance;
    })(appModules["Node.Encoding"] = appModules["Node.Encoding"] || {});

    // --- Module: Node.Process ---
    (function(processModule) {
      "use strict";
      // Expose the global process object (Node.js specific)
      (appModules["Node.Process"] = appModules["Node.Process"] || {}).process = process;
    })();

    // --- Module: Node.Stream ---
    (function(streamModule) {
      "use strict";
      // readChunkImpl: internal helper to read a chunk from a stream
      streamModule.readChunkImpl = function(onString) {
        return function(onBuffer) {
          return function(chunk) {
            if (chunk instanceof Buffer) {
              return onBuffer(chunk);
            }
            if (typeof chunk === "string") {
              return onString(chunk);
            }
            throw new Error("Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + chunk);
          };
        };
      };
      // onDataEitherImpl: internal helper to register a 'data' event listener
      streamModule.onDataEitherImpl = function(processChunk) {
        return function(stream) {
          return function(callback) {
            return function() {
              stream.on("data", function(chunk) {
                callback(processChunk(chunk))();
              });
            };
          };
        };
      };
      // onEnd: registers an 'end' event listener
      streamModule.onEnd = function(stream) {
        return function(callback) {
          return function() {
            stream.on("end", callback);
          };
        };
      };
      // write: writes a buffer or string to a stream
      streamModule.write = function(stream) {
        return function(data) {
          return function(callback) {
            return function() {
              return stream.write(data, null, callback);
            };
          };
        };
      };
      // writeStringImpl: internal helper to write a string with encoding
      streamModule.writeStringImpl = function(stream) {
        return function(encoding) {
          return function(data) {
            return function(callback) {
              return function() {
                return stream.write(data, encoding, callback);
              };
            };
          };
        };
      };
    })(appModules["Node.Stream"] = appModules["Node.Stream"] || {});

    // --- Module: Node.Buffer ---
    (function(bufferModule) {
      "use strict";
      // toStringImpl: internal helper to convert a Buffer to a string with encoding
      (appModules["Node.Buffer"] = appModules["Node.Buffer"] || {}).toStringImpl = function(encoding) {
        return function(buffer) {
          return function() {
            return buffer.toString(encoding);
          };
        };
      };
    })();

    // --- Module: Node.Buffer (continued, export toString) ---
    (function(bufferModule) {
      "use strict";
      var nodeBuffer = appModules["Node.Buffer"];
      var nodeEncoding = appModules["Node.Encoding"];
      // toString: converts a Buffer to a string using a specified encoding
      bufferModule.toString = function(encoding) {
        return nodeBuffer.toStringImpl(nodeEncoding.encodingToNode(encoding));
      };
    })(appModules["Node.Buffer"] = appModules["Node.Buffer"] || {});

    // --- Module: Node.Stream (continued, export onData, writeString, etc.) ---
    (function(streamModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlBind = appModules["Control.Bind"];
      var dataEither = appModules["Data.Either"];
      var dataShow = appModules["Data.Show"];
      var effectCore = appModules.Effect;
      var effectException = appModules["Effect.Exception"];
      var nodeBuffer = appModules["Node.Buffer"];
      var nodeEncoding = appModules["Node.Encoding"];
      var nodeStream = appModules["Node.Stream"];

      // chunkReader: processes a raw stream chunk into an Either String Buffer
      var chunkReader = nodeStream.readChunkImpl(dataEither.Left.create)(dataEither.Right.create);

      // dataProcessorEither: registers a 'data' event listener, processing chunks into Either
      var dataProcessorEither = function(stream) {
        return function(callback) {
          return nodeStream.onDataEitherImpl(chunkReader)(stream)(callback);
        };
      };

      // dataProcessor: registers a 'data' event listener, assuming a specific encoding
      var dataProcessor = function(stream) {
        return function(callback) {
          return dataProcessorEither(stream)(controlBind.composeKleisliFlipped(effectCore.bindEffect)(callback)(function(eitherChunk) {
            if (eitherChunk instanceof dataEither.Left) {
              // If Left (string), means encoding was not set, so it's a string chunk.
              // The original code implies this is an error, so we throw.
              return effectException.throw("Stream encoding should not be set for raw string chunks");
            }
            if (eitherChunk instanceof dataEither.Right) {
              return controlApplicative.pure(effectCore.applicativeEffect)(eitherChunk.value0);
            }
            throw new Error("Failed pattern match in Node.Stream.onData: " + [eitherChunk.constructor.name]);
          }));
        };
      };

      // Export stream functions
      streamModule.onData = dataProcessor;
      streamModule.onDataString = function(stream) {
        return function(encoding) {
          return function(callback) {
            return dataProcessor(stream)(controlBind.composeKleisliFlipped(effectCore.bindEffect)(callback)(nodeBuffer.toString(encoding)));
          };
        };
      };
      streamModule.onDataEither = dataProcessorEither;
      streamModule.writeString = function(stream) {
        return function(encoding) {
          return nodeStream.writeStringImpl(stream)(dataShow.show(nodeEncoding.showEncoding)(encoding));
        };
      };
      streamModule.onEnd = nodeStream.onEnd;
    })(appModules["Node.Stream"] = appModules["Node.Stream"] || {});

    // --- Module: Node.Process (continued, export stdin, stdout) ---
    (function(processModule) {
      "use strict";
      var nodeProcess = appModules["Node.Process"];
      // Export standard input and output streams
      var stdOutStream = nodeProcess.process.stdout;
      var stdInStream = nodeProcess.process.stdin;
      processModule.stdin = stdInStream;
      processModule.stdout = stdOutStream;
    })(appModules["Node.Process"] = appModules["Node.Process"] || {});


    // --- DIVERTA2019C: Main application logic ---
    (function(divertaModule) {
      "use strict";
      var controlApplicative = appModules["Control.Applicative"];
      var controlBind = appModules["Control.Bind"];
      var controlCategory = appModules["Control.Category"];
      var controlMonadRec = appModules["Control.Monad.Rec.Class"];
      var dataArray = appModules["Data.Array"];
      var dataEither = appModules["Data.Either"];
      var dataInt = appModules["Data.Int"];
      var dataMaybe = appModules["Data.Maybe"];
      var dataMonoid = appModules["Data.Monoid"];
      var dataOrd = appModules["Data.Ord"];
      var dataShow = appModules["Data.Show"];
      var stringCodeUnits = appModules["Data.String.CodeUnits"];
      var stringCommon = appModules["Data.String.Common"];
      var dataUnit = appModules["Data.Unit"];
      var effectCore = appModules.Effect;
      var effectAff = appModules["Effect.Aff"];
      var effectClass = appModules["Effect.Class"];
      var effectRef = appModules["Effect.Ref"];
      var nodeEncoding = appModules["Node.Encoding"];
      var nodeProcess = appModules["Node.Process"];
      var nodeStream = appModules["Node.Stream"];
      var partialUnsafe = appModules["Partial.Unsafe"];

      /**
       * Core logic to analyze input strings and compute the final count.
       * This function takes a multi-line string input, processes each line,
       * and returns the result as a string.
       * @param {string} rawInputString - The complete input string from stdin.
       * @returns {string} The computed result as a string, followed by a newline.
       */
      var analyzeInputAndCalculate = function(rawInputString) {
        // Helper to crash if an Either Left value is encountered
        var handleEitherError = function(errorMessage) {
          return partialUnsafe.unsafeCrashWith(errorMessage);
        };
        // Identity function for Either Right values
        var identityEitherRight = controlBind.bind(dataEither.bindEither)(dataEither.Right.create)(controlCategory.identity(controlCategory.categoryFn));

        // Trim whitespace and split the input into individual lines
        var cleanedLines = stringCommon.split("\n")(stringCommon.trim(rawInputString));

        // The first line is 'N' (number of lines), but it's not used in the calculation,
        // so we can directly process the rest of the lines.
        // We'll skip `dataArray.uncons` and `dataInt.fromString` for 'N' as it's unused.
        var dataLines = cleanedLines.slice(1); // Get all lines except the first one (N)

        // Initial state for the aggregation loop
        var processingState = {
          currentIndex: 0,
          currentTotalABCount: 0,
          currentEndsWithAOnlyCount: 0,
          currentStartsWithBOnlyCount: 0,
          currentStartsBAndEndsACount: 0
        };

        // Use a standard for loop instead of PureScript's tailRec for better JS idiom.
        // This loop iterates through each data line to accumulate counts.
        for (let lineIndex = 0; lineIndex < dataLines.length; lineIndex++) {
          const currentLine = dataLines[lineIndex];

          // Count 'AB' occurrences in the current line
          // `split('AB').length - 1` gives non-overlapping occurrences.
          const lineABCount = currentLine.split("AB").length - 1;

          // Check if the line starts with 'B'
          const startsWithB = currentLine.startsWith("B");
          // Check if the line ends with 'A'
          const endsWithA = currentLine.endsWith("A");
          // Check if the line starts with 'B' AND ends with 'A'
          const startsBAndEndsA = startsWithB && endsWithA;

          // Update counts based on line characteristics
          processingState.currentTotalABCount += lineABCount;
          processingState.currentEndsWithAOnlyCount += (!startsBAndEndsA && endsWithA) ? 1 : 0; // Ends with A, but NOT B...A
          processingState.currentStartsWithBOnlyCount += (!startsBAndEndsA && startsWithB) ? 1 : 0; // Starts with B, but NOT B...A
          processingState.currentStartsBAndEndsACount += startsBAndEndsA ? 1 : 0;
        }

        // Final calculation of the total 'AB' pairs
        let finalABCount = processingState.currentTotalABCount;
        let numEndsA = processingState.currentEndsWithAOnlyCount;
        let numStartsB = processingState.currentStartsWithBOnlyCount;
        let numStartsBAndEndsA = processingState.currentStartsBAndEndsACount;

        // Add pairs formed by connecting lines ending with 'A' and starting with 'B'
        finalABCount += Math.min(numEndsA, numStartsB);

        // Add pairs formed by connecting 'B...A' strings
        // If we have K strings like B...A, we can form K-1 new 'AB's by concatenating them.
        finalABCount += Math.max(0, numStartsBAndEndsA - 1);

        // Special case: if there are 'B...A' strings, and we have an imbalance
        // between '...A' and 'B...' strings, we can form one more 'AB'.
        // This happens if we have a B...A string, AND
        // (number of ...A strings != number of B... strings)
        if (numStartsBAndEndsA > 0 && numEndsA !== numStartsB) {
          finalABCount += 1;
        }

        // Return the result formatted as a string with a newline
        return dataShow.show(dataShow.showInt)(finalABCount) + "\n";
      };

      /**
       * The main Aff computation that orchestrates reading input, solving, and writing output.
       * It's wrapped in an Effect.Aff monad.
       */
      var mainDataProcessingTask = effectAff.makeAff(function(callbackFunc) {
        return function() {
          // Create a mutable reference to store input data
          var inputBufferRef = effectRef.new("")();

          // Set up data listener for stdin
          nodeStream.onDataString(nodeProcess.stdin)(nodeEncoding.UTF8.value)(function(chunk) {
            return function() {
              var currentBuffer = effectRef.read(inputBufferRef)();
              return effectRef.write(currentBuffer + chunk)(inputBufferRef)();
            };
          })();

          // Set up end listener for stdin
          nodeStream.onEnd(nodeProcess.stdin)(function() {
            var finalInput = effectRef.read(inputBufferRef)();
            // Call the Aff callback with the final input string wrapped in Either.Right
            return callbackFunc(dataEither.Right.create(finalInput))();
          })();

          // Return a non-canceler (this Aff computation cannot be cancelled)
          return dataMonoid.mempty(effectAff.monoidCanceler);
        };
      });

      /**
       * Executes the main data processing task.
       * This uses the Effect.Aff runtime to run the computation.
       */
      var executeMainTask = effectAff.launchAff_(
        controlBind.bind(effectAff.bindAff)(mainDataProcessingTask)(function(rawInput) {
          // After getting the raw input, process it with the `solve` function
          return controlBind.bind(effectAff.bindAff)(
            controlApplicative.pure(effectAff.applicativeAff)(analyzeInputAndCalculate(rawInput))
          )(function(resultString) {
            // Once the result is calculated, lift the effect to write to stdout
            return effectClass.liftEffect(effectAff.monadEffectAff)(
              dataFunctor.void(effectCore.functorEffect)(
                nodeStream.writeString(nodeProcess.stdout)(nodeEncoding.UTF8.value)(resultString)(
                  controlApplicative.pure(effectCore.applicativeEffect)(dataUnit.unit)
                )
              )
            );
          });
        })
      );

      // Export the main function and solve function for external use
      divertaModule.main = executeMainTask;
      divertaModule.solve = analyzeInputAndCalculate;

    })(appModules.DIVERTA2019C = appModules.DIVERTA2019C || {});

    // Immediately execute the main application logic when the module loads
    appModules.DIVERTA2019C.main();

  }, {}]
}, {}, ["Focm"], null);