/*
 * This is an automatically generated JavaScript file.
 * It provides utilities for reading input data.
 * The structure is an Immediately Invoked Function Expression (IIFE).
 */
var GET = (

    function () {

        // Main function to create a new input reader instance.
        function f(s) {
            // Returns a new instance of the 'g' class, passing the input string.
            return new g(s);
        }

        // Constructor for the input reader object.
        function g(s) {
            // Store the input string, trimming whitespace and splitting by newlines.
            this._s = s . trim ( ) . split ( "\n" ) ;
            // Initialize the current line index to 0.
            this._y = 0;
        }

        // Prototype method 'a' for reading a single item (number or string).
        g.prototype.a = function (f) {
            // Get the internal string array, current line index, and declare a result variable.
            var s = this._s,
                y = this._y,
                r;

            // Check if the current line at index 'y' is a string.
            if (typeof s[y] === "string") {
                // If it's a string, split it by space and reverse the array.
                // This allows reading items from right to left on a single line.
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element from the current line's array.
            r = s[y].pop();

            // If the current line is now empty, advance to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // If 'f' (format flag) is true, return the item as a string.
            // Otherwise, convert it to a number using the unary plus operator.
            return f ? r : +r;
        };

        // Prototype method 'l' for reading an entire line.
        g.prototype.l = function (f) {
            // Get the current line, increment the line index, and split by spaces.
            var s = this._s[this._y++].split(" ");

            // If 'f' is true, return the array of strings.
            // Otherwise, map each string in the array to a number.
            return f ? s : s.map(a => +a);
        };

        // Prototype method 'm' for reading a matrix (multiple lines, multiple items per line).
        g.prototype.m = function (n, f) {
            // Slice 'n' lines from the input, incrementing the line index.
            // Then, map each line to an array of strings by splitting.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // If 'f' is true, return the matrix of strings.
            // Otherwise, map each inner array to an array of numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        // Prototype method 'r' for reading raw lines (no splitting or type conversion).
        g.prototype.r = function (n, f) {
            // Slice 'n' lines from the input, incrementing the line index.
            var r = this._s.slice(this._y, this._y += n);

            // If 'f' is true, return the array of raw strings.
            // Otherwise, map each string to a number (useful for single-number lines).
            return f ? r : r.map(a => +a);
        };

        // Return the main factory function 'f' from the IIFE.
        return f;

    }

)();

/*
 * Use the GET utility to read input from /dev/stdin.
 * The 'fs' (file system) module is required for this operation.
 * The input is read synchronously and decoded as UTF-8.
 */
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main function and print its return value to the console.
console.log(main());

/*
 * This is the primary logic function for the program.
 * It reads problem-specific input using the 'o' (input reader) object
 * and calculates the final result.
 */
function main() {

    // Read the first integer, which represents 'n'.
    var n = o.a();

    // Read the second integer, which represents 'm'.
    var m = o.a();

    // Initialize an array 'x' of size 'm' with all elements set to 0.
    // This array will be used to count occurrences.
    var x = Array(m).fill(0);

    // Initialize the answer variable to 0.
    ans = 0;

    // Loop 'n' times, as specified by the input 'n'.
    for (var i = 0; i < n; i++) {

        // Read a line of numbers, storing it in 't'.
        // The first element of 't' (t[0]) indicates the number of items that follow.
        var t = o.l();

        // Loop from 1 up to the count specified by t[0].
        // This iterates through the items on the current line.
        for (var j = 1; j <= t[0]; j++) {

            // Increment the counter in array 'x' at the index specified by t[j-1].
            // Note: t[j-1] is used because the loop starts from j=1 and t[0] is the count.
            x[t[j - 1]]++;
        }
    }

    // After processing all 'n' lines, iterate through the 'x' array.
    // This loop checks each element from index 0 to m-1.
    for (i = 0; i < m; i++) {
        // If the count for a particular item (x[i]) is equal to 'n',
        // it means this item was present in all 'n' input sets.
        if (x[i] === n) {
            // Increment the final answer.
            ans++;
        }
    }

    // Return the calculated answer.
    return ans;
}