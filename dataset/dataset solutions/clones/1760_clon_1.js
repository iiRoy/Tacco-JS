// This section provides an overview of various utility functions available in this script.
// Each function is designed to perform a specific task, ranging from array manipulations
// to mathematical calculations and input processing.
/*
  -------------------- Function Directory --------------------
  arr1dto2d(Array)           : Transforms a one-dimensional array of strings into a 2D array of numbers.
  pf(N)                      : Performs prime factorization on N and returns the results as an object.
  gcd(a, b)                  : Calculates and returns the Greatest Common Divisor (GCD) of two numbers.
  lcm(a, b)                  : Calculates and returns the Least Common Multiple (LCM) of two numbers.
  num(a, b)                  : Returns the difference a - b, primarily used for sorting purposes.
  isPrime(n)                 : Checks if a given number 'n' is a prime number, returning a boolean.
  isNumber(n)                : Verifies if a given value 'n' is a valid number, returning a boolean.
  arrsum(arr)                : Computes and returns the sum of all elements in an array.
  nibu(arr, n)               : Performs a binary search to find the index of the largest number less than or equal to 'n'.
  br(input)                  : Splits the input string by newline characters, returning an array of lines.
  pow(a,b)                   : Calculates a to the power of b (integer exponents only).
  zisyozyunn(a)              : Calculates the lexicographical index of a permutation.
  debug(val)                 : Logs a value to the console if debugMode is enabled.
  arrMaxPoint(arr)           : Finds the index of the maximum value in an array.
  arrMinPoint(arr)           : Finds the index of the minimum value in an array.
  factorialize(num)          : Calculates the factorial of a number.
  rotate(array)              : Rotates a 2D array 90 degrees clockwise.
  part_in(base, push, st)    : Inserts elements from 'push' array into 'base' array starting at 'st'.
  part_reverse(arr, s, g)    : Reverses a portion of an array from index 's' to 'g'.
  zeroPadding(num, length)   : Pads a number with leading zeros to a specified length.
  is_sortred(arr)            : Checks if an array is sorted in non-decreasing order.
  primeFactorization(n)      : Performs prime factorization on N and returns results as an object (alternative).
*/

// Global configuration flags and constants for various operations.
const debugMode = false ; // Set to 'true' to enable debug logging, 'false' to disable.

const inf = Number.MAX_SAFE_INTEGER ; // Represents the largest safe integer in JavaScript.

const mod = 1000000007 ; // A common modulo value used in competitive programming for large numbers.

function Main( input ) {
  // This function continuously increments a counter 'i'
  // until the product of 'i' and the input value is a multiple of 360.
  // Once found, it logs 'i' and exits the loop.
  for ( var i = 1 ; ; i ++ ) {
    // Check if the current product is perfectly divisible by 360.
    if ( ( i * input ) % 360 == 0 ) {
      console . log ( i ) ; // Output the value of 'i'.
      break ; // Terminate the loop once the condition is met.
    }
  }
}

// Call the Main function with input read from standard input.
// The input is first read as a UTF-8 string, then trimmed of whitespace.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// This function calculates the power of a number 'a' raised to 'b'.
// Note: This implementation seems to have a logical error as it returns 'a' directly.
function pow ( a , b ) {
  var ans = 0 ; // Initialize the accumulator for the result.

  // Loop 'b' times to perform multiplication.
  for ( var i = 0n ; i < b ; i += 1n ) {
    if ( ans == 0 ) {
      ans = a ; // For the first iteration, set 'ans' to 'a'.
    } else {
      ans *= a ; // In subsequent iterations, multiply 'ans' by 'a'.
    }
  }
  return a ; // WARNING: This returns 'a' instead of 'ans'. This is likely a bug in the original code.
}

// Calculates the lexicographical index of a permutation represented by array 'a'.
// It uses a global 'input' variable which is not ideal practice.
function zisyozyunn ( a ) {
  var arr = [ ] ; // Initialize an array to hold numbers from 1 to input[0].

  // Populate 'arr' with numbers from 1 up to the value specified by input[0].
  for ( var i = 0 ; i < input [ 0 ] ; i ++ ) {
    arr . push ( i + 1 ) ;
  }

  var sum = 0 ; // Initialize the sum for the lexicographical index.

  // Iterate through each element of the input array 'a'.
  for ( var i = 0 ; i < a . length ; i ++ ) {
    // Find the index of the current element a[i] in 'arr'.
    var f = arr . findIndex ( val => val == a [ i ] ) ;
    // Add to sum: factorial of remaining elements * found index.
    sum += factorialize ( a . length - 1 - i ) * f ;
    // Remove the found element from 'arr' to avoid re-counting.
    arr . splice ( f , 1 ) ;
  }
  return sum ; // Return the calculated lexicographical index.
}

// Calculates the sum of all numeric elements in an array.
// It explicitly converts each element to a number using `-0`.
function arrsum ( arr ) {
  var sum = 0 ; // Initialize sum to zero.

  // Iterate through the array using a traditional for loop.
  for ( var i = 0 , len = arr . length ; i < len ; ++ i ) {
    sum += arr [ i ] - 0 ; // Add the numeric value of the element to sum.
  }
  ; // Empty statement, no effect.
  return sum ; // Return the total sum.
}

// A simple debug function that logs a value to the console
// only if the `debugMode` global flag is set to `true`.
function debug ( val ) {
  if ( debugMode == true ) {
    console . log ( val ) ; // Log the provided value if debugging is enabled.
  }
}

// Finds the index of the maximum value within an array.
// If the array is empty, it returns -1.
function arrMaxPoint ( arr ) {
  var max = Number . MIN_SAFE_INTEGER ; // Initialize max with the smallest possible safe integer.
  var point = - 1 ; // Initialize point (index) to -1, indicating no element found yet.

  // Iterate through each element of the array.
  for ( var i = 0 ; i < arr . length ; i ++ ) {
    // If the current element is greater than the current maximum.
    if ( max < arr [ i ] ) {
      max = arr [ i ] ; // Update the maximum value.
      point = i ; // Update the index of the maximum value.
    }
  }
  return point ; // Return the index of the maximum element.
}

// Finds the index of the minimum value within an array.
// If the array is empty, it returns -1.
function arrMinPoint ( arr ) {
  var min = Number . MAX_SAFE_INTEGER ; // Initialize min with the largest possible safe integer.
  var point = - 1 ; // Initialize point (index) to -1, indicating no element found yet.

  // Iterate through each element of the array.
  for ( var i = 0 ; i < arr . length ; i ++ ) {
    // If the current element is smaller than the current minimum.
    if ( min > arr [ i ] ) {
      min = arr [ i ] ; // Update the minimum value.
      point = i ; // Update the index of the minimum value.
    }
  }
  return point ; // Return the index of the minimum element.
}

// Determines if a given number 'n' is a prime number.
// Returns true if prime, false otherwise.
function isPrime ( n ) {
  // First, check if the input is an integer. Non-integers cannot be prime.
  if ( false === Number . isInteger ( n ) ) {
    return false ;
  }

  // Numbers less than or equal to 1 are not prime.
  if ( n <= 1 ) {
    return false ;
  }

  // 2 is the only even prime number.
  if ( 2 === n ) {
    return true ;
  }

  // Any even number greater than 2 is not prime.
  if ( 0 === n % 2 ) {
    return false ;
  }

  // Calculate the square root of 'n' to optimize the loop.
  // We only need to check for divisors up to the square root.
  var square_root = Math . floor ( Math . sqrt ( n ) ) ;

  // Iterate from 3 up to the square root, incrementing by 2 (checking only odd numbers).
  for ( var i = 3 ; i <= square_root ; i += 2 ) {
    // If 'n' is divisible by 'i', then 'n' is not prime.
    if ( 0 === n % i ) {
      return false ;
    }
  }

  // If no divisors were found, 'n' is a prime number.
  return true ;
}

// Checks if a given value `val` represents a valid non-negative integer.
// It uses a regular expression to validate the format.
function isNumber ( val ) {
  // Regular expression to match non-negative integers (0 or positive integers without leading zeros).
  const pat = /^([1-9]\d*|0)$/ ;
  return pat . test ( val ) ; // Test the input value against the pattern.
}

// Calculates the factorial of a non-negative integer `num`.
// Uses recursion for calculation.
function factorialize ( num ) {
  // Base case: factorial of 0 is 1.
  if ( num === 0 ) {
    return 1 ;
  }
  // Recursive step: n! = n * (n-1)!
  return num * factorialize ( num - 1 ) ;
}

// Converts a 1D array of space-separated number strings into a 2D array of numbers.
function arr1dto2d ( arr ) {
  // Iterate through each element of the input array.
  for ( var i = 0 ; i < arr . length ; i ++ ) {
    // Split the string by space, then map each substring to a number.
    arr [ i ] = arr [ i ] . split ( " " ) . map ( Number ) ;
  }
  return arr ; // Return the transformed 2D array.
}

// Rotates a given 2D array (matrix) 90 degrees clockwise.
function rotate ( array ) {
  const ROW = array . length ; // Get the number of rows in the original array.
  const COL = array [ 0 ] . length ; // Get the number of columns in the original array.
  const row = ROW - 1 ; // Helper variable for row indexing in rotation logic.

  var a = new Array ( COL ) ; // Create a new array to hold the rotated matrix.
                             // Its number of rows will be the original number of columns.

  // Iterate through the new matrix's columns (which are original rows).
  for ( var c = 0 ; c < COL ; c ++ ) {
    a [ c ] = new Array ( ROW ) ; // Initialize each row of the new matrix.
                                 // Its number of columns will be the original number of rows.

    // Iterate through the new matrix's rows (which are original columns).
    for ( var r = 0 ; r < ROW ; r ++ ) {
      // Perform the 90-degree clockwise rotation mapping.
      // New_matrix[c][r] = Original_matrix[Original_rows - 1 - r][c]
      a [ c ] [ r ] = array [ row - r ] [ c ] ;
    }
  }
  return a ; // Return the newly created rotated array.
}

// Inserts elements from a 'push' array into a 'base' array starting at a specified index 'st'.
// This function modifies the 'base' array in place.
function part_in ( base , push , st ) {
  // Iterate through the 'push' array, copying its elements to 'base'.
  for ( var i = st , p = 0 ; p < push . length ; i ++ , p ++ ) {
    base [ i ] = push [ p ] ; // Assign the element from 'push' to 'base'.
  }
  return base ; // Return the modified 'base' array.
}

// Reverses a specific segment of an array from a start index 's' to an end index 'g'.
// The indices 's' and 'g' are 1-based.
function part_reverse ( arr , s , g ) {
  // Extract the segment to be reversed (0-based indexing for slice).
  var push = arr . slice ( s - 1 , g ) ;
  push . reverse ( ) ; // Reverse the extracted segment.

  // Insert the reversed segment back into the original array using part_in.
  arr = part_in ( arr , push , s - 1 ) ;
  return arr ; // Return the array with the specified part reversed.
}

// Pads a number with leading zeros to reach a specified total length.
// The padding string is excessively long to ensure it covers any reasonable length.
function zeroPadding ( num , length ) {
  // Concatenate the number with a long string of zeros and then slice to the desired length.
  return ( num + '000000000000000000000000000000000' ) . slice ( 0 , length ) ;
}

// Calculates the sum of all numeric elements in an array.
// This is a duplicate of a previously defined `arrsum` function.
function arrsum ( arr ) {
    var sum = 0 ; // Initialize sum variable.
    // Loop through each element of the array.
    for ( var i = 0 , len = arr . length ; i < len ; ++ i ) {
        sum += arr [ i ] - 0 ; // Convert element to number and add to sum.
    }
    ; // Empty statement, no effect.
    return sum ; // Return the computed total sum.
}

// Performs prime factorization on a given number 'n'.
// Returns an object where keys are prime factors and values are their exponents.
function pf ( n ) {
    var result = { } ; // Initialize an empty object to store prime factors and their counts.

    // Special case: if n is 1, its prime factorization is {"1":1} (or empty, depending on definition).
    if ( n === 1 ) {
        return { "1" : 1 } ;
    }

    var init = 2 ; // Start checking for prime factors from 2.

    // Continue factorization until 'n' becomes 1.
    while ( n !== 1 ) {
        var i = init ; // Start inner loop from 'init' (which can be updated after finding a factor).

        // Look for a divisor 'i' for the current 'n'.
        while ( i < Number . MAX_SAFE_INTEGER ) { // Loop condition is effectively infinite for practical numbers.
            if ( n % i === 0 ) { // If 'i' is a divisor.
                n /= i ; // Divide 'n' by 'i'.
                // If 'i' is not yet in the result object, initialize its count to 0.
                if ( ! ( result [ i ] > 0 ) ) {
                    result [ i ] = 0 ;
                }
                result [ i ] ++ ; // Increment the count for prime factor 'i'.
                break ; // Break from inner loop to re-evaluate 'n' with the same 'i'.
            }
            i ++ ; // Increment 'i' to check the next potential factor.
        }
        init = i ; // Update 'init' to continue checking from the last found factor 'i'.
    }
    return result ; // Return the object containing prime factors and their exponents.
}

// Calculates the Greatest Common Divisor (GCD) of two non-negative integers 'a' and 'b'
// using the Euclidean algorithm (recursive implementation).
function gcd ( a , b ) {
    // Base case: if 'b' is 0, then 'a' is the GCD.
    if ( b === 0 ) {
        return a ;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return gcd ( b , a % b ) ;
}

// Calculates the Least Common Multiple (LCM) of two non-negative integers 'a' and 'b'.
// It uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
function lcm ( a , b ) {
    // Helper function for GCD, defined inline using an arrow function.
    // This is a common recursive implementation of Euclidean algorithm.
    var g = ( n , m ) => m ? g ( m , n % m ) : n ;
    // Calculate LCM using the formula.
    return a * b / g ( a , b ) ;
}

// A simple subtraction function, often used as a comparator for sorting in descending order.
function num ( a , b ) {
  return a - b ; // Returns the difference between 'a' and 'b'.
}

// Implements a binary search algorithm to find the index of the largest element
// in a sorted array `a` that is less than or equal to `searchValue`.
// If `searchValue` is not found, it returns the index where it would be inserted
// to maintain sorted order, or the index of the closest smaller element.
function nibu ( a , searchValue ) {
	var index = - 1 ; // Initialize 'index' to -1, indicating not found initially.

    // `left` represents the left boundary of the search range (inclusive).
    var left = 0 ;

    // `right` represents the right boundary of the search range (inclusive).
    var right = a . length - 1 ;

    // Continue the search as long as the left boundary is less than or equal to the right boundary.
    while ( left <= right ) {

        // Calculate the middle index of the current search range.
        // `Math.floor` ensures an integer index.
        middle = Math . floor ( ( left + right ) / 2 ) ;

        // Compare the value at the middle index with the `searchValue`.
        if ( a [ middle ] == searchValue ) {
            // If a match is found, store the index and exit the loop.
            index = middle ;
            break ;
        } else if ( a [ middle ] < searchValue ) {
            // If the middle value is less than `searchValue`,
            // the `searchValue` must be in the right half.
            // Adjust the `left` boundary to `middle + 1`.
            left = middle + 1 ;
        } else {
            // If the middle value is greater than `searchValue`,
            // the `searchValue` must be in the left half.
            // Adjust the `right` boundary to `middle - 1`.
            right = middle - 1 ;
        }
    }
    // After the loop, if `index` is not -1, it means `searchValue` was found.
    if ( index != - 1 ) {
        return index ;
    }
    // If `searchValue` was not found, `left` will be the index where it should be inserted
    // to maintain the sorted order, or the index of the first element greater than `searchValue`.
    else {
        return left ;
    }
}

// Splits a multi-line input string into an array of strings,
// with each element representing a line.
function br ( input ) {
  return input . split ( "\n" ) ; // Use the newline character as the delimiter.
}

// Checks if an array is sorted in non-decreasing (ascending) order.
// Returns `true` if sorted, `false` otherwise.
function is_sortred ( arr ) {
  var flag = true ; // Assume the array is sorted initially.

  // Iterate through the array starting from the second element.
  for ( var i = 1 ; i < arr . length ; i ++ ) {
    // If a current element is smaller than its preceding element, it's not sorted.
    if ( arr [ i - 1 ] > arr [ i ] ) {
      flag = false ; // Set flag to false.
      break ; // No need to check further, break the loop.
    }
  }
  return flag ; // Return the final flag value.
}

// Performs prime factorization on a given number 'n'.
// Returns an object where keys are prime factors and values are their exponents.
// This is an alternative implementation to the `pf` function.
function primeFactorization ( n ) {

	// Store the integer part of the square root of 'n'.
	// This optimizes the search for prime factors.
	var s = Math . floor ( Math . sqrt ( n ) ) ;

	var r = 0 ; // Counter for the exponent of a prime factor.

	var result = { } ; // Object to store prime factors and their exponents.

	// Iterate from 2 up to the square root of 'n' to find prime factors.
	for ( var i = 2 ; i <= s ; i ++ ) {

		// Check if 'i' is a divisor of 'n'.
		if ( ( n % i ) == 0 ) {

			r = 0 ; // Reset exponent counter for the new prime factor.

			do {
				r ++ ; // Increment the exponent.
				n = n / i ; // Divide 'n' by 'i'.
			} while ( ( n % i ) == 0 ) ; // Continue as long as 'i' is still a factor.

			// Store the prime factor 'i' and its exponent 'r' in the result object.
			result [ i ] = r ;

		}

	}

	// If after the loop, 'n' is still greater than 's', it means the remaining 'n'
	// is itself a prime factor (and has an exponent of 1).
	if ( n > s ) {
		result [ n ] = 1 ;
	}

	return result ; // Return the object containing the prime factorization.

}