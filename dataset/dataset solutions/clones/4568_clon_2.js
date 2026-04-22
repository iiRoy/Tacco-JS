"use strict";

let largeNum = function(voidVal) {
    var CHUNK_SIZE = 1e7;
    var CHUNK_DIGITS = 7;
    var MAX_SAFE_NUM = 9007199254740992;
    var MAX_SAFE_ARR = compactToSegmentArray(MAX_SAFE_NUM);
    var MAX_SAFE_LOG = Math.log(MAX_SAFE_NUM);

    function NumericEntity(valInput, baseInput) {
        if (typeof valInput === "undefined")
            return NumericEntity[0];
        if (typeof baseInput !== "undefined")
            return +baseInput === 10 ? interpretStringValue(valInput) : parseStringWithBase(valInput, baseInput);
        return interpretStringValue(valInput);
    }

    function LargeNumericEntity(segmentList, negativeMark) {
        this.dataSegments = segmentList;
        this.negativeMark = negativeMark;
        this.isCompactForm = false;
    }
    LargeNumericEntity.prototype = Object.create(NumericEntity.prototype);

    function CompactNumericEntity(val) {
        this.dataSegments = val;
        this.negativeMark = val < 0;
        this.isCompactForm = true;
    }
    CompactNumericEntity.prototype = Object.create(NumericEntity.prototype);

    function isStandardRange(numVal) {
        return -MAX_SAFE_NUM < numVal && numVal < MAX_SAFE_NUM;
    }

    function compactToSegmentArray(numVal) {
        if (numVal < 1e7)
            return [numVal];
        if (numVal < 1e14)
            return [numVal % 1e7, Math.floor(numVal / 1e7)];
        return [numVal % 1e7, Math.floor(numVal / 1e7) % 1e7, Math.floor(numVal / 1e14)];
    }

    function segmentArrayToCompact(segmentList) {
        pruneLeadingZeros(segmentList);
        var segLength = segmentList.length;
        if (segLength < 4 && compareAbsoluteValues(segmentList, MAX_SAFE_ARR) < 0) {
            switch (segLength) {
                case 0:
                    return 0;
                case 1:
                    return segmentList[0];
                case 2:
                    return segmentList[0] + segmentList[1] * CHUNK_SIZE;
                default:
                    return segmentList[0] + (segmentList[1] + segmentList[2] * CHUNK_SIZE) * CHUNK_SIZE;
            }
        }
        return segmentList;
    }

    function pruneLeadingZeros(segmentList) {
        var segIdx = segmentList.length;
        while (segmentList[--segIdx] === 0);
        segmentList.length = segIdx + 1;
    }

    function initZeroArray(len) {
        var newArray = new Array(len);
        var currentIdx = -1;
        while (++currentIdx < len) {
            newArray[currentIdx] = 0;
        }
        return newArray;
    }

    function floorOrCeil(numVal) {
        if (numVal > 0)
            return Math.floor(numVal);
        return Math.ceil(numVal);
    }

    function performAddition(listA, listB) {
        var lenA = listA.length,
            lenB = listB.length,
            resultList = new Array(lenA),
            carryOver = 0,
            baseValue = CHUNK_SIZE,
            currentSum, segmentIndex;
        for (segmentIndex = 0; segmentIndex < lenB; segmentIndex++) {
            currentSum = listA[segmentIndex] + listB[segmentIndex] + carryOver;
            carryOver = currentSum >= baseValue ? 1 : 0;
            resultList[segmentIndex] = currentSum - carryOver * baseValue;
        }
        while (segmentIndex < lenA) {
            currentSum = listA[segmentIndex] + carryOver;
            carryOver = currentSum === baseValue ? 1 : 0;
            resultList[segmentIndex++] = currentSum - carryOver * baseValue;
        }
        if (carryOver > 0)
            resultList.push(carryOver);
        return resultList;
    }

    function flexibleAddition(listA, listB) {
        if (listA.length >= listB.length)
            return performAddition(listA, listB);
        return performAddition(listB, listA);
    }

    function addCompactValue(segmentList, scalarCarry) {
        var segLen = segmentList.length,
            resultList = new Array(segLen),
            baseValue = CHUNK_SIZE,
            currentSum, segmentIndex;
        for (segmentIndex = 0; segmentIndex < segLen; segmentIndex++) {
            currentSum = segmentList[segmentIndex] - baseValue + scalarCarry;
            scalarCarry = Math.floor(currentSum / baseValue);
            resultList[segmentIndex] = currentSum - scalarCarry * baseValue;
            scalarCarry += 1;
        }
        while (scalarCarry > 0) {
            resultList[segmentIndex++] = scalarCarry % baseValue;
            scalarCarry = Math.floor(scalarCarry / baseValue);
        }
        return resultList;
    }

    LargeNumericEntity.prototype.append = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal);
        if (this.negativeMark !== otherNum.negativeMark) {
            return this.deduct(otherNum.invertSign());
        }
        var currentSegments = this.dataSegments,
            otherSegments = otherNum.dataSegments;
        if (otherNum.isCompactForm) {
            return new LargeNumericEntity(addCompactValue(currentSegments, Math.abs(otherSegments)), this.negativeMark);
        }
        return new LargeNumericEntity(flexibleAddition(currentSegments, otherSegments), this.negativeMark);
    };
    LargeNumericEntity.prototype.sum = LargeNumericEntity.prototype.append;

    CompactNumericEntity.prototype.append = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal);
        var currentVal = this.dataSegments;
        if (currentVal < 0 !== otherNum.negativeMark) {
            return this.deduct(otherNum.invertSign());
        }
        var otherValData = otherNum.dataSegments;
        if (otherNum.isCompactForm) {
            if (isStandardRange(currentVal + otherValData))
                return new CompactNumericEntity(currentVal + otherValData);
            otherValData = compactToSegmentArray(Math.abs(otherValData));
        }
        return new LargeNumericEntity(addCompactValue(otherValData, Math.abs(currentVal)), currentVal < 0);
    };
    CompactNumericEntity.prototype.sum = CompactNumericEntity.prototype.append;

    function performSubtraction(listA, listB) {
        var lenA = listA.length,
            lenB = listB.length,
            resultList = new Array(lenA),
            borrowAmount = 0,
            baseValue = CHUNK_SIZE,
            segmentIndex, currentDifference;
        for (segmentIndex = 0; segmentIndex < lenB; segmentIndex++) {
            currentDifference = listA[segmentIndex] - borrowAmount - listB[segmentIndex];
            if (currentDifference < 0) {
                currentDifference += baseValue;
                borrowAmount = 1;
            } else
                borrowAmount = 0;
            resultList[segmentIndex] = currentDifference;
        }
        for (segmentIndex = lenB; segmentIndex < lenA; segmentIndex++) {
            currentDifference = listA[segmentIndex] - borrowAmount;
            if (currentDifference < 0)
                currentDifference += baseValue;
            else {
                resultList[segmentIndex++] = currentDifference;
                break;
            }
            resultList[segmentIndex] = currentDifference;
        }
        for (; segmentIndex < lenA; segmentIndex++) {
            resultList[segmentIndex] = listA[segmentIndex];
        }
        pruneLeadingZeros(resultList);
        return resultList;
    }

    function flexibleSubtraction(listA, listB, resultSign) {
        var finalValue;
        if (compareAbsoluteValues(listA, listB) >= 0) {
            finalValue = performSubtraction(listA, listB);
        } else {
            finalValue = performSubtraction(listB, listA);
            resultSign = !resultSign;
        }
        finalValue = segmentArrayToCompact(finalValue);
        if (typeof finalValue === "number") {
            if (resultSign)
                finalValue = -finalValue;
            return new CompactNumericEntity(finalValue);
        }
        return new LargeNumericEntity(finalValue, resultSign);
    }

    function subtractCompactValue(listA, scalarVal, resultSign) {
        var segLen = listA.length,
            resultList = new Array(segLen),
            carryAmount = -scalarVal,
            baseValue = CHUNK_SIZE,
            segmentIndex, currentDifference;
        for (segmentIndex = 0; segmentIndex < segLen; segmentIndex++) {
            currentDifference = listA[segmentIndex] + carryAmount;
            carryAmount = Math.floor(currentDifference / baseValue);
            currentDifference %= baseValue;
            resultList[segmentIndex] = currentDifference < 0 ? currentDifference + baseValue : currentDifference;
        }
        resultList = segmentArrayToCompact(resultList);
        if (typeof resultList === "number") {
            if (resultSign)
                resultList = -resultList;
            return new CompactNumericEntity(resultList);
        }
        return new LargeNumericEntity(resultList, resultSign);
    }

    LargeNumericEntity.prototype.deduct = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal);
        if (this.negativeMark !== otherNum.negativeMark) {
            return this.append(otherNum.invertSign());
        }
        var currentSegments = this.dataSegments,
            otherSegments = otherNum.dataSegments;
        if (otherNum.isCompactForm)
            return subtractCompactValue(currentSegments, Math.abs(otherSegments), this.negativeMark);
        return flexibleSubtraction(currentSegments, otherSegments, this.negativeMark);
    };
    LargeNumericEntity.prototype.difference = LargeNumericEntity.prototype.deduct;

    CompactNumericEntity.prototype.deduct = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal);
        var currentVal = this.dataSegments;
        if (currentVal < 0 !== otherNum.negativeMark) {
            return this.append(otherNum.invertSign());
        }
        var otherValData = otherNum.dataSegments;
        if (otherNum.isCompactForm) {
            return new CompactNumericEntity(currentVal - otherValData);
        }
        return subtractCompactValue(otherValData, Math.abs(currentVal), currentVal >= 0);
    };
    CompactNumericEntity.prototype.difference = CompactNumericEntity.prototype.deduct;

    LargeNumericEntity.prototype.invertSign = function() {
        return new LargeNumericEntity(this.dataSegments, !this.negativeMark);
    };
    CompactNumericEntity.prototype.invertSign = function() {
        var currentSign = this.negativeMark;
        var compactResult = new CompactNumericEntity(-this.dataSegments);
        compactResult.negativeMark = !currentSign;
        return compactResult;
    };

    LargeNumericEntity.prototype.absoluteValue = function() {
        return new LargeNumericEntity(this.dataSegments, false);
    };
    CompactNumericEntity.prototype.absoluteValue = function() {
        return new CompactNumericEntity(Math.abs(this.dataSegments));
    };

    function longMultiplication(listA, listB) {
        var lenA = listA.length,
            lenB = listB.length,
            resultList = initZeroArray(lenA + lenB),
            baseValue = CHUNK_SIZE,
            currentProduct, carryOver, segIdxA, valA, segIdxB, valB;
        for (segIdxA = 0; segIdxA < lenA; ++segIdxA) {
            valA = listA[segIdxA];
            for (segIdxB = 0; segIdxB < lenB; ++segIdxB) {
                valB = listB[segIdxB];
                currentProduct = valA * valB + resultList[segIdxA + segIdxB];
                carryOver = Math.floor(currentProduct / baseValue);
                resultList[segIdxA + segIdxB] = currentProduct - carryOver * baseValue;
                resultList[segIdxA + segIdxB + 1] += carryOver;
            }
        }
        pruneLeadingZeros(resultList);
        return resultList;
    }

    function smallMultiplication(segmentList, scalarVal) {
        var segLen = segmentList.length,
            resultList = new Array(segLen),
            baseValue = CHUNK_SIZE,
            carryOver = 0,
            currentProduct, segmentIndex;
        for (segmentIndex = 0; segmentIndex < segLen; segmentIndex++) {
            currentProduct = segmentList[segmentIndex] * scalarVal + carryOver;
            carryOver = Math.floor(currentProduct / baseValue);
            resultList[segmentIndex] = currentProduct - carryOver * baseValue;
        }
        while (carryOver > 0) {
            resultList[segmentIndex++] = carryOver % baseValue;
            carryOver = Math.floor(carryOver / baseValue);
        }
        return resultList;
    }

    function padLeftWithZeros(segmentList, numZeros) {
        var paddedList = [];
        while (numZeros-- > 0) paddedList.push(0);
        return paddedList.concat(segmentList);
    }

    function karatsubaProduct(listX, listY) {
        var len = Math.max(listX.length, listY.length);
        if (len <= 30)
            return longMultiplication(listX, listY);
        len = Math.ceil(len / 2);
        var b_part = listX.slice(len),
            a_part = listX.slice(0, len),
            d_part = listY.slice(len),
            c_part = listY.slice(0, len);
        var ac_prod = karatsubaProduct(a_part, c_part),
            bd_prod = karatsubaProduct(b_part, d_part),
            abcd_sum_prod = karatsubaProduct(flexibleAddition(a_part, b_part), flexibleAddition(c_part, d_part));
        var finalProduct = flexibleAddition(flexibleAddition(ac_prod, padLeftWithZeros(performSubtraction(performSubtraction(abcd_sum_prod, ac_prod), bd_prod), len)), padLeftWithZeros(bd_prod, 2 * len));
        pruneLeadingZeros(finalProduct);
        return finalProduct;
    }

    function shouldUseKaratsuba(len1, len2) {
        return -.012 * len1 - .012 * len2 + 15e-6 * len1 * len2 > 0;
    }

    LargeNumericEntity.prototype.produce = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal),
            currentSegments = this.dataSegments,
            otherSegments = otherNum.dataSegments,
            resultNegative = this.negativeMark !== otherNum.negativeMark,
            absOtherVal;
        if (otherNum.isCompactForm) {
            if (otherSegments === 0) return NumericEntity[0];
            if (otherSegments === 1) return this;
            if (otherSegments === -1) return this.invertSign();
            absOtherVal = Math.abs(otherSegments);
            if (absOtherVal < CHUNK_SIZE) {
                return new LargeNumericEntity(smallMultiplication(currentSegments, absOtherVal), resultNegative);
            }
            otherSegments = compactToSegmentArray(absOtherVal);
        }
        if (shouldUseKaratsuba(currentSegments.length, otherSegments.length))
            return new LargeNumericEntity(karatsubaProduct(currentSegments, otherSegments), resultNegative);
        return new LargeNumericEntity(longMultiplication(currentSegments, otherSegments), resultNegative);
    };
    LargeNumericEntity.prototype.product = LargeNumericEntity.prototype.produce;

    function scalarArrayProduct(scalarVal, segmentList, resultSign) {
        if (scalarVal < CHUNK_SIZE) {
            return new LargeNumericEntity(smallMultiplication(segmentList, scalarVal), resultSign);
        }
        return new LargeNumericEntity(longMultiplication(segmentList, compactToSegmentArray(scalarVal)), resultSign);
    }

    CompactNumericEntity.prototype._produceByCompact = function(compactOther) {
        if (isStandardRange(compactOther.dataSegments * this.dataSegments)) {
            return new CompactNumericEntity(compactOther.dataSegments * this.dataSegments);
        }
        return scalarArrayProduct(Math.abs(compactOther.dataSegments), compactToSegmentArray(Math.abs(this.dataSegments)), this.negativeMark !== compactOther.negativeMark);
    };

    LargeNumericEntity.prototype._produceByCompact = function(compactOther) {
        if (compactOther.dataSegments === 0) return NumericEntity[0];
        if (compactOther.dataSegments === 1) return this;
        if (compactOther.dataSegments === -1) return this.invertSign();
        return scalarArrayProduct(Math.abs(compactOther.dataSegments), this.dataSegments, this.negativeMark !== compactOther.negativeMark);
    };

    CompactNumericEntity.prototype.produce = function(otherVal) {
        return convertToNumericEntity(otherVal)._produceByCompact(this);
    };
    CompactNumericEntity.prototype.product = CompactNumericEntity.prototype.produce;

    function calculateSquare(segmentList) {
        var segLen = segmentList.length,
            resultList = initZeroArray(segLen + segLen),
            baseValue = CHUNK_SIZE,
            currentProduct, carryOver, segmentIdx, segValI, segValJ;
        for (segmentIdx = 0; segmentIdx < segLen; segmentIdx++) {
            segValI = segmentList[segmentIdx];
            carryOver = 0 - segValI * segValI;
            for (var j = segmentIdx; j < segLen; j++) {
                segValJ = segmentList[j];
                currentProduct = 2 * (segValI * segValJ) + resultList[segmentIdx + j] + carryOver;
                carryOver = Math.floor(currentProduct / baseValue);
                resultList[segmentIdx + j] = currentProduct - carryOver * baseValue;
            }
            resultList[segmentIdx + segLen] = carryOver;
        }
        pruneLeadingZeros(resultList);
        return resultList;
    }

    LargeNumericEntity.prototype.selfProduct = function() {
        return new LargeNumericEntity(calculateSquare(this.dataSegments), false);
    };
    CompactNumericEntity.prototype.selfProduct = function() {
        var squaredVal = this.dataSegments * this.dataSegments;
        if (isStandardRange(squaredVal))
            return new CompactNumericEntity(squaredVal);
        return new LargeNumericEntity(calculateSquare(compactToSegmentArray(Math.abs(this.dataSegments))), false);
    };

    function divideAndModuloVariant1(listA, listB) {
        var lenA = listA.length,
            lenB = listB.length,
            resultArr = initZeroArray(listB.length),
            baseVal = CHUNK_SIZE,
            divisorMostSig = listB[lenB - 1],
            lambdaFactor = Math.ceil(baseVal / (2 * divisorMostSig)),
            currentRemainder = smallMultiplication(listA, lambdaFactor),
            currentDivisor = smallMultiplication(listB, lambdaFactor),
            quotientVal, shiftAmount, carryVal, borrowVal, segI, segL, currentQ;
        if (currentRemainder.length <= lenA)
            currentRemainder.push(0);
        currentDivisor.push(0);
        divisorMostSig = currentDivisor[lenB - 1];
        for (shiftAmount = lenA - lenB; shiftAmount >= 0; shiftAmount--) {
            quotientVal = baseVal - 1;
            if (currentRemainder[shiftAmount + lenB] !== divisorMostSig) {
                quotientVal = Math.floor((currentRemainder[shiftAmount + lenB] * baseVal + currentRemainder[shiftAmount + lenB - 1]) / divisorMostSig);
            }
            carryVal = 0;
            borrowVal = 0;
            segL = currentDivisor.length;
            for (segI = 0; segI < segL; segI++) {
                carryVal += quotientVal * currentDivisor[segI];
                currentQ = Math.floor(carryVal / baseVal);
                borrowVal += currentRemainder[shiftAmount + segI] - (carryVal - currentQ * baseVal);
                carryVal = currentQ;
                if (borrowVal < 0) {
                    currentRemainder[shiftAmount + segI] = borrowVal + baseVal;
                    borrowVal = -1;
                } else {
                    currentRemainder[shiftAmount + segI] = borrowVal;
                    borrowVal = 0;
                }
            }
            while (borrowVal !== 0) {
                quotientVal -= 1;
                carryVal = 0;
                for (segI = 0; segI < segL; segI++) {
                    carryVal += currentRemainder[shiftAmount + segI] - baseVal + currentDivisor[segI];
                    if (carryVal < 0) {
                        currentRemainder[shiftAmount + segI] = carryVal + baseVal;
                        carryVal = 0;
                    } else {
                        currentRemainder[shiftAmount + segI] = carryVal;
                        carryVal = 1;
                    }
                }
                borrowVal += carryVal;
            }
            resultArr[shiftAmount] = quotientVal;
        }
        currentRemainder = divideByScalarModulo(currentRemainder, lambdaFactor)[0];
        return [segmentArrayToCompact(resultArr), segmentArrayToCompact(currentRemainder)];
    }

    function divideAndModuloVariant2(listA, listB) {
        var lenA = listA.length,
            lenB = listB.length,
            resultList = [],
            partList = [],
            baseVal = CHUNK_SIZE,
            currentGuess, xLength, highX, highY, checkResult;
        while (lenA) {
            partList.unshift(listA[--lenA]);
            pruneLeadingZeros(partList);
            if (compareAbsoluteValues(partList, listB) < 0) {
                resultList.push(0);
                continue;
            }
            xLength = partList.length;
            highX = partList[xLength - 1] * baseVal + partList[xLength - 2];
            highY = listB[lenB - 1] * baseVal + listB[lenB - 2];
            if (xLength > lenB) {
                highX = (highX + 1) * baseVal;
            }
            currentGuess = Math.ceil(highX / highY);
            do {
                checkResult = smallMultiplication(listB, currentGuess);
                if (compareAbsoluteValues(checkResult, partList) <= 0) break;
                currentGuess--;
            } while (currentGuess);
            resultList.push(currentGuess);
            partList = performSubtraction(partList, checkResult);
        }
        resultList.reverse();
        return [segmentArrayToCompact(resultList), segmentArrayToCompact(partList)];
    }

    function divideByScalarModulo(segmentList, scalarDivisor) {
        var segLen = segmentList.length,
            quotientList = initZeroArray(segLen),
            baseVal = CHUNK_SIZE,
            segmentIndex, currentQ, currentRemainder, currentDividend;
        currentRemainder = 0;
        for (segmentIndex = segLen - 1; segmentIndex >= 0; --segmentIndex) {
            currentDividend = currentRemainder * baseVal + segmentList[segmentIndex];
            currentQ = floorOrCeil(currentDividend / scalarDivisor);
            currentRemainder = currentDividend - currentQ * scalarDivisor;
            quotientList[segmentIndex] = currentQ | 0;
        }
        return [quotientList, currentRemainder | 0];
    }

    function flexibleDivisionAndModulo(currentNum, otherNum) {
        var resultData,
            parsedOther = convertToNumericEntity(otherNum);
        var currentSegments = currentNum.dataSegments,
            otherSegments = parsedOther.dataSegments;
        var finalQuotient;
        if (otherSegments === 0)
            throw new Error("Cannot divide by zero");
        if (currentNum.isCompactForm) {
            if (parsedOther.isCompactForm) {
                return [new CompactNumericEntity(floorOrCeil(currentSegments / otherSegments)), new CompactNumericEntity(currentSegments % otherSegments)];
            }
            return [NumericEntity[0], currentNum];
        }
        if (parsedOther.isCompactForm) {
            if (otherSegments === 1) return [currentNum, NumericEntity[0]];
            if (otherSegments === -1) return [currentNum.invertSign(), NumericEntity[0]];
            var absOther = Math.abs(otherSegments);
            if (absOther < CHUNK_SIZE) {
                resultData = divideByScalarModulo(currentSegments, absOther);
                finalQuotient = segmentArrayToCompact(resultData[0]);
                var remainderVal = resultData[1];
                if (currentNum.negativeMark)
                    remainderVal = -remainderVal;
                if (typeof finalQuotient === "number") {
                    if (currentNum.negativeMark !== parsedOther.negativeMark)
                        finalQuotient = -finalQuotient;
                    return [new CompactNumericEntity(finalQuotient), new CompactNumericEntity(remainderVal)];
                }
                return [new LargeNumericEntity(finalQuotient, currentNum.negativeMark !== parsedOther.negativeMark), new CompactNumericEntity(remainderVal)];
            }
            otherSegments = compactToSegmentArray(absOther);
        }
        var comparisonResult = compareAbsoluteValues(currentSegments, otherSegments);
        if (comparisonResult === -1) return [NumericEntity[0], currentNum];
        if (comparisonResult === 0) return [NumericEntity[currentNum.negativeMark === parsedOther.negativeMark ? 1 : -1], NumericEntity[0]];
        if (currentSegments.length + otherSegments.length <= 200)
            resultData = divideAndModuloVariant1(currentSegments, otherSegments);
        else
            resultData = divideAndModuloVariant2(currentSegments, otherSegments);
        finalQuotient = resultData[0];
        var quotientNegative = currentNum.negativeMark !== parsedOther.negativeMark,
            moduloResult = resultData[1],
            moduloNegative = currentNum.negativeMark;
        if (typeof finalQuotient === "number") {
            if (quotientNegative)
                finalQuotient = -finalQuotient;
            finalQuotient = new CompactNumericEntity(finalQuotient);
        } else
            finalQuotient = new LargeNumericEntity(finalQuotient, quotientNegative);
        if (typeof moduloResult === "number") {
            if (moduloNegative)
                moduloResult = -moduloResult;
            moduloResult = new CompactNumericEntity(moduloResult);
        } else
            moduloResult = new LargeNumericEntity(moduloResult, moduloNegative);
        return [finalQuotient, moduloResult];
    }

    LargeNumericEntity.prototype.divideRemainder = function(otherVal) {
        var opResult = flexibleDivisionAndModulo(this, otherVal);
        return {
            quotient: opResult[0],
            remainder: opResult[1]
        };
    };
    CompactNumericEntity.prototype.divideRemainder = LargeNumericEntity.prototype.divideRemainder;

    LargeNumericEntity.prototype.quotient = function(otherVal) {
        return flexibleDivisionAndModulo(this, otherVal)[0];
    };
    CompactNumericEntity.prototype.division = CompactNumericEntity.prototype.quotient;
    LargeNumericEntity.prototype.division = LargeNumericEntity.prototype.quotient;

    LargeNumericEntity.prototype.remainder = function(otherVal) {
        return flexibleDivisionAndModulo(this, otherVal)[1];
    };
    CompactNumericEntity.prototype.remainder = CompactNumericEntity.prototype.remainder;
    LargeNumericEntity.prototype.remainder = LargeNumericEntity.prototype.remainder;

    LargeNumericEntity.prototype.raiseToPower = function(exponentVal) {
        var otherNum = convertToNumericEntity(exponentVal),
            currentSegments = this.dataSegments,
            otherValData = otherNum.dataSegments,
            resultVal, baseX, powerY;
        if (otherValData === 0) return NumericEntity[1];
        if (currentSegments === 0) return NumericEntity[0];
        if (currentSegments === 1) return NumericEntity[1];
        if (currentSegments === -1) return otherNum.isParityEven() ? NumericEntity[1] : NumericEntity[-1];
        if (otherNum.negativeMark) {
            return NumericEntity[0];
        }
        if (!otherNum.isCompactForm)
            throw new Error("The exponent " + otherNum.toText() + " is too large.");
        if (this.isCompactForm) {
            if (isStandardRange(resultVal = Math.pow(currentSegments, otherValData)))
                return new CompactNumericEntity(floorOrCeil(resultVal));
        }
        baseX = this;
        powerY = NumericEntity[1];
        while (true) {
            if (otherValData & 1 === 1) {
                powerY = powerY.produce(baseX);
                --otherValData;
            }
            if (otherValData === 0) break;
            otherValData /= 2;
            baseX = baseX.selfProduct();
        }
        return powerY;
    };
    CompactNumericEntity.prototype.raiseToPower = LargeNumericEntity.prototype.raiseToPower;

    LargeNumericEntity.prototype.modularExponentiation = function(expVal, modVal) {
        expVal = convertToNumericEntity(expVal);
        modVal = convertToNumericEntity(modVal);
        if (modVal.isZeroValue())
            throw new Error("Cannot take modularExponentiation with modulus 0");
        var result = NumericEntity[1],
            base = this.remainder(modVal);
        while (expVal.isSignPositive()) {
            if (base.isZeroValue()) return NumericEntity[0];
            if (expVal.isParityOdd()) result = result.produce(base).remainder(modVal);
            expVal = expVal.quotient(2);
            base = base.selfProduct().remainder(modVal);
        }
        return result;
    };
    CompactNumericEntity.prototype.modularExponentiation = LargeNumericEntity.prototype.modularExponentiation;

    function compareAbsoluteValues(listA, listB) {
        if (listA.length !== listB.length) {
            return listA.length > listB.length ? 1 : -1;
        }
        for (var segIdx = listA.length - 1; segIdx >= 0; segIdx--) {
            if (listA[segIdx] !== listB[segIdx])
                return listA[segIdx] > listB[segIdx] ? 1 : -1;
        }
        return 0;
    }

    LargeNumericEntity.prototype.compareAbsValues = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal),
            currentSegments = this.dataSegments,
            otherSegments = otherNum.dataSegments;
        if (otherNum.isCompactForm) return 1;
        return compareAbsoluteValues(currentSegments, otherSegments);
    };

    CompactNumericEntity.prototype.compareAbsValues = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal),
            currentAbsVal = Math.abs(this.dataSegments),
            otherValData = otherNum.dataSegments;
        if (otherNum.isCompactForm) {
            otherValData = Math.abs(otherValData);
            return currentAbsVal === otherValData ? 0 : currentAbsVal > otherValData ? 1 : -1;
        }
        return -1;
    };

    LargeNumericEntity.prototype.evaluate = function(otherVal) {
        if (otherVal === Infinity) {
            return -1;
        }
        if (otherVal === -Infinity) {
            return 1;
        }
        var otherNum = convertToNumericEntity(otherVal),
            currentSegments = this.dataSegments,
            otherSegments = otherNum.dataSegments;
        if (this.negativeMark !== otherNum.negativeMark) {
            return otherNum.negativeMark ? 1 : -1;
        }
        if (otherNum.isCompactForm) {
            return this.negativeMark ? -1 : 1;
        }
        return compareAbsoluteValues(currentSegments, otherSegments) * (this.negativeMark ? -1 : 1);
    };
    LargeNumericEntity.prototype.evaluateTo = LargeNumericEntity.prototype.evaluate;

    CompactNumericEntity.prototype.evaluate = function(otherVal) {
        if (otherVal === Infinity) {
            return -1;
        }
        if (otherVal === -Infinity) {
            return 1;
        }
        var otherNum = convertToNumericEntity(otherVal),
            currentVal = this.dataSegments,
            otherValData = otherNum.dataSegments;
        if (otherNum.isCompactForm) {
            return currentVal == otherValData ? 0 : currentVal > otherValData ? 1 : -1;
        }
        if (currentVal < 0 !== otherNum.negativeMark) {
            return currentVal < 0 ? -1 : 1;
        }
        return currentVal < 0 ? 1 : -1;
    };
    CompactNumericEntity.prototype.evaluateTo = CompactNumericEntity.prototype.evaluate;

    LargeNumericEntity.prototype.isEqualTo = function(otherVal) {
        return this.evaluate(otherVal) === 0;
    };
    CompactNumericEntity.prototype.isEqual = CompactNumericEntity.prototype.isEqualTo;
    LargeNumericEntity.prototype.isEqual = LargeNumericEntity.prototype.isEqualTo;

    LargeNumericEntity.prototype.isNotEqualTo = function(otherVal) {
        return this.evaluate(otherVal) !== 0;
    };
    CompactNumericEntity.prototype.isNotEqual = CompactNumericEntity.prototype.isNotEqualTo;
    LargeNumericEntity.prototype.isNotEqual = LargeNumericEntity.prototype.isNotEqualTo;

    LargeNumericEntity.prototype.isGreater = function(otherVal) {
        return this.evaluate(otherVal) > 0;
    };
    CompactNumericEntity.prototype.isGt = CompactNumericEntity.prototype.isGreater;
    LargeNumericEntity.prototype.isGt = LargeNumericEntity.prototype.isGreater;

    LargeNumericEntity.prototype.isLesser = function(otherVal) {
        return this.evaluate(otherVal) < 0;
    };
    CompactNumericEntity.prototype.isLt = CompactNumericEntity.prototype.isLesser;
    LargeNumericEntity.prototype.isLt = LargeNumericEntity.prototype.isLesser;

    LargeNumericEntity.prototype.isGreaterOrEqual = function(otherVal) {
        return this.evaluate(otherVal) >= 0;
    };
    CompactNumericEntity.prototype.isGeq = CompactNumericEntity.prototype.isGreaterOrEqual;
    LargeNumericEntity.prototype.isGeq = LargeNumericEntity.prototype.isGreaterOrEqual;

    LargeNumericEntity.prototype.isLesserOrEqual = function(otherVal) {
        return this.evaluate(otherVal) <= 0;
    };
    CompactNumericEntity.prototype.isLeq = CompactNumericEntity.prototype.isLesserOrEqual;
    LargeNumericEntity.prototype.isLeq = LargeNumericEntity.prototype.isLesserOrEqual;

    LargeNumericEntity.prototype.isParityEven = function() {
        return (this.dataSegments[0] & 1) === 0;
    };
    CompactNumericEntity.prototype.isParityEven = function() {
        return (this.dataSegments & 1) === 0;
    };

    LargeNumericEntity.prototype.isParityOdd = function() {
        return (this.dataSegments[0] & 1) === 1;
    };
    CompactNumericEntity.prototype.isParityOdd = function() {
        return (this.dataSegments & 1) === 1;
    };

    LargeNumericEntity.prototype.isSignPositive = function() {
        return !this.negativeMark;
    };
    CompactNumericEntity.prototype.isSignPositive = function() {
        return this.dataSegments > 0;
    };

    LargeNumericEntity.prototype.isSignNegative = function() {
        return this.negativeMark;
    };
    CompactNumericEntity.prototype.isSignNegative = function() {
        return this.dataSegments < 0;
    };

    LargeNumericEntity.prototype.isOneOrMinusOne = function() {
        return false;
    };
    CompactNumericEntity.prototype.isOneOrMinusOne = function() {
        return Math.abs(this.dataSegments) === 1;
    };

    LargeNumericEntity.prototype.isZeroValue = function() {
        return false;
    };
    CompactNumericEntity.prototype.isZeroValue = function() {
        return this.dataSegments === 0;
    };

    LargeNumericEntity.prototype.isDivisibleByOther = function(otherVal) {
        var otherNum = convertToNumericEntity(otherVal);
        var otherNumVal = otherNum.dataSegments;
        if (otherNumVal === 0) return false;
        if (otherNumVal === 1) return true;
        if (otherNumVal === 2) return this.isParityEven();
        return this.remainder(otherNum).isEqualTo(NumericEntity[0]);
    };
    CompactNumericEntity.prototype.isDivisibleByOther = LargeNumericEntity.prototype.isDivisibleByOther;

    function isBasicPrimeCheck(numVal) {
        var absNum = numVal.absoluteValue();
        if (absNum.isOneOrMinusOne()) return false;
        if (absNum.isEqualTo(2) || absNum.isEqualTo(3) || absNum.isEqualTo(5)) return true;
        if (absNum.isParityEven() || absNum.isDivisibleByOther(3) || absNum.isDivisibleByOther(5)) return false;
        if (absNum.isLesser(25)) return true;
    }

    LargeNumericEntity.prototype.isProbablePrimeNumber = function() {
        var primeCheck = isBasicPrimeCheck(this);
        if (primeCheck !== voidVal) return primeCheck;
        var currentNum = this.absoluteValue(),
            previousNum = currentNum.decremented();
        var testArray = [2, 3, 5, 7, 11, 13, 17, 19],
            reducedPrev = previousNum,
            divisorCandidate, tempFlag, loopIdx, valX;
        while (reducedPrev.isParityEven())
            reducedPrev = reducedPrev.quotient(2);
        for (loopIdx = 0; loopIdx < testArray.length; loopIdx++) {
            valX = largeNum(testArray[loopIdx]).modularExponentiation(reducedPrev, currentNum);
            if (valX.isEqualTo(NumericEntity[1]) || valX.isEqualTo(previousNum)) continue;
            for (tempFlag = true, divisorCandidate = reducedPrev; tempFlag && divisorCandidate.isLesser(previousNum); divisorCandidate = divisorCandidate.produce(2)) {
                valX = valX.selfProduct().remainder(currentNum);
                if (valX.isEqualTo(previousNum)) tempFlag = false;
            }
            if (tempFlag) return false;
        }
        return true;
    };
    CompactNumericEntity.prototype.isProbablePrimeNumber = LargeNumericEntity.prototype.isProbablePrimeNumber;

    LargeNumericEntity.prototype.isLikelyPrime = function(iterationsCount) {
        var primeCheck = isBasicPrimeCheck(this);
        if (primeCheck !== voidVal) return primeCheck;
        var currentNum = this.absoluteValue();
        var testIterations = iterationsCount === voidVal ? 5 : iterationsCount;
        for (var loopIdx = 0; loopIdx < testIterations; loopIdx++) {
            var randomVal = largeNum.randomBetweenRange(2, currentNum.deduct(2));
            if (!randomVal.modularExponentiation(currentNum.decremented(), currentNum).isOneOrMinusOne())
                return false;
        }
        return true;
    };
    CompactNumericEntity.prototype.isLikelyPrime = LargeNumericEntity.prototype.isLikelyPrime;

    LargeNumericEntity.prototype.modularInverse = function(modulus) {
        var tempT = largeNum.zero,
            newTempT = largeNum.one,
            currentR = convertToNumericEntity(modulus),
            newCurrentR = this.absoluteValue(),
            quotientResult, lastTempT, lastCurrentR;
        while (!newCurrentR.isEqualTo(largeNum.zero)) {
            quotientResult = currentR.quotient(newCurrentR);
            lastTempT = tempT;
            lastCurrentR = currentR;
            tempT = newTempT;
            currentR = newCurrentR;
            newTempT = lastTempT.deduct(quotientResult.produce(newTempT));
            newCurrentR = lastCurrentR.deduct(quotientResult.produce(newCurrentR));
        }
        if (!currentR.isEqualTo(1))
            throw new Error(this.toText() + " and " + modulus.toText() + " are not co-prime");
        if (tempT.evaluate(0) === -1) {
            tempT = tempT.append(modulus);
        }
        if (this.isSignNegative()) {
            return tempT.invertSign();
        }
        return tempT;
    };
    CompactNumericEntity.prototype.modularInverse = LargeNumericEntity.prototype.modularInverse;

    LargeNumericEntity.prototype.incremented = function() {
        var currentSegments = this.dataSegments;
        if (this.negativeMark) {
            return subtractCompactValue(currentSegments, 1, this.negativeMark);
        }
        return new LargeNumericEntity(addCompactValue(currentSegments, 1), this.negativeMark);
    };

    CompactNumericEntity.prototype.incremented = function() {
        var currentVal = this.dataSegments;
        if (currentVal + 1 < MAX_SAFE_NUM)
            return new CompactNumericEntity(currentVal + 1);
        return new LargeNumericEntity(MAX_SAFE_ARR, false);
    };

    LargeNumericEntity.prototype.decremented = function() {
        var currentSegments = this.dataSegments;
        if (this.negativeMark) {
            return new LargeNumericEntity(addCompactValue(currentSegments, 1), true);
        }
        return subtractCompactValue(currentSegments, 1, this.negativeMark);
    };

    CompactNumericEntity.prototype.decremented = function() {
        var currentVal = this.dataSegments;
        if (currentVal - 1 > -MAX_SAFE_NUM)
            return new CompactNumericEntity(currentVal - 1);
        return new LargeNumericEntity(MAX_SAFE_ARR, true);
    };

    var binaryPowerList = [1];
    while (2 * binaryPowerList[binaryPowerList.length - 1] <= CHUNK_SIZE)
        binaryPowerList.push(2 * binaryPowerList[binaryPowerList.length - 1]);

    var binaryPowerCount = binaryPowerList.length,
        largestBinaryPower = binaryPowerList[binaryPowerCount - 1];

    function isShiftAmountCompact(shiftAmount) {
        return (typeof shiftAmount === "number" || typeof shiftAmount === "string") && +Math.abs(shiftAmount) <= CHUNK_SIZE || shiftAmount instanceof LargeNumericEntity && shiftAmount.dataSegments.length <= 1;
    }

    LargeNumericEntity.prototype.binaryShiftLeft = function(shiftVal) {
        if (!isShiftAmountCompact(shiftVal)) {
            throw new Error(String(shiftVal) + " is too large for shifting.");
        }
        shiftVal = +shiftVal;
        if (shiftVal < 0)
            return this.binaryShiftRight(-shiftVal);
        var currentResult = this;
        if (currentResult.isZeroValue()) return currentResult;
        while (shiftVal >= binaryPowerCount) {
            currentResult = currentResult.produce(largestBinaryPower);
            shiftVal -= binaryPowerCount - 1;
        }
        return currentResult.produce(binaryPowerList[shiftVal]);
    };
    CompactNumericEntity.prototype.binaryShiftLeft = LargeNumericEntity.prototype.binaryShiftLeft;

    LargeNumericEntity.prototype.binaryShiftRight = function(shiftVal) {
        var remainderQuotient;
        if (!isShiftAmountCompact(shiftVal)) {
            throw new Error(String(shiftVal) + " is too large for shifting.");
        }
        shiftVal = +shiftVal;
        if (shiftVal < 0)
            return this.binaryShiftLeft(-shiftVal);
        var currentResult = this;
        while (shiftVal >= binaryPowerCount) {
            if (currentResult.isZeroValue() || currentResult.isSignNegative() && currentResult.isOneOrMinusOne())
                return currentResult;
            remainderQuotient = flexibleDivisionAndModulo(currentResult, largestBinaryPower);
            currentResult = remainderQuotient[1].isSignNegative() ? remainderQuotient[0].decremented() : remainderQuotient[0];
            shiftVal -= binaryPowerCount - 1;
        }
        remainderQuotient = flexibleDivisionAndModulo(currentResult, binaryPowerList[shiftVal]);
        return remainderQuotient[1].isSignNegative() ? remainderQuotient[0].decremented() : remainderQuotient[0];
    };
    CompactNumericEntity.prototype.binaryShiftRight = LargeNumericEntity.prototype.binaryShiftRight;

    function performBitwiseOp(numX, numY, operationFn) {
        numY = convertToNumericEntity(numY);
        var xNegative = numX.isSignNegative(),
            yNegative = numY.isSignNegative();
        var xRemaining = xNegative ? numX.bitwiseNot() : numX,
            yRemaining = yNegative ? numY.bitwiseNot() : numY;
        var xDigit = 0,
            yDigit = 0;
        var xDivModResult = null,
            yDivModResult = null;
        var resultSegments = [];
        while (!xRemaining.isZeroValue() || !yRemaining.isZeroValue()) {
            xDivModResult = flexibleDivisionAndModulo(xRemaining, largestBinaryPower);
            xDigit = xDivModResult[1].toNativeNumber();
            if (xNegative) {
                xDigit = largestBinaryPower - 1 - xDigit;
            }
            yDivModResult = flexibleDivisionAndModulo(yRemaining, largestBinaryPower);
            yDigit = yDivModResult[1].toNativeNumber();
            if (yNegative) {
                yDigit = largestBinaryPower - 1 - yDigit;
            }
            xRemaining = xDivModResult[0];
            yRemaining = yDivModResult[0];
            resultSegments.push(operationFn(xDigit, yDigit));
        }
        var finalSum = operationFn(xNegative ? 1 : 0, yNegative ? 1 : 0) !== 0 ? largeNum(-1) : largeNum(0);
        for (var segIdx = resultSegments.length - 1; segIdx >= 0; segIdx -= 1) {
            finalSum = finalSum.produce(largestBinaryPower).append(largeNum(resultSegments[segIdx]));
        }
        return finalSum;
    }

    LargeNumericEntity.prototype.bitwiseNot = function() {
        return this.invertSign().decremented();
    };
    CompactNumericEntity.prototype.bitwiseNot = LargeNumericEntity.prototype.bitwiseNot;

    LargeNumericEntity.prototype.bitwiseAnd = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(valA, valB) {
            return valA & valB;
        });
    };
    CompactNumericEntity.prototype.bitwiseAnd = LargeNumericEntity.prototype.bitwiseAnd;

    LargeNumericEntity.prototype.bitwiseOr = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(valA, valB) {
            return valA | valB;
        });
    };
    CompactNumericEntity.prototype.bitwiseOr = LargeNumericEntity.prototype.bitwiseOr;

    LargeNumericEntity.prototype.bitwiseXor = function(otherNum) {
        return performBitwiseOp(this, otherNum, function(valA, valB) {
            return valA ^ valB;
        });
    };
    CompactNumericEntity.prototype.bitwiseXor = LargeNumericEntity.prototype.bitwiseXor;

    var lowBitMaskInt = 1 << 30,
        lowBitMaskBigInt = (CHUNK_SIZE & -CHUNK_SIZE) * (CHUNK_SIZE & -CHUNK_SIZE) | lowBitMaskInt;

    function getLowestOneBit(numObj) {
        var numData = numObj.dataSegments,
            bitResult = typeof numData === "number" ? numData | lowBitMaskInt : numData[0] + numData[1] * CHUNK_SIZE | lowBitMaskBigInt;
        return bitResult & -bitResult;
    }

    function calcIntegerLog(numVal, baseVal) {
        if (baseVal.evaluateTo(numVal) <= 0) {
            var tempResult = calcIntegerLog(numVal, baseVal.selfProduct(baseVal));
            var currentP = tempResult.p;
            var currentE = tempResult.e;
            var testT = currentP.produce(baseVal);
            return testT.evaluateTo(numVal) <= 0 ? {
                p: testT,
                e: currentE * 2 + 1
            } : {
                p: currentP,
                e: currentE * 2
            };
        }
        return {
            p: largeNum(1),
            e: 0
        };
    }

    LargeNumericEntity.prototype.getBitLength = function() {
        var currentNum = this;
        if (currentNum.evaluateTo(largeNum(0)) < 0) {
            currentNum = currentNum.invertSign().deduct(largeNum(1));
        }
        if (currentNum.evaluateTo(largeNum(0)) === 0) {
            return largeNum(0);
        }
        return largeNum(calcIntegerLog(currentNum, largeNum(2)).e).append(largeNum(1));
    };
    CompactNumericEntity.prototype.getBitLength = LargeNumericEntity.prototype.getBitLength;

    function findMaximum(valA, valB) {
        valA = convertToNumericEntity(valA);
        valB = convertToNumericEntity(valB);
        return valA.isGreater(valB) ? valA : valB;
    }

    function findMinimum(valA, valB) {
        valA = convertToNumericEntity(valA);
        valB = convertToNumericEntity(valB);
        return valA.isLesser(valB) ? valA : valB;
    }

    function greatestCommonDivisor(valA, valB) {
        valA = convertToNumericEntity(valA).absoluteValue();
        valB = convertToNumericEntity(valB).absoluteValue();
        if (valA.isEqualTo(valB)) return valA;
        if (valA.isZeroValue()) return valB;
        if (valB.isZeroValue()) return valA;
        var commonFactor = NumericEntity[1],
            shiftAmount, tempHolder;
        while (valA.isParityEven() && valB.isParityEven()) {
            shiftAmount = Math.min(getLowestOneBit(valA), getLowestOneBit(valB));
            valA = valA.quotient(shiftAmount);
            valB = valB.quotient(shiftAmount);
            commonFactor = commonFactor.produce(shiftAmount);
        }
        while (valA.isParityEven()) {
            valA = valA.quotient(getLowestOneBit(valA));
        }
        do {
            while (valB.isParityEven()) {
                valB = valB.quotient(getLowestOneBit(valB));
            }
            if (valA.isGreater(valB)) {
                tempHolder = valB;
                valB = valA;
                valA = tempHolder;
            }
            valB = valB.deduct(valA);
        } while (!valB.isZeroValue());
        return commonFactor.isOneOrMinusOne() ? valA : valA.produce(commonFactor);
    }

    function leastCommonMultiple(valA, valB) {
        valA = convertToNumericEntity(valA).absoluteValue();
        valB = convertToNumericEntity(valB).absoluteValue();
        return valA.quotient(greatestCommonDivisor(valA, valB)).produce(valB);
    }

    function randomBetweenRange(minVal, maxVal) {
        minVal = convertToNumericEntity(minVal);
        maxVal = convertToNumericEntity(maxVal);
        var lowerBound = findMinimum(minVal, maxVal),
            upperBound = findMaximum(minVal, maxVal);
        var rangeSpan = upperBound.deduct(lowerBound).append(1);
        if (rangeSpan.isCompactForm)
            return lowerBound.append(Math.floor(Math.random() * rangeSpan.dataSegments));
        var listLength = rangeSpan.dataSegments.length - 1;
        var resultList = [],
            isRestricted = true;
        for (var segIdx = listLength; segIdx >= 0; segIdx--) {
            var topLimit = isRestricted ? rangeSpan.dataSegments[segIdx] : CHUNK_SIZE;
            var digitValue = floorOrCeil(Math.random() * topLimit);
            resultList.unshift(digitValue);
            if (digitValue < topLimit)
                isRestricted = false;
        }
        resultList = segmentArrayToCompact(resultList);
        return lowerBound.append(typeof resultList === "number" ? new CompactNumericEntity(resultList) : new LargeNumericEntity(resultList, false));
    }

    var parseStringWithBase = function(textInput, baseVal) {
        var textLength = textInput.length;
        var charIndex;
        var absBase = Math.abs(baseVal);
        for (charIndex = 0; charIndex < textLength; charIndex++) {
            var charCode = textInput[charIndex].toLowerCase();
            if (charCode === "-") continue;
            if (/[a-z0-9]/.test(charCode)) {
                if (/[0-9]/.test(charCode) && +charCode >= absBase) {
                    if (charCode === "1" && absBase === 1) continue;
                    throw new Error(charCode + " is not a valid digit in base " + baseVal + ".");
                } else if (charCode.charCodeAt(0) - 87 >= absBase) {
                    throw new Error(charCode + " is not a valid digit in base " + baseVal + ".");
                }
            }
        }
        if (2 <= baseVal && baseVal <= 36) {
            if (textLength <= MAX_SAFE_LOG / Math.log(baseVal)) {
                var parseResult = parseInt(textInput, baseVal);
                if (isNaN(parseResult)) {
                    throw new Error(charCode + " is not a valid digit in base " + baseVal + ".");
                }
                return new CompactNumericEntity(parseInt(textInput, baseVal));
            }
        }
        baseVal = convertToNumericEntity(baseVal);
        var digitList = [];
        var isNegativeFlag = textInput[0] === "-";
        for (charIndex = isNegativeFlag ? 1 : 0; charIndex < textInput.length; charIndex++) {
            var charVal = textInput[charIndex].toLowerCase(),
                charAscii = charVal.charCodeAt(0);
            if (48 <= charAscii && charAscii <= 57)
                digitList.push(convertToNumericEntity(charVal));
            else if (97 <= charAscii && charAscii <= 122)
                digitList.push(convertToNumericEntity(charVal.charCodeAt(0) - 87));
            else if (charVal === "<") {
                var startPos = charIndex;
                do {
                    charIndex++;
                } while (textInput[charIndex] !== ">");
                digitList.push(convertToNumericEntity(textInput.slice(startPos + 1, charIndex)));
            } else throw new Error(charVal + " is not a valid character");
        }
        return constructFromBaseArray(digitList, baseVal, isNegativeFlag);
    };

    function constructFromBaseArray(digitList, baseVal, isNegativeFlag) {
        var finalValue = NumericEntity[0],
            currentPower = NumericEntity[1],
            digitIdx;
        for (digitIdx = digitList.length - 1; digitIdx >= 0; digitIdx--) {
            finalValue = finalValue.append(digitList[digitIdx].produce(currentPower));
            currentPower = currentPower.produce(baseVal);
        }
        return isNegativeFlag ? finalValue.invertSign() : finalValue;
    }

    function digitToStringRep(digitVal) {
        if (digitVal <= 35) {
            return "0123456789abcdefghijklmnopqrstuvwxyz".charAt(digitVal);
        }
        return "<" + digitVal + ">";
    }

    function convertToBaseRepresentation(numVal, baseVal) {
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
            if (numVal.isSignNegative()) return {
                value: [].concat.apply([], Array.apply(null, Array(-numVal.toNativeNumber())).map(Array.prototype.valueOf, [1, 0])),
                isNegative: false
            };
            var arrayFromNum = Array.apply(null, Array(+numVal.toNativeNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
            arrayFromNum.unshift([1]);
            return {
                value: [].concat.apply([], arrayFromNum),
                isNegative: false
            };
        }
        var isResultNegative = false;
        if (numVal.isSignNegative() && baseVal.isSignPositive()) {
            isResultNegative = true;
            numVal = numVal.absoluteValue();
        }
        if (baseVal.isEqualTo(1)) {
            if (numVal.isZeroValue()) return {
                value: [0],
                isNegative: false
            };
            return {
                value: Array.apply(null, Array(+numVal.toNativeNumber())).map(Number.prototype.valueOf, 1),
                isNegative: isResultNegative
            };
        }
        var outputDigits = [];
        var remainingVal = numVal,
            divModResult;
        while (remainingVal.isSignNegative() || remainingVal.compareAbsValues(baseVal) >= 0) {
            divModResult = remainingVal.divideRemainder(baseVal);
            remainingVal = divModResult.quotient;
            var currentDigit = divModResult.remainder;
            if (currentDigit.isSignNegative()) {
                currentDigit = baseVal.deduct(currentDigit).absoluteValue();
                remainingVal = remainingVal.incremented();
            }
            outputDigits.push(currentDigit.toNativeNumber());
        }
        outputDigits.push(remainingVal.toNativeNumber());
        return {
            value: outputDigits.reverse(),
            isNegative: isResultNegative
        };
    }

    function formatToBaseString(numVal, baseVal) {
        var baseRep = convertToBaseRepresentation(numVal, baseVal);
        return (baseRep.isNegative ? "-" : "") + baseRep.value.map(digitToStringRep).join("");
    }

    LargeNumericEntity.prototype.toSegmentArray = function(radixVal) {
        return convertToBaseRepresentation(this, radixVal);
    };
    CompactNumericEntity.prototype.toSegmentArray = function(radixVal) {
        return convertToBaseRepresentation(this, radixVal);
    };

    LargeNumericEntity.prototype.toText = function(radixVal) {
        if (radixVal === voidVal) radixVal = 10;
        if (radixVal !== 10) return formatToBaseString(this, radixVal);
        var segments = this.dataSegments,
            segLength = segments.length,
            textString = String(segments[--segLength]),
            zeroPad = "0000000",
            currentDigit;
        while (--segLength >= 0) {
            currentDigit = String(segments[segLength]);
            textString += zeroPad.slice(currentDigit.length) + currentDigit;
        }
        var signChar = this.negativeMark ? "-" : "";
        return signChar + textString;
    };

    CompactNumericEntity.prototype.toText = function(radixVal) {
        if (radixVal === voidVal) radixVal = 10;
        if (radixVal != 10) return formatToBaseString(this, radixVal);
        return String(this.dataSegments);
    };

    LargeNumericEntity.prototype.toSerializableJSON = CompactNumericEntity.prototype.toSerializableJSON = function() {
        return this.toText();
    };

    LargeNumericEntity.prototype.getPrimitiveValue = function() {
        return parseInt(this.toText(), 10);
    };
    LargeNumericEntity.prototype.toNativeNumber = LargeNumericEntity.prototype.getPrimitiveValue;

    CompactNumericEntity.prototype.getPrimitiveValue = function() {
        return this.dataSegments;
    };
    CompactNumericEntity.prototype.toNativeNumber = CompactNumericEntity.prototype.getPrimitiveValue;

    function interpretStringValue(stringValue) {
        if (isStandardRange(+stringValue)) {
            var numericVal = +stringValue;
            if (numericVal === floorOrCeil(numericVal))
                return new CompactNumericEntity(numericVal);
            throw new Error("Invalid integer: " + stringValue);
        }
        var isNegative = stringValue[0] === "-";
        if (isNegative) stringValue = stringValue.slice(1);
        var splitExp = stringValue.split(/e/i);
        if (splitExp.length > 2)
            throw new Error("Invalid integer: " + splitExp.join("e"));
        if (splitExp.length === 2) {
            var exponentPart = splitExp[1];
            if (exponentPart[0] === "+") exponentPart = exponentPart.slice(1);
            exponentPart = +exponentPart;
            if (exponentPart !== floorOrCeil(exponentPart) || !isStandardRange(exponentPart))
                throw new Error("Invalid integer: " + exponentPart + " is not a valid exponent.");
            var baseText = splitExp[0];
            var decimalPointIndex = baseText.indexOf(".");
            if (decimalPointIndex >= 0) {
                exponentPart -= baseText.length - decimalPointIndex - 1;
                baseText = baseText.slice(0, decimalPointIndex) + baseText.slice(decimalPointIndex + 1);
            }
            if (exponentPart < 0)
                throw new Error("Cannot include negative exponent part for integers");
            baseText += new Array(exponentPart + 1).join("0");
            stringValue = baseText;
        }
        var isValidFormat = /^([0-9][0-9]*)$/.test(stringValue);
        if (!isValidFormat)
            throw new Error("Invalid integer: " + stringValue);
        var segmentsList = [],
            maxLength = stringValue.length,
            chunkSizeLog = CHUNK_DIGITS,
            minLength = maxLength - chunkSizeLog;
        while (maxLength > 0) {
            segmentsList.push(+stringValue.slice(minLength, maxLength));
            minLength -= chunkSizeLog;
            if (minLength < 0) minLength = 0;
            maxLength -= chunkSizeLog;
        }
        pruneLeadingZeros(segmentsList);
        return new LargeNumericEntity(segmentsList, isNegative);
    }

    function interpretNumberValue(numInput) {
        if (isStandardRange(numInput)) {
            if (numInput !== floorOrCeil(numInput))
                throw new Error(numInput + " is not an integer.");
            return new CompactNumericEntity(numInput);
        }
        return interpretStringValue(numInput.toString());
    }

    function convertToNumericEntity(inputVal) {
        if (typeof inputVal === "number") {
            return interpretNumberValue(inputVal);
        }
        if (typeof inputVal === "string") {
            return interpretStringValue(inputVal);
        }
        return inputVal;
    }

    for (var loopCount = 0; loopCount < 1e3; loopCount++) {
        NumericEntity[loopCount] = new CompactNumericEntity(loopCount);
        if (loopCount > 0)
            NumericEntity[-loopCount] = new CompactNumericEntity(-loopCount);
    }

    NumericEntity.one = NumericEntity[1];
    NumericEntity.zero = NumericEntity[0];
    NumericEntity.minusOne = NumericEntity[-1];
    NumericEntity.max = findMaximum;
    NumericEntity.min = findMinimum;
    NumericEntity.gcd = greatestCommonDivisor;
    NumericEntity.lcm = leastCommonMultiple;
    NumericEntity.isInstance = function(obj) {
        return obj instanceof LargeNumericEntity || obj instanceof CompactNumericEntity;
    };
    NumericEntity.randomBetweenRange = randomBetweenRange;
    NumericEntity.fromArray = function(segments, base, isNegative) {
        return constructFromBaseArray(segments.map(convertToNumericEntity), convertToNumericEntity(base || 10), isNegative);
    };

    return NumericEntity;
}();


const processInput = inputData => {
    inputData = inputData.trim().split("\n");
    let heightVal = parseInt(inputData[0].split(" ")[0]);
    let widthVal = parseInt(inputData[0].split(" ")[1]);

    let minDifference = heightVal * widthVal;
    let areaParts = [...Array(3)];

    for (let iterationCount = 0; iterationCount < 2; iterationCount++) {
        for (let cutHeight = 1; cutHeight < heightVal; cutHeight++) {
            areaParts[0] = largeNum(cutHeight).produce(widthVal);
            areaParts[1] = (heightVal - cutHeight) * (widthVal / 2);
            areaParts[2] = largeNum(heightVal).produce(widthVal).deduct(areaParts[0].append(areaParts[1]));

            areaParts.sort((valA, valB) => valA.evaluateTo(valB));
            minDifference = Math.min(minDifference, areaParts[2].deduct(areaParts[0]));

            areaParts[0] = largeNum(cutHeight).produce(widthVal);
            areaParts[1] = ((heightVal - cutHeight) / 2) * widthVal;
            areaParts[2] = largeNum(heightVal).produce(widthVal).deduct(areaParts[0].append(areaParts[1]));

            areaParts.sort((valA, valB) => valA.evaluateTo(valB));
            minDifference = Math.min(minDifference, areaParts[2].deduct(areaParts[0]));
        }

        let temporaryDimension = heightVal;
        heightVal = widthVal;
        widthVal = temporaryDimension;
    }

    console.log(minDifference.toText());
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));