/*
 * This is a JavaScript program designed to process some input data.
 * The primary goal is to identify and process substrings based on specific criteria.
 * It reads input, performs validation, extracts substrings, and then outputs a specific one.
 */
function     Main   (  input   )   {

    // Step 1: Process the raw input.
    // The input string is expected to be multi-line, so we split it by newline characters.
    input  =  input.split  (  "\n"  )   ;


    /*
     * Step 2: Extract and prepare the main string for substring generation.
     * We take the first element from the split input array,
     * ensure it's treated as a string (though it likely already is),
     * and convert it to lowercase for case-insensitive processing later if needed.
     */
    var   string   =   input   [   0   ]   .toString   (   )   .toLowerCase   (   )   ;

    // Step 3: Extract and parse the integer 'K' from the second line of input.
    // 'K' will be used to select a specific substring later.
    var   K   =   parseInt   (   input   [   1   ]   )   ;

    // Step 4: Determine the length of the processed string.
    // This value will be used as an upper bound for loop iterations.
    var   substringCounts   =   string   .length   ;


    // --- Input Validation Checks ---

    // Validate the length of the input string.
    // The problem constraints typically specify a range, e.g., 1 to 5000 characters.
    if   (   substringCounts   <   1   ||   5000   <   substringCounts   )
    {
        // If the string length is outside the valid range, terminate execution.
        return   ;
    }


    // Validate the value of 'K'.
    // 'K' also often has constraints, for example, between 1 and 5.
    if   (   K   <   1   ||   5   <   K   )
    {
        // If 'K' is outside its valid range, terminate execution.
        return   ;
    }

    // --- Initialization for Substring Processing ---

    // Initialize an empty array named 'stacks'.
    // In a complete implementation, this array would likely store unique substrings.
    var   stacks   =   [   ]   ;

    // Declare a temporary variable to hold each substring as it is generated.
    var   _substr   =   ''   ;


    // --- Nested Loops for Substring Generation ---

    // The outer loop iterates through all possible starting indices 'i' for a substring.
    for   (   var   i   =   0   ;   i   <=   substringCounts   ;   i   ++   )
    {
        // The inner loop iterates through all possible ending indices 'j' for a substring,
        // starting from the current 'i'.
        for   (   var   j   =   i   ;   j   <=   substringCounts   ;   j   ++   )
        {
            // Extract the substring from 'string' using the current 'i' and 'j'.
            // The substring method extracts characters from 'i' up to (but not including) 'j'.
            _substr   =   string   .substring   (   i   ,   j   )   ;

            /*
             * IMPORTANT NOTE: The following block of code is commented out.
             * This means that 'stacks' array will remain empty throughout the loops
             * unless there's other logic not shown or intended.
             * If this block were active, it would add unique, non-empty substrings to 'stacks'.
             *
             * // if the substring is not already in 'stacks' and is not an empty string,
             * // then add it to the 'stacks' array.
             * // if (!stacks.includes(_substr) && _substr !== '')
             * //     stacks.push(string.substring(i, j));
             */
        }
    }


    // --- Final Processing and Output ---

    // Sort the 'stacks' array lexicographically (alphabetically).
    // Given the commented-out code above, 'stacks' will be empty at this point,
    // so sorting an empty array has no effect.
    stacks   .sort   (   )   ;

    // Print the (K-1)-th element of the sorted 'stacks' array.
    // Since 'K' is typically 1-indexed in problem statements, we use 'K - 1'
    // to access the correct 0-indexed element.
    // If 'stacks' is empty, accessing stacks[K-1] will result in 'undefined'.
    console   .log   (   "%s"   ,   stacks   [   K   -   1   ]   )   ;

}


// --- Program Entry Point: Invoking the Main function ---

/*
 * This line is responsible for reading input when the script is run in a typical
 * competitive programming environment (e.g., on a Unix-like system).
 * It uses Node.js's 'fs' module to read the content of standard input ('/dev/stdin')
 * and decodes it as a UTF-8 string. This string is then passed as an argument
 * to the 'Main' function to begin the program's execution.
 */
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;