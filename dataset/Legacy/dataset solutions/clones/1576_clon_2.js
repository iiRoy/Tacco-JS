const dataString = require("fs").readFileSync("/dev/stdin", "utf8").slice(0, -1).split('\n')[0]; /* This line reads input from stdin, removes the trailing newline, and takes the first line. */
let sumOfDigits = 0; // Initialize a variable to accumulate the sum of digits.
for (let idx = 0; idx < dataString.length; idx++) { // Iterate through each character of the input string.
  sumOfDigits += Number(dataString[idx]); // Convert character to number and add to the sum.
}

console.log(sumOfDigits % 9 === 0 ? "Yes" : "No"); // Output "Yes" if the sum is divisible by 9, otherwise "No".
