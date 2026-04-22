/*
 * This is a JavaScript program designed to process
 * a given input string.
 *
 * It identifies sequences of specific characters
 * and calculates the maximum length among them.
 */
const    main   =    (   input   )   =>
{
        // Declare a constant for processed input.
        // Remove leading/trailing whitespace from the raw input.
        const    inputs    =    input.trim(   )   ;


        /*
         * Attempt to find all occurrences of DNA/RNA-like sequences.
         * These sequences consist only of A, T, C, G characters.
         * The 'g' flag ensures all matches are found, not just the first.
         */
        const    match    =    inputs.match(   /   [   ATCG   ]   +   /g   )   ;



        // Initialize a variable to store the maximum length found.
        // It starts at zero, as no sequences have been processed yet.
        var    ans    =    0   ;


        // Loop through all found matches, if any exist.
        // The loop continues as long as 'match' is not null/undefined
        // and 'i' is within the bounds of the 'match' array.
        for   (   var    i    =    0   ;   match   &&   i   <   match.length   ;   i   ++   )
        {
                // For each match, update 'ans' if the current match's length
                // is greater than the previously recorded maximum.
                ans    =    Math.max(   match   [   i   ]   .   length   ,    ans   )   ;
        }


        // Output the final calculated maximum length to the console.
        console.log(   ans   )   ;

}   ;

/*
 * This section is responsible for executing the main function.
 * It reads the input from standard input (/dev/stdin)
 * using Node.js's file system module,
 * and then passes the content as a UTF-8 string to the main function.
 */
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,    'UTF-8'   )   )   ;