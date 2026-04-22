( function () {

  /**
   * Core procedure to analyze incoming text data.
   * This function processes the first line of the input to count
   * occurrences of a specific character and then makes a decision.
   * @param {string} incomingString - The complete raw string received for analysis.
   */
  function ProcessData ( incomingString ) {

    // Extract the very first textual segment from the multi-line input.
    // The split method separates by newline, and [0] takes the first part.
    let textSegment =
      incomingString
        .split(
          "\n"
        )[0];

    // Initialize a tally for the target character 'x'.
    let xCharCount =
      0;

    // Loop through each character in the extracted text segment.
    for (
      let charIndex = 0; // Starting point: the first character.
      charIndex < textSegment.length; // Condition: continue until the end of the segment.
      charIndex++ // Increment the index to move to the next character.
    ) {
      // Check if the character at the current position is 'x'.
      if (
        textSegment[charIndex] ===
        'x'
      ) {
        // If it is 'x', increment our counter.
        xCharCount++;
      }
    }

    // After counting, evaluate the total number of 'x' characters.
    if (
      xCharCount >= 8
    ) {
      // If the count is 8 or more, print the negative outcome.
      console.log(
        'NO'
      );
    } else {
      // Otherwise, if the count is less than 8, print the positive outcome.
      console.log(
        'YES'
      );
    }
  }

  // Invoke the primary data processing routine.
  // The input is read synchronously from standard input as a UTF-8 string.
  ProcessData(
    require(
      "fs"
    )
      .readFileSync( "/dev/stdin", "utf8" )
  );

}() );