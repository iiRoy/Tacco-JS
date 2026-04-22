/*
 * This section handles input/output operations for the program.
 * It sets up the readline interface to read from standard input and write to standard output.
 * It also includes utility functions for parsing input and handling program execution flow.
 */
var read = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

// Global variables to store parsed input and a buffer for incoming lines.
var obj;
var inLine = [ ];

// Event listener for each line of input received.
read.on(
  'line',
  function (input) {
    inLine.push(input);
  }
);

// Event listener for when the input stream closes.
read.on(
  'close',
  function () {
    // Initialize the input object with all collected lines.
    obj = init(inLine);

    // Output a newline to separate debug info.
    console.error("\n");

    // Record the start time for performance measurement.
    var start = Date.now();

    // Execute the main program logic.
    Main();

    // Calculate elapsed time.
    var end = Date.now() - start;

    // Output execution time and memory usage to standard error.
    myerr("time : " + end + "ms");
    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
  }
);

/**
 * Creates a deep clone of an object using JSON serialization.
 * Note: This method has limitations (e.g., cannot clone functions, Date objects, etc.).
 * @param {object} obj - The object to clone.
 * @returns {object} A deep copy of the input object.
 */
function makeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// --- Input parsing utility functions ---
/**
 * Reads the next input token and parses it as an integer.
 * @returns {number} The next integer from input.
 */
function nextInt() {
  return myconv(next(), 1);
}

/**
 * Reads the next input token and splits it into a string array by spaces.
 * @returns {Array<string>} An array of strings.
 */
function nextStrArray() {
  return myconv(next(), 2);
}

/**
 * Reads the next input token, splits it by spaces, and parses each part as a number.
 * @returns {Array<number>} An array of integers.
 */
function nextIntArray() {
  return myconv(next(), 4);
}

/**
 * Reads the next input token and splits it into an array of single characters.
 * @returns {Array<string>} An array of characters.
 */
function nextCharArray() {
  return myconv(next(), 6);
}

/**
 * Retrieves the next raw input string from the buffer.
 * @returns {string} The next input string.
 */
function next() {
  return obj.next();
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext() {
  return obj.hasNext();
}

/**
 * Initializes the input object with the provided array of lines.
 * This object manages the state of input consumption.
 * @param {Array<string>} input - An array of strings, each representing a line of input.
 * @returns {object} An object with methods to access input.
 */
function init(input) {
  var returnObj = {
    list: input,
    index: 0,
    max: input.length,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more input is available.
     */
    hasNext: function () {
      return (this.index < this.max);
    },

    /**
     * Retrieves the next line of input and advances the index.
     * Throws an error if no more input is available.
     * @returns {string} The next line of input.
     */
    next: function () {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var returnInput = this.list[this.index++];
        return returnInput;
      }
    }
  };
  return returnObj;
}

/**
 * Prints a string to standard output, followed by a newline.
 * @param {string} s - The string to print.
 */
function myout(s) {
  console.log(s);
}

/**
 * Prints a debug message to standard error.
 * Uses util.inspect for better object representation.
 * @param {*} s - The data to debug print.
 */
function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
}

/*
 * This function provides a flexible way to convert input based on a specified 'no' parameter.
 * The 'no' parameter dictates the conversion type:
 * 1: Parses as an integer.
 * 2: Splits string by spaces.
 * 4: Splits string by spaces and maps to numbers.
 * 6: Splits string into individual characters.
 * 7: Splits string into characters and maps to numbers.
 * 8: Joins an array with spaces.
 * 9: Joins an array with newlines.
 * 0: Joins an array with no separator.
 * Default: Returns the input as is.
 */
function myconv(i, no) {
  try {
    switch (no) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(" ");
      case 4:
        return i.split(" ").map(Number);
      case 6:
        return i.split("");
      case 7:
        return i.split("").map(Number);
      case 8:
        return i.join(" ");
      case 9:
        return i.join("\n");
      case 0:
        return i.join("");
      default:
        return i;
    }
  } catch (e) {
    return i; // In case of conversion error, return original input.
  }
}

/*
 * End of utility functions and input processing setup.
 * The following section contains the main program logic.
 */

/**
 * Main function containing the core algorithm for the problem.
 * This function reads graph data, performs BFS, and calculates a specific output.
 */
function Main() {
  var N = nextInt(); // Read the number of nodes in the graph.

  // Initialize an array to store node information.
  var list = new Array(N);

  // Populate the list with initial node objects.
  for (var i = 0; i < N; i++) {
    list[i] = {
      child: [],   // List of connected children (neighbors).
      access: false, // Flag to track if node has been visited during BFS.
      depth: 1     // Depth of the node from a starting point in BFS.
    };
  }

  // Read adjacency matrix and build child lists for each node.
  for (var i = 0; i < N; i++) {
    var tmp = nextCharArray(); // Read a row of the adjacency matrix.
    for (var j = 0; j < N; j++) {
      // If there's an edge from i to j (and i is not j itself).
      if (i != j && tmp[j] == "1") {
        list[i].child.push(j); // Add j to i's list of children.
      }
    }
  }

  var output = -1; // Initialize the output variable.

  // Perform BFS starting from node 0 to find the farthest node.
  var tooi = bfs(0);

  // Reset access and depth for all nodes before the second BFS.
  for (var i = 0; i < N; i++) {
    list[i].access = false;
    list[i].depth = 1;
  }

  // Perform BFS starting from the farthest node found (tooi) to find the diameter.
  var res = bfs(tooi);

  // Check conditions for the final output.
  for (var i = 0; i < N - 1; i++) {
    for (var j = i + 1; j < N; j++) {
      // If two nodes have the same depth AND they are connected, output -1.
      if (list[i].depth == list[j].depth && (list[i].child.indexOf(j) != -1 || list[j].child.indexOf(i) != -1)) {
        myout(-1); // Output -1 and terminate.
        return;
      } else {
        // Otherwise, update output with the maximum depth found so far.
        output = Math.max(output, list[i].depth);
      }
    }
  }

  myout(output); // Output the final calculated value.

  /**
   * Performs a Breadth-First Search (BFS) starting from a given node.
   * Updates `access` and `depth` properties of nodes in the global `list` array.
   * @param {number} s - The starting node index for BFS.
   * @returns {number} The index of a node that is farthest from the starting node (has max depth).
   */
  function bfs(s) {
    var queue = [s]; // Initialize queue with the starting node.
    list[s].access = true; // Mark the starting node as visited.
    var maxDepth = 0; // Initialize max depth found during this BFS.

    while (queue.length > 0) {
      var now = queue.shift(); // Dequeue the current node.
      var child = list[now].child; // Get its children.

      // Iterate through all children of the current node.
      for (var k = 0; k < child.length; k++) {
        // If a child has not been visited yet.
        if (!list[child[k]].access) {
          list[child[k]].access = true; // Mark as visited.
          list[child[k]].depth = list[now].depth + 1; // Set its depth.
          maxDepth = Math.max(maxDepth, list[now].depth + 1); // Update max depth.
          queue.push(child[k]); // Enqueue the child.
        }
      }
    }

    var retIndex = -1; // Initialize the index of the farthest node.

    // Find a node that has the maximum depth calculated during this BFS.
    for (var i = 0; i < N; i++) {
      if (list[i].depth == maxDepth) {
        retIndex = i; // Store its index.
        break; // Found one, no need to check further.
      }
    }
    return retIndex; // Return the index of the farthest node.
  }
}