const processInput = (rawData) => {
  // The initial raw input string is processed.
  let processedLines = rawData.trim().split('\n');

  // The first line provides the total count of elements.
  let countElements = parseInt(processedLines[0], 10);

  // The second line contains space-separated numbers, which are parsed and then sorted in descending order.
  const sortedNumbers = processedLines[1].split(' ').map(Number).sort((valA, valB) => valB - valA);

  // A variable to accumulate the final computed sum.
  let totalSum = 0;

  // A loop iterates from the second element up to, but not including, the total count.
  for (let idx = 1; idx < countElements; idx++) {
    // For each iteration, a specific element from the sorted array is added to the sum.
    // The index for the sorted array is determined by halving the current loop index and flooring the result.
    totalSum += sortedNumbers[Math.floor(idx / 2)];
  }

  // The final calculated sum is printed to the standard output.
  return console.log(totalSum);
};

// This conditional statement checks for a specific environment variable.
// If 'MYTEST' is set, a test function (assumed to be defined elsewhere) is executed.
// Otherwise, the main processing function is called with data read from standard input.
process.env.MYTEST
  ? test()
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
