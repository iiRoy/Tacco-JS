function ProcessInput ( inputString ) {
  // Convert the provided input string into a numeric boundary for iteration.
  const loopBoundary = +inputString;

  // Declare and initialize an empty array to accumulate the generated sequence items.
  let sequenceItems = [];

  // Initialize the first numeric component of the sequence element.
  let currentNumericPart = 1;

  // Initialize an empty string that will serve as a trailing modifier.
  let trailingModifier = "";

  // Begin a loop that runs for the number of times specified by 'loopBoundary'.
  for ( let iterationCount = 0; iterationCount < loopBoundary; iterationCount++ ) {
    // Concatenate the current numeric part with the trailing modifier and store it
    // at the current index within the 'sequenceItems' array.
    sequenceItems[iterationCount] = currentNumericPart + trailingModifier;

    // Evaluate if the current numeric part has reached its maximum single-digit value.
    if ( currentNumericPart === 9 ) {
      // If it has, reset the numeric part back to 1.
      currentNumericPart = 1;
      // And append a '9' to the trailing modifier string.
      trailingModifier += "9";
    } else {
      // Otherwise, simply advance the numeric part by one.
      currentNumericPart++;
    }
  }

  // Output all collected sequence items, with each item separated by a newline character.
  console.log( sequenceItems.join("\n") );
}

// Execute the primary processing function by reading input from standard input.
// This assumes a Node.js environment where 'require' and 'fs' are available.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );