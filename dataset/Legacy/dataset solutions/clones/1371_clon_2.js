(function(sourceData) {
  // This function processes the provided input data.
  // It splits the input into individual lines and then iterates through them.
  var lineSegments = sourceData.split('\n');

  for (var idx = 0; idx < lineSegments.length; idx++) {
    // Retrieve the current line for processing.
    var currentLine = lineSegments[idx];

    // If the current line is '0', terminate the execution.
    if (currentLine == 0) {
      return;
    }

    // Calculate the sum of digits for the current line and print it.
    console.log(currentLine.split('').reduce(function(accumulator, currentDigit) {
      // Convert each character to a number and add it to the running total.
      return Number(accumulator) + Number(currentDigit);
    }));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
