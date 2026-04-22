var GET = (function() {
  // This IIFE (Immediately Invoked Function Expression) sets up a utility
  // for parsing input data from a multi-line string.
  /*
   * The returned function 'f' is the public interface to create a new parser instance.
   */
  function f(s) {
    return new g(s); // Creates and returns a new instance of the internal parser 'g'.
  }

  // The internal parser class 'g' handles the actual input string processing.
  function g(s) {
    /*
     * Initialize the internal state:
     * - _s: An array of strings, where each element is a line from the input.
     *       The input string 's' is first trimmed of leading/trailing whitespace,
     *       then split by newline characters.
     */
    this._s = s.trim().split("\n");
    // - _y: The current line index being processed. Starts at 0.
    this._y = 0;
  }

  // Prototype method 'a' for reading a single item from the current line.
  g.prototype.a = function(f) {
    var s = this._s, // Reference to the array of input lines.
      y = this._y, // Current line index.
      r; // Variable to hold the retrieved item.

    // If the current line (s[y]) is still a single string, it means it hasn't been
    // split into individual items yet. Do that now.
    if (typeof s[y] === "string") {
      s[y] = s[y].split(" ").reverse(); // Split by spaces, then reverse for efficient `pop()`.
    }

    r = s[y].pop(); // Extract the last item from the (reversed) current line.

    // If the current line is now empty after popping, advance to the next line.
    if (!s[y].length) {
      this._y++;
    }

    // If 'f' (a boolean flag) is true, return the item as a string.
    // Otherwise, convert it to a number using the unary plus operator.
    return f ? r : +r;
  };

  // Prototype method 'l' for reading an entire line of items.
  g.prototype.l = function(f) {
    // Get the current line, increment the line pointer, and split the line by spaces.
    var s = this._s[this._y++].split(" ");

    // If 'f' is true, return the array of strings.
    // Otherwise, map each string element to its numeric equivalent.
    return f ? s : s.map(a => +a);
  };

  // Prototype method 'm' for reading a matrix (multiple lines, multiple items per line).
  g.prototype.m = function(n, f) {
    // Slice 'n' lines from the input array, advancing the line pointer by 'n'.
    // Then, for each sliced line, split it by spaces.
    var r = this._s.slice(this._y, (this._y += n)).map(a => a.split(" "));

    // If 'f' is true, return the 2D array of strings.
    // Otherwise, map each inner array's elements to numbers.
    return f ? r : r.map(a => a.map(a => +a));
  };

  // Prototype method 'r' for reading 'n' raw lines.
  g.prototype.r = function(n, f) {
    // Slice 'n' lines from the input array, advancing the line pointer by 'n'.
    var r = this._s.slice(this._y, (this._y += n));

    // If 'f' is true, return the array of raw strings.
    // Otherwise, map each string element to its numeric equivalent.
    return f ? r : r.map(a => +a);
  };

  return f; // The IIFE returns the public constructor function 'f'.
})();

// Initialize the input parser 'o' by reading data from standard input.
// It uses Node.js 'fs' module to read the file synchronously.
var o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specified value 'v'.
 * The dimensions of the array are provided as subsequent arguments.
 *
 * Example: xArray(0, 2, 3) will create a 2x3 array filled with zeros: [[0,0,0],[0,0,0]]
 *
 * @param {any} v The value to initialize array elements with.
 * @param {...number} dimensions The dimensions of the array (e.g., length of each axis).
 * @returns {Array} The generated multi-dimensional array.
 */
function xArray(v) {
  var a = arguments, // Access all arguments passed to the function.
    l = a.length, // Get the total number of arguments.
    // Start building the string representation of the array creation.
    // This creates the innermost array, using the last dimension argument.
    r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

  // Loop backwards through the remaining dimension arguments.
  while (--l) {
    // Wrap the existing 'r' (innermost array creation) with a new array creation
    // for the next outer dimension.
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
  }
  // Evaluate the dynamically constructed string to execute the array creation.
  return eval(r);
}

// This IIFE encapsulates the PriorityQueue implementation.
var PriorityQueue = (function() {
  // Public factory function to create a new PriorityQueue instance.
  function f() {
    return new PriorityQueue();
  }

  // The actual constructor for the PriorityQueue class.
  function PriorityQueue() {
    // The internal heap is an array that stores elements.
    this.heap = [];
  }

  // Adds an element 'x' to the priority queue, maintaining the min-heap property.
  PriorityQueue.prototype.push = function(x) {
    var h = this.heap, // Reference to the heap array.
      i = h.length++, // Index for the new element, then increment heap length.
      j; // Variable to store the parent index.

    // Bubble up the new element 'x' from the bottom to its correct position.
    while (i) {
      j = (i - 1) >> 1; // Calculate the parent index using bitwise right shift for integer division by 2.
      if (h[j][0] <= x[0]) break; // If parent is smaller or equal, 'x' is in its correct place.
      h[i] = h[j], i = j; // Move parent down to child's position, then move 'i' to parent's position.
    }
    h[i] = x; // Place the new element 'x' at its final position.
  };

  // Removes and returns the smallest element (root) from the priority queue.
  PriorityQueue.prototype.pop = function() {
    var h = this.heap, // Reference to the heap array.
      r = h[0], // The smallest element (root) to be returned.
      x = h.pop(), // Remove the last element; it will be used to fill the root's empty spot.
      l = h.length, // Current length of the heap after `pop()`.
      i = 0, // Index for the element being bubbled down (starts at root).
      j; // Variable to store child index.

    // If the heap is empty after removing the last element, simply return the root.
    if (l === 0) return r;

    var k = l >> 1; // Index of the last non-leaf node (potential parent).
    l--; // Adjust length for boundary checks in the loop (last element is already 'x').

    // Bubble down the element 'x' (which was the last element) from the root.
    while (i < k) {
      j = (i << 1) + 1; // Calculate the index of the left child.

      // Check if a right child exists and if it's smaller than the left child.
      if (j < l && h[j + 1][0] < h[j][0]) {
        j++; // If so, use the right child for comparison.
      }

      if (x[0] <= h[j][0]) break; // If 'x' is smaller or equal to the smallest child, its correct position is found.

      h[i] = h[j], i = j; // Move the child up to the current position, then move 'i' to the child's position.
    }
    h[i] = x; // Place the element 'x' at its final position.
    return r; // Return the original smallest element.
  };

  return f; // Return the public factory function 'f'.
})();

// Execute the main logic of the program and print its result to the console.
console.log(main());

/**
 * The main function contains the core algorithm to solve the problem.
 * It processes input arrays 'a' and 'b' to find the minimum operations
 * required to transform 'b' into 'a' under specific rules.
 * @returns {number} The minimum number of operations, or -1 if impossible.
 */
function main() {
  // Read the integer 'n', representing the size of the arrays.
  var n = o.a();
  // Read array 'a' from input.
  var a = o.l();
  // Read array 'b' from input.
  var b = o.l();

  // Initialize a priority queue. This will store indices of elements in 'b'
  // that still need to be reduced, prioritized by their current value (largest first).
  var pq = PriorityQueue();

  // First pass: Populate the priority queue and perform initial checks.
  for (var i = 0; i < n; i++) {
    // If b[i] is already equal to a[i], no operations are needed for this element.
    if (a[i] === b[i]) continue;
    // If b[i] is already smaller than a[i], it's impossible to reach a[i] by subtraction.
    // The problem implies we can only decrease b[i].
    if (a[i] > b[i]) return -1;
    // If b[i] > a[i], push it to the priority queue.
    // We store [-b[i], i] to make it a max-priority queue based on b[i]
    // (since the default PQ is min-heap, we negate values to get max behavior).
    pq.push([-b[i], i]);
  }

  // Initialize the total count of operations.
  var ans = 0;

  // Process elements from the priority queue until it's empty.
  while (pq.heap.length) {
    var t = pq.pop(); // Get the element with the largest b[j] that still needs reduction.
    var j = t[1]; // Extract the index of this element.

    // Before processing, check if this element is already handled or invalid.
    // If b[j] has already been reduced to a[j] or less due to other operations,
    // this entry might be stale. The subsequent checks will handle it.
    if (a[j] === b[j]) continue; // If equal, this element is already done.
    if (a[j] > b[j]) return -1; // If it's already too small, impossible.

    // Calculate the sum of b[j]'s neighbors (circularly).
    // (j + n - 1) % n gives the index of the left neighbor.
    // (j + 1) % n gives the index of the right neighbor.
    var y = b[(j + n - 1) % n] + b[(j + 1) % n];

    // If the sum of neighbors is 0, 'b[j]' cannot be reduced by neighbors.
    // This implies an impossible state if b[j] > a[j].
    if (y === 0) return -1;

    // Calculate 'z', the number of times 'y' needs to be subtracted from b[j].
    // This is integer division: (b[j] - a[j]) / y. The `|0` truncates to an integer.
    var z = ((b[j] - a[j]) / y) | 0;

    // If 'z' is 0, it means b[j] cannot be reduced by 'y' any further to reach 'a[j]'
    // (either b[j] is too close to a[j], or it's already invalid).
    // If b[j] > a[j] and z is 0, it's an impossible scenario.
    if (z === 0) return -1;

    // Add 'z' to the total operations count.
    ans += z;
    // Perform the subtraction on b[j].
    b[j] -= y * z;

    // After modification, re-check the state of b[j].
    if (a[j] === b[j]) continue; // If now equal, this element is done.
    if (a[j] > b[j]) return -1; // If it went too far, impossible.

    // If b[j] is still greater than a[j], it means more operations are needed.
    // Re-add it to the priority queue with its updated value.
    pq.push([-b[j], j]);
  }

  // If the priority queue is empty and no impossible state was encountered,
  // return the total number of operations.
  return ans;
}