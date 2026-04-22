/*
 * This is a Type I clone of the original JavaScript source code.
 *
 * According to the definition:
 * "Code fragments are exactly equal, except for possible variations
 *  in whitespace and comments."
 *
 * Therefore, every identifier, variable name, function name, operator,
 * and expression remains completely unchanged.
 *
 * The only permitted modifications are:
 * - Whitespace (indentation, spacing, blank lines)
 * - Comments (added, removed, or modified)
 *
 * These changes have been applied extensively to ensure visual difference
 * while maintaining logical and structural identity.
 */


function   Main ( input )
{
    // Initialize a string variable 'str' with the provided 'input'.
    var   str   =   input ;


    // The 'ans' variable is declared but not utilized in this specific logic path.
    var   ans   =   "" ;


    // First, process 'str': split by newline character and take the initial segment.
    var   str   =   str . split ( "\n" ) [ 0 ] ;


    // Further refine 'str': split by space character and retain the very first part.
    str   =   str . split ( " " ) [ 0 ] ;


    // Convert the refined string 'str' into an array of individual characters.
    var   arr   =   Array . from ( str ) ;


    // Begin an iterative process to examine each character within the 'arr' array.
    for
    (
        var   i   =   0 ;
        i   <   arr . length ;
        i ++
    )
    {
        // Check if the current character at index 'i' is precisely a question mark.
        if   ( arr [ i ]   ===   "?" )
        {
            // This block handles the case where the question mark is the very first character.
            if   ( i   ===   0 )
            {
                // If the array contains only a single element.
                if   ( arr . length   ===   1 )
                {
                    arr   =   "D" ; // Replace the single '?' with 'D'.
                }
                // If the character immediately following the current '?' is 'P'.
                else   if   ( arr [ i + 1 ]   ===   "P" )
                {
                    arr [ i ]   =   "D" ; // Change the current '?' to 'D'.
                }
                // If the character immediately following the current '?' is 'D'.
                else   if   ( arr [ i + 1 ]   ===   "D" )
                {
                    arr [ i ]   =   "P" ; // Change the current '?' to 'P'.
                }
                // If the character immediately following the current '?' is also a '?'.
                else   if   ( arr [ i + 1 ]   ===   "?" )
                {
                    arr [ i ]   =   "P" ; // Change the current '?' to 'P' (a consistent choice for '??' pattern).
                }
            }
            // This block handles cases where the question mark is not the first character.
            // It inspects the character preceding the current question mark.
            else   if   ( arr [ i - 1 ]   ===   "P" )
            {
                arr [ i ]   =   "D" ; // If the preceding character was 'P', change current '?' to 'D'.
            }
            // If the character preceding the current '?' was 'D'.
            else   if   ( arr [ i - 1 ]   ===   "D" )
            {
                arr [ i ]   =   "P" ; // If the preceding character was 'D', change current '?' to 'P'.
            }
        }
    } // The loop concludes after processing all characters.


    // Concatenate all elements of the 'arr' array back into a single string.
    arr   =   arr . join ( "" ) ;


    // Output the final, modified string to the standard console.
    console . log ( arr ) ;
}


// Initiate the program by calling the 'Main' function.
// The input is sourced by reading the content of '/dev/stdin' as a UTF-8 string,
// utilizing Node.js's 'fs' module.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;