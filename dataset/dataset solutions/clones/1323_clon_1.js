/* This is a Type I clone of a JavaScript program.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered. Only spacing, indentation, and comments are changed
 * extensively to make the code visually different.
 */

'use strict'; // Enforce strict mode for cleaner code execution.

    (  function   (  stdin  )   {

        // Convert the input buffer received via stdin to a string.
        var   lines   =   stdin  .  toString   (  )   ;


        var   result   =   (  function   (  data  )   {
            // The first element of the processed data array is the word to search for.
            // It's converted to lowercase for case-insensitive comparison later.
            var   word   =   data  .  shift   (  )  .  toLowerCase   (  )   ;

            // Process the remaining elements of the 'data' array:
            // 1. Join them into a single string without separators.
            // 2. Split this string by spaces to get an array of individual words.
            // 3. Filter this array to keep only those words that, when converted to lowercase,
            //    exactly match the 'word' we are searching for.
            // 4. Finally, get the total count (length) of the matching words.
            return   data  .  join   (  ''  )  .  split   (  ' '  )  .  filter   (  function   (  v  )   {
                return   v  .  toLowerCase   (  )   ===   word   ;
            }  )  .  length   ;

        }  (   /* This immediately-invoked function expression (IIFE)
                 * is responsible for parsing and processing the input data. */
            lines  .  split   (  'END_OF_TEXT'  )   [  0  ]  .  trim   (  )  .  split   (  '\n'  )
        )   )   ; // End of the IIFE that calculates the result.

        // Output the final computed count of matching words to the console.
        console  .  log   (  result  )   ;

    }  (   /* The entire script is wrapped in an IIFE (Immediately Invoked Function Expression).
             * This IIFE takes the standard input content as its argument.
             * It reads the content of '/dev/stdin' using Node.js's 'fs' module. */
        require   (  'fs'  )  .  readFileSync   (  '/dev/stdin'  ,   'utf8'  )
    )   )   ; // End of the main IIFE that encapsulates the program logic.