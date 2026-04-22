// LargeNumber.js - An implementation for arbitrary precision arithmetic in JavaScript
// This file is a Type III clone, heavily modified from an older version.
// Original author: Masanao Izumo <iz@onicos.co.jp>
//
// This software is provided under the terms of the GNU General Public License.
// Please refer to the LICENSE file or the GPL documentation for details.
//
// This cloned version aims to preserve core functionality while introducing
// modern JavaScript practices, refactoring, and extensive structural changes.
//
// Key changes include:
// - Renamed identifiers for clarity (e.g., BigInt -> LargeNumber, digits -> segments).
// - Moved methods to prototype for better object-oriented structure.
// - Replaced 'var' with 'let'/'const' where appropriate.
// - Introduced helper functions and constants for common operations/values.
// - Modified control flow (loops, conditionals) for variety.
// - Added input validation and guard clauses.
// - Rewrote comments and removed outdated ones.
// - Incorporated minor algorithmic variations where possible without altering outcomes.

// --- Constants and Utility Functions ---
const SEGMENT_BITS = 16;             // Each segment holds 16 bits of data (0-0xFFFF)
const MAX_SEGMENT_VALUE = 0xFFFF;    // Maximum value for a single segment
const TWO_POW_SEGMENT_BITS = 1 << SEGMENT_BITS; // 2^16
const SIGNED_INT_MAX = 0x7FFFFFFF;   // Max value for 31-bit signed integer
const TWO_POW_32 = 0x100000000;      // 2^32, used for handling potential negative results from bitwise ops
const BASE_CHARS = "0123456789abcdef"; // Character set for base conversions

/**
 * Normalizes a LargeNumber by trimming leading zero segments.
 * This ensures the `segmentCount` accurately reflects the significant segments.
 * @param {LargeNumber} numInstance The LargeNumber instance to normalize.
 * @returns {LargeNumber} The normalized LargeNumber instance.
 */
function normalizeSegments(numInstance) {
  if (!(numInstance instanceof LargeNumber)) {
    throw new TypeError("Input must be a LargeNumber instance for normalization.");
  }
  let currentLength = numInstance.segmentCount;
  const segmentArray = numInstance.segments;

  // Iterate backwards, decrementing length until a non-zero segment is found
  while (currentLength > 0 && segmentArray[currentLength - 1] === 0) {
    currentLength--;
  }
  numInstance.segmentCount = currentLength || 1; // Ensure at least one segment (even for zero)
  return numInstance;
}

/**
 * Converts a single character to its numeric digit value based on the given radix.
 * @param {string} char The character to convert.
 * @param {number} radix The base for conversion (e.g., 10, 16).
 * @returns {number} The numeric value of the character, or -1 if invalid for the radix.
 */
function charToDigit(char, radix) {
  const code = char.charCodeAt(0);
  let digit;
  if (code >= 48 && code <= 57) { // '0'-'9'
    digit = code - 48;
  } else if (code >= 97 && code <= 122) { // 'a'-'z'
    digit = code - 97 + 10;
  } else if (code >= 65 && code <= 90) { // 'A'-'Z'
    digit = code - 65 + 10;
  } else {
    return -1; // Not a valid digit character
  }
  return digit < radix ? digit : -1;
}

// --- LargeNumber Class Definition (Constructor) ---

/**
 * Represents an arbitrary-precision integer.
 * Can be initialized in several ways:
 * - `new LargeNumber()`: Initializes to zero.
 * - `new LargeNumber(otherLargeNumber)`: Clones an existing LargeNumber.
 * - `new LargeNumber(string)`: Parses a string (e.g., "123", "0xABC").
 * - `new LargeNumber(number)`: Converts a standard JavaScript number.
 * - `new LargeNumber(initialSegmentCount, isValuePositive)`: Creates an empty LargeNumber with specified capacity and sign.
 * @param {number|string|LargeNumber} [arg1] Initial value or segment count.
 * @param {boolean} [arg2] Sign (true for positive, false for negative), only used with initialSegmentCount.
 */
function LargeNumber(arg1, arg2) {
  this.segments = [];       // Array to store integer segments
  this.segmentCount = 1;    // Number of active segments
  this.isPositive = true;   // True for positive, false for negative

  // Handle different constructor signatures
  const numArgs = arguments.length;

  if (numArgs === 0) {
    // Default constructor: new LargeNumber() -> 0
    this.segments[0] = 0;
  } else if (numArgs === 1) {
    // new LargeNumber(value) where value can be string, number, or LargeNumber
    const sourceValue = convertInputToLargeNumber(arg1);
    this.isPositive = sourceValue.isPositive;
    this.segmentCount = sourceValue.segmentCount;
    // Deep copy segments if from another LargeNumber, otherwise reference is fine (from convertInputToLargeNumber)
    this.segments = sourceValue.segments.slice();
  } else if (numArgs === 2) {
    // new LargeNumber(initialSegmentCount, isValuePositive)
    const initialSegmentCount = Math.max(1, Math.floor(arg1)); // Ensure at least 1 segment
    if (isNaN(initialSegmentCount)) {
      throw new Error("Invalid initial segment count provided to LargeNumber constructor.");
    }
    this.segmentCount = initialSegmentCount;
    this.isPositive = !!arg2; // Coerce to boolean
    // Initialize all segments to zero
    for (let k = 0; k < this.segmentCount; k++) {
      this.segments[k] = 0;
    }
  } else {
    throw new Error("Invalid number of arguments for LargeNumber constructor.");
  }
}

// --- LargeNumber Prototype Methods ---

/**
 * Converts the LargeNumber to its decimal string representation.
 * @returns {string} The decimal string.
 */
LargeNumber.prototype.toDecimalString = function() {
  return this.toBaseString(10);
};

/**
 * Converts the LargeNumber to its string representation in a specified base.
 * @param {number} targetBase The base for conversion (e.g., 2, 8, 10, 16).
 * @returns {string} The string representation.
 */
LargeNumber.prototype.toBaseString = function(targetBase) {
  if (this.segmentCount === 1 && this.segments[0] === 0) {
    return "0"; // Handle zero explicitly
  }

  // Validate targetBase
  if (![2, 8, 10, 16].includes(targetBase)) {
    console.warn(`Unsupported base ${targetBase}. Defaulting to base 10.`);
    targetBase = 10;
  }

  let estimatedLength; // Estimated length of the result string
  let divisionBase;    // The 'large' base for division (e.g., 10000 for base 10)
  let digitsPerDivision; // How many digits of the targetBase are processed per division step

  switch (targetBase) {
    case 10:
      // log10(2^16) = 16 * log10(2) approx 16 * 0.301 = 4.816
      estimatedLength = Math.floor((this.segmentCount * SEGMENT_BITS * 241) / 800) + 2;
      divisionBase = 10000; // Processes 4 decimal digits at a time (10^4)
      digitsPerDivision = 4;
      break;
    case 16:
      // log16(2^16) = 16 * log16(2) = 16 * 1/4 = 4
      estimatedLength = Math.floor((this.segmentCount * SEGMENT_BITS) / 4) + 2;
      divisionBase = TWO_POW_SEGMENT_BITS; // Processes 4 hex digits at a time (16^4)
      digitsPerDivision = 4;
      break;
    case 8:
      // log8(2^16) = 16 * log8(2) = 16 * 1/3 approx 5.33
      estimatedLength = (this.segmentCount * SEGMENT_BITS) + 2;
      divisionBase = 0o10000; // Processes 4 octal digits at a time (8^4 = 4096)
      digitsPerDivision = 4;
      break;
    case 2:
      estimatedLength = (this.segmentCount * SEGMENT_BITS) + 2;
      divisionBase = 0b10000; // Processes 4 binary digits at a time (2^4 = 16)
      digitsPerDivision = 4;
      break;
  }

  // Create a mutable copy of this LargeNumber for division
  const tempNumber = this.duplicate();
  const tempSegments = tempNumber.segments;
  let currentSegmentLength = tempNumber.segmentCount;
  let resultChars = []; // Array to build the string in reverse

  // Perform repeated division by `divisionBase`
  while (currentSegmentLength > 0 && estimatedLength > 0) {
    let segmentIndex = currentSegmentLength;
    let carry = 0; // Accumulates remainder from division

    // Division loop: Simulate long division on segments
    while (segmentIndex--) {
      // Combine carry with current segment, ensuring positive value if bitwise ops resulted in negative
      carry = (carry * TWO_POW_SEGMENT_BITS) + tempSegments[segmentIndex];
      if (carry < 0) carry += TWO_POW_32; // Handle potential negative result from bit shift in older JS engines

      tempSegments[segmentIndex] = Math.floor(carry / divisionBase);
      carry %= divisionBase;
    }

    // Trim leading zeros from tempNumber segments
    if (tempSegments[currentSegmentLength - 1] === 0) {
      currentSegmentLength--;
    }

    // Convert the remainder (carry) to `targetBase` digits
    for (let k = 0; k < digitsPerDivision; k++) {
      const digit = carry % targetBase;
      resultChars.push(BASE_CHARS.charAt(digit));
      carry = Math.floor(carry / targetBase);
      estimatedLength--;

      // Optimization: if tempNumber is zero and no more carry, we're done
      if (currentSegmentLength === 0 && carry === 0) {
        break;
      }
    }
  }

  // Remove leading zeros from the result string
  let finalString = resultChars.reverse().join('');
  let firstNonZero = 0;
  while (firstNonZero < finalString.length - 1 && finalString.charAt(firstNonZero) === '0') {
    firstNonZero++;
  }
  finalString = finalString.substring(firstNonZero);

  // Prepend sign if negative
  return this.isPositive ? finalString : "-" + finalString;
};

/**
 * Creates a deep copy of this LargeNumber instance.
 * @returns {LargeNumber} A new LargeNumber instance with the same value.
 */
LargeNumber.prototype.duplicate = function() {
  const newInstance = new LargeNumber(this.segmentCount, this.isPositive);
  // Copy segment values
  for (let k = 0; k < this.segmentCount; k++) {
    newInstance.segments[k] = this.segments[k];
  }
  return newInstance;
};

// --- Static Factory Functions ---

/**
 * Creates a LargeNumber from a standard JavaScript integer.
 * @param {number} numericValue The integer value.
 * @returns {LargeNumber} A new LargeNumber instance.
 */
function createFromInteger(numericValue) {
  if (typeof numericValue !== 'number' || !Number.isInteger(numericValue)) {
    throw new TypeError("Input must be an integer for createFromInteger.");
  }

  let absValue = Math.abs(numericValue);
  const isPositive = numericValue >= 0;

  let result;
  if (absValue <= MAX_SEGMENT_VALUE) {
    // Fits in one segment
    result = new LargeNumber(1, isPositive);
    result.segments[0] = absValue;
  } else if (absValue <= SIGNED_INT_MAX) {
    // Fits in two segments (up to 31 bits)
    result = new LargeNumber(2, isPositive);
    result.segments[0] = absValue & MAX_SEGMENT_VALUE;
    result.segments[1] = (absValue >>> SEGMENT_BITS) & MAX_SEGMENT_VALUE;
  } else {
    // For numbers larger than 2^31-1 but within JS number limits,
    // convert to string and use string parsing. This is a Type III update
    // to handle larger standard numbers more robustly.
    return createFromString(numericValue.toString());
  }
  return normalizeSegments(result);
}

/**
 * Creates a LargeNumber from a string representation.
 * Supports decimal, hexadecimal (0x prefix), binary (0b prefix), and octal (0 prefix).
 * @param {string} inputString The string to parse.
 * @param {number} [radix] Optional base for parsing if not implied by prefix.
 * @returns {LargeNumber} A new LargeNumber instance.
 */
function createFromString(inputString, radix) {
  if (typeof inputString !== 'string') {
    throw new TypeError("Input must be a string for createFromString.");
  }
  if (!inputString.length) {
    return new LargeNumber(0); // Return zero for empty string
  }

  let charIndex = 0;
  let isPositive = true;

  // Trim leading/trailing whitespace
  inputString = inputString.trim();

  // Parse sign
  if (inputString.charAt(charIndex) === '+') {
    charIndex++;
  } else if (inputString.charAt(charIndex) === '-') {
    isPositive = false;
    charIndex++;
  }

  // Determine radix if not explicitly provided
  if (!radix) {
    if (inputString.charAt(charIndex) === '0') {
      const nextChar = inputString.charAt(charIndex + 1);
      if (nextChar === 'x' || nextChar === 'X') {
        radix = 16;
        charIndex += 2;
      } else if (nextChar === 'b' || nextChar === 'B') {
        radix = 2;
        charIndex += 2;
      } else {
        radix = 8; // Default to octal for '0' prefix
        charIndex++; // Consume the '0'
      }
    } else {
      radix = 10; // Default to decimal
    }
  } else {
    // If radix is provided, handle '0x', '0b' prefixes for consistency
    if (radix === 16 && inputString.substring(charIndex, charIndex + 2).toLowerCase() === '0x') {
      charIndex += 2;
    } else if (radix === 2 && inputString.substring(charIndex, charIndex + 2).toLowerCase() === '0b') {
      charIndex += 2;
    }
  }

  // Skip leading zeros after parsing prefix
  while (inputString.charAt(charIndex) === '0' && charIndex < inputString.length - 1) {
    charIndex++;
  }

  // Estimate required length for the result LargeNumber
  // log_2^16(radix) * string_length
  let estimatedSegmentLength = Math.ceil((inputString.length - charIndex) * Math.log(radix) / Math.log(TWO_POW_SEGMENT_BITS)) + 2;
  const resultNum = new LargeNumber(estimatedSegmentLength, isPositive);
  const resultSegments = resultNum.segments;
  let currentResultLength = 1; // Start with one segment for accumulator

  // Process characters one by one
  for (let k = charIndex; k < inputString.length; k++) {
    const char = inputString.charAt(k);
    const digitValue = charToDigit(char, radix);

    if (digitValue === -1) {
      // Invalid character for the given radix, stop parsing
      console.warn(`Invalid character '${char}' for base ${radix} encountered. Parsing stopped prematurely.`);
      break;
    }

    let carry = digitValue; // Start with the current digit value

    // Multiply the accumulated number by radix and add the current digit
    for (let s = 0; s < currentResultLength; s++) {
      carry += resultSegments[s] * radix;
      resultSegments[s] = carry & MAX_SEGMENT_VALUE;
      carry >>>= SEGMENT_BITS; // Carry over to the next segment
    }

    // If there's still a carry, extend the number
    if (carry > 0) {
      resultSegments[currentResultLength++] = carry & MAX_SEGMENT_VALUE;
      if (carry >>> SEGMENT_BITS > 0) {
        // This case should ideally not happen if estimated length was sufficient, but good to catch
        // For very large numbers, estimated length might be off, dynamically expand
        resultNum.segments.push(carry >>> SEGMENT_BITS);
        currentResultLength++;
      }
    }
    resultNum.segmentCount = currentResultLength;
  }

  return normalizeSegments(resultNum);
}

/**
 * Converts any input type (number, string, LargeNumber) into a LargeNumber instance.
 * @param {*} input The value to convert.
 * @returns {LargeNumber} A LargeNumber instance.
 */
function convertInputToLargeNumber(input) {
  if (input instanceof LargeNumber) {
    // Already a LargeNumber, return it directly (or a clone if preferred for immutability,
    // but original code returned reference, so we'll do the same for internal use).
    return input;
  }

  const inputType = typeof input;

  if (inputType === 'string') {
    return createFromString(input);
  }

  if (inputType === 'number') {
    if (!Number.isFinite(input)) {
      throw new TypeError("Cannot convert non-finite number to LargeNumber.");
    }
    // Handle floating point numbers by converting to string first
    if (!Number.isInteger(input)) {
      // Special handling for scientific notation and floats
      let numStr = input.toString();
      const exponentIndex = numStr.indexOf('e');
      if (exponentIndex !== -1) {
        let basePart = numStr.substring(0, exponentIndex);
        let expPart = parseInt(numStr.substring(exponentIndex + 1), 10);

        const decimalPointIndex = basePart.indexOf('.');
        if (decimalPointIndex !== -1) {
          expPart -= (basePart.length - 1 - decimalPointIndex);
          basePart = basePart.replace('.', '');
        }
        // Append zeros based on exponent
        while (expPart > 0) {
          basePart += '0';
          expPart--;
        }
        // If expPart is negative, it means original number had trailing decimals,
        // which createFromString can't handle directly for integers.
        // For this clone, we assume conversion to string then parsing handles it.
        // For a true BigInt library, fractional parts would be truncated or cause an error.
        return createFromString(basePart);
      }
      // Simple float, just truncate for integer conversion
      return createFromInteger(Math.trunc(input));
    }
    return createFromInteger(input);
  }

  // Fallback for unsupported types, return zero
  console.warn(`Unsupported input type for LargeNumber conversion: ${inputType}. Returning LargeNumber(0).`);
  return new LargeNumber(0);
}

// --- Arithmetic Operations ---

/**
 * Performs internal addition logic for two LargeNumber instances.
 * Handles different signs by converting to subtraction if necessary.
 * @param {LargeNumber} operandA The first number.
 * @param {LargeNumber} operandB The second number.
 * @param {boolean} forcePositiveResultSign If true, result's sign is positive. If false, it's negative.
 * @returns {LargeNumber} The sum.
 */
function performAdditionInternal(operandA, operandB, forcePositiveResultSign) {
  // Ensure both operands are LargeNumber instances
  if (!(operandA instanceof LargeNumber) || !(operandB instanceof LargeNumber)) {
    throw new TypeError("Operands must be LargeNumber instances for internal addition.");
  }

  // If signs differ, convert to subtraction
  if (operandA.isPositive !== operandB.isPositive) {
    // Example: A + (-B) = A - B
    // Example: (-A) + B = B - A
    const tempB = operandB.duplicate();
    tempB.isPositive = !tempB.isPositive; // Flip sign of B to make it a subtraction
    return performSubtractionInternal(operandA, tempB);
  }

  // Both have the same sign (or same effective sign after initial check)
  // Determine which number has more segments to set initial result length
  const maxLength = Math.max(operandA.segmentCount, operandB.segmentCount);
  // Result might be one segment longer due to carry
  const result = new LargeNumber(maxLength + 1, operandA.isPositive);
  const resultSegments = result.segments;

  let carry = 0;
  for (let k = 0; k < maxLength; k++) {
    const valA = operandA.segments[k] || 0;
    const valB = operandB.segments[k] || 0;

    const sum = valA + valB + carry;
    resultSegments[k] = sum & MAX_SEGMENT_VALUE;
    carry = sum >>> SEGMENT_BITS; // Calculate new carry
  }

  // If there's a final carry, store it in the next segment
  if (carry > 0) {
    resultSegments[maxLength] = carry;
    result.segmentCount = maxLength + 1;
  } else {
    result.segmentCount = maxLength;
  }

  // Apply the 'forcePositiveResultSign' if needed (for bigint_plus/minus where sign is passed as 1 or 0)
  result.isPositive = forcePositiveResultSign;

  return normalizeSegments(result);
}

/**
 * Performs internal subtraction logic for two LargeNumber instances.
 * Assumes the absolute value of minuend is greater or equal to subtrahend for direct subtraction.
 * Handles sign determination based on magnitude comparison.
 * @param {LargeNumber} minuend The number from which to subtract.
 * @param {LargeNumber} subtrahend The number to subtract.
 * @returns {LargeNumber} The difference.
 */
function performSubtractionInternal(minuend, subtrahend) {
  // Ensure both operands are LargeNumber instances
  if (!(minuend instanceof LargeNumber) || !(subtrahend instanceof LargeNumber)) {
    throw new TypeError("Operands must be LargeNumber instances for internal subtraction.");
  }

  // Handle cases where signs differ
  if (minuend.isPositive !== subtrahend.isPositive) {
    // Example: A - (-B) = A + B
    // Example: (-A) - B = -(A + B)
    const tempSubtrahend = subtrahend.duplicate();
    tempSubtrahend.isPositive = !tempSubtrahend.isPositive; // Flip sign of subtrahend to make it an addition
    return performAdditionInternal(minuend, tempSubtrahend, minuend.isPositive); // Result sign determined by minuend initially
  }

  // Both numbers have the same sign.
  // We need to compare magnitudes to determine the final sign and order of subtraction.
  // If |minuend| < |subtrahend|, then result is negative and we swap.
  let finalSign = true; // Assume positive result initially
  let op1 = minuend;
  let op2 = subtrahend;

  // Compare magnitudes
  let comparison = compareAbsoluteValues(minuend, subtrahend);

  if (comparison < 0) { // |minuend| < |subtrahend|
    [op1, op2] = [op2, op1]; // Swap for A - B where A < B, perform B - A
    finalSign = !minuend.isPositive; // If original was A - B, and A < B, result is -(B-A)
  } else if (comparison === 0) {
    return new LargeNumber(0); // If absolute values are equal, result is zero
  } else { // |minuend| > |subtrahend|
    finalSign = minuend.isPositive; // Result keeps the sign of the larger number
  }

  // Now, op1 has the larger absolute value, and op2 has the smaller.
  const result = new LargeNumber(op1.segmentCount, finalSign);
  const resultSegments = result.segments;

  let borrow = 0;
  for (let k = 0; k < op1.segmentCount; k++) {
    const val1 = op1.segments[k] || 0;
    const val2 = op2.segments[k] || 0;

    let difference = val1 - val2 - borrow;

    if (difference < 0) {
      difference += TWO_POW_SEGMENT_BITS; // Add 2^16 to make it positive
      borrow = 1;
    } else {
      borrow = 0;
    }
    resultSegments[k] = difference;
  }

  return normalizeSegments(result);
}

/**
 * Compares the absolute values of two LargeNumber instances.
 * @param {LargeNumber} numA The first number.
 * @param {LargeNumber} numB The second number.
 * @returns {number} -1 if |numA| < |numB|, 0 if |numA| == |numB|, 1 if |numA| > |numB|.
 */
function compareAbsoluteValues(numA, numB) {
  if (numA.segmentCount !== numB.segmentCount) {
    return numA.segmentCount > numB.segmentCount ? 1 : -1;
  }

  // Same segment count, compare segment by segment from most significant
  for (let k = numA.segmentCount - 1; k >= 0; k--) {
    if (numA.segments[k] !== numB.segments[k]) {
      return numA.segments[k] > numB.segments[k] ? 1 : -1;
    }
  }
  return 0; // Numbers are equal in magnitude
}

/**
 * Negates a LargeNumber instance (flips its sign).
 * @param {LargeNumber} value The LargeNumber to negate.
 * @returns {LargeNumber} A new LargeNumber instance with the opposite sign.
 */
function negateLargeNumber(value) {
  if (!(value instanceof LargeNumber)) {
    throw new TypeError("Input must be a LargeNumber instance for negation.");
  }
  const negated = value.duplicate();
  if (negated.segmentCount === 1 && negated.segments[0] === 0) {
    negated.isPositive = true; // -0 is 0
  } else {
    negated.isPositive = !negated.isPositive;
  }
  return negated;
}

/**
 * Adds two numbers (can be LargeNumber, string, or number).
 * @param {*} val1 The first operand.
 * @param {*} val2 The second operand.
 * @returns {LargeNumber} The sum.
 */
function addLargeNumbers(val1, val2) {
  const op1 = convertInputToLargeNumber(val1);
  const op2 = convertInputToLargeNumber(val2);
  // The '1' (true) here means the result's sign will be positive if both are positive,
  // negative if both are negative, and additionInternal handles sign differences by converting to subtraction.
  return performAdditionInternal(op1, op2, op1.isPositive);
}

/**
 * Subtracts two numbers (can be LargeNumber, string, or number).
 * @param {*} val1 The minuend.
 * @param {*} val2 The subtrahend.
 * @returns {LargeNumber} The difference.
 */
function subtractLargeNumbers(val1, val2) {
  const op1 = convertInputToLargeNumber(val1);
  const op2 = convertInputToLargeNumber(val2);
  return performSubtractionInternal(op1, op2);
}

/**
 * Multiplies two numbers (can be LargeNumber, string, or number).
 * @param {*} factorA The first factor.
 * @param {*} factorB The second factor.
 * @returns {LargeNumber} The product.
 */
function multiplyLargeNumbers(factorA, factorB) {
  const opA = convertInputToLargeNumber(factorA);
  const opB = convertInputToLargeNumber(factorB);

  // Handle zero cases early
  if ((opA.segmentCount === 1 && opA.segments[0] === 0) ||
      (opB.segmentCount === 1 && opB.segments[0] === 0)) {
    return new LargeNumber(0);
  }

  // Determine result sign
  const resultIsPositive = (opA.isPositive === opB.isPositive);

  // Allocate result LargeNumber with maximum possible segments (sum of operand lengths + 1 for carry)
  const result = new LargeNumber(opA.segmentCount + opB.segmentCount + 1, resultIsPositive);
  const resultSegments = result.segments;

  // Initialize result segments to zero
  for (let k = 0; k < result.segmentCount; k++) {
    resultSegments[k] = 0;
  }

  // Perform multiplication (Karatsuba or similar could be faster for very large numbers,
  // but sticking to standard long multiplication for this clone's complexity).
  const opASegments = opA.segments;
  const opBSegments = opB.segments;

  for (let i = 0; i < opA.segmentCount; i++) {
    const currentFactorSegment = opASegments[i];
    if (currentFactorSegment === 0) { // Optimization: skip if segment is zero
      continue;
    }

    let carry = 0;
    for (let j = 0; j < opB.segmentCount; j++) {
      // Calculate product of current segments plus any accumulated carry
      // and add to the corresponding position in the result.
      const product = currentFactorSegment * opBSegments[j] + resultSegments[i + j] + carry;

      resultSegments[i + j] = product & MAX_SEGMENT_VALUE;
      carry = product >>> SEGMENT_BITS; // New carry
    }

    // If there's a remaining carry, add it to the next segment position
    if (carry > 0) {
      resultSegments[i + opB.segmentCount] += carry; // Add to existing or new segment
    }
  }

  return normalizeSegments(result);
}

/**
 * Placeholder for division and modulo operations.
 * This function was incomplete in the original source and is provided here
 * as a structural placeholder for Type III cloning purposes.
 * @param {*} dividend The number to be divided.
 * @param {*} divisor The number by which to divide.
 * @param {boolean} [returnModuloOnly=false] If true, returns only the remainder.
 * @returns {LargeNumber} The quotient or remainder based on `returnModuloOnly`.
 */
function divideAndModuloLargeNumbers(dividend, divisor, returnModuloOnly = false) {
  const numDividend = convertInputToLargeNumber(dividend);
  const numDivisor = convertInputToLargeNumber(divisor);

  // --- Type III: Added input validation and edge cases ---
  if (numDivisor.segmentCount === 1 && numDivisor.segments[0] === 0) {
    throw new Error("Division by zero is not allowed.");
  }
  if (numDividend.segmentCount === 1 && numDividend.segments[0] === 0) {
    return new LargeNumber(0); // Zero divided by anything is zero
  }

  // If |dividend| < |divisor|, quotient is 0, remainder is dividend
  if (compareAbsoluteValues(numDividend, numDivisor) < 0) {
    return returnModuloOnly ? numDividend.duplicate() : new LargeNumber(0);
  }

  // --- Original variables, renamed for cloning ---
  const dividendSegmentCount = numDividend.segmentCount;
  const divisorSegmentCount = numDivisor.segmentCount;
  let quotientResult; // Placeholder for quotient
  let remainderResult; // Placeholder for remainder

  // ... (Complex division algorithm logic would go here,
  //     involving normalization, shifting, trial quotients,
  //     and repeated subtraction, similar to long division).
  //     This part is a direct Type III "deletion/placeholder"
  //     as the original was incomplete.

  console.warn("divideAndModuloLargeNumbers is a placeholder; full implementation is omitted in this clone.");

  // For demonstration, returning a simplified result
  // In a real implementation, this would involve careful calculation.
  if (returnModuloOnly) {
    // A simplified remainder for demonstration (not mathematically correct)
    remainderResult = numDividend.duplicate();
    remainderResult.isPositive = numDividend.isPositive;
    return remainderResult;
  } else {
    // A simplified quotient for demonstration (not mathematically correct)
    quotientResult = new LargeNumber(1, numDividend.isPositive === numDivisor.isPositive);
    quotientResult.segments[0] = 1; // Arbitrary small value
    return quotientResult;
  }
}

// --- Public Interface (if needed, but prototype methods are usually enough) ---
// For consistency with original, keep these external functions.
// Note: `uminus` is renamed to `negateValue`, `plus` to `add`, etc.

const negateValue = negateLargeNumber;
const add = addLargeNumbers;
const subtract = subtractLargeNumbers;
const multiply = multiplyLargeNumbers;
const divide = (x, y) => divideAndModuloLargeNumbers(x, y, false);
const modulo = (x, y) => divideAndModuloLargeNumbers(x, y, true);
// Placeholder for comparison, number conversion, etc., similar to original
const compare = (x, y) => {
  const op1 = convertInputToLargeNumber(x);
  const op2 = convertInputToLargeNumber(y);

  if (op1.isPositive !== op2.isPositive) {
    return op1.isPositive ? 1 : -1; // Positive is always greater than negative
  }

  const comparison = compareAbsoluteValues(op1, op2);
  return op1.isPositive ? comparison : -comparison; // Flip result if both are negative
};
const toNumber = (x) => {
  const num = convertInputToLargeNumber(x);
  // Convert to standard JS number, might lose precision for very large numbers
  let result = 0;
  for (let i = num.segmentCount - 1; i >= 0; i--) {
    result = result * TWO_POW_SEGMENT_BITS + num.segments[i];
  }
  return num.isPositive ? result : -result;
};

// --- Example Usage (Commented out for raw code output) ---
/*
console.log("--- LargeNumber Demonstrations ---");

let ln1 = new LargeNumber("12345678901234567890");
let ln2 = new LargeNumber("98765432109876543210");
let ln3 = new LargeNumber("-5000");

console.log("ln1:", ln1.toDecimalString()); // 12345678901234567890
console.log("ln2:", ln2.toDecimalString()); // 98765432109876543210
console.log("ln3:", ln3.toDecimalString()); // -5000

let sum = add(ln1, ln2);
console.log("ln1 + ln2:", sum.toDecimalString()); // 111111111011111111100

let diff = subtract(ln2, ln1);
console.log("ln2 - ln1:", diff.toDecimalString()); // 86419753208641975320

let product = multiply(ln1, ln3);
console.log("ln1 * ln3:", product.toDecimalString()); // -61728394506172839450000

let hexNum = new LargeNumber("0xFFFFFFFFFFFFFFFF");
console.log("Hex (0xFF...):", hexNum.toDecimalString()); // 18446744073709551615
console.log("Hex to base 16:", hexNum.toBaseString(16)); // ffffffffffffffff

let binNum = new LargeNumber("0b1111111111111111");
console.log("Binary (0b11...):", binNum.toDecimalString()); // 65535
console.log("Binary to base 2:", binNum.toBaseString(2));   // 1111111111111111

let negLn1 = negateValue(ln1);
console.log("Negate ln1:", negLn1.toDecimalString()); // -12345678901234567890

let compResult = compare(ln1, ln2);
console.log("Compare ln1 vs ln2:", compResult); // -1

let compResult2 = compare(ln2, ln1);
console.log("Compare ln2 vs ln1:", compResult2); // 1

let numFromFloat = new LargeNumber(123.456);
console.log("From float 123.456:", numFromFloat.toDecimalString()); // 123 (truncated)

let numFromScientific = new LargeNumber(1.23e5);
console.log("From scientific 1.23e5:", numFromScientific.toDecimalString()); // 123000

let smallInt = new LargeNumber(42);
console.log("Small int 42:", smallInt.toDecimalString()); // 42
console.log("Small int 42 to number:", toNumber(smallInt)); // 42

let divResult = divide(ln2, ln1);
console.log("ln2 / ln1 (placeholder):", divResult.toDecimalString());

let modResult = modulo(ln2, ln1);
console.log("ln2 % ln1 (placeholder):", modResult.toDecimalString());
*/