function parseInteger(valueStr) {
  // Converts a string representation to an integer.
  return parseInt(valueStr);
}

function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const lines = rawData.split("\n");

  // Parse the first line to get the initial field values.
  const initialValues = lines[0].split(' ').map(parseInteger);

  // Extract the initial quantities and the number of iterations.
  const startA = initialValues[0];
  const startB = initialValues[1];
  const iterations = initialValues[2];

  // Initialize mutable variables for the quantities.
  var currentA = startA;
  var currentB = startB;

  // Initialize a variable to track whose turn it is.
  var turnIndicator = 'a'; // 'a' for currentA's turn, 'b' for currentB's turn

  // Loop for the specified number of iterations.
  for (var loopCounter = 0; loopCounter < iterations; loopCounter++) {
    // Check whose turn it is.
    if (turnIndicator === 'a') {
      // If currentA is odd, decrement it to make it even.
      if (currentA % 2 !== 0) {
        currentA--;
      }

      // Calculate half of currentA.
      var partA = currentA / 2;

      // Distribute currentA's quantity.
      currentA = currentA - partA;
      currentB = currentB + partA;

      // Switch turn to currentB.
      turnIndicator = 'b';
    } else {
      // If currentB is odd, decrement it to make it even.
      if (currentB % 2 !== 0) {
        currentB--;
      }

      // Calculate half of currentB.
      var partB = currentB / 2;

      // Distribute currentB's quantity.
      currentA = currentA + partB;
      currentB = currentB - partB;

      // Switch turn to currentA.
      turnIndicator = 'a';
    }
  }

  // Output the final quantities, separated by a space.
  console.log(currentA + ' ' + currentB);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
