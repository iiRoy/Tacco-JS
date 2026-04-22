'use strict'
// This script processes graph data to find a path.

executeProgram();

function executeProgram( programArguments )
{
    acquireSourceData()
        .then( transformRawInput )
        .then( determineShortestPath );
}


function determineShortestPath( graphDetails )
{
    // Extract graph dimensions
    let nodeCount = graphDetails[0][0];
    let edgeCount = graphDetails[0][1];

    // Initialize an array to store minimum path costs to each node
    let pathCosts = new Array(nodeCount) .fill( Number.POSITIVE_INFINITY );
    pathCosts[0] = 0; // Starting node has a cost of zero

    // Create a list of graph connections (edges)
    let graphConnections = new Array(edgeCount) .fill(null) .map(
        ( _unusedIndex, currentIdx ) => ( {
            originNode: graphDetails[currentIdx + 1][0] - 1,
            destinationNode: graphDetails[currentIdx + 1][1] - 1,
            connectionCost: graphDetails[currentIdx + 1][2] * -1 // Negate cost to find longest path
        } )
    );

    let modificationCounter = 0;

    // Bellman-Ford algorithm loop
    while ( true )
    {
        let wasModified = false;

        for ( const currentConnection of graphConnections )
        {
            // Check if relaxing the edge improves the path cost
            let updateConditionMet = pathCosts[currentConnection.originNode] !== Number.POSITIVE_INFINITY
                                  && pathCosts[currentConnection.destinationNode] > pathCosts[currentConnection.originNode] + currentConnection.connectionCost;

            if ( updateConditionMet )
            {
                pathCosts[currentConnection.destinationNode] = pathCosts[currentConnection.originNode] + currentConnection.connectionCost;
                wasModified = true;
            }
        }

        if ( !wasModified )
        {
            break; // No more updates, algorithm converged
        }
        else
        {
            modificationCounter++;
        }

        // Detect negative cycles (if an update occurs on the Nth iteration)
        if ( modificationCounter === nodeCount )
        {
            console.info( 'infinity_path' ); // Indicates an infinitely long path (due to negative cycle)
            return;
        }
    }

    // Output the final calculated path cost, inverted back
    console.info( pathCosts[nodeCount - 1] * -1 );
}


function transformRawInput( unprocessedText )
{
    // Split raw text into lines, then each line into numbers
    let parsedStructure = unprocessedText.split('\n') .map( lineEntry => lineEntry.split(' ') .map( Number ) );
    return parsedStructure;
}

function acquireSourceData()
{
    // Return a Promise to handle asynchronous input reading
    return new Promise( ( resolvePromise ) => {
        let collectedChunks = [];

        process.stdin.resume(); // Ensure stdin is open
        process.stdin.setEncoding( 'utf8' ); // Set character encoding

        process.stdin.on( 'data', ( inputSegment ) => {
            collectedChunks.push( inputSegment ); // Accumulate data chunks
        } );

        process.stdin.on( 'end', () => {
            let finalContent = collectedChunks.join('') .trim(); // Join and clean up input
            resolvePromise( finalContent ); // Resolve the promise with the final content
        } );
    } );
}