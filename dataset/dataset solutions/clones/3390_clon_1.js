const   main =  input  =>   {
  /*
   * This function takes an input string representing a sequence of stones.
   * It simulates a process of swapping adjacent 'B' and 'W' stones.
   * The goal is to count how many passes are required until no more such swaps can be made.
   */

  // Convert the input string into an array of individual stone characters.
  // The spread operator `...` is used for this conversion.
  const  stones =  [ ...input ] ;

  // Initialize a counter to keep track of the number of iterations (swaps).
  let  counter = 0 ;

  // The main loop continues as long as the 'stones.some()' method returns true.
  // 'some' will return true if at least one element in the array satisfies the provided condition.
  while
  (
    stones.some
    (
      ( stone, i, a )  =>
      {
        /*
         * This callback function is executed for each stone in the 'stones' array.
         * 'stone' is the current element, 'i' is its index, and 'a' is the entire array.
         */

        // Check for the specific condition:
        // 1. We are not at the last element (to prevent out-of-bounds access for a[i + 1]).
        // 2. The current stone is 'B'.
        // 3. The next stone is 'W'.
        if  (
              i  <  a.length - 1
            &&  stone  ==  "B"
            &&  a[ i + 1 ]  ==  "W"
        )
        {
          // If the condition is met, perform a swap operation.
          // Array destructuring is used here to swap the elements efficiently.
          [ a[ i ], a[ i + 1 ] ]  =  [ a[ i + 1 ], a[ i ] ] ;

          // Return `true` to indicate that a swap occurred in this iteration of `some`.
          // This will cause the `while` loop to continue for another pass.
          return  true ;
        }
        // If no swap condition is met for the current element, `undefined` is implicitly returned,
        // which means `false` in the context of `some`, allowing it to check the next element.
      }
    )
  )
  {
    // If the `some` method returned true (meaning at least one swap happened),
    // increment the main counter for this pass.
    counter ++ ;
  }

  // After the `while` loop finishes (when no more 'B' followed by 'W' pairs can be swapped),
  // print the total number of passes/swaps performed.
  console.log( counter ) ;
} ;

/*
 * This section handles reading input from standard input and calling the main function.
 * It uses Node.js's 'fs' module to read the file synchronously.
 */
main
(
  require( "fs" ).readFileSync(
    "/dev/stdin", // Path for standard input on Unix-like systems.
    "utf8"       // Specify UTF-8 encoding for the input.
  )
) ;
// End of the program.