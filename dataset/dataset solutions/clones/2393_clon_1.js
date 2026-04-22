// This section handles input/output operations and provides various utility functions.
// It is generally considered boilerplate and can be disregarded when focusing on the main algorithm.

var read=require('readline').createInterface({
  input:process.stdin,
  output:process.stdout
});

var obj; // Global object to manage the input stream.
var inLine=[]; // Array to store all input lines read.

// Event listener for each line of input received.
read.on('line', function(input){
  inLine.push(input);
});

// Event listener for when the input stream is closed.
read.on('close', function(){
  obj = init(inLine); // Initialize the input handler with all collected lines.

  console.error("\n"); // Prints a newline to stderr for better console output separation.

  var start = new Date(); // Marks the starting time for performance measurement.
  Main(); // Executes the primary algorithm function.
  var end = new Date() - start; // Calculates the elapsed time.

  myerr("time : " + (end) + "ms"); // Outputs the execution time to stderr.
  // Outputs memory usage to stderr, specifically heapTotal converted to KB.
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization/deserialization.
 * This method is effective for plain objects without circular references or functions.
 * @param {object} obj The object to be cloned.
 * @returns {object} A new object that is a deep clone of the input.
 */
function makeClone(obj){return JSON.parse(JSON.stringify(obj));}

// Helper functions to retrieve and convert the next input token.
function nextInt(){return myconv(next(),1);}
function nextStrArray(){return myconv(next(),2);}
function nextIntArray(){return myconv(next(),4);}
function nextCharArray(){return myconv(next(),6);}

// Basic functions to interact with the global input object 'obj'.
function next(){return obj.next();}
function hasNext(){return obj.hasNext();}

/**
 * Initializes an object to manage reading from an array of input lines.
 * Provides methods to check for available input and retrieve the next line.
 * @param {Array<string>} input An array where each element is a line of input.
 * @returns {object} An object with `hasNext` and `next` methods.
 */
function init(input){
  var returnObj = {
    list : input, // The array of input lines.
    index : 0,    // Current position in the `list`.
    max : input.length, // Total number of lines.

    // Checks if there are more lines to read.
    hasNext : function(){return (this.index < this.max);},

    // Retrieves the next line of input. Throws an error if no more input is available.
    next : function(){
      if(!this.hasNext()){
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error message for out-of-bounds access.
      } else {
        var returnInput = this.list[this.index];
        this.index++;
        return returnInput;
      }
    }
  };
  return returnObj;
}

// Prints the given string 's' to the standard output, followed by a newline.
function myout(s){console.log(s);}

// Prints a debug message to the standard error stream. Uses `util.inspect` for detailed object output.
function myerr(s){console.error("debug:" + require("util").inspect(s,false,null));}

/*
 * `myconv` function: A versatile utility for type conversion and string manipulation.
 *
 * Parameter `i`: The input value (string or array) to be converted.
 * Parameter `no`: An integer code specifying the desired conversion type.
 *
 * Conversion Codes:
 *   1: Converts `i` to an integer using `parseInt()`.
 *   2: Splits `i` (string) by space (" ") into an array of strings.
 *   4: Splits `i` (string) by space (" ") and converts each part to a `Number`.
 *   6: Splits `i` (string) into an array of individual characters.
 *   7: Splits `i` (string) into an array of characters and converts each to a `Number`.
 *   8: Joins `i` (array) elements with a space (" ").
 *   9: Joins `i` (array) elements with a newline ("\n").
 *   0: Joins `i` (array) elements without any separator.
 * Default: If `no` does not match any case, `i` is returned as is.
 *
 * Error Handling: If any conversion fails (e.g., `parseInt` on non-numeric string),
 * the original input `i` is returned, preventing crashes.
 */
function myconv(i,no){
  try{
    switch(no){
      case 1: return parseInt(i);
      case 2: return i.split(" ");
      case 4: return i.split(" ").map(Number);
      case 6: return i.split("");
      case 7: return i.split("").map(Number);
      case 8: return i.join(" ");
      case 9: return i.join("\n");
      case 0: return i.join("");
      default: return i;
    }
  }catch(e){
    return i; // Return original input on error
  }
}

// --- End of boilerplate and helper functions. The main program logic begins here. ---

function Main(){
  var N = nextInt(); // Reads the number of nodes (N) in the graph.
  var list = new Array(N); // Initializes an array to represent the adjacency list for nodes.
  var map = {}; // An object to store edge properties, keyed by a unique edge identifier (e.g., "nodeA:nodeB").

  // Initialize each node in the `list` with a `child` array to store its neighbors.
  for(var i = 0; i < N; i++){
    list[i] = {
      child : [] // Each node's `child` array will hold indices of its adjacent nodes.
    };
  }

  var K = 0; // `K` will store the maximum color used, which is the final answer.

  // Reads N-1 edges to construct the graph (assuming it's a tree).
  for(var i = 0; i < N - 1; i++){
    var tmp = nextIntArray(); // Reads two integers representing an edge (e.g., [A, B]).
    var Ai = tmp[0] - 1; // Converts node A to 0-indexed.
    var Bi = tmp[1] - 1; // Converts node B to 0-indexed.

    // Adds bidirectional edges to the adjacency list.
    list[Ai].child.push(Bi);
    list[Bi].child.push(Ai);

    // Stores information about the edge in the `map`.
    // The key is formed by sorting the node indices to ensure uniqueness (e.g., "minNode:maxNode").
    map[Math.min(Ai, Bi) + ":" + Math.max(Ai, Bi)] = {
      no : i, // Original index of the edge, useful for outputting in order.
      color : null // The color assigned to this edge, initially `null`.
    };
  }

  // Initializes a queue for a Breadth-First Search (BFS) to color the edges.
  // Each element in the queue is `[currentNode, colorOfIncomingEdge]`.
  // Starts BFS from node 0, with a dummy incoming edge color of 0.
  var queue = [[0,0]];

  // Continues the BFS as long as there are nodes in the queue to process.
  while(queue.length > 0){
    var tmp = queue.shift(); // Dequeues the next node and its parent edge's color.
    var now = tmp[0]; // The current node being visited.
    var lastColor = tmp[1]; // The color of the edge that led to `now` from its parent.

    var child = list[now].child; // Retrieves all neighbors of the `now` node.
    var nowColor = 1; // Starts trying to assign colors from 1 for outgoing edges from `now`.

    // Iterates through each neighbor (child) of the current node.
    for(var i = 0; i < child.length; i++){
      var tonari = child[i]; // The adjacent node.

      var left; // Represents the smaller index of the two nodes forming the edge.
      var right; // Represents the larger index of the two nodes forming the edge.

      // Ensures `left` is always the smaller index and `right` is the larger,
      // to consistently form the key for the `map`.
      if(now > tonari){
        left = tonari;
        right = now;
      }else{
        left = now;
        right = tonari;
      }

      // Checks if the current edge has not yet been colored.
      if(map[left + ":" + right].color == null){
        // If the `nowColor` candidate is the same as the `lastColor` (incoming edge),
        // increment `nowColor` to avoid using the same color at the `now` node.
        if(nowColor == lastColor){
          nowColor++;
        }

        map[left + ":" + right].color = nowColor; // Assigns the chosen color to the edge.
        queue.push([tonari, nowColor]); // Enqueues the neighbor with the newly assigned edge color.
        K = Math.max(nowColor, K); // Updates `K` to track the maximum color used.
        nowColor++; // Increments `nowColor` for the next outgoing edge from `now`.
      }
    }
  }

  myout(K); // Outputs the maximum color used, which is the answer to the problem.

  var output = new Array(N - 1); // Array to store the final edge colors in their original input order.
  var mae = new Array(N - 1); // Temporary array to hold edge objects for sorting.

  var keys = Object.keys(map); // Gets all keys (edge identifiers) from the `map`.

  // Populates the `mae` array with the edge objects (containing `no` and `color`) from the `map`.
  for(var i = 0; i < keys.length; i++){
    mae[i] = map[keys[i]];
  }

  // Sorts the `mae` array based on the original edge index (`no`) to restore the input order.
  mae.sort(function(a,b){
    return a.no - b.no;
  });

  // Extracts only the colors from the sorted `mae` array into the `output` array.
  for(var i = 0; i < N - 1; i++){
    output[i] = mae[i].color;
  }

  // Outputs the array of colors, joined by newlines (using `myconv` with code 9).
  myout(myconv(output,9));
}