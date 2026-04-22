/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes a custom input parsing utility and the main logic.
 */

/*
 * The GET module is an Immediately Invoked Function Expression (IIFE)
 * that provides a flexible way to read input data.
 * It abstracts the process of parsing lines and numbers from a string.
 */
var GET = (function() {

    // --- Private Helper Functions and Classes within GET ---

    // Function 'f' serves as the public entry point for the GET utility.
    function f(s) {
        // It instantiates the 'g' class, which does the actual parsing.
        return new g(s);
    }

    // The 'g' class is the core parser, holding the input state.
    function g(s) {
        // The input string 's' is trimmed and split into an array of lines.
        this._s = s.trim()
                   .split("\n");
        // '_y' is the current line index, initialized to the first line.
        this._y = 0;
    }

    // --- Prototype Methods for the 'g' Parser Class ---

    /*
     * Method 'a': Reads a single value from the current line.
     * It treats the line as a stack of space-separated values.
     * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    g.prototype.a = function(f) {
        var s = this._s, // Reference to the array of input lines.
            y = this._y, // Current line index.
            r;           // Variable to store the extracted value.

        /*
         * If the current line (s[y]) is still a single string,
         * it means it hasn't been processed yet.
         * Split it by spaces and reverse it to allow 'pop' to get the first element.
         */
        if (typeof s[y] === "string") {
            s[y] = s[y].split(" ")
                       .reverse();
        }

        // Pop the last element from the (reversed) current line.
        r = s[y].pop();

        // If the current line array is now empty, increment the line index.
        if (!s[y].length) {
            this._y++;
        }

        // Return the result, converting to number if 'f' is false.
        return f ? r : +r;
    };

    /*
     * Method 'l': Reads an entire line of space-separated values.
     * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    g.prototype.l = function(f) {
        // Get the current line, split it by spaces, and then increment the line index.
        var s = this._s[this._y++]
                       .split(" ");

        // Return the array, mapping to numbers if 'f' is false.
        return f ? s : s.map(a => +a);
    };

    /*
     * Method 'm': Reads 'n' lines, parsing each as a line of space-separated values (matrix).
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns a 2D array of strings; otherwise, of numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing a matrix.
     */
    g.prototype.m = function(n, f) {
        /*
         * Slice 'n' lines from the input array, starting from the current index.
         * The '_y += n' part advances the line index.
         * Each sliced line is then split by spaces.
         */
        var r = this._s.slice(this._y, this._y += n)
                       .map(a => a.split(" "));

        // Return the 2D array, mapping inner values to numbers if 'f' is false.
        return f ? r : r.map(a => a.map(a => +a));
    };

    /*
     * Method 'r': Reads 'n' raw lines.
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - If true, returns an array of strings; otherwise, of numbers.
     * @returns {Array<string|number>} An array of raw line values.
     */
    g.prototype.r = function(n, f) {
        /*
         * Slice 'n' lines from the input array, starting from the current index.
         * The '_y += n' part advances the line index.
         */
        var r = this._s.slice(this._y, this._y += n);

        // Return the array, mapping to numbers if 'f' is false.
        return f ? r : r.map(a => +a);
    };

    // The IIFE returns the public interface function 'f'.
    return f;
})(); // End of GET utility definition


/*
 * Initialize the 'o' parser instance.
 * It reads the entire content of /dev/stdin (standard input) as a UTF-8 string.
 * The 'require("fs")' statement loads the Node.js File System module.
 */
var o = GET(require("fs")
            .readFileSync("/dev/stdin", "utf8"));


/*
 * The program's execution begins here.
 * It calls the 'main' function and prints its return value to the console.
 */
console.log(main());


/**
 * The main function encapsulates the core logic of the problem.
 * It processes input, performs calculations, and returns the final answer.
 *
 * @returns {number} The computed result based on the problem's requirements.
 */
function main() {
    // --- Input Reading ---
    // Read three initial integer values: height 'h', width 'w', and number of obstacles 'n'.
    var h = o.a();
    var w = o.a();
    var n = o.a();

    // --- Data Structure Initialization ---
    /*
     * Create a 2D-like structure 'b' to represent the grid.
     * It's an array of objects, allowing sparse column indexing.
     * The size 'h + 1' is used for 1-based indexing for rows.
     * Each element of the array is initialized as an empty object.
     */
    var b = Array(h + 1)
                .fill(0)
                .map(a => {
                    return {};
                });

    // --- Obstacle Processing ---
    // Loop 'n' times to read and process each obstacle.
    for (var i = 0; i < n; i++) {
        var t = o.l(); // Read obstacle coordinates as an array [col, row].

        // Problem-specific condition: if column is less than row, ignore this obstacle.
        if (t[0] < t[1]) {
            continue; // Skip to the next iteration.
        }

        // Mark the obstacle at the specified [row][col] with a value of 1.
        b[t[1]][t[0]] = 1;
    }

    // --- Boundary Condition Setup ---
    /*
     * For each row from 1 to 'h', set an obstacle at column 'w + 1'.
     * This creates a right-side boundary for pathfinding or calculation.
     */
    for (i = 1; i <= h; i++) {
        b[i][w + 1] = 1;
    }

    // --- Core Algorithm Logic ---

    /*
     * Initialize 'ans' (answer) based on the first obstacle encountered in row 1.
     * Object.keys(b[1])[0] gets the string key of the first property (column) in b[1].
     * Subtract 1 from it to get the effective reachable column.
     */
    var ans = Object.keys(b[1])[0] - 1;

    // Initialize 'x' as the current column being considered, starting from 2.
    var x = 2;

    /*
     * Main loop: Iterate through rows starting from 2,
     * continuing as long as the current row 'i' is within 'ans' and 'h'.
     */
    for (i = 2; i <= ans && i <= h; i++) {
        // Inner loop: Advance 'x' (current column) past any obstacles in the current row 'i'.
        while (b[i][x]) {
            x++;
        }

        /*
         * Iterate through the existing obstacle columns 'j' in the current row 'b[i]'.
         * This loop identifies obstacles that might restrict 'ans'.
         */
        for (var j in b[i]) {
            j = +j; // Convert the column key (string) to a number.

            // If the current 'x' (free column) is already at or past obstacle 'j', ignore it.
            if (x >= j) {
                continue;
            }

            /*
             * If the column before obstacle 'j' (j - 1) is less than the current 'ans',
             * update 'ans' to this new, smaller value.
             * This means a closer obstacle has been found, limiting the path.
             */
            if (j - 1 < ans) {
                ans = j - 1;
            }

            // Once 'ans' is potentially updated by an obstacle, no need to check further obstacles in this row.
            break; // Exit the inner 'for j in b[i]' loop.
        }

        x++; // Move to the next column for the subsequent row's check.

        // If 'x' has exceeded the grid width 'w', it implies we've reached beyond the boundary.
        if (x > w) {
            break; // Exit the main 'for i' loop.
        }
    }

    // Return the final calculated answer.
    return ans;
} // End of main function definition