/*
 * This JavaScript file contains a main function to process numerical input.
 * It reads several integer values from standard input and performs a specific calculation.
 * The calculation involves determining a total cost based on different rates for
 * a 'first' quantity and a 'remaining' quantity.
 */
function   Main   (   input   )
{

    // The raw input string is expected to be multi-line.
    // It is split into an array of strings, where each element corresponds to a line.
    input   =   input.split(   "\n"   )   ;


    // The first line of input is parsed as an integer to represent the 'total' quantity.
    var   total   =   parseInt(   input[0]   ,   10   )   ;


    // The second line is parsed as an integer for the 'first' quantity.
    var   first   =   parseInt(   input[1]   ,   10   )   ;


    // The third line provides the billing rate ('billF') for the 'first' quantity.
    var   billF   =   parseInt(   input[2]   ,   10   )   ;


    // The fourth line provides the billing rate ('billA') for the 'remaining' quantity.
    var   billA   =   parseInt(   input[3]   ,   10   )   ;


    // The final result is calculated using the formula:
    // (first_quantity * first_rate) + ((total_quantity - first_quantity) * remaining_rate)
    // This result is then printed to the console.
    console.log   (   (   first   *   billF   )   +   (   (   total   -   first   )   *   billA   )   )   ;

}


// This part of the script is responsible for reading the input data.
// It uses Node.js's 'fs' module to synchronously read the entire content
// of standard input ('/dev/stdin') as a UTF-8 encoded string.
// This string is then passed as an argument to the 'Main' function for processing.
Main   (   require(   "fs"   ).readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;