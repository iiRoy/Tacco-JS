/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been modified or added to provide a visually different appearance.
 */

var GET = (

  function () {

    // Helper function 'f' to create a new instance of 'g'
    function f (s) {
      return new g(s);
    }

    // Constructor function 'g' for parsing input
    function g (s) {
      /*
       * The input string 's' is trimmed and split by newline characters.
       * This creates an array of lines.
       */
      this._s = s.trim().split("\n");
      // 'this._y' serves as a line pointer or index.
      this._y = 0;
    }

    // Prototype method 'a' for 'g': reads an item from the current line
    g.prototype.a = function (f) {
      // 's' holds the array of lines
      var s = this._s,
        // 'y' is the current line index
        y = this._y,
        // 'r' will store the result
        r;

      // If the current line hasn't been processed into an array yet (it's a string)
      if (typeof s[y] === "string") {
        // Split the line by spaces and reverse it, so 'pop()' gets the first element
        s[y] = s[y].split(" ").reverse();
      }

      // Pop the last element (which was originally the first due to reverse)
      r = s[y].pop();

      // If the current line is now empty, advance to the next line
      if (!s[y].length) {
        this._y++;
      }

      // Return 'r' as a string if 'f' is true, otherwise convert to number
      return f ? r : +r;
    };

    // Prototype method 'l' for 'g': reads an entire line
    g.prototype.l = function (f) {
      // Get the current line, increment the line pointer, and split by spaces
      var s = this._s[this._y++].split(" ");

      // Return as strings if 'f' is true, otherwise map all elements to numbers
      return f ? s : s.map(a => +a);
    };

    // Prototype method 'm' for 'g': reads a matrix (multiple lines)
    g.prototype.m = function (n, f) {
      /*
       * Slice 'n' lines from the input, increment the line pointer,
       * and map each line to an array of strings (split by spaces).
       */
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

      // Return as 2D array of strings if 'f' is true, otherwise convert all elements to numbers
      return f ? r : r.map(a => a.map(a => +a));
    };

    // Prototype method 'r' for 'g': reads a raw block of lines
    g.prototype.r = function (n, f) {
      /*
       * Slice 'n' lines from the input, increment the line pointer.
       * These lines are kept as-is (strings).
       */
      var r = this._s.slice(this._y, this._y += n);

      // Return as array of strings if 'f' is true, otherwise convert all elements to numbers
      return f ? r : r.map(a => +a);
    };

    // The IIFE returns the 'f' function, which is assigned to 'GET'.
    return f;
  }
)(); // Immediately Invoked Function Expression ends here.


// Initialize an input parser 'o' using 'GET'
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * Function 'xArray' creates multi-dimensional arrays initialized with a value.
 * 'v' is the initial value, subsequent arguments define dimensions.
 * Example: xArray("[]", 3, 2) creates a 3x2 array of empty arrays.
 */
function xArray (v) {
  // 'arguments' object contains all parameters passed to the function
  var a = arguments,
    // 'l' is the number of arguments (dimensions + initial value)
    l = a.length,
    // 'r' is the string representation of the array creation code
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop to build nested Array.map calls for multiple dimensions
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Evaluate the constructed string to create the array
  return eval(r);
}


// Global variables for graph dimensions and the graph itself
var n, m, g;


// Execute the main function and print its result to the console
console.log(main());


// Main function: Orchestrates the graph processing and cycle detection
function main () {
  // Read 'n' (number of nodes) and 'm' (number of edges) from input
  n = o.a();
  m = o.a();

  // Read 'm' edges, each represented as [u, v]
  var a = o.m(m);

  // Initialize the adjacency list 'g' as an array of empty arrays
  g = xArray("[]", n);

  // Populate the adjacency list based on the input edges
  for (var i = 0; i < m; i++) {
    // Adjust to 0-indexed nodes and add 'v' to 'u's adjacency list
    g[a[i][0] - 1].push(a[i][1] - 1);
  }

  // 'ans' will store the shortest cycle found, initialized to a length that's impossible for a real cycle
  var ans = Array(n + 1);

  // Iterate through each node as a potential starting point for a cycle
  for (i = 0; i < n; i++) {
    // Try to find a cycle starting from node 'i'
    var u = solve(i);

    // If a cycle 'u' is found and it's shorter than the current 'ans'
    if (u && u.length < ans.length) {
      ans = u; // Update 'ans' with the new shortest cycle
    }
  }

  // If 'ans' still has its initial length, no cycle was found
  if (ans.length === n + 1) {
    return -1; // Indicate no cycle
  }

  // Print the length of the shortest cycle
  console.log(ans.length);

  // Return the cycle path, joined by newline characters
  return ans.join("\n");
}


/*
 * Function 'solve': Finds the shortest cycle containing node 'v' using BFS.
 * Returns the cycle path as an array of node numbers (1-indexed) or undefined if no cycle.
 */
function solve (v) {
  // 'map' stores the parent of each visited node in the BFS path, initialized to -1
  var map = xArray(-1, n);
  // 'q' is the current level queue for BFS, starting with 'v'
  var q = [v];

  // While there are nodes to process in the current level
  while (q.length) {
    // 'q2' is the queue for the next level
    var q2 = [];

    // Process all nodes in the current level 'q'
    while (q.length) {
      // Dequeue a node 't'
      var t = q.pop();

      // Iterate through all neighbors 'V' of node 't'
      for (var V of g[t]) {
        // If a neighbor 'V' is the starting node 'v', a cycle is found
        if (V === v) {
          // Reconstruct the cycle path
          var res = [V + 1]; // Start with the common node 'v' (1-indexed)
          V = t; // Move back to the parent of 'v' in the cycle

          // Trace back using 'map' until 'v' is reached again
          while (V !== v) {
            res.push(V + 1); // Add current node to path
            V = map[V]; // Move to parent
          }

          // Return the reconstructed cycle path
          return res;
        }

        // If 'V' has already been visited in the current BFS layer, skip it
        if (map[V] !== -1) {
          continue;
        }

        // Mark 'V' as visited and record 't' as its parent
        map[V] = t;
        // Add 'V' to the next level's queue
        q2.push(V);
      }
    }
    // Move to the next level: 'q' becomes 'q2'
    q = q2;
  }
  // If the BFS completes without finding a cycle back to 'v', return nothing
}