var inputData = require('fs')
    .readFileSync(
        '/dev/stdin', // Specifies the standard input file path
        'utf8'        // Defines the character encoding for reading the file
    ); // This line retrieves the raw textual content from the system's standard input.


/*
 * The data acquired from the input stream is initially in string format.
 * It is essential to convert this string into an integer to perform
 * mathematical computations accurately as per the program's requirements.
 */
var numericInput = parseInt(
    inputData // The string variable containing the raw input
);


// A variable initialized to hold the final computed numerical aggregate.
var finalResult = 0;


// First computational segment: Determines a portion of the result based on multiples of 500.
// Each full block of 500 units contributes a value of 1000 to the total.
finalResult = Math.floor(numericInput / 500) * 1000;


/*
 * Second computational segment: Processes the remainder after the initial division by 500.
 * For every group of 5 units within this remainder, an additional 5 is added to the running total.
 */
finalResult += Math.floor((numericInput % 500) / 5) * 5;


// The conclusive calculated numerical outcome is then displayed to the console's standard output.
console.log(finalResult);