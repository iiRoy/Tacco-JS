var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = (inputData.trim()).split("\n");

var deltaY = [-1, 0, 0, 1];
var deltaX = [0, -1, 1, 0];

inputLines.forEach(function(currentLine) {
   var puzzleState = currentLine.split(" ").map(Number);
   var visitedStates = {};
   var queue = [[puzzleState, 0]];

   while (queue.length > 0) {
      var currentEntry = queue.shift();
      var currentState = currentEntry[0];
      var moveCount = currentEntry[1];

      if (currentState.join("") === "01234567") {
         console.log(moveCount);
         break;
      }

      var zeroIndex = currentState.indexOf(0);
      var row = Math.floor(zeroIndex / 4);
      var col = zeroIndex % 4;

      var boardGrid = [currentState.slice(0, 4), currentState.slice(4, 8)];

      for (var directionIdx = 0; directionIdx < 4; directionIdx++) {
         var newRow = row + deltaY[directionIdx];
         var newCol = col + deltaX[directionIdx];

         if (newRow < 0 || newCol < 0 || newRow >= 2 || newCol >= 4) {
            continue;
         }

         boardGrid[row][col] = boardGrid[newRow][newCol];
         var swappedTile = boardGrid[newRow][newCol];
         boardGrid[newRow][newCol] = 0;

         var nextStateArray = boardGrid[0].concat(boardGrid[1]);
         var stateString = nextStateArray.join("");

         if (visitedStates.hasOwnProperty(stateString) === false) {
               visitedStates[stateString] = true;
               queue.push([nextStateArray, moveCount + 1]);
         }
         
         boardGrid[newRow][newCol] = swappedTile;
         boardGrid[row][col] = 0;
      }
   }
});
