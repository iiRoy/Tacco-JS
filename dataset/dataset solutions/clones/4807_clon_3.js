const isDebugActive = false;
const MAX_SAFE_INT_VAL = Number.MAX_SAFE_INTEGER;

function processInputData(rawInputString) {
    const lines = rawInputString.split("\n");
    
    const initialValuesLine = lines[1];
    const initialValuesArray = initialValuesLine.split(" ").map(Number);
    let runningSum = calculateArraySum(initialValuesArray);
    
    const operationLines = lines.slice(3); 

    for (const currentLine of operationLines) {
        const operationDetails = currentLine.split(" ").map(Number);
        
        const targetIndex = operationDetails[0] - 1;
        const newValue = operationDetails[1];

        const oldValue = initialValuesArray[targetIndex];
        const intermediateSum = runningSum - oldValue;
        const finalResult = intermediateSum + newValue;
        
        console.log(finalResult);
    }
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculateLexicographicalRank(inputArray) { // zisyozyunn - kept as is, but renamed
  var arr = [];
  for(var i=0;i<inputArray[0];i++){ // Note: inputArray[0] is used here, which is problematic if inputArray is not the global 'input'
    arr.push(i+1);
  }
  var sum = 0;
  for(i=0;i<inputArray.length;i++){
    var f = arr.findIndex(val => val==inputArray[i]);
    sum += computeFactorial(inputArray.length-1-i)*f; // Using renamed factorial
    arr.splice(f,1);
  }
  return sum;
}

function calculateArraySum(numericArray) {
    let totalAccumulator = 0;
    const arrayLength = numericArray.length;
    for (let i = 0; i < arrayLength; ++i) {
        totalAccumulator += numericArray[i];
    }
    return totalAccumulator;
}

function logDebugMessage(messageContent) {
    if (isDebugActive === true) {
        console.log(messageContent);
    }
}

function findMaxIndex(dataArray) {
    let maximumValue = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;
    const currentLength = dataArray.length;
    for (let i = 0; i < currentLength; ++i) {
        const currentValue = dataArray[i];
        if (maximumValue < currentValue) {
            maximumValue = currentValue;
            maxIndex = i;
        }
    }
    return maxIndex;
}

function findMinIndex(dataArray) {
    let minimumValue = Number.MAX_SAFE_INTEGER;
    let minIndex = -1;
    const currentLength = dataArray.length;
    for (let i = 0; i < currentLength; ++i) {
        const currentValue = dataArray[i];
        if (minimumValue > currentValue) {
            minimumValue = currentValue;
            minIndex = i;
        }
    }
    return minIndex;
}

function splitStringArrayTo2D(inputStringArray) {
    const result2DArray = [];
    for (let i = 0; i < inputStringArray.length; ++i) {
        result2DArray.push(inputStringArray[i].split(""));
    }
    return result2DArray;
}

function checkPrimality(candidateNumber) {
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
    for (let i = 3; i <= limit; i += 2) {
        if (candidateNumber % i === 0) {
            return false;
        }
    }
    return true;
}

function isNumericString(valueToCheck) {
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(valueToCheck);
}

function computeFactorial(inputNumber) {
    if (inputNumber === 0) {
        return 1;
    }
    let result = 1;
    for (let i = 1; i <= inputNumber; ++i) {
        result *= i;
    }
    return result;
}

function splitAndMapToNumbers2D(inputStringArray) {
    const mapped2DArray = [];
    for (let i = 0; i < inputStringArray.length; ++i) {
        mapped2DArray.push(inputStringArray[i].split(" ").map(Number));
    }
    return mapped2DArray;
}

function rotateMatrix(originalMatrix) {
    const numRows = originalMatrix.length;
    const numCols = originalMatrix[0].length;
    
    const lastRowIndex = numRows - 1;
    
    const rotatedMatrix = new Array(numCols);
    for (let c = 0; c < numCols; ++c) {
        rotatedMatrix[c] = new Array(numRows);
        for (let r = 0; r < numRows; ++r) {
            rotatedMatrix[c][r] = originalMatrix[lastRowIndex - r][c];
        }
    }
    return rotatedMatrix;
}

function insertPartialArray(baseArray, elementsToPush, startIndex) {
    const pushLength = elementsToPush.length;
    for (let p = 0; p < pushLength; ++p) {
        baseArray[startIndex + p] = elementsToPush[p];
    }
    return baseArray;
}

function reversePartialArray(targetArray, startPosition, endPosition) {
    const subArrayToReverse = targetArray.slice(startPosition - 1, endPosition);
    subArrayToReverse.reverse();
    
    const modifiedArray = insertPartialArray(targetArray, subArrayToReverse, startPosition - 1);
    return modifiedArray;
}

function padNumberWithZeros(numberToPad, desiredLength) {
    const stringifiedNum = String(numberToPad);
    const paddingString = '0'.repeat(desiredLength);
    return (stringifiedNum + paddingString).slice(0, desiredLength);
}

function primeFactorize(inputNumber) {
    const primeFactors = {};

    if (inputNumber === 1) {
        return { "1": 1 };
    }

    let currentDivisor = 2;
    let tempNumber = inputNumber;

    while (tempNumber !== 1) {
        let divisorCandidate = currentDivisor;
        while (true) {
            if (tempNumber % divisorCandidate === 0) {
                tempNumber /= divisorCandidate;
                primeFactors[divisorCandidate] = (primeFactors[divisorCandidate] || 0) + 1;
                currentDivisor = divisorCandidate;
                break;
            }
            divisorCandidate++;
        }
    }
    return primeFactors;
}

function greatestCommonDivisor(valA, valB) {
    if (valB === 0) {
        return valA;
    }
    return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(valA, valB) {
    const calculateGCD = (n, m) => m ? calculateGCD(m, n % m) : n;
    return (valA * valB) / calculateGCD(valA, valB);
}

function compareNumbersForSort(numA, numB) {
  return numA - numB;
}

function binarySearchClosestIndex(sortedArray, targetValue) {
    let foundIndex = -1;

    let leftPointer = 0;
    let rightPointer = sortedArray.length - 1;

    while (leftPointer <= rightPointer) {
        const middleIndex = Math.floor((leftPointer + rightPointer) / 2);
        const middleValue = sortedArray[middleIndex];

        if (middleValue === targetValue) {
            foundIndex = middleIndex;
            break;
        } else if (middleValue < targetValue) {
            leftPointer = middleIndex + 1;
        } else {
            rightPointer = middleIndex - 1;
        }
    }
    
    return foundIndex !== -1 ? foundIndex : leftPointer;
}

function splitByNewline(inputString) {
  return inputString.split("\n");
}

function isArraySorted(inputArray) {
  let sortedFlag = true;
  const arrayLength = inputArray.length;
  for (let i = 1; i < arrayLength; ++i) {
    if (inputArray[i - 1] > inputArray[i]) {
      sortedFlag = false;
      break;
    }
  }
  return sortedFlag;
}
