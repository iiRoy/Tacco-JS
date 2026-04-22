// Store all component data in an array.
// Each component consists of a leader and a count; its identity is determined by its index.

function  initializeDisjointSets ( numElements )
{
  var componentsArray = [];
  for ( var idx = 0 ;  idx < numElements ; idx++ )
  {
    componentsArray[idx] = {
      leader: idx,
      count: 1,
    }
  }
  return componentsArray;
}

function areConnected( firstElementId , secondElementId , dataStructures )
{
  const secondRootNode = findRoot(secondElementId, dataStructures);
  const firstRootNode  = findRoot(firstElementId , dataStructures);

  return ( secondRootNode == firstRootNode );
}

function uniteComponents(firstElementId, secondElementId, dataStructures)
{
  if ( areConnected(firstElementId, secondElementId, dataStructures) ) { return; }

  const secondRootNode = findRoot(secondElementId, dataStructures);
  const firstRootNode  = findRoot(firstElementId , dataStructures);

  firstRootNode.count = firstRootNode.count + secondRootNode.count;

  secondRootNode.leader = firstElementId;
}

function findRoot(elementId, dataStructures)
{
  var currentNode = dataStructures[elementId];

  if ( currentNode.leader == elementId ) { return currentNode; }

  var representativeNode = findRoot(currentNode.leader, dataStructures);
  currentNode.leader = representativeNode.leader;

  return representativeNode;
}

function getComponentSize(elementId, dataStructures)
{
  var representativeNode = findRoot(elementId, dataStructures);
  return representativeNode.count;
}

function processInputData(rawData)
{
  const parsedLines = rawData.split('\n').map( line => line.split(' ').map( item => parseInt(item, 10) ) );

  const totalElements   = parsedLines[0][0];
  const totalConnections = parsedLines[0][1];

  var reversedConnections = [];

  for ( var counter = 0 ; counter < totalConnections ; counter++ )
  {
    reversedConnections.push(parsedLines[1+counter]);
  }

  reversedConnections = reversedConnections.reverse();

  var disjointSets = initializeDisjointSets(totalElements);

  var currentInconvenience = totalElements * (totalElements - 1) / 2;
  var computedInconveniences = [currentInconvenience];

  for ( const connectionTuple of reversedConnections )
  {
    // debug_output(connectionTuple);

    let firstNodeId  = connectionTuple[0] - 1;
    let secondNodeId = connectionTuple[1] - 1;

    if ( !areConnected(firstNodeId, secondNodeId, disjointSets) )
    {
      var changeAmount = getComponentSize(firstNodeId, disjointSets) * getComponentSize(secondNodeId, disjointSets);
      currentInconvenience -= changeAmount;
    }

    computedInconveniences.push(currentInconvenience);

    uniteComponents(firstNodeId, secondNodeId, disjointSets);
  }

  const finalOutputSequence = computedInconveniences.reverse();

  for ( var iter = 1 ; iter <= totalConnections ; iter++ )
  {
    console.log(finalOutputSequence[iter]);
  }
}

processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );

// 02:05:00 >