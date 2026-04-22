function         Main (   input   )
{
    // This is the primary entry point for the application.
    // It processes the input and calculates the final result based on mathematical operations.

    // First, preprocess the raw input string.
    // Trim any leading/trailing whitespace, then split the string by newline characters.
    // Each resulting line is further split by spaces, creating a 2D array of strings.
    input = input.trim(   ) . split ( "\n" ) . map ( function(x) { return x.split(" ") } ) ;

    // Parse the main parameters (N, M, K) from the first line of the processed input.
    // These are converted from strings to integers using base 10.
    var    N    =    parseInt (   input[0][0],    10   )    ;
    var    M    =    parseInt (   input[0][1],    10   )    ;
    var    K    =    parseInt (   input[0][2],    10   )    ;

    // Define constants used throughout the modular arithmetic calculations.
    var    C     =     998244353     ; // A large prime modulus (e.g., for competitive programming problems).
    var    C2    =     1e+5          ; // A constant used in the custom modular multiplication function (`kakeruR`).

    // Calculate combinations (N-1 choose K) using modular arithmetic.
    // The `nCr_amari` function returns an array of C(N-1, i) for i from 0 to K.
    // The result array `v` is then reversed, possibly for processing in reverse order.
    v = nCr_amari ( N - 1,   K,   C,   C2 ) . reverse ( ) ;

    // Calculate the initial term `tmp` for the upcoming loop using modular exponentiation.
    // This computes (M-1)^(N-K-1) modulo C.
    tmp = fastRuijoR ( M - 1,   N - K - 1,   C,   C2 ) ;

    // Initialize the accumulator variable for the final answer.
    var    ans    =    0    ;

    // Iterate through each pre-calculated combination term stored in `v`.
    for  ( var   x   of   v   )
    {
        // Accumulate the product of `tmp` and the current combination term `x`,
        // ensuring the operation is performed modulo C.
        ans += kakeruR ( tmp,   x,   C,   C2 ) ;

        // Apply the modulo C operation to `ans` to keep it within the valid range.
        ans %= C ;

        // Update `tmp` for the next iteration by multiplying it with (M-1), modulo C.
        // This effectively calculates (M-1)^(N-K-1+i) for each step in the loop.
        tmp = kakeruR ( tmp,   M - 1,   C,   C2 ) ;
    }

    // After the loop completes, perform one final modular multiplication:
    // Multiply the accumulated `ans` by M, modulo C.
    ans = kakeruR ( ans,   M,   C,   C2 ) ;

    // Output the final computed answer to the console.
    console.log ( ans ) ;
}

/*
 *  kakeruR: A custom modular multiplication function designed to prevent intermediate overflow.
 *  It calculates (a * b) % C efficiently, especially when 'a * b' might exceed standard integer limits
 *  before the modulo operation is applied. It achieves this by splitting 'b' using C2.
 *
 *  @param {number} a  - The first operand.
 *  @param {number} b  - The second operand.
 *  @param {number} C  - The modulus.
 *  @param {number} C2 - A constant (e.g., 10^5) used for splitting 'b' into a quotient and remainder.
 *  @returns {number} The result of (a * b) % C.
 */
function      kakeruR (   a,   b,   C,   C2   )
{
    // Declare variables for temporary quotient, remainder, and the final answer.
    var    tmpQ,
           tmpR,
           ans   ;

    // Calculate the integer quotient of b divided by C2. The bitwise OR with 0
    // ensures an integer result (similar to Math.floor for positive numbers).
    tmpQ = (   b   /   C2   |   0   )    ;

    // Calculate the remainder of b divided by C2.
    // This is equivalent to `b % C2` but calculated using the quotient.
    tmpR = b   -   (   tmpQ   *   C2   )    ;

    // Perform modular multiplication: (a * b) % C
    // This is broken down as: (a * (tmpQ * C2 + tmpR)) % C
    // Which simplifies to: ((a * tmpQ * C2) % C + (a * tmpR) % C) % C
    // The terms are carefully grouped to keep intermediate products within manageable bounds
    // before applying the modulo C.
    ans = (   a   *   tmpQ   %   C   )   *   C2   %   C   +   (   a   *   tmpR   )    ;

    // Apply the final modulo operation to ensure the result is within [0, C-1].
    ans %= C ;

    // Return the computed modular product.
    return   ans   ;
}

/*
 *  nCr_amari: Calculates modular binomial coefficients (nCk % MOD) for C(MAX, i).
 *  This function precomputes factorials, modular inverses, and inverse factorials
 *  up to MAX to efficiently compute combinations.
 *
 *  @param {number} MAX - The 'n' in nCk (the upper number in the combination).
 *  @param {number} k   - The upper limit for 'k' in nCk (combinations will be C(MAX, 0) to C(MAX, k)).
 *  @param {number} MOD - The modulus for all calculations.
 *  @param {number} C2  - A constant used by the `kakeruR` function for modular multiplication.
 *  @returns {Array<number>} An array containing [C(MAX, 0), C(MAX, 1), ..., C(MAX, k)] modulo MOD.
 */
function     nCr_amari (   MAX,   k,   MOD,   C2   )
{
    // --- Pre-processing phase: Compute factorials, inverse factorials, and modular inverses ---

    // Initialize an array to store the resulting binomial coefficients.
    var    v_ans    =    [   ]    ;

    // Declare arrays for storing precomputed factorials, inverse factorials, and modular inverses.
    var    fac,    finv,    inv   ;

    // Initialize base cases for factorials: 0! = 1, 1! = 1.
    fac    =    [   1,   1   ]    ;
    // Initialize base cases for inverse factorials: (0!)^(-1) = 1, (1!)^(-1) = 1 (mod MOD).
    finv   =    [   1,   1   ]    ;
    // Initialize base cases for modular inverses: inv[0] is unused, inv[1] = 1 (mod MOD).
    inv    =    [   0,   1   ]    ;

    // Loop to precompute factorials, modular inverses, and inverse factorials up to MAX.
    for    (   var   i   =   2   ;   i   <=   MAX   ;   i++   )
    {
        // Calculate factorial[i] = (factorial[i-1] * i) % MOD.
        fac . push (   fac[i - 1]   *   i   %   MOD   )    ;

        // Calculate modular_inverse[i] using the property:
        // inv[i] = MOD - (inv[MOD % i] * (MOD / i)) % MOD (for prime MOD)
        // `kakeruR` is used to handle modular multiplication.
        inv . push (   MOD   -   kakeruR (   inv[MOD % i],   (   MOD   /   i   |   0   ),   MOD,   C2   )   %   MOD   )    ;

        // Calculate inverse_factorial[i] = (inverse_factorial[i-1] * modular_inverse[i]) % MOD.
        // `kakeruR` is used for the modular multiplication.
        finv . push (   kakeruR (   finv[i - 1],   inv[i]   ,   MOD,   C2   )   )    ;
    }

    // --- Binomial coefficient calculation phase ---

    // Iterate from 0 up to `k` (inclusive) to compute C(MAX, i) for each `i`.
    for    (   var   i   =   0   ;   i   <=   k   ;   i++   )
    {
        // The binomial coefficient C(n, k) modulo MOD is calculated as:
        // C(n, k) = n! * (k!)^(-1) * ((n-k)!)^(-1) (mod MOD)
        // Using precomputed values: C(MAX, i) = fac[MAX] * finv[i] * finv[MAX - i] (mod MOD)
        // `kakeruR` is used for all modular multiplication steps.
        v_ans . push (   kakeruR (   kakeruR (   fac[MAX]   ,   finv[MAX - i],   MOD,   C2   ),   finv[i],   MOD,   C2   )   )    ;
    }

    // Return the array containing the calculated binomial coefficients.
    return   v_ans   ;
}


/*
 *  fastRuijoR: Implements modular exponentiation (a^b % C) using the method of binary exponentiation (also known as exponentiation by squaring).
 *  This algorithm significantly reduces the number of multiplications required for large exponents.
 *
 *  @param {number} a  - The base of the exponentiation.
 *  @param {number} b  - The exponent.
 *  @param {number} C  - The modulus.
 *  @param {number} C2 - A constant used by the `kakeruR` function for modular multiplication.
 *  @returns {number} The result of (a^b) % C.
 */
function     fastRuijoR (   a,   b,   C,   C2   )
{
    // Initialize the result to 1, as any number raised to the power of 0 is 1.
    var    ans    =    1    ;

    // Convert the exponent `b` to its binary string representation.
    // This allows iterating through its bits.
    var    binary    =    b . toString (   2   )    ;

    // Get the length of the binary string, which corresponds to the number of bits in `b`.
    var    l    =    binary . length    ;

    // Initialize a temporary variable `tmp` with the base `a`.
    // `tmp` will be repeatedly squared in each iteration.
    var    tmp    =    a    ;

    // Iterate through the bits of the exponent `b` from right to left (least significant bit to most significant bit).
    // The `substr` method with negative index and length 1 extracts bits starting from the right.
    for    (   var   i   =   0   ;   i   <   l   ;   i++   )
    {
        // If the current bit is '1', it means this power of 2 (a^(2^i)) contributes to the total product.
        // In this case, multiply `ans` by `tmp` (which holds a^(2^i)) modulo C.
        if    (   binary . substr (   (   i   +   1   )   *   -1,   1   )   ===   '1'   )
            ans    =    kakeruR (   ans,   tmp,   C,   C2   )    ;

        // Square `tmp` modulo C for the next iteration.
        // If `tmp` was a^(2^i), it becomes (a^(2^i))^2 = a^(2^(i+1)).
        tmp    =    kakeruR (   tmp,   tmp,   C,   C2   )    ;
    }

    // Return the final result of (a^b) % C.
    return   ans   ;
}

// This is the main execution line for the program.
// It reads input from standard input (`/dev/stdin`) as a UTF-8 string,
// and then passes this string to the `Main` function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin",   "utf8" )   )    ;