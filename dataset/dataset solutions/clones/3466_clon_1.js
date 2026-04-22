/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */
function   Main   (   input   )
{
    // First, process the input string.
    // This removes leading/trailing whitespace and splits it into an array of characters.
    input   =   input . trim   (   ) . split   (   ""   )   ;


    // Check if the input array has exactly three elements.
    if   (   input . length   ==   3   )
    {
        /*
         * If the length is 3, we perform a swap operation.
         * The first character is swapped with the third character.
         */
        var   tmp   =   input   [   0   ]   ;         // Store the first character in a temporary variable.
        input   [   0   ]   =   input   [   2   ]   ;       // Assign the third character to the first position.
        input   [   2   ]   =   tmp   ;               // Assign the stored first character to the third position.
    }

    // After potential modification, join the characters back into a string and print it.
    console . log   (   input . join   (   ""   )   )   ;
}

// This section handles reading input from standard input and calling the Main function.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;