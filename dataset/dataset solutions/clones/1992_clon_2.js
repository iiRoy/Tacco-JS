function ProcessInput(rawData) {
  // Split the raw input data into individual lines.
  let parsedLines = rawData.split("\n");

  // Parse the first line as an integer, representing the total number of elements.
  let totalElements = parseInt(parsedLines[0], 0xA);

  // The second line is the string we'll be analyzing.
  let targetString = parsedLines[0b1];

  // Initialize a counter for valid combinations.
  let resultTally = 0x0;

  // Outer loop: iterate from the first element up to the total number of elements.
  for (let idxA = 0b1; idxA <= totalElements; ++idxA) {
    // Middle loop: iterate from the element after idxA up to the total number of elements.
    for (let idxB = idxA + 0b1; idxB <= totalElements; ++idxB) {
      // Inner loop: iterate from the element after idxB up to the total number of elements.
      for (let idxC = idxB + 0b1; idxC <= totalElements; ++idxC) {
        // Check if the indices do NOT form an arithmetic progression.
        // This means the difference between C and B is not equal to the difference between B and A.
        if (idxC - idxB !== idxB - idxA) {
          // Access characters using 0-based indexing.
          let charA = targetString[idxA - 0b1];
          let charB = targetString[idxB - 0b1];
          let charC = targetString[idxC - 0b1];

          // Check if the character at position A is different from the character at position B.
          if (charA !== charB) {
            // Check if the character at position A is different from the character at position C.
            if (charA !== charC) {
              // Check if the character at position B is different from the character at position C.
              if (charB !== charC) {
                // If all conditions are met, increment the tally.
                resultTally++;
              }
            }
          }
        }
      }
    }
  }

  // Output the final calculated tally to the console.
  console.log(resultTally);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
