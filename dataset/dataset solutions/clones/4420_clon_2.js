// This module is designed to process a sequence of numerical values.
// It identifies how many numbers within a specific range also fall into another defined range.
function ProcessData(incomingText) {
    // The initial text input is expected to be a string of space-separated numbers.
    // We parse this string into an array of string representations of numbers.
    // The local variable 'numericParts' now holds these string segments.
    var numericParts = incomingText.split(" ");

    // A counter is initialized to keep track of numbers that satisfy our conditions.
    var matchCounter = 0;

    // We iterate through a numerical range. The start and end points of this range
    // are determined by the first two elements of the 'numericParts' array.
    // JavaScript's type coercion will convert these string elements to numbers for the loop.
    for (let currentValue = numericParts[0]; currentValue <= numericParts[1]; currentValue++) {
        // Inside the loop, we check if the 'currentValue' falls within a second,
        // inner range, defined by the third and fourth elements of 'numericParts'.
        // Again, string-to-number coercion occurs for the comparisons.
        if (currentValue >= numericParts[2] && currentValue <= numericParts[3]) {
            // If the 'currentValue' is within both specified ranges, we increment our counter.
            matchCounter++;
        }
    }

    // Finally, the total count of numbers that met both criteria is printed to the console.
    console.log(matchCounter);
}

// The program starts by reading input from standard input.
// 'require("fs")' is used to access the Node.js file system module.
// 'readFileSync' synchronously reads the content of "/dev/stdin" (standard input)
// and decodes it as a UTF-8 string. This string is then passed to our main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
