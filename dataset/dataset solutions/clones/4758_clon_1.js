// This script processes input from standard input.
process . stdin . resume ( ) ; // Ensure the standard input stream stays open.


process . stdin . setEncoding ( 'utf8' ) ; // Set the character encoding for incoming data.


// This section handles incoming data.
process . stdin . on ( 'data',  function ( chunk )  {
  // Convert the input chunk to a string and split it into lines.
  var   lines   =   chunk . toString ( ) . split ( '\n' ) ;

  // Parse the first line as an integer 'n'.
  var n = parseInt ( lines [ 0 ] ) ;


  // The second line 'm' is treated as a string.
  var m = lines [ 1 ] ;

  // Initialize a 'value' counter.
  var value = 0 ;


  // Initialize 'max' to keep track of the maximum 'value'.
  var max = 0 ;


  // Begin a loop that iterates 'n' times.
  for ( i = 0 ; i < n ; i ++ )
  {
    // Check the character at the current index 'i' in string 'm'.
    if ( m . charAt ( i ) ==　"I" )
    {
      // If the character is "I", increment 'value'.
      value = ++ value ;

      // Check if the current 'value' exceeds the 'max' recorded so far.
      if ( value > max )
      {
        // If it does, update 'max'.
        max = value ;
      } // End of inner if block.
    }
    else
    {
      // If the character is not "I", decrement 'value'.
      value = -- value ;
    } // End of outer if-else block.
  } // End of for loop.


  // Output the final maximum value to the console.
  console . log ( max ) ;

} ) ; // End of data event handler.