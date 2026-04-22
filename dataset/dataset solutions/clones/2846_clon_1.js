/*
 * This is a custom input parsing module.
 * It provides methods to read various types of data
 * from a pre-processed string, typically from standard input.
 */
var GET = (
    function () {

        // The main factory function returned by the IIFE.
        // It creates a new instance of the G parser.
        function f(s) {
            return new g(s);
        }

        // The constructor for the G parser.
        // It initializes the internal state with the input string.
        function g(s) {
            // Store lines of the input after trimming and splitting.
            this._s = s.trim().split("\n");
            // Initialize the current line index.
            this._y = 0;
        }

        // Prototype method 'a': Reads a single value (number or string) from the current line.
        // If 'f' is true, returns as string; otherwise, as number.
        g.prototype.a = function (f) {
            var s = this._s, // Reference to the input lines array.
                y = this._y, // Current line index.
                r;           // Variable to hold the result.

            // If the current line hasn't been split yet, split it by space and reverse.
            // This allows popping from the "front" of the original line.
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element (which was the first in the original line after reverse).
            r = s[y].pop();

            // If the current line is exhausted, move to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // Return the result, converting to number if 'f' is false/falsy.
            return f ? r : +r;
        };

        // Prototype method 'l': Reads an entire line as an array of values.
        // If 'f' is true, returns as strings; otherwise, as numbers.
        g.prototype.l = function (f) {
            // Split the current line by space and increment the line index.
            var s = this._s[this._y++].split(" ");

            // Return the array, mapping to numbers if 'f' is false/falsy.
            return f ? s : s.map(a => +a);
        };

        // Prototype method 'm': Reads a matrix (n lines) of values.
        // If 'f' is true, returns as strings; otherwise, as numbers.
        g.prototype.m = function (n, f) {
            // Slice 'n' lines, split each by space.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return the matrix, mapping inner arrays to numbers if 'f' is false/falsy.
            return f ? r : r.map(a => a.map(a => +a));
        };

        // Prototype method 'r': Reads 'n' lines as an array of values.
        // If 'f' is true, returns as strings; otherwise, as numbers.
        g.prototype.r = function (n, f) {
            // Slice 'n' lines directly.
            var r = this._s.slice(this._y, this._y += n);

            // Return the array, mapping to numbers if 'f' is false/falsy.
            return f ? r : r.map(a => +a);
        };

        // The IIFE returns the factory function 'f'.
        return f;

    }
)();


// Initialize the input parser 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Creates an N-dimensional array initialized with a given value or expression.
 * The dimensions are passed as subsequent arguments after the initial value 'v'.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with zeros.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function.
        l = a.length,  // Total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation.

    // Loop backwards through dimensions to build the nested array creation string.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the N-dimensional array.
    return eval(r);
}


// Execute the main logic and print the result to the console.
console.log(main());


/*
 * The main function implementing the problem's logic.
 * It processes an array of numbers to generate a sequence of operations.
 */
function main() {

    // Read the number of elements 'n'.
    var n = o.a();
    // Read the array 'a' of 'n' elements.
    var a = o.l();

    // Sort the array 'a' in ascending order.
    a.sort((a, b) => a - b);

    // Initialize the answer array with the negation of the smallest element.
    var ans = [-a[0]];

    // First loop: Sum the absolute values of all elements from the second one onwards
    // and add them to the first element of 'ans'.
    for (var i = 1; i < n; i++) {
        ans[0] += Math.abs(a[i]);
    }


    // Initialize 's' with the first element of the sorted array.
    var s = a[0];

    // Second loop: Process elements from the second to the second-to-last.
    for (var l = 1; l < n - 1; l++) {

        // Skip negative numbers in this phase.
        if (a[l] < 0) {
            continue;
        }

        var x = ans.length; // Current length of the 'ans' array.

        // If 'ans' has only one element, append a string combining a[0] and a[l].
        // Then update 's' by subtracting a[l] from a[0].
        if (x === 1) {
            ans.push(a[0] + " " + a[l]);
            s = a[0] - a[l];
        }
        // Otherwise, append a string combining current 's' and a[l].
        // Then update 's' by subtracting a[l] from 's'.
        else {
            ans.push(s + " " + a[l]);
            s -= a[l];
        }
    }


    // After the second loop, append a string combining the last element a[n-1] and current 's'.
    ans.push(a[n - 1] + " " + s);
    // Update 's' by subtracting its current value from a[n-1].
    s = a[n - 1] - s;


    // Third loop: Continue appending operations until 'ans' contains 'n' elements.
    // This loop effectively processes any remaining negative numbers that were skipped earlier.
    for (var l = 1; ans.length !== n; l++) {

        var x = ans.length; // Current length of the 'ans' array.

        // Append a string combining current 's' and a[l].
        ans.push(s + " " + a[l]);
        // Update 's' by subtracting a[l] from 's'.
        s -= a[l];
    }


    // Join all elements of the 'ans' array with newline characters and return the result.
    return ans.join("\n");
}