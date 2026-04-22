/*
*=============================================================*
*           Utility Functions Collection                      *
*-------------------------------------------------------------*
* arr1dto2d(Array)           : Transforms a 1D array to 2D.   *
* pf(N)                      : Returns prime factorization as object. *
* gcd(a,b)                   : Calculates the Greatest Common Divisor. *
* lcm(a,b)                   : Calculates the Least Common Multiple. *
* num(a,b)                   : Returns a-b, useful for sorting. *
* isPrime(n)                 : Checks if a number is prime.   *
* isNumber(n)                : Verifies if a value is a number. *
* arrsum(arr)                : Sums elements of an array.     *
* nibu(arr,n)                : Binary search for largest index <= n. *
* br(input)                  : Splits input by newline.       *
*=============================================================*
*/

const   debugMode =   false   ; // Flag for debugging
const   inf       =   Number.MAX_SAFE_INTEGER ;
const   mod       =   1000000007              ; // Modulo constant

// Main entry point for the program
function Main(  input )
{

    input = input.split("\n") ; // Split input by newlines

    // Process the second line of input
    var arr = input[1].split(" ").map(Number) ;

    var n = 0 ; // Initialize XOR sum

    // Calculate XOR sum of all elements
    arr.forEach(function(  val )
    {
        n = n^val ;
    }   ) ;

    var ans = [] ; // Placeholder for results (not used in current logic)

    // Output XOR sum with each element
    arr.forEach(function(  val )
    {
        console.log(n^val)
    }   ) ;

}
Main( require("fs").readFileSync("/dev/stdin", "utf8").trim() ) ;

/*
 * Function: pow
 * Description: Calculates a to the power of b (naive implementation for BigInt).
 * Parameters:
 *   a - The base number (BigInt).
 *   b - The exponent (BigInt).
 * Returns: The result of a^b.
 */
function pow(  a , b )
{
    var ans = 0 ; // Initialize accumulator

    for(var i=0n ; i<b ; i+=1n )
    {
        if(ans == 0)
        {
            ans = a ; // First iteration, ans is a
        }
        else
        {
            ans *= a ; // Multiply by a
        }
    }
    return a ; // NOTE: This function has a bug, it always returns 'a'. Should be 'ans'.
}

/**
 * zisyozyunn
 * Calculates a lexicographical index or sum based on an array.
 * @param {Array} a - The input array.
 * @returns {Number} The calculated sum.
 */
function zisyozyunn( a )
{
  var arr = [] ; // Temporary array

  for(var i=0 ; i<input[0] ; i++ )
  {
    arr.push(i+1) ; // Populate array with numbers
  }

  var sum = 0 ; // Initialize sum

  for(var i=0 ; i<a.length ; i++ )
  {
    var f = arr.findIndex(val => val==a[i]) ; // Find index of element
    sum += factorialize(a.length-1-i)*f ; // Add to sum
    arr.splice(f,1) ; // Remove element from temporary array
  }
  return sum ; // Return the final sum
}

// Function to calculate the sum of elements in an array
function arrsum(  arr )
{
  var sum = 0 ; // Sum accumulator

  for (var i=0 , len=arr.length ; i<len ; ++i )
  {
      sum += arr[i]-0 ; // Add current element to sum
  } ; // Semicolon after loop is unusual but valid.

  return sum ; // Return total sum
}

// Debugging utility: logs value if debugMode is true
function debug(  val )
{
  if(  debugMode==true  )
  {
    console.log(  val )
  }
}

/**
 * arrMaxPoint
 * Finds the index of the maximum value in an array.
 * @param {Array} arr - The input array.
 * @returns {Number} The index of the maximum value, or -1 if array is empty.
 */
function arrMaxPoint(  arr )
{
	var max = Number.MIN_SAFE_INTEGER ; // Initialize max to smallest possible safe integer
	var point = -1 ; // Initialize point (index)

	for(var i=0 ; i<arr.length ; i++ )
	{
		if(  max<arr[i]  )
		{
			max = arr[i] ; // Update max value
			point = i ; // Update index
		}
	}
	return point ; // Return the index of the max value
}

// Function to find the index of the minimum value in an array
function arrMinPoint(  arr )
{
	var min = Number.MAX_SAFE_INTEGER ; // Initialize min to largest possible safe integer
	var point = -1 ; // Initialize index

	for(var i=0 ; i<arr.length ; i++ )
	{
		if(  min>arr[i]  )
		{
			min = arr[i] ; // Update min value
			point = i ; // Update index
		}
	}
	return point ; // Return the index of the min value
}

/*
 * isPrime
 * Checks if a given number is a prime number.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is prime, false otherwise.
 */
function isPrime(  n )
{
    // Ensure n is an integer
    if(  false===Number.isInteger(n)  )
    {
        return false ;
    }
    // Numbers less than or equal to 1 are not prime
    if(  n<=1  )
    {
        return false ;
    }
    // 2 is the only even prime number
    if(  2===n  )
    {
        return true ;
    }
    // Even numbers greater than 2 are not prime
    if(  0===n%2  )
    {
        return false ;
    }
    // Check divisibility by odd numbers up to the square root
    var square_root = Math.floor(Math.sqrt(n)) ;

    for(var i=3 ; i<=square_root ; i+=2 )
    {
        if(  0===n%i  )
        {
            return false ; // Found a divisor, not prime
        }
    }
    return true ; // No divisors found, it's prime
}

// isNumber: Checks if a value represents a number (positive integer or zero).
function isNumber(  val )
{
	const pat = /^([1-9]\d*|0)$/ ; // Regular expression for non-negative integers
	return pat.test(val) ; // Test the value against the pattern
}

// factorialize: Calculates the factorial of a number.
function factorialize(  num )
{
  if (  num === 0  )
  { return 1 ; } // Base case: 0! = 1
  return num * factorialize(num-1) ; // Recursive step
}

// arr1dto2d: Converts a 1D array of space-separated strings into a 2D array of numbers.
function arr1dto2d (  arr )
{
	for(var i=0 ; i<arr.length ; i++ )
	{
    arr[i]=arr[i].split(" ").map(Number) ; // Split string, map to number
    }
  return arr ; // Return the modified 2D array
}

// rotate: Rotates a 2D array 90 degrees clockwise.
function rotate(  array )
{
  const ROW = array.length ; // Number of rows
  const COL = array[0].length ; // Number of columns
  const row = ROW-1 ; // Last row index

  var a = new Array(COL) ; // New array with swapped dimensions

  for (var c=0 ; c<COL ; c++ )
  {
    a[c] = new Array(ROW) ; // Initialize inner array
    for (var r=0 ; r<ROW ; r++ )
    {
      a[c][r] = array[row-r][c] ; // Perform rotation logic
    }
  }
  return a ; // Return the rotated array
}

// part_in: Inserts elements from `push` array into `base` array starting at `st` index.
function part_in(  base , push , st )
{
	for(var i=st , p=0 ; p<push.length ; i++ , p++ )
	{
		base[i] = push[p] ; // Copy elements
	}
	return base ; // Return modified base array
}

// part_reverse: Reverses a portion of an array.
function part_reverse(  arr , s , g )
{
	var push = arr.slice(s-1,g) ; // Extract the sub-array
  push.reverse() ; // Reverse the sub-array
	arr = part_in(arr,push,s-1) ; // Insert the reversed sub-array back
	return arr ; // Return the modified array
}

// zeroPadding: Pads a number with leading zeros to a specified length.
function zeroPadding(  num , length )
{
    // Appends a long string of zeros and then slices to desired length.
    return (num + '000000000000000000000000000000000').slice(0,length) ;
}

// arrsum: Calculates the sum of elements in an array. (Duplicate definition)
function arrsum(  arr )
{
    var sum = 0 ; // Initialize sum

    for (var i=0 , len=arr.length ; i<len ; ++i )
    {
        sum += arr[i]-0 ; // Add element to sum (ensure numeric conversion)
    } ;

    return sum ; // Return the total sum
}

/*
 * Function: pf (Prime Factorization)
 * Description: Computes the prime factorization of a given number.
 * @param {number} n - The number to factorize.
 * @returns {object} An object where keys are prime factors and values are their exponents.
 */
function pf(  n )
{
    var result = {} ; // Object to store prime factors and their counts.

    if (  n === 1  )
    {
        return {"1":1} ; // Special case for 1.
    }

    var init = 2 ; // Start checking from prime 2.

    while (  n !== 1  )
    {
        var i = init ; // Current divisor candidate.
        while (  i < Number.MAX_SAFE_INTEGER  )
        {
            if (  n % i === 0  )
            {
                n /= i ; // Divide n by its factor.
                if (  !(result[i] > 0)  )
                {
                    result[i] = 0 ; // Initialize count if factor is new.
                }
                result[i]++ ; // Increment count for this factor.
                break ; // Move to the next factor of the reduced n.
            }
            i++ ; // Try next potential factor.
        }
        init = i ; // Start next search from the current factor.
    }
    return result ; // Return the prime factorization object.
}

// gcd: Calculates the Greatest Common Divisor of two numbers using Euclidean algorithm.
function gcd(  a , b )
{
    if (  b === 0  )
    {
        return a ; // Base case
    }
    return gcd(b, a % b) ; // Recursive step
}

// lcm: Calculates the Least Common Multiple of two numbers.
function lcm(  a , b )
{
    // Helper function for GCD (local scope)
    var g = (n, m) => m ? g(m, n % m) : n ;
    return a * b / g(a, b) ; // Formula: lcm(a,b) = (a*b) / gcd(a,b)
}

// num: Simple subtraction function, often used in sort callbacks.
function num(  a , b )
{
  return a - b ;
}

/*
 * nibu (Binary Search)
 * Finds the index of the largest element less than or equal to searchValue in a sorted array.
 * If searchValue is smaller than all elements, it returns the insertion point (index 0).
 * @param {Array} a - The sorted array.
 * @param {number} searchValue - The value to search for.
 * @returns {number} The index of the element, or the insertion point if not found.
 */
function nibu(  a , searchValue )
{
	var index = -1 ; // Result index

    // Left boundary of the search range
    var left = 0 ;

    // Right boundary of the search range
    var right = a.length-1 ;

    // Continue searching as long as the range is valid
    while(  left <= right  )
    {

        // Calculate the middle index
        middle = Math.floor((left + right)/2) ;

        // Compare the middle value with the search value
        if(  a[middle]==searchValue  )
        {
            // Value found, store index and break
            index = middle ;
            break ;
        }else if(  a[middle]<searchValue  )
        {
            // Search value is greater, discard left half
            left = middle + 1 ;
        }else
        {
            // Search value is smaller, discard right half
            right = middle - 1 ;
        }
    }
    // If exact match found, return its index. Otherwise, return 'left'
    // which is the insertion point for searchValue to maintain sorted order.
    if(  index!=-1  ) return index ;
    else return left ;
}

// br: Splits input string by newline characters.
function br(  input )
{
  return input.split("\n") ;
}

// is_sortred: Checks if an array is sorted in ascending order.
function is_sortred(  arr )
{
  var flag = true ; // Assume sorted initially

  for(var i=1 ; i<arr.length ; i++ )
  {
    if(  arr[i-1]>arr[i]  )
    {
      flag = false ; // Found an unsorted pair
      break ; // No need to check further
    }
  }
  return flag ; // Return sorting status
}

/*
 * primeFactorization
 * Computes the prime factorization of a given number.
 * @param {number} n - The number to factorize.
 * @returns {object} An object where keys are prime factors and values are their exponents.
 */
function primeFactorization(  n )
{

	// Store the square root of n for optimization
	var s = Math.floor(Math.sqrt(n)) ;

	var r = 0 ; // Exponent counter

	var result = {} ; // Object to store factorization results

	// Iterate from 2 up to the square root of n
	for (var i = 2 ; i <= s ; i++ )
	{

		if (  (n % i) == 0  )
		{

			r = 0 ; // Reset exponent counter

			do
			{

				r++ ; // Increment exponent

				n = n / i ; // Divide n by the factor

			} while (  (n % i) == 0  ) ; // Continue while divisible

			// Store the prime factor and its exponent
			result[i]=r ;

		}

	}

	// If n is still greater than s, it means the remaining n is a prime factor itself
	if (  n > s  )
	{
		result[n] = 1 ; // Add the remaining prime factor with exponent 1
	}

	return result ; // Return the prime factorization object

}