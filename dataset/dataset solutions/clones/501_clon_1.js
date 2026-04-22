// This JavaScript program processes multiple test cases,
// each representing a graph problem. It reads graph data
// from standard input and computes a specific value for each case.
// The problem likely involves finding shortest paths or similar
// computations on a graph with certain state transitions.

var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// The input string is first trimmed of leading/trailing whitespace,
// then split into an array of lines based on newline characters.
var arr = input.trim().split("\n");


// This outer loop processes each test case.
// It continues indefinitely until a specific termination condition is met.
while (true)
{

        // The first line of each test case contains two numbers, N and M.
        // These are shifted from the 'arr', split by space, and converted to numbers.
    var nm = arr.shift().split(" ").map(Number);


        // Check for the termination condition: if both N and M are 0,
        // it signifies the end of input, and the program breaks the loop.
    if ( nm.join(" ") == "0 0" )
        break;


    // N represents the number of nodes in the graph.
    var n = nm[0];

    // M represents the number of edges in the graph.
    var m = nm[1];


    // 'c' seems to denote the number of states or dimensions
    // used in the dynamic programming approach.
    var c = 2;


    // 's' is typically the starting node for pathfinding algorithms.
    var s = 1;

    // 'd' is the destination node for which the final answer is sought.
    var d = n;


    // 'ary' will store the details of each edge in the graph.
    // Each element will be an array representing an edge [nodeA, nodeB, weight].
    var ary = [];

    // Loop to read all M edges for the current test case.
    // Each edge is read from a new line in the input array.
    for ( var i = 0 ; i < m ; i++ )
    {
        ary.push( arr.shift().split(" ").map(Number) );
    }


    // 'dp' is the dynamic programming table.
    // It's a 2D array used to store minimum costs or values
    // for reaching a node in a specific state.
    var dp = [];


    // Initialize the 'dp' table.
    // All entries are set to Infinity, representing unreachable states initially.
    for ( var i = 0 ; i <= n ; i++ )
    {
        dp[i] = [];
        for ( var j = 0 ; j <= c ; j++ )
        {
            dp[i][j] = Infinity;
        }
    }

    // Set the initial state for the starting node 's'.
    // The cost to reach 's' in state 0 is 0.
    dp[s][0] = 0;


    // 'bomb' acts as a queue for a Breadth-First Search (BFS) or
    // similar graph traversal algorithm. It holds nodes to be processed.
    var bomb = [s];


    // 'obj' is a hash map (object) used to keep track of visited nodes
    // to avoid redundant processing, similar to a 'visited' array in BFS.
    var obj = {};


    // This inner loop performs the graph traversal and DP updates.
    // It continues as long as there are nodes in the 'bomb' queue.
    while (true)
    {
        // If the queue is empty, all reachable nodes have been processed.
        if ( bomb.length == 0 )
            break;

        // Dequeue the next node to process.
        var S = bomb.shift();

        // If this node has already been fully processed, skip it.
        if ( obj.hasOwnProperty(S) )
            continue;

        // Mark the current node 'S' as processed.
        obj[S] = true;


        // Iterate through all edges in the graph.
        // This suggests a non-adjacency list representation or a need to check all edges.
        ary.forEach(function(v)
        {
            // Extract the two connected nodes (a, b) and the edge weight (f).
            var a = v[0];
            var b = v[1];
            var f = v[2];

            // If the current processed node 'S' is the source of this edge.
            if (a == S)
            {
                // Update DP values for node 'b' based on paths from 'a'.
                // These updates involve different states (0, 1, 2).
                dp[b][0] = Math.min(dp[b][0], dp[a][0] + f);
                dp[b][1] = Math.min(dp[b][1], dp[a][0]);
                dp[b][2] = Math.min(dp[b][2], dp[a][1]);
                dp[b][2] = Math.min(dp[b][2], dp[a][2] + f);

                // Add node 'b' to the queue for future processing.
                bomb.push(b);
            }
            // Else if the current processed node 'S' is the destination of this edge.
            else if (b == S)
            {
                // Update DP values for node 'a' based on paths from 'b'.
                // Similar updates across different states.
                dp[a][0] = Math.min(dp[a][0], dp[b][0] + f);
                dp[a][1] = Math.min(dp[a][1], dp[b][0]);
                dp[a][2] = Math.min(dp[a][2], dp[b][1]);
                dp[a][2] = Math.min(dp[a][2], dp[b][2] + f);

                // Add node 'a' to the queue for future processing.
                bomb.push(a);
            }

            // This line appears to be a specific rule or reset condition.
            // It sets dp[d][1] (cost to reach destination 'd' in state 1) to Infinity.
            // This might imply that certain paths or states to 'd' are invalid or need recalculation in a specific way.
            dp[d][1] = Infinity;
        });

    } // End of inner while loop (graph traversal)


    // After the graph traversal and DP table population,
    // calculate the final answer.
    // 'ans' will store the minimum value found among all states
    // for the destination node 'd'.
    var ans = Infinity;

    // Iterate through the DP values for the destination node 'd'.
    dp[d].forEach(function(v, i)
    {
        // Update 'ans' with the minimum value encountered.
        ans = Math.min(ans, v);
    });

    // Print the final calculated answer for the current test case.
    console.log(ans);

} // End of outer while loop (test case processing)