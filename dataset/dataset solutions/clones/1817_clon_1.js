/*
 ********************************************************************************
 *  Function List Summary
 ********************************************************************************
 *  arr1dto2d(Array)        : Converts a 1D array to a 2D array (by splitting strings).
 *  pf(N)                   : Returns prime factorization results as an object.
 *  gcd(a,b)                : Returns the greatest common divisor of a and b.
 *  lcm(a,b)                : Returns the least common multiple of a and b.
 *  num(a,b)                : Returns a - b; primarily used for sorting operations.
 *  isPrime(n)              : Checks if a number is prime and returns a boolean.
 *  isNumber(n)             : Checks if a value is a number and returns a boolean.
 *  arrsum(arr)             : Calculates and returns the sum of array elements.
 *  nibu(arr,n)             : Returns the index of the largest number less than or equal to n (inclusive).
 *  br(input)               : Splits the input string by newline characters.
 *  zisyozyunn(a)           : Calculates lexicographical order related sum.
 *  debug(val)              : Logs a value to console if debug mode is active.
 *  arrMaxPoint(arr)        : Returns the index of the maximum value in an array.
 *  arrMinPoint(arr)        : Returns the index of the minimum value in an array.
 *  factorialize(num)       : Calculates the factorial of a number.
 *  rotate(array)           : Rotates a 2D array (matrix) 90 degrees clockwise.
 *  part_in(base, push, st) : Inserts elements from 'push' into 'base' starting at 'st'.
 *  part_reverse(arr, s, g) : Reverses a part of an array from index s to g (1-based).
 *  zeroPadding(num, length): Pads a number with leading zeros to a specified length.
 *  is_sortred(arr)         : Checks if an array is sorted in ascending order.
 *  primeFactorization(n)   : Another function for prime factorization.
 */
// --- Global Configuration and Constants ---
const   debugMode   =   false;  // Flag to enable/disable debug output.
const   inf         =   Number.MAX_SAFE_INTEGER; // Represents a very large number.
const   mod         =   1000000007;             // A common modulus for modular arithmetic.
// ------------------------------------------

function Main ( input )
{
    // Convert the input string to a number.
    input = Number ( input );

    /**
     *  Calculates the largest integer 'k' such that the sum of integers from 1 to 'k'
     *  (i.e., k * (k + 1) / 2) is less than or equal to 'n'.
     *  @param {number} n - The target number.
     *  @returns {number} The calculated 'k' value.
     */
    function kaisa ( n )
    {
        var sum = 0; // Initialize sum of integers
        var i   = 1; // Counter for integers

        // Loop to find the largest 'i' such that sum up to 'i' is less than 'n'
        for ( ; sum < n ; i++ )
        {
            sum += i; // Accumulate sum
            // This console.log statement is likely for debugging purposes.
            console.log ( sum , n );
        }
        // Return (i-1) because 'i' increments one too many times after sum >= n.
        return i - 1;
    }

    // Perform prime factorization on the input number.
    var arr = pf ( input );
    var ans = 0; // Initialize the answer accumulator.

    // Iterate over the prime factors and their exponents.
    Object.keys ( arr ) . forEach ( function ( val )
    {
        // Debugging line commented out: console.log(kaisa(arr[val]))
        // For each prime factor exponent, apply the 'kaisa' function and add to the total answer.
        ans += kaisa ( arr [ val ] );
    } );

    // Another debugging line commented out: console.log(arr)
    // Output the final calculated answer to the console.
    console.log ( ans );
}

// Main execution block: Reads input, processes it, and calls the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) );

// Function to calculate a sum based on lexicographical order principles.
function zisyozyunn ( a )
{
    var arr = [ ]; // Initialize an empty array.

    // Populate 'arr' with numbers from 1 up to input[0] (assuming input[0] is defined globally or passed).
    // Note: 'input' here seems to refer to a global variable, which is not ideal practice.
    for ( var i = 0 ; i < input [ 0 ] ; i++ )
    {
        arr . push ( i + 1 );
    }

    var sum = 0; // Initialize the sum.

    // Iterate through the input array 'a'.
    for ( var i = 0 ; i < a . length ; i++ )
    {
        // Find the index of the current element 'a[i]' in 'arr'.
        var f = arr . findIndex ( val => val == a [ i ] );
        // Add to sum: factorial of remaining elements * found index.
        sum += factorialize ( a . length - 1 - i ) * f;
        // Remove the found element from 'arr' to simulate selection.
        arr . splice ( f , 1 );
    }
    return sum; // Return the calculated sum.
}

/*
 *  Calculates the sum of all numeric elements in an array.
 *  This version explicitly converts each element to a number using '-0'.
 */
function arrsum ( arr )
{
    var sum = 0; // Initialize the total sum.

    // Loop through the array from the first element to the last.
    for ( var i = 0 , len = arr . length ; i < len ; ++i )
    {
        sum += arr [ i ] - 0; // Add the current element (converted to number) to the sum.
    }
    ; // Semicolon after loop body is redundant but kept for Type I fidelity.
    return sum; // Return the final computed sum.
}

// A utility function for conditional debugging output.
function debug ( val )
{
    // Check if the global debugMode flag is set to true.
    if ( debugMode == true )
    {
        // If debug mode is active, log the provided value to the console.
        console . log ( val );
    }
}

// Finds the index of the maximum value within an array.
function arrMaxPoint ( arr )
{
	var max   = Number . MIN_SAFE_INTEGER; // Initialize max with the smallest possible safe integer.
	var point = -1;                       // Initialize the index of the maximum value.

	// Iterate through each element of the array.
	for ( var i = 0 ; i < arr . length ; i++ )
	{
		// If the current element is greater than the current maximum, update max and its index.
		if ( max < arr [ i ] )
		{
			max   = arr [ i ]; // Update the maximum value.
			point = i;         // Update the index of the maximum value.
		}
	}
	return point; // Return the index where the maximum value was found.
}

// Finds the index of the minimum value within an array.
function arrMinPoint ( arr )
{
	var min   = Number . MAX_SAFE_INTEGER; // Initialize min with the largest possible safe integer.
	var point = -1;                       // Initialize the index of the minimum value.

	// Loop through the entire array.
	for ( var i = 0 ; i < arr . length ; i++ )
	{
		// If the current element is smaller than the current minimum, update min and its index.
		if ( min > arr [ i ] )
		{
			min   = arr [ i ]; // Update the minimum value found so far.
			point = i;         // Store the index of this new minimum.
		}
	}
	return point; // Return the index of the minimum value.
}

// Transforms a 1D array of strings into a 2D array of characters.
// Each string element in the input array is split into an array of its characters.
function arr1dto2d ( arr )
{
	for ( var i = 0 ; i < arr . length ; i++ )
	{
		// Split each string element by an empty string to get an array of individual characters.
		arr [ i ] = arr [ i ] . split ( "" );
	}
	return arr; // Return the modified 2D array.
}

/**
 *  Determines if a given number is a prime number.
 *  @param {number} n - The number to check for primality.
 *  @returns {boolean} True if 'n' is prime, false otherwise.
 */
function isPrime ( n )
{
    // First, check if the input is an integer. Non-integers cannot be prime.
    if ( false === Number . isInteger ( n ) )
    {
        return false;
    }
    // Numbers less than or equal to 1 are not prime by definition.
    if ( n <= 1 )
    {
        return false;
    }
    // The number 2 is the only even prime number.
    if ( 2 === n )
    {
        return true;
    }
    // Any even number greater than 2 is not prime.
    if ( 0 === n % 2 )
    {
        return false;
    }

    // For odd numbers, check divisibility only by odd numbers up to its square root.
    var square_root = Math . floor ( Math . sqrt ( n ) ); // Calculate the integer part of the square root.

    // Iterate starting from 3, incrementing by 2 (only checking odd divisors).
    for ( var i = 3 ; i <= square_root ; i += 2 )
    {
        // If 'n' is divisible by 'i', then 'n' is not prime.
        if ( 0 === n % i )
        {
            return false;
        }
    }
    // If no divisors were found, the number is prime.
    return true;
}

// Checks if a given value represents a valid non-negative integer string.
function isNumber ( val )
{
	// Regular expression to match non-negative integers (e.g., "0", "1", "123").
	// It allows for a single '0' or a number starting with 1-9 followed by any digits.
	const pat = / ^ ( [1-9] \d* | 0 ) $ / ;
	return pat . test ( val ); // Test the value against the pattern and return the boolean result.
}

/**
 *  Calculates the factorial of a non-negative integer.
 *  Uses recursion for its definition.
 *  @param {number} num - The number for which to calculate the factorial.
 *  @returns {number} The factorial of 'num'.
 */
function factorialize ( num )
{
  // Base case: factorial of 0 is 1.
  if ( num === 0 )
  {
      return 1;
  }
  // Recursive step: n! = n * (n-1)!
  return num * factorialize ( num - 1 );
}

// Rotates a 2D array (matrix) 90 degrees clockwise.
// Assumes a rectangular matrix.
function rotate ( array )
{
  const ROW = array . length;      // Number of rows in the original array.
  const COL = array [ 0 ] . length;  // Number of columns in the original array.
  const row = ROW - 1;             // Index of the last row for reverse iteration.

  // Create a new array with dimensions swapped (COL x ROW).
  var a = new Array ( COL );

  // Iterate through columns of the new array.
  for ( var c = 0 ; c < COL ; c++ )
  {
    a [ c ] = new Array ( ROW ); // Initialize each new column as a row.
    // Iterate through rows of the new array.
    for ( var r = 0 ; r < ROW ; r++ )
    {
      // Perform the rotation logic:
      // New element at (c, r) comes from original element at (ROW - 1 - r, c).
      a [ c ] [ r ] = array [ row - r ] [ c ];
    }
  }
  return a; // Return the rotated 2D array.
}

// Inserts elements from one array (`push`) into another (`base`) starting at a specific index (`st`).
function part_in ( base , push , st )
{
	// Loop through the 'push' array and copy its elements into 'base'.
	// 'i' tracks the index in 'base', 'p' tracks the index in 'push'.
	for ( var i = st , p = 0 ; p < push . length ; i++ , p++ )
	{
		base [ i ] = push [ p ]; // Assign element from 'push' to 'base'.
	}
	return base; // Return the modified 'base' array.
}

// Reverses a specific segment of an array, defined by start and end indices (1-based).
function part_reverse ( arr , s , g )
{
	// Extract the segment to be reversed (s-1 because slice is 0-based, g is exclusive).
	var push = arr . slice ( s - 1 , g );
	push . reverse ( ); // Reverse the extracted segment.
	// Insert the reversed segment back into the original array at the starting position (s-1).
	arr = part_in ( arr , push , s - 1 );
	return arr; // Return the array with the segment reversed.
}

// Pads a number with leading zeros to achieve a specified total length.
// This implementation uses string concatenation and slicing for padding.
function zeroPadding ( num , length )
{
    // Concatenate the number with a long string of zeros, then slice from the beginning
    // to get the desired 'length'. This effectively adds leading zeros if 'num' is short.
    return ( num + '000000000000000000000000000000000' ) . slice ( 0 , length );
}

/**
 *  (Duplicate function definition)
 *  Calculates the sum of numeric values within an array.
 *  This function is identical to an earlier `arrsum` definition,
 *  but it is explicitly kept for Type I cloning fidelity.
 *  @param {Array<number|string>} arr - The array whose elements are to be summed.
 *  @returns {number} The total sum of the array elements.
 */
function arrsum ( arr )
{
    var sum = 0; // Initialize sum accumulator.

    // Loop through each element of the array.
    for ( var i = 0 , len = arr . length ; i < len ; ++i )
    {
        // Add the current element to the sum, ensuring it's treated as a number
        // by subtracting zero (e.g., "5" - 0 becomes 5).
        sum += arr [ i ] - 0;
    }
    ; // Redundant semicolon, but preserved.
    return sum; // Return the final calculated sum.
}

/**
 *  Performs prime factorization of a given positive integer 'n'.
 *  Returns an object where keys are prime factors and values are their exponents.
 *  @param {number} n - The number to factorize.
 *  @returns {Object<string, number>} An object representing the prime factors and their counts.
 */
function pf ( n )
{
    var result = { }; // Initialize an empty object to store prime factors and their counts.

    // Special case: if n is 1, its prime factorization is just { "1": 1 } by convention here.
    if ( n === 1 )
    {
        return { "1" : 1 };
    }

    var init = 2; // Start checking for prime factors from 2.

    // Continue factorization until 'n' becomes 1.
    while ( n !== 1 )
    {
        var i = init; // Current potential prime factor to check.
        // Loop to find the smallest prime factor 'i' that divides 'n'.
        while ( i < Number . MAX_SAFE_INTEGER )
        {
            // If 'i' divides 'n' evenly:
            if ( n % i === 0 )
            {
                n /= i; // Divide 'n' by 'i'.
                // If 'i' is not yet in the result object, initialize its count to 0.
                if ( ! ( result [ i ] > 0 ) )
                {
                    result [ i ] = 0;
                }
                result [ i ]++; // Increment the count of prime factor 'i'.
                break;          // Found a factor, break inner loop to re-check 'n' with same 'i'.
            }
            i++; // Increment 'i' to check the next potential factor.
        }
        init = i; // Set 'init' to the last found factor 'i' to optimize subsequent checks.
    }
    return result; // Return the object containing prime factors and their exponents.
}

/**
 *  Calculates the Greatest Common Divisor (GCD) of two non-negative integers
 *  using the Euclidean algorithm (recursive approach).
 *  @param {number} a - The first number.
 *  @param {number} b - The second number.
 *  @returns {number} The GCD of 'a' and 'b'.
 */
function gcd ( a , b )
{
    // Base case: if b is 0, then a is the GCD.
    if ( b === 0 )
    {
        return a;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return gcd ( b , a % b );
}

/**
 *  Calculates the Least Common Multiple (LCM) of two numbers.
 *  It uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 *  This implementation uses an inner arrow function for GCD calculation.
 *  @param {number} a - The first number.
 *  @param {number} b - The second number.
 *  @returns {number} The LCM of 'a' and 'b'.
 */
function lcm ( a , b )
{
    // Inner function 'g' calculates GCD using a recursive arrow function.
    // Equivalent to Euclidean algorithm.
    var g = ( n , m ) => m ? g ( m , n % m ) : n;
    // Calculate LCM using the formula.
    return a * b / g ( a , b );
}

// A simple utility function that returns the difference between two numbers.
// Often used as a comparison function for sorting in ascending order.
function num ( a , b )
{
  return a - b; // Returns the difference.
}

/**
 *  Performs a binary search on a sorted array `a` to find the `searchValue`.
 *  If `searchValue` is found, its index is returned.
 *  If `searchValue` is not found, it returns the index where `searchValue` would be inserted
 *  to maintain sorted order (specifically, the index of the first element greater than `searchValue`).
 *  @param {Array<number>} a - The sorted array to search within.
 *  @param {number} searchValue - The value to search for.
 *  @returns {number} The index of `searchValue` if found, or the insertion point if not found.
 */
function nibu ( a , searchValue )
{
	var index = -1; // Initialize the result index.

	// 'left' represents the left boundary index of the search range.
	var left = 0;

	// 'right' represents the right boundary index of the search range.
	var right = a . length - 1;

	// Continue the binary search as long as the search range is valid (left <= right).
	while ( left <= right )
	{
		// Calculate the middle index of the current search range.
		// Using Math.floor to ensure an integer index.
		middle = Math . floor ( ( left + right ) / 2 );

		// Compare the value at the middle index with the target searchValue.
		if ( a [ middle ] == searchValue )
		{
			// If a match is found, store the index and exit the loop.
			index = middle;
			break;
		}
		else if ( a [ middle ] < searchValue )
		{
			// If the middle value is less than the searchValue,
			// discard the left half and search in the right half.
			left = middle + 1;
		}
		else
		{
			// If the middle value is greater than the searchValue,
			// discard the right half and search in the left half.
			right = middle - 1;
		}
	}

	// After the loop, if 'index' is not -1, the value was found.
	if ( index != -1 )
	{
		return index; // Return the found index.
	}
	else
	{
		// If the value was not found, 'left' will be the insertion point
		// (the index of the first element greater than searchValue, or a.length if all elements are smaller).
		return left;
	}
}

// Breaks an input string into an array of strings using the newline character as a delimiter.
// This is commonly used to parse multi-line input from stdin.
function br ( input )
{
  return input . split ( "\n" ); // Split the input string by newline characters.
}

/**
 *  Checks if an array is sorted in non-decreasing (ascending) order.
 *  @param {Array<number>} arr - The array to check.
 *  @returns {boolean} True if the array is sorted, false otherwise.
 */
function is_sortred ( arr )
{
  var flag = true; // Assume the array is sorted initially.

  // Iterate through the array starting from the second element.
  for ( var i = 1 ; i < arr . length ; i++ )
  {
    // Compare the current element with the previous one.
    if ( arr [ i - 1 ] > arr [ i ] )
    {
      flag = false; // If a pair is out of order, set flag to false.
      break;        // No need to check further, the array is not sorted.
    }
  }
  return flag; // Return the final flag value.
}

/**
 *  (Duplicate function definition)
 *  Another implementation for prime factorization of a positive integer 'n'.
 *  It finds prime factors and their exponents up to the square root of 'n'.
 *  @param {number} n - The number to factorize.
 *  @returns {Object<string, number>} An object mapping prime factors to their exponents.
 */
function primeFactorization ( n )
{
	// Store the integer part of the square root of 'n'.
	var s = Math . floor ( Math . sqrt ( n ) );

	var r = 0; // 'r' will store the exponent of a prime factor.

	var result = { }; // Object to hold the prime factors and their counts.

	// Find prime factors from 2 up to the square root 's'.
	for ( var i = 2 ; i <= s ; i++ )
	{
		// If 'i' is a factor of 'n':
		if ( ( n % i ) == 0 )
		{
			r = 0; // Reset the exponent counter for the current prime factor 'i'.

			// Continuously divide 'n' by 'i' as long as it's divisible.
			do
			{
				r++; // Increment the exponent for 'i'.
				n = n / i; // Divide 'n' by 'i'.
			} while ( ( n % i ) == 0 );

			// Store the prime factor 'i' and its exponent 'r' in the result object.
			result [ i ] = r;
		}
	}

	// If after dividing by all factors up to its square root, 'n' is still greater than 's',
	// it means the remaining 'n' is itself a prime number (or was the original n if it's prime).
	if ( n > s )
	{
		result [ n ] = 1; // Add the remaining prime factor with an exponent of 1.
	}

	return result; // Return the prime factorization result.
}