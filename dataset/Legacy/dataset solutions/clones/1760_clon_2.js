// This collection of helper routines provides various functionalities for data manipulation and numerical operations.
// These utilities are often employed in problem-solving contexts.

// --- Utility Function Index ---
// transformTo2D(matrixArray) : Reshapes a flat array into a two-dimensional array.
// factorizePrime(numericValue) : Returns an object mapping prime factors to their exponents.
// findGreatestCommonDivisor(valueA, valueB) : Calculates the largest common divisor of two integers.
// calculateLeastCommonMultiple(numberX, numberY) : Determines the smallest common multiple of two integers.
// computeDifference(operandOne, operandTwo) : Yields the difference (operandOne - operandTwo), useful for comparison.
// isNumberPrime(candidate) : Checks if a given number is a prime number.
// validateNumericString(inputString) : Verifies if a string consists solely of digits.
// aggregateArraySum(dataElements) : Computes the cumulative sum of all numbers in an array.
// performBinarySearch(sortedData, targetFigure) : Locates the index of the highest value less than or equal to targetFigure.
// divideByLineBreaks(rawText) : Splits a string into an array of lines based on newline characters.
// ------------------------------
const enableDebugging = false; // Control flag for activating debugging output.
const maximumValue = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer.
const operationModulus = 1000000007; // A frequently used modulus for arithmetic operations.

// The primary function to process incoming data.
function ExecuteProgram(inputString) {
  let cycleCounter = 1; // Initialize an iteration counter.
  while (true) { // Loop indefinitely until a specific condition is met.
    // Check if the product of the counter and input string is a multiple of 360.
    if ((cycleCounter * inputString) % 360 === 0) {
      console.info(cycleCounter); // Display the successful counter value.
      break; // Terminate the loop.
    }
    cycleCounter++; // Advance the counter.
  }
}

// Invoke the main program function, reading input from standard input.
ExecuteProgram(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());

// Computes the power of a base number raised to an exponent.
// The original code had an issue with BigInt usage and returned the base instead of the result.
// This version ensures consistent Number type operations and returns the correct power.
function calculatePower(baseNumber, exponentNumber) {
    let finalResult = 1; // Start with 1, as base^0 is 1.
    for (let currentIteration = 0; currentIteration < exponentNumber; currentIteration++) {
        finalResult *= baseNumber; // Multiply the result by the base for each exponent step.
    }
    return finalResult; // Return the computed value.
}

// A global array, typically populated from parsed input data in competitive programming.
let globalInputArray = []; // This array is assumed to be populated before `determineLexicographicalRank` is called.

// Determines the lexicographical rank of a given sequence.
// It relies on `globalInputArray[0]` to define the range of numbers.
function determineLexicographicalRank(inputSequence) {
  let availableNumbers = []; // A temporary list of numbers to choose from.
  // Populate `availableNumbers` based on the value found at `globalInputArray[0]`.
  for (let currentIdx = 0; currentIdx < globalInputArray[0]; currentIdx++) {
    availableNumbers.push(currentIdx + 1);
  }
  let computedRank = 0; // Accumulator for the total rank.
  for (let currentIdx = 0; currentIdx < inputSequence.length; currentIdx++) {
    // Find the position of the current element in the `availableNumbers` list.
    let positionInAvailable = availableNumbers.findIndex(item => item === inputSequence[currentIdx]);
    // Add to the rank by multiplying factorial of remaining elements by its position.
    computedRank += calculateFactorial(inputSequence.length - 1 - currentIdx) * positionInAvailable;
    // Remove the chosen number from the available list.
    availableNumbers.splice(positionInAvailable, 1);
  }
  return computedRank; // Provide the final lexicographical rank.
}

// Sums up all numeric values within a provided array.
function aggregateArraySum(dataElements) {
  let totalSummation = 0; // Initialize the sum.
  // Iterate through each element of the array.
  for (let idx = 0, arrayLen = dataElements.length; idx < arrayLen; idx++) {
      totalSummation += dataElements[idx] - 0; // Add the element, ensuring it's treated as a number.
  }
  return totalSummation; // Return the cumulative sum.
}

// Outputs a value to the console if the debugging feature is active.
function emitDebugLog(itemToLog) {
  if (enableDebugging === true) { // Check if the debug flag is set.
    console.log(itemToLog); // Print the item.
  }
}

// Locates the index of the highest numerical element in an array.
function findLargestValueIndex(valueCollection) {
	let currentMaximum = Number.MIN_SAFE_INTEGER; // Initialize with the smallest possible number.
	let maximumPosition = -1; // Initialize with an invalid index.
	for (let i = 0; i < valueCollection.length; i++) {
		if (currentMaximum < valueCollection[i]) { // If the current element is greater than the recorded maximum.
			currentMaximum = valueCollection[i]; // Update the maximum value.
			maximumPosition = i; // Store the index of this new maximum.
		}
	}
	return maximumPosition; // Return the index where the maximum value was found.
}

// Locates the index of the smallest numerical element in an array.
function findSmallestValueIndex(valueCollection) {
	let currentMinimum = Number.MAX_SAFE_INTEGER; // Initialize with the largest possible number.
	let minimumPosition = -1; // Initialize with an invalid index.
	for (let i = 0; i < valueCollection.length; i++) {
		if (currentMinimum > valueCollection[i]) { // If the current element is less than the recorded minimum.
			currentMinimum = valueCollection[i]; // Update the minimum value.
			minimumPosition = i; // Store the index of this new minimum.
		}
	}
	return minimumPosition; // Return the index where the minimum value was found.
}

// Checks whether a given number is a prime number.
function isNumberPrime(candidate) {
    if (false === Number.isInteger(candidate)) { // Ensure the input is an integer.
        return false;
    }
    if (candidate <= 1) { // Numbers less than or equal to 1 are not prime.
        return false;
    }
    if (2 === candidate) { // The number 2 is prime.
        return true;
    }
    if (0 === candidate % 2) { // Any other even number is not prime.
        return false;
    }
    let squareRootInteger = Math.floor(Math.sqrt(candidate)); // Compute the integer part of the square root.
    for (let div = 3; div <= squareRootInteger; div += 2) { // Check divisibility by odd numbers up to the square root.
        if (0 === candidate % div) { // If divisible, it's not prime.
            return false;
        }
    }
    return true; // If no divisors are found, the number is prime.
}

// Validates if a string exclusively contains digits (representing a non-negative integer).
function validateNumericString(inputString) {
	const digitPattern = /^([1-9]\d*|0)$/; // Regular expression for non-negative integers.
	return digitPattern.test(inputString); // Test the input string against the pattern.
}

// Computes the factorial of a non-negative integer.
function calculateFactorial(numberInput) {
  if (numberInput === 0) { return 1; } // Base case: factorial of zero is one.
  return numberInput * calculateFactorial(numberInput - 1); // Recursive step for n * (n-1)!.
}

// Transforms an array of strings, where each string contains space-separated numbers,
// into a true 2D array of actual numeric values.
function transformTo2D(matrixArray) {
	for (let index = 0; index < matrixArray.length; index++) {
    matrixArray[index] = matrixArray[index].split(" ").map(Number); // Split each string and convert to numbers.
    }
  return matrixArray; // Return the newly formed 2D array.
}

// Rotates a given 2D matrix 90 degrees clockwise.
function rotateGrid(sourceMatrix) {
  const totalRows = sourceMatrix.length; // Number of rows in the original matrix.
  const totalCols = sourceMatrix[0].length; // Number of columns in the original matrix.
  const lastRowPosition = totalRows - 1; // Index of the final row.
  let rotatedMatrix = new Array(totalCols); // Create a new array for the rotated matrix.
  for (let colPosition = 0; colPosition < totalCols; colPosition++) {
    rotatedMatrix[colPosition] = new Array(totalRows); // Initialize inner arrays for new rows.
    for (let rowPosition = 0; rowPosition < totalRows; rowPosition++) {
      // Apply the rotation logic: original (row, col) becomes new (col, totalRows - 1 - row).
      rotatedMatrix[colPosition][rowPosition] = sourceMatrix[lastRowPosition - rowPosition][colPosition];
    }
  }
  return rotatedMatrix; // Deliver the rotated matrix.
}

// Inserts elements from a `sourceArray` into a `destinationArray` beginning at `startPoint`.
function insertElementsPartial(destinationArray, sourceArray, startPoint) {
	for (let targetIndex = startPoint, sourceIndex = 0; sourceIndex < sourceArray.length; targetIndex++, sourceIndex++) {
		destinationArray[targetIndex] = sourceArray[sourceIndex]; // Copy elements one by one.
	}
	return destinationArray; // Return the modified destination array.
}

// Reverses a segment of `targetArray` between `beginIndex` and `endIndex` (1-based inclusive).
function reverseArraySegment(targetArray, beginIndex, endIndex) {
	let segmentToReverse = targetArray.slice(beginIndex - 1, endIndex); // Extract the portion to be reversed.
  segmentToReverse.reverse(); // Reverse the extracted segment in place.
	targetArray = insertElementsPartial(targetArray, segmentToReverse, beginIndex - 1); // Insert the reversed segment back.
	return targetArray; // Return the array with the segment reversed.
}

// Pads a numerical string with leading zeros to achieve a specified total length.
function padNumberWithZeros(numberValue, desiredLength) {
    // Convert the number to a string, append many zeros, then slice to the desired length.
    return (numberValue + '000000000000000000000000000000000').slice(0, desiredLength);
}

// Calculates the sum of all elements in a numeric list (a duplicate from original).
function calculateListOfNumbersSum(numericList) {
    let totalAccumulator = 0; // Initialize the sum to zero.
    for (let i = 0, len = numericList.length; i < len; i++) {
        totalAccumulator += numericList[i] - 0; // Add each element to the total, ensuring numeric conversion.
    }
    return totalAccumulator; // Return the final sum.
}

// Generates the prime factorization of a given integer.
function factorizePrime(numericValue) {
    let primeFactorMap = {}; // Object to store prime factors and their counts.

    if (numericValue === 1) { // Special handling for the number 1.
        return {"1": 1};
    }

    let initialDivisor = 2; // Start the search for prime factors from 2.

    while (numericValue !== 1) {
        let currentFactorCandidate = initialDivisor; // The current number being tested as a factor.
        while (currentFactorCandidate < maximumValue) { // Loop to find the next prime factor.
            if (numericValue % currentFactorCandidate === 0) {
                numericValue /= currentFactorCandidate; // Divide the number by the found factor.
                if (!(primeFactorMap[currentFactorCandidate] > 0)) { // If this factor is new, initialize its count.
                    primeFactorMap[currentFactorCandidate] = 0;
                }
                primeFactorMap[currentFactorCandidate]++; // Increment the count for this factor.
                break; // Move to the reduced numberValue to find its next factors.
            }
            currentFactorCandidate++; // Try the next integer as a potential factor.
        }
        initialDivisor = currentFactorCandidate; // Update the starting point for the next factor search.
    }
    return primeFactorMap; // Return the map containing all prime factors and their exponents.
}

// Computes the greatest common divisor (GCD) of two integers using the Euclidean algorithm.
function findGreatestCommonDivisor(valueA, valueB) {
    if (valueB === 0) { // Base condition: if valueB is zero, valueA is the GCD.
        return valueA;
    }
    return findGreatestCommonDivisor(valueB, valueA % valueB); // Recursive call with valueB and the remainder.
}

// Calculates the least common multiple (LCM) of two integers.
function calculateLeastCommonMultiple(numberX, numberY) {
    // An inner function to compute GCD, used within LCM.
    const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
    return numberX * numberY / gcdHelper(numberX, numberY); // LCM formula: (X * Y) / GCD(X, Y).
}

// Returns the simple difference between two numbers, often for sorting comparison.
function computeDifference(operandOne, operandTwo) {
  return operandOne - operandTwo; // Returns a negative, zero, or positive value.
}

// Conducts a binary search on a pre-sorted list to find the index of the largest element
// that is less than or equal to the target value.
function performBinarySearch(sortedData, targetFigure) {
	let resultingIndex = -1; // Initialize the index of the found element.

    // The left boundary index for the search range.
    let leftBoundary = 0;

    // The right boundary index for the search range.
    let rightBoundary = sortedData.length - 1;

    // Continue the search as long as the left boundary does not exceed the right boundary.
    while (leftBoundary <= rightBoundary) {

        // Calculate the middle index of the current search range.
        let middlePoint = Math.floor((leftBoundary + rightBoundary) / 2);

        // Compare the element at the middle point with the target figure.
        if (sortedData[middlePoint] === targetFigure) {
            // If an exact match is found, store its index and exit the loop.
            resultingIndex = middlePoint;
            break;
        } else if (sortedData[middlePoint] < targetFigure) {
            // If the middle element is smaller, search in the upper half.
            leftBoundary = middlePoint + 1;
        } else {
            // If the middle element is larger, search in the lower half.
            rightBoundary = middlePoint - 1;
        }
    }
    // If an exact match was located, return its index.
    if (resultingIndex !== -1) return resultingIndex;
    // Otherwise, return `leftBoundary`, which indicates the insertion point or
    // the index of the first element greater than `targetFigure`.
    else return leftBoundary;
}

// Breaks a multi-line string into an array of individual lines.
function divideByLineBreaks(rawText) {
  return rawText.split("\n"); // Splits the string wherever a newline character is found.
}

// Verifies if a given array of numbers is sorted in non-decreasing order.
function checkArrayOrder(numericArray) {
  let isSortedProperly = true; // Assume the array is sorted initially.
  for (let idx = 1; idx < numericArray.length; idx++) {
    if (numericArray[idx - 1] > numericArray[idx]) { // If an element is larger than its successor.
      isSortedProperly = false; // The array is not sorted.
      break; // No need to continue checking.
    }
  }
  return isSortedProperly; // Return the boolean status of the array's order.
}

// Another distinct function to compute the prime factorization of an integer.
function obtainPrimeFactorization(numberValue) {

	// Stores the integer part of the square root of `numberValue`.
	let integerSquareRoot = Math.floor(Math.sqrt(numberValue));

	let currentExponent = 0; // Counter for the exponent of each prime factor.

	let factorizationResult = {}; // An object to store prime factors and their associated exponents.

	// Iterate from 2 up to the integer square root to find prime factors.
	for (let factorCandidate = 2; factorCandidate <= integerSquareRoot; factorCandidate++) {

		if ((numberValue % factorCandidate) === 0) { // If `factorCandidate` divides `numberValue`.

			currentExponent = 0; // Reset the exponent counter for this new factor.

			do {
				currentExponent++; // Increment the exponent.
				numberValue = numberValue / factorCandidate; // Divide `numberValue` by the factor.
			} while ((numberValue % factorCandidate) === 0); // Continue dividing as long as it's divisible.

			// Record the prime factor and its determined exponent.
			factorizationResult[factorCandidate] = currentExponent;
		}
	}

	// If `numberValue` is still greater than its original square root, it means the remaining `numberValue`
	// is itself a prime factor (which must be larger than the square root).
	if (numberValue > integerSquareRoot) {
		factorizationResult[numberValue] = 1; // Add this final prime factor with an exponent of 1.
	}

	return factorizationResult; // Return the complete prime factorization map.
}