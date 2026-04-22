var GET = ( /* This is an Immediately Invoked Function Expression (IIFE) */
    function () {

        /* Inner function 'f' acts as a factory for 'g' objects. */
        function f(s) {
            return new g(s);
        }

        /* Constructor function 'g' for processing input strings. */
        function g(s) {
            // Store the processed string array and current line index.
            this._s = s.trim().split("\n"); // Trim whitespace and split by newlines.
            this._y = 0; // Initialize line pointer to the first line.
        }

        /* Method 'a' (presumably 'advance' or 'atom') to read a single item. */
        g.prototype.a = function (f) {
            // Get reference to the string array and current line index.
            var s = this._s,
                y = this._y,
                r; // 'r' will hold the result.

            /* If the current line hasn't been processed into an array, do it now. */
            if (typeof s[y] === "string") {
                s[y] = s[y].split(" ").reverse(); // Split by spaces and reverse for stack-like pop.
            }

            r = s[y].pop(); // Pop the last element from the current line.

            /* If the current line is now empty, advance to the next line. */
            if (!s[y].length) {
                this._y++;
            }

            // Return either the raw string 'r' or its numeric conversion.
            return f ? r : +r;
        };

        /* Method 'l' (presumably 'line') to read an entire line. */
        g.prototype.l = function (f) {
            // Get the current line, split by spaces, and increment the line pointer.
            var s = this._s[this._y++].split(" ");

            // Return either the array of strings or an array of numbers.
            return f ? s : s.map(a => +a);
        };

        /* Method 'm' (presumably 'matrix') to read 'n' lines as a 2D array. */
        g.prototype.m = function (n, f) {
            // Slice 'n' lines, split each by spaces, and store in 'r'.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // Return either the 2D array of strings or a 2D array of numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        /* Method 'r' (presumably 'rows' or 'raw') to read 'n' lines directly. */
        g.prototype.r = function (n, f) {
            // Slice 'n' raw lines and increment the line pointer.
            var r = this._s.slice(this._y, this._y += n);

            // Return either the array of strings or an array of numbers.
            return f ? r : r.map(a => +a);
        };

        // The IIFE returns the 'f' function, which is used to create 'g' instances.
        return f;
    }
)(); // End of GET IIFE definition.


// Initialize an 'o' object using GET to read from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Function xArray: Dynamically creates a multi-dimensional array.
 *
 * @param v The value to fill the innermost array with.
 * @param ...args The dimensions of the array (e.g., xArray(0, 2, 3) for a 2x3 array of zeros).
 * @returns A multi-dimensional array initialized with the specified value.
 */
function xArray(v) {
    var a = arguments, // Get all arguments passed to the function.
        l = a.length, // Get the total number of arguments.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation.

    // Loop to construct outer array definitions based on dimensions.
    while (--l) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}


// Global variables for the problem.
var k, // A number read from input.
    x, // Target X coordinate.
    y, // Target Y coordinate.
    xx = 0, // Current X coordinate, initialized to 0.
    yy = 0; // Current Y coordinate, initialized to 0.


// Main execution block: call 'main' and print its result to console.
console.log(main());


/**
 * main function: Orchestrates the problem-solving logic.
 * Reads input, performs calculations, and returns the final answer string.
 */
function main() {
    // Read initial values for k, x, and y from the input stream.
    k = o.a();
    x = o.a();
    y = o.a();

    // Base case: If target is (0,0), no moves needed.
    if (x === 0 && y === 0) {
        return 0;
    }

    // Check for impossible scenarios based on parity.
    // If k is even, and the sum (x+y) is odd, it's impossible to reach.
    if (k % 2 === 0 && (x + y) % 2) {
        return -1;
    }

    var ans = []; // Array to store the path (coordinates of moves).
    var l = mh(0, 0); // Calculate Manhattan distance from (0,0) to target (x,y).

    /*
     * If the initial Manhattan distance is not a multiple of k,
     * it means we might need a special initial move.
     */
    if (l % k !== 0) {
        // If the remainder of l/k is odd, we need one 'solve' operation.
        if (l % k % 2 === 1) {
            ans.push(solve()); // Perform one move and record it.
        }

        // Recalculate 'l' based on current position and k.
        l = mh(xx, yy) % k / 2;

        // Adjust 'l' if 'k' is even.
        if (k % 2 === 0) {
            l = k - l;
        }

        // Determine the direction of the initial special move based on coordinates.
        if (Math.abs(xx - x) >= l) {
            // Move primarily along X-axis.
            if (xx < x) {
                xx += l;
            } else {
                xx -= l;
            }

            // Adjust Y-axis for the remaining 'k-l' distance.
            if (yy < y) {
                yy -= k - l;
            } else {
                yy += k - l;
            }
        } else {
            // Move primarily along Y-axis.
            if (yy < y) {
                yy += l;
            } else {
                yy -= l;
            }

            // Adjust X-axis for the remaining 'k-l' distance.
            if (xx < x) {
                xx -= k - l;
            } else {
                xx += k - l;
            }
        }
        ans.push(xx + " " + yy); // Record the result of this special move.
    }

    // Continue performing 'solve' operations until the target is reached (Manhattan distance is 0).
    while (mh(xx, yy)) {
        ans.push(solve()); // Perform a move and record it.
    }

    console.log(ans.length); // Output the total number of moves.
    return ans.join("\n"); // Return the sequence of moves as a newline-separated string.
}


/**
 * mh function: Calculates the Manhattan distance between current position (a,b) and target (x,y).
 *
 * @param a Current X coordinate.
 * @param b Current Y coordinate.
 * @returns The Manhattan distance.
 */
function mh(a, b) {
    return Math.abs(a - x) + Math.abs(b - y);
}


/**
 * vec function: Determines the direction vector component.
 *
 * @param from Starting coordinate.
 * @param to Target coordinate.
 * @returns 1 if 'from' is less than 'to', -1 if 'from' is greater than 'to', 0 if equal.
 */
function vec(from, to) {
    var t = from - to; // Calculate the difference.
    return t > 0 ? 1 : t < 0 ? -1 : 0; // Return 1, -1, or 0 based on difference.
}


/**
 * solve function: Performs one move of length 'k' towards the target (x,y).
 * Prioritizes moving along the X-axis first, then Y-axis if 't' (remaining move length) is left.
 * Updates global 'xx' and 'yy' coordinates.
 *
 * @returns A string representing the new (xx, yy) coordinates after the move.
 */
function solve() {
    var t = k; // Initialize remaining move length to 'k'.

    // Attempt to move along the X-axis.
    if (x !== xx) {
        if (x < xx) {
            // Target X is to the left.
            if (t >= xx - x) {
                t -= xx - x; // Use up 't' to reach target X.
                xx = x; // Set current X to target X.
            } else {
                xx -= t; // Move 't' units left.
                t = 0; // All 't' used.
            }
        } else { // x > xx
            // Target X is to the right.
            if (t >= x - xx) {
                t -= x - xx; // Use up 't' to reach target X.
                xx = x; // Set current X to target X.
            } else {
                xx += t; // Move 't' units right.
                t = 0; // All 't' used.
            }
        }
    }

    // If there's remaining move length 't', attempt to move along the Y-axis.
    if (t) {
        if (y < yy) {
            yy -= t; // Target Y is below, move 't' units down.
        } else { // y >= yy
            yy += t; // Target Y is above or same, move 't' units up.
        }
    }

    return xx + " " + yy; // Return the new coordinates as a string.
}