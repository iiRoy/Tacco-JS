/*
 * This module provides functionality for handling large number arithmetic,
 * extending standard JavaScript number capabilities.
 * It defines custom number objects for values exceeding native safe integer limits.
 */
var grandNumMaker = (function(unassigned) {
    // Strict mode helps catch common coding errors and "unsafe" actions.
    "use strict";

    // Define fundamental constants for internal representation.
    const PARTITION_UNIT = 10_000_000; // Base for digit chunks (10^7)
    const PARTITION_UNIT_LOG = 7;     // Log10 of the partition unit
    const JS_MAX_VAL = 9_007_199_254_740_992; // Max safe integer in JavaScript (2^53 - 1)

    // Array representation of JS_MAX_VAL for comparison purposes.
    const SAFE_LIMIT_ARRAY = nativeToChunks(JS_MAX_VAL);
    const JS_MAX_VAL_LOG = Math.log(JS_MAX_VAL); // Logarithm of max safe integer

    /**
     * Factory function to create a number object from various inputs.
     * @param {number|string|ValueContainer} item - The value to parse.
     * @param {number} [numBase] - The base of the input string, if applicable.
     * @returns {ValueContainer} A ValueContainer (GrandNum or CompactNumber) instance.
     */
    function ValueContainer(item, numBase) {
        if (typeof item === "undefined") {
            return ValueContainer[0]; // Return cached zero instance
        }
        if (typeof numBase !== "undefined") {
            // If a base is specified, parse accordingly.
            return +numBase === 10 ? interpretInput(item) : stringToNumBase(item, numBase);
        }
        return interpretInput(item); // Default parsing for numbers/strings
    }

    /**
     * Represents a large number that exceeds JavaScript's safe integer limit.
     * Stores the number as an array of digit chunks and a sign flag.
     * @param {number[]} numParts - Array of digit chunks.
     * @param {boolean} negFlag - True if the number is negative.
     */
    function GrandNum(numParts, negFlag) {
        this.digitChunks = numParts;
        this.negFlag = negFlag;
        this.isCompact = false; // Flag indicating it's not a small number
    }

    // GrandNum instances inherit from ValueContainer's prototype.
    GrandNum.prototype = Object.create(ValueContainer.prototype);

    /**
     * Represents a number that fits within JavaScript's safe integer limit.
     * Stores the number directly as a native JavaScript number.
     * @param {number} item - The native JavaScript number.
     */
    function CompactNumber(item) {
        this.digitChunks = item;
        this.negFlag = item < 0;
        this.isCompact = true; // Flag indicating it's a small number
    }

    // CompactNumber instances also inherit from ValueContainer's prototype.
    CompactNumber.prototype = Object.create(ValueContainer.prototype);

    /**
     * Checks if a given number is within JavaScript's safe integer range.
     * @param {number} n - The number to check.
     * @returns {boolean} True if the number is precise, false otherwise.
     */
    function fitsNativeRange(n) {
        return -JS_MAX_VAL < n && n < JS_MAX_VAL;
    }

    /**
     * Converts a native JavaScript number into an array of digit chunks.
     * @param {number} n - The native number.
     * @returns {number[]} An array representing the number's parts.
     */
    function nativeToChunks(n) {
        if (n < 10_000_000) {
            return [n];
        }
        if (n < 100_000_000_000_000) {
            return [n % 10_000_000, Math.floor(n / 10_000_000)];
        }
        return [n % 10_000_000, Math.floor(n / 10_000_000) % 10_000_000, Math.floor(n / 100_000_000_000_000)];
    }

    /**
     * Converts an array of digit chunks back into a native JavaScript number if possible.
     * @param {number[]} arr - The array of digit chunks.
     * @returns {number|number[]} A native number if it fits, otherwise the original array.
     */
    function chunksToNative(arr) {
        // Remove leading zero chunks for proper comparison.
        cleanUpChunks(arr);
        const chunkCount = arr.length;

        // Check if the number represented by the chunks is within the safe integer limit.
        if (chunkCount < 4 && compareAbsoluteParts(arr, SAFE_LIMIT_ARRAY) < 0) {
            switch (chunkCount) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * PARTITION_UNIT;
                default: return arr[0] + (arr[1] + arr[2] * PARTITION_UNIT) * PARTITION_UNIT;
            }
        }
        return arr; // Return the array if it's too large for a native number.
    }

    /**
     * Removes leading zero chunks from a number's internal array representation.
     * Modifies the array in place.
     * @param {number[]} digitArray - The array of digit chunks.
     */
    function cleanUpChunks(digitArray) {
        let currentIdx = digitArray.length;
        while (currentIdx > 0 && digitArray[--currentIdx] === 0); // Find the last non-zero chunk.
        digitArray.length = currentIdx + 1; // Truncate the array.
    }

    /**
     * Creates a new array initialized with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A new array filled with zeros.
     */
    function initChunkArray(len) {
        const newArr = new Array(len);
        let idx = -1;
        while (++idx < len) {
            newArr[idx] = 0;
        }
        return newArr;
    }

    /**
     * Truncates a number towards zero (floor for positive, ceil for negative).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    /**
     * Performs addition of two arrays of digit chunks (assuming positive numbers).
     * `a` must be greater than or equal to `b` in length for efficiency.
     * @param {number[]} a - First array of digit chunks.
     * @param {number[]} b - Second array of digit chunks.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function sumParts(a, b) {
        const lenA = a.length, lenB = b.length;
        const resultArr = new Array(lenA);
        let carryOver = 0, currentSum, idx;

        // Add corresponding chunks and handle carry.
        for (idx = 0; idx < lenB; idx++) {
            currentSum = a[idx] + b[idx] + carryOver;
            carryOver = currentSum >= PARTITION_UNIT ? 1 : 0;
            resultArr[idx] = currentSum - carryOver * PARTITION_UNIT;
        }

        // Propagate carry through remaining chunks of `a`.
        while (idx < lenA) {
            currentSum = a[idx] + carryOver;
            carryOver = currentSum === PARTITION_UNIT ? 1 : 0;
            resultArr[idx++] = currentSum - carryOver * PARTITION_UNIT;
        }

        // If there's a final carry, push it to the result.
        if (carryOver > 0) {
            resultArr.push(carryOver);
        }
        return resultArr;
    }

    /**
     * Performs addition of two arrays of digit chunks, ensuring the longer array is first.
     * @param {number[]} a - First array of digit chunks.
     * @param {number[]} b - Second array of digit chunks.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function combineAnyChunks(a, b) {
        if (a.length >= b.length) {
            return sumParts(a, b);
        }
        return sumParts(b, a); // Ensure 'a' is the longer array.
    }

    /**
     * Adds a small (native) number to an array of digit chunks.
     * Used for adding a carry-like value.
     * @param {number[]} arr - The array of digit chunks.
     * @param {number} carryVal - The small number to add.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function addToChunks(arr, carryVal) {
        const len = arr.length;
        const resultArr = new Array(len);
        let currentCarry = carryVal; // Rename 'carry' to 'currentCarry' to avoid conflict with loop 'carry'
        let currentSum, idx;

        // Add carry to each chunk, handling propagation.
        for (idx = 0; idx < len; idx++) {
            currentSum = arr[idx] - PARTITION_UNIT + currentCarry; // Optimized for carry calculation
            currentCarry = Math.floor(currentSum / PARTITION_UNIT);
            resultArr[idx] = currentSum - currentCarry * PARTITION_UNIT;
            currentCarry += 1;
        }

        // Propagate any remaining carry.
        while (currentCarry > 0) {
            resultArr[idx++] = currentCarry % PARTITION_UNIT;
            currentCarry = Math.floor(currentCarry / PARTITION_UNIT);
        }
        return resultArr;
    }

    /**
     * BigInteger prototype method for addition.
     * @param {ValueContainer|number|string} input - The value to add.
     * @returns {GrandNum} A new GrandNum representing the sum.
     */
    GrandNum.prototype.add = function(input) {
        const otherNum = interpretInput(input);

        // If signs are different, convert to subtraction.
        if (this.negFlag !== otherNum.negFlag) {
            return this.subtract(otherNum.flipSign());
        }

        const myChunks = this.digitChunks;
        const otherChunks = otherNum.digitChunks;

        // If the other number is small, use optimized addSmall.
        if (otherNum.isCompact) {
            return new GrandNum(addToChunks(myChunks, Math.abs(otherChunks)), this.negFlag);
        }
        // Otherwise, use general chunk addition.
        return new GrandNum(combineAnyChunks(myChunks, otherChunks), this.negFlag);
    };

    // Alias for the add method.
    GrandNum.prototype.plus = GrandNum.prototype.add;

    /**
     * SmallInteger prototype method for addition.
     * @param {ValueContainer|number|string} input - The value to add.
     * @returns {ValueContainer} A new CompactNumber or GrandNum representing the sum.
     */
    CompactNumber.prototype.add = function(input) {
        const otherNum = interpretInput(input);
        const myValue = this.digitChunks;

        // If signs are different, convert to subtraction.
        if (myValue < 0 !== otherNum.negFlag) {
            return this.subtract(otherNum.flipSign());
        }

        let otherValue = otherNum.digitChunks;

        // If both are small, try native addition first.
        if (otherNum.isCompact) {
            if (fitsNativeRange(myValue + otherValue)) {
                return new CompactNumber(myValue + otherValue);
            }
            // If native addition overflows, convert other to chunks and add.
            otherValue = nativeToChunks(Math.abs(otherValue));
        }

        // Convert this value to chunks and use optimized addSmall.
        return new GrandNum(addToChunks(otherValue, Math.abs(myValue)), myValue < 0);
    };

    // Alias for the add method.
    CompactNumber.prototype.plus = CompactNumber.prototype.add;

    /**
     * Performs subtraction of two arrays of digit chunks (a - b, assuming a >= b).
     * @param {number[]} aParts - First array of digit chunks (minuend).
     * @param {number[]} bParts - Second array of digit chunks (subtrahend).
     * @returns {number[]} Resulting array of digit chunks.
     */
    function deductChunks(aParts, bParts) {
        const lenA = aParts.length, lenB = bParts.length;
        const resultArr = new Array(lenA);
        let borrowVal = 0, currentDifference, idx;

        // Subtract corresponding chunks and handle borrow.
        for (idx = 0; idx < lenB; idx++) {
            currentDifference = aParts[idx] - borrowVal - bParts[idx];
            if (currentDifference < 0) {
                currentDifference += PARTITION_UNIT;
                borrowVal = 1;
            } else {
                borrowVal = 0;
            }
            resultArr[idx] = currentDifference;
        }

        // Propagate borrow through remaining chunks of `aParts`.
        for (idx = lenB; idx < lenA; idx++) {
            currentDifference = aParts[idx] - borrowVal;
            if (currentDifference < 0) {
                currentDifference += PARTITION_UNIT;
            } else {
                resultArr[idx++] = currentDifference; // If no borrow, we can stop here for this loop
                break;
            }
            resultArr[idx] = currentDifference;
        }

        // Copy any remaining chunks of `aParts` that weren't affected by borrow.
        for (; idx < lenA; idx++) {
            resultArr[idx] = aParts[idx];
        }

        cleanUpChunks(resultArr); // Remove leading zeros.
        return resultArr;
    }

    /**
     * Performs subtraction between two numbers represented by digit chunk arrays.
     * Handles cases where `b` might be larger than `a` by flipping the sign.
     * @param {number[]} aParts - First array of digit chunks.
     * @param {number[]} bParts - Second array of digit chunks.
     * @param {boolean} currentSign - The initial sign of the result.
     * @returns {ValueContainer} A new CompactNumber or GrandNum representing the difference.
     */
    function deductAnyChunks(aParts, bParts, currentSign) {
        let resultingValue;
        // Determine which array is larger in magnitude for subtraction order.
        if (compareAbsoluteParts(aParts, bParts) >= 0) {
            resultingValue = deductChunks(aParts, bParts);
        } else {
            resultingValue = deductChunks(bParts, aParts);
            currentSign = !currentSign; // Flip sign if we swapped operands.
        }

        resultingValue = chunksToNative(resultingValue); // Try to convert to small number.

        if (typeof resultingValue === "number") {
            if (currentSign) resultingValue = -resultingValue;
            return new CompactNumber(resultingValue);
        }
        return new GrandNum(resultingValue, currentSign);
    }

    /**
     * Subtracts a small (native) number from an array of digit chunks.
     * @param {number[]} arr - The array of digit chunks.
     * @param {number} smallVal - The small number to subtract.
     * @param {boolean} currentSign - The sign of the result.
     * @returns {ValueContainer} A new CompactNumber or GrandNum representing the difference.
     */
    function deductCompactValue(arr, smallVal, currentSign) {
        const len = arr.length;
        const resultArr = new Array(len);
        let carry = -smallVal; // 'carry' acts as a negative borrow here.
        let currentDifference, idx;

        // Subtract the small value chunk by chunk, handling borrow.
        for (idx = 0; idx < len; idx++) {
            currentDifference = arr[idx] + carry;
            carry = Math.floor(currentDifference / PARTITION_UNIT);
            currentDifference %= PARTITION_UNIT;
            resultArr[idx] = currentDifference < 0 ? currentDifference + PARTITION_UNIT : currentDifference;
        }

        let resultingValue = chunksToNative(resultArr); // Try to convert to small number.

        if (typeof resultingValue === "number") {
            if (currentSign) resultingValue = -resultingValue;
            return new CompactNumber(resultingValue);
        }
        return new GrandNum(resultingValue, currentSign);
    }

    /**
     * BigInteger prototype method for subtraction.
     * @param {ValueContainer|number|string} input - The value to subtract.
     * @returns {GrandNum} A new GrandNum representing the difference.
     */
    GrandNum.prototype.subtract = function(input) {
        const otherNum = interpretInput(input);

        // If signs are different, convert to addition.
        if (this.negFlag !== otherNum.negFlag) {
            return this.add(otherNum.flipSign());
        }

        const myChunks = this.digitChunks;
        const otherChunks = otherNum.digitChunks;

        // If the other number is small, use optimized deductCompactValue.
        if (otherNum.isCompact) {
            return deductCompactValue(myChunks, Math.abs(otherChunks), this.negFlag);
        }
        // Otherwise, use general chunk subtraction.
        return deductAnyChunks(myChunks, otherChunks, this.negFlag);
    };

    // Alias for the subtract method.
    GrandNum.prototype.minus = GrandNum.prototype.subtract;

    /**
     * SmallInteger prototype method for subtraction.
     * @param {ValueContainer|number|string} input - The value to subtract.
     * @returns {ValueContainer} A new CompactNumber or GrandNum representing the difference.
     */
    CompactNumber.prototype.subtract = function(input) {
        const otherNum = interpretInput(input);
        const myValue = this.digitChunks;

        // If signs are different, convert to addition.
        if (myValue < 0 !== otherNum.negFlag) {
            return this.add(otherNum.flipSign());
        }

        const otherValue = otherNum.digitChunks;

        // If both are small, try native subtraction.
        if (otherNum.isCompact) {
            return new CompactNumber(myValue - otherValue);
        }
        // Convert this value to chunks and use optimized deductCompactValue.
        return deductCompactValue(otherValue, Math.abs(myValue), myValue >= 0);
    };

    // Alias for the subtract method.
    CompactNumber.prototype.minus = CompactNumber.prototype.subtract;

    /**
     * GrandNum prototype method to return the negative of the number.
     * @returns {GrandNum} A new GrandNum with the sign flipped.
     */
    GrandNum.prototype.flipSign = function() {
        return new GrandNum(this.digitChunks, !this.negFlag);
    };

    /**
     * CompactNumber prototype method to return the negative of the number.
     * Handles sign flipping for small numbers, potentially creating a GrandNum if it overflows.
     * @returns {CompactNumber|GrandNum} A new number object with the sign flipped.
     */
    CompactNumber.prototype.flipSign = function() {
        const currentSign = this.negFlag;
        const flippedSmall = new CompactNumber(-this.digitChunks);
        flippedSmall.negFlag = !currentSign; // Ensure the sign flag is consistent.
        return flippedSmall;
    };

    /**
     * GrandNum prototype method to get the absolute value.
     * @returns {GrandNum} A new GrandNum representing the absolute value.
     */
    GrandNum.prototype.absoluteValue = function() {
        return new GrandNum(this.digitChunks, false); // Always positive.
    };

    /**
     * CompactNumber prototype method to get the absolute value.
     * @returns {CompactNumber} A new CompactNumber representing the absolute value.
     */
    CompactNumber.prototype.absoluteValue = function() {
        return new CompactNumber(Math.abs(this.digitChunks));
    };

    /**
     * Performs long multiplication of two arrays of digit chunks.
     * Standard grade-school multiplication algorithm.
     * @param {number[]} aChunks - First array of digit chunks.
     * @param {number[]} bChunks - Second array of digit chunks.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function longMultiplication(aChunks, bChunks) {
        const lenA = aChunks.length, lenB = bChunks.length;
        const resultLen = lenA + lenB;
        const resultArr = initChunkArray(resultLen);
        const unit = PARTITION_UNIT;
        let productVal, carryVal, idxA, chunkA, idxB, chunkB;

        for (idxA = 0; idxA < lenA; ++idxA) {
            chunkA = aChunks[idxA];
            for (idxB = 0; idxB < lenB; ++idxB) {
                chunkB = bChunks[idxB];
                productVal = chunkA * chunkB + resultArr[idxA + idxB];
                carryVal = Math.floor(productVal / unit);
                resultArr[idxA + idxB] = productVal - carryVal * unit;
                resultArr[idxA + idxB + 1] += carryVal; // Add carry to the next position.
            }
        }
        cleanUpChunks(resultArr); // Remove leading zeros.
        return resultArr;
    }

    /**
     * Multiplies an array of digit chunks by a single small (native) number.
     * @param {number[]} arr - The array of digit chunks.
     * @param {number} multiplier - The small number multiplier.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function multiplyByNative(arr, multiplier) {
        const len = arr.length;
        const resultArr = new Array(len);
        const unit = PARTITION_UNIT;
        let carryVal = 0, productVal, idx;

        for (idx = 0; idx < len; idx++) {
            productVal = arr[idx] * multiplier + carryVal;
            carryVal = Math.floor(productVal / unit);
            resultArr[idx] = productVal - carryVal * unit;
        }

        // Propagate any remaining carry.
        while (carryVal > 0) {
            resultArr[idx++] = carryVal % unit;
            carryVal = Math.floor(carryVal / unit);
        }
        return resultArr;
    }

    /**
     * Pads an array of digit chunks with zeros at the beginning (effectively left shifting).
     * @param {number[]} chunkArray - The array of digit chunks.
     * @param {number} numZeros - The number of zeros to prepend.
     * @returns {number[]} A new array with zeros prepended.
     */
    function padWithZeros(chunkArray, numZeros) {
        const newArray = [];
        while (numZeros-- > 0) {
            newArray.push(0);
        }
        return newArray.concat(chunkArray);
    }

    /**
     * Performs Karatsuba multiplication on two arrays of digit chunks.
     * This is a faster algorithm for very large numbers.
     * @param {number[]} xChunks - First array of digit chunks.
     * @param {number[]} yChunks - Second array of digit chunks.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function karatsubaProduct(xChunks, yChunks) {
        const n = Math.max(xChunks.length, yChunks.length);

        // Base case: fall back to long multiplication for small arrays.
        if (n <= 30) {
            return longMultiplication(xChunks, yChunks);
        }

        // Split arrays into halves.
        const halfN = Math.ceil(n / 2);
        const b = xChunks.slice(halfN);
        const a = xChunks.slice(0, halfN);
        const d = yChunks.slice(halfN);
        const c = yChunks.slice(0, halfN);

        // Recursively compute products.
        const ac = karatsubaProduct(a, c);
        const bd = karatsubaProduct(b, d);
        const abcd = karatsubaProduct(combineAnyChunks(a, b), combineAnyChunks(c, d));

        // Combine results using Karatsuba formula.
        const productResult = combineAnyChunks(
            combineAnyChunks(ac, padWithZeros(deductChunks(deductChunks(abcd, ac), bd), halfN)),
            padWithZeros(bd, 2 * halfN)
        );

        cleanUpChunks(productResult); // Clean up leading zeros.
        return productResult;
    }

    /**
     * Heuristic to decide whether to use Karatsuba algorithm based on array lengths.
     * @param {number} len1 - Length of the first array.
     * @param {number} len2 - Length of the second array.
     * @returns {boolean} True if Karatsuba is likely more efficient.
     */
    function isKaratsubaEfficient(len1, len2) {
        // This is an empirical formula.
        return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
    }

    /**
     * BigInteger prototype method for multiplication.
     * @param {ValueContainer|number|string} input - The value to multiply.
     * @returns {GrandNum} A new GrandNum representing the product.
     */
    GrandNum.prototype.multiply = function(input) {
        const otherNum = interpretInput(input);
        const myChunks = this.digitChunks;
        let otherChunks = otherNum.digitChunks;
        const resultSign = this.negFlag !== otherNum.negFlag;
        let absOther;

        // Optimized path for multiplication by a small number.
        if (otherNum.isCompact) {
            if (otherChunks === 0) return ValueContainer[0]; // Multiply by zero.
            if (otherChunks === 1) return this; // Multiply by one.
            if (otherChunks === -1) return this.flipSign(); // Multiply by negative one.

            absOther = Math.abs(otherChunks);
            if (absOther < PARTITION_UNIT) {
                return new GrandNum(multiplyByNative(myChunks, absOther), resultSign);
            }
            otherChunks = nativeToChunks(absOther); // Convert small number to chunks.
        }

        // Decide between Karatsuba and long multiplication.
        if (isKaratsubaEfficient(myChunks.length, otherChunks.length)) {
            return new GrandNum(karatsubaProduct(myChunks, otherChunks), resultSign);
        }
        return new GrandNum(longMultiplication(myChunks, otherChunks), resultSign);
    };

    // Alias for the multiply method.
    GrandNum.prototype.times = GrandNum.prototype.multiply;

    /**
     * Multiplies a small native number by an array of digit chunks, returning a GrandNum.
     * @param {number} smallVal - The small native number.
     * @param {number[]} chunkArray - The array of digit chunks.
     * @param {boolean} resultSign - The sign of the result.
     * @returns {GrandNum} A new GrandNum representing the product.
     */
    function nativeTimesChunks(smallVal, chunkArray, resultSign) {
        if (smallVal < PARTITION_UNIT) {
            return new GrandNum(multiplyByNative(chunkArray, smallVal), resultSign);
        }
        return new GrandNum(longMultiplication(chunkArray, nativeToChunks(smallVal)), resultSign);
    }

    /**
     * Internal helper method for CompactNumber to multiply by another CompactNumber.
     * @param {CompactNumber} otherCompact - The other small number.
     * @returns {ValueContainer} A new CompactNumber or GrandNum.
     */
    CompactNumber.prototype._timesCompact = function(otherCompact) {
        // Check if the product fits within native JS safe integer range.
        if (fitsNativeRange(otherCompact.digitChunks * this.digitChunks)) {
            return new CompactNumber(otherCompact.digitChunks * this.digitChunks);
        }
        // If not, perform multiplication using chunk arrays.
        return nativeTimesChunks(
            Math.abs(otherCompact.digitChunks),
            nativeToChunks(Math.abs(this.digitChunks)),
            this.negFlag !== otherCompact.negFlag
        );
    };

    /**
     * Internal helper method for GrandNum to multiply by a CompactNumber.
     * @param {CompactNumber} otherCompact - The small number multiplier.
     * @returns {GrandNum} A new GrandNum.
     */
    GrandNum.prototype._timesCompact = function(otherCompact) {
        if (otherCompact.digitChunks === 0) return ValueContainer[0];
        if (otherCompact.digitChunks === 1) return this;
        if (otherCompact.digitChunks === -1) return this.flipSign();
        return nativeTimesChunks(
            Math.abs(otherCompact.digitChunks),
            this.digitChunks,
            this.negFlag !== otherCompact.negFlag
        );
    };

    /**
     * SmallInteger prototype method for multiplication.
     * Dispatches to internal helper method based on input type.
     * @param {ValueContainer|number|string} input - The value to multiply.
     * @returns {ValueContainer} A new number object representing the product.
     */
    CompactNumber.prototype.multiply = function(input) {
        return interpretInput(input)._timesCompact(this);
    };

    // Alias for the multiply method.
    CompactNumber.prototype.times = CompactNumber.prototype.multiply;

    /**
     * Computes the square of an array of digit chunks.
     * Optimized squaring algorithm.
     * @param {number[]} chunkArray - The array of digit chunks.
     * @returns {number[]} Resulting array of digit chunks.
     */
    function computeSquare(chunkArray) {
        const len = chunkArray.length;
        const resultArr = initChunkArray(len + len);
        const unit = PARTITION_UNIT;
        let productVal, carryVal, idx, chunkI, chunkJ;

        for (idx = 0; idx < len; idx++) {
            chunkI = chunkArray[idx];
            carryVal = -(chunkI * chunkI); // Initialize carry with the square of the current chunk.
            for (let j = idx; j < len; j++) {
                chunkJ = chunkArray[j];
                productVal = 2 * (chunkI * chunkJ) + resultArr[idx + j] + carryVal;
                carryVal = Math.floor(productVal / unit);
                resultArr[idx + j] = productVal - carryVal * unit;
            }
            resultArr[idx + len] = carryVal; // Store final carry for this row.
        }
        cleanUpChunks(resultArr); // Remove leading zeros.
        return resultArr;
    }

    /**
     * GrandNum prototype method to compute the square.
     * @returns {GrandNum} A new GrandNum representing the square.
     */
    GrandNum.prototype.square = function() {
        return new GrandNum(computeSquare(this.digitChunks), false); // Square is always positive.
    };

    /**
     * CompactNumber prototype method to compute the square.
     * Handles potential overflow to GrandNum.
     * @returns {ValueContainer} A new CompactNumber or GrandNum.
     */
    CompactNumber.prototype.square = function() {
        const squaredVal = this.digitChunks * this.digitChunks;
        if (fitsNativeRange(squaredVal)) {
            return new CompactNumber(squaredVal);
        }
        // If it overflows, convert to chunks and square.
        return new GrandNum(computeSquare(nativeToChunks(Math.abs(this.digitChunks))), false);
    };

    /**
     * Division with remainder for large numbers (Algorithm 1: optimized for smaller divisors).
     * Based on Knuth's Algorithm D.
     * @param {number[]} dividendChunks - The dividend as an array of chunks.
     * @param {number[]} divisorChunks - The divisor as an array of chunks.
     * @returns {[ValueContainer, ValueContainer]} An array containing [quotient, remainder].
     */
    function longDivisionMod1(dividendChunks, divisorChunks) {
        const divdLen = dividendChunks.length, divrLen = divisorChunks.length;
        const quotientChunks = initChunkArray(divrLen); // Result array for quotient.
        const unit = PARTITION_UNIT;

        // Normalization step: scale dividend and divisor to make divisor's MSB large.
        const divisorMostSignificantDigit = divisorChunks[divrLen - 1];
        const normalizationFactor = Math.ceil(unit / (2 * divisorMostSignificantDigit)); // d in Knuth
        let remainder = multiplyByNative(dividendChunks, normalizationFactor);
        const divisor = multiplyByNative(divisorChunks, normalizationFactor);

        let quotientDigit, shiftCount, carry, borrow, idx, len, qEstimate;

        // Ensure remainder has enough leading zeros for subtraction (r_m+n+1).
        if (remainder.length <= divdLen) {
            remainder.push(0);
        }
        divisor.push(0); // Pad divisor to match remainder length for easier indexing.

        const normalizedDivisorMSD = divisor[divrLen - 1];

        // Main loop for calculating quotient digits.
        for (shiftCount = divdLen - divrLen; shiftCount >= 0; shiftCount--) {
            // Estimate quotient digit.
            quotientDigit = unit - 1;
            if (remainder[shiftCount + divrLen] !== normalizedDivisorMSD) {
                quotientDigit = Math.floor(
                    (remainder[shiftCount + divrLen] * unit + remainder[shiftCount + divrLen - 1]) / normalizedDivisorMSD
                );
            }

            carry = 0;
            borrow = 0;
            len = divisor.length;

            // Multiply divisor by q and subtract from appropriate part of remainder.
            for (idx = 0; idx < len; idx++) {
                carry += quotientDigit * divisor[idx];
                qEstimate = Math.floor(carry / unit);
                borrow += remainder[shiftCount + idx] - (carry - qEstimate * unit);
                carry = qEstimate;
                if (borrow < 0) {
                    remainder[shiftCount + idx] = borrow + unit;
                    borrow = -1;
                } else {
                    remainder[shiftCount + idx] = borrow;
                    borrow = 0;
                }
            }

            // Adjust quotient digit if the subtraction resulted in a negative remainder part.
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (idx = 0; idx < len; idx++) {
                    carry += remainder[shiftCount + idx] - unit + divisor[idx];
                    if (carry < 0) {
                        remainder[shiftCount + idx] = carry + unit;
                        carry = 0;
                    } else {
                        remainder[shiftCount + idx] = carry;
                        carry = 1;
                    }
                }
                borrow += carry; // borrow will become 0 if adjustment was successful.
            }
            quotientChunks[shiftCount] = quotientDigit; // Store the calculated quotient digit.
        }

        // Denormalize the remainder.
        remainder = divideChunksByNative(remainder, normalizationFactor)[0];
        return [chunksToNative(quotientChunks), chunksToNative(remainder)];
    }

    /**
     * Division with remainder for large numbers (Algorithm 2: general purpose).
     * Simpler, but potentially slower for very large numbers than Algorithm 1.
     * @param {number[]} dividendChunks - The dividend as an array of chunks.
     * @param {number[]} divisorChunks - The divisor as an array of chunks.
     * @returns {[ValueContainer, ValueContainer]} An array containing [quotient, remainder].
     */
    function longDivisionMod2(dividendChunks, divisorChunks) {
        let divdLen = dividendChunks.length, divrLen = divisorChunks.length;
        const quotientArr = [], currentPart = [];
        const unit = PARTITION_UNIT;
        let estimate, xLength, highX, highY, checkResult;

        // Process dividend chunks from most significant to least significant.
        while (divdLen) {
            currentPart.unshift(dividendChunks[--divdLen]); // Take one chunk from dividend.
            cleanUpChunks(currentPart); // Remove leading zeros from current part.

            // If current part is smaller than divisor, quotient digit is 0.
            if (compareAbsoluteParts(currentPart, divisorChunks) < 0) {
                quotientArr.push(0);
                continue;
            }

            // Estimate quotient digit.
            xLength = currentPart.length;
            highX = currentPart[xLength - 1] * unit + currentPart[xLength - 2];
            highY = divisorChunks[divrLen - 1] * unit + divisorChunks[divrLen - 2];
            if (xLength > divrLen) {
                highX = (highX + 1) * unit; // Adjust for larger dividend part.
            }
            estimate = Math.ceil(highX / highY);

            // Refine estimate by trial multiplication and subtraction.
            do {
                checkResult = multiplyByNative(divisorChunks, estimate);
                if (compareAbsoluteParts(checkResult, currentPart) <= 0) {
                    break;
                }
                estimate--;
            } while (estimate > 0); // Ensure estimate doesn't go below 0.

            quotientArr.push(estimate); // Add refined quotient digit.
            currentPart = deductChunks(currentPart, checkResult); // Subtract (divisor * estimate).
        }

        quotientArr.reverse(); // Quotient digits were accumulated in reverse.
        return [chunksToNative(quotientArr), chunksToNative(currentPart)];
    }

    /**
     * Divides an array of digit chunks by a small (native) number, returning quotient and remainder.
     * @param {number[]} chunkArray - The dividend as an array of chunks.
     * @param {number} smallDivisor - The small native number divisor.
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideChunksByNative(chunkArray, smallDivisor) {
        const len = chunkArray.length;
        const quotientArr = initChunkArray(len);
        const unit = PARTITION_UNIT;
        let idx, qVal, currentRemainder, currentDivisorChunk;

        currentRemainder = 0;
        // Perform division from most significant to least significant chunk.
        for (idx = len - 1; idx >= 0; --idx) {
            currentDivisorChunk = currentRemainder * unit + chunkArray[idx];
            qVal = floorOrCeil(currentDivisorChunk / smallDivisor);
            currentRemainder = currentDivisorChunk - qVal * smallDivisor;
            quotientArr[idx] = qVal | 0; // Ensure integer value.
        }
        return [quotientArr, currentRemainder | 0]; // Ensure integer value.
    }

    /**
     * General division with remainder function that handles various input types and sizes.
     * @param {ValueContainer} selfInstance - The dividend object (this).
     * @param {ValueContainer|number|string} inputDivisor - The divisor value.
     * @returns {[ValueContainer, ValueContainer]} An array containing [quotient, remainder].
     * @throws {Error} If attempting to divide by zero.
     */
    function performAnyDivisionMod(selfInstance, inputDivisor) {
        let resultPair;
        const otherNum = interpretInput(inputDivisor);
        const dividendChunks = selfInstance.digitChunks;
        let divisorValue = otherNum.digitChunks;
        let computedQuotient;

        if (divisorValue === 0) {
            throw new Error("Cannot divide by zero");
        }

        // Optimized paths for small numbers.
        if (selfInstance.isCompact) {
            if (otherNum.isCompact) {
                // Both are small, use native JS division.
                return [new CompactNumber(floorOrCeil(dividendChunks / divisorValue)), new CompactNumber(dividendChunks % divisorValue)];
            }
            // Small dividend, large divisor -> quotient is 0, remainder is dividend itself.
            return [ValueContainer[0], selfInstance];
        }

        if (otherNum.isCompact) {
            if (divisorValue === 1) return [selfInstance, ValueContainer[0]];
            if (divisorValue === -1) return [selfInstance.flipSign(), ValueContainer[0]];

            const absDivisor = Math.abs(divisorValue);
            if (absDivisor < PARTITION_UNIT) {
                // Divide large number by small native number.
                resultPair = divideChunksByNative(dividendChunks, absDivisor);
                computedQuotient = chunksToNative(resultPair[0]);
                let remainder = resultPair[1];
                if (selfInstance.negFlag) remainder = -remainder;

                // Format quotient and remainder into appropriate number objects.
                if (typeof computedQuotient === "number") {
                    if (selfInstance.negFlag !== otherNum.negFlag) computedQuotient = -computedQuotient;
                    return [new CompactNumber(computedQuotient), new CompactNumber(remainder)];
                }
                return [new GrandNum(computedQuotient, selfInstance.negFlag !== otherNum.negFlag), new CompactNumber(remainder)];
            }
            divisorValue = nativeToChunks(absDivisor); // Convert small divisor to chunks if larger than chunk unit.
        }

        // Handle general large number division.
        const magnitudeComparison = compareAbsoluteParts(dividendChunks, divisorValue);
        if (magnitudeComparison === -1) {
            return [ValueContainer[0], selfInstance]; // Dividend < Divisor.
        }
        if (magnitudeComparison === 0) {
            // Dividend == Divisor.
            return [ValueContainer[selfInstance.negFlag === otherNum.negFlag ? 1 : -1], ValueContainer[0]];
        }

        // Choose division algorithm based on size.
        if (dividendChunks.length + divisorValue.length <= 200) {
            resultPair = longDivisionMod1(dividendChunks, divisorValue);
        } else {
            resultPair = longDivisionMod2(dividendChunks, divisorValue);
        }

        computedQuotient = resultPair[0];
        let computedRemainder = resultPair[1];

        // Determine signs for quotient and remainder.
        const quotientSign = selfInstance.negFlag !== otherNum.negFlag;
        const remainderSign = selfInstance.negFlag;

        if (typeof computedQuotient === "number") {
            if (quotientSign) computedQuotient = -computedQuotient;
            computedQuotient = new CompactNumber(computedQuotient);
        } else {
            computedQuotient = new GrandNum(computedQuotient, quotientSign);
        }

        if (typeof computedRemainder === "number") {
            if (remainderSign) computedRemainder = -computedRemainder;
            computedRemainder = new CompactNumber(computedRemainder);
        } else {
            computedRemainder = new GrandNum(computedRemainder, remainderSign);
        }

        return [computedQuotient, computedRemainder];
    }

    /**
     * GrandNum prototype method to get quotient and remainder.
     * @param {ValueContainer|number|string} input - The divisor.
     * @returns {{quotient: ValueContainer, remainder: ValueContainer}} Object with quotient and remainder.
     */
    GrandNum.prototype.divmod = function(input) {
        const results = performAnyDivisionMod(this, input);
        return { quotient: results[0], remainder: results[1] };
    };

    // SmallInteger also uses the same divmod implementation.
    CompactNumber.prototype.divmod = GrandNum.prototype.divmod;

    /**
     * GrandNum prototype method for division (returns only the quotient).
     * @param {ValueContainer|number|string} input - The divisor.
     * @returns {ValueContainer} The quotient.
     */
    GrandNum.prototype.divide = function(input) {
        return performAnyDivisionMod(this, input)[0];
    };

    // Aliases for division.
    CompactNumber.prototype.over = CompactNumber.prototype.divide = GrandNum.prototype.over = GrandNum.prototype.divide;

    /**
     * GrandNum prototype method for modulo (returns only the remainder).
     * @param {ValueContainer|number|string} input - The divisor.
     * @returns {ValueContainer} The remainder.
     */
    GrandNum.prototype.mod = function(input) {
        return performAnyDivisionMod(this, input)[1];
    };

    // Aliases for modulo/remainder.
    CompactNumber.prototype.remainder = CompactNumber.prototype.mod = GrandNum.prototype.remainder = GrandNum.prototype.mod;

    /**
     * GrandNum prototype method for exponentiation (power).
     * @param {ValueContainer|number|string} exponent - The exponent.
     * @returns {ValueContainer} The result of `this` raised to the `exponent`.
     * @throws {Error} If exponent is too large (only small exponents supported).
     */
    GrandNum.prototype.pow = function(exponent) {
        const expNum = interpretInput(exponent);
        const myChunks = this.digitChunks;
        let expVal = expNum.digitChunks;
        let resultVal, baseRef, resultRef;

        if (expVal === 0) return ValueContainer[1]; // Any number to power 0 is 1.
        if (myChunks === 0) return ValueContainer[0]; // 0 to any positive power is 0.
        if (myChunks === 1) return ValueContainer[1]; // 1 to any power is 1.
        if (myChunks === -1) return expNum.isDivisibleByTwo() ? ValueContainer[1] : ValueContainer[-1]; // -1 to even/odd power.

        if (expNum.negFlag) {
            return ValueContainer[0]; // Negative exponents for integers result in 0 (truncate towards zero).
        }
        if (!expNum.isCompact) {
            throw new Error("The exponent " + expNum.toTextRepresentation() + " is too large.");
        }

        // For small bases, try native `Math.pow`.
        if (this.isCompact) {
            if (fitsNativeRange(resultVal = Math.pow(myChunks, expVal))) {
                return new CompactNumber(floorOrCeil(resultVal));
            }
        }

        baseRef = this;
        resultRef = ValueContainer[1];

        // Binary exponentiation (exponentiation by squaring).
        while (true) {
            if ((expVal & 1) === 1) { // If exponent is odd.
                resultRef = resultRef.times(baseRef);
                expVal--;
            }
            if (expVal === 0) break; // Exponent exhausted.
            expVal /= 2;
            baseRef = baseRef.square();
        }
        return resultRef;
    };

    // SmallInteger also uses the same pow implementation.
    CompactNumber.prototype.pow = GrandNum.prototype.pow;

    /**
     * GrandNum prototype method for modular exponentiation (`(base^exp) % mod`).
     * @param {ValueContainer|number|string} exponent - The exponent.
     * @param {ValueContainer|number|string} modulus - The modulus.
     * @returns {ValueContainer} The result of `(this^exponent) % modulus`.
     * @throws {Error} If modulus is zero.
     */
    GrandNum.prototype.modPow = function(exponent, modulus) {
        exponent = interpretInput(exponent);
        modulus = interpretInput(modulus);

        if (modulus.isEqualZero()) {
            throw new Error("Cannot take modular exponentiation with modulus 0");
        }

        let result = ValueContainer[1],
            currentBase = this.mod(modulus); // (base % mod)

        // Standard modular exponentiation algorithm.
        while (exponent.isGreaterThanZero()) {
            if (currentBase.isEqualZero()) return ValueContainer[0]; // Optimization: if base % mod is 0, result is 0.
            if (exponent.isNotDivisibleByTwo()) { // If exponent is odd.
                result = result.multiply(currentBase).mod(modulus);
            }
            exponent = exponent.divide(2);
            currentBase = currentBase.square().mod(modulus);
        }
        return result;
    };

    // SmallInteger also uses the same modPow implementation.
    CompactNumber.prototype.modPow = GrandNum.prototype.modPow;

    /**
     * Compares the absolute values of two arrays of digit chunks.
     * @param {number[]} a - First array.
     * @param {number[]} b - Second array.
     * @returns {-1|0|1} -1 if a < b, 0 if a == b, 1 if a > b.
     */
    function compareAbsoluteParts(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1; // Longer array is larger.
        }
        // Compare chunks from most significant to least significant.
        for (let i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) {
                return a[i] > b[i] ? 1 : -1;
            }
        }
        return 0; // Arrays are identical.
    }

    /**
     * GrandNum prototype method to compare absolute values.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {-1|0|1} Comparison result.
     */
    GrandNum.prototype.compareAbsolute = function(input) {
        const otherNum = interpretInput(input);
        const myChunks = this.digitChunks;
        const otherChunks = otherNum.digitChunks;

        // If the other number is small, this GrandNum is larger (unless it's zero).
        if (otherNum.isCompact) {
            return 1;
        }
        return compareAbsoluteParts(myChunks, otherChunks);
    };

    /**
     * CompactNumber prototype method to compare absolute values.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {-1|0|1} Comparison result.
     */
    CompactNumber.prototype.compareAbsolute = function(input) {
        const otherNum = interpretInput(input);
        const myAbsValue = Math.abs(this.digitChunks);
        let otherAbsValue = otherNum.digitChunks;

        if (otherNum.isCompact) {
            otherAbsValue = Math.abs(otherAbsValue);
            return myAbsValue === otherAbsValue ? 0 : (myAbsValue > otherAbsValue ? 1 : -1);
        }
        // If other is GrandNum, this CompactNumber is smaller.
        return -1;
    };

    /**
     * GrandNum prototype method for general comparison.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {-1|0|1} Comparison result.
     */
    GrandNum.prototype.compare = function(input) {
        if (input === Infinity) {
            return -1;
        }
        if (input === -Infinity) {
            return 1;
        }

        const otherNum = interpretInput(input);
        const myChunks = this.digitChunks;
        const otherChunks = otherNum.digitChunks;

        // Compare signs first.
        if (this.negFlag !== otherNum.negFlag) {
            return otherNum.negFlag ? 1 : -1; // If this is positive and other is negative, this > other.
        }

        // If other is small, this GrandNum is "larger" in magnitude (if both positive) or "smaller" (if both negative).
        if (otherNum.isCompact) {
            return this.negFlag ? -1 : 1; // If negative, GrandNum is smaller (e.g. -100 < -5). If positive, GrandNum is larger (e.g. 100 > 5).
        }

        // Compare absolute values, then adjust for sign.
        return compareAbsoluteParts(myChunks, otherChunks) * (this.negFlag ? -1 : 1);
    };

    // Alias for compare.
    GrandNum.prototype.compareTo = GrandNum.prototype.compare;

    /**
     * CompactNumber prototype method for general comparison.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {-1|0|1} Comparison result.
     */
    CompactNumber.prototype.compare = function(input) {
        if (input === Infinity) {
            return -1;
        }
        if (input === -Infinity) {
            return 1;
        }

        const otherNum = interpretInput(input);
        const myValue = this.digitChunks;
        const otherValue = otherNum.digitChunks;

        if (otherNum.isCompact) {
            return myValue === otherValue ? 0 : (myValue > otherValue ? 1 : -1);
        }
        // If signs are different, compare based on sign.
        if (myValue < 0 !== otherNum.negFlag) {
            return myValue < 0 ? -1 : 1;
        }
        // If signs are same, and one is compact and other is grand, then compact is smaller (if positive) or larger (if negative).
        return myValue < 0 ? 1 : -1; // e.g. -5 > -100 (Compact > GrandNum). 5 < 100 (Compact < GrandNum).
    };

    // Alias for compare.
    CompactNumber.prototype.compareTo = CompactNumber.prototype.compare;

    /**
     * Checks if two numbers are equal.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if equal, false otherwise.
     */
    GrandNum.prototype.equals = function(input) {
        return this.compare(input) === 0;
    };

    // Aliases for equality.
    CompactNumber.prototype.eq = CompactNumber.prototype.equals = GrandNum.prototype.eq = GrandNum.prototype.equals;

    /**
     * Checks if two numbers are not equal.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if not equal, false otherwise.
     */
    GrandNum.prototype.notEquals = function(input) {
        return this.compare(input) !== 0;
    };

    // Aliases for inequality.
    CompactNumber.prototype.neq = CompactNumber.prototype.notEquals = GrandNum.prototype.neq = GrandNum.prototype.notEquals;

    /**
     * Checks if `this` is greater than `input`.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if greater, false otherwise.
     */
    GrandNum.prototype.greater = function(input) {
        return this.compare(input) > 0;
    };

    // Aliases for greater than.
    CompactNumber.prototype.gt = CompactNumber.prototype.greater = GrandNum.prototype.gt = GrandNum.prototype.greater;

    /**
     * Checks if `this` is lesser than `input`.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if lesser, false otherwise.
     */
    GrandNum.prototype.lesser = function(input) {
        return this.compare(input) < 0;
    };

    // Aliases for lesser than.
    CompactNumber.prototype.lt = CompactNumber.prototype.lesser = GrandNum.prototype.lt = GrandNum.prototype.lesser;

    /**
     * Checks if `this` is greater than or equal to `input`.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if greater or equal, false otherwise.
     */
    GrandNum.prototype.greaterOrEquals = function(input) {
        return this.compare(input) >= 0;
    };

    // Aliases for greater or equal.
    CompactNumber.prototype.geq = CompactNumber.prototype.greaterOrEquals = GrandNum.prototype.geq = GrandNum.prototype.greaterOrEquals;

    /**
     * Checks if `this` is lesser than or equal to `input`.
     * @param {ValueContainer|number|string} input - The value to compare with.
     * @returns {boolean} True if lesser or equal, false otherwise.
     */
    GrandNum.prototype.lesserOrEquals = function(input) {
        return this.compare(input) <= 0;
    };

    // Aliases for lesser or equal.
    CompactNumber.prototype.leq = CompactNumber.prototype.lesserOrEquals = GrandNum.prototype.leq = GrandNum.prototype.lesserOrEquals;

    /**
     * Checks if the GrandNum is an even number.
     * @returns {boolean} True if even, false otherwise.
     */
    GrandNum.prototype.isDivisibleByTwo = function() {
        return (this.digitChunks[0] & 1) === 0;
    };

    /**
     * Checks if the CompactNumber is an even number.
     * @returns {boolean} True if even, false otherwise.
     */
    CompactNumber.prototype.isDivisibleByTwo = function() {
        return (this.digitChunks & 1) === 0;
    };

    /**
     * Checks if the GrandNum is an odd number.
     * @returns {boolean} True if odd, false otherwise.
     */
    GrandNum.prototype.isNotDivisibleByTwo = function() {
        return (this.digitChunks[0] & 1) === 1;
    };

    /**
     * Checks if the CompactNumber is an odd number.
     * @returns {boolean} True if odd, false otherwise.
     */
    CompactNumber.prototype.isNotDivisibleByTwo = function() {
        return (this.digitChunks & 1) === 1;
    };

    /**
     * Checks if the GrandNum is positive.
     * @returns {boolean} True if positive, false otherwise.
     */
    GrandNum.prototype.isGreaterThanZero = function() {
        return !this.negFlag;
    };

    /**
     * Checks if the CompactNumber is positive.
     * @returns {boolean} True if positive, false otherwise.
     */
    CompactNumber.prototype.isGreaterThanZero = function() {
        return this.digitChunks > 0;
    };

    /**
     * Checks if the GrandNum is negative.
     * @returns {boolean} True if negative, false otherwise.
     */
    GrandNum.prototype.isLessThanZero = function() {
        return this.negFlag;
    };

    /**
     * Checks if the CompactNumber is negative.
     * @returns {boolean} True if negative, false otherwise.
     */
    CompactNumber.prototype.isLessThanZero = function() {
        return this.digitChunks < 0;
    };

    /**
     * Checks if the GrandNum is 1 or -1.
     * @returns {boolean} Always false for GrandNum (as it stores chunks, not direct value).
     */
    GrandNum.prototype.isOneOrMinusOne = function() {
        return false;
    };

    /**
     * Checks if the CompactNumber is 1 or -1.
     * @returns {boolean} True if 1 or -1, false otherwise.
     */
    CompactNumber.prototype.isOneOrMinusOne = function() {
        return Math.abs(this.digitChunks) === 1;
    };

    /**
     * Checks if the GrandNum is zero.
     * @returns {boolean} Always false for GrandNum (only CompactNumber can be 0).
     */
    GrandNum.prototype.isEqualZero = function() {
        return false;
    };

    /**
     * Checks if the CompactNumber is zero.
     * @returns {boolean} True if zero, false otherwise.
     */
    CompactNumber.prototype.isEqualZero = function() {
        return this.digitChunks === 0;
    };

    /**
     * Checks if the number is divisible by another number.
     * @param {ValueContainer|number|string} input - The divisor.
     * @returns {boolean} True if divisible, false otherwise.
     */
    GrandNum.prototype.canBeDividedBy = function(input) {
        const otherNum = interpretInput(input);
        const otherVal = otherNum.digitChunks;

        if (otherVal === 0) return false;
        if (otherVal === 1) return true;
        if (otherVal === 2) return this.isDivisibleByTwo();
        return this.mod(otherNum).equals(ValueContainer[0]);
    };

    // SmallInteger also uses the same isDivisibleBy implementation.
    CompactNumber.prototype.canBeDividedBy = GrandNum.prototype.canBeDividedBy;

    /**
     * Checks if a number is a basic small prime (2, 3, 5) or divisible by them.
     * @param {ValueContainer} numObj - The number object.
     * @returns {boolean|undefined} True if prime, false if composite, undefined if inconclusive.
     */
    function checkSmallPrime(numObj) {
        const magnitude = numObj.absoluteValue();
        if (magnitude.isOneOrMinusOne()) return false; // 1 is not prime.
        if (magnitude.equals(2) || magnitude.equals(3) || magnitude.equals(5)) return true;
        if (magnitude.isDivisibleByTwo() || magnitude.canBeDividedBy(3) || magnitude.canBeDividedBy(5)) return false;
        if (magnitude.lesser(25)) return true; // Primes up to 23 not caught by previous checks.
    }

    /**
     * GrandNum prototype method to check if the number is prime using Miller-Rabin test.
     * @returns {boolean} True if prime, false otherwise.
     */
    GrandNum.prototype.isDefinitelyPrime = function() {
        const smallPrimeCheck = checkSmallPrime(this);
        if (smallPrimeCheck !== unassigned) return smallPrimeCheck;

        const numAbs = this.absoluteValue();
        let numAbsMinusOne = numAbs.minusOne(); // n-1
        const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19]; // Witness values for Miller-Rabin.
        let dVal, tFlag, idx, testX;

        // Find d and s such that n-1 = d * 2^s (where d is odd).
        while (numAbsMinusOne.isDivisibleByTwo()) {
            numAbsMinusOne = numAbsMinusOne.divide(2);
        }
        dVal = numAbsMinusOne; // d is now numAbsMinusOne

        // Miller-Rabin test for each witness.
        for (idx = 0; idx < testPrimes.length; idx++) {
            testX = grandNumMaker(testPrimes[idx]).modPow(dVal, numAbs); // a^d mod n
            if (testX.equals(ValueContainer[1]) || testX.equals(numAbs.minusOne())) continue; // If a^d == 1 or a^d == n-1 (mod n), it's a strong probable prime.

            tFlag = true;
            // Check a^(d*2^r) mod n for r from 1 to s-1
            for (let currentD = dVal; tFlag && currentD.lesser(numAbs.minusOne()); currentD = currentD.multiply(2)) {
                testX = testX.square().mod(numAbs);
                if (testX.equals(numAbs.minusOne())) tFlag = false; // If a^(d*2^r) == n-1 (mod n), it's a strong probable prime.
            }
            if (tFlag) return false; // If none of the conditions met, it's composite.
        }
        return true; // Passed all tests, likely prime.
    };

    // SmallInteger also uses the same isPrime implementation.
    CompactNumber.prototype.isDefinitelyPrime = GrandNum.prototype.isDefinitelyPrime;

    /**
     * GrandNum prototype method to check if the number is probably prime (probabilistic test).
     * @param {number} [iterations] - Number of iterations for the test (default 5).
     * @returns {boolean} True if probably prime, false otherwise.
     */
    GrandNum.prototype.isLikelyPrime = function(iterations) {
        const smallPrimeCheck = checkSmallPrime(this);
        if (smallPrimeCheck !== unassigned) return smallPrimeCheck;

        const numAbs = this.absoluteValue();
        const numIterations = iterations === unassigned ? 5 : iterations;

        // Perform `numIterations` Miller-Rabin tests with random bases.
        for (let i = 0; i < numIterations; i++) {
            const randomBase = grandNumMaker.randomBetween(2, numAbs.minusOne().minusOne()); // rand between 2 and n-2
            if (!randomBase.modPow(numAbs.minusOne(), numAbs).isOneOrMinusOne()) { // Check a^(n-1) == 1 (mod n)
                return false; // Not a probable prime.
            }
        }
        return true; // Passed all iterations, likely prime.
    };

    // SmallInteger also uses the same isProbablePrime implementation.
    CompactNumber.prototype.isLikelyPrime = GrandNum.prototype.isLikelyPrime;

    /**
     * GrandNum prototype method to compute the modular multiplicative inverse.
     * Extended Euclidean Algorithm.
     * @param {ValueContainer|number|string} modulus - The modulus.
     * @returns {ValueContainer} The modular inverse of `this` modulo `modulus`.
     * @throws {Error} If `this` and `modulus` are not coprime.
     */
    GrandNum.prototype.modularInverse = function(modulus) {
        let oldT = grandNumMaker.zero, currentT = grandNumMaker.one;
        let oldR = interpretInput(modulus), currentR = this.absoluteValue();
        let quotient, tempT, tempR;

        // Extended Euclidean Algorithm.
        while (!currentR.isEqualZero()) {
            quotient = oldR.divide(currentR);
            tempT = oldT;
            tempR = oldR;
            oldT = currentT;
            oldR = currentR;
            currentT = tempT.subtract(quotient.multiply(currentT));
            currentR = tempR.subtract(quotient.multiply(currentR));
        }

        // If gcd(this, modulus) is not 1, inverse does not exist.
        if (!oldR.equals(1)) {
            throw new Error(this.toTextRepresentation() + " and " + modulus.toTextRepresentation() + " are not co-prime");
        }

        // Adjust result to be positive within the modulus range.
        if (oldT.compare(0) === -1) {
            oldT = oldT.add(modulus);
        }

        // If original number was negative, the inverse must also be negative.
        if (this.isLessThanZero()) {
            return oldT.flipSign();
        }
        return oldT;
    };

    // SmallInteger also uses the same modInv implementation.
    CompactNumber.prototype.modularInverse = GrandNum.prototype.modularInverse;

    /**
     * GrandNum prototype method to get the next integer (this + 1).
     * @returns {ValueContainer} A new number object representing (this + 1).
     */
    GrandNum.prototype.plusOne = function() {
        const myChunks = this.digitChunks;
        if (this.negFlag) {
            return deductCompactValue(myChunks, 1, this.negFlag); // For negative numbers, adding 1 is subtracting 1 from absolute value.
        }
        return new GrandNum(addToChunks(myChunks, 1), this.negFlag);
    };

    /**
     * CompactNumber prototype method to get the next integer (this + 1).
     * Handles potential overflow to GrandNum.
     * @returns {ValueContainer} A new number object representing (this + 1).
     */
    CompactNumber.prototype.plusOne = function() {
        const myValue = this.digitChunks;
        if (myValue + 1 < JS_MAX_VAL) {
            return new CompactNumber(myValue + 1);
        }
        // If overflow, return a GrandNum based on MAX_INT_ARR.
        return new GrandNum(SAFE_LIMIT_ARRAY, false);
    };

    /**
     * GrandNum prototype method to get the previous integer (this - 1).
     * @returns {ValueContainer} A new number object representing (this - 1).
     */
    GrandNum.prototype.minusOne = function() {
        const myChunks = this.digitChunks;
        if (this.negFlag) {
            return new GrandNum(addToChunks(myChunks, 1), true); // For negative numbers, subtracting 1 is adding 1 to absolute value.
        }
        return deductCompactValue(myChunks, 1, this.negFlag);
    };

    /**
     * CompactNumber prototype method to get the previous integer (this - 1).
     * Handles potential underflow to GrandNum.
     * @returns {ValueContainer} A new number object representing (this - 1).
     */
    CompactNumber.prototype.minusOne = function() {
        const myValue = this.digitChunks;
        if (myValue - 1 > -JS_MAX_VAL) {
            return new CompactNumber(myValue - 1);
        }
        // If underflow, return a GrandNum based on MAX_INT_ARR (negative).
        return new GrandNum(SAFE_LIMIT_ARRAY, true);
    };

    // Precompute powers of two up to the PARTITION_UNIT.
    const twoPowers = [1];
    while (2 * twoPowers[twoPowers.length - 1] <= PARTITION_UNIT) {
        twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
    }
    const twoPowersLen = twoPowers.length;
    const maxTwoPower = twoPowers[twoPowersLen - 1]; // Largest power of 2 less than or equal to PARTITION_UNIT.

    /**
     * Checks if a shift amount is small enough to be handled natively or as a CompactNumber.
     * @param {number|string|GrandNum} shiftAmount - The amount to shift by.
     * @returns {boolean} True if the shift amount is compact, false otherwise.
     */
    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= PARTITION_UNIT ||
            shiftAmount instanceof GrandNum && shiftAmount.digitChunks.length <= 1;
    }

    /**
     * GrandNum prototype method for left bit shift.
     * Multiplies by powers of two.
     * @param {number|string|GrandNum} shiftAmount - The number of bits to shift.
     * @returns {GrandNum} A new GrandNum representing the shifted value.
     * @throws {Error} If shift amount is too large.
     */
    GrandNum.prototype.moveBitsLeft = function(shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        shiftAmount = +shiftAmount; // Ensure it's a number.
        if (shiftAmount < 0) {
            return this.moveBitsRight(-shiftAmount); // Convert negative left shift to right shift.
        }
        let currentResult = this;
        if (currentResult.isEqualZero()) return currentResult;

        // Multiply by highest power of two until shiftAmount is small.
        while (shiftAmount >= twoPowersLen) {
            currentResult = currentResult.multiply(maxTwoPower);
            shiftAmount -= (twoPowersLen - 1); // Each multiply by maxTwoPower is a shift by (twoPowersLen - 1) bits.
        }
        return currentResult.multiply(twoPowers[shiftAmount]); // Multiply by remaining power of two.
    };

    // SmallInteger also uses the same shiftLeft implementation.
    CompactNumber.prototype.moveBitsLeft = GrandNum.prototype.moveBitsLeft;

    /**
     * GrandNum prototype method for right bit shift.
     * Divides by powers of two.
     * @param {number|string|GrandNum} shiftAmount - The number of bits to shift.
     * @returns {ValueContainer} A new number object representing the shifted value.
     * @throws {Error} If shift amount is too large.
     */
    GrandNum.prototype.moveBitsRight = function(shiftAmount) {
        let divModResult;
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        shiftAmount = +shiftAmount; // Ensure it's a number.
        if (shiftAmount < 0) {
            return this.moveBitsLeft(-shiftAmount); // Convert negative right shift to left shift.
        }
        let currentResult = this;

        // Repeatedly divide by highest power of two until shiftAmount is small.
        while (shiftAmount >= twoPowersLen) {
            if (currentResult.isEqualZero() || (currentResult.isLessThanZero() && currentResult.isOneOrMinusOne())) {
                return currentResult; // Handle -1 and 0.
            }
            divModResult = performAnyDivisionMod(currentResult, maxTwoPower);
            currentResult = divModResult[1].isLessThanZero() ? divModResult[0].minusOne() : divModResult[0]; // Round towards negative infinity.
            shiftAmount -= (twoPowersLen - 1);
        }

        // Divide by remaining power of two.
        divModResult = performAnyDivisionMod(currentResult, twoPowers[shiftAmount]);
        return divModResult[1].isLessThanZero() ? divModResult[0].minusOne() : divModResult[0];
    };

    // SmallInteger also uses the same shiftRight implementation.
    CompactNumber.prototype.moveBitsRight = GrandNum.prototype.moveBitsRight;

    /**
     * Generic bitwise operation function for GrandNum and CompactNumber.
     * @param {ValueContainer} xNum - First operand.
     * @param {ValueContainer} yNum - Second operand.
     * @param {function} bitwiseFn - The bitwise function to apply (e.g., `&`, `|`, `^`).
     * @returns {ValueContainer} The result of the bitwise operation.
     */
    function performBitwiseOp(xNum, yNum, bitwiseFn) {
        yNum = interpretInput(yNum);
        const xIsNegative = xNum.isLessThanZero();
        const yIsNegative = yNum.isLessThanZero();

        // Convert to two's complement representation if negative.
        let xRemaining = xIsNegative ? xNum.complement() : xNum;
        let yRemaining = yIsNegative ? yNum.complement() : yNum;

        let xDigit = 0, yDigit = 0;
        let xDivModResult = null, yDivModResult = null;
        const opResults = [];
        const unit = maxTwoPower; // Using maxTwoPower as the "bit chunk" for bitwise ops.

        // Perform bitwise operation chunk by chunk.
        while (!xRemaining.isEqualZero() || !yRemaining.isEqualZero()) {
            xDivModResult = performAnyDivisionMod(xRemaining, unit);
            xDigit = xDivModResult[1].toNativeNumber(); // Get remainder for current chunk.
            if (xIsNegative) {
                xDigit = unit - 1 - xDigit; // Apply two's complement for this chunk.
            }

            yDivModResult = performAnyDivisionMod(yRemaining, unit);
            yDigit = yDivModResult[1].toNativeNumber();
            if (yIsNegative) {
                yDigit = unit - 1 - yDigit;
            }

            xRemaining = xDivModResult[0]; // Update remaining part of number.
            yRemaining = yDivModResult[0];
            opResults.push(bitwiseFn(xDigit, yDigit)); // Apply bitwise function.
        }

        // Calculate the sign of the final result.
        let finalSum = bitwiseFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0) !== 0 ? grandNumMaker(-1) : grandNumMaker(0);

        // Reconstruct the number from the processed chunks.
        for (let i = opResults.length - 1; i >= 0; i -= 1) {
            finalSum = finalSum.multiply(unit).add(grandNumMaker(opResults[i]));
        }
        return finalSum;
    }

    /**
     * GrandNum prototype method for bitwise NOT (~).
     * Implemented as -(N+1) using two's complement.
     * @returns {GrandNum} The result of bitwise NOT.
     */
    GrandNum.prototype.complement = function() {
        return this.flipSign().minusOne();
    };

    // SmallInteger also uses the same not implementation.
    CompactNumber.prototype.complement = GrandNum.prototype.complement;

    /**
     * GrandNum prototype method for bitwise AND (&).
     * @param {ValueContainer|number|string} input - The other operand.
     * @returns {ValueContainer} The result of bitwise AND.
     */
    GrandNum.prototype.bitwiseAnd = function(input) {
        return performBitwiseOp(this, input, function(a, b) { return a & b; });
    };

    // SmallInteger also uses the same and implementation.
    CompactNumber.prototype.bitwiseAnd = GrandNum.prototype.bitwiseAnd;

    /**
     * GrandNum prototype method for bitwise OR (|).
     * @param {ValueContainer|number|string} input - The other operand.
     * @returns {ValueContainer} The result of bitwise OR.
     */
    GrandNum.prototype.bitwiseOr = function(input) {
        return performBitwiseOp(this, input, function(a, b) { return a | b; });
    };

    // SmallInteger also uses the same or implementation.
    CompactNumber.prototype.bitwiseOr = GrandNum.prototype.bitwiseOr;

    /**
     * GrandNum prototype method for bitwise XOR (^).
     * @param {ValueContainer|number|string} input - The other operand.
     * @returns {ValueContainer} The result of bitwise XOR.
     */
    GrandNum.prototype.bitwiseXor = function(input) {
        return performBitwiseOp(this, input, function(a, b) { return a ^ b; });
    };

    // SmallInteger also uses the same xor implementation.
    CompactNumber.prototype.bitwiseXor = GrandNum.prototype.bitwiseXor;

    const INT_LOB_MASK = 1 << 30; // Mask for lowest one bit for native ints.
    const BIG_LOB_MASK = (PARTITION_UNIT & -PARTITION_UNIT) * (PARTITION_UNIT & -PARTITION_UNIT) | INT_LOB_MASK; // Mask for lowest one bit for big ints.

    /**
     * Estimates the position of the lowest one bit (Least Significant Bit).
     * @param {ValueContainer} numObj - The number object.
     * @returns {number} An approximation of the lowest one bit position.
     */
    function approxLOB(numObj) {
        const numVal = numObj.digitChunks;
        // Use native bitwise AND for small numbers or the first chunk for large numbers.
        const maskedVal = typeof numVal === "number" ? numVal | INT_LOB_MASK : numVal[0] + numVal[1] * PARTITION_UNIT | BIG_LOB_MASK;
        return maskedVal & -maskedVal; // Returns the value of the lowest one bit.
    }

    /**
     * Computes the integer logarithm (log_base(value)).
     * Used internally for bitLength calculation.
     * @param {ValueContainer} currentVal - The value.
     * @param {ValueContainer} baseVal - The base of the logarithm.
     * @returns {{p: ValueContainer, e: number}} Object containing partial result 'p' and exponent 'e'.
     */
    function integralLog(currentVal, baseVal) {
        if (baseVal.compareTo(currentVal) <= 0) {
            // Recursive step: log_b(x) = 2 * log_(b^2)(x)
            const tempResult = integralLog(currentVal, baseVal.square());
            const pVal = tempResult.p;
            const expVal = tempResult.e;
            const product = pVal.multiply(baseVal);
            return product.compareTo(currentVal) <= 0 ? { p: product, e: expVal * 2 + 1 } : { p: pVal, e: expVal * 2 };
        }
        return { p: grandNumMaker(1), e: 0 }; // Base case: log_b(x) where x < b.
    }

    /**
     * GrandNum prototype method to calculate the bit length (number of bits required to represent the number).
     * @returns {ValueContainer} The bit length as a number object.
     */
    GrandNum.prototype.calcBitLen = function() {
        let numRef = this;
        if (numRef.compareTo(grandNumMaker(0)) < 0) {
            numRef = numRef.flipSign().subtract(grandNumMaker(1)); // Two's complement for negative numbers.
        }
        if (numRef.compareTo(grandNumMaker(0)) === 0) {
            return grandNumMaker(0); // Bit length of 0 is 0.
        }
        // Use integer logarithm base 2.
        return grandNumMaker(integralLog(numRef, grandNumMaker(2)).e).add(grandNumMaker(1));
    };

    // SmallInteger also uses the same bitLength implementation.
    CompactNumber.prototype.calcBitLen = GrandNum.prototype.calcBitLen;

    /**
     * Returns the maximum of two numbers.
     * @param {ValueContainer|number|string} num1 - First number.
     * @param {ValueContainer|number|string} num2 - Second number.
     * @returns {ValueContainer} The larger of the two numbers.
     */
    function findMax(num1, num2) {
        num1 = interpretInput(num1);
        num2 = interpretInput(num2);
        return num1.greater(num2) ? num1 : num2;
    }

    /**
     * Returns the minimum of two numbers.
     * @param {ValueContainer|number|string} num1 - First number.
     * @param {ValueContainer|number|string} num2 - Second number.
     * @returns {ValueContainer} The smaller of the two numbers.
     */
    function findMin(num1, num2) {
        num1 = interpretInput(num1);
        num2 = interpretInput(num2);
        return num1.lesser(num2) ? num1 : num2;
    }

    /**
     * Computes the greatest common divisor (GCD) of two numbers using binary GCD algorithm.
     * @param {ValueContainer|number|string} num1 - First number.
     * @param {ValueContainer|number|string} num2 - Second number.
     * @returns {ValueContainer} The GCD of the two numbers.
     */
    function calcGCD(num1, num2) {
        num1 = interpretInput(num1).absoluteValue();
        num2 = interpretInput(num2).absoluteValue();

        if (num1.equals(num2)) return num1;
        if (num1.isEqualZero()) return num2;
        if (num2.isEqualZero()) return num1;

        let commonFactor = ValueContainer[1];
        let dVal, tempVal;

        // Remove common factors of 2.
        while (num1.isDivisibleByTwo() && num2.isDivisibleByTwo()) {
            dVal = Math.min(approxLOB(num1), approxLOB(num2)); // Find smallest power of 2.
            num1 = num1.divide(dVal);
            num2 = num2.divide(dVal);
            commonFactor = commonFactor.multiply(dVal);
        }

        // Remove factors of 2 from num1.
        while (num1.isDivisibleByTwo()) {
            num1 = num1.divide(approxLOB(num1));
        }

        // Main binary GCD loop.
        do {
            while (num2.isDivisibleByTwo()) {
                num2 = num2.divide(approxLOB(num2));
            }
            if (num1.greater(num2)) {
                tempVal = num2;
                num2 = num1;
                num1 = tempVal;
            }
            num2 = num2.subtract(num1);
        } while (!num2.isEqualZero());

        return commonFactor.isOneOrMinusOne() ? num1 : num1.multiply(commonFactor);
    }

    /**
     * Computes the least common multiple (LCM) of two numbers.
     * LCM(a, b) = |a * b| / GCD(a, b).
     * @param {ValueContainer|number|string} num1 - First number.
     * @param {ValueContainer|number|string} num2 - Second number.
     * @returns {ValueContainer} The LCM of the two numbers.
     */
    function calcLCM(num1, num2) {
        num1 = interpretInput(num1).absoluteValue();
        num2 = interpretInput(num2).absoluteValue();
        return num1.divide(calcGCD(num1, num2)).multiply(num2);
    }

    /**
     * Generates a random number between two given numbers (inclusive).
     * @param {ValueContainer|number|string} lowerBound - The lower bound.
     * @param {ValueContainer|number|string} upperBound - The upper bound.
     * @returns {ValueContainer} A random number within the specified range.
     */
    function getRandRange(lowerBound, upperBound) {
        lowerBound = interpretInput(lowerBound);
        upperBound = interpretInput(upperBound);
        const lowNum = findMin(lowerBound, upperBound);
        const highNum = findMax(lowerBound, upperBound);
        const rangeSize = highNum.subtract(lowNum).add(1);

        if (rangeSize.isCompact) {
            return lowNum.add(Math.floor(Math.random() * rangeSize.digitChunks));
        }

        // For large ranges, generate random digits.
        const rangeLength = rangeSize.digitChunks.length - 1;
        const resultChunks = [];
        let restrictedRange = true; // Flag to ensure generated digits don't exceed range.

        for (let i = rangeLength; i >= 0; i--) {
            const upperLimit = restrictedRange ? rangeSize.digitChunks[i] : PARTITION_UNIT;
            const digit = floorOrCeil(Math.random() * upperLimit);
            resultChunks.unshift(digit); // Prepend digit to build number from MSB.
            if (digit < upperLimit) {
                restrictedRange = false; // Once a digit is less than max, subsequent digits can be anything.
            }
        }
        const finalResult = chunksToNative(resultChunks);
        return lowNum.add(typeof finalResult === "number" ? new CompactNumber(finalResult) : new GrandNum(finalResult, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} textRep - The string representation.
     * @param {number} numBase - The base of the string.
     * @returns {ValueContainer} The parsed number.
     * @throws {Error} If an invalid digit is found for the given base.
     */
    const stringToNumBase = function(textRep, numBase) {
        const strLength = textRep.length;
        const absoluteBase = Math.abs(numBase);

        // Validate digits for the given base.
        for (let i = 0; i < strLength; i++) {
            const char = textRep[i].toLowerCase();
            if (char === "-") continue;
            if (/[a-z0-9]/.test(char)) {
                if (/[0-9]/.test(char) && +char >= absoluteBase) {
                    if (char === "1" && absoluteBase === 1) continue; // Special case for base 1 (unary).
                    throw new Error(char + " is not a valid digit in base " + numBase + ".");
                } else if (char.charCodeAt(0) - 87 >= absoluteBase) { // For a-z characters.
                    throw new Error(char + " is not a valid digit in base " + numBase + ".");
                }
            }
        }

        // Optimized path for common bases that fit native JS numbers.
        if (2 <= numBase && numBase <= 36) {
            if (strLength <= JS_MAX_VAL_LOG / Math.log(numBase)) {
                const parsedNative = parseInt(textRep, numBase);
                if (isNaN(parsedNative)) {
                    throw new Error("Invalid number string for base " + numBase + ".");
                }
                return new CompactNumber(parseInt(textRep, numBase));
            }
        }

        numBase = interpretInput(numBase); // Convert base to ValueContainer.
        const digitValues = [];
        const isNegative = textRep[0] === "-";

        // Extract digit values from the string.
        for (let i = isNegative ? 1 : 0; i < textRep.length; i++) {
            const char = textRep[i].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (48 <= charCode && charCode <= 57) { // 0-9
                digitValues.push(interpretInput(char));
            } else if (97 <= charCode && charCode <= 122) { // a-z
                digitValues.push(interpretInput(charCode - 87)); // a=10, b=11, etc.
            } else if (char === "<") { // Handle custom digits like <100>.
                const startIdx = i;
                do { i++; } while (textRep[i] !== ">");
                digitValues.push(interpretInput(textRep.slice(startIdx + 1, i)));
            } else {
                throw new Error(char + " is not a valid character.");
            }
        }
        return chunksToNumBase(digitValues, numBase, isNegative);
    };

    /**
     * Converts an array of digit ValueContainers from a specified base into a single number object.
     * @param {ValueContainer[]} digitValues - Array of digits as ValueContainers.
     * @param {ValueContainer} numBase - The base of the digits.
     * @param {boolean} isNegative - Whether the final number should be negative.
     * @returns {ValueContainer} The resulting number object.
     */
    function chunksToNumBase(digitValues, numBase, isNegative) {
        let finalVal = ValueContainer[0];
        let currentPower = ValueContainer[1];
        // Iterate from least significant digit to most significant.
        for (let i = digitValues.length - 1; i >= 0; i--) {
            finalVal = finalVal.add(digitValues[i].times(currentPower));
            currentPower = currentPower.times(numBase);
        }
        return isNegative ? finalVal.flipSign() : finalVal;
    }

    /**
     * Converts a single digit (0-35) to its string representation.
     * @param {number} digit - The digit to convert.
     * @returns {string} The string representation.
     */
    function partToChar(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">"; // For digits > 35, use custom format.
    }

    /**
     * Converts a number object to an array of digits in a specified base.
     * @param {ValueContainer} numObj - The number object.
     * @param {ValueContainer|number|string} targetBase - The base to convert to.
     * @returns {{value: number[], isNegative: boolean}} Object containing digit array and sign.
     * @throws {Error} If base is zero or invalid.
     */
    function convertToBase(numObj, targetBase) {
        targetBase = grandNumMaker(targetBase); // Ensure base is a number object.

        if (targetBase.isEqualZero()) {
            if (numObj.isEqualZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }

        if (targetBase.equals(-1)) {
            // Special handling for base -1 (negabase).
            if (numObj.isEqualZero()) return { value: [0], isNegative: false };
            if (numObj.isLessThanZero()) {
                // If negative, convert -N to (1010... in base -1)
                const unaryArr = Array.from({length: -numObj.toNativeNumber()}, () => [1, 0]).flat();
                return { value: unaryArr, isNegative: false };
            }
            // If positive, convert N to (1010... in base -1)
            const unaryArr = Array.from({length: numObj.toNativeNumber() - 1}, () => [0, 1]).flat();
            unaryArr.unshift(1);
            return { value: unaryArr, isNegative: false };
        }

        let isResultNegative = false;
        if (numObj.isLessThanZero() && targetBase.isGreaterThanZero()) {
            isResultNegative = true;
            numObj = numObj.absoluteValue();
        }

        if (targetBase.equals(1)) {
            // Special handling for base 1 (unary).
            if (numObj.isEqualZero()) return { value: [0], isNegative: false };
            const unaryArr = Array.from({length: numObj.toNativeNumber()}, () => 1);
            return { value: unaryArr, isNegative: isResultNegative };
        }

        const outputDigits = [];
        let remainingNum = numObj, currentDivMod;

        // Repeatedly divide by base and collect remainders.
        while (remainingNum.isLessThanZero() || remainingNum.compareAbsolute(targetBase) >= 0) {
            currentDivMod = remainingNum.divmod(targetBase);
            remainingNum = currentDivMod.quotient;
            let digit = currentDivMod.remainder;

            // Adjust for negative remainders (common in non-standard bases).
            if (digit.isLessThanZero()) {
                digit = targetBase.minus(digit).absoluteValue();
                remainingNum = remainingNum.plusOne();
            }
            outputDigits.push(digit.toNativeNumber());
        }
        outputDigits.push(remainingNum.toNativeNumber()); // Add the last quotient.

        return { value: outputDigits.reverse(), isNegative: isResultNegative };
    }

    /**
     * Converts a number object to its string representation in a specified base.
     * @param {ValueContainer} numObj - The number object.
     * @param {ValueContainer|number|string} targetBase - The base to convert to.
     * @returns {string} The string representation.
     */
    function baseStringOutput(numObj, targetBase) {
        const digitArrResult = convertToBase(numObj, targetBase);
        return (digitArrResult.isNegative ? "-" : "") + digitArrResult.value.map(partToChar).join("");
    }

    /**
     * GrandNum prototype method to convert to an array of digits in a specified base.
     * @param {number} [targetBase] - The base.
     * @returns {{value: number[], isNegative: boolean}} Array of digits.
     */
    GrandNum.prototype.toChunkArray = function(targetBase) {
        return convertToBase(this, targetBase);
    };

    // SmallInteger also uses the same toArray implementation.
    CompactNumber.prototype.toChunkArray = function(targetBase) {
        return convertToBase(this, targetBase);
    };

    /**
     * GrandNum prototype method to convert to its string representation.
     * @param {number} [targetBase] - The base (default 10).
     * @returns {string} The string representation.
     */
    GrandNum.prototype.toTextRepresentation = function(targetBase) {
        if (targetBase === unassigned) targetBase = 10;
        if (targetBase !== 10) return baseStringOutput(this, targetBase);

        const myChunks = this.digitChunks;
        let lastChunkIdx = myChunks.length;
        let stringRep = String(myChunks[--lastChunkIdx]); // Start with the most significant chunk.
        const zeroPadding = "0000000"; // For padding smaller chunks.
        let currentDigit;

        // Iterate through remaining chunks, padding with zeros as needed.
        while (--lastChunkIdx >= 0) {
            currentDigit = String(myChunks[lastChunkIdx]);
            stringRep += zeroPadding.slice(currentDigit.length) + currentDigit;
        }
        const finalSign = this.negFlag ? "-" : "";
        return finalSign + stringRep;
    };

    /**
     * CompactNumber prototype method to convert to its string representation.
     * @param {number} [targetBase] - The base (default 10).
     * @returns {string} The string representation.
     */
    CompactNumber.prototype.toTextRepresentation = function(targetBase) {
        if (targetBase === unassigned) targetBase = 10;
        if (targetBase !== 10) return baseStringOutput(this, targetBase);
        return String(this.digitChunks); // Native conversion for small numbers.
    };

    // Aliases for JSON serialization.
    GrandNum.prototype.toJSObject = CompactNumber.prototype.toJSObject = function() {
        return this.toTextRepresentation();
    };

    /**
     * GrandNum prototype method to get its primitive number value (if it fits).
     * @returns {number} The primitive number value.
     */
    GrandNum.prototype.getPrimitiveValue = function() {
        return parseInt(this.toTextRepresentation(), 10);
    };

    // Alias for getPrimitiveValue.
    GrandNum.prototype.toNativeNumber = GrandNum.prototype.getPrimitiveValue;

    /**
     * CompactNumber prototype method to get its primitive number value.
     * @returns {number} The primitive number value.
     */
    CompactNumber.prototype.getPrimitiveValue = function() {
        return this.digitChunks;
    };

    // Alias for getPrimitiveValue.
    CompactNumber.prototype.toNativeNumber = CompactNumber.prototype.getPrimitiveValue;

    /**
     * Parses a string value into a number object (GrandNum or CompactNumber).
     * Handles scientific notation and checks for valid integer format.
     * @param {string} strVal - The string value to parse.
     * @returns {ValueContainer} The parsed number object.
     * @throws {Error} If the string is not a valid integer.
     */
    function parseStringRep(strVal) {
        // If the string represents a number that fits native JS, parse it directly.
        if (fitsNativeRange(+strVal)) {
            const nativeNum = +strVal;
            if (nativeNum === floorOrCeil(nativeNum)) {
                return new CompactNumber(nativeNum);
            }
            throw new Error("Invalid integer: " + strVal);
        }

        let isNegative = strVal[0] === "-";
        if (isNegative) strVal = strVal.slice(1);

        const scientificParts = strVal.split(/e/i);
        if (scientificParts.length > 2) {
            throw new Error("Invalid integer: " + scientificParts.join("e"));
        }

        // Handle scientific notation.
        if (scientificParts.length === 2) {
            let exponentPart = scientificParts[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart;

            if (exponentPart !== floorOrCeil(exponentPart) || !fitsNativeRange(exponentPart)) {
                throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
            }

            let mainPart = scientificParts[0];
            const decimalPointIndex = mainPart.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponentPart -= (mainPart.length - decimalPointIndex - 1);
                mainPart = mainPart.slice(0, decimalPointIndex) + mainPart.slice(decimalPointIndex + 1);
            }

            if (exponentPart < 0) {
                throw new Error("Cannot include negative exponent part for integers");
            }
            mainPart += new Array(exponentPart + 1).join("0"); // Append zeros for positive exponent.
            strVal = mainPart;
        }

        // Validate final string format.
        const isValidInteger = /^([0-9][0-9]*)$/.test(strVal);
        if (!isValidInteger) {
            throw new Error("Invalid integer: " + strVal);
        }

        // Convert string to array of digit chunks.
        const digitChunks = [];
        let maxLen = strVal.length,
            chunkSize = PARTITION_UNIT_LOG,
            minLen = maxLen - chunkSize;

        while (maxLen > 0) {
            digitChunks.push(+strVal.slice(minLen, maxLen));
            minLen -= chunkSize;
            if (minLen < 0) minLen = 0;
            maxLen -= chunkSize;
        }
        cleanUpChunks(digitChunks); // Remove leading zeros.
        return new GrandNum(digitChunks, isNegative);
    }

    /**
     * Parses a native JavaScript number into a number object.
     * @param {number} nativeNum - The native number to parse.
     * @returns {ValueContainer} The parsed number object.
     * @throws {Error} If the number is not an integer.
     */
    function parseNativeNum(nativeNum) {
        if (fitsNativeRange(nativeNum)) {
            if (nativeNum !== floorOrCeil(nativeNum)) {
                throw new Error(nativeNum + " is not an integer.");
            }
            return new CompactNumber(nativeNum);
        }
        return parseStringRep(nativeNum.toTextRepresentation()); // Convert to string and parse.
    }

    /**
     * Universal input parsing function. Converts various types to ValueContainer.
     * @param {any} input - The input value.
     * @returns {ValueContainer} The parsed number object.
     */
    function interpretInput(input) {
        if (typeof input === "number") {
            return parseNativeNum(input);
        }
        if (typeof input === "string") {
            return parseStringRep(input);
        }
        return input; // Assume it's already a ValueContainer instance.
    }

    // Cache small integer instances for performance.
    for (let i = 0; i < 1000; i++) {
        ValueContainer[i] = new CompactNumber(i);
        if (i > 0) ValueContainer[-i] = new CompactNumber(-i);
    }

    // Define common constants on the ValueContainer object.
    ValueContainer.one = ValueContainer[1];
    ValueContainer.zero = ValueContainer[0];
    ValueContainer.minusOne = ValueContainer[-1];

    // Attach utility functions to ValueContainer.
    ValueContainer.max = findMax;
    ValueContainer.min = findMin;
    ValueContainer.gcd = calcGCD;
    ValueContainer.lcm = calcLCM;
    ValueContainer.isInstance = function(x) {
        return x instanceof GrandNum || x instanceof CompactNumber;
    };
    ValueContainer.randomBetween = getRandRange;
    ValueContainer.fromChunkArray = function(digitArray, numBase, isNegative) {
        return chunksToNumBase(digitArray.map(interpretInput), interpretInput(numBase || 10), isNegative);
    };

    return ValueContainer; // The main number factory function.
})();

// --- Input Processing Utility (GET clone) ---

/*
 * Factory for creating input data readers.
 * Provides methods to consume lines and tokens from a string buffer.
 */
var DATA_SOURCE_READER = (function() {
    /**
     * Creates an input reader instance.
     * @param {string} sourceText - The raw string input.
     * @returns {InputHandler} A new InputHandler object.
     */
    function createReader(sourceText) {
        return new InputHandler(sourceText);
    }

    /**
     * Manages reading data from a multi-line string.
     * @param {string} rawString - The raw string input to be processed.
     */
    function InputHandler(rawString) {
        this._inputArray = rawString.trim().split("\n"); // Split into lines.
        this._linePointer = 0; // Current line index.
    }

    /**
     * Reads the next token from the current line.
     * If the current line is exhausted, moves to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, converts to number.
     * @returns {string|number} The next token.
     */
    InputHandler.prototype.nextItem = function(returnAsString) {
        const lines = this._inputArray;
        const currentLineIdx = this._linePointer;
        let resultToken;

        // If current line hasn't been split into tokens, do so.
        if (typeof lines[currentLineIdx] === "string") {
            lines[currentLineIdx] = lines[currentLineIdx].split(" ").reverse(); // Split and reverse for efficient pop.
        }

        resultToken = lines[currentLineIdx].pop(); // Get last token (first after reversal).

        // If the current line is now empty, advance to the next line.
        if (!lines[currentLineIdx].length) {
            this._linePointer++;
        }

        return returnAsString ? resultToken : +resultToken; // Convert to number unless string requested.
    };

    /**
     * Reads an entire line and returns it as an array of tokens.
     * Advances the line pointer.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {string[]|number[]} An array of tokens from the line.
     */
    InputHandler.prototype.fetchLine = function(returnAsString) {
        const lineTokens = this._inputArray[this._linePointer++].split(" ");
        return returnAsString ? lineTokens : lineTokens.map(item => +item);
    };

    /**
     * Reads a matrix (2D array) of tokens.
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, converts to numbers.
     * @returns {string[][]|number[][]} A 2D array representing the matrix.
     */
    InputHandler.prototype.getMatrix = function(numRows, returnAsString) {
        const matrixRows = this._inputArray.slice(this._linePointer, this._linePointer += numRows)
            .map(line => line.split(" "));
        return returnAsString ? matrixRows : matrixRows.map(row => row.map(item => +item));
    };

    /**
     * Reads a specified number of raw lines without splitting them into tokens.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns lines as strings; otherwise, converts to numbers.
     * @returns {string[]|number[]} An array of raw lines.
     */
    InputHandler.prototype.getRawLines = function(numLines, returnAsString) {
        const rawLines = this._inputArray.slice(this._linePointer, this._linePointer += numLines);
        return returnAsString ? rawLines : rawLines.map(item => +item);
    };

    return createReader; // Return the factory function.
})();

// Create an input reader instance from stdin.
var dataProcessor = DATA_SOURCE_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array filled with a specified value or derived expression.
 * This is a utility function, not directly related to number arithmetic but part of the original code.
 * @param {*} fillValue - The value to fill the innermost array with, or an expression string.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createNestedArray(fillValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayExpression = "Array(args[" + --argCount + "]).fill(0).map(x => { return " + fillValue + "; })";
    while (--argCount) {
        arrayExpression = "Array(args[" + argCount + "]).fill(0).map(x => " + arrayExpression + ")";
    }
    return eval(arrayExpression); // Using eval is generally risky, but preserving original logic.
}

// Initialize the large number library.
var bn = grandNumMaker();

// Execute the main problem-solving logic and print the result.
console.log(solveProblem());

/**
 * Main problem-solving function.
 * Reads an input number, performs arithmetic operations, and formats the output.
 * This function likely solves a specific competitive programming problem.
 * @returns {string} The formatted result string.
 */
function solveProblem() {
    const initialVal = dataProcessor.nextItem(1); // Read the input number.
    const calcSum = bn.add(initialVal); // Calculate sum (effectively just parsing initialVal as a GrandNum).

    // Initialize result array with default values.
    const finalResponse = [0, 0, 1_000_000_000];

    // Check if calcSum is divisible by 1,000,000,000.
    if (calcSum.mod(1_000_000_000).isEqualZero()) {
        finalResponse.push(0);
        finalResponse.push(0);
        finalResponse.push(calcSum.divide(1_000_000_000).toTextRepresentation());
        return finalResponse.join(" ");
    }

    finalResponse.push(1); // Add 1 to the result.
    // Calculate intermediate value: (calcSum + 999999999) / 1,000,000,000.
    const intermediateDiv = calcSum.add(999_999_999).divide(1_000_000_000);

    // Calculate second value: (intermediateDiv * 1,000,000,000) - calcSum.
    finalResponse.push(intermediateDiv.times(1_000_000_000).minus(calcSum).toTextRepresentation());
    // Calculate third value: intermediateDiv.
    finalResponse.push(intermediateDiv.toTextRepresentation());

    return finalResponse.join(" ");
}