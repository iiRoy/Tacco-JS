/*
 * This JavaScript file contains the core logic for processing a given string.
 * It evaluates various properties of the string, such as character uniqueness
 * and palindromic characteristics, to determine a final "YES" or "NO" output.
 *
 * The input string is expected to be provided via standard input.
 *
 * This particular implementation adheres to specific rules for string analysis.
 */

// Definition of the main function that orchestrates the string processing.
// It accepts a single argument, 'arg', which represents the raw input.
function   Main ( arg )
{
    // First, process the input argument:
    // 1. Split by newline to get individual lines.
    // 2. Take the first line (index 0).
    // 3. Split that line into an array of individual characters.
    // This resulting character array is stored in the variable 'S'.
    var   S   =   arg . split ( "\n" ) [ 0 ] . split ( "" ) ;


    // --- Primary Conditions for Early Exit ---

    // Condition 1: Check if all characters in 'S' are identical AND
    // the string 'S' has a length greater than one.
    // Example: "AAAA" (length 4, 1 unique char) -> NO
    // Example: "A" (length 1, 1 unique char) -> continues
    if  (  (  new   Set ( S )  ) . size   ===   1   &&   S . length   >   1  )
    {
        // If this condition is met, output "NO" and immediately terminate the function.
        console . log ( "NO" ) ;
        return ;
    }


    // Condition 2: Check if there are exactly two unique characters in 'S' AND
    // the string 'S' has an exact length of two.
    // Example: "AB" (length 2, 2 unique chars) -> YES
    // Example: "ABA" (length 3, 2 unique chars) -> continues
    if  (  (  new   Set ( S )  ) . size   ===   2   &&   S . length   ===   2  )
    {
        // If this specific condition is true, output "YES" and exit.
        console . log ( "YES" ) ;
        return ;
    }


    // Condition 3: Check if the string 'S' contains exactly three unique characters.
    // This condition does not depend on the total length of the string.
    // Example: "ABC" (3 unique) -> YES
    // Example: "AABBC" (3 unique) -> YES
    if  (  (  new   Set ( S )  ) . size   ===   3  )
    {
        // If 'S' has three distinct characters, output "YES" and return.
        console . log ( "YES" ) ;
        return ;
    }


    // --- Advanced Palindromic-like Checks ---

    // The following logic differentiates based on whether the string length is even or odd.
    if  (  S . length   %   2   ==   0  )  // Case: String 'S' has an even number of characters.
    {
        // Create a sub-array 'a' from the first part of 'S'.
        // It includes characters from index 0 up to (but not including) the character just before the middle.
        var   a   =   S . slice ( 0 ,   S . length   /   2   -   1 ) ;
        // Create another sub-array 'b' from the first half of 'S', then reverse it.
        // This effectively gets the reverse of the first half.
        var   b   =   S . slice ( 0 ,   S . length   /   2 ) . reverse ( ) ;

        // Compare the string representations of 'a' and 'b'.
        // This checks if the first part (excluding one char) matches the reversed first half.
        if  (  a . toString ( )   ===   b . toString ( )  )
        {
            // If they match, further analyze the uniqueness of characters in 'a' and 'b'.
            // Convert 'a' and 'b' into Set objects to easily count unique elements.
            a   =   new   Set ( a ) ;
            b   =   new   Set ( b ) ;

            // Check if both 'a' and 'b' (as Sets) contain only one unique character.
            // This implies the first part was like "AAA" and the reversed first half was also "AAA".
            if  (  a . size   ==   1   &&   b . size   ==   1  )
            {
                // If this condition is met, output "NO" and terminate.
                console . log ( "NO" ) ;
                return ;
            }
        }
    }
    else  // Case: String 'S' has an odd number of characters.
    {
        // For odd lengths, we ignore the exact middle character.
        // 'a' takes characters from the beginning up to (but not including) the middle character.
        var   a   =   S . slice ( 0 ,   (  (  S . length   -   1  )   /   2  )  ) ;
        // 'b' takes characters from after the middle character to the end, then reverses them.
        var   b   =   S . slice ( (  (  S . length   -   1  )   /   2  )   +   1  ) . reverse ( ) ;

        // Compare the string representations of 'a' and 'b'.
        // This checks if the first half (excluding middle) matches the reversed second half.
        if  (  a . toString ( )   ===   b . toString ( )  )
        {
            // If they match, proceed with the uniqueness check.
            // Reassign 'a' and 'b' as Set objects for unique character counting.
            a   =   new   Set ( a ) ;
            b   =   new   Set ( b ) ;

            // Check if both 'a' and 'b' (as Sets) contain only a single unique character.
            if  (  a . size   ==   1   &&   b . size   ==   1  )
            {
                // If this condition is met, output "NO" and terminate the function.
                console . log ( "NO" ) ;
                return ;
            }
        }
    }


    // --- Default Output ---

    // If none of the specific "NO" or early "YES" conditions were met throughout the function,
    // then by default, the result is "YES".
    console . log ( "YES" ) ;
    return ; // Explicitly return to end function execution.
}


// --- Program Entry Point ---

// This line executes the 'Main' function.
// It reads input from standard input (/dev/stdin), typically used in competitive programming environments.
// The input is read as a UTF-8 encoded string.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;