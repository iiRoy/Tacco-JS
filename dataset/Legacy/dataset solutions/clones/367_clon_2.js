'use strict';
// This is a utility namespace for various environment-dependent operations.
var JSUtil = {};

(function(util) {
    /**
     * Checks if the current execution environment is a web browser.
     * @returns {boolean} True if in a browser, false otherwise.
     */
    var checkBrowserEnv = function() {
        return typeof window !== 'undefined';
    };
    util.checkBrowserEnv = checkBrowserEnv;

    /**
     * Checks if the current execution environment is Node.js.
     * @returns {boolean} True if in Node.js, false otherwise.
     */
    var checkNodeEnv = function() {
        return !checkBrowserEnv();
    };
    util.checkNodeEnv = checkNodeEnv;

    // Browser-specific utilities
    if (checkBrowserEnv()) {
        /**
         * Encodes HTML entities in a given string to prevent XSS.
         * @param {string} rawString The string to encode.
         * @returns {string} The HTML-encoded string.
         */
        var encodeHtmlEntities = function(rawString) {
            return String(rawString)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        util.encodeHtmlEntities = encodeHtmlEntities;

        /**
         * Displays the source code of a function in a designated HTML element.
         * @param {Function} targetFunction The function whose source code is to be displayed.
         */
        var displayCodeSnippet = function(targetFunction) {
            document.getElementById('code').innerHTML = '<pre><code>' + encodeHtmlEntities(targetFunction) + '</code></pre>';
        };
        util.displayCodeSnippet = displayCodeSnippet;
    }

    /**
     * Retrieves input lines from either the DOM (browser) or stdin (Node.js).
     * @returns {string[]} An array of input lines.
     */
    var retrieveInputData = function() {
        var inputLinesArray = [];
        if (checkBrowserEnv()) {
            var domHtmlContent = document.getElementById('input').innerHTML;
            inputLinesArray = domHtmlContent.split('<br>');
            for (var lineIdx = 0; lineIdx < inputLinesArray.length; lineIdx++) {
                inputLinesArray[lineIdx] = inputLinesArray[lineIdx].trim();
            }
        }
        if (checkNodeEnv()) {
            // Node.js specific input reading from /dev/stdin
            inputLinesArray = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return inputLinesArray;
    };

    /**
     * Sets up a line-by-line reader for input, invoking a callback for each line.
     * @param {Function} lineProcessingCallback The callback function to execute for each line.
     */
    var setupLineProcessor = function(lineProcessingCallback) {
        if (checkBrowserEnv()) {
            var allInputLines = retrieveInputData();
            for (var lineIndex = 0; lineIndex < allInputLines.length; lineIndex++) {
                lineProcessingCallback(allInputLines[lineIndex]);
            }
        }
        if (checkNodeEnv()) {
            // Node.js specific line reading using readline module
            var fileReadStream = require('fs').ReadStream('/dev/stdin');
            var lineReaderInterface = require('readline').createInterface({
                'input': fileReadStream,
                'output': {}
            });
            lineReaderInterface.on('line', function(currentLine) {
                lineProcessingCallback(currentLine);
            });
        }
    };
    util.setupLineProcessor = setupLineProcessor;

    /**
     * Outputs an array of lines to the appropriate destination (DOM or console).
     * @param {string[]} linesToOutput An array of strings to be output.
     */
    var performOutput = function(linesToOutput) {
        if (checkBrowserEnv()) {
            document.getElementById('output').innerHTML = linesToOutput.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            for (var outputIdx = 0; outputIdx < linesToOutput.length; outputIdx++) {
                console.log(linesToOutput[outputIdx]);
            }
        }
    };
    util.performOutput = performOutput;

    // Buffer for browser output when using performOutputLine
    var outputBuffer = [];

    /**
     * Outputs a single line to the appropriate destination (DOM or console).
     * In browser, it appends to an internal buffer and updates the DOM.
     * @param {string} singleOutputLine The string to be output.
     */
    var performOutputLine = function(singleOutputLine) {
        if (checkBrowserEnv()) {
            outputBuffer.push(singleOutputLine);
            document.getElementById('output').innerHTML = outputBuffer.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            console.log(singleOutputLine);
        }
    };
    util.performOutputLine = performOutputLine;

    /**
     * Executes the main application logic, handling browser `onload` or direct Node.js execution.
     * @param {Function} mainApplicationFunction The main function to execute.
     */
    var executeMainLogic = function(mainApplicationFunction) {
        if (checkBrowserEnv()) {
            window.onload = function() {
                displayCodeSnippet(mainApplicationFunction);
                mainApplicationFunction();
            };
        }
        if (checkNodeEnv()) {
            mainApplicationFunction();
        }
    };
    util.executeMainLogic = executeMainLogic;

})(JSUtil); // Pass the JSUtil object to the immediately invoked function expression

// Main application logic starts here
var primaryExecution = function() {
    // Define the game field boundaries
    var gridXStart = 0;
    var gridYStart = 0;
    var gridWidth = 10;
    var gridHeight = 10;

    // Movement patterns for the creature (Phyonkichi)
    var creatureMovementPatterns = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];

    // Effect area for the sprinkler (3x3 square)
    var sprinklerEffectArea = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    // Enumeration-like object for input data categories
    var inputDataCategories = {};
    inputDataCategories.creaturePosition = 0;
    inputDataCategories.sprinklerCount = 1;
    inputDataCategories.sprinklerPositions = 2;

    // Object to store parsed input data
    var parsedInput = {};
    parsedInput.creature = {};
    parsedInput.sprinklerPositions = [];

    // Counter for input lines processed
    var inputLineCounter = 0;

    /**
     * Checks if a given coordinate (x, y) is within the defined game grid.
     * @param {number} currentX The X-coordinate.
     * @param {number} currentY The Y-coordinate.
     * @returns {boolean} True if the coordinate is within bounds, false otherwise.
     */
    var isCoordinateWithinBounds = function(currentX, currentY) {
        if (gridXStart <= currentX && currentX < gridWidth) {
            if (gridYStart <= currentY && currentY < gridHeight) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Calculates all possible new locations from a starting location given a set of moves.
     * Only includes locations that are within the game grid.
     * @param {number[]} startLocation An array [x, y] representing the starting coordinates.
     * @param {number[][]} moveVectors An array of [dx, dy] movement vectors.
     * @returns {number[][]} An array of [x, y] coordinates for valid moved locations.
     */
    var calculatePossibleMoves = function(startLocation, moveVectors) {
        var validMovedLocations = [];
        for (var moveIdx = 0; moveIdx < moveVectors.length; moveIdx++) {
            var movementVector = moveVectors[moveIdx];
            var newX = startLocation[0] + movementVector[0];
            var newY = startLocation[1] + movementVector[1];
            if (isCoordinateWithinBounds(newX, newY)) {
                validMovedLocations.push([newX, newY]);
            }
        }
        return validMovedLocations;
    };

    /**
     * Determines all possible next positions for the creature based on its movement patterns.
     * @param {number[]} creatureCurrentPosition The creature's current [x, y] position.
     * @returns {number[][]} An array of possible next [x, y] positions.
     */
    var getCreatureNextPositions = function(creatureCurrentPosition) {
        return calculatePossibleMoves(creatureCurrentPosition, creatureMovementPatterns);
    };

    /**
     * Determines all locations that would be affected (wet) by a sprinkler at a given position.
     * @param {number[]} sprinklerCenterPosition The sprinkler's [x, y] center position.
     * @returns {number[][]} An array of [x, y] coordinates for wet locations.
     */
    var getAffectedTiles = function(sprinklerCenterPosition) {
        return calculatePossibleMoves(sprinklerCenterPosition, sprinklerEffectArea);
    };

    // Cache for memoization in the canCreatureEvade function
    var memoizationStore = {};
    // Stack to track the creature's path for debugging (commented out in original)
    var pathStack = [];
    // Counter for recursive calls
    var recursionDepthCounter = 0;

    /**
     * Recursively determines if the creature can survive all active sprinklers.
     * This function uses memoization to optimize repeated calculations.
     * @param {number[]} creatureCurrentPosition The creature's current [x, y] position.
     * @param {number[][]} activeSprinklerPositions An array of [x, y] positions for active sprinklers.
     * @returns {boolean} True if the creature can survive, false otherwise.
     */
    var canCreatureEvade = function(creatureCurrentPosition, activeSprinklerPositions) {
        recursionDepthCounter++; // Increment call counter
        // Create a unique key for memoization
        var memoKey = activeSprinklerPositions.length + ',' + creatureCurrentPosition[0] + ',' + creatureCurrentPosition[1];

        // Check if result is already in cache
        if (memoKey in memoizationStore) {
            return memoizationStore[memoKey];
        }

        // Add current position to path stack (for debugging, if enabled)
        pathStack.push(creatureCurrentPosition);

        // Base case: If no sprinklers left, the creature survives
        if (activeSprinklerPositions.length <= 0) {
            // console.log('Stack: ' + JSON.stringify(pathStack)); // Original comment
            return true;
        }

        // Get the first sprinkler's position and its wet area
        var currentSprinklerPosition = activeSprinklerPositions[0];
        var potentialCreaturePositions = getCreatureNextPositions(creatureCurrentPosition);
        var affectedTiles = getAffectedTiles(currentSprinklerPosition);

        // Iterate through all possible next creature positions
        for (var creatureMoveIdx = 0; creatureMoveIdx < potentialCreaturePositions.length; creatureMoveIdx++) {
            var nextCreaturePosition = potentialCreaturePositions[creatureMoveIdx];

            // Check if this next creature position is within the current sprinkler's wet area
            for (var wetTileIdx = 0; wetTileIdx < affectedTiles.length; wetTileIdx++) {
                var affectedTile = affectedTiles[wetTileIdx];

                if (nextCreaturePosition[0] === affectedTile[0] &&
                    nextCreaturePosition[1] === affectedTile[1]) {
                    // If it's wet, try to survive the *remaining* sprinklers from this new position
                    var remainingSprinklerPositions = activeSprinklerPositions.slice(1);
                    var evasionPossible = canCreatureEvade(nextCreaturePosition, remainingSprinklerPositions);
                    if (evasionPossible) {
                        // If survival is possible, cache and return true
                        memoizationStore[memoKey] = true;
                        return true;
                    }
                }
            }
        }

        // If no path leads to survival, remove current position from stack and cache false
        pathStack.splice(pathStack.length - 1, 1);
        memoizationStore[memoKey] = false;
        return false;
    };

    /**
     * Processes a single line of input, parsing it according to the current data category.
     * @param {string} currentInputLine The line of text to process.
     */
    var processInputLine = function(currentInputLine) {
        var lineArguments = currentInputLine.split(' ');
        // Convert all arguments to floating-point numbers
        for (var argIdx = 0; argIdx < lineArguments.length; argIdx++) {
            lineArguments[argIdx] = parseFloat(lineArguments[argIdx]);
        }

        // Determine the type of data based on the line counter
        var currentDataType = inputLineCounter % Object.keys(inputDataCategories).length;

        if (currentDataType === inputDataCategories.creaturePosition) {
            // Parse creature's starting position
            parsedInput.creature.coordX = lineArguments[0];
            parsedInput.creature.coordY = lineArguments[1];
            if (parsedInput.creature.coordX === 0 && parsedInput.creature.coordY === 0) {
                // console.log('end'); // Original comment
            }
        } else if (currentDataType === inputDataCategories.sprinklerCount) {
            // Parse the number of sprinklers (though not directly used in the recursive function, it's part of the input structure)
            parsedInput.sprinklerCount = lineArguments[0];
        } else if (currentDataType === inputDataCategories.sprinklerPositions) {
            // Parse all sprinkler locations for the current test case
            for (var posIdx = 0; posIdx < lineArguments.length; posIdx += 2) {
                parsedInput.sprinklerPositions.push([lineArguments[posIdx], lineArguments[posIdx + 1]]);
            }

            // Reset recursion counter and memoization cache for each new test case
            recursionDepthCounter = 0;
            memoizationStore = {}; // Clear cache for new test case
            pathStack = []; // Clear path stack for new test case

            // Execute the core logic: check if the creature can evade
            if (canCreatureEvade([parsedInput.creature.coordX, parsedInput.creature.coordY], parsedInput.sprinklerPositions)) {
                JSUtil.performOutputLine('OK');
            } else {
                JSUtil.performOutputLine('NA');
            }
            // console.log('callCount: ' + recursionDepthCounter); // Original comment
            // Clear sprinkler positions for the next test case
            parsedInput.sprinklerPositions = [];
        } else {
            // Handle other potential data types or ignore
        }
        inputLineCounter++; // Increment line counter for the next input line
    };

    // Set up the line reader to process input using the processInputLine function
    JSUtil.setupLineProcessor(processInputLine);
};

// Execute the main application logic using the utility function
JSUtil.executeMainLogic(primaryExecution);
