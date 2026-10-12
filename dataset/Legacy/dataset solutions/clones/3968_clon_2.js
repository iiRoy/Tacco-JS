/*
 * Collection of utility functions for various computational tasks.
 *
 * transform1Dto2DString(dataArray) : Transforms a one-dimensional array of strings into a two-dimensional character matrix.
 * primeFactorsObject(numVal) : Generates an object detailing the prime factors and their respective powers for a given integer.
 * greatestCommonDivisor(valA, valB) : Determines the largest positive integer that divides both 'valA' and 'valB' without a remainder.
 * leastCommonMultiple(num1, num2) : Calculates the smallest positive integer that is divisible by both 'num1' and 'num2'.
 * numericDifference(operandA, operandB) : Returns the result of 'operandA' minus 'operandB', typically used for numeric sorting.
 * checkPrimality(num) : Evaluates whether a given number is a prime number, returning a boolean value.
 * isValidNumericString(str) : Checks if a string contains only digits and represents a valid non-negative integer.
 * sumNumericElements(numList) : Computes the total sum of all numeric items within an array.
 * binarySearchLargestSmallerOrEqual(arr, target) : Performs a binary search on a sorted array to find the index of the largest element less than or equal to the target.
 * splitByNewline(text) : Divides an input string into an array of substrings using newline characters as separators.
 */
let isDebuggingEnabled = Boolean(0); // A flag to enable or disable verbose debugging output.
const maxSafeVal = 2**53 - 1; // Represents the maximum safe integer value in JavaScript.

function processInput(rawData) {
  // The primary function to handle and process incoming data.
  rawData = rawData.split('\r\n'); // Splits the raw input string by Windows-style newlines.
  let frequencyMap = new Object(); // Initializes an empty object to count occurrences of elements.
  let itemCount = parseInt(rawData[0], 10); // Extracts the first line as the total number of items to process.
  rawData.splice(0, 1); // Removes the initial count line from the input array.
  // First loop: Populates the frequency map by counting initial item occurrences.
  for (let idxCounter = 0; idxCounter < itemCount; idxCounter++) {
    if (frequencyMap[rawData[idxCounter]]) {
      frequencyMap[rawData[idxCounter]]++; // Increments count for existing items.
    } else {
      frequencyMap[rawData[idxCounter]] = 1; // Assigns a count of 1 for new items.
    }
  }
  // Recalculates the item count using a value from the array and the current loop index.
  itemCount = Number(rawData[idxCounter]) + idxCounter;
  idxCounter++; // Advances the counter for the next processing phase.
  // Second loop: Adjusts counts in the frequency map based on subsequent item occurrences.
  for (; idxCounter <= itemCount; idxCounter++) {
    if (frequencyMap[rawData[idxCounter]]) {
      frequencyMap[rawData[idxCounter]]--; // Decrements count for items found.
    } else {
      frequencyMap[rawData[idxCounter]] = -1; // Assigns -1 for items not previously encountered or to signify removal.
    }
  }
  let currentMaximum = 0; // Variable to keep track of the highest frequency observed.
  // Iterates through all unique keys in the frequency map to find the global maximum count.
  Reflect.ownKeys(frequencyMap).forEach((currentKey) => {
    if (frequencyMap[currentKey] > currentMaximum) {
      currentMaximum = frequencyMap[currentKey]; // Updates 'currentMaximum' if a higher frequency is discovered.
    }
  });
  console.info(currentMaximum); // Prints the final maximum frequency to the console.
}
processInput(require('node:fs').readFileSync('/dev/stdin', 'utf8').trim()); // Invokes the main processing logic using standard input.

function getNextState(matrixRef, currentPoint) {
  // This function is defined but its implementation is intentionally left blank.
}

function calculatePermutationIndex(inputSequence) {
  let sequenceElements = []; // An array to store available elements for permutation.
  // Populates 'sequenceElements' based on a value from an external, implicitly global data source.
  for (let idx = 0; idx < externalDataSource[0]; idx++) {
    sequenceElements.push(idx + 1);
  }
  let totalSum = 0; // Accumulator for the permutation index calculation.
  // Iterates through the given 'inputSequence' to compute its lexicographical index.
  for (let idx = 0; idx < inputSequence.length; idx++) {
    let foundIndex = sequenceElements.findIndex(
      (elementValue) => elementValue === inputSequence[idx]
    );
    totalSum += computeFactorial(inputSequence.length - 1 - idx) * foundIndex;
    sequenceElements.splice(foundIndex, 1); // Removes the element that was just used from the available options.
  }
  return totalSum; // Returns the calculated lexicographical permutation index.
}

function sumNumericElements(numericList) {
  let totalSum = 0; // Initializes the sum to zero.
  // Loops through each item in the provided list to compute their aggregate sum.
  for (let idx = 0, listLength = numericList.length; idx < listLength; ++idx) {
    totalSum += Number(numericList[idx]); // Converts each element to a number and adds it to the total.
  }
  return totalSum; // Returns the final sum of the numeric elements.
}

function logConditional(messageContent) {
  // Outputs the 'messageContent' to the console only if the debugging flag is active.
  if (isDebuggingEnabled === true) {
    console.debug(messageContent);
  }
}

function findMaximumIndex(valueCollection) {
  let largestValue = Number.NEGATIVE_INFINITY; // Sets initial largest value to the smallest possible number.
  let largestValueIndex = -1; // Initializes the index of the largest value to an invalid state.
  // Scans through the collection to identify the element with the highest value and its position.
  for (let idx = 0; idx < valueCollection.length; idx++) {
    if (largestValue < valueCollection[idx]) {
      largestValue = valueCollection[idx]; // Updates the largest value found so far.
      largestValueIndex = idx; // Records the index where this new largest value was found.
    }
  }
  return largestValueIndex; // Returns the index of the maximum value within the collection.
}

function findMinimumIndex(valueCollection) {
  let smallestValue = Number.POSITIVE_INFINITY; // Sets initial smallest value to the largest possible number.
  let smallestValueIndex = -1; // Initializes the index of the smallest value to an invalid state.
  // Iterates through the collection to locate the element with the lowest value and its corresponding index.
  for (let idx = 0; idx < valueCollection.length; idx++) {
    if (smallestValue > valueCollection[idx]) {
      smallestValue = valueCollection[idx]; // Updates the smallest value encountered thus far.
      smallestValueIndex = idx; // Records the index where this new smallest value was found.
    }
  }
  return smallestValueIndex; // Returns the index of the minimum value within the collection.
}

function convert1Dto2DCharMatrix(dataMatrix) {
  // Transforms a one-dimensional array where each element is a string into a two-dimensional array of characters.
  for (let currentIdx = 0; currentIdx < dataMatrix.length; currentIdx++) {
    dataMatrix[currentIdx] = String(dataMatrix[currentIdx]).split(''); // Splits each string into an array of individual characters.
  }
  return dataMatrix; // Returns the newly formed 2D character matrix.
}

function checkPrimality(testNumber) {
  // First, verifies if the input is a valid integer.
  if (false === Number.isInteger(testNumber)) {
    return false;
  }
  // Numbers less than or equal to 1 are not considered prime.
  if (testNumber <= 1) {
    return false;
  }
  // The number 2 is unique as the only even prime number.
  if (2 === testNumber) {
    return true;
  }
  // Any other even number (greater than 2) is not prime.
  if (0 === testNumber % 2) {
    return false;
  }
  let rootVal = Math.trunc(Math.sqrt(testNumber)); // Calculates the integer part of the square root of the number.
  // Checks for divisibility by odd numbers starting from 3 up to the calculated square root.
  for (let divisor = 3; divisor <= rootVal; divisor += 2) {
    if (0 === testNumber % divisor) {
      return false; // If divisible, the number is not prime.
    }
  }
  return true; // If no divisors are found, the number is prime.
}

function isValidNumericString(inputString) {
  const numericPattern = /^(0|[1-9]\d*)$/; // Regular expression to match non-negative integer strings (e.g., "0", "123", not "01").
  return numericPattern.test(inputString); // Returns true if the string matches the numeric pattern, false otherwise.
}

function convert1Dto2DCharMatrix(dataMatrix) {
  // This is a redundant function definition, identical to a previous one, which will overwrite the earlier version.
  // Its purpose is to convert each string element within an array into an array of individual characters.
  for (let currentIdx = 0; currentIdx < dataMatrix.length; currentIdx++) {
    dataMatrix[currentIdx] = String(dataMatrix[currentIdx]).split(''); // Splits each string into an array of characters.
  }
  return dataMatrix; // Returns the resulting 2D character array.
}

function computeFactorial(inputInteger) {
  // Defines the base case for the factorial function: 0! equals 1.
  if (inputInteger === 0) {
    return 1;
  }
  // Implements the recursive step for calculating the factorial of a positive integer.
  return inputInteger * computeFactorial(inputInteger - 1);
}

function processNumericMatrix(numericStringArray) {
  // This function is another redefinition of the 'arr1dto2d' pattern, overriding any prior definitions.
  // It processes an array of strings, converting each string into an array of numbers, using space as a delimiter.
  for (let idx = 0; idx < numericStringArray.length; idx++) {
    numericStringArray[idx] = String(numericStringArray[idx])
      .split(' ')
      .map(Number); // Splits the string by spaces and converts each part to a number.
  }
  return numericStringArray; // Returns the array now containing arrays of numbers.
}

function rotateMatrix90Deg(sourceArray) {
  const totalRows = sourceArray.length; // Retrieves the total number of rows from the source matrix.
  const totalCols = sourceArray[0].length; // Retrieves the total number of columns from the first row of the source matrix.
  const lastRowIndex = totalRows - 1; // Calculates the index of the last row.
  let rotatedMatrix = Array.from({
    length: totalCols
  }); // Initializes a new matrix with dimensions swapped (columns become rows).
  // Outer loop: Iterates through what will be the columns of the new rotated matrix.
  for (let newColIdx = 0; newColIdx < totalCols; newColIdx++) {
    rotatedMatrix[newColIdx] = Array.from({
      length: totalRows
    }); // Initializes each 'column' of the new matrix to hold 'totalRows' elements.
    // Inner loop: Iterates through what will be the rows of the new rotated matrix.
    for (let newRowIdx = 0; newRowIdx < totalRows; newRowIdx++) {
      // Applies the transformation logic for a 90-degree clockwise rotation.
      rotatedMatrix[newColIdx][newRowIdx] =
        sourceArray[lastRowIndex - newRowIdx][newColIdx];
    }
  }
  return rotatedMatrix; // Returns the newly formed rotated matrix.
}

function insertPartialArray(targetArray, elementsToInsert, startIndex) {
  // Injects elements from 'elementsToInsert' into 'targetArray', beginning at 'startIndex'.
  for (
    let targetIdx = startIndex, sourceIdx = 0;
    sourceIdx < elementsToInsert.length;
    targetIdx++, sourceIdx++
  ) {
    targetArray[targetIdx] = elementsToInsert[sourceIdx]; // Copies elements one by one.
  }
  return targetArray; // Returns the 'targetArray' after the insertion operation.
}

function reverseSubsegment(workingArray, segmentStart, segmentEnd) {
  // Extracts a specific portion of the 'workingArray' defined by 'segmentStart' and 'segmentEnd'.
  let subsegmentToReverse = workingArray.slice(segmentStart - 1, segmentEnd);
  subsegmentToReverse.reverse(); // Reverses the order of elements within the extracted subsegment.
  // Re-inserts the now-reversed subsegment back into the 'workingArray' at its original starting position.
  workingArray = insertPartialArray(
    workingArray,
    subsegmentToReverse,
    segmentStart - 1
  );
  return workingArray; // Returns the 'workingArray' with the specified subsegment reversed.
}

function padWithLeadingZeros(inputNumber, desiredLength) {
  // Converts the 'inputNumber' to a string and prepends zeros until it reaches the 'desiredLength'.
  // It achieves this by concatenating the number string with a long string of zeros and then slicing it.
  return (String(inputNumber) + '0'.repeat(50)).slice(0, desiredLength);
}

function sumNumericElements(dataList) {
  // This function is a duplicate of a previous 'sumNumericElements' definition, overwriting it.
  let totalSum = 0; // Initializes the sum to zero.
  // Iterates through each item in the provided 'dataList' to calculate their aggregate sum.
  for (let idx = 0, listLength = dataList.length; idx < listLength; ++idx) {
    totalSum += Number(dataList[idx]); // Converts each element to a number and adds it to the total.
  }
  return totalSum; // Returns the final sum of the numeric elements.
}

function primeFactorsObject(inputVal) {
  let factorCounts = {}; // An object to store each prime factor and its corresponding exponent.

  // Handles the edge case where the input value is 1.
  if (inputVal === 1) {
    return {
      '1': 1
    };
  }

  let currentDivisor = 2; // Starts the search for prime factors from the smallest prime, 2.

  // Continues the factorization process until the input value is reduced to 1.
  while (inputVal !== 1) {
    let searchFactor = currentDivisor;
    // Inner loop to find the smallest prime factor of the current 'inputVal'.
    while (searchFactor < maxSafeVal) {
      if (inputVal % searchFactor === 0) {
        inputVal /= searchFactor; // Divides 'inputVal' by the discovered prime factor.
        // Initializes the count for a new prime factor or increments an existing one.
        if (!(factorCounts[searchFactor] > 0)) {
          factorCounts[searchFactor] = 0;
        }
        factorCounts[searchFactor]++;
        break; // Breaks to re-evaluate the reduced 'inputVal' with the current factor.
      }
      searchFactor++; // Moves to the next potential divisor.
    }
    currentDivisor = searchFactor; // Updates 'currentDivisor' for the subsequent iteration of the outer loop.
  }
  return factorCounts; // Returns the object containing all prime factors and their counts.
}

function greatestCommonDivisor(valA, valB) {
  // Implements the Euclidean algorithm to find the GCD.
  // Base case: if 'valB' is zero, 'valA' is the GCD.
  if (valB === 0) {
    return valA;
  }
  // Recursive step: GCD(a, b) is the same as GCD(b, a % b).
  return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(num1, num2) {
  // Defines an internal helper function using a recursive arrow function to calculate GCD.
  let commonDivisorFunc = (x, y) => {
    return y === 0 ? x : commonDivisorFunc(y, x % y);
  };
  // Applies the formula for LCM: (num1 * num2) / GCD(num1, num2).
  return num1 * num2 / commonDivisorFunc(num1, num2);
}

function numericDifference(operandA, operandB) {
  // A straightforward subtraction operation, commonly used as a comparison function for sorting algorithms.
  return operandA - operandB;
}

function binarySearchLargestSmallerOrEqual(sortedArray, targetValue) {
  let resultIndex = -1; // Initializes the index that will store the result.

  let startIndex = 0; // Defines the initial left boundary of the search range.
  let endIndex = sortedArray.length - 1; // Defines the initial right boundary of the search range.

  // The search continues as long as the start index does not exceed the end index.
  while (startIndex <= endIndex) {
    let middleIndex = Math.trunc((startIndex + endIndex) / 2); // Calculates the middle index, rounding down.

    // Compares the element at the middle index with the 'targetValue'.
    if (sortedArray[middleIndex] === targetValue) {
      resultIndex = middleIndex; // Exact match found, store its index.
      break; // Exit the loop as the target is found.
    } else if (sortedArray[middleIndex] < targetValue) {
      // If the middle element is less than the target, the target must be in the right half.
      resultIndex = middleIndex; // This element could be the largest value less than or equal to the target.
      startIndex = middleIndex + 1; // Adjust the left boundary to search the right half.
    } else {
      // If the middle element is greater than the target, the target must be in the left half.
      endIndex = middleIndex - 1; // Adjust the right boundary to search the left half.
    }
  }
  // Returns the found index if an exact or suitable element was located, otherwise returns the start index.
  return resultIndex !== -1 ? resultIndex : startIndex;
}

function splitByNewline(textInput) {
  // Divides the 'textInput' string into an array of substrings using the standard newline character as the delimiter.
  return textInput.split('\n');
}

function isSortedAscending(dataSequence) {
  let orderFlag = true; // Assumes the sequence is sorted in ascending order by default.
  // Iterates through the sequence, comparing adjacent elements to check for proper order.
  for (let idx = 1; idx < dataSequence.length; idx++) {
    if (dataSequence[idx - 1] > dataSequence[idx]) {
      orderFlag = false; // If an element is greater than its successor, the sequence is not sorted.
      break; // Stops checking as soon as an unsorted pair is found.
    }
  }
  return orderFlag; // Returns true if the sequence is sorted, false otherwise.
}

function factorizeIntoPrimes(numberToFactor) {
  // Computes the integer part of the square root of the number to optimize prime factorization.
  let sqrtValue = Math.trunc(Math.sqrt(numberToFactor));

  let exponentCount = 0; // Counter to track the power of each prime factor.

  let primeFactorMap = {}; // An object to store prime factors and their corresponding exponents.

  // Iterates through potential prime factors from 2 up to the calculated square root.
  for (let currentFactor = 2; currentFactor <= sqrtValue; currentFactor++) {
    if (numberToFactor % currentFactor === 0) {
      exponentCount = 0; // Resets the exponent counter for the new prime factor.
      do {
        exponentCount++; // Increments the exponent each time the factor divides the number.
        numberToFactor = numberToFactor / currentFactor; // Divides the number by the current factor.
      } while (numberToFactor % currentFactor === 0);

      primeFactorMap[currentFactor] = exponentCount; // Stores the prime factor and its total exponent.
    }
  }

  // If, after all divisions up to the square root, 'numberToFactor' is still greater than 1,
  // it means the remaining 'numberToFactor' itself is a prime factor.
  if (numberToFactor > 1) {
    primeFactorMap[numberToFactor] = 1;
  }

  return primeFactorMap; // Returns the map containing all prime factors and their powers.
}