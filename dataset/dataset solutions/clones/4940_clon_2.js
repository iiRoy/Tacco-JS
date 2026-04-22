'use strict';
function ProcessInput ( sourceData ) {
  let dataLines = sourceData . split ( "\n" ) ;
  let sizeComponents = dataLines [0] . split ( " " ) ;
  let gridWidth = parseInt ( sizeComponents [0] ) ;
  let gridHeight = parseInt ( sizeComponents [1] ) ;
  let horizontalWeights = new Array ( ) ;
  let verticalWeights = new Array ( ) ;

  // Populate horizontal edge costs from input lines
  for ( let loopCounter = 0 ; loopCounter < gridWidth ; loopCounter ++ ) {
    horizontalWeights . push ( dataLines [ 1 + loopCounter ] ) ;
  }
  // Populate vertical edge costs from input lines
  for ( let loopCounter = 0 ; loopCounter < gridHeight ; loopCounter ++ ) {
    verticalWeights . push ( dataLines [ 1 + gridWidth + loopCounter ] ) ;
  }

  // Initialize the grid of graph vertices, each with a unique component ID and associated costs
  let graphVertices = new Array ( ) ;
  for ( let rowIter = 0 ; rowIter < gridHeight + 1 ; rowIter ++ ) {
    graphVertices . push ( [ ] ) ;
    for ( let colIter = 0 ; colIter < gridWidth + 1 ; colIter ++ ) {
      graphVertices [rowIter] [colIter] = {
        "componentId" : ( gridWidth + 1 ) * rowIter + colIter ,
        "hCost" : parseInt ( horizontalWeights [colIter] ) || 100000001 , // Horizontal edge weight
        "vCost" : parseInt ( verticalWeights [rowIter] ) || 100000001    // Vertical edge weight
      } ;
    }
  }
  // console.log("Current state of graph vertices:", graphVertices); // Debugging vertex initialization

  // Function to compute the Minimum Spanning Tree using a modified Kruskal-like approach
  function mstSolver ( accumulatedCost ) {
    let smallestWeight = 100000001 ; // A very large initial value for finding the minimum edge (10^8 + 1)
    let selectedEdgeInfo = [ ] ; // Stores the two connected vertices of the chosen minimum edge

    // Scan the main grid area for the smallest edge connecting different components
    for ( let rowIter = 0 ; rowIter < gridHeight ; rowIter ++ ) {
      for ( let colIter = 0 ; colIter < gridWidth ; colIter ++ ) {
        // Check horizontal edge to the right
        if ( graphVertices [rowIter] [colIter] . hCost < smallestWeight && graphVertices [rowIter] [colIter] . componentId != graphVertices [rowIter] [colIter + 1] . componentId ) {
          smallestWeight = graphVertices [rowIter] [colIter] . hCost ;
          selectedEdgeInfo [0] = graphVertices [rowIter] [colIter] ;
          selectedEdgeInfo [1] = graphVertices [rowIter] [colIter + 1] ;
        }
        // Check vertical edge downwards
        if ( graphVertices [rowIter] [colIter] . vCost < smallestWeight && graphVertices [rowIter] [colIter] . componentId != graphVertices [rowIter + 1] [colIter] . componentId ) {
          smallestWeight = graphVertices [rowIter] [colIter] . vCost ;
          selectedEdgeInfo [0] = graphVertices [rowIter] [colIter] ;
          selectedEdgeInfo [1] = graphVertices [rowIter + 1] [colIter] ;
        }
      }
    }

    // Scan the last row's horizontal edges
    for ( let colIter = 0 ; colIter < gridWidth ; colIter ++ ) {
      if ( graphVertices [gridHeight] [colIter] . hCost < smallestWeight && graphVertices [gridHeight] [colIter] . componentId != graphVertices [gridHeight] [colIter + 1] . componentId ) {
        smallestWeight = graphVertices [gridHeight] [colIter] . hCost ;
        selectedEdgeInfo [0] = graphVertices [gridHeight] [colIter] ;
        selectedEdgeInfo [1] = graphVertices [gridHeight] [colIter + 1] ;
      }
    }

    // Scan the last column's vertical edges
    for ( let rowIter = 0 ; rowIter < gridHeight ; rowIter ++ ) {
      if ( graphVertices [rowIter] [gridWidth] . vCost < smallestWeight && graphVertices [rowIter] [gridWidth] . componentId != graphVertices [rowIter + 1] [gridWidth] . componentId ) {
        smallestWeight = graphVertices [rowIter] [gridWidth] . vCost ;
        selectedEdgeInfo [0] = graphVertices [rowIter] [gridWidth] ;
        selectedEdgeInfo [1] = graphVertices [rowIter + 1] [gridWidth] ;
      }
    }

    let targetGroupId = selectedEdgeInfo [1] . componentId ; // The component identifier that will be merged
    // Update all vertices belonging to the `targetGroupId` to the `selectedEdgeInfo[0]`'s group
    for ( let rowIter = 0 ; rowIter < gridHeight + 1 ; rowIter ++ ) {
      for ( let colIter = 0 ; colIter < gridWidth + 1 ; colIter ++ ) {
        if ( graphVertices [rowIter] [colIter] . componentId == targetGroupId ) {
          graphVertices [rowIter] [colIter] . componentId = selectedEdgeInfo [0] . componentId ;
        }
      }
    }

    // console.log("Cost progression:", accumulatedCost, "->", accumulatedCost + smallestWeight); // Trace cost updates
    accumulatedCost += smallestWeight ;
    // console.log("Graph state after merge:", graphVertices); // Observe component changes

    // Check if all vertices are now part of a single connected component
    for ( let rowIter = 0 ; rowIter < gridHeight + 1 ; rowIter ++ ) {
      for ( let colIter = 0 ; colIter < gridWidth + 1 ; colIter ++ ) {
        if ( graphVertices [0] [0] . componentId != graphVertices [rowIter] [colIter] . componentId ) {
          return mstSolver ( accumulatedCost ) ; // If not, recurse to find the next minimum edge
        }
      }
    }

    return accumulatedCost ; // All vertices are connected, return the total minimum spanning tree weight
  }

  let finalCost = mstSolver ( 0 ) ;
  console . log ( finalCost ) ;

}
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;