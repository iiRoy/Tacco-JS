function processData(rawData) {
  // This function processes the provided input string.

  // Convert the raw input to a string and then split it into an array of individual characters.
  let digitChars = rawData.toString().split('');

  // Parse the raw input into an integer.
  let numericValue = parseInt(rawData);

  // Initialize a variable to accumulate the sum of digits.
  let digitSum = 0;

  // Iterate through each character in the digitChars array.
  for (let idx = 0; idx < digitChars.length; idx++) {
    // Convert each character back to an integer and add it to the running sum.
    digitSum += parseInt(digitChars[idx]);
  }

  // Check if the numeric value is perfectly divisible by the sum of its digits.
  if (numericValue % digitSum === 0) {
    // If it is divisible, print 'Yes' to the console.
    console.log('Yes');
  } else {
    // Otherwise, print 'No'.
    console.log('No');
  }
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
