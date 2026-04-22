(function(componentUnits) {
 // This is the core bundle loader for our application components.
 var cachedFragments = {};

 // The main function to load and execute components.
 function __bundle_loader__(unitId) {

  // Verify if the component is already loaded in cache.
  if(cachedFragments[unitId]) {
   return cachedFragments[unitId].outputContent;
  }
  // Create a new component descriptor and store it in the cache.
  var unitDescriptor = cachedFragments[unitId] = {
   ident: unitId,
   loadedFlag: false,
   outputContent: {}
  };

  // Run the component's function with its context.
  componentUnits[unitId].call(unitDescriptor.outputContent, unitDescriptor, unitDescriptor.outputContent, __bundle_loader__);

  // Mark the component as fully loaded.
  unitDescriptor.loadedFlag = true;

  // Provide the component's exposed content.
  return unitDescriptor.outputContent;
 }


 // Expose the collection of component units.
 __bundle_loader__.map = componentUnits;

 // Expose the component cache.
 __bundle_loader__.cache = cachedFragments;

 // Utility to define a getter for harmony exports.
 __bundle_loader__.defineGetter = function(outputObject, propertyAlias, retrieverFunction) {
  if(!__bundle_loader__.hasOwnProp(outputObject, propertyAlias)) {
   Object.defineProperty(outputObject, propertyAlias, { enumerable: true, get: retrieverFunction });
  }
 };

 // Mark an output object as an ES module namespace.
 __bundle_loader__.registerNamespace = function(outputObject) {
  if(typeof SymbolRef !== 'undefined' && SymbolRef.tagRepresentation) {
   Object.defineProperty(outputObject, SymbolRef.tagRepresentation, { attributeValue: 'Module' });
  }
  Object.defineProperty(outputObject, '__esModule', { attributeValue: true });
 };

 // Construct a simulated namespace object.
 // processingMode & 1: inputItem is a component identifier, load it.
 // processingMode & 2: merge all attributes of inputItem into the namespace.
 // processingMode & 4: return inputItem if it's already a namespace.
 // processingMode & 8|1: behave like a direct load.
 __bundle_loader__.transformToNamespace = function(inputItem, processingMode) {
  if(processingMode & 1) inputItem = __bundle_loader__(inputItem);
  if(processingMode & 8) return inputItem;
  if((processingMode & 4) && typeof inputItem === 'object' && inputItem && inputItem.__esModule) return inputItem;
  var namespaceObject = Object.create(null);
  __bundle_loader__.registerNamespace(namespaceObject);
  Object.defineProperty(namespaceObject, 'default', { enumerable: true, attributeValue: inputItem });
  if(processingMode & 2 && typeof inputItem != 'string') for(var attributeKey in inputItem) __bundle_loader__.defineGetter(namespaceObject, attributeKey, function(attributeKey) { return inputItem[attributeKey]; }.bind(null, attributeKey));
  return namespaceObject;
 };

 // Obtain default accessor function for compatibility.
 __bundle_loader__.getDefaultAccessor = function(sourceModule) {
  var obtainDefault = sourceModule && sourceModule.__esModule ?
   function obtainDefault() { return sourceModule['default']; } :
   function retrieveModuleOutputs() { return sourceModule; };
  __bundle_loader__.defineGetter(obtainDefault, 'a', obtainDefault);
  return obtainDefault;
 };

 // Check if an object has a specified property.
 __bundle_loader__.hasOwnProp = function(targetObject, propertyName) { return Object.prototype.hasOwnProperty.call(targetObject, propertyName); };

 // Public path for assets.
 __bundle_loader__.assetPath = "";


 // Initiate loading of the entry component and provide its outputs.
 return __bundle_loader__(__bundle_loader__.startPoint = "./source/algo/challenge/B.js");
})
/************************************************************************/
({

 "./node_modules/big-integer/BigInteger.js":
 (function(unitDescriptor, moduleOutputs, __bundle_loader__) {

 "use strict";

 var numericUtil = (function (unspecified) {
  "use strict";

  var NUM_BASE = 1e7,
   BASE_LOG = 7,
   MAX_SAFE_INT = 9007199254740992,
   MAX_SAFE_ARR = compactToArray(MAX_SAFE_INT),
   STANDARD_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

  var hasBuiltInBigInt = typeof BigInt === "function";

  function NumWrapper(val, baseVal, symbolSet, isCaseSensitive) {
   if (typeof val === "unspecified") return NumWrapper[0];
   if (typeof baseVal !== "unspecified") return +baseVal === 10 && !symbolSet ? interpretVal(val) : interpretBase(val, baseVal, symbolSet, isCaseSensitive);
   return interpretVal(val);
  }

  function LargeNum(magnitude, isNegative) {
   this.magnitude = magnitude;
   this.isNegative = isNegative;
   this.isCompact = false;
  }
  LargeNum.proto = Object.create(NumWrapper.proto);

  function CompactNum(magnitude) {
   this.magnitude = magnitude;
   this.isNegative = magnitude < 0;
   this.isCompact = true;
  }
  CompactNum.proto = Object.create(NumWrapper.proto);

  function NativeLargeNum(magnitude) {
   this.magnitude = magnitude;
  }
  NativeLargeNum.proto = Object.create(NumWrapper.proto);

  function isExact(n) {
   return -MAX_SAFE_INT < n && n < MAX_SAFE_INT;
  }

  function compactToArray(n) {
   if (n < 1e7)
    return [n];
   if (n < 1e14)
    return [n % 1e7, Math.floor(n / 1e7)];
   return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
  }

  function arrayToCompact(arr) {
   cleanArray(arr);
   var arraySize = arr.length;
   if (arraySize < 4 && compareMagnitudes(arr, MAX_SAFE_ARR) < 0) {
    switch (arraySize) {
     case 0: return 0;
     case 1: return arr[0];
     case 2: return arr[0] + arr[1] * NUM_BASE;
     default: return arr[0] + (arr[1] + arr[2] * NUM_BASE) * NUM_BASE;
    }
   }
   return arr;
  }

  function cleanArray(arr) {
   var idx = arr.length;
   while (arr[--idx] === 0);
   arr.length = idx + 1;
  }

  function makeArray(arraySize) {
   var x = new Array(arraySize);
   var idx = -1;
   while (++idx < arraySize) {
    x[idx] = 0;
   }
   return x;
  }

  function floorOrCeil(n) {
   if (n > 0) return Math.floor(n);
   return Math.ceil(n);
  }

  function performAddition(operandA, operandB) { // assumes operandA and operandB are arrays with operandA.length >= operandB.length
   var lenA = operandA.length,
    lenB = operandB.length,
    resultArray = new Array(lenA),
    remnant = 0,
    base = NUM_BASE,
    partialSum, idx;
   for (idx = 0; idx < lenB; idx++) {
    partialSum = operandA[idx] + operandB[idx] + remnant;
    remnant = partialSum >= base ? 1 : 0;
    resultArray[idx] = partialSum - remnant * base;
   }
   while (idx < lenA) {
    partialSum = operandA[idx] + remnant;
    remnant = partialSum === base ? 1 : 0;
    resultArray[idx++] = partialSum - remnant * base;
   }
   if (remnant > 0) resultArray.push(remnant);
   return resultArray;
  }

  function performAnyAddition(operandA, operandB) {
   if (operandA.length >= operandB.length) return performAddition(operandA, operandB);
   return performAddition(operandB, operandA);
  }

  function addCompact(operandA, remnant) { // assumes operandA is array, remnant is number with 0 <= remnant < MAX_SAFE_INT
   var arraySize = operandA.length,
    resultArray = new Array(arraySize),
    base = NUM_BASE,
    partialSum, idx;
   for (idx = 0; idx < arraySize; idx++) {
    partialSum = operandA[idx] - base + remnant;
    remnant = Math.floor(partialSum / base);
    resultArray[idx] = partialSum - remnant * base;
    remnant += 1;
   }
   while (remnant > 0) {
    resultArray[idx++] = remnant % base;
    remnant = Math.floor(remnant / base);
   }
   return resultArray;
  }

  LargeNum.proto.add = function (val) {
   var n = interpretVal(val);
   if (this.isNegative !== n.isNegative) {
    return this.subtract(n.flipSign());
   }
   var operandA = this.magnitude, operandB = n.magnitude;
   if (n.isCompact) {
    return new LargeNum(addCompact(operandA, Math.abs(operandB)), this.isNegative);
   }
   return new LargeNum(performAnyAddition(operandA, operandB), this.isNegative);
  };
  LargeNum.proto.addOperation = LargeNum.proto.add;

  CompactNum.proto.add = function (val) {
   var n = interpretVal(val);
   var operandA = this.magnitude;
   if (operandA < 0 !== n.isNegative) {
    return this.subtract(n.flipSign());
   }
   var operandB = n.magnitude;
   if (n.isCompact) {
    if (isExact(operandA + operandB)) return new CompactNum(operandA + operandB);
    operandB = compactToArray(Math.abs(operandB));
   }
   return new LargeNum(addCompact(operandB, Math.abs(operandA)), operandA < 0);
  };
  CompactNum.proto.addOperation = CompactNum.proto.add;

  NativeLargeNum.proto.add = function (val) {
   return new NativeLargeNum(this.magnitude + interpretVal(val).magnitude);
  }
  NativeLargeNum.proto.addOperation = NativeLargeNum.proto.add;

  function performSubtraction(operandA, operandB) { // assumes operandA and operandB are arrays with operandA >= operandB
   var lenOperandA = operandA.length,
    lenOperandB = operandB.length,
    resultArray = new Array(lenOperandA),
    deficit = 0,
    base = NUM_BASE,
    idx, diffVal;
   for (idx = 0; idx < lenOperandB; idx++) {
    diffVal = operandA[idx] - deficit - operandB[idx];
    if (diffVal < 0) {
     diffVal += base;
     deficit = 1;
    } else deficit = 0;
    resultArray[idx] = diffVal;
   }
   for (idx = lenOperandB; idx < lenOperandA; idx++) {
    diffVal = operandA[idx] - deficit;
    if (diffVal < 0) diffVal += base;
    else {
     resultArray[idx++] = diffVal;
     break;
    }
    resultArray[idx] = diffVal;
   }
   for (; idx < lenOperandA; idx++) {
    resultArray[idx] = operandA[idx];
   }
   cleanArray(resultArray);
   return resultArray;
  }

  function performAnySubtraction(operandA, operandB, isNegative) {
   var magnitude;
   if (compareMagnitudes(operandA, operandB) >= 0) {
    magnitude = performSubtraction(operandA, operandB);
   } else {
    magnitude = performSubtraction(operandB, operandA);
    isNegative = !isNegative;
   }
   magnitude = arrayToCompact(magnitude);
   if (typeof magnitude === "number") {
    if (isNegative) magnitude = -magnitude;
    return new CompactNum(magnitude);
   }
   return new LargeNum(magnitude, isNegative);
  }

  function subtractCompact(operandA, operandB, isNegative) { // assumes operandA is array, operandB is number with 0 <= operandB < MAX_SAFE_INT
   var arraySize = operandA.length,
    resultArray = new Array(arraySize),
    carry = -operandB,
    base = NUM_BASE,
    idx, diffVal;
   for (idx = 0; idx < arraySize; idx++) {
    diffVal = operandA[idx] + carry;
    carry = Math.floor(diffVal / base);
    diffVal %= base;
    resultArray[idx] = diffVal < 0 ? diffVal + base : diffVal;
   }
   resultArray = arrayToCompact(resultArray);
   if (typeof resultArray === "number") {
    if (isNegative) resultArray = -resultArray;
    return new CompactNum(resultArray);
   } return new LargeNum(resultArray, isNegative);
  }

  LargeNum.proto.subtract = function (val) {
   var n = interpretVal(val);
   if (this.isNegative !== n.isNegative) {
    return this.add(n.flipSign());
   }
   var operandA = this.magnitude, operandB = n.magnitude;
   if (n.isCompact)
    return subtractCompact(operandA, Math.abs(operandB), this.isNegative);
   return performAnySubtraction(operandA, operandB, this.isNegative);
  };
  LargeNum.proto.subOperation = LargeNum.proto.subtract;

  CompactNum.proto.subtract = function (val) {
   var n = interpretVal(val);
   var operandA = this.magnitude;
   if (operandA < 0 !== n.isNegative) {
    return this.add(n.flipSign());
   }
   var operandB = n.magnitude;
   if (n.isCompact) {
    return new CompactNum(operandA - operandB);
   }
   return subtractCompact(operandB, Math.abs(operandA), operandA >= 0);
  };
  CompactNum.proto.subOperation = CompactNum.proto.subtract;

  NativeLargeNum.proto.subtract = function (val) {
   return new NativeLargeNum(this.magnitude - interpretVal(val).magnitude);
  }
  NativeLargeNum.proto.subOperation = NativeLargeNum.proto.subtract;

  LargeNum.proto.flipSign = function () {
   return new LargeNum(this.magnitude, !this.isNegative);
  };
  CompactNum.proto.flipSign = function () {
   var isNegative = this.isNegative;
   var compact = new CompactNum(-this.magnitude);
   compact.isNegative = !isNegative;
   return compact;
  };
  NativeLargeNum.proto.flipSign = function () {
   return new NativeLargeNum(-this.magnitude);
  }

  LargeNum.proto.absoluteValue = function () {
   return new LargeNum(this.magnitude, false);
  };
  CompactNum.proto.absoluteValue = function () {
   return new CompactNum(Math.abs(this.magnitude));
  };
  NativeLargeNum.proto.absoluteValue = function () {
   return new NativeLargeNum(this.magnitude >= 0 ? this.magnitude : -this.magnitude);
  }


  function longMultiply(operandA, operandB) {
   var lenOperandA = operandA.length,
    lenOperandB = operandB.length,
    totalLen = lenOperandA + lenOperandB,
    resultArray = makeArray(totalLen),
    base = NUM_BASE,
    partialProduct, remnant, idx, elemA, elemB;
   for (idx = 0; idx < lenOperandA; ++idx) {
    elemA = operandA[idx];
    for (var j = 0; j < lenOperandB; ++j) {
     elemB = operandB[j];
     partialProduct = elemA * elemB + resultArray[idx + j];
     remnant = Math.floor(partialProduct / base);
     resultArray[idx + j] = partialProduct - remnant * base;
     resultArray[idx + j + 1] += remnant;
    }
   }
   cleanArray(resultArray);
   return resultArray;
  }

  function compactMultiply(operandA, operandB) { // assumes operandA is array, operandB is number with |operandB| < NUM_BASE
   var arraySize = operandA.length,
    resultArray = new Array(arraySize),
    base = NUM_BASE,
    remnant = 0,
    partialProduct, idx;
   for (idx = 0; idx < arraySize; idx++) {
    partialProduct = operandA[idx] * operandB + remnant;
    remnant = Math.floor(partialProduct / base);
    resultArray[idx] = partialProduct - remnant * base;
   }
   while (remnant > 0) {
    resultArray[idx++] = remnant % base;
    remnant = Math.floor(remnant / base);
   }
   return resultArray;
  }

  function moveLeft(x, shiftAmount) {
   var resultArray = [];
   while (shiftAmount-- > 0) resultArray.push(0);
   return resultArray.concat(x);
  }

  function karatsubaMultiply(x, y) {
   var n = Math.max(x.length, y.length);

   if (n <= 30) return longMultiply(x, y);
   n = Math.ceil(n / 2);

   var operandB = x.slice(n),
    operandA = x.slice(0, n),
    operandD = y.slice(n),
    operandC = y.slice(0, n);

   var productAC = karatsubaMultiply(operandA, operandC),
    productBD = karatsubaMultiply(operandB, operandD),
    productABCD = karatsubaMultiply(performAnyAddition(operandA, operandB), performAnyAddition(operandC, operandD));

   var finalProduct = performAnyAddition(performAnyAddition(productAC, moveLeft(performSubtraction(performSubtraction(productABCD, productAC), productBD), n)), moveLeft(productBD, 2 * n));
   cleanArray(finalProduct);
   return finalProduct;
  }

  // The following function is derived from a surface fit of a graph plotting the performance difference
  // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
  function shouldUseKaratsuba(len1, len2) {
   return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
  }

  LargeNum.proto.multiply = function (val) {
   var n = interpretVal(val),
    operandA = this.magnitude, operandB = n.magnitude,
    isNegative = this.isNegative !== n.isNegative,
    absoluteVal;
   if (n.isCompact) {
    if (operandB === 0) return NumWrapper[0];
    if (operandB === 1) return this;
    if (operandB === -1) return this.flipSign();
    absoluteVal = Math.abs(operandB);
    if (absoluteVal < NUM_BASE) {
     return new LargeNum(compactMultiply(operandA, absoluteVal), isNegative);
    }
    operandB = compactToArray(absoluteVal);
   }
   if (shouldUseKaratsuba(operandA.length, operandB.length))
    return new LargeNum(karatsubaMultiply(operandA, operandB), isNegative);
   return new LargeNum(longMultiply(operandA, operandB), isNegative);
  };

  LargeNum.proto.multiplyOperation = LargeNum.proto.multiply;

  function compactArrayMultiply(operandA, operandB, isNegative) { // operandA >= 0
   if (operandA < NUM_BASE) {
    return new LargeNum(compactMultiply(operandB, operandA), isNegative);
   }
   return new LargeNum(longMultiply(operandB, compactToArray(operandA)), isNegative);
  }
  CompactNum.proto._multiplyWithCompact = function (operandA) {
   if (isExact(operandA.magnitude * this.magnitude)) {
    return new CompactNum(operandA.magnitude * this.magnitude);
   }
   return compactArrayMultiply(Math.abs(operandA.magnitude), compactToArray(Math.abs(this.magnitude)), this.isNegative !== operandA.isNegative);
  };
  LargeNum.proto._multiplyWithCompact = function (operandA) {
   if (operandA.magnitude === 0) return NumWrapper[0];
   if (operandA.magnitude === 1) return this;
   if (operandA.magnitude === -1) return this.flipSign();
   return compactArrayMultiply(Math.abs(operandA.magnitude), this.magnitude, this.isNegative !== operandA.isNegative);
  };
  CompactNum.proto.multiply = function (val) {
   return interpretVal(val)._multiplyWithCompact(this);
  };
  CompactNum.proto.multiplyOperation = CompactNum.proto.multiply;

  NativeLargeNum.proto.multiply = function (val) {
   return new NativeLargeNum(this.magnitude * interpretVal(val).magnitude);
  }
  NativeLargeNum.proto.multiplyOperation = NativeLargeNum.proto.multiply;

  function computeSquare(operandA) {
   var arraySize = operandA.length,
    resultArray = makeArray(arraySize + arraySize),
    base = NUM_BASE,
    partialProduct, remnant, idx, elemA, elemB;
   for (idx = 0; idx < arraySize; idx++) {
    elemA = operandA[idx];
    remnant = 0 - elemA * elemA;
    for (var j = idx; j < arraySize; j++) {
     elemB = operandA[j];
     partialProduct = 2 * (elemA * elemB) + resultArray[idx + j] + remnant;
     remnant = Math.floor(partialProduct / base);
     resultArray[idx + j] = partialProduct - remnant * base;
    }
    resultArray[idx + arraySize] = remnant;
   }
   cleanArray(resultArray);
   return resultArray;
  }

  LargeNum.proto.square = function () {
   return new LargeNum(computeSquare(this.magnitude), false);
  };

  CompactNum.proto.square = function () {
   var magnitude = this.magnitude * this.magnitude;
   if (isExact(magnitude)) return new CompactNum(magnitude);
   return new LargeNum(computeSquare(compactToArray(Math.abs(this.magnitude))), false);
  };

  NativeLargeNum.proto.square = function (val) {
   return new NativeLargeNum(this.magnitude * this.magnitude);
  }

  function divideModuloMethod1(operandA, operandB) {
   var lenOperandA = operandA.length,
    lenOperandB = operandB.length,
    base = NUM_BASE,
    resultArray = makeArray(operandB.length),
    highDivisorDigit = operandB[lenOperandB - 1],
    scalingFactor = Math.ceil(base / (2 * highDivisorDigit)),
    currentRemainder = compactMultiply(operandA, scalingFactor),
    currentDivisor = compactMultiply(operandB, scalingFactor),
    currentQuotientDigit, posShift, remnant, deficit, idx, arraySize, tempQuotient;
   if (currentRemainder.length <= lenOperandA) currentRemainder.push(0);
   currentDivisor.push(0);
   highDivisorDigit = currentDivisor[lenOperandB - 1];
   for (posShift = lenOperandA - lenOperandB; posShift >= 0; posShift--) {
    currentQuotientDigit = base - 1;
    if (currentRemainder[posShift + lenOperandB] !== highDivisorDigit) {
     currentQuotientDigit = Math.floor((currentRemainder[posShift + lenOperandB] * base + currentRemainder[posShift + lenOperandB - 1]) / highDivisorDigit);
    }
    remnant = 0;
    deficit = 0;
    arraySize = currentDivisor.length;
    for (idx = 0; idx < arraySize; idx++) {
     remnant += currentQuotientDigit * currentDivisor[idx];
     tempQuotient = Math.floor(remnant / base);
     deficit += currentRemainder[posShift + idx] - (remnant - tempQuotient * base);
     remnant = tempQuotient;
     if (deficit < 0) {
      currentRemainder[posShift + idx] = deficit + base;
      deficit = -1;
     } else {
      currentRemainder[posShift + idx] = deficit;
      deficit = 0;
     }
    }
    while (deficit !== 0) {
     currentQuotientDigit -= 1;
     remnant = 0;
     for (idx = 0; idx < arraySize; idx++) {
      remnant += currentRemainder[posShift + idx] - base + currentDivisor[idx];
      if (remnant < 0) {
       currentRemainder[posShift + idx] = remnant + base;
       remnant = 0;
      } else {
       currentRemainder[posShift + idx] = remnant;
       remnant = 1;
      }
     }
     deficit += remnant;
    }
    resultArray[posShift] = currentQuotientDigit;
   }
   currentRemainder = compactDivMod(currentRemainder, scalingFactor)[0];
   return [arrayToCompact(resultArray), arrayToCompact(currentRemainder)];
  }

  function divideModuloMethod2(operandA, operandB) {
   var lenOperandA = operandA.length,
    lenOperandB = operandB.length,
    resultArray = [],
    segment = [],
    base = NUM_BASE,
    estimatedValue, segmentLen, highSegmentVal, highDivisorVal, testProduct;
   while (lenOperandA) {
    segment.unshift(operandA[--lenOperandA]);
    cleanArray(segment);
    if (compareMagnitudes(segment, operandB) < 0) {
     resultArray.push(0);
     continue;
    }
    segmentLen = segment.length;
    highSegmentVal = segment[segmentLen - 1] * base + segment[segmentLen - 2];
    highDivisorVal = operandB[lenOperandB - 1] * base + operandB[lenOperandB - 2];
    if (segmentLen > lenOperandB) {
     highSegmentVal = (highSegmentVal + 1) * base;
    }
    estimatedValue = Math.ceil(highSegmentVal / highDivisorVal);
    do {
     testProduct = compactMultiply(operandB, estimatedValue);
     if (compareMagnitudes(testProduct, segment) <= 0) break;
     estimatedValue--;
    } while (estimatedValue);
    resultArray.push(estimatedValue);
    segment = performSubtraction(segment, testProduct);
   }
   resultArray.reverse();
   return [arrayToCompact(resultArray), arrayToCompact(segment)];
  }

  function compactDivMod(magnitude, scalingFactor) {
   var arraySize = magnitude.length,
    resultQuotient = makeArray(arraySize),
    base = NUM_BASE,
    idx, tempQuotient, currentRemainder, divisor;
   currentRemainder = 0;
   for (idx = arraySize - 1; idx >= 0; --idx) {
    divisor = currentRemainder * base + magnitude[idx];
    tempQuotient = floorOrCeil(divisor / scalingFactor);
    currentRemainder = divisor - tempQuotient * scalingFactor;
    resultQuotient[idx] = tempQuotient | 0;
   }
   return [resultQuotient, currentRemainder | 0];
  }

  function performAnyDivMod(self, val) {
   var magnitude, n = interpretVal(val);
   if (hasBuiltInBigInt) {
    return [new NativeLargeNum(self.magnitude / n.magnitude), new NativeLargeNum(self.magnitude % n.magnitude)];
   }
   var operandA = self.magnitude, operandB = n.magnitude;
   var resultQuotient;
   if (operandB === 0) throw new Error("Cannot divide by zero");
   if (self.isCompact) {
    if (n.isCompact) {
     return [new CompactNum(floorOrCeil(operandA / operandB)), new CompactNum(operandA % operandB)];
    }
    return [NumWrapper[0], self];
   }
   if (n.isCompact) {
    if (operandB === 1) return [self, NumWrapper[0]];
    if (operandB == -1) return [self.flipSign(), NumWrapper[0]];
    var absoluteVal = Math.abs(operandB);
    if (absoluteVal < NUM_BASE) {
     magnitude = compactDivMod(operandA, absoluteVal);
     resultQuotient = arrayToCompact(magnitude[0]);
     var currentRemainder = magnitude[1];
     if (self.isNegative) currentRemainder = -currentRemainder;
     if (typeof resultQuotient === "number") {
      if (self.isNegative !== n.isNegative) resultQuotient = -resultQuotient;
      return [new CompactNum(resultQuotient), new CompactNum(currentRemainder)];
     }
     return [new LargeNum(resultQuotient, self.isNegative !== n.isNegative), new CompactNum(currentRemainder)];
    }
    operandB = compactToArray(absoluteVal);
   }
   var comparison = compareMagnitudes(operandA, operandB);
   if (comparison === -1) return [NumWrapper[0], self];
   if (comparison === 0) return [NumWrapper[self.isNegative === n.isNegative ? 1 : -1], NumWrapper[0]];

   if (operandA.length + operandB.length <= 200)
    magnitude = divideModuloMethod1(operandA, operandB);
   else magnitude = divideModuloMethod2(operandA, operandB);

   resultQuotient = magnitude[0];
   var quotientSign = self.isNegative !== n.isNegative,
    moduloResult = magnitude[1],
    moduloSign = self.isNegative;
   if (typeof resultQuotient === "number") {
    if (quotientSign) resultQuotient = -resultQuotient;
    resultQuotient = new CompactNum(resultQuotient);
   } else resultQuotient = new LargeNum(resultQuotient, quotientSign);
   if (typeof moduloResult === "number") {
    if (moduloSign) moduloResult = -moduloResult;
    moduloResult = new CompactNum(moduloResult);
   } else moduloResult = new LargeNum(moduloResult, moduloSign);
   return [resultQuotient, moduloResult];
  }

  LargeNum.proto.divisionAndModulo = function (val) {
   var finalResult = performAnyDivMod(this, val);
   return {
    quotient: finalResult[0],
    remainder: finalResult[1]
   };
  };
  NativeLargeNum.proto.divisionAndModulo = CompactNum.proto.divisionAndModulo = LargeNum.proto.divisionAndModulo;


  LargeNum.proto.divisionResult = function (val) {
   return performAnyDivMod(this, val)[0];
  };
  NativeLargeNum.proto.divisionAlias = NativeLargeNum.proto.divisionResult = function (val) {
   return new NativeLargeNum(this.magnitude / interpretVal(val).magnitude);
  };
  CompactNum.proto.divisionAlias = CompactNum.proto.divisionResult = LargeNum.proto.divisionAlias = LargeNum.proto.divisionResult;

  LargeNum.proto.moduloResult = function (val) {
   return performAnyDivMod(this, val)[1];
  };
  NativeLargeNum.proto.remainderResult = NativeLargeNum.proto.moduloResult = function (val) {
   return new NativeLargeNum(this.magnitude % interpretVal(val).magnitude);
  };
  CompactNum.proto.remainderResult = CompactNum.proto.moduloResult = LargeNum.proto.remainderResult = LargeNum.proto.moduloResult;

  LargeNum.proto.exponentiate = function (val) {
   var n = interpretVal(val),
    operandA = this.magnitude,
    operandB = n.magnitude,
    magnitude, x, y;
   if (operandB === 0) return NumWrapper[1];
   if (operandA === 0) return NumWrapper[0];
   if (operandA === 1) return NumWrapper[1];
   if (operandA === -1) return n.isParityEven() ? NumWrapper[1] : NumWrapper[-1];
   if (n.isNegative) {
    return NumWrapper[0];
   }
   if (!n.isCompact) throw new Error("The exponent " + n.toTextRepresentation() + " is too large.");
   if (this.isCompact) {
    if (isExact(magnitude = Math.pow(operandA, operandB)))
     return new CompactNum(floorOrCeil(magnitude));
   }
   x = this;
   y = NumWrapper[1];
   while (true) {
    if (operandB & 1 === 1) {
     y = y.multiplyOperation(x);
     --operandB;
    }
    if (operandB === 0) break;
    operandB /= 2;
    x = x.square();
   }
   return y;
  };
  CompactNum.proto.exponentiate = LargeNum.proto.exponentiate;

  NativeLargeNum.proto.exponentiate = function (val) {
   var n = interpretVal(val);
   var operandA = this.magnitude, operandB = n.magnitude;
   var ZERO_BIGINT = BigInt(0), ONE_BIGINT = BigInt(1), TWO_BIGINT = BigInt(2);
   if (operandB === ZERO_BIGINT) return NumWrapper[1];
   if (operandA === ZERO_BIGINT) return NumWrapper[0];
   if (operandA === ONE_BIGINT) return NumWrapper[1];
   if (operandA === BigInt(-1)) return n.isParityEven() ? NumWrapper[1] : NumWrapper[-1];
   if (n.isSignedNegative()) return new NativeLargeNum(ZERO_BIGINT);
   var x = this;
   var y = NumWrapper[1];
   while (true) {
    if ((operandB & ONE_BIGINT) === ONE_BIGINT) {
     y = y.multiplyOperation(x);
     --operandB;
    }
    if (operandB === ZERO_BIGINT) break;
    operandB /= TWO_BIGINT;
    x = x.square();
   }
   return y;
  }

  LargeNum.proto.modularExponentiation = function (exponentVal, modulusVal) {
   exponentVal = interpretVal(exponentVal);
   modulusVal = interpretVal(modulusVal);
   if (modulusVal.isZeroVal()) throw new Error("Cannot take modular exponentiation with modulus 0");
   var runningResult = NumWrapper[1],
    base = this.moduloResult(modulusVal);
   if (exponentVal.isSignedNegative()) {
    exponentVal = exponentVal.multiplyOperation(NumWrapper[-1]);
    base = base.modularInverse(modulusVal);
   }
   while (exponentVal.isSignedPositive()) {
    if (base.isZeroVal()) return NumWrapper[0];
    if (exponentVal.isParityOdd()) runningResult = runningResult.multiplyOperation(base).moduloResult(modulusVal);
    exponentVal = exponentVal.divisionResult(2);
    base = base.square().moduloResult(modulusVal);
   }
   return runningResult;
  };
  NativeLargeNum.proto.modularExponentiation = CompactNum.proto.modularExponentiation = LargeNum.proto.modularExponentiation;

  function compareMagnitudes(operandA, operandB) {
   if (operandA.length !== operandB.length) {
    return operandA.length > operandB.length ? 1 : -1;
   }
   for (var idx = operandA.length - 1; idx >= 0; idx--) {
    if (operandA[idx] !== operandB[idx]) return operandA[idx] > operandB[idx] ? 1 : -1;
   }
   return 0;
  }

  LargeNum.proto.compareMagnitudes = function (val) {
   var n = interpretVal(val),
    operandA = this.magnitude,
    operandB = n.magnitude;
   if (n.isCompact) return 1;
   return compareMagnitudes(operandA, operandB);
  };
  CompactNum.proto.compareMagnitudes = function (val) {
   var n = interpretVal(val),
    operandA = Math.abs(this.magnitude),
    operandB = n.magnitude;
   if (n.isCompact) {
    operandB = Math.abs(operandB);
    return operandA === operandB ? 0 : operandA > operandB ? 1 : -1;
   }
   return -1;
  };
  NativeLargeNum.proto.compareMagnitudes = function (val) {
   var operandA = this.magnitude;
   var operandB = interpretVal(val).magnitude;
   operandA = operandA >= 0 ? operandA : -operandA;
   operandB = operandB >= 0 ? operandB : -operandB;
   return operandA === operandB ? 0 : operandA > operandB ? 1 : -1;
  }

  LargeNum.proto.compareValues = function (val) {
   if (val === PositiveLimit) {
    return -1;
   }
   if (val === NegativeLimit) {
    return 1;
   }

   var n = interpretVal(val),
    operandA = this.magnitude,
    operandB = n.magnitude;
   if (this.isNegative !== n.isNegative) {
    return n.isNegative ? 1 : -1;
   }
   if (n.isCompact) {
    return this.isNegative ? -1 : 1;
   }
   return compareMagnitudes(operandA, operandB) * (this.isNegative ? -1 : 1);
  };
  LargeNum.proto.comparisonAlias = LargeNum.proto.compareValues;

  CompactNum.proto.compareValues = function (val) {
   if (val === PositiveLimit) {
    return -1;
   }
   if (val === NegativeLimit) {
    return 1;
   }

   var n = interpretVal(val),
    operandA = this.magnitude,
    operandB = n.magnitude;
   if (n.isCompact) {
    return operandA == operandB ? 0 : operandA > operandB ? 1 : -1;
   }
   if (operandA < 0 !== n.isNegative) {
    return operandA < 0 ? -1 : 1;
   }
   return operandA < 0 ? 1 : -1;
  };
  CompactNum.proto.comparisonAlias = CompactNum.proto.compareValues;

  NativeLargeNum.proto.compareValues = function (val) {
   if (val === PositiveLimit) {
    return -1;
   }
   if (val === NegativeLimit) {
    return 1;
   }
   var operandA = this.magnitude;
   var operandB = interpretVal(val).magnitude;
   return operandA === operandB ? 0 : operandA > operandB ? 1 : -1;
  }
  NativeLargeNum.proto.comparisonAlias = NativeLargeNum.proto.compareValues;

  LargeNum.proto.isEqualTo = function (val) {
   return this.compareValues(val) === 0;
  };
  NativeLargeNum.proto.equalityAlias = NativeLargeNum.proto.isEqualTo = CompactNum.proto.equalityAlias = CompactNum.proto.isEqualTo = LargeNum.proto.equalityAlias = LargeNum.proto.isEqualTo;

  LargeNum.proto.isNotEqualTo = function (val) {
   return this.compareValues(val) !== 0;
  };
  NativeLargeNum.proto.inequalityAlias = NativeLargeNum.proto.isNotEqualTo = CompactNum.proto.inequalityAlias = CompactNum.proto.isNotEqualTo = LargeNum.proto.inequalityAlias = LargeNum.proto.isNotEqualTo;

  LargeNum.proto.isGreater = function (val) {
   return this.compareValues(val) > 0;
  };
  NativeLargeNum.proto.greaterThanAlias = NativeLargeNum.proto.isGreater = CompactNum.proto.greaterThanAlias = CompactNum.proto.isGreater = LargeNum.proto.greaterThanAlias = LargeNum.proto.isGreater;

  LargeNum.proto.isLesser = function (val) {
   return this.compareValues(val) < 0;
  };
  NativeLargeNum.proto.lessThanAlias = NativeLargeNum.proto.isLesser = CompactNum.proto.lessThanAlias = CompactNum.proto.isLesser = LargeNum.proto.lessThanAlias = LargeNum.proto.isLesser;

  LargeNum.proto.isGreaterOrEqual = function (val) {
   return this.compareValues(val) >= 0;
  };
  NativeLargeNum.proto.greaterOrEqualAlias = NativeLargeNum.proto.isGreaterOrEqual = CompactNum.proto.greaterOrEqualAlias = CompactNum.proto.isGreaterOrEqual = LargeNum.proto.greaterOrEqualAlias = LargeNum.proto.isGreaterOrEqual;

  LargeNum.proto.isLesserOrEqual = function (val) {
   return this.compareValues(val) <= 0;
  };
  NativeLargeNum.proto.lesserOrEqualAlias = NativeLargeNum.proto.isLesserOrEqual = CompactNum.proto.lesserOrEqualAlias = CompactNum.proto.isLesserOrEqual = LargeNum.proto.lesserOrEqualAlias = LargeNum.proto.isLesserOrEqual;

  LargeNum.proto.isParityEven = function () {
   return (this.magnitude[0] & 1) === 0;
  };
  CompactNum.proto.isParityEven = function () {
   return (this.magnitude & 1) === 0;
  };
  NativeLargeNum.proto.isParityEven = function () {
   return (this.magnitude & BigInt(1)) === BigInt(0);
  }

  LargeNum.proto.isParityOdd = function () {
   return (this.magnitude[0] & 1) === 1;
  };
  CompactNum.proto.isParityOdd = function () {
   return (this.magnitude & 1) === 1;
  };
  NativeLargeNum.proto.isParityOdd = function () {
   return (this.magnitude & BigInt(1)) === BigInt(1);
  }

  LargeNum.proto.isSignedPositive = function () {
   return !this.isNegative;
  };
  CompactNum.proto.isSignedPositive = function () {
   return this.magnitude > 0;
  };
  NativeLargeNum.proto.isSignedPositive = CompactNum.proto.isSignedPositive;

  LargeNum.proto.isSignedNegative = function () {
   return this.isNegative;
  };
  CompactNum.proto.isSignedNegative = function () {
   return this.magnitude < 0;
  };
  NativeLargeNum.proto.isSignedNegative = CompactNum.proto.isSignedNegative;

  LargeNum.proto.isOneUnit = function () {
   return false;
  };
  CompactNum.proto.isOneUnit = function () {
   return Math.abs(this.magnitude) === 1;
  };
  NativeLargeNum.proto.isOneUnit = function () {
   return this.absoluteValue().magnitude === BigInt(1);
  }

  LargeNum.proto.isZeroVal = function () {
   return false;
  };
  CompactNum.proto.isZeroVal = function () {
   return this.magnitude === 0;
  };
  NativeLargeNum.proto.isZeroVal = function () {
   return this.magnitude === BigInt(0);
  }

  LargeNum.proto.isDivisible = function (val) {
   var n = interpretVal(val);
   if (n.isZeroVal()) return false;
   if (n.isOneUnit()) return true;
   if (n.compareMagnitudes(2) === 0) return this.isParityEven();
   return this.moduloResult(n).isZeroVal();
  };
  NativeLargeNum.proto.isDivisible = CompactNum.proto.isDivisible = LargeNum.proto.isDivisible;

  function isSimplePrime(val) {
   var n = val.absoluteValue();
   if (n.isOneUnit()) return false;
   if (n.isEqualTo(2) || n.isEqualTo(3) || n.isEqualTo(5)) return true;
   if (n.isParityEven() || n.isDivisible(3) || n.isDivisible(5)) return false;
   if (n.isLesser(49)) return true;
   // We cannot determine primality definitively here; delegate to other checks.
  }

  function primalityTest(n, operandA) {
   var prevN = n.decrementValue(),
    operandB = prevN,
    exponentResult = 0,
    divisorIterator, tempVar, idx, currentX;
   while (operandB.isParityEven()) operandB = operandB.divisionResult(2), exponentResult++;
   next: for (idx = 0; idx < operandA.length; idx++) {
    if (n.isLesser(operandA[idx])) continue;
    currentX = numericUtil(operandA[idx]).modularExponentiation(operandB, n);
    if (currentX.isOneUnit() || currentX.isEqualTo(prevN)) continue;
    for (divisorIterator = exponentResult - 1; divisorIterator != 0; divisorIterator--) {
     currentX = currentX.square().moduloResult(n);
     if (currentX.isOneUnit()) return false;
     if (currentX.isEqualTo(prevN)) continue next;
    }
    return false;
   }
   return true;
  }

  LargeNum.proto.checkPrimality = function (strict) {
   var isPrime = isSimplePrime(this);
   if (isPrime !== unspecified) return isPrime;
   var n = this.absoluteValue();
   var bitCount = n.getBitCount();
   if (bitCount.isLesserOrEqual(64))
    return primalityTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
   var logarithmN = Math.log(2) * bitCount.toNativeNumber();
   var tempVar = Math.ceil((strict === true) ? (2 * Math.pow(logarithmN, 2)) : logarithmN);
   for (var operandA = [], idx = 0; idx < tempVar; idx++) {
    operandA.push(numericUtil(idx + 2));
   }
   return primalityTest(n, operandA);
  };
  NativeLargeNum.proto.checkPrimality = CompactNum.proto.checkPrimality = LargeNum.proto.checkPrimality;

  LargeNum.proto.checkProbablePrimality = function (testCycles, randomGen) {
   var isPrime = isSimplePrime(this);
   if (isPrime !== unspecified) return isPrime;
   var n = this.absoluteValue();
   var tempVar = testCycles === unspecified ? 5 : testCycles;
   for (var operandA = [], idx = 0; idx < tempVar; idx++) {
    operandA.push(numericUtil.randomBetween(2, n.subOperation(2), randomGen));
   }
   return primalityTest(n, operandA);
  };
  NativeLargeNum.proto.checkProbablePrimality = CompactNum.proto.checkProbablePrimality = LargeNum.proto.checkProbablePrimality;

  LargeNum.proto.modularInverse = function (n) {
   var temp = numericUtil.zero, newTemp = numericUtil.one, r = interpretVal(n), newRemainder = this.absoluteValue(), tempQuotient, prevTemp, prevRemainder;
   while (!newRemainder.isZeroVal()) {
    tempQuotient = r.divisionResult(newRemainder);
    prevTemp = temp;
    prevRemainder = r;
    temp = newTemp;
    r = newRemainder;
    newTemp = prevTemp.subtract(tempQuotient.multiplyOperation(newTemp));
    newRemainder = prevRemainder.subtract(tempQuotient.multiplyOperation(newRemainder));
   }
   if (!r.isOneUnit()) throw new Error(this.toTextRepresentation() + " and " + n.toTextRepresentation() + " are not co-prime");
   if (temp.compareValues(0) === -1) {
    temp = temp.addOperation(n);
   }
   if (this.isSignedNegative()) {
    return temp.flipSign();
   }
   return temp;
  };

  NativeLargeNum.proto.modularInverse = CompactNum.proto.modularInverse = LargeNum.proto.modularInverse;

  LargeNum.proto.incrementValue = function () {
   var magnitude = this.magnitude;
   if (this.isNegative) {
    return subtractCompact(magnitude, 1, this.isNegative);
   }
   return new LargeNum(addCompact(magnitude, 1), this.isNegative);
  };
  CompactNum.proto.incrementValue = function () {
   var magnitude = this.magnitude;
   if (magnitude + 1 < MAX_SAFE_INT) return new CompactNum(magnitude + 1);
   return new LargeNum(MAX_SAFE_ARR, false);
  };
  NativeLargeNum.proto.incrementValue = function () {
   return new NativeLargeNum(this.magnitude + BigInt(1));
  }

  LargeNum.proto.decrementValue = function () {
   var magnitude = this.magnitude;
   if (this.isNegative) {
    return new LargeNum(addCompact(magnitude, 1), true);
   }
   return subtractCompact(magnitude, 1, this.isNegative);
  };
  CompactNum.proto.decrementValue = function () {
   var magnitude = this.magnitude;
   if (magnitude - 1 > -MAX_SAFE_INT) return new CompactNum(magnitude - 1);
   return new LargeNum(MAX_SAFE_ARR, true);
  };
  NativeLargeNum.proto.decrementValue = function () {
   return new NativeLargeNum(this.magnitude - BigInt(1));
  }

  var twoPowers = [1];
  while (2 * twoPowers[twoPowers.length - 1] <= NUM_BASE) twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
  var twoPowersCount = twoPowers.length, maxTwoPower = twoPowers[twoPowersCount - 1];

  function isShiftAmountSmall(shiftAmount) {
   return Math.abs(shiftAmount) <= NUM_BASE;
  }

  LargeNum.proto.moveLeft = function (val) {
   var shiftAmount = interpretVal(val).toNativeNumber();
   if (!isShiftAmountSmall(shiftAmount)) {
    throw new Error(String(shiftAmount) + " is too large for shifting.");
   }
   if (shiftAmount < 0) return this.moveRight(-shiftAmount);
   var finalResult = this;
   if (finalResult.isZeroVal()) return finalResult;
   while (shiftAmount >= twoPowersCount) {
    finalResult = finalResult.multiplyOperation(maxTwoPower);
    shiftAmount -= twoPowersCount - 1;
   }
   return finalResult.multiplyOperation(twoPowers[shiftAmount]);
  };
  NativeLargeNum.proto.moveLeft = CompactNum.proto.moveLeft = LargeNum.proto.moveLeft;

  LargeNum.proto.moveRight = function (val) {
   var remainderAndQuotient;
   var shiftAmount = interpretVal(val).toNativeNumber();
   if (!isShiftAmountSmall(shiftAmount)) {
    throw new Error(String(shiftAmount) + " is too large for shifting.");
   }
   if (shiftAmount < 0) return this.moveLeft(-shiftAmount);
   var finalResult = this;
   while (shiftAmount >= twoPowersCount) {
    if (finalResult.isZeroVal() || (finalResult.isSignedNegative() && finalResult.isOneUnit())) return finalResult;
    remainderAndQuotient = performAnyDivMod(finalResult, maxTwoPower);
    finalResult = remainderAndQuotient[1].isSignedNegative() ? remainderAndQuotient[0].decrementValue() : remainderAndQuotient[0];
    shiftAmount -= twoPowersCount - 1;
   }
   remainderAndQuotient = performAnyDivMod(finalResult, twoPowers[shiftAmount]);
   return remainderAndQuotient[1].isSignedNegative() ? remainderAndQuotient[0].decrementValue() : remainderAndQuotient[0];
  };
  NativeLargeNum.proto.moveRight = CompactNum.proto.moveRight = LargeNum.proto.moveRight;

  function binaryOp(x, y, operationFunction) {
   y = interpretVal(y);
   var operandXSign = x.isSignedNegative(), operandYSign = y.isSignedNegative();
   var xRemaining = operandXSign ? x.bitwiseNot() : x,
    yRemaining = operandYSign ? y.bitwiseNot() : y;
   var xComponent = 0, yComponent = 0;
   var xDivModResult = null, yDivModResult = null;
   var resultArray = [];
   while (!xRemaining.isZeroVal() || !yRemaining.isZeroVal()) {
    xDivModResult = performAnyDivMod(xRemaining, maxTwoPower);
    xComponent = xDivModResult[1].toNativeNumber();
    if (operandXSign) {
     xComponent = maxTwoPower - 1 - xComponent;
    }

    yDivModResult = performAnyDivMod(yRemaining, maxTwoPower);
    yComponent = yDivModResult[1].toNativeNumber();
    if (operandYSign) {
     yComponent = maxTwoPower - 1 - yComponent;
    }

    xRemaining = xDivModResult[0];
    yRemaining = yDivModResult[0];
    resultArray.push(operationFunction(xComponent, yComponent));
   }
   var accumulatedValue = operationFunction(operandXSign ? 1 : 0, operandYSign ? 1 : 0) !== 0 ? numericUtil(-1) : numericUtil(0);
   for (var idx = resultArray.length - 1; idx >= 0; idx -= 1) {
    accumulatedValue = accumulatedValue.multiplyOperation(maxTwoPower).addOperation(numericUtil(resultArray[idx]));
   }
   return accumulatedValue;
  }

  LargeNum.proto.bitwiseNot = function () {
   return this.flipSign().decrementValue();
  };
  NativeLargeNum.proto.bitwiseNot = CompactNum.proto.bitwiseNot = LargeNum.proto.bitwiseNot;

  LargeNum.proto.bitwiseAnd = function (n) {
   return binaryOp(this, n, function (operandA, operandB) { return operandA & operandB; });
  };
  NativeLargeNum.proto.bitwiseAnd = CompactNum.proto.bitwiseAnd = LargeNum.proto.bitwiseAnd;

  LargeNum.proto.bitwiseOr = function (n) {
   return binaryOp(this, n, function (operandA, operandB) { return operandA | operandB; });
  };
  NativeLargeNum.proto.bitwiseOr = CompactNum.proto.bitwiseOr = LargeNum.proto.bitwiseOr;

  LargeNum.proto.bitwiseXor = function (n) {
   return binaryOp(this, n, function (operandA, operandB) { return operandA ^ operandB; });
  };
  NativeLargeNum.proto.bitwiseXor = CompactNum.proto.bitwiseXor = LargeNum.proto.bitwiseXor;

  var LOW_BIT_MASK_INT = 1 << 30, LOW_BIT_MASK_BIGINT = (NUM_BASE & -NUM_BASE) * (NUM_BASE & -NUM_BASE) | LOW_BIT_MASK_INT;
  function approxLowestOneBit(n) {
   var magnitude = n.magnitude,
    val = typeof magnitude === "number" ? magnitude | LOW_BIT_MASK_INT :
     typeof magnitude === "bigint" ? magnitude | BigInt(LOW_BIT_MASK_INT) :
      magnitude[0] + magnitude[1] * NUM_BASE | LOW_BIT_MASK_BIGINT;
   return val & -val;
  }

  function intLogarithm(val, base) {
   if (base.compareValues(val) <= 0) {
    var tempResult = intLogarithm(val, base.square(base));
    var powerResult = tempResult.powerResult;
    var exponentResult = tempResult.exponentResult;
    var product = powerResult.multiplyOperation(base);
    return product.compareValues(val) <= 0 ? { powerResult: product, exponentResult: exponentResult * 2 + 1 } : { powerResult: powerResult, exponentResult: exponentResult * 2 };
   }
   return { powerResult: numericUtil(1), exponentResult: 0 };
  }

  LargeNum.proto.getBitCount = function () {
   var n = this;
   if (n.compareValues(numericUtil(0)) < 0) {
    n = n.flipSign().subtract(numericUtil(1));
   }
   if (n.compareValues(numericUtil(0)) === 0) {
    return numericUtil(0);
   }
   return numericUtil(intLogarithm(n, numericUtil(2)).exponentResult).addOperation(numericUtil(1));
  }
  NativeLargeNum.proto.getBitCount = CompactNum.proto.getBitCount = LargeNum.proto.getBitCount;

  function findMaximum(operandA, operandB) {
   operandA = interpretVal(operandA);
   operandB = interpretVal(operandB);
   return operandA.isGreater(operandB) ? operandA : operandB;
  }
  function findMinimum(operandA, operandB) {
   operandA = interpretVal(operandA);
   operandB = interpretVal(operandB);
   return operandA.isLesser(operandB) ? operandA : operandB;
  }
  function greatestCommonDivisor(operandA, operandB) {
   operandA = interpretVal(operandA).absoluteValue();
   operandB = interpretVal(operandB).absoluteValue();
   if (operandA.isEqualTo(operandB)) return operandA;
   if (operandA.isZeroVal()) return operandB;
   if (operandB.isZeroVal()) return operandA;
   var commonFactor = NumWrapper[1], divisorValue, temporaryValue;
   while (operandA.isParityEven() && operandB.isParityEven()) {
    divisorValue = findMinimum(approxLowestOneBit(operandA), approxLowestOneBit(operandB));
    operandA = operandA.divisionResult(divisorValue);
    operandB = operandB.divisionResult(divisorValue);
    commonFactor = commonFactor.multiplyOperation(divisorValue);
   }
   while (operandA.isParityEven()) {
    operandA = operandA.divisionResult(approxLowestOneBit(operandA));
   }
   do {
    while (operandB.isParityEven()) {
     operandB = operandB.divisionResult(approxLowestOneBit(operandB));
    }
    if (operandA.isGreater(operandB)) {
     temporaryValue = operandB; operandB = operandA; operandA = temporaryValue;
    }
    operandB = operandB.subtract(operandA);
   } while (!operandB.isZeroVal());
   return commonFactor.isOneUnit() ? operandA : operandA.multiplyOperation(commonFactor);
  }
  function leastCommonMultiple(operandA, operandB) {
   operandA = interpretVal(operandA).absoluteValue();
   operandB = interpretVal(operandB).absoluteValue();
   return operandA.divisionResult(greatestCommonDivisor(operandA, operandB)).multiplyOperation(operandB);
  }
  function randomBetween(lowerBound, upperBound, randomGen) {
   lowerBound = interpretVal(lowerBound);
   upperBound = interpretVal(upperBound);
   var randomGenerator = randomGen || Math.random;
   var low = findMinimum(lowerBound, upperBound), high = findMaximum(lowerBound, upperBound);
   var valueRange = high.subtract(low).addOperation(1);
   if (valueRange.isCompact) return low.addOperation(Math.floor(randomGenerator() * valueRange));
   var numDigits = convertToBase(valueRange, NUM_BASE).magnitude;
   var resultArray = [], isRestricted = true;
   for (var idx = 0; idx < numDigits.length; idx++) {
    var maxDigit = isRestricted ? numDigits[idx] : NUM_BASE;
    var currentDigit = floorOrCeil(randomGenerator() * maxDigit);
    resultArray.push(currentDigit);
    if (currentDigit < maxDigit) isRestricted = false;
   }
   return low.addOperation(NumWrapper.fromArray(resultArray, NUM_BASE, false));
  }

  var parseFromBase = function (inputString, baseVal, symbolSet, isCaseSensitive) {
   symbolSet = symbolSet || STANDARD_DIGITS;
   inputString = String(inputString);
   if (!isCaseSensitive) {
    inputString = inputString.toLowerCase();
    symbolSet = symbolSet.toLowerCase();
   }
   var arraySize = inputString.length;
   var idx;
   var absoluteBase = Math.abs(baseVal);
   var charToValueMap = {};
   for (idx = 0; idx < symbolSet.length; idx++) {
    charToValueMap[symbolSet[idx]] = idx;
   }
   for (idx = 0; idx < arraySize; idx++) {
    var currentChar = inputString[idx];
    if (currentChar === "-") continue;
    if (currentChar in charToValueMap) {
     if (charToValueMap[currentChar] >= absoluteBase) {
      if (currentChar === "1" && absoluteBase === 1) continue;
      throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
     }
    }
   }
   baseVal = interpretVal(baseVal);
   var resultDigits = [];
   var isResultNegative = inputString[0] === "-";
   for (idx = isResultNegative ? 1 : 0; idx < inputString.length; idx++) {
    var currentChar = inputString[idx];
    if (currentChar in charToValueMap) resultDigits.push(interpretVal(charToValueMap[currentChar]));
    else if (currentChar === "<") {
     var startIndex = idx;
     do { idx++; } while (inputString[idx] !== ">" && idx < inputString.length);
     resultDigits.push(interpretVal(inputString.slice(startIndex + 1, idx)));
    }
    else throw new Error(currentChar + " is not a valid character");
   }
   return parseFromBaseArr(resultDigits, baseVal, isResultNegative);
  };

  function parseFromBaseArr(resultDigits, baseVal, isResultNegative) {
   var computedVal = NumWrapper[0], powerOfBase = NumWrapper[1], idx;
   for (idx = resultDigits.length - 1; idx >= 0; idx--) {
    computedVal = computedVal.addOperation(resultDigits[idx].multiplyOperation(powerOfBase));
    powerOfBase = powerOfBase.multiplyOperation(baseVal);
   }
   return isResultNegative ? computedVal.flipSign() : computedVal;
  }

  function convertDigitToStr(digit, symbolSet) {
   symbolSet = symbolSet || STANDARD_DIGITS;
   if (digit < symbolSet.length) {
    return symbolSet[digit];
   }
   return "<" + digit + ">";
  }

  function convertToBase(n, base) {
   base = numericUtil(base);
   if (base.isZeroVal()) {
    if (n.isZeroVal()) return { magnitude: [0], isNegative: false };
    throw new Error("Cannot convert nonzero numbers to base 0.");
   }
   if (base.isEqualTo(-1)) {
    if (n.isZeroVal()) return { magnitude: [0], isNegative: false };
    if (n.isSignedNegative())
     return {
      magnitude: [].concat.apply([], Array.apply(null, Array(-n.toNativeNumber()))
       .map(Array.proto.valueOf, [1, 0])
      ),
      isNegative: false
     };

    var tempArray = Array.apply(null, Array(n.toNativeNumber() - 1))
     .map(Array.proto.valueOf, [0, 1]);
    tempArray.unshift([1]);
    return {
     magnitude: [].concat.apply([], tempArray),
     isNegative: false
    };
   }

   var isResultNegative = false;
   if (n.isSignedNegative() && base.isSignedPositive()) {
    isResultNegative = true;
    n = n.absoluteValue();
   }
   if (base.isOneUnit()) {
    if (n.isZeroVal()) return { magnitude: [0], isNegative: false };

    return {
     magnitude: Array.apply(null, Array(n.toNativeNumber()))
      .map(Number.proto.valueOf, 1),
     isNegative: isResultNegative
    };
   }
   var out = [];
   var remainingValue = n, divisionAndModuloResult;
   while (remainingValue.isSignedNegative() || remainingValue.compareMagnitudes(base) >= 0) {
    divisionAndModuloResult = remainingValue.divisionAndModulo(base);
    remainingValue = divisionAndModuloResult.quotient;
    var currentDigit = divisionAndModuloResult.remainder;
    if (currentDigit.isSignedNegative()) {
     currentDigit = base.subOperation(currentDigit).absoluteValue();
     remainingValue = remainingValue.incrementValue();
    }
    out.push(currentDigit.toNativeNumber());
   }
   out.push(remainingValue.toNativeNumber());
   return { magnitude: out.reverse(), isNegative: isResultNegative };
  }

  function toBaseRepresentation(n, base, symbolSet) {
   var arr = convertToBase(n, base);
   return (arr.isNegative ? "-" : "") + arr.magnitude.map(function (x) {
    return convertDigitToStr(x, symbolSet);
   }).join('');
  }

  LargeNum.proto.toValueArray = function (baseVal) {
   return convertToBase(this, baseVal);
  };

  CompactNum.proto.toValueArray = function (baseVal) {
   return convertToBase(this, baseVal);
  };

  NativeLargeNum.proto.toValueArray = function (baseVal) {
   return convertToBase(this, baseVal);
  };

  LargeNum.proto.toTextRepresentation = function (baseVal, symbolSet) {
   if (baseVal === unspecified) baseVal = 10;
   if (baseVal !== 10) return toBaseRepresentation(this, baseVal, symbolSet);
   var magnitude = this.magnitude, arraySize = magnitude.length, outputStr = String(magnitude[--arraySize]), zeroPadding = "0000000", currentDigit;
   while (--arraySize >= 0) {
    currentDigit = String(magnitude[arraySize]);
    outputStr += zeroPadding.slice(currentDigit.length) + currentDigit;
   }
   var finalSign = this.isNegative ? "-" : "";
   return finalSign + outputStr;
  };

  CompactNum.proto.toTextRepresentation = function (baseVal, symbolSet) {
   if (baseVal === unspecified) baseVal = 10;
   if (baseVal != 10) return toBaseRepresentation(this, baseVal, symbolSet);
   return String(this.magnitude);
  };

  NativeLargeNum.proto.toTextRepresentation = CompactNum.proto.toTextRepresentation;

  NativeLargeNum.proto.toJsonString = LargeNum.proto.toJsonString = CompactNum.proto.toJsonString = function () { return this.toTextRepresentation(); }

  LargeNum.proto.getValue = function () {
   return parseInt(this.toTextRepresentation(), 10);
  };
  LargeNum.proto.toNativeNumber = LargeNum.proto.getValue;

  CompactNum.proto.getValue = function () {
   return this.magnitude;
  };
  CompactNum.proto.toNativeNumber = CompactNum.proto.getValue;
  NativeLargeNum.proto.getValue = NativeLargeNum.proto.toNativeNumber = function () {
   return parseInt(this.toTextRepresentation(), 10);
  }

  function parseStringAsValue(val) {
   if (isExact(+val)) {
    var parsedNum = +val;
    if (parsedNum === floorOrCeil(parsedNum))
     return hasBuiltInBigInt ? new NativeLargeNum(BigInt(parsedNum)) : new CompactNum(parsedNum);
    throw new Error("Invalid integer: " + val);
   }
   var isNegative = val[0] === "-";
   if (isNegative) val = val.slice(1);
   var parts = val.split(/e/i);
   if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));
   if (parts.length === 2) {
    var exponentPart = parts[1];
    if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
    exponentPart = +exponentPart;
    if (exponentPart !== floorOrCeil(exponentPart) || !isExact(exponentPart)) throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
    var text = parts[0];
    var dotPosition = text.indexOf(".");
    if (dotPosition >= 0) {
     exponentPart -= text.length - dotPosition - 1;
     text = text.slice(0, dotPosition) + text.slice(dotPosition + 1);
    }
    if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
    text += (new Array(exponentPart + 1)).join("0");
    val = text;
   }
   var isStringValid = /^([0-9][0-9]*)$/.test(val);
   if (!isStringValid) throw new Error("Invalid integer: " + val);
   if (hasBuiltInBigInt) {
    return new NativeLargeNum(BigInt(isNegative ? "-" + val : val));
   }
   var resultDigits = [], max = val.length, segmentLen = BASE_LOG, min = max - segmentLen;
   while (max > 0) {
    resultDigits.push(+val.slice(min, max));
    min -= segmentLen;
    if (min < 0) min = 0;
    max -= segmentLen;
   }
   cleanArray(resultDigits);
   return new LargeNum(resultDigits, isNegative);
  }

  function parseNumberAsValue(val) {
   if (hasBuiltInBigInt) {
    return new NativeLargeNum(BigInt(val));
   }
   if (isExact(val)) {
    if (val !== floorOrCeil(val)) throw new Error(val + " is not an integer.");
    return new CompactNum(val);
   }
   return parseStringAsValue(val.toTextRepresentation());
  }

  function interpretVal(val) {
   if (typeof val === "number") {
    return parseNumberAsValue(val);
   }
   if (typeof val === "string") {
    return parseStringAsValue(val);
   }
   if (typeof val === "bigint") {
    return new NativeLargeNum(val);
   }
   return val;
  }
  // Pre-define numbers in range [-999,999] for quick access
  for (var idx = 0; idx < 1000; idx++) {
   NumWrapper[idx] = interpretVal(idx);
   if (idx > 0) NumWrapper[-idx] = interpretVal(-idx);
  }
  // Backward compatibility aliases
  NumWrapper.one = NumWrapper[1];
  NumWrapper.zero = NumWrapper[0];
  NumWrapper.minusOne = NumWrapper[-1];
  NumWrapper.findMaximum = findMaximum;
  NumWrapper.findMinimum = findMinimum;
  NumWrapper.greatestCommonDivisor = greatestCommonDivisor;
  NumWrapper.leastCommonMultiple = leastCommonMultiple;
  NumWrapper.isInstance = function (x) { return x instanceof LargeNum || x instanceof CompactNum || x instanceof NativeLargeNum; };
  NumWrapper.randomBetween = randomBetween;

  NumWrapper.fromArray = function (resultDigits, baseVal, isNegative) {
   return parseFromBaseArr(resultDigits.map(interpretVal), interpretVal(baseVal || 10), isNegative);
  };

  return NumWrapper;
 })();

 // Node.js environment check
 if ( true && unitDescriptor.hasOwnProperty("outputContent")) {
  unitDescriptor.outputContent = numericUtil;
 }

 // AMD (Asynchronous Module Definition) check
 if (true) {
  !(__AMD_DEFINITION_OUTCOME__ = (function () {
   return numericUtil;
  }).call(moduleOutputs, __bundle_loader__, moduleOutputs, unitDescriptor),
   __AMD_DEFINITION_OUTCOME__ !== unspecified && (unitDescriptor.outputContent = __AMD_DEFINITION_OUTCOME__));
 }

}),

 "./node_modules/webpack/buildin/module.js":
 (function(currentModule, moduleOutputs) {

 currentModule.exports = function(currentModule) {
  if (!currentModule.bundleAdapter) {
   currentModule.deprecateFn = function() {};
   currentModule.lookupPaths = [];
   if (!currentModule.childModules) currentModule.childModules = [];
   Object.defineProperty(currentModule, "loaded", {
    enumerable: true,
    get: function() {
     return currentModule.loadedFlag;
    }
   });
   Object.defineProperty(currentModule, "id", {
    enumerable: true,
    get: function() {
     return currentModule.identifier;
    }
   });
   currentModule.bundleAdapter = 1;
  }
  return currentModule;
 };


}),

 "./src/ABC150/B.js":
 (function(currentModule, moduleOutputs, __bundle_loader__) {

"use strict";
__bundle_loader__.registerNamespace(moduleOutputs);
/* harmony import */ var fileSys_IMPORT_0__ = __bundle_loader__("fs");
/* harmony import */ var fileSys_IMPORT_0___default = /*#__PURE__*/__bundle_loader__.getDefaultAccessor(fileSys_IMPORT_0__);
/* harmony import */ var largeNumber_IMPORT_1__ = __bundle_loader__("./node_modules/big-integer/BigInteger.js");
/* harmony import */ var largeNumber_IMPORT_1___default = /*#__PURE__*/__bundle_loader__.getDefaultAccessor(largeNumber_IMPORT_1__);
/* harmony import */ var utilityHelpers_IMPORT_2__ = __bundle_loader__("./src/utils.js");
/* harmony import */ var utilityHelpers_IMPORT_2___default = /*#__PURE__*/__bundle_loader__.getDefaultAccessor(utilityHelpers_IMPORT_2__);



var getLines = utilityHelpers_IMPORT_2__["obtainLines"],
    textToNumbers = utilityHelpers_IMPORT_2__["parseNumbers"];

var executeProblem = function executeProblem(rawData) {
  var inputLines = getLines(rawData);
  var inputStringData = inputLines[1];
  var charArray = inputStringData.split('');
  var occurrenceCount = 0;

  for (var loopIndex = 0, arrayLength = charArray.length; loopIndex < arrayLength - 2; loopIndex++) {
    if (charArray[loopIndex] === 'A' && charArray[loopIndex + 1] === 'B' && charArray[loopIndex + 2] === 'C') {
      occurrenceCount++;
    }
  }

  console.info(occurrenceCount);
};

executeProblem(fileSys_IMPORT_0__["readInputSync"]('/system/input_stream', 'unicode-8'));



}),

 "./src/utils.js":
 (function(currentModule, moduleOutputs, __bundle_loader__) {

var largeNumber = __bundle_loader__("./node_modules/big-integer/BigInteger.js");

var MAX_VAL = 1001001001;
var PRIME_MOD = Math.pow(10, 9) + 7;

var obtainLines = function obtainLines(sourceData) {
  return sourceData.split('\n');
};

var parseNumbers = function parseNumbers(inputLine) {
  return inputLine.split(' ').map(function (numericStr) {
    return numericStr - 0;
  });
};

var uniqueElements = function uniqueElements(dataArray) {
  return dataArray.filter(function (currentElement, currentIndex, selfRef) {
    return selfRef.indexOf(currentElement) === currentIndex;
  });
};

var computePermutation = function computePermutation(n, r) {
  var resultAccumulator = 1;

  for (var loopCounter = 0; loopCounter < r; loopCounter++) {
    resultAccumulator = resultAccumulator * (n - loopCounter);
  }

  return resultAccumulator;
};

var computeCombination = function computeCombination(n, r) {
  return computePermutation(n, r) / computePermutation(r, r);
};

var modularPower = function modularPower(baseValue, exponentValue) {
  baseValue = baseValue % PRIME_MOD;
  if (exponentValue === 0) return 1;
  if (exponentValue % 2 === 1) return baseValue * modularPower(baseValue, exponentValue - 1) % PRIME_MOD;
  return modularPower(baseValue * baseValue % PRIME_MOD, exponentValue / 2) % PRIME_MOD;
};

var modularCombination = function modularCombination(n, k) {
  var numeratorTerm = 1;

  for (var loopCounter = n - k - 1; loopCounter <= n; loopCounter++) {
    numeratorTerm = numeratorTerm * loopCounter % PRIME_MOD;
  }

  var denominatorTerm = 1;

  for (var innerLoopCounter = 1; innerLoopCounter <= k; innerLoopCounter++) {
    denominatorTerm = denominatorTerm * denominatorTerm % PRIME_MOD;
  }

  denominatorTerm = modularPower(denominatorTerm, PRIME_MOD - 2);
  return numeratorTerm * denominatorTerm % PRIME_MOD;
};

var fancyUtilsRoutine = function fancyUtilsRoutine(n, r) {
  var productP = 1;
  var productQ = 1;

  for (var loopCounter = 0; loopCounter < r; loopCounter++) {
    productP = productP * (n - loopCounter) % PRIME_MOD;
    productQ = productQ * (loopCounter + 1) % PRIME_MOD;
  }

  return productP * powerModulo(productQ, PRIME_MOD - 2, PRIME_MOD) % PRIME_MOD;
};

var powerModulo = function powerModulo(baseValue, exponentValue, modulusVal) {
  return largeNumber(baseValue).multiply(exponentValue).divisionAndModulo(modulusVal).remainder.toNativeNumber();
};

currentModule.exports = {
  MAX_VAL,
  PRIME_MOD,
  obtainLines,
  parseNumbers,
  uniqueElements,
  computePermutation,
  computeCombination,
  modularPower,
  modularCombination,
  fancyUtilsRoutine
};

})

});