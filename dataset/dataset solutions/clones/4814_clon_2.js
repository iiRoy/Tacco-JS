exportBundle = function (moduleDefinitions) {
    const moduleCache = {};
    function localRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].moduleExports;
        }
        const currentModule = moduleCache[moduleId] = {
            id: moduleId,
            isLoaded: !1,
            moduleExports: {}
        };
        moduleDefinitions[moduleId].call(currentModule.moduleExports, currentModule, currentModule.moduleExports, localRequire);
        currentModule.isLoaded = !0;
        return currentModule.moduleExports;
    }
    localRequire.moduleMap = moduleDefinitions;
    localRequire.cacheRef = moduleCache;
    localRequire.defineExport = function (targetObject, propName, getterFunc) {
        if (!localRequire.hasOwn(targetObject, propName)) {
            Object.defineProperty(targetObject, propName, {
                enumerable: !0,
                get: getterFunc
            });
        }
    };
    localRequire.registerESModule = function (targetObject) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(targetObject, '__esModule', {
            value: !0
        });
    };
    localRequire.createNamespaceObject = function (targetModule, flag) {
        if (flag & 1) {
            targetModule = localRequire(targetModule);
        }
        if (flag & 8) {
            return targetModule;
        }
        if (flag & 4 && typeof targetModule === 'object' && targetModule && targetModule.__esModule) {
            return targetModule;
        }
        const namespaceObject = Object.create(null);
        localRequire.registerESModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: !0,
            value: targetModule
        });
        if (flag & 2 && typeof targetModule !== 'string') {
            for (const prop in targetModule) {
                localRequire.defineExport(namespaceObject, prop, ((key) => targetModule[key]).bind(void 0, prop));
            }
        }
        return namespaceObject;
    };
    localRequire.getModuleDefault = function (moduleObj) {
        let defaultGetter = moduleObj && moduleObj.__esModule ? () => moduleObj['default'] : () => moduleObj;
        localRequire.defineExport(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };
    localRequire.hasOwn = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };
    localRequire.publicPath = "";
    return localRequire(localRequire.startupModule = 0);
}([
    function (bundleModule, bundleExports, bundleRequire) {
        bundleRequire(1)(bundleRequire(3).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function (currentMod, currentExp, currentReq) {
        const bigNumConstructor = currentReq(2);
        currentMod.moduleExports = function (inputLines) {
            const elementCount = Number(inputLines[0]);
            const numericValues = inputLines[1].split(" ").map(function (val) {
                return Number(val);
            });
            numericValues.sort(function (valA, valB) {
                return valA - valB;
            });
            let resultAccumulator = new bigNumConstructor(1);
            if (elementCount % 2 === 0) {
                for (let evenIndex = 0; evenIndex < elementCount - 1; evenIndex += 2) {
                    if (numericValues[evenIndex] !== evenIndex + 1 || numericValues[evenIndex + 1] !== evenIndex + 1) {
                        return void console.log(0);
                    }
                    resultAccumulator = resultAccumulator.multiply(2).remainder(1_000_000_007);
                }
            } else {
                if (numericValues[0] !== 0) {
                    return void console.log(0);
                }
                for (let oddIndex = 1; oddIndex < elementCount - 1; oddIndex += 2) {
                    if (numericValues[oddIndex] !== oddIndex + 1 || numericValues[oddIndex + 1] !== oddIndex + 1) {
                        return void console.log(0);
                    }
                    resultAccumulator = resultAccumulator.multiply(2).remainder(1_000_000_007);
                }
            }
            console.log(resultAccumulator.toStringRepresentation());
        };
    },
    function (currentMod, currentExp, currentReq) {
        let preciseNumModule;
        (function (factoryScope) {
            "use strict";
            let bigNumFactoryRef;
            const numericRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
            const mathCeil = Math.ceil;
            const mathFloor = Math.floor;
            const errorPrefix = "[PreciseNumber Error] ";
            const largeNumberWarning = errorPrefix + "Number primitive has more than 15 significant digits: ";
            const BASE = 1e14;
            const DIGIT_GROUP_SIZE = 14;
            const MAX_SAFE_INTEGER = 9007199254740991;
            const POWERS_OF_TEN_ARRAY = [
                1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13
            ];
            const DIVIDEND_BASE = 1e7;
            const MULTIPLIER_BASE = 1e9;

            function floorInt(val) {
                const asInt = 0 | val;
                return val > 0 || val === asInt ? asInt : asInt - 1;
            }

            function formatCoefficientString(coeffs) {
                let currentIdx = 1;
                let totalLength = coeffs.length;
                let formattedString = coeffs[0] + "";
                while (currentIdx < totalLength) {
                    let nextCoeff = coeffs[currentIdx++] + "";
                    let padding = DIGIT_GROUP_SIZE - nextCoeff.length;
                    for (; padding--; nextCoeff = "0" + nextCoeff);
                    formattedString += nextCoeff;
                }
                for (totalLength = formattedString.length; 48 === formattedString.charCodeAt(--totalLength););
                return formattedString.slice(0, totalLength + 1 || 1);
            }

            function compareValues(instanceA, instanceB) {
                let isZeroA, isZeroB, signA, signB, expA, expB;
                const coeffsA = instanceA.coefficients;
                const coeffsB = instanceB.coefficients;
                signA = instanceA.sign;
                signB = instanceB.sign;
                expA = instanceA.exponent;
                expB = instanceB.exponent;
                if (!signA || !signB) {
                    return void 0;
                }
                isZeroA = coeffsA && !coeffsA[0];
                isZeroB = coeffsB && !coeffsB[0];
                if (isZeroA || isZeroB) {
                    return isZeroA ? isZeroB ? 0 : -signB : signA;
                }
                if (signA !== signB) {
                    return signA;
                }
                if (isZeroA = signA < 0, isZeroB = expA === expB, !coeffsA || !coeffsB) {
                    return isZeroB ? 0 : !coeffsA ^ isZeroA ? 1 : -1;
                }
                if (!isZeroB) {
                    return expA > expB ^ isZeroA ? 1 : -1;
                }
                let lenA = coeffsA.length;
                let lenB = coeffsB.length;
                let minLen = (lenA < lenB) ? lenA : lenB;
                let idx = 0;
                while (idx < minLen) {
                    if (coeffsA[idx] !== coeffsB[idx]) {
                        return coeffsA[idx] > coeffsB[idx] ^ isZeroA ? 1 : -1;
                    }
                    idx++;
                }
                return lenA === lenB ? 0 : lenA > lenB ^ isZeroA ? 1 : -1;
            }

            function validateNumberRange(num, minVal, maxVal, argName) {
                if (num < minVal || num > maxVal || num !== mathFloor(num)) {
                    throw Error(errorPrefix + (argName || "Argument") + (typeof num === 'number' ? num < minVal || num > maxVal ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(num));
                }
            }

            function isOdd(instance) {
                const lastCoeffIdx = instance.coefficients.length - 1;
                return floorInt(instance.exponent / DIGIT_GROUP_SIZE) === lastCoeffIdx && instance.coefficients[lastCoeffIdx] % 2 !== 0;
            }

            function formatScientific(numString, exponentVal) {
                return (numString.length > 1 ? numString.charAt(0) + "." + numString.slice(1) : numString) + (exponentVal < 0 ? "e" : "e+") + exponentVal;
            }

            function insertDecimalPoint(numString, exponentVal, paddingChar) {
                let tempString, stringLen;
                if (exponentVal < 0) {
                    for (tempString = paddingChar + "."; ++exponentVal; tempString += paddingChar);
                    numString = tempString + numString;
                } else if (++exponentVal > (stringLen = numString.length)) {
                    for (tempString = paddingChar, exponentVal -= stringLen; --exponentVal; tempString += paddingChar);
                    numString += tempString;
                } else if (exponentVal < stringLen) {
                    numString = numString.slice(0, exponentVal) + "." + numString.slice(exponentVal);
                }
                return numString;
            }

            (bigNumFactoryRef = function PreciseNumber(inputVal, baseVal) {
                let coeff, valStr, numLen, firstChar, isValidNum, currentDigit,
                    decimalPointIdx, startIdx, endIdx, powerOfTen, digitCount;
                const currentInstance = this;
                if (!(currentInstance instanceof PreciseNumber)) {
                    return new PreciseNumber(inputVal, baseVal);
                }
                if (baseVal === void 0) {
                    if (inputVal && !0 === inputVal._isPreciseNumber) {
                        currentInstance.sign = inputVal.sign;
                        return void(
                            !inputVal.coefficients || inputVal.exponent > rangeUpperBound ?
                                currentInstance.coefficients = currentInstance.exponent = void 0 :
                                inputVal.exponent < rangeLowerBound ?
                                    currentInstance.coefficients = [currentInstance.exponent = 0] :
                                    (currentInstance.exponent = inputVal.exponent, currentInstance.coefficients = inputVal.coefficients.slice())
                        );
                    }
                    if ((isValidNum = typeof inputVal === 'number') && 0 * inputVal === 0) {
                        if (currentInstance.sign = 1 / inputVal < 0 ? (inputVal = -inputVal, -1) : 1, inputVal === ~~inputVal) {
                            for (decimalPointIdx = 0, digitCount = inputVal; digitCount >= 10; digitCount /= 10, decimalPointIdx++);
                            return void(
                                decimalPointIdx > rangeUpperBound ?
                                    currentInstance.coefficients = currentInstance.exponent = void 0 :
                                    (currentInstance.exponent = decimalPointIdx, currentInstance.coefficients = [inputVal])
                            );
                        }
                        valStr = String(inputVal);
                    } else {
                        if (!numericRegex.test(valStr = String(inputVal))) {
                            return parseInputString(currentInstance, valStr, isValidNum);
                        }
                        currentInstance.sign = 45 === valStr.charCodeAt(0) ? (valStr = valStr.slice(1), -1) : 1;
                    }
                    (decimalPointIdx = valStr.indexOf(".")) > -1 && (valStr = valStr.replace(".", ""));
                    (startIdx = valStr.search(/e/i)) > 0 ? (decimalPointIdx < 0 && (decimalPointIdx = startIdx), decimalPointIdx += +valStr.slice(startIdx + 1), valStr = valStr.substring(0, startIdx)) : decimalPointIdx < 0 && (decimalPointIdx = valStr.length);
                } else {
                    validateNumberRange(baseVal, 2, conversionAlphabet.length, "Base");
                    if (10 === baseVal) {
                        return roundAndTruncate(currentInstance = new PreciseNumber(inputVal), decimalPlacesConfig + currentInstance.exponent + 1, roundingModeConfig);
                    }
                    valStr = String(inputVal);
                    if (isValidNum = typeof inputVal === 'number') {
                        if (0 * inputVal !== 0) {
                            return parseInputString(currentInstance, valStr, isValidNum, baseVal);
                        }
                        if (currentInstance.sign = 1 / inputVal < 0 ? (valStr = valStr.slice(1), -1) : 1, PreciseNumber.DEBUG && valStr.replace(/^0\.0*|\./, "").length > 15) {
                            throw Error(largeNumberWarning + inputVal);
                        }
                    } else {
                        currentInstance.sign = 45 === valStr.charCodeAt(0) ? (valStr = valStr.slice(1), -1) : 1;
                    }
                    let baseChars = conversionAlphabet.slice(0, baseVal);
                    let foundDecimal = !1;
                    decimalPointIdx = 0;
                    startIdx = 0;
                    numLen = valStr.length;
                    for (; startIdx < numLen; startIdx++) {
                        if (baseChars.indexOf(currentDigit = valStr.charAt(startIdx)) < 0) {
                            if ("." === currentDigit) {
                                if (startIdx > decimalPointIdx) {
                                    decimalPointIdx = numLen;
                                    continue;
                                }
                            } else if (!foundDecimal && (valStr === valStr.toUpperCase() && (valStr = valStr.toLowerCase()) || valStr === valStr.toLowerCase() && (valStr = valStr.toUpperCase()))) {
                                foundDecimal = !0;
                                startIdx = -1;
                                decimalPointIdx = 0;
                                continue;
                            }
                            return parseInputString(currentInstance, String(inputVal), isValidNum, baseVal);
                        }
                    }
                    isValidNum = !1;
                    (decimalPointIdx = (valStr = baseConvertHelper(valStr, baseVal, 10, currentInstance.sign)).indexOf(".")) > -1 ? valStr = valStr.replace(".", "") : decimalPointIdx = valStr.length;
                }
                for (startIdx = 0; 48 === valStr.charCodeAt(startIdx); startIdx++);
                for (numLen = valStr.length; 48 === valStr.charCodeAt(--numLen););
                if (valStr = valStr.slice(startIdx, ++numLen)) {
                    if (numLen -= startIdx, isValidNum && PreciseNumber.DEBUG && numLen > 15 && (inputVal > MAX_SAFE_INTEGER || inputVal !== mathFloor(inputVal))) {
                        throw Error(largeNumberWarning + currentInstance.sign * inputVal);
                    }
                    if ((decimalPointIdx = decimalPointIdx - startIdx - 1) > rangeUpperBound) {
                        currentInstance.coefficients = currentInstance.exponent = void 0;
                    } else if (decimalPointIdx < rangeLowerBound) {
                        currentInstance.coefficients = [currentInstance.exponent = 0];
                    } else {
                        if (currentInstance.exponent = decimalPointIdx, currentInstance.coefficients = [], startIdx = (decimalPointIdx + 1) % DIGIT_GROUP_SIZE, decimalPointIdx < 0 && (startIdx += DIGIT_GROUP_SIZE), startIdx < numLen) {
                            for (startIdx && currentInstance.coefficients.push(+valStr.slice(0, startIdx)), numLen -= DIGIT_GROUP_SIZE; startIdx < numLen; currentInstance.coefficients.push(+valStr.slice(startIdx, startIdx += DIGIT_GROUP_SIZE)));
                            startIdx = DIGIT_GROUP_SIZE - (valStr = valStr.slice(startIdx)).length;
                        } else {
                            startIdx -= numLen;
                        }
                        for (; startIdx--; valStr += "0");
                        currentInstance.coefficients.push(+valStr);
                    }
                } else {
                    currentInstance.coefficients = [currentInstance.exponent = 0];
                }
            }).prototype = {
                constructor: PreciseNumber,
                toString: void 0,
                valueOf: void 0
            };
            const PreciseNumberProto = PreciseNumber.prototype;
            const ONE_INSTANCE = new PreciseNumber(1);
            let decimalPlacesConfig = 20;
            let roundingModeConfig = 4;
            let expLowerBound = -7;
            let expUpperBound = 21;
            let rangeLowerBound = -1e7;
            let rangeUpperBound = 1e7;
            let useCryptoRNG = !1;
            let moduloModeConfig = 1;
            let powerPrecision = 0;
            let formatSettings = {
                prefix: "",
                groupSize: 3,
                secondaryGroupSize: 0,
                groupSeparator: ",",
                decimalSeparator: ".",
                fractionGroupSize: 0,
                fractionGroupSeparator: " ",
                suffix: ""
            };
            let conversionAlphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

            function formatOutputString(instance, precision, rounding, formatType) {
                let stringVal, coeffLen, exponentVal, formattedVal;
                if (rounding === void 0) {
                    rounding = roundingModeConfig;
                }
                validateNumberRange(rounding, 0, 8);
                if (!instance.coefficients) {
                    return instance.toStringRepresentation();
                }
                stringVal = instance.coefficients[0];
                exponentVal = instance.exponent;
                if (precision === void 0) {
                    formattedVal = formatCoefficientString(instance.coefficients);
                    formattedVal = 1 === formatType || 2 === formatType && (exponentVal <= expLowerBound || exponentVal >= expUpperBound) ? formatScientific(formattedVal, exponentVal) : insertDecimalPoint(formattedVal, exponentVal, "0");
                } else if (coeffLen = (instance = roundAndTruncate(new PreciseNumber(instance), precision + instance.exponent + 1, rounding)).exponent, formattedVal = formatCoefficientString(instance.coefficients), 1 === formatType || 2 === formatType && (precision <= coeffLen || coeffLen <= expLowerBound)) {
                    for (; formattedVal.length < precision; formattedVal += "0");
                    formattedVal = formatScientific(formattedVal, coeffLen);
                } else if (precision -= coeffLen, formattedVal = insertDecimalPoint(formattedVal, coeffLen, "0"), coeffLen + 1 > formattedVal.length) {
                    if (--precision > 0) {
                        for (formattedVal += "."; precision--; formattedVal += "0");
                    }
                } else if ((precision += coeffLen - formattedVal.length) > 0) {
                    for (coeffLen + 1 === formattedVal.length && (formattedVal += "."); precision--; formattedVal += "0");
                }
                return instance.sign < 0 && stringVal ? "-" + formattedVal : formattedVal;
            }

            function reduceWithComparison(numArray, comparisonMethod) {
                let currentItem, currentIdx = 1;
                let resultItem = new PreciseNumber(numArray[0]);
                while (currentIdx < numArray.length) {
                    if (!(currentItem = new PreciseNumber(numArray[currentIdx++])).sign) {
                        resultItem = currentItem;
                        break;
                    }
                    comparisonMethod.call(resultItem, currentItem) && (resultItem = currentItem);
                }
                return resultItem;
            }

            function normalizeCoefficient(instance, coefficients, exponent) {
                let idx, val;
                for (idx = 1, val = coefficients.length; !coefficients[--val]; coefficients.pop());
                for (val = coefficients[0]; val >= 10; val /= 10, idx++);
                return (exponent = idx + exponent * DIGIT_GROUP_SIZE - 1) > rangeUpperBound ? instance.coefficients = instance.exponent = void 0 : exponent < rangeLowerBound ? instance.coefficients = [instance.exponent = 0] : (instance.exponent = exponent, instance.coefficients = coefficients), instance;
            }

            function roundAndTruncate(instance, precision, roundingMode, isIntermediate) {
                let idx, coeff, currentCoeff, quotient,
                    carry, coeffLength, powerArray = POWERS_OF_TEN_ARRAY;
                if (instance.coefficients) {
                    round_label: {
                        for (idx = 1, coeff = instance.coefficients[0]; coeff >= 10; coeff /= 10, idx++);
                        if ((currentCoeff = precision - idx) < 0) {
                            currentCoeff += DIGIT_GROUP_SIZE;
                            coeffLength = precision;
                            quotient = (carry = instance.coefficients[idx = 0]) / powerArray[idx - coeffLength - 1] % 10 | 0;
                        } else if ((idx = mathFloor((currentCoeff + 1) / DIGIT_GROUP_SIZE)) >= instance.coefficients.length) {
                            if (!isIntermediate) {
                                break round_label;
                            }
                            for (; instance.coefficients.length <= idx; instance.coefficients.push(0));
                            carry = quotient = 0;
                            idx = 1;
                            coeffLength = (currentCoeff %= DIGIT_GROUP_SIZE) - DIGIT_GROUP_SIZE + 1;
                        } else {
                            for (carry = coeff = instance.coefficients[idx], idx = 1; coeff >= 10; coeff /= 10, idx++);
                            quotient = (coeffLength = (currentCoeff %= DIGIT_GROUP_SIZE) - DIGIT_GROUP_SIZE + idx) < 0 ? 0 : carry / powerArray[idx - coeffLength - 1] % 10 | 0;
                        }
                        if (isIntermediate = isIntermediate || precision < 0 || instance.coefficients[idx + 1] !== void 0 || (coeffLength < 0 ? carry : carry % powerArray[idx - coeffLength - 1]),
                            isIntermediate = roundingMode < 4 ? (quotient || isIntermediate) && (0 === roundingMode || roundingMode === (instance.sign < 0 ? 3 : 2)) : quotient > 5 || 5 === quotient && (4 === roundingMode || isIntermediate || 6 === roundingMode && (currentCoeff > 0 ? coeffLength > 0 ? carry / powerArray[idx - coeffLength] : 0 : instance.coefficients[idx - 1]) % 10 & 1 || roundingMode === (instance.sign < 0 ? 8 : 7)),
                            precision < 1 || !instance.coefficients[0]) {
                            return instance.coefficients.length = 0, isIntermediate ? (precision -= instance.exponent + 1, instance.coefficients[0] = powerArray[(DIGIT_GROUP_SIZE - precision % DIGIT_GROUP_SIZE) % DIGIT_GROUP_SIZE], instance.exponent = -precision || 0) : instance.coefficients[0] = instance.exponent = 0, instance;
                        }
                        if (0 === currentCoeff ? (instance.coefficients.length = idx, coeff = 1, idx--) : (instance.coefficients.length = idx + 1, coeff = powerArray[DIGIT_GROUP_SIZE - currentCoeff], instance.coefficients[idx] = coeffLength > 0 ? mathFloor(carry / powerArray[idx - coeffLength] % powerArray[currentCoeff]) * coeff : 0), isIntermediate) {
                            for (;;) {
                                if (0 === idx) {
                                    for (currentCoeff = 1, carry = instance.coefficients[0]; carry >= 10; carry /= 10, currentCoeff++);
                                    for (carry = instance.coefficients[0] += coeff, coeff = 1; carry >= 10; carry /= 10, coeff++);
                                    currentCoeff !== coeff && (instance.exponent++, instance.coefficients[0] === BASE && (instance.coefficients[0] = 1));
                                    break;
                                }
                                if (instance.coefficients[idx] += coeff, instance.coefficients[idx] !== BASE) {
                                    break;
                                }
                                instance.coefficients[idx--] = 0;
                                coeff = 1;
                            }
                        }
                        for (idx = instance.coefficients.length; 0 === instance.coefficients[--idx]; instance.coefficients.pop());
                    }
                    instance.exponent > rangeUpperBound ? instance.coefficients = instance.exponent = void 0 : instance.exponent < rangeLowerBound && (instance.coefficients = [instance.exponent = 0]);
                }
                return instance;
            }

            function toPrimitiveString(instance) {
                const exponentVal = instance.exponent;
                let resultString;
                return exponentVal === void 0 ? instance.toStringRepresentation() : (
                    resultString = formatCoefficientString(instance.coefficients),
                    resultString = exponentVal <= expLowerBound || exponentVal >= expUpperBound ? formatScientific(resultString, exponentVal) : insertDecimalPoint(resultString, exponentVal, "0"),
                    instance.sign < 0 ? "-" + resultString : resultString
                );
            }

            PreciseNumber.clone = bigNumFactoryRef;
            PreciseNumber.ROUND_UP = 0;
            PreciseNumber.ROUND_DOWN = 1;
            PreciseNumber.ROUND_CEIL = 2;
            PreciseNumber.ROUND_FLOOR = 3;
            PreciseNumber.ROUND_HALF_UP = 4;
            PreciseNumber.ROUND_HALF_DOWN = 5;
            PreciseNumber.ROUND_HALF_EVEN = 6;
            PreciseNumber.ROUND_HALF_CEIL = 7;
            PreciseNumber.ROUND_HALF_FLOOR = 8;
            PreciseNumber.EUCLID = 9;

            PreciseNumber.config = PreciseNumber.set = function (settingsObj) {
                let propName, propVal;
                if (settingsObj !== void 0) {
                    if (typeof settingsObj !== 'object') {
                        throw Error(errorPrefix + "Object expected: " + settingsObj);
                    }
                    if (settingsObj.hasOwnProperty(propName = "DECIMAL_PLACES") && (validateNumberRange(propVal = settingsObj[propName], 0, MULTIPLIER_BASE, propName), decimalPlacesConfig = propVal),
                        settingsObj.hasOwnProperty(propName = "ROUNDING_MODE") && (validateNumberRange(propVal = settingsObj[propName], 0, 8, propName), roundingModeConfig = propVal),
                        settingsObj.hasOwnProperty(propName = "EXPONENTIAL_AT"))) {
                        if ((propVal = settingsObj[propName]) && propVal.pop) {
                            validateNumberRange(propVal[0], -MULTIPLIER_BASE, 0, propName);
                            validateNumberRange(propVal[1], 0, MULTIPLIER_BASE, propName);
                            expLowerBound = propVal[0];
                            expUpperBound = propVal[1];
                        } else {
                            validateNumberRange(propVal, -MULTIPLIER_BASE, MULTIPLIER_BASE, propName);
                            expLowerBound = -(expUpperBound = propVal < 0 ? -propVal : propVal);
                        }
                    }
                    if (settingsObj.hasOwnProperty(propName = "RANGE")) {
                        if ((propVal = settingsObj[propName]) && propVal.pop) {
                            validateNumberRange(propVal[0], -MULTIPLIER_BASE, -1, propName);
                            validateNumberRange(propVal[1], 1, MULTIPLIER_BASE, propName);
                            rangeLowerBound = propVal[0];
                            rangeUpperBound = propVal[1];
                        } else {
                            if (validateNumberRange(propVal, -MULTIPLIER_BASE, MULTIPLIER_BASE, propName), !propVal) {
                                throw Error(errorPrefix + propName + " cannot be zero: " + propVal);
                            }
                            rangeLowerBound = -(rangeUpperBound = propVal < 0 ? -propVal : propVal);
                        }
                    }
                    if (settingsObj.hasOwnProperty(propName = "CRYPTO")) {
                        if ((propVal = settingsObj[propName]) !== !!propVal) {
                            throw Error(errorPrefix + propName + " not true or false: " + propVal);
                        }
                        if (propVal) {
                            if (typeof crypto === 'undefined' || !crypto || !crypto.getRandomValues && !crypto.randomBytes) {
                                throw useCryptoRNG = !propVal, Error(errorPrefix + "crypto unavailable");
                            }
                            useCryptoRNG = propVal;
                        } else {
                            useCryptoRNG = propVal;
                        }
                    }
                    if (settingsObj.hasOwnProperty(propName = "MODULO_MODE") && (validateNumberRange(propVal = settingsObj[propName], 0, 9, propName), moduloModeConfig = propVal),
                        settingsObj.hasOwnProperty(propName = "POW_PRECISION") && (validateNumberRange(propVal = settingsObj[propName], 0, MULTIPLIER_BASE, propName), powerPrecision = propVal),
                        settingsObj.hasOwnProperty(propName = "FORMAT"))) {
                        if (typeof(propVal = settingsObj[propName]) !== 'object') {
                            throw Error(errorPrefix + propName + " not an object: " + propVal);
                        }
                        formatSettings = propVal;
                    }
                    if (settingsObj.hasOwnProperty(propName = "ALPHABET")) {
                        if (typeof(propVal = settingsObj[propName]) !== 'string' || /^.$|[+-.\s]|(.).*\1/.test(propVal)) {
                            throw Error(errorPrefix + propName + " invalid: " + propVal);
                        }
                        conversionAlphabet = propVal;
                    }
                }
                return {
                    DECIMAL_PLACES: decimalPlacesConfig,
                    ROUNDING_MODE: roundingModeConfig,
                    EXPONENTIAL_AT: [expLowerBound, expUpperBound],
                    RANGE: [rangeLowerBound, rangeUpperBound],
                    CRYPTO: useCryptoRNG,
                    MODULO_MODE: moduloModeConfig,
                    POW_PRECISION: powerPrecision,
                    FORMAT: formatSettings,
                    ALPHABET: conversionAlphabet
                };
            };

            PreciseNumber.isPreciseNumber = function (val) {
                if (!val || !0 !== val._isPreciseNumber) {
                    return !1;
                }
                if (!PreciseNumber.DEBUG) {
                    return !0;
                }
                let idx, entry, coeffs = val.coefficients,
                    exponent = val.exponent,
                    sign = val.sign;
                e: if ("[object Array]" === {}.toString.call(coeffs)) {
                    if ((1 === sign || -1 === sign) && exponent >= -MULTIPLIER_BASE && exponent <= MULTIPLIER_BASE && exponent === mathFloor(exponent)) {
                        if (0 === coeffs[0]) {
                            if (0 === exponent && 1 === coeffs.length) {
                                return !0;
                            }
                            break e;
                        }
                        if ((idx = (exponent + 1) % DIGIT_GROUP_SIZE) < 1 && (idx += DIGIT_GROUP_SIZE), String(coeffs[0]).length === idx) {
                            for (idx = 0; idx < coeffs.length; idx++) {
                                if ((entry = coeffs[idx]) < 0 || entry >= BASE || entry !== mathFloor(entry)) {
                                    break e;
                                }
                            }
                            if (0 !== entry) {
                                return !0;
                            }
                        }
                    } else if (coeffs === void 0 && exponent === void 0 && (sign === void 0 || 1 === sign || -1 === sign)) {
                        return !0;
                    }
                    throw Error(errorPrefix + "Invalid PreciseNumber: " + val);
                }
            };

            PreciseNumber.maximum = PreciseNumber.max = function () {
                return reduceWithComparison(arguments, PreciseNumberProto.isLess);
            };

            PreciseNumber.minimum = PreciseNumber.min = function () {
                return reduceWithComparison(arguments, PreciseNumberProto.isGreater);
            };

            PreciseNumber.generateRandom = (function () {
                let randomValGenerator = (9007199254740992 * Math.random() & 2097151) ? function () {
                    return mathFloor(9007199254740992 * Math.random());
                } : function () {
                    return 8388608 * (1073741824 * Math.random() | 0) + (8388608 * Math.random() | 0);
                };
                return function (numDigits) {
                    let randomArray, val, tempDigits,
                        idx = 0,
                        coeffs = [],
                        resultNum = new PreciseNumber(ONE_INSTANCE);
                    if (numDigits === void 0) {
                        numDigits = decimalPlacesConfig;
                    } else {
                        validateNumberRange(numDigits, 0, MULTIPLIER_BASE);
                    }
                    tempDigits = mathCeil(numDigits / DIGIT_GROUP_SIZE);
                    if (useCryptoRNG) {
                        if (crypto.getRandomValues) {
                            for (randomArray = crypto.getRandomValues(new Uint32Array(tempDigits *= 2)); idx < tempDigits;) {
                                (val = 131072 * randomArray[idx] + (randomArray[idx + 1] >>> 11)) >= 9e15 ? (tempDigits = crypto.getRandomValues(new Uint32Array(2)), randomArray[idx] = tempDigits[0], randomArray[idx + 1] = tempDigits[1]) : (coeffs.push(val % 1e14), idx += 2);
                            }
                            idx = tempDigits / 2;
                        } else {
                            if (!crypto.randomBytes) {
                                throw useCryptoRNG = !1, Error(errorPrefix + "crypto unavailable");
                            }
                            for (randomArray = crypto.randomBytes(tempDigits *= 7); idx < tempDigits;) {
                                (val = 281474976710656 * (31 & randomArray[idx]) + 1099511627776 * randomArray[idx + 1] + 4294967296 * randomArray[idx + 2] + 16777216 * randomArray[idx + 3] + (randomArray[idx + 4] << 16) + (randomArray[idx + 5] << 8) + randomArray[idx + 6]) >= 9e15 ? crypto.randomBytes(7).copy(randomArray, idx) : (coeffs.push(val % 1e14), idx += 7);
                            }
                            idx = tempDigits / 7;
                        }
                    }
                    if (!useCryptoRNG) {
                        for (; idx < tempDigits;) {
                            (val = randomValGenerator()) < 9e15 && (coeffs[idx++] = val % 1e14);
                        }
                    }
                    for (tempDigits = coeffs[--idx], numDigits %= DIGIT_GROUP_SIZE, tempDigits && numDigits && (val = POWERS_OF_TEN_ARRAY[DIGIT_GROUP_SIZE - numDigits], coeffs[idx] = mathFloor(tempDigits / val) * val); 0 === coeffs[idx]; coeffs.pop(), idx--);
                    if (idx < 0) {
                        coeffs = [tempDigits = 0];
                    } else {
                        for (tempDigits = -1; 0 === coeffs[0]; coeffs.splice(0, 1), tempDigits -= DIGIT_GROUP_SIZE);
                        for (idx = 1, val = coeffs[0]; val >= 10; val /= 10, idx++);
                        idx < DIGIT_GROUP_SIZE && (tempDigits -= DIGIT_GROUP_SIZE - idx);
                    }
                    return resultNum.exponent = tempDigits, resultNum.coefficients = coeffs, resultNum;
                };
            })();

            PreciseNumber.sumAll = function () {
                let currentIdx = 1,
                    args = arguments,
                    sumResult = new PreciseNumber(args[0]);
                while (currentIdx < args.length) {
                    sumResult = sumResult.add(args[currentIdx++]);
                }
                return sumResult;
            };

            const baseConvertHelper = (function () {
                function convertToBaseTen(digits, sourceBase, targetBase, charMap) {
                    let idx, val, tempArr = [0],
                        len = 0,
                        totalLen = digits.length;
                    while (len < totalLen) {
                        for (val = tempArr.length; val--; tempArr[val] *= sourceBase);
                        for (tempArr[0] += charMap.indexOf(digits.charAt(len++)), idx = 0; idx < tempArr.length; idx++) {
                            tempArr[idx] > targetBase - 1 && (tempArr[idx + 1] === void 0 && (tempArr[idx + 1] = 0), tempArr[idx + 1] += tempArr[idx] / targetBase | 0, tempArr[idx] %= targetBase);
                        }
                    }
                    return tempArr.reverse();
                }

                return function (inputString, sourceBase, targetBase, isSigned, targetCharSet) {
                    let tempNum, outputString, decimalPointPos,
                        decimalPlaces = decimalPlacesConfig,
                        rounding = roundingModeConfig;
                    if (inputString.indexOf(".") >= 0) {
                        tempNum = powerPrecision;
                        powerPrecision = 0;
                        inputString = inputString.replace(".", "");
                        outputString = (new PreciseNumber(sourceBase)).power(inputString.length - decimalPointPos);
                        powerPrecision = tempNum;
                        outputString.coefficients = convertToBaseTen(insertDecimalPoint(formatCoefficientString(outputString.coefficients), outputString.exponent, "0"), 10, targetBase, "0123456789");
                        outputString.exponent = outputString.coefficients.length;
                    }
                    let convertedCoeffs = convertToBaseTen(inputString, sourceBase, targetBase, isSigned ? (tempNum = conversionAlphabet, "0123456789") : (tempNum = "0123456789", conversionAlphabet));
                    let coeffIdx = convertedCoeffs.length;
                    for (; 0 === convertedCoeffs[--coeffIdx]; convertedCoeffs.pop());
                    if (!convertedCoeffs[0]) {
                        return tempNum.charAt(0);
                    }
                    if (decimalPointPos < 0) {
                        --coeffIdx;
                    } else {
                        outputString.coefficients = convertedCoeffs;
                        outputString.exponent = coeffIdx;
                        outputString.sign = isSigned;
                        convertedCoeffs = (outputString = divisionAlgorithm(outputString, outputString, decimalPlaces, rounding, targetBase)).coefficients;
                        outputString = outputString.remainder;
                        coeffIdx = outputString.exponent;
                    }
                    decimalPointPos = convertedCoeffs[outputString + decimalPlaces + 1];
                    let halfTargetBase = targetBase / 2;
                    outputString = outputString || outputString < 0 || convertedCoeffs[outputString + 1] !== void 0;
                    outputString = rounding < 4 ? (decimalPointPos !== void 0 || outputString) && (0 === rounding || rounding === (outputString.sign < 0 ? 3 : 2)) : decimalPointPos > halfTargetBase || decimalPointPos === halfTargetBase && (4 === rounding || outputString || 6 === rounding && 1 & convertedCoeffs[outputString - 1] || rounding === (outputString.sign < 0 ? 8 : 7));
                    if (outputString < 1 || !convertedCoeffs[0]) {
                        inputString = outputString ? insertDecimalPoint(tempNum.charAt(1), -decimalPlaces, tempNum.charAt(0)) : tempNum.charAt(0);
                    } else {
                        if (convertedCoeffs.length = outputString, outputString) {
                            for (--targetBase; ++convertedCoeffs[--outputString] > targetBase;) {
                                convertedCoeffs[outputString] = 0;
                                outputString || (++coeffIdx, convertedCoeffs = [1].concat(convertedCoeffs));
                            }
                        }
                        for (halfTargetBase = convertedCoeffs.length; !convertedCoeffs[--halfTargetBase];);
                        for (decimalPointPos = 0, inputString = ""; decimalPointPos <= halfTargetBase; inputString += tempNum.charAt(convertedCoeffs[decimalPointPos++]));
                        inputString = insertDecimalPoint(inputString, coeffIdx, tempNum.charAt(0));
                    }
                    return inputString;
                };
            })();

            const divisionAlgorithm = (function () {
                function multiplyCoefficients(coeffs, factor, base) {
                    let idx, val, carry = 0,
                        len = coeffs.length,
                        factorLow = factor % DIVIDEND_BASE,
                        factorHigh = factor / DIVIDEND_BASE | 0;
                    coeffs = coeffs.slice();
                    while (len--) {
                        carry = ((val = factorLow * (val = coeffs[len] % DIVIDEND_BASE) + (idx = factorHigh * val + (coeffs[len] / DIVIDEND_BASE | 0) * factorLow) % DIVIDEND_BASE * DIVIDEND_BASE + carry) / base | 0) + (idx / DIVIDEND_BASE | 0) + factorHigh * (coeffs[len] / DIVIDEND_BASE | 0);
                        coeffs[len] = val % base;
                    }
                    return carry && (coeffs = [carry].concat(coeffs)), coeffs;
                }

                function compareCoefficientArrays(arrA, arrB, lenA, lenB) {
                    let idx, result;
                    if (lenA !== lenB) {
                        result = lenA > lenB ? 1 : -1;
                    } else {
                        for (idx = result = 0; idx < lenA; idx++) {
                            if (arrA[idx] !== arrB[idx]) {
                                result = arrA[idx] > arrB[idx] ? 1 : -1;
                                break;
                            }
                        }
                    }
                    return result;
                }

                function subtractCoefficients(targetCoeffs, subtrahendCoeffs, len, base) {
                    let idx = 0;
                    while (len--) {
                        targetCoeffs[len] -= idx;
                        idx = targetCoeffs[len] < subtrahendCoeffs[len] ? 1 : 0;
                        targetCoeffs[len] = idx * base + targetCoeffs[len] - subtrahendCoeffs[len];
                    }
                    for (; !targetCoeffs[0] && targetCoeffs.length > 1; targetCoeffs.splice(0, 1));
                }

                return function (dividend, divisor, decimalPlaces, roundingMode, base) {
                    let currentQuotient, currentDividend,
                        dividendExp, divisorExp,
                        dividendCoeffs, divisorCoeffs,
                        dividendSign = dividend.sign,
                        divisorSign = divisor.sign,
                        compareResult = dividendSign === divisorSign ? 1 : -1,
                        quotientCoeffs = (currentDividend = new PreciseNumber(compareResult)).coefficients = [];
                    dividendCoeffs = dividend.coefficients;
                    divisorCoeffs = divisor.coefficients;
                    if (!(dividendCoeffs && dividendCoeffs[0] && divisorCoeffs && divisorCoeffs[0])) {
                        return new PreciseNumber(dividendSign && divisorSign && (dividendCoeffs ? !divisorCoeffs || dividendCoeffs[0] !== divisorCoeffs[0] : divisorCoeffs) ? dividendCoeffs && 0 === dividendCoeffs[0] || !divisorCoeffs ? 0 * compareResult : compareResult / 0 : NaN);
                    }
                    let precisionReq = decimalPlaces + (dividendExp = dividend.exponent - divisor.exponent) + 1;
                    base = base || BASE;
                    !base && (base = DIGIT_GROUP_SIZE, dividendExp = floorInt(dividend.exponent / DIGIT_GROUP_SIZE) - floorInt(divisor.exponent / DIGIT_GROUP_SIZE), precisionReq = precisionReq / DIGIT_GROUP_SIZE | 0);
                    let p = 0;
                    while (divisorCoeffs[p] === (dividendCoeffs[p] || 0)) {
                        p++;
                    }
                    if (divisorCoeffs[p] > (dividendCoeffs[p] || 0) && dividendExp--) {
                    }
                    if (precisionReq < 0) {
                        quotientCoeffs.push(1);
                        currentQuotient = !0;
                    } else {
                        let lenD = dividendCoeffs.length;
                        let lenB = divisorCoeffs.length;
                        let dividendIdx = 0;
                        precisionReq += 2;
                        let scalingFactor = mathFloor(base / (divisorCoeffs[0] + 1));
                        if (scalingFactor > 1) {
                            divisorCoeffs = multiplyCoefficients(divisorCoeffs, scalingFactor, base);
                            dividendCoeffs = multiplyCoefficients(dividendCoeffs, scalingFactor, base);
                            lenB = divisorCoeffs.length;
                            lenD = dividendCoeffs.length;
                        }
                        let tempDivisorLen = lenB;
                        let tempDividendPart = dividendCoeffs.slice(0, lenB);
                        let tempDividendPartLen = tempDividendPart.length;
                        while (tempDividendPartLen < lenB) {
                            tempDividendPart[tempDividendPartLen++] = 0;
                        }
                        let divisorCopy = divisorCoeffs.slice();
                        divisorCopy = [0].concat(divisorCopy);
                        let firstDivisorCoeff = divisorCoeffs[0];
                        divisorCoeffs[1] >= base / 2 && firstDivisorCoeff++;
                        do {
                            let digitEstimate = 0;
                            let comparison = compareCoefficientArrays(divisorCoeffs, tempDividendPart, lenB, tempDividendPartLen);
                            if (comparison < 0) {
                                let firstDividendPartCoeff = tempDividendPart[0];
                                if (lenB !== tempDividendPartLen) {
                                    firstDividendPartCoeff = firstDividendPartCoeff * base + (tempDividendPart[1] || 0);
                                }
                                digitEstimate = mathFloor(firstDividendPartCoeff / firstDivisorCoeff);
                                if (digitEstimate > 1) {
                                    if (digitEstimate >= base) {
                                        digitEstimate = base - 1;
                                    }
                                    let multipliedDivisor = multiplyCoefficients(divisorCoeffs, digitEstimate, base);
                                    let multipliedDivisorLen = multipliedDivisor.length;
                                    tempDividendPartLen = tempDividendPart.length;
                                    while (1 === compareCoefficientArrays(multipliedDivisor, tempDividendPart, multipliedDivisorLen, tempDividendPartLen)) {
                                        digitEstimate--;
                                        subtractCoefficients(multipliedDivisor, lenB < multipliedDivisorLen ? divisorCopy : divisorCoeffs, multipliedDivisorLen, base);
                                        multipliedDivisorLen = multipliedDivisor.length;
                                    }
                                } else if (0 === digitEstimate) {
                                    comparison = digitEstimate = 1;
                                    let multipliedDivisor = divisorCoeffs.slice();
                                    let multipliedDivisorLen = multipliedDivisor.length;
                                }
                                if (multipliedDivisorLen < tempDividendPartLen && (multipliedDivisor = [0].concat(multipliedDivisor)), subtractCoefficients(tempDividendPart, multipliedDivisor, tempDividendPartLen, base), tempDividendPartLen = tempDividendPart.length, -1 === comparison) {
                                    while (compareCoefficientArrays(divisorCoeffs, tempDividendPart, lenB, tempDividendPartLen) < 1) {
                                        digitEstimate++;
                                        subtractCoefficients(tempDividendPart, lenB < tempDividendPartLen ? divisorCopy : divisorCoeffs, tempDividendPartLen, base);
                                        tempDividendPartLen = tempDividendPart.length;
                                    }
                                }
                            } else if (0 === comparison) {
                                digitEstimate++;
                                tempDividendPart = [0];
                            }
                            quotientCoeffs[p++] = digitEstimate;
                            tempDividendPart[0] ? tempDividendPart[tempDividendPartLen++] = dividendCoeffs[dividendIdx] || 0 : (tempDividendPart = [dividendCoeffs[dividendIdx]], tempDividendPartLen = 1);
                        } while ((dividendIdx++ < lenD || tempDividendPart[0] !== void 0) && precisionReq--);
                        currentQuotient = tempDividendPart[0] !== void 0;
                        quotientCoeffs[0] || quotientCoeffs.splice(0, 1);
                    }
                    if (base === BASE) {
                        normalizeCoefficient(currentDividend, quotientCoeffs, decimalPlaces + (currentDividend.exponent = dividendExp * DIGIT_GROUP_SIZE - 1) + 1, roundingMode, currentQuotient);
                    } else {
                        currentDividend.exponent = dividendExp;
                        currentDividend.remainder = +currentQuotient;
                    }
                    return currentDividend;
                };
            })();

            const hexOctBinRegex = /^(-?)0([xbo])(?=\w[\w.]*$)/i;
            const leadingDecimalRegex = /^([^.]+)\.$/;
            const trailingDecimalRegex = /^\.([^.]+)$/;
            const infinityNaNRegex = /^-?(Infinity|NaN)$/;
            const whitespaceStripRegex = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            const parseInputString = function (instance, inputStr, isNumber, base) {
                let tempBase, processedString = isNumber ? inputStr : inputStr.replace(whitespaceStripRegex, "");
                if (infinityNaNRegex.test(processedString)) {
                    instance.sign = isNaN(processedString) ? void 0 : processedString < 0 ? -1 : 1;
                } else {
                    if (!isNumber && (processedString = processedString.replace(hexOctBinRegex, function (match, sign, type) {
                        return tempBase = "x" === (type = type.toLowerCase()) ? 16 : "b" === type ? 2 : 8, base && base !== tempBase ? match : sign;
                    }), base && (tempBase = base, processedString = processedString.replace(leadingDecimalRegex, "$1").replace(trailingDecimalRegex, "0.$1")), inputStr !== processedString)) {
                        return new PreciseNumber(processedString, tempBase);
                    }
                    if (PreciseNumber.DEBUG) {
                        throw Error(errorPrefix + "Not a" + (base ? " base " + base : "") + " number: " + inputStr);
                    }
                    instance.sign = void 0;
                }
                instance.coefficients = instance.exponent = void 0;
            };

            PreciseNumberProto.absoluteValue = PreciseNumberProto.abs = function () {
                const newInstance = new PreciseNumber(this);
                return newInstance.sign < 0 && (newInstance.sign = 1), newInstance;
            };

            PreciseNumberProto.compare = function (otherVal, otherBase) {
                return compareValues(this, new PreciseNumber(otherVal, otherBase));
            };

            PreciseNumberProto.decimalDigitCount = PreciseNumberProto.dp = function (precision, rounding) {
                let numCoeffs, totalDigits, lastCoeff, instance = this;
                if (precision !== void 0) {
                    validateNumberRange(precision, 0, MULTIPLIER_BASE);
                    if (rounding === void 0) {
                        rounding = roundingModeConfig;
                    } else {
                        validateNumberRange(rounding, 0, 8);
                    }
                    return roundAndTruncate(new PreciseNumber(instance), precision + instance.exponent + 1, rounding);
                }
                if (!(numCoeffs = instance.coefficients)) {
                    return void 0;
                }
                if (totalDigits = ((lastCoeff = numCoeffs.length - 1) - floorInt(this.exponent / DIGIT_GROUP_SIZE)) * DIGIT_GROUP_SIZE, lastCoeff = numCoeffs[lastCoeff]) {
                    for (; lastCoeff % 10 === 0; lastCoeff /= 10, totalDigits--);
                }
                return totalDigits < 0 && (totalDigits = 0), totalDigits;
            };

            PreciseNumberProto.divide = PreciseNumberProto.div = function (divisorVal, baseVal) {
                return divisionAlgorithm(this, new PreciseNumber(divisorVal, baseVal), decimalPlacesConfig, roundingModeConfig);
            };

            PreciseNumberProto.integerDivide = PreciseNumberProto.idiv = function (divisorVal, baseVal) {
                return divisionAlgorithm(this, new PreciseNumber(divisorVal, baseVal), 0, 1);
            };

            PreciseNumberProto.power = PreciseNumberProto.pow = function (exponentVal, moduloVal) {
                let halfExp, currentExp, isOddExp,
                    powerTarget, isPowerNegative,
                    tempResult, currentInstance = this;
                if ((exponentVal = new PreciseNumber(exponentVal)).coefficients && !exponentVal.isInteger()) {
                    throw Error(errorPrefix + "Exponent not an integer: " + toPrimitiveString(exponentVal));
                }
                if (moduloVal !== void 0 && (moduloVal = new PreciseNumber(moduloVal)),
                    !currentInstance.coefficients || !currentInstance.coefficients[0] || 1 === currentInstance.coefficients[0] && !currentInstance.exponent && 1 === currentInstance.coefficients.length || !exponentVal.coefficients || !exponentVal.coefficients[0]) {
                    powerTarget = new PreciseNumber(Math.pow(+toPrimitiveString(currentInstance), exponentVal.exponent > 14 ? 2 - isOdd(exponentVal) : +toPrimitiveString(exponentVal)));
                    return moduloVal ? powerTarget.remainder(moduloVal) : powerTarget;
                }
                isPowerNegative = exponentVal.sign < 0;
                if (moduloVal) {
                    if (moduloVal.coefficients && !moduloVal.coefficients[0] || !moduloVal.sign) {
                        return new PreciseNumber(NaN);
                    }
                    (currentExp = !isPowerNegative && currentInstance.isInteger() && moduloVal.isInteger()) && (currentInstance = currentInstance.remainder(moduloVal));
                } else {
                    if (exponentVal.exponent > 9 && (currentInstance.exponent > 0 || currentInstance.exponent < -1 || (0 === currentInstance.exponent ? currentInstance.coefficients[0] > 1 || exponentVal.exponent > 14 && currentInstance.coefficients[1] >= 24e7 : currentInstance.coefficients[0] < 8e13 || exponentVal.exponent > 14 && currentInstance.coefficients[0] <= 9999975e7))) {
                        powerTarget = currentInstance.sign < 0 && isOdd(exponentVal) ? -0 : 0;
                        currentInstance.exponent > -1 && (powerTarget = 1 / powerTarget);
                        return new PreciseNumber(isPowerNegative ? 1 / powerTarget : powerTarget);
                    }
                    powerPrecision && (powerTarget = mathCeil(powerPrecision / DIGIT_GROUP_SIZE + 2));
                }
                for (exponentVal.exponent > 14 ? (halfExp = new PreciseNumber(.5), isPowerNegative && (exponentVal.sign = 1), isOddExp = isOdd(exponentVal)) : isOddExp = (currentExp = Math.abs(+toPrimitiveString(exponentVal))) % 2, tempResult = new PreciseNumber(ONE_INSTANCE);;) {
                    if (isOddExp) {
                        if (!(tempResult = tempResult.multiply(currentInstance)).coefficients) {
                            break;
                        }
                        powerTarget ? tempResult.coefficients.length > powerTarget && (tempResult.coefficients.length = powerTarget) : currentExp && (tempResult = tempResult.remainder(moduloVal));
                    }
                    if (currentExp) {
                        if (0 === (currentExp = mathFloor(currentExp / 2))) {
                            break;
                        }
                        isOddExp = currentExp % 2;
                    } else if (roundAndTruncate(exponentVal = exponentVal.multiply(halfExp), exponentVal.exponent + 1, 1), exponentVal.exponent > 14) {
                        isOddExp = isOdd(exponentVal);
                    } else {
                        if (0 === (currentExp = +toPrimitiveString(exponentVal))) {
                            break;
                        }
                        isOddExp = currentExp % 2;
                    }
                    currentInstance = currentInstance.multiply(currentInstance);
                    powerTarget ? currentInstance.coefficients && currentInstance.coefficients.length > powerTarget && (currentInstance.coefficients.length = powerTarget) : currentExp && (currentInstance = currentInstance.remainder(moduloVal));
                }
                return currentExp ? tempResult : (isPowerNegative && (tempResult = ONE_INSTANCE.divide(tempResult)), moduloVal ? tempResult.remainder(moduloVal) : powerTarget ? roundAndTruncate(tempResult, powerPrecision, roundingModeConfig, void 0) : tempResult);
            };

            PreciseNumberProto.integerPart = function (rounding) {
                const newInstance = new PreciseNumber(this);
                return rounding === void 0 ? rounding = roundingModeConfig : validateNumberRange(rounding, 0, 8), roundAndTruncate(newInstance, newInstance.exponent + 1, rounding);
            };

            PreciseNumberProto.isEqual = PreciseNumberProto.eq = function (otherVal, otherBase) {
                return 0 === compareValues(this, new PreciseNumber(otherVal, otherBase));
            };

            PreciseNumberProto.isFinite = function () {
                return !!this.coefficients;
            };

            PreciseNumberProto.isGreater = PreciseNumberProto.gt = function (otherVal, otherBase) {
                return compareValues(this, new PreciseNumber(otherVal, otherBase)) > 0;
            };

            PreciseNumberProto.isGreaterOrEqual = PreciseNumberProto.gte = function (otherVal, otherBase) {
                const comparison = compareValues(this, new PreciseNumber(otherVal, otherBase));
                return 1 === comparison || 0 === comparison;
            };

            PreciseNumberProto.isInteger = function () {
                return !!this.coefficients && floorInt(this.exponent / DIGIT_GROUP_SIZE) > this.coefficients.length - 2;
            };

            PreciseNumberProto.isLess = PreciseNumberProto.lt = function (otherVal, otherBase) {
                return compareValues(this, new PreciseNumber(otherVal, otherBase)) < 0;
            };

            PreciseNumberProto.isLessOrEqual = PreciseNumberProto.lte = function (otherVal, otherBase) {
                const comparison = compareValues(this, new PreciseNumber(otherVal, otherBase));
                return -1 === comparison || 0 === comparison;
            };

            PreciseNumberProto.isNotANumber = function () {
                return !this.sign;
            };

            PreciseNumberProto.isNegative = function () {
                return this.sign < 0;
            };

            PreciseNumberProto.isPositive = function () {
                return this.sign > 0;
            };

            PreciseNumberProto.isZero = function () {
                return !!this.coefficients && 0 === this.coefficients[0];
            };

            PreciseNumberProto.subtract = function (subtrahendVal, baseVal) {
                let lenA, lenB, minLen,
                    currentInstance = this,
                    instanceSign = currentInstance.sign;
                subtrahendVal = new PreciseNumber(subtrahendVal, baseVal);
                let subtrahendSign = subtrahendVal.sign;
                if (!instanceSign || !subtrahendSign) {
                    return new PreciseNumber(NaN);
                }
                if (instanceSign !== subtrahendSign) {
                    return subtrahendVal.sign = -subtrahendSign, currentInstance.add(subtrahendVal);
                }
                let expA = currentInstance.exponent / DIGIT_GROUP_SIZE;
                let expB = subtrahendVal.exponent / DIGIT_GROUP_SIZE;
                let coeffsA = currentInstance.coefficients;
                let coeffsB = subtrahendVal.coefficients;
                if (!expA || !expB) {
                    if (!coeffsA || !coeffsB) {
                        return coeffsA ? (subtrahendVal.sign = -subtrahendSign, subtrahendVal) : new PreciseNumber(coeffsB ? currentInstance : NaN);
                    }
                    if (!coeffsA[0] || !coeffsB[0]) {
                        return coeffsB[0] ? (subtrahendVal.sign = -subtrahendSign, subtrahendVal) : new PreciseNumber(coeffsA[0] ? currentInstance : 3 === roundingModeConfig ? -0 : 0);
                    }
                }
                expA = floorInt(expA);
                expB = floorInt(expB);
                coeffsA = coeffsA.slice();
                if (instanceSign = expA - expB) {
                    let tempArr;
                    (minLen = instanceSign < 0) ? (instanceSign = -instanceSign, tempArr = coeffsA) : (expB = expA, tempArr = coeffsB);
                    tempArr.reverse();
                    for (; instanceSign--; tempArr.push(0));
                    tempArr.reverse();
                } else {
                    minLen = (lenA = coeffsA.length) < (lenB = coeffsB.length);
                    let idx = 0;
                    for (; idx < (minLen ? lenA : lenB); idx++) {
                        if (coeffsA[idx] !== coeffsB[idx]) {
                            minLen = coeffsA[idx] < coeffsB[idx];
                            break;
                        }
                    }
                }
                if (minLen && (tempArr = coeffsA, coeffsA = coeffsB, coeffsB = tempArr, subtrahendVal.sign = -subtrahendVal.sign), (instanceSign = (lenA = coeffsB.length) - (lenB = coeffsA.length)) > 0) {
                    for (; instanceSign--; coeffsA[lenB++] = 0);
                }
                for (instanceSign = BASE - 1; lenA > minLen;) {
                    if (coeffsA[--lenA] < coeffsB[lenA]) {
                        for (lenB = lenA; lenB && !coeffsA[--lenB]; coeffsA[lenB] = instanceSign);
                        --coeffsA[lenB];
                        coeffsA[lenA] += BASE;
                    }
                    coeffsA[lenA] -= coeffsB[lenA];
                }
                for (; 0 === coeffsA[0]; coeffsA.splice(0, 1), --expB);
                return coeffsA[0] ? normalizeCoefficient(subtrahendVal, coeffsA, expB) : (subtrahendVal.sign = 3 === roundingModeConfig ? -1 : 1, subtrahendVal.coefficients = [subtrahendVal.exponent = 0], subtrahendVal);
            };

            PreciseNumberProto.remainder = PreciseNumberProto.mod = function (divisorVal, baseVal) {
                let integerQuotient, divisorSign, instance = this;
                divisorVal = new PreciseNumber(divisorVal, baseVal);
                if (!instance.coefficients || !divisorVal.sign || divisorVal.coefficients && !divisorVal.coefficients[0]) {
                    return new PreciseNumber(NaN);
                }
                if (!divisorVal.coefficients || instance.coefficients && !instance.coefficients[0]) {
                    return new PreciseNumber(instance);
                }
                if (9 === moduloModeConfig) {
                    divisorSign = divisorVal.sign;
                    divisorVal.sign = 1;
                    integerQuotient = divisionAlgorithm(instance, divisorVal, 0, 3);
                    divisorVal.sign = divisorSign;
                    integerQuotient.sign *= divisorSign;
                } else {
                    integerQuotient = divisionAlgorithm(instance, divisorVal, 0, moduloModeConfig);
                }
                instance = instance.subtract(integerQuotient.multiply(divisorVal));
                return instance.coefficients[0] || 1 !== moduloModeConfig || (instance.sign = this.sign), instance;
            };

            PreciseNumberProto.multiply = PreciseNumberProto.times = function (multiplierVal, baseVal) {
                let firstCoeff, secondCoeff, firstLen, secondLen,
                    idx, carry, sumVal, productLow, productHigh,
                    tempArr, swapArr,
                    currentInstance = this,
                    instanceCoeffs = currentInstance.coefficients,
                    multiplierCoeffs = (multiplierVal = new PreciseNumber(multiplierVal, baseVal)).coefficients;
                if (!(instanceCoeffs && multiplierCoeffs && instanceCoeffs[0] && multiplierCoeffs[0])) {
                    return !currentInstance.sign || !multiplierVal.sign || instanceCoeffs && !instanceCoeffs[0] && !multiplierCoeffs || multiplierCoeffs && !multiplierCoeffs[0] && !instanceCoeffs ?
                        (multiplierVal.coefficients = multiplierVal.exponent = multiplierVal.sign = void 0) :
                        (multiplierVal.sign *= currentInstance.sign, instanceCoeffs && multiplierCoeffs ? (multiplierVal.coefficients = [0], multiplierVal.exponent = 0) : multiplierVal.coefficients = multiplierVal.exponent = void 0),
                        multiplierVal;
                }
                firstCoeff = floorInt(currentInstance.exponent / DIGIT_GROUP_SIZE) + floorInt(multiplierVal.exponent / DIGIT_GROUP_SIZE);
                multiplierVal.sign *= currentInstance.sign;
                (firstLen = instanceCoeffs.length) < (secondLen = multiplierCoeffs.length) && (swapArr = instanceCoeffs, instanceCoeffs = multiplierCoeffs, multiplierCoeffs = swapArr, idx = firstLen, firstLen = secondLen, secondLen = idx);
                idx = firstLen + secondLen;
                tempArr = [];
                while (idx--) {
                    tempArr.push(0);
                }
                const baseMultiplier = BASE;
                const baseDivider = DIVIDEND_BASE;
                idx = secondLen;
                while (--idx >= 0) {
                    carry = 0;
                    productLow = multiplierCoeffs[idx] % baseDivider;
                    productHigh = multiplierCoeffs[idx] / baseDivider | 0;
                    sumVal = idx + (firstCoeff = firstLen);
                    while (sumVal > idx) {
                        carry = ((firstCoeff = productLow * (firstCoeff = instanceCoeffs[--firstCoeff] % baseDivider) + (secondCoeff = productHigh * firstCoeff + (currentInstance = instanceCoeffs[firstCoeff] / baseDivider | 0) * productLow) % baseDivider * baseDivider + tempArr[sumVal] + carry) / baseMultiplier | 0) + (secondCoeff / baseDivider | 0) + productHigh * currentInstance;
                        tempArr[sumVal--] = firstCoeff % baseMultiplier;
                    }
                    tempArr[sumVal] = carry;
                }
                return carry ? ++firstCoeff : tempArr.splice(0, 1), normalizeCoefficient(multiplierVal, tempArr, firstCoeff);
            };

            PreciseNumberProto.negate = function () {
                const newInstance = new PreciseNumber(this);
                return newInstance.sign = -newInstance.sign || void 0, newInstance;
            };

            PreciseNumberProto.add = function (addendVal, baseVal) {
                let lenA, currentInstance = this,
                    instanceSign = currentInstance.sign;
                addendVal = new PreciseNumber(addendVal, baseVal);
                let addendSign = addendVal.sign;
                if (!instanceSign || !addendSign) {
                    return new PreciseNumber(NaN);
                }
                if (instanceSign !== addendSign) {
                    return addendVal.sign = -addendSign, currentInstance.subtract(addendVal);
                }
                let expA = currentInstance.exponent / DIGIT_GROUP_SIZE;
                let expB = addendVal.exponent / DIGIT_GROUP_SIZE;
                let coeffsA = currentInstance.coefficients;
                let coeffsB = addendVal.coefficients;
                if (!expA || !expB) {
                    if (!coeffsA || !coeffsB) {
                        return new PreciseNumber(instanceSign / 0);
                    }
                    if (!coeffsA[0] || !coeffsB[0]) {
                        return coeffsB[0] ? addendVal : new PreciseNumber(coeffsA[0] ? currentInstance : 0 * instanceSign);
                    }
                }
                expA = floorInt(expA);
                expB = floorInt(expB);
                coeffsA = coeffsA.slice();
                if (instanceSign = expA - expB) {
                    let tempArr;
                    instanceSign > 0 ? (expB = expA, tempArr = coeffsB) : (instanceSign = -instanceSign, tempArr = coeffsA);
                    tempArr.reverse();
                    for (; instanceSign--; tempArr.push(0));
                    tempArr.reverse();
                }
                (lenA = coeffsA.length) - (addendSign = coeffsB.length) < 0 && (tempArr = coeffsB, coeffsB = coeffsA, coeffsA = tempArr, addendSign = lenA);
                lenA = 0;
                while (addendSign) {
                    lenA = (coeffsA[--addendSign] = coeffsA[addendSign] + coeffsB[addendSign] + lenA) / BASE | 0;
                    coeffsA[addendSign] = BASE === coeffsA[addendSign] ? 0 : coeffsA[addendSign] % BASE;
                }
                return lenA && (coeffsA = [lenA].concat(coeffsA), ++expB), normalizeCoefficient(addendVal, coeffsA, expB);
            };

            PreciseNumberProto.significantDigits = PreciseNumberProto.sd = function (precision, rounding) {
                let numCoeffs, digitCount, lastCoeff, firstCoeff,
                    instance = this;
                if (precision !== void 0 && precision !== !!precision) {
                    validateNumberRange(precision, 1, MULTIPLIER_BASE);
                    if (rounding === void 0) {
                        rounding = roundingModeConfig;
                    } else {
                        validateNumberRange(rounding, 0, 8);
                    }
                    return roundAndTruncate(new PreciseNumber(instance), precision, rounding);
                }
                if (!(numCoeffs = instance.coefficients)) {
                    return void 0;
                }
                if (digitCount = (lastCoeff = numCoeffs.length - 1) * DIGIT_GROUP_SIZE + 1, lastCoeff = numCoeffs[lastCoeff]) {
                    for (; lastCoeff % 10 === 0; lastCoeff /= 10, digitCount--);
                    for (firstCoeff = numCoeffs[0]; firstCoeff >= 10; firstCoeff /= 10, digitCount++);
                }
                return precision && instance.exponent + 1 > digitCount && (digitCount = instance.exponent + 1), digitCount;
            };

            PreciseNumberProto.shiftDecimal = function (shiftAmount) {
                return validateNumberRange(shiftAmount, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER), this.multiply("1e" + shiftAmount);
            };

            PreciseNumberProto.squareRoot = function () {
                let tempNum, currentRoot, prevRoot,
                    isPrecisionRounded, iterations,
                    instance = this,
                    coeffs = instance.coefficients,
                    sign = instance.sign,
                    exponent = instance.exponent,
                    fixedPrecision = decimalPlacesConfig + 4,
                    halfInstance = new PreciseNumber("0.5");
                if (1 !== sign || !coeffs || !coeffs[0]) {
                    return new PreciseNumber(!sign || sign < 0 && (!coeffs || coeffs[0]) ? NaN : coeffs ? instance : 1 / 0);
                }
                if (0 === (currentRoot = Math.sqrt(+toPrimitiveString(instance))) || currentRoot === 1 / 0) {
                    ((prevRoot = formatCoefficientString(coeffs)).length + exponent) % 2 === 0 && (prevRoot += "0");
                    currentRoot = Math.sqrt(+prevRoot);
                    exponent = floorInt((exponent + 1) / 2) - (exponent < 0 || exponent % 2);
                    currentRoot = new PreciseNumber(currentRoot === 1 / 0 ? "1e" + exponent : (prevRoot = currentRoot.toExponential()).slice(0, prevRoot.indexOf("e") + 1) + exponent);
                } else {
                    currentRoot = new PreciseNumber(currentRoot + "");
                }
                if (currentRoot.coefficients[0]) {
                    for ((prevRoot = (exponent = currentRoot.exponent) + fixedPrecision) < 3 && (prevRoot = 0);;) {
                        iterations = currentRoot;
                        currentRoot = halfInstance.multiply(iterations.add(divisionAlgorithm(instance, iterations, fixedPrecision, 1)));
                        if (formatCoefficientString(iterations.coefficients).slice(0, prevRoot) === (prevRoot = formatCoefficientString(currentRoot.coefficients)).slice(0, prevRoot)) {
                            if (currentRoot.exponent < exponent && --prevRoot, "9999" !== (prevRoot = prevRoot.slice(prevRoot - 3, prevRoot + 1)) && (isPrecisionRounded || "4999" !== prevRoot)) {
                                (+prevRoot || !"5" !== prevRoot.charAt(0)) || (roundAndTruncate(currentRoot, currentRoot.exponent + decimalPlacesConfig + 2, 1), tempNum = !currentRoot.multiply(currentRoot).isEqual(instance));
                                break;
                            }
                            if (!isPrecisionRounded && (roundAndTruncate(iterations, iterations.exponent + decimalPlacesConfig + 2, 0), iterations.multiply(iterations).isEqual(instance))) {
                                currentRoot = iterations;
                                break;
                            }
                            fixedPrecision += 4;
                            prevRoot += 4;
                            isPrecisionRounded = 1;
                        }
                    }
                }
                return roundAndTruncate(currentRoot, currentRoot.exponent + decimalPlacesConfig + 1, roundingModeConfig, tempNum);
            };

            PreciseNumberProto.toExponentialString = function (precision, rounding) {
                return precision !== void 0 && (validateNumberRange(precision, 0, MULTIPLIER_BASE), precision++), formatOutputString(this, precision, rounding, 1);
            };

            PreciseNumberProto.toFixedString = function (decimalPlaces, rounding) {
                return decimalPlaces !== void 0 && (validateNumberRange(decimalPlaces, 0, MULTIPLIER_BASE), decimalPlaces = decimalPlaces + this.exponent + 1), formatOutputString(this, decimalPlaces, rounding);
            };

            PreciseNumberProto.toFormattedString = function (decimalPlaces, rounding, formatObj) {
                let formattedNum, instance = this;
                if (formatObj === void 0) {
                    decimalPlaces === void 0 && rounding && typeof rounding === 'object' ? (formatObj = rounding, rounding = void 0) : decimalPlaces && typeof decimalPlaces === 'object' ? (formatObj = decimalPlaces, decimalPlaces = rounding = void 0) : formatObj = formatSettings;
                } else if (typeof formatObj !== 'object') {
                    throw Error(errorPrefix + "Argument not an object: " + formatObj);
                }
                if (formattedNum = instance.toFixedString(decimalPlaces, rounding), instance.coefficients) {
                    let parts, groupSize = +formatObj.groupSize,
                        secondaryGroupSize = +formatObj.secondaryGroupSize,
                        groupSeparator = formatObj.groupSeparator || ",",
                        numParts = formattedNum.split("."),
                        integerPart = numParts[0],
                        fractionPart = numParts[1],
                        isNegative = instance.sign < 0,
                        absIntegerPart = isNegative ? integerPart.slice(1) : integerPart,
                        integerLength = absIntegerPart.length;
                    if (secondaryGroupSize && (parts = groupSize, groupSize = secondaryGroupSize, secondaryGroupSize = parts, integerLength -= parts), groupSize > 0 && integerLength > 0) {
                        for (parts = integerLength % groupSize || groupSize, integerPart = absIntegerPart.substr(0, parts); parts < integerLength; parts += groupSize) {
                            integerPart += groupSeparator + absIntegerPart.substr(parts, groupSize);
                        }
                        secondaryGroupSize > 0 && (integerPart += groupSeparator + absIntegerPart.slice(parts));
                        isNegative && (integerPart = "-" + integerPart);
                    }
                    formattedNum = fractionPart ? integerPart + (formatObj.decimalSeparator || ".") + ((secondaryGroupSize = +formatObj.fractionGroupSize) ? fractionPart.replace(new RegExp("\\d{" + secondaryGroupSize + "}\\B", "g"), "$&" + (formatObj.fractionGroupSeparator || " ")) : fractionPart) : integerPart;
                }
                return (formatObj.prefix || "") + formattedNum + (formatObj.suffix || "");
            };

            PreciseNumberProto.toFraction = function (maxDenominator) {
                let numInstance, denomInstance, numerator, denominator,
                    currentNumerator, currentDenominator,
                    currentNumString,
                    instance = this,
                    coeffs = instance.coefficients;
                if (maxDenominator !== void 0 && (!(currentNumerator = new PreciseNumber(maxDenominator)).isInteger() && (currentNumerator.coefficients || 1 !== currentNumerator.sign) || currentNumerator.isLess(ONE_INSTANCE))) {
                    throw Error(errorPrefix + "Argument " + (currentNumerator.isInteger() ? "out of range: " : "not an integer: ") + toPrimitiveString(currentNumerator));
                }
                if (!coeffs) {
                    return new PreciseNumber(instance);
                }
                numInstance = new PreciseNumber(ONE_INSTANCE);
                currentNumerator = new PreciseNumber(ONE_INSTANCE);
                denomInstance = new PreciseNumber(ONE_INSTANCE);
                currentDenominator = new PreciseNumber(ONE_INSTANCE);
                currentNumString = formatCoefficientString(coeffs);
                numInstance.exponent = currentNumString.length - instance.exponent - 1;
                numInstance.coefficients[0] = POWERS_OF_TEN_ARRAY[(numerator = numInstance.exponent % DIGIT_GROUP_SIZE) < 0 ? DIGIT_GROUP_SIZE + numerator : numerator];
                maxDenominator = !maxDenominator || currentNumerator.compare(numInstance) > 0 ? numerator > 0 ? numInstance : currentNumerator : maxDenominator;
                numerator = rangeUpperBound;
                rangeUpperBound = 1 / 0;
                currentNumerator = new PreciseNumber(currentNumString);
                currentDenominator.coefficients[0] = 0;
                while (
                    numerator = divisionAlgorithm(currentNumerator, numInstance, 0, 1),
                    1 !== (currentNumerator = currentDenominator.add(numerator.multiply(denomInstance))).compare(maxDenominator)
                    ) {
                    currentDenominator = denomInstance;
                    denomInstance = currentNumerator;
                    numInstance = currentNumerator.add(numerator.multiply(numerator = numInstance));
                    currentNumerator = numerator;
                    numerator = numInstance;
                }
                numerator = divisionAlgorithm(maxDenominator.subtract(currentDenominator), denomInstance, 0, 1);
                currentDenominator = currentDenominator.add(numerator.multiply(numerator = currentNumString));
                denomInstance = denomInstance.add(numerator.multiply(denomInstance));
                currentDenominator.sign = denomInstance.sign = instance.sign;
                let diffA = divisionAlgorithm(currentNumString, denomInstance, numerator * 2, roundingModeConfig).subtract(instance).absoluteValue();
                let diffB = divisionAlgorithm(currentDenominator, denomInstance, numerator * 2, roundingModeConfig).subtract(instance).absoluteValue();
                let result = diffA.compare(diffB) < 1 ? [denomInstance, denomInstance] : [currentDenominator, denomInstance];
                rangeUpperBound = numerator;
                return result;
            };

            PreciseNumberProto.toNumberPrimitive = function () {
                return +toPrimitiveString(this);
            };

            PreciseNumberProto.toPrecisionString = function (significantDigits, rounding) {
                return significantDigits !== void 0 && validateNumberRange(significantDigits, 1, MULTIPLIER_BASE), formatOutputString(this, significantDigits, rounding, 2);
            };

            PreciseNumberProto.toStringRepresentation = function (base) {
                let resultString, instance = this,
                    instanceSign = instance.sign,
                    instanceExponent = instance.exponent;
                if (instanceExponent === void 0) {
                    return instanceSign ? (resultString = "Infinity", instanceSign < 0 && (resultString = "-" + resultString)) : resultString = "NaN";
                }
                if (base === void 0) {
                    resultString = instanceExponent <= expLowerBound || instanceExponent >= expUpperBound ? formatScientific(formatCoefficientString(instance.coefficients), instanceExponent) : insertDecimalPoint(formatCoefficientString(instance.coefficients), instanceExponent, "0");
                } else if (10 === base) {
                    resultString = insertDecimalPoint(formatCoefficientString((instance = roundAndTruncate(new PreciseNumber(instance), decimalPlacesConfig + instanceExponent + 1, roundingModeConfig)).coefficients), instance.exponent, "0");
                } else {
                    validateNumberRange(base, 2, conversionAlphabet.length, "Base");
                    resultString = baseConvertHelper(insertDecimalPoint(formatCoefficientString(instance.coefficients), instanceExponent, "0"), 10, base, instanceSign, !0);
                }
                return instanceSign < 0 && instance.coefficients[0] && (resultString = "-" + resultString), resultString;
            };

            PreciseNumberProto.valueOfPrimitive = PreciseNumberProto.toJSON = function () {
                return toPrimitiveString(this);
            };

            PreciseNumberProto._isPreciseNumber = !0;

            if (factoryOptions !== void 0) {
                PreciseNumber.configure(factoryOptions);
            }

            factoryScope.default = bigNumFactoryRef.PreciseNumber = bigNumFactoryRef;
            if (void 0 === (preciseNumModule = function () {
                return bigNumFactoryRef;
            }.call(currentExp, currentReq, currentExp, currentMod))) {
                currentMod.moduleExports = preciseNumModule;
            }
        }(currentExp);
    },
    function (currentMod, currentExp) {
        currentMod.moduleExports = currentReq("fs");
    }
]);