/*
 * This script is designed to accept a string of space-separated numbers,
 * convert them into an array of numerical values, and then perform
 * a comparison between the first two elements.
 */
function ProcessInputData( rawStringData )
{
    // Declare a variable to hold the processed numerical values.
    // The input string is split by spaces, and each resulting substring
    // is converted into a number.
    var   numericValuesList = rawStringData.split(" ").map(Number);

    // Execute a nested ternary operation to compare the first two numbers.
    // If the first number is less than the second, output "a < b".
    // Otherwise, if the first number is equal to the second, output "a == b".
    // In all other cases (first number is greater), output "a > b".
    numericValuesList[0] < numericValuesList[1]
        ? console.log("a < b")
        : (numericValuesList[0] == numericValuesList[1]
            ? console.log("a == b")
            : console.log("a > b"));
}

// The entry point of the script:
// It reads the entire content from standard input ('/dev/stdin') as a UTF-8 string
// and passes it to the 'ProcessInputData' function for processing.
ProcessInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );