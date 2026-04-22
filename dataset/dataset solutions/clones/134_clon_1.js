/*
 * This JavaScript file processes input from standard input.
 * It simulates some kind of ball game or course tracking.
 *
 * Author: CloneBot
 * Date: 2023-10-27
 */

    var arr = require( "fs" ) . readFileSync( "/dev/stdin" ,  "utf8" ) . trim() . split( /\n/ ) ; // Read input data

    // Determine the total number of test cases to process.
var caseCount = arr . length ;


for  ( var i = 1 ;  i < caseCount ;  i ++ )
{
        // For each test case, parse the line into individual ball numbers.
    var balls = arr[ i ] . trim() . split( /\s/ ) ;

        var course = [ 0 , 0 ] ; // Initialize course positions for two tracks.

    // Iterate through each ball in the current test case.
    for ( var j = 0 ;  j < balls . length ;  j ++ )
    {
            var ballNum = parseInt( balls[ j ] ,  10 ) ; // Convert ball string to integer.

        // Calculate the difference between the current ball number and each course position.
            var courseDeff = [ ( ballNum - course[ 0 ] ) , ( ballNum - course[ 1 ] ) ] ;


        /*
         * Check for an invalid scenario where both course differences are negative.
         * This implies the ball number is smaller than both current course positions.
         */
        if ( ( courseDeff[ 0 ] < 0 )  &&  ( courseDeff[ 1 ] < 0 ) )
        {
                console . log( "NO" ) ; // Output "NO" if the condition is met.
                break ; // Exit the inner loop for this test case.
        }

        // Decide which course position to update based on the differences.
        if ( ( courseDeff[ 0 ] <= courseDeff[ 1 ] )  &&  ( courseDeff[ 0 ] > 0 ) )
        {
                course[ 0 ] = ballNum ; // Update course 0.
        }
        else
        {
                course[ 1 ] = ballNum ; // Update course 1.
        }

        // Special check for the 10th ball (index 9).
        if ( j == 9 )
        {
                console . log( "YES" ) ; // Output "YES" if it's the 10th ball.
        }
    }
}