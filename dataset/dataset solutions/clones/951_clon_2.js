(function(inputData) {
  // This section prepares the raw input data for processing.
  var dataRows = inputData . trim ( ) . split ( '\n' ) ;

  // Extract initial configuration parameters for the graph.
  var numericValues = dataRows . shift ( ) . split ( ' ' ) . map ( Number ) ;
  var numVertices = numericValues . shift ( ) ;
  var numEdges = numericValues . shift ( ) ;

  // Initialize graph adjacency list and component tracking array.
  var adjacencies = [ ] ;
  var componentIds = [ ] ;

  for ( var idx = 0 ; idx < numVertices ; idx ++ ) {
    adjacencies . push ( [ ] ) ;
    componentIds . push ( null ) ; // Mark all vertices as unassigned to any component initially.
  }

  // Construct the graph by populating the adjacency list with edges.
  for ( var idx = 0 ; idx < numEdges ; idx ++ ) {
    var edgeDef = dataRows . shift ( ) . split ( ' ' ) . map ( Number ) ;
    adjacencies [ edgeDef [ 0 ] ] . push ( edgeDef [ 1 ] ) ;
    adjacencies [ edgeDef [ 1 ] ] . push ( edgeDef [ 0 ] ) ; // For an undirected graph.
  }

  /**
   * Performs a Breadth-First Search (BFS) like traversal to discover all
   * vertices in a connected component and assign them a unique identifier.
   * @param {number} startVertex - The vertex from which to begin the traversal.
   * @param {number} currentComponentId - The ID to assign to the component being traversed.
   */
  function traverseGraph ( startVertex , currentComponentId ) {
    var processingQueue = [ ] ;
    componentIds [ startVertex ] = currentComponentId ; // Assign ID to the starting vertex.
    processingQueue . push ( startVertex ) ;

    while ( processingQueue . length > 0 ) {
      var currentVertex = processingQueue . shift ( ) ; // Dequeue the next vertex to process.
      for ( var idx = 0 ; idx < adjacencies [ currentVertex ] . length ; idx ++ ) {
        // If a neighbor hasn't been assigned a component ID yet.
        if ( ! componentIds [ adjacencies [ currentVertex ] [ idx ] ] ) {
          componentIds [ adjacencies [ currentVertex ] [ idx ] ] = currentComponentId ;
          processingQueue . push ( adjacencies [ currentVertex ] [ idx ] ) ; // Enqueue the neighbor.
        }
      }
    }
  }

  // Iterate through all vertices to find and process all connected components.
  var componentCounter = 1 ;
  for ( var idx = 0 ; idx < numVertices ; idx ++ ) {
    if ( ! componentIds [ idx ] ) { // If this vertex hasn't been visited by a traversal yet.
      traverseGraph ( idx , componentCounter ++ ) ; // Start a new traversal for a new component.
    }
  }

  // Read the number of connectivity queries.
  var numQueries = parseInt ( dataRows . shift ( ) , 10 ) ;
  // Process each query to determine if two vertices are in the same component.
  dataRows . forEach ( function ( queryRow ) {
    var queryPair = queryRow . split ( ' ' ) . map ( Number ) ;
    if ( componentIds [ queryPair [ 0 ] ] == componentIds [ queryPair [ 1 ] ] ) {
      console . log ( 'yes' ) ; // Vertices are in the same component.
    } else {
      console . log ( 'no' ) ; // Vertices are in different components.
    }
  } ) ;
} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;