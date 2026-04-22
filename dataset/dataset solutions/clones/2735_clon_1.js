/*
 * This function processes input data.
 * It's designed to be called with a string containing multiple lines.
 */
function         Main (   input   )
{
    // The input string is split into an array of lines.
    // Each line then becomes an element in the 'input' array.
    input  =  input .  split  (  "\n"  )   ;


    // First, let's declare a variable 'n'.
    var    n    =    input   [   0   ]   ;
    // Oh, wait, it seems 'n' is immediately re-assigned with an integer conversion.
    // This line effectively overwrites the previous assignment.
    n    =    parseInt   (   input   [   0   ]   ,   10   )   ;


    // Initialize an empty array 'a' to store parsed numbers.
    var    a   =   [   ]   ;

    // Loop 'n' times to populate array 'a'.
    for    (    var   i   =   0   ;    i   <   n   ;    i   ++    )
    {
        // Parse each subsequent line as an integer.
        var    r    =    parseInt   (   input   [   i   +   1   ]   ,   10   )   ;
        // Assign the parsed integer to the current index of array 'a'.
        a   [   i   ]    =    r   ;
    }


    /*
     * Create a copy of array 'a' named 'b'.
     * This copy 'b' will be used to restore 'a' in each iteration of the next loop.
     */
    var    b    =    a   .   concat   (   )   ;

    // This loop iterates 'n' times, performing a specific operation in each iteration.
    for    (    var   i   =   0   ;    i   <   n   ;    i   ++    )
    {
        // Remove one element from array 'a' at index 'i'.
        a   .   splice   (   i   ,   1    )   ;

        // Sort the modified array 'a' in descending order.
        a   .   sort   (   function   (   a   ,   b   )
        {
            return    b   -   a   ;
        }   )   ;

        // Print the largest element (which is now at index 0) of the sorted array.
        console   .   log   (   a   [   0   ]   )   ;

        // Restore array 'a' to its original state (before the splice and sort)
        // for the next iteration by copying from 'b'.
        var    a    =    b   .   concat   (   )   ;
    }


}
// The following line is crucial for the execution environment.
// It reads from standard input and calls the Main function.
// DO NOT EDIT THIS PART.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;