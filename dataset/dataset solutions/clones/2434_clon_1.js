/*
 * This is the main entry point for the program.
 * It reads input, performs calculations, and then prints the result.
 */
zfunction Main ( input ) {
    // Process the raw input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into lines.
    // 3. For each line, split by spaces.
    input = input . trim ( ) . split ( "\n" ) . map (
        function ( x ) {
            return x . split ( " " )
        }
    ) ;

    // Define some large constants.
    // C is a large prime number, often used as a modulo in modular arithmetic.
    var C  = 1e+9 + 7 ;
    // C2 is another constant, potentially used for splitting numbers in calculations
    // to prevent overflow or optimize modular operations.
    var C2 = 1e+5 ;

    // Parse the input values X and Y from the first line of the processed input.
    var X = parseInt ( input [ 0 ] [ 0 ] , 10 ) ;
    var Y = parseInt ( input [ 0 ] [ 1 ] , 10 ) ;

    // Initialize the variable to store the final answer.
    var ans = 0 ;

    // Calculate 'n' based on the sum of X and Y.
    var n = ( X + Y ) / 3 ;

    // Calculate 'r' and 'r2' using specific linear combinations of X and Y.
    // These likely represent parameters for a combinatorial problem.
    var r  = ( 4 * X - 2 * Y ) / 6 ;
    var r2 = ( 4 * Y - 2 * X ) / 6 ;

    // Check for valid conditions:
    // - Both r and r2 must be non-negative.
    // - 'r' must be an integer (combinations are defined for integer values).
    if ( r >= 0 && r2 >= 0 && Number . isInteger ( r ) ) {
        // If conditions are met, calculate the binomial coefficient nCr_amari.
        // The third argument '1' indicates we want to calculate nCk once.
        var tmp = nCr_amari ( n , r , 1 , C , C2 ) ;
        // Store the first (and only) result from the nCr_amari function.
        ans = tmp [ 0 ] ;
    }

    // Output the calculated answer to the console.
    console . log ( ans ) ;
}


/**
 * Helper function to perform modular multiplication,
 * optimized for potentially large 'b' values by splitting 'b' into parts.
 * This technique helps prevent intermediate products from exceeding standard integer limits
 * before the modulo operation is applied.
 *
 * @param {number} a  - The first operand.
 * @param {number} b  - The second operand, which might be large.
 * @param {number} C  - The modulo value.
 * @param {number} C2 - A threshold used to split 'b'.
 * @returns {number}   - The result of (a * b) % C.
 */
function kakeruR ( a , b , C , C2 ) {
    var tmpQ , tmpR , ans ;

    // Split 'b' into a quotient (tmpQ) and a remainder (tmpR) based on C2.
    // `| 0` performs a bitwise OR with 0, effectively truncating to an integer.
    tmpQ = ( b / C2 | 0 ) ;
    tmpR = b - ( tmpQ * C2 ) ;

    // Perform the modular multiplication using the split parts.
    // (a * b) % C = (a * (tmpQ * C2 + tmpR)) % C
    //             = ((a * tmpQ * C2) % C + (a * tmpR) % C) % C
    ans = ( a * tmpQ % C ) * C2 % C + ( a * tmpR ) ;

    // Apply the final modulo to ensure the result is within [0, C-1].
    ans %= C ;

    return ans ;
}


/*
 * Function to calculate binomial coefficients (n choose k) modulo MOD.
 * It can calculate a series of coefficients: [nCk, (n+1)C(k+1), ..., (n+MAX-1)C(k+MAX-1)].
 * It precomputes factorials, inverse factorials, and modular inverses.
 *
 * @param {number} n    - The 'n' in nCk.
 * @param {number} k    - The 'k' in nCk.
 * @param {number} MAX  - The number of combinations to compute (e.g., 1 for just nCk).
 * @param {number} MOD  - The modulo value.
 * @param {number} C2   - Constant used by the kakeruR helper function.
 * @returns {Array<number>} - An array containing the calculated combinations modulo MOD.
 */
function nCr_amari ( n , k , MAX , MOD , C2 ) {
    // Array to store the final computed binomial coefficients.
    var v_ans = [ ] ;

    // Declare arrays for factorials (fac), inverse factorials (finv), and modular inverses (inv).
    var fac , finv , inv ;

    // Initialize base cases for factorials, inverse factorials, and modular inverses.
    fac  = [ 1 , 1 ] ; // fac[0] = 1, fac[1] = 1
    finv = [ 1 , 1 ] ; // finv[0] = 1, finv[1] = 1
    inv  = [ 0 , 1 ] ; // inv[0] is not used, inv[1] = 1

    // Pre-processing loop: Compute fac, inv, and finv up to MAX + n - 1.
    // This precomputation is crucial for efficient nCr calculations modulo a prime.
    for ( var i = 2 ; i < MAX + n ; i ++ ) {
        // Calculate factorial: fac[i] = (i * fac[i-1]) % MOD
        fac . push ( fac [ i - 1 ] * i % MOD ) ;

        // Calculate modular inverse using Fermat's Little Theorem or extended Euclidean algorithm.
        // inv[i] = MOD - (inv[MOD % i] * (MOD / i)) % MOD
        inv . push ( MOD - kakeruR ( inv [ MOD % i ] , ( MOD / i | 0 ) , MOD , C2 ) % MOD ) ;

        // Calculate inverse factorial: finv[i] = (finv[i-1] * inv[i]) % MOD
        finv . push ( kakeruR ( finv [ i - 1 ] , inv [ i ] , MOD , C2 ) ) ;
    }

    // Handle edge cases for binomial coefficient calculation.
    // If n < k, it's impossible to choose k items from n, so nCk is 0.
    if ( n < k ) {
        return 0 ;
    }
    // If n or k are negative, the input is invalid for combinations.
    if ( n < 0 || k < 0 ) {
        return 0 ;
    }

    // Calculate the desired binomial coefficients.
    // nCk = fac[n] * finv[k] * finv[n-k] (mod MOD)
    // The loop calculates (n+i)C(k+i) for i from 0 to MAX-1.
    for ( var i = 0 ; i < MAX ; i ++ ) {
        // Here, n_eff = n+i and k_eff = k+i.
        // The (n_eff - k_eff) term simplifies to (n - k), which is constant.
        v_ans . push ( kakeruR ( kakeruR ( fac [ n + i ] , finv [ k + i ] , MOD , C2 ) , finv [ n - k ] , MOD , C2 ) ) ;
    }

    return v_ans ; // Return the array of calculated combinations.
}


// This line is responsible for reading input from standard input
// and passing it to the Main function to start the program execution.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;