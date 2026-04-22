function    Scanner (   input   )    {   /* This is the constructor function for the Scanner utility.
                                                                  It initializes the scanner with the provided input string. */

    var     self    =   this;   //  A reference to the current Scanner instance.

    self    .   itemNo  =   0   ;   //  Keeps track of the current item index.

    self    .   orgStr  =   input   ;   //  Stores the original input string.

    self    .   splitedStrs =   (   function    (   target  )   {   // An immediately invoked function expression (IIFE)
                                                                // to process the input string and split it into an array.

            var     result  =   [   ]   ;   // Array to hold the processed string fragments.

            var     target  =   target  .   replace (   /[\n \t]+/g ,   " " )   ;   // Replace multiple newlines, spaces, and tabs with a single space.

            var     strs    =   target  .   split   (   " " )   ;   // Split the cleaned string by spaces.

            for     (   var     i   =   0   ,   len =   strs    .   length  ;   i   <   len ;   i   ++  )   {   // Iterate through the split parts.

                result  .   push    (   strs    [   i   ]   )   ;   // Add each part to the result array.

            }

            return  result  ;   // Return the array of split strings.

        }   (   input   )   )   ;   // The IIFE is called with the original input.



    self    .   next    =   function    (   )   {   // Method to get the next string token.

        var     result  =   self    .   splitedStrs [   self    .   itemNo  ]   ;   // Get the string at the current item number.

        self    .   itemNo  ++  ;   // Increment the item number for the next call.

        return  (   result  !=  null    )   ?   result  :   null    ;   // Return the result, or null if it's undefined.

    }



    self    .   nextInt =   function    (   )   {   // Method to get the next integer token.

        var     result  =   self    .   splitedStrs [   self    .   itemNo  ]   ;   // Get the string at the current item number.

        self    .   itemNo  ++  ;   // Increment the item number.

        return  (   result  !=  null    )   ?   parseInt    (   result  )   :   null    ;   // Parse and return as an integer.

    }



    self    .   nextBigDecimal  =   function    (   )   {   // Method to get the next floating-point number token.

        var     result  =   self    .   splitedStrs [   self    .   itemNo  ]   ;   // Get the string at the current item number.

        self    .   itemNo  ++  ;   // Increment the item number.

        return  (   result  !=  null    )   ?   parseFloat  (   result  )   :   null    ;   // Parse and return as a float.

    }



    self    .   nextByte    =   function    (   )   {   // Method to get the next byte (Int8Array) token.

        var     result  =   self    .   splitedStrs [   self    .   itemNo  ]   ;   // Get the string at the current item number.

        self    .   itemNo  ++  ;   // Increment the item number.

        return  (   result  !=  null    )   ?   new Int8Array   (   result  )   :   null    ;   // Create and return a new Int8Array.

    }

}



function    Main    (   sc  )   {   /* This is the main function where the program logic resides.
                                   It takes a Scanner instance as an argument to read input. */


    var     N   =   sc  .   nextInt (   )   ;   // Read the first integer, which is N (number of nodes).

    var     anss    =   [   ]   ;   // An array to store the final answers for each node.


    wrtnObj =   {   }   ;   // An object to store the 'written' (value) for each node ID.
    for     (   var     i   =   0   ;   i   <   N   ;   i   ++  )   {   // Loop N times to read N node values.

        wrtnObj [   i   +   1   ]   =   sc  .   nextInt (   )   ;   // Assign the read integer to the node ID (i+1).

    }


    orderedSubTree  =   {   }   ;   // An object to represent the adjacency list of the tree.
    for     (   var     i   =   0   ;   i   <   N   -   1   ;   i   ++  )   {   // Loop N-1 times to read N-1 edges.

        var     n1  =   sc  .   nextInt (   )   ;   // Read the first node of an edge.

        var     n2  =   sc  .   nextInt (   )   ;   // Read the second node of an edge.

        if      (   !   orderedSubTree  [   n1  ]   ) orderedSubTree  [   n1  ]   =   [   n2  ]   ;   // If n1 not in tree, initialize with n2.
        else    orderedSubTree  [   n1  ]   .   push    (   n2  )   ;   // Otherwise, add n2 to n1's neighbors.

        if      (   !   orderedSubTree  [   n2  ]   ) orderedSubTree  [   n2  ]   =   [   n1  ]   ;   // If n2 not in tree, initialize with n1.
        else    orderedSubTree  [   n2  ]   .   push    (   n1  )   ;   // Otherwise, add n1 to n2's neighbors.

    }


    // This section defines a recursive function to traverse the tree and
    // collect the 'written' numbers along the path from the root to each node.
    wrtnNoLists =   {   }   ;   // Object to store the list of 'written' numbers for each node.

    crawlNode   =   function    (   tgtNo   ,   fromNo  ,   wrtnNos )   {   // Recursive function for tree traversal.

        wrtnNos =   wrtnNos .   concat  (   )   ;   // Create a shallow copy of the current path to avoid side effects.

        // Append the current node's value to the path and finalize it for this node.
        wrtnNos .   push    (   wrtnObj [   tgtNo   ]   )   ;

        wrtnNoLists [   tgtNo   ]   =   wrtnNos ;   // Store the path for the target node.

        var     directionObj    =   orderedSubTree  [   tgtNo   ]   ;   // Get neighbors of the current node.

        if      (   directionObj    )   {   // Check if the current node has neighbors.

            for     (   var     i   =   0   ;   i   <   directionObj  .   length  ;   i   ++  )   {   // Iterate through neighbors.

                var     nextNo  =   directionObj    [   i   ]   ;   // Get the next neighbor node ID.

                if      (   fromNo  !=  nextNo    )   {   // Avoid going back to the parent node.

                    crawlNode   (   nextNo  ,   tgtNo   ,   wrtnNos )   ;   // Recursively call for the next node.

                }

            }

        }

    }

    crawlNode   (   1   ,   -1  ,   [   ]   )   ;   // Start the tree traversal from node 1, with -1 as a dummy parent.


    for     (   var     i   =   1   ;   i   <=  N   ;   i   ++  )   {   // Iterate from node 1 to N.

        var     list    =   wrtnNoLists [   i   ]   ;   // Get the list of 'written' numbers for the current node.

        var     list2   =   [   ]   ;   // This list will store the longest increasing subsequence (LIS) or similar.

        for     (   var     j   =   0   ;   j   <   list    .   length  ;   j   ++  )   {   // Iterate through the numbers in the path.

            var     wk  =   list    [   j   ]   ;   // Current number from the path.

            if      (   list2   .   length  ==  0   )   {   // If list2 is empty, just add the number.

                list2   .   push    (   wk  )   ;

            }
            // If the current number is greater than the last element in list2, append it.
            else    if  (   wk  >   list2   [   list2   .   length  -   1   ]   )   {

                list2   .   push    (   wk  )   ;

            }
            // If the current number is less than or equal to the first element in list2, replace the first element.
            else    if  (   wk  <=  list2   [   0   ]   )   {

                list2   [   0   ]   =   wk  ;

            }
            // Otherwise (wk is somewhere in the middle), find the smallest element in list2
            // that is greater than or equal to wk and replace it.
            else    {

                for     (   var     k   =   1   ;   k   <   list2   .   length  ;   k   ++  )   {   // Search within list2.

                    if      (   list2   [   k   -   1   ]   <   wk  &&  wk  <=  list2   [   k   ]   )   {   // Found the position.

                        list2   [   k   ]   =   wk  ;   // Replace the element.

                        break   ;   // Exit the inner loop.

                    }

                }

            }

        }

        anss    .   push    (   list2   .   length  )   ;   // Add the length of the processed list (LIS length) to the answers.

    }


    console .   log   (   anss    .   join  (   "\n"    )   )   ;   // Print all answers, each on a new line.

}

// Invoke the Main function with a new Scanner instance.
// The Scanner reads input from standard input (e.g., a file or piped data).
Main  (   new Scanner (   require (   "fs"    )   .   readFileSync (   "/dev/stdin"    ,   "utf8"  )   )   )   ;

// Example of how to use the Scanner for debugging with a hardcoded string:
// Main( new Scanner ( "33" ) ) ;

/*
// Some commented out examples of Scanner usage:
var str1 = sc.next();          // Get next token as String
var int1 = sc.nextInt();       // Get next token as int
var bd1 = sc.nextBigDecimal(); // Get next token as BigDecimal (float in JS)
var byte1 = sc.nextByte();     // Get next token as byte (Int8Array in JS)

// A simple loop to introduce a delay (for performance testing, perhaps):
for (var i = 0; i < 1000000000; i++) var toDelay = "aaa"; // Approximately 1000ms delay

// Debugging line:
// console.log(wrtnNos); return;
*/