var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input data from standard input
var inputLines = rawData.split('\n'); // Split the raw data into an array of lines

var currentInputString; // Declare a variable to hold the current line being processed
while (currentInputString = inputLines.shift()) { // Loop through each line of input until no more lines are available
  // Initialize a counter for valid combinations for the current target value
  var combinationCount = 0;

  // Convert the current input string to a number. The unary plus operator is used for type conversion.
  var targetValue = +currentInputString;

  // Output the original string representation of the line
  console.log(currentInputString);

  // Output the numeric value derived from the line
  console.log(targetValue);

  // Begin a series of nested loops to iterate through all possible combinations of four digits
  // Each digit can range from 0 to 8 (inclusive), as per the loop condition '< 9'
  for (var firstDigit = 0; firstDigit < 9; firstDigit++) {
    for (var secondDigit = 0; secondDigit < 9; secondDigit++) {
      for (var thirdDigit = 0; thirdDigit < 9; thirdDigit++) {
        for (var fourthDigit = 0; fourthDigit < 9; fourthDigit++) {
          // Check if the sum of the four current digits equals the target value
          if (firstDigit + secondDigit + thirdDigit + fourthDigit === targetValue) {
            // If the sum matches, increment the combination counter
            combinationCount++;
          }
        }
      }
    }
  }
  // After checking all possible combinations for the current target value,
  // output the total number of combinations found
  console.log(combinationCount);
}
