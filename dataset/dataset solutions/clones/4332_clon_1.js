/*
 * This is the primary entry point function.
 * It processes the given input string to determine a specific condition.
 */
function     Main    (    input    )


{
    // The core logic: check if the first line of the input starts with "YAKI".
    // Split the input by newline, take the first element, and check its beginning.
    console.log (   input   .   split   (   "\n"   )   [   0   ]   .   indexOf   (   "YAKI"   )   ===   0   ?   "Yes"   :   "No"   )   ;

} //    End of the Main function declaration.


// The following lines are responsible for reading from standard input
// and invoking the Main function with the retrieved data.
// It is critical for the execution environment and should not be altered.
Main    (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;