/*
 * This is a JavaScript program designed to process input.
 * It's a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */


function    Main (    input    )    { // Function definition starts here

    // Process the input string by splitting it into an array of characters.
    input   =   input .   split (   ""   )   ;

    var     ans     =   ""    ; // Initialize an empty string to store the result.

    // Loop through each character of the input array.
    for (    var    i   =   0   ;    i   <   input .   length   ;    i++    )    {

        // Check if the current index is even.
        if (   i   %   2   ==   0   ) { // If index is even, append the character to 'ans'.
            ans   +=   input [   i   ]   ;
        }

    } // End of for loop

    // Output the final accumulated string to the console.
    console .   log (    ans    )   ;

} // End of Main function definition

// Execute the Main function with input read from standard input.
Main (    require (   "fs"   ) .   readFileSync (   "/dev/stdin"   ,   "utf8"   ) .   trim (   )    )   ;

// End of file.