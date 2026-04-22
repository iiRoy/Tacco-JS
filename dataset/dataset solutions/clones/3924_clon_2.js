function ProcessInputData(inputContent) {
  // Split the entire input string into an array of individual lines
  inputContent = inputContent.split('\n');

  // Extract the total number of test cases from the first line
  const totalQueries = Number(inputContent[0]);

  // Iterate through each test case
  for (let currentIdx = 0; currentIdx < totalQueries; currentIdx++) {
    // Parse two integers from the current line of input
    var numberPair = inputContent[currentIdx + 1].split(' ').map(strValue => Number(strValue));

    // Determine the greater of the two numbers
    var largerValue = Math.max(numberPair[0], numberPair[1]);

    // Determine the smaller of the two numbers
    var smallerValue = Math.min(numberPair[0], numberPair[1]);

    // Calculate a derived boundary value based on the product of the two numbers
    var calculatedBoundary = Math.ceil(Math.sqrt(smallerValue * largerValue)) - 1;

    // Initialize the final outcome based on the smaller value
    var finalOutcome = (smallerValue - 1) * 2;

    // Adjust the result if the smaller value is significantly less than the larger value
    if (smallerValue < largerValue - 1) {
      finalOutcome++;
    }

    // Further adjust the result with another derived component
    finalOutcome += Math.max(calculatedBoundary - smallerValue, 0) * 2;

    // Apply a final adjustment if a specific condition involving the values and boundary is met
    if (Math.floor(smallerValue / calculatedBoundary * largerValue) === calculatedBoundary) {
      finalOutcome--;
    }

    // Output the computed result for the current query
    console.log(finalOutcome);
  }
}

// Entry point: Read input from standard input and process it
ProcessInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));