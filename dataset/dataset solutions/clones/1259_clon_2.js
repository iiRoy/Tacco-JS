// This module handles file system operations.
const   fileSystemModule  =   require ( 'fs' ) ;

// Retrieve all content from the standard input stream,
// decode it as UTF-8, and then split it into individual lines.
const   lineSegments    =   fileSystemModule
                                .  readFileSync  ( '/dev/stdin' ,  'utf8'  )
                                .  split ( '\n' ) ;

// Process each line segment and print the aggregated result to the console.
console . log (
    lineSegments
        .  map (  function  (  currentLineText  )  {
            // Parse the current line: split by space and convert parts to numbers.
            const   dimensionValues  =   currentLineText
                                            .  split ( ' ' )
                                            .  map (  Number  ) ;

            // Check if the first dimension value indicates termination (0).
            return   dimensionValues [  0  ]  ===  0
                ?   ''  // If the first value is 0, return an empty string.
                :   (  function  (  rowCount ,  columnCount  )  {
                        // Internal function to generate a pattern based on row and column counts.
                        // Create a string of '#' characters for a single row.
                        const   rowPatternString  =   Array (  columnCount  +  1  ) .  join (  '#'  ) ;
                        // Repeat the row pattern for the specified number of rows, adding newlines.
                        return   Array (  rowCount  +  1  ) .  join (  rowPatternString  .  concat ( '\n' )  ) ;
                    }  ) (  dimensionValues [  0  ] ,  dimensionValues [  1  ]  ) ; // Execute pattern generation immediately.
        }  )
        .  join ( '\n' ) // Combine all processed line outputs with newlines.
) ;