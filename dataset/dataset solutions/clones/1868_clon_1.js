/*
 * This is a Type I clone of the original JavaScript source code.
 *
 * As per the definition, all identifiers, variable names, function names,
 * operators, and expressions are kept absolutely identical.
 *
 * Only whitespace (spaces, tabs, newlines, indentation) and comments
 * (additions, modifications, or removals of comments) have been altered
 * to create a visually distinct but logically equivalent representation.
 */

function   Main   (   input   )    {

    // First, the input string is split into an array of lines.
    // The newline character '\n' is used as the delimiter.
    const   lines    =    input.split   (   '\n'   )    ;


    /*
     * The first element of the 'lines' array is assigned to 's'.
     * This typically represents the primary string for comparison.
     */
    const   s    =    lines   [   0   ]    ;


    // The second element of the 'lines' array is assigned to 't'.
    // This typically represents the secondary string for comparison.
    const   t    =    lines   [   1   ]    ;


    // A new variable 'result' is declared to store the outcome.
    // It uses a ternary operator for a concise conditional assignment.
    // The condition checks if 's' is equal to 't' with its last character removed.
    // 't.slice(0, t.length - 1)' creates a new string from 't'
    // starting at index 0 and ending just before the last character.
    let   result    =    (   s    ==    t.slice   (   0   ,    t.length    -    1   )   )    ?    "Yes"    :    "No"    ;

    // This line was present in the original code, commented out.
    // It remains commented out here, consistent with Type I rules.
    // console.log("");

    // Finally, the calculated 'result' string is printed to the console.
    console.log   (   result   )    ;

}   // End of the Main function definition.


// This part of the code is responsible for reading input from standard in
// and then invoking the 'Main' function with that input.
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,    "utf8"   )   )    ;

/*
 * End of generated Type I code clone.
 * All original logic and structure are preserved.
 */