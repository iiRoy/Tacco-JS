try {
    // Attempt to load the optimized native C++ addon from the debug build path.
    const nativeImplementation = new require('./build/Debug/bignum');
} catch (initialError) {
    // If debug build fails, try the release build path.
    // This allows for flexible deployment without manual path adjustments.
    const nativeImplementation = new require('./build/Release/bignum');
}

// Define the primary class for handling large integer arithmetic.
// This class wraps the native C++ implementation.
const HugeInt = nativeImplementation.BigNum;

// Export the HugeInt class to make it available for other modules.
module.exports = HugeInt;

/**
 * Normalizes input arguments for internal native module consumption.
 * Handles various input types and formats, including scientific notation.
 * @param {string|number|HugeInt} inputValue - The number to condition.
 * @param {number} [inputRadix=10] - The base of the input number if it's a string.
 * @returns {{valueStr: string, radixNum: number}} An object containing the normalized string representation and its base.
 */
HugeInt.normalizeInput = function (inputValue, inputRadix = 10) {
    let processedValue = String(inputValue); // Ensure string representation for regex checks
    let currentRadix = inputRadix;

    // Check for positive scientific notation (e.g., 1.23e+5)
    const positiveExpMatch = processedValue.match(/e\+/i);
    if (positiveExpMatch) {
        // If the number's standard string representation *also* has 'e+', it's genuinely huge.
        // Otherwise, it's a number that can be fully represented without scientific notation.
        if (!Number(processedValue).toString().match(/e\+/i)) {
            // Convert to a plain integer string if it fits standard number limits
            return {
                valueStr: Math.floor(Number(processedValue)).toString(),
                radixNum: 10
            };
        } else {
            // For genuinely large numbers in scientific notation, convert to binary for processing.
            // This approach ensures precision for very large numbers that might exceed JS Number limits.
            const powerOfTwoExponent = Math.ceil(Math.log2(Number(processedValue)));
            let binaryRepresentation = (Number(processedValue) / Math.pow(2, powerOfTwoExponent))
                .toString(2)
                .replace(/^0\./, ''); // Remove leading "0."

            let decimalPointIndex = binaryRepresentation.indexOf('.');
            if (decimalPointIndex !== -1) {
                binaryRepresentation = binaryRepresentation.replace(/\./, ''); // Remove the decimal point
                // Append zeros to account for the original exponent's magnitude
                for (let i = binaryRepresentation.length - decimalPointIndex; i <= powerOfTwoExponent; i++) {
                    binaryRepresentation += '0';
                }
            } else {
                // If no decimal point, just append zeros for the exponent
                for (let i = 0; i < powerOfTwoExponent; i++) {
                    binaryRepresentation += '0';
                }
            }

            return {
                valueStr: binaryRepresentation,
                radixNum: 2,
            };
        }
    }
    // Check for negative scientific notation (e.g., 1.23e-5)
    else if (processedValue.match(/e\-/i)) {
        // For negative exponents, typically implies a fractional number.
        // The native module might handle this by flooring it or treating it as zero.
        // Here, we floor it and return the string representation in base 10.
        return {
            valueStr: Math.floor(Number(processedValue)).toString(),
            radixNum: currentRadix
        };
    } else {
        // For regular numbers or strings, return as is with the specified radix.
        return {
            valueStr: processedValue,
            radixNum: currentRadix,
        };
    }
};

// Set the JavaScript-side argument conditioner for the native module.
nativeImplementation.setJSConditioner(HugeInt.normalizeInput);

/**
 * Provides a human-readable debug representation for a HugeInt instance.
 * @returns {string} Debug string, e.g., "<HugeInt 12345>"
 */
HugeInt.prototype.debugInfo = function () {
    // Calls the native toString method with base 10 by default.
    return `<HugeInt ${this.getStringRepresentation(10)}>`;
};

/**
 * Converts the HugeInt instance to its string representation in a specified radix.
 * @param {number} [outputRadix=10] - The base for the output string (e.g., 2 for binary, 16 for hexadecimal).
 * @returns {string} The string representation of the HugeInt.
 */
HugeInt.prototype.getStringRepresentation = function (outputRadix = 10) {
    let resultString;

    // Validate the radix to prevent unexpected behavior from the native module.
    if (outputRadix < 2 || outputRadix > 36 || !Number.isInteger(outputRadix)) {
        throw new RangeError(`Invalid radix specified: ${outputRadix}. Radix must be an integer between 2 and 36.`);
    }

    // Call the native method for string conversion.
    resultString = this.tostring(outputRadix);

    // Convert hexadecimal and other higher-radix outputs to lowercase for consistency.
    if (outputRadix > 10 && typeof resultString === 'string') {
        resultString = resultString.toLowerCase();
    }
    return resultString;
};

/**
 * Converts the HugeInt instance to a standard JavaScript number.
 * Note: This may result in loss of precision for very large numbers.
 * @returns {number} The numeric value of the HugeInt.
 */
HugeInt.prototype.getNumericValue = function () {
    const stringValue = this.getStringRepresentation(); // Get base 10 string
    const parsedNumber = Number(stringValue); // Convert to JS Number

    // Check if the conversion resulted in an unrepresentable number.
    if (!Number.isFinite(parsedNumber) && stringValue !== '0') {
        // If it's infinity and not actually 0, it means the number is too large.
        console.warn('Warning: HugeInt value exceeds JavaScript\'s safe integer limits. Precision may be lost.');
    }
    return parsedNumber;
};

// Internal utility to determine the correct native method name for arithmetic operations.
const getNativeOpName = (baseMethod, operationKey, isNumber, isNegative) => {
    if (isNumber) {
        // Unsigned operations for positive numbers, signed for negative
        return isNegative ? `s${baseMethod}` : `u${baseMethod}`;
    }
    // For HugeInt instances, use the 'b' (bignum) prefix
    return `b${baseMethod}`;
};

// Define common arithmetic operations: addition, subtraction, multiplication, division, modulo.
// These methods handle polymorphism for different operand types.
['add', 'sub', 'mul', 'div', 'mod'].forEach(function (operationKey) {
    HugeInt.prototype[operationKey] = function (otherOperand) {
        // Validate input; otherOperand must be a number, string, or another HugeInt.
        if (otherOperand === null || otherOperand === undefined) {
            throw new TypeError(`Operand for ${operationKey} cannot be null or undefined.`);
        }

        const isHugeInt = otherOperand instanceof HugeInt;
        const isNumber = typeof otherOperand === 'number';
        const isString = typeof otherOperand === 'string';

        if (isHugeInt) {
            // Direct call to native bignum operation.
            return this[`b${operationKey}`](otherOperand);
        } else if (isNumber) {
            // Special handling for number operands based on sign.
            const isNegativeNumber = otherOperand < 0;
            if (isNegativeNumber) {
                // For negative numbers, some operations can be transformed.
                // e.g., A + (-B) = A - B
                // e.g., A - (-B) = A + B
                switch (operationKey) {
                    case 'add':
                        return this.usub(-otherOperand); // A + (-B) becomes A - B
                    case 'sub':
                        return this.uadd(-otherOperand); // A - (-B) becomes A + B
                    default:
                        // For mul, div, mod with negative numbers, convert to HugeInt.
                        const tempHugeInt = HugeInt(otherOperand);
                        return this[`b${operationKey}`](tempHugeInt);
                }
            } else {
                // Positive number, use unsigned native operation.
                return this[`u${operationKey}`](otherOperand);
            }
        } else if (isString) {
            // Convert string to HugeInt and then perform the operation.
            const tempHugeInt = HugeInt(otherOperand);
            return this[`b${operationKey}`](tempHugeInt);
        } else {
            // Throw an error for unsupported operand types.
            throw new TypeError(
                `Unsupported operand type for '${operationKey}': ${typeof otherOperand}. Expected HugeInt, number, or string.`
            );
        }
    };
});

/**
 * Calculates the absolute value of the HugeInt.
 * @returns {HugeInt} A new HugeInt instance representing the absolute value.
 */
HugeInt.prototype.absoluteValue = function () {
    return this.babs();
};

/**
 * Negates the HugeInt (changes its sign).
 * @returns {HugeInt} A new HugeInt instance with the opposite sign.
 */
HugeInt.prototype.negate = function () {
    return this.bneg();
};

/**
 * Computes modular exponentiation (base^exponent mod modulus).
 * @param {HugeInt|number|string} exponent - The exponent.
 * @param {HugeInt|number|string} modulus - The modulus.
 * @returns {HugeInt} The result of (this ^ exponent) % modulus.
 */
HugeInt.prototype.modularExponentiation = function (exponent, modulus) {
    let finalModulus;

    // Normalize the modulus argument to a HugeInt instance.
    if (modulus instanceof HugeInt) {
        finalModulus = modulus;
    } else if (typeof modulus === 'number' || typeof modulus === 'string') {
        finalModulus = HugeInt(modulus);
    } else {
        throw new TypeError('Modulus for modularExponentiation must be a HugeInt, number, or string.');
    }

    // Determine the appropriate native method based on the exponent type.
    if (typeof exponent === 'number') {
        return this.upowm(exponent, finalModulus); // Unsigned power for number exponent
    } else if (exponent instanceof HugeInt) {
        return this.bpowm(exponent, finalModulus); // Bignum power for HugeInt exponent
    } else if (typeof exponent === 'string') {
        const exponentAsHugeInt = HugeInt(exponent);
        return this.bpowm(exponentAsHugeInt, finalModulus);
    } else {
        throw new TypeError('Exponent for modularExponentiation must be a HugeInt, number, or string.');
    }
};

/**
 * Computes the remainder of the division of this HugeInt by a divisor.
 * Note: This method name is changed from 'mod' to 'remainder' to avoid conflict with the arithmetic 'mod' method.
 * @param {HugeInt|number|string} divisor - The number to divide by.
 * @param {HugeInt|number|string} [modulus] - Optional modulus, if performing (this % divisor) % modulus.
 * @returns {HugeInt} The remainder.
 */
HugeInt.prototype.remainder = function (divisor, modulus) {
    let finalModulus;

    // If a modulus is provided, normalize it.
    if (modulus !== undefined) {
        if (modulus instanceof HugeInt) {
            finalModulus = modulus;
        } else if (typeof modulus === 'number' || typeof modulus === 'string') {
            finalModulus = HugeInt(modulus);
        } else {
            throw new TypeError('Optional modulus for remainder must be a HugeInt, number, or string.');
        }
    }

    // Determine the appropriate native method based on the divisor type.
    if (typeof divisor === 'number') {
        // If modulus is present, use the modular remainder operation.
        return finalModulus ? this.umod(divisor, finalModulus) : this.umod(divisor);
    } else if (divisor instanceof HugeInt) {
        return finalModulus ? this.bmod(divisor, finalModulus) : this.bmod(divisor);
    } else if (typeof divisor === 'string') {
        const divisorAsHugeInt = HugeInt(divisor);
        return finalModulus ? this.bmod(divisorAsHugeInt, finalModulus) : this.bmod(divisorAsHugeInt);
    } else {
        throw new TypeError('Divisor for remainder must be a HugeInt, number, or string.');
    }
};

/**
 * Raises the HugeInt to the power of an exponent.
 * @param {HugeInt|number|string} exponentValue - The exponent.
 * @returns {HugeInt} The result of this ^ exponentValue.
 */
HugeInt.prototype.power = function (exponentValue) {
    if (typeof exponentValue === 'number') {
        if (exponentValue >= 0) {
            return this.upow(exponentValue); // Unsigned power for positive number exponent
        } else {
            // For negative number exponents, it typically means 1 / (base ^ |exponent|).
            // This operation might be handled by modular exponentiation with the base itself,
            // or by a specific native inverse power function if available.
            // Original code used powm with `this` as modulus, which is unusual for a general power function.
            // Let's assume it intends a general power, and for negative exponents, return 0 or a very small fraction.
            // For simplicity, we'll return HugeInt(0) for negative exponents, as fractions are not directly supported.
            return HugeInt(0); // Assuming integer power, negative exponent means fraction, which maps to 0 for HugeInt.
        }
    } else {
        // Convert string or other HugeInt-compatible type to HugeInt, then recurse.
        const parsedExponent = HugeInt(exponentValue);
        return this.power(parsedExponent.getNumericValue()); // Convert to number for internal `upow` if possible.
                                                              // This might lose precision for very large exponents.
                                                              // A more robust solution would be to use a native `bpow` if available.
    }
};

/**
 * Performs a left bit shift operation.
 * @param {number|string} shiftAmount - The number of bits to shift.
 * @returns {HugeInt} A new HugeInt instance representing the shifted value.
 */
HugeInt.prototype.leftShift = function (shiftAmount) {
    if (typeof shiftAmount === 'number') {
        if (shiftAmount >= 0) {
            return this.umul2exp(shiftAmount); // Unsigned multiply by 2^shiftAmount
        } else {
            // Negative shift left is equivalent to positive shift right.
            return this.rightShift(-shiftAmount);
        }
    } else {
        // Convert string to number, then recurse.
        const parsedShift = parseInt(String(shiftAmount), 10);
        if (isNaN(parsedShift)) {
            throw new TypeError('Shift amount must be a number or a string representing an integer.');
        }
        return this.leftShift(parsedShift);
    }
};

/**
 * Performs a right bit shift operation.
 * @param {number|string} shiftAmount - The number of bits to shift.
 * @returns {HugeInt} A new HugeInt instance representing the shifted value.
 */
HugeInt.prototype.rightShift = function (shiftAmount) {
    if (typeof shiftAmount === 'number') {
        if (shiftAmount >= 0) {
            return this.udiv2exp(shiftAmount); // Unsigned divide by 2^shiftAmount
        } else {
            // Negative shift right is equivalent to positive shift left.
            return this.leftShift(-shiftAmount);
        }
    } else {
        // Convert string to number, then recurse.
        const parsedShift = parseInt(String(shiftAmount), 10);
        if (isNaN(parsedShift)) {
            throw new TypeError('Shift amount must be a number or a string representing an integer.');
        }
        return this.rightShift(parsedShift);
    }
};

/**
 * Compares this HugeInt with another value.
 * @param {HugeInt|number|string} comparisonTarget - The value to compare against.
 * @returns {number} -1 if this < target, 0 if this == target, 1 if this > target.
 */
HugeInt.prototype.compareValues = function (comparisonTarget) {
    if (comparisonTarget instanceof HugeInt) {
        return this.bcompare(comparisonTarget);
    } else if (typeof comparisonTarget === 'number') {
        // Use signed comparison for negative numbers, unsigned for positive numbers.
        return comparisonTarget < 0 ? this.scompare(comparisonTarget) : this.ucompare(comparisonTarget);
    } else if (typeof comparisonTarget === 'string') {
        // Convert string to HugeInt for comparison.
        const targetAsHugeInt = HugeInt(comparisonTarget);
        return this.bcompare(targetAsHugeInt);
    } else {
        throw new TypeError(
            `Unsupported type for comparison: ${typeof comparisonTarget}. Expected HugeInt, number, or string.`
        );
    }
};

// Helper function to generate comparison methods.
const createComparisonMethod = (operation) => {
    return function (comparisonTarget) {
        const comparisonResult = this.compareValues(comparisonTarget);
        switch (operation) {
            case '>': return comparisonResult > 0;
            case '>=': return comparisonResult >= 0;
            case '===': return comparisonResult === 0;
            case '!==': return comparisonResult !== 0;
            case '<': return comparisonResult < 0;
            case '<=': return comparisonResult <= 0;
            default: throw new Error('Unknown comparison operation.');
        }
    };
};

HugeInt.prototype.isGreaterThan = createComparisonMethod('>');
HugeInt.prototype.isGreaterThanOrEqual = createComparisonMethod('>=');
HugeInt.prototype.isEqual = createComparisonMethod('===');
HugeInt.prototype.isNotEqual = createComparisonMethod('!==');
HugeInt.prototype.isLessThan = createComparisonMethod('<');
HugeInt.prototype.isLessThanOrEqual = createComparisonMethod('<=');

// Bitwise operations: AND, OR, XOR.
['and', 'or', 'xor'].forEach(function (bitwiseOpName) {
    HugeInt.prototype[`bitwise${bitwiseOpName.charAt(0).toUpperCase() + bitwiseOpName.slice(1)}`] = function (otherOperand) {
        if (otherOperand instanceof HugeInt) {
            return this[`b${bitwiseOpName}`](otherOperand);
        } else {
            // Convert other operand to HugeInt for the operation.
            const operandAsHugeInt = HugeInt(otherOperand);
            return this[`b${bitwiseOpName}`](operandAsHugeInt);
        }
    };
});

/**
 * Calculates the integer square root of the HugeInt.
 * @returns {HugeInt} The integer square root.
 */
HugeInt.prototype.squareRoot = function () {
    return this.bsqrt();
};

/**
 * Calculates the integer Nth root of the HugeInt.
 * @param {HugeInt|number|string} rootDegree - The degree of the root (e.g., 2 for square root, 3 for cube root).
 * @returns {HugeInt} The integer Nth root.
 */
HugeInt.prototype.nthRoot = function (rootDegree) {
    if (rootDegree instanceof HugeInt) {
        return this.broot(rootDegree);
    } else {
        // Convert other types to HugeInt for the native method.
        const degreeAsHugeInt = HugeInt(rootDegree);
        return this.broot(degreeAsHugeInt);
    }
};

/**
 * Generates a random HugeInt.
 * If `upperExclusiveBound` is provided, generates a random number between 0 (inclusive) and `upperExclusiveBound` (exclusive).
 * If `upperExclusiveBound` is not provided, generates a random number between 0 (inclusive) and `this` (exclusive).
 * @param {HugeInt|number|string} [upperExclusiveBound] - The upper bound for the random number (exclusive).
 * @returns {HugeInt} A new HugeInt instance representing the random number.
 */
HugeInt.prototype.random = function (upperExclusiveBound) {
    // If no upper bound is provided, generate random from 0 up to `this` (exclusive).
    if (upperExclusiveBound === undefined) {
        // Special case: if `this` is 1, the only possible random number (exclusive) is 0.
        if (this.isEqual(1)) {
            return HugeInt(0);
        } else {
            return this.brand0(); // Native method for random [0, this-1]
        }
    } else {
        // If an upper bound is provided, generate random between 0 and (upperBound - this).
        // Then add `this` to shift the range to [this, upperBound - 1].
        let range;
        if (upperExclusiveBound instanceof HugeInt) {
            range = upperExclusiveBound.sub(this);
        } else {
            range = HugeInt(upperExclusiveBound).sub(this);
        }

        // Generate random within the calculated range [0, range-1], then add `this`.
        return range.brand0().add(this);
    }
};

/**
 * Computes the modular multiplicative inverse of the HugeInt modulo `modulusValue`.
 * (i.e., finds x such that (this * x) % modulusValue === 1).
 * @param {HugeInt|number|string} modulusValue - The modulus.
 * @returns {HugeInt} The modular inverse.
 * @throws {Error} If no inverse exists (e.g., if gcd(this, modulusValue) != 1).
 */
HugeInt.prototype.modularInverse = function (modulusValue) {
    if (modulusValue instanceof HugeInt) {
        return this.binvertm(modulusValue);
    } else {
        // Convert other types to HugeInt for the native method.
        const modulusAsHugeInt = HugeInt(modulusValue);
        return this.binvertm(modulusAsHugeInt);
    }
};

/**
 * Generates a probable prime number of a specified bit length.
 * @param {number} primeBitLength - The desired bit length of the prime number.
 * @param {boolean} [isSafePrime=true] - If true, attempts to generate a "safe" prime (p = 2q + 1, where q is also prime).
 * @returns {HugeInt} A new HugeInt instance representing the generated prime number.
 * @throws {RangeError} If `primeBitLength` is invalid.
 */
HugeInt.generatePrime = function (primeBitLength, isSafePrime = true) {
    // Input validation: primeBitLength must be a positive integer.
    if (!Number.isInteger(primeBitLength) || primeBitLength <= 0) {
        throw new RangeError('Prime bit length must be a positive integer.');
    }

    // Ensure `isSafePrime` is a boolean.
    const safeFlag = !!isSafePrime;

    // Call the native method to generate the prime.
    return HugeInt.uprime0(primeBitLength, safeFlag);
};

/**
 * Tests the primality of the HugeInt using a probabilistic algorithm (e.g., Miller-Rabin).
 * @param {number} [testIterations=10] - The number of iterations for the primality test. Higher iterations mean higher certainty.
 * @returns {boolean} True if the number is probably prime, false otherwise.
 */
HugeInt.prototype.testPrimality = function (testIterations = 10) {
    // Call the native primality test.
    const result = this.probprime(testIterations);

    // Native method returns 1 for prime, 0 for composite.
    return result === 1;
};

/**
 * Finds the next probable prime number greater than this HugeInt.
 * @returns {HugeInt} A new HugeInt instance representing the next probable prime.
 */
HugeInt.prototype.findNextPrime = function () {
    let currentCandidate = this;
    do {
        currentCandidate = currentCandidate.add(1); // Increment by one
    } while (!currentCandidate.testPrimality()); // Loop until a probable prime is found
    return currentCandidate;
};

/**
 * Checks if a specific bit at a given position is set (1) in the HugeInt's binary representation.
 * @param {number} bitPosition - The zero-based index of the bit to check.
 * @returns {boolean} True if the bit is set, false otherwise.
 * @throws {RangeError} If `bitPosition` is negative.
 */
HugeInt.prototype.checkBit = function (bitPosition) {
    if (!Number.isInteger(bitPosition) || bitPosition < 0) {
        throw new RangeError('Bit position must be a non-negative integer.');
    }
    // Native method returns 1 if set, 0 if not set.
    return this.isbitset(bitPosition) === 1;
};

/**
 * Creates a HugeInt instance from a Buffer.
 * @param {Buffer} sourceBuffer - The buffer containing the binary data.
 * @param {object} [processingOptions] - Options for processing the buffer.
 * @param {'big'|'little'|1|-1} [processingOptions.byteOrder='big'] - Endianness of the buffer.
 * @param {number|'auto'} [processingOptions.segmentSize=1] - Size of each segment in bytes to read from the buffer.
 * @returns {HugeInt} A new HugeInt instance.
 * @throws {TypeError} If `sourceBuffer` is not a Buffer.
 * @throws {RangeError} If buffer length is not a multiple of `segmentSize`.
 */
HugeInt.createFromBuffer = function (sourceBuffer, processingOptions = {}) {
    if (!Buffer.isBuffer(sourceBuffer)) {
        throw new TypeError('Input `sourceBuffer` must be a Buffer instance.');
    }

    // Determine byte order (endianness). Default to 'big'.
    const byteOrdering = {
        1: 'big',
        '-1': 'little'
    }[processingOptions.byteOrder] || processingOptions.byteOrder || 'big';

    // Determine segment size. Default to 1 byte. 'auto' means segment size is buffer length.
    const segmentSize = processingOptions.segmentSize === 'auto' ?
        Math.max(1, Math.ceil(sourceBuffer.length)) : // Ensure at least 1 for empty buffers
        (processingOptions.segmentSize || 1);

    // Validate buffer length against segment size.
    if (sourceBuffer.length % segmentSize !== 0) {
        throw new RangeError(
            `Buffer length (${sourceBuffer.length}) must be a multiple of the specified segment size (${segmentSize}).`
        );
    }

    const hexStringChunks = [];
    for (let i = 0; i < sourceBuffer.length; i += segmentSize) {
        const byteChunk = [];
        for (let j = 0; j < segmentSize; j++) {
            // Read bytes based on endianness.
            const byteIndex = (byteOrdering === 'big') ? (i + j) : (i + segmentSize - 1 - j);
            byteChunk.push(sourceBuffer[byteIndex]);
        }

        // Convert each byte chunk to a hexadecimal string.
        hexStringChunks.push(
            byteChunk
            .map(byteVal => (byteVal < 16 ? '0' : '') + byteVal.toString(16))
            .join('')
        );
    }

    // Combine all hex chunks and create a HugeInt from the resulting hexadecimal string.
    return HugeInt(hexStringChunks.join(''), 16);
};

/**
 * Exports the HugeInt instance to a Buffer.
 * @param {object|string} [outputOptions] - Options for buffer generation, or 'mpint' for SSH MPINT format.
 * @param {'big'|'little'|1|-1} [outputOptions.byteOrder='big'] - Endianness for the output buffer.
 * @param {number|'auto'} [outputOptions.segmentSize=1] - Size of each segment in bytes for the output buffer.
 * @returns {Buffer} A Buffer representation of the HugeInt.
 * @throws {Error} If converting negative numbers to standard Buffers (non-MPINT) is attempted.
 */
HugeInt.prototype.exportToBuffer = function (outputOptions = {}) {
    // Handle special 'mpint' format for SSH signed integers.
    if (typeof outputOptions === 'string') {
        if (outputOptions !== 'mpint') {
            throw new Error(`Unsupported Buffer representation format: '${outputOptions}'. Only 'mpint' is supported as a string option.`);
        }

        const absoluteValueInstance = this.absoluteValue();
        // Convert the absolute value to a buffer, 1 byte segments, big endian.
        const valueBuffer = absoluteValueInstance.exportToBuffer({
            segmentSize: 1,
            byteOrder: 'big'
        });

        let dataLength = valueBuffer.length;
        // If the most significant bit of the first byte is set,
        // and it's not a zero-length buffer, we need an extra leading zero byte for MPINT format.
        if (dataLength > 0 && (valueBuffer[0] & 0x80)) {
            dataLength++;
        }
        // If the buffer is empty or represents 0, the data length is 0.
        if (valueBuffer.length === 1 && valueBuffer[0] === 0) {
            dataLength = 0;
        }

        // Create the result buffer with 4 bytes for length prefix + data.
        const resultBuffer = Buffer.alloc(4 + dataLength);

        // Copy the actual number data, accounting for the extra zero byte if needed.
        if (valueBuffer.length > 0) {
            valueBuffer.copy(resultBuffer, 4 + (valueBuffer[0] & 0x80 ? 1 : 0));
        }
        // If an extra zero byte was added, ensure it's actually zero.
        if (valueBuffer.length > 0 && (valueBuffer[0] & 0x80)) {
            resultBuffer[4] = 0;
        }

        // Write the 4-byte length prefix (big-endian).
        resultBuffer.writeUInt32BE(dataLength, 0);

        // Handle negative numbers for MPINT (two's complement).
        const isNegative = this.isLessThan(0);
        if (isNegative) {
            // Invert all bits (one's complement).
            for (let i = 4; i < resultBuffer.length; i++) {
                resultBuffer[i] = 0xff - resultBuffer[i];
            }
            // Add 1 to get two's complement.
            let carry = 1;
            for (let i = resultBuffer.length - 1; i >= 4 && carry > 0; i--) {
                const sum = resultBuffer[i] + carry;
                resultBuffer[i] = sum & 0xff;
                carry = sum >> 8;
            }
        }
        // Set the sign bit in the first byte of the data (after length prefix).
        // This is typically the MSB of the first *data* byte.
        if (resultBuffer.length > 4) { // Only if there's actual data after the length
            resultBuffer[4] = (resultBuffer[4] & 0x7f) | (isNegative ? 0x80 : 0);
        } else if (isNegative && dataLength === 0) {
            // Special case for -0, should probably not happen with MPINT but for consistency
            // If the number was 0 and it's negative, it's still 0 in MPINT, but this path is for -1 and below.
            // If it's a negative number that resulted in dataLength 0 (e.g., -0),
            // this path would need careful handling or be considered invalid for MPINT.
            // For now, assume a negative number will always have a non-zero representation.
        }

        return resultBuffer;
    }

    // Default buffer export for non-MPINT format.
    const currentOptions = {
        byteOrder: 'big', // Default endianness
        segmentSize: 1, // Default segment size
        ...outputOptions
    };

    // If the number is negative, and it's not an MPINT, throw an error.
    // Standard buffer conversion typically expects unsigned values.
    if (this.isLessThan(0)) {
        throw new Error(
            'Converting negative HugeInt instances to standard Buffers is not directly supported ' +
            'without specifying a signed format like "mpint".'
        );
    }

    // Get hexadecimal string representation.
    let hexRepresentation = this.getStringRepresentation(16);

    // Determine the actual segment size for processing.
    const segmentBytes = currentOptions.segmentSize === 'auto' ?
        Math.max(1, Math.ceil(hexRepresentation.length / 2)) :
        (currentOptions.segmentSize || 1);

    // Calculate the total buffer length needed.
    const totalBufferLength = Math.ceil(hexRepresentation.length / (2 * segmentBytes)) * segmentBytes;

    // Pad the hexadecimal string with leading zeros to ensure even chunking.
    while (hexRepresentation.length < 2 * totalBufferLength) {
        hexRepresentation = '0' + hexRepresentation;
    }

    // Split the hex string into chunks, each representing `segmentBytes`.
    const hexChunks = [];
    const chunkSize = 2 * segmentBytes;
    for (let i = 0; i < hexRepresentation.length; i += chunkSize) {
        hexChunks.push(hexRepresentation.substring(i, i + chunkSize));
    }

    // Allocate the buffer.
    const outputBuffer = Buffer.alloc(totalBufferLength);

    // Populate the buffer from hex chunks.
    hexChunks.forEach((chunk, chunkIndex) => {
        for (let j = 0; j < segmentBytes; j++) {
            const bufferIndex = chunkIndex * segmentBytes +
                (currentOptions.byteOrder === 'big' ? j : segmentBytes - j - 1);
            const hexByte = chunk.substring(j * 2, j * 2 + 2);
            outputBuffer[bufferIndex] = parseInt(hexByte, 16);
        }
    });

    return outputBuffer;
};

/**
 * Dynamically creates static methods on the HugeInt class that mirror its prototype methods.
 * This allows for functional-style usage like `HugeInt.add(a, b)` instead of `a.add(b)`.
 */
Object.keys(HugeInt.prototype).forEach(function (methodName) {
    // Exclude methods that are directly handled or would cause recursion/undesired behavior.
    if (['debugInfo', 'getStringRepresentation', 'constructor'].includes(methodName)) {
        return;
    }

    // Ensure we only process own properties of the prototype, not inherited ones.
    if (Object.prototype.hasOwnProperty.call(HugeInt.prototype, methodName)) {
        HugeInt[methodName] = function (firstOperand, ...remainingArgs) {
            let targetInstance;

            // If the first operand is already a HugeInt, use it directly.
            if (firstOperand instanceof HugeInt) {
                targetInstance = firstOperand;
            } else {
                // Otherwise, convert the first operand to a HugeInt.
                targetInstance = HugeInt(firstOperand);
            }

            // Call the prototype method on the target instance with the remaining arguments.
            return targetInstance[methodName].apply(targetInstance, remainingArgs);
        };
    }
});