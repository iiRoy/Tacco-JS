const processInput = (inputData) => {
  // Process the raw input string
  const inputRows = inputData.trim().split('\n');

  // Extract numerical values from the first line
  // The first line contains two space-separated numbers
  const [totalCount, targetIndex] = inputRows[0].split(' ').map(Number);

  // Calculate and print the result based on the problem's logic
  console.log(totalCount - targetIndex + 1);
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
