function ProcessInput(rawData) {
  // This function takes raw string input, parses it, and performs a specific calculation.
  // It expects the input to be a string of space-separated numbers.
  const numericValues = rawData.split(' ').map(item => Number(item));

  // Extracting the individual numerical components from the processed array.
  const firstVal = numericValues[0]; // The first number in the sequence.
  const secondVal = numericValues[1]; // The second number.
  const thirdVal = numericValues[2]; // The third number.

  // Calculate the sum of the three extracted values, then subtract the largest value from the original set.
  // The final computed result is then printed to the console.
  console.log(firstVal + secondVal + thirdVal - Math.max(...numericValues));
}

// The program initiates by reading data from the standard input stream.
// It uses Node.js's file system module to synchronously read the content of /dev/stdin,
// interpreting it as UTF-8 encoded text. This content is then passed to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
