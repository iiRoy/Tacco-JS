function ProcessData(incomingText) {
  // Begin processing the provided text input.
  var arrayOfLines = incomingText.split('\n'); // Convert the single string into an array of lines.

  // Extracting the base dimensions from the first line of input.
  let referenceHeight = arrayOfLines[0].split(" ")[1]; // The second token is our reference height.
  var referenceWidth = arrayOfLines[0].split(" ")[2];  // The third token is our reference width.

  var successfulMatches = 0; // Initialize a counter for successful comparisons.

  // Loop through the remaining lines, starting from the second line (index 1).
  for (var lineIndex = 1; lineIndex < arrayOfLines.length; lineIndex++) {
    var currentItemHeight = arrayOfLines[lineIndex].split(" ")[0]; // Get the item's height from the current line.
    var currentItemWidth = arrayOfLines[lineIndex].split(" ")[1];  // Get the item's width from the current line.

    // Evaluate if both current dimensions are strictly greater than the reference dimensions.
    // The condition (X - Y > -1) is equivalent to (X > Y).
    if ( ( currentItemHeight - referenceHeight > -1 ) && ( currentItemWidth - referenceWidth > -1 ) ) {
      successfulMatches++; // Increment the counter if both conditions are met.
    }
  }

  // Output the final tally of items that met the criteria.
  console.log(successfulMatches);
}

// Execute the main processing function with data read from standard input.
ProcessData( require('fs').readFileSync('/dev/stdin', 'utf8') );