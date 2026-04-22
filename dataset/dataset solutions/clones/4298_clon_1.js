// This file contains a collection of utility functions written in JavaScript.
// Author: Expert Code Cloner
// Date: YYYY-MM-DD (placeholder)

// --- FUNCTION INDEX ---
// arr1dto2d(Array)          : Transforms a 1D array of strings into a 2D array of characters.
// pf(N)                    : Returns an object containing the prime factorization of N.
// gcd(a,b)                 : Computes the greatest common divisor of two numbers.
// lcm(a,b)                 : Computes the least common multiple of two numbers.
// num(a,b)                 : Returns the difference a-b, primarily used for sorting.
// isPrime(n)               : Checks if a number is prime, returns a boolean.
// isNumber(n)              : Determines if a value is a valid number string, returns a boolean.
// arrsum(arr)              : Calculates the sum of all elements in an array. (Note: Appears twice in original code)
// nibu(arr,n)              : Performs binary search to find the index of the largest number less than or equal to n.
// br(input)                : Splits an input string by newline characters.
// zisyozyunn(a)            : Calculates lexicographical rank (specific use case).
// debug(val)               : Logs a value to console if debug mode is active.
// arrMaxPoint(arr)         : Finds the index of the maximum value in an array.
// arrMinPoint(arr)         : Finds the index of the minimum value in an array.
// factorialize(num)        : Computes the factorial of a number.
// rotate(array)            : Rotates a 2D array 90 degrees clockwise.
// part_in(base,push,st)    : Inserts elements from 'push' array into 'base' array starting at index 'st'.
// part_reverse(arr,s,g)    : Reverses a portion of an array from index 's' to 'g'.
// zeroPadding(num,length)  : Adds leading zeros to a number to reach a specified length.
// is_sortred(arr)          : Checks if an array is sorted in ascending order.
// primeFactorization(n)    : Another function for prime factorization. (Similar to pf)
// ----------------------

// Global Configuration Constants
const debugMode = false ; // Flag to control debugging output.
const inf = Number. MAX_SAFE_INTEGER ; // Represents positive infinity for practical purposes.
const mod = 1000000007 ; // A common modulo value used in competitive programming.

/**
 * The main entry point function for processing input.
 * This function performs a specific grid transformation logic.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input )
{
    // Step 1: Parse the input string into lines.
    input = input . split ( "\n" ) ;

    // Step 2: Extract memoization parameters from the first line.
    // The first line contains space-separated numbers.
    var mem = input[0] . split ( " " ) . map ( Number ) ;

    // Step 3: Remove the first line as it's already processed.
    input . shift ( ) ;

    // Step 4: Convert the remaining 1D array of strings into a 2D array of characters.
    input = arr1dto2d ( input ) ;

    // Step 5: Add boundary markers (sentinels) to the left and right of each row.
    for ( var i = 0 ; i < input . length ; i ++ )
    {
        input[i] . push ( "^" ) ; // Add a sentinel to the end.
        input[i] . unshift ( "^" ) ; // Add a sentinel to the beginning.
    }

    // Step 6: Create a horizontal boundary row and add it to the top and bottom.
    // The length of this row is based on the second memoization parameter plus two for sentinels.
    var p = new Array ( mem[1] + 2 ) . fill ( "^" ) ;
    input . push ( p ) ; // Add sentinel row to the bottom.
    input . unshift ( p ) ; // Add sentinel row to the top.

    // Step 7: Process the grid to count adjacent '#' characters for '.' cells.
    // Iterates through the grid, including the added boundary rows/columns.
    for ( i = 0 ; i < input[0] . length ; i ++ )
    {
        for ( var j = 0 ; j < input . length ; j ++ )
        {
            // Check if the current cell is a '.' (empty cell).
            if ( input[j][i] == "." )
            {
                var sum = 0 ; // Initialize counter for '#' neighbors.

                // Iterate through the 3x3 neighborhood around the current cell.
                for ( var k = -1 ; k < 2 ; k ++ )
                {
                    for ( var l = -1 ; l < 2 ; l ++ )
                    {
                        // If a neighbor is '#', increment the sum.
                        if ( input[j+k][i+l] == "#" ) sum ++ ;
                    }
                }
                // Replace '.' with the count of '#' neighbors.
                input[j][i] = sum ;
            }
        }
    }

    // Step 8: Remove the boundary rows (top and bottom).
    input . pop ( ) ;
    input . shift ( ) ;

    // Step 9: Remove boundary columns and join each row back into a string.
    for ( i = 0 ; i < input . length ; i ++ )
    {
        input[i] . pop ( ) ; // Remove right sentinel.
        input[i] . shift ( ) ; // Remove left sentinel.
        input[i] = input[i] . join ( "" ) ; // Join characters to form a string.
    }

    // Step 10: Print the modified grid, with each row on a new line.
    console . log ( input . join ( "\n" ) ) ;
}

// Execute the Main function with input read from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;


// --- UTILITY FUNCTIONS ---

/**
 * Calculates a lexicographical rank based on the input array 'a'.
 * This function seems to depend on a global 'input' variable for its size.
 * @param {Array<number>} a - The array for which to calculate the rank.
 * @returns {number} The calculated lexicographical rank.
 */
function zisyozyunn ( a )
{
  var arr = [] ; // Temporary array to hold numbers.
  // Populate 'arr' based on the first element of a global 'input' array.
  for ( var i = 0 ; i < input[0] ; i ++ )
  {
    arr . push ( i + 1 ) ;
  }
  var sum = 0 ; // Initialize sum for rank calculation.
  for ( var i = 0 ; i < a . length ; i ++ )
  {
    // Find the index of the current element 'a[i]' in 'arr'.
    var f = arr . findIndex ( val => val == a[i] ) ;
    // Add to sum based on factorial and found index.
    sum += factorialize ( a . length - 1 - i ) * f ;
    // Remove the found element from 'arr'.
    arr . splice ( f , 1 ) ;
  }
  return sum ; // Return the final calculated sum.
}

/**
 * Calculates the sum of all numeric elements in an array.
 * This function explicitly converts elements to numbers using '-0'.
 * @param {Array<number|string>} arr - The array whose elements are to be summed.
 * @returns {number} The total sum of the array elements.
 */
function arrsum ( arr )
{
  var sum = 0 ; // Accumulator for the sum.
  for ( var i = 0 , len = arr . length ; i < len ; ++i )
  {
    sum += arr[i] - 0 ; // Add element, ensuring it's treated as a number.
  } ; // Semicolon as in original.
  return sum ; // Return the calculated sum.
}

/**
 * Logs a value to the console only if debugMode is set to true.
 * This is a conditional debugging utility.
 * @param {*} val - The value to be logged.
 */
function debug ( val )
{
  if ( debugMode == true )
  {
    console . log ( val ) ; // Output the value if debug mode is active.
  }
}

/**
 * Finds the index of the maximum value in a given array.
 * Returns -1 if the array is empty or no valid maximum is found.
 * @param {Array<number>} arr - The array to search for the maximum value.
 * @returns {number} The index of the maximum value, or -1.
 */
function arrMaxPoint ( arr )
{
	var max = Number . MIN_SAFE_INTEGER ; // Initialize max with the smallest possible safe integer.
	var point = -1 ; // Initialize point (index) to -1.
	for ( var i = 0 ; i < arr . length ; i ++ )
	{
		if ( max < arr[i] ) // If current element is greater than current max.
		{
			max = arr[i] ; // Update max.
			point = i ; // Update index.
		}
	}
	return point ; // Return the index of the maximum element.
}

/**
 * Finds the index of the minimum value in a given array.
 * Returns -1 if the array is empty or no valid minimum is found.
 * @param {Array<number>} arr - The array to search for the minimum value.
 * @returns {number} The index of the minimum value, or -1.
 */
function arrMinPoint ( arr )
{
	var min = Number . MAX_SAFE_INTEGER ; // Initialize min with the largest possible safe integer.
	var point = -1 ; // Initialize point (index) to -1.
	for ( var i = 0 ; i < arr . length ; i ++ )
	{
		if ( min > arr[i] ) // If current element is smaller than current min.
		{
			min = arr[i] ; // Update min.
			point = i ; // Update index.
		}
	}
	return point ; // Return the index of the minimum element.
}

/**
 * Converts a 1D array of strings into a 2D array where each string
 * is split into an array of its constituent characters.
 * @param {Array<string>} arr - The 1D array of strings.
 * @returns {Array<Array<string>>} The resulting 2D array of characters.
 */
function arr1dto2d ( arr )
{
	for ( var i = 0 ; i < arr . length ; i ++ )
	{
		arr[i] = arr[i] . split ( "" ) ; // Split each string into a character array.
	}
	return arr ; // Return the modified 2D array.
}

/**
 * Checks if a given number `n` is a prime number.
 * @param {number} n - The number to check for primality.
 * @returns {boolean} True if `n` is prime, false otherwise.
 */
function isPrime ( n )
{
    // Ensure the input is an integer.
    if ( false === Number . isInteger ( n ) )
    {
        return false ;
    }
    // Numbers less than or equal to 1 are not prime.
    if ( n <= 1 )
    {
        return false ;
    }
    // 2 is the only even prime number.
    if ( 2 === n )
    {
        return true ;
    }
    // Any other even number is not prime.
    if ( 0 === n % 2 )
    {
        return false ;
    }
    // Check for divisibility by odd numbers up to the square root of n.
    var square_root = Math . floor ( Math . sqrt ( n ) ) ;
    for ( var i = 3 ; i <= square_root ; i += 2 )
    {
        if ( 0 === n % i )
        {
            return false ; // Found a divisor, so it's not prime.
        }
    }
    return true ; // No divisors found, it's prime.
}

/**
 * Checks if a given value is a string representation of a non-negative integer.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a valid non-negative integer string, false otherwise.
 */
function isNumber ( val )
{
	const pat = /^([1-9]\d*|0)$/ ; // Regular expression for non-negative integers.
	return pat . test ( val ) ; // Test the value against the pattern.
}

/**
 * Calculates the factorial of a non-negative integer.
 * Uses recursion.
 * @param {number} num - The number for which to calculate the factorial.
 * @returns {number} The factorial of `num`.
 */
function factorialize ( num )
{
  if ( num === 0 )
  {
    return 1 ; // Base case: factorial of 0 is 1.
  }
  return num * factorialize ( num - 1 ) ; // Recursive step.
}

/**
 * Rotates a 2D array (matrix) 90 degrees clockwise.
 * Assumes a rectangular matrix.
 * @param {Array<Array<any>>} array - The 2D array to rotate.
 * @returns {Array<Array<any>>} The rotated 2D array.
 */
function rotate ( array )
{
  const ROW = array . length ; // Number of rows in the original array.
  const COL = array[0] . length ; // Number of columns in the original array.
  const row = ROW - 1 ; // Index of the last row.

  var a = new Array ( COL ) ; // New array will have COL rows.
  for ( var c = 0 ; c < COL ; c ++ )
  {
    a[c] = new Array ( ROW ) ; // Each new row will have ROW columns.
    for ( var r = 0 ; r < ROW ; r ++ )
    {
      // Transformation logic for 90-degree clockwise rotation.
      a[c][r] = array[row-r][c] ;
    }
  }
  return a ; // Return the newly rotated array.
}

/**
 * Inserts elements from a 'push' array into a 'base' array starting at a specified index.
 * Modifies the 'base' array in place.
 * @param {Array<any>} base - The array to modify.
 * @param {Array<any>} push - The elements to insert.
 * @param {number} st - The starting index in the 'base' array.
 * @returns {Array<any>} The modified 'base' array.
 */
function part_in ( base , push , st )
{
	for ( var i = st , p = 0 ; p < push . length ; i ++ , p ++ )
	{
		base[i] = push[p] ; // Copy element from 'push' to 'base'.
	}
	return base ; // Return the updated base array.
}

/**
 * Reverses a specified part of an array in place.
 * The segment to reverse is defined by start (s) and end (g) indices (1-based).
 * @param {Array<any>} arr - The array to modify.
 * @param {number} s - The 1-based starting index of the segment.
 * @param {number} g - The 1-based ending index of the segment.
 * @returns {Array<any>} The array with the specified part reversed.
 */
function part_reverse ( arr , s , g )
{
	var push = arr . slice ( s - 1 , g ) ; // Extract the segment to be reversed.
    push . reverse ( ) ; // Reverse the extracted segment.
	arr = part_in ( arr , push , s - 1 ) ; // Insert the reversed segment back into the original array.
	return arr ; // Return the modified array.
}

/**
 * Pads a number with leading zeros to reach a specified total length.
 * The implementation uses string concatenation and slicing.
 * @param {number|string} num - The number to pad.
 * @param {number} length - The desired total length of the string.
 * @returns {string} The zero-padded string representation of the number.
 */
function zeroPadding ( num , length )
{
    // Concatenate the number with a long string of zeros, then slice to desired length.
    return ( num + '000000000000000000000000000000000' ) . slice ( 0 , length ) ;
}

/**
 * Calculates the sum of all numeric elements in an array.
 * This is a duplicate function definition from the original code.
 * It explicitly converts elements to numbers using '-0'.
 * @param {Array<number|string>} arr - The array whose elements are to be summed.
 * @returns {number} The total sum of the array elements.
 */
function arrsum ( arr )
{
    var sum = 0 ; // Initialize the sum accumulator.
    for ( var i = 0 , len = arr . length ; i < len ; ++i )
    {
        sum += arr[i] - 0 ; // Add each element to sum, ensuring numeric conversion.
    } ; // Semicolon as in original.
    return sum ; // Return the final sum.
}

/**
 * Performs prime factorization of a given number `n`.
 * Returns an object where keys are prime factors and values are their exponents.
 * Handles the edge case for n=1.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} An object representing the prime factors and their counts.
 */
function pf ( n )
{
    var result = { } ; // Object to store prime factors and their counts.

    if ( n === 1 )
    {
        return { "1": 1 } ; // Special case: prime factors of 1.
    }

    var init = 2 ; // Start checking for prime factors from 2.

    while ( n !== 1 )
    {
        var i = init ; // Current divisor candidate.
        // Loop to find the smallest prime factor for the current 'n'.
        while ( i < Number . MAX_SAFE_INTEGER )
        {
            if ( n % i === 0 ) // If 'i' is a factor of 'n'.
            {
                n /= i ; // Divide 'n' by the factor.
                if ( ! ( result[i] > 0 ) )
                {
                    result[i] = 0 ; // Initialize count if factor is new.
                }
                result[i] ++ ; // Increment count for this factor.
                break ; // Move to the next 'n' (after division).
            }
            i ++ ; // Try the next potential factor.
        }
        init = i ; // Update 'init' to continue searching from the current factor.
    }
    return result ; // Return the object with prime factors.
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greatest common divisor of `a` and `b`.
 */
function gcd ( a , b )
{
    if ( b === 0 ) // Base case: if b is 0, a is the GCD.
    {
        return a ;
    }
    return gcd ( b , a % b ) ; // Recursive step.
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The least common multiple of `a` and `b`.
 */
function lcm ( a , b )
{
    // Helper function for GCD (Euclidean algorithm).
    var g = ( n , m ) => m ? g ( m , n % m ) : n ;
    return a * b / g ( a , b ) ; // Calculate LCM using GCD.
}

/**
 * A simple subtraction function, often used as a comparator for sorting in ascending order.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The difference `a - b`.
 */
function num ( a , b )
{
  return a - b ;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest
 * element that is less than or equal to a given search value.
 * If the search value is smaller than all elements, it returns the index where it would be inserted (0).
 * If the search value is found, it returns its index.
 * @param {Array<number>} a - The sorted array to search within.
 * @param {number} searchValue - The value to search for.
 * @returns {number} The index of the found element or insertion point.
 */
function nibu ( a , searchValue )
{
	var index = -1 ; // Initialize result index.

    // Left boundary of the search range.
    var left = 0 ;

    // Right boundary of the search range.
    var right = a . length - 1 ;

    // Continue searching while the left boundary is less than or equal to the right boundary.
    while ( left <= right )
    {
        // Calculate the middle index of the current search range.
        middle = Math . floor ( ( left + right ) / 2 ) ;

        // Compare the middle element with the search value.
        if ( a[middle] == searchValue )
        {
            index = middle ; // Value found, store its index.
            break ; // Exit the loop.
        }
        else if ( a[middle] < searchValue )
        {
            // If middle element is less than search value, search in the right half.
            left = middle + 1 ;
        }
        else
        {
            // If middle element is greater than search value, search in the left half.
            right = middle - 1 ;
        }
    }
    // If an exact match was found, return its index.
    if ( index != -1 ) return index ;
    // Otherwise, 'left' will be the index where 'searchValue' would be inserted
    // to maintain sorted order, or the index of the first element greater than 'searchValue'.
    else return left ;
}

/**
 * Splits an input string into an array of substrings using the newline character as a delimiter.
 * This is a wrapper around `String.prototype.split('\n')`.
 * @param {string} input - The string to be split.
 * @returns {Array<string>} An array of strings, each representing a line from the input.
 */
function br ( input )
{
  return input . split ( "\n" ) ; // Split the string by newline.
}

/**
 * Checks if an array of numbers is sorted in non-decreasing (ascending) order.
 * @param {Array<number>} arr - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function is_sortred ( arr )
{
  var flag = true ; // Assume sorted until a violation is found.
  for ( var i = 1 ; i < arr . length ; i ++ )
  {
    if ( arr[i-1] > arr[i] ) // If a previous element is greater than the current one.
    {
      flag = false ; // The array is not sorted.
      break ; // No need to check further.
    }
  }
  return flag ; // Return the sorted status.
}

/**
 * Performs prime factorization of a given number `n`.
 * Returns an object where keys are prime factors and values are their exponents.
 * This is another implementation of prime factorization.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} An object representing the prime factors and their counts.
 */
function primeFactorization ( n )
{
	// Store the integer part of the square root of n.
	var s = Math . floor ( Math . sqrt ( n ) ) ;

	var r = 0 ; // Exponent counter for prime factors.

	var result = { } ; // Object to store the factorization.

	// Check for prime factors from 2 up to the square root of n.
	for ( var i = 2 ; i <= s ; i ++ )
	{
		if ( ( n % i ) == 0 ) // If 'i' is a factor.
		{
			r = 0 ; // Reset exponent counter.

			do {
				r ++ ; // Increment exponent.
				n = n / i ; // Divide n by the factor.
			} while ( ( n % i ) == 0 ) ; // Continue as long as 'i' is still a factor.

			// Store the prime factor 'i' with its exponent 'r'.
			result[i] = r ;
		}
	}

	// If after dividing by all factors up to sqrt(n), 'n' is still greater than 's',
	// then the remaining 'n' is a prime factor itself.
	if ( n > s )
	{
		result[n] = 1 ; // Add the remaining prime factor with exponent 1.
	}

	return result ; // Return the prime factorization object.
}