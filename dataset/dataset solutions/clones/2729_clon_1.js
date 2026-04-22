/*
 * This JavaScript code defines a function to process
 * numerical input and perform a calculation.
 * It then reads input from standard in and calls the function.
 */
function   Main   (   input   )
{

    // First, the input string is split by spaces and converted to an array of numbers.
    // This prepares the numerical data for subsequent operations.
    input   =   input . split (   " "   ) . map (   Number   )   ;


    /*
     * The core logic involves calculating the ceiling of a division.
     * Specifically, it's input[0] divided by (input[1] + 1).
     * The result is then printed to the console.
     */
    console . log (   Math . ceil (   input [   0   ]   /   (   input [   1   ]   +   1   )   )   )   ;

}   // End of the Main function declaration.


// The Main function is immediately invoked with data read from standard input.
// This uses Node.js's file system module to read the entire content of /dev/stdin,
// converts it to a UTF-8 string, and removes leading/trailing whitespace.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   ) . trim (   )   )   ;