'use strict'; // Activate strict parsing and execution rules.

/**
 * This core function is designed to take a single numerical parameter
 * and execute a specific conditional arithmetic operation.
 * It determines an outcome based on the divisibility of the number by six.
 *
 * @param {number} givenNumber - The numerical value to be processed.
 */
function processNumericalInput(givenNumber) {
    // Determine if the supplied numerical input is a multiple of six.
    if (  ( givenNumber % 6 )  ===  0  )
    {
        // If it is perfectly divisible, the quotient is the result.
        console.log(   givenNumber   /   6   );
    }
    else
    {
        // Otherwise, calculate the floor of the division and increment by one.
        // This effectively rounds up the result for non-multiples.
        console.log(
            Math.floor(   givenNumber   /   6   )   +   1
        );
    }
}

// Obtain a reference to the Node.js file system module.
const fileSystemHandler   =   require(   "fs"   );

// Create a variable to hold the specific file reading function.
const fileContentReader   =   fileSystemHandler.readFileSync;

// Specify the path for standard input, typically where the program receives data.
const sourceFilePath   =   "/dev/stdin";

// Read the raw byte content from the specified file path,
// interpreting it as a UTF-8 encoded string.
let   rawTextData   =   fileContentReader(   sourceFilePath,   "utf8"   );

// Convert the acquired textual data into a numerical format
// and then invoke the main processing routine with this number.
processNumericalInput(
    Number(   rawTextData   )
);