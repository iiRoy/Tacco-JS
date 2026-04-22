/* This is a Type I clone.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered extensively.
 */

// --- Utility Functions for Input Parsing and Basic Checks ---

function pint(s)
{
  return parseInt(s)
  ;
}


function pfloat(s)
{
  return parseFloat(s)
  ;
} /* End of pfloat function definition */


function even(s) { return (s % 2) === 0; } // Function to check if a number 's' is even
function odd(s) { return (s % 2) === 1; } // Function to check if a number 's' is odd

/* Array Prototype Extensions for common operations */

Array.prototype.sortNumAsc =
  function ()
{
  return this.sort((a, b) => (a - b)); // Sorts array elements numerically in ascending order
};
Array.prototype.sortNumDesc
  = function ()
{
  return this.sort((a, b) => (b - a)); // Sorts array elements numerically in descending order
}
;
Array.prototype.sortStrAsc
  = function ()
{
  return this.sort(); // Sorts array elements as strings in ascending order
}
;
Array.prototype.sortStrDesc
  = function ()
{
  return this.sort().reverse(); // Sorts array elements as strings in descending order, then reverses
}
;
Array.prototype.without
  = function (x)
{
  return this.filter(e => e !== x); // Returns a new array with all occurrences of 'x' removed
}
;

// --- Main Program Logic Starts Here ---

function main(lines)
{
  // Parse the first line of input to extract grid dimensions and step limit
  var arr = lines[0]  .split ( ' ' ) .map ( pint ) ;
  var H   = arr[0]   ; // H: Height of the grid
  var W   = arr[1]   ; // W: Width of the grid
  var K   = arr[2]   ; // K: Maximum steps allowed for a single movement phase

  var S = []; // This array will store the [row, column] coordinates of the starting point 'S'

  // The 'stage' variable will represent the grid as a 2D array of characters
  // Each inner array corresponds to a row, and elements are characters like '.', '#', or 'S'
  var stage = lines.slice(1).map(l => l.split(''));

  /*
   * Loop through the grid to find the starting point 'S'.
   * The 'outer' label allows breaking out of both nested loops once 'S' is found.
   */
  outer:
    for ( var h = 0 ; h < H ; h++ )
    {
      for ( var w = 0 ; w < W ; w++ )
      {
        if ( stage[h][w] === 'S' )
        {
          S = [h, w]; // Store the coordinates of 'S'
          break outer; // Exit the outer loop
        }
      }
    }


  /*
   * Recursive Depth-First Search (DFS) function to mark all reachable cells
   * within 'K' steps. Cells are marked with the minimum steps required to reach them.
   *
   * Parameters:
   * h: current row index
   * w: current column index
   * i: number of steps taken to reach the current cell (h, w) from 'S'
   */
  function search(h, w, i)
  {
    // Base case 1: If the number of steps 'i' exceeds 'K', this path is too long.
    if ( i > K )
    {
      return;
    }
    // Base case 2: If the current coordinates (h, w) are outside the grid boundaries.
    if ( h < 0 || H <= h || w < 0 || W <= w )
    {
      return;
    }

    var p = stage[h][w]; // Get the content of the current cell

    /*
     * Check if the cell is traversable:
     *   - It's an empty cell ('.')
     *   - It's the starting cell ('S')
     *   - It's a cell that was previously marked with a number of steps 'p',
     *     but the current path 'i' is shorter than 'p'.
     */
    if (
      p === '.' || // If the cell is empty
      p === 'S' || // If the cell is the starting point
      ( ( typeof p === 'number' ) && p > i ) // If already visited, but current path is shorter
    )
    {
      stage[h][w] = i; // Mark this cell with the minimum steps 'i' to reach it

      // Schedule recursive calls for all four adjacent neighbors using setTimeout(..., 0).
      // This technique helps prevent call stack overflow errors in environments
      // with limited stack size for very deep recursions, by deferring execution
      // to the next event loop tick.
      setTimeout(
        function()
        {
          search(h - 1, w, i + 1); // Explore cell above (North)
          search(h + 1, w, i + 1); // Explore cell below (South)
          search(h, w - 1, i + 1); // Explore cell to the left (West)
          search(h, w + 1, i + 1); // Explore cell to the right (East)
        },
        0 // Zero delay means execute as soon as the current script block finishes
      );
    }
  }


  // Initiate the search process from the starting point 'S' with 0 steps taken
  search(S[0], S[1], 0);


  /*
   * Calculates the minimum number of steps required to reach any of the
   * four grid borders (top, bottom, left, right) from a given cell (h, w).
   *
   * Parameters:
   * h: row index of the cell
   * w: column index of the cell
   *
   * Returns:
   * The shortest distance to any border.
   */
  function min_step_to_out(h, w)
  {
    var a = ( H - 1 ) - h ; // Distance to the bottom border
    var b = h             ; // Distance to the top border
    var c = ( W - 1 ) - w ; // Distance to the right border
    var d = w             ; // Distance to the left border

    return Math.min(a, b, c, d); // Return the minimum of these four distances
  }


  var minimum = Infinity; // Initialize 'minimum' with a very large value

  /*
   * Iterate through the entire grid once the search is complete.
   * The goal is to find the overall minimum number of moves to exit the grid.
   */
  outer:
    for ( var h = 0 ; h < H ; h++ )
    {
      for ( var w = 0 ; w < W ; w++ )
      {
        var p = stage[h][w]; // Get the content of the current cell

        // If the cell 'p' is a number, it means it's reachable from 'S'
        if ( typeof p === 'number' )
        {
          var step = min_step_to_out(h, w); // Calculate steps from this cell to the nearest border

          // If the cell (h, w) is already on a border (step == 0)
          if ( step === 0 )
          {
            minimum = 1; // It takes only 1 more move to exit
            break outer; // Since we found a direct exit, 1 is the absolute minimum. No further checks needed.
          }
          // Calculate the total moves to exit through this cell:
          // (Current cell's reachability 'p') + (steps from this cell to border 'step')
          // The total "phases" of K steps needed is ceil(step / K), plus 1 for the final exit action.
          minimum = Math.min(minimum, Math.ceil(step / K) + 1);
        }
      }
    }


  // Output the final calculated minimum number of moves to exit the grid
  console.log(minimum);
}


// --- Input Reading and Main Function Invocation ---
// This part reads the input from standard input, processes each line,
// and then calls the main function with the processed input.
main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));