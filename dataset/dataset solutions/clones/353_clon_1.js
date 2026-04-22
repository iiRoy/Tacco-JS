/*
 * This JavaScript code processes input to find the largest rectangle of 'walkable' cells.
 * It reads data from standard input, parses it, and then applies a monotonic stack
 * algorithm to calculate the maximum area.
 */

// Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Read the entire input, trim whitespace, and split it by newlines into an array.
var arr = input . trim ( ) . split ( "\n" ) ;

// Main processing loop: continues until a specific break condition is met.
while ( true ) {

  // Shift the first line from the array, split it by space, and map to numbers.
  // This line typically contains the height (h) and width (w) of the current grid.
  var hw = arr.shift().split(" ").map(Number) ;

  // Check for the termination condition: "0 0" indicates end of input.
  if ( hw . join ( " " ) == "0 0" )
    break ; // Exit the loop if the sentinel value is encountered.

  // Extract height and width from the parsed 'hw' array.
  var h = hw [ 0 ] ; // Height of the current grid.
  var w = hw [ 1 ] ; // Width of the current grid.

  // Initialize a 2D array 'yx' to store heights of consecutive '.' characters.
  var yx = [ ] ;

  // Loop through each row of the grid (from top to bottom).
  for ( var y = 0 ; y < h ; y ++ ) {
    // Get the current row string from input and split it into individual characters.
    var ary = arr.shift().split("") ;

    // Initialize the current row in 'yx' as an empty array.
    yx [ y ] = [ ] ;

    // Iterate over each character (cell) in the current row.
    ary . forEach ( function ( v , x ) {
      // If it's the first row (y=0):
      if ( y == 0 && v == "." ) {
        yx [ y ] [ x ] = 1 ; // If cell is '.', height is 1.
      } else if ( y == 0 && v != "." ) {
        yx [ y ] [ x ] = 0 ; // If cell is not '.', height is 0.
      }
      // If it's not the first row (y > 0):
      else if ( y != 0 && v == "." ) {
        // If cell is '.', height is previous cell's height + 1.
        yx [ y ] [ x ] = yx [ y - 1 ] [ x ] + 1 ;
      } else if ( y != 0 && v != "." ) {
        // If cell is not '.', height is 0.
        yx [ y ] [ x ] = 0 ;
      }
    } ) ; // End of forEach for current row.
  } // End of outer for loop for grid initialization.

  // Initialize 'max' to store the maximum area found so far.
  var max = 0 ;

  // This loop iterates through each row of the processed 'yx' array.
  // It applies a monotonic stack algorithm to find the largest rectangle
  // in a histogram for each row.
  for ( var k = 0 ; k < h ; k ++ ) {
    // 's' is a stack that will store [height, index] pairs for the histogram.
    var s = [ ] ;

    // Add a sentinel value to the end of the current row's histogram.
    // This helps in clearing the stack and calculating areas for remaining bars.
    yx [ k ] [ w ] = 0 ;

    // Iterate through each bar in the current row's histogram (including the sentinel).
    for ( var x = 0 ; x <= w ; x ++ ) {
      var v = yx [ k ] [ x ] ; // Current bar height.

      // If the stack is empty, push the current bar.
      if ( s . length == 0 ) {
        s.push([v, x + 1]) ;
        continue ; // Move to the next bar.
      }

      // If the current bar is taller than the top of the stack, push it.
      if ( s [ s . length - 1 ] [ 0 ] < v ) {
        s.push([v, x]) ;
      }
      // If the current bar is of the same height as the top of the stack, skip it.
      // This is a common optimization for histograms, effectively extending the width.
      else if ( s [ s . length - 1 ] [ 0 ] == v ) {
        continue ;
      }
      // If the current bar is shorter than the top of the stack,
      // pop elements from the stack and calculate areas.
      else if ( s [ s . length - 1 ] [ 0 ] > v ) {
        while ( s . length != 0 ) {
          var r = s . pop ( ) ; // Pop the top element [height, index].

          // If the popped bar's height is less than the current bar's height,
          // push it back and break (current bar is taller than this one).
          if ( v > r [ 0 ] ) {
            s.push(r) ;
            break ;
          }
          // If the popped bar's height is equal to the current bar's height,
          // break (current bar effectively extends width of this one).
          else if ( v == r [ 0 ] ) {
            break ;
          }
          // If the popped bar's height is greater than or equal to the current bar's height,
          // calculate its area and update 'max'.
          else if ( v <= r [ 0 ] ) {
            // Area = height * width. Width is (current_index + 1) - start_index_of_popped_bar.
            max = Math . max ( max , r [ 0 ] * ( ( x + 1 ) - r [ 1 ] ) ) ;
          }
        } // End of inner while loop.
      } // End of else if for current bar shorter than stack top.
    } // End of inner for loop for current row's histogram.
  } // End of outer for loop for all rows.

  // Print the maximum area found for the current grid.
  console . log ( max ) ;
} // End of main while loop.

// End of script.