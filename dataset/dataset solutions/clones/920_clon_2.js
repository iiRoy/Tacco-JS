var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw data from standard input
// Parse the input string into four numerical values
var [firstOperand, secondOperand, thirdOperand, fourthOperand] = rawInputData.trim().split(" ").map(Number);

// Evaluate a complex conditional expression
// The first part checks if (firstOperand * secondOperand + 1) is an even number.
// The second part checks if (firstOperand + secondOperand + 1) is an odd number.
// If both conditions are true, print "No". Otherwise, print "Yes".
if (((firstOperand * secondOperand) + 1) % 2 === 0 && ((firstOperand + secondOperand) + 1) % 2 !== 0) {
    console.log("No"); // Output "No" based on the evaluation
} else {
    console.log("Yes"); // Output "Yes" if the conditions are not met
}
