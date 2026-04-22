/*
 * This section contains utilities for input processing and other helpers.
 * It's generally not part of the core algorithm logic.
 */
var read = require('readline').createInterface({
  input : process.stdin,
  output: process.stdout
});

var obj; // Object to manage input stream
var inLine = [ ]; // Array to store input lines

/*
 * Event listener for each line read from input.
 * Pushes the line into the inLine array.
 */
read.on('line', function ( input ) {
  inLine.push(input);
});

/*
 * Event listener for the 'close' event, indicating end of input.
 * Initializes the input object and calls the main function.
 */
read.on('close', function ( ) {
  obj = init(inLine); // Initialize input stream object
  console.error('\n↑入力 ↓出力'); // Debug message (Japanese: Input above, Output below)
  Main( ); // Execute the main program logic
});

/**
 * Creates a deep clone of an object. Handles Set objects specifically.
 * For other objects, it uses JSON stringify/parse for a deep copy.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone( obj ) {
  return (obj instanceof Set)
           ? new Set(Array.from(obj))
           : JSON.parse(JSON.stringify(obj));
}

// Helper functions for reading various data types from the input stream.
function nextInt( ) {
  return myconv(next(), 1);
}

function nextStrArray( ) {
  return myconv(next(), 2);
}

function nextIntArray( ) {
  return myconv(next(), 4);
}

function nextCharArray( ) {
  return myconv(next(), 6);
}

function next( ) {
  return obj.next();
}

function hasNext( ) {
  return obj.hasNext();
}

/**
 * Initializes an input stream object with methods to check for next input
 * and retrieve the next line.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init( input ) {
  return {
    list : input,
    index: 0,
    max  : input.length,

    hasNext: function ( ) {
      return (this.index < this.max);
    },

    next: function ( ) {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Function to output results to the console.
function myout( s ) {
  console.log(s);
}

// Function for debugging, outputs to console.error.
function myerr( s ) {
  console.error('debug:' + require('util').inspect(s, false, null));
}

/*
 * Parameter "no" determines the conversion type:
 * - unknown or outlier : returns the input 'i' as is.
 * - 1: parseInt (converts to integer).
 * - 2: splits string by space (returns array of strings).
 * - 4: splits string by space and maps to Number (returns array of numbers).
 * - 6: splits string by character (returns array of characters).
 * - 7: splits string by character and maps to Number (returns array of numbers).
 * - 8: joins array elements with space.
 * - 9: joins array elements with newline.
 * - 0: joins array elements with no character.
 */
function myconv( i, no ) {
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
    return i; // Return original input in case of error
  }
}

/*
 * End of utility functions.
 * The core problem-solving logic starts below.
 */
function Main( ) {
  var one = nextIntArray(); // Reads the first line as an array of integers

  var N = one[0]; // N represents the number of nodes in the graph
  var K = one[1]; // K represents the number of available colors

  var list = new Array(N); // Adjacency list representation of the graph

  /*
   * Initialize each node in the list.
   * Each node object contains:
   * - child: An array to store indices of connected nodes.
   * - no: The original index of the node.
   * - count: Stores the number of ways to color this node (initially 0).
   * - access: A boolean flag to track if the node has been visited.
   */
  for (var i = 0; i < N; i++) {
    list[i] = {
      child : [],
      no    : i,
      count : 0,
      access: false
    };
  }

  /*
   * Read N-1 edges and build the adjacency list.
   * The graph is undirected, so add connections in both directions.
   */
  for (var i = 0; i < N - 1; i++) {
    var tmp = nextIntArray(); // Read an edge (two node indices)
    list[tmp[0] - 1].child.push(tmp[1] - 1); // Add edge from tmp[0] to tmp[1]
    list[tmp[1] - 1].child.push(tmp[0] - 1); // Add edge from tmp[1] to tmp[0]
  }

  var output = 1; // Initialize the total number of ways to color the tree
  var mod = 1000000007; // Modulo for calculations to prevent overflow

  list[0].access = true; // Mark the starting node (node 0) as visited

  /*
   * Use an iterative approach (BFS-like structure) to count coloring possibilities.
   * The stack stores [parentNodeCount, availableColorsForCurrentNode, currentNodeIndex].
   */
  var stack = [[0, K, 0]]; // Start with node 0, K colors, 0 parent/sibling count

  while (stack.length > 0) {
    var tmp = stack.pop(); // Get the current node's state from the stack

    var parentNodeCount = tmp[0]; // Count of parent/sibling nodes already colored
    var color = tmp[1]; // Number of available colors for the current node
    var now = tmp[2]; // Current node's index

    list[now].count = color; // Store the number of ways to color the current node

    /*
     * Adjust parentNodeCount for children.
     * If parentNodeCount is less than 2, increment it. This accounts for the parent
     * and potentially one sibling for the children's coloring calculations.
     */
    if (parentNodeCount < 2) {
      parentNodeCount++;
    }

    var child = list[now].child; // Get the children (neighbors) of the current node
    var successCount = 0; // Counter for children successfully pushed to stack

    /*
     * Iterate through the children of the current node.
     * For each unvisited child, mark it as visited and push it onto the stack.
     */
    for (var i = 0; i < child.length; i++) {
      if (!list[child[i]].access) {
        list[child[i]].access = true; // Mark child as visited
        /*
         * Push child onto stack:
         * [parentNodeCount for child, available colors for child, child index]
         * Available colors for child = K - (successCount + parentNodeCount)
         *  - K: total colors
         *  - successCount: siblings already processed (and thus "used" a color slot relative to K for this child)
         *  - parentNodeCount: parent + potential sibling (already processed for parent's perspective)
         */
        stack.push([parentNodeCount, K - successCount - parentNodeCount, child[i]]);
        successCount++; // Increment count of processed children
      }
    }
  }

  /*
   * Calculate the final output by multiplying the `count` for each node.
   * Apply modulo operation at each step to keep the number within limits.
   * If `output` becomes 0 at any point, it means no valid coloring is possible,
   * so break early.
   */
  for (var i = 0; i < N; i++) {
    output *= list[i].count; // Multiply by the number of ways to color node i
    output %= mod; // Apply modulo
    if (output == 0) {
      break; // Optimization: if product is 0, it will remain 0
    }
  }

  myout(output); // Output the final result

  /*
   * This `dfs` function is defined but not used in the provided `Main` function.
   * It represents an alternative (recursive) approach to solve a similar problem.
   * It is kept here as per Type I clone requirements.
   */
  function dfs(parentNodeCount, color, now, constK) {
    list[now].count = color; // Store the number of ways to color the current node

    // Increment parentNodeCount if it's less than 2 (for children's calculations)
    if (parentNodeCount < 2) {
      parentNodeCount++;
    }

    var child = list[now].child; // Get neighbors of the current node
    var successCount = 0; // Counter for children processed recursively

    // Iterate through children and make recursive calls for unvisited ones
    for (var i = 0; i < child.length; i++) {
      if (!list[child[i]].access) {
        list[child[i]].access = true; // Mark child as visited
        // Recursive call for the child
        dfs(parentNodeCount, constK - successCount - parentNodeCount, child[i], constK);
        successCount++; // Increment count of processed children
      }
    }
  }
}