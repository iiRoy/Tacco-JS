(function (sourceModules) {
  // This is the primary module cache
  var loadedUnits = {};

  // This is the module loading utility
  function __module_loader__(unitId) {

    // Check if the unit is already in the cache
    if (loadedUnits[unitId]) {
      return loadedUnits[unitId].output;
    }
    // Create a fresh unit (and store it in the cache)
    var unitItem = loadedUnits[unitId] = {
      identifier: unitId,
      isLoaded: false,
      output: {}
    };

    // Run the module's core function
    sourceModules[unitId].call(unitItem.output, unitItem, unitItem.output, __module_loader__);

    // Mark the unit as fully loaded
    unitItem.isLoaded = true;

    // Return the unit's exports
    return unitItem.output;
  }


  // Make the entire source modules object available
  __module_loader__.allSources = sourceModules;

  // Make the module cache accessible
  __module_loader__.cacheStore = loadedUnits;

  // Define a getter function for ES modules' exports
  __module_loader__.defineGetter = function (outputObject, propName, propGetter) {
    if (!__module_loader__.hasOwnProp(outputObject, propName)) {
      Object.defineProperty(outputObject, propName, {
        enumerated: true,
        get: propGetter
      });
    }
  };

  // Set the __isESModule property on exports
  __module_loader__.markAsModule = function (outputObject) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(outputObject, Symbol.toStringTag, {
        attribute: 'ModuleUnit'
      });
    }
    Object.defineProperty(outputObject, '__isESModule', {
      attribute: true
    });
  };

  // Craft a synthetic namespace object
  // mode & 1: inputData is a module identifier, load it
  // mode & 2: merge all properties from inputData into the namespaceObj
  // mode & 4: return inputData directly if it's already a namespace object
  // mode & 8|1: behave like a direct require call
  __module_loader__.createNamespace = function (inputData, processingMode) {
    if (processingMode & 1) inputData = __module_loader__(inputData);
    if (processingMode & 8) return inputData;
    if ((processingMode & 4) && typeof inputData === 'object' && inputData && inputData.__isESModule) return inputData;
    var namespaceObj = Object.create(null);
    __module_loader__.markAsModule(namespaceObj);
    Object.defineProperty(namespaceObj, 'standardExport', {
      enumerated: true,
      attribute: inputData
    });
    if (processingMode & 2 && typeof inputData != 'string') for (var itemKey in inputData) __module_loader__.defineGetter(namespaceObj, itemKey, function (currentKey) {
      return inputData[currentKey];
    }.bind(null, itemKey));
    return namespaceObj;
  };

  // Helper function to get the default export for compatibility with non-ES modules
  __module_loader__.defaultExportFunction = function (currentModule) {
    var exportRetriever = currentModule && currentModule.__isESModule ?
      function obtainDefault() {
        return currentModule['standardExport'];
      } :
      function obtainAllExports() {
        return currentModule;
      };
    __module_loader__.defineGetter(exportRetriever, 'accessor', exportRetriever);
    return exportRetriever;
  };

  // Object.prototype.hasOwnProperty.call wrapper
  __module_loader__.hasOwnProp = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets
  __module_loader__.basePath = "";


  // Load the entry module and return its exports
  return __module_loader__(__module_loader__.startModule = "./src/ABC156/B.js");
})
/************************************************************************/
({

  /***/
  "./node_modules/big-integer/BigInteger.js":
    /*!************************************************!*\
      !*** ./node_modules/big-integer/BigInteger.js ***!
      \************************************************/
    /*! no static exports found */
    /***/
    (function (moduleUnit, exports, __module_loader__) {

      /* WEBPACK VAR INJECTION */
      (function (moduleUnit) {
        var __AMD_DEFINITION_RESULT__;
        var largeNumber = (function (noValue) {
          "use strict";

          var NUM_BASE = 1e7,
            BASE_LOG = 7,
            MAX_SAFE_NUM = 9007199254740992,
            MAX_SAFE_NUM_ARRAY = compactToArray(MAX_SAFE_NUM),
            STANDARD_ALPHA = "0123456789abcdefghijklmnopqrstuvwxyz";

          var hasNativeBigIntSupport = typeof BigInt === "function";

          function IntNumber(inputValue, numBase, charSet, caseSensFlag) {
            if (typeof inputValue === "undefined") return IntNumber[0];
            if (typeof numBase !== "undefined") return +numBase === 10 && !charSet ? interpretInput(inputValue) : interpretBase(inputValue, numBase, charSet, caseSensFlag);
            return interpretInput(inputValue);
          }

          function LargeInteger(numericalValue, positiveFlag) {
            this.numericalValue = numericalValue;
            this.positiveFlag = positiveFlag;
            this.isCompact = false;
          }
          LargeInteger.prototype = Object.create(IntNumber.prototype);

          function CompactInteger(numericalValue) {
            this.numericalValue = numericalValue;
            this.positiveFlag = numericalValue < 0;
            this.isCompact = true;
          }
          CompactInteger.prototype = Object.create(IntNumber.prototype);

          function NativeLargeInt(numericalValue) {
            this.numericalValue = numericalValue;
          }
          NativeLargeInt.prototype = Object.create(IntNumber.prototype);

          function isExact(numToCheck) {
            return -MAX_SAFE_NUM < numToCheck && numToCheck < MAX_SAFE_NUM;
          }

          function compactToArray(num) { // For perf reasons doesn't reference NUM_BASE, needs change if NUM_BASE changes
            if (num < 1e7)
              return [num];
            if (num < 1e14)
              return [num % 1e7, Math.floor(num / 1e7)];
            return [num % 1e7, Math.floor(num / 1e7) % 1e7, Math.floor(num / 1e14)];
          }

          function arrayToCompact(arr) { // If NUM_BASE changes this function may need to change
            normalizeArray(arr);
            var currentLength = arr.length;
            if (currentLength < 4 && compareAbsolute(arr, MAX_SAFE_NUM_ARRAY) < 0) {
              switch (currentLength) {
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

          function normalizeArray(valArray) {
            var idx = valArray.length;
            while (valArray[--idx] === 0);
            valArray.length = idx + 1;
          }

          function makeArray(len) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
            var arr = new Array(len);
            var idx = -1;
            while (++idx < len) {
              arr[idx] = 0;
            }
            return arr;
          }

          function floorOrCeil(num) {
            if (num > 0) return Math.floor(num);
            return Math.ceil(num);
          }

          function sumArrays(valA, valB) { // assumes valA and valB are arrays with valA.length >= valB.length
            var lenA = valA.length,
              lenB = valB.length,
              resultArr = new Array(lenA),
              overflow = 0,
              currentBase = NUM_BASE,
              total, idx;
            for (idx = 0; idx < lenB; idx++) {
              total = valA[idx] + valB[idx] + overflow;
              overflow = total >= currentBase ? 1 : 0;
              resultArr[idx] = total - overflow * currentBase;
            }
            while (idx < lenA) {
              total = valA[idx] + overflow;
              overflow = total === currentBase ? 1 : 0;
              resultArr[idx++] = total - overflow * currentBase;
            }
            if (overflow > 0) resultArr.push(overflow);
            return resultArr;
          }

          function sumAny(valA, valB) {
            if (valA.length >= valB.length) return sumArrays(valA, valB);
            return sumArrays(valB, valA);
          }

          function sumCompact(valA, overflow) { // assumes valA is array, overflow is number with 0 <= overflow < MAX_SAFE_NUM
            var len = valA.length,
              resultArr = new Array(len),
              currentBase = NUM_BASE,
              total, idx;
            for (idx = 0; idx < len; idx++) {
              total = valA[idx] - currentBase + overflow;
              overflow = Math.floor(total / currentBase);
              resultArr[idx] = total - overflow * currentBase;
              overflow += 1;
            }
            while (overflow > 0) {
              resultArr[idx++] = overflow % currentBase;
              overflow = Math.floor(overflow / currentBase);
            }
            return resultArr;
          }

          LargeInteger.prototype.addOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            if (this.positiveFlag !== parsedOther.positiveFlag) {
              return this.minusOperation(parsedOther.invertSign());
            }
            var valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) {
              return new LargeInteger(sumCompact(valA, Math.abs(valB)), this.positiveFlag);
            }
            return new LargeInteger(sumAny(valA, valB), this.positiveFlag);
          };
          LargeInteger.prototype.plusOperation = LargeInteger.prototype.addOperation;

          CompactInteger.prototype.addOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            var valA = this.numericalValue;
            if (valA < 0 !== parsedOther.positiveFlag) {
              return this.minusOperation(parsedOther.invertSign());
            }
            var valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) {
              if (isExact(valA + valB)) return new CompactInteger(valA + valB);
              valB = compactToArray(Math.abs(valB));
            }
            return new LargeInteger(sumCompact(valB, Math.abs(valA)), valA < 0);
          };
          CompactInteger.prototype.plusOperation = CompactInteger.prototype.addOperation;

          NativeLargeInt.prototype.addOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue + interpretInput(otherNum).numericalValue);
          }
          NativeLargeInt.prototype.plusOperation = NativeLargeInt.prototype.addOperation;

          function differenceArrays(valA, valB) { // assumes valA and valB are arrays with valA >= valB
            var lenX = valA.length,
              lenY = valB.length,
              resArr = new Array(lenX),
              underflow = 0,
              currentBase = NUM_BASE,
              idx, diff;
            for (idx = 0; idx < lenY; idx++) {
              diff = valA[idx] - underflow - valB[idx];
              if (diff < 0) {
                diff += currentBase;
                underflow = 1;
              } else underflow = 0;
              resArr[idx] = diff;
            }
            for (idx = lenY; idx < lenX; idx++) {
              diff = valA[idx] - underflow;
              if (diff < 0) diff += currentBase;
              else {
                resArr[idx++] = diff;
                break;
              }
              resArr[idx] = diff;
            }
            for (; idx < lenX; idx++) {
              resArr[idx] = valA[idx];
            }
            normalizeArray(resArr);
            return resArr;
          }

          function differenceAny(valA, valB, positiveFlag) {
            var resultVal;
            if (compareAbsolute(valA, valB) >= 0) {
              resultVal = differenceArrays(valA, valB);
            } else {
              resultVal = differenceArrays(valB, valA);
              positiveFlag = !positiveFlag;
            }
            resultVal = arrayToCompact(resultVal);
            if (typeof resultVal === "number") {
              if (positiveFlag) resultVal = -resultVal;
              return new CompactInteger(resultVal);
            }
            return new LargeInteger(resultVal, positiveFlag);
          }

          function differenceCompact(valA, valB, positiveFlag) { // assumes valA is array, valB is number with 0 <= valB < MAX_SAFE_NUM
            var len = valA.length,
              resArr = new Array(len),
              underflow = -valB,
              currentBase = NUM_BASE,
              idx, diff;
            for (idx = 0; idx < len; idx++) {
              diff = valA[idx] + underflow;
              underflow = Math.floor(diff / currentBase);
              diff %= currentBase;
              resArr[idx] = diff < 0 ? diff + currentBase : diff;
            }
            resArr = arrayToCompact(resArr);
            if (typeof resArr === "number") {
              if (positiveFlag) resArr = -resArr;
              return new CompactInteger(resArr);
            }
            return new LargeInteger(resArr, positiveFlag);
          }

          LargeInteger.prototype.minusOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            if (this.positiveFlag !== parsedOther.positiveFlag) {
              return this.addOperation(parsedOther.invertSign());
            }
            var valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            if (parsedOther.isCompact)
              return differenceCompact(valA, Math.abs(valB), this.positiveFlag);
            return differenceAny(valA, valB, this.positiveFlag);
          };
          LargeInteger.prototype.subtractOperation = LargeInteger.prototype.minusOperation;

          CompactInteger.prototype.minusOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            var valA = this.numericalValue;
            if (valA < 0 !== parsedOther.positiveFlag) {
              return this.addOperation(parsedOther.invertSign());
            }
            var valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) {
              return new CompactInteger(valA - valB);
            }
            return differenceCompact(valB, Math.abs(valA), valA >= 0);
          };
          CompactInteger.prototype.subtractOperation = CompactInteger.prototype.minusOperation;

          NativeLargeInt.prototype.minusOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue - interpretInput(otherNum).numericalValue);
          }
          NativeLargeInt.prototype.subtractOperation = NativeLargeInt.prototype.minusOperation;

          LargeInteger.prototype.invertSign = function () {
            return new LargeInteger(this.numericalValue, !this.positiveFlag);
          };
          CompactInteger.prototype.invertSign = function () {
            var currentSign = this.positiveFlag;
            var compactResult = new CompactInteger(-this.numericalValue);
            compactResult.positiveFlag = !currentSign;
            return compactResult;
          };
          NativeLargeInt.prototype.invertSign = function () {
            return new NativeLargeInt(-this.numericalValue);
          }

          LargeInteger.prototype.absoluteValue = function () {
            return new LargeInteger(this.numericalValue, false);
          };
          CompactInteger.prototype.absoluteValue = function () {
            return new CompactInteger(Math.abs(this.numericalValue));
          };
          NativeLargeInt.prototype.absoluteValue = function () {
            return new NativeLargeInt(this.numericalValue >= 0 ? this.numericalValue : -this.numericalValue);
          }


          function multiplyExtended(valA, valB) {
            var lenA = valA.length,
              lenB = valB.length,
              totalLen = lenA + lenB,
              resArr = makeArray(totalLen),
              currentBase = NUM_BASE,
              productValue, overflow, idx, valA_idx, valB_idx;
            for (idx = 0; idx < lenA; ++idx) {
              valA_idx = valA[idx];
              for (var j = 0; j < lenB; ++j) {
                valB_idx = valB[j];
                productValue = valA_idx * valB_idx + resArr[idx + j];
                overflow = Math.floor(productValue / currentBase);
                resArr[idx + j] = productValue - overflow * currentBase;
                resArr[idx + j + 1] += overflow;
              }
            }
            normalizeArray(resArr);
            return resArr;
          }

          function multiplyCompact(valA, valB) { // assumes valA is array, valB is number with |valB| < NUM_BASE
            var len = valA.length,
              resArr = new Array(len),
              currentBase = NUM_BASE,
              overflow = 0,
              productValue, idx;
            for (idx = 0; idx < len; idx++) {
              productValue = valA[idx] * valB + overflow;
              overflow = Math.floor(productValue / currentBase);
              resArr[idx] = productValue - overflow * currentBase;
            }
            while (overflow > 0) {
              resArr[idx++] = overflow % currentBase;
              overflow = Math.floor(overflow / currentBase);
            }
            return resArr;
          }

          function bitShiftLeft(arr, count) {
            var shifted = [];
            while (count-- > 0) shifted.push(0);
            return shifted.concat(arr);
          }

          function karatsubaMultiply(valX, valY) {
            var len = Math.max(valX.length, valY.length);

            if (len <= 30) return multiplyExtended(valX, valY);
            len = Math.ceil(len / 2);

            var b_part = valX.slice(len),
              a_part = valX.slice(0, len),
              d_part = valY.slice(len),
              c_part = valY.slice(0, len);

            var ac_prod = karatsubaMultiply(a_part, c_part),
              bd_prod = karatsubaMultiply(b_part, d_part),
              abcd_prod = karatsubaMultiply(sumAny(a_part, b_part), sumAny(c_part, d_part));

            var finalProduct = sumAny(sumAny(ac_prod, bitShiftLeft(differenceArrays(differenceArrays(abcd_prod, ac_prod), bd_prod), len)), bitShiftLeft(bd_prod, 2 * len));
            normalizeArray(finalProduct);
            return finalProduct;
          }

          // The following function is derived from a surface fit of a graph plotting the performance difference
          // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
          function shouldUseKaratsuba(len1, len2) {
            return -0.012 * len1 - 0.012 * len2 + 0.000015 * len1 * len2 > 0;
          }

          LargeInteger.prototype.multiplyOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum),
              valA = this.numericalValue,
              valB = parsedOther.numericalValue,
              resultSign = this.positiveFlag !== parsedOther.positiveFlag,
              absoluteVal;
            if (parsedOther.isCompact) {
              if (valB === 0) return IntNumber[0];
              if (valB === 1) return this;
              if (valB === -1) return this.invertSign();
              absoluteVal = Math.abs(valB);
              if (absoluteVal < NUM_BASE) {
                return new LargeInteger(multiplyCompact(valA, absoluteVal), resultSign);
              }
              valB = compactToArray(absoluteVal);
            }
            if (shouldUseKaratsuba(valA.length, valB.length)) // Karatsuba is only faster for certain array sizes
              return new LargeInteger(karatsubaMultiply(valA, valB), resultSign);
            return new LargeInteger(multiplyExtended(valA, valB), resultSign);
          };

          LargeInteger.prototype.timesOperation = LargeInteger.prototype.multiplyOperation;

          function multiplyCompactAndArray(valA_num, valB_arr, resultSign) { // valA_num >= 0
            if (valA_num < NUM_BASE) {
              return new LargeInteger(multiplyCompact(valB_arr, valA_num), resultSign);
            }
            return new LargeInteger(multiplyExtended(valB_arr, compactToArray(valA_num)), resultSign);
          }
          CompactInteger.prototype._multiplyByCompact = function (otherCompact) {
            if (isExact(otherCompact.numericalValue * this.numericalValue)) {
              return new CompactInteger(otherCompact.numericalValue * this.numericalValue);
            }
            return multiplyCompactAndArray(Math.abs(otherCompact.numericalValue), compactToArray(Math.abs(this.numericalValue)), this.positiveFlag !== otherCompact.positiveFlag);
          };
          LargeInteger.prototype._multiplyByCompact = function (otherCompact) {
            if (otherCompact.numericalValue === 0) return IntNumber[0];
            if (otherCompact.numericalValue === 1) return this;
            if (otherCompact.numericalValue === -1) return this.invertSign();
            return multiplyCompactAndArray(Math.abs(otherCompact.numericalValue), this.numericalValue, this.positiveFlag !== otherCompact.positiveFlag);
          };
          CompactInteger.prototype.multiplyOperation = function (otherNum) {
            return interpretInput(otherNum)._multiplyByCompact(this);
          };
          CompactInteger.prototype.timesOperation = CompactInteger.prototype.multiplyOperation;

          NativeLargeInt.prototype.multiplyOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue * interpretInput(otherNum).numericalValue);
          }
          NativeLargeInt.prototype.timesOperation = NativeLargeInt.prototype.multiplyOperation;

          function calculateSquare(valArray) {
            //console.assert(2 * NUM_BASE * NUM_BASE < MAX_SAFE_NUM);
            var len = valArray.length,
              resArr = makeArray(len + len),
              currentBase = NUM_BASE,
              productValue, overflow, idx, valA_idx, valA_jdx;
            for (idx = 0; idx < len; idx++) {
              valA_idx = valArray[idx];
              overflow = 0 - valA_idx * valA_idx;
              for (var jdx = idx; jdx < len; jdx++) {
                valA_jdx = valArray[jdx];
                productValue = 2 * (valA_idx * valA_jdx) + resArr[idx + jdx] + overflow;
                overflow = Math.floor(productValue / currentBase);
                resArr[idx + jdx] = productValue - overflow * currentBase;
              }
              resArr[idx + len] = overflow;
            }
            normalizeArray(resArr);
            return resArr;
          }

          LargeInteger.prototype.squareOperation = function () {
            return new LargeInteger(calculateSquare(this.numericalValue), false);
          };

          CompactInteger.prototype.squareOperation = function () {
            var resultValue = this.numericalValue * this.numericalValue;
            if (isExact(resultValue)) return new CompactInteger(resultValue);
            return new LargeInteger(calculateSquare(compactToArray(Math.abs(this.numericalValue))), false);
          };

          NativeLargeInt.prototype.squareOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue * this.numericalValue);
          }

          function divisionRemainderAlgo1(valA, valB) { // Left over from previous version. Performs faster than divisionRemainderAlgo2 on smaller input sizes.
            var lenA = valA.length,
              lenB = valB.length,
              currentBase = NUM_BASE,
              resultArr = makeArray(valB.length),
              divisorHighDigit = valB[lenB - 1],
              // normalization
              lambdaFactor = Math.ceil(currentBase / (2 * divisorHighDigit)),
              remainderArr = multiplyCompact(valA, lambdaFactor),
              divisorArr = multiplyCompact(valB, lambdaFactor),
              quotientDigit, bitShift, overflow, underflow, idx, len, quotientVal;
            if (remainderArr.length <= lenA) remainderArr.push(0);
            divisorArr.push(0);
            divisorHighDigit = divisorArr[lenB - 1];
            for (bitShift = lenA - lenB; bitShift >= 0; bitShift--) {
              quotientDigit = currentBase - 1;
              if (remainderArr[bitShift + lenB] !== divisorHighDigit) {
                quotientDigit = Math.floor((remainderArr[bitShift + lenB] * currentBase + remainderArr[bitShift + lenB - 1]) / divisorHighDigit);
              }
              // quotientDigit <= currentBase - 1
              overflow = 0;
              underflow = 0;
              len = divisorArr.length;
              for (idx = 0; idx < len; idx++) {
                overflow += quotientDigit * divisorArr[idx];
                quotientVal = Math.floor(overflow / currentBase);
                underflow += remainderArr[bitShift + idx] - (overflow - quotientVal * currentBase);
                overflow = quotientVal;
                if (underflow < 0) {
                  remainderArr[bitShift + idx] = underflow + currentBase;
                  underflow = -1;
                } else {
                  remainderArr[bitShift + idx] = underflow;
                  underflow = 0;
                }
              }
              while (underflow !== 0) {
                quotientDigit -= 1;
                overflow = 0;
                for (idx = 0; idx < len; idx++) {
                  overflow += remainderArr[bitShift + idx] - currentBase + divisorArr[idx];
                  if (overflow < 0) {
                    remainderArr[bitShift + idx] = overflow + currentBase;
                    overflow = 0;
                  } else {
                    remainderArr[bitShift + idx] = overflow;
                    overflow = 1;
                  }
                }
                underflow += overflow;
              }
              resultArr[bitShift] = quotientDigit;
            }
            // denormalization
            remainderArr = divisionRemainderCompact(remainderArr, lambdaFactor)[0];
            return [arrayToCompact(resultArr), arrayToCompact(remainderArr)];
          }

          function divisionRemainderAlgo2(valA, valB) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
            // Performs faster than divisionRemainderAlgo1 on larger input sizes.
            var lenA = valA.length,
              lenB = valB.length,
              resArr = [],
              partArr = [],
              currentBase = NUM_BASE,
              estimate, xLength, highX, highY, checkVal;
            while (lenA) {
              partArr.unshift(valA[--lenA]);
              normalizeArray(partArr);
              if (compareAbsolute(partArr, valB) < 0) {
                resArr.push(0);
                continue;
              }
              xLength = partArr.length;
              highX = partArr[xLength - 1] * currentBase + partArr[xLength - 2];
              highY = valB[lenB - 1] * currentBase + valB[lenB - 2];
              if (xLength > lenB) {
                highX = (highX + 1) * currentBase;
              }
              estimate = Math.ceil(highX / highY);
              do {
                checkVal = multiplyCompact(valB, estimate);
                if (compareAbsolute(checkVal, partArr) <= 0) break;
                estimate--;
              } while (estimate);
              resArr.push(estimate);
              partArr = differenceArrays(partArr, checkVal);
            }
            resArr.reverse();
            return [arrayToCompact(resArr), arrayToCompact(partArr)];
          }

          function divisionRemainderCompact(valArray, lambdaFactor) {
            var len = valArray.length,
              quotientArr = makeArray(len),
              currentBase = NUM_BASE,
              idx, qVal, remainderVal, divisorVal;
            remainderVal = 0;
            for (idx = len - 1; idx >= 0; --idx) {
              divisorVal = remainderVal * currentBase + valArray[idx];
              qVal = floorOrCeil(divisorVal / lambdaFactor);
              remainderVal = divisorVal - qVal * lambdaFactor;
              quotientArr[idx] = qVal | 0;
            }
            return [quotientArr, remainderVal | 0];
          }

          function divisionRemainderGeneral(currentNum, otherNum) {
            var resultVal, parsedOther = interpretInput(otherNum);
            if (hasNativeBigIntSupport) {
              return [new NativeLargeInt(currentNum.numericalValue / parsedOther.numericalValue), new NativeLargeInt(currentNum.numericalValue % parsedOther.numericalValue)];
            }
            var valA = currentNum.numericalValue,
              valB = parsedOther.numericalValue;
            var quotientResult;
            if (valB === 0) throw new Error("Cannot divide by zero");
            if (currentNum.isCompact) {
              if (parsedOther.isCompact) {
                return [new CompactInteger(floorOrCeil(valA / valB)), new CompactInteger(valA % valB)];
              }
              return [IntNumber[0], currentNum];
            }
            if (parsedOther.isCompact) {
              if (valB === 1) return [currentNum, IntNumber[0]];
              if (valB == -1) return [currentNum.invertSign(), IntNumber[0]];
              var absoluteB = Math.abs(valB);
              if (absoluteB < NUM_BASE) {
                resultVal = divisionRemainderCompact(valA, absoluteB);
                quotientResult = arrayToCompact(resultVal[0]);
                var remainderResult = resultVal[1];
                if (currentNum.positiveFlag) remainderResult = -remainderResult;
                if (typeof quotientResult === "number") {
                  if (currentNum.positiveFlag !== parsedOther.positiveFlag) quotientResult = -quotientResult;
                  return [new CompactInteger(quotientResult), new CompactInteger(remainderResult)];
                }
                return [new LargeInteger(quotientResult, currentNum.positiveFlag !== parsedOther.positiveFlag), new CompactInteger(remainderResult)];
              }
              valB = compactToArray(absoluteB);
            }
            var comparisonResult = compareAbsolute(valA, valB);
            if (comparisonResult === -1) return [IntNumber[0], currentNum];
            if (comparisonResult === 0) return [IntNumber[currentNum.positiveFlag === parsedOther.positiveFlag ? 1 : -1], IntNumber[0]];

            // divisionRemainderAlgo1 is faster on smaller input sizes
            if (valA.length + valB.length <= 200)
              resultVal = divisionRemainderAlgo1(valA, valB);
            else resultVal = divisionRemainderAlgo2(valA, valB);

            quotientResult = resultVal[0];
            var quotientSign = currentNum.positiveFlag !== parsedOther.positiveFlag,
              modResult = resultVal[1],
              modSign = currentNum.positiveFlag;
            if (typeof quotientResult === "number") {
              if (quotientSign) quotientResult = -quotientResult;
              quotientResult = new CompactInteger(quotientResult);
            } else quotientResult = new LargeInteger(quotientResult, quotientSign);
            if (typeof modResult === "number") {
              if (modSign) modResult = -modResult;
              modResult = new CompactInteger(modResult);
            } else modResult = new LargeInteger(modResult, modSign);
            return [quotientResult, modResult];
          }

          LargeInteger.prototype.divisionAndModulo = function (otherNum) {
            var result = divisionRemainderGeneral(this, otherNum);
            return {
              quotient: result[0],
              remainder: result[1]
            };
          };
          NativeLargeInt.prototype.divisionAndModulo = CompactInteger.prototype.divisionAndModulo = LargeInteger.prototype.divisionAndModulo;


          LargeInteger.prototype.divideOperation = function (otherNum) {
            return divisionRemainderGeneral(this, otherNum)[0];
          };
          NativeLargeInt.prototype.divisionOperator = NativeLargeInt.prototype.divideOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue / interpretInput(otherNum).numericalValue);
          };
          CompactInteger.prototype.divisionOperator = CompactInteger.prototype.divideOperation = LargeInteger.prototype.divisionOperator = LargeInteger.prototype.divideOperation;

          LargeInteger.prototype.moduloOperation = function (otherNum) {
            return divisionRemainderGeneral(this, otherNum)[1];
          };
          NativeLargeInt.prototype.moduloOperation = NativeLargeInt.prototype.remainderOperation = function (otherNum) {
            return new NativeLargeInt(this.numericalValue % interpretInput(otherNum).numericalValue);
          };
          CompactInteger.prototype.remainderOperation = CompactInteger.prototype.moduloOperation = LargeInteger.prototype.remainderOperation = LargeInteger.prototype.moduloOperation;

          LargeInteger.prototype.powerOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum),
              valA = this.numericalValue,
              valB = parsedOther.numericalValue,
              resultValue, currentX, currentY;
            if (valB === 0) return IntNumber[1];
            if (valA === 0) return IntNumber[0];
            if (valA === 1) return IntNumber[1];
            if (valA === -1) return parsedOther.isDivisibleByTwo() ? IntNumber[1] : IntNumber[-1];
            if (parsedOther.positiveFlag) {
              return IntNumber[0];
            }
            if (!parsedOther.isCompact) throw new Error("The exponent " + parsedOther.toTextString() + " is too large.");
            if (this.isCompact) {
              if (isExact(resultValue = Math.pow(valA, valB)))
                return new CompactInteger(floorOrCeil(resultValue));
            }
            currentX = this;
            currentY = IntNumber[1];
            while (true) {
              if ((valB & 1) === 1) {
                currentY = currentY.timesOperation(currentX);
                --valB;
              }
              if (valB === 0) break;
              valB /= 2;
              currentX = currentX.squareOperation();
            }
            return currentY;
          };
          CompactInteger.prototype.powerOperation = LargeInteger.prototype.powerOperation;

          NativeLargeInt.prototype.powerOperation = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            var valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            var _zero = BigInt(0),
              _one = BigInt(1),
              _two = BigInt(2);
            if (valB === _zero) return IntNumber[1];
            if (valA === _zero) return IntNumber[0];
            if (valA === _one) return IntNumber[1];
            if (valA === BigInt(-1)) return parsedOther.isDivisibleByTwo() ? IntNumber[1] : IntNumber[-1];
            if (parsedOther.isStrictlyNegative()) return new NativeLargeInt(_zero);
            var currentX = this;
            var currentY = IntNumber[1];
            while (true) {
              if ((valB & _one) === _one) {
                currentY = currentY.timesOperation(currentX);
                --valB;
              }
              if (valB === _zero) break;
              valB /= _two;
              currentX = currentX.squareOperation();
            }
            return currentY;
          }

          LargeInteger.prototype.modularPower = function (exponent, modulus) {
            exponent = interpretInput(exponent);
            modulus = interpretInput(modulus);
            if (modulus.isZeroValue()) throw new Error("Cannot take modularPower with modulus 0");
            var result = IntNumber[1],
              baseVal = this.moduloOperation(modulus);
            if (exponent.isStrictlyNegative()) {
              exponent = exponent.multiplyOperation(IntNumber[-1]);
              baseVal = baseVal.modularInverse(modulus);
            }
            while (exponent.isStrictlyPositive()) {
              if (baseVal.isZeroValue()) return IntNumber[0];
              if (exponent.isNotDivisibleByTwo()) result = result.multiplyOperation(baseVal).moduloOperation(modulus);
              exponent = exponent.divideOperation(2);
              baseVal = baseVal.squareOperation().moduloOperation(modulus);
            }
            return result;
          };
          NativeLargeInt.prototype.modularPower = CompactInteger.prototype.modularPower = LargeInteger.prototype.modularPower;

          function compareAbsolute(valA, valB) {
            if (valA.length !== valB.length) {
              return valA.length > valB.length ? 1 : -1;
            }
            for (var idx = valA.length - 1; idx >= 0; idx--) {
              if (valA[idx] !== valB[idx]) return valA[idx] > valB[idx] ? 1 : -1;
            }
            return 0;
          }

          LargeInteger.prototype.compareAbsoluteValue = function (otherNum) {
            var parsedOther = interpretInput(otherNum),
              valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) return 1;
            return compareAbsolute(valA, valB);
          };
          CompactInteger.prototype.compareAbsoluteValue = function (otherNum) {
            var parsedOther = interpretInput(otherNum),
              valA = Math.abs(this.numericalValue),
              valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) {
              valB = Math.abs(valB);
              return valA === valB ? 0 : valA > valB ? 1 : -1;
            }
            return -1;
          };
          NativeLargeInt.prototype.compareAbsoluteValue = function (otherNum) {
            var valA = this.numericalValue;
            var valB = interpretInput(otherNum).numericalValue;
            valA = valA >= 0 ? valA : -valA;
            valB = valB >= 0 ? valB : -valB;
            return valA === valB ? 0 : valA > valB ? 1 : -1;
          }

          LargeInteger.prototype.comparison = function (otherNum) {
            // See discussion about comparison with Infinity:
            // https://github.com/peterolson/BigInteger.js/issues/61
            if (otherNum === Infinity) {
              return -1;
            }
            if (otherNum === -Infinity) {
              return 1;
            }

            var parsedOther = interpretInput(otherNum),
              valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            if (this.positiveFlag !== parsedOther.positiveFlag) {
              return parsedOther.positiveFlag ? 1 : -1;
            }
            if (parsedOther.isCompact) {
              return this.positiveFlag ? -1 : 1;
            }
            return compareAbsolute(valA, valB) * (this.positiveFlag ? -1 : 1);
          };
          LargeInteger.prototype.compareWith = LargeInteger.prototype.comparison;

          CompactInteger.prototype.comparison = function (otherNum) {
            if (otherNum === Infinity) {
              return -1;
            }
            if (otherNum === -Infinity) {
              return 1;
            }

            var parsedOther = interpretInput(otherNum),
              valA = this.numericalValue,
              valB = parsedOther.numericalValue;
            if (parsedOther.isCompact) {
              return valA == valB ? 0 : valA > valB ? 1 : -1;
            }
            if (valA < 0 !== parsedOther.positiveFlag) {
              return valA < 0 ? -1 : 1;
            }
            return valA < 0 ? 1 : -1;
          };
          CompactInteger.prototype.compareWith = CompactInteger.prototype.comparison;

          NativeLargeInt.prototype.comparison = function (otherNum) {
            if (otherNum === Infinity) {
              return -1;
            }
            if (otherNum === -Infinity) {
              return 1;
            }
            var valA = this.numericalValue;
            var valB = interpretInput(otherNum).numericalValue;
            return valA === valB ? 0 : valA > valB ? 1 : -1;
          }
          NativeLargeInt.prototype.compareWith = NativeLargeInt.prototype.comparison;

          LargeInteger.prototype.isEqualTo = function (otherNum) {
            return this.comparison(otherNum) === 0;
          };
          NativeLargeInt.prototype.isEquivalent = NativeLargeInt.prototype.isEqualTo = CompactInteger.prototype.isEquivalent = CompactInteger.prototype.isEqualTo = LargeInteger.prototype.isEquivalent = LargeInteger.prototype.isEqualTo;

          LargeInteger.prototype.isNotEqualTo = function (otherNum) {
            return this.comparison(otherNum) !== 0;
          };
          NativeLargeInt.prototype.notEquivalent = NativeLargeInt.prototype.isNotEqualTo = CompactInteger.prototype.notEquivalent = CompactInteger.prototype.isNotEqualTo = LargeInteger.prototype.notEquivalent = LargeInteger.prototype.isNotEqualTo;

          LargeInteger.prototype.isGreater = function (otherNum) {
            return this.comparison(otherNum) > 0;
          };
          NativeLargeInt.prototype.greaterThan = NativeLargeInt.prototype.isGreater = CompactInteger.prototype.greaterThan = CompactInteger.prototype.isGreater = LargeInteger.prototype.greaterThan = LargeInteger.prototype.isGreater;

          LargeInteger.prototype.isLesser = function (otherNum) {
            return this.comparison(otherNum) < 0;
          };
          NativeLargeInt.prototype.lessThan = NativeLargeInt.prototype.isLesser = CompactInteger.prototype.lessThan = CompactInteger.prototype.isLesser = LargeInteger.prototype.lessThan = LargeInteger.prototype.isLesser;

          LargeInteger.prototype.isGreaterOrEqual = function (otherNum) {
            return this.comparison(otherNum) >= 0;
          };
          NativeLargeInt.prototype.greaterOrEqual = NativeLargeInt.prototype.isGreaterOrEqual = CompactInteger.prototype.greaterOrEqual = CompactInteger.prototype.isGreaterOrEqual = LargeInteger.prototype.greaterOrEqual = LargeInteger.prototype.isGreaterOrEqual;

          LargeInteger.prototype.isLesserOrEqual = function (otherNum) {
            return this.comparison(otherNum) <= 0;
          };
          NativeLargeInt.prototype.lesserOrEqual = NativeLargeInt.prototype.isLesserOrEqual = CompactInteger.prototype.lesserOrEqual = CompactInteger.prototype.isLesserOrEqual = LargeInteger.prototype.lesserOrEqual = LargeInteger.prototype.isLesserOrEqual;

          LargeInteger.prototype.isDivisibleByTwo = function () {
            return (this.numericalValue[0] & 1) === 0;
          };
          CompactInteger.prototype.isDivisibleByTwo = function () {
            return (this.numericalValue & 1) === 0;
          };
          NativeLargeInt.prototype.isDivisibleByTwo = function () {
            return (this.numericalValue & BigInt(1)) === BigInt(0);
          }

          LargeInteger.prototype.isNotDivisibleByTwo = function () {
            return (this.numericalValue[0] & 1) === 1;
          };
          CompactInteger.prototype.isNotDivisibleByTwo = function () {
            return (this.numericalValue & 1) === 1;
          };
          NativeLargeInt.prototype.isNotDivisibleByTwo = function () {
            return (this.numericalValue & BigInt(1)) === BigInt(1);
          }

          LargeInteger.prototype.isStrictlyPositive = function () {
            return !this.positiveFlag;
          };
          CompactInteger.prototype.isStrictlyPositive = function () {
            return this.numericalValue > 0;
          };
          NativeLargeInt.prototype.isStrictlyPositive = CompactInteger.prototype.isStrictlyPositive;

          LargeInteger.prototype.isStrictlyNegative = function () {
            return this.positiveFlag;
          };
          CompactInteger.prototype.isStrictlyNegative = function () {
            return this.numericalValue < 0;
          };
          NativeLargeInt.prototype.isStrictlyNegative = CompactInteger.prototype.isStrictlyNegative;

          LargeInteger.prototype.isOneOrMinusOne = function () {
            return false;
          };
          CompactInteger.prototype.isOneOrMinusOne = function () {
            return Math.abs(this.numericalValue) === 1;
          };
          NativeLargeInt.prototype.isOneOrMinusOne = function () {
            return this.absoluteValue().numericalValue === BigInt(1);
          }

          LargeInteger.prototype.isZeroValue = function () {
            return false;
          };
          CompactInteger.prototype.isZeroValue = function () {
            return this.numericalValue === 0;
          };
          NativeLargeInt.prototype.isZeroValue = function () {
            return this.numericalValue === BigInt(0);
          }

          LargeInteger.prototype.canBeDividedBy = function (otherNum) {
            var parsedOther = interpretInput(otherNum);
            if (parsedOther.isZeroValue()) return false;
            if (parsedOther.isOneOrMinusOne()) return true;
            if (parsedOther.compareAbsoluteValue(2) === 0) return this.isDivisibleByTwo();
            return this.moduloOperation(parsedOther).isZeroValue();
          };
          NativeLargeInt.prototype.canBeDividedBy = CompactInteger.prototype.canBeDividedBy = LargeInteger.prototype.canBeDividedBy;

          function isSimplePrime(num) {
            var absNum = num.absoluteValue();
            if (absNum.isOneOrMinusOne()) return false;
            if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
            if (absNum.isDivisibleByTwo() || absNum.canBeDividedBy(3) || absNum.canBeDividedBy(5)) return false;
            if (absNum.isLesser(49)) return true;
            // we don't know if it's prime: let the other functions figure it out
          }

          function primalityTestMR(num, testValues) {
            var numMinusOne = num.decrement(),
              currentB = numMinusOne,
              powerCount = 0,
              d_val, t_val, idx, x_val;
            while (currentB.isDivisibleByTwo()) currentB = currentB.divideOperation(2), powerCount++;
            nextTest: for (idx = 0; idx < testValues.length; idx++) {
              if (num.isLesser(testValues[idx])) continue;
              x_val = largeNumber(testValues[idx]).modularPower(currentB, num);
              if (x_val.isOneOrMinusOne() || x_val.isEqualTo(numMinusOne)) continue;
              for (d_val = powerCount - 1; d_val != 0; d_val--) {
                x_val = x_val.squareOperation().moduloOperation(num);
                if (x_val.isOneOrMinusOne()) return false;
                if (x_val.isEqualTo(numMinusOne)) continue nextTest;
              }
              return false;
            }
            return true;
          }

          // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
          LargeInteger.prototype.checkPrime = function (strictFlag) {
            var primeStatus = isSimplePrime(this);
            if (primeStatus !== noValue) return primeStatus;
            var num = this.absoluteValue();
            var bitCount = num.getBitLength();
            if (bitCount.isLesserOrEqual(64))
              return primalityTestMR(num, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
            var logN = Math.log(2) * bitCount.toNativeNumber();
            var testIterations = Math.ceil((strictFlag === true) ? (2 * Math.pow(logN, 2)) : logN);
            for (var arr = [], idx = 0; idx < testIterations; idx++) {
              arr.push(largeNumber(idx + 2));
            }
            return primalityTestMR(num, arr);
          };
          NativeLargeInt.prototype.checkPrime = CompactInteger.prototype.checkPrime = LargeInteger.prototype.checkPrime;

          LargeInteger.prototype.checkProbablePrime = function (iterations, randomGen) {
            var primeStatus = isSimplePrime(this);
            if (primeStatus !== noValue) return primeStatus;
            var num = this.absoluteValue();
            var testIterations = iterations === noValue ? 5 : iterations;
            for (var arr = [], idx = 0; idx < testIterations; idx++) {
              arr.push(largeNumber.randomValueBetween(2, num.minusOperation(2), randomGen));
            }
            return primalityTestMR(num, arr);
          };
          NativeLargeInt.prototype.checkProbablePrime = CompactInteger.prototype.checkProbablePrime = LargeInteger.prototype.checkProbablePrime;

          LargeInteger.prototype.modularInverse = function (modNum) {
            var t_val = largeNumber.nullValue,
              newT_val = largeNumber.unity,
              r_val = interpretInput(modNum),
              newR_val = this.absoluteValue(),
              q_val, lastT_val, lastR_val;
            while (!newR_val.isZeroValue()) {
              q_val = r_val.divideOperation(newR_val);
              lastT_val = t_val;
              lastR_val = r_val;
              t_val = newT_val;
              r_val = newR_val;
              newT_val = lastT_val.minusOperation(q_val.multiplyOperation(newT_val));
              newR_val = lastR_val.minusOperation(q_val.multiplyOperation(newR_val));
            }
            if (!r_val.isOneOrMinusOne()) throw new Error(this.toTextString() + " and " + modNum.toTextString() + " are not co-prime");
            if (t_val.comparison(0) === -1) {
              t_val = t_val.addOperation(modNum);
            }
            if (this.isStrictlyNegative()) {
              return t_val.invertSign();
            }
            return t_val;
          };

          NativeLargeInt.prototype.modularInverse = CompactInteger.prototype.modularInverse = LargeInteger.prototype.modularInverse;

          LargeInteger.prototype.increment = function () {
            var currentVal = this.numericalValue;
            if (this.positiveFlag) {
              return differenceCompact(currentVal, 1, this.positiveFlag);
            }
            return new LargeInteger(sumCompact(currentVal, 1), this.positiveFlag);
          };
          CompactInteger.prototype.increment = function () {
            var currentVal = this.numericalValue;
            if (currentVal + 1 < MAX_SAFE_NUM) return new CompactInteger(currentVal + 1);
            return new LargeInteger(MAX_SAFE_NUM_ARRAY, false);
          };
          NativeLargeInt.prototype.increment = function () {
            return new NativeLargeInt(this.numericalValue + BigInt(1));
          }

          LargeInteger.prototype.decrement = function () {
            var currentVal = this.numericalValue;
            if (this.positiveFlag) {
              return new LargeInteger(sumCompact(currentVal, 1), true);
            }
            return differenceCompact(currentVal, 1, this.positiveFlag);
          };
          CompactInteger.prototype.decrement = function () {
            var currentVal = this.numericalValue;
            if (currentVal - 1 > -MAX_SAFE_NUM) return new CompactInteger(currentVal - 1);
            return new LargeInteger(MAX_SAFE_NUM_ARRAY, true);
          };
          NativeLargeInt.prototype.decrement = function () {
            return new NativeLargeInt(this.numericalValue - BigInt(1));
          }

          var twoPowers = [1];
          while (2 * twoPowers[twoPowers.length - 1] <= NUM_BASE) twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
          var twoPowersCount = twoPowers.length,
            maxTwoPower = twoPowers[twoPowersCount - 1];

          function isShiftAmountCompact(shiftAmount) {
            return Math.abs(shiftAmount) <= NUM_BASE;
          }

          LargeInteger.prototype.leftBitShift = function (shiftAmount) {
            var parsedShift = interpretInput(shiftAmount).toNativeNumber();
            if (!isShiftAmountCompact(parsedShift)) {
              throw new Error(String(parsedShift) + " is too large for shifting.");
            }
            if (parsedShift < 0) return this.rightBitShift(-parsedShift);
            var currentResult = this;
            if (currentResult.isZeroValue()) return currentResult;
            while (parsedShift >= twoPowersCount) {
              currentResult = currentResult.multiplyOperation(maxTwoPower);
              parsedShift -= twoPowersCount - 1;
            }
            return currentResult.multiplyOperation(twoPowers[parsedShift]);
          };
          NativeLargeInt.prototype.leftBitShift = CompactInteger.prototype.leftBitShift = LargeInteger.prototype.leftBitShift;

          LargeInteger.prototype.rightBitShift = function (shiftAmount) {
            var remainderQuotient;
            var parsedShift = interpretInput(shiftAmount).toNativeNumber();
            if (!isShiftAmountCompact(parsedShift)) {
              throw new Error(String(parsedShift) + " is too large for shifting.");
            }
            if (parsedShift < 0) return this.leftBitShift(-parsedShift);
            var currentResult = this;
            while (parsedShift >= twoPowersCount) {
              if (currentResult.isZeroValue() || (currentResult.isStrictlyNegative() && currentResult.isOneOrMinusOne())) return currentResult;
              remainderQuotient = divisionRemainderGeneral(currentResult, maxTwoPower);
              currentResult = remainderQuotient[1].isStrictlyNegative() ? remainderQuotient[0].decrement() : remainderQuotient[0];
              parsedShift -= twoPowersCount - 1;
            }
            remainderQuotient = divisionRemainderGeneral(currentResult, twoPowers[parsedShift]);
            return remainderQuotient[1].isStrictlyNegative() ? remainderQuotient[0].decrement() : remainderQuotient[0];
          };
          NativeLargeInt.prototype.rightBitShift = CompactInteger.prototype.rightBitShift = LargeInteger.prototype.rightBitShift;

          function performBitwise(numX, numY, operationFn) {
            numY = interpretInput(numY);
            var xNegative = numX.isStrictlyNegative(),
              yNegative = numY.isStrictlyNegative();
            var xRemaining = xNegative ? numX.bitwiseNot() : numX,
              yRemaining = yNegative ? numY.bitwiseNot() : numY;
            var xDigit = 0,
              yDigit = 0;
            var xDivModResult = null,
              yDivModResult = null;
            var finalResult = [];
            while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
              xDivModResult = divisionRemainderGeneral(xRemaining, maxTwoPower);
              xDigit = xDivModResult[1].toNativeNumber();
              if (xNegative) {
                xDigit = maxTwoPower - 1 - xDigit; // two's complement for negative numbers
              }

              yDivModResult = divisionRemainderGeneral(yRemaining, maxTwoPower);
              yDigit = yDivModResult[1].toNativeNumber();
              if (yNegative) {
                yDigit = maxTwoPower - 1 - yDigit; // two's complement for negative numbers
              }

              xRemaining = xDivModResult[0];
              yRemaining = yDivModResult[0];
              finalResult.push(operationFn(xDigit, yDigit));
            }
            var sumVal = operationFn(xNegative ? 1 : 0, yNegative ? 1 : 0) !== 0 ? largeNumber(-1) : largeNumber(0);
            for (var idx = finalResult.length - 1; idx >= 0; idx -= 1) {
              sumVal = sumVal.multiplyOperation(maxTwoPower).addOperation(largeNumber(finalResult[idx]));
            }
            return sumVal;
          }

          LargeInteger.prototype.bitwiseNot = function () {
            return this.invertSign().decrement();
          };
          NativeLargeInt.prototype.bitwiseNot = CompactInteger.prototype.bitwiseNot = LargeInteger.prototype.bitwiseNot;

          LargeInteger.prototype.bitwiseAnd = function (otherNum) {
            return performBitwise(this, otherNum, function (valA, valB) {
              return valA & valB;
            });
          };
          NativeLargeInt.prototype.bitwiseAnd = CompactInteger.prototype.bitwiseAnd = LargeInteger.prototype.bitwiseAnd;

          LargeInteger.prototype.bitwiseOr = function (otherNum) {
            return performBitwise(this, otherNum, function (valA, valB) {
              return valA | valB;
            });
          };
          NativeLargeInt.prototype.bitwiseOr = CompactInteger.prototype.bitwiseOr = LargeInteger.prototype.bitwiseOr;

          LargeInteger.prototype.bitwiseXor = function (otherNum) {
            return performBitwise(this, otherNum, function (valA, valB) {
              return valA ^ valB;
            });
          };
          NativeLargeInt.prototype.bitwiseXor = CompactInteger.prototype.bitwiseXor = LargeInteger.prototype.bitwiseXor;

          var LOWEST_BIT_MASK_INT = 1 << 30,
            LOWEST_BIT_MASK_BIGINT = (NUM_BASE & -NUM_BASE) * (NUM_BASE & -NUM_BASE) | LOWEST_BIT_MASK_INT;

          function getApproxLowestBit(num) { // get lowestOneBit (rough)
            // CompactInteger: return Min(lowestOneBit(num), 1 << 30)
            // LargeInteger: return Min(lowestOneBit(num), 1 << 14) [NUM_BASE=1e7]
            var currentVal = num.numericalValue,
              x_val = typeof currentVal === "number" ? currentVal | LOWEST_BIT_MASK_INT :
              typeof currentVal === "bigint" ? currentVal | BigInt(LOWEST_BIT_MASK_INT) :
              currentVal[0] + currentVal[1] * NUM_BASE | LOWEST_BIT_MASK_BIGINT;
            return x_val & -x_val;
          }

          function calcIntegerLog(currentVal, baseVal) {
            if (baseVal.comparison(currentVal) <= 0) {
              var tempResult = calcIntegerLog(currentVal, baseVal.squareOperation(baseVal));
              var p_val = tempResult.p,
                e_val = tempResult.e;
              var t_val = p_val.multiplyOperation(baseVal);
              return t_val.comparison(currentVal) <= 0 ? {
                p: t_val,
                e: e_val * 2 + 1
              } : {
                p: p_val,
                e: e_val * 2
              };
            }
            return {
              p: largeNumber(1),
              e: 0
            };
          }

          LargeInteger.prototype.getBitLength = function () {
            var num = this;
            if (num.comparison(largeNumber(0)) < 0) {
              num = num.invertSign().minusOperation(largeNumber(1));
            }
            if (num.comparison(largeNumber(0)) === 0) {
              return largeNumber(0);
            }
            return largeNumber(calcIntegerLog(num, largeNumber(2)).e).addOperation(largeNumber(1));
          }
          NativeLargeInt.prototype.getBitLength = CompactInteger.prototype.getBitLength = LargeInteger.prototype.getBitLength;

          function findMaximum(valA, valB) {
            valA = interpretInput(valA);
            valB = interpretInput(valB);
            return valA.isGreater(valB) ? valA : valB;
          }

          function findMinimum(valA, valB) {
            valA = interpretInput(valA);
            valB = interpretInput(valB);
            return valA.isLesser(valB) ? valA : valB;
          }

          function greatestCommonDivisor(valA, valB) {
            valA = interpretInput(valA).absoluteValue();
            valB = interpretInput(valB).absoluteValue();
            if (valA.isEqualTo(valB)) return valA;
            if (valA.isZeroValue()) return valB;
            if (valB.isZeroValue()) return valA;
            var commonFactor = IntNumber[1],
              divisor, tempVal;
            while (valA.isDivisibleByTwo() && valB.isDivisibleByTwo()) {
              divisor = findMinimum(getApproxLowestBit(valA), getApproxLowestBit(valB));
              valA = valA.divideOperation(divisor);
              valB = valB.divideOperation(divisor);
              commonFactor = commonFactor.multiplyOperation(divisor);
            }
            while (valA.isDivisibleByTwo()) {
              valA = valA.divideOperation(getApproxLowestBit(valA));
            }
            do {
              while (valB.isDivisibleByTwo()) {
                valB = valB.divideOperation(getApproxLowestBit(valB));
              }
              if (valA.isGreater(valB)) {
                tempVal = valB;
                valB = valA;
                valA = tempVal;
              }
              valB = valB.minusOperation(valA);
            } while (!valB.isZeroValue());
            return commonFactor.isOneOrMinusOne() ? valA : valA.multiplyOperation(commonFactor);
          }

          function leastCommonMultiple(valA, valB) {
            valA = interpretInput(valA).absoluteValue();
            valB = interpretInput(valB).absoluteValue();
            return valA.divideOperation(greatestCommonDivisor(valA, valB)).multiplyOperation(valB);
          }

          function randomBetween(valA, valB, randomGen) {
            valA = interpretInput(valA);
            valB = interpretInput(valB);
            var usedRNG = randomGen || Math.random;
            var lowerBound = findMinimum(valA, valB),
              upperBound = findMaximum(valA, valB);
            var valueRange = upperBound.minusOperation(lowerBound).addOperation(1);
            if (valueRange.isCompact) return lowerBound.addOperation(Math.floor(usedRNG() * valueRange));
            var digitArr = convertToBase(valueRange, NUM_BASE).numericalValue;
            var resultArr = [],
              isRestricted = true;
            for (var idx = 0; idx < digitArr.length; idx++) {
              var topLimit = isRestricted ? digitArr[idx] : NUM_BASE;
              var digit = floorOrCeil(usedRNG() * topLimit);
              resultArr.push(digit);
              if (digit < topLimit) isRestricted = false;
            }
            return lowerBound.addOperation(IntNumber.fromDigitArray(resultArr, NUM_BASE, false));
          }

          var parseFromBase = function (textInput, baseVal, charSet, caseSensFlag) {
            charSet = charSet || STANDARD_ALPHA;
            textInput = String(textInput);
            if (!caseSensFlag) {
              textInput = textInput.toLowerCase();
              charSet = charSet.toLowerCase();
            }
            var textLength = textInput.length;
            var idx;
            var absoluteBase = Math.abs(baseVal);
            var charValues = {};
            for (idx = 0; idx < charSet.length; idx++) {
              charValues[charSet[idx]] = idx;
            }
            for (idx = 0; idx < textLength; idx++) {
              var char = textInput[idx];
              if (char === "-") continue;
              if (char in charValues) {
                if (charValues[char] >= absoluteBase) {
                  if (char === "1" && absoluteBase === 1) continue;
                  throw new Error(char + " is not a valid digit in base " + baseVal + ".");
                }
              }
            }
            baseVal = interpretInput(baseVal);
            var digitsArray = [];
            var isNegativeNum = textInput[0] === "-";
            for (idx = isNegativeNum ? 1 : 0; idx < textInput.length; idx++) {
              var char = textInput[idx];
              if (char in charValues) digitsArray.push(interpretInput(charValues[char]));
              else if (char === "<") {
                var startPos = idx;
                do {
                  idx++;
                } while (textInput[idx] !== ">" && idx < textInput.length);
                digitsArray.push(interpretInput(textInput.slice(startPos + 1, idx)));
              } else throw new Error(char + " is not a valid character");
            }
            return parseFromBaseArray(digitsArray, baseVal, isNegativeNum);
          };

          function parseFromBaseArray(digitsArr, baseVal, isNegativeNum) {
            var resultVal = IntNumber[0],
              powerVal = IntNumber[1],
              idx;
            for (idx = digitsArr.length - 1; idx >= 0; idx--) {
              resultVal = resultVal.addOperation(digitsArr[idx].timesOperation(powerVal));
              powerVal = powerVal.timesOperation(baseVal);
            }
            return isNegativeNum ? resultVal.invertSign() : resultVal;
          }

          function convertToStringRep(digit, charSet) {
            charSet = charSet || STANDARD_ALPHA;
            if (digit < charSet.length) {
              return charSet[digit];
            }
            return "<" + digit + ">";
          }

          function convertToBase(num, baseVal) {
            baseVal = largeNumber(baseVal);
            if (baseVal.isZeroValue()) {
              if (num.isZeroValue()) return {
                numericalValue: [0],
                isNegative: false
              };
              throw new Error("Cannot convert nonzero numbers to base 0.");
            }
            if (baseVal.isEqualTo(-1)) {
              if (num.isZeroValue()) return {
                numericalValue: [0],
                isNegative: false
              };
              if (num.isStrictlyNegative())
                return {
                  numericalValue: [].concat.apply([], Array.apply(noValue, Array(-num.toNativeNumber()))
                    .map(Array.prototype.valueOf, [1, 0])
                  ),
                  isNegative: false
                };

              var arr = Array.apply(noValue, Array(num.toNativeNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
              arr.unshift([1]);
              return {
                numericalValue: [].concat.apply([], arr),
                isNegative: false
              };
            }

            var isNegativeResult = false;
            if (num.isStrictlyNegative() && baseVal.isStrictlyPositive()) {
              isNegativeResult = true;
              num = num.absoluteValue();
            }
            if (baseVal.isOneOrMinusOne()) {
              if (num.isZeroValue()) return {
                numericalValue: [0],
                isNegative: false
              };

              return {
                numericalValue: Array.apply(noValue, Array(num.toNativeNumber()))
                  .map(Number.prototype.valueOf, 1),
                isNegative: isNegativeResult
              };
            }
            var outputDigits = [];
            var remainingNum = num,
              divisionResult;
            while (remainingNum.isStrictlyNegative() || remainingNum.compareAbsoluteValue(baseVal) >= 0) {
              divisionResult = remainingNum.divisionAndModulo(baseVal);
              remainingNum = divisionResult.quotient;
              var digitVal = divisionResult.remainder;
              if (digitVal.isStrictlyNegative()) {
                digitVal = baseVal.minusOperation(digitVal).absoluteValue();
                remainingNum = remainingNum.increment();
              }
              outputDigits.push(digitVal.toNativeNumber());
            }
            outputDigits.push(remainingNum.toNativeNumber());
            return {
              numericalValue: outputDigits.reverse(),
              isNegative: isNegativeResult
            };
          }

          function convertToBaseString(num, baseVal, charSet) {
            var arrResult = convertToBase(num, baseVal);
            return (arrResult.isNegative ? "-" : "") + arrResult.numericalValue.map(function (val) {
              return convertToStringRep(val, charSet);
            }).join('');
          }

          LargeInteger.prototype.toDigitArray = function (radixVal) {
            return convertToBase(this, radixVal);
          };

          CompactInteger.prototype.toDigitArray = function (radixVal) {
            return convertToBase(this, radixVal);
          };

          NativeLargeInt.prototype.toDigitArray = function (radixVal) {
            return convertToBase(this, radixVal);
          };

          LargeInteger.prototype.toTextString = function (radixVal, charSet) {
            if (radixVal === noValue) radixVal = 10;
            if (radixVal !== 10) return convertToBaseString(this, radixVal, charSet);
            var currentVal = this.numericalValue,
              len = currentVal.length,
              str = String(currentVal[--len]),
              zeroPadding = "0000000",
              digitItem;
            while (--len >= 0) {
              digitItem = String(currentVal[len]);
              str += zeroPadding.slice(digitItem.length) + digitItem;
            }
            var currentSign = this.positiveFlag ? "-" : "";
            return currentSign + str;
          };

          CompactInteger.prototype.toTextString = function (radixVal, charSet) {
            if (radixVal === noValue) radixVal = 10;
            if (radixVal != 10) return convertToBaseString(this, radixVal, charSet);
            return String(this.numericalValue);
          };

          NativeLargeInt.prototype.toTextString = CompactInteger.prototype.toTextString;

          NativeLargeInt.prototype.serializeToJSON = LargeInteger.prototype.serializeToJSON = CompactInteger.prototype.serializeToJSON = function () {
            return this.toTextString();
          }

          LargeInteger.prototype.getValue = function () {
            return parseInt(this.toTextString(), 10);
          };
          LargeInteger.prototype.toNativeNumber = LargeInteger.prototype.getValue;

          CompactInteger.prototype.getValue = function () {
            return this.numericalValue;
          };
          CompactInteger.prototype.toNativeNumber = CompactInteger.prototype.getValue;
          NativeLargeInt.prototype.getValue = NativeLargeInt.prototype.toNativeNumber = function () {
            return parseInt(this.toTextString(), 10);
          }

          function interpretString(strVal) {
            if (isExact(+strVal)) {
              var x_val = +strVal;
              if (x_val === floorOrCeil(x_val))
                return hasNativeBigIntSupport ? new NativeLargeInt(BigInt(x_val)) : new CompactInteger(x_val);
              throw new Error("Invalid integer: " + strVal);
            }
            var currentSign = strVal[0] === "-";
            if (currentSign) strVal = strVal.slice(1);
            var parts = strVal.split(/e/i);
            if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));
            if (parts.length === 2) {
              var exponentPart = parts[1];
              if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
              exponentPart = +exponentPart;
              if (exponentPart !== floorOrCeil(exponentPart) || !isExact(exponentPart)) throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
              var textPart = parts[0];
              var decimalPoint = textPart.indexOf(".");
              if (decimalPoint >= 0) {
                exponentPart -= textPart.length - decimalPoint - 1;
                textPart = textPart.slice(0, decimalPoint) + textPart.slice(decimalPoint + 1);
              }
              if (exponentPart < 0) throw new Error("Cannot include negative exponent part for integers");
              textPart += (new Array(exponentPart + 1)).join("0");
              strVal = textPart;
            }
            var isValidFormat = /^([0-9][0-9]*)$/.test(strVal);
            if (!isValidFormat) throw new Error("Invalid integer: " + strVal);
            if (hasNativeBigIntSupport) {
              return new NativeLargeInt(BigInt(currentSign ? "-" + strVal : strVal));
            }
            var digitArray = [],
              maxLength = strVal.length,
              segmentLength = BASE_LOG,
              minLength = maxLength - segmentLength;
            while (maxLength > 0) {
              digitArray.push(+strVal.slice(minLength, maxLength));
              minLength -= segmentLength;
              if (minLength < 0) minLength = 0;
              maxLength -= segmentLength;
            }
            normalizeArray(digitArray);
            return new LargeInteger(digitArray, currentSign);
          }

          function interpretNumber(numVal) {
            if (hasNativeBigIntSupport) {
              return new NativeLargeInt(BigInt(numVal));
            }
            if (isExact(numVal)) {
              if (numVal !== floorOrCeil(numVal)) throw new Error(numVal + " is not an integer.");
              return new CompactInteger(numVal);
            }
            return interpretString(numVal.toTextString());
          }

          function interpretInput(inputVal) {
            if (typeof inputVal === "number") {
              return interpretNumber(inputVal);
            }
            if (typeof inputVal === "string") {
              return interpretString(inputVal);
            }
            if (typeof inputVal === "bigint") {
              return new NativeLargeInt(inputVal);
            }
            return inputVal;
          }
          // Pre-define numbers in range [-999,999]
          for (var idx = 0; idx < 1000; idx++) {
            IntNumber[idx] = interpretInput(idx);
            if (idx > 0) IntNumber[-idx] = interpretInput(-idx);
          }
          // Backwards compatibility
          IntNumber.unity = IntNumber[1];
          IntNumber.nullValue = IntNumber[0];
          IntNumber.negativeUnity = IntNumber[-1];
          IntNumber.maximum = findMaximum;
          IntNumber.minimum = findMinimum;
          IntNumber.commonDivisor = greatestCommonDivisor;
          IntNumber.commonMultiple = leastCommonMultiple;
          IntNumber.isAnInstance = function (obj) {
            return obj instanceof LargeInteger || obj instanceof CompactInteger || obj instanceof NativeLargeInt;
          };
          IntNumber.randomValueBetween = randomBetween;

          IntNumber.fromDigitArray = function (digitsArr, baseVal, isNegativeNum) {
            return parseFromBaseArray(digitsArr.map(interpretInput), interpretInput(baseVal || 10), isNegativeNum);
          };

          return IntNumber;
        })();

        // Node.js check
        if (true && moduleUnit.hasOwnProperty("exportObjects")) {
          moduleUnit.exportObjects = largeNumber;
        }

        //amd check
        if (true) {
          !(__AMD_DEFINITION_RESULT__ = (function () {
            return largeNumber;
          }).call(exports, __module_loader__, exports, moduleUnit),
            __AMD_DEFINITION_RESULT__ !== noValue && (moduleUnit.exportObjects = __AMD_DEFINITION_RESULT__));
        }

        /* WEBPACK VAR INJECTION */
      }.call(this, __module_loader__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(moduleUnit)))


      /***/
    }),

  /***/
  "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    /*! no static exports found */
    /***/
    (function (moduleUnit, exports) {

      moduleUnit.exportObjects = function (moduleUnit) {
        if (!moduleUnit.polyfillStatus) {
          moduleUnit.deprecateFunction = function () {};
          moduleUnit.routePaths = [];
          // moduleUnit.parent = undefined by default
          if (!moduleUnit.childModules) moduleUnit.childModules = [];
          Object.defineProperty(moduleUnit, "finishedLoading", {
            enumerated: true,
            get: function () {
              return moduleUnit.loadStatus;
            }
          });
          Object.defineProperty(moduleUnit, "uniqueId", {
            enumerated: true,
            get: function () {
              return moduleUnit.internalId;
            }
          });
          moduleUnit.polyfillStatus = 1;
        }
        return moduleUnit;
      };


      /***/
    }),

  /***/
  "./src/ABC156/B.js":
    /*!*************************!*\
      !*** ./src/ABC156/B.js ***!
      \*************************/
    /*! no static exports found */
    /***/
    (function (moduleUnit, exports, __module_loader__) {

      function _sliceToTuple(arr, i) {
        return _arrayWithGaps(arr) || _iterableToLimitedArray(arr, i) || _nonIterableRemainder();
      }

      function _nonIterableRemainder() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }

      function _iterableToLimitedArray(arr, i) {
        if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
          return;
        }
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"] != null) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }
        return _arr;
      }

      function _arrayWithGaps(arr) {
        if (Array.isArray(arr)) return arr;
      }

      var fileSys = __module_loader__(/*! fs */ "fs");

      var largeNum = __module_loader__(/*! big-integer */ "./node_modules/big-integer/BigInteger.js");

      var executeProgram = function (rawData) {
        var _inputData$split$0$parts$ = rawData.split('\n')[0].split(' ').map(function (numStr) {
            return numStr - 0;
          }),
          _inputData$split$0$parts$2 = _sliceToTuple(_inputData$split$0$parts$, 2),
          numberToConvert = _inputData$split$0$parts$2[0],
          targetBase = _inputData$split$0$parts$2[1];

        var countOfDigits = 0;

        while (numberToConvert > 0) {
          numberToConvert = Math.floor(numberToConvert / targetBase);
          countOfDigits++;
        }

        console.log(countOfDigits);
      };

      executeProgram(fileSys.readContentSync('/dev/stdin', 'utf8'));


      /***/
    }),

  /***/
  "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/
    (function (moduleUnit, exports) {

      moduleUnit.exportObjects = require("fs");


      /***/
    })

});