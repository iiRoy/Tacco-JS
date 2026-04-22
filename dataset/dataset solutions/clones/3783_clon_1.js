/**
 * This is the primary function responsible for solving the problem.
 * It takes a string 's' as input, processes it, and then prints the result.
 */
function     Main (  s  )
{
    // First, we parse the input string into an array of numbers.
    // The string is split by spaces, and each part is converted to a number.
    s = s . split ( " " ) . map (   a   =>   +a   )   ;

    // Extract problem parameters from the parsed array.
    var    n    =    s[0]   ; // Represents the total number of items or limit.
    var    a    =    s[1]   ; // First coefficient for the equation.
    var    b    =    s[2]   ; // Second coefficient for the equation.
    var    k    =    s[3]   ; // The target sum.

    // Initialize the answer variable.
    var    ans    =    0    ;

    // Start a loop to iterate through possible values for 'i'.
    // 'i' represents one part of the combination.
    for (  var   i   =   0  ;   i   <=   n  ;   i++  )
    {
        // Calculate 'x' based on 'k', 'i', and 'a'.
        // This is part of finding a pair (i, x/b) that sums up to k.
        var    x    =    k    -    i    *    a    ;

        // If 'x' becomes negative, it means further iterations for 'i' will also
        // result in negative 'x' values, so we can break early.
        if (   x    <    0   )
            break   ;

        // Check if 'x' is divisible by 'b' and if 'x/b' is within the valid range 'n'.
        if (   x    %    b    ===    0    &&    x    /    b    <=    n   )
        {
            // If conditions are met, calculate the combinations and add to the total answer.
            // nCrmod calculates "n choose r" modulo 'mod'.
            ans    +=    abmod (   nCrmod (   n  ,   i   )  ,   nCrmod (   n  ,   x    /    b   )   )   ;

            // Apply modulo operation to 'ans' to keep it within the defined range.
            ans    %=    mod   ;
        }
    }

    // Finally, print the calculated answer to the console.
    console . log (   ans   )   ;
}

/**
 * This function performs a chained multiplication modulo 'mod'.
 * It takes an arbitrary number of arguments and multiplies them sequentially.
 *
 * @returns The product of all arguments modulo 'mod'.
 */
function     abmod (  )
{
    // Initialize the result with the first argument.
    var    rt    =    arguments[0]   ;

    // Loop through the remaining arguments, starting from the second one.
    for (   var    i    =    1   ;   i    <    arguments . length   ;   i++   )
    {
        // This is an optimized multiplication modulo 'mod' for 32-bit integers,
        // often used to prevent overflow with large numbers before the final modulo.
        // It splits the number into high (>>> 16) and low (& 0xFFFF) parts.
        rt    =    (   rt    >>>    16   )    *    arguments[i]    %    mod    *    0x10000    +    (   rt    &    0xFFFF   )    *    arguments[i]   ;

        // Apply the modulo operation to the result.
        rt    %=    mod   ;
    }

    // Return the final result.
    return    rt   ;
}

/**
 * Calculates (a^n) % mod using binary exponentiation (also known as exponentiation by squaring).
 *
 * @param {number} a The base.
 * @param {number} n The exponent.
 * @returns {number} (a^n) % mod.
 */
function     powmod (   a  ,   n   )
{
    var    rt    =    1   ; // Initialize result to 1.

    // Loop while the exponent 'n' is greater than zero.
    while (   n   )
    {
        // If the least significant bit of 'n' is 1, multiply 'rt' by 'a'.
        if (   n    &    1   )
            rt    =    abmod (   a  ,   rt   )   ;

        // Square 'a' in each iteration.
        a    =    abmod (   a  ,   a   )   ;

        // Right shift 'n' by 1 bit, effectively dividing it by 2.
        n    >>>=    1   ;
    }

    return    rt   ;
}

// Define the modulo constant.
var    mod    =    998244353   ;

// Initialize arrays for factorials and inverse factorials.
// These are pre-calculated to speed up combination (nCr) calculations.
var    fact    =    [   1  ,  1   ]   ;
var    factinv    =    [   1  ,  1   ]   ;

/**
 * Calculates factorials up to 'n' modulo 'mod' and stores them in the 'fact' array.
 *
 * @param {number} n The upper limit for factorial calculation.
 * @returns {number} fact[n] (n! % mod).
 */
function     factmod (   n   )
{
    // Populate the 'fact' array from its current length up to 'n'.
    for (   var    i    =    fact . length   ;   i    <=    n   ;   i++   )
    {
        fact[i]    =    abmod (   fact[i-1]  ,   i   )   ;
    }

    return    fact[n]   ;
}

/**
 * Calculates inverse factorials up to 'n' modulo 'mod' and stores them in 'factinv' array.
 * This uses Fermat's Little Theorem for modular inverse: a^(mod-2) % mod = 1/a % mod.
 *
 * @param {number} n The upper limit for inverse factorial calculation.
 */
function     factinvmod (   n   )
{
    // Ensure that fact[n] is calculated before computing its inverse.
    if (   !fact[n]   )
        factmod (   n   )   ;

    // Calculate the modular inverse of fact[n] using powmod.
    factinv[n]    =    powmod (   fact[n]  ,   mod    -    2   )   ;

    // Back-calculate lower inverse factorials using the relation: (n-1)!^-1 = n!^-1 * n.
    // This loop continues until factinv[n-1] is populated.
    while (   !factinv[n-1]   )
    {
        factinv[n-1]    =    abmod (   factinv[n]  ,   n--   )   ;
    }
}

/**
 * Calculates "n choose r" (nCr) modulo 'mod'.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
 *
 * @param {number} n The total number of items.
 * @param {number} r The number of items to choose.
 * @returns {number} nCr % mod.
 */
function     nCrmod (   n  ,   r   )
{
    // Ensure inverse factorials are calculated up to 'n'.
    if (   !factinv[n]   )
        factinvmod (   n   )   ;

    // Apply the formula for nCr using pre-calculated factorials and inverse factorials.
    return    abmod (   fact[n]  ,   factinv[r]  ,   factinv[n-r]   )   ;
}

// Call the Main function with input read from standard input.
// This reads the entire file content, typically redirected from a file or piped.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin"  ,  "utf8" )   )   ;