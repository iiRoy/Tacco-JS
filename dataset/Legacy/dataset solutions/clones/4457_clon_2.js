process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8 for character handling.

// Declare an array to store all incoming lines from standard input.
var inputData = [];

// Create an interface for reading lines from standard input.
var inputProcessor = require('readline').createInterface({
  input: process.stdin,  // Specify standard input as the source.
  output: process.stdout // Specify standard output for any potential output (though not used by readline itself here).
});

// Event listener for each line received from the input stream.
inputProcessor.on('line', (currentLine) => {
  // Add the current line to our collection of input data.
  inputData.push(currentLine);
});

// Event listener for when the input stream is closed.
inputProcessor.on('close', () => {
  // Parse the first line of input as a number, which represents the upper limit.
  var limitVal = Number(inputData[0]);

  // Initialize an array to store the count of factors of 2 for each number.
  var powerOfTwoCounts = [];

  // Loop from 1 up to the specified limit (inclusive).
  for (let iterator = 1; iterator <= limitVal; iterator++) {
    // Create a temporary variable for the current number to avoid modifying the loop counter.
    let tempNumber = iterator;
    // Initialize a counter for factors of 2.
    let twoFactorCount = 0;

    // While the temporary number is even, divide it by 2 and increment the count.
    while (tempNumber % 2 === 0) {
      twoFactorCount++;
      tempNumber = tempNumber / 2;
    }
    // Store the calculated count for the current number.
    powerOfTwoCounts.push(twoFactorCount);
  }

  // Find the maximum count of factors of 2 among all numbers.
  var highestCount = Math.max(...powerOfTwoCounts);

  // Find the index of the first occurrence of this maximum count.
  var resultIndex = powerOfTwoCounts.indexOf(highestCount);

  // Output the 1-based index of the number that has the highest count of factors of 2.
  console.log(resultIndex + 1);
});
