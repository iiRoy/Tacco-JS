/*
 * This script is designed to process numerical input data.
 * It reads a sequence of numbers from standard input,
 * performs a series of calculations, and outputs a final result.
 * The core logic involves array manipulations and conditional checks.
 */
console.log( (  args =>
{
    // The main processing function starts here.
    // It takes 'args' (the raw input string) as its parameter.

    // First, parse the input string.
    // It's expected to have N on the first line, and array A elements on subsequent lines.
    const [ [ N ] , A ] = args . trim ( ) // Remove leading/trailing whitespace.
                               . split ( '\n' )   // Split into lines.
                               . map ( r => r . split ( ' ' ) // Split each line by space.
                                               . map ( v => v | 0 ) // Convert string parts to integers.
                                     )
                                     ;


    // Initialize an auxiliary array 'a'.
    // The first element is calculated based on the first element of A.
    const a = [ 1 - A[0] ] ;

    // Populate the rest of array 'a' using a forward loop.
    // Each element 'a[i]' depends on 'a[i-1]' and 'A[i]'.
    for ( let i = 1 ; i < N ; i ++ )
    {
        // Perform the calculation and add to array 'a'.
        a . push ( a[ i - 1 ] * 2 - A[ i ] ) ;
    }

    // Append a zero at the end of array 'a'. This acts as a boundary or sentinel.
    a . push ( 0 ) ;

    // Initialize a variable 'n' with the element from A at index N.
    let n = A[ N ] ;

    /*
     * Now, iterate backward through the arrays 'a' and 'A'.
     * This loop is crucial for the final calculation and validation.
     */
    for ( let i = N - 1 ; i >= 0 ; i -- )
    {
        // Calculate a temporary comparison value 'c'.
        // This value involves elements from 'a' and 'A' at index 'i+1'.
        const c = a[ i + 1 ] + A[ i + 1 ] ;

        // Apply conditional logic based on 'a[i]' and 'c'.
        if ( a[ i ] > c )
        {
            // If 'a[i]' is greater than 'c', update 'a[i]' to 'c'.
            a[ i ] = c ;
        }
        else if ( a[ i ] * 2 < c )
        {
            // If 'a[i] * 2' is less than 'c', it indicates an invalid condition.
            // In this case, the function immediately returns the string '-1'.
            return '-1' ;
        }

        // Accumulate the value of 'n' by adding 'a[i]' and 'A[i]'.
        n += a[ i ] + A[ i ] ;
    }

    // After all calculations, return the final value of 'n', converted to a string.
    return `${ n }` ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // Read input from standard input.