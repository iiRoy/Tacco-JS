/*
 * This file contains a collection of utility functions for various programming tasks.
 *
 * FUNCTION INDEX:
 *
 * arr1dto2d(Array)           : Converts a 1D array of strings into a 2D array (multiple versions).
 * pf(N)                      : Returns an object representing the prime factorization of N.
 * gcd(a, b)                  : Calculates the greatest common divisor of two numbers.
 * lcm(a, b)                  : Calculates the least common multiple of two numbers.
 * num(a, b)                  : Returns a - b; primarily used for sorting.
 * isPrime(n)                 : Checks if a number is prime.
 * isNumber(n)                : Checks if a value is a number (string representation).
 * arrsum(arr)                : Calculates the sum of elements in an array.
 * nibu(arr, n)               : Performs a binary search to find the index of the largest number less than or equal to n.
 * br(input)                  : Splits input string by newline characters.
 * debug(val)                 : Prints a value to console if debugMode is enabled.
 * arrMaxPoint(arr)           : Finds the index of the maximum value in an array.
 * arrMinPoint(arr)           : Finds the index of the minimum value in an array.
 * factorialize(num)          : Calculates the factorial of a number.
 * rotate(array)              : Rotates a 2D array 90 degrees clockwise.
 * part_in(base, push, st)    : Inserts a 'push' array into a 'base' array starting at index 'st'.
 * part_reverse(arr, s, g)    : Reverses a portion of an array from index 's' to 'g'.
 * zeroPadding(num, length)   : Pads a number with leading zeros to a specified length.
 * is_sortred(arr)            : Checks if an array is sorted in ascending order.
 * primeFactorization(n)      : Another prime factorization function.
 * zisyozyunn(a)              : Calculates a lexicographical permutation index (context-dependent).
 */

const debugMode = false; // Flag to enable/disable debug console logs.
const inf = Number.MAX_SAFE_INTEGER; // Represents a very large number, effectively infinity for many cases.

function Main(input)
{
    var min = inf; // Initialize minimum sum of factors to infinity.

    // Loop through possible factors up to the square root of the input number.
    for (var i = 1; i <= Math.sqrt(input); i++)
    {
        var n = inf; // Initialize current sum of factors to infinity.

        // Check if 'i' is a factor of 'input'.
        if (input % i == 0)
        {
            // If 'i' is a factor, then 'input/i' is also a factor.
            // Calculate the sum of these two factors.
            n = i + input / i;
        }

        // Update the overall minimum sum if the current sum 'n' is smaller.
        if (min > n)
        {
            min = n; // New minimum found.
            // console.log(i, input/i); // Debug comment: shows the factors that yield the minimum sum.
        }
    }

    // The problem likely asks for the minimum sum of factors minus 2.
    console.log(min - 2);
}

// Call the Main function with input read from stdin.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

// Placeholder function - likely intended for future use or part of a larger system.
function next(m, now)
{
    // Function body is intentionally left blank.
}

// This function seems to calculate a lexicographical index or sum based on permutations.
// It assumes `input[0]` is available from a global or outer scope, which is a potential issue.
function zisyozyunn(a)
{
    var arr = [];
    // Populate `arr` with numbers from 1 to `input[0]`.
    for (var i = 0; i < input[0]; i++)
    {
        arr.push(i + 1);
    }

    var sum = 0;
    for (var i = 0; i < a.length; i++)
    {
        // Find the index of the current element `a[i]` in `arr`.
        var f = arr.findIndex(val => val == a[i]);

        // Add to sum based on factorial and found index.
        sum += factorialize(a.length - 1 - i) * f;

        // Remove the found element from `arr` to simulate permutation choice.
        arr.splice(f, 1);
    }
    return sum;
}

// Calculates the sum of all numeric elements in an array.
function arrsum(arr)
{
    var sum = 0;
    for (var i = 0, len = arr.length; i < len; ++i)
    {
        sum += arr[i] - 0; // Ensures element is treated as a number.
    }
    ; // Semicolon at end of loop is optional but harmless.
    return sum;
}

// Debug function: logs a value to the console only if `debugMode` is true.
function debug(val)
{
    if (debugMode == true)
    {
        console.log(val);
    }
}

// Finds the index of the maximum value in an array.
function arrMaxPoint(arr)
{
    var max = Number.MIN_SAFE_INTEGER; // Initialize max with the smallest possible number.
    var point = -1; // Initialize index to -1 (indicating not found or empty array).

    for (var i = 0; i < arr.length; i++)
    {
        if (max < arr[i])
        {
            max = arr[i]; // Update max value.
            point = i; // Update index of max value.
        }
    }
    return point;
}

// Finds the index of the minimum value in an array.
function arrMinPoint(arr)
{
    var min = Number.MAX_SAFE_INTEGER; // Initialize min with the largest possible number.
    var point = -1; // Initialize index to -1.

    for (var i = 0; i < arr.length; i++)
    {
        if (min > arr[i])
        {
            min = arr[i]; // Update min value.
            point = i; // Update index of min value.
        }
    }
    return point;
}

// Converts a 1D array of strings into a 2D array by splitting each string by character.
// Note: This function is duplicated later with different splitting logic.
function arr1dto2d(arr)
{
    for (var i = 0; i < arr.length; i++)
    {
        arr[i] = arr[i].split(""); // Splits each string into an array of characters.
    }
    return arr;
}

// Checks if a number is prime using an optimized trial division method.
function isPrime(n)
{
    // First, check if the input is an integer.
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

    // Check for divisibility by odd numbers up to the square root of n.
    var square_root = Math.floor(Math.sqrt(n));
    for (var i = 3; i <= square_root; i += 2)
    {
        if (0 === n % i)
        {
            return false; // Found a divisor, so not prime.
        }
    }
    return true; // No divisors found, so it's prime.
}

// Checks if a given value (typically a string) represents a non-negative integer.
function isNumber(val)
{
    const pat = /^([1-9]\d*|0)$/; // Regular expression for non-negative integers.
    return pat.test(val); // Test the value against the pattern.
}

// This is a duplicate of the `arr1dto2d` function defined earlier.
// It performs the exact same operation: splitting strings by character.
function arr1dto2d(arr)
{
    for (var i = 0; i < arr.length; i++)
    {
        arr[i] = arr[i].split("");
    }
    return arr;
}

// Calculates the factorial of a non-negative integer.
function factorialize(num)
{
    if (num === 0)
    {
        return 1; // Base case: 0! is 1.
    }
    return num * factorialize(num - 1); // Recursive step.
}

// This is a third `arr1dto2d` function, but this one has different logic.
// It splits strings by spaces and converts resulting parts to numbers.
function arr1dto2d(arr)
{
    for (var i = 0; i < arr.length; i++)
    {
        arr[i] = arr[i].split(" ").map(Number); // Splits by space and maps to numbers.
    }
    return arr;
}

// Rotates a 2D array (matrix) 90 degrees clockwise.
function rotate(array)
{
    const ROW = array.length; // Number of rows in the original array.
    const COL = array[0].length; // Number of columns in the original array.
    const row = ROW - 1; // Last row index for calculations.

    var a = new Array(COL); // New array will have COL rows.
    for (var c = 0; c < COL; c++)
    {
        a[c] = new Array(ROW); // Each new row will have ROW columns.
        for (var r = 0; r < ROW; r++)
        {
            // The element at (r, c) in the original array moves to (c, ROW - 1 - r) in the rotated array.
            a[c][r] = array[row - r][c];
        }
    }
    return a;
}

// Inserts elements from `push` array into `base` array starting at index `st`.
function part_in(base, push, st)
{
    for (var i = st, p = 0; p < push.length; i++, p++)
    {
        base[i] = push[p];
    }
    return base;
}

// Reverses a specified part of an array (from `s` to `g`, 1-indexed).
function part_reverse(arr, s, g)
{
    // Extract the portion to be reversed.
    var push = arr.slice(s - 1, g);
    push.reverse(); // Reverse the extracted portion.
    // Insert the reversed portion back into the original array.
    arr = part_in(arr, push, s - 1);
    return arr;
}

// Pads a number with leading zeros to reach a specified length.
function zeroPadding(num, length)
{
    // Concatenates the number with a long string of zeros and then slices to desired length.
    return (num + '000000000000000000000000000000000').slice(0, length);
}

// Another instance of `arrsum`, identical to the first one.
function arrsum(arr)
{
    var sum = 0;
    for (var i = 0, len = arr.length; i < len; ++i)
    {
        sum += arr[i] - 0;
    }
    ;
    return sum;
}

// Performs prime factorization of a number `n` and returns factors with their counts.
function pf(n)
{
    var result = {}; // Object to store prime factors and their powers.

    if (n === 1)
    {
        return {"1": 1}; // Special case: prime factors of 1.
    }

    var init = 2; // Start checking for prime factors from 2.

    while (n !== 1)
    {
        var i = init; // Current divisor to check.
        // Loop to find the smallest prime factor of the current `n`.
        while (i < Number.MAX_SAFE_INTEGER)
        {
            if (n % i === 0)
            {
                n /= i; // Divide n by the factor.
                if (!(result[i] > 0))
                {
                    result[i] = 0; // Initialize count if factor is new.
                }
                result[i]++; // Increment count for this factor.
                break; // Move to find factors of the new 'n'.
            }
            i++; // Increment divisor.
        }
        init = i; // Next search starts from the current factor.
    }
    return result;
}

// Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
function gcd(a, b)
{
    if (b === 0)
    {
        return a; // Base case: GCD(a, 0) is a.
    }
    return gcd(b, a % b); // Recursive step.
}

// Calculates the least common multiple (LCM) of two numbers.
function lcm(a, b)
{
    // Inner function for GCD (redefined here, could use the global gcd).
    var g = (n, m) => m ? g(m, n % m) : n;
    return a * b / g(a, b); // LCM(a, b) = (a * b) / GCD(a, b).
}

// Simple subtraction function, often used as a comparator for sorting in ascending order.
function num(a, b)
{
    return a - b;
}

// Performs a binary search on a sorted array `a` to find the index of the largest element
// that is less than or equal to `searchValue`.
function nibu(a, searchValue)
{
    var index = -1; // Stores the found index, -1 if not directly found.

    // Left boundary of the search range.
    var left = 0;

    // Right boundary of the search range.
    var right = a.length - 1;

    // Continue searching while the left boundary is less than or equal to the right boundary.
    while (left <= right)
    {
        // Calculate the middle index.
        middle = Math.floor((left + right) / 2);

        // Compare the value at the middle index with the search value.
        if (a[middle] == searchValue)
        {
            index = middle; // Exact match found.
            break; // Exit loop.
        } else if (a[middle] < searchValue)
        {
            // If middle value is less than search value, search in the right half.
            left = middle + 1;
        } else
        {
            // If middle value is greater than search value, search in the left half.
            right = middle - 1;
        }
    }
    // If an exact match was found, return its index.
    if (index != -1) return index;
    // Otherwise, `left` will be the index where `searchValue` would be inserted
    // to maintain sorted order, or the length of the array if `searchValue` is
    // greater than all elements. This effectively gives the index of the first
    // element greater than `searchValue`, so `left - 1` would be the largest
    // element less than or equal to `searchValue`. However, the current return
    // of `left` means it returns the position to insert `searchValue` or the
    // position of the first element greater than `searchValue`. This might need
    // clarification based on specific problem requirements.
    else return left;
}

// Splits an input string by newline characters into an array of strings.
function br(input)
{
    return input.split("\n");
}

// Checks if an array is sorted in ascending order.
function is_sortred(arr)
{
    var flag = true; // Assume sorted initially.
    for (var i = 1; i < arr.length; i++)
    {
        if (arr[i - 1] > arr[i])
        {
            flag = false; // Found an unsorted pair.
            break; // No need to check further.
        }
    }
    return flag;
}

// Another implementation of prime factorization.
function primeFactorization(n)
{
    // Calculate the integer part of the square root of n.
    var s = Math.floor(Math.sqrt(n));

    var r = 0; // Exponent counter for prime factors.

    var result = {}; // Object to store prime factors and their powers.

    // Iterate from 2 up to the square root of n.
    for (var i = 2; i <= s; i++)
    {
        // Check if `i` is a factor of `n`.
        if ((n % i) == 0)
        {
            r = 0; // Reset exponent counter.

            // While `i` continues to be a factor, divide `n` by `i` and increment exponent.
            do
            {
                r++; // Increment exponent.
                n = n / i; // Divide n.
            } while ((n % i) == 0);

            // Store the prime factor `i` and its exponent `r`.
            result[i] = r;
        }
    }

    // If `n` is still greater than `s` after the loop, it means the remaining `n` is
    // a prime factor itself (and greater than its original square root).
    if (n > s)
    {
        result[n] = 1; // Add the remaining prime factor with an exponent of 1.
    }

    return result;
}