"use strict"


// This script processes numerical input to calculate a specific value based on specific rules.

function main ( input ) // Define the main function that takes input as a string.
{
    // The main function where the core logic resides for processing the problem.
    // First, process the raw input string by splitting it into lines, then each line into space-separated numbers.
    // The `~~v` operator is used for a quick integer conversion (double bitwise NOT).
    input = input . split ( /\n/ ) . map ( v => v . split ( " " ) . map ( v => ~~v ) ) ;

    // Extract problem parameters from the processed input array.
    // N represents the total number of balls.
    const   N           =   input [ 0 ] [ 0 ] ;
    // K represents the target position or a reference point.
    const   K           =   input [ 1 ] [ 0 ] ;
    // balls is an array containing the initial positions of all the balls.
    const   balls       =   input [ 2 ] ;

    // Initialize the accumulator variable for the final answer.
    // 'ans' will store the sum of minimum distances.
    let     ans         =   0 ;


    // Iterate through each ball to calculate its contribution to the total distance.
    // The loop runs from the first ball (index 0) up to (but not including) N.
    for ( let i = 0 ; i < N ; i ++ )
    {
        // For each ball, determine the shortest distance to K.
        // The problem implies moving from the ball's position to 0, then from 0 to K,
        // or directly from the ball's position to K.
        // This is effectively `min(distance to 0 + distance 0 to K, distance ball to K)`.
        // Simplified, it's `min(current_ball_pos, abs(current_ball_pos - K))`.
        ans += balls [ i ] < Math . abs ( balls [ i ] - K ) ? balls [ i ] : Math . abs ( balls [ i ] - K ) ;
    }

    // After summing up the minimum distances for each ball,
    // the total accumulated distance needs to be multiplied by two.
    // This typically represents a round trip or a specific scaling factor in the problem.
    ans *= 2 ;


    // Output the final calculated answer to the console.
    // This is the required result of the problem.
    console . log ( ans ) ;

} // End of the main function definition.


// This section handles the execution of the main function.
// It reads input from standard input (/dev/stdin) as a UTF-8 string,
// and then passes it to the `main` function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// Script execution concludes here after the main function has completed.