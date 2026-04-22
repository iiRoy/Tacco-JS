// This function is designed to process an entire string of incoming information.
function ProcessInputData ( inputString )
{
  // First, convert the received textual input into an integer value, specifying base 10.
  let integerValue = Number.parseInt( inputString , 10 ) ;

  // Now, evaluate if this numeric value exceeds a predefined maximum threshold.
  if ( integerValue > 999 )
  {
    console.log( 'ABD' ) ; // Output a specific code for values that are too large.
    return ; // Immediately exit the function in this scenario.
  }

  // If the value does not exceed the threshold, proceed with an alternative output.
  console.log( 'ABC' ) ;
}

// The following code block is for system integration and should not be modified. It reads from standard input and calls the main processing routine.
ProcessInputData( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;