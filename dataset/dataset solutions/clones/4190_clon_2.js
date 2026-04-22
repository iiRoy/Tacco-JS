function ExecuteProgram(rawData) {
  // Convert the incoming string data into a base-10 integer
  const initialValue = parseInt(rawData, 10);

  // Define an internal utility function to sum the digits of a number
  const calculateDigitSum = (numericInput) => {
    // Convert the number to its string representation, split it into an array of characters,
    // and then map each character back to an integer
    let digitArray = numericInput.toString().split('').map(singleDigit => parseInt(singleDigit, 10));
    // Use the reduce method to compute the total sum of all digits in the array
    return digitArray.reduce((accumulator, currentDigit) => accumulator + currentDigit);
  };

  // Evaluate if the original integer is perfectly divisible by the sum of its own digits
  if (initialValue % calculateDigitSum(initialValue) === 0) {
    console.log('Yes'); // If divisible without remainder, print 'Yes'
  } else {
    console.log('No');  // Otherwise, print 'No'
  }
}

// Read the input from standard input using Node.js file system module
// and then invoke the primary program function with the obtained data
ExecuteProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));