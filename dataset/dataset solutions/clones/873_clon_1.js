// This file was initially created by hiroqn on 2013/10/10.
// It contains logic for solving a graph-related problem using Union-Find.

var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size // Determine the size of the standard input
  , buffer = new Buffer(length) // Create a buffer to hold the input data
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Read data into the buffer
  , input = buffer.toString('utf8', 0, bytesRead).split('\n'); // Convert buffer to string and split by newlines

// The primary execution function is called immediately after setup.
main();

// Function to create a 2D array (matrix) initialized with a specific value.
function matrix(n, m, init)
{
  var arr = []; // Initialize the main array.
  var i, j;     // Declare loop counters for row and column.

  // Loop through each row.
  for (i = 0; i < n; i++)
  {
    arr[i] = []; // Initialize the current row as an empty array.

    // Loop through each column in the current row.
    for (j = 0; j < m; j++)
    {
      arr[i][j] = init; // Assign the initial value to the current cell.
    }
  }

  return arr; // Return the fully initialized matrix.
}

// Union-Find data structure implementation.
function UF(n) // 'n' represents the number of elements in the set.
{
  var i;     // Loop counter.
  var par = []; // 'par' array stores parent of each element or negative size if root.

  // Initialize each element as a separate set (root with size -1).
  for (i = 0; i < n; i++)
  {
    par[i] = -1;
  }

  // Function to unite two sets containing elements x and y.
  function union(x, y)
  {
    x = find(x); // Find the root of x's set.
    y = find(y); // Find the root of y's set.

    // If x and y are not already in the same set.
    if (x !== y)
    {
      // Union by size/rank heuristic.
      if (par[x] < par[y]) // If x's set is larger (more negative par[x]).
      {
        par[x] += par[y]; // Add y's set size to x's set.
        par[y] = x;       // Make x the parent of y.
      }
      else // If y's set is larger or equal.
      {
        par[y] += par[x]; // Add x's set size to y's set.
        par[x] = y;       // Make y the parent of x.
      }
    }

    return x !== y; // Return true if a union actually occurred (x and y were in different sets).
  }

  // Function to find the root of the set containing element x (with path compression).
  function find(x)
  {
    // If x is a root (par[x] is negative).
    return par[x] < 0 ? x : par[x] = find(par[x]); // Otherwise, path compression: set parent to root.
  }

  // Function to count the number of disjoint sets among 'using' elements.
  function count(using)
  {
    var c = 0; // Initialize counter for disjoint sets.

    // Iterate through all elements.
    for (i = 0; i < n; i++)
    {
      // If the element is marked for 'use' AND it is a root of its set.
      if (using[i] && par[i] < 0)
      {
        c++; // Increment the count of disjoint sets.
      }
    }

    return c; // Return the total count.
  }

  // Expose public methods of the Union-Find structure.
  return {
    union: union, // The union operation.
    find: find,   // The find operation.
    count: count  // The count operation.
  };
}

// Main function containing the core logic of the program.
function main()
{
  var temp;    // Temporary variable for parsing input lines.
  var n, m;    // n: number of nodes, m: number of edges.
  var i, j, k; // Loop counters.
  var h;       // Array to store node data (days and original index).
  var g;       // Adjacency matrix for graph (distances).
  var edges;   // Array to store all edges.
  var e;       // Temporary variable for an edge.
  var uf;      // Union-Find instance.
  var res;     // Result variable (minimum spanning tree weight).
  var use;     // Boolean array to track which nodes are currently "in use".

  // Main loop to process multiple test cases until n=0 and m=0.
  while (true)
  {
    temp = input.shift().split(' '); // Read a line, split by space.
    n = +temp[0];                  // Parse n (number of nodes).
    m = +temp[1];                  // Parse m (number of edges).

    // Termination condition for the loop.
    if (n === 0 && m === 0)
    {
      break; // Exit the loop if both n and m are zero.
    }

    h = [];    // Initialize array for node data.
    use = [];  // Initialize array for 'use' flags.

    // Read node-specific data (days) and initialize 'use' flags.
    for (i = 0; i < n; i++)
    {
      // Store node index and its associated 'days' value.
      h[i] = {
        node: i,
        days: +input.shift()
      };
      use[i] = true; // Initially, all nodes are considered "in use".
    }

    edges = []; // Initialize array to store graph edges.
    g = [];     // Initialize adjacency matrix.

    // Initialize adjacency matrix: 0 for self-loops, Infinity for no direct edge.
    for (i = 0; i < n; i++)
    {
      g[i] = []; // Initialize row for node i.
      for (j = 0; j < n; j++)
      {
        g[i][j] = i === j ? 0 : Infinity; // Self-loop is 0, others are Infinity.
      }
    }

    // Read edge data and populate the adjacency matrix.
    for (i = 0; i < m; i++)
    {
      temp = input.shift().split(' '); // Read an edge line.
      // Store edge as [from_node, to_node, weight]. Adjust node indices to be 0-based.
      edges[i] = [temp[0] - 1, temp[1] - 1, temp[2] - 0];
      // Update adjacency matrix for undirected graph (symmetrical).
      g[edges[i][0]][edges[i][1]] = g[edges[i][1]][edges[i][0]] = edges[i][2];
    }

    // Sort nodes based on their 'days' value in ascending order.
    h.sort(function (a, b)
    {
      return a.days - b.days; // Comparison function for sorting.
    });

    // Initialize Union-Find structure for all 'n' nodes.
    uf = UF(n);

    // Perform initial unions based on existing finite-weight edges.
    // This connects all components that are reachable from each other.
    for (j = 0; j < n; j++)
    {
      for (k = 0; k < n; k++)
      {
        // If j and k are different nodes and there's a finite path between them.
        if (j !== k && g[j][k] !== Infinity)
        {
          uf.union(j, k); // Union their sets.
        }
      }
    }

    // If, after considering all edges, there's more than one connected component
    // among all 'use'd nodes, then it's impossible to connect, so output 0.
    if (uf.count(use) > 1)
    {
      console.log(0); // Output 0 as result.
      continue;       // Move to the next test case.
    }

    // Iterate through sorted nodes to find the minimum 'days' threshold.
    for (i = 0; i < n; i++)
    {
      use[h[i].node] = false; // Mark the current node as NOT in use.

      // If there are subsequent nodes with the same 'days' value,
      // mark them as NOT in use as well.
      while (i < n - 1 && h[i].days === h[i + 1].days)
      {
        i++;                    // Move to the next node.
        use[h[i].node] = false; // Mark it as NOT in use.
      }

      // Re-initialize Union-Find for the current state of 'use'd nodes.
      uf = UF(n);

      // Connect components only among nodes that are currently 'use'd.
      for (j = 0; j < n; j++)
      {
        for (k = 0; k < n; k++)
        {
          // If both nodes j and k are 'use'd, are different, and have a finite edge.
          if (use[k] && use[j] && k !== j && g[j][k] !== Infinity)
          {
            uf.union(j, k); // Union their sets.
          }
        }
      }

      // If, with the current set of 'use'd nodes, there's more than one component,
      // this means removing the current 'h[i].days' nodes (and smaller 'days')
      // caused a disconnection.
      if (uf.count(use) > 1)
      {
        use[h[i].node] = true; // Re-add the current node to 'use'.
        // Re-add any nodes that had the same 'days' value and were removed with it.
        while (i > 0 && h[i].days === h[i - 1].days)
        {
          i--;                    // Move back to previous node.
          use[h[i].node] = true; // Re-add it to 'use'.
        }
        break; // Found the threshold: 'h[i].days' is the minimum required.
      }
    }

    // Kruskal's algorithm to find the Minimum Spanning Tree (MST)
    // among the 'use'd nodes.
    res = 0; // Initialize result (total weight of MST).
    uf = UF(n); // Re-initialize Union-Find.

    // Sort all edges by weight in ascending order.
    edges.sort(function (e1, e2)
    {
      return e1[2] - e2[2]; // Compare edge weights.
    });

    // Iterate through sorted edges.
    for (j = 0; j < m; j++)
    {
      e = edges[j]; // Get the current edge.

      // If both endpoints of the edge are currently 'use'd.
      if (use[e[0]] && use[e[1]])
      {
        // If the two endpoints are in different sets.
        if (uf.find(e[0]) !== uf.find(e[1]))
        {
          uf.union(e[0], e[1]); // Union their sets.
          res += e[2];          // Add edge weight to result.
        }
      }
    }

    // The following commented-out blocks seem to be leftover or alternative logic.
    // It's crucial not to change the logic, so I'll just keep them commented.
//    console.log(res)
//    console.log('uf',uf.count(use));
//    console.log(use)

    var stack;  // Stack for processing nodes.
    var d;      // Distance variable (unused in final logic).
    var node;   // Current node being processed.

    // This loop seems to be part of an attempt to refine the MST,
    // possibly adding nodes back in, but the inner logic is commented out.
    // We must preserve the original structure and comments.
    for (k = i - 1; k >= 0; k--)
    {
//      console.log('k',k)
      stack = []; // Initialize stack for current group of nodes.
      stack.push(h[k].node); // Add current node to stack.
      use[h[k].node] = true; // Mark current node as 'use'd.

      // Add all previous nodes with the same 'days' value to the stack and mark as 'use'd.
      while (k > 0 && h[k].days === h[k - 1].days)
      {
        k--; // Move to previous node.
        stack.push(h[k].node); // Add to stack.
        use[h[k].node] = true; // Mark as 'use'd.
      }

//      queue.sort(function (n1, n2) {
//
//        return e1[2] - e2[2];
//      });

      // Process nodes in the stack.
      while (stack.length > 0)
      {
        node = stack.pop(); // Pop a node from the stack.
        d = Infinity;       // Reset distance (local variable, potentially for a different approach).

        // This inner loop repeats the Kruskal's edge processing.
        // It seems redundant or part of an unfinished refinement.
        // It's important to keep it as is, without altering its effect.
        for (j = 0; j < m; j++)
        {
          e = edges[j]; // Get an edge.

          // If both endpoints of the edge are 'use'd.
          if (use[e[0]] && use[e[1]])
          {
            // If the two endpoints are in different sets.
            if (uf.find(e[0]) !== uf.find(e[1]))
            {
              uf.union(e[0], e[1]); // Union their sets.
              res += e[2];          // Add edge weight to result.
            }
          }
//          }
        }

        // More commented-out logic, possibly for a different MST approach or error checking.
//        for (j = 0; j < n; j++) {
//          if (use[j] && j !== node) {
//            d = d > g[node][j] ? g[node][j] : d;
//          }
//        }
//        console.log('d', d, 'node', node);
//        if (d !== Infinity) {
//          res += d;
//        }
      }
    }

    console.log(res); // Output the final calculated result for the test case.
  } // End of while(true) loop for test cases.
} // End of main function.