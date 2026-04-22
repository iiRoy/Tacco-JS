/*
 * This JavaScript code processes input from standard input.
 * It primarily deals with modular arithmetic operations on BigInts.
 * The core logic involves modular exponentiation, modular inverse,
 * and a summation loop to calculate a final result.
 */
const input = require("fs").readFileSync("/dev/stdin", "utf8") ; // Read all input as a UTF-8 string.

// --- Function Definition: Modular Exponentiation ---

/**
 * Computes (base ^ exponent) % modulus efficiently.
 * This is a standard binary exponentiation algorithm.
 * @param   {bigint}   x   The base value.
 * @param   {bigint}   n   The exponent value.
 * @returns {bigint}       The result of x^n mod 'mod'.
 */
function pow(x, n)
{
    let res = 1n ; // Initialize result to 1 (BigInt).
    while (n > 0)
    {
        /*
         * If the current bit of 'n' is 1 (n is odd),
         * then multiply 'res' by 'x' and take modulo.
         */
        if (n & 1n)
        {
            res = res * x % mod ;
        }
        // Square the base 'x' and take modulo for the next iteration.
        x = x * x % mod ;
        // Right shift 'n' by 1 bit, effectively dividing it by 2.
        n >>= 1n ;
    }
    return res ; // Return the final calculated result.
}


// --- Function Definition: Modular Inverse ---

/**
 * Calculates the modular multiplicative inverse of 'x' modulo 'mod'.
 * This function assumes 'mod' is a prime number, using Fermat's Little Theorem:
 * a^(mod-2) % mod is the inverse of 'a' if 'mod' is prime.
 * @param   {bigint}   x   The number to find the inverse for.
 * @returns {bigint}       The modular inverse of 'x'.
 */
function inv(x)
{
    // Special case: The inverse of 1 is 1.
    if (x == 1n)
    {
        return 1n;
    }
    // Apply Fermat's Little Theorem using the 'pow' function.
    return pow(x, mod - 2n);
}

// --- Global Constant: Modulus ---

/*
 * The prime modulus used for all modular arithmetic operations
 * throughout this script.
 */
const mod = 998244353n ;


// --- Main Program Logic (Immediately Invoked Function Expression) ---

/*
 * This IIFE encapsulates the primary logic, processing the input
 * and performing the main combinatorial calculation.
 */
; ( ( input ) => {

    // Split the entire input string into an array of lines.
    const lines = input.split('\n') ;

    // Parse the first line to extract N, M, and K as BigInts.
    let [N, M, K] = lines[0].split(' ').map(BigInt) ;


    // Initialize variables for the main loop calculation.
    let ans   = 0n ; // Stores the accumulated final answer.
    let fa    = 1n ; // A term that seems to represent a factorial or product related to 'k'.
    let fa2   = 1n ; // Another product term, involving N and k.

    /*
     * The main loop iterates from k = 0 up to K (inclusive).
     * Inside the loop, combinatorial terms are calculated and summed up.
     */
    for (let k = 0n; k <= K; k++)
    {
        // Calculate 'fa' term. The (k || 1n) handles k=0, making it 1.
        // The original source code explicitly did NOT apply modulo to 'fa' on this line.
        fa = fa * (k || 1n) ; // Original comment here: "// % mod" (indicating no modulo operation).

        // Calculate 'fa2' term, applying modulo.
        // The (k || (N - 1n)) part is crucial and comes directly from the problem specification.
        fa2 = fa2 * (N - (k || (N - 1n))) % mod ;

        // Calculate an intermediate 'left' term, which involves fa2 divided by fa (modular inverse).
        let left = fa2 * inv(fa) ;

        // Accumulate the current term into 'ans'.
        // This term is (left * (M-1)^(N-(k+1)) * M) % mod.
        ans += left * pow((M - 1n), (N - (k + 1n))) * M % mod ;
    }

    // Finally, print the result to the console.
    // Ensure the final answer is within the modulus and converted to a string.
    console.log((ans % mod).toString()) ;

} ) ( input ) ; // Execute the IIFE, passing the 'input' variable.