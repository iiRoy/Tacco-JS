/* This is a Type I clone of the original JavaScript code.
   Extensive modifications have been made to whitespace and comments
   to demonstrate visual difference while maintaining exact
   structural and logical equivalence. */

function   Main( input )    {    // The primary execution function starts here.

    // First, process the raw input string: split by newlines and convert to numbers.
    input  =  input.split( "\n" ).map( Number ) ;


  input.shift( ) ;  // Remove the first element of the array. This is often 'N' in competitive programming.

  var   n    = arrsum( input ) ;   // Call a helper function 'arrsum' to calculate a modified sum of the array elements.

  // Now, determine the parity of the calculated sum 'n'.
  if  ( n % 2  ==  1 )     {  // If 'n' is an odd number (remainder of division by 2 is 1).
      console.log( "first" ) ;     // Output the string "first" to standard output.
  }
  else  {  // Otherwise, if 'n' is an even number.
      console.log( "second" ) ; // Output the string "second" to standard output.
  }
}

// Immediately invoke the Main function with input read from standard input.
// This part reads the file '/dev/stdin', decodes it as UTF-8, removes leading/trailing whitespace,
// and passes it to the Main function.
Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ).trim( ) ) ;


/* This is a helper function named 'arrsum'.
   It calculates a specific sum of elements within an array. */
function    arrsum( arr )   {
    var   sum   =   0 ;   // Initialize a variable 'sum' to zero to accumulate results.

    // Loop through each element of the input array 'arr'.
    // 'i' is the index, 'len' stores the array's length for efficient iteration.
    for  ( var  i = 0 , len = arr.length ;  i < len ;  ++i )   {
        sum  +=  arr[ i ] ;    // Add the current array element to 'sum'.

        // If the 'sum' becomes 2 or greater, apply a modulo 2 operation.
        // This effectively keeps the sum as either 0 or 1, representing parity.
        if ( sum >= 2 ) { sum %= 2 ; }
    } ; // The semicolon here is intentionally retained as per Type I cloning rules.

    return sum ;   // Return the final calculated sum (which will be 0 or 1).
}