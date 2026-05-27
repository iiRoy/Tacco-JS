function calculateXorPossibility(remainingElements, targetXorValue, inputNumbers, binarySequence, memoizationCache) {
  // Base case: If there are no more elements to consider,
  // the target XOR sum must be zero for this path to be valid.
  if (remainingElements === 0) {
    return targetXorValue === 0;
  }

  // Determine the current element's index from the end of the sequence.
  const currentElementIndex = binarySequence.length - remainingElements;
  const currentDigit = binarySequence[currentElementIndex]; // Fetch the binary digit ('0' or '1').

  // Check if the result for this specific subproblem (defined by remainingElements and targetXorValue)
  // has already been computed and stored in our memoization cache.
  if (memoizationCache[remainingElements] !== undefined && memoizationCache[remainingElements][targetXorValue] !== undefined) {
    return memoizationCache[remainingElements][targetXorValue];
  }

  let possibleOutcome; // This variable will store the boolean result of the current computation.

  // The decision logic branches based on the value of the current binary digit.
  if (currentDigit === '1') {
    // If the digit is '1', both recursive calls must yield a true result (logical AND).
    // Option 1: Exclude the current number from the XOR sum.
    // Option 2: Include the current number, XORing it with the target sum.
    possibleOutcome = calculateXorPossibility(remainingElements - 1, targetXorValue, inputNumbers, binarySequence, memoizationCache) &&
                      calculateXorPossibility(remainingElements - 1, targetXorValue ^ inputNumbers[currentElementIndex], inputNumbers, binarySequence, memoizationCache);
  } else {
    // If the digit is '0', at least one of the recursive calls must yield a true result (logical OR).
    // Option 1: Exclude the current number.
    // Option 2: Include the current number.
    possibleOutcome = calculateXorPossibility(remainingElements - 1, targetXorValue, inputNumbers, binarySequence, memoizationCache) ||
                      calculateXorPossibility(remainingElements - 1, targetXorValue ^ inputNumbers[currentElementIndex], inputNumbers, binarySequence, memoizationCache);
  }

  // Before returning, store the computed result in the memoization cache
  // to prevent re-calculation if this subproblem is encountered again.
  if (memoizationCache[remainingElements] === undefined) {
    memoizationCache[remainingElements] = {}; // Initialize the inner object if it doesn't exist.
  }
  memoizationCache[remainingElements][targetXorValue] = possibleOutcome;

  return possibleOutcome; // Return the final computed outcome for this state.
}

// The primary function to handle input processing, test case parsing,
// and orchestrating the XOR possibility calculation for each test case.
function processInput(rawInputString) {
  const inputLines = rawInputString.split('\n'); // Divide the raw input string into an array of lines.
  const totalTestCases = Number(inputLines[0]); // The very first line specifies the total number of test cases.

  // Iterate through each test case. Each test case occupies three lines of input.
  for (let caseIterator = 0; caseIterator < totalTestCases * 3; caseIterator += 3) {
    // Extract the specific data required for the current test case.
    // The length of the sequence (N) is on the line immediately following the test case count.
    const sequenceLength = inputLines[caseIterator + 1];
    // The array of numbers (A) is on the subsequent line; it's split by spaces and converted to actual numbers.
    const inputNumbers = inputLines[caseIterator + 2].split(' ').map(Number);
    // The binary string (S) is found on the line after the array of numbers.
    const binarySequence = inputLines[caseIterator + 3];

    // Invoke the recursive solver function. We start with the full sequence length,
    // an initial target XOR sum of 0, and an empty memoization object.
    const possibleOutcome = calculateXorPossibility(sequenceLength, 0, inputNumbers, binarySequence, {});

    // Based on the boolean outcome, print '0' if possible (true) or '1' if not possible (false).
    console.log(possibleOutcome ? '0' : '1');
  }
}

// Read the entire content from standard input synchronously using Node.js 'fs' module,
// then pass this raw string data to our main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
