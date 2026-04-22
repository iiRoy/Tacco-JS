"use strict"; // Enforce strict mode for better code quality and error handling.


// Define a module-like structure using an Immediately Invoked Function Expression (IIFE)
// to encapsulate the GET utility functions and prevent global namespace pollution.
var GET = (function () {

    // The main entry point function to create a new GET object.
    function f(s) {
        return new g(s);
    }

    // Constructor function for the GET object.
    // It processes the input string `s` into an array of lines.
    function g(s) {
        // Trim whitespace from the string and split it into an array of lines.
        this._s = s.trim().split("\n");
        // Initialize the current line index to 0.
        this._y = 0;
    }

    // Prototype method 'a' for the GET object.
    // Reads a single value from the current line, treating it as space-separated.
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the result.

        // If the current line hasn't been processed into an array of tokens yet,
        // split it by spaces and reverse it to easily pop elements from the end.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Pop the last element (which is the first element of the original line).
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the raw string if 'f' is true, otherwise return it as a number.
        return f ? r : +r;
    };


    // Prototype method 'l' for the GET object.
    // Reads an entire line as space-separated values.
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then advance to the next line.
        var s = this._s[this._y++].split(" ");

        // Return the raw string array if 'f' is true, otherwise map elements to numbers.
        return f ? s : s.map(a => +a);
    };


    // Prototype method 'm' for the GET object.
    // Reads multiple lines (n) as a 2D array of space-separated values.
    g.prototype.m = function (n, f) {
        // Slice 'n' lines from the current position, then advance the line index.
        // Map each line to an array of space-separated strings.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // If 'f' is true, return the raw 2D array of strings.
        // Otherwise, map all inner elements to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };


    // Prototype method 'r' for the GET object.
    // Reads multiple lines (n) as a 1D array.
    g.prototype.r = function (n, f) {
        // Slice 'n' lines from the current position, then advance the line index.
        var r = this._s.slice(this._y, this._y += n);

        // If 'f' is true, return the raw array of strings.
        // Otherwise, map all elements to numbers.
        return f ? r : r.map(a => +a);
    };

    // Return the factory function 'f' which creates GET objects.
    return f;

})(); // End of IIFE for GET.


// Create an instance of the GET object by reading input from stdin.
// This `o` object will be used to parse input values.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Utility function `xArray` for creating multi-dimensional arrays.
// Note: This function is not used in the `main` logic of the provided code.
function xArray(v) {
    var a = arguments,    // All arguments passed to the function.
        l = a.length,     // Number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation.

    // Loop to build up the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the dynamically constructed string to create the array.
    return eval(r);
}


// Define the modulo constant, a common prime number used in competitive programming.
var mod = 998244353;


// Function for modular multiplication.
// Uses bitwise operations for potentially faster calculation, avoiding direct large number multiplication
// before modulo if intermediate results exceed standard integer limits (though JS numbers are floats).
function mul(a, b) {
    return ((a >> 16) * b % mod * 65536 + (a & 65535) * b) % mod;
}


// Function for modular inverse using the Extended Euclidean Algorithm.
// Calculates a^-1 mod m.
function inv(a) {
    var b = mod, // Modulo value.
        u = 1,   // Coefficient for 'a'.
        v = 0,   // Coefficient for 'b'.
        t;       // Temporary variable for swaps.

    // Extended Euclidean Algorithm loop.
    while (b) {
        t = a / b | 0; // Integer division.
        a -= t * b;
        u -= t * v;
        t = a;
        a = b;
        b = t;
        t = u;
        u = v;
        v = t;
    }

    // Ensure the result is positive.
    u %= mod;
    return u < 0 ? u + mod : u;
}


// Function for modular exponentiation (a^n mod m).
// Uses binary exponentiation (exponentiation by squaring) for efficiency.
function pow(a, n) {
    var r = 1; // Result accumulator, initialized to 1.

    // Loop while 'n' (exponent) is greater than 0.
    while (n) {
        // If the current bit of 'n' is 1, multiply 'r' by 'a'.
        if (n & 1) {
            r = mul(a, r);
        }
        // Square 'a' for the next iteration.
        a = mul(a, a);
        // Right-shift 'n' by 1 (equivalent to n = n / 2).
        n >>= 1;
    }

    return r; // Return the final result.
}


// Call the main function and log its return value to the console.
console.log(main());


// The main logic function for the problem.
function main() {
    // Read the input 'n' using the GET object.
    var n = o.a();

    // Calculate the initial answer: 3^n mod mod.
    var ans = pow(3, n);

    // Initialize factorial accumulator to 1.
    var fac = 1;

    // Loop from i = 0 up to (n/2 - 1).
    // m is n/2 (integer division), p2 accumulates powers of 2.
    for (var i = 0, m = n >> 1, p2 = 1; i < m; i++) {
        // Update p2: p2 = p2 * 2 mod mod.
        p2 = p2 * 2 % mod;

        // Subtract the term: fac * p2 mod mod from ans.
        ans -= mul(fac, p2);

        // Update fac: fac = fac * (n-i) * inv(i+1) mod mod.
        // This is equivalent to fac = n! / ((n-i-1)! * (i+1)!) (binomial coefficient related).
        fac = mul(mul(fac, n - i), inv(i + 1));
    }

    // Ensure ans remains within the modulo range.
    ans %= mod;

    // Return the final answer, ensuring it's positive.
    return ans < 0 ? ans + mod : ans;
}