const processInput = function (rawData) {
  // The input string is expected on the second line of the raw data.
  let sequenceString = rawData.split("\n")[1];

  // Initialize the lowest count of required modifications to a sufficiently large value.
  // This value is based on typical problem constraints for string length.
  let minimumModifications = 3 * Math.pow(10, 5);

  // Iterate through each possible split point in the sequence.
  // The character at 'currentPosition' acts as the divider.
  for (let currentPosition = 0; currentPosition < sequenceString.length; currentPosition++) {
    // The character at the current split point. Its value doesn't directly affect the flip count.
    const dividerChar = sequenceString[currentPosition];

    // Extract the segment of the string to the left of the current split point.
    // If the split point is the very beginning, the left segment is empty.
    const leftPart = currentPosition === 0 ? "" : sequenceString.slice(0, currentPosition);

    // Extract the segment of the string to the right of the current split point.
    const rightPart = sequenceString.slice(currentPosition + 1);

    // This variable is declared in the original code but never assigned a value or used.
    // It is kept for structural equivalence.
    let unusedVariable = "";

    // Initialize a counter for the current configuration's required flips.
    let currentFlipCount = 0;

    // Count flips needed in the left part.
    // The goal for the left part is to have all 'E' characters.
    // So, if a character is 'W', it needs to be flipped.
    for (let charIndexLeft = 0; charIndexLeft < leftPart.length; charIndexLeft++) {
      if (leftPart[charIndexLeft] !== "E") {
        currentFlipCount++;
      }
    }

    // Count flips needed in the right part.
    // The goal for the right part is to have all 'W' characters.
    // So, if a character is 'E', it needs to be flipped.
    for (let charIndexRight = 0; charIndexRight < rightPart.length; charIndexRight++) {
      if (rightPart[charIndexRight] !== "W") {
        currentFlipCount++;
      }
    }

    // Update the overall minimum if the current configuration is better.
    if (minimumModifications > currentFlipCount) {
      minimumModifications = currentFlipCount;
    }
  }
  // Output the final calculated minimum number of flips.
  console.log(minimumModifications);
};

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "UTF-8"));
