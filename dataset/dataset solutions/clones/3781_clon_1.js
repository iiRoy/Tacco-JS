/*
 * This is the primary function for solving the given problem.
 * It processes an input string 's' and calculates a result.
 */
function Main( s ) {
  // Parse the input string: split by space and convert to numbers.
  s = s . split ( " " ) . map ( a => + a );

  /*
   * Initialize main variables from the parsed input array.
   * n: total items
   * a: cost of item A
   * b: cost of item B
   * c: combined cost (a + b)
   * k: target value
   */
  var n = s[0];
  var a = s[1];
  var b = s[2];

  var c = a + b ;

  var k = s[3];

  // Calculate an initial upper bound for 'j'.
  var j = Math . floor ( k / c );

  // Flag to indicate if a valid combination is found.
  var f = 0 ;

  // Array to store valid combinations (pairs of counts).
  var z = [ ] ;

  /*
   * Iterate downwards from the initial 'j' to find initial valid combinations.
   * This loop tries to find ways to form 'k' using multiples of 'c' (j times)
   * and then checking if the remainder can be formed by 'a' or 'b' alone.
   */
  for ( var i = j ; i >= 0 ; i-- ) {

    // Check if the remaining amount can be perfectly divided by 'a'.
    if ( ( k - i * c ) % a === 0 ) {
      f = 1 ; // Set flag: a solution is found.
      z . push ( ( k - i * c ) / a , 0 ) ; // Store (count_a, count_b)
    }

    // Check if the remaining amount can be perfectly divided by 'b'.
    if ( ( k - i * c ) % b === 0 ) {
      f = 1 ; // Set flag: a solution is found.
      z . push ( 0 , ( k - i * c ) / b ) ; // Store (count_a, count_b)
    }

    // If a solution was found in this iteration, break early.
    if ( f )
      break ;
  }

  // Update 'j' to the last valid 'i' from the loop.
  j = i ;

  // If no initial combination was found, output 0 and exit.
  if ( ! f ) {
    console . log ( 0 ) ;
    return ;
  }

  // Initialize the answer variable.
  var ans = 0 ;

  // Pre-calculate factors for shifting combinations.
  var aa = ( c % a === 0 ? c / a : 0 ) ;
  var bb = ( c % b === 0 ? c / b : 0 ) ;

  /*
   * Main loop to iterate through combinations and calculate the total ways.
   * It uses 'z' as a queue of current combinations and 'y' for next combinations.
   */
  while ( z . length && j >= 0 ) {
    var y = [ ] ; // New list of combinations for the next iteration.
    var x = { } ; // Hash map to track unique combinations processed in this 'j' iteration.

    // Process each pair in 'z'.
    for ( i = 0 ; i < z . length ; i += 2 ) {
      // Skip if this combination (z[i], z[i+1]) has already been processed for current 'j'.
      if ( x[z[i] + "a" + z[i+1]] )
        continue ;

      // Validate the combination: counts must be non-negative and total items must not exceed 'n'.
      if ( z[i] < 0 || z[i+1] < 0 || j + z[i] + z[i+1] > n )
        continue ;

      // Mark this combination as processed.
      x[z[i] + "a" + z[i+1]] = 1 ;

      // Add to the total answer using modular combinations.
      ans += abmod ( nCrmod ( n , j ) , nCrmod ( n - j , z[i] ) , nCrmod ( n - j - z[i] , z[i+1] ) ) ;
      ans %= mod ; // Ensure result stays within the modulo.

      // Generate new combinations for the next iteration (j-1).
      // Option 1: Increment both counts by 1.
      y . push ( z[i] + 1 , z[i+1] + 1 ) ;

      // Option 2: Shift 'c' to 'a' if possible (add 'aa' to count_a).
      if ( aa )
        y . push ( z[i] + aa , z[i+1] ) ;

      // Option 3: Shift 'c' to 'b' if possible (add 'bb' to count_b).
      if ( bb )
        y . push ( z[i] , z[i+1] + bb ) ;
    }

    z = y ; // Update 'z' with the new combinations.
    j-- ;   // Decrement 'j' for the next iteration.
  }


  // Output the final calculated answer.
  console . log ( ans ) ;
}


/*
 * Function for modular multiplication of multiple arguments.
 * It takes an arbitrary number of arguments and multiplies them modulo 'mod'.
 */
function abmod ( ) {
  var rt = arguments[0] ; // Initialize result with the first argument.

  // Loop through remaining arguments and perform modular multiplication.
  for ( var i = 1 ; i < arguments . length ; i++ ) {
    /*
     * This is a specific optimization for modular multiplication,
     * often used in competitive programming for larger numbers or specific modulo properties.
     * It effectively splits the multiplication into parts to prevent overflow before modulo.
     * (rt >>> 16) * arguments[i] % mod * 0x10000 handles the higher bits.
     * (rt & 0xFFFF) * arguments[i] handles the lower bits.
     * Then they are combined and taken modulo 'mod'.
     */
    rt = ( rt >>> 16 ) * arguments[i] % mod * 0x10000 + ( rt & 0xFFFF ) * arguments[i] ;
    rt %= mod ; // Apply modulo after each multiplication step.
  }
  return rt ; // Return the final modular product.
}

/*
 * Function for modular exponentiation (a^n % mod).
 * Uses binary exponentiation (exponentiation by squaring) for efficiency.
 */
function powmod ( a , n ) {
  var rt = 1 ; // Initialize result to 1.

  // Loop while exponent 'n' is greater than 0.
  while ( n ) {
    // If the least significant bit of 'n' is 1, multiply 'a' with the current result.
    if ( n & 1 )
      rt = abmod ( a , rt ) ;

    a = abmod ( a , a ) ; // Square 'a' modulo 'mod'.
    n >>>= 1 ;            // Right shift 'n' by 1 (equivalent to n = floor(n / 2)).
  }
  return rt ; // Return the final modular power.
}

// Global constant for the modulo value.
var mod = 998244353 ;

// Arrays to cache factorials and inverse factorials modulo 'mod'.
var fact = [ 1 , 1 ] ;     // fact[i] stores i! % mod
var factinv = [ 1 , 1 ] ;  // factinv[i] stores (i!)^(-1) % mod

/*
 * Function to calculate factorial n! modulo 'mod'.
 * It memoizes results in the 'fact' array.
 */
function factmod ( n ) {
  // Compute factorials from the last known value up to 'n'.
  for ( var i = fact . length ; i <= n ; i++ ) {
    fact[i] = abmod ( fact[i-1] , i ) ;
  }
  return fact[n] ; // Return n! % mod.
}

/*
 * Function to calculate inverse factorial (n!)^(-1) modulo 'mod'.
 * It uses Fermat's Little Theorem (a^(mod-2) % mod) for modular inverse.
 * It also memoizes results in 'factinv' array.
 */
function factinvmod ( n ) {
  // Ensure fact[n] is calculated before computing its inverse.
  if ( ! fact[n] )
    factmod ( n ) ;

  // Calculate (n!)^(-1) using powmod.
  factinv[n] = powmod ( fact[n] , mod - 2 ) ;

  // Back-calculate inverse factorials for values less than 'n' down to 1.
  // This is efficient as ( (n-1)! )^-1 = (n!)^-1 * n
  while ( ! factinv[n-1] ) {
    factinv[n-1] = abmod ( factinv[n] , n-- ) ;
  }
}

/*
 * Function to calculate "n choose r" (nCr) modulo 'mod'.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1 (mod mod)
 * It uses precomputed factorials and inverse factorials.
 */
function nCrmod ( n , r ) {
  // Ensure inverse factorials up to 'n' are computed.
  if ( ! factinv[n] )
    factinvmod ( n ) ;

  // Calculate nCr using modular multiplication of factorials and inverse factorials.
  return abmod ( fact[n] , factinv[r] , factinv[n-r] ) ;
}

// Main program execution: read input from stdin and pass to Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;