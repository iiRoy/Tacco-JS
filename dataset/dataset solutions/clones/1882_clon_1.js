function        Main (   input   )
{

    // Initialize the input by splitting it into an array of lines.
    // This assumes each line of input represents a distinct piece of data.
    input    =    input.split( "\n" ) ;

    // Define a BigInt constant 'mod' for modulo arithmetic.
    // This value is frequently used in competitive programming for large number calculations.
    var   mod   =   998244353n   ;

    /*
     * Parse the first element of the input array (input[0]).
     * It's expected to contain space-separated numbers.
     * N represents the first number, converted to BigInt.
     */
    var   N   =   BigInt (   parseInt (   input[0].split(" ")[0]   )   ) ;

    // M represents the second number from the first line, also converted to BigInt.
    var   M   =   BigInt (   parseInt (   input[0].split(" ")[1]   )   ) ;

    // K represents the third number from the first line, converted to BigInt.
    var   K   =   BigInt (   parseInt (   input[0].split(" ")[2]   )   ) ;

    // Create a memoization array 'memo' of size K+1, initialized with 0n (BigInt zero).
    // This array could potentially be used for dynamic programming, though its usage
    // appears to be limited in the current implementation.
    var   memo   =   new   Array (   K   +   1n   ) . fill (   0n   ) ;

    // Set the first element of the memo array to M.
    memo [ 0 ]   =   M ;

    // Initialize the final answer variable 'ans' to BigInt zero.
    var   ans   =   0n ;

    // Initialize a temporary variable 'x' used in calculations.
    var   x   =   M   -   1n ;

    // Conditional block to perform calculations on 'x' if N-2n-K is at least 1.
    // This loop calculates (M-1)^(N-2-K) modulo 'mod'.
    if (   N   -   2n   -   K   >=   1n   )
    {
        // Loop from 0 up to (N - 2 - K - 1).
        for (   var   i   =   0   ;   i   <   N   -   2n   -   K   ;   i   ++   )
        {
            // Multiply x by (M-1) and take modulo.
            x   =   (   x   *   (   M   -   1n   )   )   %   mod ;
        }
    }


    // If 'x' becomes 0n after the previous calculations, reset it to 1n.
    // This handles cases where (M-1) might be 0, ensuring correct multiplication later.
    if (   x   ==   0n   )
    {
        x   =   1n ;
    }

    // Main loop for calculating the final answer.
    // Iterates from K down to 0 (inclusive).
    for (   var   i   =   K   ;   i   >=   0n   ;   i   --   )
    {
        // Calculate a term for the answer: (combinations(N-1, i) * M * x) % mod.
        // Then add it to 'ans' and take modulo.
        ans   =   (   ans   +   (   (   (   combinations (   N   -   1n   ,   i   )   )   %   mod   *   M   )   %   mod   *   x   )   %   mod   )   %   mod ;

        // Update 'x' for the next iteration: x = (x * (M-1)) % mod.
        x   =   (   x   *   (   M   -   1n   )   )   %   mod ;
    }

    /*
     * Nested function: product_Range
     * Calculates the product of numbers from 'a' to 'b' (inclusive), modulo 'mod'.
     * This is used for factorials or partial products in combinations.
     */
    function   product_Range (   a   ,   b   )
    {
        var   prd   =   a   ,   i   =   a   ;

        // Loop while 'i' is less than 'b'.
        while (   i   ++   <   b   )
        {
            // Multiply 'prd' by the incremented 'i' and take modulo.
            prd   =   (   prd   *   i   )   %   mod ;
        }
        return   prd ;
    }


    /*
     * Nested function: combinations
     * Calculates "n choose r" (nCr) modulo 'mod'.
     * Uses modular inverse for division.
     */
    function   combinations (   n   ,   r   )
    {
        // Base cases for combinations: nCr = 1 if r=0 or r=n.
        if (   n   ==   r   ||   r   ==   0n   )
        {
            return   1n ;
        }
        else
        {
            // Optimize r: nCr = nC(n-r). Choose the smaller 'r' for fewer calculations.
            r   =   (   r   <   n   -   r   )   ?   n   -   r   :   r ;

            // Calculate modular inverse of (n-r)!
            var   inv   =   modinv (   product_Range (   1n   ,   n   -   r   )   ,   mod   ) ;

            // Return (product(r+1 to n) * inv) % mod.
            return   (   product_Range (   r   +   1n   ,   n   )   *   inv   )   %   mod ;
        }
    }

    /*
     * Nested function: modpow
     * Calculates (base ^ exponent) % modulus using binary exponentiation (exponentiation by squaring).
     */
    function   modpow (   a   ,   n   ,   mod   )
    {
        // Initialize result to 1n.
        var   res   =   1n ;

        // Loop while exponent 'n' is greater than 0.
        while (   n   >   0   )
        {
            // If the last bit of 'n' is 1 (n is odd), multiply 'res' by 'a'.
            if (   n   &   1n   )   res   =   res   *   a   %   mod ;

            // Square 'a' for the next iteration.
            a   =   a   *   a   %   mod ;

            // Right shift 'n' by 1 bit (equivalent to n = n / 2).
            n   >>=   1n ;
        }
        return   res ;
    }

    /*
     * Nested function: modinv
     * Calculates the modular multiplicative inverse of 'a' modulo 'mod'.
     * Uses Fermat's Little Theorem: a^(mod-2) % mod is the inverse if 'mod' is prime.
     */
    function   modinv (   a   ,   mod   )
    {
        return   modpow (   a   ,   mod   -   2n   ,   mod   ) ;
    }

    // Output the final answer to the console as a string.
    console.log (   '%s'   ,   ans.toString (   )   ) ;

    // Return the calculated answer.
    return   ans ;
}


/*
 * Global function: debug
 * This function appears to be for testing purposes, likely in a web environment.
 * It takes an integer 'n', retrieves input/output from specific HTML elements,
 * calls the Main function, and displays "AC" or "WA" (Accepted/Wrong Answer).
 */
function   debug (   n   )
{
    // Get input from an HTML element with id "input" + n.
    var   input   =   document.getElementById (   "input"   +   n   ) . value ;

    // Call the main logic function.
    var   ans   =   Main (   input   ) ;

    // Initialize result string.
    var   result   =   "WA" ;

    // Compare the calculated answer with the expected output from an HTML element.
    if (   ans   ==   document.getElementById (   "output"   +   n   ) . value . split (   "\n"   ) [ 0 ]   )
    {
        result   =   "AC" ;
    }

    // Display the result in an HTML element with id "result" + n.
    document.getElementById (   "result"   +   n   ) . innerHTML   =   result ;
}

// Call the Main function with input read from standard input.
// This is typical for competitive programming environments like Node.js.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   ) ;