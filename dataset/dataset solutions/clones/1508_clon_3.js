// Function to analyze a sequence of game turns for a specific pattern.
function ProcessGameData(dataString) {
  // Split the entire input string into individual line entries,
  // trimming any leading/trailing whitespace from the whole string.
  const allLines = dataString.trim().split('\n');

  // Implement a guard clause: If there aren't enough lines for
  // the 'N' value plus a potential triplet (1 + 3 = 4 lines),
  // then the pattern cannot be found.
  if (allLines.length < 4) {
    return "No"; // Not enough data to find three consecutive matching pairs.
  }

  // The very first line (index 0) contains the total number of data entries.
  // Parse this value, ensuring it's a valid positive integer.
  const totalDataEntriesDeclared = parseInt(allLines[0], 10);
  if (isNaN(totalDataEntriesDeclared) || totalDataEntriesDeclared <= 0) {
    // If the declared 'N' is invalid, we cannot proceed correctly.
    return "No";
  }

  // Pre-process the subsequent lines into a more usable data structure:
  // an array where each element is itself an array of two numbers [valueA, valueB].
  // This avoids repetitive parsing within the main loop, a Type III optimization.
  const gameMoves = [];
  // Iterate from the second line (index 1) up to the declared number of entries,
  // or until the end of the actual input lines, whichever comes first.
  for (let k = 1; k <= totalDataEntriesDeclared && k < allLines.length; k++) {
    const lineContent = allLines[k];
    const parts = lineContent.split(' ');
    // Perform basic validation: ensure the line has two parts and they are numeric.
    if (parts.length === 2) {
      const valA = parseInt(parts[0], 10);
      const valB = parseInt(parts[1], 10);
      // Only push the pair if both values were successfully parsed as numbers.
      if (!isNaN(valA) && !isNaN(valB)) {
        gameMoves.push([valA, valB]);
      }
    }
  }

  // Store the actual count of successfully parsed moves.
  const actualProcessedMovesCount = gameMoves.length;

  let tripletSequenceDetected = false; // A boolean flag to track if the pattern is found.
  let currentScanIndex = 0; // An iterator for traversing the 'gameMoves' array.

  // Introduce a helper function to check if the two values within a pair are identical.
  // This is a Type III addition for code clarity and modularity.
  const doPairValuesMatch = (pair) => pair && pair[0] === pair[1];

  // Loop through the pre-processed game moves.
  // The loop condition ensures there are always at least 3 moves remaining
  // from the 'currentScanIndex' to check for a potential triplet.
  while (currentScanIndex <= actualProcessedMovesCount - 3) {
    // Extract the three consecutive candidate moves for the triplet check.
    const firstCandidateMove = gameMoves[currentScanIndex];
    const secondCandidateMove = gameMoves[currentScanIndex + 1];
    const thirdCandidateMove = gameMoves[currentScanIndex + 2];

    // Replicate the original problem's specific conditional advancement logic.
    // This part is crucial for maintaining functional equivalence.
    if (doPairValuesMatch(firstCandidateMove)) {
      // The first pair's values match, now check the second pair.
      if (doPairValuesMatch(secondCandidateMove)) {
        // The second pair's values also match, now check the third pair.
        if (doPairValuesMatch(thirdCandidateMove)) {
          // All three consecutive pairs have matching internal values.
          tripletSequenceDetected = true;
          break; // The pattern is found, terminate the loop immediately.
        } else {
          // The first two pairs match, but the third does not.
          // According to the original logic, we advance the index by 3 positions.
          currentScanIndex += 3;
        }
      } else {
        // The first pair matches, but the second does not.
        // According to the original logic, we advance the index by 2 positions.
        currentScanIndex += 2;
      }
    } else {
      // The first pair itself does not have matching values.
      // According to the original logic, we only advance the index by 1 position.
      currentScanIndex += 1;
    }
  }

  // Return "Yes" if the specific triplet pattern was detected, otherwise "No".
  return tripletSequenceDetected ? "Yes" : "No";
}

// Do not modify the following lines for standard input/output.
// This section handles reading data from standard input and invoking the
// main processing function, then printing its result to standard output.
const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
// Output the final determination to the console.
console.log(ProcessGameData(standardInput));