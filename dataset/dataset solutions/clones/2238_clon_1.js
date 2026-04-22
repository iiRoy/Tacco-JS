// Enable strict mode for the entire script. This helps catch common coding errors and "unsafe" actions.
"use strict"


/**
 * Main function to solve the problem.
 * This function processes robot coordinates to find the maximum
 * number of non-overlapping robot ranges.
 * @param {string} s - The input string containing robot coordinates,
 *                     where the first line is N and subsequent lines are "x d".
 */
function Main ( s )
{
    // Step 1: Parse the input string.
    // Split the input string into an array of lines.
    s = s . split ( '\n' ) ;

    // The first line contains the number of robots (N).
    // Although 'n' is read, it's not explicitly used in the subsequent logic
    // as array length is used instead.
    let n = Number ( s [ 0 ] ) ;

    // Extract robot coordinate strings from the second line onwards.
    // This creates an array where each element is a string like "x d".
    const robos = s . slice ( 1 , s . length ) ;


    // Step 2: Calculate the effective range for each robot.
    // Each robot at position 'x' with range 'd' covers the interval [x-d, x+d].
    const l = robos . map ( robo => {
        // Split the robot string ("x d") into x and d, then convert them to numbers.
        let t = robo . split ( ' ' ) . map ( Number ) ;
        // Return the start (x-d) and end (x+d) points of the robot's range.
        return [ t [ 0 ] - t [ 1 ] , t [ 0 ] + t [ 1 ] ] ;
    } ) ;

    // Step 3: Sort the robot ranges.
    // Sort the robots based on their end points (x+d) in ascending order.
    // This greedy sorting strategy is crucial for finding the maximum non-overlapping intervals.
    l . sort ( ( a , b ) => a [ 1 ] > b [ 1 ] ) ;


    // Step 4: Find the maximum number of non-overlapping ranges.
    // Initialize 'range' with a very small number. This effectively represents the
    // end point of the last selected robot, starting before any possible robot.
    let range = [ -1e10 ] ;
    // Initialize a counter for the number of selected non-overlapping robots.
    let cnt = 0 ;

    // Iterate through the sorted list of robot ranges.
    for ( let i = 0 ; i < l . length ; ++i )
    {
        // Extract the min (x-d) and max (x+d) for the current robot.
        const min = l [ i ] [ 0 ] ;
        const max = l [ i ] [ 1 ] ;

        // Check if the current robot's start point ('min') is greater than or equal to
        // the end point of the last selected robot.
        // Math.max.apply(null, range) retrieves the largest end point among selected robots.
        // If the current robot starts after or at the same point where the last selected
        // robot finished, it can be selected without overlapping.
        if ( Math . max . apply ( null , range ) <= min )
        {
            // Add the current robot's end point to our 'range' tracker.
            // This 'max' becomes the new latest end point for subsequent comparisons.
            range . push ( max ) ;
            // Increment the count of selected non-overlapping robots.
            cnt ++ ;
        }
    }


    // Step 5: Output the result.
    // Print the final count of non-overlapping robots to the console.
    console . log ( cnt ) ;
}

// Read input from standard input (stdin) using Node.js 'fs' module.
// The input is read synchronously and decoded as UTF-8.
// Then, pass the input string to the Main function to start processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;