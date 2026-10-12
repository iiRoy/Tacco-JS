var logOutput = console.log;

function createInputReader(rawInputData) {
    var inputLines = rawInputData.split("\n");
    var currentLineIndex = 0;
    var getNextLine = function () {
        if (currentLineIndex < inputLines.length) {
            return inputLines[currentLineIndex++];
        }
        return undefined;
    };
    return getNextLine;
}

String.prototype.repeatString = function repeatString(count) {
    if (count <= 0) {
        return "";
    }
    return Array.from({ length: count }, () => this.toString()).join('');
};

function parseIntegerList(inputLineStr, adjustForZeroIndex) {
    var stringParts = inputLineStr.split(' ');
    // The 'adjustForZeroIndex' parameter is present for signature compatibility
    // with the original function but its logic was not utilized in the original
    // implementation of IL for the given problem context.
    var parsedNumbers = stringParts.map(function(s) {
        return parseInt(s, 10);
    });
    return parsedNumbers;
}

function generateRange(startVal, endVal) {
    var rangeLength = endVal - startVal;
    if (rangeLength <= 0) {
        return [];
    }
    return Array.from({ length: rangeLength }, function(_, index) {
        return startVal + index;
    });
}

const findMaximum = (valA, valB) => (valA > valB ? valA : valB);

const findMinimum = (valA, valB) => (valA < valB ? valA : valB);

function createObjectPropertyComparator(propertyName) {
    return function (objA, objB) {
        if (objA[propertyName] < objB[propertyName]) {
            return -1;
        } else if (objA[propertyName] > objB[propertyName]) {
            return 1;
        }
        return 0;
    };
}

function simulateGameSegment(getInputLine) {
    const MAX_OUTS_PER_INNING = 3;
    var currentOuts = 0;
    var currentRunnersOnBase = 0;
    var currentPoints = 0;

    while (currentOuts < MAX_OUTS_PER_INNING) {
        var playEvent = getInputLine();

        if (playEvent === 'HIT') {
            if (currentRunnersOnBase === 3) {
                currentPoints++;
            } else {
                currentRunnersOnBase++;
            }
        } else if (playEvent === 'HOMERUN') {
            var totalScoredThisPlay = currentRunnersOnBase + 1;
            currentPoints += totalScoredThisPlay;
            currentRunnersOnBase = 0;
        } else {
            currentOuts++;
        }
    }
    return currentPoints;
}

function processGameData(rawInputData) {
    var getInputLine = createInputReader(rawInputData);
    var numberOfGames = Number(getInputLine());

    for (var gameCounter = 0; gameCounter < numberOfGames; gameCounter++) {
        var gameScore = simulateGameSegment(getInputLine);
        logOutput(gameScore);
    }
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
