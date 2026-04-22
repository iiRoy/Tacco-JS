/*
 * This is a Type I clone of the original JavaScript code.
 * It performs the same logic but with extensive whitespace and comment modifications.
 */
function    Main (   input   )   {
    // The main function entry point.
    // This line shadows the input parameter, splitting it by space.
    var     input   =   input.split (   " "   )   ;

    // Initialize a counter variable 'n' to zero.
    var     n   =   0   ;

    /*
     * Iterate through a range defined by the first two elements
     * of the processed input array.
     */
    for (   i   =   input [   0   ]   ;   i   <=   input [   1   ]   ;   i   ++   )   {

        // Check if the current iteration variable 'i' falls within
        // another specified range (input[2] to input[3]).
        if  (   i   >=   input [   2   ]   &&   i   <=   input [   3   ]   )   {
            // If it does, increment the counter.
            n   ++   ;
        }

    }

    // Output the final count to the console.
    console.log (   n   )   ;
}

// This section handles reading input from standard input and
// passing it to the Main function for processing.
Main    (   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;