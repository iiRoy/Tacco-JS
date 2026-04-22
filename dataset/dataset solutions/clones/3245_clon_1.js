var GET = (

    // This is an immediately invoked function expression (IIFE)
    // It encapsulates the logic for parsing input.
    function() {

        // The main factory function returned by the IIFE.
        // It creates a new instance of the 'g' parser.
        function f(s) {
            return new g(s);
        }

        // The constructor for the parser object.
        // Initializes the internal state.
        function g(s) {
            // Trim leading/trailing whitespace and split input by newlines.
            this._s = s.trim().split("\n");
            // _y acts as a line pointer or index.
            this._y = 0;
        }

        // Prototype method 'a' (arbitrary value).
        // Reads and returns a single value from the current line.
        g.prototype.a = function(f) {
            // Retrieve internal state variables for convenience.
            var s = this._s,
                y = this._y,
                r; // 'r' will hold the result.

            // If the current line is a string, process it.
            if (typeof s[y] === "string") {
                // Split the line by spaces and reverse the order.
                // This suggests parsing from right to left or dealing with stack-like input.
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element (which was originally the first due to reverse).
            r = s[y].pop();

            // If the current line is now empty, advance to the next line.
            if (!s[y].length) {
                this._y++;
            }

            // If 'f' is true, return the raw string. Otherwise, convert to number.
            return f ? r : +r;
        };


        // Prototype method 'l' (line).
        // Reads an entire line and returns its elements.
        g.prototype.l = function(f) {
            // Get the current line, split by spaces, and then advance the line pointer.
            var s = this._s[this._y++].split(" ");

            // If 'f' is true, return raw strings. Otherwise, convert all elements to numbers.
            return f ? s : s.map(a => +a);
        };

        // Prototype method 'm' (matrix or multiple lines).
        // Reads 'n' lines and parses them as a matrix of values.
        g.prototype.m = function(n, f) {
            // Slice 'n' lines from the current position, then advance the line pointer.
            // Map each line to an array of strings by splitting.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // If 'f' is true, return raw string matrix.
            // Otherwise, convert all elements in the matrix to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        // Prototype method 'r' (rows or raw lines).
        // Reads 'n' lines and returns them.
        g.prototype.r = function(n, f) {
            // Slice 'n' lines from the current position, then advance the line pointer.
            var r = this._s.slice(this._y, this._y += n);

            // If 'f' is true, return raw string lines.
            // Otherwise, convert all elements (assuming single value per line) to numbers.
            return f ? r : r.map(a => +a);
        };

        // The IIFE returns the factory function 'f'.
        return f;

    }
)(); // End of IIFE definition and immediate invocation.


// Initialize the input parser 'o' by reading from standard input.
// This uses Node.js 'fs' module to read the entire file synchronously.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


// Execute the main logic and print the result to console.
console.log(main());


// Main function containing the problem-specific logic.
function main() {

    // Read two single integer values from input.
    var n = o.a();
    var m = o.a();

    // Initialize two arrays 'a' and 'b' which will store adjacency lists
    // or similar graph-like structures.
    var a = [];
    var b = [];

    // Initialize array 'c' with a large value (9e9) for all elements.
    // Its size is n + m - 1. This might be used for distances or states.
    var c = Array(n + m - 1).fill(9e9);

    // Loop to read n + m - 1 lines of input.
    // Each line likely represents an edge or a relationship.
    for (var i = 0; i < n + m - 1; i++) {

        // Read a line, map elements to numbers, and subtract 1 (0-indexed).
        var t = o.l().map(a => a - 1);

        // Populate array 'a' (adjacency list type structure).
        // If a[t[1]] exists, push t[0] to it. Otherwise, create a new array.
        if (a[t[1]]) {
            a[t[1]].push(t[0]);
        } else {
            a[t[1]] = [t[0]];
        }

        // Populate array 'b' (another adjacency list type structure).
        // If b[t[0]] exists, push t[1] to it. Otherwise, create a new array.
        if (b[t[0]]) {
            b[t[0]].push(t[1]);
        } else {
            b[t[0]] = [t[1]];
        }
    }

    // Initialize 'ans' array to store results.
    var ans = [];

    // Loop to find an initial starting point.
    // It seems to be looking for a node 'i' where 'a[i]' is undefined.
    for (i = 0;; i++) {
        if (!a[i]) {
            // If a[i] is undefined, consider 'i' as a starting node.
            // 'q' is initialized with neighbors from 'b[i]'.
            var q = b[i];
            ans[i] = 0; // Assign 0 to ans[i].
            c[i] = 0; // Set c[i] to 0.
            break; // Exit the loop once a starting point is found.
        }
    }

    // Initialize 'l' (length/count) and 'd' (depth/distance).
    var l = 1,
        d = 1;

    // Main processing loop, likely a breadth-first search or similar traversal.
    // Continues as long as 'l' is less than 'n'.
    while (l < n) {

        // 'x' will accumulate nodes for the next level/iteration.
        var x = [];

        // Iterate through the current set of nodes in 'q'.
        for (i = 0; i < q.length; i++) {

            var y = q[i],
                f = 1; // 'f' acts as a flag.

            // Iterate through neighbors of 'y' stored in 'a[y]'.
            for (var j = 0; j < a[y].length; j++) {

                // Check conditions based on values in 'c'.
                if (c[a[y][j]] >= d) {
                    f = 0; // If condition met, set flag 'f' to 0.
                    break; // Exit inner loop.
                }

                // If c[neighbor] is d-1, assign neighbor + 1 to ans[y].
                if (c[a[y][j]] === d - 1) {
                    ans[y] = a[y][j] + 1;
                }
            }

            // If flag 'f' is still 1 (condition not met in inner loop).
            if (f) {
                c[y] = d; // Update c[y] with current depth 'd'.
                l++; // Increment 'l'.
                // If 'b[y]' exists, concatenate its elements to 'x'.
                if (b[y]) {
                    x = x.concat(b[y]);
                }
            }
        }

        // Update 'q' for the next iteration with the accumulated nodes 'x'.
        q = x;
        d++; // Increment depth 'd'.
    }

    // Join the elements of 'ans' array with newline characters and return the string.
    return ans.join("\n");
}