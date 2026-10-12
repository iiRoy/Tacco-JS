function processInput(rawData) {
  // Parse the input string into a structured array of numbers.
  // Each line is split by space, and each value is converted to an integer.
  const parsedData = rawData.split("\n").map(function(lineContent) {
    return lineContent.split(" ").map(function(numericValue) {
      return parseInt(numericValue, 10); // Use radix 10 for parseInt
    });
  });

  // Extract the budget value from the first line of input.
  const limitVal = parsedData[0][1];
  // Extract the sequence of numbers from the second line.
  const numSequence = parsedData[1];

  // Determine the largest individual element in the sequence.
  const maximumElement = findLargestValue(numSequence);

  // Calculate an upper bound for the potential divisor candidates.
  // This involves the maximum element and a value derived from the sequence itself.
  const maximumDivisorCandidate = Math.min(maximumElement + limitVal, maximumElement + determineBalancePoint(numSequence));

  // Iterate downwards from the maximum candidate divisor to 1.
  // The first candidate that satisfies the divisibility condition is the answer.
  for (let divisorCandidate = maximumDivisorCandidate; divisorCandidate > 1; divisorCandidate--) {
    if (checkDivisibilityCondition(divisorCandidate, numSequence, limitVal)) {
      // If a valid divisor is found, print it and exit.
      return console.log(divisorCandidate);
    }
  }

  // If no divisor greater than 1 is found, 1 is the default answer.
  return console.log(1);
}

/**
 * This function attempts to find a "balance point" within a sorted array.
 * It simulates a process of accumulating sums from both ends of the array
 * to find a minimum sum that can be achieved.
 * @param {number[]} inputNumbers - The array of numbers to process.
 * @returns {number} The minimum of the two accumulated sums at the balance point.
 */
function determineBalancePoint(inputNumbers) {
  // Create a sorted copy of the input array to avoid modifying the original.
  const orderedNumbers = [...inputNumbers].sort((a, b) => a - b);
  let leftAccumulator = 0; // Sum from the left side
  let rightAccumulator = 0; // Sum from the right side
  let rightPointer = orderedNumbers.length - 1; // Pointer for the right side

  // Initialize the right accumulator with the largest element.
  rightAccumulator = orderedNumbers[rightPointer];

  // Iterate from the left, moving the left pointer.
  for (let leftPointer = 0; leftPointer < rightPointer; leftPointer++) {
    leftAccumulator += leftPointer; // Accumulate the index itself, not the value at the index. This seems unusual but matches original.

    // If the left sum is still less than or equal to the right sum, continue.
    if (leftAccumulator <= rightAccumulator) {
      continue;
    } else {
      // If left sum exceeds right sum, adjust the right sum by adding more elements from the right.
      rightPointer--; // Move right pointer inwards
      while (rightAccumulator < leftAccumulator && rightPointer > leftPointer) {
        rightAccumulator += orderedNumbers[rightPointer]; // Add the value at the right pointer.
        rightPointer--; // Continue moving right pointer inwards.
      }
    }
  }
  // Return the minimum of the two final accumulated sums.
  return Math.min(leftAccumulator, rightAccumulator);
}

/**
 * Finds the largest value in a given array of numbers.
 * @param {number[]} valueCollection - The array to search.
 * @returns {number} The maximum value in the array.
 */
function findLargestValue(valueCollection) {
  // Use reduce to iterate through the array and find the maximum.
  return valueCollection.reduce(function(currentMax, nextValue) {
    return Math.max(currentMax, nextValue);
  });
}

/**
 * Calculates the sum of all numbers in an array.
 * (This function is present in the original but not called by `main` or `isG`.)
 * @param {number[]} numberList - The array of numbers to sum.
 * @returns {number} The total sum of the array elements.
 */
function calculateTotal(numberList) {
  // Use reduce to sum all elements, starting with an initial value of 0.
  return numberList.reduce(function(accumulator, element) {
    return accumulator + element;
  }, 0);
}

/**
 * Checks if a given potentialDivisor satisfies a specific condition
 * based on remainders and a cost budget.
 * @param {number} potentialDivisor - The number to test as a divisor.
 * @param {number[]} originalNumbers - The array of numbers to check against the divisor.
 * @param {number} costBudget - The initial budget for modifications.
 * @returns {boolean} True if the condition is met, false otherwise.
 */
function checkDivisibilityCondition(potentialDivisor, originalNumbers, costBudget) {
  const remainderPairs = []; // Stores pairs of (mod1, mod2) for each number.
  let remainingBudget = 2 * costBudget; // A temporary budget, twice the original.

  // Iterate through each number in the original sequence.
  for (let idx = 0; idx < originalNumbers.length; idx++) {
    const firstRemainder = originalNumbers[idx] % potentialDivisor;

    // If the number is already perfectly divisible, no cost is incurred for it.
    if (firstRemainder === 0) {
      continue;
    }

    // Calculate the second remainder (complement to reach the divisor).
    const secondRemainder = potentialDivisor - firstRemainder;

    // If the cost to make it divisible (either mod1 or mod2) exceeds the individual budget 'k',
    // then this potentialDivisor is not valid.
    if (costBudget < Math.min(firstRemainder, secondRemainder)) {
      return false;
    }

    // Deduct the minimum cost from the temporary budget.
    remainingBudget -= Math.min(firstRemainder, secondRemainder);

    // If the temporary budget drops below zero, this potentialDivisor is not valid.
    if (remainingBudget < 0) {
      return false;
    }

    // Store the pair of remainders for further processing.
    remainderPairs.push([firstRemainder, secondRemainder]);
  }

  // After processing all numbers, use a recursive traversal to check if
  // the remaining budget can be balanced.
  return explorePaths(remainderPairs, 0, 0, 0, costBudget);
}

/**
 * Recursively explores paths to balance costs based on remainder pairs within a budget.
 * This function implements a depth-first search-like approach.
 * @param {Array<number[]>} remainderData - An array of [mod1, mod2] pairs.
 * @param {number} currentDepth - The current index/level in the remainderData array.
 * @param {number} currentLeftCost - Accumulated cost for the 'left' path.
 * @param {number} currentRightCost - Accumulated cost for the 'right' path.
 * @param {number} totalBudget - The maximum allowed cost for either path.
 * @returns {boolean} True if a balanced path within budget is found, false otherwise.
 */
function explorePaths(remainderData, currentDepth, currentLeftCost, currentRightCost, totalBudget) {
  // Base cases for pruning: if either cost exceeds the budget, this path is invalid.
  if (currentLeftCost > totalBudget) return false;
  if (currentRightCost > totalBudget) return false;

  // Base case for success: if all remainder pairs have been processed,
  // check if the accumulated left and right costs are equal.
  if (currentDepth === remainderData.length) {
    return currentLeftCost === currentRightCost;
  }

  // Recursive step: explore both possibilities for the current remainder pair.
  // Prioritize the path that keeps the costs closer.
  if (currentLeftCost < currentRightCost) {
    // If left cost is smaller, try adding to left first, then right.
    return traverseLeftBranch(remainderData, currentDepth, currentLeftCost, currentRightCost, totalBudget) ||
           traverseRightBranch(remainderData, currentDepth, currentLeftCost, currentRightCost, totalBudget);
  } else {
    // If right cost is smaller or equal, try adding to right first, then left.
    return traverseRightBranch(remainderData, currentDepth, currentLeftCost, currentRightCost, totalBudget) ||
           traverseLeftBranch(remainderData, currentDepth, currentLeftCost, currentRightCost, totalBudget);
  }
  // This return false is unreachable due to the if/else structure covering all cases.
  // It's kept for structural similarity to the original.
  // return false;
}

/**
 * Explores the path where the 'left' cost is incremented by the first remainder.
 * @param {Array<number[]>} dataPoints - The array of remainder pairs.
 * @param {number} currentLevel - The current index in dataPoints.
 * @param {number} accumulatedLeftCost - Current accumulated left cost.
 * @param {number} accumulatedRightCost - Current accumulated right cost.
 * @param {number} availableBudget - The total budget.
 * @returns {boolean} Result of the recursive call.
 */
function traverseLeftBranch(dataPoints, currentLevel, accumulatedLeftCost, accumulatedRightCost, availableBudget) {
  return explorePaths(dataPoints, currentLevel + 1, accumulatedLeftCost + dataPoints[currentLevel][0], accumulatedRightCost, availableBudget);
}

/**
 * Explores the path where the 'right' cost is incremented by the second remainder.
 * @param {Array<number[]>} dataPoints - The array of remainder pairs.
 * @param {number} currentLevel - The current index in dataPoints.
 * @param {number} accumulatedLeftCost - Current accumulated left cost.
 * @param {number} accumulatedRightCost - Current accumulated right cost.
 * @param {number} availableBudget - The total budget.
 * @returns {boolean} Result of the recursive call.
 */
function traverseRightBranch(dataPoints, currentLevel, accumulatedLeftCost, accumulatedRightCost, availableBudget) {
  return explorePaths(dataPoints, currentLevel + 1, accumulatedLeftCost, accumulatedRightCost + dataPoints[currentLevel][1], availableBudget);
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
