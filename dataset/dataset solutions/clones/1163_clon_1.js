var log = console.log;

/*
 * This block handles input when the script is run in a Node.js environment.
 * It checks if 'process' global object is defined, which is typical for Node.
 */
if (typeof process != "undefined")
{
    var input = ""; // Initialize an empty string to accumulate input data.

    // Resume stdin to ensure it's not paused.
    process.stdin.resume();

    // Set the encoding for incoming data to UTF-8.
    process.stdin.setEncoding('utf8');


    // Event listener for 'data' chunks received from standard input.
    process.stdin.on
        (
            'data',
            function (chunk)
            {
                input += chunk; // Append each data chunk to the 'input' string.
            }
        );

    // Event listener for 'end' of standard input stream.
    process.stdin.on
        (
            'end',
            function ()
            {
                // Once all input is received, split it into lines.
                var lines = input.split("\n");

                // Call the main processing function with the array of lines.
                main(lines);
            }
        );
}


/*
 * The primary function that orchestrates the graph processing logic.
 * It takes an array of strings, where each string represents a line of input.
 */
function main(lines)
{
    // Check if the last line is empty and remove it if so.
    // This often happens if the input ends with a newline character.
    if(lines.pop() != "")
    {
        lines.push(); // Re-add an empty element if the last one wasn't empty, to maintain structure if needed, though this seems unusual.
                      // The original code has 'lines.push();' without arguments, which would push 'undefined'.
                      // I must keep it exactly as is.
    }

    /*
     * Process each line:
     * 1. Split the line by spaces.
     * 2. Convert each resulting string element to a number.
     * This transforms the input lines into arrays of numbers.
     */
    lines = lines.map
    (
        function(line)
        {
            return line.split(" ").map
            (
                function(e)
                {
                    return Number(e);
                }
            );
        }
    );

    // Extract the first line, which contains graph parameters (vertices V, edges E).
    var top_line = lines.shift();

    var V = top_line[0]; // Number of vertices.
    var E = top_line[1]; // Number of edges (not directly used after this, but implied by input structure).

    // --- Graph Data Structures and Auxiliary Arrays ---
    var real_edge = []; // Adjacency list for the graph.
    var virt_edge = []; // Declared but not used in the provided code.
    var mark = [];      // Boolean array to keep track of visited nodes during DFS.
    var status = [];    // Declared but not used.
    var ord = [];       // Discovery time (order) for each node in DFS.
    var lowlink = [];   // Lowest discovery time reachable from a node (or its descendants) via one back-edge.
    var bridges = [];   // Stores identified bridges.
    var used_e = [];    // Tracks if an edge has been "used" to traverse during DFS, for back-edge detection.


    // --- Initialization Loop for Graph Structures ---
    for(var i = 0 ; i < V ; i++)
    {
        real_edge[i] = []; // Initialize adjacency list for vertex 'i'.
        mark[i] = false;   // Mark all nodes as unvisited.

        // ord: Discovery time, initialized to 0.
        // lowlink: Initialized to V (a value greater than any possible ord).
        // The Japanese comments in the original code seem to explain these concepts:
        // ord?????????  (ord: discovery order?)
        // lowlink??????(dfs????????????????§????){0,}??¨(?????????){0,1}??§?????????ord???????°????
        // ?????????????????????????§???????°???????ord
        ord[i] = 0;
        lowlink[i] = V;
        bridges[i] = []; // Each element will store bridges originating from 'i'.

        used_e[i] = [];  // Initialize 2D array for used edges.
        for(var j = 0 ; j < V ; j++)
        {
            used_e[i][j] = false; // Mark all edges as unused initially.
        }
    }

    // --- Populate Adjacency List from Input Lines ---
    lines.forEach
    (
        function(edge)
        {
            var a = edge[0]; // First vertex of the edge.
            var b = edge[1]; // Second vertex of the edge.

            real_edge[a].push(b); // Add 'b' to 'a's adjacency list.
            real_edge[b].push(a); // Add 'a' to 'b's adjacency list (undirected graph).
        }
    );

    var no = 0;   // Global counter for discovery order (ord).
    var prev = 0; // Declared but not used in the current code.

    /*
     * Depth-First Search (DFS) function to compute discovery times (ord)
     * and low-link values for bridge detection.
     */
    function dfs(now_point)
    {
        // now_point????????¨??????????????? (now_point: current node)
        // now_ord????????¨??????????????? (now_ord: current order, this seems to refer to 'no')
        // mark????¨??????????????????? (mark: visited status)

        var np = now_point;     // Alias for the current node.
        var mk = mark;          // Alias for the visited array.
        var targets = real_edge[np]; // Neighbors of the current node.

        mk[np] = true;          // Mark the current node as visited.
        ord[np] = no;           // Assign discovery time.
        lowlink[np] = no;       // Initialize low-link value with discovery time.
        no++;                   // Increment global discovery counter.

        targets.forEach
        (
            function(target)
            {
                if(!mk[target])
                {
                    // ???????????£????????¨????????? (If target is not visited)
                    // ??¢?´¢????????? (Explore the target)
                    // log(np+" -> "+target); // Debugging line, commented out.

                    // Mark the edge (np, target) as used in both directions.
                    // This prevents treating the parent-child edge as a back-edge.
                    used_e[np][target] = true;
                    used_e[target][np] = true;

                    try
                    {
                        dfs(target); // Recursively call DFS on the unvisited neighbor.
                    }
                    catch(e)
                    {
                        // This catch block simply re-calls dfs(target) on error.
                        // It's an unusual pattern and might indicate a specific error handling
                        // or a placeholder in the original context.
                        dfs(target);
                    }

                    // ?????\????????????lowlink????????? (After returning from recursive call, update lowlink)
                    // ???????????????????±????lowlink???????°???????lowlink????????¨??????
                    // Update lowlink[np] with the minimum of its current value and lowlink[target].
                    // This propagates the lowest reachable discovery time from children.
                    lowlink[np] = Math.min(lowlink[np], lowlink[target]);
                }
                else if(!used_e[target][np])
                {
                    // ????????? (If target is visited AND the edge (target, np) has not been used for traversal)
                    // This indicates a back-edge to an ancestor.
                    // lowlink?????´??° (Update lowlink)
                    // ????°???????????????? (Update with the discovery time of the ancestor)
                    lowlink[np] = Math.min(lowlink[np], ord[target]);
                    // log(np+" => "+target); // Debugging line, commented out.
                }
            }
        );
    } // End of dfs function.

    // Start DFS from vertex 0 (assuming the graph is connected or we only care about the component containing 0).
    dfs(0);

    // log(ord);      // Debugging: print discovery times.
    // log(lowlink);  // Debugging: print low-link values.

    // --- Bridge Detection Logic ---
    lines.forEach
    (
        function(edge)
        {
            var u = edge[0]; // Original first vertex.
            var v = edge[1]; // Original second vertex.

            // Ensure 'u' has a smaller discovery time than 'v' for consistent comparison.
            // This is important for determining parent-child relationships in the DFS tree.
            if(ord[u] > ord[v])
            {
                var k = u; // Temporary variable for swapping.
                u = v;
                v = k;
            }

            // A bridge (u,v) exists if the low-link value of 'v' is greater than
            // the discovery time of 'u'. This means there's no back-edge from 'v'
            // or its descendants that can reach 'u' or an ancestor of 'u'.
            if(ord[u] < lowlink[v])
            {
                // ???????????? (It's a bridge!)
                var min = Math.min(u,v); // Get the smaller vertex index.
                var max = Math.max(u,v); // Get the larger vertex index.
                bridges[min].push(max);  // Store the bridge (min, max).
            }
        }
    );

    // --- Sort Bridges for Consistent Output ---
    bridges = bridges.map
    (
        function(e)
        {
            // Sort the list of bridges for each starting vertex.
            // The custom comparison function `b < a` implies descending order.
            // For numerical sort, `a - b` or `b - a` is standard.
            // The original `b < a` will sort numerically in descending order.
            return e.sort
            (
                function(a, b)
                {
                    return b < a;
                }
            );
        }
    );

    // --- Output Detected Bridges ---
    for(var s = 0 ; s < V ; s++)
    {
        var len = bridges[s].length; // Number of bridges starting from vertex 's'.
        for(var td = 0 ; td < len ; td++)
        {
            var t = bridges[s][td]; // The other end of the bridge.
            log(s + " " + t);       // Print the bridge in the format "s t".
        }
    }
}