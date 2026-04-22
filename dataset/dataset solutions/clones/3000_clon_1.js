/*
 * This is a JavaScript module for input processing.
 * It defines a GET object that provides methods
 * for reading various types of data from an input string.
 */
var GET = (function () {
  /**
   * Factory function to create a new input reader instance.
   * @param {string} s - The raw input string.
   * @returns {g} A new input reader object.
   */
  function f(s) {
    return new g(s);
  }

  /**
   * Constructor for the input reader object.
   * Initializes the internal state based on the input string.
   * @param {string} s - The raw input string.
   */
  function g(s) {
    // Split the input string into an array of lines, trimming each line.
    this._s = s.trim().split("\n");

    // Initialize the current line index to 0.
    this._y = 0;
  }

  /**
   * Reads a single item from the current line.
   * If the current line is the first time being accessed, it's reversed and split by space.
   * @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
   * @returns {string|number} The read item.
   */
  g.prototype.a = function (f) {
    var s = this._s, // Reference to the lines array.
      y = this._y, // Current line index.
      r; // Variable to hold the result.

    // If the current line hasn't been processed yet (is still a string),
    // split it by space and reverse it for easy 'pop' access from the front.
    if (typeof s[y] === "string") s[y] = s[y].split(" ").reverse();

    // Pop the last item (which was originally the first item) from the current line.
    r = s[y].pop();

    // If the current line is now empty, advance to the next line.
    if (!s[y].length) this._y++;

    // Return the item, converting to number if 'f' is false.
    return f ? r : +r;
  };

  /**
   * Reads an entire line and splits it into an array of items.
   * Advances the line pointer.
   * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  g.prototype.l = function (f) {
    // Get the current line, increment the line pointer, and split by space.
    var s = this._s[this._y++].split(" ");

    // Return the array, converting items to numbers if 'f' is false.
    return f ? s : s.map((a) => +a);
  };

  /**
   * Reads 'n' lines as a matrix of items.
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of items.
   */
  g.prototype.m = function (n, f) {
    // Slice 'n' lines from the input, update line pointer, and split each line into items.
    var r = this._s.slice(this._y, (this._y += n)).map((a) => a.split(" "));

    // Return the matrix, converting all items to numbers if 'f' is false.
    return f ? r : r.map((a) => a.map((a) => +a));
  };

  /**
   * Reads 'n' lines as an array of strings or numbers.
   * Advances the line pointer by 'n'.
   * @param {number} n - The number of lines to read.
   * @param {boolean} f - If true, returns lines as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  g.prototype.r = function (n, f) {
    // Slice 'n' lines from the input, updating the line pointer.
    var r = this._s.slice(this._y, (this._y += n));

    // Return the array, converting each line to a number if 'f' is false.
    return f ? r : r.map((a) => +a);
  };

  // Return the factory function 'f' as the public interface of the IIFE.
  return f;
})();

// Create an instance of the input reader by reading from /dev/stdin.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array filled with a specified value.
 * The dimensions are provided as arguments after the initial value.
 * @param {*} v - The value to fill the array with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function xArray(v) {
  var a = arguments, // All arguments passed to the function.
    l = a.length, // Number of arguments.
    r =
      "Array(a[" +
      --l +
      "]).fill(0).map(x=>{return " +
      v +
      ";})"; // Inner-most array creation string.

  // Loop to build up the array creation string for higher dimensions.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Evaluate the constructed string to create the array.
  return eval(r);
}

// Execute the main function and print its result to the console.
console.log(main());

/**
 * Main function to solve the problem.
 * This function typically implements the core logic after input parsing.
 * @returns {string} The result of the problem ("First" or "Second").
 */
function main() {
  // Read an integer 'n' from the input.
  var n = o.a();

  // Create an array 'u' of size 'n', initialized with 0s. (Used for visited tracking)
  var u = xArray(0, n);

  // Create an array 'e' of size 'n', where each element is an empty array. (Adjacency list for graph)
  var e = xArray("[]", n);

  // Loop 'n-1' times to read edges and build the adjacency list.
  for (var i = 1; i < n; i++) {
    // Read a line, convert items to numbers, and subtract 1 (0-indexed).
    var t = o.l().map((a) => a - 1);

    // Add connections to the adjacency list for an undirected graph.
    e[t[0]].push(t[1]);
    e[t[1]].push(t[0]);
  }

  // Initialize queues for the first Breadth-First Search (BFS).
  var q = [0], // Current level queue, starting from node 0.
    q2 = [], // Next level queue.
    v; // Variable to store the farthest node found.

  // First BFS: Find the farthest node from node 0.
  while (q.length || q2.length) {
    // If the current level queue is empty, move to the next level.
    if (q.length === 0) {
      // No 'l' variable here for distance counting in this first BFS.
      // It's just to find a node 'v' that is part of a diameter.
      q = q2; // Move nodes from next level to current level.
      var q2 = []; // Reset the next level queue.
    }

    // Dequeue a node from the current level.
    var x = q.pop();

    // If the node has already been visited, skip it.
    if (u[x]) continue;

    // Mark the current node as the farthest found so far.
    v = x;

    // Mark the node as visited.
    u[x] = 1;

    // Add all unvisited neighbors to the next level queue.
    for (var i = 0; i < e[x].length; i++) {
      q2.push(e[x][i]);
    }
  }

  // Initialize queues and distance counter for the second BFS.
  var q = [v], // Start the second BFS from the farthest node 'v' found in the first BFS.
    q2 = [], // Next level queue.
    l = 0; // Distance counter (number of levels).

  // Reset the visited array for the second BFS.
  u = xArray(0, n);

  // Second BFS: Find the maximum distance (diameter) from node 'v'.
  while (q.length || q2.length) {
    // If the current level queue is empty, increment distance and move to the next level.
    if (q.length === 0) {
      l++; // Increment the level/distance.
      q = q2; // Move nodes from next level to current level.
      var q2 = []; // Reset the next level queue.
    }

    // Dequeue a node from the current level.
    var x = q.pop();

    // If the node has already been visited, skip it.
    if (u[x]) continue;

    // Mark the node as visited.
    u[x] = 1;

    // Add all unvisited neighbors to the next level queue.
    for (var i = 0; i < e[x].length; i++) {
      q2.push(e[x][i]);
    }
  }

  // Determine the winner based on the final distance 'l'.
  // If the diameter modulo 3 is 2, "Second" wins; otherwise, "First" wins.
  return l % 3 === 2 ? "Second" : "First";
}