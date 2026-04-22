function processData ( rawData ) {
  // Extract initial configuration parameters from the first line of input
  let   itemCount = Number(rawData[0].split(" ")[0]); // Total number of entities to process
  let   effectRange = Number(rawData[0].split(" ")[1]); // The range within which effects propagate
  const damageAmount = Number(rawData[0].split(" ")[2]); // The magnitude of impact per operation

  // Initialize an array to hold our entity data
  var entityCollection = [ ];

  // Populate the entity collection from the subsequent input lines
  for ( var currentIdx = 1; currentIdx <= itemCount; currentIdx++ ) {
    entityCollection.push( rawData[currentIdx].split(" ").map( valStr => Number(valStr) ) );
  }

  // Sort the entities based on their primary coordinate (first element)
  entityCollection = entityCollection.sort( ( entityA, entityB ) => entityA[0] - entityB[0] );

  let totalOperations = 0; // Accumulator for the total number of operations performed

  // Iterate through each entity to apply necessary operations
  for ( var loopIndex = 0; loopIndex < itemCount; loopIndex++ ) {
    const currentTarget = entityCollection[loopIndex]; // The current entity being processed

    // Check if the current target still has a positive magnitude (e.g., health, value)
    if ( currentTarget[1] > 0 ) {
      // Calculate how many operations are needed for this specific target
      const requiredHits = Math.ceil( currentTarget[1] / damageAmount );
      totalOperations += requiredHits; // Add to the global operation count

      // Propagate the effect to subsequent entities within the defined range
      for ( var propagationIndex = loopIndex; propagationIndex < itemCount; propagationIndex++ ) {
        var affectedTarget = entityCollection[propagationIndex]; // An entity potentially affected

        // Determine if the affected target is within the effect range of the current target
        if ( affectedTarget[0] <= currentTarget[0] + effectRange * 2 + 1 ) {
          // Reduce the magnitude of the affected target
          affectedTarget[1] -= damageAmount * requiredHits;
        } else {
          // If out of range, no further entities in this propagation path will be affected
          break;
        }
      }
    }
  }

  // Output the final accumulated count of operations
  console.log( totalOperations );
}

// Read input from standard input, split by newlines, and pass to the processing function
processData( require('fs').readFileSync('/dev/stdin', 'utf8').split("\n") );