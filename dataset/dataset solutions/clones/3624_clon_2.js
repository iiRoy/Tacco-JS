moduleOverseer = function (sourceFiles, moduleCache, startupScripts, exportIdentifier) {
  /*
   * This section initializes the core module loading system.
   * It sets up references to external loaders and defines the main loading logic.
   */
  var issueContainer, // Variable to hold any exceptions encountered during module initialization.
    priorLoader = "function" == typeof moduleOverseer && moduleOverseer, // Captures a previously defined loader (if any).
    nodeRequireFn = "function" == typeof require && require; // References Node.js's native 'require' function.

  /**
   * The primary function responsible for retrieving and executing modules.
   * It handles caching, dependency resolution, and error management.
   * @param {string} componentId - The unique identifier or path of the module to be loaded.
   * @param {boolean} isPrimary - A flag indicating if this is the initial or primary load request.
   * @returns {*} The exported members of the requested module.
   * @throws {Error} If the specified module or its dependencies cannot be found.
   */
  function loadComponent(componentId, isPrimary) {
    // Check if the module is already present in the cache.
    if (!moduleCache[componentId]) {
      // If the module's definition is not available in the source files.
      if (!sourceFiles[componentId]) {
        // Attempt to delegate loading to an external loader if available and not a primary call.
        var localLoader = "function" == typeof moduleOverseer && moduleOverseer;
        if (!isPrimary && localLoader) return localLoader(componentId, !0);
        // Fallback to the 'priorLoader' if it was captured.
        if (priorLoader) return priorLoader(componentId, !0);
        // As a last resort, try Node.js's native 'require' for string identifiers.
        if (nodeRequireFn && "string" == typeof componentId) return nodeRequireFn(componentId);

        // If all loading attempts fail, construct and throw a 'module not found' error.
        var loadingProblem = new Error("Cannot find module '" + componentId + "'");
        throw (loadingProblem.code = "MODULE_NOT_FOUND", loadingProblem);
      }

      // Configure the module's local dependency resolver.
      dependencyLoader.mapIdentifier = function (resolvedPath) {
        return sourceFiles[componentId][1][resolvedPath] || resolvedPath;
      };
      dependencyLoader.localModuleCache = {}; // Initialize a fresh cache for this module's dependencies.

      // Create a new module object and add it to the cache.
      var moduleObject = moduleCache[componentId] = new loadComponent.Component(componentId);
      // Execute the module's source code within its own scope, providing necessary context.
      sourceFiles[componentId][0].call(moduleObject.output, dependencyLoader, moduleObject, moduleObject.output, this);
    }
    // Return the exports of the successfully loaded module from the cache.
    return moduleCache[componentId].output;

    /**
     * A localized 'require' function provided to each module for resolving its dependencies.
     * @param {string} requestedPath - The identifier or path of the dependency.
     * @returns {*} The exports of the required dependency.
     */
    function dependencyLoader(requestedPath) {
      return loadComponent(dependencyLoader.mapIdentifier(requestedPath));
    }
  }

  // Mark this loader as a recognized resource assembler for introspection.
  loadComponent.isResourceAssembler = !0;

  /**
   * Constructor for creating a module component object.
   * Each module loaded by this system will have an instance of this class.
   * @param {string} componentId - The unique identifier of the module.
   */
  loadComponent.Component = function (componentId) {
    this.componentId = componentId; // Stores the module's unique ID.
    this.assembler = loadComponent; // A reference back to the main module loader.
    this.output = {}; // The object that will contain the module's exports.
  };

  // Attach internal data structures to the main loader function for global access.
  loadComponent.sources = sourceFiles; // The collection of all module source definitions.
  loadComponent.componentCache = moduleCache; // The cache of already loaded modules.
  loadComponent.ancestor = priorLoader; // A link to any parent loader.

  /**
   * Registers a new module definition with the loader, making it available for import.
   * @param {string} moduleId - The unique identifier for the new module.
   * @param {*} moduleContent - The actual content or exports of the module.
   */
  loadComponent.addDefinition = function (moduleId, moduleContent) {
    sourceFiles[moduleId] = [function (moduleScope, moduleObject) {
      moduleObject.output = moduleContent;
    }, {}];
  };

  // Iterate through the list of initial startup scripts and attempt to load each one.
  for (var idx = 0; idx < startupScripts.length; idx++) {
    try {
      loadComponent(startupScripts[idx]);
    } catch (err) {
      // If an error occurs during startup, capture it if no other error has been caught.
      issueContainer || (issueContainer = err);
    }
  }

  // If there are startup scripts, determine how to expose the final module's exports.
  if (startupScripts.length) {
    var lastComponent = loadComponent(startupScripts[startupScripts.length - 1]);
    // Handle CommonJS, AMD, or global object export patterns.
    "object" == typeof exports && "undefined" != typeof module ? module.exports = lastComponent : "function" == typeof define && define.amd ? define(function () {
      return lastComponent;
    }) : exportIdentifier && (this[exportIdentifier] = lastComponent);
  }

  // Update the global 'moduleOverseer' reference to this newly configured loader.
  moduleOverseer = loadComponent;

  // If any error was captured during startup, re-throw it to indicate failure.
  if (issueContainer) throw issueContainer;

  // Return the fully configured module loading function.
  return loadComponent;
}({
  /*
   * This object defines the actual module contents, keyed by their identifiers.
   * The 'BaseUtils' module contains a large PureScript runtime environment.
   */
  "BaseUtils": [function (demand, component, outbound) {
    var globalContext = {}; // An object to hold all PureScript module definitions.

    /*
     * Module: Flow.Applicator (Control.Apply)
     * Provides functions for applying a list of functions to a list of values.
     */
    !function (moduleScope) {
      "use strict";
      (globalContext["Flow.Applicator"] = globalContext["Flow.Applicator"] || {}).sequenceMapper = function (sourceList) {
        return function (targetList) {
          // Calculate lengths for loop optimization.
          for (
            var srcLen = sourceList.length,
            tgtLen = targetList.length,
            resultArray = new Array(srcLen * tgtLen), // Pre-allocate array for performance.
            resultIdx = 0,
            srcIdx = 0;
            srcIdx < srcLen;
            srcIdx++
          ) {
            for (
              var currentItem = sourceList[srcIdx], // Get current function from source list.
              tgtIdx = 0;
              tgtIdx < tgtLen;
              tgtIdx++
            ) {
              resultArray[resultIdx++] = currentItem(targetList[tgtIdx]); // Apply function and store result.
            }
          }
          return resultArray;
        };
      };
    }(),

    /*
     * Module: Flow.Combinator (Control.Semigroupoid)
     * Defines the concept of composition for binary operations.
     */
    function (moduleScope) {
      "use strict";
      var CombinatorClass = function (compositionFunction) {
        this.combineOps = compositionFunction;
      },
      functionCombinator = new CombinatorClass(function (firstFn) {
        return function (secondFn) {
          return function (inputVal) {
            return firstFn(secondFn(inputVal)); // Standard function composition.
          };
        };
      });
      moduleScope.combineOps = function (instance) {
        return instance.combineOps;
      };
      moduleScope.CombinatorClass = CombinatorClass;
      moduleScope.functionCombinator = functionCombinator;
    }(globalContext["Flow.Combinator"] = globalContext["Flow.Combinator"] || {}),

    /*
     * Module: Flow.Hierarchy (Control.Category)
     * Extends Semigroupoid with an identity element.
     */
    function (moduleScope) {
      "use strict";
      var combinatorModule = globalContext["Flow.Combinator"],
        hierarchyClass = function (combinatorBase, identityFunc) {
          this.CombinatorBase0 = combinatorBase;
          this.elementIdentity = identityFunc;
        },
        identityInstance = new hierarchyClass(function () {
          return combinatorModule.functionCombinator;
        }, function (val) {
          return val;
        }); // The identity function.
      moduleScope.HierarchyClass = hierarchyClass;
      moduleScope.elementIdentity = function (instance) {
        return instance.elementIdentity;
      };
      moduleScope.functionHierarchy = identityInstance;
    }(globalContext["Flow.Hierarchy"] = globalContext["Flow.Hierarchy"] || {}),

    /*
     * Module: Core.Logic (Data.Boolean)
     * Basic boolean utilities.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.Logic"] = globalContext["Core.Logic"] || {}).elseCondition = !0; // Represents a 'true' boolean value.
    }(),

    /*
     * Module: Core.Algebra (Data.Ring)
     * Algebraic structure with addition, multiplication, and subtraction.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.Algebra"] = globalContext["Core.Algebra"] || {}).integerSubtraction = function (firstInt) {
        return function (secondInt) {
          return firstInt - secondInt | 0; // Integer subtraction with bitwise OR for type hinting.
        };
      };
    }(),

    /*
     * Module: Core.AlgebraicOps (Data.Semiring)
     * Algebraic structure with addition and multiplication.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.integerAddition = function (firstInt) {
        return function (secondInt) {
          return firstInt + secondInt | 0; // Integer addition.
        };
      };
      moduleScope.integerMultiplication = function (firstInt) {
        return function (secondInt) {
          return firstInt * secondInt | 0; // Integer multiplication.
        };
      };
    }(globalContext["Core.AlgebraicOps"] = globalContext["Core.AlgebraicOps"] || {}),

    /*
     * Module: Core.UnitType (Data.Unit)
     * Defines a type with only one value, often used as a placeholder.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.UnitType"] = globalContext["Core.UnitType"] || {}).singletonValue = {}; // The single value of the Unit type.
    }(),

    /*
     * Module: Core.Display (Data.Show)
     * Provides a way to convert values into a string representation.
     */
    function (moduleScope) {
      "use strict";
      // Unused imports from the original minified code are kept for structural fidelity.
      globalContext["Core.Display"], globalContext["Data.Symbol"], globalContext["Record.Unsafe"], globalContext["Type.Data.RowList"];
      moduleScope.DisplayClass = function (renderFunction) {
        this.renderValue = renderFunction;
      };
      moduleScope.renderValue = function (instance) {
        return instance.renderValue;
      };
    }(globalContext["Core.Display"] = globalContext["Core.Display"] || {}),

    /*
     * Module: Core.UnitType (Data.Unit) - Re-export for consistency with minified code.
     */
    function (moduleScope) {
      "use strict";
      var unitModule = globalContext["Core.UnitType"];
      globalContext["Core.Display"];
      moduleScope.singletonValue = unitModule.singletonValue;
    }(globalContext["Core.UnitType"] = globalContext["Core.UnitType"] || {}),

    /*
     * Module: Core.AlgebraicOps (Data.Semiring) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var semiringModule = globalContext["Core.AlgebraicOps"],
        semiringConstructor = (globalContext["Data.Symbol"], globalContext["Core.UnitType"], globalContext["Record.Unsafe"], globalContext["Type.Data.Row"], globalContext["Type.Data.RowList"], function (addOp, mulOp, oneVal, zeroVal) {
          this.additionOp = addOp, this.multiplicationOp = mulOp, this.identityOne = oneVal, this.identityZero = zeroVal;
        }),
        integerSemiringInstance = new semiringConstructor(semiringModule.integerAddition, semiringModule.integerMultiplication, 1, 0);
      moduleScope.SemiringClass = semiringConstructor;
      moduleScope.additionOp = function (instance) {
        return instance.additionOp;
      };
      moduleScope.identityZero = function (instance) {
        return instance.identityZero;
      };
      moduleScope.multiplicationOp = function (instance) {
        return instance.multiplicationOp;
      };
      moduleScope.identityOne = function (instance) {
        return instance.identityOne;
      };
      moduleScope.integerSemiringInstance = integerSemiringInstance;
    }(globalContext["Core.AlgebraicOps"] = globalContext["Core.AlgebraicOps"] || {}),

    /*
     * Module: Core.Algebra (Data.Ring) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var ringModule = globalContext["Core.Algebra"],
        semiringModule = globalContext["Core.AlgebraicOps"],
        ringConstructor = (globalContext["Data.Symbol"], globalContext["Core.UnitType"], globalContext["Record.Unsafe"], globalContext["Type.Data.RowList"], function (semiringBase, subOp) {
          this.SemiringBase0 = semiringBase, this.subtractionOp = subOp;
        }),
        integerRingInstance = new ringConstructor(function () {
          return semiringModule.integerSemiringInstance;
        }, ringModule.integerSubtraction);
      moduleScope.RingClass = ringConstructor;
      moduleScope.subtractionOp = function (instance) {
        return instance.subtractionOp;
      };
      moduleScope.integerRingInstance = integerRingInstance;
    }(globalContext["Core.Algebra"] = globalContext["Core.Algebra"] || {}),

    /*
     * Module: Core.Functional (Data.Function)
     * Provides utilities for working with functions.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Hierarchy"], globalContext["Core.Logic"], globalContext["Data.Ord"], globalContext["Core.Algebra"];
      moduleScope.reverseArgs = function (func) {
        return function (argB) {
          return function (argA) {
            return func(argA)(argB); // Flips the order of the first two arguments.
          };
        };
      };
      moduleScope.alwaysReturn = function (val) {
        return function (ignored) {
          return val; // Creates a constant function.
        };
      };
    }(globalContext["Core.Functional"] = globalContext["Core.Functional"] || {}),

    /*
     * Module: Flow.Mapper (Data.Functor)
     * Defines mapping operations over data structures.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Flow.Mapper"] = globalContext["Flow.Mapper"] || {}).listTransform = function (transformFn) {
        return function (inputList) {
          for (
            var listLen = inputList.length,
            resultList = new Array(listLen), // Pre-allocate result array.
            idx = 0;
            idx < listLen;
            idx++
          ) {
            resultList[idx] = transformFn(inputList[idx]); // Apply transform to each element.
          }
          return resultList;
        };
      };
    }(),

    /*
     * Module: Flow.Mapper (Data.Functor) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var functorModule = globalContext["Flow.Mapper"],
        combinatorModule = (globalContext["Flow.Combinator"], globalContext["Core.Functional"]),
        unitModule = globalContext["Core.UnitType"],
        mapperClass = function (mapFunc) {
          this.transformCollection = mapFunc;
        },
        mapFunction = function (instance) {
          return instance.transformCollection;
        },
        arrayListMapperInstance = new mapperClass(functorModule.listTransform);
      moduleScope.MapperClass = mapperClass;
      moduleScope.transformCollection = mapFunction;
      moduleScope.discardResult = function (instance) {
        return mapFunction(instance)(combinatorModule.alwaysReturn(unitModule.singletonValue));
      };
      moduleScope.arrayListMapperInstance = arrayListMapperInstance;
    }(globalContext["Flow.Mapper"] = globalContext["Flow.Mapper"] || {}),

    /*
     * Module: Flow.Applicator (Control.Apply) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var applyModule = globalContext["Flow.Applicator"],
        hierarchyModule = globalContext["Flow.Hierarchy"],
        functionalModule = globalContext["Core.Functional"],
        mapperModule = globalContext["Flow.Mapper"],
        applicatorClass = function (functorBase, applyFunc) {
          this.FunctorBase0 = functorBase, this.applyToValue = applyFunc;
        },
        arrayListApplicatorInstance = new applicatorClass(function () {
          return mapperModule.arrayListMapperInstance;
        }, applyModule.sequenceMapper),
        applyFunction = function (instance) {
          return instance.applyToValue;
        };
      moduleScope.ApplicatorClass = applicatorClass;
      moduleScope.applyToValue = applyFunction;
      moduleScope.applyThenDiscard = function (instance) {
        return function (valB) {
          return function (valA) {
            return applyFunction(instance)(mapperModule.transformCollection(instance.FunctorBase0())(functionalModule.alwaysReturn(hierarchyModule.elementIdentity(hierarchyModule.functionHierarchy)))(valB))(valA);
          };
        };
      };
      moduleScope.arrayListApplicatorInstance = arrayListApplicatorInstance;
    }(globalContext["Flow.Applicator"] = globalContext["Flow.Applicator"] || {}),

    /*
     * Module: Flow.PureApplicator (Control.Applicative)
     * Extends Apply with a 'pure' function to lift values into the context.
     */
    function (moduleScope) {
      "use strict";
      var applyModule = globalContext["Flow.Applicator"],
        pureApplicatorClass = (globalContext["Flow.Mapper"], globalContext["Core.UnitType"], function (applyBase, pureFunc) {
          this.ApplyBase0 = applyBase, this.wrapValue = pureFunc;
        }),
        pureFunction = function (instance) {
          return instance.wrapValue;
        },
        arrayListPureApplicatorInstance = new pureApplicatorClass(function () {
          return applyModule.arrayListApplicatorInstance;
        }, function (val) {
          return [val]; // For arrays, pure means wrapping in a single-element array.
        });
      moduleScope.PureApplicatorClass = pureApplicatorClass;
      moduleScope.wrapValue = pureFunction;
      moduleScope.liftOneArg = function (instance) {
        return function (func) {
          return function (value) {
            return applyModule.applyToValue(instance.ApplyBase0())(pureFunction(instance)(func))(value);
          };
        };
      };
      moduleScope.arrayListPureApplicatorInstance = arrayListPureApplicatorInstance;
    }(globalContext["Flow.PureApplicator"] = globalContext["Flow.PureApplicator"] || {}),

    /*
     * Module: Flow.Chainer (Control.Bind)
     * Provides sequencing operations for monadic contexts.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Flow.Chainer"] = globalContext["Flow.Chainer"] || {}).listChain = function (list) {
        return function (chainFunc) {
          for (
            var resultList = [],
            idx = 0,
            listLen = list.length;
            idx < listLen;
            idx++
          ) {
            Array.prototype.push.apply(resultList, chainFunc(list[idx])); // Apply chainFunc and flatten results.
          }
          return resultList;
        };
      };
    }(),

    /*
     * Module: Flow.Chainer (Control.Bind) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var bindModule = globalContext["Flow.Chainer"],
        applicativeModule = (globalContext["Flow.PureApplicator"], globalContext["Flow.Applicator"]),
        functionalModule = (globalContext["Flow.Hierarchy"], globalContext["Core.Functional"]),
        chainerClass = (globalContext["Flow.Mapper"], globalContext["Core.UnitType"], function (applyBase, bindFunc) {
          this.ApplyBase0 = applyBase, this.chainOperation = bindFunc;
        }),
        discardClass = function (discardFunc) {
          this.discardOperation = discardFunc;
        },
        arrayListChainerInstance = new chainerClass(function () {
          return applicativeModule.arrayListApplicatorInstance;
        }, bindModule.listChain),
        chainFunction = function (instance) {
          return instance.chainOperation;
        },
        flippedChainFunction = function (instance) {
          return functionalModule.reverseArgs(chainFunction(instance));
        },
        unitDiscardInstance = new discardClass(function (instance) {
          return chainFunction(instance);
        });
      moduleScope.ChainerClass = chainerClass;
      moduleScope.chainOperation = chainFunction;
      moduleScope.chainOperationFlipped = flippedChainFunction;
      moduleScope.DiscardClass = discardClass;
      moduleScope.discardOperation = function (instance) {
        return instance.discardOperation;
      };
      moduleScope.composeMonadicFlipped = function (instance) {
        return function (funcA) {
          return function (funcB) {
            return function (value) {
              return flippedChainFunction(instance)(funcB)(funcA(value));
            };
          };
        };
      };
      moduleScope.arrayListChainerInstance = arrayListChainerInstance;
      moduleScope.unitDiscardInstance = unitDiscardInstance;
    }(globalContext["Flow.Chainer"] = globalContext["Flow.Chainer"] || {}),

    /*
     * Module: Core.Combinable (Data.Semigroup)
     * Defines an associative binary operation for combining values.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.Combinable"] = globalContext["Core.Combinable"] || {}).concatenateLists = function (listA) {
        return function (listB) {
          // Optimize for empty lists to avoid unnecessary concatenations.
          return 0 === listA.length ? listB : 0 === listB.length ? listA : listA.concat(listB);
        };
      };
    }(),

    /*
     * Module: Core.Combinable (Data.Semigroup) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var semigroupModule = globalContext["Core.Combinable"],
        combinableClass = (globalContext["Data.Symbol"], globalContext["Core.UnitType"], globalContext["Data.Void"], globalContext["Record.Unsafe"], globalContext["Type.Data.RowList"], function (appendFunc) {
          this.combineElements = appendFunc;
        }),
        arrayListCombinableInstance = new combinableClass(semigroupModule.concatenateLists);
      moduleScope.CombinableClass = combinableClass;
      moduleScope.combineElements = function (instance) {
        return instance.combineElements;
      };
      moduleScope.arrayListCombinableInstance = arrayListCombinableInstance;
    }(globalContext["Core.Combinable"] = globalContext["Core.Combinable"] || {}),

    /*
     * Module: Flow.Alternative (Control.Alt)
     * Provides a choice operator for a Functor.
     */
    function (moduleScope) {
      "use strict";
      var functorModule = globalContext["Flow.Mapper"],
        semigroupModule = globalContext["Core.Combinable"],
        alternativeClass = function (functorBase, altFunc) {
          this.FunctorBase0 = functorBase, this.chooseAlternative = altFunc;
        },
        arrayListAlternativeInstance = new alternativeClass(function () {
          return functorModule.arrayListMapperInstance;
        }, semigroupModule.combineElements(semigroupModule.arrayListCombinableInstance)); // For arrays, 'alt' is concatenation.
      moduleScope.AlternativeClass = alternativeClass;
      moduleScope.chooseAlternative = function (instance) {
        return instance.chooseAlternative;
      };
      moduleScope.arrayListAlternativeInstance = arrayListAlternativeInstance;
    }(globalContext["Flow.Alternative"] = globalContext["Flow.Alternative"] || {}),

    /*
     * Module: Flow.Additive (Control.Plus)
     * Extends Alt with an 'empty' element.
     */
    function (moduleScope) {
      "use strict";
      var altModule = globalContext["Flow.Alternative"],
        additiveClass = (globalContext["Flow.Mapper"], function (altBase, emptyVal) {
          this.AltBase0 = altBase, this.getEmptyValue = emptyVal;
        }),
        arrayListAdditiveInstance = new additiveClass(function () {
          return altModule.arrayListAlternativeInstance;
        }, []); // For arrays, 'empty' is an empty array.
      moduleScope.AdditiveClass = additiveClass;
      moduleScope.getEmptyValue = function (instance) {
        return instance.getEmptyValue;
      };
      moduleScope.arrayListAdditiveInstance = arrayListAdditiveInstance;
    }(globalContext["Flow.Additive"] = globalContext["Flow.Additive"] || {}),

    /*
     * Module: Flow.OptionApplicator (Control.Alternative)
     * Combines Applicative and Plus type classes.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Alternative"];
      var applicativeModule = globalContext["Flow.PureApplicator"],
        plusModule = (globalContext["Flow.Applicator"], globalContext["Flow.Additive"]),
        optionApplicatorClass = (globalContext["Flow.Mapper"], function (applicativeBase, plusBase) {
          this.ApplicativeBase0 = applicativeBase, this.PlusBase1 = plusBase;
        }),
        arrayListOptionApplicatorInstance = new optionApplicatorClass(function () {
          return applicativeModule.arrayListPureApplicatorInstance;
        }, function () {
          return plusModule.arrayListAdditiveInstance;
        });
      moduleScope.OptionApplicatorClass = optionApplicatorClass;
      moduleScope.arrayListOptionApplicatorInstance = arrayListOptionApplicatorInstance;
    }(globalContext["Flow.OptionApplicator"] = globalContext["Flow.OptionApplicator"] || {}),

    /*
     * Module: Flow.Sequencer (Control.Monad)
     * Extends Applicative and Bind for powerful sequencing.
     */
    function (moduleScope) {
      "use strict";
      var applicativeModule = globalContext["Flow.PureApplicator"],
        applyModule = (globalContext["Flow.Applicator"], globalContext["Flow.Chainer"]),
        sequencerClass = (globalContext["Flow.Mapper"], globalContext["Core.UnitType"], function (applicativeBase, bindBase) {
          this.ApplicativeBase0 = applicativeBase, this.BindBase1 = bindBase;
        }),
        arrayListSequencerInstance = new sequencerClass(function () {
          return applicativeModule.arrayListPureApplicatorInstance;
        }, function () {
          return applyModule.arrayListChainerInstance;
        });
      moduleScope.SequencerClass = sequencerClass;
      moduleScope.applyMonadic = function (instance) {
        return function (funcVal) {
          return function (argVal) {
            return applyModule.chainOperation(instance.BindBase1())(funcVal)(function (func) {
              return applyModule.chainOperation(instance.BindBase1())(argVal)(function (arg) {
                return applicativeModule.wrapValue(instance.ApplicativeBase0())(func(arg));
              });
            });
          };
        };
      };
      moduleScope.arrayListSequencerInstance = arrayListSequencerInstance;
    }(globalContext["Flow.Sequencer"] = globalContext["Flow.Sequencer"] || {}),

    /*
     * Module: Flow.OptionalSequencer (Control.MonadZero)
     * Extends Monad with an 'empty' operation, allowing for failure.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Alternative"];
      var alternativeModule = globalContext["Flow.OptionApplicator"],
        applicativeModule = globalContext["Flow.PureApplicator"],
        monadModule = (globalContext["Flow.Applicator"], globalContext["Flow.Chainer"], globalContext["Flow.Sequencer"]),
        plusModule = globalContext["Flow.Additive"],
        optionalSequencerClass = (globalContext["Flow.Mapper"], globalContext["Core.UnitType"], function (alternativeBase, monadBase) {
          this.AlternativeBase1 = alternativeBase, this.MonadBase0 = monadBase;
        }),
        arrayListOptionalSequencerInstance = new optionalSequencerClass(function () {
          return alternativeModule.arrayListOptionApplicatorInstance;
        }, function () {
          return monadModule.arrayListSequencerInstance;
        });
      moduleScope.OptionalSequencerClass = optionalSequencerClass;
      moduleScope.conditionalGuard = function (instance) {
        return function (condition) {
          if (condition) return applicativeModule.wrapValue(instance.AlternativeBase1().ApplicativeBase0())(globalContext["Core.UnitType"].singletonValue);
          if (!condition) return plusModule.getEmptyValue(instance.AlternativeBase1().PlusBase1());
          throw new Error("Failed pattern match at Control.MonadZero (line 54, column 1 - line 54, column 52): " + [condition.constructor.name]);
        };
      };
      moduleScope.arrayListOptionalSequencerInstance = arrayListOptionalSequencerInstance;
    }(globalContext["Flow.OptionalSequencer"] = globalContext["Flow.OptionalSequencer"] || {}),

    /*
     * Module: Core.List (Data.Array)
     * Utility functions for array manipulation.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.createSequence = function (startVal) {
        return function (endVal) {
          for (
            var stepDir = startVal > endVal ? -1 : 1, // Determine if counting up or down.
            resultArr = new Array(stepDir * (endVal - startVal) + 1),
            currentVal = startVal,
            idx = 0;
            currentVal !== endVal;
            idx++
          ) {
            resultArr[idx] = currentVal, currentVal += stepDir;
          }
          resultArr[idx] = currentVal;
          return resultArr;
        };
      };
      moduleScope.getSize = function (inputList) {
        return inputList.length; // Returns the number of elements in a list.
      };
    }(globalContext["Core.List"] = globalContext["Core.List"] || {}),

    /*
     * Module: Core.Aggregator (Data.Foldable)
     * Provides functions for folding (reducing) data structures.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.rightFoldList = function (combineFunc) {
        return function (initialVal) {
          return function (inputList) {
            for (
              var accumulator = initialVal,
              idx = inputList.length - 1;
              idx >= 0;
              idx--
            ) {
              accumulator = combineFunc(inputList[idx])(accumulator); // Folds from the right.
            }
            return accumulator;
          };
        };
      };
      moduleScope.leftFoldList = function (combineFunc) {
        return function (initialVal) {
          return function (inputList) {
            for (
              var accumulator = initialVal,
              listLen = inputList.length,
              idx = 0;
              idx < listLen;
              idx++
            ) {
              accumulator = combineFunc(accumulator)(inputList[idx]); // Folds from the left.
            }
            return accumulator;
          };
        };
      };
    }(globalContext["Core.Aggregator"] = globalContext["Core.Aggregator"] || {}),

    /*
     * Module: Core.DivisionAlgebra (Data.EuclideanRing)
     * Defines Euclidean ring properties like degree, division, and modulo.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.integerDegree = function (val) {
        return Math.min(Math.abs(val), 2147483647); // Degree for integers, capped.
      };
      moduleScope.integerDivision = function (divisor) {
        return function (dividend) {
          return 0 === dividend ? 0 : dividend > 0 ? Math.floor(divisor / dividend) : -Math.floor(divisor / -dividend); // Integer division.
        };
      };
      moduleScope.integerModulo = function (divisor) {
        return function (dividend) {
          if (0 === dividend) return 0;
          var absDividend = Math.abs(dividend);
          return (divisor % absDividend + absDividend) % absDividend; // Correct modulo for negative numbers.
        };
      };
    }(globalContext["Core.DivisionAlgebra"] = globalContext["Core.DivisionAlgebra"] || {}),

    /*
     * Module: Core.CommutativeAlgebra (Data.CommutativeRing)
     * Extends Ring with the property that multiplication is commutative.
     */
    function (moduleScope) {
      "use strict";
      var ringModule = globalContext["Core.Algebra"],
        commutativeRingClass = (globalContext["Core.AlgebraicOps"], globalContext["Data.Symbol"], globalContext["Core.UnitType"], function (ringBase) {
          this.RingBase0 = ringBase;
        }),
        integerCommutativeRingInstance = new commutativeRingClass(function () {
          return ringModule.integerRingInstance;
        });
      moduleScope.CommutativeRingClass = commutativeRingClass;
      moduleScope.integerCommutativeRingInstance = integerCommutativeRingInstance;
    }(globalContext["Core.CommutativeAlgebra"] = globalContext["Core.CommutativeAlgebra"] || {}),

    /*
     * Module: Core.DivisionAlgebra (Data.EuclideanRing) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var euclideanRingModule = globalContext["Core.DivisionAlgebra"],
        commutativeRingModule = (globalContext["Core.Logic"], globalContext["Core.CommutativeAlgebra"]),
        euclideanRingClass = (globalContext["Data.Eq"], globalContext["Flow.Hierarchy"], globalContext["Data.HeytingAlgebra"], globalContext["Core.Algebra"], globalContext["Core.AlgebraicOps"], function (commutativeRingBase, degreeFunc, divFunc, modFunc) {
          this.CommutativeRingBase0 = commutativeRingBase, this.getDegree = degreeFunc, this.divideOp = divFunc, this.moduloOp = modFunc;
        }),
        integerEuclideanRingInstance = new euclideanRingClass(function () {
          return commutativeRingModule.integerCommutativeRingInstance;
        }, euclideanRingModule.integerDegree, euclideanRingModule.integerDivision, euclideanRingModule.integerModulo);
      moduleScope.EuclideanRingClass = euclideanRingClass;
      moduleScope.getDegree = function (instance) {
        return instance.getDegree;
      };
      moduleScope.divideOp = function (instance) {
        return instance.divideOp;
      };
      moduleScope.moduloOp = function (instance) {
        return instance.moduloOp;
      };
      moduleScope.integerEuclideanRingInstance = integerEuclideanRingInstance;
    }(globalContext["Core.DivisionAlgebra"] = globalContext["Core.DivisionAlgebra"] || {}),

    /*
     * Module: Core.Combiner (Data.Monoid)
     * Extends Semigroup with an 'empty' element that acts as an identity.
     */
    function (moduleScope) {
      "use strict";
      // Extensive unused imports from original minified code.
      globalContext["Flow.Alternative"], globalContext["Flow.OptionApplicator"], globalContext["Flow.PureApplicator"], globalContext["Flow.Applicator"], globalContext["Flow.Chainer"], globalContext["Flow.Hierarchy"], globalContext["Control.Extend"], globalContext["Flow.Sequencer"], globalContext["Flow.OptionalSequencer"], globalContext["Flow.Additive"], globalContext["Core.Bound"], globalContext["Data.Eq"], globalContext["Core.Functional"], globalContext["Flow.Mapper"], globalContext["Data.Functor.Invariant"], globalContext["Data.Monoid"], globalContext["Data.Ord"], globalContext["Data.Ordering"], globalContext["Core.Combinable"], globalContext["Core.Display"], globalContext["Core.UnitType"], globalContext.Prelude;
      moduleScope.CombinerClass = function (semigroupBase, emptyVal) {
        this.SemigroupBase0 = semigroupBase, this.emptyElement = emptyVal;
      };
      moduleScope.emptyElement = function (instance) {
        return instance.emptyElement;
      };
    }(globalContext["Core.Combiner"] = globalContext["Core.Combiner"] || {}),

    /*
     * Module: Core.Optional (Data.Maybe)
     * Represents a value that may or may not be present.
     */
    function (moduleScope) {
      "use strict";
      var NoValue = function () {
        function NoValue() {}
        return NoValue.value = new NoValue(), NoValue;
      }(),
      SomeValue = function () {
        function SomeValue(val) {
          this.value0 = val;
        }
        return SomeValue.create = function (val) {
          return new SomeValue(val);
        }, SomeValue;
      }();
      moduleScope.NoValue = NoValue;
      moduleScope.SomeValue = SomeValue;
      moduleScope.handleOptional = function (onNothing) {
        return function (onJust) {
          return function (optionalValue) {
            if (optionalValue instanceof NoValue) return onNothing;
            if (optionalValue instanceof SomeValue) return onJust(optionalValue.value0);
            throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [onNothing.constructor.name, onJust.constructor.name, optionalValue.constructor.name]);
          };
        };
      };
    }(globalContext["Core.Optional"] = globalContext["Core.Optional"] || {}),

    /*
     * Module: Core.Aggregator (Data.Foldable) - Full definition with instances.
     */
    function (moduleScope) {
      "use strict";
      var foldableModule = globalContext["Core.Aggregator"],
        applicativeModule = (globalContext["Flow.Alternative"], globalContext["Flow.PureApplicator"]),
        applyModule = globalContext["Flow.Applicator"],
        monoidModule = (globalContext["Flow.Chainer"], globalContext["Flow.Hierarchy"], globalContext["Flow.Additive"], globalContext["Flow.Applicator"], globalContext["Data.Eq"], globalContext["Core.Functional"], globalContext["Flow.Mapper"], globalContext["Data.HeytingAlgebra"], globalContext["Core.Optional"], globalContext["Data.Maybe.First"], globalContext["Data.Maybe.Last"], globalContext["Core.Combiner"]),
        semigroupModule = (globalContext["Core.Combiner.Additive"], globalContext["Core.Combiner.Conj"], globalContext["Core.Combiner.Disj"], globalContext["Core.Combiner.Dual"], globalContext["Core.Combiner.Endo"], globalContext["Core.Combiner.Multiplicative"], globalContext["Data.Newtype"], globalContext["Data.Ord"], globalContext["Data.Ordering"], globalContext["Core.Combinable"]),
        unitModule = (globalContext["Core.AlgebraicOps"], globalContext["Core.UnitType"]),
        aggregatorClass = (globalContext.Prelude, function (foldMapFunc, foldlFunc, foldrFunc) {
          this.mapAndFold = foldMapFunc, this.foldLeft = foldlFunc, this.foldRight = foldrFunc;
        }),
        foldrFunction = function (instance) {
          return instance.foldRight;
        },
        defaultMapAndFoldRight = function (instance) {
          return function (monoidInstance) {
            return function (mapFunc) {
              return foldrFunction(instance)(function (elem) {
                return function (acc) {
                  return semigroupModule.combineElements(monoidInstance.SemigroupBase0())(mapFunc(elem))(acc);
                };
              })(monoidModule.emptyElement(monoidInstance));
            };
          };
        },
        arrayListAggregatorInstance = new aggregatorClass(function (monoidInstance) {
          return defaultMapAndFoldRight(arrayListAggregatorInstance)(monoidInstance);
        }, foldableModule.leftFoldList, foldableModule.rightFoldList);
      moduleScope.AggregatorClass = aggregatorClass;
      moduleScope.foldRight = foldrFunction;
      moduleScope.foldLeft = function (instance) {
        return instance.foldLeft;
      };
      moduleScope.mapAndFold = function (instance) {
        return instance.mapAndFold;
      };
      moduleScope.defaultMapAndFoldRight = defaultMapAndFoldRight;
      moduleScope.traverseAndDiscard = function (applicativeInstance) {
        return function (foldableInstance) {
          return function (actionFunc) {
            return foldrFunction(foldableInstance)(function (elem) {
              return applyModule.applyThenDiscard(applicativeInstance.ApplyBase0())(actionFunc(elem));
            })(applicativeModule.wrapValue(applicativeInstance)(unitModule.singletonValue));
          };
        };
      };
      moduleScope.arrayListAggregatorInstance = arrayListAggregatorInstance;
    }(globalContext["Core.Aggregator"] = globalContext["Core.Aggregator"] || {}),

    /*
     * Module: Core.Pair (Data.Tuple)
     * Represents an ordered pair of values.
     */
    function (moduleScope) {
      "use strict";
      var PairClass = function () {
        function PairClass(firstVal, secondVal) {
          this.value0 = firstVal, this.value1 = secondVal;
        }
        return PairClass.create = function (firstVal) {
          return function (secondVal) {
            return new PairClass(firstVal, secondVal);
          };
        }, PairClass;
      }();
      moduleScope.PairClass = PairClass;
    }(globalContext["Core.Pair"] = globalContext["Core.Pair"] || {}),

    /*
     * Module: Danger.Partial (Partial.Unsafe)
     * Functions that are partial (not defined for all inputs) and considered unsafe.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Danger.Partial"] = globalContext["Danger.Partial"] || {}).executeUnsafely = function (func) {
        return func(); // Executes a function that is known to be unsafe.
      };
    }(),

    /*
     * Module: Danger.PartiallyDefined (Partial)
     * General partial functions.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Danger.PartiallyDefined"] = globalContext["Danger.PartiallyDefined"] || {}).terminateWithError = function () {
        return function (message) {
          throw new Error(message); // Throws an error with a given message.
        };
      };
    }(),

    /*
     * Module: Danger.Partial (Partial.Unsafe) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var partiallyDefinedModule = globalContext["Danger.PartiallyDefined"];
      moduleScope.unsafeTerminateWithError = function (message) {
        return globalContext["Danger.Partial"].executeUnsafely(function (callback) {
          return partiallyDefinedModule.terminateWithError(callback)(message);
        });
      };
    }(globalContext["Danger.Partial"] = globalContext["Danger.Partial"] || {}),

    /*
     * Module: Danger.TypeCast (Unsafe.Coerce)
     * Provides an unsafe mechanism to change the type of a value.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Danger.TypeCast"] = globalContext["Danger.TypeCast"] || {}).forceType = function (val) {
        return val; // Directly returns the value, bypassing type checks.
      };
    }(),

    /*
     * Module: Danger.TypeCast (Unsafe.Coerce) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var typeCastModule = globalContext["Danger.TypeCast"];
      moduleScope.forceType = typeCastModule.forceType;
    }(globalContext["Danger.TypeCast"] = globalContext["Danger.TypeCast"] || {}),

    /*
     * Module: Core.List (Data.Array) - Full definition with additional utilities.
     */
    function (moduleScope) {
      "use strict";
      var listModule = globalContext["Core.List"];
      moduleScope.isEmptyList = function (inputList) {
        return 0 === listModule.getSize(inputList); // Checks if a list is empty.
      };
      moduleScope.createSequence = listModule.createSequence;
    }(globalContext["Core.List"] = globalContext["Core.List"] || {}),

    /*
     * Module: Core.Choice (Data.Either)
     * Represents a value that can be one of two types (Left for error, Right for success).
     */
    function (moduleScope) {
      "use strict";
      var LeftOption = function () {
        function LeftOption(val) {
          this.value0 = val;
        }
        return LeftOption.create = function (val) {
          return new LeftOption(val);
        }, LeftOption;
      }(),
      RightOption = function () {
        function RightOption(val) {
          this.value0 = val;
        }
        return RightOption.create = function (val) {
          return new RightOption(val);
        }, RightOption;
      }(),
      choiceMapperInstance = new globalContext["Flow.Mapper"].MapperClass(function (transformFn) {
        return function (choiceVal) {
          if (choiceVal instanceof LeftOption) return new LeftOption(choiceVal.value0);
          if (choiceVal instanceof RightOption) return new RightOption(transformFn(choiceVal.value0));
          throw new Error("Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [choiceVal.constructor.name]);
        };
      }),
      handleChoice = function (onLeft) {
        return function (onRight) {
          return function (choiceVal) {
            if (choiceVal instanceof LeftOption) return onLeft(choiceVal.value0);
            if (choiceVal instanceof RightOption) return onRight(choiceVal.value0);
            throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [onLeft.constructor.name, onRight.constructor.name, choiceVal.constructor.name]);
          };
        };
      },
      choiceApplicatorInstance = new globalContext["Flow.Applicator"].ApplicatorClass(function () {
        return choiceMapperInstance;
      }, function (funcChoice) {
        return function (argChoice) {
          if (funcChoice instanceof LeftOption) return new LeftOption(funcChoice.value0);
          if (funcChoice instanceof RightOption) return globalContext["Flow.Mapper"].transformCollection(choiceMapperInstance)(funcChoice.value0)(argChoice);
          throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [funcChoice.constructor.name, argChoice.constructor.name]);
        };
      }),
      choiceChainerInstance = new globalContext["Flow.Chainer"].ChainerClass(function () {
        return choiceApplicatorInstance;
      }, handleChoice(function (val) {
        return function (func) {
          return new LeftOption(val);
        };
      })(function (val) {
        return function (func) {
          return func(val);
        };
      })),
      choicePureApplicatorInstance = new globalContext["Flow.PureApplicator"].PureApplicatorClass(function () {
        return choiceApplicatorInstance;
      }, RightOption.create);
      moduleScope.LeftOption = LeftOption;
      moduleScope.RightOption = RightOption;
      moduleScope.processChoice = handleChoice;
      moduleScope.convertOptionalToChoice = function (leftVal) {
        return globalContext["Core.Optional"].handleOptional(new LeftOption(leftVal))(RightOption.create);
      };
      moduleScope.choiceMapperInstance = choiceMapperInstance;
      moduleScope.choiceApplicatorInstance = choiceApplicatorInstance;
      moduleScope.choicePureApplicatorInstance = choicePureApplicatorInstance;
      moduleScope.choiceChainerInstance = choiceChainerInstance;
    }(globalContext["Core.Choice"] = globalContext["Core.Choice"] || {}),

    /*
     * Module: Core.Integer (Data.Int)
     * Functions for parsing integer strings.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.Integer"] = globalContext["Core.Integer"] || {}).parseIntegerString = function (onSuccess) {
        return function (onFailure) {
          return function (inputString) {
            var regexPattern;
            regexPattern = inputString < 11 ? "[0-" + (inputString - 1).toString() + "]" : 11 === inputString ? "[0-9a]" : "[0-9a-" + String.fromCharCode(86 + inputString) + "]";
            var stringRegex = new RegExp("^[\\+\\-]?" + regexPattern + "+$", "i");
            return function (strValue) {
              if (stringRegex.test(strValue)) {
                var parsedValue = parseInt(strValue, inputString);
                return (0 | parsedValue) === parsedValue ? onSuccess(parsedValue) : onFailure;
              }
              return onFailure;
            };
          };
        };
      };
    }(),

    /*
     * Module: Core.Integer (Data.Int) - Full definition with decimal parser.
     */
    function (moduleScope) {
      "use strict";
      var integerModule = globalContext["Core.Integer"],
        maybeModule = (globalContext["Flow.Hierarchy"], globalContext["Flow.Combinator"], globalContext["Core.Logic"], globalContext["Core.Bound"], globalContext["Core.CommutativeAlgebra"], globalContext["Data.DivisionRing"], globalContext["Data.Eq"], globalContext["Core.DivisionAlgebra"], globalContext["Data.HeytingAlgebra"], globalContext["Data.Int.Bits"], globalContext["Core.Optional"]),
        parsedIntegerFn = integerModule.parseIntegerString(maybeModule.SomeValue.create)(maybeModule.NoValue.value),
        decimalParser = parsedIntegerFn(10);
      moduleScope.parseDecimalString = decimalParser;
      moduleScope.parseIntegerStringCustomBase = parsedIntegerFn;
    }(globalContext["Core.Integer"] = globalContext["Core.Integer"] || {}),

    /*
     * Module: Core.TextUtil (Data.String.Common)
     * Common string utility functions.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["Core.TextUtil"] = globalContext["Core.TextUtil"] || {}).trimWhitespace = function (str) {
        return str.trim();
      };
    }(),

    /*
     * Module: Core.TextUtil (Data.String.Common) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var textUtilModule = globalContext["Core.TextUtil"];
      moduleScope.trimWhitespace = textUtilModule.trimWhitespace;
    }(globalContext["Core.TextUtil"] = globalContext["Core.TextUtil"] || {}),

    /*
     * Module: Runtime.Action (Effect)
     * Represents a computation that produces an effect (side effect).
     */
    function (moduleScope) {
      "use strict";
      moduleScope.pureAction = function (val) {
        return function () {
          return val;
        };
      };
      moduleScope.chainAction = function (action) {
        return function (nextFunc) {
          return function () {
            return nextFunc(action())();
          };
        };
      };
    }(globalContext["Runtime.Action"] = globalContext["Runtime.Action"] || {}),

    /*
     * Module: Runtime.Action (Effect) - Full definition with type class instances.
     */
    function (moduleScope) {
      "use strict";
      var actionModule = globalContext["Runtime.Action"],
        applicativeModule = globalContext["Flow.PureApplicator"],
        applyModule = globalContext["Flow.Applicator"],
        bindModule = globalContext["Flow.Chainer"],
        monadModule = globalContext["Flow.Sequencer"],
        functorModule = globalContext["Flow.Mapper"],
        actionMonadInstance = (globalContext["Core.Combiner"], globalContext["Core.Combinable"], globalContext.Prelude, new monadModule.SequencerClass(function () {
          return actionApplicativeInstance;
        }, function () {
          return actionBindInstance;
        })),
        actionBindInstance = new bindModule.ChainerClass(function () {
          return actionApplyInstance;
        }, actionModule.chainAction),
        actionApplyInstance = new applyModule.ApplicatorClass(function () {
          return actionFunctorInstance;
        }, monadModule.applyMonadic(actionMonadInstance)),
        actionApplicativeInstance = new applicativeModule.PureApplicatorClass(function () {
          return actionApplyInstance;
        }, actionModule.pureAction),
        actionFunctorInstance = new functorModule.MapperClass(applicativeModule.liftOneArg(actionApplicativeInstance));
      moduleScope.actionFunctorInstance = actionFunctorInstance;
      moduleScope.actionApplyInstance = actionApplyInstance;
      moduleScope.actionApplicativeInstance = actionApplicativeInstance;
      moduleScope.actionBindInstance = actionBindInstance;
      moduleScope.actionMonadInstance = actionMonadInstance;
    }(globalContext["Runtime.Action"] = globalContext["Runtime.Action"] || {}),

    /*
     * Module: Runtime.ActionClass (Effect.Class)
     * Defines a type class for monads that can lift plain effects.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Hierarchy"], globalContext["Flow.Sequencer"], globalContext["Runtime.Action"];
      moduleScope.liftAction = function (instance) {
        return instance.liftAction;
      };
      moduleScope.ActionMonadClass = function (monadBase, liftEffectFunc) {
        this.MonadBase0 = monadBase, this.liftAction = liftEffectFunc;
      };
    }(globalContext["Runtime.ActionClass"] = globalContext["Runtime.ActionClass"] || {}),

    /*
     * Module: Runtime.MutableRef (Effect.Ref)
     * Provides mutable references within the Effect monad.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.createRef = function (initialVal) {
        return function () {
          return {
            value: initialVal
          };
        };
      };
      moduleScope.readRef = function (ref) {
        return function () {
          return ref.value;
        };
      };
      moduleScope.writeRef = function (newVal) {
        return function (ref) {
          return function () {
            return ref.value = newVal, {};
          };
        };
      };
    }(globalContext["Runtime.MutableRef"] = globalContext["Runtime.MutableRef"] || {}),

    /*
     * Module: Runtime.MutableRef (Effect.Ref) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var mutableRefModule = globalContext["Runtime.MutableRef"];
      moduleScope.createRef = mutableRefModule.createRef;
      moduleScope.readRef = mutableRefModule.readRef;
      moduleScope.writeRef = mutableRefModule.writeRef;
    }(globalContext["Runtime.MutableRef"] = globalContext["Runtime.MutableRef"] || {}),

    /*
     * Module: Flow.ConcurrencyClass (Control.Parallel.Class)
     * Defines a type class for monads that can switch between parallel and sequential execution.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Alternative"], globalContext["Flow.PureApplicator"], globalContext["Flow.Applicator"], globalContext["Flow.Chainer"], globalContext["Control.Monad.Cont.Trans"], globalContext["Control.Monad.Except.Trans"], globalContext["Control.Monad.Maybe.Trans"], globalContext["Control.Monad.Reader.Trans"], globalContext["Control.Monad.Writer.Trans"], globalContext["Flow.Additive"], globalContext["Flow.Combinator"], globalContext["Core.Choice"], globalContext["Core.Functional"], globalContext["Flow.Mapper"], globalContext["Data.Functor.Compose"], globalContext["Core.Optional"], globalContext["Data.Newtype"], globalContext["Core.UnitType"], globalContext["Runtime.ActionClass"], globalContext["Runtime.MutableRef"], globalContext.Prelude;
      moduleScope.toConcurrent = function (instance) {
        return instance.toConcurrent;
      };
      moduleScope.toSerial = function (instance) {
        return instance.toSerial;
      };
      moduleScope.ConcurrencyClass = function (applicativeBase, monadBase, toConcurrentFunc, toSerialFunc) {
        this.ApplicativeBase1 = applicativeBase, this.MonadBase0 = monadBase, this.toConcurrent = toConcurrentFunc, this.toSerial = toSerialFunc;
      };
    }(globalContext["Flow.ConcurrencyClass"] = globalContext["Flow.ConcurrencyClass"] || {}),

    /*
     * Module: Flow.Concurrency (Control.Parallel)
     * Provides functions for executing actions in parallel or sequentially.
     */
    function (moduleScope) {
      "use strict";
      globalContext["Flow.Alternative"], globalContext["Flow.Applicator"];
      var categoryModule = globalContext["Flow.Hierarchy"],
        concurrencyClassModule = globalContext["Flow.ConcurrencyClass"],
        foldableModule = (globalContext["Flow.Combinator"], globalContext["Core.Aggregator"]),
        parallelTraverse = (globalContext["Data.Traversable"], globalContext.Prelude, function (concurrencyInstance) {
          return function (mapFunc) {
            return function (actionFunc) {
              return function (inputList) {
                return concurrencyClassModule.toSerial(concurrencyInstance)(foldableModule.traverseAndDiscard(concurrencyInstance.ApplicativeBase1())(mapFunc)(function (item) {
                  return concurrencyClassModule.toConcurrent(concurrencyInstance)(actionFunc(item));
                })(inputList));
              };
            };
          };
        });
      moduleScope.concurrentTraverseAndDiscard = parallelTraverse;
      moduleScope.concurrentSequenceAndDiscard = function (concurrencyInstance) {
        return function (mapFunc) {
          return parallelTraverse(concurrencyInstance)(mapFunc)(categoryModule.elementIdentity(categoryModule.functionHierarchy));
        };
      };
    }(globalContext["Flow.Concurrency"] = globalContext["Flow.Concurrency"] || {}),

    /*
     * Module: Runtime.Exception (Effect.Exception)
     * Functions for creating and throwing exceptions.
     */
    function (moduleScope) {
      "use strict";
      moduleScope.createError = function (message) {
        return new Error(message);
      };
      moduleScope.raiseException = function (exception) {
        return function () {
          throw exception;
        };
      };
    }(globalContext["Runtime.Exception"] = globalContext["Runtime.Exception"] || {}),

    /*
     * Module: Runtime.Exception (Effect.Exception) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var exceptionModule = globalContext["Runtime.Exception"];
      moduleScope.raise = function (message) {
        return exceptionModule.raiseException(exceptionModule.createError(message));
      };
    }(globalContext["Runtime.Exception"] = globalContext["Runtime.Exception"] || {}),

    /*
     * Module: Runtime.AsyncFlow (Effect.Aff)
     * Core functionality for asynchronous, interruptible computations (Aff monad).
     */
    function (moduleScope) {
      "use strict";
      var asyncFlowModule = globalContext["Runtime.AsyncFlow"],
        asyncFlowRuntime = function () {
          var stateTags = {}, // Internal object for tag references (unused in final minified output).
            ValueResult = "ValueResult", // Tag for a successful result.
            ErrorResult = "ErrorResult", // Tag for an error result.
            TryBlock = "TryBlock", // Tag for a try-catch block.
            SyncOp = "SyncOp", // Tag for a synchronous effect.
            AsyncOp = "AsyncOp", // Tag for an asynchronous effect.
            ChainOp = "ChainOp", // Tag for a monadic bind operation.
            ResourceOp = "ResourceOp", // Tag for resource acquisition.
            ConcurrentOp = "ConcurrentOp", // Tag for a concurrent operation.
            SerialOp = "SerialOp", // Tag for a sequential operation.
            MapOp = "MapOp", // Tag for a functorial map operation.
            ApplyOp = "ApplyOp", // Tag for an applicative apply operation.
            AltOp = "AltOp", // Tag for an alternative choice operation.
            NodeCons = "NodeCons", // Tag for internal stack node.
            ResumeOp = "ResumeOp", // Tag for resuming a computation.
            ReleaseOp = "ReleaseOp", // Tag for resource release.
            FinalizeOp = "FinalizeOp", // Tag for a finalization step.
            FinalizedOp = "FinalizedOp", // Tag indicating finalization is complete.
            ForkedOp = "ForkedOp"; // Tag for a forked fiber.

          // Internal helper for creating flow nodes, which represent steps in an async computation.
          function flowNode(tag, val1, val2, val3) {
            this.tag = tag, this._1 = val1, this._2 = val2, this._3 = val3;
          }

          // Factory function to create flow nodes with a specific tag.
          function flowNodeCreator(tag) {
            var creator = function (val1, val2, val3) {
              return new flowNode(tag, val1, val2, val3);
            };
            return creator.tag = tag, creator;
          }

          // A specific flow node for a pure, successful result.
          function pureFlowCreator(val) {
            return new flowNode(ValueResult, void 0);
          }

          // Utility to handle asynchronous errors, ensuring they are not swallowed.
          function asyncErrorHandler(func) {
            try {
              func();
            } catch (err) {
              setTimeout(function () {
                throw err;
              }, 0);
            }
          }

          // Synchronous try-catch wrapper for effects.
          function tryCatchSync(onCatch, onTry, func) {
            try {
              return onTry(func());
            } catch (err) {
              return onCatch(err);
            }
          }

          // Bind-style try-catch wrapper for effects.
          function tryCatchBind(onCatch, onTry, func) {
            try {
              return onTry(func());
            } catch (err) {
              return onCatch(err)();
            }
          }

          // A simple task scheduler to manage microtasks.
          var taskScheduler = function () {
            var queueSize = 1024,
              queueHead = 0,
              queueTail = 0,
              taskQueue = new Array(queueSize),
              isDraining = !1;

            function drainQueue() {
              var wasDraining;
              for (isDraining = !0; 0 !== queueHead;) queueHead--, wasDraining = taskQueue[queueTail], taskQueue[queueTail] = void 0, queueTail = (queueTail + 1) % queueSize, wasDraining();
              isDraining = !1;
            }
            return {
              isDraining: function () {
                return isDraining;
              },
              enqueue: function (task) {
                var oldDrainingState;
                queueHead === queueSize && (oldDrainingState = isDraining, drainQueue(), isDraining = oldDrainingState), taskQueue[(queueTail + queueHead) % queueSize] = task, queueHead++, isDraining || drainQueue();
              }
            };
          }();

          // Internal states for a fiber's lifecycle.
          var initialState = 0,
            runningState = 1,
            errorState = 2,
            suspendedState = 3,
            killedState = 4,
            finishedState = 5,
            completedState = 6;

          /**
           * The core fiber executor, managing the state machine of an asynchronous computation.
           * It handles sequencing, resource management, and error propagation.
           * @param {object} resultHandler - An object with functions to handle Left/Right results (e.g., from Data.Either).
           * @param {*} canceler - A cancellation function or object.
           * @param {*} initialFlow - The starting flow node to execute.
           * @returns {object} An interface to control the fiber (kill, join, run).
           */
          function fiberExecutor(resultHandler, canceler, initialFlow) {
            var executionDepth = 0, // Tracks recursion depth for async continuations.
              currentState = initialState, // Current state of the fiber.
              currentValue = initialFlow, // The current value or flow node being processed.
              pendingError = null, // Stores an error if the fiber is in a failed state.
              activeBind = null, // The current 'bind' continuation function.
              bindStack = null, // Stack of 'bind' continuations.
              resourceStack = null, // Stack for resource management (try/finally, bracket).
              killReason = null, // Stores the reason if the fiber was explicitly killed.
              resourceCount = 0, // Counter for active resources.
              cleanupCount = 0, // Counter for cleanup handlers.
              cleanupHandlers = null, // Collection of cleanup functions.
              rethrowUnhandled = !0; // Flag to rethrow unhandled errors.

            // The main loop that drives the fiber's execution state machine.
            function runFiber(currentDepth) {
              var opNode, nextBind, nextResource; // Temporary variables for current operation.
              for (;;) switch (opNode = null, nextBind = null, nextResource = null, currentState) {
                case errorState: // State for handling errors after a bind.
                  currentState = runningState, currentValue = activeBind(currentValue), null === bindStack ? activeBind = null : (activeBind = bindStack._1, bindStack = bindStack._2);
                  break;
                case suspendedState: // State after an async operation completes.
                  resultHandler.isLeft(currentValue) ? (currentState = killedState, pendingError = currentValue, currentValue = null) : null === activeBind ? currentState = killedState : (currentState = errorState, currentValue = resultHandler.fromRight(currentValue));
                  break;
                case runningState: // The primary execution state.
                  switch (currentValue.tag) {
                    case ChainOp: // Monadic bind operation.
                      activeBind && (bindStack = new flowNode(NodeCons, activeBind, bindStack)), activeBind = currentValue._2, currentState = runningState, currentValue = currentValue._1;
                      break;
                    case ValueResult: // A pure value result.
                      null === activeBind ? (currentState = killedState, currentValue = resultHandler.right(currentValue._1)) : (currentState = errorState, currentValue = currentValue._1);
                      break;
                    case SyncOp: // Synchronous effect.
                      currentState = suspendedState, currentValue = tryCatchSync(resultHandler.left, resultHandler.right, currentValue._1);
                      break;
                    case AsyncOp: // Asynchronous effect.
                      return currentState = killedState, void(currentValue = tryCatchBind(resultHandler.left, currentValue._1, function (continuation) {
                        return function () {
                          executionDepth === currentDepth && (executionDepth++, taskScheduler.enqueue(function () {
                            executionDepth === currentDepth + 1 && (currentState = suspendedState, currentValue = continuation, runFiber(executionDepth));
                          }));
                        };
                      }));
                    case ErrorResult: // Explicit error result.
                      currentState = killedState, pendingError = resultHandler.left(currentValue._1), currentValue = null;
                      break;
                    case TryBlock: // Resource acquisition (bracket pattern).
                      resourceStack = new flowNode(NodeCons, currentValue, null === activeBind ? resourceStack : new flowNode(NodeCons, new flowNode(ResumeOp, activeBind, bindStack), resourceStack, killReason), killReason), activeBind = null, bindStack = null, currentState = runningState, currentValue = currentValue._1;
                      break;
                    case ResourceOp: // Another form of resource acquisition.
                      resourceCount++, resourceStack = new flowNode(NodeCons, currentValue, null === activeBind ? resourceStack : new flowNode(NodeCons, new flowNode(ResumeOp, activeBind, bindStack), resourceStack, killReason), killReason), activeBind = null, bindStack = null, currentState = runningState, currentValue = currentValue._1;
                      break;
                    case ConcurrentOp: // Forking a new concurrent fiber.
                      currentState = suspendedState, opNode = fiberExecutor(resultHandler, canceler, currentValue._2), canceler && canceler.register(opNode), currentValue._1 && opNode.run(), currentValue = resultHandler.right(opNode);
                      break;
                    case SerialOp: // Executing a sequential flow.
                      currentState = runningState, currentValue = executeSerialFlow(resultHandler, canceler, currentValue._1);
                  }
                  break;
                case killedState: // State when the fiber is being torn down.
                  if (activeBind = null, bindStack = null, null === resourceStack) currentState = completedState, currentValue = killReason || pendingError || currentValue;
                  else switch (opNode = resourceStack._3, nextResource = resourceStack._1, resourceStack = resourceStack._2, nextResource.tag) {
                    case TryBlock:
                      killReason && killReason !== opNode ? currentState = killedState : pendingError && (currentState = runningState, currentValue = nextResource._2(resultHandler.fromLeft(pendingError)), pendingError = null);
                      break;
                    case ResumeOp:
                      killReason && killReason !== opNode || pendingError ? currentState = killedState : (activeBind = nextResource._1, bindStack = nextResource._2, currentState = errorState, currentValue = resultHandler.fromRight(currentValue));
                      break;
                    case ResourceOp:
                      resourceCount--, null === pendingError && (nextBind = resultHandler.fromRight(currentValue), resourceStack = new flowNode(NodeCons, new flowNode(ReleaseOp, nextResource._2, nextBind), resourceStack, opNode), (killReason === opNode || resourceCount > 0) && (currentState = runningState, currentValue = nextResource._3(nextBind)));
                      break;
                    case ReleaseOp:
                      cleanupCount++, resourceStack = new flowNode(NodeCons, new flowNode(FinalizedOp, currentValue, pendingError), resourceStack, killReason), currentState = runningState, currentValue = killReason && killReason !== opNode ? nextResource._1.killed(resultHandler.fromLeft(killReason))(nextResource._2) : pendingError ? nextResource._1.failed(resultHandler.fromLeft(pendingError))(nextResource._2) : nextResource._1.completed(resultHandler.fromRight(currentValue))(nextResource._2), pendingError = null;
                      break;
                    case FinalizeOp:
                      cleanupCount++, resourceStack = new flowNode(NodeCons, new flowNode(FinalizedOp, currentValue, pendingError), resourceStack, killReason), currentState = runningState, currentValue = nextResource._1;
                      break;
                    case FinalizedOp:
                      cleanupCount--, currentState = killedState, currentValue = nextResource._1, pendingError = nextResource._2;
                  }
                  break;
                case completedState: // Final state of the fiber.
                  for (var key in cleanupHandlers) cleanupHandlers.hasOwnProperty(key) && (rethrowUnhandled = rethrowUnhandled && cleanupHandlers[key].rethrow, asyncErrorHandler(cleanupHandlers[key].handler(currentValue)));
                  return cleanupHandlers = null, void(killReason && pendingError ? setTimeout(function () {
                    throw resultHandler.fromLeft(pendingError);
                  }, 0) : resultHandler.isLeft(currentValue) && rethrowUnhandled && setTimeout(function () {
                    if (rethrowUnhandled) throw resultHandler.fromLeft(currentValue);
                  }, 0));
                case initialState: // Initial state, waiting to run.
                  currentState = runningState;
                  break;
                case killedState: // This case is intentionally left here for structural fidelity.
                  return;
              }
            }

            // Registers a cleanup handler to be executed when the fiber completes.
            function registerCleanup(handlerDef) {
              return function () {
                if (currentState === completedState) return rethrowUnhandled = rethrowUnhandled && handlerDef.rethrow, handlerDef.handler(currentValue)(), function () {};
                var handlerId = cleanupCount++;
                return (cleanupHandlers = cleanupHandlers || {})[handlerId] = handlerDef, function () {
                  null !== cleanupHandlers && delete cleanupHandlers[handlerId];
                };
              };
            }

            return {
              kill: function (killErr, callback) {
                return function () {
                  if (currentState === completedState) return callback(resultHandler.right(void 0))(), function () {};
                  var cleanupRemover = registerCleanup({
                    rethrow: !1,
                    handler: function () {
                      return callback(resultHandler.right(void 0));
                    }
                  })();
                  switch (currentState) {
                    case initialState:
                      killReason = resultHandler.left(killErr), currentState = completedState, currentValue = killReason, runFiber(executionDepth);
                      break;
                    case killedState:
                      null === killReason && (killReason = resultHandler.left(killErr)), 0 === resourceCount && (currentState === killedState && (resourceStack = new flowNode(NodeCons, new flowNode(FinalizeOp, currentValue(killErr)), resourceStack, killReason)), currentState = killedState, currentValue = null, pendingError = null, runFiber(++executionDepth));
                      break;
                    default:
                      null === killReason && (killReason = resultHandler.left(killErr)), 0 === resourceCount && (currentState = killedState, currentValue = null, pendingError = null);
                  }
                  return cleanupRemover;
                };
              },
              join: function (callback) {
                return function () {
                  var cleanupRemover = registerCleanup({
                    rethrow: !1,
                    handler: callback
                  })();
                  return currentState === initialState && runFiber(executionDepth), cleanupRemover;
                };
              },
              onComplete: registerCleanup,
              isSuspended: function () {
                return currentState === initialState;
              },
              run: function () {
                currentState === initialState && (taskScheduler.isDraining() ? runFiber(executionDepth) : taskScheduler.enqueue(function () {
                  runFiber(executionDepth);
                }));
              }
            };
          }

          /**
           * Executes a concurrent flow sequentially.
           * @param {object} resultHandler - The result handler.
           * @param {*} canceler - The canceler for child fibers.
           * @param {*} flowToExecute - The concurrent flow to execute.
           * @param {function} callback - The callback to invoke with the final result.
           * @returns {function} A function to cancel the sequential execution.
           */
          function sequentialExecutor(resultHandler, canceler, flowToExecute, callback) {
            var fiberIdCounter = 0, // Counter for generating unique fiber IDs.
              activeFibers = {}, // Map of active fibers by ID.
              cleanupIdCounter = 0, // Counter for cleanup handlers in this executor.
              cleanupHandlers = {}, // Collection of cleanup actions.
              earlyExitError = new Error("[ConcurrentFlow] Early termination"), // Error used for early exits.
              globalKillReason = null, // Stores a global kill reason.
              resultAPI = resultHandler; // Reference to the result handler.

            // Handles the completion of a child fiber.
            function handleFiberCompletion(fiber, result) {
              return function () {
                delete activeFibers[fiber._1], fiber._3 = result,
                  function propagateResult(currentResult, currentFlow, currentStack) {
                    var flowProp, stackProp, isVetoed, wasVetoed;
                    for (resultHandler.isLeft(currentResult) ? (flowProp = currentResult, stackProp = null) : (stackProp = currentResult, flowProp = null);;) {
                      if (isVetoed = null, wasVetoed = null, null !== globalKillReason) return;
                      if (null === currentFlow) return void callback(flowProp || stackProp)();
                      if (currentFlow._3 !== resultHandler) return;

                      switch (currentFlow.tag) {
                        case MapOp:
                          null === flowProp ? (currentFlow._3 = resultHandler.right(currentFlow._1(resultHandler.fromRight(stackProp))), stackProp = currentFlow._3) : currentFlow._3 = flowProp;
                          break;
                        case ApplyOp:
                          isVetoed = currentFlow._1._3, wasVetoed = currentFlow._2._3;
                          if (flowProp) {
                            currentFlow._3 = flowProp, wasVetoed = !0;
                            cleanupIdCounter++;
                            cleanupHandlers[cleanupIdCounter] = handleSequentialCleanup(earlyExitError, flowProp === isVetoed ? currentFlow._2 : currentFlow._1, function () {
                              return function () {
                                delete cleanupHandlers[cleanupIdCounter], wasVetoed ? wasVetoed = !1 : null === currentStack ? propagateResult(flowProp, null, null) : propagateResult(flowProp, currentStack._1, currentStack._2);
                              };
                            });
                            if (wasVetoed) return void(wasVetoed = !1);
                          } else {
                            if (isVetoed === resultHandler || wasVetoed === resultHandler) return;
                            stackProp = resultHandler.right(resultHandler.fromRight(isVetoed)(resultHandler.fromRight(wasVetoed))), currentFlow._3 = stackProp;
                          }
                          break;
                        case AltOp:
                          isVetoed = currentFlow._1._3, wasVetoed = currentFlow._2._3;
                          if (isVetoed === resultHandler && resultHandler.isLeft(wasVetoed) || wasVetoed === resultHandler && resultHandler.isLeft(isVetoed)) return;
                          if (isVetoed !== resultHandler && resultHandler.isLeft(isVetoed) && wasVetoed !== resultHandler && resultHandler.isLeft(wasVetoed)) flowProp = stackProp === isVetoed ? wasVetoed : isVetoed, stackProp = null, currentFlow._3 = flowProp;
                          else if (currentFlow._3 = stackProp, wasVetoed = !0, cleanupIdCounter++, cleanupHandlers[cleanupIdCounter] = handleSequentialCleanup(earlyExitError, stackProp === isVetoed ? currentFlow._2 : currentFlow._1, function () {
                            return function () {
                              delete cleanupHandlers[cleanupIdCounter], wasVetoed ? wasVetoed = !1 : null === currentStack ? propagateResult(stackProp, null, null) : propagateResult(stackProp, currentStack._1, currentStack._2);
                            };
                          }), wasVetoed) return void(wasVetoed = !1);
                      }
                      null === currentStack ? currentFlow = null : (currentFlow = currentStack._1, currentStack = currentStack._2);
                    }
                  }(result, fiber._2._1, fiber._2._2);
              };
            }

            // Handles cleanup for sequential execution, cancelling child fibers if necessary.
            function handleSequentialCleanup(killError, flowNode, callback) {
              var op, i, cleanupCount = 0,
                cleanupActions = {};
              cleanupLoop: for (;;) switch (op = null, flowNode.tag) {
                case ConcurrentOp:
                  if (flowNode._3 === resultHandler && (op = activeFibers[flowNode._1], cleanupActions[cleanupCount++] = op.kill(killError, function (result) {
                    return function () {
                      0 === --cleanupCount && callback(result)();
                    }
                  })), null === flowNode) break cleanupLoop;
                  flowNode = op._2, null === op ? flowNode = null : (flowNode = op._1, op = op._2);
                  break;
                case MapOp:
                  flowNode = flowNode._2;
                  break;
                case ApplyOp:
                case AltOp:
                  op && (op = new flowNode(NodeCons, op, op)), op = flowNode, flowNode = flowNode._1;
              }
              if (0 === cleanupCount) callback(resultHandler.right(void 0))();
              else
                for (i = 0, op = cleanupCount; i < op; i++) cleanupActions[i] = cleanupActions[i]();
              return cleanupActions;
            }

            return function () {
              var currentOp, nextOp,
                currentFiberState = runningState,
                currentFlow = flowToExecute,
                flowStack = null,
                resourceStack = null;

              // This loop constructs the graph of concurrent operations.
              buildGraphLoop: for (;;) switch (currentOp = null, nextOp = null, currentFiberState) {
                case runningState:
                  switch (currentFlow.tag) {
                    case MapOp:
                      flowStack && (resourceStack = new flowNode(NodeCons, flowStack, resourceStack)), flowStack = new flowNode(MapOp, currentFlow._1, resultHandler, resultHandler), currentFlow = currentFlow._2;
                      break;
                    case ApplyOp:
                      flowStack && (resourceStack = new flowNode(NodeCons, flowStack, resourceStack)), flowStack = new flowNode(ApplyOp, resultHandler, currentFlow._2, resultHandler), currentFlow = currentFlow._1;
                      break;
                    case AltOp:
                      flowStack && (resourceStack = new flowNode(NodeCons, flowStack, resourceStack)), flowStack = new flowNode(AltOp, resultHandler, currentFlow._2, resultHandler), currentFlow = currentFlow._1;
                      break;
                    default:
                      nextOp = fiberIdCounter++, currentFiberState = killedState, currentOp = currentFlow, currentFlow = new flowNode(ConcurrentOp, nextOp, new flowNode(NodeCons, flowStack, resourceStack), resultHandler);
                      (currentOp = fiberExecutor(resultHandler, canceler, currentOp)).onComplete({
                        rethrow: !1,
                        handler: handleFiberCompletion(currentFlow)
                      })(), activeFibers[nextOp] = currentOp, canceler && canceler.register(currentOp);
                  }
                  break;
                case killedState:
                  if (null === flowStack) break buildGraphLoop;
                  flowStack._1 === resultHandler ? (flowStack._1 = currentFlow, currentFiberState = runningState, currentFlow = flowStack._2, flowStack._2 = resultHandler) : (flowStack._2 = currentFlow, currentFlow = flowStack, null === resourceStack ? flowStack = null : (flowStack = resourceStack._1, resourceStack = resourceStack._2));
              }

              for (resultHandler = currentFlow, nextOp = 0; nextOp < fiberIdCounter; nextOp++) activeFibers[nextOp].run();
            }(),

            function (killVal) {
              return new flowNode(AsyncOp, function (cancelCallback) {
                return function () {
                  for (var key in globalKillReason = resultHandler.left(killVal), cleanupHandlers)
                    if (cleanupHandlers.hasOwnProperty(key))
                      for (var subKey in killVal = cleanupHandlers[key])
                        killVal.hasOwnProperty(subKey) && killVal[subKey]();
                  cleanupHandlers = null;
                  var finalCleanups = handleSequentialCleanup(killVal, resultHandler, cancelCallback);
                  return function (cancelVal) {
                    return new flowNode(AsyncOp, function () {
                      for (var key in finalCleanups) finalCleanups.hasOwnProperty(key) && finalCleanups[key]();
                      return pureFlowCreator;
                    });
                  };
                };
              });
            };
          }

          /**
           * Converts an asynchronous flow into a sequential flow.
           * @param {object} resultHandler - The result handler.
           * @param {*} canceler - The canceler.
           * @param {*} flow - The asynchronous flow to convert.
           * @returns {*} A flow node representing the sequential execution.
           */
          function createSequentialFlow(resultHandler, canceler, flow) {
            return new flowNode(AsyncOp, function (callback) {
              return function () {
                return sequentialExecutor(resultHandler, canceler, flow, callback);
              };
            });
          }

          // Export constructor tags and utility functions.
          return flowNode.EMPTY = resultHandler,
            flowNode.ValueResult = flowNodeCreator(ValueResult),
            flowNode.ErrorResult = flowNodeCreator(ErrorResult),
            flowNode.TryBlock = flowNodeCreator(TryBlock),
            flowNode.SyncOp = flowNodeCreator(SyncOp),
            flowNode.AsyncOp = flowNodeCreator(AsyncOp),
            flowNode.ChainOp = flowNodeCreator(ChainOp),
            flowNode.ResourceOp = flowNodeCreator(ResourceOp),
            flowNode.ConcurrentOp = flowNodeCreator(ConcurrentOp),
            flowNode.SerialOp = flowNodeCreator(SerialOp),
            flowNode.MapOp = flowNodeCreator(MapOp),
            flowNode.ApplyOp = flowNodeCreator(ApplyOp),
            flowNode.AltOp = flowNodeCreator(AltOp),
            flowNode.Fiber = fiberExecutor,
            flowNode.Supervisor = function (resultHandler) {
              var activeSupervisedFibers = {}, // Map of currently supervised fibers.
                nextFiberId = 0, // Counter for fiber IDs.
                runningFiberCount = 0; // Number of currently running fibers.
              return {
                register: function (fiber) {
                  var id = nextFiberId++;
                  fiber.onComplete({
                    rethrow: !0,
                    handler: function (result) {
                      return function () {
                        runningFiberCount--, delete activeSupervisedFibers[id];
                      };
                    }
                  }), activeSupervisedFibers[id] = fiber, runningFiberCount++;
                },
                isEmpty: function () {
                  return 0 === runningFiberCount;
                },
                killAll: function (killError, callback) {
                  return function () {
                    var remainingKills = 0,
                      killActions = {};

                    function handleKillCompletion(fiberId) {
                      killActions[fiberId] = activeSupervisedFibers[fiberId].kill(killError, function (result) {
                        return function () {
                          delete killActions[fiberId], remainingKills--, resultHandler.isLeft(result) && resultHandler.fromLeft(result) && setTimeout(function () {
                            throw resultHandler.fromLeft(result);
                          }, 0), 0 === remainingKills && callback();
                        };
                      })();
                    }
                    for (var fiberId in activeSupervisedFibers) activeSupervisedFibers.hasOwnProperty(fiberId) && (remainingKills++, handleKillCompletion(fiberId));
                    return activeSupervisedFibers = {}, nextFiberId = 0, runningFiberCount = 0,
                      function (cancelVal) {
                        return new flowNode(AsyncOp, function () {
                          for (var fiberId in killActions) killActions.hasOwnProperty(fiberId) && killActions[fiberId]();
                          return pureFlowCreator;
                        });
                      };
                  };
                }
              };
            },
            flowNode.Scheduler = taskScheduler,
            flowNode.noCancelAction = pureFlowCreator,
            flowNode;
        }();

      // Export core Aff operations as module functions.
      moduleScope.pureValue = asyncFlowRuntime.ValueResult;
      moduleScope.mapValue = function (transformFn) {
        return function (flow) {
          return flow.tag === asyncFlowRuntime.ValueResult.tag ? asyncFlowRuntime.ValueResult(transformFn(flow._1)) : asyncFlowRuntime.ChainOp(flow, function (val) {
            return asyncFlowRuntime.ValueResult(transformFn(val));
          });
        };
      };
      moduleScope.bindValue = function (flow, bindFunc) {
        return asyncFlowRuntime.ChainOp(flow, bindFunc);
      };
      moduleScope.liftEffectOp = asyncFlowRuntime.SyncOp;
      moduleScope.parallelMap = function (transformFn) {
        return function (flow) {
          return asyncFlowRuntime.MapOp(transformFn, flow);
        };
      };
      moduleScope.parallelApply = function (funcFlow) {
        return function (argFlow) {
          return asyncFlowRuntime.ApplyOp(funcFlow, argFlow);
        };
      };
      moduleScope.createAsync = asyncFlowRuntime.AsyncOp;
      moduleScope.createFiber = function (resultHandler, flow) {
        return function () {
          return asyncFlowRuntime.Fiber(resultHandler, null, flow);
        };
      };
      moduleScope.executeSerial = asyncFlowRuntime.SerialOp;
    }(globalContext["Runtime.AsyncFlow"] = globalContext["Runtime.AsyncFlow"] || {}),

    /*
     * Module: Runtime.AsyncFlow (Effect.Aff) - Full definition with type class instances.
     */
    function (moduleScope) {
      "use strict";
      var asyncFlowModule = globalContext["Runtime.AsyncFlow"],
        applicativeModule = (globalContext["Flow.Alternative"], globalContext["Flow.PureApplicator"]),
        applyModule = globalContext["Flow.Applicator"],
        bindModule = globalContext["Flow.Chainer"],
        monadModule = (globalContext["Control.Lazy"], globalContext["Flow.Sequencer"]),
        parallelModule = (globalContext["Control.Monad.Error.Class"], globalContext["Control.Monad.Rec.Class"], globalContext["Flow.Concurrency"]),
        concurrencyClassModule = globalContext["Flow.ConcurrencyClass"],
        eitherModule = (globalContext["Flow.Additive"], globalContext["Flow.Combinator"], globalContext["Core.Choice"]),
        foldableModule = globalContext["Core.Aggregator"],
        functionalModule = globalContext["Core.Functional"],
        functorModule = (globalContext["Data.Function.Uncurried"], globalContext["Flow.Mapper"]),
        monoidModule = globalContext["Core.Combiner"],
        semigroupModule = (globalContext["Data.Newtype"], globalContext["Core.Combinable"]),
        unitModule = (globalContext["Data.Time.Duration"], globalContext["Core.UnitType"]),
        effectModule = globalContext["Runtime.Action"],
        actionClassModule = globalContext["Runtime.ActionClass"],
        partialModule = (globalContext["Runtime.Exception"], globalContext["Effect.Unsafe"], globalContext["Danger.Partial"]),
        typeCastModule = (globalContext.Prelude, globalContext["Danger.TypeCast"]),
        parallelFlowFunctorInstance = new functorModule.MapperClass(asyncFlowModule.parallelMap),
        asyncFlowFunctorInstance = new functorModule.MapperClass(asyncFlowModule.mapValue),
        asyncFlowResultHandler = {
          isLeft: function (result) {
            if (result instanceof eitherModule.LeftOption) return !0;
            if (result instanceof eitherModule.RightOption) return !1;
            throw new Error("Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [result.constructor.name]);
          },
          fromLeft: function (result) {
            if (result instanceof eitherModule.LeftOption) return result.value0;
            if (result instanceof eitherModule.RightOption) return partialModule.unsafeTerminateWithError("unsafeFromLeft: Right");
            throw new Error("Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [result.constructor.name]);
          },
          fromRight: function (result) {
            if (result instanceof eitherModule.RightOption) return result.value0;
            if (result instanceof eitherModule.LeftOption) return partialModule.unsafeTerminateWithError("unsafeFromRight: Left");
            throw new Error("Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [result.constructor.name]);
          },
          left: eitherModule.LeftOption.create,
          right: eitherModule.RightOption.create
        },
        startAsyncFlow = function (flow) {
          return function () {
            var fiberCreator = function (flowDef) {
              return asyncFlowModule.createFiber(asyncFlowResultHandler, flowDef);
            }(flow)();
            return fiberCreator.run(), fiberCreator;
          };
        },
        parallelFlowApplicatorInstance = new applyModule.ApplicatorClass(function () {
          return parallelFlowFunctorInstance;
        }, asyncFlowModule.parallelApply),
        asyncFlowMonadInstance = new monadModule.SequencerClass(function () {
          return asyncFlowApplicativeInstance;
        }, function () {
          return asyncFlowBindInstance;
        }),
        asyncFlowBindInstance = new bindModule.ChainerClass(function () {
          return asyncFlowApplyInstance;
        }, asyncFlowModule.bindValue),
        asyncFlowApplyInstance = new applyModule.ApplicatorClass(function () {
          return asyncFlowFunctorInstance;
        }, monadModule.applyMonadic(asyncFlowMonadInstance)),
        asyncFlowApplicativeInstance = new applicativeModule.PureApplicatorClass(function () {
          return asyncFlowApplyInstance;
        }, asyncFlowModule.pureValue),
        asyncFlowMonadEffectInstance = new actionClassModule.ActionMonadClass(function () {
          return asyncFlowMonadInstance;
        }, asyncFlowModule.liftEffectOp),
        asyncFlowConcurrencyInstance = new concurrencyClassModule.ConcurrencyClass(function () {
          return parallelFlowApplicativeInstance;
        }, function () {
          return asyncFlowMonadInstance;
        }, typeCastModule.forceType, asyncFlowModule.executeSerial),
        parallelFlowApplicativeInstance = new applicativeModule.PureApplicatorClass(function () {
          return parallelFlowApplicatorInstance;
        }, function (val) {
          return concurrencyClassModule.toConcurrent(asyncFlowConcurrencyInstance)(applicativeModule.wrapValue(asyncFlowApplicativeInstance)(val));
        }),
        cancelSemigroupInstance = new semigroupModule.CombinableClass(function (cancelFnA) {
          return function (cancelFnB) {
            return function (error) {
              return parallelModule.concurrentSequenceAndDiscard(asyncFlowConcurrencyInstance)(foldableModule.arrayListAggregatorInstance)([cancelFnA(error), cancelFnB(error)]);
            };
          };
        }),
        noCancelAction = functionalModule.alwaysReturn(applicativeModule.wrapValue(asyncFlowApplicativeInstance)(unitModule.singletonValue)),
        cancelMonoidInstance = new monoidModule.CombinerClass(function () {
          return cancelSemigroupInstance;
        }, noCancelAction);
      moduleScope.startAsyncFlow = startAsyncFlow;
      moduleScope.startAsyncFlowAndDiscard = function (flow) {
        return functorModule.discardResult(effectModule.actionFunctorInstance)(startAsyncFlow(flow));
      };
      moduleScope.noCancelAction = noCancelAction;
      moduleScope.asyncFlowFunctorInstance = asyncFlowFunctorInstance;
      moduleScope.asyncFlowApplyInstance = asyncFlowApplyInstance;
      moduleScope.asyncFlowApplicativeInstance = asyncFlowApplicativeInstance;
      moduleScope.asyncFlowBindInstance = asyncFlowBindInstance;
      moduleScope.asyncFlowMonadInstance = asyncFlowMonadInstance;
      moduleScope.asyncFlowMonadEffectInstance = asyncFlowMonadEffectInstance;
      moduleScope.parallelFlowFunctorInstance = parallelFlowFunctorInstance;
      moduleScope.parallelFlowApplicatorInstance = parallelFlowApplicatorInstance;
      moduleScope.parallelFlowApplicativeInstance = parallelFlowApplicativeInstance;
      moduleScope.asyncFlowConcurrencyInstance = asyncFlowConcurrencyInstance;
      moduleScope.cancelSemigroupInstance = cancelSemigroupInstance;
      moduleScope.cancelMonoidInstance = cancelMonoidInstance;
      moduleScope.createAsyncFlow = asyncFlowModule.createAsync;
    }(globalContext["Runtime.AsyncFlow"] = globalContext["Runtime.AsyncFlow"] || {}),

    /*
     * Module: System.Encoding (Node.Encoding)
     * Defines various text encodings used in Node.js streams.
     */
    function (moduleScope) {
      "use strict";
      var AsciiType = function () {
        function AsciiType() {}
        return AsciiType.value = new AsciiType(), AsciiType;
      }(),
      Utf8Type = function () {
        function Utf8Type() {}
        return Utf8Type.value = new Utf8Type(), Utf8Type;
      }(),
      Utf16leType = function () {
        function Utf16leType() {}
        return Utf16leType.value = new Utf16leType(), Utf16leType;
      }(),
      Ucs2Type = function () {
        function Ucs2Type() {}
        return Ucs2Type.value = new Ucs2Type(), Ucs2Type;
      }(),
      Base64Type = function () {
        function Base64Type() {}
        return Base64Type.value = new Base64Type(), Base64Type;
      }(),
      Latin1Type = function () {
        function Latin1Type() {}
        return Latin1Type.value = new Latin1Type(), Latin1Type;
      }(),
      BinaryType = function () {
        function BinaryType() {}
        return BinaryType.value = new BinaryType(), BinaryType;
      }(),
      HexType = function () {
        function HexType() {}
        return HexType.value = new HexType(), HexType;
      }(),
      encodingDisplayInstance = new globalContext["Core.Display"].DisplayClass(function (encodingType) {
        if (encodingType instanceof AsciiType) return "ASCII";
        if (encodingType instanceof Utf8Type) return "UTF8";
        if (encodingType instanceof Utf16leType) return "UTF16LE";
        if (encodingType instanceof Ucs2Type) return "UCS2";
        if (encodingType instanceof Base64Type) return "Base64";
        if (encodingType instanceof Latin1Type) return "Latin1";
        if (encodingType instanceof BinaryType) return "Binary";
        if (encodingType instanceof HexType) return "Hex";
        throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [encodingType.constructor.name]);
      });
      moduleScope.AsciiType = AsciiType;
      moduleScope.Utf8Type = Utf8Type;
      moduleScope.Utf16leType = Utf16leType;
      moduleScope.Ucs2Type = Ucs2Type;
      moduleScope.Base64Type = Base64Type;
      moduleScope.Latin1Type = Latin1Type;
      moduleScope.BinaryType = BinaryType;
      moduleScope.HexType = HexType;
      moduleScope.toNodeEncodingString = function (encodingType) {
        if (encodingType instanceof AsciiType) return "ascii";
        if (encodingType instanceof Utf8Type) return "utf8";
        if (encodingType instanceof Utf16leType) return "utf16le";
        if (encodingType instanceof Ucs2Type) return "ucs2";
        if (encodingType instanceof Base64Type) return "base64";
        if (encodingType instanceof Latin1Type) return "latin1";
        if (encodingType instanceof BinaryType) return "binary";
        if (encodingType instanceof HexType) return "hex";
        throw new Error("Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [encodingType.constructor.name]);
      };
      moduleScope.encodingDisplayInstance = encodingDisplayInstance;
    }(globalContext["System.Encoding"] = globalContext["System.Encoding"] || {}),

    /*
     * Module: System.Process (Node.Process)
     * Provides access to the Node.js 'process' global object.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["System.Process"] = globalContext["System.Process"] || {}).currentProcess = process;
    }(),

    /*
     * Module: System.Stream (Node.Stream)
     * Functions for interacting with Node.js streams (e.g., stdin, stdout).
     */
    function (moduleScope) {
      "use strict";
      moduleScope.readDataChunk = function (stringHandler) {
        return function (bufferHandler) {
          return function (chunk) {
            if (chunk instanceof Buffer) return bufferHandler(chunk);
            if ("string" == typeof chunk) return stringHandler(chunk);
            throw new Error("Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + chunk);
          };
        };
      };
      moduleScope.onDataEvent = function (chunkProcessor) {
        return function (stream) {
          return function (callback) {
            return function () {
              stream.on("data", function (data) {
                callback(chunkProcessor(data))();
              });
            };
          };
        };
      };
      moduleScope.onStreamEnd = function (stream) {
        return function (callback) {
          return function () {
            stream.on("end", callback);
          };
        };
      };
      moduleScope.writeRaw = function (stream) {
        return function (data) {
          return function (callback) {
            return function () {
              return stream.write(data, null, callback);
            };
          };
        };
      };
      moduleScope.writeTextData = function (stream) {
        return function (encoding) {
          return function (text) {
            return function (callback) {
              return function () {
                return stream.write(text, encoding, callback);
              };
            };
          };
        };
      };
    }(globalContext["System.Stream"] = globalContext["System.Stream"] || {}),

    /*
     * Module: System.ByteBuffer (Node.Buffer)
     * Provides functions for working with Node.js Buffer objects.
     */
    function (moduleScope) {
      "use strict";
      (globalContext["System.ByteBuffer"] = globalContext["System.ByteBuffer"] || {}).bufferToString = function (encoding) {
        return function (buffer) {
          return function () {
            return buffer.toString(encoding);
          };
        };
      };
    }(),

    /*
     * Module: System.ByteBuffer (Node.Buffer) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var byteBufferModule = globalContext["System.ByteBuffer"],
        encodingModule = (globalContext["Flow.Combinator"], globalContext["Data.ArrayBuffer.Types"], globalContext["Core.Optional"], globalContext["Core.Display"], globalContext["Runtime.Action"], globalContext["System.Encoding"]);
      moduleScope.convertBufferToString = function (encodingType) {
        return byteBufferModule.bufferToString(encodingModule.toNodeEncodingString(encodingType));
      };
    }(globalContext["System.ByteBuffer"] = globalContext["System.ByteBuffer"] || {}),

    /*
     * Module: System.Stream (Node.Stream) - Full definition with event handlers.
     */
    function (moduleScope) {
      "use strict";
      var streamModule = globalContext["System.Stream"],
        applicativeModule = globalContext["Flow.PureApplicator"],
        bindModule = globalContext["Flow.Chainer"],
        eitherModule = globalContext["Core.Choice"],
        showModule = (globalContext["Flow.Mapper"], globalContext["Core.Optional"], globalContext["Core.Display"]),
        effectModule = globalContext["Runtime.Action"],
        exceptionModule = globalContext["Runtime.Exception"],
        byteBufferModule = globalContext["System.ByteBuffer"],
        encodingModule = globalContext["System.Encoding"],
        chunkReader = (globalContext.Prelude, streamModule.readDataChunk(eitherModule.LeftOption.create)(eitherModule.RightOption.create)),
        dataEventHandler = function (chunkProcessor) {
          return function (stream) {
            return streamModule.onDataEvent(chunkProcessor)(stream);
          };
        },
        dataStringEventHandler = function (chunkProcessor) {
          return function (stream) {
            return dataEventHandler(stream)(bindModule.composeMonadicFlipped(effectModule.actionBindInstance)(chunkProcessor)(function (result) {
              if (result instanceof eitherModule.LeftOption) return exceptionModule.raise("Stream encoding should not be set");
              if (result instanceof eitherModule.RightOption) return applicativeModule.wrapValue(effectModule.actionApplicativeInstance)(result.value0);
              throw new Error("Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [result.constructor.name]);
            }));
          };
        };
      moduleScope.handleData = dataStringEventHandler;
      moduleScope.handleDataAsString = function (stream) {
        return function (encodingType) {
          return function (callback) {
            return dataStringEventHandler(stream)(bindModule.composeMonadicFlipped(effectModule.actionBindInstance)(callback)(byteBufferModule.convertBufferToString(encodingType)));
          };
        };
      };
      moduleScope.handleDataEither = dataEventHandler;
      moduleScope.writeText = function (stream) {
        return function (encodingType) {
          return streamModule.writeTextData(stream)(showModule.renderValue(encodingModule.encodingDisplayInstance)(encodingType));
        };
      };
      moduleScope.handleStreamEnd = streamModule.onEnd;
    }(globalContext["System.Stream"] = globalContext["System.Stream"] || {}),

    /*
     * Module: System.Process (Node.Process) - Full definition.
     */
    function (moduleScope) {
      "use strict";
      var processModule = globalContext["System.Process"],
        standardOutput = (globalContext["Flow.Mapper"], globalContext["Core.Optional"], globalContext["Data.Posix"], globalContext["Data.Posix.Signal"], globalContext["Runtime.Action"], globalContext["Foreign.Object"], globalContext["Node.Platform"], globalContext["System.Stream"], globalContext.Prelude, globalContext["Danger.TypeCast"], processModule.currentProcess.stdout),
        standardInput = processModule.currentProcess.stdin;
      moduleScope.consoleInput = standardInput;
      moduleScope.consoleOutput = standardOutput;
    }(globalContext["System.Process"] = globalContext["System.Process"] || {}),

    /*
     * Module: ProblemSolver (ABC105B)
     * Contains the main logic for solving a specific programming problem.
     */
    function (moduleScope) {
      "use strict";
      var applicativeModule = globalContext["Flow.PureApplicator"],
        bindModule = globalContext["Flow.Chainer"],
        categoryModule = globalContext["Flow.Hierarchy"],
        monadZeroModule = globalContext["Flow.OptionalSequencer"],
        listModule = globalContext["Core.List"],
        booleanModule = globalContext["Core.Logic"],
        eitherModule = globalContext["Core.Choice"],
        euclideanRingModule = globalContext["Core.DivisionAlgebra"],
        functorModule = (globalContext["Data.Eq"], globalContext["Core.Functional"], globalContext["Flow.Mapper"]),
        integerModule = (globalContext["Data.HeytingAlgebra"], globalContext["Core.Integer"]),
        monoidModule = globalContext["Core.Combiner"],
        textUtilModule = (globalContext["Core.Combinable"], globalContext["Core.AlgebraicOps"], globalContext["Data.String"], globalContext["Core.TextUtil"]),
        pairModule = globalContext["Core.Pair"],
        unitModule = globalContext["Core.UnitType"],
        effectModule = globalContext["Runtime.Action"],
        asyncFlowModule = globalContext["Runtime.AsyncFlow"],
        actionClassModule = globalContext["Runtime.ActionClass"],
        mutableRefModule = globalContext["Runtime.MutableRef"],
        encodingModule = globalContext["System.Encoding"],
        processModule = globalContext["System.Process"],
        streamModule = globalContext["System.Stream"],
        partialModule = globalContext["Danger.Partial"],
        solveLogic = (globalContext.Prelude, function (totalValue) {
          return eitherModule.processChoice(function (errorMsg) {
            return partialModule.unsafeTerminateWithError(errorMsg);
          })(categoryModule.elementIdentity(categoryModule.functionHierarchy))(
            bindModule.chainOperation(eitherModule.choiceChainerInstance)(
              eitherModule.convertOptionalToChoice("n")(
                integerModule.parseDecimalString(textUtilModule.trimWhitespace(totalValue))
              )
            )(function (parsedValue) {
              return applicativeModule.wrapValue(eitherModule.choicePureApplicatorInstance)(
                function (found) {
                  if (found) return "Yes";
                  if (booleanModule.elseCondition) return "No";
                  throw new Error("Failed pattern match at ABC105B (line 49, column 1 - line 49, column 29): " + [found.constructor.name]);
                }(
                  !listModule.isEmptyList(
                    bindModule.chainOperation(bindModule.arrayListChainerInstance)(
                      listModule.createSequence(0)(
                        euclideanRingModule.divideOp(euclideanRingModule.integerEuclideanRingInstance)(parsedValue)(4)
                      )
                    )(function (count4) {
                      return bindModule.chainOperation(bindModule.arrayListChainerInstance)(
                        listModule.createSequence(0)(
                          euclideanRingModule.divideOp(euclideanRingModule.integerEuclideanRingInstance)(parsedValue)(7)
                        )
                      )(function (count7) {
                        return bindModule.discardOperation(monadZeroModule.unitDiscardInstance)(bindModule.arrayListChainerInstance)(
                          monadZeroModule.conditionalGuard(monadZeroModule.arrayListOptionalSequencerInstance)(
                            ((4 * count4 | 0) + (7 * count7 | 0) | 0) === parsedValue
                          )
                        )(function () {
                          return applicativeModule.wrapValue(applicativeModule.arrayListPureApplicatorInstance)(
                            new pairModule.PairClass(count4, count7)
                          );
                        });
                      });
                    })
                  )
                ) + "\n"
              );
            })
          );
        }),
        inputCollectorFlow = asyncFlowModule.createAsync(function (callback) {
          return function () {
            var inputRef = mutableRefModule.createRef("")();
            streamModule.handleDataAsString(processModule.consoleInput)(encodingModule.Utf8Type.value)(function (chunk) {
              return function () {
                var currentContent = mutableRefModule.readRef(inputRef)();
                return mutableRefModule.writeRef(currentContent + chunk)(inputRef)();
              };
            })(),
            streamModule.handleStreamEnd(processModule.consoleInput)(function () {
              var finalContent = mutableRefModule.readRef(inputRef)();
              return callback(applicativeModule.wrapValue(eitherModule.choicePureApplicatorInstance)(finalContent))();
            })(),
            monoidModule.emptyElement(asyncFlowModule.cancelMonoidInstance);
          };
        }),
        mainExecution = asyncFlowModule.startAsyncFlowAndDiscard(
          bindModule.chainOperation(asyncFlowModule.asyncFlowBindInstance)(inputCollectorFlow)(function (inputString) {
            return bindModule.chainOperation(asyncFlowModule.asyncFlowBindInstance)(
              applicativeModule.wrapValue(asyncFlowModule.asyncFlowApplicativeInstance)(solveLogic(inputString))
            )(function (outputString) {
              return actionClassModule.liftAction(asyncFlowModule.asyncFlowMonadEffectInstance)(
                functorModule.discardResult(effectModule.actionFunctorInstance)(
                  streamModule.writeText(processModule.consoleOutput)(encodingModule.Utf8Type.value)(outputString)(
                    applicativeModule.wrapValue(effectModule.actionApplicativeInstance)(unitModule.singletonValue)
                  )
                )
              );
            });
          })
        );
      moduleScope.executeMain = mainExecution;
      moduleScope.performCalculation = solveLogic;
    }(globalContext.ABC105B = globalContext.ABC105B || {}),

    // Initiate the main execution flow of the problem solver module.
    globalContext.ABC105B.executeMain();
  }]
}, {}, ["BaseUtils"], null);