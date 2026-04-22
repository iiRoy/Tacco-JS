/*
 * This is a Type I clone of an existing JavaScript program.
 * It strictly adheres to the definition: only whitespace and comments
 * are altered. All identifiers, operators, and expressions are identical.
 */
'use strict'; // Enforces strict mode for cleaner code.


process.stdin.resume(); // Resumes standard input to prevent the process from exiting.

process.stdin.setEncoding('utf-8'); // Sets the encoding for input data to UTF-8.


let inputString = ''; // Initializes an empty string to accumulate all incoming input.

let currentLine = 0; // Initializes a counter to keep track of the current line being processed from input.


// Event listener for 'data' event on standard input.
// This function appends chunks of input data as they arrive.
process.stdin.on(
    'data',
    function (inputStdin) {
        inputString += inputStdin; // Concatenates the new input chunk to the existing inputString.
    }
);


/*
 * Event listener for the 'end' event on standard input.
 * This signifies that all input has been received.
 * At this point, the accumulated input is processed and the main logic begins.
 */
process.stdin.on('end', function () {
    inputString = inputString.split('\n'); // Splits the entire inputString by newline characters into an array of lines.
    main(); // Calls the primary function to execute the core logic of the program.
});


// Helper function to read a single line from the global inputString array.
// It automatically advances the current line pointer.
function readline() {
    return inputString[currentLine++]; // Returns the line at currentLine index and then increments currentLine.
}


/**
 * The main execution block of the program.
 * This function orchestrates the reading of input, computation, and output.
 */
function main() {

    // Original commented-out line, demonstrating a previous approach.
    // var input = readline()

    /*
     * Reads a line from standard input, splits it by spaces,
     * and then converts each resulting substring into an integer.
     * The array of integers is stored in the variable 'k'.
     */
    var k = readline().split(' ').map(x => parseInt(x));

    // Destructures the array 'k' into individual variables: n, a, and b.
    var n = k[0],
        a = k[1],
        b = k[2];

    /*
     * This multi-line comment preserves the original, more verbose conditional
     * logic that was later refactored into a single, more concise expression.
     *
     * if(a > b){
     *     ok = 0;
     * }
     * else if(n == 1){
     *     if(a != b)
     *         ok = 0;
     *     else{
     *         ok = 1;
     *     }
     * }
     * else ok = (b-a) * (n-2) + 1;
     */

    // Calculates the final 'ok' value using the Math.max function
    // to ensure the result is never negative, taking the maximum of
    // the calculated expression and zero.
    var ok = Math.max((n - 2) * (b - a) + 1, 0);

    // Outputs the calculated 'ok' value to the console.
    console.log(ok);
}