var GET = (function () {

    // This is the primary function returned by the IIFE.
    // It acts as a factory to create new reader instances.
    function f(s) {
        return new g(s);
    }

    /**
     * Constructor for the internal data reader class.
     * It processes the raw input string into a usable format.
     *
     * @param {string} s The raw input string, typically from standard input.
     */
    function g(s) {
        // The input string is trimmed of leading/trailing whitespace
        // and then split into an array of lines.
        this._s = s.trim().split("\n");

        // _y tracks the current line index being read from.
        this._y = 0;
    }

    /**
     * Reads a single element from the current line, treating elements as space-separated.
     * It reads from the "end" of the line (after reversing), effectively reading from left to right.
     *
     * @param {boolean} f If true, returns the element as a string; otherwise, attempts to parse it as a number.
     * @returns {string|number} The next available element.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // If the current line is still a single string, it needs to be split
        // into elements and reversed for efficient popping.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element from the (reversed) current line.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, either as a string or a number (using unary plus for type conversion).
        return f ? r : +r;
    };

    /**
     * Reads an entire line of space-separated elements.
     *
     * @param {boolean} f If true, returns elements as strings; otherwise, attempts to parse them as numbers.
     * @returns {string[]|number[]} An array containing all elements from the current line.
     */
    g.prototype.l = function (f) {
        // Retrieve the current line, split it by spaces, and then increment the line index.
        var s = this._s[this._y++].split(" ");

        // Return the array of elements, either as strings or parsed numbers.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads multiple lines, treating each line as an array of space-separated elements (a matrix).
     *
     * @param {number} n The number of lines (rows) to read.
     * @param {boolean} f If true, returns elements as strings; otherwise, attempts to parse them as numbers.
     * @returns {string[][]|number[][]} A 2D array (matrix) of the read elements.
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input, map each line to an array of space-separated elements,
        // and update the current line index.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the 2D array, with elements as strings or parsed numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads multiple lines, treating each line as a single element.
     *
     * @param {number} n The number of lines to read.
     * @param {boolean} f If true, returns elements as strings; otherwise, attempts to parse them as numbers.
     * @returns {string[]|number[]} An array containing the single elements from each line.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input and update the current line index.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array of elements, either as strings or parsed numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, making it the public interface for GET.
    return f;

})(); // End of the GET IIFE definition.


// Initialize the global data reader 'o' by reading all content from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Dynamically creates a multi-dimensional array with specified dimensions and initial value.
 * This function builds a JavaScript code string and then evaluates it.
 *
 * @param {*} v The value or expression to initialize each element with.
 * @param {...number} dimensions Variable number of arguments representing the size of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // 'a' holds all arguments, including 'v' and dimensions.
        l = a.length,  // 'l' is the total number of arguments.
        // Start building the array creation string from the innermost dimension.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards from the second-to-last dimension down to the first.
    while (--l) {
        // Wrap the current 'r' string with another Array.map call for the next dimension.
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the actual array.
    return eval(r);
}


/**
 * Computes the Greatest Common Divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 *
 * @param {number} a The first integer.
 * @param {number} b The second integer.
 * @returns {number} The GCD of 'a' and 'b'.
 */
function gcd(a, b) {
    // Base case: if 'b' is 0, then 'a' is the GCD.
    // Recursive step: otherwise, the GCD(a, b) is the same as GCD(b, a % b).
    return b ? gcd(b, a % b) : a;
}


// Call the main function to start the program execution.
main();


/**
 * The main entry point of the application.
 * This function orchestrates reading input, performing calculations,
 * and producing the final output.
 */
function main() {
    // Read the integer 'n' from the input.
    var n = o.a();

    // Read an array 'a' containing 'n+1' elements.
    var a = o.r(n + 1);

    // Initialize 'xgcd' with the first element of array 'a'.
    var xgcd = a[0];

    // Calculate the greatest common divisor of all elements in 'a'.
    for (var i = 1; i <= n; i++) {
        xgcd = gcd(xgcd, a[i]);
    }

    // Find the prime factors of the absolute value of the calculated 'xgcd'.
    // These are potential answers.
    var ans = primeFact(Math.abs(xgcd));

    // Divide each element in 'a' by 'xgcd'.
    a = a.map(x => x / xgcd);

    // Find the prime factors of the absolute value of the last element of the modified 'a'.
    var b = primeFact(Math.abs(a[n]));

    // Special handling: if the last element of 'a' is zero,
    // 'b' should contain all primes up to 'n' instead of its prime factors.
    if (a[n] === 0) {
        b = primes(n);
    }

    // Iterate through each candidate prime factor 'k' found in 'b'.
    for (var k of b) {
        // Skip 'k' if it's already in the answer set or if 'k' is greater than 'n'.
        if (ans.has(k) || n < k) {
            continue;
        }

        // 'f' acts as a boolean flag (1 for true, 0 for false) to indicate if 'k' satisfies the condition.
        var f = 1;

        // This loop checks a specific divisibility condition related to 'k'.
        // It runs 'k-1' times, or until 'f' becomes 0.
        for (var i = 0; i < k - 1 && f; i++) {
            var t = 0; // Accumulator for sums.

            // Sum elements of 'a' with a stride of 'k-1', starting from index 'i'.
            for (var j = i; j < n; j += k - 1) {
                t += a[j];
            }

            // If the accumulated sum 't' is not divisible by 'k', then 'k' fails the condition.
            if (t % k !== 0) {
                f = 0; // Set flag to false.
            }
        }

        // If 'k' passed all checks (f is still 1), add it to the answer set.
        if (f) {
            ans.add(k);
        }
    }

    // If the answer set is not empty, convert it to an array, sort numerically,
    // and print each prime factor on a new line.
    if (ans.size) {
        console.log(Array.from(ans).sort((a, b) => a - b).join("\n"));
    }
}


/**
 * Finds all unique prime factors of a given positive integer.
 *
 * @param {number} x The number for which to find prime factors.
 * @returns {Set<number>} A set containing the unique prime factors of 'x'.
 */
function primeFact(x) {
    var r = new Set(); // Initialize an empty set to store unique prime factors.

    // Iterate from 2 up to the square root of 'x'.
    // Any factor larger than sqrt(x) would have a corresponding factor smaller than sqrt(x).
    for (var i = 2; i * i <= x; i++) {
        // If 'i' divides 'x', then 'i' is a prime factor.
        if (x % i === 0) {
            r.add(i); // Add 'i' to the set of prime factors.
            // Continuously divide 'x' by 'i' until it's no longer divisible.
            // This ensures we get only unique prime factors and correctly reduce 'x'.
            while (x % i === 0) {
                x /= i;
            }
        }
    }

    // After the loop, if 'x' is still greater than 1, it means the remaining 'x'
    // is itself a prime factor (it must be greater than sqrt(original_x)).
    if (1 < x) {
        r.add(x);
    }

    return r;
}


/**
 * Generates a set of all prime numbers up to a given limit 'n'
 * using the Sieve of Eratosthenes algorithm.
 *
 * @param {number} n The upper limit (inclusive) for finding prime numbers.
 * @returns {Set<number>} A set containing all prime numbers less than or equal to 'n'.
 */
function primes(n) {
    // Create a boolean array (represented by 0s and 1s) of size 'n+1'.
    // Initialize all elements to 1 (true), indicating they are potentially prime.
    // a[i] = 1 means 'i' is prime, a[i] = 0 means 'i' is composite.
    var a = Array(n + 1).fill(1);
    var r = new Set(); // Initialize an empty set to store the found prime numbers.

    // Iterate from 2 up to 'n'.
    for (var i = 2; i <= n; i++) {
        // If a[i] is 0, 'i' has already been marked as composite, so skip it.
        if (a[i] === 0) {
            continue;
        }

        // If we reach this point, 'i' is a prime number.
        r.add(i);

        // Mark all multiples of 'i' as composite (not prime).
        // Start from i*i because smaller multiples (e.g., 2*i, 3*i) would have already
        // been marked by smaller prime factors (2, 3, etc.).
        for (var j = i + i; j <= n; j += i) {
            a[j] = 0;
        }
    }

    return r;
}