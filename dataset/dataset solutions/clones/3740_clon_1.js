/*
 * This file contains a JavaScript program designed to generate a specific numeric sequence.
 * It serves as an example of a Type I code clone, where the underlying logic
 * and structure remain absolutely identical to the original, but the presentation
 * (whitespace and comments) is significantly altered.
 */

function   Main   (  s  )    {
    // The primary function begins here. It accepts a single string argument, 's'.

    // Convert the input string 's' into a number and assign it to the variable 'k'.
    k  =  +s  ;

    var   ans   =   [  ]  ; // Initialize an empty array named 'ans' to store the resulting sequence elements.

    /*
     * 'x' is a counter variable that will cycle through digits from 1 to 9.
     * It represents the current primary digit in the sequence.
     */
    var   x   =   1  ;

    // 'y' is a string variable used to accumulate trailing '9's.
    // It starts empty and grows as 'x' cycles.
    var   y   =   ""  ;


    // Initiate a loop that will iterate 'k' times to construct the sequence.
    for   (   var   i   =   0  ;   i   <   k  ;   i  ++   )    {

        // Concatenate the current value of 'x' (implicitly converted to a string)
        // with the string 'y', and store this combined string in the 'ans' array
        // at the current index 'i'.
        ans   [   i   ]   =   x   +   y  ;

        // Check if the current value of 'x' has reached its maximum, which is 9.
        if   (   x   ===   9   )    {
            /*
             * If 'x' is indeed 9, reset it back to 1 for the next cycle.
             * Additionally, append the character '9' to the 'y' string.
             * This mechanism creates patterns like "1", "2", ..., "9", "19", "29", ..., "99", "199", etc.
             */
            x   =   1  ;
            y   +=   "9"  ;
        }   else   {
            // If 'x' is not 9, simply increment its value by one.
            x  ++   ;
        }
    }

    /*
     * Once the loop has finished executing, all generated sequence elements
     * are contained within the 'ans' array.
     * The array elements are then joined together using a newline character ("\n")
     * as a separator, and the final combined string is printed to the console.
     */
    console  .  log   (   ans  .  join   (   "\n"   )   )  ;

}

// This line serves as the execution entry point for the script.
// It uses the 'fs' (file system) module to synchronously read the content
// of '/dev/stdin' (standard input) as a UTF-8 encoded string.
// This string content is then passed as an argument to the 'Main' function.
Main   (   require   (   "fs"   )  .  readFileSync   (   "/dev/stdin"  ,  "utf8"   )   )  ;