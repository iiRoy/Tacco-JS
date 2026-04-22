/*
 * This is a Type I clone of the provided JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create a visually distinct but functionally identical
 * version of the source code.
 */

// Define the Breadth-First Search (BFS) function
function   BFS   (   X   ,   Y   )
{

  // Mark the starting position on the map as visited ('.')
  YX  [ Y ]  [ X ]  =  "."  ;

  // Define delta arrays for movement in 4 directions (up, left, right, down)
  var   dx   =   [ 0 , -1 , 1 , 0 ]   ;
  var   dy   =   [ -1 , 0 , 0 , 1 ]   ;


  // Initialize the step counter
  var   cnt   =   0   ;

  // Initialize the BFS queue with the starting state:
  // [current_x, current_y, current_step_count, current_strength, current_map_state]
  var   bfs   =   [   [ X , Y , cnt , 1 , YX ]   ]   ;

  // Object to keep track of visited states to prevent redundant computations
  var   obj   =   { }   ;

  // Add the initial state to the visited object.
  // Note: 'x' and 'y' here refer to some potentially undefined variables
  // or implicitly global ones, strictly adhering to the original variable names.
  obj   [ x   +   " "   +   y   +   " "   +   YX.join ( "" ) ]   =   true   ;


  // Start the main BFS loop
  while   (   true   )
  {

    // If the BFS queue is empty, it means no path was found
    if   (   bfs.length   ==   0   )
    {
      cnt   =   -1   ; // Indicate no solution
      break   ; // Exit the loop
    }

    // Dequeue the next state (leaf) from the front of the queue
    var   leaf   =   bfs.shift ( )   ;

    // Extract components from the dequeued state
    var   x   =   leaf   [ 0 ]   ; // Current X coordinate
    var   y   =   leaf   [ 1 ]   ; // Current Y coordinate
    var   c   =   leaf   [ 2 ]   ; // Current step count
    var   s   =   leaf   [ 3 ]   ; // Current strength/power level
    var   yx   =   leaf   [ 4 ]   ; // Current state of the map (deep copy)


    // Check if the required strength (power + 1) has been reached
    if   (   s   ===   power   +   1   )
    {
      cnt   =   c   ; // Set the answer to the current step count
      break   ; // Solution found, exit the loop
    }


    // Explore all 4 neighboring cells (up, left, right, down)
    for   (   var   i   =   0   ;   i   <   4   ;   i   ++   )
    {

      // Calculate coordinates of the next cell
      var   xx   =   x   +   dx   [ i ]   ;
      var   yy   =   y   +   dy   [ i ]   ;
      var   ss   =   s   ; // Initialize next strength with current strength


      // Check if the next cell is within the grid boundaries
      if   (   xx   <   0   ||   yy   <   0   ||   xx   >=   hw   [ 1 ]   ||   yy   >=   hw   [ 0 ]   )
      {
        continue   ; // Skip if out of bounds
      }

      // Check if the next cell is an obstacle ('X')
      if   (   YX   [ yy ]   [ xx ]   ==   "X"   )
      {
        continue   ; // Skip if it's an obstacle
      }


      // Create a deep copy of the current map state for the new path
      var   copy   =   yx.map   (   function   (   v   )   {
        return   v.slice ( )   ;
      }   )   ;


      // If the cell contains a number matching the current strength, "consume" it
      if   (   copy   [ yy ]   [ xx ]   ===   ""   +   ss   )
      {
        ss   ++   ; // Increment strength after consuming
        copy   [ yy ]   [ xx ]   =   "."   ; // Mark the cell as visited/consumed on this path
      }

      // Create a unique string representation of the new state for visited tracking
      // Format: "x y map_state_as_string"
      var   str   =   xx   +   " "   +   yy   +   " "   +   copy.join ( "" )   ;

      // If this state has already been visited, skip it
      if   (   obj.hasOwnProperty   (   str   )   )
      {
        continue   ;
      }


      // Mark the new state as visited
      obj   [ str ]   =   true   ;

      // Add the new state to the BFS queue
      bfs.push   (   [ xx , yy , c   +   1 , ss , copy ]   )   ;

    } // End of for loop for neighbors
  } // End of while (true) BFS loop


  return   cnt   ; // Return the final step count
} // End of BFS function


// --- Main execution starts here ---

// Read the entire input from standard input
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )   ;

// Trim whitespace and split the input into an array of lines
var   Arr   =   (   input.trim ( )   ) . split ( "\n" )   ;

// Parse the first line for height (H), width (W), and initial power (P)
// Note: 'hw' stores [H, W, P]
var   hw   =   (   Arr.shift ( )   ) . split ( " " ) . map ( Number )   ;

// Extract the power value from 'wh' - strictly keeping the original identifier 'wh'
// despite 'hw' being the variable name holding the parsed values.
var   power   =   wh   [ 2 ]   ;

// Initialize the map array
var   YX   =   [ ]   ;

// Initialize an array to store the starting coordinates [x, y]
var   start   =   [ ]   ;


// Loop through the remaining lines to build the map and find the starting point 'S'
for   (   var   i   =   0   ;   i   <   hw   [ 0 ]   ;   i   ++   )
{

  // Get the current row and split it into an array of characters
  var   arr   =   (   Arr.shift ( )   ) . split ( "" )   ;

  // If 'S' (start) is found in the current row, record its coordinates
  if   (   arr.indexOf ( "S" )   !=   -1   )
  {
    start   =   [ arr.indexOf ( "S" ) , i ]   ;
  }

  // Add the processed row to the map array
  YX.push   (   arr   )   ;

} // End of map building loop


// Call the BFS function with the determined starting coordinates
var   ans   =   BFS   (   start   [ 0 ]   ,   start   [ 1 ]   )   ;

// Print the final answer to the console
console.log ( ans )   ;