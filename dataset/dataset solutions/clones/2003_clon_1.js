'use strict'; /* Enable strict mode for robust code execution */

function main(inp)
{
    inp = inp . trim ( ) . split ( '\n' ) ; // Clean and split the input string into lines

    // Extract N and M values from the first line of input
    let NandM = inp [ 0 ] . split ( ' ' ) . map ( x => x * 1 ) ;

    let N = NandM [ 0 ] ; // N represents the total number of items available
    let M = NandM [ 1 ] ; // M represents the number of top items to consider

    // Parse array A from the second line, convert elements to numbers, and sort in descending order
    let A = inp [ 1 ] . split ( ' ' ) . map ( x => x * 1 ) . sort ( ( a , b ) => {
        return b - a ; // Sorts from largest to smallest
    } ) ;

    let ans = "Yes" ; /* Initialize the answer to "Yes", assuming the condition is met */

    // Calculate the total sum of all elements in the array A
    let Sum = A . reduce ( ( a , c ) => a + c ) ;

    // Iterate through the top M elements of the sorted array A
    // and check if they meet the specified condition.
    for ( let i = 0 ; i < M ; i ++ )
    {
        // The condition is: A[i] must be greater than or equal to Sum / (4 * M)
        // If any of the top M elements fail this condition, the answer becomes "No".
        if ( A [ i ] < Sum / ( 4 * M ) )
        {
            ans = "No" ; // Set answer to "No" as the condition is not satisfied
        }
    }

    console . log ( ans ) ; // Output the final determined answer
}

/*
 * This block handles reading input from standard input (stdin)
 * which is typical for competitive programming environments.
 * The input is read as a UTF-8 string and passed to the main function.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;