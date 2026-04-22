'use strict' ; /* This script processes a list of strings
                                 to count the number of distinct
                                 consecutive elements. */

function  main  ( input )
{
    // The input string is split by newline characters.
    // The first line provides 'N', the second line provides the 'string' array.
    const args   =  input . split ( '\n' ) ,
          N      =  args [ 0 ] , /* N represents the total number of elements
                                    to be processed from the 'string' array. */
          string =  args [ 1 ] . split ( ' ' ) ; // This is the array of strings to analyze.

    let counter = 0  ; // This variable will store the final count of unique consecutive elements.
    let check   = '' ; // This variable holds the value of the last encountered unique element.

    // Iterate through the 'string' array from index 0 up to (but not including) N.
    for
    (
        let i  =  0 ;
        i  <  N ;
        ++i
    )
    {
        // Compare the current element with the 'check' variable.
        if
        (
            check  !==  string [ i ]
        )
        {
            // If they are different, it means we've encountered a new
            // unique consecutive element.
            ++counter ; // Increment the counter.
            check  =  string [ i ] ; // Update 'check' to the current element.
        }
    }

    // Print the final calculated count to the console.
    console . log ( counter ) ;
}


// This is the entry point of the program.
// It reads the input from '/dev/stdin' using Node.js 'fs' module
// and passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;
// End of file.