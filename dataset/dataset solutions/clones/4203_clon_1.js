/*
 * This is a JavaScript program.
 * It defines a main function to process input.
 * The program then immediately invokes this function.
 */

// Define the 'Main' function.
// This function accepts a single argument, 'input', which is expected to be a string.
function   Main   (   input   )
{
    // Declare a variable named 'n'.
    // This variable will store the result of applying a regular expression match
    // to the 'input' string.
    // The regular expression used is /A?KIHA?BA?RA?/.
    var   n   =   input.match   (   /A?KIHA?BA?RA?/   )   ;   // Perform the regex matching operation.

    // Output a message to the console.
    // The expression 'n=null?"NO":"YES"' is evaluated.
    // Note: 'n=null' is an assignment expression. It assigns 'null' to 'n'
    // and then evaluates to 'null'.
    // Since 'null' is a falsy value in JavaScript, the ternary operator
    // will always select the "YES" branch.
    // Therefore, this line will always print "YES" to the console,
    // regardless of the actual content of 'input' or the result of the match.
    console.log   (   n   =   null   ?   "NO"   :   "YES"   )   ;   // Print the determined result.
}


// Immediately call the 'Main' function.
// The argument for 'Main' is prepared by reading data from standard input.
// First, the 'fs' (file system) module is required.
// Then, 'readFileSync' is used to read the content of '/dev/stdin'.
// The content is interpreted as 'utf8' encoded text.
// Finally, any leading or trailing whitespace is removed using '.trim()'.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;   // Execute the program's entry point.

/*
 * End of the JavaScript code.
 * No further operations are performed.
 */