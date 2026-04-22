/*
 * This script processes input from standard input to solve a specific problem.
 * It uses graph traversal algorithms, including a modified Bellman-Ford,
 * to find a minimum value based on node properties and edge weights.
 */

var input = ''; // Initialize an empty string to accumulate input data.

// Ensure the standard input stream remains active.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function (chunk) {
  // Append each received chunk of data to the 'input' string.
  input += chunk;
});

// Event listener for the end of the input stream.
process.stdin.on('end', function () {
  // Once all input has been received, call the main processing function.
  main();
});


/**
 * The primary function that orchestrates the problem-solving logic.
 * This function is invoked after all input has been read.
 */
function main() {

  // Split the entire input string into an array of lines.
  var lines = input.split('\n');


  // Parse problem parameters from the first line of input.
  // 'n' represents the number of nodes.
  var n = lines[0].split(' ')[0] - 0;
  // 'm' represents the number of edges.
  var m = lines[0].split(' ')[1] - 0;
  // 'x' represents an initial height/resource value.
  var x = lines[0].split(' ')[2] - 0;


  // Declare loop control variables.
  var i, j, k;

  // Initialize arrays to store node-specific data.
  // 'h' stores height/resource values for each node.
  var h = Array(n);
  // 'gl' (graph list) stores adjacency lists for the graph.
  var gl = Array(n);
  // 'his' stores historical states for path pruning.
  var his = Array(n);
  // 'stack' will be used as a priority queue for graph traversal.
  var stack = [];

  // Loop to initialize node data from input lines.
  for (i = 0; i < n; i++) {
    // Populate 'h' array with height values (converting string to number).
    h[i] = lines[i + 1] - 0;
    // Initialize adjacency list for the current node as an empty array.
    gl[i] = [];
    // Initialize history list for the current node as an empty array.
    his[i] = [];
  }


  // Declare variables for processing edge data.
  var temp, a, b, t;
  // 'edges' array to store all graph edges in a flat list.
  var edges = Array(m);

  // Loop to read and process edge information.
  for (i = 0; i < m; i++) {
    // Split the current edge line into components.
    temp = lines[i + n + 1].split(' ');
    // 'a' is the first node (0-indexed).
    a = temp[0] - 1;
    // 'b' is the second node (0-indexed).
    b = temp[1] - 1;
    // 't' is the weight/cost of the edge.
    t = temp[2] - 0;

    // Add edge to adjacency list for node 'a'.
    gl[a].push({
      next: b, // The connected node.
      t: t // The edge weight.
    });

    // Add reverse edge to adjacency list for node 'b' (undirected graph).
    gl[b].push({
      next: a, // The connected node.
      t: t // The edge weight.
    });

    // Store the edge details in the 'edges' array.
    edges[i] = [a, b, t];
  }


  /**
   * Implements a modified Bellman-Ford algorithm to find shortest paths.
   * This version considers node heights ('h') as a constraint for edge traversal.
   *
   * @param {number} vl The total number of vertices in the graph.
   * @param {number} source The starting vertex for shortest path calculation.
   * @param {Array<Array<number>>} edges A list of all edges, where each edge is [v1, v2, cost].
   * @returns {Array<number>} An array 'd' where d[i] is the shortest distance from source to vertex 'i'.
   */
  function bellman_ford(vl, source, edges) {
    // 'd' array to store shortest distances from the source.
    var d = Array(vl);
    var i; // Loop counter.

    // Initialize all distances to Infinity.
    for (i = 0; i < vl; i++) {
      d[i] = Infinity;
    }

    // Distance from source to itself is 0.
    d[source] = 0;

    // Flag to track if any distance was updated in an iteration.
    var update = true;
    var v1, v2, c; // Variables for edge components.

    // Continue iterating as long as distances are being updated.
    while (update) {
      update = false; // Reset update flag for the current iteration.

      // Iterate through all edges.
      for (i = 0; i < edges.length; i++) {
        v1 = edges[i][0]; // First vertex of the edge.
        v2 = edges[i][1]; // Second vertex of the edge.
        c = edges[i][2]; // Cost/weight of the edge.

        // Relaxation step for v1 -> v2, with height constraint.
        if (d[v2] > d[v1] + c && h[v2] >= c) {
          d[v2] = d[v1] + c;
          update = true; // An update occurred.
        }

        // Relaxation step for v2 -> v1, with height constraint (for undirected graph).
        if (d[v1] > d[v2] + c && h[v1] >= c) {
          d[v1] = d[v2] + c;
          update = true; // An update occurred.
        }
      }
    }
    return d; // Return the array of shortest distances.
  }

  // Calculate shortest distances from the target node (n-1) to all other nodes
  // using the modified Bellman-Ford algorithm. This is used for A* like pruning.
  var dmin = bellman_ford(n, n - 1, edges);

  // Initial state pushed onto the stack for traversal.
  // 'p': current node, 't': accumulated time/cost, 'height': current resource.
  stack.push({
    p: 0, // Starting at node 0.
    t: 0, // Initial time is 0.
    height: x // Initial height/resource is 'x'.
    // ,history:his1st // This line is commented out in the original.
  });

  // Declare variables for the traversal loop.
  var node, next, obj, goal, newNode;
  // Initialize 'min' to track the minimum time to reach the target.
  var min = Infinity;

  // Record the initial state for node 0 in its history.
  his[0].push({
    t: 0,
    height: x
  })

  // Main traversal loop (Dijkstra-like or A*-like using a stack/priority queue).
  while (stack.length > 0) {
    // Pop the next node state from the stack.
    node = stack.pop();

    // Pruning condition: if current path + estimated future cost already
    // exceeds or equals the current minimum, skip this path.
    if (node.t + dmin[node.p] * 2 - node.height >= min) {
      continue; // Skip to the next iteration.
    }

    // Iterate through all neighbors of the current node.
    for (i = 0; i < gl[node.p].length; i++) {
      obj = gl[node.p][i]; // Get the edge object.
      next = obj.next; // The neighboring node.

      // Constraint check: if current node's height is less than edge cost,
      // this path cannot be taken.
      if (h[node.p] < obj.t) {
        continue; // Skip this edge.
      }

      // Determine the new state (newNode) based on different conditions.
      // Condition 1: If the neighbor's height + edge cost is less than current height.
      if (h[next] + obj.t < node.height) {
        newNode = {
          p: next, // Next node.
          t: node.t + obj.t + node.height - (h[next] + obj.t), // Recalculated time.
          height: h[next] // New height.
        };
      }
      // Condition 2: If neighbor's height + edge cost is sufficient, and current height is also sufficient.
      else if (h[next] + obj.t >= node.height && node.height >= obj.t) {
        newNode = {
          p: next, // Next node.
          t: node.t + obj.t, // Recalculated time.
          height: node.height - obj.t // New height.
        };
      }
      // Condition 3: Default case, if neither of the above.
      else {
        newNode = {
          p: next, // Next node.
          t: node.t + obj.t + obj.t - node.height, // Recalculated time.
          height: 0 // Height becomes 0.
        }
      }

      // Check if the next node is the target node (n-1).
      if (next === n - 1) {
        // If target reached, update the minimum time.
        min = Math.min(min, newNode.t + h[n - 1] - newNode.height);
      } else {
        // If not the target, check history for pruning.
        // Only proceed if this new state is better than any recorded historical state for 'next'.
        if (!his[next].some(function (h_entry) {
          return h_entry.t < newNode.t && h_entry.height >= newNode.height;
        })) {
          // Add the new state to the history for 'next'.
          his[next].push({
            t: newNode.t,
            height: newNode.height
          })
          // Push the new state onto the stack for further exploration.
          stack.push(newNode);
        }
      }
    }

    // Sort the stack to simulate a priority queue (smallest 't' usually, but here it's b.t - a.t, so largest 't' gets popped first?)
    // This sorting is unusual for a typical Dijkstra/A* (usually min-heap).
    // The original code has `b.t - a.t`, which means descending order of 't', so `pop()` gets the largest `t`.
    // This might imply a specific heuristic or a DFS-like behavior with pruning.
    stack.sort(function (a, b) {
      return b.t - a.t; // Sort in descending order of time 't'.
    });

    // The following line was commented out in the original, so it remains commented.
    // console.log(stack[stack.length - 1].t, min);
  }

  // Final output based on the calculated minimum time.
  if (min === Infinity) {
    // If 'min' is still Infinity, the target was unreachable.
    console.log(-1);
  } else {
    // Otherwise, print the minimum time found.
    console.log(min);
  }

} // End of the main function.

/*
 * End of script.
 * This program demonstrates graph traversal with specific constraints
 * and a custom state management for path optimization.
 */