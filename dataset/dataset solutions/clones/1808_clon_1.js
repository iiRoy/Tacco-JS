/*
 * This is a Type I clone of the original JavaScript code.
 * The core logic and structure remain absolutely identical.
 * Only whitespace and comments have been extensively modified
 * to create a visually distinct but functionally equivalent version.
 */

// --- Function Definition Section ---

// Defines the primary execution function for this script.
// It takes a single string argument, expected to contain two numbers.
function     main   (   input   )   {

    // Destructures the input string into two separate constants, A and B.
    // The split operation uses a space character as a delimiter.
    const    [   A   ,   B   ]    =    input  .  split  (   ' '   )  ;

    // Outputs the product of the two parsed numbers (A and B) to the console.
    // JavaScript's type coercion will automatically convert the string numbers
    // to actual numbers for the multiplication operation.
    console  .  log  (   A   *   B   )  ;
}

// --- Script Execution Section ---

// Invokes the main function immediately.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
// This is a common pattern for competitive programming environments
// where input is provided via standard input.
main   (   require  (   'fs'   )   .   readFileSync  (   '/dev/stdin'   ,   'utf8'   )   )   ;

// --- End of File ---
/*
 * This marks the conclusion of the cloned JavaScript code.
 * No further executable statements are present below this point.
 */