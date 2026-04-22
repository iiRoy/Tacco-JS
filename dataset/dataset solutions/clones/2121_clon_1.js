/*
 * This file contains a JavaScript program designed to solve a specific problem.
 * It includes utility functions for input/output handling and a core algorithm.
 *
 * All identifiers, variable names, function names, operators, and expressions
 * in this version are exactly identical to the original source code.
 *
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * altered to provide a visually distinct, yet functionally equivalent, clone.
 */

// -----------------------------------------------------------------------------
// Input/Output and Utility Functions - DO NOT MODIFY BEYOND WHITESPACE/COMMENTS
// -----------------------------------------------------------------------------

// Initialize readline interface for standard input and output.
var read = require('readline').createInterface({ input: process.stdin,
                                                  output: process.stdout });

// Declare variables to store input lines and the parsed input object.
var obj;
var inLine = [];

// Event listener: when a line is read from input, add it to the 'inLine' array.
read.on('line', function (input) {
  inLine.push(input);
});

// Event listener: when input stream is closed, process the input.
read.on('close', function () {

  // Initialize the input object with all collected lines.
  obj = init(inLine);

  // Output a debug message to stderr indicating input/output direction.
  console.error('\n↑入力 ↓出力');

  // Call the main function to execute the program's logic.
  Main();
});

/*
 * Creates a deep clone of an object.
 * Handles Set objects specifically, otherwise uses JSON serialization for deep cloning.
 * @param {any} obj - The object to be cloned.
 * @returns {any} A deep clone of the input object.
 */
function makeClone(obj) {
  return (obj instanceof Set)
    ? new Set(Array.from(obj)) // If it's a Set, convert to array then back to Set.
    : JSON.parse(JSON.stringify(obj)); // Otherwise, use JSON for deep copy.
}

/*
 * Reads the next token from input and parses it as an integer.
 * @returns {number} The next integer from the input.
 */
function nextInt() { return myconv(next(), 1); }

/*
 * Reads the next token from input and splits it into a string array.
 * @returns {string[]} An array of strings from the next input token.
 */
function nextStrArray() { return myconv(next(), 2); }

/*
 * Reads the next token from input, splits it, and parses elements as integers.
 * @returns {number[]} An array of integers from the next input token.
 */
function nextIntArray() { return myconv(next(), 4); }

/*
 * Reads the next token from input and splits it into a character array.
 * @returns {string[]} An array of characters from the next input token.
 */
function nextCharArray() { return myconv(next(), 6); }

/*
 * Retrieves the next token from the initialized input object.
 * @returns {string} The next token (line) from the input.
 */
function next() { return obj.next(); }

/*
 * Checks if there are more tokens (lines) available in the input.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext() { return obj.hasNext(); }

/**
 * Initializes an input object with methods for sequential access.
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with `hasNext` and `next` methods.
 */
function init(input) {

  return {
    list: input, // The array holding all input lines.
    index: 0, // Current position in the input array.
    max: input.length, // Total number of input lines.

    // Method to check if there are more input lines.
    hasNext: function () {
      return (this.index < this.max);
    },

    // Method to get the next input line and advance the index.
    next: function () {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        // Throw an error if attempting to read beyond the end of input.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/*
 * Outputs a string to the console, followed by a newline.
 * @param {string} s - The string to be outputted.
 */
function myout(s) { console.log(s); }

/*
 * Outputs a debug message to stderr, including inspection of an object.
 * @param {any} s - The object to be inspected and outputted.
 */
function myerr(s) { console.error('debug:' + require('util').inspect(s, false, null)); }

// Helper function for type conversion based on a numeric code.
// The 'no' parameter determines the conversion type:
// 1: parseInt (string to integer)
// 2: split by space (string to string array)
// 4: split by space and map to Number (string to integer array)
// 6: split by character (string to character array)
// 7: split by character and map to Number (string to integer array from chars)
// 8: join array elements with space (array to space-separated string)
// 9: join array elements with newline (array to newline-separated string)
// 0: join array elements with no character (array to concatenated string)
// default: returns input as is (no conversion).
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(' ');
      case 4:
        return i.split(' ').map(Number);
      case 6:
        return i.split('');
      case 7:
        return i.split('').map(Number);
      case 8:
        return i.join(' ');
      case 9:
        return i.join('\n');
      case 0:
        return i.join('');
      default:
        return i;
    }
  } catch (e) {
    // In case of conversion error, return the original input.
    return i;
  }
}

// -----------------------------------------------------------------------------
// Main Program Logic
// -----------------------------------------------------------------------------

/*
 * The main function containing the primary logic of the program.
 * It reads input, processes it using a Union-Find data structure,
 * and outputs the result.
 */
function Main() {

  // Read the first line of input, which contains N, M, and K.
  var one = nextIntArray();
  var N = one[0]; // Number of nodes.
  var M = one[1]; // Number of 'ok' (connected) relationships.
  var K = one[2]; // Number of 'ng' (blocked) relationships.

  // Initialize a Union-Find data structure with N elements.
  var uf = unionFind(N);

  // Create a map to store 'ok' and 'ng' relationships for each node.
  var map = {};
  for (var i = 0; i < N; i++) {
    map[i] = {
      ok: new Set(), // Set of nodes directly connected.
      ng: new Set()  // Set of nodes directly blocked.
    };
  }

  // Process M 'ok' relationships.
  for (var i = 0; i < M; i++) {
    var tmp = nextIntArray();
    tmp[0]--; // Adjust to 0-indexed.
    tmp[1]--; // Adjust to 0-indexed.

    // Union the two nodes in the Union-Find structure.
    uf.doUnion(tmp[0], tmp[1]);

    // Record the direct 'ok' connection in the map.
    map[tmp[0]].ok.add(tmp[1]);
    map[tmp[1]].ok.add(tmp[0]);
  }

  // Process K 'ng' relationships.
  for (var i = 0; i < K; i++) {
    var tmp = nextIntArray();
    tmp[0]--; // Adjust to 0-indexed.
    tmp[1]--; // Adjust to 0-indexed.

    // Record the direct 'ng' connection in the map.
    map[tmp[0]].ng.add(tmp[1]);
    map[tmp[1]].ng.add(tmp[0]);
  }

  // Calculate the potential friends for each person.
  var output = new Array(N).fill(0);
  for (var i = 0; i < N; i++) {
    // Initial count: size of the connected component - direct 'ok' friends - self.
    output[i] = uf.getSize(i) - map[i].ok.size - 1;

    // Convert 'ng' set to an array for iteration.
    var ngs = Array.from(map[i].ng);
    for (var j = 0; j < ngs.length; j++) {
      // If an 'ng' connection is in the same connected component,
      // it means this 'ng' connection would have been counted as a potential friend.
      // So, we decrement the count.
      if (uf.isSame(i, ngs[j])) {
        output[i]--;
      }
    }
  }

  // Output the results, joined by spaces.
  myout(myconv(output, 8));
}

/*
 * Implements a Union-Find (Disjoint Set Union) data structure.
 * This structure efficiently manages partitions of a set into disjoint subsets.
 *
 * @param {number} n - The number of elements in the set (0 to n-1).
 * @returns {object} An object representing the Union-Find data structure
 *                   with methods for union, find, and size.
 */
function unionFind(n) {
  var uf = {
    // 'list' stores the parent of each element.
    // If list[i] < 0, then i is a root, and its value is -1 * size of the component.
    // Initially, each element is its own root with a size of 1.
    "list": new Array(n).fill(-1),

    /**
     * Checks if two elements belong to the same connected component.
     * @param {number} mae - The first element's index.
     * @param {number} ato - The second element's index.
     * @returns {boolean} True if they are in the same component, false otherwise.
     */
    "isSame": function (mae, ato) {
      return this.getRootIndex(mae) == this.getRootIndex(ato);
    },

    /**
     * Finds the root (representative) of the component to which an element belongs.
     * Uses path compression for efficiency: during the traversal, it updates
     * all visited nodes to point directly to the root.
     * @param {number} index - The index of the element.
     * @returns {number} The index of the root of the component.
     */
    "getRootIndex": function (index) {
      if (this.list[index] < 0) {
        // If the value is negative, it's a root.
        return index;
      } else {
        // Path compression: set parent to root directly.
        this.list[index] = this.getRootIndex(this.list[index]);
        return this.list[index];
      }
    },

    /**
     * Merges the components of two elements.
     * Uses union by size/rank heuristic: the smaller tree is attached
     * under the root of the larger tree to keep the tree flat.
     * @param {number} mae - The first element's index.
     * @param {number} ato - The second element's index.
     */
    "doUnion": function (mae, ato) {
      var maeRoot = this.getRootIndex(mae); // Get root of the first element.
      var atoRoot = this.getRootIndex(ato); // Get root of the second element.

      // Only perform union if they are in different components.
      if (!this.isSame(maeRoot, atoRoot)) {
        // Heuristic: attach the root with smaller absolute size to the larger one.
        // Or, if sizes are equal, attach 'atoRoot' to 'maeRoot' (arbitrary choice).
        if (maeRoot >= atoRoot) { // Using index comparison as a proxy for rank/size for simplicity, or if roots are already 'larger'
          // Add size of atoRoot's component to maeRoot's component.
          this.list[maeRoot] += this.list[atoRoot];
          // Make maeRoot the parent of atoRoot.
          this.list[atoRoot] = maeRoot;
        } else {
          // Add size of maeRoot's component to atoRoot's component.
          this.list[atoRoot] += this.list[maeRoot];
          // Make atoRoot the parent of maeRoot.
          this.list[maeRoot] = atoRoot;
        }
      }
    },

    /**
     * Returns the size of the component to which an element belongs.
     * The size is stored as the negative value at the component's root.
     * @param {number} index - The index of the element.
     * @returns {number} The number of elements in the component.
     */
    "getSize": function (index) {
      // Get the root index and then return the absolute value of its stored value.
      return -this.list[this.getRootIndex(index)];
    }
  };
  return uf; // Return the initialized Union-Find object.
}