/*
 * This file contains various utility functions for common programming tasks.
 * It also includes the main entry point for the program's execution.
 *
 * All identifiers, operators, and expressions are preserved exactly
 * as in the original source, with only whitespace and comments altered.
 */


// --- Global Configuration and Constants ---
const debugMode = false; // Flag to control debugging output. Set to 'true' to enable.
const inf = Number.MAX_SAFE_INTEGER; // Represents positive infinity for numerical comparisons.


/*
 * Main function: Processes input data, performs calculations, and outputs the result.
 * This function specifically counts frequencies and then performs a subtraction-like operation.
 * @param {string} input - The raw input string, typically read from stdin.
 */
function Main(input)
{


    // Split the input string into an array of lines.
    input = input.split("\n");

    /*
     * Initialize an empty object to act as a frequency map or counter.
     * This will store string keys and their corresponding integer counts.
     */
    var arr = {};

    // The first line of input represents the number of elements to process initially.
    var n = input[0];

    // Remove the first element (which is 'n') from the input array,
    // so the remaining elements are the actual data.
    input.shift();


    /*
     * Loop to populate the frequency map 'arr'.
     * It iterates 'n' times, processing the first 'n' elements of the (modified) input array.
     */
    for (var i = 0; i < n; i++)
    {
        // Check if the current input element is already a key in 'arr'.
        if (arr[input[i]])
        {
            // If it exists, increment its count.
            arr[input[i]]++;
        }
        else
        {
            // If it's a new element, initialize its count to 1.
            arr[input[i]] = 1;
        }
    }


    /*
     * This line updates 'n' using the element at 'input[i]' (which is now 'input[n]' from the original array
     * since 'i' is 'n' after the previous loop) and the current value of 'i'.
     * The '-0' ensures the string is treated as a number.
     * This looks like a specific problem-solving step for a competitive programming context.
     */
    n = input[i] - 0 + i;

    // Increment 'i' one more time.
    i++;

    // console.log(n) // Original comment, now removed or modified. This was a debug statement.


    /*
     * Second loop: Iterates from the current value of 'i' up to the newly calculated 'n'.
     * This loop decrements counts in 'arr' or initializes to -1.
     */
    for (; i <= n; i++)
    {
        // Check if the current input element exists in 'arr'.
        if (arr[input[i]])
        {
            // If it exists, decrement its count.
            arr[input[i]]--;
        }
        else
        {
            // If it's a new element, initialize its count to -1.
            arr[input[i]] = -1;
        }
    }


    // Initialize 'max' to 0 to find the maximum frequency/count.
    var max = 0;

    // console.log(arr) // Original comment, now removed or modified. Another debug statement.

    /*
     * Iterate over the keys (elements) in the 'arr' object to find the maximum value.
     * The `Object.keys()` method returns an array of a given object's own enumerable property names.
     */
    Object.keys(arr).forEach(function(val)
    {
        // If the current value in 'arr' is greater than 'max', update 'max'.
        if (arr[val] > max) max = arr[val];
    });


    // Output the final maximum value found.
    console.log(max);
}


/*
 * Immediately invoke the Main function with input read from standard input.
 * This pattern is common in competitive programming environments.
 * It reads the file '/dev/stdin', decodes it as UTF-8, trims whitespace, and passes it to Main.
 */
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());


/*
 * Placeholder function 'next'. Its purpose is not defined in the provided snippet.
 * It takes two arguments, 'm' and 'now'.
 */
function next(m, now)
{
    // No implementation provided in the original code.
}


/*
 * Function 'zisyozyunn': Calculates a lexicographical index or similar value.
 * It appears to be related to permutations or arrangements.
 * @param {Array<number>} a - An array of numbers representing a permutation.
 * @returns {number} The calculated sum.
 */
function zisyozyunn(a)
{
    // Initialize an empty array 'arr'.
    var arr = [];

    // Populate 'arr' with numbers from 1 to input[0] (assuming input[0] is accessible and parsed).
    // This part relies on 'input' being a global or higher-scoped variable, which is a common pattern
    // in competitive programming if 'input' is globally defined or passed around.
    for (var i = 0; i < input[0]; i++)
    {
        arr.push(i + 1);
    }

    // Initialize sum to 0.
    var sum = 0;

    // Loop through the input array 'a'.
    for (var i = 0; i < a.length; i++)
    {
        // Find the index of the current element a[i] in 'arr'.
        var f = arr.findIndex(val => val == a[i]);

        // Add to sum: factorial of remaining elements * found index.
        sum += factorialize(a.length - 1 - i) * f;

        // Remove the found element from 'arr'.
        arr.splice(f, 1);
    }

    // Return the calculated sum.
    return sum;
}


/*
 * Function 'arrsum' (first definition): Calculates the sum of elements in an array.
 * This function is later redefined.
 * @param {Array<any>} arr - The array whose elements are to be summed.
 * @returns {number} The total sum of the array elements.
 */
function arrsum(arr)
{
    // Initialize sum to 0.
    var sum = 0;

    // Loop through the array using a traditional for loop.
    for (var i = 0, len = arr.length; i < len; ++i)
    {
        // Add the numeric value of the current element to sum.
        // The '-0' converts the element to a number.
        sum += arr[i] - 0;
    };

    // Return the computed sum.
    return sum;
}


/*
 * Function 'debug': Prints a value to the console only if 'debugMode' is true.
 * @param {any} val - The value to be logged.
 */
function debug(val)
{
    // Check if debugMode is explicitly true.
    if (debugMode == true)
    {
        // Log the value to the console.
        console.log(val);
    }
}


/*
 * Function 'arrMaxPoint': Finds the index of the maximum value in an array.
 * @param {Array<number>} arr - The array to search.
 * @returns {number} The index of the maximum element, or -1 if the array is empty.
 */
function arrMaxPoint(arr)
{
    // Initialize 'max' with the smallest possible safe integer.
    var max = Number.MIN_SAFE_INTEGER;

    // Initialize 'point' (index) to -1.
    var point = -1;

    // Iterate through the array.
    for (var i = 0; i < arr.length; i++)
    {
        // If the current element is greater than 'max'.
        if (max < arr[i])
        {
            // Update 'max' and 'point'.
            max = arr[i];
            point = i;
        }
    }

    // Return the index of the maximum element.
    return point;
}


/*
 * Function 'arrMinPoint': Finds the index of the minimum value in an array.
 * @param {Array<number>} arr - The array to search.
 * @returns {number} The index of the minimum element, or -1 if the array is empty.
 */
function arrMinPoint(arr)
{
    // Initialize 'min' with the largest possible safe integer.
    var min = Number.MAX_SAFE_INTEGER;

    // Initialize 'point' (index) to -1.
    var point = -1;

    // Iterate through the array.
    for (var i = 0; i < arr.length; i++)
    {
        // If the current element is smaller than 'min'.
        if (min > arr[i])
        {
            // Update 'min' and 'point'.
            min = arr[i];
            point = i;
        }
    }

    // Return the index of the minimum element.
    return point;
}


/*
 * Function 'arr1dto2d' (first definition): Converts a 1D array of strings into a 2D array of characters.
 * Each string element is split into an array of its constituent characters.
 * This function is later redefined multiple times.
 * @param {Array<string>} arr - The 1D array of strings.
 * @returns {Array<Array<string>>} The 2D array of characters.
 */
function arr1dto2d(arr)
{
    // Loop through each element of the input array.
    for (var i = 0; i < arr.length; i++)
    {
        // Split each string element into an array of characters.
        arr[i] = arr[i].split("");
    }

    // Return the modified array.
    return arr;
}


/*
 * Function 'isPrime': Determines if a given number is a prime number.
 * @param {number} n - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime(n)
{
    // First, check if 'n' is an integer. If not, it cannot be prime.
    if (false === Number.isInteger(n))
    {
        return false;
    }

    // Numbers less than or equal to 1 are not prime.
    if (n <= 1)
    {
        return false;
    }

    // 2 is the only even prime number.
    if (2 === n)
    {
        return true;
    }

    // Any other even number is not prime.
    if (0 === n % 2)
    {
        return false;
    }

    // Calculate the integer part of the square root of 'n'.
    // We only need to check divisors up to the square root.
    var square_root = Math.floor(Math.sqrt(n));

    // Loop from 3 up to the square root, incrementing by 2 (checking only odd numbers).
    for (var i = 3; i <= square_root; i += 2)
    {
        // If 'n' is divisible by 'i', it's not prime.
        if (0 === n % i)
        {
            return false;
        }
    }

    // If no divisors were found, the number is prime.
    return true;
}


/*
 * Function 'isNumber': Checks if a given string value represents a valid non-negative integer.
 * @param {string} val - The string value to check.
 * @returns {boolean} True if the string is a non-negative integer, false otherwise.
 */
function isNumber(val)
{
    // Regular expression to match non-negative integers (0 or positive integers).
    const pat = /^([1-9]\d*|0)$/;

    // Test the input value against the regular expression.
    return pat.test(val);
}


/*
 * Function 'arr1dto2d' (second definition): This is a redefinition of the earlier 'arr1dto2d' function.
 * It has the exact same implementation as the first definition.
 * @param {Array<string>} arr - The 1D array of strings.
 * @returns {Array<Array<string>>} The 2D array of characters.
 */
function arr1dto2d(arr)
{
    // Loop through each element of the input array.
    for (var i = 0; i < arr.length; i++)
    {
        // Split each string element into an array of characters.
        arr[i] = arr[i].split("");
    }

    // Return the modified array.
    return arr;
}


/*
 * Function 'factorialize': Calculates the factorial of a given non-negative integer.
 * This is a recursive implementation.
 * @param {number} num - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of 'num'.
 */
function factorialize(num)
{
    // Base case: factorial of 0 is 1.
    if (num === 0)
    {
        return 1;
    }

    // Recursive step: n! = n * (n-1)!
    return num * factorialize(num - 1);
}


/*
 * Function 'arr1dto2d' (third definition): This is another redefinition of 'arr1dto2d'.
 * This version converts a 1D array of strings, where each string contains space-separated numbers,
 * into a 2D array of numbers.
 * @param {Array<string>} arr - The 1D array of strings, e.g., ["1 2 3", "4 5 6"].
 * @returns {Array<Array<number>>} The 2D array of numbers, e.g., [[1, 2, 3], [4, 5, 6]].
 */
function arr1dto2d(arr)
{
    // Loop through each string in the input array.
    for (var i = 0; i < arr.length; i++)
    {
        // Split the string by spaces and map each part to a Number.
        arr[i] = arr[i].split(" ").map(Number);
    }

    // Return the transformed 2D array.
    return arr;
}


/*
 * Function 'rotate': Rotates a 2D array (matrix) 90 degrees clockwise.
 * It assumes a rectangular array.
 * @param {Array<Array<any>>} array - The 2D array to rotate.
 * @returns {Array<Array<any>>} A new 2D array representing the rotated matrix.
 */
function rotate(array)
{
    // Get the number of rows and columns from the original array.
    const ROW = array.length;
    const COL = array[0].length;

    // Helper variable for row index calculation during rotation.
    const row = ROW - 1;

    // Create a new array 'a' to store the rotated matrix.
    // The dimensions will be swapped: COL x ROW.
    var a = new Array(COL);

    // Loop through new columns.
    for (var c = 0; c < COL; c++)
    {
        // Initialize each new column as an array.
        a[c] = new Array(ROW);

        // Loop through new rows.
        for (var r = 0; r < ROW; r++)
        {
            // Perform the 90-degree clockwise rotation mapping.
            // Original: array[r][c] -> Rotated: a[c][ROW - 1 - r]
            a[c][r] = array[row - r][c];
        }
    }

    // Return the newly created rotated array.
    return a;
}


/*
 * Function 'part_in': Inserts a 'push' array into a 'base' array starting at a specific index 'st'.
 * This modifies the 'base' array in place.
 * @param {Array<any>} base - The array to modify.
 * @param {Array<any>} push - The array to insert.
 * @param {number} st - The starting index in 'base' where 'push' elements will be placed.
 * @returns {Array<any>} The modified 'base' array.
 */
function part_in(base, push, st)
{
    // Loop through the 'push' array.
    for (var i = st, p = 0; p < push.length; i++, p++)
    {
        // Assign elements from 'push' into 'base' starting at 'st'.
        base[i] = push[p];
    }

    // Return the modified base array.
    return base;
}


/*
 * Function 'part_reverse': Reverses a specific segment of an array.
 * It uses 'part_in' internally.
 * @param {Array<any>} arr - The array to modify.
 * @param {number} s - The starting index (1-based) of the segment to reverse.
 * @param {number} g - The ending index (1-based) of the segment to reverse.
 * @returns {Array<any>} The array with the specified segment reversed.
 */
function part_reverse(arr, s, g)
{
    // Extract the segment to be reversed. Note: slice is 0-based, so s-1.
    var push = arr.slice(s - 1, g);

    // Reverse the extracted segment.
    push.reverse();

    // Insert the reversed segment back into the original array.
    arr = part_in(arr, push, s - 1);

    // Return the modified array.
    return arr;
}


/*
 * Function 'zeroPadding': Pads a number with leading zeros to a specified length.
 * Note: This implementation uses a long string of zeros and slices it.
 * @param {number|string} num - The number or string to pad.
 * @param {number} length - The desired total length of the padded string.
 * @returns {string} The zero-padded string.
 */
function zeroPadding(num, length)
{
    // Concatenate the number with a very long string of zeros, then slice to the desired length.
    // This assumes 'num' will be converted to string naturally.
    return (num + '000000000000000000000000000000000').slice(0, length);
}


/*
 * Function 'arrsum' (second definition): This is a redefinition of the 'arrsum' function.
 * It has the exact same implementation as the first definition.
 * @param {Array<any>} arr - The array whose elements are to be summed.
 * @returns {number} The total sum of the array elements.
 */
function arrsum(arr)
{
    // Initialize sum to 0.
    var sum = 0;

    // Loop through the array using a traditional for loop.
    for (var i = 0, len = arr.length; i < len; ++i)
    {
        // Add the numeric value of the current element to sum.
        // The '-0' converts the element to a number.
        sum += arr[i] - 0;
    };

    // Return the computed sum.
    return sum;
}


/*
 * Function 'pf': Performs prime factorization of a given number and returns the prime factors
 * and their exponents as an object.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their exponents.
 */
function pf(n)
{
    // Initialize an empty object to store the prime factors.
    var result = {};

    // Special case: if n is 1, its prime factorization is { "1": 1 } by convention here.
    if (n === 1)
    {
        return {
            "1": 1
        };
    }

    // Start checking for prime factors from 2.
    var init = 2;

    // Continue as long as 'n' is not 1 (meaning it has not been fully factorized).
    while (n !== 1)
    {
        // 'i' is the current potential prime factor.
        var i = init;

        // Loop to find the smallest prime factor of the current 'n'.
        while (i < Number.MAX_SAFE_INTEGER) // Loop condition is very broad, practically it will break earlier.
        {
            // If 'n' is divisible by 'i'.
            if (n % i === 0)
            {
                // Divide 'n' by 'i'.
                n /= i;

                // If 'i' is not yet in the result object, initialize its count to 0.
                if (!(result[i] > 0))
                {
                    result[i] = 0;
                }

                // Increment the count of factor 'i'.
                result[i]++;

                // Break from this inner loop to find the next factor for the updated 'n'.
                break;
            }

            // Increment 'i' to check the next potential factor.
            i++;
        }

        // Update 'init' to 'i' to continue checking from the last found factor.
        init = i;
    }

    // Return the object containing prime factors and their counts.
    return result;
}


/*
 * Function 'gcd': Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 * This is a recursive implementation.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greatest common divisor of 'a' and 'b'.
 */
function gcd(a, b)
{
    // Base case: if b is 0, then a is the GCD.
    if (b === 0)
    {
        return a;
    }

    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return gcd(b, a % b);
}


/*
 * Function 'lcm': Calculates the least common multiple (LCM) of two numbers.
 * It uses the relationship: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The least common multiple of 'a' and 'b'.
 */
function lcm(a, b)
{
    // Inner function 'g' for GCD, using a compact arrow function syntax.
    // This is essentially the same Euclidean algorithm as the 'gcd' function above.
    var g = (n, m) => m ? g(m, n % m) : n;

    // Calculate LCM using the formula.
    return a * b / g(a, b);
}


/*
 * Function 'num': A simple utility function that returns the difference between two numbers.
 * It is often used as a comparison function for sorting in ascending order.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The result of 'a - b'.
 */
function num(a, b)
{
    // Returns the difference.
    return a - b;
}


/*
 * Function 'nibu': Performs a binary search (二分探索) on a sorted array 'a' to find
 * the index of the largest element less than or equal to 'searchValue'.
 * @param {Array<number>} a - The sorted array to search within.
 * @param {number} searchValue - The value to search for.
 * @returns {number} The index of the largest element less than or equal to 'searchValue',
 *                   or the insertion point if 'searchValue' is not found.
 */
function nibu(a, searchValue)
{
    // Initialize 'index' to -1, indicating not found initially.
    var index = -1;

    // 'left' pointer for the start of the search range.
    var left = 0;

    // 'right' pointer for the end of the search range.
    var right = a.length - 1;

    // Loop continues as long as the search range is valid.
    while (left <= right)
    {
        // Calculate the middle index.
        middle = Math.floor((left + right) / 2);

        // Compare the middle element with the search value.
        if (a[middle] == searchValue)
        {
            // If found, store the index and break.
            index = middle;
            break;
        }
        else if (a[middle] < searchValue)
        {
            // If middle is less than search value, search in the right half.
            left = middle + 1;
        }
        else
        {
            // If middle is greater than search value, search in the left half.
            right = middle - 1;
        }
    }

    // If 'searchValue' was found, return its index.
    if (index != -1) return index;
    // Otherwise, return 'left', which represents the insertion point
    // or the index of the first element greater than 'searchValue'.
    else return left;
}


/*
 * Function 'br': Splits an input string by newline characters.
 * This is a simple wrapper for String.prototype.split('\n').
 * @param {string} input - The string to split.
 * @returns {Array<string>} An array of strings, split by newlines.
 */
function br(input)
{
    // Split the input string by newline characters.
    return input.split("\n");
}


/*
 * Function 'is_sortred': Checks if an array is sorted in non-decreasing order.
 * @param {Array<number>} arr - The array to check.
 * @returns {boolean} True if the array is sorted, false otherwise.
 */
function is_sortred(arr)
{
    // Initialize a flag to true, assuming the array is sorted.
    var flag = true;

    // Loop through the array, comparing adjacent elements.
    for (var i = 1; i < arr.length; i++)
    {
        // If an element is greater than the next one, it's not sorted.
        if (arr[i - 1] > arr[i])
        {
            // Set flag to false and break the loop.
            flag = false;
            break;
        }
    }

    // Return the flag indicating whether the array is sorted.
    return flag;
}


/*
 * Function 'primeFactorization': Performs prime factorization of a number,
 * returning an object of prime factors and their exponents.
 * This is an alternative implementation to 'pf'.
 * @param {number} n - The number to factorize.
 * @returns {Object<string, number>} An object with prime factors as keys and exponents as values.
 */
function primeFactorization(n)
{
    // Calculate and store the integer part of the square root of 'n'.
    var s = Math.floor(Math.sqrt(n));

    // Initialize exponent counter 'r'.
    var r = 0;

    // Initialize an empty object to store the results.
    var result = {};

    // Loop to find prime factors from 2 up to the square root 's'.
    for (var i = 2; i <= s; i++)
    {
        // Check if 'i' is a factor of 'n'.
        if ((n % i) == 0)
        {
            r = 0; // Reset the exponent counter for the current prime factor.

            // Keep dividing 'n' by 'i' as long as it's divisible.
            do
            {
                r++; // Increment the exponent.
                n = n / i; // Divide 'n'.
            } while ((n % i) == 0);

            // Store the prime factor 'i' and its exponent 'r' in the result object.
            result[i] = r;
        }
    }

    // If 'n' is still greater than 's' after the loop, it means the remaining 'n' is a prime factor itself.
    if (n > s)
    {
        result[n] = 1; // Add the remaining prime factor with an exponent of 1.
    }

    // Return the prime factorization result.
    return result;
}