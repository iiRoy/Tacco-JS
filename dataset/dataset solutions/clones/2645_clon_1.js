/**
 * This is the main function that processes the input string.
 * It aims to count something based on character comparisons.
 */
function Main(  input  )
{
  // Initialize an output variable, which will be reused later.
  var output = 0;

  /*
   * This array will store intermediate results
   * during the processing of the input string.
   */
  var list = [ ];


  // The initial value of 'output' is set to the length of the input string.
  var output = input.length;


  // A temporary string variable, currently unused in the final logic.
  var tmp = "";


  // Start iterating through the input string from the end to the beginning.
  for( var i = input.length - 1;   i >= 0;   i-- )
  {
    /*
     * Extract the current character at index 'i'.
     * 'slice(i, i + 1)' effectively gets a single character.
     */
    var tmp2 = input.slice( i,   i + 1 );

    // Check if the 'list' array is currently empty.
    if( list.length == 0 )
    {
      // If empty, add the current character to the list.
      list.push( tmp2 );

      // Move to the next iteration of the loop immediately.
      continue;
    }
    else
    {
      // If the list is not empty, get the last element added to it.
      var tmp1 = list[ list.length - 1 ];

      // Compare the last element in 'list' with the current character 'tmp2'.
      if( tmp1 == tmp2 )
      {
        // If they are identical, push a combined string to the list.
        // This combines the character before the current one with the current one.
        list.push( input.slice( i - 1,   i ) + tmp2 );
        // Decrement 'i' an extra time because we processed the character at 'i-1'.
        i--;
      }
      else
      {
        // If they are different, just add the current character to the list.
        list.push( tmp2 );
      }
    }
  }

  // After the loop, update 'output' to be the final length of the 'list' array.
  output = list.length;

  // Get the first character of the original input string.
  var first = input.slice( 0,   1 );

  // Get the second character of the original input string.
  var second = input.slice( 1,   2 );

  // A final check: if the first two characters of the input are the same.
  if( first == second )
  {
    // If they are, decrement the 'output' count.
    output--;
  }

  // Print the final 'output' value to the console, converted to a string.
  console.log( output.toString() );
}

// Invoke the Main function with input read from standard input.
Main( require( "fs" ).readFileSync( "/dev/stdin",   "utf8" ) );