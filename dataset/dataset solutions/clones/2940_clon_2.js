function ProcessInput ( rawData )
{
  // Split the entire input string into individual lines
  let textRows = rawData.split ( '\n' ) ;

  // Process the first line to get initial parameters
  let firstLineParts = textRows.shift().split ( ' ' ) ;

  // Extract and convert the first two numbers from the first line
  let countN = Number ( firstLineParts[0] ) ;
  let countM = Number ( firstLineParts[1] ) ;

  // Get the initial set of values, parse them, and sort them in ascending order
  let initialValues = textRows.shift()
                             .split ( ' ' )
                             .sort ( function ( valA, valB )
                             {
                               // Anonymous comparison function for ascending sort
                               return valA - valB ;
                             }
                                    ) ;

  // Remove the last (potentially empty) line
  textRows.pop ( ) ;

  // Sort the remaining lines based on their second numeric part in descending order
  let sortedOperations = textRows.sort ( function ( itemX, itemY )
                                         {
                                           // Extract the second part for comparison
                                           let valY = Number ( itemY.split ( ' ' )[1] ) ;
                                           let valX = Number ( itemX.split ( ' ' )[1] ) ;
                                           return valY - valX ;
                                         }
                                       ) ;

  // Initialize a pointer for the initial values array
  let currentPointer = 0 ;

  // Iterate through each sorted operation
  for ( let operationIndex = 0 ; operationIndex < sortedOperations.length ; operationIndex++ )
  {
    // Split the current operation line into its components
    let currentOpParts = sortedOperations[ operationIndex ].split ( ' ' ) ;

    // Extract the block count and the replacement value
    let blockCount = Number ( currentOpParts[0] ) ;
    let replacementValue = Number ( currentOpParts[1] ) ;

    // Apply the operation for the specified block count
    while ( blockCount-- )
    {
      // If we've exhausted the initial values, stop
      if ( initialValues[ currentPointer ] === undefined )
      {
        break ;
      }

      // If the current initial value is less than the replacement value, update it
      if ( Number ( initialValues[ currentPointer ] ) < replacementValue )
      {
        initialValues[ currentPointer ] = replacementValue ;
      }
      else
      {
        // If it's not smaller, no further updates are needed for this operation, due to sorting
        break ;
      }

      // Move to the next element in the initial values array
      currentPointer++ ;
    }

    // If all initial values have been processed, no need to continue with further operations
    if ( initialValues[ currentPointer ] === undefined )
    {
      break ;
    }
  }

  // Calculate the final sum of all (potentially updated) initial values
  let finalSumResult = initialValues.reduce ( function ( accumulator, currentNum )
                                            {
                                              // Sum up the numeric values
                                              return accumulator + Number ( currentNum ) ;
                                            }, 0 ) ;

  // Output the computed final sum
  console.log ( finalSumResult ) ;
}

// Invoke the main processing function with input from stdin
ProcessInput ( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) ) ;