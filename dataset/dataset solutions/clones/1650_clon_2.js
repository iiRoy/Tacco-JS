/*
 * This self-executing function creates a utility for parsing standard input.
 * It's designed to read lines of text and convert them into usable data types.
 */
const INPUT_READER = (function () {
    /**
     * Factory function to instantiate a new line processor.
     * @param {string} inputString - The raw string input.
     * @returns {LineProcessor} An instance of the line processor.
     */
    function createReader(inputString) {
        return new LineProcessor(inputString);
    }

    /**
     * Handles processing of input strings, splitting them into lines
     * and providing methods to extract values.
     * @class
     */
    function LineProcessor(inputString) {
        // Store lines after trimming and splitting
        this.lineSegments = inputString.trim().split("\n");
    }

    // Prototype methods for LineProcessor
    LineProcessor.prototype.getLineText = function (lineIndex) {
        /*
         * Retrieves the raw string content of a specific line.
         * @param {number} lineIndex - The zero-based index of the line.
         * @returns {string} The content of the line.
         */
        return this.lineSegments[lineIndex];
    };

    LineProcessor.prototype.getLineValues = function (lineIndex) {
        /*
         * Parses a specific line into an array of values,
         * converting elements to numbers where possible.
         * @param {number} lineIndex - The zero-based index of the line.
         * @returns {Array<string|number>} An array of parsed values.
         */
        return this.parseLineToValues(this.lineSegments[lineIndex]);
    };

    LineProcessor.prototype.extractRange = function (startIndex, count) {
        /*
         * Extracts a range of lines and processes each into a parsed element.
         * If 'count' is zero or undefined, it will slice to the end.
         * @param {number} startIndex - The starting index for the slice.
         * @param {number} count - The number of elements to include from startIndex.
         * @returns {Array<string|number>} An array of processed elements.
         */
        return this.lineSegments.slice(startIndex, +count + startIndex || void 0).map(element => this.parseElement(element));
    };

    LineProcessor.prototype.extractRangeAsArrays = function (startIndex, count) {
        /*
         * Extracts a range of lines and processes each into an array of values.
         * Similar to extractRange but each line is treated as an array of values.
         * @param {number} startIndex - The starting index for the slice.
         * @param {number} count - The number of elements to include from startIndex.
         * @returns {Array<Array<string|number>>} An array of arrays of parsed values.
         */
        return this.lineSegments.slice(startIndex, +count + startIndex || void 0).map(element => this.parseLineToValues(element));
    };

    LineProcessor.prototype.parseLineToValues = function (inputString) {
        /*
         * Helper to split a string by spaces and then parse each part.
         * @param {string} inputString - The string to parse.
         * @returns {Array<string|number>} An array of parsed parts.
         */
        return inputString.split(" ").map(element => this.parseElement(element));
    };

    LineProcessor.prototype.parseElement = function (inputElement) {
        /*
         * Attempts to convert a string element to a number.
         * If it's a valid number, returns the number; otherwise, returns the original string.
         * @param {string} inputElement - The string element to parse.
         * @returns {string|number} The parsed element.
         */
        let parsedNum = +inputElement;
        return (parsedNum === parsedNum) ? parsedNum : inputElement;
    };

    return createReader;
})();

/*
 * Initialize the input reader with content from standard input.
 * Reads the entire standard input stream as a UTF-8 string.
 */
const readerInstance = INPUT_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * This code is derived from a library for arbitrary-precision integer arithmetic.
 * It provides functionality for handling numbers larger than JavaScript's
 * native safe integer limit (Number.MAX_SAFE_INTEGER).
 *
 * eslint-disable
 */
const largeNum = function (noValue) {
    "use strict";
    // Internal constants for arithmetic operations
    const CHUNK_SIZE = 1e7; /* Base for internal number representation (10^7) */
    const CHUNK_LOG = 7; /* Logarithm of the chunk size (log10(10^7) = 7) */
    const MAX_SAFE_NUM = 9007199254740992; /* Maximum safe integer in JavaScript */
    const MAX_SAFE_NUM_CHUNKS = smallToChunked(MAX_SAFE_NUM); /* MAX_SAFE_NUM represented in internal chunk format */
    const BASE_CHARS = "0123456789abcdefghijklmnopqrstuvwxyz"; /* Default character set for string conversions */

    /* Check if the environment supports native BigInt type */
    const hasNativeLargeIntSupport = typeof BigInt === "function";

    /**
     * Main factory function for creating LargeNumber instances.
     * @param {any} inputVal - The value to convert to a large number.
     * @param {number} [base] - The base of the input string if it's a string.
     * @param {string} [charSet] - Custom alphabet for string conversion.
     * @param {boolean} [respectCase] - Whether the alphabet comparison is case-sensitive.
     * @returns {LargeNumberFactory|MultiChunkNumber|CompactNumber|NativeLargeNum} A large number instance.
     */
    function LargeNumberFactory(inputVal, base, charSet, respectCase) {
        if (typeof inputVal === noValue) return LargeNumberFactory[0]; // Return zero if no value provided
        if (typeof base !== noValue) {
            // If base is provided, parse accordingly
            return +base === 10 && !charSet ? processInputVal(inputVal) : processBaseString(inputVal, base, charSet, respectCase);
        }
        return processInputVal(inputVal); // Default parsing
    }

    /**
     * Represents a large integer using an array of 'chunks'.
     * @class
     * @param {number[]} digitChunks - Array of number chunks.
     * @param {boolean} isNegative - True if the number is negative.
     */
    function MultiChunkNumber(digitChunks, isNegative) {
        this.digitChunks = digitChunks;
        this.isNegative = isNegative;
        this.isSingleChunk = false; // Flag indicating it's not a small integer
    }
    MultiChunkNumber.prototype = Object.create(LargeNumberFactory.prototype);

    /**
     * Represents a small integer that fits within JavaScript's native number type.
     * @class
     * @param {number} numericalValue - The small integer value.
     */
    function CompactNumber(numericalValue) {
        this.numericalValue = numericalValue;
        this.isNegative = numericalValue < 0;
        this.isSingleChunk = true; // Flag indicating it's a small integer
    }
    CompactNumber.prototype = Object.create(LargeNumberFactory.prototype);

    /**
     * Wrapper for JavaScript's native BigInt type.
     * @class
     * @param {BigInt} nativeValue - The native BigInt value.
     */
    function NativeLargeNum(nativeValue) {
        this.nativeValue = nativeValue;
    }
    NativeLargeNum.prototype = Object.create(LargeNumberFactory.prototype);

    /**
     * Checks if a number can be precisely represented by JavaScript's Number type.
     * @param {number} numToCheck - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function isStandardPrecise(numToCheck) {
        return -MAX_SAFE_NUM < numToCheck && numToCheck < MAX_SAFE_NUM;
    }

    /**
     * Converts a small number into an array of chunks (base CHUNK_SIZE).
     * @param {number} smallNum - The number to convert.
     * @returns {number[]} Array of chunks.
     */
    function smallToChunked(smallNum) {
        if (smallNum < 1e7) return [smallNum];
        if (smallNum < 1e14) return [smallNum % 1e7, Math.floor(smallNum / 1e7)];
        return [smallNum % 1e7, Math.floor(smallNum / 1e7) % 1e7, Math.floor(smallNum / 1e14)];
    }

    /**
     * Converts an array of chunks back into a small number if possible.
     * @param {number[]} chunkArr - Array of chunks.
     * @returns {number|number[]} The small number or the original array if too large.
     */
    function chunkedToSmall(chunkArr) {
        removeLeadingZeros(chunkArr); // Clean up array
        const arrLength = chunkArr.length;
        if (arrLength < 4 && compareAbsoluteValues(chunkArr, MAX_SAFE_NUM_CHUNKS) < 0) {
            switch (arrLength) {
                case 0:
                    return 0;
                case 1:
                    return chunkArr[0];
                case 2:
                    return chunkArr[0] + chunkArr[1] * CHUNK_SIZE;
                default:
                    return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_SIZE) * CHUNK_SIZE;
            }
        }
        return chunkArr;
    }

    /**
     * Removes leading zero chunks from a number array.
     * @param {number[]} chunkVec - The vector of chunks.
     */
    function removeLeadingZeros(chunkVec) {
        let idx = chunkVec.length;
        while (chunkVec[--idx] === 0); // Find last non-zero chunk
        chunkVec.length = idx + 1; // Trim array
    }

    /**
     * Creates a new array filled with zeros.
     * @param {number} len - The desired length of the array.
     * @returns {number[]} A zero-filled array.
     */
    function makeZeroFilledArray(len) {
        const tempArray = new Array(len);
        let idx = -1;
        while (++idx < len) {
            tempArray[idx] = 0;
        }
        return tempArray;
    }

    /**
     * Truncates a floating-point number to an integer.
     * @param {number} floatingNum - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function chopDecimal(floatingNum) {
        if (floatingNum > 0) return Math.floor(floatingNum);
        return Math.ceil(floatingNum);
    }

    /**
     * Performs addition on two arrays of number chunks.
     * @param {number[]} arr1 - First array of chunks.
     * @param {number[]} arr2 - Second array of chunks.
     * @returns {number[]} Resulting array of chunks.
     */
    function performAddition(arr1, arr2) {
        const lenA = arr1.length;
        const lenB = arr2.length;
        const resultArray = new Array(lenA);
        let carryOver = 0;
        const base = CHUNK_SIZE;
        let currentSum, idx;

        for (idx = 0; idx < lenB; idx++) {
            currentSum = arr1[idx] + arr2[idx] + carryOver;
            carryOver = currentSum >= base ? 1 : 0;
            resultArray[idx] = currentSum - carryOver * base;
        }
        while (idx < lenA) {
            currentSum = arr1[idx] + carryOver;
            carryOver = currentSum === base ? 1 : 0;
            resultArray[idx++] = currentSum - carryOver * base;
        }
        if (carryOver > 0) resultArray.push(carryOver);
        return resultArray;
    }

    /**
     * Adds two chunk arrays, handling different lengths by ensuring the longer one is first.
     * @param {number[]} arr1 - First array of chunks.
     * @param {number[]} arr2 - Second array of chunks.
     * @returns {number[]} Resulting array of chunks.
     */
    function performMixedAddition(arr1, arr2) {
        if (arr1.length >= arr2.length) return performAddition(arr1, arr2);
        return performAddition(arr2, arr1);
    }

    /**
     * Adds a small carry to a chunk array.
     * @param {number[]} chunkArr - Array of chunks.
     * @param {number} carryVal - Small integer carry.
     * @returns {number[]} Resulting array of chunks.
     */
    function performSmallAddition(chunkArr, carryVal) {
        const len = chunkArr.length;
        const resultArray = new Array(len);
        const base = CHUNK_SIZE;
        let currentSum, idx;

        for (idx = 0; idx < len; idx++) {
            currentSum = chunkArr[idx] - base + carryVal;
            carryVal = Math.floor(currentSum / base);
            resultArray[idx] = currentSum - carryVal * base;
            carryVal += 1; // Adjust carry for next iteration
        }
        while (carryVal > 0) {
            resultArray[idx++] = carryVal % base;
            carryVal = Math.floor(carryVal / base);
        }
        return resultArray;
    }

    MultiChunkNumber.prototype.sum = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        if (this.isNegative !== otherNum.isNegative) {
            return this.difference(otherNum.invertSign());
        }
        const digitChunksA = this.digitChunks;
        const digitChunksB = otherNum.digitChunks;
        if (otherNum.isSingleChunk) {
            return new MultiChunkNumber(performSmallAddition(digitChunksA, Math.abs(digitChunksB)), this.isNegative);
        }
        return new MultiChunkNumber(performMixedAddition(digitChunksA, digitChunksB), this.isNegative);
    };
    MultiChunkNumber.prototype.addOperation = MultiChunkNumber.prototype.sum;

    CompactNumber.prototype.sum = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const valA = this.numericalValue;
        if (valA < 0 !== otherNum.isNegative) {
            return this.difference(otherNum.invertSign());
        }
        let valB = otherNum.numericalValue;
        if (otherNum.isSingleChunk) {
            if (isStandardPrecise(valA + valB)) return new CompactNumber(valA + valB);
            valB = smallToChunked(Math.abs(valB));
        }
        return new MultiChunkNumber(performSmallAddition(valB, Math.abs(valA)), valA < 0);
    };
    CompactNumber.prototype.addOperation = CompactNumber.prototype.sum;

    NativeLargeNum.prototype.sum = function (inputVal) {
        return new NativeLargeNum(this.nativeValue + processInputVal(inputVal).nativeValue);
    };
    NativeLargeNum.prototype.addOperation = NativeLargeNum.prototype.sum;

    /**
     * Performs subtraction on two arrays of number chunks.
     * Assumes arr1 >= arr2 in absolute value.
     * @param {number[]} arr1 - Minuend chunks.
     * @param {number[]} arr2 - Subtrahend chunks.
     * @returns {number[]} Resulting array of chunks.
     */
    function performSubtraction(arr1, arr2) {
        const lengthA = arr1.length;
        const lengthB = arr2.length;
        const resultArray = new Array(lengthA);
        let borrowAmount = 0;
        const base = CHUNK_SIZE;
        let idx, diffValue;

        for (idx = 0; idx < lengthB; idx++) {
            diffValue = arr1[idx] - borrowAmount - arr2[idx];
            if (diffValue < 0) {
                diffValue += base;
                borrowAmount = 1;
            } else borrowAmount = 0;
            resultArray[idx] = diffValue;
        }
        for (idx = lengthB; idx < lengthA; idx++) {
            diffValue = arr1[idx] - borrowAmount;
            if (diffValue < 0) diffValue += base;
            else {
                resultArray[idx++] = diffValue;
                break;
            }
            resultArray[idx] = diffValue;
        }
        for (; idx < lengthA; idx++) {
            resultArray[idx] = arr1[idx];
        }
        removeLeadingZeros(resultArray);
        return resultArray;
    }

    /**
     * Performs subtraction between two large numbers, handling signs and order.
     * @param {number[]} digitChunksA - Chunks of the first number.
     * @param {number[]} digitChunksB - Chunks of the second number.
     * @param {boolean} currentSign - The sign of the result if A >= B.
     * @returns {MultiChunkNumber|CompactNumber} The result of the subtraction.
     */
    function performMixedSubtraction(digitChunksA, digitChunksB, currentSign) {
        let resultChunks;
        if (compareAbsoluteValues(digitChunksA, digitChunksB) >= 0) {
            resultChunks = performSubtraction(digitChunksA, digitChunksB);
        } else {
            resultChunks = performSubtraction(digitChunksB, digitChunksA);
            currentSign = !currentSign; // Invert sign if A < B
        }
        resultChunks = chunkedToSmall(resultChunks);
        if (typeof resultChunks === "number") {
            if (currentSign) resultChunks = -resultChunks;
            return new CompactNumber(resultChunks);
        }
        return new MultiChunkNumber(resultChunks, currentSign);
    }

    /**
     * Subtracts a small value from a chunk array, handling borrows.
     * @param {number[]} chunkArr - Array of chunks.
     * @param {number} smallVal - Small integer to subtract.
     * @param {boolean} currentSign - Sign of the result.
     * @returns {MultiChunkNumber|CompactNumber} The result of the subtraction.
     */
    function performSmallSubtraction(chunkArr, smallVal, currentSign) {
        const len = chunkArr.length;
        const resultArray = new Array(len);
        let carryOver = -smallVal; // Use carryOver for borrow
        const base = CHUNK_SIZE;
        let idx, diffValue;

        for (idx = 0; idx < len; idx++) {
            diffValue = chunkArr[idx] + carryOver;
            carryOver = Math.floor(diffValue / base);
            diffValue %= base;
            resultArray[idx] = diffValue < 0 ? diffValue + base : diffValue;
        }
        const finalResult = chunkedToSmall(resultArray);
        if (typeof finalResult === "number") {
            if (currentSign) return new CompactNumber(-finalResult);
            return new CompactNumber(finalResult);
        }
        return new MultiChunkNumber(finalResult, currentSign);
    }

    MultiChunkNumber.prototype.difference = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        if (this.isNegative !== otherNum.isNegative) {
            return this.sum(otherNum.invertSign());
        }
        const digitChunksA = this.digitChunks;
        const digitChunksB = otherNum.digitChunks;
        if (otherNum.isSingleChunk) {
            return performSmallSubtraction(digitChunksA, Math.abs(digitChunksB), this.isNegative);
        }
        return performMixedSubtraction(digitChunksA, digitChunksB, this.isNegative);
    };
    MultiChunkNumber.prototype.subtractOperation = MultiChunkNumber.prototype.difference;

    CompactNumber.prototype.difference = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const valA = this.numericalValue;
        if (valA < 0 !== otherNum.isNegative) {
            return this.sum(otherNum.invertSign());
        }
        const valB = otherNum.numericalValue;
        if (otherNum.isSingleChunk) {
            return new CompactNumber(valA - valB);
        }
        return performSmallSubtraction(otherNum.digitChunks, Math.abs(valA), valA >= 0);
    };
    CompactNumber.prototype.subtractOperation = CompactNumber.prototype.difference;

    NativeLargeNum.prototype.difference = function (inputVal) {
        return new NativeLargeNum(this.nativeValue - processInputVal(inputVal).nativeValue);
    };
    NativeLargeNum.prototype.subtractOperation = NativeLargeNum.prototype.difference;

    MultiChunkNumber.prototype.invertSign = function () {
        return new MultiChunkNumber(this.digitChunks, !this.isNegative);
    };
    CompactNumber.prototype.invertSign = function () {
        const currentSign = this.isNegative;
        const compactResult = new CompactNumber(-this.numericalValue);
        compactResult.isNegative = !currentSign;
        return compactResult;
    };
    NativeLargeNum.prototype.invertSign = function () {
        return new NativeLargeNum(-this.nativeValue);
    };

    MultiChunkNumber.prototype.absoluteValue = function () {
        return new MultiChunkNumber(this.digitChunks, false);
    };
    CompactNumber.prototype.absoluteValue = function () {
        return new CompactNumber(Math.abs(this.numericalValue));
    };
    NativeLargeNum.prototype.absoluteValue = function () {
        return new NativeLargeNum(this.nativeValue >= 0 ? this.nativeValue : -this.nativeValue);
    };

    /**
     * Performs long multiplication on two chunk arrays.
     * Standard grade school multiplication algorithm.
     * @param {number[]} arr1 - First array of chunks.
     * @param {number[]} arr2 - Second array of chunks.
     * @returns {number[]} Resulting array of chunks.
     */
    function longMultiplication(arr1, arr2) {
        const lenA = arr1.length;
        const lenB = arr2.length;
        const resultArray = makeZeroFilledArray(lenA + lenB);
        const base = CHUNK_SIZE;
        let prodValue, carryOver, idx, chunkA, chunkB;

        for (idx = 0; idx < lenA; ++idx) {
            chunkA = arr1[idx];
            for (let j = 0; j < lenB; ++j) {
                chunkB = arr2[j];
                prodValue = chunkA * chunkB + resultArray[idx + j];
                carryOver = Math.floor(prodValue / base);
                resultArray[idx + j] = prodValue - carryOver * base;
                resultArray[idx + j + 1] += carryOver;
            }
        }
        removeLeadingZeros(resultArray);
        return resultArray;
    }

    /**
     * Multiplies a chunk array by a single small integer.
     * @param {number[]} chunkArr - Array of chunks.
     * @param {number} smallInt - Small integer multiplier.
     * @returns {number[]} Resulting array of chunks.
     */
    function smallMultiplication(chunkArr, smallInt) {
        const len = chunkArr.length;
        const resultArray = new Array(len);
        const base = CHUNK_SIZE;
        let carryOver = 0,
            prodValue, idx;

        for (idx = 0; idx < len; idx++) {
            prodValue = chunkArr[idx] * smallInt + carryOver;
            carryOver = Math.floor(prodValue / base);
            resultArray[idx] = prodValue - carryOver * base;
        }
        while (carryOver > 0) {
            resultArray[idx++] = carryOver % base;
            carryOver = Math.floor(carryOver / base);
        }
        return resultArray;
    }

    /**
     * Pads an array with leading zeros, effectively shifting it left.
     * @param {number[]} inputArr - The array to pad.
     * @param {number} zeroCount - Number of zeros to add.
     * @returns {number[]} The padded array.
     */
    function padWithZeros(inputArr, zeroCount) {
        const paddedArray = [];
        while (zeroCount-- > 0) paddedArray.push(0);
        return paddedArray.concat(inputArr);
    }

    /**
     * Implements Karatsuba multiplication for large numbers.
     * @param {number[]} xChunks - Chunks of the first number.
     * @param {number[]} yChunks - Chunks of the second number.
     * @returns {number[]} Resulting array of chunks.
     */
    function karatsubaProduct(xChunks, yChunks) {
        let n = Math.max(xChunks.length, yChunks.length);
        if (n <= 30) return longMultiplication(xChunks, yChunks); // Fallback to long multiplication for small inputs

        n = Math.ceil(n / 2); // Split point for Karatsuba
        const bPart = xChunks.slice(n);
        const aPart = xChunks.slice(0, n);
        const dPart = yChunks.slice(n);
        const cPart = yChunks.slice(0, n);

        const acProduct = karatsubaProduct(aPart, cPart);
        const bdProduct = karatsubaProduct(bPart, dPart);
        const abcdProduct = karatsubaProduct(performMixedAddition(aPart, bPart), performMixedAddition(cPart, dPart));

        const middleTerm = performMixedSubtraction(performMixedSubtraction(abcdProduct, acProduct, false), bdProduct, false);
        const finalProduct = performMixedAddition(performMixedAddition(acProduct, padWithZeros(middleTerm, n)), padWithZeros(bdProduct, 2 * n));

        removeLeadingZeros(finalProduct);
        return finalProduct;
    }

    /**
     * Heuristic to decide whether to use Karatsuba algorithm.
     * @param {number} len1 - Length of first number's chunk array.
     * @param {number} len2 - Length of second number's chunk array.
     * @returns {boolean} True if Karatsuba is likely faster.
     */
    function shouldUseKaratsuba(len1, len2) {
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    MultiChunkNumber.prototype.product = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const digitChunksA = this.digitChunks;
        let digitChunksB = otherNum.digitChunks;
        const isResultNegative = this.isNegative !== otherNum.isNegative;
        let absVal;

        if (otherNum.isSingleChunk) {
            if (digitChunksB === 0) return LargeNumberFactory[0];
            if (digitChunksB === 1) return this;
            if (digitChunksB === -1) return this.invertSign();
            absVal = Math.abs(digitChunksB);
            if (absVal < CHUNK_SIZE) {
                return new MultiChunkNumber(smallMultiplication(digitChunksA, absVal), isResultNegative);
            }
            digitChunksB = smallToChunked(absVal);
        }
        if (shouldUseKaratsuba(digitChunksA.length, digitChunksB.length)) {
            return new MultiChunkNumber(karatsubaProduct(digitChunksA, digitChunksB), isResultNegative);
        }
        return new MultiChunkNumber(longMultiplication(digitChunksA, digitChunksB), isResultNegative);
    };
    MultiChunkNumber.prototype.multiplyOperation = MultiChunkNumber.prototype.product;

    /**
     * Multiplies a small integer by a chunk array.
     * @param {number} smallIntVal - Small integer multiplier.
     * @param {number[]} chunkArr - Array of chunks.
     * @param {boolean} isResultNegative - Sign of the result.
     * @returns {MultiChunkNumber} The resulting large number.
     */
    function smallArrayProduct(smallIntVal, chunkArr, isResultNegative) {
        if (smallIntVal < CHUNK_SIZE) {
            return new MultiChunkNumber(smallMultiplication(chunkArr, smallIntVal), isResultNegative);
        }
        return new MultiChunkNumber(longMultiplication(chunkArr, smallToChunked(smallIntVal)), isResultNegative);
    }

    CompactNumber.prototype._multiplyBySmall = function (otherCompact) {
        if (isStandardPrecise(otherCompact.numericalValue * this.numericalValue)) {
            return new CompactNumber(otherCompact.numericalValue * this.numericalValue);
        }
        return smallArrayProduct(Math.abs(otherCompact.numericalValue), smallToChunked(Math.abs(this.numericalValue)), this.isNegative !== otherCompact.isNegative);
    };

    MultiChunkNumber.prototype._multiplyBySmall = function (otherCompact) {
        if (otherCompact.numericalValue === 0) return LargeNumberFactory[0];
        if (otherCompact.numericalValue === 1) return this;
        if (otherCompact.numericalValue === -1) return this.invertSign();
        return smallArrayProduct(Math.abs(otherCompact.numericalValue), this.digitChunks, this.isNegative !== otherCompact.isNegative);
    };

    CompactNumber.prototype.product = function (inputVal) {
        return processInputVal(inputVal)._multiplyBySmall(this);
    };
    CompactNumber.prototype.multiplyOperation = CompactNumber.prototype.product;

    NativeLargeNum.prototype.product = function (inputVal) {
        return new NativeLargeNum(this.nativeValue * processInputVal(inputVal).nativeValue);
    };
    NativeLargeNum.prototype.multiplyOperation = NativeLargeNum.prototype.product;

    /**
     * Calculates the square of a chunk array.
     * @param {number[]} inputChunks - The chunk array to square.
     * @returns {number[]} The resulting squared chunk array.
     */
    function calculateSquare(inputChunks) {
        const len = inputChunks.length;
        const resultArray = makeZeroFilledArray(len + len);
        const base = CHUNK_SIZE;
        let prodValue, carryOver, idx, chunkA, chunkB;

        for (idx = 0; idx < len; idx++) {
            chunkA = inputChunks[idx];
            carryOver = 0 - chunkA * chunkA; // Initialize carry with negative square
            for (let j = idx; j < len; j++) {
                chunkB = inputChunks[j];
                prodValue = 2 * (chunkA * chunkB) + resultArray[idx + j] + carryOver;
                carryOver = Math.floor(prodValue / base);
                resultArray[idx + j] = prodValue - carryOver * base;
            }
            resultArray[idx + len] = carryOver;
        }
        removeLeadingZeros(resultArray);
        return resultArray;
    }

    MultiChunkNumber.prototype.squared = function () {
        return new MultiChunkNumber(calculateSquare(this.digitChunks), false);
    };
    CompactNumber.prototype.squared = function () {
        const squaredValue = this.numericalValue * this.numericalValue;
        if (isStandardPrecise(squaredValue)) return new CompactNumber(squaredValue);
        return new MultiChunkNumber(calculateSquare(smallToChunked(Math.abs(this.numericalValue))), false);
    };
    NativeLargeNum.prototype.squared = function () {
        return new NativeLargeNum(this.nativeValue * this.nativeValue);
    };

    /**
     * Implements Algorithm 1 (Knuth's D-algorithm) for division and modulus.
     * @param {number[]} dividendChunks - Chunks of the dividend.
     * @param {number[]} divisorChunks - Chunks of the divisor.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function divideAndModAlgorithm1(dividendChunks, divisorChunks) {
        const lenA = dividendChunks.length;
        const lenB = divisorChunks.length;
        const resultQuotient = makeZeroFilledArray(divisorChunks.length);
        const base = CHUNK_SIZE;
        const msdOfDivisor = divisorChunks[lenB - 1]; // Most significant digit of divisor
        const scalingFactor = Math.ceil(base / (2 * msdOfDivisor)); // Normalization factor

        let remainingValue = smallMultiplication(dividendChunks, scalingFactor);
        let divisorScaled = smallMultiplication(divisorChunks, scalingFactor);
        let currentQuotientDigit, shiftAmount, carryOver, borrowAmount, idx, currentLength, tempQ;

        if (remainingValue.length <= lenA) remainingValue.push(0); // Ensure enough space
        divisorScaled.push(0); // Add a zero for easier loop boundary
        const msdScaledDivisor = divisorScaled[lenB - 1]; // Recalculate MSD after scaling

        for (shiftAmount = lenA - lenB; shiftAmount >= 0; shiftAmount--) {
            currentQuotientDigit = base - 1; // Initial guess for quotient digit
            if (remainingValue[shiftAmount + lenB] !== msdScaledDivisor) {
                // Refine guess if not max
                currentQuotientDigit = Math.floor((remainingValue[shiftAmount + lenB] * base + remainingValue[shiftAmount + lenB - 1]) / msdScaledDivisor);
            }

            carryOver = 0;
            borrowAmount = 0;
            currentLength = divisorScaled.length;
            for (idx = 0; idx < currentLength; idx++) {
                carryOver += currentQuotientDigit * divisorScaled[idx];
                tempQ = Math.floor(carryOver / base);
                borrowAmount += remainingValue[shiftAmount + idx] - (carryOver - tempQ * base);
                carryOver = tempQ;
                if (borrowAmount < 0) {
                    remainingValue[shiftAmount + idx] = borrowAmount + base;
                    borrowAmount = -1;
                } else {
                    remainingValue[shiftAmount + idx] = borrowAmount;
                    borrowAmount = 0;
                }
            }
            while (borrowAmount !== 0) {
                currentQuotientDigit -= 1;
                carryOver = 0;
                for (idx = 0; idx < currentLength; idx++) {
                    carryOver += remainingValue[shiftAmount + idx] - base + divisorScaled[idx];
                    if (carryOver < 0) {
                        remainingValue[shiftAmount + idx] = carryOver + base;
                        carryOver = 0;
                    } else {
                        remainingValue[shiftAmount + idx] = carryOver;
                        carryOver = 1;
                    }
                }
                borrowAmount += carryOver;
            }
            resultQuotient[shiftAmount] = currentQuotientDigit;
        }
        remainingValue = divideAndModSmall(remainingValue, scalingFactor)[0]; // Unscale remainder
        return [chunkedToSmall(resultQuotient), chunkedToSmall(remainingValue)];
    }

    /**
     * Implements Algorithm 2 (another division algorithm) for division and modulus.
     * @param {number[]} dividendChunks - Chunks of the dividend.
     * @param {number[]} divisorChunks - Chunks of the divisor.
     * @returns {[number[], number[]]} An array containing [quotientChunks, remainderChunks].
     */
    function divideAndModAlgorithm2(dividendChunks, divisorChunks) {
        let lenA = dividendChunks.length;
        const lenB = divisorChunks.length;
        const resultQuotient = [];
        let partialDividend = [];
        const base = CHUNK_SIZE;
        let estimatedQuotient, dividendLength, highDividend, highDivisor, testProduct;

        while (lenA) {
            partialDividend.unshift(dividendChunks[--lenA]); // Take chunks from left (MSD)
            removeLeadingZeros(partialDividend);

            if (compareAbsoluteValues(partialDividend, divisorChunks) < 0) {
                resultQuotient.push(0);
                continue;
            }

            dividendLength = partialDividend.length;
            highDividend = partialDividend[dividendLength - 1] * base + partialDividend[dividendLength - 2];
            highDivisor = divisorChunks[lenB - 1] * base + divisorChunks[lenB - 2];

            if (dividendLength > lenB) {
                highDividend = (highDividend + 1) * base; // Adjust for extra digit
            }
            estimatedQuotient = Math.ceil(highDividend / highDivisor);

            do {
                testProduct = smallMultiplication(divisorChunks, estimatedQuotient);
                if (compareAbsoluteValues(testProduct, partialDividend) <= 0) break;
                estimatedQuotient--;
            } while (estimatedQuotient);

            resultQuotient.push(estimatedQuotient);
            partialDividend = performSubtraction(partialDividend, testProduct);
        }
        resultQuotient.reverse();
        return [chunkedToSmall(resultQuotient), chunkedToSmall(partialDividend)];
    }

    /**
     * Divides a chunk array by a small integer.
     * @param {number[]} chunkArr - Array of chunks.
     * @param {number} smallDivisor - Small integer divisor.
     * @returns {[number[], number]} An array containing [quotientChunks, remainder].
     */
    function divideAndModSmall(chunkArr, smallDivisor) {
        const len = chunkArr.length;
        const resultQuotient = makeZeroFilledArray(len);
        const base = CHUNK_SIZE;
        let idx, qVal, remainingValue, currentDivisor;

        remainingValue = 0;
        for (idx = len - 1; idx >= 0; --idx) {
            currentDivisor = remainingValue * base + chunkArr[idx];
            qVal = chopDecimal(currentDivisor / smallDivisor);
            remainingValue = currentDivisor - qVal * smallDivisor;
            resultQuotient[idx] = qVal | 0; // Ensure integer
        }
        return [resultQuotient, remainingValue | 0]; // Ensure integer remainder
    }

    /**
     * Performs division and modulus for any large number types.
     * @param {MultiChunkNumber|CompactNumber|NativeLargeNum} selfInstance - The dividend.
     * @param {any} divisorVal - The divisor.
     * @returns {[LargeNumberFactory, LargeNumberFactory]} An array containing [quotient, remainder].
     */
    function performAnyDivision(selfInstance, divisorVal) {
        let resultChunks;
        const otherNum = processInputVal(divisorVal);

        if (hasNativeLargeIntSupport) {
            return [new NativeLargeNum(selfInstance.nativeValue / otherNum.nativeValue), new NativeLargeNum(selfInstance.nativeValue % otherNum.nativeValue)];
        }

        const digitChunksA = selfInstance.digitChunks;
        const digitChunksB = otherNum.digitChunks;
        let resultQuotient;

        if (digitChunksB === 0) throw new Error("Cannot divide by zero");
        if (selfInstance.isSingleChunk) {
            if (otherNum.isSingleChunk) {
                return [new CompactNumber(chopDecimal(digitChunksA / digitChunksB)), new CompactNumber(digitChunksA % digitChunksB)];
            }
            return [LargeNumberFactory[0], selfInstance]; // If small num / large num, quotient is 0, remainder is self
        }
        if (otherNum.isSingleChunk) {
            if (digitChunksB === 1) return [selfInstance, LargeNumberFactory[0]];
            if (digitChunksB === -1) return [selfInstance.invertSign(), LargeNumberFactory[0]];
            const absDivisor = Math.abs(digitChunksB);
            if (absDivisor < CHUNK_SIZE) {
                resultChunks = divideAndModSmall(digitChunksA, absDivisor);
                resultQuotient = chunkedToSmall(resultChunks[0]);
                let remainingValue = resultChunks[1];
                if (selfInstance.isNegative) remainingValue = -remainingValue;
                if (typeof resultQuotient === "number") {
                    if (selfInstance.isNegative !== otherNum.isNegative) resultQuotient = -resultQuotient;
                    return [new CompactNumber(resultQuotient), new CompactNumber(remainingValue)];
                }
                return [new MultiChunkNumber(resultQuotient, selfInstance.isNegative !== otherNum.isNegative), new CompactNumber(remainingValue)];
            }
            digitChunksB = smallToChunked(absDivisor);
        }

        const comparisonResult = compareAbsoluteValues(digitChunksA, digitChunksB);
        if (comparisonResult === -1) return [LargeNumberFactory[0], selfInstance]; // dividend < divisor
        if (comparisonResult === 0) return [LargeNumberFactory[selfInstance.isNegative === otherNum.isNegative ? 1 : -1], LargeNumberFactory[0]]; // dividend == divisor

        if (digitChunksA.length + digitChunksB.length <= 200) resultChunks = divideAndModAlgorithm1(digitChunksA, digitChunksB);
        else resultChunks = divideAndModAlgorithm2(digitChunksA, digitChunksB);

        resultQuotient = resultChunks[0];
        const isQuotientNegative = selfInstance.isNegative !== otherNum.isNegative;
        let resultModulo = resultChunks[1];
        const isModuloNegative = selfInstance.isNegative;

        if (typeof resultQuotient === "number") {
            if (isQuotientNegative) resultQuotient = -resultQuotient;
            resultQuotient = new CompactNumber(resultQuotient);
        } else resultQuotient = new MultiChunkNumber(resultQuotient, isQuotientNegative);

        if (typeof resultModulo === "number") {
            if (isModuloNegative) resultModulo = -resultModulo;
            resultModulo = new CompactNumber(resultModulo);
        } else resultModulo = new MultiChunkNumber(resultModulo, isModuloNegative);

        return [resultQuotient, resultModulo];
    }

    MultiChunkNumber.prototype.divideAndRemainder = function (inputVal) {
        const divisionResult = performAnyDivision(this, inputVal);
        return {
            quotient: divisionResult[0],
            remainder: divisionResult[1]
        };
    };
    NativeLargeNum.prototype.divideAndRemainder = CompactNumber.prototype.divideAndRemainder = MultiChunkNumber.prototype.divideAndRemainder;

    MultiChunkNumber.prototype.quotient = function (inputVal) {
        return performAnyDivision(this, inputVal)[0];
    };
    NativeLargeNum.prototype.divisionOperation = NativeLargeNum.prototype.quotient = function (inputVal) {
        return new NativeLargeNum(this.nativeValue / processInputVal(inputVal).nativeValue);
    };
    CompactNumber.prototype.divisionOperation = CompactNumber.prototype.quotient = MultiChunkNumber.prototype.divisionOperation = MultiChunkNumber.prototype.quotient;

    MultiChunkNumber.prototype.remainder = function (inputVal) {
        return performAnyDivision(this, inputVal)[1];
    };
    NativeLargeNum.prototype.moduloOperation = NativeLargeNum.prototype.remainder = function (inputVal) {
        return new NativeLargeNum(this.nativeValue % processInputVal(inputVal).nativeValue);
    };
    CompactNumber.prototype.moduloOperation = CompactNumber.prototype.remainder = MultiChunkNumber.prototype.moduloOperation = MultiChunkNumber.prototype.remainder;

    MultiChunkNumber.prototype.power = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const digitChunksA = this.digitChunks;
        let exponentVal = otherNum.numericalValue;
        let finalValue, tempX, tempY;

        if (exponentVal === 0) return LargeNumberFactory[1];
        if (digitChunksA === 0) return LargeNumberFactory[0];
        if (digitChunksA === 1) return LargeNumberFactory[1];
        if (digitChunksA === -1) return otherNum.isEvenlyDivisible() ? LargeNumberFactory[1] : LargeNumberFactory[-1];
        if (otherNum.isNegative) {
            return LargeNumberFactory[0]; // Negative exponent means fraction, not supported for integers
        }
        if (!otherNum.isSingleChunk) {
            throw new Error("The exponent " + otherNum.toRepresentation() + " is too large.");
        }
        if (this.isSingleChunk) {
            if (isStandardPrecise(finalValue = Math.pow(digitChunksA, exponentVal))) {
                return new CompactNumber(chopDecimal(finalValue));
            }
        }
        tempX = this;
        tempY = LargeNumberFactory[1];
        while (true) {
            if (exponentVal & 1 === 1) { // If exponent is odd
                tempY = tempY.multiplyOperation(tempX);
                --exponentVal;
            }
            if (exponentVal === 0) break;
            exponentVal /= 2;
            tempX = tempX.squared();
        }
        return tempY;
    };
    CompactNumber.prototype.power = MultiChunkNumber.prototype.power;

    NativeLargeNum.prototype.power = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const valA = this.nativeValue;
        let exponentVal = otherNum.nativeValue;
        const nativeZero = BigInt(0);
        const nativeOne = BigInt(1);
        const nativeTwo = BigInt(2);

        if (exponentVal === nativeZero) return LargeNumberFactory[1];
        if (valA === nativeZero) return LargeNumberFactory[0];
        if (valA === nativeOne) return LargeNumberFactory[1];
        if (valA === BigInt(-1)) return otherNum.isEvenlyDivisible() ? LargeNumberFactory[1] : LargeNumberFactory[-1];
        if (otherNum.isNegativeValue()) return new NativeLargeNum(nativeZero); // Negative exponent

        let tempX = this;
        let tempY = LargeNumberFactory[1];
        while (true) {
            if ((exponentVal & nativeOne) === nativeOne) { // If exponent is odd
                tempY = tempY.multiplyOperation(tempX);
                --exponentVal;
            }
            if (exponentVal === nativeZero) break;
            exponentVal /= nativeTwo;
            tempX = tempX.squared();
        }
        return tempY;
    };

    MultiChunkNumber.prototype.modularExponentiation = function (exponentVal, moduloVal) {
        exponentVal = processInputVal(exponentVal);
        moduloVal = processInputVal(moduloVal);
        if (moduloVal.isZeroValue()) throw new Error("Cannot take modular exponentiation with modulus 0");

        let finalResult = LargeNumberFactory[1];
        let modBase = this.remainder(moduloVal);

        if (exponentVal.isNegativeValue()) {
            exponentVal = exponentVal.multiplyOperation(LargeNumberFactory[-1]);
            modBase = modBase.modularInverse(moduloVal);
        }

        while (exponentVal.isPositiveValue()) {
            if (modBase.isZeroValue()) return LargeNumberFactory[0];
            if (exponentVal.isOddlyDivisible()) finalResult = finalResult.multiplyOperation(modBase).moduloOperation(moduloVal);
            exponentVal = exponentVal.quotient(2);
            modBase = modBase.squared().moduloOperation(moduloVal);
        }
        return finalResult;
    };
    NativeLargeNum.prototype.modularExponentiation = CompactNumber.prototype.modularExponentiation = MultiChunkNumber.prototype.modularExponentiation;

    /**
     * Compares the absolute values of two chunk arrays.
     * @param {number[]} arr1 - First chunk array.
     * @param {number[]} arr2 - Second chunk array.
     * @returns {number} -1 if arr1 < arr2, 1 if arr1 > arr2, 0 if equal.
     */
    function compareAbsoluteValues(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return arr1.length > arr2.length ? 1 : -1;
        }
        for (let idx = arr1.length - 1; idx >= 0; idx--) {
            if (arr1[idx] !== arr2[idx]) return arr1[idx] > arr2[idx] ? 1 : -1;
        }
        return 0; // Arrays are identical
    }

    MultiChunkNumber.prototype.compareAbsolute = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const digitChunksA = this.digitChunks;
        const digitChunksB = otherNum.digitChunks;
        if (otherNum.isSingleChunk) return 1; // MultiChunk is always "larger" in comparison context if other is single
        return compareAbsoluteValues(digitChunksA, digitChunksB);
    };

    CompactNumber.prototype.compareAbsolute = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        const valA = Math.abs(this.numericalValue);
        let valB = otherNum.numericalValue;
        if (otherNum.isSingleChunk) {
            valB = Math.abs(valB);
            return valA === valB ? 0 : valA > valB ? 1 : -1;
        }
        return -1; // Compact is always "smaller" in comparison context if other is MultiChunk
    };

    NativeLargeNum.prototype.compareAbsolute = function (inputVal) {
        let valA = this.nativeValue;
        let valB = processInputVal(inputVal).nativeValue;
        valA = valA >= 0 ? valA : -valA;
        valB = valB >= 0 ? valB : -valB;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    };

    MultiChunkNumber.prototype.comparison = function (inputVal) {
        if (inputVal === Infinity) {
            return -1; // This number is less than infinity
        }
        if (inputVal === -Infinity) {
            return 1; // This number is greater than negative infinity
        }
        const otherNum = processInputVal(inputVal);
        const digitChunksA = this.digitChunks;
        const digitChunksB = otherNum.digitChunks;

        if (this.isNegative !== otherNum.isNegative) {
            return otherNum.isNegative ? 1 : -1; // Signs are different
        }
        if (otherNum.isSingleChunk) {
            return this.isNegative ? -1 : 1; // If other is small, and signs are same, this is larger
        }
        return compareAbsoluteValues(digitChunksA, digitChunksB) * (this.isNegative ? -1 : 1);
    };
    MultiChunkNumber.prototype.compareWith = MultiChunkNumber.prototype.comparison;

    CompactNumber.prototype.comparison = function (inputVal) {
        if (inputVal === Infinity) {
            return -1;
        }
        if (inputVal === -Infinity) {
            return 1;
        }
        const otherNum = processInputVal(inputVal);
        const valA = this.numericalValue;
        const valB = otherNum.numericalValue;
        if (otherNum.isSingleChunk) {
            return valA === valB ? 0 : valA > valB ? 1 : -1;
        }
        if (valA < 0 !== otherNum.isNegative) {
            return valA < 0 ? -1 : 1;
        }
        return valA < 0 ? 1 : -1; // If signs are same, and other is multi-chunk, compact is "smaller"
    };
    CompactNumber.prototype.compareWith = CompactNumber.prototype.comparison;

    NativeLargeNum.prototype.comparison = function (inputVal) {
        if (inputVal === Infinity) {
            return -1;
        }
        if (inputVal === -Infinity) {
            return 1;
        }
        const valA = this.nativeValue;
        const valB = processInputVal(inputVal).nativeValue;
        return valA === valB ? 0 : valA > valB ? 1 : -1;
    };
    NativeLargeNum.prototype.compareWith = NativeLargeNum.prototype.comparison;

    MultiChunkNumber.prototype.isEqualTo = function (inputVal) {
        return this.comparison(inputVal) === 0;
    };
    NativeLargeNum.prototype.equalityCheck = NativeLargeNum.prototype.isEqualTo = CompactNumber.prototype.equalityCheck = CompactNumber.prototype.isEqualTo = MultiChunkNumber.prototype.equalityCheck = MultiChunkNumber.prototype.isEqualTo;

    MultiChunkNumber.prototype.isNotEqualTo = function (inputVal) {
        return this.comparison(inputVal) !== 0;
    };
    NativeLargeNum.prototype.inequalityCheck = NativeLargeNum.prototype.isNotEqualTo = CompactNumber.prototype.inequalityCheck = CompactNumber.prototype.isNotEqualTo = MultiChunkNumber.prototype.inequalityCheck = MultiChunkNumber.prototype.isNotEqualTo;

    MultiChunkNumber.prototype.isGreaterThan = function (inputVal) {
        return this.comparison(inputVal) > 0;
    };
    NativeLargeNum.prototype.greaterThanCheck = NativeLargeNum.prototype.isGreaterThan = CompactNumber.prototype.greaterThanCheck = CompactNumber.prototype.isGreaterThan = MultiChunkNumber.prototype.greaterThanCheck = MultiChunkNumber.prototype.isGreaterThan;

    MultiChunkNumber.prototype.isLesserThan = function (inputVal) {
        return this.comparison(inputVal) < 0;
    };
    NativeLargeNum.prototype.lesserThanCheck = NativeLargeNum.prototype.isLesserThan = CompactNumber.prototype.lesserThanCheck = CompactNumber.prototype.isLesserThan = MultiChunkNumber.prototype.lesserThanCheck = MultiChunkNumber.prototype.isLesserThan;

    MultiChunkNumber.prototype.isGreaterOrEqual = function (inputVal) {
        return this.comparison(inputVal) >= 0;
    };
    NativeLargeNum.prototype.greaterOrEqualCheck = NativeLargeNum.prototype.isGreaterOrEqual = CompactNumber.prototype.greaterOrEqualCheck = CompactNumber.prototype.isGreaterOrEqual = MultiChunkNumber.prototype.greaterOrEqualCheck = MultiChunkNumber.prototype.isGreaterOrEqual;

    MultiChunkNumber.prototype.isLesserOrEqual = function (inputVal) {
        return this.comparison(inputVal) <= 0;
    };
    NativeLargeNum.prototype.lesserOrEqualCheck = NativeLargeNum.prototype.isLesserOrEqual = CompactNumber.prototype.lesserOrEqualCheck = CompactNumber.prototype.isLesserOrEqual = MultiChunkNumber.prototype.lesserOrEqualCheck = MultiChunkNumber.prototype.isLesserOrEqual;

    MultiChunkNumber.prototype.isEvenlyDivisible = function () {
        return (this.digitChunks[0] & 1) === 0;
    };
    CompactNumber.prototype.isEvenlyDivisible = function () {
        return (this.numericalValue & 1) === 0;
    };
    NativeLargeNum.prototype.isEvenlyDivisible = function () {
        return (this.nativeValue & BigInt(1)) === BigInt(0);
    };

    MultiChunkNumber.prototype.isOddlyDivisible = function () {
        return (this.digitChunks[0] & 1) === 1;
    };
    CompactNumber.prototype.isOddlyDivisible = function () {
        return (this.numericalValue & 1) === 1;
    };
    NativeLargeNum.prototype.isOddlyDivisible = function () {
        return (this.nativeValue & BigInt(1)) === BigInt(1);
    };

    MultiChunkNumber.prototype.isPositiveValue = function () {
        return !this.isNegative;
    };
    CompactNumber.prototype.isPositiveValue = function () {
        return this.numericalValue > 0;
    };
    NativeLargeNum.prototype.isPositiveValue = CompactNumber.prototype.isPositiveValue;

    MultiChunkNumber.prototype.isNegativeValue = function () {
        return this.isNegative;
    };
    CompactNumber.prototype.isNegativeValue = function () {
        return this.numericalValue < 0;
    };
    NativeLargeNum.prototype.isNegativeValue = CompactNumber.prototype.isNegativeValue;

    MultiChunkNumber.prototype.isOne = function () {
        return false; // A multi-chunk number is rarely 1, would be CompactNumber
    };
    CompactNumber.prototype.isOne = function () {
        return Math.abs(this.numericalValue) === 1;
    };
    NativeLargeNum.prototype.isOne = function () {
        return this.absoluteValue().nativeValue === BigInt(1);
    };

    MultiChunkNumber.prototype.isZeroValue = function () {
        return false; // A multi-chunk number is rarely 0, would be CompactNumber
    };
    CompactNumber.prototype.isZeroValue = function () {
        return this.numericalValue === 0;
    };
    NativeLargeNum.prototype.isZeroValue = function () {
        return this.nativeValue === BigInt(0);
    };

    MultiChunkNumber.prototype.canBeDividedBy = function (inputVal) {
        const otherNum = processInputVal(inputVal);
        if (otherNum.isZeroValue()) return false;
        if (otherNum.isOne()) return true; // Divisible by 1 or -1
        if (otherNum.compareAbsolute(2) === 0) return this.isEvenlyDivisible();
        return this.moduloOperation(otherNum).isZeroValue();
    };
    NativeLargeNum.prototype.canBeDividedBy = CompactNumber.prototype.canBeDividedBy = MultiChunkNumber.prototype.canBeDividedBy;

    /**
     * Checks if a number is a basic prime (2, 3, 5) or small enough to be trivially prime.
     * @param {LargeNumberFactory} inputNum - The number to check.
     * @returns {boolean|undefined} True if basic prime, false if composite, undefined if needs further testing.
     */
    function isSimplePrimary(inputNum) {
        const absoluteNum = inputNum.absoluteValue();
        if (absoluteNum.isOne()) return false;
        if (absoluteNum.isEqualTo(2) || absoluteNum.isEqualTo(3) || absoluteNum.isEqualTo(5)) return true;
        if (absoluteNum.isEvenlyDivisible() || absoluteNum.canBeDividedBy(3) || absoluteNum.canBeDividedBy(5)) return false;
        if (absoluteNum.isLesserThan(49)) return true; // Small composites already filtered
    }

    /**
     * Executes the Miller-Rabin primality test.
     * @param {LargeNumberFactory} candidateNum - The number to test.
     * @param {LargeNumberFactory[]} testBases - Array of bases for the test.
     * @returns {boolean} True if likely prime, false if composite.
     */
    function runMillerRabin(candidateNum, testBases) {
        const numMinusOne = candidateNum.decremented();
        let bValue = numMinusOne;
        let rValue = 0;
        let dValue, testCount, idx, tempResult;

        while (bValue.isEvenlyDivisible()) bValue = bValue.quotient(2), rValue++;

        nextBase: for (idx = 0; idx < testBases.length; idx++) {
            if (candidateNum.isLesserThan(testBases[idx])) continue; // Skip if base is larger than candidate

            tempResult = largeNum(testBases[idx]).modularExponentiation(bValue, candidateNum);
            if (tempResult.isOne() || tempResult.isEqualTo(numMinusOne)) continue;

            for (dValue = rValue - 1; dValue !== 0; dValue--) {
                tempResult = tempResult.squared().moduloOperation(candidateNum);
                if (tempResult.isOne()) return false; // Definitely composite
                if (tempResult.isEqualTo(numMinusOne)) continue nextBase; // Probably prime for this base
            }
            return false; // Definitely composite
        }
        return true; // Passed all tests
    }

    MultiChunkNumber.prototype.isPrimary = function (isStrict) {
        const isNumPrimary = isSimplePrimary(this);
        if (isNumPrimary !== noValue) return isNumPrimary;

        const absoluteNum = this.absoluteValue();
        const bitLength = absoluteNum.getBitLength();

        if (bitLength.comparison(64) <= 0) {
            return runMillerRabin(absoluteNum, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        }
        const logOfN = Math.log(2) * bitLength.toStandardNumber();
        const testCount = Math.ceil(isStrict === true ? 2 * Math.pow(logOfN, 2) : logOfN);

        const testValues = [];
        for (let idx = 0; idx < testCount; idx++) {
            testValues.push(largeNum(idx + 2));
        }
        return runMillerRabin(absoluteNum, testValues);
    };
    NativeLargeNum.prototype.isPrimary = CompactNumber.prototype.isPrimary = MultiChunkNumber.prototype.isPrimary;

    MultiChunkNumber.prototype.isLikelyPrimary = function (iterationsCount, randomGenerator) {
        const isNumPrimary = isSimplePrimary(this);
        if (isNumPrimary !== noValue) return isNumPrimary;

        const absoluteNum = this.absoluteValue();
        const testCount = iterationsCount === noValue ? 5 : iterationsCount;

        const testValues = [];
        for (let idx = 0; idx < testCount; idx++) {
            testValues.push(largeNum.randomBetween(2, absoluteNum.subtractOperation(2), randomGenerator));
        }
        return runMillerRabin(absoluteNum, testValues);
    };
    NativeLargeNum.prototype.isLikelyPrimary = CompactNumber.prototype.isLikelyPrimary = MultiChunkNumber.prototype.isLikelyPrimary;

    MultiChunkNumber.prototype.modularInverse = function (moduloNum) {
        let tempT = largeNum.zero;
        let newTempT = largeNum.one;
        let currentR = processInputVal(moduloNum);
        let newCurrentR = this.absoluteValue();
        let tempQuotient, previousT, previousR;

        while (!newCurrentR.isZeroValue()) {
            tempQuotient = currentR.quotient(newCurrentR);
            previousT = tempT;
            previousR = currentR;
            tempT = newTempT;
            currentR = newCurrentR;
            newTempT = previousT.difference(tempQuotient.multiplyOperation(newTempT));
            newCurrentR = previousR.difference(tempQuotient.multiplyOperation(newCurrentR));
        }
        if (!currentR.isOne()) throw new Error(this.toRepresentation() + " and " + moduloNum.toRepresentation() + " are not co-prime");
        if (tempT.comparison(0) === -1) {
            tempT = tempT.sum(moduloNum);
        }
        if (this.isNegativeValue()) {
            return tempT.invertSign();
        }
        return tempT;
    };
    NativeLargeNum.prototype.modularInverse = CompactNumber.prototype.modularInverse = MultiChunkNumber.prototype.modularInverse;

    MultiChunkNumber.prototype.incremented = function () {
        const currentValChunks = this.digitChunks;
        if (this.isNegative) {
            return performSmallSubtraction(currentValChunks, 1, this.isNegative);
        }
        return new MultiChunkNumber(performSmallAddition(currentValChunks, 1), this.isNegative);
    };
    CompactNumber.prototype.incremented = function () {
        const currentVal = this.numericalValue;
        if (currentVal + 1 < MAX_SAFE_NUM) return new CompactNumber(currentVal + 1);
        return new MultiChunkNumber(MAX_SAFE_NUM_CHUNKS, false);
    };
    NativeLargeNum.prototype.incremented = function () {
        return new NativeLargeNum(this.nativeValue + BigInt(1));
    };

    MultiChunkNumber.prototype.decremented = function () {
        const currentValChunks = this.digitChunks;
        if (this.isNegative) {
            return new MultiChunkNumber(performSmallAddition(currentValChunks, 1), true);
        }
        return performSmallSubtraction(currentValChunks, 1, this.isNegative);
    };
    CompactNumber.prototype.decremented = function () {
        const currentVal = this.numericalValue;
        if (currentVal - 1 > -MAX_SAFE_NUM) return new CompactNumber(currentVal - 1);
        return new MultiChunkNumber(MAX_SAFE_NUM_CHUNKS, true); // Represents -(MAX_SAFE_NUM_CHUNKS)
    };
    NativeLargeNum.prototype.decremented = function () {
        return new NativeLargeNum(this.nativeValue - BigInt(1));
    };

    /* Pre-calculate powers of two for bit shifting operations */
    const binaryFactors = [1];
    while (2 * binaryFactors[binaryFactors.length - 1] <= CHUNK_SIZE) binaryFactors.push(2 * binaryFactors[binaryFactors.length - 1]);
    const binaryFactorsLen = binaryFactors.length;
    const largestBinaryFactor = binaryFactors[binaryFactorsLen - 1];

    /**
     * Checks if a number for shifting is small enough.
     * @param {number} shiftVal - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftValSmall(shiftVal) {
        return Math.abs(shiftVal) <= CHUNK_SIZE;
    }

    MultiChunkNumber.prototype.bitShiftLeft = function (inputVal) {
        const shiftAmount = processInputVal(inputVal).toStandardNumber();
        if (!isShiftValSmall(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        if (shiftAmount < 0) return this.bitShiftRight(-shiftAmount);

        let currentResult = this;
        if (currentResult.isZeroValue()) return currentResult;

        while (shiftAmount >= binaryFactorsLen) {
            currentResult = currentResult.multiplyOperation(largestBinaryFactor);
            shiftAmount -= binaryFactorsLen - 1;
        }
        return currentResult.multiplyOperation(binaryFactors[shiftAmount]);
    };
    NativeLargeNum.prototype.bitShiftLeft = CompactNumber.prototype.bitShiftLeft = MultiChunkNumber.prototype.bitShiftLeft;

    MultiChunkNumber.prototype.bitShiftRight = function (inputVal) {
        let remainderQuotient;
        const shiftAmount = processInputVal(inputVal).toStandardNumber();
        if (!isShiftValSmall(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        if (shiftAmount < 0) return this.bitShiftLeft(-shiftAmount);

        let currentResult = this;
        while (shiftAmount >= binaryFactorsLen) {
            if (currentResult.isZeroValue() || currentResult.isNegativeValue() && currentResult.isOne()) return currentResult;
            remainderQuotient = performAnyDivision(currentResult, largestBinaryFactor);
            currentResult = remainderQuotient[1].isNegativeValue() ? remainderQuotient[0].decremented() : remainderQuotient[0];
            shiftAmount -= binaryFactorsLen - 1;
        }
        remainderQuotient = performAnyDivision(currentResult, binaryFactors[shiftAmount]);
        return remainderQuotient[1].isNegativeValue() ? remainderQuotient[0].decremented() : remainderQuotient[0];
    };
    NativeLargeNum.prototype.bitShiftRight = CompactNumber.prototype.bitShiftRight = MultiChunkNumber.prototype.bitShiftRight;

    /**
     * Performs a bitwise operation (AND, OR, XOR) on two large numbers.
     * @param {LargeNumberFactory} firstNum - First operand.
     * @param {LargeNumberFactory} secondNum - Second operand.
     * @param {function(number, number): number} bitwiseFn - The bitwise function to apply.
     * @returns {LargeNumberFactory} The result of the bitwise operation.
     */
    function performBitwiseOperation(firstNum, secondNum, bitwiseFn) {
        secondNum = processInputVal(secondNum);
        const isXNegative = firstNum.isNegativeValue();
        const isYNegative = secondNum.isNegativeValue();

        let xRemainder = isXNegative ? firstNum.bitwiseNot() : firstNum;
        let yRemainder = isYNegative ? secondNum.bitwiseNot() : secondNum;

        let xCurrentDigit = 0,
            yCurrentDigit = 0;
        let xDivideMod = null,
            yDivideMod = null;
        const resultArray = [];

        while (!xRemainder.isZeroValue() || !yRemainder.isZeroValue()) {
            xDivideMod = performAnyDivision(xRemainder, largestBinaryFactor);
            xCurrentDigit = xDivideMod[1].toStandardNumber();
            if (isXNegative) {
                xCurrentDigit = largestBinaryFactor - 1 - xCurrentDigit;
            }

            yDivideMod = performAnyDivision(yRemainder, largestBinaryFactor);
            yCurrentDigit = yDivideMod[1].toStandardNumber();
            if (isYNegative) {
                yCurrentDigit = largestBinaryFactor - 1 - yCurrentDigit;
            }

            xRemainder = xDivideMod[0];
            yRemainder = yDivideMod[0];
            resultArray.push(bitwiseFn(xCurrentDigit, yCurrentDigit));
        }

        let bitwiseSum = bitwiseFn(isXNegative ? 1 : 0, isYNegative ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
        for (let idx = resultArray.length - 1; idx >= 0; idx -= 1) {
            bitwiseSum = bitwiseSum.multiplyOperation(largestBinaryFactor).sum(largeNum(resultArray[idx]));
        }
        return bitwiseSum;
    }

    MultiChunkNumber.prototype.bitwiseNot = function () {
        return this.invertSign().decremented();
    };
    NativeLargeNum.prototype.bitwiseNot = CompactNumber.prototype.bitwiseNot = MultiChunkNumber.prototype.bitwiseNot;

    MultiChunkNumber.prototype.bitwiseAnd = function (inputNum) {
        return performBitwiseOperation(this, inputNum, function (valA, valB) {
            return valA & valB;
        });
    };
    NativeLargeNum.prototype.bitwiseAnd = CompactNumber.prototype.bitwiseAnd = MultiChunkNumber.prototype.bitwiseAnd;

    MultiChunkNumber.prototype.bitwiseOr = function (inputNum) {
        return performBitwiseOperation(this, inputNum, function (valA, valB) {
            return valA | valB;
        });
    };
    NativeLargeNum.prototype.bitwiseOr = CompactNumber.prototype.bitwiseOr = MultiChunkNumber.prototype.bitwiseOr;

    MultiChunkNumber.prototype.bitwiseXor = function (inputNum) {
        return performBitwiseOperation(this, inputNum, function (valA, valB) {
            return valA ^ valB;
        });
    };
    NativeLargeNum.prototype.bitwiseXor = CompactNumber.prototype.bitwiseXor = MultiChunkNumber.prototype.bitwiseXor;

    const LOB_MASK_INT = 1 << 30; // Mask for Least One Bit in JS number
    const LOB_MASK_BIG_INT = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | LOB_MASK_INT; // Mask for LOB in BigInt chunks

    /**
     * Approximates the Least One Bit (LOB) of a large number.
     * @param {LargeNumberFactory} inputNum - The number to get LOB for.
     * @returns {number|BigInt} The approximate LOB.
     */
    function approximateLeastOneBit(inputNum) {
        const valueToCheck = inputNum.digitChunks;
        let combinedValue = typeof valueToCheck === "number" ? valueToCheck | LOB_MASK_INT : typeof valueToCheck === "bigint" ? valueToCheck | BigInt(LOB_MASK_INT) : valueToCheck[0] + valueToCheck[1] * CHUNK_SIZE | LOB_MASK_BIG_INT;
        return combinedValue & -combinedValue;
    }

    /**
     * Calculates the integer logarithm (floor) of a number for a given base.
     * @param {LargeNumberFactory} numberVal - The number.
     * @param {LargeNumberFactory} baseVal - The base.
     * @returns {{p: LargeNumberFactory, e: number}} Object with power component and exponent.
     */
    function logarithmInteger(numberVal, baseVal) {
        if (baseVal.comparison(numberVal) <= 0) {
            const tempLogResult = logarithmInteger(numberVal, baseVal.squared());
            const powerComponent = tempLogResult.p;
            const exponentComponent = tempLogResult.e;
            const testProduct = powerComponent.multiplyOperation(baseVal);
            return testProduct.comparison(numberVal) <= 0 ? {
                p: testProduct,
                e: exponentComponent * 2 + 1
            } : {
                p: powerComponent,
                e: exponentComponent * 2
            };
        }
        return {
            p: largeNum(1),
            e: 0
        };
    }

    MultiChunkNumber.prototype.getBitLength = function () {
        let currentNum = this;
        if (currentNum.comparison(largeNum(0)) < 0) {
            currentNum = currentNum.invertSign().difference(largeNum(1));
        }
        if (currentNum.comparison(largeNum(0)) === 0) {
            return largeNum(0);
        }
        return largeNum(logarithmInteger(currentNum, largeNum(2)).e).sum(largeNum(1));
    };
    NativeLargeNum.prototype.getBitLength = CompactNumber.prototype.getBitLength = MultiChunkNumber.prototype.getBitLength;

    /**
     * Finds the maximum of two large numbers.
     * @param {any} val1 - First value.
     * @param {any} val2 - Second value.
     * @returns {LargeNumberFactory} The maximum value.
     */
    function findMaximum(val1, val2) {
        val1 = processInputVal(val1);
        val2 = processInputVal(val2);
        return val1.isGreaterThan(val2) ? val1 : val2;
    }

    /**
     * Finds the minimum of two large numbers.
     * @param {any} val1 - First value.
     * @param {any} val2 - Second value.
     * @returns {LargeNumberFactory} The minimum value.
     */
    function findMinimum(val1, val2) {
        val1 = processInputVal(val1);
        val2 = processInputVal(val2);
        return val1.isLesserThan(val2) ? val1 : val2;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two numbers using Euclidean algorithm.
     * @param {any} valA - First number.
     * @param {any} valB - Second number.
     * @returns {LargeNumberFactory} The GCD.
     */
    function greatestCommonDivisor(valA, valB) {
        valA = processInputVal(valA).absoluteValue();
        valB = processInputVal(valB).absoluteValue();
        if (valA.isEqualTo(valB)) return valA;
        if (valA.isZeroValue()) return valB;
        if (valB.isZeroValue()) return valA;

        let commonFactor = LargeNumberFactory[1];
        let tempD, tempT;
        while (valA.isEvenlyDivisible() && valB.isEvenlyDivisible()) {
            tempD = findMinimum(approximateLeastOneBit(valA), approximateLeastOneBit(valB));
            valA = valA.quotient(tempD);
            valB = valB.quotient(tempD);
            commonFactor = commonFactor.multiplyOperation(tempD);
        }
        while (valA.isEvenlyDivisible()) {
            valA = valA.quotient(approximateLeastOneBit(valA));
        }
        do {
            while (valB.isEvenlyDivisible()) {
                valB = valB.quotient(approximateLeastOneBit(valB));
            }
            if (valA.isGreaterThan(valB)) {
                tempT = valB;
                valB = valA;
                valA = tempT;
            }
            valB = valB.difference(valA);
        } while (!valB.isZeroValue());
        return commonFactor.isOne() ? valA : valA.multiplyOperation(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two numbers.
     * @param {any} valA - First number.
     * @param {any} valB - Second number.
     * @returns {LargeNumberFactory} The LCM.
     */
    function leastCommonMultiple(valA, valB) {
        valA = processInputVal(valA).absoluteValue();
        valB = processInputVal(valB).absoluteValue();
        return valA.quotient(greatestCommonDivisor(valA, valB)).multiplyOperation(valB);
    }

    /**
     * Generates a random large number between two bounds.
     * @param {LargeNumberFactory} lowerBound - Inclusive lower bound.
     * @param {LargeNumberFactory} upperBound - Inclusive upper bound.
     * @param {function(): number} [randomGenerator=Math.random] - Custom random number generator.
     * @returns {LargeNumberFactory} A random large number.
     */
    function randomBetween(lowerBound, upperBound, randomGenerator) {
        lowerBound = processInputVal(lowerBound);
        upperBound = processInputVal(upperBound);
        const usedRandomGenerator = randomGenerator || Math.random;
        const minVal = findMinimum(lowerBound, upperBound);
        const maxVal = findMaximum(lowerBound, upperBound);
        const valueRange = maxVal.difference(minVal).sum(1);

        if (valueRange.isSingleChunk) return minVal.sum(Math.floor(usedRandomGenerator() * valueRange.numericalValue));

        const chunkDigits = convertToBase(valueRange, CHUNK_SIZE).digitChunks;
        const resultArray = [];
        let isRestricted = true; // Flag if we are restricted by the max chunk
        for (let idx = 0; idx < chunkDigits.length; idx++) {
            const upperLimit = isRestricted ? chunkDigits[idx] : CHUNK_SIZE;
            const currentDigit = chopDecimal(usedRandomGenerator() * upperLimit);
            resultArray.push(currentDigit);
            if (currentDigit < upperLimit) isRestricted = false;
        }
        return minVal.sum(LargeNumberFactory.fromArray(resultArray, CHUNK_SIZE, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} numString - The string to parse.
     * @param {number} baseVal - The base of the number string.
     * @param {string} [charSet] - Custom alphabet for digits.
     * @param {boolean} [respectCase] - Whether character set matching is case-sensitive.
     * @returns {LargeNumberFactory} The parsed large number.
     */
    const processBaseString = function (numString, baseVal, charSet, respectCase) {
        charSet = charSet || BASE_CHARS;
        numString = String(numString);
        if (!respectCase) {
            numString = numString.toLowerCase();
            charSet = charSet.toLowerCase();
        }
        const strLength = numString.length;
        let idx;
        const absoluteBase = Math.abs(baseVal);
        const charValueMap = {};

        for (idx = 0; idx < charSet.length; idx++) {
            charValueMap[charSet[idx]] = idx;
        }

        for (idx = 0; idx < strLength; idx++) {
            const currentChar = numString[idx];
            if (currentChar === "-") continue; // Skip sign
            if (currentChar in charValueMap) {
                if (charValueMap[currentChar] >= absoluteBase) {
                    if (currentChar === "1" && absoluteBase === 1) continue; // Special case for base 1
                    throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
                }
            }
        }
        baseVal = processInputVal(baseVal);
        const digitArray = [];
        const isNumNegative = numString[0] === "-";
        for (idx = isNumNegative ? 1 : 0; idx < numString.length; idx++) {
            const currentChar = numString[idx];
            if (currentChar in charValueMap) digitArray.push(processInputVal(charValueMap[currentChar]));
            else if (currentChar === "<") {
                let startIndex = idx;
                do {
                    idx++;
                } while (numString[idx] !== ">" && idx < numString.length);
                digitArray.push(processInputVal(numString.slice(startIndex + 1, idx)));
            } else throw new Error(currentChar + " is not a valid character");
        }
        return parseChunksToBase(digitArray, baseVal, isNumNegative);
    };

    /**
     * Converts an array of digits (parsed from a base string) into a large number.
     * @param {LargeNumberFactory[]} digitArray - Array of digit values as large numbers.
     * @param {LargeNumberFactory} baseVal - The base of the numbers.
     * @param {boolean} isNegative - True if the final number should be negative.
     * @returns {LargeNumberFactory} The resulting large number.
     */
    function parseChunksToBase(digitArray, baseVal, isNegative) {
        let accumulatedValue = LargeNumberFactory[0];
        let powerTerm = LargeNumberFactory[1];
        let idx;
        for (idx = digitArray.length - 1; idx >= 0; idx--) {
            accumulatedValue = accumulatedValue.sum(digitArray[idx].multiplyOperation(powerTerm));
            powerTerm = powerTerm.multiplyOperation(baseVal);
        }
        return isNegative ? accumulatedValue.invertSign() : accumulatedValue;
    }

    /**
     * Converts a single digit/chunk to its string representation using an alphabet.
     * @param {number} digitVal - The digit value.
     * @param {string} [charSet] - The alphabet to use.
     * @returns {string} The string representation.
     */
    function chunkToString(digitVal, charSet) {
        charSet = charSet || BASE_CHARS;
        if (digitVal < charSet.length) {
            return charSet[digitVal];
        }
        return "<" + digitVal + ">"; // Fallback for digits outside alphabet
    }

    /**
     * Converts a large number to an array of chunks in a specified base.
     * @param {LargeNumberFactory} inputNum - The number to convert.
     * @param {LargeNumberFactory} baseVal - The target base.
     * @returns {{digitChunks: number[], isNegative: boolean}} Object with chunk array and sign.
     */
    function convertToBase(inputNum, baseVal) {
        baseVal = largeNum(baseVal);
        if (baseVal.isZeroValue()) {
            if (inputNum.isZeroValue()) return {
                digitChunks: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (baseVal.isEqualTo(-1)) {
            if (inputNum.isZeroValue()) return {
                digitChunks: [0],
                isNegative: false
            };
            if (inputNum.isNegativeValue()) {
                // For negative numbers in base -1, an alternating sequence of 1s and 0s
                const alternatingSeq = [].concat.apply([], Array.apply(null, Array(-inputNum.toStandardNumber())).map(Array.prototype.valueOf, [1, 0]));
                return {
                    digitChunks: alternatingSeq,
                    isNegative: false
                };
            }
            // For positive numbers in base -1
            const arrParts = Array.apply(null, Array(inputNum.toStandardNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
            arrParts.unshift([1]);
            return {
                digitChunks: [].concat.apply([], arrParts),
                isNegative: false
            };
        }
        let isOutputNegative = false;
        if (inputNum.isNegativeValue() && baseVal.isPositiveValue()) {
            isOutputNegative = true;
            inputNum = inputNum.absoluteValue();
        }
        if (baseVal.isOne()) {
            if (inputNum.isZeroValue()) return {
                digitChunks: [0],
                isNegative: false
            };
            // Base 1 means N '1's
            return {
                digitChunks: Array.apply(null, Array(inputNum.toStandardNumber())).map(Number.prototype.valueOf, 1),
                isNegative: isOutputNegative
            };
        }

        const outputDigits = [];
        let remainingValue = inputNum;
        let divRemainder;
        while (remainingValue.isNegativeValue() || remainingValue.compareAbsolute(baseVal) >= 0) {
            divRemainder = remainingValue.divideAndRemainder(baseVal);
            remainingValue = divRemainder.quotient;
            let currentDigit = divRemainder.remainder;
            if (currentDigit.isNegativeValue()) {
                currentDigit = baseVal.subtractOperation(currentDigit).absoluteValue();
                remainingValue = remainingValue.incremented();
            }
            outputDigits.push(currentDigit.toStandardNumber());
        }
        outputDigits.push(remainingValue.toStandardNumber());
        return {
            digitChunks: outputDigits.reverse(),
            isNegative: isOutputNegative
        };
    }

    /**
     * Converts a large number to its string representation in a given base.
     * @param {LargeNumberFactory} inputNum - The number to convert.
     * @param {number} baseVal - The target base.
     * @param {string} [charSet] - Custom alphabet for digits.
     * @returns {string} The string representation.
     */
    function convertToStringBase(inputNum, baseVal, charSet) {
        const chunkedResult = convertToBase(inputNum, baseVal);
        return (chunkedResult.isNegative ? "-" : "") + chunkedResult.digitChunks.map(function (chunkValue) {
            return chunkToString(chunkValue, charSet);
        }).join("");
    }

    MultiChunkNumber.prototype.toChunkedArray = function (baseVal) {
        return convertToBase(this, baseVal);
    };
    CompactNumber.prototype.toChunkedArray = function (baseVal) {
        return convertToBase(this, baseVal);
    };
    NativeLargeNum.prototype.toChunkedArray = function (baseVal) {
        return convertToBase(this, baseVal);
    };

    MultiChunkNumber.prototype.toRepresentation = function (baseVal, charSet) {
        if (baseVal === noValue) baseVal = 10;
        if (baseVal !== 10) return convertToStringBase(this, baseVal, charSet);
        const digitChunks = this.digitChunks;
        let len = digitChunks.length;
        let outputString = String(digitChunks[--len]);
        const zeroPad = "0000000"; // For padding chunks
        let currentDigit;
        while (--len >= 0) {
            currentDigit = String(digitChunks[len]);
            outputString += zeroPad.slice(currentDigit.length) + currentDigit;
        }
        const signChar = this.isNegative ? "-" : "";
        return signChar + outputString;
    };

    CompactNumber.prototype.toRepresentation = function (baseVal, charSet) {
        if (baseVal === noValue) baseVal = 10;
        if (baseVal !== 10) return convertToStringBase(this, baseVal, charSet);
        return String(this.numericalValue);
    };
    NativeLargeNum.prototype.toRepresentation = CompactNumber.prototype.toRepresentation;

    NativeLargeNum.prototype.serializeToJSON = MultiChunkNumber.prototype.serializeToJSON = CompactNumber.prototype.serializeToJSON = function () {
        return this.toRepresentation();
    };

    MultiChunkNumber.prototype.getPrimitiveValue = function () {
        return parseInt(this.toRepresentation(), 10);
    };
    MultiChunkNumber.prototype.toStandardNumber = MultiChunkNumber.prototype.getPrimitiveValue;

    CompactNumber.prototype.getPrimitiveValue = function () {
        return this.numericalValue;
    };
    CompactNumber.prototype.toStandardNumber = CompactNumber.prototype.getPrimitiveValue;

    NativeLargeNum.prototype.getPrimitiveValue = NativeLargeNum.prototype.toStandardNumber = function () {
        return parseInt(this.toRepresentation(), 10);
    };

    /**
     * Parses a string value into a large number.
     * @param {string} inputString - The string to parse.
     * @returns {LargeNumberFactory} The parsed large number.
     */
    function processStringValue(inputString) {
        // Handle scientific notation and check for precision
        if (isStandardPrecise(+inputString)) {
            const parsedNum = +inputString;
            if (parsedNum === chopDecimal(parsedNum)) {
                return hasNativeLargeIntSupport ? new NativeLargeNum(BigInt(parsedNum)) : new CompactNumber(parsedNum);
            }
            throw new Error("Invalid integer: " + inputString);
        }

        const isNegative = inputString[0] === "-";
        if (isNegative) inputString = inputString.slice(1);

        const parts = inputString.split(/e/i); // Split by 'e' for scientific notation
        if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));

        if (parts.length === 2) {
            let exponentVal = parts[1];
            if (exponentVal[0] === "+") exponentVal = exponentVal.slice(1);
            exponentVal = +exponentVal;

            if (exponentVal !== chopDecimal(exponentVal) || !isStandardPrecise(exponentVal)) {
                throw new Error("Invalid integer: " + exponentVal + " is not a valid exponent.");
            }

            let numericText = parts[0];
            const dotPosition = numericText.indexOf(".");
            if (dotPosition >= 0) {
                exponentVal -= numericText.length - dotPosition - 1;
                numericText = numericText.slice(0, dotPosition) + numericText.slice(dotPosition + 1);
            }
            if (exponentVal < 0) throw new Error("Cannot include negative exponent part for integers");
            numericText += new Array(exponentVal + 1).join("0"); // Pad with zeros
            inputString = numericText;
        }

        const isFormatValid = /^([0-9][0-9]*)$/.test(inputString);
        if (!isFormatValid) throw new Error("Invalid integer: " + inputString);

        if (hasNativeLargeIntSupport) {
            return new NativeLargeNum(BigInt(isNegative ? "-" + inputString : inputString));
        }

        const resultArray = [];
        const maxLength = inputString.length;
        const chunkLength = CHUNK_LOG; // 7
        let currentMinLength = maxLength - chunkLength;

        while (maxLength > 0) {
            resultArray.push(+inputString.slice(currentMinLength, maxLength));
            currentMinLength -= chunkLength;
            if (currentMinLength < 0) currentMinLength = 0;
            maxLength -= chunkLength;
        }
        removeLeadingZeros(resultArray);
        return new MultiChunkNumber(resultArray, isNegative);
    }

    /**
     * Parses a number value into a large number.
     * @param {number} inputNum - The number to parse.
     * @returns {LargeNumberFactory} The parsed large number.
     */
    function processNumberValue(inputNum) {
        if (hasNativeLargeIntSupport) {
            return new NativeLargeNum(BigInt(inputNum));
        }
        if (isStandardPrecise(inputNum)) {
            if (inputNum !== chopDecimal(inputNum)) throw new Error(inputNum + " is not an integer.");
            return new CompactNumber(inputNum);
        }
        return processStringValue(inputNum.toRepresentation());
    }

    /**
     * Processes any input value into a LargeNumberFactory instance.
     * @param {any} inputVal - The value to process.
     * @returns {LargeNumberFactory} A LargeNumberFactory instance.
     */
    function processInput(inputVal) {
        if (typeof inputVal === "number") {
            return processNumberValue(inputVal);
        }
        if (typeof inputVal === "string") {
            return processStringValue(inputVal);
        }
        if (typeof inputVal === "bigint") {
            return new NativeLargeNum(inputVal);
        }
        return inputVal; // Assume it's already a LargeNumberFactory instance
    }

    // Pre-populate common small integers for efficiency
    for (let idx = 0; idx < 1e3; idx++) {
        LargeNumberFactory[idx] = processInput(idx);
        if (idx > 0) LargeNumberFactory[-idx] = processInput(-idx);
    }

    // Define common constants for convenience
    LargeNumberFactory.one = LargeNumberFactory[1];
    LargeNumberFactory.zero = LargeNumberFactory[0];
    LargeNumberFactory.minusOne = LargeNumberFactory[-1];

    // Export utility methods
    LargeNumberFactory.findMaximum = findMaximum;
    LargeNumberFactory.findMinimum = findMinimum;
    LargeNumberFactory.greatestCommonDivisor = greatestCommonDivisor;
    LargeNumberFactory.leastCommonMultiple = leastCommonMultiple;
    LargeNumberFactory.isInstance = function (obj) {
        return obj instanceof MultiChunkNumber || obj instanceof CompactNumber || obj instanceof NativeLargeNum;
    };
    LargeNumberFactory.randomBetween = randomBetween;
    LargeNumberFactory.fromArray = function (digitArray, baseVal, isNegative) {
        return parseChunksToBase(digitArray.map(processInput), processInput(baseVal || 10), isNegative);
    };

    return LargeNumberFactory;
}();

/*
 * Conditional export for Node.js modules.
 * If module.exports exists, assign the largeNum factory to it.
 */
if (typeof module !== "noValue" && module.hasOwnProperty("exports")) {
    module.exports = largeNum;
}

/*
 * Conditional export for AMD (Asynchronous Module Definition) environments.
 * If define is a function and define.amd is true, register the largeNum factory.
 */
if (typeof define === "function" && define.amd) {
    define(function () {
        return largeNum;
    });
}

// Entry point for the program execution.
console.log(executeCalculation());

/**
 * Main function to perform array product window calculations.
 * Reads input parameters N and K, and an array of numbers.
 * Calculates products of sliding windows and compares them.
 * @returns {string} A newline-separated string of comparison results ('Yes' or 'No').
 */
function executeCalculation() {
    /*
     * Read the first line of input to get N (total elements) and K (window size).
     * The input is expected to be space-separated numbers.
     */
    const inputParams = readerInstance.getLineValues(0);
    const totalElements = inputParams[0];
    const windowSize = inputParams[1];

    /*
     * Read the second line of input, which contains the array of numbers (An).
     */
    const elementData = readerInstance.getLineValues(1);

    /*
     * Initialize loop counter and storage for results and window product values.
     * `currentIdx` starts at `windowSize` because the first window's product
     * is calculated before the loop, covering elements from 0 to `windowSize - 1`.
     */
    let currentIdx = windowSize;
    const comparisonOutcomes = [];
    const productWindowValues = [];

    /*
     * Calculate the product for the initial window (elements 0 to K-1).
     * The `reduce` function multiplies all elements in this initial slice.
     * Convert the result to a large number to handle potential overflows.
     */
    productWindowValues.push(largeNum(elementData.slice(currentIdx - windowSize, currentIdx).reduce(function (accumulator, currentElement) {
        return accumulator * currentElement;
    }, 1)));

    /*
     * Iterate through the rest of the array, sliding the window one element at a time.
     * For each step, calculate the new window product efficiently from the previous one.
     * The new product is (old_product / element_leaving_window) * element_entering_window.
     */
    while (totalElements > currentIdx) {
        /*
         * Calculate the product for the current sliding window.
         * The new value is derived from the previous window's product,
         * divided by the element that just left the window, and multiplied
         * by the new element that just entered the window.
         */
        productWindowValues.push(largeNum(elementData[currentIdx]).multiplyOperation(productWindowValues[currentIdx - windowSize]).quotient(elementData[currentIdx - windowSize]));
        currentIdx++; // Move to the next element

        /*
         * Compare the current window's product with the previous one.
         * Store 'Yes' if the current product is greater, 'No' otherwise.
         */
        const lastValueIndex = productWindowValues.length - 1;
        comparisonOutcomes.push((productWindowValues[lastValueIndex].isGreaterThan(productWindowValues[lastValueIndex - 1]) ? 'Yes' : 'No'));
    }

    /*
     * Join all comparison results with newline characters and return the final string.
     */
    return comparisonOutcomes.join('\n');
}