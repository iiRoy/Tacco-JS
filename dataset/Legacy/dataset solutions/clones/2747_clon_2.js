function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  // The first line contains the array length, the second contains space-separated numbers.
  let processedLines = rawData.split('\n');

  // Extract the length of the sequence from the first line.
  let arrayLength = parseInt(processedLines[0]);

  // Parse the second line to get the sequence of numbers.
  // Initially, they are strings, so convert them to integers.
  let numericValues = processedLines[1].split(' ').map(valStr => parseInt(valStr));

  // Initialize a boolean flag to track if the sequence satisfies the conditions.
  let isValidSequence = true;

  // Iterate through the sequence from the second element up to the second-to-last element.
  // This checks the condition for elements a[1] through a[N-2].
  for (let idx = 1; idx < arrayLength - 1; idx++) {
    // Check if the XOR sum of the previous and next elements equals the current element.
    // If not, the sequence is invalid, set the flag and exit the loop.
    if ((numericValues[idx - 1] ^ numericValues[idx + 1]) !== numericValues[idx]) {
      isValidSequence = false;
      break; // No need to check further if one condition fails.
    }
  }

  // If the sequence still appears valid after the main loop,
  // perform the first circular check for the last element.
  if (isValidSequence === true) {
    // Check if the XOR sum of the second-to-last element and the first element
    // equals the last element.
    if ((numericValues[arrayLength - 2] ^ numericValues[0]) !== numericValues[arrayLength - 1]) {
      isValidSequence = false; // Mark as invalid if this condition fails.
    }
  }

  // If the sequence is still valid after the previous checks,
  // perform the second circular check for the first element.
  if (isValidSequence === true) {
    // Check if the XOR sum of the second element and the last element
    // equals the first element.
    if ((numericValues[1] ^ numericValues[arrayLength - 1]) !== numericValues[0]) {
      isValidSequence = false; // Mark as invalid if this condition fails.
    }
  }

  // Determine the final output message based on the validity flag.
  let resultMessage = isValidSequence === true ? 'Yes' : 'No';

  // Print the result to the console.
  console.log('%s', resultMessage);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
