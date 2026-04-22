/*
 * Utility Functions Listing
 *
 * ConvertArrayToMatrix(sourceMatrix): Transforms a 1D array of strings into a 2D character matrix.
 * ComputePrimeFactors(targetVal): Returns an object containing prime factors and their counts.
 * CalculateGreatestCommonDivisor(numA, numB): Computes the greatest common divisor of two numbers.
 * DetermineLeastCommonMultiple(valA, valB): Calculates the least common multiple of two numbers.
 * CompareForSorting(valX, valY): Returns the difference for sorting purposes.
 * CheckForPrimality(candidateNum): Determines if a number is prime.
 * IsNumericString(inputStr): Checks if a string represents a valid non-negative integer.
 * SumArrayElements(dataArr): Calculates the sum of all elements in a numeric array.
 * BinarySearchClosestLeft(sortedArr, targetVal): Finds the index of the largest element less than or equal to targetVal.
 * SplitInputByNewline(rawTxt): Divides a string into an array of lines using newline as delimiter.
 */
const verboseSetting = Boolean(0);
const limitVal = Number.MAX_SAFE_INTEGER;
const divisorVal = 1000000007;

let globalParsedNumericInputLine; // This variable will store the first parsed numeric input line for functions like CalculateLexicographicalRank

function ExecuteProgram(dataStream) {
    dataStream = dataStream.split("\n");
    var configParams = dataStream[0].split(" ").map(Number);
    globalParsedNumericInputLine = configParams; // Assign to the global variable for other functions
    var tokenList = dataStream[1].split(" ").map(String);
    var itemCounts = {};
    tokenList.forEach(function(currentElement) {
        if (itemCounts[currentElement]) {
            itemCounts[currentElement]++;
        } else {
            itemCounts[currentElement] = 1;
        }
    });
    var frequencyList = [];
    Object.keys(itemCounts).forEach(function(elementKey) {
        frequencyList.push(itemCounts[elementKey]);
    });
    frequencyList = frequencyList.sort(function(firstNum, secondNum) {
        return firstNum - secondNum;
    });
    if (frequencyList.length <= configParams[1]) {
        console.log(0);
    } else {
        var totalValue = 0;
        for (var idx = 0; idx < frequencyList.length - configParams[1]; idx++) {
            totalValue += frequencyList[idx];
        }
        console.log(totalValue);
    }
}
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function CalculateLexicographicalRank(inputSequence) {
    var availableDigits = [];
    for (var indexVar = 0; indexVar < globalParsedNumericInputLine[0]; indexVar++) {
        availableDigits.push(indexVar + 1);
    }
    var rankAccumulator = 0;
    for (var indexVar = 0; indexVar < inputSequence.length; indexVar++) {
        var foundIndex = availableDigits.findIndex(digitValue => digitValue == inputSequence[indexVar]);
        rankAccumulator += ComputeFactorial(inputSequence.length - 1 - indexVar) * foundIndex;
        availableDigits.splice(foundIndex, 1);
    }
    return rankAccumulator;
}

function SumArrayElements(numericArray) {
    let totalSum = 0.0;
    for (var loopCounter = 0, arrayLength = numericArray.length; loopCounter < arrayLength; ++loopCounter) {
        totalSum += numericArray[loopCounter] - 0;
    };
    return totalSum;
}

function LogVerbose(messageContent) {
    if (verboseSetting === true) {
        console.log(messageContent);
    }
}

function GetMaxElementIndex(dataCollection) {
    var highestValue = Number.MIN_SAFE_INTEGER;
    var peakIndex = -1;
    for (var iterator = 0; iterator < dataCollection.length; iterator++) {
        if (highestValue < dataCollection[iterator]) {
            highestValue = dataCollection[iterator];
            peakIndex = iterator;
        }
    }
    return peakIndex;
}

function GetMinElementIndex(valueSet) {
    var lowestValue = Number.MAX_SAFE_INTEGER;
    var troughIndex = -1;
    for (var counterVar = 0; counterVar < valueSet.length; counterVar++) {
        if (lowestValue > valueSet[counterVar]) {
            lowestValue = valueSet[counterVar];
            troughIndex = counterVar;
        }
    }
    return troughIndex;
}

function ConvertArrayToMatrix(sourceArray) {
    for (var rowIterator = 0; rowIterator < sourceArray.length; rowIterator++) {
        sourceArray[rowIterator] = sourceArray[rowIterator].split("");
    }
    return sourceArray;
}

function CheckForPrimality(testNumber) {
    if (!Number.isInteger(testNumber)) {
        return false;
    }
    if (testNumber <= 1) {
        return false;
    }
    if (2 === testNumber) {
        return true;
    }
    if (0 === testNumber % 2) {
        return false;
    }
    var rootInteger = Math.floor(Math.sqrt(testNumber));
    for (var divisorCandidate = 3; divisorCandidate <= rootInteger; divisorCandidate += 2) {
        if (0 === testNumber % divisorCandidate) {
            return false;
        }
    }
    return true;
}

function IsNumericString(inputStr) {
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(inputStr);
}

function ComputeFactorial(inputNumber) {
    if (inputNumber === 0) {
        return 1;
    }
    return inputNumber * ComputeFactorial(inputNumber - 1);
}

function RotateMatrix90Deg(sourceMatrix) {
    const originalRows = sourceMatrix.length;
    const originalCols = sourceMatrix[0].length;
    const lastRowIndex = originalRows - 1;
    var rotatedMatrix = new Array(originalCols);
    for (var colIdx = 0; colIdx < originalCols; colIdx++) {
        rotatedMatrix[colIdx] = new Array(originalRows);
        for (var rowIdx = 0; rowIdx < originalRows; rowIdx++) {
            rotatedMatrix[colIdx][rowIdx] = sourceMatrix[lastRowIndex - rowIdx][colIdx];
        }
    }
    return rotatedMatrix;
}

function InsertPartialArray(targetArray, segmentToInsert, startIndex) {
    for (var baseIndex = startIndex, segmentIndex = 0; segmentIndex < segmentToInsert.length; baseIndex++, segmentIndex++) {
        targetArray[baseIndex] = segmentToInsert[segmentIndex];
    }
    return targetArray;
}

function ReverseArraySegment(workingArray, segmentStart, segmentEnd) {
    var extractedSegment = workingArray.slice(segmentStart - 1, segmentEnd);
    extractedSegment.reverse();
    workingArray = InsertPartialArray(workingArray, extractedSegment, segmentStart - 1);
    return workingArray;
}

function PadNumberWithZeros(inputVal, desiredLength) {
    return (inputVal + '000000000000000000000000000000000').slice(0, desiredLength);
}

// This is a duplicate of SumArrayElements function, keeping it as per clone definition.
function SumArrayElementsDuplicate(dataArr) {
    var totalSum = 0.0;
    for (var loopCounter = 0, arrayLength = dataArr.length; loopCounter < arrayLength; ++loopCounter) {
        totalSum += dataArr[loopCounter] - 0;
    };
    return totalSum;
}

function ComputePrimeFactors(targetValue) {
    var factorMap = {};

    if (targetValue === 1) {
        return {
            "1": 1
        };
    }

    var currentDivisorStart = 2;

    while (targetValue !== 1) {
        var potentialFactor = currentDivisorStart;
        while (potentialFactor < Number.MAX_SAFE_INTEGER) {
            if (targetValue % potentialFactor === 0) {
                targetValue /= potentialFactor;
                if (!(factorMap[potentialFactor] > 0)) {
                    factorMap[potentialFactor] = 0;
                }
                factorMap[potentialFactor]++;
                break;
            }
            potentialFactor++;
        }
        currentDivisorStart = potentialFactor;
    }
    return factorMap;
}

function CalculateGreatestCommonDivisor(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return CalculateGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

function DetermineLeastCommonMultiple(valOne, valTwo) {
    var gcdHelper = (paramA, paramB) => paramB ? gcdHelper(paramB, paramA % paramB) : paramA;
    return (valOne * valTwo) / gcdHelper(valOne, valTwo);
}

function CompareForSorting(itemX, itemY) {
    return itemX - itemY;
}

function BinarySearchClosestLeft(sortedArray, targetValue) {
    var resultIndex = -1;

    // Lower boundary for search
    var lowerBound = 0;

    // Upper boundary for search
    var upperBound = sortedArray.length - 1;

    // Continue search while boundaries are valid
    while (lowerBound <= upperBound) {

        // Middle point of current search range
        let midPoint = Math.floor((lowerBound + upperBound) / 2);

        // Compare middle value with target
        if (sortedArray[midPoint] === targetValue) {
            // Match found, record index and exit
            resultIndex = midPoint;
            break;
        } else if (sortedArray[midPoint] < targetValue) {
            // Target is greater, search right half
            lowerBound = midPoint + 1;
        } else {
            // Target is smaller, search left half
            upperBound = midPoint - 1;
        }
    }
    if (resultIndex !== -1) {
        return resultIndex;
    } else {
        return lowerBound;
    }
}

function SplitInputByNewline(rawData) {
    return rawData.split("\n");
}

function CheckIfSorted(sequenceToCheck) {
    var isOrdered = true;
    for (var currentPos = 1; currentPos < sequenceToCheck.length; currentPos++) {
        if (sequenceToCheck[currentPos - 1] > sequenceToCheck[currentPos]) {
            isOrdered = false;
            break;
        }
    }
    return isOrdered;
}

function DecomposeIntoPrimeFactors(numberToFactor) {

    // Store integer part of square root
    var sqrtOfNumber = Math.floor(Math.sqrt(numberToFactor));

    var exponentCount = 0;

    var factorizationOutput = {};

    // Find prime factors from 2 up to the square root
    for (var factorCandidate = 2; factorCandidate <= sqrtOfNumber; factorCandidate++) {

        if ((numberToFactor % factorCandidate) === 0) {

            exponentCount = 0; // Reset exponent counter

            do {

                exponentCount++; // Increment exponent

                numberToFactor = numberToFactor / factorCandidate;

            } while ((numberToFactor % factorCandidate) === 0);

            // Save prime factor with its exponent
            factorizationOutput[factorCandidate] = exponentCount;

        }

    }

    // Add any remaining prime number (if > sqrt)
    if (numberToFactor > sqrtOfNumber) {
        factorizationOutput[numberToFactor] = 1;
    }

    return factorizationOutput;

}