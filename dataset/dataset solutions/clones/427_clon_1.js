/*
 * This JavaScript file processes input from standard in.
 * It reads lines, performs calculations, and outputs results.
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

$( function ( )
{ // Start of jQuery document ready function

    // Declare a variable to store the input data.
    var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


    // Trim whitespace from the input and split it into an array of lines.
    var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


    // Initialize an empty array to store sums.
    var abc = [ ] ;


    // Loop through each line of the input array.
    for ( var i = 0 ; i < Arr . length ; i ++ )
    {

        // Check for the termination condition: if abc is empty and the current line is "0 0".
        if ( abc . length == 0 && Arr [ i ] == "0 0" )
            break ; // Exit the loop if the termination condition is met.


        // Split the current line by space and convert parts to numbers.
        var arr = Arr [ i ] . split ( " " ) . map ( Number ) ;


        // Calculate the sum of the first two numbers on the line and push to 'abc'.
        abc . push ( arr [ 0 ] + arr [ 1 ] ) ; // Store the sum


        // If the 'abc' array contains 5 elements, process them.
        if ( abc . length == 5 )
        {

           // Find the maximum value in the 'abc' array.
           var max = abc . reduce ( function ( a , b )
                                         {
                                             return Math . max ( a , b ) ;
                                         } ) ;

           // Define a string of characters A-E and split it into an array.
           var ABC = "ABCDE" . split ( "" ) ;

           // Get the character corresponding to the index of the maximum value.
           var str = ABC [ abc . indexOf ( max ) ] ;

           // Output the character and the maximum value to the console.
           console . log ( str + " " + max ) ;

           // Clear the 'abc' array for the next set of 5 inputs.
           abc = [ ] ;
        } // End of inner 'if' block
    } // End of 'for' loop
} ) ; // End of jQuery document ready function call