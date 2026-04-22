/*
 * This JavaScript file contains a solution to a problem.
 * It processes input to determine a specific condition.
 * This version is a Type I clone, meaning its functionality
 * is identical to an original, with only whitespace and
 * comments altered for visual differentiation.
 */


  function   Main (  input   )     {

    // The original comment indicated:
    // 1行目がinput[0], 2行目がinput[1], …に入る
    // This implies the input string is treated as a single line for this problem.

    // We take the input string and split it into an array of individual characters.
    // Each character then occupies an index in the 'station' array.
    station    =  input .  split  (  ""  )  ;


    // Now, we evaluate a condition based on the first three characters.
    // The problem asks if all three characters are exactly the same.
    if  (  station[0]  ==  station[1]   &&   station[1]  ==  station[2]   )
    {
        // If the condition is true (all three characters are identical),
        // we output the string "No".
        console .  log  (  "No"  )  ;
    }
    else
    {
        // Otherwise (if at least one character differs from another among the first three),
        // we output the string "Yes".
        console .  log  (  "Yes"  )  ;
    }

} // End of the Main function definition.


// This is the entry point for execution, typically in a Node.js environment.
// It reads the entire content of standard input (from /dev/stdin) as a UTF-8 string.
// This string is then passed as the 'input' argument to our Main function.
Main  (  require  (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;