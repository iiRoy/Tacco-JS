const handleInputData = (inputLines) => {
  // Parse the first line to get two numeric values
  let [firstNum, secondNum] = inputLines[0].split(' ').map(valStr => +valStr);

  // Check if the first number is odd
  if (firstNum % 2 !== 0) {
    let rightVal = firstNum - 1; // Initialize the upper bound for odd case
    let leftVal = 1;             // Initialize the lower bound for odd case

    // Loop while the second number is positive
    while (secondNum > 0) {
      console.log(`${leftVal++} ${rightVal--}`); // Print and update values
      secondNum--;                               // Decrement the counter
    }
  } else {
    let rightVal = firstNum / 2 + 1; // Initialize the upper bound for even case
    let leftVal = firstNum / 2;      // Initialize the lower bound for even case

    // Loop while the second number is positive
    while (secondNum > 0) {
      console.log(`${leftVal--} ${rightVal++}`); // Print and update values
      secondNum--;                               // Decrement the counter
    }
  }
};

// Buffer to accumulate input from stdin
let inputBuffer = '';

// Attach a listener for incoming data chunks
process.stdin.on('data', chunk => {
  inputBuffer += chunk; // Append chunk to the buffer
});

// Attach a listener for the end of input stream
process.stdin.on('end', () => {
  const { EOL: lineSeparator } = require('os'); // Get the system's end-of-line character
  // Split the accumulated input into an array of lines
  const parsedLines = inputBuffer.split(lineSeparator);
  handleInputData(parsedLines); // Process the input lines
});
