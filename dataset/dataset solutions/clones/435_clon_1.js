/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition: "Code fragments are exactly equal,
 * except for possible variations in whitespace and comments."
 *
 * This means:
 * - All identifiers (variable names, function names) remain unchanged.
 * - All operators and expressions remain unchanged.
 * - The logical structure and flow of the program are identical.
 * - Only whitespace (spaces, tabs, newlines) and comments have been altered.
 *
 * The purpose of this transformation is to demonstrate
 * visual difference while maintaining functional equivalence
 * at the lowest syntactic level.
 */

// Define the primary execution function for the program.
function main ( ) {

  // Declare variables used throughout the main logic.
  var
    /* A constant representing infinity, commonly used in graph algorithms
     * to denote unreachable paths or initial maximum values. */
    inf = 1e9,

    // Variables for parsing input lines.
    line,

    // Variables for graph dimensions and edge properties.
    n,
    m,
    a,
    b,
    c,
    t,

    // Variables for query parameters.
    p,
    q,
    r,

    // Loop counters for iterations.
    i,
    j,
    k;


  // The main processing loop, continues until a specific termination condition is met.
  while (true)
  {
    // Read and parse a line of input for graph dimensions.
    line = input.shift().split(' ').map(parseFloat);

    // Extract number of nodes (n) and number of edges (m).
    n = line[0];
    m = line[1];

    // Check for termination condition: if n and m are both zero, exit the loop.
    if (n == 0 && m == 0)
    {
      break;
    }

    // Initialize adjacency matrices for costs and times.
    // These will store the weights between nodes.
    cost = [];
    time = [];

    // Initialize inner arrays for cost and time matrices up to 'm' nodes.
    // Nodes are 1-indexed in this problem context.
    for (i = 1; i <= m; i++)
    {
      cost[i] = []; // Array for costs from node 'i'
      time[i] = []; // Array for times from node 'i'
    }

    // Process 'n' lines of input, each representing an edge in the graph.
    for (i = 0; i < n; i++)
    {
      // Parse the current line for edge details: source, destination, cost, time.
      line = input.shift().split(' ').map(parseFloat);
      a = line[0]; // Source node
      b = line[1]; // Destination node
      c = line[2]; // Cost of traversing the edge
      t = line[3]; // Time taken to traverse the edge

      // Update the cost and time matrices for the edge (a, b) and (b, a)
      // This assumes an undirected graph where edges are bidirectional.
      // Use Math.min to store the minimum cost/time if multiple edges exist
      // between the same pair of nodes. '||inf' handles initial undefined values.
      cost[a][b] = cost[b][a] = Math.min(c, cost[a][b] || inf);
      time[a][b] = time[b][a] = Math.min(t, time[a][b] || inf);
    }


    /*
     * Apply the Floyd-Warshall algorithm to find all-pairs shortest paths
     * for both cost and time.
     * This algorithm iterates through all possible intermediate nodes 'k'.
     */
    for (k = 1; k <= m; k++)
    { // Iterate through all possible intermediate nodes.
      for (i = 1; i <= m; i++)
      { // Iterate through all possible source nodes.
        for (j = 1; j <= m; j++)
        { // Iterate through all possible destination nodes.

          // Update the minimum cost from 'i' to 'j'
          // by considering path through 'k'.
          cost[i][j] = Math.min(cost[i][j] || inf, (cost[i][k] || inf) + (cost[k][j] || inf));

          // Similarly, update the minimum time from 'i' to 'j'
          // by considering path through 'k'.
          time[i][j] = Math.min(time[i][j] || inf, (time[i][k] || inf) + (time[k][j] || inf));
        }
      }
    }


    // Read the number of queries for this test case.
    k = parseFloat(input.shift());

    // Process each query.
    for (i = 0; i < k; i++)
    {
      // Parse the query line: source (p), destination (q), type of query (r).
      line = input.shift().split(' ').map(parseFloat);
      p = line[0]; // Source node for the query.
      q = line[1]; // Destination node for the query.
      r = line[2]; // Query type: 0 for cost, 1 for time.

      // Output the result based on the query type.
      // Uses an array [cost, time] to dynamically select the correct matrix.
      console.log([cost, time][r][p][q]);
    }
  } // End of the main while loop.
} // End of the main function definition.


/*
 * Global variable to store all incoming standard input.
 * It is initialized as an empty string and appended to as data arrives.
 */
var
  input = '';

// Resume standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function (chunk) {
  // Append each received chunk to the 'input' string.
  input += chunk;
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function ( ) {
  // Once all input is received, split it into an array of lines.
  input = input.split('\n');

  // Record the start time to measure execution duration.
  var
    start = Date.now();

  // Call the main function to begin processing the input.
  main();

  // After main execution, log the total time taken.
  console.log('time: ' + (Date.now() - start));
});