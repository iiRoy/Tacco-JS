var log = console.log;
/*
 * This variable 'log' is a convenient alias
 * for the standard console logging function.
 * It simplifies writing output messages.
 */
if (typeof process != "undefined")
{
  // Initialize an empty string to accumulate input data
  var input = "";
  // Ensure the standard input stream is open and ready to receive data
  process.stdin.resume();
  // Set the encoding for the input stream to UTF-8
  process.stdin.setEncoding('utf8');
  // Register an event listener for 'data' chunks from stdin
  process.stdin.on('data', function (chunk) {
    // Append the received chunk of data to the 'input' string
    input += chunk;
  });
  // Register an event listener for the 'end' of the input stream
  process.stdin.on('end', function ()
  {
    // Split the accumulated input string into an array of lines
    var lines = input.split("\n");
    // Call the main processing function with the parsed lines
    main(lines);
  });
}


/*
 * The primary function that orchestrates the graph algorithm logic.
 * It takes an array of strings, where each string represents a line of input.
 */
function main(lines)
{
    // Check if the last line is empty and remove it if it is.
    // This handles cases where input might end with an extra newline.
    if( lines.pop() != "" )
    {
        lines.push(); // This push() without arguments adds 'undefined' to the array.
                      // It seems like a potential bug or a specific intent from the original code.
                      // I will preserve it as per Type I clone rules.
    }

    // Process each line to convert string numbers into actual numbers.
    // Each line is expected to contain space-separated numbers.
    lines = lines.map( function(line)
    {
        return line.split(" ").map( function(e)
        {
            return Number(e);
        } );
    } );

    // Extract the first line, which contains graph dimensions (Vertices V, Edges E).
    var top_line = lines.shift();
    var V = top_line[0]; // Number of vertices
    var E = top_line[1]; // Number of edges (though not directly used in this algorithm after initial parsing)

    // Declare and initialize various arrays used for graph representation and algorithm state.
    var real_edge = []; // Adjacency list for the graph
    var virt_edge = []; // This variable is declared but never used in the provided code.
    var mark = [];      // Boolean array to mark visited nodes during DFS
    var status = [];    // This variable is declared but never used in the provided code.
    var ord = [];       // Discovery time/order of nodes in DFS
    var lowlink = [];   // Lowest discovery time reachable from a node (including itself)
    var bridges = [];   // Stores identified bridges (pairs of vertices)
    var used_e = [];    // To track edges used in DFS traversal to avoid re-visiting in a cycle

    // Initialize arrays for each vertex
    for ( var i = 0 ; i < V ; i++ )
    {
        real_edge[i] = [];  // Each vertex has an empty adjacency list initially
        mark[i] = false;    // No vertex is visited initially

        //ord?????????
        //lowlink??????(dfs????????????????§????){0,}??¨(?????????){0,1}??§?????????ord???????°????
        //?????????????????????????????§???????°???????ord
        /* ord stores the discovery order of nodes during DFS. */
        /* lowlink stores the lowest discovery order reachable from this node or its descendants. */
        ord[i] = 0;         // Initialize discovery order
        lowlink[i] = V;     // Initialize lowlink to a value larger than any possible ord

        bridges[i] = [];    // Each vertex can be part of multiple bridges, store target vertices here.
        used_e[i] = [];     // Initialize 2D array for used edges

        for ( var j = 0 ; j < V ; j++ )
        {
            used_e[i][j] = false; // All edges are unused initially
        }
    }

    // Populate the adjacency list (real_edge) from the input lines representing edges.
    lines.forEach( function(edge)
    {
        var a = edge[0]; // First vertex of the edge
        var b = edge[1]; // Second vertex of the edge
        real_edge[a].push(b); // Add b to a's adjacency list
        real_edge[b].push(a); // Add a to b's adjacency list (undirected graph)
    } );

    var no = 0;     // Counter for discovery order (ord)
    var prev = 0;   // This variable is declared but never used.

    /*
     * Depth-First Search (DFS) function to find bridges.
     * It computes discovery times (ord) and low-link values (lowlink).
     */
    function dfs( now_point )
    {
        //now_point????????¨???????????????
        //now_ord????????¨???????????????
        //mark????¨???????????????????
        var np = now_point; // Alias for current point for brevity within DFS
        var mk = mark;      // Alias for mark array

        var targets = real_edge[np]; // Get neighbors of the current point

        mk[np] = true;      // Mark current node as visited
        ord[np] = no;       // Set discovery order for current node
        lowlink[np] = no;   // Initialize lowlink with discovery order
        no++;               // Increment discovery order counter for the next node

        targets.forEach( function(target)
        {
            // If the target node has not been visited yet
            if ( ! mk[target] )
            {
                //???????????£????????¨?????????
                //??¢?´¢?????????
                //log(np+" -> "+target);
                //???????°????
                // Mark edge as used in both directions to prevent re-traversal as back-edge
                used_e[np][target] = true;
                used_e[target][np] = true;

                dfs(target); // Recursively call DFS on the unvisited target

                //?????\????????????lowlink?????????
                //???????????????????±????lowlink???????°???????lowlink????????¨??????
                // After recursive call returns, update lowlink of current node.
                // The lowlink of current node is the minimum of its current lowlink
                // and the lowlink of its child (target).
                lowlink[np] = Math.min(lowlink[np], lowlink[target]);
            }
            // If target has been visited AND the edge (target, np) is NOT a tree edge
            // (i.e., it's a back-edge to an ancestor)
            else if ( ! used_e[target][np] )
            {
                //?????????
                //lowlink?????´??°
                //????°????????????????
                // This is a back-edge.
                // Update lowlink of current node with the discovery time of the ancestor (target).
                lowlink[np] = Math.min(lowlink[np], ord[target]);
                //log(np+" => "+target);
            }
        } );
    }

    // Start DFS from vertex 0 (assuming graph is connected or we only care about component 0).
    dfs(0);

    //log(ord);
    //log(lowlink);

    // Iterate through all original edges to identify bridges using ord and lowlink values.
    lines.forEach( function(edge)
    {
        var u = edge[0]; // First vertex of the edge
        var v = edge[1]; // Second vertex of the edge

        // Ensure u is the "parent" (earlier discovery time) and v is the "child".
        // This standardizes the edge direction for bridge checking.
        if ( ord[u] > ord[v] )
        {
            var k = u; // Temporary variable for swapping
            u = v;
            v = k;
        }

        // An edge (u, v) is a bridge if v is not an ancestor of u,
        // and there is no back-edge from v or its descendants to u or its ancestors.
        // This condition is met when the lowlink of v is greater than the discovery time of u.
        if ( ord[u] < lowlink[v] )
        {
            //????????????
            // Found a bridge!
            // Store the bridge in a canonical order (min, max)
            var min = Math.min(u,v);
            var max = Math.max(u,v);
            bridges[min].push(max); // Add to the list of bridges for the smaller vertex
        }
    } );

    // Sort the bridges for each starting vertex.
    // The original sort function `return b<a;` is a descending sort for numbers.
    // Let's preserve this exact comparison logic.
    bridges = bridges.map( function(e)
    {
        return e.sort( function(a,b)
        {
            return b < a; // Sort in descending order
        } );
    } );

    // Print all identified bridges.
    for ( var s = 0 ; s < V ; s++ )
    {
        var len = bridges[s].length; // Number of bridges starting from vertex 's'
        for ( var td = 0 ; td < len ; td++ )
        {
            var t = bridges[s][td]; // The other vertex of the bridge
            log(s + " " + t);       // Output the bridge (s, t)
        }
    }
}