module.exports = function (sourceModuleDefinitions) {
  var loadedModuleRegistry = {};

  function retrieveAndExecute(moduleIdentifierToLoad) {
    if (loadedModuleRegistry[moduleIdentifierToLoad]) {
      return loadedModuleRegistry[moduleIdentifierToLoad].exports;
    }

    var currentModuleRecord = loadedModuleRegistry[moduleIdentifierToLoad] = {
      moduleId: moduleIdentifierToLoad,
      isLoaded: false,
      exports: {}
    };

    sourceModuleDefinitions[moduleIdentifierToLoad].call(
      currentModuleRecord.exports,
      currentModuleRecord,
      currentModuleRecord.exports,
      retrieveAndExecute
    );

    currentModuleRecord.isLoaded = true;

    return currentModuleRecord.exports;
  }

  retrieveAndExecute.moduleDefinitions = sourceModuleDefinitions;
  retrieveAndExecute.moduleCache = loadedModuleRegistry;

  retrieveAndExecute.defineExportProperty = function (exportObjectRef, propertyNameStr, getterFunction) {
    if (!retrieveAndExecute.hasOwnProperty(exportObjectRef, propertyNameStr)) {
      Object.defineProperty(exportObjectRef, propertyNameStr, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  retrieveAndExecute.markAsESModule = function (exportObjectRef) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObjectRef, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObjectRef, "__esModule", {
      value: true
    });
  };

  retrieveAndExecute.createInteropDefault = function (targetModuleRef, interopModeFlags) {
    if (interopModeFlags & 1) {
      targetModuleRef = retrieveAndExecute(targetModuleRef);
    }
    if (interopModeFlags & 8) {
      return targetModuleRef;
    }
    if (interopModeFlags & 4 && typeof targetModuleRef === "object" && targetModuleRef && targetModuleRef.__esModule) {
      return targetModuleRef;
    }

    var newExportContainer = Object.create(null);
    retrieveAndExecute.markAsESModule(newExportContainer);
    Object.defineProperty(newExportContainer, "default", {
      enumerable: true,
      value: targetModuleRef
    });

    if (interopModeFlags & 2 && typeof targetModuleRef !== "string") {
      for (var propertyName in targetModuleRef) {
        retrieveAndExecute.defineExportProperty(
          newExportContainer,
          propertyName,
          (function (propKey) {
            return targetModuleRef[propKey];
          }).bind(null, propertyName)
        );
      }
    }
    return newExportContainer;
  };

  retrieveAndExecute.getDefaultExportAccessor = function (moduleNamespaceObjectRef) {
    var defaultExportGetter = moduleNamespaceObjectRef && moduleNamespaceObjectRef.__esModule ?
      function () {
        return moduleNamespaceObjectRef["default"];
      } :
      function () {
        return moduleNamespaceObjectRef;
      };
    retrieveAndExecute.defineExportProperty(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  retrieveAndExecute.hasOwnProp = function (targetObjectRef, propertyKeyStr) {
    return Object.prototype.hasOwnProperty.call(targetObjectRef, propertyKeyStr);
  };

  retrieveAndExecute.publicAssetPath = "";

  return retrieveAndExecute(retrieveAndExecute.startupModuleId = 0);
}(
  [
    function (currentModule, moduleExports, moduleLoader) {
      moduleLoader(1)(moduleLoader(4).readFileSync("/dev/stdin", "UTF-8"));
    },

    function (currentModuleContext, moduleExportObject, moduleImporter) {
      function arrayDestructurer(inputArray, requiredLength) {
        if (Array.isArray(inputArray)) {
          return inputArray;
        }

        var resultCollection = [];
        var isLoopActive = true;
        var hasErrorOccurred = false;
        var caughtException = undefined;
        try {
          for (
            var currentValue, iteratorInstance = inputArray[Symbol.iterator](); !(isLoopActive = (currentValue = iteratorInstance.next()).done) &&
            (resultCollection.push(currentValue.value), !requiredLength || resultCollection.length !== requiredLength); isLoopActive = true
          ) {}
        } catch (iterationError) {
          hasErrorOccurred = true;
          caughtException = iterationError;
        } finally {
          try {
            if (!isLoopActive && iteratorInstance["return"] != null) {
              iteratorInstance["return"]();
            }
          } finally {
            if (hasErrorOccurred) {
              throw caughtException;
            }
          }
        }
        return resultCollection;
      }

      var bigIntProcessor = moduleImporter(2);

      currentModuleContext.exports = function (rawInputData) {
        var parsedNumericalInputs = arrayDestructurer(
          rawInputData
          .split("\n")[0]
          .split(" ")
          .map(function (valStr) {
            return parseInt(valStr, 10);
          }),
          3
        );

        var firstNumber = parsedNumericalInputs[0];
        var secondNumber = parsedNumericalInputs[1];
        var thirdNumber = parsedNumericalInputs[2];

        if (firstNumber === 1) {
          if (secondNumber > thirdNumber) {
            return void console.log(0);
          }
          if (secondNumber === thirdNumber) {
            return void console.log(1);
          }
          return void console.log(0);
        }

        if (secondNumber > thirdNumber) {
          console.log(0);
        } else {
          var bigThirdNumber = bigIntProcessor(thirdNumber);
          var bigSecondNumber = bigIntProcessor(secondNumber);
          var differenceResult = bigThirdNumber.minus(bigSecondNumber);
          var modifierValue = bigIntProcessor(firstNumber).minus(2);
          var finalCalculation = differenceResult.multiply(modifierValue).plus(1);

          var outputStringRepresentation = "";
          while (finalCalculation.greater(0)) {
            outputStringRepresentation = finalCalculation.mod(10).valueOf() + outputStringRepresentation;
            finalCalculation = finalCalculation.divide(10);
          }
          console.log(outputStringRepresentation);
        }
      };
    },

    function (moduleContext, exportsObject, moduleRequester) {
      (function (currentModule) {
        var moduleResult,
          BigNumberFactory = (function (inputVal) {
            "use strict";

            var segmentBase = 1e7;
            var segmentDigitsCount = 7;
            var maxJsSafeInt = 9007199254740992;
            var maxJsSafeIntSegments = splitNumberIntoSegments(maxJsSafeInt);
            var baseAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
            var isNativeBigIntSupported = typeof BigInt === "function";

            function createNumberInstance(valueInput, inputBase, customDigits, caseSensitive) {
              if (valueInput === undefined) {
                return createNumberInstance[0];
              }
              if (inputBase !== undefined && (inputBase !== 10 || customDigits)) {
                return parseCustomBaseString(valueInput, inputBase, customDigits, caseSensitive);
              }
              return standardizeToBigNumber(valueInput);
            }

            function HugeNumber(numericalValue, isNegative) {
              this.value = numericalValue;
              this.sign = isNegative;
              this.isSmall = false;
            }

            function TinyNumber(numericalValue) {
              this.value = numericalValue;
              this.sign = numericalValue < 0;
              this.isSmall = true;
            }

            function NativeBigIntWrapper(nativeValue) {
              this.value = nativeValue;
            }

            function isWithinSafeRange(numValue) {
              return -maxJsSafeInt < numValue && numValue < maxJsSafeInt;
            }

            function splitNumberIntoSegments(numToSplit) {
              if (numToSplit < segmentBase) {
                return [numToSplit];
              }
              if (numToSplit < 1e14) {
                return [numToSplit % segmentBase, Math.floor(numToSplit / segmentBase)];
              }
              return [
                numToSplit % segmentBase,
                Math.floor(numToSplit / segmentBase) % segmentBase,
                Math.floor(numToSplit / 1e14),
              ];
            }

            function normalizeSegmentArray(segmentArray) {
              trimArrayEndZeros(segmentArray);
              var arrayLength = segmentArray.length;
              if (arrayLength < 4 && compareSegmentArrays(segmentArray, maxJsSafeIntSegments) < 0) {
                switch (arrayLength) {
                  case 0:
                    return 0;
                  case 1:
                    return segmentArray[0];
                  case 2:
                    return segmentArray[0] + segmentArray[1] * segmentBase;
                  default:
                    return segmentArray[0] + (segmentArray[1] + segmentArray[2] * segmentBase) * segmentBase;
                }
              }
              return segmentArray;
            }

            function trimArrayEndZeros(segmentArray) {
              for (var idx = segmentArray.length; idx > 0 && segmentArray[idx - 1] === 0; idx--);
              segmentArray.length = idx;
            }

            function generateZeroArray(length) {
              for (var arr = new Array(length), idx = -1; ++idx < length;) {
                arr[idx] = 0;
              }
              return arr;
            }

            function roundToInteger(num) {
              return num > 0 ? Math.floor(num) : Math.ceil(num);
            }

            function addPositiveSegments(segmentArrA, segmentArrB) {
              var lengthA = segmentArrA.length;
              var lengthB = segmentArrB.length;
              var resultSegments = new Array(lengthA);
              var carry = 0;
              var segmentBaseVal = segmentBase;

              for (var i = 0; i < lengthB; i++) {
                var sum = segmentArrA[i] + segmentArrB[i] + carry;
                carry = sum >= segmentBaseVal ? 1 : 0;
                resultSegments[i] = sum - carry * segmentBaseVal;
              }
              for (var i = lengthB; i < lengthA; i++) {
                var sum = segmentArrA[i] + carry;
                carry = sum === segmentBaseVal ? 1 : 0;
                resultSegments[i] = sum - carry * segmentBaseVal;
              }
              if (carry > 0) {
                resultSegments.push(carry);
              }
              return resultSegments;
            }

            function addSegmentArraysBalanced(segmentArrX, segmentArrY) {
              return segmentArrX.length >= segmentArrY.length ?
                addPositiveSegments(segmentArrX, segmentArrY) :
                addPositiveSegments(segmentArrY, segmentArrX);
            }

            function addSmallValueToSegments(segmentArray, smallNum) {
              var sumResult,
                carry = smallNum,
                segmentBaseVal = segmentBase,
                arrayLength = segmentArray.length,
                newArray = new Array(arrayLength);

              for (var i = 0; i < arrayLength; i++) {
                sumResult = segmentArray[i] + carry;
                carry = Math.floor(sumResult / segmentBaseVal);
                newArray[i] = sumResult - carry * segmentBaseVal;
              }
              for (; carry > 0;) {
                newArray[i++] = carry % segmentBaseVal;
                carry = Math.floor(carry / segmentBaseVal);
              }
              return newArray;
            }

            function subtractPositiveSegments(segmentArrA, segmentArrB) {
              var lengthA = segmentArrA.length;
              var lengthB = segmentArrB.length;
              var resultSegments = new Array(lengthA);
              var borrow = 0;
              var segmentBaseVal = segmentBase;

              for (var i = 0; i < lengthB; i++) {
                var diff = segmentArrA[i] - borrow - segmentArrB[i];
                if (diff < 0) {
                  diff += segmentBaseVal;
                  borrow = 1;
                } else {
                  borrow = 0;
                }
                resultSegments[i] = diff;
              }
              for (var i = lengthB; i < lengthA; i++) {
                var diff = segmentArrA[i] - borrow;
                if (diff < 0) {
                  diff += segmentBaseVal;
                  resultSegments[i] = diff;
                } else {
                  resultSegments[i++] = diff;
                  break;
                }
              }
              for (; i < lengthA; i++) {
                resultSegments[i] = segmentArrA[i];
              }
              trimArrayEndZeros(resultSegments);
              return resultSegments;
            }

            function subtractSmallValueFromSegments(segmentArray, smallNum, isNegativeResult) {
              var diffResult,
                carry = -smallNum,
                segmentBaseVal = segmentBase,
                arrayLength = segmentArray.length,
                newArray = new Array(arrayLength);

              for (var i = 0; i < arrayLength; i++) {
                diffResult = segmentArray[i] + carry;
                carry = Math.floor(diffResult / segmentBaseVal);
                diffResult %= segmentBaseVal;
                newArray[i] = diffResult < 0 ? diffResult + segmentBaseVal : diffResult;
              }
              newArray = normalizeSegmentArray(newArray);
              if (typeof newArray === "number") {
                return isNegativeResult ? (newArray = -newArray) : newArray;
              }
              return new HugeNumber(newArray, isNegativeResult);
            }

            function multiplySegmentArrays(segmentArrA, segmentArrB) {
              var lengthA = segmentArrA.length;
              var lengthB = segmentArrB.length;
              var resultSegments = generateZeroArray(lengthA + lengthB);
              var segmentBaseVal = segmentBase;

              for (var i = 0; i < lengthA; ++i) {
                var factorA = segmentArrA[i];
                for (var j = 0; j < lengthB; ++j) {
                  var product = factorA * segmentArrB[j] + resultSegments[i + j];
                  var carry = Math.floor(product / segmentBaseVal);
                  resultSegments[i + j] = product - carry * segmentBaseVal;
                  resultSegments[i + j + 1] += carry;
                }
              }
              trimArrayEndZeros(resultSegments);
              return resultSegments;
            }

            function multiplySegmentsByScalar(segmentArray, scalar) {
              var arrayLength = segmentArray.length;
              var resultSegments = new Array(arrayLength);
              var segmentBaseVal = segmentBase;
              var carry = 0;

              for (var i = 0; i < arrayLength; i++) {
                var product = segmentArray[i] * scalar + carry;
                carry = Math.floor(product / segmentBaseVal);
                resultSegments[i] = product - carry * segmentBaseVal;
              }
              for (; carry > 0;) {
                resultSegments[i++] = carry % segmentBaseVal;
                carry = Math.floor(carry / segmentBaseVal);
              }
              return resultSegments;
            }

            function padSegmentsWithZeros(segmentArray, count) {
              for (var zeros = []; count-- > 0;) {
                zeros.push(0);
              }
              return zeros.concat(segmentArray);
            }

            function createNumberFromProduct(smallNum, segmentArr, isNegative) {
              return new HugeNumber(
                smallNum < segmentBase ?
                multiplySegmentsByScalar(segmentArr, smallNum) :
                multiplySegmentArrays(segmentArr, splitNumberIntoSegments(smallNum)),
                isNegative
              );
            }

            function squareSegmentArray(segmentArray) {
              var arrayLength = segmentArray.length;
              var resultSegments = generateZeroArray(arrayLength + arrayLength);
              var segmentBaseVal = segmentBase;

              for (var i = 0; i < arrayLength; i++) {
                var carry = 0 - (product = segmentArray[i]) * segmentArray[i];
                for (var j = i; j < arrayLength; j++) {
                  var product = segmentArray[i] * segmentArray[j] * 2 + resultSegments[i + j] + carry;
                  carry = Math.floor(product / segmentBaseVal);
                  resultSegments[i + j] = product - carry * segmentBaseVal;
                }
                resultSegments[i + arrayLength] = carry;
              }
              trimArrayEndZeros(resultSegments);
              return resultSegments;
            }

            function divideSegmentsByScalar(segmentArray, scalar) {
              var arrayLength = segmentArray.length;
              var resultSegments = new Array(arrayLength);
              var segmentBaseVal = segmentBase;
              var remainder = 0;

              for (var i = arrayLength - 1; i >= 0; --i) {
                var currentSegment = remainder * segmentBaseVal + segmentArray[i];
                var quotient = roundToInteger(currentSegment / scalar);
                remainder = currentSegment - quotient * scalar;
                resultSegments[i] = quotient;
              }
              return [resultSegments, remainder];
            }

            function performDivision(dividendNum, divisorNum) {
              var normalizedDivisor = standardizeToBigNumber(divisorNum);
              if (isNativeBigIntSupported) {
                return [
                  new NativeBigIntWrapper(dividendNum.value / normalizedDivisor.value),
                  new NativeBigIntWrapper(dividendNum.value % normalizedDivisor.value),
                ];
              }

              var dividendSegments = dividendNum.value;
              var divisorSegments = normalizedDivisor.value;

              if (divisorSegments === 0) {
                throw new Error("Cannot divide by zero");
              }

              if (dividendNum.isSmall) {
                return normalizedDivisor.isSmall ?
                  [
                    new TinyNumber(roundToInteger(dividendSegments / divisorSegments)),
                    new TinyNumber(dividendSegments % divisorSegments),
                  ] :
                  [createNumberInstance[0], dividendNum];
              }

              if (normalizedDivisor.isSmall) {
                if (divisorSegments === 1) {
                  return [dividendNum, createNumberInstance[0]];
                }
                if (divisorSegments === -1) {
                  return [dividendNum.negate(), createNumberInstance[0]];
                }
                var absDivisor = Math.abs(divisorSegments);
                if (absDivisor < segmentBase) {
                  var divisionResult = divideSegmentsByScalar(dividendSegments, absDivisor);
                  var quotientSegments = normalizeSegmentArray(divisionResult[0]);
                  var remainder = divisionResult[1];
                  if (dividendNum.sign) {
                    remainder = -remainder;
                  }
                  return typeof quotientSegments === "number" ?
                    (dividendNum.sign !== normalizedDivisor.sign && (quotientSegments = -quotientSegments),
                      [new TinyNumber(quotientSegments), new TinyNumber(remainder)]) :
                    [
                      new HugeNumber(quotientSegments, dividendNum.sign !== normalizedDivisor.sign),
                      new TinyNumber(remainder),
                    ];
                }
                divisorSegments = splitNumberIntoSegments(absDivisor);
              }

              var comparisonResult = compareSegmentArrays(dividendSegments, divisorSegments);
              if (comparisonResult === -1) {
                return [createNumberInstance[0], dividendNum];
              }
              if (comparisonResult === 0) {
                return [
                  createNumberInstance[dividendNum.sign === normalizedDivisor.sign ? 1 : -1],
                  createNumberInstance[0],
                ];
              }

              var quotientValue;
              var remainderValue;

              if (dividendSegments.length + divisorSegments.length <= 200) {
                var dividendLen = dividendSegments.length;
                var divisorLen = divisorSegments.length;
                var quotientSegmentsArr = generateZeroArray(divisorLen);
                var segmentBaseVal = segmentBase;

                var divisorLastSegment = divisorSegments[divisorLen - 1];
                var divisorScaleFactor = Math.ceil(segmentBaseVal / (2 * divisorLastSegment));

                var scaledDividend = multiplySegmentsByScalar(dividendSegments, divisorScaleFactor);
                var scaledDivisor = multiplySegmentsByScalar(divisorSegments, divisorScaleFactor);

                scaledDividend.length <= dividendLen && scaledDividend.push(0);
                scaledDivisor.push(0);
                divisorLastSegment = scaledDivisor[divisorLen - 1];

                for (var n = dividendLen - divisorLen; n >= 0; n--) {
                  var estimatedQuotient = segmentBaseVal - 1;
                  if (scaledDividend[n + divisorLen] !== divisorLastSegment) {
                    estimatedQuotient = Math.floor(
                      (scaledDividend[n + divisorLen] * segmentBaseVal + scaledDividend[n + divisorLen - 1]) /
                      divisorLastSegment
                    );
                  }

                  var currentBorrow = 0;
                  var currentCarry = 0;
                  var scaledDivisorSegmentCount = scaledDivisor.length;
                  var tempProduct;

                  for (var p = 0; p < scaledDivisorSegmentCount; p++) {
                    tempProduct = estimatedQuotient * scaledDivisor[p] + currentBorrow;
                    currentBorrow = Math.floor(tempProduct / segmentBaseVal);
                    currentCarry +=
                      scaledDividend[n + p] - (tempProduct - currentBorrow * segmentBaseVal);
                    if (currentCarry < 0) {
                      scaledDividend[n + p] = currentCarry + segmentBaseVal;
                      currentCarry = -1;
                    } else {
                      scaledDividend[n + p] = currentCarry;
                      currentCarry = 0;
                    }
                  }

                  while (currentCarry !== 0) {
                    estimatedQuotient -= 1;
                    currentBorrow = 0;
                    for (var p = 0; p < scaledDivisorSegmentCount; p++) {
                      currentBorrow += scaledDividend[n + p] - segmentBaseVal + scaledDivisor[p];
                      if (currentBorrow < 0) {
                        scaledDividend[n + p] = currentBorrow + segmentBaseVal;
                        currentBorrow = 0;
                      } else {
                        scaledDividend[n + p] = currentBorrow;
                        currentBorrow = 1;
                      }
                    }
                    currentCarry += currentBorrow;
                  }
                  quotientSegmentsArr[n] = estimatedQuotient;
                }

                scaledDividend = divideSegmentsByScalar(scaledDividend, divisorScaleFactor)[0];
                quotientValue = normalizeSegmentArray(quotientSegmentsArr);
                remainderValue = normalizeSegmentArray(scaledDividend);

              } else {
                var currentDividendSegment,
                  currentDivisorSegment,
                  segmentIndex,
                  estimatedQuotient,
                  partialProduct;

                var dividendSegmentsLength = dividendSegments.length;
                var divisorSegmentsLength = divisorSegments.length;
                var quotientParts = [];
                var remainderParts = [];
                var segmentBaseVal = segmentBase;

                while (dividendSegmentsLength > 0) {
                  remainderParts.unshift(dividendSegments[--dividendSegmentsLength]);
                  trimArrayEndZeros(remainderParts);

                  if (compareSegmentArrays(remainderParts, divisorSegments) < 0) {
                    quotientParts.push(0);
                  } else {
                    currentDividendSegment = remainderParts[(segmentIndex = remainderParts.length) - 1] * segmentBaseVal + remainderParts[segmentIndex - 2];
                    currentDivisorSegment = divisorSegments[divisorSegmentsLength - 1] * segmentBaseVal + divisorSegments[divisorSegmentsLength - 2];

                    if (segmentIndex > divisorSegmentsLength) {
                      currentDividendSegment = (currentDividendSegment + 1) * segmentBaseVal;
                    }

                    estimatedQuotient = Math.ceil(currentDividendSegment / currentDivisorSegment);

                    do {
                      partialProduct = multiplySegmentsByScalar(divisorSegments, estimatedQuotient);
                      if (compareSegmentArrays(partialProduct, remainderParts) <= 0) {
                        break;
                      }
                      estimatedQuotient--;
                    } while (estimatedQuotient);

                    quotientParts.push(estimatedQuotient);
                    remainderParts = subtractPositiveSegments(remainderParts, partialProduct);
                  }
                }
                quotientParts.reverse();
                quotientValue = normalizeSegmentArray(quotientParts);
                remainderValue = normalizeSegmentArray(remainderParts);
              }

              var isQuotientNegative = dividendNum.sign !== normalizedDivisor.sign;
              var isRemainderNegative = dividendNum.sign;

              if (typeof quotientValue === "number") {
                if (isQuotientNegative) {
                  quotientValue = -quotientValue;
                }
                quotientValue = new TinyNumber(quotientValue);
              } else {
                quotientValue = new HugeNumber(quotientValue, isQuotientNegative);
              }

              if (typeof remainderValue === "number") {
                if (isRemainderNegative) {
                  remainderValue = -remainderValue;
                }
                remainderValue = new TinyNumber(remainderValue);
              } else {
                remainderValue = new HugeNumber(remainderValue, isRemainderNegative);
              }

              return [quotientValue, remainderValue];
            }

            function compareSegmentArrays(segmentArrA, segmentArrB) {
              if (segmentArrA.length !== segmentArrB.length) {
                return segmentArrA.length > segmentArrB.length ? 1 : -1;
              }
              for (var i = segmentArrA.length - 1; i >= 0; i--) {
                if (segmentArrA[i] !== segmentArrB[i]) {
                  return segmentArrA[i] > segmentArrB[i] ? 1 : -1;
                }
              }
              return 0;
            }

            function testSmallPrimes(bigNum) {
              var absNum = bigNum.abs();
              if (!absNum.isUnit() && (absNum.equals(2) || absNum.equals(3) || absNum.equals(5))) {
                return true;
              }
              if (absNum.isEven() || absNum.isDivisibleBy(3) || absNum.isDivisibleBy(5)) {
                return false;
              }
              if (absNum.lesser(49)) {
                return true;
              }
              return undefined;
            }

            function runMillerRabin(numToCheck, testBases) {
              var tempNum = numToCheck.prev();
              var sValue = tempNum;
              var dValue = 0;

              while (sValue.isEven()) {
                sValue = sValue.divide(2);
                dValue++;
              }

              baseLoop: for (var i = 0; i < testBases.length; i++) {
                if (!numToCheck.lesser(testBases[i])) {
                  var baseBigNum = BigNumberFactory(testBases[i]);
                  var xValue = baseBigNum.modPow(sValue, numToCheck);

                  if (!xValue.isUnit() && !xValue.equals(tempNum)) {
                    for (var r = dValue - 1; r > 0; r--) {
                      xValue = xValue.square().mod(numToCheck);
                      if (xValue.isUnit()) {
                        return false;
                      }
                      if (xValue.equals(tempNum)) {
                        continue baseLoop;
                      }
                    }
                    return false;
                  }
                }
              }
              return true;
            }

            HugeNumber.prototype = Object.create(createNumberInstance.prototype);
            TinyNumber.prototype = Object.create(createNumberInstance.prototype);
            NativeBigIntWrapper.prototype = Object.create(createNumberInstance.prototype);

            HugeNumber.prototype.add = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              if (this.sign !== otherBigNum.sign) {
                return this.subtract(otherBigNum.negate());
              }
              var thisVal = this.value;
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ?
                new HugeNumber(addSmallValueToSegments(thisVal, Math.abs(otherVal)), this.sign) :
                new HugeNumber(addSegmentArraysBalanced(thisVal, otherVal), this.sign);
            };
            HugeNumber.prototype.plus = HugeNumber.prototype.add;

            TinyNumber.prototype.add = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisVal = this.value;
              if (thisVal < 0 !== otherBigNum.sign) {
                return this.subtract(otherBigNum.negate());
              }
              var otherVal = otherBigNum.value;
              if (otherBigNum.isSmall) {
                if (isWithinSafeRange(thisVal + otherVal)) {
                  return new TinyNumber(thisVal + otherVal);
                }
                otherVal = splitNumberIntoSegments(Math.abs(otherVal));
              }
              return new HugeNumber(addSmallValueToSegments(otherVal, Math.abs(thisVal)), thisVal < 0);
            };
            TinyNumber.prototype.plus = TinyNumber.prototype.add;

            NativeBigIntWrapper.prototype.add = function (otherNum) {
              return new NativeBigIntWrapper(this.value + standardizeToBigNumber(otherNum).value);
            };
            NativeBigIntWrapper.prototype.plus = NativeBigIntWrapper.prototype.add;

            HugeNumber.prototype.subtract = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              if (this.sign !== otherBigNum.sign) {
                return this.add(otherBigNum.negate());
              }
              var thisVal = this.value;
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ?
                subtractSmallValueFromSegments(thisVal, Math.abs(otherVal), this.sign) :
                (function (segmentArrA, segmentArrB, isNegative) {
                  var result;
                  if (compareSegmentArrays(segmentArrA, segmentArrB) >= 0) {
                    result = subtractPositiveSegments(segmentArrA, segmentArrB);
                  } else {
                    result = subtractPositiveSegments(segmentArrB, segmentArrA);
                    isNegative = !isNegative;
                  }
                  result = normalizeSegmentArray(result);
                  if (typeof result === "number") {
                    return isNegative ? (result = -result) : result;
                  }
                  return new HugeNumber(result, isNegative);
                })(thisVal, otherVal, this.sign);
            };
            HugeNumber.prototype.minus = HugeNumber.prototype.subtract;

            TinyNumber.prototype.subtract = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisVal = this.value;
              if (thisVal < 0 !== otherBigNum.sign) {
                return this.add(otherBigNum.negate());
              }
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ?
                new TinyNumber(thisVal - otherVal) :
                subtractSmallValueFromSegments(otherVal, Math.abs(thisVal), thisVal >= 0);
            };
            TinyNumber.prototype.minus = TinyNumber.prototype.subtract;

            NativeBigIntWrapper.prototype.subtract = function (otherNum) {
              return new NativeBigIntWrapper(this.value - standardizeToBigNumber(otherNum).value);
            };
            NativeBigIntWrapper.prototype.minus = NativeBigIntWrapper.prototype.subtract;

            HugeNumber.prototype.negate = function () {
              return new HugeNumber(this.value, !this.sign);
            };

            TinyNumber.prototype.negate = function () {
              var currentSign = this.sign;
              var negatedNum = new TinyNumber(-this.value);
              negatedNum.sign = !currentSign;
              return negatedNum;
            };

            NativeBigIntWrapper.prototype.negate = function () {
              return new NativeBigIntWrapper(-this.value);
            };

            HugeNumber.prototype.abs = function () {
              return new HugeNumber(this.value, false);
            };

            TinyNumber.prototype.abs = function () {
              return new TinyNumber(Math.abs(this.value));
            };

            NativeBigIntWrapper.prototype.abs = function () {
              return new NativeBigIntWrapper(this.value >= 0 ? this.value : -this.value);
            };

            HugeNumber.prototype.multiply = function (otherNum) {
              var productSegments,
                factorA,
                factorB,
                otherBigNum = standardizeToBigNumber(otherNum),
                thisVal = this.value,
                otherVal = otherBigNum.value,
                isNegativeProduct = this.sign !== otherBigNum.sign;

              if (otherBigNum.isSmall) {
                if (otherVal === 0) {
                  return createNumberInstance[0];
                }
                if (otherVal === 1) {
                  return this;
                }
                if (otherVal === -1) {
                  return this.negate();
                }
                if ((factorA = Math.abs(otherVal)) < segmentBase) {
                  return new HugeNumber(multiplySegmentsByScalar(thisVal, factorA), isNegativeProduct);
                }
                otherVal = splitNumberIntoSegments(factorA);
              }

              factorA = thisVal.length;
              factorB = otherVal.length;

              if (-0.012 * factorA - 0.012 * factorB + 15e-6 * factorA * factorB > 0) {
                (function karatsubaMultiply(num1Segments, num2Segments) {
                  var maxLength = Math.max(num1Segments.length, num2Segments.length);
                  if (maxLength <= 30) {
                    return multiplySegmentArrays(num1Segments, num2Segments);
                  }

                  maxLength = Math.ceil(maxLength / 2);
                  var high1 = num1Segments.slice(maxLength);
                  var low1 = num1Segments.slice(0, maxLength);
                  var high2 = num2Segments.slice(maxLength);
                  var low2 = num2Segments.slice(0, maxLength);

                  var z0 = karatsubaMultiply(low1, low2);
                  var z1 = karatsubaMultiply(
                    addSegmentArraysBalanced(low1, high1),
                    addSegmentArraysBalanced(low2, high2)
                  );
                  var z2 = karatsubaMultiply(high1, high2);

                  var result = addSegmentArraysBalanced(
                    addSegmentArraysBalanced(z0, padSegmentsWithZeros(subtractPositiveSegments(subtractPositiveSegments(z1, z0), z2), maxLength)),
                    padSegmentsWithZeros(z2, 2 * maxLength)
                  );
                  trimArrayEndZeros(result);
                  return result;
                });
              } else {
                productSegments = multiplySegmentArrays(thisVal, otherVal);
              }
              return new HugeNumber(productSegments, isNegativeProduct);
            };
            HugeNumber.prototype.times = HugeNumber.prototype.multiply;

            TinyNumber.prototype._multiplyBySmall = function (otherNum) {
              return isWithinSafeRange(otherNum.value * this.value) ?
                new TinyNumber(otherNum.value * this.value) :
                createNumberFromProduct(Math.abs(otherNum.value), splitNumberIntoSegments(Math.abs(this.value)), this.sign !== otherNum.sign);
            };
            HugeNumber.prototype._multiplyBySmall = function (otherNum) {
              return otherNum.value === 0 ?
                createNumberInstance[0] :
                otherNum.value === 1 ?
                this :
                otherNum.value === -1 ?
                this.negate() :
                createNumberFromProduct(Math.abs(otherNum.value), this.value, this.sign !== otherNum.sign);
            };

            TinyNumber.prototype.multiply = function (otherNum) {
              return standardizeToBigNumber(otherNum)._multiplyBySmall(this);
            };
            TinyNumber.prototype.times = TinyNumber.prototype.multiply;

            NativeBigIntWrapper.prototype.multiply = function (otherNum) {
              return new NativeBigIntWrapper(this.value * standardizeToBigNumber(otherNum).value);
            };
            NativeBigIntWrapper.prototype.times = NativeBigIntWrapper.prototype.multiply;

            HugeNumber.prototype.square = function () {
              return new HugeNumber(squareSegmentArray(this.value), false);
            };

            TinyNumber.prototype.square = function () {
              var squaredVal = this.value * this.value;
              return isWithinSafeRange(squaredVal) ?
                new TinyNumber(squaredVal) :
                new HugeNumber(squareSegmentArray(splitNumberIntoSegments(Math.abs(this.value))), false);
            };

            NativeBigIntWrapper.prototype.square = function () {
              return new NativeBigIntWrapper(this.value * this.value);
            };

            HugeNumber.prototype.divmod = function (divisorNum) {
              var result = performDivision(this, divisorNum);
              return {
                quotient: result[0],
                remainder: result[1]
              };
            };
            NativeBigIntWrapper.prototype.divmod = TinyNumber.prototype.divmod = HugeNumber.prototype.divmod;

            HugeNumber.prototype.divide = function (divisorNum) {
              return performDivision(this, divisorNum)[0];
            };
            NativeBigIntWrapper.prototype.over = NativeBigIntWrapper.prototype.divide = TinyNumber.prototype.over = TinyNumber.prototype.divide = HugeNumber.prototype.over = HugeNumber.prototype.divide;

            HugeNumber.prototype.mod = function (divisorNum) {
              return performDivision(this, divisorNum)[1];
            };
            NativeBigIntWrapper.prototype.mod = NativeBigIntWrapper.prototype.remainder = TinyNumber.prototype.remainder = TinyNumber.prototype.mod = HugeNumber.prototype.remainder = HugeNumber.prototype.mod;

            HugeNumber.prototype.pow = function (exponentNum) {
              var exponentBigNum = standardizeToBigNumber(exponentNum);
              var baseValue = this.value;
              var exponentValue = exponentBigNum.value;

              if (exponentValue === 0) {
                return createNumberInstance[1];
              }
              if (baseValue === 0) {
                return createNumberInstance[0];
              }
              if (baseValue === 1) {
                return createNumberInstance[1];
              }
              if (baseValue === -1) {
                return exponentBigNum.isEven() ? createNumberInstance[1] : createNumberInstance[-1];
              }
              if (exponentBigNum.sign) {
                return createNumberInstance[0];
              }
              if (!exponentBigNum.isSmall) {
                throw new Error("The exponent " + exponentBigNum.toString() + " is too large.");
              }

              if (this.isSmall && isWithinSafeRange(Math.pow(baseValue, exponentValue))) {
                return new TinyNumber(roundToInteger(Math.pow(baseValue, exponentValue)));
              }

              var resultAccumulator = createNumberInstance[1];
              var currentBase = this;

              while (true) {
                if (exponentValue & 1) {
                  resultAccumulator = resultAccumulator.times(currentBase);
                }
                if (exponentValue === 0) {
                  break;
                }
                exponentValue /= 2;
                currentBase = currentBase.square();
              }
              return resultAccumulator;
            };
            TinyNumber.prototype.pow = HugeNumber.prototype.pow;

            NativeBigIntWrapper.prototype.pow = function (exponentNum) {
              var exponentBigNum = standardizeToBigNumber(exponentNum);
              var baseVal = this.value;
              var exponentVal = exponentBigNum.value;
              var zeroBig = BigInt(0);
              var oneBig = BigInt(1);
              var twoBig = BigInt(2);

              if (exponentVal === zeroBig) {
                return createNumberInstance[1];
              }
              if (baseVal === zeroBig) {
                return createNumberInstance[0];
              }
              if (baseVal === oneBig) {
                return createNumberInstance[1];
              }
              if (baseVal === BigInt(-1)) {
                return exponentBigNum.isEven() ? createNumberInstance[1] : createNumberInstance[-1];
              }
              if (exponentBigNum.isNegative()) {
                return new NativeBigIntWrapper(zeroBig);
              }

              var currentBase = this;
              var resultAccumulator = createNumberInstance[1];

              while (true) {
                if ((exponentVal & oneBig) === oneBig) {
                  resultAccumulator = resultAccumulator.times(currentBase);
                  exponentVal--;
                }
                if (exponentVal === zeroBig) {
                  break;
                }
                exponentVal /= twoBig;
                currentBase = currentBase.square();
              }
              return resultAccumulator;
            };

            HugeNumber.prototype.modPow = function (exponentNum, modulusNum) {
              exponentNum = standardizeToBigNumber(exponentNum);
              modulusNum = standardizeToBigNumber(modulusNum);

              if (modulusNum.isZero()) {
                throw new Error("Cannot take modPow with modulus 0");
              }

              var result = createNumberInstance[1];
              var baseMod = this.mod(modulusNum);

              if (exponentNum.isNegative()) {
                exponentNum = exponentNum.multiply(createNumberInstance[-1]);
                baseMod = baseMod.modInv(modulusNum);
              }

              while (exponentNum.isPositive()) {
                if (baseMod.isZero()) {
                  return createNumberInstance[0];
                }
                if (exponentNum.isOdd()) {
                  result = result.multiply(baseMod).mod(modulusNum);
                }
                exponentNum = exponentNum.divide(2);
                baseMod = baseMod.square().mod(modulusNum);
              }
              return result;
            };
            NativeBigIntWrapper.prototype.modPow = TinyNumber.prototype.modPow = HugeNumber.prototype.modPow;

            HugeNumber.prototype.compareAbs = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisVal = this.value;
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ? 1 : compareSegmentArrays(thisVal, otherVal);
            };

            TinyNumber.prototype.compareAbs = function (otherNum) {
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisAbsVal = Math.abs(this.value);
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ?
                thisAbsVal === (otherVal = Math.abs(otherVal)) ? 0 : thisAbsVal > otherVal ? 1 : -1 : -1;
            };

            NativeBigIntWrapper.prototype.compareAbs = function (otherNum) {
              var thisVal = this.value;
              var otherVal = standardizeToBigNumber(otherNum).value;
              thisVal = thisVal >= 0 ? thisVal : -thisVal;
              otherVal = otherVal >= 0 ? otherVal : -otherVal;
              return thisVal === otherVal ? 0 : thisVal > otherVal ? 1 : -1;
            };

            HugeNumber.prototype.compare = function (otherNum) {
              if (otherNum === 1 / 0) {
                return -1;
              }
              if (otherNum === -1 / 0) {
                return 1;
              }
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisVal = this.value;
              var otherVal = otherBigNum.value;
              if (this.sign !== otherBigNum.sign) {
                return otherBigNum.sign ? 1 : -1;
              }
              return otherBigNum.isSmall ?
                (this.sign ? -1 : 1) :
                compareSegmentArrays(thisVal, otherVal) * (this.sign ? -1 : 1);
            };
            HugeNumber.prototype.compareTo = HugeNumber.prototype.compare;

            TinyNumber.prototype.compare = function (otherNum) {
              if (otherNum === 1 / 0) {
                return -1;
              }
              if (otherNum === -1 / 0) {
                return 1;
              }
              var otherBigNum = standardizeToBigNumber(otherNum);
              var thisVal = this.value;
              var otherVal = otherBigNum.value;
              return otherBigNum.isSmall ?
                thisVal === otherVal ? 0 : thisVal > otherVal ? 1 : -1 :
                (thisVal < 0 !== otherBigNum.sign ? (thisVal < 0 ? -1 : 1) : (thisVal < 0 ? 1 : -1));
            };
            TinyNumber.prototype.compareTo = TinyNumber.prototype.compare;

            NativeBigIntWrapper.prototype.compare = function (otherNum) {
              if (otherNum === 1 / 0) {
                return -1;
              }
              if (otherNum === -1 / 0) {
                return 1;
              }
              var thisVal = this.value;
              var otherVal = standardizeToBigNumber(otherNum).value;
              return thisVal === otherVal ? 0 : thisVal > otherVal ? 1 : -1;
            };
            NativeBigIntWrapper.prototype.compareTo = NativeBigIntWrapper.prototype.compare;

            HugeNumber.prototype.equals = function (otherNum) {
              return this.compare(otherNum) === 0;
            };
            NativeBigIntWrapper.prototype.eq = NativeBigIntWrapper.prototype.equals = TinyNumber.prototype.eq = TinyNumber.prototype.equals = HugeNumber.prototype.eq = HugeNumber.prototype.equals;

            HugeNumber.prototype.notEquals = function (otherNum) {
              return this.compare(otherNum) !== 0;
            };
            NativeBigIntWrapper.prototype.neq = NativeBigIntWrapper.prototype.notEquals = TinyNumber.prototype.neq = TinyNumber.prototype.notEquals = HugeNumber.prototype.neq = HugeNumber.prototype.notEquals;

            HugeNumber.prototype.greater = function (otherNum) {
              return this.compare(otherNum) > 0;
            };
            NativeBigIntWrapper.prototype.gt = NativeBigIntWrapper.prototype.greater = TinyNumber.prototype.gt = TinyNumber.prototype.greater = HugeNumber.prototype.gt = HugeNumber.prototype.greater;

            HugeNumber.prototype.lesser = function (otherNum) {
              return this.compare(otherNum) < 0;
            };
            NativeBigIntWrapper.prototype.lt = NativeBigIntWrapper.prototype.lesser = TinyNumber.prototype.lt = TinyNumber.prototype.lesser = HugeNumber.prototype.lt = HugeNumber.prototype.lesser;

            HugeNumber.prototype.greaterOrEquals = function (otherNum) {
              return this.compare(otherNum) >= 0;
            };
            NativeBigIntWrapper.prototype.geq = NativeBigIntWrapper.prototype.greaterOrEquals = TinyNumber.prototype.geq = TinyNumber.prototype.greaterOrEquals = HugeNumber.prototype.geq = HugeNumber.prototype.greaterOrEquals;

            HugeNumber.prototype.lesserOrEquals = function (otherNum) {
              return this.compare(otherNum) <= 0;
            };
            NativeBigIntWrapper.prototype.leq = NativeBigIntWrapper.prototype.lesserOrEquals = TinyNumber.prototype.leq = TinyNumber.prototype.lesserOrEquals = HugeNumber.prototype.leq = HugeNumber.prototype.lesserOrEquals;

            HugeNumber.prototype.isEven = function () {
              return (this.value[0] & 1) === 0;
            };
            TinyNumber.prototype.isEven = function () {
              return (this.value & 1) === 0;
            };
            NativeBigIntWrapper.prototype.isEven = function () {
              return (this.value & BigInt(1)) === BigInt(0);
            };

            HugeNumber.prototype.isOdd = function () {
              return (this.value[0] & 1) === 1;
            };
            TinyNumber.prototype.isOdd = function () {
              return (this.value & 1) === 1;
            };
            NativeBigIntWrapper.prototype.isOdd = function () {
              return (this.value & BigInt(1)) === BigInt(1);
            };

            HugeNumber.prototype.isPositive = function () {
              return !this.sign;
            };
            TinyNumber.prototype.isPositive = function () {
              return this.value > 0;
            };
            NativeBigIntWrapper.prototype.isPositive = TinyNumber.prototype.isPositive;

            HugeNumber.prototype.isNegative = function () {
              return this.sign;
            };
            TinyNumber.prototype.isNegative = function () {
              return this.value < 0;
            };
            NativeBigIntWrapper.prototype.isNegative = TinyNumber.prototype.isNegative;

            HugeNumber.prototype.isUnit = function () {
              return false;
            };
            TinyNumber.prototype.isUnit = function () {
              return Math.abs(this.value) === 1;
            };
            NativeBigIntWrapper.prototype.isUnit = function () {
              return this.abs().value === BigInt(1);
            };

            HugeNumber.prototype.isZero = function () {
              return false;
            };
            TinyNumber.prototype.isZero = function () {
              return this.value === 0;
            };
            NativeBigIntWrapper.prototype.isZero = function () {
              return this.value === BigInt(0);
            };

            HugeNumber.prototype.isDivisibleBy = function (divisorNum) {
              var divisorBig = standardizeToBigNumber(divisorNum);
              return !divisorBig.isZero() &&
                (divisorBig.isUnit() ||
                  (divisorBig.compareAbs(2) === 0 ? this.isEven() : this.mod(divisorBig).isZero()));
            };
            NativeBigIntWrapper.prototype.isDivisibleBy = TinyNumber.prototype.isDivisibleBy = HugeNumber.prototype.isDivisibleBy;

            HugeNumber.prototype.isPrime = function (checkComplexity) {
              var primeCheckResult = testSmallPrimes(this);
              if (primeCheckResult !== undefined) {
                return primeCheckResult;
              }
              var absValue = this.abs();
              var bitLength = absValue.bitLength();
              if (bitLength.toJSNumber() <= 64) {
                return runMillerRabin(absValue, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
              }
              var logN = Math.log(2) * bitLength.toJSNumber();
              var numIterations = Math.ceil(checkComplexity === true ? 2 * Math.pow(logN, 2) : logN);
              var basesForTest = [];
              for (var i = 0; i < numIterations; i++) {
                basesForTest.push(BigNumberFactory(i + 2));
              }
              return runMillerRabin(absValue, basesForTest);
            };
            NativeBigIntWrapper.prototype.isPrime = TinyNumber.prototype.isPrime = HugeNumber.prototype.isPrime;

            HugeNumber.prototype.isProbablePrime = function (iterationsCount) {
              var primeCheckResult = testSmallPrimes(this);
              if (primeCheckResult !== undefined) {
                return primeCheckResult;
              }
              var absValue = this.abs();
              var numIterations = iterationsCount === undefined ? 5 : iterationsCount;
              var randomBases = [];
              for (var i = 0; i < numIterations; i++) {
                randomBases.push(BigNumberFactory.randBetween(2, absValue.minus(2)));
              }
              return runMillerRabin(absValue, randomBases);
            };
            NativeBigIntWrapper.prototype.isProbablePrime = TinyNumber.prototype.isProbablePrime = HugeNumber.prototype.isProbablePrime;

            HugeNumber.prototype.modInv = function (modulusNum) {
              var gcdZero = BigNumberFactory.zero;
              var gcdOne = BigNumberFactory.one;
              var currentModulus = standardizeToBigNumber(modulusNum);
              var currentNumber = this.abs();

              var oldRemainder, newRemainder, oldCoefficient, newCoefficient;

              while (!currentNumber.isZero()) {
                var divisionResult = currentModulus.divide(currentNumber);
                oldRemainder = gcdZero;
                newRemainder = currentModulus;
                gcdZero = gcdOne;
                currentModulus = currentNumber;
                gcdOne = oldRemainder.subtract(divisionResult.multiply(gcdOne));
                currentNumber = newRemainder.subtract(divisionResult.multiply(currentNumber));
              }

              if (!currentModulus.isUnit()) {
                throw new Error(this.toString() + " and " + modulusNum.toString() + " are not co-prime");
              }

              if (gcdOne.compare(0) === -1) {
                gcdOne = gcdOne.add(modulusNum);
              }

              return this.isNegative() ? gcdOne.negate() : gcdOne;
            };
            NativeBigIntWrapper.prototype.modInv = TinyNumber.prototype.modInv = HugeNumber.prototype.modInv;

            HugeNumber.prototype.next = function () {
              var val = this.value;
              return this.sign ?
                subtractSmallValueFromSegments(val, 1, this.sign) :
                new HugeNumber(addSmallValueToSegments(val, 1), this.sign);
            };
            TinyNumber.prototype.next = function () {
              var val = this.value;
              return val + 1 < maxJsSafeInt ?
                new TinyNumber(val + 1) :
                new HugeNumber(maxJsSafeIntSegments, false);
            };
            NativeBigIntWrapper.prototype.next = function () {
              return new NativeBigIntWrapper(this.value + BigInt(1));
            };

            HugeNumber.prototype.prev = function () {
              var val = this.value;
              return this.sign ?
                new HugeNumber(addSmallValueToSegments(val, 1), true) :
                subtractSmallValueFromSegments(val, 1, this.sign);
            };
            TinyNumber.prototype.prev = function () {
              var val = this.value;
              return val - 1 > -maxJsSafeInt ?
                new TinyNumber(val - 1) :
                new HugeNumber(maxJsSafeIntSegments, true);
            };
            NativeBigIntWrapper.prototype.prev = function () {
              return new NativeBigIntWrapper(this.value - BigInt(1));
            };

            for (var powerOfTwoSegments = [1]; 2 * powerOfTwoSegments[powerOfTwoSegments.length - 1] <= segmentBase;) {
              powerOfTwoSegments.push(2 * powerOfTwoSegments[powerOfTwoSegments.length - 1]);
            }
            var powerSegmentLength = powerOfTwoSegments.length;
            var maxPowerSegmentValue = powerOfTwoSegments[powerSegmentLength - 1];

            function isShiftValueValid(shiftVal) {
              return Math.abs(shiftVal) <= segmentBase;
            }

            function executeBitwiseOperation(num1, num2, operationFunc) {
              num1 = standardizeToBigNumber(num1);
              num2 = standardizeToBigNumber(num2);

              var isNum1Negative = num1.isNegative();
              var isNum2Negative = num2.isNegative();

              var absNum1 = isNum1Negative ? num1.not() : num1;
              var absNum2 = isNum2Negative ? num2.not() : num2;

              var num1SegmentVal, num2SegmentVal,
                quotient1, remainder1, quotient2, remainder2,
                resultSegments = [];

              while (!absNum1.isZero() || !absNum2.isZero()) {
                remainder1 = performDivision(absNum1, maxPowerSegmentValue)[1].toJSNumber();
                isNum1Negative && (remainder1 = maxPowerSegmentValue - 1 - remainder1);

                remainder2 = performDivision(absNum2, maxPowerSegmentValue)[1].toJSNumber();
                isNum2Negative && (remainder2 = maxPowerSegmentValue - 1 - remainder2);

                absNum1 = performDivision(absNum1, maxPowerSegmentValue)[0];
                absNum2 = performDivision(absNum2, maxPowerSegmentValue)[0];

                resultSegments.push(operationFunc(remainder1, remainder2));
              }

              var finalResultSign = operationFunc(isNum1Negative ? 1 : 0, isNum2Negative ? 1 : 0) !== 0 ?
                BigNumberFactory(-1) :
                BigNumberFactory(0);

              for (var i = resultSegments.length - 1; i >= 0; i--) {
                finalResultSign = finalResultSign.multiply(maxPowerSegmentValue).add(BigNumberFactory(resultSegments[i]));
              }
              return finalResultSign;
            }

            HugeNumber.prototype.shiftLeft = function (shiftAmount) {
              var shiftNum = standardizeToBigNumber(shiftAmount).toJSNumber();
              if (!isShiftValueValid(shiftNum)) {
                throw new Error(String(shiftNum) + " is too large for shifting.");
              }
              if (shiftNum < 0) {
                return this.shiftRight(-shiftNum);
              }

              var currentNum = this;
              if (currentNum.isZero()) {
                return currentNum;
              }

              for (; shiftNum >= powerSegmentLength;) {
                currentNum = currentNum.multiply(maxPowerSegmentValue);
                shiftNum -= powerSegmentLength - 1;
              }
              return currentNum.multiply(powerOfTwoSegments[shiftNum]);
            };
            NativeBigIntWrapper.prototype.shiftLeft = TinyNumber.prototype.shiftLeft = HugeNumber.prototype.shiftLeft;

            HugeNumber.prototype.shiftRight = function (shiftAmount) {
              var quotientResult,
                shiftNum = standardizeToBigNumber(shiftAmount).toJSNumber();
              if (!isShiftValueValid(shiftNum)) {
                throw new Error(String(shiftNum) + " is too large for shifting.");
              }
              if (shiftNum < 0) {
                return this.shiftLeft(-shiftNum);
              }

              var currentNum = this;

              for (; shiftNum >= powerSegmentLength;) {
                if (currentNum.isZero() || (currentNum.isNegative() && currentNum.isUnit())) {
                  return currentNum;
                }
                quotientResult = performDivision(currentNum, maxPowerSegmentValue);
                currentNum = quotientResult[1].isNegative() ? quotientResult[0].prev() : quotientResult[0];
                shiftNum -= powerSegmentLength - 1;
              }

              quotientResult = performDivision(currentNum, powerOfTwoSegments[shiftNum]);
              return quotientResult[1].isNegative() ? quotientResult[0].prev() : quotientResult[0];
            };
            NativeBigIntWrapper.prototype.shiftRight = TinyNumber.prototype.shiftRight = HugeNumber.prototype.shiftRight;

            HugeNumber.prototype.not = function () {
              return this.negate().prev();
            };
            NativeBigIntWrapper.prototype.not = TinyNumber.prototype.not = HugeNumber.prototype.not;

            HugeNumber.prototype.and = function (otherNum) {
              return executeBitwiseOperation(this, otherNum, function (a, b) {
                return a & b;
              });
            };
            NativeBigIntWrapper.prototype.and = TinyNumber.prototype.and = HugeNumber.prototype.and;

            HugeNumber.prototype.or = function (otherNum) {
              return executeBitwiseOperation(this, otherNum, function (a, b) {
                return a | b;
              });
            };
            NativeBigIntWrapper.prototype.or = TinyNumber.prototype.or = HugeNumber.prototype.or;

            HugeNumber.prototype.xor = function (otherNum) {
              return executeBitwiseOperation(this, otherNum, function (a, b) {
                return a ^ b;
              });
            };
            NativeBigIntWrapper.prototype.xor = TinyNumber.prototype.xor = HugeNumber.prototype.xor;

            var bitwiseMaskOne = 1 << 30;
            var bitwiseMaskTwo = (segmentBase & -segmentBase) * (segmentBase & -segmentBase) | bitwiseMaskOne;

            function getLowestSetBitValue(numObj) {
              var numValue = numObj.value;
              var lowestBit;
              if (typeof numValue === "number") {
                lowestBit = numValue | bitwiseMaskOne;
              } else if (typeof numValue === "bigint") {
                lowestBit = numValue | BigInt(bitwiseMaskOne);
              } else {
                lowestBit = numValue[0] + numValue[1] * segmentBase | bitwiseMaskTwo;
              }
              return lowestBit & -lowestBit;
            }

            function findLargerNumber(num1, num2) {
              num1 = standardizeToBigNumber(num1);
              num2 = standardizeToBigNumber(num2);
              return num1.greater(num2) ? num1 : num2;
            }

            function findSmallerNumber(num1, num2) {
              num1 = standardizeToBigNumber(num1);
              num2 = standardizeToBigNumber(num2);
              return num1.lesser(num2) ? num1 : num2;
            }

            function computeGreatestCommonDivisor(num1, num2) {
              num1 = standardizeToBigNumber(num1).abs();
              num2 = standardizeToBigNumber(num2).abs();

              if (num1.equals(num2)) {
                return num1;
              }
              if (num1.isZero()) {
                return num2;
              }
              if (num2.isZero()) {
                return num1;
              }

              var commonFactor = createNumberInstance[1];
              var tempNum;

              while (num1.isEven() && num2.isEven()) {
                tempNum = findSmallerNumber(getLowestSetBitValue(num1), getLowestSetBitValue(num2));
                num1 = num1.divide(tempNum);
                num2 = num2.divide(tempNum);
                commonFactor = commonFactor.multiply(tempNum);
              }

              while (num1.isEven()) {
                num1 = num1.divide(getLowestSetBitValue(num1));
              }

              do {
                while (num2.isEven()) {
                  num2 = num2.divide(getLowestSetBitValue(num2));
                }
                if (num1.greater(num2)) {
                  tempNum = num2;
                  num2 = num1;
                  num1 = tempNum;
                }
                num2 = num2.subtract(num1);
              } while (!num2.isZero());

              return commonFactor.isUnit() ? num1 : num1.multiply(commonFactor);
            }

            HugeNumber.prototype.bitLength = function () {
              var currentBigNum = this;
              if (currentBigNum.compareTo(BigNumberFactory(0)) < 0) {
                currentBigNum = currentBigNum.negate().subtract(BigNumberFactory(1));
              }
              if (currentBigNum.compareTo(BigNumberFactory(0)) === 0) {
                return BigNumberFactory(0);
              }

              function calculateBitLengthRecursive(numVal, powerOfTwo) {
                if (powerOfTwo.compareTo(numVal) <= 0) {
                  var result = calculateBitLengthRecursive(numVal, powerOfTwo.square(powerOfTwo));
                  var product = result.product.multiply(powerOfTwo);
                  return product.compareTo(numVal) <= 0 ?
                    {
                      product: product,
                      exponent: 2 * result.exponent + 1
                    } :
                    {
                      product: result.product,
                      exponent: 2 * result.exponent
                    };
                }
                return {
                  product: BigNumberFactory(1),
                  exponent: 0
                };
              }

              return BigNumberFactory(calculateBitLengthRecursive(currentBigNum, BigNumberFactory(2)).exponent).add(BigNumberFactory(1));
            };
            NativeBigIntWrapper.prototype.bitLength = TinyNumber.prototype.bitLength = HugeNumber.prototype.bitLength;

            var parseCustomBaseString = function (numString, baseValue, customDigits, caseSensitive) {
              customDigits = customDigits || baseAlphabet;
              numString = String(numString);
              caseSensitive || ((numString = numString.toLowerCase()), (customDigits = customDigits.toLowerCase()));

              var charIndex,
                stringLength = numString.length,
                absBase = Math.abs(baseValue),
                digitMap = {};

              for (charIndex = 0; charIndex < customDigits.length; charIndex++) {
                digitMap[customDigits[charIndex]] = charIndex;
              }

              for (charIndex = 0; charIndex < stringLength; charIndex++) {
                var currentCharacter = numString[charIndex];
                if (currentCharacter !== "-") {
                  if (currentCharacter in digitMap && digitMap[currentCharacter] >= absBase) {
                    if (currentCharacter === "1" && absBase === 1) {
                      continue;
                    }
                    throw new Error(currentCharacter + " is not a valid digit in base " + baseValue + ".");
                  }
                }
              }

              baseValue = standardizeToBigNumber(baseValue);
              var digitValueArray = [];
              var isNegative = numString[0] === "-";

              for (charIndex = isNegative ? 1 : 0; charIndex < numString.length; charIndex++) {
                var currentCharacter = numString[charIndex];
                if (currentCharacter in digitMap) {
                  digitValueArray.push(standardizeToBigNumber(digitMap[currentCharacter]));
                } else {
                  if (currentCharacter !== "<") {
                    throw new Error(currentCharacter + " is not a valid character");
                  }
                  var startIndex = charIndex;
                  do {
                    charIndex++;
                  } while (numString[charIndex] !== ">" && charIndex < numString.length);
                  digitValueArray.push(standardizeToBigNumber(numString.slice(startIndex + 1, charIndex)));
                }
              }
              return convertSegmentsToBigNumber(digitValueArray, baseValue, isNegative);
            };

            function convertSegmentsToBigNumber(digitArray, baseValue, isNegativeResult) {
              var accumulator = createNumberInstance[0];
              var multiplier = createNumberInstance[1];
              for (var i = digitArray.length - 1; i >= 0; i--) {
                accumulator = accumulator.add(digitArray[i].times(multiplier));
                multiplier = multiplier.times(baseValue);
              }
              return isNegativeResult ? accumulator.negate() : accumulator;
            }

            function convertBigNumberToSegments(bigNum, targetBase) {
              targetBase = BigNumberFactory(targetBase);

              if (targetBase.isZero()) {
                if (bigNum.isZero()) {
                  return {
                    value: [0],
                    isNegative: false
                  };
                }
                throw new Error("Cannot convert nonzero numbers to base 0.");
              }

              if (targetBase.equals(-1)) {
                if (bigNum.isZero()) {
                  return {
                    value: [0],
                    isNegative: false
                  };
                }
                if (bigNum.isNegative()) {
                  return {
                    value: [].concat.apply(
                      [],
                      Array(bigNum.toJSNumber()).fill([1, 0])
                    ),
                    isNegative: false
                  };
                }
                var resultArr = Array(bigNum.toJSNumber() - 1).fill([0, 1]);
                resultArr.unshift([1]);
                return {
                  value: [].concat.apply([], resultArr),
                  isNegative: false
                };
              }

              var isResultNegative = false;
              if (bigNum.isNegative() && targetBase.isPositive()) {
                isResultNegative = true;
                bigNum = bigNum.abs();
              }

              if (targetBase.isUnit()) {
                return bigNum.isZero() ?
                  {
                    value: [0],
                    isNegative: false
                  } :
                  {
                    value: Array(bigNum.toJSNumber()).fill(1),
                    isNegative: isResultNegative
                  };
              }

              var divisionResult,
                segments = [],
                currentNumber = bigNum;

              while (currentNumber.isNegative() || currentNumber.compareAbs(targetBase) >= 0) {
                divisionResult = currentNumber.divmod(targetBase);
                currentNumber = divisionResult.quotient;
                var remainder = divisionResult.remainder;
                if (remainder.isNegative()) {
                  remainder = targetBase.minus(remainder).abs();
                  currentNumber = currentNumber.next();
                }
                segments.push(remainder.toJSNumber());
              }
              segments.push(currentNumber.toJSNumber());
              return {
                value: segments.reverse(),
                isNegative: isResultNegative
              };
            }

            function formatBigNumberToString(bigNum, targetBase, customDigits) {
              var conversionResult = convertBigNumberToSegments(bigNum, targetBase);
              return (conversionResult.isNegative ? "-" : "") +
                conversionResult.value
                .map(function (digitVal) {
                  return (function (digit, charSet) {
                    charSet = charSet || baseAlphabet;
                    return digit < charSet.length ? charSet[digit] : "<" + digit + ">";
                  })(digitVal, customDigits);
                })
                .join("");
            }

            function parseDecimalString(decimalString) {
              if (isWithinSafeRange(+decimalString)) {
                var numVal = +decimalString;
                if (numVal === roundToInteger(numVal)) {
                  return isNativeBigIntSupported ?
                    new NativeBigIntWrapper(BigInt(numVal)) :
                    new TinyNumber(numVal);
                }
                throw new Error("Invalid integer: " + decimalString);
              }

              var isNegative = decimalString[0] === "-";
              isNegative && (decimalString = decimalString.slice(1));

              var parts = decimalString.split(/e/i);
              if (parts.length > 2) {
                throw new Error("Invalid integer: " + parts.join("e"));
              }

              if (parts.length === 2) {
                var exponentPart = parts[1];
                if (exponentPart[0] === "+") {
                  exponentPart = exponentPart.slice(1);
                }
                if ((exponentPart = +exponentPart) !== roundToInteger(exponentPart) || !isWithinSafeRange(exponentPart)) {
                  throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
                }
                var mantissaPart = parts[0];
                var decimalPointIndex = mantissaPart.indexOf(".");
                if (decimalPointIndex >= 0) {
                  exponentPart -= mantissaPart.length - decimalPointIndex - 1;
                  mantissaPart = mantissaPart.slice(0, decimalPointIndex) + mantissaPart.slice(decimalPointIndex + 1);
                }
                if (exponentPart < 0) {
                  throw new Error("Cannot include negative exponent part for integers");
                }
                decimalString = mantissaPart + Array(exponentPart + 1).join("0");
              }

              if (!/^([0-9][0-9]*)$/.test(decimalString)) {
                throw new Error("Invalid integer: " + decimalString);
              }

              if (isNativeBigIntSupported) {
                return new NativeBigIntWrapper(BigInt(isNegative ? "-" + decimalString : decimalString));
              }

              var segments = [];
              var stringLength = decimalString.length;
              var currentChunkSize = segmentDigitsCount;
              var currentEnd = stringLength - currentChunkSize;

              while (stringLength > 0) {
                segments.push(+decimalString.slice(currentEnd, stringLength));
                currentEnd -= currentChunkSize;
                currentEnd < 0 && (currentEnd = 0);
                stringLength -= currentChunkSize;
              }
              trimArrayEndZeros(segments);
              return new HugeNumber(segments, isNegative);
            }

            function standardizeToBigNumber(input) {
              if (typeof input === "number") {
                if (isNativeBigIntSupported) {
                  return new NativeBigIntWrapper(BigInt(input));
                }
                if (isWithinSafeRange(input)) {
                  if (input !== roundToInteger(input)) {
                    throw new Error(input + " is not an integer.");
                  }
                  return new TinyNumber(input);
                }
                return parseDecimalString(input.toString());
              }
              if (typeof input === "string") {
                return parseDecimalString(input);
              }
              if (typeof input === "bigint") {
                return new NativeBigIntWrapper(input);
              }
              return input;
            }

            HugeNumber.prototype.toArray = function (targetBase) {
              return convertBigNumberToSegments(this, targetBase);
            };
            TinyNumber.prototype.toArray = function (targetBase) {
              return convertBigNumberToSegments(this, targetBase);
            };
            NativeBigIntWrapper.prototype.toArray = function (targetBase) {
              return convertBigNumberToSegments(this, targetBase);
            };

            HugeNumber.prototype.toString = function (targetBase, customDigits) {
              if (targetBase === undefined) {
                targetBase = 10;
              }
              if (targetBase !== 10) {
                return formatBigNumberToString(this, targetBase, customDigits);
              }

              var stringParts = [];
              var segmentArray = this.value;
              var arrayLength = segmentArray.length;
              var currentString = String(segmentArray[--arrayLength]);

              while (--arrayLength >= 0) {
                var segmentStr = String(segmentArray[arrayLength]);
                currentString += "0000000".slice(segmentStr.length) + segmentStr;
              }
              return (this.sign ? "-" : "") + currentString;
            };

            TinyNumber.prototype.toString = function (targetBase, customDigits) {
              if (targetBase === undefined) {
                targetBase = 10;
              }
              return targetBase !== 10 ?
                formatBigNumberToString(this, targetBase, customDigits) :
                String(this.value);
            };
            NativeBigIntWrapper.prototype.toString = TinyNumber.prototype.toString;

            NativeBigIntWrapper.prototype.toJSON = HugeNumber.prototype.toJSON = TinyNumber.prototype.toJSON = function () {
              return this.toString();
            };

            HugeNumber.prototype.valueOf = function () {
              return parseInt(this.toString(), 10);
            };
            HugeNumber.prototype.toJSNumber = HugeNumber.prototype.valueOf;

            TinyNumber.prototype.valueOf = function () {
              return this.value;
            };
            TinyNumber.prototype.toJSNumber = TinyNumber.prototype.valueOf;

            NativeBigIntWrapper.prototype.valueOf = NativeBigIntWrapper.prototype.toJSNumber = function () {
              return parseInt(this.toString(), 10);
            };

            for (var cachedSmallNumberIndex = 0; cachedSmallNumberIndex < 1000; cachedSmallNumberIndex++) {
              createNumberInstance[cachedSmallNumberIndex] = standardizeToBigNumber(cachedSmallNumberIndex);
              if (cachedSmallNumberIndex > 0) {
                createNumberInstance[-cachedSmallNumberIndex] = standardizeToBigNumber(-cachedSmallNumberIndex);
              }
            }

            createNumberInstance.one = createNumberInstance[1];
            createNumberInstance.zero = createNumberInstance[0];
            createNumberInstance.minusOne = createNumberInstance[-1];
            createNumberInstance.max = findLargerNumber;
            createNumberInstance.min = findSmallerNumber;
            createNumberInstance.gcd = computeGreatestCommonDivisor;
            createNumberInstance.lcm = function (num1, num2) {
              num1 = standardizeToBigNumber(num1).abs();
              num2 = standardizeToBigNumber(num2).abs();
              return num1.divide(computeGreatestCommonDivisor(num1, num2)).multiply(num2);
            };
            createNumberInstance.isInstance = function (obj) {
              return obj instanceof HugeNumber || obj instanceof TinyNumber || obj instanceof NativeBigIntWrapper;
            };
            createNumberInstance.randBetween = function (lowerBound, upperBound) {
              var minVal = findSmallerNumber((lowerBound = standardizeToBigNumber(lowerBound)), (upperBound = standardizeToBigNumber(upperBound)));
              var range = findLargerNumber(lowerBound, upperBound).subtract(minVal).add(1);

              if (range.isSmall) {
                return minVal.add(Math.floor(Math.random() * range));
              }

              var rangeSegments = convertBigNumberToSegments(range, segmentBase).value;
              var randomSegments = [];
              var isPrecise = true;

              for (var i = 0; i < rangeSegments.length; i++) {
                var limit = isPrecise ? rangeSegments[i] : segmentBase;
                var randomNum = roundToInteger(Math.random() * limit);
                randomSegments.push(randomNum);
                if (randomNum < limit) {
                  isPrecise = false;
                }
              }
              return minVal.add(createNumberInstance.fromArray(randomSegments, segmentBase, false));
            };
            createNumberInstance.fromArray = function (segmentArray, base, isNegative) {
              return convertSegmentsToBigNumber(
                segmentArray.map(standardizeToBigNumber),
                standardizeToBigNumber(base || 10),
                isNegative
              );
            };

            return createNumberInstance;
          })();

        if (moduleContext.hasOwnProperty("exports")) {
          moduleContext.exports = BigNumberFactory;
        }

        if (
          (moduleResult = (function () {
            return BigNumberFactory;
          }.apply(exportsObject, []))) !== undefined
        ) {
          moduleContext.exports = moduleResult;
        }
      }).call(this, moduleRequester(3)(currentModule));
    },

    function (moduleObject, moduleExportsRef) {
      moduleObject.exports = function (currentModuleContext) {
        if (!currentModuleContext.bundlerPolyfillFlag) {
          currentModuleContext.deprecateMethod = function () {};
          currentModuleContext.resolutionPaths = [];
          currentModuleContext.childModuleList || (currentModuleContext.childModuleList = []);
          Object.defineProperty(currentModuleContext, "loaded", {
            enumerable: true,
            get: function () {
              return currentModuleContext.isLoadedIndicator;
            },
          });
          Object.defineProperty(currentModuleContext, "id", {
            enumerable: true,
            get: function () {
              return currentModuleContext.moduleIdValue;
            },
          });
          currentModuleContext.bundlerPolyfillFlag = 1;
        }
        return currentModuleContext;
      };
    },

    function (fileSystemModule, fileSystemExports) {
      fileSystemModule.exports = require("fs");
    },
  ]
);