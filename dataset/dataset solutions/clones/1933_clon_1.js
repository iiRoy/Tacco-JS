function Scanner ( input )
{
    // Initialize the scanner instance.
    var self = this;

    self.itemNo = 0 ; // Current index for reading items.

    self.orgStr = input ; // Stores the original input string.

    /*
     * This immediately-invoked function expression (IIFE) processes the input
     * string into an array of individual tokens, handling whitespace.
     */
    self.splitedStrs = (function( target )
    {
        var result = []; // Array to hold the cleaned and split strings.

        // Normalize whitespace: replace multiple newlines, spaces, or tabs with a single space.
        var target = target.replace( /[\n \t]+/g, " " );

        // Split the normalized string by spaces to get individual tokens.
        var strs = target.split( " " );

        // Iterate through the split strings and push them into the result array.
        for ( var i = 0, len = strs.length; i < len; i++ )
        {
            result.push( strs[i] ); // Add each token.
        }

        return result; // Return the array of tokens.
    }( input ) ); // The 'input' argument is passed to the IIFE.


    // Method to retrieve the next available string token from the processed list.
    self.next = function ( )
    {
        var result = self.splitedStrs[ self.itemNo ]; // Get the string at the current position.
        self.itemNo++; // Advance the internal pointer to the next item.

        // Return the token if it exists; otherwise, return null.
        return (result != null) ? result : null;
    }


    // Method to retrieve the next token and parse it as an integer.
    self.nextInt = function ( )
    {
        var result = self.splitedStrs[ self.itemNo ]; // Fetch the string token.
        self.itemNo++; // Increment the item number.

        // Convert to an integer using parseInt() if the result is not null.
        return (result != null) ? parseInt(result) : null;
    }


    // Method to retrieve the next token and parse it as a floating-point number (BigDecimal equivalent).
    self.nextBigDecimal = function ( )
    {
        var result = self.splitedStrs[ self.itemNo ]; // Get the string token.
        self.itemNo++; // Move to the subsequent item.

        // Parse the string to a float using parseFloat() if a token is available.
        return (result != null) ? parseFloat(result) : null;
    }


    // Method to retrieve the next token and attempt to create an Int8Array from it.
    self.nextByte = function ( )
    {
        var result = self.splitedStrs[ self.itemNo ]; // Obtain the string token.
        self.itemNo++; // Update the position.

        // If a token exists, create a new Int8Array; otherwise, return null.
        return (result != null) ? new Int8Array(result) : null;
    }

} // End of Scanner function definition.



function Main ( sc )
{
    // Read the initial integer N from the scanner, which often represents the number of nodes or items.
    var N = sc.nextInt( );

    // This array will store the final answers after processing.
    var anss = [];


    // Global object to store 'written' numbers, indexed from 1 to N.
    wrtnObj = {};

    // Populate wrtnObj with N integers read from the scanner.
    for ( var i = 0 ; i < N ; i++ )
    {
        wrtnObj[i + 1] = sc.nextInt(); // Assign the next integer to the (i+1)-th key.
    }


    // Global object to represent the tree structure using an adjacency list.
    orderedSubTree = {};

    // Build the tree by reading N-1 edges.
    for ( var i = 0 ; i < N - 1 ; i++ )
    {
        var n1 = sc.nextInt(); // Read the first node of an edge.
        var n2 = sc.nextInt(); // Read the second node of an edge.

        // Add n2 to n1's adjacency list.
        if ( !orderedSubTree[n1] )
        {
            orderedSubTree[n1] = [n2]; // If n1 not seen, create new list.
        }
        else
        {
            orderedSubTree[n1].push(n2); // Otherwise, push n2 to existing list.
        }

        // Add n1 to n2's adjacency list (representing an undirected edge).
        if ( !orderedSubTree[n2] )
        {
            orderedSubTree[n2] = [n1]; // If n2 not seen, create new list.
        }
        else
        {
            orderedSubTree[n2].push(n1); // Otherwise, push n1 to existing list.
        }
    }


    // --- Tree Traversal Section ---
    // 日本語コメント: 木をたどって要素を順に取得していく (Traverse the tree to sequentially acquire elements)

    // Global object to store lists of 'written' numbers for each node during traversal.
    wrtnNoLists = {};

    // Global queue to manage nodes for traversal (e.g., BFS or iterative DFS).
    nexts = [];


    // Function to perform a crawl from a given target node, knowing its parent.
    crawlNode = function ( tgtNo, fromNo )
    {
        // Copy the list of 'written' numbers from the parent node, or start with an empty list if no parent.
        wrtnNos = (wrtnNoLists[fromNo]) ? wrtnNoLists[fromNo].concat() : [];

        // 日本語コメント: 自分の数字を詰め込んで、確定 (Pack my own number and confirm)
        // Add the current node's 'written' number to its list.
        wrtnNos.push( wrtnObj[tgtNo] );

        // Store this updated list for the current target node.
        wrtnNoLists[tgtNo] = wrtnNos;

        var directionObj = orderedSubTree[tgtNo]; // Get the neighbors (connected nodes) of the current node.

        if ( directionObj )
        {
            // Iterate through all neighbors.
            for ( var i = 0 ; i < directionObj.length ; i++ )
            {
                var nextNo = directionObj[i]; // Get the next neighbor node.

                // If the neighbor is not the node we just came from, add it to the queue for processing.
                if ( fromNo != nextNo )
                {
                    nexts.push( [nextNo, tgtNo] ); // Push the neighbor and current node (as its parent).
                }
            }
        }
    }


    // Initialize the traversal: start from node 1, with a dummy parent -1.
    nexts.push( [1, -1] );

    // Loop to process nodes from the 'nexts' queue.
    // The 'dbg' counter acts as a safeguard against excessively long or infinite loops.
    for ( var dbg = 0 ; dbg < 10000000 ; dbg++ )
    {
        var next = nexts.shift(); // Retrieve the next node pair to process (FIFO).
        crawlNode( next[0], next[1] ); // Call the crawling function with the target and parent nodes.

        if ( nexts.length == 0 )
        {
            break; // If the queue is empty, all reachable nodes have been processed.
        }
    }

    // Log the 'wrtnNos' variable, which will hold the list from the last crawled node.
    console.log( wrtnNos );

    // The original code includes a 'return' statement here, which makes the subsequent code unreachable.
    return;


    // --- Unreachable Code Block (due to 'return' above) ---
    // This section seems to be an attempt to calculate something akin to the Longest Increasing Subsequence (LIS)
    // for the lists of numbers associated with each node.
    for ( var i = 1 ; i <= N ; i++ )
    {

        var list = wrtnNoLists[i]; // Get the list of numbers for the current node 'i'.
        var list2 = []; // This list will store the increasing subsequence.

        for ( var j = 0 ; j < list.length ; j++ )
        {
            var wk = list[j]; // Current number being considered.

            // If list2 is empty, simply add the first number.
            if ( list2.length == 0 )
            {
                list2.push(wk);
            }
            // If the current number is greater than the last element in list2, append it.
            else if ( wk > list2[list2.length - 1] )
            {
                list2.push(wk);
            }
            // If the current number is less than or equal to the first element in list2, replace the first.
            else if ( wk <= list2[0] )
            {
                list2[0] = wk;
            }
            // Otherwise, the number falls somewhere in the middle. Find its place to maintain an increasing sequence.
            else
            {
                for ( var k = 1 ; k < list2.length ; k++ )
                {
                    // Find the first element in list2 that is greater than or equal to 'wk'.
                    if ( list2[k-1] < wk && wk <= list2[k] )
                    {
                        list2[k] = wk; // Replace that element with 'wk'.
                        break; // Exit inner loop after replacement.
                    }
                }
            }
        }
        anss.push( list2.length ); // Store the length of the longest increasing subsequence found for this node.
    }

    // This line is also unreachable. It would print the final answers joined by newlines.
    console.log( anss.join("\n") );
}


// --- Script Entry Point ---
// Creates a new Scanner instance, reading input from '/dev/stdin' using Node.js 'fs' module.
Main( new Scanner( require("fs").readFileSync("/dev/stdin", "utf8") ) );


// --- Original commented-out lines (preserved as comments) ---

// Main(new Scanner("33")); // Example call with a hardcoded string input.

// var str1 = sc.next(); // 日本語コメント: Stringで取得 (Get as String)
// var int1 = sc.nextInt(); // 日本語コメント: intで取得 (Get as int)
// var bd1 = sc.nextBigDecimal(); // 日本語コメント: BigDecimalで取得 (Get as BigDecimal)
// var byte1 = sc.nextByte(); // 日本語コメント: byteで取得 (Get as byte)
// for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // 日本語コメント: 1000msくらいの遅延 (Approx 1000ms delay)
// console.log(wrtnNos); return; // This line was part of the original comments, but 'return' in Main already makes it irrelevant.