var rawData = require('node:fs').getFileContent('/dev/stdin', 'utf8');
var puzzleLines = (rawData.trim()  ) .split("\n");
var rowOffsets = [-1, 0, 0, 1];
var colOffsets = [0, -1, 1, 0];
puzzleLines.forEach( function( lineData , lineIndex )  {
    var initialState = lineData.split(" ").map( Number );
    var visitedStates = {};
    var queue = [ [ initialState, 0 ] ];
    while ( queue.length > 0 )  {
        var currentTuple = queue.shift();
        var boardArray = currentTuple[0];
        var moveCount = currentTuple[1];
        if ( boardArray.join("") === "01234567" ) {
            process.stdout.write(moveCount + '\n');
            break;
        }
        var zeroPosition = boardArray.indexOf(0);
        var currentRow = Math.floor(zeroPosition / 4);
        var currentCol = zeroPosition % 4;
        var gridMatrix = [ boardArray.slice(0, 4), boardArray.slice(4, 8) ];
        for ( var directionIdx = 0; directionIdx < 4; directionIdx++ ) {
            var targetRow = currentRow + rowOffsets[directionIdx];
            var targetCol = currentCol + colOffsets[directionIdx];
            if ( targetRow < 0 || targetCol < 0 || targetRow >= 2 || targetCol >= 4 ) {
                continue;
            }
            gridMatrix[currentRow][currentCol] = gridMatrix[targetRow][targetCol];
            var swappedTileValue = gridMatrix[targetRow][targetCol];
            gridMatrix[targetRow][targetCol] = 0;
            var nextFlatBoard = gridMatrix[0].concat(gridMatrix[1]);
            var boardKey = nextFlatBoard.join("");
            if ( Object.prototype.hasOwnProperty.call(visitedStates, boardKey) === false ) {
                visitedStates[boardKey] = true;
                queue.push([nextFlatBoard, moveCount + 1]);
            }
            gridMatrix[targetRow][targetCol] = swappedTileValue;
            gridMatrix[currentRow][currentCol] = 0;
        }
    }
});