/*
 * This is a Type I clone of the original JavaScript code.
 * It is designed to be functionally identical, with only
 * whitespace and comments altered.
 */

var GET = (function() {
    // This is a factory function for the 'g' constructor.
    function f (s) {
        return new g(s);
    }

    // The main data parsing constructor.
    function g (s) {
        // Store the input string, trimming and splitting by newlines.
        this._s = s .trim() .split("\n");
        // Initialize the current line index.
        this._y = 0;
    }

    // Prototype method 'a' for getting an item from the current line,
    // treating it as a space-separated sequence that is popped from the end.
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the stored string array.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // If the current line hasn't been processed into an array yet, do so.
        if (typeof s[y] === "string") {
            s[y] = s[y] .split(" ") .reverse();
        }

        // Pop the last element from the current line's array.
        r = s[y] .pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y] .length) {
            this._y++;
        }

        // Return the result, either as a string or parsed to a number.
        return f ? r : +r;
    };

    // Prototype method 'l' for getting an entire line, split by spaces.
    g.prototype.l = function (f) {
        // Get the current line, increment the line index, and split by spaces.
        var s = this._s[this._y++] .split(" ");

        // Return the array, either as strings or parsed to numbers.
        return f ? s : s .map(a => +a);
    };

    // Prototype method 'm' for getting a matrix (multiple lines),
    // where each line is split by spaces.
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the input, incrementing the line index,
        // and map each line to an array of strings split by spaces.
        var r = this._s .slice(this._y, this._y += n) .map(a => a .split(" "));

        // Return the matrix, either as strings or parsed to numbers.
        return f ? r : r .map(a => a .map(a => +a));
    };

    // Prototype method 'r' for getting multiple raw lines.
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the input, incrementing the line index.
        var r = this._s .slice(this._y, this._y += n);

        // Return the array of lines, either as strings or parsed to numbers.
        return f ? r : r .map(a => +a);
    };

    // Return the factory function 'f' to be assigned to GET.
    return f;
})();


// Initialize the input reader 'o' by reading from /dev/stdin.
var o = GET(require("fs") .readFileSync("/dev/stdin", "utf8"));


/*
 * Helper function to create multi-dimensional arrays.
 * This function builds an 'eval' string to dynamically create
 * arrays based on the provided dimensions.
 */
function xArray (v) {
    var a = arguments, // All arguments passed to the function.
        l = a .length,  // Number of arguments.
        r = "Array(a[" + --l + "]) .fill(v)"; // Innermost array definition.

    // Loop backwards through dimensions to build the nested array string.
    while (--l) {
        r = "Array(a[" + l + "]) .fill(0) .map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}


// Define a modulo constant, commonly used in competitive programming.
var mod = 1e9 + 7;


/*
 * Function to calculate a product modulo 'mod'.
 * It handles large numbers by splitting them into 16-bit chunks
 * to prevent overflow before applying the modulo.
 */
function abmod () {
    var a = arguments, // All arguments (numbers to multiply).
        r = a[0],      // Initialize result with the first argument.
        i = 1;         // Start from the second argument.

    // Loop through remaining arguments.
    while (i < a .length) {
        // Perform multiplication using 16-bit chunks and modulo.
        // This is a common trick for `(A * B) % M` when A*B might exceed 2^53.
        r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i++]) % mod;
    }
    return r;
}


// Output the result of the main function to the console.
console .log(main());


/*
 * The main logic of the program.
 * It reads input, performs calculations, and returns a result.
 */
function main () {
    var n = o .a(); // Read the first integer 'n'.
    var x = o .a(); // Read the second integer 'x'.

    // Read a list of integers, sort them in descending order.
    var s = o .l() .sort((a, b) => b - a);

    // Initialize a dynamic programming object (map).
    var dp = {};
    // Base case: starting with 'x', there's 1 way to get it.
    dp[x] = 1;

    // Iterate 'n' times, corresponding to the 's' array elements.
    for (var i = 0; i < n; i++) {
        // Create a new DP state for the current iteration.
        var dp2 = {};

        // Iterate over the current DP states.
        for (var j in dp) {
            j = +j; // Convert key 'j' from string to number.

            // Case 1: Don't use the current 's[i]' element.
            // The number of ways to reach 'j' without using 's[i]'
            // is multiplied by the remaining elements (n-i-1).
            if (dp2[j]) {
                dp2[j] += dp[j] * (n - i - 1);
                dp2[j] %= mod;
            } else {
                dp2[j] = dp[j] * (n - i - 1) % mod;
            }

            // Case 2: Use the current 's[i]' element.
            // The new state is 'j % s[i]'.
            var m = j % s[i];

            // Add the ways from 'dp[j]' to the new state 'm'.
            if (dp2[m]) {
                dp2[m] += dp[j];
                dp2[m] %= mod;
            } else {
                dp2[m] = dp[j];
            }
        }
        // Update the DP state for the next iteration.
        dp = dp2;
    }

    var ans = 0; // Initialize the final answer.

    // Sum up the products of each state 'i' and its count 'dp[i]'.
    for (i in dp) {
        i = +i; // Convert key 'i' to number.
        ans += abmod(i, dp[i]); // Use abmod for safe multiplication.
    }

    // Return the final answer modulo 'mod'.
    return ans % mod;
}