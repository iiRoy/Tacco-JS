/*
 *   This JavaScript program processes two lines of input
 *   and counts the number of positions where characters match.
 *   It is designed to be run in a Node.js environment.
 */
const Main  =  ( input )  =>
{
    // The input string is expected to contain at least two lines.
    // We split the input by newline characters to get an array of lines.
    a  =  input . split ( '\n' ) ;

    // The first line of input is taken and split into an array of characters.
    b  =  a [ 0 ] . split ( '' ) ;

    // The second line of input is taken and split into an array of characters.
    c  =  a [ 1 ] . split ( '' ) ;

    // Initialize a counter variable 'n' to keep track of matching characters.
    n  =  0 ;

    // Loop through the characters, comparing them at each corresponding index.
    // The loop runs for the length of the first character array 'b'.
    for  ( index  =  0 ;  index  <  b . length ;  index ++ )
    {
        // Check if the character at the current 'index' in array 'b'
        // is strictly equal to the character at the same 'index' in array 'c'.
        if  ( b [ index ]  ==  c [ index ] )
        {
            // If the characters match, increment the counter 'n'.
            n  +=  1 ;
        }
    }

    // After the loop completes, print the final count of matching characters.
    console . log ( n ) ;
}


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js's built-in 'fs' module to read the file synchronously.
Main  ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;