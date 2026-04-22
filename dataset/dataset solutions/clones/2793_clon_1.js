/*
 * This section contains boilerplate code for input/output handling and utility functions.
 * It's not directly related to the core algorithm, but essential for execution.
 */
var read = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);


var obj;
var inLine = []; /* Array to store input lines */


read.on(
  'line',
  function (input) {
    inLine.push(input);
  }
);


read.on(
  'close',
  function () {
    obj = init(inLine); /* Initialize input object after all lines are read */

    console.error("\n"); /* Print a newline to stderr for visual separation */

    var start = Date.now(); /* Record start time for performance measurement */

    Main(); /* Execute the main algorithm */

    var end = Date.now() - start; /* Calculate elapsed time */

    myerr("time : " + end + "ms"); /* Log execution time to stderr */

    myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); /* Log memory usage to stderr */
  }
);


function makeClone(obj) {
  /* Utility function to perform a deep clone of an object */
  return JSON.parse(JSON.stringify(obj));
}


function nextInt() {
  return myconv(next(), 1);
}


function nextStrArray() {
  return myconv(next(), 2);
}


function nextIntArray() {
  return myconv(next(), 4);
}


function nextCharArray() {
  return myconv(next(), 6);
}


function next() {
  return obj.next();
}


function hasNext() {
  return obj.hasNext();
}


/*
 * Initializes an object for sequential input reading.
 * @param {Array<string>} input - An array of input lines.
 * @returns {object} An object with methods to read next input and check for more input.
 */
function init(input) {
  var returnObj = {
    list: input,
    index: 0,
    max: input.length,
    hasNext: function () {
      return (this.index < this.max);
    },
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


function myout(s) {
  console.log(s);
} /* Wrapper for console.log for primary output */


function myerr(s) {
  console.error("debug:" + require("util").inspect(s, false, null));
} /* Wrapper for console.error for debug output */


/*
 * This function converts input based on a specified 'no' parameter.
 * 'no' parameter definitions:
 *   - unknown or outlier : returns i as is.
 *   - 1: parses i as an integer.
 *   - 2: splits i by space into an array of strings.
 *   - 4: splits i by space and maps to numbers (array of integers).
 *   - 6: splits i into an array of characters.
 *   - 7: splits i into an array of characters and maps to numbers.
 *   - 8: joins array elements with spaces.
 *   - 9: joins array elements with newlines.
 *   - 0: joins array elements with no character.
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
    /* In case of conversion error, return original input */
    return i;
  }
}

/* End of utility functions and input processing setup. */


/*
 * Main function containing the core logic of the program.
 * It reads graph data, performs a DFS for parent finding,
 * and then a BFS to find the shortest path.
 */
function Main() {
  /* Read N and M from the first line of input */
  var one = nextIntArray();
  var N = one[0]; /* Number of nodes */
  var M = one[1]; /* Number of edges */

  /* Initialize an adjacency list representation for the graph nodes */
  var list = new Array(N);

  /* Populate each node object with initial properties */
  for (var i = 0; i < N; i++) {
    list[i] = {
      child: [],       /* List of direct children (outgoing edges) */
      parent: new Set(), /* Set of parents reachable within 3 steps */
      access: false,   /* Flag for visited status in BFS */
      depth: 0         /* Depth from target node in BFS */
    };
  }

  /* Read M edges and populate the 'child' adjacency lists */
  for (var i = 0; i < M; i++) {
    var tmp = nextIntArray(); /* Read an edge (u, v) */
    list[tmp[0] - 1].child.push(tmp[1] - 1); /* Add v to u's children (0-indexed) */
  }

  /* Perform DFS from each node to find parents within 3 steps */
  for (var i = 0; i < N; i++) {
    dfs(i, i, 0); /* root, current node, current depth */
  }

  /* Read the start (s) and target (t) nodes for the pathfinding */
  var tmp = nextIntArray();
  var s = tmp[0] - 1; /* Start node (0-indexed) */
  var t = tmp[1] - 1; /* Target node (0-indexed) */

  /* Initialize BFS queue and mark target node as accessed */
  var queue = [t];
  list[t].access = true;
  var output = 0; /* Variable to store the shortest path length */


  /* Perform a Breadth-First Search (BFS) starting from the target node 't' */
  while (queue.length > 0) {
    var now = queue.shift(); /* Dequeue the current node */

    /* If the start node 's' is reached, record its depth and break */
    if (now == s) {
      output = list[now].depth;
      break;
    }

    /* Get parents of the current node 'now' that are within 3 steps */
    var child = Array.from(list[now].parent);

    /* Iterate through these 'parent' nodes */
    for (var i = 0; i < child.length; i++) {
      /* If a parent node has not been accessed yet */
      if (!list[child[i]].access) {
        list[child[i]].access = true; /* Mark as accessed */
        list[child[i]].depth = list[now].depth + 1; /* Set its depth */
        queue.push(child[i]); /* Enqueue it for further exploration */
      }
    }
  }

  // myerr(list); /* Original commented out debug line - keeping it commented */

  /* Output the result based on whether a path was found */
  if (output == 0) {
    myout(-1); /* If output remains 0, it means 's' was not reached (or s==t and depth is 0) */
  } else {
    myout(output); /* Otherwise, print the shortest path length */
  }


  /*
   * Depth-First Search (DFS) function to find nodes reachable within 3 steps.
   * It populates the `parent` Set for each node.
   * @param {number} root - The starting node of the current DFS traversal.
   * @param {number} now - The current node being visited.
   * @param {number} depth - The current depth of the traversal from the root.
   */
  function dfs(root, now, depth) {
    /* Base case: if depth reaches 3, add the root to the current node's parents */
    if (depth == 3) {
      list[now].parent.add(root);
      return; /* Stop further traversal from this path */
    }

    /* Get the children of the current node */
    var child = list[now].child;

    /* Recursively call DFS for each child */
    for (var j = 0; j < child.length; j++) {
      dfs(root, child[j], depth + 1); /* Increment depth for the next level */
    }
    return; /* End of DFS branch */
  }
}