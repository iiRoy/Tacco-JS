function * stdinIter ( ) {
    /* This generator function reads input from /dev/stdin,
     * splits it by newlines or spaces, and yields each token. */
    const t = require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf-8" )
        . trim ( )
        . split ( / \n | \s / )
    ; // The raw input tokens.
    yield * t ; // Yield each token from the array.
}

function readMany ( t , e ) {
    // This function reads 't' number of values using an iterator.
    // 'e' can be an optional iterator, otherwise stdinIter() is used.
    const i = e || this . iter || ( this . iter = stdinIter ( ) ) ;
    const n = [ ] ; // Array to store the read values.

    // Loop 't' times to read the desired number of values.
    for ( let e = 0 ; e < t ; e += 1 ) {
        n . push ( i . next ( ) . value ) ;
    }
    return n ; // Return the array of read values.
}
; // End of readMany function definition.

( ( ) => {
    // This is an immediately invoked function expression (IIFE).
    // It serves as the main entry point for the program logic.

    // Read a single number 'n' from input and parse it as an integer.
    const [ n ] = readMany ( 1 ) . map ( it => parseInt ( it ) ) ;

    console . log ( 'start' ) ; /* A simple debug message to indicate program start. */

    let sum = 0 ; // Initialize the total sum variable.

    // Main loop: iterate from k = 1 up to n.
    for ( let k = 1 ; k <= n ; k += 1 ) {
        let count = 0 ; // Initialize a counter for divisors of 'k'.

        // Inner loop: find divisors of 'k' up to its square root.
        for ( let i = 1 ; ( i ** 2 ) <= k ; i += 1 ) {
            // If 'i' divides 'k' evenly, increment the count.
            if ( ( k % i ) == 0 ) {
                count += 1 ;
            }
        }

        // Multiply count by 2 because for every divisor 'i' < sqrt(k),
        // there is a corresponding divisor 'k/i'.
        count *= 2 ;

        // If 'k' is a perfect square, its square root was counted only once
        // (as 'i'), but it's a single divisor. So, we subtract 1.
        if ( Number . isInteger ( Math . sqrt ( k ) ) ) {
            count -= 1 ;
        }

        // Special handling for k = 1: it has only one divisor (1).
        // The above logic would give 2 (1*2 - 0 if not perfect square, or 1*2-1 if perfect square, which is 1).
        // Let's ensure it's explicitly 1.
        if ( k == 1 ) {
            count = 1 ;
        }

        // Add (k * count) to the total sum.
        sum += ( k * count ) ;
    }

    // Output the final calculated sum to the console.
    console . log ( sum ) ;
} ) ( ) ; // Invoke the IIFE.