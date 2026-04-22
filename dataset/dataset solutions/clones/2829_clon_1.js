/*
 * This file contains a utility for reading input and the main program logic.
 * It's structured to be a Type I clone, meaning only whitespace and comments
 * are altered, preserving all identifiers and logic.
 */

// Define a module-like structure for input handling utilities.
var GET = (function () {
    // Inner function 'f' serves as the public interface for GET.
    function f(s) {
        return new g(s);
    }

    // Constructor 'g' initializes the input string.
    function g(s) {
        // Store the input string, trimmed and split by newlines.
        this._s = s.trim().split("\n");
        // Initialize line pointer.
        this._y = 0;
    }

    // Method 'a' for reading a single item (number or string).
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the input lines array.
            y = this._y, // Current line index.
            r; // Variable to hold the result.

        // If the current line hasn't been processed into individual items yet,
        // split it by spaces and reverse it for efficient 'pop' operations.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Get the last item from the current line.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the item as a string if 'f' is true, otherwise as a number.
        return f ? r : +r;
    };

    // Method 'l' for reading an entire line of items.
    g.prototype.l = function (f) {
        // Get the current line, split by spaces, and advance the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return items as strings if 'f' is true, otherwise map to numbers.
        return f ? s : s.map(a => +a);
    };

    // Method 'm' for reading a matrix (multiple lines, multiple items per line).
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input, split each line by spaces,
        // and advance the line pointer by 'n'.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return as string matrix if 'f' is true, otherwise map all items to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    // Method 'r' for reading raw lines (single item per line, or entire lines).
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input and advance the line pointer by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return as string array if 'f' is true, otherwise map all items to numbers.
        return f ? r : r.map(a => +a);
    };

    // Return the public interface function 'f'.
    return f;
})(); // Immediately Invoked Function Expression ends here.


// Initialize the input reader 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * Dynamically creates a multi-dimensional array filled with a specified value.
 *
 * @param {any} v The value to fill the array with.
 * @param {number} ...dimensions The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Access all arguments, including 'v' and dimensions.
        l = a.length,  // Total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation.

    // Loop to build up the nested array creation string for each dimension.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}


// Define a global modulus constant, commonly used in competitive programming.
var mod = 1e9 + 7;


// Execute the main function and print its result to the console.
console.log(main());


/**
 * The main logic of the program.
 * This function solves a problem likely related to sequence comparison or dynamic programming.
 *
 * @returns {number} The final computed answer.
 */
function main() {
    // Read two integers 'n' and 'm' using the input reader.
    var n = o.a();
    var m = o.a();

    // Read two arrays 's' and 't' (likely sequences or strings).
    var s = o.l();
    var t = o.l();

    // Initialize a 2D dynamic programming array 'dp' with dimensions (n+1) x (m+1), filled with 0s.
    var dp = xArray(0, n + 1, m + 1);

    // Initialize the answer variable.
    var ans = 1;

    // Iterate through the sequences 's' and 't'.
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < m; j++) {
            // If characters at current positions match.
            if (s[i] === t[j]) {
                // Update 'ans' based on previous dp values, ensuring it stays within the modulus.
                ans += dp[i][j] + 1;
                ans %= mod;

                // Update dp table for a match.
                // This seems to combine elements from left, top, and the current match.
                dp[i + 1][j + 1] = dp[i + 1][j] + dp[i][j + 1] + 1;
            } else {
                // If characters do not match, update dp table.
                // This is a standard way to calculate unique subsequences or similar problems.
                dp[i + 1][j + 1] = dp[i + 1][j] + dp[i][j + 1] - dp[i][j];
            }

            // Ensure the dp value also stays within the modulus.
            // Original code's behavior for negative results from subtraction is preserved.
            dp[i + 1][j + 1] %= mod;
        }
    }

    // Return the final calculated answer.
    return ans;
}