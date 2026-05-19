'use strict';
// Global namespace object for application utilities
var APP_UTIL = {};

// Immediately-invoked function expression to define and encapsulate utility functions
(function(namespaceObj) {
    /**
     * Determines if the current execution environment is a web browser.
     * @returns {boolean} True if running in a browser, false otherwise.
     */
    var checkBrowserEnv = function() {
        return typeof window !== 'undefined';
    };
    // Expose the browser environment check function to the global namespace
    namespaceObj.checkBrowserEnv = checkBrowserEnv;

    /**
     * Determines if the current execution environment is Node.js.
     * This is inferred by checking if it's NOT a browser environment.
     * @returns {boolean} True if running in Node.js, false otherwise.
     */
    var checkNodeEnv = function() {
        return !checkBrowserEnv();
    };
    // Expose the Node.js environment check function to the global namespace
    namespaceObj.checkNodeEnv = checkNodeEnv;

    // Browser-specific utility functions, only defined if in a browser environment
    if (checkBrowserEnv()) {
        /**
         * Encodes special HTML characters in a given string to their entity equivalents.
         * This prevents issues when displaying user-generated content as HTML.
         * @param {string} inputString The string to be HTML-encoded.
         * @returns {string} The HTML-encoded string.
         */
        var encodeHtmlEntities = function(inputString) {
            return String(inputString)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        // Expose the HTML encoding function
        namespaceObj.encodeHtmlEntities = encodeHtmlEntities;

        /**
         * Displays the source code of a provided function within a `<pre><code>` block
         * in an HTML element with the ID 'code'.
         * @param {Function} targetFunction The function whose source code will be displayed.
         */
        var displaySourceCode = function(targetFunction) {
            document.getElementById('code').innerHTML = '<pre><code>' + encodeHtmlEntities(targetFunction) + '</code></pre>';
        };
        // Expose the code display function
        namespaceObj.displaySourceCode = displaySourceCode;
    }

    /**
     * Retrieves input lines from the appropriate source based on the environment.
     * In a browser, it reads from an HTML element with ID 'input'.
     * In Node.js, it reads from standard input (/dev/stdin).
     * @returns {string[]} An array of strings, where each string is an input line.
     */
    var retrieveInputLines = function() {
        var receivedLines = [];
        if (checkBrowserEnv()) {
            // For browser, get content from a div and split by <br> tags
            var domContent = document.getElementById('input').innerHTML;
            receivedLines = domContent.split('<br>');
            // Trim whitespace from each line
            for (var idx = 0; idx < receivedLines.length; idx++) {
                receivedLines[idx] = receivedLines[idx].trim();
            }
        }
        if (checkNodeEnv()) {
            // For Node.js, read synchronously from stdin
            receivedLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return receivedLines;
    };

    /**
     * Sets up a mechanism to process input lines one by one using a callback function.
     * Handles both immediate processing for browser input and event-driven processing for Node.js streams.
     * @param {Function} lineCallback The callback function to be invoked for each input line.
     */
    var setupLineProcessor = function(lineCallback) {
        if (checkBrowserEnv()) {
            // In browser, retrieve all lines and call the callback for each
            var lines = retrieveInputLines();
            for (var idx = 0; idx < lines.length; idx++) {
                lineCallback(lines[idx]);
            }
        }
        if (checkNodeEnv()) {
            // In Node.js, use the 'readline' module to process input stream line by line
            var fileStream = require('fs').ReadStream('/dev/stdin');
            var lineReader = require('readline').createInterface({
                'input': fileStream,
                'output': {} // A dummy output stream is required but not used here
            });
            lineReader.on('line', function(currentLine) {
                lineCallback(currentLine);
            });
        }
    };
    // Expose the line reader setup function
    namespaceObj.setupLineProcessor = setupLineProcessor;

    /**
     * Outputs an array of strings to the appropriate destination.
     * In a browser, it updates an HTML element with ID 'output'.
     * In Node.js, it prints each string to the console.
     * @param {string[]} resultLines An array of strings to be output.
     */
    var performOutput = function(resultLines) {
        if (checkBrowserEnv()) {
            // For browser, HTML-encode and join lines with <br>\n
            document.getElementById('output').innerHTML = resultLines.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            // For Node.js, print each line to standard output
            for (var idx = 0; idx < resultLines.length; idx++) {
                console.log(resultLines[idx]);
            }
        }
    };
    // Expose the output function
    namespaceObj.performOutput = performOutput;

    // Internal array to accumulate output lines when in a browser environment
    var accumulatedOutputLines = [];

    /**
     * Outputs a single string line to the appropriate destination.
     * In a browser, it appends to an internal array and updates the DOM.
     * In Node.js, it prints directly to the console.
     * @param {string} singleResultLine The single string line to be output.
     */
    var performOutputLine = function(singleResultLine) {
        if (checkBrowserEnv()) {
            accumulatedOutputLines.push(singleResultLine);
            document.getElementById('output').innerHTML = accumulatedOutputLines.map(encodeHtmlEntities).join('<br>\n');
        }
        if (checkNodeEnv()) {
            console.log(singleResultLine);
        }
    };
    // Expose the single line output function
    namespaceObj.performOutputLine = performOutputLine;

    /**
     * Orchestrates the execution of the main application logic.
     * In a browser, it waits for the window to load before executing.
     * In Node.js, it executes immediately.
     * @param {Function} primaryLogic The main function containing the application's core logic.
     */
    var executeMainLogic = function(primaryLogic) {
        if (checkBrowserEnv()) {
            window.onload = function() {
                displaySourceCode(primaryLogic); // Display the main function's source
                primaryLogic(); // Execute the main function
            };
        }
        if (checkNodeEnv()) {
            primaryLogic(); // Execute the main function directly
        }
    };
    // Expose the main logic execution function
    namespaceObj.executeMainLogic = executeMainLogic;

})(APP_UTIL); // Pass the global APP_UTIL object to the IIFE

// --- Start of the main application logic ---

/**
 * The primary application function that encapsulates the problem-solving algorithm.
 * This function is responsible for reading input, performing calculations, and producing output.
 */
var primaryApplication = function() {
    // Define the boundaries of the game field
    var gridStartX = 0;
    var gridStartY = 0;
    var gridWidth = 10;
    var gridHeight = 10;

    // Define the relative movement vectors for Phyonkichi (similar to a knight's moves)
    var phyonkichiMovementVectors = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];

    // Define the relative coordinates that become wet around a sprinkler (a 3x3 square)
    var sprinklerEffectVectors = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    // An object acting as an enumeration for different input data types
    var inputDataCategories = {};
    inputDataCategories.phyonkichiLocation = 0;
    inputDataCategories.numSprinklers = 1;
    inputDataCategories.splinklerLocations = 2;

    var currentInputData; // Object to hold parsed input for the current test case
    var processedLineCounter = 0; // Counter to keep track of the current input line number

    /**
     * Checks if a given coordinate (x, y) falls within the defined game grid boundaries.
     * @param {number} coordX The X-coordinate to check.
     * @param {number} coordY The Y-coordinate to check.
     * @returns {boolean} True if the coordinate is within bounds, false otherwise.
     */
    var isCoordinateWithinBounds = function(coordX, coordY) {
        if (gridStartX <= coordX && coordX < gridWidth) {
            if (gridStartY <= coordY && coordY < gridHeight) {
                return true;
            } else {
                return false; // Y-coordinate is out of the vertical bounds
            }
        } else {
            return false; // X-coordinate is out of the horizontal bounds
        }
    };

    /**
     * Calculates all possible new locations from a starting position by applying a set of movement patterns.
     * Only locations that remain within the game field boundaries are included.
     * @param {number[]} currentPosition An array `[x, y]` representing the starting point.
     * @param {number[][]} movementPatterns An array of `[dx, dy]` vectors representing possible moves.
     * @returns {number[][]} An array of `[x, y]` coordinates for valid new positions.
     */
    var calculateDisplacedPositions = function(currentPosition, movementPatterns) {
        var newPositions = [];
        for (var idx = 0; idx < movementPatterns.length; idx++) {
            var singleMove = movementPatterns[idx];
            var nextX = currentPosition[0] + singleMove[0];
            var nextY = currentPosition[1] + singleMove[1];
            if (isCoordinateWithinBounds(nextX, nextY)) {
                newPositions.push([nextX, nextY]);
            }
        }
        return newPositions;
    };

    /**
     * Determines all valid next positions Phyonkichi can move to from its current location.
     * @param {number[]} phyonkichiCurrentPos The current `[x, y]` coordinates of Phyonkichi.
     * @returns {number[][]} An array of `[x, y]` coordinates for Phyonkichi's next possible positions.
     */
    var determineNextPhyonkichiPositions = function(phyonkichiCurrentPos) {
        return calculateDisplacedPositions(phyonkichiCurrentPos, phyonkichiMovementVectors);
    };

    /**
     * Identifies all grid cells that become wet due to a sprinkler at a given location.
     * @param {number[]} sprinklerCurrentPos The `[x, y]` coordinates of the sprinkler.
     * @returns {number[][]} An array of `[x, y]` coordinates for all wet locations.
     */
    var identifyWetAreas = function(sprinklerCurrentPos) {
        return calculateDisplacedPositions(sprinklerCurrentPos, sprinklerEffectVectors);
    };

    var memoizationCache; // Cache object to store results of `evaluateSurvivalPossibility` for memoization
    var recursionStack; // Stack to keep track of Phyonkichi's path during recursion (for debugging/tracing)
    var functionCallCounter; // Counter to track the number of times `evaluateSurvivalPossibility` is called

    /**
     * Recursively evaluates if Phyonkichi can survive a sequence of sprinklers.
     * This function uses a depth-first search approach with memoization.
     * IMPORTANT: The original logic implies Phyonkichi "survives" if it can move to a location
     * that *is* wet by the current sprinkler, and then from that wet location, survive the *remaining* sprinklers.
     * This behavior is preserved as per Type II cloning rules, even if it seems counter-intuitive for "survival".
     * @param {number[]} phyonkichiCurrentPos The current `[x, y]` coordinates of Phyonkichi.
     * @param {number[][]} remainingSprinklerPositions An array of `[x, y]` coordinates for the sprinklers yet to be encountered.
     * @returns {boolean} True if Phyonkichi can find a path to "survive" all sprinklers, false otherwise.
     */
    var evaluateSurvivalPossibility = function(phyonkichiCurrentPos, remainingSprinklerPositions) {
        functionCallCounter++; // Increment the counter for each call

        // Create a unique key for the current state (number of sprinklers left, Phyonkichi's position)
        var memoKey = remainingSprinklerPositions.length + ',' + phyonkichiCurrentPos[0] + ',' + phyonkichiCurrentPos[1];
        if (memoKey in memoizationCache) {
            return memoizationCache[memoKey]; // Return cached result if already computed
        }

        recursionStack.push(phyonkichiCurrentPos); // Add current position to the recursion stack

        // Base case: If there are no sprinklers left, Phyonkichi has survived
        if (remainingSprinklerPositions.length <= 0) {
            // console.log('Stack: ' + JSON.stringify(recursionStack)); // Debugging: print the survival path
            recursionStack.splice(recursionStack.length - 1, 1); // Pop from stack before returning
            memoizationCache[memoKey] = true; // Cache the result
            return true;
        }

        var currentSprinklerPos = remainingSprinklerPositions[0]; // Get the first sprinkler in the sequence
        var possibleNextPhyonkichiPositions = determineNextPhyonkichiPositions(phyonkichiCurrentPos); // Get all valid moves for Phyonkichi
        var affectedWetLocations = identifyWetAreas(currentSprinklerPos); // Get all locations made wet by the current sprinkler

        // Iterate through all possible next positions Phyonkichi can move to
        for (var k = 0; k < possibleNextPhyonkichiPositions.length; k++) {
            var nextPhyonkichiPos = possibleNextPhyonkichiPositions[k];

            // Check if this next Phyonkichi position is one of the locations made wet by the current sprinkler
            for (var m = 0; m < affectedWetLocations.length; m++) {
                var singleWetLocation = affectedWetLocations[m];
                if (nextPhyonkichiPos[0] === singleWetLocation[0] &&
                    nextPhyonkichiPos[1] === singleWetLocation[1]) {
                    // If Phyonkichi's next position IS wet by the current sprinkler,
                    // then recursively check if it can survive the *remaining* sprinklers from this (wet) position.
                    var remainingSprinklers = remainingSprinklerPositions.slice(1); // Remove the current sprinkler
                    var canSurviveResult = evaluateSurvivalPossibility(nextPhyonkichiPos, remainingSprinklers);
                    if (canSurviveResult) {
                        recursionStack.splice(recursionStack.length - 1, 1); // Pop from stack before returning
                        memoizationCache[memoKey] = true; // Cache the result
                        return true; // A survival path was found
                    }
                }
            }
        }

        recursionStack.splice(recursionStack.length - 1, 1); // Pop from stack if no survival path found from this state
        memoizationCache[memoKey] = false; // Cache the result as false
        return false; // No survival path found for the current state
    };

    /**
     * Processes a single line of input, parsing it according to the current data type
     * and triggering the survival evaluation when a complete test case is received.
     * @param {string} currentLine The input line string to be processed.
     */
    var processInputLine = function(currentLine) {
        var lineArguments = currentLine.split(' ');
        // Convert all string arguments to floating-point numbers
        for (var idx = 0; idx < lineArguments.length; idx++) {
            lineArguments[idx] = parseFloat(lineArguments[idx]);
        }

        // Determine the type of data this line represents based on the line counter
        var currentDataType = processedLineCounter % Object.keys(inputDataCategories).length;

        if (currentDataType === inputDataCategories.phyonkichiLocation) {
            // This line contains Phyonkichi's starting coordinates
            currentInputData = {}; // Initialize a new object for the current test case
            currentInputData.phyonkichi = {};
            currentInputData.splinklerLocations = [];
            currentInputData.phyonkichi.x = lineArguments[0];
            currentInputData.phyonkichi.y = lineArguments[1];

            // Check for the termination condition (0 0 for Phyonkichi's location)
            if (currentInputData.phyonkichi.x === 0 && currentInputData.phyonkichi.y === 0) {
                // console.log('end'); // Debugging: indicates end of input
                return; // Stop further processing if the end marker is found
            }
        } else if (currentDataType === inputDataCategories.numSprinklers) {
            // This line contains the number of sprinklers (though not directly used in the algorithm, it's part of the input format)
            currentInputData.numSprinklers = lineArguments[0];
        } else if (currentDataType === inputDataCategories.splinklerLocations) {
            // This line contains the coordinates for all sprinklers
            for (var idx = 0; idx < lineArguments.length; idx += 2) {
                currentInputData.splinklerLocations.push([lineArguments[idx], lineArguments[idx + 1]]);
            }

            // console.log(JSON.stringify(currentInputData)); // Debugging: print parsed input

            // Initialize variables for the survival evaluation for this test case
            functionCallCounter = 0;
            memoizationCache = {};
            recursionStack = [];

            // Execute the survival evaluation and output the result
            if (evaluateSurvivalPossibility([currentInputData.phyonkichi.x, currentInputData.phyonkichi.y], currentInputData.splinklerLocations)) {
                APP_UTIL.performOutputLine('OK'); // Phyonkichi can survive
            } else {
                APP_UTIL.performOutputLine('NA'); // Phyonkichi cannot survive
            }
            // console.log('callCount: ' + functionCallCounter); // Debugging: print total recursive calls
        } else {
            // This block is intentionally left empty, as per the original code's structure.
            // It would handle any other unexpected data types if the modulo logic were different.
        }
        processedLineCounter++; // Increment the line counter for the next input line
    };

    // Set up the line reader to feed input lines to our processing function
    APP_UTIL.setupLineProcessor(processInputLine);
};

// Execute the main application logic using the utility function, ensuring proper environment handling
APP_UTIL.executeMainLogic(primaryApplication);
