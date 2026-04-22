/*
 * This JavaScript file contains logic for a pathfinding problem.
 * It uses a Breadth-First Search (BFS) approach to find a path
 * through a 2D grid, avoiding certain obstacles or following specific rules.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

function bomb ( ) {
    // Stores visited states to prevent redundant processing.
    var  obj  =  {};

    // The answer, initialized to "NA" (Not Available).
    var  ans  =  "NA";

    // The queue for BFS, storing [x, y, count] for each state.
    // Initial states are [0,0,0] and [1,0,0].
    var  leaf  =  [  [ 0, 0, 0 ],  [ 1, 0, 0 ]  ];

    /*
     * Main BFS loop. Continues until the 'leaf' queue is empty
     * or a solution is found and 'break' is called.
     */
    while  ( true )  {

        // If the queue is empty, no path was found.
        if  (  leaf.length  ==  0  )  break;

        // Dequeue the next state to process.
        var  ary  =  leaf.shift ( );

        // Extract coordinates and count from the current state.
        var  x  =  ary[  0  ];
        var  y  =  ary[  1  ];

        // The count represents the number of steps taken to reach this state.
        var  cnt  =  ary[  2  ];

        // Check if this state has already been visited.
        // If so, skip to the next iteration to avoid cycles and redundant work.
        if  (  obj.hasOwnProperty (  x  +  ","  +  y  )  )  continue;
        // Mark the current state as visited.
        else  obj[  x  +  ","  +  y  ]  =  true;


        // Check for the first goal condition:
        // If we've reached the rightmost column (n-1) AND the cell value is not 2.
        if  (  y  ==  n  -  1  &&  xy[  x  ][  y  ]  !=  2  )  {
            ans  =  cnt; // Update answer with the current step count.
            break;       // Path found, exit the BFS loop.
        }

        // Get the value of the current cell in the grid.
        var  v  =  xy[  x  ][  y  ];

        /*
         * Handle movement based on the cell's value.
         * Value 1 means move right, Value 2 means move left.
         */
        if  (  v  ==  1  )  {
            // Flag to indicate if the rightmost boundary is reached during this movement.
            var  flag  =  false;

            // Keep moving right as long as the cell value is 1.
            while  (  true  )  {
                y++; // Move one step to the right.

                // Check if we've reached or passed the rightmost boundary.
                if  (  y  >=  n  -  1  )  {
                    flag  =  true; // Boundary reached.
                    break;        // Stop moving right.
                }

                // If the next cell is not '1', then the '1' path ends.
                if  (  xy[  x  ][  y  ]  !=  1  )  {
                    y--; // Revert to the last valid '1' cell.
                    break;
                }
            }

            // If the rightmost boundary was reached during this '1' path.
            if  (  flag  )  {
                ans  =  cnt; // Update answer.
                break;       // Path found, exit BFS.
            }
        }  else  if  (  v  ==  2  )  {
            // Keep moving left as long as the cell value is 2.
            while  (  true  )  {
                y--; // Move one step to the left.

                // If the next cell is not '2', then the '2' path ends.
                if  (  xy[  x  ][  y  ]  !=  2  )  break;
            }
        }

        // After processing the current cell's movement, add possible next states to the queue.
        // These are transitions to the other row (1-x) and adjacent columns (y+i for i=0,1,2).
        // Each transition increments the step count.
        for  (  var  i  =  0;  i  <=  2;  i++  )  {
            leaf.push  (  [  1  -  x,  y  +  i,  cnt  +  1  ]  )  ;
        }
    }

    // Return the final answer.
    return  ans;
}


// --- Main Program Execution ---

// Read the entire input from standard input as a string.
var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin',  'utf8' ) ;

// Trim whitespace and split the input into an array of lines.
var  arr  =  input . trim ( ) . split ( "\n" ) ;

/*
 * Process input lines one by one in a loop.
 * Each iteration handles a new test case.
 */
while  (  true  )  {
    // The first number in each test case is 'n', converted to a number.
    var  n  =  arr . shift ( )  -  0;

    // A value of 0 for 'n' signifies the end of input.
    if  (  n  ==  0  )  break;

    // Initialize the 2D grid 'xy'.
    var  xy  =  [];

    // Read the first row of the grid.
    // Split by spaces, convert elements to numbers.
    xy[  0  ]  =  arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Read the second row of the grid.
    // Split by spaces, convert elements to numbers.
    xy[  1  ]  =  arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Call the 'bomb' function to solve the current test case
    // and print the result to standard output.
    console . log (  bomb ( )  ) ;
}