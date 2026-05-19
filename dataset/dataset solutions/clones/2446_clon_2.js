function processInput(rawData) {
  // Parse the first line as the count of elements (though not directly used in the calculation logic)
  let countElements = rawData[0] - 0;

  // Initialize a frequency counter for numbers and track the maximum value
  const frequencyCounter = {};
  let maxValue = 0;

  // Process the second line of input: split by space, convert to numbers, and count frequencies
  rawData[1].split(" ").forEach(currentNumStr => {
    // Convert the string representation to a numeric value
    const currentNum = Number(currentNumStr);
    // Increment the count for the current number in the frequency map
    frequencyCounter[currentNum] = (frequencyCounter[currentNum] || 0) + 1;
    // Update the maximum value encountered so far
    maxValue = Math.max(maxValue, currentNum);
  });

  // Initialize the final result variable
  let finalResult = 1;

  // Declare an intermediate storage object (its specific use here is minimal, but preserved)
  const intermediateStorage = {};
  // Assign a value to a specific key in the intermediate storage
  intermediateStorage[-1] = 1;

  // Loop from 1 up to the maximum number found
  for (let idx = 1; idx <= maxValue; idx++) {
    // Retrieve counts for (idx-1) and idx, defaulting to 0 if not present
    const prevCount = frequencyCounter[idx - 1] || 0;
    const currCount = frequencyCounter[idx] || 0;

    // Multiply the final result by (prevCount ^ currCount)
    finalResult *= Math.pow(prevCount, currCount);

    // If the count for the current index is zero, the final result becomes zero
    if (currCount === 0) {
      finalResult = 0;
    }

    // Apply modulo operation to keep the result within bounds
    finalResult %= 998244353;
  }

  // Output the computed final result to the console
  console.log(finalResult);
}

// Global object to cache factorial results for memoization
const factorialCache = {};

/**
 * Calculates the factorial of a given number using recursion and memoization.
 * This function is defined but not called within the provided main logic.
 * @param {number} numVal - The number for which to calculate the factorial.
 * @returns {number} The factorial of numVal.
 */
function calculateFactorial(numVal) {
  // Base case: factorial of 1 is 1
  if (numVal === 1) {
    return 1;
  }
  // Check if the result is already in the cache
  if (factorialCache[numVal]) {
    return factorialCache[numVal];
  }
  // Calculate and store the result in the cache before returning
  return (factorialCache[numVal] = numVal * calculateFactorial(numVal - 1));
}

// Read input from standard input, decode as UTF-8, split by newlines, and pass to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
