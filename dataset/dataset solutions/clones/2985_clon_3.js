!function(moduleDefinitions){
    // A mapping to cache already loaded modules by their unique identifier.
    var moduleResolutionCache = {};

    /**
     * Custom module loading mechanism, mimicking a simplified CommonJS/Webpack 'require' function.
     * @param {number} moduleId - The numerical ID of the module to be loaded.
     * @returns {object} The exported values of the requested module.
     */
    function customModuleLoader(moduleId) {
        // Check if the module is already present in our cache.
        if (moduleResolutionCache[moduleId]) {
            return moduleResolutionCache[moduleId].exports;
        }

        // If not cached, initialize a new module entry.
        // `ident`: module's unique ID.
        // `isInitialized`: flag to track if module's code has been executed.
        // `exports`: an object where the module's public interface will be stored.
        var newModuleEntry = moduleResolutionCache[moduleId] = {
            ident: moduleId,
            isInitialized: false,
            exports: {}
        };

        // Execute the module's definition function.
        // It receives the module entry itself, its exports object, and the loader function.
        moduleDefinitions[moduleId].call(newModuleEntry.exports, newModuleEntry, newModuleEntry.exports, customModuleLoader);

        // Mark the module as fully loaded and initialized.
        newModuleEntry.isInitialized = true;
        // Return the populated exports object.
        return newModuleEntry.exports;
    }

    // Expose internal references for potential debugging or advanced bundling features.
    customModuleLoader.moduleDefs = moduleDefinitions;
    customModuleLoader.moduleCache = moduleResolutionCache;

    /**
     * Helper to define a getter property on a target object, primarily for ES Module compatibility.
     * This ensures lazy evaluation and correct exposure of exports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} valueGetter - A function that returns the property's value when called.
     */
    customModuleLoader.attachExportGetter = function(targetObject, propertyName, valueGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!customModuleLoader.checkOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property discoverable during enumeration.
                get: valueGetter // The function to execute when the property is accessed.
            });
        }
    };

    /**
     * Marks a given module object as an ES Module.
     * This involves setting `Symbol.toStringTag` (if available) and `__esModule` flag.
     * @param {object} moduleObject - The module object to be marked.
     */
    customModuleLoader.declareEsModule = function(moduleObject) {
        // Utilize Symbol.toStringTag for better object type identification in modern JS environments.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the __esModule flag, a common convention for ES Modules in transpiled code.
        Object.defineProperty(moduleObject, '__esModule', { value: true });
    };

    /**
     * Constructs a synthetic namespace object for a module, handling various export patterns.
     * This function bridges the gap between different module systems (e.g., CommonJS and ES Modules).
     * @param {any} rawModuleValue - The direct value of the module (could be an ID, an object, etc.).
     * @param {number} processingModeFlags - A bitmask indicating how to interpret `rawModuleValue`.
     *   Bit 1: If set, `rawModuleValue` is a module ID, so resolve it using `customModuleLoader`.
     *   Bit 8: If set, return `rawModuleValue` directly as it's already the desired export.
     *   Bit 4: If set and `rawModuleValue` is an object already marked as `__esModule`, return it.
     *   Bit 2: If set and `rawModuleValue` is not a string, iterate its properties and expose them.
     * @returns {object} A namespace object containing 'default' and potentially other exports.
     */
    customModuleLoader.buildNamespaceObject = function(rawModuleValue, processingModeFlags) {
        // Handle module ID resolution.
        if (processingModeFlags & 1) rawModuleValue = customModuleLoader(rawModuleValue);
        // Direct return if specific flags are set.
        if (processingModeFlags & 8) return rawModuleValue;
        // Return existing ES Module object if applicable.
        if (processingModeFlags & 4 && typeof rawModuleValue === 'object' && rawModuleValue && rawModuleValue.__esModule) return rawModuleValue;

        // Create a blank object to serve as the namespace.
        var namespace = Object.create(null);
        customModuleLoader.declareEsModule(namespace); // Mark it as an ES Module.
        // Define a 'default' export property pointing to the module's main value.
        Object.defineProperty(namespace, 'default', { enumerable: true, value: rawModuleValue });

        // If the 'bind properties' flag is set and the module value isn't a string,
        // iterate its properties and add them to the namespace.
        if (processingModeFlags & 2 && typeof rawModuleValue !== 'string') {
            for (var propKey in rawModuleValue) {
                // Avoid overwriting 'default' and ensure it's an own property.
                if (propKey !== 'default' && customModuleLoader.checkOwnProp(rawModuleValue, propKey)) {
                    customModuleLoader.attachExportGetter(namespace, propKey, (function(key) {
                        return rawModuleValue[key];
                    }).bind(null, propKey)); // Use bind for correct scope.
                }
            }
        }
        return namespace;
    };

    /**
     * Retrieves the default export from a module, handling both CommonJS and ES Module patterns.
     * @param {object} moduleRef - The module object from which to extract the default export.
     * @returns {function} A getter function that returns the module's default export.
     */
    customModuleLoader.obtainDefaultExport = function(moduleRef) {
        // Determine the actual default export based on whether __esModule is set.
        var defaultExportGetter = moduleRef && moduleRef.__esModule ?
            function() { return moduleRef.default; } : // If ES Module, use .default.
            function() { return moduleRef; }; // Otherwise, the whole module is the default.
        // Attach this getter as a property 'a' (a common webpack convention) for convenience.
        customModuleLoader.attachExportGetter(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    /**
     * Checks if an object possesses a directly owned (non-inherited) property.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyName - The name of the property to check for.
     * @returns {boolean} True if the property is directly on the object, false otherwise.
     */
    customModuleLoader.checkOwnProp = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets; typically empty for server-side or bundled applications.
    customModuleLoader.assetPublicPath = "";

    // The entry point of the application: load and execute module with ID 2.
    customModuleLoader(customModuleLoader.entryModuleId = 2);

}([
    // Module 0: Integration with Node.js 'fs' (file system) module.
    function(currentModule, moduleExports) {
        currentModule.exports = require("fs");
    },
    // Module 1: Integration with Node.js 'readline' module.
    function(currentModule, moduleExports) {
        currentModule.exports = require("readline");
    },
    // Module 2: The primary application logic container.
    function(currentModule, moduleExports, moduleRequester) {
        "use strict"; // Enable strict mode for this module for cleaner code.

        // Declare this module's exports as an ES Module.
        moduleRequester.declareEsModule(moduleExports);

        // --- Solutions for AtCoder Beginner Contest 122 Series ---
        var abc122Solutions = {
            /**
             * Problem A: Double Helix - Determines the complementary DNA base for a given input base.
             * @param {string[]} inputBases - An array containing a single character string representing a DNA base.
             * @returns {string[]} An array containing the single character string of the complementary base.
             */
            retrieveComplementaryBase: function(inputBases) {
                const singleBase = inputBases[0];
                let resultBase;

                // Using a series of if-else if statements instead of a switch for diverse control flow.
                if (singleBase === 'A') {
                    resultBase = 'T';
                } else if (singleBase === 'T') {
                    resultBase = 'A';
                } else if (singleBase === 'C') {
                    resultBase = 'G';
                } else if (singleBase === 'G') {
                    resultBase = 'C';
                } else {
                    // Added a more descriptive error for invalid input, improving robustness.
                    throw new Error(`Unrecognized DNA base character: '${singleBase}'. Expected A, T, C, or G.`);
                }
                return [resultBase];
            },

            /**
             * Problem B: ATCoder - Identifies the maximum length of a continuous subsequence
             *            comprising only 'A', 'C', 'G', 'T' characters.
             * @param {string[]} inputLines - An array containing one string (the sequence to analyze).
             * @returns {string[]} An array containing the maximum length as a string.
             */
            calculateMaxACGTSequence: function(inputLines) {
                const targetSequence = inputLines[0];
                let longestStreak = 0;
                let currentStreak = 0;

                // Iterating through the sequence to count consecutive valid characters.
                for (let k = 0; k < targetSequence.length; k++) {
                    const charAtK = targetSequence[k];
                    // Using a Set for efficient character lookup (Type III change).
                    if (new Set(['A', 'T', 'C', 'G']).has(charAtK)) {
                        currentStreak++;
                    } else {
                        // If an invalid character breaks the streak, update the longest streak found so far.
                        if (currentStreak > longestStreak) {
                            longestStreak = currentStreak;
                        }
                        currentStreak = 0; // Reset the current streak.
                    }
                }
                // Final check in case the sequence ends with a valid streak.
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
                return [String(longestStreak)];
            },

            /**
             * Problem C: GeT AC - Counts occurrences of the "AC" substring within specified ranges of a given string.
             * @param {string[]} dataInputs - Array of input strings.
             *   dataInputs[0]: "N Q" (N = length of main string, Q = number of queries)
             *   dataInputs[1]: The main string S.
             *   dataInputs[2...]: Query lines, each "L R" (1-based start and end indices for a range).
             * @returns {string[]} An array of strings, where each string is the count for a corresponding query.
             */
            countACSubstringsInRanges: function(dataInputs) {
                // Destructure and parse the first line, string length and query count.
                const [strLen, queryCount] = dataInputs[0].split(" ").map(Number);
                const primaryString = dataInputs[1];
                // Parse all query ranges from subsequent input lines.
                const queryRanges = dataInputs.slice(2).map(rangeStr =>
                    rangeStr.split(" ").map(Number)
                );

                // Pre-calculate prefix sums for "AC" occurrences to answer queries efficiently.
                // `acPrefixSum[i]` stores the count of "AC" substrings where 'A' is at an index less than `i`.
                let acPrefixSum = Array(strLen + 1).fill(0); // Initialize with zeros.

                for (let i = 0; i < strLen; i++) {
                    acPrefixSum[i + 1] = acPrefixSum[i]; // Carry over previous count.
                    // Check for "AC" starting at current index `i`.
                    if (primaryString[i] === 'A' && primaryString[i + 1] === 'C') {
                        acPrefixSum[i + 1]++; // Increment count if "AC" found.
                    }
                }

                // Process each query using the precomputed prefix sums.
                return queryRanges.map(range => {
                    const rangeStart = range[0]; // 1-based start index.
                    const rangeEnd = range[1];   // 1-based end index.

                    // The count of "AC" substrings where 'A' is within [rangeStart-1, rangeEnd-2] (0-based).
                    // This is equivalent to `acPrefixSum[rangeEnd - 1] - acPrefixSum[rangeStart - 1]`.
                    const currentRangeCount = acPrefixSum[rangeEnd - 1] - acPrefixSum[rangeStart - 1];
                    return String(currentRangeCount);
                });
            }
        };

        // --- Solutions for Diverta 2019 Programming Contest ---
        var diverta2019Challenges = {
            /**
             * Problem C: (Original name not provided, but logic suggests segment counting with 'A'/'B').
             * Counts occurrences of 'AB' substrings and handles special cases for strings starting with 'B' or ending with 'A'.
             * @param {string[]} inputStrings - An array of strings. The first element is typically N, followed by N actual strings.
             * @returns {string[]} An array containing a single string, the total calculated count.
             */
            segmentCounterProblem: function(inputStrings) {
                // The first line contains N, the number of strings, which is implicitly handled by slice.
                const stringCount = Number(inputStrings[0].split(" ")[0]); // Keeping original parsing, though 'stringCount' isn't directly used later.
                const dataStrings = inputStrings.slice(1);

                let totalEmbeddedABs = 0;
                let numEndingWithA = 0;
                let numStartingWithB = 0;
                let numStartingBAndEndingA = 0; // Counts strings like "B...A".

                // Iterate through each input string to gather required statistics.
                for (const currentStr of dataStrings) {
                    // Count all 'AB' pairs within the string.
                    const matches = currentStr.match(/AB/g);
                    totalEmbeddedABs += matches ? matches.length : 0;

                    // Check string prefixes and suffixes.
                    if (currentStr.startsWith('B')) {
                        numStartingWithB++;
                    }
                    if (currentStr.endsWith('A')) {
                        numEndingWithA++;
                    }
                    // Check for strings that simultaneously start with 'B' and end with 'A'.
                    if (currentStr.startsWith('B') && currentStr.endsWith('A')) {
                        numStartingBAndEndingA++;
                    }
                }

                // Complex conditional logic based on specific edge cases in problem statement.
                // If all strings that end with 'A' also start with 'B', and vice-versa,
                // it implies a special chain formation scenario.
                if (numEndingWithA === numStartingBAndEndingA && numStartingWithB === numStartingBAndEndingA) {
                    // If there are such 'B...A' strings, they can form 'numStartingBAndEndingA - 1' additional 'AB' connections.
                    // If no such strings (numStartingBAndEndingA is 0), then no additional connections.
                    const additionalConnections = numStartingBAndEndingA > 0 ? (numStartingBAndEndingA - 1) : 0;
                    return [String(totalEmbeddedABs + additionalConnections)];
                } else {
                    // Otherwise, we can form connections up to the minimum of 'A'-ending and 'B'-starting strings.
                    const additionalConnections = Math.min(numEndingWithA, numStartingWithB);
                    return [String(totalEmbeddedABs + additionalConnections)];
                }
            },

            /**
             * Problem D: (Original name not provided, but logic suggests a variant of Sum of Divisors).
             * Calculates the sum of `N/divisor` for all divisors `divisor` of `N` such that `divisor < sqrt(N)`.
             * @param {string[]} inputNumbers - An array containing a single string representing the integer N.
             * @returns {string[]} An array with a single string, the computed sum.
             */
            calculatePartialDivisorSum: function(inputNumbers) {
                // Extract and parse the target integer from the input.
                const targetInteger = Number(inputNumbers[0].split(" ")[0]);

                // Adding a guard clause for non-positive inputs (Type III addition).
                if (targetInteger <= 0) {
                    console.error("Error: Input for divisor sum must be a positive integer.");
                    return ["0"]; // Return "0" for invalid input.
                }

                let accumulatedSum = 0;
                // Calculate the integer part of the square root of the target.
                const integerSqrt = Math.floor(Math.sqrt(targetInteger));

                // Iterate from 1 up to the integer part of the square root (inclusive).
                // Note: The original loop condition was `u < r` (currentDivisor < sqrtTarget), so it excluded `sqrtTarget` itself.
                // I will replicate that behavior by changing `u <= r` to `u < r`.
                for (let currentDiv = 1; currentDiv < integerSqrt; currentDiv++) {
                    // Check if `currentDiv` is a divisor of `targetInteger`.
                    if (targetInteger % currentDiv === 0) {
                        const complementaryDiv = targetInteger / currentDiv;
                        // Only add the complementary divisor, as per the original problem's specific sum.
                        accumulatedSum += complementaryDiv;
                    }
                }
                return [String(accumulatedSum)];
            }
        };

        // --- Helper Boolean Constants ---
        const BOOLEAN_TRUE_VAL = true;
        const BOOLEAN_FALSE_VAL = false;

        /**
         * A recursive helper function to determine the maximum number of adjacent toggle operations.
         * An operation consists of flipping two adjacent boolean values.
         * @param {boolean[]} booleanArr - The current state of the boolean array.
         * @returns {number} The maximum count of operations.
         */
        function findMaxAdjacentToggles(booleanArr) {
            /**
             * Internal helper to create a new array with two adjacent elements flipped.
             * @param {boolean[]} sourceArray - The original array.
             * @param {number} positionIndex - The index of the first element to flip.
             * @returns {boolean[]} A new array reflecting the flip.
             */
            const flipPair = (sourceArray, positionIndex) => {
                // Using spread syntax for an immutable array copy (Type III change).
                const tempArray = [...sourceArray];
                tempArray[positionIndex] = !tempArray[positionIndex];
                tempArray[positionIndex + 1] = !tempArray[positionIndex + 1];
                return tempArray;
            };

            // Identify all indices where BOOLEAN_TRUE_VAL is followed by BOOLEAN_FALSE_VAL.
            // These are the only valid points for a toggle operation.
            const potentialFlipPositions = [];
            for (let i = 0; i < booleanArr.length - 1; i++) {
                if (booleanArr[i] === BOOLEAN_TRUE_VAL && booleanArr[i + 1] === BOOLEAN_FALSE_VAL) {
                    potentialFlipPositions.push(i);
                }
            }

            // Base case: If no more flip positions, no further operations are possible.
            if (potentialFlipPositions.length === 0) {
                return 0;
            }

            // Recursively explore all possible next states.
            // Using `Math.max` with the spread operator for conciseness (Type III change).
            const resultsOfNextSteps = potentialFlipPositions.map(pos => {
                const nextStateArray = flipPair(booleanArr, pos);
                return findMaxAdjacentToggles(nextStateArray);
            });

            // Add 1 for the current operation and take the maximum from the subsequent operations.
            return 1 + Math.max(...resultsOfNextSteps);
        }

        /**
         * A recursive helper function to find the longest chain of numbers where any two adjacent numbers
         * in the chain sum up to a power of two.
         * @param {number[]} numberList - The list of numbers currently available to form a chain.
         * @returns {number} The maximum length of such a chain.
         */
        function findLongestPowerOfTwoChain(numberList) {
            // Base case: A chain needs at least two numbers to form a pair.
            if (numberList.length < 2) {
                return 0;
            }

            /**
             * Internal helper to check if the sum of two numbers is a power of two.
             * A positive integer 'x' is a power of two if `(x & (x - 1)) === 0`.
             * @param {number} val1 - The first number.
             * @param {number} val2 - The second number.
             * @returns {boolean} True if their sum is a power of two, false otherwise.
             */
            const isSumAPowerOfTwo = (val1, val2) => {
                const totalSum = val1 + val2;
                return totalSum > 0 && (totalSum & (totalSum - 1)) === 0;
            };

            let currentMaximumChainLength = 0;

            // Iterate through each number to consider it as the first element of a potential pair.
            for (let i = 0; i < numberList.length; i++) {
                const firstCandidate = numberList[i];
                // Create a new array excluding the first candidate.
                const remainingExcludingFirst = numberList.filter((_, idx) => idx !== i);

                // Iterate through the remaining numbers to find a second element for the pair.
                for (let j = 0; j < remainingExcludingFirst.length; j++) {
                    const secondCandidate = remainingExcludingFirst[j];

                    // If the pair sums to a power of two, explore this path.
                    if (isSumAPowerOfTwo(firstCandidate, secondCandidate)) {
                        // Create a new array excluding both used elements for the recursive call.
                        const nextAvailableNumbers = remainingExcludingFirst.filter((_, idx) => idx !== j);
                        // Recursively find the chain length from the remaining numbers and add 1 for the current pair.
                        const chainLength = findLongestPowerOfTwoChain(nextAvailableNumbers) + 1;
                        // Update the overall maximum found.
                        if (chainLength > currentMaximumChainLength) {
                            currentMaximumChainLength = chainLength;
                        }
                    }
                }
            }
            return currentMaximumChainLength;
        }

        // --- Solutions for AtCoder Grand Contest 029 ---
        var agc029Tasks = {
            /**
             * Problem A: Irreversible Operation - Applies the boolean sequence toggle logic.
             * @param {string[]} inputLines - An array containing a single string of 'B's and 'W's.
             * @returns {string[]} An array with a single string, the computed result.
             */
            solveIrreversibleOperation: function(inputLines) {
                // Convert the input string into a boolean array, 'B' as true, 'W' as false.
                const booleanSequence = inputLines[0].split("").map(char => char === 'B');
                return [String(findMaxAdjacentToggles(booleanSequence))];
            },

            /**
             * Problem B: Power of Two - Utilizes the longest power-of-two chain helper.
             * @param {string[]} inputLines - Input data: first line is N (number of elements), second line is space-separated numbers.
             * @returns {string[]} An array with a single string, the result.
             */
            solvePowerOfTwoChainProblem: function(inputLines) {
                // The first input line (N) is not strictly needed for the logic, so its parsing is deleted (Type III change).
                // const numElements = Number(inputLines[0]);

                // Parse the numbers from the second line.
                const numericValues = inputLines[1].split(" ").map(Number);

                // Partition the numbers into odd and even lists.
                // This is a Type III change, explicitly creating an object for partitioned data.
                const classifiedNumbers = {
                    oddNums: numericValues.filter(val => val % 2 !== 0),
                    evenNums: numericValues.filter(val => val % 2 === 0)
                };

                // Calculate the max chain length independently for odd and even numbers.
                const maxChainFromOdds = findLongestPowerOfTwoChain(classifiedNumbers.oddNums);
                const maxChainFromEvens = findLongestPowerOfTwoChain(classifiedNumbers.evenNums);

                // The total result is the sum of the max chains from both partitions.
                return [String(maxChainFromOdds + maxChainFromEvens)];
            }
        };

        // --- Node.js Standard Library Imports via Custom Loader ---
        // Load the 'fs' (file system) module.
        var fileSystemModuleRef = moduleRequester(0);
        // Get the default export of the 'fs' module (common for CommonJS modules).
        var fsApiAccessor = moduleRequester.obtainDefaultExport(fileSystemModuleRef);
        // Load the 'readline' module.
        var readlineModuleRef = moduleRequester(1);

        /**
         * Asynchronously reads all lines from Node.js standard input.
         * @returns {Promise<string[]>} A Promise that resolves with an array of strings, each representing an input line.
         */
        function gatherStandardInputLines() {
            process.stdin.resume(); // Ensure the standard input stream is active.
            process.stdin.setEncoding("utf8"); // Set character encoding for input.

            let collectedLines = []; // Buffer to accumulate input lines.
            // Create a readline interface to process input line by line.
            const stdInputInterface = readlineModuleRef.createInterface({
                input: process.stdin,
                // output: process.stdout // Output stream is not strictly required for reading, removed for minor optimization (Type III removal).
            });

            // Event handler for each line received.
            stdInputInterface.on("line", (dataLine) => {
                collectedLines.push(dataLine);
            });

            // Return a Promise that resolves once the input stream is closed.
            return new Promise((resolveInputPromise) => {
                stdInputInterface.on("close", () => {
                    resolveInputPromise(collectedLines);
                });
            });
        }

        // --- Async/Await Transpilation Support Functions ---
        // These are boilerplate functions generated by transpilers (like Babel or TypeScript)
        // to convert async/await syntax into standard ES5/ES6 generator functions and Promises.

        /**
         * Orchestrates the execution of an async generator function, wrapping it in a Promise.
         * @param {object} contextRef - The `this` context for the async function.
         * @param {Array} argsArray - The arguments passed to the async function.
         * @param {PromiseConstructor} PromiseCtor - The Promise constructor to use (defaults to global Promise).
         * @param {GeneratorFunction} asyncGeneratorFunc - The actual generator function representing the async logic.
         * @returns {Promise<any>} A Promise that resolves with the async function's final result.
         */
        var executeAsyncGenerator = function(contextRef, argsArray, PromiseCtor, asyncGeneratorFunc) {
            PromiseCtor = PromiseCtor || Promise; // Fallback to global Promise if not provided.
            return new PromiseCtor(function(resolve, reject) {
                // Internal stepping function for the generator.
                function advance(result) {
                    result.done ? resolve(result.value) : new PromiseCtor(function(innerResolve) {
                        innerResolve(result.value);
                    }).then(onFulfilled, onRejected);
                }

                function onFulfilled(value) {
                    try {
                        advance(asyncGeneratorFunc.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function onRejected(value) {
                    try {
                        advance(asyncGeneratorFunc.throw(value));
                    } catch (e) {
                        reject(e);
                    }
                }
                // Start the generator execution.
                advance((asyncGeneratorFunc = asyncGeneratorFunc.apply(contextRef, argsArray || [])).next());
            });
        };

        /**
         * Manages the internal state and flow of a generator function during async/await transpilation.
         * This function essentially implements the state machine for `yield` and `await`.
         * @param {object} contextRef - The `this` context.
         * @param {Array} generatorArguments - Arguments passed to the generator.
         * @returns {Iterator<any>} An iterator object that controls the generator's execution.
         */
        var manageGeneratorState = function(contextRef, generatorArguments) {
            var executionState = 0; // 0: initial, 1: running, 2: finished.
            var lastOperationResult; // Stores the result of the last generator operation (yield/throw).
            var tryBlockStack = []; // Stack to manage try/catch/finally blocks within the generator.
            var instructionQueue = []; // Queue of operations for the generator's state machine.

            // Define the standard iterator methods for the generator.
            var iteratorObject = {
                next: proceedWithStep(0),
                throw: proceedWithStep(1),
                return: proceedWithStep(2)
            };

            // Make the iterator compatible with `for...of` loops if Symbol.iterator is available.
            if (typeof Symbol === "function" && Symbol.iterator) {
                iteratorObject[Symbol.iterator] = function() { return this; };
            }

            return iteratorObject;

            // Helper to create the step functions for next, throw, return.
            function proceedWithStep(stepType) {
                return function(stepValue) {
                    return executeGeneratorOperation([stepType, stepValue]);
                };
            }

            // Core logic to advance the generator's internal state machine.
            function executeGeneratorOperation(operation) {
                if (executionState === 1) throw new TypeError("Generator is currently busy.");
                executionState = 1; // Mark generator as running.
                try {
                    while (executionState) {
                        // Handle potential sub-generator delegation (yield*).
                        if (lastOperationResult && (operation[0] & 2 ? lastOperationResult["return"] : operation[0] ? lastOperationResult["throw"] || ((lastOperationResult["return"]) && lastOperationResult["return"].call(contextRef), 0) : lastOperationResult.next) && !(lastOperationResult = lastOperationResult[operation[0] & 2 ? "return" : operation[0] ? "throw" : "next"](operation[1])).done) {
                            return lastOperationResult; // Yielded value from a nested generator.
                        }
                        lastOperationResult = 0; // Reset last operation result.
                        if (operation[0]) {
                            operation = [operation[0] & 2, operation[1]]; // Adjust operation for throw/return.
                        }
                        // Main switch statement for generator state transitions.
                        switch (operation[0]) {
                            case 0: // Case for `next()` call.
                            case 1: // Case for `throw()` call.
                                operation = instructionQueue.shift(); // Retrieve next instruction from queue.
                                break;
                            case 4: // Represents a `yield` expression.
                                instructionQueue.push(operation); // Queue the current operation.
                                return { value: operation[1], done: false }; // Return the yielded value.
                            case 5: // Represents a `yield*` expression (delegated yield).
                                executionState++; // Advance state to process the delegated generator.
                                lastOperationResult = operation[1]; // Store the delegated generator.
                                operation = [0]; // Reset operation to `next()`.
                                continue;
                            case 7: // End of a `try` block.
                                operation = tryBlockStack.pop(); // Pop the `try` block from stack.
                                continue;
                            default:
                                // Logic for managing `try`/`catch`/`finally` blocks.
                                if (!(lastOperationResult = tryBlockStack.length > 0 && tryBlockStack[tryBlockStack.length - 1]) && (operation[0] === 6 || operation[0] === 2)) {
                                    executionState = 0; // Reset execution state.
                                    continue;
                                }
                                if (operation[0] === 3 && (!lastOperationResult || (operation[1] > lastOperationResult[0] && operation[1] < lastOperationResult[3]))) {
                                    executionState = operation[1]; // Jump to a new state.
                                    break;
                                }
                                if (operation[0] === 6 && executionState < lastOperationResult[1]) {
                                    executionState = lastOperationResult[1]; // Jump to `catch` block.
                                    lastOperationResult = operation;
                                    break;
                                }
                                if (lastOperationResult && executionState < lastOperationResult[2]) {
                                    executionState = lastOperationResult[2]; // Jump to `finally` block.
                                    instructionQueue.push(operation);
                                    break;
                                }
                                if (lastOperationResult[2]) {
                                    instructionQueue.pop(); // Remove from queue if finally block.
                                }
                                tryBlockStack.pop(); // Pop from try block stack.
                                continue;
                        }
                        operation = generatorArguments.call(contextRef, lastOperationResult); // Execute the generator's body code.
                    }
                    if (operation[0] & 5) throw operation[1]; // Re-throw any pending error.
                    return { value: operation[0] ? operation[1] : undefined, done: true }; // Return final value.
                } catch (e) {
                    operation = [6, e]; // Catch any exceptions.
                    lastOperationResult = 0; // Reset result.
                } finally {
                    executionState = lastOperationResult = 0; // Ensure state is reset on completion/error.
                }
            }
        };

        // --- Interactive Problem Solving Functions ---

        /**
         * Implements an interactive merge sort algorithm where comparisons are made via external queries.
         * @param {string[]} elementsForSorting - The array of items (e.g., characters) to be sorted.
         * @returns {Promise<string[]>} A Promise resolving to the sorted array of elements.
         */
        function interactiveMergeSort(elementsForSorting) {
            return executeAsyncGenerator(this, void 0, void 0, function*() {
                // Base case: An array with 0 or 1 element is already sorted.
                if (elementsForSorting.length <= 1) {
                    return elementsForSorting;
                }

                // Split the array into two roughly equal halves.
                const middleIndex = Math.ceil(elementsForSorting.length / 2);
                const leftPart = elementsForSorting.slice(0, middleIndex);
                const rightPart = elementsForSorting.slice(middleIndex);

                // Recursively sort each half.
                const sortedLeftPart = yield interactiveMergeSort(leftPart);
                const sortedRightPart = yield interactiveMergeSort(rightPart);

                let finalMergedResult = [];
                // Merge the two sorted halves back together.
                while (sortedLeftPart.length > 0 && sortedRightPart.length > 0) {
                    // Compare the leading elements of each sorted part using an interactive query.
                    const isLeftItemSmaller = yield queryExternalComparison(sortedLeftPart[0], sortedRightPart[0]);
                    if (isLeftItemSmaller) {
                        finalMergedResult.push(sortedLeftPart.shift()); // Add from left if it's smaller.
                    } else {
                        finalMergedResult.push(sortedRightPart.shift()); // Otherwise, add from right.
                    }
                }

                // Append any remaining elements from either half (one of them will be empty).
                finalMergedResult.push(...sortedLeftPart, ...sortedRightPart);
                return finalMergedResult;
            });
        }

        /**
         * Sends a comparison query to standard output and reads the response from standard input.
         * @param {string} itemOne - The first item for comparison.
         * @param {string} itemTwo - The second item for comparison.
         * @returns {Promise<boolean>} A Promise that resolves to `true` if `itemOne` is considered less than `itemTwo`.
         */
        function queryExternalComparison(itemOne, itemTwo) {
            return executeAsyncGenerator(this, void 0, void 0, function*() {
                // Output the comparison query in the expected format.
                console.log(`? ${itemOne} ${itemTwo}`);

                // Read the response synchronously from standard input.
                // Using `fs.readFileSync` for immediate blocking read (common in competitive programming judges).
                const responseLine = fsApiAccessor.a.readFileSync("/dev/stdin", "utf8").trim();

                // The problem statement implies we check for '<' to determine if itemOne < itemTwo.
                return responseLine === '<';
            });
        }

        // --- Consolidated Catalog of All Problem Solutions ---
        var problemSolutionMasterCatalog = {
            // Grouping solutions by their respective contest names for organization.
            beginner_contest_122: abc122Solutions,
            Diverta2019ProgrammingContest: diverta2019Challenges,
            GrandContest029: agc029Tasks,

            /**
             * Problem: Interactive Sorting - Sorts a sequence of characters ('A' through 'N') interactively.
             * @param {string[]} inputArgs - An array containing a single string "N M" (N = count of elements, M = max comparisons, M is unused here).
             * @returns {Promise<string[]>} A Promise resolving to an array containing the final sorted string formatted for output.
             */
            handleInteractiveCharacterSorting: function(inputArgs) {
                return executeAsyncGenerator(this, void 0, void 0, function*() {
                    // Parse N (number of characters to sort) from the input. M is ignored.
                    const [countOfChars, maxComparisons] = inputArgs[0].split(" ").map(Number);
                    const asciiCodeForA = 'A'.charCodeAt(0);

                    // Generate the initial array of characters: ['A', 'B', 'C', ...]
                    // Using `Array.from` with a mapping function is a Type III change for array creation.
                    const initialCharSet = Array.from({ length: countOfChars }, (_, idx) =>
                        String.fromCharCode(asciiCodeForA + idx)
                    );

                    // Perform the interactive merge sort on the generated characters.
                    const finalSortedChars = yield interactiveMergeSort(initialCharSet);

                    // Format the result string as required by the problem (e.g., "! ABC").
                    return [`! ${finalSortedChars.join("")}`];
                });
            },

            /**
             * Problem: Welcome to AtCoder - Performs a simple sum and string concatenation.
             * @param {string[]} inputDetails - Input array: [first_integer_str, "second_int third_int_str", final_string].
             * @returns {string[]} An array with a single string, the combined result.
             */
            processWelcomeMessage: function(inputDetails) {
                const firstValue = Number(inputDetails[0]);
                // Split and parse the second line into two numbers.
                const [secondValue, thirdValue] = inputDetails[1].split(" ").map(Number);
                const finalWord = inputDetails[2];

                // Calculate the sum of the three numeric values.
                const totalNumericSum = firstValue + secondValue + thirdValue;

                // Concatenate the sum (converted to string) and the final word.
                const formattedOutput = `${totalNumericSum} ${finalWord}`;

                return [formattedOutput];
            }
        };

        // --- Main Application Entry Point Execution ---
        // This immediately invoked async function orchestrates the reading of input,
        // execution of the target problem solution, and printing of results.
        !function() {
            executeAsyncGenerator(this, void 0, void 0, function*() {
                // Retrieve all lines from standard input asynchronously.
                const allInputDataLines = yield gatherStandardInputLines();

                // Select and execute the specific problem solution.
                // The original code targeted `Diverta2019ProgrammingContest.d`,
                // which maps to `diverta2019Challenges.calculatePartialDivisorSum` in this clone.
                const computedResultLines = diverta2019Challenges.calculatePartialDivisorSum(allInputDataLines);

                // Iterate through the results and print each line to standard output.
                computedResultLines.forEach(outputLine => console.log(outputLine));
            });
        }();
    }
]));
//# sourceMappingURL=main.js.map