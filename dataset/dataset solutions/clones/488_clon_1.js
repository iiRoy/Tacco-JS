/*
 * This JavaScript code defines a function 'bomb'
 * and then processes input data using this function.
 *
 * The 'bomb' function appears to implement a search algorithm,
 * possibly a Breadth-First Search (BFS) or a similar graph traversal,
 * to find a path or a state count based on certain conditions
 * within a 2D grid represented by 'xy'.
 */
function bomb ( )
{
    // Initialize an empty object to store visited states.
    // Keys will be string representations of coordinates "x,y", values will be 'true'.
    var obj = { } ;

    // Initialize the answer variable to "NA" (Not Applicable/Available).
    var ans = "NA" ;

    // Initialize the 'leaf' array, which acts as a queue for the search.
    // Each element is an array [x, y, count].
    var leaf = [ [ 0 , 0 , 0 ] , [ 1 , 0 , 0 ] ] ;

    // Start an infinite loop for the search process.
    while ( true )
    {
        // Check if the 'leaf' queue is empty. If so, no more states to explore.
        if ( leaf . length == 0 )
        {
            break ; // Exit the while loop.
        }

        // Dequeue the next state to process from the front of the 'leaf' array.
        var ary = leaf . shift ( ) ;

        // Extract the x-coordinate from the current state array.
        var x = ary [ 0 ] ;
        // Extract the y-coordinate from the current state array.
        var y = ary [ 1 ] ;

        // Form a string key for the current coordinates to check visited status.
        // Check if the current state (x,y) has already been visited.
        if ( obj . hasOwnProperty ( x + "," + y ) )
        {
            continue ; // If visited, skip to the next iteration of the loop.
        }
        else
        {
            // If not visited, mark it as visited in the 'obj' object.
            obj [ x + "," + y ] = true ;
        }

        // Extract the count (path length or steps) from the current state array.
        var cnt = ary [ 2 ] ;

        // Check the termination condition for the search.
        // If y is at the second-to-last column (n-1) AND the value at xy[x][y] is not 2.
        if ( y == n - 1 && xy [ x ] [ y ] != 2 )
        {
            ans = cnt ; // Update the answer with the current count.
            break ; // Found the target, exit the main search loop.
        }

        // Get the value at the current grid position (x, y).
        var v = xy [ x ] [ y ] ;

        // Conditional logic based on the value 'v'.
        if ( v == 1 )
        {
            // If v is 1, move right (increment y) until the value is no longer 1.
            while ( true )
            {
                y ++ ; // Increment y-coordinate.
                // Check the value at the new position.
                if ( xy [ x ] [ y ] != 1 )
                {
                    y -- ; // If it's not 1, move back one step.
                    break ; // Exit the inner while loop.
                }
            }
        }
        else if ( v == 2 )
        {
            // If v is 2, move left (decrement y) until the value is no longer 2.
            while ( true )
            {
                y -- ; // Decrement y-coordinate.
                // Check the value at the new position.
                if ( xy [ x ] [ y ] != 2 )
                {
                    break ; // If it's not 2, exit the inner while loop.
                }
            }
        }

        // After potential movement, add new states to the 'leaf' queue for exploration.
        // This loop adds three new states based on the current (x, y, cnt).
        for ( var i = 0 ; i <= 2 ; i ++ )
        {
            // The new x-coordinate is 1-x (switches the row, e.g., 0 to 1, 1 to 0).
            // The new y-coordinate is y+i (current y, y+1, y+2).
            // The new count is cnt+1 (one more step).
            leaf . push ( [ 1 - x , y + i , cnt + 1 ] ) ;
        }
    }

    // Return the final calculated answer.
    return ans ;
}


// --- Main program execution starts here ---

// Read the entire input from standard input (/dev/stdin) as UTF-8 string.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input: trim whitespace and split into an array of lines.
var arr = input . trim ( ) . split ( "\n" ) ;

// Loop indefinitely to process multiple test cases from the input array.
while ( true )
{
    // Extract the first element from 'arr', convert it to a number (by subtracting 0),
    // and assign it to 'n'. This 'n' typically represents a dimension or size.
    var n = arr . shift ( ) - 0 ;

    // Check if 'n' is 0. This is the termination condition for the input processing.
    if ( n == 0 )
    {
        break ; // Exit the main input processing loop.
    }

    // Initialize an empty array 'xy' to store the grid data for the current test case.
    var xy = [ ] ;

    // Read the first row of the grid:
    // Take the next line from 'arr', split it by spaces, and map each part to a Number.
    xy [ 0 ] = arr . shift ( ) . split ( " " ) . map ( Number ) ;
    // Read the second row of the grid:
    // Take the next line from 'arr', split it by spaces, and map each part to a Number.
    xy [ 1 ] = arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Call the 'bomb' function with the global 'n' and 'xy' variables,
    // and print the returned result to the console.
    console . log ( bomb ( ) ) ;
}