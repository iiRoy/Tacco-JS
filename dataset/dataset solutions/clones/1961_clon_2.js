const computeResult = (dataRows) => {
  // Extract numerical parameters from the initial configuration line
  const [limitNum, _auxiliaryVal] = dataRows[0]
                                             .split(' ')
                                             .map(
                                               (numStr) => Number(numStr)
                                             );

  // Sum up all the values from the second input line to get total allocated units
  const allocatedUnits = dataRows[1]
                                 .split(' ')
                                 .map((itemValue) => Number(itemValue))
                                 .reduce(
                                   (runningSum, itemValue) => runningSum + itemValue,
                                   0
                                 );

  // Determine the outcome based on the comparison of allocated units and the limit
  if (allocatedUnits > limitNum) {
    // Output an error indicator if allocation exceeds the maximum capacity
    console.log(-1);
  } else {
    // Otherwise, display the remaining capacity
    console.log(limitNum - allocatedUnits);
  }
}; // Concludes the primary data processing routine

// Initialize a variable to accumulate all standard input data
let rawInputText = '';

// Register an event listener to append each incoming data fragment
process.stdin.on('data', (inputFragment) => {
  rawInputText += inputFragment;
});

// Register an event listener for when all input has been received
process.stdin.on('end', () => {
  // Obtain the system-specific end-of-line character
  const osModule = require('os');
  const LINE_BREAK_CHAR = osModule.EOL;

  // Parse the collected raw input into an array of distinct lines
  const parsedLines = rawInputText.split(LINE_BREAK_CHAR);

  // Execute the main computation logic with the prepared lines
  computeResult(parsedLines);
});