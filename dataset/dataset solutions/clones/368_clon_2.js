'use strict';
let AppUtils = {};
(function (utilityNamespace) {
    // Function to determine if the current environment is a web browser.
    const checkBrowserEnvironment = function () {
        return typeof window !== 'undefined';
    };
    utilityNamespace.checkBrowserEnvironment = checkBrowserEnvironment;

    // Function to determine if the current environment is Node.js.
    const checkNodeEnvironment = function () {
        return !checkBrowserEnvironment();
    };
    utilityNamespace.checkNodeEnvironment = checkNodeEnvironment;

    if (checkBrowserEnvironment()) {
        /*
         * Encodes a string for safe HTML display by replacing special characters.
         */
        const encodeHtmlContent = function (inputString) {
            return String(inputString)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        utilityNamespace.encodeHtmlContent = encodeHtmlContent;

        // Displays a given function's source code within a pre/code block on the HTML page.
        const displayCodeSnippet = function (targetFunction) {
            document.getElementById('code').innerHTML = '<pre><code>' + encodeHtmlContent(targetFunction) + '</code></pre>';
        };
        utilityNamespace.displayCodeSnippet = displayCodeSnippet;
    }

    /*
     * Retrieves input lines from either HTML (browser) or stdin (Node.js).
     */
    const retrieveInputLines = function () {
        let rawLines = [];
        if (checkBrowserEnvironment()) {
            const documentContent = document.getElementById('input').innerHTML;
            rawLines = documentContent.split('<br>');
            for (let idx = 0; idx < rawLines.length; idx++) {
                rawLines[idx] = rawLines[idx].trim();
            }
        }
        if (checkNodeEnvironment()) {
            rawLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
        }
        return rawLines;
    };
    utilityNamespace.retrieveInputLines = retrieveInputLines;

    /**
     * Configures a line-by-line processor for input.
     * In browser, it processes all lines at once. In Node.js, it sets up a readline interface.
     * @param {Function} processCallback - The callback function to execute for each line.
     */
    const configureLineProcessor = function (processCallback) {
        if (checkBrowserEnvironment()) {
            const inputDataLines = retrieveInputLines();
            for (let idx = 0; idx < inputDataLines.length; idx++) {
                processCallback(inputDataLines[idx]);
            }
        }
        if (checkNodeEnvironment()) {
            const fileStream = require('fs').ReadStream('/dev/stdin');
            const lineReaderService = require('readline').createInterface({'input': fileStream, 'output': {}});
            lineReaderService.on('line', function (currentLine) {
                processCallback(currentLine);
            });
        }
    };
    utilityNamespace.configureLineProcessor = configureLineProcessor;

    // Handles displaying a collection of output lines.
    const performOutput = function (resultLines) {
        if (checkBrowserEnvironment()) {
            document.getElementById('output').innerHTML = resultLines.map(encodeHtmlContent).join('<br>\n');
        }
        if (checkNodeEnvironment()) {
            for (let lineIndex = 0; lineIndex < resultLines.length; lineIndex++) {
                console.log(resultLines[lineIndex]);
            }
        }
    };
    utilityNamespace.performOutput = performOutput;

    let bufferedOutputResults = []; // Stores lines for browser output
    /**
     * Processes and displays a single line of output.
     * Appends to a buffer in browser, logs directly in Node.js.
     */
    const performOutputLine = function (singleOutputEntry) {
        if (checkBrowserEnvironment()) {
            bufferedOutputResults.push(singleOutputEntry);
            document.getElementById('output').innerHTML = bufferedOutputResults.map(encodeHtmlContent).join('<br>\n');
        }
        if (checkNodeEnvironment()) {
            console.log(singleOutputEntry);
        }
    };
    utilityNamespace.performOutputLine = performOutputLine;

    // Orchestrates the main program execution, handling browser onload or direct Node.js execution.
    const executeMainLogic = function (mainProgram) {
        if (checkBrowserEnvironment()) {
            window.onload = function () {
                displayCodeSnippet(mainProgram);
                mainProgram();
            };
        }
        if (checkNodeEnvironment()) {
            mainProgram();
        }
    };
    utilityNamespace.executeMainLogic = executeMainLogic;
})(AppUtils);

// The primary entry point for the application's core logic.
const applicationEntry = function () {
    const gridStartX = 0;
    const gridStartY = 0;
    const gridWidthLimit = 10;
    const gridHeightLimit = 10;
    const creatureMovementVectors = [
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

    /**
     * Checks if a given coordinate pair falls within the defined grid boundaries.
     * @param {number} coordX - The X coordinate.
     * @param {number} coordY - The Y coordinate.
     * @returns {boolean} True if within bounds, false otherwise.
     */
    const isCoordinateWithinBounds = function (coordX, coordY) {
        if (gridStartX <= coordX && coordX < gridWidthLimit) {
            if (gridStartY <= coordY && coordY < gridHeightLimit) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /**
     * Calculates all possible new positions from a starting point given a set of movement vectors.
     * Filters out positions that are outside the grid boundaries.
     * @param {Array<number>} currentPosition - The [x, y] starting coordinates.
     * @param {Array<Array<number>>} movementSchema - An array of [dx, dy] movement vectors.
     * @returns {Array<Array<number>>} An array of valid new [x, y] positions.
     */
    const calculateDisplacedPositions = function (currentPosition, movementSchema) {
        let displacedPositions = [];
        for (let moveIdx = 0; moveIdx < movementSchema.length; moveIdx++) {
            const singleMove = movementSchema[moveIdx];
            const newX = currentPosition[0] + singleMove[0];
            const newY = currentPosition[1] + singleMove[1];
            if (isCoordinateWithinBounds(newX, newY)) {
                displacedPositions.push([newX, newY]);
            }
        }
        return displacedPositions;
    };

    // Determines the next possible locations for the creature based on its movement rules.
    const determineNextCreaturePositions = function (creatureCurrentPosition) {
        return calculateDisplacedPositions(creatureCurrentPosition, creatureMovementVectors);
    };

    // Identifies all grid cells that would be affected by a sprinkler at a given location.
    const identifyAffectedAreas = function (sprinklerCurrentPosition) {
        return calculateDisplacedPositions(sprinklerCurrentPosition, sprinklerEffectVectors);
    };

    let memoizationStore; // Cache for storing results of `checkSurvivalPossibility`
    let pathStack;        // Stack to keep track of the creature's path
    let recursionDepthCounter; // Counter for recursive calls

    /**
     * Recursively checks if the creature can survive all active sprinklers.
     * Uses memoization to optimize repeated calculations.
     * @param {Array<number>} currentCreaturePos - The creature's current [x, y] position.
     * @param {Array<Array<number>>} activeSprinklers - An array of remaining sprinkler [x, y] locations.
     * @returns {boolean} True if the creature can survive, false otherwise.
     */
    const checkSurvivalPossibility = function (currentCreaturePos, activeSprinklers) {
        recursionDepthCounter++;
        const memoKey = activeSprinklers.length + ',' + currentCreaturePos[0] + ',' + currentCreaturePos[1];
        if (memoKey in memoizationStore) {
            return memoizationStore[memoKey];
        }

        pathStack.push(currentCreaturePos);

        if (activeSprinklers.length <= 0) {
            // No more sprinklers, creature survives
            return true;
        }

        const currentSprinkler = activeSprinklers[0];
        const potentialCreatureMoves = determineNextCreaturePositions(currentCreaturePos);
        const impactedZones = identifyAffectedAreas(currentSprinkler);

        for (let creatureMoveIdx = 0; creatureMoveIdx < potentialCreatureMoves.length; creatureMoveIdx++) {
            const nextCreaturePos = potentialCreatureMoves[creatureMoveIdx];
            for (let wetZoneIdx = 0; wetZoneIdx < impactedZones.length; wetZoneIdx++) {
                const currentWetZone = impactedZones[wetZoneIdx];
                if (nextCreaturePos[0] === currentWetZone[0] &&
                    nextCreaturePos[1] === currentWetZone[1]) {
                    const remainingSprinklers = activeSprinklers.slice(1);
                    const canContinue = checkSurvivalPossibility(nextCreaturePos, remainingSprinklers);
                    if (canContinue) {
                        return true;
                    }
                }
            }
        }

        pathStack.splice(pathStack.length - 1, 1); // Backtrack
        memoizationStore[memoKey] = false;
        return false;
    };

    const inputDataStructure = {};
    inputDataStructure.creatureInitialPosition = 0;
    inputDataStructure.sprinklerCount = 1;
    inputDataStructure.sprinklerCoordinates = 2;

    let parsedInputData;
    let processedLineIndex = 0;

    /**
     * Processes a single input line, parsing it based on its sequential type.
     * @param {string} incomingLine - The raw input line string.
     */
    const processInputLine = function (incomingLine) {
        const lineTokens = incomingLine.split(' ');
        for (let tokenIndex = 0; tokenIndex < lineTokens.length; tokenIndex++) {
            lineTokens[tokenIndex] = parseFloat(lineTokens[tokenIndex]);
        }

        const currentDataType = processedLineIndex % Object.keys(inputDataStructure).length;

        if (currentDataType === inputDataStructure.creatureInitialPosition) {
            parsedInputData = {};
            parsedInputData.creature = {};
            parsedInputData.sprinklerLocations = [];
            parsedInputData.creature.coordinateX = lineTokens[0];
            parsedInputData.creature.coordinateY = lineTokens[1];
            // Condition to check for termination (0 0 input)
            if (parsedInputData.creature.coordinateX === 0 && parsedInputData.creature.coordinateY === 0) {
                // console.log('End of input detected.');
            }
        } else if (currentDataType === inputDataStructure.sprinklerCount) {
            parsedInputData.numSprinklers = lineTokens[0];
        } else if (currentDataType === inputDataStructure.sprinklerCoordinates) {
            for (let tokenIndex = 0; tokenIndex < lineTokens.length; tokenIndex += 2) {
                parsedInputData.sprinklerLocations.push([lineTokens[tokenIndex], lineTokens[tokenIndex + 1]]);
            }
            // console.log('Processing input: ' + JSON.stringify(parsedInputData));
            recursionDepthCounter = 0;
            memoizationStore = {};
            pathStack = [];
            if (checkSurvivalPossibility([parsedInputData.creature.coordinateX, parsedInputData.creature.coordinateY], parsedInputData.sprinklerLocations)) {
                AppUtils.performOutputLine('OK');
            } else {
                AppUtils.performOutputLine('NA');
            }
            // console.log('Total recursive calls: ' + recursionDepthCounter);
        } else {
            // Handle unknown data type or simply ignore
        }
        processedLineIndex++;
    };
    AppUtils.configureLineProcessor(processInputLine);
};

// Execute the main application logic through the utility namespace.
AppUtils.executeMainLogic(applicationEntry);