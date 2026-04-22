function      GCD    (    a,b   )   {
    /*
     * This function calculates the Greatest Common Divisor (GCD)
     * of two numbers using the Euclidean algorithm.
     * It takes two integer arguments, 'a' and 'b'.
     */
    var   m   =   Math.max ( a, b ) ;

    var   n   =   Math.min ( a, b ) ;

    while ( n   !=   0 ) {
        // Store the current value of n before updating it
        var   N   =   n   ;

        n   =   m   %   n   ;

        m   =   N   ;
    }
    // The GCD is stored in 'm' at the end of the loop
    return   m   ;
}

/*
 * Section for reading input from stdin.
 * This part uses Node.js 'fs' module to read the entire file.
 */
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;
// Process the input: trim whitespace and split by newline characters
var   Arr   =   input . trim ( ) . split ( "\n" ) ;

// Main processing loop: continues until a specific break condition is met
while ( true ) {

    // Read the first number from the array, converting it to a number
    var   n   =   Arr . shift ( ) - 0 ;

    // Check for the termination condition
    if ( n   ==   0 ) {
        break   ; // Exit the loop if n is 0
    }

    // Initialize an empty array to store processed fractions
    var   arr   =   [ ] ;

    /*
     * Loop to process 'n' pairs of numbers.
     * Each pair is read, its GCD is calculated, and then it's reduced to simplest form.
     */
    for ( var   I   =   0   ;   I   <   n   ;   I ++ ) {

        // Read a line, split by space, and map to Number type
        var   v   =   Arr . shift ( ) . split ( " " ) . map ( Number ) ;

        // Calculate the GCD of the two numbers in the pair
        var   gcd   =   GCD ( v [ 0 ] , v [ 1 ] ) ;

        // Push the reduced fraction [numerator/gcd, denominator/gcd] into 'arr'
        arr . push ( [ v [ 0 ]   /   gcd , v [ 1 ]   /   gcd ] ) ;
    }

    // Initialize lcm for the first set of calculations
    var   lcm   =   1   ;

    /*
     * Calculate the LCM of the denominators of the reduced fractions.
     * This ensures a common denominator for all fractions.
     */
    arr . forEach ( function ( v ) {
        var   gcd   =   GCD ( v [ 1 ] , lcm ) ; // GCD of current denominator and accumulated LCM
        lcm   =   ( v [ 1 ]   /   gcd )   *   ( lcm   /   gcd ) ; // Update LCM
    } ) ;

    /*
     * Map the array to convert each fraction to its numerator in terms of the common LCM.
     * This effectively scales all numerators to the calculated LCM.
     */
    arr   =   arr . map ( function ( v , i ) {
        return   v [ 0 ]   *   ( lcm   /   v [ 1 ] ) ;
    } ) ;

    // Reinitialize lcm to 1 for the next stage of calculation
    var   lcm   =   1   ;

    /*
     * This section appears to calculate LCM of the new 'arr' elements (which are now numerators).
     * Note: The original code uses `v[1]` and `GCD(v,lcm)` where `v` is a number after the `map` operation.
     * This might be a logical error in the original code, but it is preserved for Type I cloning.
     */
    arr . forEach ( function ( v ) {
        // v is now a single number, not an array. GCD(number, number) is called.
        var   gcd   =   GCD ( v , lcm ) ;
        // This line uses v[1], which is undefined if v is a number. This will result in NaN.
        // Preserving the original logic exactly as required for Type I clone.
        lcm   =   ( v [ 1 ]   /   gcd )   *   ( lcm   /   gcd ) ;
    } ) ;

    /*
     * Finally, iterate through the modified 'arr' and print the result
     * of dividing the final LCM by each element.
     * Due to the previous potential logical error, the output here might be NaN or unexpected.
     */
    arr . forEach ( function ( v ) {
        console . log ( lcm   /   v ) ;
    } ) ;

}