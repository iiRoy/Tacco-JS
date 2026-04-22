/*
 * This is a JavaScript file for processing input and performing some calculations.
 * It strictly adheres to modern JavaScript standards.
 */
"use strict";
// Resumes the stdin stream, ensuring data can be read.
process.stdin.resume();
/*
 * Sets the encoding for the standard input stream.
 * UTF-8 is a common and robust encoding.
 */
process.stdin.setEncoding("utf-8");


// A utility function to print output to the console.
function print( x )
{
    // Logs the given argument to the standard output.
    console.log(x);
}


let inputString = ""; /* Initializes a string to accumulate input data. */
let currentLine = 0;  // Keeps track of the current line being read from input.


// Event listener for incoming data on the standard input.
process.stdin.on( "data", inputStdin => {
    /* Appends the received chunk of data to the inputString. */
    inputString += inputStdin;
} );

// Event listener for the end of the standard input stream.
process.stdin.on( "end", () => {
    /* Once all data is received, split the accumulated string by newline characters. */
    inputString = inputString.split("\n");
    // Call the main function to start processing.
    main();
} );

/*
 * Reads a line from the processed inputString array.
 * Increments the currentLine counter after reading.
 */
function readline()
{
    return inputString[currentLine++];
}

// ==============================================================================
// The section above this line handles input/output setup.
// The primary logic of the program begins below.
// ==============================================================================

function main()
{
    /* Read a line, split it by space, and parse each part as an integer. */
    var ar = readline() .split(" ") .map(x => parseInt(x));
    // Destructure the array into two variables, 'a' and 'b'.
    var a = ar[0], b = ar[1];

    // Determine the maximum of the two input numbers.
    var Max = Math.max(a, b);
    // Determine the minimum of the two input numbers.
    var Min = Math.min(a, b);

    // Calculate the integer division of Max by Min.
    var div = Math.floor(Max / Min);
    // Calculate the integer multiplication of Max by Min.
    var mul = Math.floor(Max * Min);
    // Perform a final calculation: floor( (Max * Min) / (Max / Min) )
    var ok = Math.floor(mul / div);

    // Print the final result.
    print(ok);

}