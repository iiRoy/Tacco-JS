const fileHandle = require('fs');

const currentProcess = process;
const logger = console.log;

// Determine the size of the standard input stream
let dataBlockSize = fileHandle.fstatSync(currentProcess.stdin.fd).size;

// Allocate a buffer to hold the input data
let rawInputBuffer = new Buffer(dataBlockSize);

// Read data from standard input into the buffer
let actualDataAmount = fileHandle.readSync(currentProcess.stdin.fd, rawInputBuffer, 0, dataBlockSize, 0);

// Convert buffer to string, trim whitespace, and split into individual lines
let linesOfData = rawInputBuffer.toString('utf8', 0, actualDataAmount).trim().split('\n');

// Begin the primary data processing routine
performAnalysis();

function performAnalysis ( ) {
  // Iterate through each line of the input data
  for ( let currentLineIndex = 0, totalLineCount = linesOfData.length;
        currentLineIndex < totalLineCount;
        currentLineIndex++ )
  {
    // Parse the current line: trim, split by comma, sort descending, convert to numbers
    const numericValues = linesOfData[currentLineIndex]
      .trim()
      .split(',')
      .sort(function (firstNum, secondNum) {
        return secondNum - firstNum; // Descending order
      })
      .map(Number); // Ensure values are numeric

    let analysisOutcome = "unknown_pattern"; // Default outcome

    // Check for "four card" pattern
    if (
         (numericValues[0] === numericValues[1] &&
          numericValues[1] === numericValues[2] &&
          numericValues[2] === numericValues[3])
      || (numericValues[1] === numericValues[2] &&
          numericValues[2] === numericValues[3] &&
          numericValues[3] === numericValues[4])
    ) {
      analysisOutcome = "four card";
    }
    // Check for "full house" pattern
    else if (
              (numericValues[0] === numericValues[1] &&
               numericValues[1] === numericValues[2] &&
               numericValues[3] === numericValues[4])
           || (numericValues[0] === numericValues[1] &&
               numericValues[2] === numericValues[3] &&
               numericValues[3] === numericValues[4])
    ) {
      analysisOutcome = "full house";
    }
    // Check for "straight" pattern (sequential values, with ace-high/low consideration)
    else if (
             numericValues[0] === numericValues[1] + 1 &&
             numericValues[1] === numericValues[2] + 1 &&
             numericValues[2] === numericValues[3] + 1 &&
             (
                (numericValues[0] === 13 && numericValues[4] === 1) // Example: A, K, Q, J, 10 where 13=K, 1=A
             || (numericValues[3] === numericValues[4] + 1)         // Standard sequential straight
             )
    ) {
      analysisOutcome = "straight";
    }

    // Output the determined pattern
    logger(analysisOutcome);
  }
}