"use strict";

let largeNum = function (noVal) {
    const NUM_CHUNK_SIZE = 10_000_000,
        CHUNK_DIGITS_COUNT = 7,
        JS_SAFE_MAX = 9_007_199_254_740_992,
        SAFE_MAX_ARRAY = compactToChain(JS_SAFE_MAX),
        LOG_JS_SAFE_MAX = Math.log(JS_SAFE_MAX);

    /**
     * Represents a numeric value. Base class for MultiDigit and SingleDigit.
     * @constructor
     * @param {*} inputVal - The value to parse.
     * @param {number} [baseVal] - The radix for parsing.
     * @returns {NumericValue}
     */
    function NumericValue(inputVal, baseVal) {
        // If no value is provided, return the cached zero value.
        if (typeof inputVal === "undefined") {
            return NumericValue.zeroConst;
        }

        // If a radix is specified, parse accordingly.
        if (typeof baseVal !== "undefined") {
            return +baseVal === 10 ? interpretInput(inputVal) : parseFromBaseString(inputVal, baseVal);
        }
        return interpretInput(inputVal);
    }

    /**
     * Represents a large integer that exceeds JavaScript's safe integer limit.
     * @constructor
     * @param {number[]} digitChain - An array of number chunks representing the value.
     * @param {boolean} isNegative - True if the number is negative, false otherwise.
     */
    function MultiDigit(digitChain, isNegative) {
        this.digitChain = digitChain;
        this.isNegative = isNegative;
        this.isCompact = false;
    }
    MultiDigit.proto = Object.create(NumericValue.proto);

    /**
     * Represents a small integer that fits within JavaScript's safe integer limit.
     * @constructor
     * @param {number} digitChain - The native JavaScript number value.
     */
    function SingleDigit(digitChain) {
        this.digitChain = digitChain;
        this.isNegative = digitChain < 0;
        this.isCompact = true;
    }
    SingleDigit.proto = Object.create(NumericValue.proto);

    /**
     * Checks if a number fits within JavaScript's safe integer range.
     * @param {number} n - The number to check.
     * @returns {boolean} True if precise, false otherwise.
     */
    function canFitInNative(n) {
        return -JS_SAFE_MAX < n && n < JS_SAFE_MAX;
    }

    /**
     * Converts a small native number into a digit chain array.
     * @param {number} n - The number to convert.
     * @returns {number[]} The digit chain array.
     */
    function compactToChain(n) {
        if (n < 10_000_000) return [n];
        if (n < 100_000_000_000_000) return [n % 10_000_000, Math.floor(n / 10_000_000)];
        return [n % 10_000_000, Math.floor(n / 10_000_000) % 10_000_000, Math.floor(n / 100_000_000_000_000)];
    }

    /**
     * Converts a digit chain array back to a small native number if possible.
     * @param {number[]} arr - The digit chain array.
     * @returns {number|number[]} The native number or the original array if too large.
     */
    function chainToCompact(arr) {
        cleanUp(arr);
        let arrLen = arr.length;
        if (arrLen < 4 && compareAbsolute(arr, SAFE_MAX_ARRAY) < 0) {
            switch (arrLen) {
                case 0:
                    return 0;
                case 1:
                    return arr[0];
                case 2:
                    return arr[0] + arr[1] * NUM_CHUNK_SIZE;
                default:
                    return arr[0] + (arr[1] + arr[2] * NUM_CHUNK_SIZE) * NUM_CHUNK_SIZE;
            }
        }
        return arr;
    }

    /**
     * Removes leading zeros from a digit chain array.
     * @param {number[]} digitChain - The array to trim.
     */
    function cleanUp(digitChain) {
        let index = digitChain.length;
        while (digitChain[--index] === 0);
        digitChain.length = index + 1;
    }

    /**
     * Creates a new array filled with zeros.
     * @param {number} length - The desired length of the array.
     * @returns {number[]} The new array.
     */
    function makeZeroArray(length) {
        let newArray = new Array(length);
        let index = -1;
        while (++index < length) {
            newArray[index] = 0;
        }
        return newArray;
    }

    /**
     * Truncates a number to its integer part (floor for positive, ceil for negative).
     * @param {number} n - The number to truncate.
     * @returns {number} The truncated integer.
     */
    function floorOrCeil(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    /**
     * Adds two digit chain arrays.
     * @param {number[]} operandA - First array.
     * @param {number[]} operandB - Second array.
     * @returns {number[]} The sum array.
     */
    function sumChains(operandA, operandB) {
        let lenA = operandA.length,
            lenB = operandB.length,
            resultArr = new Array(lenA),
            carryOver = 0,
            chunkBase = NUM_CHUNK_SIZE,
            currentSum,
            index;

        for (index = 0; index < lenB; index++) {
            currentSum = operandA[index] + operandB[index] + carryOver;
            carryOver = currentSum >= chunkBase ? 1 : 0;
            resultArr[index] = currentSum - carryOver * chunkBase;
        }
        while (index < lenA) {
            currentSum = operandA[index] + carryOver;
            carryOver = currentSum === chunkBase ? 1 : 0;
            resultArr[index++] = currentSum - carryOver * chunkBase;
        }
        if (carryOver > 0) resultArr.push(carryOver);
        return resultArr;
    }

    /**
     * Adds two digit chain arrays, ensuring the longer one is first for sumChains.
     * @param {number[]} operandA - First array.
     * @param {number[]} operandB - Second array.
     * @returns {number[]} The sum array.
     */
    function sumChainsFlexible(operandA, operandB) {
        if (operandA.length >= operandB.length) return sumChains(operandA, operandB);
        return sumChains(operandB, operandA);
    }

    /**
     * Adds a small integer (carry) to a digit chain array.
     * @param {number[]} operandA - The digit chain array.
     * @param {number} carryOver - The small integer to add.
     * @returns {number[]} The sum array.
     */
    function sumChainWithCompact(operandA, carryOver) {
        let lengthVal = operandA.length,
            resultArr = new Array(lengthVal),
            chunkBase = NUM_CHUNK_SIZE,
            currentSum,
            index;

        for (index = 0; index < lengthVal; index++) {
            currentSum = operandA[index] - chunkBase + carryOver;
            carryOver = Math.floor(currentSum / chunkBase);
            resultArr[index] = currentSum - carryOver * chunkBase;
            carryOver += 1;
        }
        while (carryOver > 0) {
            resultArr[index++] = carryOver % chunkBase;
            carryOver = Math.floor(carryOver / chunkBase);
        }
        return resultArr;
    }

    MultiDigit.proto.add = function (inputVal) {
        let numVal = interpretInput(inputVal);
        if (this.isNegative !== numVal.isNegative) {
            return this.subtract(numVal.invertSign());
        }
        let operandA = this.digitChain,
            operandB = numVal.digitChain;
        if (numVal.isCompact) {
            return new MultiDigit(sumChainWithCompact(operandA, Math.abs(operandB)), this.isNegative);
        }
        return new MultiDigit(sumChainsFlexible(operandA, operandB), this.isNegative);
    };
    MultiDigit.proto.plus = MultiDigit.proto.add;

    SingleDigit.proto.add = function (inputVal) {
        let numVal = interpretInput(inputVal);
        let nativeValA = this.digitChain;
        if (nativeValA < 0 !== numVal.isNegative) {
            return this.subtract(numVal.invertSign());
        }
        let nativeValB = numVal.digitChain;
        if (numVal.isCompact) {
            if (canFitInNative(nativeValA + nativeValB)) return new SingleDigit(nativeValA + nativeValB);
            nativeValB = compactToChain(Math.abs(nativeValB));
        }
        return new MultiDigit(sumChainWithCompact(nativeValB, Math.abs(nativeValA)), nativeValA < 0);
    };
    SingleDigit.proto.plus = SingleDigit.proto.add;

    /**
     * Subtracts two digit chain arrays (operandA - operandB).
     * Assumes operandA >= operandB.
     * @param {number[]} operandA - The minuend array.
     * @param {number[]} operandB - The subtrahend array.
     * @returns {number[]} The difference array.
     */
    function diffChains(operandA, operandB) {
        let lenValA = operandA.length,
            lenValB = operandB.length,
            resultArr = new Array(lenValA),
            borrowAmount = 0,
            chunkBase = NUM_CHUNK_SIZE,
            index,
            currentDiff;

        for (index = 0; index < lenValB; index++) {
            currentDiff = operandA[index] - borrowAmount - operandB[index];
            if (currentDiff < 0) {
                currentDiff += chunkBase;
                borrowAmount = 1;
            } else borrowAmount = 0;
            resultArr[index] = currentDiff;
        }
        for (index = lenValB; index < lenValA; index++) {
            currentDiff = operandA[index] - borrowAmount;
            if (currentDiff < 0) currentDiff += chunkBase;
            else {
                resultArr[index++] = currentDiff;
                break;
            }
            resultArr[index] = currentDiff;
        }
        for (; index < lenValA; index++) {
            resultArr[index] = operandA[index];
        }
        cleanUp(resultArr);
        return resultArr;
    }

    /**
     * Subtracts two digit chain arrays, handling signs and order.
     * @param {number[]} operandA - First array.
     * @param {number[]} operandB - Second array.
     * @param {boolean} currentSign - The sign of the original first operand.
     * @returns {SingleDigit|MultiDigit} The result.
     */
    function diffChainsFlexible(operandA, operandB, currentSign) {
        let resultValue;
        if (compareAbsolute(operandA, operandB) >= 0) {
            resultValue = diffChains(operandA, operandB);
        } else {
            resultValue = diffChains(operandB, operandA);
            currentSign = !currentSign;
        }
        resultValue = chainToCompact(resultValue);
        if (typeof resultValue === "number") {
            if (currentSign) resultValue = -resultValue;
            return new SingleDigit(resultValue);
        }
        return new MultiDigit(resultValue, currentSign);
    }

    /**
     * Subtracts a small integer from a digit chain array.
     * @param {number[]} operandA - The digit chain array.
     * @param {number} nativeValB - The small integer to subtract.
     * @param {boolean} currentSign - The sign of the original first operand.
     * @returns {SingleDigit|MultiDigit} The result.
     */
    function diffChainWithCompact(operandA, nativeValB, currentSign) {
        let lengthVal = operandA.length,
            resultArr = new Array(lengthVal),
            carryOver = -nativeValB,
            chunkBase = NUM_CHUNK_SIZE,
            index,
            currentDiff;

        for (index = 0; index < lengthVal; index++) {
            currentDiff = operandA[index] + carryOver;
            carryOver = Math.floor(currentDiff / chunkBase);
            currentDiff %= chunkBase;
            resultArr[index] = currentDiff < 0 ? currentDiff + chunkBase : currentDiff;
        }
        resultArr = chainToCompact(resultArr);
        if (typeof resultArr === "number") {
            if (currentSign) resultArr = -resultArr;
            return new SingleDigit(resultArr);
        }
        return new MultiDigit(resultArr, currentSign);
    }

    MultiDigit.proto.subtract = function (inputVal) {
        let numVal = interpretInput(inputVal);
        if (this.isNegative !== numVal.isNegative) {
            return this.add(numVal.invertSign());
        }
        let operandA = this.digitChain,
            operandB = numVal.digitChain;
        if (numVal.isCompact) return diffChainWithCompact(operandA, Math.abs(operandB), this.isNegative);
        return diffChainsFlexible(operandA, operandB, this.isNegative);
    };
    MultiDigit.proto.minus = MultiDigit.proto.subtract;

    SingleDigit.proto.subtract = function (inputVal) {
        let numVal = interpretInput(inputVal);
        let nativeValA = this.digitChain;
        if (nativeValA < 0 !== numVal.isNegative) {
            return this.add(numVal.invertSign());
        }
        let nativeValB = numVal.digitChain;
        if (numVal.isCompact) {
            return new SingleDigit(nativeValA - nativeValB);
        }
        return diffChainWithCompact(nativeValB, Math.abs(nativeValA), nativeValA >= 0);
    };
    SingleDigit.proto.minus = SingleDigit.proto.subtract;

    MultiDigit.proto.invertSign = function () {
        return new MultiDigit(this.digitChain, !this.isNegative);
    };
    SingleDigit.proto.invertSign = function () {
        let currentSign = this.isNegative;
        let compactVal = new SingleDigit(-this.digitChain);
        compactVal.isNegative = !currentSign;
        return compactVal;
    };

    MultiDigit.proto.absoluteValue = function () {
        return new MultiDigit(this.digitChain, false);
    };
    SingleDigit.proto.absoluteValue = function () {
        return new SingleDigit(Math.abs(this.digitChain));
    };

    /**
     * Multiplies two digit chain arrays using long multiplication.
     * @param {number[]} operandA - First array.
     * @param {number[]} operandB - Second array.
     * @returns {number[]} The product array.
     */
    function productLong(operandA, operandB) {
        let lenA = operandA.length,
            lenB = operandB.length,
            resultArr = makeZeroArray(lenA + lenB),
            chunkBase = NUM_CHUNK_SIZE,
            currentProduct,
            carryOver,
            index,
            digitA,
            digitB;

        for (index = 0; index < lenA; ++index) {
            digitA = operandA[index];
            for (let innerIndex = 0; innerIndex < lenB; ++innerIndex) {
                digitB = operandB[innerIndex];
                currentProduct = digitA * digitB + resultArr[index + innerIndex];
                carryOver = Math.floor(currentProduct / chunkBase);
                resultArr[index + innerIndex] = currentProduct - carryOver * chunkBase;
                resultArr[index + innerIndex + 1] += carryOver;
            }
        }
        cleanUp(resultArr);
        return resultArr;
    }

    /**
     * Multiplies a digit chain array by a small integer.
     * @param {number[]} operandA - The digit chain array.
     * @param {number} nativeValB - The small integer.
     * @returns {number[]} The product array.
     */
    function productCompact(operandA, nativeValB) {
        let lengthVal = operandA.length,
            resultArr = new Array(lengthVal),
            chunkBase = NUM_CHUNK_SIZE,
            carryOver = 0,
            currentProduct,
            index;

        for (index = 0; index < lengthVal; index++) {
            currentProduct = operandA[index] * nativeValB + carryOver;
            carryOver = Math.floor(currentProduct / chunkBase);
            resultArr[index] = currentProduct - carryOver * chunkBase;
        }
        while (carryOver > 0) {
            resultArr[index++] = carryOver % chunkBase;
            carryOver = Math.floor(carryOver / chunkBase);
        }
        return resultArr;
    }

    /**
     * Shifts a digit chain array left by adding zeros.
     * @param {number[]} inputChain - The array to shift.
     * @param {number} shiftAmount - The number of zeros to append.
     * @returns {number[]} The shifted array.
     */
    function shiftDigitsLeft(inputChain, shiftAmount) {
        let result = [];
        while (shiftAmount-- > 0) result.push(0);
        return result.concat(inputChain);
    }

    /**
     * Multiplies two digit chain arrays using Karatsuba algorithm.
     * @param {number[]} opX - First array.
     * @param {number[]} opY - Second array.
     * @returns {number[]} The product array.
     */
    function karatsubaProduct(opX, opY) {
        let lengthVal = Math.max(opX.length, opY.length);
        if (lengthVal <= 30) return productLong(opX, opY);

        lengthVal = Math.ceil(lengthVal / 2);
        let b = opX.slice(lengthVal),
            a = opX.slice(0, lengthVal),
            d = opY.slice(lengthVal),
            c = opY.slice(0, lengthVal);

        let prodAC = karatsubaProduct(a, c),
            prodBD = karatsubaProduct(b, d),
            prodABCD = karatsubaProduct(sumChainsFlexible(a, b), sumChainsFlexible(c, d));

        let productResult = sumChainsFlexible(
            sumChainsFlexible(prodAC, shiftDigitsLeft(diffChains(diffChains(prodABCD, prodAC), prodBD), lengthVal)),
            shiftDigitsLeft(prodBD, 2 * lengthVal)
        );
        cleanUp(productResult);
        return productResult;
    }

    /**
     * Determines if Karatsuba multiplication should be used based on operand lengths.
     * @param {number} len1 - Length of first operand.
     * @param {number} len2 - Length of second operand.
     * @returns {boolean} True if Karatsuba is more efficient.
     */
    function shouldUseKaratsuba(len1, len2) {
        return -0.012 * len1 - 0.012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    MultiDigit.proto.multiply = function (inputVal) {
        let numVal = interpretInput(inputVal),
            operandA = this.digitChain,
            operandB = numVal.digitChain,
            isResultNegative = this.isNegative !== numVal.isNegative,
            absoluteVal;

        if (numVal.isCompact) {
            if (operandB === 0) return NumericValue.zeroConst;
            if (operandB === 1) return this;
            if (operandB === -1) return this.invertSign();
            absoluteVal = Math.abs(operandB);
            if (absoluteVal < NUM_CHUNK_SIZE) {
                return new MultiDigit(productCompact(operandA, absoluteVal), isResultNegative);
            }
            operandB = compactToChain(absoluteVal);
        }
        if (shouldUseKaratsuba(operandA.length, operandB.length))
            return new MultiDigit(karatsubaProduct(operandA, operandB), isResultNegative);
        return new MultiDigit(productLong(operandA, operandB), isResultNegative);
    };
    MultiDigit.proto.times = MultiDigit.proto.multiply;

    /**
     * Multiplies a small integer by a digit chain array.
     * @param {number} nativeValA - The small integer.
     * @param {number[]} operandB - The digit chain array.
     * @param {boolean} isResultNegative - Whether the result should be negative.
     * @returns {MultiDigit} The product.
     */
    function productCompactAndChain(nativeValA, operandB, isResultNegative) {
        if (nativeValA < NUM_CHUNK_SIZE) {
            return new MultiDigit(productCompact(operandB, nativeValA), isResultNegative);
        }
        return new MultiDigit(productLong(operandB, compactToChain(nativeValA)), isResultNegative);
    }

    SingleDigit.proto._productByCompact = function (otherVal) {
        if (canFitInNative(otherVal.digitChain * this.digitChain)) {
            return new SingleDigit(otherVal.digitChain * this.digitChain);
        }
        return productCompactAndChain(
            Math.abs(otherVal.digitChain),
            compactToChain(Math.abs(this.digitChain)),
            this.isNegative !== otherVal.isNegative
        );
    };
    MultiDigit.proto._productByCompact = function (otherVal) {
        if (otherVal.digitChain === 0) return NumericValue.zeroConst;
        if (otherVal.digitChain === 1) return this;
        if (otherVal.digitChain === -1) return this.invertSign();
        return productCompactAndChain(Math.abs(otherVal.digitChain), this.digitChain, this.isNegative !== otherVal.isNegative);
    };

    SingleDigit.proto.multiply = function (inputVal) {
        return interpretInput(inputVal)._productByCompact(this);
    };
    SingleDigit.proto.times = SingleDigit.proto.multiply;

    /**
     * Squares a digit chain array.
     * @param {number[]} operandA - The array to square.
     * @returns {number[]} The squared array.
     */
    function squareChain(operandA) {
        let lengthVal = operandA.length,
            resultArr = makeZeroArray(lengthVal + lengthVal),
            chunkBase = NUM_CHUNK_SIZE,
            currentProduct,
            carryOver,
            index,
            digitA,
            digitJ;

        for (index = 0; index < lengthVal; index++) {
            digitA = operandA[index];
            carryOver = 0 - digitA * digitA;
            for (let innerIndex = index; innerIndex < lengthVal; innerIndex++) {
                digitJ = operandA[innerIndex];
                currentProduct = 2 * (digitA * digitJ) + resultArr[index + innerIndex] + carryOver;
                carryOver = Math.floor(currentProduct / chunkBase);
                resultArr[index + innerIndex] = currentProduct - carryOver * chunkBase;
            }
            resultArr[index + lengthVal] = carryOver;
        }
        cleanUp(resultArr);
        return resultArr;
    }

    MultiDigit.proto.square = function () {
        return new MultiDigit(squareChain(this.digitChain), false);
    };
    SingleDigit.proto.square = function () {
        let resultVal = this.digitChain * this.digitChain;
        if (canFitInNative(resultVal)) return new SingleDigit(resultVal);
        return new MultiDigit(squareChain(compactToChain(Math.abs(this.digitChain))), false);
    };

    /**
     * Divides two digit chain arrays using algorithm 1 (Knuth's D-algorithm).
     * @param {number[]} operandA - The dividend.
     * @param {number[]} operandB - The divisor.
     * @returns {[number[], number[]]} An array containing the quotient and remainder arrays.
     */
    function divideAndModAlgorithm1(operandA, operandB) {
        let lenA = operandA.length,
            lenB = operandB.length,
            resArr = makeZeroArray(operandB.length),
            chunkBase = NUM_CHUNK_SIZE,
            msdDivisor = operandB[lenB - 1],
            lambdaFactor = Math.ceil(chunkBase / (2 * msdDivisor)),
            remArr = productCompact(operandA, lambdaFactor),
            divArr = productCompact(operandB, lambdaFactor),
            qDigit,
            shiftPos,
            carryVal,
            borrowVal,
            idx,
            loopLen,
            tempQ;

        if (remArr.length <= lenA) remArr.push(0);
        divArr.push(0);
        msdDivisor = divArr[lenB - 1];

        for (shiftPos = lenA - lenB; shiftPos >= 0; shiftPos--) {
            qDigit = chunkBase - 1;
            if (remArr[shiftPos + lenB] !== msdDivisor) {
                qDigit = Math.floor((remArr[shiftPos + lenB] * chunkBase + remArr[shiftPos + lenB - 1]) / msdDivisor);
            }

            carryVal = 0;
            borrowVal = 0;
            loopLen = divArr.length;
            for (idx = 0; idx < loopLen; idx++) {
                carryVal += qDigit * divArr[idx];
                tempQ = Math.floor(carryVal / chunkBase);
                borrowVal += remArr[shiftPos + idx] - (carryVal - tempQ * chunkBase);
                carryVal = tempQ;
                if (borrowVal < 0) {
                    remArr[shiftPos + idx] = borrowVal + chunkBase;
                    borrowVal = -1;
                } else {
                    remArr[shiftPos + idx] = borrowVal;
                    borrowVal = 0;
                }
            }

            while (borrowVal !== 0) {
                qDigit -= 1;
                carryVal = 0;
                for (idx = 0; idx < loopLen; idx++) {
                    carryVal += remArr[shiftPos + idx] - chunkBase + divArr[idx];
                    if (carryVal < 0) {
                        remArr[shiftPos + idx] = carryVal + chunkBase;
                        carryVal = 0;
                    } else {
                        remArr[shiftPos + idx] = carryVal;
                        carryVal = 1;
                    }
                }
                borrowVal += carryVal;
            }
            resArr[shiftPos] = qDigit;
        }
        remArr = divideAndModCompact(remArr, lambdaFactor)[0];
        return [chainToCompact(resArr), chainToCompact(remArr)];
    }

    /**
     * Divides two digit chain arrays using algorithm 2 (repeated subtraction).
     * @param {number[]} operandA - The dividend.
     * @param {number[]} operandB - The divisor.
     * @returns {[number[], number[]]} An array containing the quotient and remainder arrays.
     */
    function divideAndModAlgorithm2(operandA, operandB) {
        let lenA = operandA.length,
            lenB = operandB.length,
            resChain = [],
            partChain = [],
            chunkBase = NUM_CHUNK_SIZE,
            estimation,
            xLength,
            highX,
            highY,
            testProduct;

        while (lenA) {
            partChain.unshift(operandA[--lenA]);
            cleanUp(partChain);
            if (compareAbsolute(partChain, operandB) < 0) {
                resChain.push(0);
                continue;
            }
            xLength = partChain.length;
            highX = partChain[xLength - 1] * chunkBase + partChain[xLength - 2];
            highY = operandB[lenB - 1] * chunkBase + operandB[lenB - 2];
            if (xLength > lenB) {
                highX = (highX + 1) * chunkBase;
            }
            estimation = Math.ceil(highX / highY);
            do {
                testProduct = productCompact(operandB, estimation);
                if (compareAbsolute(testProduct, partChain) <= 0) break;
                estimation--;
            } while (estimation);
            resChain.push(estimation);
            partChain = diffChains(partChain, testProduct);
        }
        resChain.reverse();
        return [chainToCompact(resChain), chainToCompact(partChain)];
    }

    /**
     * Divides a digit chain array by a small integer.
     * @param {number[]} digitChain - The dividend array.
     * @param {number} lambdaFactor - The small integer divisor.
     * @returns {[number[], number]} An array containing the quotient array and the remainder.
     */
    function divideAndModCompact(digitChain, lambdaFactor) {
        let arrLen = digitChain.length,
            quotArr = makeZeroArray(arrLen),
            chunkBase = NUM_CHUNK_SIZE,
            index,
            tempQ,
            remVal,
            divVal;

        remVal = 0;
        for (index = arrLen - 1; index >= 0; --index) {
            divVal = remVal * chunkBase + digitChain[index];
            tempQ = floorOrCeil(divVal / lambdaFactor);
            remVal = divVal - tempQ * lambdaFactor;
            quotArr[index] = tempQ | 0;
        }
        return [quotArr, remVal | 0];
    }

    /**
     * Performs division and modulo operation for any two NumericValue instances.
     * @param {MultiDigit|SingleDigit} self - The dividend.
     * @param {*} inputVal - The divisor.
     * @returns {[MultiDigit|SingleDigit, MultiDigit|SingleDigit]} An array containing the quotient and remainder.
     */
    function divideAndModFlexible(self, inputVal) {
        let resultValue,
            numVal = interpretInput(inputVal);
        let operandA = self.digitChain,
            operandB = numVal.digitChain;
        let qResult;

        if (operandB === 0) throw new Error("Cannot divide by zero");

        if (self.isCompact) {
            if (numVal.isCompact) {
                return [new SingleDigit(floorOrCeil(operandA / operandB)), new SingleDigit(operandA % operandB)];
            }
            return [NumericValue.zeroConst, self];
        }

        if (numVal.isCompact) {
            if (operandB === 1) return [self, NumericValue.zeroConst];
            if (operandB === -1) return [self.invertSign(), NumericValue.zeroConst];
            let absoluteVal = Math.abs(operandB);
            if (absoluteVal < NUM_CHUNK_SIZE) {
                resultValue = divideAndModCompact(operandA, absoluteVal);
                qResult = chainToCompact(resultValue[0]);
                let remVal = resultValue[1];
                if (self.isNegative) remVal = -remVal;
                if (typeof qResult === "number") {
                    if (self.isNegative !== numVal.isNegative) qResult = -qResult;
                    return [new SingleDigit(qResult), new SingleDigit(remVal)];
                }
                return [new MultiDigit(qResult, self.isNegative !== numVal.isNegative), new SingleDigit(remVal)];
            }
            operandB = compactToChain(absoluteVal);
        }

        let comparison = compareAbsolute(operandA, operandB);
        if (comparison === -1) return [NumericValue.zeroConst, self];
        if (comparison === 0) return [NumericValue[self.isNegative === numVal.isNegative ? 1 : -1], NumericValue.zeroConst];

        if (operandA.length + operandB.length <= 200) resultValue = divideAndModAlgorithm1(operandA, operandB);
        else resultValue = divideAndModAlgorithm2(operandA, operandB);

        qResult = resultValue[0];
        let qSign = self.isNegative !== numVal.isNegative,
            mResult = resultValue[1],
            mSign = self.isNegative;

        if (typeof qResult === "number") {
            if (qSign) qResult = -qResult;
            qResult = new SingleDigit(qResult);
        } else qResult = new MultiDigit(qResult, qSign);

        if (typeof mResult === "number") {
            if (mSign) mResult = -mResult;
            mResult = new SingleDigit(mResult);
        } else mResult = new MultiDigit(mResult, mSign);

        return [qResult, mResult];
    }

    MultiDigit.proto.divisionRemainder = function (inputVal) {
        let result = divideAndModFlexible(this, inputVal);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    SingleDigit.proto.divisionRemainder = MultiDigit.proto.divisionRemainder;

    MultiDigit.proto.getQuotient = function (inputVal) {
        return divideAndModFlexible(this, inputVal)[0];
    };
    SingleDigit.proto.over = SingleDigit.proto.getQuotient = MultiDigit.proto.over = MultiDigit.proto.getQuotient;

    MultiDigit.proto.getRemainder = function (inputVal) {
        return divideAndModFlexible(this, inputVal)[1];
    };
    SingleDigit.proto.remainder = SingleDigit.proto.getRemainder = MultiDigit.proto.remainder = MultiDigit.proto.getRemainder;

    MultiDigit.proto.powerOf = function (inputVal) {
        let numVal = interpretInput(inputVal),
            operandA = this.digitChain,
            operandB = numVal.digitChain,
            resultValue,
            opX,
            opY;

        if (operandB === 0) return NumericValue.oneConst;
        if (operandA === 0) return NumericValue.zeroConst;
        if (operandA === 1) return NumericValue.oneConst;
        if (operandA === -1) return numVal.isEvenNumber() ? NumericValue.oneConst : NumericValue.minusOneConst;
        if (numVal.isNegative) {
            return NumericValue.zeroConst;
        }
        if (!numVal.isCompact) throw new Error("The exponent " + numVal.toText() + " is too large.");
        if (this.isCompact) {
            if (canFitInNative(resultValue = Math.pow(operandA, operandB)))
                return new SingleDigit(floorOrCeil(resultValue));
        }

        opX = this;
        opY = NumericValue.oneConst;
        while (true) {
            if ((operandB & 1) === 1) {
                opY = opY.times(opX);
                --operandB;
            }
            if (operandB === 0) break;
            operandB /= 2;
            opX = opX.square();
        }
        return opY;
    };
    SingleDigit.proto.powerOf = MultiDigit.proto.powerOf;

    MultiDigit.proto.modularPower = function (exponent, modulus) {
        exponent = interpretInput(exponent);
        modulus = interpretInput(modulus);
        if (modulus.isZeroValue()) throw new Error("Cannot take modPow with modulus 0");

        let runningResult = NumericValue.oneConst,
            baseNum = this.getRemainder(modulus);
        while (exponent.isPositiveNumber()) {
            if (baseNum.isZeroValue()) return NumericValue.zeroConst;
            if (exponent.isOddNumber()) runningResult = runningResult.multiply(baseNum).getRemainder(modulus);
            exponent = exponent.getQuotient(2);
            baseNum = baseNum.square().getRemainder(modulus);
        }
        return runningResult;
    };
    SingleDigit.proto.modularPower = MultiDigit.proto.modularPower;

    /**
     * Compares the absolute values of two digit chain arrays.
     * @param {number[]} operandA - First array.
     * @param {number[]} operandB - Second array.
     * @returns {number} -1 if A < B, 0 if A == B, 1 if A > B.
     */
    function compareAbsolute(operandA, operandB) {
        if (operandA.length !== operandB.length) {
            return operandA.length > operandB.length ? 1 : -1;
        }
        for (let index = operandA.length - 1; index >= 0; index--) {
            if (operandA[index] !== operandB[index]) return operandA[index] > operandB[index] ? 1 : -1;
        }
        return 0;
    }

    MultiDigit.proto.compareAbsolute = function (inputVal) {
        let numVal = interpretInput(inputVal),
            operandA = this.digitChain,
            operandB = numVal.digitChain;
        if (numVal.isCompact) return 1; // MultiDigit is always greater than SingleDigit absolutely (if not zero)
        return compareAbsolute(operandA, operandB);
    };
    SingleDigit.proto.compareAbsolute = function (inputVal) {
        let numVal = interpretInput(inputVal),
            nativeValA = Math.abs(this.digitChain),
            operandB = numVal.digitChain;
        if (numVal.isCompact) {
            operandB = Math.abs(operandB);
            return nativeValA === operandB ? 0 : nativeValA > operandB ? 1 : -1;
        }
        return -1; // SingleDigit is always lesser than MultiDigit absolutely
    };

    MultiDigit.proto.compareTo = function (inputVal) {
        if (inputVal === Infinity) {
            return -1;
        }
        if (inputVal === -Infinity) {
            return 1;
        }
        let numVal = interpretInput(inputVal),
            operandA = this.digitChain,
            operandB = numVal.digitChain;

        if (this.isNegative !== numVal.isNegative) {
            return numVal.isNegative ? 1 : -1; // Different signs
        }
        if (numVal.isCompact) {
            return this.isNegative ? -1 : 1; // MultiDigit vs SingleDigit with same sign
        }
        // Same sign, both MultiDigit
        return compareAbsolute(operandA, operandB) * (this.isNegative ? -1 : 1);
    };
    MultiDigit.proto.compareTo = MultiDigit.proto.compareTo;

    SingleDigit.proto.compareTo = function (inputVal) {
        if (inputVal === Infinity) {
            return -1;
        }
        if (inputVal === -Infinity) {
            return 1;
        }
        let numVal = interpretInput(inputVal),
            nativeValA = this.digitChain,
            nativeValB = numVal.digitChain;

        if (numVal.isCompact) {
            return nativeValA === nativeValB ? 0 : nativeValA > nativeValB ? 1 : -1;
        }
        if (nativeValA < 0 !== numVal.isNegative) {
            return nativeValA < 0 ? -1 : 1; // Different signs
        }
        // Same sign, SingleDigit vs MultiDigit
        return nativeValA < 0 ? 1 : -1; // If negative, SingleDigit is larger (more negative)
    };
    SingleDigit.proto.compareTo = SingleDigit.proto.compareTo;

    MultiDigit.proto.isEqualTo = function (inputVal) {
        return this.compareTo(inputVal) === 0;
    };
    SingleDigit.proto.eq = SingleDigit.proto.isEqualTo = MultiDigit.proto.eq = MultiDigit.proto.isEqualTo;

    MultiDigit.proto.isNotEqualTo = function (inputVal) {
        return this.compareTo(inputVal) !== 0;
    };
    SingleDigit.proto.neq = SingleDigit.proto.isNotEqualTo = MultiDigit.proto.neq = MultiDigit.proto.isNotEqualTo;

    MultiDigit.proto.isGreaterThan = function (inputVal) {
        return this.compareTo(inputVal) > 0;
    };
    SingleDigit.proto.gt = SingleDigit.proto.isGreaterThan = MultiDigit.proto.gt = MultiDigit.proto.isGreaterThan;

    MultiDigit.proto.isLesserThan = function (inputVal) {
        return this.compareTo(inputVal) < 0;
    };
    SingleDigit.proto.lt = SingleDigit.proto.isLesserThan = MultiDigit.proto.lt = MultiDigit.proto.isLesserThan;

    MultiDigit.proto.isGreaterOrEqualTo = function (inputVal) {
        return this.compareTo(inputVal) >= 0;
    };
    SingleDigit.proto.geq = SingleDigit.proto.isGreaterOrEqualTo = MultiDigit.proto.geq = MultiDigit.proto.isGreaterOrEqualTo;

    MultiDigit.proto.isLesserOrEqualTo = function (inputVal) {
        return this.compareTo(inputVal) <= 0;
    };
    SingleDigit.proto.leq = SingleDigit.proto.isLesserOrEqualTo = MultiDigit.proto.leq = MultiDigit.proto.isLesserOrEqualTo;

    MultiDigit.proto.isEvenNumber = function () {
        return (this.digitChain[0] & 1) === 0;
    };
    SingleDigit.proto.isEvenNumber = function () {
        return (this.digitChain & 1) === 0;
    };

    MultiDigit.proto.isOddNumber = function () {
        return (this.digitChain[0] & 1) === 1;
    };
    SingleDigit.proto.isOddNumber = function () {
        return (this.digitChain & 1) === 1;
    };

    MultiDigit.proto.isPositiveNumber = function () {
        return !this.isNegative;
    };
    SingleDigit.proto.isPositiveNumber = function () {
        return this.digitChain > 0;
    };

    MultiDigit.proto.isNegativeNumber = function () {
        return this.isNegative;
    };
    SingleDigit.proto.isNegativeNumber = function () {
        return this.digitChain < 0;
    };

    MultiDigit.proto.isOneOrMinusOne = function () {
        return false;
    };
    SingleDigit.proto.isOneOrMinusOne = function () {
        return Math.abs(this.digitChain) === 1;
    };

    MultiDigit.proto.isZeroValue = function () {
        return false;
    };
    SingleDigit.proto.isZeroValue = function () {
        return this.digitChain === 0;
    };

    MultiDigit.proto.isDivisibleByOther = function (inputVal) {
        let numVal = interpretInput(inputVal);
        let otherValue = numVal.digitChain;
        if (otherValue === 0) return false;
        if (otherValue === 1) return true;
        if (otherValue === 2) return this.isEvenNumber();
        return this.getRemainder(numVal).isEqualTo(NumericValue.zeroConst);
    };
    SingleDigit.proto.isDivisibleByOther = MultiDigit.proto.isDivisibleByOther;

    /**
     * Checks if a small number is a basic prime (2, 3, 5) or easily determined composite.
     * @param {MultiDigit|SingleDigit} numVal - The number to check.
     * @returns {boolean|undefined} True/False if determined, undefined otherwise.
     */
    function isSimplePrime(numVal) {
        let absoluteVal = numVal.absoluteValue();
        if (absoluteVal.isOneOrMinusOne()) return false;
        if (absoluteVal.isEqualTo(2) || absoluteVal.isEqualTo(3) || absoluteVal.isEqualTo(5)) return true;
        if (absoluteVal.isEvenNumber() || absoluteVal.isDivisibleByOther(3) || absoluteVal.isDivisibleByOther(5))
            return false;
        if (absoluteVal.isLesserThan(25)) return true;
    }

    MultiDigit.proto.isTrulyPrime = function () {
        let primeStatus = isSimplePrime(this);
        if (primeStatus !== undefined) return primeStatus;

        let absoluteVal = this.absoluteValue(),
            prevVal = absoluteVal.decrementValue();
        let testPrimes = [2, 3, 5, 7, 11, 13, 17, 19],
            tempB = prevVal,
            gcdDivisor,
            truthFlag,
            index,
            opX;

        while (tempB.isEvenNumber()) tempB = tempB.getQuotient(2);

        for (index = 0; index < testPrimes.length; index++) {
            opX = largeNum(testPrimes[index]).modularPower(tempB, absoluteVal);
            if (opX.isEqualTo(NumericValue.oneConst) || opX.isEqualTo(prevVal)) continue;

            for (truthFlag = true, gcdDivisor = tempB; truthFlag && gcdDivisor.isLesserThan(prevVal); gcdDivisor = gcdDivisor.multiply(2)) {
                opX = opX.square().getRemainder(absoluteVal);
                if (opX.isEqualTo(prevVal)) truthFlag = false;
            }
            if (truthFlag) return false;
        }
        return true;
    };
    SingleDigit.proto.isTrulyPrime = MultiDigit.proto.isTrulyPrime;

    MultiDigit.proto.isLikelyPrime = function (iterations) {
        let primeStatus = isSimplePrime(this);
        if (primeStatus !== undefined) return primeStatus;

        let absoluteVal = this.absoluteValue();
        let testCount = iterations === undefined ? 5 : iterations;
        for (let index = 0; index < testCount; index++) {
            let randomBase = largeNum.randomRange(2, absoluteVal.minus(2));
            if (!randomBase.modularPower(absoluteVal.decrementValue(), absoluteVal).isOneOrMinusOne()) return false;
        }
        return true;
    };
    SingleDigit.proto.isLikelyPrime = MultiDigit.proto.isLikelyPrime;

    MultiDigit.proto.modularInverse = function (modulus) {
        let termT = largeNum.zeroConst,
            newTermT = largeNum.oneConst,
            remR = interpretInput(modulus),
            newRemR = this.absoluteValue(),
            quotientVal,
            prevTermT,
            prevRemR;

        while (!newRemR.isEqualTo(largeNum.zeroConst)) {
            quotientVal = remR.getQuotient(newRemR);
            prevTermT = termT;
            prevRemR = remR;
            termT = newTermT;
            remR = newRemR;
            newTermT = prevTermT.subtract(quotientVal.multiply(newTermT));
            newRemR = prevRemR.subtract(quotientVal.multiply(newRemR));
        }
        if (!remR.isEqualTo(1)) throw new Error(this.toText() + " and " + modulus.toText() + " are not co-prime");
        if (termT.compareTo(0) === -1) {
            termT = termT.add(modulus);
        }
        if (this.isNegativeNumber()) {
            return termT.invertSign();
        }
        return termT;
    };
    SingleDigit.proto.modularInverse = MultiDigit.proto.modularInverse;

    MultiDigit.proto.incrementValue = function () {
        let digitChain = this.digitChain;
        if (this.isNegative) {
            return diffChainWithCompact(digitChain, 1, this.isNegative);
        }
        return new MultiDigit(sumChainWithCompact(digitChain, 1), this.isNegative);
    };
    SingleDigit.proto.incrementValue = function () {
        let digitChain = this.digitChain;
        if (digitChain + 1 < JS_SAFE_MAX) return new SingleDigit(digitChain + 1);
        return new MultiDigit(SAFE_MAX_ARRAY, false);
    };

    MultiDigit.proto.decrementValue = function () {
        let digitChain = this.digitChain;
        if (this.isNegative) {
            return new MultiDigit(sumChainWithCompact(digitChain, 1), true);
        }
        return diffChainWithCompact(digitChain, 1, this.isNegative);
    };
    SingleDigit.proto.decrementValue = function () {
        let digitChain = this.digitChain;
        if (digitChain - 1 > -JS_SAFE_MAX) return new SingleDigit(digitChain - 1);
        return new MultiDigit(SAFE_MAX_ARRAY, true);
    };

    let twoPowers = [1];
    while (2 * twoPowers[twoPowers.length - 1] <= NUM_CHUNK_SIZE)
        twoPowers.push(2 * twoPowers[twoPowers.length - 1]);
    let twoPowersCount = twoPowers.length,
        maxTwoPower = twoPowers[twoPowersCount - 1];

    /**
     * Checks if a shift amount is small enough to be handled directly.
     * @param {*} shiftAmount - The shift amount.
     * @returns {boolean} True if small, false otherwise.
     */
    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= NUM_CHUNK_SIZE || shiftAmount instanceof MultiDigit && shiftAmount.digitChain.length <= 1;
    }

    MultiDigit.proto.shiftDigitsLeft = function (shiftAmount) {
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        shiftAmount = +shiftAmount;
        if (shiftAmount < 0) return this.shiftDigitsRight(-shiftAmount);

        let result = this;
        if (result.isZeroValue()) return result;

        while (shiftAmount >= twoPowersCount) {
            result = result.multiply(maxTwoPower);
            shiftAmount -= twoPowersCount - 1;
        }
        return result.multiply(twoPowers[shiftAmount]);
    };
    SingleDigit.proto.shiftDigitsLeft = MultiDigit.proto.shiftDigitsLeft;

    MultiDigit.proto.shiftDigitsRight = function (shiftAmount) {
        let remQuo;
        if (!isShiftAmountCompact(shiftAmount)) {
            throw new Error(String(shiftAmount) + " is too large for shifting.");
        }
        shiftAmount = +shiftAmount;
        if (shiftAmount < 0) return this.shiftDigitsLeft(-shiftAmount);

        let result = this;
        while (shiftAmount >= twoPowersCount) {
            if (result.isZeroValue() || result.isNegativeNumber() && result.isOneOrMinusOne()) return result;
            remQuo = divideAndModFlexible(result, maxTwoPower);
            result = remQuo[1].isNegativeNumber() ? remQuo[0].decrementValue() : remQuo[0];
            shiftAmount -= twoPowersCount - 1;
        }
        remQuo = divideAndModFlexible(result, twoPowers[shiftAmount]);
        return remQuo[1].isNegativeNumber() ? remQuo[0].decrementValue() : remQuo[0];
    };
    SingleDigit.proto.shiftDigitsRight = MultiDigit.proto.shiftDigitsRight;

    /**
     * Performs a bitwise operation on two NumericValue instances.
     * @param {MultiDigit|SingleDigit} opX - First operand.
     * @param {MultiDigit|SingleDigit} opY - Second operand.
     * @param {function(number, number): number} operationFn - The bitwise function (e.g., `(a, b) => a & b`).
     * @returns {MultiDigit|SingleDigit} The result of the bitwise operation.
     */
    function performBitwiseOp(opX, opY, operationFn) {
        opY = interpretInput(opY);

        let signX = opX.isNegativeNumber(),
            signY = opY.isNegativeNumber();
        let remainingX = signX ? opX.bitwiseNot() : opX,
            remainingY = signY ? opY.bitwiseNot() : opY;

        let digitX = 0,
            digitY = 0;
        let divModX = null,
            divModY = null;
        let resultChain = [];

        while (!remainingX.isZeroValue() || !remainingY.isZeroValue()) {
            divModX = divideAndModFlexible(remainingX, maxTwoPower);
            digitX = divModX[1].toJavascriptNumber();
            if (signX) {
                digitX = maxTwoPower - 1 - digitX;
            }

            divModY = divideAndModFlexible(remainingY, maxTwoPower);
            digitY = divModY[1].toJavascriptNumber();
            if (signY) {
                digitY = maxTwoPower - 1 - digitY;
            }

            remainingX = divModX[0];
            remainingY = divModY[0];
            resultChain.push(operationFn(digitX, digitY));
        }

        let finalSum = operationFn(signX ? 1 : 0, signY ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
        for (let index = resultChain.length - 1; index >= 0; index -= 1) {
            finalSum = finalSum.multiply(maxTwoPower).add(largeNum(resultChain[index]));
        }
        return finalSum;
    }

    MultiDigit.proto.bitwiseNot = function () {
        return this.invertSign().decrementValue();
    };
    SingleDigit.proto.bitwiseNot = MultiDigit.proto.bitwiseNot;

    MultiDigit.proto.bitwiseAnd = function (numVal) {
        return performBitwiseOp(this, numVal, function (a, b) {
            return a & b;
        });
    };
    SingleDigit.proto.bitwiseAnd = MultiDigit.proto.bitwiseAnd;

    MultiDigit.proto.bitwiseOr = function (numVal) {
        return performBitwiseOp(this, numVal, function (a, b) {
            return a | b;
        });
    };
    SingleDigit.proto.bitwiseOr = MultiDigit.proto.bitwiseOr;

    MultiDigit.proto.bitwiseXor = function (numVal) {
        return performBitwiseOp(this, numVal, function (a, b) {
            return a ^ b;
        });
    };
    SingleDigit.proto.bitwiseXor = MultiDigit.proto.bitwiseXor;

    const LOW_BIT_MASK_INT = 1 << 30,
        LOW_BIT_MASK_BIGINT = (NUM_CHUNK_SIZE & -NUM_CHUNK_SIZE) * (NUM_CHUNK_SIZE & -NUM_CHUNK_SIZE) | LOW_BIT_MASK_INT;

    /**
     * Estimates the lowest set bit using a mask.
     * @param {MultiDigit|SingleDigit} numVal - The number.
     * @returns {number} An approximation of the lowest set bit.
     */
    function approximateLowBit(numVal) {
        let internalVal = numVal.digitChain,
            maskedVal = typeof internalVal === "number" ? internalVal | LOW_BIT_MASK_INT : internalVal[0] + internalVal[1] * NUM_CHUNK_SIZE | LOW_BIT_MASK_BIGINT;
        return maskedVal & -maskedVal;
    }

    /**
     * Calculates the integer logarithm of a value to a given base.
     * @param {MultiDigit|SingleDigit} inputVal - The value.
     * @param {MultiDigit|SingleDigit} baseVal - The base.
     * @returns {{p: MultiDigit|SingleDigit, e: number}} The product (p) and exponent (e).
     */
    function logarithmInteger(inputVal, baseVal) {
        if (baseVal.compareTo(inputVal) <= 0) {
            let tempResult = logarithmInteger(inputVal, baseVal.square(baseVal));
            let product = tempResult.p;
            let exponent = tempResult.e;
            let testProduct = product.multiply(baseVal);
            return testProduct.compareTo(inputVal) <= 0 ? {
                p: testProduct,
                e: exponent * 2 + 1
            } : {
                p: product,
                e: exponent * 2
            };
        }
        return {
            p: largeNum(1),
            e: 0
        };
    }

    MultiDigit.proto.lengthInBits = function () {
        let numVal = this;
        if (numVal.compareTo(largeNum(0)) < 0) {
            numVal = numVal.invertSign().subtract(largeNum(1));
        }
        if (numVal.compareTo(largeNum(0)) === 0) {
            return largeNum(0);
        }
        return largeNum(logarithmInteger(numVal, largeNum(2)).e).add(largeNum(1));
    };
    SingleDigit.proto.lengthInBits = MultiDigit.proto.lengthInBits;

    /**
     * Finds the maximum of two NumericValue instances.
     * @param {*} valA - First value.
     * @param {*} valB - Second value.
     * @returns {MultiDigit|SingleDigit} The maximum value.
     */
    function findMaximum(valA, valB) {
        valA = interpretInput(valA);
        valB = interpretInput(valB);
        return valA.isGreaterThan(valB) ? valA : valB;
    }

    /**
     * Finds the minimum of two NumericValue instances.
     * @param {*} valA - First value.
     * @param {*} valB - Second value.
     * @returns {MultiDigit|SingleDigit} The minimum value.
     */
    function findMinimum(valA, valB) {
        valA = interpretInput(valA);
        valB = interpretInput(valB);
        return valA.isLesserThan(valB) ? valA : valB;
    }

    /**
     * Calculates the greatest common divisor (GCD) of two NumericValue instances.
     * @param {*} valA - First value.
     * @param {*} valB - Second value.
     * @returns {MultiDigit|SingleDigit} The GCD.
     */
    function greatestCommonDivisor(valA, valB) {
        valA = interpretInput(valA).absoluteValue();
        valB = interpretInput(valB).absoluteValue();
        if (valA.isEqualTo(valB)) return valA;
        if (valA.isZeroValue()) return valB;
        if (valB.isZeroValue()) return valA;

        let commonFactor = NumericValue.oneConst,
            gcdDivisor,
            tempVar;

        while (valA.isEvenNumber() && valB.isEvenNumber()) {
            gcdDivisor = Math.min(approximateLowBit(valA), approximateLowBit(valB));
            valA = valA.getQuotient(gcdDivisor);
            valB = valB.getQuotient(gcdDivisor);
            commonFactor = commonFactor.multiply(gcdDivisor);
        }
        while (valA.isEvenNumber()) {
            valA = valA.getQuotient(approximateLowBit(valA));
        }
        do {
            while (valB.isEvenNumber()) {
                valB = valB.getQuotient(approximateLowBit(valB));
            }
            if (valA.isGreaterThan(valB)) {
                tempVar = valB;
                valB = valA;
                valA = tempVar;
            }
            valB = valB.subtract(valA);
        } while (!valB.isZeroValue());
        return commonFactor.isOneOrMinusOne() ? valA : valA.multiply(commonFactor);
    }

    /**
     * Calculates the least common multiple (LCM) of two NumericValue instances.
     * @param {*} valA - First value.
     * @param {*} valB - Second value.
     * @returns {MultiDigit|SingleDigit} The LCM.
     */
    function leastCommonMultiple(valA, valB) {
        valA = interpretInput(valA).absoluteValue();
        valB = interpretInput(valB).absoluteValue();
        return valA.getQuotient(greatestCommonDivisor(valA, valB)).multiply(valB);
    }

    /**
     * Generates a random NumericValue between a lower and upper bound (inclusive).
     * @param {*} lowerBound - The lower bound.
     * @param {*} upperBound - The upper bound.
     * @returns {MultiDigit|SingleDigit} The random number.
     */
    function randomBetween(lowerBound, upperBound) {
        lowerBound = interpretInput(lowerBound);
        upperBound = interpretInput(upperBound);
        let lower = findMinimum(lowerBound, upperBound),
            upper = findMaximum(lowerBound, upperBound);
        let valueRange = upper.subtract(lower).add(1);

        if (valueRange.isCompact) return lower.add(Math.floor(Math.random() * valueRange.digitChain));

        let chainLength = valueRange.digitChain.length - 1;
        let randChain = [],
            isRestricted = true;

        for (let index = chainLength; index >= 0; index--) {
            let topDigit = isRestricted ? valueRange.digitChain[index] : NUM_CHUNK_SIZE;
            let currentDigit = floorOrCeil(Math.random() * topDigit);
            randChain.unshift(currentDigit);
            if (currentDigit < topDigit) isRestricted = false;
        }
        randChain = chainToCompact(randChain);
        return lower.add(typeof randChain === "number" ? new SingleDigit(randChain) : new MultiDigit(randChain, false));
    }

    /**
     * Parses a string representation of a number in a given base.
     * @param {string} inputText - The string to parse.
     * @param {number} baseVal - The base (radix).
     * @returns {MultiDigit|SingleDigit} The parsed number.
     */
    const parseFromBaseString = function (inputText, baseVal) {
        let inputLength = inputText.length;
        let charIndex;
        let absoluteBase = Math.abs(baseVal);

        for (charIndex = 0; charIndex < inputLength; charIndex++) {
            let currentChar = inputText[charIndex].toLowerCase();
            if (currentChar === "-") continue;
            if (/[a-z0-9]/.test(currentChar)) {
                if (/[0-9]/.test(currentChar) && +currentChar >= absoluteBase) {
                    if (currentChar === "1" && absoluteBase === 1) continue;
                    throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
                } else if (currentChar.charCodeAt(0) - 87 >= absoluteBase) {
                    throw new Error(currentChar + " is not a valid digit in base " + baseVal + ".");
                }
            }
        }

        if (2 <= baseVal && baseVal <= 36) {
            if (inputLength <= LOG_JS_SAFE_MAX / Math.log(baseVal)) {
                let result = parseInt(inputText, baseVal);
                if (isNaN(result)) {
                    throw new Error("Invalid digit in base " + baseVal + ".");
                }
                return new SingleDigit(parseInt(inputText, baseVal));
            }
        }

        baseVal = interpretInput(baseVal);
        let digitList = [];
        let isNegativeSign = inputText[0] === "-";
        for (charIndex = isNegativeSign ? 1 : 0; charIndex < inputText.length; charIndex++) {
            let currentChar = inputText[charIndex].toLowerCase(),
                charNumericCode = currentChar.charCodeAt(0);
            if (48 <= charNumericCode && charNumericCode <= 57) digitList.push(interpretInput(currentChar));
            else if (97 <= charNumericCode && charNumericCode <= 122) digitList.push(interpretInput(currentChar.charCodeAt(0) - 87));
            else if (currentChar === "<") {
                let startIndex = charIndex;
                do {
                    charIndex++;
                } while (inputText[charIndex] !== ">");
                digitList.push(interpretInput(inputText.slice(startIndex + 1, charIndex)));
            } else throw new Error(currentChar + " is not a valid character");
        }
        return parseFromBaseChain(digitList, baseVal, isNegativeSign);
    };

    /**
     * Parses a number from a chain of digits in a given base.
     * @param {NumericValue[]} digitList - An array of NumericValue digits.
     * @param {NumericValue} baseVal - The base.
     * @param {boolean} isNegative - Whether the number is negative.
     * @returns {MultiDigit|SingleDigit} The parsed number.
     */
    function parseFromBaseChain(digitList, baseVal, isNegative) {
        let currentValue = NumericValue.zeroConst,
            currentPower = NumericValue.oneConst,
            index;
        for (index = digitList.length - 1; index >= 0; index--) {
            currentValue = currentValue.add(digitList[index].times(currentPower));
            currentPower = currentPower.times(baseVal);
        }
        return isNegative ? currentValue.invertSign() : currentValue;
    }

    /**
     * Converts a single digit to its string representation (0-9, a-z, or <digit>).
     * @param {number} digit - The digit to convert.
     * @returns {string} The string representation.
     */
    function digitToString(digit) {
        if (digit <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digit);
        }
        return "<" + digit + ">";
    }

    /**
     * Converts a NumericValue to an array of digits in a specified base.
     * @param {MultiDigit|SingleDigit} numVal - The number to convert.
     * @param {MultiDigit|SingleDigit} baseVal - The target base.
     * @returns {{value: number[], isNegative: boolean}} An object containing the digit array and sign.
     */
    function convertToBase(numVal, baseVal) {
        baseVal = largeNum(baseVal);
        if (baseVal.isZeroValue()) {
            if (numVal.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (baseVal.isEqualTo(-1)) {
            if (numVal.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            if (numVal.isNegativeNumber())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-numVal)).map(Array.prototype.valueOf, [1, 0])),
                    isNegative: false
                };
            let arr = Array.apply(null, Array(+numVal - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        let isNegativeResult = false;
        if (numVal.isNegativeNumber() && baseVal.isPositiveNumber()) {
            isNegativeResult = true;
            numVal = numVal.absoluteValue();
        }

        if (baseVal.isEqualTo(1)) {
            if (numVal.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            return {
                value: Array.apply(null, Array(+numVal)).map(Number.prototype.valueOf, 1),
                isNegative: isNegativeResult
            };
        }

        let outputChain = [];
        let remainingVal = numVal,
            divModResult;
        while (remainingVal.isNegativeNumber() || remainingVal.compareAbsolute(baseVal) >= 0) {
            divModResult = remainingVal.divisionRemainder(baseVal);
            remainingVal = divModResult.quotient;
            let digit = divModResult.remainder;
            if (digit.isNegativeNumber()) {
                digit = baseVal.minus(digit).absoluteValue();
                remainingVal = remainingVal.incrementValue();
            }
            outputChain.push(digit.toJavascriptNumber());
        }
        outputChain.push(remainingVal.toJavascriptNumber());
        return {
            value: outputChain.reverse(),
            isNegative: isNegativeResult
        };
    }

    /**
     * Converts a NumericValue to its string representation in a given base.
     * @param {MultiDigit|SingleDigit} numVal - The number to convert.
     * @param {MultiDigit|SingleDigit} baseVal - The target base.
     * @returns {string} The string representation.
     */
    function toBaseStringRepresentation(numVal, baseVal) {
        let arr = convertToBase(numVal, baseVal);
        return (arr.isNegative ? "-" : "") + arr.value.map(digitToString).join("");
    }

    MultiDigit.proto.toDigitArray = function (radix) {
        return convertToBase(this, radix);
    };
    SingleDigit.proto.toDigitArray = function (radix) {
        return convertToBase(this, radix);
    };

    MultiDigit.proto.toText = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseStringRepresentation(this, radix);

        let internalVal = this.digitChain,
            len = internalVal.length,
            outputString = String(internalVal[--len]),
            zeroPadding = "0000000",
            currentDigitText;

        while (--len >= 0) {
            currentDigitText = String(internalVal[len]);
            outputString += zeroPadding.slice(currentDigitText.length) + currentDigitText;
        }
        let isNegativeSign = this.isNegative ? "-" : "";
        return isNegativeSign + outputString;
    };
    SingleDigit.proto.toText = function (radix) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseStringRepresentation(this, radix);
        return String(this.digitChain);
    };

    MultiDigit.proto.toJsonString = SingleDigit.proto.toJsonString = function () {
        return this.toText();
    };

    MultiDigit.proto.toNativeValue = function () {
        return parseInt(this.toText(), 10);
    };
    MultiDigit.proto.toJavascriptNumber = MultiDigit.proto.toNativeValue;

    SingleDigit.proto.toNativeValue = function () {
        return this.digitChain;
    };
    SingleDigit.proto.toJavascriptNumber = SingleDigit.proto.toNativeValue;

    /**
     * Parses a string value into a NumericValue.
     * @param {string} inputString - The string to parse.
     * @returns {MultiDigit|SingleDigit} The parsed number.
     */
    function parseStringAsNumber(inputString) {
        if (canFitInNative(+inputString)) {
            let num = +inputString;
            if (num === floorOrCeil(num)) return new SingleDigit(num);
            throw new Error("Invalid integer: " + inputString);
        }

        let isNegativeSign = inputString[0] === "-";
        if (isNegativeSign) inputString = inputString.slice(1);

        let parts = inputString.split(/e/i);
        if (parts.length > 2) throw new Error("Invalid integer: " + parts.join("e"));
        if (parts.length === 2) {
            let exponentVal = parts[1];
            if (exponentVal[0] === "+") exponentVal = exponentVal.slice(1);
            exponentVal = +exponentVal;
            if (exponentVal !== floorOrCeil(exponentVal) || !canFitInNative(exponentVal))
                throw new Error("Invalid integer: " + exponentVal + " is not a valid exponent.");

            let text = parts[0];
            let dotPosition = text.indexOf(".");
            if (dotPosition >= 0) {
                exponentVal -= text.length - dotPosition - 1;
                text = text.slice(0, dotPosition) + text.slice(dotPosition + 1);
            }
            if (exponentVal < 0) throw new Error("Cannot include negative exponent part for integers");
            text += new Array(exponentVal + 1).join("0");
            inputString = text;
        }

        let isFormatValid = /^([0-9][0-9]*)$/.test(inputString);
        if (!isFormatValid) throw new Error("Invalid integer: " + inputString);

        let resultChain = [],
            maxLength = inputString.length,
            chunkSize = CHUNK_DIGITS_COUNT,
            minLength = maxLength - chunkSize;

        while (maxLength > 0) {
            resultChain.push(+inputString.slice(minLength, maxLength));
            minLength -= chunkSize;
            if (minLength < 0) minLength = 0;
            maxLength -= chunkSize;
        }
        cleanUp(resultChain);
        return new MultiDigit(resultChain, isNegativeSign);
    }

    /**
     * Parses a native number into a NumericValue.
     * @param {number} inputNumber - The number to parse.
     * @returns {MultiDigit|SingleDigit} The parsed number.
     */
    function parseNumberAsNumber(inputNumber) {
        if (canFitInNative(inputNumber)) {
            if (inputNumber !== floorOrCeil(inputNumber)) throw new Error(inputNumber + " is not an integer.");
            return new SingleDigit(inputNumber);
        }
        return parseStringAsNumber(inputNumber.toString());
    }

    /**
     * Interprets an input value and converts it into a NumericValue instance.
     * @param {*} inputVal - The value to interpret.
     * @returns {MultiDigit|SingleDigit} The NumericValue instance.
     */
    function interpretInput(inputVal) {
        if (typeof inputVal === "number") {
            return parseNumberAsNumber(inputVal);
        }
        if (typeof inputVal === "string") {
            return parseStringAsNumber(inputVal);
        }
        return inputVal;
    }

    // Cache small integers for performance
    for (let index = 0; index < 1_000; index++) {
        NumericValue[index] = new SingleDigit(index);
        if (index > 0) NumericValue[-index] = new SingleDigit(-index);
    }

    NumericValue.oneConst = NumericValue[1];
    NumericValue.zeroConst = NumericValue[0];
    NumericValue.minusOneConst = NumericValue[-1];

    NumericValue.maximum = findMaximum;
    NumericValue.minimum = findMinimum;
    NumericValue.commonDivisor = greatestCommonDivisor;
    NumericValue.commonMultiple = leastCommonMultiple;
    NumericValue.isInstance = function (x) {
        return x instanceof MultiDigit || x instanceof SingleDigit;
    };
    NumericValue.randomRange = randomBetween;
    NumericValue.fromChain = function (digitList, baseVal, isNegative) {
        return parseFromBaseChain(digitList.map(interpretInput), interpretInput(baseVal || 10), isNegative);
    };

    return NumericValue;
}();


const processInput = inputData => {
    inputData = inputData.trim().split("\n");

    const countEntries = parseInt(inputData[0]);
    const dataValues = inputData[1].split(" ").map(entry => parseInt(entry));

    const maxValue = Math.max(...dataValues);

    if (dataValues[0] !== 0) {
        console.log(0);
        return;
    }

    let finalResult = 1;
    let frequencyMap = {
        0: 1
    };

    for (let loopIndex = 1; loopIndex < countEntries; loopIndex++) {
        if (dataValues[loopIndex] === 0) {
            console.log(0);
            return;
        }

        if (frequencyMap[dataValues[loopIndex]]) {
            frequencyMap[dataValues[loopIndex]]++;
        } else {
            frequencyMap[dataValues[loopIndex]] = 1;
        }
    }

    for (let loopIndex = 1; loopIndex <= maxValue; loopIndex++) {
        if (frequencyMap[loopIndex - 1] === undefined || frequencyMap[loopIndex] === undefined) {
            console.log(0);
            return;
        }

        // The number of possible parents for current depth
        const possibleParents = frequencyMap[loopIndex - 1];

        const intermediateProduct = largeNum(possibleParents).powerOf(frequencyMap[loopIndex]);

        finalResult = largeNum(finalResult).multiply(intermediateProduct);
    }

    console.log(largeNum(finalResult).getRemainder(998244353).toText());
};

// Assuming `obtainFile` and `fileSystem` are equivalent to `require('fs')`
const obtainFile = require('fs');
processInput(obtainFile.readFileSync('/dev/stdin', 'utf8'));