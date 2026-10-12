"use strict";

// This module provides arbitrary-precision integer arithmetic capabilities.
// It wraps standard JavaScript numbers for small values and uses arrays for larger ones.
let largeNum = (function(missingVal) {
  "use strict";
  // Constants for internal representation and limits
  const NUM_BASE = 10000000; // Base for array digits (10^7)
  const BASE_EXPONENT = 7; // Log10 of NUM_BASE
  const MAX_SAFE_JS_NUM = 9007199254740992; // Max safe integer in JS (2^53)
  const MAX_SAFE_JS_ARRAY = shortNumToArray(MAX_SAFE_JS_NUM); // Max safe integer as array
  const LOG_MAX_SAFE_JS = Math.log(MAX_SAFE_JS_NUM); // Log of max safe integer

  // Main constructor function for numeric values
  function NumericValue(inputVal, baseSpec) {
    // If no value is provided, return the zero constant
    if (typeof inputVal === "undefined") {
      return NumericValue[0];
    }

    // If a base is specified, parse accordingly
    if (typeof baseSpec !== "undefined") {
      return +baseSpec === 10 ? processInput(inputVal) : parseGivenBase(inputVal, baseSpec);
    }

    // Otherwise, process the input value directly
    return processInput(inputVal);
  }

  // Constructor for large numbers (represented as arrays)
  function VastNumber(numVal, isNegative) {
    this.numVal = numVal;
    this.isNegative = isNegative;
    this.isCompact = false; // Flag indicating it's not a small integer
  }

  // Inherit methods from NumericValue prototype
  VastNumber.prototype = Object.create(NumericValue.prototype);

  // Constructor for small numbers (represented as standard JS numbers)
  function CompactNumber(numVal) {
    this.numVal = numVal;
    this.isNegative = numVal < 0;
    this.isCompact = true; // Flag indicating it's a small integer
  }

  // Inherit methods from NumericValue prototype
  CompactNumber.prototype = Object.create(NumericValue.prototype);

  // Checks if a number can be precisely represented by standard JS integers
  function isStandardPrecision(num) {
    return -MAX_SAFE_JS_NUM < num && num < MAX_SAFE_JS_NUM;
  }

  // Converts a standard JS number to its array representation (base NUM_BASE)
  function shortNumToArray(num) {
    if (num < NUM_BASE) return [num];
    if (num < NUM_BASE * NUM_BASE) return [num % NUM_BASE, Math.floor(num / NUM_BASE)];
    return [num % NUM_BASE, Math.floor(num / NUM_BASE) % NUM_BASE, Math.floor(num / (NUM_BASE * NUM_BASE))];
  }

  // Converts an array representation (base NUM_BASE) back to a standard JS number if possible
  function arrayToShortNum(numArray) {
    removeLeadingZeros(numArray); // Clean up array
    let len = numArray.length; // Get array length
    if (len < 4 && compareAbsolute(numArray, MAX_SAFE_JS_ARRAY) < 0) {
      switch (len) {
        case 0:
          return 0;
        case 1:
          return numArray[0];
        case 2:
          return numArray[0] + numArray[1] * NUM_BASE;
        default:
          return numArray[0] + (numArray[1] + numArray[2] * NUM_BASE) * NUM_BASE;
      }
    }
    return numArray;
  }

  // Removes leading zeros from an array representation of a number
  function removeLeadingZeros(valArray) {
    let index = valArray.length; // Start from the end
    while (index-- > 0 && valArray[index] === 0); // Find the first non-zero digit
    valArray.length = index + 1; // Trim the array
  }

  // Creates an array of a given size, initialized with zeros
  function initializeArray(size) {
    let newArr = new Array(size); // Create array
    let i = -1; // Initialize counter
    while (++i < size) {
      newArr[i] = 0; // Fill with zeros
    }
    return newArr;
  }

  // Truncates a number (removes decimal part)
  function chopFraction(num) {
    if (num > 0) return Math.floor(num); // For positive numbers
    return Math.ceil(num); // For negative numbers
  }

  // Performs addition of two number arrays (assuming positive values)
  function performAddition(arrA, arrB) {
    let lenA = arrA.length,
      lenB = arrB.length,
      resultArr = new Array(lenA),
      rem = 0,
      digitBase = NUM_BASE,
      currentSum, i;

    // Add digits up to the length of the shorter array
    for (i = 0; i < lenB; i++) {
      currentSum = arrA[i] + arrB[i] + rem;
      rem = currentSum >= digitBase ? 1 : 0;
      resultArr[i] = currentSum - rem * digitBase;
    }

    // Add remaining digits of the longer array, accounting for carry
    while (i < lenA) {
      currentSum = arrA[i] + rem;
      rem = currentSum === digitBase ? 1 : 0;
      resultArr[i++] = currentSum - rem * digitBase;
    }

    // If there's a final carry, add it
    if (rem > 0) resultArr.push(rem);

    return resultArr;
  }

  // Flexible addition, ensures the longer array is first for performAddition
  function flexibleAddition(arrA, arrB) {
    if (arrA.length >= arrB.length) return performAddition(arrA, arrB);
    return performAddition(arrB, arrA);
  }

  // Adds a compact number (carry) to a number array
  function addCompactToArr(numArray, compactCarry) {
    let len = numArray.length,
      resultArray = new Array(len),
      digitBase = NUM_BASE,
      currentSum, i;

    // Add compactCarry to each digit, propagating carry
    for (i = 0; i < len; i++) {
      currentSum = numArray[i] - digitBase + compactCarry; // Subtract base to handle potential negative sums gracefully
      compactCarry = Math.floor(currentSum / digitBase);
      resultArray[i] = currentSum - compactCarry * digitBase;
      compactCarry += 1; // Adjust compactCarry for next iteration
    }

    // Add any remaining carry
    while (compactCarry > 0) {
      resultArray[i++] = compactCarry % digitBase;
      compactCarry = Math.floor(compactCarry / digitBase);
    }
    return resultArray;
  }

  // VastNumber addition method
  VastNumber.prototype.append = function(operand) {
    let otherNum = processInput(operand);
    // If signs are different, convert to subtraction
    if (this.isNegative !== otherNum.isNegative) {
      return this.deduct(otherNum.invertSign());
    }

    let thisVal = this.numVal,
      otherVal = otherNum.numVal;

    // If the other number is compact, use optimized addition
    if (otherNum.isCompact) {
      return new VastNumber(addCompactToArr(thisVal, Math.abs(otherVal)), this.isNegative);
    }
    // Otherwise, use general array addition
    return new VastNumber(flexibleAddition(thisVal, otherVal), this.isNegative);
  };
  VastNumber.prototype.plusOp = VastNumber.prototype.append;

  // CompactNumber addition method
  CompactNumber.prototype.append = function(operand) {
    let otherNum = processInput(operand);
    let thisVal = this.numVal;

    // If signs are different, convert to subtraction
    if ((thisVal < 0) !== otherNum.isNegative) {
      return this.deduct(otherNum.invertSign());
    }

    let otherVal = otherNum.numVal;
    // If both are compact, perform direct addition
    if (otherNum.isCompact) {
      if (isStandardPrecision(thisVal + otherVal)) {
        return new CompactNumber(thisVal + otherVal);
      }
      // If result exceeds standard precision, convert otherVal to array
      otherVal = shortNumToArray(Math.abs(otherVal));
    }
    // If otherNum is not compact or result exceeds precision, convert to VastNumber addition
    return new VastNumber(addCompactToArr(otherVal, Math.abs(thisVal)), thisVal < 0);
  };
  CompactNumber.prototype.plusOp = CompactNumber.prototype.append;

  // Performs subtraction of two number arrays (assuming positive values, arrA >= arrB)
  function performSubtraction(arrA, arrB) {
    let lenA = arrA.length,
      lenB = arrB.length,
      resultArr = new Array(lenA),
      debt = 0,
      digitBase = NUM_BASE,
      i, diffVal;

    // Subtract digits up to the length of the shorter array
    for (i = 0; i < lenB; i++) {
      diffVal = arrA[i] - debt - arrB[i];
      if (diffVal < 0) {
        diffVal += digitBase;
        debt = 1;
      } else {
        debt = 0;
      }
      resultArr[i] = diffVal;
    }

    // Subtract remaining digits of the longer array, accounting for borrow
    for (i = lenB; i < lenA; i++) {
      diffVal = arrA[i] - debt;
      if (diffVal < 0) {
        diffVal += digitBase;
      } else {
        resultArr[i++] = diffVal; // If no borrow, can just assign and break
        break;
      }
      resultArr[i] = diffVal;
    }

    // Copy any remaining untouched digits
    for (; i < lenA; i++) {
      resultArr[i] = arrA[i];
    }
    removeLeadingZeros(resultArr); // Clean up result
    return resultArr;
  }

  // Flexible subtraction, handles signs and magnitude comparison
  function flexibleSubtraction(arrA, arrB, currentSign) {
    let resultVal;
    // If arrA is greater or equal in magnitude, perform A - B
    if (compareAbsolute(arrA, arrB) >= 0) {
      resultVal = performSubtraction(arrA, arrB);
    } else {
      // Otherwise, perform B - A and invert the sign
      resultVal = performSubtraction(arrB, arrA);
      currentSign = !currentSign;
    }
    resultVal = arrayToShortNum(resultVal); // Convert to compact if possible

    if (typeof resultVal === "number") {
      if (currentSign) resultVal = -resultVal;
      return new CompactNumber(resultVal);
    }
    return new VastNumber(resultVal, currentSign);
  }

  // Subtracts a compact number from a number array
  function subtractCompactFromArr(numArray, compactVal, currentSign) {
    let len = numArray.length,
      resultArr = new Array(len),
      debt = -compactVal, // Initial debt is the negative compact value
      digitBase = NUM_BASE,
      i, diffVal;

    // Perform subtraction with carry/borrow
    for (i = 0; i < len; i++) {
      diffVal = numArray[i] + debt;
      debt = Math.floor(diffVal / digitBase);
      diffVal %= digitBase;
      resultArr[i] = diffVal < 0 ? diffVal + digitBase : diffVal;
    }
    resultArr = arrayToShortNum(resultArr); // Convert to compact if possible

    if (typeof resultArr === "number") {
      if (currentSign) resultArr = -resultArr;
      return new CompactNumber(resultArr);
    }
    return new VastNumber(resultArr, currentSign);
  }

  // VastNumber subtraction method
  VastNumber.prototype.deduct = function(operand) {
    let otherNum = processInput(operand);
    // If signs are different, convert to addition
    if (this.isNegative !== otherNum.isNegative) {
      return this.append(otherNum.invertSign());
    }

    let thisVal = this.numVal,
      otherVal = otherNum.numVal;

    // If the other number is compact, use optimized subtraction
    if (otherNum.isCompact) {
      return subtractCompactFromArr(thisVal, Math.abs(otherVal), this.isNegative);
    }
    // Otherwise, use general array subtraction
    return flexibleSubtraction(thisVal, otherVal, this.isNegative);
  };
  VastNumber.prototype.minusOp = VastNumber.prototype.deduct;

  // CompactNumber subtraction method
  CompactNumber.prototype.deduct = function(operand) {
    let otherNum = processInput(operand);
    let thisVal = this.numVal;

    // If signs are different, convert to addition
    if ((thisVal < 0) !== otherNum.isNegative) {
      return this.append(otherNum.invertSign());
    }

    let otherVal = otherNum.numVal;
    // If both are compact, perform direct subtraction
    if (otherNum.isCompact) {
      return new CompactNumber(thisVal - otherVal);
    }
    // If otherNum is not compact, convert to VastNumber subtraction
    return subtractCompactFromArr(otherVal, Math.abs(thisVal), thisVal >= 0);
  };
  CompactNumber.prototype.minusOp = CompactNumber.prototype.deduct;

  // Inverts the sign of a VastNumber
  VastNumber.prototype.invertSign = function() {
    return new VastNumber(this.numVal, !this.isNegative);
  };

  // Inverts the sign of a CompactNumber
  CompactNumber.prototype.invertSign = function() {
    let currentSign = this.isNegative;
    let compactResult = new CompactNumber(-this.numVal);
    compactResult.isNegative = !currentSign; // Ensure sign flag is consistent
    return compactResult;
  };

  // Returns the absolute value of a VastNumber
  VastNumber.prototype.absoluteValue = function() {
    return new VastNumber(this.numVal, false);
  };

  // Returns the absolute value of a CompactNumber
  CompactNumber.prototype.absoluteValue = function() {
    return new CompactNumber(Math.abs(this.numVal));
  };

  // Performs long multiplication of two number arrays
  function longMultiplication(arrA, arrB) {
    let lenA = arrA.length,
      lenB = arrB.length,
      totalLen = lenA + lenB,
      resultArr = initializeArray(totalLen), // Initialize result array with zeros
      digitBase = NUM_BASE,
      currentProd, rem, i, valA_i, valB_j;

    // Iterate through each digit of arrA
    for (i = 0; i < lenA; ++i) {
      valA_i = arrA[i];
      // Multiply valA_i by each digit of arrB and add to result
      for (let j = 0; j < lenB; ++j) {
        valB_j = arrB[j];
        currentProd = valA_i * valB_j + resultArr[i + j];
        rem = Math.floor(currentProd / digitBase);
        resultArr[i + j] = currentProd - rem * digitBase;
        resultArr[i + j + 1] += rem; // Add carry to the next position
      }
    }
    removeLeadingZeros(resultArr); // Clean up result
    return resultArr;
  }

  // Multiplies a number array by a compact number
  function multiplyArrayByCompact(numArray, compactVal) {
    let len = numArray.length,
      resultArr = new Array(len),
      digitBase = NUM_BASE,
      rem = 0,
      currentProd, i;

    // Multiply each digit by compactVal, propagating carry
    for (i = 0; i < len; i++) {
      currentProd = numArray[i] * compactVal + rem;
      rem = Math.floor(currentProd / digitBase);
      resultArr[i] = currentProd - rem * digitBase;
    }

    // Add any remaining carry
    while (rem > 0) {
      resultArr[i++] = rem % digitBase;
      rem = Math.floor(rem / digitBase);
    }
    return resultArr;
  }

  // Pads an array with zeros on the left (effectively shifting left)
  function padWithZeros(numArray, count) {
    let zeroPad = [];
    while (count-- > 0) zeroPad.push(0);
    return zeroPad.concat(numArray);
  }

  // Karatsuba multiplication algorithm for large numbers
  function karatsubaMultiply(arrX, arrY) {
    let arrLen = Math.max(arrX.length, arrY.length);
    // If arrays are small enough, use standard long multiplication
    if (arrLen <= 30) return longMultiplication(arrX, arrY);

    arrLen = Math.ceil(arrLen / 2); // Split point

    // Divide numbers into parts
    let partB = arrX.slice(arrLen),
      partA = arrX.slice(0, arrLen),
      partD = arrY.slice(arrLen),
      partC = arrY.slice(0, arrLen);

    // Recursively compute products
    let prodAC = karatsubaMultiply(partA, partC),
      prodBD = karatsubaMultiply(partB, partD),
      prodABCD = karatsubaMultiply(flexibleAddition(partA, partB), flexibleAddition(partC, partD));

    // Combine results using Karatsuba formula
    let finalProd = flexibleAddition(
      flexibleAddition(prodAC, padWithZeros(performSubtraction(performSubtraction(prodABCD, prodAC), prodBD), arrLen)),
      padWithZeros(prodBD, 2 * arrLen)
    );
    removeLeadingZeros(finalProd); // Clean up result
    return finalProd;
  }

  // Heuristic to decide whether to use Karatsuba algorithm
  function shouldUseKaratsuba(len1, len2) {
    return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
  }

  // VastNumber multiplication method
  VastNumber.prototype.scale = function(operand) {
    let otherNum = processInput(operand),
      thisVal = this.numVal,
      otherVal = otherNum.numVal,
      isNegative = this.isNegative !== otherNum.isNegative,
      absolute;

    // Handle compact otherNum cases
    if (otherNum.isCompact) {
      absolute = otherVal;
      if (absolute === 0) return NumericValue[0];
      if (absolute === 1) return this;
      if (absolute === -1) return this.invertSign();

      absolute = Math.abs(absolute);
      if (absolute < NUM_BASE) {
        return new VastNumber(multiplyArrayByCompact(thisVal, absolute), isNegative);
      }
      otherVal = shortNumToArray(absolute); // Convert to array if too large for compact multiplication
    }

    // Decide between Karatsuba and long multiplication
    if (shouldUseKaratsuba(thisVal.length, otherVal.length)) {
      return new VastNumber(karatsubaMultiply(thisVal, otherVal), isNegative);
    }
    return new VastNumber(longMultiplication(thisVal, otherVal), isNegative);
  };
  VastNumber.prototype.timesOp = VastNumber.prototype.scale;

  // Multiplies a compact number by an array number
  function multiplyCompactAndArray(compactVal, numArray, isNegative) {
    if (compactVal < NUM_BASE) {
      return new VastNumber(multiplyArrayByCompact(numArray, compactVal), isNegative);
    }
    return new VastNumber(longMultiplication(numArray, shortNumToArray(compactVal)), isNegative);
  }

  // Internal multiplication helper for CompactNumber by CompactNumber (optimizes)
  CompactNumber.prototype._scaleByCompact = function(otherCompact) {
    if (isStandardPrecision(otherCompact.numVal * this.numVal)) {
      return new CompactNumber(otherCompact.numVal * this.numVal);
    }
    return multiplyCompactAndArray(Math.abs(otherCompact.numVal), shortNumToArray(Math.abs(this.numVal)), this.isNegative !== otherCompact.isNegative);
  };

  // Internal multiplication helper for VastNumber by CompactNumber (optimizes)
  VastNumber.prototype._scaleByCompact = function(otherCompact) {
    if (otherCompact.numVal === 0) return NumericValue[0];
    if (otherCompact.numVal === 1) return this;
    if (otherCompact.numVal === -1) return this.invertSign();
    return multiplyCompactAndArray(Math.abs(otherCompact.numVal), this.numVal, this.isNegative !== otherCompact.isNegative);
  };

  // CompactNumber multiplication method
  CompactNumber.prototype.scale = function(operand) {
    return processInput(operand)._scaleByCompact(this);
  };
  CompactNumber.prototype.timesOp = CompactNumber.prototype.scale;

  // Computes the square of a number array
  function computeSquare(numArray) {
    let len = numArray.length,
      resultArr = initializeArray(len + len), // Result can be up to 2*len digits
      digitBase = NUM_BASE,
      currentProd, rem, i, val_i, val_j;

    // Iterate through digits for squaring
    for (i = 0; i < len; i++) {
      val_i = numArray[i];
      rem = 0 - val_i * val_i; // Initialize carry with negative square
      for (let j = i; j < len; j++) {
        val_j = numArray[j];
        currentProd = 2 * (val_i * val_j) + resultArr[i + j] + rem;
        rem = Math.floor(currentProd / digitBase);
        resultArr[i + j] = currentProd - rem * digitBase;
      }
      resultArr[i + len] = rem; // Store final carry
    }
    removeLeadingZeros(resultArr); // Clean up result
    return resultArr;
  }

  // VastNumber square method
  VastNumber.prototype.squared = function() {
    return new VastNumber(computeSquare(this.numVal), false);
  };

  // CompactNumber square method
  CompactNumber.prototype.squared = function() {
    let result = this.numVal * this.numVal;
    if (isStandardPrecision(result)) return new CompactNumber(result);
    return new VastNumber(computeSquare(shortNumToArray(Math.abs(this.numVal))), false);
  };

  // Division with remainder using method 1 (Knuth's Algorithm D)
  function longDivisionMethod1(dividendArr, divisorArr) {
    let lenA = dividendArr.length,
      lenB = divisorArr.length,
      digitBase = NUM_BASE,
      quotientDigits = initializeArray(divisorArr.length), // Initialize quotient array
      divMSD = divisorArr[lenB - 1], // Most significant digit of divisor
      scalingFactor = Math.ceil(digitBase / (2 * divMSD)), // Normalization factor
      currentRemainder = multiplyArrayByCompact(dividendArr, scalingFactor), // Scale dividend
      scaledDivisor = multiplyArrayByCompact(divisorArr, scalingFactor), // Scale divisor
      qDigit, posShift, rem, debt, i, len, tempQ;

    // Adjust currentRemainder length if needed
    if (currentRemainder.length <= lenA) currentRemainder.push(0);
    scaledDivisor.push(0); // Pad scaledDivisor for easier indexing
    divMSD = scaledDivisor[lenB - 1]; // Update MSD after scaling

    // Main loop for calculating quotient digits
    for (posShift = lenA - lenB; posShift >= 0; posShift--) {
      qDigit = digitBase - 1; // Initial guess for quotient digit
      // Refine qDigit guess
      if (currentRemainder[posShift + lenB] !== divMSD) {
        qDigit = Math.floor((currentRemainder[posShift + lenB] * digitBase + currentRemainder[posShift + lenB - 1]) / divMSD);
      }

      rem = 0;
      debt = 0;
      len = scaledDivisor.length;

      // Multiply qDigit by scaledDivisor and subtract from currentRemainder
      for (i = 0; i < len; i++) {
        rem += qDigit * scaledDivisor[i];
        tempQ = Math.floor(rem / digitBase);
        debt += currentRemainder[posShift + i] - (rem - tempQ * digitBase);
        rem = tempQ;
        if (debt < 0) {
          currentRemainder[posShift + i] = debt + digitBase;
          debt = -1;
        } else {
          currentRemainder[posShift + i] = debt;
          debt = 0;
        }
      }

      // Adjust qDigit if it was too large
      while (debt !== 0) {
        qDigit -= 1;
        rem = 0;
        for (i = 0; i < len; i++) {
          rem += currentRemainder[posShift + i] - digitBase + scaledDivisor[i];
          if (rem < 0) {
            currentRemainder[posShift + i] = rem + digitBase;
            rem = 0;
          } else {
            currentRemainder[posShift + i] = rem;
            rem = 1;
          }
        }
        debt += rem;
      }
      quotientDigits[posShift] = qDigit;
    }
    // Unscale the remainder
    currentRemainder = divideArrayByCompact(currentRemainder, scalingFactor)[0];
    return [arrayToShortNum(quotientDigits), arrayToShortNum(currentRemainder)];
  }

  // Division with remainder using method 2 (simpler, repeated subtraction)
  function longDivisionMethod2(dividendArr, divisorArr) {
    let lenA = dividendArr.length,
      lenB = divisorArr.length,
      quotientDigits = [],
      currentPart = [],
      digitBase = NUM_BASE,
      qGuess, partLen, highDividend, highDivisor, checkProd;

    // Process dividend digits from most significant to least
    while (lenA) {
      currentPart.unshift(dividendArr[--lenA]); // Add next digit to currentPart
      removeLeadingZeros(currentPart); // Clean up currentPart

      // If currentPart is less than divisor, quotient digit is 0
      if (compareAbsolute(currentPart, divisorArr) < 0) {
        quotientDigits.push(0);
        continue;
      }

      partLen = currentPart.length;
      // Estimate quotient digit
      highDividend = currentPart[partLen - 1] * digitBase + currentPart[partLen - 2];
      highDivisor = divisorArr[lenB - 1] * digitBase + divisorArr[lenB - 2];

      if (partLen > lenB) {
        highDividend = (highDividend + 1) * digitBase;
      }
      qGuess = Math.ceil(highDividend / highDivisor);

      // Refine quotient digit guess by trial subtraction
      do {
        checkProd = multiplyArrayByCompact(divisorArr, qGuess);
        if (compareAbsolute(checkProd, currentPart) <= 0) break;
        qGuess--;
      } while (qGuess);

      quotientDigits.push(qGuess); // Add refined quotient digit
      currentPart = performSubtraction(currentPart, checkProd); // Subtract to get new remainder
    }
    quotientDigits.reverse(); // Reverse to get correct order
    return [arrayToShortNum(quotientDigits), arrayToShortNum(currentPart)];
  }

  // Divides a number array by a compact number
  function divideArrayByCompact(numArray, compactDivisor) {
    let len = numArray.length,
      qArr = initializeArray(len), // Initialize quotient array
      digitBase = NUM_BASE,
      i, qVal, rem, currentDivisor;

    rem = 0; // Initialize remainder
    // Process digits from most significant to least
    for (i = len - 1; i >= 0; --i) {
      currentDivisor = rem * digitBase + numArray[i];
      qVal = chopFraction(currentDivisor / compactDivisor);
      rem = currentDivisor - qVal * compactDivisor;
      qArr[i] = qVal | 0; // Store integer part of quotient
    }
    return [qArr, rem | 0]; // Return quotient array and final remainder
  }

  // Flexible division and modulo operation
  function flexibleDivMod(thisObj, operand) {
    let otherNum = processInput(operand);
    let thisVal = thisObj.numVal,
      otherVal = otherNum.numVal;
    let qResult; // Quotient result

    if (otherVal === 0) throw new Error("Cannot divide by zero");

    // Handle small integer cases
    if (thisObj.isCompact) {
      if (otherNum.isCompact) {
        return [new CompactNumber(chopFraction(thisVal / otherVal)), new CompactNumber(thisVal % otherVal)];
      }
      return [NumericValue[0], thisObj]; // Small dividend / large divisor => quotient 0, remainder dividend
    }

    // Handle large dividend / small divisor cases
    if (otherNum.isCompact) {
      if (otherVal === 1) return [thisObj, NumericValue[0]];
      if (otherVal === -1) return [thisObj.invertSign(), NumericValue[0]];

      let absolute = Math.abs(otherVal);
      if (absolute < NUM_BASE) {
        let resultVal = divideArrayByCompact(thisVal, absolute);
        qResult = arrayToShortNum(resultVal[0]);
        let remainderResult = resultVal[1];
        if (thisObj.isNegative) remainderResult = -remainderResult; // Adjust remainder sign

        if (typeof qResult === "number") {
          if (thisObj.isNegative !== otherNum.isNegative) qResult = -qResult; // Adjust quotient sign
          return [new CompactNumber(qResult), new CompactNumber(remainderResult)];
        }
        return [new VastNumber(qResult, thisObj.isNegative !== otherNum.isNegative), new CompactNumber(remainderResult)];
      }
      otherVal = shortNumToArray(absolute); // Convert small divisor to array if too large for compact div
    }

    // General case: large dividend / large divisor
    let comparison = compareAbsolute(thisVal, otherVal);
    if (comparison === -1) return [NumericValue[0], thisObj]; // Dividend < Divisor
    if (comparison === 0) return [NumericValue[thisObj.isNegative === otherNum.isNegative ? 1 : -1], NumericValue[0]]; // Dividend == Divisor

    // Choose division method based on size
    let resultVal;
    if (thisVal.length + otherVal.length <= 200) { // Heuristic for switching algorithms
      resultVal = longDivisionMethod1(thisVal, otherVal);
    } else {
      resultVal = longDivisionMethod2(thisVal, otherVal);
    }

    qResult = resultVal[0];
    let qIsNegative = thisObj.isNegative !== otherNum.isNegative,
      remainderResult = resultVal[1],
      mIsNegative = thisObj.isNegative;

    // Convert quotient to appropriate NumericValue type
    if (typeof qResult === "number") {
      if (qIsNegative) qResult = -qResult;
      qResult = new CompactNumber(qResult);
    } else qResult = new VastNumber(qResult, qIsNegative);

    // Convert remainder to appropriate NumericValue type
    if (typeof remainderResult === "number") {
      if (mIsNegative) remainderResult = -remainderResult;
      remainderResult = new CompactNumber(remainderResult);
    } else remainderResult = new VastNumber(remainderResult, mIsNegative);

    return [qResult, remainderResult];
  }

  // VastNumber division and remainder method
  VastNumber.prototype.divideAndRemainder = function(operand) {
    let result = flexibleDivMod(this, operand);
    return {
      quotient: result[0],
      remainder: result[1]
    };
  };
  CompactNumber.prototype.divideAndRemainder = VastNumber.prototype.divideAndRemainder;

  // VastNumber division method (returns only quotient)
  VastNumber.prototype.divideBy = function(operand) {
    return flexibleDivMod(this, operand)[0];
  };
  CompactNumber.prototype.overOp = CompactNumber.prototype.divideBy;
  VastNumber.prototype.overOp = VastNumber.prototype.divideBy;

  // VastNumber modulo method (returns only remainder)
  VastNumber.prototype.modulo = function(operand) {
    return flexibleDivMod(this, operand)[1];
  };
  CompactNumber.prototype.remainderOp = CompactNumber.prototype.modulo;
  VastNumber.prototype.remainderOp = VastNumber.prototype.modulo;

  // VastNumber exponentiation method
  VastNumber.prototype.power = function(operand) {
    let exponent = processInput(operand),
      baseVal = this.numVal,
      expVal = exponent.numVal,
      computedVal, currentBase, currentResult;

    if (expVal === 0) return NumericValue[1]; // x^0 = 1
    if (baseVal === 0) return NumericValue[0]; // 0^y = 0 (for y > 0)
    if (baseVal === 1) return NumericValue[1]; // 1^y = 1
    if (baseVal === -1) return exponent.isEvenlyDivisible() ? NumericValue[1] : NumericValue[-1]; // (-1)^y

    if (exponent.isNegative) { // Negative exponent not supported for integers
      return NumericValue[0];
    }
    if (!exponent.isCompact) { // Exponent too large
      throw new Error(`The exponent ${exponent.toText()} is too large.`);
    }

    // Handle small base values
    if (this.isCompact) {
      if (isStandardPrecision(computedVal = Math.pow(baseVal, expVal))) {
        return new CompactNumber(chopFraction(computedVal));
      }
    }

    currentBase = this;
    currentResult = NumericValue[1];

    // Binary exponentiation (exponentiation by squaring)
    while (true) {
      if ((expVal & 1) === 1) { // If exponent is odd
        currentResult = currentResult.timesOp(currentBase);
        --expVal;
      }
      if (expVal === 0) break; // If exponent is zero, done
      expVal /= 2; // Divide exponent by 2
      currentBase = currentBase.squared(); // Square the base
    }
    return currentResult;
  };
  CompactNumber.prototype.power = VastNumber.prototype.power;

  // VastNumber modular exponentiation method (base^exp mod modulus)
  VastNumber.prototype.modularExponentiation = function(exponent, modulus) {
    exponent = processInput(exponent);
    modulus = processInput(modulus);

    if (modulus.isZeroValue()) throw new Error("Cannot take modular exponentiation with modulus 0");

    let result = NumericValue[1],
      currentBase = this.modulo(modulus); // Reduce base modulo modulus

    // Binary exponentiation with modulo at each step
    while (exponent.isPositiveValue()) {
      if (currentBase.isZeroValue()) return NumericValue[0]; // Optimization: 0^exp mod N = 0
      if (exponent.isOddValue()) result = result.scale(currentBase).modulo(modulus); // If exponent is odd
      exponent = exponent.divideBy(2); // Halve exponent
      currentBase = currentBase.squared().modulo(modulus); // Square base modulo modulus
    }
    return result;
  };
  CompactNumber.prototype.modularExponentiation = VastNumber.prototype.modularExponentiation;

  // Compares the absolute values of two number arrays
  function compareAbsolute(arrA, arrB) {
    if (arrA.length !== arrB.length) {
      return arrA.length > arrB.length ? 1 : -1;
    }
    // Compare digits from most significant to least
    for (let i = arrA.length - 1; i >= 0; i--) {
      if (arrA[i] !== arrB[i]) return arrA[i] > arrB[i] ? 1 : -1;
    }
    return 0; // Arrays are equal in magnitude
  }

  // VastNumber absolute magnitude comparison
  VastNumber.prototype.compareMagnitude = function(operand) {
    let otherNum = processInput(operand),
      thisVal = this.numVal,
      otherVal = otherNum.numVal;
    if (otherNum.isCompact) return 1; // VastNumber is always larger than CompactNumber in magnitude if not equal
    return compareAbsolute(thisVal, otherVal);
  };

  // CompactNumber absolute magnitude comparison
  CompactNumber.prototype.compareMagnitude = function(operand) {
    let otherNum = processInput(operand),
      thisVal = Math.abs(this.numVal),
      otherVal = otherNum.numVal;
    if (otherNum.isCompact) {
      otherVal = Math.abs(otherVal);
      return thisVal === otherVal ? 0 : thisVal > otherVal ? 1 : -1;
    }
    return -1; // CompactNumber is always smaller than VastNumber in magnitude
  };

  // VastNumber general comparison
  VastNumber.prototype.compareWith = function(operand) {
    if (operand === Infinity) {
      return -1;
    }
    if (operand === -Infinity) {
      return 1;
    }
    let otherNum = processInput(operand),
      thisVal = this.numVal,
      otherVal = otherNum.numVal;

    // Handle sign differences
    if (this.isNegative !== otherNum.isNegative) {
      return otherNum.isNegative ? 1 : -1;
    }

    // If otherNum is compact, and signs are same, this VastNumber is greater (unless this.isNegative)
    if (otherNum.isCompact) {
      return this.isNegative ? -1 : 1;
    }
    // Compare absolute values, then apply sign
    return compareAbsolute(thisVal, otherVal) * (this.isNegative ? -1 : 1);
  };
  VastNumber.prototype.compareToOp = VastNumber.prototype.compareWith;

  // CompactNumber general comparison
  CompactNumber.prototype.compareWith = function(operand) {
    if (operand === Infinity) {
      return -1;
    }
    if (operand === -Infinity) {
      return 1;
    }
    let otherNum = processInput(operand),
      thisVal = this.numVal,
      otherVal = otherNum.numVal;

    // If otherNum is compact, direct comparison
    if (otherNum.isCompact) {
      return thisVal === otherVal ? 0 : thisVal > otherVal ? 1 : -1;
    }

    // If otherNum is VastNumber, compare signs
    if ((thisVal < 0) !== otherNum.isNegative) {
      return thisVal < 0 ? -1 : 1;
    }
    // If signs are the same, and otherNum is VastNumber, then this CompactNumber is smaller
    return thisVal < 0 ? 1 : -1;
  };
  CompactNumber.prototype.compareToOp = CompactNumber.prototype.compareWith;

  // Equality checks
  VastNumber.prototype.isEqualTo = function(operand) {
    return this.compareWith(operand) === 0;
  };
  CompactNumber.prototype.equalOp = CompactNumber.prototype.isEqualTo;
  VastNumber.prototype.equalOp = VastNumber.prototype.isEqualTo;

  // Inequality checks
  VastNumber.prototype.isNotEqualTo = function(operand) {
    return this.compareWith(operand) !== 0;
  };
  CompactNumber.prototype.notEqualOp = CompactNumber.prototype.isNotEqualTo;
  VastNumber.prototype.notEqualOp = VastNumber.prototype.isNotEqualTo;

  // Greater than
  VastNumber.prototype.isGreaterThan = function(operand) {
    return this.compareWith(operand) > 0;
  };
  CompactNumber.prototype.greaterThanOp = CompactNumber.prototype.isGreaterThan;
  VastNumber.prototype.greaterThanOp = VastNumber.prototype.isGreaterThan;

  // Less than
  VastNumber.prototype.isLessThan = function(operand) {
    return this.compareWith(operand) < 0;
  };
  CompactNumber.prototype.lessThanOp = CompactNumber.prototype.isLessThan;
  VastNumber.prototype.lessThanOp = VastNumber.prototype.isLessThan;

  // Greater than or equal to
  VastNumber.prototype.isGreaterThanOrEqualTo = function(operand) {
    return this.compareWith(operand) >= 0;
  };
  CompactNumber.prototype.greaterThanOrEqualOp = CompactNumber.prototype.isGreaterThanOrEqualTo;
  VastNumber.prototype.greaterThanOrEqualOp = VastNumber.prototype.isGreaterThanOrEqualTo;

  // Less than or equal to
  VastNumber.prototype.isLessThanOrEqualTo = function(operand) {
    return this.compareWith(operand) <= 0;
  };
  CompactNumber.prototype.lessThanOrEqualOp = CompactNumber.prototype.isLessThanOrEqualTo;
  VastNumber.prototype.lessThanOrEqualOp = VastNumber.prototype.isLessThanOrEqualTo;

  // Parity checks
  VastNumber.prototype.isEvenlyDivisible = function() {
    return (this.numVal[0] & 1) === 0;
  };
  CompactNumber.prototype.isEvenlyDivisible = function() {
    return (this.numVal & 1) === 0;
  };

  VastNumber.prototype.isOddValue = function() {
    return (this.numVal[0] & 1) === 1;
  };
  CompactNumber.prototype.isOddValue = function() {
    return (this.numVal & 1) === 1;
  };

  // Sign checks
  VastNumber.prototype.isPositiveValue = function() {
    return !this.isNegative;
  };
  CompactNumber.prototype.isPositiveValue = function() {
    return this.numVal > 0;
  };

  VastNumber.prototype.isNegativeValue = function() {
    return this.isNegative;
  };
  CompactNumber.prototype.isNegativeValue = function() {
    return this.numVal < 0;
  };

  // Special value checks
  VastNumber.prototype.isOneOrMinusOne = function() {
    return false;
  };
  CompactNumber.prototype.isOneOrMinusOne = function() {
    return Math.abs(this.numVal) === 1;
  };

  VastNumber.prototype.isZeroValue = function() {
    return false;
  };
  CompactNumber.prototype.isZeroValue = function() {
    return this.numVal === 0;
  };

  // Divisibility check
  VastNumber.prototype.canBeDividedBy = function(operand) {
    let otherNum = processInput(operand);
    let val = otherNum.numVal;
    if (val === 0) return false;
    if (val === 1) return true;
    if (val === 2) return this.isEvenlyDivisible();
    return this.modulo(otherNum).isEqualTo(NumericValue[0]);
  };
  CompactNumber.prototype.canBeDividedBy = VastNumber.prototype.canBeDividedBy;

  // Basic primality test for small numbers
  function checkBasicPrime(num) {
    let absNum = num.absoluteValue();
    if (absNum.isOneOrMinusOne()) return false;
    if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
    if (absNum.isEvenlyDivisible() || absNum.canBeDividedBy(3) || absNum.canBeDividedBy(5)) return false;
    if (absNum.isLessThan(25)) return true; // Primes below 25: 2,3,5,7,11,13,17,19,23
  }

  // VastNumber primality test (Miller-Rabin for larger numbers)
  VastNumber.prototype.isReallyPrime = function() {
    let isPrimeResult = checkBasicPrime(this);
    if (isPrimeResult !== undefined) return isPrimeResult;

    let num = this.absoluteValue(),
      numPrev = num.decrement(); // n-1
    let bases = [2, 3, 5, 7, 11, 13, 17, 19],
      tempB = numPrev,
      d, t, i, x;

    // Find d and s such that n-1 = d * 2^s
    while (tempB.isEvenlyDivisible()) tempB = tempB.divideBy(2);

    // Miller-Rabin test for each base
    for (i = 0; i < bases.length; i++) {
      x = largeNum(bases[i]).modularExponentiation(tempB, num); // a^d mod n
      if (x.isEqualTo(NumericValue[1]) || x.isEqualTo(numPrev)) continue; // Passes first condition

      for (t = true, d = tempB; t && d.isLessThan(numPrev); d = d.scale(2)) {
        x = x.squared().modulo(num); // x = x^2 mod n
        if (x.isEqualTo(numPrev)) t = false; // Passes second condition
      }
      if (t) return false; // Fails Miller-Rabin test
    }
    return true; // Likely prime
  };
  CompactNumber.prototype.isReallyPrime = VastNumber.prototype.isReallyPrime;

  // VastNumber probable primality test (Miller-Rabin with configurable iterations)
  VastNumber.prototype.isLikelyPrime = function(iterations) {
    let isPrimeResult = checkBasicPrime(this);
    if (isPrimeResult !== undefined) return isPrimeResult;

    let num = this.absoluteValue();
    let numIterations = iterations === undefined ? 5 : iterations; // Default to 5 iterations

    for (let i = 0; i < numIterations; i++) {
      let randA = largeNum.randomBetween(2, num.minusOp(2)); // Random base a
      if (!randA.modularExponentiation(num.decrement(), num).isOneOrMinusOne()) return false; // a^(n-1) mod n != 1
    }
    return true; // Probably prime
  };
  CompactNumber.prototype.isLikelyPrime = VastNumber.prototype.isLikelyPrime;

  // VastNumber modular inverse (extended Euclidean algorithm)
  VastNumber.prototype.modularInverse = function(modulus) {
    let t = largeNum.zero,
      newT = largeNum.one,
      r = processInput(modulus),
      newR = this.absoluteValue(),
      qVal, lastT, lastR;

    // Extended Euclidean algorithm
    while (!newR.isZeroValue()) {
      qVal = r.divideBy(newR);
      lastT = t;
      lastR = r;
      t = newT;
      r = newR;
      newT = lastT.deduct(qVal.scale(newT));
      newR = lastR.deduct(qVal.scale(newR));
    }

    if (!r.isEqualTo(1)) throw new Error(`${this.toText()} and ${modulus.toText()} are not co-prime`);
    if (t.compareWith(0) === -1) {
      t = t.append(modulus); // Ensure positive result
    }
    if (this.isNegativeValue()) {
      return t.invertSign();
    }
    return t;
  };
  CompactNumber.prototype.modularInverse = VastNumber.prototype.modularInverse;

  // VastNumber increment
  VastNumber.prototype.increment = function() {
    let numVal = this.numVal;
    if (this.isNegative) {
      return subtractCompactFromArr(numVal, 1, this.isNegative);
    }
    return new VastNumber(addCompactToArr(numVal, 1), this.isNegative);
  };

  // CompactNumber increment
  CompactNumber.prototype.increment = function() {
    let numVal = this.numVal;
    if (numVal + 1 < MAX_SAFE_JS_NUM) return new CompactNumber(numVal + 1);
    return new VastNumber(MAX_SAFE_JS_ARRAY, false); // If overflows, convert to VastNumber
  };

  // VastNumber decrement
  VastNumber.prototype.decrement = function() {
    let numVal = this.numVal;
    if (this.isNegative) {
      return new VastNumber(addCompactToArr(numVal, 1), true);
    }
    return subtractCompactFromArr(numVal, 1, this.isNegative);
  };

  // CompactNumber decrement
  CompactNumber.prototype.decrement = function() {
    let numVal = this.numVal;
    if (numVal - 1 > -MAX_SAFE_JS_NUM) return new CompactNumber(numVal - 1);
    return new VastNumber(MAX_SAFE_JS_ARRAY, true); // If underflows, convert to VastNumber
  };


  // Powers of 2 for efficient shifting
  let binaryFactors = [1];
  while (2 * binaryFactors[binaryFactors.length - 1] <= NUM_BASE) {
    binaryFactors.push(2 * binaryFactors[binaryFactors.length - 1]);
  }
  let binaryFactorsLen = binaryFactors.length,
    maxBinaryFactor = binaryFactors[binaryFactorsLen - 1];

  // Checks if shift amount is small enough for direct conversion
  function isShiftAmountCompact(val) {
    return (typeof val === "number" || typeof val === "string") && +Math.abs(val) <= NUM_BASE || val instanceof VastNumber && val.numVal.length <= 1;
  }

  // VastNumber left shift
  VastNumber.prototype.shiftDigitsLeft = function(shiftAmount) {
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.shiftDigitsRight(-shiftAmount); // Convert left shift to right shift for negative amount

    let currentResult = this;
    if (currentResult.isZeroValue()) return currentResult;

    // Shift in chunks of maxBinaryFactor
    while (shiftAmount >= binaryFactorsLen) {
      currentResult = currentResult.scale(maxBinaryFactor);
      shiftAmount -= binaryFactorsLen - 1; // Adjust remaining shift amount
    }
    return currentResult.scale(binaryFactors[shiftAmount]); // Apply remaining shift
  };
  CompactNumber.prototype.shiftDigitsLeft = VastNumber.prototype.shiftDigitsLeft;

  // VastNumber right shift
  VastNumber.prototype.shiftDigitsRight = function(shiftAmount) {
    let remQuo;
    if (!isShiftAmountCompact(shiftAmount)) {
      throw new Error(`Shift amount ${String(shiftAmount)} is too large for shifting.`);
    }
    shiftAmount = +shiftAmount;
    if (shiftAmount < 0) return this.shiftDigitsLeft(-shiftAmount); // Convert right shift to left shift for negative amount

    let currentResult = this;
    // Handle special cases for zero or unit negative numbers
    while (shiftAmount >= binaryFactorsLen) {
      if (currentResult.isZeroValue() || currentResult.isNegativeValue() && currentResult.isOneOrMinusOne()) return currentResult;
      remQuo = flexibleDivMod(currentResult, maxBinaryFactor);
      currentResult = remQuo[1].isNegativeValue() ? remQuo[0].decrement() : remQuo[0]; // Adjust for negative remainders
      shiftAmount -= binaryFactorsLen - 1;
    }
    remQuo = flexibleDivMod(currentResult, binaryFactors[shiftAmount]);
    return remQuo[1].isNegativeValue() ? remQuo[0].decrement() : remQuo[0]; // Final adjustment for negative remainders
  };
  CompactNumber.prototype.shiftDigitsRight = VastNumber.prototype.shiftDigitsRight;

  // Generic bitwise operation function
  function performBitwiseOp(numX, numY, operationFunc) {
    numY = processInput(numY);

    let negX = numX.isNegativeValue(),
      negY = numY.isNegativeValue();
    // Convert negative numbers to their two's complement representation for bitwise ops
    let remainingX = negX ? numX.complement() : numX,
      remainingY = negY ? numY.complement() : numY;

    let digitX = 0,
      digitY = 0;
    let xDivisionResult = null,
      yDivisionResult = null;
    let opResult = [];

    // Process digits from LSB to MSB
    while (!remainingX.isZeroValue() || !remainingY.isZeroValue()) {
      xDivisionResult = flexibleDivMod(remainingX, maxBinaryFactor);
      digitX = xDivisionResult[1].toStandardNumber();
      if (negX) {
        digitX = maxBinaryFactor - 1 - digitX; // Invert bits for two's complement
      }

      yDivisionResult = flexibleDivMod(remainingY, maxBinaryFactor);
      digitY = yDivisionResult[1].toStandardNumber();
      if (negY) {
        digitY = maxBinaryFactor - 1 - digitY; // Invert bits for two's complement
      }

      remainingX = xDivisionResult[0];
      remainingY = yDivisionResult[0];
      opResult.push(operationFunc(digitX, digitY)); // Apply bitwise function
    }

    // Determine final sign and reconstruct result
    let finalSum = operationFunc(negX ? 1 : 0, negY ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
    for (let i = opResult.length - 1; i >= 0; i -= 1) {
      finalSum = finalSum.scale(maxBinaryFactor).append(largeNum(opResult[i]));
    }
    return finalSum;
  }

  // Bitwise NOT (~)
  VastNumber.prototype.complement = function() {
    return this.invertSign().decrement(); // ~x = -x - 1
  };
  CompactNumber.prototype.complement = VastNumber.prototype.complement;

  // Bitwise AND (&)
  VastNumber.prototype.bitwiseAnd = function(operand) {
    return performBitwiseOp(this, operand, function(a, b) {
      return a & b;
    });
  };
  CompactNumber.prototype.bitwiseAnd = VastNumber.prototype.bitwiseAnd;

  // Bitwise OR (|)
  VastNumber.prototype.bitwiseOr = function(operand) {
    return performBitwiseOp(this, operand, function(a, b) {
      return a | b;
    });
  };
  CompactNumber.prototype.bitwiseOr = VastNumber.prototype.bitwiseOr;

  // Bitwise XOR (^)
  VastNumber.prototype.bitwiseXor = function(operand) {
    return performBitwiseOp(this, operand, function(a, b) {
      return a ^ b;
    });
  };
  CompactNumber.prototype.bitwiseXor = VastNumber.prototype.bitwiseXor;


  // Mask for lowest order bit (for standard JS numbers)
  const LOW_ORDER_BITS_MASK_INT = 1 << 30;
  // Mask for lowest order bit (for big integers represented as arrays)
  const LOW_ORDER_BITS_MASK_BIG_INT = (NUM_BASE & -NUM_BASE) * (NUM_BASE & -NUM_BASE) | LOW_ORDER_BITS_MASK_INT;

  // Estimates the lowest order bit set in a number
  function estimateLowestBit(num) {
    let val = num.numVal;
    let x = typeof val === "number" ? val | LOW_ORDER_BITS_MASK_INT : val[0] + val[1] * NUM_BASE | LOW_ORDER_BITS_MASK_BIG_INT;
    return x & -x; // Returns the lowest set bit
  }

  // Computes integer logarithm (log_base(value))
  function logarithmOfInteger(val, logBase) {
    if (logBase.compareWith(val) <= 0) {
      let tempResult = logarithmOfInteger(val, logBase.squared()); // Recursively compute log of val with base^2
      let pVal = tempResult.p;
      let exponent = tempResult.e;
      let product = pVal.scale(logBase);
      // Adjust exponent based on comparison
      return product.compareWith(val) <= 0 ? {
        p: product,
        e: exponent * 2 + 1
      } : {
        p: pVal,
        e: exponent * 2
      };
    }
    return {
      p: largeNum(1),
      e: 0
    };
  }

  // VastNumber bit length (number of bits required to represent the number)
  VastNumber.prototype.binaryLength = function() {
    let num = this;
    if (num.compareWith(largeNum(0)) < 0) {
      num = num.invertSign().deduct(largeNum(1)); // For negative numbers, use two's complement representation
    }
    if (num.compareWith(largeNum(0)) === 0) {
      return largeNum(0);
    }
    return largeNum(logarithmOfInteger(num, largeNum(2)).e).append(largeNum(1));
  };
  CompactNumber.prototype.binaryLength = VastNumber.prototype.binaryLength;


  // Returns the maximum of two numbers
  function getMaximum(valA, valB) {
    valA = processInput(valA);
    valB = processInput(valB);
    return valA.isGreaterThan(valB) ? valA : valB;
  }

  // Returns the minimum of two numbers
  function getMinimum(valA, valB) {
    valA = processInput(valA);
    valB = processInput(valB);
    return valA.isLessThan(valB) ? valA : valB;
  }

  // Computes the greatest common divisor (GCD) of two numbers
  function greatestCommonDivisor(valA, valB) {
    valA = processInput(valA).absoluteValue();
    valB = processInput(valB).absoluteValue();

    if (valA.isEqualTo(valB)) return valA;
    if (valA.isZeroValue()) return valB;
    if (valB.isZeroValue()) return valA;

    let commonFactor = NumericValue[1],
      d, temp;

    // Remove common factors of 2
    while (valA.isEvenlyDivisible() && valB.isEvenlyDivisible()) {
      d = Math.min(estimateLowestBit(valA), estimateLowestBit(valB));
      valA = valA.divideBy(d);
      valB = valB.divideBy(d);
      commonFactor = commonFactor.scale(d);
    }

    // Remove factors of 2 from A
    while (valA.isEvenlyDivisible()) {
      valA = valA.divideBy(estimateLowestBit(valA));
    }

    // Euclidean algorithm (binary GCD variant)
    do {
      while (valB.isEvenlyDivisible()) {
        valB = valB.divideBy(estimateLowestBit(valB));
      }
      if (valA.isGreaterThan(valB)) {
        temp = valB;
        valB = valA;
        valA = temp;
      }
      valB = valB.deduct(valA);
    } while (!valB.isZeroValue());

    return commonFactor.isOneOrMinusOne() ? valA : valA.scale(commonFactor);
  }

  // Computes the least common multiple (LCM) of two numbers
  function leastCommonMultiple(valA, valB) {
    valA = processInput(valA).absoluteValue();
    valB = processInput(valB).absoluteValue();
    return valA.divideBy(greatestCommonDivisor(valA, valB)).scale(valB);
  }

  // Generates a random number between lowerBound and upperBound (inclusive)
  function generateRandomBetween(lowerBound, upperBound) {
    lowerBound = processInput(lowerBound);
    upperBound = processInput(upperBound);

    let minVal = getMinimum(lowerBound, upperBound),
      maxVal = getMaximum(lowerBound, upperBound);
    let valueRange = maxVal.deduct(minVal).append(1);

    if (valueRange.isCompact) { // If range is small, use standard Math.random
      return minVal.append(Math.floor(Math.random() * valueRange.toStandardNumber()));
    }

    let len = valueRange.numVal.length - 1;
    let randomDigits = [],
      isRestricted = true;

    // Generate random digits for the number within the range
    for (let i = len; i >= 0; i--) {
      let upperLimit = isRestricted ? valueRange.numVal[i] : NUM_BASE;
      let digit = chopFraction(Math.random() * upperLimit);
      randomDigits.unshift(digit); // Prepend digit
      if (digit < upperLimit) isRestricted = false; // If we picked a smaller digit, no longer restricted by upper bound
    }
    randomDigits = arrayToShortNum(randomDigits); // Convert to compact if possible

    return minVal.append(typeof randomDigits === "number" ? new CompactNumber(randomDigits) : new VastNumber(randomDigits, false));
  }

  // Parses a string representation of a number in a given base
  const parseFromGivenBase = function(textInput, baseVal) {
    let len = textInput.length;
    let i;
    let absBaseVal = Math.abs(baseVal);

    // Validate digits for the given base
    for (i = 0; i < len; i++) {
      let char = textInput[i].toLowerCase();
      if (char === "-") continue;
      if (/[a-z0-9]/.test(char)) {
        if (/[0-9]/.test(char) && +char >= absBaseVal) {
          if (char === "1" && absBaseVal === 1) continue;
          throw new Error(`${char} is not a valid digit in base ${baseVal}.`);
        } else if (char.charCodeAt(0) - 87 >= absBaseVal) {
          throw new Error(`${char} is not a valid digit in base ${baseVal}.`);
        }
      }
    }

    // Handle standard bases for small numbers
    if (2 <= baseVal && baseVal <= 36) {
      if (len <= LOG_MAX_SAFE_JS / Math.log(baseVal)) {
        let result = parseInt(textInput, baseVal);
        if (isNaN(result)) {
          throw new Error(`${char} is not a valid digit in base ${baseVal}.`);
        }
        return new CompactNumber(parseInt(textInput, baseVal));
      }
    }

    baseVal = processInput(baseVal); // Convert base to NumericValue
    let digitValues = [];
    let isNeg = textInput[0] === "-";

    // Extract digits and convert to NumericValue
    for (i = isNeg ? 1 : 0; i < textInput.length; i++) {
      let char = textInput[i].toLowerCase(),
        charCoord = char.charCodeAt(0);
      if (48 <= charCoord && charCoord <= 57) digitValues.push(processInput(char));
      else if (97 <= charCoord && charCoord <= 122) digitValues.push(processInput(char.charCodeAt(0) - 87));
      else if (char === "<") {
        let start = i;
        do {
          i++;
        } while (textInput[i] !== ">");
        digitValues.push(processInput(textInput.slice(start + 1, i)));
      } else throw new Error(`${char} is not a valid character`);
    }
    return processBaseDigits(digitValues, baseVal, isNeg);
  };

  // Converts an array of digits (in a given base) to a NumericValue
  function processBaseDigits(digitArr, baseVal, isNeg) {
    let currentVal = NumericValue[0],
      currentPower = NumericValue[1],
      i;
    for (i = digitArr.length - 1; i >= 0; i--) {
      currentVal = currentVal.append(digitArr[i].timesOp(currentPower));
      currentPower = currentPower.timesOp(baseVal);
    }
    return isNeg ? currentVal.invertSign() : currentVal;
  }

  // Converts a digit (0-35) to its string representation (0-9, a-z)
  function convertDigitToString(singleDigit) {
    if (singleDigit <= 35) {
      return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(singleDigit);
    }
    return `<${singleDigit}>`; // For digits > 35, use <digit> format
  }

  // Converts a NumericValue to an array of digits in a given base
  function convertToBaseRepresentation(num, baseVal) {
    baseVal = largeNum(baseVal);
    if (baseVal.isZeroValue()) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      throw new Error("Cannot convert nonzero numbers to base 0.");
    }

    if (baseVal.isEqualTo(-1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      if (num.isNegativeValue()) {
        // Special case for negative numbers in base -1
        let negMap = Array.apply(null, Array(-num.toStandardNumber())).map(Array.prototype.valueOf, [1, 0]);
        return {
          value: [].concat.apply([], negMap),
          isNegative: false
        };
      }
      let posMap = Array.apply(null, Array(+num.toStandardNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
      posMap.unshift([1]);
      return {
        value: [].concat.apply([], posMap),
        isNegative: false
      };
    }

    let isNegativeResult = false;
    if (num.isNegativeValue() && baseVal.isPositiveValue()) {
      isNegativeResult = true;
      num = num.absoluteValue();
    }

    if (baseVal.isEqualTo(1)) {
      if (num.isZeroValue()) return {
        value: [0],
        isNegative: false
      };
      return {
        value: Array.apply(null, Array(+num.toStandardNumber())).map(Number.prototype.valueOf, 1),
        isNegative: isNegativeResult
      };
    }

    let outputDigits = [];
    let remainingNum = num,
      divModResult;

    // Repeatedly divide by base and collect remainders
    while (remainingNum.isNegativeValue() || remainingNum.compareMagnitude(baseVal) >= 0) {
      divModResult = remainingNum.divideAndRemainder(baseVal);
      remainingNum = divModResult.quotient;
      let rVal = divModResult.remainder;
      if (rVal.isNegativeValue()) {
        rVal = baseVal.minusOp(rVal).absoluteValue();
        remainingNum = remainingNum.increment(); // Adjust quotient for negative remainder
      }
      outputDigits.push(rVal.toStandardNumber());
    }
    outputDigits.push(remainingNum.toStandardNumber());
    return {
      value: outputDigits.reverse(),
      isNegative: isNegativeResult
    };
  }

  // Converts a NumericValue to a string in a given base
  function convertToStringInBase(num, baseVal) {
    let resultArr = convertToBaseRepresentation(num, baseVal);
    return (resultArr.isNegative ? "-" : "") + resultArr.value.map(convertDigitToString).join("");
  }

  // VastNumber to array (base representation)
  VastNumber.prototype.toDigitArray = function(baseSpec) {
    return convertToBaseRepresentation(this, baseSpec);
  };
  CompactNumber.prototype.toDigitArray = function(baseSpec) {
    return convertToBaseRepresentation(this, baseSpec);
  };

  // VastNumber to string
  VastNumber.prototype.toText = function(baseSpec) {
    if (baseSpec === undefined) baseSpec = 10;
    if (baseSpec !== 10) return convertToStringInBase(this, baseSpec);

    let numArr = this.numVal,
      len = numArr.length,
      outputStr = String(numArr[--len]),
      zeroPadStr = "0000000",
      digit;

    // Concatenate digits, padding with zeros
    while (--len >= 0) {
      digit = String(numArr[len]);
      outputStr += zeroPadStr.slice(digit.length) + digit;
    }
    let signPrefix = this.isNegative ? "-" : "";
    return signPrefix + outputStr;
  };
  // CompactNumber to string
  CompactNumber.prototype.toText = function(baseSpec) {
    if (baseSpec === undefined) baseSpec = 10;
    if (baseSpec != 10) return convertToStringInBase(this, baseSpec);
    return String(this.numVal);
  };

  // JSON serialization
  VastNumber.prototype.toJsonString = CompactNumber.prototype.toJsonString = function() {
    return this.toText();
  };

  // ValueOf for coercion to number (may lose precision)
  VastNumber.prototype.getValueOf = function() {
    return parseInt(this.toText(), 10);
  };
  VastNumber.prototype.toStandardNumber = VastNumber.prototype.getValueOf;

  CompactNumber.prototype.getValueOf = function() {
    return this.numVal;
  };
  CompactNumber.prototype.toStandardNumber = CompactNumber.prototype.getValueOf;

  // Parses a string into a NumericValue
  function processStringInput(strVal) {
    if (isStandardPrecision(+strVal)) {
      let num = +strVal;
      if (num === chopFraction(num)) return new CompactNumber(num);
      throw new Error(`Invalid integer: ${strVal}`);
    }

    let isNegative = strVal[0] === "-";
    if (isNegative) strVal = strVal.slice(1);

    let parts = strVal.split(/e/i); // Handle scientific notation
    if (parts.length > 2) throw new Error(`Invalid integer: ${parts.join("e")}`);

    if (parts.length === 2) {
      let exponent = parts[1];
      if (exponent[0] === "+") exponent = exponent.slice(1);
      exponent = +exponent;
      if (exponent !== chopFraction(exponent) || !isStandardPrecision(exponent)) {
        throw new Error(`Invalid integer: ${exponent} is not a valid exponent.`);
      }

      let numText = parts[0];
      let dotIndex = numText.indexOf(".");
      if (dotIndex >= 0) {
        exponent -= numText.length - dotIndex - 1;
        numText = numText.slice(0, dotIndex) + numText.slice(dotIndex + 1);
      }
      if (exponent < 0) throw new Error("Cannot include negative exponent part for integers");
      numText += new Array(exponent + 1).join("0"); // Append zeros for positive exponent
      strVal = numText;
    }

    let isFormatValid = /^([0-9][0-9]*)$/.test(strVal);
    if (!isFormatValid) throw new Error(`Invalid integer: ${strVal}`);

    let resultArr = [],
      maxLength = strVal.length,
      digitGroupLen = BASE_EXPONENT,
      minLength = maxLength - digitGroupLen;

    // Split string into digits in NUM_BASE
    while (maxLength > 0) {
      resultArr.push(+strVal.slice(minLength, maxLength));
      minLength -= digitGroupLen;
      if (minLength < 0) minLength = 0;
      maxLength -= digitGroupLen;
    }
    removeLeadingZeros(resultArr); // Clean up result
    return new VastNumber(resultArr, isNegative);
  }

  // Parses a number into a NumericValue
  function processNumberInput(numVal) {
    if (isStandardPrecision(numVal)) {
      if (numVal !== chopFraction(numVal)) throw new Error(`${numVal} is not an integer.`);
      return new CompactNumber(numVal);
    }
    return processStringInput(numVal.toString()); // Fallback to string parsing for large JS numbers
  }

  // Main input parsing function
  function processInput(input) {
    if (typeof input === "number") {
      return processNumberInput(input);
    }
    if (typeof input === "string") {
      return processStringInput(input);
    }
    return input; // Assume it's already a NumericValue object
  }

  // Initialize common NumericValue constants and methods
  for (let i = 0; i < 1000; i++) {
    NumericValue[i] = new CompactNumber(i);
    if (i > 0) NumericValue[-i] = new CompactNumber(-i);
  }

  NumericValue.one = NumericValue[1];
  NumericValue.zero = NumericValue[0];
  NumericValue.minusOne = NumericValue[-1];
  NumericValue.maximum = getMaximum;
  NumericValue.minimum = getMinimum;
  NumericValue.greatestCommonDivisor = greatestCommonDivisor;
  NumericValue.leastCommonMultiple = leastCommonMultiple;
  NumericValue.isAnInstance = function(obj) {
    return obj instanceof VastNumber || obj instanceof CompactNumber;
  };
  NumericValue.randomBetween = generateRandomBetween;
  NumericValue.createFromArray = function(digitArr, baseVal, isNeg) {
    return processBaseDigits(digitArr.map(processInput), processInput(baseVal || 10), isNeg);
  };

  return NumericValue;
})();

// Main program logic
function processInputData(rawData) {
  // Parse input values from raw data
  const lines = rawData.trim().split("\n");
  const firstLineParts = lines[0].split(' ').map(Number);
  const thresholdVal = firstLineParts[1]; // The 'm' value

  // Parse and sort the array 'ai' in descending order
  const inputNumbers = lines[1].split(' ').map(Number).sort((x, y) => y - x);

  let totalSum = 0; // Sum of all numbers
  let filteredSum = 0; // Sum of numbers after removing 'm-1' largest

  // Calculate filteredSum (sum of smaller numbers, effectively)
  for (let i = thresholdVal - 1; i < inputNumbers.length; i++) {
    filteredSum += inputNumbers[i];
  }

  // Calculate totalSum of all numbers
  for (let i = 0; i < inputNumbers.length; i++) {
    totalSum += inputNumbers[i];
  }

  // console.info(totalSum); // Changed console.log to console.info for variation

  // Perform the division using the custom large number library
  const divisionResult = largeNum(totalSum).divideBy(4 * thresholdVal);

  // Compare the division result with filteredSum
  if (largeNum(divisionResult).compareWith(filteredSum) === 1) {
    // if (filteredSum < totalSum / (4 * thresholdVal)) { // Original comment kept for context, but logic uses largeNum
    console.info('No');
  } else {
    console.info('Yes');
  }
}

// Read input from stdin and execute the main logic
processInputData(require('node:fs').readFileSync('/proc/self/fd/0', 'utf8'));