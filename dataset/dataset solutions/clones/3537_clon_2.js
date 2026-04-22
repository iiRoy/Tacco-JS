/*
 * This JavaScript module implements a solution for a resource allocation problem.
 * It reads input from standard input, processes it, and prints the result to standard output.
 */

"use strict";

function ProcessProblemSolution( rawProblemData ) {
  // Parse the first line of input to get total entities and the initial resource amount.
  // The first line contains two space-separated integers.
  let [ totalEntities, initialResource ] = rawProblemData . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( parseInt ) ;

  // Parse the second line of input to get the costs of individual entities.
  // Sort these costs in ascending order to facilitate greedy selection.
  const entityCosts = rawProblemData . split ( '\n' ) [ 1 ] . split ( ' ' ) . map ( Number ) . sort ( ( v1 , v2 ) => v1 - v2 ) ;

  // Initialize a counter for the number of entities successfully satisfied.
  let satisfiedEntities = 0 ;

  // Iterate through the sorted entity costs.
  for ( let entityIndex = 0 ; entityIndex < totalEntities ; entityIndex ++ ) {
    // Check if the current entity's cost can be covered by the remaining resource.
    if ( entityCosts [ entityIndex ] <= initialResource ) {
      // If yes, subtract the cost from the available resource.
      initialResource -= entityCosts [ entityIndex ] ;
      // Increment the count of satisfied entities.
      satisfiedEntities ++ ;
    } else {
      // If the current entity's cost is too high, we cannot satisfy any more entities
      // because the costs are sorted, so break out of the loop.
      break ;
    }
  }

  // After the loop, if there's still some resource left but no entities were satisfied,
  // or if the remaining resource is exactly zero and some entities were satisfied,
  // there might be an edge case where the last entity satisfied used up all but
  // a tiny amount of resource that wasn't enough for the _next_ entity,
  // and the problem implies we should decrement the count if the resource is not completely zero
  // but entities were still successfully processed. This is a specific problem constraint.
  if ( ( initialResource != 0 ) && ( satisfiedEntities != 0 ) ) {
    satisfiedEntities -- ;
  }

  // Output the final count of satisfied entities.
  console . log ( satisfiedEntities ) ;
}

// Do not modify the code below this line; it handles standard I/O for execution.
ProcessProblemSolution ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;