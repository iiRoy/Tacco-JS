/*
 * This JavaScript code reads input, processes it, and solves a pathfinding problem.
 * It's designed for competitive programming environments where input is read from stdin.
 */

var input = require("fs") . readFileSync(
  "/dev/stdin",  // Path to standard input file
  "utf8"        // Encoding for reading the file
) . trim() . split("\n"); // Read, trim whitespace, and split by newlines

/*
 * Custom object for managing input stream.
 * Mimics an iterator to provide 'next' and 'hasNext' functionality.
 */
var obj = {

  "list"  :  input,     // Stores the array of input lines
  "index" :  0,         // Current index in the input array
  "max"   :  input.length, // Total number of lines in the input

  // Method to get the next element from the input list
  "next"  :  function() {
    // Check if there are more elements available
    if ( ! this.hasNext() ) {
      throw "NoSuchElementException:次に要素は無いよ"; // Error if no more elements
    }

    var returnObj = this.list[this.index]; // Get the current element
    this.index++;                          // Move to the next index
    return returnObj;                      // Return the fetched object
  },

  // Method to check if there are more elements in the input list
  "hasNext" : function() {
    return ( this.index < this.max ); // True if current index is less than max length
  }
};


// Call the main function to start program execution.
Main();


/**
 * Helper function to retrieve the next input element.
 * @returns {string} The next element from the input stream.
 */
function next() {
  return obj . next();
}


/**
 * Helper function to check if there are more input elements.
 * @returns {boolean} True if more elements exist, false otherwise.
 */
function hasNext() {
  return obj . hasNext();
}


/**
 * Prints the given argument to standard output.
 * @param {*} t - The value to be printed.
 */
function myout(t) {
  console.log(t); /* Standard output function */
}


/**
 * Prints the given argument to standard error.
 * @param {*} t - The value to be printed.
 */
function myerr(t) {
  console.error(t); // Standard error output
}


/*
 *  [no] specifies the conversion type for the input 'i'.
 *  - Default/Unknown/Error: Returns 'i' as is.
 *  - 1: Converts 'i' to an integer.
 *  - 2: Splits 'i' by half-width spaces.
 *  - 4: Splits 'i' by half-width spaces and converts elements to numbers.
 *  - 6: Splits 'i' by character.
 *  - 7: Splits 'i' by character and converts elements to numbers.
 *  - 8: Joins array 'i' with half-width spaces.
 *  - 9: Joins array 'i' with newlines.
 *  - 0: Joins array 'i' with no separator.
 */
function myconv( i, no ) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i . split(" ");
      case 4:
        return i . split(" ") . map( ( a ) => Number(a) );
      case 6:
        return i . split("");
      case 7:
        return i . split("") . map( ( a ) => Number(a) );
      case 8:
        return i . join(" ");
      case 9:
        return i . join("\n");
      case 0:
        return i . join("");
      default:
        return i;
    }
  } catch (e) {
    // In case of any conversion error, return the original input.
    return i;
  }
}


/**
 * Main function where the program logic resides.
 * Solves a maze-like problem using Breadth-First Search (BFS).
 */
function Main() {

  // Read the first line of input, split by space, and convert to numbers.
  var one = myconv( next(), 4 );

  // Assign height and width from the first line of input.
  var H = one[0]; // Height of the grid
  var W = one[1]; // Width of the grid

  // Initialize a 2D array to store the grid layout.
  var list  = new Array( H );
  // Initialize a 2D array to keep track of visited cells during BFS.
  var visit = new Array( H );


  // Populate the grid and initialize the visit array.
  for ( var i = 0; i < H; i++ ) {
    list[i] = myconv( next(), 6 ); // Read each row, split by character
    visit[i] = new Array(W) . fill(false); // Initialize all cells as not visited
  }

  // Mark the starting cell as visited.
  visit[0][0] = true;

  // Initialize 'goal' with a very large number to find the minimum path length.
  var goal = 10000000;

  // Initialize the BFS queue with the starting cell (y, x, count).
  var queue = [ [ 0, 0, 0 ] ];

  // Perform BFS until the queue is empty.
  while ( queue . length > 0 ) {
    var q     = queue . shift(); // Dequeue the first element
    var y     = q[0];            // Current row coordinate
    var x     = q[1];            // Current column coordinate
    var count = q[2];            // Path length to reach this cell

    // Check if the current cell is the destination (bottom-right).
    if ( y == H - 1 && x == W - 1 ) {
       goal = Math . min( goal, count ); // Update minimum path length
    }

    // Check move Up: (y-1, x)
    // Ensure within bounds, path is '.', and not visited.
    if ( y != 0 && list[y - 1][x] == "." && ! visit[y - 1][x] ) {
      visit[y - 1][x] = true;             // Mark as visited
      queue . push( [ y - 1, x, count + 1 ] ); // Enqueue new state
    }

    // Check move Left: (y, x-1)
    // Ensure within bounds, path is '.', and not visited.
    if ( x != 0 && list[y][x - 1] == "." && ! visit[y][x - 1] ) {
      visit[y][x - 1] = true;             // Mark as visited
       queue . push( [ y, x - 1, count + 1 ] ); // Enqueue new state
    }

    // Check move Down: (y+1, x)
    // Ensure within bounds, path is '.', and not visited.
    if ( y != H - 1 && list[y + 1][x] == "." && ! visit[y + 1][x] ) {
      visit[y + 1][x] = true;             // Mark as visited
       queue . push( [ y + 1, x, count + 1 ] ); // Enqueue new state
    }

    // Check move Right: (y, x+1)
    // Ensure within bounds, path is '.', and not visited.
    if ( x != W - 1 && list[y][x + 1] == "." && ! visit[y][x + 1] ) {
      visit[y][x + 1] = true;             // Mark as visited
       queue . push( [ y, x + 1, count + 1 ] ); // Enqueue new state
    }
  }

  // After BFS, determine the result.
  // If goal remains its initial large value, it means the destination was unreachable.
  if ( goal == 10000000 ) {
     myout( -1 ); // Output -1 for unreachable goal.
  } else {
     var dot = 0; // Counter for '.' cells (passable paths)

     // Count all '.' cells in the grid.
     for ( var i = 0; i < H; i++ ) {
       for ( var j = 0; j < W; j++ ) {
         if ( list[i][j] == "." ) {
            dot++; // Increment counter if cell is a '.'
         }
       }
     }

     // Calculate the number of '.' cells that are *not* part of the shortest path.
     // The shortest path has 'goal + 1' cells (including start and end).
     dot -= ( goal + 1 );
    myout( dot ); // Output the result.
  }
}