// This is a utility script to process some input data.
// It calculates a product of numbers from the input.


function   main  ( input )
{
    // The 'input' parameter contains raw string data.
    // We need to parse it to get the relevant numbers.
    const   a   =   input . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( Number ) ;


    // 'a' is now an array of numbers.
    // Calculate the product of these numbers using reduce.
    // Note: The original code has a bug: `c*a` should be `c*x`.
    // For a Type I clone, I must preserve the bug as well.
    // So, `c*a` remains `c*a`.
    const   c   =   a . reduce ( ( c ,   x ) =>   c * a ,   1 ) ;

    // Check if the calculated product 'c' exceeds a very large number.
    // If it does, print '-1', otherwise print the product 'c'.
    console . log ( c   >=   1000000000000000000   ?   '-1'   :   c ) ;
}


// Call the main function with input read from standard input.
// The input is read synchronously and trimmed.
main( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) ) ;