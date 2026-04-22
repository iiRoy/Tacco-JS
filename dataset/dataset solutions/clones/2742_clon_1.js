/* This function processes the input to solve a specific problem.
   It appears to be related to finding the longest increasing subsequence
   using a greedy approach, often referred to as Dilworth's Theorem
   or a variation for LIS.
*/
function Main ( input )
{
  // Split the input string by newline characters to get an array of lines.
  input = input.split( "\n" ) ;

  // Parse the first line as the total number of elements.
  const N = parseInt( input[ 0 ] ) ;

  // Extract the array of numbers from the input, excluding the first line.
  // Each element is parsed as an integer.
  const As = input.slice( 1 ) .map( x => parseInt( x ) ) ;


  // Initialize an object to store colors (or piles/stacks).
  // The key represents the color ID, and the value is the top element of that color.
  var colors = { 0 : As[ 0 ] } ;

  // Initialize the color ID counter.
  var colorId = 0 ;


  // Iterate through the input array starting from the second element.
  for ( i = 1 ; i < N ; i++ )
  {
    // Initialize a variable to track the best color ID for the current element.
    var nowColorId = null ;

    // Loop through existing colors/piles.
    for ( j = 0 ; j <= colorId ; j++ )
    {
      // Check if the current element 'As[i]' can be placed on top of 'colors[j]'.
      // It can be placed if 'colors[j]' is smaller than 'As[i]'.
      // Also, find the 'colors[j]' that is the smallest among those that 'As[i]' can be placed on.
      if ( colors[ j ] < As[ i ] && ( nowColorId == null || colors[ nowColorId ] < colors[ j ] ) )
      {
        nowColorId = j ; // Update the best color ID found so far.
      }
    }


    // If no suitable color/pile was found (i.e., 'As[i]' cannot be placed on any existing pile).
    if ( nowColorId == null )
    {
      colorId++ ; // Create a new color/pile.
      colors[ colorId ] = As[ i ] ; // Place 'As[i]' on the new color/pile.
    }
    else // If a suitable color/pile was found.
    {
      colors[ nowColorId ] = As[ i ] ; // Place 'As[i]' on that color/pile, effectively updating its top.
    }
  }

  // The number of colors/piles (colorId + 1) represents the length of the longest increasing subsequence.
  console.log( colorId + 1 ) ;
}

// Call the Main function with input read from stdin.
Main( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) ) ;