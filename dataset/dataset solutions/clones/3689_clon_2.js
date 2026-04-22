function ProcessGraphData(rawInputText){ rawInputText = rawInputText.split('\n');

    var parsedFirstLine = rawInputText[0].split(' ').map( valueItem => +valueItem );
    var numEdges = parsedFirstLine[1];
    var initialNodeIdx = parsedFirstLine[2] - 1;
    var finalNodeIdx = parsedFirstLine[3] - 1;
    parsedFirstLine = parsedFirstLine[0];
    var totalNodes = parsedFirstLine;

    var edgeSources = [], edgeDestinations = [], weightSetOne = [], weightSetTwo = [];

    for ( var edgeLoopCounter = 0 ; edgeLoopCounter < numEdges ; edgeLoopCounter++ )
    {
        var currentEdgeDetails = rawInputText[edgeLoopCounter + 1].split(' ').map( valueItem => +valueItem );
        edgeSources[edgeLoopCounter] = currentEdgeDetails[0] - 1;
        edgeDestinations[edgeLoopCounter] = currentEdgeDetails[1] - 1;
        weightSetOne[edgeLoopCounter] = currentEdgeDetails[2];
        weightSetTwo[edgeLoopCounter] = currentEdgeDetails[3];
    }


    var distancesFromInitial = computeShortestPaths(edgeSources, edgeDestinations, weightSetOne, initialNodeIdx, totalNodes);
    var distancesToFinal = computeShortestPaths(edgeSources, edgeDestinations, weightSetTwo, finalNodeIdx, totalNodes);

    var computedValues = [];
    var nodeIteratorIndex = totalNodes - 1;

    computedValues[nodeIteratorIndex] = 1_000_000_000_000_000.0 - distancesFromInitial[nodeIteratorIndex] - distancesToFinal[nodeIteratorIndex];
    for ( ; nodeIteratorIndex-- ; )
    {
        computedValues[nodeIteratorIndex] = Math.max(computedValues[nodeIteratorIndex + 1], 1_000_000_000_000_000.0 - distancesFromInitial[nodeIteratorIndex] - distancesToFinal[nodeIteratorIndex]);
    }

    console.log(computedValues.join('\n'));
}


function computeShortestPaths(sourceVertices, destinationVertices, edgeCostArray, startVertex, vertexCount)
{
    var adjacencyList = Array(vertexCount).fill( null ).map( val => [] );

    for ( var edgeIndex = 0 ; edgeIndex < sourceVertices.length ; edgeIndex++ )
    {
        adjacencyList[sourceVertices[edgeIndex]][destinationVertices[edgeIndex]] = adjacencyList[destinationVertices[edgeIndex]][sourceVertices[edgeIndex]] = edgeCostArray[edgeIndex];
    }

    var shortestDistances = Array(vertexCount).fill(Number.MAX_VALUE);
    shortestDistances[startVertex] = 0;

    var minPathWeight = Infinity, closestVertex, unvisitedSet = [];

    for ( closestVertex in adjacencyList[startVertex] )
    {
        unvisitedSet.push(closestVertex);
        shortestDistances[closestVertex] = adjacencyList[startVertex][closestVertex];
        if ( minPathWeight > shortestDistances[closestVertex] )
        {
            minPathWeight = shortestDistances[closestVertex];
            closestVertex = closestVertex;
        }
    }

    while ( unvisitedSet.length )
    {
        minPathWeight = Infinity;
        var currentMinIdx = -1;
        for ( var queueIndex = 0 ; queueIndex < unvisitedSet.length ; queueIndex++ )
        {
            var currentNodeFromQueue = unvisitedSet[queueIndex];
            if ( minPathWeight > shortestDistances[currentNodeFromQueue] )
            {
                minPathWeight = shortestDistances[currentNodeFromQueue];
                currentMinIdx = queueIndex;
            }
        }

        closestVertex = unvisitedSet[currentMinIdx];
        unvisitedSet.splice(currentMinIdx, 1);

        for ( var neighborKey in adjacencyList[closestVertex] )
        {
            if ( shortestDistances[neighborKey] <= shortestDistances[closestVertex] + adjacencyList[closestVertex][neighborKey] ) continue;
            unvisitedSet.push(neighborKey);
            shortestDistances[neighborKey] = shortestDistances[closestVertex] + adjacencyList[closestVertex][neighborKey];
        }
    }
    return shortestDistances;
}

ProcessGraphData(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));