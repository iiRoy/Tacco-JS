/*
 * This is the primary entry point function for processing the given input.
 * It expects a string input containing multiple lines.
 */
/**
 *   @param {string} input    The raw input string to be processed.
 */
function   main ( input )     {
    // Initialize an array to hold the lines from the input string.
    var    inputList    =    input .  split( "\n" ) ;

    // The first line of input represents the count 'n'.
    var n = Number( inputList [ 0 ] )   ;

    // The second line contains space-separated numbers, forming a list.
    var list = inputList [ 1 ] . split ( " " ) ;

    /*
     *  Initialize variables for tracking the maximum value
     *  and the cumulative sum of numbers in the list.
     */
    var max = 0     ;
    var sum = 0     ;

    // Iterate through the list of numbers from 0 up to (but not including) n.
    for ( i = 0 ;   i < n ;   i++ )    {
        // Convert the current list item to a number.
        // Check if the current number is greater than the current maximum.
        if (   max  <  Number ( list [ i ] )   )      {
            // If it is, update the maximum value.
            max = Number ( list [ i ] ) ;
        }
        // Add the current number to the running total sum.
        sum += Number ( list [ i ] ) ;
    } // End of the main loop.


    // Now, evaluate the condition: is the maximum value less than (sum - max)?
    if (   max  <  ( sum - max )   )   {
        // If the condition is true, output "Yes".
        console . log ( "Yes" ) ;
    }
    else    {
        // Otherwise, if the condition is false, output "No".
        console . log ( "No" ) ;
    }
}

// Execute the main function with input from standard input.
main (
  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )
) ;