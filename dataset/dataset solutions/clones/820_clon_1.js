// Main program entry point.
// This script processes a series of input cases.

l =   ~~   readline ( ) ; /* Initialize the counter for the number of test cases.
                             The double tilde operator (~~) is used here for
                             a quick floor-like conversion to integer. */


// Define a helper function 'i'.
// This function calculates 10 raised to the power of its input argument 'd'.
// The input 'd' is first converted to an integer using the bitwise NOT operator (~~).
i = d =>
    Math . pow ( 10 , ~~d ) ;


// Begin the primary loop to iterate through each test case.
for ( c = 0 ; c < l ; ++c )
{
    // Initialize an empty array 'r' to store the results for the current test case.
    r = [ ] ;
    // Read a line of input, split it by spaces, and store the parts in array 'o'.
    o = readline ( ) . split ( ' ' ) ;

    // Nested loops to iterate through possible values of 'a' and 'b'.
    // The range for 'a' is determined by the first element of 'o' (o[0]).
    for ( a = i ( o [ 0 ] - 1 ) ; a + 1 < i ( o [ 0 ] ) ; ++a )
    {
        // The range for 'b' is determined by the second element of 'o' (o[1]).
        for ( b = i ( o [ 1 ] - 1 ) ; b + 1 < i ( o [ 1 ] ) ; ++b )
        {
            // Core logic: Check if the arithmetic series sum equals string concatenation.
            // The left side calculates the sum of an arithmetic series from 'a' to 'b'.
            // The right side concatenates 'a' and 'b' as strings.
            ( ( a + b ) * ( b - a + 1 ) / 2 ) == ( ( '' + a + b ) )
            &&
            // If the condition is true, push the concatenated string 'a b' into the results array 'r'.
            r . push ( a + ' ' + b ) ;
        }
    }

    // After processing all combinations for 'a' and 'b':
    // Check if the results array 'r' contains any elements.
    r . length
        ?
            // If 'r' is not empty, iterate through its elements and print each one.
            r . map ( s => print ( s ) )
        :
            // If 'r' is empty (no matching pairs found), print "No cats.".
            print ( 'No cats.' ) ;
}