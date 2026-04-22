var main =  function ( input )
{
    // This function processes the given input string.

    input = input . split ( '\n' ) ; // Split the input string by newline characters.

    var N = input . shift ( ) ; // Extract the first line as N.

    var S = input . join ( ) ; // Join the remaining lines to form string S.

    var w ; // Variable to hold the 'west' substring.

    var w_sub ; // Substring of 'w' after processing.

    var e ; // Variable to hold the 'east' substring.

    var e_sub ; // Substring of 'e' after processing.

    var count ; // Temporary variable to store current count.

    var count_min = 3 * 100000 ; // Initialize minimum count to a large value.

    // Loop through possible split points from 1 to N-1.
    for ( var i = 1 ; i < N ; i ++ ) {

        w = S . slice ( 0 , i ) ; // Get the 'west' part of the string S.

        e = S . slice ( i + 1 , N ) ; // Get the 'east' part of the string S.

        // Calculate 'w_sub' by removing 'W' characters from 'e'.
        w_sub = e . split ( 'W' ) . join ( '' ) ;

        // Calculate 'e_sub' by removing 'E' characters from 'w'.
        e_sub = w . split ( 'E' ) . join ( '' ) ;

        // Determine the number of 'W's in 'e' and 'E's in 'w'.
        count = ( w . length - w_sub . length ) + ( e . length - e_sub . length ) ;

        // Check for an optimal condition where count is zero.
        if ( count === 0 || count === -0 )
        {
            count_min = 0 ; // Set minimum count to 0 if found.
            break ; // Exit the loop early as optimal solution is found.
        }
        else if ( count < count_min ) // If current count is less than the minimum found so far.
        {
            count_min = count ; // Update the minimum count.
        }

    } // End of for loop.

    console . log ( count_min ) ; // Print the final minimum count to the console.

    return 0 ; // Return 0 to indicate successful execution.

} ; // End of main function definition.


main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ; // Call the main function with input from stdin.