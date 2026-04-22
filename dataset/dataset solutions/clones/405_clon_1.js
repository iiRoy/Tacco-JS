#!/usr/bin/node
// This script is designed to process numerical input from stdin.
// It uses a custom sequence 'a' for calculations based on the input values.

( /* Start of self-executing anonymous function block */ function ( ) {

  // Declare an array 'T' to store integer values parsed from stdin.
  // It is initialized as an empty array.
  var   T   =   [   ]   ;

  // Obtain a reference to the standard input stream.
  // This allows reading data provided to the script.
  var   stdin   =   process.openStdin   (   )   ;

  // Configure the standard input stream to interpret incoming data as UTF-8 encoded text.
  stdin.setEncoding (   'utf8'   )   ;


  // Initialize an array 'a' with the first three terms of a custom numerical sequence.
  // This sequence will be extended based on a specific recurrence relation.
  var   a   =   [   1   ,   1   ,   2   ]   ;

  // Populate the array 'a' with additional terms up to the 31st element (index 30).
  // Each new term is the sum of the three preceding terms: a[i] = a[i-1] + a[i-2] + a[i-3].
  for   (   var   i   =   3   ;   i   <   31   ;   i   ++   )
  {
    // Calculate the next term and append it to the array 'a'.
    a.push   (   a   [   i   -   1   ]   +   a   [   i   -   2   ]   +   a   [   i   -   3   ]   )   ;
  }


  // Initialize a string variable to buffer potentially incomplete lines from stdin.
  // This handles cases where data arrives in chunks that don't perfectly align with newlines.
  var   input_fragment   =   ""   ;

  // Register an event listener for the 'data' event on the standard input stream.
  // This function executes every time a chunk of data is received from stdin.
  stdin.on   (   'data'   ,   function   (   input   )
  {
    // Concatenate any previous incomplete input fragment with the newly received data.
    // Then, split the combined string into an array of lines based on newline characters.
    var   ref   =   (   input_fragment   +   input   )   .   split   (   "\n"   )   ;

    // The last element of the 'ref' array might be an incomplete line.
    // We remove it from 'ref' and store it in 'input_fragment' for the next 'data' event.
    input_fragment   =   ref.pop   (   )   ;

    // Iterate through each complete line that was successfully extracted from the input.
    for   (   var   i   =   0   ;   i   <   ref.length   ;   i   ++   )
    {
      // If a line is empty, skip it and proceed to the next line.
      if   (   ref   [   i   ]   ==   ''   )
      {
        continue   ;
      }
      // Convert the non-empty line (which is expected to be a number string) to an integer.
      // The bitwise XOR with 0 (ref[i] ^ 0) is used as a concise way for type coercion to an integer.
      // Then, push this integer into the 'T' array.
      T.push   (   ref   [   i   ]   ^   0   )   ;
    }
  }   )   ;


  // Register an event listener for the 'end' event on the standard input stream.
  // This function executes once all data has been received from stdin and the stream is closed.
  stdin.on   (   'end'   ,   function   (   z   )
  {
    // Iterate through each integer stored in the 'T' array.
    // The loop continues as long as the element T[i] is defined and not zero (truthy).
    for   (   var   i   =   0   ;   T   [   i   ]   ;   i   ++   )
    {
      // Perform a specific calculation using the value from 'a' array at index T[i].
      // The result is then divided by 3650, and the fractional part is truncated using bitwise XOR with 0.
      // This final integer result is printed to the console.
      console.log   (   (   a   [   T   [   i   ]   ]   +   3649   )   /   3650   ^   0   )   ;
    }
  }   )   ;

} ) ( ) ; // End of IIFE execution