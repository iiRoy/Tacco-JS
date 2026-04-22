/*
 * This is the main bomb function.
 * It calculates the shortest path or some value based on input arrays.
 * The function uses a breadth-first search (BFS) like approach.
 */
function     bomb  (   ) {
    // Initialize an empty object to keep track of visited states.
    // States are stored as "x,y" strings to ensure unique key representation.
    var    obj    =    {  }   ;

    // Initialize the answer variable. "NA" implies not found yet,
    // or that a path fulfilling the criteria has not been discovered.
    var    ans    =    "NA" ;

    // Initialize the leaf array with starting points for the BFS.
    // Each element in 'leaf' is an array: [x_coordinate, y_coordinate, step_count].
    // These represent the initial positions and the steps taken to reach them.
    var    leaf    =    [ [ 0, 0, 0 ], [ 1, 0, 0 ] ] ;

    // Main loop: continues until a break condition is met,
    // typically when the goal is reached or no more paths to explore.
    while    (    true    )
    {
        // Check if there are any remaining nodes (leaves) to process in the queue.
        if    (    leaf.length    ==    0    )
            break  ; // If no leaves, exit the search as all paths have been explored.

        // Get the next state (array representing a node) from the front of the leaf queue.
        // .shift() removes the first element and returns it.
        var    ary    =    leaf.shift  (   )   ;

        // Extract x and y coordinates from the current state array.
        var    x    =    ary[ 0 ] ;
        var    y    =    ary[ 1 ] ;

        /*
         * Check if this particular (x, y) coordinate pair has already been visited.
         * This is crucial for BFS to prevent infinite loops in cyclic graphs
         * and to avoid redundant calculations by reprocessing states.
         */
        if    (    obj.hasOwnProperty  (   x    +    ","    +    y   )   )
        {
            // If visited, skip to the next iteration of the while loop,
            // as this path has already been explored or is less optimal.
            continue  ;
        }
        else
        {
            // Mark the current state (x,y) as visited by adding it to the 'obj' object.
            obj[ x    +    ","    +    y ]    =    true ;
        }

        // Get the count (number of steps taken to reach this state) from the current state array.
        var    cnt    =    ary[ 2 ] ;

        // Check for a specific goal condition:
        // If y is at the last column (n-1) AND the value in the grid at (x,y) is NOT 2.
        // This defines what constitutes a successful path completion.
        if    (    y    ==    n    -    1    &&    xy[ x ][ y ]    !=    2   )
        {
            // If the goal is met, update the answer with the current step count.
            ans    =    cnt ;
            // Terminate the main search loop as a solution has been found (BFS guarantees shortest path if edge weights are uniform).
            break  ;
        }

        // Get the value 'v' from the global 'xy' grid at the current (x,y) coordinates.
        // This value dictates specific movement rules.
        var    v    =    xy[ x ][ y ] ;

        // Conditional logic based on the value 'v' found in the grid.
        if    (    v    ==    1    )
        {
            // This block handles a specific movement rule when 'v' is 1.
            var    flag    =    false ; // A flag to indicate if a boundary condition is met during this specific movement.
            while    (    true    )
            {
                // Increment the y-coordinate, moving right.
                y++ ;
                // Check if the y-coordinate has reached the final column of the grid.
                if    (    y    ==    n    -    1   )
                {
                    flag    =    true ; // Set flag to true if end is reached during this '1' traversal.
                    break  ; // Exit inner while loop as the end is reached.
                }
                // If the value at the new position is no longer 1,
                // it means the contiguous '1' path has ended.
                if    (    xy[ x ][ y ]    !=    1   )
                {
                    y-- ; // Revert y to the last valid '1' position before the non-'1' cell.
                    break  ; // Exit inner while loop.
                }
            }
            // If the flag is true, it means we reached the end of the board
            // while following '1's. This path is considered complete in some way,
            // so no further children are generated from this specific path.
            if    (    flag    )
            {
                continue  ; // Skip remaining processing for this leaf and go to the next leaf in the queue.
            }
        }
        else    if    (    v    ==    2    )
        {
            // This block handles a specific movement rule when 'v' is 2.
            while    (    true    )
            {
                // Decrement the y-coordinate, moving left.
                y-- ;
                // If the value at the new position is no longer 2,
                // it means the contiguous '2' path has ended.
                if    (    xy[ x ][ y ]    !=    2   )
                    break  ; // Exit inner while loop.
            }
        }

        // After processing the current state and potentially adjusting 'y',
        // generate new potential states (children) and add them to the 'leaf' queue
        // for future exploration. These represent the next possible moves.
        // This loop adds three new states for each current state, varying 'y'.
        for    (    var    i    =    0    ;    i    <=    2    ;    i++   )
            leaf.push  (   [    1    -    x,    y    +    i,    cnt    +    1   ]   )   ;
    }
    // The function returns the final calculated answer after the search terminates.
    return    ans ;
}
// --- End of the bomb function definition ---


// --- Start of global execution scope for reading input and running test cases ---

/*
 * The 'fs' module is a built-in Node.js module
 * that provides an API for interacting with the file system.
 * Here, it's used to read synchronous input from '/dev/stdin'
 * (standard input stream) using 'utf8' encoding.
 */
var    input    =    require  (   'fs'   ) .   readFileSync  (   '/dev/stdin' ,    'utf8'   )   ;

// Process the raw input string:
// 1. Remove leading/trailing whitespace using .trim().
// 2. Split the string into an array of lines using "\n" as a delimiter.
// This prepares the input for easy line-by-line processing.
var    arr    =    input.trim  (   ) .   split  (   "\n"   )   ;

// Main loop for processing multiple test cases from the input array.
// The loop continues indefinitely until a specific termination condition is met.
while    (    true    )
{
    // Retrieve the first line from 'arr', which represents 'n' (board width).
    // .shift() removes and returns the first element, effectively consuming a line.
    // The '-0' is a concise way to convert the string obtained from .shift() to a number.
    var    n    =    arr.shift  (   )    -    0   ;

    // Check for the termination condition: if 'n' is 0, stop processing.
    // This is a common pattern in competitive programming for multi-test case inputs.
    if    (    n    ==    0   )
    {
        break  ; // Exit the test case processing loop.
    }

    // Initialize an empty array 'xy'. This will store the game grid data,
    // which consists of two rows of numbers.
    var    xy    =    [  ]   ;

    // Populate the 'xy' array with two rows of numbers from the input.
    // Each line from 'arr' is split by spaces (" ") and then each resulting
    // string part is converted to a Number type using the .map(Number) function.
    xy[ 0 ]    =    arr.shift  (   ) .   split  (   " "   ) .   map  (   Number   )   ;
    xy[ 1 ]    =    arr.shift  (   ) .   split  (   " "   ) .   map  (   Number   )   ;

    // Call the 'bomb' function with the current 'n' and 'xy' data
    // (which are implicitly accessible due to global scope in this setup)
    // and print the returned result to the console.
    console.log  (   bomb  (   )   )   ;
}

// --- End of program execution and all test cases processed ---