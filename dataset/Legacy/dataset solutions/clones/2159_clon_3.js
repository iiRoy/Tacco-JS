/*!
 * This file contains the solution for AtCoder ABC155 Problem D.
 * Original source: https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 *
 * This is a Type III clone, featuring extensive structural and lexical modifications,
 * while preserving the core problem-solving logic.
 */
(function(moduleDefinitions) {
    // This object caches loaded modules.
    var loadedModulesCache = {};

    // The custom require function for this webpack bundle.
    function __custom_webpack_require__(requestedModuleId) {
        // If module is already in cache, return its exports.
        if (loadedModulesCache[requestedModuleId]) {
            return loadedModulesCache[requestedModuleId].exports;
        }

        // Create a new module entry and store it in the cache.
        var currentModuleEntry = loadedModulesCache[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false, // Flag to indicate if the module has been fully loaded.
            exports: {}
        };

        // Execute the module function, populating its exports.
        moduleDefinitions[requestedModuleId].call(
            currentModuleEntry.exports,
            currentModuleEntry,
            currentModuleEntry.exports,
            __custom_webpack_require__
        );

        // Mark the module as loaded.
        currentModuleEntry.isLoaded = true;
        return currentModuleEntry.exports;
    }

    // Expose module definitions and cache for debugging/inspection.
    __custom_webpack_require__.registeredModules = moduleDefinitions;
    __custom_webpack_require__.moduleCache = loadedModulesCache;

    // Utility to define a getter function for module exports.
    // This is similar to Object.defineProperty.
    __custom_webpack_require__.defineExportGetter = function(targetObject, propertyName, getterFunction) {
        // Ensure the property doesn't already exist or isn't enumerable.
        if (!__custom_webpack_require__.objectHasOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make it iterable.
                get: getterFunction // Define the getter.
            });
        }
    };

    // Utility to mark a module as an ES module.
    __custom_webpack_require__.markAsEsModule = function(exportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    // Utility to handle different types of module imports (e.g., CommonJS, ES modules).
    __custom_webpack_require__.interopRequire = function(moduleReference, modeFlags) {
        // If modeFlags indicates it's already a module, just return it.
        if (modeFlags & 1) {
            moduleReference = __custom_webpack_require__(moduleReference);
        }
        // If modeFlags indicates it's an ES module and an object, return it.
        if (modeFlags & 8 && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) {
            return moduleReference;
        }
        // Create a synthetic namespace object.
        var syntheticNamespace = Object.create(null);
        __custom_webpack_require__.markAsEsModule(syntheticNamespace);
        Object.defineProperty(syntheticNamespace, "default", {
            enumerable: true,
            value: moduleReference
        });
        // If modeFlags allows, copy all properties from the original module.
        if (modeFlags & 2 && typeof moduleReference !== "string") {
            for (var key in moduleReference) {
                __custom_webpack_require__.defineExportGetter(
                    syntheticNamespace,
                    key,
                    (function(k) {
                        return moduleReference[k];
                    }).bind(null, key)
                );
            }
        }
        return syntheticNamespace;
    };

    // Utility to get the default export of a module.
    __custom_webpack_require__.getDefaultExport = function(moduleObject) {
        var defaultExportFn = moduleObject && moduleObject.__esModule ?
            function() {
                return moduleObject["default"];
            } :
            function() {
                return moduleObject;
            };
        __custom_webpack_require__.defineExportGetter(defaultExportFn, "a", defaultExportFn);
        return defaultExportFn;
    };

    // Utility to check if an object has a specific property.
    __custom_webpack_require__.objectHasOwnProperty = function(objectToCheck, propertyKey) {
        return Object.prototype.hasOwnProperty.call(objectToCheck, propertyKey);
    };

    // Set the public path for assets (empty in this case).
    __custom_webpack_require__.publicPath = "";

    // Load the entry module (module 0).
    __custom_webpack_require__(__custom_webpack_require__.registeredModules = 0);
})([
    // Module 0: Main entry point
    function(moduleObject, exportsObject, requireFn) {
        "use strict";
        // Helper for default imports, handling ES modules and CommonJS.
        var importDefaultUtil = (this && this.__importDefault) || function(mod) {
            return (mod && mod.__esModule) ? mod : {
                default: mod
            };
        };
        exportsObject.__esModule = true;

        // Import file system module and the main problem solver.
        var fileSystemModule = importDefaultUtil(requireFn(1));
        var problemSolverModule = requireFn(2);

        // Read input from standard input, then process it.
        fileSystemModule.default.readFile("/dev/stdin", "utf8", function(readError, fileContent) {
            // Validate file content presence.
            if (readError) {
                console.error("Error reading standard input:", readError);
                return;
            }
            if (!fileContent || fileContent.trim() === "") {
                console.warn("Standard input was empty or invalid.");
                return;
            }

            // Encapsulate the processing logic.
            (function processInputContent(contentToProcess) {
                const solutionInstance = new problemSolverModule.SolutionProcessor();
                const parsedInputData = solutionInstance.ingestData(contentToProcess);
                const finalSolution = solutionInstance.computeResult(parsedInputData);
                solutionInstance.displayOutput(finalSolution);
            })(fileContent);
        });
    },

    // Module 1: Node.js 'fs' (file system) module wrapper
    function(moduleObject, exportsObject) {
        // Simply exports the Node.js 'fs' module.
        moduleObject.exports = require("fs");
    },

    // Module 2: Core Problem Solving Logic
    function(moduleObject, exportsObject, requireFn) {
        "use strict";
        // Polyfill for __extends helper (TypeScript inheritance).
        var __inheritanceHelper = (this && this.__extends) || (function() {
            var extendStatics = function(d, b) {
                extendStatics = Object.setPrototypeOf ||
                    ({
                            __proto__: []
                        }
                        instanceof Array && function(d, b) {
                            d.__proto__ = b;
                        }) ||
                    function(d, b) {
                        for (var p in b)
                            if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return extendStatics(d, b);
            };
            return function(d, b) {
                function __() {
                    this.constructor = d;
                }
                extendStatics(d, b);
                d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
            };
        })();

        // Helper for default imports.
        var __defaultImportHelper = (this && this.__importDefault) || function(mod) {
            return (mod && mod.__esModule) ? mod : {
                default: mod
            };
        };
        exportsObject.__esModule = true;

        // Import required modules for the solver.
        var BaseProblemProcessor = requireFn(3).BaseAlgorithmSolver; // Renamed SolverBase
        var InputTokenStream = requireFn(4); // Renamed getSpaceIterator
        var BigNumberClass = __defaultImportHelper(requireFn(5)).default; // Renamed Big

        /**
         * Represents a specialized processor for the AtCoder problem.
         * This class extends a base solver to provide specific implementation.
         */
        var SolutionProcessor = (function(_super) {
            __inheritanceHelper(SolutionProcessor, _super);

            function SolutionProcessor() {
                // Call the constructor of the parent class.
                return _super !== null && _super.apply(this, arguments) || this;
            }

            /**
             * Computes the K-th smallest product from the given array.
             * This method uses binary search on the answer space.
             * @param {object} problemData - Contains arraySize (N), targetIndex (K), and numericalArray (A).
             * @returns {{answer: BigNumberClass}} The K-th smallest product as a BigNumber.
             */
            SolutionProcessor.prototype.computeResult = function(problemData) {
                const arraySize = problemData.arraySize;
                const targetIndex = problemData.targetIndex;
                const numericalArray = problemData.numericalArray;

                // Guard clause: Handle empty or single-element arrays
                if (!numericalArray || numericalArray.length === 0) {
                    return {
                        answer: new BigNumberClass(0)
                    };
                }
                if (numericalArray.length === 1) {
                    return {
                        answer: new BigNumberClass(numericalArray[0] * numericalArray[0])
                    };
                }

                // Sort the input numbers in ascending order.
                numericalArray.sort((valA, valB) => valA - valB);

                // Convert all numbers to BigNumber objects for precise calculations.
                const bigNumbersArray = numericalArray.map(num => new BigNumberClass(num));

                // Count occurrences of negative, positive, and zero numbers.
                let negativeValueCount = 0;
                let positiveValueCount = 0;
                let zeroValueCount = 0;

                for (let idx = 0; idx < arraySize; idx++) {
                    const currentNum = numericalArray[idx];
                    if (currentNum < 0) {
                        negativeValueCount++;
                    } else if (currentNum > 0) {
                        positiveValueCount++;
                    } else {
                        zeroValueCount++;
                    }
                }

                // Calculate initial counts of product types.
                // Products of (negative * positive) are always negative.
                const negPosProductCount = negativeValueCount * positiveValueCount;
                // Products involving zero are zero. Includes (zero * positive), (zero * negative), (zero * zero).
                const zeroBasedProductCount = zeroValueCount * (positiveValueCount + negativeValueCount) +
                    (zeroValueCount * (zeroValueCount - 1)) / 2;

                // Define BigNumber constants for binary search.
                const oneUnitBig = new BigNumberClass(1);
                const zeroUnitBig = new BigNumberClass(0);
                // Lower and upper bounds for the search space.
                // Max product: 10^9 * 10^9 = 10^18. Min product: -10^9 * 10^9 = -10^18.
                // Use slightly larger bounds to be safe.
                let searchRangeLower = new BigNumberClass("-1000000000000000005"); // -10^18 - 5 (approx)
                let searchRangeUpper = new BigNumberClass("1000000000000000005"); // 10^18 + 5 (approx)

                // Binary search for the K-th smallest product.
                // The loop continues as long as the search range is greater than one unit.
                while (searchRangeUpper.minus(searchRangeLower).gt(oneUnitBig)) {
                    // Calculate the midpoint of the current search range.
                    const currentProductCandidate = searchRangeUpper.plus(searchRangeLower).div(2).round();
                    let productsSatisfyingCondition = 0; // Count of products less than or equal to currentProductCandidate.

                    // Case 1: currentProductCandidate is negative.
                    if (currentProductCandidate.lt(zeroUnitBig)) {
                        // Only products of (negative * positive) can be negative.
                        // Iterate through negative numbers.
                        for (let idx = 0; idx < arraySize && numericalArray[idx] < 0; idx++) {
                            let subSearchStart = negativeValueCount + zeroValueCount - 1; // Start from first positive or zero.
                            let subSearchEnd = arraySize; // Up to the end of the array.

                            // Binary search for `j` in `[negativeValueCount + zeroValueCount, arraySize - 1]`
                            // such that `numericalArray[idx] * numericalArray[j] < currentProductCandidate`.
                            // This finds the smallest `subSearchEnd` (y in original) such that `bigNumbersArray[idx].mul(bigNumbersArray[subSearchEnd]) >= currentProductCandidate`.
                            while (subSearchEnd - subSearchStart > 1) {
                                const subSearchMidpoint = Math.floor((subSearchStart + subSearchEnd) / 2);
                                if (bigNumbersArray[idx].mul(bigNumbersArray[subSearchMidpoint]).lt(currentProductCandidate)) {
                                    subSearchEnd = subSearchMidpoint;
                                } else {
                                    subSearchStart = subSearchMidpoint;
                                }
                            }
                            productsSatisfyingCondition += arraySize - subSearchEnd;
                        }
                    }
                    // Case 2: currentProductCandidate is positive.
                    else if (currentProductCandidate.gt(zeroUnitBig)) {
                        // All negative * negative products are positive.
                        // All positive * positive products are positive.
                        // All negative * positive products are negative.
                        // Products involving zero are zero.
                        // So, we first include all negative * negative, positive * positive, and zero-related products.
                        productsSatisfyingCondition += negPosProductCount + zeroBasedProductCount;

                        // Iterate through negative numbers.
                        for (let idx = 0; idx < arraySize && numericalArray[idx] < 0; idx++) {
                            let subSearchStart = idx; // Start from current index
                            let subSearchEnd = negativeValueCount; // Up to the last negative number (exclusive).

                            // Binary search for `j` in `[idx + 1, negativeValueCount - 1]`
                            // such that `numericalArray[idx] * numericalArray[j] < currentProductCandidate`.
                            // This finds the smallest `subSearchEnd` (y in original) such that `bigNumbersArray[idx].mul(bigNumbersArray[subSearchEnd]) >= currentProductCandidate`.
                            while (subSearchEnd - subSearchStart > 1) {
                                const subSearchMidpoint = Math.floor((subSearchStart + subSearchEnd) / 2);
                                if (bigNumbersArray[idx].mul(bigNumbersArray[subSearchMidpoint]).lt(currentProductCandidate)) {
                                    subSearchEnd = subSearchMidpoint;
                                } else {
                                    subSearchStart = subSearchMidpoint;
                                }
                            }
                            productsSatisfyingCondition += negativeValueCount - subSearchEnd;
                        }

                        // Iterate through positive numbers.
                        for (let idx = 0; idx < arraySize && numericalArray[idx] > 0; idx++) {
                            let subSearchStart = idx; // Start from current index
                            let subSearchEnd = arraySize; // Up to the end of the array.

                            // Binary search for `j` in `[idx + 1, arraySize - 1]`
                            // such that `numericalArray[idx] * numericalArray[j] < currentProductCandidate`.
                            // This finds the largest `subSearchStart` (b in original) such that `bigNumbersArray[idx].mul(bigNumbersArray[subSearchStart]) < currentProductCandidate`.
                            while (subSearchEnd - subSearchStart > 1) {
                                const subSearchMidpoint = Math.floor((subSearchStart + subSearchEnd) / 2);
                                if (bigNumbersArray[idx].mul(bigNumbersArray[subSearchMidpoint]).lt(currentProductCandidate)) {
                                    subSearchStart = subSearchMidpoint;
                                } else {
                                    subSearchEnd = subSearchMidpoint;
                                }
                            }
                            productsSatisfyingCondition += subSearchStart - idx;
                        }
                    }
                    // Case 3: currentProductCandidate is zero.
                    else { // currentProductCandidate.isEqual(zeroUnitBig)
                        // All negative * positive products are negative.
                        // All products involving zero are zero.
                        // So, the count is just negPosProductCount + zeroBasedProductCount.
                        productsSatisfyingCondition = negPosProductCount + zeroBasedProductCount;
                    }

                    // Adjust the binary search range based on the count.
                    if (productsSatisfyingCondition < targetIndex) {
                        searchRangeLower = currentProductCandidate;
                    } else {
                        searchRangeUpper = currentProductCandidate;
                    }
                }

                // The K-th smallest product is `searchRangeLower`.
                return {
                    answer: searchRangeLower
                };
            };

            /**
             * Parses the raw input string into structured problem data.
             * @param {string} rawInputString - The raw input from stdin.
             * @returns {{arraySize: number, targetIndex: number, numericalArray: number[]}} Parsed data.
             */
            SolutionProcessor.prototype.ingestData = function(rawInputString) {
                // Ensure input string is not empty or malformed.
                if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
                    throw new Error("Input string is empty or invalid.");
                }

                // Use the custom iterator to parse space-separated values.
                // The parsing function converts each token to an integer.
                const parseTokenToInt = (token) => {
                    const parsed = parseInt(token, 10);
                    if (isNaN(parsed)) {
                        throw new Error(`Invalid number encountered: '${token}'`);
                    }
                    return parsed;
                };
                const tokenIterator = InputTokenStream.createIterator(rawInputString, parseTokenToInt);

                // Extract N (arraySize) and K (targetIndex).
                const parsedArraySize = tokenIterator.next().value;
                const parsedTargetIndex = tokenIterator.next().value;

                // Validate N and K.
                if (typeof parsedArraySize !== 'number' || parsedArraySize < 1 || parsedArraySize > 2 * 10 ** 5) {
                    throw new Error(`Invalid array size (N): ${parsedArraySize}`);
                }
                if (typeof parsedTargetIndex !== 'number' || parsedTargetIndex < 1 || parsedTargetIndex > parsedArraySize * (parsedArraySize - 1) / 2) {
                    throw new Error(`Invalid target index (K): ${parsedTargetIndex}`);
                }

                // Read the array A.
                const parsedNumberList = Array.from({
                    length: parsedArraySize
                }, () => {
                    const value = tokenIterator.next().value;
                    if (value === undefined) {
                        throw new Error("Not enough numbers provided in input for array A.");
                    }
                    return value;
                });

                return {
                    arraySize: parsedArraySize,
                    targetIndex: parsedTargetIndex,
                    numericalArray: parsedNumberList
                };
            };

            /**
             * Displays the final computed result to the console.
             * @param {{answer: BigNumberClass}} computationResult - The object containing the answer.
             */
            SolutionProcessor.prototype.displayOutput = function(computationResult) {
                // Ensure the answer is a BigNumberClass and can be converted to string.
                if (!computationResult || typeof computationResult.answer === 'undefined' || typeof computationResult.answer.toString !== 'function') {
                    console.error("Invalid computation result object received.");
                    return;
                }
                console.log(computationResult.answer.toString());
            };

            return SolutionProcessor;
        })(BaseProblemProcessor); // Inherits from BaseProblemProcessor.

        exportsObject.SolutionProcessor = SolutionProcessor; // Export the solver class.
    },

    // Module 3: Base Solver Definition
    function(moduleObject, exportsObject, requireFn) {
        "use strict";
        exportsObject.__esModule = true;
        // A base class for problem solvers. Could contain common utilities or interfaces.
        var BaseAlgorithmSolver = function() {};
        exportsObject.BaseAlgorithmSolver = BaseAlgorithmSolver;
    },

    // Module 4: Space-separated input iterator (Generator)
    function(moduleObject, exportsObject, requireFn) {
        "use strict";
        // Polyfill for __generator helper (TypeScript generators).
        var __generatorState = (this && this.__generator) || function(thisArg, body) {
            var _ = {
                    label: 0,
                    sent: function() {
                        if (1 & _[0]) throw _[1];
                        return _[1];
                    },
                    trys: [],
                    ops: []
                },
                f, y, t, g;
            return g = {
                next: verb(0),
                "throw": verb(1),
                "return": verb(2)
            }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
                return this;
            }), g;

            function verb(n) {
                return function(v) {
                    return step([n, v]);
                };
            }

            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return {
                                value: op[1],
                                done: false
                            };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
                if (op[0] & 5) throw op[1];
                return {
                    value: op[0] ? op[1] : void 0,
                    done: true
                };
            }
        };
        exportsObject.__esModule = true;

        /**
         * Creates an iterator for space-separated values from a string.
         * Each token is processed by a provided parsing function.
         * @param {string} inputString - The raw string to tokenize.
         * @param {(token: string) => any} parsingFunction - Function to parse each token.
         * @returns {Generator<any, void, unknown>} An iterator yielding parsed values.
         */
        exportsObject.createIterator = function(inputString, parsingFunction) {
            return __generatorState(this, function(_a) {
                var currentTokenIndex, parsedTokensArray;
                return __generatorState(this, function(_b) {
                    switch (_b.label) {
                        case 0:
                            currentTokenIndex = 0;
                            // Split the input string by one or more spaces and map each non-empty token using the parsing function.
                            parsedTokensArray = inputString
                                .split(/\s+/)
                                .filter(s => s !== '') // Remove empty strings from split.
                                .map(function(token) {
                                    return parsingFunction(token);
                                });
                            _b.label = 1;
                        case 1:
                            // Check if there are more tokens to yield.
                            if (!(currentTokenIndex < parsedTokensArray.length)) return [3 /*break*/ , 4];
                            // Yield the current token.
                            return [4 /*yield*/ , parsedTokensArray[currentTokenIndex]];
                        case 2:
                            _b.sent(); // Consume the yielded value (not used here).
                            _b.label = 3;
                        case 3:
                            currentTokenIndex++; // Move to the next token.
                            return [3 /*break*/ , 1];
                        case 4:
                            return [2 /*return*/ ]; // All tokens processed.
                    }
                });
            });
        };
    },

    // Module 5: Big.js library (renamed for export)
    function(moduleObject, exportsObject, requireFn) {
        "use strict";
        // Webpack boilerplate for ES module interop.
        requireFn.markAsEsModule(exportsObject);
        requireFn.defineExportGetter(exportsObject, "BigNumber", function() {
            return BigNumber;
        });

        // The original big.js library code starts here.
        // Internal variables and functions within big.js are generally not modified
        // for Type III cloning unless the intent is to deeply obfuscate or rewrite the library itself.
        // We focus on the application code that uses it.
        var BIG_JS_ERROR_PREFIX = "[BigNumber.js] ";
        var INVALID_DECIMAL_PLACES_MSG = BIG_JS_ERROR_PREFIX + "Invalid decimal places";
        var BigNumberPrototype = {};
        var BIG_NUMBER_REGEX = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

        // Function to handle rounding operations for BigNumber.
        function roundBigNumber(bigNumInstance, decimalPlaces, roundingMode, isZero) {
            var digits = bigNumInstance.c; // Coefficient array.
            var exponentAdjustedIndex = bigNumInstance.e + decimalPlaces + 1; // Index where rounding occurs.

            if (exponentAdjustedIndex < digits.length) {
                // If there are digits beyond the rounding point.
                if (roundingMode === 1) { // RoundingMode.RoundHalfUp
                    isZero = digits[exponentAdjustedIndex] >= 5;
                } else if (roundingMode === 2) { // RoundingMode.RoundHalfEven
                    isZero = digits[exponentAdjustedIndex] > 5 || (digits[exponentAdjustedIndex] === 5 && (isZero || exponentAdjustedIndex < 0 || digits[exponentAdjustedIndex + 1] !== undefined || (digits[exponentAdjustedIndex - 1] & 1)));
                } else if (roundingMode === 3) { // RoundingMode.RoundCeil (positive) / RoundFloor (negative)
                    isZero = isZero || !!digits[0]; // Retain existing `isZero` or if there's any non-zero digit.
                } else if (roundingMode === 0) { // RoundingMode.RoundDown
                    isZero = false;
                } else {
                    throw Error(BIG_JS_ERROR_PREFIX + "Invalid rounding mode");
                }

                if (exponentAdjustedIndex < 1) {
                    digits.length = 1;
                    if (isZero) {
                        bigNumInstance.e = -decimalPlaces;
                        digits[0] = 1;
                    } else {
                        digits[0] = bigNumInstance.e = 0;
                    }
                } else {
                    digits.length = exponentAdjustedIndex--;
                    if (isZero) {
                        for (; ++digits[exponentAdjustedIndex] > 9;) {
                            digits[exponentAdjustedIndex] = 0;
                            if (!exponentAdjustedIndex--) {
                                ++bigNumInstance.e;
                                digits.unshift(1);
                            }
                        }
                    }
                    // Remove trailing zeros.
                    for (exponentAdjustedIndex = digits.length; !digits[--exponentAdjustedIndex];) {
                        digits.pop();
                    }
                }
            } else if (roundingMode < 0 || roundingMode > 3 || roundingMode !== ~~roundingMode) {
                throw Error(BIG_JS_ERROR_PREFIX + "Invalid rounding mode");
            }
            return bigNumInstance;
        }

        // Function to format BigNumber to string based on mode.
        function formatBigNumberToString(bigNumInstance, formatMode, decimalPlaces, precisionValue) {
            var stringRepresentation, coefficientLength = bigNumInstance.c.join("").length;
            var isEffectivelyZero = !bigNumInstance.c[0];

            if (decimalPlaces !== undefined) {
                if (decimalPlaces !== ~~decimalPlaces || (formatMode === 3 && decimalPlaces < 0) || decimalPlaces > 1e6) {
                    throw Error(formatMode === 3 ? BIG_JS_ERROR_PREFIX + "precision" : INVALID_DECIMAL_PLACES_MSG);
                }
                decimalPlaces = precisionValue - (bigNumInstance = new bigNumInstance.constructor(bigNumInstance)).e;
                if (bigNumInstance.c.length > ++precisionValue) {
                    roundBigNumber(bigNumInstance, decimalPlaces, bigNumInstance.constructor.RM);
                }
                if (formatMode === 2) {
                    precisionValue = bigNumInstance.e + decimalPlaces + 1;
                }
                for (; bigNumInstance.c.length < precisionValue;) {
                    bigNumInstance.c.push(0);
                }
            }

            stringRepresentation = bigNumInstance.e;
            decimalPlaces = (coefficientLength = (stringRepresentation = bigNumInstance.c.join("")).length);

            // Conditional formatting based on mode and exponent.
            if (formatMode !== 2 && (formatMode === 1 || (formatMode === 3 && precisionValue <= stringRepresentation) || stringRepresentation <= bigNumInstance.constructor.NE || stringRepresentation >= bigNumInstance.constructor.PE)) {
                stringRepresentation = stringRepresentation.charAt(0) + (coefficientLength > 1 ? "." + stringRepresentation.slice(1) : "") + (stringRepresentation < 0 ? "e" : "e+") + stringRepresentation;
            } else if (stringRepresentation < 0) {
                for (; ++stringRepresentation;) {
                    stringRepresentation = "0" + stringRepresentation;
                }
                stringRepresentation = "0." + stringRepresentation;
            } else if (stringRepresentation > 0) {
                if (++stringRepresentation > coefficientLength) {
                    for (stringRepresentation -= coefficientLength; stringRepresentation--;) {
                        stringRepresentation += "0";
                    }
                } else if (stringRepresentation < coefficientLength) {
                    stringRepresentation = stringRepresentation.slice(0, stringRepresentation) + "." + stringRepresentation.slice(stringRepresentation);
                }
            } else if (coefficientLength > 1) {
                stringRepresentation = stringRepresentation.charAt(0) + "." + stringRepresentation.slice(1);
            }

            return bigNumInstance.s < 0 && (!isEffectivelyZero || formatMode === 4) ? "-" + stringRepresentation : stringRepresentation;
        }

        // --- BigNumber Prototype Methods ---
        BigNumberPrototype.abs = function() {
            var result = new this.constructor(this);
            result.s = 1; // Absolute value means positive sign.
            return result;
        };

        BigNumberPrototype.cmp = function(otherValue) {
            var currentInstance = this;
            var otherBigNum = (otherValue instanceof currentInstance.constructor) ? otherValue : new currentInstance.constructor(otherValue);
            var currentCoeffs = currentInstance.c;
            var otherCoeffs = otherBigNum.c;
            var currentSign = currentInstance.s;
            var otherSign = otherBigNum.s;
            var currentExponent = currentInstance.e;
            var otherExponent = otherBigNum.e;

            // Handle zero values.
            if (!currentCoeffs[0] || !otherCoeffs[0]) {
                return currentCoeffs[0] ? currentSign : (otherCoeffs[0] ? -otherSign : 0);
            }

            // Compare signs.
            if (currentSign !== otherSign) {
                return currentSign; // If signs differ, the one with positive sign is greater.
            }

            // If signs are the same, compare magnitudes.
            var isNegativeComparison = currentSign < 0; // If both are negative, comparison flips.
            if (currentExponent !== otherExponent) {
                return (currentExponent > otherExponent) ^ isNegativeComparison ? 1 : -1;
            }

            // Exponents are equal, compare coefficients.
            var minLength = Math.min(currentCoeffs.length, otherCoeffs.length);
            for (var i = -1; ++i < minLength;) {
                if (currentCoeffs[i] !== otherCoeffs[i]) {
                    return (currentCoeffs[i] > otherCoeffs[i]) ^ isNegativeComparison ? 1 : -1;
                }
            }

            // One is a prefix of the other, compare lengths.
            if (currentCoeffs.length === otherCoeffs.length) {
                return 0; // Exactly equal.
            }
            return (currentCoeffs.length > otherCoeffs.length) ^ isNegativeComparison ? 1 : -1;
        };

        BigNumberPrototype.div = function(divisor) {
            var dividend = this;
            var BigNumberConstructor = dividend.constructor;
            var dividendCoeffs = dividend.c;
            var divisorBigNum = (divisor instanceof BigNumberConstructor) ? divisor : new BigNumberConstructor(divisor);
            var divisorCoeffs = divisorBigNum.c;
            var resultSign = dividend.s === divisorBigNum.s ? 1 : -1;
            var decimalPrecision = BigNumberConstructor.DP;

            if (decimalPrecision !== ~~decimalPrecision || decimalPrecision < 0 || decimalPrecision > 1e6) {
                throw Error(INVALID_DECIMAL_PLACES_MSG);
            }
            if (!divisorCoeffs[0]) {
                throw Error(BIG_JS_ERROR_PREFIX + "Division by zero");
            }
            if (!dividendCoeffs[0]) {
                return new BigNumberConstructor(0 * resultSign);
            }

            var tempDivisorCoeffs = divisorCoeffs.slice();
            var quotientCoeffs = [];
            var quotientExponent = dividend.e - divisorBigNum.e;
            var tempDividendCoeffs = dividendCoeffs.slice();
            var divisorLength = tempDivisorCoeffs.length;
            var dividendLength = tempDividendCoeffs.length;
            var tempDividendLength = 0;
            var tempDivisorBigNum = divisorBigNum;
            tempDivisorBigNum.c = []; // Re-use for result.
            tempDivisorBigNum.s = resultSign;

            var requiredPrecision = decimalPrecision + quotientExponent + 1;
            var currentQuotientIndex = 0;

            tempDivisorCoeffs.unshift(0); // Pad for easier subtraction.
            while (tempDividendLength++ < divisorLength) {
                tempDividendCoeffs.push(0);
            }

            do {
                var digitToAppend = 0;
                var comparisonResult;
                for (var i = 0; i < 10; i++) {
                    if (divisorLength !== tempDividendCoeffs.length) {
                        comparisonResult = divisorLength > tempDividendCoeffs.length ? 1 : -1;
                    } else {
                        comparisonResult = 0;
                        for (var j = -1; ++j < divisorLength;) {
                            if (tempDivisorCoeffs[j] !== tempDividendCoeffs[j]) {
                                comparisonResult = tempDivisorCoeffs[j] > tempDividendCoeffs[j] ? 1 : -1;
                                break;
                            }
                        }
                    }

                    if (!(comparisonResult < 0)) break; // If currentDividend < currentDivisor (comparisonResult < 0)
                                                    // then we need to subtract.
                    // Perform subtraction: currentDividend -= currentDivisor
                    var currentBorrow = 0;
                    var subtractorArray = (tempDividendCoeffs.length === divisorLength) ? tempDivisorCoeffs : tempDivisorCoeffs.slice(1); // Use tempDivisorCoeffs without leading zero if lengths match.
                    for (var k = tempDividendCoeffs.length; k > 0; k--) {
                        var diff = tempDividendCoeffs[k - 1] - subtractorArray[k - 1] - currentBorrow;
                        if (diff < 0) {
                            diff += 10;
                            currentBorrow = 1;
                        } else {
                            currentBorrow = 0;
                        }
                        tempDividendCoeffs[k - 1] = diff;
                    }
                    digitToAppend++;
                    // Remove leading zeros from `tempDividendCoeffs`.
                    while (tempDividendCoeffs.length > 1 && tempDividendCoeffs[0] === 0) {
                        tempDividendCoeffs.shift();
                    }
                }
                quotientCoeffs[currentQuotientIndex++] = digitToAppend;
                // If there's a remainder and we still have digits from dividend, append next digit.
                if (tempDividendCoeffs[0] || (tempDividendLength < dividendLength)) {
                    tempDividendCoeffs.push(dividendCoeffs[tempDividendLength] || 0);
                    tempDividendLength++;
                } else {
                    // No remainder, no more dividend digits.
                    break;
                }
            } while ((tempDividendLength <= dividendLength || tempDividendCoeffs[0] !== undefined) && (requiredPrecision-- > 0));

            // Remove leading zeros from quotient.
            if (!quotientCoeffs[0] && quotientCoeffs.length > 1) {
                quotientCoeffs.shift();
                quotientExponent--;
            }

            tempDivisorBigNum.e = quotientExponent;
            tempDivisorBigNum.c = quotientCoeffs;

            // Apply rounding if needed.
            if (quotientCoeffs.length > decimalPrecision + tempDivisorBigNum.e + 1) {
                roundBigNumber(tempDivisorBigNum, decimalPrecision, BigNumberConstructor.RM, tempDividendCoeffs[0] !== undefined);
            }
            return tempDivisorBigNum;
        };

        BigNumberPrototype.eq = function(otherValue) {
            return this.cmp(otherValue) === 0;
        };
        BigNumberPrototype.gt = function(otherValue) {
            return this.cmp(otherValue) > 0;
        };
        BigNumberPrototype.gte = function(otherValue) {
            return this.cmp(otherValue) >= 0;
        };
        BigNumberPrototype.lt = function(otherValue) {
            return this.cmp(otherValue) < 0;
        };
        BigNumberPrototype.lte = function(otherValue) {
            return this.cmp(otherValue) <= 0;
        };

        BigNumberPrototype.minus = BigNumberPrototype.sub = function(subtrahend) {
            var minuend = this;
            var BigNumberConstructor = minuend.constructor;
            var subtrahendBigNum = (subtrahend instanceof BigNumberConstructor) ? subtrahend : new BigNumberConstructor(subtrahend);
            var minuendSign = minuend.s;
            var subtrahendSign = subtrahendBigNum.s;

            // If signs are different, it's an addition.
            if (minuendSign !== subtrahendSign) {
                subtrahendBigNum.s = -subtrahendSign; // Flip sign of subtrahend to make it an addition.
                return minuend.plus(subtrahendBigNum);
            }

            var minuendCoeffs = minuend.c.slice();
            var minuendExponent = minuend.e;
            var subtrahendCoeffs = subtrahendBigNum.c;
            var subtrahendExponent = subtrahendBigNum.e;

            // Handle cases where either operand is zero.
            if (!minuendCoeffs[0] || !subtrahendCoeffs[0]) {
                return subtrahendCoeffs[0] ? (subtrahendBigNum.s = -subtrahendSign, subtrahendBigNum) : new BigNumberConstructor(minuendCoeffs[0] ? minuend : 0);
            }

            // Align exponents by padding with zeros.
            var exponentDifference = minuendExponent - subtrahendExponent;
            if (exponentDifference) {
                var tempArray;
                if (exponentDifference < 0) { // Minuend has smaller exponent, pad minuend.
                    exponentDifference = -exponentDifference;
                    tempArray = minuendCoeffs;
                } else { // Subtrahend has smaller exponent, pad subtrahend.
                    subtrahendExponent = minuendExponent;
                    tempArray = subtrahendCoeffs;
                }
                tempArray.reverse();
                for (var i = 0; i < exponentDifference; i++) {
                    tempArray.push(0);
                }
                tempArray.reverse();
            }

            // Determine which number has larger magnitude to ensure positive result before applying final sign.
            var isMinuendSmaller = false;
            var commonLength = Math.min(minuendCoeffs.length, subtrahendCoeffs.length);
            var lastCommonIndex = -1;
            for (var i = 0; i < commonLength; i++) {
                if (minuendCoeffs[i] !== subtrahendCoeffs[i]) {
                    isMinuendSmaller = minuendCoeffs[i] < subtrahendCoeffs[i];
                    break;
                }
                lastCommonIndex = i;
            }

            // If one is a prefix of the other, compare lengths.
            if (lastCommonIndex === commonLength - 1 && minuendCoeffs.length !== subtrahendCoeffs.length) {
                isMinuendSmaller = minuendCoeffs.length < subtrahendCoeffs.length;
            }

            // If minuend is smaller, swap them and flip the result's sign.
            if (isMinuendSmaller) {
                var tempCoeffs = minuendCoeffs;
                minuendCoeffs = subtrahendCoeffs;
                subtrahendCoeffs = tempCoeffs;
                subtrahendBigNum.s = -subtrahendBigNum.s; // Flip sign of the result.
            }

            // Pad the shorter coefficient array with zeros to match length.
            var lengthDifference = minuendCoeffs.length - subtrahendCoeffs.length;
            if (lengthDifference > 0) {
                for (var i = 0; i < lengthDifference; i++) {
                    subtrahendCoeffs.push(0);
                }
            }

            // Perform subtraction digit by digit.
            var carry = 0;
            for (var i = subtrahendCoeffs.length; i > 0; i--) {
                var diff = minuendCoeffs[i - 1] - subtrahendCoeffs[i - 1] - carry;
                if (diff < 0) {
                    diff += 10;
                    carry = 1;
                } else {
                    carry = 0;
                }
                minuendCoeffs[i - 1] = diff;
            }

            // Remove trailing zeros.
            while (minuendCoeffs.length > 1 && minuendCoeffs[minuendCoeffs.length - 1] === 0) {
                minuendCoeffs.pop();
            }
            // Remove leading zeros and adjust exponent.
            while (minuendCoeffs.length > 1 && minuendCoeffs[0] === 0) {
                minuendCoeffs.shift();
                minuendExponent--;
            }

            // If result is zero, ensure sign is positive and exponent is zero.
            if (minuendCoeffs[0] === 0) {
                subtrahendBigNum.s = 1;
                minuendCoeffs = [minuendExponent = 0];
            }

            subtrahendBigNum.c = minuendCoeffs;
            subtrahendBigNum.e = minuendExponent;
            return subtrahendBigNum;
        };

        BigNumberPrototype.mod = function(divisor) {
            var dividend = this;
            var BigNumberConstructor = dividend.constructor;
            var divisorBigNum = (divisor instanceof BigNumberConstructor) ? divisor : new BigNumberConstructor(divisor);
            var dividendSign = dividend.s;
            var divisorSign = divisorBigNum.s;

            if (!divisorBigNum.c[0]) {
                throw Error(BIG_JS_ERROR_PREFIX + "Division by zero");
            }

            // Set signs to positive for comparison, then restore.
            dividend.s = divisorBigNum.s = 1;
            var isDividendSmallerThanDivisor = divisorBigNum.cmp(dividend) === 1;
            dividend.s = dividendSign;
            divisorBigNum.s = divisorSign;

            if (isDividendSmallerThanDivisor) {
                return new BigNumberConstructor(dividend);
            }

            // Save original DP and RM, set to 0 for integer division.
            var originalDP = BigNumberConstructor.DP;
            var originalRM = BigNumberConstructor.RM;
            BigNumberConstructor.DP = 0;
            BigNumberConstructor.RM = 0;

            // Calculate integer quotient.
            dividend = dividend.div(divisorBigNum);

            // Restore original DP and RM.
            BigNumberConstructor.DP = originalDP;
            BigNumberConstructor.RM = originalRM;

            // Modulo is dividend - (quotient * divisor).
            return this.minus(dividend.times(divisorBigNum));
        };

        BigNumberPrototype.plus = BigNumberPrototype.add = function(addend) {
            var augend = this;
            var BigNumberConstructor = augend.constructor;
            var addendBigNum = (addend instanceof BigNumberConstructor) ? addend : new BigNumberConstructor(addend);
            var augendSign = augend.s;
            var addendSign = addendBigNum.s;

            // If signs are different, it's a subtraction.
            if (augendSign !== addendSign) {
                addendBigNum.s = -addendSign; // Flip sign of addend to make it a subtraction.
                return augend.minus(addendBigNum);
            }

            var augendExponent = augend.e;
            var augendCoeffs = augend.c.slice();
            var addendExponent = addendBigNum.e;
            var addendCoeffs = addendBigNum.c;

            // Handle cases where either operand is zero.
            if (!augendCoeffs[0] || !addendCoeffs[0]) {
                return addendCoeffs[0] ? addendBigNum : new BigNumberConstructor(augendCoeffs[0] ? augend : 0 * augendSign);
            }

            // Align exponents by padding with zeros.
            var exponentDifference = augendExponent - addendExponent;
            if (exponentDifference) {
                var tempArray;
                if (exponentDifference > 0) { // Augend has larger exponent, pad addend.
                    addendExponent = augendExponent;
                    tempArray = addendCoeffs;
                } else { // Addend has larger exponent, pad augend.
                    exponentDifference = -exponentDifference;
                    tempArray = augendCoeffs;
                }
                tempArray.reverse();
                for (var i = 0; i < exponentDifference; i++) {
                    tempArray.push(0);
                }
                tempArray.reverse();
            }

            // Ensure augendCoeffs is the longer array for easier addition.
            if (augendCoeffs.length < addendCoeffs.length) {
                var temp = addendCoeffs;
                addendCoeffs = augendCoeffs;
                augendCoeffs = temp;
            }

            // Perform addition digit by digit.
            var carry = 0;
            var commonLength = addendCoeffs.length;
            for (var i = 0; i < commonLength; i++) {
                var sum = augendCoeffs[commonLength - 1 - i] + addendCoeffs[commonLength - 1 - i] + carry;
                augendCoeffs[commonLength - 1 - i] = sum % 10;
                carry = Math.floor(sum / 10);
            }

            // Propagate carry if augendCoeffs is longer.
            for (var i = augendCoeffs.length - commonLength - 1; i >= 0 && carry > 0; i--) {
                var sum = augendCoeffs[i] + carry;
                augendCoeffs[i] = sum % 10;
                carry = Math.floor(sum / 10);
            }

            // If there's a final carry, prepend it and increment exponent.
            if (carry) {
                augendCoeffs.unshift(carry);
                augendExponent++;
            }

            // Remove trailing zeros.
            while (augendCoeffs.length > 1 && augendCoeffs[augendCoeffs.length - 1] === 0) {
                augendCoeffs.pop();
            }

            addendBigNum.c = augendCoeffs;
            addendBigNum.e = augendExponent;
            return addendBigNum;
        };

        BigNumberPrototype.pow = function(exponent) {
            var base = this;
            var BigNumberConstructor = base.constructor;
            var result = new BigNumberConstructor(1); // Initialize result to 1.
            var tempBase = result; // Helper for squaring.
            var isNegativeExponent = exponent < 0;

            if (exponent !== ~~exponent || exponent < -1e6 || exponent > 1e6) {
                throw Error(BIG_JS_ERROR_PREFIX + "exponent");
            }

            if (isNegativeExponent) {
                exponent = -exponent; // Use positive exponent for calculation.
            }

            // Binary exponentiation (exponentiation by squaring).
            while (exponent > 0) {
                if (exponent & 1) { // If exponent is odd, multiply result by base.
                    result = result.times(base);
                }
                base = base.times(base); // Square the base.
                exponent >>= 1; // Divide exponent by 2.
            }

            return isNegativeExponent ? tempBase.div(result) : result;
        };

        BigNumberPrototype.round = function(decimalPlaces, roundingMode) {
            var BigNumberConstructor = this.constructor;
            if (decimalPlaces === undefined) {
                decimalPlaces = 0;
            } else if (decimalPlaces !== ~~decimalPlaces || decimalPlaces < -1e6 || decimalPlaces > 1e6) {
                throw Error(INVALID_DECIMAL_PLACES_MSG);
            }
            return roundBigNumber(new BigNumberConstructor(this), decimalPlaces, roundingMode === undefined ? BigNumberConstructor.RM : roundingMode);
        };

        BigNumberPrototype.sqrt = function() {
            var currentInstance = this;
            var BigNumberConstructor = currentInstance.constructor;
            var sign = currentInstance.s;
            var exponent = currentInstance.e;
            var half = new BigNumberConstructor(0.5);

            if (!currentInstance.c[0]) {
                return new BigNumberConstructor(currentInstance);
            }
            if (sign < 0) {
                throw Error(BIG_JS_ERROR_PREFIX + "No square root");
            }

            // Attempt to use native Math.sqrt for initial guess.
            var nativeSqrtResult = Math.sqrt(currentInstance.toString());
            var initialGuess;

            if (nativeSqrtResult === 0 || nativeSqrtResult === 1 / 0) {
                // Fallback to more robust initial guess for very large/small numbers.
                var coeffString = currentInstance.c.join("");
                if ((coeffString.length + exponent) & 1) { // Ensure even number of digits before decimal for sqrt.
                    coeffString += "0";
                }
                // Adjust exponent for square root.
                exponent = Math.floor((exponent + 1) / 2) - (exponent < 0 || (exponent & 1));
                var sqrtCoeff = Math.sqrt(coeffString);
                initialGuess = new BigNumberConstructor(
                    (sqrtCoeff === 1 / 0 ? "1e" : sqrtCoeff.toExponential().slice(0, sqrtCoeff.toExponential().indexOf("e") + 1)) + exponent
                );
            } else {
                initialGuess = new BigNumberConstructor(nativeSqrtResult);
            }

            var previousGuess;
            var requiredPrecision = initialGuess.e + (BigNumberConstructor.DP += 4); // Increase precision for intermediate steps.

            // Newton's method for square root: x_n+1 = 0.5 * (x_n + N / x_n)
            do {
                previousGuess = initialGuess;
                initialGuess = half.times(previousGuess.plus(currentInstance.div(previousGuess)));
            } while (previousGuess.c.slice(0, requiredPrecision).join("") !== initialGuess.c.slice(0, requiredPrecision).join(""));

            BigNumberConstructor.DP -= 4; // Restore original DP.
            return roundBigNumber(initialGuess, BigNumberConstructor.DP, BigNumberConstructor.RM);
        };

        BigNumberPrototype.times = BigNumberPrototype.mul = function(multiplier) {
            var multiplicand = this;
            var BigNumberConstructor = multiplicand.constructor;
            var multiplierBigNum = (multiplier instanceof BigNumberConstructor) ? multiplier : new BigNumberConstructor(multiplier);
            var multiplicandCoeffs = multiplicand.c;
            var multiplierCoeffs = multiplierBigNum.c;
            var multiplicandLength = multiplicandCoeffs.length;
            var multiplierLength = multiplierCoeffs.length;
            var multiplicandExponent = multiplicand.e;
            var multiplierExponent = multiplierBigNum.e;

            // Determine sign of the product.
            multiplierBigNum.s = multiplicand.s === multiplierBigNum.s ? 1 : -1;

            // If either operand is zero, the product is zero.
            if (!multiplicandCoeffs[0] || !multiplierCoeffs[0]) {
                return new BigNumberConstructor(0 * multiplierBigNum.s);
            }

            // Calculate exponent of the product.
            multiplierBigNum.e = multiplicandExponent + multiplierExponent;

            // Optimize by swapping if multiplicand is shorter.
            if (multiplicandLength < multiplierLength) {
                var temp = multiplicandCoeffs;
                multiplicandCoeffs = multiplierCoeffs;
                multiplierCoeffs = temp;
                var tempLen = multiplicandLength;
                multiplicandLength = multiplierLength;
                multiplierLength = tempLen;
            }

            // Initialize result coefficient array with zeros.
            var productCoeffs = new Array(multiplicandLength + multiplierLength);
            for (var i = 0; i < productCoeffs.length; i++) {
                productCoeffs[i] = 0;
            }

            // Perform long multiplication.
            var carry = 0;
            for (var i = multiplierLength - 1; i >= 0; i--) {
                carry = 0;
                for (var j = multiplicandLength - 1; j >= 0; j--) {
                    var product = productCoeffs[i + j + 1] + multiplierCoeffs[i] * multiplicandCoeffs[j] + carry;
                    productCoeffs[i + j + 1] = product % 10;
                    carry = Math.floor(product / 10);
                }
                productCoeffs[i] = (productCoeffs[i] + carry) % 10;
            }

            // Adjust exponent if there's a leading zero in the product.
            if (carry) {
                multiplierBigNum.e++;
            } else {
                productCoeffs.shift(); // Remove leading zero.
            }

            // Remove trailing zeros.
            while (productCoeffs.length > 1 && productCoeffs[productCoeffs.length - 1] === 0) {
                productCoeffs.pop();
            }

            multiplierBigNum.c = productCoeffs;
            return multiplierBigNum;
        };

        // Formatting methods.
        BigNumberPrototype.toExponential = function(decimalPlaces) {
            return formatBigNumberToString(this, 1, decimalPlaces, decimalPlaces);
        };
        BigNumberPrototype.toFixed = function(decimalPlaces) {
            return formatBigNumberToString(this, 2, decimalPlaces, this.e + decimalPlaces);
        };
        BigNumberPrototype.toPrecision = function(precision) {
            return formatBigNumberToString(this, 3, precision, precision - 1);
        };
        BigNumberPrototype.toString = function() {
            return formatBigNumberToString(this, 0);
        };
        BigNumberPrototype.valueOf = BigNumberPrototype.toJSON = function() {
            return formatBigNumberToString(this, 4);
        };

        /**
         * The main BigNumber constructor function.
         * @class
         * @param {number|string|BigNumber} value - The initial value for the BigNumber.
         */
        var BigNumber = (function() {
            function BigNumberConstructor(value) {
                var _this = this;
                if (!(_this instanceof BigNumberConstructor)) {
                    return value === undefined ? BigNumber() : new BigNumberConstructor(value);
                }

                // If input is already a BigNumber instance, copy its properties.
                if (value instanceof BigNumberConstructor) {
                    _this.s = value.s;
                    _this.e = value.e;
                    _this.c = value.c.slice();
                } else {
                    // Parse string or number value.
                    (function parseValue(bigNumInstance, inputValue) {
                        var decimalPointIndex, exponentIndex, parsedCoefficients;
                        if (inputValue === 0 && 1 / inputValue < 0) {
                            inputValue = "-0"; // Handle negative zero.
                        } else if (!BIG_NUMBER_REGEX.test(inputValue += "")) {
                            throw Error(BIG_JS_ERROR_PREFIX + "Invalid number");
                        }

                        bigNumInstance.s = (inputValue.charAt(0) === "-") ? (inputValue = inputValue.slice(1), -1) : 1;
                        decimalPointIndex = inputValue.indexOf(".");
                        if (decimalPointIndex > -1) {
                            inputValue = inputValue.replace(".", "");
                        }

                        exponentIndex = inputValue.search(/e/i);
                        if (exponentIndex > 0) {
                            if (decimalPointIndex < 0) {
                                decimalPointIndex = exponentIndex;
                            }
                            decimalPointIndex += +inputValue.slice(exponentIndex + 1);
                            inputValue = inputValue.substring(0, exponentIndex);
                        } else if (decimalPointIndex < 0) {
                            decimalPointIndex = inputValue.length;
                        }

                        parsedCoefficients = inputValue.length;
                        var firstNonZeroIndex = 0;
                        while (firstNonZeroIndex < parsedCoefficients && inputValue.charAt(firstNonZeroIndex) === "0") {
                            firstNonZeroIndex++;
                        }

                        if (firstNonZeroIndex === parsedCoefficients) {
                            bigNumInstance.c = [bigNumInstance.e = 0]; // Value is zero.
                        } else {
                            while (parsedCoefficients > 0 && inputValue.charAt(parsedCoefficients - 1) === "0") {
                                parsedCoefficients--;
                            }
                            bigNumInstance.e = decimalPointIndex - firstNonZeroIndex - 1;
                            bigNumInstance.c = [];
                            var currentCoefficientIndex = 0;
                            while (firstNonZeroIndex <= parsedCoefficients - 1) {
                                bigNumInstance.c[currentCoefficientIndex++] = +inputValue.charAt(firstNonZeroIndex++);
                            }
                        }
                    })(_this, value);
                }
                _this.constructor = BigNumberConstructor; // Ensure constructor property is set.
            }

            // Assign prototype methods.
            BigNumberConstructor.prototype = BigNumberPrototype;

            // Default static properties for BigNumber.
            BigNumberConstructor.DP = 20; // Decimal Places
            BigNumberConstructor.RM = 1; // Rounding Mode (1 = RoundHalfUp)
            BigNumberConstructor.NE = -7; // Negative Exponent (e.g., 1e-7)
            BigNumberConstructor.PE = 21; // Positive Exponent (e.g., 1e+21)
            BigNumberConstructor.version = "5.2.2-cloned"; // Modified version string.

            return BigNumberConstructor;
        })();
        exportsObject.default = BigNumber; // Export as default.
    }
]);