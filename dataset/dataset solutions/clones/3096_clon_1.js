/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical equivalence but alters whitespace and comments extensively.
 * The purpose is to demonstrate a visually distinct version while preserving all
 * functional aspects and identifiers.
 */
function     main( input )
{
    // Initialize a variable 'x' with the first element of the 'input' array.
    x = input[ 0 ];

    // Check the value of 'x' to determine the complementary base.
    if ( x == 'A' )
        console.log( 'T' ); // If 'A' (Adenine), print 'T' (Thymine).

    if
    ( x == 'C' )
        console.log( 'G' ); // If 'C' (Cytosine), print 'G' (Guanine).


    if ( x == 'G' )
        console.log( 'C' ); // If 'G' (Guanine), print 'C' (Cytosine).

    if ( x == 'T' )
        console.log( 'A' ); // If 'T' (Thymine), print 'A' (Adenine).
}

// Call the main function with data read from standard input.
// The data is read as a UTF-8 string and then split into an array by newline characters.
main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( '\n' ) ); // Program execution starts here.