// This core module is designed to meticulously process incoming raw data.
function ProcessData(initialPayload) {
  /*
   * The first step involves segmenting the entire input string.
   * This is achieved by splitting it at each newline character,
   * yielding an array where each element corresponds to a distinct line.
   */
  let lineArray = initialPayload.split("\n");

  // We then focus our attention on the second line (index 1) of the `lineArray`.
  // This particular line is further fragmented into individual tokens,
  // using a space character as the delimiter for separation.
  let tokenizedValues = lineArray[1].split(" ");

  /**
   * A dedicated utility function to facilitate numerical comparison between two values.
   * This ensures that the subsequent sorting operation correctly orders the tokens
   * based on their numerical magnitude, rather than their string representation.
   * @param {string} valA - The first string value to be evaluated.
   * @param {string} valB - The second string value to be evaluated.
   * @returns {number} A value indicating the relative order:
   *                   negative if valA < valB, zero if valA == valB, positive if valA > valB.
   */
  const compareNumericValues = (valA, valB) => {
    return parseInt(valA, 10) - parseInt(valB, 10);
  };

  // The array of `tokenizedValues` is now sorted using the custom numerical comparator.
  // This crucial preprocessing step groups identical values together,
  // making the detection of duplicates straightforward and efficient.
  let orderedValues = tokenizedValues.sort(compareNumericValues);

  // A boolean flag, `hasRepetitions`, is initialized to indicate the absence of duplicates.
  // Its state will be updated if any repeated elements are subsequently discovered.
  let hasRepetitions = false;

  // We traverse through the `orderedValues` array, starting from the second element.
  // Each element is systematically compared against its immediately preceding neighbor.
  for (let itemIndex = 1; itemIndex < orderedValues.length; itemIndex++) {
    // If an element is found to be exactly identical to the element that came before it,
    // this signifies the presence of a duplicate within the sorted sequence.
    if (orderedValues[itemIndex - 1] === orderedValues[itemIndex]) {
      hasRepetitions = true; // The flag is set to true to record the discovery of a duplicate.
      // (The original algorithm does not break early, so we maintain that behavior.)
    }
  }

  // Finally, based on the outcome of the duplicate detection,
  // an appropriate textual message is dispatched to the console output.
  if (hasRepetitions) {
    console.log("NO"); // "NO" is output if any repetitions were found.
  } else {
    console.log("YES"); // "YES" is output if the data set is entirely unique.
  }
}

// This is the initial entry point for the script's execution.
// It retrieves the content from standard input, processes it by removing leading/trailing whitespace,
// and then feeds this cleaned data into the primary `ProcessData` function.
ProcessData(
  require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
);