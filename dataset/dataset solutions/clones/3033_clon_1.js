/*
 * This is the main function that processes the input argument.
 * It takes a single string `arg` as input, which is expected
 * to contain multiple lines of data.
 */
function   main  ( arg )
{
    // Split the input string into an array of lines.
    var  args  =  arg . split ( '\n' ) ;

    // Parse the first line as an integer N.
    var   N   =   + args [ 0 ] ;
    // The second line is the string S.
    var   S   =   args [ 1 ] ;
    // Parse the third line as an integer K.
    var   K   =   + args [ 2 ] ;


    // Determine the target character based on the K-th index of S.
    var   tg   =   S [ K ] ;


    // Initialize an empty array to store the processed characters.
    var   arr   =   [ ] ;

    /*
     * Iterate through the string S from index 0 up to N-1.
     * For each character, compare it with the target character 'tg'.
     */
    for ( var   i   =   0  ;  i   <   N  ;  i ++ )
    {
        // If the current character is NOT equal to the target character...
        if  ( S [ i ]   !==   tg )
        {
            // ...then push an asterisk '*' into the array.
            arr . push ( '*' ) ;
        }
        else
        {
            // Otherwise (if it IS equal), push the original character S[i] into the array.
            arr . push ( S [ i ] ) ;
        }
    }
    // Join all elements of the array 'arr' into a single string and print it to the console.
    console . log ( arr . join ( '' ) ) ;
}

/*
 * This line reads the input from standard input,
 * decodes it as UTF-8, and then passes it to the main function.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;