let    sourceData   =   require('fs') . readFileSync (  '/dev/stdin'  , 'utf8'  )  ;

const dataSegments = sourceData.split('\n') ;

let   nodeCount =  (dataSegments[0].split(' ')[0] - 0);
let   linkCount = ( dataSegments[0].split(' ')[1] - 0 );
let  startWaterLevel   =  (dataSegments[0] . split(' ')[2] - 0 );

let loopVar   ,   innerLoopVar   ,   tempLoopVar  ;
let elevationLevels  = new Array(nodeCount) ;

let graphAdjacency = new Array(nodeCount) ;
let traversalStack = [ ] ;

for( loopVar = 0 ; loopVar < nodeCount ;   loopVar++ ) {
  elevationLevels[loopVar] = dataSegments[ loopVar + 1 ] - 0;
  graphAdjacency[loopVar] = [ ] ;
}

let currentSegment, pointU, pointV, travelDuration;
for (loopVar = 0; loopVar < linkCount; loopVar++ )
{
  currentSegment = dataSegments[loopVar + nodeCount + 1].split(' ');
  pointU = currentSegment[0] - 1;
  pointV = currentSegment[1] - 1;
  travelDuration = currentSegment[2] - 0;

  graphAdjacency[pointU].push( {
    destinationIndex : pointV,
    durationValue: travelDuration
  });
  graphAdjacency[pointV].push({
    destinationIndex: pointU,
    durationValue: travelDuration
  });
}

traversalStack.push({
  pointIdx: 0,
  totalTime: 0,
  waterLevel: startWaterLevel,
  visitedNodes: [0]
});

let currentState, nextNodeIndex, connectionDetails, finalState;
let minimumDuration = Infinity;

while (traversalStack.length > 0)
{
  currentState = traversalStack.pop();
  for (loopVar = 0; loopVar < graphAdjacency[currentState.pointIdx].length; loopVar++) {
    connectionDetails = graphAdjacency[currentState.pointIdx][loopVar];
    nextNodeIndex = connectionDetails.destinationIndex;

    if (currentState.visitedNodes.indexOf(nextNodeIndex) !== -1) {
      continue;
    }

    if (elevationLevels[currentState.pointIdx] < connectionDetails.durationValue) {
      continue;
    }

    if (elevationLevels[nextNodeIndex] + connectionDetails.durationValue < currentState.waterLevel)
    {
      traversalStack.push({
        pointIdx: nextNodeIndex,
        totalTime: currentState.totalTime + connectionDetails.durationValue + currentState.waterLevel - (elevationLevels[nextNodeIndex] + connectionDetails.durationValue),
        waterLevel: elevationLevels[nextNodeIndex],
        visitedNodes: currentState.visitedNodes.concat(nextNodeIndex)
      });
    }
    else if (elevationLevels[nextNodeIndex] + connectionDetails.durationValue >= currentState.waterLevel && currentState.waterLevel >= connectionDetails.durationValue)
    {
      traversalStack.push({
        pointIdx: nextNodeIndex,
        totalTime: currentState.totalTime + connectionDetails.durationValue,
        waterLevel: currentState.waterLevel - connectionDetails.durationValue,
        visitedNodes: currentState.visitedNodes.concat(nextNodeIndex)
      });
    }
    else
    {
      traversalStack.push({
        pointIdx: nextNodeIndex,
        totalTime: currentState.totalTime + connectionDetails.durationValue + connectionDetails.durationValue - currentState.waterLevel,
        waterLevel: 0,
        visitedNodes: currentState.visitedNodes.concat(nextNodeIndex)
      });
    }

    if (nextNodeIndex === nodeCount - 1)
    {
      finalState = traversalStack.pop();
      minimumDuration = Math.min(minimumDuration, finalState.totalTime + elevationLevels[nodeCount - 1] - finalState.waterLevel);
    }
  }
}

if (minimumDuration === Infinity) {
  console.log(-1);
} else {
  console.log(minimumDuration);
}