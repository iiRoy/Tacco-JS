/*
 * This JavaScript file contains the implementation for a puzzle-solving algorithm.
 * It simulates movement on a grid and checks if all target points are visited.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All variable names, function names, operators, and expressions remain identical.
 */


// Define directional offsets for North, South, East, West.
// dx represents changes in the x-coordinate.
var dx = { N: 0, S: 0, E: 1, W: -1 };

// dy represents changes in the y-coordinate.
var dy = { N: 1, S: -1, E: 0, W: 0 };



/**
 * Main function to process the input and solve the puzzle.
 * @param {string} input - The raw input string containing all test cases.
 */
function Main ( input ) {

    // Split the entire input string into an array of lines.
    input = input . split ( "\n" );

    // Initialize a counter 'k' to keep track of the current line being processed in the input array.
    var k = 0;

    // Start an infinite loop to process multiple test cases.
    // The loop will break when 'n' (number of target points) is 0.
    while ( 1 ) {

        // Parse the first integer from the current line, which represents 'n'.
        // 'k++' increments k after using its current value.
        var n = parseInt ( input [ k ++ ], 10 );


        // If 'n' is 0, it signifies the end of input, so break the loop.
        if ( n == 0 ) {
            break;
        }


        // Initialize a 2D array 'a' to represent the grid.
        // This array will store boolean values indicating if a cell is a target point.
        var a = [];

        // Loop to initialize rows of the 'a' array.
        for ( var i = 0 ; i <= 20 ; i ++ ) {

            a [ i ] = []; // Create a new array for each row.

            // Loop to initialize columns for the current row.
            // All cells are initially set to 'false' (not a target point).
            for ( var j = 0 ; j <= 20 ; j ++ ) {
                a [ i ] [ j ] = false;
            }
        }


        // Populate the 'a' array with target points based on the input.
        // 'n' lines follow, each specifying coordinates of a target point.
        for ( var i = 0 ; i < n ; i ++ ) {

            // Split the current input line by space to get x and y coordinates.
            input [ k ] = input [ k ] . split ( " " );

            // Parse coordinates and mark the corresponding cell in 'a' as 'true'.
            // 'k++' increments k after using its current value for input[k++][1].
            a [ parseInt ( input [ k ] [ 0 ], 10 ) ] [ parseInt ( input [ k ++ ] [ 1 ], 10 ) ] = true;
        }


        // Parse the next integer from the input, which represents 'm'.
        // 'm' is the number of movement operations.
        var m = parseInt ( input [ k ++ ], 10 );


        // Initialize arrays to store movement operations and their distances.
        var op = [], dis = [];


        // Read 'm' movement operations from the input.
        for ( var i = 0 ; i < m ; i ++ ) {

            // Split the current input line by space to get the operation (direction)
            // and the distance.
            input [ k ] = input [ k ] . split ( " " );

            // Store the operation (e.g., "N", "E").
            op [ i ] = input [ k ] [ 0 ];

            // Parse and store the distance for the current operation.
            // 'k++' increments k after using its current value for input[k++][1].
            dis [ i ] = parseInt ( input [ k ++ ] [ 1 ], 10 );
        }


        // Initialize a counter 'get' to track how many target points have been visited.
        var get = 0;


        // Set the initial position of the robot to (10, 10).
        var x = 10, y = 10;

        // Check if the initial position is a target point.
        if ( a [ x ] [ y ] ) {
            // If it is, mark it as visited and increment the 'get' counter.
            a [ x ] [ y ] = false;
            get ++;
        }


        // Process each movement operation.
        for ( var i = 0 ; i < m ; i ++ ) {

            // For each operation, move the specified distance.
            for ( var j = 0 ; j < dis [ i ] ; j ++ ) {

                // Update the x-coordinate based on the current operation's direction.
                x += dx [ op [ i ] ];

                // Update the y-coordinate based on the current operation's direction.
                y += dy [ op [ i ] ];

                // After each step, check if the new position is a target point.
                if ( a [ x ] [ y ] ) {
                    // If it is, mark it as visited and increment the 'get' counter.
                    a [ x ] [ y ] = false;
                    get ++;
                }
            }
        }


        // After all movements, compare the number of visited points with the total number of target points.
        if ( get == n ) {
            // If all target points were visited, print "Yes".
            console . log ( "Yes" );
        } else {
            // Otherwise, print "No".
            console . log ( "No" );
        }
    }
}


// Read input from standard input and pass it to the Main function.
// This is a common pattern in competitive programming for Node.js.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );