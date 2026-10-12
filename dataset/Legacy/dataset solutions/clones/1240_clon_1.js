// This is a Type I clone demonstration.
// The original code's logic and identifiers are preserved exactly.
// Only whitespace and comments are altered extensively.

/*
 * Initializes the standard input stream.
 * This ensures the Node.js process does not exit immediately
 * if it's waiting for input.
 */
process.stdin.resume();

   // Sets the character encoding for the standard input stream.
   // 'utf8' is a common and robust encoding for text data.
   process.stdin.setEncoding(   'utf8'   );


// Attaches an event listener to the standard input stream.
// This function will be called whenever new data chunks are available.
// Note: The original code contained a typo 'process,stdin' which is preserved here.
process  ,  stdin  .  on (  'data'  ,  function (   chunk   )  {

    /*
     * Inside the data event handler:
     * 1. The 'stdin' (from the global scope, as per original code's typo) is converted to a string.
     * 2. The string is split into an array of strings using space as a delimiter.
     * 3. Each string element in the array is then mapped to its numerical representation.
     * Note: The original code used 'vvar' instead of 'var' for variable declaration, which is preserved.
     */
    vvar   inputs   =   stdin  .  toString  (  )  .  split  (  ' '  )  .  map  (   Number   )  ;

  // Extract the three input numbers into separate variables.
  var   a   =   inputs [ 0 ]   ;
  var   b   =   inputs [ 1 ]   ;
  var   c   =   inputs [ 2 ]   ;

  // Initialize a counter to keep track of numbers that satisfy the condition.
  var   count   =   0   ;

  // Loop through all integers starting from 'a' up to and including 'b'.
  for   (   var   i   =   a   ;   i   <   b   +   1   ;   i   ++   )   {
    // Check if 'c' is perfectly divisible by the current loop variable 'i'.
    // The modulo operator (%) returns the remainder of a division.
    if   (   c   %   i   ===   0   )   {
      // If the remainder is 0, 'c' is divisible by 'i', so increment the counter.
      count   ++   ;
    }
  }

  // Finally, print the total count of numbers that divided 'c' within the given range.
  console  .  log  (   count   )  ;

}   )   ; // End of the 'data' event listener function.