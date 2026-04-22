var numericProcessor=function(noValue){
  "use strict";

  // Fundamental constants for arbitrary-precision arithmetic
  // CHUNK_UNIT represents the base for each 'digit' in our internal array representation.
  // It's chosen to be a power of 10 that fits within a standard JS number's safe integer range
  // without overflow issues during multiplication.
  var CHUNK_UNIT = 1e7; // Each array element stores a number up to 9,999,999
  // CHUNK_POWER is the logarithm base 10 of CHUNK_UNIT, indicating the number of decimal digits
  // each chunk effectively holds.
  var CHUNK_POWER = 7; // log10(1e7) = 7

  // MAX_JS_SAFE_INTEGER is the largest integer N such that N and N+1 are precisely representable
  // in JavaScript. This is 2^53 - 1.
  var MAX_JS_SAFE_INTEGER = 9007199254740992;
  // MAX_JS_SAFE_INTEGER_CHUNKS is the array representation of MAX_JS_SAFE_INTEGER.
  var MAX_JS_SAFE_INTEGER_CHUNKS = convertNativeToChunkArray(MAX_JS_SAFE_INTEGER);

  // --- Abstract Base Class for Numeric Values ---
  /**
   * Represents an abstract numeric value. All specific numeric types will inherit from this.
   * @param {*} rawValue - The initial value.
   * @param {number} [baseRadix] - The radix if rawValue is a string.
   * @returns {AbstractNumeric} An instance of a concrete numeric type (SimpleValue or LargeValue).
   */
  function AbstractNumeric(rawValue, baseRadix){
    // If no value is provided, default to zero.
    if(typeof rawValue === "undefined") {
      return AbstractNumeric.getZero();
    }
    // Handle specific radix parsing for string inputs.
    if(typeof baseRadix !== "undefined") {
      return (+baseRadix === 10) ? normalizeInput(rawValue) : parseStringWithBase(rawValue, baseRadix);
    }
    // Default parsing for numbers or strings without a specific radix.
    return normalizeInput(rawValue);
  }

  // --- Large Numeric Value Constructor ---
  /**
   * Represents a large integer that exceeds JavaScript's native number precision.
   * Stored as an array of 'chunks' (digits in base CHUNK_UNIT).
   * @param {number[]} chunkArray - An array of number chunks.
   * @param {boolean} isNegative - True if the number is negative.
   */
  function LargeValue(chunkArray, isNegative){
    this.digitSegments = chunkArray;
    this.isNegative = isNegative;
    this.isCompact = false; // Flag to distinguish from SimpleValue
  }
  // Inherit methods from AbstractNumeric.
  LargeValue.prototype = Object.create(AbstractNumeric.prototype);
  LargeValue.prototype.constructor = LargeValue;

  // --- Compact Numeric Value Constructor ---
  /**
   * Represents an integer that fits within JavaScript's native number precision.
   * @param {number} numericVal - The native JavaScript number.
   */
  function SimpleValue(numericVal){
    this.nativeValue = numericVal;
    this.isNegative = numericVal < 0;
    this.isCompact = true; // Flag to distinguish from LargeValue
  }
  // Inherit methods from AbstractNumeric.
  SimpleValue.prototype = Object.create(AbstractNumeric.prototype);
  SimpleValue.prototype.constructor = SimpleValue;

  // --- Helper Functions ---

  /**
   * Checks if a number can be precisely represented by JavaScript's native number type.
   * @param {number} n - The number to check.
   * @returns {boolean} True if the number is within the safe integer range.
   */
  function isJsPreciselyRepresentable(n){
    return -MAX_JS_SAFE_INTEGER < n && n < MAX_JS_SAFE_INTEGER;
  }

  /**
   * Converts a native JavaScript number into an array of chunks (base CHUNK_UNIT digits).
   * @param {number} n - The native number.
   * @returns {number[]} An array of chunks.
   */
  function convertNativeToChunkArray(n){
    if (n < CHUNK_UNIT) { // Single chunk
      return [n];
    }
    if (n < CHUNK_UNIT * CHUNK_UNIT) { // Two chunks
      return [n % CHUNK_UNIT, Math.floor(n / CHUNK_UNIT)];
    }
    // Three chunks (covers up to 1e21, well beyond MAX_JS_SAFE_INTEGER)
    return [n % CHUNK_UNIT, Math.floor(n / CHUNK_UNIT) % CHUNK_UNIT, Math.floor(n / (CHUNK_UNIT * CHUNK_UNIT))];
  }

  /**
   * Converts an array of chunks back into a native JavaScript number if possible.
   * @param {number[]} chunkArr - The array of chunks.
   * @returns {number|number[]} The native number if compact, otherwise the original chunk array.
   */
  function convertChunkArrayToNative(chunkArr){
    pruneLeadingZeros(chunkArr); // Remove any leading zero chunks
    const numChunks = chunkArr.length;
    // Check if the number of chunks and its magnitude fit into a native number.
    // The original logic checked against MAX_INT_ARR directly for small lengths,
    // which implicitly checks the magnitude.
    if (numChunks < 4 && compareMagnitudes(chunkArr, MAX_JS_SAFE_INTEGER_CHUNKS) < 0) {
      switch(numChunks){
        case 0: return 0;
        case 1: return chunkArr[0];
        case 2: return chunkArr[0] + chunkArr[1] * CHUNK_UNIT;
        case 3: return chunkArr[0] + (chunkArr[1] + chunkArr[2] * CHUNK_UNIT) * CHUNK_UNIT;
        default: return chunkArr[0]; // Should not happen given the numChunks < 4 check
      }
    }
    return chunkArr; // If too large, return the array as is
  }

  /**
   * Removes leading zero chunks from a chunk array (e.g., [1, 2, 0, 0] becomes [1, 2]).
   * Modifies the array in place.
   * @param {number[]} chunkArr - The array of chunks to trim.
   */
  function pruneLeadingZeros(chunkArr){
    let currentLength = chunkArr.length;
    while(currentLength > 0 && chunkArr[--currentLength] === 0);
    chunkArr.length = currentLength + 1;
  }

  /**
   * Creates a new array of a specified length, filled with zeros.
   * @param {number} length - The desired length of the array.
   * @returns {number[]} A new zero-filled array.
   */
  function createZeroFilledArray(length){
    // Using Array.fill is more idiomatic and potentially clearer than a manual loop.
    return new Array(length).fill(0);
  }

  /**
   * Truncates a floating-point number to its integer part (floor for positive, ceil for negative).
   * @param {number} n - The number to truncate.
   * @returns {number} The integer part of the number.
   */
  function integerFloor(n){
    // Math.trunc is a more modern and direct way to achieve this.
    return Math.trunc(n);
  }

  // --- Arithmetic Operations ---

  /**
   * Performs addition of two chunk arrays (representing positive numbers).
   * Assumes 'a' is longer or equal in length to 'b'.
   * @param {number[]} a - First chunk array.
   * @param {number[]} b - Second chunk array.
   * @returns {number[]} The result chunk array.
   */
  function performAddition(a, b){
    const lenA = a.length;
    const lenB = b.length;
    const resultChunks = new Array(lenA); // Result can be at most lenA + 1
    let carry = 0;
    let currentSum;

    // Add corresponding chunks from both arrays
    for(let i = 0; i < lenB; i++){
      currentSum = a[i] + b[i] + carry;
      carry = Math.floor(currentSum / CHUNK_UNIT);
      resultChunks[i] = currentSum % CHUNK_UNIT;
    }

    // Add remaining chunks from the longer array 'a' with carry
    for(let i = lenB; i < lenA; i++){
      currentSum = a[i] + carry;
      carry = Math.floor(currentSum / CHUNK_UNIT);
      resultChunks[i] = currentSum % CHUNK_UNIT;
    }

    // If there's a final carry, append it to the result
    if(carry > 0) {
      resultChunks.push(carry);
    }

    return resultChunks;
  }

  /**
   * Performs addition of two chunk arrays, handling different lengths.
   * @param {number[]} arr1 - First chunk array.
   * @param {number[]} arr2 - Second chunk array.
   * @returns {number[]} The sum as a chunk array.
   */
  function performArrayAddition(arr1, arr2){
    // Ensure the first argument is always the longer or equal length array for performAddition.
    if(arr1.length >= arr2.length) {
      return performAddition(arr1, arr2);
    }
    return performAddition(arr2, arr1);
  }

  /**
   * Performs addition of a chunk array with a small native integer carry.
   * Used when adding a SimpleValue to a LargeValue.
   * @param {number[]} chunkArr - The chunk array.
   * @param {number} carryVal - The small integer carry (can be negative for subtraction).
   * @returns {number[]} The resulting chunk array.
   */
  function performSmallAddition(chunkArr, carryVal){
    const arrLen = chunkArr.length;
    const resultArr = new Array(arrLen);
    let currentCarry = carryVal; // Renamed to avoid confusion with loop variable 'carry'
    let currentSum;

    for(let i = 0; i < arrLen; i++){
      currentSum = chunkArr[i] + currentCarry;
      currentCarry = Math.floor(currentSum / CHUNK_UNIT);
      resultArr[i] = currentSum % CHUNK_UNIT;
    }

    // Propagate any remaining carry
    while(currentCarry !== 0){ // Check for non-zero instead of just >0 to handle negative carries
      resultArr.push(currentCarry % CHUNK_UNIT);
      currentCarry = Math.floor(currentCarry / CHUNK_UNIT);
    }
    return resultArr;
  }

  LargeValue.prototype.sum = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    // If signs are different, it's effectively a subtraction.
    if(this.isNegative !== parsedOther.isNegative){
      return this.difference(parsedOther.invertSign());
    }

    const currentChunks = this.digitSegments;
    let otherChunks;

    // Handle addition with a SimpleValue.
    if(parsedOther.isCompact){
      const absOtherValue = Math.abs(parsedOther.nativeValue);
      // If the compact value is small enough, use direct small addition.
      if (absOtherValue < CHUNK_UNIT) {
          otherChunks = [absOtherValue];
      } else {
          otherChunks = convertNativeToChunkArray(absOtherValue);
      }
      // The original code used addSmall(a, Math.abs(b)) which is more like adding a scalar.
      // Re-evaluating this path: if `otherVal` is small, it's typically added to the first chunk and carry propagated.
      // Let's use `performSmallAddition` with the first chunk of `otherChunks` and then `performArrayAddition` for the rest.
      // A direct `performArrayAddition` is cleaner if we convert small to array first.
      return new LargeValue(performArrayAddition(currentChunks, otherChunks), this.isNegative);
    }

    // Both are LargeValues or parsedOther is LargeValue.
    otherChunks = parsedOther.digitSegments;
    return new LargeValue(performArrayAddition(currentChunks, otherChunks), this.isNegative);
  };
  // SmallInteger.prototype.add is now SimpleValue.prototype.sum
  SimpleValue.prototype.sum = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentNative = this.nativeValue;

    // If signs are different, it's effectively a subtraction.
    if((currentNative < 0) !== parsedOther.isNegative){
      return this.difference(parsedOther.invertSign());
    }

    // Both are CompactNumbers.
    if(parsedOther.isCompact){
      const otherNative = parsedOther.nativeValue;
      const resultNative = currentNative + otherNative;
      if(isJsPreciselyRepresentable(resultNative)){
        return new SimpleValue(resultNative);
      }
      // If it overflows, convert to LargeValue.
      // Treat both as positive for chunk array conversion, then apply sign.
      const absCurrent = Math.abs(currentNative);
      const absOther = Math.abs(otherNative);
      const currentChunks = convertNativeToChunkArray(absCurrent);
      const otherChunks = convertNativeToChunkArray(absOther);
      return new LargeValue(performArrayAddition(currentChunks, otherChunks), currentNative < 0);
    }

    // One is CompactNumber, the other is LargeValue.
    // Convert CompactNumber to chunks and then add.
    const absCurrentNative = Math.abs(currentNative);
    const currentChunksAsArray = convertNativeToChunkArray(absCurrentNative);
    const otherChunks = parsedOther.digitSegments;
    return new LargeValue(performArrayAddition(currentChunksAsArray, otherChunks), this.isNegative);
  };

  /**
   * Performs subtraction of two chunk arrays (representing positive numbers).
   * Assumes 'a' is greater than or equal to 'b' in magnitude.
   * @param {number[]} minuendChunks - The chunk array from which to subtract.
   * @param {number[]} subtrahendChunks - The chunk array to subtract.
   * @returns {number[]} The result chunk array.
   */
  function performSubtraction(minuendChunks, subtrahendChunks){
    const lenMinuend = minuendChunks.length;
    const lenSubtrahend = subtrahendChunks.length;
    const resultChunks = new Array(lenMinuend);
    let borrow = 0;
    let currentDifference;

    // Subtract chunks from the subtrahend from the minuend
    for(let i = 0; i < lenSubtrahend; i++){
      currentDifference = minuendChunks[i] - borrow - subtrahendChunks[i];
      if(currentDifference < 0){
        currentDifference += CHUNK_UNIT;
        borrow = 1;
      } else {
        borrow = 0;
      }
      resultChunks[i] = currentDifference;
    }

    // Propagate borrow through remaining chunks of the minuend
    for(let i = lenSubtrahend; i < lenMinuend; i++){
      currentDifference = minuendChunks[i] - borrow;
      if(currentDifference < 0){
        currentDifference += CHUNK_UNIT;
        // borrow remains 1 for the next iteration
      } else {
        resultChunks[i++] = currentDifference; // If no borrow, we can fill this chunk and potentially break early.
        // The original loop structure was a bit confusing here. Let's simplify.
        borrow = 0; // Clear borrow if it's no longer needed
      }
      resultChunks[i] = currentDifference;
    }

    // If there's still a borrow after the loop (shouldn't happen if minuend >= subtrahend), it's an error in logic.
    // For this function, it's assumed minuend >= subtrahend.
    pruneLeadingZeros(resultChunks);
    return resultChunks;
  }

  /**
   * Performs subtraction between two chunk arrays, determining the correct sign.
   * @param {number[]} arrA - First chunk array.
   * @param {number[]} arrB - Second chunk array.
   * @param {boolean} initialSign - The sign of the original 'this' value.
   * @returns {LargeValue|SimpleValue} The result of the subtraction.
   */
  function performArraySubtraction(arrA, arrB, initialSign){
    let resultChunks;
    let finalSign = initialSign;
    const magnitudeComparison = compareMagnitudes(arrA, arrB);

    if(magnitudeComparison >= 0){ // arrA >= arrB
      resultChunks = performSubtraction(arrA, arrB);
    } else { // arrA < arrB, so result will have opposite sign
      resultChunks = performSubtraction(arrB, arrA);
      finalSign = !initialSign; // Flip the sign
    }

    // Attempt to convert back to SimpleValue if possible.
    const compactResult = convertChunkArrayToNative(resultChunks);
    if(typeof compactResult === "number"){
      if(finalSign) {
        return new SimpleValue(-compactResult);
      }
      return new SimpleValue(compactResult);
    }
    return new LargeValue(compactResult, finalSign);
  }

  /**
   * Performs subtraction of a small native integer from a chunk array.
   * Used when subtracting a SimpleValue from a LargeValue.
   * @param {number[]} chunkArr - The chunk array.
   * @param {number} smallVal - The small native integer to subtract.
   * @param {boolean} isNegativeFlag - The sign of the original LargeValue.
   * @returns {LargeValue|SimpleValue} The result.
   */
  function performSmallSubtraction(chunkArr, smallVal, isNegativeFlag){
    const arrLen = chunkArr.length;
    const resultArr = new Array(arrLen);
    let currentBorrow = -smallVal; // Initial "borrow" is actually the small value being subtracted
    let currentChunkVal;

    for(let i = 0; i < arrLen; i++){
      currentChunkVal = chunkArr[i] + currentBorrow;
      currentBorrow = Math.floor(currentChunkVal / CHUNK_UNIT);
      resultArr[i] = currentChunkVal % CHUNK_UNIT;
      if (resultArr[i] < 0) { // If negative, adjust and propagate borrow
          resultArr[i] += CHUNK_UNIT;
          currentBorrow--; // Equivalent to Math.floor(-0.x) = -1
      }
    }

    // Attempt to convert back to SimpleValue.
    const compactResult = convertChunkArrayToNative(resultArr);
    if(typeof compactResult === "number"){
      if(isNegativeFlag) {
        return new SimpleValue(-compactResult);
      }
      return new SimpleValue(compactResult);
    }
    return new LargeValue(compactResult, isNegativeFlag);
  }

  LargeValue.prototype.difference = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    // If signs are different, it's effectively an addition.
    if(this.isNegative !== parsedOther.isNegative){
      return this.sum(parsedOther.invertSign());
    }

    const currentChunks = this.digitSegments;
    let otherChunks;

    if(parsedOther.isCompact){
      const absOtherValue = Math.abs(parsedOther.nativeValue);
      // The original `subtractSmall` directly worked with the magnitude.
      // Let's ensure `performSmallSubtraction` is used correctly, it expects a chunk array and a small value.
      // If the small value is negative, it becomes an addition.
      // Here, `this.isNegative` and `parsedOther.isNegative` are the same.
      // So, if this.isNegative is true, it's like (-A) - (-B) = B - A.
      // If this.isNegative is false, it's A - B.
      // `performSmallSubtraction` was designed for A - smallB, where A is positive.
      // Let's use `performArraySubtraction` after converting the small value to an array.
      otherChunks = convertNativeToChunkArray(absOtherValue);
      return performArraySubtraction(currentChunks, otherChunks, this.isNegative);
    }

    // Both are LargeValues or parsedOther is LargeValue.
    otherChunks = parsedOther.digitSegments;
    return performArraySubtraction(currentChunks, otherChunks, this.isNegative);
  };

  SimpleValue.prototype.difference = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentNative = this.nativeValue;

    // If signs are different, it's effectively an addition.
    if((currentNative < 0) !== parsedOther.isNegative){
      return this.sum(parsedOther.invertSign());
    }

    // Both are CompactNumbers.
    if(parsedOther.isCompact){
      const otherNative = parsedOther.nativeValue;
      const resultNative = currentNative - otherNative;
      if(isJsPreciselyRepresentable(resultNative)){
        return new SimpleValue(resultNative);
      }
      // If it overflows, convert to LargeValue.
      // This path implies `currentNative` and `otherNative` have the same sign.
      // e.g., (small positive - large positive) or (small negative - large negative)
      // The sign of the result will depend on the magnitude comparison.
      const absCurrent = Math.abs(currentNative);
      const absOther = Math.abs(otherNative);
      const currentChunks = convertNativeToChunkArray(absCurrent);
      const otherChunks = convertNativeToChunkArray(absOther);
      // The sign for the result will be based on `currentNative < 0` if `absCurrent >= absOther`,
      // otherwise it's `!(currentNative < 0)`.
      const magnitudeComparison = compareMagnitudes(currentChunks, otherChunks);
      let finalSign = currentNative < 0;
      let resultArr;

      if (magnitudeComparison >= 0) { // absCurrent >= absOther
        resultArr = performSubtraction(currentChunks, otherChunks);
      } else { // absCurrent < absOther
        resultArr = performSubtraction(otherChunks, currentChunks);
        finalSign = !finalSign; // Flip sign if subtrahend was larger
      }
      return new LargeValue(resultArr, finalSign);
    }

    // One is CompactNumber, the other is LargeValue.
    // Convert CompactNumber to chunks and then subtract.
    const absCurrentNative = Math.abs(currentNative);
    const currentChunksAsArray = convertNativeToChunkArray(absCurrentNative);
    const otherChunks = parsedOther.digitSegments;

    // Here, `this.isNegative` and `parsedOther.isNegative` are the same.
    // If `this` (compact) is negative, and `other` (large) is negative, it's (-A) - (-B) = B - A.
    // If `this` (compact) is positive, and `other` (large) is positive, it's A - B.
    // In both cases, the sign of the result depends on which magnitude is larger.
    const magnitudeComp = compareMagnitudes(currentChunksAsArray, otherChunks);
    let finalSign = this.isNegative; // Assume initial sign
    let resultArr;

    if (magnitudeComp >= 0) { // abs(this) >= abs(other)
      resultArr = performSubtraction(currentChunksAsArray, otherChunks);
    } else { // abs(this) < abs(other)
      resultArr = performSubtraction(otherChunks, currentChunksAsArray);
      finalSign = !finalSign; // Flip sign
    }
    return new LargeValue(resultArr, finalSign);
  };

  // Aliases for arithmetic methods
  LargeValue.prototype.plus = LargeValue.prototype.sum;
  SimpleValue.prototype.plus = SimpleValue.prototype.sum;
  LargeValue.prototype.minus = LargeValue.prototype.difference;
  SimpleValue.prototype.minus = SimpleValue.prototype.difference;

  LargeValue.prototype.invertSign = function(){
    // If it's zero, the sign doesn't change.
    if (this.isZero()) return AbstractNumeric.getZero();
    return new LargeValue(this.digitSegments, !this.isNegative);
  };
  SimpleValue.prototype.invertSign = function(){
    // If it's zero, the sign doesn't change.
    if (this.isZero()) return AbstractNumeric.getZero();
    const newSmall = new SimpleValue(-this.nativeValue);
    newSmall.isNegative = !this.isNegative; // Explicitly set sign based on new value.
    return newSmall;
  };

  LargeValue.prototype.absoluteValue = function(){
    return new LargeValue(this.digitSegments, false);
  };
  SimpleValue.prototype.absoluteValue = function(){
    return new SimpleValue(Math.abs(this.nativeValue));
  };

  /**
   * Multiplies two chunk arrays (long multiplication algorithm).
   * @param {number[]} arrA - First chunk array.
   * @param {number[]} arrB - Second chunk array.
   * @returns {number[]} The product as a chunk array.
   */
  function longMultiplication(arrA, arrB){
    const lenA = arrA.length;
    const lenB = arrB.length;
    const resultLen = lenA + lenB;
    const resultChunks = createZeroFilledArray(resultLen);
    let productTerm;
    let currentCarry;

    for(let i = 0; i < lenA; ++i){
      const chunkA = arrA[i];
      currentCarry = 0; // Reset carry for each chunk of arrA
      for(let j = 0; j < lenB; ++j){
        const chunkB = arrB[j];
        // Calculate product for current chunks, add to existing result and carry
        productTerm = chunkA * chunkB + resultChunks[i + j] + currentCarry;
        currentCarry = Math.floor(productTerm / CHUNK_UNIT);
        resultChunks[i + j] = productTerm % CHUNK_UNIT;
      }
      // Any remaining carry propagates to the next position.
      if (currentCarry > 0) {
        resultChunks[i + lenB] += currentCarry;
      }
    }
    pruneLeadingZeros(resultChunks);
    return resultChunks;
  }

  /**
   * Multiplies a chunk array by a single native number (small multiplier).
   * @param {number[]} chunkArr - The chunk array.
   * @param {number} multiplier - The small native number multiplier.
   * @returns {number[]} The product as a chunk array.
   */
  function smallMultiplication(chunkArr, multiplier){
    const arrLen = chunkArr.length;
    const resultArr = new Array(arrLen);
    let currentCarry = 0;
    let productTerm;

    for(let i = 0; i < arrLen; i++){
      productTerm = chunkArr[i] * multiplier + currentCarry;
      currentCarry = Math.floor(productTerm / CHUNK_UNIT);
      resultArr[i] = productTerm % CHUNK_UNIT;
    }

    // Propagate any remaining carry.
    while(currentCarry > 0){
      resultArr.push(currentCarry % CHUNK_UNIT);
      currentCarry = Math.floor(currentCarry / CHUNK_UNIT);
    }
    return resultArr;
  }

  /**
   * Pads a chunk array with zeros on the left (effectively multiplying by powers of CHUNK_UNIT).
   * @param {number[]} chunkArr - The array to pad.
   * @param {number} numZeros - The number of zeros to add.
   * @returns {number[]} The padded array.
   */
  function zeroPadLeft(chunkArr, numZeros){
    // Use Array.prototype.concat for clarity, though `splice` or manual loop could be faster for very large arrays.
    const padding = createZeroFilledArray(numZeros);
    return padding.concat(chunkArr);
  }

  /**
   * Karatsuba multiplication algorithm for large numbers.
   * More efficient than long multiplication for very large numbers.
   * @param {number[]} xChunks - First chunk array.
   * @param {number[]} yChunks - Second chunk array.
   * @returns {number[]} The product as a chunk array.
   */
  function karatsubaProduct(xChunks, yChunks){
    const lenX = xChunks.length;
    const lenY = yChunks.length;
    const maxLen = Math.max(lenX, lenY);

    // Base case: if numbers are small enough, use long multiplication.
    // The threshold 30 is somewhat arbitrary, optimized for typical JS engine performance.
    if(maxLen <= 32) { // Changed threshold slightly
      return longMultiplication(xChunks, yChunks);
    }

    // Split numbers into two halves.
    const splitPoint = Math.ceil(maxLen / 2);
    const b = xChunks.slice(splitPoint);
    const a = xChunks.slice(0, splitPoint);
    const d = yChunks.slice(splitPoint);
    const c = yChunks.slice(0, splitPoint);

    // Recursively calculate sub-products.
    const productAC = karatsubaProduct(a, c);
    const productBD = karatsubaProduct(b, d);
    const sumA_B = performArrayAddition(a, b);
    const sumC_D = performArrayAddition(c, d);
    const productABCD = karatsubaProduct(sumA_B, sumC_D);

    // Combine sub-products using Karatsuba formula:
    // result = (AC * B^2N) + ((AD + BC) * B^N) + BD
    // where AD + BC = (A+B)(C+D) - AC - BD
    const middleTerm = performArraySubtraction(productABCD, performArrayAddition(productAC, productBD).digitSegments, false); // Assuming positive results for intermediate steps.

    // Shift and add components.
    // AC * (CHUNK_UNIT^(2 * splitPoint))
    const term1 = zeroPadLeft(productAC, 2 * splitPoint);
    // (AD + BC) * (CHUNK_UNIT^splitPoint)
    const term2 = zeroPadLeft(middleTerm.digitSegments, splitPoint); // Access digitSegments from SimpleValue/LargeValue
    // BD
    const term3 = productBD;

    const finalProduct = performArrayAddition(performArrayAddition(term1, term2), term3);
    pruneLeadingZeros(finalProduct);
    return finalProduct;
  }

  /**
   * Heuristic to decide whether to use Karatsuba multiplication.
   * The formula is empirical and might be adjusted for different environments.
   * @param {number} len1 - Length of the first chunk array.
   * @param {number} len2 - Length of the second chunk array.
   * @returns {boolean} True if Karatsuba is likely faster.
   */
  function shouldUseKaratsuba(len1, len2){
    // Slightly adjusted empirical formula
    return -0.015 * len1 - 0.015 * len2 + 1.8e-5 * len1 * len2 > 0;
  }

  LargeValue.prototype.product = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentChunks = this.digitSegments;
    let otherChunks;
    const resultSign = this.isNegative !== parsedOther.isNegative; // XOR for sign

    // Optimization: Handle multiplication by zero, one, or negative one.
    if (parsedOther.isZero()) return AbstractNumeric.getZero();
    if (parsedOther.isUnit()) {
      if (parsedOther.isNegative) return this.invertSign();
      return this;
    }

    if(parsedOther.isCompact){
      const absOtherNative = Math.abs(parsedOther.nativeValue);
      // If the compact value is small enough, use direct small multiplication.
      if(absOtherNative < CHUNK_UNIT){
        return new LargeValue(smallMultiplication(currentChunks, absOtherNative), resultSign);
      }
      // Otherwise, convert small value to chunks and proceed with long/Karatsuba.
      otherChunks = convertNativeToChunkArray(absOtherNative);
    } else {
      otherChunks = parsedOther.digitSegments;
    }

    let productResult;
    if(shouldUseKaratsuba(currentChunks.length, otherChunks.length)){
      productResult = karatsubaProduct(currentChunks, otherChunks);
    } else {
      productResult = longMultiplication(currentChunks, otherChunks);
    }
    return new LargeValue(productResult, resultSign);
  };

  SimpleValue.prototype.product = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentNative = this.nativeValue;
    const resultSign = (currentNative < 0) !== parsedOther.isNegative;

    // Optimization: Handle multiplication by zero, one, or negative one.
    if (parsedOther.isZero()) return AbstractNumeric.getZero();
    if (parsedOther.isUnit()) {
      if (parsedOther.isNegative) return this.invertSign();
      return this;
    }

    if(parsedOther.isCompact){
      const otherNative = parsedOther.nativeValue;
      const productNative = currentNative * otherNative;
      if(isJsPreciselyRepresentable(productNative)){
        return new SimpleValue(productNative);
      }
      // If overflow, convert to LargeValue.
      const absCurrent = Math.abs(currentNative);
      const absOther = Math.abs(otherNative);
      const currentChunks = convertNativeToChunkArray(absCurrent);
      const otherChunks = convertNativeToChunkArray(absOther);
      return new LargeValue(longMultiplication(currentChunks, otherChunks), resultSign);
    }

    // One is CompactNumber, the other is LargeValue.
    // Convert CompactNumber to chunks and multiply.
    const absCurrentNative = Math.abs(currentNative);
    const currentChunksAsArray = convertNativeToChunkArray(absCurrentNative);
    const otherChunks = parsedOther.digitSegments;

    let productResult;
    if(shouldUseKaratsuba(currentChunksAsArray.length, otherChunks.length)){
      productResult = karatsubaProduct(currentChunksAsArray, otherChunks);
    } else {
      productResult = longMultiplication(currentChunksAsArray, otherChunks);
    }
    return new LargeValue(productResult, resultSign);
  };

  // Alias for product method
  LargeValue.prototype.times = LargeValue.prototype.product;
  SimpleValue.prototype.times = SimpleValue.prototype.product;

  /**
   * Calculates the square of a chunk array.
   * Optimized version of multiplication for squaring.
   * @param {number[]} chunkArr - The chunk array to square.
   * @returns {number[]} The squared value as a chunk array.
   */
  function calculateSquare(chunkArr){
    const arrLen = chunkArr.length;
    const resultLen = 2 * arrLen;
    const resultChunks = createZeroFilledArray(resultLen);
    let productTerm;
    let currentCarry;

    for(let i = 0; i < arrLen; i++){
      const chunk_i = chunkArr[i];
      currentCarry = 0;

      // Diagonal terms (i == j)
      productTerm = chunk_i * chunk_i + resultChunks[i + i] + currentCarry;
      currentCarry = Math.floor(productTerm / CHUNK_UNIT);
      resultChunks[i + i] = productTerm % CHUNK_UNIT;

      // Off-diagonal terms (i != j), calculated twice for symmetry
      for(let j = i + 1; j < arrLen; j++){
        const chunk_j = chunkArr[j];
        productTerm = 2 * (chunk_i * chunk_j) + resultChunks[i + j] + currentCarry;
        currentCarry = Math.floor(productTerm / CHUNK_UNIT);
        resultChunks[i + j] = productTerm % CHUNK_UNIT;
      }
      resultChunks[i + arrLen] += currentCarry; // Propagate final carry
    }
    pruneLeadingZeros(resultChunks);
    return resultChunks;
  }

  LargeValue.prototype.squaredValue = function(){
    return new LargeValue(calculateSquare(this.digitSegments), false); // Square is always positive
  };
  SimpleValue.prototype.squaredValue = function(){
    const nativeVal = this.nativeValue;
    const squaredNative = nativeVal * nativeVal;
    if(isJsPreciselyRepresentable(squaredNative)){
      return new SimpleValue(squaredNative);
    }
    // If overflow, convert to LargeValue.
    const absNativeChunks = convertNativeToChunkArray(Math.abs(nativeVal));
    return new LargeValue(calculateSquare(absNativeChunks), false);
  };

  /**
   * Division and modulo using Knuth's Algorithm D (normalized divisor).
   * Efficient for larger numbers.
   * @param {number[]} dividendChunks - The dividend as a chunk array.
   * @param {number[]} divisorChunks - The divisor as a chunk array.
   * @returns {[SimpleValue|LargeValue, SimpleValue|LargeValue]} An array containing [quotient, remainder].
   */
  function longDivisionAlgorithm(dividendChunks, divisorChunks){
    const dividendLen = dividendChunks.length;
    const divisorLen = divisorChunks.length;
    const quotientResult = createZeroFilledArray(divisorLen); // Max length of quotient
    let normDivisorMostSignificantDigit = divisorChunks[divisorLen - 1]; // d_n-1

    // Normalization step: find a factor 'lambda' such that the most significant digit of the divisor
    // becomes >= CHUNK_UNIT / 2. This ensures better estimation of quotient digits.
    const normalizationFactor = Math.ceil(CHUNK_UNIT / (2 * normDivisorMostSignificantDigit)); // d_n-1 * lambda >= CHUNK_UNIT/2
    let normalizedDividend = smallMultiplication(dividendChunks, normalizationFactor);
    let normalizedDivisor = smallMultiplication(divisorChunks, normalizationFactor);

    // Adjust dividend/divisor and their lengths after normalization.
    const newDividendLen = normalizedDividend.length;
    normDivisorMostSignificantDigit = normalizedDivisor[divisorLen - 1]; // Update after multiplication

    // Pad dividend if necessary to simplify indexing.
    if(newDividendLen <= dividendLen) {
      normalizedDividend.push(0);
    }
    normalizedDivisor.push(0); // Add a zero to divisor for consistent loop bounds.

    let currentQuotientDigit;
    let tempCarry;
    let tempBorrow;
    let loopIndex;

    // Iterate from most significant estimated quotient digit downwards.
    for(let shiftAmount = dividendLen - divisorLen; shiftAmount >= 0; shiftAmount--){
      // Estimate quotient digit (q_hat).
      // (Rn+2 * B + Rn+1) / Dn+1, where B=CHUNK_UNIT, R is current remainder.
      currentQuotientDigit = CHUNK_UNIT - 1; // Maximum possible digit.
      if(normalizedDividend[shiftAmount + divisorLen] !== normDivisorMostSignificantDigit){
        currentQuotientDigit = Math.floor(
          (normalizedDividend[shiftAmount + divisorLen] * CHUNK_UNIT + normalizedDividend[shiftAmount + divisorLen - 1]) / normDivisorMostSignificantDigit
        );
      }

      // Multiply divisor by q_hat and subtract from current part of dividend.
      tempCarry = 0;
      tempBorrow = 0;
      const currentDivisorLen = normalizedDivisor.length; // Includes the padded zero.

      for(loopIndex = 0; loopIndex < currentDivisorLen; loopIndex++){
        tempCarry += currentQuotientDigit * normalizedDivisor[loopIndex];
        const productChunk = tempCarry % CHUNK_UNIT;
        tempCarry = Math.floor(tempCarry / CHUNK_UNIT);

        // Perform subtraction with borrow.
        tempBorrow += normalizedDividend[shiftAmount + loopIndex] - productChunk;
        if(tempBorrow < 0){
          normalizedDividend[shiftAmount + loopIndex] = tempBorrow + CHUNK_UNIT;
          tempBorrow = -1; // Indicate a borrow
        } else {
          normalizedDividend[shiftAmount + loopIndex] = tempBorrow;
          tempBorrow = 0; // No borrow
        }
      }

      // If subtraction resulted in a negative, q_hat was too large; decrement q_hat and add back divisor.
      while(tempBorrow !== 0){
        currentQuotientDigit--;
        tempCarry = 0;
        for(loopIndex = 0; loopIndex < currentDivisorLen; loopIndex++){
          tempCarry += normalizedDividend[shiftAmount + loopIndex] - CHUNK_UNIT + normalizedDivisor[loopIndex];
          if(tempCarry < 0){
            normalizedDividend[shiftAmount + loopIndex] = tempCarry + CHUNK_UNIT;
            tempCarry = 0;
          } else {
            normalizedDividend[shiftAmount + loopIndex] = tempCarry;
            tempCarry = 1;
          }
        }
        tempBorrow += tempCarry; // Adjust borrow based on final carry
      }
      quotientResult[shiftAmount] = currentQuotientDigit;
    }

    // Denormalize remainder.
    const finalRemainder = smallDivMod(normalizedDividend, normalizationFactor)[0];
    return [convertChunkArrayToNative(quotientResult), convertChunkArrayToNative(finalRemainder)];
  }

  /**
   * Recursive division algorithm (simpler but less optimized for very large numbers).
   * @param {number[]} dividendChunks - The dividend as a chunk array.
   * @param {number[]} divisorChunks - The divisor as a chunk array.
   * @returns {[SimpleValue|LargeValue, SimpleValue|LargeValue]} An array containing [quotient, remainder].
   */
  function recursiveDivision(dividendChunks, divisorChunks){
    let currentDividendLen = dividendChunks.length;
    const divisorLen = divisorChunks.length;
    const quotientSegments = [];
    let currentPartialDividend = []; // This will hold the current part of dividend being processed.
    let estimatedQuotient;
    let tempProduct;
    let highDividendPair;
    let highDivisorPair;

    // Loop through the dividend from MSB to LSB.
    while(currentDividendLen > 0){
      currentPartialDividend.unshift(dividendChunks[--currentDividendLen]); // Add one chunk from dividend to the left of partial.
      pruneLeadingZeros(currentPartialDividend); // Keep partial dividend clean.

      // If the current partial dividend is smaller than the divisor, quotient is 0.
      if(compareMagnitudes(currentPartialDividend, divisorChunks) < 0){
        quotientSegments.push(0);
        continue;
      }

      // Estimate quotient digit.
      const partialLen = currentPartialDividend.length;
      highDividendPair = currentPartialDividend[partialLen - 1] * CHUNK_UNIT + currentPartialDividend[partialLen - 2];
      highDivisorPair = divisorChunks[divisorLen - 1] * CHUNK_UNIT + divisorChunks[divisorLen - 2];

      // If partial dividend is one chunk longer than divisor, adjust estimation.
      if(partialLen > divisorLen){
        highDividendPair = (highDividendPair + 1) * CHUNK_UNIT; // Effectively adds a 'virtual' higher chunk.
      }
      estimatedQuotient = Math.ceil(highDividendPair / highDivisorPair);

      // Refine quotient estimate through trial subtraction.
      do {
        tempProduct = smallMultiplication(divisorChunks, estimatedQuotient);
        if(compareMagnitudes(tempProduct, currentPartialDividend) <= 0) {
          break; // Good estimate found.
        }
        estimatedQuotient--;
      } while(estimatedQuotient > 0); // Ensure quotient doesn't go negative.

      quotientSegments.push(estimatedQuotient);
      // Update current partial dividend by subtracting the product.
      currentPartialDividend = performSubtraction(currentPartialDividend, tempProduct);
    }
    quotientSegments.reverse(); // Digits were pushed in reverse order.

    return [convertChunkArrayToNative(quotientSegments), convertChunkArrayToNative(currentPartialDividend)];
  }

  /**
   * Performs division and modulo of a chunk array by a small native integer.
   * @param {number[]} chunkArr - The chunk array (dividend).
   * @param {number} smallDivisor - The small native integer (divisor).
   * @returns {[number[], number]} An array containing [quotient_chunks, remainder_native].
   */
  function smallDivMod(chunkArr, smallDivisor){
    const arrLen = chunkArr.length;
    const quotientChunks = createZeroFilledArray(arrLen);
    let currentRemainder = 0;
    let currentDividendChunk;
    let currentQuotient;

    for(let i = arrLen - 1; i >= 0; --i){
      currentDividendChunk = currentRemainder * CHUNK_UNIT + chunkArr[i];
      currentQuotient = integerFloor(currentDividendChunk / smallDivisor);
      currentRemainder = currentDividendChunk - currentQuotient * smallDivisor; // Remainder
      quotientChunks[i] = currentQuotient | 0; // Ensure integer.
    }
    return [quotientChunks, currentRemainder | 0]; // Ensure remainder is integer.
  }

  /**
   * Handles division and modulo for any combination of SimpleValue/LargeValue.
   * @param {SimpleValue|LargeValue} self - The dividend.
   * @param {*} otherVal - The divisor.
   * @returns {[SimpleValue|LargeValue, SimpleValue|LargeValue]} An array containing [quotient, remainder].
   */
  function performDivisionAndModulo(self, otherVal){
    const parsedOther = normalizeInput(otherVal);

    if(parsedOther.isZero()){
      throw new Error("Division by zero is not allowed.");
    }

    // Handle SimpleValue / SimpleValue case.
    if(self.isCompact && parsedOther.isCompact){
      const nativeDividend = self.nativeValue;
      const nativeDivisor = parsedOther.nativeValue;
      return [
        new SimpleValue(integerFloor(nativeDividend / nativeDivisor)),
        new SimpleValue(nativeDividend % nativeDivisor)
      ];
    }

    // If dividend is compact but divisor is large, quotient is 0, remainder is dividend.
    if(self.isCompact){
      return [AbstractNumeric.getZero(), self];
    }

    const dividendChunks = self.digitSegments;
    let divisorChunks;
    let quotientResult;
    let remainderResult;

    // Handle LargeValue / SimpleValue case.
    if(parsedOther.isCompact){
      const absDivisorNative = Math.abs(parsedOther.nativeValue);
      // Optimization: division by 1 or -1.
      if(absDivisorNative === 1){
        return [self.isNegative !== parsedOther.isNegative ? self.invertSign() : self, AbstractNumeric.getZero()];
      }
      // If divisor is small enough, use smallDivMod.
      if(absDivisorNative < CHUNK_UNIT){
        const dmResult = smallDivMod(dividendChunks, absDivisorNative);
        quotientResult = convertChunkArrayToNative(dmResult[0]);
        remainderResult = dmResult[1];

        // Apply signs.
        if(self.isNegative) remainderResult = -remainderResult;
        if(typeof quotientResult === "number"){
          return [
            new SimpleValue(self.isNegative !== parsedOther.isNegative ? -quotientResult : quotientResult),
            new SimpleValue(remainderResult)
          ];
        }
        return [
          new LargeValue(quotientResult, self.isNegative !== parsedOther.isNegative),
          new SimpleValue(remainderResult)
        ];
      }
      // If small divisor is too large for smallDivMod, convert to chunks.
      divisorChunks = convertNativeToChunkArray(absDivisorNative);
    } else {
      divisorChunks = parsedOther.digitSegments;
    }

    // Handle LargeValue / LargeValue case.
    const magnitudeComparison = compareMagnitudes(dividendChunks, divisorChunks);
    if(magnitudeComparison === -1){ // Dividend < Divisor
      return [AbstractNumeric.getZero(), self];
    }
    if(magnitudeComparison === 0){ // Dividend == Divisor
      return [
        AbstractNumeric.getOne(self.isNegative !== parsedOther.isNegative),
        AbstractNumeric.getZero()
      ];
    }

    // Choose division algorithm based on size.
    let divisionResult;
    // Heuristic: for very large numbers, longDivisionAlgorithm (Knuth's D) is better.
    // For moderately large, recursiveDivision (simpler trial subtraction) might be ok.
    // The original used 200 chunks as a threshold.
    if(dividendChunks.length + divisorChunks.length <= 220) { // Slightly adjusted threshold
      divisionResult = longDivisionAlgorithm(dividendChunks, divisorChunks);
    } else {
      divisionResult = recursiveDivision(dividendChunks, divisorChunks);
    }

    quotientResult = divisionResult[0];
    remainderResult = divisionResult[1];

    // Apply signs to quotient and remainder.
    const quotientSign = self.isNegative !== parsedOther.isNegative;
    const remainderSign = self.isNegative;

    let finalQuotient;
    if(typeof quotientResult === "number"){
      finalQuotient = new SimpleValue(quotientSign ? -quotientResult : quotientResult);
    } else {
      finalQuotient = new LargeValue(quotientResult, quotientSign);
    }

    let finalRemainder;
    if(typeof remainderResult === "number"){
      finalRemainder = new SimpleValue(remainderSign ? -remainderResult : remainderResult);
    } else {
      finalRemainder = new LargeValue(remainderResult, remainderSign);
    }

    return [finalQuotient, finalRemainder];
  }

  LargeValue.prototype.divmod = function(otherVal){
    const divisionResult = performDivisionAndModulo(this, otherVal);
    return {quotient: divisionResult[0], remainder: divisionResult[1]};
  };
  SimpleValue.prototype.divmod = LargeValue.prototype.divmod; // Share implementation

  LargeValue.prototype.quotientOf = function(otherVal){
    return performDivisionAndModulo(this, otherVal)[0];
  };
  SimpleValue.prototype.quotientOf = LargeValue.prototype.quotientOf;

  LargeValue.prototype.remainderOf = function(otherVal){
    return performDivisionAndModulo(this, otherVal)[1];
  };
  SimpleValue.prototype.remainderOf = LargeValue.prototype.remainderOf;

  // Aliases for division and modulo
  LargeValue.prototype.divide = LargeValue.prototype.quotientOf;
  SimpleValue.prototype.divide = SimpleValue.prototype.quotientOf;
  LargeValue.prototype.mod = LargeValue.prototype.remainderOf;
  SimpleValue.prototype.mod = SimpleValue.prototype.remainderOf;
  LargeValue.prototype.over = LargeValue.prototype.quotientOf;
  SimpleValue.prototype.over = SimpleValue.prototype.quotientOf;

  LargeValue.prototype.raiseToPower = function(exponentVal){
    const parsedExp = normalizeInput(exponentVal);
    const baseValue = this.nativeValue; // If 'this' is SmallInteger, this would be its value.
    const absBaseChunks = this.digitSegments; // For LargeValue

    if(parsedExp.isZero()) return AbstractNumeric.getOne();
    if(this.isZero()) return AbstractNumeric.getZero();
    if(AbstractNumeric.getOne().isEqualTo(this)) return AbstractNumeric.getOne();
    if(AbstractNumeric.getMinusOne().isEqualTo(this)) return parsedExp.isEven() ? AbstractNumeric.getOne() : AbstractNumeric.getMinusOne();

    if(parsedExp.isNegative){
      // Negative exponents result in fractions (1/x^n), which are not handled by this integer library.
      // For integer exponentiation, negative exponents usually imply result 0 for non-unit bases.
      return AbstractNumeric.getZero();
    }

    if(!parsedExp.isCompact){
      throw new Error(`The exponent ${parsedExp.toString()} is too large for current implementation.`);
    }

    // Handle cases where base is SmallInteger (this is SimpleValue)
    if(this.isCompact){
        const nativeBase = this.nativeValue;
        const nativeExp = parsedExp.nativeValue;
        const resultNative = Math.pow(nativeBase, nativeExp);
        if(isJsPreciselyRepresentable(resultNative)){
            return new SimpleValue(integerFloor(resultNative));
        }
        // If overflow, convert base to LargeValue and proceed with BigInt power.
        // Fall through to the iterative multiplication below.
    }

    // Iterative exponentiation (binary exponentiation / exponentiation by squaring)
    let currentBase = this;
    let result = AbstractNumeric.getOne();
    let expVal = parsedExp.nativeValue; // Assuming parsedExp is compact and positive

    while(true){
      if((expVal & 1) === 1){ // If exponent is odd
        result = result.times(currentBase);
      }
      expVal = integerFloor(expVal / 2); // Divide exponent by 2
      if(expVal === 0) break;
      currentBase = currentBase.squaredValue(); // Square the base
    }
    return result;
  };
  SimpleValue.prototype.raiseToPower = LargeValue.prototype.raiseToPower;

  LargeValue.prototype.modPow = function(exponent, modulus){
    const parsedExp = normalizeInput(exponent);
    const parsedMod = normalizeInput(modulus);

    if(parsedMod.isZero()) throw new Error("Cannot compute modular exponentiation with modulus 0.");
    if(parsedExp.isNegative()) throw new Error("Modular exponentiation with negative exponent is not supported.");

    let finalResult = AbstractNumeric.getOne();
    let currentBase = this.mod(parsedMod); // Base is reduced modulo modulus.

    // Handle base being zero early.
    if (currentBase.isZero()) return AbstractNumeric.getZero();

    // Binary exponentiation (exponentiation by squaring)
    let tempExponent = parsedExp;
    while(tempExponent.isPositive()){
      if(tempExponent.isOdd()){
        finalResult = finalResult.product(currentBase).mod(parsedMod);
      }
      tempExponent = tempExponent.quotientOf(2);
      currentBase = currentBase.squaredValue().mod(parsedMod);
    }
    return finalResult;
  };
  SimpleValue.prototype.modPow = LargeValue.prototype.modPow;

  // --- Comparison Operations ---

  /**
   * Compares the absolute magnitudes of two chunk arrays.
   * @param {number[]} arr1 - First chunk array.
   * @param {number[]} arr2 - Second chunk array.
   * @returns {number} -1 if arr1 < arr2, 0 if arr1 == arr2, 1 if arr1 > arr2.
   */
  function compareMagnitudes(arr1, arr2){
    const len1 = arr1.length;
    const len2 = arr2.length;

    if(len1 !== len2){
      return len1 > len2 ? 1 : -1;
    }

    // Compare chunk by chunk from most significant to least significant.
    for(let i = len1 - 1; i >= 0; i--){
      if(arr1[i] !== arr2[i]) {
        return arr1[i] > arr2[i] ? 1 : -1;
      }
    }
    return 0; // Arrays are identical.
  }

  LargeValue.prototype.compareMagnitude = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentChunks = this.digitSegments;

    if(parsedOther.isCompact){
      // A LargeValue will almost always be greater than a SimpleValue in magnitude
      // unless the LargeValue represents zero.
      if (this.isZero() && parsedOther.isZero()) return 0;
      if (parsedOther.isZero()) return 1; // Any non-zero LargeValue > 0
      // If the compact value is zero, and this is non-zero
      // If parsedOther is compact and non-zero, then this (LargeValue) is always larger in magnitude.
      return 1;
    }
    return compareMagnitudes(currentChunks, parsedOther.digitSegments);
  };
  SimpleValue.prototype.compareMagnitude = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    const currentAbsNative = Math.abs(this.nativeValue);

    if(parsedOther.isCompact){
      const otherAbsNative = Math.abs(parsedOther.nativeValue);
      if(currentAbsNative === otherAbsNative) return 0;
      return currentAbsNative > otherAbsNative ? 1 : -1;
    }
    // If 'this' is SimpleValue and 'parsedOther' is LargeValue, 'parsedOther' is generally larger.
    // Unless 'this' is zero and 'parsedOther' is also zero, but that's handled earlier.
    // If 'this' is non-zero, and parsedOther is LargeValue, it's smaller.
    return -1;
  };

  LargeValue.prototype.compareTo = function(otherVal){
    // Handle special JS values Infinity, -Infinity
    if(otherVal === Infinity) return -1;
    if(otherVal === -Infinity) return 1;

    const parsedOther = normalizeInput(otherVal);
    // Handle different signs first.
    if(this.isNegative !== parsedOther.isNegative){
      return parsedOther.isNegative ? 1 : -1; // If other is negative, this (positive) is greater.
    }

    // If signs are the same, compare magnitudes and apply sign.
    const magnitudeComparison = this.compareMagnitude(parsedOther);
    if(this.isNegative){
      return -magnitudeComparison; // For negative numbers, larger magnitude means smaller value.
    }
    return magnitudeComparison;
  };
  SimpleValue.prototype.compareTo = function(otherVal){
    // Handle special JS values Infinity, -Infinity
    if(otherVal === Infinity) return -1;
    if(otherVal === -Infinity) return 1;

    const parsedOther = normalizeInput(otherVal);
    const currentNative = this.nativeValue;

    if(parsedOther.isCompact){
      const otherNative = parsedOther.nativeValue;
      if(currentNative === otherNative) return 0;
      return currentNative > otherNative ? 1 : -1;
    }

    // If 'this' is SimpleValue and 'parsedOther' is LargeValue.
    // Compare signs.
    if((currentNative < 0) !== parsedOther.isNegative){
      return (currentNative < 0) ? -1 : 1; // If this is negative, it's smaller. If this is positive, it's larger.
    }
    // If signs are the same, then SimpleValue is always smaller in magnitude than LargeValue.
    // So if both are positive, SimpleValue < LargeValue -> -1.
    // If both are negative, SimpleValue > LargeValue (because less negative) -> 1.
    return (currentNative < 0) ? 1 : -1;
  };

  // Comparison aliases
  LargeValue.prototype.isEqualTo = function(otherVal){ return this.compareTo(otherVal) === 0; };
  SimpleValue.prototype.isEqualTo = SimpleValue.prototype.eq = LargeValue.prototype.isEqualTo;
  LargeValue.prototype.eq = LargeValue.prototype.isEqualTo;

  LargeValue.prototype.isNotEqualTo = function(otherVal){ return this.compareTo(otherVal) !== 0; };
  SimpleValue.prototype.isNotEqualTo = SimpleValue.prototype.neq = LargeValue.prototype.isNotEqualTo;
  LargeValue.prototype.neq = LargeValue.prototype.isNotEqualTo;

  LargeValue.prototype.isGreaterThan = function(otherVal){ return this.compareTo(otherVal) > 0; };
  SimpleValue.prototype.isGreaterThan = SimpleValue.prototype.gt = LargeValue.prototype.isGreaterThan;
  LargeValue.prototype.gt = LargeValue.prototype.isGreaterThan;

  LargeValue.prototype.isLesserThan = function(otherVal){ return this.compareTo(otherVal) < 0; };
  SimpleValue.prototype.isLesserThan = SimpleValue.prototype.lt = LargeValue.prototype.isLesserThan;
  LargeValue.prototype.lt = LargeValue.prototype.isLesserThan;

  LargeValue.prototype.isGreaterOrEqualTo = function(otherVal){ return this.compareTo(otherVal) >= 0; };
  SimpleValue.prototype.isGreaterOrEqualTo = SimpleValue.prototype.geq = LargeValue.prototype.isGreaterOrEqualTo;
  LargeValue.prototype.geq = LargeValue.prototype.isGreaterOrEqualTo;

  LargeValue.prototype.isLesserOrEqualTo = function(otherVal){ return this.compareTo(otherVal) <= 0; };
  SimpleValue.prototype.isLesserOrEqualTo = SimpleValue.prototype.leq = LargeValue.prototype.isLesserOrEqualTo;
  LargeValue.prototype.leq = LargeValue.prototype.isLesserOrEqualTo;

  // --- Property Checkers ---

  LargeValue.prototype.isEven = function(){
    // Check the least significant chunk.
    return (this.digitSegments[0] & 1) === 0;
  };
  SimpleValue.prototype.isEven = function(){
    // Check the native value.
    return (this.nativeValue & 1) === 0;
  };

  LargeValue.prototype.isOdd = function(){
    // Check the least significant chunk.
    return (this.digitSegments[0] & 1) === 1;
  };
  SimpleValue.prototype.isOdd = function(){
    // Check the native value.
    return (this.nativeValue & 1) === 1;
  };

  LargeValue.prototype.isPositive = function(){
    return !this.isNegative;
  };
  SimpleValue.prototype.isPositive = function(){
    return this.nativeValue > 0;
  };

  LargeValue.prototype.isNegative = function(){
    return this.isNegative;
  };
  SimpleValue.prototype.isNegative = function(){
    return this.nativeValue < 0;
  };

  LargeValue.prototype.isUnit = function(){
    // A LargeValue is a unit (1 or -1) only if its chunk array is [1] and its length is 1.
    return this.digitSegments.length === 1 && this.digitSegments[0] === 1;
  };
  SimpleValue.prototype.isUnit = function(){
    return Math.abs(this.nativeValue) === 1;
  };

  LargeValue.prototype.isZero = function(){
    // A LargeValue is zero if its chunk array is [0] (after trimming) or effectively empty.
    return this.digitSegments.length === 1 && this.digitSegments[0] === 0;
  };
  SimpleValue.prototype.isZero = function(){
    return this.nativeValue === 0;
  };

  LargeValue.prototype.isDivisibleBy = function(otherVal){
    const parsedOther = normalizeInput(otherVal);
    // Division by zero is undefined, so not divisible.
    if(parsedOther.isZero()) return false;
    // Any number is divisible by 1 or -1.
    if(parsedOther.isUnit()) return true;
    // Check for even numbers if divisor is 2.
    if(parsedOther.isEqualTo(AbstractNumeric.getTwo())) return this.isEven();
    // For other cases, check if remainder is zero.
    return this.mod(parsedOther).isZero();
  };
  SimpleValue.prototype.isDivisibleBy = LargeValue.prototype.isDivisibleBy; // Share implementation

  /**
   * Checks for trivial primality (small primes and common composites).
   * @param {SimpleValue|LargeValue} numVal - The number to check.
   * @returns {boolean|undefined} True/False if trivial, undefined if more complex check needed.
   */
  function isTrivialPrime(numVal){
    const absVal = numVal.absoluteValue();
    if(absVal.isUnit()) return false; // 1 or -1 is not prime.
    if(absVal.isEqualTo(AbstractNumeric.getTwo()) || absVal.isEqualTo(AbstractNumeric.getThree()) || absVal.isEqualTo(AbstractNumeric.getFive())) return true;
    if(absVal.isEven() || absVal.isDivisibleBy(AbstractNumeric.getThree()) || absVal.isDivisibleBy(AbstractNumeric.getFive())) return false;
    if(absVal.isLesserThan(AbstractNumeric.get(25))) return true; // Primes up to 23 (7, 11, 13, 17, 19, 23)
    return noValue; // Undefined, requires stronger primality test.
  }

  LargeValue.prototype.isPrime = function(){
    const trivialCheck = isTrivialPrime(this);
    if(trivialCheck !== noValue) return trivialCheck;

    const n = this.absoluteValue();
    const nMinusOne = n.prev(); // n-1
    let d = nMinusOne; // d = n-1
    let s = 0; // number of times 2 divides n-1

    // Find d and s such that n-1 = d * 2^s, where d is odd.
    while(d.isEven()){
      d = d.quotientOf(AbstractNumeric.getTwo());
      s++;
    }

    // Miller-Rabin witnesses.
    // For n < 3,317,044,064,679,887, this set of bases is sufficient.
    const testBases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]; // Extended set of bases
    // Convert to LargeValue instances once.
    const bigIntTestBases = testBases.map(b => AbstractNumeric(b));

    for(let i = 0; i < bigIntTestBases.length; i++){
      const a = bigIntTestBases[i];
      // If n is one of the test bases, it's prime.
      if (n.isEqualTo(a)) return true;

      let x = a.modPow(d, n); // x = a^d mod n

      if(x.isEqualTo(AbstractNumeric.getOne()) || x.isEqualTo(nMinusOne)){
        continue; // n is probably prime with respect to this base.
      }

      let isStrongPseudoprime = false;
      for(let r = 0; r < s; r++){ // Check x^(2^r) mod n
        x = x.squaredValue().mod(n);
        if(x.isEqualTo(nMinusOne)){
          isStrongPseudoprime = true;
          break;
        }
      }
      if(!isStrongPseudoprime) return false; // n is composite.
    }
    return true; // Passed all Miller-Rabin tests, highly probable prime.
  };
  SimpleValue.prototype.isPrime = LargeValue.prototype.isPrime;

  LargeValue.prototype.isProbablePrime = function(numIterations){
    const trivialCheck = isTrivialPrime(this);
    if(trivialCheck !== noValue) return trivialCheck;

    const n = this.absoluteValue();
    const iterations = numIterations === noValue ? 5 : numIterations; // Default 5 iterations.

    // If n is 2, it's prime.
    if (n.isEqualTo(AbstractNumeric.getTwo())) return true;
    // If n is even and > 2, it's not prime.
    if (n.isEven()) return false;
    // If n < 2, it's not prime.
    if (n.isLesserThan(AbstractNumeric.getTwo())) return false;

    // Miller-Rabin test.
    const nMinusTwo = n.difference(AbstractNumeric.getTwo());
    const nMinusOne = n.prev();

    for(let i = 0; i < iterations; i++){
      const a = AbstractNumeric.randomBetween(AbstractNumeric.getTwo(), nMinusTwo);
      // If a^(n-1) % n is not 1, then n is composite (Fermat's Little Theorem).
      // This is a weak test; Miller-Rabin is stronger.
      // The original code used `!a.modPow(n.prev(), n).isUnit()`.
      // Let's stick closer to a standard Miller-Rabin test for probable prime.
      // A full Miller-Rabin test for probable prime is already implemented in `isPrime` for larger numbers.
      // For `isProbablePrime`, we can use a simplified check or just call `isPrime`.
      // Given the original's check, it implies a Fermat primality test.
      // Let's implement a basic Miller-Rabin for 'probable prime' here.
      // The `isPrime` method already does a strong Miller-Rabin test.
      // For `isProbablePrime`, the original uses `a.modPow(n.prev(), n).isUnit()`.
      // This is actually a check for `a^(n-1) === 1 (mod n)`. This is a Fermat primality test.
      // If it fails, it's definitely composite. If it passes, it's a *probable* prime.
      if(!a.modPow(nMinusOne, n).isEqualTo(AbstractNumeric.getOne())) {
        return false;
      }
    }
    return true; // Passed all iterations of Fermat test, probably prime.
  };
  SimpleValue.prototype.isProbablePrime = LargeValue.prototype.isProbablePrime;

  LargeValue.prototype.modInverse = function(modulus){
    let tempT = AbstractNumeric.getZero();
    let newTempT = AbstractNumeric.getOne();
    let rVal = normalizeInput(modulus);
    let newRVal = this.absoluteValue(); // Use absolute value for extended Euclidean algorithm

    let currentQuotient, lastTempT, lastRVal;

    // Extended Euclidean Algorithm
    while(!newRVal.isZero()){
      currentQuotient = rVal.quotientOf(newRVal);
      lastTempT = tempT;
      lastRVal = rVal;

      tempT = newTempT;
      rVal = newRVal;

      newTempT = lastTempT.difference(currentQuotient.product(newTempT));
      newRVal = lastRVal.difference(currentQuotient.product(newRVal));
    }

    if(!rVal.isEqualTo(AbstractNumeric.getOne())){
      throw new Error(`Numbers ${this.toString()} and ${modulus.toString()} are not coprime.`);
    }

    // Adjust result to be positive and within [0, modulus-1]
    if(tempT.isNegative()){
      tempT = tempT.sum(modulus);
    }

    // If original number was negative, adjust result.
    if(this.isNegative()){
      return tempT.invertSign();
    }
    return tempT;
  };
  SimpleValue.prototype.modInverse = LargeValue.prototype.modInverse;

  LargeValue.prototype.nextValue = function(){
    // If negative, incrementing means subtracting from absolute value.
    if(this.isNegative){
      // -N + 1 is equivalent to -(N - 1)
      const absChunks = this.absoluteValue().digitSegments;
      const result = performSmallSubtraction(absChunks, 1, true); // Sign remains negative.
      return result;
    }
    // If positive, simply add 1.
    return new LargeValue(performSmallAddition(this.digitSegments, 1), this.isNegative);
  };
  SimpleValue.prototype.nextValue = function(){
    const nativeVal = this.nativeValue;
    const incrementedVal = nativeVal + 1;
    if(incrementedVal < MAX_JS_SAFE_INTEGER){
      return new SimpleValue(incrementedVal);
    }
    // If it overflows, create a LargeValue.
    return new LargeValue(MAX_JS_SAFE_INTEGER_CHUNKS, false);
  };

  LargeValue.prototype.previousValue = function(){
    // If negative, decrementing means adding to absolute value.
    if(this.isNegative){
      // -N - 1 is equivalent to -(N + 1)
      const absChunks = this.absoluteValue().digitSegments;
      return new LargeValue(performSmallAddition(absChunks, 1), true); // Sign remains negative.
    }
    // If positive, simply subtract 1.
    const result = performSmallSubtraction(this.digitSegments, 1, this.isNegative);
    return result;
  };
  SimpleValue.prototype.previousValue = function(){
    const nativeVal = this.nativeValue;
    const decrementedVal = nativeVal - 1;
    if(decrementedVal > -MAX_JS_SAFE_INTEGER){
      return new SimpleValue(decrementedVal);
    }
    // If it underflows, create a LargeValue.
    // The original code used MAX_INT_ARR, which represents +MAX_INT.
    // For -MAX_INT-1, it would be a large negative number.
    // A number like -(MAX_JS_SAFE_INTEGER) is a LargeValue with sign true and value MAX_JS_SAFE_INTEGER_CHUNKS.
    return new LargeValue(MAX_JS_SAFE_INTEGER_CHUNKS, true);
  };

  // Aliases for increment/decrement
  LargeValue.prototype.next = LargeValue.prototype.nextValue;
  SimpleValue.prototype.next = SimpleValue.prototype.nextValue;
  LargeValue.prototype.prev = LargeValue.prototype.previousValue;
  SimpleValue.prototype.prev = SimpleValue.prototype.previousValue;

  // --- Bitwise Operations ---

  // Pre-calculated powers of 2 up to CHUNK_UNIT to optimize shifting.
  const powersOfTwoCache = [1];
  while(2 * powersOfTwoCache[powersOfTwoCache.length - 1] <= CHUNK_UNIT) {
    powersOfTwoCache.push(2 * powersOfTwoCache[powersOfTwoCache.length - 1]);
  }
  const POWERS_2_CACHE_LENGTH = powersOfTwoCache.length;
  const HIGHEST_POWER_OF_2 = powersOfTwoCache[POWERS_2_CACHE_LENGTH - 1];

  /**
   * Checks if a shift amount is considered "small" enough for direct multiplication/division.
   * @param {*} shiftAmount - The shift amount.
   * @returns {boolean} True if small.
   */
  function isShiftAmountSmall(shiftAmount){
    // Shift amount must be a number or string convertible to number, and its absolute value
    // must not exceed CHUNK_UNIT. Also, if it's a BigInteger, its magnitude must be <= CHUNK_UNIT.
    return (typeof shiftAmount === "number" || typeof shiftAmount === "string") &&
           +Math.abs(shiftAmount) <= CHUNK_UNIT ||
           (shiftAmount instanceof LargeValue && shiftAmount.digitSegments.length <= 1);
  }

  LargeValue.prototype.bitShiftLeft = function(shiftBy){
    if(!isShiftAmountSmall(shiftBy)){
      throw new Error(`Shift amount ${String(shiftBy)} is too large for current implementation.`);
    }
    const numBits = +shiftBy;
    if(numBits < 0) return this.bitShiftRight(-numBits); // Negative shift left is shift right.

    let result = this;
    if(result.isZero()) return result;

    // Perform shifts by multiplying by powers of 2.
    // Break down large shifts into chunks of POWERS_2_CACHE_LENGTH bits.
    while(numBits >= POWERS_2_CACHE_LENGTH){
      result = result.product(HIGHEST_POWER_OF_2);
      // Each multiplication by HIGHEST_POWER_OF_2 corresponds to a shift by POWERS_2_CACHE_LENGTH - 1 bits.
      // This is a slight simplification, as multiplication by 2^N is a left shift by N.
      // For chunk-based numbers, multiplying by 2^N where 2^N < CHUNK_UNIT is efficient.
      // This loop effectively handles large shifts by multiplying by the largest power of 2 that fits in a chunk.
      // The original code `n -= powers2Length - 1` is slightly off if `highestPower2` is 2^(powers2Length-1).
      // Let's assume `HIGHEST_POWER_OF_2` represents a shift of `POWERS_2_CACHE_LENGTH` bits.
      result = result.product(AbstractNumeric(HIGHEST_POWER_OF_2)); // Use AbstractNumeric factory
      numBits -= POWERS_2_CACHE_LENGTH;
    }
    // Perform remaining shift.
    return result.product(AbstractNumeric(powersOfTwoCache[numBits]));
  };
  SimpleValue.prototype.bitShiftLeft = LargeValue.prototype.bitShiftLeft;

  LargeValue.prototype.bitShiftRight = function(shiftBy){
    let divModResult;
    if(!isShiftAmountSmall(shiftBy)){
      throw new Error(`Shift amount ${String(shiftBy)} is too large for current implementation.`);
    }
    const numBits = +shiftBy;
    if(numBits < 0) return this.bitShiftLeft(-numBits); // Negative shift right is shift left.

    let result = this;
    if(result.isZero()) return result;
    // For negative numbers, bit shift right is floor((N-1)/2^k) for positive N,
    // or ceil(N/2^k) for negative N.
    // The original code implies arithmetic right shift for negative numbers.
    // If the number is negative and its absolute value is a unit, shifting right results in -1.
    if(result.isNegative() && result.isUnit()) return AbstractNumeric.getMinusOne();

    while(numBits >= POWERS_2_CACHE_LENGTH){
      // If result is zero or -1, further shifts don't change it.
      if(result.isZero() || (result.isNegative() && result.isUnit())) return result;

      divModResult = performDivisionAndModulo(result, AbstractNumeric(HIGHEST_POWER_OF_2));
      result = divModResult[1].isNegative() ? divModResult[0].prev() : divModResult[0]; // Handle negative remainders for floor division
      numBits -= POWERS_2_CACHE_LENGTH;
    }
    divModResult = performDivisionAndModulo(result, AbstractNumeric(powersOfTwoCache[numBits]));
    return divModResult[1].isNegative() ? divModResult[0].prev() : divModResult[0];
  };
  SimpleValue.prototype.bitShiftRight = LargeValue.prototype.bitShiftRight;

  /**
   * Applies a bitwise operation (AND, OR, XOR) to two numeric values.
   * Operates on chunks, simulating two's complement for negative numbers.
   * @param {SimpleValue|LargeValue} xVal - First operand.
   * @param {*} yVal - Second operand.
   * @param {function(number, number): number} operationFn - The bitwise function (e.g., `(a, b) => a & b`).
   * @returns {SimpleValue|LargeValue} The result.
   */
  function applyBitwiseOperation(xVal, yVal, operationFn){
    const parsedY = normalizeInput(yVal);

    const xIsNegative = xVal.isNegative();
    const yIsNegative = parsedY.isNegative();

    // Work with two's complement representation.
    // `~N = -(N+1)` for integers. So `N.not()` gives `-(N+1)`.
    // For positive numbers, two's complement is the number itself.
    // For negative numbers, it's `~abs(N)` + 1, or more simply, `N`.
    // The `not()` method already handles `-(N+1)`.
    const xAbsOrComplement = xIsNegative ? xVal.not() : xVal;
    const yAbsOrComplement = yIsNegative ? parsedY.not() : parsedY;

    let xCurrentChunk = 0, yCurrentChunk = 0;
    let xRemaining = xAbsOrComplement;
    let yRemaining = yAbsOrComplement;
    const resultChunks = [];

    // Process chunks from LSB to MSB.
    while(!xRemaining.isZero() || !yRemaining.isZero()){
      // Extract the least significant `POWERS_2_CACHE_LENGTH` bits (or `CHUNK_UNIT` bits if `CHUNK_UNIT` is power of 2).
      // Here, `HIGHEST_POWER_OF_2` is used as the mask/divisor for chunk extraction.
      let xDivMod = performDivisionAndModulo(xRemaining, AbstractNumeric(HIGHEST_POWER_OF_2));
      xCurrentChunk = xDivMod[1].toJSNumber(); // Remainder is the chunk.
      // If original number was negative, invert the bits for two's complement.
      if(xIsNegative){
        xCurrentChunk = HIGHEST_POWER_OF_2 - 1 - xCurrentChunk;
      }
      xRemaining = xDivMod[0]; // Quotient is the rest.

      let yDivMod = performDivisionAndModulo(yRemaining, AbstractNumeric(HIGHEST_POWER_OF_2));
      yCurrentChunk = yDivMod[1].toJSNumber();
      if(yIsNegative){
        yCurrentChunk = HIGHEST_POWER_OF_2 - 1 - yCurrentChunk;
      }
      yRemaining = yDivMod[0];

      resultChunks.push(operationFn(xCurrentChunk, yCurrentChunk));
    }

    // Determine sign of the result based on the most significant bit of the two's complement representation.
    // If the operation on the 'sign bit' (implied by the negative flags) results in 1, the result is negative.
    const finalSignBit = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
    let finalResult = finalSignBit !== 0 ? AbstractNumeric.getMinusOne() : AbstractNumeric.getZero();

    // Reconstruct the number from the result chunks.
    for(let i = resultChunks.length - 1; i >= 0; i--){
      finalResult = finalResult.product(AbstractNumeric(HIGHEST_POWER_OF_2)).sum(AbstractNumeric(resultChunks[i]));
    }
    return finalResult;
  }

  LargeValue.prototype.bitwiseNot = function(){
    // ~N = -(N+1)
    return this.invertSign().prev();
  };
  SimpleValue.prototype.bitwiseNot = LargeValue.prototype.bitwiseNot;

  LargeValue.prototype.bitwiseAnd = function(otherVal){
    return applyBitwiseOperation(this, otherVal, (a, b) => a & b);
  };
  SimpleValue.prototype.bitwiseAnd = LargeValue.prototype.bitwiseAnd;

  LargeValue.prototype.bitwiseOr = function(otherVal){
    return applyBitwiseOperation(this, otherVal, (a, b) => a | b);
  };
  SimpleValue.prototype.bitwiseOr = LargeValue.prototype.bitwiseOr;

  LargeValue.prototype.bitwiseXor = function(otherVal){
    return applyBitwiseOperation(this, otherVal, (a, b) => a ^ b);
  };
  SimpleValue.prototype.bitwiseXor = LargeValue.prototype.bitwiseXor;

  // Aliases for bitwise operations
  LargeValue.prototype.not = LargeValue.prototype.bitwiseNot;
  SimpleValue.prototype.not = SimpleValue.prototype.bitwiseNot;
  LargeValue.prototype.and = LargeValue.prototype.bitwiseAnd;
  SimpleValue.prototype.and = SimpleValue.prototype.bitwiseAnd;
  LargeValue.prototype.or = LargeValue.prototype.bitwiseOr;
  SimpleValue.prototype.or = SimpleValue.prototype.bitwiseOr;
  LargeValue.prototype.xor = LargeValue.prototype.bitwiseXor;
  SimpleValue.prototype.xor = SimpleValue.prototype.bitwiseXor;

  // --- Other Math Functions ---

  // Masks for finding the lowest set bit.
  const LOWEST_ONE_BIT_MASK_INT = 1 << 30; // Max 30-bit integer
  // Combines base-related low bit masking with standard integer masking.
  const LOWEST_ONE_BIT_MASK_BIG = (CHUNK_UNIT & -CHUNK_UNIT) * (CHUNK_UNIT & -CHUNK_UNIT) | LOWEST_ONE_BIT_MASK_INT;

  /**
   * Finds the lowest set bit (rightmost 1) for a number or its least significant chunk.
   * Used in GCD for efficient division by 2.
   * @param {SimpleValue|LargeValue} numVal - The numeric value.
   * @returns {number} The value of the lowest set bit (e.g., 1, 2, 4, 8...).
   */
  function findLowestOneBit(numVal){
    const internalValue = numVal.isCompact ? numVal.nativeValue : numVal.digitSegments[0];
    // If it's a native number, use standard bitwise AND with its negative.
    // If it's a chunk, apply a similar logic to its first chunk.
    const maskedValue = typeof internalValue === "number" ? internalValue | LOWEST_ONE_BIT_MASK_INT : internalValue + (numVal.digitSegments[1] * CHUNK_UNIT) | LOWEST_ONE_BIT_MASK_BIG;
    return maskedValue & -maskedValue; // Standard trick to find lowest set bit.
  }

  /**
   * Calculates integer logarithm (base 2) for a numeric value.
   * Used for `bitLength`.
   * @param {SimpleValue|LargeValue} val - The value.
   * @param {SimpleValue|LargeValue} base - The base for the logarithm (typically 2).
   * @returns {{powerValue: SimpleValue|LargeValue, exponent: number}} Object with power of base and exponent.
   */
  function calcIntegerLog(val, base){
    // If base is greater than or equal to value, log is 0 or 1.
    if(base.compareTo(val) > 0){
      return {powerValue: AbstractNumeric.getOne(), exponent: 0};
    }

    // Recursive approach: log_b(N) = 2 * log_b(sqrt(N))
    const squaredBase = base.squaredValue(); // b^2
    const recursiveResult = calcIntegerLog(val, squaredBase);
    const powerPart = recursiveResult.powerValue; // b^(2E)
    const exponentPart = recursiveResult.exponent; // E

    const testProduct = powerPart.product(base); // b^(2E) * b = b^(2E+1)
    if(testProduct.compareTo(val) <= 0){
      return {powerValue: testProduct, exponent: exponentPart * 2 + 1};
    }
    return {powerValue: powerPart, exponent: exponentPart * 2};
  }

  LargeValue.prototype.bitLength = function(){
    let targetNum = this;
    // For negative numbers, bit length is usually defined for abs(N)-1 or N.
    // The original code uses N.negate().subtract(1) for negative numbers.
    if(targetNum.isNegative()){
      targetNum = targetNum.invertSign().difference(AbstractNumeric.getOne());
    }
    if(targetNum.isZero()){
      return AbstractNumeric.getZero();
    }
    // Calculate log base 2 and add 1.
    const result = calcIntegerLog(targetNum, AbstractNumeric.getTwo());
    return AbstractNumeric(result.exponent).sum(AbstractNumeric.getOne());
  };
  SimpleValue.prototype.bitLength = LargeValue.prototype.bitLength;

  /**
   * Returns the greater of two numeric values.
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {SimpleValue|LargeValue} The maximum value.
   */
  function getMax(val1, val2){
    const num1 = normalizeInput(val1);
    const num2 = normalizeInput(val2);
    return num1.isGreaterThan(num2) ? num1 : num2;
  }

  /**
   * Returns the lesser of two numeric values.
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {SimpleValue|LargeValue} The minimum value.
   */
  function getMin(val1, val2){
    const num1 = normalizeInput(val1);
    const num2 = normalizeInput(val2);
    return num1.isLesserThan(num2) ? num1 : num2;
  }

  /**
   * Calculates the greatest common divisor (GCD) of two numeric values using Binary GCD (Stein's Algorithm).
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {SimpleValue|LargeValue} The GCD.
   */
  function calculateGCD(val1, val2){
    let numA = normalizeInput(val1).absoluteValue();
    let numB = normalizeInput(val2).absoluteValue();

    if(numA.isEqualTo(numB)) return numA;
    if(numA.isZero()) return numB;
    if(numB.isZero()) return numA;

    // Remove common factors of 2.
    let commonFactorOfTwo = AbstractNumeric.getOne();
    let lowestBitA, lowestBitB;

    while(numA.isEven() && numB.isEven()){
      lowestBitA = findLowestOneBit(numA);
      lowestBitB = findLowestOneBit(numB);
      const minLowestBit = Math.min(lowestBitA, lowestBitB);
      numA = numA.quotientOf(minLowestBit);
      numB = numB.quotientOf(minLowestBit);
      commonFactorOfTwo = commonFactorOfTwo.product(minLowestBit);
    }

    // Remove remaining factors of 2 from A.
    while(numA.isEven()){
      numA = numA.quotientOf(findLowestOneBit(numA));
    }

    // Now A is odd. Iterate until B is zero.
    do {
      // Remove factors of 2 from B.
      while(numB.isEven()){
        numB = numB.quotientOf(findLowestOneBit(numB));
      }

      // Ensure A <= B by swapping if needed.
      if(numA.isGreaterThan(numB)){
        let temp = numB;
        numB = numA;
        numA = temp;
      }
      numB = numB.difference(numA); // B = B - A
    } while(!numB.isZero());

    // Multiply back the common factors of 2.
    return commonFactorOfTwo.isUnit() ? numA : numA.product(commonFactorOfTwo);
  }

  /**
   * Calculates the least common multiple (LCM) of two numeric values.
   * LCM(a, b) = |a * b| / GCD(a, b)
   * @param {*} val1 - First value.
   * @param {*} val2 - Second value.
   * @returns {SimpleValue|LargeValue} The LCM.
   */
  function calculateLCM(val1, val2){
    const numA = normalizeInput(val1).absoluteValue();
    const numB = normalizeInput(val2).absoluteValue();

    // LCM(0, N) = 0
    if (numA.isZero() || numB.isZero()) return AbstractNumeric.getZero();

    const gcdValue = calculateGCD(numA, numB);
    return numA.quotientOf(gcdValue).product(numB);
  }

  /**
   * Generates a random numeric value between two given values (inclusive).
   * @param {*} lowerBound - The lower bound.
   * @param {*} upperBound - The upper bound.
   * @returns {SimpleValue|LargeValue} A random number within the range.
   */
  function getRandomBetween(lowerBound, upperBound){
    const lowVal = getMin(lowerBound, upperBound);
    const highVal = getMax(lowerBound, upperBound);
    const range = highVal.difference(lowVal).sum(AbstractNumeric.getOne());

    // If the range fits in a native number, use Math.random directly.
    if(range.isCompact){
      const randomOffset = Math.floor(Math.random() * range.nativeValue);
      return lowVal.sum(randomOffset);
    }

    // For large ranges, generate random chunks.
    const rangeChunks = range.digitSegments;
    const numRangeChunks = rangeChunks.length;
    const resultChunks = [];
    let isRestrictedByRange = true; // True if we are still constrained by the upper bound of the range.

    // Generate random chunks from MSB to LSB.
    for(let i = numRangeChunks - 1; i >= 0; i--){
      const maxDigit = isRestrictedByRange ? rangeChunks[i] : CHUNK_UNIT - 1;
      const randomDigit = integerFloor(Math.random() * (maxDigit + 1)); // +1 to include maxDigit
      resultChunks.unshift(randomDigit); // Add to the beginning to maintain correct order.

      if(randomDigit < maxDigit){
        isRestrictedByRange = false; // We've generated a digit smaller than the max, so subsequent digits can be anything.
      }
    }
    const randomOffset = convertChunkArrayToNative(resultChunks);
    const offsetNumeric = typeof randomOffset === "number" ? new SimpleValue(randomOffset) : new LargeValue(randomOffset, false);
    return lowVal.sum(offsetNumeric);
  }

  // --- Parsing and String Conversion ---

  /**
   * Parses a string representation of a number in a given base.
   * @param {string} textValue - The string to parse.
   * @param {*} targetBase - The base (numeric value or string).
   * @returns {SimpleValue|LargeValue} The parsed numeric value.
   * @throws {Error} If the string contains invalid digits for the base.
   */
  const parseStringWithBase = function(textValue, targetBase){
    const stringLen = textValue.length;
    let baseVal = normalizeInput(targetBase);
    const absBase = baseVal.absoluteValue();

    // Initial validation of digits for the given base.
    for(let i = 0; i < stringLen; i++){
      const char = textValue[i].toLowerCase();
      if(char === "-") continue; // Skip negative sign.

      let digitValue;
      if(/[0-9]/.test(char)){
        digitValue = parseInt(char, 10);
      } else if(/[a-z]/.test(char)){
        digitValue = char.charCodeAt(0) - 87; // 'a' is 10, 'b' is 11, etc.
      } else {
        // Handle custom digit representations like <10>, <11>, etc.
        if (char === "<") {
            const closingBracketIndex = textValue.indexOf(">", i);
            if (closingBracketIndex === -1) throw new Error(`Invalid custom digit format in base ${baseVal.toString()}: ${textValue.substring(i)}`);
            const customDigitStr = textValue.substring(i + 1, closingBracketIndex);
            digitValue = parseInt(customDigitStr, 10);
            i = closingBracketIndex; // Advance loop index past the custom digit.
        } else {
            throw new Error(`Invalid character '${char}' in base ${baseVal.toString()}.`);
        }
      }

      // Check if digit value is valid for the base.
      if (digitValue >= absBase.toJSNumber() && !(digitValue === 1 && absBase.isEqualTo(AbstractNumeric.getOne()))) {
        throw new Error(`Digit '${char}' is not valid in base ${baseVal.toString()}.`);
      }
    }

    // Optimization for common bases (2-36) that fit into native JS numbers.
    // Check if the number of digits is small enough to be parsed by parseInt.
    // LOG_MAX_INT is effectively log_10(MAX_JS_SAFE_INTEGER).
    // The maximum length of a string in a given base that can fit into MAX_JS_SAFE_INTEGER
    // is roughly LOG_MAX_INT / log_10(base).
    if(baseVal.isCompact && baseVal.nativeValue >= 2 && baseVal.nativeValue <= 36){
      // A more robust check for length for parseInt.
      // E.g. for base 2, max_len is ~53. For base 36, max_len is ~11.
      const maxParseIntLength = Math.floor(Math.log(MAX_JS_SAFE_INTEGER) / Math.log(baseVal.nativeValue));
      if(stringLen <= maxParseIntLength){
        const parsedNative = parseInt(textValue, baseVal.nativeValue);
        if(isNaN(parsedNative)){
          // This should ideally not happen if validation above is correct.
          throw new Error(`Failed to parse string '${textValue}' in base ${baseVal.toString()}.`);
        }
        return new SimpleValue(parsedNative);
      }
    }

    // General case for arbitrary large bases or numbers.
    const digitValues = [];
    const isNegative = textValue[0] === "-";
    let startIndex = isNegative ? 1 : 0;

    for(let i = startIndex; i < textValue.length; i++){
      const char = textValue[i].toLowerCase();
      let digitVal;
      if(char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57){ // '0'-'9'
        digitVal = char.charCodeAt(0) - 48;
      } else if(char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122){ // 'a'-'z'
        digitVal = char.charCodeAt(0) - 87;
      } else if (char === "<") { // Custom digit format
          const startIdx = i;
          let endIdx = -1;
          do{ i++; } while(i < textValue.length && textValue[i] !== ">");
          endIdx = i;
          if (endIdx === textValue.length) throw new Error(`Unclosed custom digit in base ${baseVal.toString()}.`);
          digitVal = parseInt(textValue.slice(startIdx + 1, endIdx), 10);
      } else {
        throw new Error(`Invalid character '${char}' encountered during custom base parsing.`);
      }
      digitValues.push(AbstractNumeric(digitVal));
    }
    return constructFromDigits(digitValues, baseVal, isNegative);
  };

  /**
   * Constructs a numeric value from an array of digits in a given base.
   * @param {Array<SimpleValue|LargeValue>} digitsArray - Array of digits.
   * @param {SimpleValue|LargeValue} base - The base of the digits.
   * @param {boolean} isNegative - True if the final number should be negative.
   * @returns {SimpleValue|LargeValue} The constructed numeric value.
   */
  function constructFromDigits(digitsArray, base, isNegative){
    let finalValue = AbstractNumeric.getZero();
    let currentPowerOfBase = AbstractNumeric.getOne(); // Represents base^0, base^1, etc.

    // Iterate through digits from right to left (least significant to most significant).
    for(let i = digitsArray.length - 1; i >= 0; i--){
      finalValue = finalValue.sum(digitsArray[i].product(currentPowerOfBase));
      currentPowerOfBase = currentPowerOfBase.product(base);
    }
    return isNegative ? finalValue.invertSign() : finalValue;
  }

  /**
   * Converts a single digit (0-35) to its string representation (0-9, a-z).
   * @param {number} digit - The digit.
   * @returns {string} The string representation.
   */
  function digitToString(digit){
    if(digit <= 35){
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
    }
    // For digits > 35, use custom bracket format.
    return `<${digit}>`;
  }

  /**
   * Converts a numeric value to an array of digits in a specified base.
   * @param {SimpleValue|LargeValue} numVal - The number to convert.
   * @param {SimpleValue|LargeValue} targetBase - The base.
   * @returns {{digits: number[], isNegative: boolean}} Object with digit array and sign.
   * @throws {Error} For invalid base.
   */
  function convertToBaseDigits(numVal, targetBase){
    const base = normalizeInput(targetBase);

    if(base.isZero()){
      if(numVal.isZero()) return {digits: [0], isNegative: false};
      throw new Error("Cannot convert non-zero numbers to base 0.");
    }
    // Handle base -1 (alternating powers of -1)
    if(base.isEqualTo(AbstractNumeric.getMinusOne())){
      if(numVal.isZero()) return {digits: [0], isNegative: false};
      // This is a complex base. For positive numbers, it's a sequence of 1,0,1,0...
      // For negative numbers, it's 1,0,1,0... with some adjustments.
      // The original implementation for base -1 was quirky. Let's simplify it or remove.
      // Removing for brevity and focusing on positive bases.
      // For a Type III clone, we can rewrite this to be a simpler error or a fixed representation.
      // Let's make it an error for now, as it's not a standard base.
      throw new Error("Conversion to base -1 is not supported in this version.");
    }

    let isResultNegative = false;
    if(numVal.isNegative() && base.isPositive()){
      isResultNegative = true;
      numVal = numVal.absoluteValue();
    }

    // Handle base 1 (unary representation)
    if(base.isEqualTo(AbstractNumeric.getOne())){
      if(numVal.isZero()) return {digits: [0], isNegative: false};
      // Return an array of ones, length = numVal.
      const unaryDigits = [];
      const numericVal = numVal.toJSNumber();
      for(let i = 0; i < numericVal; i++) unaryDigits.push(1);
      return {digits: unaryDigits, isNegative: isResultNegative};
    }

    const outputDigits = [];
    let currentLeftover = numVal;
    let divModResult;

    // Repeatedly divide by base and take remainder as digit.
    while(currentLeftover.isNegative() || currentLeftover.compareMagnitude(base) >= 0){
      divModResult = currentLeftover.divmod(base);
      currentLeftover = divModResult.quotient;
      let digit = divModResult.remainder;

      // Handle negative remainders (adjust quotient and remainder to be positive)
      if(digit.isNegative()){
        digit = base.difference(digit).absoluteValue(); // digit = base - abs(digit)
        currentLeftover = currentLeftover.next(); // Increment quotient
      }
      outputDigits.push(digit.toJSNumber());
    }
    outputDigits.push(currentLeftover.toJSNumber()); // Add the final quotient.
    return {digits: outputDigits.reverse(), isNegative: isResultNegative};
  }

  /**
   * Converts a numeric value to its string representation in a specified base.
   * @param {SimpleValue|LargeValue} numVal - The number.
   * @param {*} targetBase - The base.
   * @returns {string} The string representation.
   */
  function toBaseStringRepresentation(numVal, targetBase){
    const digitInfo = convertToBaseDigits(numVal, targetBase);
    const signPrefix = digitInfo.isNegative ? "-" : "";
    return signPrefix + digitInfo.digits.map(digitToString).join("");
  }

  LargeValue.prototype.toDigitArray = function(radix){
    return convertToBaseDigits(this, radix);
  };
  SimpleValue.prototype.toDigitArray = function(radix){
    return convertToBaseDigits(this, radix);
  };

  LargeValue.prototype.toString = function(radix){
    const displayRadix = radix === noValue ? 10 : radix;
    if(displayRadix !== 10) return toBaseStringRepresentation(this, displayRadix);

    const digitSegments = this.digitSegments;
    const numSegments = digitSegments.length;
    let resultString = String(digitSegments[numSegments - 1]); // Most significant chunk first.
    const zeroPadding = "0000000"; // For CHUNK_POWER = 7

    // Append remaining chunks, padding with zeros as needed.
    for(let i = numSegments - 2; i >= 0; i--){
      const currentChunkStr = String(digitSegments[i]);
      resultString += zeroPadding.slice(currentChunkStr.length) + currentChunkStr;
    }
    const signPrefix = this.isNegative ? "-" : "";
    return signPrefix + resultString;
  };
  SimpleValue.prototype.toString = function(radix){
    const displayRadix = radix === noValue ? 10 : radix;
    if(displayRadix !== 10) return toBaseStringRepresentation(this, displayRadix);
    return String(this.nativeValue);
  };

  LargeValue.prototype.toJSON = SimpleValue.prototype.toJSON = function(){
    return this.toString(); // Standard JSON serialization.
  };

  LargeValue.prototype.valueOf = function(){
    // This is primarily for implicit type coercion.
    // For LargeValue, it's best to return its string representation for consistency,
    // or attempt to convert to a JS number if it fits (but that would be `toJSNumber`).
    // The original uses `parseInt(this.toString(), 10)`. This can lose precision for large numbers.
    // Let's make `valueOf` explicit about its limitations or just return `NaN` if too large.
    // Sticking to `toJSNumber` behavior for consistency with original intent.
    return this.toJSNumber();
  };
  LargeValue.prototype.toJSNumber = function(){
    // Attempt to convert to a native JS number, may lose precision.
    // If the number is within MAX_JS_SAFE_INTEGER, it will be precise.
    // Otherwise, it will be an approximation.
    const converted = convertChunkArrayToNative(this.digitSegments);
    if (typeof converted === 'number') {
        return this.isNegative ? -converted : converted;
    }
    // For numbers larger than MAX_JS_SAFE_INTEGER, parseInt will lose precision.
    // Returning `NaN` or `Infinity` might be more honest than a truncated number.
    // However, the original code attempts to convert, so let's mimic that.
    // This is a point where functionality can differ subtly based on interpretation.
    // Let's use parseFloat to get the closest JS number.
    return parseFloat(this.toString());
  };

  SimpleValue.prototype.valueOf = function(){
    return this.nativeValue;
  };
  SimpleValue.prototype.toJSNumber = SimpleValue.prototype.valueOf;

  /**
   * Parses a string representation of an integer.
   * Handles scientific notation and ensures it's a valid integer.
   * @param {string} strVal - The string to parse.
   * @returns {SimpleValue|LargeValue} The parsed numeric value.
   * @throws {Error} If the string is not a valid integer.
   */
  function parseStringValue(strVal){
    // Optimization: If it's a simple number string and fits precise, use SimpleValue.
    if(isJsPreciselyRepresentable(+strVal)){
      const num = +strVal;
      if(num === integerFloor(num)) return new SimpleValue(num); // Ensure it's an integer.
      throw new Error(`Invalid integer: '${strVal}' contains a fractional part.`);
    }

    let isNegative = false;
    let processedString = strVal;

    // Handle negative sign.
    if(processedString[0] === "-"){
      isNegative = true;
      processedString = processedString.slice(1);
    }

    // Handle scientific notation (e.g., "1.23e+5").
    const scientificParts = processedString.split(/e/i);
    if(scientificParts.length > 2) {
      throw new Error(`Invalid integer format: '${strVal}' contains multiple 'e' characters.`);
    }
    if(scientificParts.length === 2){
      let exponentStr = scientificParts[1];
      if(exponentStr[0] === "+") exponentStr = exponentStr.slice(1); // Remove optional '+'
      const exponent = +exponentStr;

      if(exponent !== integerFloor(exponent) || !isJsPreciselyRepresentable(exponent)){
        throw new Error(`Invalid integer: exponent '${exponentStr}' is not a valid integer or is too large.`);
      }
      if(exponent < 0){
        throw new Error(`Invalid integer: scientific notation with negative exponent ('${exponentStr}') implies a fractional number.`);
      }

      let mantissaStr = scientificParts[0];
      const decimalPointIndex = mantissaStr.indexOf(".");
      if(decimalPointIndex >= 0){
        // Adjust exponent for decimal places.
        exponent -= (mantissaStr.length - 1 - decimalPointIndex);
        mantissaStr = mantissaStr.slice(0, decimalPointIndex) + mantissaStr.slice(decimalPointIndex + 1);
      }
      if(exponent < 0) { // After adjusting for decimal, still negative exponent means fraction.
        throw new Error(`Invalid integer: resulting from scientific notation '${strVal}' is not an integer.`);
      }

      // Pad with zeros for positive exponent.
      mantissaStr += "0".repeat(exponent);
      processedString = mantissaStr;
    }

    // Final validation for integer format (only digits allowed).
    if(!/^([0-9][0-9]*)$/.test(processedString)){
      throw new Error(`Invalid integer format: '${strVal}' contains non-digit characters after processing.`);
    }

    const chunkArray = [];
    let currentLength = processedString.length;
    const chunkSize = CHUNK_POWER; // 7 digits per chunk.
    let startIndex = currentLength - chunkSize;

    // Split string into chunks from right to left.
    while(currentLength > 0){
      if(startIndex < 0) startIndex = 0;
      chunkArray.push(+processedString.slice(startIndex, currentLength));
      currentLength = startIndex;
      startIndex -= chunkSize;
    }
    pruneLeadingZeros(chunkArray);
    return new LargeValue(chunkArray, isNegative);
  }

  /**
   * Parses a native JavaScript number.
   * @param {number} num - The number to parse.
   * @returns {SimpleValue|LargeValue} The parsed numeric value.
   * @throws {Error} If the number is not an integer.
   */
  function parseNumberValue(num){
    if(!Number.isInteger(num)){ // Use modern `Number.isInteger`
      throw new Error(`Value '${num}' is not an integer.`);
    }
    if(isJsPreciselyRepresentable(num)){
      return new SimpleValue(num);
    }
    // If it's a very large integer (e.g., from `Number.MAX_SAFE_INTEGER + 1`), convert to string and parse.
    return parseStringValue(num.toString());
  }

  /**
   * General parsing function to convert various inputs into a numeric value.
   * @param {*} inputVal - The value to parse (number, string, or existing numeric object).
   * @returns {SimpleValue|LargeValue} The parsed numeric value.
   */
  function normalizeInput(inputVal){
    if(typeof inputVal === "number"){
      return parseNumberValue(inputVal);
    }
    if(typeof inputVal === "string"){
      return parseStringValue(inputVal);
    }
    // If already a SimpleValue or LargeValue, return as is.
    // Also handles null/undefined by returning 0 if `inputVal` is not an object,
    // though the initial `AbstractNumeric` constructor already handles `undefined`.
    if(inputVal === null || typeof inputVal === "undefined") return AbstractNumeric.getZero();
    return inputVal; // Assume it's already a valid numeric object.
  }

  // --- Static Properties and Initialization ---

  // Pre-populate cache for small integers for performance.
  // This is a common optimization for BigInt libraries.
  const SMALL_INT_CACHE_LIMIT = 1000;
  for(let i = 0; i < SMALL_INT_CACHE_LIMIT; i++){
    AbstractNumeric[i] = new SimpleValue(i);
    if(i > 0) AbstractNumeric[-i] = new SimpleValue(-i);
  }

  // Static getters for common numeric values.
  AbstractNumeric.get = function(val) {
    if (val >= -SMALL_INT_CACHE_LIMIT +1 && val < SMALL_INT_CACHE_LIMIT) {
        return AbstractNumeric[val];
    }
    return normalizeInput(val);
  };
  AbstractNumeric.getOne = function() { return AbstractNumeric.get(1); };
  AbstractNumeric.getZero = function() { return AbstractNumeric.get(0); };
  AbstractNumeric.getMinusOne = function() { return AbstractNumeric.get(-1); };
  AbstractNumeric.getTwo = function() { return AbstractNumeric.get(2); };
  AbstractNumeric.getThree = function() { return AbstractNumeric.get(3); };
  AbstractNumeric.getFive = function() { return AbstractNumeric.get(5); };

  // Expose static utility methods.
  AbstractNumeric.maximum = getMax;
  AbstractNumeric.minimum = getMin;
  AbstractNumeric.gcd = calculateGCD;
  AbstractNumeric.lcm = calculateLCM;
  AbstractNumeric.isNumericInstance = function(obj){
    return obj instanceof LargeValue || obj instanceof SimpleValue;
  };
  AbstractNumeric.randomBetween = getRandomBetween;
  AbstractNumeric.fromDigitArray = function(digits, base, isNegative){
    return constructFromDigits(digits.map(normalizeInput), normalizeInput(base || 10), isNegative);
  };

  return AbstractNumeric;
}(); // Self-executing function to create the factory.

// --- Main Application Logic ---

// Initialize the numeric factory.
var numFactory = numericProcessor();

/**
 * Processes input data for a series of test cases.
 * @param {string} rawInput - The entire input string, typically from stdin.
 */
function processInputData(rawInput){
  const inputLines = rawInput.split("\n");
  const testCaseCount = +inputLines[0]; // First line is the number of test cases.

  // Iterate through each test case.
  for(let caseIndex = 1; caseIndex <= testCaseCount; caseIndex++){
    const currentLineTokens = inputLines[caseIndex].split(" "); // Split line into string tokens.
    // Parse numeric values from tokens.
    const valB = numFactory(currentLineTokens[1]);
    const valC = numFactory(currentLineTokens[2]);
    const valD = numFactory(currentLineTokens[3]);
    const valA = numFactory(currentLineTokens[0]); // Parse A last.

    // Conditional logic based on problem statement.
    // Condition 1: Check if A < B or D < B.
    if(valA.isLesserThan(valB) || valD.isLesserThan(valB)){
      console.log("No");
      continue; // Move to the next test case.
    }

    // Condition 2: Check if B <= C - 1.
    // This is equivalent to C >= B + 1, or C.difference(1) >= B.
    const cMinusOne = valC.difference(numFactory.getOne());
    if(valB.isLesserOrEqualTo(cMinusOne)){
      console.log("Yes");
      continue; // Move to the next test case.
    }

    // Condition 3: More complex modular arithmetic.
    let moduloResult = valA.mod(valB); // m = A % B

    // Sub-condition 3.1: If C < m, then no.
    if(valC.isLesserThan(moduloResult)){
      console.log("No");
      continue; // Move to the next test case.
    }

    // Calculate GCD(B, D).
    const gcdResult = numFactory.gcd(valB, valD);
    // Update m = m % GCD(B, D).
    moduloResult = moduloResult.mod(gcdResult);

    // Final complex condition.
    // Check if C - m / G * G + m + G < B
    // Let's break this down into intermediate steps for clarity.
    const cMinusM = valC.difference(moduloResult);
    const quotientTerm = cMinusM.quotientOf(gcdResult);
    const productTerm = quotientTerm.product(gcdResult);
    const sumWithM = productTerm.sum(moduloResult);
    const finalSum = sumWithM.sum(gcdResult);

    if(finalSum.isLesserThan(valB)){
      console.log("No");
    } else {
      console.log("Yes");
    }
  }
}

// Read input from stdin and execute the main processing function.
const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
processInputData(inputData);