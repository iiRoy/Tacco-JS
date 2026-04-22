"use strict";
// Input processing utility class
function InputReader(inputString, parserFunction) {
  // Store input lines
  this._lineArray = inputString.split("\n");
  // Current element index within the line
  this._colIndex = 0;
  // Current line index
  this._rowIndex = 0;
  // Function to convert string values
  this._valueConverter = parserFunction || Number;
}

InputReader.prototype.getNextValue = function () {
  // Retrieve the current line
  let currentLine = this._lineArray[this._rowIndex];
  if (!currentLine) {
    return; // No more lines
  }
  // Split line into tokens and get the current element
  let tokenArray = currentLine.trim().split(" ");
  let currentElement = tokenArray[this._colIndex];
  this._colIndex++; // Advance to the next column

  // If all elements in the current line are processed, move to the next line
  if (tokenArray.length === this._colIndex) {
    this._colIndex = 0;
    this._rowIndex++;
  }
  // Convert and return the element
  return this._valueConverter(currentElement);
};

InputReader.prototype.getLineValues = function () {
  // Get the current line content
  let targetLine = this._lineArray[this._rowIndex];
  if (!targetLine) {
    return; // No line available
  }
  this._colIndex = 0; // Reset column index
  this._rowIndex++; // Move to the next row
  // Split the line by space and convert each part
  return targetLine.split(" ").map(this._valueConverter);
};

module.exports = InputReader;

// Start of the large number arithmetic library
var largeNumber = (function (undefined) {
  "use strict";
  // Constants for internal representation
  var NUM_BASE = 1e7,
    BASE_LOG = 7,
    MAX_PRECISE_NUM = 9007199254740992, // Maximum safe integer in JS
    MAX_PRECISE_ARRAY = decomposeSmall(MAX_PRECISE_NUM), // Array representation of MAX_PRECISE_NUM
    STANDARD_ALPHA = "0123456789abcdefghijklmnopqrstuvwxyz"; // Default alphabet for base conversions

  // Check for native BigInt support
  var hasNativeBigIntSupport = typeof BigInt === "function";

  // Base constructor for all numeric entities
  function NumericEntity(val, baseRadix, alphaChars, caseSensitivity) {
    if (typeof val === "undefined") {
      return NumericEntity[0]; // Return zero if no value provided
    }
    if (typeof baseRadix !== "undefined") {
      // Handle base conversion if radix is specified
      return +baseRadix === 10 && !alphaChars
        ? interpretInput(val)
        : parseByBase(val, baseRadix, alphaChars, caseSensitivity);
    }
    return interpretInput(val); // Parse the input value
  }

  // Constructor for large number arrays
  function ExtendedNumeric(valArray, isNegative) {
    this.value = valArray;
    this.sign = isNegative; // true if negative, false if positive/zero
    this.isSmall = false; // Not a compact numeric
  }
  ExtendedNumeric.prototype = Object.create(NumericEntity.prototype);

  // Constructor for small integer numbers
  function CompactNumeric(val) {
    this.value = val;
    this.sign = val < 0; // true if negative
    this.isSmall = true; // Is a compact numeric
  }
  CompactNumeric.prototype = Object.create(NumericEntity.prototype);

  // Constructor for native BigInt (if supported)
  function PlatformNumeric(val) {
    this.value = val;
  }
  PlatformNumeric.prototype = Object.create(NumericEntity.prototype);

  // Helper to check if a number is within JS's safe integer range
  function isExact(num) {
    return -MAX_PRECISE_NUM < num && num < MAX_PRECISE_NUM;
  }

  // Converts a small number into its array representation based on NUM_BASE
  function decomposeSmall(num) {
    if (num < 1e7) return [num];
    if (num < 1e14) return [num % 1e7, Math.floor(num / 1e7)];
    return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
  }

  // Converts an array representation back to a small number if possible
  function composeSmall(arr) {
    normalizeArray(arr); // Remove leading zeros
    var length = arr.length;
    if (length < 4 && compareAbsoluteValues(arr, MAX_PRECISE_ARRAY) < 0) {
      switch (length) {
        case 0:
          return 0;
        case 1:
          return arr[0];
        case 2:
          return arr[0] + arr[1] * NUM_BASE;
        default:
          return arr[0] + (arr[1] + arr[2] * NUM_BASE) * NUM_BASE;
      }
    }
    return arr;
  }

  // Removes leading zeros from an array of digits
  function normalizeArray(digitArray) {
    var i = digitArray.length;
    while (digitArray[--i] === 0 && i >= 0); // Find the last non-zero digit
    digitArray.length = i + 1; // Trim the array
  }

  // Creates a new array filled with zeros
  function makeZeroArray(len) {
    var newArray = new Array(len);
    var i = -1;
    while (++i < len) {
      newArray[i] = 0;
    }
    return newArray;
  }

  // Truncates a number (floor for positive, ceil for negative)
  function floorOrCeil(num) {
    if (num > 0) return Math.floor(num);
    return Math.ceil(num);
  }

  // Adds two arrays of digits (representing positive numbers)
  function addElements(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      resultArray = new Array(lenA),
      carryOver = 0,
      baseVal = NUM_BASE,
      sumValue,
      idx;
    for (idx = 0; idx < lenB; idx++) {
      sumValue = arrA[idx] + arrB[idx] + carryOver;
      carryOver = sumValue >= baseVal ? 1 : 0;
      resultArray[idx] = sumValue - carryOver * baseVal;
    }
    while (idx < lenA) {
      sumValue = arrA[idx] + carryOver;
      carryOver = sumValue === baseVal ? 1 : 0;
      resultArray[idx++] = sumValue - carryOver * baseVal;
    }
    if (carryOver > 0) resultArray.push(carryOver); // Add final carry if any
    return resultArray;
  }

  // Adds two arrays, ensuring the longer one is first for addElements
  function addFlexible(arrA, arrB) {
    if (arrA.length >= arrB.length) return addElements(arrA, arrB);
    return addElements(arrB, arrA);
  }

  // Adds a small number (carry) to an array of digits
  function addToSmall(arr, carry) {
    var len = arr.length,
      resultArray = new Array(len),
      baseVal = NUM_BASE,
      sumValue,
      idx;
    for (idx = 0; idx < len; idx++) {
      sumValue = arr[idx] - baseVal + carry;
      carry = Math.floor(sumValue / baseVal);
      resultArray[idx] = sumValue - carry * baseVal;
      carry += 1;
    }
    while (carry > 0) {
      resultArray[idx++] = carry % baseVal;
      carry = Math.floor(carry / baseVal);
    }
    return resultArray;
  }

  // Prototype method for addition
  ExtendedNumeric.prototype.combine = function (val) {
    var otherNum = interpretInput(val);
    if (this.sign !== otherNum.sign) {
      return this.deduct(otherNum.invertSign()); // If signs differ, convert to subtraction
    }
    var currentVal = this.value,
      otherVal = otherNum.value;
    if (otherNum.isSmall) {
      return new ExtendedNumeric(addToSmall(currentVal, Math.abs(otherVal)), this.sign);
    }
    return new ExtendedNumeric(addFlexible(currentVal, otherVal), this.sign);
  };
  ExtendedNumeric.prototype.plus = ExtendedNumeric.prototype.combine;

  CompactNumeric.prototype.combine = function (val) {
    var otherNum = interpretInput(val);
    var currentVal = this.value;
    if (currentVal < 0 !== otherNum.sign) {
      return this.deduct(otherNum.invertSign()); // If signs differ, convert to subtraction
    }
    var otherVal = otherNum.value;
    if (otherNum.isSmall) {
      if (isExact(currentVal + otherVal)) return new CompactNumeric(currentVal + otherVal);
      otherVal = decomposeSmall(Math.abs(otherVal)); // Convert small to array for larger sum
    }
    return new ExtendedNumeric(addToSmall(otherVal, Math.abs(currentVal)), currentVal < 0);
  };
  CompactNumeric.prototype.plus = CompactNumeric.prototype.combine;

  PlatformNumeric.prototype.combine = function (val) {
    return new PlatformNumeric(this.value + interpretInput(val).value);
  };
  PlatformNumeric.prototype.plus = PlatformNumeric.prototype.combine;

  // Subtracts two arrays of digits (a - b, assuming a >= b)
  function subtractElements(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      resultArray = new Array(lenA),
      borrowAmt = 0,
      baseVal = NUM_BASE,
      idx,
      diffValue;
    for (idx = 0; idx < lenB; idx++) {
      diffValue = arrA[idx] - borrowAmt - arrB[idx];
      if (diffValue < 0) {
        diffValue += baseVal;
        borrowAmt = 1;
      } else {
        borrowAmt = 0;
      }
      resultArray[idx] = diffValue;
    }
    for (idx = lenB; idx < lenA; idx++) {
      diffValue = arrA[idx] - borrowAmt;
      if (diffValue < 0) diffValue += baseVal;
      else {
        resultArray[idx++] = diffValue;
        break; // No more borrowing needed
      }
      resultArray[idx] = diffValue;
    }
    for (; idx < lenA; idx++) {
      resultArray[idx] = arrA[idx]; // Copy remaining digits
    }
    normalizeArray(resultArray); // Remove leading zeros
    return resultArray;
  }

  // Flexible subtraction for any two arrays
  function subtractFlexible(arrA, arrB, isNegative) {
    var calculatedValue;
    if (compareAbsoluteValues(arrA, arrB) >= 0) {
      calculatedValue = subtractElements(arrA, arrB);
    } else {
      calculatedValue = subtractElements(arrB, arrA);
      isNegative = !isNegative; // Flip sign if B was larger
    }
    calculatedValue = composeSmall(calculatedValue); // Try to convert to small
    if (typeof calculatedValue === "number") {
      if (isNegative) calculatedValue = -calculatedValue;
      return new CompactNumeric(calculatedValue);
    }
    return new ExtendedNumeric(calculatedValue, isNegative);
  }

  // Subtracts a small number from an array of digits
  function subtractFromSmall(arr, smallVal, isNegative) {
    var len = arr.length,
      resultArray = new Array(len),
      carry = -smallVal,
      baseVal = NUM_BASE,
      idx,
      diffValue;
    for (idx = 0; idx < len; idx++) {
      diffValue = arr[idx] + carry;
      carry = Math.floor(diffValue / baseVal);
      diffValue %= baseVal;
      resultArray[idx] = diffValue < 0 ? diffValue + baseVal : diffValue;
    }
    resultArray = composeSmall(resultArray);
    if (typeof resultArray === "number") {
      if (isNegative) resultArray = -resultArray;
      return new CompactNumeric(resultArray);
    }
    return new ExtendedNumeric(resultArray, isNegative);
  }

  // Prototype method for subtraction
  ExtendedNumeric.prototype.deduct = function (val) {
    var otherNum = interpretInput(val);
    if (this.sign !== otherNum.sign) {
      return this.combine(otherNum.invertSign()); // If signs differ, convert to addition
    }
    var currentVal = this.value,
      otherVal = otherNum.value;
    if (otherNum.isSmall) return subtractFromSmall(currentVal, Math.abs(otherVal), this.sign);
    return subtractFlexible(currentVal, otherVal, this.sign);
  };
  ExtendedNumeric.prototype.minus = ExtendedNumeric.prototype.deduct;

  CompactNumeric.prototype.deduct = function (val) {
    var otherNum = interpretInput(val);
    var currentVal = this.value;
    if (currentVal < 0 !== otherNum.sign) {
      return this.combine(otherNum.invertSign()); // If signs differ, convert to addition
    }
    var otherVal = otherNum.value;
    if (otherNum.isSmall) {
      return new CompactNumeric(currentVal - otherVal);
    }
    return subtractFromSmall(otherVal, Math.abs(currentVal), currentVal >= 0);
  };
  CompactNumeric.prototype.minus = CompactNumeric.prototype.deduct;

  PlatformNumeric.prototype.deduct = function (val) {
    return new PlatformNumeric(this.value - interpretInput(val).value);
  };
  PlatformNumeric.prototype.minus = PlatformNumeric.prototype.deduct;

  // Prototype method to invert the sign
  ExtendedNumeric.prototype.invertSign = function () {
    return new ExtendedNumeric(this.value, !this.sign);
  };
  CompactNumeric.prototype.invertSign = function () {
    var currentSign = this.sign;
    var smallResult = new CompactNumeric(-this.value);
    smallResult.sign = !currentSign;
    return smallResult;
  };
  PlatformNumeric.prototype.invertSign = function () {
    return new PlatformNumeric(-this.value);
  };

  // Prototype method for absolute value
  ExtendedNumeric.prototype.absoluteValue = function () {
    return new ExtendedNumeric(this.value, false);
  };
  CompactNumeric.prototype.absoluteValue = function () {
    return new CompactNumeric(Math.abs(this.value));
  };
  PlatformNumeric.prototype.absoluteValue = function () {
    return new PlatformNumeric(this.value >= 0 ? this.value : -this.value);
  };

  // Multiplies two arrays of digits (long multiplication)
  function multiplyExtended(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      totalLen = lenA + lenB,
      resultArray = makeZeroArray(totalLen),
      baseVal = NUM_BASE,
      prodVal,
      carryVal,
      idx,
      valA_idx,
      valB_jdx;
    for (idx = 0; idx < lenA; ++idx) {
      valA_idx = arrA[idx];
      for (var jdx = 0; jdx < lenB; ++jdx) {
        valB_jdx = arrB[jdx];
        prodVal = valA_idx * valB_jdx + resultArray[idx + jdx];
        carryVal = Math.floor(prodVal / baseVal);
        resultArray[idx + jdx] = prodVal - carryVal * baseVal;
        resultArray[idx + jdx + 1] += carryVal;
      }
    }
    normalizeArray(resultArray); // Remove any leading zeros
    return resultArray;
  }

  // Multiplies an array of digits by a small number
  function multiplyBySmall(arr, smallNum) {
    var len = arr.length,
      resultArray = new Array(len),
      baseVal = NUM_BASE,
      carryVal = 0,
      prodVal,
      idx;
    for (idx = 0; idx < len; idx++) {
      prodVal = arr[idx] * smallNum + carryVal;
      carryVal = Math.floor(prodVal / baseVal);
      resultArray[idx] = prodVal - carryVal * baseVal;
    }
    while (carryVal > 0) {
      resultArray[idx++] = carryVal % baseVal;
      carryVal = Math.floor(carryVal / baseVal);
    }
    return resultArray;
  }

  // Shifts an array of digits to the left by adding zeros
  function arrayShiftLeft(arr, numZeros) {
    var newArr = [];
    while (numZeros-- > 0) newArr.push(0);
    return newArr.concat(arr);
  }

  // Karatsuba multiplication algorithm
  function karatsubaProduct(xArr, yArr) {
    var maxLen = Math.max(xArr.length, yArr.length);
    if (maxLen <= 30) return multiplyExtended(xArr, yArr); // Fallback to long multiplication for small inputs

    maxLen = Math.ceil(maxLen / 2); // Split point
    var b_part = xArr.slice(maxLen),
      a_part = xArr.slice(0, maxLen),
      d_part = yArr.slice(maxLen),
      c_part = yArr.slice(0, maxLen);

    var ac_prod = karatsubaProduct(a_part, c_part),
      bd_prod = karatsubaProduct(b_part, d_part),
      abcd_sum = karatsubaProduct(addFlexible(a_part, b_part), addFlexible(c_part, d_part));

    var finalProduct = addFlexible(
      addFlexible(ac_prod, arrayShiftLeft(subtractElements(subtractElements(abcd_sum, ac_prod), bd_prod), maxLen)),
      arrayShiftLeft(bd_prod, 2 * maxLen)
    );
    normalizeArray(finalProduct);
    return finalProduct;
  }

  // Heuristic to decide whether to use Karatsuba
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  // Prototype method for multiplication
  ExtendedNumeric.prototype.productOf = function (val) {
    var otherNum = interpretInput(val),
      currentVal = this.value,
      otherVal = otherNum.value,
      isResultNegative = this.sign !== otherNum.sign,
      absOtherVal;
    if (otherNum.isSmall) {
      if (otherVal === 0) return NumericEntity[0];
      if (otherVal === 1) return this;
      if (otherVal === -1) return this.invertSign();
      absOtherVal = Math.abs(otherVal);
      if (absOtherVal < NUM_BASE) {
        return new ExtendedNumeric(multiplyBySmall(currentVal, absOtherVal), isResultNegative);
      }
      otherVal = decomposeSmall(absOtherVal); // Convert small to array
    }
    if (shouldUseKaratsuba(currentVal.length, otherVal.length))
      return new ExtendedNumeric(karatsubaProduct(currentVal, otherVal), isResultNegative);
    return new ExtendedNumeric(multiplyExtended(currentVal, otherVal), isResultNegative);
  };
  ExtendedNumeric.prototype.times = ExtendedNumeric.prototype.productOf;

  // Multiplies a small number and an array of digits
  function smallArrayProduct(smallNum, digitArray, isNegative) {
    if (smallNum < NUM_BASE) {
      return new ExtendedNumeric(multiplyBySmall(digitArray, smallNum), isNegative);
    }
    return new ExtendedNumeric(multiplyExtended(digitArray, decomposeSmall(smallNum)), isNegative);
  }

  // Internal multiplication by a small number for CompactNumeric
  CompactNumeric.prototype._multiplyBySmall = function (otherCompact) {
    if (isExact(otherCompact.value * this.value)) {
      return new CompactNumeric(otherCompact.value * this.value);
    }
    return smallArrayProduct(
      Math.abs(otherCompact.value),
      decomposeSmall(Math.abs(this.value)),
      this.sign !== otherCompact.sign
    );
  };

  // Internal multiplication by a small number for ExtendedNumeric
  ExtendedNumeric.prototype._multiplyBySmall = function (otherCompact) {
    if (otherCompact.value === 0) return NumericEntity[0];
    if (otherCompact.value === 1) return this;
    if (otherCompact.value === -1) return this.invertSign();
    return smallArrayProduct(Math.abs(otherCompact.value), this.value, this.sign !== otherCompact.sign);
  };

  CompactNumeric.prototype.productOf = function (val) {
    return interpretInput(val)._multiplyBySmall(this);
  };
  CompactNumeric.prototype.times = CompactNumeric.prototype.productOf;

  PlatformNumeric.prototype.productOf = function (val) {
    return new PlatformNumeric(this.value * interpretInput(val).value);
  };
  PlatformNumeric.prototype.times = PlatformNumeric.prototype.productOf;

  // Squares an array of digits
  function calculateSquare(arr) {
    var len = arr.length,
      resultArray = makeZeroArray(len + len),
      baseVal = NUM_BASE,
      prodVal,
      carryVal,
      idx,
      arr_idx,
      arr_jdx;
    for (idx = 0; idx < len; idx++) {
      arr_idx = arr[idx];
      carryVal = 0 - arr_idx * arr_idx; // Initialize carry with negative product for self-multiplication
      for (var jdx = idx; jdx < len; jdx++) {
        arr_jdx = arr[jdx];
        prodVal = 2 * (arr_idx * arr_jdx) + resultArray[idx + jdx] + carryVal;
        carryVal = Math.floor(prodVal / baseVal);
        resultArray[idx + jdx] = prodVal - carryVal * baseVal;
      }
      resultArray[idx + len] += carryVal;
    }
    normalizeArray(resultArray);
    return resultArray;
  }

  ExtendedNumeric.prototype.square = function () {
    return new ExtendedNumeric(calculateSquare(this.value), false);
  };
  CompactNumeric.prototype.square = function () {
    var squaredValue = this.value * this.value;
    if (isExact(squaredValue)) return new CompactNumeric(squaredValue);
    return new ExtendedNumeric(calculateSquare(decomposeSmall(Math.abs(this.value))), false);
  };
  PlatformNumeric.prototype.square = function () {
    return new PlatformNumeric(this.value * this.value);
  };

  // Division with remainder, Algorithm 1 (single-digit divisor)
  function divisionAlgorithmOne(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      baseVal = NUM_BASE,
      resultArray = makeZeroArray(arrB.length),
      mostSignificantDivisor = arrB[lenB - 1],
      lambdaMultiplier = Math.ceil(baseVal / (2 * mostSignificantDivisor)), // Normalization factor
      tempRemainder = multiplyBySmall(arrA, lambdaMultiplier), // Scale dividend
      tempDivisor = multiplyBySmall(arrB, lambdaMultiplier), // Scale divisor
      quotientDigit,
      shiftCount,
      carryVal,
      borrowVal,
      idx,
      loopLen,
      q_val;

    if (tempRemainder.length <= lenA) tempRemainder.push(0); // Ensure enough space
    tempDivisor.push(0); // Pad divisor
    mostSignificantDivisor = tempDivisor[lenB - 1]; // Update after scaling

    for (shiftCount = lenA - lenB; shiftCount >= 0; shiftCount--) {
      quotientDigit = baseVal - 1;
      // Estimate quotient digit
      if (tempRemainder[shiftCount + lenB] !== mostSignificantDivisor) {
        quotientDigit = Math.floor(
          (tempRemainder[shiftCount + lenB] * baseVal + tempRemainder[shiftCount + lenB - 1]) /
            mostSignificantDivisor
        );
      }
      carryVal = 0;
      borrowVal = 0;
      loopLen = tempDivisor.length;
      // Perform trial subtraction
      for (idx = 0; idx < loopLen; idx++) {
        carryVal += quotientDigit * tempDivisor[idx];
        q_val = Math.floor(carryVal / baseVal);
        borrowVal += tempRemainder[shiftCount + idx] - (carryVal - q_val * baseVal);
        carryVal = q_val;
        if (borrowVal < 0) {
          tempRemainder[shiftCount + idx] = borrowVal + baseVal;
          borrowVal = -1;
        } else {
          tempRemainder[shiftCount + idx] = borrowVal;
          borrowVal = 0;
        }
      }
      // Adjust quotient if trial subtraction resulted in negative
      while (borrowVal !== 0) {
        quotientDigit -= 1;
        carryVal = 0;
        for (idx = 0; idx < loopLen; idx++) {
          carryVal += tempRemainder[shiftCount + idx] - baseVal + tempDivisor[idx];
          if (carryVal < 0) {
            tempRemainder[shiftCount + idx] = carryVal + baseVal;
            carryVal = 0;
          } else {
            tempRemainder[shiftCount + idx] = carryVal;
            carryVal = 1;
          }
        }
        borrowVal += carryVal;
      }
      resultArray[shiftCount] = quotientDigit;
    }
    // Denormalize remainder
    tempRemainder = smallDivisionModulo(tempRemainder, lambdaMultiplier)[0];
    return [composeSmall(resultArray), composeSmall(tempRemainder)];
  }

  // Division with remainder, Algorithm 2 (multiple-digit divisor)
  function divisionAlgorithmTwo(arrA, arrB) {
    var lenA = arrA.length,
      lenB = arrB.length,
      quotientDigits = [],
      currentPart = [],
      baseVal = NUM_BASE,
      estimatedQuotient,
      xLength,
      highX,
      highY,
      trialProduct;
    while (lenA) {
      currentPart.unshift(arrA[--lenA]);
      normalizeArray(currentPart);
      if (compareAbsoluteValues(currentPart, arrB) < 0) {
        quotientDigits.push(0);
        continue;
      }
      xLength = currentPart.length;
      highX = currentPart[xLength - 1] * baseVal + currentPart[xLength - 2];
      highY = arrB[lenB - 1] * baseVal + arrB[lenB - 2];
      if (xLength > lenB) {
        highX = (highX + 1) * baseVal; // Adjust for extra digit
      }
      estimatedQuotient = Math.ceil(highX / highY); // Initial guess
      do {
        trialProduct = multiplyBySmall(arrB, estimatedQuotient);
        if (compareAbsoluteValues(trialProduct, currentPart) <= 0) break;
        estimatedQuotient--;
      } while (estimatedQuotient);
      quotientDigits.push(estimatedQuotient);
      currentPart = subtractElements(currentPart, trialProduct); // Update remainder
    }
    quotientDigits.reverse();
    return [composeSmall(quotientDigits), composeSmall(currentPart)];
  }

  // Divides an array of digits by a small number
  function smallDivisionModulo(digitArray, smallNum) {
    var length = digitArray.length,
      quotientArray = makeZeroArray(length),
      baseVal = NUM_BASE,
      idx,
      quotientPart,
      currentRemainder,
      currentDivisor;
    currentRemainder = 0;
    for (idx = length - 1; idx >= 0; --idx) {
      currentDivisor = currentRemainder * baseVal + digitArray[idx];
      quotientPart = floorOrCeil(currentDivisor / smallNum);
      currentRemainder = currentDivisor - quotientPart * smallNum;
      quotientArray[idx] = quotientPart | 0; // Ensure integer
    }
    return [quotientArray, currentRemainder | 0]; // Ensure integer
  }

  // Universal division and modulo function
  function universalDivMod(selfRef, val) {
    var resultValue,
      otherNum = interpretInput(val);
    if (hasNativeBigIntSupport) {
      return [
        new PlatformNumeric(selfRef.value / otherNum.value),
        new PlatformNumeric(selfRef.value % otherNum.value),
      ];
    }
    var currentVal = selfRef.value,
      otherVal = otherNum.value;
    var finalQuotient;
    if (otherVal === 0) throw new Error("Cannot partition by zero"); // Division by zero check
    if (selfRef.isSmall) {
      if (otherNum.isSmall) {
        return [new CompactNumeric(floorOrCeil(currentVal / otherVal)), new CompactNumeric(currentVal % otherVal)];
      }
      return [NumericEntity[0], selfRef]; // Small number divided by large number
    }
    if (otherNum.isSmall) {
      if (otherVal === 1) return [selfRef, NumericEntity[0]];
      if (otherVal == -1) return [selfRef.invertSign(), NumericEntity[0]];
      var absOtherVal = Math.abs(otherVal);
      if (absOtherVal < NUM_BASE) {
        resultValue = smallDivisionModulo(currentVal, absOtherVal);
        finalQuotient = composeSmall(resultValue[0]);
        var finalRemainder = resultValue[1];
        if (selfRef.sign) finalRemainder = -finalRemainder; // Adjust remainder sign
        if (typeof finalQuotient === "number") {
          if (selfRef.sign !== otherNum.sign) finalQuotient = -finalQuotient; // Adjust quotient sign
          return [new CompactNumeric(finalQuotient), new CompactNumeric(finalRemainder)];
        }
        return [new ExtendedNumeric(finalQuotient, selfRef.sign !== otherNum.sign), new CompactNumeric(finalRemainder)];
      }
      otherVal = decomposeSmall(absOtherVal); // Convert small to array
    }
    var comparison = compareAbsoluteValues(currentVal, otherVal);
    if (comparison === -1) return [NumericEntity[0], selfRef]; // Dividend smaller than divisor
    if (comparison === 0)
      return [NumericEntity[selfRef.sign === otherNum.sign ? 1 : -1], NumericEntity[0]]; // Dividend equals divisor

    // Choose division algorithm based on size
    if (currentVal.length + otherVal.length <= 200) resultValue = divisionAlgorithmOne(currentVal, otherVal);
    else resultValue = divisionAlgorithmTwo(currentVal, otherVal);

    finalQuotient = resultValue[0];
    var quotientSign = selfRef.sign !== otherNum.sign,
      finalMod = resultValue[1],
      modSign = selfRef.sign;

    if (typeof finalQuotient === "number") {
      if (quotientSign) finalQuotient = -finalQuotient;
      finalQuotient = new CompactNumeric(finalQuotient);
    } else finalQuotient = new ExtendedNumeric(finalQuotient, quotientSign);

    if (typeof finalMod === "number") {
      if (modSign) finalMod = -finalMod;
      finalMod = new CompactNumeric(finalMod);
    } else finalMod = new ExtendedNumeric(finalMod, modSign);

    return [finalQuotient, finalMod];
  }

  // Prototype method for divmod
  ExtendedNumeric.prototype.divmod = function (val) {
    var divModResult = universalDivMod(this, val);
    return { quotient: divModResult[0], remainder: divModResult[1] };
  };
  PlatformNumeric.prototype.divmod = CompactNumeric.prototype.divmod = ExtendedNumeric.prototype.divmod;

  // Prototype method for division
  ExtendedNumeric.prototype.partition = function (val) {
    return universalDivMod(this, val)[0];
  };
  PlatformNumeric.prototype.over =
    PlatformNumeric.prototype.partition =
    CompactNumeric.prototype.over =
    CompactNumeric.prototype.partition =
    ExtendedNumeric.prototype.over =
    ExtendedNumeric.prototype.partition;

  // Prototype method for modulo
  ExtendedNumeric.prototype.remainderOf = function (val) {
    return universalDivMod(this, val)[1];
  };
  PlatformNumeric.prototype.mod =
    PlatformNumeric.prototype.remainderOf =
    CompactNumeric.prototype.remainderOf =
    CompactNumeric.prototype.mod =
    ExtendedNumeric.prototype.remainderOf =
    ExtendedNumeric.prototype.mod;

  // Prototype method for exponentiation (power)
  ExtendedNumeric.prototype.exponentiate = function (val) {
    var otherNum = interpretInput(val),
      currentVal = this.value,
      otherVal = otherNum.value,
      calculatedVal,
      baseVal,
      resultAccumulator;
    if (otherVal === 0) return NumericEntity[1]; // x^0 = 1
    if (currentVal === 0) return NumericEntity[0]; // 0^x = 0 (for x>0)
    if (currentVal === 1) return NumericEntity[1]; // 1^x = 1
    if (currentVal == -1) return otherNum.isDivisibleByTwo() ? NumericEntity[1] : NumericEntity[-1]; // (-1)^x
    if (otherNum.sign) {
      return NumericEntity[0]; // Negative exponent
    }
    if (!otherNum.isSmall) throw new Error("The exponent " + otherNum.toString() + " is too large.");
    if (this.isSmall) {
      if (isExact((calculatedVal = Math.pow(currentVal, otherVal))))
        return new CompactNumeric(floorOrCeil(calculatedVal));
    }
    baseVal = this;
    resultAccumulator = NumericEntity[1];
    while (true) {
      if ((otherVal & 1) === 1) {
        resultAccumulator = resultAccumulator.times(baseVal);
        --otherVal;
      }
      if (otherVal === 0) break;
      otherVal /= 2;
      baseVal = baseVal.square();
    }
    return resultAccumulator;
  };
  CompactNumeric.prototype.exponentiate = ExtendedNumeric.prototype.exponentiate;

  var exponentiationNative;
  if (hasNativeBigIntSupport) {
    exponentiationNative = eval("(a,b)=>a**b"); // Native BigInt exponentiation
  }
  PlatformNumeric.prototype.exponentiate = function (val) {
    var otherNum = interpretInput(val);
    var currentVal = this.value,
      otherVal = otherNum.value;
    if (otherVal === BigInt(0)) return NumericEntity[1];
    if (currentVal === BigInt(0)) return NumericEntity[0];
    if (currentVal === BigInt(1)) return NumericEntity[1];
    if (currentVal === BigInt(-1)) return otherNum.isDivisibleByTwo() ? NumericEntity[1] : NumericEntity[-1];
    if (otherNum.isNegative()) return new PlatformNumeric(BigInt(0));
    return new PlatformNumeric(exponentiationNative(currentVal, otherVal));
  };

  // Prototype method for modular exponentiation
  ExtendedNumeric.prototype.modularExponentiation = function (expVal, modVal) {
    expVal = interpretInput(expVal);
    modVal = interpretInput(modVal);
    if (modVal.isTrivial()) throw new Error("Cannot take modular exponentiation with modulus 0");
    var res = NumericEntity[1],
      currentBase = this.remainderOf(modVal);
    while (expVal.isAboveZero()) {
      if (currentBase.isTrivial()) return NumericEntity[0];
      if (expVal.isOdd()) res = res.productOf(currentBase).remainderOf(modVal);
      expVal = expVal.partition(2);
      currentBase = currentBase.square().remainderOf(modVal);
    }
    return res;
  };
  PlatformNumeric.prototype.modularExponentiation =
    CompactNumeric.prototype.modularExponentiation =
    ExtendedNumeric.prototype.modularExponentiation;

  // Compares absolute values of two digit arrays
  function compareAbsoluteValues(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    for (var idx = arrA.length - 1; idx >= 0; idx--) {
      if (arrA[idx] !== arrB[idx]) return arrA[idx] > arrB[idx] ? 1 : -1;
    }
    return 0; // Equal
  }

  // Prototype method to compare absolute values
  ExtendedNumeric.prototype.compareAbsoluteValues = function (val) {
    var otherNum = interpretInput(val),
      currentVal = this.value,
      otherVal = otherNum.value;
    if (otherNum.isSmall) return 1; // Extended is always larger than small (in terms of representation size)
    return compareAbsoluteValues(currentVal, otherVal);
  };
  CompactNumeric.prototype.compareAbsoluteValues = function (val) {
    var otherNum = interpretInput(val),
      currentAbs = Math.abs(this.value),
      otherVal = otherNum.value;
    if (otherNum.isSmall) {
      otherVal = Math.abs(otherVal);
      return currentAbs === otherVal ? 0 : currentAbs > otherVal ? 1 : -1;
    }
    return -1; // Compact is smaller than extended
  };
  PlatformNumeric.prototype.compareAbsoluteValues = function (val) {
    var currentVal = this.value;
    var otherVal = interpretInput(val).value;
    currentVal = currentVal >= 0 ? currentVal : -currentVal;
    otherVal = otherVal >= 0 ? otherVal : -otherVal;
    return currentVal === otherVal ? 0 : currentVal > otherVal ? 1 : -1;
  };

  // Prototype method for general comparison
  ExtendedNumeric.prototype.evaluate = function (val) {
    if (val === Infinity) {
      return -1;
    }
    if (val === -Infinity) {
      return 1;
    }
    var otherNum = interpretInput(val),
      currentVal = this.value,
      otherVal = otherNum.value;
    if (this.sign !== otherNum.sign) {
      return otherNum.sign ? 1 : -1; // Different signs
    }
    if (otherNum.isSmall) {
      return this.sign ? -1 : 1; // If current is extended and other is small, extended is larger (abs)
    }
    return compareAbsoluteValues(currentVal, otherVal) * (this.sign ? -1 : 1); // Apply sign
  };
  ExtendedNumeric.prototype.compareTo = ExtendedNumeric.prototype.evaluate;

  CompactNumeric.prototype.evaluate = function (val) {
    if (val === Infinity) {
      return -1;
    }
    if (val === -Infinity) {
      return 1;
    }
    var otherNum = interpretInput(val),
      currentVal = this.value,
      otherVal = otherNum.value;
    if (otherNum.isSmall) {
      return currentVal == otherVal ? 0 : currentVal > otherVal ? 1 : -1;
    }
    if (currentVal < 0 !== otherNum.sign) {
      return currentVal < 0 ? -1 : 1; // Different signs
    }
    return currentVal < 0 ? 1 : -1; // Both same sign, other is Extended
  };
  CompactNumeric.prototype.compareTo = CompactNumeric.prototype.evaluate;

  PlatformNumeric.prototype.evaluate = function (val) {
    if (val === Infinity) {
      return -1;
    }
    if (val === -Infinity) {
      return 1;
    }
    var currentVal = this.value;
    var otherVal = interpretInput(val).value;
    return currentVal === otherVal ? 0 : currentVal > otherVal ? 1 : -1;
  };
  PlatformNumeric.prototype.compareTo = PlatformNumeric.prototype.evaluate;

  // Equality checks
  ExtendedNumeric.prototype.matches = function (val) {
    return this.evaluate(val) === 0;
  };
  PlatformNumeric.prototype.eq =
    PlatformNumeric.prototype.matches =
    CompactNumeric.prototype.eq =
    CompactNumeric.prototype.matches =
    ExtendedNumeric.prototype.eq =
    ExtendedNumeric.prototype.matches;

  ExtendedNumeric.prototype.notMatches = function (val) {
    return this.evaluate(val) !== 0;
  };
  PlatformNumeric.prototype.neq =
    PlatformNumeric.prototype.notMatches =
    CompactNumeric.prototype.neq =
    CompactNumeric.prototype.notMatches =
    ExtendedNumeric.prototype.neq =
    ExtendedNumeric.prototype.notMatches;

  // Comparison operators
  ExtendedNumeric.prototype.isLargerThan = function (val) {
    return this.evaluate(val) > 0;
  };
  PlatformNumeric.prototype.gt =
    PlatformNumeric.prototype.isLargerThan =
    CompactNumeric.prototype.gt =
    CompactNumeric.prototype.isLargerThan =
    ExtendedNumeric.prototype.gt =
    ExtendedNumeric.prototype.isLargerThan;

  ExtendedNumeric.prototype.isSmallerThan = function (val) {
    return this.evaluate(val) < 0;
  };
  PlatformNumeric.prototype.lt =
    PlatformNumeric.prototype.isSmallerThan =
    CompactNumeric.prototype.lt =
    CompactNumeric.prototype.isSmallerThan =
    ExtendedNumeric.prototype.lt =
    ExtendedNumeric.prototype.isSmallerThan;

  ExtendedNumeric.prototype.isLargerOrEqualTo = function (val) {
    return this.evaluate(val) >= 0;
  };
  PlatformNumeric.prototype.geq =
    PlatformNumeric.prototype.isLargerOrEqualTo =
    CompactNumeric.prototype.geq =
    CompactNumeric.prototype.isLargerOrEqualTo =
    ExtendedNumeric.prototype.geq =
    ExtendedNumeric.prototype.isLargerOrEqualTo;

  ExtendedNumeric.prototype.isSmallerOrEqualTo = function (val) {
    return this.evaluate(val) <= 0;
  };
  PlatformNumeric.prototype.leq =
    PlatformNumeric.prototype.isSmallerOrEqualTo =
    CompactNumeric.prototype.leq =
    CompactNumeric.prototype.isSmallerOrEqualTo =
    ExtendedNumeric.prototype.leq =
    ExtendedNumeric.prototype.isSmallerOrEqualTo;

  // Parity checks
  ExtendedNumeric.prototype.isDivisibleByTwo = function () {
    return (this.value[0] & 1) === 0;
  };
  CompactNumeric.prototype.isDivisibleByTwo = function () {
    return (this.value & 1) === 0;
  };
  PlatformNumeric.prototype.isDivisibleByTwo = function () {
    return (this.value & BigInt(1)) === BigInt(0);
  };

  ExtendedNumeric.prototype.isOdd = function () {
    return (this.value[0] & 1) === 1;
  };
  CompactNumeric.prototype.isOdd = function () {
    return (this.value & 1) === 1;
  };
  PlatformNumeric.prototype.isOdd = function () {
    return (this.value & BigInt(1)) === BigInt(1);
  };

  // Sign checks
  ExtendedNumeric.prototype.isAboveZero = function () {
    return !this.sign;
  };
  CompactNumeric.prototype.isAboveZero = function () {
    return this.value > 0;
  };
  PlatformNumeric.prototype.isAboveZero = CompactNumeric.prototype.isAboveZero;

  ExtendedNumeric.prototype.isNegative = function () {
    return this.sign;
  };
  CompactNumeric.prototype.isNegative = function () {
    return this.value < 0;
  };
  PlatformNumeric.prototype.isNegative = CompactNumeric.prototype.isNegative;

  // Special value checks
  ExtendedNumeric.prototype.isUnit = function () {
    return false;
  }; // Only small numbers or BigInt can be unit
  CompactNumeric.prototype.isUnit = function () {
    return Math.abs(this.value) === 1;
  };
  PlatformNumeric.prototype.isUnit = function () {
    return this.absoluteValue().value === BigInt(1);
  };

  ExtendedNumeric.prototype.isTrivial = function () {
    return false;
  }; // Only small numbers or BigInt can be zero
  CompactNumeric.prototype.isTrivial = function () {
    return this.value === 0;
  };
  PlatformNumeric.prototype.isTrivial = function () {
    return this.value === BigInt(0);
  };

  // Divisibility check
  ExtendedNumeric.prototype.isDivisibleBy = function (val) {
    var otherNum = interpretInput(val);
    if (otherNum.isTrivial()) return false; // Cannot divide by zero
    if (otherNum.isUnit()) return true; // Divisible by 1 or -1
    if (otherNum.compareAbsoluteValues(2) === 0) return this.isDivisibleByTwo(); // Divisible by 2
    return this.remainderOf(otherNum).isTrivial(); // Check if remainder is zero
  };
  PlatformNumeric.prototype.isDivisibleBy =
    CompactNumeric.prototype.isDivisibleBy =
    ExtendedNumeric.prototype.isDivisibleBy;

  // Basic primality test for small numbers
  function isTrivialPrime(val) {
    var absVal = val.absoluteValue();
    if (absVal.isUnit()) return false;
    if (absVal.matches(2) || absVal.matches(3) || absVal.matches(5)) return true;
    if (absVal.isDivisibleByTwo() || absVal.isDivisibleBy(3) || absVal.isDivisibleBy(5)) return false;
    if (absVal.isSmallerThan(49)) return true; // Primes up to 47
  }

  // Miller-Rabin primality test
  function probabilisticPrimeTest(candidateNum, testBases) {
    var candidatePrev = candidateNum.decremented(),
      tempB = candidatePrev,
      r_val = 0,
      d_val,
      iter,
      testIter,
      x_val;
    while (tempB.isDivisibleByTwo()) tempB = tempB.partition(2), r_val++;

    testLoop: for (testIter = 0; testIter < testBases.length; testIter++) {
      if (candidateNum.isSmallerThan(testBases[testIter])) continue;
      x_val = largeNumber(testBases[testIter]).modularExponentiation(tempB, candidateNum);
      if (x_val.isUnit() || x_val.matches(candidatePrev)) continue; // Passes if x is 1 or n-1

      for (d_val = r_val - 1; d_val != 0; d_val--) {
        x_val = x_val.square().remainderOf(candidateNum);
        if (x_val.isUnit()) return false; // Composite
        if (x_val.matches(candidatePrev)) continue testLoop; // Passes
      }
      return false; // Composite
    }
    return true; // Probably prime
  }

  // Prototype method for primality test
  ExtendedNumeric.prototype.isPrimary = function (strictMode) {
    var primeCheck = isTrivialPrime(this);
    if (primeCheck !== undefined) return primeCheck;
    var absVal = this.absoluteValue();
    var bitLength = absVal.getBitLength();
    if (bitLength.toJSNumber() <= 64)
      return probabilisticPrimeTest(absVal, [2, 325, 9375, 28178, 450775, 9780504, 1795265022]);

    var logN = Math.log(2) * bitLength.toJSNumber();
    var numTests = Math.ceil(strictMode === true ? 2 * Math.pow(logN, 2) : logN);
    var testValues = [];
    for (var idx = 0; idx < numTests; idx++) {
      testValues.push(largeNumber(idx + 2));
    }
    return probabilisticPrimeTest(absVal, testValues);
  };
  PlatformNumeric.prototype.isPrimary = CompactNumeric.prototype.isPrimary = ExtendedNumeric.prototype.isPrimary;

  // Prototype method for probable primality test
  ExtendedNumeric.prototype.isLikelyPrime = function (iterations) {
    var primeCheck = isTrivialPrime(this);
    if (primeCheck !== undefined) return primeCheck;
    var absVal = this.absoluteValue();
    var numTests = iterations === undefined ? 5 : iterations;
    var testValues = [];
    for (var idx = 0; idx < numTests; idx++) {
      testValues.push(largeNumber.randomBetween(2, absVal.minus(2)));
    }
    return probabilisticPrimeTest(absVal, testValues);
  };
  PlatformNumeric.prototype.isLikelyPrime =
    CompactNumeric.prototype.isLikelyPrime =
    ExtendedNumeric.prototype.isLikelyPrime;

  // Prototype method for modular inverse
  ExtendedNumeric.prototype.modularInverse = function (modNum) {
    var t_val = largeNumber.nullValue,
      newT_val = largeNumber.unit,
      r_val = interpretInput(modNum),
      newR_val = this.absoluteValue(),
      q_val,
      lastT_val,
      lastR_val;
    while (!newR_val.isTrivial()) {
      q_val = r_val.partition(newR_val);
      lastT_val = t_val;
      lastR_val = r_val;
      t_val = newT_val;
      r_val = newR_val;
      newT_val = lastT_val.deduct(q_val.productOf(newT_val));
      newR_val = lastR_val.deduct(q_val.productOf(newR_val));
    }
    if (!r_val.isUnit()) throw new Error(this.toString() + " and " + modNum.toString() + " are not co-prime");
    if (t_val.evaluate(0) === -1) {
      t_val = t_val.combine(modNum);
    }
    if (this.isNegative()) {
      return t_val.invertSign();
    }
    return t_val;
  };
  PlatformNumeric.prototype.modularInverse =
    CompactNumeric.prototype.modularInverse =
    ExtendedNumeric.prototype.modularInverse;

  // Increment operations
  ExtendedNumeric.prototype.incremented = function () {
    var currentVal = this.value;
    if (this.sign) {
      return subtractFromSmall(currentVal, 1, this.sign);
    }
    return new ExtendedNumeric(addToSmall(currentVal, 1), this.sign);
  };
  CompactNumeric.prototype.incremented = function () {
    var currentVal = this.value;
    if (currentVal + 1 < MAX_PRECISE_NUM) return new CompactNumeric(currentVal + 1);
    return new ExtendedNumeric(MAX_PRECISE_ARRAY, false);
  };
  PlatformNumeric.prototype.incremented = function () {
    return new PlatformNumeric(this.value + BigInt(1));
  };

  // Decrement operations
  ExtendedNumeric.prototype.decremented = function () {
    var currentVal = this.value;
    if (this.sign) {
      return new ExtendedNumeric(addToSmall(currentVal, 1), true);
    }
    return subtractFromSmall(currentVal, 1, this.sign);
  };
  CompactNumeric.prototype.decremented = function () {
    var currentVal = this.value;
    if (currentVal - 1 > -MAX_PRECISE_NUM) return new CompactNumeric(currentVal - 1);
    return new ExtendedNumeric(MAX_PRECISE_ARRAY, true);
  };
  PlatformNumeric.prototype.decremented = function () {
    return new PlatformNumeric(this.value - BigInt(1));
  };

  // Powers of two for bit shifting
  var powersOfTwo = [1];
  while (2 * powersOfTwo[powersOfTwo.length - 1] <= NUM_BASE)
    powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
  var powers2Length = powersOfTwo.length,
    highestPower2 = powersOfTwo[powers2Length - 1];

  // Check if shift amount is small enough
  function isShiftAmountSmall(shiftVal) {
    return Math.abs(shiftVal) <= NUM_BASE;
  }

  // Prototype method for left bit shift
  ExtendedNumeric.prototype.bitShiftLeft = function (val) {
    var shiftAmount = interpretInput(val).toJSNumber();
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    if (shiftAmount < 0) return this.bitShiftRight(-shiftAmount);
    var currentResult = this;
    if (currentResult.isTrivial()) return currentResult;
    while (shiftAmount >= powers2Length) {
      currentResult = currentResult.productOf(highestPower2);
      shiftAmount -= powers2Length - 1;
    }
    return currentResult.productOf(powersOfTwo[shiftAmount]);
  };
  PlatformNumeric.prototype.bitShiftLeft =
    CompactNumeric.prototype.bitShiftLeft =
    ExtendedNumeric.prototype.bitShiftLeft;

  // Prototype method for right bit shift
  ExtendedNumeric.prototype.bitShiftRight = function (val) {
    var divModPair;
    var shiftAmount = interpretInput(val).toJSNumber();
    if (!isShiftAmountSmall(shiftAmount)) {
      throw new Error(String(shiftAmount) + " is too large for shifting.");
    }
    if (shiftAmount < 0) return this.bitShiftLeft(-shiftAmount);
    var currentResult = this;
    while (shiftAmount >= powers2Length) {
      if (currentResult.isTrivial() || (currentResult.isNegative() && currentResult.isUnit())) return currentResult;
      divModPair = universalDivMod(currentResult, highestPower2);
      currentResult = divModPair[1].isNegative() ? divModPair[0].decremented() : divModPair[0];
      shiftAmount -= powers2Length - 1;
    }
    divModPair = universalDivMod(currentResult, powersOfTwo[shiftAmount]);
    return divModPair[1].isNegative() ? divModPair[0].decremented() : divModPair[0];
  };
  PlatformNumeric.prototype.bitShiftRight =
    CompactNumeric.prototype.bitShiftRight =
    ExtendedNumeric.prototype.bitShiftRight;

  // Generic bitwise operation function
  function performBitwise(operandX, operandY, operationFn) {
    operandY = interpretInput(operandY);
    var xNegative = operandX.isNegative(),
      yNegative = operandY.isNegative();
    var xRemaining = xNegative ? operandX.not() : operandX,
      yRemaining = yNegative ? operandY.not() : operandY;
    var xCurrentDigit = 0,
      yCurrentDigit = 0;
    var xDivModResult = null,
      yDivModResult = null;
    var resultDigits = [];
    while (!xRemaining.isTrivial() || !yRemaining.isTrivial()) {
      xDivModResult = universalDivMod(xRemaining, highestPower2);
      xCurrentDigit = xDivModResult[1].toJSNumber();
      if (xNegative) {
        xCurrentDigit = highestPower2 - 1 - xCurrentDigit;
      }
      yDivModResult = universalDivMod(yRemaining, highestPower2);
      yCurrentDigit = yDivModResult[1].toJSNumber();
      if (yNegative) {
        yCurrentDigit = highestPower2 - 1 - yCurrentDigit;
      }
      xRemaining = xDivModResult[0];
      yRemaining = yDivModResult[0];
      resultDigits.push(operationFn(xCurrentDigit, yCurrentDigit));
    }
    var finalSum = operationFn(xNegative ? 1 : 0, yNegative ? 1 : 0) !== 0 ? largeNumber(-1) : largeNumber(0);
    for (var idx = resultDigits.length - 1; idx >= 0; idx -= 1) {
      finalSum = finalSum.productOf(highestPower2).combine(largeNumber(resultDigits[idx]));
    }
    return finalSum;
  }

  // Prototype method for bitwise NOT
  ExtendedNumeric.prototype.not = function () {
    return this.invertSign().decremented();
  };
  PlatformNumeric.prototype.not = CompactNumeric.prototype.not = ExtendedNumeric.prototype.not;

  // Prototype method for bitwise AND
  ExtendedNumeric.prototype.bitwiseAnd = function (val) {
    return performBitwise(this, val, function (a, b) {
      return a & b;
    });
  };
  PlatformNumeric.prototype.and = CompactNumeric.prototype.and = ExtendedNumeric.prototype.bitwiseAnd;

  // Prototype method for bitwise OR
  ExtendedNumeric.prototype.bitwiseOr = function (val) {
    return performBitwise(this, val, function (a, b) {
      return a | b;
    });
  };
  PlatformNumeric.prototype.or = CompactNumeric.prototype.or = ExtendedNumeric.prototype.bitwiseOr;

  // Prototype method for bitwise XOR
  ExtendedNumeric.prototype.bitwiseXor = function (val) {
    return performBitwise(this, val, function (a, b) {
      return a ^ b;
    });
  };
  PlatformNumeric.prototype.xor = CompactNumeric.prototype.xor = ExtendedNumeric.prototype.bitwiseXor;

  // Masks for rough LOB calculation
  var LOBMASK_I = 1 << 30,
    LOBMASK_BI = (NUM_BASE & -NUM_BASE) * (NUM_BASE & -NUM_BASE) | LOBMASK_I;

  // Estimates the least significant bit position
  function estimateLeastBit(num) {
    var currentVal = num.value,
      x_val =
        typeof currentVal === "number"
          ? currentVal | LOBMASK_I
          : typeof currentVal === "bigint"
            ? currentVal | BigInt(LOBMASK_I)
            : currentVal[0] + currentVal[1] * NUM_BASE | LOBMASK_BI;
    return x_val & -x_val;
  }

  // Integer logarithm calculation
  function logarithmIntegerPart(val, base) {
    if (base.compareTo(val) <= 0) {
      var tempResult = logarithmIntegerPart(val, base.square());
      var p_val = tempResult.p;
      var e_val = tempResult.e;
      var t_val = p_val.productOf(base);
      return t_val.compareTo(val) <= 0 ? { p: t_val, e: e_val * 2 + 1 } : { p: p_val, e: e_val * 2 };
    }
    return { p: largeNumber(1), e: 0 };
  }

  // Prototype method for bit length
  ExtendedNumeric.prototype.getBitLength = function () {
    var currentNum = this;
    if (currentNum.compareTo(largeNumber(0)) < 0) {
      currentNum = currentNum.invertSign().deducted(largeNumber(1));
    }
    if (currentNum.compareTo(largeNumber(0)) === 0) {
      return largeNumber(0);
    }
    return largeNumber(logarithmIntegerPart(currentNum, largeNumber(2)).e).combine(largeNumber(1));
  };
  PlatformNumeric.prototype.getBitLength =
    CompactNumeric.prototype.getBitLength =
    ExtendedNumeric.prototype.getBitLength;

  // Finds the maximum of two numbers
  function findMaximum(valA, valB) {
    valA = interpretInput(valA);
    valB = interpretInput(valB);
    return valA.isLargerThan(valB) ? valA : valB;
  }

  // Finds the minimum of two numbers
  function findMinimum(valA, valB) {
    valA = interpretInput(valA);
    valB = interpretInput(valB);
    return valA.isSmallerThan(valB) ? valA : valB;
  }

  // Calculates the greatest common divisor (GCD)
  function greatestCommonDivisor(valA, valB) {
    valA = interpretInput(valA).absoluteValue();
    valB = interpretInput(valB).absoluteValue();
    if (valA.matches(valB)) return valA;
    if (valA.isTrivial()) return valB;
    if (valB.isTrivial()) return valA;
    var commonFactor = NumericEntity[1],
      shiftAmount,
      tempVal;
    while (valA.isDivisibleByTwo() && valB.isDivisibleByTwo()) {
      shiftAmount = findMinimum(estimateLeastBit(valA), estimateLeastBit(valB));
      valA = valA.partition(shiftAmount);
      valB = valB.partition(shiftAmount);
      commonFactor = commonFactor.productOf(shiftAmount);
    }
    while (valA.isDivisibleByTwo()) {
      valA = valA.partition(estimateLeastBit(valA));
    }
    do {
      while (valB.isDivisibleByTwo()) {
        valB = valB.partition(estimateLeastBit(valB));
      }
      if (valA.isLargerThan(valB)) {
        tempVal = valB;
        valB = valA;
        valA = tempVal;
      }
      valB = valB.deducted(valA);
    } while (!valB.isTrivial());
    return commonFactor.isUnit() ? valA : valA.productOf(commonFactor);
  }

  // Calculates the least common multiple (LCM)
  function leastCommonMultiple(valA, valB) {
    valA = interpretInput(valA).absoluteValue();
    valB = interpretInput(valB).absoluteValue();
    return valA.partition(greatestCommonDivisor(valA, valB)).productOf(valB);
  }

  // Generates a random number between two values (inclusive)
  function randomBetween(lowerBound, upperBound) {
    lowerBound = interpretInput(lowerBound);
    upperBound = interpretInput(upperBound);
    var low = findMinimum(lowerBound, upperBound),
      high = findMaximum(lowerBound, upperBound);
    var range = high.deduct(low).combine(1);
    if (range.isSmall) return low.combine(Math.floor(Math.random() * range.toJSNumber()));

    var digits = convertToBase(range, NUM_BASE).value;
    var resultArr = [],
      isRestricted = true;
    for (var idx = 0; idx < digits.length; idx++) {
      var upperLimit = isRestricted ? digits[idx] : NUM_BASE;
      var digit = floorOrCeil(Math.random() * upperLimit);
      resultArr.push(digit);
      if (digit < upperLimit) isRestricted = false;
    }
    return low.combine(NumericEntity.fromDigitArray(resultArr, NUM_BASE, false));
  }

  // Parses a string value based on a given base and alphabet
  var parseByBase = function (strVal, base, alphabet, caseSensitivity) {
    alphabet = alphabet || STANDARD_ALPHA;
    strVal = String(strVal);
    if (!caseSensitivity) {
      strVal = strVal.toLowerCase();
      alphabet = alphabet.toLowerCase();
    }
    var strLen = strVal.length;
    var idx;
    var absBase = Math.abs(base);
    var alphabetMappings = {};
    for (idx = 0; idx < alphabet.length; idx++) {
      alphabetMappings[alphabet[idx]] = idx;
    }
    for (idx = 0; idx < strLen; idx++) {
      var char = strVal[idx];
      if (char === "-") continue;
      if (char in alphabetMappings) {
        if (alphabetMappings[char] >= absBase) {
          if (char === "1" && absBase === 1) continue; // Special case for base 1
          throw new Error(char + " is not a valid digit in base " + base + ".");
        }
      }
    }
    base = interpretInput(base);
    var digitArray = [];
    var isNeg = strVal[0] === "-";
    for (idx = isNeg ? 1 : 0; idx < strVal.length; idx++) {
      var char = strVal[idx];
      if (char in alphabetMappings) digitArray.push(interpretInput(alphabetMappings[char]));
      else if (char === "<") {
        var startIdx = idx;
        do {
          idx++;
        } while (strVal[idx] !== ">" && idx < strVal.length);
        digitArray.push(interpretInput(strVal.slice(startIdx + 1, idx)));
      } else throw new Error(char + " is not a valid character");
    }
    return parseBaseFromDigits(digitArray, base, isNeg);
  };

  // Parses an array of digits (parsed as NumericEntity) for a given base
  function parseBaseFromDigits(digitsArr, base, isNegative) {
    var finalVal = NumericEntity[0],
      currentPower = NumericEntity[1],
      idx;
    for (idx = digitsArr.length - 1; idx >= 0; idx--) {
      finalVal = finalVal.combine(digitsArr[idx].times(currentPower));
      currentPower = currentPower.times(base);
    }
    return isNegative ? finalVal.invertSign() : finalVal;
  }

  // Converts a digit to its string representation using an alphabet
  function convertDigitToString(digit, alphabet) {
    alphabet = alphabet || STANDARD_ALPHA;
    if (digit < alphabet.length) {
      return alphabet[digit];
    }
    return "<" + digit + ">"; // Fallback for digits outside alphabet
  }

  // Converts a number to its representation in a given base
  function convertToBase(num, base) {
    base = largeNumber(base);
    if (base.isTrivial()) {
      if (num.isTrivial()) return { value: [0], isNegative: false };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }
    if (base.matches(-1)) {
      // Special handling for base -1
      if (num.isTrivial()) return { value: [0], isNegative: false };
      if (num.isNegative())
        return {
          value: []
            .concat.apply(
              [],
              Array.apply(null, Array(-num.toJSNumber())).map(Array.prototype.valueOf, [1, 0])
            ),
          isNegative: false,
        };
      var arr = Array.apply(null, Array(num.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
      arr.unshift([1]);
      return { value: [].concat.apply([], arr), isNegative: false };
    }
    var isResultNegative = false;
    if (num.isNegative() && base.isAboveZero()) {
      isResultNegative = true;
      num = num.absoluteValue();
    }
    if (base.isUnit()) {
      if (num.isTrivial()) return { value: [0], isNegative: false };
      return {
        value: Array.apply(null, Array(num.toJSNumber())).map(Number.prototype.valueOf, 1),
        isNegative: isResultNegative,
      };
    }
    var outputDigits = [];
    var remainingNum = num,
      divModResult;
    while (remainingNum.isNegative() || remainingNum.compareAbsoluteValues(base) >= 0) {
      divModResult = remainingNum.divmod(base);
      remainingNum = divModResult.quotient;
      var digit = divModResult.remainder;
      if (digit.isNegative()) {
        digit = base.minus(digit).absoluteValue();
        remainingNum = remainingNum.incremented();
      }
      outputDigits.push(digit.toJSNumber());
    }
    outputDigits.push(remainingNum.toJSNumber());
    return { value: outputDigits.reverse(), isNegative: isResultNegative };
  }

  // Converts a number to its string representation in a given base
  function baseToStringValue(num, base, alphabet) {
    var convertedArr = convertToBase(num, base);
    return (convertedArr.isNegative ? "-" : "") + convertedArr.value.map(function (x) {
      return convertDigitToString(x, alphabet);
    }).join("");
  }

  // Prototype method to convert to array representation (base conversion)
  ExtendedNumeric.prototype.toArrayRepresentation = function (radix) {
    return convertToBase(this, radix);
  };
  CompactNumeric.prototype.toArrayRepresentation = function (radix) {
    return convertToBase(this, radix);
  };
  PlatformNumeric.prototype.toArrayRepresentation = function (radix) {
    return convertToBase(this, radix);
  };

  // Prototype method for string conversion
  ExtendedNumeric.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;
    if (radix !== 10) return baseToStringValue(this, radix, alphabet);
    var currentVal = this.value,
      len = currentVal.length,
      str = String(currentVal[--len]),
      paddingZeros = "0000000",
      digit;
    while (--len >= 0) {
      digit = String(currentVal[len]);
      str += paddingZeros.slice(digit.length) + digit; // Pad with leading zeros
    }
    var signChar = this.sign ? "-" : "";
    return signChar + str;
  };
  CompactNumeric.prototype.toString = function (radix, alphabet) {
    if (radix === undefined) radix = 10;
    if (radix != 10) return baseToStringValue(this, radix, alphabet);
    return String(this.value);
  };
  PlatformNumeric.prototype.toString = CompactNumeric.prototype.toString;

  // JSON serialization
  PlatformNumeric.prototype.toJSON =
    ExtendedNumeric.prototype.toJSON =
    CompactNumeric.prototype.toJSON =
    function () {
      return this.toString();
    };

  // ValueOf for primitive conversion
  ExtendedNumeric.prototype.valueOf = function () {
    return parseInt(this.toString(), 10);
  };
  ExtendedNumeric.prototype.toJSNumber = ExtendedNumeric.prototype.valueOf;

  CompactNumeric.prototype.valueOf = function () {
    return this.value;
  };
  CompactNumeric.prototype.toJSNumber = CompactNumeric.prototype.valueOf;

  PlatformNumeric.prototype.valueOf =
    PlatformNumeric.prototype.toJSNumber =
    function () {
      return parseInt(this.toString(), 10);
    };

  // Parses a string value into a NumericEntity
  function processStringValue(str) {
    if (isExact(+str)) {
      var num = +str;
      if (num === floorOrCeil(num))
        return hasNativeBigIntSupport ? new PlatformNumeric(BigInt(num)) : new CompactNumeric(num);
      throw new Error("Invalid integer: " + str);
    }
    var isNeg = str[0] === "-";
    if (isNeg) str = str.slice(1);
    var splitByE = str.split(/e/i);
    if (splitByE.length > 2) throw new Error("Invalid integer: " + splitByE.join("e"));
    if (splitByE.length === 2) {
      var exponentPart = splitByE[1];
      if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
      exponentPart = +exponentPart;
      if (exponentPart !== floorOrCeil(exponentPart) || !isExact(exponentPart))
        throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
      var mainText = splitByE[0];
      var decimalPoint = mainText.indexOf(".");
      if (decimalPoint >= 0) {
        exponentPart -= mainText.length - decimalPoint - 1;
        mainText = mainText.slice(0, decimalPoint) + mainText.slice(decimalPoint + 1);
      }
      if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
      mainText += new Array(exponentPart + 1).join("0");
      str = mainText;
    }
    var isValidFormat = /^([0-9][0-9]*)$/.test(str);
    if (!isValidFormat) throw new Error("Invalid integer: " + str);
    if (hasNativeBigIntSupport) {
      return new PlatformNumeric(BigInt(isNeg ? "-" + str : str));
    }
    var digitArr = [],
      maxLen = str.length,
      digitBlockLen = BASE_LOG,
      minLen = maxLen - digitBlockLen;
    while (maxLen > 0) {
      digitArr.push(+str.slice(minLen, maxLen));
      minLen -= digitBlockLen;
      if (minLen < 0) minLen = 0;
      maxLen -= digitBlockLen;
    }
    normalizeArray(digitArr);
    return new ExtendedNumeric(digitArr, isNeg);
  }

  // Parses a number value into a NumericEntity
  function processNumericValue(num) {
    if (hasNativeBigIntSupport) {
      return new PlatformNumeric(BigInt(num));
    }
    if (isExact(num)) {
      if (num !== floorOrCeil(num)) throw new Error(num + " is not an integer.");
      return new CompactNumeric(num);
    }
    return processStringValue(num.toString());
  }

  // Interprets various input types into a NumericEntity
  function interpretInput(val) {
    if (typeof val === "number") {
      return processNumericValue(val);
    }
    if (typeof val === "string") {
      return processStringValue(val);
    }
    if (typeof val === "bigint") {
      return new PlatformNumeric(val);
    }
    return val; // Assume it's already a NumericEntity instance
  }

  // Pre-populate common NumericEntity values
  for (var idx = 0; idx < 1e3; idx++) {
    NumericEntity[idx] = interpretInput(idx);
    if (idx > 0) NumericEntity[-idx] = interpretInput(-idx);
  }
  NumericEntity.unit = NumericEntity[1];
  NumericEntity.nullValue = NumericEntity[0];
  NumericEntity.negativeUnit = NumericEntity[-1];
  NumericEntity.maximum = findMaximum;
  NumericEntity.minimum = findMinimum;
  NumericEntity.commonDivisor = greatestCommonDivisor;
  NumericEntity.commonMultiple = leastCommonMultiple;
  NumericEntity.isAnInstance = function (x) {
    return x instanceof ExtendedNumeric || x instanceof CompactNumeric || x instanceof PlatformNumeric;
  };
  NumericEntity.randomRange = randomBetween;
  NumericEntity.fromDigitArray = function (digits, base, isNegative) {
    return parseBaseFromDigits(digits.map(interpretInput), interpretInput(base || 10), isNegative);
  };

  return NumericEntity;
})(); // End of large number arithmetic library

// Export the library if in a Node.js environment
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
  module.exports = largeNumber;
}
// Support for AMD loaders like RequireJS
if (typeof define === "function" && define.amd) {
  define("large-integer", [], function () {
    return largeNumber;
  });
}

// Function to locate an element in a sorted array using binary search
function locateInSortedArray(sortedCollection, targetElement) {
  // Define a comparison function
  let comparisonFn = (valA, valB) => valA - valB;

  var startIndex = 0;
  var endIndex = sortedCollection.length - 1;
  while (startIndex <= endIndex) {
    var midIndex = (endIndex + startIndex) >> 1; // Calculate middle index efficiently
    var comparisonResult = comparisonFn(targetElement, sortedCollection[midIndex]);
    if (comparisonResult > 0) {
      startIndex = midIndex + 1; // Target is in the upper half
    } else if (comparisonResult < 0) {
      endIndex = midIndex - 1; // Target is in the lower half
    } else {
      return midIndex; // Element found
    }
  }
  return -startIndex - 1; // Element not found, return insertion point
}

// Main processing function
function processInputData(rawData) {
  // Initialize input reader
  const dataReader = new InputReader(rawData);

  // Read the total number of items
  const itemCount = dataReader.getNextValue();
  const itemValues = []; // Array to store item values
  const valuePositions = {}; // Map to store positions of each unique value

  // Loop to read item values and populate valuePositions map
  for (let idx = 0; idx < itemCount; idx++) {
    let currentValue = dataReader.getNextValue();
    itemValues.push(currentValue);

    if (!valuePositions[currentValue]) {
      valuePositions[currentValue] = [idx]; // First occurrence
    } else {
      valuePositions[currentValue].push(idx); // Subsequent occurrences
    }
  }

  // Initialize results array with the first element
  let calculatedOutcomes = [largeNumber(1)];
  // Iterate through the items starting from the second one
  for (let idx = 1; idx < itemCount; idx++) {
    // If current item is the same as the previous one
    if (itemValues[idx] === itemValues[idx - 1]) {
      calculatedOutcomes[idx] = calculatedOutcomes[idx - 1]; // Result is same as previous
    } else {
      // Find the position of the current item's index within its occurrences list
      let positionInMap = locateInSortedArray(valuePositions[itemValues[idx]], idx);
      // Get the index of the previous occurrence of the current value
      let previousIndex = valuePositions[itemValues[idx]][positionInMap - 1];

      // If a previous occurrence exists
      if (previousIndex !== undefined) {
        // Result is sum of previous overall result and result at previous occurrence
        calculatedOutcomes[idx] = calculatedOutcomes[idx - 1].combine(calculatedOutcomes[previousIndex]);
      } else {
        // If no previous occurrence, result is same as previous overall result
        calculatedOutcomes[idx] = calculatedOutcomes[idx - 1];
      }
    }
  }

  // Output the final result modulo 1000000007
  console.log(calculatedOutcomes[itemCount - 1].remainderOf(1000000007).toString());
}

// Execute the main function with input from stdin
processInputData(require("fs").readInputFileSync("/dev/stdinput", "utf8"));