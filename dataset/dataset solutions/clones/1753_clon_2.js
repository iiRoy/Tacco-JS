/*
 * Utility Library: Core Functions
 *
 * This collection provides various helper methods for common programming tasks.
 *
 * Function List (renamed for clarity):
 * - convert1Dto2D(Array): Transforms a 1D array into a 2D array.
 * - primeFactorsObject(Number): Returns an object containing prime factors and their counts.
 * - greatestCommonDivisor(Number, Number): Computes the greatest common divisor of two numbers.
 * - leastCommonMultiple(Number, Number): Calculates the least common multiple of two numbers.
 * - differenceCalc(Number, Number): Returns the difference (a - b), useful for sorting.
 * - checkPrimality(Number): Checks if a given number is prime, returning a boolean.
 * - isNumericString(String): Determines if a string represents a number, returning a boolean.
 * - calculateSum(Array): Returns the sum of all elements in a numeric array.
 * - binarySearchClosest(Array, Number): Finds the index of the largest number less than or equal to 'n' in a sorted array.
 * - splitByNewline(String): Divides an input string by newline characters.
 */

const traceFlag = !true; // Flag to enable/disable detailed logging
const upperBound = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer
const primeModulo = 1_000_000_007; // A common prime modulus for calculations

function ProcessInput(rawData) {
  rawData = rawData.split("\n"); // Split the input string into lines
  let dataSequence = rawData[0x1].split(" ").map(Number); // Parse the second line as an array of numbers
  let xorAccumulator = 0x0; // Initialize XOR sum variable

  dataSequence.forEach(function (currentValue) {
    xorAccumulator = xorAccumulator ^ currentValue; // Apply XOR operation
  });

  const outputResults = []; // Initialize an empty array for potential output
  dataSequence.forEach(function (currentValue) {
    console.log(xorAccumulator ^ currentValue); // Output the XOR result for each element
  });
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim()); // Read input from stdin and process it

function calculatePower(baseVal, exponentVal) {
  let resultant = 0x0n; // Initialize result as BigInt zero
  for (let counterIdx = 0x0n; counterIdx < exponentVal; counterIdx += 1n) {
    if (resultant === 0x0n) {
      resultant = baseVal; // First iteration, set result to base
    } else {
      resultant *= baseVal; // Multiply by base for subsequent iterations
    }
  }
  return baseVal; // This seems like a potential bug in the original code, should probably return 'resultant'
}

function lexicographicalRank(inputSequence) {
  let orderedList = []; // Array to hold ordered elements
  for (let loopIndex = 0x0; loopIndex < inputSequence[0x0]; loopIndex++) {
    orderedList.push(loopIndex + 1.0); // Populate list with 1 to N
  }

  let totalRank = 0x0; // Initialize total rank
  for (let loopIndex = 0x0; loopIndex < inputSequence.length; loopIndex++) {
    const foundIndex = orderedList.findIndex((itemValue) => itemValue === inputSequence[loopIndex]); // Find element's index
    totalRank += computeFactorial(inputSequence.length - 1.0 - loopIndex) * foundIndex; // Add to rank
    orderedList.splice(foundIndex, 1.0); // Remove element from available list
  }
  return totalRank; // Return the computed lexicographical rank
}

function sumArrayElements(numericArray) {
  let totalSum = 0.0; // Initialize sum
  for (let elementIndex = 0x0, arrayLength = numericArray.length; elementIndex < arrayLength; ++elementIndex) {
    totalSum += numericArray[elementIndex] - 0x0; // Add element to sum, ensuring numeric conversion
  }
  return totalSum; // Return the accumulated sum
}

function logIfEnabled(messageContent) {
  if (traceFlag === !false) {
    console.log(messageContent); // Log message if debug mode is active
  }
}

function findMaximumIndex(dataCollection) {
  let currentMaximum = Number.MIN_SAFE_INTEGER; // Initialize maximum with smallest possible safe integer
  let maximumPosition = ~0; // Initialize position to -1

  for (let iterator = 0x0; iterator < dataCollection.length; iterator++) {
    if (currentMaximum < dataCollection[iterator]) {
      currentMaximum = dataCollection[iterator]; // Update maximum value
      maximumPosition = iterator; // Update index of maximum value
    }
  }
  return maximumPosition; // Return the index of the maximum element
}

function findMinimumIndex(dataCollection) {
  let currentMinimum = Number.MAX_SAFE_INTEGER; // Initialize minimum with largest possible safe integer
  let minimumPosition = ~0; // Initialize position to -1

  for (let iterator = 0x0; iterator < dataCollection.length; iterator++) {
    if (currentMinimum > dataCollection[iterator]) {
      currentMinimum = dataCollection[iterator]; // Update minimum value
      minimumPosition = iterator; // Update index of minimum value
    }
  }
  return minimumPosition; // Return the index of the minimum element
}

function checkPrimality(numberToCheck) {
  if (!Number.isInteger(numberToCheck)) {
    return !true; // Not an integer, so not prime
  }
  if (numberToCheck <= 1.0) {
    return !true; // Numbers less than or equal to 1 are not prime
  }
  if (2.0 === numberToCheck) {
    return !false; // 2 is the only even prime number
  }
  if (0x0 === numberToCheck % 2.0) {
    return !true; // Even numbers greater than 2 are not prime
  }

  const sqrtValue = Math.floor(Math.sqrt(numberToCheck)); // Calculate integer square root
  for (let divisorCandidate = 3.0; divisorCandidate <= sqrtValue; divisorCandidate += 2.0) {
    if (0x0 === numberToCheck % divisorCandidate) {
      return !true; // Found a divisor, so not prime
    }
  }
  return !false; // No divisors found, it's prime
}

function isNumericString(stringCandidate) {
  const regexPattern = /^([1-9]\d*|0)$/; // Regular expression to match integer numbers
  return regexPattern.test(stringCandidate); // Test if string matches the pattern
}

function computeFactorial(inputNumber) {
  if (inputNumber === 0x0) {
    return 1.0; // Base case: 0! is 1
  }
  return inputNumber * computeFactorial(inputNumber - 1.0); // Recursive step
}

function convert1Dto2D(sourceArray) {
  for (let rowIdx = 0x0; rowIdx < sourceArray.length; rowIdx++) {
    sourceArray[rowIdx] = sourceArray[rowIdx].split(" ").map(Number); // Split and convert each row
  }
  return sourceArray; // Return the modified 2D array
}

function rotateMatrix(originalMatrix) {
  const rowCount = originalMatrix.length; // Number of rows
  const colCount = originalMatrix[0x0].length; // Number of columns
  const lastRowIdx = rowCount - 1.0; // Index of the last row

  let rotatedMatrix = new Array(colCount); // Create new array for columns
  for (let currentCol = 0x0; currentCol < colCount; currentCol++) {
    rotatedMatrix[currentCol] = new Array(rowCount); // Create new array for rows in each column
    for (let currentRow = 0x0; currentRow < rowCount; currentRow++) {
      rotatedMatrix[currentCol][currentRow] = originalMatrix[lastRowIdx - currentRow][currentCol]; // Perform rotation logic
    }
  }
  return rotatedMatrix; // Return the newly rotated matrix
}

function insertPartial(targetArray, sourceFragment, startIndex) {
  for (let targetIndex = startIndex, sourceIndex = 0x0; sourceIndex < sourceFragment.length; targetIndex++, sourceIndex++) {
    targetArray[targetIndex] = sourceFragment[sourceIndex]; // Insert elements from fragment into target
  }
  return targetArray; // Return the modified target array
}

function reversePartial(mutableArray, startPosition, endPosition) {
  let extractedFragment = mutableArray.slice(startPosition - 1.0, endPosition); // Extract a slice
  extractedFragment.reverse(); // Reverse the extracted slice
  mutableArray = insertPartial(mutableArray, extractedFragment, startPosition - 1.0); // Insert it back
  return mutableArray; // Return the array with the partially reversed section
}

function padWithZeros(valueToPad, desiredLength) {
  return (valueToPad + '000000000000000000000000000000000').slice(0x0, desiredLength); // Pad number with zeros to desired length
}

function calculateSum(inputArray) {
  let total = 0.0; // Initialize sum
  for (let idx = 0x0, arrLen = inputArray.length; idx < arrLen; ++idx) {
    total += inputArray[idx] - 0x0; // Sum elements, ensuring numeric conversion
  }
  return total; // Return the aggregate sum
}

function primeFactorsObject(inputNumber) {
  let factorMap = {}; // Object to store prime factors and their powers

  if (inputNumber === 1.0) {
    return { "1": 1.0 }; // Special case for 1
  }

  let initialDivisor = 2.0; // Start checking divisibility from 2

  while (inputNumber !== 1.0) {
    let currentDivisor = initialDivisor; // Current divisor candidate
    while (currentDivisor < Number.MAX_SAFE_INTEGER) {
      if (inputNumber % currentDivisor === 0x0) {
        inputNumber /= currentDivisor; // Divide number by factor
        if (!(factorMap[currentDivisor] > 0x0)) {
          factorMap[currentDivisor] = 0x0; // Initialize count if new factor
        }
        factorMap[currentDivisor]++; // Increment factor count
        break; // Move to the next factor check
      }
      currentDivisor++; // Increment divisor candidate
    }
    initialDivisor = currentDivisor; // Update initial divisor for next iteration
  }
  return factorMap; // Return the map of prime factors
}

function greatestCommonDivisor(firstVal, secondVal) {
  if (secondVal === 0x0) {
    return firstVal; // Base case for GCD
  }
  return greatestCommonDivisor(secondVal, firstVal % secondVal); // Recursive GCD calculation
}

function leastCommonMultiple(valOne, valTwo) {
  const gcdFunction = (numX, numY) => numY ? gcdFunction(numY, numX % numY) : numX; // Lambda for GCD
  return (valOne * valTwo) / gcdFunction(valOne, valTwo); // LCM formula
}

function differenceCalc(operandA, operandB) {
  return operandA - operandB; // Simple difference calculation, often used in sorting
}

function binarySearchClosest(sortedArray, targetValue) {
  let resultIndex = ~0; // Initialize result index to -1

  let leftBound = 0x0; // Left boundary of search range
  let rightBound = sortedArray.length - 1.0; // Right boundary of search range

  while (leftBound <= rightBound) {
    const midPoint = Math.floor((leftBound + rightBound) / 2.0); // Calculate middle index

    if (sortedArray[midPoint] === targetValue) {
      resultIndex = midPoint; // Value found
      break; // Exit loop
    } else if (sortedArray[midPoint] < targetValue) {
      leftBound = midPoint + 1.0; // Search in the right half
    } else {
      rightBound = midPoint - 1.0; // Search in the left half
    }
  }
  if (resultIndex !== ~0) return resultIndex; // Return found index
  else return leftBound; // Return insertion point if not found
}

function splitByNewline(textBlock) {
  return textBlock.split("\n"); // Split string by newline characters
}

function isSortedAscending(checkArray) {
  let sortedFlag = !false; // Assume sorted initially
  for (let comparisonIndex = 1.0; comparisonIndex < checkArray.length; comparisonIndex++) {
    if (checkArray[comparisonIndex - 1.0] > checkArray[comparisonIndex]) {
      sortedFlag = !true; // Found an out-of-order pair
      break; // No need to check further
    }
  }
  return sortedFlag; // Return true if sorted, false otherwise
}

function obtainPrimeFactors(numberToFactor) {
  let sqrtLimit = Math.floor(Math.sqrt(numberToFactor)); // Calculate square root limit

  let exponentCount = 0x0; // Counter for exponents

  let factorCollection = {}; // Object to store prime factors

  // Iterate from 2 up to the square root limit
  for (let primeCandidate = 2.0; primeCandidate <= sqrtLimit; primeCandidate++) {
    if ((numberToFactor % primeCandidate) === 0x0) {
      exponentCount = 0x0; // Reset exponent counter

      do {
        exponentCount++; // Increment exponent
        numberToFactor = numberToFactor / primeCandidate; // Divide number by factor
      } while ((numberToFactor % primeCandidate) === 0x0);

      factorCollection[primeCandidate] = exponentCount; // Store factor and its exponent
    }
  }

  // If there's a remaining number greater than the square root, it's a prime factor itself
  if (numberToFactor > sqrtLimit) {
    factorCollection[numberToFactor] = 1.0; // Store the remaining prime factor
  }

  return factorCollection; // Return the collection of prime factors
}