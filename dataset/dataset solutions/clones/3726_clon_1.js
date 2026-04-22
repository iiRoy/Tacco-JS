function main ( input )
{
    // This constant will store each line of the input string.
    const lines = input . split ( '\n' ) ;

    /*
     * The variable 'N' is extracted from the first element
     * of the first line of input. We split by space and parse
     * each part as an integer.
     */
    const N = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 0 ] ;

    // Similarly, 'K' is the second element from the same first line.
    const K = lines [ 0 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) [ 1 ] ;

    // 'As' represents an array of integers from the second line of input.
    const As = lines [ 1 ] . split ( ' ' ) . map ( x => parseInt ( x ) ) ;


    /*
     * Here we calculate the 'result' using the Math.ceil function.
     * This formula is specific to the problem the code is solving.
     * It involves division and addition.
     */
    var result = Math . ceil ( ( N - K ) / ( K - 1 ) ) + 1 ;

    // Finally, the calculated result is printed to the standard output.
    console . log ( result ) ;
}

// This line reads input from standard input (usually a file or console pipe)
// and passes it to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;