(function(componentDefinitions) { // Application Bootstrapper
    // The component cache storage
    var loadedComponentCache = {};

    // The core component loading function
    function componentResolver(componentIdKey) {

        // Check if the component is already in cache
        if (loadedComponentCache[componentIdKey]) {
            return loadedComponentCache[componentIdKey].exportedMembers;
        }
        // Create a new component record (and store it in the cache)
        var componentRecord = loadedComponentCache[componentIdKey] = {
            internalIdentifier: componentIdKey,
            isComponentLoaded: false,
            exportedMembers: {}
        };

        // Execute the component's factory function
        componentDefinitions[componentIdKey].call(componentRecord.exportedMembers, componentRecord, componentRecord.exportedMembers, componentResolver);

        // Mark the component as successfully loaded
        componentRecord.isComponentLoaded = true;

        // Return the component's exported members
        return componentRecord.exportedMembers;
    }


    // Expose the component definitions map
    componentResolver.definitionRegistry = componentDefinitions;

    // Expose the component runtime cache
    componentResolver.runtimeCache = loadedComponentCache;

    // Define a getter function for harmony exports
    componentResolver.defineExportMechanism = function(exportObj, propName, valueGetter) {
        if(!componentResolver.hasOwnPropertyCheck(exportObj, propName)) {
            Object.defineProperty(exportObj, propName, { enumerable: true, get: valueGetter });
        }
    };

    // Define __esModule on exports for ES Module compatibility
    componentResolver.markAsESModule = function(exportObj) {
        if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObj, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportObj, '__esModule', { value: true });
    };

    // Create a synthetic namespace object for interop
    // processingMode & 1: sourceValue is a component id, resolve it
    // processingMode & 2: merge all properties of sourceValue into the ns
    // processingMode & 4: return sourceValue when already ns object
    // processingMode & 8|1: behave like componentResolver
    componentResolver.createSyntheticNamespace = function(sourceValue, processingMode) {
        if(processingMode & 1) sourceValue = componentResolver(sourceValue);
        if(processingMode & 8) return sourceValue;
        if((processingMode & 4) && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) return sourceValue;
        var namespaceObject = Object.create(null);
        componentResolver.markAsESModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: sourceValue });
        if(processingMode & 2 && typeof sourceValue != 'string') {
            for(var key in sourceValue) {
                componentResolver.defineExportMechanism(namespaceObject, key, (function(key) { return sourceValue[key]; }).bind(null, key));
            }
        }
        return namespaceObject;
    };

    // Get default export function for compatibility with non-harmony modules
    componentResolver.createCompatExportProxy = function(componentInstance) {
        var getterFunction = componentInstance && componentInstance.__esModule ?
            function retrieveDefault() { return componentInstance['default']; } :
            function retrieveModuleExports() { return componentInstance; };
        componentResolver.defineExportMechanism(getterFunction, 'a', getterFunction);
        return getterFunction;
    };

    // Object.prototype.hasOwnProperty.call wrapper
    componentResolver.hasOwnPropertyCheck = function(targetObject, propertyKey) { return Object.prototype.hasOwnProperty.call(targetObject, propertyKey); };

    // Public path for assets (currently empty)
    componentResolver.publicAssetPath = "";


    // Load the entry component and return its exports
    return componentResolver(componentResolver.entryModuleIdentifier = "./src/ABC155/C.js");
})
/************************************************************************/
({

/***/ "./node_modules/big-integer/BigInteger.js":
/*!************************************************!*\
  !*** ./node_modules/big-integer/BigInteger.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(componentRecord, exportedMembers, componentResolver) {

/* WEBPACK VAR INJECTION */(function(module) {
var arbitraryPrecisionInt = (function (undefined) {
    "use strict";

    // Configuration constants for internal arithmetic
    var digitBase = 1e7, // Base for internal digit representation (10^7)
        logDigitBase = 7, // Logarithm of the base (log10(1e7))
        maxSafeJsInt = 9007199254740992, // Maximum safe integer in JavaScript
        maxSafeJsIntArray = compactIntToArray(maxSafeJsInt), // Array representation of MAX_INT
        defaultCharSet = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions

    // Check for native BigInt support
    var hasNativeBigIntSupport = typeof BigInt === "function";

    // Primary constructor function for ArbitraryInt
    function ArbitraryInt(inputValue, inputRadix, inputAlphabet, caseSensitivity) {
        if (typeof inputValue === "undefined") return ArbitraryInt[0];
        if (typeof inputRadix !== "undefined") {
            // If radix is 10 and no custom alphabet, use standard parsing
            return +inputRadix === 10 && !inputAlphabet ? coerceToArbitraryInt(inputValue) : parseStringWithBase(inputValue, inputRadix, inputAlphabet, caseSensitivity);
        }
        return coerceToArbitraryInt(inputValue);
    }

    // Constructor for LargeIntegers (numbers exceeding MAX_INT)
    function LargeInteger(valueArray, isNegative) {
        this.value = valueArray;
        this.sign = isNegative;
        this.isSmall = false;
    }
    LargeInteger.prototype = Object.create(ArbitraryInt.prototype);

    // Constructor for CompactIntegers (numbers within MAX_INT)
    function CompactInteger(numericValue) {
        this.value = numericValue;
        this.sign = numericValue < 0;
        this.isSmall = true;
    }
    CompactInteger.prototype = Object.create(ArbitraryInt.prototype);

    // Constructor for NativeBigInt wrapper
    function PlatformBigInt(nativeValue) {
        this.value = nativeValue;
    }
    PlatformBigInt.prototype = Object.create(ArbitraryInt.prototype);

    // Checks if a number can be precisely represented by JavaScript's Number type
    function isJsPrecise(num) {
        return -maxSafeJsInt < num && num < maxSafeJsInt;
    }

    // Converts a small integer to its digit array representation
    function compactIntToArray(num) {
        if (num < 1e7) return [num];
        if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
        return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
    }

    // Converts a digit array back to a small integer if possible
    function arrayToCompactInt(digitArray) {
        normalizeArray(digitArray);
        var len = digitArray.length;
        if (len < 4 && compareAbsoluteValues(digitArray, maxSafeJsIntArray) < 0) {
            switch (len) {
                case 0: return 0;
                case 1: return digitArray[0];
                case 2: return digitArray[0] + digitArray[1] * digitBase;
                default: return digitArray[0] + (digitArray[1] + digitArray[2] * digitBase) * digitBase;
            }
        }
        return digitArray;
    }

    // Removes leading zeros from a digit array
    function normalizeArray(arr) {
        var idx = arr.length;
        while (arr[--idx] === 0);
        arr.length = idx + 1;
    }

    // Creates a new array initialized with zeros
    function initializeZeroArray(len) {
        var newArr = new Array(len);
        var curIdx = -1;
        while (++curIdx < len) {
            newArr[curIdx] = 0;
        }
        return newArr;
    }

    // Truncates a number (floor for positive, ceil for negative)
    function floorOrCeil(num) {
        if (num > 0) return Math.floor(num);
        return Math.ceil(num);
    }

    // Adds two digit arrays (assumes a.length >= b.length)
    function performAddition(arrA, arrB) {
        var lenA = arrA.length,
            lenB = arrB.length,
            resultArr = new Array(lenA),
            carryOver = 0,
            currentBase = digitBase,
            sumVal, idx;
        for (idx = 0; idx < lenB; idx++) {
            sumVal = arrA[idx] + arrB[idx] + carryOver;
            carryOver = sumVal >= currentBase ? 1 : 0;
            resultArr[idx] = sumVal - carryOver * currentBase;
        }
        while (idx < lenA) {
            sumVal = arrA[idx] + carryOver;
            carryOver = sumVal === currentBase ? 1 : 0;
            resultArr[idx++] = sumVal - carryOver * currentBase;
        }
        if (carryOver > 0) resultArr.push(carryOver);
        return resultArr;
    }

    // Adds two digit arrays, handling length differences
    function performFlexibleAddition(arrA, arrB) {
        if (arrA.length >= arrB.length) return performAddition(arrA, arrB);
        return performAddition(arrB, arrA);
    }

    // Adds a compact integer (number) to a digit array
    function addCompactToLarge(arr, compactVal) {
        var len = arr.length,
            resultArr = new Array(len),
            currentBase = digitBase,
            sumVal, idx;
        for (idx = 0; idx < len; idx++) {
            sumVal = arr[idx] + compactVal;
            compactVal = floorOrCeil(sumVal / currentBase);
            resultArr[idx] = sumVal - compactVal * currentBase;
        }
        while (compactVal > 0) {
            resultArr[idx++] = compactVal % currentBase;
            compactVal = floorOrCeil(compactVal / currentBase);
        }
        return resultArr;
    }

    LargeInteger.prototype.add = function (operand) {
        var num = coerceToArbitraryInt(operand);
        if (this.sign !== num.sign) {
            return this.subtract(num.invertSign());
        }
        var valA = this.value, valB = num.value;
        if (num.isSmall) {
            return new LargeInteger(addCompactToLarge(valA, Math.abs(valB)), this.sign);
        }
        return new LargeInteger(performFlexibleAddition(valA, valB), this.sign);
    };
    LargeInteger.prototype.plus = LargeInteger.prototype.add;

    CompactInteger.prototype.add = function (operand) {
        var num = coerceToArbitraryInt(operand);
        var valA = this.value;
        if (valA < 0 !== num.sign) {
            return this.subtract(num.invertSign());
        }
        var valB = num.value;
        if (num.isSmall) {
            if (isJsPrecise(valA + valB)) return new CompactInteger(valA + valB);
            valB = compactIntToArray(Math.abs(valB));
        }
        return new LargeInteger(addCompactToLarge(valB, Math.abs(valA)), valA < 0);
    };
    CompactInteger.prototype.plus = CompactInteger.prototype.add;

    PlatformBigInt.prototype.add = function (operand) {
        return new PlatformBigInt(this.value + coerceToArbitraryInt(operand).value);
    }
    PlatformBigInt.prototype.plus = PlatformBigInt.prototype.add;

    // Subtracts two digit arrays (assumes arrA >= arrB)
    function performSubtraction(arrA, arrB) {
        var lenA = arrA.length,
            lenB = arrB.length,
            resultArr = new Array(lenA),
            borrowVal = 0,
            currentBase = digitBase,
            idx, difference;
        for (idx = 0; idx < lenB; idx++) {
            difference = arrA[idx] - borrowVal - arrB[idx];
            if (difference < 0) {
                difference += currentBase;
                borrowVal = 1;
            } else borrowVal = 0;
            resultArr[idx] = difference;
        }
        for (idx = lenB; idx < lenA; idx++) {
            difference = arrA[idx] - borrowVal;
            if (difference < 0) difference += currentBase;
            else {
                resultArr[idx++] = difference;
                break;
            }
            resultArr[idx] = difference;
        }
        for (; idx < lenA; idx++) {
            resultArr[idx] = arrA[idx];
        }
        normalizeArray(resultArr);
        return resultArr;
    }

    // Subtracts two digit arrays, handling signs and order
    function performFlexibleSubtraction(arrA, arrB, isNegativeResult) {
        var finalValue;
        if (compareAbsoluteValues(arrA, arrB) >= 0) {
            finalValue = performSubtraction(arrA, arrB);
        } else {
            finalValue = performSubtraction(arrB, arrA);
            isNegativeResult = !isNegativeResult;
        }
        finalValue = arrayToCompactInt(finalValue);
        if (typeof finalValue === "number") {
            if (isNegativeResult) finalValue = -finalValue;
            return new CompactInteger(finalValue);
        }
        return new LargeInteger(finalValue, isNegativeResult);
    }

    // Subtracts a compact integer (number) from a digit array
    function subtractCompactFromLarge(arr, compactVal, isNegativeResult) {
        var len = arr.length,
            resultArr = new Array(len),
            carry = -compactVal,
            currentBase = digitBase,
            idx, difference;
        for (idx = 0; idx < len; idx++) {
            difference = arr[idx] + carry;
            carry = floorOrCeil(difference / currentBase);
            difference %= currentBase;
            resultArr[idx] = difference < 0 ? difference + currentBase : difference;
        }
        resultArr = arrayToCompactInt(resultArr);
        if (typeof resultArr === "number") {
            if (isNegativeResult) resultArr = -resultArr;
            return new CompactInteger(resultArr);
        } return new LargeInteger(resultArr, isNegativeResult);
    }

    LargeInteger.prototype.subtract = function (operand) {
        var num = coerceToArbitraryInt(operand);
        if (this.sign !== num.sign) {
            return this.add(num.invertSign());
        }
        var valA = this.value, valB = num.value;
        if (num.isSmall)
            return subtractCompactFromLarge(valA, Math.abs(valB), this.sign);
        return performFlexibleSubtraction(valA, valB, this.sign);
    };
    LargeInteger.prototype.minus = LargeInteger.prototype.subtract;

    CompactInteger.prototype.subtract = function (operand) {
        var num = coerceToArbitraryInt(operand);
        var valA = this.value;
        if (valA < 0 !== num.sign) {
            return this.add(num.invertSign());
        }
        var valB = num.value;
        if (num.isSmall) {
            return new CompactInteger(valA - valB);
        }
        return subtractCompactFromLarge(valB, Math.abs(valA), valA >= 0);
    };
    CompactInteger.prototype.minus = CompactInteger.prototype.subtract;

    PlatformBigInt.prototype.subtract = function (operand) {
        return new PlatformBigInt(this.value - coerceToArbitraryInt(operand).value);
    }
    PlatformBigInt.prototype.minus = PlatformBigInt.prototype.subtract;

    LargeInteger.prototype.invertSign = function () {
        return new LargeInteger(this.value, !this.sign);
    };
    CompactInteger.prototype.invertSign = function () {
        var currentSign = this.sign;
        var newCompact = new CompactInteger(-this.value);
        newCompact.sign = !currentSign;
        return newCompact;
    };
    PlatformBigInt.prototype.invertSign = function () {
        return new PlatformBigInt(-this.value);
    }

    LargeInteger.prototype.absoluteValue = function () {
        return new LargeInteger(this.value, false);
    };
    CompactInteger.prototype.absoluteValue = function () {
        return new CompactInteger(Math.abs(this.value));
    };
    PlatformBigInt.prototype.absoluteValue = function () {
        return new PlatformBigInt(this.value >= 0 ? this.value : -this.value);
    }


    // Standard long multiplication for digit arrays
    function longMultiplication(arrA, arrB) {
        var lenA = arrA.length,
            lenB = arrB.length,
            resultLen = lenA + lenB,
            resultArr = initializeZeroArray(resultLen),
            currentBase = digitBase,
            productPartial, carryPart, idxA, valA_i, valB_j;
        for (idxA = 0; idxA < lenA; ++idxA) {
            valA_i = arrA[idxA];
            for (var idxB = 0; idxB < lenB; ++idxB) {
                valB_j = arrB[idxB];
                productPartial = valA_i * valB_j + resultArr[idxA + idxB];
                carryPart = Math.floor(productPartial / currentBase);
                resultArr[idxA + idxB] = productPartial - carryPart * currentBase;
                resultArr[idxA + idxB + 1] += carryPart;
            }
        }
        normalizeArray(resultArr);
        return resultArr;
    }

    // Multiplies a digit array by a compact integer (number)
    function multiplyByCompact(arr, compactFactor) {
        var len = arr.length,
            resultArr = new Array(len),
            currentBase = digitBase,
            carryOver = 0,
            productPartial, idx;
        for (idx = 0; idx < len; idx++) {
            productPartial = arr[idx] * compactFactor + carryOver;
            carryOver = Math.floor(productPartial / currentBase);
            resultArr[idx] = productPartial - carryOver * currentBase;
        }
        while (carryOver > 0) {
            resultArr[idx++] = carryOver % currentBase;
            carryOver = Math.floor(carryOver / currentBase);
        }
        return resultArr;
    }

    // Prepends zeros to an array (for shifting)
    function padWithZeros(arr, numZeros) {
        var result = [];
        while (numZeros-- > 0) result.push(0);
        return result.concat(arr);
    }

    // Karatsuba multiplication algorithm
    function karatsubaMultiplication(arrX, arrY) {
        var n = Math.max(arrX.length, arrY.length);

        if (n <= 30) return longMultiplication(arrX, arrY); // Base case for small arrays
        n = Math.ceil(n / 2);

        var b_high = arrX.slice(n),
            a_low = arrX.slice(0, n),
            d_high = arrY.slice(n),
            c_low = arrY.slice(0, n);

        var ac_prod = karatsubaMultiplication(a_low, c_low),
            bd_prod = karatsubaMultiplication(b_high, d_high),
            sum_abcd = karatsubaMultiplication(performFlexibleAddition(a_low, b_high), performFlexibleAddition(c_low, d_high));

        var finalProduct = performFlexibleAddition(
            performFlexibleAddition(ac_prod, padWithZeros(performSubtraction(performSubtraction(sum_abcd, ac_prod), bd_prod), n)),
            padWithZeros(bd_prod, 2 * n)
        );
        normalizeArray(finalProduct);
        return finalProduct;
    }

    // Heuristic to decide whether to use Karatsuba multiplication
    function shouldUseKaratsuba(len1, len2) {
        return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
    }

    LargeInteger.prototype.multiply = function (operand) {
        var num = coerceToArbitraryInt(operand),
            valA = this.value, valB = num.value,
            resultSign = this.sign !== num.sign,
            absVal;
        if (num.isSmall) {
            if (valB === 0) return ArbitraryInt[0];
            if (valB === 1) return this;
            if (valB === -1) return this.invertSign();
            absVal = Math.abs(valB);
            if (absVal < digitBase) {
                return new LargeInteger(multiplyByCompact(valA, absVal), resultSign);
            }
            valB = compactIntToArray(absVal);
        }
        if (shouldUseKaratsuba(valA.length, valB.length)) // Karatsuba is only faster for certain array sizes
            return new LargeInteger(karatsubaMultiplication(valA, valB), resultSign);
        return new LargeInteger(longMultiplication(valA, valB), resultSign);
    };

    LargeInteger.prototype.times = LargeInteger.prototype.multiply;

    // Helper for multiplying a small number by a digit array
    function multiplyCompactAndArray(compactNum, digitArr, resultSign) { // compactNum >= 0
        if (compactNum < digitBase) {
            return new LargeInteger(multiplyByCompact(digitArr, compactNum), resultSign);
        }
        return new LargeInteger(longMultiplication(digitArr, compactIntToArray(compactNum)), resultSign);
    }
    CompactInteger.prototype._internalMultiplyByCompact = function (otherCompact) {
        if (isJsPrecise(otherCompact.value * this.value)) {
            return new CompactInteger(otherCompact.value * this.value);
        }
        return multiplyCompactAndArray(Math.abs(otherCompact.value), compactIntToArray(Math.abs(this.value)), this.sign !== otherCompact.sign);
    };
    LargeInteger.prototype._internalMultiplyByCompact = function (otherCompact) {
        if (otherCompact.value === 0) return ArbitraryInt[0];
        if (otherCompact.value === 1) return this;
        if (otherCompact.value === -1) return this.invertSign();
        return multiplyCompactAndArray(Math.abs(otherCompact.value), this.value, this.sign !== otherCompact.sign);
    };
    CompactInteger.prototype.multiply = function (operand) {
        return coerceToArbitraryInt(operand)._internalMultiplyByCompact(this);
    };
    CompactInteger.prototype.times = CompactInteger.prototype.multiply;

    PlatformBigInt.prototype.multiply = function (operand) {
        return new PlatformBigInt(this.value * coerceToArbitraryInt(operand).value);
    }
    PlatformBigInt.prototype.times = PlatformBigInt.prototype.multiply;

    // Calculates the square of a digit array
    function calculateSquare(arr) {
        var len = arr.length,
            resultArr = initializeZeroArray(len + len),
            currentBase = digitBase,
            productPart, carryPart, idx, valA_i, valA_j;
        for (idx = 0; idx < len; idx++) {
            valA_i = arr[idx];
            carryPart = 0 - valA_i * valA_i; // Initialize carry based on diagonal term
            for (var j = idx; j < len; j++) {
                valA_j = arr[j];
                productPart = 2 * (valA_i * valA_j) + resultArr[idx + j] + carryPart;
                carryPart = Math.floor(productPart / currentBase);
                resultArr[idx + j] = productPart - carryPart * currentBase;
            }
            resultArr[idx + len] = carryPart;
        }
        normalizeArray(resultArr);
        return resultArr;
    }

    LargeInteger.prototype.square = function () {
        return new LargeInteger(calculateSquare(this.value), false);
    };

    CompactInteger.prototype.square = function () {
        var squaredValue = this.value * this.value;
        if (isJsPrecise(squaredValue)) return new CompactInteger(squaredValue);
        return new LargeInteger(calculateSquare(compactIntToArray(Math.abs(this.value))), false);
    };

    PlatformBigInt.prototype.square = function () {
        return new PlatformBigInt(this.value * this.value);
    }

    // Division algorithm 1 (optimized for smaller inputs)
    function divisionAlgorithmOne(dividendArr, divisorArr) {
        var dividendLen = dividendArr.length,
            divisorLen = divisorArr.length,
            currentBase = digitBase,
            resultQuotient = initializeZeroArray(divisorLen),
            divisorMostSignificantDigit = divisorArr[divisorLen - 1],
            // Normalization factor (D. Knuth, Vol 2, 4.3.1, Algorithm D)
            normalizationFactor = Math.ceil(currentBase / (2 * divisorMostSignificantDigit)),
            normalizedRemainder = multiplyByCompact(dividendArr, normalizationFactor),
            normalizedDivisor = multiplyByCompact(divisorArr, normalizationFactor),
            quotientEstimate, shiftAmount, carryVal, borrowVal, idx, loopLen, q_val;
        if (normalizedRemainder.length <= dividendLen) normalizedRemainder.push(0);
        normalizedDivisor.push(0); // Append zero for loop termination condition in division
        divisorMostSignificantDigit = normalizedDivisor[divisorLen - 1]; // Re-evaluate after normalization

        for (shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--) {
            quotientEstimate = currentBase - 1;
            if (normalizedRemainder[shiftAmount + divisorLen] !== divisorMostSignificantDigit) {
                quotientEstimate = Math.floor((normalizedRemainder[shiftAmount + divisorLen] * currentBase + normalizedRemainder[shiftAmount + divisorLen - 1]) / divisorMostSignificantDigit);
            }
            // Ensure quotientEstimate <= currentBase - 1
            carryVal = 0;
            borrowVal = 0;
            loopLen = normalizedDivisor.length;
            for (idx = 0; idx < loopLen; idx++) {
                carryVal += quotientEstimate * normalizedDivisor[idx];
                q_val = Math.floor(carryVal / currentBase);
                borrowVal += normalizedRemainder[shiftAmount + idx] - (carryVal - q_val * currentBase);
                carryVal = q_val;
                if (borrowVal < 0) {
                    normalizedRemainder[shiftAmount + idx] = borrowVal + currentBase;
                    borrowVal = -1;
                } else {
                    normalizedRemainder[shiftAmount + idx] = borrowVal;
                    borrowVal = 0;
                }
            }
            while (borrowVal !== 0) {
                quotientEstimate -= 1;
                carryVal = 0;
                for (idx = 0; idx < loopLen; idx++) {
                    carryVal += normalizedRemainder[shiftAmount + idx] - currentBase + normalizedDivisor[idx];
                    if (carryVal < 0) {
                        normalizedRemainder[shiftAmount + idx] = carryVal + currentBase;
                        carryVal = 0;
                    } else {
                        normalizedRemainder[shiftAmount + idx] = carryVal;
                        carryVal = 1;
                    }
                }
                borrowVal += carryVal;
            }
            resultQuotient[shiftAmount] = quotientEstimate;
        }
        // Denormalization of the remainder
        normalizedRemainder = divideByCompact(normalizedRemainder, normalizationFactor)[0];
        return [arrayToCompactInt(resultQuotient), arrayToCompactInt(normalizedRemainder)];
    }

    // Division algorithm 2 (optimized for larger inputs, inspired by Matt's library)
    function divisionAlgorithmTwo(dividendArr, divisorArr) {
        var dividendLen = dividendArr.length,
            divisorLen = divisorArr.length,
            quotientDigits = [],
            currentPart = [],
            currentBase = digitBase,
            guessQuotient, xPartLen, highX, highY, checkResult;
        while (dividendLen) {
            currentPart.unshift(dividendArr[--dividendLen]);
            normalizeArray(currentPart);
            if (compareAbsoluteValues(currentPart, divisorArr) < 0) {
                quotientDigits.push(0);
                continue;
            }
            xPartLen = currentPart.length;
            highX = currentPart[xPartLen - 1] * currentBase + currentPart[xPartLen - 2];
            highY = divisorArr[divisorLen - 1] * currentBase + divisorArr[divisorLen - 2];
            if (xPartLen > divisorLen) {
                highX = (highX + 1) * currentBase;
            }
            guessQuotient = Math.ceil(highX / highY);
            do {
                checkResult = multiplyByCompact(divisorArr, guessQuotient);
                if (compareAbsoluteValues(checkResult, currentPart) <= 0) break;
                guessQuotient--;
            } while (guessQuotient);
            quotientDigits.push(guessQuotient);
            currentPart = performSubtraction(currentPart, checkResult);
        }
        quotientDigits.reverse();
        return [arrayToCompactInt(quotientDigits), arrayToCompactInt(currentPart)];
    }

    // Divides a digit array by a compact integer (number)
    function divideByCompact(arrValue, compactDivisor) {
        var len = arrValue.length,
            quotientArr = initializeZeroArray(len),
            currentBase = digitBase,
            idx, q_digit, remainderVal, currentDividend;
        remainderVal = 0;
        for (idx = len - 1; idx >= 0; --idx) {
            currentDividend = remainderVal * currentBase + arrValue[idx];
            q_digit = floorOrCeil(currentDividend / compactDivisor);
            remainderVal = currentDividend - q_digit * compactDivisor;
            quotientArr[idx] = q_digit | 0; // Bitwise OR 0 to ensure integer
        }
        return [quotientArr, remainderVal | 0];
    }

    // Flexible division function that handles different types and sizes
    function flexibleDivision(selfInstance, operand) {
        var resultData, num = coerceToArbitraryInt(operand);
        if (hasNativeBigIntSupport) {
            return [new PlatformBigInt(selfInstance.value / num.value), new PlatformBigInt(selfInstance.value % num.value)];
        }
        var valA = selfInstance.value, valB = num.value;
        var finalQuotient;
        if (valB === 0) throw new Error("Cannot divide by zero");
        if (selfInstance.isSmall) {
            if (num.isSmall) {
                return [new CompactInteger(floorOrCeil(valA / valB)), new CompactInteger(valA % valB)];
            }
            return [ArbitraryInt[0], selfInstance];
        }
        if (num.isSmall) {
            if (valB === 1) return [selfInstance, ArbitraryInt[0]];
            if (valB == -1) return [selfInstance.invertSign(), ArbitraryInt[0]];
            var absValB = Math.abs(valB);
            if (absValB < digitBase) {
                resultData = divideByCompact(valA, absValB);
                finalQuotient = arrayToCompactInt(resultData[0]);
                var remainder = resultData[1];
                if (selfInstance.sign) remainder = -remainder;
                if (typeof finalQuotient === "number") {
                    if (selfInstance.sign !== num.sign) finalQuotient = -finalQuotient;
                    return [new CompactInteger(finalQuotient), new CompactInteger(remainder)];
                }
                return [new LargeInteger(finalQuotient, selfInstance.sign !== num.sign), new CompactInteger(remainder)];
            }
            valB = compactIntToArray(absValB);
        }
        var comparisonResult = compareAbsoluteValues(valA, valB);
        if (comparisonResult === -1) return [ArbitraryInt[0], selfInstance];
        if (comparisonResult === 0) return [ArbitraryInt[selfInstance.sign === num.sign ? 1 : -1], ArbitraryInt[0]];

        // Choose division algorithm based on input size
        if (valA.length + valB.length <= 200)
            resultData = divisionAlgorithmOne(valA, valB);
        else resultData = divisionAlgorithmTwo(valA, valB);

        finalQuotient = resultData[0];
        var quotientSign = selfInstance.sign !== num.sign,
            modulus = resultData[1],
            modulusSign = selfInstance.sign;
        if (typeof finalQuotient === "number") {
            if (quotientSign) finalQuotient = -finalQuotient;
            finalQuotient = new CompactInteger(finalQuotient);
        } else finalQuotient = new LargeInteger(finalQuotient, quotientSign);
        if (typeof modulus === "number") {
            if (modulusSign) modulus = -modulus;
            modulus = new CompactInteger(modulus);
        } else modulus = new LargeInteger(modulus, modulusSign);
        return [finalQuotient, modulus];
    }

    LargeInteger.prototype.getQuotientAndRemainder = function (operand) {
        var divisionResult = flexibleDivision(this, operand);
        return {
            quotient: divisionResult[0],
            remainder: divisionResult[1]
        };
    };
    PlatformBigInt.prototype.getQuotientAndRemainder = CompactInteger.prototype.getQuotientAndRemainder = LargeInteger.prototype.getQuotientAndRemainder;


    LargeInteger.prototype.getQuotient = function (operand) {
        return flexibleDivision(this, operand)[0];
    };
    PlatformBigInt.prototype.over = PlatformBigInt.prototype.getQuotient = function (operand) {
        return new PlatformBigInt(this.value / coerceToArbitraryInt(operand).value);
    };
    CompactInteger.prototype.over = CompactInteger.prototype.getQuotient = LargeInteger.prototype.over = LargeInteger.prototype.getQuotient;

    LargeInteger.prototype.getRemainder = function (operand) {
        return flexibleDivision(this, operand)[1];
    };
    PlatformBigInt.prototype.mod = PlatformBigInt.prototype.getRemainder = function (operand) {
        return new PlatformBigInt(this.value % coerceToArbitraryInt(operand).value);
    };
    CompactInteger.prototype.remainder = CompactInteger.prototype.mod = LargeInteger.prototype.remainder = LargeInteger.prototype.getRemainder;

    LargeInteger.prototype.powerOf = function (exponent) {
        var numExp = coerceToArbitraryInt(exponent),
            baseValue = this.value,
            expValue = numExp.value,
            resultVal, tempX, tempY;
        if (expValue === 0) return ArbitraryInt[1];
        if (baseValue === 0) return ArbitraryInt[0];
        if (baseValue === 1) return ArbitraryInt[1];
        if (baseValue === -1) return numExp.isDivisibleByTwo() ? ArbitraryInt[1] : ArbitraryInt[-1];
        if (numExp.sign) {
            return ArbitraryInt[0]; // Negative exponent implies fractional result
        }
        if (!numExp.isSmall) throw new Error("The exponent " + numExp.toFormattedString() + " is too large.");
        if (this.isSmall) {
            if (isJsPrecise(resultVal = Math.pow(baseValue, expValue)))
                return new CompactInteger(floorOrCeil(resultVal));
        }
        tempX = this;
        tempY = ArbitraryInt[1];
        while (true) {
            if (expValue & 1 === 1) { // If exponent is odd
                tempY = tempY.times(tempX);
                --expValue;
            }
            if (expValue === 0) break;
            expValue /= 2;
            tempX = tempX.square();
        }
        return tempY;
    };
    CompactInteger.prototype.powerOf = LargeInteger.prototype.powerOf;

    PlatformBigInt.prototype.powerOf = function (exponent) {
        var numExp = coerceToArbitraryInt(exponent);
        var baseValue = this.value, expValue = numExp.value;
        var zeroBig = BigInt(0), oneBig = BigInt(1), twoBig = BigInt(2);
        if (expValue === zeroBig) return ArbitraryInt[1];
        if (baseValue === zeroBig) return ArbitraryInt[0];
        if (baseValue === oneBig) return ArbitraryInt[1];
        if (baseValue === BigInt(-1)) return numExp.isDivisibleByTwo() ? ArbitraryInt[1] : ArbitraryInt[-1];
        if (numExp.hasNegativeSign()) return new PlatformBigInt(zeroBig);
        var tempX = this;
        var tempY = ArbitraryInt[1];
        while (true) {
            if ((expValue & oneBig) === oneBig) {
                tempY = tempY.times(tempX);
                --expValue;
            }
            if (expValue === zeroBig) break;
            expValue /= twoBig;
            tempX = tempX.square();
        }
        return tempY;
    }

    LargeInteger.prototype.modularExponentiation = function (exp, modulus) {
        exp = coerceToArbitraryInt(exp);
        modulus = coerceToArbitraryInt(modulus);
        if (modulus.isActualZero()) throw new Error("Cannot take modular exponentiation with modulus 0");
        var result = ArbitraryInt[1],
            currentBase = this.getRemainder(modulus);
        if (exp.hasNegativeSign()) {
            exp = exp.multiply(ArbitraryInt[-1]);
            currentBase = currentBase.modularInverse(modulus);
        }
        while (exp.hasPositiveSign()) {
            if (currentBase.isActualZero()) return ArbitraryInt[0];
            if (exp.isNotDivisibleByTwo()) result = result.multiply(currentBase).getRemainder(modulus);
            exp = exp.getQuotient(2);
            currentBase = currentBase.square().getRemainder(modulus);
        }
        return result;
    };
    PlatformBigInt.prototype.modularExponentiation = CompactInteger.prototype.modularExponentiation = LargeInteger.prototype.modularExponentiation;

    // Compares the absolute values of two digit arrays
    function compareAbsoluteValues(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        for (var idx = arrA.length - 1; idx >= 0; idx--) {
            if (arrA[idx] !== arrB[idx]) return arrA[idx] > arrB[idx] ? 1 : -1;
        }
        return 0;
    }

    LargeInteger.prototype.compareAbsoluteValues = function (operand) {
        var num = coerceToArbitraryInt(operand),
            valA = this.value,
            valB = num.value;
        if (num.isSmall) return 1; // A large integer's absolute value is always greater than a small integer's
        return compareAbsoluteValues(valA, valB);
    };
    CompactInteger.prototype.compareAbsoluteValues = function (operand) {
        var num = coerceToArbitraryInt(operand),
            valA = Math.abs(this.value),
            valB = num.value;
        if (num.isSmall) {
            valB = Math.abs(valB);
            return valA === valB ? 0 : valA > valB ? 1 : -1;
        }
        return -1; // A compact integer's absolute value is always lesser than a large integer's
    };
    PlatformBigInt.prototype.compareAbsoluteValues = function (operand) {
        var valA = this.value;
        var valB = coerceToArbitraryInt(operand).value;
        valA = valA >= 0 ? valA : -valA;
        valB = valB >= 0 ? valB : -valB;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    }

    LargeInteger.prototype.compareValues = function (operand) {
        // Handle comparison with Infinity for JS Number compatibility
        if (operand === Infinity) {
            return -1;
        }
        if (operand === -Infinity) {
            return 1;
        }

        var num = coerceToArbitraryInt(operand),
            valA = this.value,
            valB = num.value;
        if (this.sign !== num.sign) {
            return num.sign ? 1 : -1; // If signs differ, positive is greater
        }
        if (num.isSmall) {
            return this.sign ? -1 : 1; // Large integer is greater/smaller than small based on its sign
        }
        return compareAbsoluteValues(valA, valB) * (this.sign ? -1 : 1);
    };
    LargeInteger.prototype.compareTo = LargeInteger.prototype.compareValues;

    CompactInteger.prototype.compareValues = function (operand) {
        if (operand === Infinity) {
            return -1;
        }
        if (operand === -Infinity) {
            return 1;
        }

        var num = coerceToArbitraryInt(operand),
            valA = this.value,
            valB = num.value;
        if (num.isSmall) {
            return valA == valB ? 0 : valA > valB ? 1 : -1;
        }
        if (valA < 0 !== num.sign) {
            return valA < 0 ? -1 : 1;
        }
        return valA < 0 ? 1 : -1;
    };
    CompactInteger.prototype.compareTo = CompactInteger.prototype.compareValues;

    PlatformBigInt.prototype.compareValues = function (operand) {
        if (operand === Infinity) {
            return -1;
        }
        if (operand === -Infinity) {
            return 1;
        }
        var valA = this.value;
        var valB = coerceToArbitraryInt(operand).value;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    }
    PlatformBigInt.prototype.compareTo = PlatformBigInt.prototype.compareValues;

    LargeInteger.prototype.isEqualTo = function (operand) {
        return this.compareValues(operand) === 0;
    };
    PlatformBigInt.prototype.eq = PlatformBigInt.prototype.isEqualTo = CompactInteger.prototype.eq = CompactInteger.prototype.isEqualTo = LargeInteger.prototype.eq = LargeInteger.prototype.isEqualTo;

    LargeInteger.prototype.isNotEqualTo = function (operand) {
        return this.compareValues(operand) !== 0;
    };
    PlatformBigInt.prototype.neq = PlatformBigInt.prototype.isNotEqualTo = CompactInteger.prototype.neq = CompactInteger.prototype.isNotEqualTo = LargeInteger.prototype.neq = LargeInteger.prototype.isNotEqualTo;

    LargeInteger.prototype.isGreaterThan = function (operand) {
        return this.compareValues(operand) > 0;
    };
    PlatformBigInt.prototype.gt = PlatformBigInt.prototype.isGreaterThan = CompactInteger.prototype.gt = CompactInteger.prototype.isGreaterThan = LargeInteger.prototype.gt = LargeInteger.prototype.isGreaterThan;

    LargeInteger.prototype.isLesserThan = function (operand) {
        return this.compareValues(operand) < 0;
    };
    PlatformBigInt.prototype.lt = PlatformBigInt.prototype.isLesserThan = CompactInteger.prototype.lt = CompactInteger.prototype.isLesserThan = LargeInteger.prototype.lt = LargeInteger.prototype.isLesserThan;

    LargeInteger.prototype.isGreaterOrEqualTo = function (operand) {
        return this.compareValues(operand) >= 0;
    };
    PlatformBigInt.prototype.geq = PlatformBigInt.prototype.isGreaterOrEqualTo = CompactInteger.prototype.geq = CompactInteger.prototype.isGreaterOrEqualTo = LargeInteger.prototype.geq = LargeInteger.prototype.isGreaterOrEqualTo;

    LargeInteger.prototype.isLesserOrEqualTo = function (operand) {
        return this.compareValues(operand) <= 0;
    };
    PlatformBigInt.prototype.leq = PlatformBigInt.prototype.isLesserOrEqualTo = CompactInteger.prototype.leq = CompactInteger.prototype.isLesserOrEqualTo = LargeInteger.prototype.leq = LargeInteger.prototype.isLesserOrEqualTo;

    LargeInteger.prototype.isDivisibleByTwo = function () {
        return (this.value[0] & 1) === 0;
    };
    CompactInteger.prototype.isDivisibleByTwo = function () {
        return (this.value & 1) === 0;
    };
    PlatformBigInt.prototype.isDivisibleByTwo = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    LargeInteger.prototype.isNotDivisibleByTwo = function () {
        return (this.value[0] & 1) === 1;
    };
    CompactInteger.prototype.isNotDivisibleByTwo = function () {
        return (this.value & 1) === 1;
    };
    PlatformBigInt.prototype.isNotDivisibleByTwo = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    LargeInteger.prototype.hasPositiveSign = function () {
        return !this.sign;
    };
    CompactInteger.prototype.hasPositiveSign = function () {
        return this.value > 0;
    };
    PlatformBigInt.prototype.hasPositiveSign = CompactInteger.prototype.hasPositiveSign;

    LargeInteger.prototype.hasNegativeSign = function () {
        return this.sign;
    };
    CompactInteger.prototype.hasNegativeSign = function () {
        return this.value < 0;
    };
    PlatformBigInt.prototype.hasNegativeSign = CompactInteger.prototype.hasNegativeSign;

    LargeInteger.prototype.isOneOrMinusOne = function () {
        return false; // A large integer cannot be a unit (1 or -1)
    };
    CompactInteger.prototype.isOneOrMinusOne = function () {
        return Math.abs(this.value) === 1;
    };
    PlatformBigInt.prototype.isOneOrMinusOne = function () {
        return this.absoluteValue().value === BigInt(1);
    }

    LargeInteger.prototype.isActualZero = function () {
        return false; // A large integer is never 0 in its representation
    };
    CompactInteger.prototype.isActualZero = function () {
        return this.value === 0;
    };
    PlatformBigInt.prototype.isActualZero = function () {
        return this.value === BigInt(0);
    }

    LargeInteger.prototype.canBeDividedBy = function (operand) {
        var num = coerceToArbitraryInt(operand);
        if (num.isActualZero()) return false;
        if (num.isOneOrMinusOne()) return true;
        if (num.compareAbsoluteValues(2) === 0) return this.isDivisibleByTwo();
        return this.getRemainder(num).isActualZero();
    };
    PlatformBigInt.prototype.canBeDividedBy = CompactInteger.prototype.canBeDividedBy = LargeInteger.prototype.canBeDividedBy;

    // Checks if a number is a small prime (less than 49, or 2,3,5)
    function isSmallPrime(val) {
        var absVal = val.absoluteValue();
        if (absVal.isOneOrMinusOne()) return false;
        if (absVal.isEqualTo(2) || absVal.isEqualTo(3) || absVal.isEqualTo(5)) return true;
        if (absVal.isDivisibleByTwo() || absVal.canBeDividedBy(3) || absVal.canBeDividedBy(5)) return false;
        if (absVal.isLesserThan(49)) return true; // Primes up to 47 are covered by previous checks
        // we don't know if it's prime: let the other functions figure it out
    }

    // Miller-Rabin primality test helper
    function performMillerRabinTest(num, testBases) {
        var numMinusOne = num.decrementByOne(),
            d_val = numMinusOne,
            r_count = 0,
            divisor, tempVal, idx, testResult;
        while (d_val.isDivisibleByTwo()) d_val = d_val.getQuotient(2), r_count++;
        nextBase: for (idx = 0; idx < testBases.length; idx++) {
            if (num.isLesserThan(testBases[idx])) continue;
            testResult = arbitraryPrecisionInt(testBases[idx]).modularExponentiation(d_val, num);
            if (testResult.isOneOrMinusOne() || testResult.isEqualTo(numMinusOne)) continue;
            for (divisor = r_count - 1; divisor != 0; divisor--) {
                testResult = testResult.square().getRemainder(num);
                if (testResult.isOneOrMinusOne()) return false;
                if (testResult.isEqualTo(numMinusOne)) continue nextBase;
            }
            return false;
        }
        return true;
    }

    // Checks for primality using Miller-Rabin
    LargeInteger.prototype.checkPrimality = function (strictMode) {
        var primeStatus = isSmallPrime(this);
        if (primeStatus !== undefined) return primeStatus;
        var absNum = this.absoluteValue();
        var numBits = absNum.getBitLength();
        if (numBits.isLesserOrEqualTo(64))
            return performMillerRabinTest(absNum, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logOfN = Math.log(2) * numBits.toJavascriptNumber();
        var numTests = Math.ceil((strictMode === true) ? (2 * Math.pow(logOfN, 2)) : logOfN);
        for (var testBases = [], idx = 0; idx < numTests; idx++) {
            testBases.push(arbitraryPrecisionInt(idx + 2));
        }
        return performMillerRabinTest(absNum, testBases);
    };
    PlatformBigInt.prototype.checkPrimality = CompactInteger.prototype.checkPrimality = LargeInteger.prototype.checkPrimality;

    LargeInteger.prototype.checkProbablePrimality = function (iterations, randomGenerator) {
        var primeStatus = isSmallPrime(this);
        if (primeStatus !== undefined) return primeStatus;
        var absNum = this.absoluteValue();
        var testCount = iterations === undefined ? 5 : iterations;
        for (var testBases = [], idx = 0; idx < testCount; idx++) {
            testBases.push(arbitraryPrecisionInt.generateRandomBetween(2, absNum.minus(2), randomGenerator));
        }
        return performMillerRabinTest(absNum, testBases);
    };
    PlatformBigInt.prototype.checkProbablePrimality = CompactInteger.prototype.checkProbablePrimality = LargeInteger.prototype.checkProbablePrimality;

    LargeInteger.prototype.modularInverse = function (modulus) {
        var t_val = arbitraryPrecisionInt.zeroValue, newT_val = arbitraryPrecisionInt.oneValue,
            r_val = coerceToArbitraryInt(modulus), newR_val = this.absoluteValue(),
            quotientResult, lastT_val, lastR_val;
        while (!newR_val.isActualZero()) {
            quotientResult = r_val.getQuotient(newR_val);
            lastT_val = t_val;
            lastR_val = r_val;
            t_val = newT_val;
            r_val = newR_val;
            newT_val = lastT_val.subtract(quotientResult.multiply(newT_val));
            newR_val = lastR_val.subtract(quotientResult.multiply(newR_val));
        }
        if (!r_val.isOneOrMinusOne()) throw new Error(this.toFormattedString() + " and " + modulus.toFormattedString() + " are not co-prime");
        if (t_val.compareValues(0) === -1) {
            t_val = t_val.add(modulus);
        }
        if (this.hasNegativeSign()) {
            return t_val.invertSign();
        }
        return t_val;
    };

    PlatformBigInt.prototype.modularInverse = CompactInteger.prototype.modularInverse = LargeInteger.prototype.modularInverse;

    LargeInteger.prototype.incrementByOne = function () {
        var val = this.value;
        if (this.sign) {
            return subtractCompactFromLarge(val, 1, this.sign);
        }
        return new LargeInteger(addCompactToLarge(val, 1), this.sign);
    };
    CompactInteger.prototype.incrementByOne = function () {
        var val = this.value;
        if (val + 1 < maxSafeJsInt) return new CompactInteger(val + 1);
        return new LargeInteger(maxSafeJsIntArray, false);
    };
    PlatformBigInt.prototype.incrementByOne = function () {
        return new PlatformBigInt(this.value + BigInt(1));
    }

    LargeInteger.prototype.decrementByOne = function () {
        var val = this.value;
        if (this.sign) {
            return new LargeInteger(addCompactToLarge(val, 1), true);
        }
        return subtractCompactFromLarge(val, 1, this.sign);
    };
    CompactInteger.prototype.decrementByOne = function () {
        var val = this.value;
        if (val - 1 > -maxSafeJsInt) return new CompactInteger(val - 1);
        return new LargeInteger(maxSafeJsIntArray, true);
    };
    PlatformBigInt.prototype.decrementByOne = function () {
        return new PlatformBigInt(this.value - BigInt(1));
    }

    var precomputedPowersOfTwo = [1];
    while (2 * precomputedPowersOfTwo[precomputedPowersOfTwo.length - 1] <= digitBase) precomputedPowersOfTwo.push(2 * precomputedPowersOfTwo[precomputedPowersOfTwo.length - 1]);
    var precomputedPowersCount = precomputedPowersOfTwo.length, largestPrecomputedPowerOfTwo = precomputedPowersOfTwo[precomputedPowersCount - 1];

    function isShiftAmountCompact(shiftAmount) {
        return Math.abs(shiftAmount) <= digitBase;
    }

    LargeInteger.prototype.bitwiseShiftLeft = function (shiftVal) {
        var shiftNum = coerceToArbitraryInt(shiftVal).toJavascriptNumber();
        if (!isShiftAmountCompact(shiftNum)) {
            throw new Error(String(shiftNum) + " is too large for shifting.");
        }
        if (shiftNum < 0) return this.bitwiseShiftRight(-shiftNum);
        var currentResult = this;
        if (currentResult.isActualZero()) return currentResult;
        while (shiftNum >= precomputedPowersCount) {
            currentResult = currentResult.multiply(largestPrecomputedPowerOfTwo);
            shiftNum -= precomputedPowersCount - 1;
        }
        return currentResult.multiply(precomputedPowersOfTwo[shiftNum]);
    };
    PlatformBigInt.prototype.bitwiseShiftLeft = CompactInteger.prototype.bitwiseShiftLeft = LargeInteger.prototype.bitwiseShiftLeft;

    LargeInteger.prototype.bitwiseShiftRight = function (shiftVal) {
        var divisionResult;
        var shiftNum = coerceToArbitraryInt(shiftVal).toJavascriptNumber();
        if (!isShiftAmountCompact(shiftNum)) {
            throw new Error(String(shiftNum) + " is too large for shifting.");
        }
        if (shiftNum < 0) return this.bitwiseShiftLeft(-shiftNum);
        var currentResult = this;
        while (shiftNum >= precomputedPowersCount) {
            if (currentResult.isActualZero() || (currentResult.hasNegativeSign() && currentResult.isOneOrMinusOne())) return currentResult;
            divisionResult = flexibleDivision(currentResult, largestPrecomputedPowerOfTwo);
            currentResult = divisionResult[1].hasNegativeSign() ? divisionResult[0].decrementByOne() : divisionResult[0];
            shiftNum -= precomputedPowersCount - 1;
        }
        divisionResult = flexibleDivision(currentResult, precomputedPowersOfTwo[shiftNum]);
        return divisionResult[1].hasNegativeSign() ? divisionResult[0].decrementByOne() : divisionResult[0];
    };
    PlatformBigInt.prototype.bitwiseShiftRight = CompactInteger.prototype.bitwiseShiftRight = LargeInteger.prototype.bitwiseShiftRight;

    // Generic bitwise operation handler
    function performBitwiseOperation(numX, numY, bitwiseFunction) {
        numY = coerceToArbitraryInt(numY);
        var xIsNegative = numX.hasNegativeSign(), yIsNegative = numY.hasNegativeSign();
        var xRemaining = xIsNegative ? numX.bitwiseNot() : numX,
            yRemaining = yIsNegative ? numY.bitwiseNot() : numY;
        var xDigit = 0, yDigit = 0;
        var xDivModResult = null, yDivModResult = null;
        var resultDigits = [];
        while (!xRemaining.isActualZero() || !yRemaining.isActualZero()) {
            xDivModResult = flexibleDivision(xRemaining, largestPrecomputedPowerOfTwo);
            xDigit = xDivModResult[1].toJavascriptNumber();
            if (xIsNegative) {
                xDigit = largestPrecomputedPowerOfTwo - 1 - xDigit; // two's complement for negative numbers
            }

            yDivModResult = flexibleDivision(yRemaining, largestPrecomputedPowerOfTwo);
            yDigit = yDivModResult[1].toJavascriptNumber();
            if (yIsNegative) {
                yDigit = largestPrecomputedPowerOfTwo - 1 - yDigit; // two's complement for negative numbers
            }

            xRemaining = xDivModResult[0];
            yRemaining = yDivModResult[0];
            resultDigits.push(bitwiseFunction(xDigit, yDigit));
        }
        var finalSum = bitwiseFunction(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? arbitraryPrecisionInt(-1) : arbitraryPrecisionInt(0);
        for (var idx = resultDigits.length - 1; idx >= 0; idx -= 1) {
            finalSum = finalSum.multiply(largestPrecomputedPowerOfTwo).add(arbitraryPrecisionInt(resultDigits[idx]));
        }
        return finalSum;
    }

    LargeInteger.prototype.bitwiseNot = function () {
        return this.invertSign().decrementByOne();
    };
    PlatformBigInt.prototype.bitwiseNot = CompactInteger.prototype.bitwiseNot = LargeInteger.prototype.bitwiseNot;

    LargeInteger.prototype.bitwiseAnd = function (operand) {
        return performBitwiseOperation(this, operand, function (a, b) { return a & b; });
    };
    PlatformBigInt.prototype.bitwiseAnd = CompactInteger.prototype.bitwiseAnd = LargeInteger.prototype.bitwiseAnd;

    LargeInteger.prototype.bitwiseOr = function (operand) {
        return performBitwiseOperation(this, operand, function (a, b) { return a | b; });
    };
    PlatformBigInt.prototype.bitwiseOr = CompactInteger.prototype.bitwiseOr = LargeInteger.prototype.bitwiseOr;

    LargeInteger.prototype.bitwiseXor = function (operand) {
        return performBitwiseOperation(this, operand, function (a, b) { return a ^ b; });
    };
    PlatformBigInt.prototype.bitwiseXor = CompactInteger.prototype.bitwiseXor = LargeInteger.prototype.bitwiseXor;

    var lowestOneBitMaskInt = 1 << 30, lowestOneBitMaskBigInt = (digitBase & -digitBase) * (digitBase & -digitBase) | lowestOneBitMaskInt;
    function estimateLowestOneBit(num) { // get lowestOneBit (rough estimate)
        var val = num.value,
            resultX = typeof val === "number" ? val | lowestOneBitMaskInt :
                typeof val === "bigint" ? val | BigInt(lowestOneBitMaskInt) :
                    val[0] + val[1] * digitBase | lowestOneBitMaskBigInt;
        return resultX & -resultX;
    }

    function calculateIntegerLog(valueNum, baseNum) {
        if (baseNum.compareValues(valueNum) <= 0) {
            var tempLog = calculateIntegerLog(valueNum, baseNum.square(baseNum));
            var currentProduct = tempLog.p;
            var currentExponent = tempLog.e;
            var testProduct = currentProduct.multiply(baseNum);
            return testProduct.compareValues(valueNum) <= 0 ? { p: testProduct, e: currentExponent * 2 + 1 } : { p: currentProduct, e: currentExponent * 2 };
        }
        return { p: arbitraryPrecisionInt(1), e: 0 };
    }

    LargeInteger.prototype.getBitLength = function () {
        var num = this;
        if (num.compareValues(arbitraryPrecisionInt(0)) < 0) {
            num = num.invertSign().subtract(arbitraryPrecisionInt(1));
        }
        if (num.compareValues(arbitraryPrecisionInt(0)) === 0) {
            return arbitraryPrecisionInt(0);
        }
        return arbitraryPrecisionInt(calculateIntegerLog(num, arbitraryPrecisionInt(2)).e).add(arbitraryPrecisionInt(1));
    }
    PlatformBigInt.prototype.getBitLength = CompactInteger.prototype.getBitLength = LargeInteger.prototype.getBitLength;

    function findMaximum(a, b) {
        a = coerceToArbitraryInt(a);
        b = coerceToArbitraryInt(b);
        return a.isGreaterThan(b) ? a : b;
    }
    function findMinimum(a, b) {
        a = coerceToArbitraryInt(a);
        b = coerceToArbitraryInt(b);
        return a.isLesserThan(b) ? a : b;
    }
    function greatestCommonDivisor(a, b) {
        a = coerceToArbitraryInt(a).absoluteValue();
        b = coerceToArbitraryInt(b).absoluteValue();
        if (a.isEqualTo(b)) return a;
        if (a.isActualZero()) return b;
        if (b.isActualZero()) return a;
        var commonFactor = ArbitraryInt[1], tempD, tempT;
        while (a.isDivisibleByTwo() && b.isDivisibleByTwo()) {
            tempD = findMinimum(estimateLowestOneBit(a), estimateLowestOneBit(b));
            a = a.getQuotient(tempD);
            b = b.getQuotient(tempD);
            commonFactor = commonFactor.multiply(tempD);
        }
        while (a.isDivisibleByTwo()) {
            a = a.getQuotient(estimateLowestOneBit(a));
        }
        do {
            while (b.isDivisibleByTwo()) {
                b = b.getQuotient(estimateLowestOneBit(b));
            }
            if (a.isGreaterThan(b)) {
                tempT = b; b = a; a = tempT;
            }
            b = b.subtract(a);
        } while (!b.isActualZero());
        return commonFactor.isOneOrMinusOne() ? a : a.multiply(commonFactor);
    }
    function leastCommonMultiple(a, b) {
        a = coerceToArbitraryInt(a).absoluteValue();
        b = coerceToArbitraryInt(b).absoluteValue();
        return a.getQuotient(greatestCommonDivisor(a, b)).multiply(b);
    }
    function generateRandomBetween(lowerBound, upperBound, randomFn) {
        lowerBound = coerceToArbitraryInt(lowerBound);
        upperBound = coerceToArbitraryInt(upperBound);
        var activeRandomFn = randomFn || Math.random;
        var minVal = findMinimum(lowerBound, upperBound), maxVal = findMaximum(lowerBound, upperBound);
        var valueRange = maxVal.subtract(minVal).add(1);
        if (valueRange.isSmall) return minVal.add(Math.floor(activeRandomFn() * valueRange));
        var digitsInBase = convertToBaseArray(valueRange, digitBase).value;
        var generatedDigits = [], restrictedRange = true;
        for (var idx = 0; idx < digitsInBase.length; idx++) {
            var upperLimit = restrictedRange ? digitsInBase[idx] : digitBase;
            var digit = floorOrCeil(activeRandomFn() * upperLimit);
            generatedDigits.push(digit);
            if (digit < upperLimit) restrictedRange = false;
        }
        return minVal.add(ArbitraryInt.createFromArray(generatedDigits, digitBase, false));
    }

    var parseStringWithBase = function (textInput, baseVal, alphabetConfig, caseSensitiveFlag) {
        alphabetConfig = alphabetConfig || defaultCharSet;
        textInput = String(textInput);
        if (!caseSensitiveFlag) {
            textInput = textInput.toLowerCase();
            alphabetConfig = alphabetConfig.toLowerCase();
        }
        var textLength = textInput.length;
        var idx;
        var absoluteBase = Math.abs(baseVal);
        var characterToValueMap = {};
        for (idx = 0; idx < alphabetConfig.length; idx++) {
            characterToValueMap[alphabetConfig[idx]] = idx;
        }
        for (idx = 0; idx < textLength; idx++) {
            var char = textInput[idx];
            if (char === "-") continue;
            if (char in characterToValueMap) {
                if (characterToValueMap[char] >= absoluteBase) {
                    if (char === "1" && absoluteBase === 1) continue;
                    throw new Error(char + " is not a valid digit in base " + baseVal + ".");
                }
            }
        }
        baseVal = coerceToArbitraryInt(baseVal);
        var digitArray = [];
        var isResultNegative = textInput[0] === "-";
        for (idx = isResultNegative ? 1 : 0; idx < textInput.length; idx++) {
            var char = textInput[idx];
            if (char in characterToValueMap) digitArray.push(coerceToArbitraryInt(characterToValueMap[char]));
            else if (char === "<") {
                var startIndex = idx;
                do { idx++; } while (textInput[idx] !== ">" && idx < textInput.length);
                digitArray.push(coerceToArbitraryInt(textInput.slice(startIndex + 1, idx)));
            }
            else throw new Error(char + " is not a valid character");
        }
        return constructFromBaseArray(digitArray, baseVal, isResultNegative);
    };

    function constructFromBaseArray(digitsArr, baseNum, isNegative) {
        var accumulatedValue = ArbitraryInt[0], powerTerm = ArbitraryInt[1], idx;
        for (idx = digitsArr.length - 1; idx >= 0; idx--) {
            accumulatedValue = accumulatedValue.add(digitsArr[idx].times(powerTerm));
            powerTerm = powerTerm.times(baseNum);
        }
        return isNegative ? accumulatedValue.invertSign() : accumulatedValue;
    }

    function digitToString(digit, alphabetConfig) {
        alphabetConfig = alphabetConfig || defaultCharSet;
        if (digit < alphabetConfig.length) {
            return alphabetConfig[digit];
        }
        return "<" + digit + ">";
    }

    function convertToBaseArray(num, baseNum) {
        baseNum = arbitraryPrecisionInt(baseNum);
        if (baseNum.isActualZero()) {
            if (num.isActualZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (baseNum.isEqualTo(-1)) {
            if (num.isActualZero()) return { value: [0], isNegative: false };
            if (num.hasNegativeSign())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-num.toJavascriptNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(num.toJavascriptNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var isNegativeResult = false;
        if (num.hasNegativeSign() && baseNum.hasPositiveSign()) {
            isNegativeResult = true;
            num = num.absoluteValue();
        }
        if (baseNum.isOneOrMinusOne()) {
            if (num.isActualZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(num.toJavascriptNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: isNegativeResult
            };
        }
        var outputDigits = [];
        var remainingValue = num, divModPair;
        while (remainingValue.hasNegativeSign() || remainingValue.compareAbsoluteValues(baseNum) >= 0) {
            divModPair = remainingValue.getQuotientAndRemainder(baseNum);
            remainingValue = divModPair.quotient;
            var currentDigit = divModPair.remainder;
            if (currentDigit.hasNegativeSign()) {
                currentDigit = baseNum.minus(currentDigit).absoluteValue();
                remainingValue = remainingValue.incrementByOne();
            }
            outputDigits.push(currentDigit.toJavascriptNumber());
        }
        outputDigits.push(remainingValue.toJavascriptNumber());
        return { value: outputDigits.reverse(), isNegative: isNegativeResult };
    }

    function convertToBaseString(num, baseNum, alphabetConfig) {
        var baseConversionResult = convertToBaseArray(num, baseNum);
        return (baseConversionResult.isNegative ? "-" : "") + baseConversionResult.value.map(function (x) {
            return digitToString(x, alphabetConfig);
        }).join('');
    }

    LargeInteger.prototype.toDigitArray = function (radix) {
        return convertToBaseArray(this, radix);
    };

    CompactInteger.prototype.toDigitArray = function (radix) {
        return convertToBaseArray(this, radix);
    };

    PlatformBigInt.prototype.toDigitArray = function (radix) {
        return convertToBaseArray(this, radix);
    };

    LargeInteger.prototype.toFormattedString = function (radix, alphabetConfig) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return convertToBaseString(this, radix, alphabetConfig);
        var val = this.value, len = val.length, str = String(val[--len]), zerosPadding = "0000000", currentDigit;
        while (--len >= 0) {
            currentDigit = String(val[len]);
            str += zerosPadding.slice(currentDigit.length) + currentDigit;
        }
        var signPrefix = this.sign ? "-" : "";
        return signPrefix + str;
    };

    CompactInteger.prototype.toFormattedString = function (radix, alphabetConfig) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return convertToBaseString(this, radix, alphabetConfig);
        return String(this.value);
    };

    PlatformBigInt.prototype.toFormattedString = CompactInteger.prototype.toFormattedString;

    PlatformBigInt.prototype.toJsonRepresentation = LargeInteger.prototype.toJsonRepresentation = CompactInteger.prototype.toJsonRepresentation = function () { return this.toFormattedString(); }

    LargeInteger.prototype.getValue = function () {
        return parseInt(this.toFormattedString(), 10);
    };
    LargeInteger.prototype.toJavascriptNumber = LargeInteger.prototype.getValue;

    CompactInteger.prototype.getValue = function () {
        return this.value;
    };
    CompactInteger.prototype.toJavascriptNumber = CompactInteger.prototype.getValue;
    PlatformBigInt.prototype.getValue = PlatformBigInt.prototype.toJavascriptNumber = function () {
        return parseInt(this.toFormattedString(), 10);
    }

    function parseStringAsValue(stringValue) {
        if (isJsPrecise(+stringValue)) {
            var numX = +stringValue;
            if (numX === floorOrCeil(numX))
                return hasNativeBigIntSupport ? new PlatformBigInt(BigInt(numX)) : new CompactInteger(numX);
            throw new Error("Invalid integer: " + stringValue);
        }
        var isNegative = stringValue[0] === "-";
        if (isNegative) stringValue = stringValue.slice(1);
        var exponentSplit = stringValue.split(/e/i);
        if (exponentSplit.length > 2) throw new Error("Invalid integer: " + exponentSplit.join("e"));
        if (exponentSplit.length === 2) {
            var exponentPart = exponentSplit[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart;
            if (exponentPart !== floorOrCeil(exponentPart) || !isJsPrecise(exponentPart)) throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
            var numericText = exponentSplit[0];
            var decimalPointIndex = numericText.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponentPart -= numericText.length - decimalPointIndex - 1;
                numericText = numericText.slice(0, decimalPointIndex) + numericText.slice(decimalPointIndex + 1);
            }
            if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
            numericText += (new Array(exponentPart + 1)).join("0");
            stringValue = numericText;
        }
        var isValidFormat = /^([0-9][0-9]*)$/.test(stringValue);
        if (!isValidFormat) throw new Error("Invalid integer: " + stringValue);
        if (hasNativeBigIntSupport) {
            return new PlatformBigInt(BigInt(isNegative ? "-" + stringValue : stringValue));
        }
        var resultDigits = [], maxIdx = stringValue.length, currentLogBase = logDigitBase, minIdx = maxIdx - currentLogBase;
        while (maxIdx > 0) {
            resultDigits.push(+stringValue.slice(minIdx, maxIdx));
            minIdx -= currentLogBase;
            if (minIdx < 0) minIdx = 0;
            maxIdx -= currentLogBase;
        }
        normalizeArray(resultDigits);
        return new LargeInteger(resultDigits, isNegative);
    }

    function parseNumberAsValue(numericValue) {
        if (hasNativeBigIntSupport) {
            return new PlatformBigInt(BigInt(numericValue));
        }
        if (isJsPrecise(numericValue)) {
            if (numericValue !== floorOrCeil(numericValue)) throw new Error(numericValue + " is not an integer.");
            return new CompactInteger(numericValue);
        }
        return parseStringAsValue(numericValue.toString());
    }

    function coerceToArbitraryInt(valueToParse) {
        if (typeof valueToParse === "number") {
            return parseNumberAsValue(valueToParse);
        }
        if (typeof valueToParse === "string") {
            return parseStringAsValue(valueToParse);
        }
        if (typeof valueToParse === "bigint") {
            return new PlatformBigInt(valueToParse);
        }
        return valueToParse;
    }
    // Pre-define numbers in range [-999,999] for performance
    for (var idx = 0; idx < 1000; idx++) {
        ArbitraryInt[idx] = coerceToArbitraryInt(idx);
        if (idx > 0) ArbitraryInt[-idx] = coerceToArbitraryInt(-idx);
    }
    // Backwards compatibility aliases
    ArbitraryInt.oneValue = ArbitraryInt[1];
    ArbitraryInt.zeroValue = ArbitraryInt[0];
    ArbitraryInt.minusOneValue = ArbitraryInt[-1];
    ArbitraryInt.findMaximum = findMaximum;
    ArbitraryInt.findMinimum = findMinimum;
    ArbitraryInt.greatestCommonDivisor = greatestCommonDivisor;
    ArbitraryInt.leastCommonMultiple = leastCommonMultiple;
    ArbitraryInt.isArbitraryIntInstance = function (x) { return x instanceof LargeInteger || x instanceof CompactInteger || x instanceof PlatformBigInt; };
    ArbitraryInt.generateRandomBetween = generateRandomBetween;

    ArbitraryInt.createFromArray = function (digits, base, isNegative) {
        return constructFromBaseArray(digits.map(coerceToArbitraryInt), coerceToArbitraryInt(base || 10), isNegative);
    };

    return ArbitraryInt;
})();

// Node.js environment check
if ( true && module.hasOwnProperty("exports")) {
    module.exports = arbitraryPrecisionInt;
}

// AMD environment check
if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
        return arbitraryPrecisionInt;
    }).call(exportedMembers, componentResolver, exportedMembers, componentRecord),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
}

/* WEBPACK VAR INJECTION */}.call(this, componentResolver(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(componentRecord)))

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(componentRecord, exportedMembers) {

module.exports = function(currentModule) {
	// A simple polyfill for Webpack's internal module object properties
	if (!currentModule.webpackPolyfill) {
		// Placeholder for deprecation warnings
		currentModule.deprecate = function() {};
		// Path array (usually empty in browser context)
		currentModule.paths = [];
		// module.parent is undefined by default
		// Initialize children array if not present
		if (!currentModule.children) currentModule.children = [];
		// Define 'loaded' property for compatibility
		Object.defineProperty(currentModule, "loaded", {
			enumerable: true,
			get: function() {
				return currentModule.isComponentLoaded;
			}
		});
		// Define 'id' property for compatibility
		Object.defineProperty(currentModule, "id", {
			enumerable: true,
			get: function() {
				return currentModule.internalIdentifier;
			}
		});
		// Mark as webpack polyfilled module
		currentModule.webpackPolyfill = 1;
	}
	return currentModule;
};


/***/ }),

/***/ "./src/ABC155/C.js":
/*!*************************!*\
  !*** ./src/ABC155/C.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(componentRecord, __webpack_exports__, componentResolver) {

"use strict";
__webpack_exports__.__esModule = true;
/* harmony import */ var fileSystemModule__WEBPACK_IMPORTED_MODULE_0__ = componentResolver(/*! fs */ "fs");
/* harmony import */ var fileSystemModule__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/componentResolver.createCompatExportProxy(fileSystemModule__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var largeNumberLib__WEBPACK_IMPORTED_MODULE_1__ = componentResolver(/*! big-integer */ "./node_modules/big-integer/BigInteger.js");
/* harmony import */ var largeNumberLib__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/componentResolver.createCompatExportProxy(largeNumberLib__WEBPACK_IMPORTED_MODULE_1__);


// Helper functions for array destructuring (retained for structural similarity, though not used in the modified code)
function _unpackArray(sourceArray, maxElements) {
  if (Array.isArray(sourceArray)) return sourceArray;
  // Fallback for non-array iterables (not strictly needed by problem but part of original boilerplate)
  if (Symbol.iterator in Object(sourceArray) || Object.prototype.toString.call(sourceArray) === "[object Arguments]") {
    var resultArr = [];
    var isDone = false;
    var hasError = false;
    var iteratorError = undefined;
    try {
      for (var iterator = sourceArray[Symbol.iterator](), currentItem; !(isDone = (currentItem = iterator.next()).done); isDone = true) {
        resultArr.push(currentItem.value);
        if (maxElements && resultArr.length === maxElements) break;
      }
    } catch (err) {
      hasError = true;
      iteratorError = err;
    } finally {
      try {
        if (!isDone && iterator["return"] != null) iterator["return"]();
      } finally {
        if (hasError) throw iteratorError;
      }
    }
    return resultArr;
  }
  // Handle non-iterable instances
  throw new TypeError("Invalid attempt to destructure non-iterable instance.");
}


/**
 * Processes competition results to find the most frequently submitted strings.
 * This function reads input, counts string occurrences, and outputs the top-ranked
 * strings alphabetically if there are ties in frequency.
 * @param {string} inputPayload - The raw input string, typically from stdin.
 */
const processCompetitionResults = (inputPayload) => {
    // Ensure input is a string and split into individual data lines.
    // Trim to remove any leading/trailing whitespace including extra newlines.
    const dataLines = String(inputPayload || '').trim().split('\n');

    // Early exit if no valid data lines are present after trimming.
    if (dataLines.length === 0 || dataLines[0].length === 0) {
        // console.warn("No input data or empty input provided for processing.");
        return; // No results to process
    }

    // Extract the total number of entries from the first line.
    // Use parseInt for explicit type conversion and a default value for robustness.
    const totalEntriesCount = parseInt(dataLines[0].split(' ')[0], 10);

    // Validate the count. If invalid or non-positive, log an error and exit.
    if (isNaN(totalEntriesCount) || totalEntriesCount <= 0) {
        // console.error(`Invalid or non-positive entry count provided: ${dataLines[0]}. Exiting.`);
        return;
    }

    // A data structure to store the frequency of each submitted string.
    // Using `Map` for potentially better performance with string keys and clearer API.
    const submissionFrequencies = new Map();

    // Iterate through the subsequent lines to populate the frequency map.
    // Start from index 1 as `dataLines[0]` contains the count.
    // Add an explicit check for `currentLineIndex + 1` to prevent reading beyond array bounds.
    for (let currentLineIndex = 0; currentLineIndex < totalEntriesCount; currentLineIndex++) {
        const lineIndexForEntry = currentLineIndex + 1;
        if (lineIndexForEntry < dataLines.length) {
            const entryString = dataLines[lineIndexForEntry];
            if (entryString && entryString.trim().length > 0) { // Ensure the string is not empty or just whitespace
                const currentCount = submissionFrequencies.get(entryString) || 0;
                submissionFrequencies.set(entryString, currentCount + 1);
            }
        } else {
            // console.warn(`Input data truncated: Expected ${totalEntriesCount} entries, but found less.`);
            break; // Stop if we run out of lines before reaching totalEntriesCount
        }
    }

    // If no valid submissions were recorded, exit.
    if (submissionFrequencies.size === 0) {
        return;
    }

    // Convert the frequency map into an array of [string, count] pairs.
    // Sort them primarily by frequency in descending order.
    // For entries with identical frequencies, sort alphabetically in ascending order.
    const sortedSubmissions = Array.from(submissionFrequencies.entries()).sort((entryA, entryB) => {
        const frequencyDifference = entryB[1] - entryA[1]; // Descending frequency
        if (frequencyDifference !== 0) {
            return frequencyDifference;
        }
        // If frequencies are equal, sort by string value alphabetically ascending.
        return entryA[0].localeCompare(entryB[0]);
    });

    // Determine the maximum frequency observed from the first element of the sorted list.
    const maximumObservedFrequency = sortedSubmissions[0][1];
    const topRankedItems = []; // Array to collect all items that share the highest frequency.

    // Iterate through the already sorted list to find all entries that match the maximum frequency.
    // This loop is more explicit than the original `while(1)` with `shift()`.
    for (const [submissionText, currentFrequency] of sortedSubmissions) {
        if (currentFrequency === maximumObservedFrequency) {
            topRankedItems.push(submissionText);
        } else {
            // Since the list is sorted by frequency descending, once we find an item
            // with a lower frequency, we can stop iterating.
            break;
        }
    }

    // The `sortedSubmissions` already handles alphabetical tie-breaking, so `topRankedItems`
    // will already be alphabetically sorted among themselves if their frequencies were equal.
    // However, if the sorting logic changes or for clarity, an explicit sort here can be added,
    // but it's redundant with the current `sortedSubmissions` logic.
    // For demonstration of Type III change (potentially redundant sort):
    // topRankedItems.sort((a, b) => a.localeCompare(b));

    // Output each top-ranked item to the console.
    topRankedItems.forEach(item => console.log(item));
};

// Execute the main processing function with data read from standard input.
// Using the renamed file system module.
processCompetitionResults(fileSystemModule__WEBPACK_IMPORTED_MODULE_0___default.a.readFileSync('/dev/stdin', 'utf8'));


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(componentRecord, exportedMembers) {

module.exports = require("fs");


/***/ })

});