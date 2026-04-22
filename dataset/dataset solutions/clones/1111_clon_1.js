/*
 * This script reads input from /dev/stdin,
 * processes it to represent a tree structure,
 * and then prints information about each node.
 * It's a single, highly chained operation.
 */

console
  .log // Log the final processed string to standard output.
  (
    require ( 'fs' ) // Import the Node.js file system module.
      . readFileSync (                               // Synchronously read the entire file.
                       '/dev/stdin',                 // Path to the standard input file.
                       'utf8'                        // Encoding for the file content.
                     )
      . trim ( )                                     // Remove leading/trailing whitespace from the content.
      . split (                                      // Split the string into an array of substrings.
                / [ | \n ] /                         // Delimiter: space or newline.
              )
      . slice ( 1 )                                  // Remove the first element (often an empty string or header).
      . map (                                        // Transform each element of the array.
              (
                k , // Current key (node value).
                i , // Current index in the sliced array.
                a   // The entire sliced array.
              ) => // Arrow function for the map operation.
                `node ${
                         ++ i // Increment index for 1-based node numbering.
                       }: key = ${
                                  k // Display the node's key.
                                }: `
                + // Concatenate with parent information if applicable.
                (
                  ( i - 1 )
                    ? // If not the root node (index > 0 after increment).
                      `parent key = ${
                                       a [
                                           Math
                                             . floor ( i / 2 ) // Calculate parent index for 1-based array.
                                           - 1                 // Adjust for 0-based array access.
                                         ]
                                     }, `
                    : // If it is the root node.
                      ''
                )
                + // Concatenate with left child information if applicable.
                (
                  ( 2 * i - 1 < a . length )
                    ? // Check if a left child exists.
                      `left key = ${
                                     a [
                                         2 * i
                                         - 1 // Calculate left child index for 0-based array access.
                                       ]
                                   }, `
                    : // If no left child.
                      ''
                )
                + // Concatenate with right child information if applicable.
                (
                  ( 2 * i < a . length )
                    ? // Check if a right child exists.
                      `right key = ${
                                      a [
                                          2 * i // Calculate right child index for 0-based array access.
                                        ]
                                    }, `
                    : // If no right child.
                      ''
                )
            )
      . join ( '\n' )                                 // Join the processed array elements back into a single string,
                                                      // separated by newlines.
  )
; // End of the console.log statement.