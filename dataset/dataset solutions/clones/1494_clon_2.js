const processCityData = (rawGeoInput) => {
  const parsedGeoData = rawGeoInput .split ( /\n/ ) .map ( entry => entry .split (/\s/) .map ( val => +val ) ) ;
  let totalLocations = parsedGeoData [ 0 ] [ 0 ] ;
  const locationCoordinates = parsedGeoData .slice ( 1 , totalLocations + 1 ) ;
  let pathLengthsResult = [ ] ;

  // Iterate through each location to find paths starting from it
  for ( let startNodeIndex = 0 ; startNodeIndex < totalLocations ; startNodeIndex ++ ) {
    let currentTraversalPath = [ ] ;
    currentTraversalPath [ 0 ] = startNodeIndex ; // Initialize path with the starting node

    // Explore nodes reachable from the current path
    for ( let pathStepPointer in currentTraversalPath ) {
        appendUniqueElements (
            currentTraversalPath ,
            discoverRelatedNodes ( currentTraversalPath [ pathStepPointer ] , locationCoordinates )
        ) ;
    }

    // Store the total number of unique nodes found for this starting point
    pathLengthsResult [ startNodeIndex ] = currentTraversalPath .length ;
  }
  // Output the calculated path lengths, each on a new line
  console.log ( pathLengthsResult .join ( "\n" ) ) ;
};

// Execute the main processing function with data from standard input
processCityData ( require ( 'fs' ) .readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


function discoverRelatedNodes ( baseNodeIndex , allNodeCoords ) {
  let foundConnections = [ ] ; // Array to hold indices of connected nodes
  // Check every other node to see if it's connected to the base node
  for ( let comparedNodeIndex in allNodeCoords ) {
    const baseNodeX = allNodeCoords [ baseNodeIndex ] [ 0 ] ;
    const baseNodeY = allNodeCoords [ baseNodeIndex ] [ 1 ] ;
    const comparedNodeX = allNodeCoords [ comparedNodeIndex ] [ 0 ] ;
    const comparedNodeY = allNodeCoords [ comparedNodeIndex ] [ 1 ] ;

    // A connection exists if one node is strictly larger or strictly smaller in both dimensions
    if ( ( baseNodeX > comparedNodeX && baseNodeY > comparedNodeY ) || ( baseNodeX < comparedNodeX && baseNodeY < comparedNodeY ) ) {
      foundConnections .push ( comparedNodeIndex ) ;
    }
  }
  return foundConnections ;
}

// Function to add new elements to an existing array, ensuring uniqueness
function appendUniqueElements ( existingPath , newlyDiscovered ) {
  for ( let potentialNode of newlyDiscovered ) {
    if ( existingPath .indexOf ( potentialNode ) === -1 ) { // If the node is not already in the path
      existingPath .push ( potentialNode ) ; // Add it
    }
  }
  return existingPath ;
}