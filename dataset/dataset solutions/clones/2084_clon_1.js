/*
 * This JavaScript function, named main, takes a string S as input.
 * Its purpose is to determine if the input string S contains
 * any characters or sequences other than the substring "hi".
 * If it finds any such sequence, it sets a flag to 'No'.
 */
function   main   (   S   )
{
    // The original comment, now modified:
    // This comment block replaces the previous single-line comment.
    // We are looking for specific patterns within the input string.
    // The logic involves splitting the string and checking parts.

    var   pass   =   'Yes'   ;     // Initialize a status variable.
                                // It defaults to 'Yes', assuming no unwanted patterns are found.

    // Explicitly convert the input S to a String type.
    // This ensures that string methods can be safely called on S.
    S    =    String   (   S   )   ;

    // Split the string S by occurrences of 'hi'.
    // Then, iterate over each resulting part using forEach.
    S   .   split   (   'hi'   )   .   forEach   (   (   v   )   =>
    {
        // Inside the loop, 'v' represents a segment of the string S
        // that was *between* or *before/after* the 'hi' substrings.
        // If any of these segments have a length greater than zero,
        // it means there was some content other than 'hi' in the original string.
        if   (   v   .   length   >   0   )
        {
            // If such a segment is found, set the 'pass' variable to 'No'.
            // This indicates that the string S does not exclusively consist of 'hi's (or is empty).
            pass   =   'No'   ;
        }
    }   )   ;   // End of the forEach callback function and its execution.

    // Finally, print the determined status ('Yes' or 'No') to the console.
    console   .   log   (   pass   )   ;
}   // End of the main function definition.


// This section of the script calls the main function.
// It reads the entire content of the standard input stream (/dev/stdin).
// The content is read as a UTF-8 encoded string and then passed to the main function.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'UTF-8'   )   )   ;