function Pathfinder (initialX, initialY) {
 gridMap[initialY][initialX] = ".";
 var colOffsets = [ 0 , -1 , 1 , 0 ];
 var rowOffsets = [ -1 , 0 , 0 , 1 ];
 var stepCount = 0;
 var explorationQueue = [ [ initialX , initialY , stepCount , 1 , gridMap ] ];
 var visitedStates = {};
 visitedStates[initialX + " " + initialY + " " + gridMap.join("") ] = true;
 while ( true ) {
  if ( explorationQueue.length === 0 ) { stepCount = -1; break; }
  var currentNode = explorationQueue.shift();
  var currentX = currentNode[0];
  var currentY = currentNode[1];
  var currentPathLength = currentNode[2];
  var currentPowerLevel = currentNode[3];
  var currentLayout = currentNode[4];
  if ( currentPowerLevel === maxPower + 1 ) { stepCount = currentPathLength; break; }
  for ( var directionIdx = 0; directionIdx < 4; directionIdx++ ) {
   var nextX = currentX + colOffsets[directionIdx];
   var nextY = currentY + rowOffsets[directionIdx];
   var nextPowerLevel = currentPowerLevel;
   if ( nextX < 0 || nextY < 0 || nextX >= dimensions[1] || nextY >= dimensions[0] ) continue;
   if ( gridMap[nextY][nextX] === "X" ) continue;
   var gridSnapshot = currentLayout.map(function(lineSegment) { return lineSegment.slice(); });
   if ( gridSnapshot[nextY][nextX] === "" + nextPowerLevel ) {
    nextPowerLevel++;
    gridSnapshot[nextY][nextX] = ".";
   }
   var stateIdentifier = nextX + " " + nextY + " " + gridSnapshot.join("");
   if ( visitedStates.hasOwnProperty(stateIdentifier) ) continue;
   visitedStates[stateIdentifier] = true;
   explorationQueue.push( [ nextX , nextY , currentPathLength + 1 , nextPowerLevel , gridSnapshot ] );
  }
 }
 return stepCount;
}
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = (rawData.trim()).split("\n");
var dimensions = (inputLines.shift()).split(" ").map(Number);
var maxPower = dimensions[2];
var gridMap = [];
var startingPosition = [];
for ( var rowIndex = 0; rowIndex < dimensions[0]; rowIndex++ ) {
 var currentRowData = (inputLines.shift()).split("");
 if ( currentRowData.indexOf("S") !== -1 ) startingPosition = [ currentRowData.indexOf("S") , rowIndex ];
 gridMap.push(currentRowData);
}
var finalDistance = Pathfinder(startingPosition[0], startingPosition[1]);
console.log(finalDistance);