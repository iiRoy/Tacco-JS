function ProcessInput(rawData) {
  // Split the entire input into individual lines
  let lineData = rawData.split('\n');

  // Extract the first line which contains N and M
  const firstLine = lineData.shift();

  // Parse N (number of digits for the result)
  const numDigits = parseInt(firstLine.split(' ')[0]);
  // M (number of constraints) is extracted but not used in the logic
  const numConstraints = firstLine.split(' ')[1];

  // The remaining lines are the actual constraints
  const constraintLines = lineData;

  // Initialize an array to build the number, using 'x' as a placeholder
  let resultArray = 'x'.repeat(numDigits).split('');

  // Flag to track if all constraints are valid
  let isValid = true;

  // Iterate over each constraint line
  constraintLines.forEach(currentConstraintLine => {
    // Parse the constraint: position and digit value
    const parsedConstraint = currentConstraintLine.split(' ').map(itemStr => parseInt(itemStr));

    // Check for conflicts: if a position is already assigned and the new value differs
    if (resultArray[parsedConstraint[0] - 1] !== 'x' && resultArray[parsedConstraint[0] - 1] !== parsedConstraint[1]) {
      isValid = false; // Mark as invalid
    }
    // Assign the digit to the specified position
    resultArray[parsedConstraint[0] - 1] = parsedConstraint[1];
  });

  // Join the array elements to form a string
  let resultString = resultArray.join('');

  // Apply specific replacements for leading 'x' placeholders based on N
  // This logic ensures the smallest possible number when leading digits are 'x'
  resultString = resultString.replace(/^xxx/, '100');
  resultString = resultString.replace(/^xx([0-9])/, '10$1');
  resultString = resultString.replace(/^x([0-9])/, '1$1');

  // Replace any remaining 'x' placeholders with '0'
  resultString = resultString.replace(/x/g, '0');

  // Convert the final string to an integer
  const finalNumber = parseInt(resultString);

  // Check if the solution is valid and has the correct number of digits
  if (isValid && (finalNumber + '').length === numDigits) {
    console.log(finalNumber);
  } else {
    console.log(-1);
  }
}

// This part handles reading input from stdin and calling the main processing function.
// Do not modify this section.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
