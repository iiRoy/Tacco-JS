/*
 * This is a Type I clone example.
 * It demonstrates extensive modifications to whitespace and comments
 * while maintaining the exact same functional logic and structure.
 */

// Define the main function that processes the input string.
function   Main  (  s  )   {
    // Trim leading and trailing whitespace from the input string 's'.
    s   =   s.trim  (  )  ;

    // Log "YES" or "NO" based on whether the string 's' matches a specific pattern.
    // The pattern checks for "AKIHABARA" with optional 'A's at certain positions.
    console . log (
        /^(A|)KIH(A|)B(A|)R(A|)$/ . test ( s )
            ?   "YES"   // If the string matches the pattern.
            :   "NO"    // If the string does not match the pattern.
    ) ; // End of console.log statement.
}

// Call the Main function with input read from standard input.
// This uses Node.js 'fs' module to read the file.
Main  (
    require (  "fs"  )
        . readFileSync ( "/dev/stdin" ,  "utf8"  )
) ; // End of Main function call.

// End of file.