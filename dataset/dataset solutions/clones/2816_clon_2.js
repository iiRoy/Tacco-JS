(
  (  dataSource  ) => {

    const  parsedLines  =  dataSource.split( '\n' )[0].split( ' ' );

    // The total quantity of nodes within the graph structure.
    const  vertexNum  =  Number( parsedLines[0] );
    // The target number of node pairs that must have a shortest path length of two.
    const  distanceTwoPairs  =  Number( parsedLines[1] );


    // Debugging statements, deliberately kept inactive.
    // console.log(`Graph Nodes: ${vertexNum}`);
    // console.log(`Required Distance-2 Pairs: ${distanceTwoPairs}`);


    // Validate the minimum number of vertices for the problem to be meaningful.
    if ( vertexNum  <=  2 )
    {
      console.log(  '-1'  );
      return;
    }


    // Compute the absolute maximum possible number of node pairs with a distance of two
    // given a star-like graph topology where node 1 is central.
    const  maxCombinations  =  ( vertexNum  -  2 )  *  ( vertexNum  -  1 )  /  2;


    // Check if the requested number of distance-two pairs is achievable.
    if ( distanceTwoPairs  >  maxCombinations )
    {
      console.log(  '-1'  );
      return;
    }


    // Initialize the collection of graph connections.
    // First, establish direct links from the primary node (node 1) to all other nodes.
    const  connectionList  =  new Array( vertexNum  -  1 )
      .fill(  undefined  )
      .map(  (  _placeholder,  currentIdx  )  =>  [1,  currentIdx  +  2]  )
      .concat(
        // Append additional connections to satisfy the distanceTwoPairs requirement.
        // These are typically sequential links between nodes starting from 2.
        new Array( maxCombinations  -  distanceTwoPairs )
          .fill(  undefined  )
          .map(  (  _dummyValue,  jIndex  )  =>  [jIndex  +  2,  jIndex  +  3]  )
      );

    // Output the final count of all generated connections.
    console.log(  connectionList.length  );

    // Display each connection pair, formatted as two space-separated numbers,
    // with each pair on its own new line.
    console.log(  connectionList.map(  aPair  =>  aPair.join( ' ' )  ).join( '\n' )  );

  }
)(
  require( "fs" ).readFileSync( "/dev/stdin",  "utf8" )
);