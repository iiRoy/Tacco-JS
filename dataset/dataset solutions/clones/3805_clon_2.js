function ProcessData(incomingText) {
  // Split the entire input string into individual lines based on newline characters.
  let linesOfInput = incomingText.split("\n");

  // Check if the last line is empty (common with some input methods) and remove it if so.
  if (linesOfInput[linesOfInput.length - 1] === '') {
    linesOfInput.pop();
  }

  // Extract the total number of elements from the first line of input.
  // The first number on the first line represents 'N'.
  const numItems = parseInt(linesOfInput[0].split(' ')[0], 10);

  // Declare variables that will be used for the sliding window algorithm.
  let currentAccumulator; // This variable will hold the sum/XOR sum of the current window.
  let rightWindowPointer; // This pointer indicates the rightmost boundary of the current valid window.

  // Parse the array of numerical values from the second line of input.
  // Each string element is converted into an integer.
  const dataValues = linesOfInput[1].split(' ').map(elementString => {
    return parseInt(elementString, 10);
  });

  // This array will store the maximum reachable right pointer for each possible left window start.
  const maxRightPointers = [];

  // Initialize the sliding window for the very first iteration, where the left boundary is at index 0.
  rightWindowPointer = 0;
  currentAccumulator = 0;

  // Expand the window to the right as long as the condition (XOR sum === arithmetic sum) holds true.
  // This condition is met if and only if there are no common set bits between the current accumulator and the new element (i.e., their bitwise AND is 0).
  while (rightWindowPointer < numItems && ((currentAccumulator ^ dataValues[rightWindowPointer]) === (currentAccumulator + dataValues[rightWindowPointer]))) {
    currentAccumulator = currentAccumulator + dataValues[rightWindowPointer]; // Add the element to the arithmetic sum.
    rightWindowPointer++; // Move the right pointer forward.
  }
  // Record the maximum inclusive right index achieved for the current left boundary (which is 0).
  maxRightPointers.push(rightWindowPointer - 1);

  // Iterate through all subsequent possible starting positions for the left boundary of the window.
  // The loop begins from the second element (index 1), as the first element (index 0) was handled above.
  for (let leftWindowStartIdx = 1; leftWindowStartIdx < numItems; leftWindowStartIdx++) {
    // As the left boundary moves, the element that just left the window must be removed from the accumulator.
    // Due to the property (x ^ y) === (x + y) implying (x & y) === 0, removing an element 'a' from a sum 's'
    // where 's' was formed by elements satisfying this property, can be done by XORing 's' with 'a'.
    currentAccumulator = currentAccumulator ^ dataValues[leftWindowStartIdx - 1];

    // Continue expanding the window to the right from its previous position.
    // The right pointer only moves forward or stays in place; it never retracts.
    while (rightWindowPointer < numItems && ((currentAccumulator ^ dataValues[rightWindowPointer]) === (currentAccumulator + dataValues[rightWindowPointer]))) {
      currentAccumulator = currentAccumulator + dataValues[rightWindowPointer]; // Add the new element.
      rightWindowPointer++; // Advance the right pointer.
    }
    // Store the maximum inclusive right index achieved for the current left boundary.
    maxRightPointers.push(rightWindowPointer - 1);
  }

  // Calculate the total count of all valid subarrays.
  // For each left starting position (represented by 'windowStartIdx'), if the maximum right pointer
  // reached is 'currentMaxRight', then all subarrays from 'windowStartIdx' to 'currentMaxRight' (inclusive)
  // are valid. The number of such subarrays is (currentMaxRight - windowStartIdx + 1).
  const finalResult = maxRightPointers.reduce((totalCount, currentMaxRight, windowStartIdx) => {
    return totalCount + (currentMaxRight - windowStartIdx + 1);
  }, 0); // Initialize the total count to zero.

  // Output the final calculated total count to the standard console.
  console.log(finalResult);
}

// The following line is responsible for reading input from standard input and invoking the main processing function.
// It should not be altered to maintain compatibility with the execution environment.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
