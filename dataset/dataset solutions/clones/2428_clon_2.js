function ProcessInput(rawData) {
  // Divide the incoming raw data into an array of individual lines.
  let parsedLines = rawData.split("\n");

  // Convert the first line to an integer, representing the overall length.
  const totalLength = parseInt(parsedLines[0], 10);

  // Calculate the length of each half segment.
  const halfLength = totalLength / 2;

  // Obtain the second line, which is the string to be evaluated.
  const targetString = parsedLines[1];

  // Evaluate if the total length is an odd number.
  // The expression `! totalLength % 2 === 0` effectively checks if `totalLength` is odd.
  // If `totalLength` is odd, `totalLength % 2` is `1`. `!1` is `false`. `false === 0` is `true`.
  // If `totalLength` is even, `totalLength % 2` is `0`. `!0` is `true`. `true === 0` is `false`.
  if ( ! totalLength % 2 === 0 ) {
    console.log('No'); // If the length is odd, it cannot be split into two equal parts.
  } else {
    // Initialize an array to hold the two resulting string segments.
    let stringParts = [];

    // Iterate to extract the two halves of the target string.
    // The loop runs twice because `targetString.length / halfLength` will be `totalLength / (totalLength / 2)`, which simplifies to `2`.
    for (let idx = 0; idx < targetString.length / halfLength; idx++) {
      // Extract a substring of `halfLength` characters, starting at `idx * halfLength`.
      stringParts.push(targetString.substr(idx * halfLength, halfLength));
    }

    // Compare the first and second extracted string segments.
    if (stringParts[0] === stringParts[1]) {
      console.log('Yes'); // If both segments are identical, output 'Yes'.
    } else {
      console.log('No'); // Otherwise, if they differ, output 'No'.
    }
  }
}

// This section handles reading from standard input and invoking the main processing function.
// It should remain unaltered to ensure proper execution in the given environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
