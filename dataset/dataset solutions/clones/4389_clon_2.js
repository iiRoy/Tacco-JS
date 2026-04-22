// --- Utility Function Catalog ---
// transformToMatrix(dataCollection): Converts a 1D array of strings into a 2D matrix of characters.
// getPrimeFactorsMap(numberVal): Returns an object containing prime factors and their exponents for a given number.
// findGreatestCommonDivisor(num1, num2): Computes the greatest common divisor of two integers.
// findLeastCommonMultiple(num1, num2): Calculates the least common multiple of two integers.
// compareNumbers(valA, valB): Returns the difference (valA - valB) for sorting purposes.
// checkPrimeStatus(numberVal): Determines if a number is prime, returning true or false.
// isValidNumericString(inputStr): Checks if a string represents a valid non-negative integer.
// calculateArrayTotal(dataCollection): Sums all numeric elements within an array.
// binarySearchLargestSmallerOrEqual(sortedArray, searchKey): Finds the index of the largest element less than or equal to the search key.
// splitByLineBreak(inputStr): Divides a string into an array of substrings using newline characters.
// --------------------------------

const verboseLogging = false; // Flag to enable/disable detailed log messages.
const maximumSafeInteger = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer in JavaScript.
const moduloConstant = 1000000007; // A common modulus value used in competitive programming.

function ExecuteProgram(dataInput) {
    // Process the raw input by splitting it into lines.
    dataInput = dataInput.split("\n");
    // Parse the first line into an array of space-separated values.
    var priceComponents = dataInput[0].split(" ");

    // Apply specific pricing adjustments based on conditions.
    // If double the first component is less than the second, update the second.
    if (priceComponents[0] * 2 < priceComponents[1]) {
        priceComponents[1] = priceComponents[0] * 2;
    }
    // If double the second component is less than the third, update the third.
    if (priceComponents[1] * 2 < priceComponents[2]) {
        priceComponents[2] = priceComponents[1] * 2;
    }
    // If double the third component is less than the fourth, update the fourth.
    if (priceComponents[2] * 2 < priceComponents[3]) {
        priceComponents[3] = priceComponents[2] * 2;
    }

    // Calculate the final result based on the adjusted prices and a value from the second line of input.
    // This involves integer division and modulo operations.
    console.log(Math.floor(dataInput[1] / 2) * priceComponents[3] + (dataInput[1] % 2) * priceComponents[2]);
}

// Immediately execute the main program function with input read from stdin.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function getLexicographicalRank(permutationArray) {
  // Initialize an empty array to store available numbers.
  var availableNumbers = [];
  // Populate the array with numbers from 1 to the first input value.
  for (var idx = 0; idx < dataInput[0]; idx++) {
    availableNumbers.push(idx + 1);
  }

  var cumulativeRank = 0; // Accumulator for the lexicographical rank.
  // Iterate through the given permutation array.
  for (var idx = 0; idx < permutationArray.length; idx++) {
    // Find the index of the current permutation element in the available numbers.
    var matchedIndex = availableNumbers.findIndex(item => item == permutationArray[idx]);
    // Add the contribution to the cumulative rank.
    cumulativeRank += computeFactorial(permutationArray.length - 1 - idx) * matchedIndex;
    // Remove the used number from the available list.
    availableNumbers.splice(matchedIndex, 1);
  }
  return cumulativeRank;
}

function calculateArrayTotal(numericCollection) {
  var totalSum = 0; // Initialize sum.
  // Loop through all elements in the collection.
  for (var idx = 0, currentCount = numericCollection.length; idx < currentCount; ++idx) {
      totalSum += numericCollection[idx] - 0; // Add element, ensuring it's treated as a number.
  }
  return totalSum; // Return the computed sum.
}

function logIfEnabled(messageContent) {
  // Only log if the verbose logging flag is set to true.
  if (verboseLogging === true) {
    console.log(messageContent);
  }
}

function findMaxIndex(dataValues) {
	var maxValue = Number.MIN_SAFE_INTEGER; // Start with the smallest possible value.
	var elementIndex = -1; // Initialize index to an invalid value.
	// Iterate through the array to find the maximum value and its index.
	for (var idx = 0; idx < dataValues.length; idx++) {
		if (maxValue < dataValues[idx]) {
			maxValue = dataValues[idx]; // Update max value.
			elementIndex = idx; // Update index.
		}
	}
	return elementIndex; // Return the index of the maximum element.
}

function findMinIndex(dataValues) {
	var minValue = Number.MAX_SAFE_INTEGER; // Start with the largest possible value.
	var elementIndex = -1; // Initialize index to an invalid value.
	// Iterate through the array to find the minimum value and its index.
	for (var idx = 0; idx < dataValues.length; idx++) {
		if (minValue > dataValues[idx]) {
			minValue = dataValues[idx]; // Update min value.
			elementIndex = idx; // Update index.
		}
	}
	return elementIndex; // Return the index of the minimum element.
}

function transformToMatrix(inputArrayOfStrings) {
	// For each string in the input array, split it into an array of characters.
	for (var idx = 0; idx < inputArrayOfStrings.length; idx++) {
		inputArrayOfStrings[idx] = inputArrayOfStrings[idx].split("");
	}
	return inputArrayOfStrings; // Return the now 2D array.
}

function checkPrimeStatus(numberVal) {
    // First, verify if the input is an integer.
    if (false === Number.isInteger(numberVal)) {
        return false; // Not an integer, cannot be prime.
    }
    // Numbers less than or equal to 1 are not prime.
    if (numberVal <= 1) {
        return false;
    }
    // 2 is the only even prime number.
    if (2 === numberVal) {
        return true;
    }
    // Any other even number is not prime.
    if (0 === numberVal % 2) {
        return false;
    }
    // Check for divisibility by odd numbers up to the square root.
    var sqrtValue = Math.floor(Math.sqrt(numberVal));
    for (var idx = 3; idx <= sqrtValue; idx += 2) {
        if (0 === numberVal % idx) {
            return false; // Found a divisor, so not prime.
        }
    }
    return true; // No divisors found, it's a prime number.
}

function isValidNumericString(inputStr) {
	// Regular expression to match non-negative integer strings.
	const numericPattern = /^([1-9]\d*|0)$/;
	return numericPattern.test(inputStr); // Test the string against the pattern.
}

function computeFactorial(numberToProcess) {
  // Base case: factorial of 0 is 1.
  if (numberToProcess === 0) {
    return 1;
  }
  // Recursive step: n * factorial(n-1).
  return numberToProcess * computeFactorial(numberToProcess - 1);
}

function rotateMatrix(matrix) {
  const numRows = matrix.length; // Get number of rows.
  const numCols = matrix[0].length; // Get number of columns.
  const lastRowIndex = numRows - 1; // Index of the last row.

  // Create a new matrix with swapped dimensions (cols x rows).
  var rotatedGrid = new Array(numCols);
  for (var colIdx = 0; colIdx < numCols; colIdx++) {
    rotatedGrid[colIdx] = new Array(numRows); // Each column becomes a new row.
    for (var rowIdx = 0; rowIdx < numRows; rowIdx++) {
      // Perform the rotation: new[c][r] = old[last_row - r][c]
      rotatedGrid[colIdx][rowIdx] = matrix[lastRowIndex - rowIdx][colIdx];
    }
  }
  return rotatedGrid; // Return the newly rotated matrix.
}

function insertSubarray(baseArray, segmentToInsert, startIndex) {
	// Iterate through the segment to insert, copying elements to the base array.
	for (var baseIdx = startIndex, insertIdx = 0; insertIdx < segmentToInsert.length; baseIdx++, insertIdx++) {
		baseArray[baseIdx] = segmentToInsert[insertIdx];
	}
	return baseArray; // Return the modified base array.
}

function reverseSubsegment(originalArray, segmentStart, segmentEnd) {
	// Extract the subsegment to be reversed.
	var extractedSegment = originalArray.slice(segmentStart - 1, segmentEnd);
    extractedSegment.reverse(); // Reverse the extracted segment.
	// Insert the reversed segment back into the original array.
	originalArray = insertSubarray(originalArray, extractedSegment, segmentStart - 1);
	return originalArray; // Return the array with the subsegment reversed.
}

function padWithZeros(numberVal, desiredLength) {
    // Concatenate the number with a long string of zeros and slice to desired length.
    return (numberVal + '000000000000000000000000000000000').slice(0, desiredLength);
}

function sumNumericElements(collectionOfNumbers) {
    var runningTotal = 0; // Initialize sum.
    // Iterate through the input collection.
    for (var position = 0, totalCount = collectionOfNumbers.length; position < totalCount; ++position) {
        runningTotal += collectionOfNumbers[position] - 0; // Add current element, ensuring numeric conversion.
    }
    return runningTotal; // Return the final sum.
}

function getPrimeFactorsMap(numberVal) {
    var factorMap = {}; // Object to store prime factors and their counts.

    // Handle the special case where the number is 1.
    if (numberVal === 1) {
        return {"1": 1};
    }

    var currentFactor = 2; // Start checking from the smallest prime.

    // Continue until the number is reduced to 1.
    while (numberVal !== 1) {
        var divisorCandidate = currentFactor;
        // Loop to find the next prime divisor.
        while (divisorCandidate < maximumSafeInteger) { // Using MAX_SAFE_INTEGER as a large upper bound.
            if (numberVal % divisorCandidate === 0) {
                numberVal /= divisorCandidate; // Divide by the found factor.
                // Increment count for this factor, initialize if not present.
                if (!(factorMap[divisorCandidate] > 0)) {
                    factorMap[divisorCandidate] = 0;
                }
                factorMap[divisorCandidate]++;
                break; // Move to the next numberVal after division.
            }
            divisorCandidate++; // Try the next number as a divisor.
        }
        currentFactor = divisorCandidate; // Update the starting point for the next search.
    }
    return factorMap; // Return the map of prime factors.
}

function findGreatestCommonDivisor(firstOperand, secondOperand) {
    // Base case for Euclidean algorithm.
    if (secondOperand === 0) {
        return firstOperand;
    }
    // Recursive call.
    return findGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

function findLeastCommonMultiple(firstOperand, secondOperand) {
    // Helper function for GCD (Euclidean algorithm).
    var calculateGcd = (n, m) => m ? calculateGcd(m, n % m) : n;
    // LCM formula: (a * b) / GCD(a, b).
    return (firstOperand * secondOperand) / calculateGcd(firstOperand, secondOperand);
}

function compareNumbers(valA, valB) {
  // Returns the difference, commonly used for sorting arrays numerically.
  return valA - valB;
}

function binarySearchLargestSmallerOrEqual(sortedCollection, searchKey) {
	var resultIndex = -1; // Default to not found.

    // Left boundary for search.
    var leftBound = 0;
    // Right boundary for search.
    var rightBound = sortedCollection.length - 1;

    // Continue searching while the boundaries are valid.
    while (leftBound <= rightBound) {
        // Calculate the middle point.
        midPoint = Math.floor((leftBound + rightBound) / 2);

        // Compare the middle element with the search key.
        if (sortedCollection[midPoint] === searchKey) {
            resultIndex = midPoint; // Found an exact match.
            break; // Exit loop.
        } else if (sortedCollection[midPoint] < searchKey) {
            // Middle element is smaller, so search in the right half.
            leftBound = midPoint + 1;
        } else {
            // Middle element is larger, so search in the left half.
            rightBound = midPoint - 1;
        }
    }
    // If an exact match was found, return its index.
    // Otherwise, 'leftBound' will be the index where 'searchKey' would be inserted,
    // or the first index greater than 'searchKey'.
    if (resultIndex !== -1) return resultIndex;
    else return leftBound;
}

function splitByLineBreak(dataString) {
  // Splits the input string into an array of lines.
  return dataString.split("\n");
}

function isSequenceSorted(inputSequence) {
  var isOrdered = true; // Assume sorted initially.
  // Iterate from the second element to compare with the previous one.
  for (var idx = 1; idx < inputSequence.length; idx++) {
    if (inputSequence[idx - 1] > inputSequence[idx]) {
      isOrdered = false; // Found an out-of-order pair.
      break; // No need to check further.
    }
  }
  return isOrdered; // Return the sorting status.
}

function decomposeIntoPrimes(numberToFactor) {
	// Calculate the integer part of the square root of the number.
	var sqrtOfN = Math.floor(Math.sqrt(numberToFactor));
	var exponentCount = 0; // Counter for the exponent of a prime factor.
	var primeFactorizationResult = {}; // Object to store prime factors and their exponents.

	// Iterate from 2 up to the square root to find prime factors.
	for (var currentDivisor = 2; currentDivisor <= sqrtOfN; currentDivisor++) {
		// If currentDivisor is a factor.
		if ((numberToFactor % currentDivisor) === 0) {
			exponentCount = 0; // Reset exponent counter.
			// Keep dividing by currentDivisor until it's no longer a factor.
			do {
				exponentCount++; // Increment exponent.
				numberToFactor = numberToFactor / currentDivisor; // Reduce the number.
			} while ((numberToFactor % currentDivisor) === 0);
			// Store the prime factor and its exponent.
			primeFactorizationResult[currentDivisor] = exponentCount;
		}
	}

	// If after all divisions, numberToFactor is still greater than 1,
	// it means the remaining number is a prime factor itself (larger than sqrtOfN).
	if (numberToFactor > 1) {
		primeFactorizationResult[numberToFactor] = 1;
	}

	return primeFactorizationResult; // Return the map of prime factors.
}