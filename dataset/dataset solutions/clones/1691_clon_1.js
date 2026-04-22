/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions remain strictly identical.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The changes are extensive to demonstrate visual difference while maintaining logical equivalence.
 */

// An example of the input format, typically commented out in production code.
// let input = "6\nAC\nTLE\nAC\nAC\nWA\nTLE";


// The problem statement implies that each Si value will be one of these predefined statuses:
// AC (Accepted), WA (Wrong Answer), TLE (Time Limit Exceeded), or RE (Runtime Error).

function   main   (   input   )
{
        // First step: Ensure no leading or trailing whitespace affects processing.
        input   =   input.trim   (   )   ;


        // Convert the single input string into an array of lines.
        // The first line usually contains metadata (e.g., count), subsequent lines are data.
        let   list   =   input.split   (   "\n"   )   ;


        // Define the array of possible case labels for comparison.
        let   caseL   =   [   "AC"   ,   "WA"   ,   "TLE"   ,   "RE"   ]   ;


        // Initialize a counter array for each case label, set to zero.
        // The order matches `caseL`: [AC_count, WA_count, TLE_count, RE_count].
        let   nl   =   [   0   ,   0   ,   0   ,   0   ]   ;


        /*
         * Loop through the input lines starting from the second element (index 1),
         * as the first element is usually the total number of test cases
         * and not a status itself.
         * Increment the appropriate counter based on the status found.
         */
        for   (   let   i   =   1   ;   i   <   list.length   ;   i++   )
        {
                if   (   list[i]   ===   caseL[0]   )
                {
                        nl[0]++   ;   // Increment Accepted count
                }
                else   if   (   list[i]   ===   caseL[1]   )
                {
                        nl[1]++   ;   // Increment Wrong Answer count
                }
                else   if   (   list[i]   ===   caseL[2]   )
                {
                        nl[2]++   ;   // Increment Time Limit Exceeded count
                }
                else   if   (   list[i]   ===   caseL[3]   )
                {
                        nl[3]++   ;   // Increment Runtime Error count
                }
        }


        // Now, iterate through the case labels and their corresponding counts.
        // Print the results in the required format, e.g., "AC x 3".
        for   (   let   i   =   0   ;   i   <   caseL.length   ;   i++   )
        {
                console.log   (   caseL[i]   +   " x "   +   nl[i]   )   ;
        }

} /* End of the main function */


// This is the standard competitive programming boilerplate for reading input from stdin.
// It reads the entire standard input as a UTF-8 string and passes it to the 'main' function.
main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;