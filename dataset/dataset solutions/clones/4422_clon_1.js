// This JavaScript file contains functions to calculate GCD, LCM, and process a list of numbers.
// The main function reads input from stdin, processes it, and prints the result to stdout.


/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 *
 * @param   {number}    a   The first non-negative integer.
 * @param   {number}    b   The second non-negative integer.
 * @returns {number}        The greatest common divisor of 'a' and 'b'.
 */
function    gcd ( a , b )
{
    // Check if 'a' is perfectly divisible by 'b'.
    // If it is, then 'b' is the GCD. This is the base case for the recursion.
    if  (   a   %   b   ==  0   )
    {
        return  b   ;
    }
    // If 'a' is not divisible by 'b', recursively call gcd with 'b' and the remainder of 'a' divided by 'b'.
    // This step reduces the problem to a smaller equivalent one.
    else
    {
        return  gcd (   b   ,   a   %   b   )   ;
    }
}


/**
 * Calculates the Least Common Multiple (LCM) of two non-negative integers.
 * The LCM is calculated using the formula: LCM(a, b) = |a * b| / GCD(a, b).
 *
 * @param   {number}    a   The first non-negative integer.
 * @param   {number}    b   The second non-negative integer.
 * @returns {number}        The least common multiple of 'a' and 'b'.
 */
function    lcm ( a , b )
{
    // First, calculate the Greatest Common Divisor (GCD) of 'a' and 'b'.
    // This is a necessary intermediate step for LCM calculation.
    var g   =   gcd (   a   ,   b   )   ;

    // Use the formula LCM(a, b) = (a * b) / GCD(a, b).
    // Note: This implementation assumes positive 'a' and 'b' as per typical problem constraints.
    return  a   *   b   /   g   ;
}


/**
 * The main function of the program.
 * It reads a string of numbers separated by newlines, converts them to actual numbers,
 * and then computes the LCM of all numbers (excluding the first one, which might be a count).
 * If there are exactly two numbers in the input (after parsing), it prints the second one.
 * Otherwise, it calculates the LCM of the second and subsequent numbers.
 *
 * @param   {string}    input   The raw input string, typically from standard input.
 */
function    main ( input )
{
    // Split the input string by newline characters to get an array of number strings.
    var num =   input   .   split (   '\n'   )   ;

    // Iterate through the array to convert each string element to a numeric type.
    // The Number() constructor or unary plus operator can be used for this conversion.
    for ( var i =   0   ;   i   <   num   .   length   ;   i ++ )
    {
        num [ i ]   =   Number (   num [ i ]   )   ;
    }

    // Check the number of elements in the processed array.
    // The problem statement implies specific behavior for different input sizes.
    if  (   num   .   length   ==  2   )
    {
        // If there are exactly two numbers, simply print the second number.
        // This might be a specific edge case handling or a simplified scenario.
        console   .   log (   num [ 1 ]   )   ;
    }
    else
    {
        // If there are more than two numbers, calculate the LCM of all numbers
        // starting from the second element (index 1) onwards.
        // Initialize the result with the LCM of the first two numbers to be processed.
        var res =   lcm (   num [ 1 ]   ,   num [ 2 ]   )   ;

        // Loop through the remaining numbers, starting from the fourth element (index 3).
        // Continuously update 'res' by calculating the LCM of the current 'res' and the next number.
        for ( var i =   3   ;   i   <   num   .   length   ;   i ++ )
        {
            res =   lcm (   res   ,   num [ i ]   )   ;
        }

        // After iterating through all relevant numbers, print the final calculated LCM.
        console   .   log (   res   )   ;
    }


}


// This is the entry point of the script.
// It reads the entire content of standard input as a UTF-8 string
// and passes it to the main function for processing.
main (   require ( "fs" )   .   readFileSync ( "/dev/stdin" , "utf8" )   )   ;