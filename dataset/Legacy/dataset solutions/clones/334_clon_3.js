var logOutput = console.log;
var cachedInputLines;

function prepareInputReader(rawInputString) {
    cachedInputLines = rawInputString.split("\n");
    return function () {
        return cachedInputLines.shift();
    };
}

function parseIntegerLine(adjustForZeroIndex) {
    var stringParts = cachedInputLines.shift().split(' ');
    var indexAdjustment = adjustForZeroIndex ? -1 : 0; // This variable is not used in the current implementation, but kept for structural similarity.
    var resultArray = stringParts.map(function(part) {
        return parseInt(part);
    });
    return resultArray;
}

function findMaximum() {
    var currentMax = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        currentMax = currentMax > arguments[i] ? currentMax : arguments[i];
    }
    return currentMax;
}

function findMinimum() {
    var currentMin = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        currentMin = currentMin < arguments[i] ? currentMin : arguments[i];
    }
    return currentMin;
}


/**
 * @return {number}
 */
Array.prototype.calculateSum = function calculateSum() {
    return this.reduce(function (accumulator, elementValue) {
        return accumulator + elementValue;
    }, 0);
};

/**
 * @return {string}
 */
Array.prototype.formatArray = function formatArray(separatorChar) {
    if (separatorChar === undefined) {
        separatorChar = " ";
    }
    return this.join(separatorChar);
};

function createObjectKeyComparator(keyName, descendingOrder, tieBreakerFunction) {
    var sortDirection = 1;
    if (descendingOrder) {
        sortDirection = -1;
    }
    return function (itemA, itemB) {
        var comparisonResult = 0;
        if (itemA[keyName] < itemB[keyName]) {
            comparisonResult = -1 * sortDirection;
        } else if (itemA[keyName] > itemB[keyName]) {
            comparisonResult = sortDirection;
        }

        if (comparisonResult !== 0) {
            return comparisonResult;
        } else if (tieBreakerFunction !== undefined) {
            return tieBreakerFunction(itemA, itemB);
        } else {
            return 0;
        }
    };
}

function processGridSimulation(rawInputString) {
    var getLine = prepareInputReader(rawInputString);
    const LOOP_MARKER = "a";
    const EXIT_MARKER = ".";

    while (true) {
        var gridDimensions = parseIntegerLine();
        var numRows = gridDimensions[0];

        if (numRows === 0) {
            return;
        }

        var gridMap = [];
        for (var i = 0; i < numRows; i++) {
            gridMap.push(getLine().split(""));
        }

        var directionVectors = {
            ">": [1, 0],
            "v": [0, 1],
            "^": [0, -1],
            "<": [-1, 0]
        };

        var currentCol = 0;
        var currentRow = 0;

        while (true) {
            var currentCellContent = gridMap[currentRow][currentCol];

            if (currentCellContent === EXIT_MARKER) {
                break;
            }

            if (currentCellContent === LOOP_MARKER) {
                logOutput("LOOP");
                return;
            }

            var deltaPair = directionVectors[currentCellContent];
            gridMap[currentRow][currentCol] = LOOP_MARKER; // Mark as visited

            currentCol += deltaPair[0];
            currentRow += deltaPair[1];
        }
        logOutput(currentCol, currentRow);
    }
}

processGridSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
