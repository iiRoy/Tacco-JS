const createArbitraryPrecisionNumber = (function (undefinedValue) {
    const CHUNK_SIZE = 1e7;
    const CHUNK_DIGITS = 7;
    const JS_MAX_SAFE_INT = 9007199254740991;
    const JS_MAX_SAFE_INT_DIGITS_ARRAY = convertNativeToChunkArray(JS_MAX_SAFE_INT);

    function APNFactory(inputValue, baseRadix) {
        if (typeof inputValue === "undefined" || inputValue === null) {
            return APNFactory._zero;
        }
        if (typeof baseRadix !== "undefined") {
            const parsedRadix = +baseRadix;
            if (isNaN(parsedRadix) || parsedRadix < 2 || parsedRadix > 36) {
                throw new Error(`Invalid radix specified: ${baseRadix}. Must be an integer between 2 and 36.`);
            }
            return (parsedRadix === 10) ? normalizeInputToAPN(inputValue) : parseInputWithBase(inputValue, parsedRadix);
        }
        return normalizeInputToAPN(inputValue);
    }

    function AbstractNumeric() { /* Base class for inheritance */ }

    function ExtendedNumeric(valArray, isNegativeFlag) {
        this.chunkedValue = valArray;
        this.isNegative = isNegativeFlag;
        this.isCompact = false;
    }
    ExtendedNumeric.prototype = Object.create(AbstractNumeric.prototype);
    ExtendedNumeric.prototype.constructor = ExtendedNumeric;

    function CompactNumeric(primitiveValue) {
        this.primitiveValue = primitiveValue;
        this.isNegative = primitiveValue < 0;
        this.isCompact = true;
    }
    CompactNumeric.prototype = Object.create(AbstractNumeric.prototype);
    CompactNumeric.prototype.constructor = CompactNumeric;

    function canFitNativeNumber(n) {
        return -JS_MAX_SAFE_INT < n && n < JS_MAX_SAFE_INT;
    }

    function convertNativeToChunkArray(num) {
        if (num === 0) return [0];
        let absNum = Math.abs(num);
        const chunks = [];
        while (absNum > 0) {
            chunks.push(absNum % CHUNK_SIZE);
            absNum = Math.floor(absNum / CHUNK_SIZE);
        }
        return chunks;
    }

    function convertChunkArrayToNative(chunkArray) {
        removeLeadingZeros(chunkArray);
        const len = chunkArray.length;
        if (len < JS_MAX_SAFE_INT_DIGITS_ARRAY.length && compareAbsoluteChunks(chunkArray, JS_MAX_SAFE_INT_DIGITS_ARRAY) < 0) {
            if (len === 0) return 0;
            let result = chunkArray[0];
            if (len > 1) result += chunkArray[1] * CHUNK_SIZE;
            if (len > 2) result += chunkArray[2] * CHUNK_SIZE * CHUNK_SIZE;
            if (canFitNativeNumber(result)) return result;
        }
        return chunkArray;
    }

    function removeLeadingZeros(chunkArray) {
        let idx = chunkArray.length;
        if (idx === 0 || (idx === 1 && chunkArray[0] === 0)) return;
        while (idx > 1 && chunkArray[--idx] === 0);
        chunkArray.length = idx + 1;
    }

    function initializeZeroArray(len) {
        return Array(len).fill(0);
    }

    function floorOrCeil(num) {
        return num > 0 ? Math.floor(num) : Math.ceil(num);
    }

    function performArrayAddition(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const resultChunks = new Array(lenA);
        let currentCarry = 0;
        let tempSum;

        for (let i = 0; i < lenB; i++) {
            tempSum = arrA[i] + arrB[i] + currentCarry;
            currentCarry = (tempSum >= CHUNK_SIZE) ? 1 : 0;
            resultChunks[i] = tempSum - currentCarry * CHUNK_SIZE;
        }
        for (let i = lenB; i < lenA; i++) {
            tempSum = arrA[i] + currentCarry;
            currentCarry = (tempSum >= CHUNK_SIZE) ? 1 : 0;
            resultChunks[i] = tempSum - currentCarry * CHUNK_SIZE;
        }
        if (currentCarry > 0) {
            resultChunks.push(currentCarry);
        }
        return resultChunks;
    }

    function performFlexibleArrayAdd(arrX, arrY) {
        if (arrX.length < arrY.length) {
            [arrX, arrY] = [arrY, arrX];
        }
        return performArrayAddition(arrX, arrY);
    }

    function addNativeToBigIntArray(arr, nativeCarry) {
        const len = arr.length;
        const result = new Array(len);
        let currentCarry = nativeCarry;
        let tempSum;

        for (let i = 0; i < len; i++) {
            tempSum = arr[i] + currentCarry;
            currentCarry = floorOrCeil(tempSum / CHUNK_SIZE);
            result[i] = tempSum % CHUNK_SIZE;
        }
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = floorOrCeil(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    function performArraySubtraction(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const result = new Array(lenA);
        let currentBorrow = 0;
        let currentDifference;

        for (let i = 0; i < lenB; i++) {
            currentDifference = arrA[i] - currentBorrow - arrB[i];
            if (currentDifference < 0) {
                currentDifference += CHUNK_SIZE;
                currentBorrow = 1;
            } else {
                currentBorrow = 0;
            }
            result[i] = currentDifference;
        }
        for (let i = lenB; i < lenA; i++) {
            currentDifference = arrA[i] - currentBorrow;
            if (currentDifference < 0) {
                currentDifference += CHUNK_SIZE;
                currentBorrow = 1; // Explicitly set borrow for next iteration
            } else {
                result[i++] = currentDifference;
                while (i < lenA) {
                    result[i] = arrA[i];
                    i++;
                }
                currentBorrow = 0; // No more borrow needed
                break;
            }
            result[i] = currentDifference;
        }
        removeLeadingZeros(result);
        return result;
    }

    function performFlexibleArraySubtract(arrA, arrB, isResultNegative) {
        let finalValue;
        if (compareAbsoluteChunks(arrA, arrB) >= 0) {
            finalValue = performArraySubtraction(arrA, arrB);
        } else {
            finalValue = performArraySubtraction(arrB, arrA);
            isResultNegative = !isResultNegative;
        }
        const numericResult = convertChunkArrayToNative(finalValue);
        if (typeof numericResult === "number") {
            return new CompactNumeric(isResultNegative ? -numericResult : numericResult);
        }
        return new ExtendedNumeric(numericResult, isResultNegative);
    }

    function subtractNativeFromBigIntArray(arr, nativeValue, isResultNegative) {
        const len = arr.length;
        const result = new Array(len);
        let currentBorrow = -nativeValue;
        let currentDifference;

        for (let i = 0; i < len; i++) {
            currentDifference = arr[i] + currentBorrow;
            currentBorrow = floorOrCeil(currentDifference / CHUNK_SIZE);
            currentDifference %= CHUNK_SIZE;
            result[i] = currentDifference < 0 ? currentDifference + CHUNK_SIZE : currentDifference;
        }
        const numericResult = convertChunkArrayToNative(result);
        if (typeof numericResult === "number") {
            return new CompactNumeric(isResultNegative ? -numericResult : numericResult);
        }
        return new ExtendedNumeric(numericResult, isResultNegative);
    }

    function longMultiplicationAlgorithm(arrA, arrB) {
        const lenA = arrA.length, lenB = arrB.length;
        const resultChunks = initializeZeroArray(lenA + lenB);
        let product;

        for (let i = 0; i < lenA; ++i) {
            const currentAChunk = arrA[i];
            let currentCarry = 0;
            for (let j = 0; j < lenB; ++j) {
                product = currentAChunk * arrB[j] + resultChunks[i + j] + currentCarry;
                currentCarry = floorOrCeil(product / CHUNK_SIZE);
                resultChunks[i + j] = product % CHUNK_SIZE;
            }
            resultChunks[i + lenB] += currentCarry;
        }
        removeLeadingZeros(resultChunks);
        return resultChunks;
    }

    function scalarArrayMultiplication(arr, scalar) {
        const len = arr.length;
        const result = new Array(len);
        let currentCarry = 0;
        let product;

        for (let i = 0; i < len; i++) {
            product = arr[i] * scalar + currentCarry;
            currentCarry = floorOrCeil(product / CHUNK_SIZE);
            result[i] = product % CHUNK_SIZE;
        }
        while (currentCarry > 0) {
            result.push(currentCarry % CHUNK_SIZE);
            currentCarry = floorOrCeil(currentCarry / CHUNK_SIZE);
        }
        return result;
    }

    function prependZeros(arr, count) {
        const zeros = initializeZeroArray(count);
        return zeros.concat(arr);
    }

    function shouldUseKaratsuba(len1, len2) {
        const KARATSUBA_THRESHOLD = 20;
        return (len1 > KARATSUBA_THRESHOLD && len2 > KARATSUBA_THRESHOLD);
    }

    function karatsubaProduct(xArr, yArr) {
        const n = Math.max(xArr.length, yArr.length);
        if (n <= 20) {
            return longMultiplicationAlgorithm(xArr, yArr);
        }

        const m = Math.ceil(n / 2);
        const a = xArr.slice(0, m);
        const b = xArr.slice(m);
        const c = yArr.slice(0, m);
        const d = yArr.slice(m);

        const ac = karatsubaProduct(a, c);
        const bd = karatsubaProduct(b, d);
        const abcd = karatsubaProduct(performFlexibleArrayAdd(a, b), performFlexibleArrayAdd(c, d));

        const middleTerm = performArraySubtraction(performArraySubtraction(abcd, ac), bd);
        const shiftedMiddle = prependZeros(middleTerm, m);
        const shiftedBd = prependZeros(bd, 2 * m);

        let finalProduct = performFlexibleArrayAdd(ac, shiftedMiddle);
        finalProduct = performFlexibleArrayAdd(finalProduct, shiftedBd);

        removeLeadingZeros(finalProduct);
        return finalProduct;
    }

    function mixTypeMultiplication(nativeNum, bigIntArr, isResultNegative) {
        const absNative = Math.abs(nativeNum);
        if (absNative === 0) return APNFactory._zero;
        if (absNative === 1) return new ExtendedNumeric(bigIntArr, isResultNegative);

        if (absNative < CHUNK_SIZE) {
            return new ExtendedNumeric(scalarArrayMultiplication(bigIntArr, absNative), isResultNegative);
        }
        return new ExtendedNumeric(longMultiplicationAlgorithm(bigIntArr, convertNativeToChunkArray(absNative)), isResultNegative);
    }

    function calculateSquareArray(arr) {
        const len = arr.length;
        const result = initializeZeroArray(len + len);
        let product, innerCarry;

        for (let i = 0; i < len; i++) {
            const ai = arr[i];
            innerCarry = 0;
            for (let j = 0; j < len; j++) {
                const aj = arr[j];
                const term = (i === j) ? (ai * aj) : (2 * ai * aj);
                product = result[i + j] + term + innerCarry;
                innerCarry = floorOrCeil(product / CHUNK_SIZE);
                result[i + j] = product % CHUNK_SIZE;
            }
            result[i + len] += innerCarry;
        }
        removeLeadingZeros(result);
        return result;
    }

    function longDivisionAlgorithm(dividendArr, divisorArr) {
        const lenDividend = dividendArr.length;
        const lenDivisor = divisorArr.length;
        const quotientChunks = initializeZeroArray(lenDivisor);
        const CHUNK_MULTIPLIER = CHUNK_SIZE;

        const divisorMSD = divisorArr[lenDivisor - 1];
        let normalizationFactor = Math.ceil(CHUNK_MULTIPLIER / (2 * divisorMSD));
        if (normalizationFactor === 0) normalizationFactor = 1;

        let tempDividend = scalarArrayMultiplication(dividendArr, normalizationFactor);
        let tempDivisor = scalarArrayMultiplication(divisorArr, normalizationFactor);

        if (tempDividend.length <= lenDividend) tempDividend.push(0);
        tempDivisor.push(0);

        const normalizedDivisorMSD = tempDivisor[lenDivisor - 1];
        let estimatedQuotientDigit, currentShift;
        let runningCarry, runningBorrow;

        for (currentShift = lenDividend - lenDivisor; currentShift >= 0; currentShift--) {
            estimatedQuotientDigit = CHUNK_MULTIPLIER - 1;
            const dividendMSD_idx = currentShift + lenDivisor;
            if (tempDividend[dividendMSD_idx] !== normalizedDivisorMSD) {
                estimatedQuotientDigit = floorOrCeil((tempDividend[dividendMSD_idx] * CHUNK_MULTIPLIER + tempDividend[dividendMSD_idx - 1]) / normalizedDivisorMSD);
            }

            runningCarry = 0;
            runningBorrow = 0;
            const currentDivisorLength = tempDivisor.length;

            for (let i = 0; i < currentDivisorLength; i++) {
                runningCarry += estimatedQuotientDigit * tempDivisor[i];
                const q = floorOrCeil(runningCarry / CHUNK_MULTIPLIER);
                runningBorrow += tempDividend[currentShift + i] - (runningCarry - q * CHUNK_MULTIPLIER);
                runningCarry = q;
                if (runningBorrow < 0) {
                    tempDividend[currentShift + i] = runningBorrow + CHUNK_MULTIPLIER;
                    runningBorrow = -1;
                } else {
                    tempDividend[currentShift + i] = runningBorrow;
                    runningBorrow = 0;
                }
            }

            while (runningBorrow !== 0) {
                estimatedQuotientDigit--;
                runningCarry = 0;
                for (let i = 0; i < currentDivisorLength; i++) {
                    runningCarry += tempDividend[currentShift + i] - CHUNK_MULTIPLIER + tempDivisor[i];
                    if (runningCarry < 0) {
                        tempDividend[currentShift + i] = runningCarry + CHUNK_MULTIPLIER;
                        runningCarry = 0;
                    } else {
                        tempDividend[currentShift + i] = runningCarry;
                        runningCarry = 1;
                    }
                }
                runningBorrow += runningCarry;
            }
            quotientChunks[currentShift] = estimatedQuotientDigit;
        }

        const denormalizedRemainder = scalarArrayDivision(tempDividend, normalizationFactor)[0];
        return [convertChunkArrayToNative(quotientChunks), convertChunkArrayToNative(denormalizedRemainder)];
    }

    function anotherLongDivision(dividendArr, divisorArr) {
        let currentDividendLen = dividendArr.length;
        const quotientChunks = [];
        let currentPartialDividend = [];
        const CHUNK_MULTIPLIER = CHUNK_SIZE;

        while (currentDividendLen > 0) {
            currentPartialDividend.unshift(dividendArr[--currentDividendLen]);
            removeLeadingZeros(currentPartialDividend);

            if (compareAbsoluteChunks(currentPartialDividend, divisorArr) < 0) {
                quotientChunks.push(0);
                continue;
            }

            const partialLen = currentPartialDividend.length;
            const divisorLen = divisorArr.length;

            let highX = currentPartialDividend[partialLen - 1];
            if (partialLen > 1) highX = highX * CHUNK_MULTIPLIER + currentPartialDividend[partialLen - 2];

            let highY = divisorArr[divisorLen - 1];
            if (divisorLen > 1) highY = highY * CHUNK_MULTIPLIER + divisorArr[divisorLen - 2];

            if (partialLen > divisorLen) {
                highX = (highX + 1) * CHUNK_MULTIPLIER;
            }

            let estimatedDigit = floorOrCeil(highX / highY);

            let trialProduct;
            do {
                trialProduct = scalarArrayMultiplication(divisorArr, estimatedDigit);
                if (compareAbsoluteChunks(trialProduct, currentPartialDividend) <= 0) break;
                estimatedDigit--;
            } while (estimatedDigit > 0);

            quotientChunks.push(estimatedDigit);
            currentPartialDividend = performArraySubtraction(currentPartialDividend, trialProduct);
        }

        quotientChunks.reverse();
        return [convertChunkArrayToNative(quotientChunks), convertChunkArrayToNative(currentPartialDividend)];
    }

    function scalarArrayDivision(chunkArray, scalar) {
        const len = chunkArray.length;
        const quotient = initializeZeroArray(len);
        const CHUNK_MULTIPLIER = CHUNK_SIZE;
        let currentRemainder = 0;
        let currentDivisor;

        for (let i = len - 1; i >= 0; --i) {
            currentDivisor = currentRemainder * CHUNK_MULTIPLIER + chunkArray[i];
            const q = floorOrCeil(currentDivisor / scalar);
            currentRemainder = currentDivisor % scalar;
            quotient[i] = q | 0;
        }
        return [quotient, currentRemainder | 0];
    }

    function flexibleDivisionAndModulo(dividendObj, divisorObj) {
        const normalizedDivisor = normalizeInputToAPN(divisorObj);
        const normalizedDividend = normalizeInputToAPN(dividendObj);

        const valDividend = normalizedDividend.chunkedValue;
        const valDivisor = normalizedDivisor.chunkedValue;

        let quotientResult;

        if (normalizedDivisor.isValZero()) {
            throw new Error("Division by zero is not allowed.");
        }

        if (normalizedDividend.isCompact) {
            if (normalizedDivisor.isCompact) {
                const nativeQuotient = floorOrCeil(normalizedDividend.primitiveValue / normalizedDivisor.primitiveValue);
                const nativeRemainder = normalizedDividend.primitiveValue % normalizedDivisor.primitiveValue;
                return [new CompactNumeric(nativeQuotient), new CompactNumeric(nativeRemainder)];
            }
            return [APNFactory._zero, normalizedDividend];
        }

        if (normalizedDivisor.isCompact) {
            const absDivisor = Math.abs(normalizedDivisor.primitiveValue);
            if (absDivisor === 1) {
                return [normalizedDividend.isNegative !== normalizedDivisor.isNegative ? normalizedDividend.negate() : normalizedDividend, APNFactory._zero];
            }
            if (absDivisor < CHUNK_SIZE) {
                const [qArr, remNative] = scalarArrayDivision(valDividend, absDivisor);
                const quotientNum = convertChunkArrayToNative(qArr);
                const remainderNum = normalizedDividend.isNegative ? -remNative : remNative;

                const finalQuotient = (typeof quotientNum === "number")
                    ? new CompactNumeric(normalizedDividend.isNegative !== normalizedDivisor.isNegative ? -quotientNum : quotientNum)
                    : new ExtendedNumeric(quotientNum, normalizedDividend.isNegative !== normalizedDivisor.isNegative);

                return [finalQuotient, new CompactNumeric(remainderNum)];
            }
        }

        const comparison = compareAbsoluteChunks(valDividend, valDivisor);
        if (comparison === -1) {
            return [APNFactory._zero, normalizedDividend];
        }
        if (comparison === 0) {
            const finalSign = normalizedDividend.isNegative !== normalizedDivisor.isNegative;
            return [APNFactory[finalSign ? -1 : 1], APNFactory._zero];
        }

        const lengthSumThreshold = 100;
        if (valDividend.length + valDivisor.length <= lengthSumThreshold) {
            quotientResult = longDivisionAlgorithm(valDividend, valDivisor);
        } else {
            quotientResult = anotherLongDivision(valDividend, valDivisor);
        }

        const rawQuotient = quotientResult[0];
        const rawRemainder = quotientResult[1];

        const quotientSign = normalizedDividend.isNegative !== normalizedDivisor.isNegative;
        const remainderSign = normalizedDividend.isNegative;

        const finalQuotient = (typeof rawQuotient === "number")
            ? new CompactNumeric(quotientSign ? -rawQuotient : rawQuotient)
            : new ExtendedNumeric(rawQuotient, quotientSign);

        const finalRemainder = (typeof rawRemainder === "number")
            ? new CompactNumeric(remainderSign ? -rawRemainder : rawRemainder)
            : new ExtendedNumeric(rawRemainder, remainderSign);

        return [finalQuotient, finalRemainder];
    }

    function compareAbsoluteChunks(arrA, arrB) {
        if (arrA.length !== arrB.length) {
            return arrA.length > arrB.length ? 1 : -1;
        }
        for (let i = arrA.length - 1; i >= 0; i--) {
            if (arrA[i] !== arrB[i]) {
                return arrA[i] > arrB[i] ? 1 : -1;
            }
        }
        return 0;
    }

    function findMaximum(valA, valB) {
        valA = normalizeInputToAPN(valA);
        valB = normalizeInputToAPN(valB);
        return valA.isGreater(valB) ? valA : valB;
    }

    function findMinimum(valA, valB) {
        valA = normalizeInputToAPN(valA);
        valB = normalizeInputToAPN(valB);
        return valA.isLesser(valB) ? valA : valB;
    }

    function greatestCommonDivisor(valA, valB) {
        let a = normalizeInputToAPN(valA).absoluteValue();
        let b = normalizeInputToAPN(valB).absoluteValue();

        if (a.checkEquality(b)) return a;
        if (a.isValZero()) return b;
        if (b.isValZero()) return a;

        let commonFactor = APNFactory._one;
        let tempValue;

        while (a.isParityEven() && b.isParityEven()) {
            const minLob = Math.min(getLeastSignificantBit(a), getLeastSignificantBit(b));
            const divisorPowerOfTwo = APNFactory._one.shiftLeftBits(minLob);
            a = a.executeDivision(divisorPowerOfTwo);
            b = b.executeDivision(divisorPowerOfTwo);
            commonFactor = commonFactor.executeMultiplication(divisorPowerOfTwo);
        }

        while (a.isParityEven()) {
            a = a.executeDivision(APNFactory._one.shiftLeftBits(getLeastSignificantBit(a)));
        }

        do {
            while (b.isParityEven()) {
                b = b.executeDivision(APNFactory._one.shiftLeftBits(getLeastSignificantBit(b)));
            }
            if (a.isGreater(b)) {
                tempValue = b;
                b = a;
                a = tempValue;
            }
            b = b.deduct(a);
        } while (!b.isValZero());

        return commonFactor.executeMultiplication(a);
    }

    function leastCommonMultiple(valA, valB) {
        const absA = normalizeInputToAPN(valA).absoluteValue();
        const absB = normalizeInputToAPN(valB).absoluteValue();
        return absA.executeDivision(greatestCommonDivisor(absA, absB)).executeMultiplication(absB);
    }

    function generateRandomBetween(lowerBound, upperBound) {
        let low = findMinimum(lowerBound, upperBound);
        let high = findMaximum(lowerBound, upperBound);
        const range = high.deduct(low).sumWith(APNFactory._one);

        if (range.isCompact) {
            return low.sumWith(Math.floor(Math.random() * range.primitiveValue));
        }

        const len = range.chunkedValue.length;
        const randomChunks = [];
        let restrictedRange = true;

        for (let i = len - 1; i >= 0; i--) {
            const currentUpperLimit = restrictedRange ? range.chunkedValue[i] : CHUNK_SIZE - 1; // Corrected to CHUNK_SIZE - 1 for max digit
            const digit = floorOrCeil(Math.random() * (currentUpperLimit + 1));
            randomChunks.unshift(digit);
            if (digit < currentUpperLimit) restrictedRange = false;
        }

        const randomNumberArray = convertChunkArrayToNative(randomChunks);
        const finalRandomBigInt = (typeof randomNumberArray === "number")
            ? new CompactNumeric(randomNumberArray)
            : new ExtendedNumeric(randomNumberArray, false);

        return low.sumWith(finalRandomBigInt);
    }

    function parseInputWithBase(textString, base) {
        const strLen = textString.length;
        const absBase = Math.abs(base);

        for (let i = 0; i < strLen; i++) {
            const char = textString[i].toLowerCase();
            if (char === "-") continue;
            if (!/[a-z0-9]/.test(char)) {
                throw new Error(`'${char}' is not a valid character in base ${base}.`);
            }
            let digitValue;
            if (/[0-9]/.test(char)) {
                digitValue = parseInt(char, 10);
            } else {
                digitValue = char.charCodeAt(0) - 87;
            }
            if (digitValue >= absBase) {
                if (!(digitValue === 1 && absBase === 1)) {
                    throw new Error(`'${char}' is not a valid digit in base ${base}. Value ${digitValue} >= base ${absBase}.`);
                }
            }
        }

        if (base >= 2 && base <= 36) {
            const maxNativeDigits = Math.floor(Math.log(JS_MAX_SAFE_INT) / Math.log(base));
            if (strLen <= maxNativeDigits) {
                const result = parseInt(textString, base);
                if (isNaN(result)) {
                    throw new Error(`Invalid input string for base ${base}: ${textString}`);
                }
                return new CompactNumeric(result);
            }
        }

        const parsedBase = normalizeInputToAPN(base);
        const digitValues = [];
        const isNegative = textString[0] === "-";

        for (let i = isNegative ? 1 : 0; i < textString.length; i++) {
            const char = textString[i].toLowerCase();
            const charCode = char.charCodeAt(0);
            if (charCode >= 48 && charCode <= 57) {
                digitValues.push(normalizeInputToAPN(parseInt(char, 10)));
            } else if (charCode >= 97 && charCode <= 122) {
                digitValues.push(normalizeInputToAPN(charCode - 87));
            } else if (char === "<") {
                const startIdx = i;
                do {
                    i++;
                } while (textString[i] !== ">" && i < textString.length);
                if (textString[i] !== ">") {
                    throw new Error("Malformed custom digit format: expected '>'");
                }
                digitValues.push(normalizeInputToAPN(textString.slice(startIdx + 1, i)));
            } else {
                throw new Error(`'${char}' is not a valid character in base ${base}.`);
            }
        }
        return constructFromDigitArray(digitValues, parsedBase, isNegative);
    }

    function constructFromDigitArray(digitsArray, baseValue, isNegativeResult) {
        let accumulatedValue = APNFactory._zero;
        let currentPower = APNFactory._one;

        for (let i = digitsArray.length - 1; i >= 0; i--) {
            accumulatedValue = accumulatedValue.sumWith(digitsArray[i].productOf(currentPower));
            currentPower = currentPower.productOf(baseValue);
        }
        return isNegativeResult ? accumulatedValue.negate() : accumulatedValue;
    }

    function digitToCharString(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return `<${digit}>`;
    }

    function convertValueToBaseDigits(num, targetBase) {
        const base = normalizeInputToAPN(targetBase);
        if (base.isValZero()) {
            if (num.isValZero()) return { digits: [0], isNegative: false };
            throw new Error("Cannot convert non-zero numbers to base 0.");
        }
        if (base.checkEquality(APNFactory._minusOne)) {
            // Placeholder: Conversion to base -1 is complex and less common.
            // For Type III, we can simplify this behavior.
            throw new Error("Conversion to base -1 is not explicitly supported in this implementation.");
        }

        let isNegativeFlag = false;
        let currentNumber = num;
        if (num.isLessZero() && base.isGreaterZero()) {
            isNegativeFlag = true;
            currentNumber = num.absoluteValue();
        }

        if (base.checkEquality(APNFactory._one)) {
            if (num.isValZero()) return { digits: [0], isNegative: false };
            const count = currentNumber.getJavascriptNumber();
            if (!canFitNativeNumber(count)) throw new Error("Number too large to convert to base 1 as array of ones.");
            return { digits: Array(count).fill(1), isNegative: isNegativeFlag };
        }

        const outputDigits = [];
        let divisionResult;

        while (currentNumber.isLessZero() || currentNumber.compareAbsoluteValues(base) >= 0) {
            divisionResult = flexibleDivisionAndModulo(currentNumber, base);
            currentNumber = divisionResult[0];
            let digit = divisionResult[1];

            if (digit.isLessZero()) {
                digit = base.deduct(digit).absoluteValue();
                currentNumber = currentNumber.getNextValue();
            }
            outputDigits.push(digit.getJavascriptNumber());
        }
        outputDigits.push(currentNumber.getJavascriptNumber());
        return { digits: outputDigits.reverse(), isNegative: isNegativeFlag };
    }

    function formatToBaseString(num, base) {
        const { digits, isNegative } = convertValueToBaseDigits(num, base);
        return (isNegative ? "-" : "") + digits.map(digitToCharString).join("");
    }

    function processStringInput(inputStr) {
        if (typeof inputStr !== 'string' || inputStr.trim() === '') {
            throw new Error("Invalid string input: cannot be empty or non-string.");
        }

        const signChar = inputStr[0] === '-' ? '-' : '';
        let cleanStr = inputStr.startsWith('-') ? inputStr.slice(1) : inputStr;
        const scientificParts = cleanStr.split(/e/i);

        if (scientificParts.length > 2) {
            throw new Error(`Invalid numeric string format: multiple 'e' characters found in ${inputStr}`);
        }

        if (scientificParts.length === 2) {
            let [basePart, exponentPart] = scientificParts;
            if (exponentPart.startsWith('+')) exponentPart = exponentPart.slice(1);

            const exponent = parseInt(exponentPart, 10);
            if (isNaN(exponent) || exponent !== floorOrCeil(exponent) || !canFitNativeNumber(exponent)) {
                throw new Error(`Invalid exponent in scientific notation: ${exponentPart} is not a valid integer.`);
            }

            let decimalPointIndex = basePart.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponent -= (basePart.length - decimalPointIndex - 1);
                basePart = basePart.slice(0, decimalPointIndex) + basePart.slice(decimalPointIndex + 1);
            }

            if (exponent < 0) {
                throw new Error("Cannot represent negative exponents for integer values.");
            }
            cleanStr = basePart + "0".repeat(exponent);
        } else {
            cleanStr = scientificParts[0];
        }

        if (!/^\d+$/.test(cleanStr)) {
            throw new Error(`Invalid integer format: '${inputStr}' contains non-digit characters.`);
        }

        if (cleanStr === '0') return APNFactory._zero;

        const chunkedResult = [];
        let maxLen = cleanStr.length;
        const chunkSize = CHUNK_DIGITS;
        let minLen = maxLen - chunkSize;

        while (maxLen > 0) {
            chunkedResult.push(parseInt(cleanStr.substring(Math.max(0, minLen), maxLen), 10));
            maxLen = minLen;
            minLen -= chunkSize;
        }
        removeLeadingZeros(chunkedResult);
        return new ExtendedNumeric(chunkedResult, signChar === '-');
    }

    let processNumericInput = function (inputNum) { // Changed to `let` for re-assignment later
        if (inputNum === null || typeof inputNum === 'undefined') return APNFactory._zero;

        if (canFitNativeNumber(inputNum)) {
            if (inputNum !== floorOrCeil(inputNum)) {
                throw new Error(`'${inputNum}' is not an integer.`);
            }
            return new CompactNumeric(inputNum);
        }
        return processStringInput(inputNum.toString());
    };

    function normalizeInputToAPN(input) {
        if (input instanceof AbstractNumeric) {
            return input;
        }
        if (typeof input === "number") {
            return processNumericInput(input);
        }
        if (typeof input === "string") {
            return processStringInput(input);
        }
        if (input && typeof input.valueOf === 'function') {
             const val = input.valueOf();
             if (typeof val === 'number' || typeof val === 'string') {
                 return normalizeInputToAPN(val);
             }
        }
        throw new Error(`Cannot convert input of type '${typeof input}' to an arbitrary precision number.`);
    }

    ExtendedNumeric.prototype.sumWith = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        if (this.isNegative !== other.isNegative) {
            return this.deduct(other.negate());
        }
        const a = this.chunkedValue, b = other.chunkedValue;
        if (other.isCompact) {
            return new ExtendedNumeric(addNativeToBigIntArray(a, Math.abs(other.primitiveValue)), this.isNegative);
        }
        return new ExtendedNumeric(performFlexibleArrayAdd(a, b), this.isNegative);
    };
    ExtendedNumeric.prototype.plus = ExtendedNumeric.prototype.sumWith;

    ExtendedNumeric.prototype.deduct = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        if (this.isNegative !== other.isNegative) {
            return this.sumWith(other.negate());
        }
        const a = this.chunkedValue, b = other.chunkedValue;
        if (other.isCompact) {
            return subtractNativeFromBigIntArray(a, Math.abs(other.primitiveValue), this.isNegative);
        }
        return performFlexibleArraySubtract(a, b, this.isNegative);
    };
    ExtendedNumeric.prototype.minus = ExtendedNumeric.prototype.deduct;

    ExtendedNumeric.prototype.executeMultiplication = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        const a = this.chunkedValue, b = other.chunkedValue;
        const resultSign = this.isNegative !== other.isNegative;

        if (other.isCompact) {
            if (other.primitiveValue === 0) return APNFactory._zero;
            if (other.primitiveValue === 1) return this;
            if (other.primitiveValue === -1) return this.negate();
            return mixTypeMultiplication(other.primitiveValue, a, resultSign);
        }

        if (shouldUseKaratsuba(a.length, b.length)) {
            return new ExtendedNumeric(karatsubaProduct(a, b), resultSign);
        }
        return new ExtendedNumeric(longMultiplicationAlgorithm(a, b), resultSign);
    };
    ExtendedNumeric.prototype.productOf = ExtendedNumeric.prototype.executeMultiplication;

    ExtendedNumeric.prototype.calculateSquare = function () {
        return new ExtendedNumeric(calculateSquareArray(this.chunkedValue), false);
    };

    ExtendedNumeric.prototype.divmod = function (otherVal) {
        const result = flexibleDivisionAndModulo(this, otherVal);
        return { quotient: result[0], remainder: result[1] };
    };

    ExtendedNumeric.prototype.executeDivision = function (otherVal) {
        return this.divmod(otherVal).quotient;
    };
    ExtendedNumeric.prototype.quotientOf = ExtendedNumeric.prototype.executeDivision;

    ExtendedNumeric.prototype.remainderAfterDivision = function (otherVal) {
        return this.divmod(otherVal).remainder;
    };
    ExtendedNumeric.prototype.modulo = ExtendedNumeric.prototype.remainderAfterDivision;

    ExtendedNumeric.prototype.raiseToPower = function (exponentVal) {
        const exponent = normalizeInputToAPN(exponentVal);
        if (exponent.isValZero()) return APNFactory._one;
        if (this.isValZero()) return APNFactory._zero;
        if (this.checkEquality(APNFactory._one)) return APNFactory._one;
        if (this.checkEquality(APNFactory._minusOne)) return exponent.isParityEven() ? APNFactory._one : APNFactory._minusOne;

        if (exponent.isLessZero()) {
            return APNFactory._zero;
        }

        if (!exponent.isCompact) {
            throw new Error(`Exponent ${exponent.toBaseStringRepresentation()} is too large.`);
        }

        let currentResult = APNFactory._one;
        let currentBase = this;
        let currentExp = exponent.primitiveValue;

        while (true) {
            if ((currentExp & 1) === 1) {
                currentResult = currentResult.productOf(currentBase);
            }
            currentExp = currentExp >> 1;
            if (currentExp === 0) break;
            currentBase = currentBase.calculateSquare();
        }
        return currentResult;
    };

    ExtendedNumeric.prototype.modularInverse = function (modulusVal) {
        let currentT = APNFactory._zero, newT = APNFactory._one;
        let currentR = normalizeInputToAPN(modulusVal), newR = this.absoluteValue();

        if (currentR.isValZero()) {
            throw new Error("Modulus cannot be zero for modular inverse.");
        }

        let q, lastT, lastR;

        while (!newR.isValZero()) {
            q = currentR.executeDivision(newR);
            lastT = currentT;
            lastR = currentR;

            currentT = newT;
            currentR = newR;

            newT = lastT.deduct(q.productOf(newT));
            newR = lastR.deduct(q.productOf(newR));
        }

        if (!currentR.checkEquality(APNFactory._one)) {
            throw new Error(`${this.toBaseStringRepresentation()} and ${modulusVal.toBaseStringRepresentation()} are not coprime.`);
        }

        if (currentT.isLessZero()) {
            currentT = currentT.sumWith(modulusVal);
        }
        if (this.isNegative) {
            currentT = modulusVal.deduct(currentT);
            if (currentT.isValZero()) currentT = modulusVal;
        }
        return currentT;
    };

    ExtendedNumeric.prototype.getNextValue = function () {
        if (this.isNegative) {
            return subtractNativeFromBigIntArray(this.chunkedValue, 1, this.isNegative);
        }
        return new ExtendedNumeric(addNativeToBigIntArray(this.chunkedValue, 1), this.isNegative);
    };

    ExtendedNumeric.prototype.getPreviousValue = function () {
        if (this.isNegative) {
            return new ExtendedNumeric(addNativeToBigIntArray(this.chunkedValue, 1), this.isNegative);
        }
        return subtractNativeFromBigIntArray(this.chunkedValue, 1, this.isNegative);
    };

    const powerOfTwoChunks = [1];
    while (2 * powerOfTwoChunks[powerOfTwoChunks.length - 1] < CHUNK_SIZE) {
        powerOfTwoChunks.push(2 * powerOfTwoChunks[powerOfTwoChunks.length - 1]);
    }
    const powerOfTwoChunkLen = powerOfTwoChunks.length;
    const highestPowerOfTwoChunk = powerOfTwoChunks[powerOfTwoChunkLen - 1];

    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= CHUNK_SIZE || shiftAmount instanceof AbstractNumeric && shiftAmount.chunkedValue.length <= 1;
    }

    ExtendedNumeric.prototype.shiftLeftBits = function (shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount '${String(shiftAmount)}' is too large.`);
        }
        let numericShift = +shiftAmount;
        if (numericShift < 0) return this.shiftRightBits(-numericShift);

        let currentResult = this;
        if (currentResult.isValZero()) return currentResult;

        while (numericShift >= powerOfTwoChunkLen) {
            currentResult = currentResult.executeMultiplication(highestPowerOfTwoChunk);
            numericShift -= (powerOfTwoChunkLen - 1);
        }
        return currentResult.executeMultiplication(powerOfTwoChunks[numericShift]);
    };

    ExtendedNumeric.prototype.shiftRightBits = function (shiftAmount) {
        let remAndQuo;
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(`Shift amount '${String(shiftAmount)}' is too large.`);
        }
        let numericShift = +shiftAmount;
        if (numericShift < 0) return this.shiftLeftBits(-numericShift);

        let currentResult = this;
        while (numericShift >= powerOfTwoChunkLen) {
            if (currentResult.isValZero() || (currentResult.isNegative && currentResult.isValUnit())) {
                return currentResult;
            }
            remAndQuo = flexibleDivisionAndModulo(currentResult, highestPowerOfTwoChunk);
            currentResult = remAndQuo[1].isLessZero() ? remAndQuo[0].getPreviousValue() : remAndQuo[0];
            numericShift -= (powerOfTwoChunkLen - 1);
        }
        remAndQuo = flexibleDivisionAndModulo(currentResult, powerOfTwoChunks[numericShift]);
        return remAndQuo[1].isLessZero() ? remAndQuo[0].getPreviousValue() : remAndQuo[0];
    };

    function performBitwiseOperation(valX, valY, operationFn) {
        const xNormalized = normalizeInputToAPN(valX);
        const yNormalized = normalizeInputToAPN(valY);

        const xIsNegative = xNormalized.isNegative;
        const yIsNegative = yNormalized.isNegative;

        let xRemainder = xIsNegative ? xNormalized.bitwiseNot() : xNormalized;
        let yRemainder = yIsNegative ? yNormalized.bitwiseNot() : yNormalized;

        const resultChunks = [];
        let xDivModResult, yDivModResult;
        let xDigitChunk, yDigitChunk;

        while (!xRemainder.isValZero() || !yRemainder.isValZero()) {
            xDivModResult = flexibleDivisionAndModulo(xRemainder, highestPowerOfTwoChunk);
            xDigitChunk = xDivModResult[1].getJavascriptNumber();
            if (xIsNegative) {
                xDigitChunk = highestPowerOfTwoChunk - 1 - xDigitChunk;
            }

            yDivModResult = flexibleDivisionAndModulo(yRemainder, highestPowerOfTwoChunk);
            yDigitChunk = yDivModResult[1].getJavascriptNumber();
            if (yIsNegative) {
                yDigitChunk = highestPowerOfTwoChunk - 1 - yDigitChunk;
            }

            xRemainder = xDivModResult[0];
            yRemainder = yDivModResult[0];

            resultChunks.push(operationFn(xDigitChunk, yDigitChunk));
        }

        const signBitResult = operationFn(xIsNegative ? 1 : 0, yIsNegative ? 1 : 0);
        let finalSum = (signBitResult !== 0) ? APNFactory._minusOne : APNFactory._zero;

        for (let i = resultChunks.length - 1; i >= 0; i--) {
            finalSum = finalSum.executeMultiplication(highestPowerOfTwoChunk).sumWith(APNFactory(resultChunks[i]));
        }
        return finalSum;
    }

    ExtendedNumeric.prototype.bitwiseNot = function () {
        return this.negate().getPreviousValue();
    };

    ExtendedNumeric.prototype.bitwiseAnd = function (otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a & b);
    };

    ExtendedNumeric.prototype.bitwiseOr = function (otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a | b);
    };

    ExtendedNumeric.prototype.bitwiseXor = function (otherVal) {
        return performBitwiseOperation(this, otherVal, (a, b) => a ^ b);
    };

    function getLeastSignificantBit(numObj) {
        const val = numObj.chunkedValue;
        if (numObj.isValZero()) return 0;

        let totalShift = 0;
        for (let i = 0; i < val.length; i++) {
            if (val[i] === 0) {
                totalShift += CHUNK_DIGITS; // Simplified, assuming CHUNK_SIZE is 10^7, log2(10^7) is approx 23.25. Use CHUNK_DIGITS * log_base_2_of_10.
                // Original was more precise Math.log2(CHUNK_SIZE) / CHUNK_DIGITS. For Type III, simplify.
                continue;
            }
            return totalShift + Math.log2(val[i] & -val[i]);
        }
        return 0;
    }

    function calculateIntegerLog(valueObj, baseObj) {
        if (baseObj.evaluateComparison(valueObj) > 0) {
            return { powerResult: APNFactory._one, exponent: 0 };
        }

        const tempLog = calculateIntegerLog(valueObj, baseObj.calculateSquare());
        const p = tempLog.powerResult;
        const e = tempLog.exponent;

        const t = p.productOf(baseObj);
        return t.evaluateComparison(valueObj) <= 0 ? { powerResult: t, exponent: e * 2 + 1 } : { powerResult: p, exponent: e * 2 };
    }

    ExtendedNumeric.prototype.getBitLength = function () {
        let currentNum = this;
        if (currentNum.isLessZero()) {
            currentNum = currentNum.negate().deduct(APNFactory._one);
        }
        if (currentNum.isValZero()) {
            return APNFactory._zero;
        }
        const logResult = calculateIntegerLog(currentNum, APNFactory[2]);
        return APNFactory(logResult.exponent).sumWith(APNFactory._one);
    };

    ExtendedNumeric.prototype.compareAbsoluteValues = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        const a = this.chunkedValue;
        if (other.isCompact) {
            if (other.primitiveValue === 0) return this.isValZero() ? 0 : 1;
            return compareAbsoluteChunks(a, convertNativeToChunkArray(Math.abs(other.primitiveValue)));
        }
        return compareAbsoluteChunks(a, other.chunkedValue);
    };

    ExtendedNumeric.prototype.evaluateComparison = function (otherVal) {
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const other = normalizeInputToAPN(otherVal);
        const a = this.chunkedValue;

        if (this.isNegative !== other.isNegative) {
            return this.isNegative ? -1 : 1;
        }

        if (other.isCompact) {
            const otherAsBig = normalizeInputToAPN(other.primitiveValue);
            return this.evaluateComparison(otherAsBig);
        }

        const absComparison = compareAbsoluteChunks(a, other.chunkedValue);
        return this.isNegative ? -absComparison : absComparison;
    };
    ExtendedNumeric.prototype.compareTo = ExtendedNumeric.prototype.evaluateComparison;

    ExtendedNumeric.prototype.checkEquality = function (otherVal) {
        return this.evaluateComparison(otherVal) === 0;
    };
    ExtendedNumeric.prototype.isEqual = ExtendedNumeric.prototype.checkEquality;

    ExtendedNumeric.prototype.isNotEqual = function (otherVal) {
        return this.evaluateComparison(otherVal) !== 0;
    };
    ExtendedNumeric.prototype.notEqual = ExtendedNumeric.prototype.isNotEqual;

    ExtendedNumeric.prototype.isGreater = function (otherVal) {
        return this.evaluateComparison(otherVal) > 0;
    };
    ExtendedNumeric.prototype.greaterThan = ExtendedNumeric.prototype.isGreater;

    ExtendedNumeric.prototype.isLesser = function (otherVal) {
        return this.evaluateComparison(otherVal) < 0;
    };
    ExtendedNumeric.prototype.lessThan = ExtendedNumeric.prototype.isLesser;

    ExtendedNumeric.prototype.isGreaterOrEqual = function (otherVal) {
        return this.evaluateComparison(otherVal) >= 0;
    };
    ExtendedNumeric.prototype.greaterThanOrEqual = ExtendedNumeric.prototype.isGreaterOrEqual;

    ExtendedNumeric.prototype.isLesserOrEqual = function (otherVal) {
        return this.evaluateComparison(otherVal) <= 0;
    };
    ExtendedNumeric.prototype.lessThanOrEqual = ExtendedNumeric.prototype.isLesserOrEqual;

    ExtendedNumeric.prototype.isParityEven = function () {
        return (this.chunkedValue[0] & 1) === 0;
    };

    ExtendedNumeric.prototype.isParityOdd = function () {
        return (this.chunkedValue[0] & 1) === 1;
    };

    ExtendedNumeric.prototype.isGreaterZero = function () {
        return !this.isNegative && !this.isValZero();
    };

    ExtendedNumeric.prototype.isLessZero = function () {
        return this.isNegative;
    };

    ExtendedNumeric.prototype.isValUnit = function () {
        return this.chunkedValue.length === 1 && this.chunkedValue[0] === 1;
    };

    ExtendedNumeric.prototype.isValZero = function () {
        return this.chunkedValue.length === 1 && this.chunkedValue[0] === 0;
    };

    ExtendedNumeric.prototype.isDivisibleByOther = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        if (other.isValZero()) return false;
        if (other.isValUnit()) return true;
        if (other.checkEquality(APNFactory[2])) return this.isParityEven();
        return this.remainderAfterDivision(other).isValZero();
    };

    function checkBasicPrimality(numObj) {
        const n = numObj.absoluteValue();
        if (n.isValUnit()) return false;
        if (n.isEqual(APNFactory[2]) || n.isEqual(APNFactory[3]) || n.isEqual(APNFactory[5])) return true;
        if (n.isParityEven() || n.isDivisibleByOther(APNFactory[3]) || n.isDivisibleByOther(APNFactory[5])) return false;
        if (n.isLesser(APNFactory[25])) return true;
        return undefined;
    }

    ExtendedNumeric.prototype.isNumberPrime = function () {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n = this.absoluteValue();
        const nMinusOne = n.getPreviousValue();

        const testPrimes = [2, 3, 5, 7, 11, 13, 17, 19];
        let d = nMinusOne;
        let s = 0;

        while (d.isParityEven()) {
            d = d.executeDivision(APNFactory[2]);
            s++;
        }

        for (let i = 0; i < testPrimes.length; i++) {
            const a = APNFactory(testPrimes[i]);
            if (a.isGreaterOrEqual(n)) continue;

            let x = a.modPow(d, n);

            if (x.isEqual(APNFactory._one) || x.isEqual(nMinusOne)) continue;

            let composite = true;
            for (let r = 0; r < s; r++) {
                x = x.calculateSquare().modulo(n);
                if (x.isEqual(nMinusOne)) {
                    composite = false;
                    break;
                }
            }
            if (composite) return false;
        }
        return true;
    };

    ExtendedNumeric.prototype.isProbablyPrime = function (iterations) {
        const basicCheckResult = checkBasicPrimality(this);
        if (basicCheckResult !== undefined) return basicCheckResult;

        const n = this.absoluteValue();
        const testCount = iterations === undefined ? 5 : iterations;

        const nMinusTwo = n.deduct(APNFactory[2]);
        for (let i = 0; i < testCount; i++) {
            const a = generateRandomBetween(APNFactory[2], nMinusTwo);
            if (!a.modPow(n.getPreviousValue(), n).isValUnit()) {
                return false;
            }
        }
        return true;
    };

    ExtendedNumeric.prototype.modPow = function (expVal, modVal) {
        const exponent = normalizeInputToAPN(expVal);
        const modulus = normalizeInputToAPN(modVal);

        if (modulus.isValZero()) {
            throw new Error("Modulus cannot be zero for modular exponentiation.");
        }

        let result = APNFactory._one;
        let currentBase = this.modulo(modulus);

        if (exponent.isLessZero()) {
            const invBase = currentBase.modularInverse(modulus);
            return invBase.modPow(exponent.absoluteValue(), modulus);
        }

        while (exponent.isGreaterZero()) {
            if (currentBase.isValZero()) return APNFactory._zero;
            if (exponent.isParityOdd()) {
                result = result.executeMultiplication(currentBase).modulo(modulus);
            }
            // Reassign exponent's chunkedValue to update in place
            exponent.chunkedValue = flexibleDivisionAndModulo(exponent, APNFactory[2])[0].chunkedValue;
            currentBase = currentBase.calculateSquare().modulo(modulus);
        }
        return result;
    };

    ExtendedNumeric.prototype.convertToDigitArray = function (radix) {
        return convertValueToBaseDigits(this, radix);
    };

    ExtendedNumeric.prototype.toBaseStringRepresentation = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);

        const chunks = this.chunkedValue;
        let index = chunks.length;
        let outputString = String(chunks[--index]);

        const padding = "0".repeat(CHUNK_DIGITS);

        while (--index >= 0) {
            const currentChunk = String(chunks[index]);
            outputString += padding.slice(currentChunk.length) + currentChunk;
        }
        const signPrefix = this.isNegative ? "-" : "";
        return signPrefix + outputString;
    };

    ExtendedNumeric.prototype.serializeToJSON = ExtendedNumeric.prototype.toBaseStringRepresentation;

    ExtendedNumeric.prototype.getPrimitiveValue = function () {
        return parseInt(this.toBaseStringRepresentation(), 10);
    };
    ExtendedNumeric.prototype.getJavascriptNumber = ExtendedNumeric.prototype.getPrimitiveValue;

    ExtendedNumeric.prototype.absoluteValue = function () {
        return new ExtendedNumeric(this.chunkedValue, false);
    };

    ExtendedNumeric.prototype.negate = function () {
        if (this.isValZero()) return APNFactory._zero;
        return new ExtendedNumeric(this.chunkedValue, !this.isNegative);
    };

    CompactNumeric.prototype.sumWith = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        const a = this.primitiveValue;

        if ((a < 0) !== other.isNegative) {
            return this.deduct(other.negate());
        }

        if (other.isCompact) {
            const b = other.primitiveValue;
            const sum = a + b;
            if (canFitNativeNumber(sum)) {
                return new CompactNumeric(sum);
            }
            return new ExtendedNumeric(addNativeToBigIntArray(convertNativeToChunkArray(Math.abs(b)), Math.abs(a)), a < 0);
        }
        return other.sumWith(this);
    };
    CompactNumeric.prototype.plus = CompactNumeric.prototype.sumWith;

    CompactNumeric.prototype.deduct = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        const a = this.primitiveValue;

        if ((a < 0) !== other.isNegative) {
            return this.sumWith(other.negate());
        }

        if (other.isCompact) {
            const b = other.primitiveValue;
            const difference = a - b;
            if (canFitNativeNumber(difference)) {
                return new CompactNumeric(difference);
            }
            return subtractNativeFromBigIntArray(convertNativeToChunkArray(Math.abs(b)), Math.abs(a), a < 0);
        }
        return other.negate().sumWith(this);
    };
    CompactNumeric.prototype.minus = CompactNumeric.prototype.deduct;

    CompactNumeric.prototype.executeMultiplication = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        return other._multiplyBySmall(this);
    };
    CompactNumeric.prototype.productOf = CompactNumeric.prototype.executeMultiplication;

    AbstractNumeric.prototype._multiplyBySmall = function (smallNumObj) {
        const a = this.primitiveValue;
        const b = smallNumObj.primitiveValue;
        const product = a * b;
        if (canFitNativeNumber(product)) {
            return new CompactNumeric(product);
        }
        const resultSign = this.isNegative !== smallNumObj.isNegative;
        return mixTypeMultiplication(Math.abs(a), convertNativeToChunkArray(Math.abs(b)), resultSign);
    };

    ExtendedNumeric.prototype._multiplyBySmall = function (smallNumObj) {
        const smallVal = smallNumObj.primitiveValue;
        if (smallVal === 0) return APNFactory._zero;
        if (smallVal === 1) return this;
        if (smallVal === -1) return this.negate();
        const resultSign = this.isNegative !== smallNumObj.isNegative;
        return mixTypeMultiplication(Math.abs(smallVal), this.chunkedValue, resultSign);
    };

    CompactNumeric.prototype.calculateSquare = function () {
        const val = this.primitiveValue;
        const squared = val * val;
        if (canFitNativeNumber(squared)) {
            return new CompactNumeric(squared);
        }
        return new ExtendedNumeric(calculateSquareArray(convertNativeToChunkArray(Math.abs(val))), false);
    };

    CompactNumeric.prototype.divmod = ExtendedNumeric.prototype.divmod;
    CompactNumeric.prototype.executeDivision = ExtendedNumeric.prototype.executeDivision;
    CompactNumeric.prototype.quotientOf = ExtendedNumeric.prototype.quotientOf;
    CompactNumeric.prototype.remainderAfterDivision = ExtendedNumeric.prototype.remainderAfterDivision;
    CompactNumeric.prototype.modulo = ExtendedNumeric.prototype.modulo;

    CompactNumeric.prototype.raiseToPower = ExtendedNumeric.prototype.raiseToPower;
    CompactNumeric.prototype.modularInverse = ExtendedNumeric.prototype.modularInverse;

    CompactNumeric.prototype.getNextValue = function () {
        const val = this.primitiveValue;
        if (val + 1 < JS_MAX_SAFE_INT) {
            return new CompactNumeric(val + 1);
        }
        return new ExtendedNumeric(JS_MAX_SAFE_INT_DIGITS_ARRAY, false);
    };

    CompactNumeric.prototype.getPreviousValue = function () {
        const val = this.primitiveValue;
        if (val - 1 > -JS_MAX_SAFE_INT) {
            return new CompactNumeric(val - 1);
        }
        return new ExtendedNumeric(JS_MAX_SAFE_INT_DIGITS_ARRAY, true);
    };

    CompactNumeric.prototype.shiftLeftBits = ExtendedNumeric.prototype.shiftLeftBits;
    CompactNumeric.prototype.shiftRightBits = ExtendedNumeric.prototype.shiftRightBits;
    CompactNumeric.prototype.bitwiseNot = ExtendedNumeric.prototype.bitwiseNot;
    CompactNumeric.prototype.bitwiseAnd = ExtendedNumeric.prototype.bitwiseAnd;
    CompactNumeric.prototype.bitwiseOr = ExtendedNumeric.prototype.bitwiseOr;
    CompactNumeric.prototype.bitwiseXor = ExtendedNumeric.prototype.bitwiseXor;
    CompactNumeric.prototype.getBitLength = ExtendedNumeric.prototype.getBitLength;

    CompactNumeric.prototype.compareAbsoluteValues = function (otherVal) {
        const other = normalizeInputToAPN(otherVal);
        const a = Math.abs(this.primitiveValue);
        if (other.isCompact) {
            const absB = Math.abs(other.primitiveValue);
            return (a === absB) ? 0 : (a > absB) ? 1 : -1;
        }
        return other.compareAbsoluteValues(this) * -1;
    };

    CompactNumeric.prototype.evaluateComparison = function (otherVal) {
        if (otherVal === Infinity) return -1;
        if (otherVal === -Infinity) return 1;

        const other = normalizeInputToAPN(otherVal);
        const a = this.primitiveValue;

        if (other.isCompact) {
            const b = other.primitiveValue;
            return (a === b) ? 0 : (a > b) ? 1 : -1;
        }

        if ((a < 0) !== other.isNegative) {
            return (a < 0) ? -1 : 1;
        }
        return other.evaluateComparison(this) * -1;
    };
    CompactNumeric.prototype.compareTo = CompactNumeric.prototype.evaluateComparison;

    CompactNumeric.prototype.checkEquality = ExtendedNumeric.prototype.checkEquality;
    CompactNumeric.prototype.isEqual = ExtendedNumeric.prototype.isEqual;
    CompactNumeric.prototype.isNotEqual = ExtendedNumeric.prototype.isNotEqual;
    CompactNumeric.prototype.notEqual = ExtendedNumeric.prototype.isNotEqual;
    CompactNumeric.prototype.isGreater = ExtendedNumeric.prototype.isGreater;
    CompactNumeric.prototype.greaterThan = ExtendedNumeric.prototype.greaterThan;
    CompactNumeric.prototype.isLesser = ExtendedNumeric.prototype.isLesser;
    CompactNumeric.prototype.lessThan = ExtendedNumeric.prototype.lessThan;
    CompactNumeric.prototype.isGreaterOrEqual = ExtendedNumeric.prototype.isGreaterOrEqual;
    CompactNumeric.prototype.greaterThanOrEqual = ExtendedNumeric.prototype.greaterThanOrEqual;
    CompactNumeric.prototype.isLesserOrEqual = ExtendedNumeric.prototype.isLesserOrEqual;
    CompactNumeric.prototype.lessThanOrEqual = ExtendedNumeric.prototype.lessThanOrEqual;

    CompactNumeric.prototype.isParityEven = function () {
        return (this.primitiveValue & 1) === 0;
    };

    CompactNumeric.prototype.isParityOdd = function () {
        return (this.primitiveValue & 1) === 1;
    };

    CompactNumeric.prototype.isGreaterZero = function () {
        return this.primitiveValue > 0;
    };

    CompactNumeric.prototype.isLessZero = function () {
        return this.primitiveValue < 0;
    };

    CompactNumeric.prototype.isValUnit = function () {
        return Math.abs(this.primitiveValue) === 1;
    };

    CompactNumeric.prototype.isValZero = function () {
        return this.primitiveValue === 0;
    };

    CompactNumeric.prototype.isDivisibleByOther = ExtendedNumeric.prototype.isDivisibleByOther;

    CompactNumeric.prototype.isNumberPrime = ExtendedNumeric.prototype.isNumberPrime;
    CompactNumeric.prototype.isProbablyPrime = ExtendedNumeric.prototype.isProbablyPrime;

    CompactNumeric.prototype.convertToDigitArray = ExtendedNumeric.prototype.convertToDigitArray;

    CompactNumeric.prototype.toBaseStringRepresentation = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return formatToBaseString(this, radix);
        return String(this.primitiveValue);
    };

    CompactNumeric.prototype.serializeToJSON = CompactNumeric.prototype.toBaseStringRepresentation;

    CompactNumeric.prototype.getPrimitiveValue = function () {
        return this.primitiveValue;
    };
    CompactNumeric.prototype.getJavascriptNumber = CompactNumeric.prototype.getPrimitiveValue;

    CompactNumeric.prototype.absoluteValue = function () {
        return new CompactNumeric(Math.abs(this.primitiveValue));
    };

    CompactNumeric.prototype.negate = function () {
        if (this.primitiveValue === 0) return APNFactory._zero;
        const negated = new CompactNumeric(-this.primitiveValue);
        negated.isNegative = !this.isNegative;
        return negated;
    };

    const smallIntegerCache = {};
    for (let i = 0; i < 1000; i++) {
        smallIntegerCache[i] = new CompactNumeric(i);
        if (i > 0) smallIntegerCache[-i] = new CompactNumeric(-i);
    }

    const originalProcessNumericInput = processNumericInput;
    processNumericInput = function (inputNum) {
        if (typeof inputNum === 'number' && canFitNativeNumber(inputNum)) {
            if (smallIntegerCache[inputNum] !== undefined) {
                return smallIntegerCache[inputNum];
            }
            if (inputNum === floorOrCeil(inputNum)) {
                return new CompactNumeric(inputNum);
            }
            throw new Error(`'${inputNum}' is not an integer.`);
        }
        return originalProcessNumericInput(inputNum);
    };

    APNFactory._one = normalizeInputToAPN(1);
    APNFactory._zero = normalizeInputToAPN(0);
    APNFactory._minusOne = normalizeInputToAPN(-1);

    APNFactory.max = findMaximum;
    APNFactory.min = findMinimum;
    APNFactory.gcd = greatestCommonDivisor;
    APNFactory.lcm = leastCommonMultiple;
    APNFactory.isInstance = function (obj) {
        return obj instanceof ExtendedNumeric || obj instanceof CompactNumeric;
    };
    APNFactory.randBetween = generateRandomBetween;
    APNFactory.fromArray = function (digits, base, isNegative) {
        const processedDigits = digits.map(normalizeInputToAPN);
        const processedBase = normalizeInputToAPN(base || 10);
        return constructFromDigitArray(processedDigits, processedBase, isNegative);
    };

    APNFactory.version = "1.0.1-clone";

    return APNFactory;
})(undefined);

function ApplicationMainLogic(inputData) {
    if (typeof inputData !== 'string' || inputData.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return;
    }

    const inputLines = inputData.split("\n");
    if (inputLines.length === 0) {
        console.error("Error: No lines found in input data.");
        return;
    }

    let rawNumberInput = parseFloat(inputLines[0].trim());
    if (isNaN(rawNumberInput)) {
        console.error(`Error: Invalid number format in input: "${inputLines[0].trim()}"`);
        return;
    }
    if (!Number.isInteger(rawNumberInput)) {
        console.warn(`Warning: Input number "${inputLines[0].trim()}" is not an integer. Truncating.`);
        rawNumberInput = Math.trunc(rawNumberInput);
    }
    
    const N_val = createArbitraryPrecisionNumber(rawNumberInput);

    // Calculate the triangular number (N * (N - 1)) / 2
    const N_minus_one = N_val.deduct(createArbitraryPrecisionNumber(1));
    const product_N_N_minus_one = N_val.productOf(N_minus_one);
    const resultValue = product_N_N_minus_one.executeDivision(createArbitraryPrecisionNumber(2));

    console.log(resultValue.toBaseStringRepresentation());
}

let fileContent = '';
try {
    const fileSystemUtility = require("fs");
    const inputFilePath = "/dev/stdin";
    fileContent = fileSystemUtility.readFileSync(inputFilePath, "utf8");
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    console.log("Using dummy input '10' for demonstration due to input error.");
    fileContent = "10";
}

ApplicationMainLogic(fileContent);