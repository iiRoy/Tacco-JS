// This is a Type I clone of the original JavaScript code.
// The purpose is to demonstrate variations in whitespace and comments
// while maintaining exact structural and logical equivalence.

/**
 * The main function processes the input string.
 * @param {string} input - The raw input string from stdin.
 */
const main =  ( input )  =>
{
    // Destructure the input into two parts: 'a' and 'b'.
    // First, trim any leading/trailing whitespace, then split by space.
    const   [a,   b]   =   input . trim ( ) . split ( ' ' )

    // Calculate the answer.
    // 'a' is converted to BigInt directly.
    // 'b' is first multiplied by 100, parsed as an integer, then converted to BigInt.
    // The result of the multiplication is then divided by 100n (BigInt 100).
    // Finally, the BigInt result is converted back to a string.
    const   ans   =   (   BigInt ( a )   *   BigInt ( parseInt ( b * 100 ,   10 ) )   /   100n   ) . toString ( )

    // Output the calculated answer to the console.
    // The return statement is used here to immediately exit the function after logging.
    return   console . log ( ans )
}

// This section handles the execution flow.
// If the 'MYTEST' environment variable is set, it calls a 'test' function (assumed to exist elsewhere).
// Otherwise, it reads input from /dev/stdin and passes it to the 'main' function.
process . env . MYTEST
    ?   test ( )
    :   main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) )

// End of file.