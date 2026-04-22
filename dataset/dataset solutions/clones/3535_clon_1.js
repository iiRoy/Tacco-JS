const MOD =  10**9 + 7; /* A common modulo value for competitive programming */
const N = 10**5 + 1000; /* Upper bound for array sizes */


// Initialize arrays for factorials and inverse factorials
let fac = [ ... new Array(N) ] . fill(0);
let ifac = [ ... new Array(N) ] . fill(0); // This will store inverse factorials modulo MOD


/**
 * Performs prime factorization of a given number n.
 *
 * @param {number} n The number to factorize.
 * @returns {Array<Object>} An array of objects, where each object has properties 'p' (prime factor) and 'e' (exponent).
 */
const factorization = ( n ) => {
  let primes = [ ] ; // Stores the prime factors and their exponents

  // Loop from 2 up to sqrt(n)
  for ( let i = 2 ; i * i <= n ; i ++ ) {
    let exponent = 0 ; // Counter for the exponent of the current prime factor 'i'

    // While 'i' divides 'n', increment exponent and divide 'n' by 'i'
    while ( n % i === 0 ) {
      n /= i ;
      exponent ++ ;
    }

    // If 'i' was a factor (exponent > 0), add it to the primes array
    if ( exponent ) {
      primes . push ( { p : i , e : exponent } ) ;
    }
  }

  // If n is still greater than 1 after the loop, it means the remaining n is a prime factor itself
  if ( n !== 1 ) {
    primes . push ( { p : n , e : 1 } ) ;
  }

  return primes ; // Return the list of prime factors
} ;




/*
 * Function to calculate modular exponentiation (x^n % MOD)
 * Uses binary exponentiation (exponentiation by squaring) for efficiency.
 */
const mpow = ( x , n ) => {
  ans = BigInt( 1 ) ; // Initialize answer as BigInt to handle large numbers
  let _x = BigInt( x ) ; // Convert base to BigInt

  while ( n != 0 ) {
    // If n is odd, multiply ans by _x
    if ( n & 1 ) {
      ans = ans * _x % BigInt( MOD ) ;
    }

    // Square _x and take modulo
    _x = _x * _x % BigInt( MOD ) ;

    // Right shift n by 1 (equivalent to n = n / 2)
    n = n >> 1 ;
  }

  return Number( ans ) ; // Convert the final BigInt result back to a Number
} ;


/**
 * Calculates the binomial coefficient C(n, r) modulo MOD.
 * Uses precomputed factorials and inverse factorials.
 *
 * @param {number} n The total number of items.
 * @param {number} r The number of items to choose.
 * @returns {number} C(n, r) % MOD.
 */
const comb = ( n , r ) => {
  // Base cases for combinations
  if ( n == 0 && r == 0 ) return 1 ;
  if ( n < r || n < 0 ) return 0 ; // C(n, r) is 0 if n < r or n is negative

  // C(n, r) = n! / (r! * (n-r)!)
  // In modular arithmetic: C(n, r) = n! * (r!)^(-1) * ((n-r)!)^(-1) % MOD
  // const tmp = ifac[n-r] % MOD * ifac[r] % MOD; // Original line (commented out)
  const tmp = ( BigInt( ifac[n-r] ) * BigInt( ifac[r] ) ) % BigInt( MOD ) ;

  return Number( ( tmp * BigInt( fac[n] ) ) % BigInt( MOD ) ) ;
} ;


/*
 * This function initializes the factorial (fac) and inverse factorial (ifac) arrays.
 * It computes factorials iteratively and inverse factorials using Fermat's Little Theorem (a^(MOD-2) % MOD).
 */
const init = ( ) => {
  fac[0] = 1 ; // 0! is 1
  ifac[0] = 1 ; // Inverse of 0! is 1

  for ( let i = 0 ; i < N ; i ++ ) {
    // Calculate fac[i+1] = (fac[i] * (i+1)) % MOD
    fac[i+1] = fac[i] * ( i + 1 ) % MOD ; // Precomputing n! (mod M)

    // Calculate ifac[i+1] = (fac[i+1])^(MOD-2) % MOD
    // This uses modular inverse property: a^(p-2) % p for prime p
    // ifac[i+1] = ifac[i]*mpow(i+1, MOD-2) % MOD; // Original line (commented out)
    ifac[i+1] = mpow( fac[i+1] , MOD - 2 ) % MOD ;
  }
} ;


/**
 * The main function to process input and calculate the result.
 * It reads two numbers, n and m, performs prime factorization on m,
 * then uses combinations to calculate the final answer.
 *
 * @param {string} arg Input string containing two space-separated numbers.
 */
const main = ( arg ) => {
  // Parse input string into two numbers, n and m
  let [ n , m ] = arg . split( " " ) . map( Number ) ;

  // Get the prime factorization of m
  let factors = factorization( m ) ;

  let ans = 1 ; // Initialize the answer

  init( ) ; // Initialize factorial and inverse factorial arrays

  // Iterate over each prime factor and its exponent
  Object . keys( factors ) . forEach( f => {
    // This part calculates C(e + n - 1, e) for each factor.
    // This is equivalent to "stars and bars" problem: distributing 'e' identical items into 'n' distinct bins.
    let a = factors[f].e + n - 1 ;
    let b = factors[f].e ;

    // Optimization for C(N, K) = C(N, N-K)
    // Choose the smaller 'K' for combination calculation
    if ( a < 2 * b ) b = a - b ;

    // Multiply the answer by the combination result for the current factor
    ans *= comb( a , b ) ;
    ans %= MOD ; // Take modulo to prevent overflow
  } ) ;

  console . log( ans ) ; // Output the final calculated answer
} ;

// Read input from stdin and pass it to the main function
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;