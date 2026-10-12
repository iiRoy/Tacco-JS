const moduleLoader = function (moduleDefinitions, loadedModules, entryPoints, globalExportName) {
    // Variable to capture the first encountered error during entry point execution.
    let firstExecutionError = null;
    // Reference to the parent Parcel module loader, if one exists in the global scope.
    const parentModuleLoader = typeof parcelRequire === "function" && parcelRequire;
    // Reference to Node.js's native 'require' function, if available.
    const nodeModuleRequire = typeof require === "function" && require;

    /**
     * Executes or retrieves a module by its ID.
     * If the module is already loaded, its exports are returned from cache.
     * If not loaded, it attempts to load and execute it.
     * @param {string} moduleId - The unique identifier for the module.
     * @param {boolean} isEntryModule - Flag indicating if this is an entry point module.
     * @returns {object} The exports object of the requested module.
     * @throws {Error} If the module cannot be found or loaded.
     */
    function executeOrLoadModule(moduleId, isEntryModule) {
        // Step 1: Check if the module is already in the cache.
        if (loadedModules[moduleId]) {
            return loadedModules[moduleId].exports;
        }

        // Step 2: If module definition is missing, try external loaders.
        if (!moduleDefinitions[moduleId]) {
            const currentParcelLoader = typeof parcelRequire === "function" && parcelRequire;
            // Try to load from the current Parcel loader if not an entry module.
            if (!isEntryModule && currentParcelLoader) {
                return currentParcelLoader(moduleId, true);
            }
            // Fallback to the parent Parcel loader.
            if (parentModuleLoader) {
                return parentModuleLoader(moduleId, true);
            }
            // Fallback to Node.js's native 'require' for string module IDs.
            if (nodeModuleRequire && typeof moduleId === "string") {
                return nodeModuleRequire(moduleId);
            }
            // If all attempts fail, throw a module not found error.
            const moduleNotFoundErr = new Error(`Cannot locate module with ID: '${moduleId}'`);
            moduleNotFoundErr.code = "MODULE_NOT_FOUND";
            throw moduleNotFoundErr;
        }

        // Step 3: Prepare the module execution environment.
        // Helper function for resolving relative module paths.
        const moduleResolutionHelper = function (relativeId) {
            return moduleDefinitions[moduleId][1][relativeId] || relativeId;
        };
        // Module cache for 'require' calls within the module.
        moduleResolutionHelper.cache = {};

        // Step 4: Create a new module instance and store it in the loaded modules cache.
        const currentModuleInstance = loadedModules[moduleId] = new executeOrLoadModule.Module(moduleId);
        // Step 5: Execute the module's code.
        // The module's code is typically a function (the first element of its definition array).
        moduleDefinitions[moduleId][0].call(
            currentModuleInstance.exports, // 'this' context for the module
            moduleResolutionHelper,        // 'require' function for the module
            currentModuleInstance,         // 'module' object for the module
            currentModuleInstance.exports, // 'exports' object for the module
            this                           // Global 'this'
        );

        // Return the module's exports.
        return loadedModules[moduleId].exports;
    }

    // Attach utility properties and methods to the module loader function.
    executeOrLoadModule.isParcelRequire = true;
    executeOrLoadModule.Module = function (modId) {
        this.id = modId;
        this.bundle = executeOrLoadModule; // Reference to the main loader.
        this.exports = {}; // The object that will hold the module's exports.
    };
    executeOrLoadModule.modules = moduleDefinitions; // All defined modules.
    executeOrLoadModule.cache = loadedModules;       // Cache of loaded modules.
    executeOrLoadModule.parent = parentModuleLoader; // Reference to the parent loader.

    /**
     * Registers a new module definition dynamically.
     * @param {string} modId - The ID of the module to register.
     * @param {object} moduleContent - The content to be exported by the module.
     */
    executeOrLoadModule.register = function (modId, moduleContent) {
        moduleDefinitions[modId] = [
            function (moduleExportsObj, moduleRef) {
                moduleRef.exports = moduleContent;
            },
            {} // Empty dependencies object.
        ];
    };

    // Process all specified entry points for the bundle.
    let entryIndex = 0;
    while (entryIndex < entryPoints.length) { // Changed for loop to while loop.
        try {
            executeOrLoadModule(entryPoints[entryIndex]);
        } catch (err) {
            // Only store the very first error encountered; subsequent errors are ignored.
            if (!firstExecutionError) {
                firstExecutionError = err;
            }
        }
        entryIndex++;
    }

    // If there are entry points, handle their global export.
    if (entryPoints.length > 0) {
        const lastModuleExports = executeOrLoadModule(entryPoints[entryPoints.length - 1]);
        if (typeof exports === "object" && typeof module !== "undefined") {
            // CommonJS export.
            module.exports = lastModuleExports;
        } else if (typeof define === "function" && define.amd) {
            // AMD export.
            define(function () {
                return lastModuleExports;
            });
        } else if (globalExportName) {
            // Global variable export.
            this[globalExportName] = lastModuleExports;
        }
    }

    // Reassign the global `parcelRequire` to this newly created loader instance.
    if (typeof parcelRequire === "function") {
        parcelRequire = executeOrLoadModule;
    }

    // If any error was caught during entry point processing, rethrow it.
    if (firstExecutionError) {
        throw firstExecutionError;
    }

    return executeOrLoadModule;
}({ // Start of module definitions object.

    // Module: Focm (main application entry point)
    "Focm": [function (requireFunc, moduleRef, moduleExports, globalScope) {
        // The central registry object for all modules, mimicking the original 'n'.
        const moduleRegistry = {};

        // Module: Control.Semigroupoid
        (function (exportsContainer) {
            "use strict";
            // Constructor for Semigroupoid type class.
            const SemigroupoidConstructor = function (composeFunction) {
                this.compose = composeFunction;
            };
            // An instance of Semigroupoid for functions (function composition).
            const semigroupoidFunctionInstance = new SemigroupoidConstructor(function (funcA) {
                return function (funcB) {
                    return function (value) {
                        return funcA(funcB(value));
                    };
                };
            });
            exportsContainer.compose = function (semigroupoidInstance) {
                return semigroupoidInstance.compose;
            };
            exportsContainer.Semigroupoid = SemigroupoidConstructor;
            exportsContainer.semigroupoidFn = semigroupoidFunctionInstance;
        }(moduleRegistry["Control.Semigroupoid"] = moduleRegistry["Control.Semigroupoid"] || {}));

        // Module: Control.Category
        (function (exportsContainer) {
            "use strict";
            const currentSemigroupoid = moduleRegistry["Control.Semigroupoid"];
            // Constructor for Category type class.
            const CategoryConstructor = function (semigroupoidInstance, identityFunction) {
                this.Semigroupoid0 = semigroupoidInstance; // Refers to the Semigroupoid instance.
                this.identity = identityFunction;
            };
            // An instance of Category for functions (identity function).
            const categoryFunctionInstance = new CategoryConstructor(function () {
                return currentSemigroupoid.semigroupoidFn;
            }, function (value) {
                return value;
            });
            exportsContainer.Category = CategoryConstructor;
            exportsContainer.identity = function (categoryInstance) {
                return categoryInstance.identity;
            };
            exportsContainer.categoryFn = categoryFunctionInstance;
        }(moduleRegistry["Control.Category"] = moduleRegistry["Control.Category"] || {}));

        // Module: Data.Function
        (function (exportsContainer) {
            "use strict";
            // Dependencies listed but not directly used in exports.
            moduleRegistry["Control.Category"];
            moduleRegistry["Data.Boolean"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ring"];

            // Flips the first two arguments of a curried function.
            exportsContainer.flip = function (func) {
                return function (arg2) {
                    return function (arg1) {
                        return func(arg1)(arg2);
                    };
                };
            };
            // Creates a constant function that always returns the same value.
            exportsContainer.constant = function (value) {
                return function (ignoredArgument) {
                    return value;
                };
            };
        }(moduleRegistry["Data.Function"] = moduleRegistry["Data.Function"] || {}));

        // Module: Data.Functor (arrayMap implementation)
        (function (exportsContainer) {
            "use strict";
            // Assigns 'arrayMap' directly to the exports object.
            (exportsContainer = moduleRegistry["Data.Functor"] = moduleRegistry["Data.Functor"] || {}).arrayMap = function (mappingFunction) {
                return function (inputArray) {
                    const arrayLength = inputArray.length;
                    const resultArray = new Array(arrayLength);
                    // Standard for loop for mapping over array elements.
                    for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
                        resultArray[currentIndex] = mappingFunction(inputArray[currentIndex]);
                    }
                    return resultArray;
                };
            };
        }());

        // Module: Data.Unit (unit value)
        (function (exportsContainer) {
            "use strict";
            // Defines a singleton 'unit' object.
            (exportsContainer = moduleRegistry["Data.Unit"] = moduleRegistry["Data.Unit"] || {}).unit = {};
        }());

        // Module: Data.Show (showIntImpl implementation)
        (function (exportsContainer) {
            "use strict";
            // Defines the implementation for showing integers.
            (exportsContainer = moduleRegistry["Data.Show"] = moduleRegistry["Data.Show"] || {}).showIntImpl = function (value) {
                return value.toString();
            };
        }());

        // Module: Data.Show (main definitions)
        (function (exportsContainer) {
            "use strict";
            const currentShowModule = moduleRegistry["Data.Show"];
            moduleRegistry["Data.Symbol"];
            moduleRegistry["Record.Unsafe"];
            moduleRegistry["Type.Data.RowList"];

            // Constructor for the Show type class.
            const ShowConstructor = function (showFunction) {
                this.show = showFunction;
            };
            // Instance of Show for integers.
            const showIntInstance = new ShowConstructor(currentShowModule.showIntImpl);
            exportsContainer.Show = ShowConstructor;
            exportsContainer.show = function (showInstance) {
                return showInstance.show;
            };
            exportsContainer.showInt = showIntInstance;
        }(moduleRegistry["Data.Show"] = moduleRegistry["Data.Show"] || {}));

        // Module: Data.Unit (main definitions)
        (function (exportsContainer) {
            "use strict";
            const unitModule = moduleRegistry["Data.Unit"];
            moduleRegistry["Data.Show"];
            exportsContainer.unit = unitModule.unit;
        }(moduleRegistry["Data.Unit"] = moduleRegistry["Data.Unit"] || {}));

        // Module: Data.Functor (main definitions)
        (function (exportsContainer) {
            "use strict";
            const functorModule = moduleRegistry["Data.Functor"];
            moduleRegistry["Control.Semigroupoid"];
            const functionModule = moduleRegistry["Data.Function"];
            const unitModule = moduleRegistry["Data.Unit"];

            // Constructor for the Functor type class.
            const FunctorConstructor = function (mapFunction) {
                this.map = mapFunction;
            };
            const getMapFunction = function (functorInstance) {
                return functorInstance.map;
            };
            // Instance of Functor for arrays.
            const functorArrayInstance = new FunctorConstructor(functorModule.arrayMap);
            exportsContainer.Functor = FunctorConstructor;
            exportsContainer.map = getMapFunction;
            // 'void' function: maps all values in a functor to 'unit'.
            exportsContainer.void = function (functorInstance) {
                return getMapFunction(functorInstance)(functionModule.constant(unitModule.unit));
            };
            exportsContainer.functorArray = functorArrayInstance;
        }(moduleRegistry["Data.Functor"] = moduleRegistry["Data.Functor"] || {}));

        // Module: Control.Apply
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Apply"]; // Self-reference, often for internal consistency or future expansion.
            const categoryModule = moduleRegistry["Control.Category"];
            const functionModule = moduleRegistry["Data.Function"];
            const functorModule = moduleRegistry["Data.Functor"];

            const getApplyFunction = function (applyInstance) {
                return applyInstance.apply;
            };
            // Constructor for the Apply type class.
            exportsContainer.Apply = function (functorInstance, applyFunction) {
                this.Functor0 = functorInstance;
                this.apply = applyFunction;
            };
            exportsContainer.apply = getApplyFunction;
            // `applySecond` applies two computations, discards the result of the first.
            exportsContainer.applySecond = function (applyInstance) {
                return function (firstComputation) {
                    return function (secondComputation) {
                        return getApplyFunction(applyInstance)(
                            functorModule.map(applyInstance.Functor0())(functionModule.constant(categoryModule.identity(categoryModule.categoryFn)))(firstComputation)
                        )(secondComputation);
                    };
                };
            };
        }(moduleRegistry["Control.Apply"] = moduleRegistry["Control.Apply"] || {}));

        // Module: Control.Applicative
        (function (exportsContainer) {
            "use strict";
            const applyModule = moduleRegistry["Control.Apply"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Unit"];

            const getPureFunction = function (applicativeInstance) {
                return applicativeInstance.pure;
            };
            // Constructor for the Applicative type class.
            exportsContainer.Applicative = function (applyInstance, pureFunction) {
                this.Apply0 = applyInstance;
                this.pure = pureFunction;
            };
            exportsContainer.pure = getPureFunction;
            // `liftA1` lifts a unary function into an applicative context.
            exportsContainer.liftA1 = function (applicativeInstance) {
                return function (func) {
                    return function (applicativeValue) {
                        return applyModule.apply(applicativeInstance.Apply0())(getPureFunction(applicativeInstance)(func))(applicativeValue);
                    };
                };
            };
        }(moduleRegistry["Control.Applicative"] = moduleRegistry["Control.Applicative"] || {}));

        // Module: Control.Bind
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Bind"]; // Self-reference.
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Category"];
            const functionModule = moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Unit"];

            const getBindFunction = function (bindInstance) {
                return bindInstance.bind;
            };
            const bindFlippedFunction = function (bindInstance) {
                return functionModule.flip(getBindFunction(bindInstance));
            };
            // Constructor for the Bind type class.
            exportsContainer.Bind = function (applyInstance, bindFunction) {
                this.Apply0 = applyInstance;
                this.bind = bindFunction;
            };
            exportsContainer.bind = getBindFunction;
            exportsContainer.bindFlipped = bindFlippedFunction;
            // `composeKleisliFlipped` composes two Kleisli arrows in a flipped manner.
            exportsContainer.composeKleisliFlipped = function (bindInstance) {
                return function (funcA) {
                    return function (funcB) {
                        return function (value) {
                            return bindFlippedFunction(bindInstance)(funcA)(funcB(value));
                        };
                    };
                };
            };
        }(moduleRegistry["Control.Bind"] = moduleRegistry["Control.Bind"] || {}));

        // Module: Data.Array
        (function (exportsContainer) {
            "use strict";
            // Generates an array of integers within a specified range.
            exportsContainer.range = function (start) {
                return function (end) {
                    const step = start > end ? -1 : 1;
                    const resultLength = step * (end - start) + 1;
                    const resultArray = new Array(resultLength);
                    let currentNumber = start;
                    let arrayIndex = 0;
                    // Changed from a for loop to a while loop.
                    while (true) {
                        resultArray[arrayIndex++] = currentNumber;
                        if (currentNumber === end) break;
                        currentNumber += step;
                    }
                    return resultArray;
                };
            };
            // Filters an array based on a predicate function.
            exportsContainer.filter = function (predicateFunction) {
                return function (inputArray) {
                    return inputArray.filter(predicateFunction);
                };
            };
        }(moduleRegistry["Data.Array"] = moduleRegistry["Data.Array"] || {}));

        // Module: Data.Foldable
        (function (exportsContainer) {
            "use strict";
            // Folds an array from right to left.
            exportsContainer.foldrArray = function (combinerFunction) {
                return function (initialValue) {
                    return function (inputArray) {
                        let currentAccumulator = initialValue;
                        for (let i = inputArray.length - 1; i >= 0; i--) {
                            currentAccumulator = combinerFunction(inputArray[i])(currentAccumulator);
                        }
                        return currentAccumulator;
                    };
                };
            };
            // Folds an array from left to right.
            exportsContainer.foldlArray = function (combinerFunction) {
                return function (initialValue) {
                    return function (inputArray) {
                        let currentAccumulator = initialValue;
                        const arraySize = inputArray.length;
                        for (let i = 0; i < arraySize; i++) {
                            currentAccumulator = combinerFunction(currentAccumulator)(inputArray[i]);
                        }
                        return currentAccumulator;
                    };
                };
            };
        }(moduleRegistry["Data.Foldable"] = moduleRegistry["Data.Foldable"] || {}));

        // Module: Control.Monad
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Category"];
            const bindModule = moduleRegistry["Control.Bind"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Unit"];

            // Constructor for the Monad type class.
            exportsContainer.Monad = function (applicativeInstance, bindInstance) {
                this.Applicative0 = applicativeInstance;
                this.Bind1 = bindInstance;
            };
            // `ap` function for Monads (applying a monadic function to a monadic value).
            exportsContainer.ap = function (monadInstance) {
                return function (monadicFunction) {
                    return function (monadicValue) {
                        // Rewriting the original nested bind calls for clarity.
                        return bindModule.bind(monadInstance.Bind1())(monadicFunction)(function (func) {
                            return bindModule.bind(monadInstance.Bind1())(monadicValue)(function (val) {
                                return moduleRegistry["Control.Applicative"].pure(monadInstance.Applicative0())(func(val));
                            });
                        });
                    };
                };
            };
        }(moduleRegistry["Control.Monad"] = moduleRegistry["Control.Monad"] || {}));

        // Module: Data.Semigroup
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Data.Semigroup"]; // Self-reference.
            moduleRegistry["Data.Symbol"];
            moduleRegistry["Data.Unit"];
            moduleRegistry["Data.Void"];
            moduleRegistry["Record.Unsafe"];
            moduleRegistry["Type.Data.RowList"];

            // Constructor for the Semigroup type class.
            exportsContainer.Semigroup = function (appendFunction) {
                this.append = appendFunction;
            };
            exportsContainer.append = function (semigroupInstance) {
                return semigroupInstance.append;
            };
        }(moduleRegistry["Data.Semigroup"] = moduleRegistry["Data.Semigroup"] || {}));

        // Module: Data.Monoid
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Data.Boolean"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.EuclideanRing"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Symbol"];
            moduleRegistry["Data.Unit"];
            moduleRegistry["Record.Unsafe"];
            moduleRegistry["Type.Data.RowList"];

            // Constructor for the Monoid type class.
            exportsContainer.Monoid = function (semigroupInstance, memptyValue) {
                this.Semigroup0 = semigroupInstance;
                this.mempty = memptyValue;
            };
            exportsContainer.mempty = function (monoidInstance) {
                return monoidInstance.mempty;
            };
        }(moduleRegistry["Data.Monoid"] = moduleRegistry["Data.Monoid"] || {}));

        // Module: Data.Maybe
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Alt"];
            moduleRegistry["Control.Alternative"];
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Category"];
            moduleRegistry["Control.Extend"];
            moduleRegistry["Control.Monad"];
            moduleRegistry["Control.MonadZero"];
            moduleRegistry["Control.Plus"];
            moduleRegistry["Data.Bounded"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Functor.Invariant"];
            moduleRegistry["Data.Monoid"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Show"];
            moduleRegistry["Data.Unit"];
            moduleRegistry.Prelude;

            // Singleton for Nothing.
            const NothingConstructor = (function () {
                function NothingClass() {}
                NothingClass.value = new NothingClass();
                return NothingClass;
            })();
            // Constructor for Just.
            const JustConstructor = (function () {
                function JustClass(value) {
                    this.value0 = value;
                }
                JustClass.create = function (value) {
                    return new JustClass(value);
                };
                return JustClass;
            })();

            exportsContainer.Nothing = NothingConstructor.value;
            exportsContainer.Just = JustConstructor;
            // `maybe` function for pattern matching on Maybe values.
            exportsContainer.maybe = function (onNothing) {
                return function (onJust) {
                    return function (maybeValue) {
                        if (maybeValue === NothingConstructor.value) { // Explicit check for the singleton.
                            return onNothing;
                        }
                        if (maybeValue instanceof JustConstructor) {
                            return onJust(maybeValue.value0);
                        }
                        // Added a more general error message for unexpected types.
                        throw new Error(`Failed pattern match in Data.Maybe.maybe: received ${maybeValue?.constructor?.name || typeof maybeValue}`);
                    };
                };
            };
        }(moduleRegistry["Data.Maybe"] = moduleRegistry["Data.Maybe"] || {}));

        // Module: Data.Semiring (integer arithmetic implementations)
        (function (exportsContainer) {
            "use strict";
            exportsContainer.intAdd = function (operand1) {
                return function (operand2) {
                    return operand1 + operand2 | 0; // Bitwise OR 0 for 32-bit integer coercion.
                };
            };
            exportsContainer.intMul = function (operand1) {
                return function (operand2) {
                    return operand1 * operand2 | 0;
                };
            };
        }(moduleRegistry["Data.Semiring"] = moduleRegistry["Data.Semiring"] || {}));

        // Module: Data.Semiring (main definitions)
        (function (exportsContainer) {
            "use strict";
            const semiringModule = moduleRegistry["Data.Semiring"];
            moduleRegistry["Data.Symbol"];
            moduleRegistry["Data.Unit"];
            moduleRegistry["Record.Unsafe"];
            moduleRegistry["Type.Data.Row"];
            moduleRegistry["Type.Data.RowList"];

            // Constructor for the Semiring type class.
            const SemiringConstructor = function (addFn, mulFn, oneVal, zeroVal) {
                this.add = addFn;
                this.mul = mulFn;
                this.one = oneVal;
                this.zero = zeroVal;
            };
            // Instance of Semiring for integers.
            const semiringIntInstance = new SemiringConstructor(semiringModule.intAdd, semiringModule.intMul, 1, 0);
            exportsContainer.Semiring = SemiringConstructor;
            exportsContainer.add = function (semiringInstance) {
                return semiringInstance.add;
            };
            exportsContainer.zero = function (semiringInstance) {
                return semiringInstance.zero;
            };
            exportsContainer.mul = function (semiringInstance) {
                return semiringInstance.mul;
            };
            exportsContainer.one = function (semiringInstance) {
                return semiringInstance.one;
            };
            exportsContainer.semiringInt = semiringIntInstance;
        }(moduleRegistry["Data.Semiring"] = moduleRegistry["Data.Semiring"] || {}));

        // Module: Data.Foldable (main definitions)
        (function (exportsContainer) {
            "use strict";
            const foldableModule = moduleRegistry["Data.Foldable"];
            moduleRegistry["Control.Alt"];
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const applyModule = moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Category"];
            moduleRegistry["Control.Plus"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.HeytingAlgebra"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Maybe.First"];
            moduleRegistry["Data.Maybe.Last"];
            const monoidModule = moduleRegistry["Data.Monoid"];
            moduleRegistry["Data.Monoid.Additive"];
            moduleRegistry["Data.Monoid.Conj"];
            moduleRegistry["Data.Monoid.Disj"];
            moduleRegistry["Data.Monoid.Dual"];
            moduleRegistry["Data.Monoid.Endo"];
            moduleRegistry["Data.Monoid.Multiplicative"];
            moduleRegistry["Data.Newtype"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            const semigroupModule = moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Semiring"];
            const unitModule = moduleRegistry["Data.Unit"];
            moduleRegistry.Prelude;

            // Constructor for the Foldable type class.
            const FoldableConstructor = function (foldMapFn, foldlFn, foldrFn) {
                this.foldMap = foldMapFn;
                this.foldl = foldlFn;
                this.foldr = foldrFn;
            };
            const getFoldrFunction = function (foldableInstance) {
                return foldableInstance.foldr;
            };
            // Default implementation for `foldMap` using `foldr`.
            const foldMapDefaultRight = function (foldableInstance) {
                return function (monoidInstance) {
                    return function (mappingFunction) {
                        return getFoldrFunction(foldableInstance)(function (item) {
                            return function (accumulator) {
                                return semigroupModule.append(monoidInstance.Semigroup0())(mappingFunction(item))(accumulator);
                            };
                        })(monoidModule.mempty(monoidInstance));
                    };
                };
            };
            // Instance of Foldable for arrays.
            const foldableArrayInstance = new FoldableConstructor(
                function (monoidInstance) {
                    return foldMapDefaultRight(foldableArrayInstance)(monoidInstance);
                },
                foldableModule.foldlArray,
                foldableModule.foldrArray
            );

            exportsContainer.Foldable = FoldableConstructor;
            exportsContainer.foldr = getFoldrFunction;
            exportsContainer.foldl = function (foldableInstance) {
                return foldableInstance.foldl;
            };
            exportsContainer.foldMap = function (foldableInstance) {
                return foldableInstance.foldMap;
            };
            exportsContainer.foldMapDefaultR = foldMapDefaultRight;
            // `traverse_` applies an action to each element and discards results, returning unit.
            exportsContainer.traverse_ = function (applicativeInstance) {
                return function (foldableInstance) {
                    return function (actionFunction) {
                        return getFoldrFunction(foldableInstance)(function (item) {
                            return applyModule.applySecond(applicativeInstance.Apply0())(actionFunction(item));
                        })(applicativeModule.pure(applicativeInstance)(unitModule.unit));
                    };
                };
            };
            exportsContainer.foldableArray = foldableArrayInstance;
        }(moduleRegistry["Data.Foldable"] = moduleRegistry["Data.Foldable"] || {}));

        // Module: Partial.Unsafe
        (function (exportsContainer) {
            "use strict";
            // Executes a thunk without partiality checks.
            (exportsContainer = moduleRegistry["Partial.Unsafe"] = moduleRegistry["Partial.Unsafe"] || {}).unsafePartial = function (thunk) {
                return thunk();
            };
        }());

        // Module: Partial
        (function (exportsContainer) {
            "use strict";
            // Function to crash the program with a given message.
            (exportsContainer = moduleRegistry["Partial"] = moduleRegistry["Partial"] || {}).crashWith = function () {
                return function (message) {
                    throw new Error(message);
                };
            };
        }());

        // Module: Partial (main definitions)
        (function (exportsContainer) {
            "use strict";
            const partialModule = moduleRegistry["Partial"];
            exportsContainer.crashWith = partialModule.crashWith;
        }(moduleRegistry["Partial"] = moduleRegistry["Partial"] || {}));

        // Module: Partial.Unsafe (main definitions)
        (function (exportsContainer) {
            "use strict";
            const unsafePartialModule = moduleRegistry["Partial.Unsafe"];
            const partialModule = moduleRegistry.Partial;
            // `unsafeCrashWith` combines unsafePartial and crashWith.
            exportsContainer.unsafeCrashWith = function (message) {
                // The original 'thunk' argument was unused, simplified the call.
                return unsafePartialModule.unsafePartial(function () {
                    return partialModule.crashWith()(message);
                });
            };
        }(moduleRegistry["Partial.Unsafe"] = moduleRegistry["Partial.Unsafe"] || {}));

        // Module: Unsafe.Coerce
        (function (exportsContainer) {
            "use strict";
            // Performs an unsafe type coercion (identity function in JS).
            (exportsContainer = moduleRegistry["Unsafe.Coerce"] = moduleRegistry["Unsafe.Coerce"] || {}).unsafeCoerce = function (value) {
                return value;
            };
        }());

        // Module: Unsafe.Coerce (main definitions)
        (function (exportsContainer) {
            "use strict";
            const unsafeCoerceModule = moduleRegistry["Unsafe.Coerce"];
            exportsContainer.unsafeCoerce = unsafeCoerceModule.unsafeCoerce;
        }(moduleRegistry["Unsafe.Coerce"] = moduleRegistry["Unsafe.Coerce"] || {}));

        // Module: Data.Array (main definitions)
        (function (exportsContainer) {
            "use strict";
            const arrayModule = moduleRegistry["Data.Array"];
            moduleRegistry["Control.Alt"];
            moduleRegistry["Control.Alternative"];
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Category"];
            moduleRegistry["Control.Lazy"];
            moduleRegistry["Control.Monad.Rec.Class"];
            moduleRegistry["Control.Monad.ST"];
            moduleRegistry["Control.Monad.ST.Internal"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Array.NonEmpty.Internal"];
            moduleRegistry["Data.Array.ST"];
            moduleRegistry["Data.Array.ST.Iterator"];
            moduleRegistry["Data.Boolean"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.Foldable"];
            moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.HeytingAlgebra"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.Ring"];
            moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Semiring"];
            moduleRegistry["Data.Traversable"];
            moduleRegistry["Data.Tuple"];
            moduleRegistry["Data.Unfoldable"];
            moduleRegistry["Partial.Unsafe"];
            moduleRegistry.Prelude;
            moduleRegistry["Unsafe.Coerce"];
            exportsContainer.range = arrayModule.range;
            exportsContainer.filter = arrayModule.filter;
        }(moduleRegistry["Data.Array"] = moduleRegistry["Data.Array"] || {}));

        // Module: Data.Either
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Alt"];
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const applyModule = moduleRegistry["Control.Apply"];
            const bindModule = moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Extend"];
            moduleRegistry["Control.Monad"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Bifoldable"];
            moduleRegistry["Data.Bifunctor"];
            moduleRegistry["Data.Bitraversable"];
            moduleRegistry["Data.Bounded"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.Foldable"];
            moduleRegistry["Data.FoldableWithIndex"];
            moduleRegistry["Data.Function"];
            const functorModule = moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Functor.Invariant"];
            moduleRegistry["Data.FunctorWithIndex"];
            const maybeModule = moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Monoid"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Show"];
            moduleRegistry["Data.Traversable"];
            moduleRegistry["Data.TraversableWithIndex"];
            moduleRegistry["Data.Unit"];
            moduleRegistry.Prelude;

            // Constructor for Left.
            const LeftConstructor = (function () {
                function LeftClass(value) {
                    this.value0 = value;
                }
                LeftClass.create = function (value) {
                    return new LeftClass(value);
                };
                return LeftClass;
            })();
            // Constructor for Right.
            const RightConstructor = (function () {
                function RightClass(value) {
                    this.value0 = value;
                }
                RightClass.create = function (value) {
                    return new RightClass(value);
                };
                return RightClass;
            })();

            // Functor instance for Either.
            const functorEitherInstance = new functorModule.Functor(function (mapperFunction) {
                return function (eitherValue) {
                    if (eitherValue instanceof LeftConstructor) {
                        return new LeftConstructor(eitherValue.value0);
                    }
                    if (eitherValue instanceof RightConstructor) {
                        return new RightConstructor(mapperFunction(eitherValue.value0));
                    }
                    // Added a default return for safety, though pattern match should cover all cases.
                    return new LeftConstructor("Invalid Either value encountered in functorEither map.");
                };
            });

            // Pattern matching function for Either.
            const eitherMatchFunction = function (leftCaseFunction) {
                return function (rightCaseFunction) {
                    return function (eitherValue) {
                        if (eitherValue instanceof LeftConstructor) {
                            return leftCaseFunction(eitherValue.value0);
                        }
                        if (eitherValue instanceof RightConstructor) {
                            return rightCaseFunction(eitherValue.value0);
                        }
                        throw new Error(`Failed pattern match in Data.Either.either: received ${eitherValue?.constructor?.name || typeof eitherValue}`);
                    };
                };
            };

            // Apply instance for Either.
            const applyEitherInstance = new applyModule.Apply(
                function () {
                    return functorEitherInstance;
                },
                function (eitherFunction) {
                    return function (eitherValue) {
                        if (eitherFunction instanceof LeftConstructor) {
                            return new LeftConstructor(eitherFunction.value0);
                        }
                        if (eitherFunction instanceof RightConstructor) {
                            return functorModule.map(functorEitherInstance)(eitherFunction.value0)(eitherValue);
                        }
                        // Added a default return for safety.
                        return new LeftConstructor("Invalid Either function encountered in applyEither.");
                    };
                }
            );

            // Bind instance for Either.
            const bindEitherInstance = new bindModule.Bind(
                function () {
                    return applyEitherInstance;
                },
                eitherMatchFunction(function (leftValue) {
                    return function (ignoredFunction) {
                        return new LeftConstructor(leftValue);
                    };
                })(function (rightValue) {
                    return function (bindFunction) {
                        return bindFunction(rightValue);
                    };
                })
            );

            // Applicative instance for Either.
            const applicativeEitherInstance = new applicativeModule.Applicative(
                function () {
                    return applyEitherInstance;
                },
                RightConstructor.create
            );

            exportsContainer.Left = LeftConstructor;
            exportsContainer.Right = RightConstructor;
            exportsContainer.either = eitherMatchFunction;
            // `note` converts a Maybe to an Either, providing an error message for Nothing.
            exportsContainer.note = function (errorValue) {
                return maybeModule.maybe(new LeftConstructor(errorValue))(RightConstructor.create);
            };
            exportsContainer.functorEither = functorEitherInstance;
            exportsContainer.applyEither = applyEitherInstance;
            exportsContainer.applicativeEither = applicativeEitherInstance;
            exportsContainer.bindEither = bindEitherInstance;
        }(moduleRegistry["Data.Either"] = moduleRegistry["Data.Either"] || {}));

        // Module: Data.Int (fromStringAsImpl)
        (function (exportsContainer) {
            "use strict";
            // Implementation for parsing a string to an integer with a specified radix.
            (exportsContainer = moduleRegistry["Data.Int"] = moduleRegistry["Data.Int"] || {}).fromStringAsImpl = function (justCreator) {
                return function (nothingValue) {
                    return function (radix) {
                        return function (inputString) {
                            let characterSetRegex;
                            // Rewriting the character set definition for clarity.
                            if (radix < 11) {
                                characterSetRegex = `[0-${radix - 1}]`;
                            } else if (radix === 11) {
                                characterSetRegex = "[0-9a]";
                            } else {
                                characterSetRegex = `[0-9a-${String.fromCharCode(86 + radix)}]`;
                            }

                            // Regex to validate the input string format.
                            const inputValidationRegex = new RegExp(`^[\\+\\-]${characterSetRegex}+`, "i");

                            if (inputValidationRegex.test(inputString)) {
                                const parsedInteger = parseInt(inputString, radix);
                                // Check if the parsed value is a valid integer (not NaN and within 32-bit int range).
                                if ((parsedInteger | 0) === parsedInteger) {
                                    return justCreator(parsedInteger);
                                }
                                return nothingValue;
                            }
                            return nothingValue;
                        };
                    };
                };
            };
        }());

        // Module: Data.Int (main definitions)
        (function (exportsContainer) {
            "use strict";
            const intModule = moduleRegistry["Data.Int"];
            moduleRegistry["Control.Category"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Boolean"];
            moduleRegistry["Data.Bounded"];
            moduleRegistry["Data.CommutativeRing"];
            moduleRegistry["Data.DivisionRing"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.EuclideanRing"];
            moduleRegistry["Data.HeytingAlgebra"];
            moduleRegistry["Data.Int.Bits"];
            const maybeModule = moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Ord"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.Ring"];
            moduleRegistry["Data.Semiring"];
            moduleRegistry["Data.Show"];
            moduleRegistry.Global;
            moduleRegistry.Math;
            moduleRegistry.Prelude;

            // Helper to get fromStringAs function using Maybe constructors.
            const fromStringAsHelper = intModule.fromStringAsImpl(maybeModule.Just.create)(maybeModule.Nothing.value);
            // Specific instance for base 10 parsing.
            const fromStringBase10 = fromStringAsHelper(10);
            exportsContainer.fromString = fromStringBase10;
            exportsContainer.fromStringAs = fromStringAsHelper;
        }(moduleRegistry["Data.Int"] = moduleRegistry["Data.Int"] || {}));

        // Module: Data.String.Common (trim implementation)
        (function (exportsContainer) {
            "use strict";
            // Provides a standard string trim function.
            (exportsContainer = moduleRegistry["Data.String.Common"] = moduleRegistry["Data.String.Common"] || {}).trim = function (inputString) {
                return inputString.trim();
            };
        }());

        // Module: Data.String.Common (main definitions)
        (function (exportsContainer) {
            "use strict";
            const stringCommonModule = moduleRegistry["Data.String.Common"];
            moduleRegistry["Data.Eq"];
            moduleRegistry["Data.Ordering"];
            moduleRegistry["Data.String.Pattern"];
            moduleRegistry.Prelude;
            exportsContainer.trim = stringCommonModule.trim;
        }(moduleRegistry["Data.String.Common"] = moduleRegistry["Data.String.Common"] || {}));

        // Module: Effect
        (function (exportsContainer) {
            "use strict";
            // `pureE` creates an Effect that immediately returns a value.
            exportsContainer.pureE = function (value) {
                return function () {
                    return value;
                };
            };
            // `bindE` chains two Effect computations.
            exportsContainer.bindE = function (firstEffect) {
                return function (continuationFunction) {
                    return function () {
                        return continuationFunction(firstEffect())();
                    };
                };
            };
        }(moduleRegistry.Effect = moduleRegistry.Effect || {}));

        // Module: Effect (main definitions)
        (function (exportsContainer) {
            "use strict";
            const effectModule = moduleRegistry.Effect;
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const applyModule = moduleRegistry["Control.Apply"];
            const bindModule = moduleRegistry["Control.Bind"];
            const monadModule = moduleRegistry["Control.Monad"];
            const functorModule = moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Monoid"];
            moduleRegistry["Data.Semigroup"];
            moduleRegistry.Prelude;

            // Monad instance for Effect.
            const monadEffectInstance = new monadModule.Monad(
                function () {
                    return applicativeEffectInstance;
                },
                function () {
                    return bindEffectInstance;
                }
            );
            // Bind instance for Effect.
            const bindEffectInstance = new bindModule.Bind(
                function () {
                    return applyEffectInstance;
                },
                effectModule.bindE
            );
            // Apply instance for Effect.
            const applyEffectInstance = new applyModule.Apply(
                function () {
                    return functorEffectInstance;
                },
                monadModule.ap(monadEffectInstance)
            );
            // Applicative instance for Effect.
            const applicativeEffectInstance = new applicativeModule.Applicative(
                function () {
                    return applyEffectInstance;
                },
                effectModule.pureE
            );
            // Functor instance for Effect.
            const functorEffectInstance = new functorModule.Functor(applicativeModule.liftA1(applicativeEffectInstance));

            exportsContainer.functorEffect = functorEffectInstance;
            exportsContainer.applyEffect = applyEffectInstance;
            exportsContainer.applicativeEffect = applicativeEffectInstance;
            exportsContainer.bindEffect = bindEffectInstance;
            exportsContainer.monadEffect = monadEffectInstance;
        }(moduleRegistry.Effect = moduleRegistry.Effect || {}));

        // Module: Effect.Aff (internal runtime implementation)
        (function (exportsContainer) {
            "use strict";
            // Internal implementation details for the Aff (asynchronous effect) monad.
            const AffInternal = (function () {
                const tagValues = {}; // Object to hold tag constants.

                // Define string tags for different Aff operations.
                const PureTag = "Pure";
                const ThrowTag = "Throw";
                const CatchTag = "Catch";
                const SyncTag = "Sync";
                const AsyncTag = "Async";
                const BindTag = "Bind";
                const BracketTag = "Bracket";
                const ForkTag = "Fork";
                const SequentialTag = "Sequential";
                const MapTag = "Map";
                const ApplyTag = "Apply";
                const AltTag = "Alt";
                const ConsTag = "Cons";      // For internal stack management.
                const ResumeTag = "Resume";  // For internal stack management.
                const ReleaseTag = "Release";
                const FinalizerTag = "Finalizer";
                const FinalizedTag = "Finalized";
                const ForkedTag = "Forked"; // Not directly used as a tag, but conceptually present.

                // Generic constructor for an Aff node.
                function AffNode(tag, val1, val2, val3) {
                    this.tag = tag;
                    this._1 = val1;
                    this._2 = val2;
                    this._3 = val3;
                }

                // Factory function to create tagged Aff nodes.
                function createTaggedAffNode(tag) {
                    const creatorFunction = function (value1, value2, value3) {
                        return new AffNode(tag, value1, value2, value3);
                    };
                    creatorFunction.tag = tag; // Store tag on creator for runtime checks.
                    return creatorFunction;
                }

                // Creates a 'Pure' node with an undefined value (representing unit).
                function createPureUnitNode() {
                    return new AffNode(PureTag, undefined);
                }

                // Executes a synchronous effect, catching and rethrowing errors asynchronously.
                function executeSyncEffect(effectFunction) {
                    try {
                        effectFunction();
                    } catch (err) {
                        setTimeout(function () {
                            throw err;
                        }, 0);
                    }
                }

                // Safely runs a synchronous effect with explicit error and success handlers.
                function runSyncEffectSafe(errorHandler, successHandler, effectThunk) {
                    try {
                        return successHandler(effectThunk());
                    } catch (err) {
                        return errorHandler(err);
                    }
                }

                // Safely runs an asynchronous effect with explicit error and success handlers.
                function runAsyncEffectSafe(errorHandler, successHandler, effectThunk) {
                    try {
                        return successHandler(effectThunk());
                    } catch (err) {
                        errorHandler(err)(); // Call the cancellation effect on synchronous error.
                        return createPureUnitNode(); // Return a dummy canceler.
                    }
                }

                // Scheduler for microtask-like queueing.
                const SchedulerQueue = (function () {
                    const queueCapacity = 1024;
                    let currentQueueSize = 0;
                    let queueHeadIndex = 0;
                    const internalTaskQueue = new Array(queueCapacity);
                    let isQueueProcessing = false;

                    function processQueueTasks() {
                        let taskToExecute;
                        isQueueProcessing = true;
                        while (currentQueueSize !== 0) {
                            currentQueueSize--;
                            taskToExecute = internalTaskQueue[queueHeadIndex];
                            internalTaskQueue[queueHeadIndex] = undefined; // Clear reference to avoid memory leaks.
                            queueHeadIndex = (queueHeadIndex + 1) % queueCapacity;
                            taskToExecute();
                        }
                        isQueueProcessing = false;
                    }

                    return {
                        isDraining: function () {
                            return isQueueProcessing;
                        },
                        enqueue: function (task) {
                            if (currentQueueSize === queueCapacity) {
                                // If queue is full, drain it first to make space.
                                const prevProcessingState = isQueueProcessing;
                                processQueueTasks();
                                isQueueProcessing = prevProcessingState; // Restore state.
                            }
                            internalTaskQueue[(queueHeadIndex + currentQueueSize) % queueCapacity] = task;
                            currentQueueSize++;
                            if (!isQueueProcessing) {
                                processQueueTasks();
                            }
                        }
                    };
                })();

                // Enum for FiberRunner states.
                const FiberState = {
                    Initial: 0,
                    Running: 1,
                    Applying: 2,
                    Binding: 3,
                    AsyncWaiting: 4,
                    Completed: 5,
                    Killed: 6
                };

                // The core FiberRunner that interprets Aff computations.
                function FiberRunner(eitherInterface, supervisorInstance, affComputation) {
                    let currentExecutionId = 0;
                    let fiberCurrentState = FiberState.Initial;
                    let fiberCurrentResult = affComputation;
                    let fiberCurrentError = null;
                    let fiberKillReason = null;
                    let catchStack = null;
                    let bindStack = null;
                    let bracketStack = null;
                    let activeBracketCount = 0;
                    let activeFinalizerCount = 0;
                    let fiberCleanupHandlers = null;
                    let shouldRethrowUnhandled = true;

                    // Main loop for stepping the fiber execution.
                    function stepFiber(executionId) {
                        let nextCatchBlock = null;
                        let nextBindStep = null;
                        let nextBracketNode = null;

                        while (true) {
                            switch (fiberCurrentState) {
                                case FiberState.Binding:
                                    fiberCurrentState = FiberState.Running;
                                    fiberCurrentResult = catchStack(fiberCurrentResult);
                                    if (bindStack === null) {
                                        catchStack = null;
                                    } else {
                                        catchStack = bindStack._1;
                                        bindStack = bindStack._2;
                                    }
                                    break;
                                case FiberState.Applying:
                                    if (eitherInterface.isLeft(fiberCurrentResult)) {
                                        fiberCurrentState = FiberState.Completed;
                                        fiberCurrentError = fiberCurrentResult;
                                        fiberCurrentResult = null;
                                    } else {
                                        if (catchStack === null) {
                                            fiberCurrentState = FiberState.Completed;
                                        } else {
                                            fiberCurrentState = FiberState.Binding;
                                            fiberCurrentResult = eitherInterface.fromRight(fiberCurrentResult);
                                        }
                                    }
                                    break;
                                case FiberState.Running:
                                    switch (fiberCurrentResult.tag) {
                                        case BindTag:
                                            if (catchStack) {
                                                bindStack = new AffNode(ConsTag, catchStack, bindStack);
                                            }
                                            catchStack = fiberCurrentResult._2;
                                            fiberCurrentState = FiberState.Running;
                                            fiberCurrentResult = fiberCurrentResult._1;
                                            break;
                                        case PureTag:
                                            if (catchStack === null) {
                                                fiberCurrentState = FiberState.Completed;
                                            } else {
                                                fiberCurrentState = FiberState.Binding;
                                                fiberCurrentResult = fiberCurrentResult._1;
                                            }
                                            break;
                                        case SyncTag:
                                            fiberCurrentState = FiberState.Applying;
                                            fiberCurrentResult = runSyncEffectSafe(eitherInterface.left, eitherInterface.right, fiberCurrentResult._1);
                                            break;
                                        case AsyncTag:
                                            fiberCurrentState = FiberState.AsyncWaiting;
                                            fiberCurrentResult = runAsyncEffectSafe(
                                                eitherInterface.left,
                                                fiberCurrentResult._1,
                                                function (failureHandler) {
                                                    return function () {
                                                        if (currentExecutionId === executionId) {
                                                            currentExecutionId++;
                                                            SchedulerQueue.enqueue(function () {
                                                                if (currentExecutionId === executionId + 1) {
                                                                    fiberCurrentState = FiberState.Applying;
                                                                    fiberCurrentResult = failureHandler;
                                                                    stepFiber(currentExecutionId);
                                                                }
                                                            });
                                                        }
                                                    };
                                                }
                                            );
                                            return; // Exit loop, fiber will resume asynchronously.
                                        case ThrowTag:
                                            fiberCurrentState = FiberState.Completed;
                                            fiberCurrentError = eitherInterface.left(fiberCurrentResult._1);
                                            fiberCurrentResult = null;
                                            break;
                                        case CatchTag:
                                            bracketStack = new AffNode(ConsTag, fiberCurrentResult, (catchStack === null ? bracketStack : new AffNode(ResumeTag, catchStack, bindStack, fiberKillReason)), fiberKillReason);
                                            catchStack = null;
                                            bindStack = null;
                                            fiberCurrentState = FiberState.Running;
                                            fiberCurrentResult = fiberCurrentResult._1;
                                            break;
                                        case BracketTag:
                                            activeBracketCount++;
                                            bracketStack = new AffNode(ConsTag, fiberCurrentResult, (catchStack === null ? bracketStack : new AffNode(ResumeTag, catchStack, bindStack, fiberKillReason)), fiberKillReason);
                                            catchStack = null;
                                            bindStack = null;
                                            fiberCurrentState = FiberState.Running;
                                            fiberCurrentResult = fiberCurrentResult._1;
                                            break;
                                        case ForkTag:
                                            fiberCurrentState = FiberState.Applying;
                                            nextCatchBlock = FiberRunner(eitherInterface, supervisorInstance, fiberCurrentResult._2);
                                            if (supervisorInstance) {
                                                supervisorInstance.register(nextCatchBlock);
                                            }
                                            nextCatchBlock.run();
                                            fiberCurrentResult = eitherInterface.right(nextCatchBlock);
                                            break;
                                        case SequentialTag:
                                            fiberCurrentState = FiberState.Running;
                                            fiberCurrentResult = runSequentialAff(eitherInterface, supervisorInstance, fiberCurrentResult._1);
                                            break;
                                        default:
                                            fiberCurrentState = FiberState.Completed;
                                            break;
                                    }
                                    break;
                                case FiberState.Completed:
                                    nextCatchBlock = null;
                                    nextBindStep = null;
                                    if (bracketStack === null) {
                                        fiberCurrentState = FiberState.Killed;
                                        fiberCurrentResult = fiberKillReason || fiberCurrentError || fiberCurrentResult;
                                    } else {
                                        nextCatchBlock = bracketStack._3;
                                        nextBracketNode = bracketStack._1;
                                        bracketStack = bracketStack._2;
                                        switch (nextBracketNode.tag) {
                                            case CatchTag:
                                                if (fiberKillReason && fiberKillReason !== nextCatchBlock) {
                                                    fiberCurrentState = FiberState.Completed;
                                                } else if (fiberCurrentError) {
                                                    fiberCurrentState = FiberState.Running;
                                                    fiberCurrentResult = nextBracketNode._2(eitherInterface.fromLeft(fiberCurrentError));
                                                    fiberCurrentError = null;
                                                } else {
                                                    fiberCurrentState = FiberState.Completed;
                                                }
                                                break;
                                            case ResumeTag:
                                                if (fiberKillReason && fiberKillReason !== nextCatchBlock) {
                                                    fiberCurrentState = FiberState.Completed;
                                                } else if (fiberCurrentError) {
                                                    fiberCurrentState = FiberState.Completed;
                                                } else {
                                                    catchStack = nextBracketNode._1;
                                                    bindStack = nextBracketNode._2;
                                                    fiberCurrentState = FiberState.Binding;
                                                    fiberCurrentResult = eitherInterface.fromRight(fiberCurrentResult);
                                                }
                                                break;
                                            case BracketTag:
                                                activeBracketCount--;
                                                if (fiberCurrentError === null) {
                                                    nextBindStep = eitherInterface.fromRight(fiberCurrentResult);
                                                    bracketStack = new AffNode(ConsTag, new AffNode(ReleaseTag, nextBracketNode._2, nextBindStep), bracketStack, nextCatchBlock);
                                                    fiberCurrentState = FiberState.Running;
                                                    fiberCurrentResult = nextBracketNode._3(nextBindStep);
                                                } else {
                                                    fiberCurrentState = FiberState.Completed;
                                                }
                                                break;
                                            case ReleaseTag:
                                                activeFinalizerCount++;
                                                bracketStack = new AffNode(ConsTag, new AffNode(FinalizedTag, fiberCurrentResult, fiberCurrentError), bracketStack, nextCatchBlock);
                                                fiberCurrentState = FiberState.Running;
                                                fiberCurrentResult = fiberKillReason && fiberKillReason !== nextCatchBlock ?
                                                    nextBracketNode._1.killed(eitherInterface.fromLeft(fiberKillReason))(nextBracketNode._2) :
                                                    fiberCurrentError ?
                                                    nextBracketNode._1.failed(eitherInterface.fromLeft(fiberCurrentError))(nextBracketNode._2) :
                                                    nextBracketNode._1.completed(eitherInterface.fromRight(fiberCurrentResult))(nextBracketNode._2);
                                                fiberCurrentError = null;
                                                break;
                                            case FinalizerTag:
                                                activeFinalizerCount++;
                                                bracketStack = new AffNode(ConsTag, new AffNode(FinalizedTag, fiberCurrentResult, fiberCurrentError), bracketStack, nextCatchBlock);
                                                fiberCurrentState = FiberState.Running;
                                                fiberCurrentResult = nextBracketNode._1;
                                                break;
                                            case FinalizedTag:
                                                activeFinalizerCount--;
                                                fiberCurrentState = FiberState.Completed;
                                                fiberCurrentResult = nextBracketNode._1;
                                                fiberCurrentError = nextBracketNode._2;
                                                break;
                                            default:
                                                fiberCurrentState = FiberState.Killed;
                                                fiberCurrentResult = fiberCurrentError || fiberCurrentResult;
                                                break;
                                        }
                                    }
                                    break;
                                case FiberState.Killed:
                                    if (fiberCleanupHandlers) {
                                        for (const handlerKey in fiberCleanupHandlers) {
                                            if (Object.prototype.hasOwnProperty.call(fiberCleanupHandlers, handlerKey)) {
                                                shouldRethrowUnhandled = shouldRethrowUnhandled && fiberCleanupHandlers[handlerKey].rethrow;
                                                executeSyncEffect(fiberCleanupHandlers[handlerKey].handler(fiberCurrentResult));
                                            }
                                        }
                                    }
                                    fiberCleanupHandlers = null;
                                    if (fiberKillReason && fiberCurrentError) {
                                        setTimeout(function () {
                                            throw eitherInterface.fromLeft(fiberCurrentError);
                                        }, 0);
                                    } else if (eitherInterface.isLeft(fiberCurrentResult) && shouldRethrowUnhandled) {
                                        setTimeout(function () {
                                            if (shouldRethrowUnhandled) {
                                                throw eitherInterface.fromLeft(fiberCurrentResult);
                                            }
                                        }, 0);
                                    }
                                    return;
                                case FiberState.Initial:
                                    fiberCurrentState = FiberState.Running;
                                    break;
                                case FiberState.AsyncWaiting:
                                    return;
                            }
                        }
                    }

                    // Registers a cleanup handler that runs when the fiber completes or is killed.
                    function addCleanupHandler(handlerConfiguration) {
                        return function () {
                            if (fiberCurrentState === FiberState.Killed) {
                                shouldRethrowUnhandled = shouldRethrowUnhandled && handlerConfiguration.rethrow;
                                handlerConfiguration.handler(fiberCurrentResult)();
                                return function () {}; // Return a no-op canceler.
                            }
                            const handlerIdentifier = activeFinalizerCount++;
                            fiberCleanupHandlers = fiberCleanupHandlers || {};
                            fiberCleanupHandlers[handlerIdentifier] = handlerConfiguration;
                            return function () {
                                if (fiberCleanupHandlers !== null) {
                                    delete fiberCleanupHandlers[handlerIdentifier];
                                }
                            };
                        };
                    }

                    return {
                        kill: function (killReason, completionCallback) {
                            return function () {
                                if (fiberCurrentState === FiberState.Killed) {
                                    completionCallback(eitherInterface.right(undefined))();
                                    return function () {};
                                }
                                const cleanupCanceler = addCleanupHandler({
                                    rethrow: false,
                                    handler: function () {
                                        return completionCallback(eitherInterface.right(undefined));
                                    }
                                })();
                                switch (fiberCurrentState) {
                                    case FiberState.Initial:
                                        fiberKillReason = eitherInterface.left(killReason);
                                        fiberCurrentState = FiberState.Killed;
                                        fiberCurrentResult = fiberKillReason;
                                        stepFiber(currentExecutionId);
                                        break;
                                    case FiberState.AsyncWaiting:
                                        if (fiberKillReason === null) {
                                            fiberKillReason = eitherInterface.left(killReason);
                                        }
                                        if (activeBracketCount === 0) {
                                            if (fiberCurrentState === FiberState.AsyncWaiting) {
                                                bracketStack = new AffNode(ConsTag, new AffNode(FinalizerTag, fiberCurrentResult(killReason)), bracketStack, fiberKillReason);
                                            }
                                            fiberCurrentState = FiberState.Completed;
                                            fiberCurrentResult = null;
                                            fiberCurrentError = null;
                                            stepFiber(++currentExecutionId);
                                        }
                                        break;
                                    default:
                                        if (fiberKillReason === null) {
                                            fiberKillReason = eitherInterface.left(killReason);
                                        }
                                        if (activeBracketCount === 0) {
                                            fiberCurrentState = FiberState.Completed;
                                            fiberCurrentResult = null;
                                            fiberCurrentError = null;
                                            stepFiber(currentExecutionId);
                                        }
                                }
                                return cleanupCanceler;
                            };
                        },
                        join: function (completionHandler) {
                            return function () {
                                const cleanupCanceler = addCleanupHandler({
                                    rethrow: false,
                                    handler: completionHandler
                                })();
                                if (fiberCurrentState === FiberState.Initial) {
                                    stepFiber(currentExecutionId);
                                }
                                return cleanupCanceler;
                            };
                        },
                        onComplete: addCleanupHandler,
                        isSuspended: function () {
                            return fiberCurrentState === FiberState.Initial;
                        },
                        run: function () {
                            if (fiberCurrentState === FiberState.Initial) {
                                if (SchedulerQueue.isDraining()) {
                                    stepFiber(currentExecutionId);
                                } else {
                                    SchedulerQueue.enqueue(function () {
                                        stepFiber(currentExecutionId);
                                    });
                                }
                            }
                        }
                    };
                }

                // Runs a parallel Aff computation.
                function runParAff(eitherInterface, supervisorInstance, parAffComputation, callback) {
                    let fiberIdCounter = 0;
                    const activeFibers = {};
                    let pendingCompletionHandlers = 0;
                    const completionHandlersMap = {};
                    const earlyTerminationError = new Error("[ParAff] Early exit triggered");
                    let globalKillReason = null;
                    const affEitherApi = eitherInterface;

                    // Kills child fibers recursively within a parallel computation graph.
                    function killChildFibers(reason, computationNode, finalCompletionCallback) {
                        let outstandingKills = 0;
                        const killTrackers = {};

                        let currentNode = computationNode;
                        let traversalStack = null;
                        let prevTraversalStack = null;
                        let currentStackDepth = 0;

                        // Traverse the computation graph to find parallel forks.
                        while (true) {
                            switch (currentNode.tag) {
                                case SequentialTag:
                                    if (currentNode._3 === affEitherApi && activeFibers[currentNode._1]) {
                                        const fiberToKill = activeFibers[currentNode._1];
                                        killTrackers[currentStackDepth++] = fiberToKill.kill(reason, function (killResult) {
                                            return function () {
                                                outstandingKills--;
                                                if (outstandingKills === 0) {
                                                    finalCompletionCallback(killResult)();
                                                }
                                            };
                                        });
                                    }
                                    if (traversalStack === null) break;
                                    currentNode = traversalStack._2;
                                    if (prevTraversalStack === null) {
                                        traversalStack = null;
                                    } else {
                                        traversalStack = prevTraversalStack._1;
                                        prevTraversalStack = prevTraversalStack._2;
                                    }
                                    break;
                                case MapTag:
                                    currentNode = currentNode._2;
                                    break;
                                case ApplyTag:
                                case AltTag:
                                    if (traversalStack) {
                                        prevTraversalStack = new AffNode(ConsTag, traversalStack, prevTraversalStack);
                                    }
                                    traversalStack = currentNode;
                                    currentNode = currentNode._1; // Descend left branch.
                                    break;
                                default:
                                    if (traversalStack === null) break;
                                    currentNode = traversalStack._2;
                                    if (prevTraversalStack === null) {
                                        traversalStack = null;
                                    } else {
                                        traversalStack = prevTraversalStack._1;
                                        prevTraversalStack = prevTraversalStack._2;
                                    }
                                    break;
                            }
                            if (currentNode.tag === SequentialTag && currentNode._3 === affEitherApi && activeFibers[currentNode._1]) {
                                outstandingKills++;
                            }
                            if (traversalStack === null && currentNode.tag !== MapTag && currentNode.tag !== ApplyTag && currentNode.tag !== AltTag) break;
                        }

                        if (outstandingKills === 0) {
                            finalCompletionCallback(eitherInterface.right(undefined))();
                        } else {
                            for (let i = 0; i < currentStackDepth; i++) {
                                if (killTrackers[i]) {
                                    killTrackers[i] = killTrackers[i]();
                                }
                            }
                        }
                        return killTrackers;
                    }

                    // Handles the completion of a child fiber in a parallel computation.
                    function handleFiberCompletion(fiberInfo) {
                        return function (fiberResult) {
                            return function () {
                                delete activeFibers[fiberInfo._1];
                                fiberInfo._3 = fiberResult;

                                (function propagateResult(currentResult, currentComputation, parentStack) {
                                    let leftResult, rightResult;
                                    if (globalKillReason !== null) return; // Early exit check.

                                    if (affEitherApi.isLeft(currentResult)) {
                                        leftResult = currentResult;
                                        rightResult = null;
                                    } else {
                                        rightResult = currentResult;
                                        leftResult = null;
                                    }

                                    while (true) {
                                        if (globalKillReason !== null) return;

                                        if (currentComputation === null) {
                                            callback(leftResult || rightResult)();
                                            return;
                                        }

                                        if (currentComputation._3 !== affEitherApi) {
                                            // This node has already been processed or is still pending.
                                        }

                                        switch (currentComputation.tag) {
                                            case MapTag:
                                                if (leftResult) {
                                                    currentComputation._3 = leftResult;
                                                } else {
                                                    currentComputation._3 = affEitherApi.right(currentComputation._1(affEitherApi.fromRight(rightResult)));
                                                }
                                                break;
                                            case ApplyTag:
                                                const leftBranchResult = currentComputation._1._3;
                                                const rightBranchResult = currentComputation._2._3;

                                                if (leftResult) {
                                                    currentComputation._3 = leftResult;
                                                    if (currentComputation === leftBranchResult && rightBranchResult === affEitherApi) {
                                                        const handlerId = pendingCompletionHandlers++;
                                                        completionHandlersMap[handlerId] = killChildFibers(earlyTerminationError, currentComputation._2, function () {
                                                            return function () {
                                                                delete completionHandlersMap[handlerId];
                                                                if (leftResult) propagateResult(leftResult, parentStack?._1, parentStack?._2);
                                                            };
                                                        });
                                                        if (completionHandlersMap[handlerId]) return;
                                                    } else if (currentComputation === rightBranchResult && leftBranchResult === affEitherApi) {
                                                        const handlerId = pendingCompletionHandlers++;
                                                        completionHandlersMap[handlerId] = killChildFibers(earlyTerminationError, currentComputation._1, function () {
                                                            return function () {
                                                                delete completionHandlersMap[handlerId];
                                                                if (leftResult) propagateResult(leftResult, parentStack?._1, parentStack?._2);
                                                            };
                                                        });
                                                        if (completionHandlersMap[handlerId]) return;
                                                    }
                                                } else {
                                                    if (leftBranchResult !== affEitherApi && rightBranchResult !== affEitherApi) {
                                                        if (affEitherApi.isLeft(leftBranchResult) || affEitherApi.isLeft(rightBranchResult)) {
                                                            currentComputation._3 = leftBranchResult;
                                                        } else {
                                                            currentComputation._3 = affEitherApi.right(affEitherApi.fromRight(leftBranchResult)(affEitherApi.fromRight(rightBranchResult)));
                                                        }
                                                    } else {
                                                        return;
                                                    }
                                                }
                                                break;
                                            case AltTag:
                                                const altLeftResult = currentComputation._1._3;
                                                const altRightResult = currentComputation._2._3;

                                                if (altLeftResult !== affEitherApi && !affEitherApi.isLeft(altLeftResult)) {
                                                    currentComputation._3 = altLeftResult;
                                                    const handlerId = pendingCompletionHandlers++;
                                                    completionHandlersMap[handlerId] = killChildFibers(earlyTerminationError, currentComputation._2, function () {
                                                        return function () {
                                                            delete completionHandlersMap[handlerId];
                                                            propagateResult(altLeftResult, parentStack?._1, parentStack?._2);
                                                        };
                                                    });
                                                    if (completionHandlersMap[handlerId]) return;
                                                } else if (altRightResult !== affEitherApi && !affEitherApi.isLeft(altRightResult)) {
                                                    currentComputation._3 = altRightResult;
                                                    const handlerId = pendingCompletionHandlers++;
                                                    completionHandlersMap[handlerId] = killChildFibers(earlyTerminationError, currentComputation._1, function () {
                                                        return function () {
                                                            delete completionHandlersMap[handlerId];
                                                            propagateResult(altRightResult, parentStack?._1, parentStack?._2);
                                                        };
                                                    });
                                                    if (completionHandlersMap[handlerId]) return;
                                                } else if (altLeftResult !== affEitherApi && altRightResult !== affEitherApi) {
                                                    leftResult = (altLeftResult === currentResult) ? altRightResult : altLeftResult;
                                                    currentComputation._3 = leftResult;
                                                } else {
                                                    return;
                                                }
                                                break;
                                            default:
                                                currentComputation._3 = currentResult;
                                                break;
                                        }
                                        if (parentStack === null) {
                                            currentComputation = null;
                                        } else {
                                            currentComputation = parentStack._1;
                                            parentStack = parentStack._2;
                                        }
                                    }
                                })(fiberResult, fiberInfo._2._1, fiberInfo._2._2);
                            };
                        };
                    }

                    return function () {
                        let currentNode, currentParserStack = null, previousParserStack = null;
                        let parserState = FiberState.Running;

                        while (true) {
                            switch (parserState) {
                                case FiberState.Running:
                                    switch (parAffComputation.tag) {
                                        case MapTag:
                                            if (currentParserStack) {
                                                previousParserStack = new AffNode(ConsTag, currentParserStack, previousParserStack);
                                            }
                                            currentParserStack = new AffNode(MapTag, parAffComputation._1, affEitherApi, affEitherApi);
                                            parAffComputation = parAffComputation._2;
                                            break;
                                        case ApplyTag:
                                            if (currentParserStack) {
                                                previousParserStack = new AffNode(ConsTag, currentParserStack, previousParserStack);
                                            }
                                            currentParserStack = new AffNode(ApplyTag, affEitherApi, parAffComputation._2, affEitherApi);
                                            parAffComputation = parAffComputation._1;
                                            break;
                                        case AltTag:
                                            if (currentParserStack) {
                                                previousParserStack = new AffNode(ConsTag, currentParserStack, previousParserStack);
                                            }
                                            currentParserStack = new AffNode(AltTag, affEitherApi, parAffComputation._2, affEitherApi);
                                            parAffComputation = parAffComputation._1;
                                            break;
                                        default:
                                            currentNode = fiberIdCounter++;
                                            parserState = FiberState.Completed;
                                            parAffComputation = new AffNode(SequentialTag, currentNode, new AffNode(ConsTag, currentParserStack, previousParserStack), affEitherApi);
                                            const newFiber = FiberRunner(eitherInterface, supervisorInstance, parAffComputation);
                                            newFiber.onComplete({
                                                rethrow: false,
                                                handler: handleFiberCompletion(parAffComputation)
                                            })();
                                            activeFibers[currentNode] = newFiber;
                                            if (supervisorInstance) {
                                                supervisorInstance.register(newFiber);
                                            }
                                            newFiber.run();
                                            break;
                                    }
                                    break;
                                case FiberState.Completed:
                                    if (currentParserStack === null) break;
                                    if (currentParserStack._1 === affEitherApi) {
                                        currentParserStack._1 = parAffComputation;
                                        parserState = FiberState.Running;
                                        parAffComputation = currentParserStack._2;
                                        currentParserStack._2 = affEitherApi;
                                    } else {
                                        currentParserStack._2 = parAffComputation;
                                        parAffComputation = currentParserStack;
                                        if (previousParserStack === null) {
                                            currentParserStack = null;
                                        } else {
                                            currentParserStack = previousParserStack._1;
                                            previousParserStack = previousParserStack._2;
                                        }
                                    }
                                    break;
                            }
                            if (currentParserStack === null) break;
                        }

                        globalKillReason = parAffComputation;
                        for (let i = 0; i < fiberIdCounter; i++) {
                            activeFibers[i].run();
                        }
                    };
                }

                // Runs an Aff computation sequentially.
                function runSequentialAff(eitherInterface, supervisorInstance, affComputation) {
                    return new AffNode(AsyncTag, function (callback) {
                        return function () {
                            return runParAff(eitherInterface, supervisorInstance, affComputation, callback);
                        };
                    });
                }

                // Expose internal constructors and functions.
                tagValues.EMPTY = exportsContainer;
                tagValues.Pure = createTaggedAffNode(PureTag);
                tagValues.Throw = createTaggedAffNode(ThrowTag);
                tagValues.Catch = createTaggedAffNode(CatchTag);
                tagValues.Sync = createTaggedAffNode(SyncTag);
                tagValues.Async = createTaggedAffNode(AsyncTag);
                tagValues.Bind = createTaggedAffNode(BindTag);
                tagValues.Bracket = createTaggedAffNode(BracketTag);
                tagValues.Fork = createTaggedAffNode(ForkTag);
                tagValues.Seq = createTaggedAffNode(SequentialTag);
                tagValues.ParMap = createTaggedAffNode(MapTag);
                tagValues.ParApply = createTaggedAffNode(ApplyTag);
                tagValues.ParAlt = createTaggedAffNode(AltTag);
                tagValues.Fiber = FiberRunner;
                tagValues.Supervisor = function (eitherApi) {
                    const registeredFibers = {};
                    let nextAvailableFiberId = 0;
                    let currentlyActiveFiberCount = 0;

                    return {
                        register: function (fiberInstance) {
                            const id = nextAvailableFiberId++;
                            fiberInstance.onComplete({
                                rethrow: true,
                                handler: function (result) {
                                    return function () {
                                        currentlyActiveFiberCount--;
                                        delete registeredFibers[id];
                                        if (eitherApi.isLeft(result) && eitherApi.fromLeft(result)) {
                                            setTimeout(function () {
                                                throw eitherApi.fromLeft(result);
                                            }, 0);
                                        }
                                    };
                                }
                            })();
                            registeredFibers[id] = fiberInstance;
                            currentlyActiveFiberCount++;
                        },
                        isEmpty: function () {
                            return currentlyActiveFiberCount === 0;
                        },
                        killAll: function (killReason, finalCompletionCallback) {
                            return function () {
                                let pendingKillOperations = 0;
                                const killCancelationHandlers = {};

                                function initiateKill(fiberId) {
                                    killCancelationHandlers[fiberId] = registeredFibers[fiberId].kill(killReason, function (killResult) {
                                        return function () {
                                            delete killCancelationHandlers[fiberId];
                                            pendingKillOperations--;
                                            if (eitherApi.isLeft(killResult) && eitherApi.fromLeft(killResult)) {
                                                setTimeout(function () {
                                                    throw eitherApi.fromLeft(killResult);
                                                }, 0);
                                            }
                                            if (pendingKillOperations === 0) {
                                                finalCompletionCallback();
                                            }
                                        };
                                    })();
                                }

                                for (const fiberId in registeredFibers) {
                                    if (Object.prototype.hasOwnProperty.call(registeredFibers, fiberId)) {
                                        pendingKillOperations++;
                                        initiateKill(fiberId);
                                    }
                                }

                                // Clear the registry and reset counters.
                                Object.keys(registeredFibers).forEach(key => delete registeredFibers[key]);
                                nextAvailableFiberId = 0;
                                currentlyActiveFiberCount = 0;

                                return new AffNode(SyncTag, function () {
                                    for (const id in killCancelationHandlers) {
                                        if (Object.prototype.hasOwnProperty.call(killCancelationHandlers, id)) {
                                            killCancelationHandlers[id]();
                                        }
                                    }
                                });
                            };
                        }
                    };
                };
                tagValues.Scheduler = SchedulerQueue;
                tagValues.nonCanceler = createPureUnitNode();

                return tagValues;
            })();

            exportsContainer._pure = AffInternal.Pure;
            exportsContainer._map = function (mapperFunction) {
                return function (affValue) {
                    if (affValue.tag === AffInternal.Pure.tag) {
                        return AffInternal.Pure(mapperFunction(affValue._1));
                    } else {
                        return AffInternal.Bind(affValue, function (value) {
                            return AffInternal.Pure(mapperFunction(value));
                        });
                    }
                };
            };
            exportsContainer._bind = function (affValue) {
                return function (bindFunction) {
                    return AffInternal.Bind(affValue, bindFunction);
                };
            };
            exportsContainer._liftEffect = AffInternal.Sync;
            exportsContainer._parAffMap = function (mapperFunction) {
                return function (parAffValue) {
                    return AffInternal.ParMap(mapperFunction, parAffValue);
                };
            };
            exportsContainer._parAffApply = function (parAffFunction) {
                return function (parAffValue) {
                    return AffInternal.ParApply(parAffFunction, parAffValue);
                };
            };
            exportsContainer.makeAff = AffInternal.Async;
            exportsContainer._makeFiber = function (eitherInterface, supervisorInstance, affComputation) {
                return function () {
                    return AffInternal.Fiber(eitherInterface, supervisorInstance, affComputation);
                };
            };
            exportsContainer._sequential = AffInternal.Seq;
        }(moduleRegistry["Effect.Aff"] = moduleRegistry["Effect.Aff"] || {}));

        // Module: Effect.Class
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Category"];
            moduleRegistry["Control.Monad"];
            moduleRegistry.Effect;
            exportsContainer.liftEffect = function (monadEffectInstance) {
                return monadEffectInstance.liftEffect;
            };
            // Constructor for the MonadEffect type class.
            exportsContainer.MonadEffect = function (monadInstance, liftEffectFunction) {
                this.Monad0 = monadInstance;
                this.liftEffect = liftEffectFunction;
            };
        }(moduleRegistry["Effect.Class"] = moduleRegistry["Effect.Class"] || {}));

        // Module: Effect.Ref
        (function (exportsContainer) {
            "use strict";
            // Creates a new mutable reference.
            exportsContainer.new = function (initialValue) {
                return function () {
                    return {
                        value: initialValue
                    };
                };
            };
            // Reads the current value from a mutable reference.
            exportsContainer.read = function (refObject) {
                return function () {
                    return refObject.value;
                };
            };
            // Writes a new value to a mutable reference.
            exportsContainer.write = function (newValue) {
                return function (refObject) {
                    return function () {
                        refObject.value = newValue;
                        return {}; // Returns unit.
                    };
                };
            };
        }(moduleRegistry["Effect.Ref"] = moduleRegistry["Effect.Ref"] || {}));

        // Module: Effect.Ref (main definitions)
        (function (exportsContainer) {
            "use strict";
            const refModule = moduleRegistry["Effect.Ref"];
            moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry.Effect;
            moduleRegistry.Prelude;
            exportsContainer.new = refModule.new;
            exportsContainer.read = refModule.read;
            exportsContainer.write = refModule.write;
        }(moduleRegistry["Effect.Ref"] = moduleRegistry["Effect.Ref"] || {}));

        // Module: Control.Parallel.Class
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Alternative"];
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Apply"];
            moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Monad.Cont.Trans"];
            moduleRegistry["Control.Monad.Except.Trans"];
            moduleRegistry["Control.Monad.Maybe.Trans"];
            moduleRegistry["Control.Monad.Reader.Trans"];
            moduleRegistry["Control.Monad.Writer.Trans"];
            moduleRegistry["Control.Plus"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Either"];
            moduleRegistry["Data.Function"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Functor.Compose"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Newtype"];
            moduleRegistry["Data.Unit"];
            moduleRegistry["Effect.Class"];
            moduleRegistry["Effect.Ref"];
            moduleRegistry.Prelude;
            exportsContainer.parallel = function (parallelInstance) {
                return parallelInstance.parallel;
            };
            exportsContainer.sequential = function (parallelInstance) {
                return parallelInstance.sequential;
            };
            // Constructor for the Parallel type class.
            exportsContainer.Parallel = function (applicativeInstance, monadInstance, parallelFunction, sequentialFunction) {
                this.Applicative1 = applicativeInstance;
                this.Monad0 = monadInstance;
                this.parallel = parallelFunction;
                this.sequential = sequentialFunction;
            };
        }(moduleRegistry["Control.Parallel.Class"] = moduleRegistry["Control.Parallel.Class"] || {}));

        // Module: Control.Parallel
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Control.Alternative"];
            moduleRegistry["Control.Apply"];
            const categoryModule = moduleRegistry["Control.Category"];
            const parallelClassModule = moduleRegistry["Control.Parallel.Class"];
            moduleRegistry["Control.Semigroupoid"];
            const foldableModule = moduleRegistry["Data.Foldable"];
            moduleRegistry["Data.Traversable"];
            moduleRegistry.Prelude;

            // Helper for parallel traversal of a foldable structure.
            const parTraverseHelper = function (parallelInstance) {
                return function (foldableInstance) {
                    return function (actionFunction) {
                        return function (collection) {
                            return parallelClassModule.sequential(parallelInstance)(
                                foldableModule.traverse_(parallelInstance.Applicative1())(foldableInstance)(function (item) {
                                    return parallelClassModule.parallel(parallelInstance)(actionFunction(item));
                                })(collection)
                            );
                        };
                    };
                };
            };
            exportsContainer.parTraverse_ = parTraverseHelper;
            // `parSequence_` sequences a collection of parallel computations, discarding results.
            exportsContainer.parSequence_ = function (parallelInstance) {
                return function (foldableInstance) {
                    return parTraverseHelper(parallelInstance)(foldableInstance)(categoryModule.identity(categoryModule.categoryFn));
                };
            };
        }(moduleRegistry["Control.Parallel"] = moduleRegistry["Control.Parallel"] || {}));

        // Module: Effect.Exception
        (function (exportsContainer) {
            "use strict";
            // Creates a new Error object.
            exportsContainer.error = function (message) {
                return new Error(message);
            };
            // Returns an Effect that throws a given exception.
            exportsContainer.throwException = function (exception) {
                return function () {
                    throw exception;
                };
            };
        }(moduleRegistry["Effect.Exception"] = moduleRegistry["Effect.Exception"] || {}));

        // Module: Effect.Exception (main definitions)
        (function (exportsContainer) {
            "use strict";
            const exceptionModule = moduleRegistry["Effect.Exception"];
            moduleRegistry["Control.Applicative"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.Either"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Show"];
            moduleRegistry.Effect;
            moduleRegistry.Prelude;
            exportsContainer.throw = function (message) {
                return exceptionModule.throwException(exceptionModule.error(message));
            };
        }(moduleRegistry["Effect.Exception"] = moduleRegistry["Effect.Exception"] || {}));

        // Module: Effect.Aff (main definitions)
        (function (exportsContainer) {
            "use strict";
            const affModule = moduleRegistry["Effect.Aff"];
            moduleRegistry["Control.Alt"];
            moduleRegistry["Control.Alternative"];
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const applyModule = moduleRegistry["Control.Apply"];
            const bindModule = moduleRegistry["Control.Bind"];
            moduleRegistry["Control.Lazy"];
            const monadModule = moduleRegistry["Control.Monad"];
            moduleRegistry["Control.Monad.Error.Class"];
            moduleRegistry["Control.Monad.Rec.Class"];
            const parallelModule = moduleRegistry["Control.Parallel"];
            const parallelClassModule = moduleRegistry["Control.Parallel.Class"];
            moduleRegistry["Control.Plus"];
            moduleRegistry["Control.Semigroupoid"];
            const eitherModule = moduleRegistry["Data.Either"];
            const foldableModule = moduleRegistry["Data.Foldable"];
            const functionModule = moduleRegistry["Data.Function"];
            moduleRegistry["Data.Function.Uncurried"];
            const functorModule = moduleRegistry["Data.Functor"];
            const monoidModule = moduleRegistry["Data.Monoid"];
            moduleRegistry["Data.Newtype"];
            const semigroupModule = moduleRegistry["Data.Semigroup"];
            moduleRegistry["Data.Time.Duration"];
            const unitModule = moduleRegistry["Data.Unit"];
            const effectModule = moduleRegistry.Effect;
            const effectClassModule = moduleRegistry["Effect.Class"];
            moduleRegistry["Effect.Exception"];
            moduleRegistry["Effect.Unsafe"];
            const partialUnsafeModule = moduleRegistry["Partial.Unsafe"];
            moduleRegistry.Prelude;
            const unsafeCoerceModule = moduleRegistry["Unsafe.Coerce"];

            // Functor instance for ParAff.
            const functorParAffInstance = new functorModule.Functor(affModule._parAffMap);
            // Functor instance for Aff.
            const functorAffInstance = new functorModule.Functor(affModule._map);

            // An API object providing Either operations for the Aff runtime.
            const eitherApiForAff = {
                isLeft: function (eitherValue) {
                    if (eitherValue instanceof eitherModule.Left) return true;
                    if (eitherValue instanceof eitherModule.Right) return false;
                    throw new Error(`Invalid Either value for isLeft check: ${eitherValue?.constructor?.name}`);
                },
                fromLeft: function (eitherValue) {
                    if (eitherValue instanceof eitherModule.Left) return eitherValue.value0;
                    if (eitherValue instanceof eitherModule.Right) return partialUnsafeModule.unsafeCrashWith("unsafeFromLeft: Expected Left, received Right");
                    throw new Error(`Invalid Either value for fromLeft: ${eitherValue?.constructor?.name}`);
                },
                fromRight: function (eitherValue) {
                    if (eitherValue instanceof eitherModule.Right) return eitherValue.value0;
                    if (eitherValue instanceof eitherModule.Left) return partialUnsafeModule.unsafeCrashWith("unsafeFromRight: Expected Right, received Left");
                    throw new Error(`Invalid Either value for fromRight: ${eitherValue?.constructor?.name}`);
                },
                left: eitherModule.Left.create,
                right: eitherModule.Right.create
            };

            // Launches an Aff computation in a new fiber.
            const launchAffFiber = function (affComputation) {
                return function () {
                    const fiberInstance = affModule._makeFiber(eitherApiForAff, null, affComputation)();
                    fiberInstance.run();
                    return fiberInstance;
                };
            };

            // Apply instance for ParAff.
            const applyParAffInstance = new applyModule.Apply(function () {
                return functorParAffInstance;
            }, affModule._parAffApply);

            // Monad instance for Aff.
            const monadAffInstance = new monadModule.Monad(function () {
                return applicativeAffInstance;
            }, function () {
                return bindAffInstance;
            });

            // Bind instance for Aff.
            const bindAffInstance = new bindModule.Bind(function () {
                return applyAffInstance;
            }, affModule._bind);

            // Apply instance for Aff.
            const applyAffInstance = new applyModule.Apply(function () {
                return functorAffInstance;
            }, monadModule.ap(monadAffInstance));

            // Applicative instance for Aff.
            const applicativeAffInstance = new applicativeModule.Applicative(function () {
                return applyAffInstance;
            }, affModule._pure);

            // MonadEffect instance for Aff.
            const monadEffectAffInstance = new effectClassModule.MonadEffect(function () {
                return monadAffInstance;
            }, affModule._liftEffect);

            // Parallel instance for Aff.
            const parallelAffInstance = new parallelClassModule.Parallel(
                function () {
                    return applicativeParAffInstance;
                },
                function () {
                    return monadAffInstance;
                },
                unsafeCoerceModule.unsafeCoerce, // Unsafe coerce to convert Aff to ParAff.
                affModule._sequential
            );

            // Applicative instance for ParAff.
            const applicativeParAffInstance = new applicativeModule.Applicative(function () {
                return applyParAffInstance;
            }, function (value) {
                return parallelClassModule.parallel(parallelAffInstance)(applicativeModule.pure(applicativeAffInstance)(value));
            });

            // Semigroup instance for Canceler (combining cancelers).
            const semigroupCancelerInstance = new semigroupModule.Semigroup(function (canceler1) {
                return function (canceler2) {
                    return function (forkedFiber) {
                        return parallelModule.parSequence_(parallelAffInstance)(foldableModule.foldableArray)([canceler1(forkedFiber), canceler2(forkedFiber)]);
                    };
                };
            });

            // A non-canceling effect.
            const nonCancelerEffect = functionModule.constant(applicativeModule.pure(applicativeAffInstance)(unitModule.unit));

            // Monoid instance for Canceler.
            const monoidCancelerInstance = new monoidModule.Monoid(function () {
                return semigroupCancelerInstance;
            }, nonCancelerEffect);

            exportsContainer.launchAff = launchAffFiber;
            exportsContainer.launchAff_ = function (affComputation) {
                return functorModule.void(effectModule.functorEffect)(launchAffFiber(affComputation));
            };
            exportsContainer.nonCanceler = nonCancelerEffect;
            exportsContainer.functorAff = functorAffInstance;
            exportsContainer.applyAff = applyAffInstance;
            exportsContainer.applicativeAff = applicativeAffInstance;
            exportsContainer.bindAff = bindAffInstance;
            exportsContainer.monadAff = monadAffInstance;
            exportsContainer.monadEffectAff = monadEffectAffInstance;
            exportsContainer.functorParAff = functorParAffInstance;
            exportsContainer.applyParAff = applyParAffInstance;
            exportsContainer.applicativeParAff = applicativeParAffInstance;
            exportsContainer.parallelAff = parallelAffInstance;
            exportsContainer.semigroupCanceler = semigroupCancelerInstance;
            exportsContainer.monoidCanceler = monoidCancelerInstance;
            exportsContainer.makeAff = affModule.makeAff;
        }(moduleRegistry["Effect.Aff"] = moduleRegistry["Effect.Aff"] || {}));

        // Module: Node.Encoding
        (function (exportsContainer) {
            "use strict";
            moduleRegistry["Node.Encoding"]; // Self-reference.
            const showModule = moduleRegistry["Data.Show"];
            moduleRegistry.Prelude;

            // Singleton instances for various encoding types.
            const ASCII_ENCODING = (function () {
                function ASCII() {}
                ASCII.value = new ASCII();
                return ASCII;
            })();
            const UTF8_ENCODING = (function () {
                function UTF8() {}
                UTF8.value = new UTF8();
                return UTF8;
            })();
            const UTF16LE_ENCODING = (function () {
                function UTF16LE() {}
                UTF16LE.value = new UTF16LE();
                return UTF16LE;
            })();
            const UCS2_ENCODING = (function () {
                function UCS2() {}
                UCS2.value = new UCS2();
                return UCS2;
            })();
            const BASE64_ENCODING = (function () {
                function Base64() {}
                Base64.value = new Base64();
                return Base64;
            })();
            const LATIN1_ENCODING = (function () {
                function Latin1() {}
                Latin1.value = new Latin1();
                return Latin1;
            })();
            const BINARY_ENCODING = (function () {
                function Binary() {}
                Binary.value = new Binary();
                return Binary;
            })();
            const HEX_ENCODING = (function () {
                function Hex() {}
                Hex.value = new Hex();
                return Hex;
            })();

            // Show instance for encoding types.
            const showEncodingInstance = new showModule.Show(function (encoding) {
                if (encoding instanceof ASCII_ENCODING) return "ASCII";
                if (encoding instanceof UTF8_ENCODING) return "UTF8";
                if (encoding instanceof UTF16LE_ENCODING) return "UTF16LE";
                if (encoding instanceof UCS2_ENCODING) return "UCS2";
                if (encoding instanceof BASE64_ENCODING) return "Base64";
                if (encoding instanceof LATIN1_ENCODING) return "Latin1";
                if (encoding instanceof BINARY_ENCODING) return "Binary";
                if (encoding instanceof HEX_ENCODING) return "Hex";
                throw new Error(`Unknown encoding type for display: ${encoding?.constructor?.name}`);
            });

            exportsContainer.ASCII = ASCII_ENCODING.value;
            exportsContainer.UTF8 = UTF8_ENCODING.value;
            exportsContainer.UTF16LE = UTF16LE_ENCODING.value;
            exportsContainer.UCS2 = UCS2_ENCODING.value;
            exportsContainer.Base64 = BASE64_ENCODING.value;
            exportsContainer.Latin1 = LATIN1_ENCODING.value;
            exportsContainer.Binary = BINARY_ENCODING.value;
            exportsContainer.Hex = HEX_ENCODING.value;
            // Converts internal encoding types to Node.js string representations.
            exportsContainer.encodingToNode = function (encoding) {
                if (encoding instanceof ASCII_ENCODING) return "ascii";
                if (encoding instanceof UTF8_ENCODING) return "utf8";
                if (encoding instanceof UTF16LE_ENCODING) return "utf16le";
                if (encoding instanceof UCS2_ENCODING) return "ucs2";
                if (encoding instanceof BASE64_ENCODING) return "base64";
                if (encoding instanceof LATIN1_ENCODING) return "latin1";
                if (encoding instanceof BINARY_ENCODING) return "binary";
                if (encoding instanceof HEX_ENCODING) return "hex";
                throw new Error(`Unknown encoding type for Node.js conversion: ${encoding?.constructor?.name}`);
            };
            exportsContainer.showEncoding = showEncodingInstance;
        }(moduleRegistry["Node.Encoding"] = moduleRegistry["Node.Encoding"] || {}));

        // Module: Node.Process
        (function (exportsContainer) {
            "use strict";
            // Exports the global Node.js `process` object.
            (exportsContainer = moduleRegistry["Node.Process"] = moduleRegistry["Node.Process"] || {}).process = process;
        }());

        // Module: Node.Stream
        (function (exportsContainer) {
            "use strict";
            // Reads a stream chunk and applies a handler based on its type (Buffer or String).
            exportsContainer.readChunkImpl = function (bufferHandler) {
                return function (stringHandler) {
                    return function (chunk) {
                        if (chunk instanceof Buffer) {
                            return bufferHandler(chunk);
                        }
                        if (typeof chunk === "string") {
                            return stringHandler(chunk);
                        }
                        // Added a guard clause for null/undefined chunks.
                        if (chunk === null || chunk === undefined) {
                            console.warn("Received null/undefined chunk from stream, treating as empty string.");
                            return stringHandler("");
                        }
                        throw new Error(`Node.Stream.readChunkImpl: Unrecognized chunk type; expected String or Buffer, got: ${typeof chunk}`);
                    };
                };
            };
            // Attaches a data event listener to a stream.
            exportsContainer.onDataEitherImpl = function (chunkParser) {
                return function (stream) {
                    return function (callbackEffect) {
                        return function () {
                            stream.on("data", function (dataChunk) {
                                callbackEffect(chunkParser(dataChunk))();
                            });
                        };
                    };
                };
            };
            // Attaches an end event listener to a stream.
            exportsContainer.onEnd = function (stream) {
                return function (callbackEffect) {
                    return function () {
                        stream.on("end", callbackEffect);
                    };
                };
            };
            // Writes data to a stream (generic, not specific to string/buffer).
            exportsContainer.write = function (stream) {
                return function (data) {
                    return function (encoding) {
                        return function (callback) {
                            return function () {
                                stream.write(data, encoding, callback);
                            };
                        };
                    };
                };
            };
            // Writes a string to a stream with specified encoding.
            exportsContainer.writeStringImpl = function (stream) {
                return function (encoding) {
                    return function (dataString) {
                        return function (callback) {
                            return function () {
                                stream.write(dataString, encoding, callback);
                            };
                        };
                    };
                };
            };
        }(moduleRegistry["Node.Stream"] = moduleRegistry["Node.Stream"] || {}));

        // Module: Node.Buffer
        (function (exportsContainer) {
            "use strict";
            // Converts a Buffer to a string with a given encoding.
            (exportsContainer = moduleRegistry["Node.Buffer"] = moduleRegistry["Node.Buffer"] || {}).toStringImpl = function (encoding) {
                return function (buffer) {
                    return function () {
                        return buffer.toString(encoding);
                    };
                };
            };
        }());

        // Module: Node.Buffer (main definitions)
        (function (exportsContainer) {
            "use strict";
            const bufferModule = moduleRegistry["Node.Buffer"];
            moduleRegistry["Control.Semigroupoid"];
            moduleRegistry["Data.ArrayBuffer.Types"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Show"];
            moduleRegistry.Effect;
            const encodingModule = moduleRegistry["Node.Encoding"];
            moduleRegistry.Prelude;
            exportsContainer.toString = function (encoding) {
                return bufferModule.toStringImpl(encodingModule.encodingToNode(encoding));
            };
        }(moduleRegistry["Node.Buffer"] = moduleRegistry["Node.Buffer"] || {}));

        // Module: Node.Stream (main definitions)
        (function (exportsContainer) {
            "use strict";
            const streamModule = moduleRegistry["Node.Stream"];
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const bindModule = moduleRegistry["Control.Bind"];
            const eitherModule = moduleRegistry["Data.Either"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Show"];
            const effectModule = moduleRegistry.Effect;
            const exceptionModule = moduleRegistry["Effect.Exception"];
            const bufferModule = moduleRegistry["Node.Buffer"];
            const encodingModule = moduleRegistry["Node.Encoding"];
            moduleRegistry.Prelude;

            // Creates a chunk reader that produces an Either (Left for Buffer, Right for String).
            const chunkReader = streamModule.readChunkImpl(eitherModule.Left.create)(eitherModule.Right.create);
            // Helper to attach an onData listener that provides an Either chunk.
            const onDataEitherHelper = function (stream) {
                return function (callback) {
                    return streamModule.onDataEitherImpl(chunkReader)(stream)(callback);
                };
            };
            // Attaches an onData listener, expecting string data, and throws if a buffer is received.
            const onDataMain = function (stream) {
                return function (callback) {
                    return onDataEitherHelper(stream)(
                        bindModule.composeKleisliFlipped(effectModule.bindEffect)(callback)(function (eitherData) {
                            if (eitherData instanceof eitherModule.Left) {
                                return exceptionModule.throw("Stream encoding should not be set; received raw buffer.");
                            } else if (eitherData instanceof eitherModule.Right) {
                                return applicativeModule.pure(effectModule.applicativeEffect)(eitherData.value0);
                            }
                            // Added guard for unexpected types.
                            return exceptionModule.throw("Unexpected data type received from stream's onData listener.");
                        })
                    );
                };
            };

            exportsContainer.onData = onDataMain;
            // Attaches an onData listener, converting chunks to string with specified encoding.
            exportsContainer.onDataString = function (stream) {
                return function (encoding) {
                    return function (callback) {
                        return onDataMain(stream)(
                            bindModule.composeKleisliFlipped(effectModule.bindEffect)(callback)(bufferModule.toString(encoding))
                        );
                    };
                };
            };
            exportsContainer.onDataEither = onDataEitherHelper;
            // Writes a string to a stream, using `showEncoding` for the encoding parameter.
            exportsContainer.writeString = function (stream) {
                return function (encoding) {
                    return streamModule.writeStringImpl(stream)(moduleRegistry["Data.Show"].show(encodingModule.showEncoding)(encoding));
                };
            };
            exportsContainer.onEnd = streamModule.onEnd;
        }(moduleRegistry["Node.Stream"] = moduleRegistry["Node.Stream"] || {}));

        // Module: Node.Process (main definitions)
        (function (exportsContainer) {
            "use strict";
            const processModule = moduleRegistry["Node.Process"];
            moduleRegistry["Data.Functor"];
            moduleRegistry["Data.Maybe"];
            moduleRegistry["Data.Posix"];
            moduleRegistry["Data.Posix.Signal"];
            moduleRegistry.Effect;
            moduleRegistry["Foreign.Object"];
            moduleRegistry["Node.Platform"];
            moduleRegistry["Node.Stream"];
            moduleRegistry.Prelude;
            moduleRegistry["Unsafe.Coerce"];

            const stdoutStream = processModule.process.stdout;
            const stdinStream = processModule.process.stdin;
            exportsContainer.stdin = stdinStream;
            exportsContainer.stdout = stdoutStream;
        }(moduleRegistry["Node.Process"] = moduleRegistry["Node.Process"] || {}));

        // Module: ABC111B - THE MAIN APPLICATION LOGIC
        (function (currentModuleExports) {
            "use strict";
            // Import necessary modules from the global registry.
            const applicativeModule = moduleRegistry["Control.Applicative"];
            const bindModule = moduleRegistry["Control.Bind"];
            const categoryModule = moduleRegistry["Control.Category"];
            const arrayModule = moduleRegistry["Data.Array"];
            const eitherModule = moduleRegistry["Data.Either"];
            const functorModule = moduleRegistry["Data.Functor"];
            const intModule = moduleRegistry["Data.Int"];
            const monoidModule = moduleRegistry["Data.Monoid"];
            const semiringModule = moduleRegistry["Data.Semiring"];
            const showModule = moduleRegistry["Data.Show"];
            const stringCommonModule = moduleRegistry["Data.String.Common"];
            const unitModule = moduleRegistry["Data.Unit"];
            const effectModule = moduleRegistry.Effect;
            const affModule = moduleRegistry["Effect.Aff"];
            const effectClassModule = moduleRegistry["Effect.Class"];
            const effectRefModule = moduleRegistry["Effect.Ref"];
            const encodingModule = moduleRegistry["Node.Encoding"];
            const processModule = moduleRegistry["Node.Process"];
            const streamModule = moduleRegistry["Node.Stream"];
            const partialUnsafeModule = moduleRegistry["Partial.Unsafe"];

            /**
             * Processes a trimmed string input (expected to be an integer) and formats the result.
             * It finds the smallest multiple of 111 (from 111*1 to 111*9) that is greater than or equal to the input number.
             * @param {string} inputString - The raw string input from stdin.
             * @returns {eitherModule.Either<string, string>} An Either representing success (formatted result) or failure (error message).
             */
            const processInputAndFormat = function (inputString) {
                const trimmedInput = stringCommonModule.trim(inputString);
                // Attempt to parse the trimmed string as an integer.
                const parsedIntResult = intModule.fromString(trimmedInput);

                // Use Either's bind for sequential processing and error handling.
                return bindModule.bind(eitherModule.bindEither)(eitherModule.note("Failed to parse input as a valid integer.")(parsedIntResult))(function (inputNumber) {
                    // Generate multiples of 111 from 1*111 up to 9*111.
                    const multiplesOf111 = [];
                    // Rewriting the original `array.range(1)(9).map(mul(111))` using a standard for loop.
                    for (let multiplier = 1; multiplier <= 9; multiplier++) {
                        multiplesOf111.push(semiringModule.mul(semiringModule.semiringInt)(111)(multiplier));
                    }

                    // Find the first multiple that is greater than or equal to the input number.
                    let targetMultiple = null;
                    // Rewriting the original `array.filter(n => n >= inputNumber)[0]` using a for...of loop.
                    for (const multiple of multiplesOf111) {
                        if (multiple >= inputNumber) {
                            targetMultiple = multiple;
                            break;
                        }
                    }

                    // Guard clause: if no suitable multiple is found (should not happen for valid inputs 1-999).
                    if (targetMultiple === null) {
                        return eitherModule.Left.create(`No suitable multiple of 111 found for input: ${inputNumber}. This indicates an unexpected input range.`);
                    }

                    // Format the result as a string, adding a newline character.
                    const formattedOutput = showModule.show(showModule.showInt)(targetMultiple) + "\n";
                    return applicativeModule.pure(eitherModule.applicativeEither)(formattedOutput);
                });
            };

            /**
             * An Aff computation to asynchronously read all data from Node.js stdin into a single string.
             * This handles data chunks and the 'end' event.
             * @returns {affModule.Aff<string>} An Aff computation resolving to the accumulated input string.
             */
            const readInputFromStdin = affModule.makeAff(function (completionCallback) {
                return function () {
                    // Use a mutable reference (Effect.Ref) to accumulate the input string.
                    const inputAccumulatorRef = effectRefModule.new("")();

                    // Set up the data listener for stdin.
                    const onDataCanceler = streamModule.onDataString(processModule.stdin)(encodingModule.UTF8.value)(function (dataChunk) {
                        return function () {
                            const currentContent = effectRefModule.read(inputAccumulatorRef)();
                            effectRefModule.write(currentContent + dataChunk)(inputAccumulatorRef)();
                        };
                    })();

                    // Set up the end listener for stdin.
                    const onEndCanceler = streamModule.onEnd(processModule.stdin)(function () {
                        const finalContent = effectRefModule.read(inputAccumulatorRef)();
                        // Call the completion callback with the final accumulated content wrapped in an Either.Right.
                        completionCallback(applicativeModule.pure(eitherModule.applicativeEither)(finalContent))();
                    })();

                    // Return a combined canceler for both listeners.
                    return monoidModule.append(affModule.monoidCanceler.Semigroup0())(onDataCanceler)(onEndCanceler);
                };
            });

            /**
             * The main entry point of the application.
             * It orchestrates reading input, processing it, and writing the result to stdout.
             */
            const executeMainProgram = affModule.launchAff_(
                // Bind the `readInputFromStdin` computation.
                bindModule.bind(affModule.bindAff)(readInputFromStdin)(function (rawInputString) {
                    // Once raw input is available, process it.
                    const processedEitherResult = processInputAndFormat(rawInputString);

                    // Handle the result from `processInputAndFormat` which is an Either.
                    if (processedEitherResult instanceof eitherModule.Left) {
                        // If processing failed, crash the application with the error message.
                        return effectClassModule.liftEffect(affModule.monadEffectAff)(partialUnsafeModule.unsafeCrashWith(processedEitherResult.value0));
                    } else {
                        // If processing was successful, extract the result and write it to stdout.
                        const outputString = processedEitherResult.value0;
                        return effectClassModule.liftEffect(affModule.monadEffectAff)(
                            functorModule.void(effectModule.functorEffect)(
                                streamModule.writeString(processModule.stdout)(encodingModule.UTF8.value)(outputString)(
                                    applicativeModule.pure(effectModule.applicativeEffect)(unitModule.unit)
                                )
                            )
                        );
                    }
                })
            );

            // Export the main program and the solver function.
            currentModuleExports.main = executeMainProgram;
            currentModuleExports.solve = processInputAndFormat;
        }(moduleRegistry.ABC111B = moduleRegistry.ABC111B || {})), moduleRegistry.ABC111B.main(); // Execute the main program immediately.
    }, {}]
}, {}, ["Focm"], null); // End of module definitions and initial moduleLoader call.