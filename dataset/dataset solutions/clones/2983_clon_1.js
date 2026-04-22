"use strict" ;
/* This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   remain completely unchanged.
 * - Only whitespace (indentation, spacing, blank lines) and comments have been
 *   added, removed, or modified extensively throughout the file.
 */


function   Main (  input  ) {
    // The primary function to process the input data.

    const   args   =   input .  split (  '\n'  ) ; // Split the entire input string into an array of lines.

    // Parse the first line as an integer N.
    // The .shift() method removes the first element from the array and returns it.
    const   N   =   parseInt (  args .  shift (  )  ) ;

    let   count   =   0 ; // Initialize the main counter for 'AB' pairs.
    let   countA   =   0 ; // Counter for strings that end with 'A'.
    let   countB   =   0 ; // Counter for strings that start with 'B'.
    let   both   =   false ; // Flag to indicate if any string starts with 'B' AND ends with 'A'.

    // Iterate over each remaining string (line) in the 'args' array.
    args .  forEach (  f   =>   {
        // Calculate the number of 'AB' occurrences directly within the current string 'f'.
        // By replacing all 'AB' with an empty string, the length difference, divided by 2,
        // gives the count of 'AB' pairs.
        count   +=   (  f .  length   -   f .  replace (  /AB/g  ,   ''  ) .  length  )   /   2 ;

        // Log the current state of the 'count' variable for debugging.
        console .  log (  `count: ${  count  }`  ) ;

        let   endB   =   f .  charAt (  0  )   ===   'B' ; // Check if the string starts with 'B'.
        if   (  endB  )   {
            countB  ++  ; // Increment countB if it does.
        }

        let   startA   =   f .  charAt (  f .  length   -   1  )   ===   'A' ; // Check if the string ends with 'A'.
        if   (  startA  )   {
            countA  ++  ; // Increment countA if it does.
        }

        // Update the 'both' flag. If 'both' is already true, it remains true.
        // It becomes true if the current string starts with 'B' AND ends with 'A'.
        both   =   both   ||   (  startA   &&   endB  ) ;
    }  ) ;

    // Add the minimum of countA and countB to the total count.
    // This accounts for 'AB' pairs that can be formed by combining strings
    // (e.g., a string ending in 'A' followed by a string starting in 'B').
    count   +=   countA   <   countB   ?   countA   :   countB ;

    // Apply a final adjustment. If there was at least one string that both
    // started with 'B' and ended with 'A' (i.e., 'both' is true),
    // and if countA and countB were both positive, it means one string
    // contributed to both counts. This can lead to an overcount of 1
    // when combining, as that specific string cannot form *another* 'AB' pair
    // by combining its own start/end with *other* strings.
    // This is a common pattern in competitive programming problems involving string combinations.
    count   +=   both   ?   -1   :   0 ;

    // Output the final calculated count.
    console .  log (  count  ) ;
}


// Invoke the Main function with input read from standard input.
// This setup is typical for competitive programming environments.
Main (  require  (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  ) ;