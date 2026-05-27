let [ firstVal, secondVal ] = require("fs")
  .readFileSync("/dev/stdin", "utf8") // Read input from standard input
  .split(" ") // Split the string by space
  .map(Number); // Convert each part to a number

// Check if the sum of the two numbers is greater than or equal to 10
// If it is, print "error", otherwise print their sum.
console.log(firstVal + secondVal >= 10 ? "error" : firstVal + secondVal);
