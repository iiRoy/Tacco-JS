function block ( k , i , j )
{
  // This function determines if a given coordinate (i, j) falls into a "black" region
  // based on the grid size 'k'. There are two such regions defined.

  // First black region: 0 <= i < k AND 0 <= j < k
  if ( 0 <= i && i < k && 0 <= j && j < k )
  {
    return "B" ; // It's a black block
  }
  // Second black region: k <= i < 2*k AND k <= j < 2*k
  else if ( k <= i && i < 2 * k && k <= j && j < 2 * k )
  {
    return "B" ; // It's also a black block
  }

  // If neither of the black regions match, it's a "white" block.
  return "W" ;
}


/*
 * The main entry point of the program.
 * It processes the input to find the maximum number of matching blocks.
 */
function Main ( input )
{
  // Parse the first line of input to get N and k.
  var head = input[ 0 ].split ( " " ) ;
  var N    = parseInt ( head[ 0 ] , 10 ) ; // N: Total number of data points
  var k    = parseInt ( head[ 1 ] , 10 ) ; // k: Grid parameter

  // 'check' will store the transformed coordinates and colors for each point.
  var check = [] ;


  // Loop through each of the N data points provided in the input.
  for ( var i = 1 ; i <= N ; i++ )
  {
    var tmp = input[ i ].split ( " " ) ; // Split the current line of input
    var x   = parseInt ( tmp[ 0 ] , 10 ) ; // Original x-coordinate
    var y   = parseInt ( tmp[ 1 ] , 10 ) ; // Original y-coordinate
    var c   = tmp[ 2 ] ;                   // Original color ('B' or 'W')

    // Calculate the 'remainder' coordinates within a kxk sub-grid.
    var new_x = x % k ;
    var new_y = y % k ;


    // Determine a pattern based on the larger kxk grid coordinates.
    // This pattern indicates if the color should be inverted.
    var pattern = ( ( ( x - new_x ) / k ) % 2 + ( ( y - new_y ) / k ) % 2 ) % 2 == 1 ? "R" : "N" ;


    var new_c = c ; // Start with the original color.

    // If the pattern indicates 'R' (Red, implying an inversion), flip the color.
    if ( pattern == "R" )
    {
      new_c = new_c == "B" ? "W" : "B" ;
    }


    // Store the transformed data.
    // If the new color is 'W', adjust new_x by adding 'k'.
    // This effectively shifts white blocks to a different conceptual kxk region for easier matching.
    check[ i - 1 ]     = [] ;
    check[ i - 1 ][ 0 ] = ( ( new_c == "W" ) ? new_x + k : new_x ) ;
    check[ i - 1 ][ 1 ] = new_y ;
    // check[i-1][2]=new_c; // This line was originally commented out and remains so.
  }


  // Initialize the variable to hold the maximum number of matches found.
  var max_match = 0 ;


  // Iterate through all possible shifts (n, m) to find the best match.
  // 'n' represents a vertical shift (up to 2*k).
  for ( var n = 0 ; n < 2 * k ; n++ )
  {
    // 'm' represents a horizontal shift (up to k).
    for ( var m = 0 ; m < k ; m++ )
    {
      // Initialize match counter for the current (n, m) shift.
      var b_match = 0 ;

      // Iterate through each of the transformed data points.
      for ( var g = 0 ; g < N ; g++ )
      {
        var i = check[ g ][ 0 ] ; // Transformed x-coordinate
        var j = check[ g ][ 1 ] ; // Transformed y-coordinate

        // Check if the block at (m+i, n+j) would be "B" (black) in the 'block' function.
        if ( "B" == block ( k , m + i , n + j ) )
        {
          b_match++ ; // Increment if it's a match.
        }
      }

      // Update the overall maximum match if the current 'b_match' is higher.
      if ( max_match < b_match )
      {
        max_match = b_match ;
      }

      // Optimization: If a perfect match (N) is found, no need to check further shifts for 'm'.
      if ( max_match == N )
      {
        break ;
      }
    }

    // Optimization: If a perfect match (N) is found, no need to check further shifts for 'n'.
    if ( max_match == N )
    {
      break ;
    }
  }


  // Output the final maximum match count.
  console.log ( '%s' , max_match ) ;
}


// Read input from standard input, decode it, split by newlines, and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ) ;