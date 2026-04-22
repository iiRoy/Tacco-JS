/*
 * This is a JavaScript file demonstrating a Type I clone.
 * The original code identifies adjacent differing characters in a string.
 * This version maintains exact semantic and structural identity,
 * only varying whitespace and comments.
 */

// Define the main function that processes the input
function     main   (   input   ) {

    // Extract the first line of input and split it into an array of characters.
    var   n    =   input  [  0  ] .  split   (   ""   )   ;

    // Initialize an answer counter. This will store the number of differing adjacent characters.
    var   ans    =   0   ;


    // Iterate through the character array, starting from the second character (index 1).
    for   (   var   i    =   1   ;    i   <   n  .  length   ;    i   ++   )   {
        // Check if the current character is different from the previous character.
        if   (   n  [  i   -   1  ]    !=    n  [  i  ]   )   {
            // If they are different, increment the answer counter.
            ans   ++   ; // Increment the count of differences
        }
        // This loop continues until all adjacent pairs have been checked.
    }

    // Output the final count of differing adjacent characters to the console.
    console  .  log   (   ans   )   ;

}

// This section handles reading input from standard input and calling the main function.
// It reads the entire standard input, converts it to UTF-8, trims whitespace,
// and splits it into an array of lines.
main   (   require  (  'fs'  )  .  readFileSync   (  '/dev/stdin'  ,   'utf8'  )  .  trim   (  )  .  split   (  "\n"  )   )   ;