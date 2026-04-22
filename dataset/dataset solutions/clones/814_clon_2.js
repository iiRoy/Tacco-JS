var fileContent = require('fs').readFileSync('/dev/stdin','utf8');
var inputLines = (fileContent.trim()).split("\n");

var linePointer = 0;
while(true)
{
   var dimensions = inputLines[linePointer].split(" ").map(Number);
   linePointer++;
   var nodeQuantity = dimensions[0];
   var relationQuantity = dimensions[1];

   if(nodeQuantity == 0 && relationQuantity == 0)
      break;

   var nodeStatus = [];
   for(var idxA=0;idxA<nodeQuantity;idxA++)
      nodeStatus[idxA]=true;

   nodeStatus[0]=false;

   var dependencyList = [];
   for(var idxB=0;idxB<relationQuantity;idxB++)
   {
      var relationshipVals = inputLines[linePointer].split(" ").map(Number);
      linePointer++;
      dependencyList.push([relationshipVals[0],relationshipVals[1]-1,relationshipVals[2]-1]);
   }

   dependencyList.sort(function(itemA,itemB){return itemA[0]-itemB[0];});
   dependencyList.forEach(function(currentEvent)
   {
      var originIndex = currentEvent[1];
      var targetIndex = currentEvent[2];
      if(!nodeStatus[originIndex])
         nodeStatus[targetIndex]=false;
   });

   var excludedNodes = 0;
   nodeStatus.forEach(function(statusFlag){if(!statusFlag)excludedNodes++;});
   console.log(excludedNodes);
}