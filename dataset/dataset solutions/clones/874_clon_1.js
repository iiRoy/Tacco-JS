/*
 *  This file contains JavaScript code for processing graph-related data.
 *  It includes a Union-Find data structure implementation and a main function
 *  to solve a specific problem involving nodes and edges.
 *  Original creation date: 2013-10-10.
 */

var fs        =  require('fs')   , // File system module for I/O operations
    length    =  fs.fstatSync(process.stdin.fd).size , // Determine the size of the standard input
    buffer    =  new Buffer(length)                  , // Create a buffer to hold the input data
    bytesRead =  fs.readSync(process.stdin.fd, buffer, 0, length, 0) , // Read data from stdin into the buffer
    input     =  buffer.toString('utf8', 0, bytesRead).split('\n')   ; // Convert buffer to UTF-8 string and split by newlines

// Commence program execution.
main();

/**
 *  @function UF
 *  @param {number} n - The number of elements in the set.
 *  @returns {object} An object containing Union-Find operations (union, find, count, same).
 *  This implements a Union-Find data structure, also known as Disjoint Set Union.
 */
function UF(n)     {
  var i, // Loop counter variable
      par = [];    // Parent array: stores parent of element or negative size if root.

  // Initialize all elements as roots of their own sets.
  for (i = 0; i < n; i++)
  {
    par[i] = -1; // -1 indicates this element is a root and its set has size 1.
  }

  /**
   *  @function union
   *  @param {number} x - First element.
   *  @param {number} y - Second element.
   *  @returns {boolean} True if a union operation actually occurred (i.e., x and y were in different sets), false otherwise.
   *  Performs a union of the sets containing elements x and y.
   *  Uses union by size heuristic.
   */
  function union(x, y)
  {
    x = find(x); // Find the root of x's set.
    y = find(y); // Find the root of y's set.

    // If x and y are not already in the same set...
    if (x !== y)
    {
      /*
       *  Perform union by size.
       *  Attach the smaller tree under the root of the larger tree.
       *  The par[root] stores the negative of the size of the tree.
       */
      if (par[x] < par[y]) /* If set x is larger (par[x] is more negative) */
      {
        par[x] += par[y]; // Add size of y's set to x's set.
        par[y]  = x;      // Make x the parent of y.
      }
      else /* If set y is larger or equal in size */
      {
        par[y] += par[x]; // Add size of x's set to y's set.
        par[x]  = y;      // Make y the parent of x.
      }
    }

    // Return true if a union happened, false if they were already in the same set.
    return x !== y;
  }

  /**
   *  @function find
   *  @param {number} x - The element to find the root of.
   *  @returns {number} The root of the set containing x.
   *  Performs path compression during the find operation.
   */
  function find(x) {
    // If par[x] is negative, x is a root.
    // Otherwise, x is not a root, so recursively find its root and compress the path.
    return par[x] < 0 ? x : (par[x] = find(par[x]));
  }

  /**
   *  @function count
   *  @param {Array<boolean>} using - A boolean array indicating which elements are currently "in use".
   *  @returns {number} The number of distinct sets among the "in use" elements.
   *  Counts the number of active disjoint sets.
   */
  function count(using)
  {
    var c = 0; // Counter for distinct sets.

    // Iterate through all elements.
    for (i = 0; i < n; i++)
    {
      // If the element is "in use" AND it is a root of its set...
      if (using[i] && par[i] < 0)
      {
        c++; // Increment the distinct set count.
      }
    }
    return c;
  }

  /**
   *  @function same
   *  @param {number} x - First element.
   *  @param {number} y - Second element.
   *  @returns {boolean} True if x and y are in the same set, false otherwise.
   */
  function same(x, y)
  {
    return find(x) === find(y); // Compare their roots.
  }

  // Return an object exposing the public methods of the Union-Find structure.
  return {
    union: union, // Method to union two sets
    find:  find , // Method to find the representative of a set
    count: count, // Method to count disjoint sets
    same:  same   // Method to check if two elements are in the same set
  };
}

/**
 *  @function main
 *  The primary function that orchestrates the problem-solving logic.
 *  Reads input, processes it, and prints the result to console.
 */
function main() {
  var temp   , // Temporary array for parsed input lines
      n      , // Number of nodes
      m      , // Number of edges
      i      , // Loop counter 1
      j      , // Loop counter 2
      k      , // Loop counter 3
      h      , // Array of node objects, sorted by 'days'
      g      , // Adjacency list/matrix (commented out in original)
      edges  , // Array of edge data (source, destination, weight)
      e      , // Single edge during iteration
      uf     , // Union-Find instance
      res    , // Result variable (total weight)
      use    ; // Boolean array indicating 'used' nodes

  // Main loop to process multiple test cases until N=0 and M=0.
  while (true)
  {
    // Read N and M from the input.
    temp = input.shift().split(' ');
    n    = +temp[0]; // Convert first part to number (N)
    m    = +temp[1]; // Convert second part to number (M)

    // Termination condition: N=0 and M=0.
    if (n === 0 && m === 0)
    {
      break; // Exit the loop.
    }

    // Initialize arrays for node properties and 'use' status.
    h   = [];
    use = [];

    // Populate node properties (days) and initialize 'use' status.
    for (i = 0; i < n; i++)
    {
      // The commented line was an alternative way to store node data.
      // h[i] = [+input.shift() , i];
      h[i] = {
        node: i,              // Original index of the node
        days: +input.shift()  // 'days' value for this node
      };
      use[i] = false; // Initially, no node is 'in use'.
    }

    // Initialize edges array.
    edges = [];

    /*
     *  The following commented block seems to be an attempt to
     *  build an adjacency matrix 'g', which was later abandoned.
     *  for (i = 0; i < n; i++) {
     *    g[i] = [];
     *    for (j = 0; j < n; j++) {
     *      g[i][j] = i == j ? 0 : Infinity;
     *    }
     *  }
     */

    // Read edge data from input.
    for (i = 0; i < m; i++)
    {
      temp       = input.shift().split(' ');
      edges[i]   = [temp[0] - 1, temp[1] - 1, temp[2] - 0]; // Store (u, v, weight)
      /*
       *  This commented line would update the adjacency matrix 'g'
       *  if it were being used.
       *  g[edges[i][0]][edges[i][1]] = g[edges[i][1]][edges[i][0]] = edges[i][2];
       */
    }

    // console.log(g) // Debugging line, commented out.

    // Sort nodes based on their 'days' property in ascending order.
    h.sort(function (a, b) {
      return a.days - b.days;
    });

    /*
     *  Another commented block, possibly an earlier approach to check connectivity
     *  or part of a different algorithm (e.g., Kruskal's or Prim's setup).
     *  uf = UF(n);
     *  for (j = 0; j < n; j++) {
     *    for (k = 0; k < n; k++) {
     *      if (j !== k && g[j][k] !== Infinity) {
     *        uf.union(j, k);
     *      }
     *    }
     *  }
     *  if (uf.count(use) > 1) {
     *    console.log(0);
     *    continue;
     *  }
     */

    // Sort edges based on their weight in ascending order.
    edges.sort(function (e1, e2) {
      return e1[2] - e2[2];
    });

    uf  = UF(n); // Create a new Union-Find instance for the current test case.
    res = 0;     // Initialize the result (total edge weight) to zero.

    // Iterate through nodes in reverse order of sorted 'days' (from highest 'days' to lowest).
    for (i = n - 1; i >= 0; i--)
    {
      // Mark the current node as 'in use'.
      use[h[i].node] = true;

      // If there are other nodes with the same 'days' value, mark them as 'in use' too.
      while (i > 0 && h[i].days === h[i - 1].days)
      {
        i--;                   // Move to the previous node.
        use[h[i].node] = true; // Mark it as 'in use'.
      }

      // Iterate through the sorted edges to find edges connecting 'in use' nodes.
      for (j = 0; j < m; j++)
      {
        e = edges[j]; // Get the current edge [u, v, weight].

        // If both endpoints of the edge are currently 'in use'...
        if (use[e[0]] && use[e[1]])
        {
          // If the two endpoints are not already in the same connected component...
          if (!uf.same(e[0],e[1]))
          {
            uf.union(e[0], e[1]); // Union their sets.
            res += e[2];          // Add the edge's weight to the result.
          }
        }
      }

      // After processing all edges for the current set of 'in use' nodes,
      // check if all 'in use' nodes form a single connected component.
      if (uf.count(use) > 1)
      {
        res = 0;   // If not, reset result to 0 (problem specific condition).
        uf = UF(n); // Re-initialize Union-Find (effectively starting over for this 'days' group).
        // break;   // This 'break' was commented out, implying the loop should continue.
      }
    }

    // Print the final result for the current test case.
    console.log(res);

  } // End of while (true) loop.
} // End of main function.