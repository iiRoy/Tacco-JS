var LI_BLK_SZ = 1000000000;
var LI_BLK_DIGITS = 9;

function normalizeLi(valObject) {
    if (!valObject || !valObject.d) return LI_ZERO_VAL;
    while (valObject.d.length > 1 && valObject.d[valObject.d.length - 1] === 0) {
        valObject.d.pop();
    }
    if (valObject.d.length === 1 && valObject.d[0] === 0) {
        valObject.s = false;
    }
    return valObject;
}

function parseLiFromString(strInput) {
    let currentString = strInput.trim();
    const isNegative = currentString.startsWith('-');
    if (isNegative) currentString = currentString.substring(1);
    if (currentString === '0') return LI_ZERO_VAL;

    let resultLi = LI_ZERO_VAL;
    const blockBaseLi = createLargeInteger(LI_BLK_SZ);

    for (let i = currentString.length; i > 0; i -= LI_BLK_DIGITS) {
        const chunkStartIndex = Math.max(0, i - LI_BLK_DIGITS);
        const chunkValue = parseInt(currentString.substring(chunkStartIndex, i), 10);
        resultLi = addLi(multiplyLi(resultLi, blockBaseLi), createLargeInteger(chunkValue));
    }
    return normalizeLi({ d: resultLi.d, s: isNegative });
}

function createLargeInteger(input) {
    if (typeof input === 'object' && input !== null && input.d && typeof input.s === 'boolean') {
        return normalizeLi({ d: [...input.d], s: input.s });
    }
    if (typeof input === 'number') {
        if (input === 0) return LI_ZERO_VAL;
        const isNegative = input < 0;
        let numVal = Math.abs(input);
        const digitsArray = [];
        if (numVal < LI_BLK_SZ) {
            digitsArray.push(numVal);
        } else {
            while (numVal > 0) {
                digitsArray.push(numVal % LI_BLK_SZ);
                numVal = Math.floor(numVal / LI_BLK_SZ);
            }
        }
        return normalizeLi({ d: digitsArray, s: isNegative });
    }
    if (typeof input === 'string') {
        return parseLiFromString(input);
    }
    return LI_ZERO_VAL;
}

var LI_ZERO_VAL = { d: [0], s: false };
var LI_ONE_VAL = { d: [1], s: false };
var LI_TWO_VAL = { d: [2], s: false };
var LI_TEN_VAL = { d: [10], s: false };

function absLi(val) { return normalizeLi({ d: [...val.d], s: false }); }
function negateLi(val) {
    if (isZeroLi(val)) return LI_ZERO_VAL;
    return normalizeLi({ d: [...val.d], s: !val.s });
}
function isZeroLi(val) { return val.d.length === 1 && val.d[0] === 0; }
function isNegativeLi(val) { return val.s; }
function isOddLi(val) { return (val.d[0] % 2) !== 0; }

function compareAbsoluteLi(a, b) {
    if (a.d.length !== b.d.length) {
        return a.d.length > b.d.length ? 1 : -1;
    }
    for (let i = a.d.length - 1; i >= 0; --i) {
        if (a.d[i] !== b.d[i]) {
            return a.d[i] > b.d[i] ? 1 : -1;
        }
    }
    return 0;
}

function compareLi(a, b) {
    if (a.s !== b.s) return a.s ? -1 : 1;
    const cmpAbs = compareAbsoluteLi(a, b);
    return a.s ? -cmpAbs : cmpAbs;
}

function addDigitArrays(arrA, arrB) {
    const commonLength = Math.max(arrA.length, arrB.length);
    const result = new Array(commonLength);
    let carry = 0;
    for (let i = 0; i < commonLength; ++i) {
        const sum = (arrA[i] || 0) + (arrB[i] || 0) + carry;
        result[i] = sum % LI_BLK_SZ;
        carry = Math.floor(sum / LI_BLK_SZ);
    }
    if (carry > 0) result.push(carry);
    return result;
}

function subtractDigitArrays(arrA, arrB) {
    const result = new Array(arrA.length);
    let borrow = 0;
    for (let i = 0; i < arrA.length; ++i) {
        let diff = (arrA[i] || 0) - (arrB[i] || 0) - borrow;
        if (diff < 0) {
            diff += LI_BLK_SZ;
            borrow = 1;
        } else {
            borrow = 0;
        }
        result[i] = diff;
    }
    return result;
}

function addLi(a, b) {
    if (a.s === b.s) {
        return normalizeLi({ d: addDigitArrays(a.d, b.d), s: a.s });
    } else {
        const cmpAbs = compareAbsoluteLi(a, b);
        if (cmpAbs === 0) return LI_ZERO_VAL;
        const resultDigits = cmpAbs > 0 ? subtractDigitArrays(a.d, b.d) : subtractDigitArrays(b.d, a.d);
        const resultSign = cmpAbs > 0 ? a.s : b.s;
        return normalizeLi({ d: resultDigits, s: resultSign });
    }
}

function subtractLi(a, b) {
    return addLi(a, negateLi(b));
}

function multiplyLi(a, b) {
    if (isZeroLi(a) || isZeroLi(b)) return LI_ZERO_VAL;
    const resultDigits = new Array(a.d.length + b.d.length).fill(0);
    for (let i = 0; i < a.d.length; ++i) {
        let carry = 0;
        for (let j = 0; j < b.d.length; ++j) {
            const product = a.d[i] * b.d[j] + resultDigits[i + j] + carry;
            resultDigits[i + j] = product % LI_BLK_SZ;
            carry = Math.floor(product / LI_BLK_SZ);
        }
        if (carry > 0) resultDigits[i + b.d.length] += carry;
    }
    return normalizeLi({ d: resultDigits, s: a.s !== b.s });
}

function divideAndModuloLi(dividend, divisor) {
    if (isZeroLi(divisor)) throw new Error("Division by zero.");
    
    const quotientSign = dividend.s !== divisor.s;
    const remainderSign = dividend.s;

    let absDividend = absLi(dividend);
    const absDivisor = absLi(divisor);

    if (compareAbsoluteLi(absDividend, absDivisor) < 0) {
        return { quotient: LI_ZERO_VAL, remainder: createLargeInteger(dividend) };
    }
    if (compareAbsoluteLi(absDividend, absDivisor) === 0) {
        return { quotient: normalizeLi({d: LI_ONE_VAL.d, s: quotientSign}), remainder: LI_ZERO_VAL };
    }

    if (absDivisor.d.length === 1 && absDivisor.d[0] === 1) {
        return {
            quotient: normalizeLi({ d: [...absDividend.d], s: quotientSign }),
            remainder: LI_ZERO_VAL
        };
    }

    const quotientDigits = [];
    let currentPartialRemainder = LI_ZERO_VAL;

    for (let i = absDividend.d.length - 1; i >= 0; --i) {
        currentPartialRemainder = addLi(multiplyLi(currentPartialRemainder, createLargeInteger(LI_BLK_SZ)), createLargeInteger(absDividend.d[i]));
        
        let q = 0;
        if (compareAbsoluteLi(currentPartialRemainder, absDivisor) >= 0) {
            let low = 0;
            let high = LI_BLK_SZ - 1;
            while (low <= high) {
                let mid = Math.floor((low + high) / 2);
                let testProduct = multiplyLi(absDivisor, createLargeInteger(mid));
                if (compareAbsoluteLi(testProduct, currentPartialRemainder) <= 0) {
                    q = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
            currentPartialRemainder = subtractLi(currentPartialRemainder, multiplyLi(absDivisor, createLargeInteger(q)));
        }
        quotientDigits.unshift(q);
    }

    return {
        quotient: normalizeLi({ d: quotientDigits, s: quotientSign }),
        remainder: normalizeLi({ d: currentPartialRemainder.d, s: remainderSign })
    };
}

function moduloLi(val, modulus) {
    const { remainder } = divideAndModuloLi(val, modulus);
    if (!isZeroLi(remainder) && isNegativeLi(remainder) !== isNegativeLi(modulus)) {
        return addLi(remainder, absLi(modulus));
    }
    return remainder;
}

function powerLi(base, exponent) {
    if (isNegativeLi(exponent)) throw new Error("Negative exponent not supported for LargeInteger power.");
    if (isZeroLi(exponent)) return LI_ONE_VAL;
    if (isZeroLi(base)) return LI_ZERO_VAL;
    
    if (compareAbsoluteLi(base, LI_ONE_VAL) === 0) {
        if (isNegativeLi(base) && isOddLi(exponent)) return negateLi(LI_ONE_VAL);
        return LI_ONE_VAL;
    }

    let result = LI_ONE_VAL;
    let currentBase = createLargeInteger(base);

    while (!isZeroLi(exponent)) {
        if (isOddLi(exponent)) {
            result = multiplyLi(result, currentBase);
        }
        currentBase = multiplyLi(currentBase, currentBase);
        exponent = divideAndModuloLi(exponent, LI_TWO_VAL).quotient;
    }
    return normalizeLi(result);
}

var dataProcessorModule = (function() {
    function initializeProcessor(rawData) {
        const lineBuffer = rawData.trim().split('\n');
        let currentLineIndex = 0;

        function fetchNextToken(returnRaw = false) {
            if (currentLineIndex >= lineBuffer.length) throw new Error("Input buffer exhausted.");
            const tokensOnLine = lineBuffer[currentLineIndex].split(' ');
            const token = tokensOnLine.shift();
            if (tokensOnLine.length === 0) currentLineIndex++;
            else lineBuffer[currentLineIndex] = tokensOnLine.join(' '); 
            return returnRaw ? token : Number(token);
        }

        return {
            extractValue: fetchNextToken
        };
    }
    return initializeProcessor;
})();

var programInput = dataProcessorModule(require("fs").readFileSync("/dev/stdin","utf8"));

function generateMultidimArray(dimensions, initialValue = 0) {
    if (dimensions.length === 0) return initialValue;
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () => generateMultidimArray(remainingDims, initialValue));
}

var globalModulus;

function performModularMultiplication(val1, val2) {
    let res = 0;
    val1 %= globalModulus;
    while (val2 > 0) {
        if (val2 & 1) res = (res + val1) % globalModulus;
        val1 = (val1 + val1) % globalModulus;
        val2 >>= 1;
    }
    return res;
}

function performModularExponentiation(base, exponent) {
    let res = 1;
    base %= globalModulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) res = performModularMultiplication(res, base);
        base = performModularMultiplication(base, base);
        exponent = Math.floor(exponent / 2);
    }
    return res;
}

function performMatrixPowerMod(baseMatrix, exponentLi) {
    const matrixDimension = baseMatrix.length;
    let resultMatrix = generateMultidimArray([matrixDimension, matrixDimension], 0);
    for (let i = 0; i < matrixDimension; i++) resultMatrix[i][i] = 1;

    let currentMatrix = generateMultidimArray([matrixDimension, matrixDimension], 0);
    for (let r = 0; r < matrixDimension; r++) {
        for (let c = 0; c < matrixDimension; c++) {
            currentMatrix[r][c] = baseMatrix[r][c];
        }
    }

    while (!isZeroLi(exponentLi)) {
        if (isOddLi(exponentLi)) {
            resultMatrix = performMatrixMultiplicationMod(resultMatrix, currentMatrix);
        }
        currentMatrix = performMatrixMultiplicationMod(currentMatrix, currentMatrix);
        exponentLi = divideAndModuloLi(exponentLi, LI_TWO_VAL).quotient;
    }
    return resultMatrix;
}

function performMatrixMultiplicationMod(matA, matB) {
    const rowsA = matA.length;
    const colsA = matA[0].length;
    const rowsB = matB.length;
    const colsB = matB[0].length;

    if (colsA !== rowsB) throw new Error("Matrix dimensions incompatible for multiplication.");

    const productMatrix = generateMultidimArray([rowsA, colsB], 0);

    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let currentSum = 0;
            for (let k = 0; k < colsA; k++) {
                currentSum = (currentSum + performModularMultiplication(matA[i][k], matB[k][j])) % globalModulus;
            }
            productMatrix[i][j] = currentSum;
        }
    }
    return productMatrix;
}

console.log(executeCalculation());

function executeCalculation() {
    let limitLength = programInput.extractValue();
    let initialValue = programInput.extractValue();
    let stepAmount = programInput.extractValue();
    globalModulus = programInput.extractValue();

    let li_limitLength = createLargeInteger(limitLength);
    let li_initialValue = createLargeInteger(initialValue);
    let li_stepAmount = createLargeInteger(stepAmount);

    let finalAccumulator = [[0, 0, 1]];
    let li_processedCount = LI_ZERO_VAL;

    for (let currentDigitLength = 1; currentDigitLength < 19 && compareLi(li_processedCount, li_limitLength) < 0; currentDigitLength++) {
        const maxNumWithCurrentLength = subtractLi(powerLi(LI_TEN_VAL, createLargeInteger(currentDigitLength)), LI_ONE_VAL);

        let tempNumerator = addLi(subtractLi(maxNumWithCurrentLength, li_initialValue), li_stepAmount);
        let segmentExponent = subtractLi(divideAndModuloLi(tempNumerator, li_stepAmount).quotient, li_processedCount);

        if (isZeroLi(segmentExponent) || isNegativeLi(segmentExponent)) continue;

        const nextPotentialProcessedCount = addLi(li_processedCount, segmentExponent);
        if (compareLi(nextPotentialProcessedCount, li_limitLength) > 0) {
            segmentExponent = subtractLi(li_limitLength, li_processedCount);
        }

        if (isZeroLi(segmentExponent) || isNegativeLi(segmentExponent)) continue;

        const tenToPowerCurrentLengthMod = performModularExponentiation(10, currentDigitLength);
        const stepAmountMod = moduloLi(li_stepAmount, createLargeInteger(globalModulus)).d[0];

        const baseTransformationMatrix = [
            [tenToPowerCurrentLengthMod, 0, 0],
            [1, 1, 0],
            [0, stepAmountMod, 1]
        ];

        const exponentiatedMatrix = performMatrixPowerMod(baseTransformationMatrix, segmentExponent);

        const currentSumTerm = addLi(multiplyLi(li_stepAmount, li_processedCount), li_initialValue);
        finalAccumulator[0][1] = moduloLi(currentSumTerm, createLargeInteger(globalModulus)).d[0];

        finalAccumulator = performMatrixMultiplicationMod(finalAccumulator, exponentiatedMatrix);
        li_processedCount = addLi(li_processedCount, segmentExponent);
    }
    return finalAccumulator[0][0];
}