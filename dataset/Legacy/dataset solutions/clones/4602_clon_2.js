const processInput = rawData => {
  // This function takes raw input data and processes it to determine a specific condition.
  const parsedLines = rawData.trim().split('\n');

  // We extract three integer values from the initial line of the input.
  // These values are crucial for the subsequent calculation.
  const [firstVal, secondVal, thirdVal] = parsedLines[0].split(' ').map(strNum => parseInt(strNum, 10));

  // We then iterate through multiples of the 'firstVal', starting from 'firstVal' itself.
  // The iteration continues as long as the current multiple does not exceed 10000.
  for (let currentMultiple = firstVal; currentMultiple <= 10000; currentMultiple += firstVal) {
    // Inside the loop, we check if the current multiple, when divided by 'secondVal',
    // yields a remainder equal to 'thirdVal'.
    if (currentMultiple % secondVal === thirdVal) {
      // If this condition is met, it signifies a successful match.
      // We print 'YES' to the console and exit the function immediately.
      console.log('YES');
      return;
    }
  }

  // If the loop completes without finding any multiple that satisfies the condition,
  // it means no such number exists within the specified range.
  // In this scenario, we output 'NO' to indicate failure.
  console.log('NO');
};

// The program initiates by reading the content of standard input.
// The 'fs' module is used for file system operations, and 'readFileSync'
// reads the entire file synchronously. The input is expected to be UTF-8 encoded.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
