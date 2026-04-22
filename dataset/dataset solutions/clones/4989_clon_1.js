/*
 * This JavaScript file contains a program designed to calculate a bill based on
 * a total quantity and different billing rates. It demonstrates basic input parsing,
 * conditional logic, and arithmetic operations.
 *
 * This version is a Type I clone, meaning its functionality and core structure
 * are identical to the original, with only variations in whitespace and comments.
 */
'use strict' ; // The 'use strict' directive enables strict mode, which helps
               // write more secure and robust JavaScript code by catching common
               // coding errors and "unsafe" actions.


/**
 * The main function responsible for processing the input and calculating the bill.
 * @param {string} input - The raw input string, typically from standard input.
 */
function   Main   (   input   )
{

    // First, we process the raw input string.
    // It's expected to be multiple lines, so we split it by the newline character
    // into an array of strings, where each element is a line from the input.
    input   =   input   .   split   (   "\n"   )   ;


    // Next, we parse the necessary numerical values from the input array.
    // parseInt() converts a string to an integer. The '10' specifies base-10.
    var   total   =   parseInt   (   input   [   0   ]   ,   10   )   ; // Total quantity or amount.
    var   first   =   parseInt   (   input   [   1   ]   ,   10   )   ; // A threshold quantity for billing.
    var   billF   =   parseInt   (   input   [   2   ]   ,   10   )   ; // Billing rate for the 'first' quantity.
    var   billA   =   parseInt   (   input   [   3   ]   ,   10   )   ; // Billing rate for additional quantities.


    // Now, we apply the core billing logic using a conditional statement.
    // We check if the 'total' quantity is less than or equal to the 'first' threshold.
    if   (   total   <   billF   ||   total   ===   billF   )
    {
        // If the total quantity falls within or exactly matches the 'first' threshold,
        // the entire total is billed at the 'billF' rate.
        console   .   log   (   total   *   billF   )   ;
    }
    else
    {
        // If the total quantity exceeds the 'first' threshold, a tiered billing
        // system is applied.
        // The 'first' quantity is billed at 'billF' rate.
        // The remaining quantity (total - first) is billed at 'billA' rate.
        console   .   log   (   (   first   *   billF   )   +   (   (   (   total   -   first   )   *   billA   )   )   )   ;
    }

} // End of the Main function.


// This line is responsible for executing the Main function.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// using Node.js's 'fs' (file system) module and passes it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// The program concludes after the Main function has finished execution and printed its output.