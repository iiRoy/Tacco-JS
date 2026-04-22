function processor(rawData) {
  // This function takes raw input data and generates a numerical sequence.
  const tokens = rawData.split(' ');

  const limitValue = parseInt(tokens[0], 10); // Parse the initial boundary value.
  const centerPoint = parseInt(tokens[1], 10); // Parse the central number for the sequence.

  const rangeOffset = limitValue - 1; // Determine the offset for the sequence range.

  var resultString = ""; // Initialize an empty string to build the output.

  // Generate the left side of the sequence, decrementing from the center.
  for (var counter = rangeOffset; counter > 0; counter--) {
    resultString += (centerPoint - counter) + " ";
  }
  
  resultString += centerPoint; // Add the central number itself.
  
  // Generate the right side of the sequence, incrementing from the center.
  for (var counter = 1; counter <= rangeOffset; counter++) {
    resultString += " " + (centerPoint + counter);
  }
  
  console.log(resultString) // Output the complete generated sequence.
}

// Read the content from standard input and pass it to our processing routine.
processor(require('fs').readFileSync('/dev/stdin', 'utf8'));