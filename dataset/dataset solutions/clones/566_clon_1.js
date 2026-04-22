/* This JavaScript file processes input from stdin to calculate a specific sum.
 * It's designed to read numbers, perform calculations based on these numbers,
 * and then output the sum of various components.
 */

// Import the 'fs' (file system) module to read input.
var input =   require ('fs') . readFileSync ('/dev/stdin',  'utf8') ;

// Process the input string: trim whitespace, split by newlines, and convert each part to a Number.
var Arr =  (input . trim()) . split ("\n") . map (Number) ;


// Loop through each number in the 'Arr' array.
for  ( var  i = 0 ;  i < Arr . length ;  i ++ )
{
    // Declare and initialize a variable 'v' with the current array element.
    var  v = Arr [i] ;

    // Check if 'v' is zero. If so, terminate the loop.
    if  ( v == 0 )
        break ; // Exit the loop as per problem statement.


    // Calculate the difference from 1000.
    v = 1000 - v ;


    // Check if 'v' is greater than or equal to 500.
    if  ( v >= 500 )
    {
        a = 1 ; // Assign 1 to 'a'. (Note: 'a' is implicitly global here if not declared elsewhere)
        v = v - 500 ; // Subtract 500 from 'v'.
    }

    // Calculate 'b' by dividing 'v' by 100 and taking the floor.
    b = Math . floor ( v / 100 ) ; // (Note: 'b' is implicitly global here)

    // Update 'v' to be the remainder when divided by 100.
    v = v % 100 ;


    // Check if 'v' is greater than or equal to 50.
    if  ( v >= 50 )
    {
        c = 1 ; // Assign 1 to 'c'. (Note: 'c' is implicitly global here)
        v = v - 50 ; // Subtract 50 from 'v'.
    }

    // Calculate 'd' by dividing 'v' by 10 and taking the floor.
    d = Math . floor ( v / 10 ) ; // (Note: 'd' is implicitly global here)

    // Update 'v' to be the remainder when divided by 10.
    v = v % 10 ;


    // Check if 'v' is greater than or equal to 5.
    if  ( v >= 5 )
    {
        e = 1 ; // Assign 1 to 'e'. (Note: 'e' is implicitly global here)
        v = v - 5 ; // Subtract 5 from 'v'.
    }

    // Print the sum of 'a', 'b', 'c', 'd', 'e', and the final 'v'.
    console . log ( a + b + c + d + e + v ) ;

} /* End of the main processing loop. */