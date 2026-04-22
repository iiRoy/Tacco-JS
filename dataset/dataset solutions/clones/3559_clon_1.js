/*
 * This is a Type I clone of an existing JavaScript program.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */
function   main   (   input   )   {
  // Declare and initialize variables for height and width
  var   H   =   input   [   0   ]   .   split   (   " "   )   [   0   ]   -   0   ;
  var   W   =   input   [   0   ]   .   split   (   " "   )   [   1   ]   -   0   ;

  /*
   * evenlist will store coordinates [row, col] of cells
   * containing odd numbers.
   */
  var   evenlist   =   [   ]   ;

  // Iterate through each row of the input grid
  for   (   var   i   =   1   ;   i   <=   H   ;   i  ++   )   {
    // Process each row to find odd numbers and their coordinates
    evenlist   =   evenlist   .   concat   (
      input   [   i   ]   .   split   (   " "   )   .   map   (   (   v   ,   j   )   =>   {
        // Check if the current value is odd
        if   (   v   %   2   ==   1   )   {
          return   [   i   ,   j   +   1   ]   ; // Return 1-indexed coordinates
        }
        else   {
          return   null   ; // Not an odd number, return null
        }
      }   )
      // Filter out the nulls, keeping only the actual coordinates
      .   filter   (   v   =>   v   )
    )   ;
  }


  // This list will store the sequence of moves
  var   anslist   =   [   ]   ;

  // Process pairs of odd numbers found
  for   (   var   i   =   0   ;
          i   <   Math   .   floor   (   evenlist   .   length   /   2   )   ;
          i  ++   )   {
    var   start   =   evenlist   [   i   *   2   ]   ; // Get the starting coordinate
    var   end   =   evenlist   [   i   *   2   +   1   ]   ; // Get the ending coordinate

    // If there's an odd number of odd cells, the last 'end' might be null
    if   (   end   ==   null   )   {
      break   ; // Exit the loop if no valid end point
    }

    // Convert the end coordinate to a string for comparison
    var   endj   =   end   .   toString   (   )   ;

    // While the current 'start' position is not the 'end' position
    while   (   start   .   toString   (   )   !=   endj   )   {
      // Check if we need to move horizontally or vertically
      if   (   start   [   1   ]   <   end   [   1   ]   )   {
        // Move right (increment column)
        anslist   .   push   (   [   start   [   0   ]   ,   start   [   1   ]   ,   start   [   0   ]   ,   ++start   [   1   ]   ]   )   ;
      }
      else   {
        // Move down (increment row)
        anslist   .   push   (   [   start   [   0   ]   ,   start   [   1   ]   ,   ++start   [   0   ]   ,   start   [   1   ]   ]   )   ;
      }
    }
  }

  // Output the total number of moves
  console   .   log   (   anslist   .   length   )   ;
  // Output each move on a new line
  console   .   log   (   anslist   .   join   (   "\n"   )   )   ;
}


// This part handles reading input from stdin and passing it to the main function.
main   (
  require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,
                                       'utf8'   )   .   trim   (   )   .   split   (   "\n"   )
)   ;