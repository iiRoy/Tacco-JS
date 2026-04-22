// This function generates a comparison function for sorting lists.
// It supports numeric, text, and case-insensitive text comparisons.
function listsGetSortCompare(   type,
                                direction   )
{
    // Define a collection of comparison functions based on the specified type.
    var compareFuncs =
    {
        "NUMERIC"       :
            function    ( a,    b   )
            {
                // Numeric comparison: subtract one parsed float from the other.
                return  parseFloat(a)   -   parseFloat(b)   ;
            }
        ,
        "TEXT"          :
            function    (   a,  b   )
            {
                // Text comparison: converts to string and compares lexicographically.
                // Returns 1 if a > b, -1 otherwise.
                return  a.toString()    >   b.toString()    ?   1   :   -1  ;
            }
        ,
        "IGNORE_CASE"   :
            function    (   a,  b   )
            {
                // Case-insensitive text comparison.
                // Converts to lowercase strings before comparing.
                return  a.toString().toLowerCase()  >   b.toString().toLowerCase()  ?   1   :   -1  ;
            }
    }   ;

    // Select the appropriate comparison function based on the 'type' parameter.
    var compare =   compareFuncs[type]  ;

    // Return a new function that applies the selected comparison
    // and then multiplies the result by the 'direction' (e.g., for ascending/descending).
    return  function    (   a,  b   )
            {
                return  compare(a,  b)    *   direction   ;
            }
    ;
}


// The main function processes input, sorts it, and calculates a result.
function    main    (   input   )
{
    // Split the input string into an array of arguments using space as a delimiter.
    var args    =   input.split(' ')    ;

    // Create a sorted copy of the arguments.
    // The sorting is numeric and in descending order (direction -1).
    sorted  =   args.slice().sort(  listsGetSortCompare("NUMERIC",  -1) )   ;

    // Initialize the result accumulator.
    result  =   0   ;

    // Determine the end index for the loop.
    var i_end   =   sorted.length   -   1   ;

    // Initialize the increment step for the loop.
    var i_inc   =   1   ;

    // Adjust the increment step if the loop range is effectively empty or reversed.
    if  (   1   >   i_end   )
    {
        i_inc   =   -i_inc  ;   // Reverse the increment direction.
    }

    // Loop through the sorted array, calculating the sum of absolute differences
    // between adjacent elements (excluding the first and last elements themselves,
    // as the loop starts from i=1 and accesses (i-1) and (i+1-1) which is i).
    // The loop condition handles both increasing and decreasing increments.
    for (   i   =   1   ;
            i_inc   >=  0   ?   i   <=  i_end   :   i   >=  i_end   ;
            i   +=  i_inc   )
    {
        // Get the current element (effectively the previous one in the original sequence logic).
        cur     =   sorted[(    i   -   1   )]  ;

        // Get the next element (effectively the current one in the original sequence logic).
        next    =   sorted[((   i   +   1   )   -   1   )]  ;

        // Add the absolute difference between 'cur' and 'next' to the result.
        result  =   result  +   Math.abs(   cur -   next    )   ;
    }

    // Output the final calculated result to the console.
    console.log(    result  )   ;
}

// Read input from stdin, decode it as UTF-8, and pass it to the main function.
main(   require('fs').readFileSync('/dev/stdin',   'utf8') )   ;