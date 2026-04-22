/*
 * This JavaScript program reads dependency information from standard input,
 * processes it to determine reachable nodes in a graph, and outputs a count.
 * It's designed to handle multiple test cases sequentially.
 */

// First, we import the 'fs' (file system) module, which is necessary
// for reading input from sources like '/dev/stdin' in Unix-like systems.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Next, the raw input string is processed.
// We remove any leading or trailing whitespace using 'trim()'.
// Then, the cleaned string is split into an array of lines based on the newline character.
var   Arr   =   (   input . trim ( )   ) . split ( "\n" ) ;


// This is the main processing loop. It continues indefinitely,
// handling one test case per iteration, until a specific termination
// condition (n == 0) is met.
while (   true   )
{
    // In each iteration, the first element is removed from the 'Arr' array.
    // This element is expected to be a number indicating the count of
    // subsequent dependency lines for the current test case.
    // The '-0' forcefully converts the string to a numeric type.
    var   n   =   Arr . shift ( )   -   0   ;

    // Check for the termination condition: if 'n' is 0, it means there are
    // no more test cases to process, so we break out of the main loop.
    if   (   n   ==   0   )
    {
        break   ; // Exit the loop when 'n' is zero.
    }


    // The next line in 'Arr' represents the initial set of active nodes.
    // It's split by a colon to separate the key from its dependencies.
    var   first   =   Arr . shift ( ) . split ( ":" ) ;

    // We take the second part (index 1), remove the trailing semicolon
    // using 'slice(0, -1)', and then split it by commas to get an array
    // of initial active node identifiers.
    first   =   first [ 1 ] . slice ( 0 , -1 ) . split ( "," ) ;

    // An empty object 'F' is initialized. This object will serve as a
    // hash map (or set) to keep track of all currently active nodes.
    var   F   =   { } ;

    // For each node 'v' in the 'first' array, we add it to 'F' with
    // a value of 'true', indicating it's an active node.
    first . forEach (   function (   v   )   {   F [ v ]   =   true   ;   }   ) ;


    // Another empty object 'obj' is initialized. This will store the
    // full dependency graph, where keys are nodes and values are arrays
    // of nodes that depend on the key.
    var   obj   =   { } ;

    // A loop runs 'n - 1' times to read the remaining dependency lines.
    // (The first dependency line was already handled for 'first').
    for   (   var   i   =   0   ;   i   <   n   -   1   ;   i ++   )
    {
        // Each line is read, split by a colon.
        var   arr   =   Arr . shift ( ) . split ( ":" ) ;

        // The first part of 'arr' (arr[0]) is the source node, and the
        // second part (arr[1]) contains its comma-separated dependencies.
        // Similar to 'first', we process arr[1] to get the array of dependent nodes.
        obj [ arr [ 0 ] ]   =   arr [ 1 ] . slice ( 0 , -1 ) . split ( "," ) ;
    }


    // 'L' stores the number of active nodes from the *previous* iteration
    // of the propagation loop. It's initialized to 0.
    var   L   =   0 ;

    // This nested loop propagates the "active" status through the dependency graph.
    // It continues until no new nodes become active in an iteration.
    while   (   true   )
    {
        // If the current number of active nodes is the same as in the
        // previous iteration ('L'), it means no new nodes were activated,
        // so the propagation is complete.
        if   (   L   ==   Object . keys ( F ) . length   )
        {
            break   ; // Exit the propagation loop.
        }

        // Update 'L' to the current count of active nodes for the next iteration's comparison.
        L   =   Object . keys ( F ) . length   ;

        // Iterate over each key 'k' in the 'F' object (which represents active nodes).
        for   (   var   k   in   F   )
        {
            // We check two conditions:
            // 1. 'obj.hasOwnProperty(k)' ensures 'k' is a node that has defined dependencies.
            // 2. 'F[k]' ensures 'k' is still considered an "active" node that needs its
            //    dependencies propagated. Once its dependencies are processed, F[k] is set to false.
            if   (   obj . hasOwnProperty ( k )   &&   F [ k ]   )
            {
                // For each node 'v' that 'k' depends on (from the 'obj' graph),
                // we mark 'v' as active in the 'F' object.
                obj [ k ] . forEach (   function (   v   )   {   F [ v ]   =   true   ;   }   ) ;

                // After propagating 'k''s dependencies, we mark 'k' as 'false' in 'F'.
                // This indicates that its dependencies have been processed, and it
                // doesn't need to be re-processed in subsequent iterations of this propagation loop.
                F [ k ]   =   false   ;
            }
        }
    }


    // 'cnt' will store the final count of truly active (reachable) nodes.
    var   cnt   =   0   ;

    // Iterate through all nodes in 'F' one last time.
    for   (   var   k   in   F   )
    {
        // If a node 'k' still has a value of 'true' in 'F', it means it was
        // initially active or became active through propagation and was not
        // subsequently marked as processed (false). These are the truly active nodes.
        if   (   F [ k ]   )
        {
            cnt ++   ; // Increment the counter for each such node.
        }
    }

    // Finally, print the calculated count for the current test case.
    console . log ( cnt ) ;

} // End of the main 'while (true)' loop.