/*
 * This is a JavaScript program demonstrating basic input processing
 * and conditional logic.
 *
 * The `main` function processes a string input, converts parts of it to integers,
 * and then performs a comparison to print the larger product.
 */

function   main   (   s   )
{
  // Split the input string 's' by spaces into an array of strings.
  // This assumes 's' contains space-separated values.
  s     =     s  .  split  (  " "  )  ;

  // Loop through the first four elements of the array 's'.
  // Convert each element from a string to an integer using parseInt().
  // The loop runs for i = 0, 1, 2, 3.
  for     (   var     i     =     0   ;   i     <     4   ;   i  ++   )
  {
    s  [  i  ]     =     parseInt  (  s  [  i  ]  )  ;   // Convert and assign back to the array.
  }

  // Calculate two products: s[0]*s[1] and s[2]*s[3].
  // Then, use a ternary operator to log the larger of the two products to the console.
  console  .  log  (
    (   s  [  0  ]     *     s  [  1  ]     >     s  [  2  ]     *     s  [  3  ]   )
      ?
    (   s  [  0  ]     *     s  [  1  ]   )
      :
    (   s  [  2  ]     *     s  [  3  ]   )
  )  ;

}   //   End   of   main   function  .


// This section handles reading input from standard input and calling the main function.
// It uses Node.js 'fs' module to read synchronously from /dev/stdin.
main   (
  require   (   'fs'   )
    .  readFileSync   (   '/dev/stdin'   ,   'utf8'   )
)  ;