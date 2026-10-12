(function(moduleDefinitions, loadedModules, entryPoints, globalExportName) {
    let initialLoadErrorHolder = null; // Stores the first error encountered during entry point execution
    const previousGlobalLoader = typeof parcelRequire === "function" ? parcelRequire : null;
    const commonjsRequire = typeof require === "function" && require;

    function applicationModuleLoader(requestedModuleId, suppressErrors = false) {
        // If module is already loaded, return its exports
        if (loadedModules[requestedModuleId]) {
            return loadedModules[requestedModuleId].exports;
        }

        // If module definition is not found in our registry
        if (!moduleDefinitions[requestedModuleId]) {
            // Try to delegate to a parent Parcel loader or Node.js require
            if (!suppressErrors && previousGlobalLoader) {
                return previousGlobalLoader(requestedModuleId, true);
            }
            if (commonjsRequire && typeof requestedModuleId === "string") {
                return commonjsRequire(requestedModuleId);
            }
            const moduleNotFoundError = new Error("Cannot find requested module '" + requestedModuleId + "'");
            moduleNotFoundError.code = "MODULE_NOT_FOUND";
            throw moduleNotFoundError;
        }

        // Prepare module context and factory function call
        const moduleFactoryCaller = function(exportsObject, moduleContainer, moduleExports, executionContext) {
            // The first element of moduleDefinitions[requestedModuleId] is the module's factory function
            moduleDefinitions[requestedModuleId][0].call(moduleExports, applicationModuleLoader.pathResolver, moduleContainer, moduleExports, executionContext);
        };

        // Setup a local resolver for relative paths within the module
        applicationModuleLoader.pathResolver.resolve = function(relativePath) {
            return moduleDefinitions[requestedModuleId][1][relativePath] || relativePath;
        };
        applicationModuleLoader.pathResolver.cache = {}; // This cache is effectively unused in original Parcel's `p.cache`

        // Create a new module instance and store it in cache before execution
        const newModuleInstance = loadedModules[requestedModuleId] = new applicationModuleLoader.Module(requestedModuleId);
        moduleFactoryCaller(newModuleInstance.exports, newModuleInstance, newModuleInstance.exports, this);

        return loadedModules[requestedModuleId].exports;
    }

    applicationModuleLoader.isCustomModuleLoader = true;
    applicationModuleLoader.Module = function(moduleId) {
        this.id = moduleId;
        this.bundle = applicationModuleLoader;
        this.exports = {};
    };
    applicationModuleLoader.moduleRegistry = moduleDefinitions;
    applicationModuleLoader.moduleCache = loadedModules;
    applicationModuleLoader.parentGlobalLoader = previousGlobalLoader;
    applicationModuleLoader.registerModuleDefinition = function(id, content) {
        moduleDefinitions[id] = [function(exports, mod) { mod.exports = content; }, {}];
    };
    applicationModuleLoader.pathResolver = function(requiredPath) { // This serves the role of `p` in the original
        return applicationModuleLoader(applicationModuleLoader.pathResolver.resolve(requiredPath));
    };


    // Execute entry points
    if (Array.isArray(entryPoints)) {
        for (let entryIdx = 0; entryIdx < entryPoints.length; entryIdx++) {
            try {
                applicationModuleLoader(entryPoints[entryIdx]);
            } catch (errorDuringLoad) {
                if (!initialLoadErrorHolder) {
                    initialLoadErrorHolder = errorDuringLoad;
                }
            }
        }
    }


    // Handle global exports for the last entry point
    if (entryPoints.length > 0) {
        const lastModuleOutput = applicationModuleLoader(entryPoints[entryPoints.length - 1]);
        if (typeof exports === "object" && typeof module !== "undefined") {
            module.exports = lastModuleOutput;
        } else if (typeof define === "function" && define.amd) {
            define(() => lastModuleOutput);
        } else if (globalExportName) {
            this[globalExportName] = lastModuleOutput;
        }
    }

    // Re-throw if any error occurred during the initial entry point loading phase
    if (initialLoadErrorHolder) {
        throw initialLoadErrorHolder;
    }

    // Make this loader globally accessible for subsequent calls
    global.parcelRequire = applicationModuleLoader;
    return applicationModuleLoader;

}({
    "Focm": [function(moduleRequest, moduleRef, moduleExports) {
        // Renamed 'n' to '_psRuntime' for PureScript runtime modules
        const _psRuntime = {};

        // Helper for defining modules within the _psRuntime object
        const definePsModule = (modulePath, moduleFactory) => {
            const pathSegments = modulePath.split('.');
            let currentScope = _psRuntime;
            for (let i = 0; i < pathSegments.length - 1; i++) {
                currentScope[pathSegments[i]] = currentScope[pathSegments[i]] || {};
                currentScope = currentScope[pathSegments[i]];
            }
            const finalSegment = pathSegments[pathSegments.length - 1];
            currentScope[finalSegment] = currentScope[finalSegment] || {};
            moduleFactory(currentScope[finalSegment]);
        };

        // --- Control.Apply ---
        definePsModule("Control.Apply", exports => {
            "use strict";
            exports.arrayApply = function(functionList) {
                return function(argumentList) {
                    const functionsCount = functionList.length;
                    const argumentsCount = argumentList.length;
                    const resultCollection = new Array(functionsCount * argumentsCount);
                    let currentResultIndex = 0;
                    for (let fIndex = 0; fIndex < functionsCount; fIndex++) {
                        const currentFunction = functionList[fIndex];
                        for (let aIndex = 0; aIndex < argumentsCount; aIndex++) {
                            resultCollection[currentResultIndex++] = currentFunction(argumentList[aIndex]);
                        }
                    }
                    return resultCollection;
                };
            };
        });

        // --- Control.Semigroupoid ---
        definePsModule("Control.Semigroupoid", exports => {
            "use strict";
            const SemigroupoidType = function(composeOperation) {
                this.compose = composeOperation;
            };
            const functionSemigroupoidInstance = new SemigroupoidType(function(funcA) {
                return function(funcB) {
                    return function(inputVal) {
                        return funcA(funcB(inputVal));
                    };
                };
            });
            exports.compose = function(semigroupoidDict) {
                return semigroupoidDict.compose;
            };
            exports.Semigroupoid = SemigroupoidType;
            exports.semigroupoidFn = functionSemigroupoidInstance;
        });

        // --- Control.Category ---
        definePsModule("Control.Category", exports => {
            "use strict";
            const SemigroupoidModule = _psRuntime["Control.Semigroupoid"];
            const CategoryType = function(semigroupoidDict, identityFunction) {
                this.Semigroupoid0 = semigroupoidDict;
                this.identity = identityFunction;
            };
            const functionCategoryInstance = new CategoryType(
                () => SemigroupoidModule.semigroupoidFn,
                (value) => value
            );
            exports.Category = CategoryType;
            exports.identity = function(categoryDict) {
                return categoryDict.identity;
            };
            exports.categoryFn = functionCategoryInstance;
        });

        // --- Data.Boolean ---
        definePsModule("Data.Boolean", exports => {
            "use strict";
            exports.otherwise = true; // Represents the 'else' branch in PureScript pattern matching
        });

        // --- Data.Ring --- (intSub)
        definePsModule("Data.Ring", exports => {
            "use strict";
            exports.intSub = function(operand1) {
                return function(operand2) {
                    return (operand1 - operand2) | 0; // Bitwise OR to ensure 32-bit integer result
                };
            };
        });

        // --- Data.Semiring --- (intAdd, intMul)
        definePsModule("Data.Semiring", exports => {
            "use strict";
            exports.intAdd = function(operand1) {
                return function(operand2) {
                    return (operand1 + operand2) | 0;
                };
            };
            exports.intMul = function(operand1) {
                return function(operand2) {
                    return (operand1 * operand2) | 0;
                };
            };
        });

        // --- Data.Unit ---
        definePsModule("Data.Unit", exports => {
            "use strict";
            exports.unit = {}; // The single value of the Unit type
        });

        // --- Data.Show ---
        definePsModule("Data.Show", exports => {
            "use strict";
            exports.Show = function(displayFunction) {
                this.show = displayFunction;
            };
            exports.show = function(showDict) {
                return showDict.show;
            };
        });

        // --- Data.Unit (re-export) ---
        definePsModule("Data.Unit", exports => {
            "use strict";
            const unitModule = _psRuntime["Data.Unit"];
            exports.unit = unitModule.unit;
        });

        // --- Data.Semiring (full definition) ---
        definePsModule("Data.Semiring", exports => {
            "use strict";
            const semiringOperations = _psRuntime["Data.Semiring"];
            const SemiringType = function(addFunc, mulFunc, oneValue, zeroValue) {
                this.add = addFunc;
                this.mul = mulFunc;
                this.one = oneValue;
                this.zero = zeroValue;
            };
            const intSemiringInstance = new SemiringType(semiringOperations.intAdd, semiringOperations.intMul, 1, 0);
            exports.Semiring = SemiringType;
            exports.add = function(semiringDict) {
                return semiringDict.add;
            };
            exports.zero = function(semiringDict) {
                return semiringDict.zero;
            };
            exports.mul = function(semiringDict) {
                return semiringDict.mul;
            };
            exports.one = function(semiringDict) {
                return semiringDict.one;
            };
            exports.semiringInt = intSemiringInstance;
        });

        // --- Data.Ring (full definition) ---
        definePsModule("Data.Ring", exports => {
            "use strict";
            const ringOperations = _psRuntime["Data.Ring"];
            const SemiringModule = _psRuntime["Data.Semiring"];
            const RingType = function(semiringDict, subtractFunc) {
                this.Semiring0 = semiringDict;
                this.sub = subtractFunc;
            };
            const intRingInstance = new RingType(
                () => SemiringModule.semiringInt,
                ringOperations.intSub
            );
            exports.Ring = RingType;
            exports.sub = function(ringDict) {
                return ringDict.sub;
            };
            exports.ringInt = intRingInstance;
        });

        // --- Data.Function ---
        definePsModule("Data.Function", exports => {
            "use strict";
            exports.flip = function(originalFunction) {
                return function(argB) {
                    return function(argA) {
                        return originalFunction(argA)(argB);
                    };
                };
            };
            exports.const = function(constantValue) {
                return function(ignoredArgument) {
                    return constantValue;
                };
            };
        });

        // --- Data.Functor --- (arrayMap)
        definePsModule("Data.Functor", exports => {
            "use strict";
            exports.arrayMap = function(mappingFunction) {
                return function(sourceArray) {
                    const arrayLength = sourceArray.length;
                    const mappedArray = new Array(arrayLength);
                    for (let i = 0; i < arrayLength; i++) {
                        mappedArray[i] = mappingFunction(sourceArray[i]);
                    }
                    return mappedArray;
                };
            };
        });

        // --- Data.Functor (full definition) ---
        definePsModule("Data.Functor", exports => {
            "use strict";
            const FunctorModule = _psRuntime["Data.Functor"];
            const FunctionModule = _psRuntime["Data.Function"];
            const UnitModule = _psRuntime["Data.Unit"];
            const FunctorType = function(mapFunc) {
                this.map = mapFunc;
            };
            const getMap = function(functorDict) {
                return functorDict.map;
            };
            const arrayFunctorInstance = new FunctorType(FunctorModule.arrayMap);
            exports.Functor = FunctorType;
            exports.map = getMap;
            exports.void = function(functorDict) {
                return getMap(functorDict)(FunctionModule.const(UnitModule.unit));
            };
            exports.functorArray = arrayFunctorInstance;
        });

        // --- Control.Apply (full definition) ---
        definePsModule("Control.Apply", exports => {
            "use strict";
            const ApplyModule = _psRuntime["Control.Apply"];
            const CategoryModule = _psRuntime["Control.Category"];
            const FunctionModule = _psRuntime["Data.Function"];
            const FunctorModule = _psRuntime["Data.Functor"];
            const ApplyType = function(functorDict, applyFunc) {
                this.Functor0 = functorDict;
                this.apply = applyFunc;
            };
            const getApply = function(applyDict) {
                return applyDict.apply;
            };
            const arrayApplyInstance = new ApplyType(
                () => FunctorModule.functorArray,
                ApplyModule.arrayApply
            );
            exports.Apply = ApplyType;
            exports.apply = getApply;
            exports.applySecond = function(applyDict) {
                return function(fa) {
                    return function(fb) {
                        return getApply(applyDict)(FunctorModule.map(applyDict.Functor0())(FunctionModule.const(CategoryModule.identity(CategoryModule.categoryFn)))(fa))(fb);
                    };
                };
            };
            exports.applyArray = arrayApplyInstance;
        });

        // --- Control.Applicative ---
        definePsModule("Control.Applicative", exports => {
            "use strict";
            const ApplyModule = _psRuntime["Control.Apply"];
            const ApplicativeType = function(applyDict, pureFunc) {
                this.Apply0 = applyDict;
                this.pure = pureFunc;
            };
            const getPure = function(applicativeDict) {
                return applicativeDict.pure;
            };
            const arrayApplicativeInstance = new ApplicativeType(
                () => ApplyModule.applyArray,
                (value) => [value]
            );
            exports.Applicative = ApplicativeType;
            exports.pure = getPure;
            exports.liftA1 = function(applicativeDict) {
                return function(func) {
                    return function(arg) {
                        return ApplyModule.apply(applicativeDict.Apply0())(getPure(applicativeDict)(func))(arg);
                    };
                };
            };
            exports.applicativeArray = arrayApplicativeInstance;
        });

        // --- Control.Bind --- (arrayBind)
        definePsModule("Control.Bind", exports => {
            "use strict";
            exports.arrayBind = function(sourceArray) {
                return function(bindingFunction) {
                    const resultAccumulator = [];
                    for (let i = 0, len = sourceArray.length; i < len; i++) {
                        Array.prototype.push.apply(resultAccumulator, bindingFunction(sourceArray[i]));
                    }
                    return resultAccumulator;
                };
            };
        });

        // --- Control.Bind (full definition) ---
        definePsModule("Control.Bind", exports => {
            "use strict";
            const BindModule = _psRuntime["Control.Bind"];
            const ApplyModule = _psRuntime["Control.Apply"];
            const FunctionModule = _psRuntime["Data.Function"];
            const BindType = function(applyDict, bindFunc) {
                this.Apply0 = applyDict;
                this.bind = bindFunc;
            };
            const DiscardType = function(discardFunc) {
                this.discard = discardFunc;
            };
            const arrayBindInstance = new BindType(
                () => ApplyModule.applyArray,
                BindModule.arrayBind
            );
            const getBind = function(bindDict) {
                return bindDict.bind;
            };
            const bindFlipped = function(bindDict) {
                return FunctionModule.flip(getBind(bindDict));
            };
            const discardUnitInstance = new DiscardType(function(bindDict) {
                return getBind(bindDict);
            });
            exports.Bind = BindType;
            exports.bind = getBind;
            exports.bindFlipped = bindFlipped;
            exports.Discard = DiscardType;
            exports.discard = function(discardDict) {
                return discardDict.discard;
            };
            exports.composeKleisliFlipped = function(bindDict) {
                return function(func1) {
                    return function(func2) {
                        return function(arg) {
                            return bindFlipped(bindDict)(func2)(func1(arg));
                        };
                    };
                };
            };
            exports.bindArray = arrayBindInstance;
            exports.discardUnit = discardUnitInstance;
        });

        // --- Data.Semigroup --- (concatArray)
        definePsModule("Data.Semigroup", exports => {
            "use strict";
            exports.concatArray = function(arrayOne) {
                return function(arrayTwo) {
                    if (arrayOne.length === 0) return arrayTwo;
                    if (arrayTwo.length === 0) return arrayOne;
                    return arrayOne.concat(arrayTwo);
                };
            };
        });

        // --- Data.Semigroup (full definition) ---
        definePsModule("Data.Semigroup", exports => {
            "use strict";
            const SemigroupModule = _psRuntime["Data.Semigroup"];
            const SemigroupType = function(appendFunc) {
                this.append = appendFunc;
            };
            const arraySemigroupInstance = new SemigroupType(SemigroupModule.concatArray);
            exports.Semigroup = SemigroupType;
            exports.append = function(semigroupDict) {
                return semigroupDict.append;
            };
            exports.semigroupArray = arraySemigroupInstance;
        });

        // --- Control.Alt ---
        definePsModule("Control.Alt", exports => {
            "use strict";
            const FunctorModule = _psRuntime["Data.Functor"];
            const SemigroupModule = _psRuntime["Data.Semigroup"];
            const AltType = function(functorDict, altFunc) {
                this.Functor0 = functorDict;
                this.alt = altFunc;
            };
            const arrayAltInstance = new AltType(
                () => FunctorModule.functorArray,
                SemigroupModule.append(SemigroupModule.semigroupArray)
            );
            exports.Alt = AltType;
            exports.alt = function(altDict) {
                return altDict.alt;
            };
            exports.altArray = arrayAltInstance;
        });

        // --- Control.Plus ---
        definePsModule("Control.Plus", exports => {
            "use strict";
            const AltModule = _psRuntime["Control.Alt"];
            const PlusType = function(altDict, emptyValue) {
                this.Alt0 = altDict;
                this.empty = emptyValue;
            };
            const arrayPlusInstance = new PlusType(
                () => AltModule.altArray,
                []
            );
            exports.Plus = PlusType;
            exports.empty = function(plusDict) {
                return plusDict.empty;
            };
            exports.plusArray = arrayPlusInstance;
        });

        // --- Control.Alternative ---
        definePsModule("Control.Alternative", exports => {
            "use strict";
            const AltModule = _psRuntime["Control.Alt"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const PlusModule = _psRuntime["Control.Plus"];
            const AlternativeType = function(applicativeDict, plusDict) {
                this.Applicative0 = applicativeDict;
                this.Plus1 = plusDict;
            };
            const arrayAlternativeInstance = new AlternativeType(
                () => ApplicativeModule.applicativeArray,
                () => PlusModule.plusArray
            );
            exports.Alternative = AlternativeType;
            exports.alternativeArray = arrayAlternativeInstance;
        });

        // --- Control.Monad ---
        definePsModule("Control.Monad", exports => {
            "use strict";
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const ApplyModule = _psRuntime["Control.Apply"];
            const BindModule = _psRuntime["Control.Bind"];
            const MonadType = function(applicativeDict, bindDict) {
                this.Applicative0 = applicativeDict;
                this.Bind1 = bindDict;
            };
            const arrayMonadInstance = new MonadType(
                () => ApplicativeModule.applicativeArray,
                () => BindModule.bindArray
            );
            exports.Monad = MonadType;
            exports.ap = function(monadDict) {
                return function(mf) {
                    return function(ma) {
                        const bindOp = BindModule.bind(monadDict.Bind1());
                        return bindOp(mf)(function(f) {
                            return bindOp(ma)(function(a) {
                                return ApplicativeModule.pure(monadDict.Applicative0())(f(a));
                            });
                        });
                    };
                };
            };
            exports.monadArray = arrayMonadInstance;
        });

        // --- Control.MonadZero ---
        definePsModule("Control.MonadZero", exports => {
            "use strict";
            const AlternativeModule = _psRuntime["Control.Alternative"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const MonadModule = _psRuntime["Control.Monad"];
            const PlusModule = _psRuntime["Control.Plus"];
            const UnitModule = _psRuntime["Data.Unit"];
            const MonadZeroType = function(alternativeDict, monadDict) {
                this.Alternative1 = alternativeDict;
                this.Monad0 = monadDict;
            };
            const arrayMonadZeroInstance = new MonadZeroType(
                () => AlternativeModule.alternativeArray,
                () => MonadModule.monadArray
            );
            exports.MonadZero = MonadZeroType;
            exports.guard = function(monadZeroDict) {
                return function(condition) {
                    if (condition) {
                        return ApplicativeModule.pure(monadZeroDict.Alternative1().Applicative0())(UnitModule.unit);
                    }
                    // The original had a redundant `if (!condition)` after `if (condition)`
                    // which is logically equivalent to `else`.
                    // The error throw is for pattern match exhaustion, but a boolean `condition`
                    // will always fall into one of the first two branches.
                    return PlusModule.empty(monadZeroDict.Alternative1().Plus1());
                };
            };
            exports.monadZeroArray = arrayMonadZeroInstance;
        });

        // --- Data.Array ---
        definePsModule("Data.Array", exports => {
            "use strict";
            exports.range = function(startVal) {
                return function(endVal) {
                    const step = startVal > endVal ? -1 : 1;
                    const result = [];
                    const expectedSize = step * (endVal - startVal) + 1;

                    // Pre-allocate array for efficiency, but handle edge cases
                    if (expectedSize > 0) {
                        result.length = expectedSize;
                        let current = startVal;
                        let index = 0;
                        while (current !== endVal) {
                            result[index++] = current;
                            current += step;
                        }
                        result[index] = current; // Add the endVal
                    }
                    return result;
                };
            };
            exports.length = function(arr) {
                return arr.length;
            };
        });

        // --- Data.Foldable ---
        definePsModule("Data.Foldable", exports => {
            "use strict";
            exports.foldrArray = function(foldingFunction) {
                return function(initialAccumulator) {
                    return function(targetArray) {
                        let currentAccumulator = initialAccumulator;
                        for (let i = targetArray.length - 1; i >= 0; i--) {
                            currentAccumulator = foldingFunction(targetArray[i])(currentAccumulator);
                        }
                        return currentAccumulator;
                    };
                };
            };
            exports.foldlArray = function(foldingFunction) {
                return function(initialAccumulator) {
                    return function(targetArray) {
                        let currentAccumulator = initialAccumulator;
                        for (let i = 0, len = targetArray.length; i < len; i++) {
                            currentAccumulator = foldingFunction(currentAccumulator)(targetArray[i]);
                        }
                        return currentAccumulator;
                    };
                };
            };
        });

        // --- Data.EuclideanRing --- (intDegree, intDiv, intMod)
        definePsModule("Data.EuclideanRing", exports => {
            "use strict";
            exports.intDegree = function(n) {
                // Returns the absolute value, capped at MAX_INT
                return Math.min(Math.abs(n), 2147483647);
            };
            exports.intDiv = function(numerator) {
                return function(denominator) {
                    if (denominator === 0) return 0;
                    if (denominator > 0) return Math.floor(numerator / denominator);
                    return -Math.floor(numerator / -denominator);
                };
            };
            exports.intMod = function(numerator) {
                return function(denominator) {
                    if (denominator === 0) return 0;
                    const absoluteDenominator = Math.abs(denominator);
                    return (numerator % absoluteDenominator + absoluteDenominator) % absoluteDenominator;
                };
            };
        });

        // --- Data.CommutativeRing ---
        definePsModule("Data.CommutativeRing", exports => {
            "use strict";
            const RingModule = _psRuntime["Data.Ring"];
            const CommutativeRingType = function(ringDict) {
                this.Ring0 = ringDict;
            };
            const intCommutativeRingInstance = new CommutativeRingType(
                () => RingModule.ringInt
            );
            exports.CommutativeRing = CommutativeRingType;
            exports.commutativeRingInt = intCommutativeRingInstance;
        });

        // --- Data.EuclideanRing (full definition) ---
        definePsModule("Data.EuclideanRing", exports => {
            "use strict";
            const EuclideanRingOps = _psRuntime["Data.EuclideanRing"];
            const CommutativeRingModule = _psRuntime["Data.CommutativeRing"];
            const EuclideanRingType = function(commutativeRingDict, degreeFunc, divFunc, modFunc) {
                this.CommutativeRing0 = commutativeRingDict;
                this.degree = degreeFunc;
                this.div = divFunc;
                this.mod = modFunc;
            };
            const intEuclideanRingInstance = new EuclideanRingType(
                () => CommutativeRingModule.commutativeRingInt,
                EuclideanRingOps.intDegree,
                EuclideanRingOps.intDiv,
                EuclideanRingOps.intMod
            );
            exports.EuclideanRing = EuclideanRingType;
            exports.degree = function(euclideanRingDict) {
                return euclideanRingDict.degree;
            };
            exports.div = function(euclideanRingDict) {
                return euclideanRingDict.div;
            };
            exports.mod = function(euclideanRingDict) {
                return euclideanRingDict.mod;
            };
            exports.euclideanRingInt = intEuclideanRingInstance;
        });

        // --- Data.Monoid ---
        definePsModule("Data.Monoid", exports => {
            "use strict";
            exports.Monoid = function(semigroupDict, emptyValue) {
                this.Semigroup0 = semigroupDict;
                this.mempty = emptyValue;
            };
            exports.mempty = function(monoidDict) {
                return monoidDict.mempty;
            };
        });

        // --- Data.Maybe ---
        definePsModule("Data.Maybe", exports => {
            "use strict";
            const NothingValue = (function() {
                function NothingSentinel() {}
                NothingSentinel.value = new NothingSentinel();
                return NothingSentinel;
            })();
            const JustConstructor = (function() {
                function JustWrapper(value) {
                    this.value0 = value;
                }
                JustWrapper.create = function(value) {
                    return new JustWrapper(value);
                };
                return JustWrapper;
            })();
            exports.Nothing = NothingValue;
            exports.Just = JustConstructor;
            exports.maybe = function(onNothingResult) {
                return function(onJustFunction) {
                    return function(maybeInstance) {
                        if (maybeInstance instanceof NothingValue) {
                            return onNothingResult;
                        }
                        if (maybeInstance instanceof JustConstructor) {
                            return onJustFunction(maybeInstance.value0);
                        }
                        throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [onNothingResult.constructor.name, onJustFunction.constructor.name, maybeInstance.constructor.name]);
                    };
                };
            };
        });

        // --- Data.Foldable (full definition) ---
        definePsModule("Data.Foldable", exports => {
            "use strict";
            const FoldableArrayOperations = _psRuntime["Data.Foldable"];
            const ApplyModule = _psRuntime["Control.Apply"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const SemigroupModule = _psRuntime["Data.Semigroup"];
            const MonoidModule = _psRuntime["Data.Monoid"];
            const UnitModule = _psRuntime["Data.Unit"];
            const FoldableType = function(foldMapFunc, foldlFunc, foldrFunc) {
                this.foldMap = foldMapFunc;
                this.foldl = foldlFunc;
                this.foldr = foldrFunc;
            };
            const getFoldr = function(foldableDict) {
                return foldableDict.foldr;
            };
            const defaultFoldMapRight = function(foldableDict) {
                return function(monoidDict) { // Original used dictSemigroup, but needs mempty from Monoid
                    return function(mappingFunc) {
                        return getFoldr(foldableDict)(function(item) {
                            return function(acc) {
                                return SemigroupModule.append(monoidDict.Semigroup0())(mappingFunc(item))(acc);
                            };
                        })(MonoidModule.mempty(monoidDict));
                    };
                };
            };
            const arrayFoldableInstance = new FoldableType(
                function(monoidDict) {
                    return defaultFoldMapRight(arrayFoldableInstance)(monoidDict);
                },
                FoldableArrayOperations.foldlArray,
                FoldableArrayOperations.foldrArray
            );
            exports.Foldable = FoldableType;
            exports.foldr = getFoldr;
            exports.foldl = function(foldableDict) {
                return foldableDict.foldl;
            };
            exports.foldMap = function(foldableDict) {
                return foldableDict.foldMap;
            };
            exports.foldMapDefaultR = defaultFoldMapRight;
            exports.traverse_ = function(applicativeDict) {
                return function(foldableDict) {
                    return function(actionFunc) {
                        return function(collection) {
                            return getFoldr(foldableDict)(function(item) {
                                return ApplyModule.applySecond(applicativeDict.Apply0())(actionFunc(item));
                            })(ApplicativeModule.pure(applicativeDict)(UnitModule.unit));
                        };
                    };
                };
            };
            exports.foldableArray = arrayFoldableInstance;
        });

        // --- Data.Tuple ---
        definePsModule("Data.Tuple", exports => {
            "use strict";
            const TupleConstructor = (function() {
                function TuplePair(firstValue, secondValue) {
                    this.value0 = firstValue;
                    this.value1 = secondValue;
                }
                TuplePair.create = function(firstValue) {
                    return function(secondValue) {
                        return new TuplePair(firstValue, secondValue);
                    };
                };
                return TuplePair;
            })();
            exports.Tuple = TupleConstructor;
        });

        // --- Partial.Unsafe ---
        definePsModule("Partial.Unsafe", exports => {
            "use strict";
            exports.unsafePartial = function(thunk) {
                return thunk();
            };
        });

        // --- Partial ---
        definePsModule("Partial", exports => {
            "use strict";
            exports.crashWith = function() {
                return function(errorMessage) {
                    throw new Error(errorMessage);
                };
            };
        });

        // --- Partial (re-export) ---
        definePsModule("Partial", exports => {
            "use strict";
            const PartialModule = _psRuntime["Partial"];
            exports.crashWith = PartialModule.crashWith;
        });

        // --- Partial.Unsafe (full definition) ---
        definePsModule("Partial.Unsafe", exports => {
            "use strict";
            const UnsafePartialModule = _psRuntime["Partial.Unsafe"];
            const PartialModule = _psRuntime["Partial"];
            exports.unsafeCrashWith = function(message) {
                return UnsafePartialModule.unsafePartial(function() {
                    return PartialModule.crashWith()(message);
                });
            };
        });

        // --- Unsafe.Coerce ---
        definePsModule("Unsafe.Coerce", exports => {
            "use strict";
            exports.unsafeCoerce = function(value) {
                return value;
            };
        });

        // --- Unsafe.Coerce (re-export) ---
        definePsModule("Unsafe.Coerce", exports => {
            "use strict";
            const UnsafeCoerceModule = _psRuntime["Unsafe.Coerce"];
            exports.unsafeCoerce = UnsafeCoerceModule.unsafeCoerce;
        });

        // --- Data.Array (full definition) ---
        definePsModule("Data.Array", exports => {
            "use strict";
            const ArrayUtilityFunctions = _psRuntime["Data.Array"];
            exports.null = function(arr) {
                return ArrayUtilityFunctions.length(arr) === 0;
            };
            exports.range = ArrayUtilityFunctions.range;
        });

        // --- Data.Either ---
        definePsModule("Data.Either", exports => {
            "use strict";
            const ApplyModule = _psRuntime["Control.Apply"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const BindModule = _psRuntime["Control.Bind"];
            const FunctorModule = _psRuntime["Data.Functor"];
            const MaybeModule = _psRuntime["Data.Maybe"];

            const LeftConstructor = (function() {
                function LeftCase(value) {
                    this.value0 = value;
                }
                LeftCase.create = function(value) {
                    return new LeftCase(value);
                };
                return LeftCase;
            })();

            const RightConstructor = (function() {
                function RightCase(value) {
                    this.value0 = value;
                }
                RightCase.create = function(value) {
                    return new RightCase(value);
                };
                return RightCase;
            })();

            const eitherFunctorInstance = new FunctorModule.Functor(function(mapFn) {
                return function(eitherValue) {
                    if (eitherValue instanceof LeftConstructor) {
                        return new LeftConstructor(eitherValue.value0);
                    }
                    if (eitherValue instanceof RightConstructor) {
                        return new RightConstructor(mapFn(eitherValue.value0));
                    }
                    throw new Error("Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [eitherValue.constructor.name]);
                };
            });

            const eitherApplyInstance = new ApplyModule.Apply(
                () => eitherFunctorInstance,
                function(functionEither) {
                    return function(valueEither) {
                        if (functionEither instanceof LeftConstructor) {
                            return new LeftConstructor(functionEither.value0);
                        }
                        if (functionEither instanceof RightConstructor) {
                            return FunctorModule.map(eitherFunctorInstance)(functionEither.value0)(valueEither);
                        }
                        throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [functionEither.constructor.name, valueEither.constructor.name]);
                    };
                }
            );

            const eitherBindInstance = new BindModule.Bind(
                () => eitherApplyInstance,
                function(eitherValue) {
                    return function(bindFn) {
                        if (eitherValue instanceof LeftConstructor) {
                            return new LeftConstructor(eitherValue.value0);
                        }
                        if (eitherValue instanceof RightConstructor) {
                            return bindFn(eitherValue.value0);
                        }
                        throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [eitherValue.constructor.name, bindFn.constructor.name]);
                    };
                }
            );

            const eitherApplicativeInstance = new ApplicativeModule.Applicative(
                () => eitherApplyInstance,
                RightConstructor.create
            );

            exports.Left = LeftConstructor;
            exports.Right = RightConstructor;
            exports.either = function(handleLeft) {
                return function(handleRight) {
                    return function(eitherValue) {
                        if (eitherValue instanceof LeftConstructor) {
                            return handleLeft(eitherValue.value0);
                        }
                        if (eitherValue instanceof RightConstructor) {
                            return handleRight(eitherValue.value0);
                        }
                        throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [handleLeft.constructor.name, handleRight.constructor.name, eitherValue.constructor.name]);
                    };
                };
            };
            exports.note = function(leftValue) {
                return MaybeModule.maybe(new LeftConstructor(leftValue))(RightConstructor.create);
            };
            exports.functorEither = eitherFunctorInstance;
            exports.applyEither = eitherApplyInstance;
            exports.applicativeEither = eitherApplicativeInstance;
            exports.bindEither = eitherBindInstance;
        });

        // --- Data.Int --- (fromStringAsImpl)
        definePsModule("Data.Int", exports => {
            "use strict";
            exports.fromStringAsImpl = function(justWrapper) {
                return function(nothingValue) {
                    return function(radixBase) {
                        return function(inputString) {
                            let charSetPattern;
                            // Determine the regex character set based on radix
                            if (radixBase < 11) {
                                charSetPattern = "[0-" + (radixBase - 1).toString() + "]";
                            } else if (radixBase === 11) {
                                charSetPattern = "[0-9a]";
                            } else { // radixBase > 11
                                charSetPattern = "[0-9a-" + String.fromCharCode(86 + radixBase) + "]";
                            }

                            const validationRegex = new RegExp("^[\\+\\-]?" + charSetPattern + "+$", "i");

                            if (validationRegex.test(inputString)) {
                                const parsedInteger = parseInt(inputString, radixBase);
                                // Validate if parsed value is a valid integer without floating point or overflow
                                if ((parsedInteger | 0) === parsedInteger) {
                                    return justWrapper(parsedInteger);
                                }
                                return nothingValue;
                            }
                            return nothingValue;
                        };
                    };
                };
            };
        });

        // --- Data.Int (full definition) ---
        definePsModule("Data.Int", exports => {
            "use strict";
            const IntImplementation = _psRuntime["Data.Int"];
            const MaybeModule = _psRuntime["Data.Maybe"];
            const parseIntegerBase10 = IntImplementation.fromStringAsImpl(MaybeModule.Just.create)(MaybeModule.Nothing.value)(10);

            exports.fromString = parseIntegerBase10;
            exports.fromStringAs = IntImplementation.fromStringAsImpl(MaybeModule.Just.create)(MaybeModule.Nothing.value);
        });

        // --- Data.String.Common --- (trim)
        definePsModule("Data.String.Common", exports => {
            "use strict";
            exports.trim = function(inputStr) {
                return inputStr.trim();
            };
        });

        // --- Data.String.Common (re-export) ---
        definePsModule("Data.String.Common", exports => {
            "use strict";
            const StringCommonModule = _psRuntime["Data.String.Common"];
            exports.trim = StringCommonModule.trim;
        });

        // --- Effect ---
        definePsModule("Effect", exports => {
            "use strict";
            exports.pureE = function(value) {
                return function() {
                    return value;
                };
            };
            exports.bindE = function(effectComputation) {
                return function(continuationFunction) {
                    return function() {
                        return continuationFunction(effectComputation())();
                    };
                };
            };
        });

        // --- Effect (full definition) ---
        definePsModule("Effect", exports => {
            "use strict";
            const EffectModule = _psRuntime["Effect"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const ApplyModule = _psRuntime["Control.Apply"];
            const BindModule = _psRuntime["Control.Bind"];
            const MonadModule = _psRuntime["Control.Monad"];
            const FunctorModule = _psRuntime["Data.Functor"];

            const monadEffectInstance = new MonadModule.Monad(
                () => applicativeEffectInstance,
                () => bindEffectInstance
            );
            const bindEffectInstance = new BindModule.Bind(
                () => applyEffectInstance,
                EffectModule.bindE
            );
            const applyEffectInstance = new ApplyModule.Apply(
                () => functorEffectInstance,
                MonadModule.ap(monadEffectInstance)
            );
            const applicativeEffectInstance = new ApplicativeModule.Applicative(
                () => applyEffectInstance,
                EffectModule.pureE
            );
            const functorEffectInstance = new FunctorModule.Functor(ApplicativeModule.liftA1(applicativeEffectInstance));

            exports.functorEffect = functorEffectInstance;
            exports.applyEffect = applyEffectInstance;
            exports.applicativeEffect = applicativeEffectInstance;
            exports.bindEffect = bindEffectInstance;
            exports.monadEffect = monadEffectInstance;
        });

        // --- Effect.Aff ---
        definePsModule("Effect.Aff", exports => {
            "use strict";
            // This section implements a complex trampoline-based asynchronous effect monad (Aff).
            // Changes here are primarily identifier renaming and minor structural reformatting,
            // as the underlying state machine and control flow are highly optimized and critical.

            const AffExecutionEngine = (function() {
                const EmptySentinel = {};
                const EFFECT_TAG_PURE = "Pure";
                const EFFECT_TAG_THROW = "Throw";
                const EFFECT_TAG_CATCH = "Catch";
                const EFFECT_TAG_SYNC = "Sync";
                const EFFECT_TAG_ASYNC = "Async";
                const EFFECT_TAG_BIND = "Bind";
                const EFFECT_TAG_BRACKET = "Bracket";
                const EFFECT_TAG_FORK = "Fork";
                const EFFECT_TAG_SEQUENTIAL = "Sequential";
                const EFFECT_TAG_PAR_MAP = "Map";
                const EFFECT_TAG_PAR_APPLY = "Apply";
                const EFFECT_TAG_PAR_ALT = "Alt";

                // Stack frame tags for Fiber's internal state management
                const STACK_TAG_CONS = "Cons";
                const STACK_TAG_RESUME = "Resume";
                const STACK_TAG_RELEASE = "Release";
                const STACK_TAG_FINALIZER = "Finalizer";
                const STACK_TAG_FINALIZED = "Finalized";
                const STACK_TAG_FORKED = "Forked";

                function EffectNode(tag, value1, value2, value3) {
                    this.tag = tag;
                    this._1 = value1;
                    this._2 = value2;
                    this._3 = value3;
                }

                function createEffectConstructor(tag) {
                    const constructorFunction = function(val1, val2, val3) {
                        return new EffectNode(tag, val1, val2, val3);
                    };
                    constructorFunction.tag = tag;
                    return constructorFunction;
                }

                function createPureEffect(value) {
                    return new EffectNode(EFFECT_TAG_PURE, value);
                }

                function executeSyncUnsafe(action) {
                    try {
                        action();
                    } catch (error) {
                        // Schedule the error to be thrown asynchronously to prevent blocking
                        setTimeout(() => {
                            throw error;
                        }, 0);
                    }
                }

                function attemptCatchSync(errorMapper, successHandler, thunk) {
                    try {
                        return successHandler(thunk());
                    } catch (error) {
                        return errorMapper(error);
                    }
                }

                function executeAsyncWithCanceler(errorMapper, asyncAction, cancelerAction) {
                    try {
                        return asyncAction(cancelerAction);
                    } catch (error) {
                        return cancelerAction(errorMapper(error))();
                    }
                }

                // Global scheduler for microtasks
                const MicrotaskScheduler = (function() {
                    const queueCapacity = 1024;
                    let currentTaskCount = 0;
                    let queueHeadPointer = 0;
                    const taskBuffer = new Array(queueCapacity);
                    let isProcessingQueue = false;

                    function drainTaskQueue() {
                        let taskToExecute;
                        isProcessingQueue = true;
                        while (currentTaskCount !== 0) {
                            currentTaskCount--;
                            taskToExecute = taskBuffer[queueHeadPointer];
                            taskBuffer[queueHeadPointer] = undefined; // Clear reference
                            queueHeadPointer = (queueHeadPointer + 1) % queueCapacity;
                            taskToExecute();
                        }
                        isProcessingQueue = false;
                    }

                    return {
                        isDraining: function() {
                            return isProcessingQueue;
                        },
                        enqueue: function(task) {
                            let shouldDrainAfterEnqueue = true;
                            if (currentTaskCount === queueCapacity) {
                                shouldDrainAfterEnqueue = isProcessingQueue;
                                drainTaskQueue(); // If queue is full, drain it now
                                isProcessingQueue = shouldDrainAfterEnqueue; // Restore state
                            }
                            taskBuffer[(queueHeadPointer + currentTaskCount) % queueCapacity] = task;
                            currentTaskCount++;
                            if (!isProcessingQueue) {
                                drainTaskQueue();
                            }
                        }
                    };
                })();

                // Fiber state machine constants
                const FIBER_STATE_IDLE = 0;
                const FIBER_STATE_ACTIVE = 1;
                const FIBER_STATE_CONTINUING = 2;
                const FIBER_STATE_WAITING_ASYNC = 3;
                const FIBER_STATE_ASYNC_CANCELLING = 4;
                const FIBER_STATE_STOPPED = 5;
                const FIBER_STATE_COMPLETED = 6;

                // Fiber implementation
                function Fiber(eitherApi, supervisorInstance, initialEffect) {
                    let executionTick = 0;
                    let fiberCurrentState = FIBER_STATE_IDLE;
                    let currentEffectValue = initialEffect;
                    let pendingError = null;
                    let bindContinuations = null;
                    let bindContinuationsTail = null;
                    let bracketCleanupStack = null;
                    let activeBracketCount = 0;
                    let activeFinalizerCount = 0;
                    let completionHandlers = null;
                    let shouldRethrowUnhandled = true;

                    function executeFiberLoop(tickIdentifier) {
                        let currentStackElement;
                        let nextStackElement;
                        let stackElementTag;

                        while (true) {
                            switch (fiberCurrentState) {
                                case FIBER_STATE_CONTINUING:
                                    fiberCurrentState = FIBER_STATE_ACTIVE;
                                    currentEffectValue = bindContinuations(currentEffectValue);
                                    if (bindContinuationsTail === null) {
                                        bindContinuations = null;
                                    } else {
                                        bindContinuations = bindContinuationsTail._1;
                                        bindContinuationsTail = bindContinuationsTail._2;
                                    }
                                    break;

                                case FIBER_STATE_WAITING_ASYNC:
                                    if (eitherApi.isLeft(currentEffectValue)) {
                                        fiberCurrentState = FIBER_STATE_STOPPED;
                                        pendingError = currentEffectValue;
                                        currentEffectValue = null;
                                    } else if (bindContinuations === null) {
                                        fiberCurrentState = FIBER_STATE_STOPPED;
                                    } else {
                                        fiberCurrentState = FIBER_STATE_CONTINUING;
                                        currentEffectValue = eitherApi.fromRight(currentEffectValue);
                                    }
                                    break;

                                case FIBER_STATE_ACTIVE:
                                    switch (currentEffectValue.tag) {
                                        case EFFECT_TAG_BIND:
                                            if (bindContinuations) {
                                                bindContinuationsTail = new EffectNode(STACK_TAG_CONS, bindContinuations, bindContinuationsTail);
                                            }
                                            bindContinuations = currentEffectValue._2;
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = currentEffectValue._1;
                                            break;

                                        case EFFECT_TAG_PURE:
                                            if (bindContinuations === null) {
                                                fiberCurrentState = FIBER_STATE_STOPPED;
                                            } else {
                                                fiberCurrentState = FIBER_STATE_CONTINUING;
                                                currentEffectValue = currentEffectValue._1;
                                            }
                                            break;

                                        case EFFECT_TAG_SYNC:
                                            fiberCurrentState = FIBER_STATE_WAITING_ASYNC;
                                            currentEffectValue = attemptCatchSync(eitherApi.left, eitherApi.right, currentEffectValue._1);
                                            break;

                                        case EFFECT_TAG_ASYNC:
                                            fiberCurrentState = FIBER_STATE_ASYNC_CANCELLING;
                                            currentEffectValue = executeAsyncWithCanceler(eitherApi.left, currentEffectValue._1, (result) => () => {
                                                if (executionTick === tickIdentifier) {
                                                    executionTick++;
                                                    MicrotaskScheduler.enqueue(() => {
                                                        if (executionTick === tickIdentifier + 1) {
                                                            fiberCurrentState = FIBER_STATE_WAITING_ASYNC;
                                                            currentEffectValue = result;
                                                            executeFiberLoop(executionTick);
                                                        }
                                                    });
                                                }
                                            });
                                            return; // Yield control until async operation completes

                                        case EFFECT_TAG_THROW:
                                            fiberCurrentState = FIBER_STATE_STOPPED;
                                            pendingError = eitherApi.left(currentEffectValue._1);
                                            currentEffectValue = null;
                                            break;

                                        case EFFECT_TAG_CATCH:
                                            bracketCleanupStack = new EffectNode(STACK_TAG_CONS, currentEffectValue, bracketCleanupStack === null ? bracketCleanupStack : new EffectNode(STACK_TAG_RESUME, bindContinuations, bindContinuationsTail), pendingError);
                                            bindContinuations = null;
                                            bindContinuationsTail = null;
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = currentEffectValue._1;
                                            break;

                                        case EFFECT_TAG_BRACKET:
                                            activeBracketCount++;
                                            bracketCleanupStack = new EffectNode(STACK_TAG_CONS, currentEffectValue, bracketCleanupStack === null ? bracketCleanupStack : new EffectNode(STACK_TAG_RESUME, bindContinuations, bindContinuationsTail), pendingError);
                                            bindContinuations = null;
                                            bindContinuationsTail = null;
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = currentEffectValue._1;
                                            break;

                                        case EFFECT_TAG_FORK:
                                            fiberCurrentState = FIBER_STATE_WAITING_ASYNC;
                                            const childFiber = Fiber(eitherApi, supervisorInstance, currentEffectValue._2);
                                            if (supervisorInstance) supervisorInstance.register(childFiber);
                                            if (currentEffectValue._1) childFiber.run();
                                            currentEffectValue = eitherApi.right(childFiber);
                                            break;

                                        case EFFECT_TAG_SEQUENTIAL:
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = runSequentialParallel(eitherApi, supervisorInstance, currentEffectValue._1);
                                            break;
                                    }
                                    break;

                                case FIBER_STATE_STOPPED:
                                    bindContinuations = null;
                                    bindContinuationsTail = null;
                                    if (bracketCleanupStack === null) {
                                        fiberCurrentState = FIBER_STATE_COMPLETED;
                                        currentEffectValue = pendingError || currentEffectValue;
                                    } else {
                                        currentStackElement = bracketCleanupStack._1;
                                        bracketCleanupStack = bracketCleanupStack._2;
                                        pendingError = bracketCleanupStack._3;
                                        stackElementTag = currentStackElement.tag;

                                        if (stackElementTag === EFFECT_TAG_CATCH) {
                                            if (pendingError && pendingError !== bracketCleanupStack._3) {
                                                fiberCurrentState = FIBER_STATE_STOPPED;
                                            } else if (pendingError) {
                                                fiberCurrentState = FIBER_STATE_ACTIVE;
                                                currentEffectValue = currentStackElement._2(eitherApi.fromLeft(pendingError));
                                                pendingError = null;
                                            }
                                        } else if (stackElementTag === STACK_TAG_RESUME) {
                                            if (pendingError && pendingError !== bracketCleanupStack._3) {
                                                fiberCurrentState = FIBER_STATE_STOPPED;
                                            } else {
                                                bindContinuations = currentStackElement._1;
                                                bindContinuationsTail = currentStackElement._2;
                                                fiberCurrentState = FIBER_STATE_CONTINUING;
                                                currentEffectValue = eitherApi.fromRight(currentEffectValue);
                                            }
                                        } else if (stackElementTag === EFFECT_TAG_BRACKET) {
                                            activeBracketCount--;
                                            if (pendingError === bracketCleanupStack._3 || activeBracketCount > 0) {
                                                fiberCurrentState = FIBER_STATE_STOPPED;
                                            } else {
                                                const successResult = eitherApi.fromRight(currentEffectValue);
                                                bracketCleanupStack = new EffectNode(STACK_TAG_CONS, new EffectNode(STACK_TAG_RELEASE, currentStackElement._2, successResult), bracketCleanupStack, pendingError);
                                                fiberCurrentState = FIBER_STATE_ACTIVE;
                                                currentEffectValue = currentStackElement._3(successResult);
                                                pendingError = null;
                                            }
                                        } else if (stackElementTag === STACK_TAG_RELEASE) {
                                            activeFinalizerCount++;
                                            bracketCleanupStack = new EffectNode(STACK_TAG_CONS, new EffectNode(STACK_TAG_FINALIZED, currentEffectValue, pendingError), bracketCleanupStack, pendingError);
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = pendingError && pendingError !== bracketCleanupStack._3 ? currentStackElement._1.killed(eitherApi.fromLeft(pendingError))(currentStackElement._2) :
                                                                pendingError ? currentStackElement._1.failed(eitherApi.fromLeft(pendingError))(currentStackElement._2) :
                                                                currentStackElement._1.completed(eitherApi.fromRight(currentEffectValue))(currentStackElement._2);
                                            pendingError = null;
                                        } else if (stackElementTag === STACK_TAG_FINALIZER) {
                                            activeFinalizerCount++;
                                            bracketCleanupStack = new EffectNode(STACK_TAG_CONS, new EffectNode(STACK_TAG_FINALIZED, currentEffectValue, pendingError), bracketCleanupStack, pendingError);
                                            fiberCurrentState = FIBER_STATE_ACTIVE;
                                            currentEffectValue = currentStackElement._1;
                                            pendingError = null;
                                        } else if (stackElementTag === STACK_TAG_FINALIZED) {
                                            activeFinalizerCount--;
                                            fiberCurrentState = FIBER_STATE_STOPPED;
                                            currentEffectValue = currentStackElement._1;
                                            pendingError = currentStackElement._2;
                                        } else {
                                            fiberCurrentState = FIBER_STATE_STOPPED;
                                            pendingError = eitherApi.left(new Error(`Unknown stack frame tag: ${stackElementTag}`));
                                        }
                                    }
                                    break;

                                case FIBER_STATE_COMPLETED:
                                    for (const handlerId in completionHandlers) {
                                        if (completionHandlers.hasOwnProperty(handlerId)) {
                                            shouldRethrowUnhandled = shouldRethrowUnhandled && completionHandlers[handlerId].rethrow;
                                            executeSyncUnsafe(() => completionHandlers[handlerId].handler(currentEffectValue));
                                        }
                                    }
                                    completionHandlers = null;
                                    if (pendingError && shouldRethrowUnhandled) {
                                        setTimeout(() => {
                                            throw eitherApi.fromLeft(pendingError);
                                        }, 0);
                                    }
                                    return;

                                case FIBER_STATE_IDLE:
                                    fiberCurrentState = FIBER_STATE_ACTIVE;
                                    break;

                                case FIBER_STATE_ASYNC_CANCELLING:
                                    return;
                            }
                        }
                    }

                    let handlerIdCounter = 0;
                    function registerFiberCompletionHandler(handlerOptions) {
                        return function() {
                            if (fiberCurrentState === FIBER_STATE_COMPLETED) {
                                shouldRethrowUnhandled = shouldRethrowUnhandled && handlerOptions.rethrow;
                                handlerOptions.handler(currentEffectValue)();
                                return () => {};
                            }
                            const handlerID = handlerIdCounter++;
                            completionHandlers = completionHandlers || {};
                            completionHandlers[handlerID] = handlerOptions;
                            return function() {
                                if (completionHandlers) {
                                    delete completionHandlers[handlerID];
                                }
                            };
                        };
                    }

                    return {
                        kill: function(killReason, completionCallback) {
                            return function() {
                                if (fiberCurrentState === FIBER_STATE_COMPLETED) {
                                    completionCallback(eitherApi.right(undefined))();
                                    return () => {};
                                }
                                const cleanupCanceler = registerFiberCompletionHandler({ rethrow: false, handler: () => completionCallback(eitherApi.right(undefined)) })();
                                switch (fiberCurrentState) {
                                    case FIBER_STATE_IDLE:
                                        pendingError = eitherApi.left(killReason);
                                        fiberCurrentState = FIBER_STATE_COMPLETED;
                                        currentEffectValue = pendingError;
                                        executeFiberLoop(executionTick);
                                        break;
                                    case FIBER_STATE_ASYNC_CANCELLING:
                                        if (pendingError === null) {
                                            pendingError = eitherApi.left(killReason);
                                        }
                                        if (activeFinalizerCount === 0) {
                                            bracketCleanupStack = new EffectNode(STACK_TAG_CONS, new EffectNode(STACK_TAG_FINALIZER, currentEffectValue(killReason)), bracketCleanupStack, pendingError);
                                            fiberCurrentState = FIBER_STATE_STOPPED;
                                            currentEffectValue = null;
                                            pendingError = null;
                                            executeFiberLoop(++executionTick);
                                        }
                                        break;
                                    default:
                                        if (pendingError === null) {
                                            pendingError = eitherApi.left(killReason);
                                        }
                                        if (activeFinalizerCount === 0) {
                                            fiberCurrentState = FIBER_STATE_STOPPED;
                                            currentEffectValue = null;
                                            pendingError = null;
                                        }
                                }
                                return cleanupCanceler;
                            };
                        },
                        join: function(callback) {
                            return function() {
                                const joinCleanup = registerFiberCompletionHandler({ rethrow: false, handler: callback })();
                                if (fiberCurrentState === FIBER_STATE_IDLE) {
                                    executeFiberLoop(executionTick);
                                }
                                return joinCleanup;
                            };
                        },
                        onComplete: registerFiberCompletionHandler,
                        isSuspended: function() {
                            return fiberCurrentState === FIBER_STATE_IDLE;
                        },
                        run: function() {
                            if (fiberCurrentState === FIBER_STATE_IDLE) {
                                MicrotaskScheduler.isDraining() ? executeFiberLoop(executionTick) : MicrotaskScheduler.enqueue(() => executeFiberLoop(executionTick));
                            }
                        }
                    };
                }

                // Sequential execution of parallel effects (ParAff)
                function runSequentialParallel(eitherApi, supervisorInstance, sequentialEffect) {
                    let parallelEffectCount = 0;
                    const activeParallelFibers = {};
                    let effectNodeId = 0;
                    const earlyTerminationError = new Error("[ParAff] Early exit signal");
                    let globalFailure = null;
                    const eitherInterface = eitherApi;

                    // Helper to collect and cancel active parallel effects
                    function collectAndCancelActiveEffects(cancelReason, effectTree, doneCallback) {
                        let activeCancellations = 0;
                        const individualCancelers = {};
                        const traversalStack = [];
                        let currentEffectInTree = effectTree;

                        // Iterative DFS to find Forked effects
                        while (currentEffectInTree || traversalStack.length > 0) {
                            if (currentEffectInTree) {
                                if (currentEffectInTree.tag === STACK_TAG_FORKED) {
                                    if (activeParallelFibers[currentEffectInTree._1]) {
                                        const fiberToKill = activeParallelFibers[currentEffectInTree._1];
                                        individualCancelers[activeCancellations++] = fiberToKill.kill(cancelReason, () => () => {
                                            if (--activeCancellations === 0) doneCallback(eitherInterface.right(undefined))();
                                        });
                                    }
                                } else if (currentEffectInTree.tag === EFFECT_TAG_PAR_MAP ||
                                           currentEffectInTree.tag === EFFECT_TAG_PAR_APPLY ||
                                           currentEffectInTree.tag === EFFECT_TAG_PAR_ALT) {
                                    traversalStack.push(currentEffectInTree._2); // Push right child
                                    currentEffectInTree = currentEffectInTree._1; // Go left
                                    continue;
                                }
                            }
                            currentEffectInTree = traversalStack.pop();
                        }

                        if (activeCancellations === 0) {
                            doneCallback(eitherInterface.right(undefined))();
                        } else {
                            for (let i = 0; i < activeCancellations; i++) {
                                individualCancelers[i](); // Execute the collected cancelers
                            }
                        }
                        return individualCancelers;
                    }

                    function onParallelFiberCompleted(fiberDetails) {
                        return function(resultValue) {
                            return function() {
                                delete activeParallelFibers[fiberDetails._1];
                                fiberDetails._3 = resultValue; // Update the effect node with its result

                                (function propagateResultUpTree(currentResult, currentEffectNode, parentStackNode) {
                                    let leftResultVal;
                                    let rightResultVal;
                                    if (eitherInterface.isLeft(currentResult)) {
                                        leftResultVal = currentResult;
                                        rightResultVal = null;
                                    } else {
                                        rightResultVal = currentResult;
                                        leftResultVal = null;
                                    }

                                    if (globalFailure !== null) return; // Already failed globally

                                    if (currentEffectNode === null) {
                                        return doneCallback(leftResultVal || rightResultVal)();
                                    }

                                    switch (currentEffectNode.tag) {
                                        case EFFECT_TAG_PAR_MAP:
                                            if (leftResultVal) {
                                                currentEffectNode._3 = leftResultVal;
                                            } else {
                                                const mappedValue = currentEffectNode._1(eitherInterface.fromRight(rightResultVal));
                                                currentEffectNode._3 = eitherInterface.right(mappedValue);
                                            }
                                            break;
                                        case EFFECT_TAG_PAR_APPLY:
                                            const leftChildRes = currentEffectNode._1._3;
                                            const rightChildRes = currentEffectNode._2._3;
                                            if (leftResultVal) { // If this branch failed
                                                currentEffectNode._3 = leftResultVal;
                                                const otherChildPending = leftChildRes === EmptySentinel || rightChildRes === EmptySentinel;
                                                if (otherChildPending) {
                                                    collectAndCancelActiveEffects(earlyTerminationError, leftResultVal === leftChildRes ? currentEffectNode._2 : currentEffectNode._1, () => () => {
                                                        // Cleanup logic
                                                    });
                                                }
                                            } else { // This branch succeeded
                                                if (leftChildRes === EmptySentinel || rightChildRes === EmptySentinel) {
                                                    return; // Wait for other branch
                                                }
                                                const appliedValue = eitherInterface.fromRight(leftChildRes)(eitherInterface.fromRight(rightChildRes));
                                                currentEffectNode._3 = eitherInterface.right(appliedValue);
                                            }
                                            break;
                                        case EFFECT_TAG_PAR_ALT:
                                            const altLeftChildRes = currentEffectNode._1._3;
                                            const altRightChildRes = currentEffectNode._2._3;

                                            const isLeftPending = altLeftChildRes === EmptySentinel;
                                            const isRightPending = altRightChildRes === EmptySentinel;
                                            const isLeftError = !isLeftPending && eitherInterface.isLeft(altLeftChildRes);
                                            const isRightError = !isRightPending && eitherInterface.isLeft(altRightChildRes);

                                            if (leftResultVal) { // Current branch failed
                                                currentEffectNode._3 = leftResultVal;
                                                if ((isLeftPending && currentResult === altRightChildRes) || (isRightPending && currentResult === altLeftChildRes)) {
                                                    // Other branch is still pending, cancel it
                                                    collectAndCancelActiveEffects(earlyTerminationError, currentResult === altLeftChildRes ? currentEffectNode._2 : currentEffectNode._1, () => () => {});
                                                } else if (isLeftError && isRightError) {
                                                    // Both failed, propagate the first error that completed (or the last one if both completed)
                                                    currentEffectNode._3 = currentResult === altLeftChildRes ? altRightChildRes : altLeftChildRes;
                                                }
                                            } else { // Current branch succeeded
                                                currentEffectNode._3 = rightResultVal;
                                                // Cancel the other branch if it's still running
                                                collectAndCancelActiveEffects(earlyTerminationError, currentResult === altLeftChildRes ? currentEffectNode._2 : currentEffectNode._1, () => () => {});
                                            }
                                            break;
                                    }
                                    if (parentStackNode === null) {
                                        doneCallback(currentEffectNode._3)();
                                    } else {
                                        propagateResultUpTree(currentEffectNode._3, parentStackNode._1, parentStackNode._2);
                                    }
                                })(resultValue, fiberDetails._2._1, fiberDetails._2._2);
                            };
                        };
                    }

                    return function() {
                        let currentTraversalNode = sequentialEffect;
                        let processingNodeStack = null;
                        let parentProcessingStack = null;
                        let traversalState = FIBER_STATE_ACTIVE;
                        let effectNodeToExecute;

                        while (true) {
                            switch (traversalState) {
                                case FIBER_STATE_ACTIVE:
                                    switch (currentTraversalNode.tag) {
                                        case EFFECT_TAG_PAR_MAP:
                                            if (processingNodeStack) parentProcessingStack = new EffectNode(STACK_TAG_CONS, processingNodeStack, parentProcessingStack);
                                            processingNodeStack = new EffectNode(EFFECT_TAG_PAR_MAP, currentTraversalNode._1, EmptySentinel, EmptySentinel);
                                            currentTraversalNode = currentTraversalNode._2;
                                            break;
                                        case EFFECT_TAG_PAR_APPLY:
                                            if (processingNodeStack) parentProcessingStack = new EffectNode(STACK_TAG_CONS, processingNodeStack, parentProcessingStack);
                                            processingNodeStack = new EffectNode(EFFECT_TAG_PAR_APPLY, EmptySentinel, currentTraversalNode._2, EmptySentinel);
                                            currentTraversalNode = currentTraversalNode._1;
                                            break;
                                        case EFFECT_TAG_PAR_ALT:
                                            if (processingNodeStack) parentProcessingStack = new EffectNode(STACK_TAG_CONS, processingNodeStack, parentProcessingStack);
                                            processingNodeStack = new EffectNode(EFFECT_TAG_PAR_ALT, EmptySentinel, currentTraversalNode._2, EmptySentinel);
                                            currentTraversalNode = currentTraversalNode._1;
                                            break;
                                        default:
                                            effectNodeToExecute = effectNodeId++;
                                            traversalState = FIBER_STATE_STOPPED;
                                            const fiberDetails = new EffectNode(STACK_TAG_FORKED, effectNodeToExecute, new EffectNode(STACK_TAG_CONS, processingNodeStack, parentProcessingStack), EmptySentinel);
                                            const newFiber = Fiber(eitherInterface, supervisorInstance, currentTraversalNode);
                                            newFiber.onComplete({ rethrow: false, handler: onParallelFiberCompleted(fiberDetails) })();
                                            activeParallelFibers[effectNodeToExecute] = newFiber;
                                            if (supervisorInstance) supervisorInstance.register(newFiber);
                                            newFiber.run();
                                    }
                                    break;
                                case FIBER_STATE_STOPPED:
                                    if (processingNodeStack === null) break;
                                    if (processingNodeStack._1 === EmptySentinel) {
                                        processingNodeStack._1 = currentTraversalNode;
                                        traversalState = FIBER_STATE_ACTIVE;
                                        currentTraversalNode = processingNodeStack._2;
                                        processingNodeStack._2 = EmptySentinel;
                                    } else {
                                        currentTraversalNode = processingNodeStack;
                                        if (parentProcessingStack === null) {
                                            processingNodeStack = null;
                                        } else {
                                            processingNodeStack = parentProcessingStack._1;
                                            parentProcessingStack = parentProcessingStack._2;
                                        }
                                    }
                                    break;
                            }
                        }

                        for (let i = 0; i < effectNodeId; i++) {
                            if (activeParallelFibers[i]) {
                                activeParallelFibers[i].run();
                            }
                        }

                        // The canceler for the entire sequential parallel computation
                        return new EffectNode(EFFECT_TAG_ASYNC, (cancelReason) => () => {
                            globalFailure = eitherInterface.left(cancelReason);
                            const collectedCancelers = collectAndCancelActiveEffects(cancelReason, sequentialEffect, (completionResult) => () => {
                                // This callback would typically signal completion to the parent Aff context
                            });
                            for (const id in collectedCancelers) {
                                if (collectedCancelers.hasOwnProperty(id)) {
                                    collectedCancelers[id]();
                                }
                            }
                            return createPureEffect(undefined);
                        });
                    };
                }

                return {
                    EMPTY_SENTINEL: EmptySentinel,
                    Pure: createEffectConstructor(EFFECT_TAG_PURE),
                    Throw: createEffectConstructor(EFFECT_TAG_THROW),
                    Catch: createEffectConstructor(EFFECT_TAG_CATCH),
                    Sync: createEffectConstructor(EFFECT_TAG_SYNC),
                    Async: createEffectConstructor(EFFECT_TAG_ASYNC),
                    Bind: createEffectConstructor(EFFECT_TAG_BIND),
                    Bracket: createEffectConstructor(EFFECT_TAG_BRACKET),
                    Fork: createEffectConstructor(EFFECT_TAG_FORK),
                    Sequential: createEffectConstructor(EFFECT_TAG_SEQUENTIAL),
                    ParMap: createEffectConstructor(EFFECT_TAG_PAR_MAP),
                    ParApply: createEffectConstructor(EFFECT_TAG_PAR_APPLY),
                    ParAlt: createEffectConstructor(EFFECT_TAG_PAR_ALT),
                    Fiber: Fiber,
                    Supervisor: function(eitherApi) {
                        const registeredFibers = {};
                        let nextFiberID = 0;
                        let liveFiberCount = 0;
                        return {
                            register: function(fiber) {
                                const id = nextFiberID++;
                                fiber.onComplete({
                                    rethrow: true,
                                    handler: (result) => () => {
                                        liveFiberCount--;
                                        delete registeredFibers[id];
                                        if (eitherApi.isLeft(result)) {
                                            const errorValue = eitherApi.fromLeft(result);
                                            setTimeout(() => {
                                                throw errorValue;
                                            }, 0);
                                        }
                                    }
                                });
                                registeredFibers[id] = fiber;
                                liveFiberCount++;
                            },
                            isEmpty: function() {
                                return liveFiberCount === 0;
                            },
                            killAll: function(killReason, completionCallback) {
                                return function() {
                                    let pendingKillOperations = 0;
                                    const killOperationCancelers = {};

                                    function onIndividualFiberKilled(fiberIdentifier) {
                                        return function(killOutcome) {
                                            return function() {
                                                delete killOperationCancelers[fiberIdentifier];
                                                pendingKillOperations--;
                                                if (eitherApi.isLeft(killOutcome)) {
                                                    const errorValue = eitherApi.fromLeft(killOutcome);
                                                    setTimeout(() => {
                                                        throw errorValue;
                                                    }, 0);
                                                }
                                                if (pendingKillOperations === 0) {
                                                    completionCallback();
                                                }
                                            };
                                        };
                                    }

                                    for (const fiberId in registeredFibers) {
                                        if (registeredFibers.hasOwnProperty(fiberId)) {
                                            pendingKillOperations++;
                                            killOperationCancelers[fiberId] = registeredFibers[fiberId].kill(killReason, onIndividualFiberKilled(fiberId))();
                                        }
                                    }
                                    // Reset supervisor state
                                    Object.keys(registeredFibers).forEach(key => delete registeredFibers[key]);
                                    nextFiberID = 0;
                                    liveFiberCount = 0;

                                    return new EffectNode(EFFECT_TAG_ASYNC, (cancelReason) => () => {
                                        for (const id in killOperationCancelers) {
                                            if (killOperationCancelers.hasOwnProperty(id)) {
                                                killOperationCancelers[id]();
                                            }
                                        }
                                        return createPureEffect(undefined);
                                    });
                                };
                            }
                        };
                    },
                    Scheduler: MicrotaskScheduler,
                    nonCanceler: createPureEffect(undefined)
                };
            })();

            exports._pure = AffExecutionEngine.Pure;
            exports._map = function(transformFn) {
                return function(affEffect) {
                    return affEffect.tag === AffExecutionEngine.Pure.tag ? AffExecutionEngine.Pure(transformFn(affEffect._1)) : AffExecutionEngine.Bind(affEffect, function(value) {
                        return AffExecutionEngine.Pure(transformFn(value));
                    });
                };
            };
            exports._bind = function(affEffect) {
                return function(continuation) {
                    return AffExecutionEngine.Bind(affEffect, continuation);
                };
            };
            exports._liftEffect = AffExecutionEngine.Sync;
            exports._parAffMap = function(mapFunc) {
                return function(parAffEffect) {
                    return AffExecutionEngine.ParMap(mapFunc, parAffEffect);
                };
            };
            exports._parAffApply = function(functionParAff) {
                return function(argumentParAff) {
                    return AffExecutionEngine.ParApply(functionParAff, argumentParAff);
                };
            };
            exports.makeAff = AffExecutionEngine.Async;
            exports._makeFiber = function(eitherApi, effect) {
                return function() {
                    return AffExecutionEngine.Fiber(eitherApi, null, effect);
                };
            };
            exports._sequential = AffExecutionEngine.Sequential;
        });

        // --- Effect.Class ---
        definePsModule("Effect.Class", exports => {
            "use strict";
            exports.liftEffect = function(monadEffectDict) {
                return monadEffectDict.liftEffect;
            };
            exports.MonadEffect = function(monadDict, liftEffectFunc) {
                this.Monad0 = monadDict;
                this.liftEffect = liftEffectFunc;
            };
        });

        // --- Effect.Ref ---
        definePsModule("Effect.Ref", exports => {
            "use strict";
            exports.new = function(initialData) {
                return function() {
                    return {
                        value: initialData
                    };
                };
            };
            exports.read = function(reference) {
                return function() {
                    return reference.value;
                };
            };
            exports.write = function(newData) {
                return function(reference) {
                    return function() {
                        reference.value = newData;
                        return {}; // Return unit
                    };
                };
            };
        });

        // --- Effect.Ref (re-export) ---
        definePsModule("Effect.Ref", exports => {
            "use strict";
            const RefModule = _psRuntime["Effect.Ref"];
            exports.new = RefModule.new;
            exports.read = RefModule.read;
            exports.write = RefModule.write;
        });

        // --- Control.Parallel.Class ---
        definePsModule("Control.Parallel.Class", exports => {
            "use strict";
            exports.parallel = function(parallelDict) {
                return parallelDict.parallel;
            };
            exports.sequential = function(parallelDict) {
                return parallelDict.sequential;
            };
            exports.Parallel = function(applicativeDict, monadDict, parallelFunc, sequentialFunc) {
                this.Applicative1 = applicativeDict;
                this.Monad0 = monadDict;
                this.parallel = parallelFunc;
                this.sequential = sequentialFunc;
            };
        });

        // --- Control.Parallel ---
        definePsModule("Control.Parallel", exports => {
            "use strict";
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const CategoryModule = _psRuntime["Control.Category"];
            const FoldableModule = _psRuntime["Data.Foldable"];
            const ParallelClassModule = _psRuntime["Control.Parallel.Class"];

            const parallelTraverseHelper = function(parallelDict) {
                return function(foldableDict) {
                    return function(transformationFunc) {
                        return function(inputCollection) {
                            return ParallelClassModule.sequential(parallelDict)(
                                FoldableModule.traverse_(parallelDict.Applicative1())(foldableDict)(function(item) {
                                    return ParallelClassModule.parallel(parallelDict)(transformationFunc(item));
                                })(inputCollection)
                            );
                        };
                    };
                };
            };
            exports.parTraverse_ = parallelTraverseHelper;
            exports.parSequence_ = function(parallelDict) {
                return function(inputCollection) {
                    return parallelTraverseHelper(parallelDict)(_psRuntime["Data.Foldable"].foldableArray)(CategoryModule.identity(CategoryModule.categoryFn))(inputCollection);
                };
            };
        });

        // --- Effect.Exception ---
        definePsModule("Effect.Exception", exports => {
            "use strict";
            exports.error = function(message) {
                return new Error(message);
            };
            exports.throwException = function(exceptionObject) {
                return function() {
                    throw exceptionObject;
                };
            };
        });

        // --- Effect.Exception (full definition) ---
        definePsModule("Effect.Exception", exports => {
            "use strict";
            const ExceptionModule = _psRuntime["Effect.Exception"];
            exports.throw = function(message) {
                return ExceptionModule.throwException(ExceptionModule.error(message));
            };
        });

        // --- Effect.Aff (full definition) ---
        definePsModule("Effect.Aff", exports => {
            "use strict";
            const AffModule = _psRuntime["Effect.Aff"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const ApplyModule = _psRuntime["Control.Apply"];
            const BindModule = _psRuntime["Control.Bind"];
            const MonadModule = _psRuntime["Control.Monad"];
            const ParallelModule = _psRuntime["Control.Parallel"];
            const ParallelClassModule = _psRuntime["Control.Parallel.Class"];
            const EitherModule = _psRuntime["Data.Either"];
            const FoldableModule = _psRuntime["Data.Foldable"];
            const FunctionModule = _psRuntime["Data.Function"];
            const FunctorModule = _psRuntime["Data.Functor"];
            const MonoidModule = _psRuntime["Data.Monoid"];
            const SemigroupModule = _psRuntime["Data.Semigroup"];
            const UnitModule = _psRuntime["Data.Unit"];
            const EffectRuntimeModule = _psRuntime["Effect"];
            const EffectClassModule = _psRuntime["Effect.Class"];
            const UnsafePartialModule = _psRuntime["Partial.Unsafe"];
            const UnsafeCoerceModule = _psRuntime["Unsafe.Coerce"];

            const affFunctorInstance = new FunctorModule.Functor(AffModule._map);
            const parAffFunctorInstance = new FunctorModule.Functor(AffModule._parAffMap);

            const eitherApiAdapter = {
                isLeft: function(value) {
                    if (value instanceof EitherModule.Left) return true;
                    if (value instanceof EitherModule.Right) return false;
                    throw new Error("Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " + [value.constructor.name]);
                },
                fromLeft: function(value) {
                    if (value instanceof EitherModule.Left) return value.value0;
                    if (value instanceof EitherModule.Right) return UnsafePartialModule.unsafeCrashWith("unsafeFromLeft: Right");
                    throw new Error("Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " + [value.constructor.name]);
                },
                fromRight: function(value) {
                    if (value instanceof EitherModule.Right) return value.value0;
                    if (value instanceof EitherModule.Left) return UnsafePartialModule.unsafeCrashWith("unsafeFromRight: Left");
                    throw new Error("Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " + [value.constructor.name]);
                },
                left: EitherModule.Left.create,
                right: EitherModule.Right.create
            };

            const launchAff = function(affComputation) {
                return function() {
                    const fiberCreator = AffModule._makeFiber(eitherApiAdapter, affComputation);
                    const newFiberInstance = fiberCreator();
                    newFiberInstance.run();
                    return newFiberInstance;
                };
            };

            const parAffApplyInstance = new ApplyModule.Apply(
                () => parAffFunctorInstance,
                AffModule._parAffApply
            );

            const monadAffInstance = new MonadModule.Monad(
                () => applicativeAffInstance,
                () => bindAffInstance
            );

            const bindAffInstance = new BindModule.Bind(
                () => applyAffInstance,
                AffModule._bind
            );

            const applyAffInstance = new ApplyModule.Apply(
                () => affFunctorInstance,
                MonadModule.ap(monadAffInstance)
            );

            const applicativeAffInstance = new ApplicativeModule.Applicative(
                () => applyAffInstance,
                AffModule._pure
            );

            const monadEffectAffInstance = new EffectClassModule.MonadEffect(
                () => monadAffInstance,
                AffModule._liftEffect
            );

            const parallelAffInstance = new ParallelClassModule.Parallel(
                () => parAffApplicativeInstance,
                () => monadAffInstance,
                UnsafeCoerceModule.unsafeCoerce,
                AffModule._sequential
            );

            const parAffApplicativeInstance = new ApplicativeModule.Applicative(
                () => parAffApplyInstance,
                function(value) {
                    return ParallelClassModule.parallel(parallelAffInstance)(ApplicativeModule.pure(monadAffInstance)(value));
                }
            );

            const cancelerSemigroupInstance = new SemigroupModule.Semigroup(function(cancelerOne) {
                return function(cancelerTwo) {
                    return function(errorReason) {
                        return ParallelModule.parSequence_(parallelAffInstance)(FoldableModule.foldableArray)([cancelerOne(errorReason), cancelerTwo(errorReason)]);
                    };
                };
            });

            const noOperationCanceler = FunctionModule.const(ApplicativeModule.pure(monadAffInstance)(UnitModule.unit));

            const cancelerMonoidInstance = new MonoidModule.Monoid(
                () => cancelerSemigroupInstance,
                noOperationCanceler
            );

            exports.launchAff = launchAff;
            exports.launchAff_ = function(affComputation) {
                return FunctorModule.void(EffectRuntimeModule.functorEffect)(launchAff(affComputation));
            };
            exports.nonCanceler = noOperationCanceler;
            exports.functorAff = affFunctorInstance;
            exports.applyAff = applyAffInstance;
            exports.applicativeAff = applicativeAffInstance;
            exports.bindAff = bindAffInstance;
            exports.monadAff = monadAffInstance;
            exports.monadEffectAff = monadEffectAffInstance;
            exports.functorParAff = parAffFunctorInstance;
            exports.applyParAff = parAffApplyInstance;
            exports.applicativeParAff = parAffApplicativeInstance;
            exports.parallelAff = parallelAffInstance;
            exports.semigroupCanceler = cancelerSemigroupInstance;
            exports.monoidCanceler = cancelerMonoidInstance;
            exports.makeAff = AffModule.makeAff;
        });

        // --- Node.Encoding ---
        definePsModule("Node.Encoding", exports => {
            "use strict";
            const ShowModule = _psRuntime["Data.Show"];

            const AsciiEncoding = (function() {
                function Ascii() {}
                Ascii.value = new Ascii();
                return Ascii;
            })();
            const Utf8Encoding = (function() {
                function Utf8() {}
                Utf8.value = new Utf8();
                return Utf8;
            })();
            const Utf16LEEncoding = (function() {
                function Utf16LE() {}
                Utf16LE.value = new Utf16LE();
                return Utf16LE;
            })();
            const Ucs2Encoding = (function() {
                function Ucs2() {}
                Ucs2.value = new Ucs2();
                return Ucs2;
            })();
            const Base64Encoding = (function() {
                function Base64() {}
                Base64.value = new Base64();
                return Base64;
            })();
            const Latin1Encoding = (function() {
                function Latin1() {}
                Latin1.value = new Latin1();
                return Latin1;
            })();
            const BinaryEncoding = (function() {
                function Binary() {}
                Binary.value = new Binary();
                return Binary;
            })();
            const HexEncoding = (function() {
                function Hex() {}
                Hex.value = new Hex();
                return Hex;
            })();

            const encodingShowInstance = new ShowModule.Show(function(encodingType) {
                if (encodingType instanceof AsciiEncoding) return "ASCII";
                if (encodingType instanceof Utf8Encoding) return "UTF8";
                if (encodingType instanceof Utf16LEEncoding) return "UTF16LE";
                if (encodingType instanceof Ucs2Encoding) return "UCS2";
                if (encodingType instanceof Base64Encoding) return "Base64";
                if (encodingType instanceof Latin1Encoding) return "Latin1";
                if (encodingType instanceof BinaryEncoding) return "Binary";
                if (encodingType instanceof HexEncoding) return "Hex";
                throw new Error("Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " + [encodingType.constructor.name]);
            });

            exports.ASCII = AsciiEncoding;
            exports.UTF8 = Utf8Encoding;
            exports.UTF16LE = Utf16LEEncoding;
            exports.UCS2 = Ucs2Encoding;
            exports.Base64 = Base64Encoding;
            exports.Latin1 = Latin1Encoding;
            exports.Binary = BinaryEncoding;
            exports.Hex = HexEncoding;
            exports.encodingToNode = function(encodingType) {
                if (encodingType instanceof AsciiEncoding) return "ascii";
                if (encodingType instanceof Utf8Encoding) return "utf8";
                if (encodingType instanceof Utf16LEEncoding) return "utf16le";
                if (encodingType instanceof Ucs2Encoding) return "ucs2";
                if (encodingType instanceof Base64Encoding) return "base64";
                if (encodingType instanceof Latin1Encoding) return "latin1";
                if (encodingType instanceof BinaryEncoding) return "binary";
                if (encodingType instanceof HexEncoding) return "hex";
                throw new Error("Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " + [encodingType.constructor.name]);
            };
            exports.showEncoding = encodingShowInstance;
        });

        // --- Node.Process ---
        definePsModule("Node.Process", exports => {
            "use strict";
            // Assumes `process` global is available in Node.js environments
            exports.process = process;
        });

        // --- Node.Stream ---
        definePsModule("Node.Stream", exports => {
            "use strict";
            exports.readChunkImpl = function(handleString) {
                return function(handleBuffer) {
                    return function(chunkData) {
                        if (chunkData instanceof Buffer) return handleBuffer(chunkData);
                        if (typeof chunkData === "string") return handleString(chunkData);
                        throw new Error("Node.Stream.readChunkImpl: Unrecognized chunk type; expected String or Buffer, got: " + chunkData);
                    };
                };
            };
            exports.onDataEitherImpl = function(chunkProcessor) {
                return function(streamInstance) {
                    return function(callbackEffect) {
                        return function() {
                            streamInstance.on("data", function(dataChunk) {
                                callbackEffect(chunkProcessor(dataChunk))();
                            });
                        };
                    };
                };
            };
            exports.onEnd = function(streamInstance) {
                return function(callback) {
                    return function() {
                        streamInstance.on("end", callback);
                    };
                };
            };
            exports.write = function(streamInstance) {
                return function(dataToWrite) {
                    return function(encodingOption) {
                        return function(completionCallback) {
                            return function() {
                                return streamInstance.write(dataToWrite, encodingOption, completionCallback);
                            };
                        };
                    };
                };
            };
            exports.writeStringImpl = function(streamInstance) {
                return function(encodingOption) {
                    return function(stringData) {
                        return function(completionCallback) {
                            return function() {
                                return streamInstance.write(stringData, encodingOption, completionCallback);
                            };
                        };
                    };
                };
            };
        });

        // --- Node.Buffer ---
        definePsModule("Node.Buffer", exports => {
            "use strict";
            exports.toStringImpl = function(encodingType) {
                return function(bufferObject) {
                    return function() {
                        return bufferObject.toString(encodingType);
                    };
                };
            };
        });

        // --- Node.Buffer (full definition) ---
        definePsModule("Node.Buffer", exports => {
            "use strict";
            const BufferImplementation = _psRuntime["Node.Buffer"];
            const EncodingModule = _psRuntime["Node.Encoding"];
            exports.toString = function(encoding) {
                return BufferImplementation.toStringImpl(EncodingModule.encodingToNode(encoding));
            };
        });

        // --- Node.Stream (full definition) ---
        definePsModule("Node.Stream", exports => {
            "use strict";
            const StreamImplementation = _psRuntime["Node.Stream"];
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const BindModule = _psRuntime["Control.Bind"];
            const EitherModule = _psRuntime["Data.Either"];
            const BufferModule = _psRuntime["Node.Buffer"];
            const EncodingModule = _psRuntime["Node.Encoding"];
            const EffectRuntimeModule = _psRuntime["Effect"];
            const ExceptionModule = _psRuntime["Effect.Exception"];
            const ShowModule = _psRuntime["Data.Show"];

            const processRawStreamChunk = StreamImplementation.readChunkImpl(EitherModule.Left.create)(EitherModule.Right.create);

            const onData = function(stream) {
                return function(callback) {
                    const dataEventHandler = StreamImplementation.onDataEitherImpl(processRawStreamChunk)(stream);
                    return dataEventHandler(BindModule.composeKleisliFlipped(EffectRuntimeModule.bindEffect)(callback)(function(eitherChunk) {
                        if (eitherChunk instanceof EitherModule.Left) {
                            return ExceptionModule.throw("Stream encoding error: received string chunk when expecting buffer. This should not happen.");
                        }
                        if (eitherChunk instanceof EitherModule.Right) {
                            return ApplicativeModule.pure(EffectRuntimeModule.applicativeEffect)(eitherChunk.value0);
                        }
                        throw new Error("Unrecognized chunk type in onData: " + eitherChunk.constructor.name);
                    }));
                };
            };

            exports.onData = onData;
            exports.onDataString = function(stream) {
                return function(encoding) {
                    return function(callback) {
                        return onData(stream)(BindModule.composeKleisliFlipped(EffectRuntimeModule.bindEffect)(callback)(BufferModule.toString(encoding)));
                    };
                };
            };
            exports.onDataEither = StreamImplementation.onDataEitherImpl(processRawStreamChunk);
            exports.writeString = function(stream) {
                return function(encoding) {
                    const nodeEncodingString = ShowModule.show(EncodingModule.showEncoding)(encoding); // Original uses show, not encodingToNode here
                    return StreamImplementation.writeStringImpl(stream)(nodeEncodingString);
                };
            };
            exports.onEnd = StreamImplementation.onEnd;
        });

        // --- Node.Process (full definition) ---
        definePsModule("Node.Process", exports => {
            "use strict";
            const ProcessModule = _psRuntime["Node.Process"];
            exports.stdin = ProcessModule.process.stdin;
            exports.stdout = ProcessModule.process.stdout;
        });

        // --- ABC105B ---
        definePsModule("ABC105B", exports => {
            "use strict";
            const ApplicativeModule = _psRuntime["Control.Applicative"];
            const BindModule = _psRuntime["Control.Bind"];
            const CategoryModule = _psRuntime["Control.Category"];
            const DataArrayModule = _psRuntime["Data.Array"];
            const DataEitherModule = _psRuntime["Data.Either"];
            const EuclideanRingModule = _psRuntime["Data.EuclideanRing"];
            const FunctorModule = _psRuntime["Data.Functor"];
            const DataIntModule = _psRuntime["Data.Int"];
            const MonoidModule = _psRuntime["Data.Monoid"];
            const StringCommonModule = _psRuntime["Data.String.Common"];
            const DataUnitModule = _psRuntime["Data.Unit"];
            const EffectRuntimeModule = _psRuntime["Effect"];
            const EffectAffModule = _psRuntime["Effect.Aff"];
            const EffectClassModule = _psRuntime["Effect.Class"];
            const EffectRefModule = _psRuntime["Effect.Ref"];
            const NodeEncodingModule = _psRuntime["Node.Encoding"];
            const NodeProcessModule = _psRuntime["Node.Process"];
            const NodeStreamModule = _psRuntime["Node.Stream"];
            const UnsafePartialModule = _psRuntime["Partial.Unsafe"];

            // Renamed 'b' to 'calculateSolution'
            const calculateSolution = function(rawInputString) {
                const cleanedInput = StringCommonModule.trim(rawInputString);
                const maybeParsedNumber = DataIntModule.fromString(cleanedInput);

                // Handle parsing failures by crashing, as per PureScript's unsafePartial pattern
                const problemNumber = DataEitherModule.either(
                    (errorMsg) => UnsafePartialModule.unsafeCrashWith("Input conversion error: " + errorMsg + ". Input was: '" + rawInputString + "'"),
                    CategoryModule.identity(CategoryModule.categoryFn)
                )(DataEitherModule.note("Failed to parse input as integer: '" + cleanedInput + "'")(maybeParsedNumber));

                let isSolvable = false;
                const targetSum = problemNumber;

                // Iterate through possible counts of 4-unit items (e.g., cakes)
                // Original uses `bindArray` and `range` for this, rewritten as explicit for loops.
                const maxCount4 = EuclideanRingModule.div(EuclideanRingModule.euclideanRingInt)(targetSum)(4);
                for (let countOf4 = 0; countOf4 <= maxCount4; countOf4++) {
                    const currentSum4 = (4 * countOf4) | 0;
                    const remainingFor7 = (targetSum - currentSum4) | 0;

                    // If remaining value is negative, no solution possible with more 4-unit items
                    if (remainingFor7 < 0) {
                        continue;
                    }

                    // Iterate through possible counts of 7-unit items (e.g., donuts)
                    const maxCount7 = EuclideanRingModule.div(EuclideanRingModule.euclideanRingInt)(remainingFor7)(7);
                    for (let countOf7 = 0; countOf7 <= maxCount7; countOf7++) {
                        const currentSum7 = (7 * countOf7) | 0;
                        if ((currentSum4 + currentSum7) | 0 === targetSum) {
                            isSolvable = true;
                            break; // Found a valid combination, exit inner loop
                        }
                    }

                    if (isSolvable) {
                        break; // Found a valid combination, exit outer loop
                    }
                }

                // Return "Yes" or "No" followed by a newline
                const outputResult = isSolvable ? "Yes" : "No";
                return outputResult + "\n";
            };

            // Renamed 'S' to 'readStandardInputAff'
            const readStandardInputAff = EffectAffModule.makeAff(function(completionCallback) {
                return function() {
                    const inputAccumulatorRef = EffectRefModule.new("")();
                    const stdInStream = NodeProcessModule.stdin;
                    const utf8EncodingValue = NodeEncodingModule.UTF8.value;

                    // Attach data event listener
                    NodeStreamModule.onDataString(stdInStream)(utf8EncodingValue)(function(newChunk) {
                        return function() {
                            const currentContent = EffectRefModule.read(inputAccumulatorRef)();
                            return EffectRefModule.write(currentContent + newChunk)(inputAccumulatorRef)();
                        };
                    })();

                    // Attach end event listener
                    NodeStreamModule.onEnd(stdInStream)(function() {
                        const finalInputContent = EffectRefModule.read(inputAccumulatorRef)();
                        // Signal completion with the accumulated input as a successful result
                        completionCallback(ApplicativeModule.pure(DataEitherModule.applicativeEither)(finalInputContent))();
                    })();

                    // Return a non-canceler, as input reading is typically not cancellable in this context
                    return MonoidModule.mempty(EffectAffModule.monoidCanceler);
                };
            });

            // Renamed 'F' to 'mainProgramExecution'
            const mainProgramExecution = EffectAffModule.launchAff_(
                BindModule.bind(EffectAffModule.bindAff)(readStandardInputAff)(function(capturedInput) {
                    const finalOutputString = calculateSolution(capturedInput);
                    // Lift the effect of writing the solution to standard output
                    return EffectClassModule.liftEffect(EffectAffModule.monadEffectAff)(
                        FunctorModule.void(EffectRuntimeModule.functorEffect)(
                            NodeStreamModule.writeString(NodeProcessModule.stdout)(NodeEncodingModule.UTF8.value)(finalOutputString)(
                                ApplicativeModule.pure(EffectRuntimeModule.applicativeEffect)(DataUnitModule.unit)
                            )
                        )
                    );
                })
            );

            exports.main = mainProgramExecution;
            exports.solve = calculateSolution;
        });

        // Execute the main function of the ABC105B module upon loading
        _psRuntime.ABC105B.main();

    }, {}]
}, {}, ["Focm"], null));