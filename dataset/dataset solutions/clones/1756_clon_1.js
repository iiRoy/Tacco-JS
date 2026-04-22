/*
 ************************************************************************************************
 *                                      Utility Functions List                                  *
 ************************************************************************************************
 *
 *  arr1dto2d(Array)           : Transforms a one-dimensional array into a two-dimensional array.
 *  pf(N)                      : Returns an object containing the prime factorization of N.
 *  gcd(a,b)                   : Calculates the greatest common divisor of two numbers.
 *  lcm(a,b)                   : Computes the least common multiple of two numbers.
 *  num(a,b)                   : Simple helper function returning a - b, useful for sorting.
 *  isPrime(n)                 : Checks if a given number is a prime number, returns boolean.
 *  isNumber(n)                : Determines if a value is a valid number string, returns boolean.
 *  arrsum(arr)                : Computes the sum of all elements in an array.
 *  nibu(arr,n)                : Performs a binary search to find the index of the largest number
 *                               less than or equal to 'n' in a sorted array.
 *  br(input)                  : Splits the input string by newline characters.
 *  pow(a,b)                   : Calculates a raised to the power of b (custom implementation).
 *  zisyozyunn(a)              : Calculates lexicographical order related sum.
 *  debug(val)                 : Logs a value to the console if debugMode is enabled.
 *  arrMaxPoint(arr)           : Finds the index of the maximum value in an array.
 *  arrMinPoint(arr)           : Finds the index of the minimum value in an array.
 *  factorialize(num)          : Computes the factorial of a number recursively.
 *  rotate(array)              : Rotates a 2D array by 90 degrees clockwise.
 *  part_in(base,push,st)      : Inserts elements from 'push' array into 'base' array starting at 'st'.
 *  part_reverse(arr,s,g)      : Reverses a portion of an array from index 's' to 'g'.
 *  zeroPadding(num,length)    : Pads a number with leading zeros to a specified length.
 *  is_sortred(arr)            : Checks if an array is sorted in ascending order.
 *  primeFactorization(n)      : Alternative prime factorization function.
 *
 ************************************************************************************************
 */

  const debugMode  = false; // Flag to control debug logging
  const inf        = Number.MAX_SAFE_INTEGER; // Represents positive infinity for safe integers
  const mod        = 1000000007; // A common modulus used in competitive programming

/**
 * Main function to process the input and produce the desired output.
 * @param {string} input - The raw input string from stdin.
 */
function Main(  input  ) {

    // First, split the entire input string by newline characters.
    input = input.split(  "\n"  );

    // Parse the second line of input into an array of numbers.
    // The problem statement implies the first line might contain N, but it's not used here.
    var arr = input[1].split(  " "  ).map(  Number  );


    // Initialize a variable 'n' to 0 for XOR accumulation.
    var   n   =   0;

    // Iterate through the array and calculate the XOR sum of all elements.
    arr.forEach(  function(  val  ) {
        n = n  ^  val; // XOR operation
    }  );

    // Create an empty array to store the results.
    var ans =   [];

    // For each value in the original array, calculate 'n XOR val' and push to the answer array.
    arr.forEach(  function(  val  ) {
        ans.push(  n  ^  val  );
    }  );

    // Output the elements of the 'ans' array joined by spaces.
    console.log(  ans.join(  " "  )  );

} // End of Main function

/*
 * This part executes the Main function with input from stdin.
 * It reads the file, converts it to UTF-8, trims whitespace, and passes it to Main.
 */
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin",  "utf8"  ).trim()  );

/**
 * Custom power function. Note: This implementation is flawed; it returns 'a' instead of the calculated power.
 * @param {number} a - The base.
 * @param {bigint} b - The exponent (should be a BigInt for the loop condition).
 * @returns {number} - The base 'a' (due to a bug in the original code).
 */
function pow(  a,  b  ) {
    var ans = 0; // Initialize answer to 0

    // Loop 'b' times
    for (  var i = 0n;  i < b;  i += 1n  ) {
        if (  ans == 0  ) {
            ans = a; // If ans is 0, set it to 'a' (first multiplication)
        } else {
            ans *= a; // Otherwise, multiply by 'a'
        }
    }
    // BUG: This function should return 'ans', but it returns 'a'.
    return a;
}

/**
 * Calculates a sum related to lexicographical order.
 * This function appears to be incomplete or specific to a certain problem context.
 * It depends on a global 'input' variable and 'factorialize' function.
 * @param {Array<number>} a - An array of numbers.
 * @returns {number} - The calculated sum.
 */
function zisyozyunn(  a  ) {
  var arr = []; // Initialize an empty array
  // Populate 'arr' with numbers from 1 to input[0] (assuming input[0] is a number)
  for (  var i = 0;  i < input[0];  i++  ) {
    arr.push(  i + 1  );
  }
  var sum = 0; // Initialize sum

  // Iterate through the input array 'a'
  for (  var i = 0;  i < a.length;  i++  ) {
    // Find the index of a[i] in 'arr'
    var f = arr.findIndex(  val  =>  val == a[i]  );
    // Add to sum: factorial of remaining elements * found index
    sum += factorialize(  a.length - 1 - i  ) * f;
    // Remove the found element from 'arr'
    arr.splice(  f,  1  );
  }
  return sum; // Return the final sum
}

/**
 * Calculates the sum of elements in an array.
 * This function is duplicated later in the file.
 * @param {Array<number>} arr - The array of numbers.
 * @returns {number} - The sum of the array elements.
 */
function arrsum(  arr  ) {
  var sum = 0; // Initialize sum to zero
  // Loop through the array
  for (  var i = 0,  len = arr.length;  i < len;  ++i  ) {
      sum += arr[i] - 0; // Add element to sum (subtracting 0 ensures numeric type)
  }
  ; // Empty statement for semicolon consistency if desired
  return sum; // Return the total sum
}

/**
 * Logs a value to the console only if debugMode is true.
 * @param {*} val - The value to be logged.
 */
function debug(  val  ) {
  if (  debugMode == true  ) {
    console.log(  val  ); // Log the value
  }
}

/**
 * Finds the index of the maximum value in an array.
 * If the array is empty, returns -1.
 * @param {Array<number>} arr - The array to search.
 * @returns {number} - The index of the maximum value, or -1 if array is empty.
 */
function arrMaxPoint(  arr  ) {
	var max = Number.MIN_SAFE_INTEGER; // Initialize max with the smallest safe integer
	var point = -1; // Initialize point (index) to -1
	// Iterate through the array
	for (  var i = 0;  i < arr.length;  i++  ) {
		if (  max < arr[i]  ) { // If current element is greater than current max
			max = arr[i]; // Update max
			point = i; // Update index
		}
	}
	return point; // Return the index of the maximum value
}

/**
 * Finds the index of the minimum value in an array.
 * If the array is empty, returns -1.
 * @param {Array<number>} arr - The array to search.
 * @returns {number} - The index of the minimum value, or -1 if array is empty.
 */
function arrMinPoint(  arr  ) {
	var min = Number.MAX_SAFE_INTEGER; // Initialize min with the largest safe integer
	var point = -1; // Initialize point (index) to -1
	// Iterate through the array
	for (  var i = 0;  i < arr.length;  i++  ) {
		if (  min > arr[i]  ) { // If current element is smaller than current min
			min = arr[i]; // Update min
			point = i; // Update index
		}
	}
	return point; // Return the index of the minimum value
}

/**
 * Checks if a given number is prime.
 * @param {number} n - The number to check.
 * @returns {boolean} - True if prime, false otherwise.
 */
function isPrime(  n  ) {
    // Ensure the input is an integer.
    if (  false === Number.isInteger(  n  )  ) {
        return false;
    }
    // Numbers less than or equal to 1 are not prime.
    if (  n <= 1  ) {
        return false;
    }
    // 2 is the only even prime number.
    if (  2 === n  ) {
        return true;
    }
    // Any other even number is not prime.
    if (  0 === n % 2  ) {
        return false;
    }
    // Check for divisibility by odd numbers up to the square root of n.
    var square_root = Math.floor(  Math.sqrt(  n  )  );
    for (  var i = 3;  i <= square_root;  i += 2  ) {
        if (  0 === n % i  ) {
            return false; // Found a divisor, so not prime.
        }
    }
    return true; // No divisors found, it's prime.
}

/**
 * Checks if a value represents a valid non-negative integer string.
 * Uses a regular expression to validate.
 * @param {*} val - The value to check.
 * @returns {boolean} - True if it's a valid number string, false otherwise.
 */
function isNumber(  val  ) {
	const pat = /^([1-9]\d*|0)$/; // Regex for non-negative integers
	return pat.test(  val  ); // Test the value against the pattern
}

/**
 * Calculates the factorial of a non-negative integer recursively.
 * @param {number} num - The non-negative integer.
 * @returns {number} - The factorial of the number.
 */
function factorialize(  num  ) {
  if (  num === 0  ) {
    return 1; // Base case: factorial of 0 is 1
  }
  return num * factorialize(  num - 1  ); // Recursive step
}

/**
 * Converts a 1D array of strings into a 2D array of numbers.
 * Assumes each string in the 1D array is space-separated numbers.
 * @param {Array<string>} arr - The 1D array of string rows.
 * @returns {Array<Array<number>>} - The 2D array of numbers.
 */
function arr1dto2d (  arr  ) {
	for (  var i = 0;  i < arr.length;  i++  ) {
    // For each element (string), split by space and map to Number.
    arr[i] = arr[i].split(  " "  ).map(  Number  );
    }
  return arr; // Return the modified 2D array
}

/**
 * Rotates a 2D array (matrix) 90 degrees clockwise.
 * @param {Array<Array<any>>} array - The 2D array to rotate.
 * @returns {Array<Array<any>>} - The rotated 2D array.
 */
function rotate(  array  ) {
  const ROW = array.length; // Number of rows in the original array
  const COL = array[0].length; // Number of columns in the original array

  const row = ROW - 1; // Helper variable for row indexing in rotation

  var a = new Array(  COL  ); // Create a new array with COL rows (new rows become old columns)

  // Initialize new array dimensions and perform rotation
  for (  var c = 0;  c < COL;  c++  ) {
    a[c] = new Array(  ROW  ); // Each new row will have ROW elements (old rows)
    for (  var r = 0;  r < ROW;  r++  ) {
      a[c][r] = array[row - r][c]; // Rotation logic
    }
  }
  return a; // Return the rotated array
}

/**
 * Inserts elements from a 'push' array into a 'base' array starting at a specified index 'st'.
 * Modifies the 'base' array in place.
 * @param {Array<any>} base - The array to modify.
 * @param {Array<any>} push - The elements to insert.
 * @param {number} st - The starting index in 'base'.
 * @returns {Array<any>} - The modified 'base' array.
 */
function part_in(  base,  push,  st  ) {
	for (  var i = st,  p = 0;  p < push.length;  i++,  p++  ) {
		base[i] = push[p]; // Copy element from 'push' to 'base'
	}
	return base; // Return the modified base array
}

/**
 * Reverses a specified part of an array.
 * Creates a slice, reverses it, and then inserts it back into the original array.
 * @param {Array<any>} arr - The array to modify.
 * @param {number} s - The starting index (1-based) of the segment to reverse.
 * @param {number} g - The ending index (1-based) of the segment to reverse.
 * @returns {Array<any>} - The array with the specified part reversed.
 */
function part_reverse(  arr,  s,  g  ) {
	var push = arr.slice(  s - 1,  g  ); // Extract the segment to reverse
  push.reverse(); // Reverse the extracted segment
	arr = part_in(  arr,  push,  s - 1  ); // Insert the reversed segment back into the original array
	return arr; // Return the modified array
}

/**
 * Pads a number string with leading zeros to reach a specified length.
 * Note: This implementation uses a very long string of zeros and slices it.
 * @param {number|string} num - The number or string to pad.
 * @param {number} length - The desired total length of the string.
 * @returns {string} - The zero-padded string.
 */
function zeroPadding(  num,  length  ) {
    // Concatenate the number with a very long string of zeros and then slice.
    return (  num + '000000000000000000000000000000000'  ).slice(  0,  length  );
}

/**
 * Calculates the sum of elements in an array.
 * This is a duplicate of the earlier arrsum function.
 * @param {Array<number>} arr - The array of numbers.
 * @returns {number} - The sum of the array elements.
 */
function arrsum(  arr  ) {
    var sum = 0; // Initialize sum
    // Loop through the array elements
    for (  var i = 0,  len = arr.length;  i < len;  ++i  ) {
        sum += arr[i] - 0; // Add current element to sum (ensure numeric conversion)
    }
    ; // Another empty statement
    return sum; // Return the total sum
}

/**
 * Performs prime factorization of a number N and returns the result as an object.
 * The keys are prime factors and values are their exponents.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} - An object representing the prime factors and their counts.
 */
function pf(  n  ) {
    var result = {}; // Object to store prime factors and their counts

    // Base case: 1 has no prime factors other than itself with an exponent of 1, or empty.
    if (  n === 1  ) {
        return {  "1": 1  };
    }

    var init = 2; // Start checking for factors from 2

    // Continue until 'n' becomes 1 (fully factorized)
    while (  n !== 1  ) {
        var i = init; // Current potential factor
        // Loop to find the smallest prime factor of the current 'n'
        while (  i < Number.MAX_SAFE_INTEGER  ) { // Max safe integer as an upper bound
            if (  n % i === 0  ) { // If 'i' is a factor
                n /= i; // Divide 'n' by 'i'
                if (  !(  result[i] > 0  )  ) { // If 'i' is not yet in result or its count is 0
                    result[i] = 0; // Initialize count to 0
                }
                result[i]++; // Increment count for factor 'i'
                break; // Break inner loop to re-evaluate 'n' with the same factor 'i'
            }
            i++; // Move to the next potential factor
        }
        init = i; // Update 'init' to continue search from the current factor
    }
    return result; // Return the factorization result
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} - The greatest common divisor.
 */
function gcd(  a,  b  ) {
    if (  b === 0  ) {
        return a; // Base case: if b is 0, a is the GCD
    }
    return gcd(  b,  a % b  ); // Recursive call
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} - The least common multiple.
 */
function lcm(  a,  b  ) {
    // Inner function to calculate GCD using a ternary operator (recursive)
    var g = (  n,  m  ) => m ? g(  m,  n % m  ) : n;
    return a * b / g(  a,  b  ); // Apply the LCM formula
}

/**
 * A simple comparator function that returns the difference a - b.
 * Useful for sorting arrays in ascending order.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} - The difference a - b.
 */
function num(  a,  b  ) {
  return a - b; // Returns the difference
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to a given searchValue.
 * @param {Array<number>} a - The sorted array to search.
 * @param {number} searchValue - The value to search for.
 * @returns {number} - The index of the found element, or the insertion point if not found.
 */
function nibu(  a,  searchValue  ) {
	var index = -1; // Initialize index to -1 (not found)

// Left boundary of the search range.
var left = 0;

// Right boundary of the search range.
var right = a.length - 1;

// Continue searching as long as there is a valid range.
while (  left <= right  ) {

    // Calculate the middle index.
    middle = Math.floor(  (  left + right  ) / 2  );

    // Compare the middle element with the search value.
    if (  a[middle] == searchValue  ) {
        // If they match, we found it.
        index = middle;
        break;
    } else if (  a[middle] < searchValue  ) {
        // If middle is less than search value, search in the right half.
        left = middle + 1;
    } else {
        // If middle is greater than search value, search in the left half.
        right = middle - 1;
    }
}
// If an exact match was found, return its index.
if (  index != -1  ) return index;
// Otherwise, 'left' will be the insertion point (or the index of the next greater element).
else return left;
}

/**
 * Splits an input string by newline characters, returning an array of lines.
 * This is a simplified version of input.split("\n").
 * @param {string} input - The input string.
 * @returns {Array<string>} - An array of strings, each representing a line.
 */
function br(  input  ) {
  return input.split(  "\n"  ); // Split by newline
}

/**
 * Checks if an array is sorted in ascending order.
 * @param {Array<number>} arr - The array to check.
 * @returns {boolean} - True if sorted, false otherwise.
 */
function is_sortred(  arr  ) {
  var flag = true; // Assume sorted initially
  // Iterate from the second element
  for (  var i = 1;  i < arr.length;  i++  ) {
    if (  arr[i - 1] > arr[i]  ) { // If an element is greater than the next one
      flag = false; // Not sorted
      break; // Exit loop early
    }
  }
  return flag; // Return the result
}

/**
 * Performs prime factorization of a number and returns the result as an object.
 * Similar to 'pf' but with a slightly different implementation approach.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} - An object representing the prime factors and their counts.
 */
function primeFactorization(  n  ) {

	// Calculate the square root of n once for optimization.
	var s = Math.floor(  Math.sqrt(  n  )  );

	var r = 0; // Exponent counter for prime factors.

	var result = {}; // Object to store the prime factors.

	// Iterate from 2 up to the square root of n.
	for (  var i = 2;  i <= s;  i++  ) {

		if (  (  n % i  ) == 0  ) { // If 'i' is a factor of 'n'.

			r = 0; // Reset exponent counter.

			do {

				r++; // Increment exponent.

				n = n / i; // Divide 'n' by 'i'.

			} while (  (  n % i  ) == 0  ); // Continue dividing as long as 'i' is a factor.

			// Store the prime factor 'i' and its exponent 'r'.
			result[i] = r;

		}

	}

	// If 'n' is still greater than 's' after the loop, it means the remaining 'n'
	// is a prime number itself (larger than its original square root).
	if (  n > s  ) {
		result[n] = 1; // Add the remaining prime factor with exponent 1.
	}

	return result; // Return the prime factorization object.

}