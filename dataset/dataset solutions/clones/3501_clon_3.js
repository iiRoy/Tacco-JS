var moduleLoader = function(moduleDefinitions, moduleCache, entryPoints, exportTargetName) {
    var currentError,
        globalParcelLoader = typeof parcelRequire === "function" && parcelRequire,
        globalNodeResolver = typeof require === "function" && require;

    // Helper function to resolve and load modules
    function resolveAndLoadModule(moduleId, bypassCacheCheck) {
        // Check if module is already in cache
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Check if module definition exists
        if (!moduleDefinitions[moduleId]) {
            // Attempt to load from parent or global Parcel/Node.js resolvers
            var externalParcelResolver = typeof parcelRequire === "function" && parcelRequire;
            if (!bypassCacheCheck && externalParcelResolver) return externalParcelResolver(moduleId, true);
            if (globalParcelLoader) return globalParcelLoader(moduleId, true);
            if (globalNodeResolver && typeof moduleId === "string") return globalNodeResolver(moduleId);

            // If module not found, throw an error
            var moduleNotFoundErr = new Error("Unable to locate module '" + moduleId + "'");
            throw (moduleNotFoundErr.code = "MODULE_NOT_FOUND", moduleNotFoundErr);
        }

        // Initialize module entry in cache
        var moduleEntry = moduleCache[moduleId] = new resolveAndLoadModule.Module(moduleId);
        moduleEntry.exports = {}; // Ensure exports object is available immediately

        // --- Guard clause: validate module definition structure ---
        var moduleDef = moduleDefinitions[moduleId];
        if (!Array.isArray(moduleDef) || moduleDef.length < 2 || typeof moduleDef[0] !== 'function') {
            throw new Error("Corrupted module definition for ID: " + moduleId + ". Expected [function, object].");
        }

        var moduleFunction = moduleDef[0];
        var moduleDependencies = moduleDef[1];

        // Custom resolver for the module
        moduleEntry.dependencyResolver = function(depPath) {
            return moduleDependencies[depPath] || depPath;
        };
        // The original `p.cache = {}` was likely a placeholder or for specific Parcel scenarios.
        // It's not strictly essential for basic module resolution here, so it can be omitted
        // or kept as a no-op if necessary. For Type III, we can remove it.

        // Execute the module function
        moduleFunction.call(moduleEntry.exports, moduleEntry.dependencyResolver, moduleEntry, moduleEntry.exports, this);

        // Return the module's exports
        return moduleCache[moduleId].exports;
    }

    resolveAndLoadModule.isCustomLoader = true;
    resolveAndLoadModule.Module = function(id) {
        this.id = id;
        this.bundle = resolveAndLoadModule;
        this.exports = {};
    };
    resolveAndLoadModule.allModuleDefinitions = moduleDefinitions;
    resolveAndLoadModule.moduleCache = moduleCache;
    resolveAndLoadModule.parentLoader = globalParcelLoader;
    resolveAndLoadModule.registerModule = function(id, exportValue) {
        moduleDefinitions[id] = [function(moduleExports, moduleRef) {
            moduleRef.exports = exportValue;
        }, {}];
    };

    // Process all entry points
    for (var i = 0; i < entryPoints.length; i++) {
        try {
            resolveAndLoadModule(entryPoints[i]);
        } catch (err) {
            // Store the first error encountered, but continue processing if possible
            if (!currentError) {
                currentError = err;
            }
        }
    }

    // If there are entry points, determine the final export
    if (entryPoints.length > 0) {
        var lastEntryPointResult = resolveAndLoadModule(entryPoints[entryPoints.length - 1]);
        if (typeof exports === "object" && typeof module !== "undefined") {
            module.exports = lastEntryPointResult;
        } else if (typeof define === "function" && define.amd) {
            define(function() {
                return lastEntryPointResult;
            });
        } else if (exportTargetName) {
            this[exportTargetName] = lastEntryPointResult;
        }
    }

    // Re-throw any stored error
    if (currentError) {
        throw currentError;
    }

    return resolveAndLoadModule;
}({
    "9xaU": [function(require, module, exports) {
        // --- Big-integer library Type III clone ---
        // Original: https://github.com/peterolson/BigInteger.js/blob/master/BigInteger.min.js
        const bigIntFactory = (function(initialValue) {
            "use strict";

            const BASE_POWER = 1e7; // Each digit represents up to 10^7
            const DIGITS_PER_CHUNK = 7; // Number of decimal digits per chunk
            const MAX_JS_SAFE_INTEGER = 9007199254740992; // 2^53
            const MAX_SMALL_INT_DIGITS = numberToDigitArray(MAX_JS_SAFE_INTEGER); // Precomputed digit array for MAX_JS_SAFE_INTEGER
            const DEFAULT_RADIX_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
            const IS_NATIVE_BIGINT_SUPPORTED = typeof BigInt === "function";

            // Main BigInt constructor/factory function
            function BigIntConstructor(value, base, radixAlphabet, isStrict) {
                if (value === undefined) {
                    return BigIntConstructor[0]; // Return zero if no arguments
                }
                if (base !== undefined && (base !== 10 || radixAlphabet)) {
                    return parseBaseString(value, base, radixAlphabet, isStrict);
                }
                return normalizeInputToBigInt(value);
            }

            // Prototype for large BigInts (represented as an array of digits)
            function LargeBigInt(digitArray, isNegative) {
                this.value = digitArray;
                this.isNegative = isNegative;
                this.isSmall = false;
                // Added for internal tracking and clarity
                this._representationType = 'LargeDigitArray';
            }

            // Prototype for small BigInts (represented as a native JavaScript number)
            function SmallBigInt(numericValue) {
                this.value = numericValue;
                this.isNegative = numericValue < 0;
                this.isSmall = true;
                this._representationType = 'SmallNativeNumber';
            }

            // Prototype for native BigInts (using JavaScript's built-in BigInt type)
            function NativeBigInt(nativeBigIntValue) {
                this.value = nativeBigIntValue;
                // Native BigInts intrinsically handle sign and don't have a 'small' property
                // This property can be useful for distinguishing internal types
                this._representationType = 'NativeBigInt';
            }

            // All BigInt prototypes inherit from the main BigIntConstructor's prototype
            LargeBigInt.prototype = Object.create(BigIntConstructor.prototype);
            SmallBigInt.prototype = Object.create(BigIntConstructor.prototype);
            NativeBigInt.prototype = Object.create(BigIntConstructor.prototype);

            // --- Utility Functions ---

            // Normalizes any input into a BigInt object (LargeBigInt, SmallBigInt, or NativeBigInt)
            function normalizeInputToBigInt(input) {
                if (typeof input === "number") {
                    // Guard: Ensure input number is an integer
                    if (!Number.isInteger(input)) {
                        throw new Error(`Input number ${input} is not an integer.`);
                    }
                    if (isWithinSmallIntRange(input)) {
                        return IS_NATIVE_BIGINT_SUPPORTED ? new NativeBigInt(BigInt(input)) : new SmallBigInt(input);
                    }
                    // If it's a number but too large for SmallBigInt, parse it as a string
                    return parseIntegerString(String(input));
                }
                if (typeof input === "string") {
                    return parseIntegerString(input);
                }
                if (typeof input === "bigint") {
                    return new NativeBigInt(input);
                }
                // Assume it's already a BigInt object if none of the above
                return input;
            }

            // Checks if a number fits within the SmallBigInt range
            function isWithinSmallIntRange(num) {
                return num > -MAX_JS_SAFE_INTEGER && num < MAX_JS_SAFE_INTEGER;
            }

            // Converts a number to an array of digits in BASE_POWER
            function numberToDigitArray(num) {
                const absoluteNum = Math.abs(num);
                if (absoluteNum < BASE_POWER) {
                    return [absoluteNum];
                }
                if (absoluteNum < 1e14) { // BASE_POWER * BASE_POWER
                    return [absoluteNum % BASE_POWER, Math.floor(absoluteNum / BASE_POWER)];
                }
                // For numbers up to BASE_POWER^3, which is 10^21, beyond safe integer limit
                return [absoluteNum % BASE_POWER, Math.floor(absoluteNum / BASE_POWER) % BASE_POWER, Math.floor(absoluteNum / 1e14)];
            }

            // Converts a digit array back to a native number if possible, otherwise returns the array
            function digitArrayToNumber(digitArray) {
                trimLeadingZeros(digitArray);
                const arrayLength = digitArray.length;

                // --- Rewritten switch to if/else if for slightly different flow and guard ---
                if (arrayLength === 0) {
                    return 0;
                } else if (arrayLength === 1) {
                    return digitArray[0];
                } else if (arrayLength === 2) {
                    return digitArray[0] + digitArray[1] * BASE_POWER;
                } else if (arrayLength === 3) {
                    // Check for potential overflow for larger values before combining
                    const highPart = digitArray[1] + digitArray[2] * BASE_POWER;
                    if (highPart > MAX_JS_SAFE_INTEGER / BASE_POWER) {
                        return digitArray; // Too large for native number, return array
                    }
                    const combined = digitArray[0] + highPart * BASE_POWER;
                    if (isWithinSmallIntRange(combined)) return combined;
                }
                // If it's too long or exceeds MAX_JS_SAFE_INTEGER, return the array
                if (arrayLength > 3 || compareDigitArrays(digitArray, MAX_SMALL_INT_DIGITS) >= 0) {
                    return digitArray;
                }
                // Fallback for cases where it's small but not covered by explicit cases
                let result = 0;
                let multiplier = 1;
                for (let i = 0; i < arrayLength; i++) {
                    result += digitArray[i] * multiplier;
                    multiplier *= BASE_POWER;
                }
                return result;
            }

            // Removes leading (most significant) zero digits from an array
            function trimLeadingZeros(digitArray) {
                let i = digitArray.length;
                while (i > 0 && digitArray[--i] === 0); // Find the first non-zero digit from the end
                digitArray.length = i + 1; // Truncate the array
            }

            // Creates an array filled with zeros
            function createZeroFilledArray(length) {
                // --- Rewritten to use Array.fill() for clarity and potential efficiency ---
                return new Array(length).fill(0);
            }

            // Truncates a number to an integer (floor for positive, ceil for negative)
            function truncateToInteger(num) {
                return num > 0 ? Math.floor(num) : Math.ceil(num);
            }

            // Compares two digit arrays (unsigned magnitude)
            // Returns 1 if arr1 > arr2, -1 if arr1 < arr2, 0 if equal
            function compareDigitArrays(arr1, arr2) {
                if (arr1.length !== arr2.length) {
                    return arr1.length > arr2.length ? 1 : -1;
                }
                // Compare from most significant digit (rightmost in our representation)
                for (let i = arr1.length - 1; i >= 0; i--) {
                    if (arr1[i] !== arr2[i]) {
                        return arr1[i] > arr2[i] ? 1 : -1;
                    }
                }
                return 0;
            }

            // --- Core Arithmetic Operations on Digit Arrays (Internal) ---

            // Adds two digit arrays (unsigned)
            function addDigitArrays(arr1, arr2) {
                const len1 = arr1.length;
                const len2 = arr2.length;
                const result = new Array(len1); // Result will be at least as long as the longer array
                let carry = 0;

                for (let i = 0; i < len2; i++) {
                    const sum = arr1[i] + arr2[i] + carry;
                    result[i] = sum % BASE_POWER;
                    carry = Math.floor(sum / BASE_POWER);
                }
                for (let i = len2; i < len1; i++) {
                    const sum = arr1[i] + carry;
                    result[i] = sum % BASE_POWER;
                    carry = Math.floor(sum / BASE_POWER);
                }
                if (carry > 0) {
                    result.push(carry);
                }
                return result;
            }

            // Adds a small number (single digit) to a digit array (unsigned)
            function addSmallDigitToDigitArray(digitArray, smallNum) {
                const len = digitArray.length;
                const result = new Array(len);
                let carry = smallNum;

                for (let i = 0; i < len; i++) {
                    const sum = digitArray[i] + carry;
                    result[i] = sum % BASE_POWER;
                    carry = Math.floor(sum / BASE_POWER);
                }
                // --- Updated loop condition for clarity ---
                while (carry > 0) {
                    result.push(carry % BASE_POWER);
                    carry = Math.floor(carry / BASE_POWER);
                }
                return result;
            }

            // Subtracts arr2 from arr1 (arr1 - arr2), unsigned. Assumes arr1 >= arr2.
            function subtractDigitArrays(arr1, arr2) {
                const len1 = arr1.length;
                const len2 = arr2.length;
                const result = new Array(len1);
                let borrow = 0;

                for (let i = 0; i < len2; i++) {
                    let diff = arr1[i] - borrow - arr2[i];
                    if (diff < 0) {
                        diff += BASE_POWER;
                        borrow = 1;
                    } else {
                        borrow = 0;
                    }
                    result[i] = diff;
                }
                for (let i = len2; i < len1; i++) {
                    let diff = arr1[i] - borrow;
                    if (diff < 0) {
                        diff += BASE_POWER;
                        borrow = 1;
                    } else {
                        result[i++] = diff; // Optimization: If no more borrow, copy rest
                        borrow = 0; // Reset borrow
                        break;
                    }
                    result[i] = diff;
                }
                // --- Simplified copying of remaining digits if borrow chain breaks ---
                if (borrow === 0) {
                    for (let i = len2; i < len1; i++) { // Continue from where the previous loop left off
                        result[i] = arr1[i];
                    }
                }
                trimLeadingZeros(result);
                return result;
            }

            // Subtracts a small number from a digit array, handles sign
            function subtractSmallDigitFromDigitArray(digitArray, smallNum, isInputNegative) {
                const len = digitArray.length;
                const result = new Array(len);
                let borrow = -smallNum; // Small num becomes negative for subtraction

                for (let i = 0; i < len; i++) {
                    let diff = digitArray[i] + borrow; // This is (digitArray[i] - smallNum) essentially
                    borrow = Math.floor(diff / BASE_POWER);
                    diff %= BASE_POWER;
                    result[i] = diff < 0 ? diff + BASE_POWER : diff;
                }

                const normalizedResult = digitArrayToNumber(result);
                if (typeof normalizedResult === "number") {
                    return new SmallBigInt(isInputNegative ? -normalizedResult : normalizedResult);
                }
                return new LargeBigInt(normalizedResult, isInputNegative);
            }

            // Multiplies two digit arrays (unsigned)
            function multiplyDigitArrays(arr1, arr2) {
                const len1 = arr1.length;
                const len2 = arr2.length;
                const result = createZeroFilledArray(len1 + len2);

                for (let i = 0; i < len1; ++i) {
                    const val1 = arr1[i];
                    let carry = 0;
                    for (let j = 0; j < len2; ++j) {
                        const productTerm = val1 * arr2[j] + result[i + j] + carry;
                        carry = Math.floor(productTerm / BASE_POWER);
                        result[i + j] = productTerm % BASE_POWER;
                    }
                    result[i + len2] += carry;
                }
                trimLeadingZeros(result);
                return result;
            }

            // Multiplies a digit array by a small number (unsigned)
            function multiplyDigitArrayBySmall(digitArray, smallNum) {
                const len = digitArray.length;
                const result = new Array(len);
                let carry = 0;

                for (let i = 0; i < len; i++) {
                    const product = digitArray[i] * smallNum + carry;
                    result[i] = product % BASE_POWER;
                    carry = Math.floor(product / BASE_POWER);
                }
                // --- Updated loop condition ---
                while (carry > 0) {
                    result.push(carry % BASE_POWER);
                    carry = Math.floor(carry / BASE_POWER);
                }
                return result;
            }

            // Squares a digit array (unsigned)
            function squareDigitArray(digitArray) {
                const len = digitArray.length;
                const result = createZeroFilledArray(len + len);

                for (let i = 0; i < len; i++) {
                    let carry = 0 - digitArray[i] * digitArray[i]; // Start with negative square for diagonal
                    for (let j = i; j < len; j++) {
                        const productTerm = digitArray[i] * digitArray[j] * (i === j ? 1 : 2) + result[i + j] + carry;
                        carry = Math.floor(productTerm / BASE_POWER);
                        result[i + j] = productTerm % BASE_POWER;
                    }
                    result[i + len] += carry;
                }
                trimLeadingZeros(result);
                return result;
            }

            // Divides a digit array by a small number (unsigned)
            function divideDigitArrayBySmall(digitArray, smallNum) {
                const len = digitArray.length;
                const quotientArr = new Array(len);
                let remainder = 0;

                for (let i = len - 1; i >= 0; --i) {
                    const currentDividend = remainder * BASE_POWER + digitArray[i];
                    const quotientDigit = truncateToInteger(currentDividend / smallNum);
                    remainder = currentDividend % smallNum;
                    quotientArr[i] = quotientDigit;
                }
                return [quotientArr, remainder];
            }

            // Performs division (quotient and remainder) for two BigInts
            function performDivision(dividendObj, divisorObj) {
                divisorObj = normalizeInputToBigInt(divisorObj);

                // --- Guard: Division by zero ---
                if (divisorObj.isZero()) {
                    throw new Error("Division by zero is not permitted.");
                }

                if (IS_NATIVE_BIGINT_SUPPORTED) {
                    return [
                        new NativeBigInt(dividendObj.value / divisorObj.value),
                        new NativeBigInt(dividendObj.value % divisorObj.value)
                    ];
                }

                let dividendValue = dividendObj.value;
                let divisorValue = divisorObj.value;

                if (dividendObj.isSmall) {
                    if (divisorObj.isSmall) {
                        return [
                            new SmallBigInt(truncateToInteger(dividendValue / divisorValue)),
                            new SmallBigInt(dividendValue % divisorValue)
                        ];
                    }
                    return [BigIntConstructor[0], dividendObj]; // Quotient is 0, remainder is dividend
                }

                if (divisorObj.isSmall) {
                    if (divisorValue === 1) return [dividendObj, BigIntConstructor[0]];
                    if (divisorValue === -1) return [dividendObj.negate(), BigIntConstructor[0]];

                    const absDivisor = Math.abs(divisorValue);
                    if (absDivisor < BASE_POWER) {
                        const [quotientDigits, remainder] = divideDigitArrayBySmall(dividendValue, absDivisor);
                        const normalizedQuotient = digitArrayToNumber(quotientDigits);
                        const finalRemainder = dividendObj.isNegative ? -remainder : remainder;

                        let quotientResult;
                        if (typeof normalizedQuotient === "number") {
                            quotientResult = new SmallBigInt((dividendObj.isNegative !== divisorObj.isNegative) ? -normalizedQuotient : normalizedQuotient);
                        } else {
                            quotientResult = new LargeBigInt(normalizedQuotient, dividendObj.isNegative !== divisorObj.isNegative);
                        }
                        return [quotientResult, new SmallBigInt(finalRemainder)];
                    }
                    // If small divisor is too large for single digit, convert to digit array
                    divisorValue = numberToDigitArray(absDivisor);
                }

                // Comparison before full division
                const comparisonResult = compareDigitArrays(dividendValue, divisorValue);
                if (comparisonResult === -1) {
                    return [BigIntConstructor[0], dividendObj];
                }
                if (comparisonResult === 0) {
                    return [BigIntConstructor[dividendObj.isNegative === divisorObj.isNegative ? 1 : -1], BigIntConstructor[0]];
                }

                // Long division algorithm selection based on length heuristic
                let quotientDigitsArray;
                let remainderDigitsArray;

                // Heuristic for Karatsuba-like division (often combined with multiplication threshold)
                // The original code used a similar length check for selecting division algorithm.
                if (dividendValue.length + divisorValue.length <= 200) {
                    // "Short" division algorithm for moderate sizes
                    // This is a complex internal algorithm, keeping its structure largely intact.
                    const dividendLen = dividendValue.length;
                    const divisorLen = divisorValue.length;
                    const resultQuotient = createZeroFilledArray(divisorLen);
                    const highDivisorDigit = divisorValue[divisorLen - 1];
                    const normalizationFactor = Math.ceil(BASE_POWER / (2 * highDivisorDigit));

                    const scaledDividend = multiplyDigitArrayBySmall(dividendValue, normalizationFactor);
                    const scaledDivisor = multiplyDigitArrayBySmall(divisorValue, normalizationFactor);

                    if (scaledDividend.length <= dividendLen) {
                        scaledDividend.push(0);
                    }
                    scaledDivisor.push(0); // Pad scaled divisor for consistent indexing

                    const normalizedHighDivisorDigit = scaledDivisor[divisorLen - 1];

                    for (let i = dividendLen - divisorLen; i >= 0; i--) {
                        let estimatedQuotientDigit = BASE_POWER - 1;
                        if (scaledDividend[i + divisorLen] !== normalizedHighDivisorDigit) {
                            estimatedQuotientDigit = Math.floor((scaledDividend[i + divisorLen] * BASE_POWER + scaledDividend[i + divisorLen - 1]) / normalizedHighDivisorDigit);
                        }

                        let currentCarry = 0;
                        let subtractionAccumulator = 0;
                        const scaledDivisorFullLength = scaledDivisor.length;

                        for (let j = 0; j < scaledDivisorFullLength; j++) {
                            currentCarry += estimatedQuotientDigit * scaledDivisor[j];
                            const termProduct = currentCarry % BASE_POWER;
                            currentCarry = Math.floor(currentCarry / BASE_POWER);

                            subtractionAccumulator += scaledDividend[i + j] - termProduct;
                            if (subtractionAccumulator < 0) {
                                scaledDividend[i + j] = subtractionAccumulator + BASE_POWER;
                                subtractionAccumulator = -1;
                            } else {
                                scaledDividend[i + j] = subtractionAccumulator;
                                subtractionAccumulator = 0;
                            }
                        }

                        while (subtractionAccumulator !== 0) {
                            estimatedQuotientDigit--;
                            currentCarry = 0;
                            for (let j = 0; j < scaledDivisorFullLength; j++) {
                                currentCarry += scaledDividend[i + j] - BASE_POWER + scaledDivisor[j];
                                if (currentCarry < 0) {
                                    scaledDividend[i + j] = currentCarry + BASE_POWER;
                                    currentCarry = 0;
                                } else {
                                    scaledDividend[i + j] = currentCarry;
                                    currentCarry = 1;
                                }
                            }
                            subtractionAccumulator += currentCarry;
                        }
                        resultQuotient[i] = estimatedQuotientDigit;
                    }
                    scaledDividend.length = divisorLen;
                    quotientDigitsArray = divideDigitArrayBySmall(resultQuotient, normalizationFactor)[0];
                    remainderDigitsArray = divideDigitArrayBySmall(scaledDividend, normalizationFactor)[0];

                } else {
                    // "Long" division algorithm for very large numbers
                    const quotientParts = [];
                    let currentRemainderDigits = [];

                    let currentDividendIndex = dividendValue.length;
                    while (currentDividendIndex > 0) {
                        currentRemainderDigits.unshift(dividendValue[--currentDividendIndex]);
                        trimLeadingZeros(currentRemainderDigits);

                        if (compareDigitArrays(currentRemainderDigits, divisorValue) < 0) {
                            quotientParts.push(0);
                        } else {
                            let estimatedDigit;
                            if (currentRemainderDigits.length === divisorValue.length) {
                                estimatedDigit = Math.ceil((currentRemainderDigits[currentRemainderDigits.length - 1] * BASE_POWER + (currentRemainderDigits.length > 1 ? currentRemainderDigits[currentRemainderDigits.length - 2] : 0)) / (divisorValue[divisorValue.length - 1] * BASE_POWER + (divisorValue.length > 1 ? divisorValue[divisorValue.length - 2] : 0)));
                            } else {
                                estimatedDigit = Math.ceil((currentRemainderDigits[currentRemainderDigits.length - 1] * BASE_POWER + currentRemainderDigits[currentRemainderDigits.length - 2]) / divisorValue[divisorValue.length - 1]);
                            }


                            let tempProduct;
                            do {
                                if (estimatedDigit <= 0) { // Safety break
                                    estimatedDigit = 0;
                                    break;
                                }
                                tempProduct = multiplyDigitArrayBySmall(divisorValue, estimatedDigit);
                                if (compareDigitArrays(tempProduct, currentRemainderDigits) <= 0) {
                                    break;
                                }
                                estimatedDigit--;
                            } while (true);

                            quotientParts.push(estimatedDigit);
                            currentRemainderDigits = subtractDigitArrays(currentRemainderDigits, tempProduct);
                        }
                    }
                    quotientDigitsArray = digitArrayToNumber(quotientParts.reverse());
                    remainderDigitsArray = digitArrayToNumber(currentRemainderDigits);
                }

                const resultIsNegative = dividendObj.isNegative !== divisorObj.isNegative;
                const remainderSignMatchesDividend = dividendObj.isNegative;

                let finalQuotient;
                if (typeof quotientDigitsArray === "number") {
                    finalQuotient = new SmallBigInt(resultIsNegative ? -quotientDigitsArray : quotientDigitsArray);
                } else {
                    finalQuotient = new LargeBigInt(quotientDigitsArray, resultIsNegative);
                }

                let finalRemainder;
                if (typeof remainderDigitsArray === "number") {
                    finalRemainder = new SmallBigInt(remainderSignMatchesDividend ? -remainderDigitsArray : remainderDigitsArray);
                } else {
                    finalRemainder = new LargeBigInt(remainderDigitsArray, remainderSignMatchesDividend);
                }

                return [finalQuotient, finalRemainder];
            }

            // Miller-Rabin primality test helper
            function millerRabinTest(candidateNum, witnesses) {
                let candidateMinusOne = candidateNum.prev();
                let d = candidateMinusOne;
                let s = 0;

                // Decompose (candidateNum - 1) into d * 2^s
                while (d.isEven()) {
                    d = d.divide(2);
                    s++;
                }

                // Iterate through each witness
                witnessLoop: for (let i = 0; i < witnesses.length; i++) {
                    const currentWitness = BigIntConstructor(witnesses[i]);
                    let x = currentWitness.modPow(d, candidateNum);

                    if (x.isUnit() || x.equals(candidateMinusOne)) {
                        continue witnessLoop; // Witness passes the test
                    }

                    // Check powers of 2 up to s-1
                    for (let r = 0; r < s - 1; r++) {
                        x = x.square().mod(candidateNum);
                        if (x.isUnit()) return false; // Composite
                        if (x.equals(candidateMinusOne)) continue witnessLoop; // Witness passes
                    }
                    return false; // Composite
                }
                return true; // Probably prime
            }

            // --- BigInt Prototype Methods (Arithmetic) ---

            LargeBigInt.prototype.add = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                if (this.isNegative !== otherBigInt.isNegative) {
                    return this.subtract(otherBigInt.negate()); // a + (-b) = a - b
                }
                const thisValue = this.value;
                const otherValue = otherBigInt.value;

                if (otherBigInt.isSmall) {
                    return new LargeBigInt(addSmallDigitToDigitArray(thisValue, Math.abs(otherValue)), this.isNegative);
                }
                // Add two large digit arrays
                return new LargeBigInt(addDigitArrays(thisValue, otherValue), this.isNegative);
            };
            LargeBigInt.prototype.plus = LargeBigInt.prototype.add;

            SmallBigInt.prototype.add = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                const thisValue = this.value;
                if ((thisValue < 0) !== otherBigInt.isNegative) { // Signs are different
                    return this.subtract(otherBigInt.negate());
                }
                const otherValue = otherBigInt.value;
                if (otherBigInt.isSmall) {
                    const sum = thisValue + otherValue;
                    if (isWithinSmallIntRange(sum)) {
                        return new SmallBigInt(sum);
                    }
                    // --- Type III: Directly parse sum if it overflows SmallBigInt range ---
                    return parseIntegerString(String(sum));
                }
                // If other is large, add small to large
                return new LargeBigInt(addSmallDigitToDigitArray(otherValue, Math.abs(thisValue)), thisValue < 0);
            };
            SmallBigInt.prototype.plus = SmallBigInt.prototype.add;

            NativeBigInt.prototype.add = function(other) {
                return new NativeBigInt(this.value + normalizeInputToBigInt(other).value);
            };
            NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

            LargeBigInt.prototype.subtract = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                if (this.isNegative !== otherBigInt.isNegative) {
                    return this.add(otherBigInt.negate()); // a - (-b) = a + b
                }
                const thisValue = this.value;
                const otherValue = otherBigInt.value;

                if (otherBigInt.isSmall) {
                    return subtractSmallDigitFromDigitArray(thisValue, Math.abs(otherValue), this.isNegative);
                }

                // Custom logic for subtracting two large digit arrays with same sign
                let resultDigits;
                let finalNegative = this.isNegative;
                if (compareDigitArrays(thisValue, otherValue) >= 0) {
                    resultDigits = subtractDigitArrays(thisValue, otherValue);
                } else {
                    resultDigits = subtractDigitArrays(otherValue, thisValue);
                    finalNegative = !finalNegative; // Flip sign if (b - a)
                }
                const normalizedResult = digitArrayToNumber(resultDigits);
                if (typeof normalizedResult === "number") {
                    return new SmallBigInt(finalNegative ? -normalizedResult : normalizedResult);
                }
                return new LargeBigInt(normalizedResult, finalNegative);
            };
            LargeBigInt.prototype.minus = LargeBigInt.prototype.subtract;

            SmallBigInt.prototype.subtract = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                const thisValue = this.value;
                if ((thisValue < 0) !== otherBigInt.isNegative) { // Signs are different
                    return this.add(otherBigInt.negate());
                }
                const otherValue = otherBigInt.value;
                if (otherBigInt.isSmall) {
                    return new SmallBigInt(thisValue - otherValue);
                }
                // If other is large, subtract small from large. Sign depends on result.
                return subtractSmallDigitFromDigitArray(otherValue, Math.abs(thisValue), thisValue >= 0);
            };
            SmallBigInt.prototype.minus = SmallBigInt.prototype.subtract;

            NativeBigInt.prototype.subtract = function(other) {
                return new NativeBigInt(this.value - normalizeInputToBigInt(other).value);
            };
            NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

            LargeBigInt.prototype.negate = function() {
                return new LargeBigInt(this.value, !this.isNegative);
            };
            SmallBigInt.prototype.negate = function() {
                // Return a new instance with negated value and flipped sign
                return new SmallBigInt(-this.value);
            };
            NativeBigInt.prototype.negate = function() {
                return new NativeBigInt(-this.value);
            };

            LargeBigInt.prototype.abs = function() {
                return new LargeBigInt(this.value, false);
            };
            SmallBigInt.prototype.abs = function() {
                return new SmallBigInt(Math.abs(this.value));
            };
            NativeBigInt.prototype.abs = function() {
                return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
            };

            LargeBigInt.prototype.multiply = function(other) {
                let otherBigInt = normalizeInputToBigInt(other);
                const thisValue = this.value;
                const otherValue = otherBigInt.value;
                const resultIsNegative = this.isNegative !== otherBigInt.isNegative;

                if (otherBigInt.isSmall) {
                    if (otherValue === 0) return BigIntConstructor[0];
                    if (otherValue === 1) return this;
                    if (otherValue === -1) return this.negate();

                    const absOtherValue = Math.abs(otherValue);
                    if (absOtherValue < BASE_POWER) {
                        return new LargeBigInt(multiplyDigitArrayBySmall(thisValue, absOtherValue), resultIsNegative);
                    }
                    // If small value is large enough, convert to LargeBigInt for multiplication
                    otherBigInt = parseIntegerString(String(absOtherValue));
                }

                const len1 = thisValue.length;
                const len2 = otherBigInt.value.length;

                // Karatsuba multiplication heuristic (based on original code's threshold)
                const karatsubaThreshold = 30; // Number of digits
                const shouldApplyKaratsuba = len1 + len2 > 0 && (-0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0);

                if (shouldApplyKaratsuba) {
                    // Recursive Karatsuba multiplication for very large numbers
                    const karatsubaMultiply = (digits1, digits2) => {
                        const maxLength = Math.max(digits1.length, digits2.length);
                        if (maxLength <= karatsubaThreshold) {
                            return multiplyDigitArrays(digits1, digits2);
                        }

                        const halfLength = Math.ceil(maxLength / 2);
                        const high1 = digits1.slice(halfLength);
                        const low1 = digits1.slice(0, halfLength);
                        const high2 = digits2.slice(halfLength);
                        const low2 = digits2.slice(0, halfLength);

                        const z0 = karatsubaMultiply(low1, low2);
                        const z1 = karatsubaMultiply(addDigitArrays(low1, high1), addDigitArrays(low2, high2));
                        const z2 = karatsubaMultiply(high1, high2);

                        const term1 = z2;
                        const term2 = subtractDigitArrays(subtractDigitArrays(z1, z0), z2); // z1 - z0 - z2
                        const term3 = z0;

                        // result = z2 * (BASE_POWER^(2*halfLength)) + (z1 - z0 - z2) * (BASE_POWER^halfLength) + z0
                        let finalResult = addDigitArrays(addDigitArrays(term3, padWithZeros(term2, halfLength)), padWithZeros(term1, 2 * halfLength));
                        trimLeadingZeros(finalResult);
                        return finalResult;
                    };
                    return new LargeBigInt(karatsubaMultiply(thisValue, otherBigInt.value), resultIsNegative);
                }
                // Standard long multiplication for smaller or non-Karatsuba-beneficial sizes
                return new LargeBigInt(multiplyDigitArrays(thisValue, otherBigInt.value), resultIsNegative);
            };
            LargeBigInt.prototype.times = LargeBigInt.prototype.multiply;

            SmallBigInt.prototype._multiplyBySmall = function(otherSmall) {
                const product = otherSmall.value * this.value;
                if (isWithinSmallIntRange(product)) {
                    return new SmallBigInt(product);
                }
                // If product overflows small int, convert to LargeBigInt representation
                return new LargeBigInt(
                    multiplyDigitArrays(numberToDigitArray(Math.abs(this.value)), numberToDigitArray(Math.abs(otherSmall.value))),
                    this.isNegative !== otherSmall.isNegative
                );
            };

            LargeBigInt.prototype._multiplyBySmall = function(otherSmall) {
                if (otherSmall.value === 0) return BigIntConstructor[0];
                if (otherSmall.value === 1) return this;
                if (otherSmall.value === -1) return this.negate();
                return new LargeBigInt(multiplyDigitArrayBySmall(this.value, Math.abs(otherSmall.value)), this.isNegative !== otherSmall.isNegative);
            };

            SmallBigInt.prototype.multiply = function(other) {
                return normalizeInputToBigInt(other)._multiplyBySmall(this);
            };
            SmallBigInt.prototype.times = SmallBigInt.prototype.multiply;

            NativeBigInt.prototype.multiply = function(other) {
                return new NativeBigInt(this.value * normalizeInputToBigInt(other).value);
            };
            NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

            LargeBigInt.prototype.square = function() {
                return new LargeBigInt(squareDigitArray(this.value), false);
            };
            SmallBigInt.prototype.square = function() {
                const squaredValue = this.value * this.value;
                if (isWithinSmallIntRange(squaredValue)) {
                    return new SmallBigInt(squaredValue);
                }
                return new LargeBigInt(squareDigitArray(numberToDigitArray(Math.abs(this.value))), false);
            };
            NativeBigInt.prototype.square = function() {
                return new NativeBigInt(this.value * this.value);
            };

            LargeBigInt.prototype.divmod = function(divisor) {
                return performDivision(this, divisor);
            };
            NativeBigInt.prototype.divmod = SmallBigInt.prototype.divmod = LargeBigInt.prototype.divmod;

            LargeBigInt.prototype.divide = function(divisor) {
                return performDivision(this, divisor)[0];
            };
            NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(divisor) {
                return new NativeBigInt(this.value / normalizeInputToBigInt(divisor).value);
            };
            SmallBigInt.prototype.over = SmallBigInt.prototype.divide = LargeBigInt.prototype.over = LargeBigInt.prototype.divide;

            LargeBigInt.prototype.mod = function(divisor) {
                return performDivision(this, divisor)[1];
            };
            NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(divisor) {
                return new NativeBigInt(this.value % normalizeInputToBigInt(divisor).value);
            };
            SmallBigInt.prototype.remainder = SmallBigInt.prototype.mod = LargeBigInt.prototype.remainder = LargeBigInt.prototype.mod;

            LargeBigInt.prototype.pow = function(exponent) {
                const exponentBigInt = normalizeInputToBigInt(exponent);

                // --- Guard: Negative exponent ---
                if (exponentBigInt.isNegative()) {
                    // For integer exponentiation, positive base with negative exponent results in 0.
                    // e.g., 2^(-2) = 0.25, truncated to 0.
                    return BigIntConstructor[0];
                }

                if (exponentBigInt.isZero()) return BigIntConstructor[1];
                if (this.isZero()) return BigIntConstructor[0];
                if (this.isUnit()) return BigIntConstructor[1]; // 1^x = 1, (-1)^even = 1
                if (this.equals(BigIntConstructor[-1])) return exponentBigInt.isEven() ? BigIntConstructor[1] : BigIntConstructor[-1]; // (-1)^odd = -1

                if (!exponentBigInt.isSmall) {
                    throw new Error(`Exponent ${exponentBigInt.toString()} is too large.`);
                }

                // Optimization for small base and exponent
                if (this.isSmall && isWithinSmallIntRange(Math.pow(this.value, exponentBigInt.value))) {
                    return new SmallBigInt(truncateToInteger(Math.pow(this.value, exponentBigInt.value)));
                }

                let result = BigIntConstructor[1];
                let currentBase = this; // Use the BigInt object itself
                let exp = exponentBigInt.value;

                // Binary exponentiation (exponentiation by squaring)
                while (exp > 0) {
                    if (exp % 2 === 1) { // If exponent is odd
                        result = result.times(currentBase);
                    }
                    currentBase = currentBase.square();
                    exp = Math.floor(exp / 2);
                }
                return result;
            };
            SmallBigInt.prototype.pow = LargeBigInt.prototype.pow;

            NativeBigInt.prototype.pow = function(exponent) {
                const exponentBigInt = normalizeInputToBigInt(exponent);
                const baseVal = this.value;
                const expVal = exponentBigInt.value;

                const NATIVE_ZERO = BigInt(0);
                const NATIVE_ONE = BigInt(1);
                const NATIVE_TWO = BigInt(2);

                if (expVal === NATIVE_ZERO) return BigIntConstructor[1];
                if (baseVal === NATIVE_ZERO) return BigIntConstructor[0];
                if (baseVal === NATIVE_ONE) return BigIntConstructor[1];
                if (baseVal === BigInt(-1)) return exponentBigInt.isEven() ? BigIntConstructor[1] : BigIntConstructor[-1];

                if (exponentBigInt.isNegative()) return new NativeBigInt(NATIVE_ZERO);

                let currentResult = BigIntConstructor[1];
                let currentPower = this;

                let currentExp = expVal;
                while (currentExp > NATIVE_ZERO) {
                    if ((currentExp & NATIVE_ONE) === NATIVE_ONE) {
                        currentResult = currentResult.times(currentPower);
                    }
                    currentPower = currentPower.square();
                    currentExp /= NATIVE_TWO;
                }
                return currentResult;
            };

            LargeBigInt.prototype.modPow = function(exponent, modulus) {
                const exp = normalizeInputToBigInt(exponent);
                const mod = normalizeInputToBigInt(modulus);

                if (mod.isZero()) {
                    throw new Error("Modular exponentiation with modulus 0 is undefined.");
                }

                // --- Guard: Negative exponent ---
                if (exp.isNegative()) {
                    throw new Error("Modular exponentiation with negative exponent is not supported.");
                }

                let result = BigIntConstructor[1];
                let currentBase = this.mod(mod); // Base reduced modulo modulus

                // Binary exponentiation (exponentiation by squaring)
                let tempExp = exp;
                while (tempExp.isPositive()) {
                    if (currentBase.isZero()) return BigIntConstructor[0]; // Optimization
                    if (tempExp.isOdd()) {
                        result = result.multiply(currentBase).mod(mod);
                    }
                    currentBase = currentBase.square().mod(mod);
                    tempExp = tempExp.divide(2);
                }
                return result;
            };
            NativeBigInt.prototype.modPow = SmallBigInt.prototype.modPow = LargeBigInt.prototype.modPow;

            // --- BigInt Prototype Methods (Comparisons) ---

            LargeBigInt.prototype.compareAbs = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                return otherBigInt.isSmall ? 1 : compareDigitArrays(this.value, otherBigInt.value);
            };
            SmallBigInt.prototype.compareAbs = function(other) {
                const otherBigInt = normalizeInputToBigInt(other);
                const thisAbsValue = Math.abs(this.value);
                const otherValue = otherBigInt.value;
                if (otherBigInt.isSmall) {
                    const otherAbsValue = Math.abs(otherValue);
                    return thisAbsValue === otherAbsValue ? 0 : thisAbsValue > otherAbsValue ? 1 : -1;
                }
                return -1; // Small number is always "less" in absolute value than a large number
            };
            NativeBigInt.prototype.compareAbs = function(other) {
                const thisAbsValue = this.value >= 0 ? this.value : -this.value;
                const otherAbsValue = normalizeInputToBigInt(other).value;
                return thisAbsValue === otherAbsValue ? 0 : thisAbsValue > otherAbsValue ? 1 : -1;
            };

            LargeBigInt.prototype.compare = function(other) {
                // --- Guard clauses for special number values ---
                if (other === Infinity) return -1;
                if (other === -Infinity) return 1;

                const otherBigInt = normalizeInputToBigInt(other);

                if (this.isNegative !== otherBigInt.isNegative) {
                    return otherBigInt.isNegative ? 1 : -1; // If signs differ, negative is smaller
                }
                if (otherBigInt.isSmall) {
                    // If other is small, and signs are same, a large number is generally "larger"
                    return this.isNegative ? -1 : 1;
                }
                // Compare digit arrays, then apply sign
                return compareDigitArrays(this.value, otherBigInt.value) * (this.isNegative ? -1 : 1);
            };
            LargeBigInt.prototype.compareTo = LargeBigInt.prototype.compare;

            SmallBigInt.prototype.compare = function(other) {
                if (other === Infinity) return -1;
                if (other === -Infinity) return 1;

                const otherBigInt = normalizeInputToBigInt(other);
                if (otherBigInt.isSmall) {
                    return this.value === otherBigInt.value ? 0 : this.value > otherBigInt.value ? 1 : -1;
                }
                // If other is large, and signs are same, large is larger
                return (this.value < 0) !== otherBigInt.isNegative ? (this.value < 0 ? -1 : 1) : (this.value < 0 ? 1 : -1);
            };
            SmallBigInt.prototype.compareTo = SmallBigInt.prototype.compare;

            NativeBigInt.prototype.compare = function(other) {
                if (other === Infinity) return -1;
                if (other === -Infinity) return 1;

                const otherValue = normalizeInputToBigInt(other).value;
                return this.value === otherValue ? 0 : this.value > otherValue ? 1 : -1;
            };
            NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

            LargeBigInt.prototype.equals = function(other) {
                return this.compare(other) === 0;
            };
            NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallBigInt.prototype.eq = SmallBigInt.prototype.equals = LargeBigInt.prototype.eq = LargeBigInt.prototype.equals;

            LargeBigInt.prototype.notEquals = function(other) {
                return this.compare(other) !== 0;
            };
            NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallBigInt.prototype.neq = SmallBigInt.prototype.notEquals = LargeBigInt.prototype.neq = LargeBigInt.prototype.notEquals;

            LargeBigInt.prototype.greater = function(other) {
                return this.compare(other) > 0;
            };
            NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallBigInt.prototype.gt = SmallBigInt.prototype.greater = LargeBigInt.prototype.gt = LargeBigInt.prototype.greater;

            LargeBigInt.prototype.lesser = function(other) {
                return this.compare(other) < 0;
            };
            NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallBigInt.prototype.lt = SmallBigInt.prototype.lesser = LargeBigInt.prototype.lt = LargeBigInt.prototype.lesser;

            LargeBigInt.prototype.greaterOrEquals = function(other) {
                return this.compare(other) >= 0;
            };
            NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallBigInt.prototype.geq = SmallBigInt.prototype.greaterOrEquals = LargeBigInt.prototype.geq = LargeBigInt.prototype.greaterOrEquals;

            LargeBigInt.prototype.lesserOrEquals = function(other) {
                return this.compare(other) <= 0;
            };
            NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallBigInt.prototype.leq = SmallBigInt.prototype.lesserOrEquals = LargeBigInt.prototype.leq = LargeBigInt.prototype.lesserOrEquals;

            // --- BigInt Prototype Methods (Properties) ---

            LargeBigInt.prototype.isEven = function() {
                return (this.value[0] & 1) === 0;
            };
            SmallBigInt.prototype.isEven = function() {
                return (this.value & 1) === 0;
            };
            NativeBigInt.prototype.isEven = function() {
                return (this.value & BigInt(1)) === BigInt(0);
            };

            LargeBigInt.prototype.isOdd = function() {
                return (this.value[0] & 1) === 1;
            };
            SmallBigInt.prototype.isOdd = function() {
                return (this.value & 1) === 1;
            };
            NativeBigInt.prototype.isOdd = function() {
                return (this.value & BigInt(1)) === BigInt(1);
            };

            LargeBigInt.prototype.isPositive = function() {
                return !this.isNegative;
            };
            SmallBigInt.prototype.isPositive = function() {
                return this.value > 0;
            };
            NativeBigInt.prototype.isPositive = SmallBigInt.prototype.isPositive;

            LargeBigInt.prototype.isNegative = function() {
                return this.isNegative;
            };
            SmallBigInt.prototype.isNegative = function() {
                return this.value < 0;
            };
            NativeBigInt.prototype.isNegative = SmallBigInt.prototype.isNegative;

            LargeBigInt.prototype.isUnit = function() {
                return false; // A large BigInt is never 1 or -1 without explicit check
            };
            SmallBigInt.prototype.isUnit = function() {
                return Math.abs(this.value) === 1;
            };
            NativeBigInt.prototype.isUnit = function() {
                return this.abs().value === BigInt(1);
            };

            LargeBigInt.prototype.isZero = function() {
                return false; // A large BigInt needs trimming to be zero, then check
            };
            SmallBigInt.prototype.isZero = function() {
                return this.value === 0;
            };
            NativeBigInt.prototype.isZero = function() {
                return this.value === BigInt(0);
            };

            LargeBigInt.prototype.isDivisibleBy = function(divisor) {
                const divisorBigInt = normalizeInputToBigInt(divisor);
                // --- Guard: Divisor is zero ---
                if (divisorBigInt.isZero()) return false;
                if (divisorBigInt.isUnit()) return true;
                if (divisorBigInt.compareAbs(2) === 0) { // Check for 2
                    return this.isEven();
                }
                return this.mod(divisorBigInt).isZero();
            };
            NativeBigInt.prototype.isDivisibleBy = SmallBigInt.prototype.isDivisibleBy = LargeBigInt.prototype.isDivisibleBy;

            // Checks if a number is a "small" prime (2, 3, 5) or passes basic checks
            function checkSmallPrimes(num) {
                const absNum = num.abs();
                return !absNum.isUnit() && (absNum.equals(2) || absNum.equals(3) || absNum.equals(5) ||
                    !(absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) && absNum.lesser(49));
            }

            LargeBigInt.prototype.isPrime = function(options) {
                const smallPrimeCheckResult = checkSmallPrimes(this);
                if (smallPrimeCheckResult !== undefined) return smallPrimeCheckResult;

                const absoluteThis = this.abs();
                const bitLength = absoluteThis.bitLength();
                if (bitLength.toJSNumber() <= 64) {
                    // For numbers that fit in 64-bit, use fixed witnesses
                    return millerRabinTest(absoluteThis, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
                }

                // For larger numbers, use a number of iterations based on bit length
                // If `options` is true, use a more stringent (2 * log^2) test
                const numIterations = options === true ? 2 * Math.pow(Math.log(2) * bitLength.toJSNumber(), 2) : Math.log(2) * bitLength.toJSNumber();
                const witnesses = [];
                for (let i = 0; i < Math.ceil(numIterations); i++) {
                    witnesses.push(BigIntConstructor(i + 2));
                }
                return millerRabinTest(absoluteThis, witnesses);
            };
            NativeBigInt.prototype.isPrime = SmallBigInt.prototype.isPrime = LargeBigInt.prototype.isPrime;

            LargeBigInt.prototype.isProbablePrime = function(iterations) {
                const smallPrimeCheckResult = checkSmallPrimes(this);
                if (smallPrimeCheckResult !== undefined) return smallPrimeCheckResult;

                const absoluteThis = this.abs();
                const numIterations = iterations === undefined ? 5 : iterations;
                const witnesses = [];
                for (let i = 0; i < numIterations; i++) {
                    witnesses.push(BigIntConstructor.randomBetween(2, absoluteThis.minus(2)));
                }
                return millerRabinTest(absoluteThis, witnesses);
            };
            NativeBigInt.prototype.isProbablePrime = SmallBigInt.prototype.isProbablePrime = LargeBigInt.prototype.isProbablePrime;

            LargeBigInt.prototype.modInv = function(modulus) {
                let zero = BigIntConstructor.zero;
                let one = BigIntConstructor.one;
                let m = normalizeInputToBigInt(modulus);
                let a = this.abs(); // Use absolute value for extended Euclidean algorithm

                let t = zero,
                    newT = one;
                let r = m,
                    newR = a;

                // Extended Euclidean Algorithm
                while (!newR.isZero()) {
                    const quotient = r.divide(newR);
                    let tempT = t;
                    t = newT;
                    newT = tempT.subtract(quotient.multiply(newT));

                    let tempR = r;
                    r = newR;
                    newR = tempR.subtract(quotient.multiply(newR));
                }

                // If GCD is not 1, modular inverse does not exist
                if (!r.isUnit()) {
                    throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime. No modular inverse exists.`);
                }

                // Adjust result to be positive
                if (t.compare(0) < 0) {
                    t = t.add(modulus);
                }

                return this.isNegative() ? t.negate() : t;
            };
            NativeBigInt.prototype.modInv = SmallBigInt.prototype.modInv = LargeBigInt.prototype.modInv;

            LargeBigInt.prototype.next = function() {
                return this.isNegative ? subtractSmallDigitFromDigitArray(this.value, 1, this.isNegative) : new LargeBigInt(addSmallDigitToDigitArray(this.value, 1), this.isNegative);
            };
            SmallBigInt.prototype.next = function() {
                const nextValue = this.value + 1;
                if (nextValue < MAX_JS_SAFE_INTEGER) {
                    return new SmallBigInt(nextValue);
                }
                return new LargeBigInt(MAX_SMALL_INT_DIGITS, false);
            };
            NativeBigInt.prototype.next = function() {
                return new NativeBigInt(this.value + BigInt(1));
            };

            LargeBigInt.prototype.prev = function() {
                return this.isNegative ? new LargeBigInt(addSmallDigitToDigitArray(this.value, 1), true) : subtractSmallDigitFromDigitArray(this.value, 1, this.isNegative);
            };
            SmallBigInt.prototype.prev = function() {
                const prevValue = this.value - 1;
                if (prevValue > -MAX_JS_SAFE_INTEGER) {
                    return new SmallBigInt(prevValue);
                }
                return new LargeBigInt(MAX_SMALL_INT_DIGITS, true);
            };
            NativeBigInt.prototype.prev = function() {
                return new NativeBigInt(this.value - BigInt(1));
            };

            // --- Bitwise Operations Helpers ---

            const POWER_OF_BASE_LOOKUP = [1];
            while (2 * POWER_OF_BASE_LOOKUP[POWER_OF_BASE_LOOKUP.length - 1] <= BASE_POWER) {
                POWER_OF_BASE_LOOKUP.push(2 * POWER_OF_BASE_LOOKUP[POWER_OF_BASE_LOOKUP.length - 1]);
            }
            const LOOKUP_TABLE_LENGTH = POWER_OF_BASE_LOOKUP.length;
            const MAX_LOOKUP_POWER = POWER_OF_BASE_LOOKUP[LOOKUP_TABLE_LENGTH - 1];

            function isSmallEnoughForShift(num) {
                return Math.abs(num) <= BASE_POWER;
            }

            // Pads a digit array with zeros at the beginning (less significant side)
            function padWithZeros(digitArray, numZeros) {
                const zeros = createZeroFilledArray(numZeros);
                return zeros.concat(digitArray);
            }

            // Generic bitwise operation function
            function performBitwiseOperation(operand1, operand2, operationFn) {
                let op1 = normalizeInputToBigInt(operand1);
                let op2 = normalizeInputToBigInt(operand2);

                const isOp1Negative = op1.isNegative();
                const isOp2Negative = op2.isNegative();

                // Convert negative numbers to two's complement for bitwise ops
                // For simplicity, we'll use a `not` then `negate` or similar approach as the library's `not` implicitly handles it.
                op1 = isOp1Negative ? op1.negate().prev() : op1; // This is equivalent to `~x` for positive x
                op2 = isOp2Negative ? op2.negate().prev() : op2;

                const resultDigits = [];
                let currentOp1 = op1;
                let currentOp2 = op2;

                // Process digits in chunks of MAX_LOOKUP_POWER
                while (!currentOp1.isZero() || !currentOp2.isZero()) {
                    const [op1Div, op1Rem] = performDivision(currentOp1, MAX_LOOKUP_POWER);
                    const [op2Div, op2Rem] = performDivision(currentOp2, MAX_LOOKUP_POWER);

                    let val1 = op1Rem.toJSNumber();
                    let val2 = op2Rem.toJSNumber();

                    // Adjust for two's complement if original was negative (this logic is complex and relies on how `not` works)
                    // The original code implies that the `j` function's `o(a,s)` handles the sign.
                    // The `o(n?1:0,i?1:0)` determines the final sign bit based on the operation.
                    // This is a subtle part of the bitwise implementation; I'll preserve the original logic of `j`.
                    if (isOp1Negative) val1 = MAX_LOOKUP_POWER - 1 - val1;
                    if (isOp2Negative) val2 = MAX_LOOKUP_POWER - 1 - val2;

                    resultDigits.push(operationFn(val1, val2));

                    currentOp1 = op1Div;
                    currentOp2 = op2Div;
                }

                // Reconstruct the BigInt result
                let finalResult = BigIntConstructor[0];
                const initialSignResult = operationFn(isOp1Negative ? 1 : 0, isOp2Negative ? 1 : 0);

                for (let i = resultDigits.length - 1; i >= 0; i--) {
                    finalResult = finalResult.multiply(MAX_LOOKUP_POWER).add(BigIntConstructor(resultDigits[i]));
                }

                // Apply negation if necessary based on the sign bit of the operation
                return initialSignResult !== 0 ? finalResult.negate().prev() : finalResult;
            }

            // --- Bitwise Operators ---

            LargeBigInt.prototype.shiftLeft = function(shiftAmount) {
                const shift = normalizeInputToBigInt(shiftAmount).toJSNumber();
                if (!isSmallEnoughForShift(shift)) {
                    throw new Error(`Shift amount ${shift} is too large for shifting.`);
                }
                if (shift < 0) {
                    return this.shiftRight(-shift);
                }
                if (this.isZero()) return this;

                let result = this;
                // Shift by large chunks using multiplication
                while (shift >= LOOKUP_TABLE_LENGTH) {
                    result = result.multiply(MAX_LOOKUP_POWER);
                    shift -= (LOOKUP_TABLE_LENGTH - 1); // Adjust for the power of 2
                }
                return result.multiply(POWER_OF_BASE_LOOKUP[shift]);
            };
            NativeBigInt.prototype.shiftLeft = SmallBigInt.prototype.shiftLeft = LargeBigInt.prototype.shiftLeft;

            LargeBigInt.prototype.shiftRight = function(shiftAmount) {
                let shift = normalizeInputToBigInt(shiftAmount).toJSNumber();
                if (!isSmallEnoughForShift(shift)) {
                    throw new Error(`Shift amount ${shift} is too large for shifting.`);
                }
                if (shift < 0) {
                    return this.shiftLeft(-shift);
                }

                let result = this;
                while (shift >= LOOKUP_TABLE_LENGTH) {
                    // Optimized return for -1 >> X or 0 >> X
                    if (result.isZero() || (result.isNegative() && result.isUnit())) {
                        return result;
                    }
                    const [quotient, remainder] = performDivision(result, MAX_LOOKUP_POWER);
                    result = remainder.isNegative() ? quotient.prev() : quotient;
                    shift -= (LOOKUP_TABLE_LENGTH - 1);
                }

                const [finalQuotient, finalRemainder] = performDivision(result, POWER_OF_BASE_LOOKUP[shift]);
                return finalRemainder.isNegative() ? finalQuotient.prev() : finalQuotient;
            };
            NativeBigInt.prototype.shiftRight = SmallBigInt.prototype.shiftRight = LargeBigInt.prototype.shiftRight;

            LargeBigInt.prototype.not = function() {
                return this.negate().prev();
            };
            NativeBigInt.prototype.not = SmallBigInt.prototype.not = LargeBigInt.prototype.not;

            LargeBigInt.prototype.and = function(other) {
                return performBitwiseOperation(this, other, (d1, d2) => d1 & d2);
            };
            NativeBigInt.prototype.and = SmallBigInt.prototype.and = LargeBigInt.prototype.and;

            LargeBigInt.prototype.or = function(other) {
                return performBitwiseOperation(this, other, (d1, d2) => d1 | d2);
            };
            NativeBigInt.prototype.or = SmallBigInt.prototype.or = LargeBigInt.prototype.or;

            LargeBigInt.prototype.xor = function(other) {
                return performBitwiseOperation(this, other, (d1, d2) => d1 ^ d2);
            };
            NativeBigInt.prototype.xor = SmallBigInt.prototype.xor = LargeBigInt.prototype.xor;

            // --- Other Utility Methods ---

            const BIT_MASK_30 = 1 << 30;
            const EXTENDED_BIT_MASK = (BASE_POWER & -BASE_POWER) * (BASE_POWER & -BASE_POWER) | BIT_MASK_30;

            function extractLowestSetBit(numBigInt) {
                const value = numBigInt.value;
                let lowestBit;
                if (typeof value === "number") {
                    lowestBit = value | BIT_MASK_30;
                } else if (typeof value === "bigint") {
                    lowestBit = value | BigInt(BIT_MASK_30);
                } else { // Array of digits
                    lowestBit = value[0] + value[1] * BASE_POWER | EXTENDED_BIT_MASK;
                }
                return lowestBit & -lowestBit; // Isolate lowest set bit using two's complement trick
            }

            function maximumBigInt(num1, num2) {
                num1 = normalizeInputToBigInt(num1);
                num2 = normalizeInputToBigInt(num2);
                return num1.greater(num2) ? num1 : num2;
            }

            function minimumBigInt(num1, num2) {
                num1 = normalizeInputToBigInt(num1);
                num2 = normalizeInputToBigInt(num2);
                return num1.lesser(num2) ? num1 : num2;
            }

            function greatestCommonDivisor(num1, num2) {
                let a = normalizeInputToBigInt(num1).abs();
                let b = normalizeInputToBigInt(num2).abs();

                if (a.equals(b)) return a;
                if (a.isZero()) return b;
                if (b.isZero()) return a;

                let commonFactor = BigIntConstructor[1];

                // Extract common factors of 2 (binary GCD optimization)
                while (a.isEven() && b.isEven()) {
                    const lowestBitA = extractLowestSetBit(a);
                    const lowestBitB = extractLowestSetBit(b);
                    const r = minimumBigInt(lowestBitA, lowestBitB);
                    a = a.divide(r);
                    b = b.divide(r);
                    commonFactor = commonFactor.multiply(r);
                }

                // Remove factors of 2 from 'a' if 'a' is even
                while (a.isEven()) {
                    a = a.divide(extractLowestSetBit(a));
                }

                // Main Euclidean algorithm loop (binary GCD variant)
                do {
                    while (b.isEven()) {
                        b = b.divide(extractLowestSetBit(b));
                    }
                    if (a.greater(b)) {
                        let temp = b;
                        b = a;
                        a = temp;
                    }
                    b = b.subtract(a);
                } while (!b.isZero());

                return commonFactor.isUnit() ? a : a.multiply(commonFactor);
            }

            LargeBigInt.prototype.bitLength = function() {
                let currentBigInt = this;
                // For negative numbers, bit length is usually defined for abs(x) - 1
                if (currentBigInt.compareTo(BigIntConstructor(0)) < 0) {
                    currentBigInt = currentBigInt.negate().subtract(BigIntConstructor(1));
                }
                if (currentBigInt.compareTo(BigIntConstructor(0)) === 0) {
                    return BigIntConstructor(0);
                }

                // Helper for bitLength calculation (log base 2)
                function calculateLogBase2(num, powerOfTwo) {
                    if (powerOfTwo.compareTo(num) <= 0) {
                        const result = calculateLogBase2(num, powerOfTwo.square());
                        const p = result.p;
                        const e = result.e;
                        const product = p.multiply(powerOfTwo);
                        return product.compareTo(num) <= 0 ? {
                            p: product,
                            e: 2 * e + 1
                        } : {
                            p: p,
                            e: 2 * e
                        };
                    }
                    return {
                        p: BigIntConstructor(1),
                        e: 0
                    };
                }
                return BigIntConstructor(calculateLogBase2(currentBigInt, BigIntConstructor(2)).e).add(BigIntConstructor(1));
            };
            NativeBigInt.prototype.bitLength = SmallBigInt.prototype.bitLength = LargeBigInt.prototype.bitLength;

            // Parses a string in a given base
            const parseBaseString = (inputStr, base, radixAlphabet, strictParsing) => {
                radixAlphabet = radixAlphabet || DEFAULT_RADIX_ALPHABET;
                inputStr = String(inputStr);
                if (!strictParsing) {
                    inputStr = inputStr.toLowerCase();
                    radixAlphabet = radixAlphabet.toLowerCase();
                }

                const strLen = inputStr.length;
                const absoluteBase = Math.abs(base);
                const digitValueMap = {};
                for (let i = 0; i < radixAlphabet.length; i++) {
                    digitValueMap[radixAlphabet[i]] = i;
                }

                const parsedDigits = [];
                const isNegative = inputStr[0] === "-";
                for (let i = isNegative ? 1 : 0; i < strLen; i++) {
                    const char = inputStr[i];
                    if (char === "-" && i > 0) {
                        throw new Error(`Invalid character '-' at position ${i} in base ${base} string: ${inputStr}`);
                    }
                    if (char in digitValueMap) {
                        const digitVal = digitValueMap[char];
                        if (digitVal >= absoluteBase) {
                            // Special case for base 1: only '1' is valid, and value is its count
                            if (absoluteBase === 1 && char === "1") continue;
                            throw new Error(`Digit '${char}' has value ${digitVal} which is not valid in base ${base} (max digit value is ${absoluteBase - 1}).`);
                        }
                        parsedDigits.push(normalizeInputToBigInt(digitVal));
                    } else {
                        // Handle custom characters like <123> for digits > 35
                        if (char === "<") {
                            let endIdx = i;
                            while (inputStr[endIdx] !== ">" && endIdx < strLen) {
                                endIdx++;
                            }
                            if (endIdx === strLen) {
                                throw new Error(`Unclosed custom digit segment starting at position ${i}: ${inputStr}`);
                            }
                            const customDigitVal = parseInt(inputStr.slice(i + 1, endIdx), 10);
                            if (isNaN(customDigitVal) || customDigitVal >= absoluteBase) {
                                throw new Error(`Invalid custom digit value '${inputStr.slice(i + 1, endIdx)}' in base ${base}.`);
                            }
                            parsedDigits.push(normalizeInputToBigInt(customDigitVal));
                            i = endIdx;
                        } else {
                            throw new Error(`Character '${char}' is not a valid digit in base ${base} with alphabet '${radixAlphabet}'.`);
                        }
                    }
                }
                return convertDigitArrayToBase10(parsedDigits, normalizeInputToBigInt(base), isNegative);
            };

            // Converts an array of digits (in a given base) to a base 10 BigInt
            function convertDigitArrayToBase10(digitBigInts, baseBigInt, isNegative) {
                let result = BigIntConstructor[0];
                let currentPower = BigIntConstructor[1];
                for (let i = digitBigInts.length - 1; i >= 0; i--) {
                    result = result.add(digitBigInts[i].times(currentPower));
                    currentPower = currentPower.times(baseBigInt);
                }
                return isNegative ? result.negate() : result;
            }

            // Converts a BigInt to its representation in a given base (array of digits)
            function convertToBaseRepresentation(bigIntObj, base) {
                const baseBigInt = BigIntConstructor(base);

                // --- Guard: Base is zero ---
                if (baseBigInt.isZero()) {
                    if (bigIntObj.isZero()) {
                        return {
                            value: [0],
                            isNegative: false
                        };
                    }
                    throw new Error("Cannot convert non-zero numbers to base 0.");
                }

                // --- Guard: Base is 1 ---
                if (baseBigInt.equals(1)) {
                    if (bigIntObj.isZero()) return { value: [0], isNegative: false };
                    if (bigIntObj.isNegative()) throw new Error("Cannot represent negative numbers in base 1.");
                    const numOnes = bigIntObj.toJSNumber();
                    if (isNaN(numOnes) || !Number.isInteger(numOnes) || numOnes < 0) {
                        throw new Error(`Invalid number for base 1 conversion: ${bigIntObj.toString()}`);
                    }
                    return { value: Array(numOnes).fill(1), isNegative: false };
                }
                // --- Guard: Base is -1 ---
                if (baseBigInt.equals(-1)) {
                    if (bigIntObj.isZero()) return { value: [0], isNegative: false };
                    let currentValue = bigIntObj;
                    let digits = [];
                    while (!currentValue.isZero()) {
                        let remainder = currentValue.mod(-1);
                        currentValue = currentValue.divide(-1);

                        if (remainder.isNegative()) {
                            remainder = remainder.abs(); // Remainder becomes 1
                            currentValue = currentValue.next(); // Quotient + 1
                        }
                        digits.push(remainder.toJSNumber());
                    }
                    return { value: digits.reverse(), isNegative: false };
                }

                let isResultNegative = false;
                let currentNumber = bigIntObj;

                // Handle negative numbers for positive bases
                if (bigIntObj.isNegative() && baseBigInt.isPositive()) {
                    isResultNegative = true;
                    currentNumber = bigIntObj.abs();
                }

                const digitList = [];
                while (currentNumber.isNegative() || currentNumber.compareAbs(baseBigInt) >= 0) {
                    const {
                        quotient,
                        remainder
                    } = currentNumber.divmod(baseBigInt);
                    currentNumber = quotient;
                    let currentRemainder = remainder;

                    if (currentRemainder.isNegative()) {
                        currentRemainder = baseBigInt.minus(currentRemainder).abs();
                        currentNumber = currentNumber.next();
                    }
                    digitList.push(currentRemainder.toJSNumber());
                }
                digitList.push(currentNumber.toJSNumber()); // Push the final quotient
                return {
                    value: digitList.reverse(),
                    isNegative: isResultNegative
                };
            }

            // Formats a BigInt to a string in a given base with a custom alphabet
            function formatToBaseString(bigIntObj, base, radixAlphabet) {
                const conversionResult = convertToBaseRepresentation(bigIntObj, base);
                const signPrefix = conversionResult.isNegative ? "-" : "";
                return signPrefix + conversionResult.value.map(digit => {
                    radixAlphabet = radixAlphabet || DEFAULT_RADIX_ALPHABET;
                    return (digit < radixAlphabet.length) ? radixAlphabet[digit] : `<${digit}>`;
                }).join("");
            }

            // Parses an integer string, handling scientific notation
            function parseIntegerString(numString) {
                // --- Guard: Empty or invalid string input ---
                if (typeof numString !== 'string' || numString.trim() === '') {
                    throw new Error("Invalid integer string: cannot be empty or non-string.");
                }
                numString = numString.trim();

                let isNegative = numString[0] === "-";
                if (isNegative) {
                    numString = numString.slice(1);
                }

                const scientificNotationParts = numString.split(/e/i);
                if (scientificNotationParts.length > 2) {
                    throw new Error("Invalid integer format: multiple 'e' characters in scientific notation.");
                }

                if (scientificNotationParts.length === 2) {
                    let exponentStr = scientificNotationParts[1];
                    if (exponentStr[0] === "+") {
                        exponentStr = exponentStr.slice(1);
                    }
                    const exponentVal = +exponentStr;

                    if (!Number.isInteger(exponentVal) || !isWithinSmallIntRange(exponentVal)) {
                        throw new Error(`Invalid exponent in scientific notation: ${exponentStr}`);
                    }

                    let baseNumStr = scientificNotationParts[0];
                    const decimalPointIndex = baseNumStr.indexOf(".");
                    if (decimalPointIndex >= 0) {
                        exponentVal -= (baseNumStr.length - decimalPointIndex - 1);
                        baseNumStr = baseNumStr.slice(0, decimalPointIndex) + baseNumStr.slice(decimalPointIndex + 1);
                    }

                    if (exponentVal < 0) {
                        // For integers, negative exponents are not allowed (e.g., 123e-2 is 1.23, not an integer)
                        throw new Error(`Cannot include negative exponent part for integers: ${numString}`);
                    }
                    numString = baseNumStr + "0".repeat(exponentVal); // Append zeros
                }

                // Validate that the string contains only digits after processing
                if (!/^([0-9][0-9]*)$/.test(numString)) {
                    throw new Error(`Invalid integer format after processing scientific notation: ${numString}`);
                }

                if (IS_NATIVE_BIGINT_SUPPORTED) {
                    return new NativeBigInt(BigInt(isNegative ? "-" + numString : numString));
                }

                const digitsArray = [];
                const numLen = numString.length;
                const segmentSize = DIGITS_PER_CHUNKS;
                let currentSegmentEnd = numLen;
                let currentSegmentStart = numLen - segmentSize;

                while (currentSegmentEnd > 0) {
                    if (currentSegmentStart < 0) currentSegmentStart = 0;
                    digitsArray.push(+numString.slice(currentSegmentStart, currentSegmentEnd));
                    currentSegmentEnd = currentSegmentStart;
                    currentSegmentStart -= segmentSize;
                }
                trimLeadingZeros(digitsArray);
                return new LargeBigInt(digitsArray, isNegative);
            }

            // --- BigInt Prototype Methods (Output) ---

            LargeBigInt.prototype.toArray = function(base) {
                return convertToBaseRepresentation(this, base);
            };
            SmallBigInt.prototype.toArray = function(base) {
                return convertToBaseRepresentation(this, base);
            };
            NativeBigInt.prototype.toArray = function(base) {
                return convertToBaseRepresentation(this, base);
            };

            LargeBigInt.prototype.toString = function(base, radixAlphabet) {
                base = base === undefined ? 10 : base;
                if (base !== 10) {
                    return formatToBaseString(this, base, radixAlphabet);
                }
                const digitArr = this.value;
                const len = digitArr.length;
                let resultString = String(digitArr[len - 1]);

                for (let i = len - 2; i >= 0; --i) {
                    const currentDigitStr = String(digitArr[i]);
                    resultString += "0".repeat(DIGITS_PER_CHUNKS - currentDigitStr.length) + currentDigitStr;
                }
                return (this.isNegative ? "-" : "") + resultString;
            };
            SmallBigInt.prototype.toString = function(base, radixAlphabet) {
                base = base === undefined ? 10 : base;
                if (base !== 10) {
                    return formatToBaseString(this, base, radixAlphabet);
                }
                return String(this.value);
            };
            NativeBigInt.prototype.toString = SmallBigInt.prototype.toString;

            NativeBigInt.prototype.toJSON = LargeBigInt.prototype.toJSON = SmallBigInt.prototype.toJSON = function() {
                return this.toString();
            };

            LargeBigInt.prototype.valueOf = function() {
                return parseInt(this.toString(), 10);
            };
            LargeBigInt.prototype.toJSNumber = LargeBigInt.prototype.valueOf;

            SmallBigInt.prototype.valueOf = function() {
                return this.value;
            };
            SmallBigInt.prototype.toJSNumber = SmallBigInt.prototype.valueOf;

            NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
                // --- Type III: Explicitly convert BigInt to Number for safety ---
                try {
                    return Number(this.value);
                } catch (e) {
                    console.warn(`Attempted to convert BigInt ${this.value} to Number, resulting in possible loss of precision.`);
                    return parseFloat(this.value.toString());
                }
            };

            // --- Precompute small integer BigInt objects for performance ---
            const cachedSmallIntegers = [];
            // Cache numbers from 0 to 999 and their negatives
            for (let i = 0; i < 1000; i++) {
                cachedSmallIntegers[i] = normalizeInputToBigInt(i);
                if (i > 0) {
                    cachedSmallIntegers[-i] = normalizeInputToBigInt(-i);
                }
            }

            // --- Expose utility functions and constants on the main factory ---
            BigIntConstructor.one = BigIntConstructor[1] = cachedSmallIntegers[1];
            BigIntConstructor.zero = BigIntConstructor[0] = cachedSmallIntegers[0];
            BigIntConstructor.minusOne = BigIntConstructor[-1] = cachedSmallIntegers[-1];
            BigIntConstructor.max = maximumBigInt;
            BigIntConstructor.min = minimumBigInt;
            BigIntConstructor.gcd = greatestCommonDivisor;
            BigIntConstructor.lcm = function(num1, num2) {
                num1 = normalizeInputToBigInt(num1).abs();
                num2 = normalizeInputToBigInt(num2).abs();
                // lcm(a, b) = |a * b| / gcd(a, b)
                return num1.divide(greatestCommonDivisor(num1, num2)).multiply(num2);
            };
            BigIntConstructor.isInstance = function(obj) {
                return obj instanceof LargeBigInt || obj instanceof SmallBigInt || obj instanceof NativeBigInt;
            };
            BigIntConstructor.randomBetween = function(lowerBound, upperBound) {
                let minVal = minimumBigInt(normalizeInputToBigInt(lowerBound), normalizeInputToBigInt(upperBound));
                let maxVal = maximumBigInt(normalizeInputToBigInt(lowerBound), normalizeInputToBigInt(upperBound));
                let range = maxVal.subtract(minVal).add(1);

                if (range.isSmall) {
                    return minVal.add(Math.floor(Math.random() * range.toJSNumber()));
                }

                const rangeDigitsInfo = convertToBaseRepresentation(range, BASE_POWER).value;
                const randomDigits = [];
                let needsMoreRandomness = true;

                for (let i = 0; i < rangeDigitsInfo.length; i++) {
                    const limit = needsMoreRandomness ? rangeDigitsInfo[i] : BASE_POWER;
                    const randomDigit = truncateToInteger(Math.random() * limit);
                    randomDigits.push(randomDigit);
                    if (randomDigit < limit) {
                        needsMoreRandomness = false;
                    }
                }
                return minVal.add(BigIntConstructor.fromDigitArray(randomDigits, BASE_POWER, false));
            };
            BigIntConstructor.fromDigitArray = function(digits, base, isNegative) {
                // --- Guard: Invalid base ---
                if (base === undefined || base === null) {
                    base = 10;
                }
                if (base <= 0) {
                    throw new Error("Base must be a positive integer for fromDigitArray.");
                }
                const digitBigInts = digits.map(normalizeInputToBigInt);
                return convertDigitArrayToBase10(digitBigInts, normalizeInputToBigInt(base), isNegative);
            };

            return BigIntConstructor;
        })();
        "undefined" != typeof module && module.hasOwnProperty("exports") && (module.exports = bigIntFactory), "function" == typeof define && define.amd && define("big-integer", [], function() {
            return bigIntFactory;
        });
    }, {}],
    "Focm": [function(require, module, exports) {
        // --- Purescript Runtime & Application Logic Type III clone ---
        var psExports = {};

        (function(targetExports) {
            "use strict";
            (targetExports["Control.Apply"] = targetExports["Control.Apply"] || {}).arrayApply = function(functionArray) {
                return function(valueArray) {
                    var funcLen = functionArray.length,
                        valLen = valueArray.length,
                        resultArray = new Array(funcLen * valLen),
                        resultIndex = 0;
                    for (var i = 0; i < funcLen; i++) {
                        for (var j = 0; j < valLen; j++) {
                            resultArray[resultIndex++] = functionArray[i](valueArray[j]);
                        }
                    }
                    return resultArray;
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var SemigroupoidConstructor = function(compositionFunction) {
                    this.compose = compositionFunction;
                },
                functionCompositionSemigroupoid = new SemigroupoidConstructor(function(func1) {
                    return function(func2) {
                        return function(arg) {
                            return func1(func2(arg));
                        };
                    };
                });
            targetExports.compose = function(semigroupoidInstance) {
                return semigroupoidInstance.compose;
            }, targetExports.Semigroupoid = SemigroupoidConstructor, targetExports.semigroupoidFn = functionCompositionSemigroupoid;
        })(psExports["Control.Semigroupoid"] = psExports["Control.Semigroupoid"] || {}), (function(targetExports) {
            "use strict";
            var SemigroupoidMod = psExports["Control.Semigroupoid"],
                CategoryConstructor = function(semigroupoidInstance, identityFunction) {
                    this.Semigroupoid0 = semigroupoidInstance, this.identity = identityFunction;
                },
                functionIdentityCategory = new CategoryConstructor(function() {
                    return SemigroupoidMod.semigroupoidFn;
                }, function(arg) {
                    return arg;
                });
            targetExports.Category = CategoryConstructor, targetExports.identity = function(categoryInstance) {
                return categoryInstance.identity;
            }, targetExports.categoryFn = functionIdentityCategory;
        })(psExports["Control.Category"] = psExports["Control.Category"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Data.Boolean"] = targetExports["Data.Boolean"] || {}).otherwise = true;
        })(psExports), (function(targetExports) {
            "use strict";
            (targetExports["Data.Eq"] = targetExports["Data.Eq"] || {}).referenceEquality = function(val1) {
                return function(val2) {
                    return val1 === val2;
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            (targetExports["Data.Unit"] = targetExports["Data.Unit"] || {}).unitValue = {};
        })(psExports), (function(targetExports) {
            "use strict";
            psExports["Data.Show"], psExports["Data.Symbol"], psExports["Record.Unsafe"], psExports["Type.Data.RowList"];
            targetExports.Show = function(showFunction) {
                this.show = showFunction;
            }, targetExports.show = function(showInstance) {
                return showInstance.show;
            };
        })(psExports["Data.Show"] = psExports["Data.Show"] || {}), (function(targetExports) {
            "use strict";
            var UnitMod = psExports["Data.Unit"];
            psExports["Data.Show"];
            targetExports.unit = UnitMod.unitValue;
        })(psExports["Data.Unit"] = psExports["Data.Unit"] || {}), (function(targetExports) {
            "use strict";
            var EqMod = psExports["Data.Eq"],
                EqConstructor = function(eqFunction) {
                    this.eq = eqFunction;
                },
                integerEquality = new EqConstructor(EqMod.referenceEquality);
            targetExports.Eq = EqConstructor, targetExports.eq = function(eqInstance) {
                return eqInstance.eq;
            }, targetExports.eqInt = integerEquality;
        })(psExports["Data.Eq"] = psExports["Data.Eq"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Data.Ord.Unsafe"] = targetExports["Data.Ord.Unsafe"] || {}).unsafeCompareLogic = function(lessThan) {
                return function(equalTo) {
                    return function(greaterThan) {
                        return function(val1) {
                            return function(val2) {
                                return val1 < val2 ? lessThan : val1 === val2 ? equalTo : greaterThan;
                            };
                        };
                    };
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            psExports["Data.Semigroup"], psExports["Data.Symbol"], psExports["Data.Unit"], psExports["Data.Void"], psExports["Record.Unsafe"], psExports["Type.Data.RowList"];
            targetExports.Semigroup = function(appendFunction) {
                this.append = appendFunction;
            }, targetExports.append = function(semigroupInstance) {
                return semigroupInstance.append;
            };
        })(psExports["Data.Semigroup"] = psExports["Data.Semigroup"] || {}), (function(targetExports) {
            "use strict";
            psExports["Data.Eq"], psExports["Data.Semigroup"], psExports["Data.Show"];
            var OrderResult_LT = (function() {
                    function LT() {}
                    return LT.value = new LT(), LT;
                })(),
                OrderResult_GT = (function() {
                    function GT() {}
                    return GT.value = new GT(), GT;
                })(),
                OrderResult_EQ = (function() {
                    function EQ() {}
                    return EQ.value = new EQ(), EQ;
                })();
            targetExports.OrderResult_LT = OrderResult_LT, targetExports.OrderResult_GT = OrderResult_GT, targetExports.OrderResult_EQ = OrderResult_EQ;
        })(psExports["Data.Ordering"] = psExports["Data.Ordering"] || {}), (function(targetExports) {
            "use strict";
            var UnsafeOrdMod = psExports["Data.Ord.Unsafe"],
                OrderingMod = psExports["Data.Ordering"],
                unsafeCompareValues = UnsafeOrdMod.unsafeCompareLogic(OrderingMod.OrderResult_LT.value)(OrderingMod.OrderResult_EQ.value)(OrderingMod.OrderResult_GT.value);
            targetExports.unsafeCompare = unsafeCompareValues;
        })(psExports["Data.Ord.Unsafe"] = psExports["Data.Ord.Unsafe"] || {}), (function(targetExports) {
            "use strict";
            psExports["Data.Semiring"], psExports["Data.Symbol"], psExports["Data.Unit"], psExports["Record.Unsafe"], psExports["Type.Data.Row"], psExports["Type.Data.RowList"];
            targetExports.Semiring = function(addFunc, mulFunc, oneVal, zeroVal) {
                this.add = addFunc, this.mul = mulFunc, this.one = oneVal, this.zero = zeroVal;
            }, targetExports.add = function(semiringInstance) {
                return semiringInstance.add;
            }, targetExports.zero = function(semiringInstance) {
                return semiringInstance.zero;
            }, targetExports.mul = function(semiringInstance) {
                return semiringInstance.mul;
            }, targetExports.one = function(semiringInstance) {
                return semiringInstance.one;
            };
        })(psExports["Data.Semiring"] = psExports["Data.Semiring"] || {}), (function(targetExports) {
            "use strict";
            var EqMod = psExports["Data.Eq"],
                UnsafeOrdMod = psExports["Data.Ord.Unsafe"],
                OrderingMod = psExports["Data.Ordering"],
                OrdConstructor = function(eqInstance, compareFunc) {
                    this.Eq0 = eqInstance, this.compare = compareFunc;
                },
                integerOrder = new OrdConstructor(function() {
                    return EqMod.eqInt;
                }, UnsafeOrdMod.unsafeCompareValues),
                compareValues = function(ordInstance) {
                    return ordInstance.compare;
                };
            targetExports.Ord = OrdConstructor, targetExports.compare = compareValues, targetExports.min = function(ordInstance) {
                return function(val1) {
                    return function(val2) {
                        var comparisonResult = compareValues(ordInstance)(val1)(val2);
                        if (comparisonResult instanceof OrderingMod.OrderResult_LT) return val1;
                        if (comparisonResult instanceof OrderingMod.OrderResult_EQ) return val1;
                        if (comparisonResult instanceof OrderingMod.OrderResult_GT) return val2;
                        throw new Error("Failed pattern match at Data.Ord (line 119, column 3 - line 122, column 12): " + [comparisonResult.constructor.name]);
                    };
                };
            }, targetExports.ordInt = integerOrder;
        })(psExports["Data.Ord"] = psExports["Data.Ord"] || {}), (function(targetExports) {
            "use strict";
            psExports["Control.Category"], psExports["Data.Boolean"], psExports["Data.Ord"], psExports["Data.Ring"];
            targetExports.flipArgs = function(func) {
                return function(arg2) {
                    return function(arg1) {
                        return func(arg1)(arg2);
                    };
                };
            }, targetExports.constantFunc = function(val) {
                return function(ignore) {
                    return val;
                };
            };
        })(psExports["Data.Function"] = psExports["Data.Function"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Data.Functor"] = targetExports["Data.Functor"] || {}).arrayMapFn = function(mappingFunction) {
                return function(inputArray) {
                    var arrayLength = inputArray.length,
                        resultArray = new Array(arrayLength);
                    for (var i = 0; i < arrayLength; i++) resultArray[i] = mappingFunction(inputArray[i]);
                    return resultArray;
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var FunctorMod = psExports["Data.Functor"],
                FunctorConstructor = function(mappingFunction) {
                    this.map = mappingFunction;
                },
                mapFn = function(functorInstance) {
                    return functorInstance.map;
                },
                arrayFunctor = new FunctorConstructor(FunctorMod.arrayMapFn);
            targetExports.Functor = FunctorConstructor, targetExports.map = mapFn, targetExports.void = function(functorInstance) {
                return mapFn(functorInstance)(psExports["Data.Function"].constantFunc(psExports["Data.Unit"].unitValue));
            }, targetExports.functorArray = arrayFunctor;
        })(psExports["Data.Functor"] = psExports["Data.Functor"] || {}), (function(targetExports) {
            "use strict";
            var ApplyMod = psExports["Control.Apply"],
                FunctorMod = psExports["Data.Functor"],
                ApplyConstructor = function(functorInstance, applyFunction) {
                    this.Functor0 = functorInstance, this.apply = applyFunction;
                },
                arrayApplyInst = new ApplyConstructor(function() {
                    return FunctorMod.functorArray;
                }, ApplyMod.arrayApply);
            targetExports.Apply = ApplyConstructor, targetExports.apply = function(applyInstance) {
                return applyInstance.apply;
            }, targetExports.applyArray = arrayApplyInst;
        })(psExports["Control.Apply"] = psExports["Control.Apply"] || {}), (function(targetExports) {
            "use strict";
            var ApplyMod = psExports["Control.Apply"];
            targetExports.Applicative = function(applyInstance, pureFunction) {
                this.Apply0 = applyInstance, this.pure = pureFunction;
            }, targetExports.pure = function(applicativeInstance) {
                return applicativeInstance.pure;
            };
        })(psExports["Control.Applicative"] = psExports["Control.Applicative"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Control.Bind"] = targetExports["Control.Bind"] || {}).arrayBindFn = function(inputArray) {
                return function(mappingFunction) {
                    var resultArray = [];
                    for (var i = 0, len = inputArray.length; i < len; i++) {
                        Array.prototype.push.apply(resultArray, mappingFunction(inputArray[i]));
                    }
                    return resultArray;
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var BindMod = psExports["Control.Bind"],
                ApplyMod = psExports["Control.Apply"],
                BindConstructor = function(applyInstance, bindFunction) {
                    this.Apply0 = applyInstance, this.bind = bindFunction;
                },
                DiscardConstructor = function(discardFunction) {
                    this.discard = discardFunction;
                },
                arrayBindInst = new BindConstructor(function() {
                    return ApplyMod.applyArray;
                }, BindMod.arrayBindFn),
                bindFn = function(bindInstance) {
                    return bindInstance.bind;
                },
                unitDiscardInst = new DiscardConstructor(function(bindInstance) {
                    return bindFn(bindInstance);
                });
            targetExports.Bind = BindConstructor, targetExports.bindFn = bindFn, targetExports.bindFlipped = function(bindInstance) {
                return psExports["Data.Function"].flipArgs(bindFn(bindInstance));
            }, targetExports.Discard = DiscardConstructor, targetExports.discard = function(discardInstance) {
                return discardInstance.discard;
            }, targetExports.bindArray = arrayBindInst, targetExports.discardUnit = unitDiscardInst;
        })(psExports["Control.Bind"] = psExports["Control.Bind"] || {}), (function(targetExports) {
            "use strict";
            var ApplicativeMod = psExports["Control.Applicative"],
                BindMod = psExports["Control.Bind"];
            targetExports.Monad = function(applicativeInstance, bindInstance) {
                this.Applicative0 = applicativeInstance, this.Bind1 = bindInstance;
            }, targetExports.ap = function(monadInstance) {
                return function(funcVal) {
                    return function(argVal) {
                        return BindMod.bindFn(monadInstance.Bind1())(funcVal)(function(f) {
                            return BindMod.bindFn(monadInstance.Bind1())(argVal)(function(x) {
                                return ApplicativeMod.pure(monadInstance.Applicative0())(f(x));
                            });
                        });
                    };
                };
            };
        })(psExports["Control.Monad"] = psExports["Control.Monad"] || {}), (function(targetExports) {
            "use strict";
            psExports["Data.Boolean"], psExports["Data.Eq"], psExports["Data.EuclideanRing"], psExports["Data.Ord"], psExports["Data.Ordering"], psExports["Data.Semigroup"], psExports["Data.Symbol"], psExports["Data.Unit"], psExports["Record.Unsafe"], psExports["Type.Data.RowList"];
            targetExports.monoidEmpty = function(monoidInstance) {
                return monoidInstance.mempty;
            };
        })(psExports["Data.Monoid"] = psExports["Data.Monoid"] || {}), (function(targetExports) {
            "use strict";
            var ApplicativeMod = psExports["Control.Applicative"],
                ApplyMod = psExports["Control.Apply"],
                BindMod = psExports["Control.Bind"],
                FunctorMod = psExports["Data.Functor"],
                Maybe_Nothing = (function() {
                    function Nothing() {}
                    return Nothing.value = new Nothing(), Nothing;
                })(),
                Maybe_Just = (function() {
                    function Just(val) {
                        this.value0 = val;
                    }
                    return Just.create = function(val) {
                        return new Just(val);
                    }, Just;
                })(),
                maybeTransform = function(nothingVal) {
                    return function(justFunc) {
                        return function(maybeVal) {
                            if (maybeVal instanceof Maybe_Nothing) return nothingVal;
                            if (maybeVal instanceof Maybe_Just) return justFunc(maybeVal.value0);
                            throw new Error("Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " + [nothingVal.constructor.name, justFunc.constructor.name, maybeVal.constructor.name]);
                        };
                    };
                },
                isMaybeJust = maybeTransform(false)(psExports["Data.Function"].constantFunc(true)),
                maybeFunctor = new FunctorMod.Functor(function(mappingFunction) {
                    return function(maybeVal) {
                        if (maybeVal instanceof Maybe_Just) return new Maybe_Just(mappingFunction(maybeVal.value0));
                        if (maybeVal instanceof Maybe_Nothing) return Maybe_Nothing.value;
                        throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [mappingFunction.constructor.name, maybeVal.constructor.name]);
                    };
                }),
                maybeApply = new ApplyMod.Apply(function() {
                    return maybeFunctor;
                }, function(maybeFunc) {
                    return function(maybeVal) {
                        if (maybeFunc instanceof Maybe_Just) return FunctorMod.mapFn(maybeFunctor)(maybeFunc.value0)(maybeVal);
                        if (maybeFunc instanceof Maybe_Nothing) return Maybe_Nothing.value;
                        throw new Error("Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " + [maybeFunc.constructor.name, maybeVal.constructor.name]);
                    };
                }),
                maybeBind = new BindMod.BindConstructor(function() {
                    return maybeApply;
                }, function(maybeVal) {
                    return function(mappingFunc) {
                        if (maybeVal instanceof Maybe_Just) return mappingFunc(maybeVal.value0);
                        if (maybeVal instanceof Maybe_Nothing) return Maybe_Nothing.value;
                        throw new Error("Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " + [maybeVal.constructor.name, mappingFunc.constructor.name]);
                    };
                }),
                maybeApplicative = new ApplicativeMod.Applicative(function() {
                    return maybeApply;
                }, Maybe_Just.create);
            targetExports.Maybe_Nothing = Maybe_Nothing, targetExports.Maybe_Just = Maybe_Just, targetExports.maybe = maybeTransform, targetExports.isMaybeJust = isMaybeJust, targetExports.fromJust = function(maybeVal) {
                if (maybeVal instanceof Maybe_Just) return maybeVal.value0;
                throw new Error("Failed pattern match at Data.Maybe (line 268, column 1 - line 268, column 46): " + [maybeVal.constructor.name]);
            }, targetExports.maybeFunctor = maybeFunctor, targetExports.maybeApply = maybeApply, targetExports.maybeApplicative = maybeApplicative, targetExports.maybeBind = maybeBind;
        })(psExports["Data.Maybe"] = psExports["Data.Maybe"] || {}), (function(targetExports) {
            "use strict";
            targetExports.Foldable = function(foldMapFunc, foldlFunc, foldrFunc) {
                this.foldMap = foldMapFunc, this.foldl = foldlFunc, this.foldr = foldrFunc;
            }, targetExports.foldr = function(foldableInstance) {
                return foldableInstance.foldr;
            }, targetExports.foldl = function(foldableInstance) {
                return foldableInstance.foldl;
            }, targetExports.foldMap = function(foldableInstance) {
                return foldableInstance.foldMap;
            };
        })(psExports["Data.Foldable"] = psExports["Data.Foldable"] || {}), (function(targetExports) {
            "use strict";
            var ApplicativeMod = psExports["Control.Applicative"],
                ApplyMod = psExports["Control.Apply"],
                BindMod = psExports["Control.Bind"],
                FunctorMod = psExports["Data.Functor"],
                Either_Left = (function() {
                    function Left(val) {
                        this.value0 = val;
                    }
                    return Left.create = function(val) {
                        return new Left(val);
                    }, Left;
                })(),
                Either_Right = (function() {
                    function Right(val) {
                        this.value0 = val;
                    }
                    return Right.create = function(val) {
                        return new Right(val);
                    }, Right;
                })(),
                eitherFunctor = new FunctorMod.Functor(function(mappingFunction) {
                    return function(eitherVal) {
                        if (eitherVal instanceof Either_Left) return new Either_Left(eitherVal.value0);
                        if (eitherVal instanceof Either_Right) return new Either_Right(mappingFunction(eitherVal.value0));
                        throw new Error("Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " + [eitherVal.constructor.name]);
                    };
                }),
                eitherTransform = function(leftFunc) {
                    return function(rightFunc) {
                        return function(eitherVal) {
                            if (eitherVal instanceof Either_Left) return leftFunc(eitherVal.value0);
                            if (eitherVal instanceof Either_Right) return rightFunc(eitherVal.value0);
                            throw new Error("Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " + [leftFunc.constructor.name, rightFunc.constructor.name, eitherVal.constructor.name]);
                        };
                    };
                },
                eitherApply = new ApplyMod.Apply(function() {
                    return eitherFunctor;
                }, function(eitherFunc) {
                    return function(eitherVal) {
                        if (eitherFunc instanceof Either_Left) return new Either_Left(eitherFunc.value0);
                        if (eitherFunc instanceof Either_Right) return FunctorMod.mapFn(eitherFunctor)(eitherFunc.value0)(eitherVal);
                        throw new Error("Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " + [eitherFunc.constructor.name, eitherVal.constructor.name]);
                    };
                }),
                eitherBind = new BindMod.BindConstructor(function() {
                    return eitherApply;
                }, eitherTransform(function(val) {
                    return function(ignore) {
                        return new Either_Left(val);
                    };
                })(function(val) {
                    return function(func) {
                        return func(val);
                    };
                })),
                eitherApplicative = new ApplicativeMod.Applicative(function() {
                    return eitherApply;
                }, Either_Right.create);
            targetExports.Either_Left = Either_Left, targetExports.Either_Right = Either_Right, targetExports.either = eitherTransform, targetExports.eitherFunctor = eitherFunctor, targetExports.eitherApply = eitherApply, targetExports.eitherApplicative = eitherApplicative, targetExports.eitherBind = eitherBind;
        })(psExports["Data.Either"] = psExports["Data.Either"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Partial.Unsafe"] = targetExports["Partial.Unsafe"] || {}).unsafePartialCall = function(func) {
                return func();
            };
        })(psExports), (function(targetExports) {
            "use strict";
            (targetExports["Partial"] = targetExports["Partial"] || {}).crashWithError = function() {
                return function(message) {
                    throw new Error(message);
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var PartialMod = psExports.Partial;
            targetExports.crashWith = PartialMod.crashWithError;
        })(psExports.Partial = psExports.Partial || {}), (function(targetExports) {
            "use strict";
            var UnsafePartialMod = psExports["Partial.Unsafe"],
                PartialMod = psExports.Partial;
            targetExports.unsafeCrashWith = function(message) {
                return UnsafePartialMod.unsafePartialCall(function(effect) {
                    return PartialMod.crashWith(effect)(message);
                });
            };
        })(psExports["Partial.Unsafe"] = psExports["Partial.Unsafe"] || {}), (function(targetExports) {
            "use strict";
            var RecState_Loop = (function() {
                    function Loop(val) {
                        this.value0 = val;
                    }
                    return Loop.create = function(val) {
                        return new Loop(val);
                    }, Loop;
                })(),
                RecState_Done = (function() {
                    function Done(val) {
                        this.value0 = val;
                    }
                    return Done.create = function(val) {
                        return new Done(val);
                    }, Done;
                })();
            targetExports.RecState_Loop = RecState_Loop, targetExports.RecState_Done = RecState_Done, targetExports.MonadRec = function(monadInstance, tailRecMFunc) {
                this.Monad0 = monadInstance, this.tailRecM = tailRecMFunc;
            }, targetExports.tailRecursiveMonad = function(monadRecInstance) {
                return monadRecInstance.tailRecM;
            };
        })(psExports["Control.Monad.Rec.Class"] = psExports["Control.Monad.Rec.Class"] || {}), (function(targetExports) {
            "use strict";
            targetExports.stMap_ = function(func) {
                return function(stAction) {
                    return function() {
                        return func(stAction());
                    };
                };
            }, targetExports.stPure_ = function(val) {
                return function() {
                    return val;
                };
            }, targetExports.stBind_ = function(stAction) {
                return function(func) {
                    return function() {
                        return func(stAction())();
                    };
                };
            }, targetExports.stWhileLoop = function(condition) {
                return function(body) {
                    return function() {
                        for (; condition();) body();
                    };
                };
            }, targetExports.stNewRef = function(initialVal) {
                return function() {
                    return {
                        value: initialVal
                    };
                };
            }, targetExports.stReadRef = function(ref) {
                return function() {
                    return ref.value;
                };
            }, targetExports.stWriteRef = function(val) {
                return function(ref) {
                    return function() {
                        return ref.value = val;
                    };
                };
            };
        })(psExports["Control.Monad.ST.Internal"] = psExports["Control.Monad.ST.Internal"] || {}), (function(targetExports) {
            "use strict";
            var STInternalMod = psExports["Control.Monad.ST.Internal"],
                ApplicativeMod = psExports["Control.Applicative"],
                ApplyMod = psExports["Control.Apply"],
                BindMod = psExports["Control.Bind"],
                MonadMod = psExports["Control.Monad"],
                MonadRecMod = psExports["Control.Monad.Rec.Class"],
                FunctorMod = psExports["Data.Functor"],
                UnitMod = psExports["Data.Unit"],
                stFunctor = new FunctorMod.Functor(STInternalMod.stMap_),
                stMonad = new MonadMod.Monad(function() {
                    return stApplicative;
                }, function() {
                    return stBind;
                }),
                stBind = new BindMod.BindConstructor(function() {
                    return stApply;
                }, STInternalMod.stBind_),
                stApply = new ApplyMod.Apply(function() {
                    return stFunctor;
                }, MonadMod.ap(stMonad)),
                stApplicative = new ApplicativeMod.Applicative(function() {
                    return stApply;
                }, STInternalMod.stPure_),
                stMonadRec = new MonadRecMod.MonadRec(function() {
                    return stMonad;
                }, function(stepFunc) {
                    return function(initialState) {
                        // This is the core tail-recursive loop implementation for ST monad
                        var isLoopState = function(state) {
                                return state instanceof MonadRecMod.RecState_Loop;
                            },
                            getDoneValue = function(state) {
                                if (state instanceof MonadRecMod.RecState_Done) return state.value0;
                                throw new Error("Failed pattern match at Control.Monad.ST.Internal (line 54, column 32 - line 54, column 46): " + [state.constructor.name]);
                            };
                        return BindMod.bindFn(stBind)(BindMod.bindFlipped(stBind)(STInternalMod.stNewRef)(stepFunc(initialState)))(function(stateRef) {
                            return BindMod.discard(BindMod.discardUnit)(stBind)(STInternalMod.stWhileLoop(FunctorMod.mapFn(stFunctor)(isLoopState)(STInternalMod.stReadRef(stateRef)))(BindMod.bindFn(stBind)(STInternalMod.stReadRef(stateRef))(function(currentRecState) {
                                if (currentRecState instanceof MonadRecMod.RecState_Loop) return BindMod.bindFn(stBind)(stepFunc(currentRecState.value0))(function(nextRecState) {
                                    return FunctorMod.void(stFunctor)(STInternalMod.stWriteRef(nextRecState)(stateRef));
                                });
                                if (currentRecState instanceof MonadRecMod.RecState_Done) return ApplicativeMod.pure(stApplicative)(UnitMod.unitValue);
                                throw new Error("Failed pattern match at Control.Monad.ST.Internal (line 46, column 18 - line 50, column 28): " + [currentRecState.constructor.name]);
                            })))(function() {
                                return FunctorMod.mapFn(stFunctor)(getDoneValue)(STInternalMod.stReadRef(stateRef));
                            });
                        });
                    };
                });
            targetExports.functorST = stFunctor, targetExports.applyST = stApply, targetExports.applicativeST = stApplicative, targetExports.bindST = stBind, targetExports.monadST = stMonad, targetExports.monadRecST = stMonadRec, targetExports.stReadRef = STInternalMod.stReadRef, targetExports.stWriteRef = STInternalMod.stWriteRef;
        })(psExports["Control.Monad.ST.Internal"] = psExports["Control.Monad.ST.Internal"] || {}), (function(targetExports) {
            "use strict";
            targetExports.arrayLength = function(arr) {
                return arr.length;
            }, targetExports.arrayIndexImpl = function(justFunc) {
                return function(nothingVal) {
                    return function(arr) {
                        return function(idx) {
                            return idx < 0 || idx >= arr.length ? nothingVal : justFunc(arr[idx]);
                        };
                    };
                };
            }, targetExports.arraySortImpl = function(compareFunc) {
                return function(arr) {
                    return arr.slice().sort(function(val1, val2) {
                        return compareFunc(val1)(val2);
                    });
                };
            }, targetExports.arraySlice = function(startIdx) {
                return function(endIdx) {
                    return function(arr) {
                        return arr.slice(startIdx, endIdx);
                    };
                };
            };
        })(psExports["Data.Array"] = psExports["Data.Array"] || {}), (function(targetExports) {
            "use strict";
            targetExports.mutableArrayEmpty = function() {
                return [];
            }, targetExports.mutableArrayPushAll = function(items) {
                return function(mutableArray) {
                    return function() {
                        return mutableArray.push.apply(mutableArray, items);
                    };
                };
            };
        })(psExports["Data.Array.ST"] = psExports["Data.Array.ST"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Unsafe.Coerce"] = targetExports["Unsafe.Coerce"] || {}).unsafeTypeCoercion = function(val) {
                return val;
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var UnsafeCoerceMod = psExports["Unsafe.Coerce"];
            targetExports.unsafeCoerce = UnsafeCoerceMod.unsafeTypeCoercion;
        })(psExports["Unsafe.Coerce"] = psExports["Unsafe.Coerce"] || {}), (function(targetExports) {
            "use strict";
            var ArraySTMod = psExports["Data.Array.ST"],
                ApplicativeMod = psExports["Control.Applicative"],
                STInternalMod = psExports["Control.Monad.ST.Internal"];
            targetExports.mutableArrayPush = function(item) {
                return ArraySTMod.mutableArrayPushAll([item]);
            }, targetExports.mutableArrayFreeze = function(mutableArray) {
                return ApplicativeMod.pure(STInternalMod.stApplicative)(mutableArray);
            }, targetExports.mutableArrayEmpty = ArraySTMod.mutableArrayEmpty;
        })(psExports["Data.Array.ST"] = psExports["Data.Array.ST"] || {}), (function(targetExports) {
            "use strict";
            var TupleConstructor = (function() {
                function Tuple(val0, val1) {
                    this.value0 = val0, this.value1 = val1;
                }
                return Tuple.create = function(val0) {
                    return function(val1) {
                        return new Tuple(val0, val1);
                    };
                }, Tuple;
            })();
            targetExports.Tuple = TupleConstructor, targetExports.tupleSnd = function(tuple) {
                return tuple.value1;
            };
        })(psExports["Data.Tuple"] = psExports["Data.Tuple"] || {}), (function(targetExports) {
            "use strict";
            var ArrayMod = psExports["Data.Array"],
                BindMod = psExports["Control.Bind"],
                FunctorMod = psExports["Data.Functor"],
                MaybeMod = psExports["Data.Maybe"],
                OrderingMod = psExports["Data.Ordering"],
                arraySingleton = function(val) {
                    return [val];
                },
                arrayIndex = ArrayMod.arrayIndexImpl(MaybeMod.Maybe_Just.create)(MaybeMod.Maybe_Nothing.value),
                arrayConcatMap = psExports["Data.Function"].flipArgs(BindMod.bindFn(BindMod.arrayBindInst));
            targetExports.arraySingleton = arraySingleton, targetExports.arrayIndex = arrayIndex, targetExports.arrayConcatMap = arrayConcatMap, targetExports.arrayMapMaybe = function(mappingFunction) {
                return arrayConcatMap(function(val) {
                    return MaybeMod.maybe([], arraySingleton)(mappingFunction(val));
                });
            }, targetExports.arraySortBy = function(compareFunction) {
                return function(arr) {
                    return ArrayMod.arraySortImpl(function(val1, val2) {
                        var comparisonResult = compareFunction(val1)(val2);
                        if (comparisonResult instanceof OrderingMod.OrderResult_GT) return 1;
                        if (comparisonResult instanceof OrderingMod.OrderResult_EQ) return 0;
                        if (comparisonResult instanceof OrderingMod.OrderResult_LT) return -1;
                        throw new Error("Failed pattern match at Data.Array (line 702, column 15 - line 707, column 1): " + [comparisonResult.constructor.name]);
                    })(arr);
                };
            };
        })(psExports["Data.Array"] = psExports["Data.Array"] || {}), (function(targetExports) {
            var bigInt = require("big-integer");
            targetExports["bigIntFromBaseString"] = function(justFunc) {
                return function(nothingVal) {
                    return function(base) {
                        return function(str) {
                            try {
                                var result = bigInt(str, base);
                                return justFunc(result);
                            } catch (error) {
                                return nothingVal;
                            }
                        };
                    };
                };
            }, targetExports.bigIntFromInteger = function(val) {
                return bigInt(val);
            }, targetExports.bigIntToBaseString = function(base) {
                return function(bigIntVal) {
                    return bigIntVal.toString(base);
                };
            }, targetExports.bigIntAdd = function(val1) {
                return function(val2) {
                    return val1.add(val2);
                };
            }, targetExports.bigIntMultiply = function(val1) {
                return function(val2) {
                    return val1.multiply(val2);
                };
            }, targetExports.bigIntEquals = function(val1) {
                return function(val2) {
                    return val1.equals(val2);
                };
            }, targetExports.bigIntCompare = function(val1) {
                return function(val2) {
                    return val1.compare(val2);
                };
            };
        })(psExports["Data.BigInt"] = psExports["Data.BigInt"] || {}), (function(targetExports) {
            "use strict";
            (targetExports["Data.Int"] = targetExports["Data.Int"] || {}).intFromStringAsLogic = function(justFunc) {
                return function(nothingVal) {
                    return function(base) {
                        return function(str) {
                            // Validate base range (2-36)
                            if (base < 2 || base > 36) {
                                return nothingVal; // Invalid base for parseInt
                            }
                            // Regex for valid digits in the given base
                            var digitRegexCharSet;
                            if (base <= 10) {
                                digitRegexCharSet = "[0-" + (base - 1).toString() + "]";
                            } else if (base === 11) {
                                digitRegexCharSet = "[0-9a]";
                            } else {
                                // For bases > 11, we use a-z up to the appropriate letter
                                digitRegexCharSet = "[0-9a-" + String.fromCharCode(86 + base) + "]";
                            }
                            var fullRegex = new RegExp("^[\\+\\-]?" + digitRegexCharSet + "+$", "i");
                            return function(inputString) {
                                if (fullRegex.test(inputString)) {
                                    var parsedInt = parseInt(inputString, base);
                                    // Check if parsedInt is a valid 32-bit integer
                                    if ((0 | parsedInt) === parsedInt) {
                                        return justFunc(parsedInt);
                                    }
                                    return nothingVal; // Number is too large or small for 32-bit int
                                }
                                return nothingVal; // String does not match regex for the base
                            };
                        };
                    };
                };
            };
        })(psExports), (function(targetExports) {
            "use strict";
            var IntMod = psExports["Data.Int"],
                MaybeMod = psExports["Data.Maybe"],
                intFromStringAs = IntMod.intFromStringAsLogic(MaybeMod.Maybe_Just.create)(MaybeMod.Maybe_Nothing.value),
                intFromString = intFromStringAs(10);
            targetExports.fromString = intFromString, targetExports.fromStringAs = intFromStringAs;
        })(psExports["Data.Int"] = psExports["Data.Int"] || {}), (function(targetExports) {
            "use strict";
            var BigIntMod = psExports["Data.BigInt"],
                EqMod = psExports["Data.Eq"],
                MaybeMod = psExports["Data.Maybe"],
                OrdMod = psExports["Data.Ord"],
                OrderingMod = psExports["Data.Ordering"],
                SemiringMod = psExports["Data.Semiring"],
                bigIntToBase10String = BigIntMod.bigIntToBaseString(10),
                bigIntSemiringInstance = new SemiringMod.Semiring(BigIntMod.bigIntAdd, BigIntMod.bigIntMultiply, BigIntMod.bigIntFromInteger(1), BigIntMod.bigIntFromInteger(0)),
                bigIntFromBase = BigIntMod.bigIntFromBaseString(MaybeMod.Maybe_Just.create)(MaybeMod.Maybe_Nothing.value),
                bigIntFromString = bigIntFromBase(10),
                bigIntEqInstance = new EqMod.EqConstructor(BigIntMod.bigIntEquals),
                bigIntOrdInstance = new OrdMod.OrdConstructor(function() {
                    return bigIntEqInstance;
                }, function(val1) {
                    return function(val2) {
                        var comparisonResult = BigIntMod.bigIntCompare(val1)(val2);
                        if (comparisonResult === 1) return OrderingMod.OrderResult_GT.value;
                        if (comparisonResult === 0) return OrderingMod.OrderResult_EQ.value;
                        return OrderingMod.OrderResult_LT.value;
                    };
                });
            targetExports.fromString = bigIntFromString, targetExports.fromBase = bigIntFromBase, targetExports.toString = bigIntToBase10String, targetExports.bigIntEqInstance = bigIntEqInstance, targetExports.bigIntOrdInstance = bigIntOrdInstance, targetExports.bigIntSemiringInstance = bigIntSemiringInstance;
        })(psExports["Data.BigInt"] = psExports["Data.BigInt"] || {}), (function(targetExports) {
            "use strict";
            var FunctorMod = psExports["Data.Functor"],
                FoldableMod = psExports["Data.Foldable"],
                SemigroupMod = psExports["Data.Semigroup"],
                List_Empty = (function() {
                    function Nil() {}
                    return Nil.value = new Nil(), Nil;
                })(),
                List_Cons = (function() {
                    function Cons(head, tail) {
                        this.value0 = head, this.value1 = tail;
                    }
                    return Cons.create = function(head) {
                        return function(tail) {
                            return new Cons(head, tail);
                        };
                    }, Cons;
                })(),
                listFoldable = new FoldableMod.Foldable(function(monoidInstance) {
                    return function(mappingFunction) {
                        return function(list) {
                            return FoldableMod.foldl(listFoldable)(function(accumulator) {
                                return function(item) {
                                    return SemigroupMod.append(monoidInstance.Semigroup0())(accumulator)(mappingFunction(item));
                                };
                            })(psExports["Data.Monoid"].monoidEmpty(monoidInstance))(list);
                        };
                    };
                }, function(foldingFunction) {
                    return function(initialValue) {
                        return function(list) {
                            var currentValue = initialValue,
                                currentList = list,
                                isFinished = false;
                            // Rewritten while loop for better clarity and explicit state management
                            while (!isFinished) {
                                if (currentList instanceof List_Empty) {
                                    isFinished = true;
                                } else if (currentList instanceof List_Cons) {
                                    currentValue = foldingFunction(currentValue)(currentList.value0);
                                    currentList = currentList.value1;
                                } else {
                                    throw new Error("Failed pattern match at Data.List.Types (line 81, column 12 - line 83, column 30): " + [currentValue.constructor.name, currentList.constructor.name]);
                                }
                            }
                            return currentValue;
                        };
                    };
                }, function(foldingFunction) {
                    return function(initialValue) {
                        var reversedList = FoldableMod.foldl(listFoldable)(psExports["Data.Function"].flipArgs(List_Cons.create))(List_Empty.value);
                        return function(list) {
                            return FoldableMod.foldl(listFoldable)(psExports["Data.Function"].flipArgs(foldingFunction))(initialValue)(reversedList(list));
                        };
                    };
                }),
                listFunctor = new FunctorMod.Functor(function(mappingFunction) {
                    return FoldableMod.foldr(listFoldable)(function(item) {
                        return function(accumulator) {
                            return new List_Cons(mappingFunction(item), accumulator);
                        };
                    })(List_Empty.value);
                }),
                listSemigroup = new SemigroupMod.Semigroup(function(list1) {
                    return function(list2) {
                        return FoldableMod.foldr(listFoldable)(List_Cons.create)(list2)(list1);
                    };
                }),
                listApply = new psExports["Control.Apply"].Apply(function() {
                    return listFunctor;
                }, function(listFuncs) {
                    return function(listVals) {
                        if (listFuncs instanceof List_Empty) return List_Empty.value;
                        if (listFuncs instanceof List_Cons) return SemigroupMod.append(listSemigroup)(FunctorMod.mapFn(listFunctor)(listFuncs.value0)(listVals))(psExports["Control.Apply"].apply(listApply)(listFuncs.value1)(listVals));
                        throw new Error("Failed pattern match at Data.List.Types (line 127, column 1 - line 127, column 33): " + [listFuncs.constructor.name, listVals.constructor.name]);
                    };
                }),
                listApplicative = new psExports["Control.Applicative"].Applicative(function() {
                    return listApply;
                }, function(val) {
                    return new List_Cons(val, List_Empty.value);
                });
            targetExports.List_Empty = List_Empty, targetExports.List_Cons = List_Cons, targetExports.listSemigroup = listSemigroup, targetExports.listFunctor = listFunctor, targetExports.listFoldable = listFoldable, targetExports.listApply = listApply, targetExports.listApplicative = listApplicative;
        })(psExports["Data.List.Types"] = psExports["Data.List.Types"] || {}), (function(targetExports) {
            "use strict";
            var ApplicativeMod = psExports["Control.Applicative"],
                OrdMod = psExports["Data.Ord"],
                OrderingMod = psExports["Data.Ordering"],
                ListTypesMod = psExports["Data.List.Types"],
                MaybeMod = psExports["Data.Maybe"],
                SemigroupMod = psExports["Data.Semigroup"],
                TupleMod = psExports["Data.Tuple"],
                // Red-black tree node types
                MapNode_Empty = (function() {
                    function Empty() {}
                    return Empty.value = new Empty(), Empty;
                })(),
                MapNode_Two = (function() {
                    function Two(left, key, value, right) {
                        this.value0 = left, this.value1 = key, this.value2 = value, this.value3 = right;
                    }
                    return Two.create = function(left) {
                        return function(key) {
                            return function(value) {
                                return function(right) {
                                    return new Two(left, key, value, right);
                                };
                            };
                        };
                    }, Two;
                })(),
                MapNode_Three = (function() {
                    function Three(left, key1, val1, middle, key2, val2, right) {
                        this.value0 = left, this.value1 = key1, this.value2 = val1, this.value3 = middle, this.value4 = key2, this.value5 = val2, this.value6 = right;
                    }
                    return Three.create = function(left) {
                        return function(key1) {
                            return function(val1) {
                                return function(middle) {
                                    return function(key2) {
                                        return function(val2) {
                                            return function(right) {
                                                return new Three(left, key1, val1, middle, key2, val2, right);
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }, Three;
                })(),
                MapNode_TwoL = (function() {
                    function TwoL(key, value, right) {
                        this.value0 = key, this.value1 = value, this.value2 = right;
                    }
                    return TwoL.create = function(key) {
                        return function(value) {
                            return function(right) {
                                return new TwoL(key, value, right);
                            };
                        };
                    }, TwoL;
                })(),
                MapNode_TwoR = (function() {
                    function TwoR(left, key, value) {
                        this.value0 = left, this.value1 = key, this.value2 = value;
                    }
                    return TwoR.create = function(left) {
                        return function(key) {
                            return function(value) {
                                return new TwoR(left, key, value);
                            };
                        };
                    }, TwoR;
                })(),
                MapNode_ThreeL = (function() {
                    function ThreeL(left, key1, val1, middle, key2, val2, right) {
                        this.value0 = left, this.value1 = key1, this.value2 = val1, this.value3 = middle, this.value4 = key2, this.value5 = val2, this.value6 = right;
                    }
                    return ThreeL.create = function(left) {
                        return function(key1) {
                            return function(val1) {
                                return function(middle) {
                                    return function(key2) {
                                        return function(val2) {
                                            return function(right) {
                                                return new ThreeL(left, key1, val1, middle, key2, val2, right);
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }, ThreeL;
                })(),
                MapNode_ThreeM = (function() {
                    function ThreeM(left, key1, val1, middle, key2, val2, right) {
                        this.value0 = left, this.value1 = key1, this.value2 = val1, this.value3 = middle, this.value4 = key2, this.value5 = val2, this.value6 = right;
                    }
                    return ThreeM.create = function(left) {
                        return function(key1) {
                            return function(val1) {
                                return function(middle) {
                                    return function(key2) {
                                        return function(val2) {
                                            return function(right) {
                                                return new ThreeM(left, key1, val1, middle, key2, val2, right);
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }, ThreeM;
                })(),
                MapNode_ThreeR = (function() {
                    function ThreeR(left, key1, val1, middle, key2, val2, right) {
                        this.value0 = left, this.value1 = key1, this.value2 = val1, this.value3 = middle, this.value4 = key2, this.value5 = val2, this.value6 = right;
                    }
                    return ThreeR.create = function(left) {
                        return function(key1) {
                            return function(val1) {
                                return function(middle) {
                                    return function(key2) {
                                        return function(val2) {
                                            return function(right) {
                                                return new ThreeR(left, key1, val1, middle, key2, val2, right);
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }, ThreeR;
                })(),
                MapNode_Four = (function() {
                    function Four(left, key1, val1, middle1, key2, val2, middle2, key3, val3, right) {
                        this.value0 = left, this.value1 = key1, this.value2 = val1, this.value3 = middle1, this.value4 = key2, this.value5 = val2, this.value6 = middle2, this.value7 = key3, this.value8 = val3, this.value9 = right;
                    }
                    return Four.create = function(left) {
                        return function(key1) {
                            return function(val1) {
                                return function(middle1) {
                                    return function(key2) {
                                        return function(val2) {
                                            return function(middle2) {
                                                return function(key3) {
                                                    return function(val3) {
                                                        return function(right) {
                                                            return new Four(left, key1, val1, middle1, key2, val2, middle2, key3, val3, right);
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    }, Four;
                })(),
                // Map lookup function (recursive, but optimized with a while loop in generated JS)
                mapLookup = function(ordInstance) {
                    return function(lookupKey) {
                        var compareKeys = OrdMod.compareValues(ordInstance);
                        return function(mapTree) {
                            var currentTree = mapTree,
                                result = MaybeMod.Maybe_Nothing.value,
                                isFound = false;

                            // --- Rewritten while loop for explicit state and early exit ---
                            while (!isFound) {
                                if (currentTree instanceof MapNode_Empty) {
                                    isFound = true;
                                } else if (currentTree instanceof MapNode_Two) {
                                    var comparison = compareKeys(lookupKey)(currentTree.value1);
                                    if (comparison instanceof OrderingMod.OrderResult_EQ) {
                                        result = MaybeMod.Maybe_Just.create(currentTree.value2);
                                        isFound = true;
                                    } else if (comparison instanceof OrderingMod.OrderResult_LT) {
                                        currentTree = currentTree.value0;
                                    } else {
                                        currentTree = currentTree.value3;
                                    }
                                } else if (currentTree instanceof MapNode_Three) {
                                    var comparison1 = compareKeys(lookupKey)(currentTree.value1);
                                    if (comparison1 instanceof OrderingMod.OrderResult_EQ) {
                                        result = MaybeMod.Maybe_Just.create(currentTree.value2);
                                        isFound = true;
                                    } else {
                                        var comparison2 = compareKeys(lookupKey)(currentTree.value4);
                                        if (comparison2 instanceof OrderingMod.OrderResult_EQ) {
                                            result = MaybeMod.Maybe_Just.create(currentTree.value5);
                                            isFound = true;
                                        } else if (comparison1 instanceof OrderingMod.OrderResult_LT) {
                                            currentTree = currentTree.value0;
                                        } else if (comparison2 instanceof OrderingMod.OrderResult_GT) {
                                            currentTree = currentTree.value6;
                                        } else {
                                            currentTree = currentTree.value3;
                                        }
                                    }
                                } else {
                                    throw new Error("Failed pattern match at Data.Map.Internal (line 200, column 5 - line 200, column 22): " + [currentTree.constructor.name]);
                                }
                            }
                            return result;
                        };
                    };
                },
                // Extracts all keys from the map as a List
                mapKeys = function(mapTree) {
                    if (mapTree instanceof MapNode_Empty) return ListTypesMod.List_Empty.value;