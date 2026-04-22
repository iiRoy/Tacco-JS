function myin() /* Reads input from stdin */ { return require("fs") .readFileSync( "/dev/stdin" , "utf8" ) .trim() ; } // End of myin function
function myout( t ) /* Outputs to console */ { console.log( t ); } // Function to print output

/*
 * Parameter 'no' for myconv function:
 * 0: Do nothing (return as is)
 * 1: Convert to integer
 * 2: Split by space
 * 3: Split by newline
 * 4: Split by space and convert to number array
 * 5: Split by newline and convert to number array
 * 6: Split into characters
 * 7: Split into characters and convert to number array
 */
function myconv( i , no ) { // This function handles various input conversions.
    switch ( no ) {
        case 0 : /* No conversion */ return i ;
        case 1 : /* Convert to integer */ return parseInt( i ) ;
        case 2 : /* Split by space */ return i.split( " " ) ;
        case 3 : /* Split by newline */ return i.split( "\n" ) ;
        case 4 : /* Split by space and map to numbers */ return i.split( " " ).map( ( a ) => Number( a ) ) ;
        case 5 : /* Split by newline and map to numbers */ return i.split( "\n" ).map( ( a ) => Number( a ) ) ;
        case 6 : /* Split into individual characters */ return i.split( "" ) ;
        case 7 : /* Split into characters and map to numbers */ return i.split( "" ).map( ( a ) => Number( a ) ) ;
    }
}

function Main ( input ) {
  // Convert the input to an integer using the custom conversion function.
  input = myconv( input , 1 ) ;

  /*
   * The number of divisors of an integer N can be calculated as:
   * (exponent_of_prime_1 + 1) * (exponent_of_prime_2 + 1) * ...
   * This section calculates the prime factorization counts for all numbers up to 'input'.
   */

  // Initialize an array to store the counts of each prime factor.
  // The size is 'input + 1' to allow direct indexing.
  var list = new Array( input + 1 ) .fill( 0 ) ;

  // Define a modulo constant for large number operations.
  var mod = 1000000007 ;

  // Loop through all numbers from 1 up to the given input.
  for ( var i = 1 ; i <= input ; i ++ ) {

    // Special handling for the number 1.
    if ( i == 1 ) {
      list[ 1 ] = 1 ; // For N=1, the number of divisors is 1.
      continue ;     // Move to the next iteration.
    }
    else {
      // For numbers greater than 1, find their prime factors.
      var tmp = i ;
      // Iterate from the smallest prime (2) upwards.
      for ( var j = 2 ; j <= tmp ; ) {
        // If 'j' is a factor of 'tmp'.
        if ( tmp % j == 0 ) {
           list[ j ] ++ ; // Increment the count for prime factor 'j'.
          tmp /= j ;     // Divide 'tmp' by 'j' to continue factorization.
        }
        else {
          j ++ ; // If 'j' is not a factor, try the next potential prime.
        }
      }
    }
  }

  // Calculate the final output, which is the product of (prime_count + 1) for each prime, modulo 'mod'.
  var output = 1 ;

  // Iterate through the 'list' of prime factor counts.
  for ( var i = 2 ; i < list.length ; i ++ ) {
    // Only consider primes that actually appeared as factors.
    if ( list[ i ] != 0 ) {
       output = output * ( list[ i ] + 1 ) % mod ; // Apply the formula and modulo operation.
    }
  }

  // The original code had a commented-out line for debugging: //myout(list);
  // Display the final calculated output.
  myout( output ) ;
}

Main( myin() ) ; // Execute the main program flow.