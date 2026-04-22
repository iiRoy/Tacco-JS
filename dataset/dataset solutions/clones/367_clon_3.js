'use strict';
// Global namespace for application-wide utilities and environment detection.
const ApplicationRuntime = {};

(function(runtimeEnv) {
    // Determines if the current execution environment is a web browser.
    const checkClientSide = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
    runtimeEnv.isBrowserContext = checkClientSide; // Exported for external access

    // Determines if the current execution environment is Node.js.
    const checkServerSide = () => !checkClientSide();
    runtimeEnv.isNodejsContext = checkServerSide; // Exported for external access

    // Conditional utilities available only in a browser context.
    if (checkClientSide()) {
        /**
         * Safely encodes a string for HTML display, converting special characters to entities.
         * @param {string | number} rawContent - The string or number to be HTML-encoded.
         * @returns {string} The HTML-encoded string. Returns an empty string for invalid input.
         */
        const safeEncodeMarkup = (rawContent) => {
            if (typeof rawContent !== 'string' && typeof rawContent !== 'number') {
                console.warn('safeEncodeMarkup received non-string/non-number input, returning empty string.');
                return '';
            }
            return String(rawContent)
                .replace(/&/g, '&amp;')
                .replace(/\"/g, '&quot;')
                .replace(/\'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        runtimeEnv.encodeHtml = safeEncodeMarkup;

        /**
         * Renders the source code of a given function into a designated HTML element.
         * The target element must have the ID 'code'.
         * @param {Function} funcReference - The function whose source code is to be displayed.
         */
        const renderSourceCode = (funcReference) => {
            const codeContainer = document.getElementById('code');
            if (codeContainer) {
                codeContainer.innerHTML = `<pre><code>${safeEncodeMarkup(funcReference.toString())}</code></pre>`;
            } else {
                console.warn("HTML element with ID 'code' not found. Cannot display source code.");
            }
        };
        runtimeEnv.displayCodeSnippet = renderSourceCode;
    }

    /**
     * Retrieves all input lines from the appropriate source (DOM in browser, stdin in Node.js).
     * @returns {string[]} An array of processed input lines.
     */
    const fetchInputContent = () => {
        let collectedLines = [];
        if (checkClientSide()) {
            const inputElement = document.getElementById('input');
            if (!inputElement) {
                console.error("HTML element with ID 'input' not found. Cannot retrieve input.");
                return collectedLines;
            }
            const rawHtmlContent = inputElement.innerHTML;
            collectedLines = rawHtmlContent.split('<br>').map(line => line.trim());
        } else if (checkServerSide()) {
            try {
                // Ensure 'fs' module is available before attempting to use it.
                if (typeof require === 'function' && require.resolve && require.resolve('fs')) {
                    const fs = require('fs');
                    const standardInputPath = '/dev/stdin';
                    collectedLines = fs.readFileSync(standardInputPath, 'utf8').trim().split('\n');
                } else {
                    console.error("Node.js 'fs' module not available or cannot be resolved for input.");
                }
            } catch (error) {
                console.error("Failed to read from /dev/stdin in Node.js:", error);
            }
        }
        return collectedLines;
    };

    /**
     * Sets up a mechanism to process input lines one by one, invoking a callback for each.
     * @param {Function} lineProcessingCallback - The function to call with each input line string.
     */
    const setupLineIterator = (lineProcessingCallback) => {
        if (checkClientSide()) {
            const allInputLines = fetchInputContent();
            allInputLines.forEach(line => lineProcessingCallback(line));
        } else if (checkServerSide()) {
            try {
                // Ensure 'fs' and 'readline' modules are available.
                if (typeof require === 'function' && require.resolve && require.resolve('fs') && require.resolve('readline')) {
                    const fs = require('fs');
                    const readline = require('readline');
                    const fileReadStream = fs.createReadStream('/dev/stdin');
                    const streamProcessor = readline.createInterface({
                        input: fileReadStream,
                        output: process.stdout // Output stream is optional for input processing
                    });

                    streamProcessor.on('line', (inputLine) => {
                        lineProcessingCallback(inputLine);
                    });
                    streamProcessor.on('close', () => {
                        // All lines from the stream have been processed.
                    });
                } else {
                    console.error("Node.js 'fs' or 'readline' modules not available or cannot be resolved for line-by-line input.");
                }
            } catch (error) {
                console.error("Error setting up Node.js line reader:", error);
            }
        }
    };
    runtimeEnv.configureInputReader = setupLineIterator;

    // Internal buffer to accumulate output lines in browser environments.
    const outputLineBuffer = [];

    /**
     * Renders a collection of output strings to the appropriate display medium.
     * @param {string[]} resultStrings - An array of strings to be displayed as output.
     */
    const renderResultArray = (resultStrings) => {
        if (checkClientSide()) {
            const outputElement = document.getElementById('output');
            if (outputElement) {
                const encoder = runtimeEnv.encodeHtml || ((s) => s); // Fallback if HTML encoding isn't available
                outputElement.innerHTML = resultStrings.map(encoder).join('<br>\n');
                outputLineBuffer.length = 0; // Clear buffer after bulk output
            } else {
                console.warn("HTML element with ID 'output' not found for bulk output.");
            }
        } else if (checkServerSide()) {
            resultStrings.forEach(line => console.log(line));
        }
    };
    runtimeEnv.outputResults = renderResultArray;

    /**
     * Appends a single line to the output. In a browser, this updates the display immediately.
     * @param {string} newOutputEntry - The string to append to the output.
     */
    const printLineToOutput = (newOutputEntry) => {
        if (checkClientSide()) {
            outputLineBuffer.push(newOutputEntry);
            const outputElement = document.getElementById('output');
            if (outputElement) {
                const encoder = runtimeEnv.encodeHtml || ((s) => s);
                outputElement.innerHTML = outputLineBuffer.map(encoder).join('<br>\n');
            } else {
                console.warn("HTML element with ID 'output' not found for single line output.");
            }
        } else if (checkServerSide()) {
            console.log(newOutputEntry);
        }
    };
    runtimeEnv.appendOutputLine = printLineToOutput;

    /**
     * Orchestrates the execution of the primary application logic, handling environment-specific setups.
     * @param {Function} primaryAlgorithm - The main function containing the problem's solution logic.
     */
    const orchestrateMainExecution = (primaryAlgorithm) => {
        if (checkClientSide()) {
            window.onload = () => {
                if (runtimeEnv.displayCodeSnippet) {
                    runtimeEnv.displayCodeSnippet(primaryAlgorithm); // Display code before running
                }
                primaryAlgorithm();
            };
        } else if (checkServerSide()) {
            primaryAlgorithm(); // Execute immediately in Node.js
        }
    };
    runtimeEnv.runApplication = orchestrateMainExecution;

})(ApplicationRuntime); // Pass the namespace object for population

// --- Main Program Logic Starts Here ---

/**
 * Parses a string of space-separated numbers into an array of floats.
 * Utilizes the `Number` constructor for type conversion, which handles both integers and floats.
 * @param {string} lineStr - The input string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumbersFromString = (lineStr) => lineStr.split(' ').map(Number);

/**
 * The core application logic that solves the problem.
 * This function encapsulates the game state, movement rules, and survival algorithm.
 */
const solutionLogic = function() {
    // Configuration object for the game board boundaries.
    const gameBoardConfig = {
        minX: 0,
        minY: 0,
        maxX: 10, // Exclusive upper bound for X-coordinate
        maxY: 10  // Exclusive upper bound for Y-coordinate
    };

    // Defines the possible relative movements for the creature (e.g., a chess knight's moves).
    const creaturePathOffsets = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];

    // Defines the relative coordinates representing the area covered by a single sprayer (3x3 grid).
    const sprayerEffectArea = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];

    // An immutable object acting as an enum for identifying different types of input data.
    const InputDataIdentifiers = Object.freeze({
        CREATURE_START_POS: 0,
        NUMBER_OF_SPRAYERS: 1,
        SPRAYER_LOCATIONS_LIST: 2
    });

    // Object to store all parsed input data for the current test case.
    const applicationInput = {
        creature: { x: 0, y: 0 },
        numSprayers: 0,
        sprayerPositions: []
    };

    let currentInputLineIndex = 0; // Tracks the current line number to determine data type.

    /**
     * Checks if a given coordinate pair (x, y) falls within the defined game board boundaries.
     * @param {number} xCoord - The X-coordinate to check.
     * @param {number} yCoord - The Y-coordinate to check.
     * @returns {boolean} True if the coordinate is within bounds, false otherwise.
     */
    const isWithinBounds = (xCoord, yCoord) =>
        xCoord >= gameBoardConfig.minX && xCoord < gameBoardConfig.maxX &&
        yCoord >= gameBoardConfig.minY && yCoord < gameBoardConfig.maxY;

    /**
     * Calculates all valid new positions reachable from a starting point given a set of movement vectors.
     * Filters out any positions that fall outside the game board boundaries.
     * @param {number[]} startLocation - The [x, y] coordinates of the starting position.
     * @param {number[][]} movementVectors - An array of [deltaX, deltaY] offsets.
     * @returns {number[][]} An array of valid [x, y] coordinates that can be reached.
     */
    const determinePotentialPositions = (startLocation, movementVectors) => {
        const [currentX, currentY] = startLocation;
        const reachableCells = [];

        for (const [deltaX, deltaY] of movementVectors) {
            const nextX = currentX + deltaX;
            const nextY = currentY + deltaY;
            if (isWithinBounds(nextX, nextY)) {
                reachableCells.push([nextX, nextY]);
            }
        }
        return reachableCells;
    };

    /**
     * Determines the next possible positions for the creature based on its predefined movement pattern.
     * @param {number[]} creatureCurrentPosition - The [x, y] coordinates of the creature.
     * @returns {number[][]} An array of valid [x, y] locations the creature can move to.
     */
    const findNextCreatureSpots = (creatureCurrentPosition) =>
        determinePotentialPositions(creatureCurrentPosition, creaturePathOffsets);

    /**
     * Identifies all grid cells that are affected (wet) by a single sprayer.
     * @param {number[]} sprayerCenterLocation - The [x, y] coordinates of the sprayer's center.
     * @returns {number[][]} An array of [x, y] locations covered by the sprayer.
     */
    const identifySoakedAreas = (sprayerCenterLocation) =>
        determinePotentialPositions(sprayerCenterLocation, sprayerEffectArea);

    // A Map used for memoization (dynamic programming cache) to store results of `checkSurvivalPossibility`.
    const survivalMemo = new Map();

    /**
     * Generates a unique string key for the memoization cache based on the creature's position
     * and the count of remaining sprinklers.
     * @param {number[]} creaturePos - The [x, y] coordinates of the creature.
     * @param {number[][]} remainingSprayers - The array of remaining sprayer locations.
     * @returns {string} A unique key for the cache.
     */
    const generateCacheKey = (creaturePos, remainingSprayers) =>
        `${creaturePos[0]},${creaturePos[1]}|${remainingSprayers.length}`;

    /**
     * Recursively checks if the creature can survive a sequence of sprinklers by finding a dry path.
     * This function uses memoization to optimize performance.
     * @param {number[]} currentCreaturePosition - The creature's current [x, y] position.
     * @param {number[][]} remainingSprayerPositions - An array of [x, y] locations of sprinklers yet to activate.
     * @returns {boolean} True if the creature can survive, false otherwise.
     */
    const checkSurvivalPossibility = (currentCreaturePosition, remainingSprayerPositions) => {
        const memoKey = generateCacheKey(currentCreaturePosition, remainingSprayerPositions);
        if (survivalMemo.has(memoKey)) {
            return survivalMemo.get(memoKey); // Return cached result if available
        }

        // Base case: If there are no more sprinklers, the creature has successfully survived.
        if (remainingSprayerPositions.length === 0) {
            survivalMemo.set(memoKey, true);
            return true;
        }

        // Consider the first sprayer in the remaining sequence.
        const activeSprayerLocation = remainingSprayerPositions[0];
        // Create a new array for subsequent recursive calls, excluding the current active sprayer.
        const subsequentSprayers = remainingSprayerPositions.slice(1);

        // Determine all possible next moves for the creature.
        const possibleNextCreaturePositions = findNextCreatureSpots(currentCreaturePosition);
        // Identify all grid cells that will be affected by the current active sprayer.
        const affectedLocations = identifySoakedAreas(activeSprayerLocation);

        // Iterate through each potential next position for the creature.
        for (const potentialCreatureSpot of possibleNextCreaturePositions) {
            let isSpotWet = false;
            // Check if this potential spot is covered by the current sprayer.
            for (const singleAffectedSpot of affectedLocations) {
                if (potentialCreatureSpot[0] === singleAffectedSpot[0] &&
                    potentialCreatureSpot[1] === singleAffectedSpot[1]) {
                    isSpotWet = true;
                    break; // This spot is wet, no need to check further wet areas.
                }
            }

            // If the potential spot is NOT wet, the creature can try to move there.
            if (!isSpotWet) {
                // Recursively check if survival is possible from this new dry spot
                // considering the *remaining* sprinklers.
                if (checkSurvivalPossibility(potentialCreatureSpot, subsequentSprayers)) {
                    survivalMemo.set(memoKey, true); // If any path leads to survival, memoize and return true.
                    return true;
                }
            }
        }

        // If no path from the current position leads to survival, memoize and return false.
        survivalMemo.set(memoKey, false);
        return false;
    };

    /**
     * Processes a single input line, parsing its contents based on the expected data type
     * determined by the current line index.
     * @param {string} inputLineString - The raw string read from input.
     */
    const processInputLine = (inputLineString) => {
        const lineArguments = parseNumbersFromString(inputLineString);

        // Use modulo operator to cycle through input data types for each test case.
        const currentDataType = currentInputLineIndex % Object.keys(InputDataIdentifiers).length;

        switch (currentDataType) {
            case InputDataIdentifiers.CREATURE_START_POS:
                applicationInput.creature.x = lineArguments[0];
                applicationInput.creature.y = lineArguments[1];
                // A common problem pattern: (0,0) as creature position might signal the end of input.
                // For this problem, we assume it's just another valid starting position.
                break;
            case InputDataIdentifiers.NUMBER_OF_SPRAYERS:
                applicationInput.numSprayers = lineArguments[0];
                // Reset sprayer positions for the new test case.
                applicationInput.sprayerPositions = [];
                break;
            case InputDataIdentifiers.SPRAYER_LOCATIONS_LIST:
                // Parse all sprayer locations from this line, which typically contains multiple pairs.
                for (let idx = 0; idx < lineArguments.length; idx += 2) {
                    applicationInput.sprayerPositions.push([lineArguments[idx], lineArguments[idx + 1]]);
                }

                // --- Execute the survival check for the current test case ---
                survivalMemo.clear(); // Clear the cache for every new test case.
                const initialCreaturePosition = [applicationInput.creature.x, applicationInput.creature.y];

                if (checkSurvivalPossibility(initialCreaturePosition, applicationInput.sprayerPositions)) {
                    ApplicationRuntime.appendOutputLine('OK');
                } else {
                    ApplicationRuntime.appendOutputLine('NA');
                }
                break;
            default:
                console.warn(`Unrecognized data type identifier (${currentDataType}) encountered for line: "${inputLineString}"`);
                break;
        }
        currentInputLineIndex++;
    };

    // Configure the application runtime to read input lines and pass them to our processing function.
    ApplicationRuntime.configureInputReader(processInputLine);
};

// Register the main solution logic function with the application runtime for execution.
ApplicationRuntime.runApplication(solutionLogic);