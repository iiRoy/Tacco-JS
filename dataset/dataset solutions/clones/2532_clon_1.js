function isPrime( num ) { // This function determines if a given number is a prime number.
    /*
     * A prime number is a natural number greater than 1 that has no positive divisors
     * other than 1 and itself.
     */

    // Special handling for edge cases and small numbers for optimization.
    if ( num === 1 ) {
        // According to mathematical definition, 1 is not a prime number.
        return false;
    }


    else if ( num === 2 ) {
        // 2 is the smallest and the only even prime number.
        return true;
    }


    else if ( num % 2 === 0 ) {
        // Any other even number (greater than 2) is divisible by 2 and thus not prime.
        return false;
    }


    // Quick checks for divisibility by small odd primes (3, 5, 7).
    // This helps to quickly filter out multiples of these primes.
    else if ( num !== 3 && num % 3 == 0 ) {
        return false; // If it's not 3 itself but a multiple of 3, it's not prime.
    }


    else if ( num !== 5 && num % 5 == 0 ) {
        return false; // If it's not 5 itself but a multiple of 5, it's not prime.
    }


    else if ( num !== 7 && num % 7 == 0 ) {
        return false; // If it's not 7 itself but a multiple of 7, it's not prime.
    }


    /*
     * For numbers that pass the initial checks,
     * we only need to check for divisors up to the square root of the number.
     * We also only need to check odd divisors, starting from 3,
     * because even divisors (other than 2, already handled) would have made the number even.
     */
    for ( var i = 3 ; i <= Math.sqrt( num ) ; i += 2 ) {
        if ( num % i === 0 ) {
            return false; // If a divisor is found, the number is not prime.
        }
    }


    // If no divisors were found after all checks, the number is prime.
    return true;
}


// This function computes the Greatest Common Divisor (GCD) of two numbers
// using the famous Euclidean algorithm.
function gcd( a, b ) {

    // The base case for the Euclidean algorithm:
    // If the second number (b) is 0, then the GCD is the first number (a).
    if ( b === 0 ) {
        return a;
    }

    // Recursive step: The GCD of a and b is the same as the GCD of b and the remainder of a divided by b.
    return gcd( b, a % b );
}


/**
 * The main entry point function for the program.
 * It processes the input, performs calculations, and outputs the result.
 *
 * @param { string } input - The complete input string read from standard input.
 */
function Main( input ) {

    // First, the input string is split into an array of lines.
    input = input.split( "\n" );

    // The first line of the input is then split by spaces
    // to separate the two numbers provided by the user.
    inputStr = input[0].split( " " );


    // Convert the string representations of the numbers into actual integers.
    var A = Number.parseInt( inputStr[0] );
    var B = Number.parseInt( inputStr[1] );


    // Calculate the Greatest Common Divisor (GCD) of the two input numbers, A and B.
    var gdc_val = gcd( A, B );


    // Declare and initialize arrays to store results.
    // 'ans' will store all positive divisors of the 'gdc_val'.
    var ans = [];
    // 'tmp' is an auxiliary array, its specific use might be for other related tasks,
    // but here it's simply populated in parallel with 'ans'.
    var tmp = [];


    // Loop through all numbers from 1 up to the calculated GCD value.
    // This loop identifies all positive divisors of 'gdc_val'.
    for ( var i = 1 ; i <= gdc_val ; i++ ) {

        // Check if 'i' divides 'gdc_val' evenly (i.e., with no remainder).
        if ( gdc_val % i === 0 ) {

            ans.push( i ); // If 'i' is a divisor, add it to the 'ans' array.

            tmp.push( 0 ); // Add a placeholder (0) to the 'tmp' array.
        }
    }


    // Initialize a counter to keep track of how many of the divisors are prime.
    var cnt = 0;


    // Iterate over the 'ans' array (which contains all divisors of 'gdc_val').
    // IMPORTANT: The loop starts from index 1 and goes up to and including 'ans.length'.
    // This means 'ans[0]' (which is always 1) is skipped, and 'ans[ans.length]' (which is 'undefined')
    // will be accessed on the last iteration.
    // This behavior is preserved as per Type I cloning rules.
    for ( var i = 1 ; i <= ans.length ; i++ ) {

        // Call the 'isPrime' function to check if the current divisor is a prime number.
        if ( isPrime( ans[i] ) === true ) {
            cnt += 1; // If it is prime, increment the prime count.
        }
    }


    // Finally, print the total count of prime divisors to the console.
    console.log( cnt );
}


// This line is the actual execution trigger for the entire script.
// It reads the content of '/dev/stdin' synchronously as UTF-8
// and passes it as the 'input' argument to the 'Main' function.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );