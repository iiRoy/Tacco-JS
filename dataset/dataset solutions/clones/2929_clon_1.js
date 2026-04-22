/*
 * This is a JavaScript program.
 * It calculates a sequence of values based on input.
 * The input should be three space-separated numbers.
 */
function main(   input   ) { // Main function definition

    // Declare and initialize variables from the input string.
    // The input is expected to be three space-separated numbers.
    var r   =   input .   split (   " "   ) [   0   ]   -   0   ;   // First number: 'r'
    var d   =   input .   split (   " "   ) [   1   ]   -   0   ;   // Second number: 'd'
    var x   =   input .   split (   " "   ) [   2   ]   -   0   ;   // Third number: 'x'


    // Initialize an array to store the calculated map values.
    var map   =   [   ]   ;

    // Set the initial value for the map at index 0.
    map [   0   ]   =   x   ;


    // Loop from 1 to 10 (inclusive) to calculate subsequent values.
    for   (   var   i   =   1   ;   i   <=   10   ;   i ++   )
    {
        // Calculate the current map value using the formula: r * map[i-1] - d
        map [   i   ]   =   r   *   map [   i   -   1   ]   -   d   ;

        // Print the calculated value to the console.
        console .   log (   map [   i   ]   )   ;
    }
} // End of main function


// Call the main function with input read from stdin.
// This part reads the entire content of /dev/stdin as a UTF-8 string.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;