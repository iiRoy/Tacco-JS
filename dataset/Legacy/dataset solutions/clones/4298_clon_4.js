const _dbgFlag = false;
const _maxInt = Number.MAX_SAFE_INTEGER;
const _moduloVal = 1000000007;

function ProcessGrid(inputData) {
    const inputLines = inputData.split("\n");
    const [gridHeight, gridWidth] = inputLines.shift().split(" ").map(Number);
    const initialCellMatrix = inputLines.map(line => Array.from(line));

    const neighborOffsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    const getCellContent = (r, c, matrix, boundaryChar) => {
        if (r >= 0 && r < gridHeight && c >= 0 && c < gridWidth) {
            return matrix[r][c];
        }
        return boundaryChar;
    };

    const transformedMatrix = Array.from({ length: gridHeight }, (_, rowIdx) =>
        Array.from({ length: gridWidth }, (_, colIdx) => {
            const currentCell = initialCellMatrix[rowIdx][colIdx];

            if (currentCell === '.') {
                const hashNeighborCount = neighborOffsets.reduce((count, [dr, dc]) => {
                    const adjacentCell = getCellContent(rowIdx + dr, colIdx + dc, initialCellMatrix, '^');
                    return count + (adjacentCell === '#' ? 1 : 0);
                }, 0);
                return hashNeighborCount;
            }
            return currentCell;
        })
    );

    const outputResult = transformedMatrix.map(row => row.join("")).join("\n");
    console.log(outputResult);
}

ProcessGrid(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());

function calculatePermutationRank(permutationArray) {
    const totalElementsCount = permutationArray.length;
    const availableElements = Array.from({ length: totalElementsCount }, (_, i) => i + 1);
    let permutationRank = 0;

    for (let i = 0; i < permutationArray.length; i++) {
        const currentElement = permutationArray[i];
        const elementIndexInAvailable = availableElements.indexOf(currentElement);
        
        permutationRank += computeFactorial(permutationArray.length - 1 - i) * elementIndexInAvailable;
        availableElements.splice(elementIndexInAvailable, 1);
    }
    return permutationRank;
}

function calculateArraySum(numericArray) {
    return numericArray.reduce((total, currentVal) => total + (Number(currentVal) || 0), 0);
}

function logIfDebug(message) {
    _dbgFlag && console.log(message);
}

function findMaxElementIndex(dataCollection) {
    return dataCollection.reduce((maxInfo, currentVal, currentIdx) => {
        if (currentVal > maxInfo.value) {
            return { value: currentVal, index: currentIdx };
        }
        return maxInfo;
    }, { value: Number.MIN_SAFE_INTEGER, index: -1 }).index;
}

function findMinElementIndex(dataCollection) {
    return dataCollection.reduce((minInfo, currentVal, currentIdx) => {
        if (currentVal < minInfo.value) {
            return { value: currentVal, index: currentIdx };
        }
        return minInfo;
    }, { value: Number.MAX_SAFE_INTEGER, index: -1 }).index;
}

function convert1dTo2dCharMatrix(stringArray) {
    return stringArray.map(str => Array.from(str));
}

function checkPrimality(candidateNum) {
    if (!Number.isInteger(candidateNum) || candidateNum <= 1) {
        return false;
    }
    if (candidateNum === 2) {
        return true;
    }
    if (candidateNum % 2 === 0) {
        return false;
    }
    for (let divisor = 3; divisor * divisor <= candidateNum; divisor += 2) {
        if (candidateNum % divisor === 0) {
            return false;
        }
    }
    return true;
}

function validateNumericString(inputStr) {
    const parsedNum = Number(inputStr);
    return Number.isInteger(parsedNum) && String(parsedNum) === String(inputStr);
}

function computeFactorial(val) {
    if (val < 0) return NaN;
    if (val === 0 || val === 1) return 1;
    let product = 1;
    for (let i = 2; i <= val; i++) {
        product *= i;
    }
    return product;
}

function rotateMatrixClockwise(originalMatrix) {
    if (!originalMatrix || originalMatrix.length === 0 || originalMatrix[0].length === 0) {
        return [];
    }
    const numRows = originalMatrix.length;
    const numCols = originalMatrix[0].length;

    const rotated = Array.from({ length: numCols }, () => Array(numRows).fill(undefined));

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            rotated[c][numRows - 1 - r] = originalMatrix[r][c];
        }
    }
    return rotated;
}

function insertSegmentIntoArray(baseArray, segmentToInsert, startIndex) {
    return [
        ...baseArray.slice(0, startIndex),
        ...segmentToInsert,
        ...baseArray.slice(startIndex + segmentToInsert.length)
    ];
}

function reverseArraySegment(targetArray, startOneBased, endOneBased) {
    const actualStart = startOneBased - 1;
    const actualEnd = endOneBased;

    const prefix = targetArray.slice(0, actualStart);
    const segment = targetArray.slice(actualStart, actualEnd);
    const suffix = targetArray.slice(actualEnd);

    return [...prefix, ...segment.reverse(), ...suffix];
}

function padNumberWithZeros(value, desiredLength) {
    return String(value).padStart(desiredLength, '0');
}

function getPrimeFactors(numberToFactor) {
    const factorsMap = new Map();
    let tempNum = numberToFactor;

    if (tempNum === 1) {
        return { "1": 1 };
    }

    while (tempNum % 2 === 0) {
        factorsMap.set(2, (factorsMap.get(2) || 0) + 1);
        tempNum /= 2;
    }

    for (let i = 3; i * i <= tempNum; i += 2) {
        while (tempNum % i === 0) {
            factorsMap.set(i, (factorsMap.get(i) || 0) + 1);
            tempNum /= i;
        }
    }

    if (tempNum > 1) {
        factorsMap.set(tempNum, (factorsMap.get(tempNum) || 0) + 1);
    }

    const resultObject = {};
    for (const [key, value] of factorsMap.entries()) {
        resultObject[key] = value;
    }
    return resultObject;
}

function computeGreatestCommonDivisor(valA, valB) {
    while (valB !== 0) {
        const remainder = valA % valB;
        valA = valB;
        valB = remainder;
    }
    return valA;
}

function computeLeastCommonMultiple(valA, valB) {
    if (valA === 0 || valB === 0) return 0;
    return Math.abs(valA * valB) / computeGreatestCommonDivisor(valA, valB);
}

const compareNumbers = (valA, valB) => valA - valB;

function findSortedPosition(sortedArray, targetValue) {
    function searchRecursive(low, high) {
        if (low > high) {
            return low;
        }
        const mid = Math.floor((low + high) / 2);
        if (sortedArray[mid] === targetValue) {
            return mid;
        } else if (sortedArray[mid] < targetValue) {
            return searchRecursive(mid + 1, high);
        } else {
            return searchRecursive(low, mid - 1);
        }
    }
    return searchRecursive(0, sortedArray.length - 1);
}

const splitByNewline = (textInput) => textInput.split("\n");

function checkArraySorted(dataSequence) {
    return dataSequence.every((val, idx, arr) => idx === 0 || val >= arr[idx - 1]);
}

function obtainPrimeFactorsMap(value) {
    const factorCounts = new Map();
    let remainingValue = value;

    if (remainingValue === 1) {
        return { "1": 1 };
    }

    while (remainingValue % 2 === 0) {
        factorCounts.set(2, (factorCounts.get(2) || 0) + 1);
        remainingValue /= 2;
    }

    for (let i = 3; i * i <= remainingValue; i += 2) {
        while (remainingValue % i === 0) {
            factorCounts.set(i, (factorCounts.get(i) || 0) + 1);
            remainingValue /= i;
        }
    }

    if (remainingValue > 1) {
        factorCounts.set(remainingValue, (factorCounts.get(remainingValue) || 0) + 1);
    }

    const resultObj = {};
    for (const [factor, count] of factorCounts.entries()) {
        resultObj[factor] = count;
    }
    return resultObj;
}
