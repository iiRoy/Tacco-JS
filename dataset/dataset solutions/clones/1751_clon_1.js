'use    strict'
; /* This directive enables strict mode for the entire script. */



// This is the main function that processes the input data.
// It parses several lines of input:
//   - N: The count of elements in array A.
//   - A: A list of N numbers.
//   - Q: The count of queries.
//   - BC: A series of Q pairs (B, C) for queries.
function Main  (   input  )
{
    /* Input parsing section */

    // First, we clean up the input string and split it into an array of lines.
    let     tmp   = input . trim ( ) . split ( '\n' ) ;

    // N represents the number of elements in the array A.
    const N = Number ( tmp [ 0 ] ) ;

    // A is an array of numbers.
    // We parse the second line, split it by space, sort it numerically,
    // and then map each element to a BigInt for arbitrary precision arithmetic.
    let A = tmp [ 1 ]
                . split ( ' ' ) /* Split the string into an array of number strings. */
                . sort ( ( a , b ) => a - b ) /* Sort the numbers in ascending order. */
                . map ( ( v ) => BigInt ( v ) ) ; /* Convert each number string to a BigInt. */

    // Q represents the number of queries that follow.
    const Q = Number ( tmp [ 2 ] ) ;

    // BC is an array of query pairs.
    // We take the remaining lines, starting from the fourth line (index 3),
    // and for each line, we split it by space and convert the two resulting
    // numbers into BigInts, creating an array of [B, C] pairs.
    const BC = tmp . splice ( 3 ) /* Extract query lines. */
                  . map ( ( v ) => v . split ( ' ' ) . map ( ( v ) => BigInt ( v ) ) ) ; /* Parse each query pair as BigInts. */


    /* Processing logic section */

    // Initialize an array 'arr' to store counts of each number.
    // The maximum possible value for numbers is 100,000, so the array size is 100,001.
    // All counts are initialized to 0n (BigInt zero).
    let arr = new Array ( 100001 ) . fill ( 0n ) ;

    // Populate the 'arr' with counts from the initial array A.
    // For each number 'v' in A, increment its count in 'arr'.
    for ( const v of A )
    {
        arr [ v ] += 1n ; // Increment the count for the current number.
    }

    // Calculate the initial sum of (value * count).
    // This is equivalent to sum(A) if A contained all original values.
    let result = arr . reduce ( ( sum , v , i ) =>
        sum + v * BigInt ( i )
    ) ;

    // Process each query [b, c] in the BC array.
    for ( const [ b , c ] of BC )
    {
        // Calculate the difference that this query will make to the total sum.
        // It's (new_value - old_value) * count_of_old_value.
        const diff = ( c - b ) * arr [ b ] ;

        // Add this difference to the running total.
        result += diff ;

        // Output the current total sum after applying the query.
        console . log ( String ( result ) ) ;

        // Update the counts in 'arr':
        // All occurrences of 'b' are now considered 'c'.
        // So, add the count of 'b' to the count of 'c'.
        arr [ c ] += arr [ b ] ;

        // Set the count of 'b' to zero, as all 'b's have been replaced by 'c's.
        arr [ b ] = 0n ;
    }

    // The function doesn't need to return an explicit value as it prints results to console.
    return ;
}

// Read the input from standard input, decode it as UTF-8, and pass it to the Main function.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;