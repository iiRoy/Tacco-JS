// This function is designed to take a string of raw data, parse it, and then compare two numerical values.
function ProcessInput (rawData) {
    // First, the incoming string is split by spaces, and each resulting substring is converted into a number.
    // These numerical values are then stored in an array.
    var numericValues = rawData.split(" ").map(Number);

    // A conditional check is performed on the first two elements of the array.
    // This uses a nested ternary operator to determine the relationship between the two numbers.
    numericValues[0] < numericValues[1]
        ? console.log("a < b") // If the first number is strictly less than the second, output "a < b".
        : (numericValues[0] === numericValues[1] // Otherwise, check if the first number is strictly equal to the second.
            ? console.log("a == b") // If they are equal, output "a == b".
            : console.log("a > b") // If neither of the above conditions is met, the first number must be greater, so output "a > b".
        );
}

// The program initiates by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin' as a UTF-8 string.
// This string content is then passed as an argument to the 'ProcessInput' function for processing.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
