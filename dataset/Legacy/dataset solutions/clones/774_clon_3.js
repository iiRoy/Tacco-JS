var fileSystemModule = require('fs');

var rawInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
var rawInputLines = rawInputContent.trim().split('\n');

var initialConfigLine = rawInputLines.shift().split(' ');
var numNodes = parseInt(initialConfigLine[0], 10);
var numEdges = parseInt(initialConfigLine[1], 10);
var sourceNodeIdx = parseInt(initialConfigLine[2], 10) - 1;
var target1Idx = parseInt(initialConfigLine[3], 10) - 1;
var target2Idx = parseInt(initialConfigLine[4], 10) - 1;

var adjMatrix = Array.from({ length: numNodes }, (_, rowIdx) =>
  Array.from({ length: numNodes }, (_, colIdx) => (rowIdx === colIdx ? 0 : Infinity))
);

while (numEdges--) {
  var currentEdgeStr = rawInputLines.shift().split(' ');
  var fromNode = parseInt(currentEdgeStr[0], 10) - 1;
  var toNode = parseInt(currentEdgeStr[1], 10) - 1;
  var weight = parseInt(currentEdgeStr[2], 10);
  adjMatrix[fromNode][toNode] = weight;
}

for (var intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
  for (var startNode = 0; startNode < numNodes; startNode++) {
    for (var endNode = 0; endNode < numNodes; endNode++) {
      var pathThroughIntermediate = adjMatrix[startNode][intermediateNode] + adjMatrix[intermediateNode][endNode];
      adjMatrix[startNode][endNode] = Math.min(adjMatrix[startNode][endNode], pathThroughIntermediate);
    }
  }
}

var minimumPathSum = Infinity;
for (var intermediateMeetingNode = 0; intermediateMeetingNode < numNodes; intermediateMeetingNode++) {
  var pathFromSourceToMeeting = adjMatrix[sourceNodeIdx][intermediateMeetingNode];
  var pathFromMeetingToGoal1 = adjMatrix[intermediateMeetingNode][target1Idx];
  var pathFromMeetingToGoal2 = adjMatrix[intermediateMeetingNode][target2Idx];
  var currentTotalPath = pathFromSourceToMeeting + pathFromMeetingToGoal1 + pathFromMeetingToGoal2;
  minimumPathSum = Math.min(minimumPathSum, currentTotalPath);
}
console.log(minimumPathSum);
