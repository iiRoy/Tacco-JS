/*
 * This is the primary function responsible for
 * processing the provided input string.
 */
function   Main   (   input   )   {

    // Evaluate if the input string begins with the sequence "YAKI".
    // The indexOf method returns 0 if the substring is found at the very beginning.
    if   (   input.indexOf   (   "YAKI"   )   ==   0   )   {
        // If the condition is met, output the affirmative response.
        console.log   (   "Yes"   )   ;
    }   else   {
        // Otherwise, if the condition is not met, output the negative response.
        console.log   (   "No"   )   ;
    }

}   /* End of the Main function definition */

//
// The following statement reads data from standard input,
// specifically from the file path "/dev/stdin", encoding it as UTF-8.
// This processed input is then passed as an argument to the 'Main' function for execution.
//
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;