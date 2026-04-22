function ExecuteProgram(rawData) {
  // This program analyzes raw string input to determine an optimal sequence of movements.
  // It first identifies a basic path and then attempts to condense it.

  // Break the input string into separate lines of text.
  var linesOfText = rawData.split("\n");
  var sizeAndLimit = linesOfText[0].split(" ");

  // Convert the first line's numeric components to integers:
  // 'totalLength' represents the total extent of the path, 'maxJump' is the maximum step size.
  var totalLength = parseInt(sizeAndLimit[0], 10);
  var maxJump = parseInt(sizeAndLimit[1], 10);

  // The second line is interpreted as a sequence of path segments, each a single character.
  var pathSegments = linesOfText[1].split("");

  // Phase 1: Construct an initial path by making the largest possible valid jumps.
  // This approach prioritizes reaching the end quickly, potentially with many small jumps.
  var initialPath = [];
  var currentPos = 0;
  while (currentPos < totalLength - 1) {
    var jumpSize;
    // Iterate from the smallest possible jump up to the 'maxJump' limit.
    for (jumpSize = 1; jumpSize <= maxJump; jumpSize++) {
      // A valid landing spot is indicated by the character '0' in 'pathSegments'.
      if (pathSegments[currentPos + jumpSize] === '0') {
        currentPos += jumpSize; // Advance the current position.
        initialPath.push(jumpSize); // Record the size of the jump taken.
        break; // Move to the next segment after finding a valid jump.
      }
    }
    // If no valid jump was found within the allowed 'maxJump' from the current position,
    // it means the destination is unreachable.
    if (jumpSize > maxJump) {
      console.log(-1); // Output an error code.
      return;          // Terminate the program.
    }
  }

  // This array is intended to store various optimized path configurations,
  // but it remains unused in the program's final output due to commented-out logic.
  var optimalPaths = [];

  // This function is designed to recursively explore ways to combine adjacent jumps
  // within a given sequence, aiming to reduce the total number of steps.
  var exploreCombinations = function(currentSequence) {
    var modifiedFlag = false;
    for (var currentIdx = 0; currentIdx < currentSequence.length - 1; currentIdx++) {
      // Check if two consecutive jumps can be merged into a single jump
      // without exceeding the 'maxJump' limit.
      if (currentSequence[currentIdx] + currentSequence[currentIdx + 1] <= maxJump) {
        var tempSequence = Array.from(currentSequence); // Create a temporary copy for modification.
        tempSequence[currentIdx] += tempSequence[currentIdx + 1]; // Combine the two jumps.
        tempSequence.splice(currentIdx + 1, 1); // Remove the now-redundant second jump.
        exploreCombinations(tempSequence); // Recursively call with the new, combined sequence.
        modifiedFlag = true; // Indicate that a modification occurred.
      }
    }
    // If no combinations were possible in this iteration, and the sequence length
    // is not greater than the 'condensedPath' (which is defined later),
    // it's considered a potential 'optimal' path.
    // Note: This logic path is effectively dormant as the function is not called.
    if (!modifiedFlag && currentSequence.length <= condensedPath.length) {
      optimalPaths.push(Array.from(currentSequence));
    }
  };

  // Phase 2: Generate a condensed path by greedily merging jumps from the end backward.
  // This process aims to minimize the number of jumps.
  var reverseIndex = initialPath.length - 1;
  var condensedPath = []; // This array will hold the final, condensed path.
  while (reverseIndex >= 0) {
    var combinedValue = initialPath[reverseIndex];
    // While moving backward, keep adding preceding jumps if their sum doesn't exceed 'maxJump'.
    while ((reverseIndex--) >= 0 && combinedValue + initialPath[reverseIndex] <= maxJump) {
      combinedValue += initialPath[reverseIndex];
    }
    // Add the newly formed combined jump to the beginning of the 'condensedPath'.
    condensedPath.unshift(combinedValue);
  }

  // The 'exploreCombinations' function is intentionally not called here,
  // mirroring the original program's commented-out state.
  // exploreCombinations(initialPath);

  // Output the elements of the condensed path joined together as a single string, without separators.
  console.log(condensedPath.join(""));
}
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));