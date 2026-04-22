/*
 * This module is designed to read input from standard input,
 * process it to build an adjacency matrix, and then print
 * the resulting matrix to standard output.
 */
( function  processInputData  (  )   {
  // Acquire the file system module to read data.
  // Read all incoming data from the standard input stream.
  const   inputRows   =   require ( 'fs' )
                            .   readFileSync ( '/dev/stdin' ,   'utf8' )
                            .   trim ( )
                            .   split ( '\n' )
  ;


  /*
   * The first line of input specifies the size of the square matrix.
   * We extract this value and convert it to a numerical format.
   */
  const   matrixSize   =   Number (   inputRows.shift( )   )
  ;

  // Initialize a square matrix with dimensions matrixSize x matrixSize.
  // All elements are initially set to zero, representing no connections.
  const   adjacencyMatrix   =   Array
                                .   from (
                                      Array (   matrixSize   ) ,
                                      (   )   =>   Array.from (
                                            Array (   matrixSize   ) ,
                                            (   )   =>   0
                                      )
                                )
  ;


  // Iterate through each subsequent input row to populate the adjacency matrix.
  inputRows
    .   forEach (   (   currentRow   ,   rowIndex   )   =>   {
      // Split the current row by spaces, then discard the first two elements.
      // The remaining elements represent connected nodes for the current rowIndex.
      currentRow
        .   split ( ' ' )
        .   splice (   2   )
        .   forEach (   (   elementValue   )   =>   {
              // Convert the element value to a number and adjust for 0-based indexing.
              // Mark the connection in the adjacency matrix with a '1'.
              adjacencyMatrix [   rowIndex   ] [   Number (   elementValue   )   -   1   ]   =   1
            }
        )
    } )
  ;


  // Format the resulting adjacency matrix for output.
  // Each row's elements are joined by a space, and rows are joined by a newline.
  console
    .   log (
          adjacencyMatrix
            .   map (   (   outputRow   )   =>   outputRow.join ( ' ' )   )
            .   join ( '\n' )
    )
  ;

} ) ( )
;