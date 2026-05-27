function ProcessInput(rawData) {
  // This function processes the provided raw text data.
  const inputLines = rawData.split('\n');

  const firstString = inputLines[0];
  const secondString = inputLines[1];

  // We compare the first string with a modified version of the second string.
  // The modification involves removing the last character from the second string.
  let comparisonOutcome = (firstString === secondString.slice(0, secondString.length - 1)) ? "Yes" : "No";

  // Output the final determination.
  console.log(comparisonOutcome);
}

// Execute the primary processing function by reading data from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
