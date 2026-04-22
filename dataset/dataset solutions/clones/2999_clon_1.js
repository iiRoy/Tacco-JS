/* This file contains a solution to a programming problem. */
/* It includes a custom input reader and array utility. */

var GET = (

  function () {
    // Inner function 'f' acts as the public interface for the GET module.
    function f(s) {
      return new g(s);
    }


    // Constructor function 'g' for the input reader object.
    function g(s) {
      // Stores lines of input, trimmed and split.
      this._s = s.trim().split("\n");
      // Current line index.
      this._y = 0;
    }


    // Method 'a' to read a single item (atom).
    g.prototype.a = function (f) {
      var s = this._s,
        y = this._y,
        r; // Declare variables s, y, r
      // If the current line hasn't been processed into an array of items yet,
      // split it by space and reverse to allow 'pop' to read from the front.
      if (typeof s[y] === "string") {
        s[y] = s[y].split(" ").reverse();
      }

      r = s[y].pop(); // Get the last item (which was originally the first).

      // If the current line is now empty, advance to the next line.
      if (!s[y].length) {
        this._y++;
      }

      // Return the item. If 'f' (flag) is true, return as string; otherwise, convert to number.
      return f ? r : +r;
    };


    // Method 'l' to read a whole line of items.
    g.prototype.l = function (f) {
      // Get the current line, increment line index, and split by space.
      var s = this._s[this._y++].split(" ");
      // Return the array of items. If 'f' is true, return as strings; otherwise, convert all to numbers.
      return f ? s : s.map(a => +a);
    };


    // Method 'm' to read a block of 'n' lines, each line an array of items.
    g.prototype.m = function (n, f) {
      // Slice 'n' lines from the input, then map each line to an array of items (split by space).
      var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));
      // Return the 2D array. If 'f' is true, return as strings; otherwise, convert all items to numbers.
      return f ? r : r.map(a => a.map(a => +a));
    };


    // Method 'r' to read a block of 'n' lines, each line as a single item.
    g.prototype.r = function (n, f) {
      // Slice 'n' lines directly from the input.
      var r = this._s.slice(this._y, this._y += n);
      // Return the array. If 'f' is true, return as strings; otherwise, convert all to numbers.
      return f ? r : r.map(a => +a);
    };


    // The IIFE returns the 'f' function, making it the public interface of GET.
    return f;

  }

)(); // Execute the Immediately Invoked Function Expression.


// Initialize the input reader 'o' by reading from standard input.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));


/**
 * xArray creates a multi-dimensional array initialized with a given value.
 *
 * @param {any} v - The value to initialize the innermost array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} A multi-dimensional array.
 */
function xArray(v) {
  var a = arguments,
    l = a.length,
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})"; // Innermost array creation string.

  // Loop to build up the nested Array.map structure for multi-dimensions.
  while (--l) {
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }

  // Use eval to dynamically create the array structure.
  return eval(r);
}


// Call the main function and print its result to the console.
console.log(main());


/**
 * Main function to solve the problem.
 * This seems to implement a breadth-first search (BFS) or similar graph traversal
 * to find the diameter or a related property of a tree.
 */
function main() {
  // Read the number of nodes 'n'.
  var n = o.a();

  // Initialize 'u' as an array of 'n' elements, all set to 1.
  // This array likely acts as a visited tracker for graph traversal.
  var u = xArray(1, n);

  // Initialize 'e' as an array of 'n' empty arrays.
  // This will represent the adjacency list for the graph.
  var e = xArray("[]", n);

  // Loop to read edges and build the adjacency list.
  // Edges are 0-indexed internally after mapping 'a=>a-1'.
  for (var i = 1; i < n; i++) {
    // Read a line representing an edge (two nodes).
    var t = o.l().map(a => a - 1);
    // Add the edge to the adjacency list (undirected graph).
    e[t[0]].push(t[1]);
    e[t[1]].push(t[0]);
  }

  // --- First Graph Traversal (BFS) ---
  // This part likely finds one endpoint of the diameter.

  var q = [0],
    q2 = [],
    v; // q: current level queue, q2: next level queue, v: last visited node.

  u[0] = 0; // Mark the starting node (0) as visited.

  // Loop while there are nodes in either queue.
  while (q.length || q2.length) {
    // If the current level queue is empty, advance to the next level.
    if (q.length === 0) {
      /* The 'l' variable is not used here but is re-declared later.
         This might be a leftover or a variable intended for a different purpose
         in a previous version of the code. */
      l++; // Increment level count (this 'l' is local to this block, shadowed later).
      q = q2; // Move nodes from next level to current level.
      var q2 = []; // Reset the next level queue.
    }

    var x = q.pop(); // Get a node from the current level queue.
    v = x; // Keep track of the last node popped from the queue.

    // Iterate through neighbors of the current node 'x'.
    for (var i = 0; i < e[x].length; i++) {
      // If the neighbor 'e[x][i]' has not been visited (u[neighbor] is 1).
      if (u[e[x][i]]) {
        q2.push(e[x][i]); // Add neighbor to the next level queue.
        u[e[x][i]] = 0; // Mark neighbor as visited.
      }
    }
  }

  // --- Second Graph Traversal (BFS) ---
  // This part starts a new BFS from the 'v' (furthest) node found in the first BFS
  // to find the actual diameter length.

  // Initialize queues and level counter for the second BFS.
  var q = [v],
    q2 = [],
    l = 0;

  // Reset the visited array 'u'.
  u = xArray(1, n);
  u[v] = 0; // Mark the new starting node 'v' as visited.

  // Loop while there are nodes in either queue.
  while (q.length || q2.length) {
    // If the current level queue is empty, advance to the next level.
    if (q.length === 0) {
      l++; // Increment the level count (this 'l' now tracks the BFS depth).
      q = q2; // Move nodes from next level to current level.
      var q2 = []; // Reset the next level queue.
    }

    var x = q.pop(); // Get a node from the current level queue.

    // Iterate through neighbors of the current node 'x'.
    for (var i = 0; i < e[x].length; i++) {
      // If the neighbor 'e[x][i]' has not been visited (u[neighbor] is 1).
      if (u[e[x][i]]) {
        q2.push(e[x][i]); // Add neighbor to the next level queue.
        u[e[x][i]] = 0; // Mark neighbor as visited.
      }
    }
  }

  // The problem's answer depends on the parity of 'l' (the diameter length).
  // If 'l' modulo 3 is 1, return "Second"; otherwise, return "First".
  return l % 3 === 1 ? "Second" : "First";
}