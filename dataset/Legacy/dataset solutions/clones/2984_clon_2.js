/*
 * This is a custom module loading system, similar to Parcel's internal mechanism.
 * It manages module definitions, caching, and dependency resolution.
 */
moduleLoader = function(moduleDefinitions, loadedCache, entryPoints, globalExportID) {
    // Variable to hold any exceptions encountered during module loading.
    var exceptionRecord;
    // Check if there's an existing Parcel-like require function.
    var priorResolverFunc = "function" == typeof parcelRequire && parcelRequire;
    // Check for Node.js commonJS require.
    var nodeRequireFunc = "function" == typeof require && require;

    /**
     * Resolves and loads a module.
     * @param {string} modulePath - The path or ID of the module to load.
     * @param {boolean} isRecursiveCall - Internal flag for recursive calls.
     * @returns {object} The exports of the loaded module.
     */
    function moduleProcessor(modulePath, isRecursiveCall) {
        // If the module is already in the cache, return its exports.
        if (!loadedCache[modulePath]) {
            // If the module definition isn't available, try external loaders.
            if (!moduleDefinitions[modulePath]) {
                // Attempt to use a global Parcel-like resolver if available.
                var globalResolver = "function" == typeof parcelRequire && parcelRequire;
                if (!isRecursiveCall && globalResolver) return globalResolver(modulePath, true);
                // Fallback to the prior resolver function.
                if (priorResolverFunc) return priorResolverFunc(modulePath, true);
                // Fallback to Node.js require if it's a string path.
                if (nodeRequireFunc && "string" == typeof modulePath) return nodeRequireFunc(modulePath);

                // If all attempts fail, throw a module not found error.
                var loadFailure = new Error("Cannot locate module with identifier '" + modulePath + "'");
                throw loadFailure.code = "MODULE_NOT_FOUND", loadFailure;
            }

            // Prepare a module requester with resolution capabilities.
            dependencyLoader.resolve = function(relativeId) {
                return moduleDefinitions[modulePath][1][relativeId] || relativeId;
            };
            dependencyLoader.cache = {}; // Initialize module-specific cache.

            // Create a new module instance and add to cache.
            var moduleInstance = loadedCache[modulePath] = new moduleProcessor.Module(modulePath);
            // Execute the module's code, populating its exports.
            moduleDefinitions[modulePath][0].call(moduleInstance.exports, dependencyLoader, moduleInstance, moduleInstance.exports, this);
        }
        return loadedCache[modulePath].exports;

        /**
         * Function to request a dependency within a module.
         * @param {string} dependencyId - The ID of the dependency to load.
         * @returns {object} The exports of the requested dependency.
         */
        function dependencyLoader(dependencyId) {
            return moduleProcessor(dependencyLoader.resolve(dependencyId));
        }
    }

    // Mark this function as a Parcel-style require.
    moduleProcessor.isParcelRequire = true;
    // Define the Module constructor for consistency.
    moduleProcessor.Module = function(moduleIdentifier) {
        this.id = moduleIdentifier;
        this.bundle = moduleProcessor;
        this.exports = {};
    };
    // Store module definitions and cache.
    moduleProcessor.modules = moduleDefinitions;
    moduleProcessor.cache = loadedCache;
    moduleProcessor.parent = priorResolverFunc;
    // Register a new module definition dynamically.
    moduleProcessor.register = function(moduleIdentifier, moduleContent) {
        moduleDefinitions[moduleIdentifier] = [function(moduleExports, moduleInstance) {
            moduleInstance.exports = moduleContent;
        }, {}];
    };

    // Process all entry points.
    for (var currentEntryIndex = 0; currentEntryIndex < entryPoints.length; currentEntryIndex++) {
        try {
            moduleProcessor(entryPoints[currentEntryIndex]);
        } catch (loadError) {
            // Record the first error encountered.
            exceptionRecord = exceptionRecord || loadError;
        }
    }

    // If there are entry points, handle the final export.
    if (entryPoints.length) {
        var finalExport = moduleProcessor(entryPoints[entryPoints.length - 1]);
        // Handle different export environments (CommonJS, AMD, global).
        if ("object" == typeof exports && "undefined" != typeof module) {
            module.exports = finalExport;
        } else if ("function" == typeof define && define.amd) {
            define(function() { return finalExport; });
        } else if (globalExportID) {
            this[globalExportID] = finalExport;
        }
    }

    // Set the global parcelRequire (now moduleLoader) to this instance.
    if (moduleLoader = moduleProcessor, exceptionRecord) throw exceptionRecord;
    // Return the main module processor function.
    return moduleProcessor;
}({
    // Start of the actual application code definitions.
    "Focm": [function(requestedModule, currentModule, currentExports) {
        // Main application scope object for namespaces.
        var sharedModuleStore = {};

        // Define Control.Composition module.
        !function(currentScope) {
            "use strict";
            // Helper for function composition.
            var compositionType = function(func) { this.compose = func; };
            // Instance of composition for functions.
            var functionComposer = new compositionType(function(f1) {
                return function(f2) {
                    return function(arg) {
                        return f1(f2(arg));
                    };
                };
            });
            // Export composition tools.
            currentScope.functionComposition = function(obj) { return obj.compose; };
            currentScope.CompositionBase = compositionType;
            currentScope.compositionFunctionHandler = functionComposer;
        }(sharedModuleStore["Control.Composition"] = sharedModuleStore["Control.Composition"] || {});

        // Define Control.Grouping module.
        !function(currentScope) {
            "use strict";
            var compositionRef = sharedModuleStore["Control.Composition"];
            // Type for categories.
            var groupingType = function(base, idFunc) { this.CompositionBase0 = base; this.identity = idFunc; };
            // Instance of grouping for functions.
            var functionGrouping = new groupingType(function() { return compositionRef.compositionFunctionHandler; }, function(arg) { return arg; });
            currentScope.Grouping = groupingType;
            currentScope.identity = function(obj) { return obj.identity; };
            currentScope.groupingFunctionHandler = functionGrouping;
        }(sharedModuleStore["Control.Grouping"] = sharedModuleStore["Control.Grouping"] || {});

        // Define Data.Equivalence module.
        !function(currentScope) {
            "use strict";
            // Reference equality check.
            (sharedModuleStore["Data.Equivalence"] = sharedModuleStore["Data.Equivalence"] || {}).referenceEquality = function(val1) {
                return function(val2) {
                    return val1 === val2;
                };
            };
        }();

        // Define Data.Atomic module.
        !function(currentScope) {
            "use strict";
            // The unit value.
            (sharedModuleStore["Data.Atomic"] = sharedModuleStore["Data.Atomic"] || {}).unitValue = {};
        }();

        // Define Data.Display module (for showing values).
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Data.Display"] = sharedModuleStore["Data.Display"] || {}).showIntegerImplementation = function(num) { return num.toString(); };
        }();

        // Define Data.Display module, part 2.
        !function(currentScope) {
            "use strict";
            var displayRef = sharedModuleStore["Data.Display"];
            // Placeholder for other modules.
            var symbolRef = (sharedModuleStore["Data.Symbol"], sharedModuleStore["Record.Unsafe"], sharedModuleStore["Type.Data.RowList"], function(func) { this.display = func; });
            var integerDisplayInstance = new symbolRef(displayRef.showIntegerImplementation);
            currentScope.Display = symbolRef;
            currentScope.display = function(obj) { return obj.display; };
            currentScope.displayInteger = integerDisplayInstance;
        }(sharedModuleStore["Data.Display"] = sharedModuleStore["Data.Display"] || {});

        // Define Data.Atomic module, part 2.
        !function(currentScope) {
            "use strict";
            var atomicRef = sharedModuleStore["Data.Atomic"];
            sharedModuleStore["Data.Display"];
            currentScope.atomicValue = atomicRef.unitValue;
        }(sharedModuleStore["Data.Atomic"] = sharedModuleStore["Data.Atomic"] || {});

        // Define Data.Equivalence module, part 2.
        !function(currentScope) {
            "use strict";
            var equivalenceRef = sharedModuleStore["Data.Equivalence"];
            // Placeholder for other modules.
            var heytingRef = (sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Symbol"], sharedModuleStore["Data.Atomic"], sharedModuleStore["Data.Void"], sharedModuleStore["Record.Unsafe"], sharedModuleStore["Type.Data.RowList"], function(func) { this.eq = func; });
            var integerEquivalenceInstance = new heytingRef(equivalenceRef.referenceEquality);
            currentScope.Equivalence = heytingRef;
            currentScope.eq = function(obj) { return obj.eq; };
            currentScope.eqInteger = integerEquivalenceInstance;
        }(sharedModuleStore["Data.Equivalence"] = sharedModuleStore["Data.Equivalence"] || {});

        // Define Data.Ordering.Raw module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Data.Ordering.Raw"] = sharedModuleStore["Data.Ordering.Raw"] || {}).rawCompareImplementation = function(less) {
                return function(equal) {
                    return function(greater) {
                        return function(valA) {
                            return function(valB) {
                                return valA < valB ? less : valA === valB ? equal : greater;
                            };
                        };
                    };
                };
            };
        }();

        // Define Data.Combiner module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Data.Semigroup"], sharedModuleStore["Data.Symbol"], sharedModuleStore["Data.Atomic"], sharedModuleStore["Data.Void"], sharedModuleStore["Record.Unsafe"], sharedModuleStore["Type.Data.RowList"];
            currentScope.Combiner = function(func) { this.append = func; };
            currentScope.append = function(obj) { return obj.append; };
        }(sharedModuleStore["Data.Combiner"] = sharedModuleStore["Data.Combiner"] || {});

        // Define Data.Sequence module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Display"];
            // Enum for Less Than.
            var lessThanEnum = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Enum for Greater Than.
            var greaterThanEnum = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Enum for Equal.
            var equalEnum = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            currentScope.LessThan = lessThanEnum;
            currentScope.GreaterThan = greaterThanEnum;
            currentScope.Equal = equalEnum;
        }(sharedModuleStore["Data.Sequence"] = sharedModuleStore["Data.Sequence"] || {});

        // Define Data.Ordering.Raw module, part 2.
        !function(currentScope) {
            "use strict";
            var rawOrdering = sharedModuleStore["Data.Ordering.Raw"];
            var sequenceRef = sharedModuleStore["Data.Sequence"];
            var unsafeCompareFunc = rawOrdering.rawCompareImplementation(sequenceRef.LessThan.value)(sequenceRef.Equal.value)(sequenceRef.GreaterThan.value);
            currentScope.unsafeCompare = unsafeCompareFunc;
        }(sharedModuleStore["Data.Ordering.Raw"] = sharedModuleStore["Data.Ordering.Raw"] || {});

        // Define Data.Ordering module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Data.Ord"];
            var equivalenceRef = sharedModuleStore["Data.Equivalence"];
            var rawOrdering = sharedModuleStore["Data.Ordering.Raw"];
            var sequenceRef = sharedModuleStore["Data.Sequence"];
            // Placeholder for other modules.
            var ringRef = (sharedModuleStore["Data.Ring"], sharedModuleStore["Data.Semiring"], sharedModuleStore["Data.Symbol"], sharedModuleStore["Data.Atomic"], sharedModuleStore["Data.Void"], sharedModuleStore["Record.Unsafe"], sharedModuleStore["Type.Data.RowList"], function(eqInst, cmpFunc) { this.Equivalence0 = eqInst; this.compare = cmpFunc; });
            var integerOrderingInstance = new ringRef(function() { return equivalenceRef.eqInteger; }, rawOrdering.unsafeCompare);
            var getCompareFunc = function(obj) { return obj.compare; };
            currentScope.Ordering = ringRef;
            currentScope.compare = getCompareFunc;
            currentScope.minimum = function(orderingInst) {
                return function(valA) {
                    return function(valB) {
                        var comparisonResult = getCompareFunc(orderingInst)(valA)(valB);
                        if (comparisonResult instanceof sequenceRef.LessThan) return valA;
                        if (comparisonResult instanceof sequenceRef.Equal) return valA;
                        if (comparisonResult instanceof sequenceRef.GreaterThan) return valB;
                        // Error for exhaustive pattern match.
                        throw new Error("Pattern match failure in Data.Ordering (min function): " + [comparisonResult.constructor.name]);
                    };
                };
            };
            currentScope.maximum = function(orderingInst) {
                return function(valA) {
                    return function(valB) {
                        var comparisonResult = getCompareFunc(orderingInst)(valA)(valB);
                        if (comparisonResult instanceof sequenceRef.LessThan) return valB;
                        if (comparisonResult instanceof sequenceRef.Equal) return valA;
                        if (comparisonResult instanceof sequenceRef.GreaterThan) return valA;
                        // Error for exhaustive pattern match.
                        throw new Error("Pattern match failure in Data.Ordering (max function): " + [comparisonResult.constructor.name]);
                    };
                };
            };
            currentScope.orderingInteger = integerOrderingInstance;
        }(sharedModuleStore["Data.Ordering"] = sharedModuleStore["Data.Ordering"] || {});

        // Define Data.Operation module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Grouping"], sharedModuleStore["Data.Boolean"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Ring"];
            currentScope.flip = function(func) {
                return function(arg2) {
                    return function(arg1) {
                        return func(arg1)(arg2);
                    };
                };
            };
            currentScope.constant = function(val) {
                return function(ignore) {
                    return val;
                };
            };
        }(sharedModuleStore["Data.Operation"] = sharedModuleStore["Data.Operation"] || {});

        // Define Data.Mapper module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Data.Functor"], sharedModuleStore["Control.Composition"];
            var operationRef = sharedModuleStore["Data.Operation"];
            var atomicRef = sharedModuleStore["Data.Atomic"];
            var getMapFunc = function(obj) { return obj.map; };
            currentScope.Mapper = function(func) { this.map = func; };
            currentScope.map = getMapFunc;
            currentScope.voidMap = function(mapperInst) {
                return getMapFunc(mapperInst)(operationRef.constant(atomicRef.atomicValue));
            };
        }(sharedModuleStore["Data.Mapper"] = sharedModuleStore["Data.Mapper"] || {});

        // Define Control.Application module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Application"];
            var groupingRef = sharedModuleStore["Control.Grouping"];
            var operationRef = sharedModuleStore["Data.Operation"];
            var mapperRef = sharedModuleStore["Data.Mapper"];
            var getApplyFunc = function(obj) { return obj.apply; };
            currentScope.Application = function(mapperInst, applyFunc) { this.Mapper0 = mapperInst; this.apply = applyFunc; };
            currentScope.apply = getApplyFunc;
            currentScope.applySequentially = function(applyInst) {
                return function(funcContainer) {
                    return function(valueContainer) {
                        return getApplyFunc(applyInst)(mapperRef.map(applyInst.Mapper0())(operationRef.constant(groupingRef.identity(groupingRef.groupingFunctionHandler)))(funcContainer))(valueContainer);
                    };
                };
            };
        }(sharedModuleStore["Control.Application"] = sharedModuleStore["Control.Application"] || {});

        // Define Control.Applier module.
        !function(currentScope) {
            "use strict";
            var applicationRef = sharedModuleStore["Control.Application"];
            // Placeholder for other modules.
            var functorRef = (sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Atomic"], function(applyInst, pureFunc) { return this.Application0 = applyInst, this.pure = pureFunc; });
            var getPureFunc = function(obj) { return obj.pure; };
            currentScope.Applier = functorRef;
            currentScope.pure = getPureFunc;
            currentScope.liftApplication1 = function(applierInst) {
                return function(func) {
                    return function(value) {
                        return applicationRef.apply(applierInst.Application0())(getPureFunc(applierInst)(func))(value);
                    };
                };
            };
        }(sharedModuleStore["Control.Applier"] = sharedModuleStore["Control.Applier"] || {});

        // Define Control.Chainer module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Application"];
            var groupingRef = sharedModuleStore["Control.Grouping"];
            var operationRef = sharedModuleStore["Data.Operation"];
            // Placeholder for other modules.
            var mapperRef = (sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Atomic"], function(applyInst, bindFunc) { this.Application0 = applyInst; this.bind = bindFunc; });
            var getBindFunc = function(obj) { return obj.bind; };
            var bindFlippedFunc = function(bindInst) { return operationRef.flip(getBindFunc(bindInst)); };
            currentScope.Chainer = mapperRef;
            currentScope.bind = getBindFunc;
            currentScope.bindFlipped = bindFlippedFunc;
            currentScope.composeKleisliFlipped = function(bindInst) {
                return function(func1) {
                    return function(func2) {
                        return function(arg) {
                            return bindFlippedFunc(bindInst)(func1)(func2(arg));
                        };
                    };
                };
            };
        }(sharedModuleStore["Control.Chainer"] = sharedModuleStore["Control.Chainer"] || {});

        // Define Control.Workflow module.
        !function(currentScope) {
            "use strict";
            var applierRef = sharedModuleStore["Control.Applier"];
            var applicationRef = (sharedModuleStore["Control.Application"], sharedModuleStore["Control.Chainer"]);
            sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Atomic"];
            currentScope.Workflow = function(applierInst, chainerInst) { this.Applier0 = applierInst; this.Chainer1 = chainerInst; };
            currentScope.ap = function(workflowInst) {
                return function(funcContainer) {
                    return function(valueContainer) {
                        return applicationRef.bind(workflowInst.Chainer1())(funcContainer)(function(func) {
                            return applicationRef.bind(workflowInst.Chainer1())(valueContainer)(function(val) {
                                return applierRef.pure(workflowInst.Applier0())(func(val));
                            });
                        });
                    };
                };
            };
        }(sharedModuleStore["Control.Workflow"] = sharedModuleStore["Control.Workflow"] || {});

        // Define Data.Aggregator module.
        !function(currentScope) {
            "use strict";
            currentScope.foldRightArray = function(func) {
                return function(initialVal) {
                    return function(arr) {
                        for (var currentVal = initialVal, idx = arr.length - 1; idx >= 0; idx--) {
                            currentVal = func(arr[idx])(currentVal);
                        }
                        return currentVal;
                    };
                };
            };
            currentScope.foldLeftArray = function(func) {
                return function(initialVal) {
                    return function(arr) {
                        for (var currentVal = initialVal, arrLength = arr.length, idx = 0; idx < arrLength; idx++) {
                            currentVal = func(currentVal)(arr[idx]);
                        }
                        return currentVal;
                    };
                };
            };
        }(sharedModuleStore["Data.Aggregator"] = sharedModuleStore["Data.Aggregator"] || {});

        // Define Data.CombinableIdentity module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Data.Boolean"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.EuclideanRing"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Symbol"], sharedModuleStore["Data.Atomic"], sharedModuleStore["Record.Unsafe"], sharedModuleStore["Type.Data.RowList"];
            currentScope.CombinableIdentity = function(combinerInst, identityVal) { this.Combiner0 = combinerInst; this.identityValue = identityVal; };
            currentScope.identityValue = function(obj) { return obj.identityValue; };
        }(sharedModuleStore["Data.CombinableIdentity"] = sharedModuleStore["Data.CombinableIdentity"] || {});

        // Define Data.Optional module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Alt"], sharedModuleStore["Control.Alternative"], sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Application"], sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Grouping"], sharedModuleStore["Control.Extend"], sharedModuleStore["Control.Workflow"], sharedModuleStore["Control.MonadZero"], sharedModuleStore["Control.Plus"], sharedModuleStore["Data.Bounded"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Operation"], sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Functor.Invariant"], sharedModuleStore["Data.CombinableIdentity"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Display"], sharedModuleStore["Data.Atomic"], sharedModuleStore.Prelude;
            // Nothing constructor.
            var nothingConstructor = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Just constructor.
            var justConstructor = function() { function Constructor(val) { this.value0 = val; } return Constructor.create = function(val) { return new Constructor(val); }, Constructor; }();
            currentScope.Nothing = nothingConstructor;
            currentScope.Just = justConstructor;
            currentScope.handleOptional = function(onNothing) {
                return function(onJust) {
                    return function(optionalVal) {
                        if (optionalVal instanceof nothingConstructor) return onNothing;
                        if (optionalVal instanceof justConstructor) return onJust(optionalVal.value0);
                        // Error for exhaustive pattern match.
                        throw new Error("Pattern match failure in Data.Optional (handleOptional function): " + [onNothing.constructor.name, onJust.constructor.name, optionalVal.constructor.name]);
                    };
                };
            };
        }(sharedModuleStore["Data.Optional"] = sharedModuleStore["Data.Optional"] || {});

        // Define Data.Aggregator module, part 2.
        !function(currentScope) {
            "use strict";
            var aggregatorRef = sharedModuleStore["Data.Aggregator"];
            // Placeholder for many control/data modules.
            var applicativeRef = (sharedModuleStore["Control.Alt"], sharedModuleStore["Control.Applier"]);
            var applyRef = sharedModuleStore["Control.Application"];
            var bindRef = (sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Grouping"], sharedModuleStore["Control.Plus"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Operation"], sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Maybe.First"], sharedModuleStore["Data.Maybe.Last"], sharedModuleStore["Data.CombinableIdentity"]);
            var semigroupRef = (sharedModuleStore["Data.Monoid.Additive"], sharedModuleStore["Data.Monoid.Conj"], sharedModuleStore["Data.Monoid.Disj"], sharedModuleStore["Data.Monoid.Dual"], sharedModuleStore["Data.Monoid.Endo"], sharedModuleStore["Data.Monoid.Multiplicative"], sharedModuleStore["Data.Newtype"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Combiner"]);
            var atomicRef = (sharedModuleStore["Data.Semiring"], sharedModuleStore["Data.Atomic"]);
            var preludeRef = (sharedModuleStore.Prelude, function(foldMapFn, foldLeftFn, foldRightFn) { this.foldMap = foldMapFn; this.foldl = foldLeftFn; this.foldr = foldRightFn; });
            var getFoldRightFunc = function(obj) { return obj.foldr; };
            var getFoldLeftFunc = function(obj) { return obj.foldl; };
            var defaultFoldMap = function(aggregatorInst) {
                return function(monoidInst) {
                    return function(source) {
                        return getFoldRightFunc(aggregatorInst)(function(item) {
                            return function(accumulator) {
                                return semigroupRef.append(monoidInst.Combiner0())(source(item))(accumulator);
                            };
                        })(bindRef.identityValue(monoidInst));
                    };
                };
            };
            var arrayAggregatorInstance = new preludeRef(function(monoidInst) { return defaultFoldMap(arrayAggregatorInstance)(monoidInst); }, aggregatorRef.foldLeftArray, aggregatorRef.foldRightArray);
            currentScope.Aggregator = preludeRef;
            currentScope.foldRight = getFoldRightFunc;
            currentScope.foldLeft = function(obj) { return obj.foldl; };
            currentScope.foldMap = function(obj) { return obj.foldMap; };
            currentScope.foldMapDefaultRight = defaultFoldMap;
            currentScope.traverseVoid = function(applicativeInst) {
                return function(aggregatorInst) {
                    return function(transformFunc) {
                        return getFoldRightFunc(aggregatorInst)(function(item) {
                            return applyRef.applySequentially(applicativeInst.Application0())(transformFunc(item));
                        })(applicativeRef.pure(applicativeInst)(atomicRef.atomicValue));
                    };
                };
            };
            currentScope.arrayAggregator = arrayAggregatorInstance;
        }(sharedModuleStore["Data.Aggregator"] = sharedModuleStore["Data.Aggregator"] || {});

        // Define Data.Choice module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Alt"];
            var applierRef = sharedModuleStore["Control.Applier"];
            var applyRef = sharedModuleStore["Control.Application"];
            var chainerRef = sharedModuleStore["Control.Chainer"];
            // Placeholder for many control/data modules.
            var extendRef = (sharedModuleStore["Control.Extend"], sharedModuleStore["Control.Workflow"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Bifoldable"], sharedModuleStore["Data.Bifunctor"], sharedModuleStore["Data.Bitraversable"], sharedModuleStore["Data.Bounded"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Aggregator"], sharedModuleStore["Data.Operation"], sharedModuleStore["Data.Mapper"]);
            var invariantRef = (sharedModuleStore["Data.Functor.Invariant"], sharedModuleStore["Data.FunctorWithIndex"], sharedModuleStore["Data.Optional"]);
            var monoidRef = (sharedModuleStore["Data.CombinableIdentity"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Display"], sharedModuleStore["Data.Traversable"], sharedModuleStore["Data.TraversableWithIndex"], sharedModuleStore["Data.Atomic"], sharedModuleStore.Prelude, function() { function Constructor(val) { this.value0 = val; } return Constructor.create = function(val) { return new Constructor(val); }, Constructor; }());
            var rightConstructor = function() { function Constructor(val) { this.value0 = val; } return Constructor.create = function(val) { return new Constructor(val); }, Constructor; }();
            var choiceMapperInstance = new extendRef.Mapper(function(transformFunc) {
                return function(choiceVal) {
                    if (choiceVal instanceof monoidRef) return new monoidRef(choiceVal.value0);
                    if (choiceVal instanceof rightConstructor) return extendRef.map(choiceMapperInstance)(transformFunc)(choiceVal.value0);
                    // Error for exhaustive pattern match.
                    throw new Error("Pattern match failure in Data.Choice (choiceMapperInstance): " + [choiceVal.constructor.name]);
                };
            });
            var handleChoice = function(onLeft) {
                return function(onRight) {
                    return function(choiceVal) {
                        if (choiceVal instanceof monoidRef) return onLeft(choiceVal.value0);
                        if (choiceVal instanceof rightConstructor) return onRight(choiceVal.value0);
                        // Error for exhaustive pattern match.
                        throw new Error("Pattern match failure in Data.Choice (handleChoice): " + [onLeft.constructor.name, onRight.constructor.name, choiceVal.constructor.name]);
                    };
                };
            };
            var choiceApplyInstance = new applyRef.Application(function() { return choiceMapperInstance; }, function(funcChoice) {
                return function(valChoice) {
                    if (funcChoice instanceof monoidRef) return new monoidRef(funcChoice.value0);
                    if (funcChoice instanceof rightConstructor) return extendRef.map(choiceMapperInstance)(funcChoice.value0)(valChoice);
                    // Error for exhaustive pattern match.
                    throw new Error("Pattern match failure in Data.Choice (choiceApplyInstance): " + [funcChoice.constructor.name, valChoice.constructor.name]);
                };
            });
            var choiceBindInstance = new chainerRef.Chainer(function() { return choiceApplyInstance; }, handleChoice(function(val) {
                return function(func) { return new monoidRef(val); };
            })(function(val) {
                return function(func) { return func(val); };
            }));
            var choiceApplierInstance = new applierRef.Applier(function() { return choiceApplyInstance; }, rightConstructor.create);
            currentScope.Left = monoidRef;
            currentScope.Right = rightConstructor;
            currentScope.either = handleChoice;
            currentScope.note = function(msg) {
                return invariantRef.handleOptional(new monoidRef(msg))(rightConstructor.create);
            };
            currentScope.mapperChoice = choiceMapperInstance;
            currentScope.applyChoice = choiceApplyInstance;
            currentScope.applierChoice = choiceApplierInstance;
            currentScope.chainerChoice = choiceBindInstance;
        }(sharedModuleStore["Data.Choice"] = sharedModuleStore["Data.Choice"] || {});

        // Define Operation module.
        !function(currentScope) {
            "use strict";
            currentScope.pureEffect = function(val) { return function() { return val; }; };
            currentScope.bindEffect = function(eff) { return function(func) { return function() { return func(eff())(); }; }; };
        }(sharedModuleStore.Operation = sharedModuleStore.Operation || {});

        // Define Operation module, part 2 (Effect instance for Monad).
        !function(currentScope) {
            "use strict";
            var operationRef = sharedModuleStore.Operation;
            var applierRef = sharedModuleStore["Control.Applier"];
            var applicationRef = sharedModuleStore["Control.Application"];
            var chainerRef = sharedModuleStore["Control.Chainer"];
            var workflowRef = sharedModuleStore["Control.Workflow"];
            var mapperRef = sharedModuleStore["Data.Mapper"];
            // Placeholder for other modules.
            var monoidRef = (sharedModuleStore["Data.CombinableIdentity"], sharedModuleStore["Data.Combiner"], sharedModuleStore.Prelude, new workflowRef.Workflow(function() { return effectApplierInstance; }, function() { return effectChainerInstance; }));
            var effectChainerInstance = new chainerRef.Chainer(function() { return effectApplyInstance; }, operationRef.bindEffect);
            var effectApplyInstance = new applicationRef.Application(function() { return effectMapperInstance; }, workflowRef.ap(monoidRef));
            var effectApplierInstance = new applierRef.Applier(function() { return effectApplyInstance; }, operationRef.pureEffect);
            var effectMapperInstance = new mapperRef.Mapper(applierRef.liftApplication1(effectApplierInstance));
            currentScope.mapperOperation = effectMapperInstance;
            currentScope.applyOperation = effectApplyInstance;
            currentScope.applierOperation = effectApplierInstance;
            currentScope.chainerOperation = effectChainerInstance;
            currentScope.workflowOperation = monoidRef;
        }(sharedModuleStore.Operation = sharedModuleStore.Operation || {});

        // Define Operation.Reference module.
        !function(currentScope) {
            "use strict";
            currentScope.createNewRef = function(initialVal) { return function() { return { value: initialVal }; }; };
            currentScope.readRef = function(ref) { return function() { return ref.value; }; };
            currentScope.writeRef = function(ref) { return function(newVal) { return function() { return ref.value = newVal, {}; }; }; };
        }(sharedModuleStore["Operation.Reference"] = sharedModuleStore["Operation.Reference"] || {});

        // Define Operation.Reference module, part 2.
        !function(currentScope) {
            "use strict";
            var refOperations = sharedModuleStore["Operation.Reference"];
            sharedModuleStore["Data.Operation"], sharedModuleStore["Data.Mapper"], sharedModuleStore.Operation, sharedModuleStore.Prelude;
            currentScope.createNew = refOperations.createNewRef;
            currentScope.read = refOperations.readRef;
            currentScope.write = refOperations.writeRef;
        }(sharedModuleStore["Operation.Reference"] = sharedModuleStore["Operation.Reference"] || {});

        // Define Partial.Dangerous module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Partial.Dangerous"] = sharedModuleStore["Partial.Dangerous"] || {}).unsafePartial = function(func) { return func(); };
        }();

        // Define Partial.Functions module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Partial.Functions"] = sharedModuleStore["Partial.Functions"] || {}).crashWithMessage = function() { return function(msg) { throw new Error(msg); }; };
        }();

        // Define Partial.Functions module, part 2.
        !function(currentScope) {
            "use strict";
            var partialRef = sharedModuleStore["Partial.Functions"];
            currentScope.crashWithMessage = partialRef.crashWithMessage;
        }(sharedModuleStore["Partial.Functions"] = sharedModuleStore["Partial.Functions"] || {});

        // Define Partial.Dangerous module, part 2.
        !function(currentScope) {
            "use strict";
            var dangerousRef = sharedModuleStore["Partial.Dangerous"];
            var partialRef = sharedModuleStore["Partial.Functions"];
            currentScope.unsafeCrashWithMessage = function(msg) {
                return dangerousRef.unsafePartial(function(func) { return partialRef.crashWithMessage(func)(msg); });
            };
        }(sharedModuleStore["Partial.Dangerous"] = sharedModuleStore["Partial.Dangerous"] || {});

        // Define Control.Workflow.Recursive module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Workflow"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Bifunctor"], sharedModuleStore["Data.Choice"], sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Identity"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Atomic"], sharedModuleStore.Operation, sharedModuleStore["Operation.Reference"], sharedModuleStore["Partial.Dangerous"], sharedModuleStore.Prelude;
            // Loop constructor.
            var loopConstructor = function() { function Constructor(val) { this.value0 = val; } return Constructor.create = function(val) { return new Constructor(val); }, Constructor; }();
            // Done constructor.
            var doneConstructor = function() { function Constructor(val) { this.value0 = val; } return Constructor.create = function(val) { return new Constructor(val); }, Constructor; }();
            currentScope.Loop = loopConstructor;
            currentScope.Done = doneConstructor;
            currentScope.tailRecurse = function(stepFunc) {
                return function(initialState) {
                    return function(unusedMonadWrapper) { // This parameter is unused, matching the minified code's `t`
                        var currentRecursiveState = initialState; // The state that changes in the loop.
                        var finalResultValue; // Stores the result if Done.
                        var isDoneFlag = false; // Flag to exit the loop.

                        // Loop until a Done constructor is returned.
                        for (; !isDoneFlag;) {
                            var stepOutput = stepFunc(currentRecursiveState); // Apply the step function to the current state.
                            if (!(stepOutput instanceof loopConstructor)) {
                                if (stepOutput instanceof doneConstructor) {
                                    isDoneFlag = true; // Mark as done.
                                    finalResultValue = stepOutput.value0; // Store the final result.
                                    break; // Exit the loop.
                                }
                                throw new Error("Pattern match failure in Control.Workflow.Recursive (tailRecurse loop): " + [stepOutput.constructor.name]);
                            }
                            // If it's a Loop, update the state for the next iteration.
                            currentRecursiveState = stepOutput.value0;
                        }
                        return finalResultValue; // Return the final value.
                    }(initialState); // The `(n(t))` at the end of the original `tailRec` function in the minified code.
                };
            };
        }(sharedModuleStore["Control.Workflow.Recursive"] = sharedModuleStore["Control.Workflow.Recursive"] || {});

        // Define Operation.Interface module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Grouping"], sharedModuleStore["Control.Workflow"], sharedModuleStore.Operation;
            currentScope.liftOperation = function(obj) { return obj.liftEffect; };
            currentScope.WorkflowInterface = function(workflowInst, liftFunc) { this.Workflow0 = workflowInst; this.liftEffect = liftFunc; };
        }(sharedModuleStore["Operation.Interface"] = sharedModuleStore["Operation.Interface"] || {});

        // Define Control.Concurrency.Interface module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Alt"], sharedModuleStore["Control.Alternative"], sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Application"], sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Monad.Cont.Trans"], sharedModuleStore["Control.Monad.Except.Trans"], sharedModuleStore["Control.Monad.Maybe.Trans"], sharedModuleStore["Control.Monad.Reader.Trans"], sharedModuleStore["Control.Monad.Writer.Trans"], sharedModuleStore["Control.Plus"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Choice"], sharedModuleStore["Data.Operation"], sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Functor.Compose"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Newtype"], sharedModuleStore["Data.Atomic"], sharedModuleStore["Operation.Interface"], sharedModuleStore["Operation.Reference"], sharedModuleStore.Prelude;
            currentScope.runInParallel = function(obj) { return obj.parallel; };
            currentScope.runSequentially = function(obj) { return obj.sequential; };
            currentScope.ParallelInterface = function(applierInst, workflowInst, parallelFunc, sequentialFunc) { this.Applier1 = applierInst; this.Workflow0 = workflowInst; this.parallel = parallelFunc; this.sequential = sequentialFunc; };
        }(sharedModuleStore["Control.Concurrency.Interface"] = sharedModuleStore["Control.Concurrency.Interface"] || {});

        // Define Control.Concurrency module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Control.Alternative"], sharedModuleStore["Control.Application"];
            var groupingRef = sharedModuleStore["Control.Grouping"];
            var concurrencyInterfaceRef = sharedModuleStore["Control.Concurrency.Interface"];
            var aggregatorRef = (sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Aggregator"]);
            // Placeholder for other modules.
            var traversableRef = (sharedModuleStore["Data.Traversable"], sharedModuleStore.Prelude, function(concurrencyInst) {
                return function(applicativeInst) {
                    return function(transformFunc) {
                        return function(collection) {
                            return concurrencyInterfaceRef.runSequentially(concurrencyInst)(aggregatorRef.traverseVoid(concurrencyInst.Applier1())(applicativeInst)(function(item) {
                                return concurrencyInterfaceRef.runInParallel(concurrencyInst)(transformFunc(item));
                            })(collection));
                        };
                    };
                };
            });
            currentScope.parallelTraverseVoid = traversableRef;
            currentScope.parallelSequenceVoid = function(concurrencyInst) {
                return function(applicativeInst) {
                    return traversableRef(concurrencyInst)(applicativeInst)(groupingRef.identity(groupingRef.groupingFunctionHandler));
                };
            };
        }(sharedModuleStore["Control.Concurrency"] = sharedModuleStore["Control.Concurrency"] || {});

        // Define Data.Collection module.
        !function(currentScope) {
            "use strict";
            currentScope.getLength = function(arr) { return arr.length; };
            currentScope.unconsArray = function(onEmpty) {
                return function(onNonEmpty) {
                    return function(arr) {
                        return 0 === arr.length ? onEmpty({}) : onNonEmpty(arr[0])(arr.slice(1));
                    };
                };
            };
            currentScope.getAtIndexImplementation = function(onJust) {
                return function(onNothing) {
                    return function(arr) {
                        return function(idx) {
                            return idx < 0 || idx >= arr.length ? onNothing : onJust(arr[idx]);
                        };
                    };
                };
            };
            currentScope.sliceArray = function(start) {
                return function(end) {
                    return function(arr) {
                        return arr.slice(start, end);
                    };
                };
            };
        }(sharedModuleStore["Data.Collection"] = sharedModuleStore["Data.Collection"] || {});

        // Define Dangerous.TypeCast module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Dangerous.TypeCast"] = sharedModuleStore["Dangerous.TypeCast"] || {}).unsafeCast = function(val) { return val; };
        }();

        // Define Dangerous.TypeCast module, part 2.
        !function(currentScope) {
            "use strict";
            var unsafeCastRef = sharedModuleStore["Dangerous.TypeCast"];
            currentScope.unsafeCast = unsafeCastRef.unsafeCast;
        }(sharedModuleStore["Dangerous.TypeCast"] = sharedModuleStore["Dangerous.TypeCast"] || {});

        // Define Data.Collection module, part 2.
        !function(currentScope) {
            "use strict";
            var collectionRef = sharedModuleStore["Data.Collection"];
            // Placeholder for many control/data modules.
            var altRef = (sharedModuleStore["Control.Alt"], sharedModuleStore["Control.Alternative"], sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Application"], sharedModuleStore["Control.Chainer"], sharedModuleStore["Control.Grouping"], sharedModuleStore["Control.Lazy"], sharedModuleStore["Control.Workflow.Recursive"], sharedModuleStore["Control.Monad.ST"], sharedModuleStore["Control.Monad.ST.Internal"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Array.NonEmpty.Internal"], sharedModuleStore["Data.Array.ST"], sharedModuleStore["Data.Array.ST.Iterator"], sharedModuleStore["Data.Boolean"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Aggregator"], sharedModuleStore["Data.Operation"]);
            var functorRef = (sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Optional"]);
            var ordRef = (sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Ring"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Semiring"], sharedModuleStore["Data.Traversable"], sharedModuleStore["Data.Tuple"], sharedModuleStore["Data.Unfoldable"], sharedModuleStore["Partial.Dangerous"], sharedModuleStore.Prelude, sharedModuleStore["Dangerous.TypeCast"], collectionRef.unconsArray(altRef.constant(functorRef.Nothing.value))(function(headVal) { return function(tailArr) { return new functorRef.Just({ head: headVal, tail: tailArr }); }; }));
            var indexFunction = collectionRef.getAtIndexImplementation(functorRef.Just.create)(functorRef.Nothing.value);
            currentScope.uncons = ordRef;
            currentScope.index = indexFunction;
            currentScope.length = collectionRef.getLength;
        }(sharedModuleStore["Data.Collection"] = sharedModuleStore["Data.Collection"] || {});

        // Define Data.Integer module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Data.Integer"] = sharedModuleStore["Data.Integer"] || {}).fromStringAsImplementation = function(onSuccess) {
                return function(onFailure) {
                    return function(radix) {
                        return function(str) {
                            var regexPattern;
                            // Determine regex pattern based on radix.
                            regexPattern = radix < 11 ? "[0-" + (radix - 1).toString() + "]" : 11 === radix ? "[0-9a]" : "[0-9a-" + String.fromCharCode(86 + radix) + "]";
                            var fullRegex = new RegExp("^[\\+\\-]?" + regexPattern + "+$", "i");
                            return function(inputString) {
                                // Check if string matches pattern.
                                if (fullRegex.test(inputString)) {
                                    var parsedInt = parseInt(inputString, radix);
                                    // Check if it's a valid integer.
                                    return (0 | parsedInt) === parsedInt ? onSuccess(parsedInt) : onFailure;
                                }
                                return onFailure;
                            };
                        };
                    };
                };
            };
        }();

        // Define Data.Integer module, part 2.
        !function(currentScope) {
            "use strict";
            var integerRef = sharedModuleStore["Data.Integer"];
            // Placeholder for many control/data modules.
            var categoryRef = (sharedModuleStore["Control.Grouping"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Boolean"], sharedModuleStore["Data.Bounded"], sharedModuleStore["Data.CommutativeRing"], sharedModuleStore["Data.DivisionRing"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.EuclideanRing"], sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Int.Bits"], sharedModuleStore["Data.Optional"]);
            var ordRef = (sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Sequence"], sharedModuleStore["Data.Ring"], sharedModuleStore["Data.Semiring"], sharedModuleStore["Data.Display"], sharedModuleStore.Global, sharedModuleStore.Math, sharedModuleStore.Prelude, integerRef.fromStringAsImplementation(categoryRef.Just.create)(categoryRef.Nothing.value));
            var fromStringBase10 = ordRef(10);
            currentScope.fromString = fromStringBase10;
            currentScope.fromStringAs = ordRef;
        }(sharedModuleStore["Data.Integer"] = sharedModuleStore["Data.Integer"] || {});

        // Define Data.Text.Fragments module.
        !function(currentScope) {
            "use strict";
            currentScope.getLength = function(str) { return str.length; };
            currentScope.takeCharacters = function(count) { return function(str) { return str.substr(0, count); }; };
            currentScope.dropCharacters = function(count) { return function(str) { return str.substring(count); }; };
        }(sharedModuleStore["Data.Text.Fragments"] = sharedModuleStore["Data.Text.Fragments"] || {});

        // Define Data.Text.Fragments module, part 2.
        !function(currentScope) {
            "use strict";
            var textFragmentsRef = sharedModuleStore["Data.Text.Fragments"];
            sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Boolean"], sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Operation"], sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.Ring"], sharedModuleStore["Data.Semiring"], sharedModuleStore["Data.String.Pattern"], sharedModuleStore["Data.String.Unsafe"], sharedModuleStore.Prelude;
            currentScope.takeRightCharacters = function(count) {
                return function(str) {
                    return textFragmentsRef.dropCharacters(textFragmentsRef.getLength(str) - count | 0)(str);
                };
            };
            currentScope.take = textFragmentsRef.takeCharacters;
        }(sharedModuleStore["Data.Text.Fragments"] = sharedModuleStore["Data.Text.Fragments"] || {});

        // Define Data.Text.Utilities module.
        !function(currentScope) {
            "use strict";
            currentScope.splitString = function(separator) { return function(str) { return str.split(separator); }; };
            currentScope.trimWhitespace = function(str) { return str.trim(); };
        }(sharedModuleStore["Data.Text.Utilities"] = sharedModuleStore["Data.Text.Utilities"] || {});

        // Define Data.Text.Utilities module, part 2.
        !function(currentScope) {
            "use strict";
            var textUtilitiesRef = sharedModuleStore["Data.Text.Utilities"];
            sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Ordering"], sharedModuleStore["Data.String.Pattern"], sharedModuleStore.Prelude;
            currentScope.split = textUtilitiesRef.splitString;
            currentScope.trim = textUtilitiesRef.trimWhitespace;
        }(sharedModuleStore["Data.Text.Utilities"] = sharedModuleStore["Data.Text.Utilities"] || {});

        // Define Operation.AsyncFlow module.
        !function(currentScope) {
            "use strict";
            var asyncFlowInternal = function() {
                var constructors = {},
                    pureTag = "Pure",
                    throwTag = "Throw",
                    catchTag = "Catch",
                    syncTag = "Sync",
                    asyncTag = "Async",
                    bindTag = "Bind",
                    bracketTag = "Bracket",
                    forkTag = "Fork",
                    sequentialTag = "Sequential",
                    mapTag = "Map",
                    applyTag = "Apply",
                    altTag = "Alt",
                    consTag = "Cons",
                    resumeTag = "Resume",
                    releaseTag = "Release",
                    finalizerTag = "Finalizer",
                    finalizedTag = "Finalized",
                    forkedTag = "Forked";

                function AsyncFlowResult(tag, val1, val2, val3) {
                    this.tag = tag;
                    this._1 = val1;
                    this._2 = val2;
                    this._3 = val3;
                }

                function createTaggedConstructor(tag) {
                    var ctor = function(v1, v2, v3) { return new AsyncFlowResult(tag, v1, v2, v3); };
                    ctor.tag = tag;
                    return ctor;
                }

                function createPureResult(val) { return new AsyncFlowResult(pureTag, val); }

                function reportErrorAsync(errorAction) { try { errorAction(); } catch (err) { setTimeout(function() { throw err; }, 0); } }

                function handleSyncEffect(errorHandler, successHandler, effectFunc) { try { return successHandler(effectFunc()); } catch (err) { return errorHandler(err); } }

                function handleAsyncEffect(errorHandler, successHandler, effectFunc) { try { return successHandler(effectFunc()); } catch (err) { return effectFunc(errorHandler(err))(), createPureResult; } }

                var schedulerQueue = function() {
                    var queueCapacity = 1024,
                        queueSize = 0,
                        queueHead = 0,
                        queueElements = new Array(queueCapacity),
                        isProcessing = false;

                    function drainQueue() {
                        var task;
                        for (isProcessing = true; 0 !== queueSize;) {
                            queueSize--;
                            task = queueElements[queueHead];
                            queueElements[queueHead] = undefined; // Clear reference
                            queueHead = (queueHead + 1) % queueCapacity;
                            task();
                        }
                        isProcessing = false;
                    }

                    return {
                        isDraining: function() { return isProcessing; },
                        enqueueTask: function(task) {
                            var oldIsProcessing;
                            if (queueSize === queueCapacity) {
                                oldIsProcessing = isProcessing;
                                drainQueue();
                                isProcessing = oldIsProcessing;
                            }
                            queueElements[(queueHead + queueSize) % queueCapacity] = task;
                            queueSize++;
                            if (!isProcessing) drainQueue();
                        }
                    };
                }();

                var stateInitial = 0,
                    stateRunning = 1,
                    stateProcessing = 2,
                    stateBinding = 3,
                    stateAsyncWait = 4,
                    stateError = 5,
                    stateComplete = 6;

                function Fiber(resultHandlers, supervisorRef, initialValue) {
                    var currentDepth = 0,
                        currentState = stateInitial,
                        currentResult = initialValue,
                        lastError = null,
                        lastValue = null,
                        currentContinuation = null,
                        continuationStack = null,
                        cleanupStack = null,
                        bracketCount = 0,
                        asyncCallCount = 0,
                        cancelCallbacks = null,
                        rethrowOnError = true; // Renamed 'H' to 'rethrowOnError' for clarity.

                    function executeFiber(execDepth) {
                        var currentFiberAction, nextContinuation, nextCleanup;
                        for (;;) {
                            currentFiberAction = null;
                            nextContinuation = null;
                            nextCleanup = null;

                            switch (currentState) {
                                case stateProcessing:
                                    currentState = stateRunning;
                                    currentResult = continuationStack(currentResult);
                                    if (null === cleanupStack) continuationStack = null;
                                    else {
                                        continuationStack = cleanupStack._1;
                                        cleanupStack = cleanupStack._2;
                                    }
                                    break;
                                case stateBinding:
                                    if (resultHandlers.isLeft(currentResult)) {
                                        currentState = stateError;
                                        lastError = currentResult;
                                        currentResult = null;
                                    } else if (null === continuationStack) {
                                        currentState = stateError;
                                    } else {
                                        currentState = stateProcessing;
                                        currentResult = resultHandlers.fromRight(currentResult);
                                    }
                                    break;
                                case stateRunning:
                                    switch (currentResult.tag) {
                                        case bindTag:
                                            if (continuationStack) {
                                                cleanupStack = new AsyncFlowResult(consTag, continuationStack, cleanupStack);
                                            }
                                            continuationStack = currentResult._2;
                                            currentState = stateRunning;
                                            currentResult = currentResult._1;
                                            break;
                                        case pureTag:
                                            if (null === continuationStack) {
                                                currentState = stateError;
                                                currentResult = resultHandlers.right(currentResult._1);
                                            } else {
                                                currentState = stateProcessing;
                                                currentResult = currentResult._1;
                                            }
                                            break;
                                        case syncTag:
                                            currentState = stateBinding;
                                            currentResult = handleSyncEffect(resultHandlers.left, resultHandlers.right, currentResult._1);
                                            break;
                                        case asyncTag:
                                            currentState = stateAsyncWait;
                                            return void(currentResult = handleAsyncEffect(resultHandlers.left, currentResult._1, function(cancelHandler) {
                                                return function() {
                                                    if (currentDepth === execDepth) {
                                                        currentDepth++;
                                                        schedulerQueue.enqueueTask(function() {
                                                            if (currentDepth === execDepth + 1) {
                                                                currentState = stateBinding;
                                                                currentResult = cancelHandler;
                                                                executeFiber(currentDepth);
                                                            }
                                                        });
                                                    }
                                                };
                                            }));
                                        case throwTag:
                                            currentState = stateError;
                                            lastError = resultHandlers.left(currentResult._1);
                                            currentResult = null;
                                            break;
                                        case catchTag:
                                            cleanupStack = new AsyncFlowResult(consTag, currentResult, null === continuationStack ? cleanupStack : new AsyncFlowResult(consTag, new AsyncFlowResult(resumeTag, continuationStack, cleanupStack), cleanupStack, lastValue), lastValue);
                                            continuationStack = null;
                                            cleanupStack = null;
                                            currentState = stateRunning;
                                            currentResult = currentResult._1;
                                            break;
                                        case bracketTag:
                                            bracketCount++;
                                            cleanupStack = new AsyncFlowResult(consTag, currentResult, null === continuationStack ? cleanupStack : new AsyncFlowResult(consTag, new AsyncFlowResult(resumeTag, continuationStack, cleanupStack), cleanupStack, lastValue), lastValue);
                                            continuationStack = null;
                                            cleanupStack = null;
                                            currentState = stateRunning;
                                            currentResult = currentResult._1;
                                            break;
                                        case forkTag:
                                            currentState = stateBinding;
                                            currentFiberAction = Fiber(resultHandlers, supervisorRef, currentResult._2);
                                            if (supervisorRef) supervisorRef.register(currentFiberAction);
                                            if (currentResult._1) currentFiberAction.start();
                                            currentResult = resultHandlers.right(currentFiberAction);
                                            break;
                                        case sequentialTag:
                                            currentState = stateRunning;
                                            currentResult = convertToSequential(resultHandlers, supervisorRef, currentResult._1);
                                            break;
                                    }
                                    break;
                                case stateError:
                                    continuationStack = null;
                                    cleanupStack = null;
                                    if (null === cleanupStack) {
                                        currentState = stateComplete;
                                        currentResult = lastValue || lastError || currentResult;
                                    } else {
                                        currentFiberAction = cleanupStack._3;
                                        nextContinuation = cleanupStack._1;
                                        cleanupStack = cleanupStack._2;

                                        switch (nextContinuation.tag) {
                                            case catchTag:
                                                if (lastValue && lastValue !== currentFiberAction) {
                                                    currentState = stateError;
                                                } else if (lastError) {
                                                    currentState = stateRunning;
                                                    currentResult = nextContinuation._2(resultHandlers.fromLeft(lastError));
                                                    lastError = null;
                                                }
                                                break;
                                            case resumeTag:
                                                if (lastValue && lastValue !== currentFiberAction || lastError) {
                                                    currentState = stateError;
                                                } else {
                                                    continuationStack = nextContinuation._1;
                                                    cleanupStack = nextContinuation._2;
                                                    currentState = stateProcessing;
                                                    currentResult = resultHandlers.fromRight(currentResult);
                                                }
                                                break;
                                            case bracketTag:
                                                bracketCount--;
                                                if (null === lastError) {
                                                    currentFiberAction = resultHandlers.fromRight(currentResult);
                                                    cleanupStack = new AsyncFlowResult(consTag, new AsyncFlowResult(releaseTag, nextContinuation._2, currentFiberAction), cleanupStack, currentFiberAction);
                                                    if (currentFiberAction === lastValue || bracketCount > 0) {
                                                        currentState = stateRunning;
                                                        currentResult = nextContinuation._3(currentFiberAction);
                                                    }
                                                }
                                                break;
                                            case releaseTag:
                                                bracketCount++;
                                                cleanupStack = new AsyncFlowResult(consTag, new AsyncFlowResult(finalizedTag, currentResult, lastError), cleanupStack, lastValue);
                                                currentState = stateRunning;
                                                currentResult = lastValue && lastValue !== currentFiberAction ? nextContinuation._1.killed(resultHandlers.fromLeft(lastValue))(nextContinuation._2) : lastError ? nextContinuation._1.failed(resultHandlers.fromLeft(lastError))(nextContinuation._2) : nextContinuation._1.completed(resultHandlers.fromRight(currentResult))(nextContinuation._2);
                                                lastError = null;
                                                break;
                                            case finalizerTag:
                                                bracketCount++;
                                                cleanupStack = new AsyncFlowResult(consTag, new AsyncFlowResult(finalizedTag, currentResult, lastError), cleanupStack, lastValue);
                                                currentState = stateRunning;
                                                currentResult = nextContinuation._1;
                                                break;
                                            case finalizedTag:
                                                bracketCount--;
                                                currentState = stateError;
                                                currentResult = nextContinuation._1;
                                                lastError = nextContinuation._2;
                                                break;
                                        }
                                    }
                                    break;
                                case stateComplete:
                                    for (var cbId in cancelCallbacks) {
                                        if (cancelCallbacks.hasOwnProperty(cbId)) {
                                            rethrowOnError = rethrowOnError && cancelCallbacks[cbId].rethrow;
                                            reportErrorAsync(cancelCallbacks[cbId].handler(currentResult));
                                        }
                                    }
                                    cancelCallbacks = null;
                                    if (lastValue && lastError) {
                                        setTimeout(function() { throw resultHandlers.fromLeft(lastError); }, 0);
                                    } else if (resultHandlers.isLeft(currentResult) && rethrowOnError) {
                                        setTimeout(function() { if (rethrowOnError) throw resultHandlers.fromLeft(currentResult); }, 0);
                                    }
                                    return; // Fiber execution complete.
                                case stateInitial:
                                    currentState = stateRunning;
                                    break;
                                case stateAsyncWait:
                                    return; // Waiting for async completion.
                            }
                        }
                    }

                    function addCompletionCallback(callbackData) {
                        return function() {
                            if (currentState === stateComplete) {
                                rethrowOnError = rethrowOnError && callbackData.rethrow;
                                callbackData.handler(currentResult)();
                                return function() {};
                            }
                            var callbackId = asyncCallCount++;
                            (cancelCallbacks = cancelCallbacks || {})[callbackId] = callbackData;
                            return function() {
                                if (null !== cancelCallbacks) {
                                    delete cancelCallbacks[callbackId];
                                }
                            };
                        };
                    }

                    return {
                        kill: function(killReason, continuation) {
                            return function() {
                                if (currentState === stateComplete) {
                                    continuation(resultHandlers.right(undefined))();
                                    return function() {};
                                }
                                var cleanupFunc = addCompletionCallback({ rethrow: false, handler: function() { return continuation(resultHandlers.right(undefined)); } })();
                                switch (currentState) {
                                    case stateInitial:
                                        lastValue = resultHandlers.left(killReason);
                                        currentState = stateComplete;
                                        currentResult = lastValue;
                                        executeFiber(currentDepth);
                                        break;
                                    case stateAsyncWait:
                                        if (null === lastValue) {
                                            lastValue = resultHandlers.left(killReason);
                                        }
                                        if (0 === bracketCount) {
                                            if (currentState === stateAsyncWait) {
                                                cleanupStack = new AsyncFlowResult(consTag, new AsyncFlowResult(finalizerTag, currentResult(killReason)), cleanupStack, lastValue);
                                            }
                                            currentState = stateError;
                                            currentResult = null;
                                            lastError = null;
                                            executeFiber(++currentDepth);
                                        }
                                        break;
                                    default:
                                        if (null === lastValue) {
                                            lastValue = resultHandlers.left(killReason);
                                        }
                                        if (0 === bracketCount) {
                                            currentState = stateError;
                                            currentResult = null;
                                            lastError = null;
                                        }
                                }
                                return cleanupFunc;
                            };
                        },
                        join: function(callback) {
                            return function() {
                                var cleanupFunc = addCompletionCallback({ rethrow: false, handler: callback })();
                                if (currentState === stateInitial) executeFiber(currentDepth);
                                return cleanupFunc;
                            };
                        },
                        onComplete: addCompletionCallback,
                        isSuspended: function() { return currentState === stateInitial; },
                        start: function() {
                            if (currentState === stateInitial) {
                                if (schedulerQueue.isDraining()) {
                                    executeFiber(currentDepth);
                                } else {
                                    schedulerQueue.enqueueTask(function() { executeFiber(currentDepth); });
                                }
                            }
                        }
                    };
                }

                function ParallelRunner(resultHandlers, supervisorRef, flow, onCompleteCallback) {
                    var activeFibers = 0,
                        fiberMap = {},
                        nextFiberId = 0,
                        earlyExitException = new Error("[ParallelFlow] Early termination requested"),
                        mainError = null,
                        currentResultHandlers = resultHandlers;

                    function cleanupActiveFibers(reason, continuation, callback) {
                        var cleanupCount = 0,
                            cleanupCallbacks = {};

                        function handleFiberCleanup(fiberId) {
                            cleanupCallbacks[fiberId] = fiberMap[fiberId].kill(reason, function(result) {
                                return function() {
                                    delete cleanupCallbacks[fiberId];
                                    cleanupCount--;
                                    if (currentResultHandlers.isLeft(result) && currentResultHandlers.fromLeft(result)) {
                                        setTimeout(function() { throw currentResultHandlers.fromLeft(result); }, 0);
                                    }
                                    if (0 === cleanupCount) continuation();
                                };
                            })();
                        }
                        for (var fiberId in fiberMap) {
                            if (fiberMap.hasOwnProperty(fiberId)) {
                                cleanupCount++;
                                handleFiberCleanup(fiberId);
                            }
                        }
                        if (0 === cleanupCount) callback(currentResultHandlers.right(undefined))();
                        else {
                            for (var cbKey in cleanupCallbacks) {
                                if (cleanupCallbacks.hasOwnProperty(cbKey)) {
                                    cleanupCallbacks[cbKey]();
                                }
                            }
                        }

                        return cleanupCallbacks;
                    }

                    function registerFiberCompletion(fiberEntry) {
                        return function(completionResult) {
                            return function() {
                                delete fiberMap[fiberEntry._1];
                                fiberEntry._3 = completionResult;

                                (function resolveParentFlow(currentResult, currentFlowEntry, currentParentEntry) {
                                    var leftResult, rightResult, childResult, parentResult, isProcessingChild, cleanupId;

                                    for (currentResultHandlers.isLeft(currentResult) ? (leftResult = currentResult, rightResult = null) : (rightResult = currentResult, leftResult = null);;) {
                                        if (childResult = null, parentResult = null, isProcessingChild = null, cleanupId = null, null !== mainError) return;
                                        if (null === currentFlowEntry) return void onCompleteCallback(leftResult || rightResult)();
                                        if (currentFlowEntry._3 !== currentResultHandlers.EMPTY) return;

                                        switch (currentFlowEntry.tag) {
                                            case mapTag:
                                                if (null === leftResult) {
                                                    currentFlowEntry._3 = currentResultHandlers.right(currentFlowEntry._1(currentResultHandlers.fromRight(rightResult)));
                                                    rightResult = currentFlowEntry._3;
                                                } else {
                                                    currentFlowEntry._3 = leftResult;
                                                }
                                                break;
                                            case applyTag:
                                            case altTag:
                                                childResult = currentFlowEntry._1._3;
                                                parentResult = currentFlowEntry._2._3;

                                                if (leftResult) {
                                                    currentFlowEntry._3 = leftResult;
                                                    isProcessingChild = true;
                                                    cleanupId = nextFiberId++;
                                                    fiberMap[cleanupId] = cleanupActiveFibers(earlyExitException, function() {
                                                        return function() {
                                                            delete fiberMap[cleanupId];
                                                            if (isProcessingChild) isProcessingChild = false;
                                                            else if (null === currentParentEntry) resolveParentFlow(leftResult, null, null);
                                                            else resolveParentFlow(leftResult, currentParentEntry._1, currentParentEntry._2);
                                                        };
                                                    }, currentResultHandlers.EMPTY);
                                                    if (isProcessingChild) return void(isProcessingChild = false);
                                                } else {
                                                    if (childResult === currentResultHandlers.EMPTY || parentResult === currentResultHandlers.EMPTY) return;
                                                    rightResult = currentResultHandlers.right(currentResultHandlers.fromRight(childResult)(currentResultHandlers.fromRight(parentResult)));
                                                    currentFlowEntry._3 = rightResult;
                                                }
                                                break;
                                        }
                                        if (null === currentParentEntry) {
                                            currentFlowEntry = null;
                                        } else {
                                            currentFlowEntry = currentParentEntry._1;
                                            currentParentEntry = currentParentEntry._2;
                                        }
                                    }
                                })(completionResult, fiberEntry._2._1, fiberEntry._2._2);
                            };
                        };
                    }

                    return function() {
                        var currentAction, nextAction,
                            flowState = stateRunning,
                            currentFlow = flow,
                            flowParent = null,
                            flowCleanup = null;

                        // This loop traverses the parallel flow graph to set up fibers.
                        flowTraversal: for (;;) {
                            currentAction = null;
                            nextAction = null;

                            switch (flowState) {
                                case stateRunning:
                                    switch (currentFlow.tag) {
                                        case mapTag:
                                            if (flowParent) flowCleanup = new AsyncFlowResult(consTag, flowParent, flowCleanup);
                                            flowParent = new AsyncFlowResult(mapTag, currentFlow._1, currentResultHandlers.EMPTY, currentResultHandlers.EMPTY);
                                            currentFlow = currentFlow._2;
                                            break;
                                        case applyTag:
                                            if (flowParent) flowCleanup = new AsyncFlowResult(consTag, flowParent, flowCleanup);
                                            flowParent = new AsyncFlowResult(applyTag, currentResultHandlers.EMPTY, currentFlow._2, currentResultHandlers.EMPTY);
                                            currentFlow = currentFlow._1;
                                            break;
                                        case altTag:
                                            if (flowParent) flowCleanup = new AsyncFlowResult(consTag, flowParent, flowCleanup);
                                            flowParent = new AsyncFlowResult(altTag, currentResultHandlers.EMPTY, currentFlow._2, currentResultHandlers.EMPTY);
                                            currentFlow = currentFlow._1;
                                            break;
                                        default:
                                            // Base case: create a fiber for the current flow node.
                                            nextAction = nextFiberId++;
                                            flowState = stateError; // Temporarily use stateError as a 'done' state for this loop.
                                            currentAction = currentFlow;
                                            currentFlow = new AsyncFlowResult(forkedTag, nextAction, new AsyncFlowResult(consTag, flowParent, flowCleanup), currentResultHandlers.EMPTY);
                                            // Create and store the fiber.
                                            var newFiber = Fiber(currentResultHandlers, supervisorRef, currentAction);
                                            newFiber.onComplete({ rethrow: false, handler: registerFiberCompletion(currentFlow) })();
                                            fiberMap[nextAction] = newFiber;
                                            if (supervisorRef) supervisorRef.register(newFiber);
                                    }
                                    break;
                                case stateError: // This acts as a 'backtrack' state for the traversal.
                                    if (null === flowParent) break flowTraversal; // All nodes processed.
                                    flowParent._1 === currentResultHandlers.EMPTY ? (flowParent._1 = currentFlow, flowState = stateRunning, currentFlow = flowParent._2, flowParent._2 = currentResultHandlers.EMPTY) : (flowParent._2 = currentFlow, currentFlow = flowParent, null === flowCleanup ? flowParent = null : (flowParent = flowCleanup._1, flowCleanup = flowCleanup._2));
                            }
                        }

                        mainError = currentFlow; // The root node after traversal now holds the structure.
                        for (nextAction = 0; nextAction < nextFiberId; nextAction++) {
                            fiberMap[nextAction].start(); // Start all created fibers.
                        }
                    };
                }

                function convertToSequential(resultHandlers, supervisorRef, asyncFlow) {
                    return new AsyncFlowResult(asyncTag, function(onComplete) {
                        return function() {
                            return ParallelRunner(resultHandlers, supervisorRef, asyncFlow, onComplete);
                        };
                    });
                }

                return {
                    EMPTY: constructors,
                    Pure: createTaggedConstructor(pureTag),
                    Throw: createTaggedConstructor(throwTag),
                    Catch: createTaggedConstructor(catchTag),
                    Sync: createTaggedConstructor(syncTag),
                    Async: createTaggedConstructor(asyncTag),
                    Bind: createTaggedConstructor(bindTag),
                    Bracket: createTaggedConstructor(bracketTag),
                    Fork: createTaggedConstructor(forkTag),
                    Sequential: createTaggedConstructor(sequentialTag),
                    ParMap: createTaggedConstructor(mapTag),
                    ParApply: createTaggedConstructor(applyTag),
                    ParAlt: createTaggedConstructor(altTag),
                    Fiber: Fiber,
                    Supervisor: function(resultHandlers) {
                        var managedFibers = {},
                            nextId = 0,
                            activeCount = 0;
                        return {
                            register: function(fiberInst) {
                                var currentId = nextId++;
                                fiberInst.onComplete({
                                    rethrow: true,
                                    handler: function(completionResult) {
                                        return function() {
                                            activeCount--;
                                            delete managedFibers[currentId];
                                        };
                                    }
                                })();
                                managedFibers[currentId] = fiberInst;
                                activeCount++;
                            },
                            isEmpty: function() { return 0 === activeCount; },
                            killAll: function(reason, onCompletion) {
                                return function() {
                                    var cleanupCounter = 0,
                                        cleanupTracker = {};

                                    function initiateCleanup(fiberId) {
                                        cleanupTracker[fiberId] = managedFibers[fiberId].kill(reason, function(killResult) {
                                            return function() {
                                                delete cleanupTracker[fiberId];
                                                cleanupCounter--;
                                                if (resultHandlers.isLeft(killResult) && resultHandlers.fromLeft(killResult)) {
                                                    setTimeout(function() { throw resultHandlers.fromLeft(killResult); }, 0);
                                                }
                                                if (0 === cleanupCounter) onCompletion();
                                            };
                                        })();
                                    }
                                    for (var fiberId in managedFibers) {
                                        if (managedFibers.hasOwnProperty(fiberId)) {
                                            cleanupCounter++;
                                            initiateCleanup(fiberId);
                                        }
                                    }
                                    managedFibers = {};
                                    nextId = 0;
                                    activeCount = 0;
                                    return function(cancelFunc) {
                                        return new AsyncFlowResult(syncTag, function() {
                                            for (var id in cleanupTracker) {
                                                if (cleanupTracker.hasOwnProperty(id)) cleanupTracker[id]();
                                            }
                                        });
                                    };
                                };
                            }
                        };
                    },
                    Scheduler: schedulerQueue,
                    noopCanceler: createPureResult,
                };
            }();

            currentScope._pure = asyncFlowInternal.Pure;
            currentScope._map = function(transformFunc) {
                return function(flow) {
                    return flow.tag === asyncFlowInternal.Pure.tag ? asyncFlowInternal.Pure(transformFunc(flow._1)) : asyncFlowInternal.Bind(flow, function(val) { return asyncFlowInternal.Pure(transformFunc(val)); });
                };
            };
            currentScope._bind = function(flow) { return function(bindFunc) { return asyncFlowInternal.Bind(flow, bindFunc); }; };
            currentScope._liftEffect = asyncFlowInternal.Sync;
            currentScope._parAsyncFlowMap = function(transformFunc) { return function(flow) { return asyncFlowInternal.ParMap(transformFunc, flow); }; };
            currentScope._parAsyncFlowApply = function(funcFlow) { return function(argFlow) { return asyncFlowInternal.ParApply(funcFlow, argFlow); }; };
            currentScope.createAsyncFlow = asyncFlowInternal.Async;
            currentScope._createFiber = function(resultHandlers, initialValue) {
                return function() { return asyncFlowInternal.Fiber(resultHandlers, null, initialValue); };
            };
            currentScope._sequential = asyncFlowInternal.Sequential;
        }(sharedModuleStore["Operation.AsyncFlow"] = sharedModuleStore["Operation.AsyncFlow"] || {});

        // Define Operation.ErrorHandling module.
        !function(currentScope) {
            "use strict";
            currentScope.createError = function(msg) { return new Error(msg); };
            currentScope.throwException = function(err) { return function() { throw err; }; };
        }(sharedModuleStore["Operation.ErrorHandling"] = sharedModuleStore["Operation.ErrorHandling"] || {});

        // Define Operation.ErrorHandling module, part 2.
        !function(currentScope) {
            "use strict";
            var errorHandlingRef = sharedModuleStore["Operation.ErrorHandling"];
            sharedModuleStore["Control.Applier"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Choice"], sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Display"], sharedModuleStore.Operation, sharedModuleStore.Prelude;
            currentScope.throwError = function(msg) { return errorHandlingRef.throwException(errorHandlingRef.createError(msg)); };
        }(sharedModuleStore["Operation.ErrorHandling"] = sharedModuleStore["Operation.ErrorHandling"] || {});

        // Define Operation.AsyncFlow module, part 2.
        !function(currentScope) {
            "use strict";
            var asyncFlowRef = sharedModuleStore["Operation.AsyncFlow"];
            // Placeholder for many control/data modules.
            var altRef = (sharedModuleStore["Control.Alt"], sharedModuleStore["Control.Alternative"], sharedModuleStore["Control.Applier"]);
            var applyRef = sharedModuleStore["Control.Application"];
            var chainerRef = sharedModuleStore["Control.Chainer"];
            var lazyRef = (sharedModuleStore["Control.Lazy"], sharedModuleStore["Control.Workflow"]);
            var errorMonadRef = (sharedModuleStore["Control.Monad.Error.Class"], sharedModuleStore["Control.Workflow.Recursive"], sharedModuleStore["Control.Concurrency"]);
            var concurrencyInterfaceRef = sharedModuleStore["Control.Concurrency.Interface"];
            var plusRef = (sharedModuleStore["Control.Plus"], sharedModuleStore["Control.Composition"], sharedModuleStore["Data.Choice"]);
            var aggregatorRef = sharedModuleStore["Data.Aggregator"];
            var operationRef = sharedModuleStore["Data.Operation"];
            var uncurriedRef = (sharedModuleStore["Data.Function.Uncurried"], sharedModuleStore["Data.Mapper"]);
            var monoidRef = sharedModuleStore["Data.CombinableIdentity"];
            var newtypeRef = (sharedModuleStore["Data.Newtype"], sharedModuleStore["Data.Combiner"]);
            var durationRef = (sharedModuleStore["Data.Time.Duration"], sharedModuleStore["Data.Atomic"]);
            var effectRef = sharedModuleStore.Operation;
            var effectInterfaceRef = sharedModuleStore["Operation.Interface"];
            var exceptionRef = (sharedModuleStore["Operation.ErrorHandling"], sharedModuleStore["Operation.Unsafe"], sharedModuleStore["Partial.Dangerous"]);
            var preludeRef = (sharedModuleStore.Prelude, sharedModuleStore["Dangerous.TypeCast"]);

            var parAsyncFlowMapperInstance = new uncurriedRef.Mapper(asyncFlowRef._parAsyncFlowMap);
            var asyncFlowMapperInstance = new uncurriedRef.Mapper(asyncFlowRef._map);
            var resultHandlerConfig = {
                isLeft: function(result) {
                    if (result instanceof plusRef.Left) return true;
                    if (result instanceof plusRef.Right) return false;
                    // Error for exhaustive pattern match.
                    throw new Error("Pattern match failure in Operation.AsyncFlow (resultHandlerConfig.isLeft): " + [result.constructor.name]);
                },
                fromLeft: function(result) {
                    if (result instanceof plusRef.Left) return result.value0;
                    if (result instanceof plusRef.Right) return exceptionRef.unsafeCrashWithMessage("Cannot extract Left from Right result");
                    // Error for exhaustive pattern match.
                    throw new Error("Pattern match failure in Operation.AsyncFlow (resultHandlerConfig.fromLeft): " + [result.constructor.name]);
                },
                fromRight: function(result) {
                    if (result instanceof plusRef.Right) return result.value0;
                    if (result instanceof plusRef.Left) return exceptionRef.unsafeCrashWithMessage("Cannot extract Right from Left result");
                    // Error for exhaustive pattern match.
                    throw new Error("Pattern match failure in Operation.AsyncFlow (resultHandlerConfig.fromRight): " + [result.constructor.name]);
                },
                left: plusRef.Left.create,
                right: plusRef.Right.create,
            };
            var launchFiber = function(asyncFlow) {
                return function() {
                    var fiberInstance = asyncFlowRef._createFiber(resultHandlerConfig, asyncFlow)();
                    return fiberInstance.start(), fiberInstance;
                };
            };
            var parAsyncFlowApplyInstance = new applyRef.Application(function() { return parAsyncFlowMapperInstance; }, asyncFlowRef._parAsyncFlowApply);
            var asyncFlowWorkflowInstance = new lazyRef.Workflow(function() { return asyncFlowApplierInstance; }, function() { return asyncFlowChainerInstance; });
            var asyncFlowChainerInstance = new chainerRef.Chainer(function() { return asyncFlowApplyInstance; }, asyncFlowRef._bind);
            var asyncFlowApplyInstance = new applyRef.Application(function() { return asyncFlowMapperInstance; }, lazyRef.ap(asyncFlowWorkflowInstance));
            var asyncFlowApplierInstance = new altRef.Applier(function() { return asyncFlowApplyInstance; }, asyncFlowRef._pure);
            var asyncFlowEffectInterfaceInstance = new effectInterfaceRef.WorkflowInterface(function() { return asyncFlowWorkflowInstance; }, asyncFlowRef._liftEffect);
            var parallelAsyncFlowInterfaceInstance = new concurrencyInterfaceRef.ParallelInterface(function() { return parAsyncFlowApplierInstance; }, function() { return asyncFlowWorkflowInstance; }, preludeRef.unsafeCast, asyncFlowRef._sequential);
            var parAsyncFlowApplierInstance = new altRef.Applier(function() { return parAsyncFlowApplyInstance; }, function(val) { return concurrencyInterfaceRef.runInParallel(parallelAsyncFlowInterfaceInstance)(altRef.pure(asyncFlowApplierInstance)(val)); });
            var cancelerCombinerInstance = new newtypeRef.Combiner(function(canceler1) {
                return function(canceler2) {
                    return function(reason) {
                        return errorMonadRef.parallelSequenceVoid(parallelAsyncFlowInterfaceInstance)(aggregatorRef.arrayAggregator)([canceler1(reason), canceler2(reason)]);
                    };
                };
            });
            var noopCanceler = operationRef.constant(altRef.pure(asyncFlowApplierInstance)(durationRef.atomicValue));
            var cancelerCombinableIdentityInstance = new monoidRef.CombinableIdentity(function() { return cancelerCombinerInstance; }, noopCanceler);

            currentScope.launchAsyncFlow = launchFiber;
            currentScope.launchAsyncFlowVoid = function(flow) { return uncurriedRef.voidMap(effectRef.mapperOperation)(launchFiber(flow)); };
            currentScope.noopCanceler = noopCanceler;
            currentScope.mapperAsyncFlow = asyncFlowMapperInstance;
            currentScope.applyAsyncFlow = asyncFlowApplyInstance;
            currentScope.applierAsyncFlow = asyncFlowApplierInstance;
            currentScope.chainerAsyncFlow = asyncFlowChainerInstance;
            currentScope.workflowAsyncFlow = asyncFlowWorkflowInstance;
            currentScope.workflowEffectAsyncFlow = asyncFlowEffectInterfaceInstance;
            currentScope.mapperParAsyncFlow = parAsyncFlowMapperInstance;
            currentScope.applyParAsyncFlow = parAsyncFlowApplyInstance;
            currentScope.applierParAsyncFlow = parAsyncFlowApplierInstance;
            currentScope.parallelAsyncFlow = parallelAsyncFlowInterfaceInstance;
            currentScope.combinerCanceler = cancelerCombinerInstance;
            currentScope.combinableIdentityCanceler = cancelerCombinableIdentityInstance;
            currentScope.createAsyncFlow = asyncFlowRef.createAsyncFlow;
        }(sharedModuleStore["Operation.AsyncFlow"] = sharedModuleStore["Operation.AsyncFlow"] || {});

        // Define Node.TextEncoding module.
        !function(currentScope) {
            "use strict";
            sharedModuleStore["Node.Encoding"];
            var displayRef = sharedModuleStore["Data.Display"];
            // ASCII encoding.
            var asciiEncoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // UTF8 encoding.
            var utf8Encoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // UTF16LE encoding.
            var utf16leEncoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // UCS2 encoding.
            var ucs2Encoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Base64 encoding.
            var base64Encoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Latin1 encoding.
            var latin1Encoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Binary encoding.
            var binaryEncoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            // Hex encoding.
            var hexEncoding = function() { function Constructor() {} return Constructor.value = new Constructor(), Constructor; }();
            var encodingDisplayInstance = new displayRef.Display(function(encoding) {
                if (encoding instanceof asciiEncoding) return "ASCII";
                if (encoding instanceof utf8Encoding) return "UTF8";
                if (encoding instanceof utf16leEncoding) return "UTF16LE";
                if (encoding instanceof ucs2Encoding) return "UCS2";
                if (encoding instanceof base64Encoding) return "Base64";
                if (encoding instanceof latin1Encoding) return "Latin1";
                if (encoding instanceof binaryEncoding) return "Binary";
                if (encoding instanceof hexEncoding) return "Hex";
                // Error for exhaustive pattern match.
                throw new Error("Pattern match failure in Node.TextEncoding (encodingDisplayInstance): " + [encoding.constructor.name]);
            });
            currentScope.ASCII = asciiEncoding;
            currentScope.UTF8 = utf8Encoding;
            currentScope.UTF16LE = utf16leEncoding;
            currentScope.UCS2 = ucs2Encoding;
            currentScope.Base64 = base64Encoding;
            currentScope.Latin1 = latin1Encoding;
            currentScope.Binary = binaryEncoding;
            currentScope.Hex = hexEncoding;
            currentScope.toNodeEncoding = function(encoding) {
                if (encoding instanceof asciiEncoding) return "ascii";
                if (encoding instanceof utf8Encoding) return "utf8";
                if (encoding instanceof utf16leEncoding) return "utf16le";
                if (encoding instanceof ucs2Encoding) return "ucs2";
                if (encoding instanceof base64Encoding) return "base64";
                if (encoding instanceof latin1Encoding) return "latin1";
                if (encoding instanceof binaryEncoding) return "binary";
                if (encoding instanceof hexEncoding) return "hex";
                // Error for exhaustive pattern match.
                throw new Error("Pattern match failure in Node.TextEncoding (toNodeEncoding): " + [encoding.constructor.name]);
            };
            currentScope.displayEncoding = encodingDisplayInstance;
        }(sharedModuleStore["Node.TextEncoding"] = sharedModuleStore["Node.TextEncoding"] || {});

        // Define Node.Execution module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Node.Execution"] = sharedModuleStore["Node.Execution"] || {}).processObject = process;
        }();

        // Define Node.DataFlow module.
        !function(currentScope) {
            "use strict";
            currentScope.readChunkImplementation = function(onBuffer) {
                return function(onString) {
                    return function(chunk) {
                        if (chunk instanceof Buffer) return onBuffer(chunk);
                        if ("string" == typeof chunk) return onString(chunk);
                        // Error for unexpected chunk type.
                        throw new Error("Node.DataFlow.readChunkImplementation: Unrecognized chunk type; expected String or Buffer, got: " + chunk);
                    };
                };
            };
            currentScope.onDataEitherImplementation = function(chunkHandler) {
                return function(streamInstance) {
                    return function(callbackFunc) {
                        return function() {
                            streamInstance.on("data", function(dataChunk) {
                                callbackFunc(chunkHandler(dataChunk))();
                            });
                        };
                    };
                };
            };
            currentScope.onStreamEnd = function(streamInstance) { return function(callback) { return function() { streamInstance.on("end", callback); }; }; };
            currentScope.writeToStream = function(streamInstance) { return function(data) { return function(encoding) { return function() { return streamInstance.write(data, null, encoding); }; }; }; };
            currentScope.writeStringImplementation = function(streamInstance) {
                return function(encoding) {
                    return function(str) {
                        return function(callback) {
                            return function() { return streamInstance.write(str, encoding, callback); };
                        };
                    };
                };
            };
        }(sharedModuleStore["Node.DataFlow"] = sharedModuleStore["Node.DataFlow"] || {});

        // Define Node.MemoryBuffer module.
        !function(currentScope) {
            "use strict";
            (sharedModuleStore["Node.MemoryBuffer"] = sharedModuleStore["Node.MemoryBuffer"] || {}).toStringImplementation = function(encoding) { return function(buffer) { return function() { return buffer.toString(encoding); }; }; };
        }();

        // Define Node.MemoryBuffer module, part 2.
        !function(currentScope) {
            "use strict";
            var bufferRef = sharedModuleStore["Node.MemoryBuffer"];
            sharedModuleStore["Control.Composition"], sharedModuleStore["Data.ArrayBuffer.Types"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Display"], sharedModuleStore.Operation, sharedModuleStore["Node.TextEncoding"];
            sharedModuleStore.Prelude;
            currentScope.convertToString = function(encodingInst) { return bufferRef.toStringImplementation(sharedModuleStore["Node.TextEncoding"].toNodeEncoding(encodingInst)); };
        }(sharedModuleStore["Node.MemoryBuffer"] = sharedModuleStore["Node.MemoryBuffer"] || {});

        // Define Node.DataFlow module, part 2.
        !function(currentScope) {
            "use strict";
            var dataFlowRef = sharedModuleStore["Node.DataFlow"];
            var applierRef = sharedModuleStore["Control.Applier"];
            var chainerRef = sharedModuleStore["Control.Chainer"];
            var choiceRef = sharedModuleStore["Data.Choice"];
            var mapperRef = (sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Display"]);
            var operationRef = sharedModuleStore.Operation;
            var exceptionRef = sharedModuleStore["Operation.ErrorHandling"];
            var bufferRef = sharedModuleStore["Node.MemoryBuffer"];
            var encodingRef = sharedModuleStore["Node.TextEncoding"];
            var preludeRef = (sharedModuleStore.Prelude, dataFlowRef.readChunkImplementation(choiceRef.Left.create)(choiceRef.Right.create));
            var onDataEitherFunc = function(streamInst) { return function(callback) { return dataFlowRef.onDataEitherImplementation(preludeRef)(streamInst)(callback); }; };
            var onDataProcessed = function(streamInst) {
                return function(callback) {
                    return onDataEitherFunc(streamInst)(chainerRef.composeKleisliFlipped(operationRef.chainerOperation)(callback)(function(chunkResult) {
                        if (chunkResult instanceof choiceRef.Left) return exceptionRef.throwError("Stream encoding should not be set");
                        if (chunkResult instanceof choiceRef.Right) return applierRef.pure(operationRef.applierOperation)(chunkResult.value0);
                        // Error for exhaustive pattern match.
                        throw new Error("Pattern match failure in Node.DataFlow (onDataProcessed): " + [chunkResult.constructor.name]);
                    }));
                };
            };
            currentScope.onData = onDataProcessed;
            currentScope.onDataString = function(streamInst) {
                return function(encodingInst) {
                    return function(callback) {
                        return onDataProcessed(streamInst)(chainerRef.composeKleisliFlipped(operationRef.chainerOperation)(callback)(bufferRef.convertToString(encodingInst)));
                    };
                };
            };
            currentScope.onDataChoice = onDataEitherFunc;
            currentScope.writeString = function(streamInst) {
                return function(encodingInst) {
                    return dataFlowRef.writeStringImplementation(streamInst)(mapperRef.display(encodingRef.displayEncoding)(encodingInst));
                };
            };
            currentScope.onEnd = dataFlowRef.onStreamEnd;
        }(sharedModuleStore["Node.DataFlow"] = sharedModuleStore["Node.DataFlow"] || {});

        // Define Node.Execution module, part 2.
        !function(currentScope) {
            "use strict";
            var executionRef = sharedModuleStore["Node.Execution"];
            // Placeholder for other modules.
            var functorRef = (sharedModuleStore["Data.Mapper"], sharedModuleStore["Data.Optional"], sharedModuleStore["Data.Posix"], sharedModuleStore["Data.Posix.Signal"], sharedModuleStore.Operation, sharedModuleStore["Foreign.Object"], sharedModuleStore["Node.Platform"], sharedModuleStore["Node.DataFlow"], sharedModuleStore.Prelude, sharedModuleStore["Dangerous.TypeCast"], executionRef.processObject.stdout);
            var stdinStream = executionRef.processObject.stdin;
            currentScope.inputStream = stdinStream;
            currentScope.outputStream = functorRef;
        }(sharedModuleStore["Node.Execution"] = sharedModuleStore["Node.Execution"] || {});

        // Define PROBLEM_SOLVER_2019C module.
        !function(currentScope) {
            "use strict";
            var applierRef = sharedModuleStore["Control.Applier"];
            var chainerRef = sharedModuleStore["Control.Chainer"];
            var groupingRef = sharedModuleStore["Control.Grouping"];
            var recursiveRef = sharedModuleStore["Control.Workflow.Recursive"];
            var collectionRef = sharedModuleStore["Data.Collection"];
            var choiceRef = sharedModuleStore["Data.Choice"];
            var equivalenceRef = (sharedModuleStore["Data.Equivalence"], sharedModuleStore["Data.Mapper"]);
            var heytingRef = (sharedModuleStore["Data.HeytingAlgebra"], sharedModuleStore["Data.Integer"]);
            var optionalRef = sharedModuleStore["Data.Optional"];
            var combinableIdentityRef = sharedModuleStore["Data.CombinableIdentity"];
            var orderingRef = sharedModuleStore["Data.Ordering"];
            var ringRef = (sharedModuleStore["Data.Ring"], sharedModuleStore["Data.Combiner"], sharedModuleStore["Data.Semiring"]);
            var displayRef = sharedModuleStore["Data.Display"];
            var stringRef = (sharedModuleStore["Data.String"], sharedModuleStore["Data.Text.Fragments"]);
            var textUtilitiesRef = sharedModuleStore["Data.Text.Utilities"];
            var patternRef = (sharedModuleStore["Data.String.Pattern"], sharedModuleStore["Data.Atomic"]);
            var operationRef = sharedModuleStore.Operation;
            var asyncFlowRef = sharedModuleStore["Operation.AsyncFlow"];
            var effectInterfaceRef = sharedModuleStore["Operation.Interface"];
            var refOperations = sharedModuleStore["Operation.Reference"];
            var textEncodingRef = sharedModuleStore["Node.TextEncoding"];
            var executionRef = sharedModuleStore["Node.Execution"];
            var dataFlowRef = sharedModuleStore["Node.DataFlow"];
            var dangerousRef = sharedModuleStore["Partial.Dangerous"];
            var preludeRef = (sharedModuleStore.Prelude, function(inputStr) {
                return choiceRef.either(function(errMsg) { return dangerousRef.unsafeCrashWithMessage(errMsg); })(groupingRef.identity(groupingRef.groupingFunctionHandler))(chainerRef.bind(choiceRef.chainerChoice)(choiceRef.note("lines")(collectionRef.uncons((function(text){ return textUtilitiesRef.split(textUtilitiesRef.trim(text)); })(inputStr))))(function(lineData) {
                    return chainerRef.bind(choiceRef.chainerChoice)(choiceRef.note("n")(heytingRef.fromString(lineData.head)))(function(numVal) {
                        return applierRef.pure(choiceRef.applierChoice)(displayRef.display(displayRef.displayInteger)((function(remainingLines){
                            return recursiveRef.tailRecurse(function(iterState) {
                                var currentLine = collectionRef.index(remainingLines)(iterState.i);
                                if (currentLine instanceof optionalRef.Nothing) {
                                    return new recursiveRef.Done((((iterState.count + orderingRef.minimum(orderingRef.orderingInteger)(iterState.aCount)(iterState.bCount) | 0) + orderingRef.maximum(orderingRef.orderingInteger)(0)(iterState.abcCount - 1 | 0) | 0) + (iterState.abcCount > 0 && iterState.aCount > orderingRef.minimum(orderingRef.orderingInteger)(iterState.aCount)(iterState.bCount) ? 1 : 0) | 0) + (iterState.abcCount > 0 && iterState.bCount > orderingRef.minimum(orderingRef.orderingInteger)(iterState.aCount)(iterState.bCount) ? 1 : 0) | 0);
                                }
                                if (currentLine instanceof optionalRef.Just) {
                                    var abCount = collectionRef.length(textUtilitiesRef.splitString("AB")(currentLine.value0)) - 1 | 0;
                                    var startsWithB = "B" === stringRef.take(1)(currentLine.value0);
                                    var endsWithA = "A" === stringRef.takeRightCharacters(1)(currentLine.value0);
                                    var containsBoth = endsWithA && startsWithB;
                                    return new recursiveRef.Loop({
                                        i: iterState.i + 1 | 0,
                                        count: iterState.count + abCount | 0,
                                        aCount: iterState.aCount + (!containsBoth && endsWithA ? 1 : 0) | 0,
                                        bCount: iterState.bCount + (!containsBoth && startsWithB ? 1 : 0) | 0,
                                        abcCount: iterState.abcCount + (containsBoth ? 1 : 0) | 0
                                    });
                                }
                                // Error for exhaustive pattern match.
                                throw new Error("Pattern match failure in PROBLEM_SOLVER_2019C (processIteration): " + [currentLine.constructor.name]);
                            })({i:0,c:0,ac:0,bc:0,abc:0}));
                        })(lineData.tail))) + "\n");
                    });
                }));
            });
            var readInputFlow = asyncFlowRef.createAsyncFlow(function(onCompletion) {
                return function() {
                    var inputBufferRef = refOperations.createNew("")();
                    dataFlowRef.onDataString(executionRef.inputStream)(textEncodingRef.UTF8.value)(function(chunk) {
                        return function() {
                            var currentContent = refOperations.read(inputBufferRef)();
                            return refOperations.write(currentContent + chunk)(inputBufferRef)();
                        };
                    })();
                    dataFlowRef.onEnd(executionRef.inputStream)(function() {
                        var finalContent = refOperations.read(inputBufferRef)();
                        return onCompletion(applierRef.pure(choiceRef.applierChoice)(finalContent))();
                    })();
                    return combinableIdentityRef.identityValue(asyncFlowRef.combinableIdentityCanceler);
                };
            });
            var mainProgram = asyncFlowRef.launchAsyncFlowVoid(chainerRef.bind(asyncFlowRef.chainerAsyncFlow)(readInputFlow)(function(inputStr) {
                return chainerRef.bind(asyncFlowRef.chainerAsyncFlow)(applierRef.pure(asyncFlowRef.applierAsyncFlow)(preludeRef(inputStr)))(function(outputStr) {
                    return effectInterfaceRef.liftOperation(asyncFlowRef.workflowEffectAsyncFlow)((function(textToOutput){
                        return equivalenceRef.voidMap(operationRef.mapperOperation)(dataFlowRef.writeString(executionRef.outputStream)(textEncodingRef.UTF8.value)(textToOutput)(applierRef.pure(operationRef.applierOperation)(patternRef.atomicValue)));
                    })(outputStr));
                });
            }));
            currentScope.main = mainProgram;
            currentScope.solve = preludeRef;
        }(sharedModuleStore.PROBLEM_SOLVER_2019C = sharedModuleStore.PROBLEM_SOLVER_2019C || {});

        // Execute the main program entry point.
        sharedModuleStore.PROBLEM_SOLVER_2019C.main();
    }, {}]
}, ["Focm"], null);