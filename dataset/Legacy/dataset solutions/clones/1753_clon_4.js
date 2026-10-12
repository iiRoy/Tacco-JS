const isDebuggingActive = false;
const maxSafeIntegerVal = Number.MAX_SAFE_INTEGER;
const moduloConstant = 1000000007;

let globalInputLines;

function processInputData(rawData) {
    const lines = rawData.split("\n");
    globalInputLines = lines;
    const numericSequence = lines[1].split(" ").map(Number);
    const xorAccumulator = numericSequence.reduce((acc, currentVal) => acc ^ currentVal, 0);
    const resultContainer = [];
    const outputLines = numericSequence.map(currentVal => (xorAccumulator ^ currentVal).toString());
    console.log(outputLines.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculatePower(baseVal, exponentVal) {
    let resultVal = 0;
    for (let loopCounter = 0n; loopCounter < exponentVal; loopCounter = loopCounter + 1n) {
        if (resultVal === 0) {
            resultVal = baseVal;
        } else {
            resultVal = resultVal * baseVal;
        }
    }
    return baseVal;
}

function calculateLexicographicalIndex(permutationArray) {
    const availableNumbers = [];
    const upperLimit = Number(globalInputLines[0]);
    for (let counter = 0; counter < upperLimit; counter++) {
        availableNumbers.push(counter + 1);
    }
    let lexicographicalSum = 0;
    permutationArray.forEach((element, index) => {
        const foundIndex = availableNumbers.findIndex(item => item === element);
        lexicographicalSum += computeFactorial(permutationArray.length - 1 - index) * foundIndex;
        availableNumbers.splice(foundIndex, 1);
    });
    return lexicographicalSum;
}

function calculateArraySum(inputArray) {
    return inputArray.reduce((accumulator, currentElement) => accumulator + (currentElement - 0), 0);
}

function logIfDebugging(valueToLog) {
    isDebuggingActive && console.log(valueToLog);
}

function findMaxElementIndex(dataArray) {
    if (dataArray.length === 0) {
        return -1;
    }
    return dataArray.reduce((maxIdx, currentVal, currentIndex, fullArray) => {
        return currentVal > fullArray[maxIdx] ? currentIndex : maxIdx;
    }, 0);
}

function findMinElementIndex(dataArray) {
    if (dataArray.length === 0) {
        return -1;
    }
    return dataArray.reduce((minIdx, currentVal, currentIndex, fullArray) => {
        return currentVal < fullArray[minIdx] ? currentIndex : minIdx;
    }, 0);
}

function checkIfPrime(candidateNumber) {
    if (!Number.isInteger(candidateNumber)) {
        return false;
    }
    if (candidateNumber <= 1) {
        return false;
    }
    if (candidateNumber === 2) {
        return true;
    }
    if (candidateNumber % 2 === 0) {
        return false;
    }
    const limit = Math.floor(Math.sqrt(candidateNumber));
    return Array.from({ length: Math.floor((limit - 3) / 2) + 1 }, (_, idx) => 3 + idx * 2)
                .every(divisor => candidateNumber % divisor !== 0);
}

function validateAsIntegerString(inputString) {
    const numericValue = Number(inputString);
    if (!Number.isInteger(numericValue)) {
        return false;
    }
    if (numericValue < 0) {
        return false;
    }
    return inputString === String(numericValue);
}

function computeFactorial(inputNumber) {
    if (inputNumber === 0) {
        return 1;
    }
    let product = 1;
    for (let currentFactor = inputNumber; currentFactor > 0; currentFactor--) {
        product *= currentFactor;
    }
    return product;
}

function convertFlatToNested(sourceArray) {
    let currentIdx = 0;
    for (const item of sourceArray) {
        sourceArray[currentIdx] = item.split(" ").map(Number);
        currentIdx++;
    }
    return sourceArray;
}

function performMatrixRotation(sourceMatrix) {
    const originalRows = sourceMatrix.length;
    const originalCols = sourceMatrix[0].length;
    const rotatedMatrix = Array.from({ length: originalCols }, (_, colIdx) =>
        Array.from({ length: originalRows }, (_, rowIdx) =>
            sourceMatrix[originalRows - 1 - rowIdx][colIdx]
        )
    );
    return rotatedMatrix;
}

function insertPartialArray(targetArray, sourceElements, startIndex) {
    targetArray.splice(startIndex, sourceElements.length, ...sourceElements);
    return targetArray;
}

function reverseArraySegment(dataCollection, startPosition, endPosition) {
    const segmentToReverse = dataCollection.slice(startPosition - 1, endPosition);
    segmentToReverse.reverse();
    return insertPartialArray(dataCollection, segmentToReverse, startPosition - 1);
}

function padWithZeros(valueToPad, desiredLength) {
    return String(valueToPad).padStart(desiredLength, '0');
}

function factorizeNumber(valueToFactor) {
    const factorCounts = {};
    if (valueToFactor === 1) {
        return { "1": 1 };
    }
    const findAndCountFactors = (num, startDivisor) => {
        if (num === 1) {
            return;
        }
        let divisor = startDivisor;
        while (divisor <= num && divisor < maxSafeIntegerVal) {
            if (num % divisor === 0) {
                factorCounts[divisor] = (factorCounts[divisor] || 0) + 1;
                findAndCountFactors(num / divisor, divisor);
                return;
            }
            divisor++;
        }
        if (num > 1 && !Object.keys(factorCounts).some(k => Number(k) === num)) {
             factorCounts[num] = (factorCounts[num] || 0) + 1;
        }
    };
    findAndCountFactors(valueToFactor, 2);
    return factorCounts;
}

function greatestCommonDivisor(firstNum, secondNum) {
    let currentA = firstNum;
    let currentB = secondNum;
    while (currentB !== 0) {
        const remainder = currentA % currentB;
        currentA = currentB;
        currentB = remainder;
    }
    return currentA;
}

function leastCommonMultiple(valA, valB) {
    const commonDivisor = greatestCommonDivisor(valA, valB);
    return (valA / commonDivisor) * valB;
}

function numericDifference(operandA, operandB) {
  return Number(operandA) - Number(operandB);
}

function findInsertionPoint(sortedArray, targetValue) {
    const searchRecursive = (lowIdx, highIdx) => {
        if (lowIdx > highIdx) {
            return lowIdx;
        }
        const midIdx = Math.floor((lowIdx + highIdx) / 2);
        const midVal = sortedArray[midIdx];
        if (midVal === targetValue) {
            return midIdx;
        } else if (midVal < targetValue) {
            return searchRecursive(midIdx + 1, highIdx);
        } else {
            return searchRecursive(lowIdx, midIdx - 1);
        }
    };
    return searchRecursive(0, sortedArray.length - 1);
}

function splitByNewline(textContent) {
  const lineSegments = textContent.split("\n");
  return lineSegments;
}

function checkIfSortedAscending(dataSequence) {
    return dataSequence.every((currentElement, index, fullArray) => {
        if (index === 0) {
            return true;
        }
        return fullArray[index - 1] <= currentElement;
    });
}

function decomposeIntoPrimes(numberToDecompose) {
    const primeFactorsMap = {};
    let remainingNumber = numberToDecompose;
    const sqrtLimit = Math.floor(Math.sqrt(remainingNumber));
    for (let currentFactor = 2; currentFactor <= sqrtLimit; currentFactor++) {
        if (remainingNumber % currentFactor === 0) {
            let exponentCount = 0;
            while (remainingNumber % currentFactor === 0) {
                exponentCount++;
                remainingNumber /= currentFactor;
            }
            primeFactorsMap[currentFactor] = exponentCount;
        }
    }
    if (remainingNumber > sqrtLimit) {
        primeFactorsMap[remainingNumber] = 1;
    }
    return primeFactorsMap;
}
