var createInputReader = (function() {
    function initializeReader(sourceString) {
        return new InputParser(sourceString);
    }

    function InputParser(sourceString) {
        this.sourceLines = sourceString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    function convertToNumberIfRequested(value, asString) {
        return asString ? value : Number(value);
    }

    InputParser.prototype.readSingleValue = function(returnAsString) {
        var lines = this.sourceLines;
        var lineIdx = this.currentLineIndex;
        var currentLineContent = lines[lineIdx];
        var extractedValue;

        if (typeof currentLineContent === "string") {
            var parts = currentLineContent.split(" ");
            lines[lineIdx] = parts.reverse();
        }
        
        extractedValue = lines[lineIdx].pop();

        if (lines[lineIdx].length === 0) {
            this.currentLineIndex++;
        }
        return convertToNumberIfRequested(extractedValue, returnAsString);
    };

    InputParser.prototype.readLineValues = function(returnAsString) {
        var lineContent = this.sourceLines[this.currentLineIndex++];
        var values = lineContent.split(" ");
        if (returnAsString) {
            return values;
        } else {
            return values.map(function(val) { return Number(val); });
        }
    };

    InputParser.prototype.readMatrix = function(numRows, returnAsString) {
        var startIdx = this.currentLineIndex;
        var endIdx = startIdx + numRows;
        var matrixRows = this.sourceLines.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx;

        var processedMatrix = matrixRows.map(function(rowStr) {
            var rowValues = rowStr.split(" ");
            if (returnAsString) {
                return rowValues;
            } else {
                return rowValues.map(function(val) { return Number(val); });
            }
        });
        return processedMatrix;
    };

    InputParser.prototype.readRawLines = function(numLines, returnAsString) {
        var startIdx = this.currentLineIndex;
        var endIdx = startIdx + numLines;
        var rawLines = this.sourceLines.slice(startIdx, endIdx);
        this.currentLineIndex = endIdx;
        
        if (returnAsString) {
            return rawLines;
        } else {
            return rawLines.map(function(val) { return Number(val); });
        }
    };

    return initializeReader;
})();

var inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(calculateResult());

function calculateResult() {
    var gridHeight = inputReader.readSingleValue();
    var gridWidth = inputReader.readSingleValue();
    var numObstacles = inputReader.readSingleValue();

    var blockedCells = Array.from({ length: gridHeight + 1 }, function() { return {}; });

    for (var obstacleIndex = 0; obstacleIndex < numObstacles; obstacleIndex++) {
        var obstacleCoordinates = inputReader.readLineValues();
        var startRow = obstacleCoordinates[0];
        var endRow = obstacleCoordinates[1];
        
        if (startRow < endRow) {
            continue;
        }
        blockedCells[endRow][startRow] = 1;
    }

    var boundaryCol = gridWidth + 1;
    for (var row = 1; row <= gridHeight; row++) {
        blockedCells[row][boundaryCol] = 1;
    }

    var firstRowObstacles = Object.keys(blockedCells[1]);
    var initialMinPathLength = Number(firstRowObstacles[0]) - 1;

    var currentSearchCol = 2;
    var finalMinPathLength = initialMinPathLength;

    for (var currentRow = 2; currentRow <= finalMinPathLength && currentRow <= gridHeight; currentRow++) {
        while (blockedCells[currentRow][currentSearchCol] === 1) {
            currentSearchCol++;
        }

        var rowObstacleKeys = Object.keys(blockedCells[currentRow]);
        
        for (var k = 0; k < rowObstacleKeys.length; k++) {
            var obstacleColKeyStr = rowObstacleKeys[k];
            var obstacleColumn = Number(obstacleColKeyStr);

            if (currentSearchCol > obstacleColumn) {
                continue;
            }

            var potentialNewMinPath = obstacleColumn - 1;
            if (potentialNewMinPath < finalMinPathLength) {
                finalMinPathLength = potentialNewMinPath;
            }
            break;
        }
        
        currentSearchCol++;

        if (currentSearchCol >= gridWidth) {
            break;
        }
    }
    return finalMinPathLength;
}
