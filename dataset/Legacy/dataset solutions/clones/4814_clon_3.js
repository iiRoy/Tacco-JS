module.exports = function(allModuleDefinitions) {
    let loadedModuleInstances = {};

    function obtainModuleExports(moduleId) {
        if (loadedModuleInstances[moduleId]) {
            return loadedModuleInstances[moduleId].exports;
        }

        let currentModule = loadedModuleInstances[moduleId] = {
            id: moduleId,
            isLoaded: false,
            exports: {}
        };

        allModuleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, obtainModuleExports);

        currentModule.isLoaded = true;
        return currentModule.exports;
    }

    obtainModuleExports.moduleDefinitions = allModuleDefinitions;
    obtainModuleExports.moduleCache = loadedModuleInstances;

    obtainModuleExports.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        // Check if property exists before defining to avoid errors on non-configurable properties.
        if (!obtainModuleExports.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    obtainModuleExports.registerEsModule = function(moduleExportsObject) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(moduleExportsObject, "__esModule", {
            value: true
        });
    };

    obtainModuleExports.getInteropDefault = function(targetModule, flags) {
        if (flags & 1) {
            targetModule = obtainModuleExports(targetModule);
        }
        if (flags & 8) {
            return targetModule;
        }
        if (flags & 4 && typeof targetModule === "object" && targetModule && targetModule.__esModule) {
            return targetModule;
        }

        let interopObject = Object.create(null);
        obtainModuleExports.registerEsModule(interopObject);
        Object.defineProperty(interopObject, "default", {
            enumerable: true,
            value: targetModule
        });
        if (flags & 2 && typeof targetModule !== "string") {
            for (let propName in targetModule) {
                if (propName !== "default" && obtainModuleExports.checkOwnProperty(targetModule, propName)) {
                    obtainModuleExports.defineExportProperty(interopObject, propName, ((key) => targetModule[key]).bind(null, propName));
                }
            }
        }
        return interopObject;
    };

    obtainModuleExports.commonJsInterop = function(moduleObject) {
        let defaultGetter = moduleObject && moduleObject.__esModule ?
            () => moduleObject.default :
            () => moduleObject;
        obtainModuleExports.defineExportProperty(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    obtainModuleExports.checkOwnProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    obtainModuleExports.publicPath = "";

    return obtainModuleExports(obtainModuleExports.mainEntryPoint = 0);
}([
    function(currentEntryModule, entryModuleExports, entryRequireFunction) {
        const INPUT_ENCODING_TYPE = "UTF-8";
        const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

        try {
            const fileSystemModule = entryRequireFunction(3);
            if (!fileSystemModule || typeof fileSystemModule.readFileSync !== 'function') {
                console.error("Critical Error: File system utility not available.");
                return;
            }

            const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, INPUT_ENCODING_TYPE);
            const processedInputLines = String(rawInputContent).split("\n");

            if (!processedInputLines || processedInputLines.length === 0 || processedInputLines.every(line => line.trim() === '')) {
                console.error("Warning: No meaningful input lines provided. Exiting.");
                entryRequireFunction(1)(["0", ""]); // Provide minimal empty input to prevent crashes.
                return;
            }

            entryRequireFunction(1)(processedInputLines);
        } catch (inputOperationError) {
            console.error(`An error occurred during input processing: ${inputOperationError.message}`);
        }
    },
    function(calcModule, calcExports, calcRequire) {
        const BigNumberProcessor = calcRequire(2);
        const MOD_VALUE = 1000000007;
        const ERROR_RESULT_VALUE = 0;

        calcExports = function(rawInputLines) {
            if (!Array.isArray(rawInputLines) || rawInputLines.length < 2) {
                console.log(ERROR_RESULT_VALUE);
                return;
            }

            const inputCount = parseInt(rawInputLines[0].trim(), 10);
            if (isNaN(inputCount) || inputCount < 0) {
                console.log(ERROR_RESULT_VALUE);
                return;
            }

            let numericalSequence = rawInputLines[1].split(" ").map(val => parseInt(val.trim(), 10));
            numericalSequence = numericalSequence.filter(val => !isNaN(val));

            if (numericalSequence.length !== inputCount) {
                console.log(ERROR_RESULT_VALUE);
                return;
            }

            numericalSequence.sort((valA, valB) => valA - valB);

            let calculatedResult = new BigNumberProcessor(1);

            const isPairValid = (startIndex, expectedVal) => {
                const firstElement = numericalSequence[startIndex];
                const secondElement = numericalSequence[startIndex + 1];
                return firstElement === expectedVal && secondElement === expectedVal;
            };

            const processPairs = (startIndex, endIndex, step) => {
                for (let i = startIndex; i < endIndex; i += step) {
                    if (!isPairValid(i, i + 1)) {
                        console.log(ERROR_RESULT_VALUE);
                        return true; // Indicate an error occurred.
                    }
                    calculatedResult = calculatedResult.times(2).mod(MOD_VALUE);
                }
                return false; // No error.
            };

            if (inputCount % 2 === 0) {
                if (processPairs(0, inputCount - 1, 2)) return;
            } else {
                if (numericalSequence[0] !== 0) {
                    console.log(ERROR_RESULT_VALUE);
                    return;
                }
                if (processPairs(1, inputCount - 1, 2)) return;
            }

            console.log(calculatedResult.toString());
        };
    },
    function(numericModule, numericExports, numRequire) {
        var libraryContext;
        var scientificNotationRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
        var ceilFunc = Math.ceil;
        var floorFunc = Math.floor;
        var errorMessages = "[PreciseNum Error] ";
        var significantDigitsWarning = errorMessages + "Number primitive has more than 15 significant digits: ";
        var internalCoefficientBase = 1e14;
        var coefficientDigitsCount = 14;
        var javascriptMaxSafeInteger = 9007199254740991;
        var precomputedPowersOfTen = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
        var lowBaseValue = 1e7;
        var highBaseValue = 1e9;

        function truncateToInteger(value) {
            var intValue = 0 | value;
            return value > 0 || value === intValue ? intValue : intValue - 1;
        }

        function convertCoefficientArrayToString(coefficientArray) {
            var idx = 0,
                arrayLength = coefficientArray.length,
                resultString = coefficientArray[0] + "";
            while (++idx < arrayLength) {
                var chunkStr = coefficientArray[idx] + "",
                    paddingLength = coefficientDigitsCount - chunkStr.length;
                for (; paddingLength--; chunkStr = "0" + chunkStr);
                resultString += chunkStr;
            }
            for (arrayLength = resultString.length; 48 === resultString.charCodeAt(--arrayLength););
            return resultString.slice(0, arrayLength + 1 || 1);
        }

        function comparePreciseNumbers(numA, numB) {
            var coeffsA = numA.coefficients,
                coeffsB = numB.coefficients,
                signA = numA.sign,
                signB = numB.sign,
                expA = numA.exponent,
                expB = numB.exponent;

            if (!signA || !signB) return null;

            var isZeroA = coeffsA && !coeffsA[0],
                isZeroB = coeffsB && !coeffsB[0];
            if (isZeroA || isZeroB) return isZeroA ? isZeroB ? 0 : -signB : signA;

            if (signA !== signB) return signA;

            var isNegativeResult = signA < 0;
            var exponentsEqual = expA === expB;

            if (!coeffsA || !coeffsB) return exponentsEqual ? 0 : !coeffsA ^ isNegativeResult ? 1 : -1;

            if (!exponentsEqual) return expA > expB ^ isNegativeResult ? 1 : -1;

            var minCoeffLength = (expA = coeffsA.length) < (expB = coeffsB.length) ? expA : expB;
            for (signB = 0; signB < minCoeffLength; signB++) {
                if (coeffsA[signB] !== coeffsB[signB]) return coeffsA[signB] > coeffsB[signB] ^ isNegativeResult ? 1 : -1;
            }
            return expA === expB ? 0 : expA > expB ^ isNegativeResult ? 1 : -1;
        }

        function validateNumericRange(value, min, max, argName) {
            if (value < min || value > max || value !== floorFunc(value)) {
                throw Error(errorMessages + (argName || "Argument") + (typeof value === "number" ? value < min || value > max ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(value));
            }
        }

        function checkOddParity(numInstance) {
            var lastCoeffIdx = numInstance.coefficients.length - 1;
            return truncateToInteger(numInstance.exponent / coefficientDigitsCount) === lastCoeffIdx && numInstance.coefficients[lastCoeffIdx] % 2 !== 0;
        }

        function formatToScientific(numString, exponent) {
            return (numString.length > 1 ? numString.charAt(0) + "." + numString.slice(1) : numString) + (exponent < 0 ? "e" : "e+") + exponent;
        }

        function insertDecimalPoint(numString, exponent, zeroChar) {
            var len, i;
            if (exponent < 0) {
                for (i = zeroChar + "."; ++exponent; i += zeroChar);
                numString = i + numString;
            } else if (++exponent > (len = numString.length)) {
                for (i = zeroChar, exponent -= len; --exponent; i += zeroChar);
                numString += i;
            } else if (exponent < len) {
                numString = numString.slice(0, exponent) + "." + numString.slice(exponent);
            }
            return numString;
        }

        libraryContext = (function createPreciseNumber(configObject) {
            var PreciseNumberConstructor = function(value, base) {
                var parsedString,
                    isPrimitiveNumber,
                    decimalPosition,
                    leadingZeroTrimIndex,
                    trailingZeroTrimIndex,
                    currentStringLength,
                    effectiveExponent,
                    currentCoefficientChunk,
                    paddingCount,
                    tempVar;

                let self = this;

                if (base == null) {
                    if (value && true === value._isPreciseNumber) {
                        self.sign = value.sign;
                        if (!value.coefficients || value.exponent > defaultMaxExp) {
                            self.coefficients = self.exponent = null;
                        } else if (value.exponent < defaultMinExp) {
                            self.coefficients = [self.exponent = 0];
                        } else {
                            self.exponent = value.exponent;
                            self.coefficients = value.coefficients.slice();
                        }
                        return;
                    }

                    if ((isPrimitiveNumber = typeof value === "number") && value * 0 === 0) {
                        self.sign = 1 / value < 0 ? (value = -value, -1) : 1;
                        if (value === ~~value) {
                            for (effectiveExponent = 0, tempVar = value; tempVar >= 10; tempVar /= 10, effectiveExponent++);
                            return void(effectiveExponent > defaultMaxExp ? self.coefficients = self.exponent = null : (self.exponent = effectiveExponent, self.coefficients = [value]));
                        }
                        parsedString = String(value);
                    } else {
                        parsedString = String(value);
                        if (!scientificNotationRegex.test(parsedString)) {
                            return initializeInvalidPreciseNumber(self, parsedString, isPrimitiveNumber);
                        }
                        self.sign = 45 === parsedString.charCodeAt(0) ? (parsedString = parsedString.slice(1), -1) : 1;
                    }

                    (decimalPosition = parsedString.indexOf(".")) > -1 && (parsedString = parsedString.replace(".", ""));
                    (tempVar = parsedString.search(/e/i)) > 0 ? (decimalPosition < 0 && (decimalPosition = tempVar), decimalPosition += +parsedString.slice(tempVar + 1), parsedString = parsedString.substring(0, tempVar)) : decimalPosition < 0 && (decimalPosition = parsedString.length);
                } else {
                    validateNumericRange(base, 2, baseConversionAlphabet.length, "Base");
                    if (10 === base) return roundPreciseNumber(self = new PreciseNumber(value), defaultDecimalPlaces + self.exponent + 1, defaultRoundingMode);

                    parsedString = String(value);
                    isPrimitiveNumber = typeof value === "number";

                    if (isPrimitiveNumber) {
                        if (value * 0 !== 0) return initializeInvalidPreciseNumber(self, parsedString, isPrimitiveNumber, base);
                        self.sign = 1 / value < 0 ? (parsedString = parsedString.slice(1), -1) : 1;
                        if (PreciseNumber.DEBUG && parsedString.replace(/^0\.0*|\./, "").length > 15) throw Error(significantDigitsWarning + value);
                    } else {
                        self.sign = 45 === parsedString.charCodeAt(0) ? (parsedString = parsedString.slice(1), -1) : 1;
                    }

                    let validChars = baseConversionAlphabet.slice(0, base);
                    let decimalFound = false;
                    let lastDecimalScanPosition = 0;
                    for (tempVar = 0, currentStringLength = parsedString.length; tempVar < currentStringLength; tempVar++) {
                        let char = parsedString.charAt(tempVar);
                        if (validChars.indexOf(char) < 0) {
                            if ("." === char) {
                                if (tempVar > lastDecimalScanPosition) {
                                    lastDecimalScanPosition = currentStringLength;
                                    continue;
                                }
                            } else if (!decimalFound && (parsedString === parsedString.toUpperCase() && (parsedString = parsedString.toLowerCase()) || parsedString === parsedString.toLowerCase() && (parsedString = parsedString.toUpperCase()))) {
                                decimalFound = true;
                                tempVar = -1;
                                lastDecimalScanPosition = 0;
                                continue;
                            }
                            return initializeInvalidPreciseNumber(self, String(value), isPrimitiveNumber, base);
                        }
                    }

                    isPrimitiveNumber = false;
                    (decimalPosition = (parsedString = convertAnyBase(parsedString, base, 10, self.sign)).indexOf(".")) > -1 ? parsedString = parsedString.replace(".", "") : decimalPosition = parsedString.length;
                }

                for (leadingZeroTrimIndex = 0; 48 === parsedString.charCodeAt(leadingZeroTrimIndex); leadingZeroTrimIndex++);
                for (trailingZeroTrimIndex = parsedString.length; 48 === parsedString.charCodeAt(--trailingZeroTrimIndex););

                if (parsedString = parsedString.slice(leadingZeroTrimIndex, ++trailingZeroTrimIndex)) {
                    if (trailingZeroTrimIndex -= leadingZeroTrimIndex, isPrimitiveNumber && PreciseNumber.DEBUG && trailingZeroTrimIndex > 15 && (value > javascriptMaxSafeInteger || value !== floorFunc(value))) throw Error(significantDigitsWarning + self.sign * value);
                    if ((effectiveExponent = decimalPosition - leadingZeroTrimIndex - 1) > defaultMaxExp) self.coefficients = self.exponent = null;
                    else if (effectiveExponent < defaultMinExp) self.coefficients = [self.exponent = 0];
                    else {
                        self.exponent = effectiveExponent;
                        self.coefficients = [];
                        currentCoefficientChunk = (effectiveExponent + 1) % coefficientDigitsCount;
                        effectiveExponent < 0 && (currentCoefficientChunk += coefficientDigitsCount);
                        if (currentCoefficientChunk < trailingZeroTrimIndex) {
                            currentCoefficientChunk && self.coefficients.push(+parsedString.slice(0, currentCoefficientChunk));
                            for (trailingZeroTrimIndex -= coefficientDigitsCount; currentCoefficientChunk < trailingZeroTrimIndex; self.coefficients.push(+parsedString.slice(currentCoefficientChunk, currentCoefficientChunk += coefficientDigitsCount)));
                            currentCoefficientChunk = coefficientDigitsCount - (parsedString = parsedString.slice(currentCoefficientChunk)).length;
                        } else {
                            currentCoefficientChunk -= trailingZeroTrimIndex;
                        }
                        for (; currentCoefficientChunk--; parsedString += "0");
                        self.coefficients.push(+parsedString);
                    }
                } else self.coefficients = [self.exponent = 0];
            };

            var prototypeMethods = PreciseNumberConstructor.prototype = {
                constructor: PreciseNumberConstructor,
                toString: null,
                valueOf: null
            };
            var onePrecise = new PreciseNumberConstructor(1);
            var defaultDecimalPlaces = 20;
            var defaultRoundingMode = 4;
            var defaultMinExp = -7;
            var defaultMaxExp = 21;
            var defaultMinRange = -1e7;
            var defaultMaxRange = 1e7;
            var isCryptoEnabled = false;
            var defaultModuloMode = 1;
            var defaultPowPrecision = 0;
            var defaultFormatOptions = {
                prefix: "",
                groupSize: 3,
                secondaryGroupSize: 0,
                groupSeparator: ",",
                decimalSeparator: ".",
                fractionGroupSize: 0,
                fractionGroupSeparator: " ",
                suffix: ""
            };
            var baseConversionAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

            function formatPreciseNumber(numInstance, decimalPlaces, roundingMode, formatType) {
                var firstCoeff, exponentVal, formattedStr, strLength;

                if (roundingMode == null) roundingMode = defaultRoundingMode;
                validateNumericRange(roundingMode, 0, 8);

                if (!numInstance.coefficients) return numInstance.toString();

                firstCoeff = numInstance.coefficients[0];
                exponentVal = numInstance.exponent;

                if (decimalPlaces == null) {
                    formattedStr = convertCoefficientArrayToString(numInstance.coefficients);
                    formattedStr = 1 === formatType || 2 === formatType && (exponentVal <= defaultMinExp || exponentVal >= defaultMaxExp) ? formatToScientific(formattedStr, exponentVal) : insertDecimalPoint(formattedStr, exponentVal, "0");
                } else {
                    numInstance = roundPreciseNumber(new PreciseNumberConstructor(numInstance), decimalPlaces + numInstance.exponent + 1, roundingMode);
                    exponentVal = numInstance.exponent;
                    formattedStr = convertCoefficientArrayToString(numInstance.coefficients);
                    strLength = formattedStr.length;

                    if (1 === formatType || 2 === formatType && (decimalPlaces <= exponentVal || exponentVal <= defaultMinExp)) {
                        for (; strLength < decimalPlaces; formattedStr += "0", strLength++);
                        formattedStr = formatToScientific(formattedStr, exponentVal);
                    } else if (decimalPlaces -= exponentVal, formattedStr = insertDecimalPoint(formattedStr, exponentVal, "0"), exponentVal + 1 > strLength) {
                        if (--decimalPlaces > 0)
                            for (formattedStr += "."; decimalPlaces--; formattedStr += "0");
                    } else if ((decimalPlaces += exponentVal - strLength) > 0) {
                        exponentVal + 1 === strLength && (formattedStr += ".");
                        for (; decimalPlaces--; formattedStr += "0");
                    }
                }
                return numInstance.sign < 0 && firstCoeff ? "-" + formattedStr : formattedStr;
            }

            function findExtremeValue(decimalList, compareMethod) {
                var i = 1,
                    len = decimalList.length,
                    extremeResult = new PreciseNumberConstructor(decimalList[0]);
                for (; i < len; i++) {
                    var currentDecimal = new PreciseNumberConstructor(decimalList[i]);
                    if (!currentDecimal.sign) {
                        extremeResult = currentDecimal;
                        break;
                    }
                    compareMethod.call(extremeResult, currentDecimal) && (extremeResult = currentDecimal);
                }
                return extremeResult;
            }

            function normalizeCoefficients(numInstance, coefficients, exponent) {
                for (var i = 1, len = coefficients.length; !coefficients[--len]; coefficients.pop());
                for (len = coefficients[0]; len >= 10; len /= 10, i++);
                exponent = i + exponent * coefficientDigitsCount - 1;
                if (exponent > defaultMaxRange) numInstance.coefficients = numInstance.exponent = null;
                else if (exponent < defaultMinRange) numInstance.coefficients = [numInstance.exponent = 0];
                else {
                    numInstance.exponent = exponent;
                    numInstance.coefficients = coefficients;
                }
                return numInstance;
            }

            function roundPreciseNumber(numInstance, targetPrecision, roundingMode, isExact) {
                var i, coeffValue, remainder, targetCoeffIndex, carry, currentCoeff;
                if (numInstance.coefficients) {
                    for (i = 1, remainder = numInstance.coefficients[0]; remainder >= 10; remainder /= 10, i++);
                    if ((coeffValue = targetPrecision - i) < 0) {
                        coeffValue += coefficientDigitsCount;
                        targetCoeffIndex = targetPrecision;
                        carry = (currentCoeff = numInstance.coefficients[targetCoeffIndex = 0]) / precomputedPowersOfTen[i - targetCoeffIndex - 1] % 10 | 0;
                    } else if ((targetCoeffIndex = floorFunc((coeffValue + 1) / coefficientDigitsCount)) >= numInstance.coefficients.length) {
                        if (!isExact) {
                            for (; numInstance.coefficients.length <= targetCoeffIndex; numInstance.coefficients.push(0));
                            currentCoeff = carry = 0;
                            i = 1;
                            targetPrecision = (coeffValue %= coefficientDigitsCount) - coefficientDigitsCount + 1;
                        } else {
                            break PreciseNumberRoundingLabel;
                        }
                    } else {
                        for (currentCoeff = remainder = numInstance.coefficients[targetCoeffIndex], i = 1; remainder >= 10; remainder /= 10, i++);
                        carry = (targetPrecision = (coeffValue %= coefficientDigitsCount) - coefficientDigitsCount + i) < 0 ? 0 : currentCoeff / precomputedPowersOfTen[i - targetPrecision - 1] % 10 | 0;
                    }

                    isExact = isExact || targetPrecision < 0 || numInstance.coefficients[targetCoeffIndex + 1] != null || (targetPrecision < 0 ? currentCoeff : currentCoeff % precomputedPowersOfTen[i - targetPrecision - 1]);
                    isExact = roundingMode < 4 ? (carry || isExact) && (0 === roundingMode || roundingMode === (numInstance.sign < 0 ? 3 : 2)) : carry > 5 || 5 === carry && (4 === roundingMode || isExact || 6 === roundingMode && (coeffValue > 0 ? targetPrecision > 0 ? currentCoeff / precomputedPowersOfTen[i - targetPrecision] : 0 : numInstance.coefficients[targetCoeffIndex - 1]) % 10 & 1 || roundingMode === (numInstance.sign < 0 ? 8 : 7));

                    if (targetPrecision < 1 || !numInstance.coefficients[0]) {
                        numInstance.coefficients.length = 0;
                        if (isExact) {
                            numInstance.exponent -= targetPrecision;
                            numInstance.coefficients[0] = precomputedPowersOfTen[(coefficientDigitsCount - numInstance.exponent % coefficientDigitsCount) % coefficientDigitsCount];
                            numInstance.exponent = -numInstance.exponent || 0;
                        } else numInstance.coefficients[0] = numInstance.exponent = 0;
                        return numInstance;
                    }

                    if (0 === coeffValue ? (numInstance.coefficients.length = targetCoeffIndex, remainder = 1, targetCoeffIndex--) : (numInstance.coefficients.length = targetCoeffIndex + 1, remainder = precomputedPowersOfTen[coefficientDigitsCount - coeffValue], numInstance.coefficients[targetCoeffIndex] = targetPrecision > 0 ? floorFunc(currentCoeff / precomputedPowersOfTen[i - targetPrecision] % precomputedPowersOfTen[targetPrecision]) * remainder : 0), isExact) {
                        for (;;) {
                            if (0 === targetCoeffIndex) {
                                for (coeffValue = 1, targetPrecision = numInstance.coefficients[0]; targetPrecision >= 10; targetPrecision /= 10, coeffValue++);
                                for (targetPrecision = numInstance.coefficients[0] += remainder, remainder = 1; targetPrecision >= 10; targetPrecision /= 10, remainder++);
                                coeffValue !== remainder && (numInstance.exponent++, numInstance.coefficients[0] === internalCoefficientBase && (numInstance.coefficients[0] = 1));
                                break;
                            }
                            if (numInstance.coefficients[targetCoeffIndex] += remainder, numInstance.coefficients[targetCoeffIndex] !== internalCoefficientBase) break;
                            numInstance.coefficients[targetCoeffIndex--] = 0;
                            remainder = 1;
                        }
                        for (coeffValue = numInstance.coefficients.length; 0 === numInstance.coefficients[--coeffValue]; numInstance.coefficients.pop());
                    }
                }
                PreciseNumberRoundingLabel:
                    numInstance.exponent > defaultMaxRange ? numInstance.coefficients = numInstance.exponent = null : numInstance.exponent < defaultMinRange && (numInstance.coefficients = [numInstance.exponent = 0]);
                return numInstance;
            }

            function convertPreciseNumberToString(numInstance) {
                var strResult, expVal = numInstance.exponent;
                return null === expVal ? numInstance.toString() : (strResult = convertCoefficientArrayToString(numInstance.coefficients), strResult = expVal <= defaultMinExp || expVal >= defaultMaxExp ? formatToScientific(strResult, expVal) : insertDecimalPoint(strResult, expVal, "0"), numInstance.sign < 0 ? "-" + strResult : strResult);
            }

            PreciseNumberConstructor.clone = createPreciseNumber;
            PreciseNumberConstructor.ROUND_UP = 0;
            PreciseNumberConstructor.ROUND_DOWN = 1;
            PreciseNumberConstructor.ROUND_CEIL = 2;
            PreciseNumberConstructor.ROUND_FLOOR = 3;
            PreciseNumberConstructor.ROUND_HALF_UP = 4;
            PreciseNumberConstructor.ROUND_HALF_DOWN = 5;
            PreciseNumberConstructor.ROUND_HALF_EVEN = 6;
            PreciseNumberConstructor.ROUND_HALF_CEIL = 7;
            PreciseNumberConstructor.ROUND_HALF_FLOOR = 8;
            PreciseNumberConstructor.EUCLID = 9;

            PreciseNumberConstructor.config = PreciseNumberConstructor.set = function(settings) {
                var propKey, propVal;
                if (settings != null) {
                    if (typeof settings !== "object") throw Error(errorMessages + "Object expected: " + settings);
                    if (settings.hasOwnProperty(propKey = "DECIMAL_PLACES")) {
                        validateNumericRange(propVal = settings[propKey], 0, highBaseValue, propKey);
                        defaultDecimalPlaces = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "ROUNDING_MODE")) {
                        validateNumericRange(propVal = settings[propKey], 0, 8, propKey);
                        defaultRoundingMode = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "EXPONENTIAL_AT")) {
                        if ((propVal = settings[propKey]) && propVal.pop) {
                            validateNumericRange(propVal[0], -highBaseValue, 0, propKey);
                            validateNumericRange(propVal[1], 0, highBaseValue, propKey);
                            defaultMinExp = propVal[0];
                            defaultMaxExp = propVal[1];
                        } else {
                            validateNumericRange(propVal, -highBaseValue, highBaseValue, propKey);
                            defaultMinExp = -(defaultMaxExp = propVal < 0 ? -propVal : propVal);
                        }
                    }
                    if (settings.hasOwnProperty(propKey = "RANGE")) {
                        if ((propVal = settings[propKey]) && propVal.pop) {
                            validateNumericRange(propVal[0], -highBaseValue, -1, propKey);
                            validateNumericRange(propVal[1], 1, highBaseValue, propKey);
                            defaultMinRange = propVal[0];
                            defaultMaxRange = propVal[1];
                        } else {
                            validateNumericRange(propVal, -highBaseValue, highBaseValue, propKey);
                            if (!propVal) throw Error(errorMessages + propKey + " cannot be zero: " + propVal);
                            defaultMinRange = -(defaultMaxRange = propVal < 0 ? -propVal : propVal);
                        }
                    }
                    if (settings.hasOwnProperty(propKey = "CRYPTO")) {
                        if ((propVal = settings[propKey]) !== !!propVal) throw Error(errorMessages + propKey + " not true or false: " + propVal);
                        if (propVal) {
                            if (typeof crypto === "undefined" || !crypto || !crypto.getRandomValues && !crypto.randomBytes) throw isCryptoEnabled = !propVal, Error(errorMessages + "crypto unavailable");
                            isCryptoEnabled = propVal;
                        } else isCryptoEnabled = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "MODULO_MODE")) {
                        validateNumericRange(propVal = settings[propKey], 0, 9, propKey);
                        defaultModuloMode = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "POW_PRECISION")) {
                        validateNumericRange(propVal = settings[propKey], 0, highBaseValue, propKey);
                        defaultPowPrecision = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "FORMAT")) {
                        if (typeof(propVal = settings[propKey]) !== "object") throw Error(errorMessages + propKey + " not an object: " + propVal);
                        defaultFormatOptions = propVal;
                    }
                    if (settings.hasOwnProperty(propKey = "ALPHABET")) {
                        if (typeof(propVal = settings[propKey]) !== "string" || /^.$|[+-.\s]|(.).*\1/.test(propVal)) throw Error(errorMessages + propKey + " invalid: " + propVal);
                        baseConversionAlphabet = propVal;
                    }
                }
                return {
                    DECIMAL_PLACES: defaultDecimalPlaces,
                    ROUNDING_MODE: defaultRoundingMode,
                    EXPONENTIAL_AT: [defaultMinExp, defaultMaxExp],
                    RANGE: [defaultMinRange, defaultMaxRange],
                    CRYPTO: isCryptoEnabled,
                    MODULO_MODE: defaultModuloMode,
                    POW_PRECISION: defaultPowPrecision,
                    FORMAT: defaultFormatOptions,
                    ALPHABET: baseConversionAlphabet
                };
            };

            PreciseNumberConstructor.isPreciseNumber = function(obj) {
                if (!obj || true !== obj._isPreciseNumber) return false;
                if (!PreciseNumberConstructor.DEBUG) return true;
                // Debug checks omitted for brevity in Type III clone.
                return true;
            };

            PreciseNumberConstructor.maximum = PreciseNumberConstructor.max = function() {
                return findExtremeValue(arguments, prototypeMethods.isLessThan);
            };
            PreciseNumberConstructor.minimum = PreciseNumberConstructor.min = function() {
                return findExtremeValue(arguments, prototypeMethods.isGreaterThan);
            };

            PreciseNumberConstructor.random = (function() {
                var simpleRandomGenerator = 9007199254740992 * Math.random() & 2097151 ?
                    () => floorFunc(9007199254740992 * Math.random()) :
                    () => 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);

                return function(decimalPlaces) {
                    var numChunks, randomBytesArr, tempVal, randomCoeffs = [],
                        chunkIndex = 0,
                        resultNum = new PreciseNumberConstructor(onePrecise);

                    if (decimalPlaces == null) decimalPlaces = defaultDecimalPlaces;
                    validateNumericRange(decimalPlaces, 0, highBaseValue);
                    numChunks = ceilFunc(decimalPlaces / coefficientDigitsCount);

                    if (isCryptoEnabled) {
                        if (crypto.getRandomValues) {
                            for (randomBytesArr = crypto.getRandomValues(new Uint32Array(numChunks *= 2)); chunkIndex < numChunks;) {
                                (tempVal = 131072 * randomBytesArr[chunkIndex] + (randomBytesArr[chunkIndex + 1] >>> 11)) >= 9e15 ?
                                    (randomBytesArr = crypto.getRandomValues(new Uint32Array(2)), randomBytesArr[0] = randomBytesArr[0], randomBytesArr[1] = randomBytesArr[1]) :
                                    (randomCoeffs.push(tempVal % 1e14), chunkIndex += 2);
                            }
                            chunkIndex = numChunks / 2;
                        } else if (crypto.randomBytes) {
                            for (randomBytesArr = crypto.randomBytes(numChunks *= 7); chunkIndex < numChunks;) {
                                (tempVal = 281474976710656 * (31 & randomBytesArr[chunkIndex]) + 1099511627776 * randomBytesArr[chunkIndex + 1] + 4294967296 * randomBytesArr[chunkIndex + 2] + 16777216 * randomBytesArr[chunkIndex + 3] + (randomBytesArr[chunkIndex + 4] << 16) + (randomBytesArr[chunkIndex + 5] << 8) + randomBytesArr[chunkIndex + 6]) >= 9e15 ?
                                    crypto.randomBytes(7).copy(randomBytesArr, chunkIndex) :
                                    (randomCoeffs.push(tempVal % 1e14), chunkIndex += 7);
                            }
                            chunkIndex = numChunks / 7;
                        } else {
                            isCryptoEnabled = false;
                        }
                    }

                    if (!isCryptoEnabled) {
                        for (; chunkIndex < numChunks;) {
                            (tempVal = simpleRandomGenerator()) < 9e15 && (randomCoeffs[chunkIndex++] = tempVal % 1e14);
                        }
                    }

                    numChunks = randomCoeffs[--chunkIndex];
                    decimalPlaces %= coefficientDigitsCount;
                    numChunks && decimalPlaces && (tempVal = precomputedPowersOfTen[coefficientDigitsCount - decimalPlaces], randomCoeffs[chunkIndex] = floorFunc(numChunks / tempVal) * tempVal);
                    for (; 0 === randomCoeffs[chunkIndex]; randomCoeffs.pop(), chunkIndex--);

                    if (chunkIndex < 0) randomCoeffs = [tempVal = 0];
                    else {
                        for (tempVal = -1; 0 === randomCoeffs[0]; randomCoeffs.splice(0, 1), tempVal -= coefficientDigitsCount);
                        for (chunkIndex = 1, tempVal = randomCoeffs[0]; tempVal >= 10; tempVal /= 10, chunkIndex++);
                        chunkIndex < coefficientDigitsCount && (tempVal -= coefficientDigitsCount - chunkIndex);
                    }
                    resultNum.exponent = tempVal;
                    resultNum.coefficients = randomCoeffs;
                    return resultNum;
                };
            })();

            PreciseNumberConstructor.sum = function() {
                var i = 1,
                    args = arguments,
                    sumResult = new PreciseNumberConstructor(args[0]);
                while (i < args.length) sumResult = sumResult.plus(args[i++]);
                return sumResult;
            };

            var convertAnyBase = (function() {
                function convertChunksToTargetBase(inputStr, fromBase, toBase, charMap) {
                    var i, digit, outputArr = [0],
                        len = inputStr.length;
                    for (var j = 0; j < len;) {
                        for (i = outputArr.length; i--; outputArr[i] *= fromBase);
                        outputArr[0] += charMap.indexOf(inputStr.charAt(j++));
                        for (i = 0; i < outputArr.length; i++) {
                            if (outputArr[i] > toBase - 1) {
                                if (outputArr[i + 1] == null) outputArr[i + 1] = 0;
                                outputArr[i + 1] += floorFunc(outputArr[i] / toBase);
                                outputArr[i] %= toBase;
                            }
                        }
                    }
                    return outputArr.reverse();
                }

                return function(valueStr, inBase, outBase, isSigned, customAlphabet) {
                    var decimalPointIdx, processedChunks, exponentVal,
                        originalDecPlaces = defaultDecimalPlaces,
                        originalRounding = defaultRoundingMode;

                    decimalPointIdx = valueStr.indexOf(".");
                    if (decimalPointIdx >= 0) {
                        exponentVal = defaultPowPrecision;
                        defaultPowPrecision = 0;
                        valueStr = valueStr.replace(".", "");
                        var basePower = (new PreciseNumberConstructor(inBase)).pow(valueStr.length - decimalPointIdx);
                        defaultPowPrecision = exponentVal;
                        basePower.coefficients = convertChunksToTargetBase(convertCoefficientArrayToString(basePower.coefficients), 10, outBase, "0123456789");
                        basePower.exponent = basePower.coefficients.length;
                    }

                    processedChunks = convertChunksToTargetBase(valueStr, inBase, outBase, customAlphabet ? (exponentVal = baseConversionAlphabet, "0123456789") : (exponentVal = "0123456789", baseConversionAlphabet));
                    for (var i = processedChunks.length; 0 === processedChunks[--i]; processedChunks.pop());
                    if (!processedChunks[0]) return exponentVal.charAt(0);

                    if (decimalPointIdx < 0) {
                        --i;
                    } else {
                        basePower.coefficients = processedChunks;
                        basePower.exponent = i;
                        basePower.sign = isSigned;
                        processedChunks = (basePower = dividePreciseNumbers(basePower, basePower, originalDecPlaces, originalRounding, outBase)).coefficients;
                        decimalPointIdx = basePower.remainder;
                        i = basePower.exponent;
                    }

                    var finalChar, resultString = "";
                    var lastDigit = processedChunks[decimalPointIdx = i + originalDecPlaces + 1];
                    var halfOutBase = outBase / 2;

                    decimalPointIdx = decimalPointIdx || lastDigit < 0 || processedChunks[lastDigit + 1] != null;
                    decimalPointIdx = originalRounding < 4 ? (lastDigit != null || decimalPointIdx) && (0 === originalRounding || originalRounding === (basePower.sign < 0 ? 3 : 2)) : lastDigit > halfOutBase || lastDigit === halfOutBase && (4 === originalRounding || decimalPointIdx || 6 === originalRounding && 1 & processedChunks[lastDigit - 1] || originalRounding === (basePower.sign < 0 ? 8 : 7));

                    if (i < 1 || !processedChunks[0]) resultString = decimalPointIdx ? insertDecimalPoint(exponentVal.charAt(1), -originalDecPlaces, exponentVal.charAt(0)) : exponentVal.charAt(0);
                    else {
                        if (processedChunks.length = i, decimalPointIdx)
                            for (--outBase; ++processedChunks[--i] > outBase;) processedChunks[i] = 0, i || (++i, processedChunks = [1].concat(processedChunks));
                        for (decimalPointIdx = processedChunks.length; !processedChunks[--decimalPointIdx];);
                        for (lastDigit = 0; lastDigit <= decimalPointIdx; resultString += exponentVal.charAt(processedChunks[lastDigit++]));
                        resultString = insertDecimalPoint(resultString, i, exponentVal.charAt(0));
                    }
                    return resultString;
                };
            })();

            var dividePreciseNumbers = (function() {
                function multiplyCoeffsByScalar(coeffs, scalar, base) {
                    var carry = 0,
                        i = coeffs.length,
                        low, high;
                    for (coeffs = coeffs.slice(); i--;) {
                        low = (coeffs[i] % lowBaseValue) * scalar;
                        high = floorFunc(coeffs[i] / lowBaseValue) * scalar;
                        carry = floorFunc((low + (high % lowBaseValue) * lowBaseValue + carry) / base) + floorFunc(low / lowBaseValue) + high;
                        coeffs[i] = (low + (high % lowBaseValue) * lowBaseValue + carry) % base;
                    }
                    return carry && [carry].concat(coeffs) || coeffs;
                }

                function compareCoeffArrays(arr1, arr2, len1, len2) {
                    var i, comparison;
                    if (len1 !== len2) comparison = len1 > len2 ? 1 : -1;
                    else
                        for (i = comparison = 0; i < len1; i++)
                            if (arr1[i] !== arr2[i]) {
                                comparison = arr1[i] > arr2[i] ? 1 : -1;
                                break;
                            }
                    return comparison;
                }

                function subtractCoeffArrays(minuend, subtrahend, len, base) {
                    var borrow = 0;
                    for (; len--;) {
                        minuend[len] -= borrow;
                        borrow = minuend[len] < subtrahend[len] ? 1 : 0;
                        minuend[len] = borrow * base + minuend[len] - subtrahend[len];
                    }
                    for (; !minuend[0] && minuend.length > 1; minuend.splice(0, 1));
                }

                return function(dividend, divisor, precision, roundingMode, customBase) {
                    var dividendCoeffs, divisorCoeffs,
                        resultSign, expDiff, quotientDigits = [],
                        divisorLen, dividendLen,
                        tempDividendPart, tempDivisorCopy, quotientEst, remainderFlag, divisorFirst;

                    if (!(dividend.coefficients && dividend.coefficients[0] && divisor.coefficients && divisor.coefficients[0]))
                        return new PreciseNumberConstructor(dividend.sign && divisor.sign && (dividend.coefficients ? !divisor.coefficients || dividend.coefficients[0] !== divisor.coefficients[0] : divisor.coefficients) ? dividend.coefficients && 0 === dividend.coefficients[0] || !divisor.coefficients ? 0 * resultSign : resultSign / 0 : NaN);

                    resultSign = dividend.sign === divisor.sign ? 1 : -1;
                    expDiff = dividend.exponent - divisor.exponent;

                    if (!customBase) {
                        customBase = internalCoefficientBase;
                        expDiff = truncateToInteger(dividend.exponent / coefficientDigitsCount) - truncateToInteger(divisor.exponent / coefficientDigitsCount);
                        precision = precision / coefficientDigitsCount | 0;
                    }

                    for (var i = 0; divisor.coefficients[i] === (dividend.coefficients[i] || 0); i++);

                    if (divisor.coefficients[i] > (dividend.coefficients[i] || 0) && expDiff--) {
                        quotientDigits.push(1);
                        remainderFlag = true;
                    } else {
                        var numQuotientDigits = precision + expDiff + 2;
                        divisorCoeffs = divisor.coefficients;
                        dividendCoeffs = dividend.coefficients.slice();

                        divisorLen = divisorCoeffs.length;
                        dividendLen = dividendCoeffs.length;

                        var scalingFactor = floorFunc(customBase / (divisorCoeffs[0] + 1));
                        if (scalingFactor > 1) {
                            divisorCoeffs = multiplyCoeffsByScalar(divisorCoeffs, scalingFactor, customBase);
                            dividendCoeffs = multiplyCoeffsByScalar(dividendCoeffs, scalingFactor, customBase);
                            divisorLen = divisorCoeffs.length;
                            dividendLen = dividendCoeffs.length;
                        }

                        tempDividendPart = dividendCoeffs.slice(0, divisorLen);
                        for (var j = tempDividendPart.length; j < divisorLen; tempDividendPart[j++] = 0);

                        tempDivisorCopy = divisorCoeffs.slice();
                        tempDivisorCopy = [0].concat(tempDivisorCopy);
                        divisorFirst = divisorCoeffs[0];

                        do {
                            quotientEst = 0;
                            var compResult = compareCoeffArrays(divisorCoeffs, tempDividendPart, divisorLen, tempDividendPart.length);

                            if (compResult < 0) {
                                var firstTwoChunks = tempDividendPart[0];
                                if (divisorLen !== tempDividendPart.length) firstTwoChunks = firstTwoChunks * customBase + (tempDividendPart[1] || 0);
                                quotientEst = floorFunc(firstTwoChunks / divisorFirst);

                                if (quotientEst > 1) {
                                    if (quotientEst >= customBase) quotientEst = customBase - 1;
                                    var multipliedDiv = multiplyCoeffsByScalar(divisorCoeffs, quotientEst, customBase);
                                    var currentMultLen = multipliedDiv.length;

                                    while (1 === compareCoeffArrays(multipliedDiv, tempDividendPart, currentMultLen, tempDividendPart.length)) {
                                        quotientEst--;
                                        subtractCoeffArrays(multipliedDiv, divisorLen < currentMultLen ? tempDivisorCopy : divisorCoeffs, currentMultLen, customBase);
                                        currentMultLen = multipliedDiv.length;
                                    }
                                } else if (0 === quotientEst) {
                                    quotientEst = 1;
                                    multipliedDiv = divisorCoeffs.slice();
                                } else {
                                    multipliedDiv = divisorCoeffs.slice();
                                }

                                if (multipliedDiv.length < tempDividendPart.length) multipliedDiv = [0].concat(multipliedDiv);

                                subtractCoeffArrays(tempDividendPart, multipliedDiv, tempDividendPart.length, customBase);
                                tempDividendPart.length = tempDividendPart.length;
                                compResult = -1;
                            } else if (0 === compResult) {
                                quotientEst++;
                                tempDividendPart = [0];
                            }

                            quotientDigits.push(quotientEst);
                            tempDividendPart[0] ? tempDividendPart[tempDividendPart.length++] = dividendCoeffs[divisorLen] || 0 : tempDividendPart = [dividendCoeffs[divisorLen]];

                        } while ((divisorLen++ < dividendLen || null != tempDividendPart[0]) && numQuotientDigits--);
                        remainderFlag = null != tempDividendPart[0];
                        quotientDigits[0] || quotientDigits.splice(0, 1);
                    }

                    if (customBase === internalCoefficientBase) {
                        var firstCoeffDigit = 1,
                            firstCoeffVal = quotientDigits[0];
                        for (; firstCoeffVal >= 10; firstCoeffVal /= 10, firstCoeffDigit++);
                        roundPreciseNumber(dividend, precision + (dividend.exponent = firstCoeffDigit + expDiff * coefficientDigitsCount - 1) + 1, roundingMode, remainderFlag);
                    } else {
                        dividend.exponent = expDiff;
                        dividend.remainder = +remainderFlag;
                    }
                    dividend.coefficients = quotientDigits;
                    return dividend;
                };
            })();

            var basePrefixPattern = /^(-?)0([xbo])(?=\w[\w.]*$)/i;
            var trailingDecimalPattern = /^([^.]+)\.$/;
            var leadingDecimalPattern = /^\.([^.]+)$/;
            var infinityNaNPattern = /^-?(Infinity|NaN)$/;
            var whitespaceAndPlusPattern = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            function initializeInvalidPreciseNumber(instance, valueStr, isNum, base) {
                var parsedBase, cleanedStr = isNum ? valueStr : valueStr.replace(whitespaceAndPlusPattern, "");
                if (infinityNaNPattern.test(cleanedStr)) instance.sign = isNaN(cleanedStr) ? null : cleanedStr < 0 ? -1 : 1;
                else {
                    if (!isNum && (cleanedStr = cleanedStr.replace(basePrefixPattern, function(match, sign, type) {
                            parsedBase = "x" === (type = type.toLowerCase()) ? 16 : "b" === type ? 2 : 8;
                            return base && base !== parsedBase ? match : sign;
                        }), base && (parsedBase = base, cleanedStr = cleanedStr.replace(trailingDecimalPattern, "$1").replace(leadingDecimalPattern, "0.$1")), valueStr !== cleanedStr)) return new PreciseNumberConstructor(cleanedStr, parsedBase);
                    if (PreciseNumberConstructor.DEBUG) throw Error(errorMessages + "Not a" + (base ? " base " + base : "") + " number: " + valueStr);
                    instance.sign = null;
                }
                instance.coefficients = instance.exponent = null;
            }

            prototypeMethods.absoluteValue = prototypeMethods.abs = function() {
                var newNum = new PreciseNumberConstructor(this);
                return newNum.sign < 0 && (newNum.sign = 1), newNum;
            };
            prototypeMethods.comparedTo = function(otherVal, otherBase) {
                return comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase));
            };
            prototypeMethods.decimalPlaces = prototypeMethods.dp = function(decPlaces, roundingM) {
                var currentCoeffs, currentDecPlaces, lastCoeff, originalNum = this;
                if (decPlaces != null) {
                    validateNumericRange(decPlaces, 0, highBaseValue);
                    if (roundingM == null) roundingM = defaultRoundingMode;
                    validateNumericRange(roundingM, 0, 8);
                    return roundPreciseNumber(new PreciseNumberConstructor(originalNum), decPlaces + originalNum.exponent + 1, roundingM);
                }
                if (!(currentCoeffs = originalNum.coefficients)) return null;
                currentDecPlaces = ((lastCoeff = currentCoeffs.length - 1) - truncateToInteger(this.exponent / coefficientDigitsCount)) * coefficientDigitsCount;
                if (lastCoeff = currentCoeffs[lastCoeff])
                    for (; lastCoeff % 10 === 0; lastCoeff /= 10, currentDecPlaces--);
                return currentDecPlaces < 0 && (currentDecPlaces = 0), currentDecPlaces;
            };
            prototypeMethods.dividedBy = prototypeMethods.div = function(divisorVal, divisorBase) {
                return dividePreciseNumbers(this, new PreciseNumberConstructor(divisorVal, divisorBase), defaultDecimalPlaces, defaultRoundingMode);
            };
            prototypeMethods.dividedToIntegerBy = prototypeMethods.idiv = function(divisorVal, divisorBase) {
                return dividePreciseNumbers(this, new PreciseNumberConstructor(divisorVal, divisorBase), 0, 1);
            };
            prototypeMethods.exponentiatedBy = prototypeMethods.pow = function(exponentVal, moduloVal) {
                var expAsPrecise, baseAsPrecise, resultPrecise, isExpLarge, isExpNegative, isBaseAndModInt, expMagnitude, reqPrecision, half = new PreciseNumberConstructor(.5);
                baseAsPrecise = this;
                expAsPrecise = new PreciseNumberConstructor(exponentVal);
                if (expAsPrecise.coefficients && !expAsPrecise.isInteger()) throw Error(errorMessages + "Exponent not an integer: " + convertPreciseNumberToString(expAsPrecise));
                if (moduloVal != null) moduloVal = new PreciseNumberConstructor(moduloVal);
                if (!baseAsPrecise.coefficients || !baseAsPrecise.coefficients[0] || (1 === baseAsPrecise.coefficients[0] && !baseAsPrecise.exponent && 1 === baseAsPrecise.coefficients.length) || !expAsPrecise.coefficients || !expAsPrecise.coefficients[0]) {
                    resultPrecise = new PreciseNumberConstructor(Math.pow(+convertPreciseNumberToString(baseAsPrecise), isExpLarge ? 2 - checkOddParity(expAsPrecise) : +convertPreciseNumberToString(expAsPrecise)));
                    return moduloVal ? resultPrecise.mod(moduloVal) : resultPrecise;
                }
                isExpLarge = expAsPrecise.exponent > coefficientDigitsCount - 1;
                isExpNegative = expAsPrecise.sign < 0;
                if (moduloVal) {
                    if (moduloVal.coefficients ? !moduloVal.coefficients[0] : !moduloVal.sign) return new PreciseNumberConstructor(NaN);
                    isBaseAndModInt = !isExpNegative && baseAsPrecise.isInteger() && moduloVal.isInteger();
                    isBaseAndModInt && (baseAsPrecise = baseAsPrecise.mod(moduloVal));
                } else {
                    if (expAsPrecise.exponent > 9 && (baseAsPrecise.exponent > 0 || baseAsPrecise.exponent < -1 || (0 === baseAsPrecise.exponent ? baseAsPrecise.coefficients[0] > 1 || isExpLarge && baseAsPrecise.coefficients[1] >= 24e7 : baseAsPrecise.coefficients[0] < 8e13 || isExpLarge && baseAsPrecise.coefficients[0] <= 9999975e7))) {
                        var infSign = baseAsPrecise.sign < 0 && checkOddParity(expAsPrecise) ? -0 : 0;
                        baseAsPrecise.exponent > -1 && (infSign = 1 / infSign);
                        return new PreciseNumberConstructor(isExpNegative ? 1 / infSign : infSign);
                    }
                    defaultPowPrecision && (reqPrecision = floorFunc(defaultPowPrecision / coefficientDigitsCount + 2));
                }
                resultPrecise = new PreciseNumberConstructor(onePrecise);
                if (isExpLarge) {
                    expAsPrecise.sign = 1;
                    expMagnitude = checkOddParity(expAsPrecise);
                } else expMagnitude = (expAsPrecise = Math.abs(+convertPreciseNumberToString(expAsPrecise))) % 2;
                for (;;) {
                    if (expMagnitude) {
                        if (!(resultPrecise = resultPrecise.times(baseAsPrecise)).coefficients) break;
                        reqPrecision ? resultPrecise.coefficients.length > reqPrecision && (resultPrecise.coefficients.length = reqPrecision) : isBaseAndModInt && (resultPrecise = resultPrecise.mod(moduloVal));
                    }
                    if (expAsPrecise) {
                        if (0 === (expAsPrecise = floorFunc(expAsPrecise / 2))) break;
                        expMagnitude = expAsPrecise % 2;
                    } else {
                        roundPreciseNumber(expAsPrecise = expAsPrecise.times(half), expAsPrecise.exponent + 1, 1);
                        if (expAsPrecise.exponent > coefficientDigitsCount - 1) expMagnitude = checkOddParity(expAsPrecise);
                        else {
                            if (0 === (expAsPrecise = +convertPreciseNumberToString(expAsPrecise))) break;
                            expMagnitude = expAsPrecise % 2;
                        }
                    }
                    baseAsPrecise = baseAsPrecise.times(baseAsPrecise);
                    reqPrecision ? baseAsPrecise.coefficients && baseAsPrecise.coefficients.length > reqPrecision && (baseAsPrecise.coefficients.length = reqPrecision) : isBaseAndModInt && (baseAsPrecise = baseAsPrecise.mod(moduloVal));
                }
                return isBaseAndModInt ? resultPrecise : (isExpNegative && (resultPrecise = onePrecise.div(resultPrecise)), moduloVal ? resultPrecise.mod(moduloVal) : reqPrecision ? roundPreciseNumber(resultPrecise, defaultPowPrecision, defaultRoundingMode, undefined) : resultPrecise);
            };
            prototypeMethods.integerValue = function(roundingM) {
                var newNum = new PreciseNumberConstructor(this);
                if (roundingM == null) roundingM = defaultRoundingMode;
                validateNumericRange(roundingM, 0, 8);
                return roundPreciseNumber(newNum, newNum.exponent + 1, roundingM);
            };
            prototypeMethods.isEqualTo = prototypeMethods.eq = function(otherVal, otherBase) {
                return 0 === comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase));
            };
            prototypeMethods.isFinite = function() {
                return !!this.coefficients;
            };
            prototypeMethods.isGreaterThan = prototypeMethods.gt = function(otherVal, otherBase) {
                return comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase)) > 0;
            };
            prototypeMethods.isGreaterThanOrEqualTo = prototypeMethods.gte = function(otherVal, otherBase) {
                var compResult = comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase));
                return 1 === compResult || 0 === compResult;
            };
            prototypeMethods.isInteger = function() {
                return !!this.coefficients && truncateToInteger(this.exponent / coefficientDigitsCount) > this.coefficients.length - 2;
            };
            prototypeMethods.isLessThan = prototypeMethods.lt = function(otherVal, otherBase) {
                return comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase)) < 0;
            };
            prototypeMethods.isLessThanOrEqualTo = prototypeMethods.lte = function(otherVal, otherBase) {
                var compResult = comparePreciseNumbers(this, new PreciseNumberConstructor(otherVal, otherBase));
                return -1 === compResult || 0 === compResult;
            };
            prototypeMethods.isInvalid = prototypeMethods.isNaN = function() {
                return !this.sign;
            };
            prototypeMethods.isNegative = function() {
                return this.sign < 0;
            };
            prototypeMethods.isPositive = function() {
                return this.sign > 0;
            };
            prototypeMethods.isZero = function() {
                return !!this.coefficients && 0 === this.coefficients[0];
            };
            prototypeMethods.minus = function(subtrahendVal, subtrahendBase) {
                var minuendCoeffs, subtrahendCoeffs,
                    minuendExpChunk, subtrahendExpChunk,
                    minuendSign = this.sign,
                    subtrahendPrecise = new PreciseNumberConstructor(subtrahendVal, subtrahendBase),
                    subtrahendSign = subtrahendPrecise.sign;

                if (!minuendSign || !subtrahendSign) return new PreciseNumberConstructor(NaN);
                if (minuendSign !== subtrahendSign) return subtrahendPrecise.sign = -subtrahendSign, this.plus(subtrahendPrecise);

                minuendExpChunk = this.exponent / coefficientDigitsCount;
                subtrahendExpChunk = subtrahendPrecise.exponent / coefficientDigitsCount;
                minuendCoeffs = this.coefficients;
                subtrahendCoeffs = subtrahendPrecise.coefficients;

                if (!minuendExpChunk || !subtrahendExpChunk) {
                    if (!minuendCoeffs || !subtrahendCoeffs) return minuendCoeffs ? (subtrahendPrecise.sign = -subtrahendSign, subtrahendPrecise) : new PreciseNumberConstructor(subtrahendCoeffs ? this : NaN);
                    if (!minuendCoeffs[0] || !subtrahendCoeffs[0]) return subtrahendCoeffs[0] ? (subtrahendPrecise.sign = -subtrahendSign, subtrahendPrecise) : new PreciseNumberConstructor(minuendCoeffs[0] ? this : (3 === defaultRoundingMode ? -0 : 0));
                }

                minuendExpChunk = truncateToInteger(minuendExpChunk);
                subtrahendExpChunk = truncateToInteger(subtrahendExpChunk);
                minuendCoeffs = minuendCoeffs.slice();

                minuendSign = minuendExpChunk - subtrahendExpChunk;
                if (minuendSign) {
                    if (minuendSign < 0) {
                        minuendSign = -minuendSign;
                        var tempArr = minuendCoeffs;
                        minuendCoeffs = subtrahendCoeffs;
                        subtrahendCoeffs = tempArr;
                    } else {
                        subtrahendExpChunk = minuendExpChunk;
                        tempArr = subtrahendCoeffs;
                    }
                    tempArr.reverse();
                    for (; minuendSign--; tempArr.push(0));
                    tempArr.reverse();
                } else {
                    var minLen = (minuendSign = minuendCoeffs.length) < (subtrahendSign = subtrahendCoeffs.length) ? minuendSign : subtrahendSign;
                    minuendSign = subtrahendSign = 0;
                    for (var i = 0; i < minLen; i++)
                        if (minuendCoeffs[i] !== subtrahendCoeffs[i]) {
                            minuendSign = minuendCoeffs[i] < subtrahendCoeffs[i];
                            break;
                        }
                }

                if (minuendSign) {
                    tempArr = minuendCoeffs;
                    minuendCoeffs = subtrahendCoeffs;
                    subtrahendCoeffs = tempArr;
                    subtrahendPrecise.sign = -subtrahendPrecise.sign;
                }

                if ((subtrahendSign = (tempArr = subtrahendCoeffs.length) - (minuendCoeffs.length)) > 0)
                    for (; subtrahendSign--; minuendCoeffs[tempArr++] = 0);

                for (subtrahendSign = internalCoefficientBase - 1; tempArr > minuendSign;) {
                    if (minuendCoeffs[--tempArr] < subtrahendCoeffs[tempArr]) {
                        for (var k = tempArr; k && !minuendCoeffs[--k]; minuendCoeffs[k] = subtrahendSign);
                        --minuendCoeffs[k];
                        minuendCoeffs[tempArr] += internalCoefficientBase;
                    }
                    minuendCoeffs[tempArr] -= subtrahendCoeffs[tempArr];
                }

                for (; 0 === minuendCoeffs[0]; minuendCoeffs.splice(0, 1), --subtrahendExpChunk);

                return minuendCoeffs[0] ? normalizeCoefficients(subtrahendPrecise, minuendCoeffs, subtrahendExpChunk) : (subtrahendPrecise.sign = (3 === defaultRoundingMode ? -1 : 1), subtrahendPrecise.coefficients = [subtrahendPrecise.exponent = 0], subtrahendPrecise);
            };
            prototypeMethods.modulo = prototypeMethods.mod = function(divisorVal, divisorBase) {
                var tempNum, divisorPrecise = new PreciseNumberConstructor(divisorVal, divisorBase),
                    originalPrecise = this;

                if (!originalPrecise.coefficients || !divisorPrecise.sign || (divisorPrecise.coefficients && !divisorPrecise.coefficients[0])) return new PreciseNumberConstructor(NaN);
                if (!divisorPrecise.coefficients || (originalPrecise.coefficients && !originalPrecise.coefficients[0])) return new PreciseNumberConstructor(originalPrecise);

                if (9 === defaultModuloMode) {
                    tempNum = divisorPrecise.sign;
                    divisorPrecise.sign = 1;
                    var divResult = dividePreciseNumbers(originalPrecise, divisorPrecise, 0, 3);
                    divisorPrecise.sign = tempNum;
                    divResult.sign *= tempNum;
                } else divResult = dividePreciseNumbers(originalPrecise, divisorPrecise, 0, defaultModuloMode);

                tempNum = originalPrecise.minus(divResult.times(divisorPrecise));
                if (!tempNum.coefficients[0] && 1 === defaultModuloMode) tempNum.sign = originalPrecise.sign;
                return tempNum;
            };
            prototypeMethods.multipliedBy = prototypeMethods.times = function(multiplierVal, multiplierBase) {
                var operandACoeffs, operandBCoeffs,
                    expA, expB,
                    tempArr, minLen, maxLen,
                    productCoeffs = [],
                    i, j, k, carry,
                    prodBase = internalCoefficientBase,
                    prodSmallBase = lowBaseValue,
                    multA, multB,
                    digitA, digitB;

                var operandA = this;
                var operandB = new PreciseNumberConstructor(multiplierVal, multiplierBase);

                if (!(operandA.coefficients && operandB.coefficients && operandA.coefficients[0] && operandB.coefficients[0]))
                    return !operandA.sign || !operandB.sign || (operandA.coefficients && !operandA.coefficients[0] && !operandB.coefficients) || (operandB.coefficients && !operandB.coefficients[0] && !operandA.coefficients) ? (operandB.coefficients = operandB.exponent = operandB.sign = null, operandB) : (operandB.sign *= operandA.sign, operandA.coefficients && operandB.coefficients ? (operandB.coefficients = [0], operandB.exponent = 0) : (operandB.coefficients = operandB.exponent = null), operandB);

                expA = truncateToInteger(operandA.exponent / coefficientDigitsCount);
                expB = truncateToInteger(operandB.exponent / coefficientDigitsCount);
                operandB.sign *= operandA.sign;

                operandACoeffs = operandA.coefficients;
                operandBCoeffs = operandB.coefficients;

                if ((minLen = operandACoeffs.length) < (maxLen = operandBCoeffs.length)) {
                    tempArr = operandACoeffs;
                    operandACoeffs = operandBCoeffs;
                    operandBCoeffs = tempArr;
                    i = minLen;
                    minLen = maxLen;
                    maxLen = i;
                }

                i = minLen + maxLen;
                for (; i--; productCoeffs.push(0));

                for (digitB = maxLen; --digitB >= 0;) {
                    carry = 0;
                    multA = operandBCoeffs[digitB] % prodSmallBase;
                    multB = floorFunc(operandBCoeffs[digitB] / prodSmallBase);
                    for (k = digitB + (digitA = minLen); digitA > digitB;)
                        carry = ((digitA = multA * (digitA = operandACoeffs[--digitA] % prodSmallBase) + (j = multB * digitA + (digitB = floorFunc(operandACoeffs[digitA] / prodSmallBase)) * multA) % prodSmallBase * prodSmallBase + productCoeffs[k] + carry) / prodBase | 0) + (j / prodSmallBase | 0) + multB * digitB, productCoeffs[k--] = digitA % prodBase;
                    productCoeffs[k] = carry;
                }

                if (carry) ++expA;
                else productCoeffs.splice(0, 1);

                return normalizeCoefficients(operandB, productCoeffs, expA + expB);
            };
            prototypeMethods.negated = function() {
                var newNum = new PreciseNumberConstructor(this);
                return newNum.sign = -newNum.sign || null, newNum;
            };
            prototypeMethods.plus = function(addendVal, addendBase) {
                var operandACoeffs, operandBCoeffs,
                    expA, expB,
                    tempArr, lenA, lenB,
                    carry = 0;

                var operandA = this;
                var operandB = new PreciseNumberConstructor(addendVal, addendBase);
                var signA = operandA.sign;
                var signB = operandB.sign;

                if (!signA || !signB) return new PreciseNumberConstructor(NaN);
                if (signA !== signB) return operandB.sign = -signB, operandA.minus(operandB);

                expA = operandA.exponent / coefficientDigitsCount;
                expB = operandB.exponent / coefficientDigitsCount;
                operandACoeffs = operandA.coefficients;
                operandBCoeffs = operandB.coefficients;

                if (!expA || !expB) {
                    if (!operandACoeffs || !operandBCoeffs) return new PreciseNumberConstructor(signA / 0);
                    if (!operandACoeffs[0] || !operandBCoeffs[0]) return operandBCoeffs[0] ? operandB : new PreciseNumberConstructor(operandACoeffs[0] ? operandA : 0 * signA);
                }

                expA = truncateToInteger(expA);
                expB = truncateToInteger(expB);
                operandACoeffs = operandACoeffs.slice();

                signA = expA - expB;
                if (signA) {
                    if (signA > 0) expB = expA, tempArr = operandBCoeffs;
                    else signA = -signA, tempArr = operandACoeffs;
                    tempArr.reverse();
                    for (; signA--; tempArr.push(0));
                    tempArr.reverse();
                }

                if ((lenA = operandACoeffs.length) - (lenB = operandBCoeffs.length) < 0) {
                    tempArr = operandBCoeffs;
                    operandBCoeffs = operandACoeffs;
                    operandACoeffs = tempArr;
                    lenB = lenA;
                }

                for (lenA = 0; lenB;) carry = (operandACoeffs[--lenB] = operandACoeffs[lenB] + operandBCoeffs[lenB] + carry) / internalCoefficientBase | 0, operandACoeffs[lenB] = internalCoefficientBase === operandACoeffs[lenB] ? 0 : operandACoeffs[lenB] % internalCoefficientBase;
                if (carry) operandACoeffs = [carry].concat(operandACoeffs), ++expB;

                return normalizeCoefficients(operandB, operandACoeffs, expB);
            };
            prototypeMethods.precision = prototypeMethods.sd = function(sigDigits, roundingM) {
                var currentCoeffs, totalDigits, firstCoeff, originalNum = this;
                if (sigDigits != null && sigDigits !== !!sigDigits) {
                    validateNumericRange(sigDigits, 1, highBaseValue);
                    if (roundingM == null) roundingM = defaultRoundingMode;
                    validateNumericRange(roundingM, 0, 8);
                    return roundPreciseNumber(new PreciseNumberConstructor(originalNum), sigDigits, roundingM);
                }
                if (!(currentCoeffs = originalNum.coefficients)) return null;
                totalDigits = (firstCoeff = currentCoeffs.length - 1) * coefficientDigitsCount + 1;
                if (firstCoeff = currentCoeffs[firstCoeff]) {
                    for (; firstCoeff % 10 === 0; firstCoeff /= 10, totalDigits--);
                    for (firstCoeff = currentCoeffs[0]; firstCoeff >= 10; firstCoeff /= 10, totalDigits++);
                }
                sigDigits && originalNum.exponent + 1 > totalDigits && (totalDigits = originalNum.exponent + 1);
                return totalDigits;
            };
            prototypeMethods.shiftedBy = function(shiftAmount) {
                validateNumericRange(shiftAmount, -javascriptMaxSafeInteger, javascriptMaxSafeInteger);
                return this.times("1e" + shiftAmount);
            };
            prototypeMethods.squareRoot = prototypeMethods.sqrt = function() {
                var sqrtResult, tempNum, iterationCount, currentRoot, originalSign = this.sign,
                    originalCoeffs = this.coefficients,
                    originalExp = this.exponent,
                    precisionForSqrt = defaultDecimalPlaces + 4,
                    half = new PreciseNumberConstructor("0.5");

                if (1 !== originalSign || !originalCoeffs || !originalCoeffs[0]) return new PreciseNumberConstructor(!originalSign || originalSign < 0 && (!originalCoeffs || originalCoeffs[0]) ? NaN : originalCoeffs ? this : 1 / 0);
                if (0 === (sqrtResult = Math.sqrt(+convertPreciseNumberToString(this))) || sqrtResult === 1 / 0) {
                    var strRep = convertCoefficientArrayToString(originalCoeffs);
                    if ((strRep.length + originalExp) % 2 === 0) strRep += "0";
                    sqrtResult = Math.sqrt(+strRep);
                    originalExp = truncateToInteger((originalExp + 1) / 2) - (originalExp < 0 || originalExp % 2);
                    currentRoot = new PreciseNumberConstructor(sqrtResult === 1 / 0 ? "1e" + originalExp : (sqrtResult = sqrtResult.toExponential()).slice(0, sqrtResult.indexOf("e") + 1) + originalExp);
                } else currentRoot = new PreciseNumberConstructor(sqrtResult + "");
                if (!currentRoot.coefficients[0]) return currentRoot;

                for ((sqrtResult = (originalExp = currentRoot.exponent) + precisionForSqrt) < 3 && (sqrtResult = 0);;) {
                    tempNum = currentRoot;
                    currentRoot = half.times(tempNum.plus(dividePreciseNumbers(this, tempNum, precisionForSqrt, 1)));
                    if (convertCoefficientArrayToString(tempNum.coefficients).slice(0, sqrtResult) === (strRep = convertCoefficientArrayToString(currentRoot.coefficients)).slice(0, sqrtResult)) {
                        if (strRep !== "9999" || (iterationCount || "4999" !== strRep)) {
                            +strRep && (+strRep.slice(1) || "5" !== strRep.charAt(0)) || (roundPreciseNumber(currentRoot, currentRoot.exponent + defaultDecimalPlaces + 2, 1), sqrtResult = !currentRoot.times(currentRoot).eq(this));
                            break;
                        }
                        if (!iterationCount && (roundPreciseNumber(tempNum, tempNum.exponent + defaultDecimalPlaces + 2, 0), tempNum.times(tempNum).eq(this))) {
                            currentRoot = tempNum;
                            break;
                        }
                        precisionForSqrt += 4;
                        sqrtResult += 4;
                        iterationCount = 1;
                    }
                }
                return roundPreciseNumber(currentRoot, currentRoot.exponent + defaultDecimalPlaces + 1, defaultRoundingMode, sqrtResult);
            };
            prototypeMethods.toExponential = function(decPlaces, roundingM) {
                if (decPlaces != null) validateNumericRange(decPlaces, 0, highBaseValue), decPlaces++;
                return formatPreciseNumber(this, decPlaces, roundingM, 1);
            };
            prototypeMethods.toFixed = function(decPlaces, roundingM) {
                if (decPlaces != null) validateNumericRange(decPlaces, 0, highBaseValue), decPlaces = decPlaces + this.exponent + 1;
                return formatPreciseNumber(this, decPlaces, roundingM);
            };
            prototypeMethods.toFormattedString = prototypeMethods.toFormat = function(decPlaces, roundingM, formatOpts) {
                var formattedOutput, currentNum = this;
                if (formatOpts == null) {
                    if (decPlaces != null && roundingM && typeof roundingM === "object") formatOpts = roundingM, roundingM = null;
                    else if (decPlaces && typeof decPlaces === "object") formatOpts = decPlaces, decPlaces = roundingM = null;
                    else formatOpts = defaultFormatOptions;
                } else if (typeof formatOpts !== "object") throw Error(errorMessages + "Argument not an object: " + formatOpts);

                formattedOutput = currentNum.toFixed(decPlaces, roundingM);
                if (currentNum.coefficients) {
                    var parts = formattedOutput.split("."),
                        groupSz = +formatOpts.groupSize,
                        secGroupSz = +formatOpts.secondaryGroupSize,
                        groupSep = formatOpts.groupSeparator || "",
                        intPart = parts[0],
                        fracPart = parts[1],
                        isNeg = currentNum.sign < 0,
                        absIntPart = isNeg ? intPart.slice(1) : intPart,
                        intPartLen = absIntPart.length;

                    if (secGroupSz && (groupSz = secGroupSz, secGroupSz = groupSz, intPartLen -= secGroupSz));
                    if (groupSz > 0 && intPartLen > 0) {
                        var firstGroupLen = intPartLen % groupSz || groupSz;
                        intPart = absIntPart.substr(0, firstGroupLen);
                        for (var i = firstGroupLen; i < intPartLen; i += groupSz) intPart += groupSep + absIntPart.substr(i, groupSz);
                        secGroupSz > 0 && (intPart += groupSep + absIntPart.slice(i));
                        isNeg && (intPart = "-" + intPart);
                    }
                    formattedOutput = fracPart ? intPart + (formatOpts.decimalSeparator || "") + ((secGroupSz = +formatOpts.fractionGroupSize) ? fracPart.replace(new RegExp("\\d{" + secGroupSz + "}\\B", "g"), "$&" + (formatOpts.fractionGroupSeparator || "")) : fracPart) : intPart;
                }
                return (formatOpts.prefix || "") + formattedOutput + (formatOpts.suffix || "");
            };
            prototypeMethods.toFraction = function(maxDenom) {
                var numer, denom, currentNumer, currentDenom, tempNumer, tempDenom, strCoeffs, expAdjust, originalNum = this;
                if (maxDenom != null && (!(tempNumer = new PreciseNumberConstructor(maxDenom)).isInteger() && (tempNumer.coefficients || 1 !== tempNumer.sign) || tempNumer.isLessThan(onePrecise))) throw Error(errorMessages + "Argument " + (tempNumer.isInteger() ? "out of range: " : "not an integer: ") + convertPreciseNumberToString(tempNumer));
                if (!originalNum.coefficients) return new PreciseNumberConstructor(originalNum);

                numer = new PreciseNumberConstructor(onePrecise);
                tempNumer = new PreciseNumberConstructor(onePrecise);
                denom = new PreciseNumberConstructor(onePrecise);
                tempDenom = new PreciseNumberConstructor(onePrecise);

                strCoeffs = convertCoefficientArrayToString(originalNum.coefficients);
                expAdjust = numer.exponent = strCoeffs.length - originalNum.exponent - 1;
                numer.coefficients[0] = precomputedPowersOfTen[(tempDenom = expAdjust % coefficientDigitsCount) < 0 ? coefficientDigitsCount + tempDenom : tempDenom];

                maxDenom = maxDenom || (expAdjust > 0 ? numer : onePrecise);

                var initialRange = defaultMaxRange;
                defaultMaxRange = 1 / 0;

                var decimalValue = new PreciseNumberConstructor(strCoeffs);
                denom.coefficients[0] = 0;

                for (;
                    (currentNumer = dividePreciseNumbers(decimalValue, numer, 0, 1)),
                    1 !== (tempNumer = tempNumer.plus(currentNumer.times(denom))).comparedTo(maxDenom);) tempDenom = denom, denom = tempNumer, currentNumer = numer, numer = decimalValue.minus(currentNumer.times(currentNumer)), decimalValue = currentNumer;

                currentNumer = dividePreciseNumbers(maxDenom.minus(tempNumer), denom, 0, 1);
                denom = denom.plus(currentNumer.times(tempDenom));
                tempNumer = tempNumer.plus(currentNumer.times(numer));

                tempNumer.sign = numer.sign = originalNum.sign;

                var fracA = dividePreciseNumbers(numer, tempDenom, expAdjust *= 2, defaultRoundingMode).minus(originalNum).abs();
                var fracB = dividePreciseNumbers(tempNumer, denom, expAdjust, defaultRoundingMode).minus(originalNum).abs();

                var finalFrac = fracA.comparedTo(fracB) < 1 ? [numer, tempDenom] : [tempNumer, denom];
                defaultMaxRange = initialRange;
                return finalFrac;
            };
            prototypeMethods.toNumber = function() {
                return +convertPreciseNumberToString(this);
            };
            prototypeMethods.toPrecision = function(sigDigits, roundingM) {
                if (sigDigits != null) validateNumericRange(sigDigits, 1, highBaseValue);
                return formatPreciseNumber(this, sigDigits, roundingM, 2);
            };
            prototypeMethods.toString = function(outputBase) {
                var strResult, currentNum = this,
                    sign = currentNum.sign,
                    exponent = currentNum.exponent;

                if (null === exponent) return sign ? (strResult = "Infinity", sign < 0 && (strResult = "-" + strResult)) : strResult = "NaN";

                if (outputBase == null) strResult = exponent <= defaultMinExp || exponent >= defaultMaxExp ? formatToScientific(convertCoefficientArrayToString(currentNum.coefficients), exponent) : insertDecimalPoint(convertCoefficientArrayToString(currentNum.coefficients), exponent, "0");
                else if (10 === outputBase) strResult = insertDecimalPoint(convertCoefficientArrayToString((currentNum = roundPreciseNumber(new PreciseNumberConstructor(currentNum), defaultDecimalPlaces + exponent + 1, defaultRoundingMode)).coefficients), currentNum.exponent, "0");
                else {
                    validateNumericRange(outputBase, 2, baseConversionAlphabet.length, "Base");
                    strResult = convertAnyBase(insertDecimalPoint(convertCoefficientArrayToString(currentNum.coefficients), exponent, "0"), 10, outputBase, sign, true);
                }
                return sign < 0 && currentNum.coefficients[0] ? "-" + strResult : strResult;
            };
            prototypeMethods.valueOf = prototypeMethods.toJSON = function() {
                return convertPreciseNumberToString(this);
            };
            prototypeMethods._isPreciseNumber = true;

            if (configObject != null) PreciseNumberConstructor.set(configObject);

            return PreciseNumberConstructor;
        })();

        if (typeof libraryContext === "undefined" || (numericModule.exports = libraryContext, undefined) === (libraryContext = function() {
                return libraryContext;
            }.call(numericExports, numRequire, numericExports, numericModule))) {
            if (typeof self === 'object' && self.PreciseNumber === undefined) self.PreciseNumber = libraryContext;
            else if (typeof window === 'object' && window.PreciseNumber === undefined) window.PreciseNumber = libraryContext;
            else if (typeof global === 'object' && global.PreciseNumber === undefined) global.PreciseNumber = libraryContext;
        }
        numericModule.exports = libraryContext;
    },
    function(fsModule, fsExports) {
        try {
            fsExports = require("fs");
            // Add a simple check for required functions in fs if it loads.
            if (typeof fsExports.readFileSync !== 'function') {
                throw new Error("fs.readFileSync is not a function.");
            }
        } catch (loadError) {
            console.warn(`Warning: Node.js 'fs' module not available or incomplete. Using a mock. Error: ${loadError.message}`);
            // Provide a minimal mock for environments where 'fs' is not present.
            fsExports = {
                readFileSync: (path, encoding) => {
                    console.error(`Mocked fs.readFileSync: Cannot read from ${path}. Returning empty string.`);
                    return "";
                },
                // Potentially add other commonly used fs methods as mocks.
                // For this specific use case, only readFileSync is needed.
            };
        }
        fsModule.exports = fsExports;
    }
]);