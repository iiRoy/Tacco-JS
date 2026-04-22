/*
 * This JavaScript file contains the implementation of a specific algorithm.
 * It processes a list of scores to categorize them into professional levels.
 *
 * This version is a Type I clone, meaning its functionality is identical
 * to an original source, with only variations in whitespace and comments.
 * No identifiers, operators, or expressions have been altered.
 */

// --- Main Program Entry Point ---

// Defines the primary function responsible for handling the entire input process.
function   Main   (   input   )
{

    // First, we take the raw input string and divide it into an array of lines.
    // Each element in the 'input' array will now represent a single line from the original input.
    input   =   input . split ( "\n" ) ;

    // The first line of input is expected to contain the total number of people.
    // We convert this string value into a numerical representation.
    var   people_num   =   Number ( input [ 0 ] ) ; // Stores the count of participants.

    // The second line of input holds the individual scores, which are space-separated.
    // We split this line by spaces to obtain an array of score strings.
    var   scores   =   input [ 1 ] . split ( ' ' ) ;

    // Initialize an empty array to store the processed professional levels.
    // This array will hold levels that are below a certain threshold.
    var   ary   =   [ ] ;

    // Initialize a variable to temporarily hold the calculated professional level for each score.
    var   pro   =   0 ;

    // Initialize a counter for scores that meet or exceed a specific high professional level.
    var   any   =   0 ; /* This variable counts high-level achievements. */

    // --- Core Logic: Score Processing Loop ---

    // Iterate through each score in the 'scores' array.
    for   (   var   i   =   0 ;   i   <   scores . length ;   i ++   )
    {
        // Convert the current score string to a numerical value.
        scores [ i ]   =   Number ( scores [ i ] ) ;

        // Calculate the 'professional level' by dividing the score by 400 and taking the integer part.
        pro   =   Math . floor ( scores [ i ]   /   400 ) ; // Calculates the skill tier.

        // Check if the calculated professional level is 8 or higher.
        if   (   pro   >=   8   )
        {
            // If the level is 8 or above, increment the 'any' counter.
            // These are considered top-tier achievements.
            any ++ ;
        }
        else
        {
            // Otherwise, if the level is below 8, add it to the 'ary' array.
            // These are standard professional levels.
            ary . push ( pro ) ;
        }
    }

    // --- Post-Processing: Unification of Levels ---

    // Filter the 'ary' array to obtain only unique professional levels.
    // This removes any duplicate level entries.
    var   united   =   ary . filter   (   function   (   a ,   b ,   c   )
    {
        // The filter condition ensures that only the first occurrence of each level 'a' is kept.
        // 'c.indexOf(a) === b' means 'a' is at its first position 'b' in the array 'c'.
        return   c . indexOf ( a )   ===   b ;
    }   ) ;

    // --- Output Results ---

    // Log the array of unique professional levels to the console.
    console . log ( united ) ;

    // Conditional output based on whether any unique professional levels (excluding 'any') were found.
    if   (   united [ 0 ]   )   // Checks if the 'united' array contains at least one element.
    {
        // If unique levels exist, print their count and the total count (including 'any' levels).
        console . log ( united . length   +   ' '   +   (   united . length   +   any   ) ) ;
    }
    else
    {
        // If no unique levels were found in 'ary', it implies only 'any' levels might exist or none at all.
        // In this specific scenario, we output '1' for the minimum category count, plus the 'any' count.
        console . log ( 1   +   ' '   +   any ) ;
    }

} // End of the Main function definition.


// --- Program Execution ---

// This line invokes the Main function, providing it with input read from standard input.
// It uses Node.js's 'fs' module to synchronously read the file content from '/dev/stdin' as UTF-8.
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ; // Executes the primary logic.