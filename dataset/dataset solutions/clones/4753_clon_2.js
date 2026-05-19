// This function is designed to process a string of numerical values
// and compute the maximum of two products derived from these values.
function computeMaxProduct(inputString) {
    // The input string is first divided into an array of substrings
    // using a space character as the delimiter.
    // This effectively transforms the single string into an array of number-like strings.
    inputString = inputString.split(' ');

    // The core logic involves calculating two products:
    // 1. The product of the first two elements in the array (at index 0 and 1).
    // 2. The product of the next two elements (at index 2 and 3).
    // Math.max then determines which of these two products is greater.
    // The result is printed to the console using '%d' for integer formatting.
    console.log('%d', Math.max(
        inputString[0] * inputString[1], // Calculate the product of the initial pair
        inputString[2] * inputString[3]  // Calculate the product of the subsequent pair
    ));
}

// The program begins by reading data from standard input.
// 'require('fs')' is used to access the file system module.
// 'readFileSync' reads the entire content of '/dev/stdin' synchronously.
// The 'UTF-8' encoding is specified for proper character interpretation.
const fileData = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Finally, the obtained file data (which is the input string) is passed
// to our primary processing function to execute the calculation and output.
computeMaxProduct(fileData);
