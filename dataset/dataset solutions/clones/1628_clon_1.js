/*
 * This script reads an integer K from standard input,
 * and then finds the smallest positive integer consisting only of digit 7
 * that is divisible by K.
 * If no such number exists, it prints -1.
 */
const    input =   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
// Split the input string into an array of lines.
const lines = input . split ( '\n' )

// Parse K from the first line. The `- 0` ensures it's treated as a number.
const K = lines [ 0 ] - 0 ;

// Define a modulus for calculations to prevent overflow and keep numbers manageable.
const mod = 1000000007 ; // A common prime modulus

/**
 * Custom multiplication function that handles large numbers by performing
 * multiplication modulo 'mod'. It uses bitwise operations for efficiency.
 *
 * @param {number} a - The first operand.
 * @param {number} b - The second operand.
 * @returns {number} The product (a * b) modulo 'mod'.
 */
function mul (a , b ) {

    return ( ( ( a >> 16 ) * b ) % mod * 65536 + ( ( a & 65535 ) * b ) ) % mod ;
}

// Main execution block - an immediately invoked function expression (IIFE)
; ( ( input ) => {
    // Check for trivial cases where no solution exists.
    // If K is even or a multiple of 5, a number consisting only of 7s
    // can never be divisible by K (since 7 is not divisible by 2 or 5).
    if ( K % 2 === 0 || K % 5 === 0 ) {
        console . log ( -1 ) ; // Output -1 as per problem specification.
        return ; // Exit the function early.
    }

    let n = 0 ; // 'n' will accumulate the numbers like 7, 77, 777, ... modulo K.

    // Loop up to K iterations. K is the maximum possible length for the repeating cycle.
    for ( let i = 0 ; i <= K ; i ++ ) {
        let p = 1 ; // 'p' represents the power of 10 for the current digit 7.

        // Calculate 10^i using the custom mul function.
        for ( let j = 0 ; j < i ; j ++ ) {
            p = mul ( p , 10 ) ;
        }
        // Add 7 * (10^i) to n.
        n += mul ( p , 7 ) ;

        // Check if the current number (represented by n) is divisible by K.
        if ( n % K === 0 ) {
            console . log ( i + 1 ) ; // If divisible, 'i + 1' is the length of the number.
            break ; // Found the smallest length, so exit the loop.
        }
    }


} ) ( input ) ; // Pass the original input variable to the IIFE.