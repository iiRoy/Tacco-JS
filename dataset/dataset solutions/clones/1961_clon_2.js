const analyzeInputData = (inputRows) => {
  // Parse the first line to get two numeric values
  const [firstVal, secondVal] = inputRows[0].split(' ').map(item => +item);

  // Process the second line: split, convert to numbers, and sum them up
  const summedElements = inputRows[1].split(' ').map(item => +item).reduce((accumulator, item) => accumulator + item, 0);

  // Check if the sum of elements exceeds the first value
  if (summedElements > firstVal) {
    // If it does, output -1 as per problem specification
    console.log(-1);
  } else {
    // Otherwise, output the difference between the first value and the sum
    console.log(firstVal - summedElements);
  }
};

// Initialize an empty string to accumulate incoming data
let inputBuffer = '';

// Attach a listener for 'data' events on standard input
process.stdin.on('data', chunk => {
  // Append each received data chunk to the input buffer
  inputBuffer += chunk;
});

// Attach a listener for the 'end' event on standard input
process.stdin.on('end', () => {
  // Dynamically import the 'os' module to get the End-Of-Line character
  const { EOL } = require('os');
  // Split the accumulated input buffer into an array of lines using the system's EOL
  const parsedLines = inputBuffer.split(EOL);
  // Call the main data processing function with the parsed lines
  analyzeInputData(parsedLines);
});
