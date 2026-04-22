/* This is a Type I clone example.
 * The core logic remains absolutely identical.
 * Only whitespace and comments are altered.
 */

function    Main  (  input  )
{

    // The input array elements correspond to lines of input data.
    // Specifically, input[0] is the first line, input[1] the second, and so on.
    // This particular problem checks specific indices for equality.

        if  (  input[2]  ===  input[3]    &&    input[4]  ===  input[5]  )
        {
            // If the conditions are met (input[2] equals input[3] AND input[4] equals input[5]),
            // then we output the string "Yes" to the console.
            console  .  log  (  "Yes"  )  ;
        }
        else
        {
            // Otherwise, if any of the conditions are not met,
            // we output the string "No" to the console.
            console  .  log  (  "No"  )     ;
        }

}  // End of Main function definition.


// The program execution starts here.
// It uses Node.js's 'fs' module to read the entire standard input.
// The input is read synchronously and decoded as a UTF-8 string.
// This processed input string is then passed to the Main function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;

// End of file.