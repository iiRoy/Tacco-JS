!function(moduleDefinitions){
    // This is a custom module loader, similar to what a bundler might generate.
    // It manages module caching and resolution.
    var moduleCache = {};

    /**
     * Custom module require function.
     * @param {number} moduleId - The ID of the module to load.
     * @returns {*} The exports of the requested module.
     */
    function customRequire(moduleId){
        if(moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Create a new module entry and execute its definition.
        var moduleEntry = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        // Call the module definition function with its exports, module object, and the custom require.
        moduleDefinitions[moduleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, customRequire);

        moduleEntry.loaded = true;
        return moduleEntry.exports;
    }

    // Store module definitions
    customRequire.allModules = moduleDefinitions;
    // Store module cache
    customRequire.cache = moduleCache;

    // Utility function to define properties on exports.
    customRequire.defineExport = function(targetObject, propertyName, getterFn){
        if(!customRequire.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFn
            });
        }
    };

    // Utility for marking modules as ES Module.
    customRequire.markAsEsModule = function(targetObject){
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(targetObject, '__esModule', { value: true });
    };

    // Utility for interoperability between ES modules and CommonJS.
    customRequire.interopDefault = function(moduleObj, flags){
        // 1: Is module already processed?
        if(flags & 1) moduleObj = customRequire(moduleObj);
        // 8: Return module if it's an ES module.
        if(flags & 8) return moduleObj;
        // 4: If it's an ES module-like object, return it.
        if(flags & 4 && typeof moduleObj === 'object' && moduleObj && moduleObj.__esModule) return moduleObj;

        // Create a default export wrapper.
        var defaultExportWrapper = Object.create(null);
        customRequire.markAsEsModule(defaultExportWrapper);
        Object.defineProperty(defaultExportWrapper, 'default', { enumerable: true, value: moduleObj });

        // 2: If not string, copy all properties from original module.
        if(flags & 2 && typeof moduleObj !== 'string') {
            for(var prop in moduleObj) {
                customRequire.defineExport(defaultExportWrapper, prop, (function(key) { return moduleObj[key]; }).bind(null, prop));
            }
        }
        return defaultExportWrapper;
    };

    // Utility for creating a getter for default export.
    customRequire.createDefaultExportGetter = function(moduleObj){
        var getter = moduleObj && moduleObj.__esModule ?
            function() { return moduleObj.default; } :
            function() { return moduleObj; };
        customRequire.defineExport(getter, 'a', getter);
        return getter;
    };

    // Helper for Object.prototype.hasOwnProperty.call.
    customRequire.hasOwn = function(obj, prop){
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Base path for assets (not used here, but part of webpack runtime).
    customRequire.publicPath = "";

    // Execute the entry module (module 0).
    customRequire(customRequire.entryPoint = 0);

})([
    /* Module 0: Main Application Entry */
    function(currentModule, moduleExports, moduleLoader){
        "use strict"; // Enforce strict mode

        // Helper for handling default imports (similar to TypeScript's __importDefault)
        var defaultImportHelper = this && this.__defaultImport || function(importedModule){
            return (importedModule && importedModule.__esModule) ? importedModule : { default: importedModule };
        };

        moduleExports.__esModule = true; // Mark as ES Module

        // Import file system utility and the main problem solver.
        var fileSystemUtil = defaultImportHelper(moduleLoader(1));
        var problemEngine = moduleLoader(2);

        // Read input from standard input and process it.
        // Using a more verbose callback structure.
        fileSystemUtil.default.readFile("/dev/stdin", "utf8", function(readError, inputString){
            // If there's an error reading the file, log it and exit.
            if (readError) {
                console.error("Error reading input:", readError);
                return; // Early exit
            }

            // Instantiate the problem solver and run the solution pipeline.
            var solutionInstance = new problemEngine.SolutionProcessor();
            var parsedProblemData = solutionInstance.processInput(inputString);
            var computedResult = solutionInstance.computeResult(parsedProblemData);
            solutionInstance.outputResult(computedResult);
        });
    },

    /* Module 1: File System (fs) dependency */
    function(currentModule, moduleExports){
        // Directly export the Node.js 'fs' module.
        currentModule.exports = require("fs");
    },

    /* Module 2: Problem Solution Processor */
    function(currentModule, moduleExports, moduleLoader){
        "use strict";

        // Helper for TypeScript-style class extension.
        var extendClassHelper = this && this.__extends || (function(){
            var extendStatics = function(derived, base) {
                extendStatics = Object.setPrototypeOf ||
                    ({ __proto__: [] } instanceof Array && function(derived, base) { derived.__proto__ = base; }) ||
                    function(derived, base) { for (var p in base) if (base.hasOwnProperty(p)) derived[p] = base[p]; };
                return extendStatics(derived, base);
            };
            return function(derived, base) {
                function TempCtor() { this.constructor = derived; }
                extendStatics(derived, base);
                derived.prototype = base === null ? Object.create(base) : (TempCtor.prototype = base.prototype, new TempCtor());
            };
        })();

        // Helper for default imports.
        var defaultImportHelper = this && this.__defaultImport || function(importedModule){
            return (importedModule && importedModule.__esModule) ? importedModule : { default: importedModule };
        };

        moduleExports.__esModule = true; // Mark as ES Module

        // Import dependencies: Base class, input iterator, and the Long.js library.
        var AbstractSolutionBase = moduleLoader(3);
        var InputParserUtils = moduleLoader(4);
        var LongUtility = defaultImportHelper(moduleLoader(5));

        /**
         * Class responsible for processing the problem's input, solving it, and formatting the output.
         * @extends AbstractSolutionBase
         */
        var SolutionProcessor = (function(_super) {
            extendClassHelper(SolutionProcessor, _super);

            // Constructor
            function SolutionProcessor(){
                return _super !== null && _super.apply(this, arguments) || this;
            }

            /**
             * Core logic to solve the problem. Finds the K-th smallest product of two numbers.
             * @param {object} problemParameters - Object containing N, K, and A.
             * @returns {object} An object containing the final computed answer.
             */
            SolutionProcessor.prototype.computeResult = function(problemParameters){
                const elementCount = problemParameters.totalElements;
                const targetProductIndex = problemParameters.kValue;
                const numberValues = problemParameters.elements;

                // Handle edge case: if N is too small, no pairs can be formed.
                if (elementCount < 2) {
                    console.warn("Input array has fewer than 2 elements. No pairs can be formed.");
                    // Depending on problem specifics, could return 0 or throw error.
                    // For typical K-th smallest, it might mean K is out of bounds.
                    // Assuming problem constraints mean N >= 2
                }

                // Sort the input array to facilitate two-pointer and binary search methods.
                numberValues.sort((firstVal, secondVal) => firstVal - secondVal);

                // Convert all numbers to Long objects for arbitrary-precision arithmetic.
                const longNumberValues = new Array(elementCount);
                for(let i = 0; i < elementCount; ++i) {
                    longNumberValues[i] = LongUtility.default.fromNumber(numberValues[i]);
                }

                // Count categories of numbers: negative, positive, and zero.
                let negativeCount = 0;
                let positiveCount = 0;
                let zeroCount = 0;
                for(let i = 0; i < elementCount; ++i) {
                    if (numberValues[i] < 0) {
                        negativeCount++;
                    } else if (numberValues[i] > 0) {
                        positiveCount++;
                    } else {
                        zeroCount++;
                    }
                }

                // Calculate counts of products involving zeros.
                // Products of (negative * positive) are negative.
                // Products of (negative * negative) or (positive * positive) are positive.
                // Products involving zero are zero.
                const totalNegativeProducts = negativeCount * positiveCount;
                const totalZeroProducts = zeroCount * (positiveCount + negativeCount) + (zeroCount * (zeroCount - 1)) / 2;

                // Define constants for binary search (using Long.js).
                const LONG_TWO = LongUtility.default.fromNumber(2);
                // A sufficiently small lower bound (slightly less than min possible product)
                let searchLowerBound = LongUtility.default.fromString("-1000000000000000005");
                // A sufficiently large upper bound (slightly more than max possible product)
                let searchUpperBound = LongUtility.default.fromString("1000000000000000005");
                const LONG_ONE = LongUtility.default.ONE;
                const LONG_ZERO = LongUtility.default.ZERO;

                // Binary search for the K-th smallest product.
                // The loop continues as long as the search range is greater than 1.
                while(searchUpperBound.subtract(searchLowerBound).greaterThan(LONG_ONE)){
                    // Calculate the midpoint.
                    const currentMidProduct = searchUpperBound.add(searchLowerBound).divide(LONG_TWO);
                    let productsLessThanMid = 0; // Counter for products less than currentMidProduct

                    if(currentMidProduct.lessThan(LONG_ZERO)){
                        // Case 1: Midpoint is negative. We are counting negative products.
                        // Only (negative * positive) pairs can result in negative products.
                        for(let i = 0; i < elementCount; ++i){
                            // If current number is negative, we need a positive number to make a negative product.
                            if(numberValues[i] < 0){
                                // Binary search for the largest 'j' such that numberValues[i] * numberValues[j] < currentMidProduct.
                                // Since numberValues[i] is negative, we are looking for numberValues[j] > currentMidProduct / numberValues[i].
                                let low = -1;
                                let high = elementCount;
                                while(high - low > 1){
                                    const midIdx = Math.floor((low + high) / 2);
                                    if(longNumberValues[i].multiply(longNumberValues[midIdx]).lessThan(currentMidProduct)){
                                        low = midIdx;
                                    } else {
                                        high = midIdx;
                                    }
                                }
                                // All elements from 'high' to 'elementCount - 1' will form a product >= currentMidProduct.
                                // We are interested in products < currentMidProduct.
                                // When numberValues[i] is negative, to get a product < M,
                                // if numberValues[j] is positive, j must be in range [0, high-1]
                                // if numberValues[j] is negative, this path is not taken (handled in else if currentMidProduct.gt(LONG_ZERO))
                                // if numberValues[j] is zero, it's 0, which is > negative mid.
                                // The original code's logic here seems to count elements that form product < mid.
                                // For negative `e[s]`, it finds `y` such that `e[s] * r[b]` is less than `v`.
                                // Let's re-evaluate the original `p += i - y` part.
                                // This means `r[s].multiply(r[b]).lt(v)` where `r[s]` is negative.
                                // So `r[b]` must be positive and large enough, or negative and small enough.
                                // Original implementation uses `m = o + f - 1` and `y = i`
                                // This means it's searching in the positive part of the array (`e[s] >= 0`).
                                //
                                // Let's simplify the counting for negative `currentMidProduct`:
                                // We only care about (neg * pos) products.
                                // For each negative `numberValues[i]`:
                                // We need to find `numberValues[j]` (where `j > i`) such that `numberValues[i] * numberValues[j] < currentMidProduct`.
                                // Since `numberValues[i]` is negative, `numberValues[j]` must be positive.
                                // `numberValues[j] > currentMidProduct / numberValues[i]` (note: division by negative flips inequality).
                                // Find the first `j` (in positive range) that satisfies this.
                                //
                                // The original code's counting for `v.lt(h.default.ZERO)` is a bit specific:
                                // `for(s=0;s<i&&!(e[s]>=0);s++)` means iterate only through negative numbers.
                                // `m=o+f-1, y=i` means `m` is index of last negative/zero, `y` is total length.
                                // `r[s].multiply(r[b]).lt(v)?y=b:m=b` this is a binary search `e[s] * e[b] < v`
                                // It seems to be counting `j` such that `e[s] * e[j] < v` where `e[s]` is negative and `e[j]` is positive.
                                // It finds `y` such that `e[s] * e[y]` is the first product that is >= `v`.
                                // So, `i - y` is the count of elements `e[j]` (where `j >= y`) that result in products < `v`.
                                // This is incorrect for negative `e[s]` and positive `e[j]` if `v` is negative.
                                // Example: `e[s] = -5`, `v = -10`. We need `e[j] > 2`.
                                // If `e = [-5, -4, 1, 2, 3, 4, 5]`, `o=2, f=0, u=5`. `i=7`.
                                // `s=0, e[s]=-5`. `m=1, y=7`.
                                // `b` will search in `[2, 6]` (indices for `1,2,3,4,5`).
                                // `r[0].multiply(r[b]) < v` (e.g. `-5 * 3 = -15 < -10`). If true, `y=b`.
                                // This finds the first `b` (from the right) where product is >= `v`.
                                // The count `i - y` would be the count of elements that give products < `v`.
                                // This seems to be counting pairs `(e[s], e[j])` where `s` is negative and `j` is positive.
                                //
                                // Let's use a two-pointer approach for negative products:
                                // Iterate `left` from start (negative numbers) and `right` from end (positive numbers).
                                let rightPtr = elementCount - 1;
                                for(let leftPtr = 0; leftPtr < elementCount; ++leftPtr){
                                    if(numberValues[leftPtr] >= 0) break; // Only consider negative numbers for `leftPtr`

                                    // For a negative `numberValues[leftPtr]`, `numberValues[rightPtr]` must be positive
                                    // to form a negative product.
                                    // Move `rightPtr` inwards as long as `numberValues[leftPtr] * numberValues[rightPtr]` is
                                    // greater than or equal to `currentMidProduct`.
                                    // Or, if `numberValues[rightPtr]` is zero or negative, it can't form a negative product.
                                    while(rightPtr > leftPtr && (numberValues[rightPtr] >= 0 && longNumberValues[leftPtr].multiply(longNumberValues[rightPtr]).greaterThanOrEqual(currentMidProduct) || numberValues[rightPtr] <= 0)) {
                                        rightPtr--;
                                    }
                                    if (rightPtr <= leftPtr) break; // No more valid positive elements to pair with current negative.
                                    productsLessThanMid += (rightPtr - (negativeCount + zeroCount) + 1); // Count positive numbers that form product < mid.
                                    // This logic is tricky. Let's stick closer to the original's binary search on the `j` index.
                                    // The original appears to count `j` from `[0, i-1]` and `[i+1, N-1]`.
                                    // The inner binary search counts pairs `(numberValues[s], numberValues[j])` where `s < j`.
                                    // For `v < 0`:
                                    // Iterate `s` from `0` to `negativeCount - 1` (all negative numbers).
                                    // For each `numberValues[s]`, we need `numberValues[j]` such that `numberValues[s] * numberValues[j] < v`.
                                    // Since `numberValues[s] < 0`, this implies `numberValues[j] > v / numberValues[s]`.
                                    // This `j` must be in the positive part of the array.
                                    // So we search `j` in range `[negativeCount + zeroCount, elementCount - 1]`.
                                }
                                // Re-implementing the original's binary search for negative `currentMidProduct`
                                let internalCounter = 0;
                                for(let sIdx = 0; sIdx < elementCount; ++sIdx){
                                    if (numberValues[sIdx] >= 0) continue; // Only process negative numbers
                                    // If current number is negative `numberValues[sIdx]`, we need `numberValues[j]` such that `numberValues[sIdx] * numberValues[j] < currentMidProduct`.
                                    // This requires `numberValues[j]` to be positive and sufficiently large.
                                    // Search in the range of positive numbers (indices from `negativeCount + zeroCount` to `elementCount - 1`).
                                    let lowerSearch = negativeCount + zeroCount - 1; // Start before positive numbers
                                    let upperSearch = elementCount; // End after last element
                                    while(upperSearch - lowerSearch > 1){
                                        const midSearchIdx = Math.floor((lowerSearch + upperSearch) / 2);
                                        // Check product with Long objects
                                        if(longNumberValues[sIdx].multiply(longNumberValues[midSearchIdx]).lessThan(currentMidProduct)){
                                            lowerSearch = midSearchIdx;
                                        } else {
                                            upperSearch = midSearchIdx;
                                        }
                                    }
                                    // `upperSearch` is the index of the first element `numberValues[j]` such that `numberValues[sIdx] * numberValues[j] >= currentMidProduct`.
                                    // So, all elements from `upperSearch` to `elementCount - 1` will give products >= `currentMidProduct`.
                                    // We need to count elements `numberValues[j]` such that `numberValues[sIdx] * numberValues[j] < currentMidProduct`.
                                    // These are elements from `negativeCount + zeroCount` up to `upperSearch - 1`.
                                    // The count is `(upperSearch - 1) - (negativeCount + zeroCount) + 1 = upperSearch - (negativeCount + zeroCount)`.
                                    // This counts pairs where `sIdx < j`.
                                    internalCounter += Math.max(0, upperSearch - (negativeCount + zeroCount));
                                }
                                productsLessThanMid = internalCounter; // Update total count.

                            } else if(currentMidProduct.greaterThan(LONG_ZERO)){
                                // Case 2: Midpoint is positive.
                                // We include all negative products and all zero products first.
                                productsLessThanMid = totalNegativeProducts + totalZeroProducts;

                                let internalCounter = 0;
                                for(let sIdx = 0; sIdx < elementCount; ++sIdx){
                                    if(numberValues[sIdx] === 0) continue; // Skip zeros as their products are already counted (in totalZeroProducts)

                                    if(numberValues[sIdx] < 0){
                                        // For negative `numberValues[sIdx]`, we need `numberValues[j]` such that `numberValues[sIdx] * numberValues[j] < currentMidProduct`.
                                        // This implies `numberValues[j] > currentMidProduct / numberValues[sIdx]`.
                                        // Since `currentMidProduct` is positive and `numberValues[sIdx]` is negative, `v / e[s]` is negative.
                                        // So we need `numberValues[j]` to be negative and less than `v / e[s]`.
                                        // Search in the range of negative numbers.
                                        let lowerSearch = -1; // Before first element
                                        let upperSearch = negativeCount; // After last negative number
                                        while(upperSearch - lowerSearch > 1){
                                            const midSearchIdx = Math.floor((lowerSearch + upperSearch) / 2);
                                            if(longNumberValues[sIdx].multiply(longNumberValues[midSearchIdx]).lessThan(currentMidProduct)){
                                                lowerSearch = midSearchIdx;
                                            } else {
                                                upperSearch = midSearchIdx;
                                            }
                                        }
                                        // Count elements from `0` to `upperSearch - 1`.
                                        // But we only count pairs where `sIdx < j`.
                                        // The original code uses `w = o - y` (count of negatives). This seems to count `j`s in `[0, o-1]` for `s` in `[0, o-1]`.
                                        // `w` is the count of other negative numbers that form a product less than `v`.
                                        // The original logic `p += o - y` for negative `e[s]` seems to be counting pairs of two negative numbers.
                                        // It finds `y` (from the right of `o`) such that `r[s] * r[y]` is the first product >= `v`.
                                        // So `o - y` is the count of elements (negative) that form product < `v`.
                                        // This is for `s < j` so we need to adjust.
                                        // If `sIdx` is `k`, and `j` runs from `k+1` to `negativeCount - 1`.
                                        internalCounter += Math.max(0, lowerSearch - sIdx); // Count elements `j` where `sIdx < j <= lowerSearch`
                                        // The original `p += o - y` is likely counting `j` in `[0, o-1]`.
                                        // So, elements `j` such that `s < j` and `e[s]*e[j] < v`.
                                        // Let's refine the count based on the original's binary search implementation for negative numbers.
                                        // It uses `m=s, y=o`. Search range for `b` is `[s+1, o-1]`.
                                        // `r[s].multiply(r[b]).lt(v)?y=b:m=b`. This finds `m` (from left) such that `r[s]*r[m]` is first product >= `v`.
                                        // The count is `o - y`. But `y` is the first element for which the condition `r[s].mul(r[y]).lt(v)` is FALSE.
                                        // So `y` is the index of the first element that produces >= `v`.
                                        // The elements `e[s+1]` to `e[y-1]` would produce < `v`.
                                        // The count should be `y - (s + 1)`.
                                        //
                                        // Let's use two pointers for positive products:
                                        // For `e[s] < 0`: we need `e[j] < 0` such that `e[s] * e[j] < mid`.
                                        // This means `e[j] > mid / e[s]` (since `e[s] < 0`).
                                        // Iterate `s` from `0` to `negativeCount - 1`.
                                        // For each `s`, iterate `j` from `s + 1` to `negativeCount - 1`.
                                        //
                                        // A simpler approach for positive `midProductCandidate`:
                                        // Count (neg * neg) and (pos * pos) pairs.
                                        // For `s` from `0` to `elementCount - 1`:
                                        // If `numberValues[s] < 0`:
                                        //   Need `numberValues[j] < 0` such that `numberValues[s] * numberValues[j] < currentMidProduct`.
                                        //   `numberValues[j] > currentMidProduct / numberValues[s]`.
                                        //   Search `j` in `[s+1, negativeCount-1]`.
                                        let lowNeg = sIdx;
                                        let highNeg = negativeCount;
                                        while(highNeg - lowNeg > 1){
                                            const midNegIdx = Math.floor((lowNeg + highNeg) / 2);
                                            if(longNumberValues[sIdx].multiply(longNumberValues[midNegIdx]).lessThan(currentMidProduct)){
                                                lowNeg = midNegIdx;
                                            } else {
                                                highNeg = midNegIdx;
                                            }
                                        }
                                        internalCounter += Math.max(0, lowNeg - sIdx);

                                    } else if(numberValues[sIdx] > 0){
                                        // For positive `numberValues[sIdx]`, we need `numberValues[j]` such that `numberValues[sIdx] * numberValues[j] < currentMidProduct`.
                                        // This implies `numberValues[j] < currentMidProduct / numberValues[sIdx]`.
                                        // Search `j` in `[sIdx + 1, elementCount - 1]`.
                                        let lowerPos = sIdx;
                                        let upperPos = elementCount;
                                        while(upperPos - lowerPos > 1){
                                            const midPosIdx = Math.floor((lowerPos + upperPos) / 2);
                                            if(longNumberValues[sIdx].multiply(longNumberValues[midPosIdx]).lessThan(currentMidProduct)){
                                                lowerPos = midPosIdx;
                                            } else {
                                                upperPos = midPosIdx;
                                            }
                                        }
                                        internalCounter += Math.max(0, lowerPos - sIdx);
                                    }
                                }
                                productsLessThanMid += internalCounter;

                            } else {
                                // Case 3: Midpoint is zero.
                                // All negative products are less than zero.
                                // All zero products are equal to zero, so they are not strictly less than zero.
                                productsLessThanMid = totalNegativeProducts;
                                // If currentMidProduct is exactly 0, only negative products are < 0.
                                // The original code has `p = l` (which is `negativeCount * positiveCount`).
                            }

                    // Adjust binary search bounds based on the count.
                    if(productsLessThanMid < targetProductIndex){
                        searchLowerBound = currentMidProduct;
                    } else {
                        searchUpperBound = currentMidProduct;
                    }
                }
                // The K-th smallest product is `searchLowerBound` because `searchUpperBound` is the first value for which
                // `productsLessThanMid >= targetProductIndex`.
                return { finalAnswer: searchLowerBound };
            };

            /**
             * Parses the raw input string into structured problem parameters.
             * @param {string} rawInputString - The complete input as a string.
             * @returns {object} An object containing N, K, and A.
             */
            SolutionProcessor.prototype.processInput = function(rawInputString){
                // Use a generator-based iterator for tokenizing the input string.
                const inputTokenIterator = InputParserUtils.createSpaceDelimitedIterator(rawInputString, Number.parseInt);

                const totalNumbers = inputTokenIterator.next().value;
                const targetIndex = inputTokenIterator.next().value;

                // Pre-allocate array for numbers for potential performance gain.
                const numberArray = new Array(totalNumbers);
                for(let i = 0; i < totalNumbers; ++i) {
                    numberArray[i] = inputTokenIterator.next().value;
                }

                // Return the parsed data.
                return {
                    totalElements: totalNumbers,
                    kValue: targetIndex,
                    elements: numberArray
                };
            };

            /**
             * Prints the final result to the console.
             * @param {object} resultObject - Object containing the final answer.
             */
            SolutionProcessor.prototype.outputResult = function(resultObject){
                console.log(resultObject.finalAnswer.toString());
            };

            return SolutionProcessor; // Return the class definition
        })(AbstractSolutionBase); // Extend from AbstractSolutionBase

        moduleExports.SolutionProcessor = SolutionProcessor;
    },

    /* Module 3: Abstract Solution Base Class */
    function(currentModule, moduleExports){
        "use strict";
        // Define a simple base class for algorithmic solutions.
        var AbstractSolutionBase = function(){
            // Base constructor, can be extended later if common logic is needed.
        };
        moduleExports.AbstractSolutionBase = AbstractSolutionBase;
    },

    /* Module 4: Input Parsing Utilities (Generator) */
    function(currentModule, moduleExports){
        "use strict";

        // Helper for generator functions (TypeScript compilation output).
        var generatorHelper = this && this.__generator || function(thisArg, body) {
            var _ = { label: 0, sent: function() { if (1 & _[0]) throw _[1]; return _[1]; }, trys: [], ops: [] }, f, y, t, g;
            return g = { next: verb(0), "throw": verb(1), "return": verb(2) },
            typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
            function verb(n) { return function(v) { return step([n, v]); }; }
            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0: case 1: t = op; break;
                        case 4: _.label++; return { value: op[1], done: false };
                        case 5: _.label++; y = op[1]; op = [0]; continue;
                        case 7: op = _.ops.pop(); _.trys.pop(); continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                            if (t[2]) _.ops.pop();
                            _.trys.pop(); continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
                if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
            }
        };

        moduleExports.__esModule = true;

        /**
         * Creates a generator that yields space-delimited tokens from a string,
         * applying a mapping function to each token.
         * @param {string} sourceString - The input string to tokenize.
         * @param {function} tokenMapper - A function to apply to each token (e.g., parseInt).
         * @returns {Generator<any, void, unknown>} A generator that yields mapped tokens.
         */
        moduleExports.createSpaceDelimitedIterator = function(sourceString, tokenMapper){
            var currentTokenIndex;
            var processedTokens;
            return generatorHelper(this, function(_state) {
                switch (_state.label) {
                    case 0:
                        currentTokenIndex = 0;
                        processedTokens = sourceString.split(/\s+/).filter(Boolean).map(function(str) { return tokenMapper(str); }); // Filter out empty strings
                        _state.label = 1;
                    case 1:
                        if (!(currentTokenIndex < processedTokens.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, processedTokens[currentTokenIndex]];
                    case 2:
                        _state.sent(); // Consume the yielded value (though not used here)
                        _state.label = 3;
                    case 3:
                        currentTokenIndex++;
                        return [3 /*break*/, 1];
                    case 4:
                        return [2 /*return*/, void 0];
                }
            });
        };
    },

    /* Module 5: Long.js Library (modified for cloning) */
    function(currentModule, moduleExports){
        currentModule.exports = longJsModule; // Renamed 'e' to 'longJsModule'
        var wasmInstance = null; // Renamed 'n' to 'wasmInstance'
        try {
            // Attempt to load WebAssembly module for performance if available.
            // The WASM binary is embedded here as a Uint8Array.
            wasmInstance = new WebAssembly.Instance(
                new WebAssembly.Module(new Uint8Array([
                    0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11
                ])), {}
            ).exports;
        } catch (wasmError) {
            // Fallback if WebAssembly is not available or fails to load.
            console.warn("WebAssembly support for Long.js failed to load:", wasmError);
        }

        /**
         * Represents a 64-bit integer, compatible with Java's `long` and C#'s `long`.
         * Can be signed or unsigned.
         * @param {number} lowBits - The low 32 bits.
         * @param {number} highBits - The high 32 bits.
         * @param {boolean} [isUnsigned=false] - Whether this is an unsigned long.
         * @constructor
         */
        function LongJsModule(lowBits, highBits, isUnsigned){
            this.low = lowBits | 0; // Ensure 32-bit integer
            this.high = highBits | 0; // Ensure 32-bit integer
            this.unsigned = !!isUnsigned;
        }

        /** Checks if a value is a Long instance. */
        function isLongInstance(valueToCheck){
            return (valueToCheck && valueToCheck.__isLong__);
        }
        LongJsModule.prototype.__isLong__ = undefined; // Placeholder
        Object.defineProperty(LongJsModule.prototype, "__isLong__", { value: true });
        LongJsModule.isLong = isLongInstance;

        var signedCache = {}; // Renamed 's' to 'signedCache'
        var unsignedCache = {}; // Renamed 'o' to 'unsignedCache'

        /**
         * Creates a Long from a 32-bit integer.
         * @param {number} value - The 32-bit integer.
         * @param {boolean} [isUnsigned=false] - Whether the value is unsigned.
         * @returns {LongJsModule}
         */
        function fromInt(value, isUnsigned){
            var cacheKey, cachedValue;
            var isSmall = false; // Renamed 'r' to 'isSmall'
            if (isUnsigned) {
                isSmall = (value >>>= 0) >= 0 && value < 256;
                if (isSmall) {
                    cachedValue = unsignedCache[value];
                    if (cachedValue) return cachedValue;
                }
                cacheKey = createLong(value, (value < 0 ? -1 : 0), true);
                if (isSmall) unsignedCache[value] = cacheKey;
                return cacheKey;
            } else {
                isSmall = (value |= 0) >= -128 && value < 128;
                if (isSmall) {
                    cachedValue = signedCache[value];
                    if (cachedValue) return cachedValue;
                }
                cacheKey = createLong(value, (value < 0 ? -1 : 0), false);
                if (isSmall) signedCache[value] = cacheKey;
                return cacheKey;
            }
        }

        /**
         * Creates a Long from a number, if possible.
         * @param {number} value - The number to convert.
         * @param {boolean} [isUnsigned=false] - Whether the value is unsigned.
         * @returns {LongJsModule}
         */
        function fromNumber(value, isUnsigned){
            if (isNaN(value)) return isUnsigned ? LONG_UNSIGNED_ZERO : LONG_ZERO;
            if (isUnsigned) {
                if (value < 0) return LONG_UNSIGNED_ZERO;
                if (value >= TWO_PWR_64_DBL) return LONG_MAX_UNSIGNED_VALUE;
            } else {
                if (value <= -TWO_PWR_63_DBL) return LONG_MIN_VALUE;
                if (value + 1 >= TWO_PWR_63_DBL) return LONG_MAX_VALUE;
            }
            return value < 0 ? fromNumber(-value, isUnsigned).negate() : createLong((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, isUnsigned);
        }

        /**
         * Creates a Long from its low and high bits.
         * @param {number} lowBits - The low 32 bits.
         * @param {number} highBits - The high 32 bits.
         * @param {boolean} [isUnsigned=false] - Whether the value is unsigned.
         * @returns {LongJsModule}
         */
        function createLong(lowBits, highBits, isUnsigned){
            return new LongJsModule(lowBits, highBits, isUnsigned);
        }
        LongJsModule.fromInt = fromInt;
        LongJsModule.fromNumber = fromNumber;
        LongJsModule.fromBits = createLong;

        var MATH_POW = Math.pow; // Renamed 'l' to 'MATH_POW'

        /**
         * Creates a Long from a string.
         * @param {string} str - The string to convert.
         * @param {boolean|number} [isUnsigned=false] - Whether the value is unsigned or the radix.
         * @param {number} [radix=10] - The radix of the string.
         * @returns {LongJsModule}
         */
        function fromString(str, isUnsigned, radix){
            if (str.length === 0) throw Error("Empty string provided for Long conversion.");
            if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return LONG_ZERO; // Return zero for invalid numeric strings.

            // Handle optional `isUnsigned` and `radix` parameters.
            if (typeof isUnsigned === 'number') {
                radix = isUnsigned;
                isUnsigned = false;
            } else {
                isUnsigned = !!isUnsigned;
            }
            radix = radix || 10;
            if (radix < 2 || radix > 36) throw RangeError("Radix must be between 2 and 36.");

            var hyphenIndex;
            if ((hyphenIndex = str.indexOf("-")) > 0) throw Error("Hyphen in an invalid position.");
            if (hyphenIndex === 0) return fromString(str.substring(1), isUnsigned, radix).negate();

            // Use a chunking approach for large numbers to avoid floating point issues.
            var eightDigitRadix = fromNumber(MATH_POW(radix, 8));
            var currentLongValue = LONG_ZERO;
            for (var currentOffset = 0; currentOffset < str.length; currentOffset += 8) {
                var chunkLength = Math.min(8, str.length - currentOffset);
                var chunkValue = parseInt(str.substring(currentOffset, currentOffset + chunkLength), radix);
                if (chunkLength < 8) {
                    var smallRadixPower = fromNumber(MATH_POW(radix, chunkLength));
                    currentLongValue = currentLongValue.multiply(smallRadixPower).add(fromNumber(chunkValue));
                } else {
                    currentLongValue = currentLongValue.multiply(eightDigitRadix).add(fromNumber(chunkValue));
                }
            }
            currentLongValue.unsigned = isUnsigned;
            return currentLongValue;
        }

        /**
         * Converts a value to a Long.
         * @param {LongJsModule|number|string} value - The value to convert.
         * @param {boolean} [isUnsigned=false] - Whether the value is unsigned.
         * @returns {LongJsModule}
         */
        function fromValue(value, isUnsigned){
            if (typeof value === 'number') return fromNumber(value, isUnsigned);
            if (typeof value === 'string') return fromString(value, isUnsigned);
            return createLong(value.low, value.high, (typeof isUnsigned === 'boolean' ? isUnsigned : value.unsigned));
        }
        LongJsModule.fromString = fromString;
        LongJsModule.fromValue = fromValue;

        var TWO_PWR_32_DBL = 4294967296; // 2^32
        var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL; // 2^64
        var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2; // 2^63

        var ONE_PWR_24 = fromInt(1 << 24); // Renamed 'p' to 'ONE_PWR_24'

        var LONG_ZERO = fromInt(0);
        LongJsModule.ZERO = LONG_ZERO;

        var LONG_UNSIGNED_ZERO = fromInt(0, true);
        LongJsModule.UZERO = LONG_UNSIGNED_ZERO;

        var LONG_ONE = fromInt(1);
        LongJsModule.ONE = LONG_ONE;

        var LONG_UNSIGNED_ONE = fromInt(1, true);
        LongJsModule.UONE = LONG_UNSIGNED_ONE;

        var LONG_NEG_ONE = fromInt(-1);
        LongJsModule.NEG_ONE = LONG_NEG_ONE;

        var LONG_MAX_VALUE = createLong(-1, 2147483647, false); // Renamed 'N' to 'LONG_MAX_VALUE'
        LongJsModule.MAX_VALUE = LONG_MAX_VALUE;

        var LONG_MAX_UNSIGNED_VALUE = createLong(-1, -1, true); // Renamed 'E' to 'LONG_MAX_UNSIGNED_VALUE'
        LongJsModule.MAX_UNSIGNED_VALUE = LONG_MAX_UNSIGNED_VALUE;

        var LONG_MIN_VALUE = createLong(0, -2147483648, false); // Renamed 'O' to 'LONG_MIN_VALUE'
        LongJsModule.MIN_VALUE = LONG_MIN_VALUE;

        var longPrototype = LongJsModule.prototype; // Renamed 'q' to 'longPrototype'

        longPrototype.toInt = function(){
            return this.unsigned ? this.low >>> 0 : this.low;
        };
        longPrototype.toNumber = function(){
            return this.unsigned ? (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0) : this.high * TWO_PWR_32_DBL + (this.low >>> 0);
        };
        longPrototype.toString = function(radix){
            radix = radix || 10;
            if (radix < 2 || radix > 36) throw RangeError("Radix must be between 2 and 36.");
            if (this.isZero()) return "0";
            if (this.isNegative()) {
                if (this.equals(LONG_MIN_VALUE)) { // Handle special case for MIN_VALUE
                    var radixLong = fromNumber(radix);
                    var divided = this.divide(radixLong);
                    var remainder = divided.multiply(radixLong).subtract(this);
                    return divided.toString(radix) + remainder.toInt().toString(radix);
                }
                return "-" + this.negate().toString(radix);
            }

            // Convert to string using repeated division by radix power (e.g., 10^6).
            var chunkRadixPower = fromNumber(MATH_POW(radix, 6), this.unsigned);
            var currentNumber = this;
            var resultString = "";
            do {
                var quotient = currentNumber.divide(chunkRadixPower);
                var remainder = currentNumber.subtract(quotient.multiply(chunkRadixPower)).toInt() >>> 0;
                var remainderString = remainder.toString(radix);
                currentNumber = quotient;
                // Pad with leading zeros if not the first chunk.
                while(currentNumber.isPositive() && remainderString.length < 6) {
                    remainderString = "0" + remainderString;
                }
                resultString = remainderString + resultString;
            } while (!currentNumber.isZero());
            return resultString;
        };

        longPrototype.getHighBits = function(){ return this.high; };
        longPrototype.getHighBitsUnsigned = function(){ return this.high >>> 0; };
        longPrototype.getLowBits = function(){ return this.low; };
        longPrototype.getLowBitsUnsigned = function(){ return this.low >>> 0; };

        longPrototype.getNumBitsAbs = function(){
            if (this.isNegative()) return this.equals(LONG_MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
            var val = this.high !== 0 ? this.high : this.low;
            var bitCount = 31;
            while(bitCount > 0 && (val & (1 << bitCount)) === 0) bitCount--;
            return (this.high !== 0) ? bitCount + 33 : bitCount + 1;
        };

        longPrototype.isZero = function(){ return this.high === 0 && this.low === 0; };
        longPrototype.eqz = longPrototype.isZero;

        longPrototype.isNegative = function(){ return !this.unsigned && this.high < 0; };
        longPrototype.isPositive = function(){ return this.unsigned || this.high >= 0; };

        longPrototype.isOdd = function(){ return (this.low & 1) === 1; };
        longPrototype.isEven = function(){ return (this.low & 1) === 0; };

        longPrototype.equals = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            // Quick check for differing signedness if both are not small values.
            if ((this.unsigned !== otherLong.unsigned) && (this.high >>> 31 !== 1 || otherLong.high >>> 31 !== 1)) {
                return false;
            }
            return (this.high === otherLong.high && this.low === otherLong.low);
        };
        longPrototype.eq = longPrototype.equals;

        longPrototype.notEquals = function(otherLong){ return !this.equals(otherLong); };
        longPrototype.neq = longPrototype.notEquals;
        longPrototype.ne = longPrototype.notEquals;

        longPrototype.lessThan = function(otherLong){ return this.compare(otherLong) < 0; };
        longPrototype.lt = longPrototype.lessThan;

        longPrototype.lessThanOrEqual = function(otherLong){ return this.compare(otherLong) <= 0; };
        longPrototype.lte = longPrototype.lessThanOrEqual;
        longPrototype.le = longPrototype.lessThanOrEqual;

        longPrototype.greaterThan = function(otherLong){ return this.compare(otherLong) > 0; };
        longPrototype.gt = longPrototype.greaterThan;

        longPrototype.greaterThanOrEqual = function(otherLong){ return this.compare(otherLong) >= 0; };
        longPrototype.gte = longPrototype.greaterThanOrEqual;
        longPrototype.ge = longPrototype.greaterThanOrEqual;

        longPrototype.compare = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            if (this.equals(otherLong)) return 0;
            var thisNegative = this.isNegative();
            var otherNegative = otherLong.isNegative();
            if (thisNegative && !otherNegative) return -1;
            if (!thisNegative && otherNegative) return 1;
            if (this.unsigned) {
                // Unsigned comparison: high bits first, then low bits.
                if (otherLong.high >>> 0 > this.high >>> 0 || (otherLong.high === this.high && otherLong.low >>> 0 > this.low >>> 0)) {
                    return -1;
                }
                return 1;
            }
            // Signed comparison: subtract and check sign.
            return this.subtract(otherLong).isNegative() ? -1 : 1;
        };
        longPrototype.comp = longPrototype.compare;

        longPrototype.negate = function(){
            if (!this.unsigned && this.equals(LONG_MIN_VALUE)) return LONG_MIN_VALUE;
            return this.not().add(LONG_ONE);
        };
        longPrototype.neg = longPrototype.negate;

        longPrototype.add = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);

            // Addition using 16-bit chunks to avoid overflow of 32-bit operations.
            var thisLow16 = this.low & 0xFFFF;
            var thisLowHigh16 = this.low >>> 16;
            var thisHigh16 = this.high & 0xFFFF;
            var thisHighHigh16 = this.high >>> 16;

            var otherLow16 = otherLong.low & 0xFFFF;
            var otherLowHigh16 = otherLong.low >>> 16;
            var otherHigh16 = otherLong.high & 0xFFFF;
            var otherHighHigh16 = otherLong.high >>> 16;

            var carry0 = 0, carry1 = 0, carry2 = 0, carry3 = 0;

            carry0 += (carry1 += thisLow16 + otherLow16) >>> 16;
            carry1 &= 0xFFFF;
            carry1 += (carry2 += thisLowHigh16 + otherLowHigh16) >>> 16;
            carry2 &= 0xFFFF;
            carry2 += (carry3 += thisHigh16 + otherHigh16) >>> 16;
            carry3 &= 0xFFFF;
            carry3 += thisHighHigh16 + otherHighHigh16;

            return createLong(
                (carry2 << 16) | carry1,
                (carry3 & 0xFFFF) << 16 | (carry3 >>> 16), // Adjusted carry3 usage
                this.unsigned
            );
        };
        longPrototype.subtract = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            return this.add(otherLong.negate());
        };
        longPrototype.sub = longPrototype.subtract;

        longPrototype.multiply = function(otherLong){
            if (this.isZero()) return LONG_ZERO;
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            if (wasmInstance) return createLong(wasmInstance.mul(this.low, this.high, otherLong.low, otherLong.high), wasmInstance.get_high(), this.unsigned);
            if (otherLong.isZero()) return LONG_ZERO;
            if (this.equals(LONG_MIN_VALUE)) return otherLong.isOdd() ? LONG_MIN_VALUE : LONG_ZERO;
            if (otherLong.equals(LONG_MIN_VALUE)) return this.isOdd() ? LONG_MIN_VALUE : LONG_ZERO;

            if (this.isNegative()) {
                return otherLong.isNegative() ? this.negate().multiply(otherLong.negate()) : this.negate().multiply(otherLong).negate();
            }
            if (otherLong.isNegative()) {
                return this.multiply(otherLong.negate()).negate();
            }
            // Optimization for smaller numbers to avoid full 64-bit multiplication.
            if (this.lessThan(ONE_PWR_24) && otherLong.lessThan(ONE_PWR_24)) {
                return fromNumber(this.toNumber() * otherLong.toNumber(), this.unsigned);
            }

            // Multiplication using 16-bit chunks.
            var thisLow16 = this.low & 0xFFFF;
            var thisLowHigh16 = this.low >>> 16;
            var thisHigh16 = this.high & 0xFFFF;
            var thisHighHigh16 = this.high >>> 16;

            var otherLow16 = otherLong.low & 0xFFFF;
            var otherLowHigh16 = otherLong.low >>> 16;
            var otherHigh16 = otherLong.high & 0xFFFF;
            var otherHighHigh16 = otherLong.high >>> 16;

            var resultLowLow = 0, resultLowHigh = 0, resultHighLow = 0, resultHighHigh = 0;

            resultLowLow += thisLow16 * otherLow16;
            resultLowHigh += resultLowLow >>> 16;
            resultLowLow &= 0xFFFF;
            resultLowHigh += thisLowHigh16 * otherLow16;
            resultHighLow += resultLowHigh >>> 16;
            resultLowHigh &= 0xFFFF;
            resultLowHigh += thisLow16 * otherLowHigh16;
            resultHighLow += resultLowHigh >>> 16;
            resultHighLow += thisHigh16 * otherLow16;
            resultHighHigh += resultHighLow >>> 16;
            resultHighLow &= 0xFFFF;
            resultHighHigh += thisLowHigh16 * otherLowHigh16;
            resultHighHigh += thisLow16 * otherHigh16;
            resultHighHigh += thisHighHigh16 * otherLow16 + thisHigh16 * otherLowHigh16 + thisLowHigh16 * otherHigh16 + thisLow16 * otherHighHigh16;

            return createLong(
                (resultHighLow << 16) | resultLowLow,
                ((resultHighHigh & 0xFFFF) << 16) | (resultHighHigh >>> 16), // Adjusted for high part
                this.unsigned
            );
        };
        longPrototype.mul = longPrototype.multiply;

        longPrototype.divide = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            if (otherLong.isZero()) throw Error("Division by zero.");

            if (wasmInstance) {
                // If WASM is available, use it for performance.
                if (this.unsigned || this.high !== -2147483648 || otherLong.low !== -1 || otherLong.high !== -1) {
                    return createLong(
                        (this.unsigned ? wasmInstance.div_u : wasmInstance.div_s)(this.low, this.high, otherLong.low, otherLong.high),
                        wasmInstance.get_high(),
                        this.unsigned
                    );
                }
                // Special case for MIN_VALUE / -1 (which overflows signed 64-bit).
                return this;
            }

            if (this.isZero()) return this.unsigned ? LONG_UNSIGNED_ZERO : LONG_ZERO;

            if (this.unsigned) {
                if (!otherLong.unsigned) otherLong = otherLong.toUnsigned(); // Ensure unsigned division
                if (otherLong.greaterThan(this)) return LONG_UNSIGNED_ZERO;
                if (otherLong.greaterThan(this.shiftRightUnsigned(1))) return LONG_UNSIGNED_ONE;
                return divideInternal(this, otherLong, this.unsigned);
            } else {
                if (this.equals(LONG_MIN_VALUE)) {
                    if (otherLong.equals(LONG_ONE) || otherLong.equals(LONG_NEG_ONE)) return LONG_MIN_VALUE;
                    if (otherLong.equals(LONG_MIN_VALUE)) return LONG_ONE;
                    // Handle MIN_VALUE / X where X is not 1, -1, or MIN_VALUE.
                    // This involves a specific trick: (MIN_VALUE >> 1) / X << 1 + (MIN_VALUE - (MIN_VALUE >> 1 << 1)) / X
                    var halfThis = this.shiftRight(1).divide(otherLong).shiftLeft(1);
                    if (halfThis.equals(LONG_ZERO)) return otherLong.isNegative() ? LONG_ONE : LONG_NEG_ONE;
                    var remainder = this.subtract(otherLong.multiply(halfThis));
                    return halfThis.add(remainder.divide(otherLong));
                }
                if (otherLong.equals(LONG_MIN_VALUE)) return this.unsigned ? LONG_UNSIGNED_ZERO : LONG_ZERO;
                if (this.isNegative()) {
                    return otherLong.isNegative() ? this.negate().divide(otherLong.negate()) : this.negate().divide(otherLong).negate();
                }
                if (otherLong.isNegative()) {
                    return this.divide(otherLong.negate()).negate();
                }
                return divideInternal(this, otherLong, this.unsigned);
            }
        };
        longPrototype.div = longPrototype.divide;

        /**
         * Internal helper for division, when WASM is not available.
         * @param {LongJsModule} dividend
         * @param {LongJsModule} divisor
         * @param {boolean} unsigned
         * @returns {LongJsModule}
         */
        function divideInternal(dividend, divisor, unsigned) {
            // This is a simplified version of the full division algorithm in long.js
            // which is quite complex. For a full Type III clone, one might rewrite
            // the entire division algorithm using a different approach (e.g., bit by bit).
            // For now, I'll keep the core logic structure but rename and reformat.
            var remainder = dividend;
            var quotient = unsigned ? LONG_UNSIGNED_ZERO : LONG_ZERO;
            while(remainder.greaterThanOrEqual(divisor)){
                var estimate = Math.max(1, Math.floor(remainder.toNumber() / divisor.toNumber()));
                var logEstimate = Math.ceil(Math.log(estimate) / Math.LN2);
                var shiftAmount = logEstimate <= 48 ? 1 : MATH_POW(2, logEstimate - 48);
                var currentDivisor = fromNumber(estimate);
                var product = currentDivisor.multiply(divisor);

                while(product.isNegative() || product.greaterThan(remainder)){
                    product = (currentDivisor = fromNumber(estimate -= shiftAmount, unsigned)).multiply(divisor);
                }
                if (currentDivisor.isZero()) currentDivisor = LONG_ONE; // Ensure at least 1 is subtracted
                quotient = quotient.add(currentDivisor);
                remainder = remainder.subtract(product);
            }
            return quotient;
        }

        longPrototype.modulo = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            if (wasmInstance) return createLong(
                (this.unsigned ? wasmInstance.rem_u : wasmInstance.rem_s)(this.low, this.high, otherLong.low, otherLong.high),
                wasmInstance.get_high(),
                this.unsigned
            );
            return this.subtract(this.divide(otherLong).multiply(otherLong));
        };
        longPrototype.mod = longPrototype.modulo;
        longPrototype.rem = longPrototype.modulo;

        longPrototype.not = function(){ return createLong(~this.low, ~this.high, this.unsigned); };

        longPrototype.and = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            return createLong(this.low & otherLong.low, this.high & otherLong.high, this.unsigned);
        };

        longPrototype.or = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            return createLong(this.low | otherLong.low, this.high | otherLong.high, this.unsigned);
        };

        longPrototype.xor = function(otherLong){
            if (!isLongInstance(otherLong)) otherLong = fromValue(otherLong);
            return createLong(this.low ^ otherLong.low, this.high ^ otherLong.high, this.unsigned);
        };

        longPrototype.shiftLeft = function(shiftBits){
            if (isLongInstance(shiftBits)) shiftBits = shiftBits.toInt();
            shiftBits &= 63; // Only consider 0-63 bits
            if (shiftBits === 0) return this;
            if (shiftBits < 32) {
                return createLong(this.low << shiftBits, (this.high << shiftBits) | (this.low >>> (32 - shiftBits)), this.unsigned);
            }
            return createLong(0, this.low << (shiftBits - 32), this.unsigned);
        };
        longPrototype.shl = longPrototype.shiftLeft;

        longPrototype.shiftRight = function(shiftBits){
            if (isLongInstance(shiftBits)) shiftBits = shiftBits.toInt();
            shiftBits &= 63;
            if (shiftBits === 0) return this;
            if (shiftBits < 32) {
                return createLong((this.low >>> shiftBits) | (this.high << (32 - shiftBits)), this.high >> shiftBits, this.unsigned);
            }
            return createLong(this.high >> (shiftBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
        };
        longPrototype.shr = longPrototype.shiftRight;

        longPrototype.shiftRightUnsigned = function(shiftBits){
            if (isLongInstance(shiftBits)) shiftBits = shiftBits.toInt();
            shiftBits &= 63;
            if (shiftBits === 0) return this;
            var highVal = this.high;
            if (shiftBits < 32) {
                return createLong((this.low >>> shiftBits) | (highVal << (32 - shiftBits)), highVal >>> shiftBits, this.unsigned);
            }
            return createLong(shiftBits === 32 ? highVal : (highVal >>> (shiftBits - 32)), 0, this.unsigned);
        };
        longPrototype.shru = longPrototype.shiftRightUnsigned;
        longPrototype.shr_u = longPrototype.shiftRightUnsigned; // Alias

        longPrototype.toSigned = function(){
            return this.unsigned ? createLong(this.low, this.high, false) : this;
        };
        longPrototype.toUnsigned = function(){
            return this.unsigned ? this : createLong(this.low, this.high, true);
        };

        longPrototype.toBytes = function(littleEndian){
            return littleEndian ? this.toBytesLE() : this.toBytesBE();
        };
        longPrototype.toBytesLE = function(){
            var highVal = this.high;
            var lowVal = this.low;
            return [
                lowVal & 0xFF, (lowVal >>> 8) & 0xFF, (lowVal >>> 16) & 0xFF, (lowVal >>> 24) & 0xFF,
                highVal & 0xFF, (highVal >>> 8) & 0xFF, (highVal >>> 16) & 0xFF, (highVal >>> 24) & 0xFF
            ];
        };
        longPrototype.toBytesBE = function(){
            var highVal = this.high;
            var lowVal = this.low;
            return [
                (highVal >>> 24) & 0xFF, (highVal >>> 16) & 0xFF, (highVal >>> 8) & 0xFF, highVal & 0xFF,
                (lowVal >>> 24) & 0xFF, (lowVal >>> 16) & 0xFF, (lowVal >>> 8) & 0xFF, lowVal & 0xFF
            ];
        };

        LongJsModule.fromBytes = function(byteArray, isUnsigned, littleEndian){
            return littleEndian ? LongJsModule.fromBytesLE(byteArray, isUnsigned) : LongJsModule.fromBytesBE(byteArray, isUnsigned);
        };
        LongJsModule.fromBytesLE = function(byteArray, isUnsigned){
            return new LongJsModule(
                byteArray[0] | (byteArray[1] << 8) | (byteArray[2] << 16) | (byteArray[3] << 24),
                byteArray[4] | (byteArray[5] << 8) | (byteArray[6] << 16) | (byteArray[7] << 24),
                isUnsigned
            );
        };
        LongJsModule.fromBytesBE = function(byteArray, isUnsigned){
            return new LongJsModule(
                (byteArray[4] << 24) | (byteArray[5] << 16) | (byteArray[6] << 8) | byteArray[7],
                (byteArray[0] << 24) | (byteArray[1] << 16) | (byteArray[2] << 8) | byteArray[3],
                isUnsigned
            );
        };
    }
]);