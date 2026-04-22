/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain exactly the same.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create a visually different but functionally identical version.
 */
var GET = (

    function() {
        // Inner helper function 'f'
        function f(s) {
            return new g(s);
        } // End of function f

        // Inner class/constructor 'g'
        function g(s) {
            // Store the trimmed and split input string array
            this._s = s.trim().split("\n");
            // Initialize the current line index
            this._y = 0;
        } // End of constructor g

        // Prototype method 'a' for class 'g'
        g.prototype.a = function(f) {
            var s = this._s, // Reference to the string array
                y = this._y, // Current line index
                r; // Variable to hold the result

            // Check if the current line is a string and needs processing
            if (typeof s[y] === "string") {
                // Split the line by spaces and reverse it for stack-like access
                s[y] = s[y].split(" ").reverse();
            }

            // Pop the last element from the current line's array
            r = s[y].pop();

            // If the current line is empty, advance to the next line
            if (!s[y].length) {
                this._y++;
            }

            // Return the result, converting to number if 'f' is false/falsy
            return f ? r : +r;
        }; // End of g.prototype.a

        // Prototype method 'l' for class 'g' (read a whole line)
        g.prototype.l = function(f) {
            // Get the current line, increment line index, and split by space
            var s = this._s[this._y++].split(" ");

            // Return as strings if 'f' is true, otherwise map to numbers
            return f ? s : s.map(a => +a);
        }; // End of g.prototype.l

        // Prototype method 'm' for class 'g' (read a matrix)
        g.prototype.m = function(n, f) {
            // Slice 'n' lines, increment index, and map each line to an array of strings
            var r = this._s.slice(this._y, this._y += n)
                .map(a => a.split(" "));

            // Return as string matrix if 'f' is true, otherwise map all elements to numbers
            return f ? r : r.map(a => a.map(a => +a));
        }; // End of g.prototype.m

        // Prototype method 'r' for class 'g' (read raw lines)
        g.prototype.r = function(n, f) {
            // Slice 'n' lines and increment index
            var r = this._s.slice(this._y, this._y += n);

            // Return as string array if 'f' is true, otherwise map all elements to numbers
            return f ? r : r.map(a => +a);
        }; // End of g.prototype.r

        // The 'GET' function returns the 'f' function, which is the entry point
        return f;

    }

)(); // IIFE ends here

// Initialize 'o' by reading input from stdin using the GET utility
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Function to create a multi-dimensional array with a default value.
 * The dimensions are passed as arguments after the initial value.
 * Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 */
function xArray(v) {
    var a = arguments, // All arguments passed to the function
        l = a.length, // Number of arguments
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation

    // Loop to build the nested array creation string
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array
    return eval(r);
} // End of xArray function

// Call the main function and log its result to the console
console.log(main());

/*
 * Main function containing the core logic of the program.
 * It reads input values, processes them, and returns a formatted string.
 */
function main() {
    // Read integer values for height (h), width (w), and two coordinates (a, b)
    var h = o.a(); // Height of the grid
    var w = o.a(); // Width of the grid
    var a = o.a(); // X-coordinate threshold
    var b = o.a(); // Y-coordinate threshold

    // Initialize a 2D array (grid) of size h x w, filled with 0s
    var ans = xArray(0, h, w);

    var t = 0; // Flag variable, toggled when y reaches 'b'

    // Loop through each row of the grid
    for (var y = 0; y < h; y++) {
        // If the current row index 'y' equals 'b', toggle the flag 't'
        if (y === b) {
            t = 1;
        }

        // Loop through each column in the current row
        for (var x = 0; x < w; x++) {
            // If the current column index 'x' is greater than or equal to 'a', set cell to 1
            if (x >= a) {
                ans[y][x] = 1;
            }

            // If flag 't' is set, XOR the cell value with 1 (effectively toggling 0 to 1 or 1 to 0)
            if (t) {
                ans[y][x] ^= 1;
            }
        } // End of inner for loop (columns)
    } // End of outer for loop (rows)

    // Convert the 2D array into a string:
    // 1. Map each inner array (row) to a string by joining its elements
    // 2. Join the resulting row strings with newline characters
    return ans.map(a => a.join("")).join("\n");

} // End of main function