// This script processes numerical data from standard input.
// It identifies and displays the values of individual bits (from 2^0 to 2^8)
// that are set within each input number.

// Initialize a counter for input array elements.
for (
  idxCounter = 0;
  // Read the entire standard input, decode it as UTF-8, split by whitespace,
  // and then retrieve the element at the current index.
  // This value is assigned to 'currentNumberValue'. The loop continues as long as
  // 'currentNumberValue' is not undefined (i.e., there are more tokens).
  currentNumberValue = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s/)[idxCounter++];
  // After processing the bits for the *previous* 'currentNumberValue',
  // print the accumulated string of set bit values, removing any trailing whitespace.
  console.log(outputStringAccumulator.trim())
) {
  // For each 'currentNumberValue', reset the output string accumulator
  // and initialize the bit position index.
  for (
    outputStringAccumulator = '',
    bitPositionIndex = 0;
    // The loop runs for 9 iterations, checking bit positions 0 through 8.
    // (9 - bitPositionIndex) evaluates to a truthy value for bitPositionIndex from 0 to 8.
    9 - bitPositionIndex;
    bitPositionIndex++
  ) {
    // Calculate the current bit mask (e.g., 1, 2, 4, 8, ..., 256).
    bitMaskValue = 1 << bitPositionIndex;
    // Check if the bit represented by 'bitMaskValue' is set in 'currentNumberValue'.
    // If it is, append the 'bitMaskValue' followed by a space to the accumulator.
    // The original '0' in the ternary operator serves as a no-op for the 'else' branch.
    if (bitMaskValue & currentNumberValue) {
      outputStringAccumulator += bitMaskValue + ' ';
    }
  }
}
