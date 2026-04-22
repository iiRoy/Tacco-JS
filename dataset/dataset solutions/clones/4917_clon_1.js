/*
 * This is an extensively modified Type I clone of the original JavaScript code.
 *
 * According to the Type I definition:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression remains completely unchanged.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments
 * (added, removed, or modified) have been altered throughout the file
 * to create a visually distinct, yet logically and structurally identical, clone.
 */
function   Main (  s  )   {

    // Declare a constant variable 'n' to hold the length of the input string 's'.
    const   n   =   s  .  length  ;

    /*
     * Initialize a counter variable 'p'.
     * This variable will be used to count specific character occurrences.
     * It starts with an initial value of zero.
     */
    var     p     =   0   ;


    // Start a loop to iterate through each character of the string.
    // The loop variable 'i' goes from the first character (index 0)
    // up to, but not including, the length of the string 'n'.
    for  (  var   i   =   0  ;     i   <   n  ;     i  ++  )    {

        // Inside the loop, check if the character at the current index 'i'
        // of the string 's' is strictly equal to the lowercase letter "p".
        if  (  s  [  i  ]   ===   "p"  )   p  ++  ;   // If it is "p", increment the counter 'p' by one.

    }   // The loop finishes after checking all characters.


    /*
     * After the loop, calculate the final result.
     * The calculation involves:
     * 1. Dividing the string length 'n' by 2.
     * 2. Subtracting the count of 'p' characters from the result of step 1.
     * 3. Using Math.floor() to round down the final result to the nearest integer.
     * The calculated value is then printed to the console.
     */
    console  .  log  (  Math  .  floor  (  n   /   2   -   p  )  )  ;

}   // End of the 'Main' function definition.


/*
 * This section of the script is responsible for executing the 'Main' function.
 * It first uses Node.js's 'fs' module to synchronously read the content
 * of the standard input file ("/dev/stdin").
 * The read content is expected to be UTF-8 encoded.
 * Finally, the .trim() method is called to remove any leading or trailing
 * whitespace (like newlines) from the input string before passing it
 * as an argument to the 'Main' function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,   "utf8"  )  .  trim  (  )  )  ;