/*
 * Global variable declarations.
 * minCount stores the minimum number of obstacles encountered on a path.
 * status stores the grid representation of the map.
 */
var minCount =1000; /* Initialize minimum obstacle count to a large value */
var status;         /* This variable will hold the parsed grid data */

/**
 * The main entry point function for processing input.
 * It reads the input, parses it, initializes the grid,
 * and then calls the recursive pathfinding function.
 * Finally, it prints the result.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  )
{
    // Trim any leading/trailing whitespace from the input string.
    input = input.trim();

    // Split the input string into an array of lines.
    input = input.split("\n")

    // The first line contains the dimensions of the grid (rows, columns).
    // Split it by space to get individual dimensions.
    var a = input[0].split(" ");

    // The rest of the input lines represent the grid itself.
    // Slice the array from the second element to the end.
    status = input.slice(1,input.length);

    // Map each grid row string into an array of characters.
    status = status.map( e => {
        return e.split('') // Convert each row string into an array of characters
    } );


    // Call the recursive function 'func' to find the path.
    // Start position: [0,0]
    // End position: [rows-1, columns-1]
    // Initial obstacle count: 0
    func(
        [0,0],                                // Starting coordinates [y, x]
        [parseInt(a[0])-1,parseInt(a[1])-1],  // Ending coordinates [y, x] (adjust for 0-indexed)
        0                                     // Initial obstacle count
    );

    // After all paths are explored, print the minimum obstacle count found.
    console.log(minCount);
}

// Read input from standard in and pass it to the Main function.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  );


/**
 * Recursive function to explore paths from 'now' to 'end' on the grid.
 * It keeps track of the number of obstacles encountered.
 * 'minCount' is updated globally if a better path is found.
 * @param {number[]} now   - The current coordinates [y, x].
 * @param {number[]} end   - The target coordinates [y, x].
 * @param {number}   count - The number of obstacles encountered so far on the current path.
 */
function func(  now,  end,  count  )
{
    // Extract current row and column indices for easier access.
    var y = now[0]; // Current row index
    var x = now[1]; // Current column index


    // Check if the current cell is an obstacle ('#').
    // If it is, increment the obstacle count for this path.
    if(  status[y][x] != "."  )
    {
        count++; // Increment obstacle count

        // If the current path already has more obstacles than the best path found so far,
        // there's no need to explore this path further. Prune the branch.
        if(  count > minCount  )
            return; // Backtrack
    }

    // Check if the current position is the end destination.
    if(  y == end[0] && x == end[1]  )
    {
        // If the end is reached and this path has fewer obstacles than minCount,
        // update minCount with this new minimum.
        if(  count < minCount  )
            minCount = count; // Update global minimum

        return; // Path completed, backtrack
    }
    // If not at the end, determine the next possible moves.
    // If currently on the last row (y == end[0]), only horizontal movement (right) is possible.
    else if(  y == end[0]  )
    {
        func(  [y,x+1],  end,  count  ); // Move right
    }
    // If currently on the last column (x == end[1]), only vertical movement (down) is possible.
    else if(  x == end[1]  )
    {
        func(  [y+1,x],  end,  count  ); // Move down
    }
    // If neither on the last row nor the last column, both horizontal and vertical moves are possible.
    else
    {
        // Get the status of the adjacent cells: right and down.
        var next1 =status[y][x+1]; // Cell to the right
        var next2 =status[y+1][x]; // Cell below

        // Prioritize moves based on obstacles.
        // If the cell to the right is an obstacle and the cell below is clear,
        // only move down.
        if(  next1 == "#" && next2 =="."  )
        {
            func(  [y+1,x],  end,  count  ); // Move down
        }
        // If the cell to the right is clear and the cell below is an obstacle,
        // only move right.
        else if(  next1 == "." && next2 =="#"  )
        {
            func(  [y,x+1],  end,  count  ); // Move right
        }
        // If both are clear, or both are obstacles, or any other combination,
        // explore both paths (move right and move down).
        else
        {
            func(  [y,x+1],  end,  count  ); // Explore moving right
            func(  [y+1,x],  end,  count  ); // Explore moving down
        }
    }
}