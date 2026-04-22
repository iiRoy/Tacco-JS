/*
 * This is the main function responsible for processing the input.
 * It calculates a specific value based on a sorted array derived from the input.
 */
function   main   (   input   )
{
    // First, remove any leading or trailing whitespace from the input string.
    input  =  input . trim (  ) ;

    // Define a constant 'n' by parsing the first number from the first line of the input.
    // The input is split by space, and the first part is converted to an integer.
    const   n   =   parseInt (   input . split (   " "   ) [   0   ] ,   10   ) ;


    // Declare a variable 'arrD' to store an array of integers.
    // It's derived from the second line of the input, split by newline, then by space,
    // and each resulting string is mapped to an integer.
    var   arrD   =   input . split (   '\n'   ) [   1   ] . split (   ' '   ) . map (   (   n   )   =>   parseInt (   n ,   10   )   ) ;


    // Sort the 'arrD' array in ascending numerical order.
    // A custom comparison function is provided to ensure correct numerical sorting.
    arrD . sort (   function (   a ,   b   )
    {
        // If 'a' is less than 'b', 'a' comes before 'b'.
        if   (   a   <   b   )
        {
            return   -1   ;
        }

        // If 'a' is greater than 'b', 'a' comes after 'b'.
        if   (   a   >   b   )
        {
            return   1   ;
        }

        // If 'a' and 'b' are equal, their order doesn't matter.
        return   0   ;
    }   ) ;


    // Calculate and log the difference between two elements in the sorted array.
    // The elements are at indices (n/2)+1 and (n/2).
    // Note: Integer division (n/2) is assumed for array indexing.
    console . log (   arrD [   (   n   /   2   )   +   1   ]   -   arrD [   (   n   /   2   )   ]   ) ;
}


// This section handles the execution of the main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module,
// and passes it to the 'main' function.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ) ;