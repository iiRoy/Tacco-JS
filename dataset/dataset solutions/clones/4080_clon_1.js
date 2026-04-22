/*
 * This file contains a Type I clone of a JavaScript program.
 * Type I clones are identical code fragments,
 * allowing only variations in whitespace and comments.
 * All identifiers, operators, and expressions remain unchanged.
 */

// Function to determine the color of a block in a grid pattern.
// c: initial color ("B" or "W")
// k: size of the repeating block
// i, j: coordinates within the larger grid
function block( c , k , i , j )
{
  // Check if coordinates (i, j) fall within the first block type (0 <= i < k, 0 <= j < k)
  if ( 0 <= i && i < k && 0 <= j && j < k )
  {
    return c ; // Return the initial color for this block type
  }
  // Check if coordinates (i, j) fall within the second block type (k <= i < 2*k, k <= j < 2*k)
  else if ( k <= i && i < 2 * k && k <= j && j < 2 * k )
  {
    return c ; // Return the initial color for this block type
  }
  // Check if coordinates (i, j) fall within the third block type (2*k <= i < 3*k, 0 <= j < k)
  else if ( 2 * k <= i && i < 3 * k && 0 <= j && j < k )
  {
    return c ; // Return the initial color for this block type
  }
  // If none of the above conditions are met, invert the initial color
  return c == "B" ? "W" : "B" ;
}


// Main function to process input and calculate the maximum matches
function Main( input )
{
  // Parse the first line of input to get N and k
  var   head  = input[ 0 ] . split ( " " ) ;

  var   N     = parseInt( head[ 0 ] , 10 ) ; // N: number of data points
  var   k     = parseInt( head[ 1 ] , 10 ) ; // k: block size

  // Array to store processed coordinates and colors
  var   check = [ ] ;

  // Loop through each data point from the input
  for ( var i = 1 ; i <= N ; i++ )
  {
    var   tmp   = input[ i ] . split ( " " ) ; // Split the current line
    var   x     = parseInt( tmp[ 0 ] , 10 ) ; // x-coordinate
    var   y     = parseInt( tmp[ 1 ] , 10 ) ; // y-coordinate
    var   c     = tmp[ 2 ] ;                  // Color ("B" or "W")

    // console.log('Original coordinates and color: %s %s %s', x, y, c);

    // Calculate normalized coordinates within a k x k grid
    var   new_x = x % k ;
    var   new_y = y % k ;

    // console.log('Normalized coordinates: %s %s', ((x - new_x) / k) % 2, ((y - new_y) / k) % 2);

    // Determine the pattern type ("R" for reversed, "N" for normal)
    // This checks if the current k x k block is "inverted" based on its position in the larger grid
    var   pattern = (
                     ( ( x - new_x ) / k ) % 2
                     + ( ( y - new_y ) / k ) % 2
                    ) % 2 == 1 ? "R" : "N" ;

    // console.log('Calculated pattern: %s', pattern);

    var   new_c = c ; // Initialize new_c with the original color

    // If the pattern is "R" (reversed), invert the color
    if ( pattern == "R" )
    {
      new_c = new_c == "B" ? "W" : "B" ;
    }

    // console.log('Color after pattern adjustment: %s %s %s', new_x, new_y, new_c);

    // If the color is "W", convert it to "B" and adjust new_x to effectively shift it
    // This maps all 'W' points to an equivalent 'B' point in an adjacent block
    if ( new_c == "W" )
    {
      new_c = "B" ; // Change color to Black
      new_x += k ;  // Shift x-coordinate by k
    }

    // console.log('Final adjusted coordinates and color: %s %s %s', new_x, new_y, new_c);

    // Store the processed data (new_x, new_y, new_c) in the check array
    check[ i - 1 ]      = [ ] ;
    check[ i - 1 ][ 0 ] = new_x ;
    check[ i - 1 ][ 1 ] = new_y ;
    check[ i - 1 ][ 2 ] = new_c ;
  }

  // console.log('Processed check array:', check);

  var   max_match = 0 ; // Variable to store the maximum number of matches found

  // Iterate over all possible 2k x 2k starting positions for the reference block
  // This effectively shifts the entire grid of blocks
  // m: x-offset for the reference block
  for ( var m = 0 ; m < 2 * k ; m++ )
  {
    // n: y-offset for the reference block
    for ( var n = 0 ; n < 2 * k ; n++ )
    {
      var   b_match = 0 ; // Counter for matches with 'B' as the base color
      var   w_match = 0 ; // Counter for matches with 'W' as the base color

      // Iterate through each processed data point (x, y, c)
      for ( var g = 0 ; g < N ; g++ )
      {
        var   i = check[ g ][ 0 ] ; // Normalized x-coordinate
        var   j = check[ g ][ 1 ] ; // Normalized y-coordinate

        // Check if the point's color matches if the base color is "B"
        if ( check[ g ][ 2 ] == block( "B" , k , m + i , n + j ) )
        {
          b_match++ ;
        }
        // Check if the point's color matches if the base color is "W"
        if ( check[ g ][ 2 ] == block( "W" , k , m + i , n + j ) )
        {
          w_match++ ;
        }
      }

      // console.log('Matches for offset (m=%s, n=%s): B_match=%s, W_match=%s', m, n, b_match, w_match);

      // Update max_match if b_match is greater
      if ( max_match < b_match )
      {
        max_match = b_match ;
      }
      // Update max_match if w_match is greater
      if ( max_match < w_match )
      {
        max_match = w_match ;
      }

      // If max_match already equals N, no need to check further, all points match
      if ( max_match == N )
      {
        break ;
      }
    }
    // If max_match already equals N, break the outer loop as well
    if ( max_match == N )
    {
      break ;
    }
  }

  // Output the final maximum number of matches
  // console.log('Final max_match: %s', max_match);
  console.log( '%s' , max_match ) ;
}

// Read input from stdin, split by newlines, and pass to the Main function
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) . split( "\n" ) ) ;