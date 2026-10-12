function categorizeData(incomingValues) {
  // This array will store numbers that are multiples of ten.
  const multiplesOfTen = [];
  // This array will hold all other numbers.
  const remainingValues = [];
  // This variable accumulates the sum of numbers that are multiples of ten.
  let sumOfMultiples = 0;

  incomingValues.forEach(function (valueString) {
    // Convert the string representation to a numeric value.
    const numericValue = Number(valueString);

    // Check if the numeric value is a multiple of ten.
    if (numericValue % 10 === 0) {
      multiplesOfTen.push(numericValue);
      sumOfMultiples += numericValue;
      return; // Move to the next item in the iteration.
    }
    // If not a multiple of ten, add it to the 'remainingValues' array.
    remainingValues.push(numericValue);
  });

  // Return an object containing the classified data and their sum.
  return {
    multiplesOfTen: multiplesOfTen,
    sumOfMultiples: sumOfMultiples,
    remainingValues: remainingValues,
  };
}

function determineOptimalPath(currentElement, exclusionIndex, categorizationOutcome) {
  // This function calculates a maximum pattern by recursively summing elements.
  // It filters out one element from 'remainingValues' based on 'exclusionIndex'.
  return computeRecursiveSum(
    currentElement + categorizationOutcome.sumOfMultiples,
    categorizationOutcome.remainingValues.filter(function (item, idx) {
      return idx !== exclusionIndex; // Exclude the element at the specified index.
    }),
    0
  );
}

function computeRecursiveSum(accumulatorValue, dataElements, currentPosition) {
  // Base case: if there's no next element, return the current accumulated value.
  if (typeof dataElements[currentPosition + 1] === 'undefined') {
    return accumulatorValue;
  }

  // Recursive call 1: include the current element in the sum.
  const resultA = computeRecursiveSum(
    accumulatorValue + dataElements[currentPosition],
    dataElements,
    currentPosition + 1
  );
  // Recursive call 2: exclude the current element from the sum.
  const resultB = computeRecursiveSum(accumulatorValue, dataElements, currentPosition + 1);

  // Prioritize resultA if it's greater than or equal to resultB and not a multiple of ten.
  if (resultA >= resultB && resultA % 10 !== 0) {
    return resultA;
  }
  // Prioritize resultB if it's greater than or equal to resultA and not a multiple of ten.
  if (resultA <= resultB && resultB % 10 !== 0) {
    return resultB;
  }

  // If both results are multiples of ten, or if one is a multiple of ten and the other is not
  // (and the non-multiple-of-ten one wasn't chosen by the above conditions), return 0.
  // This implies that if both are multiples of ten, or if the non-multiple-of-ten option
  // was smaller, we default to 0.
  return 0;
}

/**
 * Processes the raw input string to find a maximum value based on specific rules.
 * @param {String} rawData The input string, typically from stdin.
 */
function ProcessInputData(rawData) {
  // Split the input string into an array of lines.
  const linesOfData = rawData.split('\n');
  // Classify the input data, excluding the first line (which might be a count or header).
  const categorizationOutcome = categorizeData(linesOfData.slice(1));
  let finalMaximum = 0; // Initialize the maximum result found.

  // Iterate over the 'remainingValues' to calculate potential maximum patterns.
  categorizationOutcome.remainingValues.forEach(function (elementValue, idx) {
    // Update 'finalMaximum' with the greater of its current value or the result of 'determineOptimalPath'.
    finalMaximum = Math.max(
      finalMaximum,
      determineOptimalPath(elementValue, idx, categorizationOutcome)
    );
  });

  return finalMaximum; // Return the overall maximum value.
}

// Read input from standard input, process it, and print the result to the console.
console.log(ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));
