'use strict'; // Enforces strict mode for cleaner code.

( function ( input ) {

  // Process the raw input string: trim whitespace, split by any whitespace,
  // then convert each part to a number.
  input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;

  // Declare and initialize key constants from the processed input.
  const N = input [ 0 ] , // First input value: N
        K = input [ 1 ] , // Second input value: K
        L = N - K + 1 ,   // Derived constant L
        M = ( 1e9 + 7 ) ; // A large prime modulus for arithmetic operations.

  /**
   * Calculates the sum of two numbers modulo M.
   * @param {number} a - The first operand.
   * @param {number} b - The second operand.
   * @returns {number} The sum (a + b) % M.
   */
  function sum ( a , b ) {
    return ( a + b ) % M ;
  }

  /**
   * Performs multiplication of two numbers using a custom method that
   * attempts to prevent overflow issues by splitting numbers into
   * 16-bit parts, all while applying modulo M.
   * This is a custom multiplication function to handle large numbers within modulo constraints.
   *
   * @param {number} a - The first number.
   * @param {number} b - The second number.
   * @returns {number} The product (a * b) % M.
   */
  function mult ( a , b ) {
    // Split 'a' and 'b' into 16-bit chunks for multiplication.
    // This technique is often used for arbitrary-precision multiplication or to work around
    // JavaScript's 53-bit integer limit if intermediate products exceed it,
    // though here it's primarily for modulo arithmetic.
    let A  =  ( a >> 16 ) ,          // Higher 16 bits of a
        B  =  ( b >> 16 ) ,          // Higher 16 bits of b
        A_ =  a - ( A << 16 ) ,      // Lower 16 bits of a (a % 2^16)
        B_ =  b - ( B << 16 ) ,      // Lower 16 bits of b (b % 2^16)

        // Calculate partial products, applying modulo M at each step
        // to keep numbers within manageable bounds.
        // C represents (A * B * 2^32) % M
        C  =  ( ( ( ( ( A * B ) % M ) << 16 ) % M ) << 16 ) % M ,
        // D represents (A * B_ * 2^16) % M
        D  =  ( ( ( A * B_ ) % M ) << 16 ) % M ,
        // E represents (A_ * B * 2^16) % M
        E  =  ( ( ( A_ * B ) % M ) << 16 ) % M ,
        // F represents (A_ * B_) % M
        F  =  ( A_ * B_ ) % M ,

        // Sum all partial products modulo M to get the final result.
        G  =  ( C + D + E + F ) % M ;

    return G ; // Return the final computed product modulo M.
  }


  // Initialize a 2D array for combinations (Pascal's Triangle).
  // The size is (N+1) x (n+1) for each row 'n'.
  // Each element combination[n][k] will store C(n, k).
  const combination = new Array ( N + 1 ) . fill ( 0 ) . map ( ( zero , n ) => new Array ( n + 1 ) . fill ( 1 ) ) ;

  // Populate the combination array using the Pascal's Identity: C(n, k) = C(n-1, k-1) + C(n-1, k).
  // Base cases: C(n, 0) = 1 and C(n, n) = 1 are already handled by the initialization (fill(1)).
  for ( let n = 2 ; n < N + 1 ; n ++ ) {
    for ( let k = 1 ; k < n ; k ++ ) {
      // Apply the sum function to ensure results stay within modulo M.
      combination [ n ] [ k ] = sum ( combination [ n - 1 ] [ k - 1 ] , combination [ n - 1 ] [ k ] ) ;
    }
  }


  // Initialize an empty array to store the computed answers.
  const ans = [ ] ;

  // Loop K times to calculate each required term.
  for ( let I = 0 ; I < K ; I ++ ) {
    // 'i' is 1-indexed, derived from 'I'.
    let i = I + 1 ;

    // Calculate the product of two combinations: C(L, i) * C(K-1, i-1) mod M.
    // Use the custom 'mult' function for multiplication modulo M.
    ans . push ( mult ( combination [ L ] [ i ] , combination [ K - 1 ] [ i - 1 ] ) ) ;
  }

  // Output the results, joining them with newline characters.
  // This prints each calculated answer on a new line.
  console . log ( ans . join ( '\n' ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // IIFE immediately invoked with input read from stdin.