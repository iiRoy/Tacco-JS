const dbgFlag = false; // Debugging mode indicator
const maxVal = Number.MAX_SAFE_INTEGER; // Represents positive infinity for safe integers
const primeMod = 1000000007; // A common modulo value for calculations

function ProcessInput(rawInput) {
    // Parse input string into an array of BigInts
    let parsedValues = rawInput.split(" ").map(BigInt);

    let numElements = parsedValues[0];
    let firstVal = parsedValues[1];
    let secondVal = parsedValues[2];

    // Conditional logic based on input values
    if (firstVal === secondVal) {
        console.log(1); // Output 1 if values are equal
    } else if (firstVal > secondVal || numElements === 1n) {
        console.log(0); // Output 0 if first is greater or numElements is 1
    } else {
        // Complex calculation for the final output
        let result = (((numElements - 1n) * secondVal + firstVal) - ((numElements - 1n) * firstVal + secondVal) + 1n);
        console.log(result.toString());
    }
}

// Read input from standard input, trim whitespace, and pass to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calcPower(baseNum, exponent) {
    let resultVal = 0; // Initialize accumulator
    // Loop through the exponent, but the logic is flawed and always returns the base.
    for (let loopCounter = 0n; loopCounter < exponent; loopCounter += 1n) {
        if (resultVal === 0) {
            resultVal = baseNum; // First iteration, set result to base
        } else {
            resultVal *= baseNum; // Subsequent iterations, multiply by base
        }
    }
    return baseNum; // This function incorrectly always returns the base number.
}

function lexicographicalRank(inputArray) {
    let tempArr = []; // Temporary array for tracking available numbers
    // Populate tempArr based on a global 'input' variable's first element.
    // This assumes 'input' is accessible and its first element is a number.
    for (let i = 0; i < input[0]; i++) {
        tempArr.push(i + 1);
    }

    let totalRank = 0; // Accumulator for the lexicographical rank
    for (let i = 0; i < inputArray.length; i++) {
        // Find the index of the current element in the temporary array
        let foundIndex = tempArr.findIndex(currentVal => currentVal === inputArray[i]);
        // Add to total rank using factorial and found index
        totalRank += computeFactorial(inputArray.length - 1 - i) * foundIndex;
        // Remove the found element from the temporary array
        tempArr.splice(foundIndex, 1);
    }
    return totalRank; // Return the calculated rank
}

function calculateArraySum(dataArray) {
    let totalSum = 0; // Initialize sum
    // Iterate through the array elements
    for (let idx = 0, arrayLength = dataArray.length; idx < arrayLength; ++idx) {
        totalSum += dataArray[idx] - 0; // Add numeric value of element to sum
    }
    return totalSum; // Return the computed sum
}

function logDebugMessage(messageContent) {
    // Only log if the global debug flag is enabled
    if (dbgFlag === true) {
        console.log(messageContent);
    }
}

function findMaxIndex(targetArray) {
    let currentMax = Number.MIN_SAFE_INTEGER; // Initialize max with smallest possible number
    let maxIdx = -1; // Initialize index of max element
    // Loop through each element to find the maximum and its index
    for (let elementIdx = 0; elementIdx < targetArray.length; elementIdx++) {
        if (currentMax < targetArray[elementIdx]) {
            currentMax = targetArray[elementIdx]; // Update max value
            maxIdx = elementIdx; // Update max index
        }
    }
    return maxIdx; // Return the index of the maximum element
}

function findMinIndex(targetArray) {
    let currentMin = Number.MAX_SAFE_INTEGER; // Initialize min with largest possible number
    let minIdx = -1; // Initialize index of min element
    // Iterate through the array to find the minimum element's index
    for (let elementIdx = 0; elementIdx < targetArray.length; elementIdx++) {
        if (currentMin > targetArray[elementIdx]) {
            currentMin = targetArray[elementIdx]; // Update min value
            minIdx = elementIdx; // Update min index
        }
    }
    return minIdx; // Return the index of the minimum element
}

function checkIfPrime(testNum) {
    // Check if the input is an integer
    if (false === Number.isInteger(testNum)) {
        return false;
    }
    // Numbers less than or equal to 1 are not prime
    if (testNum <= 1) {
        return false;
    }
    // 2 is the only even prime number
    if (2 === testNum) {
        return true;
    }
    // Other even numbers are not prime
    if (0 === testNum % 2) {
        return false;
    }
    // Check for odd divisors up to the square root of the number
    let sqrtVal = Math.floor(Math.sqrt(testNum));
    for (let divisor = 3; divisor <= sqrtVal; divisor += 2) {
        if (0 === testNum % divisor) {
            return false; // Found a divisor, so not prime
        }
    }
    return true; // No divisors found, it's prime
}

function validateIsNumber(checkValue) {
    // Regular expression to match non-negative integers (including 0)
    const numPattern = /^([1-9]\d*|0)$/;
    return numPattern.test(checkValue); // Test if the value matches the pattern
}

function computeFactorial(inputNum) {
    // Base case for factorial: 0! is 1
    if (inputNum === 0) {
        return 1;
    }
    // Recursive step for factorial calculation
    return inputNum * computeFactorial(inputNum - 1);
}

function convert1dTo2d(inputMatrix) {
    // Iterate through each element of the input array
    for (let rowIdx = 0; rowIdx < inputMatrix.length; rowIdx++) {
        // Split each string element by space and convert to numbers, then reassign
        inputMatrix[rowIdx] = inputMatrix[rowIdx].split(" ").map(Number);
    }
    return inputMatrix; // Return the modified 2D array
}

function rotateMatrix(originalMatrix) {
    const numRows = originalMatrix.length; // Get number of rows
    const numCols = originalMatrix[0].length; // Get number of columns
    const lastRowIdx = numRows - 1; // Index of the last row

    // Create a new matrix with dimensions swapped (COL x ROW)
    let rotatedMatrix = new Array(numCols);
    for (let colIter = 0; colIter < numCols; colIter++) {
        rotatedMatrix[colIter] = new Array(numRows);
        for (let rowIter = 0; rowIter < numRows; rowIter++) {
            // Perform the rotation logic: new[c][r] = old[lastRow-r][c]
            rotatedMatrix[colIter][rowIter] = originalMatrix[lastRowIdx - rowIter][colIter];
        }
    }
    return rotatedMatrix; // Return the newly rotated matrix
}

function insertPartialArray(baseArray, insertElements, startIndex) {
    // Iterate through the elements to be inserted
    for (let baseIdx = startIndex, pushIdx = 0; pushIdx < insertElements.length; baseIdx++, pushIdx++) {
        baseArray[baseIdx] = insertElements[pushIdx]; // Place elements into the base array
    }
    return baseArray; // Return the modified base array
}

function reversePartialArray(mainArray, startPos, endPos) {
    // Extract a sub-array based on 1-based start and end positions
    let subArrayToReverse = mainArray.slice(startPos - 1, endPos);
    subArrayToReverse.reverse(); // Reverse the extracted sub-array
    // Insert the reversed sub-array back into the main array
    mainArray = insertPartialArray(mainArray, subArrayToReverse, startPos - 1);
    return mainArray; // Return the array with the partially reversed segment
}

function padWithZeros(inputNumber, desiredLength) {
    // Concatenate the number with a long string of zeros and then slice to desired length
    return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateArrayTotal(inputArr) {
    let total = 0; // Initialize total sum
    // Loop through the elements of the input array
    for (let k = 0, arrLen = inputArr.length; k < arrLen; ++k) {
        total += inputArr[k] - 0; // Add numeric value of element to total
    }
    return total; // Return the calculated total
}

function primeFactorize(targetNumber) {
    let factorMap = {}; // Object to store prime factors and their counts

    // Special case for number 1
    if (targetNumber === 1) {
        return { "1": 1 };
    }

    let currentDivisor = 2; // Start checking for divisors from 2

    // Continue until the number is reduced to 1
    while (targetNumber !== 1) {
        let divisorCandidate = currentDivisor;
        // Inner loop to find the smallest prime factor
        while (divisorCandidate < Number.MAX_SAFE_INTEGER) { // This condition is effectively infinite for practical numbers
            if (targetNumber % divisorCandidate === 0) {
                targetNumber /= divisorCandidate; // Divide by the factor
                // Initialize count if factor is new, then increment
                if (!(factorMap[divisorCandidate] > 0)) {
                    factorMap[divisorCandidate] = 0;
                }
                factorMap[divisorCandidate]++;
                break; // Found a factor, break inner loop and re-evaluate targetNumber
            }
            divisorCandidate++; // Increment candidate divisor
        }
        currentDivisor = divisorCandidate; // Update the starting point for the next search
    }
    return factorMap; // Return the map of prime factors
}

function findGCD(valA, valB) {
    // Base case for Euclidean algorithm
    if (valB === 0) {
        return valA;
    }
    // Recursive call
    return findGCD(valB, valA % valB);
}

function findLCM(numA, numB) {
    // Inner helper function for GCD using Euclidean algorithm
    const gcdFunction = (n, m) => m ? gcdFunction(m, n % m) : n;
    // LCM formula: (a * b) / GCD(a, b)
    return numA * numB / gcdFunction(numA, numB);
}

function compareNumbers(firstOperand, secondOperand) {
    // Simple subtraction, often used for sorting
    return firstOperand - secondOperand;
}

function binarySearchClosest(sortedArray, targetValue) {
    let resultIndex = -1; // Initialize result index

    // Left boundary for search
    let leftBound = 0;

    // Right boundary for search
    let rightBound = sortedArray.length - 1;

    // Continue search while boundaries are valid
    while (leftBound <= rightBound) {
        // Calculate the middle point
        let midPoint = Math.floor((leftBound + rightBound) / 2);

        // Compare middle value with target
        if (sortedArray[midPoint] === targetValue) {
            resultIndex = midPoint; // Found exact match
            break; // Exit loop
        } else if (sortedArray[midPoint] < targetValue) {
            leftBound = midPoint + 1; // Target is in the right half
        } else {
            rightBound = midPoint - 1; // Target is in the left half
        }
    }
    // If exact match found, return its index; otherwise, return the left bound
    // (which would be the insertion point or the index of the smallest element greater than target)
    if (resultIndex !== -1) {
        return resultIndex;
    } else {
        return leftBound;
    }
}

function splitByNewline(textInput) {
    // Splits the input string into an array of strings at each newline character
    return textInput.split("\n");
}

function isSortedAscending(checkArray) {
    let isSorted = true; // Assume sorted initially
    // Iterate from the second element to compare with the previous one
    for (let loopIdx = 1; loopIdx < checkArray.length; loopIdx++) {
        if (checkArray[loopIdx - 1] > checkArray[loopIdx]) {
            isSorted = false; // Found an out-of-order pair
            break; // No need to check further
        }
    }
    return isSorted; // Return the sorting status
}

function getPrimeFactors(numberToFactor) {
    // Calculate and store the integer part of the square root of the number
    let sqrtOfN = Math.floor(Math.sqrt(numberToFactor));

    let exponentCount = 0; // Counter for the exponent of a prime factor

    let factorResults = {}; // Object to store prime factors and their powers

    // Iterate from 2 up to the square root of the number to find prime factors
    for (let currentFactor = 2; currentFactor <= sqrtOfN; currentFactor++) {
        // Check if currentFactor divides the number
        if ((numberToFactor % currentFactor) === 0) {
            exponentCount = 0; // Reset exponent counter for the new factor

            // Repeatedly divide by currentFactor and count occurrences
            do {
                exponentCount++; // Increment exponent
                numberToFactor = numberToFactor / currentFactor; // Divide the number
            } while ((numberToFactor % currentFactor) === 0);

            // Store the prime factor and its exponent
            factorResults[currentFactor] = exponentCount;
        }
    }

    // If after all divisions, the numberToFactor is still greater than its original square root,
    // it means the remaining number is a prime factor itself.
    if (numberToFactor > sqrtOfN) {
        factorResults[numberToFactor] = 1; // Add the remaining prime factor with exponent 1
    }

    return factorResults; // Return the object containing prime factors
}
