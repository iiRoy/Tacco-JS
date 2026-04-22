/*
 * This file contains a collection of utility functions in JavaScript.
 *
 * Function List:
 * - arr1dto2d(Array): Converts a 1D array to a 2D array.
 * - pf(N): Returns an object with the prime factorization of N.
 * - gcd(a, b): Returns the greatest common divisor of a and b.
 * - lcm(a, b): Returns the least common multiple of a and b.
 * - num(a, b): Returns a - b, typically used for sorting.
 * - isPrime(n): Checks if a number n is prime, returns boolean.
 * - isNumber(n): Checks if a value n is a number, returns boolean.
 * - arrsum(arr): Returns the sum of elements in an array.
 * - nibu(arr, n): Returns the index of the largest number less than or equal to n.
 * - br(input): Splits input string by newline characters.
 * - debug(val): Logs a value to console if debugMode is true.
 * - arrMaxPoint(arr): Returns the index of the maximum element in an array.
 * - arrMinPoint(arr): Returns the index of the minimum element in an array.
 * - factorialize(num): Calculates the factorial of a number.
 * - rotate(array): Rotates a 2D array 90 degrees clockwise.
 * - part_in(base, push, st): Inserts elements from 'push' into 'base' starting at index 'st'.
 * - part_reverse(arr, s, g): Reverses a portion of an array from index s to g.
 * - zeroPadding(num, length): Pads a number with leading zeros to a specified length.
 * - is_sortred(arr): Checks if an array is sorted in ascending order.
 * - primeFactorization(n): Returns an object with prime factorization (alternative implementation).
 */

const debugMode = false;
const inf = Number.MAX_SAFE_INTEGER; /* Represents the largest safe integer in JavaScript */
const mod = 1000000007;

function Main(input) {
  // Main function entry point.
  // Calculates 360 divided by the input and logs the floor value.
  console.log(Math.floor(360 / input));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim()); // Reads input from stdin and calls Main.

function pow(a, b) {
  var ans = 0; // Initialize answer variable.

  // Loop 'b' times.
  for (var i = 0n; i < b; i += 1n) {
    if (ans == 0) {
      ans = a; // If ans is 0, set it to 'a' (first iteration).
    } else {
      ans *= a; // Otherwise, multiply ans by 'a'.
    }
  }

  // NOTE: This function appears to have a logical error. It always returns 'a'.
  // It should probably return 'ans' for a correct power calculation.
  return a;
}

function zisyozyunn(a) {
  var arr = []; // Initialize an empty array.

  // Populate 'arr' with numbers from 1 to input[0].
  for (var i = 0; i < input[0]; i++) {
    arr.push(i + 1);
  }

  var sum = 0; // Initialize sum.

  // Iterate through the input array 'a'.
  for (var i = 0; i < a.length; i++) {
    // Find the index of the current element a[i] in 'arr'.
    var f = arr.findIndex(val => val == a[i]);
    // Add to sum based on factorial and found index.
    sum += factorialize(a.length - 1 - i) * f;
    // Remove the found element from 'arr'.
    arr.splice(f, 1);
  }

  return sum; // Return the calculated sum.
}

function arrsum(arr) {
  var sum = 0; // Initialize sum for array elements.

  // Loop through the array and sum its numeric values.
  for (var i = 0, len = arr.length; i < len; ++i) {
    sum += arr[i] - 0; // Ensure addition as numbers.
  }
  ; // Empty statement for semicolon.

  return sum; // Return the total sum.
}

function debug(val) {
  // Checks if debugMode is enabled.
  if (debugMode == true) {
    console.log(val); // Logs the value if in debug mode.
  }
}

function arrMaxPoint(arr) {
  var max = Number.MIN_SAFE_INTEGER; // Initialize max with the smallest safe integer.
  var point = -1; // Initialize point (index) to -1.

  // Iterate through the array to find the maximum element and its index.
  for (var i = 0; i < arr.length; i++) {
    if (max < arr[i]) {
      max = arr[i]; // Update max if a larger element is found.
      point = i; // Store the index of the new maximum.
    }
  }

  return point; // Return the index of the maximum element.
}

function arrMinPoint(arr) {
  var min = Number.MAX_SAFE_INTEGER; // Initialize min with the largest safe integer.
  var point = -1; // Initialize point (index) to -1.

  // Iterate through the array to find the minimum element and its index.
  for (var i = 0; i < arr.length; i++) {
    if (min > arr[i]) {
      min = arr[i]; // Update min if a smaller element is found.
      point = i; // Store the index of the new minimum.
    }
  }

  return point; // Return the index of the minimum element.
}

function isPrime(n) {
  // Check if 'n' is an integer.
  if (false === Number.isInteger(n)) {
    return false;
  }
  // Numbers less than or equal to 1 are not prime.
  if (n <= 1) {
    return false;
  }
  // 2 is the only even prime number.
  if (2 === n) {
    return true;
  }
  // Even numbers greater than 2 are not prime.
  if (0 === n % 2) {
    return false;
  }

  var square_root = Math.floor(Math.sqrt(n)); // Calculate the square root of 'n'.

  // Check for divisibility by odd numbers up to the square root.
  for (var i = 3; i <= square_root; i += 2) {
    if (0 === n % i) {
      return false; // If divisible, it's not prime.
    }
  }

  return true; // If no divisors found, it's prime.
}

function isNumber(val) {
  const pat = /^([1-9]\d*|0)$/; // Regular expression to match non-negative integers.
  return pat.test(val); // Test if the value matches the pattern.
}

function factorialize(num) {
  // Base case for factorial: 0! is 1.
  if (num === 0) {
    return 1;
  }
  // Recursive step: num * (num-1)!
  return num * factorialize(num - 1);
}

function arr1dto2d(arr) {
  // Iterate through the array and convert each string element to an array of numbers.
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].split(" ").map(Number); // Split by space and map to Number.
  }
  return arr; // Return the modified 2D array.
}

function rotate(array) {
  const ROW = array.length; // Number of rows in the input array.
  const COL = array[0].length; // Number of columns in the input array.
  const row = ROW - 1; // Index of the last row.

  var a = new Array(COL); // Create a new array with 'COL' rows for the rotated matrix.

  // Initialize columns of the new array.
  for (var c = 0; c < COL; c++) {
    a[c] = new Array(ROW); // Each new row will have 'ROW' columns.
    // Populate the new array with rotated values.
    for (var r = 0; r < ROW; r++) {
      a[c][r] = array[row - r][c]; // Perform 90-degree clockwise rotation.
    }
  }
  return a; // Return the rotated array.
}

function part_in(base, push, st) {
  // Insert elements from 'push' into 'base' starting at index 'st'.
  for (var i = st, p = 0; p < push.length; i++, p++) {
    base[i] = push[p];
  }
  return base; // Return the modified base array.
}

function part_reverse(arr, s, g) {
  // Extract the sub-array to be reversed.
  var push = arr.slice(s - 1, g);
  push.reverse(); // Reverse the extracted sub-array.
  // Insert the reversed sub-array back into the original array.
  arr = part_in(arr, push, s - 1);
  return arr; // Return the array with the reversed part.
}

function zeroPadding(num, length) {
  // Pads a number with leading zeros to reach the specified length.
  // Uses a large string of zeros for padding and slices it.
  return (num + '000000000000000000000000000000000').slice(0, length);
}

function arrsum(arr) {
  var sum = 0; // Initialize sum.
  // Loop through the array to calculate the total sum.
  for (var i = 0, len = arr.length; i < len; ++i) {
    sum += arr[i] - 0; // Ensure numeric addition.
  }
  ; // Empty statement.
  return sum; // Return the sum.
}

function pf(n) {
  var result = {}; // Object to store prime factors and their counts.

  // Special case for n = 1.
  if (n === 1) {
    return {
      "1": 1
    };
  }

  var init = 2; // Starting prime factor to check.

  // Continue until n becomes 1.
  while (n !== 1) {
    var i = init; // Current divisor to check.
    // Loop to find the smallest prime factor.
    while (i < Number.MAX_SAFE_INTEGER) {
      if (n % i === 0) {
        n /= i; // Divide n by its factor.
        if (!(result[i] > 0)) {
          result[i] = 0; // Initialize count if factor is new.
        }
        result[i]++; // Increment count for the factor.
        break; // Found a factor, break inner loop.
      }
      i++; // Increment to check next potential factor.
    }
    init = i; // Update init to continue checking from the current factor.
  }
  return result; // Return the prime factorization result.
}

function gcd(a, b) {
  // Base case: if b is 0, a is the GCD.
  if (b === 0) {
    return a;
  }
  // Recursive call using Euclidean algorithm.
  return gcd(b, a % b);
}

function lcm(a, b) {
  // Helper function to calculate GCD using a concise arrow function.
  var g = (n, m) => m ? g(m, n % m) : n;
  // LCM formula: (a * b) / GCD(a, b).
  return a * b / g(a, b);
}

function num(a, b) {
  // Simple subtraction, often used as a comparator in sort functions.
  return a - b;
}

function nibu(a, searchValue) {
  var index = -1; // Initialize the result index.

  // Variable for the left boundary of the search range.
  var left = 0;

  // Variable for the right boundary of the search range.
  var right = a.length - 1;

  // Continue searching as long as the left boundary is less than or equal to the right boundary.
  while (left <= right) {

    // Calculate the middle index.
    middle = Math.floor((left + right) / 2);

    // Compare the value at the middle index with the search value.
    if (a[middle] == searchValue) {
      // If a match is found, store the index and break the loop.
      index = middle;
      break;
    } else if (a[middle] < searchValue) {
      // If the middle value is less than the search value,
      // move the left boundary to the right of the middle.
      left = middle + 1;
    } else {
      // If the middle value is greater than the search value,
      // move the right boundary to the left of the middle.
      right = middle - 1;
    }
  }

  // If the value was found, return its index.
  if (index != -1) return index;
  // If not found, return 'left', which will be the insertion point or the index of the next larger element.
  else return left;
}

function br(input) {
  // Splits the input string into an array of strings using the newline character as a delimiter.
  return input.split("\n");
}

function is_sortred(arr) {
  var flag = true; // Assume array is sorted initially.

  // Iterate through the array starting from the second element.
  for (var i = 1; i < arr.length; i++) {
    // If a preceding element is greater than the current element, it's not sorted.
    if (arr[i - 1] > arr[i]) {
      flag = false; // Set flag to false.
      break; // No need to check further.
    }
  }
  return flag; // Return the sorting status.
}

function primeFactorization(n) {

  // Calculate the integer part of the square root of n.
  var s = Math.floor(Math.sqrt(n));

  var r = 0; // Exponent counter for prime factors.

  var result = {}; // Object to store prime factors and their exponents.

  // Iterate from 2 up to the square root of n.
  for (var i = 2; i <= s; i++) {

    // Check if i is a factor of n.
    if ((n % i) == 0) {

      r = 0; // Reset exponent counter.

      // Count how many times i divides n.
      do {

        r++; // Increment exponent.

        n = n / i; // Divide n by i.

      } while ((n % i) == 0);

      // Store the prime factor i and its exponent r.
      result[i] = r;

    }

  }

  // If n is still greater than s (meaning it's a prime number itself or the last prime factor).
  if (n > s) {
    result[n] = 1; // Add the remaining n as a prime factor with exponent 1.
  }

  return result; // Return the prime factorization.

}