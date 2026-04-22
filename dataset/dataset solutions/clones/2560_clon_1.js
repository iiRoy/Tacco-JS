/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural equivalence,
 * with extensive changes only to whitespace and comments.
 */

// Define the main function that processes the input data
function   Main (   input   )
{
    // Split the entire input string into an array of lines
    input =   input . split   (   "\n"   )   ;

    /*
     * Parse the first line of input to get memory parameters.
     * mem[0] will be the total number of items, mem[1] initial points, mem[2] deduction.
     */
    var   mem   =   input   [   0   ]   .   split   (   " "   )   .   map   (   Number   )   ;

    // Initialize an array 'arr' to store scores for each item.
    // The size is mem[0] + 1 (for 1-based indexing), filled with initial score (mem[1] - mem[2]).
    var   arr   =   new   Array   (   mem   [   0   ]   +   1   )   .   fill   (   mem   [   1   ]   -   mem   [   2   ]   )   ;

    // Remove the first line of input, which contained the memory parameters,
    // as it has already been processed.
    input .   shift   (   )   ;

    // Iterate over the remaining input lines (which represent item indices)
    // and increment the score for each specified item.
    input . forEach ( function   (   val   )   {
        arr [   val   ]   ++   ;
    }   )   ;

    // Remove the first element of 'arr'.
    // This is typically done because the array is 1-indexed for convenience
    // and the 0th element is unused or a placeholder.
    arr   .   shift   (   )   ;

    // Iterate through the 'arr' to determine if each item's score is sufficient.
    // Output "Yes" if score is 1 or more, "No" otherwise.
    arr .   forEach   (   function   (   val   )   {
        console   .   log   (   val   >=   1   ?   "Yes"   :   "No"   )   ;
    }   )   ;

}   // End of Main function definition

// Call the Main function with input read from standard input.
// The input is read as a UTF-8 string, then trimmed of leading/trailing whitespace.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;