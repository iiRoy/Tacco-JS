process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function serves as the primary entry point for processing the input data.
// It receives the entire standard input as a single string.
function ProcessInputData(rawData) {
  // Divide the raw input string into an array of individual lines.
  // Each element in 'linesArray' corresponds to one line from the input.
  const linesArray = rawData.split('\n');

  // Extract the first line from the array and split it by spaces.
  // This assumes the first line contains space-separated numerical values.
  const firstLineParts = linesArray[0].split(' ');

  // Convert the string parts of the first line into numerical values.
  // These represent the starting number, ending number, and the divisor.
  const startNum = Number(firstLineParts[0]);
  const endNum = Number(firstLineParts[1]);
  const divisorVal = Number(firstLineParts[2]);

  // Initialize a variable to hold the final calculated result.
  // Its initial string value is a placeholder and will be immediately overwritten.
  let countDivisible = 'placeholder_result';

  // --- Start of the core calculation logic ---

  // Reset the counter to zero before beginning the iteration.
  countDivisible = 0;

  // Loop through each integer from 'startNum' up to 'endNum', inclusive.
  for (let currentNum = startNum; currentNum <= endNum; currentNum++) {
    // Check if the 'currentNum' is perfectly divisible by 'divisorVal'.
    // A number is perfectly divisible if the remainder of the division is zero.
    if (currentNum % divisorVal === 0) {
      // If divisible, increment the counter.
      countDivisible++;
    }
  }

  // --- End of the core calculation logic ---

  // Print the final count of divisible numbers to the console.
  console.log(countDivisible);
}

// The following line is crucial for standard input/output operations.
// It reads the entire content of /dev/stdin, converts it to UTF-8,
// and then passes it to the 'ProcessInputData' function.
// This part should not be altered.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
