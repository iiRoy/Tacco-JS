/* This script processes a series of grid inputs to find the largest rectangular area
 * composed entirely of '.' characters. The input format consists of H W for grid
 * dimensions, followed by H lines representing the grid. A '0 0' input terminates
 * the program.
 */
// Load the file system module for reading input.
var input = require('fs').readFileSync('/dev/stdin' , 'utf8' );

// Process the raw input: trim whitespace and split into an array of lines.
var   arr   =   input.trim().split("\n");


// Main processing loop: continues until a "0 0" sentinel is encountered.
while ( true )
{
    // Extract grid dimensions (H and W) from the first line of the current input block.
    // The line is split by space and each part is converted to a Number.
    var   hw   =   arr.shift().split(" ").map(Number);

    // Check for the termination condition.
    if ( hw.join(" ") == "0 0" )
        {
        break; // Exit the loop if H and W are both zero.
        }

    // Assign H and W to individual variables for clarity.
    var h = hw[0];
    var w = hw[1];


    // Initialize a 2D array (yx) to store the heights of consecutive '.' characters.
    // yx[y][x] will store the height of '.' characters ending at (y,x).
    var yx = [];

    // Loop through each row of the grid.
    for ( var y = 0 ; y < h ; y++ )
    {
        // Get the current row as a string and split it into individual characters.
        var ary = arr.shift().split("");

        // Initialize the current row in the yx array.
        yx[y] = [];

        // Iterate over each character in the current row.
        ary.forEach( function ( v , x ) {
            // If it's the first row (y=0):
            if ( y == 0 && v == "." )
            {
                yx[y][x] = 1; // Height is 1 if it's a '.'
            }
            else if ( y == 0 && v != "." )
            {
                yx[y][x] = 0; // Height is 0 if it's not a '.'
            }
            // If it's not the first row (y > 0):
            else if ( y != 0 && v == "." )
            {
                yx[y][x] = yx[y-1][x] + 1; // Height is one more than the cell above if it's a '.'
            }
            else if ( y != 0 && v != "." )
            {
                yx[y][x] = 0; // Height is 0 if it's not a '.'
            }
        } ); // End of forEach for row characters.
    } // End of loop for rows (y).


    // Variable to store the maximum rectangle area found so far.
    var max = 0;

    // Loop through each row (k) of the processed yx array.
    // Each row of yx is treated as a histogram to find the largest rectangle.
    for ( var k = 0 ; k < h ; k++ )
    {
        // 's' is a stack used to find the largest rectangle in a histogram.
        // It stores pairs [height, index].
        var s = [];

        // Add a sentinel value to the end of the current histogram row.
        // This ensures all elements in the stack are processed.
        yx[k][w] = 0;

        // Iterate through each bar (x) in the current histogram row (k).
        for ( var x = 0 ; x <= w ; x++ )
        {
            var v = yx[k][x]; // 'v' is the current bar's height.

            // If the stack is empty, push the current bar onto it.
            if ( s.length == 0 )
            {
                s.push( [ v , x ] );
                continue; // Move to the next bar.
            }

            // If the current bar is taller than the top of the stack, push it.
            if ( s[s.length - 1][0] < v )
            {
                s.push( [ v , x ] );
            }
            // If the current bar has the same height as the top of the stack, skip it.
            // (It won't form a new larger rectangle starting at this point).
            else if ( s[s.length - 1][0] == v )
            {
                continue;
            }
            // If the current bar is shorter than the top of the stack,
            // process bars in the stack that are taller or equal.
            else if ( s[s.length - 1][0] > v )
            {
                var last; // Stores the index of the last popped bar.

                // Process elements from the stack until a shorter or equal bar is found,
                // or the stack becomes empty.
                while ( true )
                {
                    // If the stack becomes empty, push the current bar with the 'last' index.
                    if ( s.length == 0 )
                    {
                        s.push( [ v , last ] );
                        break;
                    }

                    var r = s.pop(); // Pop the top element from the stack.

                    // If the current bar is taller than the popped bar,
                    // push the current bar and the last processed index onto the stack.
                    if ( v > r[0] )
                    {
                        s.push( [ v , last ] );
                        break;
                    }

                    last = r[1]; // Update 'last' with the index of the popped bar.

                    // If the current bar has the same height as the popped bar, break.
                    if ( v == r[0] )
                    {
                        break;
                    }
                    // If the current bar is shorter or equal to the popped bar,
                    // calculate the area of the rectangle formed by the popped bar.
                    else if ( v <= r[0] )
                    {
                        max = Math.max( max , r[0] * ( x - r[1] ) ); // Update max area.
                    }
                } // End of inner while loop.
            } // End of else if (s[s.length-1][0] > v).
        } // End of loop for bars (x).
    } // End of loop for rows (k).

    // Output the maximum area found for the current grid.
    console.log(max);

} // End of main while loop.