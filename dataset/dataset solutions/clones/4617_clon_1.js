// This JavaScript program processes a single line of text input.
// It aims to extract the initial characters of the first three words
// and then display them in uppercase.

function   main  (  input  )
{
    // The input string is first trimmed to remove any leading or trailing whitespace.
    input = input . trim ( ) ;

    // The trimmed input string is then split into an array of substrings
    // based on space characters. We extract the first three elements.
    const   s1   =   input . split ( " " ) [ 0 ] ;
    const   s2   =   input . split ( " " ) [ 1 ] ;
    const   s3   =   input . split ( " " ) [ 2 ] ;

    // For each of the three extracted substrings, we take the character
    // at index 0 (the first character), convert it to uppercase,
    // and then concatenate these three uppercase characters together.
    // The final concatenated string is then printed to the console.
    console . log (
        s1 . substr ( 0 , 1 ) . toUpperCase ( ) +
        s2 . substr ( 0 , 1 ) . toUpperCase ( ) +
        s3 . substr ( 0 , 1 ) . toUpperCase ( )
    ) ;
} // End of the main function definition.


// This part of the code handles reading input from standard input
// and passing it to the main function for processing.
// It uses Node.js's 'fs' module to synchronously read the file
// '/dev/stdin' (which represents standard input) as a UTF-8 string.
main (
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ;