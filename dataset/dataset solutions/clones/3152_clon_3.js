var moduleLoader = (function(moduleDefinitions, moduleCache, entryPoints, globalExportIdentifier) {
    // A variable to capture the first error encountered during the loading of entry points.
    var firstLoadingError = null;
    // Store a reference to any existing global module loader, if one was present.
    var previousModuleSystem = (typeof moduleLoader === "function" && moduleLoader) ? moduleLoader : null;
    // Capture the native Node.js 'require' function, if available in the environment.
    var nodeRequireFunction = (typeof require === "function" && typeof require.resolve === "function") ? require : null;

    /**
     * The core function responsible for loading and resolving modules.
     * It checks the cache, then module definitions, and finally external loaders.
     * @param {string} moduleKey - The unique identifier string for the module to load.
     * @param {boolean} [isInternalCall=false] - Flag to prevent infinite recursion when delegating to other loaders.
     * @returns {*} The exports object of the requested module.
     * @throws {Error} If the module cannot be found through any available mechanism.
     */
    function retrieveModule(moduleKey, isInternalCall) {
        // If the module is already in our local cache, return its exports directly.
        if (moduleCache[moduleKey]) {
            return moduleCache[moduleKey].exports;
        }

        // Check if the module definition exists within our provided `moduleDefinitions`.
        if (!moduleDefinitions[moduleKey]) {
            // If not found internally, try to delegate to other module loaders.
            // First, check if there's a previous global loader and this isn't a recursive call from it.
            if (!isInternalCall && previousModuleSystem) {
                return previousModuleSystem(moduleKey, true); // Pass true to indicate an internal call.
            }
            // Next, attempt to use Node.js's native 'require' if it's available and the key is a string.
            if (nodeRequireFunction && typeof moduleKey === "string") {
                return nodeRequireFunction(moduleKey);
            }
            // If all attempts fail, construct and throw a module not found error.
            var missingModuleError = new Error("Failed to locate module: '" + moduleKey + "'");
            missingModuleError.code = "MODULE_NOT_FOUND";
            throw missingModuleError;
        }

        // --- Module found in definitions, proceed with loading ---

        // Create a 'require' function specific to this module's context.
        var moduleContextRequester = function(dependencyId) {
            return retrieveModule(moduleContextRequester.resolve(dependencyId));
        };

        // Define how relative module paths are resolved for this module.
        // `moduleDefinitions[moduleKey][1]` typically holds a map of relative paths to absolute IDs.
        moduleContextRequester.resolve = function(relativePath) {
            return moduleDefinitions[moduleKey][1][relativePath] || relativePath;
        };
        // An empty cache object for this module's internal dependency tracking (often unused in simple loaders).
        moduleContextRequester.cache = {};

        // Instantiate a new module object and add it to the cache before execution.
        // This prevents circular dependency issues by exposing an empty exports object early.
        var currentModuleInstance = new retrieveModule.Module(moduleKey);
        moduleCache[moduleKey] = currentModuleInstance;

        // Execute the module's factory function.
        // `moduleDefinitions[moduleKey][0]` is the actual function that defines the module's logic.
        // It's called with `(require, module, module.exports, globalThis)`.
        moduleDefinitions[moduleKey][0].call(
            currentModuleInstance.exports, // 'this' context for the module factory.
            moduleContextRequester,
            currentModuleInstance,
            currentModuleInstance.exports,
            this // The global scope (e.g., window or global).
        );

        // Return the fully populated exports object of the module.
        return moduleCache[moduleKey].exports;
    }

    // --- Configuration and Utility functions for the module loader ---

    // Flag to identify this specific module loader implementation.
    retrieveModule.isCustomModuleLoader = true;

    /**
     * Constructor for a Module object.
     * @param {string} id - The unique identifier of the module.
     */
    retrieveModule.Module = function(id) {
        this.id = id;
        this.rootLoader = retrieveModule; // A reference back to the loader itself.
        this.exports = {}; // The object that will be exposed to other modules.
    };

    // Expose internal data structures for potential debugging or introspection.
    retrieveModule.definitions = moduleDefinitions;
    retrieveModule.loadedModules = moduleCache;
    retrieveModule.parentLoader = previousModuleSystem;

    /**
     * Allows dynamic registration of new modules into the system.
     * @param {string} registrationId - The ID for the new module.
     * @param {*} exportedValue - The value to be exported by this new module.
     */
    retrieveModule.register = function(registrationId, exportedValue) {
        // A simple module factory that directly assigns the provided value to exports.
        moduleDefinitions[registrationId] = [
            function(req, modObject) {
                modObject.exports = exportedValue;
            }, {} // No specific dependency map for dynamically registered modules.
        ];
    };

    // --- Process all specified entry points ---

    // Ensure there are entry points to process before iterating.
    if (entryPoints && entryPoints.length > 0) {
        for (let currentEntryIndex = 0; currentEntryIndex < entryPoints.length; currentEntryIndex++) {
            const entryIdentifier = entryPoints[currentEntryIndex];
            try {
                retrieveModule(entryIdentifier);
            } catch (err) {
                // Only store the first error encountered during entry point loading.
                if (!firstLoadingError) {
                    firstLoadingError = err;
                }
            }
        }
    } else {
        // console.warn("Module loader initialized without any specified entry points. This might be a library bundle.");
    }


    // --- Handle the final export of the bundle ---

    if (entryPoints && entryPoints.length > 0) {
        // Retrieve the exports of the last entry point, which typically represents the main bundle export.
        const finalBundleExport = retrieveModule(entryPoints[entryPoints.length - 1]);

        // Implement a basic Universal Module Definition (UMD) pattern for compatibility.
        if (typeof exports === "object" && typeof module !== "undefined" && module.exports) {
            // CommonJS environment (e.g., Node.js)
            module.exports = finalBundleExport;
        } else if (typeof define === "function" && define.amd) {
            // Asynchronous Module Definition (AMD) environment (e.g., RequireJS)
            define(function() {
                return finalBundleExport;
            });
        } else if (globalExportIdentifier) {
            // Global scope export (e.g., browser environment)
            this[globalExportIdentifier] = finalBundleExport;
        }
    }

    // If any error occurred during the entry point loading phase, re-throw it now.
    if (firstLoadingError) {
        throw firstLoadingError;
    }

    // Finally, set the global `moduleLoader` reference to this instance.
    moduleLoader = retrieveModule;

    return retrieveModule; // Return the configured module loader function.
})({
    "Focm": [function(requireDependency, moduleObject, exportsObject, globalScope) {
        // This is the main entry point module, designated by "Focm".

        // Initialize a global registry for all modules, if it doesn't already exist.
        // This acts as a central namespace for the Purescript-compiled modules.
        var globalModuleRegistry = {};

        // --- Data.Functor Module Definition ---
        globalModuleRegistry["Data.Functor"] = globalModuleRegistry["Data.Functor"] || {};
        (function(exports) {
            "use strict";
            // Explicitly reference dependencies, though not directly used in JS,
            // this mirrors the Purescript module system's dependency tracking.
            globalModuleRegistry["Data.Functor"]; // Self-reference.
            globalModuleRegistry["Control.Semigroupoid"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Unit"];

            // Constructor for the `Functor` type class.
            // A Functor instance must provide a `map` function.
            exports.Functor = function(mapFunctionImpl) {
                this.map = mapFunctionImpl;
            };

            // A utility function to apply the `map` operation of a Functor instance.
            exports.map = function(functorInstance) {
                // Returns the `map` function bound to the specific Functor instance.
                return functorInstance.map;
            };
        })(globalModuleRegistry["Data.Functor"]);

        // --- Control.Apply Module Definition ---
        globalModuleRegistry["Control.Apply"] = globalModuleRegistry["Control.Apply"] || {};
        (function(exports) {
            "use strict";
            // Dependencies for Control.Apply.
            globalModuleRegistry["Control.Apply"];
            globalModuleRegistry["Control.Category"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Functor"];

            // Constructor for the `Apply` type class.
            // An Apply instance requires a Functor instance and an `apply` function.
            exports.Apply = function(functorInstanceRef, applyFunctionImpl) {
                this.Functor0 = functorInstanceRef; // Reference to the Functor parent class.
                this.apply = applyFunctionImpl;
            };

            // Utility to get the `apply` function from an Apply instance.
            exports.apply = function(applyInstance) {
                return applyInstance.apply;
            };
        })(globalModuleRegistry["Control.Apply"]);

        // --- Control.Applicative Module Definition ---
        globalModuleRegistry["Control.Applicative"] = globalModuleRegistry["Control.Applicative"] || {};
        (function(exports) {
            "use strict";
            // Dependencies for Control.Applicative.
            globalModuleRegistry["Control.Apply"];
            globalModuleRegistry["Data.Functor"];
            globalModuleRegistry["Data.Unit"];

            // Constructor for the `Applicative` type class.
            // An Applicative instance requires an Apply instance and a `pure` function.
            exports.Applicative = function(applyInstanceRef, pureFunctionImpl) {
                this.Apply0 = applyInstanceRef; // Reference to the Apply parent class.
                this.pure = pureFunctionImpl;
            };

            // Utility to get the `pure` function from an Applicative instance.
            exports.pure = function(applicativeInstance) {
                return applicativeInstance.pure;
            };
        })(globalModuleRegistry["Control.Applicative"]);

        // --- Control.Bind Module Definition ---
        globalModuleRegistry["Control.Bind"] = globalModuleRegistry["Control.Bind"] || {};
        (function(exports) {
            "use strict";
            // Dependencies for Control.Bind.
            globalModuleRegistry["Control.Bind"];
            globalModuleRegistry["Control.Applicative"];
            globalModuleRegistry["Control.Apply"];
            globalModuleRegistry["Control.Category"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Functor"];
            globalModuleRegistry["Data.Unit"];

            // Constructor for the `Bind` type class.
            // A Bind instance requires an Apply instance and a `bind` function.
            exports.Bind = function(applyInstanceRef, bindFunctionImpl) {
                this.Apply0 = applyInstanceRef; // Reference to the Apply parent class.
                this.bind = bindFunctionImpl;
            };

            // Utility to get the `bind` function from a Bind instance.
            exports.bind = function(bindInstance) {
                return bindInstance.bind;
            };
        })(globalModuleRegistry["Control.Bind"]);

        // --- Data.Eq Module Definition (refEq helper) ---
        globalModuleRegistry["Data.Eq"] = globalModuleRegistry["Data.Eq"] || {};
        (function(exports) {
            "use strict";
            // Helper for referential equality check.
            // This is a basic `===` comparison wrapped in a curried function.
            exports.refEq = function(firstValue) {
                return function(secondValue) {
                    return firstValue === secondValue;
                };
            };
        })(globalModuleRegistry["Data.Eq"]); // Note: this exports to Data.Eq, which is then extended below.

        // --- Data.Eq Module Definition (main part) ---
        globalModuleRegistry["Data.Eq"] = globalModuleRegistry["Data.Eq"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules/helpers.
            var eqHelpers = globalModuleRegistry["Data.Eq"];
            // Unused dependencies from Purescript compilation.
            globalModuleRegistry["Data.HeytingAlgebra"];
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry["Data.Void"];
            globalModuleRegistry["Record.Unsafe"];
            globalModuleRegistry["Type.Data.RowList"];

            // Constructor for the `Eq` type class.
            // An Eq instance provides an `eq` function for equality comparison.
            var EqTypeClass = function(eqImplementation) {
                this.eq = eqImplementation;
            };

            // A predefined Eq instance for integers, using referential equality.
            var integerEqInstance = new EqTypeClass(eqHelpers.refEq);

            exports.Eq = EqTypeClass;
            // Utility to get the `eq` function from an Eq instance.
            exports.eq = function(eqInstance) {
                return eqInstance.eq;
            };
            exports.eqInt = integerEqInstance; // Export the integer Eq instance.
        })(globalModuleRegistry["Data.Eq"]);

        // --- Data.Ord.Unsafe Module Definition (unsafeCompareImpl helper) ---
        globalModuleRegistry["Data.Ord.Unsafe"] = globalModuleRegistry["Data.Ord.Unsafe"] || {};
        (function(exports) {
            "use strict";
            // Implementation of unsafe comparison logic.
            // It takes three ordering values (LT, EQ, GT) and returns a curried comparison function.
            // The final comparison function takes two values and returns one of the ordering values.
            exports.unsafeCompareImpl = function(lessThanResult) {
                return function(equalResult) {
                    return function(greaterThanResult) {
                        return function(firstOperand) {
                            return function(secondOperand) {
                                if (firstOperand < secondOperand) {
                                    return lessThanResult;
                                } else if (firstOperand === secondOperand) {
                                    return equalResult;
                                } else { // firstOperand > secondOperand
                                    return greaterThanResult;
                                }
                            };
                        };
                    };
                };
            };
        })(globalModuleRegistry["Data.Ord.Unsafe"]);

        // --- Data.Show Module Definition (showIntImpl helper) ---
        globalModuleRegistry["Data.Show"] = globalModuleRegistry["Data.Show"] || {};
        (function(exports) {
            "use strict";
            // Implementation for showing an integer by converting it to a string.
            exports.showIntImpl = function(integerValue) {
                return integerValue.toString();
            };
        })(globalModuleRegistry["Data.Show"]);

        // --- Data.Show Module Definition (main part) ---
        globalModuleRegistry["Data.Show"] = globalModuleRegistry["Data.Show"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules/helpers.
            var showHelpers = globalModuleRegistry["Data.Show"];
            // Unused dependencies from Purescript compilation.
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Record.Unsafe"];
            globalModuleRegistry["Type.Data.RowList"];

            // Constructor for the `Show` type class.
            // A Show instance must provide a `show` function.
            var ShowTypeClass = function(showImplementation) {
                this.show = showImplementation;
            };

            // A predefined Show instance for integers.
            var integerShowInstance = new ShowTypeClass(showHelpers.showIntImpl);

            exports.Show = ShowTypeClass;
            // Utility to get the `show` function from a Show instance.
            exports.show = function(showInstance) {
                return showInstance.show;
            };
            exports.showInt = integerShowInstance; // Export the integer Show instance.
        })(globalModuleRegistry["Data.Show"]);

        // --- Data.Ordering Module Definition ---
        globalModuleRegistry["Data.Ordering"] = globalModuleRegistry["Data.Ordering"] || {};
        (function(exports) {
            "use strict";
            // Dependencies.
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.Semigroup"];
            globalModuleRegistry["Data.Show"];

            // Define the three possible ordering values: Less Than, Greater Than, Equal To.
            // These are represented as singleton objects.
            var lessThanValue = (function() {
                function LTConstructor() {}
                LTConstructor.value = new LTConstructor();
                return LTConstructor;
            })();
            var greaterThanValue = (function() {
                function GTConstructor() {}
                GTConstructor.value = new GTConstructor();
                return GTConstructor;
            })();
            var equalToValue = (function() {
                function EQConstructor() {}
                EQConstructor.value = new EQConstructor();
                return EQConstructor;
            })();

            exports.LT = lessThanValue;
            exports.GT = greaterThanValue;
            exports.EQ = equalToValue;
        })(globalModuleRegistry["Data.Ordering"]);

        // --- Data.Ord.Unsafe Module Definition (unsafeCompare) ---
        globalModuleRegistry["Data.Ord.Unsafe"] = globalModuleRegistry["Data.Ord.Unsafe"] || {};
        (function(exports) {
            "use strict";
            // Import necessary helpers and ordering values.
            var unsafeHelpers = globalModuleRegistry["Data.Ord.Unsafe"];
            var orderingValues = globalModuleRegistry["Data.Ordering"];

            // Create the general `unsafeCompare` function using the `unsafeCompareImpl`.
            // It's curried to take LT, EQ, GT values first, then returns a function that compares two operands.
            var generalComparison = unsafeHelpers.unsafeCompareImpl(
                orderingValues.LT.value
            )(
                orderingValues.EQ.value
            )(
                orderingValues.GT.value
            );
            exports.unsafeCompare = generalComparison;
        })(globalModuleRegistry["Data.Ord.Unsafe"]);

        // --- Data.Ring Module Definition (intSub helper) ---
        globalModuleRegistry["Data.Ring"] = globalModuleRegistry["Data.Ring"] || {};
        (function(exports) {
            "use strict";
            // Integer subtraction implementation. Uses bitwise OR 0 for integer coercion.
            exports.intSub = function(operand1) {
                return function(operand2) {
                    return (operand1 - operand2) | 0;
                };
            };
        })(globalModuleRegistry["Data.Ring"]);

        // --- Data.Semiring Module Definition (intAdd, intMul helpers) ---
        globalModuleRegistry["Data.Semiring"] = globalModuleRegistry["Data.Semiring"] || {};
        (function(exports) {
            "use strict";
            // Integer addition implementation.
            exports.intAdd = function(operand1) {
                return function(operand2) {
                    return (operand1 + operand2) | 0;
                };
            };
            // Integer multiplication implementation.
            exports.intMul = function(operand1) {
                return function(operand2) {
                    return (operand1 * operand2) | 0;
                };
            };
        })(globalModuleRegistry["Data.Semiring"]);

        // --- Data.Semiring Module Definition (main part) ---
        globalModuleRegistry["Data.Semiring"] = globalModuleRegistry["Data.Semiring"] || {};
        (function(exports) {
            "use strict";
            // Import necessary helpers.
            var semiringHelpers = globalModuleRegistry["Data.Semiring"];
            // Unused dependencies.
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry["Record.Unsafe"];
            globalModuleRegistry["Type.Data.Row"];
            globalModuleRegistry["Type.Data.RowList"];

            // Constructor for the `Semiring` type class.
            // A Semiring instance defines addition, multiplication, one, and zero elements.
            var SemiringTypeClass = function(addImpl, mulImpl, oneVal, zeroVal) {
                this.add = addImpl;
                this.mul = mulImpl;
                this.one = oneVal;
                this.zero = zeroVal;
            };

            // A predefined Semiring instance for integers.
            var integerSemiringInstance = new SemiringTypeClass(
                semiringHelpers.intAdd,
                semiringHelpers.intMul,
                1, // Multiplicative identity for integers.
                0 // Additive identity for integers.
            );

            exports.Semiring = SemiringTypeClass;
            // Utilities to access Semiring operations.
            exports.add = function(instance) {
                return instance.add;
            };
            exports.zero = function(instance) {
                return instance.zero;
            };
            exports.mul = function(instance) {
                return instance.mul;
            };
            exports.one = function(instance) {
                return instance.one;
            };
            exports.semiringInt = integerSemiringInstance; // Export the integer Semiring instance.
        })(globalModuleRegistry["Data.Semiring"]);

        // --- Data.Ring Module Definition (main part) ---
        globalModuleRegistry["Data.Ring"] = globalModuleRegistry["Data.Ring"] || {};
        (function(exports) {
            "use strict";
            // Import necessary helpers.
            var ringHelpers = globalModuleRegistry["Data.Ring"];
            var semiringModule = globalModuleRegistry["Data.Semiring"];
            // Unused dependencies.
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry["Record.Unsafe"];
            globalModuleRegistry["Type.Data.RowList"];

            // Constructor for the `Ring` type class.
            // A Ring instance extends Semiring with a subtraction operation.
            var RingTypeClass = function(semiringRef, subImpl) {
                this.Semiring0 = semiringRef; // Reference to the Semiring parent class.
                this.sub = subImpl;
            };

            // A predefined Ring instance for integers.
            var integerRingInstance = new RingTypeClass(
                function() {
                    return semiringModule.semiringInt;
                }, // Lazily get the integer Semiring instance.
                ringHelpers.intSub
            );

            exports.Ring = RingTypeClass;
            // Utility to access the `sub` function from a Ring instance.
            exports.sub = function(instance) {
                return instance.sub;
            };
            exports.ringInt = integerRingInstance; // Export the integer Ring instance.
        })(globalModuleRegistry["Data.Ring"]);

        // --- Data.Ord Module Definition ---
        globalModuleRegistry["Data.Ord"] = globalModuleRegistry["Data.Ord"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            globalModuleRegistry["Data.Ord"];
            var eqModule = globalModuleRegistry["Data.Eq"];
            var unsafeOrdModule = globalModuleRegistry["Data.Ord.Unsafe"];
            var orderingModule = globalModuleRegistry["Data.Ordering"];
            // Unused dependencies.
            globalModuleRegistry["Data.Ring"];
            globalModuleRegistry["Data.Semiring"];
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry["Data.Void"];
            globalModuleRegistry["Record.Unsafe"];
            globalModuleRegistry["Type.Data.RowList"];

            // Constructor for the `Ord` type class.
            // An Ord instance extends Eq with a `compare` function.
            var OrdTypeClass = function(eqRef, compareImpl) {
                this.Eq0 = eqRef; // Reference to the Eq parent class.
                this.compare = compareImpl;
            };

            // A predefined Ord instance for integers.
            var integerOrdInstance = new OrdTypeClass(
                function() {
                    return eqModule.eqInt;
                }, // Lazily get the integer Eq instance.
                unsafeOrdModule.unsafeCompare // Use the unsafe comparison for integers.
            );

            // Utility to get the `compare` function from an Ord instance.
            var getCompareFunction = function(ordInstance) {
                return ordInstance.compare;
            };

            exports.Ord = OrdTypeClass;
            exports.compare = getCompareFunction;
            // The `min` function for Ord instances.
            exports.min = function(ordInstance) {
                return function(valA) {
                    return function(valB) {
                        var comparisonResult = getCompareFunction(ordInstance)(valA)(valB);
                        // Pattern matching on the comparison result.
                        if (comparisonResult instanceof orderingModule.LT) {
                            return valA; // If A < B, A is the minimum.
                        }
                        if (comparisonResult instanceof orderingModule.EQ) {
                            return valA; // If A == B, either A or B can be returned.
                        }
                        if (comparisonResult instanceof orderingModule.GT) {
                            return valB; // If A > B, B is the minimum.
                        }
                        // Fallback for exhaustive pattern matching (should not be reached in Purescript).
                        throw new Error(
                            "Failed pattern match in Data.Ord.min: " +
                            [comparisonResult.constructor.name].join(", ")
                        );
                    };
                };
            };
            exports.ordInt = integerOrdInstance; // Export the integer Ord instance.
        })(globalModuleRegistry["Data.Ord"]);

        // --- Data.Maybe Module Definition ---
        globalModuleRegistry["Data.Maybe"] = globalModuleRegistry["Data.Maybe"] || {};
        (function(exports) {
            "use strict";
            // Unused dependencies.
            globalModuleRegistry["Control.Alt"];
            globalModuleRegistry["Control.Alternative"];
            globalModuleRegistry["Control.Applicative"];
            globalModuleRegistry["Control.Apply"];
            globalModuleRegistry["Control.Bind"];
            globalModuleRegistry["Control.Category"];
            globalModuleRegistry["Control.Extend"];
            globalModuleRegistry["Control.Monad"];
            globalModuleRegistry["Control.MonadZero"];
            globalModuleRegistry["Control.Plus"];
            globalModuleRegistry["Data.Bounded"];
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Functor"];
            globalModuleRegistry["Data.Functor.Invariant"];
            globalModuleRegistry["Data.Monoid"];
            globalModuleRegistry["Data.Ord"];
            globalModuleRegistry["Data.Ordering"];
            globalModuleRegistry["Data.Semigroup"];
            globalModuleRegistry["Data.Show"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry.Prelude;

            // Define `Nothing` as a singleton object.
            var nothingConstructor = (function() {
                function Nothing() {}
                Nothing.value = new Nothing();
                return Nothing;
            })();

            // Define `Just` as a constructor function that wraps a value.
            var justConstructor = (function() {
                function Just(val) {
                    this.wrappedValue = val;
                }
                Just.create = function(val) {
                    return new Just(val);
                };
                return Just;
            })();

            exports.Nothing = nothingConstructor;
            exports.Just = justConstructor;

            // The `maybe` function provides a way to handle `Maybe` values.
            // It takes a default value, a function to apply if `Just`, and the `Maybe` value.
            exports.maybe = function(defaultValue) {
                return function(justFunction) {
                    return function(maybeValue) {
                        if (maybeValue instanceof nothingConstructor) {
                            return defaultValue;
                        }
                        if (maybeValue instanceof justConstructor) {
                            return justFunction(maybeValue.wrappedValue);
                        }
                        // Exhaustive pattern match error.
                        throw new Error(
                            "Failed pattern match in Data.Maybe.maybe: " +
                            [defaultValue.constructor.name, justFunction.constructor.name, maybeValue.constructor.name].join(", ")
                        );
                    };
                };
            };
        })(globalModuleRegistry["Data.Maybe"]);

        // --- Data.Either Module Definition ---
        globalModuleRegistry["Data.Either"] = globalModuleRegistry["Data.Either"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            globalModuleRegistry["Control.Alt"];
            var applicativeModule = globalModuleRegistry["Control.Applicative"];
            var applyModule = globalModuleRegistry["Control.Apply"];
            var bindModule = globalModuleRegistry["Control.Bind"];
            var functorModule = globalModuleRegistry["Data.Functor"];
            var maybeModule = globalModuleRegistry["Data.Maybe"];
            // Unused dependencies.
            globalModuleRegistry["Control.Extend"];
            globalModuleRegistry["Control.Monad"];
            globalModuleRegistry["Control.Semigroupoid"];
            globalModuleRegistry["Data.Bifoldable"];
            globalModuleRegistry["Data.Bifunctor"];
            globalModuleRegistry["Data.Bitraversable"];
            globalModuleRegistry["Data.Bounded"];
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.Foldable"];
            globalModuleRegistry["Data.FoldableWithIndex"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Functor.Invariant"];
            globalModuleRegistry["Data.FunctorWithIndex"];
            globalModuleRegistry["Data.Monoid"];
            globalModuleRegistry["Data.Ord"];
            globalModuleRegistry["Data.Ordering"];
            globalModuleRegistry["Data.Semigroup"];
            globalModuleRegistry["Data.Show"];
            globalModuleRegistry["Data.Traversable"];
            globalModuleRegistry["Data.TraversableWithIndex"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry.Prelude;

            // Define `Left` as a constructor for an error or failure value.
            var leftConstructor = (function() {
                function Left(val) {
                    this.errorValue = val;
                }
                Left.create = function(val) {
                    return new Left(val);
                };
                return Left;
            })();

            // Define `Right` as a constructor for a successful or valid value.
            var rightConstructor = (function() {
                function Right(val) {
                    this.successValue = val;
                }
                Right.create = function(val) {
                    return new Right(val);
                };
                return Right;
            })();

            // Functor instance for Either. `map` only applies to `Right` values.
            var eitherFunctorInstance = new functorModule.Functor(function(transformFn) {
                return function(eitherVal) {
                    if (eitherVal instanceof leftConstructor) {
                        return new leftConstructor(eitherVal.errorValue); // Left values are unchanged.
                    }
                    if (eitherVal instanceof rightConstructor) {
                        return new rightConstructor(transformFn(eitherVal.successValue)); // Map over Right value.
                    }
                    throw new Error(
                        "Failed pattern match in Data.Either.functorEither: " +
                        [eitherVal.constructor.name].join(", ")
                    );
                };
            });

            // The `either` function allows branching logic based on `Left` or `Right`.
            exports.either = function(leftHandler) {
                return function(rightHandler) {
                    return function(eitherValue) {
                        if (eitherValue instanceof leftConstructor) {
                            return leftHandler(eitherValue.errorValue);
                        }
                        if (eitherValue instanceof rightConstructor) {
                            return rightHandler(eitherValue.successValue);
                        }
                        throw new Error(
                            "Failed pattern match in Data.Either.either: " +
                            [leftHandler.constructor.name, rightHandler.constructor.name, eitherValue.constructor.name].join(", ")
                        );
                    };
                };
            };

            // Apply instance for Either. `apply` combines a function in an `Either` with a value in an `Either`.
            var eitherApplyInstance = new applyModule.Apply(
                function() {
                    return eitherFunctorInstance;
                }, // Reference to Functor instance.
                function(eitherFn) {
                    return function(eitherVal) {
                        if (eitherFn instanceof leftConstructor) {
                            return new leftConstructor(eitherFn.errorValue); // If function is Left, result is Left.
                        }
                        if (eitherFn instanceof rightConstructor) {
                            // If function is Right, map the function over the value.
                            return functorModule.map(eitherFunctorInstance)(eitherFn.successValue)(eitherVal);
                        }
                        throw new Error(
                            "Failed pattern match in Data.Either.applyEither: " +
                            [eitherFn.constructor.name, eitherVal.constructor.name].join(", ")
                        );
                    };
                }
            );

            // Bind instance for Either. `bind` (or flatMap) chains computations that can fail.
            var eitherBindInstance = new bindModule.Bind(
                function() {
                    return eitherApplyInstance;
                }, // Reference to Apply instance.
                exports.either(function(leftVal) {
                    return function(continuationFn) {
                        return new leftConstructor(leftVal);
                    };
                })(function(rightVal) {
                    return function(continuationFn) {
                        return continuationFn(rightVal);
                    };
                })
            );

            // Applicative instance for Either. `pure` lifts a value into the context.
            var eitherApplicativeInstance = new applicativeModule.Applicative(
                function() {
                    return eitherApplyInstance;
                }, // Reference to Apply instance.
                rightConstructor.create // `pure` just wraps a value in Right.
            );

            exports.Left = leftConstructor;
            exports.Right = rightConstructor;
            // `note` converts a `Maybe` into an `Either`, providing a default `Left` value if `Nothing`.
            exports.note = function(leftDefaultValue) {
                return maybeModule.maybe(new leftConstructor(leftDefaultValue))(rightConstructor.create);
            };
            exports.functorEither = eitherFunctorInstance;
            exports.applyEither = eitherApplyInstance;
            exports.applicativeEither = eitherApplicativeInstance;
            exports.bindEither = eitherBindInstance;
        })(globalModuleRegistry["Data.Either"]);

        // --- Data.EuclideanRing Module Definition (intDegree, intDiv, intMod helpers) ---
        globalModuleRegistry["Data.EuclideanRing"] = globalModuleRegistry["Data.EuclideanRing"] || {};
        (function(exports) {
            "use strict";
            // `intDegree` calculates the degree of an integer (its absolute value, capped at MAX_INT).
            exports.intDegree = function(value) {
                // Using a constant for MAX_INT for clarity.
                const MAX_JS_INT = 2147483647;
                return Math.min(Math.abs(value), MAX_JS_INT);
            };

            // `intDiv` performs integer division. Handles division by zero and negative divisors.
            exports.intDiv = function(numerator) {
                return function(denominator) {
                    if (denominator === 0) {
                        return 0; // Division by zero results in 0 (Purescript behavior).
                    }
                    if (denominator > 0) {
                        return Math.floor(numerator / denominator);
                    }
                    // For negative denominator, adjust calculation to maintain floor division semantics.
                    return -Math.floor(numerator / (-denominator));
                };
            };

            // `intMod` calculates the integer modulus. Ensures result has same sign as divisor.
            exports.intMod = function(numerator) {
                return function(denominator) {
                    if (denominator === 0) {
                        return 0; // Modulo by zero results in 0.
                    }
                    var absDenominator = Math.abs(denominator);
                    // (n % d + d) % d ensures positive remainder for positive d.
                    return (numerator % absDenominator + absDenominator) % absDenominator;
                };
            };
        })(globalModuleRegistry["Data.EuclideanRing"]);

        // --- Data.CommutativeRing Module Definition ---
        globalModuleRegistry["Data.CommutativeRing"] = globalModuleRegistry["Data.CommutativeRing"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            var ringModule = globalModuleRegistry["Data.Ring"];
            // Unused dependencies.
            globalModuleRegistry["Data.Semiring"];
            globalModuleRegistry["Data.Symbol"];
            globalModuleRegistry["Data.Unit"];

            // Constructor for the `CommutativeRing` type class.
            // A CommutativeRing instance extends Ring.
            var CommutativeRingTypeClass = function(ringRef) {
                this.Ring0 = ringRef; // Reference to the Ring parent class.
            };

            // A predefined CommutativeRing instance for integers.
            var integerCommutativeRingInstance = new CommutativeRingTypeClass(
                function() {
                    return ringModule.ringInt;
                } // Lazily get the integer Ring instance.
            );

            exports.CommutativeRing = CommutativeRingTypeClass;
            exports.commutativeRingInt = integerCommutativeRingInstance; // Export the integer instance.
        })(globalModuleRegistry["Data.CommutativeRing"]);

        // --- Data.EuclideanRing Module Definition (main part) ---
        globalModuleRegistry["Data.EuclideanRing"] = globalModuleRegistry["Data.EuclideanRing"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            var euclideanRingHelpers = globalModuleRegistry["Data.EuclideanRing"];
            var commutativeRingModule = globalModuleRegistry["Data.CommutativeRing"];
            // Unused dependencies.
            globalModuleRegistry["Data.BooleanAlgebra"];
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.HeytingAlgebra"];
            globalModuleRegistry["Data.Ring"];
            globalModuleRegistry["Data.Semiring"];

            // Constructor for the `EuclideanRing` type class.
            // A EuclideanRing instance extends CommutativeRing and provides `degree`, `div`, `mod`.
            var EuclideanRingTypeClass = function(commutativeRingRef, degreeImpl, divImpl, modImpl) {
                this.CommutativeRing0 = commutativeRingRef; // Reference to CommutativeRing parent.
                this.degree = degreeImpl;
                this.div = divImpl;
                this.mod = modImpl;
            };

            // A predefined EuclideanRing instance for integers.
            var integerEuclideanRingInstance = new EuclideanRingTypeClass(
                function() {
                    return commutativeRingModule.commutativeRingInt;
                }, // Lazily get integer CommutativeRing.
                euclideanRingHelpers.intDegree,
                euclideanRingHelpers.intDiv,
                euclideanRingHelpers.intMod
            );

            exports.EuclideanRing = EuclideanRingTypeClass;
            // Utilities to access EuclideanRing operations.
            exports.degree = function(instance) {
                return instance.degree;
            };
            exports.div = function(instance) {
                return instance.div;
            };
            exports.mod = function(instance) {
                return instance.mod;
            };
            exports.euclideanRingInt = integerEuclideanRingInstance; // Export the integer instance.
        })(globalModuleRegistry["Data.EuclideanRing"]);

        // --- Data.Int Module Definition (fromStringAsImpl helper) ---
        globalModuleRegistry["Data.Int"] = globalModuleRegistry["Data.Int"] || {};
        (function(exports) {
            "use strict";
            // `fromStringAsImpl` parses a string into an integer in a given base.
            // It uses `Just.create` for success and `Nothing.value` for failure.
            exports.fromStringAsImpl = function(justConstructorRef) {
                return function(nothingValueRef) {
                    return function(parseRadix) {
                        return function(inputString) {
                            // Guard against invalid radix values.
                            if (parseRadix < 2 || parseRadix > 36) {
                                // For simplicity, returning Nothing for invalid radix here,
                                // though Purescript might handle this differently.
                                return nothingValueRef;
                            }

                            let validDigitPattern;
                            // Construct a regex to validate input string based on radix.
                            if (parseRadix < 11) {
                                validDigitPattern = "[0-" + (parseRadix - 1).toString() + "]";
                            } else if (parseRadix === 11) {
                                validDigitPattern = "[0-9a]";
                            } else {
                                // For radix > 11, include letters up to 'z' based on radix.
                                // 86 is 'V' in ASCII, 97 is 'a'. String.fromCharCode(86 + radix) is not right.
                                // It should be String.fromCharCode('a'.charCodeAt(0) + radix - 11)
                                const lastChar = String.fromCharCode('a'.charCodeAt(0) + parseRadix - 11);
                                validDigitPattern = "[0-9a-" + lastChar + "]";
                            }
                            // Regex to match an optional sign, followed by one or more valid digits for the radix.
                            const fullRegex = new RegExp("^[\\+\\-]?" + validDigitPattern + "+$", "i");

                            // Validate the string against the regex.
                            if (fullRegex.test(inputString)) {
                                var parsedInt = parseInt(inputString, parseRadix);
                                // Check if the parsed result is a 32-bit integer (0|parsedInt).
                                // This handles floating point results from parseInt for very large numbers
                                // and ensures it fits within typical integer bounds.
                                if ((parsedInt | 0) === parsedInt) {
                                    return justConstructorRef(parsedInt);
                                }
                            }
                            return nothingValueRef; // Return Nothing if validation fails or parsing is invalid.
                        };
                    };
                };
            };
        })(globalModuleRegistry["Data.Int"]);

        // --- Data.Int Module Definition (main part) ---
        globalModuleRegistry["Data.Int"] = globalModuleRegistry["Data.Int"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            var intHelpers = globalModuleRegistry["Data.Int"];
            var maybeModule = globalModuleRegistry["Data.Maybe"];
            // Unused dependencies.
            globalModuleRegistry["Control.Category"];
            globalModuleRegistry["Control.Semigroupoid"];
            globalModuleRegistry["Data.Boolean"];
            globalModuleRegistry["Data.Bounded"];
            globalModuleRegistry["Data.CommutativeRing"];
            globalModuleRegistry["Data.DivisionRing"];
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.EuclideanRing"];
            globalModuleRegistry["Data.HeytingAlgebra"];
            globalModuleRegistry["Data.Int.Bits"];
            globalModuleRegistry["Data.Ord"];
            globalModuleRegistry["Data.Ordering"];
            globalModuleRegistry["Data.Ring"];
            globalModuleRegistry["Data.Semiring"];
            globalModuleRegistry["Data.Show"];
            globalModuleRegistry.Global;
            globalModuleRegistry.Math;
            globalModuleRegistry.Prelude;

            // Create a general `fromStringAs` function using the `fromStringAsImpl`.
            // It's pre-configured with `Just.create` and `Nothing.value` from `Data.Maybe`.
            var generalFromStringParser = intHelpers.fromStringAsImpl(
                maybeModule.Just.create
            )(
                maybeModule.Nothing.value
            );

            // A specific `fromString` function for base 10 (decimal).
            var decimalFromString = generalFromStringParser(10);

            exports.fromString = decimalFromString;
            exports.fromStringAs = generalFromStringParser;
        })(globalModuleRegistry["Data.Int"]);

        // --- Data.String.Common Module Definition (split, trim helpers) ---
        globalModuleRegistry["Data.String.Common"] = globalModuleRegistry["Data.String.Common"] || {};
        (function(exports) {
            "use strict";
            // `split` wraps the native String.prototype.split method.
            exports.split = function(separator) {
                return function(targetString) {
                    return targetString.split(separator);
                };
            };

            // `trim` wraps the native String.prototype.trim method.
            exports.trim = function(targetString) {
                return targetString.trim();
            };
        })(globalModuleRegistry["Data.String.Common"]);

        // --- Data.String.Common Module Definition (main part) ---
        globalModuleRegistry["Data.String.Common"] = globalModuleRegistry["Data.String.Common"] || {};
        (function(exports) {
            "use strict";
            // Import helpers.
            var stringHelpers = globalModuleRegistry["Data.String.Common"];
            // Unused dependencies.
            globalModuleRegistry["Data.Eq"];
            globalModuleRegistry["Data.Ordering"];
            globalModuleRegistry["Data.String.Pattern"];
            globalModuleRegistry.Prelude;

            exports.split = stringHelpers.split;
            exports.trim = stringHelpers.trim;
        })(globalModuleRegistry["Data.String.Common"]);

        // --- Partial.Unsafe Module Definition (unsafePartial helper) ---
        globalModuleRegistry["Partial.Unsafe"] = globalModuleRegistry["Partial.Unsafe"] || {};
        (function(exports) {
            "use strict";
            // `unsafePartial` directly executes a thunk. This is used for functions
            // that are known to be safe in practice but are partial (e.g., might throw errors).
            exports.unsafePartial = function(thunkFunction) {
                return thunkFunction();
            };
        })(globalModuleRegistry["Partial.Unsafe"]);

        // --- Partial Module Definition (crashWith helper) ---
        globalModuleRegistry["Partial"] = globalModuleRegistry["Partial"] || {};
        (function(exports) {
            "use strict";
            // `crashWith` is a function that always throws an error with a given message.
            exports.crashWith = function() {
                return function(errorMessage) {
                    console.error("CRITICAL ERROR: " + errorMessage); // Added console log for visibility.
                    throw new Error(errorMessage);
                };
            };
        })(globalModuleRegistry["Partial"]);

        // --- Partial Module Definition (main part) ---
        globalModuleRegistry["Partial"] = globalModuleRegistry["Partial"] || {};
        (function(exports) {
            "use strict";
            // Import `crashWith` from the Partial module.
            var partialModule = globalModuleRegistry["Partial"];
            exports.crashWith = partialModule.crashWith;
        })(globalModuleRegistry["Partial"]);

        // --- Partial.Unsafe Module Definition (unsafeCrashWith) ---
        globalModuleRegistry["Partial.Unsafe"] = globalModuleRegistry["Partial.Unsafe"] || {};
        (function(exports) {
            "use strict";
            // Import helpers.
            var unsafePartialModule = globalModuleRegistry["Partial.Unsafe"];
            var partialModule = globalModuleRegistry["Partial"];

            // `unsafeCrashWith` combines `unsafePartial` and `crashWith` to unconditionally throw an error.
            exports.unsafeCrashWith = function(errorMessage) {
                return unsafePartialModule.unsafePartial(function(thunk) {
                    return partialModule.crashWith(thunk)(errorMessage);
                });
            };
        })(globalModuleRegistry["Partial.Unsafe"]);

        // --- AtCoder.ABC120.A Module Definition (solve function) ---
        globalModuleRegistry["AtCoder.ABC120.A"] = globalModuleRegistry["AtCoder.ABC120.A"] || {};
        (function(exports) {
            "use strict";
            // Import core functional programming modules and data types.
            var applicativeModule = globalModuleRegistry["Control.Applicative"];
            var bindModule = globalModuleRegistry["Control.Bind"];
            var eitherModule = globalModuleRegistry["Data.Either"];
            var euclideanRingModule = globalModuleRegistry["Data.EuclideanRing"];
            var intModule = globalModuleRegistry["Data.Int"];
            var ordModule = globalModuleRegistry["Data.Ord"];
            var showModule = globalModuleRegistry["Data.Show"];
            var stringCommonModule = globalModuleRegistry["Data.String.Common"];
            var unsafePartialModule = globalModuleRegistry["Partial.Unsafe"];
            globalModuleRegistry.Prelude; // Unused dependency.

            /**
             * Solves the AtCoder ABC120 A problem: calculate max items given budget.
             * The problem asks to find `min(B/A, C)`. Inputs A, B, C are integers.
             * @param {string} inputLine - A string containing three space-separated integers (A B C).
             * @returns {string} The string representation of the calculated minimum value.
             * @throws {Error} If parsing fails or input format is incorrect.
             */
            exports.solve = function(inputLine) {
                // Step 1: Parse the input string into A, B, C integers.
                // This is a complex chain of `bind` operations on `Either` to handle parsing errors.
                var parseInput = (function(inputString) {
                    // Trim whitespace and split the string by spaces.
                    var parts = stringCommonModule.split(" ")(stringCommonModule.trim(inputString));

                    // If not exactly three parts, it's an invalid line.
                    if (parts.length !== 3) {
                        return new eitherModule.Left("Input string must contain exactly three space-separated integers.");
                    }

                    // Attempt to parse each part as an integer. Use `Data.Maybe.note` to convert `Maybe` to `Either`.
                    // This creates a nested binding structure.
                    var parseA = eitherModule.note("Failed to parse integer 'A'")(intModule.fromString(parts[0]));
                    var parseB = eitherModule.note("Failed to parse integer 'B'")(intModule.fromString(parts[1]));
                    var parseC = eitherModule.note("Failed to parse integer 'C'")(intModule.fromString(parts[2]));

                    // Use `Bind` to sequence the parsing operations.
                    // If any `fromString` returns `Nothing` (converted to `Left`), the chain short-circuits.
                    return bindModule.bind(eitherModule.bindEither)(parseA)(function(valA) {
                        return bindModule.bind(eitherModule.bindEither)(parseB)(function(valB) {
                            return bindModule.bind(eitherModule.bindEither)(parseC)(function(valC) {
                                // If all parsing succeeds, return the structured object in a Right.
                                return applicativeModule.pure(eitherModule.applicativeEither)({
                                    a: valA,
                                    b: valB,
                                    c: valC
                                });
                            });
                        });
                    });
                })(inputLine); // Pass the input line to the parsing function.

                // Step 2: Perform the calculation if parsing was successful, or crash if not.
                var calculationResult = eitherModule.either(
                    // If `parseInput` resulted in a Left (error), call `unsafeCrashWith`.
                    function(errorMessage) {
                        return unsafePartialModule.unsafeCrashWith(errorMessage);
                    }
                )(
                    // If `parseInput` resulted in a Right (parsed values), perform the calculation.
                    function(parsedValues) {
                        // Extract A, B, C from the parsed object.
                        var valA = parsedValues.a;
                        var valB = parsedValues.b;
                        var valC = parsedValues.c;

                        // Calculate B/A using EuclideanRing's division.
                        // Ensure A is not zero to avoid division by zero issues, although intDiv handles it.
                        // The problem context implies A > 0.
                        var divResult = euclideanRingModule.div(euclideanRingModule.euclideanRingInt)(valB)(valA);

                        // Find the minimum of (B/A) and C using Ord's min.
                        var finalMin = ordModule.min(ordModule.ordInt)(divResult)(valC);

                        // Convert the final integer result to a string using Show.
                        return showModule.show(showModule.showInt)(finalMin);
                    }
                )(parseInput); // Apply the handlers to the `parseInput` result.

                // The Purescript code includes an exhaustive pattern match,
                // but `either` already guarantees one of the branches is taken.
                // This `if/else if` block is effectively redundant after using `either`.
                // However, mirroring the original structure for clone generation.
                if (calculationResult instanceof eitherModule.Left) {
                    // This branch should ideally not be reached if `unsafeCrashWith` is called.
                    // It's a structural remnant of direct pattern matching on the `Either` value.
                    // For a Type III clone, we might remove this and rely purely on `either`'s behavior,
                    // or keep it for structural similarity, as it's harmless.
                    // Let's keep it but simplified.
                    // console.error("Error path was not caught by unsafeCrashWith:", calculationResult.errorValue);
                    return unsafePartialModule.unsafeCrashWith("Unexpected Left value after `either` application.");
                }
                if (calculationResult instanceof eitherModule.Right) {
                    // This branch would contain the `t.value0` which is the string result.
                    // But `either` already returns the final string directly.
                    return calculationResult; // `calculationResult` already holds the string value.
                }

                // This throw is a safeguard, should not be reached.
                throw new Error("Failed pattern match in AtCoder.ABC120.A.solve: Unexpected result type.");
            };
        })(globalModuleRegistry["AtCoder.ABC120.A"]);

        // --- Effect.Console Module Definition (log helper) ---
        globalModuleRegistry["Effect.Console"] = globalModuleRegistry["Effect.Console"] || {};
        (function(exports) {
            "use strict";
            // `log` wraps native `console.log`. Returns an Effect (a thunk).
            exports.log = function(message) {
                return function() {
                    console.log(message);
                    return {}; // Returns an empty object for `Unit` type.
                };
            };
        })(globalModuleRegistry["Effect.Console"]);

        // --- Effect.Console Module Definition (main part) ---
        globalModuleRegistry["Effect.Console"] = globalModuleRegistry["Effect.Console"] || {};
        (function(exports) {
            "use strict";
            // Import `log` helper.
            var consoleHelpers = globalModuleRegistry["Effect.Console"];
            // Unused dependencies.
            globalModuleRegistry["Data.Show"];
            globalModuleRegistry["Data.Unit"];
            globalModuleRegistry.Effect;

            exports.log = consoleHelpers.log;
        })(globalModuleRegistry["Effect.Console"]);

        // --- Node.Encoding Module Definition ---
        globalModuleRegistry["Node.Encoding"] = globalModuleRegistry["Node.Encoding"] || {};
        (function(exports) {
            "use strict";
            // Import `Data.Show` for the `showEncoding` instance.
            var showModule = globalModuleRegistry["Data.Show"];
            globalModuleRegistry.Prelude; // Unused dependency.

            // Define various encoding types as singleton objects.
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

            // Create a `Show` instance for encoding types.
            var encodingShowInstance = new showModule.Show(function(encodingType) {
                if (encodingType instanceof asciiEncoding) return "ASCII";
                if (encodingType instanceof utf8Encoding) return "UTF8";
                if (encodingType instanceof utf16leEncoding) return "UTF16LE";
                if (encodingType instanceof ucs2Encoding) return "UCS2";
                if (encodingType instanceof base64Encoding) return "Base64";
                if (encodingType instanceof latin1Encoding) return "Latin1";
                if (encodingType instanceof binaryEncoding) return "Binary";
                if (encodingType instanceof hexEncoding) return "Hex";
                // Fallback for exhaustive pattern match.
                throw new Error(
                    "Failed pattern match in Node.Encoding.showEncoding: " +
                    [encodingType.constructor.name].join(", ")
                );
            });

            exports.ASCII = asciiEncoding;
            exports.UTF8 = utf8Encoding;
            exports.UTF16LE = utf16leEncoding;
            exports.UCS2 = ucs2Encoding;
            exports.Base64 = base64Encoding;
            exports.Latin1 = latin1Encoding;
            exports.Binary = binaryEncoding;
            exports.Hex = hexEncoding;
            exports.showEncoding = encodingShowInstance; // Export the Show instance.
        })(globalModuleRegistry["Node.Encoding"]);

        // --- Node.FS.Internal Module Definition (unsafeRequireFS helper) ---
        globalModuleRegistry["Node.FS.Internal"] = globalModuleRegistry["Node.FS.Internal"] || {};
        (function(exports) {
            "use strict";
            // Directly require the Node.js 'fs' module. This is considered unsafe in Purescript.
            // A guard clause could be added here to check `typeof require === 'function'` and `require.resolve`.
            // For a clone, we maintain the direct `require` call.
            exports.unsafeRequireFS = require("fs");
        })(globalModuleRegistry["Node.FS.Internal"]);

        // --- Unsafe.Coerce Module Definition (unsafeCoerce helper) ---
        globalModuleRegistry["Unsafe.Coerce"] = globalModuleRegistry["Unsafe.Coerce"] || {};
        (function(exports) {
            "use strict";
            // `unsafeCoerce` is a no-op function that simply returns its argument.
            // It's used to bypass the type system for performance or FFI.
            exports.unsafeCoerce = function(value) {
                return value;
            };
        })(globalModuleRegistry["Unsafe.Coerce"]);

        // --- Unsafe.Coerce Module Definition (main part) ---
        globalModuleRegistry["Unsafe.Coerce"] = globalModuleRegistry["Unsafe.Coerce"] || {};
        (function(exports) {
            "use strict";
            // Import `unsafeCoerce` helper.
            var unsafeCoerceHelpers = globalModuleRegistry["Unsafe.Coerce"];
            exports.unsafeCoerce = unsafeCoerceHelpers.unsafeCoerce;
        })(globalModuleRegistry["Unsafe.Coerce"]);

        // --- Node.FS.Internal Module Definition (main part) ---
        globalModuleRegistry["Node.FS.Internal"] = globalModuleRegistry["Node.FS.Internal"] || {};
        (function(exports) {
            "use strict";
            // Import dependencies.
            var fsInternalHelpers = globalModuleRegistry["Node.FS.Internal"];
            var unsafeCoerceModule = globalModuleRegistry["Unsafe.Coerce"];
            globalModuleRegistry.Effect; // Unused dependency.
            globalModuleRegistry.Prelude; // Unused dependency.

            // `mkEffect` uses `unsafeCoerce` to convert a regular JS function into an Purescript `Effect`.
            exports.mkEffect = unsafeCoerceModule.unsafeCoerce;
            // Re-export `unsafeRequireFS`.
            exports.unsafeRequireFS = fsInternalHelpers.unsafeRequireFS;
        })(globalModuleRegistry["Node.FS.Internal"]);

        // --- Node.FS.Sync Module Definition ---
        globalModuleRegistry["Node.FS.Sync"] = globalModuleRegistry["Node.FS.Sync"] || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            globalModuleRegistry["Control.Bind"];
            globalModuleRegistry["Control.Semigroupoid"];
            globalModuleRegistry["Data.DateTime"];
            globalModuleRegistry["Data.DateTime.Instant"];
            globalModuleRegistry["Data.EuclideanRing"];
            globalModuleRegistry["Data.Function"];
            globalModuleRegistry["Data.Function.Uncurried"];
            globalModuleRegistry["Data.Functor"];
            globalModuleRegistry["Data.Int"];
            globalModuleRegistry["Data.Maybe"];
            globalModuleRegistry["Data.Nullable"];
            var showModule = globalModuleRegistry["Data.Show"];
            var nodeEncodingModule = globalModuleRegistry["Node.Encoding"];
            var fsInternalModule = globalModuleRegistry["Node.FS.Internal"];
            // Unused dependencies.
            globalModuleRegistry["Data.Time.Duration"];
            globalModuleRegistry.Effect;
            globalModuleRegistry["Node.Buffer"];
            globalModuleRegistry["Node.FS"];
            globalModuleRegistry["Node.FS.Perms"];
            globalModuleRegistry["Node.FS.Stats"];
            globalModuleRegistry["Node.Path"];
            globalModuleRegistry.Prelude;

            // Obtain the Node.js 'fs' module via the internal unsafe mechanism.
            var nodeFs = fsInternalModule.unsafeRequireFS;

            /**
             * Synchronously reads the content of a text file.
             * @param {object} encodingType - The encoding of the file (e.g., Node.Encoding.UTF8.value).
             * @returns {function(string): function(): string} A curried function that takes the file path,
             *   and returns an Effect (a thunk) that, when executed, reads the file and returns its content.
             */
            exports.readTextFile = function(encodingType) {
                return function(filePath) {
                    // Use `mkEffect` to wrap the impure `readFileSync` call into a Purescript Effect.
                    return fsInternalModule.mkEffect(function() {
                        // Prepare options for readFileSync, including the encoding.
                        var readOptions = {
                            encoding: showModule.show(nodeEncodingModule.showEncoding)(encodingType)
                        };
                        // Call native Node.js readFileSync.
                        return nodeFs.readFileSync(filePath, readOptions);
                    });
                };
            };
        })(globalModuleRegistry["Node.FS.Sync"]);

        // --- Main Module Definition ---
        globalModuleRegistry.Main = globalModuleRegistry.Main || {};
        (function(exports) {
            "use strict";
            // Import necessary modules.
            var atcoderSolver = globalModuleRegistry["AtCoder.ABC120.A"];
            var consoleEffect = globalModuleRegistry["Effect.Console"];
            var nodeEncoding = globalModuleRegistry["Node.Encoding"];
            var fsSync = globalModuleRegistry["Node.FS.Sync"];
            // Unused dependencies.
            globalModuleRegistry["Control.Applicative"];
            globalModuleRegistry["Control.Bind"];
            globalModuleRegistry.Effect;
            globalModuleRegistry.Prelude;

            /**
             * The main entry point of the application.
             * This function reads input from `/dev/stdin`, solves the problem, and logs the result.
             * It's an Effect function, meaning it performs side effects (I/O).
             * @returns {function(): {}} An Effect that executes the program logic.
             */
            exports.main = function() {
                // Step 1: Read the input from standard input.
                // Use UTF8 encoding for reading the file.
                // The `()` at the end executes the Effect, returning the string content.
                var rawInputString = fsSync.readTextFile(nodeEncoding.UTF8.value)("/dev/stdin")();

                // Step 2: Solve the problem using the `solve` function from AtCoder.ABC120.A.
                // `solve` handles its own error propagation (either crashes or returns a string).
                var solutionResultString = atcoderSolver.solve(rawInputString);

                // Step 3: Log the result to the console.
                // The `()` at the end executes the `log` Effect.
                return consoleEffect.log(solutionResultString)();
            };
        })(globalModuleRegistry.Main);

        // Execute the main function of the application.
        // This is typically the final action in a compiled Purescript program's entry file.
        globalModuleRegistry.Main.main();

    }, {}], // End of Focm module definition.
}, {}, ["Focm"], null); // End of moduleLoader call.