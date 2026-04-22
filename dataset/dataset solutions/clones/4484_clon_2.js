function ProcessInput(rawData) {
 rawData=rawData.split("\n")
 var nodeCount=parseInt(rawData[0])
 var edgeStartNodes=new Array(nodeCount-1).fill(0)
 var edgeEndNodes=new Array(nodeCount-1).fill(0)
 for (var k=0;k<nodeCount-1;k++) {
  var currentEdgeData=rawData[k+1].split(" ")
  edgeStartNodes[k]=parseInt(currentEdgeData[0])-1
  edgeEndNodes[k]=parseInt(currentEdgeData[1])-1
 }
 var distancesFromOrigin=new Array(nodeCount).fill(nodeCount)
 distancesFromOrigin[0]=0
 var distancesFromTarget=new Array(nodeCount).fill(nodeCount)
 distancesFromTarget[nodeCount-1]=0

 function determineDistances(currentNodeIndex, distanceArray) {
  var traversalQueue=new Array(nodeCount)
  for(var p=0;p<nodeCount;p++) {
   traversalQueue[p]=p
  }
  while(traversalQueue.length !== 0) {
   for(var q=0;q<nodeCount-1;q++) {
    if(edgeStartNodes[q]===currentNodeIndex&&distanceArray[edgeEndNodes[q]]>distanceArray[edgeStartNodes[q]]) {
     distanceArray[edgeEndNodes[q]]=distanceArray[edgeStartNodes[q]]+1
    }
    if(edgeEndNodes[q]===currentNodeIndex&&distanceArray[edgeStartNodes[q]]>distanceArray[edgeEndNodes[q]]) {
     distanceArray[edgeStartNodes[q]]=distanceArray[edgeEndNodes[q]]+1
    }
   }
   traversalQueue.splice(traversalQueue.indexOf(currentNodeIndex),1)
   var currentMinDistance=nodeCount
   for(var r=0;r<traversalQueue.length;r++) {
    if(distanceArray[traversalQueue[r]]<currentMinDistance) {
     currentNodeIndex=traversalQueue[r]
     currentMinDistance=distanceArray[traversalQueue[r]]
    }
   }
  }
  return distanceArray
 }
 distancesFromOrigin=determineDistances(0, distancesFromOrigin)
 distancesFromTarget=determineDistances(nodeCount-1, distancesFromTarget)
 var fennecWins=0
 for(var s=0;s<nodeCount;s++) {
  if(s!==0 && s!==nodeCount-1) {
   if(distancesFromOrigin[s]<=distancesFromTarget[s]) {
    fennecWins++
   }
  }
 }
 var finalResult="Fennec"
 if(fennecWins<=nodeCount-2-fennecWins) {
  finalResult="Snuke"
 }

 console.log('%s', finalResult)
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"))