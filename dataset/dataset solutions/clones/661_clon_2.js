var rawDataStream = require('fs') . readFileSync('/dev/stdin', 'utf8' );
var lineCollection = rawDataStream.trim() . split("\n");
while (true) {
    var dimensionConfigString = lineCollection.shift();
    if ( dimensionConfigString == "0 0" ) {
        break;
    }
    var dimensionValues = dimensionConfigString . split(" ") . map(Number);
    var gridSize = dimensionValues[0];
    var fillOperationsCount = dimensionValues[1];
    var voxelGrid = [];
    for ( var idxX = 0; idxX < gridSize; idxX++ ) {
        voxelGrid[idxX] = [];
        for ( var idxY = 0; idxY < gridSize; idxY++ ) {
            voxelGrid[idxX][idxY] = [];
            for ( var idxZ = 0; idxZ < gridSize; idxZ++ ) {
                voxelGrid[idxX][idxY][idxZ] = 0;
            }
        }
    }
    for ( var opIndex = 0; opIndex < fillOperationsCount; opIndex++ ) {
        var operationLineParts = lineCollection.shift() . split(" ");
        var operationType = operationLineParts.shift();
        var adjustedCoordinates = operationLineParts . map(function(currentCoord){ return currentCoord - 1; });
        if ( operationType == "xy" ) {
            for ( var currentAxisVal = 0; currentAxisVal < gridSize; currentAxisVal++ ) {
                voxelGrid[adjustedCoordinates[0]][adjustedCoordinates[1]][currentAxisVal] = 1;
            }
        }
        else if ( operationType == "xz" ) {
            for ( var currentAxisVal = 0; currentAxisVal < gridSize; currentAxisVal++ ) {
                voxelGrid[adjustedCoordinates[0]][currentAxisVal][adjustedCoordinates[1]] = 1;
            }
        }
        else if ( operationType == "yz" ) {
            for ( var currentAxisVal = 0; currentAxisVal < gridSize; currentAxisVal++ ) {
                voxelGrid[currentAxisVal][adjustedCoordinates[0]][adjustedCoordinates[1]] = 1;
            }
        }
    }
    var unfilledCellCount = 0;
    for ( var coordX = 0; coordX < gridSize; coordX++ ) {
        for ( var coordY = 0; coordY < gridSize; coordY++ ) {
            for ( var coordZ = 0; coordZ < gridSize; coordZ++ ) {
                if ( voxelGrid[coordX][coordY][coordZ] === 0 ) {
                    unfilledCellCount++;
                }
            }
        }
    }
    console.log(unfilledCellCount);
}