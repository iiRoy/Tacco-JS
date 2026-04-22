/*
 * This is a Type I clone of a JavaScript program.
 * It checks for the presence of specific digits in an input string.
 * The logic and structure are identical to the original.
 */

// Define the main function that processes the input.
function Main (  input   )
{
    // Remove leading and trailing whitespace from the input string.
    input = input.trim  (  )   ;


    // Check if the input string contains all required digits: "1", "9", "7", and "4".
    // Each indexOf call returns -1 if the character is not found.
    if  (
            input.indexOf ( "1" )  !=  -1
            &&  input.indexOf ( "9" )  !=  -1
            &&  input.indexOf ( "7" )  !=  -1
            &&  input.indexOf ( "4" )  !=  -1
        )
    {
        // If all digits are found, print "YES" to the console.
        console.log  (  "YES"  )  ;
    }
    else
    {
        // Otherwise, if any digit is missing, print "NO".
        console.log  (  "NO"  )  ;
    }
} /* End of Main function definition */


// Call the Main function with input read from standard input.
// This uses Node.js 'fs' module to read the file synchronously.
Main
(
    require ( "fs" )
        .readFileSync (
            "/dev/stdin"
            ,   "utf8"
        )
)   ;
// End of script.