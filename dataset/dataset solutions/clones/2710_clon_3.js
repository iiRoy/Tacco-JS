var InputProcessor = (function() {
    function createProcessor(inputString) {
        if (typeof inputString !== 'string') {
            return new LineBuffer("");
        }
        return new LineBuffer(inputString);
    }

    function LineBuffer(inputString) {
        this.sourceLines = inputString.split(/\r?\n/).filter(line => line.trim() !== '');
        this.currentLineIdx = 0;
    }

    LineBuffer.prototype.readNextValue = function(returnAsText) {
        var lineRef = this.sourceLines;
        var idx = this.currentLineIdx;

        if (idx >= lineRef.length) {
            return null;
        }

        if (typeof lineRef[idx] === "string") {
            lineRef[idx] = lineRef[idx].split(" ").reverse();
        }

        var tokenArray = lineRef[idx];
        var retrievedToken = null;

        if (tokenArray && tokenArray.length > 0) {
            retrievedToken = tokenArray.pop();
            if (tokenArray.length === 0) {
                this.currentLineIdx++;
            }
        } else {
            this.currentLineIdx++;
            return null;
        }
        
        return returnAsText ? retrievedToken : Number(retrievedToken);
    };

    LineBuffer.prototype.readFullLine = function(returnAsText) {
        if (this.currentLineIdx >= this.sourceLines.length) {
            return [];
        }
        var currentLineContent = this.sourceLines[this.currentLineIdx++];
        var tokens = currentLineContent.split(" ");
        return returnAsText ? tokens : tokens.map(item => Number(item));
    };

    LineBuffer.prototype.readMatrixData = function(count, returnAsText) {
        if (count <= 0 || !Number.isInteger(count)) {
            return [];
        }

        var startIdx = this.currentLineIdx;
        var endIdx = this.currentLineIdx + count;
        var linesToProcess = this.sourceLines.slice(startIdx, endIdx);
        this.currentLineIdx = endIdx;

        var resultMatrix = linesToProcess.map(line => line.split(" "));

        return returnAsText ? resultMatrix : resultMatrix.map(row => row.map(item => Number(item)));
    };

    LineBuffer.prototype.readRawLines = function(count, returnAsText) {
        if (count <= 0 || !Number.isInteger(count)) {
            return [];
        }
        var startIdx = this.currentLineIdx;
        var endIdx = this.currentLineIdx + count;
        var rawLines = this.sourceLines.slice(startIdx, endIdx);
        this.currentLineIdx = endIdx;
        
        return returnAsText ? rawLines : rawLines.map(item => Number(item));
    };

    return createProcessor;
})();

var dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

var maxSingleStep, finalTargetX, finalTargetY;
var currentPosX = 0, currentPosY = 0;

function executePathfinding() {
    maxSingleStep = dataParser.readNextValue();
    finalTargetX = dataParser.readNextValue();
    finalTargetY = dataParser.readNextValue();

    if (typeof maxSingleStep !== 'number' || isNaN(maxSingleStep) || maxSingleStep < 0 ||
        typeof finalTargetX !== 'number' || isNaN(finalTargetX) ||
        typeof finalTargetY !== 'number' || isNaN(finalTargetY)) {
        return "Error: Invalid input";
    }

    if (!finalTargetX && !finalTargetY) {
        return "0";
    }

    var isStepEven = (maxSingleStep % 2 === 0);
    var isTargetSumOdd = ((finalTargetX + finalTargetY) % 2 !== 0);
    if (isStepEven && isTargetSumOdd) {
        return "-1";
    }

    var movementLog = [];
    var doubleMaxStep = maxSingleStep * 2;

    var currentPathDistance = calculateManhattanDistance();
    var iterationCount = 0; // Added for safeguard

    while (currentPathDistance > doubleMaxStep || currentPathDistance % 2 !== 0) {
        movementLog.push(performMovement());
        currentPathDistance = calculateManhattanDistance();
        iterationCount++;
        if (iterationCount > 1000000) {
            return "Error: Too many steps, potential infinite loop.";
        }
    }

    if (currentPathDistance % maxSingleStep === 0) {
        while (calculateManhattanDistance() > 0) {
            movementLog.push(performMovement());
        }
    } else {
        var originalTargetCoords = { x: finalTargetX, y: finalTargetY };

        var absDiffX = Math.abs(currentPosX - finalTargetX);
        var absDiffY = Math.abs(currentPosY - finalTargetY);
        var adjustmentMagnitude = (doubleMaxStep - absDiffX - absDiffY) / 2;

        if (adjustmentMagnitude < 0 || !Number.isInteger(adjustmentMagnitude)) {
            movementLog.push(performMovement());
            finalTargetX = originalTargetCoords.x;
            finalTargetY = originalTargetCoords.y;
            movementLog.push(performMovement());
            return movementLog.length + '\n' + movementLog.join('\n');
        }

        if (absDiffX >= absDiffY) {
            finalTargetY = (currentPosY < finalTargetY) ? currentPosY - adjustmentMagnitude : currentPosY + adjustmentMagnitude;
            finalTargetX = (currentPosX < finalTargetX) ? currentPosX + maxSingleStep - adjustmentMagnitude : currentPosX - maxSingleStep + adjustmentMagnitude;
        } else {
            finalTargetX = (currentPosX < finalTargetX) ? currentPosX - adjustmentMagnitude : currentPosX + adjustmentMagnitude;
            finalTargetY = (currentPosY < finalTargetY) ? currentPosY + maxSingleStep - adjustmentMagnitude : currentPosY - maxSingleStep + adjustmentMagnitude;
        }
        
        movementLog.push(performMovement());

        finalTargetX = originalTargetCoords.x;
        finalTargetY = originalTargetCoords.y;
        
        movementLog.push(performMovement());
    }
    
    return movementLog.length + '\n' + movementLog.join('\n');
}

function calculateManhattanDistance() {
    return Math.abs(currentPosX - finalTargetX) + Math.abs(currentPosY - finalTargetY);
}

function performMovement() {
    var remainingStepAmount = maxSingleStep;

    var deltaX = finalTargetX - currentPosX;
    var deltaY = finalTargetY - currentPosY;

    if (deltaX !== 0) {
        var potentialXMove = Math.min(remainingStepAmount, Math.abs(deltaX));
        if (deltaX < 0) {
            currentPosX -= potentialXMove;
        } else {
            currentPosX += potentialXMove;
        }
        remainingStepAmount -= potentialXMove;
    }

    if (remainingStepAmount > 0) {
        if (deltaY !== 0) {
            if (deltaY < 0) {
                currentPosY -= remainingStepAmount;
            } else {
                currentPosY += remainingStepAmount;
            }
        }
    }
    
    return `${currentPosX} ${currentPosY}`;
}

console.log(executePathfinding());