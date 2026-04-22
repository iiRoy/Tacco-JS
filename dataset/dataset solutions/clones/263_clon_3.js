const constructSubsequences = (sourceItems, selectionLength) => {
  // Validate the input: selectionLength must be a non-negative integer.
  if (typeof selectionLength !== 'number' || !Number.isInteger(selectionLength) || selectionLength < 0) {
    console.error(`Error: Invalid selection length provided (${selectionLength}). Must be a non-negative integer.`);
    return []; // Return an empty array for invalid input.
  }

  // Base case: If no elements need to be selected, the only permutation is an empty array.
  if (selectionLength === 0) {
    return [[]];
  }

  const resultCollection = []; // This array will hold all generated permutations.
  const initialSourceSize = sourceItems.length; // Cache the original size for the loop boundary.

  // If selectionLength is greater than the available items, no valid permutations can be formed.
  if (selectionLength > initialSourceSize) {
    return [];
  }

  // Iterate through each element in the source collection.
  for (let currentIdx = 0; currentIdx < initialSourceSize; currentIdx++) {
    // Extract the element at the current index.
    // Using splice to remove the element, which also modifies the array for the recursive call.
    const [selectedElement] = sourceItems.splice(currentIdx, 1);

    // Recursively generate permutations for the remaining elements,
    // reducing the selection length by one.
    const subPermutations = constructSubsequences(sourceItems, selectionLength - 1);

    // Combine the currently selected element with each of the sub-permutations.
    // This creates new arrays for each combination.
    for (const partialSequence of subPermutations) {
      resultCollection.push([selectedElement, ...partialSequence]);
    }

    // Backtrack: Reinsert the selected element into its original position
    // to restore the array state for the next iteration.
    sourceItems.splice(currentIdx, 0, selectedElement);
  }

  return resultCollection; // Return the comprehensive list of permutations.
};

// Helper function to compute the weighted sum of a sequence of numbers.
// The weight for each number is its position (1-indexed).
const calculateWeightedSequenceSum = (numberSequence) => {
  let accumulatedSum = 0;
  // Iterate through the sequence, adding (element * (index + 1)) to the sum.
  for (let k = 0; k < numberSequence.length; k++) {
    accumulatedSum += numberSequence[k] * (k + 1);
  }
  return accumulatedSum;
};

// Main processing function for the application logic.
const processInputData = () => {
  // Define the pool of digits from which permutations are drawn.
  const digitPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Iterate over each line of input received from the standard input.
  for (const currentInputLine of systemInputLines) {
    const trimmedLine = currentInputLine.trim();

    // Skip over any lines that are empty or contain only whitespace.
    if (trimmedLine.length === 0) {
      // console.debug("Skipping an empty input line."); // Optional: for verbose logging
      continue;
    }

    // Attempt to parse numerical parameters from the input line.
    // Each value is converted to a floating-point number.
    const parsedValues = trimmedLine.split(' ').map(strVal => {
      const num = parseFloat(strVal);
      // Validate if parsing resulted in a valid number.
      if (isNaN(num)) {
        console.warn(`Warning: Non-numeric value '${strVal}' found in line '${trimmedLine}'. This part of the line will be ignored.`);
        return null; // Indicate a parsing failure.
      }
      return num;
    }).filter(val => val !== null); // Remove any nulls (failed parses).

    // Ensure that at least two valid numbers (N and S) were successfully parsed.
    if (parsedValues.length < 2) {
      console.error(`Error: Insufficient valid numeric parameters in line '${trimmedLine}'. Expected at least 2, but found ${parsedValues.length}. Skipping this line.`);
      continue;
    }

    const permutationLength = Math.floor(parsedValues[0]); // N: number of digits to select.
    const desiredTargetValue = parsedValues[1];             // S: the target weighted sum.

    // Basic validation for permutationLength.
    if (permutationLength < 0 || permutationLength > digitPool.length) {
      console.warn(`Warning: Invalid permutation length N=${permutationLength} for digit pool size ${digitPool.length}. Skipping line '${trimmedLine}'.`);
      continue;
    }

    let matchingCombinationsCount = 0; // Counter for permutations that meet the criteria.

    // Generate all possible permutations of 'permutationLength' digits from the 'digitPool'.
    // A copy of digitPool is passed to prevent modification of the original array by constructSubsequences.
    const allGeneratedPermutations = constructSubsequences([...digitPool], permutationLength);

    // Evaluate each generated permutation.
    for (const currentDigitSequence of allGeneratedPermutations) {
      const sequenceWeightedSum = calculateWeightedSequenceSum(currentDigitSequence);

      // Check if the calculated weighted sum matches the desired target value.
      if (sequenceWeightedSum === desiredTargetValue) {
        matchingCombinationsCount++; // Increment counter if a match is found.
      }
    }

    // Output the final count for the current input line's parameters.
    console.log(`Input (N=${permutationLength}, S=${desiredTargetValue}): Found ${matchingCombinationsCount} matching sequences.`);
  }
};

// --- Standard Input Handling Logic ---

// Accumulates raw data chunks from standard input.
let rawInputBuffer = '';
// Stores processed lines from standard input, ready for the main logic.
let systemInputLines = [];

// Check if running in a Node.js-like environment where process.stdin is available.
if (typeof process !== 'undefined' && process.stdin && process.stdin.isTTY) {
  process.stdin.setEncoding('utf8'); // Specify character encoding for input stream.

  // Event handler for when data is received from stdin.
  process.stdin.on('data', (dataChunk) => {
    rawInputBuffer += dataChunk; // Append incoming data to the buffer.
  });

  // Event handler for when the stdin stream ends (e.g., Ctrl+D or EOF).
  process.stdin.on('end', () => {
    // Split the accumulated buffer into individual lines.
    // Filter out any empty strings that might result from trailing newlines.
    systemInputLines = rawInputBuffer.split('\n').filter(line => line.length > 0);

    // Once all input is collected, trigger the main processing function.
    processInputData();
  });

  // Event handler for any errors encountered during stdin processing.
  process.stdin.on('error', (err) => {
    console.error("An error occurred while reading from standard input:", err);
    process.exit(1); // Exit the process with an error code.
  });

  // Optional: Explicitly resume the stdin stream if it was paused.
  // In many Node.js scenarios, this is implicitly handled by setting encoding or adding listeners.
  // process.stdin.resume();
} else {
  // Fallback for environments where process.stdin is not available (e.g., browser, non-interactive tests).
  console.warn("Standard input (process.stdin) not available or not TTY. Using mock data for demonstration purposes.");
  // Provide some sample input data for testing without actual stdin.
  systemInputLines = [
    "1 0",       // N=1, S=0 -> [0] -> 0*1 = 0. Count: 1
    "2 3",       // N=2, S=3 -> [0,1]->0*1+1*2=2, [1,0]->1*1+0*2=1, [0,2]->0*1+2*2=4, [2,0]->2*1+0*2=2, [1,2]->1*1+2*2=5, [2,1]->2*1+1*2=4. None sum to 3. Count: 0. (Original code output 0).
                 // Wait, for 2 3: [0,3] -> 0*1+3*2=6, [3,0]->3*1+0*2=3. If using digits 0-9.
                 // Ah, the original code uses [0,1,2,3,4,5,6,7,8,9] as source.
                 // For [0,1,2,3,4,5,6,7,8,9], N=2, S=3
                 // [1, ?]
                 // [?, 1]
                 // (0,3) -> 0*1 + 3*2 = 6
                 // (3,0) -> 3*1 + 0*2 = 3. Yes, this is one.
                 // (1,2) -> 1*1 + 2*2 = 5
                 // (2,1) -> 2*1 + 1*2 = 4
                 // (0,?)
                 // (1,?)
                 // (2,?)
                 // (3,?)
                 // How many permutations of 2 digits from 0-9 sum to 3?
                 // (3,0) -> 3*1 + 0*2 = 3.
                 // (X,Y) = X*1 + Y*2 = 3.
                 // If X=0, 2Y=3 (no int Y)
                 // If X=1, 1+2Y=3 -> 2Y=2 -> Y=1. Permutation (1,1) is not allowed if digits must be unique.
                 // The original `perm` generates permutations *without replacement*. So (1,1) is not possible.
                 // If X=2, 2+2Y=3 -> 2Y=1 (no int Y)
                 // If X=3, 3+2Y=3 -> 2Y=0 -> Y=0. Permutation (3,0).
                 // So only (3,0) works. Result should be 1.
                 // My `constructSubsequences` function also does permutations without replacement, so it's consistent.
    "3 6",       // N=3, S=6
                 // (X,Y,Z) -> X*1 + Y*2 + Z*3 = 6
                 // (0,0,2) No, unique digits
                 // (0,1,?) 0*1+1*2+Z*3=6 -> 2+3Z=6 -> 3Z=4 (no int Z)
                 // (0,2,?) 0*1+2*2+Z*3=6 -> 4+3Z=6 -> 3Z=2 (no int Z)
                 // (0,3,?) 0*1+3*2+Z*3=6 -> 6+3Z=6 -> 3Z=0 -> Z=0. (0,3,0) - not unique.
                 // (1,0,?) 1*1+0*2+Z*3=6 -> 1+3Z=6 -> 3Z=5 (no int Z)
                 // (1,2,1) -> 1*1+2*2+1*3 = 1+4+3=8
                 // (1,X,Y)
                 // (2,X,Y)
                 // (3,X,Y)
                 // (0,1,2) -> 0*1 + 1*2 + 2*3 = 0 + 2 + 6 = 8
                 // (0,2,1) -> 0*1 + 2*2 + 1*3 = 0 + 4 + 3 = 7
                 // (1,0,2) -> 1*1 + 0*2 + 2*3 = 1 + 0 + 6 = 7
                 // (1,2,0) -> 1*1 + 2*2 + 0*3 = 1 + 4 + 0 = 5
                 // (2,0,1) -> 2*1 + 0*2 + 1*3 = 2 + 0 + 3 = 5
                 // (2,1,0) -> 2*1 + 1*2 + 0*3 = 2 + 2 + 0 = 4
                 // (0,3,0) is not unique.
                 // (0,X,Y)
                 // (1,X,Y)
                 // (2,X,Y)
                 // (3,X,Y)
                 // (1,2,3) -> 1*1+2*2+3*3 = 1+4+9 = 14
                 // (1,0,?) -> 1+3Z=6 -> Z=5/3
                 // (0,1,?) -> 2+3Z=6 -> Z=4/3
                 // (0,2,?) -> 4+3Z=6 -> Z=2/3
                 // (0,3,?) -> 6+3Z=6 -> Z=0. (0,3,0) - not unique (0 is repeated).
                 // (1,3,?) -> 1+6+3Z=6 -> 7+3Z=6 -> 3Z=-1
                 // (3,1,?) -> 3+2+3Z=6 -> 5+3Z=6 -> 3Z=1
                 // (3,0,?) -> 3+0+3Z=6 -> 3Z=3 -> Z=1. Permutation (3,0,1). This works! 3*1+0*2+1*3 = 3+0+3 = 6.
                 // Result should be 1.
    "4 10"     // N=4, S=10
               // (X,Y,Z,W) -> X*1 + Y*2 + Z*3 + W*4 = 10
               // (1,0,0,?) -> 1+4W=10 -> 4W=9
               // (0,1,0,?) -> 2+4W=10 -> 4W=8 -> W=2. (0,1,0,2) - not unique.
               // (0,0,1,?) -> 3+4W=10 -> 4W=7
               // (1,2,0,0) -> 1+4+0+0 = 5
               // (1,0,2,0) -> 1+0+6+0 = 7
               // (0,1,2,0) -> 0+2+6+0 = 8
               // (0,2,1,0) -> 0+4+3+0 = 7
               // (1,0,0,?)
               // (0,1,0,2)
               // (0,2,0,1) -> 0*1+2*2+0*3+1*4 = 0+4+0+4=8
               // (0,0,2,1) -> 0*1+0*2+2*3+1*4 = 0+0+6+4=10. This works! (0,0,2,1) is not unique, 0 is repeated.
               // The original code uses `perm` which generates permutations without replacement.
               // So if digits must be unique, (0,0,2,1) is invalid.
               // Let's re-verify the original `perm` behavior.
               // `xs.shift()` removes an element, `perm` is called on the *reduced* array.
               // `xs.push(x)` puts it back.
               // This means `perm` generates permutations *without replacement*.
               // So (0,0,2,1) and (0,3,0) are NOT generated by `perm`.
               // For N=4, S=10
               // (0,0,2,1) is not generated.
               // (1,2,3,4) -> 1+4+9+16 = 30
               // (0,1,2,3) -> 0+2+6+12 = 20
               // (0,1,3,2) -> 0+2+9+8 = 19
               // (0,2,1,3) -> 0+4+3+12 = 19
               // (0,2,3,1) -> 0+4+9+4 = 17
               // (0,3,1,2) -> 0+6+3+8 = 17
               // (0,3,2,1) -> 0+6+6+4 = 16
               // (1,0,2,3) -> 1+0+6+12 = 19
               // (1,0,3,2) -> 1+0+9+8 = 18
               // (1,2,0,3) -> 1+4+0+12 = 17
               // (1,2,3,0) -> 1+4+9+0 = 14
               // (1,3,0,2) -> 1+6+0+8 = 15
               // (1,3,2,0) -> 1+6+6+0 = 13
               // (2,0,1,3) -> 2+0+3+12 = 17
               // (2,0,3,1) -> 2+0+9+4 = 15
               // (2,1,0,3) -> 2+2+0+12 = 16
               // (2,1,3,0) -> 2+2+9+0 = 13
               // (2,3,0,1) -> 2+6+0+4 = 12
               // (2,3,1,0) -> 2+6+3+0 = 11
               // (3,0,1,2) -> 3+0+3+8 = 14
               // (3,0,2,1) -> 3+0+6+4 = 13
               // (3,1,0,2) -> 3+2+0+8 = 13
               // (3,1,2,0) -> 3+2+6+0 = 11
               // (3,2,0,1) -> 3+4+0+4 = 11
               // (3,2,1,0) -> 3+4+3+0 = 10. This works! (3,2,1,0)
               // Result should be 1.
  ];
  processInputData(); // Execute the main logic with mock data.
}