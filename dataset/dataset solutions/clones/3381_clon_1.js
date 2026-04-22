process . stdin . resume ( ) ; /* Initialize standard input stream */

process . stdin . setEncoding ( 'utf8' ) ; // Set the encoding for input data to UTF-8

/*
 * This problem is from AtCoder.
 * Original link: https://atcoder.jp/contests/caddi2018/tasks/caddi2018_a
 * The task involves prime factorization and calculating a specific GCD.
 * This implementation provides a solution for the given problem constraints.
 */


const    factorization = ( n ) =>    {
    // Initialize an array to store prime factors and their exponents
    let    primes = [ ] ;

    for    ( let    i = 2 ;    i * i <= n ;    i ++ )    {
        let    exponent = 0 ; // Counter for the current prime's exponent

        while    ( n % i === 0 )    {
            n    /=    i ; // Divide n by i
            exponent ++ ; // Increment the exponent for prime i
        }

        // If i was a factor (i.e., its exponent is greater than 0), add it to the primes array
        if    ( exponent )    {
            primes . push ( {    p : i ,    e : exponent    } ) ;
        }
    }

    // After the loop, if n is still greater than 1, it means n itself is a prime factor
    if    ( n !== 1 )    {
        primes . push ( {    p : n ,    e : 1    } ) ; // Add the remaining prime factor
    }

    return    primes ; // Return the list of prime factors with their exponents
} ;


const    main = ( arg ) =>    {
    // Parse input string: N and P are separated by a space and converted to numbers
    const    [ N , P ] = arg . split ( " " ) . map ( Number ) ;

    // Perform prime factorization of the number P
    const    f = factorization ( P ) ;

    // Initialize the greatest common divisor (gcd) to 1
    gcd    =    1 ;

    // Iterate through each prime factor found in the factorization of P
    for    ( let    i = 0 ;    i < f . length ;    i ++ )    {
        // Calculate how many times the current prime factor f[i].p can be included
        // based on its exponent f[i].e and the given N
        let    tmp = Math . floor ( f [ i ] . e / N ) ;

        // Multiply gcd by the prime factor raised to the calculated power (tmp)
        // This incorporates the prime factor into the GCD result
        gcd    *=    f [ i ] . p ** tmp ;
    }

    // Output the final calculated greatest common divisor
    console . log ( gcd ) ;
    
} ;

// Read input from standard input (/dev/stdin) using Node.js file system module
// The input is read as 'utf8' and then passed to the main function
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;