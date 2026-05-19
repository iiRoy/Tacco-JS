function processInput (sourceString) {
  // Initialize a counter to track the number of times the target pattern is found.
  let occurrenceCounter = 0;

  // Continue looping as long as the substring 'ABC' is present in the current source string.
  while (sourceString.indexOf('ABC') !== -1) {
    // Determine the starting index of the first occurrence of 'ABC'.
    const matchPosition = sourceString.indexOf('ABC');

    // Create a temporary string by replacing the first 'ABC' with 'BCA'.
    let modifiedString = sourceString.replace('ABC', 'BCA');

    // Increment the counter for each detected and processed occurrence.
    occurrenceCounter++;

    // Update the main source string to be the segment of the modified string
    // starting from where the 'ABC' was originally found. This effectively
    // processes the string from the point of the last match onwards.
    sourceString = modifiedString.slice(matchPosition);
  }

  // Output the final tally of occurrences to the console.
  console.log(occurrenceCounter);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
