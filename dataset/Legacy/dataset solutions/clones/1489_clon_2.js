function ProcessInput(rawData) {
  // Split the raw input into lines and then each line into parts
  let parsedLines = rawData.split("\n").map(lineData => lineData.split(" "));

  // Extract initial parameters: length of sequence and number of queries
  const initialLength = parseInteger(parsedLines[0][0]);
  const numQueries = parseInteger(parsedLines[0][1]);

  // Initialize a string of '1's based on the initial length
  let digitSequence = "";
  for (let k = 0; k < initialLength; k++) {
    digitSequence += "1";
  }

  // Convert the string into an array of characters for easier manipulation
  digitSequence = digitSequence.split("");

  // Process each query from the input
  for (let k = 1; k < parsedLines.length; k++) {
    // Extract query parameters: left boundary, right boundary, and replacement digit
    const leftBound = parseInteger(parsedLines[k][0]) - 1;
    const rightBound = parseInteger(parsedLines[k][1]) - 1;
    const replacementDigit = parsedLines[k][2];

    // Create a new sequence by applying the replacement rule
    let modifiedSequence = digitSequence.map((currentDigit, digitIndex) => {
      // If the current index is within the specified range, use the replacement digit
      if (leftBound <= digitIndex && digitIndex <= rightBound) {
        return replacementDigit;
      }
      // Otherwise, keep the original digit
      return currentDigit;
    });

    // Join the modified sequence back into a string and convert it to an integer
    modifiedSequence = parseInteger(modifiedSequence.join(''));
    // Output the result modulo a large prime number
    console.log(modifiedSequence % 998244353);
  }
}

// Helper function to convert a string to an integer
function parseInteger(stringValue) {
  // Using base 10 for parsing
  return parseInt(stringValue, 10);
}

// Invoke the main processing function with data read from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
