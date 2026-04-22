/*
 * This JavaScript module is designed to analyze a series of numerical values
 * to identify and count the number of significant trend changes or "turns"
 * within the sequence. It's structured to read its primary input from
 * the standard input stream, a common pattern in competitive programming.
 */
const rawData = require("node:fs").readFileSync("/dev/fd/0", "utf-8") // Fetch all incoming data from the standard file descriptor 0.

// An Immediately Invoked Function Expression (IIFE) is used to encapsulate
// the core logic, preventing global scope pollution and passing the raw input.
;((sourceText) => {

  // The initial step involves breaking the monolithic input string
  // into an array of individual text lines, using the newline character.
  const textRows = sourceText.split('\x0A')

  // The very first line of input provides the total quantity of numbers
  // that are expected in the subsequent data line. We parse it as an integer.
  const elementCount = parseInt(textRows[0], 10)

  // The second line contains the actual numerical sequence. It's split
  // by any sequence of whitespace characters, and each resulting substring
  // is then converted into a floating-point number.
  const numericSequence = textRows[1].split(/\s+/).map(currentStr => parseFloat(currentStr))

  // A variable to keep track of how many times the trend has reversed.
  let turnCounter = 0

  // This variable tracks the currently observed directional trend of the sequence:
  //   0: Indicates no established trend or a flat segment.
  //   1: Signifies an upward (increasing) trend.
  //  -1: Signifies a downward (decreasing) trend.
  let currentTrend = 0

  // Commence iterating through the sequence, starting from the second element
  // (index 1), as each element must be compared against its predecessor.
  for (let idx = 1; idx < elementCount; idx++) {

    // Evaluate if the current number is strictly greater than the one before it.
    // This condition indicates an upward movement in the sequence.
    if (numericSequence[idx] > numericSequence[idx - 1]) {
      // If the preceding trend was a decline, then an upward movement now
      // represents a clear reversal point.
      if (currentTrend === -1) {
        currentTrend = 0 // Reset the trend to neutral, signifying a completed turn.
        ++turnCounter    // Increment the count of detected reversals.
      } else {
        // Otherwise, the sequence is either continuing an upward trend
        // or establishing one from a neutral state.
        currentTrend = 1
      }
    }
    // Alternatively, check if the current number is strictly less than its predecessor.
    // This condition points to a downward movement.
    else if (numericSequence[idx] < numericSequence[idx - 1]) {
      // If the preceding trend was an ascent, then a downward movement now
      // marks a distinct reversal.
      if (currentTrend === 1) {
        currentTrend = 0 // Reset the trend, as a turn has been made.
        ++turnCounter    // Increment the reversal counter.
      } else {
        // In other cases, the sequence is either maintaining a downward trend
        // or initiating one from a neutral position.
        currentTrend = -1
      }
    }
    // If numericSequence[idx] === numericSequence[idx - 1], the sequence is flat.
    // A flat segment does not alter the currentTrend or increment turnCounter
    // unless it breaks an existing trend. The logic above handles the trend break.
  }

  // The final output required is typically the number of "segments" or "waves",
  // which is always one more than the total number of trend reversals counted.
  // Using process.stdout.write for direct output to standard output,
  // ensuring that a newline character is appended for proper formatting.
  process.stdout.write((turnCounter + 1).toString() + '\n')

})(rawData) // The raw input data is passed into the IIFE for processing.