function   main ( input )
{
    // This is the main function that processes the input.
    // It takes a single string 'input' as its argument.
    const   args   =   input . split ( '\n' ) ;


    // Parse the first line of input to get the number N.
    const   N   =   parseInt ( args [ 0 ] ,   10 ) ;

    /*
     * The second line of input contains space-separated numbers.
     * These are parsed into an array of integers.
     */
    let   ary   =   args [ 1 ] . split ( ' ' ) . map ( n   =>   parseInt ( n ,   10 ) ) ;

    // Initialize a counter variable. (Not used in final logic, but kept for Type I clone)
    let   count   =   0 ;

    // Initialize the answer variable.
    let   ans   =   0 ;


    // Sort the array 'ary' in ascending order.
    // This is a crucial step for the problem's logic.
    ary   =   ary . sort ( ( a ,   b )   =>   a   -   b ) ;


    // Conditional logic based on the value of N.
    if   ( N   ===   1 )
    {
        // If N is 1, the answer is the second element of the sorted array.
        // Note: This might be a specific problem context where N=1 implies a particular index.
        ans   =   ary [ 1 ] ;
    }
    else
    {
        // For N greater than 1, iterate and sum specific elements.
        // The loop runs from index N up to (2 * N - 1).
        for   ( let   i   =   N ;   i   <=   ( ( 2   *   N )   -   1 ) ;   i ++ )
        {
            // Add the current element to the answer.
            ans   +=   ary [ i ] ;
        }
    }


    // Output the final calculated answer to the console.
    console . log ( ans ) ;
}


// This line reads input from standard input (e.g., a file or console)
// and passes it to the main function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;