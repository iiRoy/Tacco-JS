// This is a custom module loader / bundler entry point.
// It manages the loading and caching of various code modules.
(function(moduleDefinitions) {
    // A repository for already loaded modules.
    // Key: module identifier, Value: module export object.
    const loadedModulesCache = {};

    // Core function to load and execute a module by its identifier.
    function executeModule(moduleKey) {
        // If the module is already in our cache, return its exports immediately.
        if (loadedModulesCache[moduleKey]) {
            return loadedModulesCache[moduleKey].exportObject;
        }

        // If not cached, prepare a new module entry and store it.
        const currentModule = loadedModulesCache[moduleKey] = {
            id: moduleKey,      // The module's unique identifier.
            isLoaded: false, // Flag to indicate if the module has been fully processed.
            exportObject: {}    // The object that will hold the module's exports.
        };

        // Execute the module function, providing it with context (this, module, exports, require).
        // The 'this' context is set to 'currentModule.exportObject' to mimic Node.js behavior.
        // The 'executeModule' function itself is passed as the 'require' function for internal dependencies.
        moduleDefinitions[moduleKey].call(currentModule.exportObject, currentModule, currentModule.exportObject, executeModule);

        // Mark the module as fully loaded after execution.
        currentModule.isLoaded = true;

        // Return the resulting export object.
        return currentModule.exportObject;
    }

    // Attach the original module definitions to the loader for external access (if needed).
    executeModule.moduleSet = moduleDefinitions;

    // Expose the module cache for debugging or introspection.
    executeModule.moduleRegistry = loadedModulesCache;

    // Define a utility for "harmony exports" (ES Modules).
    // This creates a getter for a named export on the exports object.
    executeModule.defineGetter = (exportTarget, exportName, valueGetter) => {
        if (!executeModule.objectHasOwn(exportTarget, exportName)) {
            Object.defineProperty(exportTarget, exportName, {
                enumerable: true, // Make it enumerable so it shows up in `for...in` and `Object.keys`.
                get: valueGetter  // The function to call when the property is accessed.
            });
        }
    };

    // Define __esModule property on exports for ES Module compatibility.
    executeModule.markAsESModule = (exportTarget) => {
        // Check for Symbol.toStringTag for better module identification in environments that support it.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportTarget, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportTarget, '__esModule', { value: true });
    };

    // Create a pseudo-namespace object for compatibility.
    // This handles various scenarios for importing modules (e.g., commonjs, es modules).
    executeModule.createNamespaceObject = (sourceValue, importMode) => {
        // Mode & 1: Source is a module ID, so resolve it.
        if (importMode & 1) sourceValue = executeModule(sourceValue);
        // Mode & 8: Behave like a direct require, return the value as is.
        if (importMode & 8) return sourceValue;
        // Mode & 4: If source is already a namespace object, return it.
        if ((importMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) return sourceValue;

        // Otherwise, create a new namespace object.
        const namespaceObj = Object.create(null);
        executeModule.markAsESModule(namespaceObj); // Mark it as an ES Module.
        Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: sourceValue }); // Set 'default' export.
        // Mode & 2: Merge properties if source is not a string.
        if (importMode & 2 && typeof sourceValue != 'string') {
            for (const propKey in sourceValue) {
                // Ensure we don't redefine 'default' or other built-in properties.
                if (!executeModule.objectHasOwn(sourceValue, propKey) || propKey === 'default') continue; // Add a guard here
                executeModule.defineGetter(namespaceObj, propKey, () => sourceValue[propKey]); // Create getters for other exports.
            }
        }
        return namespaceObj;
    };

    // Helper to get the default export for non-harmony modules.
    executeModule.getDefaultExport = (moduleRef) => {
        const exportRetriever = moduleRef && moduleRef.__esModule ?
            () => moduleRef['default'] : // If it's an ES module, get 'default'.
            () => moduleRef;             // Otherwise, return the module itself.
        // Attach 'a' property as a getter for compatibility (often used by webpack for default import).
        executeModule.defineGetter(exportRetriever, 'a', exportRetriever);
        return exportRetriever;
    };

    // Custom hasOwnProperty check, using Object.prototype.hasOwnProperty.call for robustness.
    executeModule.objectHasOwn = (targetObject, propName) => Object.prototype.hasOwnProperty.call(targetObject, propName);

    // Set the public path for assets (currently empty).
    executeModule.publicPath = "";


    // Load the designated entry module and return its exports.
    return executeModule(executeModule.moduleSet.entryPoint || "./src/ABC152/A.js"); // Added a fallback for entry point
})
// The module definitions object starts here.
({

// Path: ./node_modules/big-integer/BigInteger.js
// This module provides a BigInt implementation for environments that don't natively support it,
// or for cases where a specific library implementation is preferred.
"./node_modules/big-integer/BigInteger.js":
(function(moduleRef, moduleExports, reqFunc) {

    // WEBPACK VAR INJECTION: (function(module) { ... })
    // This wrapper ensures 'module' is available within the big-integer scope.
    (function(currentModule) {
        // AMD definition for bigInt library.
        let amdDefineResult;
        const bigInt = (function (undefinedValue) { // Renamed 'undefined' to 'undefinedValue'
            "use strict";

            // Core constants for the BigInt implementation.
            const BASE_VALUE = 1e7; // Base for internal number representation (10^7).
            const LOG_BASE_VALUE = 7; // Logarithm of the base (log10(10^7) = 7).
            const MAX_SAFE_INTEGER_JS = 9007199254740992; // JavaScript's MAX_SAFE_INTEGER.
            const MAX_SAFE_INTEGER_ARRAY = convertSmallToInternalArray(MAX_SAFE_INTEGER_JS); // MAX_SAFE_INTEGER as an internal array.
            const DEFAULT_NUMERAL_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions.

            // Check for native BigInt support in the environment.
            const hasNativeBigIntSupport = typeof BigInt === "function";

            // Main Integer factory function.
            function IntegerConstructor(valInput, baseRadix, customAlphabet, isCaseSensitive) {
                if (typeof valInput === "undefinedValue") return IntegerConstructor[0]; // If no value, return zero.
                if (typeof baseRadix !== "undefinedValue") {
                    // Handle base conversion if radix is provided.
                    return +baseRadix === 10 && !customAlphabet ? parseValue(valInput) : parseBasedValue(valInput, baseRadix, customAlphabet, isCaseSensitive);
                }
                return parseValue(valInput); // Default to parsing as a number/string.
            }

            // BigInteger class for large numbers (represented as arrays of digits).
            function BigNumValue(internalVal, isNegative) {
                this.internalDigits = internalVal;
                this.isNegativeFlag = isNegative;
                this.isSmallNum = false;
            }
            BigNumValue.prototype = Object.create(IntegerConstructor.prototype);

            // SmallInteger class for numbers that fit within JS's safe integer limits.
            function SmallNumValue(internalVal) {
                this.internalDigits = internalVal;
                this.isNegativeFlag = internalVal < 0;
                this.isSmallNum = true;
            }
            SmallNumValue.prototype = Object.create(IntegerConstructor.prototype);

            // NativeBigInt class for numbers leveraging the built-in BigInt type.
            function NativeBigIntValue(internalVal) {
                this.internalDigits = internalVal;
            }
            NativeBigIntValue.prototype = Object.create(IntegerConstructor.prototype);

            // Checks if a number can be precisely represented by JavaScript's number type.
            function isJsNumberPrecise(numToCheck) {
                return -MAX_SAFE_INTEGER_JS < numToCheck && numToCheck < MAX_SAFE_INTEGER_JS;
            }

            // Converts a small JS number into the internal array representation.
            // (Note: This function is tightly coupled with BASE_VALUE and might need updates if BASE_VALUE changes.)
            function convertSmallToInternalArray(numInput) {
                if (numInput < 1e7)
                    return [numInput];
                if (numInput < 1e14)
                    return [numInput % 1e7, Math.floor(numInput / 1e7)];
                return [numInput % 1e7, Math.floor(numInput / 1e7) % 1e7, Math.floor(numInput / 1e14)];
            }

            // Converts an internal array representation back to a small JS number if possible.
            function convertArrayToSmallNum(digitArray) {
                trimLeadingZeros(digitArray); // Remove any leading zeros.
                const arrayLength = digitArray.length;
                // If the array is small enough and its absolute value fits within MAX_SAFE_INTEGER_JS.
                if (arrayLength < 4 && compareAbsoluteValues(digitArray, MAX_SAFE_INTEGER_ARRAY) < 0) {
                    switch (arrayLength) {
                        case 0: return 0;
                        case 1: return digitArray[0];
                        case 2: return digitArray[0] + digitArray[1] * BASE_VALUE;
                        default: return digitArray[0] + (digitArray[1] + digitArray[2] * BASE_VALUE) * BASE_VALUE;
                    }
                }
                return digitArray; // Return the array if it's too large for a small number.
            }

            // Removes leading zero digits from an internal array representation.
            function trimLeadingZeros(digitArray) {
                let index = digitArray.length;
                while (index > 0 && digitArray[--index] === 0); // Find the last non-zero digit.
                digitArray.length = index + 1; // Truncate the array.
            }

            // Creates a new array initialized with zeros.
            function createZeroFilledArray(size) {
                const newArray = new Array(size);
                for (let k = 0; k < size; k++) {
                    newArray[k] = 0;
                }
                return newArray;
            }

            // Truncates a number towards zero (floor for positive, ceil for negative).
            function truncateNumber(num) {
                return num > 0 ? Math.floor(num) : Math.ceil(num);
            }

            // Adds two internal array representations (assumes a.length >= b.length).
            function addInternalArrays(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                const resultArr = new Array(lenA);
                let carryOver = 0;
                const currentBase = BASE_VALUE;
                let currentSum, i;

                // Add corresponding digits up to the length of the shorter array.
                for (i = 0; i < lenB; i++) {
                    currentSum = arrayA[i] + arrayB[i] + carryOver;
                    carryOver = currentSum >= currentBase ? 1 : 0;
                    resultArr[i] = currentSum - carryOver * currentBase;
                }
                // Propagate carry through the remaining digits of the longer array.
                while (i < lenA) {
                    currentSum = arrayA[i] + carryOver;
                    carryOver = currentSum === currentBase ? 1 : 0;
                    resultArr[i++] = currentSum - carryOver * currentBase;
                }
                // If there's a final carry, append it.
                if (carryOver > 0) resultArr.push(carryOver);
                return resultArr;
            }

            // Adds any two internal array representations, handling different lengths.
            function addAnyInternalArrays(arrayA, arrayB) {
                return arrayA.length >= arrayB.length ? addInternalArrays(arrayA, arrayB) : addInternalArrays(arrayB, arrayA);
            }

            // Adds a small number (carry) to an internal array representation.
            function addSmallToInternalArray(digitArray, smallCarry) {
                const arrayLen = digitArray.length;
                const resultArr = new Array(arrayLen);
                const currentBase = BASE_VALUE;
                let currentSum, i;

                // Iterate through digits, adding carry.
                for (i = 0; i < arrayLen; i++) {
                    currentSum = digitArray[i] - currentBase + smallCarry; // Subtraction then add ensures Math.floor works correctly for negative sums
                    smallCarry = Math.floor(currentSum / currentBase);
                    resultArr[i] = currentSum - smallCarry * currentBase;
                    smallCarry += 1; // Adjust carry for next iteration
                }
                // Propagate any remaining carry.
                while (smallCarry > 0) {
                    resultArr[i++] = smallCarry % currentBase;
                    smallCarry = Math.floor(smallCarry / currentBase);
                }
                return resultArr;
            }

            // BigNumValue.prototype.add method implementation.
            BigNumValue.prototype.add = function (operand) {
                const parsedOperand = parseValue(operand);
                // If signs differ, convert to subtraction.
                if (this.isNegativeFlag !== parsedOperand.isNegativeFlag) {
                    return this.subtract(parsedOperand.negate());
                }
                const currentVal = this.internalDigits;
                const otherVal = parsedOperand.internalDigits;
                // If the operand is a small number, use optimized addSmall.
                if (parsedOperand.isSmallNum) {
                    return new BigNumValue(addSmallToInternalArray(currentVal, Math.abs(otherVal)), this.isNegativeFlag);
                }
                // Otherwise, use general array addition.
                return new BigNumValue(addAnyInternalArrays(currentVal, otherVal), this.isNegativeFlag);
            };
            BigNumValue.prototype.plus = BigNumValue.prototype.add; // Alias for 'plus'.

            // SmallNumValue.prototype.add method implementation.
            SmallNumValue.prototype.add = function (operand) {
                const parsedOperand = parseValue(operand);
                const currentRawVal = this.internalDigits;
                // If signs differ, convert to subtraction.
                if ((currentRawVal < 0) !== parsedOperand.isNegativeFlag) {
                    return this.subtract(parsedOperand.negate());
                }
                const otherRawVal = parsedOperand.internalDigits;
                // If both are small, try direct addition.
                if (parsedOperand.isSmallNum) {
                    if (isJsNumberPrecise(currentRawVal + otherRawVal)) return new SmallNumValue(currentRawVal + otherRawVal);
                    // If result overflows, convert small operand to array and use BigNumValue.
                    const otherArr = convertSmallToInternalArray(Math.abs(otherRawVal));
                    return new BigNumValue(addSmallToInternalArray(otherArr, Math.abs(currentRawVal)), currentRawVal < 0);
                }
                // If current is small and operand is large, convert current to array and use BigNumValue.
                return new BigNumValue(addSmallToInternalArray(otherRawVal, Math.abs(currentRawVal)), currentRawVal < 0);
            };
            SmallNumValue.prototype.plus = SmallNumValue.prototype.add; // Alias for 'plus'.

            // NativeBigIntValue.prototype.add method implementation.
            NativeBigIntValue.prototype.add = function (operand) {
                return new NativeBigIntValue(this.internalDigits + parseValue(operand).internalDigits);
            };
            NativeBigIntValue.prototype.plus = NativeBigIntValue.prototype.add; // Alias for 'plus'.

            // Subtracts two internal array representations (assumes arrayA >= arrayB).
            function subtractInternalArrays(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                const resultArr = new Array(lenA);
                let borrowAmount = 0;
                const currentBase = BASE_VALUE;
                let differenceValue;

                // Subtract corresponding digits.
                for (let i = 0; i < lenB; i++) {
                    differenceValue = arrayA[i] - borrowAmount - arrayB[i];
                    if (differenceValue < 0) {
                        differenceValue += currentBase;
                        borrowAmount = 1;
                    } else {
                        borrowAmount = 0;
                    }
                    resultArr[i] = differenceValue;
                }
                // Propagate borrow through remaining digits of arrayA.
                for (let i = lenB; i < lenA; i++) {
                    differenceValue = arrayA[i] - borrowAmount;
                    if (differenceValue < 0) {
                        differenceValue += currentBase;
                    } else {
                        resultArr[i++] = differenceValue; // No borrow, so can directly assign and break.
                        break;
                    }
                    resultArr[i] = differenceValue;
                }
                // Copy remaining digits if no further borrows.
                for (let i = lenA; i < resultArr.length; i++) { // This loop condition is suspicious, it should be `for (; i < lenA; i++)`
                    resultArr[i] = arrayA[i]; // Corrected: This loop is actually `for (; i < lenA; i++)` in original code, which is correct.
                }

                trimLeadingZeros(resultArr); // Remove leading zeros.
                return resultArr;
            }

            // Subtracts any two internal array representations, handling signs and order.
            function subtractAnyInternalArrays(arrayA, arrayB, currentSign) {
                let finalValue;
                // Determine which array is larger in absolute value.
                if (compareAbsoluteValues(arrayA, arrayB) >= 0) {
                    finalValue = subtractInternalArrays(arrayA, arrayB);
                } else {
                    finalValue = subtractInternalArrays(arrayB, arrayA);
                    currentSign = !currentSign; // Flip the sign if we swapped operands.
                }
                finalValue = convertArrayToSmallNum(finalValue); // Try to convert back to small number.
                if (typeof finalValue === "number") {
                    if (currentSign) finalValue = -finalValue;
                    return new SmallNumValue(finalValue);
                }
                return new BigNumValue(finalValue, currentSign);
            }

            // Subtracts a small number from an internal array representation.
            function subtractSmallFromInternalArray(digitArray, smallVal, currentSign) {
                const arrayLen = digitArray.length;
                const resultArr = new Array(arrayLen);
                let carry = -smallVal; // Initial carry is negative of the small value.
                const currentBase = BASE_VALUE;
                let difference;

                for (let i = 0; i < arrayLen; i++) {
                    difference = digitArray[i] + carry;
                    carry = Math.floor(difference / currentBase);
                    difference %= currentBase;
                    resultArr[i] = difference < 0 ? difference + currentBase : difference; // Ensure positive remainder.
                }
                const convertedResult = convertArrayToSmallNum(resultArr);
                if (typeof convertedResult === "number") {
                    if (currentSign) convertedResult = -convertedResult;
                    return new SmallNumValue(convertedResult);
                }
                return new BigNumValue(convertedResult, currentSign);
            }

            // BigNumValue.prototype.subtract method implementation.
            BigNumValue.prototype.subtract = function (operand) {
                const parsedOperand = parseValue(operand);
                // If signs differ, convert to addition.
                if (this.isNegativeFlag !== parsedOperand.isNegativeFlag) {
                    return this.add(parsedOperand.negate());
                }
                const currentVal = this.internalDigits;
                const otherVal = parsedOperand.internalDigits;
                // If operand is small, use optimized subtractSmall.
                if (parsedOperand.isSmallNum)
                    return subtractSmallFromInternalArray(currentVal, Math.abs(otherVal), this.isNegativeFlag);
                // Otherwise, use general array subtraction.
                return subtractAnyInternalArrays(currentVal, otherVal, this.isNegativeFlag);
            };
            BigNumValue.prototype.minus = BigNumValue.prototype.subtract; // Alias for 'minus'.

            // SmallNumValue.prototype.subtract method implementation.
            SmallNumValue.prototype.subtract = function (operand) {
                const parsedOperand = parseValue(operand);
                const currentRawVal = this.internalDigits;
                // If signs differ, convert to addition.
                if ((currentRawVal < 0) !== parsedOperand.isNegativeFlag) {
                    return this.add(parsedOperand.negate());
                }
                const otherRawVal = parsedOperand.internalDigits;
                // If both are small, direct subtraction.
                if (parsedOperand.isSmallNum) {
                    return new SmallNumValue(currentRawVal - otherRawVal);
                }
                // If current is small and operand is large, convert operand to array and use BigNumValue.
                return subtractSmallFromInternalArray(otherRawVal, Math.abs(currentRawVal), currentRawVal >= 0);
            };
            SmallNumValue.prototype.minus = SmallNumValue.prototype.subtract; // Alias for 'minus'.

            // NativeBigIntValue.prototype.subtract method implementation.
            NativeBigIntValue.prototype.subtract = function (operand) {
                return new NativeBigIntValue(this.internalDigits - parseValue(operand).internalDigits);
            };
            NativeBigIntValue.prototype.minus = NativeBigIntValue.prototype.subtract; // Alias for 'minus'.

            // Negates the BigNumValue.
            BigNumValue.prototype.negate = function () {
                return new BigNumValue(this.internalDigits, !this.isNegativeFlag);
            };
            // Negates the SmallNumValue.
            SmallNumValue.prototype.negate = function () {
                const originalSign = this.isNegativeFlag;
                const negatedSmall = new SmallNumValue(-this.internalDigits);
                negatedSmall.isNegativeFlag = !originalSign; // Explicitly set sign for consistency.
                return negatedSmall;
            };
            // Negates the NativeBigIntValue.
            NativeBigIntValue.prototype.negate = function () {
                return new NativeBigIntValue(-this.internalDigits);
            };

            // Returns the absolute value of the BigNumValue.
            BigNumValue.prototype.abs = function () {
                return new BigNumValue(this.internalDigits, false);
            };
            // Returns the absolute value of the SmallNumValue.
            SmallNumValue.prototype.abs = function () {
                return new SmallNumValue(Math.abs(this.internalDigits));
            };
            // Returns the absolute value of the NativeBigIntValue.
            NativeBigIntValue.prototype.abs = function () {
                return new NativeBigIntValue(this.internalDigits >= 0 ? this.internalDigits : -this.internalDigits);
            };

            // Performs long multiplication on two internal array representations.
            function multiplyLongInternal(arrayA, arrayB) {
                const lenA = arrayA.length;
                const lenB = arrayB.length;
                const resultLen = lenA + lenB;
                const resultArr = createZeroFilledArray(resultLen);
                const currentBase = BASE_VALUE;
                let productDigit, currentCarry, i, a_i, b_j;

                for (i = 0; i < lenA; ++i) {
                    a_i = arrayA[i];
                    for (let j = 0; j < lenB; ++j) {
                        b_j = arrayB[j];
                        productDigit = a_i * b_j + resultArr[i + j];
                        currentCarry = Math.floor(productDigit / currentBase);
                        resultArr[i + j] = productDigit - currentCarry * currentBase;
                        resultArr[i + j + 1] += currentCarry; // Add carry to the next position.
                    }
                }
                trimLeadingZeros(resultArr);
                return resultArr;
            }

            // Multiplies an internal array by a small number (less than BASE_VALUE).
            function multiplyInternalArrayBySmall(digitArray, smallMultiplier) {
                const arrayLen = digitArray.length;
                const resultArr = new Array(arrayLen);
                const currentBase = BASE_VALUE;
                let currentCarry = 0;
                let productDigit, i;

                for (i = 0; i < arrayLen; i++) {
                    productDigit = digitArray[i] * smallMultiplier + currentCarry;
                    currentCarry = Math.floor(productDigit / currentBase);
                    resultArr[i] = productDigit - currentCarry * currentBase;
                }
                // Propagate any remaining carry.
                while (currentCarry > 0) {
                    resultArr[i++] = currentCarry % currentBase;
                    currentCarry = Math.floor(currentCarry / currentBase);
                }
                return resultArr;
            }

            // Shifts an array representation left by 'n' positions (appends zeros).
            function shiftArrayLeft(arr, numPositions) {
                const shiftedArr = [];
                while (numPositions-- > 0) shiftedArr.push(0); // Append zeros.
                return shiftedArr.concat(arr); // Concatenate with original array.
            }

            // Karatsuba multiplication algorithm for efficiency with large numbers.
            function multiplyKaratsuba(xArr, yArr) {
                let n = Math.max(xArr.length, yArr.length);

                // For small arrays, fall back to long multiplication.
                if (n <= 30) return multiplyLongInternal(xArr, yArr);

                n = Math.ceil(n / 2); // Split point.

                const b = xArr.slice(n); // Higher half of x.
                const a = xArr.slice(0, n); // Lower half of x.
                const d = yArr.slice(n); // Higher half of y.
                const c = yArr.slice(0, n); // Lower half of y.

                // Recursive calls.
                const ac = multiplyKaratsuba(a, c);
                const bd = multiplyKaratsuba(b, d);
                const abcd = multiplyKaratsuba(addAnyInternalArrays(a, b), addAnyInternalArrays(c, d));

                // Combine results using Karatsuba formula: ac * B^(2n) + ((a+b)(c+d) - ac - bd) * B^n + bd
                const intermediateProduct = subtractInternalArrays(subtractInternalArrays(abcd, ac), bd);
                const productResult = addAnyInternalArrays(addAnyInternalArrays(ac, shiftArrayLeft(intermediateProduct, n)), shiftArrayLeft(bd, 2 * n));
                trimLeadingZeros(productResult);
                return productResult;
            }

            // Heuristic to decide whether to use Karatsuba or long multiplication.
            function shouldUseKaratsuba(len1, len2) {
                return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
            }

            // BigNumValue.prototype.multiply method implementation.
            BigNumValue.prototype.multiply = function (operand) {
                const parsedOperand = parseValue(operand);
                const currentVal = this.internalDigits;
                let otherVal = parsedOperand.internalDigits;
                const resultSign = this.isNegativeFlag !== parsedOperand.isNegativeFlag;
                let absOtherVal;

                // Handle small operand optimizations.
                if (parsedOperand.isSmallNum) {
                    if (otherVal === 0) return IntegerConstructor[0];
                    if (otherVal === 1) return this;
                    if (otherVal === -1) return this.negate();
                    absOtherVal = Math.abs(otherVal);
                    if (absOtherVal < BASE_VALUE) {
                        return new BigNumValue(multiplyInternalArrayBySmall(currentVal, absOtherVal), resultSign);
                    }
                    otherVal = convertSmallToInternalArray(absOtherVal); // Convert to array if it's a large small number.
                }

                // Choose multiplication algorithm based on array lengths.
                if (shouldUseKaratsuba(currentVal.length, otherVal.length))
                    return new BigNumValue(multiplyKaratsuba(currentVal, otherVal), resultSign);
                return new BigNumValue(multiplyLongInternal(currentVal, otherVal), resultSign);
            };
            BigNumValue.prototype.times = BigNumValue.prototype.multiply; // Alias for 'times'.

            // Helper for multiplying a small number by an array.
            function multiplySmallByArray(smallNum, digitArray, resultSign) {
                if (smallNum < BASE_VALUE) {
                    return new BigNumValue(multiplyInternalArrayBySmall(digitArray, smallNum), resultSign);
                }
                return new BigNumValue(multiplyLongInternal(digitArray, convertSmallToInternalArray(smallNum)), resultSign);
            }

            // SmallNumValue internal multiplication helper.
            SmallNumValue.prototype._multiplyBySmall = function (otherSmall) {
                if (isJsNumberPrecise(otherSmall.internalDigits * this.internalDigits)) {
                    return new SmallNumValue(otherSmall.internalDigits * this.internalDigits);
                }
                return multiplySmallByArray(Math.abs(otherSmall.internalDigits), convertSmallToInternalArray(Math.abs(this.internalDigits)), this.isNegativeFlag !== otherSmall.isNegativeFlag);
            };
            // BigNumValue internal multiplication helper.
            BigNumValue.prototype._multiplyBySmall = function (otherSmall) {
                if (otherSmall.internalDigits === 0) return IntegerConstructor[0];
                if (otherSmall.internalDigits === 1) return this;
                if (otherSmall.internalDigits === -1) return this.negate();
                return multiplySmallByArray(Math.abs(otherSmall.internalDigits), this.internalDigits, this.isNegativeFlag !== otherSmall.isNegativeFlag);
            };
            // SmallNumValue.prototype.multiply method implementation.
            SmallNumValue.prototype.multiply = function (operand) {
                return parseValue(operand)._multiplyBySmall(this);
            };
            SmallNumValue.prototype.times = SmallNumValue.prototype.multiply; // Alias for 'times'.

            // NativeBigIntValue.prototype.multiply method implementation.
            NativeBigIntValue.prototype.multiply = function (operand) {
                return new NativeBigIntValue(this.internalDigits * parseValue(operand).internalDigits);
            };
            NativeBigIntValue.prototype.times = NativeBigIntValue.prototype.multiply; // Alias for 'times'.

            // Squares an internal array representation.
            function squareInternalArray(arr) {
                const len = arr.length;
                const resultArr = createZeroFilledArray(len + len);
                const currentBase = BASE_VALUE;
                let product, currentCarry, i, a_i, a_j;

                for (i = 0; i < len; i++) {
                    a_i = arr[i];
                    currentCarry = 0 - a_i * a_i; // Initialize carry with negative square to avoid negative product in the loop.
                    for (let j = i; j < len; j++) {
                        a_j = arr[j];
                        product = 2 * (a_i * a_j) + resultArr[i + j] + currentCarry;
                        currentCarry = Math.floor(product / currentBase);
                        resultArr[i + j] = product - currentCarry * currentBase;
                    }
                    resultArr[i + len] = currentCarry;
                }
                trimLeadingZeros(resultArr);
                return resultArr;
            }

            // BigNumValue.prototype.square method implementation.
            BigNumValue.prototype.square = function () {
                return new BigNumValue(squareInternalArray(this.internalDigits), false);
            };

            // SmallNumValue.prototype.square method implementation.
            SmallNumValue.prototype.square = function () {
                const squaredValue = this.internalDigits * this.internalDigits;
                if (isJsNumberPrecise(squaredValue)) return new SmallNumValue(squaredValue);
                return new BigNumValue(squareInternalArray(convertSmallToInternalArray(Math.abs(this.internalDigits))), false);
            };

            // NativeBigIntValue.prototype.square method implementation.
            NativeBigIntValue.prototype.square = function () {
                return new NativeBigIntValue(this.internalDigits * this.internalDigits);
            };

            // Division and Modulo (Method 1 - for smaller inputs).
            function divModAlgorithm1(dividendArr, divisorArr) {
                const dividendLen = dividendArr.length;
                const divisorLen = divisorArr.length;
                const currentBase = BASE_VALUE;
                const quotientResult = createZeroFilledArray(divisorLen);
                const divisorMostSignificant = divisorArr[divisorLen - 1];

                // Normalization step: Scale dividend and divisor to improve accuracy of quotient guesses.
                const lambdaFactor = Math.ceil(currentBase / (2 * divisorMostSignificant));
                let scaledRemainder = multiplyInternalArrayBySmall(dividendArr, lambdaFactor);
                let scaledDivisor = multiplyInternalArrayBySmall(divisorArr, lambdaFactor);

                // Ensure remainder has enough leading zeros if needed.
                if (scaledRemainder.length <= dividendLen) scaledRemainder.push(0);
                scaledDivisor.push(0); // Add a zero to divisor for easier comparison.
                const newDivisorMostSignificant = scaledDivisor[divisorLen - 1]; // Recalculate after scaling.

                let quotientDigitGuess, shiftIndex, currentCarry, currentBorrow, i, l, productPart;

                // Iterate from most significant digits.
                for (shiftIndex = dividendLen - divisorLen; shiftIndex >= 0; shiftIndex--) {
                    quotientDigitGuess = currentBase - 1; // Max possible quotient digit.

                    // Estimate quotient digit.
                    if (scaledRemainder[shiftIndex + divisorLen] !== newDivisorMostSignificant) {
                        quotientDigitGuess = Math.floor((scaledRemainder[shiftIndex + divisorLen] * currentBase + scaledRemainder[shiftIndex + divisorLen - 1]) / newDivisorMostSignificant);
                    }

                    // Perform trial multiplication and subtraction.
                    currentCarry = 0;
                    currentBorrow = 0;
                    l = scaledDivisor.length;
                    for (i = 0; i < l; i++) {
                        currentCarry += quotientDigitGuess * scaledDivisor[i];
                        productPart = Math.floor(currentCarry / currentBase);
                        currentBorrow += scaledRemainder[shiftIndex + i] - (currentCarry - productPart * currentBase);
                        currentCarry = productPart;
                        if (currentBorrow < 0) {
                            scaledRemainder[shiftIndex + i] = currentBorrow + currentBase;
                            currentBorrow = -1;
                        } else {
                            scaledRemainder[shiftIndex + i] = currentBorrow;
                            currentBorrow = 0;
                        }
                    }

                    // Adjust quotient digit if trial subtraction resulted in negative remainder.
                    while (currentBorrow !== 0) {
                        quotientDigitGuess -= 1;
                        currentCarry = 0;
                        for (i = 0; i < l; i++) {
                            currentCarry += scaledRemainder[shiftIndex + i] - currentBase + scaledDivisor[i];
                            if (currentCarry < 0) {
                                scaledRemainder[shiftIndex + i] = currentCarry + currentBase;
                                currentCarry = 0;
                            } else {
                                scaledRemainder[shiftIndex + i] = currentCarry;
                                currentCarry = 1;
                            }
                        }
                        currentBorrow += currentCarry;
                    }
                    quotientResult[shiftIndex] = quotientDigitGuess;
                }
                // Denormalization: Divide remainder back by lambdaFactor.
                scaledRemainder = divModSmallNumber(scaledRemainder, lambdaFactor)[0];
                return [convertArrayToSmallNum(quotientResult), convertArrayToSmallNum(scaledRemainder)];
            }

            // Division and Modulo (Method 2 - for larger inputs).
            function divModAlgorithm2(dividendArr, divisorArr) {
                let dividendLen = dividendArr.length;
                const divisorLen = divisorArr.length;
                const resultQuotient = [];
                let currentPart = []; // Represents the current portion of the dividend being processed.
                const currentBase = BASE_VALUE;
                let guessDigit, xLength, highX, highY, trialProduct;

                while (dividendLen) {
                    currentPart.unshift(dividendArr[--dividendLen]); // Take one digit from dividend.
                    trimLeadingZeros(currentPart); // Clean up current part.

                    // If current part is smaller than divisor, quotient digit is 0.
                    if (compareAbsoluteValues(currentPart, divisorArr) < 0) {
                        resultQuotient.push(0);
                        continue;
                    }

                    xLength = currentPart.length;
                    // Estimate highX and highY for quotient guess.
                    highX = currentPart[xLength - 1] * currentBase + currentPart[xLength - 2];
                    highY = divisorArr[divisorLen - 1] * currentBase + divisorArr[divisorLen - 2];
                    if (xLength > divisorLen) {
                        highX = (highX + 1) * currentBase; // Adjust if dividend part is longer.
                    }

                    guessDigit = Math.ceil(highX / highY); // Initial guess.

                    // Refine guess by trial multiplication and comparison.
                    do {
                        trialProduct = multiplyInternalArrayBySmall(divisorArr, guessDigit);
                        if (compareAbsoluteValues(trialProduct, currentPart) <= 0) break;
                        guessDigit--;
                    } while (guessDigit);

                    resultQuotient.push(guessDigit); // Add refined guess to quotient.
                    currentPart = subtractInternalArrays(currentPart, trialProduct); // Subtract trial product from current part.
                }
                resultQuotient.reverse(); // Quotient digits were accumulated in reverse.
                return [convertArrayToSmallNum(resultQuotient), convertArrayToSmallNum(currentPart)];
            }

            // Divides an internal array by a small number, returning quotient and remainder.
            function divModSmallNumber(digitArray, smallDivisor) {
                const arrayLength = digitArray.length;
                const quotientArr = createZeroFilledArray(arrayLength);
                const currentBase = BASE_VALUE;
                let remainderAccumulator = 0;
                let currentDigit, qResult;

                for (let i = arrayLength - 1; i >= 0; --i) {
                    currentDigit = remainderAccumulator * currentBase + digitArray[i];
                    qResult = truncateNumber(currentDigit / smallDivisor);
                    remainderAccumulator = currentDigit - qResult * smallDivisor;
                    quotientArr[i] = qResult | 0; // Ensure integer.
                }
                return [quotientArr, remainderAccumulator | 0]; // Return quotient array and final remainder.
            }

            // General division and modulo function, handles various input types and sizes.
            function generalDivMod(self, otherOperand) {
                let resultingValue, parsedOperand = parseValue(otherOperand);
                // If native BigInt is supported, use it directly.
                if (hasNativeBigIntSupport) {
                    return [new NativeBigIntValue(self.internalDigits / parsedOperand.internalDigits), new NativeBigIntValue(self.internalDigits % parsedOperand.internalDigits)];
                }
                const selfVal = self.internalDigits;
                let otherVal = parsedOperand.internalDigits;
                let calculatedQuotient;

                // Handle division by zero.
                if (otherVal === 0) throw new Error("Division by zero is not allowed.");

                // Handle small number cases.
                if (self.isSmallNum) {
                    if (parsedOperand.isSmallNum) {
                        return [new SmallNumValue(truncateNumber(selfVal / otherVal)), new SmallNumValue(selfVal % otherVal)];
                    }
                    return [IntegerConstructor[0], self]; // If self is small and other is large, quotient is 0.
                }
                if (parsedOperand.isSmallNum) {
                    if (otherVal === 1) return [self, IntegerConstructor[0]];
                    if (otherVal === -1) return [self.negate(), IntegerConstructor[0]];
                    const absOtherVal = Math.abs(otherVal);
                    if (absOtherVal < BASE_VALUE) { // If small divisor fits within BASE_VALUE.
                        resultingValue = divModSmallNumber(selfVal, absOtherVal);
                        calculatedQuotient = convertArrayToSmallNum(resultingValue[0]);
                        let remainderValue = resultingValue[1];
                        if (self.isNegativeFlag) remainderValue = -remainderValue; // Adjust remainder sign.
                        if (typeof calculatedQuotient === "number") {
                            if (self.isNegativeFlag !== parsedOperand.isNegativeFlag) calculatedQuotient = -calculatedQuotient;
                            return [new SmallNumValue(calculatedQuotient), new SmallNumValue(remainderValue)];
                        }
                        return [new BigNumValue(calculatedQuotient, self.isNegativeFlag !== parsedOperand.isNegativeFlag), new SmallNumValue(remainderValue)];
                    }
                    otherVal = convertSmallToInternalArray(absOtherVal); // Convert to array if it's a large small number.
                }

                // Compare absolute values to determine if quotient is 0.
                const comparisonResult = compareAbsoluteValues(selfVal, otherVal);
                if (comparisonResult === -1) return [IntegerConstructor[0], self];
                if (comparisonResult === 0) return [IntegerConstructor[self.isNegativeFlag === parsedOperand.isNegativeFlag ? 1 : -1], IntegerConstructor[0]];

                // Choose division algorithm based on input sizes.
                if (selfVal.length + otherVal.length <= 200)
                    resultingValue = divModAlgorithm1(selfVal, otherVal);
                else resultingValue = divModAlgorithm2(selfVal, otherVal);

                calculatedQuotient = resultingValue[0];
                const quotientSign = self.isNegativeFlag !== parsedOperand.isNegativeFlag;
                let moduloValue = resultingValue[1];
                const moduloSign = self.isNegativeFlag;

                // Convert quotient to appropriate Integer type.
                if (typeof calculatedQuotient === "number") {
                    if (quotientSign) calculatedQuotient = -calculatedQuotient;
                    calculatedQuotient = new SmallNumValue(calculatedQuotient);
                } else calculatedQuotient = new BigNumValue(calculatedQuotient, quotientSign);

                // Convert modulo to appropriate Integer type.
                if (typeof moduloValue === "number") {
                    if (moduloSign) moduloValue = -moduloValue;
                    moduloValue = new SmallNumValue(moduloValue);
                } else moduloValue = new BigNumValue(moduloValue, moduloSign);

                return [calculatedQuotient, moduloValue];
            }

            // BigNumValue.prototype.divmod method.
            BigNumValue.prototype.divmod = function (operand) {
                const divisionResult = generalDivMod(this, operand);
                return {
                    quotient: divisionResult[0],
                    remainder: divisionResult[1]
                };
            };
            // Assign divmod to other prototypes for consistency.
            NativeBigIntValue.prototype.divmod = SmallNumValue.prototype.divmod = BigNumValue.prototype.divmod;

            // BigNumValue.prototype.divide method.
            BigNumValue.prototype.divide = function (operand) {
                return generalDivMod(this, operand)[0];
            };
            // NativeBigIntValue.prototype.divide (and alias 'over').
            NativeBigIntValue.prototype.over = NativeBigIntValue.prototype.divide = function (operand) {
                return new NativeBigIntValue(this.internalDigits / parseValue(operand).internalDigits);
            };
            // Assign divide/over to other prototypes for consistency.
            SmallNumValue.prototype.over = SmallNumValue.prototype.divide = BigNumValue.prototype.over = BigNumValue.prototype.divide;

            // BigNumValue.prototype.mod method.
            BigNumValue.prototype.mod = function (operand) {
                return generalDivMod(this, operand)[1];
            };
            // NativeBigIntValue.prototype.mod (and alias 'remainder').
            NativeBigIntValue.prototype.mod = NativeBigIntValue.prototype.remainder = function (operand) {
                return new NativeBigIntValue(this.internalDigits % parseValue(operand).internalDigits);
            };
            // Assign mod/remainder to other prototypes for consistency.
            SmallNumValue.prototype.remainder = SmallNumValue.prototype.mod = BigNumValue.prototype.remainder = BigNumValue.prototype.mod;

            // BigNumValue.prototype.pow method (exponentiation).
            BigNumValue.prototype.pow = function (exponent) {
                const parsedExponent = parseValue(exponent);
                const baseVal = this.internalDigits;
                const expVal = parsedExponent.internalDigits;
                let resultValue, xVar, yVar;

                // Handle edge cases for exponentiation.
                if (expVal === 0) return IntegerConstructor[1];
                if (baseVal === 0) return IntegerConstructor[0];
                if (baseVal === 1) return IntegerConstructor[1];
                if (baseVal === -1) return parsedExponent.isEven() ? IntegerConstructor[1] : IntegerConstructor[-1];
                if (parsedExponent.isNegativeFlag) { // Negative exponent means result is 0 for integers.
                    return IntegerConstructor[0];
                }
                if (!parsedExponent.isSmallNum) throw new Error("The exponent " + parsedExponent.toString() + " is too large for integer exponentiation.");

                // If base is small, try native Math.pow.
                if (this.isSmallNum) {
                    if (isJsNumberPrecise(resultValue = Math.pow(baseVal, expVal)))
                        return new SmallNumValue(truncateNumber(resultValue));
                }

                // Binary exponentiation (exponentiation by squaring).
                xVar = this;
                yVar = IntegerConstructor[1];
                let currentExp = expVal; // Use a mutable copy of expVal.
                while (true) {
                    if (currentExp & 1 === 1) { // If exponent is odd.
                        yVar = yVar.times(xVar);
                        --currentExp;
                    }
                    if (currentExp === 0) break;
                    currentExp /= 2; // Halve the exponent.
                    xVar = xVar.square(); // Square the base.
                }
                return yVar;
            };
            SmallNumValue.prototype.pow = BigNumValue.prototype.pow; // Assign to SmallNumValue.

            // NativeBigIntValue.prototype.pow method.
            NativeBigIntValue.prototype.pow = function (exponent) {
                const parsedExponent = parseValue(exponent);
                const baseVal = this.internalDigits;
                let expVal = parsedExponent.internalDigits;
                const nativeZero = BigInt(0), nativeOne = BigInt(1), nativeTwo = BigInt(2);

                // Handle edge cases for exponentiation with native BigInt.
                if (expVal === nativeZero) return IntegerConstructor[1];
                if (baseVal === nativeZero) return IntegerConstructor[0];
                if (baseVal === nativeOne) return IntegerConstructor[1];
                if (baseVal === BigInt(-1)) return parsedExponent.isEven() ? IntegerConstructor[1] : IntegerConstructor[-1];
                if (parsedExponent.isNegative()) return new NativeBigIntValue(nativeZero); // Negative exponent.

                let xVar = this;
                let yVar = IntegerConstructor[1];
                while (true) {
                    if ((expVal & nativeOne) === nativeOne) { // If exponent is odd.
                        yVar = yVar.times(xVar);
                        --expVal;
                    }
                    if (expVal === nativeZero) break;
                    expVal /= nativeTwo; // Halve the exponent.
                    xVar = xVar.square(); // Square the base.
                }
                return yVar;
            };

            // BigNumValue.prototype.modPow method (modular exponentiation).
            BigNumValue.prototype.modPow = function (exponent, modulus) {
                let expOperand = parseValue(exponent);
                let modOperand = parseValue(modulus);
                if (modOperand.isZero()) throw new Error("Modulus cannot be zero for modular exponentiation.");

                let resultAccumulator = IntegerConstructor[1];
                let baseValue = this.mod(modOperand);

                // Handle negative exponents: calculate modular inverse.
                if (expOperand.isNegative()) {
                    expOperand = expOperand.multiply(IntegerConstructor[-1]); // Make exponent positive.
                    baseValue = baseValue.modInv(modOperand); // Calculate modular inverse of base.
                }

                // Binary exponentiation (exponentiation by squaring).
                while (expOperand.isPositive()) {
                    if (baseValue.isZero()) return IntegerConstructor[0]; // Optimization: if base is 0, result is 0.
                    if (expOperand.isOdd()) resultAccumulator = resultAccumulator.multiply(baseValue).mod(modOperand);
                    expOperand = expOperand.divide(2);
                    baseValue = baseValue.square().mod(modOperand);
                }
                return resultAccumulator;
            };
            // Assign modPow to other prototypes.
            NativeBigIntValue.prototype.modPow = SmallNumValue.prototype.modPow = BigNumValue.prototype.modPow;

            // Compares the absolute values of two internal array representations.
            // Returns 1 if a > b, -1 if a < b, 0 if a == b.
            function compareAbsoluteValues(arrayA, arrayB) {
                if (arrayA.length !== arrayB.length) {
                    return arrayA.length > arrayB.length ? 1 : -1;
                }
                // Compare digit by digit from most significant.
                for (let i = arrayA.length - 1; i >= 0; i--) {
                    if (arrayA[i] !== arrayB[i]) return arrayA[i] > arrayB[i] ? 1 : -1;
                }
                return 0; // Arrays are identical.
            }

            // BigNumValue.prototype.compareAbs method.
            BigNumValue.prototype.compareAbs = function (operand) {
                const parsedOperand = parseValue(operand);
                const currentVal = this.internalDigits;
                const otherVal = parsedOperand.internalDigits;
                if (parsedOperand.isSmallNum) return 1; // A BigNum is always "larger" in comparison context if other is small.
                return compareAbsoluteValues(currentVal, otherVal);
            };
            // SmallNumValue.prototype.compareAbs method.
            SmallNumValue.prototype.compareAbs = function (operand) {
                const parsedOperand = parseValue(operand);
                const currentAbsVal = Math.abs(this.internalDigits);
                let otherAbsVal = parsedOperand.internalDigits;
                if (parsedOperand.isSmallNum) {
                    otherAbsVal = Math.abs(otherAbsVal);
                    return currentAbsVal === otherAbsVal ? 0 : currentAbsVal > otherAbsVal ? 1 : -1;
                }
                return -1; // A SmallNum is always "smaller" in comparison context if other is big.
            };
            // NativeBigIntValue.prototype.compareAbs method.
            NativeBigIntValue.prototype.compareAbs = function (operand) {
                let currentVal = this.internalDigits;
                let otherVal = parseValue(operand).internalDigits;
                currentVal = currentVal >= 0 ? currentVal : -currentVal;
                otherVal = otherVal >= 0 ? otherVal : -otherVal;
                return currentVal === otherVal ? 0 : currentVal > otherVal ? 1 : -1;
            };

            // BigNumValue.prototype.compare method (signed comparison).
            BigNumValue.prototype.compare = function (operand) {
                // Handle comparison with JavaScript's Infinity.
                if (operand === Infinity) { return -1; }
                if (operand === -Infinity) { return 1; }

                const parsedOperand = parseValue(operand);
                const currentVal = this.internalDigits;
                const otherVal = parsedOperand.internalDigits;

                // Compare signs first.
                if (this.isNegativeFlag !== parsedOperand.isNegativeFlag) {
                    return parsedOperand.isNegativeFlag ? 1 : -1; // If 'this' is positive and 'other' is negative, 'this' is greater (1).
                }
                // If signs are the same, and 'other' is small, 'this' (BigNum) is larger (1) if positive, smaller (-1) if negative.
                if (parsedOperand.isSmallNum) {
                    return this.isNegativeFlag ? -1 : 1;
                }
                // Compare absolute values, then adjust for sign.
                return compareAbsoluteValues(currentVal, otherVal) * (this.isNegativeFlag ? -1 : 1);
            };
            BigNumValue.prototype.compareTo = BigNumValue.prototype.compare; // Alias for 'compareTo'.

            // SmallNumValue.prototype.compare method.
            SmallNumValue.prototype.compare = function (operand) {
                // Handle comparison with JavaScript's Infinity.
                if (operand === Infinity) { return -1; }
                if (operand === -Infinity) { return 1; }

                const parsedOperand = parseValue(operand);
                const currentRawVal = this.internalDigits;
                const otherRawVal = parsedOperand.internalDigits;

                if (parsedOperand.isSmallNum) {
                    return currentRawVal === otherRawVal ? 0 : currentRawVal > otherRawVal ? 1 : -1;
                }
                // If 'this' is small and 'other' is big.
                if ((currentRawVal < 0) !== parsedOperand.isNegativeFlag) {
                    return currentRawVal < 0 ? -1 : 1; // If 'this' is negative and 'other' positive, 'this' is smaller.
                }
                return currentRawVal < 0 ? 1 : -1; // Both same sign, 'this' is negative -> smaller, but if 'other' is larger BigNum, then 'this' is less negative, so larger.
            };
            SmallNumValue.prototype.compareTo = SmallNumValue.prototype.compare; // Alias for 'compareTo'.

            // NativeBigIntValue.prototype.compare method.
            NativeBigIntValue.prototype.compare = function (operand) {
                // Handle comparison with JavaScript's Infinity.
                if (operand === Infinity) { return -1; }
                if (operand === -Infinity) { return 1; }
                const currentVal = this.internalDigits;
                const otherVal = parseValue(operand).internalDigits;
                return currentVal === otherVal ? 0 : currentVal > otherVal ? 1 : -1;
            };
            NativeBigIntValue.prototype.compareTo = NativeBigIntValue.prototype.compare; // Alias for 'compareTo'.

            // Equality checks.
            BigNumValue.prototype.equals = function (operand) { return this.compare(operand) === 0; };
            NativeBigIntValue.prototype.eq = NativeBigIntValue.prototype.equals = SmallNumValue.prototype.eq = SmallNumValue.prototype.equals = BigNumValue.prototype.eq = BigNumValue.prototype.equals;

            // Inequality checks.
            BigNumValue.prototype.notEquals = function (operand) { return this.compare(operand) !== 0; };
            NativeBigIntValue.prototype.neq = NativeBigIntValue.prototype.notEquals = SmallNumValue.prototype.neq = SmallNumValue.prototype.notEquals = BigNumValue.prototype.neq = BigNumValue.prototype.notEquals;

            // Greater than checks.
            BigNumValue.prototype.greater = function (operand) { return this.compare(operand) > 0; };
            NativeBigIntValue.prototype.gt = NativeBigIntValue.prototype.greater = SmallNumValue.prototype.gt = SmallNumValue.prototype.greater = BigNumValue.prototype.gt = BigNumValue.prototype.greater;

            // Less than checks.
            BigNumValue.prototype.lesser = function (operand) { return this.compare(operand) < 0; };
            NativeBigIntValue.prototype.lt = NativeBigIntValue.prototype.lesser = SmallNumValue.prototype.lt = SmallNumValue.prototype.lesser = BigNumValue.prototype.lt = BigNumValue.prototype.lesser;

            // Greater than or equals checks.
            BigNumValue.prototype.greaterOrEquals = function (operand) { return this.compare(operand) >= 0; };
            NativeBigIntValue.prototype.geq = NativeBigIntValue.prototype.greaterOrEquals = SmallNumValue.prototype.geq = SmallNumValue.prototype.greaterOrEquals = BigNumValue.prototype.geq = BigNumValue.prototype.greaterOrEquals;

            // Less than or equals checks.
            BigNumValue.prototype.lesserOrEquals = function (operand) { return this.compare(operand) <= 0; };
            NativeBigIntValue.prototype.leq = NativeBigIntValue.prototype.lesserOrEquals = SmallNumValue.prototype.leq = SmallNumValue.prototype.lesserOrEquals = BigNumValue.prototype.leq = BigNumValue.prototype.lesserOrEquals;

            // Parity checks.
            BigNumValue.prototype.isEven = function () { return (this.internalDigits[0] & 1) === 0; };
            SmallNumValue.prototype.isEven = function () { return (this.internalDigits & 1) === 0; };
            NativeBigIntValue.prototype.isEven = function () { return (this.internalDigits & BigInt(1)) === BigInt(0); };

            BigNumValue.prototype.isOdd = function () { return (this.internalDigits[0] & 1) === 1; };
            SmallNumValue.prototype.isOdd = function () { return (this.internalDigits & 1) === 1; };
            NativeBigIntValue.prototype.isOdd = function () { return (this.internalDigits & BigInt(1)) === BigInt(1); };

            // Sign checks.
            BigNumValue.prototype.isPositive = function () { return !this.isNegativeFlag; };
            SmallNumValue.prototype.isPositive = function () { return this.internalDigits > 0; };
            NativeBigIntValue.prototype.isPositive = SmallNumValue.prototype.isPositive;

            BigNumValue.prototype.isNegative = function () { return this.isNegativeFlag; };
            SmallNumValue.prototype.isNegative = function () { return this.internalDigits < 0; };
            NativeBigIntValue.prototype.isNegative = SmallNumValue.prototype.isNegative;

            // Unit (1 or -1) checks.
            BigNumValue.prototype.isUnit = function () { return false; }; // BigNum is never unit by definition (unless it becomes small).
            SmallNumValue.prototype.isUnit = function () { return Math.abs(this.internalDigits) === 1; };
            NativeBigIntValue.prototype.isUnit = function () { return this.abs().internalDigits === BigInt(1); };

            // Zero check.
            BigNumValue.prototype.isZero = function () { return false; }; // BigNum is never zero by definition (unless it becomes small).
            SmallNumValue.prototype.isZero = function () { return this.internalDigits === 0; };
            NativeBigIntValue.prototype.isZero = function () { return this.internalDigits === BigInt(0); };

            // Divisibility check.
            BigNumValue.prototype.isDivisibleBy = function (operand) {
                const parsedOperand = parseValue(operand);
                if (parsedOperand.isZero()) return false;
                if (parsedOperand.isUnit()) return true;
                if (parsedOperand.compareAbs(2) === 0) return this.isEven(); // Optimization for 2.
                return this.mod(parsedOperand).isZero();
            };
            NativeBigIntValue.prototype.isDivisibleBy = SmallNumValue.prototype.isDivisibleBy = BigNumValue.prototype.isDivisibleBy;

            // Helper to check for basic primality (small primes).
            function checkBasicPrimality(valueObj) {
                const absVal = valueObj.abs();
                if (absVal.isUnit()) return false;
                if (absVal.equals(2) || absVal.equals(3) || absVal.equals(5)) return true;
                if (absVal.isEven() || absVal.isDivisibleBy(3) || absVal.isDivisibleBy(5)) return false;
                if (absVal.lesser(49)) return true; // Numbers less than 49 that passed above checks are prime.
                // If not determined yet, return undefined.
            }

            // Miller-Rabin primality test.
            function millerRabinTest(candidateNum, witnesses) {
                const nMinusOne = candidateNum.prev();
                let bComponent = nMinusOne;
                let rCount = 0; // Number of times n-1 is divisible by 2.
                let dValue, tempExponent, i, currentX;

                // Find r and b such that n-1 = b * 2^r.
                while (bComponent.isEven()) {
                    bComponent = bComponent.divide(2);
                    rCount++;
                }

                // Iterate through witnesses.
                witnessLoop: for (i = 0; i < witnesses.length; i++) {
                    if (candidateNum.lesser(witnesses[i])) continue; // Witness must be less than candidate.
                    currentX = bigInt(witnesses[i]).modPow(bComponent, candidateNum); // x = a^b mod n.
                    if (currentX.isUnit() || currentX.equals(nMinusOne)) continue witnessLoop; // Primary Miller-Rabin conditions.

                    // Check powers of x.
                    for (dValue = rCount - 1; dValue !== 0; dValue--) {
                        currentX = currentX.square().mod(candidateNum);
                        if (currentX.isUnit()) return false; // Composite if x^2 becomes 1 (non-trivial square root of 1).
                        if (currentX.equals(nMinusOne)) continue witnessLoop; // Passed this witness.
                    }
                    return false; // Failed all checks for this witness.
                }
                return true; // Passed all witnesses, likely prime.
            }

            // BigNumValue.prototype.isPrime method.
            BigNumValue.prototype.isPrime = function (isStrict) {
                const basicCheckResult = checkBasicPrimality(this);
                if (basicCheckResult !== undefinedValue) return basicCheckResult;

                const absoluteValue = this.abs();
                const numBits = absoluteValue.bitLength();

                // For smaller numbers, use a fixed set of strong witnesses.
                if (numBits.toJSNumber() <= 64)
                    return millerRabinTest(absoluteValue, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);

                // For larger numbers, determine number of witnesses based on log(N).
                const logN = Math.log(2) * numBits.toJSNumber();
                const numTests = Math.ceil((isStrict === true) ? (2 * Math.pow(logN, 2)) : logN);
                const testWitnesses = [];
                for (let i = 0; i < numTests; i++) {
                    testWitnesses.push(bigInt(i + 2));
                }
                return millerRabinTest(absoluteValue, testWitnesses);
            };
            // Assign isPrime to other prototypes.
            NativeBigIntValue.prototype.isPrime = SmallNumValue.prototype.isPrime = BigNumValue.prototype.isPrime;

            // BigNumValue.prototype.isProbablePrime method.
            BigNumValue.prototype.isProbablePrime = function (numIterations, randomGenerator) {
                const basicCheckResult = checkBasicPrimality(this);
                if (basicCheckResult !== undefinedValue) return basicCheckResult;

                const absoluteValue = this.abs();
                const totalIterations = numIterations === undefinedValue ? 5 : numIterations;
                const testWitnesses = [];
                for (let i = 0; i < totalIterations; i++) {
                    // Generate random witnesses between 2 and n-2.
                    testWitnesses.push(bigInt.randBetween(2, absoluteValue.minus(2), randomGenerator));
                }
                return millerRabinTest(absoluteValue, testWitnesses);
            };
            // Assign isProbablePrime to other prototypes.
            NativeBigIntValue.prototype.isProbablePrime = SmallNumValue.prototype.isProbablePrime = BigNumValue.prototype.isProbablePrime;

            // BigNumValue.prototype.modInv method (modular multiplicative inverse).
            BigNumValue.prototype.modInv = function (modulus) {
                let tempT = bigInt.zero, newTempT = bigInt.one;
                let rValue = parseValue(modulus);
                let newRValue = this.abs();
                let qValue, lastTValue, lastRValue;

                // Extended Euclidean Algorithm.
                while (!newRValue.isZero()) {
                    qValue = rValue.divide(newRValue);
                    lastTValue = tempT;
                    lastRValue = rValue;
                    tempT = newTempT;
                    rValue = newRValue;
                    newTempT = lastTValue.subtract(qValue.multiply(newTempT));
                    newRValue = lastRValue.subtract(qValue.multiply(newRValue));
                }
                // If r is not 1, numbers are not coprime.
                if (!rValue.isUnit()) throw new Error(this.toString() + " and " + modulus.toString() + " are not co-prime.");
                // Ensure result is positive.
                if (tempT.compare(0) === -1) {
                    tempT = tempT.add(modulus);
                }
                // Adjust sign if original number was negative.
                if (this.isNegative()) {
                    return tempT.negate();
                }
                return tempT;
            };
            // Assign modInv to other prototypes.
            NativeBigIntValue.prototype.modInv = SmallNumValue.prototype.modInv = BigNumValue.prototype.modInv;

            // BigNumValue.prototype.next method (increment by 1).
            BigNumValue.prototype.next = function () {
                const currentValArr = this.internalDigits;
                if (this.isNegativeFlag) {
                    return subtractSmallFromInternalArray(currentValArr, 1, this.isNegativeFlag); // For negative, next means decreasing absolute value.
                }
                return new BigNumValue(addSmallToInternalArray(currentValArr, 1), this.isNegativeFlag);
            };
            // SmallNumValue.prototype.next method.
            SmallNumValue.prototype.next = function () {
                const currentRawVal = this.internalDigits;
                if (currentRawVal + 1 < MAX_SAFE_INTEGER_JS) return new SmallNumValue(currentRawVal + 1);
                return new BigNumValue(MAX_SAFE_INTEGER_ARRAY, false); // If overflows, convert to BigNum.
            };
            // NativeBigIntValue.prototype.next method.
            NativeBigIntValue.prototype.next = function () {
                return new NativeBigIntValue(this.internalDigits + BigInt(1));
            };

            // BigNumValue.prototype.prev method (decrement by 1).
            BigNumValue.prototype.prev = function () {
                const currentValArr = this.internalDigits;
                if (this.isNegativeFlag) {
                    return new BigNumValue(addSmallToInternalArray(currentValArr, 1), true); // For negative, prev means increasing absolute value.
                }
                return subtractSmallFromInternalArray(currentValArr, 1, this.isNegativeFlag);
            };
            // SmallNumValue.prototype.prev method.
            SmallNumValue.prototype.prev = function () {
                const currentRawVal = this.internalDigits;
                if (currentRawVal - 1 > -MAX_SAFE_INTEGER_JS) return new SmallNumValue(currentRawVal - 1);
                return new BigNumValue(MAX_SAFE_INTEGER_ARRAY, true); // If underflows, convert to BigNum.
            };
            // NativeBigIntValue.prototype.prev method.
            NativeBigIntValue.prototype.prev = function () {
                return new NativeBigIntValue(this.internalDigits - BigInt(1));
            };

            // Pre-calculate powers of two up to BASE_VALUE for bitwise shifts.
            const powersOfTwo = [1];
            while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE_VALUE) {
                powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
            }
            const powers2Len = powersOfTwo.length;
            const highestPowerOfTwo = powersOfTwo[powers2Len - 1];

            // Helper to check if shift amount is small enough for direct JS number.
            function isShiftAmountSmall(shiftValue) {
                return Math.abs(shiftValue) <= BASE_VALUE;
            }

            // BigNumValue.prototype.shiftLeft method.
            BigNumValue.prototype.shiftLeft = function (shiftAmount) {
                const numToShift = parseValue(shiftAmount).toJSNumber();
                if (!isShiftAmountSmall(numToShift)) {
                    throw new Error(`Shift amount ${numToShift} is too large for shifting.`);
                }
                if (numToShift < 0) return this.shiftRight(-numToShift); // Negative shift left is shift right.
                let resultObj = this;
                if (resultObj.isZero()) return resultObj; // Shifting zero results in zero.

                let remainingShift = numToShift;
                // Perform shifts in chunks using pre-calculated powers of two.
                while (remainingShift >= powers2Len) {
                    resultObj = resultObj.multiply(highestPowerOfTwo);
                    remainingShift -= (powers2Len - 1); // Adjust remaining shift.
                }
                return resultObj.multiply(powersOfTwo[remainingShift]);
            };
            // Assign shiftLeft to other prototypes.
            NativeBigIntValue.prototype.shiftLeft = SmallNumValue.prototype.shiftLeft = BigNumValue.prototype.shiftLeft;

            // BigNumValue.prototype.shiftRight method.
            BigNumValue.prototype.shiftRight = function (shiftAmount) {
                let remainderQuotientPair;
                const numToShift = parseValue(shiftAmount).toJSNumber();
                if (!isShiftAmountSmall(numToShift)) {
                    throw new Error(`Shift amount ${numToShift} is too large for shifting.`);
                }
                if (numToShift < 0) return this.shiftLeft(-numToShift); // Negative shift right is shift left.
                let resultObj = this;

                let remainingShift = numToShift;
                // Perform shifts in chunks.
                while (remainingShift >= powers2Len) {
                    if (resultObj.isZero() || (resultObj.isNegative() && resultObj.isUnit())) return resultObj; // Special handling for -1 and 0.
                    remainderQuotientPair = generalDivMod(resultObj, highestPowerOfTwo);
                    resultObj = remainderQuotientPair[1].isNegative() ? remainderQuotientPair[0].prev() : remainderQuotientPair[0];
                    remainingShift -= (powers2Len - 1); // Adjust remaining shift.
                }
                remainderQuotientPair = generalDivMod(resultObj, powersOfTwo[remainingShift]);
                return remainderQuotientPair[1].isNegative() ? remainderQuotientPair[0].prev() : remainderQuotientPair[0];
            };
            // Assign shiftRight to other prototypes.
            NativeBigIntValue.prototype.shiftRight = SmallNumValue.prototype.shiftRight = BigNumValue.prototype.shiftRight;

            // Generic bitwise operation function.
            function performBitwiseOperation(xOperand, yOperand, operationFn) {
                yOperand = parseValue(yOperand);
                const xIsNegative = xOperand.isNegative();
                const yIsNegative = yOperand.isNegative();

                // Convert to two's complement representation for negative numbers.
                let xRemaining = xIsNegative ? xOperand.not() : xOperand;
                let yRemaining = yIsNegative ? yOperand.not() : yOperand;

                let xCurrentDigit = 0, yCurrentDigit = 0;
                let xDivModResult = null, yDivModResult = null;
                const operationResults = [];

                // Process digits from least significant.
                while (!xRemaining.isZero() || !yRemaining.isZero()) {
                    xDivModResult = generalDivMod(xRemaining, highestPowerOfTwo);
                    xCurrentDigit = xDivModResult[1].toJSNumber();
                    if (xIsNegative) {
                        xCurrentDigit = highestPowerOfTwo - 1 - xCurrentDigit; // Two's complement.
                    }

                    yDivModResult = generalDivMod(yRemaining, highestPowerOfTwo);
                    yCurrentDigit = yDivModResult[1].toJSNumber();
                    if (yIsNegative) {
                        yCurrentDigit = highestPowerOfTwo - 1 - yCurrentDigit; // Two's complement.
                    }

                    xRemaining = xDivModResult[0];
                    yRemaining = yDivModResult[0];
                    operationResults.push(operationFn(xCurrentDigit, yCurrentDigit));
                }

                // Handle the sign bit for two's complement.
                let finalSum = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
                // Reconstruct the result from digits.
                for (let i = operationResults.length - 1; i >= 0; i -= 1) {
                    finalSum = finalSum.multiply(highestPowerOfTwo).add(bigInt(operationResults[i]));
                }
                return finalSum;
            }

            // BigNumValue.prototype.not method (bitwise NOT).
            BigNumValue.prototype.not = function () {
                return this.negate().prev(); // Equivalent to -(this + 1).
            };
            // Assign not to other prototypes.
            NativeBigIntValue.prototype.not = SmallNumValue.prototype.not = BigNumValue.prototype.not;

            // BigNumValue.prototype.and method (bitwise AND).
            BigNumValue.prototype.and = function (operand) {
                return performBitwiseOperation(this, operand, (a, b) => a & b);
            };
            // Assign and to other prototypes.
            NativeBigIntValue.prototype.and = SmallNumValue.prototype.and = BigNumValue.prototype.and;

            // BigNumValue.prototype.or method (bitwise OR).
            BigNumValue.prototype.or = function (operand) {
                return performBitwiseOperation(this, operand, (a, b) => a | b);
            };
            // Assign or to other prototypes.
            NativeBigIntValue.prototype.or = SmallNumValue.prototype.or = BigNumValue.prototype.or;

            // BigNumValue.prototype.xor method (bitwise XOR).
            BigNumValue.prototype.xor = function (operand) {
                return performBitwiseOperation(this, operand, (a, b) => a ^ b);
            };
            // Assign xor to other prototypes.
            NativeBigIntValue.prototype.xor = SmallNumValue.prototype.xor = BigNumValue.prototype.xor;

            // Constants for rough lowest one bit calculation.
            const LOB_MASK_INT = 1 << 30;
            const LOB_MASK_BIGINT = (BASE_VALUE & -BASE_VALUE) * (BASE_VALUE & -BASE_VALUE) | LOB_MASK_INT;

            // Calculates a rough estimate of the lowest one bit (for GCD optimization).
            function getRoughLowestOneBit(numObj) {
                const rawVal = numObj.internalDigits;
                let xVal;
                if (typeof rawVal === "number") {
                    xVal = rawVal | LOB_MASK_INT;
                } else if (typeof rawVal === "bigint") {
                    xVal = rawVal | BigInt(LOB_MASK_INT);
                } else { // Array representation.
                    xVal = rawVal[0] + rawVal[1] * BASE_VALUE | LOB_MASK_BIGINT;
                }
                return xVal & -xVal; // Returns the lowest set bit.
            }

            // Calculates integer logarithm base 'base'.
            function calculateIntegerLog(valueNum, baseNum) {
                if (baseNum.compareTo(valueNum) <= 0) {
                    // Recursive step: log(N, B) = 2 * log(N, B^2) or 2 * log(N, B^2) + 1.
                    const tempResult = calculateIntegerLog(valueNum, baseNum.square(baseNum));
                    const pValue = tempResult.p;
                    const eValue = tempResult.e;
                    const tValue = pValue.multiply(baseNum);
                    return tValue.compareTo(valueNum) <= 0 ? { p: tValue, e: eValue * 2 + 1 } : { p: pValue, e: eValue * 2 };
                }
                return { p: bigInt(1), e: 0 }; // Base case: value is smaller than base.
            }

            // BigNumValue.prototype.bitLength method.
            BigNumValue.prototype.bitLength = function () {
                let currentNum = this;
                // For negative numbers, bit length is usually defined for the positive equivalent or two's complement.
                // Here, it's defined for the two's complement representation.
                if (currentNum.compareTo(bigInt(0)) < 0) {
                    currentNum = currentNum.negate().subtract(bigInt(1));
                }
                if (currentNum.compareTo(bigInt(0)) === 0) {
                    return bigInt(0);
                }
                return bigInt(calculateIntegerLog(currentNum, bigInt(2)).e).add(bigInt(1));
            };
            // Assign bitLength to other prototypes.
            NativeBigIntValue.prototype.bitLength = SmallNumValue.prototype.bitLength = BigNumValue.prototype.bitLength;

            // Static helper functions.
            function findMax(valA, valB) {
                valA = parseValue(valA);
                valB = parseValue(valB);
                return valA.greater(valB) ? valA : valB;
            }
            function findMin(valA, valB) {
                valA = parseValue(valA);
                valB = parseValue(valB);
                return valA.lesser(valB) ? valA : valB;
            }
            // Greatest Common Divisor (GCD) using binary GCD algorithm.
            function calculateGCD(valA, valB) {
                valA = parseValue(valA).abs();
                valB = parseValue(valB).abs();
                if (valA.equals(valB)) return valA;
                if (valA.isZero()) return valB;
                if (valB.isZero()) return valA;

                let commonFactor = IntegerConstructor[1], dFactor, tempVar;
                // Extract common factors of 2.
                while (valA.isEven() && valB.isEven()) {
                    dFactor = findMin(getRoughLowestOneBit(valA), getRoughLowestOneBit(valB));
                    valA = valA.divide(dFactor);
                    valB = valB.divide(dFactor);
                    commonFactor = commonFactor.multiply(dFactor);
                }
                // Remove factors of 2 from a.
                while (valA.isEven()) {
                    valA = valA.divide(getRoughLowestOneBit(valA));
                }
                // Main loop of binary GCD.
                do {
                    while (valB.isEven()) {
                        valB = valB.divide(getRoughLowestOneBit(valB));
                    }
                    if (valA.greater(valB)) { // Swap if a > b.
                        tempVar = valB; valB = valA; valA = tempVar;
                    }
                    valB = valB.subtract(valA); // b = b - a.
                } while (!valB.isZero());
                return commonFactor.isUnit() ? valA : valA.multiply(commonFactor);
            }
            // Least Common Multiple (LCM).
            function calculateLCM(valA, valB) {
                valA = parseValue(valA).abs();
                valB = parseValue(valB).abs();
                return valA.divide(calculateGCD(valA, valB)).multiply(valB);
            }
            // Generates a random number between a and b (inclusive).
            function generateRandBetween(valA, valB, randomNumberGenerator) {
                valA = parseValue(valA);
                valB = parseValue(valB);
                const rngFunction = randomNumberGenerator || Math.random;
                const lowerBound = findMin(valA, valB);
                const upperBound = findMax(valA, valB);
                const range = upperBound.subtract(lowerBound).add(1);

                if (range.isSmallNum) return lowerBound.add(Math.floor(rngFunction() * range.internalDigits));

                const rangeDigits = toBase(range, BASE_VALUE).internalDigits;
                const generatedResultDigits = [];
                let isRestrictedByRange = true; // True if digits must be <= rangeDigits[i]

                for (let i = 0; i < rangeDigits.length; i++) {
                    const currentUpperLimit = isRestrictedByRange ? rangeDigits[i] : BASE_VALUE;
                    const digit = truncateNumber(rngFunction() * currentUpperLimit);
                    generatedResultDigits.push(digit);
                    if (digit < currentUpperLimit) isRestrictedByRange = false; // Once a digit is less than max, subsequent digits can be anything up to BASE_VALUE-1.
                }
                return lowerBound.add(IntegerConstructor.fromArray(generatedResultDigits, BASE_VALUE, false));
            }

            // Parses a string value in a given base.
            const parseBasedValue = function (textInput, baseRadix, customAlphabet, caseSensitiveFlag) {
                const currentAlphabet = customAlphabet || DEFAULT_NUMERAL_ALPHABET;
                let processedText = String(textInput);
                let alphabetMap = {};

                // Handle case sensitivity.
                if (!caseSensitiveFlag) {
                    processedText = processedText.toLowerCase();
                    customAlphabet = currentAlphabet.toLowerCase();
                }

                const textLength = processedText.length;
                let i;
                const absoluteBase = Math.abs(baseRadix);

                // Build alphabet value map.
                for (i = 0; i < currentAlphabet.length; i++) {
                    alphabetMap[currentAlphabet[i]] = i;
                }

                // Validate digits in the input string.
                for (i = 0; i < textLength; i++) {
                    const char = processedText[i];
                    if (char === "-") continue;
                    if (char in alphabetMap) {
                        if (alphabetMap[char] >= absoluteBase) {
                            if (char === "1" && absoluteBase === 1) continue; // Special case for base 1.
                            throw new Error(`Character '${char}' is not a valid digit in base ${baseRadix}.`);
                        }
                    }
                }

                const baseNum = parseValue(baseRadix);
                const digitValues = [];
                const isInputNegative = processedText[0] === "-";

                // Extract digits and handle custom digit syntax (e.g., <123>).
                for (i = isInputNegative ? 1 : 0; i < processedText.length; i++) {
                    const char = processedText[i];
                    if (char in alphabetMap) digitValues.push(parseValue(alphabetMap[char]));
                    else if (char === "<") {
                        const startIndex = i;
                        do { i++; } while (processedText[i] !== ">" && i < processedText.length);
                        digitValues.push(parseValue(processedText.slice(startIndex + 1, i)));
                    }
                    else throw new Error(`Character '${char}' is not a valid character.`);
                }
                return parseBaseFromArray(digitValues, baseNum, isInputNegative);
            };

            // Converts an array of digits (in a given base) to an Integer object.
            function parseBaseFromArray(digitsArray, baseNum, isNegative) {
                let accumulatedValue = IntegerConstructor[0];
                let currentPower = IntegerConstructor[1];
                for (let i = digitsArray.length - 1; i >= 0; i--) {
                    accumulatedValue = accumulatedValue.add(digitsArray[i].times(currentPower));
                    currentPower = currentPower.times(baseNum);
                }
                return isNegative ? accumulatedValue.negate() : accumulatedValue;
            }

            // Converts a single digit value to its string representation using an alphabet.
            function digitToStringRepresentation(digitVal, alphabetRef) {
                alphabetRef = alphabetRef || DEFAULT_NUMERAL_ALPHABET;
                if (digitVal < alphabetRef.length) {
                    return alphabetRef[digitVal];
                }
                return `<${digitVal}>`; // Use custom syntax for digits larger than alphabet.
            }

            // Converts an Integer object to an array of digits in a specified base.
            function toBase(numObj, baseNum) {
                baseNum = bigInt(baseNum);
                if (baseNum.isZero()) {
                    if (numObj.isZero()) return { internalDigits: [0], isNegative: false };
                    throw new Error("Cannot convert non-zero numbers to base 0.");
                }
                // Special handling for base -1.
                if (baseNum.equals(-1)) {
                    if (numObj.isZero()) return { internalDigits: [0], isNegative: false };
                    if (numObj.isNegative())
                        return {
                            internalDigits: [].concat.apply([], Array.apply(null, Array(-numObj.toJSNumber()))
                                .map(Array.prototype.valueOf, [1, 0])
                            ),
                            isNegative: false
                        };

                    const alternatingArray = Array.apply(null, Array(numObj.toJSNumber() - 1))
                        .map(Array.prototype.valueOf, [0, 1]);
                    alternatingArray.unshift([1]);
                    return {
                        internalDigits: [].concat.apply([], alternatingArray),
                        isNegative: false
                    };
                }

                let finalNegativity = false;
                if (numObj.isNegative() && baseNum.isPositive()) {
                    finalNegativity = true;
                    numObj = numObj.abs();
                }
                // Special handling for base 1.
                if (baseNum.isUnit()) {
                    if (numObj.isZero()) return { internalDigits: [0], isNegative: false };
                    return {
                        internalDigits: Array.apply(null, Array(numObj.toJSNumber()))
                            .map(Number.prototype.valueOf, 1),
                        isNegative: finalNegativity
                    };
                }

                const outputDigits = [];
                let remainingNum = numObj;
                let dmResult;

                // Repeatedly divide by base and take remainder.
                while (remainingNum.isNegative() || remainingNum.compareAbs(baseNum) >= 0) {
                    dmResult = remainingNum.divmod(baseNum);
                    remainingNum = dmResult.quotient;
                    let currentDigit = dmResult.remainder;
                    if (currentDigit.isNegative()) {
                        currentDigit = baseNum.minus(currentDigit).abs(); // Ensure positive digit.
                        remainingNum = remainingNum.next(); // Adjust quotient.
                    }
                    outputDigits.push(currentDigit.toJSNumber());
                }
                outputDigits.push(remainingNum.toJSNumber()); // Push the last quotient.
                return { internalDigits: outputDigits.reverse(), isNegative: finalNegativity }; // Reverse for correct order.
            }

            // Converts an Integer object to its string representation in a specified base.
            function toBaseString(numObj, baseRadix, alphabetRef) {
                const digitArrayRepresentation = toBase(numObj, baseRadix);
                const signPrefix = digitArrayRepresentation.isNegative ? "-" : "";
                return signPrefix + digitArrayRepresentation.internalDigits.map(function (digitVal) {
                    return digitToStringRepresentation(digitVal, alphabetRef);
                }).join('');
            }

            // BigNumValue.prototype.toArray method.
            BigNumValue.prototype.toArray = function (radix) { return toBase(this, radix); };
            // SmallNumValue.prototype.toArray method.
            SmallNumValue.prototype.toArray = function (radix) { return toBase(this, radix); };
            // NativeBigIntValue.prototype.toArray method.
            NativeBigIntValue.prototype.toArray = function (radix) { return toBase(this, radix); };

            // BigNumValue.prototype.toString method.
            BigNumValue.prototype.toString = function (radix, alphabetRef) {
                const currentRadix = radix === undefinedValue ? 10 : radix;
                if (currentRadix !== 10) return toBaseString(this, currentRadix, alphabetRef);

                const digitArray = this.internalDigits;
                let arrayLength = digitArray.length;
                let stringRepresentation = String(digitArray[--arrayLength]); // Start with MSB.
                const zeroPadding = "0000000"; // For padding digits.
                let currentDigit;

                // Pad and concatenate remaining digits.
                while (--arrayLength >= 0) {
                    currentDigit = String(digitArray[arrayLength]);
                    stringRepresentation += zeroPadding.slice(currentDigit.length) + currentDigit;
                }
                const signPrefix = this.isNegativeFlag ? "-" : "";
                return signPrefix + stringRepresentation;
            };

            // SmallNumValue.prototype.toString method.
            SmallNumValue.prototype.toString = function (radix, alphabetRef) {
                const currentRadix = radix === undefinedValue ? 10 : radix;
                if (currentRadix != 10) return toBaseString(this, currentRadix, alphabetRef);
                return String(this.internalDigits);
            };

            // NativeBigIntValue.prototype.toString method (same as SmallNumValue for simplicity).
            NativeBigIntValue.prototype.toString = SmallNumValue.prototype.toString;

            // JSON serialization.
            NativeBigIntValue.prototype.toJSON = BigNumValue.prototype.toJSON = SmallNumValue.prototype.toJSON = function () { return this.toString(); };

            // ValueOf and toJSNumber methods.
            BigNumValue.prototype.valueOf = function () { return parseInt(this.toString(), 10); };
            BigNumValue.prototype.toJSNumber = BigNumValue.prototype.valueOf;

            SmallNumValue.prototype.valueOf = function () { return this.internalDigits; };
            SmallNumValue.prototype.toJSNumber = SmallNumValue.prototype.valueOf;

            NativeBigIntValue.prototype.valueOf = NativeBigIntValue.prototype.toJSNumber = function () {
                // Returns the numeric representation, truncating if too large for JS number.
                return parseInt(this.toString(), 10);
            };

            // Parses a string value into an Integer object.
            function parseStringInput(stringValue) {
                // Try to parse as a precise JS number first.
                if (isJsNumberPrecise(+stringValue)) {
                    const numVal = +stringValue;
                    if (numVal === truncateNumber(numVal))
                        return hasNativeBigIntSupport ? new NativeBigIntValue(BigInt(numVal)) : new SmallNumValue(numVal);
                    throw new Error(`Invalid integer string: ${stringValue}`);
                }

                const isNegative = stringValue[0] === "-";
                let processedString = isNegative ? stringValue.slice(1) : stringValue;

                // Handle scientific notation.
                const scientificParts = processedString.split(/e/i);
                if (scientificParts.length > 2) throw new Error(`Invalid integer string: ${scientificParts.join("e")}`);
                if (scientificParts.length === 2) {
                    let exponentPart = scientificParts[1];
                    if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
                    exponentPart = +exponentPart;
                    if (exponentPart !== truncateNumber(exponentPart) || !isJsNumberPrecise(exponentPart)) throw new Error(`Invalid integer: ${exponentPart} is not a valid exponent.`);

                    let baseText = scientificParts[0];
                    const decimalPointIndex = baseText.indexOf(".");
                    if (decimalPointIndex >= 0) {
                        exponentPart -= (baseText.length - decimalPointIndex - 1);
                        baseText = baseText.slice(0, decimalPointIndex) + baseText.slice(decimalPointIndex + 1);
                    }
                    if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers.");
                    baseText += (new Array(exponentPart + 1)).join("0"); // Append zeros.
                    processedString = baseText;
                }

                // Validate string format.
                const isValidFormat = /^([0-9][0-9]*)$/.test(processedString);
                if (!isValidFormat) throw new Error(`Invalid integer string: ${processedString}`);

                // Use native BigInt if available.
                if (hasNativeBigIntSupport) {
                    return new NativeBigIntValue(BigInt(isNegative ? "-" + processedString : processedString));
                }

                // Convert string to internal array representation.
                const digitArray = [];
                const maxIndex = processedString.length;
                const segmentLength = LOG_BASE_VALUE;
                let minIndex = maxIndex - segmentLength;

                while (maxIndex > 0) {
                    digitArray.push(+processedString.slice(minIndex, maxIndex));
                    minIndex -= segmentLength;
                    if (minIndex < 0) minIndex = 0;
                    maxIndex -= segmentLength;
                }
                trimLeadingZeros(digitArray);
                return new BigNumValue(digitArray, isNegative);
            }

            // Parses a number value into an Integer object.
            function parseNumberInput(numberValue) {
                if (hasNativeBigIntSupport) {
                    return new NativeBigIntValue(BigInt(numberValue));
                }
                if (isJsNumberPrecise(numberValue)) {
                    if (numberValue !== truncateNumber(numberValue)) throw new Error(`${numberValue} is not an integer.`);
                    return new SmallNumValue(numberValue);
                }
                // If number is too large/small for JS number, convert to string and parse.
                return parseStringInput(numberValue.toString());
            }

            // General value parser.
            function parseValue(inputValue) {
                if (typeof inputValue === "number") {
                    return parseNumberInput(inputValue);
                }
                if (typeof inputValue === "string") {
                    return parseStringInput(inputValue);
                }
                if (typeof inputValue === "bigint") {
                    return new NativeBigIntValue(inputValue);
                }
                return inputValue; // Assume it's already an Integer object.
            }

            // Pre-define common integer values for efficiency.
            for (let i = 0; i < 1000; i++) {
                IntegerConstructor[i] = parseValue(i);
                if (i > 0) IntegerConstructor[-i] = parseValue(-i);
            }
            // Backwards compatibility aliases.
            IntegerConstructor.one = IntegerConstructor[1];
            IntegerConstructor.zero = IntegerConstructor[0];
            IntegerConstructor.minusOne = IntegerConstructor[-1];
            IntegerConstructor.max = findMax;
            IntegerConstructor.min = findMin;
            IntegerConstructor.gcd = calculateGCD;
            IntegerConstructor.lcm = calculateLCM;
            IntegerConstructor.isInstance = function (x) { return x instanceof BigNumValue || x instanceof SmallNumValue || x instanceof NativeBigIntValue; };
            IntegerConstructor.randBetween = generateRandBetween;

            IntegerConstructor.fromArray = function (digitArr, baseRadix, isNegative) {
                // Map input digits to Integer objects before parsing.
                const processedDigits = digitArr.map(parseValue);
                return parseBaseFromArray(processedDigits, parseValue(baseRadix || 10), isNegative);
            };

            return IntegerConstructor;
        })(); // End of bigInt IIFE.

        // Node.js module export.
        if (true && currentModule.hasOwnProperty("exports")) {
            currentModule.exports = bigInt;
        }

        // AMD module export.
        if (true) {
            amdDefineResult = (function () {
                return bigInt;
            }).call(moduleExports, reqFunc, moduleExports, currentModule); // Changed exports to moduleExports for clarity.

            // If AMD result is defined, apply it to module exports.
            if (amdDefineResult !== undefinedValue) {
                currentModule.exports = amdDefineResult;
            }
        }
    }.call(this, reqFunc("./node_modules/webpack/buildin/module.js")(moduleRef)))) // WEBPACK VAR INJECTION END.

// SourceURL for debugging purposes.
// # sourceURL=webpack:///./node_modules/big-integer/BigInteger.js?
}),

// Path: ./node_modules/webpack/buildin/module.js
// Webpack's internal module polyfill.
"./node_modules/webpack/buildin/module.js":
(function(currentModule, exportObj) {

    // This function ensures that the 'module' object behaves correctly in Webpack.
    currentModule.exports = function(modRef) {
        if (!modRef.webpackPolyfill) {
            // Deprecate function is a no-op in the polyfill.
            modRef.deprecate = function() {};
            modRef.paths = []; // Initialize paths array.
            // module.parent is undefined by default.
            if (!modRef.children) modRef.children = []; // Initialize children array if not present.

            // Define getters for 'loaded' and 'id' properties.
            Object.defineProperty(modRef, "loaded", {
                enumerable: true,
                get: function() {
                    return modRef.isLoaded; // Renamed from 'l'
                }
            });
            Object.defineProperty(modRef, "id", {
                enumerable: true,
                get: function() {
                    return modRef.id; // Renamed from 'i'
                }
            });
            modRef.webpackPolyfill = 1; // Mark as polyfilled.
        }
        return modRef;
    };

// SourceURL for debugging purposes.
// # sourceURL=webpack:///(webpack)/buildin/module.js?
}),

// Path: ./src/ABC152/A.js
// Application logic for problem ABC152 A.
"./src/ABC152/A.js":
(function(moduleRef, exportObj, requireFn) {

    "use strict";
    // Mark this module as an ES Module for proper export handling.
    requireFn.markAsESModule(exportObj);

    // Import file system utility.
    const fileSystemUtil = requireFn("fs");
    // Import big-integer library (though not used in this specific problem logic).
    const largeNumberLib = requireFn("./node_modules/big-integer/BigInteger.js");

    // Helper functions for destructuring arrays (generated by Babel/Webpack).
    // These are typically for transpiled code to support ES6 features in older environments.
    function _extractArrayToVariables(sourceArray, count) {
        if (Array.isArray(sourceArray)) return sourceArray;
        return _throwNonIterableError();
    }
    function _throwNonIterableError() { throw new TypeError("Invalid attempt to destructure non-iterable instance."); }
    function _limitIterableToArray(iterableInput, limitCount) {
        if (!(Symbol.iterator in Object(iterableInput) || Object.prototype.toString.call(iterableInput) === "[object Arguments]")) { return; }
        const tempArray = [];
        let doneReading = false;
        let iterationError = false;
        let iteratorRef = undefined;
        try {
            for (let currentItem of iterableInput[Symbol.iterator]()) {
                tempArray.push(currentItem);
                if (limitCount && tempArray.length === limitCount) break;
            }
        } catch (err) {
            iterationError = true;
            iteratorRef = err;
        } finally {
            try {
                if (!doneReading && iterableInput["return"] != null) iterableInput["return"]();
            } finally {
                if (iterationError) throw iteratorRef;
            }
        }
        return tempArray;
    }

    // Main program logic function.
    const processInputData = (rawData) => {
        // Guard clause: ensure rawData is a string and not empty.
        if (typeof rawData !== 'string' || rawData.trim().length === 0) {
            console.error("Input data is invalid or empty.");
            return;
        }

        // Split the input into lines, take the first line, and split it by spaces.
        const firstLine = rawData.split('\n')[0].trim();
        const lineSegments = firstLine.split(' ');

        // Check if we have exactly two segments as expected.
        if (lineSegments.length !== 2) {
            console.error("Input format error: Expected two space-separated values.");
            return;
        }

        // Extract the two values using destructuring.
        // Original: var _input$split$0$split = input.split('\\n')[0].split(' '),
        //           _input$split$0$split2 = _slicedToArray(_input$split$0$split, 2),
        //           N = _input$split$0$split2[0],
        //           M = _input$split$0$split2[1];
        // Rewritten to be more direct and use local vars for clarity.
        const [firstVal, secondVal] = _extractArrayToVariables(_limitIterableToArray(lineSegments, 2), 2);

        // Perform the comparison.
        let comparisonResultString;
        if (firstVal === secondVal) {
            comparisonResultString = 'Yes';
        } else {
            comparisonResultString = 'No';
        }

        // Output the result.
        console.log(comparisonResultString);
    };

    // Read input from standard input and execute the main logic.
    const stdInputContent = fileSystemUtil.readFileSync('/dev/stdin', 'utf8');
    processInputData(stdInputContent);

    // Some redundant empty line for structural change.

// SourceURL for debugging purposes.
// # sourceURL=webpack:///./src/ABC152/A.js?
}),

// Path: external "fs"
// External module reference for Node.js 'fs' module.
"fs":
(function(moduleRef, exportObj) {

    // Simply proxies to Node.js's built-in 'require'.
    moduleRef.exports = require("fs");

// SourceURL for debugging purposes.
// # sourceURL=webpack:///external_%22fs%22?
})

});