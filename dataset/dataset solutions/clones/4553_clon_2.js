// This file contains a collection of utility functions written in JavaScript.
//
// Function List:
//  - transform1DTo2D(sourceData): Converts a single-dimensional array into a two-dimensional array.
//  - factorizeNumber(inputNum): Returns an object representing the prime factorization of a number.
//  - greatestCommonDivisor(num1, num2): Computes the greatest common divisor of two integers.
//  - leastCommonMultiple(num1, num2): Calculates the least common multiple of two integers.
//  - numericDifference(val1, val2): Returns the difference (val1 - val2) for sorting purposes.
//  - checkPrimeStatus(testNum): Determines if a given number is prime.
//  - isValidNumericString(strVal): Checks if a string represents a valid non-negative integer.
//  - calculateArrayTotal(dataArr): Sums all elements within an array.
//  - binarySearchLargestLessThanOrEqual(sortedArr, target): Finds the index of the largest element less than or equal to the target.
//  - splitByNewline(textInput): Splits a string by newline characters.
//  - rotateMatrix(matrix): Rotates a 2D matrix 90 degrees clockwise.
//  - computeFactorial(n): Calculates the factorial of a number.
//  - lexicographicalRank(arr): Computes the lexicographical rank of a permutation.
//  - findMaximumIndex(arr): Returns the index of the maximum element in an array.
//  - findMinimumIndex(arr): Returns the index of the minimum element in an array.
//  - logIfEnabled(msg): Logs a message to the console if verbose mode is active.
//  - padWithZeros(val, len): Pads a number with leading zeros to a specified length.
//  - insertPartialArray(baseArr, items, start): Inserts elements into an array starting at a specific index.
//  - reverseSubsegment(mainArr, begin, end): Reverses a subsegment of an array.
//  - isCollectionSorted(data): Checks if an array is sorted in ascending order.
//  - decomposeIntoPrimes(numberVal): Another prime factorization utility (similar to factorizeNumber).
//  - computePower(base, exponent): Calculates base raised to the power of exponent.
//
const verboseFlag = false; // Flag to enable or disable detailed logging.
const maxVal = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer value.
const divisor = 1000000007; // A common modulo value used in calculations.
function ExecuteProgram(rawData)
{
    // Process the raw input string, splitting by spaces and converting to BigInt.
    rawData = rawData.split(" ").map(BigInt);
    let countVal = rawData[0]; // First element of the processed input.
    let firstOperand = rawData[1]; // Second element, used as a primary operand.
    let secondOperand = rawData[2]; // Third element, used as a secondary operand.

    if (firstOperand === secondOperand) {
        // If operands are equal, output 1.
        console.log(1);
    }
    else if (firstOperand > secondOperand || countVal === 1n)
    {
        // If first operand is greater or count is 1, output 0.
        console.log(0);
    }
    else
    {
        // Otherwise, perform a specific BigInt arithmetic operation and output its string representation.
        console.log((((countVal - 1n) * secondOperand + firstOperand) - ((countVal - 1n) * firstOperand + secondOperand) + 1n).toString());
    }
}
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function computePower(baseNum, exponentNum)
{
    let resultVal = 0; // Initialize the result.
    for (let currentExp = 0n; currentExp < exponentNum; currentExp += 1n)
    {
        if (resultVal === 0)
        {
            resultVal = baseNum; // First iteration, set result to base.
        }
        else
        {
            resultVal *= baseNum; // Multiply by base for subsequent iterations.
        }
    }
    return baseNum; // Note: Original function had a bug, returning 'baseNum' instead of 'resultVal'. Preserving the bug.
}

function lexicographicalRank(inputPermutation)
{
    let sequenceItems = []; // Array to hold sequence numbers.
    // This function implicitly accesses 'rawData' from the global/outer scope,
    // which was defined in the 'ExecuteProgram' function's scope.
    // This structural dependency is preserved from the original code.
    for (let k = 0; k < rawData[0]; k++)
    {
        sequenceItems.push(k + 1);
    }
    let totalRank = 0; // Accumulator for the lexicographical rank.
    for (let k = 0; k < inputPermutation.length; k++)
    {
        let foundIndex = sequenceItems.findIndex(item => item === inputPermutation[k]); // Find current item's index.
        totalRank += computeFactorial(inputPermutation.length - 1 - k) * foundIndex; // Add to rank.
        sequenceItems.splice(foundIndex, 1); // Remove the item from available sequence.
    }
    return totalRank; // Return the calculated rank.
}

function calculateArrayTotal(inputArray)
{
    let totalSum = 0; // Variable to store the sum.
    for (let i = 0, arrayLength = inputArray.length; i < arrayLength; ++i)
    {
        totalSum += inputArray[i] - 0; // Sum each element, converting to number explicitly.
    }
    return totalSum; // Return the computed sum.
}

function logIfEnabled(messageContent)
{
    if (verboseFlag === true)
    {
        console.log(messageContent); // Log message only if verbose flag is true.
    }
}

function findMaximumIndex(dataCollection)
{
    let currentMax = Number.MIN_SAFE_INTEGER; // Initialize max with smallest possible safe integer.
    let maxPosition = -1; // Initialize index to -1.
    for (let i = 0; i < dataCollection.length; i++)
    {
        if (currentMax < dataCollection[i])
        {
            currentMax = dataCollection[i]; // Update max value.
            maxPosition = i; // Update max index.
        }
    }
    return maxPosition; // Return the index of the maximum element.
}

function findMinimumIndex(dataCollection)
{
    let currentMin = Number.MAX_SAFE_INTEGER; // Initialize min with largest possible safe integer.
    let minPosition = -1; // Initialize index to -1.
    for (let i = 0; i < dataCollection.length; i++)
    {
        if (currentMin > dataCollection[i])
        {
            currentMin = dataCollection[i]; // Update min value.
            minPosition = i; // Update min index.
        }
    }
    return minPosition; // Return the index of the minimum element.
}

function checkPrimeStatus(testNumber)
{
    // Ensure the input is an integer.
    if (false === Number.isInteger(testNumber))
    {
        return false;
    }
    // Numbers less than or equal to 1 are not prime.
    if (testNumber <= 1)
    {
        return false;
    }
    // 2 is the only even prime number.
    if (2 === testNumber)
    {
        return true;
    }
    // Any other even number is not prime.
    if (0 === testNumber % 2)
    {
        return false;
    }
    // Check for divisibility by odd numbers up to the square root.
    let rootValue = Math.floor(Math.sqrt(testNumber));
    for (let i = 3; i <= rootValue; i += 2)
    {
        if (0 === testNumber % i)
        {
            return false; // Found a divisor, so not prime.
        }
    }
    return true; // No divisors found, it's prime.
}

function isValidNumericString(stringValue)
{
    // Regular expression to match non-negative integers (0 or positive integers without leading zeros).
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(stringValue); // Test if the string matches the pattern.
}

function computeFactorial(inputNumber)
{
    if (inputNumber === 0)
    {
        return 1; // Base case: factorial of 0 is 1.
    }
    return inputNumber * computeFactorial(inputNumber - 1); // Recursive step.
}

function transform1DTo2D(flatArray)
{
    for (let i = 0; i < flatArray.length; i++)
    {
        // Split each string element by space and convert parts to numbers.
        flatArray[i] = flatArray[i].split(" ").map(Number);
    }
    return flatArray; // Return the transformed 2D array.
}

function rotateMatrix(originalMatrix)
{
    const matrixRows = originalMatrix.length; // Number of rows in the original matrix.
    const matrixCols = originalMatrix[0].length; // Number of columns in the original matrix.
    const lastRowIndex = matrixRows - 1; // Index of the last row.

    let rotatedMatrix = new Array(matrixCols); // Create a new array for columns of the rotated matrix.
    for (let colIdx = 0; colIdx < matrixCols; colIdx++)
    {
        rotatedMatrix[colIdx] = new Array(matrixRows); // Each column becomes a new row.
        for (let rowIdx = 0; rowIdx < matrixRows; rowIdx++)
        {
            // Perform 90-degree clockwise rotation logic.
            rotatedMatrix[colIdx][rowIdx] = originalMatrix[lastRowIndex - rowIdx][colIdx];
        }
    }
    return rotatedMatrix; // Return the newly rotated matrix.
}

function insertPartialArray(targetArray, elementsToInsert, startIndex)
{
    for (let i = startIndex, pushIndex = 0; pushIndex < elementsToInsert.length; i++, pushIndex++)
    {
        targetArray[i] = elementsToInsert[pushIndex]; // Insert elements sequentially.
    }
    return targetArray; // Return the modified array.
}

function reverseSubsegment(mainArray, startPos, endPos)
{
    // Extract the subsegment to be reversed.
    let segmentToReverse = mainArray.slice(startPos - 1, endPos);
    segmentToReverse.reverse(); // Reverse the extracted segment.
    // Insert the reversed segment back into the main array.
    mainArray = insertPartialArray(mainArray, segmentToReverse, startPos - 1);
    return mainArray; // Return the array with the subsegment reversed.
}

function padWithZeros(valueToPad, desiredLength)
{
    // Concatenate the number with a long string of zeros and then slice to desired length.
    return (valueToPad + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateArraySumTotal(dataArr)
{
    let totalSum = 0; // Initialize sum.
    for (let i = 0, arrayLength = dataArr.length; i < arrayLength; ++i)
    {
        totalSum += dataArr[i] - 0; // Add each element to the sum, ensuring numeric conversion.
    }
    return totalSum; // Return the final sum.
}

function factorizeNumber(targetValue)
{
    let primeFactorsMap = {}; // Object to store prime factors and their counts.

    if (targetValue === 1)
    {
        return { "1": 1 }; // Special case for 1.
    }

    let currentFactor = 2; // Start checking for factors from 2.

    while (targetValue !== 1)
    {
        let factorCandidate = currentFactor;
        while (factorCandidate < Number.MAX_SAFE_INTEGER) // Loop up to max safe integer (effectively infinite for practical prime factorization).
        {
            if (targetValue % factorCandidate === 0)
            {
                targetValue /= factorCandidate; // Divide the number by the found factor.
                if (!(primeFactorsMap[factorCandidate] > 0))
                {
                    primeFactorsMap[factorCandidate] = 0; // Initialize count if not present.
                }
                primeFactorsMap[factorCandidate]++; // Increment count for the factor.
                break; // Move to the next factor for the modified targetValue.
            }
            factorCandidate++; // Try the next potential factor.
        }
        currentFactor = factorCandidate; // Update the starting factor for the next iteration of the outer loop.
    }
    return primeFactorsMap; // Return the map of prime factors.
}

function greatestCommonDivisor(valA, valB)
{
    if (valB === 0)
    {
        return valA; // Base case: GCD(a, 0) is a.
    }
    return greatestCommonDivisor(valB, valA % valB); // Recursive call using Euclidean algorithm.
}

function leastCommonMultiple(valA, valB)
{
    // Helper function to calculate GCD using Euclidean algorithm.
    let gcdFunc = (numX, numY) => numY ? gcdFunc(numY, numX % numY) : numX;
    return valA * valB / gcdFunc(valA, valB); // LCM(a, b) = |a*b| / GCD(a, b).
}

function numericDifference(val1, val2)
{
    return val1 - val2; // Simple difference for sorting.
}

function binarySearchLargestLessThanOrEqual(sortedCollection, targetValue)
{
    let foundPosition = -1; // Initialize the result index.

    // Index representing the left boundary of the search space.
    let leftBound = 0;

    // Index representing the right boundary of the search space.
    let rightBound = sortedCollection.length - 1;

    // Continue searching as long as there is a valid range.
    while (leftBound <= rightBound)
    {
        // Calculate the middle index.
        let midPoint = Math.floor((leftBound + rightBound) / 2);

        // Compare the middle value with the target value.
        if (sortedCollection[midPoint] === targetValue)
        {
            foundPosition = midPoint; // Target found, store index and terminate.
            break;
        }
        else if (sortedCollection[midPoint] < targetValue)
        {
            // If middle value is less than target, target must be in the right half.
            leftBound = midPoint + 1;
        }
        else
        {
            // If middle value is greater than target, target must be in the left half.
            rightBound = midPoint - 1;
        }
    }
    // If an exact match was found, return its index. Otherwise, 'leftBound' will be the index
    // where 'targetValue' would be inserted to maintain order, or the first element
    // greater than 'targetValue'.
    if (foundPosition !== -1)
    {
        return foundPosition;
    }
    else
    {
        return leftBound; // Return the insertion point for 'n' or the next greatest element's index.
    }
}

function splitByNewline(textInput)
{
    return textInput.split("\n"); // Splits the input string by newline characters.
}

function isCollectionSorted(data)
{
    let isOrdered = true; // Assume sorted initially.
    for (let i = 1; i < data.length; i++)
    {
        if (data[i - 1] > data[i])
        {
            isOrdered = false; // Found an out-of-order pair.
            break; // No need to check further.
        }
    }
    return isOrdered; // Return the sorting status.
}

function decomposeIntoPrimes(numberVal)
{
    // Calculate the integer part of the square root.
    let sqrtValue = Math.floor(Math.sqrt(numberVal));

    let exponentCount = 0; // Counter for the exponent of a prime factor.

    let primeFactorsMap = {}; // Object to store prime factors and their powers.

    // Iterate from 2 up to the square root to find prime factors.
    for (let i = 2; i <= sqrtValue; i++)
    {
        if ((numberVal % i) === 0)
        {
            exponentCount = 0; // Reset exponent counter for a new prime factor.

            do
            {
                exponentCount++; // Increment exponent.
                numberVal = numberVal / i; // Divide the number by the factor.
            } while ((numberVal % i) === 0); // Continue as long as it's divisible.

            primeFactorsMap[i] = exponentCount; // Store the prime factor and its exponent.
        }
    }

    // If 'numberVal' is still greater than its original square root,
    // it means the remaining 'numberVal' is a prime factor itself.
    if (numberVal > sqrtValue)
    {
        primeFactorsMap[numberVal] = 1; // Add the remaining prime factor with exponent 1.
    }

    return primeFactorsMap; // Return the map of prime factorizations.
}