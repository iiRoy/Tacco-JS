/*
 * This JavaScript module, named GET, is designed for parsing input data.
 * It provides a set of utility functions to read various formats of data
 * (single values, lines, matrices) from a multi-line string input.
 */
var GET = (function () {

    // The main function exposed by the IIFE.
    // It acts as a factory to create new parser instances.
    function f(s) {
        return new g(s);
    }


    // The core parser class, responsible for managing the input string
    // and tracking the current reading position.
    function g(s) {
        // The input string is trimmed of leading/trailing whitespace
        // and then split into an array of lines.
        this._s = s.trim().split("\n");

        // _y is the current line index being processed.
        this._y = 0;
    }


    /*
     * g.prototype.a: Reads a single item from the current line.
     * If the line hasn't been prepared, it splits and reverses it.
     *
     * @param {boolean} f - If true, returns the item as a string; otherwise, attempts conversion to number.
     * @returns {string|number} The parsed item.
     */
    g.prototype.a = function (f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to hold the extracted item.

        // Check if the current line needs to be processed (i.e., it's still a raw string).
        if (typeof s[y] === "string") {
            // Split the line by spaces and reverse it. Reversing allows
            // efficient 'pop' operations to read elements from left to right.
            s[y] = s[y].split(" ").reverse();
        }

        // Extract the last element from the (reversed) current line array.
        r = s[y].pop();

        // If the current line is now empty, advance to the next line.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result. If 'f' is true, return as string; otherwise, convert to number.
        return f ? r : +r;
    };


    /*
     * g.prototype.l: Reads an entire line, splits it by spaces, and advances the line pointer.
     *
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts conversion to numbers.
     * @returns {string[]|number[]} An array of items from the line.
     */
    g.prototype.l = function (f) {
        // Get the current line, split it by spaces, and then increment the line index.
        var s = this._s[this._y++].split(" ");

        // Return the array. If 'f' is true, return as strings; otherwise, map all to numbers.
        return f ? s : s.map(a => +a);
    };


    /*
     * g.prototype.m: Reads multiple lines as a matrix. Each line is split by spaces.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts conversion to numbers.
     * @returns {string[][]|number[][]} A 2D array (matrix).
     */
    g.prototype.m = function (n, f) {
        // Slice 'n' lines starting from the current position, then update the line index.
        // For each sliced line, split it by spaces.
        var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

        // Return the matrix. If 'f' is true, return as strings; otherwise, map all inner items to numbers.
        return f ? r : r.map(a => a.map(a => +a));
    };


    /*
     * g.prototype.r: Reads multiple lines as a simple array. Each line is treated as a single item.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns items as strings; otherwise, attempts conversion to numbers.
     * @returns {string[]|number[]} An array of items.
     */
    g.prototype.r = function (n, f) {
        // Slice 'n' lines starting from the current position, then update the line index.
        var r = this._s.slice(this._y, this._y += n);

        // Return the array. If 'f' is true, return as strings; otherwise, map all to numbers.
        return f ? r : r.map(a => +a);
    };


    // The IIFE returns the 'f' function, making it the public interface for GET.
    return f;

})(); // End of the GET module definition.


// Initialize an instance of the input parser 'o'.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Call the main function to execute the program's logic
// and print its return value to the console.
console.log(main());


/*
 * The main function encapsulates the primary logic of the program.
 * It reads input using the 'o' parser, performs calculations,
 * and constructs the final output string.
 *
 * @returns {string|number} The computed result, typically a string of operations.
 */
function main() {
    // Read the first integer 'n' from the input.
    var n = o.a();

    // Read the next line as an array of numbers 'a'.
    var a = o.l();

    // Initialize 'mx' (maximum absolute value found so far) to 0,
    // and 'k' (1-based index of 'mx') as undefined.
    var mx = 0,
        k;

    // Iterate through the array 'a' to find the element with the largest absolute value.
    for (var i = 0; i < n; i++) {
        // Compare the absolute value of the current 'mx' with the current array element.
        if (Math.abs(mx) < Math.abs(a[i])) {
            mx = a[i];   // Update 'mx' to the actual value of the element.
            k = i + 1;   // Store the 1-based index of this element.
        }
    }

    // If 'mx' remains 0 (meaning all elements were 0 or the array was empty),
    // return 0 as per the problem's specific condition.
    if (mx === 0) {
        return 0;
    }

    // Initialize an array to store the sequence of operations.
    var ans = [];

    // The logic diverges based on whether the element with the maximum absolute value is negative or positive.
    if (mx < 0) {
        // Case: The largest absolute value belongs to a negative number.
        // The goal is to make all numbers negative or zero.

        // Perform two initial operations involving the element at index 'k' and the first element.
        // These operations might be intended to propagate the negative 'mx' value or normalize.
        ans.push(k + " 1");
        ans.push(k + " 1");

        // Iterate through the array from the second element (index 1) to the end.
        for (i = 1; i < n; i++) {
            // If the current element 'a[i]' is already negative,
            // perform operations involving the first element and the current element.
            if (a[i] < 0) {
                ans.push("1 " + (i + 1)); // e.g., add a[1] to a[i+1]
                ans.push("1 1");          // e.g., add a[1] to a[1]
            }
            // If the current element 'a[i]' is positive or zero,
            // perform operations to make it negative using the first element.
            else {
                ans.push("1 1");          // e.g., add a[1] to a[1]
                ans.push("1 " + (i + 1)); // e.g., add a[1] to a[i+1]
            }
        }
    } else {
        // Case: The largest absolute value belongs to a positive number.
        // The goal is to make all numbers positive or zero.

        // Perform two initial operations involving the element at index 'k' and the last element.
        // These operations might be intended to propagate the positive 'mx' value or normalize.
        ans.push(k + " " + n);
        ans.push(k + " " + n);

        // Iterate through the array from the first element (index 0) up to the second-to-last.
        for (i = 0; i < n - 1; i++) {
            // If the current element 'a[i]' is negative,
            // perform operations involving the last element and the current element.
            if (a[i] < 0) {
                ans.push(n + " " + n);          // e.g., add a[n] to a[n]
                ans.push(n + " " + (i + 1));    // e.g., add a[n] to a[i+1]
            }
            // If the current element 'a[i]' is positive or zero,
            // perform operations using the last element.
            else {
                ans.push(n + " " + (i + 1));    // e.g., add a[n] to a[i+1]
                ans.push(n + " " + n);          // e.g., add a[n] to a[n]
            }
        }
    }

    // Output the total number of operations required, which is always 2*n.
    console.log(2 * n);

    // Join all the recorded operations with newline characters
    // and return the resulting string.
    return ans.join("\n");
}