/*
 * This is a customized module loading function, designed to mimic a bundler's behavior.
 * It defines, caches, and retrieves JavaScript modules, handling dependencies and exports.
 */
moduleLoader = function (moduleDefinitions, moduleCache, initialLoaders, globalExportName) {
    // Variable to capture the first error encountered during module initialization.
    var firstErrorOccurred,
        // Stores a reference to an existing global moduleLoader if available, for chaining.
        originalModuleLoader = "function" == typeof moduleLoader && moduleLoader,
        // Stores a reference to Node.js's native `require` function for external modules.
        nodeJsRequire = "function" == typeof require && require;

    /**
     * Core function to retrieve a module by its unique identifier.
     * It checks the cache first, then loads from definitions if not found.
     * @param {string} moduleId - The unique identifier string for the module.
     * @param {boolean} bypassParentCheck - Flag to skip checking parent loaders if true.
     * @returns {object} The exports object of the requested module.
     */
    function retrieveModule(moduleId, bypassParentCheck) {
        // If the module has already been loaded and cached, return its exports immediately.
        if (!moduleCache[moduleId]) {
            // If the module's definition is not found in the provided definitions map.
            if (!moduleDefinitions[moduleId]) {
                // Attempt to load the module using a globally available loader if present.
                var externalModuleLoader = "function" == typeof moduleLoader && moduleLoader;
                if (!bypassParentCheck && externalModuleLoader) return externalModuleLoader(moduleId, true);
                // Fallback to the originalModuleLoader if it exists.
                if (originalModuleLoader) return originalModuleLoader(moduleId, true);
                // Fallback to Node.js's native require for string-based module IDs.
                if (nodeJsRequire && "string" == typeof moduleId) return nodeJsRequire(moduleId);

                // If all attempts to find the module fail, throw a module not found error.
                var moduleNotFoundError = new Error("Cannot locate module '" + moduleId + "'");
                throw moduleNotFoundError.code = "MODULE_NOT_FOUND", moduleNotFoundError;
            }

            // Prepare a resolver function for relative paths within the module being loaded.
            currentModuleResolver.resolve = function (relativePath) {
                return moduleDefinitions[moduleId][1][relativePath] || relativePath;
            };
            // Initialize a fresh cache for dependencies within this module.
            currentModuleResolver.cache = {};

            // Create a new instance of the module and store it in the cache.
            var moduleInstance = moduleCache[moduleId] = new retrieveModule.ModuleInstance(moduleId);
            // Execute the module's definition function, passing necessary context.
            moduleDefinitions[moduleId][0].call(moduleInstance.exportObject, currentModuleResolver, moduleInstance, moduleInstance.exportObject, this);
        }
        // Return the exports object from the cached module instance.
        return moduleCache[moduleId].exportObject;

        /**
         * A lightweight resolver function provided to modules during their execution.
         * It allows modules to request their dependencies.
         * @param {string} requestedPath - The path or ID of the dependency.
         * @returns {object} The exports of the dependent module.
         */
        function currentModuleResolver(requestedPath) {
            return retrieveModule(currentModuleResolver.resolve(requestedPath));
        }
    }

    // Mark this `retrieveModule` function as the primary module loader.
    retrieveModule.isModuleLoader = true;

    /**
     * Constructor for a module instance.
     * @param {string} id - The unique identifier of this module.
     */
    retrieveModule.ModuleInstance = function (id) {
        this.instanceId = id; // Store the module's identifier.
        this.moduleBundle = retrieveModule; // Reference back to the main loader.
        this.exportObject = {}; // The object that will hold the module's exports.
    };

    // Attach core data structures to the `retrieveModule` function for easy access.
    retrieveModule.definedModules = moduleDefinitions; // All module definitions.
    retrieveModule.loadedModuleCache = moduleCache; // The cache of loaded modules.
    retrieveModule.parentLoader = originalModuleLoader; // Reference to any parent loader.
    /**
     * Allows dynamic registration of new module definitions.
     * @param {string} identifier - The ID for the new module.
     * @param {object} moduleContent - The content (exports) of the module.
     */
    retrieveModule.registerModuleDefinition = function (identifier, moduleContent) {
        moduleDefinitions[identifier] = [function (moduleExports, moduleInstance) {
            moduleInstance.exportObject = moduleContent;
        }, {}];
    };

    // Iterate through the list of initial entry points and load each one.
    for (var idx = 0; idx < initialLoaders.length; idx++) {
        try {
            retrieveModule(initialLoaders[idx]);
        } catch (errorDuringLoad) {
            // Capture the very first error that occurs during the loading process.
            firstErrorOccurred || (firstErrorOccurred = errorDuringLoad);
        }
    }

    // If there were any entry points, handle the exports of the last one.
    if (initialLoaders.length) {
        var lastExportedValue = retrieveModule(initialLoaders[initialLoaders.length - 1]);
        // Adapt the export mechanism based on the environment (CommonJS, AMD, or global).
        "object" == typeof exports && "undefined" != typeof module ? module.exports = lastExportedValue : "function" == typeof define && define.amd ? define(function () {
            return lastExportedValue;
        }) : globalExportName && (this[globalExportName] = lastExportedValue);
    }

    // Update the global `moduleLoader` reference to this configured loader instance.
    moduleLoader = retrieveModule;
    // If any error was captured during initialization, re-throw it after setup is complete.
    if (firstErrorOccurred) throw firstErrorOccurred;

    // Return the fully configured module loader function.
    return retrieveModule;
}({
    "AppEntry": [function (requireModule, currentModule, moduleExports) {
        /*
         * This block represents the main application logic, structured into various utility modules.
         * It's the entry point for the competitive programming solver.
         */
        var applicationUtilities = {}; // Central object to hold all utility modules.

        // Module: Flow.Process (Control.Apply)
        !function (targetModule) {
            "use strict";
            // Defines a function to apply a list of functions to a list of arguments.
            (applicationUtilities["Flow.Process"] = applicationUtilities["Flow.Process"] || {}).listApplication = function (functionList) {
                return function (argumentList) {
                    for (var funcCount = functionList.length, argCount = argumentList.length, resultArray = new Array(funcCount * argCount), resultIndex = 0, funcIndex = 0; funcIndex < funcCount; funcIndex++)
                        for (var currentFunc = functionList[funcIndex], argIndex = 0; argIndex < argCount; argIndex++)
                            resultArray[resultIndex++] = currentFunc(argumentList[argIndex]);
                    return resultArray;
                };
            };
        }(applicationUtilities);

        // Module: Flow.Chains (Control.Semigroupoid)
        !function (targetModule) {
            "use strict";
            // Constructor for ChainType, which represents a composition of operations.
            var ChainConstructor = function (composeFunc) {
                this.linkOperations = composeFunc;
            },
                // An instance of ChainType for function composition.
                chainFunctionInstance = new ChainConstructor(function (funcA) {
                    return function (funcB) {
                        return function (inputVal) {
                            return funcA(funcB(inputVal));
                        };
                    };
                });
            targetModule.linkOperations = function (chainObj) {
                return chainObj.linkOperations;
            };
            targetModule.ChainType = ChainConstructor;
            targetModule.chainFunction = chainFunctionInstance;
        }(applicationUtilities["Flow.Chains"] = applicationUtilities["Flow.Chains"] || {});

        // Module: Flow.Identity (Control.Category)
        !function (targetModule) {
            "use strict";
            var ChainsModule = applicationUtilities["Flow.Chains"],
                // Constructor for IdentityType, defining identity and composition.
                IdentityConstructor = function (chainRef, idFunc) {
                    this.ChainType0 = chainRef; // Reference to a Semigroupoid instance.
                    this.idOperation = idFunc; // The identity function.
                },
                // An instance of IdentityType using function composition and the identity function.
                identityFunctionInstance = new IdentityConstructor(function () {
                    return ChainsModule.chainFunction;
                }, function (inputVal) {
                    return inputVal;
                });
            targetModule.IdentityType = IdentityConstructor;
            targetModule.idOperation = function (identityObj) {
                return identityObj.idOperation;
            };
            targetModule.identityFunction = identityFunctionInstance;
        }(applicationUtilities["Flow.Identity"] = applicationUtilities["Flow.Identity"] || {});

        // Module: Data.Equality (Data.Eq)
        !function (targetModule) {
            "use strict";
            // Provides a basic reference equality check.
            (applicationUtilities["Data.Equality"] = applicationUtilities["Data.Equality"] || {}).referenceEquals = function (valA) {
                return function (valB) {
                    return valA === valB;
                };
            };
        }(applicationUtilities);

        // Module: Data.Singleton (Data.Unit)
        !function (targetModule) {
            "use strict";
            // Defines a single, unique value often used to represent "no meaningful data".
            (applicationUtilities["Data.Singleton"] = applicationUtilities["Data.Singleton"] || {}).singletonValue = {};
        }(applicationUtilities);

        // Module: Data.Display (Data.Show)
        !function (targetModule) {
            "use strict";
            // Provides an implementation for displaying integers as strings.
            (applicationUtilities["Data.Display"] = applicationUtilities["Data.Display"] || {}).displayIntegerImplementation = function (numVal) {
                return numVal.toString();
            };
        }(applicationUtilities);

        // Module: Data.Display (Data.Show) - Part 2
        !function (targetModule) {
            "use strict";
            var DisplayModule = applicationUtilities["Data.Display"],
                // Constructor for DisplayType, which encapsulates a display function.
                DisplayConstructor = function (displayFunc) {
                    this.display = displayFunc;
                },
                // An instance of DisplayType specifically for integers.
                displayIntegerInstance = new DisplayConstructor(DisplayModule.displayIntegerImplementation);
            targetModule.DisplayType = DisplayConstructor;
            targetModule.displayValue = function (displayObj) {
                return displayObj.display;
            };
            targetModule.displayInteger = displayIntegerInstance;
        }(applicationUtilities["Data.Display"] = applicationUtilities["Data.Display"] || {});

        // Module: Data.Singleton (Data.Unit) - Part 2
        !function (targetModule) {
            "use strict";
            var SingletonModule = applicationUtilities["Data.Singleton"];
            // Re-exports the singleton value.
            targetModule.singletonValue = SingletonModule.singletonValue;
        }(applicationUtilities["Data.Singleton"] = applicationUtilities["Data.Singleton"] || {});

        // Module: Data.Equality (Data.Eq) - Part 2
        !function (targetModule) {
            "use strict";
            var EqualityModule = applicationUtilities["Data.Equality"],
                // Constructor for EqualityType, encapsulating an equality check function.
                EqualityConstructor = function (equalsFunc) {
                    this.equals = equalsFunc;
                },
                // An instance of EqualityType using reference equality for integers.
                integerEqualityInstance = new EqualityConstructor(EqualityModule.referenceEquals);
            targetModule.EqualityType = EqualityConstructor;
            targetModule.equals = function (equalityObj) {
                return equalityObj.equals;
            };
            targetModule.integerEquality = integerEqualityInstance;
        }(applicationUtilities["Data.Equality"] = applicationUtilities["Data.Equality"] || {});

        // Module: Data.Ordering.Raw (Data.Ord.Unsafe)
        !function (targetModule) {
            "use strict";
            // Provides a raw comparison function that maps comparison results to specific values.
            (applicationUtilities["Data.Ordering.Raw"] = applicationUtilities["Data.Ordering.Raw"] || {}).rawComparisonFunction = function (lessResult) {
                return function (equalResult) {
                    return function (greaterResult) {
                        return function (valX) {
                            return function (valY) {
                                return valX < valY ? lessResult : valX === valY ? equalResult : greaterResult;
                            };
                        };
                    };
                };
            };
        }(applicationUtilities);

        // Module: Data.Concatenation (Data.Semigroup)
        !function (targetModule) {
            "use strict";
            // Constructor for ConcatenationType, defining an append operation.
            targetModule.ConcatenationType = function (concatFunc) {
                this.concatenate = concatFunc;
            };
            targetModule.concatenate = function (concatObj) {
                return concatObj.concatenate;
            };
        }(applicationUtilities["Data.Concatenation"] = applicationUtilities["Data.Concatenation"] || {});

        // Module: Data.ComparisonResult (Data.Ordering)
        !function (targetModule) {
            "use strict";
            // Defines data constructors for comparison results: Less, Greater, Equal.
            var LessThanClass = function () {
                function LessThan() { }
                return LessThan.value = new LessThan, LessThan;
            }(),
                GreaterThanClass = function () {
                    function GreaterThan() { }
                    return GreaterThan.value = new GreaterThan, GreaterThan;
                }(),
                EqualClass = function () {
                    function Equal() { }
                    return Equal.value = new Equal, Equal;
                }();
            targetModule.Less = LessThanClass;
            targetModule.Greater = GreaterThanClass;
            targetModule.Equal = EqualClass;
        }(applicationUtilities["Data.ComparisonResult"] = applicationUtilities["Data.ComparisonResult"] || {});

        // Module: Data.Ordering.Raw (Data.Ord.Unsafe) - Part 2
        !function (targetModule) {
            "use strict";
            var RawOrderingModule = applicationUtilities["Data.Ordering.Raw"],
                ComparisonResultModule = applicationUtilities["Data.ComparisonResult"],
                // An instance of the raw comparison function using the defined comparison result types.
                rawComparisonInstance = RawOrderingModule.rawComparisonFunction(ComparisonResultModule.Less.value)(ComparisonResultModule.Equal.value)(ComparisonResultModule.Greater.value);
            targetModule.rawCompare = rawComparisonInstance;
        }(applicationUtilities["Data.Ordering.Raw"] = applicationUtilities["Data.Ordering.Raw"] || {});

        // Module: Data.Algebra (Data.Semiring)
        !function (targetModule) {
            "use strict";
            // Provides integer addition, coercing results to 32-bit integers.
            targetModule.integerAddition = function (numA) {
                return function (numB) {
                    return numA + numB | 0;
                };
            };
            // Provides integer multiplication, coercing results to 32-bit integers.
            targetModule.integerMultiplication = function (numA) {
                return function (numB) {
                    return numA * numB | 0;
                };
            };
        }(applicationUtilities["Data.Algebra"] = applicationUtilities["Data.Algebra"] || {});

        // Module: Data.Algebra (Data.Semiring) - Part 2
        !function (targetModule) {
            "use strict";
            var AlgebraModule = applicationUtilities["Data.Algebra"],
                // Constructor for AlgebraicType, defining basic algebraic operations and identity elements.
                AlgebraConstructor = function (addFunc, mulFunc, oneVal, zeroVal) {
                    this.performAddition = addFunc;
                    this.performMultiplication = mulFunc;
                    this.algebraicOne = oneVal;
                    this.algebraicZero = zeroVal;
                },
                // An instance of AlgebraicType for integers.
                integerAlgebraInstance = new AlgebraConstructor(AlgebraModule.integerAddition, AlgebraModule.integerMultiplication, 1, 0);
            targetModule.AlgebraicType = AlgebraConstructor;
            targetModule.performAddition = function (algebraObj) {
                return algebraObj.performAddition;
            };
            targetModule.algebraicZero = function (algebraObj) {
                return algebraObj.algebraicZero;
            };
            targetModule.performMultiplication = function (algebraObj) {
                return algebraObj.performMultiplication;
            };
            targetModule.algebraicOne = function (algebraObj) {
                return algebraObj.algebraicOne;
            };
            targetModule.integerAlgebra = integerAlgebraInstance;
        }(applicationUtilities["Data.Algebra"] = applicationUtilities["Data.Algebra"] || {});

        // Module: Data.Ordering (Data.Ord)
        !function (targetModule) {
            "use strict";
            var EqualityModule = applicationUtilities["Data.Equality"],
                RawOrderingModule = applicationUtilities["Data.Ordering.Raw"],
                ComparisonResultModule = applicationUtilities["Data.ComparisonResult"],
                // Constructor for OrderingType, defining equality and comparison.
                OrderingConstructor = function (eqRef, compareFunc) {
                    this.EqualityType0 = eqRef;
                    this.orderElements = compareFunc;
                },
                // An instance of OrderingType for integers.
                integerOrderingInstance = new OrderingConstructor(function () {
                    return EqualityModule.integerEquality;
                }, RawOrderingModule.rawCompare),
                getComparisonFunction = function (orderingObj) {
                    return orderingObj.orderElements;
                };
            targetModule.OrderingType = OrderingConstructor;
            targetModule.orderElements = getComparisonFunction;
            targetModule.minimumElement = function (orderingObj) {
                return function (valA) {
                    return function (valB) {
                        var comparisonResult = getComparisonFunction(orderingObj)(valA)(valB);
                        if (comparisonResult instanceof ComparisonResultModule.Less) return valA;
                        if (comparisonResult instanceof ComparisonResultModule.Equal) return valA;
                        if (comparisonResult instanceof ComparisonResultModule.Greater) return valB;
                        throw new Error("Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [comparisonResult.constructor.name]);
                    };
                };
            };
            targetModule.integerOrdering = integerOrderingInstance;
        }(applicationUtilities["Data.Ordering"] = applicationUtilities["Data.Ordering"] || {});

        // Module: Data.Operation (Data.Function)
        !function (targetModule) {
            "use strict";
            // Defines a function to reverse the order of arguments for a curried function.
            targetModule.reverseArgs = function (func) {
                return function (argB) {
                    return function (argA) {
                        return func(argA)(argB);
                    };
                };
            };
            // Defines a function that always returns a constant value, ignoring its argument.
            targetModule.constantValue = function (val) {
                return function (ignoreVal) {
                    return val;
                };
            };
        }(applicationUtilities["Data.Operation"] = applicationUtilities["Data.Operation"] || {});

        // Module: Data.Mapper (Data.Functor)
        !function (targetModule) {
            "use strict";
            // Provides a map operation for arrays (lists).
            (applicationUtilities["Data.Mapper"] = applicationUtilities["Data.Mapper"] || {}).listMap = function (transformFunc) {
                return function (inputList) {
                    for (var listLen = inputList.length, outputList = new Array(listLen), index = 0; index < listLen; index++)
                        outputList[index] = transformFunc(inputList[index]);
                    return outputList;
                };
            };
        }(applicationUtilities);

        // Module: Data.Mapper (Data.Functor) - Part 2
        !function (targetModule) {
            "use strict";
            var MapperModule = applicationUtilities["Data.Mapper"],
                SingletonModule = applicationUtilities["Data.Singleton"],
                // Constructor for MapperType, encapsulating a map function.
                MapperConstructor = function (mapFunc) {
                    this.applyMap = mapFunc;
                },
                getMapFunction = function (mapperObj) {
                    return mapperObj.applyMap;
                },
                // An instance of MapperType for lists.
                listMapperInstance = new MapperConstructor(MapperModule.listMap);
            targetModule.MapperType = MapperConstructor;
            targetModule.applyMap = getMapFunction;
            // Discards the result of a mapping operation, replacing it with the singleton value.
            targetModule.discardResult = function (mapperObj) {
                return function (inputVal) {
                    return getMapFunction(mapperObj)(applicationUtilities["Data.Operation"].constantValue(SingletonModule.singletonValue))(inputVal);
                };
            };
            targetModule.listMapper = listMapperInstance;
        }(applicationUtilities["Data.Mapper"] = applicationUtilities["Data.Mapper"] || {});

        // Module: Flow.Application (Control.Apply)
        !function (targetModule) {
            "use strict";
            var ProcessModule = applicationUtilities["Flow.Process"],
                IdentityModule = applicationUtilities["Flow.Identity"],
                OperationModule = applicationUtilities["Data.Operation"],
                MapperModule = applicationUtilities["Data.Mapper"],
                // Constructor for ApplicationType, combining Functor and an apply function.
                ApplicationConstructor = function (mapperRef, applyFunc) {
                    this.MapperType0 = mapperRef;
                    this.applyFunction = applyFunc;
                },
                // An instance of ApplicationType for lists.
                listApplicationInstance = new ApplicationConstructor(function () {
                    return MapperModule.listMapper;
                }, ProcessModule.listApplication),
                getApplyFunction = function (applicationObj) {
                    return applicationObj.applyFunction;
                };
            targetModule.ApplicationType = ApplicationConstructor;
            targetModule.applyFunction = getApplyFunction;
            // Applies a function (wrapped in a functor) to a value (wrapped in a functor), discarding the result of the first functor.
            targetModule.applyThenDiscard = function (applicationObj) {
                return function (valueProducer) {
                    return function (valueConsumer) {
                        return getApplyFunction(applicationObj)(MapperModule.applyMap(applicationObj.MapperType0())(OperationModule.constantValue(IdentityModule.idOperation(IdentityModule.identityFunction)))(valueProducer))(valueConsumer);
                    };
                };
            };
            targetModule.listApplicationInstance = listApplicationInstance;
        }(applicationUtilities["Flow.Application"] = applicationUtilities["Flow.Application"] || {});

        // Module: Flow.Constructive (Control.Applicative)
        !function (targetModule) {
            "use strict";
            var ApplicationModule = applicationUtilities["Flow.Application"],
                getConstructFunction = function (constructiveObj) {
                    return constructiveObj.constructValue;
                };
            // Constructor for ConstructiveType, combining Apply and a pure constructor function.
            targetModule.ConstructiveType = function (applyRef, pureFunc) {
                this.ApplicationType0 = applyRef;
                this.constructValue = pureFunc;
            };
            targetModule.constructValue = getConstructFunction;
            // Lifts a normal function into an applicative context.
            targetModule.liftApplication = function (constructiveObj) {
                return function (transformFunc) {
                    return function (wrappedVal) {
                        return ApplicationModule.applyFunction(constructiveObj.ApplicationType0())(getConstructFunction(constructiveObj)(transformFunc))(wrappedVal);
                    };
                };
            };
            // Conditionally executes an action, returning a pure unit if the condition is false.
            targetModule.conditionalExecution = function (constructiveObj) {
                return function (condition) {
                    return function (action) {
                        if (condition) return action;
                        if (!condition) return getConstructFunction(constructiveObj)(applicationUtilities["Data.Singleton"].singletonValue);
                        throw new Error("Failed pattern match at Control.Applicative (line 57, column 1 - line 57, column 63): " + [condition.constructor.name, action.constructor.name]);
                    };
                };
            };
        }(applicationUtilities["Flow.Constructive"] = applicationUtilities["Flow.Constructive"] || {});

        // Module: Flow.Sequencing (Control.Bind)
        !function (targetModule) {
            "use strict";
            // Provides a bind (flatMap) operation for arrays (lists).
            (applicationUtilities["Flow.Sequencing"] = applicationUtilities["Flow.Sequencing"] || {}).listSequencing = function (inputList) {
                return function (transformFunc) {
                    for (var resultList = [], index = 0, listLen = inputList.length; index < listLen; index++)
                        Array.prototype.push.apply(resultList, transformFunc(inputList[index]));
                    return resultList;
                };
            };
        }(applicationUtilities);

        // Module: Flow.Sequencing (Control.Bind) - Part 2
        !function (targetModule) {
            "use strict";
            var SequencingModule = applicationUtilities["Flow.Sequencing"],
                // Constructor for SequencingType, combining Apply and a bind function.
                SequencingConstructor = function (applyRef, bindFunc) {
                    this.ApplicationType0 = applyRef;
                    this.sequenceOperations = bindFunc;
                },
                // An instance of SequencingType for lists.
                listSequencingInstance = new SequencingConstructor(function () {
                    return applicationUtilities["Flow.Application"].listApplicationInstance;
                }, SequencingModule.listSequencing),
                getSequenceFunction = function (sequencingObj) {
                    return sequencingObj.sequenceOperations;
                },
                // A version of bind where the arguments are flipped.
                sequenceFlippedFunction = function (sequencingObj) {
                    return applicationUtilities["Data.Operation"].reverseArgs(getSequenceFunction(sequencingObj));
                };
            targetModule.SequencingType = SequencingConstructor;
            targetModule.sequenceOperations = getSequenceFunction;
            targetModule.sequenceFlipped = sequenceFlippedFunction;
            // Composes two Kleisli arrows (functions returning a monadic value) with flipped arguments.
            targetModule.composeKleisliFlippedOperations = function (sequencingObj) {
                return function (funcA) {
                    return function (funcB) {
                        return function (inputVal) {
                            return sequenceFlippedFunction(sequencingObj)(funcA)(funcB(inputVal));
                        };
                    };
                };
            };
            targetModule.listSequencingInstance = listSequencingInstance;
        }(applicationUtilities["Flow.Sequencing"] = applicationUtilities["Flow.Sequencing"] || {});

        // Module: Flow.Stateful.Internal (Control.Monad.ST.Internal)
        !function (targetModule) {
            "use strict";
            // Maps a transformation function over a stateful action.
            targetModule.mapState = function (transformFunc) {
                return function (statefulAction) {
                    return function () {
                        return transformFunc(statefulAction());
                    };
                };
            };
            // Lifts a pure value into a stateful action.
            targetModule.pureState = function (value) {
                return function () {
                    return value;
                };
            };
            // Sequences two stateful actions, passing the result of the first to the second.
            targetModule.bindState = function (statefulActionA) {
                return function (statefulActionB) {
                    return function () {
                        return statefulActionB(statefulActionA())();
                    };
                };
            };
            // Iterates a loop body for a range of integer values.
            targetModule.iterateRange = function (startVal) {
                return function (endVal) {
                    return function (loopBody) {
                        return function () {
                            for (var currentVal = startVal; currentVal < endVal; currentVal++)
                                loopBody(currentVal)();
                        };
                    };
                };
            };
            // Modifies a mutable state reference using a given modifier function.
            targetModule.modifyState = function (modifierFunc) {
                return function (stateRef) {
                    return function () {
                        var modifiedResult = modifierFunc(stateRef.value);
                        return stateRef.value = modifiedResult.state, modifiedResult.value;
                    };
                };
            };
        }(applicationUtilities["Flow.Stateful.Internal"] = applicationUtilities["Flow.Stateful.Internal"] || {});

        // Module: Control.Monad (Flow.Monadic)
        !function (targetModule) {
            "use strict";
            var ConstructiveModule = applicationUtilities["Flow.Constructive"],
                // Constructor for MonadicType, combining Applicative and Bind.
                MonadConstructor = function (applicativeRef, bindRef) {
                    this.ConstructiveType0 = applicativeRef;
                    this.SequencingType1 = bindRef;
                };
            targetModule.MonadicType = MonadConstructor;
            // Applies a monadic function to a monadic value.
            targetModule.applyMonadic = function (monadObj) {
                return function (wrappedFunc) {
                    return function (wrappedVal) {
                        return applicationUtilities["Flow.Sequencing"].sequenceOperations(monadObj.SequencingType1())(wrappedFunc)(function (func) {
                            return applicationUtilities["Flow.Sequencing"].sequenceOperations(monadObj.SequencingType1())(wrappedVal)(function (val) {
                                return ConstructiveModule.constructValue(monadObj.ConstructiveType0())(func(val));
                            });
                        });
                    };
                };
            };
        }(applicationUtilities["Control.Monad"] = applicationUtilities["Control.Monad"] || {});

        // Module: Partial.Critical (Partial.Unsafe)
        !function (targetModule) {
            "use strict";
            // Executes a partial function, asserting its safety.
            (applicationUtilities["Partial.Critical"] = applicationUtilities["Partial.Critical"] || {}).criticalPartial = function (action) {
                return action();
            };
        }(applicationUtilities);

        // Module: Partial.Operations (Partial)
        !function (targetModule) {
            "use strict";
            // Provides a function to terminate execution with an error message.
            (applicationUtilities["Partial.Operations"] = applicationUtilities["Partial.Operations"] || {}).terminateWithError = function () {
                return function (errorMessage) {
                    throw new Error(errorMessage);
                };
            };
        }(applicationUtilities);

        // Module: Partial.Operations (Partial) - Part 2
        !function (targetModule) {
            "use strict";
            var PartialModule = applicationUtilities["Partial.Operations"];
            targetModule.terminateWithError = PartialModule.terminateWithError;
        }(applicationUtilities.Partial = applicationUtilities.Partial || {});

        // Module: Partial.Critical (Partial.Unsafe) - Part 2
        !function (targetModule) {
            "use strict";
            var CriticalModule = applicationUtilities["Partial.Critical"],
                PartialOpsModule = applicationUtilities.Partial;
            // A critically unsafe function to terminate execution with an error.
            targetModule.criticalTerminateWithError = function (errorMessage) {
                return CriticalModule.criticalPartial(function (dummy) {
                    return PartialOpsModule.terminateWithError(dummy)(errorMessage);
                });
            };
        }(applicationUtilities["Partial.Critical"] = applicationUtilities["Partial.Critical"] || {});

        // Module: Flow.Stateful.Internal (Control.Monad.ST.Internal) - Part 2
        !function (targetModule) {
            "use strict";
            var StatefulInternalModule = applicationUtilities["Flow.Stateful.Internal"],
                ConstructiveModule = applicationUtilities["Flow.Constructive"],
                ApplicationModule = applicationUtilities["Flow.Application"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                MonadModule = applicationUtilities["Control.Monad"],
                // Instances of Functor, Apply, Applicative, Bind, Monad for stateful computations.
                statefulMapperInstance = new applicationUtilities["Data.Mapper"].MapperType(StatefulInternalModule.mapState),
                statefulMonadInstance = new MonadModule.MonadicType(function () {
                    return statefulConstructiveInstance;
                }, function () {
                    return statefulSequencingInstance;
                }),
                statefulSequencingInstance = new SequencingModule.SequencingType(function () {
                    return statefulApplicationInstance;
                }, StatefulInternalModule.bindState),
                statefulApplicationInstance = new ApplicationModule.ApplicationType(function () {
                    return statefulMapperInstance;
                }, MonadModule.applyMonadic(statefulMonadInstance)),
                statefulConstructiveInstance = new ConstructiveModule.ConstructiveType(function () {
                    return statefulApplicationInstance;
                }, StatefulInternalModule.pureState);
            // Provides a safe way to update state using a modifier function.
            targetModule.updateState = function (modifierFunc) {
                return StatefulInternalModule.modifyState(function (currentVal) {
                    var modifiedVal = modifierFunc(currentVal);
                    return {
                        state: modifiedVal,
                        value: modifiedVal
                    };
                });
            };
            targetModule.statefulMapper = statefulMapperInstance;
            targetModule.statefulApplication = statefulApplicationInstance;
            targetModule.statefulConstructive = statefulConstructiveInstance;
            targetModule.statefulSequencing = statefulSequencingInstance;
            targetModule.statefulMonad = statefulMonadInstance;
            targetModule.iterateRange = StatefulInternalModule.iterateRange;
        }(applicationUtilities["Flow.Stateful.Internal"] = applicationUtilities["Flow.Stateful.Internal"] || {});

        // Module: Data.List (Data.Array)
        !function (targetModule) {
            "use strict";
            // Returns the length of a given list.
            targetModule.listLength = function (inputList) {
                return inputList.length;
            };
            // Splits a list into its head (first element) and tail (rest of the list).
            targetModule.splitHeadTail = function (emptyCase) {
                return function (nonEmptyCase) {
                    return function (inputList) {
                        return 0 === inputList.length ? emptyCase({}) : nonEmptyCase(inputList[0])(inputList.slice(1));
                    };
                };
            };
            // Extracts a sub-list (slice) from a given list.
            targetModule.subList = function (startIndex) {
                return function (endIndex) {
                    return function (inputList) {
                        return inputList.slice(startIndex, endIndex);
                    };
                };
            };
        }(applicationUtilities["Data.List"] = applicationUtilities["Data.List"] || {});

        // Module: Data.Traversable (Data.Foldable)
        !function (targetModule) {
            "use strict";
            // Folds a list from right to left using a combining function and an initial value.
            targetModule.foldRightList = function (combineFunc) {
                return function (initialVal) {
                    return function (inputList) {
                        for (var currentVal = initialVal, idx = inputList.length - 1; idx >= 0; idx--)
                            currentVal = combineFunc(inputList[idx])(currentVal);
                        return currentVal;
                    };
                };
            };
            // Folds a list from left to right using a combining function and an initial value.
            targetModule.foldLeftList = function (combineFunc) {
                return function (initialVal) {
                    return function (inputList) {
                        for (var currentVal = initialVal, listLen = inputList.length, idx = 0; idx < listLen; idx++)
                            currentVal = combineFunc(currentVal)(inputList[idx]);
                        return currentVal;
                    };
                };
            };
        }(applicationUtilities["Data.Traversable"] = applicationUtilities["Data.Traversable"] || {});

        // Module: Data.Range (Data.Bounded)
        !function (targetModule) {
            "use strict";
            // Defines the maximum and minimum values for a 32-bit signed integer.
            targetModule.maxInteger = 2147483647;
            targetModule.minInteger = -2147483648;
        }(applicationUtilities["Data.Range"] = applicationUtilities["Data.Range"] || {});

        // Module: Data.Range (Data.Bounded) - Part 2
        !function (targetModule) {
            "use strict";
            var RangeModule = applicationUtilities["Data.Range"],
                OrderingModule = applicationUtilities["Data.Ordering"],
                // Constructor for RangeType, defining an ordering and bounds.
                RangeConstructor = function (ordRef, bottomVal, topVal) {
                    this.OrderingType0 = ordRef;
                    this.getMin = bottomVal;
                    this.getMax = topVal;
                },
                // An instance of RangeType for integers.
                integerRangeInstance = new RangeConstructor(function () {
                    return OrderingModule.integerOrdering;
                }, RangeModule.minInteger, RangeModule.maxInteger);
            targetModule.RangeType = RangeConstructor;
            targetModule.getMin = function (rangeObj) {
                return rangeObj.getMin;
            };
            targetModule.getMax = function (rangeObj) {
                return rangeObj.getMax;
            };
            targetModule.integerRange = integerRangeInstance;
        }(applicationUtilities["Data.Range"] = applicationUtilities["Data.Range"] || {});

        // Module: Data.Aggregator (Data.Monoid)
        !function (targetModule) {
            "use strict";
            // Constructor for AggregatorType, combining a Semigroup and an empty value.
            targetModule.AggregatorType = function (semigroupRef, emptyVal) {
                this.ConcatenationType0 = semigroupRef;
                this.emptyAggregate = emptyVal;
            };
            targetModule.emptyAggregate = function (aggregatorObj) {
                return aggregatorObj.emptyAggregate;
            };
        }(applicationUtilities["Data.Aggregator"] = applicationUtilities["Data.Aggregator"] || {});

        // Module: Data.Optional (Data.Maybe)
        !function (targetModule) {
            "use strict";
            // Data constructors for Optional values: NoValue (nothing) and SomeValue (something).
            var NoValueClass = function () {
                function NoValue() { }
                return NoValue.value = new NoValue, NoValue;
            }(),
                SomeValueClass = function () {
                    function SomeValue(val) {
                        this.valueOne = val;
                    }
                    return SomeValue.create = function (val) {
                        return new SomeValue(val);
                    }, SomeValue;
                }();
            targetModule.NoValue = NoValueClass;
            targetModule.SomeValue = SomeValueClass;
            // Handles an Optional value by applying one function if it's NoValue, another if it's SomeValue.
            targetModule.handleOptional = function (noCase) {
                return function (someCase) {
                    return function (optionalVal) {
                        if (optionalVal instanceof NoValueClass) return noCase;
                        if (optionalVal instanceof SomeValueClass) return someCase(optionalVal.valueOne);
                        throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [noCase.constructor.name, someCase.constructor.name, optionalVal.constructor.name]);
                    };
                };
            };
        }(applicationUtilities["Data.Optional"] = applicationUtilities["Data.Optional"] || {});

        // Module: Data.Traversable (Data.Foldable) - Part 2
        !function (targetModule) {
            "use strict";
            var TraversableModule = applicationUtilities["Data.Traversable"],
                // Constructor for TraversableType, defining fold operations.
                TraversableConstructor = function (foldMapFunc, foldlFunc, foldrFunc) {
                    this.traverseMap = foldMapFunc;
                    this.traverseLeft = foldlFunc;
                    this.traverseRight = foldrFunc;
                },
                getTraverseRightFunction = function (traversableObj) {
                    return traversableObj.traverseRight;
                },
                // Default implementation for foldMap using foldr.
                defaultTraverseMapRightFunction = function (traversableObj) {
                    return function (semigroupObj) {
                        return function (transformFunc) {
                            return getTraverseRightFunction(traversableObj)(function (element) {
                                return function (accumulator) {
                                    return applicationUtilities["Data.Concatenation"].concatenate(semigroupObj.ConcatenationType0())(transformFunc(element))(accumulator);
                                };
                            })(applicationUtilities["Data.Aggregator"].emptyAggregate(semigroupObj));
                        };
                    };
                },
                // An instance of TraversableType for lists.
                listTraversableInstance = new TraversableConstructor(function (aggregatorObj) {
                    return defaultTraverseMapRightFunction(listTraversableInstance)(aggregatorObj);
                }, TraversableModule.foldLeftList, TraversableModule.foldRightList);
            targetModule.TraversableType = TraversableConstructor;
            targetModule.traverseRight = getTraverseRightFunction;
            targetModule.traverseLeft = function (traversableObj) {
                return traversableObj.traverseLeft;
            };
            targetModule.traverseMap = function (traversableObj) {
                return traversableObj.traverseMap;
            };
            targetModule.defaultTraverseMapRight = defaultTraverseMapRightFunction;
            // Traverses a structure with an applicative action, discarding the results.
            targetModule.traverseAndDiscard = function (applicativeObj) {
                return function (traversableObj) {
                    return function (actionFunc) {
                        return getTraverseRightFunction(traversableObj)(function (element) {
                            return function (accumulator) {
                                return applicationUtilities["Flow.Application"].applyThenDiscard(applicativeObj.ApplicationType0())(actionFunc(element))(applicationUtilities["Flow.Constructive"].constructValue(applicativeObj)(applicationUtilities["Data.Singleton"].singletonValue));
                            };
                        })(applicationUtilities["Flow.Constructive"].constructValue(applicativeObj)(applicationUtilities["Data.Singleton"].singletonValue));
                    };
                };
            };
            targetModule.listTraversable = listTraversableInstance;
        }(applicationUtilities["Data.Traversable"] = applicationUtilities["Data.Traversable"] || {});

        // Module: Data.Pair (Data.Tuple)
        !function (targetModule) {
            "use strict";
            // Constructor for PairType, representing an ordered pair of two values.
            var PairConstructor = function () {
                function Pair(valA, valB) {
                    this.valueOne = valA;
                    this.valueTwo = valB;
                }
                return Pair.create = function (val) {
                    return function (valB) {
                        return new Pair(val, valB);
                    };
                }, Pair;
            }();
            targetModule.PairType = PairConstructor;
        }(applicationUtilities["Data.Pair"] = applicationUtilities["Data.Pair"] || {});

        // Module: Raw.Cast (Unsafe.Coerce)
        !function (targetModule) {
            "use strict";
            // An unsafe identity function used for type casting.
            (applicationUtilities["Raw.Cast"] = applicationUtilities["Raw.Cast"] || {}).rawCast = function (val) {
                return val;
            };
        }(applicationUtilities);

        // Module: Raw.Cast (Unsafe.Coerce) - Part 2
        !function (targetModule) {
            "use strict";
            var CastModule = applicationUtilities["Raw.Cast"];
            targetModule.rawCast = CastModule.rawCast;
        }(applicationUtilities["Raw.Cast"] = applicationUtilities["Raw.Cast"] || {});

        // Module: Data.List (Data.Array) - Part 2
        !function (targetModule) {
            "use strict";
            var ListModule = applicationUtilities["Data.List"],
                OptionalModule = applicationUtilities["Data.Optional"],
                // Splits a list into its head and tail, returning an Optional value.
                getHeadTailInstance = ListModule.splitHeadTail(applicationUtilities["Data.Operation"].constantValue(OptionalModule.NoValue.value))(function (headVal) {
                    return function (tailList) {
                        return new OptionalModule.SomeValue({
                            head: headVal,
                            tail: tailList
                        });
                    };
                }),
                // Creates a list containing a single element.
                createSingleElementListFunction = function (element) {
                    return [element];
                },
                // Maps a function over a list and flattens the resulting lists.
                flattenMapFunction = applicationUtilities["Data.Operation"].reverseArgs(applicationUtilities["Flow.Sequencing"].sequenceOperations(applicationUtilities["Flow.Sequencing"].listSequencingInstance));
            targetModule.createSingleElementList = createSingleElementListFunction;
            targetModule.getHeadTail = getHeadTailInstance;
            targetModule.flattenMap = flattenMapFunction;
            // Maps a function that returns an Optional value over a list, filtering out NoValues.
            targetModule.filterMap = function (transformFunc) {
                return flattenMapFunction(function (element) {
                    return OptionalModule.handleOptional([])(createSingleElementListFunction)(transformFunc(element));
                });
            };
        }(applicationUtilities["Data.List"] = applicationUtilities["Data.List"] || {});

        // Module: Data.Choice (Data.Either)
        !function (targetModule) {
            "use strict";
            var ConstructiveModule = applicationUtilities["Flow.Constructive"],
                ApplicationModule = applicationUtilities["Flow.Application"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                OptionalModule = applicationUtilities["Data.Optional"],
                // Data constructors for Choice values: ChoiceLeft (error/failure) and ChoiceRight (success).
                ChoiceLeftClass = function () {
                    function ChoiceLeft(val) {
                        this.valueOne = val;
                    }
                    return ChoiceLeft.create = function (val) {
                        return new ChoiceLeft(val);
                    }, ChoiceLeft;
                }(),
                ChoiceRightClass = function () {
                    function ChoiceRight(val) {
                        this.valueOne = val;
                    }
                    return ChoiceRight.create = function (val) {
                        return new ChoiceRight(val);
                    }, ChoiceRight;
                }(),
                // An instance of MapperType for Choice values.
                choiceMapperInstance = new applicationUtilities["Data.Mapper"].MapperType(function (transformFunc) {
                    return function (choiceVal) {
                        if (choiceVal instanceof ChoiceLeftClass) return new ChoiceLeftClass(choiceVal.valueOne);
                        if (choiceVal instanceof ChoiceRightClass) return new ChoiceRightClass(transformFunc(choiceVal.valueOne));
                        throw new Error("Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [choiceVal.constructor.name]);
                    };
                }),
                // Handles a Choice value by applying one function if it's ChoiceLeft, another if it's ChoiceRight.
                handleChoiceFunction = function (leftHandler) {
                    return function (rightHandler) {
                        return function (choiceVal) {
                            if (choiceVal instanceof ChoiceLeftClass) return leftHandler(choiceVal.valueOne);
                            if (choiceVal instanceof ChoiceRightClass) return rightHandler(choiceVal.valueOne);
                            throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [leftHandler.constructor.name, rightHandler.constructor.name, choiceVal.constructor.name]);
                        };
                    };
                },
                // Instances of Apply, Bind, Applicative for Choice values.
                choiceApplicationInstance = new ApplicationModule.ApplicationType(function () {
                    return choiceMapperInstance;
                }, function (choiceFunc) {
                    return function (choiceVal) {
                        if (choiceFunc instanceof ChoiceLeftClass) return new ChoiceLeftClass(choiceFunc.valueOne);
                        if (choiceFunc instanceof ChoiceRightClass) return applicationUtilities["Data.Mapper"].applyMap(choiceMapperInstance)(choiceFunc.valueOne)(choiceVal);
                        throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [choiceFunc.constructor.name, choiceVal.constructor.name]);
                    };
                }),
                choiceSequencingInstance = new SequencingModule.SequencingType(function () {
                    return choiceApplicationInstance;
                }, handleChoiceFunction(function (leftVal) {
                    return function (transformFunc) {
                        return new ChoiceLeftClass(leftVal);
                    };
                })(function (rightVal) {
                    return function (transformFunc) {
                        return transformFunc(rightVal);
                    };
                })),
                choiceConstructiveInstance = new ConstructiveModule.ConstructiveType(function () {
                    return choiceApplicationInstance;
                }, ChoiceRightClass.create);
            targetModule.ChoiceLeft = ChoiceLeftClass;
            targetModule.ChoiceRight = ChoiceRightClass;
            targetModule.handleChoice = handleChoiceFunction;
            // Converts an Optional value into a Choice value, using a default for NoValue.
            targetModule.noteChoice = function (leftVal) {
                return OptionalModule.handleOptional(new ChoiceLeftClass(leftVal))(ChoiceRightClass.create);
            };
            targetModule.choiceMapper = choiceMapperInstance;
            targetModule.choiceApplication = choiceApplicationInstance;
            targetModule.choiceConstructive = choiceConstructiveInstance;
            targetModule.choiceSequencing = choiceSequencingInstance;
        }(applicationUtilities["Data.Choice"] = applicationUtilities["Data.Choice"] || {});

        // Module: Data.Numeric (Data.Int)
        !function (targetModule) {
            "use strict";
            // Parses a string into an integer with a specified radix.
            targetModule.parseStringAsRadixImplementation = function (successFunc) {
                return function (failVal) {
                    return function (radix) {
                        var regexPattern;
                        regexPattern = radix < 11 ? "[0-" + (radix - 1).toString() + "]" : 11 === radix ? "[0-9a]" : "[0-9a-" + String.fromCharCode(86 + radix) + "]";
                        var fullRegex = new RegExp("^[\\+\\-]?" + regexPattern + "+$", "i");
                        return function (inputString) {
                            if (fullRegex.test(inputString)) {
                                var parsedInt = parseInt(inputString, radix);
                                return (0 | parsedInt) === parsedInt ? successFunc(parsedInt) : failVal;
                            }
                            return failVal;
                        };
                    };
                };
            };
            // Calculates the power of a base to an exponent, coercing to integer.
            targetModule.power = function (base) {
                return function (exponent) {
                    return 0 | Math.pow(base, exponent);
                };
            };
        }(applicationUtilities["Data.Numeric"] = applicationUtilities["Data.Numeric"] || {});

        // Module: Data.Numeric (Data.Int) - Part 2
        !function (targetModule) {
            "use strict";
            var NumericModule = applicationUtilities["Data.Numeric"],
                // Creates a function to parse strings to integers, returning Optional values.
                parseStringWithRadixFunction = NumericModule.parseStringAsRadixImplementation(applicationUtilities["Data.Optional"].SomeValue.create)(applicationUtilities["Data.Optional"].NoValue.value),
                // A specialized function to parse base-10 integers.
                parseStringBase10 = parseStringWithRadixFunction(10);
            targetModule.parseString = parseStringBase10;
            targetModule.parseStringWithRadix = parseStringWithRadixFunction;
            targetModule.power = NumericModule.power;
        }(applicationUtilities["Data.Numeric"] = applicationUtilities["Data.Numeric"] || {});

        // Module: Data.Text.Utility (Data.String.Common)
        !function (targetModule) {
            "use strict";
            // Splits a text string by a given separator.
            targetModule.segmentText = function (separator) {
                return function (inputText) {
                    return inputText.split(separator);
                };
            };
            // Removes leading and trailing whitespace from a text string.
            targetModule.stripWhitespace = function (inputText) {
                return inputText.trim();
            };
        }(applicationUtilities["Data.Text.Utility"] = applicationUtilities["Data.Text.Utility"] || {});

        // Module: Data.Text.Utility (Data.String.Common) - Part 2
        !function (targetModule) {
            "use strict";
            var TextUtilityModule = applicationUtilities["Data.Text.Utility"];
            targetModule.segmentText = TextUtilityModule.segmentText;
            targetModule.stripWhitespace = TextUtilityModule.stripWhitespace;
        }(applicationUtilities["Data.Text.Utility"] = applicationUtilities["Data.Text.Utility"] || {});

        // Module: Operation (Effect)
        !function (targetModule) {
            "use strict";
            // Lifts a pure value into an effectful operation.
            targetModule.pureOperation = function (value) {
                return function () {
                    return value;
                };
            };
            // Sequences two effectful operations.
            targetModule.bindOperation = function (actionA) {
                return function (actionB) {
                    return function () {
                        return actionB(actionA())();
                    };
                };
            };
        }(applicationUtilities.Operation = applicationUtilities.Operation || {});

        // Module: Operation (Effect) - Part 2
        !function (targetModule) {
            "use strict";
            var OperationModule = applicationUtilities.Operation,
                ConstructiveModule = applicationUtilities["Flow.Constructive"],
                ApplicationModule = applicationUtilities["Flow.Application"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                MonadModule = applicationUtilities["Control.Monad"],
                // Instances of Monad, Bind, Apply, Applicative, Functor for effectful operations.
                operationMonadInstance = new MonadModule.MonadicType(function () {
                    return operationConstructiveInstance;
                }, function () {
                    return operationSequencingInstance;
                }),
                operationSequencingInstance = new SequencingModule.SequencingType(function () {
                    return operationApplicationInstance;
                }, OperationModule.bindOperation),
                operationApplicationInstance = new ApplicationModule.ApplicationType(function () {
                    return operationMapperInstance;
                }, MonadModule.applyMonadic(operationMonadInstance)),
                operationConstructiveInstance = new ConstructiveModule.ConstructiveType(function () {
                    return operationApplicationInstance;
                }, OperationModule.pureOperation),
                operationMapperInstance = new applicationUtilities["Data.Mapper"].MapperType(ConstructiveModule.liftApplication(operationConstructiveInstance));
            targetModule.operationMapper = operationMapperInstance;
            targetModule.operationApplication = operationApplicationInstance;
            targetModule.operationConstructive = operationConstructiveInstance;
            targetModule.operationSequencing = operationSequencingInstance;
            targetModule.operationMonad = operationMonadInstance;
        }(applicationUtilities.Operation = applicationUtilities.Operation || {});

        // Module: Operation.Asynchronous (Effect.Aff)
        !function (targetModule) {
            "use strict";
            // Internal definitions and constructors for asynchronous operations (Aff).
            var asyncOpTypes = function () {
                var nodeTags = {}, // Placeholder for node tags
                    PureTag = "Pure",
                    ThrowTag = "Throw",
                    CatchTag = "Catch",
                    SyncTag = "Sync",
                    AsyncTag = "Async",
                    BindTag = "Bind",
                    BracketTag = "Bracket",
                    ForkTag = "Fork",
                    SequentialTag = "Sequential",
                    MapTag = "Map",
                    ApplyTag = "Apply",
                    AltTag = "Alt",
                    ConsTag = "Cons",
                    ResumeTag = "Resume",
                    ReleaseTag = "Release",
                    FinalizerTag = "Finalizer",
                    FinalizedTag = "Finalized",
                    ForkedTag = "Forked";

                // Constructor for an asynchronous operation node.
                function AsyncNode(tag, val1, val2, val3) {
                    this.nodeTag = tag;
                    this.valueOne = val1;
                    this.valueTwo = val2;
                    this.valueThree = val3;
                }

                // Helper to create specific tagged constructors for AsyncNode.
                function createTaggedConstructor(tag) {
                    var constructorFunc = function (v1, v2, v3) {
                        return new AsyncNode(tag, v1, v2, v3);
                    };
                    return constructorFunc.nodeTag = tag, constructorFunc;
                }

                // Creates a Pure AsyncNode, representing an immediate value.
                function createPureNode(val) {
                    return new AsyncNode(PureTag, void 0);
                }

                // Handles and logs unhandled exceptions asynchronously.
                function handleUnhandledException(action) {
                    try {
                        action();
                    } catch (err) {
                        setTimeout(function () {
                            throw err;
                        }, 0);
                    }
                }

                // Executes a synchronous operation, catching any immediate errors.
                function executeSyncOperation(errorHandler, successHandler, operation) {
                    try {
                        return successHandler(operation());
                    } catch (err) {
                        return errorHandler(err);
                    }
                }

                // Executes an asynchronous callback, handling potential errors in the setup.
                function executeAsyncCallback(errorHandler, asyncFunc, callback) {
                    try {
                        return asyncFunc(callback());
                    } catch (err) {
                        return callback(errorHandler(err))(), createPureNode;
                    }
                }

                // A task scheduler for managing asynchronous execution.
                var taskScheduler = function () {
                    var bufferCapacity = 1024,
                        currentSize = 0,
                        readIndex = 0,
                        taskBuffer = new Array(bufferCapacity),
                        isDrainingTasks = false;

                    function drainTasks() {
                        var taskToExecute;
                        for (isDrainingTasks = true; 0 !== currentSize;)
                            currentSize--, taskToExecute = taskBuffer[readIndex], taskBuffer[readIndex] = void 0, readIndex = (readIndex + 1) % bufferCapacity, taskToExecute();
                        isDrainingTasks = false;
                    }
                    return {
                        isDraining: function () {
                            return isDrainingTasks;
                        },
                        enqueue: function (task) {
                            var prevDrainingState;
                            currentSize === bufferCapacity && (prevDrainingState = isDrainingTasks, drainTasks(), isDrainingTasks = prevDrainingState),
                                taskBuffer[(readIndex + currentSize) % bufferCapacity] = task,
                                currentSize++,
                                isDrainingTasks || drainTasks();
                        }
                    };
                }();

                // States for the fiber executor.
                var InitialState = 0,
                    RunningState = 1,
                    ResumingState = 2,
                    ProcessingResultState = 3,
                    AsyncWaitingState = 4,
                    ErrorHandlingState = 5,
                    FinalState = 6;

                /**
                 * Executes a single asynchronous computation (fiber).
                 * Manages its state, error handling, and resource finalization.
                 * @param {object} eitherModule - Utilities for Either type.
                 * @param {object} supervisor - The fiber supervisor.
                 * @param {AsyncNode} initialNode - The root node of the computation tree.
                 * @returns {object} An object with methods to control the fiber.
                 */
                function fiberExecutor(eitherModule, supervisor, initialNode) {
                    var executionCounter = 0, // Unique ID for current run
                        currentState = InitialState,
                        currentResult = initialNode,
                        currentError = null, // Stores a caught error
                        cancellationCause = null, // Stores a cancellation reason
                        bindStack = null, // Stack for Bind operations
                        applyStack = null, // Stack for Apply operations
                        bracketStack = null, // Stack for Bracket/Catch operations
                        bracketDepth = 0, // Current depth of Bracket handlers
                        handlerCount = 0, // Counter for completion handlers
                        completionHandlers = null, // Map of completion handlers
                        shouldRethrow = true; // Flag to determine if final errors should be rethrown

                    // The main loop that drives the fiber's execution.
                    function proceedExecution(runId) {
                        var nextNode, handlerEntry, bracketEntry;
                        for (;;) switch (nextNode = null, handlerEntry = null, bracketEntry = null, currentState) {
                            case ResumingState: // Applying a bound function to a previous result.
                                currentState = RunningState;
                                currentResult = bindStack(currentResult);
                                null === applyStack ? bindStack = null : (bindStack = applyStack.valueOne, applyStack = applyStack.valueTwo);
                                break;
                            case ProcessingResultState: // Processing the result of a previous step.
                                eitherModule.isLeft(currentResult) ? (currentState = ErrorHandlingState, currentError = currentResult, currentResult = null) : null === bindStack ? currentState = ErrorHandlingState : (currentState = ResumingState, currentResult = eitherModule.fromRight(currentResult));
                                break;
                            case RunningState: // Executing the current node based on its tag.
                                switch (currentResult.nodeTag) {
                                    case BindTag:
                                        bindStack && (applyStack = new AsyncNode(ConsTag, bindStack, applyStack)),
                                            bindStack = currentResult.valueTwo,
                                            currentState = RunningState,
                                            currentResult = currentResult.valueOne;
                                        break;
                                    case PureTag:
                                        null === bindStack ? (currentState = ErrorHandlingState, currentResult = eitherModule.right(currentResult.valueOne)) : (currentState = ResumingState, currentResult = currentResult.valueOne);
                                        break;
                                    case SyncTag:
                                        currentState = ProcessingResultState,
                                            currentResult = executeSyncOperation(eitherModule.left, eitherModule.right, currentResult.valueOne);
                                        break;
                                    case AsyncTag:
                                        return currentState = AsyncWaitingState,
                                            void (currentResult = executeAsyncCallback(eitherModule.left, currentResult.valueOne, function (resultFunc) {
                                                return function () {
                                                    executionCounter === runId && (executionCounter++, taskScheduler.enqueue(function () {
                                                        executionCounter === runId + 1 && (currentState = ProcessingResultState, currentResult = resultFunc, proceedExecution(executionCounter));
                                                    }));
                                                };
                                            }));
                                    case ThrowTag:
                                        currentState = ErrorHandlingState,
                                            currentError = eitherModule.left(currentResult.valueOne),
                                            currentResult = null;
                                        break;
                                    case CatchTag:
                                        bracketStack = new AsyncNode(ConsTag, currentResult, null === bindStack ? bracketStack : new AsyncNode(ConsTag, new AsyncNode(ResumeTag, bindStack, applyStack), bracketStack, cancellationCause), cancellationCause),
                                            bindStack = null,
                                            applyStack = null,
                                            currentState = RunningState,
                                            currentResult = currentResult.valueOne;
                                        break;
                                    case BracketTag:
                                        bracketDepth++,
                                            bracketStack = new AsyncNode(ConsTag, currentResult, null === bindStack ? bracketStack : new AsyncNode(ConsTag, new AsyncNode(ResumeTag, bindStack, applyStack), bracketStack, cancellationCause), cancellationCause),
                                            bindStack = null,
                                            applyStack = null,
                                            currentState = RunningState,
                                            currentResult = currentResult.valueOne;
                                        break;
                                    case ForkTag:
                                        currentState = ProcessingResultState,
                                            handlerEntry = fiberExecutor(eitherModule, supervisor, currentResult.valueTwo),
                                            supervisor && supervisor.register(handlerEntry),
                                            currentResult.valueOne && handlerEntry.run(),
                                            currentResult = eitherModule.right(handlerEntry);
                                        break;
                                    case SequentialTag:
                                        currentState = RunningState, currentResult = processSequential(eitherModule, supervisor, currentResult.valueOne);
                                }
                                break;
                            case ErrorHandlingState: // Handling errors or cancellations.
                                if (bindStack = null, applyStack = null, null === bracketStack)
                                    currentState = FinalState, currentResult = cancellationCause || currentError || currentResult;
                                else
                                    switch (nextNode = bracketStack.valueThree, bracketEntry = bracketStack.valueOne, bracketStack = bracketStack.valueTwo, bracketEntry.nodeTag) {
                                        case CatchTag:
                                            cancellationCause && cancellationCause !== nextNode ? currentState = ErrorHandlingState : currentError && (currentState = RunningState, currentResult = bracketEntry.valueTwo(eitherModule.fromLeft(currentError)), currentError = null);
                                            break;
                                        case ResumeTag:
                                            cancellationCause && cancellationCause !== nextNode || currentError ? currentState = ErrorHandlingState : (bindStack = bracketEntry.valueOne, applyStack = bracketEntry.valueTwo, currentState = ResumingState, currentResult = eitherModule.fromRight(currentResult));
                                            break;
                                        case BracketTag:
                                            bracketDepth--,
                                                null === currentError && (handlerEntry = eitherModule.fromRight(currentResult),
                                                    bracketStack = new AsyncNode(ConsTag, new AsyncNode(ReleaseTag, bracketEntry.valueTwo, handlerEntry), bracketStack, nextNode),
                                                    (cancellationCause === nextNode || bracketDepth > 0) && (currentState = RunningState, currentResult = bracketEntry.valueThree(handlerEntry)));
                                            break;
                                        case ReleaseTag:
                                            bracketDepth++,
                                                bracketStack = new AsyncNode(ConsTag, new AsyncNode(FinalizedTag, currentResult, currentError), bracketStack, cancellationCause),
                                                currentState = RunningState,
                                                currentResult = cancellationCause && cancellationCause !== nextNode ? bracketEntry.valueOne.killed(eitherModule.fromLeft(cancellationCause))(bracketEntry.valueTwo) : currentError ? bracketEntry.valueOne.failed(eitherModule.fromLeft(currentError))(bracketEntry.valueTwo) : bracketEntry.valueOne.completed(eitherModule.fromRight(currentResult))(bracketEntry.valueTwo),
                                                currentError = null;
                                            break;
                                        case FinalizerTag:
                                            bracketDepth++,
                                                bracketStack = new AsyncNode(ConsTag, new AsyncNode(FinalizedTag, currentResult, currentError), bracketStack, cancellationCause),
                                                currentState = RunningState,
                                                currentResult = bracketEntry.valueOne;
                                            break;
                                        case FinalizedTag:
                                            bracketDepth--,
                                                currentState = ErrorHandlingState,
                                                currentResult = bracketEntry.valueOne,
                                                currentError = bracketEntry.valueTwo;
                                    }
                                break;
                            case FinalState: // The fiber has completed.
                                for (var handlerKey in completionHandlers)
                                    completionHandlers.hasOwnProperty(handlerKey) && (shouldRethrow = shouldRethrow && completionHandlers[handlerKey].rethrow, handleUnhandledException(completionHandlers[handlerKey].handler(currentResult)));
                                return completionHandlers = null,
                                    void (cancellationCause && currentError ? setTimeout(function () {
                                        throw eitherModule.fromLeft(currentError);
                                    }, 0) : eitherModule.isLeft(currentResult) && shouldRethrow && setTimeout(function () {
                                        if (shouldRethrow) throw eitherModule.fromLeft(currentResult);
                                    }, 0));
                            case InitialState:
                                currentState = RunningState;
                                break;
                            case AsyncWaitingState:
                                return; // This state is handled by the async callback, not by advancing the loop.
                        }
                    }

                    // Registers a handler to be called when the fiber completes.
                    function registerCompletionHandler(handlerConfig) {
                        return function () {
                            if (currentState === FinalState) return shouldRethrow = shouldRethrow && handlerConfig.rethrow, handlerConfig.handler(currentResult)(),
                                function () { };
                            var handlerId = handlerCount++;
                            (completionHandlers = completionHandlers || {})[handlerId] = handlerConfig;
                            return function () {
                                null !== completionHandlers && delete completionHandlers[handlerId];
                            };
                        };
                    }

                    return {
                        // Attempts to cancel the fiber's execution.
                        kill: function (errorVal, callbackFunc) {
                            return function () {
                                if (currentState === FinalState) return callbackFunc(eitherModule.right(void 0))(),
                                    function () { };
                                var cancelHandler = registerCompletionHandler({
                                    rethrow: false,
                                    handler: function () {
                                        return function () {
                                            return callbackFunc(eitherModule.right(void 0));
                                        };
                                    }()
                                })();
                                switch (currentState) {
                                    case InitialState:
                                        cancellationCause = eitherModule.left(errorVal), currentState = FinalState, currentResult = cancellationCause, proceedExecution(executionCounter);
                                        break;
                                    case AsyncWaitingState:
                                        null === cancellationCause && (cancellationCause = eitherModule.left(errorVal)),
                                            0 === bracketDepth && (currentState === AsyncWaitingState && (bracketStack = new AsyncNode(ConsTag, new AsyncNode(FinalizerTag, currentResult(errorVal)), bracketStack, cancellationCause)),
                                                currentState = ErrorHandlingState, currentResult = null, currentError = null, proceedExecution(++executionCounter));
                                        break;
                                    default:
                                        null === cancellationCause && (cancellationCause = eitherModule.left(errorVal)),
                                            0 === bracketDepth && (currentState = ErrorHandlingState, currentResult = null, currentError = null);
                                }
                                return cancelHandler;
                            };
                        },
                        // Registers a callback to be invoked when the fiber completes (success or failure).
                        join: function (completionCallback) {
                            return function () {
                                var cancelHandler = registerCompletionHandler({
                                    rethrow: false,
                                    handler: completionCallback
                                })();
                                currentState === InitialState && proceedExecution(executionCounter);
                                return cancelHandler;
                            };
                        },
                        onComplete: registerCompletionHandler,
                        isSuspended: function () {
                            return currentState === InitialState;
                        },
                        // Initiates the execution of the fiber.
                        run: function () {
                            currentState === InitialState && (taskScheduler.isDraining() ? proceedExecution(executionCounter) : taskScheduler.enqueue(function () {
                                proceedExecution(executionCounter);
                            }));
                        }
                    };
                }

                /**
                 * Executes a parallel asynchronous computation.
                 * @param {object} eitherModule - Utilities for Either type.
                 * @param {object} supervisor - The fiber supervisor.
                 * @param {AsyncNode} parallelNode - The root node of the parallel computation tree.
                 * @param {function} successCallback - Callback to invoke upon completion.
                 * @returns {function} A function that returns a Canceler.
                 */
                function parallelExecutor(eitherModule, supervisor, parallelNode, successCallback) {
                    var concurrentTaskCount = 0,
                        fiberMap = {}, // Maps task IDs to fiber instances
                        concurrentHandlerCount = 0,
                        concurrentHandlerMap = {}, // Maps handler IDs to cancel functions
                        earlyExitError = new Error("[ConcurrentAsync] Early exit"), // Error for early cancellation
                        globalError = null, // Stores a global error that halts all parallel tasks
                        currentNode = eitherModule; // Reference to the Either module for convenience

                    // Cancels a set of concurrent tasks.
                    function cancelConcurrentTasks(cancelError, node, callback) {
                        var fiberToKill,
                            activeFibers = {},
                            killCounter = 0;
                        node: for (;;)
                            switch (fiberToKill = null, node.nodeTag) {
                                case ForkedTag: // If it's a forked fiber, kill it.
                                    if (node.valueThree === currentNode && (fiberToKill = fiberMap[node.valueOne], activeFibers[killCounter++] = fiberToKill.kill(cancelError, function (result) {
                                        return function () {
                                            0 === --killCounter && callback(result)();
                                        };
                                    })), null === node) break node;
                                    node = node.valueTwo, null === node ? node = null : (node = node.valueOne, node = node.valueTwo);
                                    break;
                                case MapTag: // Traverse down for Map nodes.
                                    node = node.valueTwo;
                                    break;
                                case ApplyTag:
                                case AltTag: // For Apply/Alt, traverse both branches if necessary.
                                    node && (node = new AsyncNode(ConsTag, node, node)), node = node.valueOne;
                            }

                        if (0 === killCounter) callback(eitherModule.right(void 0))();
                        else
                            for (fiberToKill = 0; fiberToKill < killCounter; fiberToKill++)
                                activeFibers[fiberToKill] = activeFibers[fiberToKill]();
                        return activeFibers;
                    }

                    // Handles the completion of a single concurrent task and propagates the result.
                    function handleConcurrentCompletion(fiberEntry) {
                        return function (resultVal) {
                            return function () {
                                delete fiberMap[fiberEntry.valueOne];
                                fiberEntry.valueThree = resultVal;
                                (function processParallelResult(currentResult, treeNode, parentNode) {
                                    var leftVal, rightVal, nodeValue, nextNode, cancelFlag;
                                    eitherModule.isLeft(currentResult) ? (leftVal = currentResult, rightVal = null) : (rightVal = currentResult, leftVal = null);

                                    for (;;) {
                                        if (nodeValue = null, nextNode = null, cancelFlag = null, null !== globalError) return;
                                        if (null === treeNode) return void successCallback(leftVal || rightVal)();
                                        if (treeNode.valueThree !== currentNode) return;

                                        switch (treeNode.nodeTag) {
                                            case MapTag:
                                                null === leftVal ? (treeNode.valueThree = eitherModule.right(treeNode.valueOne(eitherModule.fromRight(rightVal))), rightVal = treeNode.valueThree) : treeNode.valueThree = leftVal;
                                                break;
                                            case ApplyTag:
                                                nodeValue = treeNode.valueOne.valueThree, nextNode = treeNode.valueTwo.valueThree;
                                                if (leftVal) {
                                                    if (treeNode.valueThree = leftVal, cancelFlag = true, nextNode = concurrentHandlerCount++, concurrentHandlerMap[nextNode] = cancelConcurrentTasks(earlyExitError, leftVal === nodeValue ? treeNode.valueTwo : treeNode.valueOne, function () {
                                                        return function () {
                                                            delete concurrentHandlerMap[nextNode];
                                                            cancelFlag ? cancelFlag = false : null === parentNode ? processParallelResult(leftVal, null, null) : processParallelResult(leftVal, parentNode.valueOne, parentNode.valueTwo);
                                                        };
                                                    }), cancelFlag) return void (cancelFlag = false);
                                                } else {
                                                    if (nodeValue === currentNode || nextNode === currentNode) return;
                                                    rightVal = eitherModule.right(eitherModule.fromRight(nodeValue)(eitherModule.fromRight(nextNode)));
                                                    treeNode.valueThree = rightVal;
                                                }
                                                break;
                                            case AltTag:
                                                nodeValue = treeNode.valueOne.valueThree, nextNode = treeNode.valueTwo.valueThree;
                                                if (nodeValue === currentNode && eitherModule.isLeft(nextNode) || nextNode === currentNode && eitherModule.isLeft(nodeValue)) return;
                                                if (nodeValue !== currentNode && eitherModule.isLeft(nodeValue) && nextNode !== currentNode && eitherModule.isLeft(nextNode))
                                                    leftVal = rightVal === nodeValue ? nextNode : nodeValue, rightVal = null, treeNode.valueThree = leftVal;
                                                else if (treeNode.valueThree = rightVal, cancelFlag = true, nextNode = concurrentHandlerCount++, concurrentHandlerMap[nextNode] = cancelConcurrentTasks(earlyExitError, rightVal === nodeValue ? treeNode.valueTwo : treeNode.valueOne, function () {
                                                    return function () {
                                                        delete concurrentHandlerMap[nextNode];
                                                        cancelFlag ? cancelFlag = false : null === parentNode ? processParallelResult(rightVal, null, null) : processParallelResult(rightVal, parentNode.valueOne, parentNode.valueTwo);
                                                    };
                                                }), cancelFlag) return void (cancelFlag = false);
                                        }
                                        null === parentNode ? treeNode = null : (treeNode = parentNode.valueOne, parentNode = parentNode.valueTwo);
                                    }
                                })(resultVal, fiberEntry.valueTwo.valueOne, fiberEntry.valueTwo.valueTwo);
                            };
                        };
                    }

                    return function () {
                        var currentOp, nextOp,
                            currentParseState = RunningState,
                            currentNode = parallelNode,
                            parseStack = null,
                            parserStack = null;

                        // Phase 1: Parse the parallel AST into a series of Forked nodes and build the tree.
                        nodeParsingLoop: for (;;)
                            switch (currentOp = null, nextOp = null, currentParseState) {
                                case RunningState:
                                    switch (currentNode.nodeTag) {
                                        case MapTag:
                                            parseStack && (parserStack = new AsyncNode(ConsTag, parseStack, parserStack)),
                                                parseStack = new AsyncNode(MapTag, currentNode.valueOne, currentNode.valueThree, currentNode.valueThree),
                                                currentNode = currentNode.valueTwo;
                                            break;
                                        case ApplyTag:
                                            parseStack && (parserStack = new AsyncNode(ConsTag, parseStack, parserStack)),
                                                parseStack = new AsyncNode(ApplyTag, currentNode.valueThree, currentNode.valueTwo, currentNode.valueThree),
                                                currentNode = currentNode.valueOne;
                                            break;
                                        case AltTag:
                                            parseStack && (parserStack = new AsyncNode(ConsTag, parseStack, parserStack)),
                                                parseStack = new AsyncNode(AltTag, currentNode.valueThree, currentNode.valueTwo, currentNode.valueThree),
                                                currentNode = currentNode.valueOne;
                                            break;
                                        default: // Base case: a non-parallel node, create a fiber for it.
                                            nextOp = concurrentTaskCount++,
                                                currentParseState = ErrorHandlingState,
                                                currentOp = currentNode,
                                                currentNode = new AsyncNode(ForkedTag, nextOp, new AsyncNode(ConsTag, parseStack, parserStack), currentNode.valueThree),
                                                (currentOp = fiberExecutor(eitherModule, supervisor, currentOp)).onComplete({
                                                    rethrow: false,
                                                    handler: handleConcurrentCompletion(currentNode)
                                                })(),
                                                fiberMap[nextOp] = currentOp,
                                                supervisor && supervisor.register(currentOp);
                                    }
                                    break;
                                case ErrorHandlingState: // "Done parsing" state, now pop from stack.
                                    if (null === parseStack) break nodeParsingLoop;
                                    parseStack.valueOne === currentNode.valueThree ? (parseStack.valueOne = currentNode, currentParseState = RunningState, currentNode = parseStack.valueTwo, parseStack.valueTwo = currentNode.valueThree) : (parseStack.valueTwo = currentNode, currentNode = parseStack, null === parserStack ? parseStack = null : (parseStack = parserStack.valueOne, parserStack = parserStack.valueTwo));
                            }
                        for (globalError = currentNode, nextOp = 0; nextOp < concurrentTaskCount; nextOp++)
                            fiberMap[nextOp].run(); // Phase 2: Start all created fibers.

                        // Return a Canceler for the entire parallel computation.
                        return function (cancelFunc) {
                            return new AsyncNode(AsyncTag, function (errorHandler) {
                                return function () {
                                    for (var key in globalError = eitherModule.left(cancelFunc), concurrentHandlerMap)
                                        if (concurrentHandlerMap.hasOwnProperty(key))
                                            for (var subKey in nextOp = concurrentHandlerMap[key])
                                                nextOp.hasOwnProperty(subKey) && nextOp[subKey]();
                                    concurrentHandlerMap = null;
                                    var killAllCancelers = cancelConcurrentTasks(cancelFunc, currentNode, errorHandler);
                                    return function (finalizer) {
                                        return new AsyncNode(AsyncTag, function () {
                                            for (var key in killAllCancelers)
                                                killAllCancelers.hasOwnProperty(key) && killAllCancelers[key]();
                                        });
                                    };
                                };
                            });
                        };
                    };
                }

                // Processes a sequential async node.
                function processSequential(eitherModule, supervisor, sequentialNode) {
                    return new AsyncNode(AsyncTag, function (successCallback) {
                        return function () {
                            return parallelExecutor(eitherModule, supervisor, sequentialNode, successCallback);
                        };
                    });
                }

                // Export all internal constructors and utilities.
                return AsyncNode.EMPTY = currentNode,
                    AsyncNode.Pure = createTaggedConstructor(PureTag),
                    AsyncNode.Throw = createTaggedConstructor(ThrowTag),
                    AsyncNode.Catch = createTaggedConstructor(CatchTag),
                    AsyncNode.Sync = createTaggedConstructor(SyncTag),
                    AsyncNode.Async = createTaggedConstructor(AsyncTag),
                    AsyncNode.Bind = createTaggedConstructor(BindTag),
                    AsyncNode.Bracket = createTaggedConstructor(BracketTag),
                    AsyncNode.Fork = createTaggedConstructor(ForkTag),
                    AsyncNode.Sequential = createTaggedConstructor(SequentialTag),
                    AsyncNode.ParMap = createTaggedConstructor(MapTag),
                    AsyncNode.ParApply = createTaggedConstructor(ApplyTag),
                    AsyncNode.ParAlt = createTaggedConstructor(AltTag),
                    AsyncNode.Fiber = fiberExecutor,
                    AsyncNode.Supervisor = function (eitherModule) {
                        var activeFibers = {},
                            nextFiberId = 0,
                            runningFiberCount = 0;
                        return {
                            register: function (fiberInstance) {
                                var currentId = nextFiberId++;
                                fiberInstance.onComplete({
                                    rethrow: true,
                                    handler: function (result) {
                                        return function () {
                                            runningFiberCount--, delete activeFibers[currentId];
                                            eitherModule.isLeft(result) && eitherModule.fromLeft(result) && setTimeout(function () {
                                                throw eitherModule.fromLeft(result);
                                            }, 0);
                                        };
                                    }
                                }),
                                    activeFibers[currentId] = fiberInstance,
                                    runningFiberCount++;
                            },
                            isEmpty: function () {
                                return 0 === runningFiberCount;
                            },
                            killAll: function (errorVal, completionFunc) {
                                return function () {
                                    var killCount = 0,
                                        cancelers = {};

                                    function initiateKill(fiberId) {
                                        cancelers[fiberId] = activeFibers[fiberId].kill(errorVal, function (result) {
                                            return function () {
                                                delete cancelers[fiberId], killCount--;
                                                eitherModule.isLeft(result) && eitherModule.fromLeft(result) && setTimeout(function () {
                                                    throw eitherModule.fromLeft(result);
                                                }, 0);
                                                0 === killCount && completionFunc();
                                            };
                                        })();
                                    }
                                    for (var id in activeFibers)
                                        activeFibers.hasOwnProperty(id) && (killCount++, initiateKill(id));
                                    return activeFibers = {}, nextFiberId = 0, runningFiberCount = 0,
                                        function (finalizerFunc) {
                                            return new AsyncNode(SyncTag, function () {
                                                for (var id in cancelers)
                                                    cancelers.hasOwnProperty(id) && cancelers[id]();
                                            });
                                        };
                                };
                            }
                        };
                    }(eitherModule),
                    AsyncNode.Scheduler = taskScheduler,
                    AsyncNode.noCancellation = createPureNode,
                    AsyncNode;
            }();

            targetModule.asyncPure = asyncOpTypes.Pure;
            targetModule.asyncMap = function (transformFunc) {
                return function (asyncOp) {
                    return asyncOp.nodeTag === asyncOpTypes.Pure.nodeTag ? asyncOpTypes.Pure(transformFunc(asyncOp.valueOne)) : asyncOpTypes.Bind(asyncOp, function (result) {
                        return asyncOpTypes.Pure(transformFunc(result));
                    });
                };
            };
            targetModule.asyncBind = function (asyncOp) {
                return function (bindFunc) {
                    return asyncOpTypes.Bind(asyncOp, bindFunc);
                };
            };
            targetModule.liftSyncOperation = asyncOpTypes.Sync;
            targetModule.parallelAsyncMap = function (transformFunc) {
                return function (asyncOp) {
                    return asyncOpTypes.ParMap(transformFunc, asyncOp);
                };
            };
            targetModule.parallelAsyncApply = function (asyncOpA) {
                return function (asyncOpB) {
                    return asyncOpTypes.ParApply(asyncOpA, asyncOpB);
                };
            };
            targetModule.createAsyncOperation = asyncOpTypes.Async;
            targetModule.createAsyncFiber = function (eitherModule, asyncOp) {
                return function () {
                    return asyncOpTypes.Fiber(eitherModule, null, asyncOp);
                };
            };
            targetModule.sequentialAsync = asyncOpTypes.Sequential;
        }(applicationUtilities["Operation.Asynchronous"] = applicationUtilities["Operation.Asynchronous"] || {});

        // Module: Operation.Interface (Effect.Class)
        !function (targetModule) {
            "use strict";
            // Lifts an effectful operation into a monadic context.
            targetModule.liftSync = function (monadEffectObj) {
                return monadEffectObj.liftSync;
            };
            // Constructor for SyncMonad, combining a Monad and a liftSync function.
            targetModule.SyncMonad = function (monadRef, liftEffFunc) {
                this.MonadicType0 = monadRef;
                this.liftSync = liftEffFunc;
            };
        }(applicationUtilities["Operation.Interface"] = applicationUtilities["Operation.Interface"] || {});

        // Module: Operation.Reference (Effect.Ref)
        !function (targetModule) {
            "use strict";
            // Creates a new mutable reference (like a Ref cell).
            targetModule.createNewReference = function (initialVal) {
                return function () {
                    return {
                        value: initialVal
                    };
                };
            };
            // Reads the current value from a mutable reference.
            targetModule.readReference = function (refObj) {
                return function () {
                    return refObj.value;
                };
            };
            // Writes a new value to a mutable reference.
            targetModule.writeReference = function (newVal) {
                return function (refObj) {
                    return function () {
                        return refObj.value = newVal, {};
                    };
                };
            };
        }(applicationUtilities["Operation.Reference"] = applicationUtilities["Operation.Reference"] || {});

        // Module: Operation.Reference (Effect.Ref) - Part 2
        !function (targetModule) {
            "use strict";
            var ReferenceModule = applicationUtilities["Operation.Reference"];
            targetModule.createNewReference = ReferenceModule.createNewReference;
            targetModule.readReference = ReferenceModule.readReference;
            targetModule.writeReference = ReferenceModule.writeReference;
        }(applicationUtilities["Operation.Reference"] = applicationUtilities["Operation.Reference"] || {});

        // Module: Flow.Concurrent.Interface (Control.Parallel.Class)
        !function (targetModule) {
            "use strict";
            // Converts a computation to its parallel form.
            targetModule.toParallel = function (concurrentObj) {
                return concurrentObj.parallel;
            };
            // Converts a computation to its sequential form.
            targetModule.toSequential = function (concurrentObj) {
                return concurrentObj.sequential;
            };
            // Constructor for ConcurrentInterface, defining parallel and sequential transformations.
            targetModule.ConcurrentInterface = function (applicativeRef, monadRef, parallelFunc, sequentialFunc) {
                this.ConstructiveType1 = applicativeRef;
                this.MonadicType0 = monadRef;
                this.parallel = parallelFunc;
                this.sequential = sequentialFunc;
            };
        }(applicationUtilities["Flow.Concurrent.Interface"] = applicationUtilities["Flow.Concurrent.Interface"] || {});

        // Module: Flow.Concurrent (Control.Parallel)
        !function (targetModule) {
            "use strict";
            var IdentityModule = applicationUtilities["Flow.Identity"],
                ConcurrentInterfaceModule = applicationUtilities["Flow.Concurrent.Interface"],
                TraversableModule = applicationUtilities["Data.Traversable"],
                // Traverses a structure with an action in a parallel context, discarding results.
                concurrentTraverseAndDiscardFunction = function (concurrentObj) {
                    return function (traversableObj) {
                        return function (transformFunc) {
                            return function (inputCollection) {
                                return ConcurrentInterfaceModule.toSequential(concurrentObj)(TraversableModule.traverseAndDiscard(concurrentObj.ConstructiveType1())(traversableObj)(function (element) {
                                    return ConcurrentInterfaceModule.toParallel(concurrentObj)(transformFunc(element));
                                })(inputCollection));
                            };
                        };
                    };
                };
            targetModule.concurrentTraverseAndDiscard = concurrentTraverseAndDiscardFunction;
            // Sequences a list of parallel computations, discarding their results.
            targetModule.concurrentSequenceAndDiscard = function (concurrentObj) {
                return function (traversableObj) {
                    return concurrentTraverseAndDiscardFunction(concurrentObj)(traversableObj)(IdentityModule.idOperation(IdentityModule.identityFunction));
                };
            };
        }(applicationUtilities["Flow.Concurrent"] = applicationUtilities["Flow.Concurrent"] || {});

        // Module: Operation.Errors (Effect.Exception)
        !function (targetModule) {
            "use strict";
            // Creates a new Error object.
            targetModule.createError = function (message) {
                return new Error(message);
            };
            // Throws a given exception.
            targetModule.raiseException = function (exceptionObj) {
                return function () {
                    throw exceptionObj;
                };
            };
        }(applicationUtilities["Operation.Errors"] = applicationUtilities["Operation.Errors"] || {});

        // Module: Operation.Errors (Effect.Exception) - Part 2
        !function (targetModule) {
            "use strict";
            var ErrorsModule = applicationUtilities["Operation.Errors"];
            // Creates and immediately throws an error with the given message.
            targetModule.raise = function (message) {
                return ErrorsModule.raiseException(ErrorsModule.createError(message));
            };
        }(applicationUtilities["Operation.Errors"] = applicationUtilities["Operation.Errors"] || {});

        // Module: Operation.Asynchronous (Effect.Aff) - Part 2
        !function (targetModule) {
            "use strict";
            var AsyncModule = applicationUtilities["Operation.Asynchronous"],
                ApplicationModule = applicationUtilities["Flow.Application"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                ConcurrentInterfaceModule = applicationUtilities["Flow.Concurrent.Interface"],
                TraversableModule = applicationUtilities["Data.Traversable"],
                OperationModule = applicationUtilities["Data.Operation"],
                AggregatorModule = applicationUtilities["Data.Aggregator"],
                EffectModule = applicationUtilities.Operation,
                SyncInterfaceModule = applicationUtilities["Operation.Interface"],
                RawCastModule = applicationUtilities["Raw.Cast"],
                // Instances of Functor, Apply, Applicative, Bind, Monad for asynchronous and parallel asynchronous computations.
                parallelAsyncMapperInstance = new applicationUtilities["Data.Mapper"].MapperType(AsyncModule.parallelAsyncMap),
                asyncMapperInstance = new applicationUtilities["Data.Mapper"].MapperType(AsyncModule.asyncMap),
                // Helper functions for working with the Data.Choice (Either) type.
                eitherHelpers = {
                    isLeft: function (choiceVal) {
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceLeft) return true;
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceRight) return false;
                        throw new Error("Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [choiceVal.constructor.name]);
                    },
                    fromLeft: function (choiceVal) {
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceLeft) return choiceVal.valueOne;
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceRight) return applicationUtilities["Partial.Critical"].criticalTerminateWithError("unsafeFromLeft: Right");
                        throw new Error("Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [choiceVal.constructor.name]);
                    },
                    fromRight: function (choiceVal) {
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceRight) return choiceVal.valueOne;
                        if (choiceVal instanceof applicationUtilities["Data.Choice"].ChoiceLeft) return applicationUtilities["Partial.Critical"].criticalTerminateWithError("unsafeFromRight: Left");
                        throw new Error("Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [choiceVal.constructor.name]);
                    },
                    left: applicationUtilities["Data.Choice"].ChoiceLeft.create,
                    right: applicationUtilities["Data.Choice"].ChoiceRight.create
                },
                // Executes an asynchronous computation and returns its fiber.
                executeAsyncFunction = function (asyncOp) {
                    return function () {
                        var fiber = AsyncModule.createAsyncFiber(eitherHelpers, asyncOp)();
                        return fiber.run(), fiber;
                    };
                },
                parallelApplicationInstance = new ApplicationModule.ApplicationType(function () {
                    return parallelAsyncMapperInstance;
                }, AsyncModule.parallelAsyncApply),
                asyncMonadInstance = new applicationUtilities["Control.Monad"].MonadicType(function () {
                    return asyncConstructiveInstance;
                }, function () {
                    return asyncSequencingInstance;
                }),
                asyncSequencingInstance = new SequencingModule.SequencingType(function () {
                    return asyncApplicationInstance;
                }, AsyncModule.asyncBind),
                asyncApplicationInstance = new ApplicationModule.ApplicationType(function () {
                    return asyncMapperInstance;
                }, applicationUtilities["Control.Monad"].applyMonadic(asyncMonadInstance)),
                asyncConstructiveInstance = new applicationUtilities["Flow.Constructive"].ConstructiveType(function () {
                    return asyncApplicationInstance;
                }, AsyncModule.asyncPure),
                asyncSyncMonadInstance = new SyncInterfaceModule.SyncMonad(function () {
                    return asyncMonadInstance;
                }, AsyncModule.liftSyncOperation),
                concurrentAsyncInstance = new ConcurrentInterfaceModule.ConcurrentInterface(function () {
                    return parallelAsyncConstructiveInstance;
                }, function () {
                    return asyncMonadInstance;
                }, RawCastModule.rawCast, AsyncModule.sequentialAsync),
                parallelAsyncConstructiveInstance = new applicationUtilities["Flow.Constructive"].ConstructiveType(function () {
                    return parallelApplicationInstance;
                }, function (val) {
                    return ConcurrentInterfaceModule.toParallel(concurrentAsyncInstance)(applicationUtilities["Flow.Constructive"].constructValue(asyncConstructiveInstance)(val));
                }),
                // A Semigroup for combining cancellers.
                cancellationConcatenationInstance = new applicationUtilities["Data.Concatenation"].ConcatenationType(function (cancelFuncA) {
                    return function (cancelFuncB) {
                        return function (errorVal) {
                            return applicationUtilities["Flow.Concurrent"].concurrentSequenceAndDiscard(concurrentAsyncInstance)(TraversableModule.listTraversable)([cancelFuncA(errorVal), cancelFuncB(errorVal)]);
                        };
                    };
                }),
                // A canceller that does nothing.
                noCancellationFunction = OperationModule.constantValue(applicationUtilities["Flow.Constructive"].constructValue(asyncConstructiveInstance)(applicationUtilities["Data.Singleton"].singletonValue)),
                // A Monoid for cancellers.
                cancellationAggregatorInstance = new AggregatorModule.AggregatorType(function () {
                    return cancellationConcatenationInstance;
                }, noCancellationFunction);
            targetModule.executeAsync = executeAsyncFunction;
            // Executes an async computation and discards its result.
            targetModule.executeAsyncAndDiscard = function (asyncOp) {
                return applicationUtilities["Data.Mapper"].discardResult(EffectModule.operationMapper)(executeAsyncFunction(asyncOp));
            };
            targetModule.noCancellation = noCancellationFunction;
            targetModule.asyncMapper = asyncMapperInstance;
            targetModule.asyncApplication = asyncApplicationInstance;
            targetModule.asyncConstructive = asyncConstructiveInstance;
            targetModule.asyncSequencing = asyncSequencingInstance;
            targetModule.asyncMonad = asyncMonadInstance;
            targetModule.asyncSyncMonad = asyncSyncMonadInstance;
            targetModule.parallelAsyncMapper = parallelAsyncMapperInstance;
            targetModule.parallelAsyncApplication = parallelApplicationInstance;
            targetModule.parallelAsyncConstructive = parallelAsyncConstructiveInstance;
            targetModule.concurrentAsync = concurrentAsyncInstance;
            targetModule.cancellationConcatenation = cancellationConcatenationInstance;
            targetModule.cancellationAggregator = cancellationAggregatorInstance;
            targetModule.createAsyncOperation = AsyncModule.createAsyncOperation;
        }(applicationUtilities["Operation.Asynchronous"] = applicationUtilities["Operation.Asynchronous"] || {});

        // Module: System.Encoding (Node.Encoding)
        !function (targetModule) {
            "use strict";
            var DisplayModule = applicationUtilities["Data.Display"],
                // Data constructors for various text encodings.
                AsciiEncodingClass = function () {
                    function AsciiEncoding() { }
                    return AsciiEncoding.value = new AsciiEncoding, AsciiEncoding;
                }(),
                Utf8EncodingClass = function () {
                    function Utf8Encoding() { }
                    return Utf8Encoding.value = new Utf8Encoding, Utf8Encoding;
                }(),
                Utf16LeEncodingClass = function () {
                    function Utf16LeEncoding() { }
                    return Utf16LeEncoding.value = new Utf16LeEncoding, Utf16LeEncoding;
                }(),
                Ucs2EncodingClass = function () {
                    function Ucs2Encoding() { }
                    return Ucs2Encoding.value = new Ucs2Encoding, Ucs2Encoding;
                }(),
                Base64EncodingClass = function () {
                    function Base64Encoding() { }
                    return Base64Encoding.value = new Base64Encoding, Base64Encoding;
                }(),
                Latin1EncodingClass = function () {
                    function Latin1Encoding() { }
                    return Latin1Encoding.value = new Latin1Encoding, Latin1Encoding;
                }(),
                BinaryEncodingClass = function () {
                    function BinaryEncoding() { }
                    return BinaryEncoding.value = new BinaryEncoding, BinaryEncoding;
                }(),
                HexEncodingClass = function () {
                    function HexEncoding() { }
                    return HexEncoding.value = new HexEncoding, HexEncoding;
                }(),
                // An instance of DisplayType for encodings.
                displayEncodingInstance = new DisplayModule.DisplayType(function (encoding) {
                    if (encoding instanceof AsciiEncodingClass) return "ASCII";
                    if (encoding instanceof Utf8EncodingClass) return "UTF8";
                    if (encoding instanceof Utf16LeEncodingClass) return "UTF16LE";
                    if (encoding instanceof Ucs2EncodingClass) return "UCS2";
                    if (encoding instanceof Base64EncodingClass) return "Base64";
                    if (encoding instanceof Latin1EncodingClass) return "Latin1";
                    if (encoding instanceof BinaryEncodingClass) return "Binary";
                    if (encoding instanceof HexEncodingClass) return "Hex";
                    throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [encoding.constructor.name]);
                });
            targetModule.AsciiEncoding = AsciiEncodingClass;
            targetModule.Utf8Encoding = Utf8EncodingClass;
            targetModule.Utf16LeEncoding = Utf16LeEncodingClass;
            targetModule.Ucs2Encoding = Ucs2EncodingClass;
            targetModule.Base64Encoding = Base64EncodingClass;
            targetModule.Latin1Encoding = Latin1EncodingClass;
            targetModule.BinaryEncoding = BinaryEncodingClass;
            targetModule.HexEncoding = HexEncodingClass;
            // Converts a custom encoding type to its Node.js string equivalent.
            targetModule.convertEncodingToNode = function (encoding) {
                if (encoding instanceof AsciiEncodingClass) return "ascii";
                if (encoding instanceof Utf8EncodingClass) return "utf8";
                if (encoding instanceof Utf16LeEncodingClass) return "utf16le";
                if (encoding instanceof Ucs2EncodingClass) return "ucs2";
                if (encoding instanceof Base64EncodingClass) return "base64";
                if (encoding instanceof Latin1EncodingClass) return "latin1";
                if (encoding instanceof BinaryEncodingClass) return "binary";
                if (encoding instanceof HexEncodingClass) return "hex";
                throw new Error("Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [encoding.constructor.name]);
            };
            targetModule.displayEncoding = displayEncodingInstance;
        }(applicationUtilities["System.Encoding"] = applicationUtilities["System.Encoding"] || {});

        // Module: System.Process (Node.Process)
        !function (targetModule) {
            "use strict";
            // Provides access to the Node.js `process` global object.
            (applicationUtilities["System.Process"] = applicationUtilities["System.Process"] || {}).currentProcess = process;
        }(applicationUtilities);

        // Module: System.Stream (Node.Stream)
        !function (targetModule) {
            "use strict";
            // Reads a stream chunk, handling both Buffer and string types.
            targetModule.readStreamChunkImplementation = function (stringHandler) {
                return function (bufferHandler) {
                    return function (chunk) {
                        if (chunk instanceof Buffer) return bufferHandler(chunk);
                        if ("string" == typeof chunk) return stringHandler(chunk);
                        throw new Error("Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " + chunk);
                    };
                };
            };
            // Registers a data handler for a stream, processing chunks as Either values.
            targetModule.onStreamDataEitherImplementation = function (chunkProcessor) {
                return function (stream) {
                    return function (dataHandler) {
                        return function () {
                            stream.on("data", function (dataChunk) {
                                dataHandler(chunkProcessor(dataChunk))();
                            });
                        };
                    };
                };
            };
            // Registers an end handler for a stream.
            targetModule.onStreamEnd = function (stream) {
                return function (endHandler) {
                    return function () {
                        stream.on("end", endHandler);
                    };
                };
            };
            // Writes data to a stream.
            targetModule.writeToStream = function (stream) {
                return function (data) {
                    return function (callback) {
                        return function () {
                            return stream.write(data, null, callback);
                        };
                    };
                };
            };
            // Writes a string to a stream with a specified encoding.
            targetModule.writeStringStreamImplementation = function (stream) {
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
        }(applicationUtilities["System.Stream"] = applicationUtilities["System.Stream"] || {});

        // Module: System.Buffer (Node.Buffer)
        !function (targetModule) {
            "use strict";
            // Converts a Buffer to a string using a specified encoding.
            (applicationUtilities["System.Buffer"] = applicationUtilities["System.Buffer"] || {}).bufferToStringImplementation = function (encoding) {
                return function (buffer) {
                    return function () {
                        return buffer.toString(encoding);
                    };
                };
            };
        }(applicationUtilities);

        // Module: System.Buffer (Node.Buffer) - Part 2
        !function (targetModule) {
            "use strict";
            var BufferModule = applicationUtilities["System.Buffer"],
                EncodingModule = applicationUtilities["System.Encoding"];
            // Converts a Buffer to a string using a given encoding type.
            targetModule.bufferToString = function (encoding) {
                return BufferModule.bufferToStringImplementation(EncodingModule.convertEncodingToNode(encoding));
            };
        }(applicationUtilities["System.Buffer"] = applicationUtilities["System.Buffer"] || {});

        // Module: System.Stream (Node.Stream) - Part 2
        !function (targetModule) {
            "use strict";
            var StreamModule = applicationUtilities["System.Stream"],
                ConstructiveModule = applicationUtilities["Flow.Constructive"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                ChoiceModule = applicationUtilities["Data.Choice"],
                EffectModule = applicationUtilities.Operation,
                ErrorsModule = applicationUtilities["Operation.Errors"],
                BufferModule = applicationUtilities["System.Buffer"],
                EncodingModule = applicationUtilities["System.Encoding"],
                // Function to process stream chunks as Choice values.
                readStreamChunkFunc = StreamModule.readStreamChunkImplementation(ChoiceModule.ChoiceLeft.create)(ChoiceModule.ChoiceRight.create),
                // Registers a data handler that processes chunks as Choice values.
                onStreamDataEitherFunc = function (stream) {
                    return function (dataHandler) {
                        return StreamModule.onStreamDataEitherImplementation(readStreamChunkFunc)(stream)(dataHandler);
                    };
                },
                // Registers a data handler for a stream, ensuring chunks are not Left (errors).
                onStreamDataFunc = function (stream) {
                    return function (dataHandler) {
                        return onStreamDataEitherFunc(stream)(SequencingModule.composeKleisliFlippedOperations(EffectModule.operationSequencing)(dataHandler)(function (choiceVal) {
                            if (choiceVal instanceof ChoiceModule.ChoiceLeft) return ErrorsModule.raise("Stream encoding should not be set");
                            if (choiceVal instanceof ChoiceModule.ChoiceRight) return ConstructiveModule.constructValue(EffectModule.operationConstructive)(choiceVal.valueOne);
                            throw new Error("Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " + [choiceVal.constructor.name]);
                        }));
                    };
                };
            targetModule.onStreamData = onStreamDataFunc;
            // Registers a data handler for a stream, converting chunks to strings with specified encoding.
            targetModule.onStreamDataString = function (stream) {
                return function (encoding) {
                    return function (dataHandler) {
                        return onStreamDataFunc(stream)(SequencingModule.composeKleisliFlippedOperations(EffectModule.operationSequencing)(dataHandler)(BufferModule.bufferToString(encoding)));
                    };
                };
            };
            targetModule.onStreamDataEither = onStreamDataEitherFunc;
            // Writes a string to a stream, using the display representation of the encoding.
            targetModule.writeStreamString = function (stream) {
                return function (encoding) {
                    return StreamModule.writeStringStreamImplementation(stream)(applicationUtilities["Data.Display"].displayValue(EncodingModule.displayEncoding)(encoding));
                };
            };
            targetModule.onStreamEnd = StreamModule.onStreamEnd;
        }(applicationUtilities["System.Stream"] = applicationUtilities["System.Stream"] || {});

        // Module: System.Process (Node.Process) - Part 2
        !function (targetModule) {
            "use strict";
            var ProcessModule = applicationUtilities["System.Process"],
                // References to Node.js standard input and output streams.
                standardOutputStream = ProcessModule.currentProcess.stdout,
                standardInputStream = ProcessModule.currentProcess.stdin;
            targetModule.standardInput = standardInputStream;
            targetModule.standardOutput = standardOutputStream;
        }(applicationUtilities["System.Process"] = applicationUtilities["System.Process"] || {});

        // Module: CompetitiveProgrammingSolver (ABC104C)
        !function (targetModule) {
            "use strict";
            var ConstructiveModule = applicationUtilities["Flow.Constructive"],
                SequencingModule = applicationUtilities["Flow.Sequencing"],
                IdentityModule = applicationUtilities["Flow.Identity"],
                StatefulInternalModule = applicationUtilities["Flow.Stateful.Internal"],
                ListModule = applicationUtilities["Data.List"],
                RangeModule = applicationUtilities["Data.Range"],
                ChoiceModule = applicationUtilities["Data.Choice"],
                NumericModule = applicationUtilities["Data.Numeric"],
                AggregatorModule = applicationUtilities["Data.Aggregator"],
                OrderingModule = applicationUtilities["Data.Ordering"],
                DisplayModule = applicationUtilities["Data.Display"],
                TextUtilityModule = applicationUtilities["Data.Text.Utility"],
                SingletonModule = applicationUtilities["Data.Singleton"],
                EffectModule = applicationUtilities.Operation,
                AsyncModule = applicationUtilities["Operation.Asynchronous"],
                SyncInterfaceModule = applicationUtilities["Operation.Interface"],
                ReferenceModule = applicationUtilities["Operation.Reference"],
                EncodingModule = applicationUtilities["System.Encoding"],
                ProcessModule = applicationUtilities["System.Process"],
                StreamModule = applicationUtilities["System.Stream"],
                PartialCriticalModule = applicationUtilities["Partial.Critical"],
                // Asynchronous operation to read all input from stdin.
                readInputAsyncOperation = AsyncModule.createAsyncOperation(function (completionHandler) {
                    return function () {
                        var stringRef = ReferenceModule.createNewReference("")();
                        StreamModule.onStreamDataString(ProcessModule.standardInput)(EncodingModule.Utf8Encoding.value)(function (chunk) {
                            return function () {
                                var currentString = ReferenceModule.readReference(stringRef)();
                                return ReferenceModule.writeReference(currentString + chunk)(stringRef)();
                            };
                        })(),
                            StreamModule.onStreamEnd(ProcessModule.standardInput)(function () {
                                var finalString = ReferenceModule.readReference(stringRef)();
                                return completionHandler(ConstructiveModule.constructValue(ChoiceModule.choiceConstructive)(finalString))();
                            })(),
                            AggregatorModule.emptyAggregate(AsyncModule.cancellationAggregator);
                    };
                }),
                // Parses a single line of problem data (difficulty and score).
                parseProblemLine = function (lineText) {
                    var parts = ListModule.filterMap(NumericModule.parseString)(TextUtilityModule.segmentText(" ")(lineText));
                    return 2 === ListModule.listLength(parts) ? new applicationUtilities["Data.Optional"].SomeValue(new applicationUtilities["Data.Pair"].PairType(parts[0], parts[1])) : applicationUtilities["Data.Optional"].NoValue.value;
                },
                /**
                 * The main problem-solving function.
                 * Takes raw input text, parses it, and calculates the minimum problems to solve.
                 * @param {string} inputText - The raw input string from stdin.
                 * @returns {string} The result as a formatted string.
                 */
                solveProblemFunction = function (inputText) {
                    return ChoiceModule.handleChoice(function (errorMessage) {
                        return PartialCriticalModule.criticalTerminateWithError(errorMessage);
                    })(IdentityModule.idOperation(IdentityModule.identityFunction))(
                        SequencingModule.sequenceOperations(ChoiceModule.choiceSequencing)(
                            ChoiceModule.noteChoice("lines")(
                                ListModule.getHeadTail(TextUtilityModule.segmentText("\n")(TextUtilityModule.stripWhitespace(inputText)))
                            )
                        )(function (problemLines) {
                            return SequencingModule.sequenceOperations(ChoiceModule.choiceSequencing)(
                                ChoiceModule.noteChoice("d g")(parseProblemLine(problemLines.head))
                            )(function (initialParams) {
                                var currentDifficulty = initialParams.valueOne,
                                    scoreValuePairs = ListModule.filterMap(parseProblemLine)(problemLines.tail);

                                // The core algorithm to find the minimum number of problems.
                                return ConstructiveModule.constructValue(ChoiceModule.choiceConstructive)(
                                    DisplayModule.displayValue(DisplayModule.displayInteger)(
                                        (function (difficultyVal, problemData) {
                                            var minSolvedCount = RangeModule.getMax(RangeModule.integerRange); // Initialize with max integer.
                                            // Iterate through all possible combinations of problems using a bitmask.
                                            StatefulInternalModule.iterateRange(0)(NumericModule.power(2)(difficultyVal))(function (bitmask) {
                                                return function () {
                                                    var currentScoreRef = {
                                                        value: 0
                                                    },
                                                        solvedCountRef = {
                                                            value: 0
                                                        };
                                                    // Calculate score and count for problems selected by the current bitmask.
                                                    StatefulInternalModule.iterateRange(0)(difficultyVal)(function (difficultyIndex) {
                                                        return ConstructiveModule.conditionalExecution(StatefulInternalModule.statefulConstructive)(
                                                            0 !== (bitmask & 1 << difficultyIndex)
                                                        )(function () {
                                                            return applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(
                                                                    ((100 * (difficultyIndex + 1 | 0) | 0) * problemData[difficultyIndex].valueOne | 0) + problemData[difficultyIndex].valueTwo | 0
                                                                ))(currentScoreRef)
                                                            )(),
                                                                applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                    StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(problemData[difficultyIndex].valueOne))(solvedCountRef)
                                                                )();
                                                        })();
                                                    })();

                                                    // If the required score is not met, try solving remaining problems greedily.
                                                    var remainingProblemsSolution = function () {
                                                        if (currentScoreRef.value >= currentDifficulty) return solvedCountRef.value;
                                                        var additionalScoreRef = {
                                                            value: 0
                                                        },
                                                            additionalCountRef = {
                                                                value: 0
                                                            };
                                                        // Iterate backwards through problems to solve highest difficulty first.
                                                        return StatefulInternalModule.iterateRange(0)(difficultyVal)(function (idx) {
                                                            var reverseIndex = (difficultyVal - idx | 0) - 1 | 0;
                                                            return ConstructiveModule.conditionalExecution(StatefulInternalModule.statefulConstructive)(
                                                                0 === (bitmask & 1 << reverseIndex)
                                                            )(function () {
                                                                return ConstructiveModule.conditionalExecution(StatefulInternalModule.statefulConstructive)(
                                                                    (currentScoreRef.value + additionalScoreRef.value | 0) < currentDifficulty
                                                                )(
                                                                    ((currentScoreRef.value + additionalScoreRef.value | 0) + ((100 * (reverseIndex + 1 | 0) | 0) * problemData[reverseIndex].valueOne | 0) | 0) >= currentDifficulty ? StatefulInternalModule.iterateRange(0)(problemData[reverseIndex].valueOne)(function (dummy) {
                                                                        return function () {
                                                                            return ConstructiveModule.conditionalExecution(StatefulInternalModule.statefulConstructive)(
                                                                                (currentScoreRef.value + additionalScoreRef.value | 0) < currentDifficulty
                                                                            )(function () {
                                                                                return applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                                    StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(100 * (reverseIndex + 1 | 0) | 0))(additionalScoreRef)
                                                                                )(),
                                                                                    applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                                        StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(1))(additionalCountRef)
                                                                                    )();
                                                                            })();
                                                                        };
                                                                    })() :
                                                                        function () {
                                                                            return applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                                StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(
                                                                                    ((100 * (reverseIndex + 1 | 0) | 0) * problemData[reverseIndex].valueOne | 0) + problemData[reverseIndex].valueTwo | 0
                                                                                ))(additionalScoreRef)
                                                                            )(),
                                                                                applicationUtilities["Data.Mapper"].discardResult(StatefulInternalModule.statefulMapper)(
                                                                                    StatefulInternalModule.updateState(applicationUtilities["Data.Algebra"].performAddition(applicationUtilities["Data.Algebra"].integerAlgebra)(problemData[reverseIndex].valueOne))(additionalCountRef)
                                                                                )();
                                                                        }()
                                                                )();
                                                            })();
                                                        })(),
                                                            solvedCountRef.value + additionalCountRef.value | 0;
                                                    }();

                                                    minSolvedCount.value = OrderingModule.minimumElement(OrderingModule.integerOrdering)(remainingProblemsSolution)(minSolvedCount.value);
                                                };
                                            })();
                                            return minSolvedCount.value;
                                        })(initialParams.valueOne, scoreValuePairs)
                                    ) + "\n"
                                );
                            });
                        })
                    );
                };

            // Defines the main program execution flow.
            var mainProgramExecution = AsyncModule.executeAsyncAndDiscard(
                SequencingModule.sequenceOperations(AsyncModule.asyncSequencing)(readInputAsyncOperation)(function (inputText) {
                    return SequencingModule.sequenceOperations(AsyncModule.asyncSequencing)(
                        ConstructiveModule.constructValue(AsyncModule.asyncConstructive)(solveProblemFunction(inputText))
                    )(function (outputString) {
                        return SyncInterfaceModule.liftSync(AsyncModule.asyncSyncMonad)(
                            applicationUtilities["Data.Mapper"].discardResult(EffectModule.operationMapper)(
                                StreamModule.writeStreamString(ProcessModule.standardOutput)(EncodingModule.Utf8Encoding.value)(outputString)(
                                    ConstructiveModule.constructValue(EffectModule.operationConstructive)(SingletonModule.singletonValue)
                                )
                            )
                        );
                    });
                })
            );

            targetModule.mainProgram = mainProgramExecution;
            targetModule.solveProblem = solveProblemFunction;
        }(applicationUtilities.CompetitiveProgrammingSolver = applicationUtilities.CompetitiveProgrammingSolver || {}),
            applicationUtilities.CompetitiveProgrammingSolver.mainProgram(); // Immediately execute the main program.
}, {}], ["AppEntry"], null);