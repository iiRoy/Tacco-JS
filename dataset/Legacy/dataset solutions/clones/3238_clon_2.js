function ProcessInput(rawData) {
  // This function processes the provided raw input data.
  // The input is expected to be a multi-line string.

  // Split the raw data into individual lines.
  const lineSegments = rawData.split("\n");

  // Parse the first line as an integer, representing the number of iterations.
  const numLines = parseInt(lineSegments[0], 10);

  // Convert the next three lines into arrays of characters.
  const primaryChars = lineSegments[1].split("");
  const secondaryChars = lineSegments[2].split("");
  const tertiaryChars = lineSegments[3].split("");

  // Initialize a counter for mismatches.
  let mismatchScore = 0;

  // Iterate through the characters up to the specified number of lines.
  for (let idx = 0; idx < numLines; idx++) {
    // Check if all three characters at the current index are identical.
    if (primaryChars[idx] === secondaryChars[idx] && secondaryChars[idx] === tertiaryChars[idx]) {
      // If they are all the same, no mismatch contribution; move to the next iteration.
      continue;
    }

    // Check if any two of the three characters at the current index are identical.
    if (primaryChars[idx] === secondaryChars[idx] || secondaryChars[idx] === tertiaryChars[idx] || tertiaryChars[idx] === primaryChars[idx]) {
      // If at least two are the same, increment the mismatch score by one.
      mismatchScore++;
      // Move to the next iteration.
      continue;
    }

    // If none of the above conditions are met, it means all three characters are distinct.
    // In this case, increment the mismatch score by two.
    mismatchScore++;
    mismatchScore++;
  }

  // Output the final calculated mismatch score to the console.
  console.log(mismatchScore);
}

// The following line handles standard input/output and calls the main processing function.
// It should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
