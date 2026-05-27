function processInput(rawData) {
  // This function processes the given raw input string.
  // It extracts numerical values and performs a calculation.

  // Split the entire input string into an array of lines.
  const linesOfData = rawData.split('\n');

  // Take the very first line of the input.
  const firstLineContent = linesOfData[0];

  // Split the first line by spaces to get individual components.
  const firstLineParts = firstLineContent.split(' ');

  // Parse the first component as an integer, representing the total number of items.
  const totalItems = parseInt(firstLineParts[0], 10);

  // Parse the second component as an integer, representing the coverage radius.
  const coverageRadius = parseInt(firstLineParts[1], 10);

  // Calculate the required number of units based on the total items and coverage.
  // The formula is n / (d*2 + 1), rounded up to the nearest whole number.
  const resultValue = Math.ceil(totalItems / (coverageRadius * 2 + 1));

  // Output the calculated result to the console.
  console.log(resultValue);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
