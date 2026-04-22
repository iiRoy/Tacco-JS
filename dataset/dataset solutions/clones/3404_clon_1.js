var GET = (

    function () {
        /*
         * This is a self-executing anonymous function
         * it encapsulates the GET utility.
         */

        function f(s) {
            // The main entry point for the GET parser.
            // It creates a new instance of the internal parser 'g'.
            return new g(s);
        } /* end of function f */


        function g(s) {
            /*
             * Constructor for the internal parser class.
             * Initializes the source string and internal pointer.
             */
            this._s = s.trim().split("\n"); // Trim input and split into lines.
            this._y = 0; // Initialize line pointer to the beginning.
        }

        // Prototype methods for the 'g' class follow.

        g.prototype.a = function (f) {
            // Method 'a' for retrieving a single item.
            var s = this._s,
                y = this._y,
                r; // Declare variables: source array, current line index, result.

            if (typeof s[y] === "string") {
                // If the current line is still a string, process it.
                s[y] = s[y].split(" ").reverse(); // Split by space and reverse.
            }

            r = s[y].pop(); // Pop the last element.

            if (!s[y].length) {
                // If the current line is now empty, advance to the next line.
                this._y++;
            }

            // Return the result, converted to number if 'f' is falsy.
            return f ? r : +r;
        }; // End of method 'a'

        g.prototype.l = function (f) {
            // Method 'l' for retrieving a whole line.
            var s = this._s[this._y++].split(" "); // Get current line, split, and advance line pointer.

            // Return the array of strings or array of numbers based on 'f'.
            return f ? s : s.map(a => +a);
        }; // End of method 'l'


        g.prototype.m = function (n, f) {
            // Method 'm' for retrieving a matrix (multiple lines, multiple items per line).
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" ")); // Slice 'n' lines, split each.

            // Return the matrix of strings or numbers.
            return f ? r : r.map(a => a.map(a => +a));
        }; /* end of method m */

        g.prototype.r = function (n, f) {
            // Method 'r' for retrieving raw lines (multiple lines, single item per line).
            var r = this._s.slice(this._y, this._y += n); // Slice 'n' lines.

            // Return array of strings or numbers.
            return f ? r : r.map(a => +a);
        }; // End of method 'r'

        return f; // The IIFE returns the public function 'f'.

    }
)(); // Immediate invocation of the function.

/*
 * Global variable 'o' is initialized by reading input from stdin
 * using the GET parser utility.
 */
var o = GET(require("fs")
    .readFileSync("/dev/stdin", "utf8")
);


// Execute the main logic and print the result to the console.
console.log(main());


/**
 * The primary function containing the problem's solution logic.
 * @returns {number} The calculated answer.
 */
function main() {

    var h = o.a(); // Read height H.
    var w = o.a(); // Read width W.
    var n = o.a(); // Read number of obstacles N.

    var b = Array(h + 1); // Initialize an array 'b' to represent the grid rows.

    /*
     * Initialize each row of 'b' as an empty object.
     * Also, set a 'wall' at column w+1 for each row.
     */
    for (var i = 0; i <= h; i++) {
        b[i] = {};
        b[i][w + 1] = 1; // Mark column W+1 as an obstacle.
    }

    /*
     * Process each obstacle.
     * The input 't' contains [column, row].
     */
    for (i = 0; i < n; i++) {
        var t = o.l(); // Read the obstacle coordinates (col, row).
        b[t[1]][t[0]] = 1; // Mark the obstacle position (row, col) in the grid.
    }

    /*
     * Initialize the answer.
     * For the first row (row 1), find the first obstacle and subtract 1.
     * Object.keys returns string keys, so we need to convert to number.
     */
    var ans = Object.keys(b[1])[0] - 1;

    var x = 2; // Initialize the current column pointer 'x' starting from column 2.

    /*
     * Iterate through rows from 2 up to H.
     * This loop determines the maximum width reachable for each row.
     */
    for (i = 2; i <= h; i++) {

        // Advance 'x' past any obstacles in the current row.
        while (b[i][x]) {
            x++;
        }

        // If the current reachable width 'x' exceeds the current best answer,
        // then no further improvement is possible.
        if (x > ans) {
            break;
        }

        /*
         * Iterate through obstacles in the current row 'i'.
         * 'j' represents the column index of an obstacle.
         */
        for (var j in b[i]) {
            j = +j; // Convert the string key 'j' to a number.

            // If the obstacle is to the left of or at the current 'x',
            // it doesn't affect the current path from 'x'.
            if (x > j) {
                continue;
            }

            // If the obstacle 'j' creates a narrower path (j-1 < ans), update 'ans'.
            if (j - 1 < ans) {
                ans = j - 1;
            }

            // Since obstacles are sorted by column implicitly by Object.keys (or numeric order here),
            // the first relevant obstacle found is the one that limits the path.
            break;
        }

        // Move to the next column for the next row's check.
        x++;
    }

    return ans; // Return the final calculated maximum reachable width.

} // End of main function.