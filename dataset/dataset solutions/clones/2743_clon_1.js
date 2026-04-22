/*
 * This JavaScript file contains the implementation of the Main function,
 * which processes input to solve a specific problem.
 *
 * The problem involves managing 'colors' based on a sequence of numbers.
 * The core logic identifies and updates existing 'color' entries or creates new ones.
 * This is a Type I clone, meaning only whitespace and comments are altered.
 */

function Main ( input )
{ // Define the main function that takes 'input' as an argument.

  // First, process the raw input string: split it into an array of lines.
  input = input.split( "\n" ) ;

  // Parse the first line to get the total number of elements, N.
  const N = parseInt( input[ 0 ] ) ;

  // Extract the remaining lines and convert them to an array of integers, As.
  const As = input.slice( 1 ).map( x => parseInt( x ) ) ;

  // Initialize a Map to store 'colors'. The key will be a color ID, and the value will be the 'color' value.
  var colors = new Map( ) ;

  // Set the initial color: color ID 0 with the value of the first element in As.
  colors.set( 0 , As[ 0 ] ) ;

  // Initialize a counter for color IDs.
  var colorId = 0 ;

  // Iterate through the array 'As' starting from the second element (index 1).
  // This loop processes each subsequent element to determine its color assignment.
  for ( i = 1 ; i < N ; i ++ )
  {

    // Variable to hold the ID of the color to be updated, initialized to null.
    var nowColorId = null ;

    // Convert the 'colors' Map entries into an array for easier iteration.
    var colorarray = [ ... colors.entries( ) ] ;

    // Inner loop: Iterate through the existing color IDs to find a suitable color to update.
    for ( j = 0 ; j <= colorId ; j ++ )
    {
      // Check if the current color's value (colorarray[j][1]) is less than the current element (As[i]).
      if ( colorarray[ j ][ 1 ] < As[ i ] )
      {
        // If a suitable color is found, store its ID and break the inner loop.
        nowColorId = colorarray[ j ][ 0 ] ;
        break ; // Exit the inner loop as a match is found.
      }
    }

    // After the inner loop, decide whether to create a new color or update an existing one.
    if ( nowColorId == null )
    {
      // If no suitable color was found, increment the color ID counter.
      colorId ++ ;
      // Assign the current element (As[i]) to this new color ID.
      colors.set( colorId , As[ i ] ) ;
    }
    else
    {
      // If a suitable color ID was found, update its value with the current element (As[i]).
      colors.set( nowColorId , As[ i ] ) ;
    }

    // Re-sort the 'colors' Map entries based on their values in descending order.
    // This step is crucial for maintaining the problem's specific logic.
    colors = new Map( [ ... colors.entries( ) ].sort( ( a , b ) => b[ 1 ] - a[ 1 ] ) ) ;
  }

  // Finally, print the total number of distinct colors plus one.
  // This represents the final count of color groups.
  console.log( colorId + 1 ) ;

} // End of the Main function definition.


// This section handles the execution of the Main function,
// reading input from standard input (/dev/stdin) in a Node.js environment.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;