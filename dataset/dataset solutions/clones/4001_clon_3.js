customModuleLoader=function(moduleDefinitions, loadedModulesCache, entryPoints, globalExportName){
    var firstErrorOccurred = null;
    var externalParcelLoader = ("function" === typeof customModuleLoader && customModuleLoader);
    var nodejsRequireLoader = ("function" === typeof require && require);

    function loadAndCacheModule(moduleId, isExternalCall){
        if (loadedModulesCache[moduleId]){
            return loadedModulesCache[moduleId].exports;
        }

        if (!moduleDefinitions[moduleId]){
            var currentLoaderInstance = ("function" === typeof customModuleLoader && customModuleLoader);
            if (!isExternalCall && currentLoaderInstance) return currentLoaderInstance(moduleId, true);
            if (externalParcelLoader) return externalParcelLoader(moduleId, true);
            if (nodejsRequireLoader && "string" === typeof moduleId) return nodejsRequireLoader(moduleId);

            var moduleNotFoundError = new Error("Cannot locate module: '" + moduleId + "'");
            moduleNotFoundError.code = "MODULE_NOT_FOUND";
            throw moduleNotFoundError;
        }

        moduleLocalRequire.resolve = function(dependencyPath){
            return moduleDefinitions[moduleId][1][dependencyPath] || dependencyPath;
        };
        moduleLocalRequire.cache = {};

        var newModuleInstance = loadedModulesCache[moduleId] = new loadAndCacheModule.Module(moduleId);
        moduleDefinitions[moduleId][0].call(
            newModuleInstance.exports,
            moduleLocalRequire,
            newModuleInstance,
            newModuleInstance.exports,
            this
        );
        return loadedModulesCache[moduleId].exports;

        function moduleLocalRequire(dependencyIdentifier){
            return loadAndCacheModule(moduleLocalRequire.resolve(dependencyIdentifier));
        }
    }

    loadAndCacheModule.isCustomLoader = true;
    loadAndCacheModule.Module = function(idValue){
        this.id = idValue;
        this.bundle = loadAndCacheModule;
        this.exports = {};
    };

    loadAndCacheModule.modules = moduleDefinitions;
    loadAndCacheModule.cache = loadedModulesCache;
    loadAndCacheModule.parent = externalParcelLoader;
    loadAndCacheModule.register = function(registerId, registeredContent){
        moduleDefinitions[registerId] = [
            function(modReq, modInst){ modInst.exports = registeredContent; },
            {}
        ];
    };

    var currentEntryPointIndex = 0;
    while (currentEntryPointIndex < entryPoints.length) {
        try {
            loadAndCacheModule(entryPoints[currentEntryPointIndex]);
        } catch (loadError) {
            if (!firstErrorOccurred) {
                firstErrorOccurred = loadError;
            }
        }
        currentEntryPointIndex++;
    }

    if (entryPoints.length > 0){
        var finalExportedValue = loadAndCacheModule(entryPoints[entryPoints.length - 1]);
        if ("object" === typeof exports && "undefined" !== typeof module){
            module.exports = finalExportedValue;
        } else if ("function" === typeof define && define.amd){
            define(function(){ return finalExportedValue; });
        } else if (globalExportName){
            this[globalExportName] = finalExportedValue;
        }
    }

    customModuleLoader = loadAndCacheModule;

    if (firstErrorOccurred) throw firstErrorOccurred;

    return loadAndCacheModule;
}({
    "Focm":[function(require,module,exports) {
        // This is the main entry point for the bundled application logic.
        // It initializes various PureScript runtime modules and finally runs the main application.
        (function(runtimeEnv) {
            "use strict";

            // Initialize the main application namespace.
            runtimeEnv.SimpleDivApp = runtimeEnv.SimpleDivApp || {};

            // =================================================================================================
            // PureScript Runtime Modules - Renamed and slightly refactored for Type III clone
            // =================================================================================================

            // Module: Control.Semigroupoid
            // Provides the Semigroupoid type class, which defines composition.
            (function(env) {
                "use strict";
                env["Control.Semigroupoid"] = env["Control.Semigroupoid"] || {};
                var sgm = env["Control.Semigroupoid"];

                // The constructor for Semigroupoid instances.
                var SemigroupoidConstructor = function(composeMethod) {
                    this.compose = composeMethod;
                };

                // An instance for functions, defining function composition.
                var functionSemigroupoidInstance = new SemigroupoidConstructor(function(func1) {
                    return function(func2) {
                        return function(value) {
                            return func1(func2(value));
                        };
                    };
                });

                // Expose the 'compose' function and the Semigroupoid type.
                sgm.compose = function(instance) {
                    return instance.compose;
                };
                sgm.Semigroupoid = SemigroupoidConstructor;
                sgm.semigroupoidFn = functionSemigroupoidInstance;
            })(env);

            // Module: Control.Category
            // Provides the Category type class, which extends Semigroupoid with an identity element.
            (function(env) {
                "use strict";
                env["Control.Category"] = env["Control.Category"] || {};
                var cat = env["Control.Category"];
                var sgm = env["Control.Semigroupoid"];

                // The constructor for Category instances.
                var CategoryConstructor = function(semigroupoidBase, identityFunction) {
                    this.Semigroupoid0 = semigroupoidBase; // Reference to the parent Semigroupoid instance.
                    this.identity = identityFunction;
                };

                // An instance for functions, providing the identity function.
                var functionCategoryInstance = new CategoryConstructor(
                    function() {
                        return sgm.semigroupoidFn;
                    },
                    function(val) {
                        return val;
                    }
                );

                // Expose the 'Category' type and 'identity' function.
                cat.Category = CategoryConstructor;
                cat.identity = function(instance) {
                    return instance.identity;
                };
                cat.categoryFn = functionCategoryInstance;
            })(env);

            // Module: Data.Function
            // Provides utility functions for working with functions.
            (function(env) {
                "use strict";
                env["Data.Function"] = env["Data.Function"] || {};
                var fnUtil = env["Data.Function"];

                // Flips the arguments of a binary function.
                fnUtil.flip = function(originalFn) {
                    return function(arg2) {
                        return function(arg1) {
                            return originalFn(arg1)(arg2);
                        };
                    };
                };

                // A constant function that always returns its first argument.
                fnUtil.const = function(constantValue) {
                    return function(anyValue) {
                        return constantValue;
                    };
                };
            })(env);

            // Module: Data.Unit
            // Defines the Unit type, which has only one value (unit).
            (function(env) {
                "use strict";
                // Initialize the Data.Unit namespace if it doesn't exist.
                env["Data.Unit"] = env["Data.Unit"] || {};
                // The singleton unit value.
                var uniqueUnitValue = {};
                env["Data.Unit"].unit = uniqueUnitValue;
            })(env);

            // Module: Data.Functor
            // Provides the Functor type class, defining 'map' over a structure.
            (function(env) {
                "use strict";
                env["Data.Functor"] = env["Data.Functor"] || {};
                var fct = env["Data.Functor"];
                var fnUtil = env["Data.Function"];
                var unitMod = env["Data.Unit"];

                // The constructor for Functor instances.
                var FunctorConstructor = function(mapFn) {
                    this.map = mapFn;
                };

                // Helper to get the 'map' function from a Functor instance.
                var getMap = function(instance) {
                    return instance.map;
                };

                // Expose the Functor type and map function.
                fct.Functor = FunctorConstructor;
                fct.map = getMap;

                // 'void' function: maps a Functor to a Functor of Unit.
                fct.void = function(functorInstance) {
                    return getMap(functorInstance)(fnUtil.const(unitMod.unit));
                };
            })(env);

            // Module: Control.Apply
            // Provides the Apply type class, extending Functor with 'apply' (sequential application).
            (function(env) {
                "use strict";
                env["Control.Apply"] = env["Control.Apply"] || {};
                var app = env["Control.Apply"];
                var cat = env["Control.Category"];
                var fnUtil = env["Data.Function"];
                var fct = env["Data.Functor"];

                // Helper to get the 'apply' function from an Apply instance.
                var getApply = function(instance) {
                    return instance.apply;
                };

                // The constructor for Apply instances.
                var ApplyConstructor = function(functorBase, applyFn) {
                    this.Functor0 = functorBase; // Reference to the parent Functor instance.
                    this.apply = applyFn;
                };

                // Expose the Apply type and apply function.
                app.Apply = ApplyConstructor;
                app.apply = getApply;

                // 'applySecond' function: applies two applicative actions, discarding the first result.
                app.applySecond = function(applyInstance) {
                    return function(action1) {
                        return function(action2) {
                            // Apply the 'apply' function.
                            // The first action's result is discarded using 'const' and 'identity'.
                            var identityConst = fnUtil.const(cat.identity(cat.categoryFn));
                            var mappedIdentity = fct.map(applyInstance.Functor0())(identityConst)(action1);
                            return getApply(applyInstance)(mappedIdentity)(action2);
                        };
                    };
                };
            })(env);

            // Module: Control.Applicative
            // Provides the Applicative type class, extending Apply with 'pure' (lifting a value).
            (function(env) {
                "use strict";
                env["Control.Applicative"] = env["Control.Applicative"] || {};
                var app = env["Control.Applicative"];
                var applyMod = env["Control.Apply"];

                // Helper to get the 'pure' function from an Applicative instance.
                var getPure = function(instance) {
                    return instance.pure;
                };

                // The constructor for Applicative instances.
                var ApplicativeConstructor = function(applyBase, pureFn) {
                    this.Apply0 = applyBase; // Reference to the parent Apply instance.
                    this.pure = pureFn;
                };

                // Expose the Applicative type and pure function.
                app.Applicative = ApplicativeConstructor;
                app.pure = getPure;

                // 'liftA1' function: lifts a unary function into an Applicative context.
                app.liftA1 = function(applicativeInstance) {
                    return function(unaryFn) {
                        return function(applicativeValue) {
                            // Apply the lifted function to the lifted value.
                            var liftedFn = getPure(applicativeInstance)(unaryFn);
                            return applyMod.apply(applicativeInstance.Apply0())(liftedFn)(applicativeValue);
                        };
                    };
                };
            })(env);

            // Module: Control.Bind
            // Provides the Bind type class, defining 'bind' (sequential composition of monadic actions).
            (function(env) {
                "use strict";
                env["Control.Bind"] = env["Control.Bind"] || {};
                var bindMod = env["Control.Bind"];
                var fnUtil = env["Data.Function"];

                // Helper to get the 'bind' function from a Bind instance.
                var getBind = function(instance) {
                    return instance.bind;
                };

                // The constructor for Bind instances.
                var BindConstructor = function(applyBase, bindFn) {
                    this.Apply0 = applyBase; // Reference to the parent Apply instance.
                    this.bind = bindFn;
                };

                // Expose the Bind type and bind function.
                bindMod.Bind = BindConstructor;
                bindMod.bind = getBind;

                // 'bindFlipped' function: a flipped version of bind.
                bindMod.bindFlipped = function(bindInstance) {
                    return fnUtil.flip(getBind(bindInstance));
                };

                // 'composeKleisliFlipped' function: composes two Kleisli arrows (functions returning monadic values).
                bindMod.composeKleisliFlipped = function(bindInstance) {
                    return function(func1) {
                        return function(func2) {
                            return function(inputVal) {
                                return bindMod.bindFlipped(bindInstance)(func1)(func2(inputVal));
                            };
                        };
                    };
                };
            })(env);

            // Module: Data.Maybe
            // Provides the Maybe type, representing an optional value (Just or Nothing).
            (function(env) {
                "use strict";
                env["Data.Maybe"] = env["Data.Maybe"] || {};
                var maybeMod = env["Data.Maybe"];

                // Nothing constructor (singleton object).
                var NothingConstructor = (function() {
                    function NothingImpl() {}
                    NothingImpl.value = new NothingImpl(); // Singleton instance.
                    return NothingImpl;
                })();

                // Just constructor (wraps a value).
                var JustConstructor = (function() {
                    function JustImpl(val) {
                        this.value0 = val;
                    }
                    JustImpl.create = function(val) {
                        return new JustImpl(val);
                    };
                    return JustImpl;
                })();

                // Expose constructors.
                maybeMod.Nothing = NothingConstructor;
                maybeMod.Just = JustConstructor;

                // 'maybe' function: dispatches based on whether a Maybe value is Just or Nothing.
                maybeMod.maybe = function(defaultValue) {
                    return function(justHandler) {
                        return function(maybeValue) {
                            if (maybeValue instanceof NothingConstructor) {
                                return defaultValue;
                            }
                            if (maybeValue instanceof JustConstructor) {
                                return justHandler(maybeValue.value0);
                            }
                            // Error handling for unexpected types.
                            var errorMsg = "Pattern match failure at Data.Maybe (expected Nothing or Just): ";
                            throw new Error(errorMsg + [
                                defaultValue.constructor.name,
                                justHandler.constructor.name,
                                maybeValue.constructor.name
                            ].join(", "));
                        };
                    };
                };
            })(env);

            // Module: Data.Either
            // Provides the Either type, representing a value that can be one of two types (Left or Right).
            (function(env) {
                "use strict";
                env["Data.Either"] = env["Data.Either"] || {};
                var eitherMod = env["Data.Either"];
                var applicativeMod = env["Control.Applicative"];
                var applyMod = env["Control.Apply"];
                var bindMod = env["Control.Bind"];
                var functorMod = env["Data.Functor"];
                var maybeMod = env["Data.Maybe"];

                // Left constructor (wraps an error value).
                var LeftConstructor = (function() {
                    function LeftImpl(val) {
                        this.value0 = val;
                    }
                    LeftImpl.create = function(val) {
                        return new LeftImpl(val);
                    };
                    return LeftImpl;
                })();

                // Right constructor (wraps a success value).
                var RightConstructor = (function() {
                    function RightImpl(val) {
                        this.value0 = val;
                    }
                    RightImpl.create = function(val) {
                        return new RightImpl(val);
                    };
                    return RightImpl;
                })();

                // Functor instance for Either.
                // `map` only applies the function if the value is Right.
                var eitherFunctorInstance = new functorMod.Functor(function(transformFn) {
                    return function(eitherVal) {
                        if (eitherVal instanceof LeftConstructor) {
                            return new LeftConstructor(eitherVal.value0); // Left values are unchanged.
                        }
                        if (eitherVal instanceof RightConstructor) {
                            return new RightConstructor(transformFn(eitherVal.value0)); // Apply func to Right value.
                        }
                        throw new Error("Pattern match failure at Data.Either.functorEither: " + eitherVal.constructor.name);
                    };
                });

                // 'either' function: dispatches based on Left or Right.
                var handleEither = function(leftHandler) {
                    return function(rightHandler) {
                        return function(eitherVal) {
                            if (eitherVal instanceof LeftConstructor) {
                                return leftHandler(eitherVal.value0);
                            }
                            if (eitherVal instanceof RightConstructor) {
                                return rightHandler(eitherVal.value0);
                            }
                            var errorMsg = "Pattern match failure at Data.Either.either (expected Left or Right): ";
                            throw new Error(errorMsg + [
                                leftHandler.constructor.name,
                                rightHandler.constructor.name,
                                eitherVal.constructor.name
                            ].join(", "));
                        };
                    };
                };

                // Apply instance for Either.
                // `apply` combines two Eithers, propagating the first Left error.
                var eitherApplyInstance = new applyMod.Apply(
                    function() {
                        return eitherFunctorInstance;
                    },
                    function(eitherFn) {
                        return function(eitherVal) {
                            if (eitherFn instanceof LeftConstructor) {
                                return new LeftConstructor(eitherFn.value0);
                            }
                            if (eitherFn instanceof RightConstructor) {
                                // Map the function inside the Right to the value inside the other Either.
                                return functorMod.map(eitherFunctorInstance)(eitherFn.value0)(eitherVal);
                            }
                            throw new Error("Pattern match failure at Data.Either.applyEither: " + eitherFn.constructor.name);
                        };
                    }
                );

                // Bind instance for Either.
                // `bind` chains operations, propagating Left errors.
                var eitherBindInstance = new bindMod.Bind(
                    function() {
                        return eitherApplyInstance;
                    },
                    handleEither(function(leftVal) {
                        return function(rightFn) {
                            return new LeftConstructor(leftVal); // Propagate Left error.
                        };
                    })(function(rightVal) {
                        return function(rightFn) {
                            return rightFn(rightVal); // Continue with the function if Right.
                        };
                    })
                );

                // Applicative instance for Either.
                // `pure` lifts a value into a Right context.
                var eitherApplicativeInstance = new applicativeMod.Applicative(
                    function() {
                        return eitherApplyInstance;
                    },
                    RightConstructor.create
                );

                // Expose types and instances.
                eitherMod.Left = LeftConstructor;
                eitherMod.Right = RightConstructor;
                eitherMod.either = handleEither;

                // 'note' function: converts a Maybe to an Either. Nothing becomes Left, Just becomes Right.
                eitherMod.note = function(leftValue) {
                    return maybeMod.maybe(new LeftConstructor(leftValue))(RightConstructor.create);
                };

                eitherMod.functorEither = eitherFunctorInstance;
                eitherMod.applyEither = eitherApplyInstance;
                eitherMod.applicativeEither = eitherApplicativeInstance;
                eitherMod.bindEither = eitherBindInstance;
            })(env);

            // Module: Data.EuclideanRing (Native implementations)
            // Provides native JavaScript implementations for Euclidean ring operations.
            (function(env) {
                "use strict";
                env["Data.EuclideanRing"] = env["Data.EuclideanRing"] || {};
                var erNative = env["Data.EuclideanRing"];

                // Calculates the degree of an integer (absolute value clamped to MAX_INT).
                erNative.intDegree = function(num) {
                    return Math.min(Math.abs(num), 2147483647); // Max signed 32-bit integer.
                };

                // Integer division. Handles positive and negative divisors.
                erNative.intDiv = function(dividend) {
                    return function(divisor) {
                        if (divisor === 0) {
                            return 0; // Division by zero returns 0 as per PureScript's behavior.
                        }
                        if (divisor > 0) {
                            return Math.floor(dividend / divisor);
                        }
                        // For negative divisor, negate both and then negate result for correct floor.
                        return -Math.floor(dividend / (-divisor));
                    };
                };

                // Integer modulo. Ensures result has the same sign as the divisor.
                erNative.intMod = function(dividend) {
                    return function(divisor) {
                        if (divisor === 0) {
                            return 0; // Modulo by zero returns 0.
                        }
                        var absoluteDivisor = Math.abs(divisor);
                        var intermediateResult = dividend % absoluteDivisor;
                        return (intermediateResult + absoluteDivisor) % absoluteDivisor;
                    };
                };
            })(env);

            // Module: Data.Ring (Native implementations)
            // Provides native JavaScript implementation for integer subtraction.
            (function(env) {
                "use strict";
                env["Data.Ring"] = env["Data.Ring"] || {};
                var ringNative = env["Data.Ring"];

                // Integer subtraction. Uses bitwise OR 0 for 32-bit integer conversion.
                ringNative.intSub = function(operand1) {
                    return function(operand2) {
                        return (operand1 - operand2) | 0;
                    };
                };
            })(env);

            // Module: Data.Semiring (Native implementations)
            // Provides native JavaScript implementations for integer addition and multiplication.
            (function(env) {
                "use strict";
                env["Data.Semiring"] = env["Data.Semiring"] || {};
                var semiringNative = env["Data.Semiring"];

                // Integer addition. Uses bitwise OR 0 for 32-bit integer conversion.
                semiringNative.intAdd = function(operand1) {
                    return function(operand2) {
                        return (operand1 + operand2) | 0;
                    };
                };

                // Integer multiplication. Uses bitwise OR 0 for 32-bit integer conversion.
                semiringNative.intMul = function(operand1) {
                    return function(operand2) {
                        return (operand1 * operand2) | 0;
                    };
                };
            })(env);

            // Module: Data.Semiring
            // Defines the Semiring type class and provides an instance for integers.
            (function(env) {
                "use strict";
                env["Data.Semiring"] = env["Data.Semiring"] || {};
                var sr = env["Data.Semiring"];
                var srNative = env["Data.Semiring"]; // Native implementations.

                // Constructor for Semiring instances.
                var SemiringConstructor = function(addFn, mulFn, oneVal, zeroVal) {
                    this.add = addFn;
                    this.mul = mulFn;
                    this.one = oneVal;
                    this.zero = zeroVal;
                };

                // Integer Semiring instance using native integer operations.
                var intSemiringInstance = new SemiringConstructor(
                    srNative.intAdd,
                    srNative.intMul,
                    1, // Multiplicative identity.
                    0  // Additive identity.
                );

                // Expose the Semiring type and its functions.
                sr.Semiring = SemiringConstructor;
                sr.add = function(instance) {
                    return instance.add;
                };
                sr.zero = function(instance) {
                    return instance.zero;
                };
                sr.mul = function(instance) {
                    return instance.mul;
                };
                sr.one = function(instance) {
                    return instance.one;
                };
                sr.semiringInt = intSemiringInstance;
            })(env);

            // Module: Data.Ring
            // Defines the Ring type class and provides an instance for integers.
            (function(env) {
                "use strict";
                env["Data.Ring"] = env["Data.Ring"] || {};
                var ring = env["Data.Ring"];
                var ringNative = env["Data.Ring"]; // Native subtraction.
                var semiringMod = env["Data.Semiring"];

                // Constructor for Ring instances.
                var RingConstructor = function(semiringBase, subFn) {
                    this.Semiring0 = semiringBase; // Reference to parent Semiring instance.
                    this.sub = subFn;
                };

                // Integer Ring instance.
                var intRingInstance = new RingConstructor(
                    function() {
                        return semiringMod.semiringInt;
                    },
                    ringNative.intSub
                );

                // Expose the Ring type and its 'sub' function.
                ring.Ring = RingConstructor;
                ring.sub = function(instance) {
                    return instance.sub;
                };
                ring.ringInt = intRingInstance;
            })(env);

            // Module: Data.CommutativeRing
            // Defines the CommutativeRing type class and provides an instance for integers.
            (function(env) {
                "use strict";
                env["Data.CommutativeRing"] = env["Data.CommutativeRing"] || {};
                var cr = env["Data.CommutativeRing"];
                var ringMod = env["Data.Ring"];

                // Constructor for CommutativeRing instances.
                var CommutativeRingConstructor = function(ringBase) {
                    this.Ring0 = ringBase; // Reference to parent Ring instance.
                };

                // Integer CommutativeRing instance.
                var intCommutativeRingInstance = new CommutativeRingConstructor(
                    function() {
                        return ringMod.ringInt;
                    }
                );

                // Expose the CommutativeRing type and its integer instance.
                cr.CommutativeRing = CommutativeRingConstructor;
                cr.commutativeRingInt = intCommutativeRingInstance;
            })(env);

            // Module: Data.EuclideanRing
            // Defines the EuclideanRing type class and provides an instance for integers.
            (function(env) {
                "use strict";
                env["Data.EuclideanRing"] = env["Data.EuclideanRing"] || {};
                var er = env["Data.EuclideanRing"];
                var erNative = env["Data.EuclideanRing"]; // Native implementations.
                var crMod = env["Data.CommutativeRing"];

                // Constructor for EuclideanRing instances.
                var EuclideanRingConstructor = function(commutativeRingBase, degreeFn, divFn, modFn) {
                    this.CommutativeRing0 = commutativeRingBase; // Reference to parent CommutativeRing instance.
                    this.degree = degreeFn;
                    this.div = divFn;
                    this.mod = modFn;
                };

                // Integer EuclideanRing instance.
                var intEuclideanRingInstance = new EuclideanRingConstructor(
                    function() {
                        return crMod.commutativeRingInt;
                    },
                    erNative.intDegree,
                    erNative.intDiv,
                    erNative.intMod
                );

                // Expose the EuclideanRing type and its functions.
                er.EuclideanRing = EuclideanRingConstructor;
                er.degree = function(instance) {
                    return instance.degree;
                };
                er.div = function(instance) {
                    return instance.div;
                };
                er.mod = function(instance) {
                    return instance.mod;
                };
                er.euclideanRingInt = intEuclideanRingInstance;
            })(env);

            // Module: Data.Int (Native implementations)
            // Provides native JavaScript implementations for integer parsing.
            (function(env) {
                "use strict";
                env["Data.Int"] = env["Data.Int"] || {};
                var intNative = env["Data.Int"];

                // Helper for parsing strings as integers with a given radix.
                // It returns a function that takes a 'Just' constructor, a 'Nothing' value, and the radix.
                intNative.fromStringAsImpl = function(justCreator) {
                    return function(nothingValue) {
                        return function(radixValue) {
                            return function(inputString) {
                                // Construct a regex for validation based on the radix.
                                var charRange;
                                if (radixValue < 11) {
                                    charRange = "[0-" + (radixValue - 1).toString() + "]";
                                } else if (radixValue === 11) {
                                    charRange = "[0-9a]";
                                } else {
                                    charRange = "[0-9a-" + String.fromCharCode(86 + radixValue) + "]";
                                }

                                // Regex to validate the format (optional sign, then digits/letters for the radix).
                                var validationRegex = new RegExp("^[\\+\\-]?" + charRange + "+$", "i");

                                // Perform validation and parsing.
                                if (validationRegex.test(inputString)) {
                                    var parsedNumber = parseInt(inputString, radixValue);
                                    // Check if the parsed number is a valid 32-bit integer.
                                    if ((parsedNumber | 0) === parsedNumber) {
                                        return justCreator(parsedNumber); // Wrap in Just if valid.
                                    }
                                    return nothingValue; // If not a 32-bit int, return Nothing.
                                }
                                return nothingValue; // If regex validation fails, return Nothing.
                            };
                        };
                    };
                };
            })(env);

            // Module: Data.Int
            // Provides integer parsing functions.
            (function(env) {
                "use strict";
                env["Data.Int"] = env["Data.Int"] || {};
                var intMod = env["Data.Int"];
                var intNative = env["Data.Int"];
                var maybeMod = env["Data.Maybe"];

                // The core parsing implementation using Just and Nothing.
                var parseIntegerBase = intNative.fromStringAsImpl(maybeMod.Just.create)(maybeMod.Nothing.value);

                // Pre-configured parser for base 10 integers.
                var parseDecimalInt = parseIntegerBase(10);

                // Expose the parsing functions.
                intMod.fromString = parseDecimalInt;
                intMod.fromStringAs = parseIntegerBase;
            })(env);

            // Module: Data.Monoid
            // Defines the Monoid type class.
            (function(env) {
                "use strict";
                env["Data.Monoid"] = env["Data.Monoid"] || {};
                var monoidMod = env["Data.Monoid"];

                // Monoid constructor.
                var MonoidConstructor = function(semigroupBase, memptyValue) {
                    this.Semigroup0 = semigroupBase; // Reference to parent Semigroup instance.
                    this.mempty = memptyValue;
                };

                // Expose the Monoid type and 'mempty' function.
                monoidMod.Monoid = MonoidConstructor;
                monoidMod.mempty = function(instance) {
                    return instance.mempty;
                };
            })(env);

            // Module: Data.Show (Native implementations)
            // Provides native JavaScript implementation for showing integers.
            (function(env) {
                "use strict";
                env["Data.Show"] = env["Data.Show"] || {};
                var showNative = env["Data.Show"];

                // Converts an integer to its string representation.
                showNative.showIntImpl = function(num) {
                    return num.toString();
                };
            })(env);

            // Module: Data.Show
            // Defines the Show type class and provides an instance for integers.
            (function(env) {
                "use strict";
                env["Data.Show"] = env["Data.Show"] || {};
                var showMod = env["Data.Show"];
                var showNative = env["Data.Show"]; // Native show implementation.

                // Show constructor.
                var ShowConstructor = function(showFn) {
                    this.show = showFn;
                };

                // Integer Show instance.
                var intShowInstance = new ShowConstructor(showNative.showIntImpl);

                // Expose the Show type and 'show' function.
                showMod.Show = ShowConstructor;
                showMod.show = function(instance) {
                    return instance.show;
                };
                showMod.showInt = intShowInstance;
            })(env);

            // Module: Data.String.Common (Native implementations)
            // Provides native JavaScript string utility functions.
            (function(env) {
                "use strict";
                env["Data.String.Common"] = env["Data.String.Common"] || {};
                var strNative = env["Data.String.Common"];

                // Splits a string by a given separator.
                strNative.split = function(separator) {
                    return function(targetString) {
                        return targetString.split(separator);
                    };
                };

                // Trims whitespace from both ends of a string.
                strNative.trim = function(targetString) {
                    return targetString.trim();
                };
            })(env);

            // Module: Data.String.Common
            // Re-exports native string utility functions.
            (function(env) {
                "use strict";
                env["Data.String.Common"] = env["Data.String.Common"] || {};
                var strCommon = env["Data.String.Common"];
                var strNative = env["Data.String.Common"]; // Native implementations.

                strCommon.split = strNative.split;
                strCommon.trim = strNative.trim;
            })(env);

            // Module: Effect (Native implementations)
            // Provides native JavaScript implementations for basic Effect operations.
            (function(effectNs) {
                "use strict";
                effectNs.Effect = effectNs.Effect || {};
                var effectNative = effectNs.Effect;

                // Lifts a pure value into the Effect monad.
                effectNative.pureE = function(value) {
                    return function() {
                        return value;
                    };
                };

                // Binds an Effect action to a continuation function.
                effectNative.bindE = function(effectAction) {
                    return function(continuationFn) {
                        return function() {
                            return continuationFn(effectAction())();
                        };
                    };
                };
            })(env);

            // Module: Control.Monad
            // Defines the Monad type class.
            (function(env) {
                "use strict";
                env["Control.Monad"] = env["Control.Monad"] || {};
                var monadMod = env["Control.Monad"];
                var applicativeMod = env["Control.Applicative"];
                var bindMod = env["Control.Bind"];

                // Monad constructor.
                var MonadConstructor = function(applicativeBase, bindBase) {
                    this.Applicative0 = applicativeBase; // Reference to parent Applicative instance.
                    this.Bind1 = bindBase; // Reference to parent Bind instance.
                };

                // 'ap' (apply) for Monad: sequentially applies a monadic function to a monadic value.
                monadMod.ap = function(monadInstance) {
                    return function(monadicFn) {
                        return function(monadicValue) {
                            return bindMod.bind(monadInstance.Bind1())(monadicFn)(function(resolvedFn) {
                                return bindMod.bind(monadInstance.Bind1())(monadicValue)(function(resolvedVal) {
                                    return applicativeMod.pure(monadInstance.Applicative0())(resolvedFn(resolvedVal));
                                });
                            });
                        };
                    };
                };

                monadMod.Monad = MonadConstructor;
            })(env);

            // Module: Effect
            // Provides instances for Functor, Apply, Applicative, Bind, and Monad for the Effect type.
            (function(env) {
                "use strict";
                env.Effect = env.Effect || {};
                var effectMod = env.Effect;
                var effectNative = env.Effect; // Native implementations.
                var applicativeMod = env["Control.Applicative"];
                var applyMod = env["Control.Apply"];
                var bindMod = env["Control.Bind"];
                var monadMod = env["Control.Monad"];
                var functorMod = env["Data.Functor"];

                // Monad instance for Effect.
                var effectMonadInstance = new monadMod.Monad(
                    function() {
                        return effectApplicativeInstance;
                    },
                    function() {
                        return effectBindInstance;
                    }
                );

                // Bind instance for Effect.
                var effectBindInstance = new bindMod.Bind(
                    function() {
                        return effectApplyInstance;
                    },
                    effectNative.bindE
                );

                // Apply instance for Effect.
                var effectApplyInstance = new applyMod.Apply(
                    function() {
                        return effectFunctorInstance;
                    },
                    monadMod.ap(effectMonadInstance)
                );

                // Applicative instance for Effect.
                var effectApplicativeInstance = new applicativeMod.Applicative(
                    function() {
                        return effectApplyInstance;
                    },
                    effectNative.pureE
                );

                // Functor instance for Effect.
                var effectFunctorInstance = new functorMod.Functor(
                    applicativeMod.liftA1(effectApplicativeInstance)
                );

                // Expose all instances.
                effectMod.functorEffect = effectFunctorInstance;
                effectMod.applyEffect = effectApplyInstance;
                effectMod.applicativeEffect = effectApplicativeInstance;
                effectMod.bindEffect = effectBindInstance;
                effectMod.monadEffect = effectMonadInstance;
            })(env);

            // Module: Effect.Aff
            // This is the core Asynchronous Effect Monad.
            // It is a complex module providing a robust way to handle asynchronous computations with cancellation.
            (function(env) {
                "use strict";
                env["Effect.Aff"] = env["Effect.Aff"] || {};
                var affMod = env["Effect.Aff"];
                var affNative = env["Effect.Aff"]; // Native implementations.

                var applicativeMod = env["Control.Applicative"];
                var applyMod = env["Control.Apply"];
                var bindMod = env["Control.Bind"];
                var monadMod = env["Control.Monad"];
                var parallelMod = env["Control.Parallel"];
                var parallelClassMod = env["Control.Parallel.Class"];
                var eitherMod = env["Data.Either"];
                var foldableMod = env["Data.Foldable"];
                var functionMod = env["Data.Function"];
                var functorMod = env["Data.Functor"];
                var monoidMod = env["Data.Monoid"];
                var semigroupMod = env["Data.Semigroup"];
                var unitMod = env["Data.Unit"];
                var effectMod = env.Effect;
                var effectClassMod = env["Effect.Class"];
                var unsafePartialMod = env["Partial.Unsafe"];
                var unsafeCoerceMod = env["Unsafe.Coerce"];

                // =================================================================================================
                // Internal Types and Constructors for Aff
                // =================================================================================================

                var AffInternal = (function() {
                    var tagPure = "Pure",
                        tagThrow = "Throw",
                        tagCatch = "Catch",
                        tagSync = "Sync",
                        tagAsync = "Async",
                        tagBind = "Bind",
                        tagBracket = "Bracket",
                        tagFork = "Fork",
                        tagSequential = "Sequential",
                        tagParMap = "Map",
                        tagParApply = "Apply",
                        tagParAlt = "Alt",
                        tagCons = "Cons",
                        tagResume = "Resume",
                        tagRelease = "Release",
                        tagFinalizer = "Finalizer",
                        tagFinalized = "Finalized",
                        tagForked = "Forked";

                    // A generic constructor for internal Aff data types.
                    // It uses a tag string to identify the type and holds up to 3 values.
                    function InternalAffType(tagString, val1, val2, val3) {
                        this.tag = tagString;
                        this._1 = val1;
                        this._2 = val2;
                        this._3 = val3;
                    }

                    // Factory function for creating tagged types with 1 value.
                    function createTaggedType1(tagString) {
                        var constructorFn = function(val) {
                            return new InternalAffType(tagString, val);
                        };
                        constructorFn.tag = tagString; // Store tag on the function itself for easy access.
                        return constructorFn;
                    }

                    // Factory function for creating the 'Pure' type (no value).
                    function createPureType() {
                        return new InternalAffType(tagPure, undefined);
                    }

                    // =================================================================================================
                    // Scheduler (for draining effects)
                    // =================================================================================================

                    var TaskScheduler = (function() {
                        var queueCapacity = 1024;
                        var currentQueueSize = 0;
                        var queueReadPtr = 0;
                        var taskQueue = new Array(queueCapacity);
                        var isCurrentlyDraining = false;

                        function drainQueue() {
                            isCurrentlyDraining = true;
                            while (currentQueueSize !== 0) {
                                currentQueueSize--;
                                var taskToExecute = taskQueue[queueReadPtr];
                                taskQueue[queueReadPtr] = undefined; // Clear reference for garbage collection.
                                queueReadPtr = (queueReadPtr + 1) % queueCapacity;
                                taskToExecute();
                            }
                            isCurrentlyDraining = false;
                        }

                        return {
                            isDraining: function() {
                                return isCurrentlyDraining;
                            },
                            enqueue: function(task) {
                                // If queue is full, drain it first (preserving draining status).
                                if (currentQueueSize === queueCapacity) {
                                    var previousDrainingStatus = isCurrentlyDraining;
                                    drainQueue();
                                    isCurrentlyDraining = previousDrainingStatus; // Restore previous status.
                                }
                                taskQueue[(queueReadPtr + currentQueueSize) % queueCapacity] = task;
                                currentQueueSize++;
                                // If not currently draining, start draining.
                                if (!isCurrentlyDraining) {
                                    drainQueue();
                                }
                            }
                        };
                    })();

                    // =================================================================================================
                    // Exception Handling Utilities
                    // =================================================================================================

                    // Executes a thunk, catching synchronous exceptions and calling a handler.
                    function runSyncAndCatch(errorHandler, successHandler, thunk) {
                        try {
                            return successHandler(thunk());
                        } catch (err) {
                            return errorHandler(err);
                        }
                    }

                    // Executes a thunk, catching synchronous exceptions and calling a handler.
                    // If the handler itself throws, it is caught and passed to another function.
                    function runSyncAndCatchWithCleanup(errorHandler, successHandler, mainThunk, cleanupThunk) {
                        try {
                            return successHandler(mainThunk());
                        } catch (err) {
                            try {
                                cleanupThunk(errorHandler(err)); // Pass caught error to cleanup.
                            } catch (cleanupErr) {
                                // If cleanup also throws, log it or handle it.
                                // For this clone, we'll just rethrow the original error after cleanup.
                                setTimeout(function() {
                                    throw cleanupErr;
                                }, 0);
                            }
                            return InternalAffType.Pure(undefined); // Return a dummy Pure for type compatibility.
                        }
                    }

                    // Schedule an uncaught exception to be thrown asynchronously.
                    function scheduleUncaughtException(exception) {
                        setTimeout(function() {
                            throw exception;
                        }, 0);
                    }

                    // =================================================================================================
                    // Fiber Implementation (The core Aff runtime)
                    // =================================================================================================

                    // States for the Fiber's internal state machine.
                    var STATE_INITIAL = 0;
                    var STATE_RUNNING = 1;
                    var STATE_PAUSED_ASYNC = 2;
                    var STATE_CANCELED = 3; // Not directly used in original but conceptually present.
                    var STATE_FINALIZED = 4;
                    var STATE_COMPLETED = 5;
                    var STATE_ERROR = 6;

                    /**
                     * The Fiber represents a running Aff computation.
                     * It manages its own state, stack, and error handling.
                     * @param {object} eitherLike - An object with `isLeft`, `fromLeft`, `fromRight`, `left`, `right` methods.
                     * @param {object|null} supervisor - An optional supervisor to register with.
                     * @param {Aff} initialAff - The Aff computation to run.
                     * @returns {object} A Fiber instance.
                     */
                    function Fiber(eitherLike, supervisor, initialAff) {
                        var currentStackId = 0; // Unique ID for current stack frame to prevent race conditions.
                        var fiberState = STATE_INITIAL;
                        var currentAff = initialAff;
                        var currentResult = null; // Stores the result (Either Left or Right) upon completion.
                        var continuationStack = null; // Stack of continuations to apply.
                        var cancelerStack = null; // Stack of cancelers for Bracket/Catch.
                        var supervisorStack = null; // Stack of supervisor contexts.
                        var bracketDepth = 0; // Tracks nested Bracket calls.
                        var pendingCanceler = null; // Stores a pending canceler from a Forked Aff.
                        var registeredHandlers = null; // Handlers registered via onComplete.
                        var rethrowUncaught = true; // Flag to rethrow uncaught errors by default.

                        // Main loop for executing the Aff computation.
                        function executeFiber(stackId) {
                            var currentAffValue; // Local variable for current Aff.
                            var currentContinuation; // Local variable for current continuation.
                            var currentSupervisor; // Local variable for current supervisor.
                            var currentBracket; // Local variable for current bracket.
                            var currentCanceler; // Local variable for current canceler.
                            var nextAffToProcess; // Variable for next Aff in sequence.

                            loop:
                                for (;;) {
                                    currentAffValue = null;
                                    currentContinuation = null;
                                    currentSupervisor = null;
                                    currentBracket = null;
                                    currentCanceler = null;

                                    switch (fiberState) {
                                        case STATE_PAUSED_ASYNC:
                                            // Fiber is suspended, waiting for an async callback.
                                            // Nothing to do in the loop, return.
                                            return;

                                        case STATE_FINALIZED:
                                            // Transition from a finalizer being run.
                                            fiberState = STATE_COMPLETED; // Transition to completed state.
                                            currentResult = currentBracket._2(eitherLike.fromRight(currentResult)); // Apply value to bracket.
                                            // Fallthrough to STATE_COMPLETED to handle the bracket.

                                        case STATE_COMPLETED:
                                            // The computation has finished (successfully or with error).
                                            // If there's a continuation, apply it.
                                            if (continuationStack) {
                                                currentContinuation = continuationStack._1;
                                                continuationStack = continuationStack._2;
                                                fiberState = STATE_RUNNING;
                                                currentAff = currentContinuation(currentResult); // Apply continuation to result.
                                            } else {
                                                // No more continuations, so this fiber is truly done.
                                                fiberState = STATE_ERROR; // Use STATE_ERROR as a final state for error propagation/handling.
                                            }
                                            break;

                                        case STATE_ERROR:
                                            // An error occurred and needs to be propagated or handled.
                                            continuationStack = null; // Clear continuations.
                                            supervisorStack = null; // Clear supervisor stack.

                                            // If there's a canceler stack, unwind it.
                                            if (cancelerStack) {
                                                currentBracket = cancelerStack._1;
                                                cancelerStack = cancelerStack._2;

                                                // If it's a Catch block, attempt to handle the error.
                                                if (currentBracket.tag === tagCatch) {
                                                    if (currentSupervisor && currentSupervisor !== currentBracket._3 && bracketDepth === 0) {
                                                        // If there's a supervisor and it's not the same as the bracket's, don't handle.
                                                        // This condition is tricky and depends on how supervisors interact with Catch.
                                                        // For now, let's assume it means the error is not for this Catch.
                                                    } else if (currentResult) {
                                                        // Error is present, try to handle it.
                                                        fiberState = STATE_RUNNING;
                                                        currentAff = currentBracket._2(eitherLike.fromLeft(currentResult));
                                                        currentResult = null; // Clear the error after handling.
                                                    }
                                                }
                                            } else {
                                                // No more cancelers, the error is unhandled.
                                                fiberState = STATE_ERROR; // Stay in error state to signal final error.
                                                currentAff = currentSupervisor || currentResult; // The final error or result.
                                            }
                                            break;

                                        case STATE_RUNNING:
                                            // The main processing state.
                                            switch (currentAff.tag) {
                                                case tagBind:
                                                    // Push current continuation onto stack and process the bound Aff.
                                                    if (continuationStack) {
                                                        supervisorStack = new InternalAffType(tagCons, continuationStack, supervisorStack);
                                                    }
                                                    continuationStack = currentAff._2;
                                                    fiberState = STATE_RUNNING;
                                                    currentAff = currentAff._1;
                                                    break;

                                                case tagPure:
                                                    // A pure value. If there's a continuation, apply it.
                                                    if (continuationStack) {
                                                        fiberState = STATE_COMPLETED;
                                                        currentResult = eitherLike.right(currentAff._1);
                                                    } else {
                                                        // No continuations, this is the final result.
                                                        fiberState = STATE_ERROR; // Transition to error state for final result handling.
                                                        currentResult = eitherLike.right(currentAff._1);
                                                    }
                                                    break;

                                                case tagSync:
                                                    // Synchronous effect. Run it and wrap result in Either.
                                                    fiberState = STATE_COMPLETED;
                                                    currentResult = runSyncAndCatch(eitherLike.left, eitherLike.right, currentAff._1);
                                                    break;

                                                case tagAsync:
                                                    // Asynchronous effect. Suspend the fiber and wait for callback.
                                                    fiberState = STATE_PAUSED_ASYNC;
                                                    var asyncCallback = runSyncAndCatch(
                                                        eitherLike.left,
                                                        currentAff._1,
                                                        function() {
                                                            // This thunk provides the actual async operation.
                                                            return function(asyncResult) {
                                                                return function() {
                                                                    // Only proceed if this is still the active stack.
                                                                    if (currentStackId === stackId) {
                                                                        currentStackId++; // Invalidate previous stack ID.
                                                                        fiberState = STATE_COMPLETED;
                                                                        currentResult = asyncResult;
                                                                        // Schedule the fiber to resume on the scheduler.
                                                                        TaskScheduler.enqueue(function() {
                                                                            executeFiber(currentStackId);
                                                                        });
                                                                    }
                                                                };
                                                            };
                                                        }
                                                    );
                                                    // If asyncCallback returned a canceler, store it.
                                                    if (asyncCallback && typeof asyncCallback === 'object' && asyncCallback.tag === tagAsync) { // Check if it's an async result directly.
                                                        pendingCanceler = asyncCallback; // This is a bit of a hack to store the canceler.
                                                    }
                                                    return; // Suspend execution.

                                                case tagThrow:
                                                    // An explicit error throw.
                                                    fiberState = STATE_ERROR;
                                                    currentResult = eitherLike.left(currentAff._1);
                                                    break;

                                                case tagCatch:
                                                    // Start a Catch block. Push to canceler stack.
                                                    cancelerStack = new InternalAffType(tagCons, currentAff, cancelerStack, currentSupervisor);
                                                    fiberState = STATE_RUNNING;
                                                    currentAff = currentAff._1;
                                                    break;

                                                case tagBracket:
                                                    // Start a Bracket block. Push to canceler stack and increment depth.
                                                    bracketDepth++;
                                                    cancelerStack = new InternalAffType(tagCons, currentAff, cancelerStack, currentSupervisor);
                                                    fiberState = STATE_RUNNING;
                                                    currentAff = currentAff._1;
                                                    break;

                                                case tagFork:
                                                    // Fork a new fiber.
                                                    fiberState = STATE_COMPLETED;
                                                    var newFiber = Fiber(eitherLike, supervisor, currentAff._2);
                                                    if (supervisor) {
                                                        supervisor.register(newFiber);
                                                    }
                                                    // If the forked fiber needs to run immediately, run it.
                                                    if (currentAff._1) {
                                                        newFiber.run();
                                                    }
                                                    currentResult = eitherLike.right(newFiber);
                                                    break;

                                                case tagSequential:
                                                    // Process a sequential composition of Affs.
                                                    fiberState = STATE_RUNNING;
                                                    currentAff = runSequentialAffs(eitherLike, supervisor, currentAff._1);
                                                    break;

                                                default:
                                                    // Should not happen for valid Aff types.
                                                    throw new Error("Unknown Aff type encountered: " + currentAff.tag);
                                            }
                                            break;

                                        case STATE_INITIAL:
                                            // Initial state, transition to running.
                                            fiberState = STATE_RUNNING;
                                            break;

                                        default:
                                            // Should not reach here.
                                            throw new Error("Invalid fiber state: " + fiberState);
                                    }

                                    // After processing a step, check for pending errors or results.
                                    if (fiberState === STATE_ERROR) {
                                        // If an error or final result is present, process registered handlers.
                                        for (var handlerId in registeredHandlers) {
                                            if (registeredHandlers.hasOwnProperty(handlerId)) {
                                                rethrowUncaught = rethrowUncaught && registeredHandlers[handlerId].rethrow;
                                                // Execute the handler with the final result/error.
                                                // Schedule it to prevent blocking the main loop.
                                                scheduleUncaughtException(registeredHandlers[handlerId].handler(currentAff));
                                            }
                                        }
                                        registeredHandlers = null; // Clear handlers after execution.

                                        // If an error occurred and it's still marked for rethrow, throw it.
                                        if (currentResult && eitherLike.isLeft(currentResult) && rethrowUncaught) {
                                            scheduleUncaughtException(eitherLike.fromLeft(currentResult));
                                        }
                                        return; // Fiber execution ends here.
                                    }
                                }
                        }

                        // Helper to run a list of Aff computations sequentially.
                        function runSequentialAffs(eitherLikeImpl, supervisorImpl, affList) {
                            // This is a simplified placeholder. In a full runtime, this would involve
                            // binding each Aff in sequence. For the given code, it's mostly a pass-through.
                            // The original code implies that Seq takes an array of Aff and applies them.
                            // This is a simplification, as actual sequential execution is handled by Bind.
                            // If affList is a single Aff, it just returns it.
                            return affList;
                        }

                        // Registers a completion handler for the fiber.
                        function registerCompletionHandler(handlerOptions) {
                            return function() {
                                // If the fiber has already completed, execute handler immediately.
                                if (fiberState === STATE_ERROR || fiberState === STATE_COMPLETED) {
                                    rethrowUncaught = rethrowUncaught && handlerOptions.rethrow;
                                    handlerOptions.handler(currentResult)();
                                    return function() {}; // Return a no-op deregister.
                                }
                                // Otherwise, add to registered handlers.
                                var handlerId = Date.now() + Math.random(); // Unique ID for handler.
                                registeredHandlers = registeredHandlers || {};
                                registeredHandlers[handlerId] = handlerOptions;

                                return function() {
                                    // Deregister function.
                                    if (registeredHandlers) {
                                        delete registeredHandlers[handlerId];
                                    }
                                };
                            };
                        }

                        return {
                            // Kills the fiber with a specific error.
                            kill: function(killError, callback) {
                                return function() {
                                    // If already finalized, callback immediately.
                                    if (fiberState === STATE_ERROR || fiberState === STATE_FINALIZED) {
                                        return callback(eitherLike.right(unitMod.unit))();
                                    }

                                    var deregister = registerCompletionHandler({
                                        rethrow: false,
                                        handler: function() {
                                            return callback(eitherLike.right(unitMod.unit));
                                        }
                                    })();

                                    // Set the fiber state to canceled and store the kill error.
                                    if (fiberState === STATE_INITIAL) {
                                        currentResult = eitherLike.left(killError);
                                        fiberState = STATE_ERROR;
                                        executeFiber(currentStackId); // Run to finalize.
                                    } else if (fiberState === STATE_PAUSED_ASYNC) {
                                        // If async, store pending kill and trigger canceler if possible.
                                        if (!currentResult) {
                                            currentResult = eitherLike.left(killError);
                                        }
                                        if (bracketDepth === 0) {
                                            if (fiberState === STATE_PAUSED_ASYNC && pendingCanceler) {
                                                cancelerStack = new InternalAffType(tagCons, new InternalAffType(tagFinalizer, pendingCanceler(killError)), cancelerStack);
                                            }
                                            fiberState = STATE_ERROR;
                                            currentAff = null;
                                            currentResult = null;
                                            executeFiber(++currentStackId);
                                        }
                                    } else {
                                        // For other running states, store pending kill.
                                        if (!currentResult) {
                                            currentResult = eitherLike.left(killError);
                                        }
                                        if (bracketDepth === 0) {
                                            fiberState = STATE_ERROR;
                                            currentAff = null;
                                            currentResult = null;
                                        }
                                    }
                                    return deregister;
                                };
                            },
                            // Joins the fiber, waiting for its completion.
                            join: function(completionHandler) {
                                return function() {
                                    var deregister = registerCompletionHandler({
                                        rethrow: false,
                                        handler: completionHandler
                                    })();
                                    if (fiberState === STATE_INITIAL) {
                                        executeFiber(currentStackId);
                                    }
                                    return deregister;
                                };
                            },
                            onComplete: registerCompletionHandler,
                            isSuspended: function() {
                                return fiberState === STATE_INITIAL;
                            },
                            run: function() {
                                if (fiberState === STATE_INITIAL) {
                                    if (TaskScheduler.isDraining()) {
                                        executeFiber(currentStackId);
                                    } else {
                                        TaskScheduler.enqueue(function() {
                                            executeFiber(currentStackId);
                                        });
                                    }
                                }
                            }
                        };
                    }

                    // =================================================================================================
                    // Parallel Aff (ParAff) Implementation
                    // =================================================================================================

                    /**
                     * Handles parallel composition of Aff computations.
                     * This function is complex and manages a graph of parallel dependencies.
                     * @param {object} eitherLike - An object with `isLeft`, `fromLeft`, `fromRight`, `left`, `right` methods.
                     * @param {object|null} supervisor - An optional supervisor to register with.
                     * @param {Aff} parAffComputation - The ParAff computation to run.
                     * @param {Function} callback - The callback to invoke with the final result.
                     */
                    function handleParAff(eitherLike, supervisor, parAffComputation, callback) {
                        var fiberCounter = 0; // Counts active fibers in this parallel block.
                        var activeFibers = {}; // Map of fiber IDs to Fiber instances.
                        var listenerCounter = 0; // Counts active listeners for result propagation.
                        var resultListeners = {}; // Map of listener IDs to cleanup functions.
                        var earlyExitError = new Error("[ParAff] Early exit due to error in parallel computation.");
                        var finalResult = null; // Stores the final result (error or success).
                        var rootParAffNode = parAffComputation; // The root of the ParAff graph.

                        // Helper to clean up listeners for a fiber.
                        function cleanupFiberListeners(errorValue, targetNode, listenerStack) {
                            var currentListener;
                            var currentStack = listenerStack;
                            var listenerMap = {}; // Local map to hold cleanup functions.
                            var count = 0;

                            // Traverse the listener stack and collect cleanup functions.
                            while (currentStack) {
                                currentListener = currentStack.current; // Assuming 'current' is the node.
                                if (currentListener.tag === tagForked && currentListener._3 === eitherLike.right(undefined)) {
                                    // If it's a forked fiber and not yet resolved, kill it.
                                    var fiberToKill = activeFibers[currentListener._1];
                                    if (fiberToKill) {
                                        listenerMap[count++] = fiberToKill.kill(errorValue, function(killResult) {
                                            return function() {
                                                // This callback is invoked when the kill completes.
                                                if (eitherLike.isLeft(killResult)) {
                                                    scheduleUncaughtException(eitherLike.fromLeft(killResult));
                                                }
                                                count--;
                                                if (count === 0) {
                                                    callback(eitherLike.right(unitMod.unit))(); // All kills done.
                                                }
                                            };
                                        });
                                    }
                                }
                                // Move to the next listener in the stack.
                                currentStack = currentStack.next;
                            }

                            if (count === 0) {
                                callback(eitherLike.right(unitMod.unit))();
                            } else {
                                // Execute all collected cleanup functions.
                                for (var i = 0; i < count; i++) {
                                    listenerMap[i] = listenerMap[i]();
                                }
                            }
                            return listenerMap;
                        }

                        // Callback function for when a forked fiber completes.
                        function onFiberCompletion(fiberInstance) {
                            return function(fiberResult) {
                                return function() {
                                    // Deregister the fiber from the active set.
                                    delete activeFibers[fiberInstance._1];
                                    fiberInstance._3 = fiberResult; // Store the result on the ParAff node.

                                    // Recursively update the ParAff graph with the new result.
                                    // This part is the most complex, as it needs to propagate results
                                    // and trigger subsequent computations in the ParAff graph.
                                    (function propagateResult(currentResult, currentNode, parentStack) {
                                        var leftValue, rightValue;
                                        if (eitherLike.isLeft(currentResult)) {
                                            leftValue = currentResult;
                                            rightValue = null;
                                        } else {
                                            rightValue = currentResult;
                                            leftValue = null;
                                        }

                                        // Loop to traverse the ParAff graph.
                                        for (;;) {
                                            var nodeLeftChild, nodeRightChild, stackNext;
                                            if (finalResult) {
                                                return; // If a final error already occurred, stop propagation.
                                            }

                                            // If no current node, we're done propagating this path.
                                            if (!currentNode) {
                                                return callback(leftValue || rightValue)();
                                            }

                                            // If this node is already resolved, skip.
                                            if (currentNode._3 === eitherLike.right(undefined)) { // Check if not yet resolved.
                                                switch (currentNode.tag) {
                                                    case tagParMap:
                                                        // If it's a ParMap, and we have a result, apply the map function.
                                                        if (!leftValue) {
                                                            currentNode._3 = eitherLike.right(currentNode._1(eitherLike.fromRight(rightValue)));
                                                            rightValue = currentNode._3;
                                                        } else {
                                                            currentNode._3 = leftValue;
                                                        }
                                                        break;

                                                    case tagParApply:
                                                        nodeLeftChild = currentNode._1._3; // Result of the function Aff.
                                                        nodeRightChild = currentNode._2._3; // Result of the argument Aff.

                                                        if (leftValue) {
                                                            // If an error occurred, mark this node with the error.
                                                            currentNode._3 = leftValue;
                                                            // This is a critical point: if an error happens in one branch of ParApply,
                                                            // we need to kill the other branch if it's still running.
                                                            if (nodeLeftChild === eitherLike.right(undefined) || nodeRightChild === eitherLike.right(undefined)) {
                                                                var isPropagatingError = true;
                                                                var cleanupId = listenerCounter++;
                                                                resultListeners[cleanupId] = cleanupFiberListeners(earlyExitError,
                                                                    leftValue === nodeRightChild ? currentNode._1 : currentNode._2,
                                                                    new InternalAffType(tagCons, currentNode, parentStack));
                                                                if (isPropagatingError) {
                                                                    return; // Suspend propagation, cleanup will continue.
                                                                }
                                                            }
                                                        } else {
                                                            // If no error, and both children are resolved, apply the function.
                                                            if (nodeLeftChild !== eitherLike.right(undefined) && nodeRightChild !== eitherLike.right(undefined)) {
                                                                rightValue = eitherLike.right(eitherLike.fromRight(nodeLeftChild)(eitherLike.fromRight(nodeRightChild)));
                                                                currentNode._3 = rightValue;
                                                            } else {
                                                                // If one child is still pending, can't resolve yet.
                                                                return;
                                                            }
                                                        }
                                                        break;

                                                    case tagParAlt:
                                                        nodeLeftChild = currentNode._1._3;
                                                        nodeRightChild = currentNode._2._3;

                                                        // If both children are errors, combine them (or pick one).
                                                        if (nodeLeftChild !== eitherLike.right(undefined) && eitherLike.isLeft(nodeLeftChild) &&
                                                            nodeRightChild !== eitherLike.right(undefined) && eitherLike.isLeft(nodeRightChild)) {
                                                            // The original code picks the rightmost error if both are left.
                                                            leftValue = rightValue === nodeLeftChild ? nodeRightChild : nodeLeftChild;
                                                            rightValue = null;
                                                            currentNode._3 = leftValue;
                                                        } else if (currentNode._3 === eitherLike.right(undefined)) {
                                                            // If not both errors, and this node is still pending,
                                                            // and we have a new result, propagate it.
                                                            var isPropagating = true;
                                                            var cleanupId = listenerCounter++;
                                                            resultListeners[cleanupId] = cleanupFiberListeners(earlyExitError,
                                                                rightValue === nodeLeftChild ? currentNode._2 : currentNode._1,
                                                                new InternalAffType(tagCons, currentNode, parentStack));
                                                            if (isPropagating) {
                                                                return; // Suspend propagation, cleanup will continue.
                                                            }
                                                        }
                                                        break;
                                                }
                                            }
                                            // Move up the parent stack.
                                            if (!parentStack) {
                                                currentNode = null;
                                            } else {
                                                currentNode = parentStack._1;
                                                parentStack = parentStack._2;
                                            }
                                        }
                                    })(fiberResult, fiberInstance._2._1, fiberInstance._2._2);
                                };
                            };
                        }

                        // The main function to initiate the parallel computation.
                        return function() {
                            var currentProcessNode, currentParentNode, currentParentStack;
                            var traversalState = STATE_RUNNING; // Use states for traversal.

                            // Loop for traversing the ParAff graph and starting fibers.
                            for (;;) {
                                currentProcessNode = null;
                                currentParentNode = null;
                                currentParentStack = null;

                                switch (traversalState) {
                                    case STATE_RUNNING:
                                        switch (parAffComputation.tag) {
                                            case tagParMap:
                                                // Push current node to parent stack and move to child.
                                                if (currentParentNode) {
                                                    currentParentStack = new InternalAffType(tagCons, currentParentNode, currentParentStack);
                                                }
                                                currentParentNode = new InternalAffType(tagParMap, parAffComputation._1, eitherLike.right(undefined), eitherLike.right(undefined));
                                                parAffComputation = parAffComputation._2;
                                                break;

                                            case tagParApply:
                                                // Push current node to parent stack and move to left child.
                                                if (currentParentNode) {
                                                    currentParentStack = new InternalAffType(tagCons, currentParentNode, currentParentStack);
                                                }
                                                currentParentNode = new InternalAffType(tagParApply, eitherLike.right(undefined), parAffComputation._2, eitherLike.right(undefined));
                                                parAffComputation = parAffComputation._1;
                                                break;

                                            case tagParAlt:
                                                // Push current node to parent stack and move to left child.
                                                if (currentParentNode) {
                                                    currentParentStack = new InternalAffType(tagCons, currentParentNode, currentParentStack);
                                                }
                                                currentParentNode = new InternalAffType(tagParAlt, eitherLike.right(undefined), parAffComputation._2, eitherLike.right(undefined));
                                                parAffComputation = parAffComputation._1;
                                                break;

                                            default:
                                                // If it's a base Aff (not a Par combinator), fork a fiber.
                                                var newFiberId = fiberCounter++;
                                                traversalState = STATE_COMPLETED;
                                                currentProcessNode = parAffComputation;
                                                parAffComputation = new InternalAffType(tagForked, newFiberId,
                                                    new InternalAffType(tagCons, currentParentNode, currentParentStack), eitherLike.right(undefined));

                                                var fiberInstance = Fiber(eitherLike, supervisor, currentProcessNode);
                                                fiberInstance.onComplete({
                                                    rethrow: false,
                                                    handler: onFiberCompletion(parAffComputation)
                                                })();
                                                activeFibers[newFiberId] = fiberInstance;
                                                if (supervisor) {
                                                    supervisor.register(fiberInstance);
                                                }
                                        }
                                        break;

                                    case STATE_COMPLETED:
                                        // After processing a child, move back up the tree or to the other child.
                                        if (!currentParentNode) {
                                            // If no parent, we're done with this branch.
                                            break; // Exit loop.
                                        }
                                        if (currentParentNode._1 === eitherLike.right(undefined)) {
                                            // If left child was just processed, assign it and move to right child (if ParApply/Alt).
                                            currentParentNode._1 = parAffComputation;
                                            traversalState = STATE_RUNNING;
                                            parAffComputation = currentParentNode._2; // Next is the right child.
                                            currentParentNode._2 = eitherLike.right(undefined); // Clear for next traversal.
                                        } else {
                                            // Both children processed (or single child for ParMap).
                                            currentParentNode._2 = parAffComputation; // Assign right child (or final child for ParMap).
                                            parAffComputation = currentParentNode; // Current node becomes the result for its parent.
                                            // Pop from parent stack.
                                            if (!currentParentStack) {
                                                currentParentNode = null;
                                            } else {
                                                currentParentNode = currentParentStack._1;
                                                currentParentStack = currentParentStack._2;
                                            }
                                        }
                                        break;
                                }
                            }

                            rootParAffNode = parAffComputation; // Store the final transformed ParAff graph.

                            // Run all forked fibers.
                            for (var fiberKey in activeFibers) {
                                if (activeFibers.hasOwnProperty(fiberKey)) {
                                    activeFibers[fiberKey].run();
                                }
                            }

                            // Returns a canceler for the entire parallel block.
                            return function(cancelError) {
                                return new InternalAffType(tagAsync, function(cancelCallback) {
                                    return function() {
                                        // If a final error already exists, immediately return unit.
                                        if (finalResult) {
                                            return function() {
                                                return new InternalAffType(tagPure, unitMod.unit);
                                            };
                                        }
                                        finalResult = eitherLike.left(cancelError); // Mark as canceled.

                                        // Cleanup all active fibers and listeners.
                                        var cleanupFns = cleanupFiberListeners(cancelError, rootParAffNode, cancelCallback);
                                        return function(cleanupCancel) {
                                            return new InternalAffType(tagAsync, function(cleanupCb) {
                                                return function() {
                                                    // Execute all cleanup functions from the parallel block.
                                                    for (var fnKey in cleanupFns) {
                                                        if (cleanupFns.hasOwnProperty(fnKey)) {
                                                            cleanupFns[fnKey](); // Call the actual cancelers.
                                                        }
                                                    }
                                                    return new InternalAffType(tagPure, unitMod.unit);
                                                };
                                            });
                                        };
                                    };
                                });
                            };
                        };
                    }

                    // =================================================================================================
                    // Supervisor Implementation
                    // =================================================================================================

                    /**
                     * A Supervisor manages a collection of Fibers, allowing for bulk operations like killing all.
                     * @param {object} eitherLike - An object with `isLeft`, `fromLeft`, `fromRight`, `left`, `right` methods.
                     * @returns {object} A Supervisor instance.
                     */
                    function Supervisor(eitherLike) {
                        var supervisedFibers = {};
                        var nextFiberId = 0;
                        var activeFiberCount = 0;

                        return {
                            // Registers a fiber with the supervisor.
                            register: function(fiberInstance) {
                                var currentFiberId = nextFiberId++;
                                fiberInstance.onComplete({
                                    rethrow: true, // Supervised fibers rethrow by default.
                                    handler: function(result) {
                                        return function() {
                                            activeFiberCount--;
                                            delete supervisedFibers[currentFiberId];
                                            // If the fiber completed with an error, log it.
                                            if (eitherLike.isLeft(result)) {
                                                scheduleUncaughtException(eitherLike.fromLeft(result));
                                            }
                                        };
                                    }
                                });
                                supervisedFibers[currentFiberId] = fiberInstance;
                                activeFiberCount++;
                            },
                            isEmpty: function() {
                                return activeFiberCount === 0;
                            },
                            // Kills all supervised fibers.
                            killAll: function(killReason, completionCallback) {
                                return function() {
                                    if (activeFiberCount === 0) {
                                        return completionCallback();
                                    }

                                    var pendingKills = 0;
                                    var killCancelers = {}; // Stores the cancelers returned by kill.

                                    // Helper to perform individual fiber kill.
                                    function performFiberKill(fiberKey) {
                                        killCancelers[fiberKey] = supervisedFibers[fiberKey].kill(killReason, function(killResult) {
                                            return function() {
                                                delete killCancelers[fiberKey];
                                                pendingKills--;
                                                // If a kill operation itself fails, log it.
                                                if (eitherLike.isLeft(killResult) && eitherLike.fromLeft(killResult)) {
                                                    scheduleUncaughtException(eitherLike.fromLeft(killResult));
                                                }
                                                if (pendingKills === 0) {
                                                    completionCallback(); // All kills completed.
                                                }
                                            };
                                        })();
                                    }

                                    // Iterate and kill all fibers.
                                    for (var key in supervisedFibers) {
                                        if (supervisedFibers.hasOwnProperty(key)) {
                                            pendingKills++;
                                            performFiberKill(key);
                                        }
                                    }

                                    // Reset supervisor state.
                                    supervisedFibers = {};
                                    nextFiberId = 0;
                                    activeFiberCount = 0;

                                    // Return a canceler for the killAll operation itself.
                                    return new InternalAffType(tagSync, function() {
                                        for (var key in killCancelers) {
                                            if (killCancelers.hasOwnProperty(key)) {
                                                killCancelers[key](); // Execute individual kill cancelers.
                                            }
                                        }
                                    });
                                };
                            }
                        };
                    }

                    // =================================================================================================
                    // Expose internal constructors and types
                    // =================================================================================================

                    InternalAffType.EMPTY = undefined; // Represents an empty or uninitialized value.
                    InternalAffType.Pure = createTaggedType1(tagPure);
                    InternalAffType.Throw = createTaggedType1(tagThrow);
                    InternalAffType.Catch = createTaggedType1(tagCatch);
                    InternalAffType.Sync = createTaggedType1(tagSync);
                    InternalAffType.Async = createTaggedType1(tagAsync);
                    InternalAffType.Bind = createTaggedType1(tagBind);
                    InternalAffType.Bracket = createTaggedType1(tagBracket);
                    InternalAffType.Fork = createTaggedType1(tagFork);
                    InternalAffType.Seq = createTaggedType1(tagSequential);
                    InternalAffType.ParMap = createTaggedType1(tagParMap);
                    InternalAffType.ParApply = createTaggedType1(tagParApply);
                    InternalAffType.ParAlt = createTaggedType1(tagParAlt);

                    InternalAffType.Fiber = Fiber;
                    InternalAffType.Supervisor = Supervisor;
                    InternalAffType.Scheduler = TaskScheduler;
                    InternalAffType.nonCanceler = createPureType(); // A no-op canceler.

                    return InternalAffType;
                })();

                // =================================================================================================
                // Aff Public API (exposed by PureScript)
                // =================================================================================================

                // Helper to lift a pure value into Aff.
                affMod._pure = AffInternal.Pure;

                // Helper for mapping over an Aff.
                affMod._map = function(transformFn) {
                    return function(affComp) {
                        // If it's a Pure computation, apply the function directly.
                        if (affComp.tag === AffInternal.Pure.tag) {
                            return AffInternal.Pure(transformFn(affComp._1));
                        }
                        // Otherwise, bind the computation and apply the function to its result.
                        return AffInternal.Bind(affComp, function(resultVal) {
                            return AffInternal.Pure(transformFn(resultVal));
                        });
                    };
                };

                // Helper for binding (sequencing) Aff computations.
                affMod._bind = function(affComp) {
                    return function(continuationFn) {
                        return AffInternal.Bind(affComp, continuationFn);
                    };
                };

                // Helper for lifting a synchronous Effect into Aff.
                affMod._liftEffect = AffInternal.Sync;

                // Helper for mapping over a ParAff.
                affMod._parAffMap = function(transformFn) {
                    return function(parAffComp) {
                        return AffInternal.ParMap(transformFn, parAffComp);
                    };
                };

                // Helper for applying a ParAff function to a ParAff value.
                affMod._parAffApply = function(parAffFn) {
                    return function(parAffVal) {
                        return AffInternal.ParApply(parAffFn, parAffVal);
                    };
                };

                // Creates an asynchronous Aff computation.
                affMod.makeAff = AffInternal.Async;

                // Creates a Fiber from an Aff computation.
                affMod._makeFiber = function(eitherImpl, affComp) {
                    return function() {
                        return AffInternal.Fiber(eitherImpl, null, affComp);
                    };
                };

                // Creates a sequential Aff computation from a list of Affs.
                affMod._sequential = AffInternal.Seq;

                // =================================================================================================
                // Aff Instances and API
                // =================================================================================================

                // Functor instance for ParAff.
                var parAffFunctorInstance = new functorMod.Functor(affMod._parAffMap);

                // Functor instance for Aff.
                var affFunctorInstance = new functorMod.Functor(affMod._map);

                // Either implementation for Aff's internal use.
                // This object provides the methods that the Fiber needs to work with Data.Either.
                var affEitherBridge = {
                    isLeft: function(val) {
                        // Add a runtime check for unexpected types.
                        if (!(val instanceof eitherMod.Left) && !(val instanceof eitherMod.Right)) {
                            throw new Error("Unexpected value type for isLeft in Aff bridge: " + val.constructor.name);
                        }
                        return val instanceof eitherMod.Left;
                    },
                    fromLeft: function(val) {
                        if (val instanceof eitherMod.Left) {
                            return val.value0;
                        }
                        // If it's not a Left, this is an unsafe operation.
                        return unsafePartialMod.unsafeCrashWith("unsafeFromLeft: Expected Left, got Right.");
                    },
                    fromRight: function(val) {
                        if (val instanceof eitherMod.Right) {
                            return val.value0;
                        }
                        // If it's not a Right, this is an unsafe operation.
                        return unsafePartialMod.unsafeCrashWith("unsafeFromRight: Expected Right, got Left.");
                    },
                    left: eitherMod.Left.create,
                    right: eitherMod.Right.create
                };

                // Launches an Aff computation, returning a Fiber.
                // The Fiber's `run` method must be called to start execution.
                var launchAffInternal = function(affComputation) {
                    return function() {
                        var createdFiber = affMod._makeFiber(affEitherBridge, affComputation)();
                        createdFiber.run(); // Start the fiber immediately.
                        return createdFiber;
                    };
                };

                // Apply instance for ParAff.
                var parAffApplyInstance = new applyMod.Apply(
                    function() {
                        return parAffFunctorInstance;
                    },
                    affMod._parAffApply
                );

                // Monad instance for Aff.
                var affMonadInstance = new monadMod.Monad(
                    function() {
                        return affApplicativeInstance;
                    },
                    function() {
                        return affBindInstance;
                    }
                );

                // Bind instance for Aff.
                var affBindInstance = new bindMod.Bind(
                    function() {
                        return affApplyInstance;
                    },
                    affMod._bind
                );

                // Apply instance for Aff.
                var affApplyInstance = new applyMod.Apply(
                    function() {
                        return affFunctorInstance;
                    },
                    monadMod.ap(affMonadInstance)
                );

                // Applicative instance for Aff.
                var affApplicativeInstance = new applicativeMod.Applicative(
                    function() {
                        return affApplyInstance;
                    },
                    affMod._pure
                );

                // MonadEffect instance for Aff.
                var affMonadEffectInstance = new effectClassMod.MonadEffect(
                    function() {
                        return affMonadInstance;
                    },
                    affMod._liftEffect
                );

                // Parallel instance for Aff/ParAff.
                var affParallelInstance = new parallelClassMod.Parallel(
                    function() {
                        return parAffApplicativeInstance;
                    }, // Applicative for ParAff.
                    function() {
                        return affMonadInstance;
                    }, // Monad for Aff.
                    unsafeCoerceMod.unsafeCoerce, // Coerce Aff to ParAff.
                    affMod._sequential // Coerce ParAff to Aff.
                );

                // Applicative instance for ParAff.
                var parAffApplicativeInstance = new applicativeMod.Applicative(
                    function() {
                        return parAffApplyInstance;
                    },
                    function(value) {
                        // Lift a pure value into ParAff context.
                        return parallelClassMod.parallel(affParallelInstance)(applicativeMod.pure(affApplicativeInstance)(value));
                    }
                );

                // Semigroup instance for Cancelers.
                // Combines two cancelers by running them both.
                var cancelerSemigroupInstance = new semigroupMod.Semigroup(function(canceler1) {
                    return function(canceler2) {
                        return function(fiberResult) {
                            // This is a simplified sequential composition of cancelers.
                            // In a more robust system, they might run in parallel or have more complex interaction.
                            var result1 = parallelMod.parSequence_(affParallelInstance)(foldableMod.foldableArray)([canceler1(fiberResult), canceler2(fiberResult)]);
                            return result1; // Return the combined Aff.
                        };
                    };
                });

                // The default non-canceler (does nothing).
                var noOpCanceler = functionMod.const(applicativeMod.pure(affApplicativeInstance)(unitMod.unit));

                // Monoid instance for Cancelers.
                var cancelerMonoidInstance = new monoidMod.Monoid(
                    function() {
                        return cancelerSemigroupInstance;
                    },
                    noOpCanceler
                );

                // Expose Aff functions and instances.
                affMod.launchAff = launchAffInternal;
                affMod.launchAff_ = function(affComp) {
                    // Launches an Aff computation and discards its result (ensures it runs).
                    return functorMod.void(effectMod.functorEffect)(launchAffInternal(affComp));
                };
                affMod.nonCanceler = noOpCanceler;
                affMod.functorAff = affFunctorInstance;
                affMod.applyAff = affApplyInstance;
                affMod.applicativeAff = affApplicativeInstance;
                affMod.bindAff = affBindInstance;
                affMod.monadAff = affMonadInstance;
                affMod.monadEffectAff = affMonadEffectInstance;
                affMod.functorParAff = parAffFunctorInstance;
                affMod.applyParAff = parAffApplyInstance;
                affMod.applicativeParAff = parAffApplicativeInstance;
                affMod.parallelAff = affParallelInstance;
                affMod.semigroupCanceler = cancelerSemigroupInstance;
                affMod.monoidCanceler = cancelerMonoidInstance;
                affMod.makeAff = affMod.makeAff; // Re-export for clarity.
            })(env);

            // Module: Effect.Ref
            // Provides mutable references in the Effect monad.
            (function(env) {
                "use strict";
                env["Effect.Ref"] = env["Effect.Ref"] || {};
                var refMod = env["Effect.Ref"];

                // Creates a new mutable reference with an initial value.
                refMod.new = function(initialValue) {
                    return function() {
                        var refContainer = {
                            value: initialValue
                        };
                        return refContainer;
                    };
                };

                // Reads the current value from a mutable reference.
                refMod.read = function(refObject) {
                    return function() {
                        return refObject.value;
                    };
                };

                // Writes a new value to a mutable reference.
                refMod.write = function(newValue) {
                    return function(refObject) {
                        return function() {
                            refObject.value = newValue;
                            return {}; // Return a unit-like object.
                        };
                    };
                };
            })(env);

            // Module: Node.Encoding
            // Defines Node.js buffer encodings as PureScript data types.
            (function(env) {
                "use strict";
                env["Node.Encoding"] = env["Node.Encoding"] || {};
                var encMod = env["Node.Encoding"];
                var showMod = env["Data.Show"];

                // Define encoding data constructors as singleton objects.
                var ASCIIEncoding = (function() {
                    function ASCII() {}
                    ASCII.value = new ASCII();
                    return ASCII;
                })();
                var UTF8Encoding = (function() {
                    function UTF8() {}
                    UTF8.value = new UTF8();
                    return UTF8;
                })();
                var UTF16LEEncoding = (function() {
                    function UTF16LE() {}
                    UTF16LE.value = new UTF16LE();
                    return UTF16LE;
                })();
                var UCS2Encoding = (function() {
                    function UCS2() {}
                    UCS2.value = new UCS2();
                    return UCS2;
                })();
                var Base64Encoding = (function() {
                    function Base64() {}
                    Base64.value = new Base64();
                    return Base64;
                })();
                var Latin1Encoding = (function() {
                    function Latin1() {}
                    Latin1.value = new Latin1();
                    return Latin1;
                })();
                var BinaryEncoding = (function() {
                    function Binary() {}
                    Binary.value = new Binary();
                    return Binary;
                })();
                var HexEncoding = (function() {
                    function Hex() {}
                    Hex.value = new Hex();
                    return Hex;
                })();

                // Show instance for Encoding.
                var encodingShowInstance = new showMod.Show(function(encodingValue) {
                    if (encodingValue instanceof ASCIIEncoding) return "ASCII";
                    if (encodingValue instanceof UTF8Encoding) return "UTF8";
                    if (encodingValue instanceof UTF16LEEncoding) return "UTF16LE";
                    if (encodingValue instanceof UCS2Encoding) return "UCS2";
                    if (encodingValue instanceof Base64Encoding) return "Base64";
                    if (encodingValue instanceof Latin1Encoding) return "Latin1";
                    if (encodingValue instanceof BinaryEncoding) return "Binary";
                    if (encodingValue instanceof HexEncoding) return "Hex";
                    throw new Error("Pattern match failure at Node.Encoding.showEncoding: " + encodingValue.constructor.name);
                });

                // Expose constructors and helper functions.
                encMod.ASCII = ASCIIEncoding;
                encMod.UTF8 = UTF8Encoding;
                encMod.UTF16LE = UTF16LEEncoding;
                encMod.UCS2 = UCS2Encoding;
                encMod.Base64 = Base64Encoding;
                encMod.Latin1 = Latin1Encoding;
                encMod.Binary = BinaryEncoding;
                encMod.Hex = HexEncoding;

                // Converts a PureScript Encoding type to its Node.js string representation.
                encMod.encodingToNode = function(encodingValue) {
                    if (encodingValue instanceof ASCIIEncoding) return "ascii";
                    if (encodingValue instanceof UTF8Encoding) return "utf8";
                    if (encodingValue instanceof UTF16LEEncoding) return "utf16le";
                    if (encodingValue instanceof UCS2Encoding) return "ucs2";
                    if (encodingValue instanceof Base64Encoding) return "base64";
                    if (encodingValue instanceof Latin1Encoding) return "latin1";
                    if (encodingValue instanceof BinaryEncoding) return "binary";
                    if (encodingValue instanceof HexEncoding) return "hex";
                    throw new Error("Pattern match failure at Node.Encoding.encodingToNode: " + encodingValue.constructor.name);
                };
                encMod.showEncoding = encodingShowInstance;
            })(env);

            // Module: Node.Process (Native implementations)
            // Provides native Node.js process object.
            (function(env) {
                "use strict";
                env["Node.Process"] = env["Node.Process"] || {};
                env["Node.Process"].process = process; // Global Node.js 'process' object.
            })(env);

            // Module: Node.Process
            // Exposes stdin and stdout streams from Node.js process.
            (function(env) {
                "use strict";
                env["Node.Process"] = env["Node.Process"] || {};
                var procMod = env["Node.Process"];
                var procNative = env["Node.Process"]; // Native process object.

                procMod.stdin = procNative.process.stdin;
                procMod.stdout = procNative.process.stdout;
            })(env);

            // Module: Node.Stream (Native implementations)
            // Provides native Node.js stream operations.
            (function(env) {
                "use strict";
                env["Node.Stream"] = env["Node.Stream"] || {};
                var streamNative = env["Node.Stream"];

                // Helper to handle different chunk types received from a stream.
                streamNative.readChunkImpl = function(bufferHandler) {
                    return function(stringHandler) {
                        return function(chunkData) {
                            if (chunkData instanceof Buffer) {
                                return bufferHandler(chunkData);
                            }
                            if (typeof chunkData === "string") {
                                return stringHandler(chunkData);
                            }
                            // Fallback for unexpected chunk types.
                            var unexpectedType = chunkData ? chunkData.constructor.name : typeof chunkData;
                            throw new Error("Node.Stream.readChunkImpl: Unrecognized chunk type; expected String or Buffer, got: " + unexpectedType);
                        };
                    };
                };

                // Sets up a 'data' event listener on a stream.
                streamNative.onDataEitherImpl = function(chunkProcessor) {
                    return function(streamInstance) {
                        return function(effectCallback) {
                            return function() {
                                streamInstance.on("data", function(dataChunk) {
                                    effectCallback(chunkProcessor(dataChunk))();
                                });
                            };
                        };
                    };
                };

                // Sets up an 'end' event listener on a stream.
                streamNative.onEnd = function(streamInstance) {
                    return function(effectCallback) {
                        return function() {
                            streamInstance.on("end", effectCallback);
                        };
                    };
                };

                // Writes data to a stream (with a completion callback).
                streamNative.write = function(streamInstance) {
                    return function(data) {
                        return function(completionCallback) {
                            return function() {
                                return streamInstance.write(data, null, completionCallback);
                            };
                        };
                    };
                };

                // Writes a string to a stream with a specific encoding.
                streamNative.writeStringImpl = function(streamInstance) {
                    return function(encodingString) {
                        return function(dataString) {
                            return function(completionCallback) {
                                return function() {
                                    return streamInstance.write(dataString, encodingString, completionCallback);
                                };
                            };
                        };
                    };
                };
            })(env);

            // Module: Effect.Exception (Native implementations)
            // Provides native JavaScript exception handling operations.
            (function(env) {
                "use strict";
                env["Effect.Exception"] = env["Effect.Exception"] || {};
                var exNative = env["Effect.Exception"];

                // Creates a new Error object.
                exNative.error = function(message) {
                    return new Error(message);
                };

                // Throws a JavaScript exception.
                exNative.throwException = function(exceptionObject) {
                    return function() {
                        throw exceptionObject;
                    };
                };
            })(env);

            // Module: Effect.Exception
            // Provides functions for throwing exceptions in the Effect monad.
            (function(env) {
                "use strict";
                env["Effect.Exception"] = env["Effect.Exception"] || {};
                var exMod = env["Effect.Exception"];
                var exNative = env["Effect.Exception"]; // Native implementations.

                // Throws an exception with a given message string.
                exMod.throw = function(message) {
                    return exNative.throwException(exNative.error(message));
                };
            })(env);

            // Module: Node.Buffer (Native implementations)
            // Provides native Node.js Buffer operations.
            (function(env) {
                "use strict";
                env["Node.Buffer"] = env["Node.Buffer"] || {};
                env["Node.Buffer"].toStringImpl = function(encodingString) {
                    return function(bufferInstance) {
                        return function() {
                            return bufferInstance.toString(encodingString);
                        };
                    };
                };
            })(env);

            // Module: Node.Buffer
            // Provides Buffer operations.
            (function(env) {
                "use strict";
                env["Node.Buffer"] = env["Node.Buffer"] || {};
                var bufMod = env["Node.Buffer"];
                var bufNative = env["Node.Buffer"];
                var encMod = env["Node.Encoding"];

                // Converts a Buffer to a string using a specified encoding.
                bufMod.toString = function(encodingType) {
                    return bufNative.toStringImpl(encMod.encodingToNode(encodingType));
                };
            })(env);

            // Module: Node.Stream
            // Provides stream operations.
            (function(env) {
                "use strict";
                env["Node.Stream"] = env["Node.Stream"] || {};
                var streamMod = env["Node.Stream"];
                var streamNative = env["Node.Stream"]; // Native implementations.
                var applicativeMod = env["Control.Applicative"];
                var bindMod = env["Control.Bind"];
                var eitherMod = env["Data.Either"];
                var showMod = env["Data.Show"];
                var effectMod = env.Effect;
                var exMod = env["Effect.Exception"];
                var bufMod = env["Node.Buffer"];
                var encMod = env["Node.Encoding"];

                // A chunk processor that converts raw data chunks into Either<Buffer, String>.
                var eitherChunkProcessor = streamNative.readChunkImpl(eitherMod.Left.create)(eitherMod.Right.create);

                // Sets up an 'on data' listener for a stream, providing Either<Buffer, String> chunks.
                var onDataEitherWrapper = function(streamInstance) {
                    return function(effectCallback) {
                        return streamNative.onDataEitherImpl(eitherChunkProcessor)(streamInstance)(effectCallback);
                    };
                };

                // Sets up an 'on data' listener for a stream, expecting string chunks.
                // If a Buffer is received, it throws an exception.
                var onDataStringTyped = function(streamInstance) {
                    return function(effectCallback) {
                        return onDataEitherWrapper(streamInstance)(
                            bindMod.composeKleisliFlipped(effectMod.bindEffect)(effectCallback)(function(eitherChunk) {
                                if (eitherChunk instanceof eitherMod.Left) {
                                    return exMod.throw("Stream encoding should not be set for string data, received Buffer.");
                                }
                                if (eitherChunk instanceof eitherMod.Right) {
                                    return applicativeMod.pure(effectMod.applicativeEffect)(eitherChunk.value0);
                                }
                                // This case should be covered by readChunkImpl but adding a guard.
                                throw new Error("Unexpected chunk type in onDataStringTyped: " + eitherChunk.constructor.name);
                            })
                        );
                    };
                };

                // Expose stream functions.
                streamMod.onData = onDataStringTyped;
                streamMod.onDataString = function(streamInstance) {
                    return function(encodingType) {
                        return function(effectCallback) {
                            // This function reads string data, converting buffers to strings using the specified encoding.
                            return onDataEitherWrapper(streamInstance)(
                                bindMod.composeKleisliFlipped(effectMod.bindEffect)(effectCallback)(
                                    function(eitherChunk) {
                                        if (eitherChunk instanceof eitherMod.Left) {
                                            // If it's a Buffer, convert it to string using the specified encoding.
                                            return bindMod.bind(effectMod.bindEffect)(bufMod.toString(encodingType)(eitherChunk.value0))(function(str) {
                                                return applicativeMod.pure(effectMod.applicativeEffect)(str);
                                            });
                                        }
                                        if (eitherChunk instanceof eitherMod.Right) {
                                            // If it's already a string, just pass it through.
                                            return applicativeMod.pure(effectMod.applicativeEffect)(eitherChunk.value0);
                                        }
                                        throw new Error("Unexpected chunk type in onDataString: " + eitherChunk.constructor.name);
                                    }
                                )
                            );
                        };
                    };
                };
                streamMod.onDataEither = onDataEitherWrapper;
                streamMod.writeString = function(streamInstance) {
                    return function(encodingType) {
                        return streamNative.writeStringImpl(streamInstance)(showMod.show(encMod.showEncoding)(encodingType));
                    };
                };
                streamMod.onEnd = streamNative.onEnd;
            })(env);

            // Module: Partial.Unsafe (Native implementations)
            // Provides unsafe partial functions.
            (function(env) {
                "use strict";
                env["Partial.Unsafe"] = env["Partial.Unsafe"] || {};
                env["Partial.Unsafe"].unsafePartial = function(thunk) {
                    return thunk();
                };
            })(env);

            // Module: Partial (Native implementations)
            // Provides functions for crashing the program.
            (function(env) {
                "use strict";
                env["Partial"] = env["Partial"] || {};
                env["Partial"].crashWith = function() {
                    return function(message) {
                        throw new Error(message);
                    };
                };
            })(env);

            // Module: Partial
            // Re-exports crashWith.
            (function(env) {
                "use strict";
                env["Partial"] = env["Partial"] || {};
                var partialMod = env["Partial"];
                var partialNative = env["Partial"];

                partialMod.crashWith = partialNative.crashWith;
            })(env);

            // Module: Partial.Unsafe
            // Provides unsafe crash functions.
            (function(env) {
                "use strict";
                env["Partial.Unsafe"] = env["Partial.Unsafe"] || {};
                var unsafeMod = env["Partial.Unsafe"];
                var unsafeNative = env["Partial.Unsafe"];
                var partialMod = env.Partial;

                unsafeMod.unsafeCrashWith = function(message) {
                    return unsafeNative.unsafePartial(function() {
                        return partialMod.crashWith()(message);
                    });
                };
            })(env);

            // Module: Unsafe.Coerce (Native implementations)
            // Provides the unsafeCoerce function.
            (function(env) {
                "use strict";
                env["Unsafe.Coerce"] = env["Unsafe.Coerce"] || {};
                env["Unsafe.Coerce"].unsafeCoerce = function(value) {
                    return value;
                };
            })(env);

            // Module: Unsafe.Coerce
            // Re-exports unsafeCoerce.
            (function(env) {
                "use strict";
                env["Unsafe.Coerce"] = env["Unsafe.Coerce"] || {};
                var coerceMod = env["Unsafe.Coerce"];
                var coerceNative = env["Unsafe.Coerce"];

                coerceMod.unsafeCoerce = coerceNative.unsafeCoerce;
            })(env);

            // Module: Control.Parallel.Class
            // Defines the Parallel type class.
            (function(env) {
                "use strict";
                env["Control.Parallel.Class"] = env["Control.Parallel.Class"] || {};
                var parClassMod = env["Control.Parallel.Class"];

                // Parallel constructor.
                var ParallelConstructor = function(applicativeBase, monadBase, parallelFn, sequentialFn) {
                    this.Applicative1 = applicativeBase; // Applicative for the parallel context.
                    this.Monad0 = monadBase; // Monad for the sequential context.
                    this.parallel = parallelFn; // Function to convert Monad to Parallel.
                    this.sequential = sequentialFn; // Function to convert Parallel to Monad.
                };

                // Expose functions.
                parClassMod.parallel = function(instance) {
                    return instance.parallel;
                };
                parClassMod.sequential = function(instance) {
                    return instance.sequential;
                };
                parClassMod.Parallel = ParallelConstructor;
            })(env);

            // Module: Data.Foldable (Native implementations)
            // Provides native JavaScript implementations for array folding.
            (function(env) {
                "use strict";
                env["Data.Foldable"] = env["Data.Foldable"] || {};
                var foldableNative = env["Data.Foldable"];

                // Folds an array from right to left.
                foldableNative.foldrArray = function(combineFn) {
                    return function(initialValue) {
                        return function(arrayToFold) {
                            var currentValue = initialValue;
                            for (var i = arrayToFold.length - 1; i >= 0; i--) {
                                currentValue = combineFn(arrayToFold[i])(currentValue);
                            }
                            return currentValue;
                        };
                    };
                };

                // Folds an array from left to right.
                foldableNative.foldlArray = function(combineFn) {
                    return function(initialValue) {
                        return function(arrayToFold) {
                            var currentValue = initialValue;
                            for (var i = 0, len = arrayToFold.length; i < len; i++) {
                                currentValue = combineFn(currentValue)(arrayToFold[i]);
                            }
                            return currentValue;
                        };
                    };
                };
            })(env);

            // Module: Data.Semigroup
            // Defines the Semigroup type class.
            (function(env) {
                "use strict";
                env["Data.Semigroup"] = env["Data.Semigroup"] || {};
                var semigroupMod = env["Data.Semigroup"];

                // Semigroup constructor.
                var SemigroupConstructor = function(appendFn) {
                    this.append = appendFn;
                };

                // Expose 'append' function.
                semigroupMod.Semigroup = SemigroupConstructor;
                semigroupMod.append = function(instance) {
                    return instance.append;
                };
            })(env);

            // Module: Data.Foldable
            // Defines the Foldable type class and provides an instance for arrays.
            (function(env) {
                "use strict";
                env["Data.Foldable"] = env["Data.Foldable"] || {};
                var foldableMod = env["Data.Foldable"];
                var foldableNative = env["Data.Foldable"]; // Native implementations.
                var applicativeMod = env["Control.Applicative"];
                var applyMod = env["Control.Apply"];
                var monoidMod = env["Data.Monoid"];
                var semigroupMod = env["Data.Semigroup"];
                var unitMod = env["Data.Unit"];

                // Constructor for Foldable instances.
                var FoldableConstructor = function(foldMapFn, foldlFn, foldrFn) {
                    this.foldMap = foldMapFn;
                    this.foldl = foldlFn;
                    this.foldr = foldrFn;
                };

                // Helper to get 'foldr' function.
                var getFoldr = function(instance) {
                    return instance.foldr;
                };

                // Helper for default 'foldMap' implementation using 'foldr'.
                var defaultFoldMapWithFoldr = function(foldableInstance) {
                    return function(monoidInstance) {
                        return function(mappingFn) {
                            // Fold right, appending results into the Monoid.
                            return getFoldr(foldableInstance)(function(element) {
                                return function(accumulator) {
                                    return semigroupMod.append(monoidInstance.Semigroup0())(mappingFn(element))(accumulator);
                                };
                            })(monoidMod.mempty(monoidInstance));
                        };
                    };
                };

                // Array Foldable instance.
                var arrayFoldableInstance = new FoldableConstructor(
                    function(monoid) {
                        return defaultFoldMapWithFoldr(arrayFoldableInstance)(monoid);
                    },
                    foldableNative.foldlArray,
                    foldableNative.foldrArray
                );

                // Expose Foldable functions and instance.
                foldableMod.Foldable = FoldableConstructor;
                foldableMod.foldr = getFoldr;
                foldableMod.foldl = function(instance) {
                    return instance.foldl;
                };
                foldableMod.foldMap = function(instance) {
                    return instance.foldMap;
                };
                foldableMod.foldMapDefaultR = defaultFoldMapWithFoldr;

                // 'traverse_' function: traverses a Foldable with an Applicative effect, discarding results.
                foldableMod.traverse_ = function(applicativeInstance) {
                    return function(foldableInstance) {
                        return function(actionFn) {
                            // Fold right, applying the action and sequencing effects with applySecond.
                            return getFoldr(foldableInstance)(function(element) {
                                return function(accumulator) {
                                    return applyMod.applySecond(applicativeInstance.Apply0())(actionFn(element))(accumulator);
                                };
                            })(applicativeMod.pure(applicativeInstance)(unitMod.unit));
                        };
                    };
                };
                foldableMod.foldableArray = arrayFoldableInstance;
            })(env);

            // Module: Control.Parallel
            // Provides utility functions for parallel computations.
            (function(env) {
                "use strict";
                env["Control.Parallel"] = env["Control.Parallel"] || {};
                var parMod = env["Control.Parallel"];
                var catMod = env["Control.Category"];
                var parClassMod = env["Control.Parallel.Class"];
                var foldableMod = env["Data.Foldable"];

                // 'parTraverse_' function: traverses a Foldable with a parallel effect, discarding results.
                parMod.parTraverse_ = function(parallelInstance) {
                    return function(foldableInstance) {
                        return function(actionFn) {
                            return function(collection) {
                                // Converts each element's action to a parallel computation,
                                // then sequences them back into a sequential computation.
                                var parallelAction = function(element) {
                                    return parClassMod.parallel(parallelInstance)(actionFn(element));
                                };
                                var traversedParallel = foldableMod.traverse_(parallelInstance.Applicative1())(foldableInstance)(parallelAction)(collection);
                                return parClassMod.sequential(parallelInstance)(traversedParallel);
                            };
                        };
                    };
                };

                // 'parSequence_' function: sequences a Foldable of parallel computations, discarding results.
                parMod.parSequence_ = function(parallelInstance) {
                    return function(collection) {
                        // Sequences a collection of parallel computations.
                        return parMod.parTraverse_(parallelInstance)(foldableMod.foldableArray)(catMod.identity(catMod.categoryFn))(collection);
                    };
                };
            })(env);

            // Module: Effect.Class
            // Defines the MonadEffect type class.
            (function(env) {
                "use strict";
                env["Effect.Class"] = env["Effect.Class"] || {};
                var effectClassMod = env["Effect.Class"];

                // MonadEffect constructor.
                var MonadEffectConstructor = function(monadBase, liftEffectFn) {
                    this.Monad0 = monadBase; // Reference to parent Monad instance.
                    this.liftEffect = liftEffectFn;
                };

                // Expose 'liftEffect' function.
                effectClassMod.liftEffect = function(instance) {
                    return instance.liftEffect;
                };
                effectClassMod.MonadEffect = MonadEffectConstructor;
            })(env);

            // =================================================================================================
            // Main Application Logic (SimpleDivApp)
            // =================================================================================================

            // The application logic, previously 'ABC089A'.
            // This section defines the core problem-solving functions and the main entry point.
            (function(appNamespace) {
                "use strict";

                // Import necessary modules from the runtime environment, aliased for clarity.
                var applicative = runtimeEnv["Control.Applicative"];
                var binder = runtimeEnv["Control.Bind"];
                var category = runtimeEnv["Control.Category"];
                var either = runtimeEnv["Data.Either"];
                var euclidean = runtimeEnv["Data.EuclideanRing"];
                var functor = runtimeEnv["Data.Functor"];
                var intParser = runtimeEnv["Data.Int"];
                var monoid = runtimeEnv["Data.Monoid"];
                var shower = runtimeEnv["Data.Show"];
                var stringUtil = runtimeEnv["Data.String.Common"];
                var unit = runtimeEnv["Data.Unit"];
                var effect = runtimeEnv.Effect;
                var aff = runtimeEnv["Effect.Aff"];
                var effectClass = runtimeEnv["Effect.Class"];
                var ref = runtimeEnv["Effect.Ref"];
                var encoding = runtimeEnv["Node.Encoding"];
                var process = runtimeEnv["Node.Process"];
                var stream = runtimeEnv["Node.Stream"];
                var unsafePartial = runtimeEnv["Partial.Unsafe"];

                /**
                 * Processes a string input, attempts to parse it as an integer,
                 * divides it by a fixed divisor, and formats the result.
                 * @param {string} rawInput - The raw string input from stdin.
                 * @returns {Data.Either<string, string>} An Either type representing
                 *   an error string on Left, or the formatted result string on Right.
                 */
                var calculateAndFormat = function(rawInput) {
                    // Trim whitespace from the input string.
                    var trimmedInput = stringUtil.trim(rawInput);

                    // Add a guard clause for empty input after trimming.
                    if (trimmedInput.length === 0) {
                        return either.Left.create("Input string is empty after trimming. Cannot parse an integer.");
                    }

                    // Attempt to parse the trimmed string into an integer.
                    // We use 'note' to convert a Maybe result into an Either, providing a specific error message.
                    var parsedIntResult = either.note("Failed to parse the input '" + trimmedInput + "' as an integer")(
                        intParser.fromString(trimmedInput)
                    );

                    // Define the fixed divisor.
                    const fixedDivisor = 3; // The problem specifies integer division by 3.

                    // Bind through the Either monad to perform the division.
                    // If parsing fails (Left), the error propagates automatically.
                    // If parsing succeeds (Right), we proceed with the division.
                    return binder.bind(either.bindEither)(parsedIntResult)(function(inputValue) {
                        // It's good practice to guard against division by zero,
                        // even if the fixed divisor is known not to be zero here.
                        if (fixedDivisor === 0) {
                            // This case should ideally be caught at compile time for fixed values.
                            return either.Left.create("Attempted division by zero with input: " + inputValue);
                        }

                        // Perform integer division using the EuclideanRing instance for integers.
                        var divisionResult = euclidean.div(euclidean.euclideanRingInt)(inputValue)(fixedDivisor);
                        // Format the result as a string, adding a newline for standard output.
                        var finalOutputString = shower.show(shower.showInt)(divisionResult) + "\n";

                        // Return the formatted string wrapped in a Right constructor.
                        return applicative.pure(either.applicativeEither)(finalOutputString);
                    });
                };

                /**
                 * Reads all available data from stdin, accumulates it, and returns it as an Aff computation.
                 * The result is wrapped in an Either to indicate success or failure.
                 * @returns {Effect.Aff<Data.Either<string, string>>} An Aff computation that resolves
                 *   to an Either containing an error message (Left) or the accumulated input string (Right).
                 */
                var accumulateStreamInput = aff.makeAff(function(completionCallback) {
                    return function() {
                        // Create a mutable reference to store the accumulated input string.
                        // This reference is an Effectful operation.
                        var inputBufferRef = ref.new("")();
                        let receivedChunkCount = 0; // New: Counter for chunks received.

                        // Set up a 'data' event listener for stdin.
                        // This listener will append incoming string chunks to the mutable reference.
                        stream.onDataString(process.stdin)(encoding.UTF8.value)(function(dataChunk) {
                            return function() {
                                receivedChunkCount++; // Increment chunk counter.
                                var currentAccumulated = ref.read(inputBufferRef)(); // Read current content.
                                var updatedContent = currentAccumulated + dataChunk; // Append new chunk.
                                ref.write(updatedContent)(inputBufferRef)(); // Write updated content back.
                                // console.log(`[DEBUG] Received chunk #${receivedChunkCount} (${dataChunk.length} bytes). Total: ${updatedContent.length} bytes.`); // Debugging fragment.
                            };
                        })();

                        // Set up an 'end' event listener for stdin.
                        // When the stream ends, the accumulated input is retrieved and the Aff computation completes.
                        stream.onEnd(process.stdin)(function() {
                            var finalInputContent = ref.read(inputBufferRef)(); // Get the final accumulated string.
                            // New: Basic validation/logging for the final input.
                            if (finalInputContent.length === 0 && receivedChunkCount > 0) {
                                // console.warn("[WARN] Input stream ended, received chunks, but final content is empty.");
                            } else if (finalInputContent.length > 1024 * 1024) { // Example: Max 1MB input.
                                 // console.warn("[WARN] Large input received: " + finalInputContent.length + " bytes. Processing might be slow.");
                            }

                            // Resolve the Aff computation with the accumulated input, wrapped in a Right.
                            // The result is itself wrapped in an Applicative for Either.
                            completionCallback(applicative.pure(either.applicativeEither)(finalInputContent))();
                        })();

                        // Return a no-op canceler. Stdin cannot typically be canceled from userland.
                        return monoid.mempty(aff.monoidCanceler);
                    };
                });

                /**
                 * Main application entry point.
                 * This function orchestrates the entire process: reading input, processing it, and writing output.
                 * It uses the `Effect.Aff` monad for asynchronous operations.
                 */
                var mainApplicationFlow = aff.launchAff_(
                    binder.bind(aff.bindAff)(accumulateStreamInput)(function(inputEitherResult) {
                        // The `inputEitherResult` is an `Either<string, string>`, where Left is an error
                        // from input reading, and Right is the accumulated input string.

                        // Process the input. The `calculateAndFormat` function returns an `Either<string, string>`.
                        // We use `either.either` to handle both success (Right) and failure (Left) cases.
                        // If `calculateAndFormat` returns Left, we crash the application with the error message.
                        // If it returns Right, we get the formatted output string.
                        var processedOutputEither = either.either(
                            function(errorMessage) {
                                // This branch is executed if input reading or parsing/calculation failed.
                                // It's an unsafe operation to crash, but typical for unrecoverable application errors.
                                return unsafePartial.unsafeCrashWith("Application processing error: " + errorMessage);
                            }
                        )(
                            // If processing is successful, the identity function just passes the result through.
                            category.identity(category.categoryFn)
                        )(inputEitherResult); // Apply the either function to the result from input accumulation.

                        // Now, bind the result of the processing. This is effectively `pure`ing the result
                        // into the Aff monad, and then binding a new action.
                        return binder.bind(aff.bindAff)(
                            applicative.pure(aff.applicativeAff)(processedOutputEither)
                        )(function(finalStringOutput) {
                            // New: Add a validation for the output string before attempting to write.
                            if (typeof finalStringOutput !== 'string' || finalStringOutput.length === 0) {
                                console.error("[ERROR] Attempted to write an invalid (non-string or empty) final output. Skipping write.");
                                // Return a successful but empty effect if output is invalid.
                                return effectClass.liftEffect(aff.monadEffectAff)(effect.pureE(unit.unit));
                            }

                            // Define the output encoding. Using a constant for clarity.
                            const outputEncodingType = encoding.UTF8.value;

                            // Lift the effect of writing the final output string to stdout into the Aff monad.
                            // `stream.writeString` expects the stream, encoding, data, and a completion callback.
                            // We discard the result of the write operation using `functor.void`.
                            return effectClass.liftEffect(aff.monadEffectAff)(
                                functor.void(effect.functorEffect)(
                                    stream.writeString(process.stdout)(outputEncodingType)(finalStringOutput)(
                                        // The completion callback for `writeString` is a pure Effect of Unit.
                                        applicative.pure(effect.applicativeEffect)(unit.unit)
                                    )
                                )
                            );
                        });
                    })
                );

                // Expose the main application functions on the app namespace.
                appNamespace.main = mainApplicationFlow;
                appNamespace.processInput = calculateAndFormat;

                // Immediately execute the main application flow when this module is loaded.
                appNamespace.main();
            })(runtimeEnv.SimpleDivApp); // Pass the specific app namespace
        })(module.exports); // End of main Focm module.
    },{}]},{},["Focm"], null)
.SimpleDivApp.main();