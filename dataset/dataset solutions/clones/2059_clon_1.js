// This variable holds the minimum count found so far.
var minCount = 1000; // Initialize with a large value.

/*
 * This variable will store the status grid,
 * representing the input maze or grid data.
 */
var    status;

/**
 * The main function to process the input and initiate the pathfinding.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  ) {
    // Trim any leading/trailing whitespace from the input string.
    input  =  input.trim();
    // Split the input string into an array of lines.
    input  =  input.split( "\n"  );
    // The first line contains grid dimensions.
    var a  =  input[0].split(  " "  );

    // Extract the grid status from the remaining lines.
    status  =  input.slice(  1,  input.length  );

    // Convert each status line into an array of characters.
    status  =  status.map(  e  =>  {
        return  e.split( ''  )
    }  ) ; // End of map function call.


    /*
     * Call the recursive function 'func' to explore paths.
     * Arguments:
     * - Starting position [0,0]
     * - Ending position [parsed_row_end, parsed_col_end]
     * - Initial count (0)
     */
    func(  [0, 0],  [parseInt(a[0]) - 1, parseInt(a[1]) - 1],  0  );

    // Log the final minimum count found.
    console.log(  minCount  );
}


// Read input from standard in and pass it to the Main function.
Main(  require("fs").readFileSync(  "/dev/stdin",  "utf8"  )  );


/**
 * Recursive function to explore paths on the grid.
 * @param {number[]} now - Current coordinates [y, x].
 * @param {number[]} end - Target coordinates [endY, endX].
 * @param {number} count - Current path cost.
 */
function func(  now,  end,  count  )  {
    // Extract current row and column.
    var y  =  now[0]
    var x  =  now[1]

    // Check if the current cell is an obstacle (not '.').
    if  (status[y][x]  !=  "."  )  {
        count++; // Increment count for obstacle.
        // If current count already exceeds minCount, prune this path.
        if  (count  >  minCount)  {
            return;
        }
    }

    // Base case: If reached the end point.
    if  (y  ==  end[0]  &&  x  ==  end[1]  )  {
        // If this path is shorter, update minCount.
        if  (count  <  minCount)  {
            minCount  =  count
        }
        return; // Path ends here.
    }
    // Recursive cases: Move to the next cell.
    else  if  (y  ==  end[0]  )  { // Only horizontal movement possible (at end row).
        func(  [y, x + 1],  end,  count  )
    }
    else  if  (x  ==  end[1]  )  { // Only vertical movement possible (at end column).
        func(  [y + 1, x],  end,  count  )
    }
    else  { // Both horizontal and vertical movements possible.
        func(  [y, x + 1],  end,  count  ) // Explore moving right.
        func(  [y + 1, x],  end,  count  ) // Explore moving down.
    }
}