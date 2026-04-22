var GET = (function() {
    // This immediately invoked function expression (IIFE) encapsulates the
    // input reading utility. It provides methods to parse various data formats.

    /**
     * Factory function to create a new input reader instance.
     * @param {string} s - The raw input string to be processed.
     * @returns {g} A new instance of the input reader class.
     */
    function f(s) {
        return new g(s);
    }

    /**
     * The core input reader class.
     * It stores the input lines and manages the current reading position.
     * @param {string} s - The raw input string.
     */
    function g(s) {
        // Trim leading/trailing whitespace from the input string and split it into an array of lines.
        this._s = s.trim().split("\n");
        // Initialize the line pointer to the first line (index 0).
        this._y = 0;
    }

    /**
     * Reads a single item from the current line.
     * Items are assumed to be space-separated.
     * @param {boolean} f - If true, returns the item as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r; // Variable to hold the retrieved item.

        // If the current line has not yet been processed (i.e., it's still a single string),
        // split it by spaces and reverse the resulting array. Reversing allows efficient
        // removal of items from the "front" of the line using `pop()`.
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last item from the reversed array (which is the first item of the original line).
        r = s[y].pop();

        // If the current line is now empty after popping an item,
        // advance the line pointer to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the item. If 'f' is truthy, return as string; otherwise, convert to number.
        return f ? r : +r;
    };

    /**
     * Reads an entire line of space-separated items.
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts to convert them to numbers.
     * @returns {string[]|number[]} An array of parsed items from the line.
     */
    g.prototype.l = function(f) {
        // Get the current line, split it by spaces, and then increment the line pointer.
        var s = this._s[this._y++].split(" ");

        // Return the array of items. If 'f' is truthy, return as strings; otherwise, map to numbers.
        return f ? s : s.map(a => +a);
    };

    /**
     * Reads a matrix (multiple lines, each with multiple space-separated items).
     * @param {number} n - The number of lines to read for the matrix.
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts to convert them to numbers.
     * @returns {string[][]|number[][]} A 2D array representing the matrix.
     */
    g.prototype.m = function(n, f) {
        // Slice 'n' lines from the input, then for each line, split it by spaces.
        // The line pointer '_y' is advanced by 'n' after slicing.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix. If 'f' is truthy, return as strings; otherwise,
        // map all inner items to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /**
     * Reads a list of items, where each item occupies its own line.
     * @param {number} n - The number of lines (items) to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts to convert them to numbers.
     * @returns {string[]|number[]} An array of parsed items.
     */
    g.prototype.r = function(n, f) {
        // Slice 'n' lines from the input. The line pointer '_y' is advanced by 'n'.
        var r = this._s.slice(this._y, this._y += n);

        // Return the list. If 'f' is truthy, return as strings; otherwise, map to numbers.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the factory function 'f', making it the public interface of GET.
    return f;
})();

// Initialize the input reader 'o' by reading the entire content of standard input
// asynchronously as a UTF-8 string and passing it to the GET factory.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and initial values.
 * The first argument 'v' is the initial value for the innermost elements.
 * Subsequent arguments define the size of each dimension, from outermost to innermost.
 *
 * Example: xArray(0, 2, 3) creates Array(2).fill(0).map(() => Array(3).fill(0).map(() => 0))
 * @param {*} v - The initial value for the array elements.
 * @param {...number} dimensions - The sizes of the array dimensions.
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray(v) {
    var a = arguments, // Access all arguments passed to the function.
        l = a.length, // Total number of arguments.
        // Construct the string for the innermost array creation.
        // 'l' is decremented to get the last dimension argument.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards through the remaining dimensions to build the nested array structure string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the multi-dimensional array.
    // This is a powerful but potentially unsafe operation if input is untrusted.
    return eval(r);
}

// Execute the main program logic and print its returned value to the console.
console.log(main());

/**
 * The main function of the program, containing the primary business logic.
 * It processes a list of strings to count specific patterns and derive a final answer.
 * @returns {number} The calculated answer.
 */
function main() {
    // Read the first number from input, which represents 'n', the count of subsequent lines.
    var n = o.a();

    // Read 'n' lines from input. The '1' argument ensures they are returned as strings.
    var s = o.r(n, 1);

    // Initialize counters for different string boundary conditions.
    var a = 0; // Count of strings that end with 'A' but do NOT start with 'B'.
    var b = 0; // Count of strings that start with 'B' but do NOT end with 'A'.
    var c = 0; // Count of strings that start with 'B' AND end with 'A'.

    // Initialize the main answer variable, which will count "AB" pairs.
    var ans = 0;

    // Iterate through each of the 'n' input strings.
    for (var i = 0; i < n; i++) {
        // 'x' keeps track of the previous character to detect "AB" pairs.
        // It starts with the first character of the current string.
        var x = s[i][0];

        // Iterate through the characters of the current string, starting from the second character.
        for (var j = 1; j < s[i].length; j++) {
            // If the previous character was 'A' and the current character is 'B',
            // it means an "AB" pattern is found within the string.
            if (x === "A" && s[i][j] === "B") {
                ans++; // Increment the total "AB" count.
            }
            // Update 'x' to the current character for the next iteration.
            x = s[i][j];
        }

        // After processing internal "AB"s, analyze the start and end characters of the string.
        if (s[i][0] === "B") {
            // If the string starts with 'B'.
            if (s[i][s[i].length - 1] === "A") {
                c++; // It also ends with 'A'. Increment 'c' counter.
            } else {
                b++; // It does NOT end with 'A'. Increment 'b' counter.
            }
        } else if (s[i][s[i].length - 1] === "A") {
            // If the string does NOT start with 'B' but DOES end with 'A'.
            a++; // Increment 'a' counter.
        }
    }

    // Calculate the minimum and maximum counts between 'a' and 'b'.
    var mn = Math.min(a, b);
    var mx = Math.max(a, b);

    // Add 'mn' to the total answer. These 'mn' pairs of strings (one ending in 'A', one starting in 'B')
    // can form 'AB' connections.
    ans += mn;

    // Apply additional logic based on the maximum of 'a' and 'b' and the count 'c'.
    if (mx) {
        // If there are remaining 'A'-ending or 'B'-starting strings (after forming 'mn' pairs).
        ans += c; // All 'c' strings (starting with 'B' and ending with 'A') can also contribute 'AB's.
    } else {
        // This block is executed if both 'a' and 'b' are 0.
        // This means all strings either don't contain 'A' at the end or 'B' at the start,
        // or they are of type 'BA' (counted in 'c').
        // If 'a' and 'b' are both 0, and there are 'c' strings, they can be chained.
        // e.g., B...A, B...A, B...A. This forms (c-1) additional 'AB' connections.
        // If c is 0, this results in ans += -1, which is a special case.
        if (c > 0) {
            ans += c - 1;
        }
    }

    // Return the final calculated answer.
    return ans;
}