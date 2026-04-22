'use strict';

// Define a global namespace for application utilities and environment helpers.
const ApplicationUtilities = {};

// Self-executing anonymous function to encapsulate utility definitions
// and avoid polluting the global scope.
((utilityExports) => {
    // Determine if the current execution environment is a web browser.
    // This check relies on the presence of the 'window' and 'document' objects.
    const identifyBrowserEnvironment = () => typeof window !== 'undefined' && typeof document !== 'undefined';

    // Determine if the current execution environment is Node.js.
    // This check relies on the presence of the 'process' global object
    // and its 'versions.node' property, indicating a Node.js runtime.
    const identifyNodeEnvironment = () => typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

    // Expose environment checks through the utility namespace for external use.
    utilityExports.isBrowserEnv = identifyBrowserEnvironment;
    utilityExports.isNodeEnv = identifyNodeEnvironment;

    /**
     * Helper to escape special HTML characters in a given string.
     * This function is crucial for preventing Cross-Site Scripting (XSS) vulnerabilities
     * when dynamic content is inserted into HTML.
     * @param {string} sourceText - The raw string content to be sanitized.
     * @returns {string} The HTML-safe version of the input string.
     */
    const sanitizeHtmlString = (sourceText) => {
        // Ensure the input is always treated as a string to avoid errors.
        return String(sourceText)
            .replace(/&/g, '&amp;')   // Escape ampersands first to prevent double-escaping.
            .replace(/"/g, '&quot;')  // Escape double quotes used in HTML attributes.
            .replace(/'/g, '&#x27;')  // Escape single quotes (apostrophes) for attribute safety.
            .replace(/</g, '&lt;')    // Escape less-than signs to prevent tag injection.
            .replace(/>/g, '&gt;');   // Escape greater-than signs to prevent tag injection.
    };
    utilityExports.getSafeHtmlContent = sanitizeHtmlString;

    /**
     * Function to display the source code of a given JavaScript function within a
     * <pre><code> block in a browser environment.
     * This is useful for demonstrating code or for self-documenting examples.
     * @param {Function} funcRef - A reference to the function whose source code is to be displayed.
     */
    const renderFunctionSource = (funcRef) => {
        if (identifyBrowserEnvironment()) {
            const codeContainer = document.getElementById('code-display-area');
            if (codeContainer) {
                // Wrap the sanitized function source in <pre><code> tags for proper formatting.
                codeContainer.innerHTML = `<pre><code>${sanitizeHtmlString(funcRef.toString())}</code></pre>`;
            } else {
                console.warn("HTML element with ID 'code-display-area' not found for source code display.");
            }
        }
    };
    utilityExports.displayFunctionSource = renderFunctionSource;

    /**
     * Retrieves all input lines from the appropriate source based on the execution environment.
     * In a browser, it reads from a specified DOM element's text content.
     * In Node.js, it reads synchronously from standard input ('/dev/stdin').
     * @returns {string[]} An array of strings, where each string represents an input line.
     */
    const obtainInputLines = () => {
        let collectedLines = []; // Initialize an array to store the processed input lines.

        if (identifyBrowserEnvironment()) {
            const inputElement = document.getElementById('input-data-source');
            if (inputElement) {
                // Retrieve raw text content, split by newline, and trim each resulting line.
                // Using textContent is preferred over innerHTML for raw text input to avoid HTML parsing issues.
                const rawTextContent = inputElement.textContent || '';
                collectedLines = rawTextContent.split('\n').map(line => line.trim());
                // Filter out any empty strings that might result from extra newlines or leading/trailing breaks.
                collectedLines = collectedLines.filter(line => line.length > 0);
            } else {
                console.error("Input data element with ID 'input-data-source' not found in browser environment.");
            }
        } else if (identifyNodeEnvironment()) {
            try {
                // In Node.js, read the entire standard input stream synchronously.
                const fs = require('fs');
                const rawInputBuffer = fs.readFileSync('/dev/stdin', 'utf8');
                // Trim the whole buffer to remove leading/trailing whitespace, then split by newline.
                collectedLines = rawInputBuffer.trim().split('\n');
            } catch (error) {
                console.error("An error occurred while attempting to read from stdin in Node.js:", error);
            }
        }
        return collectedLines;
    };

    /**
     * Sets up a mechanism to process input lines one by one using a provided callback function.
     * In a browser, all lines are processed immediately.
     * In Node.js, it uses the 'readline' module for stream-based, asynchronous processing.
     * @param {Function} processCallback - The callback function to be executed for each input line.
     */
    const configureLineProcessor = (processCallback) => {
        // Essential validation: ensure the callback is a function.
        if (typeof processCallback !== 'function') {
            console.error("A valid callback function is indispensable for line processing; received non-function.");
            return;
        }

        if (identifyBrowserEnvironment()) {
            // For browser environments, retrieve all lines and process them in a simple loop.
            const allInputLines = obtainInputLines();
            for (let lineIdx = 0; lineIdx < allInputLines.length; lineIdx++) {
                processCallback(allInputLines[lineIdx]);
            }
        } else if (identifyNodeEnvironment()) {
            // For Node.js, leverage the 'readline' module for efficient stream processing.
            const readline = require('readline');
            const fs = require('fs');
            const inputStream = fs.createReadStream('/dev/stdin');
            const lineInterface = readline.createInterface({
                input: inputStream,
                output: process.stdout, // Typically, output stream is set to stdout for readline interface.
                terminal: false // Indicate that input is not from a TTY.
            });

            // Attach the provided callback to the 'line' event of the readline interface.
            lineInterface.on('line', (dataLine) => {
                processCallback(dataLine);
            });

            // Optional: Add a 'close' event listener for any finalization logic.
            lineInterface.on('close', () => {
                // console.log("Input stream closed. All lines processed.");
            });
        }
    };
    utilityExports.setupLineReader = configureLineProcessor;

    // Internal buffer to accumulate output lines when running in a browser.
    let browserOutputAccumulator = [];

    /**
     * Renders an array of output lines to the display element in the browser,
     * or logs them to the console in Node.js.
     * @param {string[]} outputContentArray - An array of strings to be displayed as output.
     */
    const displayOutputLines = (outputContentArray) => {
        if (identifyBrowserEnvironment()) {
            const outputElement = document.getElementById('application-output-area');
            if (outputElement) {
                // Map each line to its HTML-escaped version and join them with <br> tags
                // to ensure each line appears on a new line in HTML.
                outputElement.innerHTML = outputContentArray.map(sanitizeHtmlString).join('<br>\n');
            } else {
                console.warn("HTML element with ID 'application-output-area' not found for output display.");
            }
        } else if (identifyNodeEnvironment()) {
            // In Node.js, simply iterate and print each line to the console.
            outputContentArray.forEach(line => console.log(line));
        }
    };
    utilityExports.showAllOutput = displayOutputLines;

    /**
     * Renders a single output line. In the browser, this line is added to an internal
     * buffer, and the entire buffer is then re-rendered. In Node.js, it's logged immediately.
     * @param {string} contentLine - The single string line to be output.
     */
    const displaySingleOutputLine = (contentLine) => {
        if (identifyBrowserEnvironment()) {
            // Add the new line to the buffer and then refresh the entire output display.
            browserOutputAccumulator.push(contentLine);
            displayOutputLines(browserOutputAccumulator);
        } else if (identifyNodeEnvironment()) {
            // In Node.js, direct logging to console is sufficient.
            console.log(contentLine);
        }
    };
    utilityExports.showOutputLine = displaySingleOutputLine;

    /**
     * The main application entry point, responsible for initializing the core logic
     * based on the detected execution environment.
     * @param {Function} mainApplicationFunction - The primary function containing the application's core logic.
     */
    const initializeApp = (mainApplicationFunction) => {
        // Validate that the provided entry point is indeed a callable function.
        if (typeof mainApplicationFunction !== 'function') {
            console.error("The main application function provided for initialization is not a valid callable function.");
            return;
        }

        if (identifyBrowserEnvironment()) {
            // In a browser, defer the execution of the main function until the entire
            // window (including all resources like images) has finished loading.
            window.addEventListener('load', () => {
                renderFunctionSource(mainApplicationFunction); // Display its source code.
                mainApplicationFunction(); // Execute the application's core logic.
            });
        } else if (identifyNodeEnvironment()) {
            // In Node.js, execute the main function immediately as there's no DOM to wait for.
            mainApplicationFunction();
        }
    };
    utilityExports.runApplication = initializeApp;

})(ApplicationUtilities); // Pass the ApplicationUtilities object to the IIFE for population.


// --- Core Application Logic ---

/**
 * This function encapsulates the main problem-solving logic of the application.
 * It defines game parameters, movement rules, and the survival algorithm.
 */
const applicationCoreLogic = () => {
    // Define the boundaries and dimensions of the operational grid.
    const gridStartX = 0; // Minimum X-coordinate.
    const gridStartY = 0; // Minimum Y-coordinate.
    const gridWidth = 10; // Total width, so X goes from 0 to 9.
    const gridHeight = 10; // Total height, so Y goes from 0 to 9.

    // Define the creature's complex movement patterns as an array of [delta_x, delta_y] vectors.
    // Object.freeze ensures that these movement patterns cannot be accidentally modified.
    const creatureMovementVectors = Object.freeze([
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ]);

    // Define the area of effect for a hazard source (e.g., a 3x3 square centered on the source).
    // Object.freeze ensures these patterns are constant.
    const hazardEffectAreaVectors = Object.freeze([
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [0, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ]);

    // An enum-like Map to identify the type of data expected on each input line.
    // This helps in parsing the multi-line input for each test case.
    const inputSegmentIdentifiers = new Map([
        ['creaturePosition', 0],   // First line of a test case: creature's start X, Y.
        ['numHazardSources', 1],   // Second line: number of hazard sources.
        ['hazardLocations', 2]     // Third line: X, Y coordinates for all hazard sources.
    ]);

    // Variables to manage the state of the current input being processed.
    let currentParsedInput = null; // Stores parsed data for the current test case.
    let currentLineIndex = 0;      // Tracks the sequential index of the input line being processed.

    /**
     * Determines if a given coordinate pair (x, y) lies strictly within the defined grid boundaries.
     * @param {number} x - The X-coordinate to check.
     * @param {number} y - The Y-coordinate to check.
     * @returns {boolean} True if the location is within the grid, false otherwise.
     */
    const isCoordinateWithinBounds = (x, y) => {
        // A combined logical AND condition provides a concise bounds check.
        return (x >= gridStartX && x < gridWidth) &&
               (y >= gridStartY && y < gridHeight);
    };

    /**
     * Calculates all potential new locations reachable from a starting position
     * by applying a set of movement vectors. Only valid positions within the grid
     * are included in the result.
     * @param {[number, number]} startPosition - The [x, y] coordinates from which to move.
     * @param {Array<[number, number]>} movementSet - An array of [delta_x, delta_y] vectors.
     * @returns {Array<[number, number]>} An array of valid new [x, y] coordinates.
     */
    const calculateValidNextPositions = (startPosition, movementSet) => {
        const validNextPositions = [];
        // Destructure startPosition for easier access to coordinates.
        const [currentX, currentY] = startPosition;

        // Iterate through each movement vector to calculate potential new positions.
        for (const [deltaX, deltaY] of movementSet) {
            const nextX = currentX + deltaX;
            const nextY = currentY + deltaY;

            // Only add positions that are within the defined grid boundaries.
            if (isCoordinateWithinBounds(nextX, nextY)) {
                validNextPositions.push([nextX, nextY]);
            }
        }
        return validNextPositions;
    };

    /**
     * Retrieves all possible and valid next positions for the creature from its current location.
     * This uses the predefined `creatureMovementVectors`.
     * @param {[number, number]} currentCreaturePosition - The creature's current [x, y] coordinates.
     * @returns {Array<[number, number]>} An array of valid next [x, y] coordinates for the creature.
     */
    const getNextCreatureMovementOptions = (currentCreaturePosition) => {
        return calculateValidNextPositions(currentCreaturePosition, creatureMovementVectors);
    };

    /**
     * Determines all grid spots that are affected by a specific hazard emitter.
     * This uses the predefined `hazardEffectAreaVectors`.
     * @param {[number, number]} hazardEmitterPosition - The [x, y] coordinates of the hazard source.
     * @returns {Array<[number, number]>} An array of [x, y] coordinates that are affected by the hazard.
     */
    const getHazardAffectedSpots = (hazardEmitterPosition) => {
        return calculateValidNextPositions(hazardEmitterPosition, hazardEffectAreaVectors);
    };

    // Variables for the recursive survival check function, including memoization and path tracking.
    let memoizationCache = new Map(); // Stores results of previously computed subproblems (dynamic programming).
    let currentPathTrace = [];        // Keeps track of the creature's path during a specific recursive exploration.
    let recursionDepthCounter = 0;    // A simple counter for diagnostic purposes to track call depth/frequency.

    /**
     * Converts a coordinate pair into a unique string key suitable for Map/Object keys.
     * @param {[number, number]} coords - The [x, y] coordinates.
     * @returns {string} A string representation, e.g., "5,3".
     */
    const coordsToKey = (coords) => `${coords[0]},${coords[1]}`;

    /**
     * Checks if a specific target coordinate pair exists within an array of coordinate pairs.
     * This is a utility for comparing locations.
     * @param {Array<[number, number]>} coordArray - An array of [x, y] pairs.
     * @param {[number, number]} targetCoord - The [x, y] pair to search for.
     * @returns {boolean} True if `targetCoord` is found in `coordArray`, false otherwise.
     */
    const containsCoordinate = (coordArray, targetCoord) => {
        // Use `Array.prototype.some` for efficient iteration and early exit.
        return coordArray.some(coord => coord[0] === targetCoord[0] && coord[1] === targetCoord[1]);
    };

    /**
     * Recursive function to determine if the creature can "survive" a sequence of hazards.
     * The problem's specific definition of survival: the creature must find a sequence of moves
     * such that each move lands it in a spot affected by the *current* hazard, and it can then
     * continue this pattern for all subsequent hazards.
     * This is a pathfinding problem with a unique constraint.
     *
     * @param {[number, number]} creatureCurrentPos - The creature's current [x, y] position.
     * @param {Array<[number, number]>} remainingHazardSources - An array of hazard emitter [x, y] positions yet to be encountered.
     * @returns {boolean} True if such a survival path exists, false otherwise.
     */
    const checkCreatureSurvival = (creatureCurrentPos, remainingHazardSources) => {
        recursionDepthCounter++; // Increment the counter for each call, useful for performance analysis.

        // Construct a unique cache key based on the current creature position and the number of remaining hazards.
        const cacheKey = `${remainingHazardSources.length}_${coordsToKey(creatureCurrentPos)}`;

        // Memoization: If this state has been computed before, return the cached result immediately.
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        // Add the current position to the path tracker to reconstruct the path if needed.
        currentPathTrace.push(creatureCurrentPos);

        // Base case: If there are no hazard sources left, the creature has successfully "survived".
        if (remainingHazardSources.length === 0) {
            currentPathTrace.pop(); // Remove the current position as we backtrack from a successful path.
            memoizationCache.set(cacheKey, true); // Cache the positive result.
            return true;
        }

        // Extract the first hazard emitter from the list for the current step.
        const currentHazardEmitter = remainingHazardSources[0];
        // Determine all locations that this specific hazard makes "wet".
        const affectedSpotsByCurrentHazard = getHazardAffectedSpots(currentHazardEmitter);
        // Calculate all legal moves the creature can make from its current position.
        const possibleCreatureMoves = getNextCreatureMovementOptions(creatureCurrentPos);

        let canFindSurvivalPath = false; // Initialize to false; assume no path found until proven otherwise.

        // Iterate through each possible move the creature could make.
        for (const nextCreatureSpot of possibleCreatureMoves) {
            // Crucial problem logic: Check if the creature's *next* position is one of the *wet* spots
            // caused by the *current* hazard. If it is, this path is considered for "survival".
            if (containsCoordinate(affectedSpotsByCurrentHazard, nextCreatureSpot)) {
                // If the creature can move into an affected spot, recursively check if it can
                // survive the *remaining* hazards from this new (affected) position.
                const nextRemainingHazards = remainingHazardSources.slice(1); // Create a new array without the current hazard.
                if (checkCreatureSurvival(nextCreatureSpot, nextRemainingHazards)) {
                    canFindSurvivalPath = true; // A valid survival path has been found.
                    break; // Optimization: If one path works, no need to check others for this state.
                }
            }
        }

        currentPathTrace.pop(); // Backtrack: remove the current position as we exit this recursion level.
        memoizationCache.set(cacheKey, canFindSurvivalPath); // Store the computed result in the cache.
        return canFindSurvivalPath;
    };

    /**
     * Processes a single line of input, parsing the data and managing the state
     * for each test case. It acts as a state machine based on `currentLineIndex`.
     * @param {string} inputLine - The raw string content of the current input line.
     */
    const processInputLine = (inputLine) => {
        // Split the line by spaces and convert each part to a number.
        // Filter out any NaN values that might result from extra spaces or non-numeric data.
        const lineNumericArgs = inputLine.split(' ').map(Number).filter(num => !isNaN(num));

        // Determine which type of data this line represents based on its position in the sequence.
        const segmentTypeIdentifier = currentLineIndex % inputSegmentIdentifiers.size;

        // Use a switch statement for clear handling of different input line types.
        switch (segmentTypeIdentifier) {
            case inputSegmentIdentifiers.get('creaturePosition'):
                // This line defines the creature's starting X and Y coordinates.
                // Initialize the `currentParsedInput` structure for a new test case.
                currentParsedInput = {
                    creatureDetails: { x: lineNumericArgs[0], y: lineNumericArgs[1] },
                    hazardLocations: [] // Prepare an empty array to collect hazard positions.
                };

                // Sentinel value check: if creature starts at (0,0), it's typically an end-of-input signal.
                // The original code processed it as a normal case; we maintain that behavior.
                if (currentParsedInput.creatureDetails.x === 0 && currentParsedInput.creatureDetails.y === 0) {
                    // This specific (0,0) input is treated as a regular test case in the original logic,
                    // meaning it will go through the `checkCreatureSurvival` and output 'PERISHED'.
                    // If it were meant to terminate, specific `process.exit()` or `return` logic would be here.
                }
                break;

            case inputSegmentIdentifiers.get('numHazardSources'):
                // This line specifies the total number of hazard sources for the current test case.
                // While stored, its primary use is implicit in the next line's parsing.
                currentParsedInput.numberOfHazards = lineNumericArgs[0];
                break;

            case inputSegmentIdentifiers.get('hazardLocations'):
                // This line provides the X, Y coordinates for all hazard sources.
                // Iterate through the numeric arguments, taking two at a time to form coordinate pairs.
                for (let i = 0; i < lineNumericArgs.length; i += 2) {
                    // Ensure a complete pair of coordinates is available before pushing.
                    if (i + 1 < lineNumericArgs.length) {
                        currentParsedInput.hazardLocations.push([lineNumericArgs[i], lineNumericArgs[i + 1]]);
                    } else {
                        console.warn(`Warning: Incomplete coordinate pair found for hazard locations at index ${i}.`);
                    }
                }

                // After parsing all data for a test case, initiate the survival check.
                recursionDepthCounter = 0;   // Reset the recursion counter for the new test case.
                memoizationCache.clear();    // Clear the cache to prevent interference from previous test cases.
                currentPathTrace = [];       // Reset the path tracker.

                const creatureStartingPosition = [currentParsedInput.creatureDetails.x, currentParsedInput.creatureDetails.y];
                const allHazardEmitters = currentParsedInput.hazardLocations;

                // Execute the core survival algorithm and output the result.
                if (checkCreatureSurvival(creatureStartingPosition, allHazardEmitters)) {
                    ApplicationUtilities.showOutputLine('SURVIVED'); // Custom output string for success.
                } else {
                    ApplicationUtilities.showOutputLine('PERISHED'); // Custom output string for failure.
                }
                // console.log(`Debug: Total recursive calls for this case: ${recursionDepthCounter}`);
                break;

            default:
                // Log a warning if an unexpected line type is encountered, indicating potential input format issues.
                console.warn(`Warning: Unrecognized input segment type encountered at line index ${currentLineIndex}.`);
                break;
        }

        currentLineIndex++; // Advance the line counter for the next input line.
    };

    // Register the `processInputLine` function with the utility's line reader to begin processing.
    ApplicationUtilities.setupLineReader(processInputLine);
};

// Initialize the application by passing the `applicationCoreLogic` function
// to the utility's main entry point.
ApplicationUtilities.runApplication(applicationCoreLogic);