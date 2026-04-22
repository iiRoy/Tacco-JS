/*
 * This JavaScript code reads input from stdin, processes it,
 * and then performs a linear search operation.
 * It is a Type I clone, meaning only whitespace and comments
 * have been altered from the original.
 */

var    input     =     require('fs') . readFileSync (   '/dev/stdin'   ,   'utf8'   ) ;


// Trim whitespace from the input and split it into an array of lines.
var     Arr      =    (   input . trim ()   ) . split (   "\n"   ) ;

/*
 * The first element of the array (Arr[0]) is converted to a Number.
 * This number, N1, likely represents the size of an array or a count.
 */
var     N1      =     Number (   Arr [   0   ]   )
;

// The second line (Arr[1]) is split by spaces and each part converted to a Number, forming arr1.
var     arr1     =     Arr [   1   ] . split (   " "   ) . map (   Number   ) ;

// The fourth line (Arr[3]) is similarly processed to form arr2.
var     arr2     =     Arr [   3   ] . split (   " "   ) . map (   Number   ) ;


/*
 * Function: linearSearch
 * Description: Performs a basic linear search on an array.
 * Parameters:
 *   - key: The value to search for.
 *   - arr: The array to search within.
 * Returns: 1 if the key is found, 0 otherwise.
 */
const    linearSearch    =    (    key    ,    arr    )    =>    {

    for    (    let    i    =    0    ;    i    <    N1    ;    i++    )    {
        // Check if the current element matches the key.
        if    (    arr [   i   ]    ===    key    )    return    1    ;
            }

    // If the loop completes without finding the key, return 0.
    return    0    ;
}


/*
 * The final step involves iterating through arr2,
 * applying the linearSearch function for each element against arr1,
 * and then summing up the results (which will be 0s and 1s).
 * This effectively counts how many elements from arr2 are present in arr1.
 */
console . log (    arr2 . map (    e    =>    linearSearch (    e    ,    arr1    )    ) . reduce (    (    a    ,    b    )    =>    a    +    b    ,    0    )    ) ;