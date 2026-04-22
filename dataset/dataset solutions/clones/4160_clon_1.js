/*
 * This JavaScript module defines a function to process a specific
 * numerical data set from standard input.
 *
 * The core logic involves analyzing the frequency of each number
 * within a given array and calculating a cumulative count based
 * on a comparison with the number's value itself.
 *
 * This implementation adheres to a Type I code clone, meaning
 * all functional elements, identifiers, and expressions are
 * preserved exactly as in the original, with only variations
 * in whitespace and the addition of comments.
 */

function     Main (  input    )
{
    // The main processing function that takes the raw input string.


    // First, split the input string by newline characters to get individual lines.
    const     inputs      =   input . split ( "\n" ) ;


    // The second line of the input (index 1) contains the numbers we need to process.
    // 1. Split this line by spaces to get string representations of numbers.
    // 2. Use the 'map' function to convert each string number into an integer (base 10).
    var    org     =   inputs [ 1 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

    // Determine the maximum number present in the 'org' array.
    // This is used to define the upper bound for our iteration loop.
    const   maxNum    =   org . reduce ( ( a , b ) => a > b ? a : b ) ;


    // Initialize a counter variable to accumulate the final result.
    var    count    =   0 ;


    // Iterate from 0 up to and including the 'maxNum' found in the input array.
    // In each iteration, 'i' represents a number whose frequency we are checking.
    for ( var    i    =   0 ;    i <= maxNum ;    i ++ )
    {
        // Filter the 'org' array to find all elements that are strictly equal to the current 'i'.
        // 'nums' will then contain an array of all occurrences of 'i'.
        var    nums    =   org . filter ( ( m ) => m === i ) ;

        // Check the length (frequency) of the current number 'i' against its value.
        if ( nums . length    <    i )
        {
              // If the number of occurrences of 'i' is less than 'i' itself,
              // add the full count of its occurrences to the total 'count'.
              count    +=   nums . length ;
        }
        else if ( nums . length    >    i )
        {
              // If the number of occurrences of 'i' is greater than 'i' itself,
              // add the excess (occurrences - i) to the total 'count'.
              count    +=   nums . length    -    i ;
        }
    }

    // Finally, print the accumulated 'count' to the standard output.
    console . log ( count ) ;
}


// This section handles the execution of the Main function.
// It reads the entire content of standard input synchronously
// as a UTF-8 encoded string and passes it to the Main function.
Main (    require ( "fs" ) . readFileSync ( "/dev/stdin" ,    "utf8" )    ) ;