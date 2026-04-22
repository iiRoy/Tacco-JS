/*
 * This is the main processing function for the given input.
 * It parses input data, builds a graph-like structure, and
 * then calculates the longest path using dynamic programming.
 */
function Main(  input  )
{
    // Split the input string into an array of lines.
    input = input.split(  "\n"  )  ;

    // Parse N and M from the first line of input.
    var   N   =   parseInt  (  input  [  0  ]  .  split  (  " "  )  [  0  ]  )  ;
    var   M   =   parseInt  (  input  [  0  ]  .  split  (  " "  )  [  1  ]  )  ;

    // Initialize an array to represent an adjacency list (or similar structure).
    // The size is N+1 to accommodate 1-based indexing if necessary.
    var   list   =   new   Array  (  N  +  1  )  ;

    // Initialize a Set to store unique nodes encountered.
    var   set   =   new   Set  (  )  ;

    // Remove the first line of input, as N and M have already been processed.
    input  .  shift  (  )  ;

    // Process the remaining input lines to build 'x'.
    // Each line is split by space, and elements are parsed as integers.
    x   =   input  .  map  (  i   =>   i  .  split  (  " "  )  .  map  (  i   =>   parseInt  (  i  )  )  )  ;

    // Remove the last two elements from 'x'. This might be for specific problem constraints.
    x  .  pop  (  )  ;
    x  .  pop  (  )  ;


    // Populate the 'list' (adjacency list) and 'set' (unique nodes).
    x  .  map  (  function  (  value  )
    {
        // If the source node's entry in 'list' is undefined, initialize it as an empty array.
        if  (  list  [  value  [  0  ]  ]   ==   undefined  )
        {
            list  [  value  [  0  ]  ]   =   [  ]  ;
        }
        // Add the destination node to the source node's list.
        list  [  value  [  0  ]  ]  .  push  (  value  [  1  ]  )  ;

        // Add the source node to the set of unique nodes.
        set  .  add  (  value  [  0  ]  )  ;
    }  )  ;


    // Convert the set of unique nodes into an array 's'.
    var   s   =   [  ...  set  ]  ;

    // Initialize a dynamic programming array 'dp' with -1, representing uncomputed states.
    var   dp   =   new   Array  (  N  +  1  )  .  fill  (  -  1  )  ;

    // Initialize the answer variable.
    var   ans  =  0  ;


    // Iterate through the unique source nodes to compute longest paths.
    for  (  var   i  =  0  ;   i  <  s  .  length  ;   i  ++  )
    {
        // Compute the longest path starting from node s[i].
        dp  [  s  [  i  ]  ]   =   count  (  s  [  i  ]  )  ;

        // Update the overall maximum answer.
        ans   =   Math  .  max  (  dp  [  s  [  i  ]  ]  ,  ans  )  ;
    }


    // This is a helper function to recursively count the longest path from a given node 'a'.
    function   count  (  a  )
    {
        // If the result for node 'a' is already computed (memoization).
        if  (  dp  [  a  ]   !=   -  1  )
        {
            return   dp  [  a  ]  ;
        }
        else
        {
            // If the node 'a' has no outgoing edges (it's a sink node in the current context).
            if  (  list  [  a  ]   ==   undefined  )
            {
                dp  [  a  ]   =   0  ; // Longest path from a sink node is 0.
                return   0  ;
            }
            var   max  =  0  ; // Initialize max path length for children.

            // Iterate through all children (neighbors) of node 'a'.
            for  (  var   i  =  0  ;   i  <  list  [  a  ]  .  length  ;   i  ++  )
            {
                var   cnt  =  0  ; // Current path length through a child.


                // Recursively call count for the child and add 1 (for the current edge).
                cnt   =   count  (  list  [  a  ]  [  i  ]  )   +   1  ;


                // Update the maximum path found so far from 'a' through its children.
                var   max   =   Math  .  max  (  max  ,  cnt  )  ;

                // Reset cnt (this line seems redundant in original logic, but must be kept).
                cnt  =  0  ;
            }
            return   max  ; // Return the maximum path length from node 'a'.

        }
    }


    // Output the final answer to the console.
    console  .  log  (  '%s'  ,   ans  )  ;
    return   ans  ; // Also return the answer for external use (e.g., testing).
}

// This function is typically used for debugging purposes in a web environment.
// It simulates button clicks and checks the output against expected values.
/*
 * Function: debug(n)
 * Purpose:  Simulates a test case execution by taking input from a DOM element,
 *           running the Main function, and displaying the result (AC/WA).
 * Parameter: n - An identifier for the input/output elements.
 */
function   debug  (  n  )
{
    var   input   =   document  .  getElementById  (  "input"  +  n  )  .  value  ;
    var   ans   =   Main  (  input  )  ;
    var   result  =  "WA"  ; // Default result is Wrong Answer.

    // Compare the computed answer with the expected output from a DOM element.
    if  (  ans   ==   document  .  getElementById  (  "output"  +  n  )  .  value  .  split  (  "\n"  )  [  0  ]  )
    {
        result  =  "AC"  ; // If they match, it's Accepted.
    }
    // Update the result display in the DOM.
    document  .  getElementById  (  "result"  +  n  )  .  innerHTML  =  result  ;
}

// This line executes the Main function with input read from standard input,
// which is common in competitive programming environments.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;