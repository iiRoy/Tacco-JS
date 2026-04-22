/*
 * This section lists various utility functions available in this file.
 * Each function is briefly described below.
 *
 * --- Function List ---
 *
 * arr1dto2d (Array) : Converts a one-dimensional array into a two-dimensional array.
 * pf        (N)     : Returns an object representing the prime factorization of N.
 * gcd       (a,b)   : Returns the greatest common divisor of a and b.
 * lcm       (a,b)   : Returns the least common multiple of a and b.
 * num       (a,b)   : Returns a - b; intended for sorting purposes.
 * isPrime   (n)     : Returns a boolean indicating if n is a prime number.
 * isNumber  (n)     : Returns a boolean indicating if n is a number.
 * arrsum    (arr)   : Returns the sum of elements in an array.
 * nibu      (arr,n) : Returns the index of the largest number less than or equal to n (inclusive).
 * br        (input) : Splits the input string by newline characters.
 *
 * --- End of Function List ---
 */


const debugMode = false; /* Flag to control debug output. Set to true to enable. */

const inf = Number.MAX_SAFE_INTEGER; // Represents the maximum safe integer value in JavaScript.


function Main ( input ) {

  // Initialize x with a BigInt value
  var x = 100n;

  // Convert input to BigInt for large number calculations
  var y = BigInt( input );

  // Loop until x reaches or exceeds y
  for ( var i = 1; x < y; i ++ ) {
    x += x / 100n; // Increment x by 1% of its current value
  }

  // Output the result (i-1) to the console
  console.log( i - 1 );

}

// Execute the Main function with input from standard input
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ).trim() );


// This function calculates a unique numerical representation based on lexicographical order.
function zisyozyunn ( a ) {

  var arr = [ ];

  // Populate arr with numbers from 1 to input[0]
  for ( var i = 0; i < input[ 0 ]; i ++ ) {
    arr.push( i + 1 );
  }

  var sum = 0; // Initialize sum

  // Iterate through the input array 'a'
  for ( var i = 0; i < a.length; i ++ ) {

    // Find the index of the current element 'a[i]' in 'arr'
    var f = arr.findIndex( val => val == a[ i ] );

    // Add to sum based on factorial and found index
    sum += factorialize( a.length - 1 - i ) * f;

    // Remove the found element from 'arr'
    arr.splice( f, 1 );

  }

  return sum; // Return the calculated sum

}


// Calculates the sum of all elements in an array.
function arrsum ( arr ) {

  var sum = 0; // Initialize the sum to zero.

  // Loop through each element of the array.
  for ( var i = 0, len = arr.length; i < len; ++ i ) {
    sum += arr[ i ] - 0; // Add the numeric value of the element to sum.
  }
  ; // Semicolon after loop body, as in original.

  return sum; // Return the total sum.

}


// Debug function: logs a value to console only if debugMode is true.
function debug ( val ) {

  if ( debugMode == true ) {
    console.log( val ); // Output the value for debugging.
  }

}


// Finds the index of the maximum value in an array.
function arrMaxPoint ( arr ) {

	var max = Number.MIN_SAFE_INTEGER; // Initialize max with the smallest possible integer.
	var point = -1; // Initialize point (index) to -1.

	// Iterate through the array.
	for ( var i = 0; i < arr.length; i ++ ) {

		// If current element is greater than current max, update max and point.
		if ( max < arr[ i ] ) {
			max = arr[ i ];
			point = i;
		}

	}

	return point; // Return the index of the maximum value.

}


// Finds the index of the minimum value in an array.
function arrMinPoint ( arr ) {

	var min = Number.MAX_SAFE_INTEGER; // Initialize min with the largest possible integer.
	var point = -1; // Initialize point (index) to -1.

	// Iterate through the array.
	for ( var i = 0; i < arr.length; i ++ ) {

		// If current element is smaller than current min, update min and point.
		if ( min > arr[ i ] ) {
			min = arr[ i ];
			point = i;
		}

	}

	return point; // Return the index of the minimum value.

}


// First definition of arr1dto2d: Splits each string element into an array of characters.
function arr1dto2d ( arr ) {

	for ( var i = 0; i < arr.length; i ++ ) {
		arr[ i ] = arr[ i ].split( "" ); // Split each string by character.
	}

	return arr; // Return the modified 2D array.

}


// Checks if a given number 'n' is prime.
function isPrime ( n ) {

    // If n is not an integer, it cannot be prime.
    if ( false === Number.isInteger( n ) ) {
        return false;
    }

    // Numbers less than or equal to 1 are not prime.
    if ( n <= 1 ) {
        return false;
    }

    // 2 is the only even prime number.
    if ( 2 === n ) {
        return true;
    }

    // Any even number greater than 2 is not prime.
    if ( 0 === n % 2 ) {
        return false;
    }

    // Calculate the square root for optimization.
    var square_root = Math.floor( Math.sqrt( n ) );

    // Check for divisibility by odd numbers up to the square root.
    for ( var i = 3; i <= square_root; i += 2 ) {
        if ( 0 === n % i ) {
            return false; // Found a divisor, so not prime.
        }
    }

    return true; // No divisors found, it's prime.

}


// Checks if a value is a non-negative integer string.
function isNumber ( val ) {

	const pat = /^([1-9]\d*|0)$/; // Regular expression for non-negative integers.
	return pat.test( val ); // Test the value against the pattern.

}


// Second definition of arr1dto2d: identical to the first one.
function arr1dto2d ( arr ) {

	for ( var i = 0; i < arr.length; i ++ ) {
		arr[ i ] = arr[ i ].split( "" ); // Splits string elements into character arrays.
	}

	return arr; // Returns the resulting 2D array.

}


// Calculates the factorial of a non-negative integer.
function factorialize ( num ) {

  // Base case: factorial of 0 is 1.
  if ( num === 0 ) {
    return 1;
  }

  // Recursive step: num * factorial(num - 1).
  return num * factorialize( num - 1 );

}


// Third definition of arr1dto2d: Splits each string element by space and maps to Number.
function arr1dto2d ( arr ) {

	for ( var i = 0; i < arr.length; i ++ ) {
    arr[ i ] = arr[ i ].split( " " ).map( Number ); // Splits by space and converts to numbers.
  }

  return arr; // Returns the resulting 2D array of numbers.

}


// Rotates a 2D array 90 degrees clockwise.
function rotate ( array ) {

  const ROW = array.length; // Number of rows in the original array.
  const COL = array[ 0 ].length; // Number of columns in the original array.
  const row = ROW - 1; // Last row index.

  var a = new Array( COL ); // Create a new array with COL rows (will become new columns).

  // Iterate to create the new rotated array.
  for ( var c = 0; c < COL; c ++ ) {
    a[ c ] = new Array( ROW ); // Each new row will have ROW columns.
    for ( var r = 0; r < ROW; r ++ ) {
      // Perform the rotation logic: new_a[c][r] = old_array[ROW-1-r][c]
      a[ c ][ r ] = array[ row - r ][ c ];
    }
  }

  return a; // Return the rotated array.

}


// Inserts elements from 'push' array into 'base' array starting at index 'st'.
function part_in ( base, push, st ) {

	for ( var i = st, p = 0; p < push.length; i ++, p ++ ) {
		base[ i ] = push[ p ]; // Assign elements from push to base.
	}

	return base; // Return the modified base array.

}


// Reverses a portion of an array from index 's' to 'g' (inclusive, 1-based).
function part_reverse ( arr, s, g ) {

	var push = arr.slice( s - 1, g ); // Extract the subarray to be reversed.
  push.reverse(); // Reverse the extracted subarray.

	arr = part_in( arr, push, s - 1 ); // Insert the reversed subarray back into the original.

	return arr; // Return the array with the reversed part.

}


// Pads a number with leading zeros to a specified length.
function zeroPadding ( num, length ) {

    // Concatenate the number with a long string of zeros and then slice to desired length.
    return ( num + '000000000000000000000000000000000' ).slice( 0, length );

}


// Another definition of arrsum: Calculates the sum of all elements in an array.
function arrsum ( arr ) {

    var sum = 0; // Initialize the sum.

    // Loop through the array elements.
    for ( var i = 0, len = arr.length; i < len; ++ i ) {
        sum += arr[ i ] - 0; // Add the numeric value of each element.
    }
    ; // Semicolon as in original.

    return sum; // Return the total sum.

}


// Prime factorization function. Returns an object with prime factors and their counts.
function pf ( n ) {

    var result = { }; // Object to store prime factors.

    // Base case: if n is 1, return {"1":1}.
    if ( n === 1 ) {
        return { "1": 1 };
    }

    var init = 2; // Start checking for prime factors from 2.

    // Continue until n becomes 1.
    while ( n !== 1 ) {

        var i = init; // Current divisor candidate.

        // Find the smallest prime factor of n.
        while ( i < Number.MAX_SAFE_INTEGER ) {

            if ( n % i === 0 ) {
                n /= i; // Divide n by its factor.

                // Initialize count for factor if not present.
                if ( ! ( result[ i ] > 0 ) ) {
                    result[ i ] = 0;
                }
                result[ i ] ++; // Increment count for the factor.
                break; // Found a factor, break inner loop.
            }
            i ++; // Move to the next potential factor.
        }
        init = i; // Update init for the next iteration of the outer loop.
    }

    return result; // Return the prime factorization object.

}


// Calculates the Greatest Common Divisor (GCD) using the Euclidean algorithm.
function gcd ( a, b ) {

    // Base case: if b is 0, then a is the GCD.
    if ( b === 0 ) {
        return a;
    }

    // Recursive step: gcd(b, a % b).
    return gcd( b, a % b );

}


// Calculates the Least Common Multiple (LCM) of two numbers.
function lcm ( a, b ) {

    // Helper function for GCD (Euclidean algorithm).
    var g = ( n, m ) => m ? g( m, n % m ) : n;

    // LCM formula: (a * b) / gcd(a, b).
    return a * b / g( a, b );

}


// Simple subtraction function, potentially for sorting.
function num ( a, b ) {
  return a - b; // Returns the difference between a and b.
}


// Implements a binary search (nibu means binary in Japanese).
// Returns the index of the largest number less than or equal to searchValue, or the insertion point.
function nibu ( a, searchValue ) {

	var index = -1; // Initialize the found index to -1.

    // Index representing the left boundary of the search range.
    var left = 0;

    // Index representing the right boundary of the search range.
    var right = a.length - 1;

    // Continue the search as long as there's a valid range (left <= right).
    while ( left <= right ) {

        // Calculate the middle index. Using Math.floor to handle odd/even lengths.
        middle = Math.floor( ( left + right ) / 2 );

        // Compare the value at the middle index with the search value.
        if ( a[ middle ] == searchValue ) {
            // If values match, set index and terminate search.
            index = middle;
            break;
        } else if ( a[ middle ] < searchValue ) {
            // If middle value is smaller, search in the right half.
            left = middle + 1;
        } else {
            // If middle value is larger, search in the left half.
            right = middle - 1;
        }

    }

    // If a direct match was found, return its index.
    if ( index != -1 ) {
        return index;
    }
    // Otherwise, return 'left', which represents the insertion point
    // for searchValue to maintain sorted order, or the index of the
    // first element greater than searchValue.
    else {
        return left;
    }

}


// Splits an input string by newline characters.
function br ( input ) {
  return input.split( "\n" ); // Returns an array of strings.
}