/*
 * This is a JavaScript program designed to process numerical input.
 * It reads data from standard input, performs calculations,
 * and prints results to the console.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function Main ( input )
{
    // Trim whitespace and split the input string into an array of lines.
    var chars = input . trim ( ) . split ( '\n' ) ;

    // Parse the first line to get N and K values.
    var NK = chars [ 0 ] . split ( ' ' ) ;
    var N = Math . floor ( NK [ 0 ] ) ; // N is the first number in the NK pair.
    var K = Math . floor ( NK [ 1 ] ) ; // K is the second number in the NK pair.

    // Parse the second line into an array of integers.
    var nums = chars [ 1 ] . split ( ' ' ) . map ( str => parseInt ( str , 10 ) ) ;
    var ans = 0 ; // Initialize the answer counter.

    // Outer loop: Iterate through each number in the 'nums' array.
    for ( var i = 0 ; i < nums . length ; i ++ )
    {
        // 'tmp' stores the current sum of a sub-array.
        var tmp = nums [ i ] ;

        // Log the current number being processed.
        console . log ( nums [ i ] ) ;

        // Check the condition for the single element sub-array.
        if ( nums [ i ] % K === 1 )
        {
            ans ++ ; // Increment answer if condition met.
        }

        // Inner loop: Iterate to form sub-arrays starting from 'i'.
        for ( var j = 1 ; j < nums . length - i ; j ++ )
        {
            // Add the next element to the current sum.
            tmp += nums [ i + j ] ;

            // Log the updated sum.
            console . log ( 'tmp = ' + tmp ) ;

            // Check the condition for the current sub-array sum.
            if ( tmp % K === j + 1 )
            {
                ans ++ ; // Increment answer if condition met.
            }

            // Log the current count of 'ans'.
            console . log ( ans ) ;
        }
    }

    // Finally, print the total calculated answer.
    console . log ( ans ) ;
}

// Call the Main function with input read from /dev/stdin.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;