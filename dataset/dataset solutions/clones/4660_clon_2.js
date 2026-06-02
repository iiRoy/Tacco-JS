function processInput(rawData) {
  // Remove any leading or trailing whitespace from the initial string data.
  let trimmedData = rawData.trim();

  // Parse the cleaned string: split by spaces and convert each segment into a numerical value.
  const numArray = trimmedData.split(" ").map(Number);

  // Compute the sum of the first two numerical elements, then apply a modulo 24 operation.
  // The result is then printed to the standard output.
  console.log((numArray[0] + numArray[1]) % 24);
}

// Execute the primary processing function by reading content from standard input.
// The 'fs' module is used to access the file system, and 'readFileSync' reads the entire file synchronously.
// '/dev/stdin' is the conventional path for standard input on Unix-like systems.
// 'utf8' specifies the character encoding for the input data.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
