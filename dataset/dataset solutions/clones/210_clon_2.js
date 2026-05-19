var fileSystem = require('fs'); // Import the Node.js file system module

// Determine the size of the standard input stream
var fileSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var dataBuffer = new Buffer(fileSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string, trim whitespace, and split into lines
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Begin program execution
executeProgram();

/**
 * Main function to process input and display results.
 */
function executeProgram() {
  // Pre-calculate the number of trailing zeros for factorials up to a certain limit
  var trailingZeroCounts = calculateTrailingZeros();

  // Iterate through each line of input
  for (var idx = 0, lineCount = inputLines.length; idx < lineCount; idx++) {
    // Convert the input line (which is a string) to a number and use it as an index
    // to retrieve the pre-calculated trailing zero count.
    // The `- 0` operation implicitly converts the string to a number.
    console.log(trailingZeroCounts[inputLines[idx] - 0]);
  }
}

/**
 * Calculates the number of trailing zeros for factorials from 0 up to a defined upper limit.
 * This is based on Legendre's formula, counting factors of 5.
 *
 * @returns {Int32Array} An array where each index `n` stores the number of trailing zeros in `n!`.
 */
function calculateTrailingZeros() {
  var upperLimit = 20000; // The maximum number for which to calculate factorial trailing zeros

  // Initialize an array to store the counts of trailing zeros.
  // Using Int32Array for efficient storage of integers.
  var zeroCounts = new Int32Array(upperLimit + 1);

  // Iterate from 5 up to the upper limit.
  // Numbers less than 5! (i.e., 0!, 1!, 2!, 3!, 4!) have 0 trailing zeros.
  for (var num = 5; num <= upperLimit; num++) {
    // The number of trailing zeros for `num!` is `(num-1)!`'s zeros plus new zeros from `num`.
    // This is a cumulative sum.
    zeroCounts[num] = zeroCounts[num - 1];

    var currentVal = num;
    // Count factors of 5 in `num` by repeatedly dividing by 5.
    // `~~` is a bitwise NOT operator applied twice, which effectively floors the number.
    while ((currentVal = ~~currentVal / 5)) {
      zeroCounts[num] += currentVal;
    }
  }

  return zeroCounts;
}
