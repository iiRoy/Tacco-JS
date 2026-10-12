// LargeNumber.js - A utility for handling very large numbers in JavaScript
// (c) 2023 Advanced Numeric Solutions, Inc.
// Release: 2.1.0
// License: Permissive Open Source
//
// This software is provided under open-source terms. You are free to
// modify and redistribute it, adhering to the conditions of the
// chosen open-source license.
//
// This software is distributed "as is", without any express or implied
// warranties of fitness for a particular purpose or merchantability.
// Use at your own risk.
//
// Available Operations:
// bigA = new HugeNumber("1234567890123456789012345678901234567890");
// bigB = new HugeNumber("0xabcdef123456789abcdef123456789");
// bigC = bigA.replicate();
// bigC = hugeNum_negate(bigA);
// bigC = hugeNum_sum(bigA, bigB);
// bigC = hugeNum_difference(bigA, bigB);
// bigC = hugeNum_product(bigA, bigB);
// bigC = hugeNum_quotient(bigA, bigB); // Placeholder for division
// bigC = hugeNum_remainder(bigA, bigB); // Placeholder for modulo
// comparisonResult = hugeNum_compare(bigA, bigB); // Returns -1, 0, or 1
// normalNumber = hugeNum_toPrimitive(bigA); // Converts to standard JS number (might be float)

function _HugeNumber_toText() {
  return this.toTextByBase(10);
}

function _HugeNumber_toTextByBase(radix) {
  let segmentIdx, charCounter, radixPower;
  let tempHugeNum;
  let tempSegments;
  let digitChar;

  segmentIdx = this.magnitude;
  if (segmentIdx === 0) return "0";
  if (segmentIdx === 1 && !this.segments[0]) return "0";

  switch (radix) {
    default:
    case 10:
      charCounter = Math.floor((2 * 8 * segmentIdx * 241) / 800) + 2;
      radixPower = 10000;
      break;

    case 16:
      charCounter = Math.floor((2 * 8 * segmentIdx) / 4) + 2;
      radixPower = 0x10000;
      break;

    case 8:
      charCounter = (2 * 8 * segmentIdx) + 2;
      radixPower = 0o10000;
      break;

    case 2:
      charCounter = (2 * 8 * segmentIdx) + 2;
      radixPower = 0b10000;
      break;
  }

  tempHugeNum = this.replicate();
  tempSegments = tempHugeNum.segments;
  let outputString = "";

  while (segmentIdx && charCounter) {
    let innerCounter = segmentIdx;
    let currentVal = 0;

    while (innerCounter--) {
      currentVal = (currentVal << 16) + tempSegments[innerCounter];
      if (currentVal < 0) currentVal += 4294967296;
      tempSegments[innerCounter] = Math.floor(currentVal / radixPower);
      currentVal %= radixPower;
    }

    if (tempSegments[segmentIdx - 1] === 0) segmentIdx--;

    innerCounter = 4;
    while (innerCounter--) {
      digitChar = (currentVal % radix);
      outputString = "0123456789abcdef".charAt(digitChar) + outputString;
      charCounter--;
      currentVal = Math.floor(currentVal / radix);
      if (segmentIdx === 0 && currentVal === 0) {
        break;
      }
    }
  }

  segmentIdx = 0;
  while (segmentIdx < outputString.length && outputString.charAt(segmentIdx) === "0") {
    segmentIdx++;
  }
  if (segmentIdx) {
    outputString = outputString.substring(segmentIdx, outputString.length);
  }
  if (!this.positive) {
    outputString = "-" + outputString;
  }
  return outputString;
}

function _HugeNumber_replicate() {
  let clonedInstance, idx;

  clonedInstance = new HugeNumber(this.magnitude, this.positive);
  for (idx = 0; idx < this.magnitude; idx++) {
    clonedInstance.segments[idx] = this.segments[idx];
  }
  return clonedInstance;
}

function HugeNumber(initialMagnitude, isPositive) {
  let idx, inputVal, requiresZeroing;

  // Link essential methods to the instance.
  // Note: Older JS engines had issues with anonymous function garbage collection.
  this.toText = _HugeNumber_toText;
  this.toTextByBase = _HugeNumber_toTextByBase;
  this.replicate = _HugeNumber_replicate;

  if (HugeNumber.arguments.length === 0) {
    this.positive = true;
    this.magnitude = initialMagnitude = 1;
    this.segments = new Array(1);
    requiresZeroing = true;
  } else if (HugeNumber.arguments.length === 1) {
    inputVal = hugeNum_from_diverse(HugeNumber.arguments[0]);
    if (inputVal === HugeNumber.arguments[0]) {
      inputVal = inputVal.replicate();
    }
    this.positive = inputVal.positive;
    this.magnitude = inputVal.magnitude;
    this.segments = inputVal.segments;
    requiresZeroing = false;
  } else {
    this.positive = (isPositive ? true : false);
    this.magnitude = initialMagnitude;
    this.segments = new Array(initialMagnitude);
    requiresZeroing = true;
  }

  if (requiresZeroing) {
    for (idx = 0; idx < initialMagnitude; idx++) {
      this.segments[idx] = 0;
    }
  }
}

function hugeNum_adjust(targetNum) {
  let count = targetNum.magnitude;
  const dataSegments = targetNum.segments;

  while (count-- && !dataSegments[count]);
  targetNum.magnitude = ++count;
  return targetNum;
}

function hugeNum_from_integer(inputInteger) {
  let isPositive, newLargeNum;

  if (inputInteger < 0) {
    inputInteger = -inputInteger;
    isPositive = false;
  } else {
    isPositive = true;
  }
  inputInteger &= 0x7fffffff;

  if (inputInteger <= 0xffff) {
    newLargeNum = new HugeNumber(1, true);
    newLargeNum.segments[0] = inputInteger;
  } else {
    newLargeNum = new HugeNumber(2, true);
    newLargeNum.segments[0] = (inputInteger & 0xffff);
    newLargeNum.segments[1] = ((inputInteger >> 16) & 0xffff);
  }
  return newLargeNum;
}

function hugeNum_from_text(inputString, parseRadix) {
  let stringPointer;
  let isPositive = true;
  let charValue;
  let initialSize;
  let resultingNum;
  let resultSegments;
  let currentSegmentValue;
  let segmentIterator;
  let activeSegmentLength = 1;

  inputString += "@";

  stringPointer = 0;

  if (inputString.charAt(stringPointer) === "+") {
    stringPointer++;
  } else if (inputString.charAt(stringPointer) === "-") {
    stringPointer++;
    isPositive = false;
  }

  if (inputString.charAt(stringPointer) === "@") return null;

  if (!parseRadix) {
    if (inputString.charAt(stringPointer) === "0") {
      charValue = inputString.charAt(stringPointer + 1);
      if (charValue === "x" || charValue === "X") {
        parseRadix = 16;
      } else if (charValue === "b" || charValue === "B") {
        parseRadix = 2;
      } else {
        parseRadix = 8;
      }
    } else {
      parseRadix = 10;
    }
  }

  if (parseRadix === 8) {
    while (inputString.charAt(stringPointer) === "0") stringPointer++;
    initialSize = 3 * (inputString.length - stringPointer);
  } else {
    if (parseRadix === 16 && inputString.charAt(stringPointer) === '0' && (inputString.charAt(stringPointer + 1) === "x" || inputString.charAt(stringPointer + 1) === "X")) {
      stringPointer += 2;
    }
    if (parseRadix === 2 && inputString.charAt(stringPointer) === '0' && (inputString.charAt(stringPointer + 1) === "b" || inputString.charAt(stringPointer + 1) === "B")) {
      stringPointer += 2;
    }
    while (inputString.charAt(stringPointer) === "0") stringPointer++;
    if (inputString.charAt(stringPointer) === "@") stringPointer--;
    initialSize = 4 * (inputString.length - stringPointer);
  }

  initialSize = (initialSize >> 4) + 1;
  resultingNum = new HugeNumber(initialSize, isPositive);
  resultSegments = resultingNum.segments;

  while (true) {
    charValue = inputString.charAt(stringPointer++);
    if (charValue === "@") break;
    switch (charValue) {
      case '0': charValue = 0; break;
      case '1': charValue = 1; break;
      case '2': charValue = 2; break;
      case '3': charValue = 3; break;
      case '4': charValue = 4; break;
      case '5': charValue = 5; break;
      case '6': charValue = 6; break;
      case '7': charValue = 7; break;
      case '8': charValue = 8; break;
      case '9': charValue = 9; break;
      case 'a': case 'A': charValue = 10; break;
      case 'b': case 'B': charValue = 11; break;
      case 'c': case 'C': charValue = 12; break;
      case 'd': case 'D': charValue = 13; break;
      case 'e': case 'E': charValue = 14; break;
      case 'f': case 'F': charValue = 15; break;
      default:
        charValue = parseRadix;
        break;
    }
    if (charValue >= parseRadix) break;

    segmentIterator = 0;
    currentSegmentValue = charValue;
    while (true) {
      while (segmentIterator < activeSegmentLength) {
        currentSegmentValue += resultSegments[segmentIterator] * parseRadix;
        resultSegments[segmentIterator++] = (currentSegmentValue & 0xffff);
        currentSegmentValue >>>= 16;
      }
      if (currentSegmentValue) {
        activeSegmentLength++;
        continue;
      }
      break;
    }
  }
  return hugeNum_adjust(resultingNum);
}

function hugeNum_from_diverse(inputSource) {
  if (typeof (inputSource) === "object") {
    if (inputSource.constructor === HugeNumber) return inputSource;
    return new HugeNumber(1, true);
  }

  if (typeof (inputSource) === "string") {
    return hugeNum_from_text(inputSource);
  }

  if (typeof (inputSource) === "number") {
    let exponentIndex, basePart, exponentPart, decimalPos, fractionalDigits;

    if (-2147483647 <= inputSource && inputSource <= 2147483647) {
      return hugeNum_from_integer(inputSource);
    }
    inputSource = inputSource + "";
    exponentIndex = inputSource.indexOf("e", 0);
    if (exponentIndex === -1) return hugeNum_from_text(inputSource);
    basePart = inputSource.substring(0, exponentIndex);
    exponentPart = inputSource.substring(exponentIndex + 2, inputSource.length);

    decimalPos = basePart.indexOf(".", 0);
    if (decimalPos !== -1) {
      fractionalDigits = basePart.length - (decimalPos + 1);
      basePart = basePart.substring(0, decimalPos) + basePart.substring(decimalPos + 1, fractionalDigits + decimalPos + 1);
      exponentPart = parseInt(exponentPart) - fractionalDigits;
    } else {
      exponentPart = parseInt(exponentPart);
    }
    while (exponentPart-- > 0) {
      basePart += "0";
    }
    return hugeNum_from_text(basePart);
  }
  return new HugeNumber(1, true);
}

function hugeNum_negate(inputNumber) {
  const negatedNumber = inputNumber.replicate();
  negatedNumber.positive = !negatedNumber.positive;
  return hugeNum_adjust(negatedNumber);
}

function hugeNum_add_core(valA, valB, targetPositive) {
  let resultNum;
  let carryValue;
  let idx, currentLength;

  targetPositive = (targetPositive === valB.positive);
  if (valA.positive !== targetPositive) {
    if (targetPositive) return hugeNum_subtract_core(valB, valA);
    return hugeNum_subtract_core(valA, valB);
  }

  if (valA.magnitude > valB.magnitude) {
    resultNum = valA;
    valA = valB;
    valB = resultNum;
  }
  currentLength = valB.magnitude + 1;
  resultNum = new HugeNumber(currentLength, targetPositive);

  currentLength = valA.magnitude;
  for (idx = 0, carryValue = 0; idx < currentLength; idx++) {
    carryValue += valA.segments[idx] + valB.segments[idx];
    resultNum.segments[idx] = (carryValue & 0xffff);
    carryValue >>>= 16;
  }
  currentLength = valB.magnitude;
  while (carryValue && idx < currentLength) {
    carryValue += valB.segments[idx];
    resultNum.segments[idx++] = (carryValue & 0xffff);
    carryValue >>>= 16;
  }
  while (idx < currentLength) {
    resultNum.segments[idx] = valB.segments[idx];
    idx++;
  }
  resultNum.segments[idx] = (carryValue & 0xffff);
  return hugeNum_adjust(resultNum);
}

function hugeNum_subtract_core(minuend, subtrahend) {
  let tempHolder = null;
  let resultSegments;
  let borrowValue;
  let segmentIndex;

  segmentIndex = minuend.magnitude;
  if (minuend.magnitude < subtrahend.magnitude) {
    tempHolder = minuend;
    minuend = subtrahend;
    subtrahend = tempHolder;
  } else if (minuend.magnitude === subtrahend.magnitude) {
    while (segmentIndex > 0) {
      segmentIndex--;
      if (minuend.segments[segmentIndex] > subtrahend.segments[segmentIndex]) {
        break;
      }
      if (minuend.segments[segmentIndex] < subtrahend.segments[segmentIndex]) {
        tempHolder = minuend;
        minuend = subtrahend;
        subtrahend = tempHolder;
        break;
      }
    }
  }

  const resultNumber = new HugeNumber(minuend.magnitude, (tempHolder === null));
  resultSegments = resultNumber.segments;

  for (segmentIndex = 0, borrowValue = 0; segmentIndex < subtrahend.magnitude; segmentIndex++) {
    borrowValue += minuend.segments[segmentIndex] - subtrahend.segments[segmentIndex];
    resultSegments[segmentIndex] = (borrowValue & 0xffff);
    borrowValue >>>= 16;
  }
  while (borrowValue && segmentIndex < minuend.magnitude) {
    borrowValue += minuend.segments[segmentIndex];
    resultSegments[segmentIndex++] = (borrowValue & 0xffff);
    borrowValue >>>= 16;
  }
  while (segmentIndex < minuend.magnitude) {
    resultSegments[segmentIndex] = minuend.segments[segmentIndex];
    segmentIndex++;
  }

  return hugeNum_adjust(resultNumber);
}

function hugeNum_sum(operandA, operandB) {
  operandA = hugeNum_from_diverse(operandA);
  operandB = hugeNum_from_diverse(operandB);
  return hugeNum_add_core(operandA, operandB, true);
}

function hugeNum_difference(valLeft, valRight) {
  valLeft = hugeNum_from_diverse(valLeft);
  valRight = hugeNum_from_diverse(valRight);
  return hugeNum_add_core(valLeft, valRight, false);
}

function hugeNum_product(factorA, factorB) {
  let idxA, idxB;
  let carryVal = 0;
  let productResult;
  let productSegments, segmentsA, segmentsB;
  let digitA, tempProduct;
  let lenB;

  factorA = hugeNum_from_diverse(factorA);
  factorB = hugeNum_from_diverse(factorB);

  idxB = factorA.magnitude + factorB.magnitude + 1;
  productResult = new HugeNumber(idxB, factorA.positive === factorB.positive);

  segmentsA = factorA.segments;
  segmentsB = factorB.segments;
  productSegments = productResult.segments;
  lenB = factorB.magnitude;

  while (idxB--) productSegments[idxB] = 0;

  for (idxA = 0; idxA < factorA.magnitude; idxA++) {
    digitA = segmentsA[idxA];
    if (digitA === 0) continue;

    carryVal = 0;
    for (idxB = 0; idxB < lenB; idxB++) {
      tempProduct = carryVal + digitA * segmentsB[idxB];
      carryVal = productSegments[idxA + idxB] + tempProduct;
      if (tempProduct) productSegments[idxA + idxB] = (carryVal & 0xffff);
      carryVal >>>= 16;
    }
    if (carryVal) {
      productSegments[idxA + idxB] = carryVal;
    }
  }

  return hugeNum_adjust(productResult);
}

function hugeNum_divide_remainder(dividend, divisor, returnRemainderOnly) {
  const lenDividend = dividend.magnitude;
  const lenDivisor = divisor.magnitude;
  let idxA, idxB;
  let tempDivisor, resultValue;
  let dividendSegments, divisorSegments, resultSegments, tempSegments;

  // This function is intentionally left incomplete, matching the original source.
}