var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input as a UTF-8 string

// Split the entire input string by spaces to get an array of string values
var parsedInput = rawData.split(/ /);

// Convert the first element of the parsed input array to an integer
var firstNum = parseInt(parsedInput[0]);

// Convert the second element of the parsed input array to an integer
var secondNum = parseInt(parsedInput[1]);

// Perform a comparison between the two parsed numbers
if (firstNum < secondNum) {
  // If the first number is strictly less than the second
  console.log("a < b");
} else if (firstNum > secondNum) {
  // If the first number is strictly greater than the second
  console.log("a > b");
} else {
  // If neither of the above conditions is true, the numbers must be equal
  console.log("a == b");
}
