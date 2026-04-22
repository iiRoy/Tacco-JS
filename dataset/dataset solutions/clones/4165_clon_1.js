"use strict"
;

// This is a Type I clone, focusing on extensive whitespace and comment variations.
// The core logic and identifiers remain absolutely identical.

/*
 * This is the primary function definition for the application.
 * It is named 'main' and accepts a single parameter, 'input', which is expected to be a string.
 */
var   main   =   function   main   (   input   )
{

  // First, the input string is split into an array of individual characters.
  // Each character becomes an element in 'input_arr'.
  var   input_arr   =   input.split   (   ""   )
  ;


  /*
   * Next, we filter the 'input_arr' to create a new array, 'one'.
   * This new array 'one' will contain only those elements from 'input_arr'
   * that are numerically equal to 1.
   * The anonymous function passed to 'filter' defines the testing criterion.
   */
  var   one   =   input_arr.filter   (
    function   (   elem   )
    {
      // The comparison 'elem == 1' uses loose equality, which means
      // the string character '1' will match the number 1.
      return   elem   ==   1
      ;
    }
  )
  ;

  // Finally, the length of the 'one' array is logged to the console.
  // This count represents how many times the character '1' appeared in the original input string.
  console.log   (   one.length   )
  ;

}
;


/*
 * This is the entry point for executing the 'main' function.
 * It reads the entire content of '/dev/stdin' as a UTF-8 encoded string.
 * The 'require('fs')' call loads the Node.js file system module.
 * 'readFileSync' synchronously reads the file.
 * The resulting string is then passed as the 'input' argument to the 'main' function.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )
;

// End of clone. Note the consistent identifier usage throughout.