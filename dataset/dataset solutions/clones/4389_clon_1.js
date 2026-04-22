// This section defines global configuration and utility functions.
// It includes constants for debug mode, maximum safe integer, and a modulo value.
const debugMode = false ;
const inf = Number . MAX_SAFE_INTEGER ;
const mod = 1000000007 ;

/*
 * The primary function for processing input.
 * It reads the input, performs calculations based on specific array manipulations,
 * and then outputs the result to the console.
 */
function Main( input ){
    input = input . split("\n") ; // Split input by newlines
    var arr = input[0] . split(" ") ; // Further split the first line by spaces

    // Conditional assignments based on array values
    if ( arr[0] * 2 < arr[1] ) {
        arr[1] = arr[0] * 2 ;
    }
    if ( arr[1] * 2 < arr[2] ) {
        arr[2] = arr[1] * 2 ;
    }
    if ( arr[2] * 2 < arr[3] ) {
        arr[3] = arr[2] * 2 ;
    }
    // Calculate and log the final result
    console.log( Math . floor( input[1] / 2 ) * arr[3] + ( input[1] % 2 ) * arr[2] ) ;
}

// Invoke the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

// Function to calculate a lexicographical order sum.
// It takes an array 'a' and processes it using factorials and array manipulations.
function zisyozyunn ( a ) {
  var arr = [ ] ;
  for ( var i = 0 ; i < input[0] ; i ++ ) {
    arr . push ( i + 1 ) ;
  }
  var sum = 0 ;
  for ( var i = 0 ; i < a . length ; i ++ ) {
    var f = arr . findIndex ( val => val == a[i] ) ;
    sum += factorialize ( a . length - 1 - i ) * f ;
    arr . splice ( f , 1 ) ;
  }
  return sum ;
}

/*
 * Calculates the sum of elements in an array.
 * Note: This is the first definition of arrsum.
 */
function arrsum ( arr ) {
  var sum = 0 ;
  for ( var i = 0 , len = arr . length ; i < len ; ++ i ) {
      sum += arr[i] - 0 ; // Ensure numeric conversion
  } ;
  return sum ;
}

// A simple debug function that logs a value only if debugMode is true.
function debug ( val ) {
  if ( debugMode == true ) {
    console . log ( val ) ;
  }
}

// Finds the index of the maximum value in an array.
function arrMaxPoint ( arr ) {
	var max = Number . MIN_SAFE_INTEGER ;
	var point = -1 ;
	for ( var i = 0 ; i < arr . length ; i ++ ) {
		if ( max < arr[i] ) {
			max = arr[i] ;
			point = i ;
		}
	}
	return point ;
}

// Finds the index of the minimum value in an array.
function arrMinPoint ( arr ) {
	var min = Number . MAX_SAFE_INTEGER ;
	var point = -1 ;
	for ( var i = 0 ; i < arr . length ; i ++ ) {
		if ( min > arr[i] ) {
			min = arr[i] ;
			point = i ;
		}
	}
	return point ;
}

// Converts a 1D array of strings into a 2D array by splitting each string.
function arr1dto2d ( arr ) {
	for ( var i = 0 ; i < arr . length ; i ++ ) {
		arr[i] = arr[i] . split ( "" ) ;
		}
	return arr ;
}

// Determines if a given number 'n' is a prime number.
function isPrime ( n ) {
    if ( false === Number . isInteger ( n ) ) {
        return false ;
    }
    if ( n <= 1 ) {
        return false ;
    }
    if ( 2 === n ) {
        return true ;
    }
    if ( 0 === n % 2 ) {
        return false ;
    }
    var square_root = Math . floor ( Math . sqrt ( n ) ) ;
    for ( var i = 3 ; i <= square_root ; i += 2 ) {
        if ( 0 === n % i ) {
            return false ;
        }
    }
    return true ;
}

// Checks if a given value 'val' represents a non-negative integer.
function isNumber ( val ) {
	const pat = /^([1-9]\d*|0)$/ ;
	return pat . test ( val ) ;
}

// Calculates the factorial of a non-negative integer.
function factorialize ( num ) {
  if ( num === 0 ) { return 1 ; }
  return num * factorialize ( num - 1 ) ;
}

// Rotates a 2D array by 90 degrees clockwise.
function rotate ( array ) {
  const ROW = array . length ;
  const COL = array[0] . length ;
  const row = ROW - 1 ;
  var a = new Array ( COL ) ;
  for ( var c = 0 ; c < COL ; c ++ ) {
    a[c] = new Array ( ROW ) ;
    for ( var r = 0 ; r < ROW ; r ++ ) {
      a[c][r] = array[row - r][c] ;
    }
  }
  return a ;
}

// Inserts a 'push' array into a 'base' array starting at index 'st'.
function part_in ( base , push , st ) {
	for ( var i = st , p = 0 ; p < push . length ; i ++ , p ++ ) {
		base[i] = push[p] ;
	}
	return base ;
}

// Reverses a segment of an array from index 's' to 'g' (1-based).
function part_reverse ( arr , s , g ) {
	var push = arr . slice ( s - 1 , g ) ;
  push . reverse ( ) ;
	arr = part_in ( arr , push , s - 1 ) ;
	return arr ;
}

// Pads a number with leading zeros to achieve a specified length.
function zeroPadding ( num , length ) {
    return ( num + '000000000000000000000000000000000' ) . slice ( 0 , length ) ;
}

/*
 * This is the second definition of arrsum.
 * It computes the sum of elements in an array, similar to the first one.
 */
function arrsum ( arr ) {
    var sum = 0 ;
    for ( var i = 0 , len = arr . length ; i < len ; ++ i ) {
        sum += arr[i] - 0 ; // Explicitly convert to number
    } ;
    return sum ;
}

// Performs prime factorization of a number 'n' and returns the factors as an object.
function pf ( n ) {
    var result = { } ;

    if ( n === 1 ) {
        return { "1" : 1 } ;
    }

    var init = 2 ;

    while ( n !== 1 ) {
        var i = init ;
        while ( i < Number . MAX_SAFE_INTEGER ) {
            if ( n % i === 0 ) {
                n /= i ;
                if ( ! ( result[i] > 0 ) ) {
                    result[i] = 0 ;
                }
                result[i] ++ ;
                break ;
            }
            i ++ ;
        }
        init = i ;
    }
    return result ;
}

// Calculates the greatest common divisor (GCD) of two numbers 'a' and 'b' using recursion.
function gcd ( a , b ) {
    if ( b === 0 ) {
        return a ;
    }
    return gcd ( b , a % b ) ;
}

// Calculates the least common multiple (LCM) of two numbers 'a' and 'b'.
function lcm ( a , b ) {
    var g = ( n , m ) => m ? g ( m , n % m ) : n ;
    return a * b / g ( a , b ) ;
}

// A utility function that returns the difference between two numbers.
// Primarily used for sorting.
function num ( a , b ) {
  return a - b ;
}

// Performs a binary search on a sorted array 'a' to find 'searchValue'.
// Returns the index of the element if found, otherwise returns 'left' (insertion point).
function nibu ( a , searchValue ) {
	var index = -1 ;

// The index representing the left boundary of the search range.
var left = 0 ;

// The index representing the right boundary of the search range.
var right = a . length - 1 ;

// Continue the search as long as there are elements within the boundaries.
while ( left <= right ) {

    // Calculate the middle index for the current search range.
    middle = Math . floor ( ( left + right ) / 2 ) ;

    // Compare the value at the middle index with the target search value.
    if ( a[middle] == searchValue ) {
        // If they match, store the index and terminate the search.
        index = middle ;
        break ;
    } else if ( a[middle] < searchValue ) {
        // If the middle value is less than the search value,
        // narrow the search to the right half.
        left = middle + 1 ;
    } else {
        // If the middle value is greater than the search value,
        // narrow the search to the left half.
        right = middle - 1 ;
    }
}
// Return the found index or the insertion point if not found.
if ( index != -1 ) return index ;
else return left ;
}

// Splits the input string by newline characters, returning an array of strings.
function br ( input ) {
  return input . split ( "\n" ) ;
}

// Checks if an array is sorted in non-decreasing order.
function is_sortred ( arr ) {
  var flag = true ;
  for ( var i = 1 ; i < arr . length ; i ++ ) {
    if ( arr[i - 1] > arr[i] ) {
      flag = false ;
      break ;
    }
  }
  return flag ;
}

// Computes the prime factorization of a given number 'n'.
function primeFactorization ( n ) {

	// Stores the square root of 'n' for optimization.
	var s = Math . floor ( Math . sqrt ( n ) ) ;

	var r = 0 ;

	var result = { } ;

	// Iterates from 2 up to the square root of 'n' to find prime factors.
	for ( var i = 2 ; i <= s ; i ++ ) {

		if ( ( n % i ) == 0 ) {

			r = 0 ; // Reset exponent counter for the current prime factor.

			do {

				r ++ ; // Increment exponent.

				n = n / i ; // Divide n by the factor.

			} while ( ( n % i ) == 0 ) ;

			// Store the prime factor and its exponent.
			result[i] = r ;

		}

	}

	// If 'n' is still greater than 's' after the loop, it means
	// the remaining 'n' is itself a prime factor (larger than its original square root).
	if ( n > s ) {
		result[n] = 1 ;
	}

	return result ;

}