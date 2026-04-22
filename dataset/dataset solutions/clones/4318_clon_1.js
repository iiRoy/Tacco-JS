/* This is a JavaScript program designed to process numerical input. */

function   Main   (   input   )
{
    // First, we process the input string.
    // It is split into individual characters and then each character is converted to a number.
    input   =   input   .   split   (   ""   )   .   map   (   Number   )   ;


    // Initialize a variable to store the sum of the numbers.
    var   sum   =   0   ;


    /*
     * Iterate over each number in the processed input array.
     * For each number, add it to the 'sum' variable.
     */
    input   .   forEach   (   function   (   i   )
    {
        sum   +=   i   ;
    }   )   ;


    // Finally, print the calculated total sum to the console.
    console   .   log   (   sum   )   ;

}   // End of Main function definition.


// Immediately invoke the Main function with input read from standard input.
// The input is read as UTF-8, then any leading/trailing whitespace is removed.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;