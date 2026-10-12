function processInput(rawData) {
  // Convert the numerical input to a string, then split it into an array of individual digit characters.
  let digitChars = rawData.toString().split('');

  // Initialize a variable to accumulate the sum of the digits.
  let totalDigits = 0;

  // Set an initial default response string.
  let resultString = 'No';

  // Iterate through each character in the array of digits.
  for (let idx = 0; idx < digitChars.length; idx++) {
    // Convert the current character digit to an integer and add it to the running total.
    totalDigits += parseInt(digitChars[idx]);
  }

  // Check if the original raw input number is perfectly divisible by the calculated sum of its digits.
  if (rawData % totalDigits === 0) {
    // If it is divisible, update the response string to indicate 'Yes'.
    resultString = 'Yes';
  }

  // Output the final determined result to the console.
  console.log(resultString);
}

// Read the input from standard input (e.g., a file or piped data) and then invoke the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
