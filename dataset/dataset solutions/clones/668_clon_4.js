const inputSource = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let currentBlockQualifier = 0;
let linesToProcess = 0;
let aggregatedSum = 0;

const processInputLine = (inputString) => {
  const parsedValue = Number(inputString);

  if (Number.isNaN(parsedValue)) {
    return; // Assuming valid integer input as per problem context
  }

  if (currentBlockQualifier === 0) { // Expecting a new 'N' value
    if (parsedValue === 0) {
      inputSource.close();
      return;
    }
    currentBlockQualifier = Math.floor(parsedValue / 4);
    linesToProcess = currentBlockQualifier;
    aggregatedSum = 0;
  } else { // Expecting a number to be summed
    aggregatedSum += parsedValue;
    linesToProcess--;

    if (linesToProcess === 0) { // All numbers for the current block have been read
      console.log(aggregatedSum);
      currentBlockQualifier = 0; // Reset to expect a new 'N'
    }
  }
};

inputSource.on('line', processInputLine);

inputSource.on('close', () => {
  // No explicit action needed upon stream closure for this problem
});