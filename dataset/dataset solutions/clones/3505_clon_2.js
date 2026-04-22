// This is a custom module loader, designed to manage dependencies and execution flow
// within a bundled JavaScript application. It mimics the behavior of module bundlers
// like Parcel.
const customModuleLoader = (
  allModuleDefs,    // An object containing all defined modules, keyed by their unique IDs.
  loadedModuleCache, // A cache to store modules that have already been loaded and executed.
  entryModuleIDs,   // An array of module IDs that serve as entry points for the application.
  globalExportVar   // An optional string name under which the main export will be exposed globally.
) => {
  let firstExecutionError; // Variable to store the first error encountered during entry point processing.
  const globalLoaderRef = typeof customModuleLoader === "function" && customModuleLoader; // Reference to itself if globally available.
  const nodeNativeRequester = typeof require === "function" && require; // Reference to Node.js's native `require` function.

  /**
   * Core function to retrieve and execute a module.
   * @param {string} moduleIdentifier - The unique ID of the module to load.
   * @param {boolean} isParentRequest - Flag indicating if this is a request from a parent loader.
   * @returns {*} The exports of the requested module.
   */
  function fetchAndExecuteModule(moduleIdentifier, isParentRequest) {
    // If the module is already in the cache, return its exports immediately.
    if (loadedModuleCache[moduleIdentifier]) {
      return loadedModuleCache[moduleIdentifier].exports;
    }

    // If the module definition is not found, attempt to resolve it via parent loaders or Node.js's `require`.
    if (!allModuleDefs[moduleIdentifier]) {
      const parentModuleLoader = typeof customModuleLoader === "function" && customModuleLoader;
      if (!isParentRequest && parentModuleLoader) {
        return parentModuleLoader(moduleIdentifier, true);
      }
      if (globalLoaderRef) {
        return globalLoaderRef(moduleIdentifier, true);
      }
      if (nodeNativeRequester && typeof moduleIdentifier === "string") {
        return nodeNativeRequester(moduleIdentifier);
      }
      // If all attempts fail, throw a module not found error.
      const lookupError = new Error("Unable to locate module with ID: '" + moduleIdentifier + "'");
      throw ((lookupError.code = "MODULE_NOT_FOUND"), lookupError);
    }

    // Prepare a resolver for internal module paths, allowing modules to reference bundled assets.
    localModuleRequester.resolve = (relativeRef) => {
      return allModuleDefs[moduleIdentifier][1][relativeRef] || relativeRef;
    };
    localModuleRequester.cache = {}; // Placeholder for internal request cache (unused in this version).

    // Create a new module instance, store it in the cache, and execute its definition.
    const currentModuleInstance = (loadedModuleCache[moduleIdentifier] = new fetchAndExecuteModule.Module(moduleIdentifier));
    allModuleDefs[moduleIdentifier][0].call(
      currentModuleInstance.exports,
      localModuleRequester,
      currentModuleInstance,
      currentModuleInstance.exports,
      this
    );

    return loadedModuleCache[moduleIdentifier].exports;

    /**
     * Internal `require`-like function for modules within this bundle.
     * @param {string} requestedPath - The path or ID of the module to request.
     * @returns {*} The exports of the requested module.
     */
    function localModuleRequester(requestedPath) {
      return fetchAndExecuteModule(localModuleRequester.resolve(requestedPath));
    }
  }

  // Mark this function as a Parcel-style module loader.
  fetchAndExecuteModule.isParcelRequire = true;
  // Define the constructor for module instances.
  fetchAndExecuteModule.Module = function(id) {
    this.id = id;
    this.bundle = fetchAndExecuteModule;
    this.exports = {};
  };
  // Expose internal data structures.
  fetchAndExecuteModule.moduleDefinitions = allModuleDefs;
  fetchAndExecuteModule.moduleCache = loadedModuleCache;
  fetchAndExecuteModule.parent = globalLoaderRef;
  // Provide a method to dynamically register new module definitions.
  fetchAndExecuteModule.register = (id, moduleContent) => {
    allModuleDefs[id] = [
      (exports, module) => {
        module.exports = moduleContent;
      },
      {},
    ];
  };

  // Process and execute all specified entry point modules.
  for (let idx = 0; idx < entryModuleIDs.length; idx++) {
    try {
      fetchAndExecuteModule(entryModuleIDs[idx]);
    } catch (err) {
      // Capture the first error encountered, but continue processing other entries.
      firstExecutionError = firstExecutionError || err;
    }
  }

  // If entry points were provided, determine the main export.
  if (entryModuleIDs.length) {
    const finalExport = fetchAndExecuteModule(entryModuleIDs[entryModuleIDs.length - 1]);
    // Handle different export environments (CommonJS, AMD, global).
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = finalExport;
    } else if (typeof define === "function" && define.amd) {
      define(() => finalExport);
    } else if (globalExportVar) {
      this[globalExportVar] = finalExport;
    }
  }

  // If any error occurred during entry point execution, re-throw it.
  if (firstExecutionError) {
    throw firstExecutionError;
  }

  // Return the main module loading function.
  return fetchAndExecuteModule;
}(
  {
    // --- BEGIN MODULE DEFINITIONS ---
    "ApplicationRoot": [
      function(requestDependency, currentModuleInstance, moduleExports) {
        // This object holds all the exports for sub-modules within this bundle.
        const internalExportMap = {};

        // Module: Core.Associative
        ((exportedItems) => {
          "use strict";

          // Defines a constructor for objects that support an associative binary operation.
          const CompositionConstructor = function(operation) {
            this.compositionOperation = operation;
          };
          // An instance of CompositionConstructor specifically for function composition.
          const functionCompositionInstance = new CompositionConstructor((firstFn) => {
            return (secondFn) => {
              return (inputArgument) => {
                return firstFn(secondFn(inputArgument));
              };
            };
          });
          // Exporting the constructor and its instance.
          exportedItems.getComposition = (instance) => instance.compositionOperation;
          exportedItems.CompositionType = CompositionConstructor;
          exportedItems.functionComposition = functionCompositionInstance;
        })(
          (internalExportMap["Core.Associative"] =
            internalExportMap["Core.Associative"] || {})
        );

        // Module: Core.Categorization
        ((exportedItems) => {
          "use strict";

          const associativeDependency = requestDependency("Core.Associative");
          // Defines a constructor for categories, requiring an associative operation and an identity element.
          const CategoryConstructor = function(baseAssociative, identityFunc) {
            this.BaseAssociative = baseAssociative;
            this.identityElement = identityFunc;
          };
          // An instance of CategoryConstructor for functions, where identity is the identity function.
          const functionCategoryInstance = new CategoryConstructor(
            () => associativeDependency.functionComposition,
            (value) => value
          );
          // Exporting the constructor and its instance.
          exportedItems.CategoryType = CategoryConstructor;
          exportedItems.getIdentityElement = (instance) => instance.identityElement;
          exportedItems.functionCategory = functionCategoryInstance;
        })(
          (internalExportMap["Core.Categorization"] =
            internalExportMap["Core.Categorization"] || {})
        );

        // Module: Data.FuncTools
        ((exportedItems) => {
          "use strict";

          // Placeholder dependencies, not directly used in this module's logic.
          requestDependency("Core.Categorization");
          requestDependency("Data.Boolean");
          requestDependency("Data.Ordering");
          requestDependency("Data.SemiRing");

          // Function to reverse the order of the first two arguments of a curried function.
          exportedItems.reverseArguments = (originalFunc) => {
            return (argA) => {
              return (argB) => {
                return originalFunc(argB)(argA);
              };
            };
          };
          // Function that always returns a constant value, ignoring its argument.
          exportedItems.constantFunction = (fixedValue) => {
            return (ignoredArg) => {
              return fixedValue;
            };
          };
        })(
          (internalExportMap["Data.FuncTools"] =
            internalExportMap["Data.FuncTools"] || {})
        );

        // Module: Data.Mapper
        ((exportedItems) => {
          "use strict";

          // Array mapping utility.
          (exportedItems["Data.Mapper"] = exportedItems["Data.Mapper"] || {}).arrayTransformation = (
            transformationFn
          ) => {
            return (inputCollection) => {
              const collectionLength = inputCollection.length;
              const outputCollection = new Array(collectionLength);
              for (let index = 0; index < collectionLength; index++) {
                outputCollection[index] = transformationFn(inputCollection[index]);
              }
              return outputCollection;
            };
          };
        })(); // Self-invoking for Data.Mapper

        // Module: Data.Singleton
        ((exportedItems) => {
          "use strict";

          // A simple, unique unit value, often used as a placeholder.
          (exportedItems["Data.Singleton"] = exportedItems["Data.Singleton"] || {}).singleUnit = {};
        })(); // Self-invoking for Data.Singleton

        // Module: Data.Display
        ((exportedItems) => {
          "use strict";

          // Implementation for displaying integers as strings.
          (exportedItems["Data.Display"] = exportedItems["Data.Display"] || {}).integerToStringImpl = (
            numberToDisplay
          ) => {
            return numberToDisplay.toString();
          };
        })(); // Self-invoking for Data.Display

        // Module: Data.Display (extension)
        ((exportedItems) => {
          "use strict";

          const displayDependency = requestDependency("Data.Display");
          // Additional dependencies, not directly used in this code block.
          requestDependency("Data.Symbol");
          requestDependency("Record.Unchecked");
          requestDependency("Type.Data.RowList");

          // Constructor for types that can be converted to a string representation.
          const DisplayConstructor = function(displayMethod) {
            this.displayMethod = displayMethod;
          };
          // An instance for displaying integers.
          const integerDisplayInstance = new DisplayConstructor(displayDependency.integerToStringImpl);
          // Exporting the constructor and its instance.
          exportedItems.DisplayType = DisplayConstructor;
          exportedItems.callDisplayMethod = (instance) => instance.displayMethod;
          exportedItems.integerDisplay = integerDisplayInstance;
        })(
          (internalExportMap["Data.Display"] =
            internalExportMap["Data.Display"] || {})
        );

        // Module: Data.Singleton (extension)
        ((exportedItems) => {
          "use strict";

          const singletonDependency = requestDependency("Data.Singleton");
          requestDependency("Data.Display"); // Dependency, not directly used.
          // Re-exporting the single unit value.
          exportedItems.unit = singletonDependency.singleUnit;
        })(
          (internalExportMap["Data.Singleton"] =
            internalExportMap["Data.Singleton"] || {})
        );

        // Module: Data.Mapper (extension)
        ((exportedItems) => {
          "use strict";

          const mapperDependency = requestDependency("Data.Mapper");
          // Dependencies for context.
          requestDependency("Core.Associative");
          const funcToolsDependency = requestDependency("Data.FuncTools");
          const singletonDependency = requestDependency("Data.Singleton");

          // Constructor for a Functor, which defines a 'map' operation.
          const MapperConstructor = function(mapOperation) {
            this.mapOperation = mapOperation;
          };
          // Helper to get the map function from an instance.
          const getMapFunction = (instance) => instance.mapOperation;
          // An instance of MapperConstructor for arrays.
          const arrayMapperInstance = new MapperConstructor(mapperDependency.arrayTransformation);

          // Exporting the constructor and related utilities.
          exportedItems.MapperType = MapperConstructor;
          exportedItems.getMapFunction = getMapFunction;
          exportedItems.voidMapping = (mapperInstance) => {
            return getMapFunction(mapperInstance)(funcToolsDependency.constantFunction(singletonDependency.unit));
          };
          exportedItems.arrayMapper = arrayMapperInstance;
        })(
          (internalExportMap["Data.Mapper"] =
            internalExportMap["Data.Mapper"] || {})
        );

        // Module: Core.Application
        ((exportedItems) => {
          "use strict";

          const applicationDependency = requestDependency("Core.Application"); // Self-dependency for `applySecond`.
          const categoryDependency = requestDependency("Core.Categorization");
          const funcToolsDependency = requestDependency("Data.FuncTools");
          const mapperDependency = requestDependency("Data.Mapper");

          // Helper to get the `apply` function from an instance.
          const getApplyFunction = (instance) => instance.applyFunction;

          // Constructor for an Apply type class, providing an `apply` operation.
          exportedItems.ApplicationConstructor = function(baseMapper, applyFn) {
            this.BaseMapper = baseMapper;
            this.applyFunction = applyFn;
          };
          exportedItems.getApplyFunction = getApplyFunction;
          // `applySecond` applies the second argument, discarding the result of the first.
          exportedItems.applySecond = (applicationInstance) => {
            return (firstContainer) => {
              return (secondContainer) => {
                return getApplyFunction(applicationInstance)(
                  mapperDependency.getMapFunction(applicationInstance.BaseMapper())(
                    funcToolsDependency.constantFunction(categoryDependency.getIdentityElement(categoryDependency.functionCategory))
                  )(firstContainer)
                )(secondContainer);
              };
            };
          };
        })(
          (internalExportMap["Core.Application"] =
            internalExportMap["Core.Application"] || {})
        );

        // Module: Core.ApplicativeOps
        ((exportedItems) => {
          "use strict";

          const applicationDependency = requestDependency("Core.Application");
          // Dependencies, not directly used here.
          requestDependency("Data.Mapper");
          requestDependency("Data.Singleton");

          // Helper to get the `pure` function from an instance.
          const getPureFunction = (instance) => instance.pureFunction;

          // Constructor for an Applicative type class, providing `pure` and `apply`.
          exportedItems.ApplicativeConstructor = function(baseApplicator, pureFn) {
            this.BaseApplicator = baseApplicator;
            this.pureFunction = pureFn;
          };
          exportedItems.getPureFunction = getPureFunction;
          // `liftOne` lifts a regular function into the Applicative context.
          exportedItems.liftOne = (applicativeInstance) => {
            return (transformFn) => {
              return (valueContainer) => {
                return applicationDependency.getApplyFunction(applicativeInstance.BaseApplicator())(
                  getPureFunction(applicativeInstance)(transformFn)
                )(valueContainer);
              };
            };
          };
        })(
          (internalExportMap["Core.ApplicativeOps"] =
            internalExportMap["Core.ApplicativeOps"] || {})
        );

        // Module: Core.Binding
        ((exportedItems) => {
          "use strict";

          // Dependencies for context.
          requestDependency("Core.Binding"); // Self-dependency for `composeKleisliFlipped`.
          requestDependency("Core.ApplicativeOps");
          requestDependency("Core.Application");
          requestDependency("Core.Categorization");

          const funcToolsDependency = requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Data.Singleton");

          // Helper to get the `bind` function from an instance.
          const getBindFunction = (instance) => instance.bindFunction;

          // Constructor for a Bind type class, providing a `bind` operation.
          exportedItems.BindConstructor = function(baseApplicator, bindFn) {
            this.BaseApplicator = baseApplicator;
            this.bindFunction = bindFn;
          };
          exportedItems.getBindFunction = getBindFunction;
          // `bindFlipped` is a `bind` operation with arguments flipped.
          exportedItems.bindFlipped = (bindInstance) => {
            return funcToolsDependency.reverseArguments(getBindFunction(bindInstance));
          };
          // `composeKleisliFlipped` composes two Kleisli arrows (functions returning monadic values) in a flipped order.
          exportedItems.composeKleisliFlipped = (bindInstance) => {
            return (firstKleisli) => {
              return (secondKleisli) => {
                return (inputVal) => {
                  return exportedItems.bindFlipped(bindInstance)(firstKleisli)(secondKleisli(inputVal));
                };
              };
            };
          };
        })(
          (internalExportMap["Core.Binding"] =
            internalExportMap["Core.Binding"] || {})
        );

        // Module: Data.Vector
        ((exportedItems) => {
          "use strict";

          // Generates an array of numbers within a specified range.
          exportedItems.createRange = (startNumber) => {
            return (endNumber) => {
              const stepDirection = startNumber > endNumber ? -1 : 1;
              const outputArray = new Array(stepDirection * (endNumber - startNumber) + 1);
              let currentNumber = startNumber;
              let currentArrayIndex = 0;
              while (currentNumber !== endNumber) {
                outputArray[currentArrayIndex++] = currentNumber;
                currentNumber += stepDirection;
              }
              outputArray[currentArrayIndex] = currentNumber;
              return outputArray;
            };
          };
          // Filters an array based on a predicate function.
          exportedItems.filterCollection = (predicate) => {
            return (inputCollection) => {
              return inputCollection.filter(predicate);
            };
          };
        })(
          (internalExportMap["Data.Vector"] =
            internalExportMap["Data.Vector"] || {})
        );

        // Module: Data.Traversable
        ((exportedItems) => {
          "use strict";

          // Folds an array from right to left.
          exportedItems.foldRightCollection = (reducer) => {
            return (initialAccumulator) => {
              return (inputCollection) => {
                let currentAccumulator = initialAccumulator;
                for (let i = inputCollection.length - 1; i >= 0; i--) {
                  currentAccumulator = reducer(inputCollection[i])(currentAccumulator);
                }
                return currentAccumulator;
              };
            };
          };
          // Folds an array from left to right.
          exportedItems.foldLeftCollection = (reducer) => {
            return (initialAccumulator) => {
              return (inputCollection) => {
                let currentAccumulator = initialAccumulator;
                for (let i = 0; i < inputCollection.length; i++) {
                  currentAccumulator = reducer(currentAccumulator)(inputCollection[i]);
                }
                return currentAccumulator;
              };
            };
          };
        })(
          (internalExportMap["Data.Traversable"] =
            internalExportMap["Data.Traversable"] || {})
        );

        // Module: Core.Monadic
        ((exportedItems) => {
          "use strict";

          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const applicationDependency = requestDependency("Core.Application");
          const bindingDependency = requestDependency("Core.Binding");
          // Dependencies, not directly used here.
          requestDependency("Data.Mapper");
          requestDependency("Data.Singleton");

          // Constructor for a Monad type class, extending Applicative and Bind.
          exportedItems.MonadContext = function(baseApplicative, baseBind) {
            this.BaseApplicative = baseApplicative;
            this.BaseBind = baseBind;
          };
          // `monadicApply` implements the `apply` operation using `bind` and `pure` for a Monad.
          exportedItems.monadicApply = (monadInstance) => {
            return (functionContainer) => {
              return (valueContainer) => {
                return bindingDependency.getBindFunction(monadInstance.BaseBind())(functionContainer)(
                  (transformFn) => {
                    return bindingDependency.getBindFunction(monadInstance.BaseBind())(valueContainer)(
                      (value) => {
                        return applicativeOpsDependency.getPureFunction(monadInstance.BaseApplicative())(
                          transformFn(value)
                        );
                      }
                    );
                  }
                );
              };
            };
          };
        })(
          (internalExportMap["Core.Monadic"] =
            internalExportMap["Core.Monadic"] || {})
        );

        // Module: Data.PartialGroup
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Data.Semigroup"); // Original module name, kept for context.
          requestDependency("Data.Symbol");
          requestDependency("Data.Singleton");
          requestDependency("Data.Void");
          requestDependency("Record.Unchecked");
          requestDependency("Type.Data.RowList");

          // Constructor for a Semigroup, defining an associative `append` operation.
          exportedItems.PartialGroupConstructor = function(appendFn) {
            this.appendOperation = appendFn;
          };
          // Helper to get the `append` function from an instance.
          exportedItems.getAppendOperation = (instance) => instance.appendOperation;
        })(
          (internalExportMap["Data.PartialGroup"] =
            internalExportMap["Data.PartialGroup"] || {})
        );

        // Module: Data.IdentityGroup
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Data.Boolean");
          requestDependency("Data.Equality");
          requestDependency("Data.Euclidean");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          requestDependency("Data.PartialGroup");
          requestDependency("Data.Symbol");
          requestDependency("Data.Singleton");
          requestDependency("Record.Unchecked");
          requestDependency("Type.Data.RowList");

          // Constructor for a Monoid, extending Semigroup with an `empty` element.
          exportedItems.IdentityGroupConstructor = function(basePartialGroup, emptyVal) {
            this.BasePartialGroup = basePartialGroup;
            this.emptyValue = emptyVal;
          };
          // Helper to get the `empty` element from an instance.
          exportedItems.getEmptyValue = (instance) => instance.emptyValue;
        })(
          (internalExportMap["Data.IdentityGroup"] =
            internalExportMap["Data.IdentityGroup"] || {})
        );

        // Module: Data.Optional
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Core.Alternative");
          requestDependency("Core.ApplicativeOps");
          requestDependency("Core.Application");
          requestDependency("Core.Binding");
          requestDependency("Core.Categorization");
          requestDependency("Core.Extension");
          requestDependency("Core.Monadic");
          requestDependency("Core.MonadicZero");
          requestDependency("Core.Plus");
          requestDependency("Core.Associative");
          requestDependency("Data.Bounded");
          requestDependency("Data.Equality");
          requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Data.Mapper.Invariant");
          requestDependency("Data.MapperWithIndex");
          requestDependency("Data.IdentityGroup");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          requestDependency("Data.PartialGroup");
          requestDependency("Data.Display");
          requestDependency("Data.Singleton");
          requestDependency("Prelude"); // Common dependency in PureScript generated JS.

          // Represents the absence of a value.
          const AbsenceValue = (() => {
            function NothingType() {}
            NothingType.value = new NothingType();
            return NothingType;
          })();
          // Represents the presence of a value.
          const PresenceValue = (() => {
            function JustType(val) {
              this.containedValue = val;
            }
            JustType.createInstance = (val) => new JustType(val);
            return JustType;
          })();

          // Function to handle optional values, providing branches for 'absence' and 'presence'.
          exportedItems.processOptional = (onAbsence) => {
            return (onPresence) => {
              return (optionalItem) => {
                if (optionalItem instanceof AbsenceValue) {
                  return onAbsence;
                }
                if (optionalItem instanceof PresenceValue) {
                  return onPresence(optionalItem.containedValue);
                }
                throw new Error(
                  "Pattern match failure in Data.Optional (line 217, column 1 - line 217, column 51): " +
                    [
                      onAbsence.constructor.name,
                      onPresence.constructor.name,
                      optionalItem.constructor.name,
                    ]
                );
              };
            };
          };
          // Exporting the constructors.
          exportedItems.AbsenceValue = AbsenceValue;
          exportedItems.PresenceValue = PresenceValue;
        })(
          (internalExportMap["Data.Optional"] =
            internalExportMap["Data.Optional"] || {})
        );

        // Module: Data.SemiRing
        ((exportedItems) => {
          "use strict";

          // Integer addition, ensuring 32-bit integer overflow behavior.
          exportedItems.addIntegers = (numA) => {
            return (numB) => {
              return (numA + numB) | 0;
            };
          };
          // Integer multiplication, ensuring 32-bit integer overflow behavior.
          exportedItems.multiplyIntegers = (numA) => {
            return (numB) => {
              return (numA * numB) | 0;
            };
          };
        })(
          (internalExportMap["Data.SemiRing"] =
            internalExportMap["Data.SemiRing"] || {})
        );

        // Module: Data.SemiRing (extension)
        ((exportedItems) => {
          "use strict";

          const semiRingDependency = requestDependency("Data.SemiRing");
          // Dependencies.
          requestDependency("Data.Symbol");
          requestDependency("Data.Singleton");
          requestDependency("Record.Unchecked");
          requestDependency("Type.Data.Row");
          requestDependency("Type.Data.RowList");

          // Constructor for a Semiring, defining addition, multiplication, zero, and one.
          const SemiRingConstructor = function(addFn, mulFn, oneVal, zeroVal) {
            this.addOp = addFn;
            this.mulOp = mulFn;
            this.oneValue = oneVal;
            this.zeroValue = zeroVal;
          };
          // An instance of SemiRingConstructor for integers.
          const integerSemiRingInstance = new SemiRingConstructor(
            semiRingDependency.addIntegers,
            semiRingDependency.multiplyIntegers,
            1,
            0
          );
          // Exporting the constructor and its instance.
          exportedItems.SemiRingType = SemiRingConstructor;
          exportedItems.getAddOperation = (instance) => instance.addOp;
          exportedItems.getZeroValue = (instance) => instance.zeroValue;
          exportedItems.getMulOperation = (instance) => instance.mulOp;
          exportedItems.getOneValue = (instance) => instance.oneValue;
          exportedItems.integerSemiRing = integerSemiRingInstance;
        })(
          (internalExportMap["Data.SemiRing"] =
            internalExportMap["Data.SemiRing"] || {})
        );

        // Module: Data.Traversable (extension)
        ((exportedItems) => {
          "use strict";

          const traversableDependency = requestDependency("Data.Traversable");
          // Dependencies.
          requestDependency("Core.Alternative");
          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const applicationDependency = requestDependency("Core.Application");
          requestDependency("Core.Binding");
          requestDependency("Core.Categorization");
          requestDependency("Core.Plus");
          requestDependency("Core.Associative");
          requestDependency("Data.Equality");
          requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Data.HeytingAlgebra");
          requestDependency("Data.Optional");
          requestDependency("Data.Optional.First");
          requestDependency("Data.Optional.Last");
          const identityGroupDependency = requestDependency("Data.IdentityGroup");
          requestDependency("Data.IdentityGroup.Additive");
          requestDependency("Data.IdentityGroup.Conj");
          requestDependency("Data.IdentityGroup.Disj");
          requestDependency("Data.IdentityGroup.Dual");
          requestDependency("Data.IdentityGroup.Endo");
          requestDependency("Data.IdentityGroup.Multiplicative");
          requestDependency("Data.NewType");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          const partialGroupDependency = requestDependency("Data.PartialGroup");
          requestDependency("Data.SemiRing");
          const singletonDependency = requestDependency("Data.Singleton");
          requestDependency("Prelude");

          // Constructor for a Foldable, defining `foldMap`, `foldl`, and `foldr`.
          const FoldableConstructor = function(foldMapFn, foldlFn, foldrFn) {
            this.foldMap = foldMapFn;
            this.foldl = foldlFn;
            this.foldr = foldrFn;
          };
          // Helper to get the `foldr` function.
          const getFoldRightFunction = (instance) => instance.foldr;
          // Default implementation of `foldMap` using `foldr`.
          const defaultFoldMapRight = (foldableInstance) => {
            return (monoidInstance) => {
              return (transformFn) => {
                return getFoldRightFunction(foldableInstance)(
                  (item) => {
                    return (accumulator) => {
                      return partialGroupDependency.getAppendOperation(monoidInstance.BasePartialGroup())(
                        transformFn(item)
                      )(accumulator);
                    };
                  }
                )(identityGroupDependency.getEmptyValue(monoidInstance));
              };
            };
          };
          // An instance of FoldableConstructor for arrays.
          const arrayFoldableInstance = new FoldableConstructor(
            (monoidInstance) => defaultFoldMapRight(arrayFoldableInstance)(monoidInstance),
            traversableDependency.foldLeftCollection,
            traversableDependency.foldRightCollection
          );

          // Exporting the constructor and related utilities.
          exportedItems.FoldableType = FoldableConstructor;
          exportedItems.getFoldRightFunction = getFoldRightFunction;
          exportedItems.getFoldLeftFunction = (instance) => instance.foldl;
          exportedItems.getFoldMapFunction = (instance) => instance.foldMap;
          exportedItems.defaultFoldMapRight = defaultFoldMapRight;
          // `traverseContainer` applies an effectful function to each element of a foldable container.
          exportedItems.traverseContainer = (applicatorInstance) => {
            return (foldableInstance) => {
              return (effectfulTransform) => {
                return getFoldRightFunction(foldableInstance)(
                  (item) => {
                    return applicationDependency.applySecond(applicatorInstance.BaseApplicator())(
                      effectfulTransform(item)
                    );
                  }
                )(applicativeOpsDependency.getPureFunction(applicatorInstance)(singletonDependency.unit));
              };
            };
          };
          exportedItems.arrayFoldable = arrayFoldableInstance;
        })(
          (internalExportMap["Data.Traversable"] =
            internalExportMap["Data.Traversable"] || {})
        );

        // Module: Partial.Unchecked
        ((exportedItems) => {
          "use strict";

          // Represents an unsafe partial function that directly executes a thunk.
          (exportedItems["Partial.Unchecked"] =
            exportedItems["Partial.Unchecked"] || {}).unsafePartialExecution = (
            thunk
          ) => {
            return thunk();
          };
        })(); // Self-invoking for Partial.Unchecked

        // Module: Partial.Errors
        ((exportedItems) => {
          "use strict";

          // Function to crash the program with a given error message.
          (exportedItems["Partial.Errors"] =
            exportedItems["Partial.Errors"] || {}).crashWithMessage = (
            message
          ) => {
            return () => {
              throw new Error(message);
            };
          };
        })(); // Self-invoking for Partial.Errors

        // Module: Partial.Errors (extension)
        ((exportedItems) => {
          "use strict";

          const partialDependency = requestDependency("Partial.Errors");
          // Re-exporting the crash function.
          exportedItems.crashWithMessage = partialDependency.crashWithMessage;
        })(
          (internalExportMap["Partial.Errors"] =
            internalExportMap["Partial.Errors"] || {})
        );

        // Module: Partial.Unchecked (extension)
        ((exportedItems) => {
          "use strict";

          const uncheckedDependency = requestDependency("Partial.Unchecked");
          const errorsDependency = requestDependency("Partial.Errors");
          // Function to crash the program unsafely with a given error message.
          exportedItems.unsafeCrashWithMessage = (message) => {
            return uncheckedDependency.unsafePartialExecution(() =>
              errorsDependency.crashWithMessage(message)()
            );
          };
        })(
          (internalExportMap["Partial.Unchecked"] =
            internalExportMap["Partial.Unchecked"] || {})
        );

        // Module: Unchecked.TypeCast
        ((exportedItems) => {
          "use strict";

          // An unsafe type coercion function.
          (exportedItems["Unchecked.TypeCast"] =
            exportedItems["Unchecked.TypeCast"] || {}).unsafeCoerceType = (
            value
          ) => {
            return value;
          };
        })(); // Self-invoking for Unchecked.TypeCast

        // Module: Unchecked.TypeCast (extension)
        ((exportedItems) => {
          "use strict";

          const typeCastDependency = requestDependency("Unchecked.TypeCast");
          // Re-exporting the unsafe type coercion function.
          exportedItems.unsafeCoerceType = typeCastDependency.unsafeCoerceType;
        })(
          (internalExportMap["Unchecked.TypeCast"] =
            internalExportMap["Unchecked.TypeCast"] || {})
        );

        // Module: Data.Vector (extension)
        ((exportedItems) => {
          "use strict";

          const vectorDependency = requestDependency("Data.Vector");
          // Dependencies.
          requestDependency("Core.Alternative");
          requestDependency("Core.ApplicativeOps");
          requestDependency("Core.Application");
          requestDependency("Core.Binding");
          requestDependency("Core.Categorization");
          requestDependency("Core.Lazy");
          requestDependency("Control.Monad.Rec.Class");
          requestDependency("Control.Monad.ST");
          requestDependency("Control.Monad.ST.Internal");
          requestDependency("Core.Associative");
          requestDependency("Data.Array.NonEmpty.Internal");
          requestDependency("Data.Array.ST");
          requestDependency("Data.Array.ST.Iterator");
          requestDependency("Data.Boolean");
          requestDependency("Data.Equality");
          requestDependency("Data.Traversable");
          requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Data.HeytingAlgebra");
          requestDependency("Data.Optional");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          requestDependency("Data.SemiRing");
          requestDependency("Data.PartialGroup");
          requestDependency("Data.Traversable");
          requestDependency("Data.Pair");
          requestDependency("Data.Unfoldable");
          requestDependency("Partial.Unchecked");
          requestDependency("Prelude");
          requestDependency("Unchecked.TypeCast");

          // Re-exporting vector utilities.
          exportedItems.createRange = vectorDependency.createRange;
          exportedItems.filterCollection = vectorDependency.filterCollection;
        })(
          (internalExportMap["Data.Vector"] =
            internalExportMap["Data.Vector"] || {})
        );

        // Module: Data.Alternative
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Core.Alternative");
          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const applicationDependency = requestDependency("Core.Application");
          const bindingDependency = requestDependency("Core.Binding");
          requestDependency("Core.Categorization");
          requestDependency("Data.Bifoldable");
          requestDependency("Data.Bifunctor");
          requestDependency("Data.Bitraversable");
          requestDependency("Data.Bounded");
          requestDependency("Data.Equality");
          requestDependency("Data.Traversable");
          requestDependency("Data.FuncTools");
          const mapperDependency = requestDependency("Data.Mapper");
          requestDependency("Data.Mapper.Invariant");
          requestDependency("Data.MapperWithIndex");
          requestDependency("Data.Optional");
          requestDependency("Data.IdentityGroup");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          requestDependency("Data.PartialGroup");
          requestDependency("Data.Display");
          requestDependency("Data.Traversable");
          requestDependency("Data.TraversableWithIndex");
          requestDependency("Data.Singleton");
          requestDependency("Prelude");

          // Represents a left (error) value in an Either type.
          const ErrorValue = (() => {
            function LeftType(val) {
              this.containedValue = val;
            }
            LeftType.create = (val) => new LeftType(val);
            return LeftType;
          })();
          // Represents a right (success) value in an Either type.
          const SuccessValue = (() => {
            function RightType(val) {
              this.containedValue = val;
            }
            RightType.create = (val) => new RightType(val);
            return RightType;
          })();

          // Functor instance for the Either type.
          const alternativeMapper = new mapperDependency.MapperConstructor((transformFn) => {
            return (eitherValue) => {
              if (eitherValue instanceof ErrorValue) {
                return new ErrorValue(eitherValue.containedValue);
              }
              if (eitherValue instanceof SuccessValue) {
                return new SuccessValue(transformFn(eitherValue.containedValue));
              }
              throw new Error(
                "Pattern match failure in Data.Alternative (line 38, column 8 - line 38, column 52): " +
                  [eitherValue.constructor.name]
              );
            };
          });

          // Function to handle Either values, branching on 'left' or 'right'.
          const processEither = (onLeft) => {
            return (onRight) => {
              return (eitherValue) => {
                if (eitherValue instanceof ErrorValue) {
                  return onLeft(eitherValue.containedValue);
                }
                if (eitherValue instanceof SuccessValue) {
                  return onRight(eitherValue.containedValue);
                }
                throw new Error(
                  "Pattern match failure in Data.Alternative (line 238, column 1 - line 238, column 64): " +
                    [onLeft.constructor.name, onRight.constructor.name, eitherValue.constructor.name]
                );
              };
            };
          };

          // Apply instance for the Either type.
          const alternativeApplicator = new applicationDependency.ApplicationConstructor(
            () => alternativeMapper,
            (functionContainer) => {
              return (valueContainer) => {
                if (functionContainer instanceof ErrorValue) {
                  return new ErrorValue(functionContainer.containedValue);
                }
                if (functionContainer instanceof SuccessValue) {
                  return mapperDependency.getMapFunction(alternativeMapper)(
                    functionContainer.containedValue
                  )(valueContainer);
                }
                throw new Error(
                  "Pattern match failure in Data.Alternative (line 82, column 1 - line 82, column 41): " +
                    [functionContainer.constructor.name, valueContainer.constructor.name]
                );
              };
            }
          );

          // Bind instance for the Either type.
          const alternativeBinder = new bindingDependency.BindConstructor(
            () => alternativeApplicator,
            processEither(
              (leftValue) => {
                return (func) => {
                  return new ErrorValue(leftValue);
                };
              }
            )((rightValue) => {
              return (func) => {
                return func(rightValue);
              };
            })
          );

          // Applicative instance for the Either type.
          const alternativeApplier = new applicativeOpsDependency.ApplicativeConstructor(
            () => alternativeApplicator,
            SuccessValue.create
          );

          // Exporting constructors and instances.
          exportedItems.ErrorValue = ErrorValue;
          exportedItems.SuccessValue = SuccessValue;
          exportedItems.processEither = processEither;
          // Creates a SuccessValue from an Optional, turning Absence into an ErrorValue.
          exportedItems.noteError = (errorMessage) => {
            return requestDependency("Data.Optional").processOptional(new ErrorValue(errorMessage))(
              SuccessValue.create
            );
          };
          exportedItems.alternativeMapper = alternativeMapper;
          exportedItems.alternativeApplicator = alternativeApplicator;
          exportedItems.alternativeApplier = alternativeApplier;
          exportedItems.alternativeBinder = alternativeBinder;
        })(
          (internalExportMap["Data.Alternative"] =
            internalExportMap["Data.Alternative"] || {})
        );

        // Module: Data.Integer
        ((exportedItems) => {
          "use strict";

          // Implementation for parsing an integer from a string with a given radix.
          (exportedItems["Data.Integer"] =
            exportedItems["Data.Integer"] || {}).parseIntegerFromRadixImpl = (
            onFailure
          ) => {
            return (onSuccess) => {
              return (radixBase) => {
                return (inputString) => {
                  let allowedCharPattern;
                  // Determine the character set allowed for the given radix.
                  if (radixBase < 11) {
                    allowedCharPattern = "[0-" + (radixBase - 1).toString() + "]";
                  } else if (radixBase === 11) {
                    allowedCharPattern = "[0-9a]";
                  } else {
                    allowedCharPattern = "[0-9a-" + String.fromCharCode(86 + radixBase) + "]";
                  }
                  // Regular expression to validate the string format.
                  const validationRegex = new RegExp(
                    "^[\\+\\-]?" + allowedCharPattern + "+$",
                    "i"
                  );
                  return (str) => {
                    if (validationRegex.test(str)) {
                      const parsedNumber = parseInt(str, radixBase);
                      // Check if the parsed number is a valid integer (not NaN or float).
                      return (0 | parsedNumber) === parsedNumber ? onSuccess(parsedNumber) : onFailure;
                    }
                    return onFailure;
                  };
                };
              };
            };
          };
        })(); // Self-invoking for Data.Integer

        // Module: Data.Integer (extension)
        ((exportedItems) => {
          "use strict";

          const integerDependency = requestDependency("Data.Integer");
          // Dependencies.
          requestDependency("Core.Categorization");
          requestDependency("Core.Associative");
          requestDependency("Data.Boolean");
          requestDependency("Data.Bounded");
          requestDependency("Data.Commutative");
          requestDependency("Data.Division");
          requestDependency("Data.Equality");
          requestDependency("Data.Euclidean");
          requestDependency("Data.HeytingAlgebra");
          requestDependency("Data.Integer.Bits");
          const optionalDependency = requestDependency("Data.Optional");
          requestDependency("Data.Ordering");
          requestDependency("Data.OrderingValue");
          requestDependency("Data.SemiRing");
          requestDependency("Data.Display");
          requestDependency("Global");
          requestDependency("Math");
          requestDependency("Prelude");

          // Generic parser for integers from a string with a specified radix, returning an Optional.
          const integerFromRadixParser = integerDependency.parseIntegerFromRadixImpl(
            optionalDependency.AbsenceValue.value
          )(optionalDependency.PresenceValue.createInstance);
          // Parser for base-10 integers.
          const base10IntegerParser = integerFromRadixParser(10);

          // Exporting the parsers.
          exportedItems.base10IntegerParser = base10IntegerParser;
          exportedItems.integerFromRadixParser = integerFromRadixParser;
        })(
          (internalExportMap["Data.Integer"] =
            internalExportMap["Data.Integer"] || {})
        );

        // Module: Data.StringUtilities
        ((exportedItems) => {
          "use strict";

          // Function to trim whitespace from a string.
          (exportedItems["Data.StringUtilities"] =
            exportedItems["Data.StringUtilities"] || {}).trimWhiteSpace = (
            inputString
          ) => {
            return inputString.trim();
          };
        })(); // Self-invoking for Data.StringUtilities

        // Module: Data.StringUtilities (extension)
        ((exportedItems) => {
          "use strict";

          const stringUtilDependency = requestDependency("Data.StringUtilities");
          // Dependencies.
          requestDependency("Data.Equality");
          requestDependency("Data.Ordering");
          requestDependency("Data.String.Pattern");
          requestDependency("Prelude");

          // Re-exporting the trim function.
          exportedItems.trimWhiteSpace = stringUtilDependency.trimWhiteSpace;
        })(
          (internalExportMap["Data.StringUtilities"] =
            internalExportMap["Data.StringUtilities"] || {})
        );

        // Module: Runtime.Effect
        ((exportedItems) => {
          "use strict";

          // Creates a pure, synchronous effect that immediately returns a value.
          exportedItems.pureEffectProducer = (value) => {
            return () => value;
          };
          // Binds an effectful computation, passing its result to a continuation function.
          exportedItems.bindEffectChain = (effectValue) => {
            return (continuationFn) => {
              return () => continuationFn(effectValue())();
            };
          };
        })(
          (internalExportMap["Runtime.Effect"] =
            internalExportMap["Runtime.Effect"] || {})
        );

        // Module: Runtime.Effect (extension)
        ((exportedItems) => {
          "use strict";

          const effectDependency = requestDependency("Runtime.Effect");
          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const applicationDependency = requestDependency("Core.Application");
          const bindingDependency = requestDependency("Core.Binding");
          const monadicDependency = requestDependency("Core.Monadic");
          const mapperDependency = requestDependency("Data.Mapper");
          // Dependencies.
          requestDependency("Data.IdentityGroup");
          requestDependency("Data.PartialGroup");
          requestDependency("Prelude");

          // Functor instance for the Effect type.
          const effectMapperInstance = new mapperDependency.MapperConstructor(
            applicativeOpsDependency.liftOne(
              new applicativeOpsDependency.ApplicativeConstructor(
                new applicationDependency.ApplicationConstructor(() => effectMapperInstance, monadicDependency.monadicApply(effectMonadInstance)),
                effectDependency.pureEffectProducer
              )
            )
          );

          // Apply instance for the Effect type.
          const effectApplicatorInstance = new applicationDependency.ApplicationConstructor(
            () => effectMapperInstance,
            monadicDependency.monadicApply(effectMonadInstance)
          );

          // Applicative instance for the Effect type.
          const effectApplierInstance = new applicativeOpsDependency.ApplicativeConstructor(
            () => effectApplicatorInstance,
            effectDependency.pureEffectProducer
          );

          // Bind instance for the Effect type.
          const effectBinderInstance = new bindingDependency.BindConstructor(
            () => effectApplicatorInstance,
            effectDependency.bindEffectChain
          );

          // Monad instance for the Effect type.
          const effectMonadInstance = new monadicDependency.MonadContext(
            () => effectApplierInstance,
            () => effectBinderInstance
          );

          // Exporting instances.
          exportedItems.effectMapper = effectMapperInstance;
          exportedItems.effectApplicator = effectApplicatorInstance;
          exportedItems.effectApplier = effectApplierInstance;
          exportedItems.effectBinder = effectBinderInstance;
          exportedItems.effectMonad = effectMonadInstance;
        })(
          (internalExportMap["Runtime.Effect"] =
            internalExportMap["Runtime.Effect"] || {})
        );

        // Module: Runtime.AsyncFlow
        ((exportedItems) => {
          "use strict";

          // Internal helper object containing async flow operations and state.
          const AsyncFlowInternal = (() => {
            const SCHEDULER_QUEUE_CAPACITY = 1024;
            let currentQueueSize = 0;
            let queueReadIndex = 0;
            const taskExecutionQueue = new Array(SCHEDULER_QUEUE_CAPACITY);
            let isProcessingQueue = false;

            // Drains the task queue, executing all pending tasks.
            function processTaskQueue() {
              let nextTask;
              isProcessingQueue = true;
              while (currentQueueSize !== 0) {
                currentQueueSize--;
                nextTask = taskExecutionQueue[queueReadIndex];
                taskExecutionQueue[queueReadIndex] = undefined; // Clear reference to prevent memory leaks.
                queueReadIndex = (queueReadIndex + 1) % SCHEDULER_QUEUE_CAPACITY;
                nextTask();
              }
              isProcessingQueue = false;
            }

            // A scheduler for managing microtasks, ensuring async operations run in order.
            const microtaskScheduler = {
              isDraining: () => isProcessingQueue,
              enqueue: (task) => {
                let previousDrainingState;
                if (currentQueueSize === SCHEDULER_QUEUE_CAPACITY) {
                  previousDrainingState = isProcessingQueue;
                  processTaskQueue();
                  isProcessingQueue = previousDrainingState;
                }
                taskExecutionQueue[(queueReadIndex + currentQueueSize) % SCHEDULER_QUEUE_CAPACITY] = task;
                currentQueueSize++;
                if (!isProcessingQueue) {
                  processTaskQueue();
                }
              },
            };

            // Defines various tags for asynchronous flow operations.
            const PureTag = "Pure";
            const ThrowTag = "Throw";
            const CatchTag = "Catch";
            const SyncTag = "Sync";
            const AsyncTag = "Async";
            const BindTag = "Bind";
            const BracketTag = "Bracket";
            const ForkTag = "Fork";
            const SequentialTag = "Sequential";
            const ParallelMapTag = "ParMap";
            const ParallelApplyTag = "ParApply";
            const ParallelAltTag = "ParAlt";
            const ConsTag = "Cons"; // Internal: for linked lists (e.g., fiber stacks).
            const ResumeTag = "Resume";
            const ReleaseTag = "Release";
            const FinalizerTag = "Finalizer";
            const FinalizedTag = "Finalized";
            const ForkedTag = "Forked";

            // Generic constructor for an asynchronous flow operation.
            function AsyncOperation(tag, val1, val2, val3) {
              this.tag = tag;
              this.firstVal = val1;
              this.secondVal = val2;
              this.thirdVal = val3;
            }

            // Factory function to create tagged AsyncOperation instances.
            function createTaggedOperation(tag) {
              const constructor = (val1, val2, val3) =>
                new AsyncOperation(tag, val1, val2, val3);
              constructor.tag = tag;
              return constructor;
            }

            // Creates a pure AsyncOperation.
            function pureOperation(val) {
              return new AsyncOperation(PureTag, val, undefined, undefined);
            }

            // Safely executes a synchronous effect, catching and converting errors.
            function safeSyncExecution(errorConverter, successConverter, executorFn, value) {
              try {
                return successConverter(executorFn(value()));
              } catch (err) {
                return errorConverter(err);
              }
            }

            // Safely executes an asynchronous effect, handling errors from the resolver.
            function safeAsyncExecution(errorConverter, executorFn, taskFn, resolver) {
              try {
                return executorFn(taskFn());
              } catch (err) {
                return taskFn(errorConverter(err));
              }
            }

            // Fiber state constants.
            const FIBER_STATE_INITIAL = 0;
            const FIBER_STATE_ACTIVE = 1;
            const FIBER_STATE_RESUME_BIND = 2;
            const FIBER_STATE_BIND_ERROR_CHECK = 3;
            const FIBER_STATE_ASYNC_PAUSE = 4;
            const FIBER_STATE_COMPLETED = 5;
            const FIBER_STATE_TERMINATED = 6;

            // The Fiber runner, responsible for executing an async flow.
            function FiberRunner(
              eitherUtilities,
              supervisorContext,
              initialFlow
            ) {
              let currentFiberDepth = 0;
              let fiberExecutionState = FIBER_STATE_INITIAL;
              let currentExecutionValue = initialFlow;
              let currentFiberError = null;
              let bindContinuationStack = null; // Stack for Bind operations.
              let finalizerContinuationStack = null; // Stack for Bracket/Finalizer operations.
              let activeBracketCount = 0; // Tracks nested bracket operations.
              let registeredCancellationHandlers = null; // Map of cancellation handlers.
              let shouldRethrowUncaught = true; // Flag to control rethrowing uncaught exceptions.

              // Processes a single step of the fiber's execution.
              function advanceFiber(stepDepth) {
                let nextFlow;
                let nextFlowTag;
                let nextFlowVal1;
                let nextFlowVal2;

                for (;;) {
                  // Handle resuming after a bind or catch block.
                  if (fiberExecutionState === FIBER_STATE_RESUME_BIND) {
                    fiberExecutionState = FIBER_STATE_ACTIVE;
                    currentExecutionValue = finalizerContinuationStack.firstVal(currentExecutionValue);
                    finalizerContinuationStack = finalizerContinuationStack.secondVal;
                  }
                  // Check for errors after a bind operation.
                  else if (fiberExecutionState === FIBER_STATE_BIND_ERROR_CHECK) {
                    fiberExecutionState = FIBER_STATE_COMPLETED;
                    if (eitherUtilities.isLeft(currentExecutionValue)) {
                      currentFiberError = currentExecutionValue;
                      currentExecutionValue = null;
                    } else if (bindContinuationStack === null) {
                      fiberExecutionState = FIBER_STATE_COMPLETED;
                    } else {
                      fiberExecutionState = FIBER_STATE_RESUME_BIND;
                      currentExecutionValue = eitherUtilities.fromRight(currentExecutionValue);
                    }
                  }
                  // Main execution loop, dispatching based on the current flow's tag.
                  else if (fiberExecutionState === FIBER_STATE_ACTIVE) {
                    switch (currentExecutionValue.tag) {
                      case BindTag:
                        // Push current bind continuation onto stack.
                        if (bindContinuationStack) {
                          finalizerContinuationStack = new AsyncOperation(
                            ConsTag,
                            bindContinuationStack,
                            finalizerContinuationStack
                          );
                        }
                        bindContinuationStack = currentExecutionValue.secondVal;
                        fiberExecutionState = FIBER_STATE_ACTIVE;
                        currentExecutionValue = currentExecutionValue.firstVal;
                        break;
                      case PureTag:
                        // If no more binds, finish. Otherwise, apply next bind.
                        if (bindContinuationStack === null) {
                          fiberExecutionState = FIBER_STATE_COMPLETED;
                          currentExecutionValue = eitherUtilities.right(currentExecutionValue.firstVal);
                        } else {
                          fiberExecutionState = FIBER_STATE_RESUME_BIND;
                          currentExecutionValue = currentExecutionValue.firstVal;
                        }
                        break;
                      case SyncTag:
                        // Synchronous effect, execute and transition to error check.
                        fiberExecutionState = FIBER_STATE_BIND_ERROR_CHECK;
                        currentExecutionValue = safeSyncExecution(
                          eitherUtilities.left,
                          eitherUtilities.right,
                          currentExecutionValue.firstVal
                        );
                        break;
                      case AsyncTag:
                        // Asynchronous effect, pause fiber and enqueue continuation.
                        fiberExecutionState = FIBER_STATE_ASYNC_PAUSE;
                        return safeAsyncExecution(
                          eitherUtilities.left,
                          currentExecutionValue.firstVal,
                          (result) => {
                            return () => {
                              if (currentFiberDepth === stepDepth) {
                                currentFiberDepth++;
                                microtaskScheduler.enqueue(() => {
                                  if (currentFiberDepth === stepDepth + 1) {
                                    fiberExecutionState = FIBER_STATE_BIND_ERROR_CHECK;
                                    currentExecutionValue = result;
                                    advanceFiber(currentFiberDepth);
                                  }
                                });
                              }
                            };
                          }
                        );
                      case ThrowTag:
                        // Immediate error, set error and move to cleanup.
                        fiberExecutionState = FIBER_STATE_COMPLETED;
                        currentFiberError = eitherUtilities.left(currentExecutionValue.firstVal);
                        currentExecutionValue = null;
                        break;
                      case CatchTag:
                        // Push a catch block onto the finalizer stack.
                        finalizerContinuationStack = new AsyncOperation(
                          ConsTag,
                          currentExecutionValue,
                          finalizerContinuationStack,
                          currentFiberError
                        );
                        bindContinuationStack = null; // Clear bind stack for catch.
                        finalizerContinuationStack = new AsyncOperation(
                          ConsTag,
                          new AsyncOperation(ResumeTag, bindContinuationStack, finalizerContinuationStack),
                          finalizerContinuationStack,
                          currentFiberError
                        );
                        fiberExecutionState = FIBER_STATE_ACTIVE;
                        currentExecutionValue = currentExecutionValue.firstVal;
                        break;
                      case BracketTag:
                        // Push a bracket block onto the finalizer stack.
                        activeBracketCount++;
                        finalizerContinuationStack = new AsyncOperation(
                          ConsTag,
                          currentExecutionValue,
                          bindContinuationStack === null
                            ? finalizerContinuationStack
                            : new AsyncOperation(ConsTag, new AsyncOperation(ResumeTag, bindContinuationStack, finalizerContinuationStack), finalizerContinuationStack),
                          currentFiberError
                        );
                        bindContinuationStack = null; // Clear bind stack for resource acquisition.
                        finalizerContinuationStack = null;
                        fiberExecutionState = FIBER_STATE_ACTIVE;
                        currentExecutionValue = currentExecutionValue.firstVal;
                        break;
                      case ForkTag:
                        // Fork a new fiber.
                        fiberExecutionState = FIBER_STATE_BIND_ERROR_CHECK;
                        nextFlow = FiberRunner(eitherUtilities, supervisorContext, currentExecutionValue.secondVal);
                        if (supervisorContext) {
                          supervisorContext.register(nextFlow);
                        }
                        if (currentExecutionValue.firstVal) {
                          nextFlow.run();
                        }
                        currentExecutionValue = eitherUtilities.right(nextFlow);
                        break;
                      case SequentialTag:
                        // Execute effects sequentially.
                        fiberExecutionState = FIBER_STATE_ACTIVE;
                        currentExecutionValue = executeSequentially(
                          eitherUtilities,
                          supervisorContext,
                          currentExecutionValue.firstVal
                        );
                        break;
                    }
                  }
                  // Cleanup/Finalization phase.
                  else if (fiberExecutionState === FIBER_STATE_COMPLETED) {
                    // Process finalizers from the stack.
                    if (finalizerContinuationStack === null) {
                      fiberExecutionState = FIBER_STATE_TERMINATED;
                      currentExecutionValue = currentFiberError || currentExecutionValue; // Return error if any, else value.
                    } else {
                      nextFlowTag = finalizerContinuationStack.firstVal;
                      nextFlowVal2 = finalizerContinuationStack.secondVal;
                      finalizerContinuationStack = finalizerContinuationStack.secondVal; // Pop from stack.

                      switch (nextFlowTag.tag) {
                        case CatchTag:
                          // If current error matches the catch's error context, handle it.
                          if (currentFiberError && currentFiberError === finalizerContinuationStack.thirdVal) {
                            fiberExecutionState = FIBER_STATE_ACTIVE;
                            currentExecutionValue = nextFlowTag.secondVal(eitherUtilities.fromLeft(currentFiberError));
                            currentFiberError = null; // Clear error after handling.
                          }
                          break;
                        case ResumeTag:
                          // Restore bind stack and continue.
                          if (!(currentFiberError && currentFiberError === finalizerContinuationStack.thirdVal)) {
                            bindContinuationStack = nextFlowTag.firstVal;
                            finalizerContinuationStack = nextFlowTag.secondVal;
                            fiberExecutionState = FIBER_STATE_RESUME_BIND;
                            currentExecutionValue = eitherUtilities.fromRight(currentExecutionValue);
                          }
                          break;
                        case BracketTag:
                          // Execute finalizer for bracket.
                          activeBracketCount--;
                          nextFlowVal1 = eitherUtilities.fromRight(currentExecutionValue);
                          finalizerContinuationStack = new AsyncOperation(
                            ConsTag,
                            new AsyncOperation(ReleaseTag, nextFlowTag.secondVal, nextFlowVal1),
                            nextFlowVal2,
                            finalizerContinuationStack.thirdVal
                          );
                          // If not killed, execute finalizer.
                          if (!(currentFiberError && currentFiberError === finalizerContinuationStack.thirdVal) || activeBracketCount > 0) {
                            fiberExecutionState = FIBER_STATE_ACTIVE;
                            currentExecutionValue = nextFlowTag.thirdVal(nextFlowVal1);
                          }
                          break;
                        case FinalizerTag:
                          // Execute a generic finalizer.
                          activeBracketCount++;
                          finalizerContinuationStack = new AsyncOperation(
                            ConsTag,
                            new AsyncOperation(FinalizedTag, currentExecutionValue, currentFiberError),
                            nextFlowVal2,
                            finalizerContinuationStack.thirdVal
                          );
                          fiberExecutionState = FIBER_STATE_ACTIVE;
                          currentExecutionValue = nextFlowTag.firstVal;
                          break;
                        case FinalizedTag:
                          // Restore state after finalizer.
                          activeBracketCount--;
                          fiberExecutionState = FIBER_STATE_COMPLETED;
                          currentExecutionValue = nextFlowTag.firstVal;
                          currentFiberError = nextFlowTag.secondVal;
                          break;
                        case ReleaseTag: // Used internally by Bracket
                          activeBracketCount++;
                          finalizerContinuationStack = new AsyncOperation(
                            ConsTag,
                            new AsyncOperation(FinalizedTag, currentExecutionValue, currentFiberError),
                            nextFlowVal2,
                            finalizerContinuationStack.thirdVal
                          );
                          fiberExecutionState = FIBER_STATE_ACTIVE;
                          currentExecutionValue = currentFiberError && currentFiberError === finalizerContinuationStack.thirdVal
                            ? nextFlowTag.firstVal.killed(eitherUtilities.fromLeft(currentFiberError))(nextFlowTag.secondVal)
                            : currentFiberError
                            ? nextFlowTag.firstVal.failed(eitherUtilities.fromLeft(currentFiberError))(nextFlowTag.secondVal)
                            : nextFlowTag.firstVal.completed(eitherUtilities.fromRight(currentExecutionValue))(nextFlowTag.secondVal);
                          currentFiberError = null;
                          break;
                      }
                    }
                  }
                  // Fiber is completely finished.
                  else if (fiberExecutionState === FIBER_STATE_TERMINATED) {
                    let handlerKey;
                    // Invoke cancellation handlers.
                    for (handlerKey in registeredCancellationHandlers) {
                      if (registeredCancellationHandlers.hasOwnProperty(handlerKey)) {
                        shouldRethrowUncaught = shouldRethrowUncaught && registeredCancellationHandlers[handlerKey].rethrow;
                        try {
                          registeredCancellationHandlers[handlerKey].handler(currentExecutionValue);
                        } catch (err) {
                          setTimeout(() => {
                            throw err;
                          }, 0);
                        }
                      }
                    }
                    registeredCancellationHandlers = null;
                    // Rethrow if an uncaught error occurred and rethrow flag is true.
                    if (currentFiberError && shouldRethrowUncaught) {
                      setTimeout(() => {
                        throw eitherUtilities.fromLeft(currentFiberError);
                      }, 0);
                    }
                    return; // Exit fiber runner.
                  }
                  // Initial state, transition to active.
                  else if (fiberExecutionState === FIBER_STATE_INITIAL) {
                    fiberExecutionState = FIBER_STATE_ACTIVE;
                  }
                  // Should not happen, but for completeness.
                  else {
                    // Fallthrough, should be caught by previous cases.
                  }
                }
              }

              let handlerIDCounter = 0;
              // Registers a handler to be called when the fiber completes or is cancelled.
              function attachCompletionHandler(handlerConfiguration) {
                const handlerIdentifier = handlerIDCounter++;
                registeredCancellationHandlers = registeredCancellationHandlers || {};
                registeredCancellationHandlers[handlerIdentifier] = handlerConfiguration;
                return () => {
                  if (registeredCancellationHandlers) {
                    delete registeredCancellationHandlers[handlerIdentifier];
                  }
                };
              }

              return {
                // Initiates a kill request for the fiber.
                kill: (reason, callback) => {
                  return () => {
                    if (fiberExecutionState === FIBER_STATE_TERMINATED) {
                      return callback(eitherUtilities.right(undefined))();
                    }
                    const removeCallback = attachCompletionHandler({
                      rethrow: false,
                      handler: () => callback(eitherUtilities.right(undefined))(),
                    })();
                    // If fiber is initial, set error and process immediately.
                    if (fiberExecutionState === FIBER_STATE_INITIAL) {
                      currentFiberError = eitherUtilities.left(reason);
                      fiberExecutionState = FIBER_STATE_TERMINATED;
                      currentExecutionValue = currentFiberError;
                      advanceFiber(currentFiberDepth);
                    }
                    // If fiber is async, kill it and clear state.
                    else if (fiberExecutionState === FIBER_STATE_ASYNC_PAUSE) {
                      if (currentFiberError === null) {
                        currentFiberError = eitherUtilities.left(reason);
                      }
                      if (activeBracketCount === 0) {
                        // If no pending brackets, transition to completed.
                        fiberExecutionState = FIBER_STATE_COMPLETED;
                        currentExecutionValue = null;
                        currentFiberError = null; // Error overwritten by kill reason.
                        advanceFiber(++currentFiberDepth);
                      }
                      // If brackets are active, let them handle cancellation.
                    }
                    // Other states, just set error and let it propagate.
                    else {
                      if (currentFiberError === null) {
                        currentFiberError = eitherUtilities.left(reason);
                      }
                      if (activeBracketCount === 0) {
                        fiberExecutionState = FIBER_STATE_COMPLETED;
                        currentExecutionValue = null;
                        currentFiberError = null;
                      }
                    }
                    return removeCallback;
                  };
                },
                // Waits for the fiber to complete, registering a callback.
                awaitCompletion: (callback) => {
                  return () => {
                    const removeCallback = attachCompletionHandler({
                      rethrow: false,
                      handler: callback,
                    })();
                    if (fiberExecutionState === FIBER_STATE_INITIAL) {
                      advanceFiber(currentFiberDepth);
                    }
                    return removeCallback;
                  };
                },
                // Registers a generic completion handler.
                onCompletion: attachCompletionHandler,
                // Checks if the fiber is in its initial (suspended) state.
                isSuspended: () => fiberExecutionState === FIBER_STATE_INITIAL,
                // Starts the fiber execution.
                run: () => {
                  if (fiberExecutionState === FIBER_STATE_INITIAL) {
                    if (microtaskScheduler.isDraining()) {
                      advanceFiber(currentFiberDepth);
                    } else {
                      microtaskScheduler.enqueue(() => {
                        advanceFiber(currentFiberDepth);
                      });
                    }
                  }
                },
              };
            }

            // Executes parallel effects.
            function executeParallel(eitherUtilities, supervisorContext, flow, resolver) {
              let activeParallelFibers = 0;
              const parallelFiberMap = {};
              let parallelFiberCounter = 0;
              const forcedExitError = new Error("[ParAff] Early exit triggered");
              let overallParallelError = null;
              const rootFiberContext = eitherUtilities; // The original parent fiber context (for error handling)

              // Helper function to manage child fibers created for parallel execution.
              function processChildFiberResult(fiberRef, childFlow, onResultCallback) {
                let currentChildFlowState = childFlow;
                let currentChildResult = null;
                let childCancellationMap = {};

                // Processes the result of a child fiber and propagates it up the parallel stack.
                let handleChildResult = (result, currentEffect, currentContinuation) => {
                  let childError;
                  let childResult;

                  if (eitherUtilities.isLeft(result)) {
                    childError = result;
                    childResult = null;
                  } else {
                    childResult = result;
                    childError = null;
                  }

                  // Loop through continuation stack.
                  for (;;) {
                    // If a global error occurred, exit.
                    if (overallParallelError !== null) {
                      return;
                    }
                    // If no more continuations, call main resolver.
                    if (currentContinuation === null) {
                      return onResultCallback(childError || childResult);
                    }
                    // If this continuation is already processed, skip.
                    if (currentContinuation.thirdVal !== rootFiberContext) {
                      // Already processed by another path.
                      return;
                    }

                    switch (currentEffect.tag) {
                      case ParallelMapTag:
                        // If no error, map the value.
                        if (childError === null) {
                          currentContinuation.thirdVal = eitherUtilities.right(
                            currentEffect.firstVal(eitherUtilities.fromRight(childResult))
                          );
                          childResult = currentContinuation.thirdVal;
                        } else {
                          currentContinuation.thirdVal = childError;
                        }
                        break;
                      case ParallelApplyTag:
                        let funcResult = currentEffect.firstVal.thirdVal;
                        let valResult = currentEffect.secondVal.thirdVal;

                        // If error in either, propagate it.
                        if (childError) {
                          currentContinuation.thirdVal = childError;
                          let shouldCancelOther = true;
                          let cancelIdentifier = parallelFiberCounter++;
                          childCancellationMap[cancelIdentifier] = initiateCancellation(
                            forcedExitError,
                            childError === funcResult ? currentEffect.secondVal : currentEffect.firstVal,
                            () => {
                              delete childCancellationMap[cancelIdentifier];
                              if (shouldCancelOther) {
                                shouldCancelOther = false;
                              } else {
                                if (currentContinuation === null) {
                                  handleChildResult(childError, null, null);
                                } else {
                                  handleChildResult(childError, currentContinuation.firstVal, currentContinuation.secondVal);
                                }
                              }
                            }
                          );
                          if (shouldCancelOther) {
                            shouldCancelOther = false;
                          }
                          return; // Wait for cancellation.
                        } else {
                          // If both are successful, apply the function.
                          if (funcResult !== rootFiberContext && valResult !== rootFiberContext) {
                            childResult = eitherUtilities.right(
                              eitherUtilities.fromRight(funcResult)(eitherUtilities.fromRight(valResult))
                            );
                            currentContinuation.thirdVal = childResult;
                          }
                        }
                        break;
                      case ParallelAltTag:
                        let altResult1 = currentEffect.firstVal.thirdVal;
                        let altResult2 = currentEffect.secondVal.thirdVal;

                        // If both are errors, choose the first error.
                        if (altResult1 !== rootFiberContext && eitherUtilities.isLeft(altResult1) &&
                            altResult2 !== rootFiberContext && eitherUtilities.isLeft(altResult2)) {
                          childError = childResult === altResult1 ? altResult2 : altResult1;
                          childResult = null;
                          currentContinuation.thirdVal = childError;
                        } else if (currentContinuation.thirdVal === childResult) {
                          // If one succeeded, cancel the other.
                          let shouldCancelOther = true;
                          let cancelIdentifier = parallelFiberCounter++;
                          childCancellationMap[cancelIdentifier] = initiateCancellation(
                            forcedExitError,
                            childResult === altResult1 ? currentEffect.secondVal : currentEffect.firstVal,
                            () => {
                              delete childCancellationMap[cancelIdentifier];
                              if (shouldCancelOther) {
                                shouldCancelOther = false;
                              } else {
                                if (currentContinuation === null) {
                                  handleChildResult(childResult, null, null);
                                } else {
                                  handleChildResult(childResult, currentContinuation.firstVal, currentContinuation.secondVal);
                                }
                              }
                            }
                          );
                          if (shouldCancelOther) {
                            shouldCancelOther = false;
                          }
                          return;
                        }

                        break;
                    }
                    // Move to the next continuation.
                    if (currentContinuation === null) {
                      currentContinuation = null;
                    } else {
                      currentContinuation = currentContinuation.secondVal;
                    }
                  }
                };

                // Manages cancellation for parallel effects.
                function initiateCancellation(cancelReason, currentEffect, onCancelComplete) {
                  let pendingCancelCount = 0;
                  const cancelReferences = {};

                  // Recursively finds and cancels all active child fibers.
                  let findFibersToCancel = (effectToCancel, currentContinuation, innerContinuation) => {
                    let nextEffect;
                    let nextContinuation;

                    for (;;) {
                      nextEffect = null;
                      nextContinuation = null;

                      if (overallParallelError !== null) {
                        return;
                      }
                      if (currentContinuation === null) {
                        return onCancelComplete(cancelReason);
                      }
                      if (currentContinuation.thirdVal !== rootFiberContext) {
                        return; // Already processed.
                      }

                      switch (currentEffect.tag) {
                        case ForkedTag:
                          if (currentEffect.thirdVal === rootFiberContext) {
                            nextEffect = parallelFiberMap[currentEffect.firstVal];
                            childCancellationMap[pendingCancelCount++] = nextEffect.kill(
                              cancelReason,
                              () => () => {
                                // On child fiber kill completion.
                                delete childCancellationMap[pendingCancelCount - 1];
                                pendingCancelCount--;
                                if (pendingCancelCount === 0) {
                                  onCancelComplete(cancelReason)();
                                }
                              }
                            );
                          }
                          if (nextContinuation === null) {
                            break;
                          }
                          currentEffect = nextContinuation.secondVal;
                          nextContinuation = nextContinuation.firstVal;
                          break;
                        case ParallelMapTag:
                          currentEffect = currentEffect.secondVal;
                          break;
                        case ParallelApplyTag:
                        case ParallelAltTag:
                          currentContinuation = new AsyncOperation(ConsTag, currentEffect, currentContinuation);
                          currentEffect = currentEffect.firstVal;
                          break;
                      }
                      if (pendingCancelCount === 0) {
                        onCancelComplete(cancelReason)();
                      }
                      for (let key in childCancellationMap) {
                        if (childCancellationMap.hasOwnProperty(key)) {
                          childCancellationMap[key]();
                        }
                      }
                      return childCancellationMap;
                    }
                  };

                  return () => {
                    let cancellationMap;
                    if (overallParallelError === null) {
                      overallParallelError = eitherUtilities.left(cancelReason);
                      cancellationMap = findFibersToCancel(cancelReason, currentChildFlowState, null);
                    }
                    return (cancelReason) => {
                      return new AsyncOperation(AsyncTag, (callback) => () => {
                        for (let key in cancellationMap) {
                          if (cancellationMap.hasOwnProperty(key)) {
                            cancellationMap[key]();
                          }
                        }
                        return callback(cancelReason);
                      });
                    };
                  };
                }

                return () => {
                  let currentOperation;
                  let currentContinuationNode = null;
                  let nextContinuationStack = null;
                  let decompositionState = FIBER_STATE_ACTIVE;

                  // Main loop to decompose parallel effect into individual fibers.
                  for (;;) {
                    currentOperation = null;
                    if (decompositionState === FIBER_STATE_ACTIVE) {
                      switch (currentChildFlowState.tag) {
                        case ParallelMapTag:
                          // Push current continuation.
                          if (currentContinuationNode) {
                            nextContinuationStack = new AsyncOperation(
                              ConsTag,
                              currentContinuationNode,
                              nextContinuationStack
                            );
                          }
                          currentContinuationNode = new AsyncOperation(
                            ParallelMapTag,
                            currentChildFlowState.firstVal,
                            rootFiberContext,
                            rootFiberContext
                          );
                          currentChildFlowState = currentChildFlowState.secondVal;
                          break;
                        case ParallelApplyTag:
                          if (currentContinuationNode) {
                            nextContinuationStack = new AsyncOperation(
                              ConsTag,
                              currentContinuationNode,
                              nextContinuationStack
                            );
                          }
                          currentContinuationNode = new AsyncOperation(
                            ParallelApplyTag,
                            rootFiberContext,
                            currentChildFlowState.secondVal,
                            rootFiberContext
                          );
                          currentChildFlowState = currentChildFlowState.firstVal;
                          break;
                        case ParallelAltTag:
                          if (currentContinuationNode) {
                            nextContinuationStack = new AsyncOperation(
                              ConsTag,
                              currentContinuationNode,
                              nextContinuationStack
                            );
                          }
                          currentContinuationNode = new AsyncOperation(
                            ParallelAltTag,
                            rootFiberContext,
                            currentChildFlowState.secondVal,
                            rootFiberContext
                          );
                          currentChildFlowState = currentChildFlowState.firstVal;
                          break;
                        default:
                          // Found a base effect, create a fiber for it.
                          let fiberIdx = parallelFiberCounter++;
                          decompositionState = FIBER_STATE_COMPLETED;
                          currentOperation = currentChildFlowState;
                          currentChildFlowState = new AsyncOperation(
                            ForkedTag,
                            fiberIdx,
                            new AsyncOperation(ConsTag, currentContinuationNode, nextContinuationStack),
                            rootFiberContext
                          );
                          // Create and run the fiber.
                          let newFiber = FiberRunner(eitherUtilities, supervisorContext, currentOperation);
                          newFiber.onCompletion({
                            rethrow: false,
                            handler: processChildFiberResult(currentChildFlowState, currentOperation, handleChildResult),
                          })();
                          parallelFiberMap[fiberIdx] = newFiber;
                          if (supervisorContext) {
                            supervisorContext.register(newFiber);
                          }
                          newFiber.run(); // Start the fiber.
                      }
                    }
                    // If finished processing current level, pop continuation.
                    else if (decompositionState === FIBER_STATE_COMPLETED) {
                      if (currentContinuationNode === null) {
                        break;
                      }
                      currentContinuationNode.firstVal = currentChildFlowState;
                      decompositionState = FIBER_STATE_ACTIVE;
                      currentChildFlowState = currentContinuationNode.secondVal;
                      if (nextContinuationStack === null) {
                        currentContinuationNode = null;
                      } else {
                        currentContinuationNode = nextContinuationStack.firstVal;
                        nextContinuationStack = nextContinuationStack.secondVal;
                      }
                    }
                  }
                  // Start all created fibers.
                  for (let id = 0; id < parallelFiberCounter; id++) {
                    parallelFiberMap[id].run();
                  }
                };
              }

              // Executes effects sequentially by wrapping them in an async operation.
              function executeSequentially(eitherUtilities, supervisorContext, flow) {
                return new AsyncOperation(AsyncTag, (resolver) => {
                  return () => {
                    return executeParallel(eitherUtilities, supervisorContext, flow, resolver);
                  };
                });
              }

            // Supervisor for managing child fibers.
            AsyncOperation.Supervisor = (eitherUtilities) => {
              const managedFibers = {};
              let nextAvailableFiberId = 0;
              let currentActiveFiberCount = 0;

              return {
                register: (fiber) => {
                  const id = nextAvailableFiberId++;
                  fiber.onCompletion({
                    rethrow: true,
                    handler: (result) => () => {
                      currentActiveFiberCount--;
                      delete managedFibers[id];
                      // If an error occurred in a child, log it.
                      if (eitherUtilities.isLeft(result) && eitherUtilities.fromLeft(result)) {
                        setTimeout(() => {
                          throw eitherUtilities.fromLeft(result);
                        }, 0);
                      }
                    },
                  });
                  managedFibers[id] = fiber;
                  currentActiveFiberCount++;
                },
                isEmpty: () => currentActiveFiberCount === 0,
                killAll: (reason, onComplete) => {
                  return () => {
                    let pendingKillOperations = 0;
                    const killOperationCallbacks = {};

                    function triggerKill(fiberId) {
                      killOperationCallbacks[fiberId] = managedFibers[fiberId].kill(reason, (killResult) => () => {
                        delete killOperationCallbacks[fiberId];
                        pendingKillOperations--;
                        // If a kill operation itself fails, log it.
                        if (eitherUtilities.isLeft(killResult) && eitherUtilities.fromLeft(killResult)) {
                          setTimeout(() => {
                            throw eitherUtilities.fromLeft(killResult);
                          }, 0);
                        }
                        if (pendingKillOperations === 0) {
                          onComplete();
                        }
                      })();
                    }

                    for (let id in managedFibers) {
                      if (managedFibers.hasOwnProperty(id)) {
                        pendingKillOperations++;
                        triggerKill(id);
                      }
                    }
                    managedFibers = {};
                    nextAvailableFiberId = 0;
                    currentActiveFiberCount = 0;

                    return (cancelReason) => {
                      return new AsyncOperation(AsyncTag, (callback) => () => {
                        for (let id in killOperationCallbacks) {
                          if (killOperationCallbacks.hasOwnProperty(id)) {
                            killOperationCallbacks[id]();
                          }
                        }
                        return callback(cancelReason);
                      });
                    };
                  };
                },
              };
            };
            AsyncOperation.Scheduler = microtaskScheduler;
            AsyncOperation.noCancellation = pureOperation(undefined); // A no-op cancellation.

            return AsyncOperation;
          })();

          // Exporting core functions for async flow.
          exportedItems.pureOperation = AsyncFlowInternal.pureOperation;
          exportedItems.mapOperation = (transformFn) => {
            return (flow) => {
              return flow.tag === AsyncFlowInternal.PureTag
                ? AsyncFlowInternal.pureOperation(transformFn(flow.firstVal))
                : AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.BindTag)(flow, (val) => AsyncFlowInternal.pureOperation(transformFn(val)));
            };
          };
          exportedItems.bindOperation = (flow) => {
            return (transformFn) => {
              return AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.BindTag)(flow, transformFn);
            };
          };
          exportedItems.liftEffect = AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.SyncTag);
          exportedItems.parallelMap = (transformFn) => {
            return (flow) => {
              return AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.ParallelMapTag)(transformFn, flow);
            };
          };
          exportedItems.parallelApply = (funcFlow) => {
            return (argFlow) => {
              return AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.ParallelApplyTag)(funcFlow, argFlow);
            };
          };
          exportedItems.createAsyncFlow = AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.AsyncTag);
          exportedItems.makeFiber = (eitherUtilities, flow) => {
            return () => AsyncFlowInternal.FiberRunner(eitherUtilities, null, flow);
          };
          exportedItems.sequentialExecution = AsyncFlowInternal.createTaggedOperation(AsyncFlowInternal.SequentialTag);
        })(
          (internalExportMap["Runtime.AsyncFlow"] =
            internalExportMap["Runtime.AsyncFlow"] || {})
        );

        // Module: Runtime.EffectClass
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Core.Categorization");
          requestDependency("Core.Monadic");
          requestDependency("Runtime.Effect");

          // Helper to get the `liftEffect` function.
          exportedItems.getLiftEffect = (instance) => instance.liftEffectFunction;

          // Constructor for a MonadEffect type class, combining Monad with Effect lifting.
          exportedItems.MonadEffectType = function(baseMonad, liftEff) {
            this.BaseMonad = baseMonad;
            this.liftEffectFunction = liftEff;
          };
        })(
          (internalExportMap["Runtime.EffectClass"] =
            internalExportMap["Runtime.EffectClass"] || {})
        );

        // Module: Runtime.MutableReference
        ((exportedItems) => {
          "use strict";

          // Creates a new mutable reference (a simple object wrapper).
          exportedItems.createNewRef = (initialValue) => {
            return () => ({ storedValue: initialValue });
          };
          // Reads the value currently held by a mutable reference.
          exportedItems.readRefValue = (refObject) => {
            return () => refObject.storedValue;
          };
          // Writes a new value to a mutable reference.
          exportedItems.writeRefValue = (newValue) => {
            return (refObject) => {
              return () => {
                refObject.storedValue = newValue;
                return {}; // Returns a unit value.
              };
            };
          };
        })(
          (internalExportMap["Runtime.MutableReference"] =
            internalExportMap["Runtime.MutableReference"] || {})
        );

        // Module: Runtime.MutableReference (extension)
        ((exportedItems) => {
          "use strict";

          const refDependency = requestDependency("Runtime.MutableReference");
          // Dependencies.
          requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Runtime.Effect");
          requestDependency("Prelude");

          // Re-exporting mutable reference functions.
          exportedItems.createNewRef = refDependency.createNewRef;
          exportedItems.readRefValue = refDependency.readRefValue;
          exportedItems.writeRefValue = refDependency.writeRefValue;
        })(
          (internalExportMap["Runtime.MutableReference"] =
            internalExportMap["Runtime.MutableReference"] || {})
        );

        // Module: Core.ParallelOperations
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Core.Alternative");
          requestDependency("Core.ApplicativeOps");
          requestDependency("Core.Application");
          requestDependency("Core.Binding");
          requestDependency("Control.Monad.Cont.Trans");
          requestDependency("Control.Monad.Except.Trans");
          requestDependency("Control.Monad.Maybe.Trans");
          requestDependency("Control.Monad.Reader.Trans");
          requestDependency("Control.Monad.Writer.Trans");
          requestDependency("Core.Plus");
          requestDependency("Core.Associative");
          requestDependency("Data.Alternative");
          requestDependency("Data.FuncTools");
          requestDependency("Data.Mapper");
          requestDependency("Data.Mapper.Compose");
          requestDependency("Data.NewType");
          requestDependency("Data.Optional");
          requestDependency("Data.Singleton");
          requestDependency("Runtime.EffectClass");
          requestDependency("Runtime.MutableReference");
          requestDependency("Prelude");

          // Helper to get the `parallel` function.
          exportedItems.getParallelFunction = (instance) => instance.parallelOperation;
          // Helper to get the `sequential` function.
          exportedItems.getSequentialFunction = (instance) => instance.sequentialOperation;

          // Constructor for a Parallel type class, defining parallel and sequential execution.
          exportedItems.ParallelContextType = function(
            applicativeInstance,
            monadInstance,
            parallelFn,
            sequentialFn
          ) {
            this.ApplicativeBase = applicativeInstance;
            this.MonadBase = monadInstance;
            this.parallelOperation = parallelFn;
            this.sequentialOperation = sequentialFn;
          };
        })(
          (internalExportMap["Core.ParallelOperations"] =
            internalExportMap["Core.ParallelOperations"] || {})
        );

        // Module: Core.Parallel
        ((exportedItems) => {
          "use strict";

          // Dependencies.
          requestDependency("Core.Alternative");
          requestDependency("Core.Application");
          const categoryDependency = requestDependency("Core.Categorization");
          const parallelOpsDependency = requestDependency("Core.ParallelOperations");
          requestDependency("Core.Associative");
          const foldableDependency = requestDependency("Data.Traversable");
          requestDependency("Data.Traversable"); // Duplicated, likely for different types.
          requestDependency("Prelude");

          // `parallelTraverse` applies an effectful function in parallel to each element of a foldable container.
          const parallelTraverseFunction = (parallelInstance) => {
            return (foldableInstance) => {
              return (transformFn) => {
                return (container) => {
                  return parallelOpsDependency.getSequentialFunction(parallelInstance)(
                    foldableDependency.traverseContainer(parallelInstance.ApplicativeBase())(
                      foldableInstance
                    )((item) =>
                      parallelOpsDependency.getParallelFunction(parallelInstance)(transformFn(item))
                    )(container)
                  );
                };
              };
            };
          };

          // Exporting parallel utilities.
          exportedItems.parallelTraverse = parallelTraverseFunction;
          // `parallelSequence` executes a container of parallel effects in parallel.
          exportedItems.parallelSequence = (parallelInstance) => {
            return (container) => {
              return parallelTraverseFunction(parallelInstance)(container)(
                categoryDependency.getIdentityElement(categoryDependency.functionCategory)
              );
            };
          };
        })(
          (internalExportMap["Core.Parallel"] =
            internalExportMap["Core.Parallel"] || {})
        );

        // Module: Runtime.Exceptions
        ((exportedItems) => {
          "use strict";

          // Creates a new JavaScript Error object.
          exportedItems.makeErrorObject = (message) => {
            return new Error(message);
          };
          // Throws a given JavaScript Error object.
          exportedItems.throwErrorObject = (errorObj) => {
            return () => {
              throw errorObj;
            };
          };
        })(
          (internalExportMap["Runtime.Exceptions"] =
            internalExportMap["Runtime.Exceptions"] || {})
        );

        // Module: Runtime.Exceptions (extension)
        ((exportedItems) => {
          "use strict";

          const exceptionsDependency = requestDependency("Runtime.Exceptions");
          // Dependencies.
          requestDependency("Core.ApplicativeOps");
          requestDependency("Core.Associative");
          requestDependency("Data.Alternative");
          requestDependency("Data.Mapper");
          requestDependency("Data.Optional");
          requestDependency("Data.Display");
          requestDependency("Runtime.Effect");
          requestDependency("Prelude");

          // Throws an error with a specified message.
          exportedItems.throwExceptionWithMessage = (message) => {
            return exceptionsDependency.throwErrorObject(exceptionsDependency.makeErrorObject(message));
          };
        })(
          (internalExportMap["Runtime.Exceptions"] =
            internalExportMap["Runtime.Exceptions"] || {})
        );

        // Module: Runtime.AsyncFlow (extension)
        ((exportedItems) => {
          "use strict";

          const asyncFlowDependency = requestDependency("Runtime.AsyncFlow");
          // Dependencies.
          requestDependency("Core.Alternative");
          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const applicationDependency = requestDependency("Core.Application");
          const bindingDependency = requestDependency("Core.Binding");
          requestDependency("Core.Lazy");
          const monadicDependency = requestDependency("Core.Monadic");
          requestDependency("Control.Monad.Error.Class");
          requestDependency("Control.Monad.Rec.Class");
          const parallelDependency = requestDependency("Core.Parallel");
          const parallelOpsDependency = requestDependency("Core.ParallelOperations");
          requestDependency("Core.Plus");
          requestDependency("Core.Associative");
          const alternativeDependency = requestDependency("Data.Alternative");
          const foldableDependency = requestDependency("Data.Traversable");
          const funcToolsDependency = requestDependency("Data.FuncTools");
          requestDependency("Data.FuncTools.Uncurried");
          const mapperDependency = requestDependency("Data.Mapper");
          const identityGroupDependency = requestDependency("Data.IdentityGroup");
          requestDependency("Data.NewType");
          const partialGroupDependency = requestDependency("Data.PartialGroup");
          requestDependency("Data.Time.Duration");
          const singletonDependency = requestDependency("Data.Singleton");
          const effectDependency = requestDependency("Runtime.Effect");
          const effectClassDependency = requestDependency("Runtime.EffectClass");
          requestDependency("Runtime.Exceptions");
          requestDependency("Effect.Unchecked");
          const uncheckedPartialDependency = requestDependency("Partial.Unchecked");
          requestDependency("Prelude");
          const uncheckedTypeCastDependency = requestDependency("Unchecked.TypeCast");

          // Utility object for `Either` operations within the `AsyncFlow` context.
          const EitherHandling = {
            isLeft: (value) => {
              if (value instanceof alternativeDependency.ErrorValue) {
                return true;
              }
              if (value instanceof alternativeDependency.SuccessValue) {
                return false;
              }
              throw new Error(
                "Pattern match failure in Runtime.AsyncFlow (line 390, column 12 - line 392, column 20): " +
                  [value.constructor.name]
              );
            },
            fromLeft: (value) => {
              if (value instanceof alternativeDependency.ErrorValue) {
                return value.containedValue;
              }
              if (value instanceof alternativeDependency.SuccessValue) {
                return uncheckedPartialDependency.unsafeCrashWithMessage("unsafeFromLeft: SuccessValue");
              }
              throw new Error(
                "Pattern match failure in Runtime.AsyncFlow (line 395, column 20 - line 399, column 3): " +
                  [value.constructor.name]
              );
            },
            fromRight: (value) => {
              if (value instanceof alternativeDependency.SuccessValue) {
                return value.containedValue;
              }
              if (value instanceof alternativeDependency.ErrorValue) {
                return uncheckedPartialDependency.unsafeCrashWithMessage("unsafeFromRight: ErrorValue");
              }
              throw new Error(
                "Pattern match failure in Runtime.AsyncFlow (line 400, column 21 - line 402, column 31): " +
                  [value.constructor.name]
              );
            },
            left: alternativeDependency.ErrorValue.create,
            right: alternativeDependency.SuccessValue.create,
          };

          // Launches an asynchronous flow, returning a Fiber.
          const initiateAsyncFlow = (flow) => {
            return () => {
              const fiberInstance = asyncFlowDependency.makeFiber(EitherHandling, flow)();
              fiberInstance.run();
              return fiberInstance;
            };
          };

          // Functor instance for parallel asynchronous flows.
          const parallelFlowMapperInstance = new mapperDependency.MapperConstructor(asyncFlowDependency.parallelMap);
          // Functor instance for standard asynchronous flows.
          const asyncFlowMapperInstance = new mapperDependency.MapperConstructor(asyncFlowDependency.mapOperation);

          // Apply instance for parallel asynchronous flows.
          const parallelFlowApplicatorInstance = new applicationDependency.ApplicationConstructor(
            () => parallelFlowMapperInstance,
            asyncFlowDependency.parallelApply
          );
          // Monad instance for standard asynchronous flows.
          const asyncFlowMonadInstance = new monadicDependency.MonadContext(
            () => asyncFlowApplierInstance,
            () => asyncFlowBinderInstance
          );
          // Bind instance for standard asynchronous flows.
          const asyncFlowBinderInstance = new bindingDependency.BindConstructor(
            () => asyncFlowApplicatorInstance,
            asyncFlowDependency.bindOperation
          );
          // Apply instance for standard asynchronous flows.
          const asyncFlowApplicatorInstance = new applicationDependency.ApplicationConstructor(
            () => asyncFlowMapperInstance,
            monadicDependency.monadicApply(asyncFlowMonadInstance)
          );
          // Applicative instance for standard asynchronous flows.
          const asyncFlowApplierInstance = new applicativeOpsDependency.ApplicativeConstructor(
            () => asyncFlowApplicatorInstance,
            asyncFlowDependency.pureOperation
          );
          // MonadEffect instance for asynchronous flows.
          const effectAsyncFlowMonadInstance = new effectClassDependency.MonadEffectType(
            () => asyncFlowMonadInstance,
            asyncFlowDependency.liftEffect
          );
          // Parallel instance for asynchronous flows.
          const asyncFlowParallelInstance = new parallelOpsDependency.ParallelContextType(
            () => parallelFlowApplierInstance,
            () => asyncFlowMonadInstance,
            uncheckedTypeCastDependency.unsafeCoerceType,
            asyncFlowDependency.sequentialExecution
          );
          // Applicative instance for parallel asynchronous flows.
          const parallelFlowApplierInstance = new applicativeOpsDependency.ApplicativeConstructor(
            () => parallelFlowApplicatorInstance,
            (value) =>
              parallelOpsDependency.getParallelFunction(asyncFlowParallelInstance)(
                applicativeOpsDependency.getPureFunction(asyncFlowApplierInstance)(value)
              )
          );

          // Semigroup instance for canceller functions.
          const cancellerPartialGroup = new partialGroupDependency.PartialGroupConstructor((firstCanceller) => {
            return (secondCanceller) => {
              return (fiber) => {
                return parallelDependency.parallelSequence(asyncFlowParallelInstance)(
                  foldableDependency.arrayFoldable
                )([firstCanceller(fiber), secondCanceller(fiber)]);
              };
            };
          });
          // A no-op canceller function.
          const noOpCanceller = funcToolsDependency.constantFunction(
            applicativeOpsDependency.getPureFunction(asyncFlowApplierInstance)(singletonDependency.unit)
          );
          // Monoid instance for canceller functions.
          const cancellerIdentityGroup = new identityGroupDependency.IdentityGroupConstructor(
            () => cancellerPartialGroup,
            noOpCanceller
          );

          // Exporting instances and utilities.
          exportedItems.initiateAsyncFlow = initiateAsyncFlow;
          exportedItems.initiateAsyncFlowVoid = (flow) =>
            mapperDependency.voidMapping(effectDependency.effectMapper)(initiateAsyncFlow(flow));
          exportedItems.noOpCanceller = noOpCanceller;
          exportedItems.asyncFlowMapper = asyncFlowMapperInstance;
          exportedItems.asyncFlowApplicator = asyncFlowApplicatorInstance;
          exportedItems.asyncFlowApplier = asyncFlowApplierInstance;
          exportedItems.asyncFlowBinder = asyncFlowBinderInstance;
          exportedItems.asyncFlowMonad = asyncFlowMonadInstance;
          exportedItems.effectAsyncFlowMonad = effectAsyncFlowMonadInstance;
          exportedItems.parallelFlowMapper = parallelFlowMapperInstance;
          exportedItems.parallelFlowApplicator = parallelFlowApplicatorInstance;
          exportedItems.parallelFlowApplier = parallelFlowApplierInstance;
          exportedItems.asyncFlowParallel = asyncFlowParallelInstance;
          exportedItems.cancellerPartialGroup = cancellerPartialGroup;
          exportedItems.cancellerIdentityGroup = cancellerIdentityGroup;
          exportedItems.createAsyncFlow = asyncFlowDependency.createAsyncFlow;
        })(
          (internalExportMap["Runtime.AsyncFlow"] =
            internalExportMap["Runtime.AsyncFlow"] || {})
        );

        // Module: Node.TextEncoding
        ((exportedItems) => {
          "use strict";

          requestDependency("Node.Encoding"); // Original dependency.
          const displayDependency = requestDependency("Data.Display");
          requestDependency("Prelude");

          // Enum-like constructors for various text encodings.
          const AsciiType = (() => {
            function AsciiEncoding() {}
            AsciiEncoding.value = new AsciiEncoding();
            return AsciiEncoding;
          })();
          const Utf8Type = (() => {
            function Utf8Encoding() {}
            Utf8Encoding.value = new Utf8Encoding();
            return Utf8Encoding;
          })();
          const Utf16leType = (() => {
            function Utf16leEncoding() {}
            Utf16leEncoding.value = new Utf16leEncoding();
            return Utf16leEncoding;
          })();
          const Ucs2Type = (() => {
            function Ucs2Encoding() {}
            Ucs2Encoding.value = new Ucs2Encoding();
            return Ucs2Encoding;
          })();
          const Base64Type = (() => {
            function Base64Encoding() {}
            Base64Encoding.value = new Base64Encoding();
            return Base64Encoding;
          })();
          const Latin1Type = (() => {
            function Latin1Encoding() {}
            Latin1Encoding.value = new Latin1Encoding();
            return Latin1Encoding;
          })();
          const BinaryType = (() => {
            function BinaryEncoding() {}
            BinaryEncoding.value = new BinaryEncoding();
            return BinaryEncoding;
          })();
          const HexType = (() => {
            function HexEncoding() {}
            HexEncoding.value = new HexEncoding();
            return HexEncoding;
          })();

          // Display instance for encoding types.
          const encodingDisplayInstance = new displayDependency.DisplayConstructor((encodingType) => {
            if (encodingType instanceof AsciiType) return "ASCII";
            if (encodingType instanceof Utf8Type) return "UTF8";
            if (encodingType instanceof Utf16leType) return "UTF16LE";
            if (encodingType instanceof Ucs2Type) return "UCS2";
            if (encodingType instanceof Base64Type) return "Base64";
            if (encodingType instanceof Latin1Type) return "Latin1";
            if (encodingType instanceof BinaryType) return "Binary";
            if (encodingType instanceof HexType) return "Hex";
            throw new Error(
              "Pattern match failure in Node.TextEncoding (line 19, column 1 - line 19, column 39): " +
                [encodingType.constructor.name]
            );
          });

          // Converts an encoding type to its corresponding Node.js string representation.
          exportedItems.toNodeEncodingString = (encodingType) => {
            if (encodingType instanceof AsciiType) return "ascii";
            if (encodingType instanceof Utf8Type) return "utf8";
            if (encodingType instanceof Utf16leType) return "utf16le";
            if (encodingType instanceof Ucs2Type) return "ucs2";
            if (encodingType instanceof Base64Type) return "base64";
            if (encodingType instanceof Latin1Type) return "latin1";
            if (encodingType instanceof BinaryType) return "binary";
            if (encodingType instanceof HexType) return "hex";
            throw new Error(
              "Pattern match failure in Node.TextEncoding (line 31, column 1 - line 31, column 37): " +
                [encodingType.constructor.name]
            );
          };

          // Exporting encoding types and display instance.
          exportedItems.AsciiType = AsciiType;
          exportedItems.Utf8Type = Utf8Type;
          exportedItems.Utf16leType = Utf16leType;
          exportedItems.Ucs2Type = Ucs2Type;
          exportedItems.Base64Type = Base64Type;
          exportedItems.Latin1Type = Latin1Type;
          exportedItems.BinaryType = BinaryType;
          exportedItems.HexType = HexType;
          exportedItems.encodingDisplay = encodingDisplayInstance;
        })(
          (internalExportMap["Node.TextEncoding"] =
            internalExportMap["Node.TextEncoding"] || {})
        );

        // Module: Node.SystemProcess
        ((exportedItems) => {
          "use strict";

          // Exposes the global Node.js `process` object.
          (exportedItems["Node.SystemProcess"] =
            exportedItems["Node.SystemProcess"] || {}).nodeProcessObject = process;
        })(); // Self-invoking for Node.SystemProcess

        // Module: Node.IOStream
        ((exportedItems) => {
          "use strict";

          // Implementation for reading a data chunk, branching on type (Buffer or String).
          exportedItems.readChunkImplementation = (ifString) => {
            return (ifBuffer) => {
              return (chunk) => {
                if (chunk instanceof Buffer) {
                  return ifBuffer(chunk);
                }
                if (typeof chunk === "string") {
                  return ifString(chunk);
                }
                throw new Error(
                  "Node.IOStream.readChunkImplementation: Unrecognized chunk type; expected String or Buffer, got: " +
                    chunk
                );
              };
            };
          };
          // Implementation for attaching a 'data' event listener to a stream.
          exportedItems.onDataEitherImplementation = (chunkReader) => {
            return (stream) => {
              return (callback) => {
                return () => {
                  stream.on("data", (dataChunk) => {
                    callback(chunkReader(dataChunk))();
                  });
                };
              };
            };
          };
          // Attaches an 'end' event listener to a stream.
          exportedItems.onStreamEnd = (stream) => {
            return (callback) => {
              return () => {
                stream.on("end", callback);
              };
            };
          };
          // Writes generic data to a stream.
          exportedItems.writeToStream = (stream) => {
            return (data) => {
              return (callback) => {
                return () => {
                  return stream.write(data, null, callback);
                };
              };
            };
          };
          // Writes a string to a stream with a specified encoding.
          exportedItems.writeStringToStreamImplementation = (stream) => {
            return (encoding) => {
              return (data) => {
                return (callback) => {
                  return () => {
                    return stream.write(data, encoding, callback);
                  };
                };
              };
            };
          };
        })(
          (internalExportMap["Node.IOStream"] =
            internalExportMap["Node.IOStream"] || {})
        );

        // Module: Node.ByteBuffer
        ((exportedItems) => {
          "use strict";

          // Implementation for converting a Buffer to a string with a given encoding.
          (exportedItems["Node.ByteBuffer"] =
            exportedItems["Node.ByteBuffer"] || {}).bufferToStringImpl = (
            encoding
          ) => {
            return (bufferObject) => {
              return () => {
                return bufferObject.toString(encoding);
              };
            };
          };
        })(); // Self-invoking for Node.ByteBuffer

        // Module: Node.ByteBuffer (extension)
        ((exportedItems) => {
          "use strict";

          const byteBufferDependency = requestDependency("Node.ByteBuffer");
          // Dependencies.
          requestDependency("Core.Associative");
          requestDependency("Data.ArrayBuffer.Types");
          requestDependency("Data.Optional");
          requestDependency("Data.Display");
          requestDependency("Runtime.Effect");
          const textEncodingDependency = requestDependency("Node.TextEncoding");
          requestDependency("Prelude");

          // Converts a Buffer to a string using a specified text encoding type.
          exportedItems.bufferToString = (encodingType) => {
            return byteBufferDependency.bufferToStringImpl(
              textEncodingDependency.toNodeEncodingString(encodingType)
            );
          };
        })(
          (internalExportMap["Node.ByteBuffer"] =
            internalExportMap["Node.ByteBuffer"] || {})
        );

        // Module: Node.IOStream (extension)
        ((exportedItems) => {
          "use strict";

          const ioStreamDependency = requestDependency("Node.IOStream");
          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const bindingDependency = requestDependency("Core.Binding");
          const alternativeDependency = requestDependency("Data.Alternative");
          requestDependency("Data.Mapper");
          requestDependency("Data.Optional");
          requestDependency("Data.Display");
          const effectDependency = requestDependency("Runtime.Effect");
          const exceptionsDependency = requestDependency("Runtime.Exceptions");
          const byteBufferDependency = requestDependency("Node.ByteBuffer");
          const textEncodingDependency = requestDependency("Node.TextEncoding");
          requestDependency("Prelude");

          // A chunk reader that returns an `Either` type (ErrorValue for string, SuccessValue for Buffer).
          const chunkReader = ioStreamDependency.readChunkImplementation(
            alternativeDependency.ErrorValue.create
          )(alternativeDependency.SuccessValue.create);
          // Attaches a 'data' event handler that returns an `Either` value.
          const dataEventHandler = (stream) => {
            return ioStreamDependency.onDataEitherImplementation(chunkReader)(stream);
          };
          // Attaches a 'data' event handler, specifically for string data, handling potential encoding errors.
          const stringDataStreamHandler = (stream) => {
            return (callback) => {
              return dataEventHandler(stream)(
                bindingDependency.composeKleisliFlipped(effectDependency.effectBinder)(callback)(
                  (eitherValue) => {
                    if (eitherValue instanceof alternativeDependency.ErrorValue) {
                      return exceptionsDependency.throwExceptionWithMessage("Stream encoding should not be set");
                    }
                    if (eitherValue instanceof alternativeDependency.SuccessValue) {
                      return applicativeOpsDependency.getPureFunction(effectDependency.effectApplier)(
                        eitherValue.containedValue
                      );
                    }
                    throw new Error(
                      "Pattern match failure in Node.IOStream (line 94, column 5 - line 98, column 17): " +
                        [eitherValue.constructor.name]
                    );
                  }
                )
              );
            };
          };

          // Exporting stream utilities.
          exportedItems.stringDataStreamHandler = stringDataStreamHandler;
          exportedItems.stringDataStreamHandlerWithEncoding = (stream) => {
            return (encoding) => {
              return (callback) => {
                return stringDataStreamHandler(stream)(
                  bindingDependency.composeKleisliFlipped(effectDependency.effectBinder)(callback)(
                    byteBufferDependency.bufferToString(encoding)
                  )
                );
              };
            };
          };
          exportedItems.dataEventHandler = dataEventHandler;
          // Writes a string to a stream, using the display instance for encoding.
          exportedItems.writeStreamString = (stream) => {
            return (encoding) => {
              return ioStreamDependency.writeStringToStreamImplementation(stream)(
                displayDependency.callDisplayMethod(textEncodingDependency.encodingDisplay)(encoding)
              );
            };
          };
          exportedItems.onStreamEnd = ioStreamDependency.onStreamEnd;
        })(
          (internalExportMap["Node.IOStream"] =
            internalExportMap["Node.IOStream"] || {})
        );

        // Module: Node.SystemProcess (extension)
        ((exportedItems) => {
          "use strict";

          const systemProcessDependency = requestDependency("Node.SystemProcess");
          // Dependencies.
          requestDependency("Data.Mapper");
          requestDependency("Data.Optional");
          requestDependency("Data.Posix");
          requestDependency("Data.Posix.Signal");
          requestDependency("Runtime.Effect");
          requestDependency("Foreign.Object");
          requestDependency("Node.Platform");
          requestDependency("Node.IOStream");
          requestDependency("Prelude");
          requestDependency("Unchecked.TypeCast");

          // Reference to the standard output stream.
          const standardOutput = systemProcessDependency.nodeProcessObject.stdout;
          // Reference to the standard input stream.
          const standardInput = systemProcessDependency.nodeProcessObject.stdin;

          // Exporting standard I/O streams.
          exportedItems.standardInput = standardInput;
          exportedItems.standardOutput = standardOutput;
        })(
          (internalExportMap["Node.SystemProcess"] =
            internalExportMap["Node.SystemProcess"] || {})
        );

        // Module: CodeChallengeSolution
        ((exportedItems) => {
          "use strict";

          const applicativeOpsDependency = requestDependency("Core.ApplicativeOps");
          const bindingDependency = requestDependency("Core.Binding");
          const categoryDependency = requestDependency("Core.Categorization");
          const vectorDependency = requestDependency("Data.Vector");
          const alternativeDependency = requestDependency("Data.Alternative");
          const mapperDependency = requestDependency("Data.Mapper");
          const integerDependency = requestDependency("Data.Integer");
          const identityGroupDependency = requestDependency("Data.IdentityGroup");
          const semiRingDependency = requestDependency("Data.SemiRing");
          const displayDependency = requestDependency("Data.Display");
          requestDependency("Data.String");
          const stringUtilDependency = requestDependency("Data.StringUtilities");
          const singletonDependency = requestDependency("Data.Singleton");
          const effectDependency = requestDependency("Runtime.Effect");
          const asyncFlowDependency = requestDependency("Runtime.AsyncFlow");
          const effectClassDependency = requestDependency("Runtime.EffectClass");
          const mutableRefDependency = requestDependency("Runtime.MutableReference");
          const textEncodingDependency = requestDependency("Node.TextEncoding");
          const systemProcessDependency = requestDependency("Node.SystemProcess");
          const ioStreamDependency = requestDependency("Node.IOStream");
          const uncheckedPartialDependency = requestDependency("Partial.Unchecked");
          requestDependency("Prelude");

          // Function to calculate the solution based on the input string.
          const computeSolution = (inputString) => {
            return alternativeDependency.processEither(
              (errorMsg) => uncheckedPartialDependency.unsafeCrashWithMessage(errorMsg)
            )(
              categoryDependency.getIdentityElement(categoryDependency.functionCategory)
            )(
              bindingDependency.getBindFunction(alternativeDependency.alternativeBinder)(
                alternativeDependency.noteError("Input number parsing failed")(
                  integerDependency.base10IntegerParser(stringUtilDependency.trimWhiteSpace(inputString))
                )
              )(
                (parsedNumber) =>
                  applicativeOpsDependency.getPureFunction(alternativeDependency.alternativeApplier)(
                    displayDependency.callDisplayMethod(displayDependency.integerDisplay)(
                      vectorDependency.filterCollection((num) => num >= parsedNumber)(
                        mapperDependency.getMapFunction(mapperDependency.arrayMapper)(
                          semiRingDependency.getMulOperation(semiRingDependency.integerSemiRing)(111)
                        )(vectorDependency.createRange(1)(9))
                      )[0]
                    ) + "\n"
                  )
              )
            );
          };

          // Asynchronous flow to read all input from stdin.
          const readInputFlow = asyncFlowDependency.createAsyncFlow((resolver) => {
            return () => {
              const inputBufferReference = mutableRefDependency.createNewRef("")();
              ioStreamDependency.stringDataStreamHandlerWithEncoding(systemProcessDependency.standardInput)(
                textEncodingDependency.Utf8Type.value
              )((chunk) => {
                return () => {
                  const currentBufferContent = mutableRefDependency.readRefValue(inputBufferReference)();
                  return mutableRefDependency.writeRefValue(currentBufferContent + chunk)(inputBufferReference)();
                };
              })();
              ioStreamDependency.onStreamEnd(systemProcessDependency.standardInput)(() => {
                const finalBufferContent = mutableRefDependency.readRefValue(inputBufferReference)();
                return resolver(
                  applicativeOpsDependency.getPureFunction(alternativeDependency.alternativeApplier)(finalBufferContent)
                )();
              })();
              return identityGroupDependency.getEmptyValue(asyncFlowDependency.cancellerIdentityGroup);
            };
          });

          // The main execution flow of the application.
          const primaryExecutionFlow = asyncFlowDependency.initiateAsyncFlowVoid(
            bindingDependency.getBindFunction(asyncFlowDependency.asyncFlowBinder)(readInputFlow)(
              (inputContent) =>
                bindingDependency.getBindFunction(asyncFlowDependency.asyncFlowBinder)(
                  applicativeOpsDependency.getPureFunction(asyncFlowDependency.asyncFlowApplier)(
                    computeSolution(inputContent)
                  )
                )(
                  (solutionString) =>
                    effectClassDependency.getLiftEffect(asyncFlowDependency.effectAsyncFlowMonad)(
                      ((outputString) =>
                        mapperDependency.voidMapping(effectDependency.effectMapper)(
                          ioStreamDependency.writeStreamString(systemProcessDependency.standardOutput)(
                            textEncodingDependency.Utf8Type.value
                          )(outputString)(
                            applicativeOpsDependency.getPureFunction(effectDependency.effectApplier)(
                              singletonDependency.unit
                            )
                          )
                        ))(solutionString)
                    )
                )
            )
          );

          // Exporting the main entry point and the solution function.
          exportedItems.mainApplicationEntry = primaryExecutionFlow;
          exportedItems.computeSolution = computeSolution;
        })(
          (internalExportMap["CodeChallengeSolution"] =
            internalExportMap["CodeChallengeSolution"] || {})
        );

        // Assign the aggregated exports to the current module's exports.
        currentModuleInstance.exports = internalExportMap;
      },
      {}, // Resolver for this module's internal dependencies (empty in this case).
    ],
  },
  {}, // Initially empty cache for loaded modules.
  ["ApplicationRoot"], // Specifies "ApplicationRoot" as the primary entry point.
  null // No global variable name for the final export.
);

// Execute the main function of the CodeChallengeSolution module.
customModuleLoader.moduleDefinitions["ApplicationRoot"][0].call(
  customModuleLoader.moduleCache["ApplicationRoot"].exports,
  customModuleLoader.moduleCache["ApplicationRoot"].exports["CodeChallengeSolution"].mainApplicationEntry
);