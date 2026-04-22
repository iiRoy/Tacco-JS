/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes a main function for processing input and a helper debug function.
 */

// Define the primary function that processes the given input string.
function Main( input )
{
  // Split the input string by newline characters into an array of strings.
  input = input.split( "\n" ) ;

  // Parse the first element of the input array as an integer to get N.
  var N = parseInt( input[0] ) ;

  // Remove the first element (which was N) from the input array.
  input.shift() ;

  /*
   * Remove elements from the input array starting at index N
   * up to the end of the array.
   */
  input.splice( N , input.length ) ;


  // Map and sort array A based on the first part of each input line.
  var A = input
            .map( i => parseInt( i.split( " " )[0] ) )
            .sort() ;

  /*
   * Map and sort array B based on the second part of each input line,
   * then reverse the order.
   */
  var B = input
            .map( i => parseInt( i.split( " " )[1] ) )
            .sort()
            .reverse() ;


  // Check if N is an even number.
  if ( N % 2 == 0 )
  {
    // Calculation for even N.
    var ans = ( B[ N / 2 - 1 ] - A[ N / 2 - 1 ] ) * 2 - 1 ;
  }
  else
  {
    // Calculation for odd N. Using Math.floor for integer division.
    var ans = ( B[ Math.floor( N / 2 ) ] - A[ Math.floor( N / 2 ) ] ) + 1 ;
  }


  // Output the final answer to the console.
  console.log( '%s' , ans ) ;

  // Return the calculated answer.
  return ans ;
}


// This function is for debugging purposes, typically used in a web environment.
function debug( n )
{
  // Retrieve input value from a specific DOM element.
  var input = document.getElementById( "input" + n ).value ;

  // Call the Main function with the retrieved input.
  var ans = Main( input ) ;

  // Initialize result as "WA" (Wrong Answer).
  var result = "WA" ;

  /*
   * Compare the calculated answer with the expected output from another
   * DOM element.
   */
  if ( ans == document.getElementById( "output" + n ).value.split( "\n" )[0] )
  {
    // If they match, set result to "AC" (Accepted).
    result = "AC" ;
  }

  // Display the result in a specific DOM element.
  document.getElementById( "result" + n ).innerHTML = result ;
}


/*
 * Execute the Main function, reading input from standard input
 * using Node.js file system module.
 */
Main( require( "fs" )
        .readFileSync( "/dev/stdin" , "utf8" ) ) ;