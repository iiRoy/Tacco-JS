// This script processes a series of test cases read from standard input.
// It calculates a specific value for each test case based on an array of numbers.

var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ; // Read the entire input from stdin as a UTF-8 string.

var arr = input . trim ( ) . split ( "\n" ) ; // Trim whitespace and split the input string into an array of lines.

var t = arr . shift ( ) - 0 ; // Extract the first line, convert it to a number, and store it as the number of test cases.

// Loop through each test case. The 't--' decrements 't' and evaluates to its original value,
// so the loop continues as long as 't' is greater than 0.
while ( t -- )
{
    // For each test case, the first line contains two numbers 'n' and 'k'.
    // We parse them from the array 'arr'.
    var [ n , k ] = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // The next line contains an array of numbers 'x'.
    var x = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Calculate the initial total difference: the last element minus the first element of array 'x'.
    var d = x [ x . length - 1 ] - x [ 0 ] ;

    // Initialize an empty array 'a' to store the differences between consecutive elements of 'x'.
    var a = [ ] ;

    // Populate array 'a' with these differences.
    for ( var i = 0 ; i < x . length - 1 ; i ++ )
        a . push ( x [ i + 1 ] - x [ i ] ) ; // The difference is (current element + 1) - (current element).

    // Sort the differences in array 'a' in descending order.
    // This is to find the largest gaps between consecutive numbers.
    a . sort ( ( a , b ) => b - a ) ;

    // Initialize a variable 'sum' to accumulate the largest 'k-1' differences.
    var sum = 0 ;

    // Iterate up to 'k-1' times to sum the largest differences.
    for ( var i = 0 ; i < k - 1 ; i ++ )
    {
        // If 'i' exceeds the available number of differences in 'a', break the loop.
        if ( i > a . length - 1 )
            break ;

        // Add the current largest difference to 'sum'.
        sum += a [ i ] ;
    }

    // Finally, print the result for the current test case:
    // The total difference 'd' minus the sum of the 'k-1' largest gaps.
    console . log ( d - sum ) ;
}