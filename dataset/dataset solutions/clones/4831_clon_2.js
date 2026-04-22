/*
 * This script processes input data to determine connected components.
 * It identifies nodes that are reachable by both 'road' connections
 * and 'rail' connections, then counts their mutual connections.
 */

function processor ( inputLines ) {

  const [ nodeCount, roadCount, railCount ] = inputLines[0].split( ' ' ).map( Number );

  let
    roadGroups = [],
    railGroups = [],
    tempGroup = [],
    connectionCounts = [];
  
  // Initialize connection groups for roads and rails, and result array
  for ( let idxA = 0; idxA < nodeCount; idxA++ ) {
    roadGroups[ idxA ] = nodeCount + 1; // Assign a value larger than any valid node ID
    railGroups[ idxA ] = nodeCount + 1; // Same for rail groups
    connectionCounts[ idxA ] = 0;        // Initially, no connections counted
  }

  // Process all 'road' connection pairs
  for ( let idxA = 1, limit = roadCount + 1; idxA < limit; idxA++ ) {
    const [ firstNode, secondNode ] = inputLines[idxA].split( ' ' ).map( Number );
    const minimumVal = Math.min(
      roadGroups[ firstNode - 1 ],
      roadGroups[ secondNode - 1 ],
      firstNode
    );
    roadGroups[ firstNode - 1 ] = minimumVal;
    roadGroups[ secondNode - 1 ] = minimumVal;
  }

  // Process all 'rail' connection pairs
  for ( let idxA = roadCount + 1, limit = roadCount + railCount + 1; idxA < limit; idxA++ ) {
    const [ nodeOne, nodeTwo ] = inputLines[idxA].split( ' ' ).map( Number );
    const minimumVal = Math.min(
      railGroups[ nodeOne - 1 ],
      railGroups[ nodeTwo - 1 ],
      nodeOne
    );
    railGroups[ nodeOne - 1 ] = minimumVal;
    railGroups[ nodeTwo - 1 ] = minimumVal;
  }
  
  // Determine and count mutually connected components
  for ( let idxA = 0; idxA < nodeCount; idxA++ ) {
    if ( connectionCounts[ idxA ] === 0 ) { // Only process if not already counted
      tempGroup.length = 0; // Clear temporary group
      tempGroup[ 0 ] = idxA; // Add current node to temporary group

      // Check if current node is part of a valid road and rail group
      if ( roadGroups[ idxA ] <= nodeCount && railGroups[ idxA ] <= nodeCount ) {
        // Find other nodes in the same combined road and rail group
        for ( let idxB = idxA + 1; idxB < nodeCount; idxB++ ) {
          if (
            roadGroups[ idxA ] === roadGroups[ idxB ] &&
            railGroups[ idxA ] === railGroups[ idxB ]
          ) {
            tempGroup.push( idxB ); // Add node to current group
          }
        }
      }
      
      // Assign the count of the current group to all its members
      for ( let idxB = 0, limit = tempGroup.length; idxB < limit; idxB++ ) {
        connectionCounts[ tempGroup[ idxB ] ] = limit;
      }
    }
  }

  // Debugging output for intermediate arrays (if needed)
  // console.log(roadGroups.join(' '));
  // console.log(railGroups.join(' '));

  // Output the final counts of connected components
  console.log( connectionCounts.join( ' ' ) );
}

// Entry point: Read input from stdin, parse it, and pass to the processor function
processor( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim().split( '\n' ) );