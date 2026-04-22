/* This is a Type I clone of the original JavaScript code.
 * Only whitespace and comments have been altered.
 * All identifiers, operators, and expressions remain identical.
 */
function main( A ) {
    // Normalize the input string by replacing all newline characters (CRLF or LF) with a single space.
    A = A . replace ( / \r?\n / g , ' ' ) ;

    // Split the processed string into an array of substrings using space as a delimiter.
    A = A . split ( ' ' ) ;

    // Extract the first element from the array A, which represents the count N.
    let N = A . shift ( ) ; /* This variable 'N' dictates the number of iterations in the subsequent loop.
                               It was conceptually referred to as 'sortNum' or 'A.length' in the original context. */

    // Convert the remaining elements of array A to numbers and store them in a new array 's'.
    let s = A . map ( Number ) ;

    // Initialize the result string variable 'kekka' as an empty string.
    let kekka = '' ;


    // Begin a loop that iterates N times, checking each number in the array 's'.
    for ( let i = 0 ; i < N ; i ++ ) {

        // Check if the current number 's[i]' is an even number.
        if ( s [ i ] % 2 == 0 ) {

            /* If the number is even, proceed to check if it is divisible by 3 or 5.
             * This nested condition is crucial for determining the 'APPROVED' status.
             */
            if ( s [ i ] % 3 == 0 || s [ i ] % 5 == 0 ) {
                kekka = 'APPROVED' ;
            }
            else {
                // If the number is even but not divisible by 3 and not divisible by 5, it is 'DENIED'.
                kekka = 'DENIED' ;
                // Immediately exit the loop as soon as a 'DENIED' condition is met.
                break ;
            }

        }
    }

    /* Output the final status stored in 'kekka' to the console.
     * This will be either 'APPROVED' or 'DENIED', depending on the input numbers.
     */
    console . log ( kekka ) ;

} /* End of the 'main' function definition block */


// This line reads data from standard input using Node.js's 'fs' module and passes it to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;