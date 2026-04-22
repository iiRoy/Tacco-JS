'use strict'; // This directive enforces stricter parsing and error handling in the code.

( function ( input ) { // This is an Immediately Invoked Function Expression (IIFE),
                      // designed to create a private scope for variables and functions.

  // Process the raw input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of substrings using one or more whitespace characters as delimiters.
  // 3. Convert each substring in the array to a number (the 'x-0' is a common shorthand for this).
  input = input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;

  // Extract the first number, which represents 'N', and remove it from the input array.
  const N = input . shift ( ) ;

  // Initialize an array 'dish' to count occurrences of numbers 1, 2, and 3.
  // 'zero' is a placeholder at index 0, as we're interested in indices 1, 2, and 3.
  const dish = [ 'zero' , 0 , 0 , 0 ] ;

  // Iterate over the remaining numbers in the 'input' array.
  input . forEach (
    function ( x ) { // For each number 'x'...
      dish [ x ] ++ ; // Increment the counter at the corresponding index in the 'dish' array.
    }
  ) ;

  // console.log( dish ); // This line was a commented-out debugging statement in the original code.

  // Declare and initialize a 3D array named 'dp' (dynamic programming table).
  // Its primary dimension is N+2 to accommodate potential index offsets.
  const dp = new Array ( N + 2 ) ;

  // Initialize the nested arrays for the 3D dp table.
  for ( let i = -1 ; i < N + 2 ; i ++ ) { // Loop for the first dimension of the dp table.

    dp [ i ] = new Array ( N + 2 - i ) ; // Create the second dimension array for the current 'i'.

    for ( let j = -1 ; j < N + 2 - i ; j ++ ) { // Loop for the second dimension of the dp table.

      // Create the third dimension array for the current 'i' and 'j', filling it with zeros.
      dp [ i ] [ j ] = new Array ( N + 2 - i - j ) . fill ( 0 ) ;

      // Set a specific boundary condition or sentinel value at index -1 for the third dimension.
      dp [ i ] [ j ] [ -1 ] = 0 ;
    }
  }


  // Perform the core dynamic programming calculations.
  // This section populates the dp table based on recurrence relations.
  for ( let i = 1 ; i <= N ; i ++ ) { // Outer loop, typically representing a state variable.

    // Calculate a base case or initial value for the current 'i' when 'j' and 'k' are 0.
    dp [ i ] [ 0 ] [ 0 ] = dp [ i - 1 ] [ 0 ] [ 0 ] + ( N / i ) ;

    for ( let j = 1 ; j <= i ; j ++ ) { // Middle loop, representing another state variable.

      // Calculate a value for the state (i-j, j, 0) based on previous states.
      dp [ i - j ] [ j ] [ 0 ] = N / i + dp [ i - j + 1 ] [ j - 1 ] [ 0 ] * ( j / i ) + dp [ i - j - 1 ] [ j ] [ 0 ] * ( ( i - j ) / i ) ;

      for ( let k = 1 ; k <= j ; k ++ ) { // Inner loop, for the third state variable.

        // Calculate a complex value for the state (i-j, j-k, k) by combining multiple previous states
        // and weighted probabilities (e.g., k/i, (j-k)/i, (i-j)/i).
        dp [ i - j ] [ j - k ] [ k ] = N / i
                                        + dp [ i - j ] [ j - k + 1 ] [ k - 1 ] * ( k / i )
                                        + dp [ i - j + 1 ] [ j - 1 - k ] [ k ] * ( ( j - k ) / i )
                                        + dp [ i - j - 1 ] [ j - k ] [ k ] * ( ( i - j ) / i ) ;
      }
    }
  }

  // Output the final result, which is the value stored in the dp table
  // at the indices corresponding to the counts of 1s, 2s, and 3s in the initial input.
  console . log ( dp [ dish [ 1 ] ] [ dish [ 2 ] ] [ dish [ 3 ] ] ) ;

// The IIFE is immediately executed. It reads the content of '/dev/stdin'
// using Node.js's 'fs' module, decodes it as 'utf8', and passes it as the 'input' argument.
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;