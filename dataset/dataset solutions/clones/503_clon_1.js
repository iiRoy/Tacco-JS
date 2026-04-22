var     input   =   require('fs') .readFileSync('/dev/stdin', 'utf8')   ; // Read entire input from standard input as a UTF-8 string

// This line processes the raw input string.
// - .trim() removes leading/trailing whitespace.
// - .split("\n") splits the string into an array of lines.
var arr = input .trim() .split("\n")  ;


// The main processing loop continues until a specific termination condition is met.
while(true)
{

    // Extract the first line from the array, split it by space, and convert parts to numbers.
    // 'nm' typically represents 'nodes' and 'edges' or similar parameters for a graph problem.
    var nm  = arr.shift() .split(" ") .map(Number)  ;

    // Check for the termination condition: "0 0" indicates end of input.
    if  (  nm.join(" ") == "0 0"  )
        break  ; // Exit the loop if the condition is met.

    // Assign the extracted numbers to meaningful variables.
    var n   =   nm[0]  ; // 'n' usually represents the number of nodes.
    var m   =   nm[1]  ; // 'm' usually represents the number of edges.

    // These are problem-specific constants or initial values.
    var c   =   2  ; // A constant, possibly related to DP states.
    var s   =   1  ; // The starting node (source).
    var d   =   n  ; // The destination node (target).

    // 'ary' will store the graph's edges.
    var ary =   []  ;

    // Populate the 'ary' array with 'm' edges.
    // Each edge is read from a line, split, and converted to numbers.
    for(  var i = 0 ;   i < m  ;  i++  )
        ary.push( arr.shift() .split(" ") .map(Number) )  ;


    // 'dp' is a dynamic programming table.
    // It's typically used to store minimum costs or paths to reach a node with a certain state.
    var dp  =   []  ;

    // Initialize the DP table.
    // dp[i][j] will store the minimum value to reach node 'i' in state 'j'.
    for(  var i = 0  ;  i <= n  ;  i++  )
    {
        dp[i] = []  ; // Initialize inner array for each node.
        for(  var j = 0  ;  j <= c  ;  j++  )
        {
            dp[i][j] = Infinity  ; // Initialize with a very large value (infinity).
        }
    }

    // Set the initial state for the starting node 's'.
    // dp[s][0] = 0 means it costs 0 to reach node 's' in state 0.
    dp[s][0] = 0  ;

    // 'bomb' acts as a queue for a breadth-first search (BFS) or similar traversal.
    var bomb    =   [s]  ; // Start with the source node.

    // 'obj' is used to keep track of visited nodes to avoid redundant processing.
    var obj =   {}  ;


    // This inner loop performs the graph traversal (e.g., a modified Dijkstra or BFS).
    while(true)
    {
        // If the queue is empty, there are no more reachable nodes to process.
        if (  bomb.length == 0  )
            break  ; // Exit the inner loop.

        // Dequeue the next node to process.
        var S   =   bomb.shift()  ;

        // If the node has already been fully processed, skip it.
        if (  obj.hasOwnProperty(S)  )
            continue  ;

        // Mark the current node 'S' as processed.
        obj[S]  =   true  ;

        // Iterate over all edges to find neighbors of 'S'.
        ary.forEach(  function(v)
        {
            var a   =   v[0]  ; // First node of the edge.
            var b   =   v[1]  ; // Second node of the edge.
            var f   =   v[2]  ; // Cost/weight of the edge.

            // If 'a' is the current node 'S', then 'b' is a neighbor.
            if  (  a == S  )
            {
                // Iterate through different DP states (from 2 down to 0).
                for (  var i = 2  ;  i >= 0  ;  i--  )
                {
                    var v   =   dp[a][i]  ; // Current DP value for node 'a' in state 'i'.

                    // Update DP values for neighbor 'b' based on current state 'i'.
                    if  (  i == 0  )
                    {
                        dp[b][0] = Math.min(  dp[b][0]  ,  v + f  )  ; // Update state 0.
                        dp[b][1] = Math.min(  dp[b][1]  ,  v      )  ; // Update state 1.
                    }
                    else if (  i == 1  )
                    {
                        dp[b][2] = Math.min(  dp[b][2]  ,  v      )  ; // Update state 2.
                    }
                    else if (  i == 2  )
                    {
                        dp[b][2] = Math.min(  dp[b][2]  ,  v + f  )  ; // Update state 2.
                    }
                }
                bomb.push(b)  ; // Add neighbor 'b' to the queue for further processing.
            }
            // If 'b' is the current node 'S', then 'a' is a neighbor.
            else if (  b == S  )
            {
                // Similar logic as above, but updating for neighbor 'a'.
                for (  var i = 2  ;  i >= 0  ;  i--  )
                {
                    var v   =   dp[b][i]  ; // Current DP value for node 'b' in state 'i'.

                    // Update DP values for neighbor 'a'.
                    if  (  i == 0  )
                    {
                        dp[a][0] = Math.min(  dp[a][0]  ,  v + f  )  ; // Update state 0.
                        dp[a][1] = Math.min(  dp[a][1]  ,  v      )  ; // Update state 1.
                    }
                    else if (  i == 1  )
                    {
                        dp[a][2] = Math.min(  dp[a][2]  ,  v      )  ; // Update state 2.
                    }
                    else if (  i == 2  )
                    {
                        dp[a][2] = Math.min(  dp[a][2]  ,  v + f  )  ; // Update state 2.
                    }
                }
                bomb.push(a)  ; // Add neighbor 'a' to the queue.
            }
        }  )  ;
    }

    // Initialize the answer with infinity.
    var ans =   Infinity  ;

    // Iterate through the DP values for the destination node 'd'.
    // The problem might specify certain states to exclude or include for the final answer.
    dp[d] .forEach(  function(v,i)
    {
        // If the state index 'i' is not 1, consider its value for the minimum answer.
        if  (  i != 1  )
            ans = Math.min(ans,v)  ; // Update 'ans' if a smaller value is found.
    }  )  ;

    // Output the final calculated answer for the current test case.
    console.log(ans)  ;
}