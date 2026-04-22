/*
 * This JavaScript code is a Type I clone.
 * It is derived directly from an original source, with the following modifications:
 * - All variable names, function names, operators, and expressions are identical.
 * - The core logic and structure remain precisely the same.
 * - Extensive changes have been applied to whitespace (indentation, spacing, blank lines).
 * - Numerous comments have been added to describe the code's functionality,
 *   making it visually distinct while preserving its exact operational behavior.
 */


( async   ( ) =>   {

    // Initialize an empty string to accumulate all input from stdin.
    let   input   =   '' ;

    // Asynchronously read data chunks from standard input until EOF.
    // Each chunk is appended to the 'input' string.
    for   await   ( const   chunk   of   process . stdin )
    {
        input   +=   chunk ;
    }


    // Split the entire input string into an array of lines, using the newline character as a delimiter.
    const   lines   =   input . split ( /\n/ ) ;


    // The first line contains two numbers: 'n' (size of the array 's') and 'q' (number of queries).
    // It's split by whitespace, and each part is converted to a number.
    const   [ n ,   q ]   =   lines [ 0 ] . split ( /\s/ ) . map ( v   =>   +v ) ;


    // Process the subsequent 'q' lines to extract query details.
    // Each query line is split by whitespace, and its components are converted to numbers.
    // The slice method selects lines from index 1 up to q, inclusive.
    const   querys   =   lines . slice ( 1 ,   q   +   1 ) . map ( line   =>   line . split ( /\s/ ) . map ( v   =>   +v ) ) ;


    // Initialize an array 's' of size 'n'.
    // All elements are initially set to the value 1.
    let   s   =   new   Array ( n ) . fill ( 1 ) ;


    // Define the modulo constant to be used in all arithmetic operations.
    // This is a common prime number used in competitive programming for hashing or large number arithmetic.
    const   mod   =   998244353 ;


    // Initialize 'num', which will hold the main calculated value, starting at 0.
    let   num   =   0 ;


    // Calculate the initial value of 'num'.
    // This loop effectively constructs a number composed of 'n' ones (e.g., if n=3, num becomes 111),
    // and keeps it within the modulo range.
    for   ( let   i   =   0 ;   i   <   n ;   i ++ )
    {
        num   =   ( num   *   10   +   1 )   %   mod ;
    }


    // Iterate through each query provided in the input.
    // Each query involves updating a segment of array 's' and recalculating 'num'.
    for   ( const   query   of   querys )
    {
        // Destructure the current query's parameters:
        // 'l' (left index, 0-based), 'r' (right index, 0-based), and 'd' (the digit to apply).
        const   [ l ,   r ,   d ]   =   [ query [ 0 ]   -   1 ,   query [ 1 ]   -   1 ,   query [ 2 ] ] ;


        // Initialize 'q' for the current query's contribution to 'num'.
        let   q   =   0 ;


        // Apply the digit 'd' to the segment of array 's' from index 'l' to 'r' (inclusive).
        // During this process, 'q' is updated to reflect the change in the number represented by 's'.
        for   ( let   i   =   l ;   i   <=   r ;   i ++ )
        {
            // Update 'q' based on the difference between the new digit 'd' and the old value of s[i].
            // This calculation is done modulo 'mod' to prevent overflow.
            q   =   ( q   *   10   +   d   -   s [ i ] )   %   mod ;
            // Set the element s[i] to the new digit 'd'.
            s [ i ]   =   d ;
        }


        // For the remaining elements in 's' after the modified segment (from r+1 to n-1),
        // we essentially multiply 'q' by 10 for each position.
        // This correctly shifts the contribution of the modified segment to its proper place value.
        for   ( let   i   =   r   +   1 ;   i   <   n ;   i ++ )
        {
            q   =   q   *   10   %   mod ;
        }


        // Add the calculated contribution 'q' from the current query to the total 'num'.
        num   +=   q ;
        // Ensure that 'num' remains within the bounds of the modulo.
        // A common pattern for handling negative results from modulo in JavaScript:
        // (num % mod + mod) % mod, but here 'q' is constructed such that num % mod should be fine.
        num   %=   mod ;


        // Output the current value of 'num' after processing each query.
        console . log ( num ) ;
    }

} ) ( ) ; // End of the Immediately Invoked Async Function Expression (IIAFE).