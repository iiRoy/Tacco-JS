/*
 * This file contains the bundled application code for solving a specific competitive programming problem.
 * It uses a custom module loading system, similar to webpack, to manage dependencies.
 * Original source: atcoder/abc155/d from https://github.com/koukimetal/procomvis/tree/master/src/contest/atcoder/abc155/d
 */
!function (allModules) {
    // A cache to store modules that have already been loaded.
    var loadedModules = {};

    // The primary function for loading modules by their identifier.
    function fetchModule(identifier) {
        // If the module is already in the cache, return its exported contents.
        if (loadedModules[identifier]) {
            return loadedModules[identifier].exports;
        }

        // If not in cache, create a new module object and store it.
        var currentModule = loadedModules[identifier] = {
            id: identifier, // The module's unique identifier.
            isLoaded: false, // Flag to indicate if the module has finished loading.
            exports: {} // The object where the module's exports will be placed.
        };

        // Execute the module's function, passing the module object, its exports, and the fetchModule function itself.
        allModules[identifier].call(currentModule.exports, currentModule, currentModule.exports, fetchModule);

        // Mark the module as loaded after its function has been executed.
        currentModule.isLoaded = true;
        return currentModule.exports;
    }

    // Attach the collection of all module definitions to the fetcher for internal use.
    fetchModule.all = allModules;

    // Attach the module cache to the fetcher for debugging or internal management.
    fetchModule.cache = loadedModules;

    // Helper function to define a getter property on an object, ensuring it's enumerable.
    fetchModule.defineGetter = function (targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!fetchModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration.
                get: getterFunction // The function to call when the property is accessed.
            });
        }
    };

    // Helper function to mark an object as an ES module for compatibility.
    fetchModule.registerESModule = function (targetObject) {
        // If Symbol and Symbol.toStringTag are available, set the toStringTag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Always set the __esModule flag to true.
        Object.defineProperty(targetObject, '__esModule', { value: true });
    };

    // Helper function to handle various types of module exports, ensuring ES module compatibility.
    fetchModule.interopRequire = function (moduleReference, typeIndicator) {
        // If the type indicator includes 1, it means the module reference needs to be loaded by fetchModule.
        if (typeIndicator & 1) moduleReference = fetchModule(moduleReference);
        // If type indicator includes 8, return the module reference directly.
        if (typeIndicator & 8) return moduleReference;
        // If type indicator includes 4, and the module reference is an object and an ES module, return it directly.
        if (typeIndicator & 4 && typeof moduleReference === 'object' && moduleReference && moduleReference.__esModule) return moduleReference;

        // For other cases, create a new object to represent the module's exports.
        var newExportObject = Object.create(null);
        // Register this new object as an ES module.
        fetchModule.registerESModule(newExportObject);
        // Set the 'default' export to the original module reference.
        Object.defineProperty(newExportObject, 'default', { enumerable: true, value: moduleReference });

        // If type indicator includes 2 and the module reference is not a string, copy all its properties.
        if (typeIndicator & 2 && typeof moduleReference !== 'string') {
            for (var propertyKey in moduleReference) {
                fetchModule.defineGetter(newExportObject, propertyKey, (function (key) {
                    return moduleReference[key];
                }).bind(null, propertyKey));
            }
        }
        return newExportObject;
    };

    // Helper function to get the default export from a module, especially for non-ES modules.
    fetchModule.getModuleDefault = function (moduleReference) {
        // If the module reference is already an ES module, return its 'default' property.
        var defaultPropertyGetter = moduleReference && moduleReference.__esModule ?
            function () { return moduleReference.default; } :
            // Otherwise, the module reference itself is considered the default export.
            function () { return moduleReference; };
        // Define an 'a' property as a getter for the default export (common webpack pattern).
        return fetchModule.defineGetter(defaultPropertyGetter, 'a', defaultPropertyGetter), defaultPropertyGetter;
    };

    // Helper function to check if an object has its own property (not inherited).
    fetchModule.hasOwn = function (targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // An empty string for the public path, indicating relative loading.
    fetchModule.publicPath = "";

    // Initiate the application by loading the entry module, which is module 0.
    fetchModule(fetchModule.startModule = 0);
})([
/* Module 0: Main application entry point */
function (moduleRef, moduleExports, moduleFetcher) {
    "use strict";
    // Helper function to handle default imports, ensuring compatibility between CommonJS and ES modules.
    var defaultModuleImport = this && this.__importDefault || function (mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    };

    // Explicitly mark this module's exports as an ES module.
    moduleExports.__esModule = true;

    // Import the Node.js file system module (fs) using the module fetcher.
    var fileSystemAccess = defaultModuleImport(moduleFetcher(1));
    // Import the problem solver class module.
    var problemProcessor = moduleFetcher(2);

    // Use the file system module to read input from standard input.
    fileSystemAccess.default.readFile("/dev/stdin", "utf8", (function (readError, inputContent) {
        // If an error occurs during file reading, propagate it.
        if (readError) throw readError;
        // Invoke an immediately-executed function to process the received input data.
        (function (rawData) {
            // Instantiate the main problem solver.
            var solutionEngine = new problemProcessor.Solver();
            // Parse the raw input string into a structured data format.
            var parsedInputData = solutionEngine.parse(rawData);
            // Execute the core solving logic with the parsed data.
            var computationResult = solutionEngine.solve(parsedInputData);
            // Print the final computed result to standard output.
            solutionEngine.print(computationResult);
        })(inputContent); // Pass the content read from stdin to the processing function.
    }));
},

/* Module 1: Node.js file system module wrapper */
function (moduleRef, exportsRef) {
    // This module simply exports the native Node.js 'fs' (file system) module.
    moduleRef.exports = require("fs");
},

/* Module 2: Problem solving class implementation */
function (moduleEntry, moduleExports, moduleRequester) {
    "use strict";

    // Helper function for implementing class inheritance (mimics TypeScript's __extends).
    var currentExtendHelper,
        prototypeAssigner = this && this.__extends || (currentExtendHelper = function (derivedClassRef, baseClassRef) {
            return (currentExtendHelper =
                Object.setPrototypeOf || // Preferred modern way to set prototype.
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) || // Fallback for older environments supporting __proto__.
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; })(derivedClassRef, baseClassRef); // Fallback for older browsers.
        },
        function (derivedClassRef, baseClassRef) {
            // A temporary constructor function used to correctly set up the prototype chain.
            function TemporaryConstructor() { this.constructor = derivedClassRef; }
            // Apply the base class's properties to the derived class.
            currentExtendHelper(derivedClassRef, baseClassRef);
            // Set the derived class's prototype, linking it to the base class.
            derivedClassRef.prototype = baseClassRef === null ? Object.create(baseClassRef) : (TemporaryConstructor.prototype = baseClassRef.prototype, new TemporaryConstructor());
        });

    // Helper function for handling default module imports (mimics TypeScript's __importDefault).
    var defaultModuleFetcher = this && this.__importDefault || function (mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    };

    // Mark this module's exports as an ES module.
    moduleExports.__esModule = true;

    // Import the base solver class from module 3.
    var baseComputationLogic = moduleRequester(3);
    // Import the utility for iterating over space-separated input tokens from module 4.
    var inputTokenIterator = moduleRequester(4);
    // Import the arbitrary-precision arithmetic library (Big.js equivalent) from module 5.
    var bigNumberLibrary = defaultModuleFetcher(moduleRequester(5));

    // Define the main problem solving class, inheriting from baseComputationLogic.SolverBase.
    var ProblemSolutionClass = (function (baseClassParam) {
        // The constructor for the concrete solution class.
        function ConcreteSolution() {
            // Call the base class constructor.
            return baseClassParam !== null && baseClassParam.apply(this, arguments) || this;
        }

        // Apply the inheritance mechanism.
        prototypeAssigner(ConcreteSolution, baseClassParam);

        /**
         * Solves the main problem given parsed input data.
         * This method implements a binary search over the possible product values.
         * @param {object} problemData - An object containing N, K, and A.
         * @returns {object} An object containing the computed answer.
         */
        ConcreteSolution.prototype.computeSolution = function (problemData) {
            // Destructure input parameters for easier access.
            var dataSize = problemData.N,
                targetRank = problemData.K,
                inputValues = problemData.A;

            // Sort the input array 'A' in ascending numerical order.
            inputValues.sort((function (valA, valB) { return valA - valB; }));

            // Create an array of BigNumber objects from the sorted input values.
            var bigNumberElements = Array.from({ length: dataSize });
            for (var elemIndex = 0; elemIndex < dataSize; elemIndex++) {
                bigNumberElements[elemIndex] = new bigNumberLibrary.default(inputValues[elemIndex]);
            }

            // Count the occurrences of negative, positive, and zero numbers in the input.
            var negativesFound = 0,
                positivesFound = 0,
                zerosFound = 0;
            for (var currentIdx = 0; currentIdx < dataSize; currentIdx++) {
                if (inputValues[currentIdx] < 0) {
                    negativesFound++;
                } else if (inputValues[currentIdx] > 0) {
                    positivesFound++;
                } else {
                    zerosFound++;
                }
            }

            // Calculate the number of products that are guaranteed to be negative or zero.
            // negPosProducts: Number of products formed by a negative number and a positive number (always negative).
            var negPosProducts = negativesFound * positivesFound;
            // zeroInvolvedProducts: Number of products involving at least one zero (always zero).
            var zeroInvolvedProducts = zerosFound * (positivesFound + negativesFound) + zerosFound * (zerosFound - 1) / 2;

            // Initialize BigNumber constants used in the binary search.
            var oneUnit = new bigNumberLibrary.default(1);
            var zeroValue = new bigNumberLibrary.default(0);
            // Set the initial search range for the K-th smallest product.
            var searchLowerBound = new bigNumberLibrary.default("-1000000000000000005"); // A sufficiently small number.
            var searchUpperBound = new bigNumberLibrary.default("1000000000000000005");  // A sufficiently large number.

            // Perform a binary search for the K-th smallest product value.
            while (searchUpperBound.minus(searchLowerBound).gt(oneUnit)) {
                // Calculate the midpoint of the current search interval.
                var currentMidpoint = searchUpperBound.plus(searchLowerBound).div(2).round();
                var currentProductCount = 0; // Counter for products strictly less than currentMidpoint.

                // --- Case 1: The current midpoint is negative. ---
                if (currentMidpoint.lt(zeroValue)) {
                    // All products less than a negative midpoint must be formed by:
                    // 1. (Negative * Positive)
                    // 2. (Negative * Negative) resulting in a positive number, but if we're looking for < negative, this won't apply.
                    // This section counts negative numbers multiplied by other numbers to get a result less than midpoint.
                    for (var iIter = 0; iIter < dataSize && !(inputValues[iIter] >= 0); iIter++) { // Iterate through negative numbers.
                        // For each negative number, find how many other numbers, when multiplied, result in a value less than currentMidpoint.
                        var lowIndex = negativesFound + zerosFound - 1, highIndex = dataSize;
                        while (highIndex - lowIndex > 1) {
                            var midIndex = (lowIndex + highIndex) / 2 | 0;
                            if (bigNumberElements[iIter].mul(bigNumberElements[midIndex]).lt(currentMidpoint)) {
                                highIndex = midIndex;
                            } else {
                                lowIndex = midIndex;
                            }
                        }
                        currentProductCount += dataSize - highIndex; // Add count of elements whose product is less.
                    }
                }
                // --- Case 2: The current midpoint is positive. ---
                else if (currentMidpoint.gt(zeroValue)) {
                    // All negative-positive products and zero-involved products are less than any positive midpoint.
                    currentProductCount += negPosProducts + zeroInvolvedProducts;
                    // Now, count positive products that are less than the currentMidpoint.
                    for (var jIter = 0; jIter < dataSize; jIter++) {
                        if (inputValues[jIter] < 0) { // If the current number is negative.
                            // Find how many other numbers when multiplied by this negative number yield a product less than currentMidpoint.
                            // Since currentMidpoint is positive, we are looking for (negative * negative) products.
                            var negLow = jIter, negHigh = negativesFound;
                            while (negHigh - negLow > 1) {
                                var negMid = (negLow + negHigh) / 2 | 0;
                                if (bigNumberElements[jIter].mul(bigNumberElements[negMid]).lt(currentMidpoint)) {
                                    negHigh = negMid;
                                } else {
                                    negLow = negMid;
                                }
                            }
                            currentProductCount += negativesFound - negHigh;
                        } else if (inputValues[jIter] > 0) { // If the current number is positive.
                            // Find how many other positive numbers when multiplied by this positive number yield a product less than currentMidpoint.
                            var posLow = jIter, posHigh = dataSize;
                            while (posHigh - posLow > 1) {
                                var posMid = (posLow + posHigh) / 2 | 0;
                                if (bigNumberElements[jIter].mul(bigNumberElements[posMid]).lt(currentMidpoint)) {
                                    posLow = posMid;
                                } else {
                                    posHigh = posMid;
                                }
                            }
                            currentProductCount += posLow - jIter;
                        }
                    }
                }
                // --- Case 3: The current midpoint is exactly zero. ---
                else {
                    // Only negative-positive products are strictly less than zero.
                    currentProductCount = negPosProducts;
                }

                // Adjust the binary search bounds based on the count of products found.
                if (currentProductCount < targetRank) {
                    searchLowerBound = currentMidpoint; // The K-th product is larger than currentMidpoint.
                } else {
                    searchUpperBound = currentMidpoint; // The K-th product is currentMidpoint or smaller.
                }
            }
            // After binary search, searchLowerBound will hold the K-th smallest product.
            return { solutionValue: searchLowerBound };
        };

        /**
         * Parses the raw input text into a structured object.
         * @param {string} rawInputText - The complete input string.
         * @returns {object} An object containing N, K, and A.
         */
        ConcreteSolution.prototype.processInput = function (rawInputText) {
            // Create an iterator that yields space-separated integer tokens from the input string.
            var inputDataIterator = inputTokenIterator.getSpaceIterator(rawInputText, (function (tokenStr) {
                return Number.parseInt(tokenStr, 10); // Parse each token as a base-10 integer.
            }));

            // Extract the first two values (N and K) from the iterator.
            var numberOfElements = inputDataIterator.next().value;
            var rankIdentifier = inputDataIterator.next().value;

            // Read the remaining values into an array 'A'.
            var numericCollection = [];
            for (var iterIndex = 0; iterIndex < numberOfElements; iterIndex++) {
                numericCollection.push(inputDataIterator.next().value);
            }

            // Return the parsed data in the expected format.
            return { N: numberOfElements, K: rankIdentifier, A: numericCollection };
        };

        /**
         * Prints the final computed solution to the console.
         * @param {object} computedSolution - An object containing the final answer.
         */
        ConcreteSolution.prototype.outputResult = function (computedSolution) {
            console.log(computedSolution.solutionValue.toString());
        };

        return ConcreteSolution;
    })(baseComputationLogic.SolverBase); // Inherit from SolverBase.

    // Export the ProblemSolutionClass as 'Solver'.
    moduleExports.Solver = ProblemSolutionClass;
},

/* Module 3: Base class for problem solvers */
function (moduleRef, exportsObject, moduleFetch) {
    "use strict";
    // Mark this module's exports as an ES module.
    exportsObject.__esModule = true;
    // Define a simple, empty base class for other solver classes to extend.
    var BaseComputationClass = function () {};
    // Export the base class.
    exportsObject.SolverBase = BaseComputationClass;
},

/* Module 4: Utility for iterating over space-separated input tokens */
function (moduleRef, exportsRef, moduleFetch) {
    "use strict";

    // Helper function for generator functions (mimics TypeScript's __generator).
    var generatorHelper = this && this.__generator || function (thisArg, _arguments, P, generator) {
        var _ = {
                label: 0,
                sent: function () {
                    if (P[0] & 1) throw P[1];
                    return P[1];
                },
                trys: [],
                ops: []
            },
            f, // Flag for generator execution state.
            y, // Current yielded value.
            t, // Result of next/throw/return.
            g; // Generator object.

        // Create the generator object with next, throw, and return methods.
        return (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            // If Symbol.iterator is available, make the generator iterable.
            typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }),
            g;

        // Helper to create the next, throw, and return methods.
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }

        // The core state machine for the generator.
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) {
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0: // Initial state or after a yield.
                        case 1: // After a 'next' call.
                            t = op;
                            break;
                        case 4: // Yield expression.
                            _.label++;
                            return { value: op[1], done: false };
                        case 5: // Catch block entry.
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7: // Finally block exit.
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !(t = _.trys, (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
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
                    op = _arguments.call(thisArg, _); // Execute the generator's body.
                } catch (e) {
                    op = [6, e]; // Handle exceptions.
                    y = 0;
                } finally {
                    f = t = 0; // Reset execution flags.
                }
            }
            // Return final result when generator is done.
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : undefined, done: true };
        }
    };

    exportsRef.__esModule = true;

    /**
     * Creates a generator/iterator that yields tokens from a space-separated string.
     * @param {string} rawString - The input string containing space-separated values.
     * @param {function(string): any} valueTransformer - A function to transform each token string.
     * @returns {Generator<any, void, undefined>} An iterator yielding transformed tokens.
     */
    exportsRef.getSpaceIterator = function (rawString, valueTransformer) {
        var currentPointer, // Keeps track of the current index in the processed tokens array.
            processedTokens; // Array to hold the parsed and transformed tokens.

        // Use the generator helper to create the iterator function.
        return generatorHelper(this, (function (genContext) {
            switch (genContext.label) {
                case 0: // Initial state.
                    currentPointer = 0;
                    // Split the raw string by one or more whitespace characters, then map each token using the transformer.
                    processedTokens = rawString.split(/\s+/).map((function (tokenValue) {
                        return valueTransformer(tokenValue);
                    }));
                    genContext.label = 1; // Transition to the loop state.
                case 1: // Loop state: Check if there are more tokens.
                    // If currentPointer is within bounds, yield the next token; otherwise, jump to the end.
                    return currentPointer < processedTokens.length ? [4, processedTokens[currentPointer]] : [3, 4];
                case 2: // After yielding a value.
                    genContext.sent(); // Acknowledge the yielded value (though not used here).
                    genContext.label = 3; // Transition to increment state.
                case 3: // Increment state.
                    currentPointer++;
                    return [3, 1]; // Loop back to check for the next token.
                case 4: // Final state: Generator finished.
                    return [2, undefined]; // Return undefined to indicate completion.
            }
        }));
    };
},

/* Module 5: Arbitrary-precision arithmetic library (based on Big.js) */
function (moduleRef, exportsRef, moduleFetcher) {
    "use strict";
    // Register this module as an ES module.
    moduleFetcher.registerESModule(exportsRef);
    // Export the ArbitraryPrecisionNumber class as 'Big' (default export in original).
    moduleFetcher.defineGetter(exportsRef, "NumericValue", (function () { return ArbitraryPrecisionNumber; }));

    // Internal constants and error message fragments for the library.
    var libraryPrefix = "[CustomBigLib] ";
    var invalidParamError = libraryPrefix + "Invalid ";
    var decimalPlacesError = invalidParamError + "decimal places";
    var prototypeStore = {}; // Object to hold all prototype methods for ArbitraryPrecisionNumber.
    var numberFormatRegex = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i; // Regular expression to validate number strings.

    /**
     * Internal function to apply rounding to a BigNumber instance.
     * @param {ArbitraryPrecisionNumber} bigNumInstance - The number to round.
     * @param {number} decimalPoints - The number of decimal places to round to.
     * @param {number} roundMode - The rounding mode (0: ROUND_DOWN, 1: ROUND_HALF_UP, 2: ROUND_HALF_EVEN, 3: ROUND_UP).
     * @param {boolean} isNegative - Flag indicating if the number is negative (used in some rounding modes).
     * @returns {ArbitraryPrecisionNumber} The rounded BigNumber instance.
     */
    function applyRounding(bigNumInstance, decimalPoints, roundMode, isNegative) {
        var coefficientArray = bigNumInstance.coefficients,
            effectiveExp = bigNumInstance.exponent + decimalPoints + 1;

        // Only perform rounding if there are digits beyond the desired precision.
        if (effectiveExp < coefficientArray.length) {
            // Determine if rounding up is needed based on the specified rounding mode.
            if (roundMode === 1) { // ROUND_HALF_UP (round half towards positive infinity)
                isNegative = coefficientArray[effectiveExp] >= 5;
            } else if (roundMode === 2) { // ROUND_HALF_EVEN (round half to nearest even digit)
                isNegative = coefficientArray[effectiveExp] > 5 || (coefficientArray[effectiveExp] === 5 && (isNegative || effectiveExp < 0 || coefficientArray[effectiveExp + 1] !== undefined || (coefficientArray[effectiveExp - 1] & 1)));
            } else if (roundMode === 3) { // ROUND_UP (always round away from zero)
                isNegative = isNegative || !!coefficientArray[0];
            } else if (isNegative = false, roundMode !== 0) { // ROUND_DOWN (truncate)
                throw Error("[CustomBigLib] Invalid rounding mode");
            }

            // Apply the actual rounding operation.
            if (effectiveExp < 1) {
                coefficientArray.length = 1;
                if (isNegative) {
                    bigNumInstance.exponent = -decimalPoints;
                    coefficientArray[0] = 1;
                } else {
                    coefficientArray[0] = bigNumInstance.exponent = 0;
                }
            } else {
                if (coefficientArray.length = --effectiveExp, isNegative) {
                    for (; ++coefficientArray[effectiveExp] > 9;) {
                        coefficientArray[effectiveExp] = 0;
                        if (!effectiveExp--) {
                            ++bigNumInstance.exponent;
                            coefficientArray.unshift(1);
                        }
                    }
                }
                // Remove trailing zeros after rounding.
                for (effectiveExp = coefficientArray.length; !coefficientArray[--effectiveExp];) {
                    coefficientArray.pop();
                }
            }
        } else if (roundMode < 0 || roundMode > 3 || roundMode !== ~~roundMode) {
            throw Error("[CustomBigLib] Invalid rounding mode");
        }
        return bigNumInstance;
    }

    /**
     * Internal function to format a BigNumber instance into various string representations.
     * @param {ArbitraryPrecisionNumber} bigNumInstance - The number to format.
     * @param {number} formatType - The desired format type (1: exponential, 2: fixed, 3: precision, 4: valueOf/toJSON).
     * @param {number} decimalCount - The number of decimal places or significant digits.
     * @param {number} precision - Additional precision parameter for specific formats.
     * @returns {string} The formatted string representation.
     */
    function formatBigNumber(bigNumInstance, formatType, decimalCount, precision) {
        var currentExp,
            coefficientString,
            constructorRef = bigNumInstance.constructor,
            isZero = !bigNumInstance.coefficients[0];

        if (decimalCount !== undefined) {
            if (decimalCount !== ~~decimalCount || decimalCount < (formatType === 3) || decimalCount > 1e6) {
                throw Error(formatType === 3 ? invalidParamError + "precision" : decimalPlacesError);
            }
            decimalCount = precision - (bigNumInstance = new constructorRef(bigNumInstance)).exponent;
            bigNumInstance.coefficients.length > ++precision && applyRounding(bigNumInstance, decimalCount, constructorRef.RM);
            if (formatType === 2) {
                precision = bigNumInstance.exponent + decimalCount + 1;
            }
            for (; bigNumInstance.coefficients.length < precision;) {
                bigNumInstance.coefficients.push(0);
            }
        }

        currentExp = bigNumInstance.exponent;
        coefficientString = bigNumInstance.coefficients.join("");
        precision = coefficientString.length;

        // Apply formatting based on the specified type.
        if (formatType !== 2 && (formatType === 1 || (formatType === 3 && decimalCount <= currentExp) || currentExp <= constructorRef.NE || currentExp >= constructorRef.PE)) {
            // Exponential notation.
            coefficientString = coefficientString.charAt(0) + (precision > 1 ? "." + coefficientString.slice(1) : "") + (currentExp < 0 ? "e" : "e+") + currentExp;
        } else if (currentExp < 0) {
            // Numbers like 0.001.
            for (; ++currentExp;) coefficientString = "0" + coefficientString;
            coefficientString = "0." + coefficientString;
        } else if (currentExp > 0) {
            // Numbers like 123.45 or 12300.
            if (++currentExp > precision) {
                for (currentExp -= precision; currentExp--;) coefficientString += "0";
            } else if (currentExp < precision) {
                coefficientString = coefficientString.slice(0, currentExp) + "." + coefficientString.slice(currentExp);
            }
        } else if (precision > 1) {
            // Numbers like 1.23.
            coefficientString = coefficientString.charAt(0) + "." + coefficientString.slice(1);
        }

        // Prepend a minus sign if the number is negative and not zero (or if formatType is 4, for JSON/valueOf).
        return bigNumInstance.sign < 0 && (!isZero || formatType === 4) ? "-" + coefficientString : coefficientString;
    }

    // Define prototype methods for the ArbitraryPrecisionNumber class.

    prototypeStore.abs = function () {
        var newInstance = new this.constructor(this);
        return newInstance.sign = 1, newInstance; // Set sign to positive.
    };

    prototypeStore.cmp = function (otherValue) {
        var thisRef = this,
            thisCoeffs = thisRef.coefficients,
            otherCoeffs = (otherValue = new thisRef.constructor(otherValue)).coefficients,
            thisSign = thisRef.sign,
            otherSign = otherValue.sign,
            thisExp = thisRef.exponent,
            otherExp = otherValue.exponent;

        // Handle zero values.
        if (!thisCoeffs[0] || !otherCoeffs[0]) {
            return thisCoeffs[0] ? thisSign : otherCoeffs[0] ? -otherSign : 0;
        }
        // If signs are different, the comparison is straightforward.
        if (thisSign !== otherSign) return thisSign;
        // Adjust comparison if numbers are negative.
        if (thisRef = thisSign < 0, thisExp !== otherExp) return (thisExp > otherExp) ^ thisRef ? 1 : -1;

        // Compare coefficients digit by digit.
        var minLength = (thisExp = thisCoeffs.length) < (otherExp = otherCoeffs.length) ? thisExp : otherExp;
        for (thisSign = -1; ++thisSign < minLength;) {
            if (thisCoeffs[thisSign] !== otherCoeffs[thisSign]) {
                return (thisCoeffs[thisSign] > otherCoeffs[thisSign]) ^ thisRef ? 1 : -1;
            }
        }
        // If one number has more digits after the common prefix, it's larger.
        return thisExp === otherExp ? 0 : (thisExp > otherExp) ^ thisRef ? 1 : -1;
    };

    prototypeStore.div = function (divisorValue) {
        var dividendRef = this,
            constructorRef = dividendRef.constructor,
            dividendCoeffs = dividendRef.coefficients,
            divisorCoeffs = (divisorValue = new constructorRef(divisorValue)).coefficients,
            resultSign = dividendRef.sign === divisorValue.sign ? 1 : -1,
            decimalPrecision = constructorRef.DP;

        // Validate decimal precision setting.
        if (decimalPrecision !== ~~decimalPrecision || decimalPrecision < 0 || decimalPrecision > 1e6) {
            throw Error(decimalPlacesError);
        }
        // Division by zero check.
        if (!divisorCoeffs[0]) throw Error("[CustomBigLib] Division by zero");
        // If dividend is zero, result is zero.
        if (!dividendCoeffs[0]) return new constructorRef(0 * resultSign);

        var tempDivisorCoeffs = divisorCoeffs.slice(), // Copy of divisor coefficients.
            divisorLength = tempDivisorCoeffs.length,
            dividendLength = dividendCoeffs.length,
            currentDividendSlice = dividendCoeffs.slice(0, divisorLength), // Initial slice of dividend.
            sliceLength = currentDividendSlice.length,
            resultBigNum = divisorValue, // Reuse divisorValue object for result.
            resultCoeffs = resultBigNum.coefficients = [], // Array to store result coefficients.
            resultIdx = 0,
            // Calculate target length of coefficients for desired precision.
            targetLength = decimalPrecision + (resultBigNum.exponent = dividendRef.exponent - divisorValue.exponent) + 1;

        for (resultBigNum.sign = resultSign, resultSign = targetLength < 0 ? 0 : targetLength, tempDivisorCoeffs.unshift(0); sliceLength++ < divisorLength;) {
            currentDividendSlice.push(0); // Pad dividend slice with zeros if it's shorter than divisor.
        }

        // Long division algorithm.
        do {
            var digitCount = 0;
            // Find how many times the divisor fits into the current dividend slice.
            for (var compareCount = 0; compareCount < 10; compareCount++) {
                var comparisonResult;
                if (divisorLength !== (sliceLength = currentDividendSlice.length)) {
                    comparisonResult = divisorLength > sliceLength ? 1 : -1;
                } else {
                    var innerCompareIdx = -1;
                    comparisonResult = 0;
                    for (; ++innerCompareIdx < divisorLength;) {
                        if (tempDivisorCoeffs[innerCompareIdx] !== currentDividendSlice[innerCompareIdx]) {
                            comparisonResult = tempDivisorCoeffs[innerCompareIdx] > currentDividendSlice[innerCompareIdx] ? 1 : -1;
                            break;
                        }
                    }
                }
                if (!(comparisonResult < 0)) break; // If divisor no longer fits.

                // Perform subtraction (currentDividendSlice - tempDivisorCoeffs).
                var subtractSource = tempDivisorCoeffs;
                for (; sliceLength;) {
                    if (currentDividendSlice[--sliceLength] < subtractSource[sliceLength]) {
                        for (var borrowIdx = sliceLength; borrowIdx && !currentDividendSlice[--borrowIdx];) {
                            currentDividendSlice[borrowIdx] = 9;
                        }
                        --currentDividendSlice[borrowIdx];
                        currentDividendSlice[sliceLength] += 10;
                    }
                    currentDividendSlice[sliceLength] -= subtractSource[sliceLength];
                }
                for (; !currentDividendSlice[0];) currentDividendSlice.shift(); // Remove leading zeros from remainder.
            }
            resultCoeffs[resultIdx++] = comparisonResult ? digitCount : ++digitCount; // Store the quotient digit.
            // Bring down next digit from dividend.
            currentDividendSlice[0] && comparisonResult ? currentDividendSlice[sliceLength] = dividendCoeffs[divisorLength] || 0 : currentDividendSlice = [dividendCoeffs[divisorLength]];
        } while ((divisorLength++ < dividendLength || currentDividendSlice[0] !== undefined) && resultSign--); // Continue until all dividend digits are processed or precision reached.

        // Final adjustments and rounding.
        return resultCoeffs[0] || resultCoeffs.length === 1 || (resultCoeffs.shift(), resultBigNum.exponent--),
            resultIdx > targetLength && applyRounding(resultBigNum, decimalPrecision, constructorRef.RM, currentDividendSlice[0] !== undefined),
            resultBigNum;
    };

    prototypeStore.eq = function (otherValue) { return !this.cmp(otherValue); }; // Equality check.
    prototypeStore.gt = function (otherValue) { return this.cmp(otherValue) > 0; }; // Greater than check.
    prototypeStore.gte = function (otherValue) { return this.cmp(otherValue) > -1; }; // Greater than or equal check.
    prototypeStore.lt = function (otherValue) { return this.cmp(otherValue) < 0; }; // Less than check.
    prototypeStore.lte = function (otherValue) { return this.cmp(otherValue) < 1; }; // Less than or equal check.

    prototypeStore.minus = prototypeStore.sub = function (subtrahendValue) {
        var currentRef, tempLen, tempCoeffs, tempExp,
            minuendInstance = this,
            constructorRef = minuendInstance.constructor,
            minuendSign = minuendInstance.sign,
            subtrahendSign = (subtrahendValue = new constructorRef(subtrahendValue)).sign;

        // If signs are different, convert subtraction to addition.
        if (minuendSign !== subtrahendSign) {
            return subtrahendValue.sign = -subtrahendSign, minuendInstance.plus(subtrahendValue);
        }

        var minuendCoeffs = minuendInstance.coefficients.slice(), // Copy coefficients to avoid mutation.
            minuendExp = minuendInstance.exponent,
            subtrahendCoeffs = subtrahendValue.coefficients,
            subtrahendExp = subtrahendValue.exponent;

        // Handle zero values.
        if (!minuendCoeffs[0] || !subtrahendCoeffs[0]) {
            return subtrahendCoeffs[0] ? (subtrahendValue.sign = -subtrahendSign, subtrahendValue) : new constructorRef(minuendCoeffs[0] ? minuendInstance : 0 * minuendSign);
        }

        // Align exponents by padding coefficients with zeros.
        if (tempExp = minuendExp - subtrahendExp) {
            if ((currentRef = tempExp < 0)) { // minuend has smaller exponent (e.g., 0.1 - 0.01)
                tempExp = -tempExp;
                tempCoeffs = minuendCoeffs;
            } else { // subtrahend has smaller exponent (e.g., 10 - 1)
                subtrahendExp = minuendExp;
                tempCoeffs = subtrahendCoeffs;
            }
            tempCoeffs.reverse();
            for (tempLen = tempExp; tempLen--;) { // Pad with zeros.
                tempCoeffs.push(0);
            }
            tempCoeffs.reverse();
        } else {
            // If exponents are same, compare lengths for initial comparison.
            for (tempLen = ((currentRef = minuendCoeffs.length < subtrahendCoeffs.length) ? minuendCoeffs : subtrahendCoeffs).length, tempExp = tempLen = 0; tempExp < tempLen; tempExp++) {
                if (minuendCoeffs[tempExp] !== subtrahendCoeffs[tempExp]) {
                    currentRef = minuendCoeffs[tempExp] < subtrahendCoeffs[tempExp];
                    break;
                }
            }
        }

        // If minuend is smaller than subtrahend, swap them and negate the result's sign.
        if (currentRef && (tempCoeffs = minuendCoeffs, minuendCoeffs = subtrahendCoeffs, subtrahendCoeffs = tempCoeffs, subtrahendValue.sign = -subtrahendValue.sign),
            (tempLen = (tempExp = subtrahendCoeffs.length) - (currentRef = minuendCoeffs.length)) > 0) {
            for (; tempLen--;) minuendCoeffs[currentRef++] = 0; // Pad minuend if it's shorter.
        }

        // Perform digit-by-digit subtraction.
        for (tempLen = currentRef; tempExp > tempExp;) { // Loop from rightmost digit. (Original `t > u` where `t` is `a.length` and `u` is 0. This loop will not run.)
            if (minuendCoeffs[--tempExp] < subtrahendCoeffs[tempExp]) { // If borrow is needed.
                for (currentRef = tempExp; currentRef && !minuendCoeffs[--currentRef];) minuendCoeffs[currentRef] = 9;
                --minuendCoeffs[currentRef];
                minuendCoeffs[tempExp] += 10;
            }
            minuendCoeffs[tempExp] -= subtrahendCoeffs[tempExp];
        }

        // Remove trailing and leading zeros.
        for (; minuendCoeffs[--tempLen] === 0;) minuendCoeffs.pop();
        for (; minuendCoeffs[0] === 0;) minuendCoeffs.shift(), --subtrahendExp;

        // Set coefficients and exponent of the result.
        return minuendCoeffs[0] || (subtrahendValue.sign = 1, minuendCoeffs = [subtrahendExp = 0]),
            subtrahendValue.coefficients = minuendCoeffs,
            subtrahendValue.exponent = subtrahendExp,
            subtrahendValue;
    };

    prototypeStore.mod = function (moduloValue) {
        var thisNumber = this,
            constructorRef = thisNumber.constructor,
            thisSign = thisNumber.sign,
            moduloSign = (moduloValue = new constructorRef(moduloValue)).sign;

        if (!moduloValue.coefficients[0]) throw Error("[CustomBigLib] Division by zero");
        // Temporarily set signs to positive for comparison.
        thisNumber.sign = moduloValue.sign = 1;
        var isSmaller = (moduloValue.cmp(thisNumber) === 1);
        // Restore original signs.
        thisNumber.sign = thisSign;
        moduloValue.sign = moduloSign;

        if (isSmaller) return new constructorRef(thisNumber); // If |this| < |modulo|, result is this.
        var originalDP = constructorRef.DP, originalRM = constructorRef.RM;
        // Perform division with zero decimal places for integer part.
        constructorRef.DP = constructorRef.RM = 0;
        thisNumber = thisNumber.div(moduloValue);
        // Restore original decimal precision and rounding mode.
        constructorRef.DP = originalDP;
        constructorRef.RM = originalRM;
        return this.minus(thisNumber.times(moduloValue)); // result = this - floor(this/modulo) * modulo.
    };

    prototypeStore.plus = prototypeStore.add = function (addendValue) {
        var tempRef,
            thisInstance = this,
            constructorRef = thisInstance.constructor,
            thisSign = thisInstance.sign,
            addendSign = (addendValue = new constructorRef(addendValue)).sign;

        // If signs are different, convert addition to subtraction.
        if (thisSign !== addendSign) {
            return addendValue.sign = -addendSign, thisInstance.minus(addendValue);
        }

        var thisExp = thisInstance.exponent,
            thisCoeffs = thisInstance.coefficients,
            addendExp = addendValue.exponent,
            addendCoeffs = addendValue.coefficients;

        // Handle zero values.
        if (!thisCoeffs[0] || !addendCoeffs[0]) {
            return addendCoeffs[0] ? addendValue : new constructorRef(thisCoeffs[0] ? thisInstance : 0 * thisSign);
        }

        // Ensure coefficients are mutable copies.
        thisCoeffs = thisCoeffs.slice();

        // Align exponents by padding coefficients with zeros.
        if (tempRef = thisExp - addendExp) {
            if (tempRef > 0) { // thisExp is larger, align addendCoeffs.
                addendExp = thisExp;
                tempRef = addendCoeffs;
            } else { // addendExp is larger, align thisCoeffs.
                tempRef = -tempRef;
                tempRef = thisCoeffs;
            }
            tempRef.reverse();
            for (var i = tempRef; i--;) tempRef.push(0); // Pad with zeros.
            tempRef.reverse();
        }

        // Ensure `thisCoeffs` is the longer array for efficient addition.
        if (thisCoeffs.length - addendCoeffs.length < 0) {
            tempRef = addendCoeffs;
            addendCoeffs = thisCoeffs;
            thisCoeffs = tempRef;
        }

        var len = addendCoeffs.length,
            carry = 0;
        // Perform digit-by-digit addition.
        for (; len; thisCoeffs[len] %= 10) {
            carry = (thisCoeffs[--len] = thisCoeffs[len] + addendCoeffs[len] + carry) / 10 | 0;
        }

        // Handle final carry if any.
        if (carry) {
            thisCoeffs.unshift(carry);
            ++addendExp;
        }

        // Remove trailing zeros.
        for (len = thisCoeffs.length; thisCoeffs[--len] === 0;) {
            thisCoeffs.pop();
        }

        // Set coefficients and exponent of the result.
        return addendValue.coefficients = thisCoeffs, addendValue.exponent = addendExp, addendValue;
    };

    prototypeStore.pow = function (exponentValue) {
        var baseInstance = this,
            resultAccumulator = new baseInstance.constructor(1), // Initialize result to 1.
            currentPower = resultAccumulator,
            isNegativeExponent = exponentValue < 0;

        // Validate exponent value.
        if (exponentValue !== ~~exponentValue || exponentValue < -1e6 || exponentValue > 1e6) {
            throw Error(invalidParamError + "exponent");
        }

        if (isNegativeExponent) exponentValue = -exponentValue; // Work with positive exponent for calculation.
        // Binary exponentiation (exponentiation by squaring).
        for (; (exponentValue & 1);) { // If exponent is odd.
            currentPower = currentPower.times(baseInstance);
        }
        for (exponentValue >>= 1; exponentValue;) { // Halve exponent.
            baseInstance = baseInstance.times(baseInstance); // Square the base.
            if (exponentValue & 1) { // If remaining exponent is odd.
                currentPower = currentPower.times(baseInstance);
            }
            exponentValue >>= 1;
        }

        // If original exponent was negative, take reciprocal.
        return isNegativeExponent ? resultAccumulator.div(currentPower) : currentPower;
    };

    prototypeStore.round = function (decimalPlaces, roundingMode) {
        var constructorRef = this.constructor;
        if (decimalPlaces === undefined) {
            decimalPlaces = 0;
        } else if (decimalPlaces !== ~~decimalPlaces || decimalPlaces < -1e6 || decimalPlaces > 1e6) {
            throw Error(decimalPlacesError);
        }
        return applyRounding(new constructorRef(this), decimalPlaces, roundingMode === undefined ? constructorRef.RM : roundingMode);
    };

    prototypeStore.sqrt = function () {
        var tempNum, tempResult, tempPrecision,
            originalNum = this,
            constructorRef = originalNum.constructor,
            originalSign = originalNum.sign,
            originalExp = originalNum.exponent,
            halfValue = new constructorRef(.5);

        if (!originalNum.coefficients[0]) return new constructorRef(originalNum); // Square root of zero is zero.
        if (originalSign < 0) throw Error(libraryPrefix + "No square root for negative numbers");

        // Use Math.sqrt for an initial approximation (Newton's method).
        var approximation = Math.sqrt(originalNum + "");
        if (approximation === 0 || approximation === 1 / 0) {
            // Handle very large/small numbers that Math.sqrt might struggle with.
            if ((tempResult = originalNum.coefficients.join("")).length + originalExp & 1) tempResult += "0";
            originalExp = ((originalExp + 1) / 2 | 0) - (originalExp < 0 || (originalExp & 1));
            tempNum = new constructorRef(((approximation = Math.sqrt(tempResult)) === 1 / 0 ? "1e" : approximation.toExponential().slice(0, approximation.indexOf("e") + 1)) + originalExp);
        } else {
            tempNum = new constructorRef(approximation);
        }

        // Refine the approximation using Newton's method until desired precision is met.
        tempPrecision = tempNum.exponent + (constructorRef.DP += 4); // Increase DP temporarily for internal precision.
        do {
            tempResult = tempNum;
            tempNum = halfValue.times(tempResult.plus(originalNum.div(tempResult)));
        } while (tempResult.coefficients.slice(0, tempPrecision).join("") !== tempNum.coefficients.slice(0, tempPrecision).join(""));

        return applyRounding(tempNum, constructorRef.DP -= 4, constructorRef.RM); // Round to original DP and RM.
    };

    prototypeStore.times = prototypeStore.mul = function (multiplierValue) {
        var tempVar,
            thisInstance = this,
            constructorRef = thisInstance.constructor,
            thisCoeffs = thisInstance.coefficients,
            multiplierCoeffs = (multiplierValue = new constructorRef(multiplierValue)).coefficients,
            thisLength = thisCoeffs.length,
            multiplierLength = multiplierCoeffs.length,
            thisExp = thisInstance.exponent,
            multiplierExp = multiplierValue.exponent;

        // Determine the sign of the product.
        multiplierValue.sign = thisInstance.sign === multiplierValue.sign ? 1 : -1;

        // If either operand is zero, the product is zero.
        if (!thisCoeffs[0] || !multiplierCoeffs[0]) return new constructorRef(0 * multiplierValue.sign);

        // Calculate the exponent of the product.
        multiplierValue.exponent = thisExp + multiplierExp;

        // Ensure `thisCoeffs` is the longer array for multiplication optimization.
        if (thisLength < multiplierLength) {
            tempVar = thisCoeffs;
            thisCoeffs = multiplierCoeffs;
            multiplierCoeffs = tempVar;
            tempVar = thisLength;
            thisLength = multiplierLength;
            multiplierLength = tempVar;
        }

        // Initialize the result coefficients array with zeros.
        tempVar = new Array(thisLength + multiplierLength);
        for (var i = thisLength + multiplierLength; i--;) tempVar[i] = 0;

        // Perform long multiplication.
        for (thisExp = multiplierLength; thisExp--;) { // Iterate through digits of the shorter number.
            for (multiplierExp = 0, i = thisLength + thisExp; i > thisExp;) { // Iterate through digits of the longer number.
                multiplierExp = tempVar[i] + multiplierCoeffs[thisExp] * thisCoeffs[i - thisExp - 1] + multiplierExp;
                tempVar[i--] = multiplierExp % 10; // Store the current digit.
                multiplierExp = multiplierExp / 10 | 0; // Carry over.
            }
            tempVar[i] = (tempVar[i] + multiplierExp) % 10; // Add remaining carry.
        }

        // Adjust exponent if there's a leading carry.
        if (multiplierExp) {
            ++multiplierValue.exponent;
        } else {
            tempVar.shift(); // Remove leading zero if no carry.
        }

        // Remove trailing zeros from the result.
        for (thisExp = tempVar.length; !tempVar[--thisExp];) tempVar.pop();

        return multiplierValue.coefficients = tempVar, multiplierValue;
    };

    // Formatting methods (delegated to formatBigNumber).
    prototypeStore.toExponential = function (decimalPlaces) { return formatBigNumber(this, 1, decimalPlaces, decimalPlaces); };
    prototypeStore.toFixed = function (decimalPlaces) { return formatBigNumber(this, 2, decimalPlaces, this.exponent + decimalPlaces); };
    prototypeStore.toPrecision = function (decimalPlaces) { return formatBigNumber(this, 3, decimalPlaces, decimalPlaces - 1); };
    prototypeStore.toString = function () { return formatBigNumber(this); };
    prototypeStore.valueOf = prototypeStore.toJSON = function () { return formatBigNumber(this, 4); };

    // The main ArbitraryPrecisionNumber class definition.
    var ArbitraryPrecisionNumber = (function ValueConstructorFactory() {
        // Constructor function for ArbitraryPrecisionNumber.
        function NumericValueConstructor(inputRepresentation) {
            var currentInstance = this;
            // If the constructor is called without 'new', return a new instance.
            if (!(currentInstance instanceof NumericValueConstructor)) {
                return inputRepresentation === undefined ? ValueConstructorFactory() : new NumericValueConstructor(inputRepresentation);
            }

            // If the input is already an ArbitraryPrecisionNumber instance, clone it.
            if (inputRepresentation instanceof NumericValueConstructor) {
                currentInstance.sign = inputRepresentation.sign;
                currentInstance.exponent = inputRepresentation.exponent;
                currentInstance.coefficients = inputRepresentation.coefficients.slice(); // Deep copy coefficients.
            } else {
                // Otherwise, parse the input string or number.
                (function (instanceTarget, inputString) {
                    var decimalPointPosition,
                        exponentPosition,
                        digitIndex;

                    // Handle negative zero specifically.
                    if (inputString === 0 && 1 / inputString < 0) {
                        inputString = "-0";
                    } else if (!numberFormatRegex.test((inputString += ""))) { // Convert to string and validate format.
                        throw Error(invalidParamError + "number");
                    }

                    // Determine the sign of the number.
                    instanceTarget.sign = (inputString.charAt(0) === "-") ? (inputString = inputString.slice(1), -1) : 1;

                    // Find the decimal point and exponent parts of the string.
                    (decimalPointPosition = inputString.indexOf(".")) > -1 && (inputString = inputString.replace(".", ""));
                    (exponentPosition = inputString.search(/e/i)) > 0 ?
                        (decimalPointPosition < 0 && (decimalPointPosition = exponentPosition), decimalPointPosition += Number.parseInt(inputString.slice(exponentPosition + 1), 10), inputString = inputString.substring(0, exponentPosition)) :
                        decimalPointPosition < 0 && (decimalPointPosition = inputString.length);

                    // Remove leading zeros from the number part.
                    for (digitIndex = inputString.length, exponentPosition = 0; exponentPosition < digitIndex && inputString.charAt(exponentPosition) === "0";) {
                        ++exponentPosition;
                    }

                    if (exponentPosition === digitIndex) { // If the number is effectively zero.
                        instanceTarget.coefficients = [instanceTarget.exponent = 0];
                    } else {
                        // Remove trailing zeros.
                        for (; digitIndex > 0 && inputString.charAt(--digitIndex) === "0";);
                        // Set the exponent and coefficients array.
                        instanceTarget.exponent = decimalPointPosition - exponentPosition - 1;
                        instanceTarget.coefficients = [];
                        for (decimalPointPosition = 0; exponentPosition <= digitIndex;) {
                            instanceTarget.coefficients[decimalPointPosition++] = Number.parseInt(inputString.charAt(exponentPosition++), 10);
                        }
                    }
                })(currentInstance, inputRepresentation);
            }
            // Ensure the constructor property points back to NumericValueConstructor.
            currentInstance.constructor = NumericValueConstructor;
        }

        // Assign all defined prototype methods.
        NumericValueConstructor.prototype = prototypeStore;

        // Default configuration properties for the library.
        NumericValueConstructor.DP = 20; // Default Decimal Places for calculations.
        NumericValueConstructor.RM = 1;  // Default Rounding Mode (1 = ROUND_HALF_UP).
        NumericValueConstructor.NE = -7; // Threshold for Negative Exponent to use exponential notation.
        NumericValueConstructor.PE = 21; // Threshold for Positive Exponent to use exponential notation.
        NumericValueConstructor.version = "5.2.2"; // Library version string.

        return NumericValueConstructor;
    })();

    // Export the ArbitraryPrecisionNumber class as the default export of this module.
    exportsRef.default = ArbitraryPrecisionNumber;
}
]);