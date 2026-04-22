var GET = (

  /*
   * This is a self-executing anonymous function
   * that sets up a custom input parsing utility.
   * It returns a factory function `f` to create new
   * parser instances.
   */
  function () {

    // The factory function, creates a new parser instance.
    function f(s) {
      return new g(s);
    }

    // The constructor for the parser object `g`.
    // It takes a string `s` (likely the entire input).
    function g(s) {
      /*
       * The input string is trimmed, then split by newlines
       * to create an array of lines. This is stored in `_s`.
       * `_y` acts as a line pointer, initialized to 0.
       */
      this._s = s.trim().split("\n");
      this._y = 0;
    }


    /*
     * Prototype method `a` (read "atom" or "single value").
     * This method reads a single value from the current line.
     * If `f` is true, it returns the value as a string;
     * otherwise, it attempts to convert it to a number.
     */
    g.prototype.a = function (f) {
      var s = this._s,
        y = this._y,
        r; // Declare variables

      /*
       * If the current line `s[y]` hasn't been processed yet
       * (i.e., it's still a single string), split it by spaces
       * and reverse the order. This makes `pop()` extract values
       * from the "left" of the original line.
       */
      if (typeof s[y] === "string") {
        s[y] = s[y].split(" ").reverse();
      }

      r = s[y].pop(); // Get the last element (which was the first in original order)

      /*
       * If the current line is now empty after popping,
       * increment the line pointer `_y` to move to the next line.
       */
      if (!s[y].length) {
        this._y++;
      }

      /*
       * Return the result. If `f` (format) is true, return as string `r`.
       * Otherwise, convert to number using unary plus `+r`.
       */
      return f ? r : +r;
    };


    /*
     * Prototype method `l` (read "line").
     * Reads an entire line and splits it by spaces.
     * Increments the line pointer `_y`.
     * If `f` is true, returns array of strings; otherwise, array of numbers.
     */
    g.prototype.l = function (f) {
      var s = this._s[this._y++].split(" "); // Get line, split, and advance pointer
      /*
       * Map each element to a number if `f` is false.
       */
      return f ? s : s.map(a => +a);
    };


    /*
     * Prototype method `m` (read "matrix").
     * Reads `n` lines, treating each as a row in a matrix.
     * Each row is split by spaces.
     * If `f` is true, returns a matrix of strings; otherwise, matrix of numbers.
     */
    g.prototype.m = function (n, f) {
      /*
       * Slice `n` lines from `_s`, map each to an array of strings
       * by splitting by space. `_y` is advanced by `n`.
       */
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

      /*
       * If `f` is false, further map each element in each sub-array to a number.
       */
      return f ? r : r.map(a => a.map(a => +a));
    };


    /*
     * Prototype method `r` (read "rows" or "raw").
     * Reads `n` lines without further splitting each line.
     * If `f` is true, returns an array of raw string lines;
     * otherwise, attempts to convert each line to a number.
     */
    g.prototype.r = function (n, f) {
      var r = this._s.slice(this._y, this._y += n); // Slice `n` lines, advance `_y`
      return f ? r : r.map(a => +a); // Map to numbers if `f` is false
    };

    return f; // Return the factory function
  }
)(); // End of self-executing function definition and call


// Initialize the input parser `o` by reading from standard input.
// This uses Node.js `fs` module to read the entire file.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * `xArray` function: A utility to dynamically create multi-dimensional arrays.
 * It takes a value `v` and then uses `arguments` to determine array dimensions.
 * Example: `xArray(0, 2, 3)` creates a 2x3 array filled with 0s.
 * It builds a string representation of array creation and then `eval`uates it.
 */
function xArray(v) {
  var a = arguments, // Get all arguments
    l = a.length, // Get number of arguments
    // Start building the array creation string from the innermost dimension
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards through dimensions to wrap the string
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  return eval(r); // Evaluate the constructed string to create the array
}


// Declare global variables for coordinates and state.
// `k` seems to be a step size or constraint.
// `x`, `y` are target coordinates.
// `xx`, `yy` are current coordinates, initialized to origin (0,0).
var k,
  x,
  y,
  xx = 0,
  yy = 0;


// Execute the main logic and print its return value to console.
console.log(main());


/**
 * The main function orchestrates the pathfinding logic.
 * It reads initial parameters, applies conditions, and finds a path.
 * @returns {string|number} Either 0, -1, or a newline-separated string of coordinates.
 */
function main() {

  // Read initial parameters from the input parser.
  k = o.a(); // Step size / constraint
  x = o.a(); // Target X coordinate
  y = o.a(); // Target Y coordinate


  // Initial edge cases:
  // If target is (0,0), no moves needed.
  if (x === 0 && y === 0) {
    return 0;
  }

  // If `k` is even and the sum `x+y` is odd, it's impossible to reach.
  // This is because an even `k` always preserves the parity of `x+y`.
  if (k % 2 === 0 && (x + y) % 2) {
    return -1;
  }


  var ans = [], // Array to store the path coordinates.
    k2 = k * 2; // Double the step size, used in calculations.

  var l = mh(); // Calculate initial Manhattan distance from (xx,yy) to (x,y).


  // Loop to make moves until the Manhattan distance `l` is within `k2`
  // and has the same parity as `k2`.
  while (l > k2 || l % 2) {
    ans.push(near()); // Add a "near" move to the path.
    l = mh(); // Recalculate Manhattan distance after the move.
  }


  // After the loop, `l` is either `k`, `k+2`, `k+4`, etc., up to `k2`.
  // Or it could be `0`, `2`, `4`, etc. up to `k2`.

  // Check if the current Manhattan distance `l` is a multiple of `k`.
  if (l % k === 0) {
    // If it is, keep making "near" moves until the target is reached (mh() returns 0).
    while (mh()) {
      ans.push(near());
    }
  } else {
    // If `l` is not a multiple of `k`, a more complex adjustment is needed.
    // This section likely handles cases where `l` is `k+1`, `k+3`, etc.,
    // or `1`, `3`, `5`, etc. when `k` is odd.

    var xxx = x, // Store original target x
      yyy = y; // Store original target y

    /*
     * Calculate `z`, which represents half the "extra" distance that needs to be covered
     * beyond the straight-line Manhattan distance, to align with the `k` step.
     * This is derived from `k2 - current_manhattan_distance`.
     */
    var z = (k2 - Math.abs(xx - x) - Math.abs(yy - y)) / 2;

    // Adjust target coordinates `x` and `y` temporarily for the next "near" move.
    // The logic here tries to bring `x` and `y` closer to `xx` and `yy`
    // by `z` or `k-z` depending on which coordinate has a larger difference.
    if (Math.abs(xx - x) >= Math.abs(yy - y)) {
      // If X difference is greater or equal
      if (yy < y) {
        y = yy - z; // Move y towards yy
      } else {
        y = yy + z; // Move y away from yy
      }

      if (xx < x) {
        x = xx + k - z; // Move x towards xx, considering k
      } else {
        x = xx - k + z; // Move x away from xx, considering k
      }
    } else {
      // If Y difference is greater
      if (xx < x) {
        x = xx - z; // Move x towards xx
      } else {
        x = xx + z; // Move x away from xx
      }

      if (yy < y) {
        y = yy + k - z; // Move y towards yy, considering k
      } else {
        y = yy - k + z; // Move y away from yy, considering k
      }
    }

    ans.push(near()); // Make the adjusted "near" move.

    x = xxx, y = yyy; // Restore original target coordinates.

    ans.push(near()); // Make another "near" move with restored targets.
  }


  // Output the number of steps taken.
  console.log(ans.length);

  // Return the path as a newline-separated string.
  return ans.join("\n");
}


/**
 * Calculates the Manhattan distance between current position (xx, yy)
 * and target position (x, y).
 * @returns {number} The Manhattan distance.
 */
function mh() {
  return Math.abs(xx - x) + Math.abs(yy - y);
}


/**
 * Performs a "near" move, bringing the current position (xx, yy)
 * closer to the target (x, y) by a step of `k`.
 * It prioritizes moving along the X-axis first, then the Y-axis
 * with any remaining step `t`.
 * @returns {string} The new current coordinates as "xx yy".
 */
function near() {

  var t = k; // `t` represents the remaining step size for this move.

  // Try to move along the X-axis first.
  if (x < xx) {
    // Target X is to the left of current X.
    if (t >= xx - x) {
      // If `t` is large enough to reach or pass target X.
      t -= xx - x; // Decrease `t` by the distance moved.
      xx = x; // Set current X to target X.
    } else {
      // If `t` is not large enough, move `t` units towards target X.
      xx -= t;
      t = 0; // All step used for X-movement.
    }
  } else if (x > xx) {
    // Target X is to the right of current X.
    if (t >= x - xx) {
      // If `t` is large enough to reach or pass target X.
      t -= x - xx; // Decrease `t` by the distance moved.
      xx = x; // Set current X to target X.
    } else {
      // If `t` is not large enough, move `t` units towards target X.
      xx += t;
      t = 0; // All step used for X-movement.
    }
  }


  // If there's any step `t` remaining, use it to move along the Y-axis.
  if (t) {
    if (y < yy) {
      // Target Y is below current Y.
      yy -= t; // Move `t` units down.
    } else {
      // Target Y is above or at current Y.
      yy += t; // Move `t` units up.
    }
  }

  // Return the new current coordinates as a space-separated string.
  return xx + " " + yy;
}