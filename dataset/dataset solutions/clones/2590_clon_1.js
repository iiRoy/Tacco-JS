/* This JavaScript file defines a simple function
 * to compare two strings character by character
 * up to a certain length (3 characters in this case).
 * It then calls this function with input read from stdin.
 */

// Define the main function that processes the input string.
function   main  ( input )
{
    // The input string is expected to contain two lines,
    // separated by a newline character.
    // We split the input into an array of strings based on the newline.
    const   args   = input . split ( "\n" ) ;

    // The first line of input represents the first string, N.
    const   N   = args [ 0 ] ;


    // The second line of input represents the second string, V.
    const   V   = args [ 1 ] ;

    // Convert the string N into an array of its individual characters.
    const   A   = N . split ( '' ) ;
    // Convert the string V into an array of its individual characters.
    const   B   = V . split ( '' ) ;


    // Initialize a counter to keep track of matching characters.
    var   count   =   0 ;

    // Loop through the first three characters of both arrays.
    // The loop runs from index 0 up to (but not including) 3.
    for  ( var i = 0 ;   i < 3 ;   i ++ )
    {
        // Check if the character at the current index 'i'
        // in array A is strictly equal to the character at
        // the same index 'i' in array B.
        if ( A [ i ]   ===   B [ i ] )
        {
            // If the characters match, increment the counter.
            count ++ ; // Increment the match count.
        }
    }

    // After the loop finishes, print the final count of matching characters to the console.
    console . log ( count ) ;
}


// This section handles reading input from the standard input (stdin)
// and then passing it to the main function for processing.
// It uses Node.js's 'fs' module to read the file synchronously.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;