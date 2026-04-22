/* This is a custom module loading system, similar to a bundler runtime. */
/* It handles dynamic module loading and dependency resolution for various code fragments. */
moduleLinker = function(moduleDefinitions, loadedModulesCache, entryPointsArray, globalNamespaceIdentifier) {
  /* Stores any error encountered during initial module loading. */
  var initialLoadError;
  /* Reference to an existing global module linker function, if available. */
  var existingGlobalLinker = ("function" === typeof moduleLinker && moduleLinker);
  /* Reference to Node.js 'require' function, if available. */
  var nodeJsRequire = ("function" === typeof require && require);

  /* Core function to obtain a module by its unique ID. */
  function obtainModule(moduleId, suppressGlobalLookup) {
    // If module is already in cache, return its exports.
    if (!loadedModulesCache[moduleId]) {
      // If module definition is not found, try global/Node.js require.
      if (!moduleDefinitions[moduleId]) {
        var lookupError = new Error("Module '" + moduleId + "' not found.");
        lookupError.code = "MODULE_NOT_FOUND";

        if (!suppressGlobalLookup && existingGlobalLinker) {
          // Attempt to load from an existing global linker.
          return existingGlobalLinker(moduleId, true);
        }
        if (nodeJsRequire && "string" === typeof moduleId) {
          // Attempt to load using Node.js require.
          return nodeJsRequire(moduleId);
        }
        // If all lookups fail, throw an error.
        throw lookupError;
      }
      // Set up context for the module's execution.
      currentModuleContext.resolve = function(relativeId) {
        return moduleDefinitions[moduleId][1][relativeId] || relativeId;
      };
      currentModuleContext.cache = {}; // Clear cache for new module execution.
      // Create a new module instance and store it in the cache.
      var moduleInstance = loadedModulesCache[moduleId] = new obtainModule.Module(moduleId);
      // Execute the module's code.
      moduleDefinitions[moduleId][0].call(moduleInstance.exports, currentModuleContext, moduleInstance, moduleInstance.exports, this);
    }
    return loadedModulesCache[moduleId].exports;

    /* Helper function for module context to fetch dependencies. */
    function currentModuleContext(dependencyId) {
      return obtainModule(currentModuleContext.resolve(dependencyId));
    }
  }

  // Mark the linker as originating from this bundler runtime.
  obtainModule.isBundleRuntime = true;
  // Module constructor definition.
  obtainModule.Module = function(id) {
    this.id = id;
    this.bundle = obtainModule;
    this.exports = {};
  };
  // Store module definitions and cache.
  obtainModule.definitions = moduleDefinitions;
  obtainModule.cacheStorage = loadedModulesCache;
  obtainModule.parentLinker = existingGlobalLinker;
  // Function to register new modules dynamically.
  obtainModule.registerDynamic = function(registeredId, moduleContent) {
    moduleDefinitions[registeredId] = [function(moduleExports, moduleInstance) {
      moduleInstance.exports = moduleContent;
    }, {}];
  };

  // Iterate through entry points and load them sequentially.
  for (var entryIndex = 0; entryIndex < entryPointsArray.length; entryIndex++) {
    try {
      obtainModule(entryPointsArray[entryIndex]);
    } catch (currentError) {
      initialLoadError = initialLoadError || currentError; // Store the first error encountered.
    }
  }

  // If there are entry points, handle the export of the last one.
  if (entryPointsArray.length) {
    var finalExport = obtainModule(entryPointsArray[entryPointsArray.length - 1]);
    if ("object" === typeof exports && "undefined" !== typeof module) {
      module.exports = finalExport;
    } else if ("function" === typeof define && define.amd) {
      define(function() {
        return finalExport;
      });
    } else if (globalNamespaceIdentifier) {
      this[globalNamespaceIdentifier] = finalExport;
    }
  }

  // Update the global moduleLinker reference to the current instance.
  moduleLinker = obtainModule;
  // If an error occurred during initial loading, re-throw it now.
  if (initialLoadError) {
    throw initialLoadError;
  }
  return obtainModule;

}({
  "Module_Focm": [
    function(requireModule, moduleObject, exportsObject) {
      // Main registry for all modules defined within this bundle.
      var moduleRegistry = {};

      /* Define 'Utility.Invoke' module and its 'listInvoke' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Utility.Invoke"] = moduleRegistry["Utility.Invoke"] || {}).listInvoke = function(functionList) {
          return function(argumentList) {
            var funcsCount = functionList.length;
            var argsCount = argumentList.length;
            var combinedResults = new Array(funcsCount * argsCount);
            var resultIndex = 0;
            // Iterate through functions and arguments, applying each function to each argument.
            for (var funcIdx = 0; funcIdx < funcsCount; funcIdx++) {
              var currentFunction = functionList[funcIdx];
              for (var argIdx = 0; argIdx < argsCount; argIdx++) {
                combinedResults[resultIndex++] = currentFunction(argumentList[argIdx]);
              }
            }
            return combinedResults;
          };
        };
      })();

      /* Define 'Data.Logical' module and its 'defaultTrue' constant. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Logical"] = moduleRegistry["Data.Logical"] || {}).defaultTrue = !0;
      })();

      /* Define 'Data.Equality' module and its 'strictCompare' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Equality"] = moduleRegistry["Data.Equality"] || {}).strictCompare = function(firstVal) {
          return function(secondVal) {
            return firstVal === secondVal;
          };
        };
      })();

      /* Define 'Data.Empty' module and its 'voidValue' constant. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Empty"] = moduleRegistry["Data.Empty"] || {}).voidValue = {};
      })();

      /* Define 'Data.Display' module and its 'renderInteger' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Display"] = moduleRegistry["Data.Display"] || {}).renderInteger = function(intValue) {
          return intValue.toString();
        };
      })();

      /* Configure 'Data.Display' module exports. */
      (function(targetExports) {
        "use strict";
        var displayUtils = moduleRegistry["Data.Display"];
        var symbolData = (moduleRegistry["Data.Symbol"], moduleRegistry["Record.Unsafe"], moduleRegistry["Type.Data.RowList"], function(displayFunc) {
          this.show = displayFunc;
        });
        var integerDisplayInstance = new symbolData(displayUtils.renderInteger);
        targetExports.Displayable = symbolData;
        targetExports.render = function(instance) {
          return instance.show;
        };
        targetExports.renderIntegerInstance = integerDisplayInstance;
      })(moduleRegistry["Data.Display"] = moduleRegistry["Data.Display"] || {});

      /* Configure 'Data.Empty' module exports. */
      (function(targetExports) {
        "use strict";
        var emptyData = moduleRegistry["Data.Empty"];
        moduleRegistry["Data.Display"]; // Ensure Data.Display is loaded
        targetExports.voidValue = emptyData.voidValue;
      })(moduleRegistry["Data.Empty"] = moduleRegistry["Data.Empty"] || {});

      /* Configure 'Data.Equality' module exports. */
      (function(targetExports) {
        "use strict";
        var equalityUtils = moduleRegistry["Data.Equality"];
        var algebraicData = (moduleRegistry["Data.HeytingAlgebra"], moduleRegistry["Data.Symbol"], moduleRegistry["Data.Empty"], moduleRegistry["Data.Void"], moduleRegistry["Record.Unsafe"], moduleRegistry["Type.Data.RowList"], function(eqFunc) {
          this.eq = eqFunc;
        });
        var integerEquatorInstance = new algebraicData(equalityUtils.strictCompare);
        targetExports.Equator = algebraicData;
        targetExports.areEqual = function(instance) {
          return instance.eq;
        };
        targetExports.integerEquator = integerEquatorInstance;
      })(moduleRegistry["Data.Equality"] = moduleRegistry["Data.Equality"] || {});

      /* Define 'Data.Sort.Raw' module and its 'directComparison' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Sort.Raw"] = moduleRegistry["Data.Sort.Raw"] || {}).directComparison = function(lessThanResult) {
          return function(equalResult) {
            return function(greaterThanResult) {
              return function(valA) {
                return function(valB) {
                  return valA < valB ? lessThanResult : valA === valB ? equalResult : greaterThanResult;
                };
              };
            };
          };
        };
      })();

      /* Configure 'Data.Sequence' module exports for ordering types. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Data.Equality"], moduleRegistry["Data.Semigroup"], moduleRegistry["Data.Display"];
        var lowValue = function() {
          function Low() {}
          Low.value = new Low();
          return Low;
        }();
        var highValue = function() {
          function High() {}
          High.value = new High();
          return High;
        }();
        var sameValue = function() {
          function Same() {}
          Same.value = new Same();
          return Same;
        }();
        targetExports.LOW = lowValue;
        targetExports.HIGH = highValue;
        targetExports.SAME = sameValue;
      })(moduleRegistry["Data.Sequence"] = moduleRegistry["Data.Sequence"] || {});

      /* Configure 'Data.Sort.Raw' module exports. */
      (function(targetExports) {
        "use strict";
        var rawSort = moduleRegistry["Data.Sort.Raw"];
        var sequenceTypes = moduleRegistry["Data.Sequence"];
        var directOrderingFunc = rawSort.directComparison(sequenceTypes.LOW.value)(sequenceTypes.SAME.value)(sequenceTypes.HIGH.value);
        targetExports.directOrder = directOrderingFunc;
      })(moduleRegistry["Data.Sort.Raw"] = moduleRegistry["Data.Sort.Raw"] || {});

      /* Configure 'Data.Sequence' module exports for ordering instances. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Data.Sequence"]; // Data.Ord
        var equalityModule = moduleRegistry["Data.Equality"];
        var rawSortModule = moduleRegistry["Data.Sort.Raw"];
        var orderingInterface = (moduleRegistry["Data.Sequence"], moduleRegistry["Data.Ring"], moduleRegistry["Data.Semiring"], moduleRegistry["Data.Symbol"], moduleRegistry["Data.Empty"], moduleRegistry["Data.Void"], moduleRegistry["Record.Unsafe"], moduleRegistry["Type.Data.RowList"], function(eqInstance, compareFunc) {
          this.Eq0 = eqInstance;
          this.compare = compareFunc;
        });
        var integerOrderingInstance = new orderingInterface(function() {
          return equalityModule.integerEquator;
        }, rawSortModule.directOrder);
        targetExports.Sequencer = orderingInterface;
        targetExports.order = function(instance) {
          return instance.compare;
        };
        targetExports.integerSequencer = integerOrderingInstance;
      })(moduleRegistry["Data.Sequence"] = moduleRegistry["Data.Sequence"] || {});

      /* Configure 'Data.Operation' module exports for function utilities. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Category"], moduleRegistry["Data.Logical"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Ring"];
        targetExports.reverseArgs = function(funcToFlip) {
          return function(argTwo) {
            return function(argOne) {
              return funcToFlip(argOne)(argTwo);
            };
          };
        };
        targetExports.always = function(constantValue) {
          return function(ignoredArg) {
            return constantValue;
          };
        };
      })(moduleRegistry["Data.Operation"] = moduleRegistry["Data.Operation"] || {});

      /* Define 'Data.Mapper' module and its 'listTransform' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Mapper"] = moduleRegistry["Data.Mapper"] || {}).listTransform = function(mappingFunction) {
          return function(inputList) {
            var listSize = inputList.length;
            var transformedList = new Array(listSize);
            for (var itemIdx = 0; itemIdx < listSize; itemIdx++) {
              transformedList[itemIdx] = mappingFunction(inputList[itemIdx]);
            }
            return transformedList;
          };
        };
      })();

      /* Configure 'Data.Mapper' module exports. */
      (function(targetExports) {
        "use strict";
        var mapperModule = moduleRegistry["Data.Mapper"];
        var semigroupoidModule = (moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Operation"]);
        var emptyModule = moduleRegistry["Data.Empty"];
        var transformerType = function(mapFunc) {
          this.map = mapFunc;
        };
        var getTransformFunc = function(instance) {
          return instance.map;
        };
        var listTransformerInstance = new transformerType(mapperModule.listTransform);
        targetExports.Transformer = transformerType;
        targetExports.transform = getTransformFunc;
        targetExports.ignoreResult = function(functorInstance) {
          return getTransformFunc(functorInstance)(semigroupoidModule.always(emptyModule.voidValue));
        };
        targetExports.listTransformer = listTransformerInstance;
      })(moduleRegistry["Data.Mapper"] = moduleRegistry["Data.Mapper"] || {});

      /* Configure 'Control.Execution' module exports. */
      (function(targetExports) {
        "use strict";
        var invokeModule = moduleRegistry["Utility.Invoke"];
        var categoryModule = (moduleRegistry["Control.Category"], moduleRegistry["Data.Operation"]);
        var mapperModule = moduleRegistry["Data.Mapper"];
        var executorType = function(functorInstance, applyFunc) {
          this.Functor0 = functorInstance;
          this.apply = applyFunc;
        };
        var listExecutorInstance = new executorType(function() {
          return mapperModule.listTransformer;
        }, invokeModule.listInvoke);
        targetExports.Executor = executorType;
        targetExports.execute = function(instance) {
          return instance.apply;
        };
        targetExports.listExecutor = listExecutorInstance;
      })(moduleRegistry["Control.Execution"] = moduleRegistry["Control.Execution"] || {});

      /* Configure 'Control.Generative' module exports. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Execution"], moduleRegistry["Data.Mapper"], moduleRegistry["Data.Empty"];
        targetExports.Generator = function(applyInstance, pureFunc) {
          this.Apply0 = applyInstance;
          this.pure = pureFunc;
        };
        targetExports.createPure = function(instance) {
          return instance.pure;
        };
      })(moduleRegistry["Control.Generative"] = moduleRegistry["Control.Generative"] || {});

      /* Define 'Control.Chain' module and its 'listChain' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Control.Chain"] = moduleRegistry["Control.Chain"] || {}).listChain = function(inputList) {
          return function(bindingFunction) {
            var resultingList = [];
            var listLength = inputList.length;
            for (var itemIndex = 0; itemIndex < listLength; itemIndex++) {
              Array.prototype.push.apply(resultingList, bindingFunction(inputList[itemIndex]));
            }
            return resultingList;
          };
        };
      })();

      /* Configure 'Control.Chain' module exports. */
      (function(targetExports) {
        "use strict";
        var chainModule = moduleRegistry["Control.Chain"];
        var generativeModule = (moduleRegistry["Control.Generative"], moduleRegistry["Control.Execution"]);
        var categoryModule = (moduleRegistry["Control.Category"], moduleRegistry["Data.Operation"]);
        var mapperModule = (moduleRegistry["Data.Mapper"], moduleRegistry["Data.Empty"]);
        var chainerType = function(applyInstance, bindFunc) {
          this.Apply0 = applyInstance;
          this.bind = bindFunc;
        };
        var disposerType = function(discardFunc) {
          this.discard = discardFunc;
        };
        var listChainerInstance = new chainerType(function() {
          return generativeModule.listExecutor;
        }, chainModule.listChain);
        var getChainFunc = function(instance) {
          return instance.bind;
        };
        var unitDisposerInstance = new disposerType(function(instance) {
          return getChainFunc(instance);
        });
        targetExports.Chainer = chainerType;
        targetExports.chain = getChainFunc;
        targetExports.chainReversed = function(instance) {
          return categoryModule.reverseArgs(getChainFunc(instance));
        };
        targetExports.Disposer = disposerType;
        targetExports.dispose = function(instance) {
          return instance.discard;
        };
        targetExports.listChainer = listChainerInstance;
        targetExports.unitDisposer = unitDisposerInstance;
      })(moduleRegistry["Control.Chain"] = moduleRegistry["Control.Chain"] || {});

      /* Define 'Control.Monad.Runtime.Core' module exports for mutable state. */
      (function(targetExports) {
        "use strict";
        targetExports.runtimeMap = function(mappingFunc) {
          return function(runtimeAction) {
            return function() {
              return mappingFunc(runtimeAction());
            };
          };
        };
        targetExports.runtimePure = function(value) {
          return function() {
            return value;
          };
        };
        targetExports.runtimeBind = function(runtimeAction) {
          return function(bindingFunc) {
            return function() {
              return bindingFunc(runtimeAction())();
            };
          };
        };
        targetExports.runtimeWhile = function(conditionFunc) {
          return function(loopBodyFunc) {
            return function() {
              for (; conditionFunc();) loopBodyFunc();
            };
          };
        };
        targetExports.runtimeNew = function(initialValue) {
          return function() {
            return {
              value: initialValue
            };
          };
        };
        targetExports.runtimeRead = function(refObject) {
          return function() {
            return refObject.value;
          };
        };
        targetExports.runtimeWrite = function(newValue) {
          return function(refObject) {
            return function() {
              return refObject.value = newValue;
            };
          };
        };
      })(moduleRegistry["Control.Monad.Runtime.Core"] = moduleRegistry["Control.Monad.Runtime.Core"] || {});

      /* Configure 'Control.Sequential' module exports for Monads. */
      (function(targetExports) {
        "use strict";
        var generativeModule = moduleRegistry["Control.Generative"];
        var executionModule = (moduleRegistry["Control.Execution"], moduleRegistry["Control.Chain"]);
        moduleRegistry["Data.Mapper"], moduleRegistry["Data.Empty"];
        targetExports.Sequencer = function(applicativeInstance, bindInstance) {
          this.Applicative0 = applicativeInstance;
          this.Bind1 = bindInstance;
        };
        targetExports.sequenceApply = function(monadInstance) {
          return function(functionMonad) {
            return function(argMonad) {
              return executionModule.chain(monadInstance.Bind1())(functionMonad)(function(funcVal) {
                return executionModule.chain(monadInstance.Bind1())(argMonad)(function(argVal) {
                  return generativeModule.createPure(monadInstance.Applicative0())(funcVal(argVal));
                });
              });
            };
          };
        };
      })(moduleRegistry["Control.Sequential"] = moduleRegistry["Control.Sequential"] || {});

      /* Configure 'Data.Optional' module exports (Maybe type). */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Alt"], moduleRegistry["Control.Alternative"], moduleRegistry["Control.Generative"];
        var executionModule = moduleRegistry["Control.Execution"];
        var chainModule = moduleRegistry["Control.Chain"];
        var categoryModule = (moduleRegistry["Control.Category"], moduleRegistry["Control.Extend"], moduleRegistry["Control.Sequential"], moduleRegistry["Control.MonadZero"], moduleRegistry["Control.Plus"], moduleRegistry["Data.Bounded"], moduleRegistry["Data.Equality"], moduleRegistry["Data.Operation"], moduleRegistry["Data.Mapper"]);
        var functorInvariant = (moduleRegistry["Data.Mapper.Invariant"], moduleRegistry["Data.Monoid"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Semigroup"], moduleRegistry["Data.Display"], moduleRegistry["Data.Empty"], moduleRegistry.Prelude, function() {
          function NoValueType() {}
          NoValueType.value = new NoValueType();
          return NoValueType;
        })();
        var someValueType = function() {
          function SomeValueType(val) {
            this.value0 = val;
          }
          SomeValueType.create = function(val) {
            return new SomeValueType(val);
          };
          return SomeValueType;
        }();
        var optionalTransformerInstance = new categoryModule.Transformer(function(mapFunc) {
          return function(optionalVal) {
            return optionalVal instanceof someValueType ? new someValueType(mapFunc(optionalVal.value0)) : functorInvariant.value;
          };
        });
        var optionalExecutorInstance = new executionModule.Executor(function() {
          return optionalTransformerInstance;
        }, function(maybeFunc) {
          return function(maybeArg) {
            if (maybeFunc instanceof someValueType) return categoryModule.transform(optionalTransformerInstance)(maybeFunc.value0)(maybeArg);
            if (maybeFunc instanceof functorInvariant) return functorInvariant.value;
            throw new Error("Pattern mismatch at Data.Optional (maybeFunc, maybeArg): " + [maybeFunc.constructor.name, maybeArg.constructor.name]);
          };
        });
        var optionalChainerInstance = new chainModule.Chainer(function() {
          return optionalExecutorInstance;
        }, function(maybeVal) {
          return function(bindingFunc) {
            if (maybeVal instanceof someValueType) return bindingFunc(maybeVal.value0);
            if (maybeVal instanceof functorInvariant) return functorInvariant.value;
            throw new Error("Pattern mismatch at Data.Optional (maybeVal, bindingFunc): " + [maybeVal.constructor.name, bindingFunc.constructor.name]);
          };
        });
        targetExports.NoValue = functorInvariant;
        targetExports.SomeValue = someValueType;
        targetExports.handleOptional = function(noValHandler) {
          return function(someValHandler) {
            return function(optionalValue) {
              if (optionalValue instanceof functorInvariant) return noValHandler;
              if (optionalValue instanceof someValueType) return someValHandler(optionalValue.value0);
              throw new Error("Pattern mismatch at Data.Optional (handlers, optionalValue): " + [noValHandler.constructor.name, someValHandler.constructor.name, optionalValue.constructor.name]);
            };
          };
        };
        targetExports.optionalTransformer = optionalTransformerInstance;
        targetExports.optionalExecutor = optionalExecutorInstance;
        targetExports.optionalChainer = optionalChainerInstance;
      })(moduleRegistry["Data.Optional"] = moduleRegistry["Data.Optional"] || {});

      /* Configure 'Data.Choice' module exports (Either type). */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Alt"];
        var generativeModule = moduleRegistry["Control.Generative"];
        var executionModule = moduleRegistry["Control.Execution"];
        var chainModule = moduleRegistry["Control.Chain"];
        var extendModule = (moduleRegistry["Control.Extend"], moduleRegistry["Control.Sequential"], moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Bifoldable"], moduleRegistry["Data.Bifunctor"], moduleRegistry["Data.Bitraversable"], moduleRegistry["Data.Bounded"], moduleRegistry["Data.Equality"], moduleRegistry["Data.Foldable"], moduleRegistry["Data.FoldableWithIndex"], moduleRegistry["Data.Operation"]);
        var mapperModule = (moduleRegistry["Data.Mapper"], moduleRegistry["Data.Mapper.Invariant"], moduleRegistry["Data.MapperWithIndex"], moduleRegistry["Data.Optional"]);
        var monoidModule = (moduleRegistry["Data.Monoid"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Semigroup"], moduleRegistry["Data.Display"], moduleRegistry["Data.Traversable"], moduleRegistry["Data.TraversableWithIndex"], moduleRegistry["Data.Empty"], moduleRegistry.Prelude, function() {
          function LeftChoiceType(val) {
            this.value0 = val;
          }
          LeftChoiceType.create = function(val) {
            return new LeftChoiceType(val);
          };
          return LeftChoiceType;
        })();
        var rightChoiceType = function() {
          function RightChoiceType(val) {
            this.value0 = val;
          }
          RightChoiceType.create = function(val) {
            return new RightChoiceType(val);
          };
          return RightChoiceType;
        }();
        var choiceTransformerInstance = new extendModule.Transformer(function(mapFunc) {
          return function(choiceVal) {
            if (choiceVal instanceof monoidModule) return new monoidModule(choiceVal.value0);
            if (choiceVal instanceof rightChoiceType) return new rightChoiceType(mapFunc(choiceVal.value0));
            throw new Error("Pattern mismatch at Data.Choice (transformer): " + [choiceVal.constructor.name]);
          };
        });
        var handleChoiceFunc = function(leftHandler) {
          return function(rightHandler) {
            return function(choiceVal) {
              if (choiceVal instanceof monoidModule) return leftHandler(choiceVal.value0);
              if (choiceVal instanceof rightChoiceType) return rightHandler(choiceVal.value0);
              throw new Error("Pattern mismatch at Data.Choice (handleChoice): " + [leftHandler.constructor.name, rightHandler.constructor.name, choiceVal.constructor.name]);
            };
          };
        };
        var choiceExecutorInstance = new executionModule.Executor(function() {
          return choiceTransformerInstance;
        }, function(choiceFunc) {
          return function(choiceArg) {
            if (choiceFunc instanceof monoidModule) return new monoidModule(choiceFunc.value0);
            if (choiceFunc instanceof rightChoiceType) return extendModule.transform(choiceTransformerInstance)(choiceFunc.value0)(choiceArg);
            throw new Error("Pattern mismatch at Data.Choice (executor): " + [choiceFunc.constructor.name, choiceArg.constructor.name]);
          };
        });
        var choiceChainerInstance = new chainModule.Chainer(function() {
          return choiceExecutorInstance;
        }, handleChoiceFunc(function(leftVal) {
          return function(bindingFunc) {
            return new monoidModule(leftVal);
          };
        })(function(rightVal) {
          return function(bindingFunc) {
            return bindingFunc(rightVal);
          };
        }));
        var choiceGeneratorInstance = new generativeModule.Generator(function() {
          return choiceExecutorInstance;
        }, rightChoiceType.create);
        targetExports.LeftChoice = monoidModule;
        targetExports.RightChoice = rightChoiceType;
        targetExports.handleChoice = handleChoiceFunc;
        targetExports.annotate = function(leftValue) {
          return mapperModule.handleOptional(new monoidModule(leftValue))(rightChoiceType.create);
        };
        targetExports.choiceTransformer = choiceTransformerInstance;
        targetExports.choiceExecutor = choiceExecutorInstance;
        targetExports.choiceGenerator = choiceGeneratorInstance;
        targetExports.choiceChainer = choiceChainerInstance;
      })(moduleRegistry["Data.Choice"] = moduleRegistry["Data.Choice"] || {});

      /* Define 'Partial.Unverified' module and its 'executeUnverified' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Partial.Unverified"] = moduleRegistry["Partial.Unverified"] || {}).executeUnverified = function(unverifiedAction) {
          return unverifiedAction();
        };
      })();

      /* Define 'Partial.Operations' module and its 'terminateWithError' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Partial.Operations"] = moduleRegistry["Partial.Operations"] || {}).terminateWithError = function() {
          return function(errorMessage) {
            throw new Error(errorMessage);
          };
        };
      })();

      /* Configure 'Partial.Operations' module exports. */
      (function(targetExports) {
        "use strict";
        var partialOps = moduleRegistry["Partial.Operations"];
        targetExports.terminateWithError = partialOps.terminateWithError;
      })(moduleRegistry["Partial.Operations"] = moduleRegistry["Partial.Operations"] || {});

      /* Configure 'Partial.Unverified' module exports. */
      (function(targetExports) {
        "use strict";
        var unverifiedModule = moduleRegistry["Partial.Unverified"];
        var partialOps = moduleRegistry["Partial.Operations"];
        targetExports.terminateUnverified = function(errorMessage) {
          return unverifiedModule.executeUnverified(function(unitArg) {
            return partialOps.terminateWithError(unitArg)(errorMessage);
          });
        };
      })(moduleRegistry["Partial.Unverified"] = moduleRegistry["Partial.Unverified"] || {});

      /* Configure 'Control.Monad.Recursive.Type' module exports. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Generative"], moduleRegistry["Control.Chain"], moduleRegistry["Control.Sequential"], moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Bifunctor"], moduleRegistry["Data.Choice"], moduleRegistry["Data.Mapper"], moduleRegistry["Data.Identity"], moduleRegistry["Data.Optional"], moduleRegistry["Data.Empty"], moduleRegistry.Effect, moduleRegistry["Effect.Ref"], moduleRegistry["Partial.Unverified"], moduleRegistry.Prelude;
        var loopStateType = function() {
          function LoopState(val) {
            this.value0 = val;
          }
          LoopState.create = function(val) {
            return new LoopState(val);
          };
          return LoopState;
        }();
        var doneStateType = function() {
          function DoneState(val) {
            this.value0 = val;
          }
          DoneState.create = function(val) {
            return new DoneState(val);
          };
          return DoneState;
        }();
        var getRecursiveMonadFunc = function(instance) {
          return instance.tailRecM;
        };
        targetExports.LoopState = loopStateType;
        targetExports.DoneState = doneStateType;
        targetExports.RecursiveMonad = function(monadInstance, tailRecMFunc) {
          this.Monad0 = monadInstance;
          this.tailRecM = tailRecMFunc;
        };
        targetExports.recursiveMonad = getRecursiveMonadFunc;
        targetExports.recursiveMonadPair = function(recursiveMonadInstance) {
          return function(pairFunc) {
            return function(initialA) {
              return function(initialB) {
                return getRecursiveMonadFunc(recursiveMonadInstance)(function(pair) {
                  return pairFunc(pair.a)(pair.b);
                })({
                  a: initialA,
                  b: initialB
                });
              };
            };
          };
        };
      })(moduleRegistry["Control.Monad.Recursive.Type"] = moduleRegistry["Control.Monad.Recursive.Type"] || {});

      /* Configure 'Control.Monad.Runtime.Core' module exports for Monad instances. */
      (function(targetExports) {
        "use strict";
        var runtimeCore = moduleRegistry["Control.Monad.Runtime.Core"];
        var generativeModule = moduleRegistry["Control.Generative"];
        var executionModule = moduleRegistry["Control.Execution"];
        var chainModule = moduleRegistry["Control.Chain"];
        var sequentialModule = moduleRegistry["Control.Sequential"];
        var recursiveMonadModule = moduleRegistry["Control.Monad.Recursive.Type"];
        var mapperModule = moduleRegistry["Data.Mapper"];
        var emptyModule = moduleRegistry["Data.Empty"];
        var unverifiedModule = (moduleRegistry["Partial.Unverified"], moduleRegistry.Prelude);
        var runtimeTransformerInstance = new mapperModule.Transformer(runtimeCore.runtimeMap);
        var runtimeSequencerInstance = new sequentialModule.Sequencer(function() {
          return runtimeGeneratorInstance;
        }, function() {
          return runtimeChainerInstance;
        });
        var runtimeChainerInstance = new chainModule.Chainer(function() {
          return runtimeExecutorInstance;
        }, runtimeCore.runtimeBind);
        var runtimeExecutorInstance = new executionModule.Executor(function() {
          return runtimeTransformerInstance;
        }, sequentialModule.sequenceApply(runtimeSequencerInstance));
        var runtimeGeneratorInstance = new generativeModule.Generator(function() {
          return runtimeExecutorInstance;
        }, runtimeCore.runtimePure);
        var runtimeRecursiveMonadInstance = new recursiveMonadModule.RecursiveMonad(function() {
          return runtimeSequencerInstance;
        }, function(loopFunc) {
          return function(initialValue) {
            var isLoopStateCheck = function(state) {
              return state instanceof recursiveMonadModule.LoopState;
            };
            var getDoneValueExtract = function(state) {
              if (state instanceof recursiveMonadModule.DoneState) return state.value0;
              throw new Error("Pattern mismatch at Control.Monad.Runtime.Core (getDoneValueExtract): " + [state.constructor.name]);
            };
            return chainModule.chain(runtimeChainerInstance)(chainModule.chainReversed(runtimeChainerInstance)(runtimeCore.runtimeNew)(loopFunc(initialValue)))(function(mutableRef) {
              return chainModule.dispose(chainModule.unitDisposer)(runtimeChainerInstance)(runtimeCore.runtimeWhile(mapperModule.transform(runtimeTransformerInstance)(isLoopStateCheck)(runtimeCore.runtimeRead(mutableRef)))(chainModule.chain(runtimeChainerInstance)(runtimeCore.runtimeRead(mutableRef))(function(currentState) {
                if (currentState instanceof recursiveMonadModule.LoopState) return chainModule.chain(runtimeChainerInstance)(loopFunc(currentState.value0))(function(nextState) {
                  return mapperModule.ignoreResult(runtimeTransformerInstance)(runtimeCore.runtimeWrite(nextState)(mutableRef));
                });
                if (currentState instanceof recursiveMonadModule.DoneState) return generativeModule.createPure(runtimeGeneratorInstance)(emptyModule.voidValue);
                throw new Error("Pattern mismatch at Control.Monad.Runtime.Core (loop body): " + [currentState.constructor.name]);
              })))(function() {
                return mapperModule.transform(runtimeTransformerInstance)(getDoneValueExtract)(runtimeCore.runtimeRead(mutableRef));
              });
            });
          };
        });
        targetExports.runtimeTransformer = runtimeTransformerInstance;
        targetExports.runtimeExecutor = runtimeExecutorInstance;
        targetExports.runtimeGenerator = runtimeGeneratorInstance;
        targetExports.runtimeChainer = runtimeChainerInstance;
        targetExports.runtimeSequencer = runtimeSequencerInstance;
        targetExports.runtimeRecursiveMonad = runtimeRecursiveMonadInstance;
      })(moduleRegistry["Control.Monad.Runtime.Core"] = moduleRegistry["Control.Monad.Runtime.Core"] || {});

      /* Define 'Data.List' module exports for array operations. */
      (function(targetExports) {
        "use strict";
        targetExports.generateRange = function(startNum) {
          return function(endNum) {
            var step = startNum > endNum ? -1 : 1;
            var resultList = new Array(step * (endNum - startNum) + 1);
            var currentNum = startNum;
            var listIdx = 0;
            for (; currentNum !== endNum;) {
              resultList[listIdx++] = currentNum;
              currentNum += step;
            }
            resultList[listIdx] = currentNum;
            return resultList;
          };
        };
        targetExports.createCopies = "function" === typeof Array.prototype.fill ? function(numCopies) {
          return function(itemToCopy) {
            return numCopies < 1 ? [] : new Array(numCopies).fill(itemToCopy);
          };
        } : function(numCopies) {
          return function(itemToCopy) {
            var copiesList = [];
            var currentIdx = 0;
            for (var copyIdx = 0; copyIdx < numCopies; copyIdx++) {
              copiesList[currentIdx++] = itemToCopy;
            }
            return copiesList;
          };
        };
        targetExports.getListLength = function(inputList) {
          return inputList.length;
        };
        targetExports.getAtIndexRaw = function(nothingValue) {
          return function(justConstructor) {
            return function(listRef) {
              return function(index) {
                return index < 0 || index >= listRef.length ? nothingValue : justConstructor(listRef[index]);
              };
            };
          };
        };
        targetExports.extractSlice = function(startIndex) {
          return function(endIndex) {
            return function(inputList) {
              return inputList.slice(startIndex, endIndex);
            };
          };
        };
        targetExports.removeHead = function(count) {
          return function(inputList) {
            return count < 1 ? inputList : inputList.slice(count);
          };
        };
        targetExports.combineLists = function(mergeFunc) {
          return function(listA) {
            return function(listB) {
              var commonLength = listA.length < listB.length ? listA.length : listB.length;
              var mergedList = new Array(commonLength);
              for (var mergeIdx = 0; mergeIdx < commonLength; mergeIdx++) {
                mergedList[mergeIdx] = mergeFunc(listA[mergeIdx])(listB[mergeIdx]);
              }
              return mergedList;
            };
          };
        };
        targetExports.getUnsafeAtIndex = function(listRef) {
          return function(index) {
            return listRef[index];
          };
        };
      })(moduleRegistry["Data.List"] = moduleRegistry["Data.List"] || {});

      /* Define 'Data.List.Runtime' module exports for mutable array operations. */
      (function(targetExports) {
        "use strict";
        targetExports.updateElement = function(index) {
          return function(newValue) {
            return function(listRef) {
              return function() {
                var isValidIndex = index >= 0 && index < listRef.length;
                if (isValidIndex) {
                  listRef[index] = newValue;
                }
                return isValidIndex;
              };
            };
          };
        };
        targetExports.sortListInPlace = function(compareFunc) {
          return function(listRef) {
            return function() {
              return listRef.sort(function(itemA, itemB) {
                return compareFunc(itemA)(itemB);
              });
            };
          };
        };
      })(moduleRegistry["Data.List.Runtime"] = moduleRegistry["Data.List.Runtime"] || {});

      /* Define 'Unverified.Cast' module and its 'performUnsafeCast' function. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Unverified.Cast"] = moduleRegistry["Unverified.Cast"] || {}).performUnsafeCast = function(value) {
          return value;
        };
      })();

      /* Configure 'Unverified.Cast' module exports. */
      (function(targetExports) {
        "use strict";
        var unverifiedCast = moduleRegistry["Unverified.Cast"];
        targetExports.performUnsafeCast = unverifiedCast.performUnsafeCast;
      })(moduleRegistry["Unverified.Cast"] = moduleRegistry["Unverified.Cast"] || {});

      /* Configure 'Data.List.Runtime' module exports. */
      (function(targetExports) {
        "use strict";
        var listRuntime = moduleRegistry["Data.List.Runtime"];
        var generativeModule = moduleRegistry["Control.Generative"];
        var chainModule = (moduleRegistry["Control.Chain"], moduleRegistry["Control.Monad.Runtime.Core"]);
        var semigroupoidModule = (moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Optional"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Sequence"]);
        moduleRegistry["Data.Ring"], moduleRegistry.Prelude, moduleRegistry["Unverified.Cast"];
        targetExports.sortListBy = function(comparisonFunc) {
          return listRuntime.sortListInPlace(function(itemA) {
            return function(itemB) {
              var orderResult = comparisonFunc(itemA)(itemB);
              if (orderResult instanceof semigroupoidModule.HIGH) return 1;
              if (orderResult instanceof semigroupoidModule.SAME) return 0;
              if (orderResult instanceof semigroupoidModule.LOW) return -1;
              throw new Error("Pattern mismatch at Data.List.Runtime (sortListBy): " + [orderResult.constructor.name]);
            };
          });
        };
        targetExports.freezeUnsafely = function(value) {
          return generativeModule.createPure(chainModule.runtimeGenerator)(value);
        };
        targetExports.thawUnsafely = function(value) {
          return generativeModule.createPure(chainModule.runtimeGenerator)(value);
        };
        targetExports.updateElement = listRuntime.updateElement;
      })(moduleRegistry["Data.List.Runtime"] = moduleRegistry["Data.List.Runtime"] || {});

      /* Configure 'Data.List' module exports. */
      (function(targetExports) {
        "use strict";
        var listUtils = moduleRegistry["Data.List"];
        var alternativeModule = (moduleRegistry["Control.Alt"], moduleRegistry["Control.Alternative"], moduleRegistry["Control.Generative"]);
        var executionModule = (moduleRegistry["Control.Execution"], moduleRegistry["Control.Chain"]);
        var categoryModule = (moduleRegistry["Control.Category"], moduleRegistry["Control.Lazy"], moduleRegistry["Control.Monad.Recursive.Type"]);
        var runtimeModule = (moduleRegistry["Control.Monad.Runtime.Core"], moduleRegistry["Control.Monad.Runtime.Core"], moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.List.NonEmpty.Internal"], moduleRegistry["Data.List.Runtime"], moduleRegistry["Data.Array.ST.Iterator"], moduleRegistry["Data.Logical"]);
        var equalityModule = (moduleRegistry["Data.Equality"], moduleRegistry["Data.Foldable"], moduleRegistry["Data.Operation"]);
        var mapperModule = (moduleRegistry["Data.Mapper"], moduleRegistry["Data.HeytingAlgebra"], moduleRegistry["Data.Optional"]);
        var orderingModule = (moduleRegistry["Data.Sequence"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Ring"], moduleRegistry["Data.Semigroup"], moduleRegistry["Data.Semiring"], moduleRegistry["Data.Traversable"], moduleRegistry["Data.Tuple"], moduleRegistry["Data.Unfoldable"], moduleRegistry["Partial.Unverified"], moduleRegistry.Prelude, moduleRegistry["Unverified.Cast"], function(listRef) {
          return listUtils.getUnsafeAtIndex;
        });
        var singleElementMaker = function(element) {
          return [element];
        };
        var firstElementGetter = listUtils.getAtIndexRaw(mapperModule.NoValue.value)(mapperModule.SomeValue.create);
        var flattenAndMapFunc = equalityModule.reverseArgs(executionModule.chain(executionModule.listChainer));
        targetExports.singleElementList = singleElementMaker;
        targetExports.firstElement = function(inputList) {
          return firstElementGetter(inputList)(0);
        };
        targetExports.getElement = firstElementGetter;
        targetExports.flattenAndMap = flattenAndMapFunc;
        targetExports.filterMap = function(mappingFunc) {
          return flattenAndMapFunc(function(item) {
            return mapperModule.handleOptional([])(singleElementMaker)(mappingFunc(item));
          });
        };
        targetExports.mapIndexed = function(indexedMapFunc) {
          return function(inputList) {
            return listUtils.combineLists(indexedMapFunc)(listUtils.generateRange(0)(listUtils.getListLength(inputList) - 1 | 0))(inputList);
          };
        };
        targetExports.recursiveFold = function(recursiveMonadInstance) {
          return function(foldFunc) {
            return function(initialAccumulator) {
              return function(dataList) {
                return categoryModule.recursiveMonadPair(recursiveMonadInstance)(function(currentAccumulator) {
                  return function(currentIndex) {
                    if (currentIndex >= listUtils.getListLength(dataList)) return alternativeModule.createPure(recursiveMonadInstance.Monad0().Applicative0())(new categoryModule.DoneState(currentAccumulator));
                    if (runtimeModule.defaultTrue) return executionModule.chain(recursiveMonadInstance.Monad0().Bind1())(foldFunc(currentAccumulator)(orderingModule()(dataList)(currentIndex)))(function(nextAccumulator) {
                      return alternativeModule.createPure(recursiveMonadInstance.Monad0().Applicative0())(new categoryModule.LoopState({
                        a: nextAccumulator,
                        b: currentIndex + 1 | 0
                      }));
                    });
                    throw new Error("Pattern mismatch at Data.List (recursiveFold): " + [currentAccumulator.constructor.name, currentIndex.constructor.name]);
                  };
                })(initialAccumulator)(0);
              };
            };
          };
        };
        targetExports.unsafeGetElement = orderingModule;
        targetExports.createCopies = listUtils.createCopies;
        targetExports.removeHead = listUtils.removeHead;
      })(moduleRegistry["Data.List"] = moduleRegistry["Data.List"] || {});

      /* Define 'Data.Integer' module exports for integer parsing. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Integer"] = moduleRegistry["Data.Integer"] || {}).parseStringAsBase = function(justConstructor) {
          return function(nothingValue) {
            return function(radix) {
              var regexCharSet;
              regexCharSet = radix < 11 ? "[0-" + (radix - 1).toString() + "]" : 11 === radix ? "[0-9a]" : "[0-9a-" + String.fromCharCode(86 + radix) + "]";
              var parseRegex = new RegExp("^[\\+\\-]?" + regexCharSet + "+$", "i");
              return function(inputString) {
                if (parseRegex.test(inputString)) {
                  var parsedInt = parseInt(inputString, radix);
                  return (0 | parsedInt) === parsedInt ? justConstructor(parsedInt) : nothingValue;
                }
                return nothingValue;
              };
            };
          };
        };
      })();

      /* Configure 'Data.Integer' module exports. */
      (function(targetExports) {
        "use strict";
        var integerUtils = moduleRegistry["Data.Integer"];
        var categoryModule = (moduleRegistry["Control.Category"], moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Logical"], moduleRegistry["Data.Bounded"], moduleRegistry["Data.CommutativeRing"], moduleRegistry["Data.DivisionRing"], moduleRegistry["Data.Equality"], moduleRegistry["Data.EuclideanRing"], moduleRegistry["Data.HeytingAlgebra"], moduleRegistry["Data.Int.Bits"], moduleRegistry["Data.Optional"]);
        var orderingModule = (moduleRegistry["Data.Sequence"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Ring"], moduleRegistry["Data.Semiring"], moduleRegistry["Data.Display"], moduleRegistry.Global, moduleRegistry.Math, moduleRegistry.Prelude, integerUtils.parseStringAsBase(categoryModule.SomeValue.create)(categoryModule.NoValue.value));
        var parseIntegerDecimalFunc = orderingModule(10);
        targetExports.parseIntegerDecimal = parseIntegerDecimalFunc;
        targetExports.parseIntegerBase = orderingModule;
      })(moduleRegistry["Data.Integer"] = moduleRegistry["Data.Integer"] || {});

      /* Define 'Data.Text.Units' module exports for string length. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Data.Text.Units"] = moduleRegistry["Data.Text.Units"] || {}).unitLength = function(textString) {
          return textString.length;
        };
      })();

      /* Configure 'Data.Text.Units' module exports. */
      (function(targetExports) {
        "use strict";
        var textUnits = moduleRegistry["Data.Text.Units"];
        moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.Logical"], moduleRegistry["Data.Equality"], moduleRegistry["Data.Operation"], moduleRegistry["Data.HeytingAlgebra"], moduleRegistry["Data.Optional"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.Ring"], moduleRegistry["Data.Semiring"], moduleRegistry["Data.String.Pattern"], moduleRegistry["Data.String.Unsafe"], moduleRegistry.Prelude;
        targetExports.unitLength = textUnits.unitLength;
      })(moduleRegistry["Data.Text.Units"] = moduleRegistry["Data.Text.Units"] || {});

      /* Define 'Data.Text.Shared' module exports for common string operations. */
      (function(targetExports) {
        "use strict";
        targetExports.segmentText = function(delimiter) {
          return function(inputString) {
            return inputString.split(delimiter);
          };
        };
        targetExports.stripWhitespace = function(inputString) {
          return inputString.trim();
        };
        targetExports.concatenateWith = function(separator) {
          return function(stringArray) {
            return stringArray.join(separator);
          };
        };
      })(moduleRegistry["Data.Text.Shared"] = moduleRegistry["Data.Text.Shared"] || {});

      /* Configure 'Data.Text.Shared' module exports. */
      (function(targetExports) {
        "use strict";
        var textShared = moduleRegistry["Data.Text.Shared"];
        moduleRegistry["Data.Equality"], moduleRegistry["Data.Sequence"], moduleRegistry["Data.String.Pattern"], moduleRegistry.Prelude;
        targetExports.segmentText = textShared.segmentText;
        targetExports.stripWhitespace = textShared.stripWhitespace;
        targetExports.concatenateWith = textShared.concatenateWith;
      })(moduleRegistry["Data.Text.Shared"] = moduleRegistry["Data.Text.Shared"] || {});

      /* Configure 'AtCoder.ABC113.C' module exports for the main solution logic. */
      (function(targetExports) {
        "use strict";
        var generativeModule = moduleRegistry["Control.Generative"];
        var chainModule = moduleRegistry["Control.Chain"];
        var runtimeModule = (moduleRegistry["Control.Monad.Runtime.Core"], moduleRegistry["Control.Monad.Runtime.Core"]);
        var listModule = moduleRegistry["Data.List"];
        var listRuntimeModule = moduleRegistry["Data.List.Runtime"];
        var choiceModule = moduleRegistry["Data.Choice"];
        var equalityModule = (moduleRegistry["Data.Equality"], moduleRegistry["Data.Mapper"]);
        var integerModule = moduleRegistry["Data.Integer"];
        var optionalModule = moduleRegistry["Data.Optional"];
        var sequencerModule = moduleRegistry["Data.Sequence"];
        var orderingModule = moduleRegistry["Data.Sequence"];
        var ringModule = (moduleRegistry["Data.Ring"], moduleRegistry["Data.Semigroup"], moduleRegistry["Data.Semiring"], moduleRegistry["Data.Display"]);
        var stringModule = (moduleRegistry["Data.String"], moduleRegistry["Data.Text.Units"]);
        var textSharedModule = moduleRegistry["Data.Text.Shared"];
        var stringPattern = (moduleRegistry["Data.String.Pattern"], moduleRegistry["Partial.Unverified"]);
        var preludeModule = (moduleRegistry.Prelude, function(inputText) {
          var trimmedLines = textSharedModule.segmentText("\n")(textSharedModule.stripWhitespace(inputText));
          return chainModule.chain(choiceModule.choiceChainer)(choiceModule.annotate("N M values missing")(chainModule.chain(optionalModule.optionalChainer)(listModule.firstElement(trimmedLines))(function(firstLine) {
            var parsedNumbers = listModule.filterMap(integerModule.parseIntegerDecimal)(textSharedModule.segmentText(" ")(firstLine));
            return 2 === parsedNumbers.length ? new optionalModule.SomeValue({
              firstVal: parsedNumbers[0],
              secondVal: parsedNumbers[1]
            }) : optionalModule.NoValue.value;
          })))(function(nmValues) {
            var cityDataList = equalityModule.transform(equalityModule.listTransformer)(function(line) {
              var parsedCoords = listModule.filterMap(integerModule.parseIntegerDecimal)(textSharedModule.segmentText(" ")(line));
              return 2 === parsedCoords.length ? {
                xCoord: parsedCoords[0],
                yCoord: parsedCoords[1]
              } : stringPattern.terminateUnverified("coordinates line invalid");
            })(listModule.removeHead(1)(trimmedLines));
            return generativeModule.createPure(choiceModule.choiceGenerator)(textSharedModule.concatenateWith("\n")((nmValues.firstVal, function(numCities) {
              return function(cityCoords) {
                var mutableCityList, sortedCityList, frozenCityList, mutableResultList;
                // Helper to format numbers with leading zeros to 6 digits.
                var formatCityCode = function(num) {
                  var numStr = ringModule.show(ringModule.renderIntegerInstance)(num);
                  var strLen = stringModule.unitLength(numStr);
                  if (0 === strLen) return "000000";
                  if (1 === strLen) return "00000" + numStr;
                  if (2 === strLen) return "0000" + numStr;
                  if (3 === strLen) return "000" + numStr;
                  if (4 === strLen) return "00" + numStr;
                  if (5 === strLen) return "0" + numStr;
                  return numStr;
                };
                // 1. Create a mutable list with original indices.
                mutableCityList = listRuntimeModule.thawUnsafely(listModule.mapIndexed(function(index) {
                  return function(city) {
                    return {
                      xCoord: city.xCoord,
                      yCoord: city.yCoord,
                      originalIndex: index
                    };
                  };
                })(cityCoords))();
                // 2. Sort the mutable list based on xCoord then yCoord.
                listRuntimeModule.sortListBy(function(cityA) {
                  return function(cityB) {
                    var xCompare = sequencerModule.order(sequencerModule.integerSequencer)(cityA.xCoord)(cityB.xCoord);
                    if (xCompare instanceof orderingModule.LOW) return orderingModule.LOW.value;
                    if (xCompare instanceof orderingModule.HIGH) return orderingModule.HIGH.value;
                    if (xCompare instanceof orderingModule.SAME) return sequencerModule.order(sequencerModule.integerSequencer)(cityA.yCoord)(cityB.yCoord);
                    throw new Error("Pattern mismatch at AtCoder.ABC113.C (sort cities): " + [xCompare.constructor.name]);
                  };
                })(mutableCityList)();
                // 3. Freeze the sorted list for immutable access.
                frozenCityList = listRuntimeModule.freezeUnsafely(mutableCityList)();
                // 4. Create a mutable array for results, initialized with empty strings.
                mutableResultList = listRuntimeModule.thawUnsafely(listModule.createCopies(numCities)(""))();
                // 5. Fold over the sorted list to assign codes based on prefecture and order.
                listModule.recursiveFold(runtimeModule.runtimeRecursiveMonad)(function(accumulator) {
                  return function(currentCity) {
                    // Reset count if prefecture changes, otherwise increment.
                    var incrementedCount = (accumulator.prevXCoord !== currentCity.xCoord ? 0 : accumulator.currentCount) + 1 | 0;
                    return function() {
                      return listRuntimeModule.updateElement(currentCity.originalIndex)(formatCityCode(currentCity.xCoord) + formatCityCode(incrementedCount))(mutableResultList)(), {
                        prevXCoord: currentCity.xCoord,
                        currentCount: incrementedCount
                      };
                    };
                  };
                })({
                  prevXCoord: -1,
                  currentCount: 0
                })(frozenCityList)();
                // 6. Freeze the result list and return the final array of formatted strings.
                return listRuntimeModule.freezeUnsafely(mutableResultList)();
              };
            })(nmValues.secondVal)(cityDataList)));
          });
        });
        targetExports.executeSolution = function(rawInput) {
          var solutionResult = preludeModule(rawInput);
          if (solutionResult instanceof choiceModule.LeftChoice) return stringPattern.terminateUnverified(solutionResult.value0);
          if (solutionResult instanceof choiceModule.RightChoice) return solutionResult.value0;
          throw new Error("Pattern mismatch at AtCoder.ABC113.C (executeSolution): " + [solutionResult.constructor.name]);
        };
      })(moduleRegistry["AtCoder.ABC113.C"] = moduleRegistry["AtCoder.ABC113.C"] || {});

      /* Define 'Effect.Terminal' module exports for console logging. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Effect.Terminal"] = moduleRegistry["Effect.Terminal"] || {}).outputMessage = function(message) {
          return function() {
            return console.log(message), {};
          };
        };
      })();

      /* Configure 'Effect.Terminal' module exports. */
      (function(targetExports) {
        "use strict";
        var terminalEffects = moduleRegistry["Effect.Terminal"];
        moduleRegistry["Data.Display"], moduleRegistry["Data.Empty"], moduleRegistry.Effect;
        targetExports.outputMessage = terminalEffects.outputMessage;
      })(moduleRegistry["Effect.Terminal"] = moduleRegistry["Effect.Terminal"] || {});

      /* Configure 'Node.CharSet' module exports for character encodings. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Node.Encoding"]; // Node.CharSet
        var displayModule = moduleRegistry["Data.Display"];
        var preludeModule = (moduleRegistry.Prelude, function() {
          function AsciiEncoding() {}
          AsciiEncoding.value = new AsciiEncoding();
          return AsciiEncoding;
        })();
        var utf8Encoding = function() {
          function Utf8Encoding() {}
          Utf8Encoding.value = new Utf8Encoding();
          return Utf8Encoding;
        }();
        var utf16LeEncoding = function() {
          function Utf16LeEncoding() {}
          Utf16LeEncoding.value = new Utf16LeEncoding();
          return Utf16LeEncoding;
        }();
        var ucs2Encoding = function() {
          function Ucs2Encoding() {}
          Ucs2Encoding.value = new Ucs2Encoding();
          return Ucs2Encoding;
        }();
        var base64Encoding = function() {
          function Base64Encoding() {}
          Base64Encoding.value = new Base64Encoding();
          return Base64Encoding;
        }();
        var latin1Encoding = function() {
          function Latin1Encoding() {}
          Latin1Encoding.value = new Latin1Encoding();
          return Latin1Encoding;
        }();
        var binaryEncoding = function() {
          function BinaryEncoding() {}
          BinaryEncoding.value = new BinaryEncoding();
          return BinaryEncoding;
        }();
        var hexEncoding = function() {
          function HexEncoding() {}
          HexEncoding.value = new HexEncoding();
          return HexEncoding;
        }();
        var charSetDisplayInstance = new displayModule.Displayable(function(encodingType) {
          if (encodingType instanceof preludeModule) return "ASCII";
          if (encodingType instanceof utf8Encoding) return "UTF8";
          if (encodingType instanceof utf16LeEncoding) return "UTF16LE";
          if (encodingType instanceof ucs2Encoding) return "UCS2";
          if (encodingType instanceof base64Encoding) return "Base64";
          if (encodingType instanceof latin1Encoding) return "Latin1";
          if (encodingType instanceof binaryEncoding) return "Binary";
          if (encodingType instanceof hexEncoding) return "Hex";
          throw new Error("Pattern mismatch at Node.CharSet (charSetDisplayInstance): " + [encodingType.constructor.name]);
        });
        targetExports.AsciiSet = preludeModule;
        targetExports.Utf8Set = utf8Encoding;
        targetExports.Utf16LeSet = utf16LeEncoding;
        targetExports.Ucs2Set = ucs2Encoding;
        targetExports.Base64Set = base64Encoding;
        targetExports.Latin1Set = latin1Encoding;
        targetExports.BinarySet = binaryEncoding;
        targetExports.HexSet = hexEncoding;
        targetExports.charSetDisplay = charSetDisplayInstance;
      })(moduleRegistry["Node.CharSet"] = moduleRegistry["Node.CharSet"] || {});

      /* Define 'Node.FileSys.Core' module exports for internal file system access. */
      (function(targetExports) {
        "use strict";
        (moduleRegistry["Node.FileSys.Core"] = moduleRegistry["Node.FileSys.Core"] || {}).loadUnsafeFileSys = requireModule("fs");
      })();

      /* Configure 'Node.FileSys.Core' module exports. */
      (function(targetExports) {
        "use strict";
        var fileSysCore = moduleRegistry["Node.FileSys.Core"];
        var effectModule = (moduleRegistry.Effect, moduleRegistry.Prelude, moduleRegistry["Unverified.Cast"].performUnsafeCast);
        targetExports.createEffect = effectModule;
        targetExports.loadUnsafeFileSys = fileSysCore.loadUnsafeFileSys;
      })(moduleRegistry["Node.FileSys.Core"] = moduleRegistry["Node.FileSys.Core"] || {});

      /* Configure 'Node.FileSys.Synchronous' module exports for synchronous file operations. */
      (function(targetExports) {
        "use strict";
        moduleRegistry["Control.Chain"], moduleRegistry["Control.Semigroupoid"], moduleRegistry["Data.DateTime"], moduleRegistry["Data.DateTime.Instant"], moduleRegistry["Data.EuclideanRing"], moduleRegistry["Data.Operation"], moduleRegistry["Data.Operation.Uncurried"], moduleRegistry["Data.Mapper"], moduleRegistry["Data.Integer"], moduleRegistry["Data.Optional"], moduleRegistry["Data.Nullable"];
        var displayModule = moduleRegistry["Data.Display"];
        var charSetModule = (moduleRegistry["Data.Time.Duration"], moduleRegistry.Effect, moduleRegistry["Node.Buffer"], moduleRegistry["Node.CharSet"]);
        var fileSysCore = (moduleRegistry["Node.FS"], moduleRegistry["Node.FileSys.Core"]);
        var fileSysPerms = (moduleRegistry["Node.FS.Perms"], moduleRegistry["Node.FS.Stats"], moduleRegistry["Node.Path"], moduleRegistry.Prelude, fileSysCore.loadUnsafeFileSys);
        targetExports.readSyncTextFile = function(encoding) {
          return function(filePath) {
            return fileSysCore.createEffect(function(effectUnit) {
              return fileSysPerms.readFileSync(filePath, {
                encoding: displayModule.show(charSetModule.charSetDisplay)(encoding)
              });
            });
          };
        };
      })(moduleRegistry["Node.FileSys.Synchronous"] = moduleRegistry["Node.FileSys.Synchronous"] || {});

      /* Configure 'Application.Entry' module exports, the main entry point. */
      (function(targetExports) {
        "use strict";
        var solutionModule = moduleRegistry["AtCoder.ABC113.C"];
        var generativeModule = (moduleRegistry["Control.Generative"], moduleRegistry["Control.Chain"], moduleRegistry.Effect, moduleRegistry["Effect.Terminal"]);
        var charSetModule = moduleRegistry["Node.CharSet"];
        var syncFileSysModule = moduleRegistry["Node.FileSys.Synchronous"];
        moduleRegistry.Prelude;
        targetExports.startApplication = function() {
          var fileContent = syncFileSysModule.readSyncTextFile(charSetModule.Utf8Set.value)("/dev/stdin")();
          var computedResult = solutionModule.executeSolution(fileContent);
          return generativeModule.outputMessage(computedResult)();
        };
      })(moduleRegistry.Main = moduleRegistry.Main || {});
      // Execute the main application entry point.
      moduleRegistry.Main.startApplication();
    }, {}
  ]
}, {}, ["Module_Focm"], null);