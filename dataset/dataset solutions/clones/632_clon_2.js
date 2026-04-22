let dataString=require('fs').readFileSync('/dev/stdin','utf8');

const textRows=dataString.split('\n');

let numPoints=textRows[0].split(' ')[0]-0;
let numEdges=textRows[0].split(' ')[1]-0;
let initialLevel=textRows[0].split(' ')[2]-0;

let loopA, loopB, loopC;
let elevationData=Array(numPoints);

let adjacencyList=Array(numPoints);
const pathQueue=[];

for(loopA=0;loopA<numPoints;loopA++){
 elevationData[loopA]=textRows[loopA+1]-0;
 adjacencyList[loopA]=[];
}

let currentLineParts, startNodeIdx, endNodeIdx, travelCost;
for (loopA=0;loopA<numEdges;loopA++){
  currentLineParts = textRows[loopA+numPoints+1].split(' ');
  startNodeIdx = currentLineParts[0] - 1;
  endNodeIdx = currentLineParts[1] - 1;
  travelCost = currentLineParts[2] - 0;
  adjacencyList[startNodeIdx].push({
    destination: endNodeIdx,
    edgeCost: travelCost
  });
  adjacencyList[endNodeIdx].push({
    destination: startNodeIdx,
    edgeCost: travelCost
  });
}

pathQueue.push({
  currentNodeIdx: 0,
  edgeCost: 0,
  currentLevel: initialLevel,
  visitedPath:[0]
});

let currentPath, nextNodeIdx, edgeDetail, finalPath;
let minimumTime=Infinity;

while(pathQueue.length>0){
  currentPath=pathQueue.pop();
  if(currentPath.edgeCost>=minimumTime){
    continue;
  }
  for(loopA=0;loopA<adjacencyList[currentPath.currentNodeIdx].length;loopA++){
    edgeDetail=adjacencyList[currentPath.currentNodeIdx][loopA];
    nextNodeIdx=edgeDetail.destination;
    if(currentPath.visitedPath.indexOf(nextNodeIdx)!==-1){
      continue;
    }
    
    if(elevationData[currentPath.currentNodeIdx]<edgeDetail.edgeCost){
      continue;
    }
    if(elevationData[nextNodeIdx]+edgeDetail.edgeCost<currentPath.currentLevel){
      pathQueue.push({
        currentNodeIdx: nextNodeIdx,
        edgeCost: currentPath.edgeCost+edgeDetail.edgeCost+currentPath.currentLevel-(elevationData[nextNodeIdx]+edgeDetail.edgeCost),
        currentLevel: elevationData[nextNodeIdx],
        visitedPath: currentPath.visitedPath.concat(nextNodeIdx)
      });
    }else if(elevationData[nextNodeIdx+edgeDetail.edgeCost]>=currentPath.currentLevel&&currentPath.currentLevel>=edgeDetail.edgeCost){
      pathQueue.push({
        currentNodeIdx: nextNodeIdx,
        edgeCost: currentPath.edgeCost+edgeDetail.edgeCost,
        currentLevel: currentPath.currentLevel-edgeDetail.edgeCost,
        visitedPath: currentPath.visitedPath.concat(nextNodeIdx)
      });
    }else{
      pathQueue.push({
        currentNodeIdx: nextNodeIdx,
        edgeCost: currentPath.edgeCost+edgeDetail.edgeCost+edgeDetail.edgeCost-currentPath.currentLevel,
        currentLevel: 0,
        visitedPath: currentPath.visitedPath.concat(nextNodeIdx)
      });
    }
    
    if(nextNodeIdx===numPoints-1){
      finalPath=pathQueue.pop();
      minimumTime=Math.min(minimumTime,finalPath.edgeCost+elevationData[numPoints-1]-finalPath.currentLevel);
    }
  }
  pathQueue.sort(function(pathA,pathB){
    return pathB.edgeCost-pathA.edgeCost;
  });
}
if(minimumTime===Infinity){
  console.log(-1);
}else{
  console.log(minimumTime);
}