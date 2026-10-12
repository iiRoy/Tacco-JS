var moduleLoader = function (moduleDefinitions, loadedModules, entryPoints, globalExportName) {
    let firstError = null; // Stores the first encountered error
    const parentLoader = typeof parcelRequire === "function" && parcelRequire;
    const nodeRequire = typeof require === "function" && require;

    function loadModule(moduleId, isEntry) {
        // If module already loaded, return its exports
        if (loadedModules[moduleId]) {
            return loadedModules[moduleId].exports;
        }

        // Check if module definition exists
        if (!moduleDefinitions[moduleId]) {
            // Attempt to load from parent or node's require if not an entry point
            if (!isEntry && parentLoader) return parentLoader(moduleId, true);
            if (parentLoader) return parentLoader(moduleId, true); // Redundant but harmless check
            if (nodeRequire && typeof moduleId === "string") return nodeRequire(moduleId);

            const moduleLoadError = new Error("Cannot locate required module: '" + moduleId + "'");
            moduleLoadError.code = "MODULE_NOT_FOUND";
            throw moduleLoadError;
        }

        // Prepare module context and load
        const moduleContext = {};
        moduleContext.resolve = function (relativeId) {
            // Resolve relative paths within the module's definition
            return moduleDefinitions[moduleId][1][relativeId] || relativeId;
        };
        moduleContext.cache = {};

        const currentModuleInstance = loadedModules[moduleId] = new loadModule.Module(moduleId);
        moduleDefinitions[moduleId][0].call(
            currentModuleInstance.exports,
            moduleContext,
            currentModuleInstance,
            currentModuleInstance.exports,
            this
        );

        return loadedModules[moduleId].exports;
    }

    loadModule.isParcelRequire = true; // Mark as a parcel-like loader
    loadModule.Module = function (id) {
        this.id = id;
        this.bundle = loadModule;
        this.exports = {};
    };
    loadModule.modules = moduleDefinitions;
    loadModule.cache = loadedModules;
    loadModule.parent = parentLoader;
    loadModule.register = function (moduleId, exportValue) {
        moduleDefinitions[moduleId] = [
            function (modCtx, modInst) {
                modInst.exports = exportValue;
            },
            {},
        ];
    };

    // Process entry points
    for (let currentEntryIdx = 0; currentEntryIdx < entryPoints.length; currentEntryIdx++) {
        try {
            loadModule(entryPoints[currentEntryIdx]);
        } catch (err) {
            // Store the first error encountered during entry point loading
            if (!firstError) {
                firstError = err;
            }
        }
    }

    // Handle global exports if entry points were processed
    if (entryPoints.length > 0) {
        const lastEntryPointExport = loadModule(entryPoints[entryPoints.length - 1]);
        if (typeof exports === "object" && typeof module !== "undefined") {
            module.exports = lastEntryPointExport;
        } else if (typeof define === "function" && define.amd) {
            define(function () {
                return lastEntryPointExport;
            });
        } else if (globalExportName) {
            this[globalExportName] = lastEntryPointExport;
        }
    }

    // Reassign global parcelRequire and throw if an error occurred
    parcelRequire = loadModule;
    if (firstError) {
        throw firstError;
    }

    return loadModule;
}({
    "Focm": [function (require, module, exports) {
        // Main application namespace object
        const psRuntime = {};

        // Module: Control.Apply
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Control.Apply"] = currentNamespace["Control.Apply"] || {}).arrayApply = function (funcsArray) {
                return function (valuesArray) {
                    const funcCount = funcsArray.length;
                    const valueCount = valuesArray.length;
                    const resultArray = new Array(funcCount * valueCount);
                    let resultIdx = 0;

                    for (let fIdx = 0; fIdx < funcCount; fIdx++) {
                        const currentFunc = funcsArray[fIdx];
                        for (let vIdx = 0; vIdx < valueCount; vIdx++) {
                            resultArray[resultIdx++] = currentFunc(valuesArray[vIdx]);
                        }
                    }
                    return resultArray;
                };
            };
        })(psRuntime);

        // Module: Control.Semigroupoid
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Semigroupoid"] = currentNamespace["Control.Semigroupoid"] || {};
            const semigroupoidNs = currentNamespace["Control.Semigroupoid"];

            const SemigroupoidConstructor = function (composeFn) {
                this.compose = composeFn;
            };

            const fnSemigroupoidInstance = new SemigroupoidConstructor(function (f) {
                return function (g) {
                    return function (x) {
                        return f(g(x));
                    };
                }
            });

            semigroupoidNs.compose = function (instance) {
                return instance.compose;
            };
            semigroupoidNs.Semigroupoid = SemigroupoidConstructor;
            semigroupoidNs.semigroupoidFn = fnSemigroupoidInstance;
        })(psRuntime);

        // Module: Control.Category
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Category"] = currentNamespace["Control.Category"] || {};
            const categoryNs = currentNamespace["Control.Category"];
            const semigroupoidNs = currentNamespace["Control.Semigroupoid"];

            const CategoryConstructor = function (semigroupoidInstance, identityFn) {
                this.Semigroupoid0 = semigroupoidInstance;
                this.identity = identityFn;
            };

            const fnCategoryInstance = new CategoryConstructor(
                () => semigroupoidNs.semigroupoidFn,
                (x) => x // Identity function
            );

            categoryNs.Category = CategoryConstructor;
            categoryNs.identity = function (instance) {
                return instance.identity;
            };
            categoryNs.categoryFn = fnCategoryInstance;
        })(psRuntime);

        // Module: Data.Function
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Function"] = currentNamespace["Data.Function"] || {};
            const functionNs = currentNamespace["Data.Function"];

            functionNs.flip = function (fn) {
                return function (arg1) {
                    return function (arg2) {
                        return fn(arg2)(arg1);
                    };
                };
            };

            functionNs.const = function (value) {
                return function (ignored) {
                    return value;
                };
            };
        })(psRuntime);

        // Module: Data.Functor
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Data.Functor"] = currentNamespace["Data.Functor"] || {}).arrayMap = function (mapperFn) {
                return function (inputArray) {
                    const arrLength = inputArray.length;
                    const mappedArray = new Array(arrLength);
                    for (let i = 0; i < arrLength; i++) {
                        mappedArray[i] = mapperFn(inputArray[i]);
                    }
                    return mappedArray;
                };
            };
        })(psRuntime);

        // Module: Data.Unit
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Data.Unit"] = currentNamespace["Data.Unit"] || {}).unit = {};
        })(psRuntime);

        // Module: Data.Unit (Redundant re-assignment, can be deleted or kept as is)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Unit"] = currentNamespace["Data.Unit"] || {};
            const unitNs = currentNamespace["Data.Unit"];
            const unitNsAlias = currentNamespace["Data.Unit"];
            unitNs.unit = unitNsAlias.unit;
        })(psRuntime);

        // Module: Data.Functor
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Functor"] = currentNamespace["Data.Functor"] || {};
            const functorNs = currentNamespace["Data.Functor"];
            const functorNsAlias = currentNamespace["Data.Functor"];
            const functionNs = currentNamespace["Data.Function"];
            const unitNs = currentNamespace["Data.Unit"];

            const FunctorConstructor = function (mapFn) {
                this.map = mapFn;
            };

            const getMapFunction = function (instance) {
                return instance.map;
            };

            const arrayFunctorInstance = new FunctorConstructor(functorNsAlias.arrayMap);

            functorNs.Functor = FunctorConstructor;
            functorNs.map = getMapFunction;
            functorNs.void = function (functorInst) {
                return getMapFunction(functorInst)(functionNs.const(unitNs.unit));
            };
            functorNs.functorArray = arrayFunctorInstance;
        })(psRuntime);

        // Module: Control.Apply
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Apply"] = currentNamespace["Control.Apply"] || {};
            const applyNs = currentNamespace["Control.Apply"];
            const applyNsAlias = currentNamespace["Control.Apply"];
            const categoryNs = currentNamespace["Control.Category"];
            const functionNs = currentNamespace["Data.Function"];
            const functorNs = currentNamespace["Data.Functor"];

            const ApplyConstructor = function (functorInst, applyFn) {
                this.Functor0 = functorInst;
                this.apply = applyFn;
            };

            const arrayApplyInstance = new ApplyConstructor(
                () => functorNs.functorArray,
                applyNsAlias.arrayApply
            );

            const getApplyFunction = function (instance) {
                return instance.apply;
            };

            applyNs.Apply = ApplyConstructor;
            applyNs.apply = getApplyFunction;
            applyNs.applySecond = function (applyInst) {
                return function (funcContainer) {
                    return function (valueContainer) {
                        const mapFn = functorNs.map(applyInst.Functor0());
                        const constId = functionNs.const(categoryNs.identity(categoryNs.categoryFn));
                        const mappedFunc = mapFn(constId)(funcContainer);
                        return getApplyFunction(applyInst)(mappedFunc)(valueContainer);
                    };
                };
            };
            applyNs.applyArray = arrayApplyInstance;
        })(psRuntime);

        // Module: Control.Applicative
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Applicative"] = currentNamespace["Control.Applicative"] || {};
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];

            const getPureFunction = function (instance) {
                return instance.pure;
            };

            applicativeNs.Applicative = function (applyInst, pureFn) {
                this.Apply0 = applyInst;
                this.pure = pureFn;
            };
            applicativeNs.pure = getPureFunction;
            applicativeNs.liftA1 = function (applicativeInst) {
                return function (mapperFn) {
                    return function (valueContainer) {
                        const applyFn = applyNs.apply(applicativeInst.Apply0());
                        const pureFn = getPureFunction(applicativeInst);
                        return applyFn(pureFn(mapperFn))(valueContainer);
                    };
                };
            };
        })(psRuntime);

        // Module: Control.Bind
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Control.Bind"] = currentNamespace["Control.Bind"] || {}).arrayBind = function (inputArray) {
                return function (binderFn) {
                    const result = [];
                    for (let i = 0, len = inputArray.length; i < len; i++) {
                        Array.prototype.push.apply(result, binderFn(inputArray[i]));
                    }
                    return result;
                };
            };
        })(psRuntime);

        // Module: Control.Bind
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Bind"] = currentNamespace["Control.Bind"] || {};
            const bindNs = currentNamespace["Control.Bind"];
            const bindNsAlias = currentNamespace["Control.Bind"];
            const applyNs = currentNamespace["Control.Apply"];
            const functionNs = currentNamespace["Data.Function"];

            const BindConstructor = function (applyInst, bindFn) {
                this.Apply0 = applyInst;
                this.bind = bindFn;
            };

            const arrayBindInstance = new BindConstructor(
                () => applyNs.applyArray,
                bindNsAlias.arrayBind
            );

            const getBindFunction = function (instance) {
                return instance.bind;
            };

            const flippedBind = function (instance) {
                return functionNs.flip(getBindFunction(instance));
            };

            bindNs.Bind = BindConstructor;
            bindNs.bind = getBindFunction;
            bindNs.bindFlipped = flippedBind;
            bindNs.composeKleisliFlipped = function (bindInst) {
                return function (func1) {
                    return function (func2) {
                        return function (initialValue) {
                            // (a -> m b) -> (b -> m c) -> a -> m c
                            return flippedBind(bindInst)(func2)(func1(initialValue));
                        };
                    };
                };
            };
            bindNs.bindArray = arrayBindInstance;
        })(psRuntime);

        // Module: Data.Maybe
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Maybe"] = currentNamespace["Data.Maybe"] || {};
            const maybeNs = currentNamespace["Data.Maybe"];
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];
            const bindNs = currentNamespace["Control.Bind"];
            const functorNs = currentNamespace["Data.Functor"];

            // Nothing constructor
            const NothingType = function () { /* empty */ };
            NothingType.value = new NothingType();

            // Just constructor
            const JustType = function (val) {
                this.value0 = val;
            };
            JustType.create = (val) => new JustType(val);

            const maybeFunctorInst = new functorNs.Functor(function (mapperFn) {
                return function (maybeVal) {
                    if (maybeVal instanceof JustType) {
                        return new JustType(mapperFn(maybeVal.value0));
                    }
                    return NothingType.value;
                };
            });

            const maybeApplyInst = new applyNs.Apply(
                () => maybeFunctorInst,
                function (maybeFunc) {
                    return function (maybeVal) {
                        if (maybeFunc instanceof JustType) {
                            return functorNs.map(maybeFunctorInst)(maybeFunc.value0)(maybeVal);
                        }
                        if (maybeFunc instanceof NothingType) {
                            return NothingType.value;
                        }
                        // Default error for exhaustive patterns
                        throw new Error("Maybe Apply: Failed pattern match on function container.");
                    };
                }
            );

            const maybeBindInst = new bindNs.Bind(
                () => maybeApplyInst,
                function (maybeVal) {
                    return function (binderFn) {
                        if (maybeVal instanceof JustType) {
                            return binderFn(maybeVal.value0);
                        }
                        if (maybeVal instanceof NothingType) {
                            return NothingType.value;
                        }
                        // Default error for exhaustive patterns
                        throw new Error("Maybe Bind: Failed pattern match on value container.");
                    };
                }
            );

            const maybeApplicativeInst = new applicativeNs.Applicative(
                () => maybeApplyInst,
                JustType.create
            );

            maybeNs.Nothing = NothingType;
            maybeNs.Just = JustType;
            maybeNs.maybe = function (nothingCase) {
                return function (justCase) {
                    return function (maybeValue) {
                        if (maybeValue instanceof NothingType) {
                            return nothingCase;
                        }
                        if (maybeValue instanceof JustType) {
                            return justCase(maybeValue.value0);
                        }
                        // Default error for exhaustive patterns
                        throw new Error("Maybe maybe: Failed pattern match on maybe value.");
                    };
                };
            };
            maybeNs.functorMaybe = maybeFunctorInst;
            maybeNs.applyMaybe = maybeApplyInst;
            maybeNs.applicativeMaybe = maybeApplicativeInst;
            maybeNs.bindMaybe = maybeBindInst;
        })(psRuntime);

        // Module: Data.Array
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Array"] = currentNamespace["Data.Array"] || {};
            const arrayNs = currentNamespace["Data.Array"];
            const bindNs = currentNamespace["Control.Bind"];
            const functionNs = currentNamespace["Data.Function"];
            const maybeNs = currentNamespace["Data.Maybe"];

            arrayNs.singleton = function (val) {
                return [val];
            };

            const concatMapFn = functionNs.flip(bindNs.bind(bindNs.bindArray));
            arrayNs.concatMap = concatMapFn;

            arrayNs.mapMaybe = function (mapperFn) {
                return concatMapFn(function (item) {
                    return maybeNs.maybe([])(arrayNs.singleton)(mapperFn(item));
                });
            };
        })(psRuntime);

        // Module: Data.Boolean
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Boolean"] = currentNamespace["Data.Boolean"] || {};
            currentNamespace["Data.Boolean"].otherwise = true;
        })(psRuntime);

        // Module: Data.Either
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Either"] = currentNamespace["Data.Either"] || {};
            const eitherNs = currentNamespace["Data.Either"];
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];
            const bindNs = currentNamespace["Control.Bind"];
            const functorNs = currentNamespace["Data.Functor"];
            const maybeNs = currentNamespace["Data.Maybe"];

            // Left constructor
            const LeftType = function (val) {
                this.value0 = val;
            };
            LeftType.create = (val) => new LeftType(val);

            // Right constructor
            const RightType = function (val) {
                this.value0 = val;
            };
            RightType.create = (val) => new RightType(val);

            const eitherFunctorInst = new functorNs.Functor(function (mapperFn) {
                return function (eitherVal) {
                    if (eitherVal instanceof LeftType) {
                        return new LeftType(eitherVal.value0);
                    }
                    if (eitherVal instanceof RightType) {
                        return new RightType(mapperFn(eitherVal.value0));
                    }
                    throw new Error("Either Functor: Failed pattern match on either value.");
                };
            });

            const eitherMatcher = function (leftMatcher) {
                return function (rightMatcher) {
                    return function (eitherVal) {
                        if (eitherVal instanceof LeftType) {
                            return leftMatcher(eitherVal.value0);
                        }
                        if (eitherVal instanceof RightType) {
                            return rightMatcher(eitherVal.value0);
                        }
                        throw new Error("Either Matcher: Failed pattern match on either value.");
                    };
                };
            };

            const eitherApplyInst = new applyNs.Apply(
                () => eitherFunctorInst,
                function (eitherFunc) {
                    return function (eitherVal) {
                        if (eitherFunc instanceof LeftType) {
                            return new LeftType(eitherFunc.value0);
                        }
                        if (eitherFunc instanceof RightType) {
                            return functorNs.map(eitherFunctorInst)(eitherFunc.value0)(eitherVal);
                        }
                        throw new Error("Either Apply: Failed pattern match on function container.");
                    };
                }
            );

            const eitherBindInst = new bindNs.Bind(
                () => eitherApplyInst,
                eitherMatcher(
                    (leftVal) => (binderFn) => new LeftType(leftVal)
                )(
                    (rightVal) => (binderFn) => binderFn(rightVal)
                )
            );

            const eitherApplicativeInst = new applicativeNs.Applicative(
                () => eitherApplyInst,
                RightType.create
            );

            eitherNs.Left = LeftType;
            eitherNs.Right = RightType;
            eitherNs.either = eitherMatcher;
            eitherNs.note = function (leftVal) {
                return maybeNs.maybe(new LeftType(leftVal))(RightType.create);
            };
            eitherNs.functorEither = eitherFunctorInst;
            eitherNs.applyEither = eitherApplyInst;
            eitherNs.applicativeEither = eitherApplicativeInst;
            eitherNs.bindEither = eitherBindInst;
        })(psRuntime);

        // Module: Data.EuclideanRing
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.EuclideanRing"] = currentNamespace["Data.EuclideanRing"] || {};
            const euclideanRingJs = currentNamespace["Data.EuclideanRing"];

            euclideanRingJs.intDegree = function (n) {
                return Math.min(Math.abs(n), 2147483647);
            };

            euclideanRingJs.intDiv = function (dividend) {
                return function (divisor) {
                    if (divisor === 0) return 0;
                    if (divisor > 0) return Math.floor(dividend / divisor);
                    return -Math.floor(dividend / -divisor);
                };
            };

            euclideanRingJs.intMod = function (dividend) {
                return function (divisor) {
                    if (divisor === 0) return 0;
                    const absoluteDivisor = Math.abs(divisor);
                    return (dividend % absoluteDivisor + absoluteDivisor) % absoluteDivisor;
                };
            };
        })(psRuntime);

        // Module: Data.Ring
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Data.Ring"] = currentNamespace["Data.Ring"] || {}).intSub = function (a) {
                return function (b) {
                    return (a - b) | 0;
                };
            };
        })(psRuntime);

        // Module: Data.Semiring
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Semiring"] = currentNamespace["Data.Semiring"] || {};
            const semiringJs = currentNamespace["Data.Semiring"];

            semiringJs.intAdd = function (a) {
                return function (b) {
                    return (a + b) | 0;
                };
            };

            semiringJs.intMul = function (a) {
                return function (b) {
                    return (a * b) | 0;
                };
            };
        })(psRuntime);

        // Module: Data.Semiring
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Semiring"] = currentNamespace["Data.Semiring"] || {};
            const semiringNs = currentNamespace["Data.Semiring"];
            const semiringJs = currentNamespace["Data.Semiring"];

            const SemiringConstructor = function (addFn, mulFn, oneVal, zeroVal) {
                this.add = addFn;
                this.mul = mulFn;
                this.one = oneVal;
                this.zero = zeroVal;
            };

            const intSemiringInstance = new SemiringConstructor(
                semiringJs.intAdd,
                semiringJs.intMul,
                1,
                0
            );

            semiringNs.Semiring = SemiringConstructor;
            semiringNs.add = function (instance) {
                return instance.add;
            };
            semiringNs.zero = function (instance) {
                return instance.zero;
            };
            semiringNs.mul = function (instance) {
                return instance.mul;
            };
            semiringNs.one = function (instance) {
                return instance.one;
            };
            semiringNs.semiringInt = intSemiringInstance;
        })(psRuntime);

        // Module: Data.Ring
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Ring"] = currentNamespace["Data.Ring"] || {};
            const ringNs = currentNamespace["Data.Ring"];
            const ringJs = currentNamespace["Data.Ring"];
            const semiringNs = currentNamespace["Data.Semiring"];

            const RingConstructor = function (semiringInst, subFn) {
                this.Semiring0 = semiringInst;
                this.sub = subFn;
            };

            const intRingInstance = new RingConstructor(
                () => semiringNs.semiringInt,
                ringJs.intSub
            );

            ringNs.Ring = RingConstructor;
            ringNs.sub = function (instance) {
                return instance.sub;
            };
            ringNs.ringInt = intRingInstance;
        })(psRuntime);

        // Module: Data.CommutativeRing
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.CommutativeRing"] = currentNamespace["Data.CommutativeRing"] || {};
            const commRingNs = currentNamespace["Data.CommutativeRing"];
            const ringNs = currentNamespace["Data.Ring"];

            const CommutativeRingConstructor = function (ringInst) {
                this.Ring0 = ringInst;
            };

            const intCommRingInstance = new CommutativeRingConstructor(
                () => ringNs.ringInt
            );

            commRingNs.CommutativeRing = CommutativeRingConstructor;
            commRingNs.commutativeRingInt = intCommRingInstance;
        })(psRuntime);

        // Module: Data.EuclideanRing
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.EuclideanRing"] = currentNamespace["Data.EuclideanRing"] || {};
            const euclideanRingNs = currentNamespace["Data.EuclideanRing"];
            const euclideanRingJs = currentNamespace["Data.EuclideanRing"];
            const commRingNs = currentNamespace["Data.CommutativeRing"];

            const EuclideanRingConstructor = function (commRingInst, degreeFn, divFn, modFn) {
                this.CommutativeRing0 = commRingInst;
                this.degree = degreeFn;
                this.div = divFn;
                this.mod = modFn;
            };

            const intEuclideanRingInstance = new EuclideanRingConstructor(
                () => commRingNs.commutativeRingInt,
                euclideanRingJs.intDegree,
                euclideanRingJs.intDiv,
                euclideanRingJs.intMod
            );

            euclideanRingNs.EuclideanRing = EuclideanRingConstructor;
            euclideanRingNs.degree = function (instance) {
                return instance.degree;
            };
            euclideanRingNs.div = function (instance) {
                return instance.div;
            };
            euclideanRingNs.mod = function (instance) {
                return instance.mod;
            };
            euclideanRingNs.euclideanRingInt = intEuclideanRingInstance;
        })(psRuntime);

        // Module: Data.Foldable
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Foldable"] = currentNamespace["Data.Foldable"] || {};
            const foldableJs = currentNamespace["Data.Foldable"];

            foldableJs.foldrArray = function (reducerFn) {
                return function (initialValue) {
                    return function (inputArray) {
                        let accumulator = initialValue;
                        for (let i = inputArray.length - 1; i >= 0; i--) {
                            accumulator = reducerFn(inputArray[i])(accumulator);
                        }
                        return accumulator;
                    };
                };
            };

            foldableJs.foldlArray = function (reducerFn) {
                return function (initialValue) {
                    return function (inputArray) {
                        let accumulator = initialValue;
                        for (let i = 0, len = inputArray.length; i < len; i++) {
                            accumulator = reducerFn(accumulator)(inputArray[i]);
                        }
                        return accumulator;
                    };
                };
            };
        })(psRuntime);

        // Module: Data.Monoid
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Monoid"] = currentNamespace["Data.Monoid"] || {};
            const monoidNs = currentNamespace["Data.Monoid"];

            monoidNs.Monoid = function (semigroupInst, memptyVal) {
                this.Semigroup0 = semigroupInst;
                this.mempty = memptyVal;
            };

            monoidNs.mempty = function (instance) {
                return instance.mempty;
            };
        })(psRuntime);

        // Module: Data.Semigroup
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Semigroup"] = currentNamespace["Data.Semigroup"] || {};
            const semigroupNs = currentNamespace["Data.Semigroup"];

            semigroupNs.Semigroup = function (appendFn) {
                this.append = appendFn;
            };

            semigroupNs.append = function (instance) {
                return instance.append;
            };
        })(psRuntime);

        // Module: Data.Foldable
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Foldable"] = currentNamespace["Data.Foldable"] || {};
            const foldableNs = currentNamespace["Data.Foldable"];
            const foldableJs = currentNamespace["Data.Foldable"];
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];
            const monoidNs = currentNamespace["Data.Monoid"];
            const semigroupNs = currentNamespace["Data.Semigroup"];
            const unitNs = currentNamespace["Data.Unit"];

            const FoldableConstructor = function (foldMapFn, foldlFn, foldrFn) {
                this.foldMap = foldMapFn;
                this.foldl = foldlFn;
                this.foldr = foldrFn;
            };

            const getFoldrFunction = function (instance) {
                return instance.foldr;
            };

            const foldMapDefaultR = function (foldableInst) {
                return function (monoidInst) {
                    return function (mapperFn) {
                        return getFoldrFunction(foldableInst)(function (element) {
                            return function (accumulator) {
                                return semigroupNs.append(monoidInst.Semigroup0())(mapperFn(element))(accumulator);
                            };
                        })(monoidNs.mempty(monoidInst));
                    };
                };
            };

            const arrayFoldableInstance = new FoldableConstructor(
                function (monoidInst) {
                    return foldMapDefaultR(arrayFoldableInstance)(monoidInst);
                },
                foldableJs.foldlArray,
                foldableJs.foldrArray
            );

            foldableNs.Foldable = FoldableConstructor;
            foldableNs.foldr = getFoldrFunction;
            foldableNs.foldl = function (instance) {
                return instance.foldl;
            };
            foldableNs.foldMap = function (instance) {
                return instance.foldMap;
            };
            foldableNs.foldMapDefaultR = foldMapDefaultR;
            foldableNs.traverse_ = function (applicativeInst) {
                return function (foldableInst) {
                    return function (traverserFn) {
                        const foldrFn = getFoldrFunction(foldableInst);
                        const initialPure = applicativeNs.pure(applicativeInst)(unitNs.unit);
                        return foldrFn(function (element) {
                            return function (accumulator) {
                                return applyNs.applySecond(applicativeInst.Apply0())(traverserFn(element))(accumulator);
                            };
                        })(initialPure);
                    };
                };
            };
            foldableNs.foldableArray = arrayFoldableInstance;
        })(psRuntime);

        // Module: Data.Int
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Data.Int"] = currentNamespace["Data.Int"] || {}).fromStringAsImpl = function (justConstructor) {
                return function (nothingValue) {
                    return function (radix) {
                        // Construct regex pattern based on radix
                        let charPattern;
                        if (radix < 11) {
                            charPattern = "[0-" + (radix - 1).toString() + "]";
                        } else if (radix === 11) {
                            charPattern = "[0-9a]";
                        } else {
                            charPattern = "[0-9a-" + String.fromCharCode(86 + radix) + "]";
                        }
                        const validationRegex = new RegExp("^[\\+\\-]?" + charPattern + "+$", "i");

                        return function (inputStr) {
                            if (validationRegex.test(inputStr)) {
                                const parsed = parseInt(inputStr, radix);
                                // Check if parsed value is a valid integer (not NaN and within 32-bit range implicitly by |0)
                                if ((parsed | 0) === parsed) {
                                    return justConstructor(parsed);
                                }
                                return nothingValue;
                            }
                            return nothingValue;
                        };
                    };
                };
            };
        })(psRuntime);

        // Module: Data.Int
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Int"] = currentNamespace["Data.Int"] || {};
            const intNs = currentNamespace["Data.Int"];
            const intJs = currentNamespace["Data.Int"];
            const maybeNs = currentNamespace["Data.Maybe"];

            const fromStringAsBase = intJs.fromStringAsImpl(maybeNs.Just.create)(maybeNs.Nothing.value);
            const fromStringDecimal = fromStringAsBase(10);

            intNs.fromString = fromStringDecimal;
            intNs.fromStringAs = fromStringAsBase;
            intNs.odd = function (num) {
                return (num & 1) !== 0; // Bitwise check for oddness
            };
        })(psRuntime);

        // Module: Data.Show
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Data.Show"] = currentNamespace["Data.Show"] || {}).showIntImpl = function (num) {
                return num.toString();
            };
        })(psRuntime);

        // Module: Data.Show
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Show"] = currentNamespace["Data.Show"] || {};
            const showNs = currentNamespace["Data.Show"];

            const ShowConstructor = function (showFn) {
                this.show = showFn;
            };

            const intShowInstance = new ShowConstructor(psRuntime["Data.Show"].showIntImpl);

            showNs.Show = ShowConstructor;
            showNs.show = function (instance) {
                return instance.show;
            };
            showNs.showInt = intShowInstance;
        })(psRuntime);

        // Module: Data.String.Common
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.String.Common"] = currentNamespace["Data.String.Common"] || {};
            const stringCommonJs = currentNamespace["Data.String.Common"];

            stringCommonJs.split = function (separator) {
                return function (str) {
                    return str.split(separator);
                };
            };

            stringCommonJs.trim = function (str) {
                return str.trim();
            };
        })(psRuntime);

        // Module: Data.String.Common (Redundant re-assignment)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.String.Common"] = currentNamespace["Data.String.Common"] || {};
            const stringCommonNs = currentNamespace["Data.String.Common"];
            const stringCommonJs = currentNamespace["Data.String.Common"];
            stringCommonNs.split = stringCommonJs.split;
            stringCommonNs.trim = stringCommonJs.trim;
        })(psRuntime);

        // Module: Data.Tuple
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Data.Tuple"] = currentNamespace["Data.Tuple"] || {};
            const tupleNs = currentNamespace["Data.Tuple"];

            const TupleConstructor = function (val0, val1) {
                this.value0 = val0;
                this.value1 = val1;
            };
            TupleConstructor.create = (val0) => (val1) => new TupleConstructor(val0, val1);

            tupleNs.Tuple = TupleConstructor;
        })(psRuntime);

        // Module: Effect
        (function (currentNamespace) {
            "use strict";
            currentNamespace.Effect = currentNamespace.Effect || {};
            const effectJs = currentNamespace.Effect;

            effectJs.pureE = function (value) {
                return function () {
                    return value;
                };
            };

            effectJs.bindE = function (effect) {
                return function (continuation) {
                    return function () {
                        return continuation(effect())();
                    };
                };
            };
        })(psRuntime);

        // Module: Effect
        (function (currentNamespace) {
            "use strict";
            currentNamespace.Effect = currentNamespace.Effect || {};
            const effectNs = currentNamespace.Effect;
            const effectJs = currentNamespace.Effect;
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];
            const bindNs = currentNamespace["Control.Bind"];
            const monadNs = currentNamespace["Control.Monad"];
            const functorNs = currentNamespace["Data.Functor"];

            const effectMonadInst = new monadNs.Monad(
                () => effectApplicativeInst,
                () => effectBindInst
            );

            const effectBindInst = new bindNs.Bind(
                () => effectApplyInst,
                effectJs.bindE
            );

            const effectApplyInst = new applyNs.Apply(
                () => effectFunctorInst,
                monadNs.ap(effectMonadInst)
            );

            const effectApplicativeInst = new applicativeNs.Applicative(
                () => effectApplyInst,
                effectJs.pureE
            );

            const effectFunctorInst = new functorNs.Functor(
                applicativeNs.liftA1(effectApplicativeInst)
            );

            effectNs.functorEffect = effectFunctorInst;
            effectNs.applyEffect = effectApplyInst;
            effectNs.applicativeEffect = effectApplicativeInst;
            effectNs.bindEffect = effectBindInst;
            effectNs.monadEffect = effectMonadInst;
        })(psRuntime);

        // Module: Effect.Aff
        (function (currentNamespace) {
            "use strict";
            const affRuntime = function () {
                const consts = {
                    Empty: null,
                    Pure: "Pure",
                    Throw: "Throw",
                    Catch: "Catch",
                    Sync: "Sync",
                    Async: "Async",
                    Bind: "Bind",
                    Bracket: "Bracket",
                    Fork: "Fork",
                    Sequential: "Sequential",
                    Map: "Map",
                    Apply: "Apply",
                    Alt: "Alt",
                    Cons: "Cons",
                    Resume: "Resume",
                    Release: "Release",
                    Finalizer: "Finalizer",
                    Finalized: "Finalized",
                    Forked: "Forked"
                };

                // D represents a Free monad step or Fiber state.
                function D(tag, _1, _2, _3) {
                    this.tag = tag;
                    this._1 = _1;
                    this._2 = _2;
                    this._3 = _3;
                }

                // Helper to create D instances
                function createD(tag) {
                    const constructor = function (val1, val2, val3) {
                        return new D(tag, val1, val2, val3);
                    };
                    constructor.tag = tag;
                    return constructor;
                }

                const D_Pure = createD(consts.Pure);
                const D_Throw = createD(consts.Throw);
                const D_Catch = createD(consts.Catch);
                const D_Sync = createD(consts.Sync);
                const D_Async = createD(consts.Async);
                const D_Bind = createD(consts.Bind);
                const D_Bracket = createD(consts.Bracket);
                const D_Fork = createD(consts.Fork);
                const D_Seq = createD(consts.Sequential);
                const D_ParMap = createD(consts.Map);
                const D_ParApply = createD(consts.Apply);
                const D_ParAlt = createD(consts.Alt);

                // Scheduler for microtasks
                const scheduler = (function () {
                    const queueSize = 1024;
                    let queueHead = 0;
                    let queueTail = 0;
                    const taskQueue = new Array(queueSize);
                    let isDraining = false;

                    function drainQueue() {
                        let currentTask;
                        isDraining = true;
                        while (queueHead !== 0) { // queueHead is the count of tasks
                            queueHead--;
                            currentTask = taskQueue[queueTail];
                            taskQueue[queueTail] = undefined; // Dereference
                            queueTail = (queueTail + 1) % queueSize;
                            currentTask();
                        }
                        isDraining = false;
                    }

                    return {
                        isDraining: () => isDraining,
                        enqueue: (task) => {
                            if (queueHead === queueSize) {
                                // If queue is full, drain it before adding more
                                const wasDraining = isDraining;
                                drainQueue();
                                isDraining = wasDraining; // Restore draining state
                            }
                            taskQueue[(queueTail + queueHead) % queueSize] = task;
                            queueHead++;
                            if (!isDraining) {
                                drainQueue();
                            }
                        }
                    };
                })();

                const FiberStates = {
                    INITIAL: 0,
                    RUNNING: 1,
                    SUSPENDED: 2,
                    ASYNC_WAIT: 3,
                    CLEANING: 4,
                    COMPLETED: 5,
                    KILLED: 6
                };

                // Fiber represents a running Aff computation
                function Fiber(eitherApi, supervisor, initialComputation) {
                    let internalState = FiberStates.INITIAL;
                    let fiberId = 0; // Used for unique identification, if needed
                    let currentValue = initialComputation;
                    let currentError = null;
                    let resumeStack = null;
                    let bracketStack = null;
                    let killToken = null; // Sentinel for internal kills
                    let childFibersCount = 0;
                    let asyncWaitCount = 0;
                    let completionHandlers = null; // Map of id -> { rethrow, handler }
                    let fiberSupervisor = supervisor;
                    let rethrowUnhandled = true;

                    // Execute a continuation (the next step in the Free monad)
                    function proceedStep(stepId) {
                        let currentInstruction;
                        let nextInstruction;
                        let nextResumeStack;

                        // State machine for fiber execution
                        for (; ;) {
                            switch (internalState) {
                                case FiberStates.SUSPENDED:
                                    // If suspended, transition to running and proceed
                                    internalState = FiberStates.RUNNING;
                                    currentValue = resumeStack(currentValue);
                                    resumeStack = null;
                                    break;

                                case FiberStates.ASYNC_WAIT:
                                    // If waiting for async, and we have an error, transition to Cleaning
                                    if (eitherApi.isLeft(currentValue)) {
                                        internalState = FiberStates.KILLED;
                                        currentError = currentValue;
                                        currentValue = null;
                                    } else {
                                        // If no error, and resume stack is empty, transition to Cleaning.
                                        // Otherwise, proceed with the result.
                                        if (resumeStack === null) {
                                            internalState = FiberStates.KILLED;
                                        } else {
                                            internalState = FiberStates.SUSPENDED;
                                            currentValue = eitherApi.fromRight(currentValue);
                                        }
                                    }
                                    break;

                                case FiberStates.RUNNING:
                                    currentInstruction = currentValue;
                                    switch (currentInstruction.tag) {
                                        case consts.Bind:
                                            // Push continuation to stack and process the bound value
                                            if (resumeStack) {
                                                resumeStack = new D(consts.Cons, resumeStack, currentInstruction._2);
                                            } else {
                                                resumeStack = currentInstruction._2;
                                            }
                                            internalState = FiberStates.RUNNING;
                                            currentValue = currentInstruction._1;
                                            break;

                                        case consts.Pure:
                                            // Pop continuation from stack or complete
                                            if (resumeStack === null) {
                                                internalState = FiberStates.KILLED;
                                                currentValue = eitherApi.right(currentInstruction._1);
                                            } else {
                                                internalState = FiberStates.SUSPENDED;
                                                currentValue = currentInstruction._1;
                                            }
                                            break;

                                        case consts.Sync:
                                            // Execute synchronous effect
                                            internalState = FiberStates.ASYNC_WAIT; // Temporarily use this state for handling results
                                            try {
                                                currentValue = eitherApi.right(currentInstruction._1());
                                            } catch (err) {
                                                currentValue = eitherApi.left(err);
                                            }
                                            break;

                                        case consts.Async:
                                            // Execute asynchronous effect, suspending the fiber
                                            internalState = FiberStates.ASYNC_WAIT;
                                            return currentInstruction._1(eitherApi.left, function (result) {
                                                return function () {
                                                    // Only resume if the step ID matches (i.e., not killed/restarted)
                                                    if (stepId === fiberId) {
                                                        fiberId++; // Increment to invalidate old continuations
                                                        scheduler.enqueue(function () {
                                                            if (stepId + 1 === fiberId) { // Ensure it's the latest step
                                                                internalState = FiberStates.ASYNC_WAIT; // Indicate async result arrived
                                                                currentValue = result;
                                                                proceedStep(fiberId);
                                                            }
                                                        });
                                                    }
                                                };
                                            });

                                        case consts.Throw:
                                            // Set error and transition to cleaning
                                            internalState = FiberStates.KILLED;
                                            currentError = eitherApi.left(currentInstruction._1);
                                            currentValue = null;
                                            break;

                                        case consts.Catch:
                                            // Push error handler to bracket stack
                                            bracketStack = new D(consts.Cons, currentInstruction, bracketStack); // Store Catch instruction
                                            if (resumeStack) {
                                                // Store current resume stack
                                                bracketStack = new D(consts.Cons, new D(consts.Resume, resumeStack, currentInstruction._2), bracketStack);
                                            }
                                            resumeStack = null; // Clear resume stack
                                            internalState = FiberStates.RUNNING;
                                            currentValue = currentInstruction._1;
                                            break;

                                        case consts.Bracket:
                                            // Push finalizer to bracket stack
                                            childFibersCount++;
                                            bracketStack = new D(consts.Cons, currentInstruction, bracketStack);
                                            if (resumeStack) {
                                                bracketStack = new D(consts.Cons, new D(consts.Resume, resumeStack, currentInstruction._2), bracketStack);
                                            }
                                            resumeStack = null;
                                            internalState = FiberStates.RUNNING;
                                            currentValue = currentInstruction._1;
                                            break;

                                        case consts.Fork:
                                            // Create a new fiber and return it
                                            internalState = FiberStates.ASYNC_WAIT;
                                            const newFiber = Fiber(eitherApi, fiberSupervisor, currentInstruction._2);
                                            if (fiberSupervisor) {
                                                fiberSupervisor.register(newFiber);
                                            }
                                            if (currentInstruction._1) {
                                                newFiber.run(); // Start the fiber if requested
                                            }
                                            currentValue = eitherApi.right(newFiber);
                                            break;

                                        case consts.Sequential:
                                            // Execute sequentially
                                            internalState = FiberStates.RUNNING;
                                            currentValue = SequentialExecutor(eitherApi, fiberSupervisor, currentInstruction._1);
                                            break;

                                        default:
                                            // This case should ideally not be reached if all instructions are handled.
                                            // For safety, transition to killed state with an error.
                                            internalState = FiberStates.KILLED;
                                            currentError = eitherApi.left(new Error("Unknown Aff instruction: " + currentInstruction.tag));
                                            currentValue = null;
                                            break;
                                    }
                                    break; // End of RUNNING state

                                case FiberStates.KILLED:
                                    // Propagate error or result up the bracket stack
                                    if (resumeStack) {
                                        resumeStack = null; // Clear any pending resume stack
                                    }

                                    if (bracketStack === null) {
                                        // No more bracket handlers, exit fiber
                                        // Call all completion handlers
                                        for (const handlerId in completionHandlers) {
                                            if (completionHandlers.hasOwnProperty(handlerId)) {
                                                const handler = completionHandlers[handlerId];
                                                rethrowUnhandled = rethrowUnhandled && handler.rethrow;
                                                // Schedule handler execution to avoid blocking
                                                setTimeout(() => handler.handler(currentValue), 0);
                                            }
                                        }
                                        completionHandlers = null; // Clear handlers
                                        // If fiber was killed by external killToken and no error was caught, rethrow
                                        if (killToken && currentError) {
                                            setTimeout(() => {
                                                throw eitherApi.fromLeft(currentError);
                                            }, 0);
                                        } else if (eitherApi.isLeft(currentValue) && rethrowUnhandled) {
                                            // If unhandled error, rethrow
                                            setTimeout(() => {
                                                if (rethrowUnhandled) throw eitherApi.fromLeft(currentValue);
                                            }, 0);
                                        }
                                        return; // Fiber execution ends
                                    } else {
                                        // Pop from bracket stack
                                        currentInstruction = bracketStack._1;
                                        bracketStack = bracketStack._2;
                                        nextResumeStack = bracketStack._3; // This is actually the N of Cons(D,N,X,Y)
                                        bracketStack = bracketStack._4; // This is the actual bracketStack

                                        switch (currentInstruction.tag) {
                                            case consts.Catch:
                                                // If killToken is active, or no error, just skip this catch
                                                if (killToken && killToken !== nextResumeStack) { // nextResumeStack here is the killToken
                                                    // Do nothing, proceed to next bracket
                                                } else if (currentError) {
                                                    // If there's an error, apply the catch handler
                                                    internalState = FiberStates.RUNNING;
                                                    currentValue = currentInstruction._2(eitherApi.fromLeft(currentError));
                                                    currentError = null; // Error handled
                                                }
                                                break;

                                            case consts.Resume: // This is a resume stack saved by a Catch or Bracket
                                                if (killToken && killToken !== nextResumeStack || currentError) {
                                                    // If killed or error, skip resuming original computation
                                                } else {
                                                    resumeStack = currentInstruction._1;
                                                    nextInstruction = currentInstruction._2;
                                                    internalState = FiberStates.SUSPENDED; // Back to running after resume
                                                    currentValue = eitherApi.fromRight(currentValue);
                                                }
                                                break;

                                            case consts.Bracket:
                                                childFibersCount--;
                                                // Check if an error occurred or killToken is present
                                                if (currentError) {
                                                    // If error, run the failed finalizer
                                                    bracketStack = new D(consts.Cons, new D(consts.Finalized, currentValue, currentError), bracketStack, nextResumeStack);
                                                    internalState = FiberStates.RUNNING;
                                                    currentValue = currentInstruction._2.failed(eitherApi.fromLeft(currentError))(eitherApi.fromRight(currentValue));
                                                    currentError = null;
                                                } else if (killToken) {
                                                    // If killed, run the killed finalizer
                                                    bracketStack = new D(consts.Cons, new D(consts.Finalized, currentValue, currentError), bracketStack, nextResumeStack);
                                                    internalState = FiberStates.RUNNING;
                                                    currentValue = currentInstruction._2.killed(eitherApi.fromLeft(killToken))(eitherApi.fromRight(currentValue));
                                                } else {
                                                    // Otherwise, this bracket was part of normal execution, run completed finalizer
                                                    bracketStack = new D(consts.Cons, new D(consts.Finalized, currentValue, currentError), bracketStack, nextResumeStack);
                                                    internalState = FiberStates.RUNNING;
                                                    currentValue = currentInstruction._2.completed(eitherApi.fromRight(currentValue))(eitherApi.fromRight(currentValue));
                                                }
                                                break;

                                            case consts.Finalizer:
                                                childFibersCount++;
                                                bracketStack = new D(consts.Cons, new D(consts.Finalized, currentValue, currentError), bracketStack, nextResumeStack);
                                                internalState = FiberStates.RUNNING;
                                                currentValue = currentInstruction._1;
                                                break;

                                            case consts.Finalized:
                                                childFibersCount--;
                                                internalState = FiberStates.KILLED;
                                                currentValue = currentInstruction._1;
                                                currentError = currentInstruction._2; // Restore error if any
                                                break;
                                        }
                                    }
                                    break; // End of KILLED state

                                case FiberStates.INITIAL:
                                    internalState = FiberStates.RUNNING; // Start execution
                                    break;
                                default:
                                    // Should not happen, but a safety break
                                    console.error("Unknown fiber state: " + internalState);
                                    internalState = FiberStates.KILLED;
                                    currentError = eitherApi.left(new Error("Internal fiber error: unknown state."));
                                    break;
                            }
                        }
                    }

                    let completionHandlerCounter = 0;
                    function addCompletionHandler(handlerObj) {
                        const handlerId = completionHandlerCounter++;
                        completionHandlers = completionHandlers || {};
                        completionHandlers[handlerId] = handlerObj;
                        return function () {
                            if (completionHandlers) {
                                delete completionHandlers[handlerId];
                            }
                        };
                    }

                    return {
                        // Kills the fiber with a given error
                        kill: function (error, callback) {
                            return function () {
                                if (internalState === FiberStates.KILLED) {
                                    // If already killed, just run the callback
                                    callback(eitherApi.right(undefined))();
                                    return function () {
                                    }; // No-op canceler
                                }
                                const deregister = addCompletionHandler({
                                    rethrow: false,
                                    handler: () => callback(eitherApi.right(undefined))()
                                });

                                switch (internalState) {
                                    case FiberStates.INITIAL:
                                        killToken = eitherApi.left(error);
                                        internalState = FiberStates.KILLED;
                                        currentValue = killToken;
                                        proceedStep(fiberId);
                                        break;
                                    case FiberStates.ASYNC_WAIT:
                                        if (killToken === null) {
                                            killToken = eitherApi.left(error);
                                        }
                                        if (childFibersCount === 0) {
                                            // If no child fibers, we can transition to KILLED directly
                                            // This might involve running finalizers before actually stopping
                                            internalState = FiberStates.KILLED;
                                            currentValue = null;
                                            currentError = null;
                                            proceedStep(++fiberId); // Increment fiberId to cancel async operations
                                        }
                                        break;
                                    default:
                                        if (killToken === null) {
                                            killToken = eitherApi.left(error);
                                        }
                                        if (childFibersCount === 0) {
                                            internalState = FiberStates.KILLED;
                                            currentValue = null;
                                            currentError = null;
                                        }
                                        break;
                                }
                                return deregister;
                            };
                        },
                        // Joins this fiber, waiting for its completion
                        join: function (callback) {
                            return function () {
                                const deregister = addCompletionHandler({rethrow: false, handler: callback});
                                if (internalState === FiberStates.INITIAL) {
                                    proceedStep(fiberId);
                                }
                                return deregister;
                            };
                        },
                        // Add a handler to be called when the fiber completes
                        onComplete: addCompletionHandler,
                        isSuspended: () => internalState === FiberStates.INITIAL,
                        run: () => {
                            if (internalState === FiberStates.INITIAL) {
                                if (scheduler.isDraining()) {
                                    proceedStep(fiberId);
                                } else {
                                    scheduler.enqueue(() => proceedStep(fiberId));
                                }
                            }
                        }
                    };
                }

                // Sequential Executor for ParAff
                function SequentialExecutor(eitherApi, supervisor, computation) {
                    return D_Async(function (reject, resolve) {
                        return function () {
                            const parAffContext = {
                                counter: 0,
                                activeFibers: {}, // map of id -> Fiber
                                nextFiberId: 0,
                                killError: new Error("[ParAff] Early exit"), // Sentinel error
                                finalResult: null,
                                supervisor: supervisor // Supervisor from the parent fiber
                            };

                            // Function to handle a fiber's completion
                            function handleFiberCompletion(fiberInfo) {
                                return function (result) {
                                    return function () {
                                        delete parAffContext.activeFibers[fiberInfo._1]; // Remove from active fibers
                                        fiberInfo._3 = result; // Store result on the Forked D object

                                        // This is a complex state machine for ParAff,
                                        // essentially a reverse traversal of the ParAff tree
                                        (function traverseParAffTree(currentResult, currentInstruction, parentInstruction) {
                                            let leftResult, rightResult;
                                            for (; ;) {
                                                if (parAffContext.finalResult !== null) return; // Already resolved/rejected

                                                if (currentInstruction === null) {
                                                    // Reached the root, resolve/reject the overall computation
                                                    if (parentInstruction === null) {
                                                        resolve(currentResult)();
                                                    }
                                                    return;
                                                }

                                                // If this instruction has already been processed, skip
                                                if (currentInstruction._3 !== eitherApi.Empty) return;

                                                switch (currentInstruction.tag) {
                                                    case consts.Map:
                                                        // Map applies to the result of its child
                                                        if (eitherApi.isLeft(currentResult)) {
                                                            currentInstruction._3 = currentResult; // Propagate error
                                                        } else {
                                                            currentInstruction._3 = eitherApi.right(currentInstruction._1(eitherApi.fromRight(currentResult)));
                                                        }
                                                        break;

                                                    case consts.Apply:
                                                    case consts.Alt:
                                                        // Apply and Alt depend on two children
                                                        leftResult = currentInstruction._1._3;
                                                        rightResult = currentInstruction._2._3;

                                                        if (eitherApi.isLeft(leftResult) && eitherApi.isLeft(rightResult)) {
                                                            // Both failed, propagate one of the errors
                                                            currentResult = currentResult === leftResult ? rightResult : leftResult;
                                                            currentInstruction._3 = currentResult;
                                                        } else if (leftResult === eitherApi.Empty || rightResult === eitherApi.Empty) {
                                                            // One is still pending, don't resolve yet
                                                            return;
                                                        } else {
                                                            // At least one succeeded
                                                            if (currentInstruction.tag === consts.Apply) {
                                                                currentResult = eitherApi.right(eitherApi.fromRight(leftResult)(eitherApi.fromRight(rightResult)));
                                                                currentInstruction._3 = currentResult;
                                                            } else { // Alt
                                                                // If left succeeded, use left, else use right
                                                                currentResult = eitherApi.isLeft(leftResult) ? rightResult : leftResult;
                                                                currentInstruction._3 = currentResult;
                                                            }
                                                        }
                                                        break;
                                                }

                                                // Move up to the parent
                                                parentInstruction = currentInstruction._2; // This is the old parent
                                                currentInstruction = currentInstruction._1; // This is the old current
                                            }
                                        })(result, fiberInfo._2._1, fiberInfo._2._2);
                                    };
                                };
                            }

                            // Function to kill all active fibers
                            function killAllChildFibers(error, completeCallback) {
                                let pendingKills = 0;
                                const killCancelers = {};

                                function handleKillCompletion(fiberId) {
                                    return function () {
                                        delete killCancelers[fiberId];
                                        pendingKills--;
                                        if (pendingKills === 0) {
                                            // All child fibers killed, complete the main cancellation
                                            completeCallback();
                                        }
                                    };
                                }

                                for (const fid in parAffContext.activeFibers) {
                                    if (parAffContext.activeFibers.hasOwnProperty(fid)) {
                                        pendingKills++;
                                        killCancelers[fid] = parAffContext.activeFibers[fid].kill(error, handleKillCompletion(fid))();
                                    }
                                }

                                // If no active fibers, complete immediately
                                if (pendingKills === 0) {
                                    completeCallback();
                                }

                                // Return a canceler for these kill operations
                                return D_Sync(function () {
                                    for (const fid in killCancelers) {
                                        if (killCancelers.hasOwnProperty(fid)) {
                                            killCancelers[fid](); // Execute each kill canceler
                                        }
                                    }
                                    return D_Pure(undefined);
                                });
                            }

                            // Main execution loop for ParAff
                            let currentParInstruction = computation;
                            let parentParInstruction = null; // Used to build the tree structure
                            let currentExecutionState = FiberStates.RUNNING; // Reuse FiberStates for ParAff execution

                            for (; ;) {
                                let leftChild, rightChild; // Placeholder for children of ParApply/ParAlt

                                switch (currentExecutionState) {
                                    case FiberStates.RUNNING:
                                        switch (currentParInstruction.tag) {
                                            case consts.ParMap:
                                                // Create a new node in the tree and descend
                                                if (parentParInstruction) {
                                                    parentParInstruction = new D(consts.Cons, parentParInstruction, parentParInstruction._2); // Push parent to stack
                                                }
                                                parentParInstruction = new D(consts.ParMap, currentParInstruction._1, eitherApi.Empty, eitherApi.Empty);
                                                currentParInstruction = currentParInstruction._2; // Descend to child
                                                break;

                                            case consts.ParApply:
                                                if (parentParInstruction) {
                                                    parentParInstruction = new D(consts.Cons, parentParInstruction, parentParInstruction._2);
                                                }
                                                parentParInstruction = new D(consts.ParApply, eitherApi.Empty, currentParInstruction._2, eitherApi.Empty);
                                                currentParInstruction = currentParInstruction._1; // Descend to left child
                                                break;

                                            case consts.ParAlt:
                                                if (parentParInstruction) {
                                                    parentParInstruction = new D(consts.Cons, parentParInstruction, parentParInstruction._2);
                                                }
                                                parentParInstruction = new D(consts.ParAlt, eitherApi.Empty, currentParInstruction._2, eitherApi.Empty);
                                                currentParInstruction = currentParInstruction._1; // Descend to left child
                                                break;

                                            default:
                                                // Found a leaf node (actual Aff computation)
                                                const newFiberId = parAffContext.nextFiberId++;
                                                currentExecutionState = FiberStates.CLEANING; // Transition to handle the leaf
                                                const fiberNode = new D(consts.Forked, newFiberId, new D(consts.Cons, parentParInstruction, null), eitherApi.Empty);
                                                const createdFiber = Fiber(eitherApi, supervisor, currentParInstruction);
                                                createdFiber.onComplete({rethrow: false, handler: handleFiberCompletion(fiberNode)})();
                                                parAffContext.activeFibers[newFiberId] = createdFiber;
                                                if (supervisor) {
                                                    supervisor.register(createdFiber);
                                                }
                                                createdFiber.run(); // Start the fiber
                                                break;
                                        }
                                        break; // End of RUNNING state

                                    case FiberStates.CLEANING:
                                        // This state is for assigning the current leaf fiber to its parent node
                                        if (parentParInstruction === null) {
                                            break; // Done with tree construction
                                        }

                                        if (parentParInstruction._1 === eitherApi.Empty) {
                                            parentParInstruction._1 = fiberNode; // Assign current fiber to left child
                                            currentExecutionState = FiberStates.RUNNING;
                                            currentParInstruction = parentParInstruction._2; // Move to right child
                                            parentParInstruction._2 = eitherApi.Empty; // Clear for next assignment
                                        } else {
                                            parentParInstruction._2 = fiberNode; // Assign current fiber to right child
                                            currentParInstruction = parentParInstruction; // Current node becomes parent
                                            if (parentParInstruction.tag === consts.Cons) { // Pop from stack if it was a stack entry
                                                parentParInstruction = parentParInstruction._1;
                                                currentExecutionState = FiberStates.CLEANING; // Resume building tree upwards
                                            } else {
                                                parentParInstruction = null; // Reached root of current sub-tree
                                            }
                                        }
                                        break;
                                }
                                if (currentParInstruction === null && parentParInstruction === null) break; // All done
                            }

                            // Start all collected fibers
                            for (const fid in parAffContext.activeFibers) {
                                if (parAffContext.activeFibers.hasOwnProperty(fid)) {
                                    parAffContext.activeFibers[fid].run();
                                }
                            }

                            // Return a canceler that kills all child fibers
                            return D_Async(function (cancelError) {
                                return function () {
                                    parAffContext.finalResult = eitherApi.left(cancelError); // Mark as cancelled
                                    const allKillCancelers = killAllChildFibers(cancelError, function () {
                                        // This callback is invoked when all child fibers are killed
                                        // We don't need to do anything here because the main resolver will be called
                                        // by the killAllChildFibers's internal completion.
                                    });
                                    return allKillCancelers;
                                };
                            });
                        };
                    });
                }

                // Supervisor for managing child fibers
                D.Supervisor = function (eitherApi) {
                    let managedFibers = {};
                    let nextFiberKey = 0;
                    let activeFiberCount = 0;

                    return {
                        register: function (fiber) {
                            const key = nextFiberKey++;
                            fiber.onComplete({
                                rethrow: true,
                                handler: () => { // When fiber completes
                                    activeFiberCount--;
                                    delete managedFibers[key];
                                }
                            });
                            managedFibers[key] = fiber;
                            activeFiberCount++;
                        },
                        isEmpty: () => activeFiberCount === 0,
                        killAll: function (error, callback) {
                            return function () {
                                let pendingKills = 0;
                                const killOperations = {};

                                function handleKillComplete(key) {
                                    return function () {
                                        delete killOperations[key];
                                        pendingKills--;
                                        if (eitherApi.isLeft(error) && eitherApi.fromLeft(error)) {
                                            // Log error if any during kill
                                            setTimeout(() => {
                                                throw eitherApi.fromLeft(error);
                                            }, 0);
                                        }
                                        if (pendingKills === 0) {
                                            callback(); // All kills completed
                                        }
                                    };
                                }

                                for (const key in managedFibers) {
                                    if (managedFibers.hasOwnProperty(key)) {
                                        pendingKills++;
                                        killOperations[key] = managedFibers[key].kill(error, handleKillComplete(key))();
                                    }
                                }

                                // Reset supervisor state
                                managedFibers = {};
                                nextFiberKey = 0;
                                activeFiberCount = 0;

                                return D_Sync(function () {
                                    for (const key in killOperations) {
                                        if (killOperations.hasOwnProperty(key)) {
                                            killOperations[key](); // Execute cancelers for kills
                                        }
                                    }
                                    return undefined;
                                });
                            };
                        }
                    };
                };

                D.Scheduler = scheduler;
                D.nonCanceler = D_Pure(undefined); // A non-cancelling Aff

                return {
                    EMPTY: eitherApi.Empty, // Placeholder for empty values in the tree
                    Pure: D_Pure,
                    Throw: D_Throw,
                    Catch: D_Catch,
                    Sync: D_Sync,
                    Async: D_Async,
                    Bind: D_Bind,
                    Bracket: D_Bracket,
                    Fork: D_Fork,
                    Seq: D_Seq,
                    ParMap: D_ParMap,
                    ParApply: D_ParApply,
                    ParAlt: D_ParAlt,
                    Fiber: Fiber,
                    Supervisor: D.Supervisor,
                    Scheduler: scheduler,
                    nonCanceler: D.nonCanceler
                };
            };

            currentNamespace["Effect.Aff"] = currentNamespace["Effect.Aff"] || {};
            const affNs = currentNamespace["Effect.Aff"];
            const affApi = affRuntime();

            affNs._pure = affApi.Pure;
            affNs._map = function (mapperFn) {
                return function (affComp) {
                    if (affComp.tag === affApi.Pure.tag) {
                        return affApi.Pure(mapperFn(affComp._1));
                    }
                    return affApi.Bind(affComp, function (val) {
                        return affApi.Pure(mapperFn(val));
                    });
                };
            };
            affNs._bind = function (affComp) {
                return function (binderFn) {
                    return affApi.Bind(affComp, binderFn);
                };
            };
            affNs._liftEffect = affApi.Sync;
            affNs._parAffMap = function (mapperFn) {
                return function (parAffComp) {
                    return affApi.ParMap(mapperFn, parAffComp);
                };
            };
            affNs._parAffApply = function (parAffFunc) {
                return function (parAffVal) {
                    return affApi.ParApply(parAffFunc, parAffVal);
                };
            };
            affNs.makeAff = affApi.Async;
            affNs._makeFiber = function (eitherApi, affComp) {
                return function () {
                    return affApi.Fiber(eitherApi, null, affComp);
                };
            };
            affNs._sequential = affApi.Seq;
        })(psRuntime);

        // Module: Control.Parallel.Class
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Parallel.Class"] = currentNamespace["Control.Parallel.Class"] || {};
            const parallelClassNs = currentNamespace["Control.Parallel.Class"];

            parallelClassNs.parallel = function (instance) {
                return instance.parallel;
            };
            parallelClassNs.sequential = function (instance) {
                return instance.sequential;
            };
            parallelClassNs.Parallel = function (applicativeInst, monadInst, parallelFn, sequentialFn) {
                this.Applicative1 = applicativeInst;
                this.Monad0 = monadInst;
                this.parallel = parallelFn;
                this.sequential = sequentialFn;
            };
        })(psRuntime);

        // Module: Control.Parallel
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Control.Parallel"] = currentNamespace["Control.Parallel"] || {};
            const parallelNs = currentNamespace["Control.Parallel"];
            const categoryNs = currentNamespace["Control.Category"];
            const parallelClassNs = currentNamespace["Control.Parallel.Class"];

            const parTraverse_ = function (parallelInst) {
                return function (foldableInst) {
                    return function (traverserFn) {
                        return function (collection) {
                            const seqFn = parallelClassNs.sequential(parallelInst);
                            const appInst = parallelInst.Applicative1();
                            // Traverse_ over the foldable, but convert each element to a parallel computation first
                            const mapped = foldableInst.traverse_(appInst)(foldableInst)(element =>
                                parallelClassNs.parallel(parallelInst)(traverserFn(element))
                            )(collection);
                            return seqFn(mapped);
                        };
                    };
                };
            };

            parallelNs.parTraverse_ = parTraverse_;
            parallelNs.parSequence_ = function (parallelInst) {
                return function (collection) {
                    return parTraverse_(parallelInst)(collection)(categoryNs.identity(categoryNs.categoryFn));
                };
            };
        })(psRuntime);

        // Module: Effect.Class
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Class"] = currentNamespace["Effect.Class"] || {};
            const effectClassNs = currentNamespace["Effect.Class"];

            effectClassNs.liftEffect = function (instance) {
                return instance.liftEffect;
            };
            effectClassNs.MonadEffect = function (monadInst, liftEffectFn) {
                this.Monad0 = monadInst;
                this.liftEffect = liftEffectFn;
            };
        })(psRuntime);

        // Module: Partial.Unsafe
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Partial.Unsafe"] = currentNamespace["Partial.Unsafe"] || {}).unsafePartial = function (thunk) {
                return thunk();
            };
        })(psRuntime);

        // Module: Partial
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Partial"] = currentNamespace["Partial"] || {}).crashWith = function () {
                return function (message) {
                    throw new Error(message);
                };
            };
        })(psRuntime);

        // Module: Partial (Redundant re-assignment)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Partial"] = currentNamespace["Partial"] || {};
            const partialNs = currentNamespace["Partial"];
            const partialJs = currentNamespace["Partial"];
            partialNs.crashWith = partialJs.crashWith;
        })(psRuntime);

        // Module: Partial.Unsafe
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Partial.Unsafe"] = currentNamespace["Partial.Unsafe"] || {};
            const partialUnsafeNs = currentNamespace["Partial.Unsafe"];
            const partialUnsafeJs = currentNamespace["Partial.Unsafe"];
            const partialNs = currentNamespace["Partial"];

            partialUnsafeNs.unsafeCrashWith = function (message) {
                return partialUnsafeJs.unsafePartial(function () {
                    return partialNs.crashWith()(message);
                });
            };
        })(psRuntime);

        // Module: Unsafe.Coerce
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Unsafe.Coerce"] = currentNamespace["Unsafe.Coerce"] || {}).unsafeCoerce = function (val) {
                return val;
            };
        })(psRuntime);

        // Module: Unsafe.Coerce (Redundant re-assignment)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Unsafe.Coerce"] = currentNamespace["Unsafe.Coerce"] || {};
            const unsafeCoerceNs = currentNamespace["Unsafe.Coerce"];
            const unsafeCoerceJs = currentNamespace["Unsafe.Coerce"];
            unsafeCoerceNs.unsafeCoerce = unsafeCoerceJs.unsafeCoerce;
        })(psRuntime);

        // Module: Effect.Aff
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Aff"] = currentNamespace["Effect.Aff"] || {};
            const affNs = currentNamespace["Effect.Aff"];
            const affJs = currentNamespace["Effect.Aff"];
            const applicativeNs = currentNamespace["Control.Applicative"];
            const applyNs = currentNamespace["Control.Apply"];
            const bindNs = currentNamespace["Control.Bind"];
            const monadNs = currentNamespace["Control.Monad"];
            const parallelNs = currentNamespace["Control.Parallel"];
            const parallelClassNs = currentNamespace["Control.Parallel.Class"];
            const eitherNs = currentNamespace["Data.Either"];
            const foldableNs = currentNamespace["Data.Foldable"];
            const functionNs = currentNamespace["Data.Function"];
            const functorNs = currentNamespace["Data.Functor"];
            const monoidNs = currentNamespace["Data.Monoid"];
            const semigroupNs = currentNamespace["Data.Semigroup"];
            const unitNs = currentNamespace["Data.Unit"];
            const effectNs = currentNamespace.Effect;
            const effectClassNs = currentNamespace["Effect.Class"];
            const partialUnsafeNs = currentNamespace["Partial.Unsafe"];
            const unsafeCoerceNs = currentNamespace["Unsafe.Coerce"];

            // Functor for ParAff
            const parAffFunctorInst = new functorNs.Functor(affJs._parAffMap);

            // Functor for Aff
            const affFunctorInst = new functorNs.Functor(affJs._map);

            // Either API for Aff runtime
            const affEitherApi = {
                isLeft: (val) => val instanceof eitherNs.Left,
                fromLeft: (val) => {
                    if (val instanceof eitherNs.Left) return val.value0;
                    if (val instanceof eitherNs.Right) return partialUnsafeNs.unsafeCrashWith("unsafeFromLeft: Right");
                    throw new Error("Aff Either API: Invalid value for fromLeft.");
                },
                fromRight: (val) => {
                    if (val instanceof eitherNs.Right) return val.value0;
                    if (val instanceof eitherNs.Left) return partialUnsafeNs.unsafeCrashWith("unsafeFromRight: Left");
                    throw new Error("Aff Either API: Invalid value for fromRight.");
                },
                left: eitherNs.Left.create,
                right: eitherNs.Right.create
            };

            const launchAff = function (affComp) {
                return function () {
                    const fiber = affJs._makeFiber(affEitherApi, affComp)();
                    fiber.run();
                    return fiber;
                };
            };

            // Apply for ParAff
            const parAffApplyInst = new applyNs.Apply(
                () => parAffFunctorInst,
                affJs._parAffApply
            );

            // Monad for Aff
            const affMonadInst = new monadNs.Monad(
                () => affApplicativeInst,
                () => affBindInst
            );

            // Bind for Aff
            const affBindInst = new bindNs.Bind(
                () => affApplyInst,
                affJs._bind
            );

            // Apply for Aff
            const affApplyInst = new applyNs.Apply(
                () => affFunctorInst,
                monadNs.ap(affMonadInst)
            );

            // Applicative for Aff
            const affApplicativeInst = new applicativeNs.Applicative(
                () => affApplyInst,
                affJs._pure
            );

            // MonadEffect for Aff
            const affMonadEffectInst = new effectClassNs.MonadEffect(
                () => affMonadInst,
                affJs._liftEffect
            );

            // Parallel instance for Aff
            const affParallelInst = new parallelClassNs.Parallel(
                () => parAffApplicativeInst,
                () => affMonadInst,
                unsafeCoerceNs.unsafeCoerce, // parallel (Aff a) is ParAff a
                affJs._sequential // sequential (ParAff a) is Aff a
            );

            // Applicative for ParAff
            const parAffApplicativeInst = new applicativeNs.Applicative(
                () => parAffApplyInst,
                function (value) {
                    return parallelClassNs.parallel(affParallelInst)(applicativeNs.pure(affApplicativeInst)(value));
                }
            );

            // Semigroup for Canceler (combines cancelers)
            const cancelerSemigroup = new semigroupNs.Semigroup(function (canceler1) {
                return function (canceler2) {
                    return function (error) {
                        return parallelNs.parSequence_(affParallelInst)(foldableNs.foldableArray)([canceler1(error), canceler2(error)]);
                    };
                };
            });

            // Identity Canceler (does nothing)
            const nonCanceler = functionNs.const(applicativeNs.pure(affApplicativeInst)(unitNs.unit));

            // Monoid for Canceler
            const cancelerMonoid = new monoidNs.Monoid(
                () => cancelerSemigroup,
                nonCanceler
            );

            affNs.launchAff = launchAff;
            affNs.launchAff_ = function (affComp) {
                return functorNs.void(effectNs.functorEffect)(launchAff(affComp));
            };
            affNs.nonCanceler = nonCanceler;
            affNs.functorAff = affFunctorInst;
            affNs.applyAff = affApplyInst;
            affNs.applicativeAff = affApplicativeInst;
            affNs.bindAff = affBindInst;
            affNs.monadAff = affMonadInst;
            affNs.monadEffectAff = affMonadEffectInst;
            affNs.functorParAff = parAffFunctorInst;
            affNs.applyParAff = parAffApplyInst;
            affNs.applicativeParAff = parAffApplicativeInst;
            affNs.parallelAff = affParallelInst;
            affNs.semigroupCanceler = cancelerSemigroup;
            affNs.monoidCanceler = cancelerMonoid;
            affNs.makeAff = affJs.makeAff;
        })(psRuntime);

        // Module: Effect.Ref
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Ref"] = currentNamespace["Effect.Ref"] || {};
            const refJs = currentNamespace["Effect.Ref"];

            refJs.new = function (initialValue) {
                return function () {
                    return {
                        value: initialValue
                    };
                };
            };

            refJs.read = function (ref) {
                return function () {
                    return ref.value;
                };
            };

            refJs.write = function (newValue) {
                return function (ref) {
                    return function () {
                        ref.value = newValue;
                        return {}; // Unit
                    };
                };
            };
        })(psRuntime);

        // Module: Effect.Ref (Redundant re-assignment)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Ref"] = currentNamespace["Effect.Ref"] || {};
            const refNs = currentNamespace["Effect.Ref"];
            const refJs = currentNamespace["Effect.Ref"];
            refNs.new = refJs.new;
            refNs.read = refJs.read;
            refNs.write = refJs.write;
        })(psRuntime);

        // Module: Node.Encoding
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Node.Encoding"] = currentNamespace["Node.Encoding"] || {};
            const encodingNs = currentNamespace["Node.Encoding"];
            const showNs = currentNamespace["Data.Show"];

            // Encoding types (constructors)
            const AsciiEncoding = function () { /* empty */ };
            AsciiEncoding.value = new AsciiEncoding();

            const Utf8Encoding = function () { /* empty */ };
            Utf8Encoding.value = new Utf8Encoding();

            const Utf16leEncoding = function () { /* empty */ };
            Utf16leEncoding.value = new Utf16leEncoding();

            const Ucs2Encoding = function () { /* empty */ };
            Ucs2Encoding.value = new Ucs2Encoding();

            const Base64Encoding = function () { /* empty */ };
            Base64Encoding.value = new Base64Encoding();

            const Latin1Encoding = function () { /* empty */ };
            Latin1Encoding.value = new Latin1Encoding();

            const BinaryEncoding = function () { /* empty */ };
            BinaryEncoding.value = new BinaryEncoding();

            const HexEncoding = function () { /* empty */ };
            HexEncoding.value = new HexEncoding();

            // Show instance for Encoding
            const encodingShowInstance = new showNs.Show(function (encoding) {
                switch (encoding) {
                    case AsciiEncoding.value:
                        return "ASCII";
                    case Utf8Encoding.value:
                        return "UTF8";
                    case Utf16leEncoding.value:
                        return "UTF16LE";
                    case Ucs2Encoding.value:
                        return "UCS2";
                    case Base64Encoding.value:
                        return "Base64";
                    case Latin1Encoding.value:
                        return "Latin1";
                    case BinaryEncoding.value:
                        return "Binary";
                    case HexEncoding.value:
                        return "Hex";
                    default:
                        throw new Error("Node.Encoding Show: Unrecognized encoding type.");
                }
            });

            encodingNs.ASCII = AsciiEncoding;
            encodingNs.UTF8 = Utf8Encoding;
            encodingNs.UTF16LE = Utf16leEncoding;
            encodingNs.UCS2 = Ucs2Encoding;
            encodingNs.Base64 = Base64Encoding;
            encodingNs.Latin1 = Latin1Encoding;
            encodingNs.Binary = BinaryEncoding;
            encodingNs.Hex = HexEncoding;

            encodingNs.encodingToNode = function (encoding) {
                switch (encoding) {
                    case AsciiEncoding.value:
                        return "ascii";
                    case Utf8Encoding.value:
                        return "utf8";
                    case Utf16leEncoding.value:
                        return "utf16le";
                    case Ucs2Encoding.value:
                        return "ucs2";
                    case Base64Encoding.value:
                        return "base64";
                    case Latin1Encoding.value:
                        return "latin1";
                    case BinaryEncoding.value:
                        return "binary";
                    case HexEncoding.value:
                        return "hex";
                    default:
                        throw new Error("Node.Encoding encodingToNode: Unrecognized encoding type.");
                }
            };
            encodingNs.showEncoding = encodingShowInstance;
        })(psRuntime);

        // Module: Node.Process
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Node.Process"] = currentNamespace["Node.Process"] || {}).process = process;
        })(psRuntime);

        // Module: Node.Process
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Node.Process"] = currentNamespace["Node.Process"] || {};
            const processNs = currentNamespace["Node.Process"];
            const processJs = currentNamespace["Node.Process"];
            const nodeProcess = processJs.process;

            processNs.stdin = nodeProcess.stdin;
            processNs.stdout = nodeProcess.stdout;
        })(psRuntime);

        // Module: Node.Stream
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Node.Stream"] = currentNamespace["Node.Stream"] || {};
            const streamJs = currentNamespace["Node.Stream"];

            streamJs.readChunkImpl = function (stringHandler) {
                return function (bufferHandler) {
                    return function (chunk) {
                        if (chunk instanceof Buffer) return bufferHandler(chunk);
                        if (typeof chunk === "string") return stringHandler(chunk);
                        throw new Error("Node.Stream.readChunkImpl: Unrecognized chunk type; expected String or Buffer, got: " + chunk);
                    };
                };
            };

            streamJs.onDataEitherImpl = function (chunkMapper) {
                return function (stream) {
                    return function (callback) {
                        return function () {
                            stream.on("data", function (chunk) {
                                callback(chunkMapper(chunk))();
                            });
                        };
                    };
                };
            };

            streamJs.onEnd = function (stream) {
                return function (callback) {
                    return function () {
                        stream.on("end", callback);
                    };
                };
            };

            streamJs.write = function (stream) {
                return function (data) {
                    return function (cb) {
                        return function () {
                            return stream.write(data, null, cb);
                        };
                    };
                };
            };

            streamJs.writeStringImpl = function (stream) {
                return function (encoding) {
                    return function (str) {
                        return function (cb) {
                            return function () {
                                return stream.write(str, encoding, cb);
                            };
                        };
                    };
                };
            };
        })(psRuntime);

        // Module: Effect.Exception
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Exception"] = currentNamespace["Effect.Exception"] || {};
            const exceptionJs = currentNamespace["Effect.Exception"];

            exceptionJs.error = function (message) {
                return new Error(message);
            };

            exceptionJs.throwException = function (exception) {
                return function () {
                    throw exception;
                };
            };
        })(psRuntime);

        // Module: Effect.Exception (Redundant re-assignment)
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Effect.Exception"] = currentNamespace["Effect.Exception"] || {};
            const exceptionNs = currentNamespace["Effect.Exception"];
            const exceptionJs = currentNamespace["Effect.Exception"];

            exceptionNs.throw = function (message) {
                return exceptionJs.throwException(exceptionJs.error(message));
            };
        })(psRuntime);

        // Module: Node.Buffer
        (function (currentNamespace) {
            "use strict";
            (currentNamespace["Node.Buffer"] = currentNamespace["Node.Buffer"] || {}).toStringImpl = function (encoding) {
                return function (buffer) {
                    return function () {
                        return buffer.toString(encoding);
                    };
                };
            };
        })(psRuntime);

        // Module: Node.Buffer
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Node.Buffer"] = currentNamespace["Node.Buffer"] || {};
            const bufferNs = currentNamespace["Node.Buffer"];
            const bufferJs = currentNamespace["Node.Buffer"];
            const encodingNs = currentNamespace["Node.Encoding"];

            bufferNs.toString = function (encoding) {
                return bufferJs.toStringImpl(encodingNs.encodingToNode(encoding));
            };
        })(psRuntime);

        // Module: Node.Stream
        (function (currentNamespace) {
            "use strict";
            currentNamespace["Node.Stream"] = currentNamespace["Node.Stream"] || {};
            const streamNs = currentNamespace["Node.Stream"];
            const streamJs = currentNamespace["Node.Stream"];
            const applicativeNs = currentNamespace["Control.Applicative"];
            const bindNs = currentNamespace["Control.Bind"];
            const eitherNs = currentNamespace["Data.Either"];
            const showNs = currentNamespace["Data.Show"];
            const effectNs = currentNamespace.Effect;
            const exceptionNs = currentNamespace["Effect.Exception"];
            const bufferNs = currentNamespace["Node.Buffer"];
            const encodingNs = currentNamespace["Node.Encoding"];

            const readChunkEither = streamJs.readChunkImpl(eitherNs.Left.create)(eitherNs.Right.create);

            const onDataEither = function (stream) {
                return function (callback) {
                    return streamJs.onDataEitherImpl(readChunkEither)(stream)(callback);
                };
            };

            const onData = function (stream) {
                return function (callback) {
                    // Helper to unwrap Either and handle errors for stream data
                    const handleEitherChunk = bindNs.composeKleisliFlipped(effectNs.bindEffect)(callback)(function (chunk) {
                        if (chunk instanceof eitherNs.Left) {
                            return exceptionNs.throw("Stream encoding should not be set (received string when expecting buffer)");
                        }
                        if (chunk instanceof eitherNs.Right) {
                            return applicativeNs.pure(effectNs.applicativeEffect)(chunk.value0);
                        }
                        throw new Error("Stream onData: Unrecognized chunk type in Either.");
                    });
                    return onDataEither(stream)(handleEitherChunk);
                };
            };

            streamNs.onData = onData;
            streamNs.onDataString = function (stream) {
                return function (encoding) {
                    return function (callback) {
                        // Compose callback with buffer-to-string conversion
                        const stringConverter = bindNs.composeKleisliFlipped(effectNs.bindEffect)(callback)(bufferNs.toString(encoding));
                        return onData(stream)(stringConverter);
                    };
                };
            };
            streamNs.onDataEither = onDataEither;
            streamNs.writeString = function (stream) {
                return function (encoding) {
                    return streamJs.writeStringImpl(stream)(showNs.show(encodingNs.showEncoding)(encoding));
                };
            };
            streamNs.onEnd = streamJs.onEnd;
        })(psRuntime);

        // Module: ABC100C (Main Application Logic)
        (function (currentNamespace) {
            "use strict";
            currentNamespace.ABC100C = currentNamespace.ABC100C || {};
            const appModule = currentNamespace.ABC100C;

            const appApplicative = currentNamespace["Control.Applicative"];
            const appBind = currentNamespace["Control.Bind"];
            const appCategory = currentNamespace["Control.Category"];
            const appArray = currentNamespace["Data.Array"];
            const appBoolean = currentNamespace["Data.Boolean"];
            const appEither = currentNamespace["Data.Either"];
            const appEuclideanRing = currentNamespace["Data.EuclideanRing"];
            const appFoldable = currentNamespace["Data.Foldable"];
            const appFunctor = currentNamespace["Data.Functor"];
            const appInt = currentNamespace["Data.Int"];
            const appMaybe = currentNamespace["Data.Maybe"];
            const appMonoid = currentNamespace["Data.Monoid"];
            const appShow = currentNamespace["Data.Show"];
            const appString = currentNamespace["Data.String.Common"];
            const appTuple = currentNamespace["Data.Tuple"];
            const appUnit = currentNamespace["Data.Unit"];
            const appEffect = currentNamespace.Effect;
            const appAff = currentNamespace["Effect.Aff"];
            const appEffectClass = currentNamespace["Effect.Class"];
            const appRef = currentNamespace["Effect.Ref"];
            const appNodeEncoding = currentNamespace["Node.Encoding"];
            const appNodeProcess = currentNamespace["Node.Process"];
            const appNodeStream = currentNamespace["Node.Stream"];
            const appPartialUnsafe = currentNamespace["Partial.Unsafe"];

            /**
             * Calculates the total number of times elements in an array can be divided by 2.
             *
             * @param {number} _inputN - The first number (unused in this specific logic, but part of problem spec)
             * @param {Array<number>} numArray - An array of integers.
             * @returns {number} The sum of division counts for each number.
             */
            const calcDivisionsByTwo = function (_inputN) {
                return function (numArray) {
                    return appFoldable.foldl(appFoldable.foldableArray)(0)(numArray)(function (totalCount) {
                        return function (currentNumber) {
                            let divisions = 0;
                            let tempNum = currentNumber;
                            // Count how many times currentNumber is divisible by 2
                            while ((tempNum & 1) === 0 && tempNum !== 0) {
                                divisions++;
                                tempNum = appEuclideanRing.div(appEuclideanRing.euclideanRingInt)(tempNum)(2);
                            }
                            return totalCount + divisions;
                        };
                    });
                };
            };

            /**
             * Parses the input string, applies the core logic, and formats the output.
             *
             * @param {string} inputStr - The raw input string.
             * @returns {Either<string, string>} An Either representing success (Right string) or failure (Left string).
             */
            const processInputData = function (inputStr) {
                const trimmedInput = appString.trim(inputStr);
                const inputLines = appString.split("\n")(trimmedInput);

                if (inputLines.length !== 2) {
                    return appEither.Left.create("Input must contain exactly two lines.");
                }

                const nLine = inputLines[0];
                const aLine = inputLines[1];

                const maybeN = appInt.fromString(nLine);
                const maybeA = appArray.mapMaybe(appInt.fromString)(appString.split(" ")(aLine));

                // Combine parsing results using Maybe bind
                const parsedTupleMaybe = appBind.bind(appMaybe.bindMaybe)(maybeN)(function (nVal) {
                    return appApplicative.pure(appMaybe.applicativeMaybe)(new appTuple.Tuple(nVal, maybeA));
                });

                // Convert Maybe to Either and then bind to calculation
                const resultEither = appEither.note("Failed to parse N or A values.")(parsedTupleMaybe);

                return appBind.bind(appEither.bindEither)(resultEither)(function (dataTuple) {
                    const N = dataTuple.value0;
                    const A_values = dataTuple.value1;

                    // Ensure A_values is an array (it should be from mapMaybe)
                    if (!Array.isArray(A_values)) {
                        return appEither.Left.create("Parsed A values is not an array.");
                    }

                    const finalCount = calcDivisionsByTwo(N)(A_values);
                    const formattedOutput = appShow.show(appShow.showInt)(finalCount) + "\n";
                    return appApplicative.pure(appEither.applicativeEither)(formattedOutput);
                });
            };

            /**
             * Reads all input from stdin and returns it as a single string.
             * This is an Aff computation.
             */
            const readInputFromStream = appAff.makeAff(function (affCallback) {
                return function () {
                    // Create a mutable reference to accumulate input
                    const inputRef = appRef.new("")();

                    // Set up data listener for stdin
                    appNodeStream.onDataString(appNodeProcess.stdin)(appNodeEncoding.UTF8.value)(function (chunk) {
                        return function () {
                            const currentContent = appRef.read(inputRef)();
                            appRef.write(currentContent + chunk)(inputRef)();
                            // Optional: console.log for debugging input chunks
                            // console.log("Received chunk:", chunk.length, "bytes");
                        };
                    })().value; // .value to run the Effect

                    // Set up end listener for stdin
                    appNodeStream.onEnd(appNodeProcess.stdin)(function () {
                        const finalContent = appRef.read(inputRef)();
                        // Resolve the Aff computation with the accumulated input
                        affCallback(appApplicative.pure(appEither.applicativeEither)(finalContent))();
                    })().value; // .value to run the Effect

                    console.log("Starting input stream read...");

                    // Return a non-canceler, as stdin is not typically cancellable in this context
                    return appMonoid.mempty(appAff.monoidCanceler);
                };
            });

            /**
             * Main application entry point, orchestrates reading input, processing, and writing output.
             * This is an Aff computation launched as an Effect.
             */
            const initApplication = appAff.launchAff_(
                appBind.bind(appAff.bindAff)(readInputFromStream)(function (rawInput) {
                    // Check if rawInput is a Left (error during stream read)
                    if (appEither.isLeft(rawInput)) {
                        return appAff.Throw(appEither.fromLeft(rawInput));
                    }
                    const finalInputString = appEither.fromRight(rawInput);

                    // Process the input string
                    const processedResult = processInputData(finalInputString);

                    // Bind the processed result to an Effect for writing to stdout
                    return appBind.bind(appAff.bindAff)(appApplicative.pure(appAff.applicativeAff)(processedResult))(function (outputEither) {
                        let outputResult;
                        if (appEither.isLeft(outputEither)) {
                            // If processing failed, crash with the error message
                            appPartialUnsafe.unsafeCrashWith(appEither.fromLeft(outputEither));
                        } else {
                            outputResult = appEither.fromRight(outputEither);
                        }

                        // Lift the Effect of writing to stdout into Aff
                        return appEffectClass.liftEffect(appAff.monadEffectAff)(
                            appFunctor.void(appEffect.functorEffect)(
                                appNodeStream.writeString(appNodeProcess.stdout)(appNodeEncoding.UTF8.value)(outputResult)(
                                    appApplicative.pure(appEffect.applicativeEffect)(appUnit.unit) // Callback for write completion
                                )
                            )
                        );
                    });
                })
            );

            // Export main entry point
            appModule.main = initApplication;
            appModule.solve = processInputData; // Export for testing/reuse

            // Run the main application logic
            psRuntime.ABC100C.main();
        })(psRuntime);
    }, {}],
}, {}, ["Focm"], null);