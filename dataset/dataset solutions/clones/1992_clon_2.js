function processInput(incomingData) {
  // Split the raw input string by newlines to get an array of lines.
  const parsedLines = incomingData.split('\n');

  // Parse the first line as an integer to determine the upper bound for iterations.
  const maximumValue = parseInt(parsedLines[0], 10);

  // The second line contains the character sequence to be analyzed.
  const charSequence = parsedLines[1];

  // Initialize a counter for valid combinations found.
  let tallyOfCombinations = 0;

  // Outer loop: iterates from 1 up to maximumValue for the first element.
  for ( let idxA = 1; idxA <= maximumValue; ++idxA ) {
    // Middle loop: iterates from idxA + 1 up to maximumValue for the second element.
    for ( let idxB = idxA + 1; idxB <= maximumValue; ++idxB ) {
      // Inner loop: iterates from idxB + 1 up to maximumValue for the third element.
      for ( let idxC = idxB + 1; idxC <= maximumValue; ++idxC ) {

        // Check if the indices do not form an arithmetic progression.
        // This means the difference between idxC and idxB is not equal to the difference between idxB and idxA.
        if ( idxC - idxB !== idxB - idxA ) {

          // Access characters using 0-based indexing by subtracting 1 from the loop indices.
          const charA = charSequence[idxA - 1];
          const charB = charSequence[idxB - 1];
          const charC = charSequence[idxC - 1];

          // Check if all three characters at the selected indices are distinct.
          // First, charA must be different from charB.
          if ( charA !== charB ) {
            // Second, charA must be different from charC.
            if ( charA !== charC ) {
              // Third, charB must be different from charC.
              if ( charB !== charC ) {
                // If all conditions are met, increment the combination tally.
                tallyOfCombinations++;
              }
            }
          }
        }
      }
    }
  }

  // Output the final count of distinct combinations.
  console.log(tallyOfCombinations);
}

// Invoke the main processing function with data read from standard input.
processInput( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );