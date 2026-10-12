'use strict';
var MyLib = {};
(function(libScope) {
    // Function to determine if the current environment is a web browser.
    var checkBrowserEnv = function() {
        return typeof window !== 'undefined';
    };
    libScope.checkBrowserEnv = checkBrowserEnv;

    // Function to determine if the current environment is Node.js.
    var checkNodeEnv = function() {
        return !checkBrowserEnv();
    };
    libScope.checkNodeEnv = checkNodeEnv;

    // Browser-specific utility functions.
    if (checkBrowserEnv()) {
        // Encodes HTML entities in a given string to prevent XSS.
        var encodeHtmlEntities = function(inputString) {
            return String(inputString)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
        };
        libScope.encodeHtmlEntities = encodeHtmlEntities;

        // Displays a code snippet within a <pre><code> block in the 'code' element.
        var displayCodeSnippet = function(targetFunction) {
            document.getElementById('code').innerHTML = '<pre><code>' + encodeHtmlEntities(targetFunction) + '</code></pre>';
        };
        libScope.displayCodeSnippet = displayCodeSnippet;
    }

    // Retrieves input lines from either browser DOM or Node.js stdin.
    var retrieveInputData = function() {
        var inputLinesArray = [];
        if (checkBrowserEnv()) {
            var domHtmlContent = document.getElementById('input').innerHTML;
            inputLinesArray = domHtmlContent.split('<br>');
            for (var idx = 0; idx < inputLinesArray.length; idx++) {
                inputLinesArray[idx] = inputLinesArray[idx].trim();
            }
        }
        if (checkNodeEnv()) {
            inputLinesArray = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return inputLinesArray;
    };
    libScope.retrieveInputData = retrieveInputData;

    // Sets up a line-by-line reader, invoking a callback for each line.
    var configureLineProcessor = function(lineProcessingCallback) {
        if (checkBrowserEnv()) {
            var allLines = retrieveInputData();
            for (var i = 0; i < allLines.length; i++) {
                lineProcessingCallback(allLines[i]);
            }
        }
        if (checkNodeEnv()) {
            var fileReadStream = require('fs').ReadStream('/dev/stdin');
            var lineInterface = require('readline').createInterface({'input': fileReadStream, 'output': {}});
            lineInterface.on('line', function(currentLine) {
                lineProcessingCallback(currentLine);
            });
        }
    };
    libScope.configureLineProcessor = configureLineProcessor;

    // Displays an array of output lines.
    var performOutputDisplay = function(linesToDisplay) {
        if (checkBrowserEnv()) {
            document.getElementById('output').innerHTML = linesToDisplay.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            for (var i = 0; i < linesToDisplay.length; i++) {
                console.log(linesToDisplay[i]);
            }
        }
    };
    libScope.performOutputDisplay = performOutputDisplay;

    // Buffer for browser output.
    var outputBuffer = [];
    // Appends a single line to the output.
    var appendOutputLine = function(singleLineOutput) {
        if (checkBrowserEnv()) {
            outputBuffer.push(singleLineOutput);
            document.getElementById('output').innerHTML = outputBuffer.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            console.log(singleLineOutput);
        }
    };
    libScope.appendOutputLine = appendOutputLine;

    // Executes the main program logic, handling browser onload or direct Node.js execution.
    var executeMainLogic = function(mainExecutionFunction) {
        if (checkBrowserEnv()) {
            window.onload = function() {
                displayCodeSnippet(mainExecutionFunction);
                mainExecutionFunction();
            };
        }
        if (checkNodeEnv()) {
            mainExecutionFunction();
        }
    };
    libScope.executeMainLogic = executeMainLogic;
})(MyLib);

var programEntry = function() {
    var gridXStart = 0;
    var gridYStart = 0;
    var gridWidth = 0xA; // 10
    var gridHeight = 0xA; // 10
    var phyonkichiMovementVectors = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];
    var sprinklerEffectVectors = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    // Checks if a given coordinate is within the defined grid boundaries.
    var isCoordinateWithinBounds = function(coordX, coordY) {
        if (gridXStart <= coordX && coordX < gridWidth) {
            if (gridYStart <= coordY && coordY < gridHeight) {
                return !false; // true
            } else {
                return !true; // false
            }
        } else {
            return !true; // false
        }
    };

    // Calculates new locations based on a starting location and a set of movement offsets.
    var calculateDisplacedCoordinates = function(currentLocation, movementOffsets) {
        var displacedCoordinates = [];
        for (var i = 0; i < movementOffsets.length; i++) {
            var currentOffset = movementOffsets[i];
            var newX = currentLocation[0] + currentOffset[0];
            var newY = currentLocation[1] + currentOffset[1];
            if (isCoordinateWithinBounds(newX, newY)) {
                displacedCoordinates.push([newX, newY]);
            }
        }
        return displacedCoordinates;
    };

    // Determines all possible next positions for Phyonkichi.
    var determineNextPhyonkichiPositions = function(characterCurrentPosition) {
        return calculateDisplacedCoordinates(characterCurrentPosition, phyonkichiMovementVectors);
    };

    // Identifies all grid cells affected by a sprinkler at a given location.
    var identifyAffectedAreas = function(sprinklerCenter) {
        return calculateDisplacedCoordinates(sprinklerCenter, sprinklerEffectVectors);
    };

    var memoizationStore; // Cache for memoization
    var pathTracker;      // Stack to track the current path
    var recursionCounter; // Counter for recursive calls

    // Recursive function to check if Phyonkichi can survive the sprinklers.
    var canCharacterEvade = function(charPosition, sprinklerArray) {
        recursionCounter++;
        var memoKey = sprinklerArray.length + ', ' + charPosition[0] + ', ' + charPosition[1];
        if (memoKey in memoizationStore) {
            return memoizationStore[memoKey];
        }

        pathTracker.push(charPosition);

        if (sprinklerArray.length <= 0) {
            // console.log('Path: ' + JSON.stringify(pathTracker)); // Original comment
            return !false; // true
        }

        var activeSprinkler = sprinklerArray[0];
        var possibleNextCharPositions = determineNextPhyonkichiPositions(charPosition);
        var affectedGridCells = identifyAffectedAreas(activeSprinkler);

        for (var i = 0; i < possibleNextCharPositions.length; i++) {
            var potentialCharPosition = possibleNextCharPositions[i];
            for (var j = 0; j < affectedGridCells.length; j++) {
                var wetCell = affectedGridCells[j];
                if (potentialCharPosition[0] === wetCell[0] &&
                    potentialCharPosition[1] === wetCell[1]) {
                    var remainingSprinklers = sprinklerArray.slice(1);
                    var canEvade = canCharacterEvade(potentialCharPosition, remainingSprinklers);
                    if (canEvade) {
                        return !false; // true
                    }
                }
            }
        }

        pathTracker.splice(pathTracker.length - 1, 1);
        memoizationStore[memoKey] = !true; // false
        return !true; // false
    };

    var inputDataCategories = {};
    inputDataCategories.phyonkichiLocation = 0;
    inputDataCategories.numSprinklers = 1;
    inputDataCategories.splinklerLocations = 2;

    var currentInputDataSet;
    var processedLineCounter = 0;

    // Processes each line of input data.
    var processInputLine = function(currentInputLine) {
        var parsedArguments = currentInputLine.split(' ');
        for (var i = 0; i < parsedArguments.length; i++) {
            parsedArguments[i] = parseFloat(parsedArguments[i]);
        }

        var currentDataType = processedLineCounter % Object.keys(inputDataCategories).length;

        if (currentDataType === inputDataCategories.phyonkichiLocation) {
            currentInputDataSet = {};
            currentInputDataSet.characterPos = {};
            currentInputDataSet.sprinklerPositions = [];
            currentInputDataSet.characterPos.xCoord = parsedArguments[0];
            currentInputDataSet.characterPos.yCoord = parsedArguments[1];
            if (currentInputDataSet.characterPos.xCoord === 0 && currentInputDataSet.characterPos.yCoord === 0) {
                // console.log('end condition met'); // Original comment
            }
        } else if (currentDataType === inputDataCategories.numSprinklers) {
            currentInputDataSet.numSprinklers = parsedArguments[0];
        } else if (currentDataType === inputDataCategories.splinklerLocations) {
            for (var i = 0; i < parsedArguments.length; i += 2) {
                currentInputDataSet.sprinklerPositions.push([parsedArguments[i], parsedArguments[i + 1]]);
            }
            // console.log(JSON.stringify(currentInputDataSet)); // Original comment
            recursionCounter = 0;
            memoizationStore = {};
            pathTracker = [];
            if (canCharacterEvade([currentInputDataSet.characterPos.xCoord, currentInputDataSet.characterPos.yCoord], currentInputDataSet.sprinklerPositions)) {
                MyLib.appendOutputLine('OK');
            } else {
                MyLib.appendOutputLine('NA');
            }
            // console.log('Recursion count: ' + recursionCounter); // Original comment
        } else {
            // No action for other data types
        }
        processedLineCounter++;
    };

    MyLib.configureLineProcessor(processInputLine);
};

MyLib.executeMainLogic(programEntry);
