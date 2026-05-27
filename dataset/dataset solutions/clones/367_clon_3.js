'use strict';
var App = {};
(function(namespace) {
    var checkBrowserEnv = function() {
        return typeof window !== 'undefined';
    };
    namespace.checkBrowserEnv = checkBrowserEnv;

    var checkNodeEnv = function() {
        return !checkBrowserEnv();
    };
    namespace.checkNodeEnv = checkNodeEnv;

    if (checkBrowserEnv()) {
        var encodeHtmlEntities = function(rawString) {
            const stringValue = String(rawString);
            return stringValue
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        };
        namespace.encodeHtmlEntities = encodeHtmlEntities;

        var displaySourceCode = function(targetFunction) {
            const codeElement = document.getElementById('code');
            if (codeElement) {
                codeElement.innerHTML = '<pre><code>' + encodeHtmlEntities(targetFunction) + '</code></pre>';
            }
        };
        namespace.displaySourceCode = displaySourceCode;
    }

    var retrieveInputLines = function() {
        var receivedLines = [];
        if (checkBrowserEnv()) {
            var htmlContent = document.getElementById('input').innerHTML;
            receivedLines = htmlContent.split('<br>').map(line => line.trim());
        } else if (checkNodeEnv()) {
            receivedLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return receivedLines;
    };

    var setupLineProcessor = function(lineHandler) {
        if (checkBrowserEnv()) {
            var lines = retrieveInputLines();
            for (var i = 0; i < lines.length; i++) {
                lineHandler(lines[i]);
            }
        } else if (checkNodeEnv()) {
            var fileReadStream = require('fs').ReadStream('/dev/stdin');
            var lineReaderInterface = require('readline').createInterface({'input': fileReadStream, 'output': {}});
            lineReaderInterface.on('line', function(line) {
                lineHandler(line);
            });
        }
    };
    namespace.setupLineProcessor = setupLineProcessor;

    var renderOutputLines = function(outputContentArray) {
        if (checkBrowserEnv()) {
            const outputElement = document.getElementById('output');
            if (outputElement) {
                outputElement.innerHTML = outputContentArray.map(encodeHtmlEntities).join('<br>\n');
            }
        } else if (checkNodeEnv()) {
            for (var i = 0; i < outputContentArray.length; i++) {
                console.log(outputContentArray[i]);
            }
        }
    };
    namespace.renderOutputLines = renderOutputLines;

    var bufferedOutput = [];
    var renderSingleOutputLine = function(singleLineContent) {
        if (checkBrowserEnv()) {
            bufferedOutput.push(singleLineContent);
            const outputElement = document.getElementById('output');
            if (outputElement) {
                outputElement.innerHTML = bufferedOutput.map(encodeHtmlEntities).join('<br>\n');
            }
        } else if (checkNodeEnv()) {
            console.log(singleLineContent);
        }
    };
    namespace.renderSingleOutputLine = renderSingleOutputLine;

    var executeMainLogic = function(applicationEntry) {
        if (checkBrowserEnv()) {
            window.onload = function() {
                displaySourceCode(applicationEntry);
                applicationEntry();
            };
        } else if (checkNodeEnv()) {
            applicationEntry();
        }
    };
    namespace.executeMainLogic = executeMainLogic;
})(App);

var applicationEntry = function() {
    const gridMinX = 0;
    const gridMinY = 0;
    const gridWidth = 10;
    const gridHeight = 10;

    const playerMovementVectors = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];
    const sprinklerEffectVectors = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    var inputDataKeys = {};
    inputDataKeys.phyonkichiLocation = 0;
    inputDataKeys.numSprinklers = 1;
    inputDataKeys.splinklerLocations = 2;

    var processedInputData = {
        phyonkichi: {},
        splinklerLocations: []
    };
    var currentLineIndex = 0;

    var isWithinGridBounds = function(xCoord, yCoord) {
        const isXValid = xCoord >= gridMinX && xCoord < gridWidth;
        const isYValid = yCoord >= gridMinY && yCoord < gridHeight;
        return isXValid && isYValid;
    };

    var calculatePotentialPositions = function(currentPosition, movementOffsets) {
        var possibleNewPositions = [];
        for (var i = 0; i < movementOffsets.length; i++) {
            var offsetVector = movementOffsets[i];
            var newX = currentPosition[0] + offsetVector[0];
            var newY = currentPosition[1] + offsetVector[1];
            if (isWithinGridBounds(newX, newY)) {
                possibleNewPositions.push([newX, newY]);
            }
        }
        return possibleNewPositions;
    };

    var getPlayerNextPositions = function(playerCurrentPos) {
        return calculatePotentialPositions(playerCurrentPos, playerMovementVectors);
    };

    var getAffectedGridCells = function(currentSprinklerPos) {
        return calculatePotentialPositions(currentSprinklerPos, sprinklerEffectVectors);
    };

    var memoizationStore = {}; // Cache persists across test cases
    var recursionPath = []; // For debugging, not critical for logic
    var recursiveCallCounter = 0;

    const areLocationsEqual = (loc1, loc2) => loc1[0] === loc2[0] && loc1[1] === loc2[1];

    var canPlayerEvade = function(playerCurrentPos, activeSprinklerPositions) {
        recursiveCallCounter++;
        const xCoord = playerCurrentPos[0];
        const yCoord = playerCurrentPos[1];
        const numSprinklers = activeSprinklerPositions.length;
        const cacheKey = `${numSprinklers},${xCoord},${yCoord}`;

        if (cacheKey in memoizationStore) {
            return memoizationStore[cacheKey];
        }

        recursionPath.push(playerCurrentPos);

        if (numSprinklers <= 0) {
            // console.log('Stack: ' + JSON.stringify(recursionPath));
            recursionPath.pop(); // Balance stack on return
            return true;
        }

        var currentSprinklerPos = activeSprinklerPositions[0];
        var playerNextPossiblePositions = getPlayerNextPositions(playerCurrentPos);
        var sprinklerAffectedCells = getAffectedGridCells(currentSprinklerPos);

        // Guard clause: if no next positions, player cannot survive this turn
        if (playerNextPossiblePositions.length === 0) {
            recursionPath.pop(); // Balance stack
            memoizationStore[cacheKey] = false;
            return false;
        }

        for (var i = 0; i < playerNextPossiblePositions.length; i++) {
            var nextPlayerPos = playerNextPossiblePositions[i];
            for (var j = 0; j < sprinklerAffectedCells.length; j++) {
                var affectedCell = sprinklerAffectedCells[j];
                if (areLocationsEqual(nextPlayerPos, affectedCell)) {
                    var remainingSprinklers = activeSprinklerPositions.slice(1);
                    var canContinue = canPlayerEvade(nextPlayerPos, remainingSprinklers);
                    if (canContinue) {
                        memoizationStore[cacheKey] = true;
                        recursionPath.pop(); // Balance stack on successful path
                        return true;
                    }
                }
            }
        }
        recursionPath.pop(); // Balance stack on failed path
        memoizationStore[cacheKey] = false;
        return false;
    };

    const parseNumericArgs = (lineStr) => {
        return lineStr.split(' ').map(parseFloat);
    };

    var processInputLine = function(line) {
        var lineTokens = parseNumericArgs(line);
        var currentDataType = currentLineIndex % Object.keys(inputDataKeys).length;

        switch (currentDataType) {
            case inputDataKeys.phyonkichiLocation:
                processedInputData.phyonkichi.x = lineTokens[0];
                processedInputData.phyonkichi.y = lineTokens[1];
                // Original comment: if (input.phyonkichi.x === 0 && input.phyonkichi.y === 0) { /* console.log('end'); */ }
                break;
            case inputDataKeys.numSprinklers:
                processedInputData.numSprinklers = lineTokens[0];
                break;
            case inputDataKeys.splinklerLocations:
                const newSprinklerPositions = [];
                for (var i = 0; i < lineTokens.length; i += 2) {
                    newSprinklerPositions.push([lineTokens[i], lineTokens[i + 1]]);
                }
                processedInputData.splinklerLocations = newSprinklerPositions;

                recursiveCallCounter = 0; // Reset call counter for each test case
                // memoizationStore is NOT reset here, it persists as per original logic

                const playerStartPos = [processedInputData.phyonkichi.x, processedInputData.phyonkichi.y];
                const result = canPlayerEvade(playerStartPos, processedInputData.splinklerLocations);

                if (result) {
                    App.renderSingleOutputLine('OK');
                } else {
                    App.renderSingleOutputLine('NA');
                }
                // Original comment: console.log('callCount: ' + recursiveCallCounter);
                break;
            default:
                // No action for other data types
                break;
        }
        currentLineIndex++;
    };
    App.setupLineProcessor(processInputLine);
};

App.executeMainLogic(applicationEntry);
