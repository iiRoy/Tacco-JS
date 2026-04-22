/*
 * This function locates the insertion point for a value in a sorted array using binary search.
 * It returns the index where the targetValue could be inserted to maintain sorted order,
 * or the index of the first element greater than or equal to targetValue.
 */
function findBoundaryIndex(
  dataCollection, // The array to search within
  startPtr,       // The starting index of the current search range
  endPtr,         // The ending index of the current search range (exclusive)
  targetVal       // The value to find the lower bound for
) {
  for (
    let midPtr; // Declare a variable for the middle pointer
    1 < endPtr - startPtr; // Continue as long as the search range has more than one element
  ) {
    // Calculate the middle index, using bitwise operations for efficiency and integer truncation
    midPtr = 0 | ((startPtr + endPtr) >> 1);

    // If the element at the middle index is less than the target value,
    // then the target must be in the upper half (or beyond the current midPtr).
    if (dataCollection[midPtr] < targetVal) {
      startPtr = midPtr; // Move the start pointer to midPtr
    }
    // Otherwise, the target value is in the lower half (or at midPtr).
    else {
      endPtr = midPtr; // Move the end pointer to midPtr
    }
  }
  // After the loop, startPtr and endPtr are adjacent.
  // Check if the element at startPtr is less than the target.
  // If it is, the insertion point is endPtr; otherwise, it's startPtr.
  return dataCollection[startPtr] < targetVal ? endPtr : startPtr;
}

/**
 * A utility function designed to sort numerical values in ascending order.
 * This is typically used with Array.prototype.sort().
 * @param {number} valueOne - The first number for comparison.
 * @param {number} valueTwo - The second number for comparison.
 * @returns {number} A negative value if valueOne < valueTwo, zero if equal, a positive value if valueOne > valueTwo.
 */
function sortNumericalValues(
  valueOne,
  valueTwo
) {
  return valueOne - valueTwo; // Standard numerical ascending sort logic
}

/**
 * The primary execution function for processing input data.
 * It reads a sequence of numbers and calculates a specific combination count.
 * @param {string} rawInputText - The raw input string containing numbers, separated by newlines and spaces.
 */
function executeProgram(rawInputText) {

  // Parse the total quantity of elements from the first line of input.
  const quantityOfElements = rawInputText.split("\n")[0] - 0;

  // Parse the sequence of numbers from the second line, converting them to numeric type.
  const numberSequence = rawInputText.split("\n")[1].split(" ").map(
    (currentVal) => currentVal - 0
  );

  // Initialize the accumulator for the final result.
  let finalTally = 0;

  // Declare variables for the elements in the triplet and a placeholder.
  let firstElement, secondElement, thirdElementPlaceholder;

  // Sort the array of numbers in ascending order to enable binary search.
  numberSequence.sort(sortNumericalValues);

  // Iterate through the array to pick the first element of a potential triplet.
  for (
    let outerLoopIdx = 0;
    outerLoopIdx < quantityOfElements - 2;
    outerLoopIdx++
  ) {
    firstElement = numberSequence[outerLoopIdx]; // Assign the current element to firstElement

    // Iterate through the remaining array elements to pick the second element.
    for (
      let innerLoopIdx = outerLoopIdx + 1;
      innerLoopIdx < quantityOfElements - 1;
      innerLoopIdx++
    ) {
      secondElement = numberSequence[innerLoopIdx]; // Assign the current element to secondElement

      // Find the upper bound for the sum of the first two elements.
      // This uses binary search to find the first element in the remaining part of the array
      // that is greater than or equal to `firstElement + secondElement`.
      // Subtracting 1 gives the index of the last element less than `firstElement + secondElement`.
      const temporaryIndex =
        findBoundaryIndex(
          numberSequence,
          innerLoopIdx + 1, // Start search from the element after secondElement
          quantityOfElements,
          firstElement + secondElement
        ) - 1;

      // Add the count of valid third elements to the final tally.
      // A valid third element is one that is greater than secondElement
      // and less than firstElement + secondElement.
      // The count is `temporaryIndex - innerLoopIdx`.
      finalTally += temporaryIndex - innerLoopIdx;
    }
  }

  // Output the computed final result to the console.
  console.log(finalTally);

  // The function implicitly returns undefined, but an explicit return can be added for clarity.
  return;
}

// Invoke the main program function, reading input from standard input.
executeProgram(require("node:fs").readFileSync("/dev/stdin", "utf8"));