/*
 * This function processes the entire input data provided.
 * It calculates a specific count based on integer ranges and divisibility rules.
 */

function   Main   (   input   )       {

    // The main entry point for processing the input string.


    line    =    input.split   (   " "   )   ;   // Split the input string by spaces to get individual numbers.


    var     A     =     +line[0]     ;     // First integer value from input.


    var     B     =     +line[1]     ;     // Second integer value from input.


    var     C     =     +line[2]     ;     // Third integer value (divisor C) from input.


    var     D     =     +line[3]     ;     // Fourth integer value (divisor D) from input.
    // All input values are parsed as numbers using the unary plus operator.


    var     count     =     0     ;     // Initialize a counter for numbers not divisible by C or D.
    // This counter will store the final result.


    // Loop through the range of integers from A to B (inclusive).
    for     (     i     =     A     ;     i     <=     B     ;     i++     )     {

        // Check each number in the range.
        if     (     i     %     C     ==     0     ||     i     %     D     ==     0     )     {

            // If 'i' is divisible by C OR 'i' is divisible by D, do nothing.
            // These numbers are skipped as per the problem logic.
        }
        else     {

            // If 'i' is NOT divisible by C AND NOT divisible by D, increment the counter.
            count     +=     1     ;
        }
    }
    // End of the loop. All numbers in the range A to B have been processed.


    console.log     (     count     )     ;     // Output the final calculated count to the console.

}
// End of the Main function definition.


/*
 * The following lines are boilerplate code for handling standard input/output.
 * Do not modify this section.
 * It reads the entire standard input and passes it to the 'Main' function.
 */

Main     (     require     (     "fs"     )     .readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;
// The script execution starts here, calling Main with the read input.